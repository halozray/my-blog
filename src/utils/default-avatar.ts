// 游客默认头像替换（留言墙用；文章评论区在 Waline.astro 里有同口径实现，共用同一份缓存）。
// 头像走 libravatar 直链的人里，没在头像服务注册过的只会拿到服务自带默认图。
// 用 ?d=404 探针分辨（404 = 没注册过），命中的换成配置里的默认头像；
// 探针结果按邮箱哈希在 localStorage 缓存 7 天，非 libravatar 地址一律不碰。

const CACHE_KEY = "wl-defav-v1";
const TTL = 7 * 864e5;
const LIBRAVATAR_RE = /libravatar\.org\/avatar\/([0-9a-f]{32})/i;

interface CacheEntry {
	has: 0 | 1;
	t: number;
}

function loadCache(): Record<string, CacheEntry> {
	try {
		return JSON.parse(
			localStorage.getItem(CACHE_KEY) || "{}",
		) as Record<string, CacheEntry>;
	} catch {
		return {};
	}
}

function saveCache(cache: Record<string, CacheEntry>): void {
	try {
		localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
	} catch {
		// 缓存写不进去不影响本次替换，下次重新探针即可
	}
}

function probeAvatar(hash: string): Promise<boolean> {
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => resolve(true);
		img.onerror = () => resolve(false);
		img.src = `https://seccdn.libravatar.org/avatar/${hash}?d=404`;
	});
}

export async function swapDefaultAvatars(
	messages: { avatar: string }[],
	defaultAvatar: string | undefined,
): Promise<void> {
	if (!defaultAvatar) return;
	const cache = loadCache();
	const uncached = new Set<string>();
	for (const message of messages) {
		const match = message.avatar.match(LIBRAVATAR_RE);
		if (!match) continue;
		const hash = match[1].toLowerCase();
		const hit = cache[hash];
		if (!hit || Date.now() - hit.t >= TTL) uncached.add(hash);
	}
	if (uncached.size) {
		await Promise.all(
			[...uncached].map(async (hash) => {
				const has = await probeAvatar(hash);
				cache[hash] = { has: has ? 1 : 0, t: Date.now() };
			}),
		);
		saveCache(cache);
	}
	for (const message of messages) {
		const match = message.avatar.match(LIBRAVATAR_RE);
		if (!match) continue;
		const hash = match[1].toLowerCase();
		if (cache[hash] && !cache[hash].has) message.avatar = defaultAvatar;
	}
}
