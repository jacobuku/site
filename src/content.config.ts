import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 长文：一篇一个 .md
const essays = defineCollection({
	loader: glob({ base: './src/content/essays', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		tags: z.array(z.string()).default([]),
		lang: z.enum(['zh', 'en']).default('zh'),
		draft: z.boolean().default(false),
		// 可选：用于 <meta description> 和 RSS 摘要，不写就退回标题
		description: z.string().optional(),
	}),
});

// 想法：一条一个 .md，正文可以只有三行、没有标题
const notes = defineCollection({
	loader: glob({ base: './src/content/notes', pattern: '**/*.md' }),
	schema: z.object({
		date: z.coerce.date(),
		tags: z.array(z.string()).default([]),
		draft: z.boolean().default(false),
	}),
});

export const collections = { essays, notes };
