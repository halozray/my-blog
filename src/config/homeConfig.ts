import type { HomeConfig } from "../types/config";

export const homeConfig: HomeConfig = {
	// 资料卡横幅图（导航 Logo 资料卡第一层）
	// 留空则回退为「站长头像模糊放大」当背景
	avatarBanner: "",

	// 名字
	name: "zhz",

	// 首页展示名字（留空则使用 name）
	displayName: "zhz",

	// 职业/身份标签
	occupation: "[电子科学与技术 / 大三摆烂博主]",

	// 个人签名（支持多条，会循环打字+删除效果）
	bio: ["Hello, I'm zhz. 普通学生，喜欢音乐和瞎折腾，这里放我的日常和碎碎念。"],

	hero: {
		mosaic: {
			rows: 4,
			columns: 6,
			idleVisible: 6,
			seed: 20260814,
			// 首屏六块碎片按 reveal rank 放置，入场后停在这套布局上不再轮换。
			initialLayout: [
				{ x: 0.14, y: 0.305, width: 0.104, height: 0.205 },
				{ x: 0.435, y: 0.18, width: 0.068, height: 0.13, blur: 5.5 },
				{ x: 0.642, y: 0.368, width: 0.047, height: 0.092, blur: 5 },
				{ x: 0.863, y: 0.402, width: 0.097, height: 0.19 },
				{ x: 0.337, y: 0.653, width: 0.159, height: 0.313 },
				{ x: 0.639, y: 0.751, width: 0.116, height: 0.228 },
			],
			scrub: 0.45,
			// 滑动距离整体砍半，同样的滚动量推进更快
			desktopScrollDistance: 3250,
			mobileScrollDistance: 2300,
			desktopDialogueTailDistance: 240,
			mobileDialogueTailDistance: 180,
			desktopMinViewports: 4.05,
			mobileMinViewports: 3.05,
			interactionHold: 0.06,
		},
		contact: {
			platform: "Email",
			handle: "xz011@qq.com",
		},
		sticker: {
			image: "/assets/images/home/doll.avif",
			alt: "黑猫角色贴纸",
			sounds: {
				press: "/assets/doll-press.mp3",
				loosen: "/assets/doll-loosen.mp3",
			},
		},
		// 拼合完成后的照片态：主图平面倾斜并左移，右侧三张介绍卡片错峰倒下；
		// overlay 会在落位后从下方滑入叠在照片下缘，image 留空不显示；
		// author 填了就在图片右上角显示作者小标牌，留空不显示
		photo: {
			main: {
				image: "/assets/images/home/home.avif",
				author: "by 冰冰坚老师",
			},
			overlay: {
				image: "/assets/images/home/home2.avif",
				author: "by 冰冰坚老师",
			},
			intro: {
				direction:
					"本站没什么专研方向——电子科学与技术在读，音乐和日子，都记一点。",
				hobby: "热衷于折腾各种小工具和自建服务，收集好听的音乐。",
				bio: "代码堆在 GitHub（Misty-ui-source），有话写信到 xz011@qq.com，追更订 RSS / Atom——白天上课，回得慢。",
			},
		},
		// 左下角角色的想法气泡：首次出现自动冒第一句，之后点击角色逐句弹出，末句后从头循环
		dialogue: {
			enabled: true,
			lines: [
				"欸——来客人了。随便坐，茶自己倒。",
				"我是这间小屋的猫，站长白天上课，我负责看家。",
				"站长晚上才出现，多半在折腾些没用的小玩意儿。",
				"这里是实验站，新功能先在这儿试，坏了也别慌。",
				"文章是从旧站搬来的老存货，一共 17 篇，慢慢看。",
				"想留言去主站 lanerc.me，这边评论还没开。",
				"站长喜欢音乐，收藏里的歌比文章还多。",
				"白天找站长？在上课。晚上找？在改样式。",
				"友链都挂在主站，这边不挂，想换去主站谈。",
				"夜深了，小声点——站长明天还要早起。",
			],
		},
		// 玻璃雨珠 + 撞击水花（移动端自动降低密度，尊重 prefers-reduced-motion）
		rain: {
			enabled: true,
			intensity: 0.6,
			// 留空则随主题自动取色（暗色→白 / 浅色→深灰）；也可填 "#7fb0ff" 或 "127,176,255"
			color: "#ffffff",
		},
	},

	// 桌面端影像叙事：背景视差揭示（全屏磨砂玻璃衬底）→ 五幕画面横向叙事
	homeBlinds: {
		enabled: true,
		reveal: {
			backgroundImage: "/assets/images/home-blinds/act1/1.webp",
			// 长条横移揭示的入场标题：标题单行显示（版式按 4 字排），
			// 祝福语单行显示（版式按 5 字排），可自由增减条数
			headline: {
				title: "祝愿各位",
				messages: ["夜路有星光", "岁岁皆欢愉", "所念皆星河", "版本无回滚"],
				enterDuration: 0.6,
				messageHold: 2.6,
				messageFlipDuration: 0.75,
			},
		},
		scenes: {
			scrollDistance: 3400,
			// 拼图背景往左挪完一个循环周期（4 块）所需的秒数，越小越快
			cycleDuration: 2.4,
			// 留言墙气泡：同屏去重，每轮不放回；weight 越大越优先出场，缺省按 1 算。
			// text 与 image 至少给一个；给了 image 就在文字下方带一张图。
			// 文案是 2025—2026 网络热梗与站内老梗混排，梗过时了直接换掉就行
			bubbleMessages: [
				{ text: "到此一游", weight: 3 },
				{ text: "深夜路过，灯还亮着", weight: 3 },
				{ text: "白天上课，晚上施工", weight: 3 },
				{ text: "这站的样式是不是又变了", weight: 3 },
				{ text: "音乐比文章更新得勤", weight: 3 },
				{ text: "实验田里坏了就回滚", weight: 3 },
				{ text: "前排围观新功能", weight: 3 },
				{ text: "猫在看家，站长不在", weight: 3 },
				{ text: "留言请移步主站", weight: 3 },
				{ text: "17 篇老文章慢慢看", weight: 3 },
				{ text: "暗色护眼，深夜友好", weight: 3 },
				{ text: "今天的猫也很圆", weight: 3 },
				{ text: "折腾无止境，睡觉有死线", weight: 3 },
				{ text: "新功能先在这儿试", weight: 3 },
				{ text: "路过留爪", weight: 3 },
				{ text: "七副面孔之外的新屋", weight: 3 },
				{ text: "安安静静看文", weight: 3 },
				{ text: "站长说：先跑起来再说", weight: 3 },
				{ text: "明天见，记得早睡", weight: 3 },
			],
			// 从评论区捞一条真实留言混进上面这池子：滚到影像层才异步取，且只取一次
			commentBubble: {
				enabled: true,
				weight: 4,
			},
			composite: {
				title: "迁址安家",
				description:
					"旧院炊烟未散，新址门楣初悬——小屋迁进新山水，自此有址可寻。",
				alt: "第一幕插画",
				// 明信片左下角标题下的完整日期；删掉即只显示标题
				date: "2026 / 10 / 15",
			},
			items: [
				{
					title: "自铸门钥",
					description:
						"不借旁人的钥匙，自研控制台落成；里外进出，小屋自此自己说了算。",
					image: "/assets/images/home-blinds/act2/1.webp",
					alt: "第二幕插画",
					date: "2026 / 10 / 23",
				},
				{
					title: "素简开窗",
					description: "繁华之外另开一扇素窗，同一间小屋，自此有了两种呼吸。",
					image: "/assets/images/home-blinds/act2/2.webp",
					alt: "第三幕插画",
					date: "2026 / 10 / 27",
				},
				{
					title: "六貌同堂",
					description:
						"华彩、素简、谐彩、顽彩、璨夜、纸舟——一屋六貌，推门便是新天。",
					image: "/assets/images/home-blinds/act2/3.webp",
					alt: "第四幕插画",
					date: "2026 / 10 / 31",
				},
				{
					title: "明信未寄",
					description:
						"第七封明信写好了抬头，故事还长；新屋另开，下一程山水，且行且看。",
					image: "/assets/images/home-blinds/act2/4.webp",
					alt: "第五幕插画",
					date: "2026 / 11 / 01",
				},
			],
			standImages: [
				"/assets/images/home-blinds/act2-doll/1.gif",
				"/assets/images/home-blinds/act2-doll/2.gif",
			],
		},
	},

	// 链接配置
	// 已经预装的图标集：fa7-brands，fa7-regular，fa7-solid，material-symbols，simple-icons
	// 访问https://icones.js.org/ 获取图标代码，
	// 如果想使用尚未包含相应的图标集，则需要安装它
	// `pnpm add @iconify-json/<icon-set-name>`
	links: [
		{
			name: "GitHub",
			icon: "fa7-brands:github",
			url: "https://github.com/Misty-ui-source",
			color: "#1F6FEB",
		},
		{
			name: "Email",
			icon: "material-symbols:mail",
			url: "mailto:xz011@qq.com",
			color: "#6E7681",
		},
		{
			name: "Telegram",
			icon: "fa7-brands:telegram",
			url: "https://t.me/zhzhk27",
			color: "#26A5E4",
		},
		{
			name: "RSS",
			icon: "fa7-solid:rss",
			url: "/rss/",
			color: "#F26522",
		},
	],
};
