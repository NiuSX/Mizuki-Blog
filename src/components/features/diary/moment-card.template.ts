// Memos API 集成 — 类型定义、数据转换和卡片渲染
// 参考: DIARY_MEMOS_SETUP.md

// 导入日记条目类型（本模块的最终输出格式）
import type { DiaryItem } from "../../../data/diary";

// ============================================================
// 第一部分：Memos API 响应类型
// Memos 是一个开源的自托管备忘录/日记服务
// 以下类型对应其 REST API 返回的数据结构
// ============================================================

/**
 * Memo 的附件（图片、文件等）
 */
export interface MemoAttachment {
	/** 附件资源名（用于拼接访问 URL） */
	name: string;
	/** 文件名 */
	filename: string;
	/** MIME 类型（如 "image/png"） */
	type: string;
	/** 文件大小（字符串形式） */
	size: string;
	/** 所属 memo 的资源名 */
	memo: string;
}

/**
 * Memo 的位置信息
 */
export interface MemoLocation {
	/** 地点描述（如 "上海市"） */
	placeholder: string;
	/** 纬度 */
	latitude: number;
	/** 经度 */
	longitude: number;
}

/**
 * 单条 Memo
 */
export interface Memo {
	/** 资源名（唯一标识） */
	name: string;
	/** 状态（NORMAL / ARCHIVED 等） */
	state: string;
	/** 创建者资源名 */
	creator: string;
	/** 创建时间（ISO 字符串） */
	createTime: string;
	/** 显示时间（可能被用户修改过） */
	displayTime: string;
	/** 正文内容（Markdown 格式） */
	content: string;
	/** 可见性（PUBLIC / PRIVATE / PROTECTED） */
	visibility: string;
	/** 是否置顶 */
	pinned: boolean;
	/** 标签列表 */
	tags: string[];
	/** 附件列表 */
	attachments: MemoAttachment[];
	/** 位置信息（可选） */
	location?: MemoLocation;
	/** 内容摘要 */
	snippet: string;
}

/**
 * Memos API 列表接口的响应
 */
export interface MemosResponse {
	/** 本页的 memo 列表 */
	memos: Memo[];
	/** 下一页的分页 token（空字符串表示没有更多） */
	nextPageToken: string;
}

// ============================================================
// 第二部分：数据转换
// 把 Memos 的原始数据结构转换为项目统一的 DiaryItem 格式
// ============================================================

/**
 * 将 Memos 数据转换为日记条目
 * @param {Memo[]} memos 原始 memo 列表
 * @param {string} baseUrl Memos 服务的基础地址（用于拼接附件 URL）
 * @returns {DiaryItem[]} 转换后的日记条目（已排序）
 */
export function transformMemosToDiary(
	memos: Memo[],
	baseUrl: string,
): DiaryItem[] {
	return memos
		// 只保留"公开且正常"的 memo（过滤掉私密、归档等）
		.filter((m) => m.visibility === "PUBLIC" && m.state === "NORMAL")
		.map((m, i) => ({
			// 用索引作为 id（因为 DiaryItem 要求数字 id）
			id: i,
			content: m.content,
			date: m.createTime,
			// 标签：空数组时转为 undefined（保持数据结构干净）
			tags: m.tags.length > 0 ? m.tags : undefined,
			// 图片：过滤出 image/* 类型的附件，拼接完整 URL
			images:
				m.attachments.length > 0
					? m.attachments
						.filter((a) => a.type.startsWith("image/"))
						.map((a) => `${baseUrl}/file/${a.name}/${a.filename}`)
					: undefined,
			// 位置：只取描述文本
			location: m.location?.placeholder,
			// 心情字段暂未从 Memos 获取
			mood: undefined,
		}))
		.sort((a, b) => {
			// pinned 优先，其次按时间倒序
			// 说明：因为前面 map 时丢失了 pinned 信息，这里通过 createTime 反查
			const aM = memos.find((m) => m.createTime === a.date);
			const bM = memos.find((m) => m.createTime === b.date);
			// a 置顶、b 不置顶 → a 排前
			if (aM?.pinned && !bM?.pinned) {
				return -1;
			}
			// a 不置顶、b 置顶 → b 排前
			if (!aM?.pinned && bM?.pinned) {
				return 1;
			}
			// 都置顶或都不置顶 → 按时间倒序
			return new Date(b.date).getTime() - new Date(a.date).getTime();
		});
}

// ============================================================
// 第三部分：相对时间格式化（客户端版本）
// ============================================================

/**
 * 将日期格式化为相对时间（如 "5分钟前"、"3小时前"、"2天前"）
 * @param {string} dateString ISO 日期字符串
 * @param {string} minutesAgo 分钟后缀（i18n，如 "分钟前"）
 * @param {string} hoursAgo 小时后缀
 * @param {string} daysAgo 天后缀
 * @returns {string} 格式化后的相对时间
 */
export function formatRelativeTime(
	dateString: string,
	minutesAgo: string,
	hoursAgo: string,
	daysAgo: string,
): string {
	const date = new Date(dateString);
	// 计算距今的分钟差
	const diffInMinutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));

	// 1 小时内 → 显示分钟
	if (diffInMinutes < 60) {
		return `${diffInMinutes}${minutesAgo}`;
	}
	// 1 天内 → 显示小时
	if (diffInMinutes < 1440) {
		// 1440 = 24 * 60
		return `${Math.floor(diffInMinutes / 60)}${hoursAgo}`;
	}
	// 超过 1 天 → 显示天数
	return `${Math.floor(diffInMinutes / 1440)}${daysAgo}`;
}

