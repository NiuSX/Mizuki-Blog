// 导入 Node.js 文件系统模块，用于读取文件
import fs from "node:fs";
// 导入 Node.js 路径模块，用于处理文件路径
import path from "node:path";
// 从工具模块导入项目根目录常量
import { ROOT_DIR } from "./utils.js";

/**
 * 缓存 siteConfig.ts 的原始文件内容
 * 作用：所有配置解析函数共享同一次文件读取，避免重复 I/O 操作
 * 初始值为 null，表示尚未读取过
 */
let _cachedContent = null;

/**
 * 读取 siteConfig.ts 配置文件内容（带缓存）
 * 首次调用时从磁盘读取文件并缓存，后续调用直接返回缓存内容
 * @returns {string} siteConfig.ts 的原始文本内容
 */
function readSiteConfig() {
	// 如果已有缓存，直接返回缓存内容，避免重复读取
	if (_cachedContent) return _cachedContent;
	// 拼接配置文件的绝对路径：项目根目录/src/config/siteConfig.ts
	const configPath = path.join(ROOT_DIR, "src/config/siteConfig.ts");
	// 同步读取文件内容（UTF-8 编码），并存入缓存
	_cachedContent = fs.readFileSync(configPath, "utf-8");
	// 返回读取到的内容
	return _cachedContent;
}

/**
 * 提取站点语言设置
 * 从 siteConfig.ts 中匹配 `const SITE_LANG = "xxx"` 语句
 * @returns {string} 语言代码，默认 "zh_CN"
 */
