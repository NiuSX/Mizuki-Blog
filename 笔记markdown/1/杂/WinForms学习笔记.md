# WinForms 学习笔记：从事件驱动到企业桌面工程化的万字精讲

> 适用范围：Windows Forms on .NET 与 Windows Forms on .NET Framework。  
> 更新时间：2026-06-19。  
> 当前定位：Windows Forms，通常简称 WinForms，是微软成熟的 Windows 桌面 GUI 框架。现代 .NET 中的 WinForms 是开源实现，只运行在 Windows 上；.NET Framework 版仍广泛存在于存量企业系统中。微软文档已经提供 WinForms for .NET 10 的更新说明，实际项目应优先选择当前受支持的 LTS 或公司统一运行时版本。

## 目录

1. WinForms 是什么，适合做什么
2. WinForms 与 WPF、WinUI、MAUI、Avalonia 的关系
3. 开发环境、项目结构与启动流程
4. Form、Control 与事件驱动模型
5. 设计器、Designer.cs 与代码组织
6. 常用控件精讲
7. 布局系统：坐标、Anchor、Dock、Panel、TableLayoutPanel
8. 菜单、工具栏、状态栏、托盘与对话框
9. 数据绑定：BindingSource、BindingList、DataGridView
10. DataGridView 企业级用法
11. 多窗体、导航、MDI 与应用生命周期
12. 异步、后台任务与 UI 线程
13. 绘图、GDI+、自定义控件与双缓冲
14. 高 DPI、字体缩放与界面适配
15. 配置、资源、本地化与用户设置
16. 文件、数据库、日志与异常处理
17. 部署、发布、安装包与自动更新
18. 性能优化与内存泄漏排查
19. 测试、架构分层与工程化实践
20. 常见坑与排查清单
21. 学习路线与练手项目
22. 参考资料

## 1. WinForms 是什么，适合做什么

WinForms 是 .NET 生态中最早、最成熟的 Windows 桌面 UI 框架之一。它把 Win32 窗口、控件、消息循环、GDI+ 绘图、事件模型封装成面向对象的 .NET API，使开发者可以用 C# 或 VB 快速创建 Windows 桌面应用。

它的核心风格是“窗体 + 控件 + 事件”。你在窗体上放控件，设置属性，给按钮、菜单、文本框、表格绑定事件处理器，然后在事件中编写业务响应逻辑。这个模型非常直观，也是 WinForms 长期流行的重要原因。

WinForms 适合：

- 企业内部工具、管理系统、运维工具、数据录入系统。
- 需要快速交付、控件交互传统、界面复杂度适中的 Windows 程序。
- 需要使用大量现成第三方 WinForms 控件的项目。
- 维护 .NET Framework 老系统，或把老系统逐步迁移到现代 .NET。
- 需要访问 Windows 本地能力，例如文件、注册表、串口、USB 设备、打印机、托盘、剪贴板、COM、Office 自动化。
- 数据表格密集型应用，例如进销存、库存、财务、报表客户端、设备采集客户端。
- 不追求极强 UI 定制，但要求稳定、易维护、开发效率高的桌面软件。

WinForms 不太适合：

- 需要跨平台原生 UI 的项目。
- 需要复杂动画、模板化换肤、矢量布局和高度定制界面的应用。
- 高分辨率复杂视觉设计优先的现代消费软件。
- 大规模 3D、游戏、图像处理工作站。
- 希望天然采用声明式 UI 和 MVVM 的项目。

WinForms 的优势是简单、成熟、稳定、资料多、学习成本低。它的劣势也很明确：UI 定制能力不如 WPF，布局适配能力不如现代声明式框架，控件外观更接近传统 Windows 桌面风格，过度依赖设计器和事件处理器时容易形成“窗体巨类”。

学习 WinForms 的重点不是背每个控件属性，而是建立桌面应用的工程意识：窗体生命周期、控件层级、消息循环、UI 线程、事件订阅、数据绑定、表格性能、异常处理、配置部署、高 DPI 适配和长期维护。很多 WinForms 项目不是毁在框架能力不足，而是毁在把所有业务逻辑都写进按钮 Click 事件里。

## 2. WinForms 与 WPF、WinUI、MAUI、Avalonia 的关系

### 2.1 WinForms 与 WPF

WinForms 和 WPF 都是 Windows 桌面 UI 框架，但设计哲学不同。

WinForms 更接近传统控件编程。按钮就是按钮，文本框就是文本框，控件封装了外观和行为。你通常通过属性、事件和少量继承来实现功能。开发体验直接，设计器成熟，特别适合传统表单和数据录入界面。

WPF 则强调 XAML、数据绑定、依赖属性、路由事件、样式、模板、视觉树。它更适合复杂 UI、主题换肤、动画、矢量图形和 MVVM。

简化对比：

| 维度 | WinForms | WPF |
| --- | --- | --- |
| UI 定义 | 设计器生成代码为主，也可手写 | XAML + 代码 |
| 开发模型 | 控件属性 + 事件 | 绑定 + 命令 + 模板 |
| 学习成本 | 较低 | 中高 |
| 外观定制 | 有限，依赖 owner draw 或自定义控件 | 很强 |
| 数据绑定 | 可用，传统项目偏简单 | 核心能力 |
| 高 DPI | 需要认真配置和测试 | 通常更自然，但也要测试 |
| 适合场景 | 企业表单、工具、数据录入 | 复杂桌面、定制 UI、MVVM |

如果是新项目且 UI 定制要求高，可以评估 WPF；如果项目以传统表格、表单、工具为主，WinForms 仍然很务实。

### 2.2 WinForms 与 WinUI

WinUI 是微软较新的 Windows UI 技术方向，和 Windows App SDK 关联更紧密，更贴近现代 Fluent 控件体系。WinForms 则是成熟传统桌面框架。WinUI 的现代感更强，但在企业存量、第三方控件、开发经验、问题资料方面，WinForms 仍有很大优势。

选择时不要只看“新旧”。要看目标系统、控件需求、团队经验、部署环境、上线周期、维护年限和已有资产。很多企业应用追求的是稳定、可维护、快速交付，而不是最新 UI 技术。

### 2.3 WinForms 与 MAUI、Avalonia

.NET MAUI 面向跨平台应用，覆盖移动端和桌面端。Avalonia 是受 WPF 启发的跨平台 UI 框架。它们解决的是跨平台问题，而 WinForms 解决的是 Windows 桌面快速开发问题。

如果应用只面向 Windows，且大量依赖 Windows 本地能力，WinForms 直接有效。如果未来要同时支持 Linux、macOS，WinForms 就不是合适选择。

### 2.4 现代 .NET WinForms 与 .NET Framework WinForms

现在有两类常见 WinForms 项目：

- Windows Forms App：基于现代 .NET，例如 .NET 8、.NET 9、.NET 10。
- Windows Forms App (.NET Framework)：基于 .NET Framework 4.x。

现代 .NET WinForms 优点：

- 可使用新 C# 语言特性。
- 性能、运行时、发布方式更现代。
- WinForms 开源，持续维护。
- 支持 SDK 风格项目文件。
- 更适合新项目和长期演进。

.NET Framework WinForms 优点：

- 老项目兼容性好。
- 某些旧第三方控件、COM、企业组件只支持 .NET Framework。
- 在存量 Windows 环境中部署经验丰富。

新项目一般优先现代 .NET；老系统维护则根据依赖和迁移成本决定，不要为了“升级”破坏稳定业务。

## 3. 开发环境、项目结构与启动流程

### 3.1 创建现代 .NET WinForms 项目

典型 SDK 风格 csproj：

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net10.0-windows</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <UseWindowsForms>true</UseWindowsForms>
  </PropertyGroup>
