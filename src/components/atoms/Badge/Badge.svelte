<script lang="ts">
	// 从同级 types 文件导入 BadgeProps 类型定义（仅类型导入，编译后会被擦除）
	import type { BadgeProps } from "./types";

	// 使用 Svelte 5 的 $props() 解构组件属性：
	// - value: 徽章显示的值
	// - class: 额外的 CSS 类名，通过重命名避免与保留字冲突，默认为空字符串
	const { value, class: className = "" }: BadgeProps = $props();
</script>

<!-- 仅当 value 存在且非空字符串时才渲染徽章 -->
<!-- 使用 != null 同时排除 null 和 undefined -->
{#if value != null && value !== ""}
	<div class="badge {className}">
		{value}
	</div>
{/if}

<style>
	/* 徽章基础样式 */
	.badge {
		/* 所有属性变化时 0.2s 平滑过渡 */
		transition: all 0.2s ease;
		/* 水平内边距 0.5rem，垂直方向由 height 与 flex 居中控制 */
		padding: 0 0.5rem;
		/* 固定高度 */
		height: 1.75rem;
		/* 最小宽度，避免短内容时过窄 */
		min-width: 2rem;
		/* 圆角 */
		border-radius: 0.5rem;
		/* 字号 */
		font-size: 0.875rem;
		/* 字重加粗 */
		font-weight: 700;
		/* 文字颜色：使用 CSS 变量 --btn-content（跟随按钮主题） */
		color: var(--btn-content);
		/* 背景色：oklch 色彩空间，明度 0.95、彩度 0.025、色相由 --hue 变量控制 */
		background-color: oklch(0.95 0.025 var(--hue));
		/* 使用 flex 布局使内容水平垂直居中 */
		display: flex;
		align-items: center;
		justify-content: center;
	}
	/* 暗色模式下的样式覆盖：:global(.dark) 穿透作用域，匹配外层的暗色主题容器 */
	:global(.dark) .badge {
		/* 暗色模式下改用深色文字 */
		color: var(--deep-text);
		/* 背景改用主色 */
		background-color: var(--primary);
	}
</style>