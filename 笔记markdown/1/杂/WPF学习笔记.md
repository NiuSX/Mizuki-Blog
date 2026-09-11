# WPF 学习笔记：从 XAML 到 MVVM、控件模板与桌面工程化的万字精讲

> 适用范围：WPF on .NET 与 WPF on .NET Framework。  
> 更新时间：2026-06-19。  
> 当前定位：WPF 是 Windows 桌面 UI 框架，现代 .NET 版本的 WPF 是开源实现，但仍然只运行在 Windows 上。.NET 10 已于 2025 年 11 月发布，微软文档已经提供 WPF for .NET 10 的更新说明。实际项目建议优先使用当前受支持的 LTS 或公司统一平台版本。

## 目录

1. WPF 是什么，适合做什么
2. WPF 与 WinForms、UWP、WinUI、MAUI 的关系
3. 开发环境、项目结构与启动流程
4. XAML 基础与对象模型
5. 布局系统：Panel、Measure、Arrange
6. 常用控件与内容模型
7. 依赖属性与属性系统
8. 路由事件、输入系统与命令
9. 数据绑定：Binding、DataContext、集合视图
10. MVVM：分层、命令、通知与服务
11. 资源、样式、模板与主题
12. UserControl、自定义控件与附加属性
13. 数据展示：ListBox、ListView、TreeView、DataGrid
14. 异步、Dispatcher 与线程模型
15. 动画、图形、媒体与视觉层
16. 验证、错误提示与表单体验
17. 导航、窗口、对话框与应用生命周期
18. 文件、配置、本地化与资源管理
19. 性能优化与内存泄漏排查
20. 部署、发布与版本更新
21. 测试、调试与工程化实践
22. 常见坑与排查清单
23. 学习路线与源码阅读建议
24. 参考资料

## 1. WPF 是什么，适合做什么

WPF，全称 Windows Presentation Foundation，是微软面向 Windows 桌面应用的 UI 框架。它的核心特征是 XAML 声明式界面、数据绑定、依赖属性、路由事件、样式模板、矢量图形、动画、媒体、文档、硬件加速渲染和 MVVM 友好的架构。

WPF 的价值不是“比 WinForms 更漂亮”这么简单，而是它把桌面应用的 UI 表达能力系统化了。WinForms 更像对 Win32 控件的 .NET 封装，控件外观和行为紧密绑定；WPF 则把控件的逻辑、视觉树、模板、样式、数据绑定拆开，让你可以在不重写业务逻辑的情况下彻底改变控件外观。

WPF 适合这些场景：

- 企业内部桌面系统，例如 ERP、MES、财务、报表、运维工具。
- 对复杂数据展示、表格、树形结构、编辑器有较高要求的应用。
- 需要 Windows 系统能力、硬件设备、串口、打印、文件系统、托盘、注册表、COM、Office 自动化的应用。
- 需要长期维护、离线能力、稳定桌面体验的业务软件。
- 工具类软件，例如配置工具、诊断工具、可视化调试器、工业控制客户端。
- 对 UI 定制要求高，但又不想完全手写渲染引擎的桌面软件。

WPF 不适合这些场景：

- 需要跨平台原生 UI，尤其是 macOS、Linux、移动端同时支持。
- 主要是 Web 分发、无需安装的应用。
- 极度轻量的小工具，WinForms 或 Avalonia 可能更简单。
- 高帧率游戏或复杂 3D 场景，应该考虑 Unity、Unreal 或专门图形引擎。
- 新项目要求使用 Windows App SDK/WinUI 生态且面向微软最新 Fluent 桌面体验。

WPF 最大的学习门槛在于它不是“拖几个控件写事件”就能长期维护的框架。真正写好 WPF，需要理解属性系统、绑定系统、资源系统、模板系统、视觉树和 Dispatcher。只懂控件事件，会很快写出一堆难测试、难维护、难换皮肤、难排查性能问题的代码。

## 2. WPF 与 WinForms、UWP、WinUI、MAUI 的关系

### 2.1 WPF 与 WinForms

WinForms 是更早的 Windows 桌面 UI 框架，API 简单，设计器成熟，适合传统表单和工具类程序。WPF 则提供更强的布局、绑定、模板和绘图能力。

对比：

| 维度 | WinForms | WPF |
| --- | --- | --- |
| UI 描述 | 主要是代码和设计器生成代码 | XAML + 代码 |
| 渲染 | 基于传统 Win32/GDI+ 控件体系 | 基于 retained-mode 图形系统 |
| 布局 | 坐标、Dock、Anchor 为主 | Panel、测量、排列、自适应布局 |
| 数据绑定 | 有，但表达力较弱 | 核心能力之一 |
| 外观定制 | 较难深度改造 | 样式和模板非常强 |
| 学习曲线 | 低 | 中高 |
| 适合 | 简单表单、快速工具 | 复杂桌面、数据密集、定制 UI |

如果你维护老系统，WinForms 仍然可用；如果你要做复杂 Windows 桌面客户端，WPF 仍然是务实选择。

### 2.2 WPF 与 UWP、WinUI

UWP 曾经是微软推动的新 Windows 应用模型，强调商店、沙盒和现代控件。WinUI/Windows App SDK 是更新的 Windows UI 方向。它们更贴近现代 Windows 平台控件和 Fluent Design，但生态、迁移成本、系统版本要求与 WPF 不同。

WPF 的优势是成熟、资料多、第三方控件多、企业应用经验丰富、与传统 .NET/Windows 能力结合紧密。WinUI 的优势是更现代的 Windows UI 技术方向。选择时要看团队经验、目标系统、交付周期、控件需求和长期维护策略。

### 2.3 WPF 与 MAUI、Avalonia

.NET MAUI 面向跨平台应用，覆盖移动和桌面，但 Windows 桌面端能力和 WPF 的成熟度不是同一种定位。Avalonia 是受 WPF 启发的跨平台 XAML UI 框架，语法和思想相似，适合需要跨 Windows、Linux、macOS 的桌面应用。

如果项目明确只做 Windows，而且依赖大量 Windows 桌面能力，WPF 仍然直接；如果必须跨平台，Avalonia 或 Web 技术栈更值得评估。

## 3. 开发环境、项目结构与启动流程

### 3.1 创建项目

现代 .NET WPF 项目通常使用 SDK 风格 csproj：

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net10.0-windows</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <UseWPF>true</UseWPF>
  </PropertyGroup>
</Project>
```

如果使用 .NET 8 LTS，可以是：

```xml
<TargetFramework>net8.0-windows</TargetFramework>
```

WPF 是 Windows-only，所以 TFM 必须带 `-windows`。`OutputType` 通常是 `WinExe`，这样启动时不会弹出控制台窗口。`UseWPF` 告诉 SDK 启用 WPF 构建流程，包括 XAML 编译。

### 3.2 常见目录结构

一个中小型 MVVM 项目可以这样组织：

```text
MyApp/
  App.xaml
  App.xaml.cs
  MainWindow.xaml
  MainWindow.xaml.cs
  Views/
    DashboardView.xaml
    OrdersView.xaml
    SettingsView.xaml
  ViewModels/
    MainViewModel.cs
    DashboardViewModel.cs
    OrdersViewModel.cs
    SettingsViewModel.cs
  Models/
    Order.cs
    UserProfile.cs
  Services/
    IOrderService.cs
    OrderService.cs
    IDialogService.cs
    DialogService.cs
  Commands/
    RelayCommand.cs
    AsyncRelayCommand.cs
  Controls/
    SearchBox.cs
    StatusBadge.xaml
  Resources/
    Brushes.xaml
    Styles.xaml
    Templates.xaml
  Assets/
    app.ico
    logo.png
```

这不是唯一标准。核心原则是：View 负责界面结构，ViewModel 负责界面状态和命令，Model/Service 负责业务和数据，资源文件负责可复用外观。

### 3.3 App.xaml 与启动流程

典型 `App.xaml`：

```xml
<Application x:Class="MyApp.App"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             StartupUri="MainWindow.xaml">
    <Application.Resources>
        <ResourceDictionary>
            <ResourceDictionary.MergedDictionaries>
                <ResourceDictionary Source="Resources/Brushes.xaml"/>
                <ResourceDictionary Source="Resources/Styles.xaml"/>
            </ResourceDictionary.MergedDictionaries>
        </ResourceDictionary>
    </Application.Resources>
</Application>
```

`StartupUri` 指定启动窗口。如果需要依赖注入、登录判断、单实例检查、异常处理，可以移除 `StartupUri`，改写 `OnStartup`：

```csharp
public partial class App : Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        var window = new MainWindow
        {
            DataContext = new MainViewModel()
        };

        window.Show();
    }
}
```

真实项目建议在这里初始化 DI 容器、日志、配置、主题、全局异常处理和主窗口。

### 3.4 XAML 编译生成了什么

每个 XAML 文件通常有一个对应的 code-behind：

```xml
<Window x:Class="MyApp.MainWindow"
        ...>
</Window>
```

```csharp
public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
    }
}
```

`InitializeComponent()` 是构建过程中生成的方法，负责加载 XAML、创建控件树、连接命名元素和事件。`x:Class` 对应 partial class，XAML 和 C# 合成同一个类。理解这一点后，XAML 就不是魔法，它只是声明对象、设置属性、建立关系的标记语言。

## 4. XAML 基础与对象模型

### 4.1 XAML 是声明式对象创建语言

XAML 本质上是声明对象树：

```xml
<Button Content="保存" Width="100" Height="32"/>
```

相当于：

```csharp
var button = new Button
{
    Content = "保存",
    Width = 100,
    Height = 32
};
```

属性可以用 attribute 写，也可以用 property element 写：

```xml
<Button>
    <Button.Content>
        <StackPanel Orientation="Horizontal">
            <TextBlock Text="保存"/>
        </StackPanel>
    </Button.Content>