</Project>
```

如果使用 .NET 8 LTS：

```xml
<TargetFramework>net8.0-windows</TargetFramework>
```

说明：

- `WinExe` 表示 Windows 图形程序，不显示控制台。
- `netX.0-windows` 表示目标平台是 Windows。
- `UseWindowsForms` 启用 WinForms 构建支持。
- `Nullable` 建议开启，减少空引用错误。

WinForms 是 Windows-only 框架，不能把目标框架写成普通 `net8.0` 后期待跨平台运行。

### 3.2 Program.cs 启动流程

现代 WinForms 项目常见入口：

```csharp
internal static class Program
{
    [STAThread]
    private static void Main()
    {
        ApplicationConfiguration.Initialize();
        Application.Run(new MainForm());
    }
}
```

`[STAThread]` 非常重要。WinForms 依赖 Windows UI、COM、剪贴板、拖放等很多单线程单元模型能力。没有它，某些功能会出现异常或行为不稳定。

`ApplicationConfiguration.Initialize()` 是现代 .NET WinForms 模板引入的配置入口，用于初始化高 DPI、默认字体、视觉样式等应用级设置。旧项目中常见写法是：

```csharp
Application.EnableVisualStyles();
Application.SetCompatibleTextRenderingDefault(false);
Application.Run(new MainForm());
```

现代项目一般保留模板默认写法。

### 3.3 Application.Run 做了什么

`Application.Run(new MainForm())` 会创建主消息循环，并显示主窗体。当主窗体关闭后，消息循环退出，应用结束。

WinForms 应用的核心是 Windows 消息循环。鼠标点击、键盘输入、窗口绘制、定时器、控件重绘，本质上都通过消息机制进入 UI 线程。你写的 Button Click 事件，背后是 Windows 消息被 WinForms 分发成 .NET 事件。

这解释了一个关键规则：不要阻塞 UI 线程。UI 线程一旦被耗时任务占住，消息循环无法继续处理，窗口就会卡死、无响应、无法重绘。

### 3.4 常见目录结构

中小型 WinForms 项目可以这样组织：

```text
MyWinFormsApp/
  Program.cs
  App.config 或 appsettings.json
  Forms/
    MainForm.cs
    MainForm.Designer.cs
    MainForm.resx
    LoginForm.cs
    SettingsForm.cs
  Controls/
    SearchBox.cs
    StatusBadge.cs
    PagedGridView.cs
  Models/
    Order.cs
    Customer.cs
  Services/
    IOrderService.cs
    OrderService.cs
    IConfigService.cs
    ConfigService.cs
  Repositories/
    OrderRepository.cs
  Presenters/
    MainPresenter.cs
    OrderPresenter.cs
  Resources/
    Icons/
    Images/
  Utils/
    UiThread.cs
    ExceptionHandler.cs
```

WinForms 没有强制架构。小工具可以简单些；长期维护的企业系统要分层。最重要的是不要把数据库访问、HTTP 调用、业务计算、文件处理都写进 Form 类。

### 3.5 Form 文件三件套

一个窗体通常包括：

- `MainForm.cs`：你的业务交互代码。
- `MainForm.Designer.cs`：设计器生成的控件创建、属性设置和事件连接代码。
- `MainForm.resx`：窗体资源，例如图片、图标、本地化文本等。

不要手动大改 `Designer.cs`。它是设计器维护的文件，手工修改容易被覆盖或破坏设计器加载。你可以阅读它来理解控件如何创建，但主要代码应写在 `MainForm.cs` 或独立类中。

## 4. Form、Control 与事件驱动模型

### 4.1 Form 是什么

`Form` 是 WinForms 中的窗口。它继承自 `ContainerControl`，最终继承自 `Control`。窗体本身也是控件，只是它有窗口句柄、边框、标题栏、最大化最小化、任务栏等顶层窗口能力。

常见属性：

- `Text`：标题栏文本。
- `Size` / `Width` / `Height`：尺寸。
- `StartPosition`：启动位置。
- `FormBorderStyle`：边框样式。
- `MaximizeBox` / `MinimizeBox`：最大化和最小化按钮。
- `Icon`：窗口图标。
- `AcceptButton`：按 Enter 触发的按钮。
- `CancelButton`：按 Esc 触发的按钮。
- `DialogResult`：模态对话框返回值。

### 4.2 Control 是控件基类

WinForms 大多数 UI 元素都继承自 `Control`。重要属性：

- `Name`：控件名称，用于代码引用。
- `Text`：显示文本。
- `Location`：左上角坐标。
- `Size`：尺寸。
- `Enabled`：是否可用。
- `Visible`：是否可见。
- `BackColor` / `ForeColor`：背景色和前景色。
- `Font`：字体。
- `Parent`：父控件。
- `Controls`：子控件集合。
- `Anchor` / `Dock`：布局适配。
- `TabIndex` / `TabStop`：键盘 Tab 顺序。

控件有窗口句柄，但句柄可能延迟创建，也可能在某些情况下重建。不要过早依赖 `Handle`，除非你明确知道生命周期。

### 4.3 事件驱动

最常见代码：

```csharp
private void saveButton_Click(object sender, EventArgs e)
{
    Save();
}
```

事件处理器本质是委托订阅：

```csharp
saveButton.Click += saveButton_Click;
```

设计器会在 `InitializeComponent()` 中帮你写这类订阅。事件驱动模型简单，但也容易让代码分散。一个按钮一个事件，十几个控件就几十个事件，逻辑很快变成“满屏 Click、Changed、SelectedIndexChanged”。

更好的做法是：

- 事件处理器只做参数读取、调用服务、更新界面。
- 复杂逻辑移到 Service、Presenter、Controller 或 ViewModel。
- 多个按钮复用同一个方法时，通过 `sender` 或 `Tag` 区分。
- 对长期订阅的事件，注意取消订阅，避免内存泄漏。

### 4.4 Form 生命周期

常见事件顺序大致包括：

- 构造函数
- `Load`
- `Shown`
- `Activated`
- 用户交互
- `FormClosing`
- `FormClosed`
- `Disposed`

区别：

- 构造函数：创建对象，调用 `InitializeComponent()`，适合初始化字段和控件基本状态。
- `Load`：窗体加载，控件句柄基本可用，适合初始化数据。
- `Shown`：窗体首次显示后触发，适合启动较慢的异步加载，避免首屏白屏。
- `FormClosing`：关闭前，可取消关闭，例如提示保存。
- `FormClosed`：关闭后，不能取消。
- `Dispose`：释放资源。

示例：

```csharp
private async void MainForm_Shown(object sender, EventArgs e)
{
    await LoadDataAsync();
}

