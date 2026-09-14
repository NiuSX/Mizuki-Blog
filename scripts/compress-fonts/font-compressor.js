// 导入 Node.js 文件系统模块，用于读写文件、目录操作
import fs from "node:fs";
// 导入 Node.js 路径模块，用于处理文件路径
import path from "node:path";
// 导入 Fontmin 字体压缩库，用于字体子集化和格式转换
import Fontmin from "fontmin";
// 从工具模块导入项目根目录常量
import { ROOT_DIR } from "./utils.js";
// 从配置解析模块导入字体配置读取函数
import { getFontConfigs } from "./config-parser.js";
// 从文本收集模块导入：
// - collectText: 收集项目中所有需要的中日韩等 CJK 字符
// - getAsciiCharset: 获取 ASCII 字符集
import { collectText, getAsciiCharset } from "./text-collector.js";

/**
 * 压缩字体并输出到 dist 目录
 *
 * 主要流程：
 * 1. 读取 siteConfig 中的字体配置（仅含 enableCompress=true 的字体）
 * 2. 收集项目实际用到的文本（CJK 文本 / ASCII 字符集）
 * 3. 对每个字体文件：
 *    - ttf/otf：使用 Fontmin 做 glyph 子集化 + 转 woff2 压缩
 *    - woff/woff2：已是 web 优化格式，直接拷贝到 dist
 *    - 其他格式：跳过
 * 4. 统计压缩前后体积，输出汇总信息
 * 5. 若存在配置错误（如字体文件缺失），列出可用字体并终止构建
 */
