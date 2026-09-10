// 把渲染好的文章 HTML 里的相对链接改成绝对链接。
//
// RSS 阅读器不知道站点是谁，相对路径（/essays/xxx/）和锚点（#user-content-fn-1，
// 也就是脚注的跳转）在阅读器里会指向它自己的域名，点了就是死链。
export function absolutizeLinks(html: string, pageUrl: URL): string {
	return html
		.replace(/(href|src)="\/(?!\/)/g, `$1="${pageUrl.origin}/`)
		.replace(/(href)="#/g, `$1="${pageUrl.href}#`);
}
