import type { PioConfig } from "../types/config";

// Pio 看板娘配置
export const pioConfig: PioConfig = {
	enable: true, // 启用看板娘
	models: ["/pio/models/standard/cat.model3.json"], // 默认模型路径
	position: "left", // 模型位置
	width: 280, // 默认宽度
	height: 250, // 默认高度
	mode: "draggable", // 默认为可拖拽模式
	hiddenOnMobile: true, // 默认在移动设备上隐藏
	hideAboutMenu: true, // 隐藏内置 About 菜单按钮
	dialog: {
		welcome: "欢迎来到一只捡星星的熊的个人博客", // 欢迎词
		touch: [
			"喵呜！！！",
		], // 触摸提示
		home: "点击这儿返回首页", // 首页提示
		skin: ["你想要看看我的新服装吗？", "这身衣服漂亮吧！"], // 换装提示
		close: "下次再见哦！", // 关闭提示
		link: "", // 关于链接
	},
};
