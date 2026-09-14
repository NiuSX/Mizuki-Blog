/* 这是一个用于创建带 front-matter 的新文章 Markdown 文件的脚本 */

// 导入 Node.js 文件系统模块，用于检查文件、创建目录、写入文件
import fs from "fs";
// 导入 Node.js 路径模块，用于路径拼接与目录名提取
import path from "path";

/**
 * 获取当前日期，格式为 YYYY-MM-DD
 * 用于生成 front-matter 中的 published 字段
 * @returns {string} 如 "2026-09-14"
 */
function getDate() {
	const today = new Date();
	const year = today.getFullYear();
	// getMonth() 返回 0-11，需 +1；padStart 补零为两位
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const day = String(today.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

// 读取命令行参数：process.argv 前两项是 node 可执行路径与脚本路径
// slice(2) 之后的才是用户实际传入的参数
const args = process.argv.slice(2);

// 未提供文件名参数时，打印用法并退出
if (args.length === 0) {
	console.error(`Error: No filename argument provided
Usage: npm run new-post -- <filename>`);
	process.exit(1); // Terminate the script and return error code 1
}

// 取第一个参数作为文件名
let fileName = args[0];

// Add .md extension if not present
// 若文件名未带 .md / .mdx 扩展名，则自动补上 .md
const fileExtensionRegex = /\.(md|mdx)$/i;
if (!fileExtensionRegex.test(fileName)) {
	fileName += ".md";
}

// 目标目录：文章存放位置
const targetDir = "./src/content/posts/";
// 目标文件的完整路径
const fullPath = path.join(targetDir, fileName);

// 文件已存在时提示并退出，避免误覆盖已有文章
if (fs.existsSync(fullPath)) {
	console.error(`Error: File ${fullPath} already exists `);
	process.exit(1);
}

// recursive mode creates multi-level directories
// 若目标目录不存在则递归创建（支持 fileName 含子目录的情况）
const dirPath = path.dirname(fullPath);
if (!fs.existsSync(dirPath)) {
	fs.mkdirSync(dirPath, { recursive: true });
}

// 待写入的文章模板：
// 顶部为 YAML front-matter，正文部分留空
// 注意：title 使用 args[0]（未补扩展名的原始输入），而非 fileName
const content = `---
title: ${args[0]}
published: ${getDate()}
description: ''
image: ''
tags: []
category: ''
draft: false 
lang: ''
---
`;

// 将模板内容写入目标文件
fs.writeFileSync(path.join(targetDir, fileName), content);

// 输出创建成功的提示
console.log(`Post ${fullPath} created`);