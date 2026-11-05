// 浮动播放器 · 歌单拉取（第三批）：按平台歌单 ID 拉全单（歌名/歌手/封面/
// 各曲 ID），播放器打开时调用，点播再走 /api/music/resolve 取直链。
// GET /api/music/playlist?platform=wy|tx|kg&id=<歌单ID>
//
// 迁到 Vercel Edge：仅去掉 Cloudflare 的 caches.default / context.waitUntil，
// 缓存改由 Cache-Control 响应头承担。2026-11-05 起改成分层缓存：浏览器 600 秒，
// CDN 存 1 天，过期后 stale-while-revalidate 先把旧歌单递出去、后台再刷新——
// 原先只有 max-age=600，CDN 一到 10 分钟就整段冷启，用户干等十几秒。
export const config = { runtime: "edge" };

// 防白嫖：只放行本站、本地调试与本站 Vercel 预览部署
const ALLOWED_HOSTS = new Set(["idea.lanerc.me", "localhost"]);
const ALLOWED_SUFFIXES = [".vercel.app"];

function isAllowedRequest(request) {
	const matches = (value) => {
		if (!value) return false;
		let host;
		try {
			host = new URL(value).hostname;
		} catch {
			return false;
		}
		if (ALLOWED_HOSTS.has(host) || host === "127.0.0.1") return true;
		return ALLOWED_SUFFIXES.some((suffix) => host.endsWith(suffix));
	};
	return (
		matches(request.headers.get("origin")) ||
		matches(request.headers.get("referer"))
	);
}
const UA =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

async function fetchText(url, headers = {}, timeout = 9000) {
	const res = await fetch(url, {
		headers: { "User-Agent": UA, ...headers },
		signal: AbortSignal.timeout(timeout),
	});
	if (!res.ok) throw new Error("上游 HTTP " + res.status);
	return res.text();
}

async function playlistNetease(id) {
	const text = await fetchText(
		`https://music.163.com/api/v3/playlist/detail?id=${encodeURIComponent(id)}`,
		{ Referer: "https://music.163.com/" },
	);
	const data = JSON.parse(text);
	const pl = data?.playlist;
	if (!pl) throw new Error("网易云歌单解析失败");
	// detail 接口的 tracks 只给前几首（实测 321 首的单只回 6 首），全单 ID
	// 在 trackIds 里，缺的详情按每批 100 个去 song/detail 补齐再按原序拼。
	const byId = new Map();
	for (const t of pl.tracks || []) byId.set(String(t.id), t);
	const ids = (pl.trackIds || [])
		.map((x) => String(x?.id ?? x))
		.filter((x) => x && x !== "undefined");
	const orderedIds = ids.length ? ids : [...byId.keys()];
	const missing = orderedIds.filter((x) => !byId.has(x));
	const batches = [];
	for (let i = 0; i < missing.length; i += 100) {
		batches.push(missing.slice(i, i + 100));
	}
	// 批次之间并发（2026-11-05）：原来是串行 await，328 首要在 iad1 节点上排 4 次
	// 跨国往返，冷启实测 14–24 秒；并发后只承担最慢那批的延迟。
	// 任一上游失败仍整体抛出（与改造前一致，不静默返回残单）。
	const details = await Promise.all(
		batches.map((batch) => {
			const c = encodeURIComponent(
				JSON.stringify(batch.map((x) => ({ id: Number(x) || x }))),
			);
			return fetchText(`https://music.163.com/api/v3/song/detail?c=${c}`, {
				Referer: "https://music.163.com/",
			}).then((text) => JSON.parse(text));
		}),
	);
	for (const d2 of details) {
		for (const song of d2?.songs || []) byId.set(String(song.id), song);
	}
	const tracks = orderedIds
		.map((x) => byId.get(x))
		.filter(Boolean)
		.map((t) => ({
			id: String(t.id),
			name: t.name || "",
			artist: (t.ar || []).map((a) => a.name).join(" / "),
			pic: t.al?.picUrl || "",
		}));
	if (!tracks.length) throw new Error("网易云歌单为空");
	return { name: pl.name || "", tracks };
}

async function playlistTencent(id) {
	// format=json：不加这个参数上游会返回 JSONP（jsonCallback(...)），JSON.parse 会炸
	const text = await fetchText(
		`https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?type=1&json=1&utf8=1&format=json&onlysong=0&disstid=${encodeURIComponent(id)}`,
		{ Referer: "https://y.qq.com/" },
	);
	const data = JSON.parse(text);
	const cd = data?.cdlist?.[0];
	if (!cd || !Array.isArray(cd.songlist)) throw new Error("QQ 歌单解析失败");
	return {
		name: cd.dissname || "",
		tracks: cd.songlist.map((t) => ({
			id: String(t.songmid || ""),
			name: t.songname || "",
			artist: (t.singer || []).map((a) => a.name).join(" / "),
			pic: t.albummid
				? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${t.albummid}.jpg`
				: "",
		})),
	};
}

async function playlistKugou(id) {
	// 酷狗歌单页把曲目嵌在页面的 global_collection 里，尽力解析
	const html = await fetchText(
		`https://www.kugou.com/yy/special/single/${encodeURIComponent(id)}.html`,
		{},
	);
	const m = html.match(/global_collection\s*=\s*(\[[\s\S]*?\]);/);
	if (!m) throw new Error("酷狗歌单解析失败");
	const list = JSON.parse(m[1]);
	return {
		name: "",
		tracks: list.map((t) => ({
			id: String(t.hash || ""),
			name: String(t.audio_name || "").replace(/^\S+\s-\s/, ""),
			artist: t.singername || t.author_name || "",
			pic: String(t.img || t.album_img || "").replace("{size}", "200"),
		})),
	};
}

// 上游给的封面常是 http 明文地址（如网易云 p1.music.126.net），页面是
// https 时浏览器会因混合内容把整页标成「不完全安全」；这些图床都支持
// https，出接口前统一升级。
const httpsPic = (u) =>
	typeof u === "string" ? u.replace(/^http:\/\//i, "https://") : u;

function json(data, status = 200, extraHeaders = {}) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { "Content-Type": "application/json", ...extraHeaders },
	});
}

export default async function handler(request) {
	if (!isAllowedRequest(request)) {
		return json({ error: "禁止跨站调用" }, 403);
	}
	const u = new URL(request.url);
	const platform = u.searchParams.get("platform") || "";
	const id = u.searchParams.get("id") || "";
	const handlers = { wy: playlistNetease, tx: playlistTencent, kg: playlistKugou };
	if (!handlers[platform] || !id) {
		return json({ error: "参数缺失或平台不支持" }, 400);
	}
	try {
		const data = await handlers[platform](id);
		data.tracks = data.tracks.map((t) => ({ ...t, pic: httpsPic(t.pic) }));
		return json({ platform, ...data }, 200, {
			"Cache-Control":
				"public, max-age=600, s-maxage=86400, stale-while-revalidate=604800",
		});
	} catch (e) {
		return json({ error: String(e?.message || e) }, 502);
	}
}
