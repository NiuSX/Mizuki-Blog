<script lang="ts">
	// 导入 i18n 相关：key 枚举与翻译函数
	import I18nKey from "@i18n/i18nKey";
	import { i18n } from "@i18n/translation";
	// 导入 Svelte 生命周期
	import { onMount } from "svelte";

	// 解构 props，hint 默认空字符串（密码提示）
	const { hint = "" } = $props();

	// ===== 响应式状态 =====
	/** 错误信息（解密失败时显示） */
	let errorMessage = $state("");
	/** 是否正在解密（控制按钮禁用与文案） */
	let isLoading = $state(false);
	/** 用户输入的密码（与 input 双向绑定） */
	let password = $state("");

	/**
	 * 派发"密码解锁"事件
	 * 说明：本组件不负责解密，只负责"收集密码 + 广播事件"，
	 * 真正的解密由订阅此事件的脚本（如 EncryptedContent 的客户端逻辑）处理。
	 * @param {string} pwd 用户输入的密码
	 */
	function dispatchUnlock(pwd: string) {
		const event = new CustomEvent("password:unlock", {
			detail: { password: pwd },
			// bubbles: 允许事件冒泡（让更多祖先节点能捕获）
			bubbles: true,
			// composed: 允许事件穿透 Shadow DOM（跨 shadow 边界传播）
			composed: true,
		});
		document.dispatchEvent(event);
	}

	/**
	 * 表单提交处理
	 * @param {Event} e 提交事件
	 */
	function handleSubmit(e: Event) {
		// 阻止表单默认提交（避免页面刷新）
		e.preventDefault();
		// 密码非空才派发解锁事件
		if (password.trim()) {
			dispatchUnlock(password);
		}
	}

	/**
	 * 键盘事件处理：支持回车提交
	 * @param {KeyboardEvent} e 键盘事件
	 */
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Enter" && password.trim()) {
			dispatchUnlock(password);
		}
	}

	onMount(() => {
		// ===== 监听解密过程中的状态事件 =====

		/** 解密开始/结束：更新加载态 */
		const handleLoading = ((e: CustomEvent<boolean>) => {
			isLoading = e.detail;
		}) as EventListener;

		/** 解密失败：显示错误信息并解除加载态 */
		const handleError = ((e: CustomEvent<string>) => {
			errorMessage = e.detail;
			isLoading = false;
		}) as EventListener;

		/** 清除错误（如用户重新输入） */
		const handleClearError = (() => {
			errorMessage = "";
		}) as EventListener;

		// 注册监听
		document.addEventListener("password:loading", handleLoading);
		document.addEventListener("password:error", handleError);
		document.addEventListener("password:clear-error", handleClearError);

		// 清理函数：组件卸载时移除监听（避免内存泄漏）
		return () => {
			document.removeEventListener("password:loading", handleLoading);
			document.removeEventListener("password:error", handleError);
			document.removeEventListener("password:clear-error", handleClearError);
		};
	});
</script>

