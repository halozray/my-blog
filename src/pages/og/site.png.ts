import type { APIContext } from "astro";
import { siteConfig } from "@/config";
import { renderOgCard } from "@/utils/og-card";

/*
 * 站点级分享卡片：首页、归档、列表、关于、留言板、相册、日历等非文章页都用它。
 * 之前这些页面用的是 256×256 的方形头像图，塞进横向分享卡片会被裁得只剩中间一块。
 */

export const prerender = true;

export async function GET(_context: APIContext): Promise<Response> {
	return renderOgCard({
		title: siteConfig.title,
		description: siteConfig.description,
		// 站点信息改动不频繁，但也不该锁一年
		cacheControl: "public, max-age=86400",
	});
}
