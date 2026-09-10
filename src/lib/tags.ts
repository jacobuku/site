// tag 的 URL slug 映射。
//
// frontmatter 里照常写中文 tag，这张表只决定它在 URL 里长什么样：
//   tags: [写作]  ->  /essays/tag/writing/
//
// 没登记的非 ASCII tag 不会中断构建，会自动兜底成 tag-<hash>（见 fallbackSlug），
// 同时在构建日志里警告一次。URL 难看是提醒你回来补一条，不是故障。
export const TAG_SLUGS: Record<string, string> = {
	写作: 'writing',
	阅读: 'reading',
	工程: 'engineering',
	工具: 'tools',
	互联网: 'internet',
	想法: 'thoughts',
	草稿: 'draft',
	炼: 'lian',
};

const ASCII_TAG = /^[a-zA-Z0-9][a-zA-Z0-9 _-]*$/;

// 已经警告过的 tag，避免同一个 tag 在每个页面上都刷一遍。
const warned = new Set<string>();

// FNV-1a，只求稳定和 ASCII 安全，不求密码学强度。
// 同一个 tag 在任何机器上都得到同一个 slug，URL 不会因为重新构建而变。
function fallbackSlug(tag: string): string {
	let hash = 0x811c9dc5;
	for (const char of tag) {
		hash ^= char.codePointAt(0)!;
		hash = Math.imul(hash, 0x01000193) >>> 0;
	}
	return `tag-${hash.toString(36)}`;
}

export function tagToSlug(tag: string): string {
	const mapped = TAG_SLUGS[tag];
	if (mapped) return mapped;

	// 纯 ASCII 的 tag 直接规范化，不用登记。
	if (ASCII_TAG.test(tag)) {
		return tag.trim().toLowerCase().replace(/[\s_]+/g, '-');
	}

	const slug = fallbackSlug(tag);
	if (!warned.has(tag)) {
		warned.add(tag);
		console.warn(
			`[tags] tag「${tag}」没有 URL slug，暂时用 /essays/tag/${slug}/。` +
				` 想要好看的地址就在 src/lib/tags.ts 的 TAG_SLUGS 里加一条：'${tag}': 'your-slug',`,
		);
	}
	return slug;
}

export function tagUrl(tag: string): string {
	return `/essays/tag/${tagToSlug(tag)}/`;
}

// 两个 tag 撞到同一个 slug 会让其中一个页面被覆盖，这个必须拦掉。
export function assertUniqueSlugs(tags: string[]): void {
	const seen = new Map<string, string>();
	for (const tag of tags) {
		const slug = tagToSlug(tag);
		const other = seen.get(slug);
		if (other && other !== tag) {
			throw new Error(
				`tag「${other}」和「${tag}」都映射到 slug「${slug}」，请在 src/lib/tags.ts 里改掉其中一个。`,
			);
		}
		seen.set(slug, tag);
	}
}
