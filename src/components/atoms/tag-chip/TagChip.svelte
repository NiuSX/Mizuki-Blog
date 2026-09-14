<script lang="ts">
	// 从 svelte 导入 Snippet 类型（Svelte 5 中描述插槽内容的类型）
	import type { Snippet } from "svelte";

	// 从同级 types 文件导入 TagChipProps 基础属性类型
	import type { TagChipProps } from "./types";

	// 在 TagChipProps 基础上扩展 children（插槽内容）
	// Svelte 5 用 Snippet 类型表示可渲染的子内容，替代 Svelte 4 的 <slot />
	interface Props extends TagChipProps {
		children?: Snippet;
	}

	// 使用 Svelte 5 的 $props() 解构组件属性：
	// - href:     链接地址，存在时渲染为 <a>，否则渲染为 <span>
	// - label:    无障碍标签（aria-label）
	// - class:    外部类名，重命名避免保留字冲突
	// - children: 子内容（Snippet）
	const { href, label, class: className = "", children }: Props = $props();
</script>

<!-- 有 href：渲染为可点击的链接 -->
{#if href}
	<a {href} aria-label={label} class="tag-chip {className}">
		<!-- 可选调用 children snippet，未传入时不报错 -->
		{@render children?.()}
	</a>
{:else}
	<!-- 无 href：渲染为不可点击的标签（纯展示） -->
	<span class="tag-chip {className}">
		{@render children?.()}
	</span>
{/if}

<style>
	/* 标签基础样式：胶囊形、水平内边距、居中 */
	.tag-chip {
		display: inline-flex;
		align-items: center;
		height: 2rem;
		padding: 0 0.75rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		/* 默认背景：浅色按钮背景变量 */
		background-color: var(--btn-plain-bg-hover);
		color: var(--btn-content);
		transition: all 0.2s ease;
		/* 移除链接下划线（<a> 渲染时需要） */
		text-decoration: none;
		cursor: pointer;
	}

	/* 悬停态：切换为主色背景 + 白色文字，强调可交互 */
	.tag-chip:hover {
		background-color: var(--primary);
		color: white;
	}

	/* 暗色模式：改用卡片背景色，避免在深色背景上过亮 */
	:global(.dark) .tag-chip {
		background-color: var(--card-bg);
		color: var(--text-color);
	}

	/* 暗色模式悬停：同样切换为主色，保持交互反馈一致 */
	:global(.dark) .tag-chip:hover {
		background-color: var(--primary);
		color: white;
	}
</style>