import fallbackLayers from "@/data/calendar-fallback.json";
import {
	buildCalendarItems,
	CALENDAR_RAW_BASE,
	CALENDAR_RAW_DIR_API,
	type CalendarLayers,
	type RawHoliday,
	type RawRecord,
	type RawSeu,
} from "@/utils/calendar-data";

/*
 * /api/holidays.json —— 构建期把主站仓库 calendar-data/ 的三份真源拉下来、
 * 按任务书规则转换后预渲染为静态 JSON。生产环境由静态资源直接返回。
 *
 * 两条硬约束：
 * 1. 构建环境拉不到 raw 时不许让构建失败 —— 失败即回落到仓库内快照。
 * 2. 年份不写死 —— 先列目录发现 holiday-NNNN.json，再逐个拉。
 */

const TIMEOUT_MS = 8000;

async function fetchJson(url: string): Promise<unknown> {
	const response = await fetch(url, {
		headers: { "User-Agent": "idea-calendar-build" },
		signal: AbortSignal.timeout(TIMEOUT_MS),
	});
	if (!response.ok) throw new Error(`${url} → ${response.status}`);
	return response.json();
}

/** 列目录发现所有 holidays-<年份>.json；列不到就返回空数组 */
async function discoverHolidayFiles(): Promise<string[]> {
	const response = await fetch(CALENDAR_RAW_DIR_API, {
		headers: {
			"User-Agent": "idea-calendar-build",
			Accept: "application/vnd.github+json",
		},
		signal: AbortSignal.timeout(TIMEOUT_MS),
	});
	if (!response.ok) throw new Error(`dir → ${response.status}`);
	const entries: unknown = await response.json();
	if (!Array.isArray(entries)) return [];
	return entries
		.map((entry) =>
			entry && typeof entry === "object" && "name" in entry
				? String((entry as { name: unknown }).name)
				: "",
		)
		.filter((name) => /^holidays-\d{4}\.json$/.test(name))
		.sort();
}

/** 构建期拉真源；任何一步失败都抛出，由调用方回落快照 */
async function fetchLayers(): Promise<CalendarLayers> {
	const files = await discoverHolidayFiles();
	if (!files.length) throw new Error("未发现 holidays-*.json");

	const holidayLists = await Promise.all(
		files.map((name) => fetchJson(`${CALENDAR_RAW_BASE}${name}`)),
	);
	const holidays: RawHoliday[] = holidayLists.flatMap((list) =>
		Array.isArray(list) ? (list as RawHoliday[]) : [],
	);

	const [seuRaw, recordsRaw] = await Promise.all([
		fetchJson(`${CALENDAR_RAW_BASE}seu-calendar.json`),
		fetchJson(`${CALENDAR_RAW_BASE}personal-records.json`),
	]);

	return {
		holidays,
		seu: Array.isArray(seuRaw) ? (seuRaw as RawSeu[]) : [],
		records: Array.isArray(recordsRaw) ? (recordsRaw as RawRecord[]) : [],
	};
}

export async function GET(): Promise<Response> {
	let layers: CalendarLayers;
	let fromFallback = false;
	try {
		layers = await fetchLayers();
	} catch (error) {
		// 构建期拉不到真源：用仓库内快照兜底，绝不让构建失败
		console.warn(
			"[api/holidays.json] 拉取主站真源失败，改用仓库快照：",
			error instanceof Error ? error.message : error,
		);
		layers = fallbackLayers as CalendarLayers;
		fromFallback = true;
	}

	const items = buildCalendarItems(layers);

	return new Response(JSON.stringify(items), {
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			// 快照兜底时缓存短一些，便于下次构建尽快跟上主站
			"Cache-Control": fromFallback
				? "public, max-age=600"
				: "public, max-age=3600, stale-while-revalidate=86400",
		},
	});
}
