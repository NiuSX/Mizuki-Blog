// 从 crypto 模块导入 SHA-256 哈希创建函数（用于字形数据校验）
import { createHash } from "node:crypto";
// 从 Promise 版 fs 模块导入文件读取与写入
import { readFile, writeFile } from "node:fs/promises";
// 从路径模块导入：取目录名、解析为绝对路径
import { dirname, resolve } from "node:path";
// 导入 URL 转换工具，将 import.meta.url 转为文件路径
import { fileURLToPath } from "node:url";
// 从 fonteditor-core 导入字体处理核心：
// - Font: 字体解析/序列化的主类
// - ttftowoff2: TTF → WOFF2 的转换函数
// - woff2: WOFF2 编解码器（需先 init 加载 WASM）
import { Font, ttftowoff2, woff2 } from "fonteditor-core";

// 项目根目录（脚本位于 scripts/ 下，向上一级）
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// 待转换字体清单：[源文件名, 目标文件名]
const fonts = [
	["ZenMaruGothic-Medium.ttf", "ZenMaruGothic-Medium.woff2"],
	["loli.ttf", "loli.woff2"],
];

/**
 * 从 Buffer 中提取精确对应的 ArrayBuffer
 *
 * 背景：Node 的 Buffer 可能只是某个更大 ArrayBuffer 的"视图"
 * （例如来自池化分配），直接取 buffer.buffer 会包含无关字节。
 * 因此需按 byteOffset / byteLength 截取，得到真正属于该 Buffer 的 ArrayBuffer。
 * @param {Buffer} buffer 输入 Buffer
 * @returns {ArrayBuffer} 精确对应的 ArrayBuffer
 */
function exactArrayBuffer(buffer) {
	return buffer.buffer.slice(
		buffer.byteOffset,
		buffer.byteOffset + buffer.byteLength,
	);
}

/**
 * 计算字体所有字形的 SHA-256 摘要
 * 用于比对转换前后的字形数据是否完全一致
 * @param {Object} font 已解析的字体对象（含 glyf 字形数组）
 * @returns {string} 十六进制哈希字符串
 */
function glyphDigest(font) {
	const hash = createHash("sha256");
	// 逐个字形序列化后更新哈希
	for (const glyph of font.glyf) hash.update(JSON.stringify(glyph));
	return hash.digest("hex");
}

/**
 * 断言转换后的字体与源字体在关键属性上完全等价
 * 校验项：字形数量、em 单位、名称表、字形数据摘要
 * @param {Buffer} source 源 TTF 文件内容
 * @param {Buffer} output 生成的 WOFF2 文件内容
 * @param {string} targetName 目标文件名（用于错误信息）
 */
function assertEquivalentFont(source, output, targetName) {
	// 解析选项：保留 hinting 与 kerning 信息
	const readOptions = { hinting: true, kerning: true };
	// 解析源 TTF
	const original = Font.create(source, { ...readOptions, type: "ttf" }).get();
	// 解析转换后的 WOFF2
	const compressed = Font.create(output, {
		...readOptions,
		type: "woff2",
	}).get();

	// 逐项比对，任何一项不一致即抛错
	if (
		// 字形数量必须一致
		original.glyf.length !== compressed.glyf.length ||
		// em 单位（字号基准）必须一致
		original.head.unitsPerEm !== compressed.head.unitsPerEm ||
		// 名称表（字体名、家族名等）必须一致
		JSON.stringify(original.name) !== JSON.stringify(compressed.name) ||
		// 字形数据摘要必须一致（最严格的校验）
		glyphDigest(original) !== glyphDigest(compressed)
	) {
		throw new Error(`${targetName} changed font names, metrics, or glyph data`);
	}
}

// 初始化 WOFF2 编解码器（加载 WASM 模块），必须在转换前调用
await woff2.init();

// 逐个字体执行转换
for (const [sourceName, targetName] of fonts) {
	// 源 TTF 路径
	const sourcePath = resolve(projectRoot, "src", "assets", "fonts", sourceName);
	// 目标 WOFF2 路径
	const targetPath = resolve(projectRoot, "src", "assets", "fonts", targetName);
	// 读取源文件
	const source = await readFile(sourcePath);
	// 执行 TTF → WOFF2 转换（需传入精确的 ArrayBuffer）
	const output = Buffer.from(ttftowoff2(exactArrayBuffer(source)));

	// ===== 校验 1：WOFF2 魔数 =====
	// 合法的 WOFF2 文件头 4 字节应为 "wOF2"
	if (output.subarray(0, 4).toString("ascii") !== "wOF2") {
		throw new Error(`${targetName} does not have a valid WOFF2 signature`);
	}
	// ===== 校验 2：体积必须更小 =====
	// 若 WOFF2 不比源 TTF 小，说明转换无意义（可能异常）
	if (output.length >= source.length) {
		throw new Error(`${targetName} is not smaller than its TTF source`);
	}

	// ===== 校验 3：字体内容等价 =====
	// 确保转换只改变格式，未损失任何字形/度量/名称数据
	assertEquivalentFont(source, output, targetName);

	// 写入目标文件
	await writeFile(targetPath, output);
	// 打印转换前后体积
	console.log(
		`${sourceName} -> ${targetName}: ${source.length} -> ${output.length} bytes`,
	);
}