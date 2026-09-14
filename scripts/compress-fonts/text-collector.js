// 导入 Node.js 文件系统模块，用于读写文件和目录操作
import fs from "node:fs";
// 导入 Node.js 路径模块，用于处理文件路径
import path from "node:path";
// 从工具模块导入：
// - ROOT_DIR: 项目根目录
// - readFilesRecursively: 递归读取目录下所有文件
// - extractStringsToSet: 从源码中提取字符串字面量到 Set
// - extractMarkdownText: 从 Markdown/MDX 等文件中提取纯文本
// - CJK_REGEX: 匹配中日韩字符的正则
// - mergeSet: 将源 Set 合并进目标 Set
import {
	ROOT_DIR,
	readFilesRecursively,
	extractStringsToSet,
	extractMarkdownText,
	CJK_REGEX,
	mergeSet,
} from "./utils.js";
// 从配置解析模块导入各类配置读取函数，用于判断是否需要采集对应来源的文本
import { getLang, isAnimePageEnabled, getAnimeMode, getBangumiUserId, getMusicConfig } from "./config-parser.js";

/**
 * 获取 ASCII 字符集（用于 asciiFont 字体子集化）
 * 包含：可打印 ASCII（32~126）+ 常用符号 + 数字 + 大小写字母
 * @returns {string} 排序后的 ASCII 字符集字符串
 */
export function getAsciiCharset() {
	// 使用 Set 自动去重
	const chars = new Set();
	// 添加所有可打印 ASCII 字符（十进制 32 到 126）
	for (let i = 32; i <= 126; i++) {
		chars.add(String.fromCharCode(i));
	}
	// 额外补充一组常用符号（防止有些字符不在连续区间内）
	const common = " !\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
	for (const char of common) chars.add(char);
	// 添加数字 0-9
	for (let i = 0; i <= 9; i++) chars.add(String(i));
	// 添加大小写字母
	const alphabet =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	for (const char of alphabet) chars.add(char);
	// 排序后拼接为字符串返回
	return Array.from(chars).sort().join("");
}

/**
 * 从 src/data/ 目录提取字符串（如番剧数据、自定义数据等）
 * @param {Set<string>} textSet 收集字符的目标集合
 */
function collectFromDataDir(textSet) {
	// src/data 目录路径
	const dataDir = path.join(ROOT_DIR, "src/data");
	// 目录不存在则跳过
	if (!fs.existsSync(dataDir)) return;

	// 递归读取所有文件
	const files = readFilesRecursively(dataDir);
	for (const file of files) {
		// 只处理 TS/JS 文件
		if (file.endsWith(".ts") || file.endsWith(".js")) {
			const content = fs.readFileSync(file, "utf-8");
			// 提取字符串字面量到集合
			extractStringsToSet(content, textSet);
		}
	}
}

/**
 * 从音乐播放器本地常量文件提取字符串
 * 这些字符串（如"歌曲""艺术家"等 UI 文案）可能在运行时渲染，需确保字体覆盖
 * @param {Set<string>} textSet 收集字符的目标集合
 */
function collectFromMusicConstants(textSet) {
	const filePath = path.join(
		ROOT_DIR,
		"src/components/widgets/music-player/constants.ts",
	);
	// 文件不存在则跳过
	if (!fs.existsSync(filePath)) return;
	const content = fs.readFileSync(filePath, "utf-8");
	extractStringsToSet(content, textSet);
}

/**
 * 从 src/config/ 目录下所有配置文件提取字符串
 * 配置已拆分为多个文件（siteConfig、navBarConfig、profileConfig、musicConfig 等），需全部扫描
 * @param {Set<string>} textSet 收集字符的目标集合
 */
function collectFromConfig(textSet) {
	const configDir = path.join(ROOT_DIR, "src/config");
	if (!fs.existsSync(configDir)) return;

	const files = readFilesRecursively(configDir);
	for (const file of files) {
		if (file.endsWith(".ts") || file.endsWith(".js")) {
			const content = fs.readFileSync(file, "utf-8");
			extractStringsToSet(content, textSet);
		}
	}
}

/**
 * 从 i18n 语言文件提取字符串
 * 只读取当前语言（由 SITE_LANG 决定）对应的语言文件
 * @param {Set<string>} textSet 收集字符的目标集合
 */
