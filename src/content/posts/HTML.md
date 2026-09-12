---
title: "HTML学习"
published: 2025-11-01
description: "HTML 学习笔记，整理网页结构、常用标签、文档组成、表单、多媒体和基础开发要点。"
category: 前端
tags: [HTML]
---

# 介绍

超文本标记语言（HTML，HyperText Markup Language）是一种用于创建网页的标准标记语言。
后缀名 `.html` 或者 `.htm`

- HTML 是用来描述网页的一种语言。
- HTML 不是一种编程语言，而是一种标记语言，标记语言是一套标记标签 (markup tag)
- HTML 使用标记标签来描述网页
- HTML 文档包含了HTML 标签及文本内容
- HTML文档也叫做 web 页面

HTML 标记标签通常被称为 HTML 标签 (HTML tag)。
- HTML 标签是由尖括号包围的关键词，比如`<html>`
- HTML 标签通常是成对出现的，比如`<b>` 和`</b>`
- 标签对中的第一个标签是开始标签，第二个标签是结束标签
- 开始和结束标签也被称为开放标签和闭合标签

`<!DOCTYPE>` 声明有助于浏览器中正确显示网页;doctype 声明是不区分大小写的

```html
<!DOCTYPE html>
<!DOCTYPE HTML>
<!doctype html>
<!Doctype Html>
```

# HTML基础

## 元素（Element）

HTML 文档由一系列 HTML 元素（Element）构成，是网页结构的基础

HTML 元素是从开始标签到结束标签之间的完整结构。

HTML 元素语法规则:
- 元素以开始标签开始，以结束标签结束
- 元素内容位于开始标签与结束标签之间
- 部分元素为空元素（empty element），没有内容
- 空元素通常在开始标签中自闭合（如 `<br/>`）
- 大多数元素可以包含属性（Attributes）
- HTML元素可以嵌套，形成树状结构
	- 一个元素可以包含其他元素
	- HTML文档本质上是一个嵌套结构

示例：

```html
<html>
  <body>
    <p>这是第一个段落。</p>
  </body>
</html>
```

`<html>`元素是根元素，是整个HTML文档的根节点，所有内容必须包含在其中
`<body>`元素是主体元素，定义页面的主体内容，可以包含多个子元素
`<p>` 段落元素

空元素是指没有内容的元素，推荐写法`<br/>`

> 注意：  部分情况下，浏览器会自动补全缺失的结束标签。但编写时**不推荐依赖这种行为**
> HTML标签不区分大小写，但推荐统一使用**小写标签**




## 属性（attribute）

属性是HTML元素提供的附加信息，通常出现在开始标签中，用于定义元素的行为，样式，内容或其他特性，以`属性="属性值"`的形式写在标签内

> 注意： 属性值一般使用双引号，也可以使用单引号
> 	   属性和属性值对大小写不敏感，推荐小写属性和属性值




## 标题（Heading）

在HTML中标题通过`<h1>`标签进行定义 `<h1>`到`<h6>`标题从最小到最大

> 注意： 不要为了粗体或大号文本而使用标题，搜索引擎使用标题为您的网页结构和内容编制索引

**水平线** ` <hr>`  标签在HMTL页面中创建水平线，用于分隔内容
**注释**   `<!-- 这是一个注释 -->`


## 段落（paragraph）

段落是通过` <p>` 标签定义的。

在不切换段落的情况下换行 `<p>这个<br>段落<br>演示了分行的效果</p>`

## 文本格式化
粗体 `<b>`  (bold)  也可使用`<strong>`
斜体 `<i>` (italic)  也可使用`<em>`
>注意： `<b>` 与`<i>` 定义粗体或斜体文本。`<strong>` 或者 `<em>`意味着你要呈现的文本是重要的，所以要突出显示,会被搜索引擎关注   strong 是加重语气； emphasis 是强调着重文字

**HTML 文本格式化标签**

|标签|	描述|
|---|---|
|`<b>`|	|定义粗体文本|
|`<em>`|	定义着重文字|
|`<i>`|	定义斜体字|
|`<small>`|	定义小号字|
|`<strong>`|	定义加重语气|
|`<sub>`|	定义下标字|
|`<sup>`|	定义上标字|
|`<ins>`|	定义插入字|
|`<del>`|	定义删除字|

**HTML "计算机输出" 标签**

|标签|	描述|
|---|---|
|`<code>`|	定义计算机代码|
|`<kbd>`|	定义键盘码|
|`<samp>`|	定义计算机代码样本|
|`<var>`|	定义变量|
|`<pre>`|	定义预格式文本|

**HTML 引文, 引用, 及标签定义**

|标签|	描述|
|---|---|
|`<abbr>`|	定义缩写|
|`<address>`|	定义地址|
|`<bdo>`|	定义文字方向|
|`<blockquote>`|	定义长的引用|
|`<q>`|	定义短的引用语|
|`<cite>`|	定义引用、引证|
|`<dfn>`|	定义一个定义项目|


## 链接（Anchor）