<div class="password-protection">
	<div class="password-container">
		<!-- 锁图标：视觉暗示"内容受保护" -->
		<div class="lock-icon">
			<svg
					width="48"
					height="48"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					class="w-20 h-20"
			>
				<path
						d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"
						fill="currentColor"
				></path>
			</svg>
		</div>

		<!-- 标题与说明（i18n） -->
		<h2>{i18n(I18nKey.passwordProtected)}</h2>
		<p class="description">{i18n(I18nKey.passwordProtectedDescription)}</p>

		<!-- 密码提示：仅当传入 hint 时显示 -->
		{#if hint}
			<p class="hint-text">{i18n(I18nKey.passwordHint)}: {hint}</p>
		{/if}

		<!-- 密码表单：提交时调用 handleSubmit -->
		<form class="password-form" onsubmit={handleSubmit}>
			<input
					type="password"
					id="password-input"
					placeholder={i18n(I18nKey.passwordPlaceholder)}
					class="password-input"
			<!-- 双向绑定：输入值与 password 状态同步 -->
			bind:value={password}
			onkeydown={handleKeydown}
			<!-- 解密中禁用输入 -->
			disabled={isLoading}
			<!-- 禁用浏览器自动填充（避免密码被记住） -->
			autocomplete="off"
			/>
			<button
					id="unlock-btn"
					class="unlock-button"
					type="submit"
					disabled={isLoading}
			>
				<!-- 文案随加载态切换："解密中..." / "解锁" -->
				{isLoading
						? i18n(I18nKey.passwordUnlocking)
						: i18n(I18nKey.passwordUnlock)}
			</button>
		</form>

		<!-- 错误信息：仅在有错误时显示 -->
		{#if errorMessage}
			<p class="error-message">{errorMessage}</p>
		{/if}
	</div>
</div>

<style>
	/* 外层：居中容器 */
	.password-protection {
		display: flex;
		justify-content: center;
		padding: 4rem 1rem;
	}

	/* 卡片容器：纵向排列，居中 */
	.password-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		max-width: 25rem;
		width: 100%;
		padding: 2rem;
		text-align: center;
	}

	/* 锁图标：主色 */
	.lock-icon {
		color: var(--primary);
	}
	.lock-icon svg {
		width: 5rem;
		height: 5rem;
	}

	/* 标题：亮色模式深色文字，暗色模式浅色文字 */
	.password-container h2 {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 700;
		color: rgba(0, 0, 0, 0.8);
	}
	:global(.dark) .password-container h2 {
		color: rgba(255, 255, 255, 0.8);
	}

	/* 描述文字：弱化（40% 不透明度） */
	.description {
		margin: 0;
		font-size: 0.875rem;
		color: rgba(0, 0, 0, 0.4);
	}
	:global(.dark) .description {
		color: rgba(255, 255, 255, 0.4);
	}

	/* 提示文字：更弱化（50%） */
	.hint-text {
		margin: 0;
		font-size: 0.75rem;
		color: rgba(0, 0, 0, 0.5);
	}
	:global(.dark) .hint-text {
		color: rgba(255, 255, 255, 0.5);
	}

	/* 表单：纵向排列 */
	.password-form {
		width: 100%;
		margin-top: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	/* 输入框：无边框，浅色背景 */
	.password-input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		background: rgba(0, 0, 0, 0.05);
		border: none;
		color: rgba(0, 0, 0, 0.8);
		outline: none;
	}
	:global(.dark) .password-input {
		background: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.8);
	}
	/* 占位符：最弱化（25%） */
	.password-input::placeholder {
		color: rgba(0, 0, 0, 0.25);
	}
	:global(.dark) .password-input::placeholder {
		color: rgba(255, 255, 255, 0.25);
	}
	/* 聚焦：背景加深，形成视觉反馈（无边框设计） */
	.password-input:focus {
		background: rgba(0, 0, 0, 0.08);
	}
	:global(.dark) .password-input:focus {
		background: rgba(255, 255, 255, 0.15);
	}

	/* 解锁按钮：主色背景 */
	.unlock-button {
		width: 100%;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		background: var(--primary);
		color: white;
		border: none;
		cursor: pointer;
		transition:
				opacity 0.2s,
				transform 0.1s;
	}
	/* 暗色模式：主色较亮，文字改深色 */
	:global(.dark) .unlock-button {
		color: rgba(0, 0, 0, 0.7);
	}
	/* 悬停（非禁用时）：降低透明度 */
	.unlock-button:hover:not(:disabled) {
		opacity: 0.85;
	}
	/* 按下（非禁用时）：轻微缩小 */
	.unlock-button:active:not(:disabled) {
		transform: scale(0.98);
	}
	/* 禁用态 */
	.unlock-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* 错误信息：红色 */
	.error-message {
		margin: 0;
		font-size: 0.75rem;
		color: #ef4444;
	}
	:global(.dark) .error-message {
		color: #f87171;  /* 暗色模式下用更亮的红 */
	}

	/* 移动端：缩小内边距 */
	@media (width < 768px) {
		.password-protection {
			padding: 2rem 1rem;
		}
		.password-container {
			padding: 1.5rem;
		}
	}
</style>