function collectFromI18n(textSet) {
	// 获取当前站点语言
	const lang = getLang();
	const filePath = path.join(ROOT_DIR, `src/i18n/languages/${lang}.ts`);
	if (!fs.existsSync(filePath)) return;
	const content = fs.readFileSync(filePath, "utf-8");
	extractStringsToSet(content, textSet);
}

/**
 * 从 content 目录提取 CJK 字符
 * 支持通过环境变量切换到外部内容目录（内容同步场景）
 * @param {Set<string>} textSet 收集字符的目标集合
 */
function collectFromContent(textSet) {
	let contentDir;
	// 若启用了内容同步且配置了 CONTENT_DIR，则使用外部内容目录
	if (
		process.env.ENABLE_CONTENT_SYNC === "true" &&
		process.env.CONTENT_DIR
	) {
		contentDir = path.join(ROOT_DIR, process.env.CONTENT_DIR);
		console.log(
			`ℹ Using external content directory: ${process.env.CONTENT_DIR}`,
		);
	} else {
		// 默认使用 src/content
		contentDir = path.join(ROOT_DIR, "src/content");
	}

	// 内容目录不存在则跳过
	if (!fs.existsSync(contentDir)) {
		console.log(`⚠ Content directory does not exist: ${contentDir}`);
		return;
	}

	const files = readFilesRecursively(contentDir);
	for (const file of files) {
		// 支持 Markdown/MDX 以及 TS/JS 内容文件
		const ext = path.extname(file);
		if ([".md", ".mdx", ".ts", ".js"].includes(ext)) {
			const content = fs.readFileSync(file, "utf-8");
			// 提取纯文本（去除 Markdown 语法）
			const text = extractMarkdownText(content, ext);
			// 仅收集 CJK 字符
			for (const char of text) {
				if (CJK_REGEX.test(char)) {
					textSet.add(char);
				}
			}
		}
	}
}

/**
 * 添加常用字符和兜底词汇
 * 这些字符可能出现在动态生成的内容中（如运行时文案），预先加入避免缺字
 * @param {Set<string>} textSet 收集字符的目标集合
 */
function addCommonChars(textSet) {
	// 常用中文标点及符号
	const commonChars =
		"0123456789，。！？；：\"\"''（）【】《》、·—…「」『』";
	for (const char of commonChars) textSet.add(char);

	// 大小写字母（保证 CJK 字体中若有 ASCII 也能渲染）
	const alphabet =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	for (const char of alphabet) textSet.add(char);

	// 兜底词汇（防止空数据时字体缺少基础字符）
	const fallbackWords = ["示例", "歌曲", "艺术家"];
	for (const word of fallbackWords) {
		for (const char of word) textSet.add(char);
	}
}

// ── 远程 API 数据采集 ──

/**
 * 从 Meting API 获取歌单数据中的文字（歌名 + 艺术家）
 * 仅当音乐播放器启用且 mode 为 "meting" 时执行
 * @returns {Promise<Set<string>>} 收集到的字符集合
 */
