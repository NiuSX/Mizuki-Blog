// 导入 Node.js 严格断言模块（strict 模式，使用 === 语义）
import assert from "node:assert/strict";
// 导入 Promise 版文件读取 API
import { readFile } from "node:fs/promises";

// 导入 fast-xml-parser 的解析器与校验器
import { XMLParser, XMLValidator } from "fast-xml-parser";
// 导入轻量级 HTML 解析器，用于查询 DOM 节点
import { parse } from "node-html-parser";

// 测试固件的标题（需同时出现在页面、RSS、Atom 中）
const FIXTURE_TITLE = "MDX Syntax Guide";
// 构建产物中的固件页面路径
const FIXTURE_PAGE = "dist/posts/content-pipeline-fixture/index.html";

/**
 * 将可能是单值或数组的值统一为数组
 * XML 解析器在只有一个子节点时会返回对象而非数组，需归一化处理
 * @param {*} value 任意值
 * @returns {Array} 数组形式的值
 */
function entries(value) {
	return Array.isArray(value) ? value : [value];
}

/**
 * 在 DOM 根节点中查找指定 href 的链接
 * @param {HTMLElement} root 根节点
 * @param {string} href 目标链接地址
 * @returns {HTMLElement|undefined} 匹配到的链接节点
 */
function findLink(root, href) {
	return root
		.querySelectorAll("a")
		.find((link) => link.getAttribute("href") === href);
}

/**
 * 断言 DOM 中不包含可执行标记（script 标签、on* 事件属性）
 * 用于验证 feed 输出已做安全净化，防止 XSS
 * @param {HTMLElement} root 根节点
 * @param {string} label 用于错误信息的标签（如 "RSS" / "Atom"）
 */
function assertNoExecutableMarkup(root, label) {
	// 不允许存在 <script> 标签
	assert.equal(root.querySelector("script"), null, `${label} contains a script`);
	// 遍历所有节点，检查是否含有 on* 事件属性（如 onclick、onerror）
	for (const node of root.querySelectorAll("*")) {
		for (const attribute of Object.keys(node.attributes)) {
			assert.doesNotMatch(
				attribute,
				/^on/i,
				`${label} contains event attribute ${attribute}`,
			);
		}
	}
}

/**
 * 断言 feed 中所有 URL 均为绝对地址（feed 阅读器无法解析相对路径）
 * 检查范围：href、src、srcset 中的候选 URL
 * @param {HTMLElement} root 根节点
 * @param {string} label 用于错误信息的标签
 */
