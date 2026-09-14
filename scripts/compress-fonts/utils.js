// 导入 Node.js 文件系统模块，用于文件读写和目录遍历
import fs from "node:fs";
// 导入 Node.js 路径模块，用于路径拼接与解析
import path from "node:path";
// 导入 URL 转换工具，用于将 ESM 的 import.meta.url 转换为文件路径
import { fileURLToPath } from "node:url";

// 当前模块文件的绝对路径（ESM 中没有 __filename，需通过 import.meta.url 转换）
export const __filename = fileURLToPath(import.meta.url);
// 当前模块所在目录的绝对路径
export const __dirname = path.dirname(__filename);
// 项目根目录：从当前文件（scripts/font-tools/utils.js）向上回退两级
export const ROOT_DIR = path.join(__dirname, "../..");

/**
 * 递归读取目录下所有文件
 * 会遍历所有子目录，返回所有文件的绝对路径数组
 * @param {string} dir 起始目录
 * @param {string[]} fileList 累积结果（递归时内部使用，外部调用可省略）
 * @returns {string[]} 所有文件的绝对路径数组
 */
export function readFilesRecursively(dir, fileList = []) {
	// 目录不存在时直接返回当前累积结果（避免抛异常）
	if (!fs.existsSync(dir)) return fileList;
	// 读取当前目录下的所有条目（文件 + 子目录）
	const files = fs.readdirSync(dir);
	for (const file of files) {
		// 拼接完整的子路径
		const filePath = path.join(dir, file);
		// 获取文件/目录的 stat 信息
		const stat = fs.statSync(filePath);
		if (stat.isDirectory()) {
			// 是目录则递归进入
			readFilesRecursively(filePath, fileList);
		} else {
			// 是文件则加入结果列表
			fileList.push(filePath);
		}
	}
	// 返回累积结果
	return fileList;
}

/**
 * 从文件内容中提取所有字符串字面量的字符
 * 统一替换 4 处重复代码 —— 供 data/config/constants/i18n 等多个采集函数复用
 * @param {string} content 源码文件内容
 * @param {Set<string>} targetSet 收集字符的目标集合
 */