HTML 链接，又叫锚点链接（Anchor，中文 锚）是网页之间跳转的核心部分。 使用链接与网络上的另一个文档相连，是一种用于在不同网页之间导航的元素。通常用于将一个网页与另一个网页或资源（如文档、图像、音频文件等）相关联；允许用户在浏览网页时单击文本或图像来跳转到其他位置，从而实现网页之间的互联；HTML 链接 通过 `<a>` 标签创建，通常用于将用户从一个页面导航到另一个页面、从一个部分跳转到页面中的另一个部分、下载文件、打开电子邮件应用程序或执行 JavaScript 函数等。

**基本语法**
`<a href="URL">链接文本</a>`
-` <a>` 标签：定义了一个超链接（anchor）。它是 HTML 中用来创建可点击链接的主要标签。
- href 属性：指定目标 URL，当点击链接时，浏览器将导航到此 URL。

**超链接**
超链接可以是一个字，一个词，或者一组词，也可以是一幅图像，您可以点击这些内容来跳转到新的文档或者当前文档中的某个部分。

默认情况下，链接将以以下形式出现在浏览器中：
- 一个未访问过的链接显示为蓝色字体并带有下划线。
- 访问过的链接显示为紫色并带有下划线。
- 点击链接时，链接显示为红色并带有下划线。

>注意：如果为这些超链接设置了 CSS 样式，展示样式会根据 CSS 的设定而显示。

**链接属性**

- href    定义链接目标，即链接目的地
	-target  定义链接的打开方式
	- _blank: 在新窗口或新标签页中打开链接。
	- _self: 在当前窗口或标签页中打开链接（默认）。
	- _parent: 在父框架中打开链接。
	- _top: 在整个窗口中打开链接，取消任何框架。
- rel  定义链接与目标页面的关系
	- nofollow 表示搜索引擎不跟踪该链接，常用于外部链接
	- noopener 防止在新的浏览器页面中访问windows.opener属性和open方法，即用于防止通过链接或 window.open() 打开的新页面，反向控制或访问原始页面。
	- noreferrer 不发送 referer header 即不告诉目标网站你从哪里来

- download 提示浏览器下载链接目标而不是导航到该目标
- title 定义链接的额为信息，当鼠标悬停在链接上是显示提示
- id 用于链接锚点，通常在同一页面中跳转到某个特定位置
- hreflang 指定链接的目标URL的语言
- type 指向链接资源的MIME类型（Multipurpose Internet Mail Extensions,多用途互联网邮件扩展）用于标识互联网上传输的文件类型和格式
- class 指定元素的类名（CSS定义）
- style 直接在元素上定义CSS样式

一些导航空链接设置：
|方法|	作用|	是否会跳转|	场景适用性|
|---|---|---|---|
|href="#"	|导航到页面顶部|	是|	占位符，捕获点击事件|
|href="javascript:void(0)"|	阻止默认行为，不刷新页面|	否|	阻止跳转，配合 JS 使用|
|href=""|	刷新当前页面|	是|	需要页面刷新时|
|href="about:blank"|	打开空白页面|	是|	新窗口打开空白页面|
|role="button"|	链接表现为按钮，无默认行为|	否|	配合 JS 实现按钮功能，无跳转|

>注意：始终将正斜杠添加到子文件夹，
`href="https://www.runoob.com/html"`这样会向服务器请求两次，因为服务器会添加正斜杠再创建新请求
**建议书写**`href="https://www.runoob.com/html/"`

## 头部（Head）


|标签|	描述|
|---|---|
|`<head>`|	定义了文档的信息|
|`<title>`|	定义了文档的标题|
|`<base>`|	定义了页面链接标签的默认链接地址|
|`<link>`|	定义了一个文档和外部资源之间的关系|
|`<meta>`|	定义了HTML文档中的元数据|
|`<script>`|	定义了客户端的脚本文件|
|`<style>`|	定义了HTML文档的样式文件|

- `<head>`元素：包含了所有的头部标签元素。在` <head>`元素中你可以插入脚本（scripts）, 样式文件（CSS），及各种meta信息。可以添加在头部区域的元素标签为: `<title>, <style>, <meta>, <link>, <script>, <noscript> 和 <base>。`
- `<title>`元素: 定义了浏览器工具栏的标题；在 HTML/XHTML 文档中是必需的；当网页添加到收藏夹时，显示在收藏夹中的标题；显示在搜索引擎结果页面的标题
- `<base>`元素描述了基本的链接地址/链接目标，该标签作为HTML文档中所有的链接标签的默认链接。`<base href="http://www.runoob.com/images/" target="_blank">`
- `<style>`元素：定义了文档与外部资源之间的关系；通常用于链接到样式表。`<link rel="stylesheet" type="text/css" href="mystyle.css">`
- `<meta>`元素描述了一些基本的元数据；不显示在页面上，但会被浏览器解析；通常用于指定网页的描述，关键词，文件的最后修改时间，作者，和其他元数据；元数据可以使用于浏览器（如何显示内容或重新加载页面），搜索引擎（关键词），或其他Web服务。

```html
<!--为搜索引擎定义关键词 -->
<meta name="keywords" content="HTML, CSS, XML, XHTML, JavaScript">
<!--为网页定义描述内容 -->
<meta name="description" content="免费 Web & 编程 教程">
<!--定义网页作者 -->
<meta name="author" content="Runoob">
<!--每30秒钟刷新当前页面 -->
<meta http-equiv="refresh" content="30">
```

- `<script>` 元素 用于加载脚本文件

## 样式CSS