async function fetchMetingPlaylistText() {
	try {
		// 读取音乐配置（未启用时返回 null）
		const musicConfig = getMusicConfig();
		if (!musicConfig) {
			console.log(
				"ℹ Music player disabled, skipping Meting API text collection",
			);
			return new Set();
		}

		// 只有 meting 模式才需要请求 API
		if (musicConfig.mode !== "meting") {
			console.log(
				'ℹ Music player mode is not "meting", skipping API text collection',
			);
			return new Set();
		}

		// 替换 API 模板中的占位符，构造实际请求 URL
		// :auth 无鉴权时留空，:r 用时间戳防止缓存
		const apiUrl = musicConfig.meting_api
			.replace(":server", musicConfig.server)
			.replace(":type", musicConfig.type)
			.replace(":id", musicConfig.id)
			.replace(":auth", "")
			.replace(":r", Date.now().toString());

		console.log("ℹ Fetching music playlist from Meting API...");
		console.log(`  URL: ${apiUrl}`);

		// 使用 AbortController 实现 10 秒超时
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000);

		const textSet = new Set();

		try {
			const response = await fetch(apiUrl, {
				signal: controller.signal,
				headers: {
					// 伪装 UA，部分 API 会拒绝默认的 Node fetch UA
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
				},
			});
			// 请求完成后清除超时定时器
			clearTimeout(timeoutId);

			// HTTP 错误时抛出异常
			if (!response.ok) {
				throw new Error(
					`HTTP ${response.status}: ${response.statusText}`,
				);
			}

			// 解析 JSON 并校验返回结构
			const playlist = await response.json();
			if (!Array.isArray(playlist)) {
				throw new Error("API response is not an array");
			}

			console.log(
				`✓ Successfully fetched ${playlist.length} songs from Meting API`,
			);

			// 遍历歌曲，收集歌名和艺术家中的字符
			let songCount = 0;
			for (const song of playlist) {
				// 兼容不同字段命名（name/title、artist/author）
				const title = song.name ?? song.title ?? "";
				const artist = song.artist ?? song.author ?? "";
				if (title.trim() || artist.trim()) {
					songCount++;
					for (const char of title) textSet.add(char);
					for (const char of artist) textSet.add(char);
				}
			}

			if (songCount === 0) {
				console.log(
					"⚠ No valid song data found in API response",
				);
			}
		} catch (fetchError) {
			// 请求失败不中断整体流程，仅打印提示
			clearTimeout(timeoutId);
			if (fetchError.name === "AbortError") {
				console.log(
					"⚠ Meting API request timeout (10s), skipping music text collection",
				);
			} else {
				console.log(
					`⚠ Failed to fetch Meting API data: ${fetchError.message}, skipping music text collection`,
				);
			}
		}

		return textSet;
	} catch (error) {
		// 外层兜底：配置解析异常等
		console.log(
			`⚠ Error processing Meting API config: ${error.message}, skipping music text collection`,
		);
		return new Set();
	}
}

/**
 * 从 Bilibili 数据文件获取番剧文字
 * 仅当番剧页面启用且 mode 为 "bilibili" 时执行
 * 数据来源为本地 src/data/bilibili-data.json
 * @returns {Promise<Set<string>>} 收集到的字符集合
 */
async function fetchBilibiliAnimeText() {
	try {
		// 番剧页面未启用则跳过
		if (!isAnimePageEnabled()) {
			console.log(
				"ℹ Anime page disabled, skipping Bilibili text collection",
			);
			return new Set();
		}

		// 仅处理 bilibili 模式
		if (getAnimeMode() !== "bilibili") {
			console.log(
				'ℹ Anime mode is not "bilibili", skipping Bilibili text collection',
			);
			return new Set();
		}

		// Bilibili 数据文件路径
		const dataFilePath = path.join(ROOT_DIR, "src/data/bilibili-data.json");
		if (!fs.existsSync(dataFilePath)) {
			console.log(
				"ℹ Bilibili data file not found, skipping Bilibili text collection",
			);
			return new Set();
		}

		console.log("ℹ Reading anime data from Bilibili data file...");

		const textSet = new Set();
		// 读取并解析 JSON
		const animeList = JSON.parse(fs.readFileSync(dataFilePath, "utf-8"));

		if (!Array.isArray(animeList)) {
			console.log(
				"⚠ Bilibili data is not an array, skipping text collection",
			);
			return new Set();
		}

		// 遍历番剧条目，收集各字段中的字符
		let processedCount = 0;
		for (const item of animeList) {
			// 标题
			for (const char of item.title || "") textSet.add(char);
			// 简介/评价
			for (const char of item.description || item.evaluate || "")
				textSet.add(char);
			// 制作公司
			for (const char of item.studio || "") textSet.add(char);
			// 年份
			for (const char of item.year || "") textSet.add(char);
			// 类型标签（数组）
			if (Array.isArray(item.genre)) {
				for (const genre of item.genre) {
					if (typeof genre === "string") {
						for (const char of genre) textSet.add(char);
					}
				}
			}
			// 副标题
			for (const char of item.subtitle || "") textSet.add(char);
			processedCount++;
		}

		if (processedCount > 0) {
			console.log(
				`✓ Successfully processed ${processedCount} anime items from Bilibili data`,
			);
		} else {
			console.log("⚠ No anime data found in Bilibili data file");
		}

		return textSet;
	} catch (error) {
		console.log(
			`⚠ Error processing Bilibili data: ${error.message}, skipping Bilibili text collection`,
		);
		return new Set();
	}
}