</Button>
```

当属性值是复杂对象、集合、模板或绑定时，经常使用 property element 语法。

### 4.2 命名空间

典型 XAML 头：

```xml
<Window x:Class="MyApp.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:local="clr-namespace:MyApp">
</Window>
```

默认命名空间是 WPF 控件和图形类型；`x` 命名空间提供 XAML 语言功能，例如 `x:Class`、`x:Name`、`x:Key`、`x:Static`、`x:Type`；`local` 映射到项目里的 CLR 命名空间。

### 4.3 标记扩展

标记扩展用 `{}` 表示，用于在 XAML 中表达运行时解析逻辑：

```xml
<TextBlock Text="{Binding UserName}"/>
<Button Style="{StaticResource PrimaryButtonStyle}"/>
<TextBlock Text="{x:Static sys:DateTime.Now}"/>
```

常用标记扩展：

- `{Binding}`：数据绑定。
- `{StaticResource}`：静态资源查找。
- `{DynamicResource}`：动态资源查找，适合主题切换。
- `{RelativeSource}`：相对源绑定。
- `{TemplateBinding}`：模板内部绑定到被模板化控件。
- `{x:Static}`：引用静态字段、属性、枚举值。
- `{x:Type}`：引用类型对象。

标记扩展是 WPF XAML 的表达力核心。很多初学者觉得 XAML 难，主要是因为没有把普通属性赋值和标记扩展区分清楚。

### 4.4 逻辑树与视觉树

WPF 有两个常被提到的树：

- 逻辑树：应用语义层面的元素关系，例如 Window 包含 Grid，Grid 包含 Button。
- 视觉树：实际渲染层面的元素关系，比逻辑树更细，例如 Button 内部还有 Border、ContentPresenter 等。

资源查找、DataContext 继承、事件路由很多时候沿逻辑树工作；渲染、命中测试、模板内部结构则更多和视觉树有关。调试复杂控件时，Visual Studio 的 Live Visual Tree 很有用。

## 5. 布局系统：Panel、Measure、Arrange

### 5.1 WPF 布局思想

WPF 布局不是固定坐标优先，而是“父容器约束子元素，子元素报告期望尺寸，父容器再安排位置”。布局过程大致分两步：

1. Measure：父容器问子元素“在这个可用空间下你想要多大”。
2. Arrange：父容器决定子元素最终放在哪里、给多大空间。

这让 WPF 很适合 DPI 缩放、窗口大小变化、多语言文本和响应式桌面布局。不要把 WPF 写成绝对坐标堆控件，那会浪费框架能力，也会在不同分辨率和字体下出问题。

### 5.2 Grid

`Grid` 是最常用的布局容器，适合表单、页面框架、复杂区域划分。

```xml
<Grid>
    <Grid.RowDefinitions>
        <RowDefinition Height="Auto"/>
        <RowDefinition Height="*"/>
        <RowDefinition Height="48"/>
    </Grid.RowDefinitions>
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="240"/>
        <ColumnDefinition Width="*"/>
    </Grid.ColumnDefinitions>

    <TextBlock Grid.Row="0" Grid.ColumnSpan="2" Text="订单管理"/>
    <ListBox Grid.Row="1" Grid.Column="0"/>
    <ContentControl Grid.Row="1" Grid.Column="1"/>
    <StatusBar Grid.Row="2" Grid.ColumnSpan="2"/>
</Grid>
```

尺寸规则：

- `Auto`：按内容尺寸。
- `*`：按剩余空间比例分配。
- 固定数值：设备无关像素，不是物理像素。

实践建议：

- 页面大框架优先用 Grid。
- 不要滥用嵌套 Grid，能用 StackPanel/DockPanel 简化就简化。
- 表单两列布局常用 `Auto + *`。
- 尽量避免硬编码大量 Width/Height。

### 5.3 StackPanel

`StackPanel` 按一个方向堆叠子元素：

```xml
<StackPanel Orientation="Vertical">
    <TextBlock Text="用户名"/>
    <TextBox/>
    <TextBlock Text="密码"/>
    <PasswordBox/>
</StackPanel>
```

注意：`StackPanel` 在堆叠方向上给子元素无限空间，这会影响虚拟化和滚动。例如把 `ListBox` 放在垂直 `StackPanel` 中，可能导致虚拟化失效。列表类控件外层更常用 Grid。

### 5.4 DockPanel

`DockPanel` 适合顶部工具栏、底部状态栏、左侧导航、主体填充：

```xml
<DockPanel>
    <ToolBar DockPanel.Dock="Top"/>
    <StatusBar DockPanel.Dock="Bottom"/>
    <TreeView DockPanel.Dock="Left" Width="240"/>
    <ContentControl/>
</DockPanel>
```

默认最后一个子元素填充剩余空间。

### 5.5 WrapPanel、Canvas、UniformGrid

`WrapPanel` 适合标签、工具按钮、缩略图，空间不足自动换行。`Canvas` 使用绝对坐标，适合绘图板、设计器、节点编辑器，不适合普通表单。`UniformGrid` 把空间均匀分成相同行列，适合按钮矩阵、棋盘、色块。

### 5.6 Margin、Padding、Alignment

`Margin` 是控件外部间距；`Padding` 是控件内部内容与边框的间距。`HorizontalAlignment` 和 `VerticalAlignment` 控制控件在父容器给定空间内如何摆放。

```xml
<Button Content="保存"
        Padding="16,8"
        Margin="0,12,0,0"
        HorizontalAlignment="Right"/>
```

不要通过空 `TextBlock` 或固定宽度占位控件制造间距。使用布局属性，后期维护更可靠。

## 6. 常用控件与内容模型

### 6.1 ContentControl

`ContentControl` 只能有一个内容对象，例如 `Button`、`Label`、`ContentControl`、`Window`。但这个“一个对象”可以是复杂布局容器：

```xml
<Button>
    <StackPanel Orientation="Horizontal">
        <TextBlock Text="保存"/>
    </StackPanel>
</Button>
```

这就是 WPF 强大的内容模型：按钮内容不只是字符串，可以是任意 UI。

### 6.2 ItemsControl

`ItemsControl` 展示集合，例如 `ListBox`、`ComboBox`、`TreeView`、`Menu`、`DataGrid`。核心属性：

- `ItemsSource`：绑定集合。
- `ItemTemplate`：每个数据项如何显示。
- `ItemsPanel`：使用什么面板排列项目。
- `ItemContainerStyle`：每个容器如何样式化。

示例：

```xml
<ListBox ItemsSource="{Binding Orders}">
    <ListBox.ItemTemplate>
        <DataTemplate>
            <StackPanel Orientation="Horizontal">
                <TextBlock Text="{Binding Number}" Width="120"/>
                <TextBlock Text="{Binding CustomerName}" Width="180"/>
                <TextBlock Text="{Binding Amount, StringFormat=C}"/>
            </StackPanel>
        </DataTemplate>
    </ListBox.ItemTemplate>
</ListBox>
```

WPF 的列表控件不是把字符串填进去这么简单，而是把数据对象映射为视觉项。

### 6.3 TextBox、PasswordBox 与输入

`TextBox.Text` 可以双向绑定：

```xml
<TextBox Text="{Binding UserName, UpdateSourceTrigger=PropertyChanged}"/>
```

`PasswordBox.Password` 不是依赖属性，不能直接普通绑定，这是出于安全设计。工程上常见处理：

- 在 code-behind 中读取密码并传给命令。
- 使用附加属性实现绑定，但要评估安全风险。
- 使用登录服务和专门控件封装。

不要为了“纯 MVVM”牺牲安全和清晰性。登录窗口的少量 code-behind 是可以接受的。

### 6.4 Selector 类控件

`ListBox`、`ComboBox`、`TabControl` 都属于选择类控件。常用属性：

```xml
<ComboBox ItemsSource="{Binding StatusOptions}"
          SelectedItem="{Binding SelectedStatus}"
          DisplayMemberPath="Name"/>
```

当选中值只需要某个字段时：

```xml
<ComboBox ItemsSource="{Binding Users}"
          DisplayMemberPath="DisplayName"
          SelectedValuePath="Id"
          SelectedValue="{Binding SelectedUserId}"/>
```

`SelectedItem` 是整个对象，`SelectedValue` 是 `SelectedValuePath` 指定的字段值。不要混用到自己也分不清。

## 7. 依赖属性与属性系统

### 7.1 为什么需要依赖属性

WPF 的很多能力都建立在依赖属性上：数据绑定、样式、动画、默认值、属性继承、资源引用、变更通知、值优先级。普通 CLR 属性无法承载这些系统能力。

典型控件属性如 `Button.Content`、`FrameworkElement.Width`、`TextBlock.Text` 多数都是依赖属性。

依赖属性只能定义在继承自 `DependencyObject` 的类型上。它不是普通字段，而是由 WPF 属性系统管理值存储和解析。

### 7.2 定义依赖属性

```csharp
public class StatusBadge : Control
{
    public static readonly DependencyProperty StatusTextProperty =
        DependencyProperty.Register(
            nameof(StatusText),
            typeof(string),
            typeof(StatusBadge),
            new PropertyMetadata(string.Empty));