private void MainForm_FormClosing(object sender, FormClosingEventArgs e)
{
    if (_hasUnsavedChanges)
    {
        var result = MessageBox.Show(
            "有未保存的修改，确定关闭吗？",
            "确认",
            MessageBoxButtons.YesNo,
            MessageBoxIcon.Warning);

        e.Cancel = result != DialogResult.Yes;
    }
}
```

不要在构造函数里做数据库查询、网络请求或大文件读取。构造函数慢会导致窗体迟迟不显示，也让错误处理更困难。

## 5. 设计器、Designer.cs 与代码组织

### 5.1 设计器生成代码的本质

在设计器里拖一个 Button，本质是在 `InitializeComponent()` 中生成：

```csharp
this.saveButton = new Button();
this.saveButton.Location = new Point(20, 20);
this.saveButton.Name = "saveButton";
this.saveButton.Size = new Size(100, 32);
this.saveButton.Text = "保存";
this.saveButton.Click += this.saveButton_Click;
this.Controls.Add(this.saveButton);
```

理解这一点很重要。设计器不是魔法，它只是帮你写控件创建代码。你完全可以手写 UI，但大部分传统 WinForms 项目使用设计器效率更高。

### 5.2 不要滥改 Designer.cs

手动修改 Designer.cs 的风险：

- 设计器重新保存时覆盖修改。
- 设计器无法打开窗体。
- 控件字段和资源不一致。
- 事件重复订阅。
- 初始化顺序被破坏。

如果确实需要动态 UI，应在窗体自己的 `.cs` 文件中写方法：

```csharp
private void BuildDynamicFilters()
{
    filterPanel.Controls.Clear();

    foreach (var field in _filterFields)
    {
        var textBox = new TextBox
        {
            Name = $"filter_{field.Name}",
            Width = 180,
            Tag = field
        };

        filterPanel.Controls.Add(textBox);
    }
}
```

### 5.3 partial class 的作用

窗体类通常是 partial：

```csharp
public partial class MainForm : Form
{
    public MainForm()
    {
        InitializeComponent();
    }
}
```

`MainForm.cs` 和 `MainForm.Designer.cs` 编译后合成同一个类。这样设计器代码和你的代码可以分文件管理。

### 5.4 控件命名规范

建议使用语义名称：

- `saveButton`
- `cancelButton`
- `orderGridView`
- `customerNameTextBox`
- `statusComboBox`
- `mainMenuStrip`
- `statusLabel`

不要保留 `button1`、`textBox3`、`dataGridView2`。短期看省事，长期维护时几乎不可读。

### 5.5 事件处理器命名

常见命名：

```csharp
private void saveButton_Click(object sender, EventArgs e)
private void orderGridView_SelectionChanged(object sender, EventArgs e)
private void MainForm_Load(object sender, EventArgs e)
```

如果处理器表达的是业务动作，也可以命名为：

```csharp
private void OnSaveButtonClick(object sender, EventArgs e)
private void OnOrderSelectionChanged(object sender, EventArgs e)
```

关键是统一，不要同一项目混乱使用。

## 6. 常用控件精讲

### 6.1 Label

`Label` 用于显示静态文本。常用属性：

- `Text`
- `AutoSize`
- `TextAlign`
- `ForeColor`
- `Font`

对于大量只读文本，`Label` 简单可靠。注意 `AutoSize=true` 时，文本变长会改变控件尺寸；固定布局中要测试多语言和高 DPI。

### 6.2 TextBox

`TextBox` 是基础输入控件。

常用属性：

- `Text`
- `ReadOnly`
- `Multiline`
- `MaxLength`
- `PasswordChar`
- `UseSystemPasswordChar`
- `ScrollBars`
- `CharacterCasing`

示例：

```csharp
userNameTextBox.MaxLength = 50;
passwordTextBox.UseSystemPasswordChar = true;
remarkTextBox.Multiline = true;
remarkTextBox.ScrollBars = ScrollBars.Vertical;
```

输入验证不要只依赖 KeyPress。用户可以粘贴文本，也可能通过输入法输入。更可靠的方式是在提交时做完整验证，在 `TextChanged` 中做即时提示。

### 6.3 Button

`Button` 触发命令式动作。常见实践：

```csharp
private async void saveButton_Click(object sender, EventArgs e)
{
    saveButton.Enabled = false;
    try
    {
        await SaveAsync();
    }
    finally
    {
        saveButton.Enabled = true;
    }
}
```

避免重复点击是按钮事件里最常见的工程问题。异步保存、导入、导出、打印、上传等操作，都应该在执行中禁用按钮或做状态锁。

### 6.4 CheckBox 与 RadioButton

`CheckBox` 表示独立布尔选项；`RadioButton` 表示一组选一。RadioButton 的分组由父容器决定，把不同组选项放到不同 Panel 或 GroupBox 中。

```csharp
if (enableProxyCheckBox.Checked)
{
    proxyHostTextBox.Enabled = true;
}
```

不要用多个 CheckBox 模拟单选，除非业务允许多选。

### 6.5 ComboBox

`ComboBox` 用于下拉选择。常用绑定：

```csharp
statusComboBox.DataSource = statuses;
statusComboBox.DisplayMember = "Name";
statusComboBox.ValueMember = "Code";
```

读取：

```csharp
var code = statusComboBox.SelectedValue?.ToString();
```

注意绑定对象列表后，`SelectedItem` 是对象，`SelectedValue` 是 `ValueMember` 的值。不要把显示文本当业务值保存。

### 6.6 ListBox 与 CheckedListBox

`ListBox` 展示列表，支持单选或多选。`CheckedListBox` 支持勾选项。

```csharp
roleListBox.DataSource = roles;
roleListBox.DisplayMember = "Name";
roleListBox.ValueMember = "Id";
```

多选时使用：

```csharp
foreach (var item in roleListBox.SelectedItems)
{
    // 处理选中项
}
```

大量数据不适合直接塞进 ListBox，搜索和分页更重要。

### 6.7 DateTimePicker 与 MonthCalendar

`DateTimePicker` 常用于日期输入：

```csharp
startDatePicker.Format = DateTimePickerFormat.Custom;
startDatePicker.CustomFormat = "yyyy-MM-dd";
```

如果需要允许空日期，DateTimePicker 原生不直接支持 null。常见做法：

- 增加一个 CheckBox 表示是否启用日期。
- 自定义控件封装 nullable 日期。
- 使用第三方控件。

### 6.8 NumericUpDown

`NumericUpDown` 比 TextBox 更适合数字输入：

```csharp
quantityNumeric.Minimum = 0;
quantityNumeric.Maximum = 9999;
quantityNumeric.DecimalPlaces = 2;
quantityNumeric.Increment = 0.5M;
```

它能减少非法输入，但业务范围仍要在提交时验证。

### 6.9 PictureBox

`PictureBox` 显示图片。常用 `SizeMode`：

- `Normal`
- `StretchImage`
- `AutoSize`
- `CenterImage`
- `Zoom`

加载图片时要注意文件占用：

```csharp
using var stream = File.OpenRead(path);
pictureBox.Image = Image.FromStream(stream);
```

但 `Image.FromStream` 可能仍依赖流生命周期。更稳妥的方式是复制位图：

```csharp
using var image = Image.FromFile(path);
pictureBox.Image = new Bitmap(image);
```

替换图片前释放旧图：

```csharp
var old = pictureBox.Image;
pictureBox.Image = newImage;
old?.Dispose();
```

### 6.10 TabControl

`TabControl` 用于多页设置、详情页分区。不要把整个系统都堆成几十个 Tab。Tab 太多会降低可用性，也让窗体类膨胀。

可按需加载页内容：

```csharp
private void mainTabControl_SelectedIndexChanged(object sender, EventArgs e)
{
    if (mainTabControl.SelectedTab == ordersTabPage && !_ordersLoaded)
    {
        LoadOrders();
        _ordersLoaded = true;
    }
}
```

### 6.11 GroupBox 与 Panel

`GroupBox` 用于分组并显示边框标题；`Panel` 用于容器布局；`FlowLayoutPanel` 和 `TableLayoutPanel` 提供更高级布局。RadioButton 分组通常用 GroupBox 或 Panel。

### 6.12 ErrorProvider

`ErrorProvider` 是 WinForms 表单验证常用组件：

```csharp
if (string.IsNullOrWhiteSpace(nameTextBox.Text))
{
    errorProvider.SetError(nameTextBox, "姓名不能为空");
}
else
{
    errorProvider.SetError(nameTextBox, string.Empty);
}
```

它会在控件旁显示错误图标，并可显示提示。适合传统表单，不要只用 MessageBox 一次性弹出所有错误。

## 7. 布局系统：坐标、Anchor、Dock、Panel、TableLayoutPanel

### 7.1 绝对坐标布局

WinForms 默认使用坐标和尺寸：

```csharp
button.Location = new Point(20, 20);
button.Size = new Size(100, 32);
```

这种方式直观，但窗口尺寸变化、高 DPI、字体变化、多语言文本都会带来问题。传统小工具可以接受固定尺寸，企业应用应尽量配合 Anchor、Dock、TableLayoutPanel、FlowLayoutPanel 做自适应。

### 7.2 Anchor

`Anchor` 表示控件相对父容器的哪些边保持距离。

例如按钮固定在右下角：

```csharp
saveButton.Anchor = AnchorStyles.Right | AnchorStyles.Bottom;
```

文本框随窗口宽度伸缩：

```csharp
searchTextBox.Anchor = AnchorStyles.Left | AnchorStyles.Top | AnchorStyles.Right;
```

Anchor 适合简单自适应布局，但复杂页面只靠 Anchor 会很难维护。

### 7.3 Dock

`Dock` 表示控件停靠到父容器边缘：

```csharp
toolStrip.Dock = DockStyle.Top;
statusStrip.Dock = DockStyle.Bottom;
navigationPanel.Dock = DockStyle.Left;
contentPanel.Dock = DockStyle.Fill;
```

`DockStyle.Fill` 常用于主体区域。控件添加顺序会影响 Dock 布局，尤其是多个 Fill、Left、Top 混合时。设计器里可通过“置于顶层/底层”调整顺序。

### 7.4 FlowLayoutPanel

`FlowLayoutPanel` 按流式布局排列子控件，可横向或纵向，空间不足换行。适合按钮组、标签、过滤条件。

```csharp
filterFlowPanel.FlowDirection = FlowDirection.LeftToRight;
filterFlowPanel.WrapContents = true;
filterFlowPanel.AutoScroll = true;
```

注意子控件过多时性能可能下降，尤其是频繁 Clear/Add 的场景。批量更新时可以 `SuspendLayout()` / `ResumeLayout()`。

### 7.5 TableLayoutPanel

`TableLayoutPanel` 是 WinForms 中最重要的自适应布局容器之一。它按行列布局，支持百分比、绝对值和自动尺寸。

典型表单：

```csharp
tableLayoutPanel.ColumnCount = 2;
tableLayoutPanel.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 100));
tableLayoutPanel.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
```

它适合：

- 表单标签 + 输入框。
- 多行多列配置页面。
- 高 DPI 和多语言适配。
- 比绝对坐标更稳定的传统布局。

缺点是控件很多时布局计算成本较高，过度嵌套会卡。复杂窗体要控制嵌套层级。

### 7.6 SplitContainer

`SplitContainer` 提供可拖动分割区域，常用于左侧树、右侧详情：

```csharp
splitContainer.Dock = DockStyle.Fill;
splitContainer.SplitterDistance = 260;
```

注意保存用户调整后的分割距离，下次启动恢复：

```csharp
Properties.Settings.Default.MainSplitterDistance = splitContainer.SplitterDistance;
Properties.Settings.Default.Save();
```

### 7.7 SuspendLayout 与 ResumeLayout

动态添加大量控件时，应暂停布局：

```csharp
panel.SuspendLayout();
try
{
    panel.Controls.Clear();
    foreach (var item in items)
    {
        panel.Controls.Add(CreateItemControl(item));
    }
}
finally
{
    panel.ResumeLayout();
}
```

否则每添加一个控件都可能触发布局，性能很差。

## 8. 菜单、工具栏、状态栏、托盘与对话框

### 8.1 MenuStrip

`MenuStrip` 用于主菜单：

```csharp
private void exitToolStripMenuItem_Click(object sender, EventArgs e)
{
    Close();
}
```

菜单项适合绑定快捷键：

```csharp
saveToolStripMenuItem.ShortcutKeys = Keys.Control | Keys.S;
```

菜单命令最好复用同一业务方法：

```csharp
private void saveButton_Click(object sender, EventArgs e) => Save();
private void saveToolStripMenuItem_Click(object sender, EventArgs e) => Save();
```

不要让菜单和按钮分别实现两套保存逻辑。

### 8.2 ToolStrip

`ToolStrip` 用于工具栏，可放按钮、下拉按钮、分隔符、文本框等。

实践建议：

- 工具栏按钮加图标和 ToolTip。
- 常用命令放工具栏，不常用命令放菜单。
- 按钮 Enabled 状态要和当前选择、权限、业务状态同步。

### 8.3 StatusStrip

`StatusStrip` 用于底部状态栏：

```csharp
statusLabel.Text = "就绪";
userStatusLabel.Text = $"当前用户：{userName}";
progressBar.Visible = isBusy;
```

状态栏适合显示当前状态、连接状态、后台任务进度，不适合放过多操作按钮。

### 8.4 NotifyIcon 托盘

托盘图标：

```csharp
notifyIcon.Icon = Icon;
notifyIcon.Text = "我的应用";
notifyIcon.Visible = true;
notifyIcon.DoubleClick += (_, _) => ShowMainWindow();
```

退出时必须隐藏并释放：

```csharp
notifyIcon.Visible = false;
notifyIcon.Dispose();
```

否则可能出现程序退出后托盘残影，直到鼠标经过才消失。

### 8.5 常用对话框

WinForms 提供很多标准对话框：

- `OpenFileDialog`
- `SaveFileDialog`
- `FolderBrowserDialog`
- `ColorDialog`
- `FontDialog`
- `PrintDialog`

示例：

```csharp
using var dialog = new OpenFileDialog
{
    Filter = "Excel 文件|*.xlsx;*.xls|所有文件|*.*",
    Multiselect = false
};

