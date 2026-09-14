// 从 Node.js Promise 版 fs 模块导入：读取目录、读取文件、获取文件信息
import { readdir, readFile, stat } from "node:fs/promises";
// 从 Node.js 路径模块导入：取目录名、扩展名、拼接、解析为绝对路径
import { dirname, extname, join, resolve } from "node:path";
// 导入 URL 转换工具，将 import.meta.url 转为文件路径
import { fileURLToPath } from "node:url";

// 项目根目录：当前脚本位于 scripts/xxx/ 下，向上回退一级
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// 构建产物目录
const distDir = resolve(projectRoot, "dist");
// 自定义字体输出的体积预算：8 MB
const MAX_CUSTOM_FONT_BYTES = 8 * 1024 * 1024;
// Astro 资源路径的标志性片段（如 /_astro/fonts/xxx.woff2）
const ASTRO_ASSET_SEGMENT = "/_astro/";
// 匹配字体文件引用的正则：
// - 匹配不以空白/引号/括号/尖括号开头的连续字符
// - 以 .woff/.woff2/.ttf/.otf 结尾
// - 可选带 ?query 或 #hash
// - i 忽略大小写、g 全局匹配
const FONT_REFERENCE_PATTERN =
	/[^\s"'()<>]+?\.(?:woff2?|ttf|otf)(?:[?#][^\s"'()<>]*)?/gi;
// 匹配自定义字体 CSS 变量声明（如 --font-body: ...、--font-cjk: ...、--font-jetbrains-mono: ...）
// 只有包含这些变量的样式块才需要检查其中的字体引用
const CUSTOM_FONT_VARIABLE_PATTERN =
	/--font-(?:body|cjk|jetbrains-mono)\s*:/;
// 匹配 <style> ... </style> 块，捕获其内部内容
// g 全局匹配、i 忽略大小写
const STYLE_BLOCK_PATTERN = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;

/**
 * 递归收集目录下所有文件的绝对路径
 * @param {string} directory 起始目录
 * @returns {Promise<string[]>} 所有文件的路径数组
 */
async function collectFiles(directory) {
	// 读取目录条目，withFileTypes 使 entry 带 isDirectory() 等方法
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			// 目录则递归收集并合并结果
			files.push(...(await collectFiles(path)));
		} else {
			// 文件则直接加入结果
			files.push(path);
		}
	}

	return files;
}

/**
 * 将 HTML/CSS 中的字体引用解析为 dist 中的实际文件路径
 * 支持多种引用形式：
 *   - 绝对 URL（http:// 或 //cdn...）
 *   - 站点根路径（/_astro/...）
 *   - 相对路径（_astro/...）
 * @param {string} reference 原始引用字符串
 * @returns {string|undefined} dist 中的绝对文件路径；无法解析时返回 undefined
 */