/**
 * 从 Bangumi API 获取番剧文字
 * 仅当番剧页面启用、mode 为 "bangumi" 且配置了 userId 时执行
 * 数据来源为远程 Bangumi API（分页拉取用户的收藏）
 * @returns {Promise<Set<string>>} 收集到的字符集合
 */
async function fetchBangumiAnimeText() {
	try {
		// 番剧页面未启用则跳过
		if (!isAnimePageEnabled()) {
			console.log(
				"ℹ Anime page disabled, skipping Bangumi API text collection",
			);
			return new Set();
		}

		// 获取用户 ID 和番剧模式
		const userId = getBangumiUserId();
		const mode = getAnimeMode();

		// 仅处理 bangumi 模式且必须有 userId
		if (mode !== "bangumi" || !userId) {
			console.log(
				'ℹ Anime mode is not "bangumi" or no userId configured, skipping Bangumi API text collection',
			);
			return new Set();
		}

		console.log("ℹ Fetching anime data from Bangumi API...");
		console.log(`  User ID: ${userId}`);

		const textSet = new Set();
		// Bangumi API 基础地址
		const BANGUMI_API_BASE = "https://api.bgm.tv";
		// 收藏类型：1=想看 2=看过 3=在看 4=搁置 5=抛弃
		const collectionTypes = [1, 2, 3, 4, 5];

		/**
		 * 分页拉取指定收藏类型的所有条目
		 * @param {string} userId 用户 ID
		 * @param {number} subjectType 条目类型（2=动画）
		 * @param {number} type 收藏类型
		 * @returns {Promise<Array>} 所有条目组成的数组
		 */
		async function fetchCollection(userId, subjectType, type) {
			try {
				const allData = [];
				let offset = 0;
				const limit = 50;
				let hasMore = true;

				// 循环分页拉取，直到没有更多数据
				while (hasMore) {
					// 每次请求设置 10 秒超时
					const controller = new AbortController();
					const timeoutId = setTimeout(
						() => controller.abort(),
						10000,
					);

					const response = await fetch(
						`${BANGUMI_API_BASE}/v0/users/${userId}/collections?subject_type=${subjectType}&type=${type}&limit=${limit}&offset=${offset}`,
						{
							signal: controller.signal,
							headers: {
								"User-Agent":
									"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
							},
						},
					);
					clearTimeout(timeoutId);

					if (!response.ok) {
						throw new Error(
							`HTTP ${response.status}: ${response.statusText}`,
						);
					}

					const data = await response.json();
					// 累积本页数据
					if (data.data && data.data.length > 0) {
						allData.push(...data.data);
					}
					// 若本页返回数量达到 limit，说明可能还有下一页
					hasMore = data.data && data.data.length >= limit;
					offset += limit;

					// 每次分页请求间隔 200ms，避免触发限流
					await new Promise((r) => setTimeout(r, 200));
				}

				return allData;
			} catch (error) {
				// 单个收藏类型失败不影响其他类型，返回空数组
				console.log(
					`⚠ Failed to fetch collection type ${type}: ${error.message}`,
				);
				return [];
			}
		}

		/**
		 * 获取某条目的制作人员信息（姓名 + 职位）
		 * 用于补充字体字符覆盖（姓名中可能有生僻字）
		 * @param {number} subjectId 条目 ID
		 * @returns {Promise<Array>} 制作人员数组
		 */
		async function fetchSubjectPersons(subjectId) {
			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 5000);
				const response = await fetch(
					`${BANGUMI_API_BASE}/v0/subjects/${subjectId}/persons`,
					{
						signal: controller.signal,
						headers: {
							"User-Agent":
								"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
						},
					},
				);
				clearTimeout(timeoutId);
				// 请求失败时静默返回空数组
				if (!response.ok) return [];
				const data = await response.json();
				return Array.isArray(data) ? data : [];
			} catch {
				// 忽略异常，返回空数组
				return [];
			}
		}

		// 遍历所有收藏类型
		let totalItems = 0;
		for (const type of collectionTypes) {
			const collections = await fetchCollection(userId, 2, type);
			if (collections.length === 0) continue;

			console.log(
				`✓ Fetched ${collections.length} items from collection type ${type}`,
			);
			totalItems += collections.length;

			// 逐条解析条目信息，收集字符
			for (const item of collections) {
				const subject = item.subject || {};
				// 中文名
				for (const char of subject.name_cn || "") textSet.add(char);
				// 原名
				for (const char of subject.name || "") textSet.add(char);
				// 简短简介
				for (const char of subject.short_summary || "")
					textSet.add(char);

				// 标签
				if (Array.isArray(subject.tags)) {
					for (const tag of subject.tags) {
						if (tag.name) {
							for (const char of tag.name) textSet.add(char);
						}
					}
				}

				// 随机抽取约 30% 的条目查询制作人员信息，平衡覆盖与请求量
				if (item.subject_id && Math.random() < 0.3) {
					const persons = await fetchSubjectPersons(
						item.subject_id,
					);
					for (const person of persons) {
						// 姓名
						if (person.name) {
							for (const char of person.name)
								textSet.add(char);
						}
						// 职位关系
						if (person.relation) {
							for (const char of person.relation)
								textSet.add(char);
						}
					}
					// 请求间隔 100ms，避免限流
					await new Promise((r) => setTimeout(r, 100));
				}
			}
		}

		if (totalItems > 0) {
			console.log(
				`✓ Successfully processed ${totalItems} anime items from Bangumi API`,
			);
		} else {
			console.log("⚠ No anime data found from Bangumi API");
		}

		return textSet;
	} catch (error) {
		console.log(
			`⚠ Error processing Bangumi API config: ${error.message}, skipping anime text collection`,
		);
		return new Set();
	}
}

