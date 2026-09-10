// @ts-check

import { satteri } from '@astrojs/markdown-satteri';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://ziko.page',
	integrations: [sitemap()],
	markdown: {
		processor: satteri({
			features: {
				gfm: {
					// 脚注（[^1]）默认就开着，这里只是把给读屏软件的文案换成中文。
					// 标题 <h2 class="sr-only"> 视觉上不显示，页尾靠一条分隔线区分。
					// 注意这是全站设置，lang: en 的文章也用这套中文文案。
					footnotes: {
						label: '脚注',
						backLabel: '返回正文引用 {reference}',
					},
				},
			},
		}),
	},
});
