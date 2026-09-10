import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE_LANG, SITE_TITLE } from '../../consts';
import { getEssays } from '../../lib/collections';
import { absolutizeLinks } from '../../lib/rss';

export async function GET(context: APIContext) {
	const essays = await getEssays();
	const site = context.site!;

	return rss({
		title: `${SITE_TITLE} · 长文`,
		description: '长文全文输出。',
		site,
		items: essays.map((essay) => {
			const link = `/essays/${essay.id}/`;
			return {
				title: essay.data.title,
				pubDate: essay.data.date,
				description: essay.data.description ?? essay.data.title,
				categories: essay.data.tags,
				link,
				content: essay.rendered?.html
					? absolutizeLinks(essay.rendered.html, new URL(link, site))
					: undefined,
			};
		}),
		customData: `<language>${SITE_LANG}</language>`,
	});
}
