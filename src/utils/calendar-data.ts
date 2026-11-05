import { solarToLunar } from "./lunar";

/*
 * 日历数据层：把主站仓库 calendar-data/ 的三份真源转换成任务书约定的统一事件数组。
 * 真源经 GitHub raw 只读拉取，禁止写入主站仓库。
 */

/** 主站真源基址（只读） */
export const CALENDAR_RAW_BASE =
	"https://raw.githubusercontent.com/Misty-ui-source/Firefly/main/calendar-data/";

/** 主站真源目录（用于构建期列目录发现年份，不写死） */
export const CALENDAR_RAW_DIR_API =
	"https://api.github.com/repos/Misty-ui-source/Firefly/contents/calendar-data?ref=main";

/** 任务书约定的统一事件形状（source 一律 builtin） */
export interface CalendarEventItem {
	/** YYYY-MM-DD */
	date: string;
	/** 显示名 */
	name: string;
	/** 法定放假日 */
	isOfficial?: boolean;
	/** 调休补班日 */
	isWorkday?: boolean;
	icon?: string;
	source: "builtin";
	/** 该日所属连休段总天数，仅放假日带 */
	rest?: number;
	/**
	 * 本站扩展：事件分组标识。任务书契约本身没有这个字段，
	 * 但前端要按「节假日／调休／校历／个人记录／纪念日」分组展示，
	 * 没有它就只能猜，所以附带一个可选字段，不影响既有消费方。
	 */
	kind?: "holiday" | "workday" | "seu" | "record" | "anniversary";
}

/** 主站 holidays-<年份>.json 元素 */
export interface RawHoliday {
	date: string;
	name: string;
	type: "holiday" | "workday";
}

/** 主站 seu-calendar.json 元素 */
export interface RawSeu {
	start: string;
	end: string;
	title: string;
	kind: string;
}

/** 主站 personal-records.json 元素 */
export interface RawRecord {
	date: string;
	title: string;
	note?: string;
}

/** 三层真源合并后的快照形状 */
export interface CalendarLayers {
	holidays: RawHoliday[];
	seu: RawSeu[];
	records: RawRecord[];
}

function pad(n: number): string {
	return n < 10 ? `0${n}` : String(n);
}

function dayKey(y: number, m: number, d: number): string {
	return `${y}-${pad(m)}-${pad(d)}`;
}

function shiftKey(key: string, days: number): string {
	const [y, m, d] = key.split("-").map(Number);
	const t = new Date(Date.UTC(y, m - 1, d + days));
	return dayKey(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}

/** 法定节假日：放假日带 rest（同名连续放假段总天数），补班日带 isWorkday */
export function convertHolidays(list: RawHoliday[]): CalendarEventItem[] {
	const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
	const restByDate = new Map<string, number>();

	// 先按「同名 + 连续日期 + 均为放假日」切段，段长即 rest
	let runStart = 0;
	for (let i = 1; i <= sorted.length; i++) {
		const prev = sorted[i - 1];
		const next = sorted[i];
		const continues =
			next != null &&
			prev.type === "holiday" &&
			next.type === "holiday" &&
			prev.name === next.name &&
			shiftKey(prev.date, 1) === next.date;
		if (continues) continue;
		if (prev.type === "holiday") {
			const length = i - runStart;
			for (let j = runStart; j < i; j++) {
				restByDate.set(sorted[j].date, length);
			}
		}
		runStart = i;
	}

	return sorted.map((h) => {
		if (h.type === "workday") {
			return {
				date: h.date,
				name: h.name,
				isWorkday: true,
				source: "builtin",
				kind: "workday",
			} satisfies CalendarEventItem;
		}
		return {
			date: h.date,
			name: h.name,
			isOfficial: true,
			source: "builtin",
			rest: restByDate.get(h.date),
			kind: "holiday",
		} satisfies CalendarEventItem;
	});
}

/** 东南大学校历：只展开 kind=event 的条目，term/holiday 不展开 */
export function convertSeu(list: RawSeu[]): CalendarEventItem[] {
	const out: CalendarEventItem[] = [];
	for (const item of list) {
		if (item.kind !== "event") continue;
		let cursor = item.start;
		// 逐日展开，区间异常（end < start）时只落起始日
		let guard = 0;
		while (cursor <= item.end && guard < 400) {
			out.push({
				date: cursor,
				name: item.title,
				source: "builtin",
				kind: "seu",
			});
			cursor = shiftKey(cursor, 1);
			guard++;
		}
	}
	return out;
}

/** 个人记录：直接转 name */
export function convertRecords(list: RawRecord[]): CalendarEventItem[] {
	return list.map((r) => ({
		date: r.date,
		name: r.title,
		source: "builtin",
		kind: "record",
	}));
}

/**
 * 农历 → 公历：给定农历年与月日，回推公历日期。
 * lunar.ts 只提供公历转农历，站长生日（农历三月廿七）需要反向，
 * 用位掩码表逐日回扫（一年至多 366 次比较，构建期一次即可）。
 */
export function lunarToSolar(year: number, month: number, day: number): string {
	const start = Date.UTC(year, 0, 1);
	for (let i = 0; i < 366; i++) {
		const t = new Date(start + i * 86400000);
		const y = t.getUTCFullYear();
		const m = t.getUTCMonth() + 1;
		const d = t.getUTCDate();
		const lunar = solarToLunar(y, m, d);
		if (
			lunar.year === year &&
			lunar.month === month &&
			lunar.day === day &&
			!lunar.leap
		) {
			return dayKey(y, m, d);
		}
	}
	return "";
}

/** 站长生日：农历三月廿七，逐年换算成公历 */
export function anniversaryItems(years: number[]): CalendarEventItem[] {
	const out: CalendarEventItem[] = [];
	for (const year of years) {
		const solar = lunarToSolar(year, 3, 27);
		if (solar) {
			out.push({
				date: solar,
				name: "站长生日",
				source: "builtin",
				kind: "anniversary",
			});
		}
		out.push({
			date: `${year}-10-15`,
			name: "主站纪念日",
			source: "builtin",
			kind: "anniversary",
		});
		out.push({
			date: `${year}-11-05`,
			name: "灵感屋纪念日",
			source: "builtin",
			kind: "anniversary",
		});
	}
	return out;
}

/** 覆盖年份：当前年份与下一年（任务书规则 5 的下限） */
export function defaultYears(now: Date = new Date()): number[] {
	const year = now.getFullYear();
	return [year, year + 1];
}

/** 三层真源 + 内置纪念日 → 统一事件数组 */
export function buildCalendarItems(
	layers: CalendarLayers,
	years: number[] = defaultYears(),
): CalendarEventItem[] {
	return [
		...convertHolidays(layers.holidays),
		...convertSeu(layers.seu),
		...convertRecords(layers.records),
		...anniversaryItems(years),
	];
}

export { LUNAR_INFO } from "./lunar-data";
/** 节气表与农历表一并导出，页面内联给客户端用 */
export { SOLAR_TERMS } from "./solar-terms-data";
