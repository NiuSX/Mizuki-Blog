// 从配置类型定义文件导入：
// - ImageFormat: 支持的图像格式（如 "avif" | "webp" | "jpg" 等）
// - ResponsiveImageLayout: 响应式布局模式（如 "constrained" | "full-width" | "fixed"）
import type { ImageFormat, ResponsiveImageLayout } from "../../../types/config";

/**
 * Image 组件的属性类型定义
 * 对应 Image.astro 组件的 props
 *
 * 设计说明：
 *   该组件统一处理三种图像来源（本地优化图 / public 图 / 远程 URL），
 *   因此属性同时覆盖了 Astro 优化属性与原生 <img> 属性
 */
export interface ImageProps {
	/** 容器元素 id（用于锚点跳转、外部脚本定位） */
	id?: string;

	/** 图像地址：
	 *  - 本地：src/assets 下的相对路径（会被 Astro 优化）
	 *  - public：以 "/" 开头（如 "/images/a.jpg"）
	 *  - 远程：http/https URL
	 */
	src: string;

	/** 外部传入的类名（应用在**容器**上，非 img 元素本身） */
	class?: string;

	/** 替代文本（无障碍必需；装饰性图片可传空字符串） */
	alt?: string;

	/** object-position 值，控制 object-cover 裁剪时的对齐位置，默认 "center" */
	position?: string;

	/** 基础路径前缀，用于解析本地图片路径，默认 "/" */
	basePath?: string;

	/** 原生 loading 策略：
	 *  - "lazy"：延迟加载（默认，首屏外图片适用）
	 *  - "eager"：立即加载（首屏关键图片适用）
	 */
	loading?: "eager" | "lazy";

	/** 原生 fetchpriority，控制资源加载优先级：
	 *  - "high"：高优先级（如 LCP 图片）
	 *  - "low"：低优先级
	 *  - "auto"：浏览器自行决定
	 */
	fetchpriority?: "high" | "low" | "auto";

	// ===== 响应式图像属性 =====

	/** 响应式布局模式，决定生成的 srcset / sizes 策略
	 *  如 "constrained"（受限宽度）、"full-width"（全宽）、"fixed"（固定尺寸）
	 */
	layout?: ResponsiveImageLayout;

	/** 是否使用 <Picture> 组件：
	 *  - true（默认）：输出 <picture>，支持多格式回退（avif/webp/jpg）
	 *  - false：输出单个 <img>，由 Astro 生成 srcset
	 */
	usePicture?: boolean;

	/** 输出的图像格式列表（按优先级排列，如 ["avif", "webp"]）
	 *  默认从站点配置读取
	 */
	formats?: ImageFormat[];

	/** 自定义宽度断点数组（如 [320, 640, 960, 1280]）
	 *  用于生成 srcset 中的多尺寸候选
	 */
	widths?: number[];

	/** sizes 属性，告诉浏览器不同视口下图片的显示宽度
	 *  如 "(max-width: 768px) 100vw, 50vw"
	 */
	sizes?: string;

	/** 压缩质量（0-100），默认从站点配置读取 */
	quality?: number;

	/** 是否叠加半透明遮罩层（提升图片上文字的可读性），默认 true */
	overlay?: boolean;
}