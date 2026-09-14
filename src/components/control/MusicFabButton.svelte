<script lang="ts">
	// 导入 @iconify/svelte 的 Icon 组件（Svelte 版图标组件）
	import Icon from "@iconify/svelte";
	// 导入 Svelte 生命周期：onDestroy（销毁时）、onMount（挂载时）
	import { onDestroy, onMount } from "svelte";

	// 导入音乐播放器的状态类型与 store 实例
	import type { MusicPlayerState } from "@/stores/musicPlayerStore";
	import { musicPlayerStore } from "@/stores/musicPlayerStore";

	// 本地状态：镜像 store 的当前状态（响应式）
	let playerState = $state<MusicPlayerState>(musicPlayerStore.getState());
	// store 订阅的取消函数（用于 onDestroy 清理）
	let unsubscribe: (() => void) | undefined;

	/** 切换音乐控制中心展开/收起（调用 store 的 action） */
	function toggleControlCenter() {
		musicPlayerStore.toggleExpanded();
	}

	// ===== 派生值：随 playerState 变化自动重新计算 =====

	/** 当前歌曲标题（无歌曲时显示默认文案） */
	const currentSongTitle = $derived(
			playerState.currentSong?.title || "音乐控制中心",
	);

	/** 无障碍标签：根据展开状态动态描述操作（展开时提示"收起"，收起时提示"打开"） */
	const ariaLabel = $derived(
			playerState.isExpanded
					? `收起音乐控制中心：${currentSongTitle}`
					: `打开音乐控制中心：${currentSongTitle}`,
	);

	/**
	 * 状态图标：
	 * - 加载中：旋转的环形进度图标
	 * - 其它：音符图标
	 */
	const statusIcon = $derived(
			playerState.isLoading
					? "svg-spinners:90-ring-with-bg"
					: "material-symbols:music-note-rounded",
	);

	// ===== 生命周期 =====

	onMount(() => {
		// 订阅 store：状态变化时同步到本地 playerState
		unsubscribe = musicPlayerStore.subscribe((nextState) => {
			playerState = nextState;
		});
	});

	onDestroy(() => {
		// 组件销毁时取消订阅，避免内存泄漏
		unsubscribe?.();
	});
</script>

<!--
  音乐浮动按钮：
  - class:active / playing / loading 根据状态动态切换
  - aria-label / title 使用动态描述
  - onclick 调用 toggleControlCenter
-->
<button
		type="button"
		class:active={playerState.isExpanded}
		class:playing={playerState.isPlaying}
		class:loading={playerState.isLoading}
		class="music-fab btn-card"
		aria-label={ariaLabel}
		title={ariaLabel}
		onclick={toggleControlCenter}
>
	<!-- 图标容器：aria-hidden 让读屏器忽略（aria-label 已在按钮上提供语义） -->
	<span class="music-fab__icon" aria-hidden="true">
		<Icon icon={statusIcon} />
	</span>

	<!-- 播放中：显示一个小圆点作为状态指示 -->
	{#if playerState.isPlaying}
		<span class="music-fab__dot" aria-hidden="true"></span>
	{/if}
</button>

<style>
	/* 按钮基础样式：正方形，尺寸由 CSS 变量控制（与浮动控件组保持一致） */
	.music-fab {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		/* 尺寸复用浮动控件组的变量，默认 3rem */
		width: var(--fab-button-size, 3rem);
		height: var(--fab-button-size, 3rem);
		min-width: 0;
		min-height: 0;
		padding: 0.25rem;
		border: 1px solid rgba(148, 163, 184, 0.45);
		border-radius: 1rem;
		cursor: pointer;
		color: var(--primary);
		pointer-events: auto;
		transition:
				transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
				box-shadow 0.3s ease,
				background 0.3s ease;
	}

	/* 悬停：加阴影 */
	.music-fab:hover {
		box-shadow: var(--shadow-button);
	}

	/* 按下：轻微缩小（触感反馈） */
	.music-fab:active {
		transform: scale(0.94);
	}

	/* 展开态：背景色变化 */
	.music-fab.active {
		background: var(--btn-card-bg-active);
	}

	/* 图标容器：居中，字号 1.5rem */
	.music-fab__icon {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		line-height: 1;
	}

	/* 播放指示小圆点：右下角，带描边以在任意背景上可见 */
	.music-fab__dot {
		position: absolute;
		right: 0.38rem;
		bottom: 0.38rem;
		z-index: 2;
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 999px;
		background: var(--primary);
		/* 用 box-shadow 模拟"外边距"效果（与卡片背景色一致） */
		box-shadow: 0 0 0 2px var(--card-bg);
	}

	/* 播放中：外层叠加一个持续扩散的脉冲圈 */
	.music-fab.playing::after {
		content: "";
		position: absolute;
		inset: 0;
		border-radius: inherit;
		/* color-mix 基于主色生成 35% 透明度的边框色 */
		border: 1px solid color-mix(in srgb, var(--primary) 35%, transparent);
		animation: music-fab-pulse 1.8s ease-out infinite;
	}

	/* 加载中：图标略小（适配旋转环的视觉重量） */
	.music-fab.loading .music-fab__icon :global(svg) {
		font-size: 1.2rem;
	}

	/* 暗色模式：边框更亮，悬停阴影用暗色版本 */
	:global(.dark) .music-fab {
		border: 1px solid rgba(255, 255, 255, 0.15);
	}

	:global(.dark) .music-fab:hover {
		box-shadow: var(--shadow-button-dark);
	}

	/* 脉冲动画：从 0.92 放大到 1.12 并淡出，无限循环 */
	@keyframes music-fab-pulse {
		0% {
			opacity: 0;
			transform: scale(0.92);
		}
		30% {
			opacity: 0.75;
		}
		100% {
			opacity: 0;
			transform: scale(1.12);
		}
	}

	/* 响应式：小屏缩小圆角与图标 */
	@media (width < 768px) {
		.music-fab {
			border-radius: 0.75rem;
		}
		.music-fab__icon {
			font-size: 1.4rem;
		}
	}

	@media (width < 480px) {
		.music-fab {
			border-radius: 0.5rem;
		}
	}
</style>