export async function compressFonts() {
	try {
		// 读取需要压缩的字体配置（仅 enableCompress=true 且 localFonts 非空）
		const fonts = getFontConfigs();

		// 没有需要压缩的字体时直接退出（属于正常情况，不报错）
		if (fonts.length === 0) {
			console.log(
				"⚠ No fonts to compress (enableCompress=false or localFonts is empty)",
			);
			return;
		}

		// 打印需要处理的字体配置数量
		console.log(`Found ${fonts.length} font configs to compress`);

		// dist 构建输出目录
		const distDir = path.join(ROOT_DIR, "dist");
		// 若 dist 不存在，说明尚未执行 astro build，提示后退出
		if (!fs.existsSync(distDir)) {
			console.log(
				"⚠ dist directory does not exist, please run astro build first",
			);
			return;
		}

		// dist 中的字体输出目录
		const distFontDir = path.join(distDir, "assets/font");
		// 若不存在则递归创建
		if (!fs.existsSync(distFontDir)) {
			fs.mkdirSync(distFontDir, { recursive: true });
		}

		// 收集项目中实际使用到的 CJK 文本（用于字体子集化）
		const cjkText = await collectText();
		// 获取 ASCII 字符集（用于 asciiFont 类型字体的子集化）
		const asciiText = getAsciiCharset();

		console.log("Starting font compression...");

		// 原始字体总大小（字节）
		let totalOriginalSize = 0;
		// 压缩后总大小（字节）
		let totalCompressedSize = 0;
		// 成功处理的字体数量
		let processedCount = 0;
		// 收集配置错误信息，最终统一展示并终止
		const errors = [];

		// 遍历所有字体配置
		for (const fontConfig of fonts) {
			// 根据字体类型选择子集化文本：
			// - asciiFont 使用 ASCII 字符集
			// - cjkFont 使用收集到的 CJK 文本
			const text =
				fontConfig.type === "asciiFont" ? asciiText : cjkText;

			// 遍历当前配置中的所有字体文件
			for (const fontFile of fontConfig.files) {
				// 字体源文件路径（public/assets/font 下）
				const fontSrc = path.join(
					ROOT_DIR,
					"public/assets/font",
					fontFile,
				);
				// 获取扩展名（小写）
				const ext = path.extname(fontFile).toLowerCase();
				// 获取不带扩展名的基础文件名
				const baseName = path.basename(fontFile, ext);

				// 若字体源文件不存在，构造详细的错误提示并记录
				if (!fs.existsSync(fontSrc)) {
					const errorMsg = `❌ Config error [${fontConfig.type}]: Font file does not exist\n   In config: "${fontFile}"\n   Expected path: public/assets/font/${fontFile}\n\n   Please check:\n   1. Is the filename correct (case sensitive)?\n   2. Is the file in public/assets/font/?\n   3. Is ${fontConfig.type}.localFonts in src/config/siteConfig.ts correct?`;
					errors.push(errorMsg);
					console.log(`\n${errorMsg}\n`);
					continue;
				}

				// 记录原始文件大小
				const originalSize = fs.statSync(fontSrc).size;
				totalOriginalSize += originalSize;

				// 已是 web 优化格式（woff/woff2）：无需压缩，直接拷贝
				if (ext === ".woff2" || ext === ".woff") {
					console.log(
						`⚠ Skipping ${fontFile} (already web-optimized format)`,
					);
					fs.copyFileSync(fontSrc, path.join(distFontDir, fontFile));
					totalCompressedSize += originalSize;
				} else if (ext === ".ttf" || ext === ".otf") {
					// ttf/otf 格式：使用 Fontmin 子集化 + 转 woff2
					console.log(`Compressing ${fontFile}...`);

					const fontmin = new Fontmin()
						// 指定源字体文件
						.src(fontSrc)
						.use(
							// glyph 插件：按实际使用的文本做子集化，去除无用字形
							Fontmin.glyph({
								text,
								hinting: false,
							}),
						)
						.use(
							// ttf2woff2 插件：转换为 woff2 格式
							// clone: false —— 不保留原始 ttf 文件
							// deflate: true —— 启用压缩
							Fontmin.ttf2woff2({
								clone: false,
								deflate: true,
							}),
						)
						// 输出目录
						.dest(distFontDir);

					// 使用 Promise 封装 Fontmin 的回调式 run 方法，便于 await
					await new Promise((resolve, reject) => {
						fontmin.run((err, files) => {
							if (err) reject(err);
							else resolve(files);
						});
					});

					// 压缩后的 woff2 文件路径
					const compressedFile = path.join(
						distFontDir,
						`${baseName}.woff2`,
					);

					// 若压缩成功（woff2 文件已生成），统计并打印压缩率
					if (fs.existsSync(compressedFile)) {
						const compressedSize =
							fs.statSync(compressedFile).size;
						totalCompressedSize += compressedSize;
						// 计算体积缩减百分比
						const reduction = (
							(1 - compressedSize / originalSize) *
							100
						).toFixed(2);
						console.log(
							`✓ ${fontFile} → ${baseName}.woff2 (${(compressedSize / 1024).toFixed(2)} KB, reduced ${reduction}%)`,
						);
						processedCount++;
					}
				} else {
					// 其他不支持的字体格式，跳过
					console.log(
						`⚠ Unsupported font format, skipping: ${fontFile}`,
					);
				}
			}
		}

		// 若存在配置错误，汇总展示后终止进程
		if (errors.length > 0) {
			console.log("\n❌ Font compression encountered errors!");
			console.log(`${errors.length} errors, please fix and retry.\n`);

			// 列出字体目录中实际可用的字体文件，便于用户排查
			const fontDir = path.join(ROOT_DIR, "public/assets/font");
			if (fs.existsSync(fontDir)) {
				const actualFiles = fs
					.readdirSync(fontDir)
					.filter((f) =>
						[".ttf", ".otf", ".woff", ".woff2"].includes(
							path.extname(f).toLowerCase(),
						),
					);
				if (actualFiles.length > 0) {
					console.log("Available font files:");
					for (const f of actualFiles) console.log(`  - ${f}`);
				} else {
					console.log("  (font directory is empty)");
				}
			}

			// 以非零退出码终止，提示构建失败
			process.exit(1);
		}

		// 输出最终汇总信息
		if (processedCount > 0) {
			// 整体体积缩减百分比
			const totalReduction = (
				(1 - totalCompressedSize / totalOriginalSize) *
				100
			).toFixed(2);
			console.log("\n✓ Font optimization complete!");
			console.log(
				`  Files processed: ${processedCount}, Overall reduction: ${totalReduction}%`,
			);
		} else {
			console.log("\n⚠ No font files processed");
		}
	} catch (error) {
		// 捕获所有异常，打印错误并以非零码退出
		console.error("❌ Font compression failed:", error);
		process.exit(1);
	}
}