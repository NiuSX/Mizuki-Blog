<script lang="ts">
	// 导入 i18n 相关：key 枚举与翻译函数
	import I18nKey from "@i18n/i18nKey";
	import { i18n } from "@i18n/translation";
	// 导入日期工具：格式化日期、取日期各部分
	import { formatDateToYYYYMMDD, getPostDateParts } from "@utils/date-utils";
	// 导入发布时间比较函数（倒序）
	import { comparePublishedDatesDescending } from "@utils/post-date-utils";
	// 导入 Svelte 生命周期：onMount
	import { onMount } from "svelte";
	// 导入类型：归档面板属性、分组、文章
	import type { ArchivePanelProps, Group, Post } from "./types";

	// 解构 props，tags / categories 用 $bindable 支持双向绑定
	let {
		tags = $bindable([]),
		categories = $bindable([]),
		sortedPosts = [],
	}: ArchivePanelProps = $props();

	// ===== 从 URL 查询参数初始化筛选条件 =====
	// 支持通过 URL 直达特定筛选结果，如 /archive/?tag=Svelte&category=前端
	const params = new URLSearchParams(window.location.search);
	// tag 参数可重复（getAll）→ 支持多标签筛选
	tags = params.has("tag") ? params.getAll("tag") : [];
	// category 同理
	categories = params.has("category") ? params.getAll("category") : [];
	// uncategorized 参数：只显示无分类的文章
	const uncategorized = params.get("uncategorized");

	// 分组后的数据（响应式状态）
	let groups = $state<Group[]>([]);

	/**
	 * 格式化日期为 "MM-DD" 形式（去掉年份）
	 * 因为年份已作为分组标题显示，条目内无需重复
	 * @param {Date} date 日期
	 * @param {boolean} dateOnly 是否只显示日期（无时间）
	 * @returns {string} 如 "09-14"
	 */
	function formatDate(date: Date, dateOnly: boolean) {
		// 取 YYYY-MM-DD 后截掉前 5 位（"YYYY-"），得到 "MM-DD"
		return formatDateToYYYYMMDD(date, dateOnly).slice(5);
	}

	/**
	 * 将标签数组格式化为 "#tag1 #tag2" 形式
	 * @param {string[]} tagList 标签数组
	 * @returns {string} 格式化后的标签字符串
	 */
	function formatTag(tagList: string[]) {
		return tagList.map((t) => `#${t}`).join(" ");
	}

	onMount(async () => {
		// 从完整文章列表开始过滤
		let filteredPosts: Post[] = sortedPosts;

		// ===== 按标签筛选 =====
		if (tags.length > 0) {
			filteredPosts = filteredPosts.filter(
					(post) =>
							// 文章有 tags 且与筛选条件有交集
							Array.isArray(post.data.tags) &&
							post.data.tags.some((tag) => tags.includes(tag)),
			);
		}

		// ===== 按分类筛选 =====
		if (categories.length > 0) {
			filteredPosts = filteredPosts.filter(
					(post) => post.data.category && categories.includes(post.data.category),
			);
		}

		// ===== 仅显示无分类文章 =====
		if (uncategorized) {
			filteredPosts = filteredPosts.filter((post) => !post.data.category);
		}

		// 按发布时间倒序排序，确保不受置顶影响
		// 说明：sortedPosts 可能已被"置顶"逻辑打乱顺序，
		// 这里强制按 published 重新排序，保证归档的时序性
		filteredPosts = filteredPosts
				.slice()   // 先复制，避免修改原数组
				.sort((a, b) =>
						comparePublishedDatesDescending(
								a.data.published,
								b.data.published,
								a.id,
								b.id,
						),
				);

		// ===== 按年份分组 =====
		// reduce 累积成 { 2024: [...], 2023: [...], ... } 形式
		const grouped = filteredPosts.reduce(
				(acc, post) => {
					// 取文章的发布年份
					const year = getPostDateParts(
							post.data.published,
							post.data._publishedDateOnly,
					).year;
					// 该年份组不存在则初始化
					if (!acc[year]) {
						acc[year] = [];
					}
					acc[year].push(post);
					return acc;
				},
				{} as Record<number, Post[]>,
		);

		// 将对象转为数组（便于遍历与排序）
		const groupedPostsArray = Object.keys(grouped).map((yearStr) => ({
			year: Number.parseInt(yearStr, 10),
			posts: grouped[Number.parseInt(yearStr, 10)],
		}));

		// 年份倒序（最新年份在前）
		groupedPostsArray.sort((a, b) => b.year - a.year);

		// 更新响应式状态，触发渲染
		groups = groupedPostsArray;
	});
