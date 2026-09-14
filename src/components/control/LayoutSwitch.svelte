<script lang="ts">
	// 导入 i18n 相关：key 枚举与翻译函数
	import I18nKey from "@i18n/i18nKey";
	import { i18n } from "@i18n/translation";
	// 导入 Svelte 生命周期：onMount（组件挂载时执行）
	import { onMount } from "svelte";

	// 导入站点配置
	import { sidebarLayoutConfig, siteConfig } from "../../config";

	/** 布局模式类型：列表 或 网格 */
	type LayoutMode = "list" | "grid";

	/**
	 * 组件属性：
	 * - currentLayout 用 $bindable 声明为可双向绑定（父组件可用 bind:currentLayout）
	 * - 默认值为 "list"
	 */
	let { currentLayout = $bindable("list") } = $props<{
		currentLayout?: LayoutMode;
	}>();

	// ===== 响应式状态 =====
	/** 组件是否已挂载（避免 SSR 阶段访问 window） */
	let mounted = $state(false);
	/** 是否为小屏（小屏时强制列表布局，不显示切换按钮） */
	let isSmallScreen = $state(false);
	/** 是否正在播放切换动画（动画期间禁用按钮） */
	let isSwitching = $state(false);
	/** 用户主动选择的布局偏好（持久化存储） */
	let userPreference = $state<LayoutMode>("list");
	/** 媒体查询对象（用于监听屏幕尺寸变化） */
	let mediaQueryList: MediaQueryList | null = null;

	/** 桌面断点：≥ 该宽度视为大屏，允许切换布局 */
	const BREAKPOINT = sidebarLayoutConfig.responsive?.breakpoints?.desktop ?? 1280;

	/**
	 * 计算实际生效的布局（派生值）：
	 * - 小屏：强制 "list"（手机上一列更易读）
	 * - 大屏：使用用户偏好
	 */
	const computedLayout = $derived(isSmallScreen ? "list" : userPreference);

	/**
	 * 副作用：当 computedLayout 变化时，
	 * 1. 同步到双向绑定的 currentLayout
	 * 2. 广播 layoutChange 事件，通知其它组件
	 */
	$effect(() => {
		currentLayout = computedLayout;
		dispatchLayoutChange(computedLayout);
	});

	/**
	 * 派发 layoutChange 自定义事件
	 * 供其它组件（如 PostList）监听布局变化
	 * @param {LayoutMode} layout 当前布局
	 */
	function dispatchLayoutChange(layout: LayoutMode) {
		// 仅在浏览器环境执行（避免 SSR 报错）
		if (typeof window !== "undefined") {
			window.dispatchEvent(
					new CustomEvent("layoutChange", {
						detail: { layout },
					}),
			);
		}
	}

	// 辅助函数：同时更新两种存储
	// sessionStorage 用于判断当前会话状态（关闭标签页失效）
	// localStorage 用于兼容其他组件（如 PostPage.astro）
	// TODO: 使用 sessionStorage 存储状态，关闭标签页即销毁。不应把缓存数据存在访客本地电脑上
	/**
	 * 同时写入 sessionStorage 与 localStorage
	 * - sessionStorage：本会话内有效，关闭标签页即清空（隐私更好）
	 * - localStorage：兼容其它组件（它们可能只读 localStorage）
	 * @param {LayoutMode} layout 要保存的布局
	 */
	function updateStorage(layout: LayoutMode) {
		sessionStorage.setItem("postListLayout", layout);
		localStorage.setItem("postListLayout", layout);
	}

	/**
	 * 从 sessionStorage 读取已保存的布局
	 * @returns {LayoutMode|null} 保存的布局，无有效值时返回 null
	 */
	function getSavedSessionLayout(): LayoutMode | null {
		return sessionStorage.getItem("postListLayout") as LayoutMode;
	}

	/**
	 * 切换布局（列表 ↔ 网格）
	 * 多个保护条件：未挂载 / 小屏 / 动画中 都直接返回
	 */
	function switchLayout() {
		// 未挂载、小屏、动画进行中 → 忽略点击
		if (!mounted || isSmallScreen || isSwitching) {
			return;
		}

		isSwitching = true;
		// 在两种布局间切换
		const newLayout = userPreference === "list" ? "grid" : "list";
		userPreference = newLayout;

		// 更新存储
		updateStorage(newLayout);
	}

	/** 图标旋转动画结束时调用，解除"切换中"锁定 */
	function onAnimationEnd() {
		isSwitching = false;
	}

	/**
	 * 媒体查询变化回调：更新 isSmallScreen
	 * 注意 MediaQueryList 的 matches 表示"是否满足 (min-width: BREAKPOINT)"，
	 * 所以 isSmallScreen = !matches
	 */
	function handleMediaQueryChange(e: MediaQueryListEvent | MediaQueryList) {
		isSmallScreen = !e.matches;
	}

	onMount(() => {
		mounted = true;

		// 读取配置：是否启用布局切换、默认布局
		const layoutEnabled = siteConfig.postListLayout?.enable ?? true;
		const sessionLayout = layoutEnabled ? getSavedSessionLayout() : null;
		const defaultLayout = siteConfig.postListLayout.defaultMode as LayoutMode;

		// 优先使用会话中保存的布局，否则用配置的默认值
		if (sessionLayout === "list" || sessionLayout === "grid") {
			userPreference = sessionLayout;

			// 若 localStorage 与 sessionStorage 不一致，同步一次
			if (localStorage.getItem("postListLayout") !== sessionLayout) {
				localStorage.setItem("postListLayout", sessionLayout);
			}
		} else {
			userPreference = defaultLayout;
			updateStorage(defaultLayout);
		}

		// ===== 设置媒体查询监听 =====
		mediaQueryList = window.matchMedia(`(min-width: ${BREAKPOINT}px)`);
		// 立即执行一次，初始化 isSmallScreen
		handleMediaQueryChange(mediaQueryList);
		// 监听后续尺寸变化
		mediaQueryList.addEventListener("change", handleMediaQueryChange);

		/**
		 * 处理 layoutChange 自定义事件
		 * 其它组件也可能派发此事件（如外部控制），同步到本地状态
		 */
		const handleCustomEvent = (event: CustomEvent<{ layout: LayoutMode }>) => {
			if (event.detail?.layout) {
				userPreference = event.detail.layout;
			}
		};

		/**
		 * 处理页面切换（swup / popstate）后的布局恢复
		 * 延迟 200ms 等待新 DOM 就绪
		 */
		const handleSwupEvent = () => {
			setTimeout(() => {
				const saved = getSavedSessionLayout();
				if (saved === "list" || saved === "grid") {
					userPreference = saved;
				} else {
					userPreference = siteConfig.postListLayout.defaultMode as LayoutMode;
				}
			}, 200);
		};

		// 监听自定义布局变化事件
		window.addEventListener("layoutChange", handleCustomEvent as EventListener);

		/**
		 * 设置 swup 钩子（若可用）
		 * 页面切换后恢复布局；swup 不可用时回退到 popstate
		 */
		const setupSwup = () => {
			const swup = window.swup;
			if (swup?.hooks) {
				swup.hooks.on("content:replace", handleSwupEvent);
				swup.hooks.on("page:view", handleSwupEvent);
			} else {
				window.addEventListener("popstate", handleSwupEvent);
			}
		};

		// swup 可能尚未初始化：分两种时机
		if (window.swup) {
			setupSwup();
		} else {
			setTimeout(setupSwup, 200);
		}

		// ===== 清理函数（组件卸载时调用） =====
		return () => {
			// 移除媒体查询监听
			mediaQueryList?.removeEventListener("change", handleMediaQueryChange);
			// 移除自定义事件监听
			window.removeEventListener(
					"layoutChange",
					handleCustomEvent as EventListener,
			);
			// 移除 popstate 监听
			window.removeEventListener("popstate", handleSwupEvent);

			// 注销 swup 钩子
			const swup = window.swup;
			if (swup?.hooks) {
				swup.hooks.off("content:replace", handleSwupEvent);
				swup.hooks.off("page:view", handleSwupEvent);
			}
		};
	});