if (dialog.ShowDialog(this) == DialogResult.OK)
{
    filePathTextBox.Text = dialog.FileName;
}
```

注意传入 owner：`ShowDialog(this)`。这样对话框会正确依附当前窗口。

### 8.6 MessageBox

```csharp
var result = MessageBox.Show(
    this,
    "确定删除选中的订单吗？",
    "确认删除",
    MessageBoxButtons.YesNo,
    MessageBoxIcon.Warning);

if (result == DialogResult.Yes)
{
    DeleteSelectedOrder();
}
```

不要滥用 MessageBox。频繁弹窗会打断用户流程。状态提示、错误列表、表单内提示有时更合适。

## 9. 数据绑定：BindingSource、BindingList、DataGridView

### 9.1 WinForms 数据绑定基础

WinForms 支持数据绑定，但不像 WPF 那样是框架的中心思想。常见绑定目标：

- TextBox.Text
- ComboBox.DataSource
- Label.Text
- CheckBox.Checked
- DataGridView.DataSource

简单绑定：

```csharp
nameTextBox.DataBindings.Add(
    "Text",
    customer,
    nameof(Customer.Name),
    true,
    DataSourceUpdateMode.OnPropertyChanged);
```

参数含义：

- 控件属性：`Text`
- 数据源对象：`customer`
- 数据源属性：`Name`
- 是否启用格式化：`true`
- 更新源时机：`OnPropertyChanged`

### 9.2 INotifyPropertyChanged

如果对象属性变化后要自动更新 UI，实现 `INotifyPropertyChanged`：

```csharp
public sealed class Customer : INotifyPropertyChanged
{
    private string _name = string.Empty;

    public string Name
    {
        get => _name;
        set
        {
            if (_name == value)
            {
                return;
            }

            _name = value;
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Name)));
        }
    }

    public event PropertyChangedEventHandler? PropertyChanged;
}
```

WinForms 绑定可以监听这个接口，使控件刷新。

### 9.3 BindingSource 的价值

`BindingSource` 是 WinForms 数据绑定中非常重要的中间层。它可以包装对象、集合、DataTable，并提供当前项、排序、过滤、导航、增删等能力。

```csharp
private readonly BindingSource _ordersBindingSource = new();

private void LoadOrders()
{
    var orders = _orderService.GetOrders();
    _ordersBindingSource.DataSource = orders;
    ordersDataGridView.DataSource = _ordersBindingSource;
}
```

获取当前项：

```csharp
if (_ordersBindingSource.Current is Order selected)
{
    OpenOrder(selected.Id);
}
```

BindingSource 让界面控件不直接依赖具体集合，后续排序、过滤、定位当前项更方便。

### 9.4 BindingList

`List<T>` 不会通知 UI 集合增删变化。WinForms 中常用 `BindingList<T>`：

```csharp
private readonly BindingList<Order> _orders = new();

ordersBindingSource.DataSource = _orders;
```

添加：

```csharp
_orders.Add(new Order { Number = "SO-001" });
```

DataGridView 会更新。注意 `BindingList<T>` 默认不支持复杂排序和过滤，复杂场景可以自定义 BindingList、使用 BindingSource + DataView，或使用第三方组件。

### 9.5 ComboBox 绑定

```csharp
statusComboBox.DataSource = statusList;
statusComboBox.DisplayMember = nameof(StatusItem.Name);
statusComboBox.ValueMember = nameof(StatusItem.Code);
statusComboBox.DataBindings.Add(
    "SelectedValue",
    order,
    nameof(Order.StatusCode),
    true,
    DataSourceUpdateMode.OnPropertyChanged);
```

绑定顺序很重要。通常先设置 DataSource、DisplayMember、ValueMember，再设置 SelectedValue 绑定。

### 9.6 数据验证

可以利用 `Validating` 事件：

```csharp
private void nameTextBox_Validating(object sender, CancelEventArgs e)
{
    if (string.IsNullOrWhiteSpace(nameTextBox.Text))
    {
        e.Cancel = true;
        errorProvider.SetError(nameTextBox, "名称不能为空");
    }
    else
    {
        errorProvider.SetError(nameTextBox, string.Empty);
    }
}
```

`e.Cancel=true` 会阻止焦点离开控件。使用时要谨慎，过强的焦点拦截会让用户体验很差。提交时统一验证通常更友好。

## 10. DataGridView 企业级用法

### 10.1 基本绑定

```csharp
ordersGridView.AutoGenerateColumns = false;
ordersGridView.DataSource = _ordersBindingSource;
```

手动定义列：

```csharp
ordersGridView.Columns.Add(new DataGridViewTextBoxColumn
{
    DataPropertyName = nameof(Order.Number),
    HeaderText = "订单号",
    Width = 120,
    ReadOnly = true
});

ordersGridView.Columns.Add(new DataGridViewTextBoxColumn
{
    DataPropertyName = nameof(Order.CustomerName),
    HeaderText = "客户",
    AutoSizeMode = DataGridViewAutoSizeColumnMode.Fill
});
```

生产项目建议关闭 `AutoGenerateColumns`，显式定义列。否则列顺序、标题、格式、隐藏字段、只读状态都不可控。

### 10.2 常用属性

```csharp
ordersGridView.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
ordersGridView.MultiSelect = false;
ordersGridView.AllowUserToAddRows = false;
ordersGridView.AllowUserToDeleteRows = false;
ordersGridView.ReadOnly = true;
ordersGridView.RowHeadersVisible = false;
ordersGridView.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.None;
```

实践建议：

- 查询列表通常 `ReadOnly=true`。
- 编辑表格再开启单元格编辑。
- 关闭用户新增空白行，避免最后一行带来的业务误判。
- 明确选择模式和多选策略。

### 10.3 格式化显示

```csharp
amountColumn.DefaultCellStyle.Format = "N2";
amountColumn.DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleRight;
```

使用 `CellFormatting`：

```csharp
private void ordersGridView_CellFormatting(object sender, DataGridViewCellFormattingEventArgs e)
{
    if (ordersGridView.Columns[e.ColumnIndex].Name == "StatusColumn")
    {
        e.Value = e.Value?.ToString() switch
        {
            "Pending" => "待处理",
            "Paid" => "已付款",
            "Cancelled" => "已取消",
            _ => e.Value
        };
        e.FormattingApplied = true;
    }
}
```

不要在 `CellFormatting` 中做数据库查询、网络请求或复杂计算。这个事件会频繁触发。

### 10.4 单元格按钮和操作列

```csharp
var buttonColumn = new DataGridViewButtonColumn
{
    Name = "EditColumn",
    HeaderText = "操作",
    Text = "编辑",
    UseColumnTextForButtonValue = true,
    Width = 80
};