    public string StatusText
    {
        get => (string)GetValue(StatusTextProperty);
        set => SetValue(StatusTextProperty, value);
    }
}
```

命名约定：

- 静态字段名：`StatusTextProperty`。
- CLR 包装属性名：`StatusText`。
- 注册 owner type：定义该属性的类型。

依赖属性字段必须是 `public static readonly`，不要写成实例字段。

### 7.3 PropertyMetadata

元数据可以包含默认值、属性变化回调、强制值回调：

```csharp
public static readonly DependencyProperty IsActiveProperty =
    DependencyProperty.Register(
        nameof(IsActive),
        typeof(bool),
        typeof(StatusBadge),
        new PropertyMetadata(false, OnIsActiveChanged));

private static void OnIsActiveChanged(
    DependencyObject d,
    DependencyPropertyChangedEventArgs e)
{
    var control = (StatusBadge)d;
    control.UpdateVisualState();
}
```

注意回调是静态方法，因为依赖属性注册也是静态的。通过 `d` 转回实例。

### 7.4 值优先级

依赖属性最终值来自多个来源，优先级大致包括：

- 本地值，例如直接设置 `Width="100"`。
- 动画值。
- 绑定值。
- 样式 Setter。
- 模板 Trigger。
- 继承值。
- 默认值。

当样式不生效时，常见原因是本地值优先级更高。例如：

```xml
<Button Background="Red" Style="{StaticResource PrimaryButtonStyle}"/>
```

如果样式里也设置 Background，本地的 Red 可能覆盖样式。排查样式问题时，要看属性值来源，而不只是看 XAML 顺序。

### 7.5 附加属性

附加属性允许一个类为其他对象提供属性。例如 `Grid.Row`、`DockPanel.Dock`：

```xml
<TextBlock Grid.Row="1" DockPanel.Dock="Top"/>
```

定义附加属性：

```csharp
public static class FocusHelper
{
    public static readonly DependencyProperty IsFocusedProperty =
        DependencyProperty.RegisterAttached(
            "IsFocused",
            typeof(bool),
            typeof(FocusHelper),
            new PropertyMetadata(false, OnIsFocusedChanged));

    public static bool GetIsFocused(DependencyObject obj)
        => (bool)obj.GetValue(IsFocusedProperty);

    public static void SetIsFocused(DependencyObject obj, bool value)
        => obj.SetValue(IsFocusedProperty, value);

    private static void OnIsFocusedChanged(
        DependencyObject d,
        DependencyPropertyChangedEventArgs e)
    {
        if (d is UIElement element && e.NewValue is true)
        {
            element.Focus();
        }
    }
}
```

附加属性适合给控件增加通用行为，但不要把复杂业务逻辑塞进去。

## 8. 路由事件、输入系统与命令

### 8.1 路由事件是什么

普通 CLR 事件只在事件源对象上触发；WPF 路由事件可以沿元素树传播。常见路由策略：

- Bubbling：从事件源向父元素冒泡，例如 `Button.Click`。
- Tunneling：从根元素向事件源隧道传播，通常以 `Preview` 开头，例如 `PreviewMouseDown`。
- Direct：类似普通事件，只在源对象触发。

示例：

```xml
<Grid Button.Click="OnAnyButtonClick">
    <StackPanel>
        <Button Content="保存"/>
        <Button Content="删除"/>
    </StackPanel>
</Grid>
```

父级 Grid 可以统一处理内部 Button 的 Click。这是路由事件的价值之一。

### 8.2 Handled

事件参数通常有 `Handled` 属性：

```csharp
private void OnPreviewKeyDown(object sender, KeyEventArgs e)
{
    if (e.Key == Key.Enter)
    {
        e.Handled = true;
    }
}
```

设置 `Handled=true` 后，后续普通处理器可能不再收到该事件。需要谨慎使用，否则会导致控件默认行为失效。某些情况下可通过 `AddHandler(routedEvent, handler, handledEventsToo: true)` 监听已处理事件。

### 8.3 命令系统

WPF Commanding 把“用户触发动作”和“动作执行逻辑”分离。命令比按钮 Click 更抽象：同一个保存命令可以来自菜单、工具栏按钮、快捷键。

WPF 内置命令如：

- `ApplicationCommands.Copy`
- `ApplicationCommands.Paste`
- `ApplicationCommands.Save`
- `NavigationCommands.BrowseBack`

使用命令：

```xml
<Window.CommandBindings>
    <CommandBinding Command="ApplicationCommands.Save"
                    Executed="OnSaveExecuted"
                    CanExecute="OnSaveCanExecute"/>
</Window.CommandBindings>

<Button Command="ApplicationCommands.Save" Content="保存"/>
```

MVVM 中更常使用实现 `ICommand` 的 `RelayCommand`：

```csharp
public sealed class RelayCommand : ICommand
{
    private readonly Action<object?> _execute;
    private readonly Predicate<object?>? _canExecute;

    public RelayCommand(Action<object?> execute, Predicate<object?>? canExecute = null)
    {
        _execute = execute;
        _canExecute = canExecute;
    }

    public bool CanExecute(object? parameter)
        => _canExecute?.Invoke(parameter) ?? true;

    public void Execute(object? parameter)
        => _execute(parameter);

    public event EventHandler? CanExecuteChanged
    {
        add => CommandManager.RequerySuggested += value;
        remove => CommandManager.RequerySuggested -= value;
    }
}
```

按钮绑定：

```xml
<Button Content="保存"
        Command="{Binding SaveCommand}"/>
```

ViewModel：

```csharp
public ICommand SaveCommand { get; }

public EditViewModel()
{
    SaveCommand = new RelayCommand(_ => Save(), _ => CanSave);
}
```

命令的关键价值是自动禁用 UI 和隔离交互逻辑。`CanExecute=false` 时，Button 会自动不可用。

### 8.4 快捷键

```xml
<Window.InputBindings>
    <KeyBinding Key="S"
                Modifiers="Control"
                Command="{Binding SaveCommand}"/>
</Window.InputBindings>
```

快捷键应该绑定命令，而不是直接写 KeyDown 逻辑。这样菜单、按钮、快捷键都走同一套行为。

## 9. 数据绑定：Binding、DataContext、集合视图

### 9.1 Binding 基本模型

数据绑定连接 source 和 target。目标属性通常必须是依赖属性，例如：

```xml
<TextBlock Text="{Binding UserName}"/>
```

如果 `TextBlock.DataContext` 是一个 ViewModel，且它有 `UserName` 属性，绑定系统会把该属性值显示出来。

绑定常见属性：

- `Path`：绑定路径。
- `Mode`：OneWay、TwoWay、OneTime、OneWayToSource。
- `UpdateSourceTrigger`：更新源的时机。
- `Source`、`ElementName`、`RelativeSource`：指定绑定源。
- `Converter`：值转换器。
- `StringFormat`：格式化。
- `FallbackValue`：绑定失败时的值。
- `TargetNullValue`：源值为 null 时的显示值。

示例：

```xml
<TextBox Text="{Binding Name,
                        Mode=TwoWay,
                        UpdateSourceTrigger=PropertyChanged,
                        TargetNullValue=''}"/>
```

### 9.2 DataContext 继承

`DataContext` 会沿元素树向下继承：

```xml
<Grid DataContext="{Binding CurrentUser}">
    <TextBlock Text="{Binding Name}"/>
    <TextBlock Text="{Binding Email}"/>
</Grid>
```

两个 TextBlock 的绑定源都是 `CurrentUser`。这让 XAML 简洁，但也容易出错：某个子控件改变 DataContext 后，内部绑定路径就变了。

ItemsControl 的 `ItemTemplate` 内部 DataContext 是当前数据项，而不是外层 ViewModel：

```xml
<ListBox ItemsSource="{Binding Orders}">
    <ListBox.ItemTemplate>
        <DataTemplate>
            <Button Content="{Binding Number}"
                    Command="{Binding DataContext.OpenOrderCommand,
                                      RelativeSource={RelativeSource AncestorType=ListBox}}"
                    CommandParameter="{Binding}"/>
        </DataTemplate>
    </ListBox.ItemTemplate>
</ListBox>
```

这里 Button 的 `Content` 绑定当前 Order；`Command` 需要通过 `RelativeSource` 找回外层 ListBox 的 DataContext。

### 9.3 INotifyPropertyChanged

绑定源属性变化后，如果 UI 要自动刷新，需要实现 `INotifyPropertyChanged`：

```csharp
public abstract class ViewModelBase : INotifyPropertyChanged
{
    public event PropertyChangedEventHandler? PropertyChanged;

    protected void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));

    protected bool SetProperty<T>(
        ref T field,
        T value,
        [CallerMemberName] string? propertyName = null)
    {
        if (EqualityComparer<T>.Default.Equals(field, value))
        {
            return false;
        }

        field = value;
        OnPropertyChanged(propertyName);
        return true;
    }
}
```

ViewModel：

```csharp
public sealed class UserViewModel : ViewModelBase
{
    private string _userName = string.Empty;

    public string UserName
    {
        get => _userName;
        set => SetProperty(ref _userName, value);
    }
}
```

不要让 ViewModel 继承 `DependencyObject` 来做绑定源。ViewModel 应该是普通 .NET 对象，便于测试、序列化和跨线程处理。

### 9.4 ObservableCollection

集合项增删变化要通知 UI，使用 `ObservableCollection<T>`：

```csharp
public ObservableCollection<OrderViewModel> Orders { get; } = new();
```

`ObservableCollection` 通知的是集合结构变化，不自动通知集合项内部属性变化。项本身变化仍需要项类型实现 `INotifyPropertyChanged`。

如果后台线程更新集合，不能直接改 UI 绑定的集合。应切回 Dispatcher，或使用线程安全的集合同步方案。

### 9.5 值转换器

`IValueConverter` 把源值转换成目标值：

```csharp
public sealed class BooleanToVisibilityConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        => value is true ? Visibility.Visible : Visibility.Collapsed;

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        => value is Visibility.Visible;
}
```

XAML：

```xml
<Window.Resources>
    <local:BooleanToVisibilityConverter x:Key="BoolToVisibility"/>
