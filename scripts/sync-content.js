// 导入子进程同步执行方法，用于调用 git 等命令
import { execSync } from "child_process";
// 导入 Node.js 文件系统模块（同步 API）
import fs from "fs";
// 导入 Node.js 路径模块
import path from "path";
// 导入 URL 转换工具，将 import.meta.url 转为文件路径
import { fileURLToPath } from "url";
// 导入环境变量加载模块
import { loadEnv } from "./load-env.js";

// 当前脚本文件的绝对路径
const __filename = fileURLToPath(import.meta.url);
// 当前脚本所在目录
const __dirname = path.dirname(__filename);
// 项目根目录（脚本位于 scripts/ 下，向上一级）
const rootDir = path.resolve(__dirname, "..");

// 加载 .env 配置
loadEnv();
console.log("已加载 .env 配置文件\n");

// 从环境变量读取配置
// ENABLE_CONTENT_SYNC: 是否启用内容分离（仅显式设为 "false" 才关闭，默认启用）
const ENABLE_CONTENT_SYNC = process.env.ENABLE_CONTENT_SYNC !== "false";
// CONTENT_REPO_URL: 内容仓库地址（为空表示不启用远程同步）
const CONTENT_REPO_URL = process.env.CONTENT_REPO_URL || "";
// CONTENT_DIR: 内容目录位置，默认为项目根目录下的 content/
const CONTENT_DIR = process.env.CONTENT_DIR || path.join(rootDir, "content");

console.log("开始同步内容...\n");

// ===== 检查 1：是否启用内容分离 =====
if (!ENABLE_CONTENT_SYNC) {
	console.log("内容分离功能已关闭（ENABLE_CONTENT_SYNC=false）");
	console.log("提示：将使用本地内容，不会从远程仓库同步");
	console.log("      若要启用内容分离，请在 .env 中设置：");
	console.log("      ENABLE_CONTENT_SYNC=true");
	console.log("      CONTENT_REPO_URL=<your-repo-url>\n");
	process.exit(0);
}

// ===== 分支 A：内容目录不存在 → 克隆仓库 =====
if (!fs.existsSync(CONTENT_DIR)) {
	console.log(`内容目录不存在：${CONTENT_DIR}`);
	console.log("将使用独立仓库模式");

	// 未配置仓库地址 → 使用本地内容，正常退出
	if (!CONTENT_REPO_URL) {
		console.warn("警告：未设置 CONTENT_REPO_URL，将使用本地内容");
		console.log(
			"提示：请设置 CONTENT_REPO_URL 环境变量，或手动创建内容目录",
		);
		process.exit(0);
	}

	try {
		console.log(`正在克隆内容仓库：${CONTENT_REPO_URL}`);
		// --depth 1 浅克隆，只拉取最新一次提交，加快速度
		execSync(`git clone --depth 1 ${CONTENT_REPO_URL} ${CONTENT_DIR}`, {
			stdio: "inherit",
			cwd: rootDir,
		});
		console.log("内容仓库克隆成功");
	} catch (error) {
		console.error("克隆失败：", error.message);
		// 克隆失败属于致命错误，以非零码退出
		process.exit(1);
	}
} else {
	// ===== 分支 B：内容目录已存在 → 同步更新 =====
	console.log(`内容目录已存在：${CONTENT_DIR}`);

	// 仅当是 git 仓库时才执行同步
	if (fs.existsSync(path.join(CONTENT_DIR, ".git"))) {
		try {
			console.log("正在同步远程内容（强制模式）...");

			// 1. 防止本地修改丢失
			// 把当前所有改动（含未跟踪文件）暂存到 stash
			execSync("git stash push --include-untracked -m 'auto-sync'", {
				stdio: "inherit",
				cwd: CONTENT_DIR,
			});

			// 2. 更新远程引用
			// --all 拉取所有远程，--prune 清理已删除的远程分支
			execSync("git fetch --all --prune", {
				stdio: "inherit",
				cwd: CONTENT_DIR,
			});

			// 3. 判断分支：默认 main，若 origin/main 不存在则回退到 master
			let branch = "main";
			try {
				execSync("git rev-parse --verify origin/main", { cwd: CONTENT_DIR });
			} catch {
				branch = "master";
			}

			// 4. 强制同步：切到目标分支并硬重置到远程最新
			// 注意：--hard 会丢弃工作区所有改动（前面的 stash 已做了保护）
			execSync(`git checkout ${branch}`, { cwd: CONTENT_DIR });
			execSync(`git reset --hard origin/${branch}`, { cwd: CONTENT_DIR });

			console.log(`内容同步成功（分支：${branch}）`);
		} catch (error) {
			// 同步失败不中断整体流程，仅警告
			console.warn("内容更新失败：", error.message);
		}
	}
}

