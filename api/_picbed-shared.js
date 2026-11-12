/* 图床门面（/picbed/）两个接口的共用件：口令闸门 + R2 的 S3 签名请求。
 * 本仓部署在 Vercel、没有主站那样的 R2 绑定，改走 S3 兼容接口，凭据全在
 * Vercel 环境变量里（不落仓库）：R2_ACCOUNT_ID / R2_ACCESS_KEY_ID /
 * R2_SECRET_ACCESS_KEY / R2_BUCKET / R2_PUBLIC_BASE / PICBED_PASS_HASH。
 * 闸门口径与主站一致：口令只存 SHA-256 哈希；哈希为空 = 图床关闭，一律
 * 403（fail-closed）。图片本身走公开域名可直链，口令只挡「翻图库 + 上传」。 */

const ALLOWED_HOSTS = new Set(["idea.lanerc.me", "localhost", "127.0.0.1"]);

export function json(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

/* 只放行本站页面发起的调用，防接口被外站白嫖（口令闸门之外的一层） */
export function isAllowedRequest(request) {
	const value =
		request.headers.get("origin") || request.headers.get("referer");
	if (!value) return false;
	try {
		return ALLOWED_HOSTS.has(new URL(value).hostname);
	} catch {
		return false;
	}
}

const enc = new TextEncoder();

async function sha256Hex(data) {
	const buf = await crypto.subtle.digest("SHA-256", data);
	return [...new Uint8Array(buf)]
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

/* 口令校验：通过返回 null，否则返回 { status, error } */
export async function checkGate(password) {
	const hash = process.env.PICBED_PASS_HASH || "";
	if (!hash) {
		return { status: 403, error: "图床未开启（还没设访问口令）" };
	}
	if (!password || (await sha256Hex(enc.encode(password))) !== hash) {
		return { status: 401, error: "口令不对" };
	}
	return null;
}

export function r2Config() {
	const cfg = {
		accountId: process.env.R2_ACCOUNT_ID || "",
		accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
		bucket: process.env.R2_BUCKET || "",
		publicBase: (process.env.R2_PUBLIC_BASE || "").replace(/\/+$/, ""),
	};
	if (
		!cfg.accountId ||
		!cfg.accessKeyId ||
		!cfg.secretAccessKey ||
		!cfg.bucket
	) {
		return null;
	}
	return cfg;
}

/* ---------- AWS SigV4 签名（R2 兼容子集，region 固定 auto） ---------- */

const rfc3986 = (s) =>
	encodeURIComponent(s).replace(
		/[!'()*]/g,
		(c) => "%" + c.charCodeAt(0).toString(16).toUpperCase(),
	);
const encodePath = (key) => key.split("/").map(rfc3986).join("/");

async function hmac(key, msg) {
	const k = await crypto.subtle.importKey(
		"raw",
		key,
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	return new Uint8Array(await crypto.subtle.sign("HMAC", k, enc.encode(msg)));
}

async function s3Fetch(cfg, { method, key = "", query = {}, body = null, contentType = "" }) {
	const host = `${cfg.accountId}.r2.cloudflarestorage.com`;
	const path = `/${rfc3986(cfg.bucket)}${key ? `/${encodePath(key)}` : ""}`;
	const qs = Object.keys(query)
		.sort()
		.map((k) => `${rfc3986(k)}=${rfc3986(String(query[k]))}`)
		.join("&");
	const now = new Date();
	const amzDate = now
		.toISOString()
		.replace(/[-:]/g, "")
		.replace(/\.\d{3}/, "");
	const dateStamp = amzDate.slice(0, 8);
	const payloadHash = await sha256Hex(body || new Uint8Array(0));

	const headers = {
		host,
		"x-amz-content-sha256": payloadHash,
		"x-amz-date": amzDate,
	};
	if (contentType) headers["content-type"] = contentType;
	const signedNames = Object.keys(headers).sort();
	const canonicalHeaders = signedNames
		.map((n) => `${n}:${String(headers[n]).trim()}\n`)
		.join("");
	const canonicalRequest = [
		method,
		path,
		qs,
		canonicalHeaders,
		signedNames.join(";"),
		payloadHash,
	].join("\n");
	const scope = `${dateStamp}/auto/s3/aws4_request`;
	const stringToSign = [
		"AWS4-HMAC-SHA256",
		amzDate,
		scope,
		await sha256Hex(enc.encode(canonicalRequest)),
	].join("\n");
	let k = await hmac(enc.encode("AWS4" + cfg.secretAccessKey), dateStamp);
	k = await hmac(k, "auto");
	k = await hmac(k, "s3");
	k = await hmac(k, "aws4_request");
	const signature = [...(await hmac(k, stringToSign))]
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	const outHeaders = {
		Authorization:
			`AWS4-HMAC-SHA256 Credential=${cfg.accessKeyId}/${scope}, ` +
			`SignedHeaders=${signedNames.join(";")}, Signature=${signature}`,
		"x-amz-content-sha256": payloadHash,
		"x-amz-date": amzDate,
	};
	if (contentType) outHeaders["Content-Type"] = contentType;
	return fetch(`https://${host}${path}${qs ? `?${qs}` : ""}`, {
		method,
		headers: outHeaders,
		body: body || undefined,
	});
}

/* ---------- S3 语义层：列目录 / 上传 ---------- */

const xmlUnescape = (s) =>
	s
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&amp;/g, "&");

function tag(block, name) {
	const m = block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
	return m ? xmlUnescape(m[1]) : "";
}

export async function s3List(cfg, prefix, cursor) {
	const query = {
		"list-type": "2",
		prefix,
		delimiter: "/",
		"max-keys": "200",
	};
	if (cursor) query["continuation-token"] = cursor;
	const res = await s3Fetch(cfg, { method: "GET", query });
	if (!res.ok) {
		throw new Error(`R2 列目录失败（HTTP ${res.status}）`);
	}
	const xml = await res.text();
	const folders = [...xml.matchAll(/<CommonPrefixes>([\s\S]*?)<\/CommonPrefixes>/g)]
		.map((m) => tag(m[1], "Prefix"))
		.filter(Boolean)
		.map((p) => ({
			prefix: p,
			name: p.replace(/\/$/, "").split("/").pop() || p,
		}));
	const objects = [...xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)]
		.map((m) => ({
			key: tag(m[1], "Key"),
			size: Number(tag(m[1], "Size") || 0),
			uploaded: tag(m[1], "LastModified"),
		}))
		.filter((o) => o.key && o.key !== prefix)
		.map((o) => ({
			...o,
			name: o.key.split("/").pop() || o.key,
			url: cfg.publicBase
				? `${cfg.publicBase}/${o.key.split("/").map(encodeURIComponent).join("/")}`
				: "",
		}));
	const truncated = tag(xml, "IsTruncated") === "true";
	return {
		folders,
		objects,
		truncated,
		cursor: truncated ? tag(xml, "NextContinuationToken") || null : null,
	};
}

export async function s3Put(cfg, key, bytes, contentType) {
	const res = await s3Fetch(cfg, {
		method: "PUT",
		key,
		body: bytes,
		contentType: contentType || "application/octet-stream",
	});
	if (!res.ok) {
		throw new Error(`R2 上传失败（HTTP ${res.status}）`);
	}
}
