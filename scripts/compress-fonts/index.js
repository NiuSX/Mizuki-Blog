/**
 * 字体压缩入口
 *
 * 模块结构：
 *   utils.js          — 共享工具函数（文件遍历、字符串提取、Markdown 解析）
 *   config-parser.js  — 配置解析（单次读取 siteConfig.ts，缓存后分发）
 *   text-collector.js — 文本采集（8 个来源：本地文件 + 3 个远程 API + 常用字符）
 *   font-compressor.js— 字体压缩（Fontmin 子集化 + ttf→woff2 转换）
 *   css-rewriter.js   — CSS 重写（dist/ 中 ttf 引用替换为 woff2）
 *   index.js          — 入口（串联 compress → rewrite）
 */

// 导入字体压缩模块：负责读取配置中的字体文件，
// 通过 Fontmin 做字形子集化并转换为 woff2，输出到 dist/assets/font
import { compressFonts } from "./font-compressor.js";
// 导入 CSS 重写模块：负责扫描 dist 下的所有 CSS 文件，
// 将其中的 ttf 字体引用替换为 woff2 引用
import { updateCssFontReferences } from "./css-rewriter.js";

// 入口执行流程：
// 1. 先执行 compressFonts() 完成字体压缩（生成 woff2 文件到 dist）
// 2. 压缩成功后再执行 updateCssFontReferences() 重写 CSS 引用
//    使用 .then() 保证顺序执行 —— 必须等 woff2 生成完毕后再改 CSS，
//    否则可能出现 CSS 引用了尚未存在的 woff2 文件
compressFonts().then(() => updateCssFontReferences());