ordersGridView.Columns.Add(buttonColumn);
```

点击处理：

```csharp
private void ordersGridView_CellContentClick(object sender, DataGridViewCellEventArgs e)
{
    if (e.RowIndex < 0)
    {
        return;
    }

    if (ordersGridView.Columns[e.ColumnIndex].Name == "EditColumn")
    {
        var order = (Order)_ordersBindingSource[e.RowIndex];
        EditOrder(order.Id);
    }
}
```

注意 `RowIndex < 0` 表示表头，不判断会导致异常。

### 10.5 排序、过滤与分页

小数据量可以内存过滤：

```csharp
var filtered = _allOrders
    .Where(o => o.CustomerName.Contains(keyword, StringComparison.OrdinalIgnoreCase))
    .ToList();

_ordersBindingSource.DataSource = new BindingList<Order>(filtered);
```

大数据量应服务端分页：

```csharp
var page = await _orderService.SearchAsync(keyword, pageIndex, pageSize);
_ordersBindingSource.DataSource = new BindingList<Order>(page.Items);
```

不要一次加载几十万行到 DataGridView。即使能显示，排序、筛选、格式化、内存和滚动都会出问题。

### 10.6 虚拟模式

DataGridView 支持 `VirtualMode`，适合超大数据或自定义数据源：

```csharp
ordersGridView.VirtualMode = true;
ordersGridView.RowCount = _orders.Count;
ordersGridView.CellValueNeeded += OrdersGridView_CellValueNeeded;
```

```csharp
private void OrdersGridView_CellValueNeeded(object? sender, DataGridViewCellValueEventArgs e)
{
    var order = _orders[e.RowIndex];
    e.Value = e.ColumnIndex switch
    {
        0 => order.Number,
        1 => order.CustomerName,
        2 => order.Amount,
        _ => null
    };
}
```

虚拟模式要自己管理数据缓存、编辑提交、排序和选择，复杂度更高。除非确实有大数据需求，否则分页更简单。

### 10.7 DataGridView 性能建议

重点：

- 关闭不必要的自动列宽，尤其是 `AllCells`。
- 不要每个单元格创建复杂控件。
- 避免频繁设置 DataSource。
- 批量刷新时暂停布局。
- `CellFormatting` 保持轻量。
- 图片列要压缩和缓存。
- 大数据使用分页或虚拟模式。
- 不要在 UI 线程同步加载数据。

示例：

```csharp
ordersGridView.SuspendLayout();
try
{
    _ordersBindingSource.DataSource = new BindingList<Order>(orders);
}
finally
{
    ordersGridView.ResumeLayout();
}
```

## 11. 多窗体、导航、MDI 与应用生命周期

### 11.1 模态与非模态窗口

模态对话框：

```csharp
using var dialog = new SettingsForm();
if (dialog.ShowDialog(this) == DialogResult.OK)
{
    ReloadSettings();
}
```

非模态窗口：

```csharp
var form = new LogViewerForm();
form.Show(this);
```

模态窗口会阻塞当前窗口交互，但不会阻塞整个 UI 消息循环。适合设置、确认、编辑详情。非模态窗口适合日志查看、监控面板等可同时操作的窗口。

### 11.2 Owner 很重要

打开子窗口时传入 owner：

```csharp
dialog.ShowDialog(this);
```

好处：

- 子窗口居中于父窗口。
- 父子窗口层级正确。
- 父窗口最小化时行为更合理。
- 避免对话框跑到主窗口后面。

### 11.3 MDI

MDI 是传统多文档界面：

```csharp
IsMdiContainer = true;

var child = new OrderForm
{
    MdiParent = this
};
child.Show();
```

现代应用较少使用 MDI，更常见的是左侧导航 + 右侧内容区域，或 Tab 页面。维护老系统时会遇到 MDI，新项目要谨慎选择。

### 11.4 在 Panel 中切换 UserControl

这是 WinForms 中常见的页面导航方式：

```csharp
private void ShowPage(UserControl page)
{
    contentPanel.Controls.Clear();
    page.Dock = DockStyle.Fill;
    contentPanel.Controls.Add(page);
}
```

更完善的版本要处理旧页面 Dispose：

```csharp
private void ShowPage(UserControl page)
{
    foreach (Control control in contentPanel.Controls)
    {
        control.Dispose();
    }

    contentPanel.Controls.Clear();
    page.Dock = DockStyle.Fill;
    contentPanel.Controls.Add(page);
}
```

如果页面需要缓存，不要 Clear 后 Dispose，而是维护页面实例字典。缓存能提高切换速度，但会增加内存和状态管理复杂度。

### 11.5 单实例应用

使用 Mutex：

```csharp
using var mutex = new Mutex(true, "Company.Product.SingleInstance", out var created);
if (!created)
{
    MessageBox.Show("程序已经在运行。");
    return;
}

ApplicationConfiguration.Initialize();
Application.Run(new MainForm());
```

更高级需求是第二次启动时唤醒已有窗口并传递参数，可通过命名管道、Windows 消息或本地 IPC 实现。

## 12. 异步、后台任务与 UI 线程

### 12.1 UI 线程规则

WinForms 控件只能在创建它们的 UI 线程访问。后台线程直接改控件会出错：

```csharp
Task.Run(() =>
{
    statusLabel.Text = "完成"; // 错误
});
```

正确：

```csharp
Task.Run(() =>
{
    BeginInvoke(() =>
    {
        statusLabel.Text = "完成";
    });
});
```

现代 C# 中，更常用 async/await：

```csharp
private async void loadButton_Click(object sender, EventArgs e)
{
    loadButton.Enabled = false;
    try
    {
        var data = await _service.LoadAsync();
        ordersBindingSource.DataSource = data;
    }
    finally
    {
        loadButton.Enabled = true;
    }
}
```

`await` 默认会回到 UI 上下文，所以后续更新控件是安全的。

### 12.2 不要 Wait 和 Result

错误：

```csharp
var data = _service.LoadAsync().Result;
```

可能导致 UI 卡死甚至死锁。正确：

```csharp
var data = await _service.LoadAsync();
```

WinForms 事件处理器可以是 `async void`，但内部要捕获异常：

```csharp
private async void exportButton_Click(object sender, EventArgs e)
{
    try
    {
        await ExportAsync();
    }
    catch (Exception ex)
    {
        _logger.Error(ex);
        MessageBox.Show(this, ex.Message, "导出失败");
    }
}
```

### 12.3 Task.Run 的正确使用

CPU 密集任务可放到后台线程：

```csharp
var result = await Task.Run(() => HeavyCalculate(input));
```

I/O 密集任务应优先使用真正异步 API：

```csharp
var json = await httpClient.GetStringAsync(url);
```

不要把所有异步都包一层 Task.Run。数据库、HTTP、文件如果有异步 API，优先使用异步 API。

### 12.4 BackgroundWorker

老 WinForms 项目常见 `BackgroundWorker`：

```csharp
backgroundWorker.DoWork += (_, e) =>
{
    e.Result = LoadData();
};

backgroundWorker.RunWorkerCompleted += (_, e) =>
{
    if (e.Error != null)
    {
        MessageBox.Show(e.Error.Message);
        return;
    }

    ordersBindingSource.DataSource = e.Result;
};

backgroundWorker.RunWorkerAsync();
```

现代 C# 更推荐 async/await。维护老项目时可以理解 BackgroundWorker，但新代码无需优先使用它。

### 12.5 进度与取消

```csharp
private CancellationTokenSource? _cts;

private async void importButton_Click(object sender, EventArgs e)
{
    _cts = new CancellationTokenSource();
    var progress = new Progress<int>(value =>
    {
        progressBar.Value = value;
    });

    try
    {
        await _importService.ImportAsync(filePath, progress, _cts.Token);
    }
    catch (OperationCanceledException)
    {
        statusLabel.Text = "已取消";
    }
}

private void cancelButton_Click(object sender, EventArgs e)
{
    _cts?.Cancel();
}
```

`Progress<T>` 会把进度回调切回当前同步上下文，非常适合 WinForms。

## 13. 绘图、GDI+、自定义控件与双缓冲

### 13.1 Paint 事件

WinForms 使用 GDI+ 绘图：

```csharp
private void canvasPanel_Paint(object sender, PaintEventArgs e)
{
    var g = e.Graphics;
    g.SmoothingMode = SmoothingMode.AntiAlias;
    using var pen = new Pen(Color.RoyalBlue, 2);
    g.DrawLine(pen, 10, 10, 200, 100);
}
```

绘图应放在 Paint 或 OnPaint 中，而不是随便拿 `CreateGraphics()` 画。`CreateGraphics()` 画出的内容在重绘后会消失。

### 13.2 Invalidate 触发重绘

数据变化后：

```csharp
_points.Add(point);
canvasPanel.Invalidate();
```

`Invalidate()` 请求重绘，系统稍后触发 Paint。不要在循环中疯狂 Invalidate，可以合并刷新。

### 13.3 自定义控件

```csharp
public class StatusBadge : Control
{
    public Color BadgeColor { get; set; } = Color.SeaGreen;

