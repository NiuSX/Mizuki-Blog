// 导入 Promise 版 fs 模块，用于文件读取与写入
import fs from "fs/promises";
// 导入 Node.js 路径模块
import path from "path";
// 导入 URL 转换工具，将 import.meta.url 转为文件路径
import { fileURLToPath } from "url";

// Bangumi API 基础地址
const API_BASE = "https://api.bgm.tv";
// siteConfig.ts 配置文件路径（从当前脚本向上一级到项目根）
const CONFIG_PATH = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"../src/config/siteConfig.ts",
);
// 输出文件路径：番剧数据将写入 src/data/bangumi-data.json
const OUTPUT_FILE = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"../src/data/bangumi-data.json",
);

/**
 * 从 siteConfig.ts 读取 Bangumi 用户 ID
 * @returns {Promise<string>} 用户 ID
 * @throws {Error} 找不到配置或读取失败时抛出
 */
async function getUserIdFromConfig() {
	try {
		// 读取配置文件内容
		const configContent = await fs.readFile(CONFIG_PATH, "utf-8");
		// 匹配 bangumi: { ... userId: "xxx" ... } 中的 userId
		const match = configContent.match(
			/bangumi:\s*\{[\s\S]*?userId:\s*["']([^"']+)["']/,
		);

		if (match && match[1]) {
			const userId = match[1];
			// 检测是否为未替换的默认占位符，仅警告不阻止执行
			if (
				userId === "your-bangumi-id" ||
				userId === "your-user-id" ||
				!userId
			) {
				console.warn(
					"Warning: userId in src/config/siteConfig.ts appears to be a default value.",
				);
				return userId;
			}
			return userId;
		}
		// 未匹配到 userId 字段，视为配置错误
		throw new Error("Could not find bangumi.userId in config/siteConfig.ts");
	} catch (error) {
		console.error("✘ Failed to read Bangumi ID from config/siteConfig.ts");
		throw error;
	}
}

/**
 * 从 siteConfig.ts 读取番剧模式（anime.mode）
 * @returns {Promise<string>} 番剧模式，默认 "bangumi"
 */
async function getAnimeModeFromConfig() {
	try {
		const configContent = await fs.readFile(CONFIG_PATH, "utf-8");
		// 匹配 anime: { ... mode: "xxx" ... } 中的 mode
		const match = configContent.match(
			/anime:\s*\{[\s\S]*?mode:\s*["']([^"']+)["']/,
		);

		if (match && match[1]) {
			return match[1];
		}
		// 未匹配到时回退默认值
		return "bangumi";
	} catch (error) {
		// 读取失败也回退默认值（不中断）
		return "bangumi";
	}
}

// 模拟延迟防止 API 限制
// 用法：await delay(300) 等待 300ms
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 获取单个番剧条目的详细信息（含 infobox）
 * @param {number} subjectId 番剧条目 ID
 * @returns {Promise<Object|null>} 详情对象；请求失败时返回 null
 */
async function fetchSubjectDetail(subjectId) {
	try {
		const response = await fetch(`${API_BASE}/v0/subjects/${subjectId}`);
		// 非 2xx 响应直接返回 null，由调用方兜底
		if (!response.ok) return null;
		return await response.json();
	} catch (error) {
		// 网络异常等也返回 null，不中断整体流程
		return null;
	}
}

/**
 * 从 infobox（信息框）中提取动画制作公司名称
 * Bangumi 的 infobox 是 [{key, value}, ...] 结构，且不同条目的 key 命名不一致
 * @param {Array} infobox 信息框数组
 * @returns {string} 制作公司名称，找不到时返回 "Unknown"
 */
function getStudioFromInfobox(infobox) {
	// 非数组直接返回默认值
	if (!Array.isArray(infobox)) return "Unknown";

	// 可能出现的 key 名称（覆盖简繁中文与不同写法）
	const targetKeys = ["动画制作", "制作", "製作", "开发"];

	for (const key of targetKeys) {
		// 查找 key 匹配的条目
		const item = infobox.find((i) => i.key === key);
		if (item) {
			// value 为字符串：直接返回
			if (typeof item.value === "string") {
				return item.value;
			}
			// value 为数组：取第一个带 v 字段的有效项
			if (Array.isArray(item.value)) {
				const validItem = item.value.find((v) => v.v);
				if (validItem) return validItem.v;
			}
		}
	}
	// 所有 key 都未匹配到
	return "Unknown";
}

/**
 * 分页拉取指定收藏类型的所有条目
 * @param {string} userId Bangumi 用户 ID
 * @param {number} type 收藏类型（1=想看 2=看过 3=在看 4=搁置 5=抛弃）
 * @returns {Promise<Array>} 所有条目组成的数组
 */
async function fetchCollection(userId, type) {
	// 累积所有分页数据
	let allData = [];
	let offset = 0;
	const limit = 50;
	let hasMore = true;

	console.log(`Fetching type: ${type}...`);

	while (hasMore) {
		// subject_type=2 表示动画类型
		const url = `${API_BASE}/v0/users/${userId}/collections?subject_type=2&type=${type}&limit=${limit}&offset=${offset}`;
		try {
			const response = await fetch(url);

			// 处理非成功响应
			if (!response.ok) {
				// 404：用户不存在或该类型无数据，直接返回空数组
				if (response.status === 404) {
					console.log(
						`   User ${userId} does not exist or has no data of this type.`,
					);
					return [];
				}
				throw new Error(`API Error ${response.status}`);
			}

			const data = await response.json();

			// 累积本页数据，并用 \r 原地刷新进度
			if (data.data && data.data.length > 0) {
				allData = [...allData, ...data.data];
				process.stdout.write(
					`   Fetched ${allData.length} records...\r`,
				);
			}

			// 本页数据不足 limit，说明已到最后一页
			if (!data.data || data.data.length < limit) {
				hasMore = false;
			} else {
				// 继续下一页，并延迟 300ms 避免触发 API 限流
				offset += limit;
				await delay(300);
			}
		} catch (e) {
			// 单页请求失败即终止该类型的分页拉取
			console.error(`\nFetch failed (Type ${type}):`, e.message);
			hasMore = false;
		}
	}
	console.log("");
	return allData;
}

/**
 * 处理原始条目数据，转换为前端所需的最终结构
 * @param {Array} items 原始收藏条目数组
 * @param {string} status 状态标识（watching / planned / completed / onhold / dropped）
 * @returns {Promise<Array>} 处理后的番剧条目数组
 */
async function processData(items, status) {
	const results = [];
	let count = 0;
	const total = items.length;

	for (const item of items) {
		count++;
		// 原地刷新处理进度（\r 回到行首覆盖上一行）
		process.stdout.write(
			`[${status}] Processing progress: ${count}/${total} (${item.subject_id})\r`,
		);

		// 拉取条目详情（用于获取 infobox 中的制作公司）
		const subjectDetail = await fetchSubjectDetail(item.subject_id);
		// 延迟 150ms 避免详情接口限流
		await delay(150);

		// 年份：从 date 字段截取前 4 位
		const year = item.subject?.date
			? item.subject.date.slice(0, 4)
			: "Unknown";

		// 评分：优先使用用户个人评分，其次用条目综合评分，最后兜底 0
		const rating = item.rate
			? Number.parseFloat(item.rate.toFixed(1))
			: item.subject?.score
				? Number.parseFloat(item.subject.score.toFixed(1))
				: 0;

		// 观看进度：用户已看集数
		const progress = item.ep_status || 0;
		// 总集数：优先用条目信息，缺失时退化为已看集数
		const totalEpisodes = item.subject?.eps || progress;

		// 制作公司：从详情 infobox 中提取
		const studio = subjectDetail
			? getStudioFromInfobox(subjectDetail.infobox)
			: "Unknown";

		// 简介：按优先级取详情摘要 → 简短摘要 → 中文名，并去除前导空白
		const description = (
			subjectDetail?.summary ||
			item.subject?.short_summary ||
			item.subject?.name_cn ||
			""
		).trimStart();

		results.push({
			// 标题：优先中文名，其次原名
			title:
				item.subject?.name_cn || item.subject?.name || "Unknown Title",
			status: status,
			rating: rating,
			// 封面：优先中尺寸图，缺失时用本地默认图
			cover: item.subject?.images?.medium || "/assets/anime/default.webp",
			description: description,
			episodes: `${totalEpisodes} episodes`,
			year: year,
			// 类型标签：最多取前 3 个
			genre: item.subject?.tags
				? item.subject.tags.slice(0, 3).map((tag) => tag.name)
				: ["Unknown"],
			studio: studio,
			// 详情链接
			link: item.subject?.id
				? `https://bgm.tv/subject/${item.subject.id}`
				: "#",
			progress: progress,
			totalEpisodes: totalEpisodes,
			// 开始/结束日期（Bangumi 只提供单一 date，两者暂用同值）
			startDate: item.subject?.date || "",
			endDate: item.subject?.date || "",
		});
	}
	console.log(`\n✓ Completed ${status} list processing`);
	return results;
}

/**
 * 主流程：
 *   1. 检查番剧模式是否为 bangumi
 *   2. 读取用户 ID
 *   3. 遍历 5 种收藏类型，分页拉取并处理
 *   4. 合并结果并写入 JSON 文件
 */
async function main() {
	console.log("Initializing Bangumi data update script...");

	// 模式检查：非 bangumi 模式直接跳过
	const animeMode = await getAnimeModeFromConfig();
	if (animeMode !== "bangumi") {
		console.log(
			`Detected current anime mode is "${animeMode}", skipping Bangumi data update.`,
		);
		return;
	}

	// 读取用户 ID
	const USER_ID = await getUserIdFromConfig();
	console.log(`Read User ID: ${USER_ID}`);

	// 收藏类型与状态标识的映射
	const collections = [
		{ type: 3, status: "watching" },  // 在看
		{ type: 1, status: "planned" },   // 想看
		{ type: 2, status: "completed" }, // 看过
		{ type: 4, status: "onhold" },    // 搁置
		{ type: 5, status: "dropped" },   // 抛弃
	];

	// 最终合并的番剧列表
	let finalAnimeList = [];

	// 逐类型拉取并处理
	for (const c of collections) {
		const rawData = await fetchCollection(USER_ID, c.type);
		if (rawData.length > 0) {
			const processed = await processData(rawData, c.status);
			finalAnimeList = [...finalAnimeList, ...processed];
		}
	}

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
	console.log(`Total collected: ${finalAnimeList.length} anime series`);
}

// 执行主流程，捕获顶层异常
main().catch((err) => {
	console.error("\n✘ Script execution error:");
	console.error(err);
	process.exit(1);
});