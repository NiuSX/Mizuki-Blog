# Flutter 万字精讲

## 目录

1. Flutter 是什么
2. Flutter 的核心优势与适用场景
3. Flutter 的整体架构
4. Dart 语言基础
5. Widget 思想
6. StatelessWidget 与 StatefulWidget
7. BuildContext、Element、RenderObject
8. 布局系统
9. 常用基础组件
10. 状态管理
11. 路由与导航
12. 网络请求与数据解析
13. 本地存储
14. 异步编程
15. 平台能力与插件
16. 动画
17. 性能优化
18. 工程结构
19. 测试与调试
20. 常见反模式
21. 学习路线与落地清单

## 1. Flutter 是什么

Flutter 是 Google 推出的跨平台 UI 框架。它使用 Dart 语言开发，可以用一套代码构建 Android、iOS、Web、Windows、macOS、Linux 等多个平台的应用。

Flutter 最重要的特点是：它不是简单地调用原生平台控件，而是自己带了一套渲染体系。Flutter 应用中的按钮、文本、列表、动画、手势，大部分都由 Flutter 框架自己绘制。这让它在不同平台上能保持高度一致的 UI 表现，也让它有很强的自定义能力。

传统跨平台方案经常面临两个问题：

- UI 表现依赖平台原生控件，不同平台差异较大。
- 性能、动画和复杂界面容易受到桥接层影响。

Flutter 的思路是：用 Dart 描述界面，用 Flutter Engine 直接渲染。开发者写的是声明式 UI，框架负责把 Widget 树转换成可绘制的界面。

一句话概括：

> Flutter 是一个使用 Dart 语言、通过自绘渲染实现多平台一致体验的声明式 UI 框架。

## 2. Flutter 的核心优势与适用场景

### 2.1 核心优势

Flutter 的优势主要体现在以下几个方面。

第一，跨平台效率高。一个团队可以用一套主要代码覆盖 Android 和 iOS，很多业务页面、组件、动画、网络层、状态管理逻辑都能复用。

第二，UI 一致性强。因为 Flutter 自己绘制界面，所以同一个 Widget 在不同平台上的表现更可控，特别适合对视觉一致性要求高的产品。

第三，开发体验好。Flutter 支持 Hot Reload，修改代码后可以快速看到界面变化。对于 UI 调试、样式调整、状态验证非常高效。

第四，组件体系完整。Flutter 内置了大量 Material Design 和 Cupertino 风格组件，也支持自定义绘制、动画、手势、主题等能力。

第五，性能上限较高。Flutter 直接使用 Skia 或 Impeller 等渲染能力，在复杂动画和自定义 UI 上通常比基于 WebView 的方案更有优势。

### 2.2 适用场景

Flutter 适合：

- 中小型移动应用。
- 对 Android 和 iOS UI 一致性要求高的应用。
- 业务迭代快、团队希望统一技术栈的产品。
- 自定义 UI、动效、仪表盘、工具类应用。
- 需要同时覆盖移动端和部分桌面端的应用。
- 创业团队或小团队快速验证产品。

Flutter 不一定适合：

- 极度依赖大量原生 SDK 的应用。
- 对原生平台细节体验要求非常高的复杂系统应用。
- 已有大量成熟原生代码、迁移成本极高的项目。
- 团队完全没有 Dart/Flutter 经验且项目周期极短的高风险项目。
- 对包体积极其敏感的小型功能。

选型时要看团队能力、已有代码资产、平台能力依赖、UI 复杂度、性能要求和长期维护成本。Flutter 很强，但不是所有项目的默认答案。

## 3. Flutter 的整体架构

Flutter 可以粗略分为三层：

```text
Framework 层：Dart 编写，包含 Widget、动画、手势、绘制、Material、Cupertino
Engine 层：C/C++ 编写，负责渲染、文本、Dart Runtime、平台通道
Embedder 层：平台嵌入层，负责把 Flutter 接入 Android、iOS、桌面等系统
```

### 3.1 Framework 层

Framework 是开发者最常接触的层。我们写的 `Widget`、`StatefulWidget`、`AnimationController`、`Navigator`、`Theme` 都属于这一层。

Framework 负责：

- 组件系统。
- 布局系统。
- 手势系统。
- 动画系统。
- 语义和无障碍。
- Material 和 Cupertino 组件。
- 基础绘制抽象。

### 3.2 Engine 层

Engine 负责更底层的能力：

- Dart 运行时。
- 图形渲染。
- 文本排版。
- 图片解码。
- 平台消息通道。
- 帧调度。

开发者一般不会直接修改 Engine，但理解它的存在有助于理解 Flutter 为什么能自绘 UI。

### 3.3 Embedder 层

Embedder 是平台适配层。Android、iOS、Windows、macOS、Linux 都有对应的嵌入实现。它负责创建 Flutter 运行环境，并与平台生命周期、输入事件、窗口系统对接。

