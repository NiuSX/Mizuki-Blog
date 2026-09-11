# MVI 架构详解笔记

> MVI 是一种以“单向数据流”和“不可变状态”为核心的 UI 架构模式。它常用于 Android、Compose、Kotlin Multiplatform、前端状态管理以及复杂交互页面中。理解 MVI 的关键不是记住几个类名，而是理解用户意图如何进入系统、业务逻辑如何产生状态、界面如何只根据状态渲染。

## 目录

- [一、MVI 是什么](#一mvi-是什么)
- [二、为什么需要 MVI](#二为什么需要-mvi)
- [三、MVI 的核心概念](#三mvi-的核心概念)
- [四、单向数据流](#四单向数据流)
- [五、Intent、Action、Result、State、Effect 的职责](#五intentactionresultstateeffect-的职责)
- [六、MVI 与 MVC、MVP、MVVM 的区别](#六mvi-与-mvcmvpmvvm-的区别)
- [七、Android ViewModel 中的 MVI 实现](#七android-viewmodel-中的-mvi-实现)
- [八、Jetpack Compose 中的 MVI](#八jetpack-compose-中的-mvi)
- [九、MVI 与 Clean Architecture 的结合](#九mvi-与-clean-architecture-的结合)
- [十、状态设计方法](#十状态设计方法)
- [十一、一次性事件 Effect](#十一一次性事件-effect)
- [十二、异步任务、Flow 与并发处理](#十二异步任务flow-与并发处理)
- [十三、错误处理与加载状态](#十三错误处理与加载状态)
- [十四、列表、分页、搜索等复杂场景](#十四列表分页搜索等复杂场景)
- [十五、测试 MVI](#十五测试-mvi)
- [十六、常见反模式](#十六常见反模式)
- [十七、实践模板](#十七实践模板)
- [十八、总结](#十八总结)

## 一、MVI 是什么

MVI 全称是 Model-View-Intent。它的核心思想可以概括为：

```text
用户操作 -> Intent -> 业务处理 -> State -> UI 渲染
```

在 MVI 中，界面不直接维护复杂的可变状态，而是订阅一个统一的 `State`。用户点击、输入、刷新、滚动、重试等操作会被封装成 `Intent` 或 `Event` 发送给 ViewModel。ViewModel 根据当前状态和业务结果生成新的状态，UI 再根据新状态重新渲染。

MVI 最重要的特点是：

- **单一状态源**：页面状态集中在一个 `UiState` 中。
- **状态不可变**：每次状态变化都创建新对象，而不是到处修改字段。
- **单向数据流**：事件向上流动，状态向下流动。
- **可预测**：给定当前状态和输入事件，应该能推导出下一个状态。
- **易测试**：ViewModel 可以通过输入 Intent、断言 State 和 Effect 来测试。

MVI 不是一个固定框架，而是一种架构思想。不同项目会有不同命名：

- `Intent`
- `Event`
- `Action`
- `Mutation`
- `Result`
- `Reducer`
- `State`
- `Effect`

命名可以不同，但核心原则应该一致：UI 发出用户意图，状态由统一逻辑更新，UI 只消费状态。

## 二、为什么需要 MVI

随着页面复杂度上升，传统写法很容易出现状态分散问题。例如一个列表页可能同时包含：

- 首次加载状态。
- 下拉刷新状态。
- 分页加载状态。
- 搜索关键词。
- 筛选条件。
- 空页面。
- 错误页面。
- Toast。
- 跳转详情。
- 登录过期弹窗。
- 被选中的 item。
- 局部按钮 loading。

如果这些状态分散在多个 `LiveData`、`MutableState`、普通变量和回调中，就会出现几个问题。

### 1. 状态来源不清晰

页面上展示的数据到底来自哪里？是 ViewModel 的某个字段，还是 Fragment 的本地变量，还是 Adapter 内部状态，还是某个单例缓存？状态源越多，越难推理。

典型问题：

- Loading 已经结束，但按钮仍然不可点击。
- 接口失败后列表被清空，但错误提示又没有显示。
- 搜索关键词变化后分页页码没有重置。
- 页面旋转后 Toast 重复弹出。
- 返回上一页后旧筛选条件丢失。

MVI 通过统一 `UiState` 降低这类混乱。

### 2. 状态组合爆炸

复杂页面不是只有“成功、失败、加载中”三种状态。真实页面经常有组合状态：

```text
已有列表数据 + 正在下拉刷新
已有列表数据 + 下一页加载失败
空列表 + 首次加载失败
搜索中 + 旧结果仍展示
筛选条件改变 + 请求未完成
```

如果只用几个布尔值随意控制，很容易产生互相矛盾的状态：

```kotlin
isLoading = true
isError = true
items = nonEmptyList
isEmpty = true
```

MVI 要求认真设计状态模型，尽量让非法状态无法表达，或者至少集中处理状态变更。

### 3. 异步回调难以维护

没有统一数据流时，异步回调可能从任何地方修改 UI：

```kotlin
repository.loadData(
    onSuccess = {
        progressBar.isVisible = false
        adapter.submitList(it)
    },
    onError = {
        progressBar.isVisible = false
        showToast("失败")
    }
)
```

当刷新、搜索、分页、重试同时存在时，这种写法会迅速失控。MVI 更推荐让异步结果变成状态更新：

```text
LoadStarted -> state.copy(isLoading = true)
LoadSuccess -> state.copy(items = data, isLoading = false)
LoadFailure -> state.copy(error = message, isLoading = false)
```

### 4. 测试困难

如果逻辑散落在 Activity、Fragment、Adapter、回调和 XML 绑定表达式里，测试会非常困难。MVI 将核心状态变化放到 ViewModel 或 reducer 中，测试可以聚焦为：

```text
给定初始 State
当输入 Intent
模拟 UseCase 返回结果
断言最终 State 和 Effect
```

这比启动整个 UI 再点来点去更稳定。

## 三、MVI 的核心概念

MVI 可以用下面的结构理解：

```text
View
  负责渲染 State
  负责把用户操作转成 Intent

Intent
  表示用户意图或页面事件

ViewModel / Store
  接收 Intent
  调用 UseCase
  归并业务结果
  更新 State
  发出 Effect

State
  当前页面完整状态

Effect
  一次性副作用，例如 Toast、导航、弹窗
```

### 1. View

View 指 UI 层，Android 中可能是：

- Activity。
- Fragment。
- 自定义 View。
- Compose Composable。

View 的职责应该尽量简单：

- 收集 `UiState`。
- 根据 `UiState` 渲染界面。
- 把用户操作发送给 ViewModel。
- 收集 `UiEffect`，执行 Toast、导航等一次性操作。

View 不应该直接写复杂业务判断，不应该直接调用 Repository，不应该持有多个来源不明的状态。

### 2. Intent

Intent 表示用户或页面对系统表达的“意图”。例如：

```kotlin
sealed interface LoginIntent {
    data class UsernameChanged(val value: String) : LoginIntent
    data class PasswordChanged(val value: String) : LoginIntent
    data object SubmitClicked : LoginIntent
    data object PasswordVisibilityClicked : LoginIntent
}
```

Intent 不一定只来自用户点击，也可以来自生命周期或页面初始化：

```kotlin
data object ScreenStarted : DetailIntent
data object RetryClicked : DetailIntent
data object RefreshPulled : DetailIntent
```

命名上建议使用用户视角，而不是实现视角。例如：

- 好：`SubmitClicked`
- 好：`RefreshPulled`
- 好：`SearchQueryChanged`
- 不佳：`CallLoginApi`
- 不佳：`SetLoadingFalse`

Intent 应该表达“发生了什么”，而不是直接命令 ViewModel “怎么改状态”。

### 3. State

State 是 UI 的单一事实来源。一个页面通常对应一个 `UiState`：

```kotlin
data class LoginUiState(
    val username: String = "",
    val password: String = "",
    val isPasswordVisible: Boolean = false,
    val isSubmitting: Boolean = false,
    val usernameError: String? = null,
    val passwordError: String? = null
)
```

UI 只要拿到这个 State，就应该能完整渲染当前页面。State 要避免保存不属于 UI 的复杂对象，例如数据库连接、Context、View、Job 等。

### 4. Effect

Effect 用于一次性事件：

- Toast。
- Snackbar。
- 页面跳转。
- 弹系统权限框。
- 打开外部浏览器。
- 复制到剪贴板。
- 滚动到某个位置。

这些事件不适合放进持久 State。因为 State 会被重新收集、重放或在配置变化后恢复，一次性事件如果放在 State 里，容易重复执行。

```kotlin
sealed interface LoginEffect {
    data object NavigateHome : LoginEffect
    data class ShowMessage(val message: String) : LoginEffect
}
```

## 四、单向数据流

MVI 的数据流是单向的：

```text
UI Event
   ↓
Intent
   ↓
ViewModel
   ↓
UseCase / Repository
   ↓
Result
   ↓
Reducer
   ↓
UiState
   ↓
UI Render
```

### 1. 为什么单向数据流重要

单向数据流让状态变化路径清晰。一个页面出现异常时，可以沿着固定链路排查：

1. 用户有没有发出正确 Intent？
2. ViewModel 有没有收到 Intent？
3. UseCase 有没有返回正确结果？
4. Reducer 有没有生成正确 State？
5. UI 有没有正确渲染 State？

如果没有单向数据流，UI、ViewModel、Repository、Adapter 可能互相改状态，定位问题会困难很多。

### 2. 单向不等于简单

MVI 的单向流会引入样板代码。对于简单页面，可能显得繁琐。因此是否使用 MVI 要看页面复杂度和团队规范。

适合 MVI 的场景：

- 页面状态复杂。
- 异步请求多。
- 用户交互多。
- 需要良好可测试性。
- 使用 Compose。
- 多端共享 ViewModel 或状态逻辑。
- 团队希望统一 UI 状态管理。

不一定需要完整 MVI 的场景：

- 静态展示页。
- 简单表单。
- 只有一个接口和一个列表。
- 原型代码。

可以采用“轻量 MVI”：统一 State 和 Event，但不强行拆出完整 Action、Result、Reducer。

## 五、Intent、Action、Result、State、Effect 的职责

不同 MVI 实现复杂度不同。完整版本可能包含：

```text
Intent -> Action -> Result -> State + Effect
```

### 1. Intent

Intent 来自 UI，表示用户或页面事件。它贴近界面语言。

示例：

```kotlin
sealed interface UserListIntent {
    data object EnterScreen : UserListIntent
    data object Refresh : UserListIntent
    data object LoadNextPage : UserListIntent
    data class SearchChanged(val keyword: String) : UserListIntent
    data class UserClicked(val userId: String) : UserListIntent
}
```

### 2. Action

Action 是 ViewModel 内部对 Intent 的进一步解释。它更贴近业务操作。

例如：

```text
SearchChanged("tom") -> SearchUsers(keyword = "tom", resetPage = true)
Refresh -> LoadUsers(page = 1, forceRefresh = true)
LoadNextPage -> LoadUsers(page = currentPage + 1)
```

小项目可以不单独定义 Action，直接在 `handleIntent` 中处理。

### 3. Result

Result 表示业务操作的结果：

```kotlin
sealed interface UserListResult {
    data object Loading : UserListResult
    data class Success(val users: List<User>, val hasMore: Boolean) : UserListResult
    data class Failure(val message: String) : UserListResult
}
```

Result 的价值是把异步操作和状态规约解耦。UseCase 负责产生结果，Reducer 负责根据结果更新状态。

### 4. Reducer

Reducer 是纯状态转换函数：

```text
(oldState, result) -> newState
```

示例：

```kotlin
private fun reduce(
    state: UserListUiState,
    result: UserListResult
): UserListUiState {
    return when (result) {
        UserListResult.Loading -> state.copy(isLoading = true, errorMessage = null)
        is UserListResult.Success -> state.copy(
            isLoading = false,
            users = result.users,
            hasMore = result.hasMore,
            errorMessage = null
        )
        is UserListResult.Failure -> state.copy(
            isLoading = false,
            errorMessage = result.message
        )
    }
}
```

Reducer 越纯，越容易测试。理想情况下，Reducer 不做网络请求、不读数据库、不发 Toast、不访问时间和随机数。

### 5. State

State 是页面渲染所需数据。它应该稳定、可序列化或近似可序列化，至少不应依赖 Android View 对象。

### 6. Effect

Effect 是不能仅靠 State 表达的一次性动作。它通常使用 `Channel` 或 `SharedFlow` 发送。

## 六、MVI 与 MVC、MVP、MVVM 的区别

### 1. MVC

MVC 分为 Model、View、Controller。Android 早期很多代码实际变成 Activity/Fragment 同时承担 View 和 Controller，导致页面类膨胀。

问题：

- UI 类容易过大。
- 状态分散。
- 业务逻辑容易混入界面层。

### 2. MVP

MVP 中 Presenter 持有 View 接口，View 把事件交给 Presenter，Presenter 调用 Model 后再让 View 更新。

优点：

- 比 MVC 更容易测试。
- View 和业务逻辑有一定分离。

问题：

- View 接口方法容易膨胀。
- Presenter 可能命令式调用很多 UI 方法。
- 页面状态仍可能分散在多个方法调用之间。

### 3. MVVM

MVVM 中 View 观察 ViewModel 暴露的数据，ViewModel 不直接持有 View。Android 官方推荐 ViewModel + LiveData/Flow/StateFlow 的方式。

MVI 可以看成 MVVM 的一种更严格实践：

- MVVM 强调 ViewModel 暴露可观察数据。
- MVI 强调单一 State、Intent 输入、单向数据流、不可变状态。

MVVM 不一定是 MVI，但 MVI 在 Android 中通常用 ViewModel 实现。

### 4. MVI

MVI 更适合处理复杂状态。它要求 UI 不是被多个零散字段驱动，而是由完整状态驱动。

对比：

| 模式 | UI 更新方式 | 状态管理 | 典型问题 |
| --- | --- | --- | --- |
| MVC | Controller 直接控制 | 容易分散 | Activity/Fragment 膨胀 |
| MVP | Presenter 调用 View 方法 | 中等 | View 接口复杂 |
| MVVM | View 观察数据 | 取决于实现 | 多个 LiveData 状态不一致 |
| MVI | View 渲染单一 State | 集中、不可变 | 样板代码较多 |

## 七、Android ViewModel 中的 MVI 实现

下面以登录页为例。

### 1. 定义 State

```kotlin
data class LoginUiState(
    val username: String = "",
    val password: String = "",
    val isPasswordVisible: Boolean = false,
    val isSubmitting: Boolean = false,
    val usernameError: String? = null,
    val passwordError: String? = null
) {
    val canSubmit: Boolean
        get() = username.isNotBlank() && password.isNotBlank() && !isSubmitting
}
```

`canSubmit` 可以是派生属性，因为它完全由其他字段计算得出。是否放进 State 取决于团队习惯。如果派生逻辑复杂或 UI 多处使用，可以放在 State 内作为只读计算属性。

### 2. 定义 Intent

```kotlin
sealed interface LoginIntent {
    data class UsernameChanged(val value: String) : LoginIntent
    data class PasswordChanged(val value: String) : LoginIntent
    data object PasswordVisibilityClicked : LoginIntent
    data object SubmitClicked : LoginIntent
}
```

### 3. 定义 Effect

```kotlin
sealed interface LoginEffect {
    data object NavigateHome : LoginEffect
    data class ShowMessage(val message: String) : LoginEffect
}
```

### 4. ViewModel 实现

```kotlin
class LoginViewModel(
    private val loginUseCase: LoginUseCase
) : ViewModel() {

    private val _state = MutableStateFlow(LoginUiState())
    val state: StateFlow<LoginUiState> = _state.asStateFlow()

    private val _effect = Channel<LoginEffect>(Channel.BUFFERED)
    val effect: Flow<LoginEffect> = _effect.receiveAsFlow()

    fun onIntent(intent: LoginIntent) {
        when (intent) {
            is LoginIntent.UsernameChanged -> onUsernameChanged(intent.value)
            is LoginIntent.PasswordChanged -> onPasswordChanged(intent.value)
            LoginIntent.PasswordVisibilityClicked -> togglePasswordVisibility()
            LoginIntent.SubmitClicked -> submit()
        }
    }

    private fun onUsernameChanged(value: String) {
        _state.update {
            it.copy(
                username = value,
                usernameError = null
            )
        }
    }

    private fun onPasswordChanged(value: String) {
        _state.update {
            it.copy(
                password = value,
                passwordError = null
            )
        }
    }

    private fun togglePasswordVisibility() {
        _state.update {
            it.copy(isPasswordVisible = !it.isPasswordVisible)
        }
    }

    private fun submit() {
        val current = _state.value
        val usernameError = if (current.username.isBlank()) "请输入用户名" else null
        val passwordError = if (current.password.isBlank()) "请输入密码" else null

        if (usernameError != null || passwordError != null) {
            _state.update {
                it.copy(
                    usernameError = usernameError,
                    passwordError = passwordError
                )
            }
            return
        }

        viewModelScope.launch {
            _state.update { it.copy(isSubmitting = true) }

            loginUseCase(current.username, current.password)
                .onSuccess {
                    _state.update { it.copy(isSubmitting = false) }
                    _effect.send(LoginEffect.NavigateHome)
                }
                .onFailure { error ->
                    _state.update { it.copy(isSubmitting = false) }
                    _effect.send(LoginEffect.ShowMessage(error.message ?: "登录失败"))
                }
        }
    }
}
```

这个实现属于轻量 MVI。它没有显式 Action、Result、Reducer，但具备 MVI 的核心：

- UI 只发 Intent。
- ViewModel 集中处理 Intent。
- UI 观察 State。
- 一次性事件走 Effect。

### 5. Fragment 收集 State 和 Effect

```kotlin
class LoginFragment : Fragment(R.layout.fragment_login) {

    private val viewModel: LoginViewModel by viewModels()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.state.collect { state ->
                        render(state)
                    }
                }
                launch {
                    viewModel.effect.collect { effect ->
                        handleEffect(effect)
                    }
                }
            }
        }
    }

    private fun render(state: LoginUiState) {
        binding.submitButton.isEnabled = state.canSubmit
        binding.progressBar.isVisible = state.isSubmitting
        binding.usernameLayout.error = state.usernameError
        binding.passwordLayout.error = state.passwordError
    }

    private fun handleEffect(effect: LoginEffect) {
        when (effect) {
            LoginEffect.NavigateHome -> findNavController().navigate(R.id.homeFragment)
            is LoginEffect.ShowMessage -> Toast.makeText(requireContext(), effect.message, Toast.LENGTH_SHORT).show()
        }
    }
}
```

注意：在 XML View 系统中，输入框文本变化和状态回填要避免循环触发。实际项目中需要在设置文本前判断是否已经一致。

## 八、Jetpack Compose 中的 MVI

Compose 天然适合 MVI，因为 Compose 的核心就是“状态驱动 UI”。

### 1. Compose 页面结构

```kotlin
@Composable
fun LoginRoute(
    viewModel: LoginViewModel = hiltViewModel(),
    onNavigateHome: () -> Unit
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        viewModel.effect.collect { effect ->
            when (effect) {
                LoginEffect.NavigateHome -> onNavigateHome()
                is LoginEffect.ShowMessage -> {
                    Toast.makeText(context, effect.message, Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    LoginScreen(
        state = state,
        onIntent = viewModel::onIntent
    )
}
```

`LoginRoute` 负责连接 ViewModel、导航和系统能力。`LoginScreen` 负责纯 UI。

### 2. Stateless Composable

```kotlin
@Composable
fun LoginScreen(
    state: LoginUiState,
    onIntent: (LoginIntent) -> Unit
) {
    Column {
        OutlinedTextField(
            value = state.username,
            onValueChange = { onIntent(LoginIntent.UsernameChanged(it)) },
            isError = state.usernameError != null,
            supportingText = {
                state.usernameError?.let { Text(it) }
            }
        )

        OutlinedTextField(
            value = state.password,
            onValueChange = { onIntent(LoginIntent.PasswordChanged(it)) },
            isError = state.passwordError != null,
            supportingText = {
                state.passwordError?.let { Text(it) }
            }
        )

        Button(
            enabled = state.canSubmit,
            onClick = { onIntent(LoginIntent.SubmitClicked) }
        ) {
            if (state.isSubmitting) {
                CircularProgressIndicator()
            } else {
                Text("登录")
            }
        }
    }
}
```

这种写法的好处：

- UI 组件不依赖具体 ViewModel，方便预览和测试。
- 所有交互都通过 `onIntent` 输出。
- 所有显示都由 `state` 决定。

### 3. Compose 中的状态分层

Compose 中有两类状态：

- 页面业务状态：应该在 ViewModel 的 `UiState` 中。
- 纯 UI 临时状态：可以放在 Composable 中 `remember`。

例如：

- 搜索关键词：通常属于业务状态，应在 ViewModel。
- 当前弹出的菜单是否展开：如果不影响业务，可放在局部 `remember`。
- 当前 Tab：如果要恢复、影响请求或被其他页面使用，应进 ViewModel。
- TextField 输入：通常进 ViewModel，尤其是表单提交需要。

不要把所有状态都机械塞进 ViewModel，也不要把业务关键状态散落在 Composable 里。判断标准是生命周期和业务意义。

## 九、MVI 与 Clean Architecture 的结合

在 Clean Architecture 中，常见分层是：

```text
presentation -> domain -> data
```

MVI 主要属于 presentation 层，它不应该替代 UseCase、Repository、DataSource。

### 1. 推荐依赖方向

```text
UI
 ↓
ViewModel / MVI Store
 ↓
UseCase
 ↓
Repository Interface
 ↓
Repository Implementation
 ↓
LocalDataSource / RemoteDataSource
```

依赖规则：

- ViewModel 可以依赖 UseCase。
- UseCase 依赖 Repository 接口。
- Repository 接口放在 domain 层。
- Repository 实现放在 data 层。
- data 层可以依赖网络、数据库、缓存。
- domain 层不依赖 Android UI 框架。

### 2. MVI 中各层职责

**UI 层**：

- 渲染状态。
- 发送 Intent。
- 执行 Effect。

**ViewModel**：

- 接收 Intent。
- 做输入校验和 UI 状态组装。
- 调用 UseCase。
- 更新 UiState。
- 发出 UiEffect。

**UseCase**：

- 表达业务动作。
- 编排领域逻辑。
- 不关心按钮、Toast、页面 loading。

**Repository**：

- 屏蔽数据来源。
- 协调本地和远程数据。
- 返回领域模型。

### 3. 不要让 MVI 侵入所有层

不要把 `UiState`、`Intent`、`Effect` 传到 domain 或 data 层。它们属于表现层模型。

错误方向：

```text
Repository 返回 LoginUiState
UseCase 接收 LoginIntent
DataSource 发送 ToastEffect
```

正确方向：

```text
Repository 返回 User
UseCase 接收 username/password
ViewModel 把 User 转成 UiState
ViewModel 发送 NavigateHome Effect
```

### 4. 模型转换

不同层可以有不同模型：

- `UserDto`：网络数据。
- `UserEntity`：数据库数据。
- `User`：领域模型。
- `UserUiModel`：界面展示模型。

MVI 中的 `UiState` 应该使用适合 UI 的模型，避免直接暴露 DTO 或 Entity。

## 十、状态设计方法

MVI 成败很大程度取决于 State 设计。糟糕的 State 会让 MVI 变成“把混乱集中到一个 data class 里”。

### 1. State 要能完整描述页面

一个列表页 State 示例：

```kotlin
data class UserListUiState(
    val users: List<UserUiModel> = emptyList(),
    val query: String = "",
    val isInitialLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val isLoadingNextPage: Boolean = false,
    val initialError: String? = null,
    val nextPageError: String? = null,
    val hasMore: Boolean = true
) {
    val showEmpty: Boolean
        get() = !isInitialLoading && initialError == null && users.isEmpty()
}
```

这里区分了：

- 首次加载。
- 下拉刷新。
- 加载下一页。
- 首屏错误。
- 分页错误。

如果只有一个 `isLoading` 和一个 `error`，就很难准确表达真实页面。

### 2. 避免互相矛盾的字段

例如：

```kotlin
data class BadState(
    val isLoading: Boolean,
    val isSuccess: Boolean,
    val isError: Boolean
)
```

它可能同时出现 `isLoading = true`、`isError = true`。更好的方式是使用密封类型：

```kotlin
sealed interface LoadState<out T> {
    data object Idle : LoadState<Nothing>
    data object Loading : LoadState<Nothing>
    data class Success<T>(val data: T) : LoadState<T>
    data class Failure(val message: String) : LoadState<Nothing>
}
```

但也不能过度密封。列表页中“已有数据 + 正在刷新”是一种合法组合，如果用单一 `Loading/Success/Error` 反而表达不了。状态设计要服务真实 UI。

### 3. 派生状态不要重复存储

如果一个字段可以由其他字段稳定计算，就不一定要单独存。

不佳：

```kotlin
data class State(
    val items: List<Item>,
    val isEmpty: Boolean
)
```

如果更新 `items` 时忘了同步 `isEmpty`，就会矛盾。

更好：

```kotlin
data class State(
    val items: List<Item>
) {
    val isEmpty: Boolean get() = items.isEmpty()
}
```

例外是派生计算很昂贵，或者需要快照固定结果，此时可以缓存，但要集中更新。

### 4. State 不要持有生命周期对象

不要在 State 中保存：

- `Context`
- `Activity`
- `Fragment`
- `View`
- `LifecycleOwner`
- `CoroutineScope`
- `Job`
- `NavController`
- 数据库连接
- 网络客户端

State 是描述 UI 的值对象，不是资源容器。

### 5. State 字段命名要贴近界面

字段要能让 UI 渲染时自然使用：

```kotlin
val showRetryButton: Boolean
val isSubmitEnabled: Boolean
val toolbarTitle: String
val items: List<ItemUiModel>
```

但也要避免把所有微小样式都放进 State。如果颜色、间距、字体是设计系统决定的，不需要成为 ViewModel 状态。

## 十一、一次性事件 Effect

Effect 是 MVI 实践中最容易误用的部分。

### 1. 为什么需要 Effect

State 会被持久观察。比如 Compose 重组、Fragment 重新收集、屏幕旋转后重新订阅，都可能再次拿到最后一个 State。如果把 Toast 放进 State：

```kotlin
data class State(
    val message: String? = null
)
```

UI 收到 `message` 后显示 Toast。配置变化后重新收集同一个 State，Toast 可能重复显示。Effect 解决的就是这类一次性消费问题。

### 2. Effect 适合表达什么

适合：

- `ShowToast`
- `ShowSnackbar`
- `NavigateToDetail`
- `NavigateBack`
- `RequestPermission`
- `OpenBrowser`
- `CopyText`
- `ScrollToTop`

不适合：

- 列表数据。
- loading 状态。
- 错误页面状态。
- 表单输入。
- 当前 tab。

这些应该是 State。

### 3. Channel 还是 SharedFlow

常见实现：

```kotlin
private val _effect = Channel<UiEffect>(Channel.BUFFERED)
val effect = _effect.receiveAsFlow()
```

也可以：

```kotlin
private val _effect = MutableSharedFlow<UiEffect>()
val effect = _effect.asSharedFlow()
```

选择建议：

- `Channel` 适合点对点的一次性事件。
- `SharedFlow` 适合广播式事件，或者需要配置缓冲策略。

多数 Android 页面用 `Channel.BUFFERED + receiveAsFlow()` 足够。

### 4. 导航事件要小心

导航是典型 Effect。不要在 State 中写：

```kotlin
val shouldNavigateHome: Boolean = true
```

因为它容易重复导航。建议：

```kotlin
sealed interface LoginEffect {
    data object NavigateHome : LoginEffect
}
```

UI 收到后执行导航。

## 十二、异步任务、Flow 与并发处理

MVI 经常和 Kotlin Coroutines、Flow 一起使用。

### 1. viewModelScope

ViewModel 中异步任务应使用 `viewModelScope`，不要使用 `GlobalScope`：

```kotlin
viewModelScope.launch {
    val result = loadUserUseCase()
    _state.update { it.copy(user = result) }
}
```

`viewModelScope` 会在 ViewModel 清理时自动取消，避免任务泄漏。

### 2. StateFlow

`StateFlow` 很适合作为 `UiState` 容器：

```kotlin
private val _state = MutableStateFlow(UiState())
val state: StateFlow<UiState> = _state.asStateFlow()
```

特点：

- 永远有当前值。
- 新订阅者立即收到最新状态。
- 适合表达页面状态。

### 3. update 原子更新

推荐使用 `update`：

```kotlin
_state.update { current ->
    current.copy(count = current.count + 1)
}
```

比直接：

```kotlin
_state.value = _state.value.copy(...)
```

更适合并发场景，因为 `update` 基于当前最新值进行原子更新。

### 4. 搜索防抖

搜索场景中，不应每输入一个字符都立即请求。可以用 Flow 处理 Intent：

```kotlin
private val intents = MutableSharedFlow<SearchIntent>()

init {
    intents
        .filterIsInstance<SearchIntent.QueryChanged>()
        .map { it.query }
        .debounce(300)
        .distinctUntilChanged()
        .flatMapLatest { query ->
            searchUseCase(query)
        }
        .onEach { result ->
            _state.update { it.copy(results = result) }
        }
        .launchIn(viewModelScope)
}
```

`flatMapLatest` 的意义是：新搜索到来时取消旧搜索，避免旧请求晚返回覆盖新结果。

### 5. 并发请求

一个页面可能需要并发加载多个模块：

```kotlin
viewModelScope.launch {
    _state.update { it.copy(isLoading = true) }

    val userDeferred = async { getUserUseCase() }
    val settingsDeferred = async { getSettingsUseCase() }

    val user = userDeferred.await()
    val settings = settingsDeferred.await()

    _state.update {
        it.copy(
            isLoading = false,
            user = user,
            settings = settings
        )
    }
}
```

并发时要考虑错误策略：

- 一个失败是否整体失败？
- 是否允许局部成功？
- 是否需要重试？
- 是否需要取消其他请求？

这些策略应体现在 State 设计里。

### 6. 旧请求覆盖新状态

典型问题：

```text
用户搜索 "a" -> 请求 A 发出
用户搜索 "ab" -> 请求 B 发出
请求 B 先返回，显示 "ab" 结果
请求 A 后返回，覆盖成 "a" 结果
```

解决：

- 使用 `flatMapLatest`。
- 保存 requestId，只接受最新请求结果。
- 取消旧 Job。

示例：

```kotlin
private var searchJob: Job? = null

private fun search(query: String) {
    searchJob?.cancel()
    searchJob = viewModelScope.launch {
        val result = searchUseCase(query)
        _state.update { it.copy(results = result) }
    }
}
```

## 十三、错误处理与加载状态

错误处理是 MVI 状态设计的重要部分。

### 1. 错误分层

错误可以分为：

- 输入错误：用户名为空、密码太短。
- 业务错误：余额不足、权限不够。
- 网络错误：超时、无网络。
- 系统错误：数据库失败、未知异常。

不同错误对应不同 UI：

- 输入错误显示在输入框下方。
- 业务错误可能显示 Dialog。
- 网络错误可能显示重试按钮。
- 未知错误可能显示 Toast 或错误页。

### 2. 首屏错误和局部错误

列表页要区分首屏错误和分页错误：

```kotlin
data class FeedUiState(
    val items: List<FeedItemUiModel> = emptyList(),
    val isInitialLoading: Boolean = false,
    val isLoadingMore: Boolean = false,
    val initialError: String? = null,
    val loadMoreError: String? = null
)
```

首屏错误可以展示全屏错误页；分页错误通常是在列表底部展示重试。

### 3. Loading 也要分层

不要用一个 `isLoading` 控制所有 loading。复杂页面通常需要：

- `isInitialLoading`
- `isRefreshing`
- `isLoadingMore`
- `isSubmitting`
- `loadingItemId`

这能避免互相干扰。例如提交按钮 loading 时，不应该让整个页面变成首屏骨架屏。

### 4. 错误消息从哪里来

Repository 或 UseCase 可以返回结构化错误：

```kotlin
sealed interface AppError {
    data object NetworkUnavailable : AppError
    data object Unauthorized : AppError
    data class Server(val code: Int, val message: String) : AppError
    data class Unknown(val cause: Throwable) : AppError
}
```

ViewModel 再映射为 UI 文案：

```kotlin
private fun AppError.toUiMessage(): String {
    return when (this) {
        AppError.NetworkUnavailable -> "网络不可用，请检查连接"
        AppError.Unauthorized -> "登录已过期，请重新登录"
        is AppError.Server -> message
        is AppError.Unknown -> "发生未知错误"
    }
}
```

这样 domain 层不用依赖 Android 字符串资源或 UI 概念。

## 十四、列表、分页、搜索等复杂场景

### 1. 列表页 State

```kotlin
data class ArticleListUiState(
    val articles: List<ArticleUiModel> = emptyList(),
    val query: String = "",
    val selectedCategory: String? = null,
    val page: Int = 1,
    val hasMore: Boolean = true,
    val isInitialLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val isLoadingMore: Boolean = false,
    val initialError: String? = null,
    val loadMoreError: String? = null
) {
    val showEmpty: Boolean
        get() = !isInitialLoading && initialError == null && articles.isEmpty()
}
```

### 2. 列表页 Intent

```kotlin
sealed interface ArticleListIntent {
    data object EnterScreen : ArticleListIntent
    data object Refresh : ArticleListIntent
    data object LoadMore : ArticleListIntent
    data class QueryChanged(val query: String) : ArticleListIntent
    data class CategorySelected(val category: String?) : ArticleListIntent
    data class ArticleClicked(val id: String) : ArticleListIntent
}
```

### 3. 分页处理原则

分页要避免：

- 重复加载同一页。
- 没有更多时继续请求。
- 首屏加载和分页加载状态混用。
- 刷新后页码未重置。
- 搜索条件变化后旧数据未清理或策略不明确。

示例：

```kotlin
private fun loadMore() {
    val current = _state.value
    if (current.isLoadingMore || !current.hasMore || current.isInitialLoading) return

    viewModelScope.launch {
        _state.update { it.copy(isLoadingMore = true, loadMoreError = null) }

        loadArticlesUseCase(
            page = current.page + 1,
            query = current.query,
            category = current.selectedCategory
        ).onSuccess { pageData ->
            _state.update {
                it.copy(
                    articles = it.articles + pageData.items,
                    page = current.page + 1,
                    hasMore = pageData.hasMore,
                    isLoadingMore = false
                )
            }
        }.onFailure { error ->
            _state.update {
                it.copy(
                    isLoadingMore = false,
                    loadMoreError = error.message ?: "加载更多失败"
                )
            }
        }
    }
}
```

### 4. 搜索策略

搜索通常有三种策略：

1. 输入后立即防抖搜索。
2. 点击搜索按钮后搜索。
3. 本地过滤已有数据。

不同策略对应不同 Intent：

```kotlin
data class QueryChanged(val query: String)
data object SearchSubmitted
data object ClearSearchClicked
```

不要把搜索框文字和真实请求关键词混为一谈。复杂场景可以拆成：

```kotlin
val inputQuery: String
val submittedQuery: String
```

### 5. Item 局部状态

列表中某个 item 点赞、收藏、下载时，可能需要局部 loading：

```kotlin
data class ArticleUiModel(
    val id: String,
    val title: String,
    val isLiked: Boolean,
    val isLikeUpdating: Boolean
)
```

这样不会影响整个页面 loading。

## 十五、测试 MVI

MVI 的可测试性是它的重要价值。

### 1. 测试 Reducer

Reducer 是最容易测试的部分：

```kotlin
@Test
fun loading_result_sets_loading_true() {
    val initial = UserListUiState()

    val actual = reduce(initial, UserListResult.Loading)

    assertTrue(actual.isLoading)
    assertNull(actual.errorMessage)
}
```

如果 reducer 是纯函数，测试不需要 Android 环境。

### 2. 测试 ViewModel

ViewModel 测试关注：

- 输入 Intent 后 State 是否正确。
- UseCase 成功/失败时状态是否正确。
- 是否发出正确 Effect。
- 并发和取消逻辑是否正确。

可以使用 coroutine test：

```kotlin
@Test
fun submit_success_navigates_home() = runTest {
    val loginUseCase = FakeLoginUseCase(Result.success(Unit))
    val viewModel = LoginViewModel(loginUseCase)

    viewModel.onIntent(LoginIntent.UsernameChanged("tom"))
    viewModel.onIntent(LoginIntent.PasswordChanged("123456"))
    viewModel.onIntent(LoginIntent.SubmitClicked)

    assertEquals(LoginEffect.NavigateHome, viewModel.effect.first())
}
```

实际项目中可以结合 Turbine 测试 Flow：

```kotlin
viewModel.state.test {
    assertEquals(LoginUiState(), awaitItem())
    viewModel.onIntent(LoginIntent.UsernameChanged("tom"))
    assertEquals("tom", awaitItem().username)
}
```

### 3. 测试 State 不变量

复杂页面可以测试状态不变量：

- 首屏 loading 时不显示空页面。
- 有数据时分页错误不清空列表。
- 刷新失败时旧数据仍保留。
- 搜索条件变化时 page 重置为 1。

这些测试比 UI 截图更能保护业务逻辑。

## 十六、常见反模式

### 1. 把 MVI 写成命令式 UI 操作

错误倾向：

```kotlin
sealed interface Effect {
    data object HideProgressBar : Effect
    data object ShowSubmitButton : Effect
    data object SetTitleRed : Effect
}
```

这不是好的 MVI。UI 的持续显示应该由 State 决定，不应该由一堆命令控制。

### 2. Intent 过于实现化

不佳：

```kotlin
data object CallApi
data object UpdateList
data object SetLoadingFalse
```

更好：

```kotlin
data object RefreshPulled
data object RetryClicked
data class QueryChanged(val value: String)
```

Intent 应表达用户或页面事件。

### 3. State 过大

有些项目把所有东西都塞进一个全局 AppState，导致任何小变化都触发大范围更新，维护困难。MVI 更适合按页面或功能模块划分 State。

### 4. Effect 承载持久状态

不要用 Effect 传列表数据、loading、表单内容。Effect 是一次性动作。

### 5. 多个状态源并存

如果同时存在：

```text
ViewModel StateFlow
Fragment 本地字段
Adapter 内部状态
单例缓存状态
Composable remember 状态
```

而且它们都影响同一个 UI 结果，就会破坏单一状态源。局部 UI 状态可以存在，但业务关键状态应集中。

### 6. 在 ViewModel 中持有 Context

ViewModel 不应该持有 Activity/Fragment Context。需要字符串资源时，可以：

- 在 ViewModel 中发结构化错误，由 UI 映射文案。
- 使用抽象的 ResourceProvider，但要谨慎。
- 让 domain 返回错误类型，presentation 映射为 UI 文案。

### 7. 过度抽象 BaseMviViewModel

很多团队会写一个巨大的 `BaseMviViewModel<I, S, E>`，再塞入复杂泛型、反射、自动注册、统一 reducer。这样可能让简单页面变得难懂。

建议：

- 先用清晰直接的实现。
- 当多个页面重复模式稳定后，再抽小而明确的基类或接口。
- 抽象应减少复杂度，而不是隐藏复杂度。

### 8. 忽略生命周期收集

Android View 系统中收集 Flow 要结合生命周期：

```kotlin
repeatOnLifecycle(Lifecycle.State.STARTED) {
    viewModel.state.collect { render(it) }
}
```

否则可能在页面不可见时继续更新 UI，或者造成泄漏。

Compose 中优先使用：

```kotlin
collectAsStateWithLifecycle()
```

## 十七、实践模板

下面是一套适合 Android + Kotlin + Flow 的轻量 MVI 模板。

### 1. Contract

```kotlin
data class ExampleUiState(
    val isLoading: Boolean = false,
    val data: String? = null,
    val errorMessage: String? = null
)

sealed interface ExampleIntent {
    data object EnterScreen : ExampleIntent
    data object RetryClicked : ExampleIntent
}

sealed interface ExampleEffect {
    data class ShowMessage(val message: String) : ExampleEffect
}
```

### 2. ViewModel

```kotlin
class ExampleViewModel(
    private val loadExampleUseCase: LoadExampleUseCase
) : ViewModel() {

    private val _state = MutableStateFlow(ExampleUiState())
    val state: StateFlow<ExampleUiState> = _state.asStateFlow()

    private val _effect = Channel<ExampleEffect>(Channel.BUFFERED)
    val effect: Flow<ExampleEffect> = _effect.receiveAsFlow()

    fun onIntent(intent: ExampleIntent) {
        when (intent) {
            ExampleIntent.EnterScreen -> load()
            ExampleIntent.RetryClicked -> load()
        }
    }

    private fun load() {
        viewModelScope.launch {
            _state.update {
                it.copy(
                    isLoading = true,
                    errorMessage = null
                )
            }

            loadExampleUseCase()
                .onSuccess { data ->
                    _state.update {
                        it.copy(
                            isLoading = false,
                            data = data
                        )
                    }
                }
                .onFailure { error ->
                    val message = error.message ?: "加载失败"
                    _state.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = message
                        )
                    }
                    _effect.send(ExampleEffect.ShowMessage(message))
                }
        }
    }
}
```

### 3. Compose Route

```kotlin
@Composable
fun ExampleRoute(
    viewModel: ExampleViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        viewModel.onIntent(ExampleIntent.EnterScreen)
    }

    LaunchedEffect(Unit) {
        viewModel.effect.collect { effect ->
            when (effect) {
                is ExampleEffect.ShowMessage -> {
                    Toast.makeText(context, effect.message, Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    ExampleScreen(
        state = state,
        onIntent = viewModel::onIntent
    )
}
```

### 4. Compose Screen

```kotlin
@Composable
fun ExampleScreen(
    state: ExampleUiState,
    onIntent: (ExampleIntent) -> Unit
) {
    when {
        state.isLoading -> {
            CircularProgressIndicator()
        }
        state.errorMessage != null -> {
            Column {
                Text(state.errorMessage)
                Button(onClick = { onIntent(ExampleIntent.RetryClicked) }) {
                    Text("重试")
                }
            }
        }
        state.data != null -> {
            Text(state.data)
        }
    }
}
```

### 5. 文件组织建议

按 feature 组织时：

```text
feature/login/
├── LoginContract.kt
├── LoginViewModel.kt
├── LoginRoute.kt
├── LoginScreen.kt
└── components/
```

其中：

- `Contract` 放 `UiState`、`Intent`、`Effect`。
- `ViewModel` 放状态管理和 UseCase 调用。
- `Route` 连接 ViewModel、导航、系统能力。
- `Screen` 保持 stateless，专注 UI。

## 十八、总结

MVI 的本质是让 UI 状态管理变得可预测。它通过 `Intent -> State -> UI` 的单向数据流，把复杂页面中的用户操作、异步结果、加载状态、错误状态和一次性事件组织起来。

实践 MVI 时要抓住几个原则：

1. UI 只渲染 State，不到处维护业务状态。
2. 用户操作统一转成 Intent。
3. ViewModel 集中处理 Intent，调用 UseCase，更新 State。
4. State 使用不可变数据结构，尽量表达完整页面。
5. Toast、导航、权限请求等一次性行为使用 Effect。
6. MVI 属于 presentation 层，不要污染 domain 和 data 层。
7. 抽象要适度，复杂页面用完整 MVI，简单页面用轻量 MVI。

好的 MVI 代码应该具备三个特征：

- **能读**：从 Intent 到 State 的路径清晰。
- **能测**：输入事件后能断言状态和副作用。
- **能扩展**：新增加载、错误、刷新、分页等状态时不会把页面逻辑撕碎。

当页面状态越来越复杂时，MVI 的价值会明显体现出来。它不是为了制造架构感，而是为了让状态变化有边界、有路径、有证据。