</Window.Resources>

<TextBlock Text="加载中"
           Visibility="{Binding IsLoading, Converter={StaticResource BoolToVisibility}}"/>
```

转换器适合纯显示转换，不适合写业务逻辑。复杂状态最好在 ViewModel 中暴露明确属性，例如 `CanSubmit`、`IsEmpty`、`StatusText`。

### 9.6 MultiBinding

多个源值组合：

```xml
<TextBlock>
    <TextBlock.Text>
        <MultiBinding StringFormat="{}{0} - {1}">
            <Binding Path="FirstName"/>
            <Binding Path="LastName"/>
        </MultiBinding>
    </TextBlock.Text>
</TextBlock>
```

复杂逻辑可实现 `IMultiValueConverter`。但如果组合逻辑属于业务语义，放在 ViewModel 更清楚。

### 9.7 CollectionView

WPF 对集合绑定并不直接只用原集合，还会通过 `ICollectionView` 提供排序、过滤、分组和当前项：

```csharp
OrdersView = CollectionViewSource.GetDefaultView(Orders);
OrdersView.Filter = item =>
{
    var order = (OrderViewModel)item;
    return order.CustomerName.Contains(SearchText, StringComparison.OrdinalIgnoreCase);
};
```

当搜索条件变化：

```csharp
OrdersView.Refresh();
```

XAML：

```xml
<ListView ItemsSource="{Binding OrdersView}"/>
```

对于大量数据，过滤和排序要注意性能。不要每个按键都对十万条数据做昂贵 Refresh，可以加防抖或服务端查询。

## 10. MVVM：分层、命令、通知与服务

### 10.1 MVVM 的目的

MVVM 不是为了消灭 code-behind，而是为了把界面结构和界面逻辑分开：

- Model：业务实体和领域逻辑。
- View：XAML UI 和少量与视觉相关的 code-behind。
- ViewModel：面向 View 的状态、命令、验证、加载逻辑。

一个好的 ViewModel 不依赖具体控件，不直接操作 Button、TextBox、Window。它暴露属性和命令，View 通过绑定消费这些状态。

### 10.2 ViewModel 应该包含什么

适合放在 ViewModel：

- 当前页面状态。
- 输入字段。
- 当前选中项。
- 可见性、启用状态、加载状态。
- 命令。
- 验证错误。
- 调用服务获取数据。
- 把 Model 转换为适合展示的数据。

不适合放在 ViewModel：

- 控件查找和视觉树遍历。
- 动画细节。
- 鼠标坐标级绘制逻辑。
- Windows 句柄操作。
- MessageBox 的直接调用，除非项目很小。
- 文件选择对话框的直接调用，最好通过服务抽象。

### 10.3 RelayCommand 与 AsyncRelayCommand

同步命令容易写，异步命令要避免重复点击、异常吞掉和 UI 状态不一致：

```csharp
public sealed class AsyncRelayCommand : ICommand
{
    private readonly Func<Task> _execute;
    private readonly Func<bool>? _canExecute;
    private bool _isExecuting;

    public AsyncRelayCommand(Func<Task> execute, Func<bool>? canExecute = null)
    {
        _execute = execute;
        _canExecute = canExecute;
    }

    public bool CanExecute(object? parameter)
        => !_isExecuting && (_canExecute?.Invoke() ?? true);

    public async void Execute(object? parameter)
    {
        if (!CanExecute(parameter))
        {
            return;
        }

        try
        {
            _isExecuting = true;
            RaiseCanExecuteChanged();
            await _execute();
        }
        finally
        {
            _isExecuting = false;
            RaiseCanExecuteChanged();
        }
    }

    public event EventHandler? CanExecuteChanged;

    public void RaiseCanExecuteChanged()
        => CanExecuteChanged?.Invoke(this, EventArgs.Empty);
}
```

ViewModel：

```csharp
public ICommand LoadCommand { get; }

public OrdersViewModel(IOrderService orderService)
{
    LoadCommand = new AsyncRelayCommand(LoadAsync);
}

private async Task LoadAsync()
{
    IsLoading = true;
    try
    {
        var orders = await _orderService.GetOrdersAsync();
        Orders.Clear();
        foreach (var order in orders)
        {
            Orders.Add(new OrderViewModel(order));
        }
    }
    finally
    {
        IsLoading = false;
    }
}
```

真实项目可直接使用 CommunityToolkit.Mvvm，它提供 `ObservableObject`、`RelayCommand`、`AsyncRelayCommand`、源生成器等能力，少写大量样板代码。

### 10.4 依赖注入

WPF 没有强制 DI，但现代项目推荐使用：

```csharp
var services = new ServiceCollection();
services.AddSingleton<IOrderService, OrderService>();
services.AddTransient<MainViewModel>();
services.AddSingleton<MainWindow>();

var provider = services.BuildServiceProvider();
var window = provider.GetRequiredService<MainWindow>();
window.Show();
```

窗口构造：

```csharp
public MainWindow(MainViewModel viewModel)
{
    InitializeComponent();
    DataContext = viewModel;
}
```

注意窗口生命周期。单例窗口关闭后再次 Show 会出错；需要重复打开的窗口应注册为 Transient。

### 10.5 DialogService

ViewModel 不应直接 new Window。可以抽象：

```csharp
public interface IDialogService
{
    Task ShowMessageAsync(string message);
    Task<bool> ConfirmAsync(string message);
}
```

简单实现可以包一层 `MessageBox`。复杂项目可以映射 ViewModel 到 Window，实现统一弹窗、主题、日志和测试替身。

### 10.6 “零 code-behind”不是目标

这些代码放 code-behind 是合理的：

- 纯视觉事件，例如动画开始、控件焦点。
- 与具体控件强绑定的行为。
- Window 拖动、最大化、最小化。
- PasswordBox 安全读取。
- 复杂控件模板内部协调。

如果 code-behind 开始调用业务服务、拼 SQL、改全局状态，那才是问题。MVVM 的判断标准是依赖方向清晰，而不是文件里有没有事件处理器。

## 11. 资源、样式、模板与主题

### 11.1 资源系统

资源是可复用对象：

```xml
<Window.Resources>
    <SolidColorBrush x:Key="PrimaryBrush" Color="#2563EB"/>
    <Style x:Key="TitleTextStyle" TargetType="TextBlock">
        <Setter Property="FontSize" Value="20"/>
        <Setter Property="FontWeight" Value="SemiBold"/>
    </Style>
</Window.Resources>
```

使用：

```xml
<TextBlock Text="订单列表"
           Style="{StaticResource TitleTextStyle}"
           Foreground="{StaticResource PrimaryBrush}"/>
```

资源查找顺序大致是当前元素、父元素、页面/窗口、应用、主题、系统。资源 key 冲突时，离使用点最近的资源优先。

### 11.2 StaticResource 与 DynamicResource

`StaticResource` 在加载时解析，性能好，适合大多数场景。`DynamicResource` 在运行时保持引用，资源变化后可更新 UI，适合主题切换：

```xml
<Border Background="{DynamicResource WindowBackgroundBrush}"/>
```

不要所有资源都用 DynamicResource。动态资源有额外开销，也会让依赖关系更难分析。

### 11.3 隐式样式与显式样式

显式样式：

```xml
<Style x:Key="PrimaryButtonStyle" TargetType="Button">
    <Setter Property="Padding" Value="16,8"/>
    <Setter Property="Background" Value="#2563EB"/>
    <Setter Property="Foreground" Value="White"/>
</Style>
```

```xml
<Button Style="{StaticResource PrimaryButtonStyle}"/>
```

隐式样式：

```xml
<Style TargetType="TextBox">
    <Setter Property="Margin" Value="0,4,0,12"/>
    <Setter Property="Padding" Value="8,6"/>
</Style>
```

同一资源作用域内所有 TextBox 默认使用该样式。隐式样式适合统一基础外观，显式样式适合语义变体，例如 primary、danger、toolbar。

### 11.4 BasedOn

```xml
<Style x:Key="DangerButtonStyle"
       TargetType="Button"
       BasedOn="{StaticResource PrimaryButtonStyle}">
    <Setter Property="Background" Value="#DC2626"/>
</Style>
```

`BasedOn` 可以减少重复。不要把样式继承链做得太深，否则排查属性来源会很痛苦。

### 11.5 ControlTemplate

`ControlTemplate` 定义控件的视觉结构。Button 默认看起来像按钮，是因为它有默认模板。你可以替换模板：

```xml
<Style x:Key="FlatButtonStyle" TargetType="Button">
    <Setter Property="Template">
        <Setter.Value>
            <ControlTemplate TargetType="Button">
                <Border x:Name="Root"
                        Background="{TemplateBinding Background}"
                        CornerRadius="4"
                        Padding="{TemplateBinding Padding}">
                    <ContentPresenter HorizontalAlignment="Center"
                                      VerticalAlignment="Center"/>
                </Border>
                <ControlTemplate.Triggers>
                    <Trigger Property="IsMouseOver" Value="True">
                        <Setter TargetName="Root"
                                Property="Opacity"
                                Value="0.85"/>
                    </Trigger>
                    <Trigger Property="IsEnabled" Value="False">
                        <Setter TargetName="Root"
                                Property="Opacity"
                                Value="0.45"/>
                    </Trigger>
                </ControlTemplate.Triggers>
            </ControlTemplate>
        </Setter.Value>
    </Setter>
