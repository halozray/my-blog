import type { AnnouncementConfig } from "../types/config";

export const announcementConfig: AnnouncementConfig = {
	// 公告标题
	title: "公告",

	// 公告列表（sort 越大越靠前）
	items: [
		{
			tag: "欢迎",
			title: "小站开张",
			content:
				"欢迎来到灵感屋，我是 Alexander，白天上课，晚上折腾。这里专门试新主题和新功能，稳了再搬回主站，所以样式随时会变，偶尔抽风，先说声抱歉。",
			time: "2026-11-05",
			link: "/about/",
			sort: 3,
		},
		{
			tag: "公告",
			title: "先说清楚",
			content:
				"文章是从旧站搬来的 17 篇老存货，日常更新都在主站 lanerc.me。这边评论暂未开启，友链也不挂——要留言、互换友链，都去主站找我。",
			time: "2026-11-05",
			sort: 2,
		},
		{
			tag: "更新",
			title: "建站第一天",
			content:
				"底座用的是 MmzMing 的开源主题，身份信息已经换成我自己的，细节还在慢慢对齐。发现哪里显示不对，去主站评论区喊我一声。",
			time: "2026-11-05",
			sort: 1,
		},
	],

	// 是否允许用户关闭公告
	closable: true,
};