    protected override void OnPaint(PaintEventArgs e)
    {
        base.OnPaint(e);

        using var brush = new SolidBrush(BadgeColor);
        e.Graphics.FillRectangle(brush, ClientRectangle);
        TextRenderer.DrawText(
            e.Graphics,
            Text,
            Font,
            ClientRectangle,
            ForeColor,
            TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter);
    }
}
```

属性变化时要 Invalidate：

```csharp
private Color _badgeColor = Color.SeaGreen;

public Color BadgeColor
{
    get => _badgeColor;
    set
    {
        if (_badgeColor == value)
        {
            return;
        }

        _badgeColor = value;
        Invalidate();
    }
}
```

### 13.4 双缓冲

自定义绘图闪烁时开启双缓冲：

```csharp
public DrawingPanel()
{
    DoubleBuffered = true;
    ResizeRedraw = true;
}
```

或者设置样式：

```csharp
SetStyle(
    ControlStyles.AllPaintingInWmPaint |
    ControlStyles.UserPaint |
    ControlStyles.OptimizedDoubleBuffer,
    true);
```

双缓冲可以减少闪烁，但不是性能万能解药。绘制本身太慢、对象创建过多、图片过大，仍然会卡。

### 13.5 GDI 对象释放

`Pen`、`Brush`、`Bitmap`、`Font` 等很多 GDI+ 对象需要 Dispose：

```csharp
using var brush = new SolidBrush(Color.Red);
e.Graphics.FillRectangle(brush, rect);
```

不要在 Paint 中频繁创建可缓存对象，尤其是复杂字体、图片和路径。可以缓存，但缓存对象也要在控件 Dispose 时释放。

## 14. 高 DPI、字体缩放与界面适配

### 14.1 为什么 WinForms 高 DPI 容易出问题

WinForms 诞生于传统桌面时代，很多项目习惯固定坐标和固定尺寸。现代显示器 DPI、系统缩放、字体、分辨率变化很大，如果应用没有正确配置，会出现：

- 控件重叠。
- 文本被截断。
- 按钮太小。
- 图片模糊。
- 窗体尺寸异常。
- 多显示器切换缩放不正确。

高 DPI 是 WinForms 项目必须认真测试的工程问题。

### 14.2 AutoScaleMode

常见设置：

```csharp
AutoScaleMode = AutoScaleMode.Font;
```

或：

```csharp
AutoScaleMode = AutoScaleMode.Dpi;
```

现代模板通常会生成合适配置。不要在项目中混乱使用不同 AutoScaleMode，否则窗体缩放结果可能不一致。

### 14.3 ApplicationConfiguration

现代 .NET WinForms 使用 `ApplicationConfiguration.Initialize()` 应用项目级配置。模板会根据项目设置生成初始化逻辑。关注点包括：

- 高 DPI 模式。
- 默认字体。
- 视觉样式。
- 文本渲染兼容性。

维护老项目迁移到现代 .NET 时，要比较旧入口和新入口差异。

### 14.4 布局建议

高 DPI 友好的布局：

- 少用绝对固定尺寸。
- 使用 TableLayoutPanel 组织表单。
- 输入框用 Anchor 横向拉伸。
- 底部按钮用 Anchor 固定右下。
- 文本控件预留空间。
- 图片准备多尺寸或使用矢量图标方案。
- 避免过深嵌套。
- 在 100%、125%、150%、200% 缩放下测试。

### 14.5 字体

字体变化会影响控件尺寸。不要假设一个中文标签永远只占固定宽度。多语言时英文、德文、俄文文本可能更长。表单标签可使用固定列宽，但要预留足够空间。

### 14.6 图片和图标

传统 16x16 图标在高 DPI 下会模糊。建议：

- 使用多尺寸 ico。
- 为工具栏准备 16、24、32 像素图标。
- 对关键图片使用高分辨率源。
- 不要强行 Stretch 小图到大尺寸。

## 15. 配置、资源、本地化与用户设置

### 15.1 App.config

.NET Framework 和部分现代项目可使用 App.config：

```xml
<configuration>
  <appSettings>
    <add key="ApiBaseUrl" value="https://example.com"/>
  </appSettings>
</configuration>
```

读取：

```csharp
var url = ConfigurationManager.AppSettings["ApiBaseUrl"];
```

现代 .NET 如果使用 `ConfigurationManager`，需要相应包；也可以使用 `Microsoft.Extensions.Configuration` 和 `appsettings.json`。

### 15.2 appsettings.json

```json
{
  "Api": {
    "BaseUrl": "https://example.com",
    "TimeoutSeconds": 30
  }
}
```

加载：

```csharp
var configuration = new ConfigurationBuilder()
    .SetBasePath(AppContext.BaseDirectory)
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .Build();
```

注意把 JSON 设置为复制到输出目录。

### 15.3 用户设置

WinForms 传统项目常用 `Properties.Settings.Default`：

```csharp
Properties.Settings.Default.WindowWidth = Width;
Properties.Settings.Default.WindowHeight = Height;
Properties.Settings.Default.Save();
```

适合保存用户偏好：

- 窗口位置和大小。
- 最近打开文件。
- 表格列宽。
- 主题。
- 连接地址。

不要把敏感密码明文保存到用户设置。需要保存凭据时，考虑 Windows Credential Manager、DPAPI 或企业认证方案。

### 15.4 资源文件

`.resx` 可保存字符串、图片、图标等资源。访问：

```csharp
var title = Properties.Resources.MainWindowTitle;
var icon = Properties.Resources.AppIcon;
```

图片资源用于控件：

```csharp
saveToolStripButton.Image = Properties.Resources.SaveIcon;
```

资源集中管理有利于本地化和维护。

### 15.5 本地化

WinForms 支持窗体本地化。设置 Form 的 `Localizable=true` 后，不同 Language 会生成不同 resx。适合传统设计器本地化。

本地化注意：

- 不要把所有文本写死在代码里。
- 文本长度变化会影响布局。
- 日期、金额、数字格式要考虑 CultureInfo。
- 右到左语言要额外测试。
- 错误提示和日志可以分层本地化。

## 16. 文件、数据库、日志与异常处理

### 16.1 文件操作

读取文件要处理异常：

```csharp
try
{
    var text = await File.ReadAllTextAsync(path);
    contentTextBox.Text = text;
}
catch (IOException ex)
{
    MessageBox.Show(this, ex.Message, "读取失败");
}
catch (UnauthorizedAccessException ex)
{
    MessageBox.Show(this, ex.Message, "权限不足");
}
```

不要假设文件一定存在、一定可读、一定不是被占用。

### 16.2 数据库访问

窗体事件里不要直接拼 SQL：

```csharp
private void searchButton_Click(object sender, EventArgs e)
{
    var orders = _orderService.Search(keywordTextBox.Text);
    ordersBindingSource.DataSource = orders;
}
```

SQL 和数据库连接放 Repository 或 Service 中，UI 层只负责调用和展示。

### 16.3 日志

桌面应用也需要日志。建议记录：

- 应用启动和退出。
- 版本号、运行时、操作系统。
- 未处理异常。
- 后端接口错误。
- 导入导出过程。
- 自动更新过程。
- 关键业务操作。

日志目录建议放：

```text
%LocalAppData%\Company\Product\Logs
```

不要写安装目录，普通用户可能没有写权限。

### 16.4 全局异常处理

```csharp
Application.ThreadException += (sender, e) =>
{
    LogException(e.Exception);
    MessageBox.Show(e.Exception.Message, "程序错误");
};

AppDomain.CurrentDomain.UnhandledException += (sender, e) =>
{
    if (e.ExceptionObject is Exception ex)
    {
        LogException(ex);
    }
};