function resolveAstroAssetPath(reference) {
	let pathname = reference;
	// 处理协议相对/绝对 URL：用占位域名解析出 pathname
	if (/^(?:https?:)?\/\//i.test(reference)) {
		try {
			pathname = new URL(reference, "https://assets.invalid").pathname;
		} catch {
			// URL 非法，无法解析
			return undefined;
		}
	} else {
		// 非 URL：去掉 ?query 和 #hash
		pathname = reference.split(/[?#]/, 1)[0];
	}

	// 解码 URL 编码（如 %20 → 空格），并统一 Windows 反斜杠为正斜杠
	try {
		pathname = decodeURIComponent(pathname).replace(/\\/g, "/");
	} catch {
		// 非法编码（如孤立的 %），无法解析
		return undefined;
	}

	// 查找 /_astro/ 片段位置
	const segmentIndex = pathname.indexOf(ASTRO_ASSET_SEGMENT);
	// 计算相对于 dist 的路径：
	// - 若含 /_astro/，取其后的部分（如 fonts/xxx.woff2）
	// - 若以 _astro/ 开头，直接用整个 pathname
	// - 否则视为非 Astro 资源，返回 undefined
	const relativePath =
		segmentIndex >= 0
			? pathname.slice(segmentIndex + 1)
			: pathname.startsWith("_astro/")
				? pathname
				: undefined;
	if (!relativePath) return undefined;

	// 拼接到 dist 目录，得到实际文件路径
	return join(distDir, ...relativePath.split("/"));
}

/**
 * 从文件内容中提取"自定义字体"相关的样式块
 * - .css 文件：若整体包含字体变量声明，则整个内容作为一个块
 * - .html 文件：提取所有含字体变量声明的 <style> 块
 * @param {string} path 文件路径
 * @param {string} content 文件内容
 * @returns {string[]} 含自定义字体变量声明的样式块数组
 */
function getCustomFontBlocks(path, content) {
	if (extname(path) === ".css") {
		// CSS 文件：内容中只要出现目标字体变量，就整体作为待检查块
		return CUSTOM_FONT_VARIABLE_PATTERN.test(content) ? [content] : [];
	}

	// HTML 文件：提取所有 <style> 块，再过滤出含字体变量声明的块
	return [...content.matchAll(STYLE_BLOCK_PATTERN)]
		.map((match) => match[1])
		.filter((block) => CUSTOM_FONT_VARIABLE_PATTERN.test(block));
}

// ===== 主流程 =====

// 收集 dist 中所有文件
const outputFiles = await collectFiles(distDir);
// 只关注 .html 和 .css（字体引用可能出现在这两类文件中）
const searchableFiles = outputFiles.filter((path) =>
	[".html", ".css"].includes(extname(path)),
);
// 收集所有自定义字体引用：{ path, url, assetPath }
const customFontReferences = [];

for (const path of searchableFiles) {
	const content = await readFile(path, "utf8");
	// 逐个样式块扫描字体引用
	for (const block of getCustomFontBlocks(path, content)) {
		for (const match of block.matchAll(FONT_REFERENCE_PATTERN)) {
			const assetPath = resolveAstroAssetPath(match[0]);
			if (assetPath) {
				customFontReferences.push({ path, url: match[0], assetPath });
			}
		}
	}
}

// ===== 检查 1：禁止 TTF 引用 =====
// 项目要求自定义字体必须为 woff2 格式（体积更小），TTF 一律不允许
const ttfReferences = customFontReferences.filter(({ url }) =>
	/\.ttf(?:$|[?#])/i.test(url),
);
if (ttfReferences.length > 0) {
	throw new Error(
		`Custom TTF references are not allowed:\n${ttfReferences
			.map(({ path, url }) => `- ${path}: ${url}`)
			.join("\n")}`,
	);
}

// 去重：同一个物理文件可能被多个文件多次引用
// Map<assetPath, url> 保证每个文件只统计一次体积
const referencedFontFiles = new Map();
for (const reference of customFontReferences) {
	referencedFontFiles.set(reference.assetPath, reference.url);
}

// ===== 检查 2：统计自定义字体总体积 =====
let customFontBytes = 0;
for (const [path, url] of referencedFontFiles) {
	try {
		const file = await stat(path);
		// 引用的资源必须是文件（而非目录）
		if (!file.isFile()) {
			throw new Error(`Referenced custom font is not a file: ${url}`);
		}
		customFontBytes += file.size;
	} catch (error) {
		// 文件不存在 → 说明引用了未产出的资源，构建异常
		if (error?.code === "ENOENT") {
			throw new Error(`Referenced custom font asset was not emitted: ${url}`);
		}
		throw error;
	}
}

// 超出 8MB 预算则报错，防止自定义字体拖垮页面加载性能
if (customFontBytes > MAX_CUSTOM_FONT_BYTES) {
	throw new Error(
		`Custom font output is ${customFontBytes} bytes; budget is ${MAX_CUSTOM_FONT_BYTES} bytes.`,
	);
}

// ===== 检查 3：system 模式下不得有自定义字体引用 =====
// 当用户选择系统字体模式时，站点应完全依赖系统字体，不应输出任何自定义字体
if (
	process.env.MIZUKI_FONT_MODE === "system" &&
	customFontReferences.length > 0
) {
	throw new Error("System font mode must not emit Astro custom font references.");
}

// 全部检查通过，打印统计摘要
console.log(
	`Font loading check passed: ${customFontReferences.length} references, ${referencedFontFiles.size} files, ${customFontBytes} bytes.`,
);