</Style>
```

模板要保留控件必要语义，例如 Button 需要 `ContentPresenter` 显示内容；TextBox 模板需要特定命名部件；ScrollViewer 模板需要滚动部件。修改复杂控件模板前先查默认模板。

### 11.6 DataTemplate

`DataTemplate` 定义数据对象如何显示：

```xml
<DataTemplate DataType="{x:Type vm:OrderViewModel}">
    <StackPanel>
        <TextBlock Text="{Binding Number}"/>
        <TextBlock Text="{Binding CustomerName}"/>
    </StackPanel>
</DataTemplate>
```

如果设置了 `DataType` 且没有 `x:Key`，WPF 可以按数据类型自动应用模板。这在 ContentControl 页面切换中很有用：

```xml
<ContentControl Content="{Binding CurrentPage}"/>
```

```xml
<DataTemplate DataType="{x:Type vm:DashboardViewModel}">
    <views:DashboardView/>
</DataTemplate>
```

这种方式可以让 MainWindow 只绑定当前页面 ViewModel，由资源系统选择对应 View。

### 11.7 Trigger

样式触发器根据属性状态改变外观：

```xml
<Style TargetType="TextBox">
    <Style.Triggers>
        <Trigger Property="Validation.HasError" Value="True">
            <Setter Property="BorderBrush" Value="#DC2626"/>
        </Trigger>
    </Style.Triggers>
</Style>
```

数据触发器根据绑定值改变外观：

```xml
<DataTrigger Binding="{Binding Status}" Value="Error">
    <Setter Property="Foreground" Value="#DC2626"/>
</DataTrigger>
```

复杂交互和动画可以使用 VisualStateManager，尤其是自定义控件。

## 12. UserControl、自定义控件与附加属性

### 12.1 UserControl

`UserControl` 适合把一组已有控件组合成可复用视图，例如搜索栏、登录表单、订单详情区。

```xml
<UserControl x:Class="MyApp.Controls.SearchBox">
    <Grid>
        <TextBox Text="{Binding Query, RelativeSource={RelativeSource AncestorType=UserControl}}"/>
        <Button Content="搜索"
                Command="{Binding SearchCommand, RelativeSource={RelativeSource AncestorType=UserControl}}"/>
    </Grid>
</UserControl>
```

如果 UserControl 要暴露可绑定属性，应定义依赖属性，而不是在内部强行设置 DataContext。一个常见错误是在 UserControl 构造函数中写：

```csharp
DataContext = this;
```

这会破坏父级传入的 DataContext，使外部绑定混乱。更推荐内部使用 `RelativeSource AncestorType=UserControl` 绑定自身依赖属性。

### 12.2 CustomControl

自定义控件适合创建真正可主题化、可模板化的控件。通常继承 `Control`，在静态构造中指定默认样式 key：

```csharp
public class StatusBadge : Control
{
    static StatusBadge()
    {
        DefaultStyleKeyProperty.OverrideMetadata(
            typeof(StatusBadge),
            new FrameworkPropertyMetadata(typeof(StatusBadge)));
    }
}
```

默认模板放在 `Themes/Generic.xaml`：

```xml
<Style TargetType="{x:Type local:StatusBadge}">
    <Setter Property="Template">
        <Setter.Value>
            <ControlTemplate TargetType="{x:Type local:StatusBadge}">
                <Border Background="{TemplateBinding Background}"
                        CornerRadius="4"
                        Padding="8,2">
                    <ContentPresenter/>
                </Border>
            </ControlTemplate>
        </Setter.Value>
    </Setter>
</Style>
```

选择：

- 用 UserControl 组合具体界面。
- 用 CustomControl 做通用控件库。
- 用附加属性/Behavior 增加可复用行为。

### 12.3 控件模板部件

复杂控件可以用 `TemplatePart` 声明需要的模板部件：

```csharp
[TemplatePart(Name = PartTextBox, Type = typeof(TextBox))]
public class SearchBox : Control
{
    private const string PartTextBox = "PART_TextBox";

    public override void OnApplyTemplate()
    {
        base.OnApplyTemplate();
        var textBox = GetTemplateChild(PartTextBox) as TextBox;
    }
}
```

WPF 约定模板部件名常以 `PART_` 开头。`OnApplyTemplate` 可能被调用多次，重新获取部件前应解除旧事件订阅，避免内存泄漏。

## 13. 数据展示：ListBox、ListView、TreeView、DataGrid

### 13.1 ListBox 与 ListView

`ListBox` 适合简单列表和选择。`ListView` 配合 `GridView` 可以做列式展示：

```xml
<ListView ItemsSource="{Binding Orders}"
          SelectedItem="{Binding SelectedOrder}">
    <ListView.View>
        <GridView>
            <GridViewColumn Header="订单号" DisplayMemberBinding="{Binding Number}"/>
            <GridViewColumn Header="客户" DisplayMemberBinding="{Binding CustomerName}"/>
            <GridViewColumn Header="金额" DisplayMemberBinding="{Binding Amount}"/>
        </GridView>
    </ListView.View>
</ListView>
```

如果需要排序、编辑、冻结列、行验证，更适合 DataGrid。

### 13.2 DataGrid

`DataGrid` 是企业应用高频控件：

```xml
<DataGrid ItemsSource="{Binding Orders}"
          SelectedItem="{Binding SelectedOrder}"
          AutoGenerateColumns="False"
          CanUserAddRows="False"
          IsReadOnly="False">
    <DataGrid.Columns>
        <DataGridTextColumn Header="订单号" Binding="{Binding Number}" IsReadOnly="True"/>
        <DataGridTextColumn Header="客户" Binding="{Binding CustomerName}"/>
        <DataGridTextColumn Header="金额" Binding="{Binding Amount, StringFormat=N2}"/>
        <DataGridCheckBoxColumn Header="已付款" Binding="{Binding IsPaid}"/>
    </DataGrid.Columns>
</DataGrid>
```

建议显式定义列，不要依赖 `AutoGenerateColumns` 做生产 UI。显式列更可控，便于格式化、验证、权限、排序和样式。

### 13.3 DataGrid 性能

重要属性：

```xml
<DataGrid EnableRowVirtualization="True"
          EnableColumnVirtualization="True"
          VirtualizingPanel.IsVirtualizing="True"
          VirtualizingPanel.VirtualizationMode="Recycling"/>
```

性能建议：

- 不要在 DataGrid 单元格模板中放过重控件。
- 不要每行嵌套大量复杂视觉树。
- 大数据分页或虚拟加载，不要一次性加载几十万行。
- 避免频繁 Refresh 整个 CollectionView。
- 不要在属性 getter 中做耗时计算。
- 使用 ObservableCollection 时批量更新要考虑通知风暴。

### 13.4 TreeView

TreeView 展示层级数据，常用 `HierarchicalDataTemplate`：

```xml
<TreeView ItemsSource="{Binding Nodes}">
    <TreeView.ItemTemplate>
        <HierarchicalDataTemplate ItemsSource="{Binding Children}">
            <TextBlock Text="{Binding Name}"/>
        </HierarchicalDataTemplate>
    </TreeView.ItemTemplate>
</TreeView>
```

TreeView 常见挑战：

- 选中项绑定不直接。
- 大树加载慢，需要懒加载。
- 节点展开状态要保存。
- 右键菜单 DataContext 容易丢。
- 虚拟化默认不如列表直接。

懒加载常用做法是在节点展开时加载 Children，或预放一个 dummy 节点表示可展开。

### 13.5 右键菜单 DataContext

`ContextMenu` 不在原视觉树中，DataContext 继承常不符合预期。常见绑定：

```xml
<Button Content="操作">
    <Button.ContextMenu>
        <ContextMenu DataContext="{Binding PlacementTarget.DataContext,
                                           RelativeSource={RelativeSource Self}}">
            <MenuItem Header="删除"
                      Command="{Binding DeleteCommand}"/>
        </ContextMenu>
    </Button.ContextMenu>
