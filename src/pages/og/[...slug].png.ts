import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import type { APIContext, GetStaticPaths } from "astro";
import { siteConfig } from "@/config";
import { formatDateI18n } from "@/utils/date-utils";
import { renderOgCard } from "@/utils/og-card";
import { removeFileExtension } from "@/utils/url-utils";

/*
 * 每篇文章的分享卡片。/og/site.png 是站点级卡片，见同目录 site.png.ts，
 * 两者共用 src/utils/og-card.ts 的同一套模板。
 */

export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
	if (!siteConfig.generateOgImages) {
		return [];
	}

	const allPosts = await getCollection("posts");
	const publishedPosts = allPosts.filter((post) => !post.data.draft);

	return publishedPosts.map((post) => {
		// 将 id 转换为 slug（移除扩展名）以匹配路由参数
		const slug = removeFileExtension(post.id);
		return {
			params: { slug },
			props: { post },
		};
	});
};

export async function GET({
	props,
}: APIContext<{ post: CollectionEntry<"posts"> }>): Promise<Response> {
	const { data } = props.post;

	return renderOgCard({
		title: data.title,
		description: data.description,
		date: formatDateI18n(data.published),
	});
}