CSS (Cascading Style Sheets) 用于渲染HTML元素标签的样式。
CSS 可以通过以下方式添加到HTML中:
- 内联样式- 在HTML元素中使用"style" 属性
- 内部样式表 -在HTML文档头部` <head> `区域使用`<style>` 元素 来包含CSS
- 外部引用 - 使用外部 CSS 文件
最推荐的方式是**外部引用**

关于CSS的语法查看CSS相关文章

样式标签：
- `<style>` 定义文本样式
- `<link>` 定义资源引用地址

1. **内联样式**
改变段落颜色和做外边距
```<p style="color:blue;margin-left:20px;">这是一个段落。</p>```

背景色： background-color
字体：font-family
颜色： color
字体大小：font-size
文本对齐方式： text-align

2. 内部样式表

```html
<head>
<style type="text/css">
body {background-color:yellow;}
p {color:blue;}
</style>
</head>
```

3. 外部引用

```html
<head>
<link rel="stylesheet" type="text/css" href="mystyle.css">
</head>
```


## 图像(image)

HTML 图像标签：
|标签|	描述|
|---|---|
|`<img>`	|定义图像|
|`<map>`	|定义图像地图|
|`<area>`	|定义图像地图中的可点击区域|

图像由`<img>`标签定义
**语法** `<img src="url" alt="some_text">`
**URL**指存储图像的位置
**alt** （ alternative，可替代的） 用来定义一串预备的可替换的文本
在浏览器无法载入图像时，替换文本属性告诉读者她们失去的信息。此时，浏览器将显示这个替代性的文本而不是图像。

设置图像的高度与宽度，默认单位为像素
`<img src="pulpit.jpg" alt="Pulpit rock" width="304" height="228">`
>提示：如果图像指定了高度宽度，页面加载时就会保留指定的尺寸。如果没有指定图片的大小，加载页面时有可能会破坏HTML页面的整体布局。




## 表格(table)
表格是一种用于展示结构化数据的标记语言元素；由`<table>` 定义；数据单元格可以包含文本、图片、列表、段落、表单、水平线、表格等等。

表格常用标签：

|标签|	描述|
|---|---|
|`<table>`|	定义表格|
|`<th>`|	定义表格的表头|
|`<tr>`|	定义表格的行|
|`<td>`|	定义表格单元|
|`<caption>`|	定义表格标题|
|`<colgroup>`|	定义表格列的组|
|`<col>`|	定义用于表格列的属性|
|`<thead>`|	定义表格的页眉|
|`<tbody>`|	定义表格的主体|
|`<tfoot>`|	定义表格的页脚|

每个表格均有若干行（`<tr>` ），每行被分割为若干单元格（`<td>` ），表格可以包含标题行（`<th>`）用于定义列的标题。
- tr： table row ，表示表格的一行。
- td： table data ，表示表格的数据单元格。
- th： table header，表示表格的表头单元格。

`<table>` 元素表示整个表格，它包含两个主要部分：`<thead>` 和 `<tbody>`。
`<thead >` 用于定义表格的标题部分: 在 `<thead >` 中，使用 `<th >`元素定义列的标题，
`<tbody >` 用于定义表格的主体部分: 在 `<tbody > `中，使用` <tr > `元素定义行，并在每行中使用` <td > `元素定义单元格数据。

通过使用 `<th >` 元素定义列标题，可以使其在表格中以粗体显示，与普通单元格区分开来。

` <tfoot >` （表格页脚） 可用于在表格的底部定义摘要、统计信息等内容。
`<caption >` （表格标题）可用于为整个表格定义标题

**边框属性**
默认不显示边框，使用边框属性 border

```html
<table border="1">
    <tr>
        <td>Row 1, cell 1</td>
        <td>Row 1, cell 2</td>
    </tr>
</table>
```




## 列表

HTML支持有序，无序和定义列表

列表标签：

|标签|	描述|
|---|---|
|`<ol>`|	定义有序列表|
|`<ul>`|	定义无序列表|
|`<li>`|	定义列表项|
|`<dl>`|	定义列表|
|`<dt>`|	自定义列表项目|
|`<dd>`|	定义自定列表项的描述|

无序列表示例：

```html
<ul>
<li>Coffee</li>
<li>Milk</li>
</ul>
```

## 区块

通过`<div>`和`<span>`将元素组合起来
div： division  分割，分块，区块
span： span  跨度、范围、覆盖


|标签	|描述|
|---|---|
|`<div>`|	定义了文档的区域，块级 (block-level)|
|`<span>`|	用来组合文档中的行内元素， 内联元素(inline)|

**区块元素**
大多数 HTML 元素被定义为块级元素或内联元素。块级元素在浏览器显示时，通常会以新行来开始（和结束）例如`<h1>, <p>, <ul>, <table>`

**内联元素**
内联元素在显示时通常不会以新行开始。
实例: `<b>, <td>, <a>, <img>`

**`<div>`元素**
块级元素，它可用于组合其他 HTML 元素的容器；没有特定的含义；浏览器会在其前后显示换行；
如果与 CSS 一同使用，可用于对大的内容块设置样式属性
另一个常见的用途是文档布局

**`<span>`元素**
内联元素，可用作文本的容器；没有特定的含义
当与 CSS 一同使用时，可用于为部分文本设置样式属性


