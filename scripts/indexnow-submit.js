// 导入 Node.js 文件系统模块，用于读取文件与存在性检查
import fs from "node:fs";
// 导入 Node.js 路径模块
import path from "node:path";
// 导入 URL 转换工具，将 import.meta.url 转为文件路径
import { fileURLToPath } from "node:url";
// 导入环境变量加载模块（从 .env 读取 INDEXNOW_KEY / INDEXNOW_HOST 等）
import { loadEnv } from "./load-env.js";

// 当前脚本文件的绝对路径
const __filename = fileURLToPath(import.meta.url);
// 当前脚本所在目录的绝对路径
const __dirname = path.dirname(__filename);

// 先加载环境变量，后续 process.env 才能读到 .env 中的配置
loadEnv();

/**
 * 从 sitemap 文件中解析 URL 列表
 * sitemap 是 XML 格式，URL 都包在 <loc>...</loc> 标签内
 * @param {string} sitemapPath sitemap 文件的绝对路径
 * @returns {string[]} 解析出的 URL 数组；解析失败时返回空数组
 */
function parseSitemap(sitemapPath) {
	// 同步读取 sitemap 内容
	const sitemapContent = fs.readFileSync(sitemapPath, "utf-8");

	// 使用正则表达式提取所有 <loc>...</loc> 标签
	const urlMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g);

	// 没有匹配到任何 URL，说明 sitemap 格式异常或为空
	if (!urlMatches) {
		console.error("❌ No URLs found in sitemap");
		return [];
	}

	// 去除每个匹配项外层的 <loc> 和 </loc> 标签，得到纯 URL
	const urls = urlMatches.map((match) => {
		const url = match.replace(/<loc>|<\/loc>/g, "").trim();
		return url;
	});

	console.log(`✓ Parsed ${urls.length} URLs from sitemap`);
	return urls;
}

/**
 * 提交 URL 列表到 Bing IndexNow API
 * IndexNow 是必应等搜索引擎支持的即时收录协议，提交后可加快页面被索引
 * @param {string[]} urls 待提交的 URL 数组
 */
async function submitToIndexNow(urls) {
	// 空数组直接返回，避免无意义请求
	if (!urls || urls.length === 0) {
		console.log("⚠ No URLs to submit");
		return;
	}

	// 限制每次提交的 URL 数量（IndexNow API 有数量限制）
	const MAX_URLS_PER_REQUEST = 10000; // IndexNow API 限制最大 10000 个URL
	// 将 URL 数组按上限切分成多个批次
	const urlChunks = [];

	for (let i = 0; i < urls.length; i += MAX_URLS_PER_REQUEST) {
		urlChunks.push(urls.slice(i, i + MAX_URLS_PER_REQUEST));
	}

	// 从环境变量读取 API 密钥与站点主机名
	const apiKey = process.env.INDEXNOW_KEY;
	const host = process.env.INDEXNOW_HOST;
	// key 校验文件的公开地址，搜索引擎会访问此地址验证 key 归属
	const keyLocation = `https://${host}/${apiKey}.txt`;

	// 缺少必要配置时直接返回（不抛异常，避免中断整体流程）
	if (!apiKey || !host) {
		console.error(
			"❌ Missing required environment variables: INDEXNOW_KEY or INDEXNOW_HOST",
		);
		console.error("   Please configure these variables in the .env file");
		return;
	}

	// 逐批提交，串行执行避免触发限流
	for (let i = 0; i < urlChunks.length; i++) {
		const chunk = urlChunks[i];
		console.log(
			`\n📊 Submitting batch ${i + 1}/${urlChunks.length} URLs (${chunk.length} URLs)...`,
		);

		try {
			// 调用 IndexNow 官方 API
			const response = await fetch("https://api.indexnow.org/IndexNow", {
				method: "POST",
				headers: {
					"Content-Type": "application/json; charset=utf-8",
				},
				body: JSON.stringify({
					host: host,
					key: apiKey,
					keyLocation: keyLocation,
					urlList: chunk,
				}),
			});

			// 200：标准成功
			if (response.status === 200) {
				console.log(`✅ Batch ${i + 1} URLs submitted successfully`);
			} else if (response.status === 202) {
				// 202：请求已接受但仍在处理中（非标准成功码，需留意文档变更）
				console.warn(
					`⚠ Batch ${i + 1} request accepted but still processing (Status code: ${response.status})`,
				);
				console.warn(
					"This is not a standard success status code, you may need to check API documentation",
				);
			} else {
				// 其他状态码：视为失败，打印响应体和更详细的错误说明
				console.error(
					`❌ Batch ${i + 1} URLs submission failed, Status code: ${response.status}`,
				);
				const responseBody = await response.text();
				console.error(`   Response body: ${responseBody}`);

				// 根据状态码提供更详细的错误信息
				switch (response.status) {
					case 400:
						console.error("   Error: Request format is invalid");
						break;
					case 403:
						console.error(
							"   Error: API key is invalid or authentication failed",
						);
						break;
					case 422:
						console.error(
							"   Error: URL does not belong to specified host or key mismatch",
						);
						break;
					case 429:
						console.error(
							"   Error: Request too frequent, may be considered as spam",
						);
						break;
					default:
						console.error(
							`   Error: Other error, status code ${response.status}`,
						);
				}
			}
		} catch (error) {
			// 网络异常等不影响后续批次继续提交
			console.error(
				`❌ Error occurred during batch ${i + 1} URL submission:`,
				error.message,
			);
		}
	}
}

/**
 * 主函数：解析 sitemap → 过滤 URL → 提交到 IndexNow
 */
async function main() {
	console.log("🚀 Starting Bing IndexNow URL submission task...\n");

	// 构建输出目录路径
	const distDir = path.join(__dirname, "../dist");
	const sitemapPath = path.join(distDir, "sitemap-0.xml");

	// sitemap 不存在说明尚未构建，直接退出
	if (!fs.existsSync(sitemapPath)) {
		console.error(`❌ Sitemap file not found: ${sitemapPath}`);
		console.error(
			"   Please ensure the project is built before running this script",
		);
		process.exit(1);
	}

	try {
		// 解析 sitemap 获取 URL 列表
		const urls = parseSitemap(sitemapPath);

		if (urls.length === 0) {
			console.log("⚠ No URLs found in sitemap, skipping submission");
			return;
		}

		// 过滤出有效的 URL（以指定主机开头的）
		// 避免把 sitemap 中可能存在的第三方域名 URL 提交给 IndexNow
		const host = process.env.INDEXNOW_HOST;
		const filteredUrls = urls.filter(
			(url) =>
				url.startsWith(`https://${host}/`) || url.startsWith(`http://${host}/`),
		);

		console.log(`✓ Filtered to ${filteredUrls.length} valid URLs`);

		// 过滤后为空则不提交
		if (filteredUrls.length === 0) {
			console.log("⚠ No URLs matching the host found, skipping submission");
			return;
		}

		// 提交 URL 到 IndexNow
		await submitToIndexNow(filteredUrls);

		console.log("\n🎉 Bing IndexNow URL submission task completed!");
	} catch (error) {
		// 顶层异常：打印后以非零码退出，提示 CI 中该步骤失败
		console.error("❌ Error occurred during execution:", error.message);
		process.exit(1);
	}
}

// 运行主函数（顶层 await，ESM 环境支持）
await main();