function assertAbsoluteFeedUrls(root, label) {
	// 检查 href 和 src 属性
	for (const node of root.querySelectorAll("[href], [src]")) {
		for (const attribute of ["href", "src"]) {
			const value = node.getAttribute(attribute);
			// 跳过锚点、data:、mailto:、tel: 等非 HTTP URL
			if (!value || /^(?:#|data:|mailto:|tel:)/i.test(value)) continue;
			// URL.canParse 为 true 表示是绝对 URL
			assert.ok(URL.canParse(value), `${label} has relative ${attribute}: ${value}`);
		}
	}
	// 检查 srcset（可能包含多个逗号分隔的候选 URL）
	for (const node of root.querySelectorAll("[srcset]")) {
		for (const candidate of node.getAttribute("srcset").split(",")) {
			// 每个候选项格式为 "url 描述符"，取第一段作为 URL
			const value = candidate.trim().split(/\s+/)[0];
			assert.ok(URL.canParse(value), `${label} has relative srcset URL: ${value}`);
		}
	}
}

/**
 * 断言渲染后的固件内容包含所有预期元素
 * 对页面 HTML、RSS 内容、Atom 内容统一校验
 * @param {HTMLElement} root 根节点
 * @param {string} label 用于错误信息的标签
 * @param {Object} [options] 选项
 * @param {boolean} [options.feed=false] 是否为 feed 内容（feed 有更严格的绝对 URL 与安全要求）
 */
function assertRenderedFixture(root, label, { feed = false } = {}) {
	const html = root.toString();
	// 校验固件根标记存在
	assert.match(html, /data-content-pipeline-fixture/);
	// 校验 Astro 组件渲染的文本
	assert.match(html, /This panel is rendered by an imported Astro component/);
	// 校验实时表达式求值结果（主题数量为 3）
	assert.match(html, /This live expression counts 3 topics/);
	// 校验各类 MDX 渲染组件存在
	assert.ok(root.querySelector(".admonition"), `${label} is missing its callout`);
	assert.ok(root.querySelector(".card-wiki-link"), `${label} is missing its Wiki card`);
	assert.ok(root.querySelector("math"), `${label} is missing MathML`);
	assert.ok(root.querySelector(".rehype-code-group"), `${label} is missing its code group`);
	assert.ok(root.querySelector(".wlc-cover-image"), `${label} is missing its Wiki cover`);
	assert.ok(
		root.querySelector(".markdown-image-caption"),
		`${label} is missing its image caption`,
	);
	// 移除代码块、行内代码、script、style 后再检查正文文本
	// 目的是确保 MDX 语法本身没有被当作纯文本泄漏到最终输出
	const prose = parse(html);
	prose.querySelectorAll("pre,code,script,style").forEach((node) => {
		node.remove();
	});
	assert.doesNotMatch(
		prose.textContent,
		/import ContentPipelineFixture|<ContentPipelineFixture|:::note|\[\[guide/,
	);

	// 校验 Wiki 卡片内部不应嵌套链接（避免产生嵌套 <a>）
	const wikiCard = root.querySelector(".card-wiki-link");
	assert.equal(
		wikiCard.querySelectorAll("a").length,
		0,
		`${label} nests a link in its Wiki card`,
	);

	// 校验内部链接：带 data-content-link-kind="internal"，且不应有 target
	const internal = findLink(root, "https://mizuki.mysqil.com/about/");
	assert.equal(internal?.getAttribute("data-content-link-kind"), "internal");
	assert.equal(internal?.getAttribute("target"), undefined);
	// 校验外部链接：带 data-content-link-kind="external"，且应在新标签打开
	const external = findLink(root, "https://example.com/reference");
	assert.equal(external?.getAttribute("data-content-link-kind"), "external");
	assert.equal(external?.getAttribute("target"), "_blank");

	// 根据是否为 feed 走不同的额外校验分支
	if (feed) {
		// feed：禁止可执行标记，且所有 URL 必须为绝对地址
		assertNoExecutableMarkup(root, label);
		assertAbsoluteFeedUrls(root, label);
	} else {
		// 页面：校验 Wiki 封面图使用了正确的 Astro 资源路径和响应式 srcset
		const wikiCover = root.querySelector(".wlc-cover-image");
		assert.match(wikiCover.getAttribute("src"), /^\/_astro\//);
		assert.match(wikiCover.getAttribute("srcset"), /160w/);
		assert.match(wikiCover.getAttribute("srcset"), /320w/);
		assert.match(wikiCover.getAttribute("srcset"), /480w/);
	}
}

// 并行读取三个构建产物：页面 HTML、RSS、Atom
const [pageHtml, rssXml, atomXml] = await Promise.all([
	readFile(FIXTURE_PAGE, "utf8"),
	readFile("dist/rss.xml", "utf8"),
	readFile("dist/atom.xml", "utf8"),
]);

// 严格校验 RSS 与 Atom 均为合法 XML
for (const [label, xml] of [
	["RSS", rssXml],
	["Atom", atomXml],
]) {
	assert.equal(XMLValidator.validate(xml), true, `${label} is not strict XML`);
}

// 创建 XML 解析器：
// - ignoreAttributes: false 保留属性（feed 中可能含关键属性）
// - cdataPropName: "__cdata" 将 CDATA 内容挂到 __cdata 字段，便于提取
const parser = new XMLParser({
	ignoreAttributes: false,
	cdataPropName: "__cdata",
});
const rss = parser.parse(rssXml);
const atom = parser.parse(atomXml);
// 从 RSS 中查找标题匹配的固件条目
const rssItem = entries(rss.rss.channel.item).find(
	(item) => item.title === FIXTURE_TITLE,
);
// 从 Atom 中查找标题匹配的固件条目
const atomEntry = entries(atom.feed.entry).find(
	(item) => item.title === FIXTURE_TITLE,
);
assert.ok(rssItem, "RSS fixture item is missing");
assert.ok(atomEntry, "Atom fixture entry is missing");

// 提取 RSS 与 Atom 中的正文内容
const rssContent = rssItem["content:encoded"];
const atomContent = atomEntry.content.__cdata;
// 关键断言：两种 feed 的正文内容必须完全一致，避免不同渲染路径产生差异
assert.equal(rssContent.trim(), atomContent.trim(), "RSS and Atom content diverged");

// 分别对页面、RSS、Atom 三种输出做统一的渲染结果校验
assertRenderedFixture(parse(pageHtml), "page");
assertRenderedFixture(parse(rssContent), "RSS", { feed: true });
assertRenderedFixture(parse(atomContent), "Atom", { feed: true });

// 全部断言通过，打印成功信息
console.log("Content pipeline build output verified.");