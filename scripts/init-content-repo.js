#!/usr/bin/env node
// ↑ shebang：告诉系统用 node 执行此脚本，使文件可直接 ./xxx.js 运行

/**
 * Mizuki 内容仓库初始化脚本
 * 帮助用户快速设置代码内容分离
 *
 * 功能概述：
 *   1. 交互式询问用户的内容仓库 URL
 *   2. 生成 .env 配置文件（写入 CONTENT_REPO_URL / CONTENT_DIR）
 *   3. 自动执行 pnpm run sync-content 同步内容仓库
 *   4. 输出后续文档指引
 */

// 导入子进程同步执行方法，用于调用 pnpm 等外部命令
import { execSync } from "child_process";
// 导入 Node.js 文件系统模块，用于写入 .env 文件
import fs from "fs";
// 导入 Node.js 路径模块
import path from "path";
// 导入 readline 模块，用于命令行交互（询问用户输入）
import readline from "readline";
// 导入 URL 转换工具，将 import.meta.url 转为文件路径
import { fileURLToPath } from "url";
// 导入环境变量加载模块
import { loadEnv } from "./load-env.js";

// 当前脚本文件的绝对路径
const __filename = fileURLToPath(import.meta.url);
// 当前脚本所在目录的绝对路径
const __dirname = path.dirname(__filename);
// 项目根目录（脚本位于 scripts/ 下，向上一级）
const rootDir = path.resolve(__dirname, "..");

// 加载 .env 配置（若存在），使脚本能读取已有环境变量
loadEnv();
console.log("已加载 .env 配置文件\n");

// 创建 readline 交互接口，绑定标准输入/输出
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

/**
 * 封装 readline.question 为 Promise，便于 async/await 调用
 * @param {string} query 提示文本
 * @returns {Promise<string>} 用户输入的字符串
 */
function question(query) {
	return new Promise((resolve) => rl.question(query, resolve));
}

/**
 * 执行外部命令（同步），失败时打印并抛出异常
 * @param {string} command 要执行的命令
 * @param {Object} [options={}] execSync 选项（如 cwd、env）
 * @returns {Buffer} 命令输出（stdio: "inherit" 时通常为 null）
 */
function exec(command, options = {}) {
	try {
		// stdio: "inherit" 让子进程直接复用父进程的输入/输出流，
		// 从而把 pnpm 的实时输出透传给用户
		return execSync(command, { stdio: "inherit", ...options });
	} catch (error) {
		console.error(`命令执行失败: ${command}`);
		throw error;
	}
}

/**
 * 主流程：交互式初始化内容仓库配置
 */
async function main() {
	console.log("Mizuki 内容仓库初始化\n");

	// 说明当前仅支持"独立仓库"模式（内容与代码分离）
	console.log("将使用独立仓库模式管理内容\n");

	// 询问内容仓库 URL
	const repoUrl = await question("请输入内容仓库 URL: ");

	// 校验非空：空输入直接终止
	if (!repoUrl.trim()) {
		console.error("错误：内容仓库 URL 不能为空！");
		rl.close();
		return;
	}

	// 打印确认信息，让用户复核配置
	console.log("\n当前配置：");
	console.log("  模式：独立仓库");
	console.log(`  仓库：${repoUrl.trim()}`);

	// 二次确认，防止误操作
	const confirm = await question("\n确认初始化？(y/n): ");

	// 除 "y" 外的任何输入都视为取消
	if (confirm.toLowerCase() !== "y") {
		console.log("已取消初始化");
		rl.close();
		return;
	}

	console.log("\n开始初始化...\n");

	// 创建 .env 文件
	const envPath = path.join(rootDir, ".env");
	const envContent = `# Mizuki 内容仓库配置
# 由初始化脚本自动生成

CONTENT_REPO_URL=${repoUrl.trim()}
CONTENT_DIR=./content
`;

	// 写入 .env（若已存在则覆盖）
	fs.writeFileSync(envPath, envContent);
	console.log("已创建 .env 文件");

	// 同步内容
	console.log("正在同步内容仓库...");
	try {
		// 调用 package.json 中定义的 sync-content 脚本
		// 显式传入 CONTENT_REPO_URL，确保本次同步使用最新地址
		exec("pnpm run sync-content", {
			cwd: rootDir,
			env: {
				...process.env,
				CONTENT_REPO_URL: repoUrl.trim(),
			},
		});
		console.log("内容同步成功");
	} catch (error) {
		// 同步失败不终止流程，仅提示用户手动执行
		console.error(
			"内容同步失败。请手动执行：pnpm run sync-content",
		);
	}

	// 提示后续步骤
	console.log("\n初始化完成\n");
	console.log("\n相关文档：");
	console.log("- 内容仓库说明：docs/CONTENT_REPOSITORY.md");
	console.log("- 迁移指南：docs/MIGRATION_GUIDE.md");

	// 关闭 readline 接口，释放 stdin
	rl.close();
}

// 执行主流程，捕获顶层异常
main().catch((error) => {
	console.error("初始化失败：", error);
	// 异常时也需关闭 readline，避免进程挂起
	rl.close();
	// 以非零码退出，提示执行失败
	process.exit(1);
});