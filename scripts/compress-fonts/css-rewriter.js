// 导入 Node.js 文件系统模块，用于读写文件和目录操作
import fs from "node:fs";
// 导入 Node.js 路径模块，用于处理文件路径
import path from "node:path";
// 从工具模块导入项目根目录常量和递归读取文件的工具函数
import { ROOT_DIR, readFilesRecursively } from "./utils.js";
// 从配置解析模块导入字体配置读取函数
import { getFontConfigs } from "./config-parser.js";

/**
 * 更新 dist 目录中的 CSS 文件，将 ttf 字体引用替换为 woff2
 * 主要逻辑：
 * 1. 遍历 siteConfig 中配置的字体，尝试用 woff2 替换 CSS 中的 ttf 引用
 * 2. 处理用户直接放在 public/assets/font 目录但未在配置中声明的 woff2 字体
 * 全部过程使用 try-catch 包裹，避免构建流程因错误中断
 */
export async function updateCssFontReferences() {
	try {
		// 从 siteConfig.ts 读取需要处理的字体配置（仅含 enableCompress=true 且指定 localFonts 的字体）
		const fonts = getFontConfigs();
		// dist 构建输出目录
		const distDir = path.join(ROOT_DIR, "dist/");
		// 公共字体源目录（存放 woff2 / ttf 等字体文件）
		const publicFontDir = path.join(ROOT_DIR, "public/assets/font");

		// 递归读取 dist 目录下所有以 .css 结尾的文件
		const cssFiles = readFilesRecursively(distDir).filter((f) =>
			f.endsWith(".css"),
		);

		// 若 dist 中没有 CSS 文件，说明还未构建或构建异常，打印警告并退出
		if (cssFiles.length === 0) {
			console.log("⚠ No CSS files found in dist");
			return;
		}

		// ===== 第一部分：处理 siteConfig 中配置的字体 =====
		for (const fontConfig of fonts) {
			// 遍历当前字体配置中的所有字体文件
			for (const fontFile of fontConfig.files) {
				// 获取字体文件的扩展名（如 .ttf）并转为小写
				const ext = path.extname(fontFile).toLowerCase();
				// 获取不带扩展名的基础文件名，如 "SourceHanSans"
				const baseName = path.basename(fontFile, ext);
				// 推测对应的 woff2 文件名
				const woff2File = `${baseName}.woff2`;

				// 检查 dist 输出目录中是否存在同名 woff2
				const distWoff2 = path.join(
					ROOT_DIR,
					`dist/assets/font/${woff2File}`,
				);
				// 检查 public 字体源目录中是否存在同名 woff2
				const publicWoff2 = path.join(
					publicFontDir,
					`${baseName}.woff2`,
				);
				// 只要两个目录中任意一个存在 woff2，就认为可以替换
				const hasWoff2 =
					fs.existsSync(distWoff2) || fs.existsSync(publicWoff2);

				// 若没有找到对应的 woff2 文件，则保留 ttf 引用，跳过当前字体
				if (!hasWoff2) {
					console.log(
						`⚠ No woff2 found for ${baseName}, keeping ttf reference`,
					);
					continue;
				}

				// 遍历所有 CSS 文件，尝试替换其中的 ttf 引用
				for (const cssFile of cssFiles) {
					// 读取 CSS 文件内容
					let cssContent = fs.readFileSync(cssFile, "utf-8");
					// 保存原始内容用于对比是否发生替换
					const originalContent = cssContent;

					// 构建匹配 ttf 引用的正则：
					// url("/assets/font/xxx.ttf") format("truetype")
					// 兼容单引号/双引号/无引号，以及中间的空格
					const ttfPattern = new RegExp(
						`url\\(["']?/assets/font/${baseName}\\.ttf["']?\\)\\s*format\\(["']truetype["']\\)`,
						"g",
					);

					// 根据字体配置决定替换策略
					if (fontConfig.enableCompress) {
						// 启用压缩：直接替换为 woff2（丢弃 ttf 回退）
						cssContent = cssContent.replace(
							ttfPattern,
							`url("/assets/font/${woff2File}") format("woff2")`,
						);
					} else if (fs.existsSync(publicWoff2)) {
						// 未启用压缩但存在 woff2：优先 woff2，回退 ttf
						cssContent = cssContent.replace(
							ttfPattern,
							`url("/assets/font/${woff2File}") format("woff2"), url("/assets/font/${baseName}.ttf") format("truetype")`,
						);
					}

					// 仅当内容发生变化时才写回文件，减少不必要的 I/O
					if (cssContent !== originalContent) {
						fs.writeFileSync(cssFile, cssContent);
						console.log(
							`✓ Updated CSS: ${cssFile} (${baseName})`,
						);
					}
				}
			}
		}

		// ===== 第二部分：处理未在 config 中配置、但用户直接放在 font 目录的 woff2 =====
		// 若公共字体目录不存在，直接返回
		if (!fs.existsSync(publicFontDir)) return;
		// 读取公共字体目录下的所有文件
		const publicFiles = fs.readdirSync(publicFontDir);

		for (const file of publicFiles) {
			// 只处理 .woff2 文件
			if (!file.endsWith(".woff2")) continue;
			// 获取 woff2 文件的基础名（不含扩展名）
			const baseName = path.basename(file, ".woff2");
			// 推测同名的 ttf 文件名
			const ttfFile = `${baseName}.ttf`;

			// 检查该字体是否已经在 siteConfig 的 fonts 配置中处理过
			const isConfigured = fonts.some((fc) =>
				fc.files.some(
					(f) => path.basename(f, path.extname(f)) === baseName,
				),
			);
			// 若已处理过，跳过，避免重复替换
			if (isConfigured) continue;

			// 遍历所有 CSS 文件，尝试替换其中的 ttf 引用
			for (const cssFile of cssFiles) {
				// 读取 CSS 文件内容
				let cssContent = fs.readFileSync(cssFile, "utf-8");
				// 构建匹配 ttf 引用的正则（同第一部分的逻辑）
				const ttfPattern = new RegExp(
					`url\\(["']?/assets/font/${baseName}\\.ttf["']?\\)\\s*format\\(["']truetype["']\\)`,
					"g",
				);

				// 仅当 CSS 中确实包含该 ttf 引用时才进行替换
				if (cssContent.match(ttfPattern)) {
					// 替换为 woff2 优先、ttf 回退的双格式写法
					cssContent = cssContent.replace(
						ttfPattern,
						`url("/assets/font/${file}") format("woff2"), url("/assets/font/${ttfFile}") format("truetype")`,
					);
					// 写回 CSS 文件并打印日志
					fs.writeFileSync(cssFile, cssContent);
					console.log(
						`✓ Updated CSS: ${cssFile} (${baseName} - woff2 fallback)`,
					);
				}
			}
		}
	} catch (error) {
		// 捕获所有异常，仅打印错误信息，不中断整体构建流程
		console.error("⚠ CSS font reference update failed:", error.message);
	}
}