## 表单和输入
HTML 表单用于收集用户的输入信息；表示文档中的一个区域，此区域包含交互控件，将用户收集到的信息发送到 Web 服务器；通常包含各种输入字段、复选框、单选按钮、下拉列表等元素。

表单标签：

|标签|	描述|
|---|---|
|`<form>`|	定义供用户输入的表单|
|`<input>`|	定义输入域|
|`<textarea>`|	定义文本域 (一个多行的输入控件)|
|`<label>`|	定义了 `<input>` 元素的标签，一般为输入标题|
|`<fieldset>`|	定义了一组相关的表单元素，并使用外框包含起来|
|`<legend>`|	定义了 `<fieldset>` 元素的标题|
|`<select>`|	定义了下拉选项列表|
|`<optgroup>`|	定义选项组|
|`<option>`|	定义下拉列表中的选项|
|`<button>`|	定义一个点击按钮|
|`<datalist>`|	指定一个预先定义的输入控件选项列表(**html5新标签**)|
|`<keygen>`|	定义了表单的密钥对生成器字段(**html5新标签**)|
|`<output>`|	定义一个计算结果(**html5新标签**)|


示例：

```html

<form action="/" method="post">
    <!-- 文本输入框 -->
    <label for="name">用户名:</label>
    <input type="text" id="name" name="name" required>

    <br>

    <!-- 密码输入框 -->
    <label for="password">密码:</label>
    <input type="password" id="password" name="password" required>

    <br>

    <!-- 单选按钮 -->
    <label>性别:</label>
    <input type="radio" id="male" name="gender" value="male" checked>
    <label for="male">男</label>
    <input type="radio" id="female" name="gender" value="female">
    <label for="female">女</label>

    <br>

    <!-- 复选框 -->
    <input type="checkbox" id="subscribe" name="subscribe" checked>
    <label for="subscribe">订阅推送信息</label>

    <br>

    <!-- 下拉列表 -->
    <label for="country">国家:</label>
    <select id="country" name="country">
        <option value="cn">CN</option>
        <option value="usa">USA</option>
        <option value="uk">UK</option>
    </select>

    <br>

    <!-- 提交按钮 -->
    <input type="submit" value="提交">
</form>
```

**表单**
表单是一个包含表单元素的区域。使用`<form>`来创建表单
表单元素是允许用户在表单中输入内容，比如：文本域（textarea）、下拉列表（select）、单选框（radio-buttons）、复选框（checkbox） 等等。

**输入**
多数情况下被用到的表单标签是输入标签 `<input>` 输入类型由`type`属性定义
- 文本域（text）当用户要在表单中键入字母、数字等内容时，就会用到文本域
- 密码字段（password）密码字段字符不会明文显示，而是以星号 * 或圆点 . 替代。
- 单选按钮（radio）
- 复选框（checkbox）
- 提交按钮（submit）

method 属性，定义表单数据的提交方式：
- post：指的是 HTTP POST 方法，表单数据会包含在表单体内然后发送给服务器，用于提交敏感数据，如用户名与密码等
- 默认值，指的是 HTTP GET 方法，表单数据会附加在 action 属性的 URL 中，并以 ?作为分隔符，一般用于不敏感信息，如分页等。


## 框架
框架使用`<iframe>`标签；通过使用框架，你可以在同一个浏览器窗口中显示不止一个页面。
语法：`<iframe src="URL"></iframe>`

**设置宽度与高度**
height 和 width 属性用来定义iframe标签的高度与宽度。属性默认以像素为单位, 但是你可以指定其按比例显示 (如："80%")。

**移除边框**
frameborder 属性用于定义iframe表示是否显示边框。设置属性值为 "0" 移除iframe的边框:

## 脚本（script）

脚本标签：

|标签|	描述|
|---|---|
|`<script>`|	定义了客户端脚本|
|`<noscript>`|	定义了不支持脚本浏览器输出的文本|

`<script>` 标签用于定义客户端脚本，比如 JavaScript。既可包含脚本语句，也可通过 src 属性指向外部脚本文件。JavaScript 最常用于图片操作、表单验证以及内容动态更新。

`<noscript>`标签提供无法使用脚本时的替代内容，比方在浏览器禁用脚本时，或浏览器不支持客户端脚本时。可包含普通 HTML 页面的 body 元素中能够找到的所有元素。只有在浏览器不支持脚本或者禁用脚本时，才会显示 `<noscript>` 元素中的内容：

## 字符实体
HTML 中的预留字符必须被替换为字符实体。一些在键盘上找不到的字符也可以使用字符实体来替换。

**HTML实体**
在 HTML 中，某些字符是预留的。在 HTML 中不能使用小于号（<）和大于号（>），这是因为浏览器会误认为它们是标签。如果希望正确地显示预留字符，我们必须在 HTML 源代码中使用字符实体（character entities）。
>注意：实体名称对大小写敏感

**不间断空格**
HTML 中的常用字符实体是不间断空格(`&nbsp;`)。浏览器总是会合并 HTML 页面中的空格，只保留一个空格。所以需要使用字符实体增加空格数量


**音标符**
发音符号是加到字母上的一个"glyph(字形)"。
一些变音符号, 如 尖音符 (  ̀) 和 抑音符 (  ́) 。
变音符号可以出现字母的上面和下面，或者字母里面，或者两个字母间。
变音符号可以与字母、数字字符的组合来使用。