// ============================================================
// 第四部分：单张卡片 HTML 生成
// ============================================================

/**
 * 根据图片数量返回对应的布局类名
 * 1 张：单图（大图）
 * 2 张：两列
 * 3 张：三列
 * 4+ 张：网格
 * @param {number} count 图片数量
 * @returns {string} 布局类名
 */
function getImageLayoutClass(count: number): string {
	if (count === 1) {
		return "diary-images-single";
	}
	if (count === 2) {
		return "diary-images-double";
	}
	if (count === 3) {
		return "diary-images-triple";
	}
	return "diary-images-grid";
}

/**
 * HTML 转义：防止内容中的特殊字符破坏 HTML 结构或引发 XSS
 * @param {string} text 原始文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text: string): string {
	const map: Record<string, string> = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#039;",
	};
	return text.replace(/[&<>"']/g, (c) => map[c]);
}

/**
 * 渲染单张日记卡片的 HTML 字符串
 * @param {DiaryItem} moment 日记条目
 * @param {number} index 索引（用于生成唯一的 fancybox 分组名）
 * @param {Object} opts i18n 相对时间后缀
 * @returns {string} 卡片 HTML
 */
function renderMomentCard(
	moment: DiaryItem,
	index: number,
	opts: {
		minutesAgo: string;
		hoursAgo: string;
		daysAgo: string;
	},
): string {
	// 计算相对时间
	const relativeTime = formatRelativeTime(
		moment.date,
		opts.minutesAgo,
		opts.hoursAgo,
		opts.daysAgo,
	);

	// 标签属性（供外部筛选脚本使用）
	const tagsAttr = moment.tags?.join(",") || "";

	// ===== 图片区 =====
	let imagesHtml = "";
	if (moment.images && moment.images.length > 0) {
		const layoutClass = getImageLayoutClass(moment.images.length);
		const imgs = moment.images
			.map(
				(img, i) => `
				<div class="relative rounded-lg overflow-hidden aspect-square cursor-pointer">
					<!-- data-fancybox 分组名含 index 和 i，保证同一条日记的图片同组、不同日记不同组 -->
					<a href="javascript:void(0)" data-src="${escapeHtml(img)}" data-fancybox="diary-${index}-${i}" class="block w-full h-full">
						<img src="${escapeHtml(img)}" alt="diary moment image" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" loading="lazy" decoding="async" />
					</a>
				</div>`,
			)
			.join("");
		imagesHtml = `<div class="diary-images grid gap-2 mb-3 ${layoutClass}">${imgs}</div>`;
	}

	// ===== 标签区 =====
	let tagsHtml = "";
	if (moment.tags && moment.tags.length > 0) {
		const tagSpans = moment.tags
			.map(
				(tag) =>
					`<span class="btn-regular h-6 text-xs px-2 rounded-lg">${escapeHtml(tag)}</span>`,
			)
			.join("");
		tagsHtml = `<div class="flex flex-wrap gap-1.5 mb-3">${tagSpans}</div>`;
	}

	// ===== 位置区（可选）=====
	const locationHtml = moment.location
		? `<span class="flex items-center gap-1"><iconify-icon icon="material-symbols:location-on" class="text-xs w-3.5 h-3.5"></iconify-icon>${escapeHtml(moment.location)}</span>`
		: "";

	// ===== 组装完整卡片 =====
	// 注意：所有用户内容都经过 escapeHtml 转义，防止 XSS
	return `
	<div class="moment-card group relative bg-transparent rounded-xl border border-black/10 dark:border-white/10 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1" data-tags="${tagsAttr}">
		<div class="p-5">
			<p class="text-sm md:text-base text-black/90 dark:text-white/90 leading-relaxed mb-3">${escapeHtml(moment.content)}</p>
			${imagesHtml}
			${tagsHtml}
			<hr class="border-t border-black/5 dark:border-white/5 my-3" />
			<div class="flex items-center justify-between text-xs text-black/50 dark:text-white/50 flex-wrap gap-2">
				<div class="flex items-center gap-1.5">
					<iconify-icon icon="material-symbols:schedule" class="text-xs w-3.5 h-3.5"></iconify-icon>
					<time datetime="${escapeHtml(moment.date)}">${relativeTime}</time>
				</div>
				<div class="flex items-center gap-3">
					${locationHtml}
				</div>
			</div>
		</div>
		<!-- 悬停渐变叠层（与 AIToolCard / AlbumCard 一致的设计语言） -->
		<div class="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
	</div>`;
}

// ============================================================
// 第五部分：全部卡片 HTML 生成
// ============================================================

/**
 * 渲染所有日记卡片的 HTML 字符串
 * @param {DiaryItem[]} moments 日记条目列表
 * @param {Object} opts i18n 相对时间后缀
 * @returns {string} 所有卡片拼接后的 HTML
 */
export function renderMomentCards(
	moments: DiaryItem[],
	opts: {
		minutesAgo: string;
		hoursAgo: string;
		daysAgo: string;
	},
): string {
	return moments.map((m, i) => renderMomentCard(m, i, opts)).join("");
}