例如在 Android 中，Flutter 可以运行在 `FlutterActivity` 或 `FlutterFragment` 中；在 iOS 中，它可以运行在 `FlutterViewController` 中。

## 4. Dart 语言基础

Flutter 使用 Dart。学习 Flutter 前，需要掌握 Dart 的几个核心点。

### 4.1 变量与类型

Dart 是类型安全语言，支持类型推断：

```dart
void main() {
  var name = 'Alice';
  int age = 20;
  double price = 12.5;
  bool active = true;
  String title = 'Flutter';
}
```

`var` 会根据初始值推断类型。推断后类型固定，不是动态类型。

如果确实需要动态类型，可以使用 `dynamic`，但在业务代码中要谨慎：

```dart
dynamic value = 'text';
value = 100;
```

### 4.2 空安全

Dart 支持空安全。默认变量不能为 null：

```dart
String name = 'Alice';
// name = null; // 编译错误
```

允许为空要加 `?`：

```dart
String? nickname;
```

使用可空值时需要判断：

```dart
if (nickname != null) {
  print(nickname.length);
}
```

也可以使用 `??` 提供默认值：

```dart
final displayName = nickname ?? '未命名';
```

空安全能显著减少运行时空指针问题，但前提是不要滥用 `!`。`value!` 表示强制认为不为空，如果判断错了会直接崩溃。

### 4.3 函数

Dart 中函数是一等公民，可以赋值、传参、返回：

```dart
int add(int a, int b) {
  return a + b;
}

final sum = add(1, 2);
```

箭头函数适合简单表达式：

```dart
int doubleValue(int value) => value * 2;
```

命名参数非常常见：

```dart
void createUser({
  required String name,
  int age = 0,
}) {
  print('$name $age');
}
```

Flutter 组件大量使用命名参数：

```dart
Text(
  'Hello',
  style: TextStyle(fontSize: 16),
)
```

### 4.4 类

Dart 是面向对象语言：

```dart
class User {
  final String id;
  final String name;

  const User({
    required this.id,
    required this.name,
  });
}
```

`final` 表示字段初始化后不可变。Flutter 中推荐大量使用不可变对象，因为声明式 UI 和状态管理都更依赖不可变数据。

### 4.5 Future 与 Stream

异步编程中最常见的是 `Future` 和 `Stream`。

`Future` 表示未来完成的一次结果：

```dart
Future<String> fetchName() async {
  await Future.delayed(Duration(seconds: 1));
  return 'Alice';
}
```

`Stream` 表示一连串异步数据：

```dart
Stream<int> count() async* {
  for (var i = 0; i < 3; i++) {
    await Future.delayed(Duration(seconds: 1));
    yield i;
  }
}
```

网络请求通常是 `Future`，数据库观察、事件流、WebSocket 更适合 `Stream`。

## 5. Widget 思想

Flutter 中一切皆 Widget。按钮是 Widget，文本是 Widget，布局是 Widget，动画是 Widget，主题也是 Widget。

Widget 本质上是界面的声明。它描述“界面应该是什么样”，而不是直接操作屏幕上的对象。

例如：

```dart
Widget build(BuildContext context) {
  return Column(
    children: [
      Text('标题'),
      ElevatedButton(
        onPressed: () {},
        child: Text('提交'),
      ),
    ],
  );
}
```

这段代码不是在命令式地创建和销毁原生控件，而是在声明当前 UI 结构。Flutter 根据 Widget 树计算变化，再更新底层渲染对象。

### 5.1 Widget 是不可变的

Widget 通常是不可变对象：

```dart
class UserCard extends StatelessWidget {
  final String name;

  const UserCard({
    super.key,
    required this.name,
  });

  @override
  Widget build(BuildContext context) {
    return Text(name);
  }
}
```

当数据变化时，不是修改旧 Widget，而是创建新的 Widget 描述。Flutter 会对比新旧结构并更新界面。

### 5.2 组合优于继承

Flutter UI 主要通过组合构建。一个复杂页面由很多小 Widget 组合而成：

```dart
class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('个人主页')),
      body: Column(
        children: [
          Avatar(),
          UserInfo(),
          ActionButtons(),
        ],
      ),
    );
  }
}
```

拆 Widget 的目的不是为了文件数量，而是为了让每个组件职责清晰、重建范围可控、代码可读。

## 6. StatelessWidget 与 StatefulWidget

### 6.1 StatelessWidget

`StatelessWidget` 表示自身不持有可变状态。它的 UI 完全由外部传入参数决定：

```dart
class GreetingText extends StatelessWidget {
  final String name;

  const GreetingText({
    super.key,
    required this.name,
  });

  @override
  Widget build(BuildContext context) {
    return Text('Hello $name');
  }
}
```