</Button>
```

复杂列表项右键菜单经常要用 `PlacementTarget` 找回来源控件。

## 14. 异步、Dispatcher 与线程模型

### 14.1 WPF 线程模型

WPF 应用通常有 UI 线程和渲染线程。UI 线程处理输入、事件、布局、绑定、应用代码；渲染线程在后台协助渲染。绝大多数 WPF 对象继承自 `DispatcherObject`，只能由创建它的线程访问。

错误示例：

```csharp
Task.Run(() =>
{
    StatusText = "完成"; // 如果这是 ViewModel 属性通常可以，但直接改控件不行
    myButton.Content = "完成"; // 错误：跨线程访问 UI
});
```

直接更新控件必须回到 Dispatcher：

```csharp
await Dispatcher.InvokeAsync(() =>
{
    myButton.Content = "完成";
});
```

在 MVVM 中，通常让异步方法 `await` 后回到 UI 上下文，再修改绑定属性：

```csharp
public async Task LoadAsync()
{
    IsLoading = true;
    var data = await _service.GetDataAsync();
    Items.Clear();
    foreach (var item in data)
    {
        Items.Add(item);
    }
    IsLoading = false;
}
```

默认情况下，`await` 会捕获当前同步上下文，在 UI 线程继续执行。库代码中可使用 `ConfigureAwait(false)`，但 ViewModel 修改 UI 绑定集合时要确保回到 UI 线程。

### 14.2 Dispatcher.Invoke 与 BeginInvoke/InvokeAsync

`Invoke` 同步等待 UI 线程执行，可能造成死锁或卡顿；`InvokeAsync` 异步排队更常用：

```csharp
await Application.Current.Dispatcher.InvokeAsync(() =>
{
    Items.Add(item);
});
```

不要把大量循环逐条投递到 Dispatcher：

```csharp
foreach (var item in thousands)
{
    await Dispatcher.InvokeAsync(() => Items.Add(item));
}
```

这会制造大量 UI 队列任务。更好的方式是在后台准备数据，回 UI 线程批量替换或分批追加。

### 14.3 保持 UI 响应

原则：

- CPU 密集任务用 `Task.Run` 放后台线程。
- I/O 密集任务使用真正异步 API。
- UI 线程只做短小更新。
- 长任务显示进度和取消按钮。
- 避免 `.Result`、`.Wait()` 阻塞 UI。

错误：

```csharp
var result = _service.GetDataAsync().Result;
```

正确：

```csharp
var result = await _service.GetDataAsync();
```

### 14.4 取消和进度

```csharp
private CancellationTokenSource? _loadCts;

private async Task LoadAsync()
{
    _loadCts?.Cancel();
    _loadCts = new CancellationTokenSource();

    try
    {
        var progress = new Progress<int>(value => ProgressValue = value);
        var data = await _service.LoadAsync(progress, _loadCts.Token);
        Items = new ObservableCollection<ItemViewModel>(data);
    }
    catch (OperationCanceledException)
    {
        StatusText = "已取消";
    }
}
```

`Progress<T>` 会捕获当前上下文，在 UI 线程回调，很适合更新进度条。

## 15. 动画、图形、媒体与视觉层

### 15.1 WPF 图形基础

WPF 使用设备无关单位，1 个单位通常是 1/96 英寸。它支持矢量图形、画刷、几何、变换、效果、位图和 3D。

常见画刷：

```xml
<SolidColorBrush Color="#2563EB"/>
<LinearGradientBrush StartPoint="0,0" EndPoint="1,1">
    <GradientStop Color="#2563EB" Offset="0"/>
    <GradientStop Color="#10B981" Offset="1"/>
</LinearGradientBrush>
<ImageBrush ImageSource="/Assets/background.png"/>
```

图形：

```xml
<Path Fill="#2563EB"
      Data="M 0,0 L 20,0 L 10,20 Z"/>
```

### 15.2 Transform

布局变换和渲染变换不同：

- `LayoutTransform` 影响布局测量，开销更大。
- `RenderTransform` 不重新布局，只影响渲染，动画常用。

```xml
<Button Content="放大">
    <Button.RenderTransform>
        <ScaleTransform ScaleX="1" ScaleY="1"/>
    </Button.RenderTransform>
</Button>
```

做动画优先使用 `RenderTransform`。

### 15.3 Storyboard 动画

```xml
<Button Content="保存">
    <Button.Triggers>
        <EventTrigger RoutedEvent="MouseEnter">
            <BeginStoryboard>
                <Storyboard>
                    <DoubleAnimation Storyboard.TargetProperty="Opacity"
                                     To="0.75"
                                     Duration="0:0:0.15"/>
                </Storyboard>
            </BeginStoryboard>
        </EventTrigger>
    </Button.Triggers>
</Button>
```

动画适合表达状态变化，不要把企业应用做成大量无意义动效。动画过多会干扰操作效率，也会增加性能压力。

### 15.4 DrawingVisual 与低层绘制

如果需要绘制大量简单图形，成千上万个 Shape 控件会造成视觉树过重。可以考虑 `DrawingVisual` 或自定义控件重写 `OnRender`：

```csharp
protected override void OnRender(DrawingContext dc)
{
    base.OnRender(dc);
    dc.DrawRectangle(Brushes.LightGray, null, new Rect(0, 0, ActualWidth, ActualHeight));
    dc.DrawLine(new Pen(Brushes.Blue, 1), new Point(0, 0), new Point(ActualWidth, ActualHeight));
}
```

`OnRender` 适合纯绘制，不适合放业务逻辑。数据变化时调用 `InvalidateVisual()` 触发重绘。

## 16. 验证、错误提示与表单体验

### 16.1 基于异常的验证

简单方式：

```xml
<TextBox Text="{Binding Age,
                        UpdateSourceTrigger=PropertyChanged,
                        ValidatesOnExceptions=True}"/>
```

如果 setter 抛异常，WPF 会显示验证错误。但这种方式把验证和异常混在一起，不适合复杂表单。

### 16.2 IDataErrorInfo

传统同步验证接口：

```csharp
public sealed class UserFormViewModel : ViewModelBase, IDataErrorInfo
{
    public string Name { get; set; } = string.Empty;

    public string Error => string.Empty;

    public string this[string columnName]
    {
        get
        {
            if (columnName == nameof(Name) && string.IsNullOrWhiteSpace(Name))
            {
                return "姓名不能为空";
            }

            return string.Empty;
        }
    }
}
```

XAML：

```xml
<TextBox Text="{Binding Name,
                        UpdateSourceTrigger=PropertyChanged,
                        ValidatesOnDataErrors=True}"/>
```

### 16.3 INotifyDataErrorInfo

更现代、支持异步和多错误：

```csharp
public sealed class UserFormViewModel : ViewModelBase, INotifyDataErrorInfo
{
    private readonly Dictionary<string, List<string>> _errors = new();

    public bool HasErrors => _errors.Count > 0;

    public event EventHandler<DataErrorsChangedEventArgs>? ErrorsChanged;

    public IEnumerable GetErrors(string? propertyName)
    {
        if (propertyName is null)
        {
            return Enumerable.Empty<string>();
        }

        return _errors.TryGetValue(propertyName, out var errors)
            ? errors
            : Enumerable.Empty<string>();
    }

    private void SetErrors(string propertyName, IEnumerable<string> errors)
    {
        var list = errors.ToList();
        if (list.Count == 0)
        {
            _errors.Remove(propertyName);
        }
        else
        {
            _errors[propertyName] = list;
        }

        ErrorsChanged?.Invoke(this, new DataErrorsChangedEventArgs(propertyName));
        OnPropertyChanged(nameof(HasErrors));
    }
}
```

XAML：

```xml
<TextBox Text="{Binding Name,
                        UpdateSourceTrigger=PropertyChanged,
                        ValidatesOnNotifyDataErrors=True}"/>
```

### 16.4 错误展示样式

```xml
<Style TargetType="TextBox">
    <Style.Triggers>
        <Trigger Property="Validation.HasError" Value="True">
            <Setter Property="BorderBrush" Value="#DC2626"/>
            <Setter Property="ToolTip"
                    Value="{Binding RelativeSource={RelativeSource Self},
                                    Path=(Validation.Errors)[0].ErrorContent}"/>
        </Trigger>
    </Style.Triggers>
</Style>
```

表单体验建议：

- 必填、格式、范围、业务规则分层处理。
- 输入中即时验证，提交时全量验证。
- 错误文案要说明如何修复。
- 不要只用红色表达错误，要有文本提示。
- 禁用提交按钮时最好给出原因。

## 17. 导航、窗口、对话框与应用生命周期

### 17.1 多窗口应用

打开窗口：

```csharp
var window = new SettingsWindow
{
    Owner = Application.Current.MainWindow,
    DataContext = new SettingsViewModel()
};
window.ShowDialog();
```

设置 Owner 很重要，它影响窗口层级、任务栏行为和模态关系。

### 17.2 页面导航

简单桌面应用通常不需要 WPF `NavigationWindow`，用 `ContentControl + CurrentViewModel + DataTemplate` 更直接：

```xml
<ContentControl Content="{Binding CurrentPage}"/>
```

```csharp
public ViewModelBase CurrentPage
{
    get => _currentPage;
    set => SetProperty(ref _currentPage, value);
}
```

资源中映射：

```xml
<DataTemplate DataType="{x:Type vm:OrdersViewModel}">
    <views:OrdersView/>
</DataTemplate>
```

这种方式天然 MVVM 友好，页面切换就是切换 ViewModel。

### 17.3 托盘与单实例

WPF 本身没有高级托盘封装，可使用 `System.Windows.Forms.NotifyIcon` 或第三方库。单实例可用 Mutex：

```csharp
private static Mutex? _mutex;