export function extractStringsToSet(content, targetSet) {
	// 主要匹配：双引号、单引号、模板字符串
	// 每个正则都兼容转义字符（\\.）、换行（\\n）、制表符（\\t）
	const patterns = [
		/"([^"\\]|\\.|\\n|\\t)*"/g,   // 双引号字符串
		/'([^'\\]|\\.|\\n|\\t)*'/g,   // 单引号字符串
		/`([^`\\]|\\.|\\n|\\t)*`/g,   // 模板字符串
	];

	// 逐个正则模式匹配
	for (const pattern of patterns) {
		const matches = content.match(pattern);
		if (matches) {
			for (const match of matches) {
				let text = match;
				// 去除首尾引号（引号类型需配对）
				if (
					(text.startsWith('"') && text.endsWith('"')) ||
					(text.startsWith("'") && text.endsWith("'")) ||
					(text.startsWith("`") && text.endsWith("`"))
				) {
					text = text.slice(1, -1);
				}
				// 处理转义字符，还原为真实字符后再收集
				text = text
					.replace(/\\n/g, "\n")
					.replace(/\\t/g, "\t")
					.replace(/\\"/g, '"')
					.replace(/\\'/g, "'");
				// 逐字符加入集合（Set 自动去重）
				for (const char of text) {
					targetSet.add(char);
				}
			}
		}
	}

	// 简单正则作为补充：兜底捕获上面复杂正则可能遗漏的短字符串
	// 例如含嵌套引号或跨行等边界情况
	const simpleMatches = content.match(/["'`]([^"'`]+)["'`]/g);
	if (simpleMatches) {
		for (const match of simpleMatches) {
			// 去掉首尾引号（未做转义处理，作为补充手段）
			const text = match.slice(1, -1);
			for (const char of text) {
				targetSet.add(char);
			}
		}
	}
}

/**
 * 从 Markdown/MDX 内容中提取纯文本
 * 去除内容：frontmatter、代码块、行内代码、HTML 标签、Markdown 标记、URL
 * 同时会提取 frontmatter 中的文本（可能包含标题、标签等有价值字符）
 * @param {string} content 文件原始内容
 * @param {string} ext 文件扩展名（.md / .mdx / 其他）
 * @returns {string} 提取出的纯文本
 */
export function extractMarkdownText(content, ext) {
	let text = content;
	// 用于累积 frontmatter 中提取出的文本
	let frontmatterText = "";

	// 仅对 Markdown/MDX 文件做 frontmatter 与代码块处理
	if (ext === ".md" || ext === ".mdx") {
		// 匹配文件开头的 frontmatter 块：--- ... ---
		const frontmatterMatch = content.match(/^---[\s\S]*?---/m);
		if (frontmatterMatch) {
			const frontmatter = frontmatterMatch[0];

			// 提取无引号的 key: value（如 title: 我的文章）
			const unquoted = frontmatter.match(/^\s*\w+:\s*([^'"\n]+)$/gm);
			if (unquoted) {
				for (const match of unquoted) {
					// 去掉 "key:" 前缀，保留值
					const value = match.replace(/^\s*\w+:\s*/, "").trim();
					// 过滤掉布尔值、日期、纯数字等无意义值
					if (!value.match(/^(true|false|\d{4}-\d{2}-\d{2}|\d+)$/)) {
						frontmatterText += `${value} `;
					}
				}
			}

			// 提取带引号的值（如 title: "我的文章"）
			const quoted = frontmatter.match(/:\s*['"]([^'"]+)['"]/g);
			if (quoted) {
				for (const match of quoted) {
					// 去掉 ": " 前缀和引号，保留值
					const value = match.replace(/:\s*['"]([^'"]+)['"]/, "$1");
					frontmatterText += `${value} `;
				}
			}

			// 提取 YAML 列表项（如 tags: \n  - 标签1 \n  - 标签2）
			const listItems = frontmatter.match(/^\s*-\s*([^\n]+)$/gm);
			if (listItems) {
				for (const match of listItems) {
					// 去掉 "- " 前缀，保留值
					const value = match.replace(/^\s*-\s*/, "").trim();
					frontmatterText += `${value} `;
				}
			}
		}

		// 从正文中移除 frontmatter 块
		text = text.replace(/^---[\s\S]*?---\s*/m, "");
		// 移除围栏代码块 ``` ... ```
		text = text.replace(/```[\s\S]*?```/g, "");
		// 移除行内代码 `...`
		text = text.replace(/`[^`]+`/g, "");
	}

	// 通用清理步骤（Markdown 与 MDX 都适用）：
	// 移除 HTML 标签，用空格替换避免词粘连
	text = text.replace(/<[^>]*>/g, " ");
	// 移除 Markdown 标记符号（# * _ ~ ` [ ] ( )）
	text = text.replace(/[#*_~`[\]()]/g, " ");
	// 移除 URL
	text = text.replace(/https?:\/\/[^\s]+/g, "");
	// 合并连续空白为单个空格并去除首尾空白
	text = text.replace(/\s+/g, " ").trim();

	// 合并 frontmatter 提取的文本与正文提取的文本
	return `${frontmatterText} ${text}`.trim();
}

/**
 * CJK 字符正则
 * 覆盖范围：
 *   \u4e00-\u9fff  中日韩统一表意文字（常用汉字）
 *   \u3040-\u309f  平假名
 *   \u30a0-\u30ff  片假名
 *   \uac00-\ud7af  韩文音节
 *   \u3000-\u303f  CJK 标点符号
 *   \uff00-\uffef  全角字符
 * 注意：未加 g 标志，使用 test() 时每次只判断单个字符是否属于 CJK
 */
export const CJK_REGEX = /[一-鿿぀-ゟ゠-ヿ가-힯　-〿＀-￯]/;

/**
 * 将 Set 中的字符添加到目标 Set
 * 作用等价于两个 Set 求并集，但直接修改 target 而非返回新集合
 * @param {Set<string>} source 源集合
 * @param {Set<string>} target 目标集合（会被修改）
 */
export function mergeSet(source, target) {
	for (const char of source) {
		target.add(char);
	}
}