如果 `name` 变化，父组件会传入新的值，Flutter 重建这个 Widget。

### 6.2 StatefulWidget

`StatefulWidget` 用于组件内部需要维护状态的场景，例如计数器、输入框、动画控制器、Tab 控制器等。

```dart
class CounterPage extends StatefulWidget {
  const CounterPage({super.key});

  @override
  State<CounterPage> createState() => _CounterPageState();
}

class _CounterPageState extends State<CounterPage> {
  int count = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('$count'),
        ElevatedButton(
          onPressed: () {
            setState(() {
              count++;
            });
          },
          child: Text('增加'),
        ),
      ],
    );
  }
}
```

`setState` 的作用是告诉 Flutter：这个 State 中的数据变了，需要重新调用 `build`。

### 6.3 什么时候用 StatefulWidget

适合使用 StatefulWidget 的状态：

- 只属于某个局部组件。
- 生命周期和组件一致。
- 不需要跨页面共享。
- 不涉及复杂业务逻辑。

例如：

- 是否展开。
- 当前 Tab 下标。
- 输入框控制器。
- 动画控制器。
- 临时选中状态。

不适合只放在 StatefulWidget 的状态：

- 登录用户信息。
- 购物车数据。
- 文章列表数据。
- 多页面共享的业务状态。
- 需要缓存或恢复的复杂状态。

这些更适合使用状态管理方案。

## 7. BuildContext、Element、RenderObject

理解 Flutter 三棵树，有助于避免很多误解。

### 7.1 Widget Tree

Widget Tree 是开发者写出来的声明结构。Widget 很轻量，通常会频繁创建。

### 7.2 Element Tree

Element 是 Widget 的实例化挂载点。它连接 Widget 和 RenderObject，并管理生命周期。Flutter 更新界面时，会尽量复用 Element。

`BuildContext` 实际上就是 Element 的一个接口。平时拿到的 `context`，本质上代表当前 Widget 在树中的位置。

### 7.3 RenderObject Tree

RenderObject 负责真正的布局、绘制和命中测试。不是每个 Widget 都对应 RenderObject。比如 `StatelessWidget`、`StatefulWidget` 更多是组织结构，而 `RenderObjectWidget` 才会创建渲染对象。

### 7.4 为什么不要乱用 context

`BuildContext` 和位置相关。如果在错误的位置使用 context，可能找不到对应的 Provider、Navigator、Theme 或 Scaffold。

常见问题：

```dart
Scaffold.of(context).openDrawer();
```

如果这个 context 位于 Scaffold 之上，就找不到 Scaffold。解决方式可以使用 Builder：

```dart
Scaffold(
  body: Builder(
    builder: (context) {
      return ElevatedButton(
        onPressed: () => Scaffold.of(context).openDrawer(),
        child: Text('打开'),
      );
    },
  ),
)
```

## 8. 布局系统

Flutter 布局遵循一个非常重要的规则：

```text
父组件给约束，子组件选尺寸，父组件决定位置。
```

也就是说，父组件不会直接告诉子组件“你必须多大”，而是给出最大最小宽高范围。子组件在约束内选择自己的尺寸，然后父组件把它放到合适的位置。

### 8.1 Row 与 Column

`Row` 横向排列，`Column` 纵向排列。

```dart
Row(
  children: [
    Icon(Icons.person),
    SizedBox(width: 8),
    Text('Alice'),
  ],
)
```

`mainAxisAlignment` 控制主轴方向布局，`crossAxisAlignment` 控制交叉轴方向布局。

```dart
Column(
  mainAxisAlignment: MainAxisAlignment.center,
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Text('标题'),
    Text('内容'),
  ],
)
```

### 8.2 Expanded 与 Flexible

当 Row 或 Column 中的子组件需要占用剩余空间时，使用 `Expanded`：

```dart
Row(
  children: [
    Text('标题'),
    Expanded(
      child: Text(
        '很长很长的内容',
        overflow: TextOverflow.ellipsis,
      ),
    ),
  ],
)
```

`Expanded` 会强制子组件填满可用空间。`Flexible` 更灵活，允许子组件不一定填满。

### 8.3 Stack

`Stack` 用于叠放布局：

```dart
Stack(
  children: [
    Image.network(url),
    Positioned(
      right: 8,
      bottom: 8,
      child: Text('标签'),
    ),
  ],
)
```

适合头像角标、图片遮罩、悬浮按钮、复杂叠层。

### 8.4 ListView

列表使用 `ListView.builder` 更适合大量数据：

```dart
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    final item = items[index];
    return ListTile(
      title: Text(item.title),
    );
  },
)
```

不要对大量数据使用 `Column(children: items.map(...).toList())`，因为它会一次性构建所有子项。

### 8.5 常见布局错误

最常见的错误是无限约束。例如在 Column 中放一个没有高度约束的 ListView：

