# 个人写作站

Astro 静态站，部署在 Cloudflare Workers（push 到 `main` 自动构建，输出目录 `dist`）。
不做评论、搜索、统计，**不引入任何第三方脚本** —— 构建产物里应该是零 `<script>` 标签，
改动时请保持这一点。

## 开发

启动 dev server 用后台模式：

```
astro dev --background
```

用 `astro dev stop` / `astro dev status` / `astro dev logs` 管理。

> 注意：`astro dev stop` 只会停掉它自己记录的那个进程。如果改了样式或 content config
> 后页面没更新，先确认 4321 端口上没有残留的孤儿进程：
> `lsof -nP -iTCP:4321 -sTCP:LISTEN`，必要时直接 kill 掉再重启。

## 内容

两个 collection，都在 `src/content/`，schema 在 `src/content.config.ts`。

**`essays/`** —— 长文，一篇一个 `.md`，文件名就是 URL slug（`/essays/<文件名>/`）：

```yaml
---
title: 标题
date: 2026-08-12          # 只到日期，按 UTC 格式化
tags: [写作, 互联网]        # 可选，默认 []
lang: zh                  # zh | en，默认 zh；en 会让文章页 <html lang="en">
draft: false              # 可选，默认 false
description: 一句话摘要     # 可选，用于 meta description 和 RSS，不写就退回 title
---
```

**`notes/`** —— 想法，一条一个 `.md`，正文可以只有三行、没有标题：

```yaml
---
date: 2026-09-05T21:40:00-07:00   # 带时区偏移
tags: [写作]                       # 可选
---
```

想法**没有独立页面**，只有 `/notes/` 上的锚点 `#note-<文件名>`。

新增一条想法用脚本，别手写文件名：

```
npm run new-note -- "内容" --tag 写作
./scripts/new-note.mjs "内容"
echo "内容" | ./scripts/new-note.mjs
```

## 几个约定

**draft**：`draft: true` 的文件 `npm run build` 不构建，但 `npm run dev` 下可见并标注
「草稿」，方便本地预览。逻辑在 `src/lib/collections.ts`，靠 `import.meta.env.DEV` 区分。
RSS 行为一致。

**时间**：`src/consts.ts` 的 `SITE_TIMEZONE` 决定带时间的时间戳（想法）怎么显示，
跟构建机器的时区无关。长文只有日期，按 UTC 格式化，避免跨时区差一天。改站点时区
只改这一个常量。

**tag 的 URL**：`src/lib/tags.ts` 里的 `TAG_SLUGS` 把中文 tag 映射成 ASCII slug
（`写作` → `/essays/tag/writing/`）。frontmatter 里照常写中文。
- 纯 ASCII 的 tag 自动规范化，不用登记
- 没登记的非 ASCII tag **只警告不中断**，兜底成确定性哈希 `tag-<hash>`，URL 难看是
  提醒你回来补一条
- 两个 tag 撞同一个 slug **会中断构建**

**RSS**：两条独立 feed，`/essays/rss.xml` 和 `/notes/rss.xml`，都是全文输出。
`src/lib/rss.ts` 负责把正文里的相对链接和脚注锚点转成绝对地址，否则在阅读器里是死链。
两条 feed 的 `trailingSlash` 设置不同 —— 长文要补尾斜杠对齐 canonical，想法的 link 以
`#锚点` 结尾不能补。

**脚注**：`[^1]` 直接可用。Astro 7 的 Markdown 处理器是 Sätteri，**老的
`markdown.remarkRehype` 配置已经失效**，脚注文案在 `astro.config.mjs` 里通过
`satteri({ features: { gfm: { footnotes: { label, backLabel } } } })` 配置。
这是全站设置，`lang: en` 的文章也会用这套中文文案（该标题是 `sr-only`，只有读屏软件读到）。

## 样式

一份 `src/styles/global.css`，没有框架。系统字体栈（不自托管字体），正文 680px，
行距 1.7，深浅色跟系统（`prefers-color-scheme` + 六个 CSS 变量）。

页头、正文、页脚的宽度基线用 `body > header / body > main / body > footer` 选择器。
**必须限定成 body 的直接子元素** —— 文章内也有 `<header>`，裸 `header` 选择器会让
标题比正文多缩进一个 gutter。

## 部署前改这些

`src/consts.ts`：`SITE_TITLE`、`SITE_DESCRIPTION`、`SITE_TIMEZONE`。
`astro.config.mjs`：换域名时改 `site`。

## 文档

https://docs.astro.build