export function getLang() {
	// 获取配置文件内容（使用缓存）
	const content = readSiteConfig();
	// 正则匹配 SITE_LANG 常量定义，捕获引号内的语言值
	const match = content.match(/const SITE_LANG = ["'](.+?)["']/);
	// 若匹配成功返回捕获的语言值，否则返回默认值 "zh_CN"
	return match ? match[1] : "zh_CN";
}

/**
 * 提取字体配置
 * 只返回 enableCompress=true 且 localFonts 非空的字体配置
 * 支持的字体类型：asciiFont（ASCII 字体）和 cjkFont（中日韩字体）
 * @returns {Array<{type: string, files: string[], enableCompress: boolean}>} 字体配置数组
 */
export function getFontConfigs() {
	// 获取配置文件内容（使用缓存）
	const content = readSiteConfig();

	// 匹配 font: { ... } 配置块，使用非贪婪模式匹配到缩进的 `},` 结束
	const fontConfigMatch = content.match(/font:\s*\{([\s\S]*?)\n\t\},/);
	// 若未找到字体配置块，打印警告并返回空数组
	if (!fontConfigMatch) {
		console.log("⚠ Font config not found, using default settings");
		return [];
	}

	// 获取 font 配置块的内部字符串（不含外层大括号）
	const fontConfigStr = fontConfigMatch[1];
	// 用于存放解析后的字体配置
	const fonts = [];
	// 需要处理的字体类型列表
	const fontTypes = ["asciiFont", "cjkFont"];

	// 遍历每种字体类型，分别解析其配置
	for (const fontType of fontTypes) {
		// 动态构建正则，匹配 `asciiFont: { ... }` 或 `cjkFont: { ... }` 配置块
		const regex = new RegExp(`${fontType}:\\s*\\{([\\s\\S]*?)\\}`, "m");
		const match = fontConfigStr.match(regex);
		// 若当前字体类型不存在于配置中，跳过
		if (!match) continue;

		// 获取当前字体类型的配置内容
		const config = match[1];

		// 匹配 enableCompress 字段，判断是否启用字体压缩
		const compressMatch = config.match(/enableCompress:\s*(true|false)/);
		// 若未匹配到则默认为 false
		const enableCompress = compressMatch ? compressMatch[1] === "true" : false;

		// 匹配 localFonts 数组，s 标志使 . 可以匹配换行符
		const localFontsMatch = config.match(/localFonts:\s*\[(.*?)\]/s);
		// 用于存放解析出的本地字体文件路径
		let localFonts = [];
		// 若数组内容非空，则提取所有引号包裹的字符串
		if (localFontsMatch?.[1].trim()) {
			localFonts =
				localFontsMatch[1]
					// 匹配所有单引号或双引号包裹的字符串
					.match(/["']([^"']+)["']/g)
					// 去除引号，得到纯路径字符串
					?.map((s) => s.replace(/["']/g, "")) || [];
		}

		// 仅当启用了压缩且存在本地字体文件时，才加入结果数组
		if (enableCompress && localFonts.length > 0) {
			fonts.push({ type: fontType, files: localFonts, enableCompress });
		}
	}

	// 返回解析后的字体配置列表
	return fonts;
}

/**
 * 检查番剧页面是否启用
 * 从 siteConfig.ts 的 featurePages 配置块中读取 anime 字段
 * @returns {boolean} 是否启用番剧页面，默认 false
 */
export function isAnimePageEnabled() {
	// 获取配置文件内容（使用缓存）
	const content = readSiteConfig();
	// 匹配 featurePages: { ... } 配置块
	const match = content.match(/featurePages:\s*\{([\s\S]*?)\}/);
	// 若未找到 featurePages 配置块，返回 false
	if (!match) return false;
	// 在 featurePages 块内匹配 anime: true/false
	const animeMatch = match[1].match(/anime:\s*(true|false)/);
	// 返回布尔值，默认 false
	return animeMatch ? animeMatch[1] === "true" : false;
}

/**
 * 获取番剧模式
 * 从 siteConfig.ts 的 anime 配置块中读取 mode 字段
 * @returns {string} 番剧模式，默认 "bangumi"
 */
export function getAnimeMode() {
	// 获取配置文件内容（使用缓存）
	const content = readSiteConfig();
	// 匹配 anime: { ... mode: "xxx" ... } 中的 mode 值
	const match = content.match(/anime:\s*\{[\s\S]*?mode:\s*["']([^"']+)["']/);
	// 返回匹配到的模式，默认 "bangumi"
	return match ? match[1] : "bangumi";
}

/**
 * 获取 Bangumi 用户 ID
 * 从 siteConfig.ts 的 bangumi 配置块中读取 userId 字段
 * @returns {string|null} Bangumi 用户 ID，未配置时返回 null
 */
export function getBangumiUserId() {
	// 获取配置文件内容（使用缓存）
	const content = readSiteConfig();
	// 匹配 bangumi: { ... userId: "xxx" ... } 中的 userId 值
	const match = content.match(
		/bangumi:\s*\{[\s\S]*?userId:\s*["']([^"']+)["']/,
	);
	// 返回匹配到的用户 ID，未匹配则返回 null
	return match ? match[1] : null;
}

/**
 * 获取音乐播放器配置
 * 从 musicConfig.ts 文件读取，与 siteConfig.ts 分开处理
 * @returns {Object|null} 音乐配置对象，未启用或文件不存在时返回 null
 */
export function getMusicConfig() {
	// 拼接 musicConfig.ts 的绝对路径
	const configPath = path.join(ROOT_DIR, "src/config/musicConfig.ts");
	// 若文件不存在，返回 null
	if (!fs.existsSync(configPath)) return null;
	// 读取音乐配置文件内容（UTF-8 编码）
	const content = fs.readFileSync(configPath, "utf-8");

	// 匹配 musicPlayerConfig 的 enable 字段，判断播放器是否启用
	const enableMatch = content.match(
		/musicPlayerConfig:\s*MusicPlayerConfig\s*=\s*\{[\s\S]*?enable:\s*(true|false)/,
	);
	// 若未匹配到或 enable 为 false，则返回 null（不启用播放器）
	if (!enableMatch || enableMatch[1] === "false") {
		return null;
	}

	// 匹配整个 musicPlayerConfig 配置块（到 `};` 结束）
	const configMatch = content.match(
		/musicPlayerConfig:\s*MusicPlayerConfig\s*=\s*\{([\s\S]*?)\};/,
	);
	// 若未匹配到配置块，返回 null
	if (!configMatch) return null;

	// 获取配置块内部字符串
	const configStr = configMatch[1];
	/**
	 * 辅助函数：从配置字符串中提取指定字段的字符串值
	 * @param {string} field 字段名
	 * @returns {string|null} 字段值，未匹配时返回 null
	 */
	const extract = (field) => {
		const m = configStr.match(new RegExp(`${field}:\\s*["']([^"']+)["']`));
		return m ? m[1] : null;
	};

	// 返回解析后的音乐配置对象，各字段均有默认值兜底
	return {
		// 播放模式：meting 或 local，默认 meting
		mode: extract("mode") || "meting",
		// Meting API 地址，默认使用公共 API
		meting_api:
			extract("meting_api") ||
			"https://www.bilibili.uno/api?server=:server&type=:type&id=:id&auth=:auth&r=:r",
		// 歌单/歌曲 ID，默认使用预设 ID
		id: extract("id") || "14164869977",
		// 音乐平台：netease（网易云）等，默认 netease
		server: extract("server") || "netease",
		// 资源类型：playlist（歌单）等，默认 playlist
		type: extract("type") || "playlist",
	};
}

/**
 * 获取合并配置
 * 一次性读取所有配置并返回聚合对象
 * 由于 readSiteConfig 有缓存，内部各函数不会重复读取 siteConfig.ts
 * @returns {Object} 包含语言、字体、番剧、音乐等所有配置的聚合对象
 */
export function getConfig() {
	return {
		// 站点语言
		lang: getLang(),
		// 字体配置列表
		fonts: getFontConfigs(),
		// 番剧页面是否启用
		animeEnabled: isAnimePageEnabled(),
		// 番剧模式
		animeMode: getAnimeMode(),
		// Bangumi 用户 ID
		bangumiUserId: getBangumiUserId(),
		// 音乐播放器配置
		musicConfig: getMusicConfig(),
	};
}