</script>

<!-- 面板容器 -->
<div class="card-base px-8 py-6">
	<!-- 遍历每个年份分组（用 year 作为 key） -->
	{#each groups as group (group.year)}
		<div>
			<!-- ===== 年份标题行 ===== -->
			<div class="flex flex-row w-full items-center h-15">
				<!-- 年份数字（右对齐） -->
				<div
						class="w-[15%] md:w-[10%] transition text-2xl font-bold text-right text-75"
				>
					{group.year}
				</div>
				<!-- 时间轴圆点 -->
				<div class="w-[15%] md:w-[10%]">
					<div
							class="h-3 w-3 bg-none rounded-full outline outline-(--primary) mx-auto
                  -outline-offset-2 z-50"
					></div>
				</div>
				<!-- 该年份的文章数量（单复数由 i18n 处理） -->
				<div class="w-[70%] md:w-[80%] transition text-left text-50">
					{group.posts.length}
					{i18n(
							group.posts.length === 1
									? I18nKey.postCount   // 单数："1 篇"
									: I18nKey.postsCount, // 复数："N 篇"
					)}
				</div>
			</div>

			<!-- ===== 该年份下的文章列表 ===== -->
			{#each group.posts as post (post.id)}
				<!-- 文章链接：group 类使内部元素可响应父悬停 -->
				<a
						href={post.url || `/posts/${post.id}/`}
						aria-label={post.data.title}
						class="group btn-plain block! h-10 w-full rounded-lg hover:text-[initial]"
				>
					<div
							class="flex flex-row justify-start items-center h-full"
					>
						<!-- 日期：显示 MM-DD -->
						<div
								class="w-[15%] md:w-[10%] transition text-sm text-right text-50"
						>
							{formatDate(post.data.published, post.data._publishedDateOnly)}
						</div>

						<!-- 时间轴：圆点 + 虚线 -->
						<div
								class="w-[15%] md:w-[10%] relative dash-line h-full flex items-center"
						>
							<!--
							  时间轴圆点：
							  - 默认 1×1 小点
							  - 悬停时变高为 5（h-5）形成"胶囊"效果
							  - 颜色从低饱和变主色
							  - outline 模拟白色描边（随背景切换）
							-->
							<div
									class="transition-all mx-auto w-1 h-1 rounded group-hover:h-5
                       bg-[oklch(0.5_0.05_var(--hue))] group-hover:bg-(--primary) outline-4 z-50
                       outline-(--card-bg)
                       group-hover:outline-(--btn-plain-bg-hover)
                       group-active:outline-(--btn-plain-bg-active)"
							></div>
						</div>

						<!-- 文章标题：悬停时右移 + 变主色，超长省略 -->
						<div
								class="w-[70%] md:max-w-[65%] md:w-[65%] text-left font-bold
                     group-hover:translate-x-1 transition-all group-hover:text-(--primary)
                     text-75 pr-8 whitespace-nowrap text-ellipsis overflow-hidden"
						>
							{post.data.title}
						</div>

						<!-- 标签列表：仅平板及以上显示 -->
						<div
								class="hidden md:block md:w-[15%] text-left text-sm transition
                     whitespace-nowrap text-ellipsis overflow-hidden text-30"
						>
							{formatTag(post.data.tags)}
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/each}
</div>