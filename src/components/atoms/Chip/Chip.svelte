<script lang="ts">
	// 从 svelte 导入 Snippet 类型（Svelte 5 中用于描述插槽内容的类型）
	import type { Snippet } from "svelte";

	// 从同级 types 文件导入 ChipProps 基础属性类型
	import type { ChipProps } from "./types";

	// 在 ChipProps 基础上扩展 children（插槽内容）
	// Svelte 5 用 Snippet 类型表示可渲染的子内容，替代 Svelte 4 的 <slot />
	interface Props extends ChipProps {
		children?: Snippet;
	}

	// 使用 Svelte 5 的 $props() 解构组件属性
	// - href:     链接地址，存在时渲染为 <a> 包裹
	// - label:    无障碍标签（aria-label）
	// - dot:      是否显示圆点指示器，默认 false
	// - badge:    角标文本
	// - class:    外部类名，重命名避免保留字冲突
	// - children: 子内容（Snippet）
	const {
		href,
		label,
		dot = false,
		badge,
		class: className = "",
		children,
	}: Props = $props();
</script>

<!-- 有 href：渲染为带 aria-label 的链接，内部包一个 button -->
{#if href}
	<a {href} aria-label={label} class="chip-wrapper {className}">
		<button class="chip">
			<!-- 可选圆点指示器 -->
			{#if dot}
				<div class="chip-dot"></div>
			{/if}
			<!-- 内容区：调用 children snippet 渲染子内容 -->
			<!-- 用 ?.() 可选调用，children 未传入时不报错 -->
			<span class="chip-content">
				{@render children?.()}
			</span>
			<!-- 可选角标：非 undefined / null / 空字符串时才渲染 -->
			{#if badge !== undefined && badge !== null && badge !== ""}
				<div class="chip-badge">{badge}</div>
			{/if}
		</button>
	</a>
{:else}
	<!-- 无 href：直接渲染为 button -->
	<button class="chip {className}">
		{#if dot}
			<div class="chip-dot"></div>
		{/if}
		<span class="chip-content">
			{@render children?.()}
		</span>
		{#if badge !== undefined && badge !== null && badge !== ""}
			<div class="chip-badge">{badge}</div>
		{/if}
	</button>
{/if}

<style>
	/* 外层链接容器：块级、占满宽度、去掉下划线 */
	.chip-wrapper {
		display: block;
		width: 100%;
		text-decoration: none;
	}

	/* Chip 主体：按钮式外观，默认无背景无边框 */
	.chip {
		width: 100%;
		height: 2.5rem;
		border-radius: 0.5rem;
		background: none;
		transition: all 0.2s ease;
		padding-left: 0.5rem;
		display: flex;
		align-items: center;
		cursor: pointer;
		border: none;
		color: inherit;
	}

	/* 悬停态：显示背景色，并稍微增加左内边距（产生"滑出"效果） */
	.chip:hover {
		background-color: var(--btn-plain-bg-hover);
		padding-left: 0.75rem;
	}

	/* 按下态：背景色加深 */
	.chip:active {
		background-color: var(--btn-plain-bg-active);
	}

	/* 内容区：占满剩余空间，超长文本用省略号截断 */
	.chip-content {
		overflow: hidden;
		text-align: left;
		white-space: nowrap;
		text-overflow: ellipsis;
		flex: 1;
	}

	/* 圆点指示器：小圆点，悬停时可作为状态标识 */
	.chip-dot {
		height: 0.25rem;
		width: 0.25rem;
		background-color: var(--btn-content);
		transition: all 0.2s ease;
		border-radius: 0.25rem;
		margin-right: 0.5rem;
		/* 防止被压缩（flex 容器中保持正圆） */
		flex-shrink: 0;
	}

	/* 暗色模式下圆点改用卡片背景色（在深色背景上更明显） */
	:global(.dark) .chip-dot {
		background-color: var(--card-bg);
	}

	/* 角标：右侧的小胶囊，显示数量或状态 */
	.chip-badge {
		transition: all 0.2s ease;
		padding: 0 0.5rem;
		height: 1.75rem;
		min-width: 2rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--btn-content);
		/* oklch：明度 0.95、低彩度、色相由 --hue 控制 → 带主题色相的浅灰 */
		background-color: oklch(0.95 0.025 var(--hue));
		display: flex;
		align-items: center;
		justify-content: center;
		margin-left: 1rem;
		/* 防止被压缩 */
		flex-shrink: 0;
	}

	/* 暗色模式角标：改用主色背景 + 深色文字 */
	:global(.dark) .chip-badge {
		color: var(--deep-text);
		background-color: var(--primary);
	}

	/* 悬停整个 wrapper 时，内部 chip 文字变主色（强调可点击） */
	.chip-wrapper:hover .chip {
		color: var(--primary);
	}

	/* 暗色模式下同样保持主色文字 */
	:global(.dark) .chip-wrapper:hover .chip {
		color: var(--primary);
	}
</style>