TaskScheduler.UnobservedTaskException += (sender, e) =>
{
    LogException(e.Exception);
    e.SetObserved();
};
```

全局异常处理只能兜底。可预期的业务错误应在局部处理，例如保存失败、网络超时、权限不足、文件被占用。

### 16.5 用户友好错误

不要把完整堆栈直接弹给用户。用户需要知道：

- 发生了什么。
- 是否已保存。
- 能否重试。
- 下一步怎么办。
- 如需联系支持，错误编号是什么。

详细堆栈放日志中。

## 17. 部署、发布、安装包与自动更新

### 17.1 dotnet publish

现代 .NET WinForms 发布：

```powershell
dotnet publish -c Release -r win-x64 --self-contained false
```

自包含发布：

```powershell
dotnet publish -c Release -r win-x64 --self-contained true
```

区别：

- 依赖框架发布：包小，目标机器需安装 .NET Desktop Runtime。
- 自包含发布：包大，自带运行时，部署更稳定。

### 17.2 单文件发布

```xml
<PublishSingleFile>true</PublishSingleFile>
<SelfContained>true</SelfContained>
<RuntimeIdentifier>win-x64</RuntimeIdentifier>
```

单文件发布要测试：

- 配置文件路径。
- 本地数据库文件。
- 插件 DLL。
- 原生 DLL。
- 图片资源。
- 报表模板。
- 自动更新替换逻辑。

不要只测试主窗口能打开。

### 17.3 安装包选择

常见安装方案：

- ClickOnce：上手简单，适合内部应用快速发布和自动更新。
- MSIX：现代 Windows 包格式，权限和隔离更规范。
- WiX Toolset：传统 MSI，企业部署能力强。
- Inno Setup：轻量灵活，很多桌面软件使用。
- NSIS：脚本能力强。
- 自研更新器：灵活，但安全和稳定责任也更大。

选择要看企业环境、权限、离线安装、静默安装、自动更新、回滚、签名和 IT 管理要求。

### 17.4 自动更新

自动更新必须考虑：

- 当前程序运行中如何替换文件。
- 下载中断如何恢复。
- 更新包如何校验完整性。
- 更新包是否签名。
- 更新失败如何回滚。
- 配置文件是否兼容。
- 用户是否有安装目录写权限。
- 是否允许跳过版本。
- 强制更新如何提示。

不要下载一个 exe 后直接运行且不校验。这是严重安全风险。

### 17.5 版本号

版本可分为：

- 程序版本。
- 文件版本。
- 产品版本。
- 数据库 schema 版本。
- 协议版本。

在“关于”窗口、日志和错误上报中显示版本号，能极大提高排查效率。

## 18. 性能优化与内存泄漏排查

### 18.1 常见性能问题

WinForms 性能问题常见表现：

- 启动慢。
- 窗体打开慢。
- DataGridView 滚动卡。
- 点击按钮后界面无响应。
- 导入导出卡死。
- 内存持续增长。
- GDI 对象数量上涨。
- 高 DPI 下布局卡顿。

优化前先定位，不要盲目改代码。

### 18.2 UI 线程阻塞

最常见卡顿原因：

```csharp
private void searchButton_Click(object sender, EventArgs e)
{
    var data = _service.Search(); // 同步耗时
    grid.DataSource = data;
}
```

改为：

```csharp
private async void searchButton_Click(object sender, EventArgs e)
{
    searchButton.Enabled = false;
    try
    {
        var data = await _service.SearchAsync();
        grid.DataSource = data;
    }
    finally
    {
        searchButton.Enabled = true;
    }
}
```

### 18.3 批量更新控件

大量修改控件时：

```csharp
SuspendLayout();
try
{
    // 批量修改控件
}
finally
{
    ResumeLayout();
}
```

ListBox 可使用：

```csharp
listBox.BeginUpdate();
try
{
    listBox.Items.Clear();
    listBox.Items.AddRange(items);
}
finally
{
    listBox.EndUpdate();
}
```

DataGridView 也要避免逐行 Add 大量数据，优先绑定集合或分页。

### 18.4 内存泄漏来源

常见泄漏：

- 长生命周期服务事件引用窗体。
- 静态事件未取消订阅。
- Timer 未停止。
- PictureBox 旧 Image 未 Dispose。
- 自定义控件持有 GDI 对象未释放。
- 窗体关闭后仍在全局集合中。
- 后台任务持有窗体引用。
- 托盘 NotifyIcon 未 Dispose。

示例：

```csharp
protected override void Dispose(bool disposing)
{
    if (disposing)
    {
        _service.Changed -= OnServiceChanged;
        _timer?.Dispose();
        components?.Dispose();
    }

    base.Dispose(disposing);
}
```

### 18.5 GDI 对象泄漏

Windows 对 GDI 对象有限制。绘图程序如果不断创建 Pen、Brush、Bitmap 而不释放，会导致界面异常甚至崩溃。

排查：

- 任务管理器添加 GDI Objects 列。
- 观察 GDI 数量是否持续上涨。
- 检查 Paint 中的对象创建。
- 检查图片替换是否释放旧图。

### 18.6 DataGridView 慢

检查：

- 是否一次加载过多数据。
- 是否每个单元格格式化过重。
- 是否自动列宽计算所有单元格。
- 是否频繁重设 DataSource。
- 是否使用图片列且图片未压缩。
- 是否每行动态创建控件。
- 是否数据库查询在 UI 线程。

### 18.7 启动优化

策略：

- 首屏只加载必要数据。
- 延迟初始化不常用模块。
- 配置和缓存读取异步化。
- 网络检查放到后台。
- 日志初始化保持轻量。
- 大资源按需加载。
- 不在 Program.cs 做复杂业务。

## 19. 测试、架构分层与工程化实践

### 19.1 为什么 WinForms 也需要架构

很多 WinForms 项目失败于“窗体就是全部”。一个 MainForm 几千行，里面有 SQL、HTTP、文件、业务规则、权限、报表、导出、打印。短期能跑，长期不可维护。

更健康的分层：

- Form：控件展示、事件入口、用户交互。
- Presenter/Controller：协调界面和业务。
- Service：业务逻辑。
- Repository/Gateway：数据库或外部系统访问。
- Model/DTO：数据对象。

### 19.2 MVP 模式

WinForms 常用 MVP，而不是强行 MVVM。

View 接口：

```csharp
public interface IOrderView
{
    string Keyword { get; }
    void ShowOrders(IReadOnlyList<Order> orders);
    void ShowError(string message);
}
```

Presenter：

```csharp
public sealed class OrderPresenter
{
    private readonly IOrderView _view;
    private readonly IOrderService _service;

    public OrderPresenter(IOrderView view, IOrderService service)
    {
        _view = view;
        _service = service;
    }

    public async Task SearchAsync()
    {
        try
        {
            var orders = await _service.SearchAsync(_view.Keyword);
            _view.ShowOrders(orders);
        }
        catch (Exception ex)
        {
            _view.ShowError(ex.Message);
        }
    }
}
```

Form：

```csharp
public partial class OrderForm : Form, IOrderView
{
    private readonly OrderPresenter _presenter;

    public string Keyword => keywordTextBox.Text;

    public void ShowOrders(IReadOnlyList<Order> orders)
        => ordersBindingSource.DataSource = orders;

    public void ShowError(string message)
        => MessageBox.Show(this, message);
}
```

这样业务协调逻辑可以脱离 UI 测试。

### 19.3 单元测试

测试 Service 和 Presenter：

```csharp
[Fact]
public async Task SearchAsync_ShowsOrders()
{
    var view = new FakeOrderView { Keyword = "A001" };
    var service = new FakeOrderService();
    var presenter = new OrderPresenter(view, service);

    await presenter.SearchAsync();

    Assert.NotEmpty(view.Orders);
}
```

WinForms 控件本身不容易单元测试，所以要把可测试逻辑移出窗体。

### 19.4 UI 自动化测试

可使用 WinAppDriver、FlaUI、UI Automation 等。给控件设置稳定标识：

```csharp
saveButton.AccessibleName = "SaveButton";
```

或者使用控件 Name。自动化测试不要依赖控件坐标，因为 DPI 和布局变化会影响坐标。

### 19.5 依赖注入

现代 .NET WinForms 可以使用 DI：

```csharp
var services = new ServiceCollection();
services.AddSingleton<IOrderService, OrderService>();
services.AddTransient<MainForm>();

using var provider = services.BuildServiceProvider();
Application.Run(provider.GetRequiredService<MainForm>());
```

Form 构造函数：

```csharp
public MainForm(IOrderService orderService)
{
    InitializeComponent();
    _orderService = orderService;
}
```

注意窗体生命周期。需要反复打开的窗体不要注册成 Singleton。

### 19.6 代码规范

建议：

- 开启 Nullable。
- 控件命名清晰。
- 事件处理器保持短小。
- 异步事件捕获异常。
- 业务逻辑不写进 Designer。
- 数据库访问不写进 Form。
- 图片和 GDI 对象及时 Dispose。
- 所有全局事件订阅有取消路径。
- 绑定和 DataGridView 列定义集中管理。
- 发布包在干净机器测试。

## 20. 常见坑与排查清单

### 20.1 窗体卡死

检查：

- 是否 UI 线程同步查询数据库。
- 是否 `.Wait()` 或 `.Result`。
- 是否导入导出在 Click 中直接执行。
- 是否循环中频繁更新控件。
- 是否 DataGridView 一次加载过多数据。
- 是否 Paint 中做复杂计算。

### 20.2 跨线程异常

错误信息通常是“线程间操作无效”。检查：

- 后台线程是否直接访问控件。
- Task.Run 内是否设置 Label/TextBox/Grid。
- Timer 是否是非 UI Timer。
- 回调是否来自 Socket、串口、文件监控线程。

修复：

```csharp
if (InvokeRequired)
{
    BeginInvoke(() => UpdateUi());
    return;
}

