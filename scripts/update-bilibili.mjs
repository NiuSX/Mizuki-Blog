// 导入 Promise 版 fs 模块，用于文件读写
import fs from "fs/promises";
// 导入 Node.js 路径模块
import path from "path";
// 导入 URL 转换工具，将 import.meta.url 转为文件路径
import { fileURLToPath } from "url";
// 导入 axios，用于发起 HTTP 请求
import axios from "axios";
// 导入环境变量加载模块（读取 BILI_SESSDATA 等）
import { loadEnv } from "./load-env.js";

// 加载 .env 配置
loadEnv();

// Bilibili 番剧追番列表 API 地址
const API_BASE = "https://api.bilibili.com/x/space/bangumi/follow/list";
// 每页请求的条目数
const PAGE_SIZE = 30;
// siteConfig.ts 配置文件路径（脚本位于 scripts/ 下，向上一级）
const CONFIG_PATH = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"../src/config/siteConfig.ts",
);
// 输出文件路径：番剧数据写入 src/data/bilibili-data.json
const OUTPUT_FILE = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"../src/data/bilibili-data.json",
);

// 状态映射: 1=想看, 2=在看, 3=已看
// 将 B 站的数字状态转换为与 Bangumi 一致的状态标识，便于前端统一处理
const STATUS_MAP = {
	1: "planned",
	2: "watching",
	3: "completed",
};

// 延迟函数
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 带重试机制的请求包装
 * 请求失败时延迟 1 秒后重试，最多重试 retries 次
 * @param {Function} apiCall 返回 Promise 的请求函数
 * @param {number} [retries=3] 最大重试次数
 * @returns {Promise<any>} 请求结果
 */
async function withRetry(apiCall, retries = 3) {
	for (let i = 0; i < retries; i++) {
		try {
			return await apiCall();
		} catch (error) {
			// 最后一次重试仍失败则抛出
			if (i === retries - 1) throw error;
			await delay(1000);
			console.warn(`Request failed, retrying attempt ${i + 1}...`);
		}
	}
}

/**
 * 从 siteConfig.ts 读取 Bilibili 用户 ID（vmid）
 * @returns {Promise<string|null>} vmid；空值返回 null
 * @throws {Error} 找不到配置或读取失败时抛出
 */