/**
 * 主文本收集函数 — 从所有来源收集 CJK 字符
 *
 * 采集来源（共 8 类）：
 *   本地：
 *     1. src/data/            — 数据文件
 *     2. 音乐播放器常量文件     — UI 文案
 *     3. src/config/          — 所有配置文件
 *     4. src/i18n/languages/  — 当前语言文件
 *     5. src/content/ 或外部内容目录 — 文章内容
 *     6. 常用字符 + 兜底词汇
 *   远程：
 *     7. Meting API           — 音乐歌单歌名/艺术家
 *     8. Bangumi API / Bilibili 数据 — 番剧标题/简介/标签等
 *
 * @returns {Promise<string>} 去重并排序后的所有字符拼接成的字符串（用于字体子集化）
 */
export async function collectText() {
	// 使用 Set 自动去重
	const textSet = new Set();

	// ===== 本地文件扫描（同步） =====
	collectFromDataDir(textSet);        // src/data 下的数据文件
	collectFromMusicConstants(textSet); // 音乐播放器常量
	collectFromConfig(textSet);         // src/config 下所有配置
	collectFromI18n(textSet);           // 当前语言 i18n 文件
	collectFromContent(textSet);        // content 目录（Markdown/MDX）

	// ===== 常用字符兜底 =====
	addCommonChars(textSet);

	// ===== 远程 API 数据采集（异步，串行执行避免并发过高） =====

	// 1. 音乐歌单（Meting API）
	const metingText = await fetchMetingPlaylistText();
	mergeSet(metingText, textSet);
	if (metingText.size > 0) {
		console.log(
			`✓ Added ${metingText.size} unique characters from music playlist`,
		);
	}

	// 2. Bangumi 番剧数据
	const bangumiText = await fetchBangumiAnimeText();
	mergeSet(bangumiText, textSet);
	if (bangumiText.size > 0) {
		console.log(
			`✓ Added ${bangumiText.size} unique characters from Bangumi anime data`,
		);
	}

	// 3. Bilibili 番剧数据
	const bilibiliText = await fetchBilibiliAnimeText();
	mergeSet(bilibiliText, textSet);
	if (bilibiliText.size > 0) {
		console.log(
			`✓ Added ${bilibiliText.size} unique characters from Bilibili anime data`,
		);
	}

	// 将 Set 转为数组，排序后拼接为字符串返回
	// 排序保证结果稳定，便于缓存和调试对比
	return Array.from(textSet).sort().join("");
}