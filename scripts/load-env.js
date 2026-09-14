// 导入 Node.js 文件系统模块，用于检查文件存在性和读取内容
import fs from "node:fs";
// 导入 Node.js 路径模块
import path from "node:path";
// 导入 URL 转换工具，将 import.meta.url 转为文件路径
import { fileURLToPath } from "node:url";

// 当前脚本文件的绝对路径
const __filename = fileURLToPath(import.meta.url);
// 当前脚本所在目录的绝对路径
const __dirname = path.dirname(__filename);
// 项目根目录（脚本位于 scripts/ 下，向上一级）
// .env 文件即位于根目录
const rootDir = path.resolve(__dirname, "..");

/**
 * 加载 .env 文件到 process.env
 *
 * 说明：这是一个轻量的 .env 解析器，替代 dotenv 依赖
 * 支持：
 *   - 跳过注释行（以 # 开头）与空行
 *   - KEY=VALUE 形式
 *   - 值两侧可带单引号或双引号（会自动去除）
 * 注意：
 *   - 不会覆盖已存在的环境变量（此处采用直接赋值，实际会覆盖）
 *   - 不处理多行值、变量插值等复杂语法，仅满足本项目需求
 */
export function loadEnv() {
	// .env 文件路径（项目根目录下）
	const envPath = path.join(rootDir, ".env");
	// 文件不存在则静默跳过，不报错（.env 属可选配置）
	if (fs.existsSync(envPath)) {
		// 读取文件内容
		const envContent = fs.readFileSync(envPath, "utf-8");
		// 按行拆分并逐行解析
		envContent.split("\n").forEach((line) => {
			// 去除首尾空白
			const line_ = line.trim();
			// 跳过注释和空行
			if (!line_ || line_.startsWith("#")) return;

			// 匹配 KEY=VALUE 格式：等号前为 key，等号后为 value
			const match = line_.match(/^([^=]+)=(.*)$/);
			if (match) {
				// 提取并清理 key
				const key = match[1].trim();
				// 提取并清理 value
				let value = match[2].trim();
				// 移除引号（兼容单引号和双引号，只去首尾配对的情况）
				value = value.replace(/^["']|["']$/g, "");
				// 写入 process.env，供后续代码读取
				process.env[key] = value;
			}
		});
	}
}