常用实体：

|显示结果|	描述|	实体名称|	实体编号|
|---|---|---|---|
| 	|空格|	&nbsp;|	&#160;|
|<	|小于号|	&lt;|	&#60;|
|>	|大于号|	&gt;|	&#62;|
|&	|和号|	&amp;|	&#38;|
|"	|引号|	&quot;|	&#34;|
|'	|撇号| 	&apos; (IE不支持)|	&#39;|
|￠	|分|	&cent;|	&#162;|
|£	|镑|	&pound;|	&#163;|
|¥	|人民币/日元|	&yen;|	&#165;|
|€	|欧元|	&euro;|	&#8364;|
|§	|小节|	&sect;|	&#167;|
|©	|版权|	&copy;|	&#169;|
|®	|注册商标|	&reg;|	&#174;|
|™	|商标|	&trade;|	&#8482;|
|×	|乘号|	&times;|	&#215;|
|÷	|除号|	&divide;|	&#247;|


## URL
URL 是一个网页地址；统一资源定位器(Uniform Resource Locators)
Web浏览器通过URL从Web服务器请求页面。

示例：scheme://host.domain:port/path/filename
- scheme - 定义因特网服务的类型。最常见的类型是 http
- host - 定义域主机（http 的默认主机是 www）
- domain - 定义因特网域名，比如 runoob.com
- :port - 定义主机上的端口号（http 的默认端口号是 80）
- path - 定义服务器上的路径（如果省略，则文档必须位于网站的根目录中）。
- filename - 定义文档/资源的名称


常见的 URL Scheme：

|Scheme	|访问	|用于|
|----|----|---|
|http	|超文本传输协议	|以 http:// 开头的普通网页。不加密|
|https	|安全超文本传输协议	|安全网页，加密所有信息交换|
|ftp	|文件传输协议	|用于将文件下载或上传至网站|
|file	 |	|计算机上的文件|


URL 只能使用 ASCII 字符集来通过因特网进行发送。由于 URL 常常会包含 ASCII 集合之外的字符，必须转换为有效的 ASCII 格式。URL 编码使用 "%" 其后跟随两位的十六进制数来替换非 ASCII 字符； 不能包含空格，编码通常使用 + 来替换空格。



# HTML媒体

## 媒体

Web 上的多媒体指的是音效、音乐、视频和动画；现代网络浏览器已支持很多多媒体格式。
多媒体来自多种不同的格式。它可以是您听到或看到的任何内容，文字、图片、音乐、音效、录音、电影、动画等等。

常见的视频格式：

|格式|	文件|	描述|
|---|---|---|
|AVI|	.avi|	AVI (Audio Video Interleave) 格式是由微软开发的。所有运行 Windows 的计算机都支持 AVI 格式。它是因特网上很常见的格式，但非 Windows 计算机并不总是能够播放。|
|WMV|	.wmv|	Windows Media 格式是由微软开发的。Windows Media 在因特网上很常见，但是如果未安装额外的（免费）组件，就无法播放 Windows Media 电影。一些后期的 Windows Media 电影在所有非 Windows 计算机上都无法播放，因为没有合适的播放器|
|MPEG|	.mpg /.mpeg |  MPEG (Moving Pictures Expert Group) 格式是因特网上最流行的格式。它是跨平台的，得到了所有最流行的浏览器的支持|
|QuickTime|	.mov|	QuickTime 格式是由苹果公司开发的。QuickTime 是因特网上常见的格式，但是 QuickTime 电影不能在没有安装额外的（免费）组件的 Windows 计算机上播放|
|RealVideo| .rm /.ram |RealVideo 格式是由 Real Media 针对因特网开发的。该格式允许低带宽条件下（在线视频、网络电视）的视频流。由于是低带宽优先的，质量常会降低|
|Flash	|.swf / .flv|Flash (Shockwave) 格式是由 Macromedia 开发的。Shockwave 格式需要额外的组件来播放。但是该组件会预装到 Firefox 或 IE 之类的浏览器上|
|Mpeg-4|	.mp4|	Mpeg-4 (with H.264 video compression) 是一种针对因特网的新格式。事实上，YouTube 推荐使用 MP4。YouTube 接收多种格式，然后全部转换为 .flv 或 .mp4 以供分发。越来越多的视频发布者转到 MP4，将其作为 Flash 播放器和 HTML5 的因特网共享格式|



**音频格式**

MP3是一种音频压缩技术，其全称是动态影像专家压缩标准音频层面3（Moving Picture Experts Group Audio Layer III），简称为MP3。它被设计用来大幅度地降低音频数据量。如果你的站点是音乐类型的，你可以选择mp3格式。