// ===== 建立内容映射（符号链接或复制） =====
console.log("\n正在建立内容链接...");

// 内容映射清单：内容仓库中的子目录 → 主仓库中的目标位置
const contentMappings = [
	{ src: "posts", dest: "src/content/posts" },   // 文章
	{ src: "spec", dest: "src/content/spec" },     // 特殊页面（关于、友链等）
	{ src: "data", dest: "src/data" },             // 数据文件
	{ src: "images", dest: "public/images" },      // 图片资源
];

for (const mapping of contentMappings) {
	// 内容仓库中的源目录
	const srcPath = path.join(CONTENT_DIR, mapping.src);
	// 主仓库中的目标位置
	const destPath = path.join(rootDir, mapping.dest);

	// 源目录不存在则跳过
	if (!fs.existsSync(srcPath)) {
		console.log(`跳过不存在的源目录：${mapping.src}`);
		continue;
	}

	// 如果目标已存在且不是符号链接，先备份它（避免误删本地内容）
	if (fs.existsSync(destPath) && !fs.lstatSync(destPath).isSymbolicLink()) {
		const backupPath = `${destPath}.backup`;
		console.log(
			`正在备份已有内容：${mapping.dest} -> ${mapping.dest}.backup`,
		);
		// 若备份已存在则先删除，避免冲突
		if (fs.existsSync(backupPath)) {
			fs.rmSync(backupPath, { recursive: true, force: true });
		}
		// 重命名原目录为备份
		fs.renameSync(destPath, backupPath);
	}

	// 删除现有的符号链接（如果是旧链接需要先移除才能重建）
	if (fs.existsSync(destPath)) {
		fs.unlinkSync(destPath);
	}

	// 创建符号链接（Windows 需要管理员权限，否则复制文件）
	try {
		// 计算相对路径，使符号链接更可移植
		const relPath = path.relative(path.dirname(destPath), srcPath);
		// "junction" 类型在 Windows 上无需管理员权限
		fs.symlinkSync(relPath, destPath, "junction");
		console.log(`已创建符号链接：${mapping.dest} -> ${mapping.src}`);
	} catch (error) {
		// 符号链接失败（如权限不足）→ 回退为复制内容
		console.log(`符号链接失败，改为复制内容：${mapping.src} -> ${mapping.dest}`);
		copyRecursive(srcPath, destPath);
	}
}

console.log("\n内容同步完成\n");

// ===== 自动提交主仓库的内容更新记录 =====
try {
	// 1. 获取 content 分支名
	const branch = execSync("git rev-parse --abbrev-ref HEAD", {
		cwd: CONTENT_DIR,
	})
		.toString()
		.trim();

	// 2. 获取 content commit hash（短）
	const hash = execSync("git rev-parse --short HEAD", {
		cwd: CONTENT_DIR,
	})
		.toString()
		.trim();

	// 3. 提交主仓库
	execSync("git add .", { cwd: rootDir });

	execSync(
		`git commit -m "chore(content): sync ${branch}@${hash}"`,
		{ cwd: rootDir },
	);

	console.log(`已提交内容更新（${branch}@${hash}）`);
} catch {
	// 无变化时 git commit 会失败，此处静默处理
	console.log("没有变化，跳过提交");
}

/**
 * 递归复制文件/目录
 * 作为符号链接失败时的回退方案
 * @param {string} src 源路径
 * @param {string} dest 目标路径
 */
function copyRecursive(src, dest) {
	if (fs.statSync(src).isDirectory()) {
		// 目录：创建目标目录后递归复制其中每个条目
		if (!fs.existsSync(dest)) {
			fs.mkdirSync(dest, { recursive: true });
		}
		const files = fs.readdirSync(src);
		for (const file of files) {
			copyRecursive(path.join(src, file), path.join(dest, file));
		}
	} else {
		// 文件：直接复制
		fs.copyFileSync(src, dest);
	}
}