// FilterTabs 组件的共享筛选处理器
// 兼容 Swup 页面切换
// FilterTabs 会在每个按钮上渲染 data-filter-attr 和 data-filter-value
// 卡片/条目需带有匹配的 data 属性（如 data-category、data-type）

(function () {
	// 初始化筛选标签
	// reset=true 时强制重新初始化（用于动态重建标签）
	function initFilterTabs(reset) {
		var containers = document.querySelectorAll(".filter-tabs");

		containers.forEach(function (container) {
			// 已初始化且非重置模式则跳过
			if (!reset && container.dataset.initialized) return;
			container.dataset.initialized = "true";

			var tabs = container.querySelectorAll(".filter-tabs-item");
			// 从第一个标签读取筛选属性名
			var filterAttr = tabs[0] ? tabs[0].dataset.filterAttr : null;
			if (!filterAttr) return;

			var dataSelector = "[data-" + filterAttr + "]";
			// 优先在最近的 card-base 容器内查找，否则全文档
			var parent = container.closest(".card-base") || document;
			var items = parent.querySelectorAll(dataSelector);
			var noResults = parent.querySelector("#no-results");

			if (items.length === 0) return;

			// 为每个标签绑定点击筛选
			tabs.forEach(function (tab) {
				tab.addEventListener("click", function () {
					// 切换激活态
					tabs.forEach(function (t) {
						t.classList.remove("active");
					});
					tab.classList.add("active");

					var activeValue = tab.dataset.filterValue || "all";
					var visibleCount = 0;

					// 按 data 属性值筛选（支持逗号分隔的多值）
					items.forEach(function (item) {
						var itemValue = item.dataset[filterAttr];
						var match =
							activeValue === "all" || (itemValue && itemValue.split(",").indexOf(activeValue) !== -1);

						if (match) {
							item.classList.remove("filtered-out");
							visibleCount++;
						} else {
							item.classList.add("filtered-out");
						}
					});

					// 无结果提示显隐
					if (noResults) {
						noResults.classList.toggle("hidden", visibleCount > 0);
					}
				});
			});
		});
	}

	// 暴露给外部，用于动态重建标签（如 Memos API 拉取后）
	window.__initFilterTabs = function () {
		initFilterTabs(true);
	};

	// 页面就绪时初始化
	function onInit() {
		if (document.querySelector(".filter-tabs")) {
			initFilterTabs(false);
		}
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", onInit);
	} else {
		onInit();
	}

	// Astro 页面切换后重新初始化
	document.addEventListener("astro:page-load", onInit);
})();