```dart
Column(
  children: [
    Text('标题'),
    ListView.builder(
      itemBuilder: (_, index) => Text('$index'),
    ),
  ],
)
```

Column 给 ListView 的高度可能是无限的，ListView 不知道自己应该多高。解决方式是包一层 Expanded：

```dart
Column(
  children: [
    Text('标题'),
    Expanded(
      child: ListView.builder(
        itemBuilder: (_, index) => Text('$index'),
      ),
    ),
  ],
)
```

## 9. 常用基础组件

### 9.1 MaterialApp

`MaterialApp` 是 Material 风格应用的入口：

```dart
MaterialApp(
  title: 'Demo',
  theme: ThemeData(
    colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
    useMaterial3: true,
  ),
  home: HomePage(),
)
```

它提供主题、路由、国际化、Navigator 等应用级能力。

### 9.2 Scaffold

`Scaffold` 提供页面基础结构：

```dart
Scaffold(
  appBar: AppBar(title: Text('首页')),
  body: HomeBody(),
  floatingActionButton: FloatingActionButton(
    onPressed: () {},
    child: Icon(Icons.add),
  ),
)
```

常用区域包括 `appBar`、`body`、`drawer`、`bottomNavigationBar`、`floatingActionButton`。

### 9.3 Text

文本组件：

```dart
Text(
  'Hello Flutter',
  style: TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.bold,
  ),
  maxLines: 1,
  overflow: TextOverflow.ellipsis,
)
```

### 9.4 Image

图片：

```dart
Image.asset('assets/logo.png')
Image.network('https://example.com/image.png')
```

网络图片在真实项目中通常会使用缓存库，例如 `cached_network_image`。

### 9.5 Container

`Container` 是组合型组件，可以设置尺寸、边距、内边距、装饰、对齐等：

```dart
Container(
  padding: EdgeInsets.all(16),
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(8),
  ),
  child: Text('内容'),
)
```

不要滥用 Container。如果只需要间距，用 `Padding`；只需要尺寸，用 `SizedBox`；只需要对齐，用 `Align`。使用更具体的组件能让代码更清晰。

### 9.6 GestureDetector 与 InkWell

`GestureDetector` 提供手势识别：

```dart
GestureDetector(
  onTap: () {},
  child: Text('点击'),
)
```

Material 风格点击水波纹可以使用 `InkWell`：

```dart
InkWell(
  onTap: () {},
  child: Padding(
    padding: EdgeInsets.all(12),
    child: Text('点击'),
  ),
)
```

## 10. 状态管理

状态管理是 Flutter 项目中最重要的话题之一。Flutter 本身提供 `setState`、`InheritedWidget`、`ValueNotifier` 等基础能力，社区也有 Provider、Riverpod、Bloc、GetX、MobX 等方案。

### 10.1 状态分类

先分清状态类型，比选择库更重要。

局部 UI 状态：

- 当前 Tab。
- 是否展开。
- 输入框内容。
- 动画进度。

页面业务状态：

- 页面加载中。
- 列表数据。
- 错误信息。
- 提交状态。

全局应用状态：

- 登录用户。
- 主题。
- 语言。
- 购物车。
- 权限状态。

不同状态适合不同管理方式。不要用全局状态管理解决所有问题，也不要用 `setState` 管所有业务。

### 10.2 setState

`setState` 适合局部简单状态：

```dart
class CounterPage extends StatefulWidget {
  const CounterPage({super.key});

  @override
  State<CounterPage> createState() => _CounterPageState();
}

class _CounterPageState extends State<CounterPage> {
  int count = 0;

  void increment() {
    setState(() {
      count++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: increment,
      child: Text('$count'),
    );
  }
}
```

如果状态开始跨组件、跨页面、涉及异步请求和复杂业务，就应该考虑更清晰的状态管理方式。

### 10.3 ValueNotifier

`ValueNotifier` 是轻量状态容器：

```dart
final counter = ValueNotifier<int>(0);

ValueListenableBuilder<int>(
  valueListenable: counter,
  builder: (context, value, child) {
    return Text('$value');
  },
)
```

适合简单可监听值，不适合复杂业务状态。

### 10.4 Provider

Provider 是经典状态管理方案，基于 InheritedWidget 封装，学习成本较低。

```dart
class CounterModel extends ChangeNotifier {
  int count = 0;

  void increment() {
    count++;
    notifyListeners();
  }
}
```

注入：

```dart
ChangeNotifierProvider(
  create: (_) => CounterModel(),
  child: App(),
)
```

使用：

```dart
final count = context.watch<CounterModel>().count;
```

触发：

```dart
context.read<CounterModel>().increment();
```

Provider 简单直接，但大型项目中 `ChangeNotifier` 容易变成可变状态大对象，需要团队规范。

### 10.5 Riverpod

