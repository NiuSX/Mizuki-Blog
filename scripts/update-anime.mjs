// 从 child_process 导入 spawn，用于以流式方式启动子进程
import { spawn } from "child_process";
// 导入 Promise 版 fs 模块（异步读写）
import fs from "fs/promises";
// 导入 Node.js 路径模块
import path from "path";
// 导入 URL 转换工具，将 import.meta.url 转为文件路径
import { fileURLToPath } from "url";

// siteConfig.ts 配置文件的绝对路径
// 脚本位于 scripts/ 下，因此向上回退一级到项目根，再进入 src/config/
const CONFIG_PATH = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"../src/config/siteConfig.ts",
);

/**
 * 从 siteConfig.ts 中读取番剧模式（mode 字段）
 * 与 config-parser.js 中的 getAnimeMode 逻辑一致，但此处独立实现
 * 以避免引入额外模块依赖
 * @returns {Promise<string>} 番剧模式（"bangumi" / "bilibili" / 其他），默认 "bangumi"
 */
async function getAnimeModeFromConfig() {
	try {
		// 读取配置文件内容
		const configContent = await fs.readFile(CONFIG_PATH, "utf-8");
		// 匹配 anime: { ... mode: "xxx" ... } 中的 mode 值
		const match = configContent.match(
			/anime:\s*\{[\s\S]*?mode:\s*["']([^"']+)["']/,
		);

		// 匹配成功则返回模式
		if (match && match[1]) {
			return match[1];
		}
		// 未匹配到 mode 字段，回退默认值
		return "bangumi";
	} catch (error) {
		// 文件不存在或读取失败，静默回退默认值（不中断流程）
		return "bangumi";
	}
}

/**
 * 运行指定的 Node 脚本（以子进程方式），并返回 Promise
 * @param {string} scriptPath 待执行脚本的路径
 * @returns {Promise<void>} 脚本成功退出（code 0）时 resolve，否则 reject
 */
function runScript(scriptPath) {
	return new Promise((resolve, reject) => {
		// 使用 spawn 启动 node 子进程：
		// - stdio: "inherit" 让子进程输出直接透传到父进程终端
		// - shell: true 允许在 shell 环境中执行（兼容某些平台的路径/命令）
		const script = spawn("node", [scriptPath], {
			stdio: "inherit",
			shell: true,
		});

		// 子进程正常结束：根据退出码决定 resolve 或 reject
		script.on("close", (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`Script exited with code ${code}`));
			}
		});

		// 子进程启动失败（如命令不存在）：直接 reject
		script.on("error", (err) => {
			reject(err);
		});
	});
}

/**
 * 主流程：读取番剧模式 → 调用对应的更新脚本
 */
async function main() {
	// 从配置中读取番剧模式
	const mode = await getAnimeModeFromConfig();
	// 当前脚本所在目录（用于定位同级更新脚本）
	const scriptsDir = path.dirname(fileURLToPath(import.meta.url));

	if (mode === "bilibili") {
		// bilibili 模式：调用 B 站数据更新脚本
		console.log("Detected anime mode: bilibili, running update-bilibili.mjs");
		await runScript(path.join(scriptsDir, "update-bilibili.mjs"));
	} else if (mode === "bangumi") {
		// bangumi 模式：调用 Bangumi 数据更新脚本
		console.log("Detected anime mode: bangumi, running update-bangumi.mjs");
		await runScript(path.join(scriptsDir, "update-bangumi.mjs"));
	} else {
		// 其他模式（如本地数据 / 未启用）：不执行任何更新
		console.log(`Anime mode is "${mode}", skipping data update.`);
	}
}

// 执行主流程，捕获顶层异常
main().catch((err) => {
	console.error("\n✘ Script execution error:");
	console.error(err);
	// 以非零码退出，让 CI / 调用方感知失败
	process.exit(1);
});