import { getCollection, type CollectionEntry } from 'astro:content';

// draft: true 的文件不进构建；dev 下仍然显示，方便本地预览。
const includeDrafts = import.meta.env.DEV;

const byDateDesc = (a: { data: { date: Date } }, b: { data: { date: Date } }) =>
	b.data.date.valueOf() - a.data.date.valueOf();

export async function getEssays(): Promise<CollectionEntry<'essays'>[]> {
	const essays = await getCollection('essays', ({ data }) => includeDrafts || !data.draft);
	return essays.sort(byDateDesc);
}

export async function getNotes(): Promise<CollectionEntry<'notes'>[]> {
	const notes = await getCollection('notes', ({ data }) => includeDrafts || !data.draft);
	return notes.sort(byDateDesc);
}

// 所有长文用过的 tag，按使用次数从多到少。
export async function getEssayTags(): Promise<{ tag: string; count: number }[]> {
	const counts = new Map<string, number>();
	for (const essay of await getEssays()) {
		for (const tag of essay.data.tags) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1);
		}
	}
	return [...counts]
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
