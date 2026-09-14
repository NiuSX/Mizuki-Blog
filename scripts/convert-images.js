// 导入 sharp 图像处理库，用于格式转换与压缩
import sharp from "sharp";
// 导入 glob 文件匹配库，用于按通配符查找文件
import { glob } from "glob";
// 从路径模块导入：取目录名、扩展名
import { dirname, extname } from "node:path";
// 导入 URL 转换工具，将 import.meta.url 转为文件路径
import { fileURLToPath } from "node:url";
// 导入同步版 fs，用于文件存在性检查、stat、写入等操作
import fs from "node:fs";
// 导入完整路径模块
import path from "node:path";

// 当前脚本所在目录（ESM 环境下需通过 import.meta.url 转换）
const __dirname = dirname(fileURLToPath(import.meta.url));
// 项目根目录（脚本位于 scripts/ 下，向上一级）
const rootDir = path.join(__dirname, "..");
// public 静态资源目录，所有图片都以此为基准查找
const publicDir = path.join(rootDir, "public");

// 待转换的图片匹配模式清单（相对于 public 目录）
const targets = [
	"assets/home/*.png",        // 首页横幅类 PNG
	"assets/home/*.jpg",        // 首页横幅类 JPG
	"sakura.png",               // 樱花主题图
	"images/albums/**/*.jpg",   // 相册图片（含子目录）
	"images/albums/**/*.jpeg",  // 相册图片（jpeg 扩展名）
	"images/diary/*.jpg",       // 日记配图
	"images/device/*.png",      // 设备展示图
	"assets/music/cover/*.jpg", // 音乐封面
];

/**
 * 将单张图片转换为 WebP 格式
 * 若目标文件已存在且比源文件新，则跳过（增量转换）
 * @param {string} inputPath 输入图片的绝对路径
 * @param {number} [quality=85] WebP 压缩质量（0-100）
 */
async function convertToWebP(inputPath, quality = 85) {
	// 获取输入文件扩展名
	const ext = extname(inputPath);
	// 计算输出路径：将 .png/.jpg/.jpeg 替换为 .webp
	const outputPath = inputPath.replace(/\.(png|jpg|jpeg)$/i, ".webp");

	// 增量处理：若输出文件已存在且修改时间晚于输入文件，则跳过转换
	if (fs.existsSync(outputPath)) {
		const inputStat = fs.statSync(inputPath);
		const outputStat = fs.statSync(outputPath);
		if (outputStat.mtime > inputStat.mtime) {
			console.log(`⏭️  Skipped (exists): ${outputPath}`);
			return;
		}
	}

	try {
		// 使用 sharp 转换为 WebP：
		// - quality: 压缩质量，85 为质量与体积的平衡点
		// - effort: 编码努力程度（0-6），6 表示最高压缩率但速度较慢
		await sharp(inputPath).webp({ quality, effort: 6 }).toFile(outputPath);

		// 统计转换前后体积
		const inputSize = fs.statSync(inputPath).size;
		const outputSize = fs.statSync(outputPath).size;
		// 计算体积缩减百分比，保留 1 位小数
		const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);

		console.log(`✅ ${inputPath} → ${outputPath}`);
		console.log(
			`   ${(inputSize / 1024).toFixed(1)}KB → ${(outputSize / 1024).toFixed(1)}KB (${savings}% saved)`,
		);
	} catch (err) {
		// 单张图片转换失败不中断整体流程，仅打印错误
		console.error(`❌ Failed: ${inputPath}`, err.message);
	}
}

/**
 * 主流程：按 targets 匹配所有图片并逐张转换
 */
async function main() {
	// 使用 glob 匹配所有目标图片：
	// - cwd: 相对于 public 目录匹配
	// - absolute: 返回绝对路径（便于 sharp 直接读取）
	const files = await glob(targets, { cwd: publicDir, absolute: true });

	console.log(`Found ${files.length} images to convert\n`);

	// 串行转换每张图片（避免并发过高导致内存暴涨）
	for (const file of files) {
		await convertToWebP(file);
	}

	console.log("\n✓ Done!");
}

// 执行主流程，捕获未处理异常
main().catch(console.error);