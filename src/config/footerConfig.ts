import type { FooterConfig } from "../types/config";

export const footerConfig: FooterConfig = {
	// 社交链接（mailto:/tel: 开头的链接不会在新标签打开）
	socialLinks: [
		{
			label: "GitHub",
			href: "https://github.com/Misty-ui-source",
			icon: "fa7-brands:github",
		},
		{
			label: "Telegram",
			href: "https://t.me/zhzhk27",
			icon: "fa7-brands:telegram",
		},
		{
			label: "邮箱",
			href: "mailto:xz011@qq.com",
			icon: "material-symbols:mail",
		},
		{
			label: "RSS",
			href: "/rss/",
			icon: "fa7-solid:rss",
		},
	],

	// 备案信息（icp/police 留空则不显示对应条目）
	// 萌备编号待申请，先占位；申请下来后替换 icp 文本即可
	beian: {
		icp: "萌ICP备（号码待定）",
		police: "",
		policeIcon: "",
		icpUrl: "https://icp.gov.moe/",
		policeUrl: "",
	},

	// Powered by 信息
	poweredBy: [
		{ label: "框架", name: "Astro", href: "https://astro.build" },
		{
			label: "主题",
			name: "Firefly",
			href: "https://github.com/CuteLeaf/Firefly",
		},
	],
};