| 格式 | 文件  | 描述   |
| ---- | ----- | ----- |
| MIDI | .mid.midi | MIDI (Musical Instrument Digital Interface) 是一种针对电子音乐设备（比如合成器和声卡）的格式。MIDI 文件不含有声音，但包含可被电子产品（比如声卡）播放的数字音乐指令。[点击这里播放 The Beatles](https://www.runoob.com/try/demo_source/beatles.mid)。因为 MIDI 格式仅包含指令，所以 MIDI 文件极其小巧。上面的例子只有 23k 的大小，但却能播放将近 5 分钟。MIDI 得到了广泛的平台上的大量软件的支持。大多数流行的网络浏览器都支持 MIDI。 |
| RealAudio | .rm.ram   | RealAudio 格式是由 Real Media 针对因特网开发的。该格式也支持视频。该格式允许低带宽条件下的音频流（在线音乐、网络音乐）。由于是低带宽优先的，质量常会降低。 |
| Wave      | .wav      | Wave (waveform) 格式是由 IBM 和微软开发的。所有运行 Windows 的计算机和所有网络浏览器（除了 Google Chrome）都支持它。 |
| WMA       | .wma      | WMA 格式 (Windows Media Audio)，质量优于 MP3，兼容大多数播放器，除了 iPod。WMA 文件可作为连续的数据流来传输，这使它对于网络电台或在线音乐很实用。 |
| MP3       | .mp3.mpga | MP3 文件实际上是 MPEG 文件的声音部分。MPEG 格式最初是由运动图像专家组开发的。MP3 是其中最受欢迎的针对音乐的声音格式。期待未来的软件系统都支持它。 |



## 插件



辅助应用程序（helper application）是可由浏览器启动的程序，也可称之为插件，功能是扩展HTML浏览器的功能

插件可用于播放音频和视频（以及其他），能够允许用户来控制部分或全部播放设置。大多数插件允许对音量设置和播放功能（比如后退、暂停、停止和播放）的手工（或程序的）控制。

插件可以通过` <object>` 标签或者 `<embed>`标签添加在页面中。 

**`<object>` 元素**
所有主流浏览器都支持` <object>` 标签。`<object>` 元素定义了在 HTML 文档中嵌入的对象,用于插入对象 (例如在网页中嵌入 Java 小程序, PDF 阅读器, Flash 播放器) 。
示例：`<object width="400" height="50" data="bookmark.swf"></object>`
同样也可用于包含HTML文件：`<object width="100%" height="500px" data="snippet.html"></object>`
或者用于插入一张图片：`<object data="audi.jpeg"></object>`

**`<embed>` 元素**

所有主流浏览器都支持 `<embed>` 元素,表示一个 HTML Embed 对象 。
示例：`<embed width="400" height="50" src="bookmark.swf">`
可用于包含HTML文件：`<embed width="100%" height="500px" src="snippet.html">`
或者插入一张图片：`<embed src="audi.jpeg">`

## **音频**

声音在HTML中可以以不同的方式播放。

- 使用插件
- 使用`<embed>`元素
- 使用`<object>`元素
- 使用HTML5 `<audio>` 元素
- 使用超链接

 HTML多媒体标签：

|标签|	描述|
|---|---|
|`<embed>`|	定义内嵌对象。HTML4 中不赞成，HTML5 中允许|
|`<object>`|	定义内嵌对象|
|`<param>`|	定义对象的参数|
|`<audio>`|	定义了声音内容**(HTML5新标签)**|
|`<video>`|	定义一个视频或者影片**(HTML5新标签)**|
|`<source>`|	定义了media元素的多媒体资源(`<video>` 和 `<audio>`)**(HTML5新标签)**|
|`<track>`|	规定media元素的字幕文件或其他包含文本的文件 (`<video>` 和`<audio>`)**(HTML5新标签)**|

## 视频

同音频



# HTML5

## 介绍
HTML5是HTML最新的修订版本，是下一代 HTML 标准。，2014年10月由万维网联盟（W3C）完成标准制定，设计目的是为了在移动设备上支持多媒体。

使用HTML5可以简单的开发应用
- 本地数据存储
- 访问本地文件
- 本地 SQL 数据
- 缓存引用
- Javascript 工作者
- XHTMLHttpRequest 2

使用 HTML5 你可以简单的绘制图形:
- 使用 `<canvas>` 元素。
- 使用内联 SVG。
- 使用 CSS3 2D 转换、CSS3 3D 转换。

HTML5 使用 CSS3
- 新选择器
- 新属性
- 动画
- 2D/3D 转换
- 圆角
- 阴影效果
- 可下载的字体

**语义元素**

HTML5 添加了很多语义元素如下所示：

|标签|	描述|
|---|---|
|`<article>`	|定义页面独立的内容区域|
|`<aside>`	|定义页面的侧边栏内容|
|`<bdi>`	|允许您设置一段文本，使其脱离其父元素的文本方向设置|
|`<command>`	|定义命令按钮，比如单选按钮、复选框或按钮|
|`<details>`	|用于描述文档或文档某个部分的细节|
|`<dialog>`	|定义对话框，比如提示框|
|`<summary>`	|标签包含 details 元素的标题|
|`<figure>`	|规定独立的流内容（图像、图表、照片、代码等等）|
|`<figcaption>`	|定义` <figure>` 元素的标题|
|`<footer>`	|定义 section 或 document 的页脚|
|`<header>`	|定义了文档的头部区域|
|`<mark>`	|定义带有记号的文本|
|`<meter>`	|定义度量衡。仅用于已知最大和最小值的度量|
|`<nav>`	|定义导航链接的部分|
|`<progress>`	|定义任何类型的任务的进度|
|`<ruby>`	|定义 ruby 注释（中文注音或字符）|
|`<rt>`	|定义字符（中文注音或字符）的解释或发音|
|`<rp>`	|在 ruby 注释中使用，定义不支持 ruby 元素的浏览器所显示的内容|
|`<section>`	|定义文档中的节（区段）|
|`<time>`	|定义日期或时间|
|`<wbr>`	|规定在文本中的何处适合添加换行符|


## 画布
HTML5`<canvas>` 元素用于图形的绘制，通过脚本 (通常是JavaScript)来完成，标签只是图形容器，必须使用脚本来绘制图形，可以通过多种方法使用 canvas 绘制路径,盒、圆、字符以及添加图像。

**创建一个画布**
示例：
```HTML
<canvas id="myCanvas" width="200" height="100"
style="border:1px solid #000000;">
</canvas>
```
>注意：
>默认情况下`<canvas>` 元素没有边框和内容
>标签通常需要指定一个id属性 (脚本中经常引用), width 和 height 属性定义的画布的大小.
>你可以在HTML页面中使用多个 `<canvas>`元素；使用 style 属性来添加边框
>**绘制图像需要使用 JavaScript 来完成

## SVG

SVG 定义为可缩放矢量图形。HTML5 支持内联 SVG。HTML `<svg>` 元素是 SVG 图形的容器。SVG 有多种绘制路径、框、圆、文本和图形图像的方法。

- SVG 指可伸缩矢量图形 (Scalable Vector Graphics)
- SVG 用于定义用于网络的基于矢量的图形
- SVG 使用 XML 格式定义图形
- SVG 图像在放大或改变尺寸的情况下其图形质量不会有损失
- SVG 是万维网联盟的标准

**优势**
与其他图像格式相比（比如 JPEG 和 GIF），使用 SVG 的优势在于：

- SVG 图像可通过文本编辑器来创建和修改
- SVG 图像可被搜索、索引、脚本化或压缩
- SVG 是可伸缩的
- SVG 图像可在任何的分辨率下被高质量地打印
- SVG 可在图像质量不下降的情况下被放大

示例：SVG圆形

```HTML
<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
   <circle cx="100" cy="50" r="40" stroke="black" stroke-width="2" fill="red" />
</svg>
```

SVG 与 Canva 两者间的区别：
|Canvas	|SVG|
|---|---|
|依赖分辨率|不依赖分辨率|
|不支持事件处理器|支持事件处理器|
|弱的文本渲染能力|最适合带有大型渲染区域的应用程序（比如谷歌地图）|
|能够以 .png 或 .jpg 格式保存结果图像|复杂度高会减慢渲染速度（任何过度使用 DOM 的应用都不快）|
|最适合图像密集型的游戏，其中的许多对象会被频繁重绘|不适合游戏应用|

## ManthML

MathML 是数学标记语言，是一种基于XML（标准通用标记语言的子集）的标准，用来在互联网上书写数学符号和公式的置标语言。
使用到的标签是 `<math>...</math>` 

示例：

```HTML
 <math xmlns="http://www.w3.org/1998/Math/MathML">
               
         <mrow>
            <msup><mi>a</mi><mn>2</mn></msup>
            <mo>+</mo>
                               
            <msup><mi>b</mi><mn>2</mn></msup>
            <mo>=</mo>
                               
            <msup><mi>c</mi><mn>2</mn></msup>
         </mrow>
                       
      </math>
```


## 拖放
拖放（Drag 和 Drop）是HTML标准的组成部分，拖放是一种常见的特性，即抓取对象以后拖到另一个位置，任何元素都能够拖放。

**设置元素可拖放**

```<img draggable="true">```

**拖动事件**

```HTML
<img id="drag1" src="/images/logo.png" draggable="true" ondragstart="drag(event)" width="336" height="69">
```

ondragstart 属性调用了一个函数，drag(event)，它规定了被拖动的数据。
dataTransfer.setData() 方法设置被拖数据的数据类型和值：

```html
function drag(ev)
{
    ev.dataTransfer.setData("Text",ev.target.id);
}
```

**放置地点**

```HTML
<div id="div1" ondrop="drop(event)" ondragover="allowDrop(event)"></div>
```
ondragover 事件规定在何处放置被拖动的数据。
默认地，无法将数据/元素放置到其他元素中。如果需要设置允许放置，我们必须阻止对元素的默认处理方式。
这要通过调用 ondragover 事件的 event.preventDefault() 方法：
`event.preventDefault()`

**进行放置** - onfrop

```HTML
function drop(ev)
{
    ev.preventDefault();
    var data=ev.dataTransfer.getData("Text");
    ev.target.appendChild(document.getElementById(data));
}
```

代码解释：
- 调用 preventDefault() 来避免浏览器对数据的默认处理（drop 事件的默认行为是以链接形式打开）
- 通过 dataTransfer.getData("Text") 方法获得被拖的数据。该方法将返回在 setData() 方法中设置为相同类型的任何数据。
- 被拖数据是被拖元素的 id ("drag1")
- 把被拖元素追加到放置元素（目标元素）中


## 后续更新...







# HTML速查总结

## HTML标签简写及全称



|标签|	英文全称|	中文说明|
|---|---|---|
|a	|Anchor|	锚|
|abbr	|Abbreviation|	缩写词|
|acronym	|Acronym|	取首字母的缩写词|
|address	|Address|	地址|
|alt	|alter|	替用(一般是图片显示不出的提示)|
|b	|Bold|	粗体（文本）|
|bdo	|Bi-Directional Override|	文本显示方向|
|big	|Big|	变大（文本）|
|blockquote	|Block Quotation|	区块引用语|
|br	|Break|	换行|
|cell	|cell|	巢|
|cellpadding	|cellpadding|	巢补白|
|cellspacing	|cellspacing|	巢空间|
|center	|Centered|	居中（文本）|
|cite	|Citation|	引用|
|code	|Code|	源代码（文本）|
|dd	|Definition Description|	定义描述|
|del	|Deleted|	删除（的文本）|
|dfn	|Defines a Definition Term|	定义定义条目|
|div	|Division|	分隔|
|dl	|Definition List|	定义列表|
|dt	|Definition Term|	定义术语|
|em	|Emphasized|	加重（文本）|
|font	|Font|	字体|
|h1~h6	|Header 1 to Header 6|	标题1到标题6|
|hr	|Horizontal Rule|	水平尺|
|href	|hypertext reference|	超文本引用|
|i	|Italic|	斜体（文本）|
|iframe	|Inline frame|	定义内联框架|
|ins	|Inserted|	插入（的文本）|
|kbd	|Keyboard|	键盘（文本）|
|li	|List Item|	列表项目|
|nl	|navigation lists|	导航列表|
|ol	|Ordered List|	排序列表|
|optgroup	|Option group|	定义选项组|
|p	|Paragraph|	段落|
|pre	|Preformatted|	预定义格式（文本 ）|
|q	|Quotation|	引用语|
|rel	|Reload|	加载|
|s/ strike	|Strikethrough|	删除线|
|samp	|Sample|	示例（文本）|
|small	|Small|	变小（文本）|
|span	|Span|	范围|
|src	|Source|	源文件链接|
|strong	|Strong|	加重（文本）|
|sub	|Subscripted|	下标（文本）|
|sup	|Superscripted|	上标（文本）|
|td	|table data cell|	表格中的一个单元格|
|th	|table header cell|	表格中的表头|
|tr	|table row|	表格中的一行|
|tt	|Teletype|	打印机（文本）|
|u	|Underlined|	下划线（文本）|
|ul	|Unordered List|	不排序列表|
|va|	|Variable|	变量（文本）|



## HTML速查列表

**基本文档**

```html
<!DOCTYPE html>
<html>
<head>
<title>文档标题</title>
</head>
<body>
可见文本...
</body>
</html>
```
**基本标签**

```html
<h1>最大的标题</h1>
<h2> . . . </h2>
<h3> . . . </h3>
<h4> . . . </h4>
<h5> . . . </h5>
<h6>最小的标题</h6>
 
<p>这是一个段落。</p>
<br> （换行）
<hr> （水平线）
<!-- 这是注释 -->
```

**文本格式化**
```html
<b>粗体文本</b>
<code>计算机代码</code>
<em>强调文本</em>
<i>斜体文本</i>
<kbd>键盘输入</kbd> 
<pre>预格式化文本</pre>
<small>更小的文本</small>
<strong>重要的文本</strong>
 
<abbr> （缩写）
<address> （联系信息）
<bdo> （文字方向）
<blockquote> （从另一个源引用的部分）
<cite> （工作的名称）
<del> （删除的文本）
<ins> （插入的文本）
<sub> （下标文本）
<sup> （上标文本）
```

**链接**

```html
普通的链接：<a href="http://www.example.com/">链接文本</a>
图像链接： <a href="http://www.example.com/"><img src="URL" alt="替换文本"></a>
邮件链接： <a href="mailto:webmaster@example.com">发送e-mail</a>
书签：
<a id="tips">提示部分</a>
<a href="#tips">跳到提示部分</a>
```

**图片**
```html
<img src="URL" alt="替换文本" height="42" width="42">
```

**样式/区块**
```html
<style type="text/css">
h1 {color:red;}
p {color:blue;}
</style>
<div>文档中的块级元素</div>
<span>文档中的内联元素</span>
```


**无序列表**
```html
<ul>
    <li>项目</li>
    <li>项目</li>
</ul>
```

**有序列表**
```html
<ol>
    <li>第一项</li>
    <li>第二项</li>
</ol>
```

**自定义列表**
```html
<ol>
    <li>第一项</li>
    <li>第二项</li>
</ol>
```

**表格**
```html
<table border="1">
  <tr>
    <th>表格标题</th>
    <th>表格标题</th>
  </tr>
  <tr>
    <td>表格数据</td>
    <td>表格数据</td>
  </tr>
</table>
```

**框架**
```html
<iframe src="demo_iframe.htm"></iframe>
```

**表单**
```html
<form action="demo_form.php" method="post/get">
<input type="text" name="email" size="40" maxlength="50">
<input type="password">
<input type="checkbox" checked="checked">
<input type="radio" checked="checked">
<input type="submit" value="Send">
<input type="reset">
<input type="hidden">
<select>
<option>苹果</option>
<option selected="selected">香蕉</option>
<option>樱桃</option>
</select>
<textarea name="comment" rows="60" cols="20"></textarea>
 
</form>
```

**实体**
```html
&lt; 等同于 <
&gt; 等同于 >
&#169; 等同于 ©
```
