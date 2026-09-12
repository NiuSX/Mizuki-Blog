import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 解析项目根目录（当前脚本位于 scripts/ 下，所以向上一级）
const projectRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);
// 构建产物目录
const distDirectory = path.join(projectRoot, "dist");

/**
 * 从 HTML 标签字符串中提取指定属性的值
 * 支持双引号、单引号、无引号三种写法
 * @param {string} tag - 完整的 HTML 标签字符串，如 <link rel="stylesheet" href="a.css">
 * @param {string} name - 属性名，如 "href"、"rel"
 * @returns {string|undefined} 属性值，找不到则返回 undefined
 */
function getAttribute(tag, name) {
	const match = tag.match(
		new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
	);
	return match?.[1] ?? match?.[2] ?? match?.[3];
}

/**
 * 读取指定页面，并收集它引用的所有 CSS（内联 + 外链）
 * @param {string} htmlPath - 相对于 dist 的页面路径，如 "about/index.html"
 * @returns {Promise<{html: string, loadedCss: string, stylesheetUrls: string[]}>}
 *   - html: 页面原始 HTML
 *   - loadedCss: 页面用到的所有 CSS 内容拼接（内联样式 + 外链样式文件内容）
 *   - stylesheetUrls: 页面引用的外链样式表 URL 列表
 */
async function loadPageStyles(htmlPath) {
	const html = await readFile(path.join(distDirectory, htmlPath), "utf8");

	// 1. 从 HTML 中找出所有 <link> 标签
	// 2. 只保留 rel 包含 "stylesheet" 的
	// 3. 取出它们的 href
	const stylesheetUrls = [...html.matchAll(/<link\b[^>]*>/gi)]
		.map(([tag]) => ({
			href: getAttribute(tag, "href"),
			rel: getAttribute(tag, "rel"),
		}))
		.filter(
			({ href, rel }) =>
				href && rel?.split(/\s+/).some((value) => value === "stylesheet"),
		)
		.map(({ href }) => href);

	// 提取页面中所有 <style>...</style> 的内联样式内容，拼接成字符串
	const inlineStyles = [
		...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi),
	]
		.map((match) => match[1])
		.join("\n");

	// 读取每个外链样式表的实际内容
	const linkedStyles = await Promise.all(
		stylesheetUrls.map(async (stylesheetUrl) => {
			// 去掉 query / hash，并解码 URL 编码
			const pathname = decodeURIComponent(stylesheetUrl.split(/[?#]/, 1)[0]);

			// 跳过外部链接（http/https//）和 data URI，这些不是本地文件
			if (
				/^(?:[a-z]+:)?\/\//i.test(pathname) ||
				pathname.startsWith("data:")
			) {
				return "";
			}

			// 将 URL 路径解析为 dist 下的实际文件路径
			const assetPath = path.resolve(
				distDirectory,
				pathname.startsWith("/") ? pathname.slice(1) : pathname,
			);

			// 安全检查：确保解析后的路径没有逃出 dist 目录（防目录穿越）
			const relativePath = path.relative(distDirectory, assetPath);
			if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
				throw new Error(
					`Stylesheet escapes dist directory: ${stylesheetUrl}`,
				);
			}

			// 读取该 CSS 文件内容
			return readFile(assetPath, "utf8");
		}),
	);

	return {
		html,
		loadedCss: `${inlineStyles}\n${linkedStyles.join("\n")}`,
		stylesheetUrls,
	};
}

// 要校验的页面清单
// requiredMarkup: 页面 HTML 里必须出现的标记（字符串）
// requiredRules:  加载的 CSS 里必须出现的规则/变量（字符串）
const pages = [
	{
		name: "Homepage",
		htmlPath: "index.html",
		requiredMarkup: [],
		requiredRules: [
			["--page-bg:", "page background variable"],
			["--card-bg:", "card background variable"],
			["--radius-large:", "shared radius variable"],
			["#banner-carousel", "banner layout styles"],
			[".widget-container", "responsive widget styles"],
		],
	},
	{
		name: "About page",
		htmlPath: "about/index.html",
		requiredMarkup: [],
		requiredRules: [
			[".card-github", "GitHub repository card styles"],
			[".custom-md .image-grid", "extended Markdown layout styles"],
		],
	},
];

// 逐个页面执行校验
for (const page of pages) {
	const { html, loadedCss, stylesheetUrls } = await loadPageStyles(page.htmlPath);

	// 检查 HTML 中缺失的标记
	const missingMarkup = page.requiredMarkup
		.filter(([token]) => !html.includes(token))
		.map(([, description]) => description);

	// 检查 CSS 中缺失的规则
	const missingRules = page.requiredRules
		.filter(([token]) => !loadedCss.includes(token))
		.map(([, description]) => description);

	// 只要有任何一项缺失，就抛错并列出缺失内容和已加载的样式表
	if (missingMarkup.length > 0 || missingRules.length > 0) {
		const loadedStylesheets = stylesheetUrls.join(", ") || "none";
		const missing = [
			...missingMarkup.map((description) => `${description} markup`),
			...missingRules,
		];
		throw new Error(
			`${page.name} is missing: ${missing.join(", ")}. ` +
				`Loaded stylesheets: ${loadedStylesheets}`,
		);
	}

	// 全部通过，打印成功信息
	console.log(
		`Verified ${page.name.toLowerCase()} styles across ` +
			`${stylesheetUrls.length} linked stylesheet(s).`,
	);
}