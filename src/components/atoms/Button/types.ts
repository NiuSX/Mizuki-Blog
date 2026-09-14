/**
 * Button 组件的属性类型定义
 * 对应 Button.astro / Button.svelte 组件的 props
 */
export interface ButtonProps {
	/**
	 * 按钮的原生 type 属性
	 * - "button"：普通按钮（默认）
	 * - "submit"：提交按钮（触发表单提交）
	 * - "reset"：重置按钮（清空表单）
	 */
	type?: "button" | "submit" | "reset";

	/**
	 * 视觉变体，控制按钮的外观风格
	 * - "primary"：主按钮（主色背景，强调重要操作）
	 * - "secondary"：次要按钮（浅色背景）
	 * - "ghost"：幽灵按钮（透明背景，仅悬停时显示背景）
	 * - "outline"：描边按钮（带边框，悬停时填充）
	 */
	variant?: "primary" | "secondary" | "ghost" | "outline";

	/**
	 * 尺寸
	 * - "sm"：小号（32px 高）
	 * - "md"：中号（40px 高，默认）
	 * - "lg"：大号（48px 高）
	 */
	size?: "sm" | "md" | "lg";

	/** 是否禁用按钮（禁用时降低透明度并禁止点击） */
	disabled?: boolean;

	/** 外部传入的额外 CSS 类名，会与组件内置类名合并 */
	class?: string;
}

/**
 * ButtonLink 组件的属性类型定义
 * 用于带角标（badge）的链接按钮，常见于导航栏等场景
 */
export interface ButtonLinkProps {
	/** 角标文本（如数量、状态标识），可为空表示不显示 */
	badge?: string;

	/** 链接地址（href） */
	url?: string;

	/** 链接显示的文本标签 */
	label?: string;

	/** 外部传入的额外 CSS 类名 */
	class?: string;
}

/**
 * ButtonTag 组件的属性类型定义
 * 用于带圆点指示器的标签/链接，常见于分类、状态标记等场景
 */
export interface ButtonTagProps {
	/** 尺寸（此处为 string 类型，未做字面量约束，使用更灵活） */
	size?: string;

	/** 是否显示圆点指示器（如在线状态点） */
	dot?: boolean;

	/** 链接地址 */
	href?: string;

	/** 标签显示的文本 */
	label?: string;

	/** 外部传入的额外 CSS 类名 */
	class?: string;
}