async function getUserIdFromConfig() {
	try {
		const configContent = await fs.readFile(CONFIG_PATH, "utf-8");
		// 匹配 bilibili: { ... vmid: "xxx" ... } 中的 vmid
		const match = configContent.match(
			/bilibili:\s*\{[\s\S]*?vmid:\s*["']([^"']+)["']/,
		);

		if (match && match[1]) {
			const vmid = match[1];
			// 空字符串视为未配置
			if (!vmid || vmid.trim() === "") {
				console.warn("Warning: vmid in src/config/siteConfig.ts is empty.");
				return null;
			}
			return vmid;
		}
		throw new Error("Could not find bilibili.vmid in config/siteConfig.ts");
	} catch (error) {
		console.error("✘ Failed to read Bilibili vmid from config/siteConfig.ts");
		throw error;
	}
}

/**
 * 从环境变量读取 Bilibili SESSDATA（用于访问需登录的追番数据）
 * @returns {Promise<string>} SESSDATA 字符串，未配置时为空字符串
 */
async function getSessdataFromConfig() {
	return process.env.BILI_SESSDATA || "";
}

/**
 * 从 siteConfig.ts 读取封面镜像前缀
 * 用于将 B 站图片 URL 前面拼接镜像域名，解决部分地区无法访问 B 站图床的问题
 * @returns {Promise<string>} 镜像前缀，未配置时为空字符串
 */
async function getCoverMirrorFromConfig() {
	try {
		const configContent = await fs.readFile(CONFIG_PATH, "utf-8");
		const match = configContent.match(/coverMirror:\s*["']([^"']*)["']/);
		return match ? match[1] : "";
	} catch {
		// 读取失败时返回空字符串（不启用镜像）
		return "";
	}
}

/**
 * 从 siteConfig.ts 读取是否启用 WebP 封面
 * 逻辑：只要没有显式写 useWebp: false，就视为启用
 * @returns {Promise<boolean>} 是否启用 WebP
 */
async function getUseWebpFromConfig() {
	try {
		const configContent = await fs.readFile(CONFIG_PATH, "utf-8");
		return !configContent.match(/useWebp:\s*false/);
	} catch {
		// 读取失败时默认启用
		return true;
	}
}

/**
 * 从 siteConfig.ts 读取番剧模式（anime.mode）
 * @returns {Promise<string>} 番剧模式，默认 "bangumi"
 */
async function getAnimeModeFromConfig() {
	try {
		const configContent = await fs.readFile(CONFIG_PATH, "utf-8");
		const match = configContent.match(
			/anime:\s*\{[\s\S]*?mode:\s*["']([^"']+)["']/,
		);

		if (match && match[1]) {
			return match[1];
		}
		return "bangumi";
	} catch (error) {
		return "bangumi";
	}
}

/**
 * 获取指定状态下的总页数
 * 通过请求第 1 页拿到 total，再换算为页数
 * @param {string} vmid 用户 ID
 * @param {number} status 追番状态（1=想看 2=在看 3=已看）
 * @param {number} [typeNum=1] 类型（1=番剧）
 * @returns {Promise<{success: boolean, data: number|string}>}
 *   - success=true 时 data 为总页数+1（便于 for 循环使用）
 *   - success=false 时 data 为错误信息
 */
async function getDataPage(vmid, status, typeNum = 1) {
	// 请求第 1 页（ps=1 只取 1 条，为了拿 total 字段）
	const response = await withRetry(() =>
		axios.get(
			`${API_BASE}?type=${typeNum}&follow_status=${status}&vmid=${vmid}&ps=1&pn=1`,
		),
	);

	// code=0 表示成功，且返回了 total 字段
	if (
		response?.data?.code === 0 &&
		response?.data?.data?.total !== undefined
	) {
		return {
			success: true,
			// 向上取整得到总页数，+1 便于后续 for (i = 1; i < page.data; i++)
			data: Math.ceil(response.data.data.total / PAGE_SIZE) + 1,
		};
	}
	return {
		success: false,
		data: response?.data?.message || "Failed to fetch data",
	};
}

/**
 * 获取指定页的番剧数据，并转换为前端所需结构
 * @param {string} vmid 用户 ID
 * @param {number} status 追番状态
 * @param {number} typeNum 类型
 * @param {number} pn 页码
 * @param {boolean} useWebp 是否使用 WebP 封面
 * @param {string} coverMirror 封面镜像前缀
 * @param {string} SESSDATA 登录凭证
 * @returns {Promise<Array>} 处理后的番剧列表
 */
async function getData(
	vmid,
	status,
	typeNum,
	pn,
	useWebp,
	coverMirror,
	SESSDATA,
) {
	// 若有 SESSDATA 则带上 cookie（部分追番数据需登录才能访问）
	const headers = SESSDATA ? { cookie: `SESSDATA=${SESSDATA};` } : {};

	const response = await withRetry(() =>
		axios.get(
			`${API_BASE}?type=${typeNum}&follow_status=${status}&vmid=${vmid}&ps=${PAGE_SIZE}&pn=${pn}`,
			{ headers },
		),
	);

	// API 返回非 0 视为失败
	if (response?.data?.code !== 0) {
		throw new Error(
			`Failed to fetch data: ${response?.data?.message || "Unknown error"}`,
		);
	}

	return (response?.data?.data?.list || []).map((bangumi) => {
		// ===== 处理封面图 =====
		let cover = bangumi?.cover || "";
		if (cover) {
			try {
				// 确保使用 https
				if (cover.startsWith("http://")) {
					cover = cover.replace("http://", "https://");
				}
				// 如果需要WebP格式
				// B 站图床支持在 URL 后拼接 @尺寸.webp 参数来获取指定尺寸与格式
				if (useWebp && !cover.includes("@")) {
					try {
						const urlObj = new URL(cover);
						// 如果路径中还没有尺寸参数，添加WebP优化参数
						if (!urlObj.pathname.includes("@")) {
							// 220w_280h 是播放器封面常用尺寸
							urlObj.pathname += "@220w_280h.webp";
							cover = urlObj.toString();
						}
					} catch {
						// URL解析失败，使用原始封面
					}
				}
				// 如果需要使用镜像源
				// 注意：拼接顺序为先加 WebP 参数，再加镜像前缀
				if (coverMirror) {
					cover = `${coverMirror}${cover}`;
				}
			} catch {
				// URL处理失败，使用原始封面
			}
		}

		// ===== 处理观看进度 =====
		let progress = 0;
		if (bangumi?.progress) {
			// progress可能是字符串如"1/14"或数字或空字符串
			if (
				typeof bangumi.progress === "string" &&
				bangumi.progress.trim()
			) {
				// 从字符串中提取第一个数字
				const progressMatch = bangumi.progress.match(/(\d+)/);
				if (progressMatch) {
					progress = parseInt(progressMatch[1], 10) || 0;
				}
			} else if (typeof bangumi.progress === "number") {
				progress = bangumi.progress;
			}
		}

		// 总集数
		const totalEpisodes = bangumi?.total_count || 0;
		// 观看进度百分比（总集数为 0 时视为 0%）
		const progressPercent =
			totalEpisodes > 0 && progress > 0
				? Math.round((progress / totalEpisodes) * 100)
				: 0;

		// 描述（从evaluate或summary字段获取）
		let description = bangumi?.evaluate || bangumi?.summary || "";
		// 清理描述中的特殊字符和换行
		if (description) {
			description = description
				// B 站返回的 HTML 实体编码，还原为真实字符
				.replace(/\u003c/g, "<")
				.replace(/\u003e/g, ">")
				// 换行替换为空格
				.replace(/\n/g, " ")
				.trim();
		}

		// 提取年份（从发布时间或发布日期）
		let year = "";
		if (bangumi?.publish?.release_date) {
			// 优先使用release_date，格式如 "2018-07-08"
			const dateMatch = bangumi.publish.release_date.match(/^(\d{4})/);
			if (dateMatch) {
				year = dateMatch[1];
			}
		} else if (bangumi?.publish?.pub_time) {
			// 如果release_date不存在，使用pub_time，格式如 "2018-07-08 00:30:00"
			const dateMatch = bangumi.publish.pub_time.match(/^(\d{4})/);
			if (dateMatch) {
				year = dateMatch[1];
			}
		}

		// 提取地区/制作信息（作为studio）
		// B 站没有制作公司字段，用地区（如"日本"）作为替代
		let studio = "";
		if (bangumi?.areas && bangumi.areas.length > 0) {
			studio = bangumi.areas[0].name || "";
		}

		// 提取类型/标签（使用styles数组）
		const genre = [];
		if (bangumi?.styles && Array.isArray(bangumi.styles)) {
			// 使用styles作为genre
			genre.push(...bangumi.styles);
		}
		// 如果没有styles，使用season_type_name作为备选
		if (genre.length === 0 && bangumi?.season_type_name) {
			genre.push(bangumi.season_type_name);
		}
		// 如果还是没有，使用"未知"
		if (genre.length === 0) {
			genre.push("Unknown");
		}

		// 构建链接（优先使用url字段，否则使用season_id）
		let link = "#";
		if (bangumi?.url) {
			link = bangumi.url;
		} else if (bangumi?.season_id) {
			// ss 前缀表示番剧剧集页
			link = `https://www.bilibili.com/bangumi/play/ss${bangumi.season_id}`;
		} else if (bangumi?.media_id) {
			// md 前缀表示媒体详情页
			link = `https://www.bilibili.com/bangumi/media/md${bangumi.media_id}/`;
		}

		return {
			title: bangumi?.title || "Unknown",
			// 将数字状态映射为语义化标识（与 Bangumi 脚本保持一致）
			status: STATUS_MAP[status] || "planned",
			rating: bangumi?.rating?.score
				? parseFloat(bangumi.rating.score.toFixed(1))
				: 0,
			cover: cover,
			description: description,
			year: year,
			studio: studio,
			genre: genre,
			link: link,
			progress: progress,
			totalEpisodes: totalEpisodes,
			progressPercent: progressPercent,
		};
	});
}

/**
 * 处理某状态下的所有页数据
 * @param {string} vmid 用户 ID
 * @param {number} status 追番状态
 * @param {number} typeNum 类型
 * @param {boolean} useWebp 是否使用 WebP
 * @param {string} coverMirror 封面镜像前缀
 * @param {string} SESSDATA 登录凭证
 * @returns {Promise<Array>} 该状态下所有番剧的合并数组
 */
async function processData(
	vmid,
	status,
	typeNum,
	useWebp,
	coverMirror,
	SESSDATA,
) {
	// 先获取总页数
	const page = await getDataPage(vmid, status, typeNum);
	if (!page?.success) {
		console.error(`Get bangumi data error:`, page?.data);
		return [];
	}

	const list = [];
	// page.data 为总页数+1，所以实际总页数为 page.data - 1
	const totalPages = page.data - 1;

	// 循环拉取每一页（i 从 1 开始，小于 page.data）
	for (let i = 1; i < page.data; i++) {
		// \r 原地刷新进度显示
		process.stdout.write(`   Fetching page ${i}/${totalPages}...\r`);
		const data = await getData(
			vmid,
			status,
			typeNum,
			i,
			useWebp,
			coverMirror,
			SESSDATA,
		);
		list.push(...data);
		await delay(300); // 延迟避免请求过快
	}
	console.log("");
	return list;
}

/**
 * 主流程：
 *   1. 检查番剧模式是否为 bilibili
 *   2. 读取 vmid、SESSDATA、封面镜像、WebP 等配置
 *   3. 分别拉取 想看/在看/已看 三种状态的数据
 *   4. 合并并写入 JSON 文件
 */
async function main() {
	console.log("Initializing Bilibili data update script...");

	// 模式检查：非 bilibili 模式直接跳过
	const animeMode = await getAnimeModeFromConfig();
	if (animeMode !== "bilibili") {
		console.log(
			`Detected current anime mode is "${animeMode}", skipping Bilibili data update.`,
		);
		return;
	}

	// 读取 vmid（未配置则直接报错退出）
	const VMID = await getUserIdFromConfig();
	if (!VMID) {
		console.error(
			"✘ Bilibili vmid is not set. Please set it in src/config/siteConfig.ts",
		);
		process.exit(1);
	}
	console.log(`Read User ID: ${VMID}`);

	// 读取其他配置项
	const SESSDATA = await getSessdataFromConfig();
	const coverMirror = await getCoverMirrorFromConfig();
	const useWebp = await getUseWebpFromConfig();

	// 获取三种状态的数据 (1=想看, 2=在看, 3=已看)
	console.log("\nFetching Bilibili bangumi data...");
	const planned = await processData(
		VMID,
		1,
		1,
		useWebp,
		coverMirror,
		SESSDATA,
	);
	const watching = await processData(
		VMID,
		2,
		1,
		useWebp,
		coverMirror,
		SESSDATA,
	);
	const completed = await processData(
		VMID,
		3,
		1,
		useWebp,
		coverMirror,
		SESSDATA,
	);

	// 合并三种状态的数据
	const finalAnimeList = [...planned, ...watching, ...completed];

	// 确保输出目录存在
	const dir = path.dirname(OUTPUT_FILE);
	try {
		await fs.access(dir);
	} catch {
		await fs.mkdir(dir, { recursive: true });
	}

	// 写入 JSON（缩进 2 空格，便于阅读与 diff）
	await fs.writeFile(OUTPUT_FILE, JSON.stringify(finalAnimeList, null, 2));
	console.log(`\nUpdate complete! Data saved to: ${OUTPUT_FILE}`);
	// 输出各状态的统计信息
	console.log(`Total collected: ${finalAnimeList.length} anime series`);
	console.log(`  - Planned: ${planned.length}`);
	console.log(`  - Watching: ${watching.length}`);
	console.log(`  - Completed: ${completed.length}`);
}

// 执行主流程，捕获顶层异常
main().catch((err) => {
	console.error("\n✘ Script execution error:");
	console.error(err);
	process.exit(1);
});