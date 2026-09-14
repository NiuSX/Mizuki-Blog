// 从 Promise 版 fs 模块导入：复制文件、创建目录
import { cp, mkdir } from "node:fs/promises";
// 从路径模块导入：取目录名、解析为绝对路径
import { dirname, resolve } from "node:path";
// 导入 URL 转换工具，将 import.meta.url 转为文件路径
import { fileURLToPath } from "node:url";
// 导入 sharp 图像处理库，用于读取图片元数据、缩放与转码
import sharp from "sharp";

// 项目根目录（脚本位于 scripts/ 下，向上一级）
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// 公共静态资源目录：public/assets
const publicAssets = resolve(projectRoot, "public", "assets");
// 镜像资源目录：把 public/assets 中部分资源复制到 src/assets/public/assets
// 这样 Astro 可以将其作为可优化资源处理（走 _astro/ 构建管道）
const mirroredAssets = resolve(
	projectRoot,
	"src",
	"assets",
	"public",
	"assets",
);
// 音乐封面输出目录：src/assets/music/cover
// 用于存放按播放器尺寸处理过的封面
const musicCoverOutput = resolve(
	projectRoot,
	"src",
	"assets",
	"music",
	"cover",
);

// ===== 第一部分：镜像横幅图片 =====
// 遍历桌面端与移动端横幅目录，各自复制 1~4.webp 到镜像目录
for (const directory of ["desktop-banner", "mobile-banner"]) {
	// 镜像目录中对应的目标子目录
	const targetDirectory = resolve(mirroredAssets, directory);
	// 递归创建目标目录（已存在时不报错）
	await mkdir(targetDirectory, { recursive: true });
	// 复制 1.webp 到 4.webp 共 4 张图
	for (let index = 1; index <= 4; index += 1) {
		await cp(
			resolve(publicAssets, directory, `${index}.webp`),
			resolve(targetDirectory, `${index}.webp`),
		);
	}
}

// ===== 第二部分：处理音乐封面 =====
// 确保音乐封面输出目录存在
await mkdir(musicCoverOutput, { recursive: true });
// 需要处理的封面名称清单（对应四位歌手/来源）
for (const name of ["cl", "dazbee", "hitori", "xryx"]) {
	// 源封面文件路径（public/assets/music/cover 下）
	const source = resolve(publicAssets, "music", "cover", `${name}.webp`);
	// 目标封面文件路径（src/assets/music/cover 下）
	const target = resolve(musicCoverOutput, `${name}.webp`);
	// 读取源图片的元数据（宽高、格式等）
	const metadata = await sharp(source).metadata();

	// 尺寸已不超过 192×192：无需缩放，直接复制
	if ((metadata.width ?? 0) <= 192 && (metadata.height ?? 0) <= 192) {
		await cp(source, target);
	} else {
		// 尺寸超出：缩放到 192×192
		// - fit: "cover" 保持宽高比并裁剪填满（不会拉伸变形）
		// - position: "centre" 从中心裁剪
		// - quality: 85 WebP 压缩质量
		await sharp(source)
			.resize(192, 192, { fit: "cover", position: "centre" })
			.webp({ quality: 85 })
			.toFile(target);
	}
}

// 输出完成提示
console.log("Prepared mirrored banners and player-sized music covers.");