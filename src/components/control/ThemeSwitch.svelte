<script lang="ts">
	// 从常量模块导入：暗色模式、默认主题、亮色模式
	import { DARK_MODE, DEFAULT_THEME, LIGHT_MODE } from "@constants/constants";
	// 导入 @iconify/svelte 的图标组件
	import Icon from "@iconify/svelte";
	// 导入主题工具：读取已存储主题、设置主题
	import { getStoredTheme, setTheme } from "@utils/setting-utils";
	// 导入 Svelte 生命周期：onMount
	import { onMount } from "svelte";

	// 导入主题类型（仅类型）
	import type { LIGHT_DARK_MODE } from "@/types/config.ts";

	/** 主题循环顺序：亮 → 暗 →（回到亮） */
	const seq: LIGHT_DARK_MODE[] = [LIGHT_MODE, DARK_MODE];
	/** 当前主题模式（响应式状态，初始为默认主题） */
	let mode: LIGHT_DARK_MODE = $state(DEFAULT_THEME);
	/** 切换防抖标记（防止连点导致状态错乱） */
	let isChanging = false;

	onMount(() => {
		// 挂载后从存储读取真实主题（覆盖初始默认值）
		mode = getStoredTheme();

		// 监听 Swup 的内容替换事件，确保在页面切换后同步主题状态
		const handleContentReplace = () => {
			// requestAnimationFrame 延后到下一帧，确保新页面的 DOM 已就绪
			requestAnimationFrame(() => {
				const newMode = getStoredTheme();
				if (mode !== newMode) {
					mode = newMode;
				}
			});
		};

		// 标记 swup 钩子是否已注册（避免重复注册）
		let swupHooked = false;

		/** 注册 swup 钩子（幂等） */
		const setupSwupHook = () => {
			if (!swupHooked && window.swup?.hooks) {
				window.swup.hooks.on("content:replace", handleContentReplace);
				swupHooked = true;
			}
		};

		// swup 可能尚未就绪：分两种时机注册
		if (window.swup?.hooks) {
			setupSwupHook();
		} else {
			// 等待 swup 启用后再注册（{ once: true } 保证只触发一次）
			document.addEventListener("swup:enable", setupSwupHook, { once: true });
		}

		// ===== 清理函数（组件卸载时执行） =====
		return () => {
			// 注销 swup 钩子
			if (window.swup?.hooks && swupHooked) {
				window.swup.hooks.off("content:replace", handleContentReplace);
			}
			// 移除 swup:enable 监听
			document.removeEventListener("swup:enable", setupSwupHook);
		};
	});

	/**
	 * 切换到指定主题
	 * @param {LIGHT_DARK_MODE} newMode 目标主题
	 */
	function switchScheme(newMode: LIGHT_DARK_MODE) {
		// 防止连续快速点击
		if (isChanging) {
			return;
		}

		isChanging = true;
		// 更新本地状态
		mode = newMode;
		// 应用主题（写入 DOM class / 存储）
		setTheme(newMode);

		// 50ms 后重置状态，防止过快切换
		setTimeout(() => {
			isChanging = false;
		}, 50);
	}

	/**
	 * 切换到下一个主题（在 seq 中循环）
	 * 找到当前主题在序列中的位置，取下一个（取模实现循环）
	 */
	function toggleScheme() {
		// 防抖：切换中则忽略
		if (isChanging) {
			return;
		}

		// 查找当前主题在序列中的索引
		let i = 0;
		for (; i < seq.length; i++) {
			if (seq[i] === mode) {
				break;
			}
		}
		// 切换到下一个（取模实现"末尾回到开头"的循环）
		switchScheme(seq[(i + 1) % seq.length]);
	}
</script>

<!--
  主题切换按钮：
  - id="scheme-switch" 供其它脚本/样式定位
  - data-mode 携带当前模式（供外部 CSS/脚本读取）
  - aria-label 提供无障碍说明
-->
<button
		aria-label="Light/Dark Mode"
		class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90 theme-switch-btn z-50"
		id="scheme-switch"
		onclick={toggleScheme}
		data-mode={mode}
>
	<!--
	  太阳图标：
	  - 非亮色模式时加 opacity-0（隐藏）+ rotate-180（旋转出）
	  - transition 让显隐/旋转平滑
	-->
	<div
			class="absolute transition-all duration-300 ease-in-out"
			class:opacity-0={mode !== LIGHT_MODE}
			class:rotate-180={mode !== LIGHT_MODE}
	>
		<Icon
				icon="material-symbols:wb-sunny-outline-rounded"
				class="text-[1.25rem]"
		></Icon>
	</div>
	<!--
	  月亮图标：
	  - 非暗色模式时加 opacity-0（隐藏）+ rotate-180（旋转出）
	  - 与太阳图标形成"交叉旋转淡入淡出"效果
	-->
	<div
			class="absolute transition-all duration-300 ease-in-out"
			class:opacity-0={mode !== DARK_MODE}
			class:rotate-180={mode !== DARK_MODE}
	>
		<Icon
				icon="material-symbols:dark-mode-outline-rounded"
				class="text-[1.25rem]"
		></Icon>
	</div>
</button>

<style>
	/* 确保主题切换按钮的背景色即时更新 */
	/* 覆盖默认的背景色过渡，避免主题切换时按钮背景"慢半拍" */
	.theme-switch-btn::before {
		transition:
				transform 75ms ease-out,
				background-color 0ms !important;
	}
</style>