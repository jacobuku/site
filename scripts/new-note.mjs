#!/usr/bin/env node
// 生成一条想法：
//   npm run new-note -- "内容"
//   ./scripts/new-note.mjs "内容" --tag 写作 --tag 工具
//   echo "内容" | ./scripts/new-note.mjs
// 文件名和 date 用本地时间，date 带上时区偏移，所以在任何机器上构建显示都一样。

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const NOTES_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content', 'notes');

function parseArgs(argv) {
	const tags = [];
	const words = [];
	for (let i = 0; i < argv.length; i++) {
		if (argv[i] === '--tag' || argv[i] === '-t') {
			const tag = argv[++i];
			if (!tag) fail('--tag 后面要跟一个 tag 名。');
			tags.push(tag);
		} else {
			words.push(argv[i]);
		}
	}
	return { tags, body: words.join(' ').trim() };
}

function fail(message) {
	console.error(message);
	process.exit(1);
}

function pad(n) {
	return String(n).padStart(2, '0');
}

// 2026-09-09T14:30:00+08:00
function isoWithOffset(d) {
	const offsetMinutes = -d.getTimezoneOffset();
	const sign = offsetMinutes >= 0 ? '+' : '-';
	const abs = Math.abs(offsetMinutes);
	const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
	return `${stamp}${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

// YYYY-MM-DD-HHmm，同一分钟内重复就加 -2、-3
function uniquePath(d) {
	const base = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
	let candidate = path.join(NOTES_DIR, `${base}.md`);
	for (let n = 2; existsSync(candidate); n++) {
		candidate = path.join(NOTES_DIR, `${base}-${n}.md`);
	}
	return candidate;
}

const { tags, body: argBody } = parseArgs(process.argv.slice(2));
const body = argBody || (process.stdin.isTTY ? '' : (await readFile(0, 'utf8')).trim());

if (!body) {
	fail('用法: npm run new-note -- "内容" [--tag 标签]');
}

const now = new Date();
const frontmatter = ['---', `date: ${isoWithOffset(now)}`];
if (tags.length > 0) {
	frontmatter.push(`tags: [${tags.join(', ')}]`);
}
frontmatter.push('---');

const file = uniquePath(now);
await mkdir(NOTES_DIR, { recursive: true });
await writeFile(file, `${frontmatter.join('\n')}\n\n${body}\n`, 'utf8');

console.log(path.relative(process.cwd(), file));
