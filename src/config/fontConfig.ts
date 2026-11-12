// 字体配置
export const fontConfig = {
	// 是否启用自定义字体功能
	enable: true,
	// 是否预加载字体文件
	preload: true,
	// 当前选择的字体，支持多个字体组合
	selected: ["system"] as string[],

	// 字体列表
	// 推荐使用可靠的 CDN 服务商提供的字体链接，它天然做了按需分片加载，且性能较好
	//
	// 也可以使用本地字体文件，需自行进行字体子集化处理，否则会因为字体文件庞大增加带宽负担导致页面加载缓慢甚至无法加载
	// 如果进行字体子集化处理，会导致动态内容（如评论，Bangumi等）无法正确显示字体，因此不推荐使用本地字体文件
	fonts: {
		// 系统字体
		system: {
			id: "system",
			name: "系统字体",
			src: "", // 系统字体无需 src
			family:
				"system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
		},

		// Google Fonts - Inter
		inter: {
			id: "inter",
			name: "Inter",
			src: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
			family: "Inter",
			display: "swap" as const,
		},

		// 小米字体 - MiSans Normal
		"misans-normal": {
			id: "misans-normal",
			name: "MiSans Normal",
			src: "https://unpkg.com/misans@4.1.0/lib/Normal/MiSans-Normal.min.css",
			family: "MiSans",
			weight: 400,
			display: "swap" as const,
		},

		// 小米字体 - MiSans Regular
		"misans-regular": {
			id: "misans-regular",
			name: "MiSans Regular",
			src: "https://unpkg.com/misans@4.1.0/lib/Normal/MiSans-Regular.min.css",
			family: "MiSans",
			weight: 500,
			display: "swap" as const,
		},

		// 小米字体 - MiSans Semibold
		"misans-semibold": {
			id: "misans-semibold",
			name: "MiSans Semibold",
			src: "https://unpkg.com/misans@4.1.0/lib/Normal/MiSans-Semibold.min.css",
			family: "MiSans",
			weight: 600,
			display: "swap" as const,
		},

		// ── 主站同款字体库（2026-11-12 搬入，与主站 lanerc.me 同一批字体）──
		// Zen Maru Gothic（日系圆体）
		"zen-maru-gothic": {
			id: "zen-maru-gothic",
			name: "Zen Maru Gothic",
			src: "https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700;900&display=swap",
			family: "Zen Maru Gothic",
			display: "swap" as const,
		},

		// Fredoka（圆润西文）
		fredoka: {
			id: "fredoka",
			name: "Fredoka",
			src: "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap",
			family: "Fredoka",
			display: "swap" as const,
		},

		// JetBrains Mono（代码等宽）
		"jetbrains-mono": {
			id: "jetbrains-mono",
			name: "JetBrains Mono",
			src: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap",
			family: "JetBrains Mono",
			display: "swap" as const,
		},

		// 思源宋体
		"noto-serif-sc": {
			id: "noto-serif-sc",
			name: "Noto Serif SC",
			src: "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700;900&display=swap",
			family: "Noto Serif SC",
			display: "swap" as const,
		},

		// M PLUS Rounded 1c（日本圆体）
		"m-plus-rounded-1c": {
			id: "m-plus-rounded-1c",
			name: "M PLUS Rounded 1c",
			src: "https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700;800&display=swap",
			family: "M PLUS Rounded 1c",
			display: "swap" as const,
		},

		// Great Vibes（手写花体，本地文件）
		"great-vibes": {
			id: "great-vibes",
			name: "Great Vibes",
			src: "/assets/fonts/GreatVibes-Regular-2.otf",
			family: "Great Vibes",
			format: "opentype" as const,
			display: "swap" as const,
		},

		// 霞鹜文楷 GB Lite（本地文件，已按常用字集子集化为 woff2）
		"lxgw-wenkai": {
			id: "lxgw-wenkai",
			name: "LXGW WenKai GB Lite",
			src: "/assets/fonts/LXGWWenKaiGBLite-Regular.woff2",
			family: "LXGW WenKai GB Lite",
			format: "woff2" as const,
			display: "swap" as const,
		},

		// 朱雀仿宋（本地文件，已子集化）
		"zhuque-fangsong": {
			id: "zhuque-fangsong",
			name: "Zhuque Fangsong",
			src: "/assets/fonts/ZhuqueFangsong-Regular.woff2",
			family: "Zhuque Fangsong",
			format: "woff2" as const,
			display: "swap" as const,
		},

		// 中文圆体 Luoliti（本地文件，已子集化）
		luoliti: {
			id: "luoliti",
			name: "Luoliti",
			src: "/assets/fonts/loli.woff2",
			family: "Luoliti",
			format: "woff2" as const,
			display: "swap" as const,
		},

		// 汉仪小麦体（本地文件，已子集化）
		xiaomaiti: {
			id: "xiaomaiti",
			name: "HYXiaoMaiTiJ",
			src: "/assets/fonts/HYXiaoMaiTiJ.woff2",
			family: "HYXiaoMaiTiJ",
			format: "woff2" as const,
			display: "swap" as const,
		},
	},

	// 全局字体回退
	fallback: [
		"system-ui",
		"-apple-system",
		"BlinkMacSystemFont",
		"Segoe UI",
		"Roboto",
		"sans-serif",
	] as string[],
};
