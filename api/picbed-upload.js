/* POST /api/picbed-upload  （multipart 表单：password, dir?, files[]）
 * 图床门面（/picbed/）的上传接口：解锁后往当前目录传图。
 * 鉴权与主站同口径（见 ./_picbed-shared.js）。存储规则与主站对齐：
 * key = [dir/]<base36 时间戳>-<安全文件名>；dir 为空 = 存到桶根。
 * 限额：Vercel 函数单请求体上限约 4.5MB，故单个文件上限 4MB、单请求
 * 最多 10 个；门面页逐个文件发送，不会撞总量上限。 */
import {
	checkGate,
	isAllowedRequest,
	json,
	r2Config,
	s3Put,
} from "./_picbed-shared.js";

export const config = { runtime: "edge" };

const MAX_FILE_SIZE = 4 * 1024 * 1024;

export default async function handler(request) {
	if (request.method !== "POST") {
		return json({ error: "只接受 POST" }, 405);
	}
	if (!isAllowedRequest(request)) {
		return json({ error: "禁止跨站调用" }, 403);
	}
	try {
		const form = await request.formData();
		const gate = await checkGate(String(form.get("password") || ""));
		if (gate) return json({ error: gate.error }, gate.status);
		const cfg = r2Config();
		if (!cfg) {
			return json({ error: "R2 未配置（环境变量缺失）" }, 500);
		}
		const dir = String(form.get("dir") || "")
			.replace(/^\/+|\/+$/g, "")
			.replace(/\.\./g, "")
			.replace(/^\/+|\/+$/g, "");
		const files = form.getAll("files");
		if (!files.length) return json({ error: "没有文件" }, 400);
		if (files.length > 10) {
			return json({ error: "一次最多传 10 个文件" }, 400);
		}

		const urls = [];
		const stamp = Date.now().toString(36);
		for (const f of files) {
			if (typeof f === "string") continue;
			if (f.size > MAX_FILE_SIZE) {
				return json(
					{ error: `「${f.name}」超过 4MB 上限（Vercel 接口限制）` },
					400,
				);
			}
			const safeName = f.name.replace(/[^a-zA-Z0-9._-]/g, "_");
			const key = `${dir ? `${dir}/` : ""}${stamp}-${safeName}`;
			const bytes = new Uint8Array(await f.arrayBuffer());
			await s3Put(cfg, key, bytes, f.type || "application/octet-stream");
			urls.push(
				`${cfg.publicBase}/${key.split("/").map(encodeURIComponent).join("/")}`,
			);
		}
		if (!urls.length) return json({ error: "没有文件" }, 400);
		return json({ urls });
	} catch (e) {
		return json({ error: `上传异常：${e.message}` }, 500);
	}
}
