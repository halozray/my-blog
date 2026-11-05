import type { UserInfo } from "@waline/api";

type GuestbookMessageLocalState = "sending" | "failed";

/**
 * @waline/api 的 UserInfo 把 objectId 声明为 number；本站 Waline 使用 MongoDB 存储，
 * 实际返回的是字符串 ID（如 "6aec570817c381000728314d"），故在此覆盖为两种都接受。
 * node_modules 里的上游类型不可改，只能在本层放宽。
 */
export type GuestbookAuthUser = Omit<UserInfo, "objectId"> & {
	objectId?: number | string;
	remember?: boolean;
};

export interface GuestbookProfile {
	nick: string;
	mail: string;
	link: string;
}

export interface GuestbookEmojiItem {
	key: string;
	url: string;
}

export interface GuestbookEmojiPack {
	name: string;
	icon: string;
	items: GuestbookEmojiItem[];
}

export interface GuestbookImageAttachment {
	name: string;
	url: string;
}

/** 语音识别失败归类：denied 为麦克风不可用，failed 为识别服务本身出错 */
export type GuestbookSpeechFailure = "denied" | "failed";

export interface GuestbookSpeechHandlers {
	/** 每次识别结果回调，finalText 为本次按住期间累计的确定文本，interimText 为尚未定稿的片段 */
	onText: (finalText: string, interimText: string) => void;
	onFailure: (failure: GuestbookSpeechFailure) => void;
	/** 识别结束（正常结束、被停止或被中止）都会回调一次，供调用方复位录音态 */
	onEnd: () => void;
}

export interface GuestbookSpeechSession {
	/** 收尾并让已识别内容出最终结果 */
	stop: () => void;
	/** 立即中止，丢弃本次识别 */
	abort: () => void;
}

export interface GuestbookChatMessage {
	id: string;
	/** MongoDB 存储下为字符串 ID，兼容数值型存储 */
	objectId?: number | string;
	/** 所在线程的根评论 ID，回复子评论时作为 rid 提交 */
	rootId?: number;
	userId?: number;
	nick: string;
	avatar: string;
	link?: string;
	body: string;
	createdAt: number;
	browser?: string;
	os?: string;
	addr?: string;
	label?: string;
	isAdmin: boolean;
	replyToId?: string;
	replyToNick?: string;
	/** 仅本地未发送成功的消息使用，重发时据此还原 pid 目标 */
	replyTargetId?: string;
	/** 改用 pid 之前写进正文的引用标记，编辑时需原样保留 */
	legacyReplyMarker?: string;
	status?: string;
	localState?: GuestbookMessageLocalState;
	failureReason?: string;
}
