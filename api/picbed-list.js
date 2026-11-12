/* POST /api/picbed-list  { password, prefix?, cursor? }
 * 图床门面（/picbed/）的只读列表接口：按前缀（目录）列 R2 对象。
 * 鉴权与存储走 ./_picbed-shared.js：口令 SHA-256 比对环境变量里的哈希，
 * 哈希为空 = 图床关闭一律 403（fail-closed）；R2 走 S3 兼容接口。 */
import {
	checkGate,
	isAllowedRequest,
	json,
	r2Config,
	s3List,
} from "./_picbed-shared.js";

export const config = { runtime: "edge" };

export default async function handler(request) {
	if (request.method !== "POST") {
		return json({ error: "只接受 POST" }, 405);
	}
	if (!isAllowedRequest(request)) {
		return json({ error: "禁止跨站调用" }, 403);
	}
	try {
		const body = await request.json().catch(() => ({}));
		const gate = await checkGate(
			typeof body.password === "string" ? body.password : "",
		);
		if (gate) return json({ error: gate.error }, gate.status);
		const cfg = r2Config();
		if (!cfg) {
			return json({ error: "R2 未配置（环境变量缺失）" }, 500);
		}
		const prefix =
			typeof body.prefix === "string"
				? body.prefix.replace(/^\/+/, "")
				: "";
		const cursor =
			typeof body.cursor === "string" && body.cursor
				? body.cursor
				: undefined;
		return json(await s3List(cfg, prefix, cursor));
	} catch (e) {
		return json({ error: e.message || "未知错误" }, 500);
	}
}
