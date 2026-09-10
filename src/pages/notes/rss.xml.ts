import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE_LANG, SITE_TIMEZONE, SITE_TITLE } from '../../consts';
import { getNotes } from '../../lib/collections';
import { absolutizeLinks } from '../../lib/rss';

// 想法没有标题，用时间戳当条目标题，跟页面上显示的一致。
const stamp = (date: Date) =>
	new Intl.DateTimeFormat('sv-SE', {
		timeZone: SITE_TIMEZONE,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);

export async function GET(context: APIContext) {
	const notes = await getNotes();
	const site = context.site!;

	return rss({
		title: `${SITE_TITLE} · 想法`,
		description: '短想法，全文输出。',
		site,
		items: notes.map((note) => {
			// 想法没有独立页面，链接指向 /notes/ 上的锚点。
			const link = `/notes/#note-${note.id}`;
			const html = note.rendered?.html ?? '';
			return {
				title: stamp(note.data.date),
				pubDate: note.data.date,
				description: html.replace(/<[^>]+>/g, '').trim().slice(0, 200),
				categories: note.data.tags,
				link,
				content: html ? absolutizeLinks(html, new URL(link, site)) : undefined,
			};
		}),
		// 想法的 link 以 #锚点结尾，不能让 @astrojs/rss 再补一个尾斜杠。
		trailingSlash: false,
		customData: `<language>${SITE_LANG}</language>`,
	});
}