</script>

<!--
  渲染条件：
  1. mounted —— 已挂载（避免 SSR 渲染出按钮）
  2. siteConfig.postListLayout.allowSwitch —— 配置允许切换
  3. !isSmallScreen —— 非小屏（小屏强制列表，无需切换）
-->
{#if mounted && siteConfig.postListLayout.allowSwitch && !isSmallScreen}
	<button
			type="button"
			aria-label={userPreference === "list"
			? i18n(I18nKey.switchToGridMode)
			: i18n(I18nKey.switchToListMode)}
			aria-pressed={userPreference === "grid"}
			class="btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90 flex items-center justify-center theme-switch-btn {isSwitching
			? 'switching'
			: ''}"
			onclick={switchLayout}
			disabled={isSwitching}
			title={userPreference === "list"
			? i18n(I18nKey.switchToGridMode)
			: i18n(I18nKey.switchToListMode)}
	>
		<!-- 图标容器：动画结束时触发 onAnimationEnd -->
		<div
				class="icon-container w-5 h-5 flex items-center justify-center relative"
				onanimationend={onAnimationEnd}
		>
			<!-- 列表模式图标（三条横线） -->
			{#if userPreference === "list"}
				<svg
						class="w-5 h-5 icon-transition"
						fill="currentColor"
						viewBox="0 0 24 24"
				>
					<path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
				</svg>
			{:else}
				<!-- 网格模式图标（四个方块） -->
				<svg
						class="w-5 h-5 icon-transition"
						fill="currentColor"
						viewBox="0 0 24 24"
				>
					<path
							d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"
					/>
				</svg>
			{/if}
		</div>
	</button>
{/if}

<style>
	/* 按钮 ::before 伪元素过渡（覆盖默认的 0ms 背景过渡） */
	.theme-switch-btn::before {
		transition:
				transform 75ms ease-out,
				background-color 0ms !important;
	}

	/* 图标过渡：变换 + 透明度 */
	.icon-transition {
		transition:
				transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
				opacity 0.3s ease;
	}

	/* 切换中：禁用鼠标事件 */
	.switching {
		pointer-events: none;
	}

	/* 切换中的图标播放旋转动画 */
	.switching .icon-transition {
		animation: iconRotate 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* 图标旋转关键帧：0° → 180°(缩小半透明) → 360° */
	@keyframes iconRotate {
		0% {
			transform: rotate(0deg) scale(1);
			opacity: 1;
		}
		50% {
			transform: rotate(180deg) scale(0.8);
			opacity: 0.5;
		}
		100% {
			transform: rotate(360deg) scale(1);
			opacity: 1;
		}
	}

	/* 非切换中状态悬停：图标轻微放大 */
	.theme-switch-btn:not(.switching):hover .icon-transition {
		transform: scale(1.1);
	}

	/* 禁用态样式 */
	.theme-switch-btn:disabled {
		cursor: not-allowed;
		opacity: 0.7;
	}
</style>