Riverpod 是 Provider 作者推出的新方案，解决了很多 Provider 的限制。它不依赖 BuildContext，测试友好，组合能力强。

简单 provider：

```dart
final counterProvider = StateProvider<int>((ref) => 0);
```

使用：

```dart
class CounterPage extends ConsumerWidget {
  const CounterPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(counterProvider);

    return TextButton(
      onPressed: () => ref.read(counterProvider.notifier).state++,
      child: Text('$count'),
    );
  }
}
```

异步数据：

```dart
final userProvider = FutureProvider<User>((ref) async {
  final repository = ref.watch(userRepositoryProvider);
  return repository.fetchUser();
});
```

Riverpod 更适合中大型项目，但需要理解 provider 的生命周期和依赖关系。

### 10.6 Bloc

Bloc 强调事件输入和状态输出，适合团队协作和复杂业务流程：

```dart
sealed class LoginEvent {}

class LoginSubmitted extends LoginEvent {
  final String username;
  final String password;

  LoginSubmitted(this.username, this.password);
}

class LoginState {
  final bool loading;
  final String? error;

  const LoginState({
    this.loading = false,
    this.error,
  });
}
```

Bloc 的优点是流程清晰、测试性好；缺点是样板代码较多。复杂业务、金融、电商、企业级应用中，Bloc 的结构化优势比较明显。

### 10.7 状态管理选择建议

小页面、局部状态：`setState`、`ValueNotifier`。

中小项目：Provider 或 Riverpod。

复杂业务、强团队规范：Bloc 或 Riverpod。

不要因为库流行就引入。状态管理的目标是让状态变化可预测、可测试、可维护。

## 11. 路由与导航

### 11.1 Navigator 基础

Flutter 使用 Navigator 管理页面栈：

```dart
Navigator.of(context).push(
  MaterialPageRoute(
    builder: (_) => DetailPage(id: '1'),
  ),
);
```

返回：

```dart
Navigator.of(context).pop();
```

带返回值：

```dart
final result = await Navigator.of(context).push<String>(
  MaterialPageRoute(builder: (_) => SelectPage()),
);
```

### 11.2 命名路由

```dart
MaterialApp(
  routes: {
    '/': (_) => HomePage(),
    '/detail': (_) => DetailPage(),
  },
)
```

跳转：

```dart
Navigator.of(context).pushNamed('/detail');
```

命名路由简单，但复杂参数、深链、嵌套路由场景下会变得不够灵活。

### 11.3 go_router

真实项目中常用 `go_router` 管理路由：

```dart
final router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => HomePage(),
    ),
    GoRoute(
      path: '/article/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return ArticlePage(id: id);
      },
    ),
  ],
);
```

`MaterialApp.router`：

```dart
MaterialApp.router(
  routerConfig: router,
)
```

`go_router` 更适合 Web URL、深链、登录拦截和嵌套路由。

### 11.4 登录拦截

典型场景：未登录用户访问个人中心时跳转登录。

```dart
redirect: (context, state) {
  final loggedIn = authState.loggedIn;
  final loggingIn = state.matchedLocation == '/login';

  if (!loggedIn && !loggingIn) {
    return '/login';
  }
  if (loggedIn && loggingIn) {
    return '/';
  }
  return null;
}
```

路由守卫要避免死循环，也要考虑登录后回到原目标页面。

## 12. 网络请求与数据解析

### 12.1 常用网络库

Flutter 中常见网络方案：

- `http`：官方基础库，简单轻量。
- `dio`：功能更完整，支持拦截器、取消请求、文件上传下载、超时配置。
- `retrofit.dart`：基于 dio 的声明式 API。

中大型项目常用 dio。

### 12.2 dio 示例

```dart
final dio = Dio(
  BaseOptions(
    baseUrl: 'https://api.example.com',
    connectTimeout: Duration(seconds: 10),
    receiveTimeout: Duration(seconds: 10),
  ),
);

final response = await dio.get('/articles');
```

拦截器：

```dart
dio.interceptors.add(
  InterceptorsWrapper(
    onRequest: (options, handler) {
      options.headers['Authorization'] = 'Bearer token';
      handler.next(options);
    },
    onError: (error, handler) {
      handler.next(error);
    },
  ),
);
```

### 12.3 数据模型

手写 JSON 解析：

```dart
class ArticleDto {
  final String id;
  final String title;

  const ArticleDto({
    required this.id,
    required this.title,
  });

  factory ArticleDto.fromJson(Map<String, dynamic> json) {
    return ArticleDto(
      id: json['id'] as String,
      title: json['title'] as String,
    );
  }
}
```

中大型项目更推荐使用 `json_serializable` 或 `freezed` 生成代码，减少手写解析错误。

### 12.4 Repository

网络层不应该直接暴露给 UI。推荐通过 Repository：

