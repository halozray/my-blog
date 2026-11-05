import type { MusicPlayerConfig } from "../types/config";

// 音乐播放器配置
export const musicPlayerConfig: MusicPlayerConfig = {
	// 禁用音乐播放器方法：
	// 在本配置文件把showInNavbar设为false即可关闭导航栏入口

	// 是否在导航栏显示音乐播放器入口
	showInNavbar: true,

	// 使用方式："meting" 使用 Meting API，"local" 使用本地音乐列表
	mode: "meting",

	// 默认音量 (0-1)
	volume: 0.6,

	// 播放模式：'list'=列表循环, 'one'=单曲循环, 'random'=随机播放
	playMode: "list",

	// Meting API 配置
	meting: {
		// Meting API 地址
		// 2026-11-05 全链路实测（歌单/音频/封面/歌词四样 + 音频 8 点抽样）：
		// injahow 与 qijieya 均全通，前者歌单响应 40–319ms、后者 575–701ms，
		// 故 injahow 当主、qijieya 当备。moeyao 响应体前置 PHP Deprecated
		// 警告，res.json() 必失败；i-meto 12s 超时——两者已剔除。
		api: "https://api.injahow.cn/meting/?server=:server&type=:type&id=:id",
		// 音乐平台：netease=网易云音乐, tencent=QQ音乐, kugou=酷狗音乐, xiami=虾米音乐, baidu=百度音乐
		server: "netease",
		// 类型：song=单曲, playlist=歌单, album=专辑, search=搜索, artist=艺术家
		type: "playlist",
		// 歌单/专辑/单曲 ID 或搜索关键词
		// （配置了下方 playlists 时以 playlists 为准，这里只为旧单歌单路径兜底）
		id: "2804070207",
		// 认证 token（可选）
		auth: "",
		// 备用 API 配置（当主 API 失败时使用）
		fallbackApis: [
			"https://api.qijieya.cn/meting/?server=:server&type=:type&id=:id",
		],
	},

	// 歌单列表：列表面板顶部的切换标签按此顺序生成，首项为默认歌单
	// 加歌单只需往这里加一条：在线给 server/id，本地给 local: true
	// 除首项外的在线歌单首次点选时才请求（懒加载），加载过的会话内缓存
	playlists: [
		{ label: "我喜欢的音乐", server: "netease", id: "2804070207" },
		// QQ 歌单音频直链公开 Meting 实例取不到，走本站 api/music 自建解析
		{ label: "F 2", server: "tencent", id: "9439238150", api: "self" },
		{ label: "Do", server: "tencent", id: "9316062023", api: "self" },
		{ label: "syz", server: "tencent", id: "9356695532", api: "self" },
		{ label: "我喜欢", server: "tencent", id: "2294110430", api: "self" },
		{ label: "本地歌单", local: true },
	],

	// 本地音乐配置（当 mode 为 'local' 时使用）
	// 1. 支持传入歌词文件的路径
	// lrc: "/assets/music/lrc/使一颗心免于哀伤-哼唱.lrc",
	// 2. 或者直接填入歌词字符串内容
	// lrc: "[00:00.00]歌词内容...",
	local: {
		playlist: [
			{
				name: "使一颗心免于哀伤",
				artist: "知更鸟 / HOYO-MiX / Chevy",
				url: "/assets/music/使一颗心免于哀伤-哼唱.mp3",
				cover: "/assets/music/cover/109951169585655912.webp",
				lrc: "",
			},
		],
	},
};