protected override void OnStartup(StartupEventArgs e)
{
    _mutex = new Mutex(true, "MyApp.SingleInstance", out var created);
    if (!created)
    {
        Shutdown();
        return;
    }

    base.OnStartup(e);
}
```

真实项目还需要把第二次启动的命令行参数传给已有实例，可通过命名管道、本地 socket 或 Windows 消息实现。

### 17.4 全局异常处理

```csharp
protected override void OnStartup(StartupEventArgs e)
{
    DispatcherUnhandledException += OnDispatcherUnhandledException;
    AppDomain.CurrentDomain.UnhandledException += OnUnhandledException;
    TaskScheduler.UnobservedTaskException += OnUnobservedTaskException;
    base.OnStartup(e);
}
```

全局异常处理用于兜底日志和友好提示，不应该代替局部错误处理。业务可预期错误应在命令中捕获并展示。

## 18. 文件、配置、本地化与资源管理

### 18.1 资源文件类型

WPF 中常见文件构建操作：

- `Resource`：编译进程序集，可用 pack URI。
- `Content`：随输出复制到目录。
- `EmbeddedResource`：嵌入程序集，常用于 resx。
- `None`：普通项目文件。

图片资源：

```xml
<Image Source="/Assets/logo.png"/>
```

跨程序集：

```xml
<Image Source="pack://application:,,,/MyLibrary;component/Assets/logo.png"/>
```

### 18.2 配置

现代 .NET WPF 可以使用 `Microsoft.Extensions.Configuration`：

```csharp
var configuration = new ConfigurationBuilder()
    .SetBasePath(AppContext.BaseDirectory)
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .Build();
```

`appsettings.json` 设置为复制到输出目录。对于用户级配置，应放到 `%AppData%` 或 `%LocalAppData%`，不要写程序安装目录。

### 18.3 本地化

简单项目可以用 `.resx`：

```csharp
Properties.Resources.Save
```

XAML 中可以通过 `x:Static` 引用资源，或使用自定义 markup extension。复杂项目需要考虑运行时切换语言、日期数字格式、布局伸缩、文本长度变化。

本地化建议：

- UI 不要硬编码所有中文字符串。
- 按模块拆资源文件。
- 给按钮和表头预留更长文本空间。
- 不要用固定宽度压死文本。
- 格式化金额、日期、数字时使用 CultureInfo。

## 19. 性能优化与内存泄漏排查

### 19.1 性能问题分类

WPF 性能问题常见类型：

- 启动慢。
- 页面首次打开慢。
- 滚动卡顿。
- 输入延迟。
- 大数据列表卡。
- UI 线程被阻塞。
- 内存持续上涨。
- 动画掉帧。
- 绑定错误过多。

优化前先测量。不要凭感觉改样式和代码。Visual Studio Diagnostic Tools、PerfView、dotnet-trace、WPF binding trace、Live Visual Tree 都可以帮助定位。

### 19.2 绑定性能

绑定错误会输出到调试窗口，必须清理。大量绑定失败不仅污染日志，也有性能成本。

常见错误：

```text
System.Windows.Data Error: 40 : BindingExpression path error
```

处理方法：

- 检查 DataContext。
- 检查属性名拼写。
- 检查 DataTemplate 内外层上下文。
- 检查 RelativeSource。
- 检查属性是否 public。

不要忽略绑定错误。它们通常是 UI bug 的早期信号。

### 19.3 虚拟化

列表大数据必须依赖虚拟化：

```xml
<ListBox VirtualizingPanel.IsVirtualizing="True"
         VirtualizingPanel.VirtualizationMode="Recycling"
         ScrollViewer.CanContentScroll="True"/>
```

会导致虚拟化失效的常见做法：

- 外层套 StackPanel。
- 设置 `ScrollViewer.CanContentScroll=False`。
- 使用不支持虚拟化的 ItemsPanel。
- 过度复杂的 ItemTemplate。
- 分组后未启用分组虚拟化。

### 19.4 视觉树过重

每个控件都是对象，控件模板还会展开很多视觉元素。几千行数据乘以复杂模板，很容易变成十几万个视觉对象。

优化策略：

- 简化 DataTemplate。
- 用 TextBlock 代替不必要的 Label。
- 避免每个单元格放 ComboBox、Button、复杂 Border。
- 使用样式共享资源。
- 对绘图密集场景使用 DrawingVisual/OnRender。
- 不可见区域不要提前创建复杂控件。

### 19.5 Freezable

Brush、Geometry、Transform 等很多对象继承 `Freezable`。如果对象不再变化，可以 Freeze：

```csharp
var brush = new SolidColorBrush(Colors.Red);
brush.Freeze();
```

冻结后对象不可变，WPF 可以减少变更跟踪成本，也更容易跨线程安全使用。资源字典里的共享画刷通常可冻结，但动态主题资源不适合冻结。

### 19.6 事件导致内存泄漏

典型泄漏：

```csharp
someService.Changed += OnChanged;
```

如果 `someService` 生命周期比 ViewModel 长，而 ViewModel 不取消订阅，ViewModel 就无法回收。

处理：

```csharp
public void Dispose()
{
    _service.Changed -= OnChanged;
}
```

也可以使用 WeakEventManager：

```csharp
WeakEventManager<SomeService, EventArgs>.AddHandler(
    _service,
    nameof(SomeService.Changed),
    OnChanged);
```

### 19.7 Timer 泄漏

`DispatcherTimer` 会持有 Tick 事件订阅者。如果页面关闭后不 Stop 和取消订阅，也可能泄漏：

```csharp
_timer.Stop();
_timer.Tick -= OnTick;
```

### 19.8 Image 缓存与文件占用

默认 BitmapImage 可能持有文件句柄。需要释放文件占用时：

```csharp
var bitmap = new BitmapImage();
bitmap.BeginInit();
bitmap.CacheOption = BitmapCacheOption.OnLoad;
bitmap.UriSource = new Uri(path);
bitmap.EndInit();
bitmap.Freeze();
```

### 19.9 UI 线程阻塞排查

如果界面卡住，重点查：

- 是否在 UI 线程执行同步 I/O。
- 是否 `.Wait()` 或 `.Result`。
- 是否大量绑定刷新。
- 是否 CollectionView 频繁 Refresh。
- 是否布局递归过深。
- 是否在属性 getter 做数据库访问或复杂计算。
- 是否频繁创建和销毁窗口/控件。

### 19.10 启动优化

策略：

- 延迟加载非首屏模块。
- 首屏先显示骨架或进度。
- 避免启动时同步访问网络。
- 合并资源字典，但不要把所有主题一次性加载。
- 减少 App.xaml 全局隐式样式的复杂度。
- 发布 Release、自包含/单文件策略按需求评估。

## 20. 部署、发布与版本更新

### 20.1 发布方式

现代 .NET WPF 发布方式：

```powershell
dotnet publish -c Release -r win-x64 --self-contained false
```

自包含：

```powershell
dotnet publish -c Release -r win-x64 --self-contained true
```

区别：

- Framework-dependent：体积小，目标机器需要安装对应 .NET Desktop Runtime。
- Self-contained：体积大，自带运行时，部署更稳定。

### 20.2 单文件发布

```xml
<PublishSingleFile>true</PublishSingleFile>
<SelfContained>true</SelfContained>
<RuntimeIdentifier>win-x64</RuntimeIdentifier>
```

WPF 单文件发布要测试资源、插件、反射、配置文件、原生 DLL 加载路径。不要只看 exe 能启动。

### 20.3 安装包

常见方案：

- ClickOnce：简单发布和更新。
- MSIX：现代 Windows 安装包。
- WiX Toolset：传统 MSI，企业部署强。
- Inno Setup/NSIS：轻量灵活。
- Squirrel 或自研更新器：应用内自动更新。

企业内部系统更关注静默安装、自动更新、回滚、日志、代理、权限和离线环境。

### 20.4 版本更新

更新系统要考虑：

- 当前运行中如何替换文件。
- 更新失败如何回滚。
- 配置和用户数据兼容。
- 数据库或本地缓存迁移。
- 插件版本兼容。
- 强制更新和灰度更新。
- 更新包校验签名。

不要让客户端启动后无条件下载并执行未校验文件。这是明显安全风险。

## 21. 测试、调试与工程化实践

### 21.1 ViewModel 单元测试

MVVM 的一个好处是 ViewModel 可测试：

```csharp
[Fact]
public async Task LoadCommand_LoadsOrders()
{
    var service = new FakeOrderService();
    var vm = new OrdersViewModel(service);

    await vm.LoadAsync();

    Assert.NotEmpty(vm.Orders);
    Assert.False(vm.IsLoading);
}
```

要做到这一点，ViewModel 不能直接依赖 Window、MessageBox、静态数据库连接。依赖应通过接口传入。

### 21.2 UI 自动化测试

WPF 可以使用 UI Automation、FlaUI、Appium Windows Driver 等工具做端到端测试。关键是给控件设置稳定 AutomationId：

```xml
<Button Content="保存"
        AutomationProperties.AutomationId="SaveButton"
        Command="{Binding SaveCommand}"/>
```

不要让 UI 测试依赖显示文本，文本可能本地化或变化。

### 21.3 调试绑定

可以开启绑定 trace：

```xml
<TextBlock Text="{Binding UserName,
                         PresentationTraceSources.TraceLevel=High}"/>