```dart
class ArticleRepository {
  final ArticleApi api;

  ArticleRepository(this.api);

  Future<List<Article>> fetchArticles() async {
    final dtos = await api.fetchArticles();
    return dtos.map((dto) => dto.toDomain()).toList();
  }
}
```

UI 层拿到的是业务模型或 UI 状态，而不是接口响应细节。

## 13. 本地存储

Flutter 常见本地存储方案：

- `shared_preferences`：简单键值。
- `flutter_secure_storage`：安全存储 token 等敏感信息。
- `sqflite`：SQLite 数据库。
- `drift`：类型安全数据库封装。
- `isar`、`hive`：本地 NoSQL 存储。

### 13.1 shared_preferences

适合保存简单配置：

```dart
final prefs = await SharedPreferences.getInstance();
await prefs.setBool('dark_mode', true);
final darkMode = prefs.getBool('dark_mode') ?? false;
```

不适合保存复杂业务数据或敏感信息。

### 13.2 secure storage

保存 token：

```dart
final storage = FlutterSecureStorage();
await storage.write(key: 'access_token', value: token);
final token = await storage.read(key: 'access_token');
```

敏感数据不要直接放 shared_preferences。

### 13.3 数据库

有复杂查询、关系数据、离线缓存时，应使用数据库。Repository 负责隐藏具体数据库实现，不要让 UI 直接操作数据库。

```dart
class UserRepository {
  final UserLocalDataSource local;
  final UserRemoteDataSource remote;

  UserRepository({
    required this.local,
    required this.remote,
  });
}
```

## 14. 异步编程

Flutter 应用大量依赖异步：网络、数据库、动画、文件、平台通道都可能是异步。

### 14.1 async/await

```dart
Future<void> load() async {
  try {
    final articles = await repository.fetchArticles();
    setState(() {
      this.articles = articles;
    });
  } catch (error) {
    setState(() {
      message = '加载失败';
    });
  }
}
```

注意在 StatefulWidget 中异步回来后检查 `mounted`：

```dart
Future<void> load() async {
  final data = await repository.fetchData();
  if (!mounted) return;
  setState(() {
    value = data;
  });
}
```

如果组件已销毁，继续 `setState` 会报错。

### 14.2 FutureBuilder

简单异步 UI 可以用 FutureBuilder：

```dart
FutureBuilder<List<Article>>(
  future: repository.fetchArticles(),
  builder: (context, snapshot) {
    if (snapshot.connectionState == ConnectionState.waiting) {
      return CircularProgressIndicator();
    }
    if (snapshot.hasError) {
      return Text('加载失败');
    }
    final data = snapshot.data ?? [];
    return ArticleList(data);
  },
)
```

注意不要在 build 中直接创建新的 future 导致重复请求。应把 future 存在 State 中，或使用状态管理。

### 14.3 StreamBuilder

连续数据使用 StreamBuilder：

```dart
StreamBuilder<List<Article>>(
  stream: repository.watchArticles(),
  builder: (context, snapshot) {
    final data = snapshot.data ?? [];
    return ArticleList(data);
  },
)
```

数据库观察、WebSocket、实时状态适合 Stream。

## 15. 平台能力与插件

Flutter 通过插件访问平台能力，例如相机、定位、蓝牙、文件、推送、支付。

### 15.1 使用插件

添加依赖到 `pubspec.yaml`：

```yaml
dependencies:
  image_picker: ^1.0.0
```

使用：

```dart
final picker = ImagePicker();
final image = await picker.pickImage(source: ImageSource.gallery);
```

插件通常需要配置 Android 和 iOS 权限。不要只写 Dart 代码就认为功能完整。

### 15.2 Platform Channel

当现有插件不能满足需求，可以使用平台通道调用原生代码。

Dart 侧：

```dart
const channel = MethodChannel('com.example/device');

Future<String> getDeviceName() async {
  final name = await channel.invokeMethod<String>('getDeviceName');
  return name ?? '';
}
```

Android/iOS 侧实现对应方法。

平台通道适合：

- 调用已有原生 SDK。
- 接入平台独有能力。
- 复用原生业务模块。

但它会增加跨端维护成本，需要设计清晰的接口。

## 16. 动画

Flutter 动画能力很强，主要分为隐式动画和显式动画。

### 16.1 隐式动画

隐式动画使用简单，适合常见变化：

```dart
AnimatedContainer(
  duration: Duration(milliseconds: 300),
  width: selected ? 200 : 100,
  height: 80,
  color: selected ? Colors.blue : Colors.grey,
)
```

常见隐式动画：

- `AnimatedContainer`
- `AnimatedOpacity`
- `AnimatedAlign`
- `AnimatedPadding`
- `AnimatedSwitcher`

### 16.2 显式动画

复杂动画使用 `AnimationController`：

