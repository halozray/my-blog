import type { APIContext } from "astro";
import { siteConfig } from "@/config";
import { getSortedPosts } from "@utils/content-utils";
import { url } from "@utils/url-utils";

/** 转义 XML 文本与属性值，避免标题/描述里的特殊字符破坏 feed 结构 */
function escapeXml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
}

function toIsoDate(value: Date | string | undefined): string | null {
	if (!value) return null;
	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function GET(context: APIContext): Promise<Response> {
	const posts = await getSortedPosts();
	const site = new URL(context.site ?? siteConfig.site_url);
	const selfUrl = new URL("atom.xml", site).toString();

	const entries = posts.map((post) => {
		const postUrl = new URL(url(`/posts/${post.id}/`), site).toString();
		const published = toIsoDate(post.data.published);
		const updated = toIsoDate(post.data.updated ?? post.data.published);
		// 加密文章的正文与摘要都不进 feed，只保留标题与链接
		const summary = post.data.password ? "" : (post.data.description ?? "").trim();

		const parts = [
			"<entry>",
			`<title type="text">${escapeXml(post.data.title)}</title>`,
			`<id>${escapeXml(postUrl)}</id>`,
			`<link rel="alternate" type="text/html" href="${escapeXml(postUrl)}"/>`,
			updated ? `<updated>${updated}</updated>` : "",
			published ? `<published>${published}</published>` : "",
			summary ? `<summary type="text">${escapeXml(summary)}</summary>` : "",
			...(post.data.tags ?? []).map(
				(tag) => `<category term="${escapeXml(tag)}"/>`,
			),
			"</entry>",
		];

		return parts.filter(Boolean).join("");
	});

	const feedUpdated =
		toIsoDate(posts[0]?.data.updated ?? posts[0]?.data.published) ??
		new Date().toISOString();

	const xml = [
		'<?xml version="1.0" encoding="utf-8"?>',
		'<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="zh-CN">',
		`<title type="text">${escapeXml(siteConfig.title)}</title>`,
		`<subtitle type="text">${escapeXml(siteConfig.subtitle)}</subtitle>`,
		`<id>${escapeXml(site.toString())}</id>`,
		`<link rel="self" type="application/atom+xml" href="${escapeXml(selfUrl)}"/>`,
		`<link rel="alternate" type="text/html" href="${escapeXml(site.toString())}"/>`,
		`<updated>${feedUpdated}</updated>`,
		"<author>",
		`<name>${escapeXml(siteConfig.title)}</name>`,
		`<uri>${escapeXml(site.toString())}</uri>`,
		"</author>",
		"<generator>Astro</generator>",
		...entries,
		"</feed>",
	].join("\n");

	return new Response(xml, {
		headers: {
			"Content-Type": "application/atom+xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
		},
	});
}
