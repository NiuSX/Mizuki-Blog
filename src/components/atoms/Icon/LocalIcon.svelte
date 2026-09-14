<script lang="ts">
	/**
	 * Svelte 本地图标组件
	 * 使用本地安装的 @iconify-json 包中的图标 —— 无需 CDN
	 *
	 * 与 Astro 版 Icon 组件的区别：
	 * - Astro 版：服务端渲染 + 客户端脚本兜底，可走 CDN
	 * - 本组件：纯客户端，从本地 node_modules 动态导入图标数据，无网络请求
	 */

	/**
	 * 组件属性定义
	 */
	interface Props {
		/** 图标名，格式为 "集合:名称"（如 "mdi:home"）；省略集合时默认 mdi */
		icon: string;
		/** 外部传入的 CSS 类名 */
		class?: string;
	}

	// 使用 Svelte 5 的 $props() 解构属性
	const { icon, class: className = "" }: Props = $props();

	/**
	 * 解析图标名，拆分为 [集合名, 图标名]
	 * - 含冒号："mdi:home" → ["mdi", "home"]
	 * - 不含冒号："home" → ["mdi", "home"]（默认使用 mdi 集合）
	 * 使用 $derived 声明派生值：icon 变化时自动重新计算
	 */
	const [collection, name] = $derived(
			icon.includes(":") ? icon.split(":") : ["mdi", icon],
	);

	/**
	 * 集合名 → 本地 npm 包名的映射
	 * 只有在此表中登记的集合才能被加载（白名单机制）
	 * 目的是限制动态 import 的范围，避免任意包名注入
	 */
	const iconSetMap: Record<string, string> = {
		"material-symbols": "@iconify-json/material-symbols",
		"material-symbols-outlined": "@iconify-json/material-symbols",
		mdi: "@iconify-json/mdi",
		"fa7-solid": "@iconify-json/fa7-solid",
		"fa7-regular": "@iconify-json/fa7-regular",
		"fa7-brands": "@iconify-json/fa7-brands",
		"simple-icons": "@iconify-json/simple-icons",
	};

	// 当前集合对应的 npm 包名（派生值，随 collection 变化）
	const packageName = $derived(iconSetMap[collection]);
	// 渲染后的 SVG 字符串（响应式状态）
	let svgContent = $state("");

	/**
	 * 副作用：当 icon 相关依赖变化时，异步加载图标数据并生成 SVG
	 * $effect 会在依赖（icon / packageName / name / className）变化时重新执行
	 */
	$effect(() => {
		// 先把响应式依赖读取到局部变量，避免在异步函数中读取导致的追踪问题
		const currentIcon = icon;
		const currentPackageName = packageName;
		const currentName = name;
		const currentClassName = className;

		// 集合未在映射表中登记 → 直接跳过（不加载）
		if (!currentPackageName) {
			return;
		}

		/**
		 * 异步加载图标数据并生成 SVG 字符串
		 */
		async function loadIcon() {
			try {
				// 动态导入 @iconify-json 包的 icons.json
				// /* @vite-ignore */ 告诉 Vite 不要尝试静态分析这个动态路径
				const iconsData = await import(
						/* @vite-ignore */ `${currentPackageName}/icons.json`
						);
				// 取图标集合（可能为空对象）
				const icons = iconsData.icons || {};
				// 取指定图标的定义数据
				const iconData = icons[currentName];

				if (iconData) {
					// viewBox 决定 SVG 坐标系，默认 24×24
					const viewBox = iconData.viewBox || "0 0 24 24";
					// body 是 SVG 内部路径数据（不含 <svg> 标签）
					const body = iconData.body;

					if (body) {
						// 拼装完整 SVG，并把外部类名应用到 <svg> 上
						svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" class="${currentClassName}">${body}</svg>`;
					}
				}
			} catch (e) {
				// 加载失败仅警告，此时 svgContent 保持为空 → 显示兜底占位符
				console.warn(
						`Failed to load icon ${currentIcon} from ${currentPackageName}:`,
						e,
				);
			}
		}

		loadIcon();
	});
</script>

<!-- 加载成功：用 {@html} 渲染 SVG 字符串 -->
<!-- 注意：{@html} 会直接插入未转义 HTML，此处内容来自可信的本地图标包 -->
{#if svgContent}
	{@html svgContent}
{:else}
	<!-- 加载中/失败：显示圆形占位符 -->
	<span class={className}>●</span>
{/if}