```dart
class FadeBoxState extends State<FadeBox>
    with SingleTickerProviderStateMixin {
  late final AnimationController controller;
  late final Animation<double> animation;

  @override
  void initState() {
    super.initState();
    controller = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: 300),
    );
    animation = CurvedAnimation(
      parent: controller,
      curve: Curves.easeOut,
    );
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: animation,
      child: Container(width: 100, height: 100),
    );
  }
}
```

使用 AnimationController 时必须在 `dispose` 中释放。

### 16.3 Hero 动画

Hero 用于页面间共享元素动画：

```dart
Hero(
  tag: article.id,
  child: Image.network(article.coverUrl),
)
```

两个页面使用相同 tag，Flutter 会自动执行过渡动画。

## 17. 性能优化

Flutter 性能问题通常来自不必要重建、列表构建不当、图片过大、主线程阻塞、动画掉帧等。

### 17.1 控制重建范围

不要把整个页面都放在一个巨大的 build 方法里。可以拆成小 Widget，让 Flutter 更好地复用。

使用 `const` 构造：

```dart
const SizedBox(height: 16)
const Text('标题')
```

`const` 可以减少不必要对象创建，也能帮助 Flutter 判断组件不需要变化。

### 17.2 列表优化

大量数据使用 builder：

```dart
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ItemTile(items[index]),
)
```

如果列表项高度固定，可以使用 `itemExtent` 提升性能：

```dart
ListView.builder(
  itemExtent: 72,
  itemBuilder: (context, index) => ItemTile(items[index]),
)
```

### 17.3 图片优化

图片过大是常见性能问题。建议：

- 使用合适尺寸的图片。
- 网络图片使用缓存。
- 避免一次性加载大量高清图。
- 列表缩略图使用缩略尺寸。
- 对本地大图考虑压缩。

### 17.4 避免主线程阻塞

大量 JSON 解析、加密、图片处理、复杂计算可能阻塞 UI。可以使用 `compute` 或 isolate：

```dart
final result = await compute(parseArticles, jsonString);
```

### 17.5 使用 DevTools

Flutter DevTools 可以查看：

- Widget rebuild。
- 帧耗时。
- 内存。
- 网络。
- 日志。
- CPU profiler。

性能优化不要只靠感觉，要用工具定位瓶颈。

## 18. 工程结构

一个中型 Flutter 项目可以这样组织：

```text
lib/
  main.dart
  app/
    app.dart
    router.dart
    theme.dart
  core/
    error/
    network/
    storage/
    utils/
  features/
    auth/
      data/
      domain/
      presentation/
    article/
      data/
      domain/
      presentation/
  shared/
    widgets/
    extensions/
```

### 18.1 app

放应用入口相关内容：

- 根 Widget。
- 路由配置。
- 主题配置。
- 国际化配置。
- 全局依赖装配。

### 18.2 core

放跨功能基础能力：

- 网络客户端。
- 错误类型。
- 本地存储封装。
- 日志。
- 通用工具。

不要把业务代码放进 core。

### 18.3 features

按功能组织代码。每个 feature 可以包含：

```text
data/
  dto
  data_source
  repository_impl
domain/
  model
  repository
  use_case
presentation/
  page
  widget
  state
  controller
```

这和 Clean Architecture 思路一致：Domain 定义业务，Data 实现数据，Presentation 管 UI。

### 18.4 shared

放跨功能复用 UI 组件和扩展。与 core 的区别是，shared 更偏展示和通用组件，core 更偏基础能力。

## 19. 测试与调试

Flutter 测试主要分三类。

### 19.1 Unit Test

测试纯 Dart 逻辑：

```dart
test('price should include tax', () {
  final result = calculatePrice(100, taxRate: 0.1);
  expect(result, 110);
});
```

适合测试：

- UseCase。
- Repository 逻辑。
- 数据转换。
- Validator。
- 工具函数。

### 19.2 Widget Test

测试 Widget 行为：

```dart
testWidgets('shows title', (tester) async {
  await tester.pumpWidget(
    MaterialApp(
      home: Text('Hello'),
    ),
  );

  expect(find.text('Hello'), findsOneWidget);
});
```

可以模拟点击：

```dart
await tester.tap(find.text('提交'));
await tester.pump();
```

### 19.3 Integration Test

集成测试运行在真实设备或模拟器上，适合关键流程：

- 登录。
- 下单。
- 支付前流程。
- 重要页面跳转。

集成测试成本较高，不适合覆盖所有分支。

### 19.4 调试工具

常用调试手段：

- `flutter analyze` 静态分析。
- `flutter test` 运行测试。
- DevTools 查看性能。
- Flutter Inspector 查看 Widget 树。
- 日志和断点调试。

提交前至少应保证 `flutter analyze` 通过。

## 20. 常见反模式

### 20.1 build 方法过大

几百行 build 方法会极难维护。应该按语义拆 Widget，例如 Header、Content、ActionBar、ListItem。