UpdateUi();
```

### 20.3 设计器打不开

检查：

- 构造函数是否访问数据库、网络、配置。
- 构造函数是否依赖 DI 但设计器无法创建。
- Designer.cs 是否手动改坏。
- 资源文件是否缺失。
- 第三方控件是否缺许可证或依赖。
- InitializeComponent 前是否访问控件。

设计器友好代码：

```csharp
if (LicenseManager.UsageMode == LicenseUsageMode.Designtime)
{
    return;
}
```

### 20.4 控件重叠或文字截断

检查：

- 高 DPI 缩放。
- AutoScaleMode。
- 字体变化。
- 固定宽度太小。
- Anchor/Dock 设置错误。
- 多语言文本变长。
- TableLayoutPanel 行列样式不合理。

### 20.5 DataGridView 不显示数据

检查：

- DataSource 是否设置。
- AutoGenerateColumns 是否关闭但未定义列。
- DataPropertyName 是否拼错。
- 属性是否 public。
- BindingSource 是否绑定到正确集合。
- 集合是否为空。
- 是否在非 UI 线程设置 DataSource。

### 20.6 ComboBox SelectedValue 异常

检查：

- 是否先设置 ValueMember 再设置 DataSource。
- SelectedValue 类型是否和绑定属性类型一致。
- DataSource 是否包含当前值。
- 是否在绑定过程中触发 SelectedIndexChanged。
- 是否把 DisplayMember 当业务值使用。

### 20.7 内存持续上涨

检查：

- 窗体关闭后是否 Dispose。
- 子窗体是否仍被静态列表持有。
- 事件是否未退订。
- Timer 是否未停止。
- 图片是否未 Dispose。
- NotifyIcon 是否未 Dispose。
- 后台任务是否持有窗体引用。

### 20.8 托盘图标残留

退出前：

```csharp
notifyIcon.Visible = false;
notifyIcon.Dispose();
```

### 20.9 程序在客户机器不能运行

检查：

- 是否安装 .NET Desktop Runtime。
- 发布架构是否匹配 x86/x64。
- 是否缺少 VC++ 运行库或原生 DLL。
- 配置文件是否复制。
- 数据库驱动是否安装。
- 用户是否有目录权限。
- 杀毒软件是否拦截。
- 系统版本是否满足要求。

## 21. 学习路线与练手项目

### 21.1 学习顺序

建议路线：

1. 学会创建 WinForms 项目，理解 Program.cs 和 Application.Run。
2. 掌握 Form、Control、常用控件和事件。
3. 理解 Designer.cs 和 partial class。
4. 学会 Anchor、Dock、Panel、TableLayoutPanel。
5. 学会 MenuStrip、ToolStrip、StatusStrip、Dialog。
6. 学会 BindingSource、BindingList、ComboBox 绑定。
7. 深入 DataGridView：列、格式化、按钮列、分页。
8. 学会 async/await，避免 UI 卡死。
9. 学会 ErrorProvider、配置、资源、本地化。
10. 学会自定义控件和 GDI+ 绘图。
11. 学会高 DPI 适配和发布部署。
12. 学会分层、日志、异常处理、测试。

不要一开始就写复杂框架。先把一个窗体、一个表格、一个查询、一个编辑对话框、一个异步保存流程写扎实。

### 21.2 练手项目：库存管理客户端

功能设计：

- 登录窗口。
- 主窗口：左侧导航，右侧内容区域。
- 商品管理：查询、分页、DataGridView 展示。
- 商品编辑：新增、修改、验证、保存。
- 库存流水：日期筛选、导出 Excel。
- 系统设置：接口地址、主题、表格列宽保存。
- 状态栏：当前用户、连接状态、后台任务。
- 托盘：最小化到托盘。
- 日志：记录异常和关键操作。
- 发布：生成 win-x64 自包含安装包。

这个练手项目能覆盖 WinForms 的大多数核心能力，比只写 Hello World 有用得多。

### 21.3 面试级高频问题

1. WinForms 的核心模型是什么？
   - 窗体、控件、事件、消息循环。用户输入和系统消息被分发到控件，控件触发 .NET 事件，开发者在事件中处理逻辑。

2. 为什么 WinForms UI 线程不能阻塞？
   - UI 线程负责消息循环、输入、绘制和事件。阻塞后窗口无法响应和重绘，会显示无响应。

3. 如何从后台线程更新 UI？
   - 使用 `Control.Invoke`、`BeginInvoke`，或通过 async/await 回到 UI 上下文。

4. Anchor 和 Dock 有什么区别？
   - Anchor 保持控件到父容器边缘的距离；Dock 让控件停靠到父容器某个边或填充剩余空间。

5. DataGridView 绑定数据不刷新怎么办？
   - 使用 BindingSource 和 BindingList；对象属性变化实现 INotifyPropertyChanged；集合变化不能只用 List。

6. Designer.cs 能不能手改？
   - 可以但不建议。设计器会维护该文件，手改容易被覆盖或导致设计器打不开。

7. 如何避免按钮重复点击？
   - 执行开始禁用按钮，完成后恢复；异步命令加执行中状态；服务端也要保证幂等。

8. WinForms 如何处理高 DPI？
   - 使用现代项目配置、合适 AutoScaleMode、避免固定布局、使用 TableLayoutPanel/Anchor/Dock，并在多缩放比例下测试。

9. WinForms 项目如何分层？
   - Form 负责 UI，Presenter/Controller 协调，Service 承载业务，Repository 访问数据。不要把所有逻辑写进窗体。

10. 常见内存泄漏有哪些？
    - 事件未退订、Timer 未释放、Image 未 Dispose、静态集合持有窗体、后台任务持有窗体、NotifyIcon 未释放。

## 22. 参考资料

- Microsoft Learn：Windows Forms documentation  
  https://learn.microsoft.com/en-us/dotnet/desktop/winforms/
- Microsoft Learn：Windows Forms overview  
  https://learn.microsoft.com/en-us/dotnet/desktop/winforms/overview/
- Microsoft Learn：Create a Windows Forms app by using .NET  
  https://learn.microsoft.com/en-us/dotnet/desktop/winforms/get-started/create-app-visual-studio
- Microsoft Learn：Form class  
  https://learn.microsoft.com/en-us/dotnet/api/system.windows.forms.form
- Microsoft Learn：Control class  
  https://learn.microsoft.com/en-us/dotnet/api/system.windows.forms.control
- Microsoft Learn：High DPI support in Windows Forms  
  https://learn.microsoft.com/en-us/dotnet/desktop/winforms/high-dpi-support-in-windows-forms
- Microsoft Learn：Application settings overview  
  https://learn.microsoft.com/en-us/dotnet/desktop/winforms/advanced/application-settings-overview
- Microsoft Learn：What's new in Windows Forms for .NET 10  
  https://learn.microsoft.com/en-us/dotnet/desktop/winforms/whats-new/net100
- Microsoft Learn：.NET Configuration  
  https://learn.microsoft.com/en-us/dotnet/core/extensions/configuration
- GitHub：dotnet/winforms  
  https://github.com/dotnet/winforms

## 附录：WinForms 项目上线检查表

上线前建议逐项确认：

- 目标框架和运行时版本明确。
- 发布包在干净机器验证过。
- x86/x64 与依赖库架构一致。
- Program.cs 保留 `[STAThread]`。
- UI 线程没有同步数据库、网络、大文件操作。
- 所有 async void 事件都有异常处理。
- 按钮长任务有禁用和防重复点击。
- DataGridView 大数据使用分页或虚拟模式。
- 表格列标题、宽度、格式、只读状态明确。
- ComboBox 使用 ValueMember 保存业务值。
- 表单验证有 ErrorProvider 或清晰提示。
- 高 DPI 在 100%、125%、150%、200% 测试过。
- Anchor、Dock、TableLayoutPanel 布局无重叠。
- 图片、Icon、GDI 对象及时 Dispose。
- Timer、事件订阅、后台任务有释放路径。
- NotifyIcon 退出时隐藏并 Dispose。
- 用户设置保存到用户目录。
- 日志写入 `%LocalAppData%` 等可写路径。
- 全局异常处理和日志已接入。
- 安装、卸载、升级、回滚流程测试过。
- 自动更新包有签名或哈希校验。
- 关键业务逻辑不在 Form 事件中堆积。
- 关键 Service/Presenter 有单元测试。

WinForms 的精髓不是“拖控件很快”，而是用足它成熟、稳定、直接的工程特性，同时克制它容易把代码写乱的倾向。只要把窗体职责控制住，把耗时任务移出 UI 线程，把数据绑定和表格性能处理好，把高 DPI、部署、异常和资源释放纳入工程规范，WinForms 仍然可以支撑大量可靠的 Windows 桌面业务系统。