```

调试时查看 Output 窗口。绑定问题不要靠猜，先看 DataContext 和路径。

### 21.4 日志

桌面应用也需要日志：

- 启动参数、版本、操作系统、运行时版本。
- 未处理异常。
- 后端接口错误。
- 本地文件访问错误。
- 更新过程。
- 用户关键操作，注意隐私和合规。

日志目录建议放在 `%LocalAppData%\Company\Product\Logs`，并做滚动和清理。

### 21.5 项目规范

建议：

- 开启 nullable。
- XAML 资源按模块拆分。
- 命名统一：View、ViewModel、Service。
- ViewModel 不引用具体 View。
- 禁止 UI 线程同步等待异步任务。
- 绑定错误视为需要修复的问题。
- 大控件模板必须有性能评估。
- 关键命令要有单元测试。

## 22. 常见坑与排查清单

### 22.1 界面不更新

检查：

- ViewModel 是否实现 `INotifyPropertyChanged`。
- setter 是否调用 `OnPropertyChanged`。
- 属性是否 public。
- DataContext 是否正确。
- 绑定路径是否拼错。
- 是否在 DataTemplate 中上下文已变。
- 是否跨线程修改集合。

### 22.2 Button 不可点击或命令不执行

检查：

- `Command` 是否绑定成功。
- `CanExecute` 是否返回 false。
- `CanExecuteChanged` 是否触发。
- Button 是否被透明元素遮挡。
- 父控件是否 IsEnabled=false。
- 是否命令参数类型不匹配导致内部异常。

### 22.3 样式不生效

检查：

- 资源字典是否合并。
- key 是否写错。
- TargetType 是否匹配。
- 本地值是否覆盖 Setter。
- 模板里是否没有使用 TemplateBinding。
- 样式作用域是否在使用点之前。

### 22.4 列表滚动卡顿

检查：

- 虚拟化是否开启。
- 外层是否 StackPanel。
- ItemTemplate 是否过重。
- 是否加载过多图片。
- 是否每行都有复杂控件。
- 是否绑定错误大量输出。
- 是否属性 getter 做耗时计算。

### 22.5 内存越来越高

检查：

- 长生命周期服务事件是否未退订。
- Timer 是否未停止。
- Messenger/EventAggregator 是否强引用订阅者。
- Window 关闭后是否仍被集合持有。
- BitmapImage 是否持有文件或缓存。
- 静态集合是否缓存 View/ViewModel。
- 第三方控件是否需要显式 Dispose。

### 22.6 右键菜单命令绑定不到

检查：

- ContextMenu 是否脱离视觉树。
- 是否需要绑定 `PlacementTarget.DataContext`。
- MenuItem DataContext 是否是当前行对象还是外层 ViewModel。
- CommandParameter 是否传对。

### 22.7 设计器无法加载

检查：

- 构造函数是否访问真实数据库或网络。
- 是否在设计时执行运行时逻辑。
- 是否缺少默认构造函数。
- 资源字典路径是否错误。
- 第三方控件许可证或运行时依赖是否缺失。

可以用设计时判断：

```csharp
if (DesignerProperties.GetIsInDesignMode(this))
{
    return;
}
```

### 22.8 高 DPI 模糊

检查：

- 应用 manifest DPI 设置。
- 图片资源是否足够清晰。
- 是否使用 LayoutRounding。
- 是否文本或线条落在半像素。
- 是否嵌入 WinForms/Win32 控件导致 DPI 行为不同。

可设置：

```xml
<Application.Resources>
    <Style TargetType="{x:Type Control}">
        <Setter Property="UseLayoutRounding" Value="True"/>
        <Setter Property="SnapsToDevicePixels" Value="True"/>
    </Style>
</Application.Resources>
```

不要盲目全局设置影响所有控件，先测试视觉结果。

## 23. 学习路线与源码阅读建议

### 23.1 学习顺序

推荐顺序：

1. 掌握基本 XAML、Window、Grid、StackPanel、常用控件。
2. 理解 DataContext 和 Binding。
3. 实现 `INotifyPropertyChanged` 和 `ICommand`。
4. 写一个完整 MVVM 页面：查询、列表、详情、保存。
5. 学习资源、样式、DataTemplate。
6. 学习依赖属性和附加属性。
7. 学习路由事件和命令系统。
8. 学习 DataGrid、CollectionView、验证。
9. 学习 Dispatcher、异步、进度和取消。
10. 学习控件模板、自定义控件。
11. 学习性能优化、虚拟化和内存泄漏排查。
12. 学习部署、自动更新、日志和测试。

不要一开始就沉迷换肤和复杂动画。WPF 企业开发最核心的是布局、绑定、MVVM、资源和性能。

### 23.2 一个练手项目

建议做一个“订单管理客户端”：

- 左侧导航：仪表盘、订单、客户、设置。
- 订单页：搜索、筛选、DataGrid、分页。
- 详情页：表单编辑、验证、保存命令。
- 状态栏：当前用户、网络状态、后台任务。
- 主题：浅色/深色切换。
- 异步：模拟接口加载和取消。
- 错误：统一消息提示和日志。
- 部署：发布为 win-x64 自包含版本。

这个项目能覆盖 WPF 绝大多数核心能力，比单独写按钮和文本框有效得多。

### 23.3 面试级高频问题

1. WPF 为什么适合 MVVM？
   - 因为它有强大的数据绑定、命令系统、通知机制、资源模板和 DataContext 继承。View 可以声明绑定，ViewModel 暴露状态和行为，不需要 View 直接调用业务逻辑。

2. 依赖属性和普通属性区别是什么？
   - 依赖属性由 WPF 属性系统管理，支持绑定、样式、动画、默认值、继承、变更回调和值优先级；普通 CLR 属性只是对象字段封装。

3. DataContext 是什么？
   - 绑定默认源。它会沿元素树继承。ItemsControl 的项模板中，DataContext 通常变为当前项。

4. 路由事件是什么？
   - 可以沿元素树传播的事件，支持冒泡、隧道和直接路由。它让父元素可以统一处理子元素事件。

5. Command 和 Click 的区别是什么？
   - Click 是具体控件事件；Command 是语义动作，可以被按钮、菜单、快捷键等多个输入源触发，并支持 CanExecute 自动控制可用状态。

6. 为什么 UI 线程不能直接做耗时任务？
   - UI 线程负责输入、布局、事件和应用代码。耗时任务会阻塞消息处理，导致界面卡死。

7. 如何解决 WPF 内存泄漏？
   - 重点检查事件订阅、Timer、静态引用、Messenger、未关闭窗口、图片缓存、第三方控件资源。长生命周期对象引用短生命周期对象是最常见原因。

8. UserControl 为什么不建议直接 `DataContext=this`？
   - 会覆盖外部传入的 DataContext，导致父视图绑定失效。UserControl 应通过依赖属性暴露接口，内部用 RelativeSource 绑定自身。

9. DataGrid 卡顿怎么排查？
   - 检查虚拟化、模板复杂度、数据量、绑定错误、属性 getter、外层布局、刷新频率和图片加载。

10. StaticResource 与 DynamicResource 区别？
    - StaticResource 加载时解析，性能更好；DynamicResource 运行时解析并响应资源变化，适合主题切换。

## 24. 参考资料

- Microsoft Learn：Windows Presentation Foundation 文档  
  https://learn.microsoft.com/en-us/dotnet/desktop/wpf/
- Microsoft Learn：WPF overview  
  https://learn.microsoft.com/en-us/dotnet/desktop/wpf/overview/
- Microsoft Learn：XAML overview  
  https://learn.microsoft.com/en-us/dotnet/desktop/wpf/xaml/
- Microsoft Learn：Data binding overview  
  https://learn.microsoft.com/en-us/dotnet/desktop/wpf/data/
- Microsoft Learn：Dependency properties overview  
  https://learn.microsoft.com/en-us/dotnet/desktop/wpf/properties/dependency-properties-overview
- Microsoft Learn：Routed events overview  
  https://learn.microsoft.com/en-us/dotnet/desktop/wpf/events/routed-events-overview
- Microsoft Learn：Commanding overview  
  https://learn.microsoft.com/en-us/dotnet/desktop/wpf/advanced/commanding-overview
- Microsoft Learn：Styles and templates  
  https://learn.microsoft.com/en-us/dotnet/desktop/wpf/controls/styles-templates-overview
- Microsoft Learn：XAML resources overview  
  https://learn.microsoft.com/en-us/dotnet/desktop/wpf/systems/xaml-resources-overview
- Microsoft Learn：Threading model  
  https://learn.microsoft.com/en-us/dotnet/desktop/wpf/advanced/threading-model
- Microsoft Learn：Optimizing WPF application performance  
  https://learn.microsoft.com/en-us/dotnet/desktop/wpf/advanced/optimizing-wpf-application-performance
- Microsoft Learn：What's new in WPF for .NET 10  
  https://learn.microsoft.com/en-us/dotnet/desktop/wpf/whats-new/net100
- GitHub：dotnet/wpf  
  https://github.com/dotnet/wpf

## 附录：WPF 项目上线检查表

上线前建议逐项检查：

- 项目目标框架明确，`TargetFramework` 使用 `netX.0-windows`。
- Release 发布包在干净机器验证过。
- 首屏启动没有同步网络请求。
- 全局异常、日志、配置加载已处理。
- ViewModel 不直接依赖具体 View。
- 命令有 CanExecute，并处理重复点击。
- 所有绑定错误已清理。
- DataGrid/ListView 大数据虚拟化已验证。
- 长任务使用 async/await、进度和取消。
- UI 线程没有 `.Result`、`.Wait()`、Thread.Sleep。
- 事件订阅、Timer、Messenger 有释放策略。
- 图片加载不长期占用文件句柄。
- 表单验证有清晰错误提示。
- 右键菜单、DataTemplate 内命令绑定经过测试。
- 高 DPI、不同字体缩放、不同分辨率下布局正常。
- 浅色/深色或主题资源切换无明显异常。
- 安装、卸载、升级、回滚流程经过验证。
- 用户配置和日志写入用户目录，而不是程序安装目录。
- 自动更新包有签名或哈希校验。
- 关键 ViewModel 有单元测试。
- 关键 UI 流程有自动化或手工回归清单。

WPF 的真正难点不是“会拖控件”，而是理解它背后的系统：XAML 创建对象树，布局系统决定尺寸，依赖属性承载可绑定状态，路由事件描述输入传播，绑定系统连接 View 和 ViewModel，资源与模板决定外观，Dispatcher 维护 UI 线程秩序。把这些机制连起来看，WPF 就不是一堆零散 API，而是一套成熟的 Windows 桌面应用开发模型。