### 20.2 滥用 StatefulWidget

所有状态都放在 StatefulWidget 中，会导致页面难测试、状态难共享。局部状态可以放，业务状态应进入状态管理层。

### 20.3 在 build 中发请求

错误：

```dart
Widget build(BuildContext context) {
  repository.fetchArticles();
  return Container();
}
```

build 可能频繁调用，这会导致重复请求。请求应放在 `initState`、状态管理初始化逻辑或路由进入逻辑中。

### 20.4 忘记 dispose

`TextEditingController`、`AnimationController`、`ScrollController`、`FocusNode` 等需要释放：

```dart
@override
void dispose() {
  controller.dispose();
  super.dispose();
}
```

### 20.5 不检查 mounted

异步任务完成后组件可能已经销毁。调用 `setState` 前应检查：

```dart
if (!mounted) return;
```

### 20.6 UI 直接依赖接口响应

不要让页面直接解析接口 JSON。应通过 DTO、Repository、Domain Model 或 UI Model 分层处理。

### 20.7 过度封装组件

不是每个 `Text` 都要封装成组件。抽组件要服务复用、可读性和重建范围，不要制造过多跳转。

### 20.8 全局变量滥用

全局变量会让状态来源不清晰，也不利于测试。全局状态应通过明确的状态管理和依赖注入暴露。

## 21. 学习路线与落地清单

### 21.1 学习路线

第一阶段：Dart 基础。

- 类型、函数、类。
- 空安全。
- Future、Stream。
- 集合操作。

第二阶段：Flutter UI。

- Widget。
- StatelessWidget、StatefulWidget。
- 常用布局。
- 主题。
- 列表。
- 表单。

第三阶段：页面能力。

- Navigator。
- 路由传参。
- 网络请求。
- JSON 解析。
- 本地存储。
- 图片加载。

第四阶段：状态管理。

- setState。
- Provider 或 Riverpod。
- 异步状态。
- 全局状态。
- 错误和加载态建模。

第五阶段：工程化。

- 项目结构。
- 分层架构。
- 代码生成。
- 测试。
- CI。
- 性能分析。
- 平台插件。

### 21.2 项目落地清单

基础：

- `flutter analyze` 无严重问题。
- 页面结构清晰，build 方法不过度膨胀。
- 常量 Widget 使用 `const`。
- 控制器正确 dispose。
- 异步 setState 前检查 mounted。

状态：

- 局部状态用 setState 或 ValueNotifier。
- 页面业务状态使用统一状态模型。
- 全局状态有明确来源。
- 加载态、错误态、空态清晰。
- 不在 build 中触发请求。

数据：

- UI 不直接解析 JSON。
- DTO、Domain Model、UI Model 职责分离。
- Repository 隐藏网络和本地存储。
- 敏感数据使用安全存储。
- 网络错误有统一处理。

路由：

- 页面参数类型清晰。
- 登录拦截逻辑集中。
- 深链和返回栈行为可预期。
- 不在任意组件中散落复杂跳转规则。

性能：

- 大列表使用 builder。
- 图片尺寸合理并使用缓存。
- 重计算放到 isolate 或后台处理。
- 使用 DevTools 分析卡顿。
- 避免无意义大范围重建。

测试：

- 核心业务逻辑有单元测试。
- 关键 Widget 有 Widget Test。
- 关键用户路径有集成测试。
- Repository 和 Mapper 可测试。

## 22. Flutter 与原生开发的关系

Flutter 不是要彻底替代原生开发。真实项目中，Flutter 和原生经常共存。

常见模式：

- 新项目全量使用 Flutter。
- 老项目部分页面用 Flutter 混合开发。
- 业务页面 Flutter，底层能力原生插件。
- 多端统一 UI，平台独有能力走 Platform Channel。

如果团队已有成熟原生工程，可以先从独立业务模块试点，例如活动页、内容页、工具页。等工程链路、性能、包体积、插件能力验证稳定后，再扩大使用范围。

## 23. 总结

Flutter 的核心是声明式 UI、自绘渲染和跨平台复用。学习 Flutter 不能只背组件 API，更要理解 Widget 树、状态管理、布局约束、异步模型和工程分层。

实际项目中，写好 Flutter 的关键是：

- 用 Widget 描述界面，而不是命令式操作界面。
- 把状态分类，选择合适的状态管理方式。
- 理解父约束、子尺寸、父定位的布局规则。
- 避免在 build 中做副作用。
- 网络、存储、业务逻辑不要直接塞进页面。
- 控制重建范围，正确处理图片、列表和重计算。
- 用测试和 DevTools 保证质量。

Flutter 上手很快，但写好大型项目需要架构意识。只要把 UI、状态、数据、平台能力和工程结构分清楚，它就能成为一套高效、稳定、可持续维护的跨平台开发方案。
