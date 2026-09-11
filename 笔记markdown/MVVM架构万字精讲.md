# MVVM 架构万字精讲

## 目录

1. MVVM 要解决什么问题
2. MVVM 的三个核心角色
3. MVVM 与 MVC、MVP 的区别
4. 标准数据流与事件流
5. ViewModel 的职责边界
6. UI State、UI Event、UI Effect 的拆分
7. Android/Kotlin 中的典型落地
8. Repository、UseCase 与 MVVM 的关系
9. 状态管理、错误处理与加载态
10. 表单、列表、分页、刷新等常见场景
11. 测试策略
12. 常见反模式
13. 项目落地清单

## 1. MVVM 要解决什么问题

MVVM 是 Model、View、ViewModel 的缩写。它最核心的目标不是让项目看起来更“高级”，而是把界面展示、界面状态、业务数据和用户操作拆开，降低 UI 代码的复杂度，让界面可以被稳定地维护、测试和扩展。

在没有架构约束的项目中，最常见的问题是 Activity、Fragment、Page、Controller 或 Component 中同时出现以下内容：

- 查找控件、设置文本、设置点击事件。
- 发网络请求、读数据库、做缓存。
- 判断登录状态、权限状态、订单状态。
- 处理异常、弹 Toast、跳转页面。
- 拼接请求参数、转换数据结构。
- 维护加载中、空页面、错误页、局部刷新状态。

当所有东西堆在 View 层时，短期写起来快，长期会出现几个明显问题：

- 文件越来越大，任何小功能都要读大量 UI 代码。
- 状态来源不清楚，一个字段可能被多个回调同时修改。
- 异步回调与生命周期交织，容易造成重复请求、内存泄漏、崩溃或脏数据。
- 单元测试困难，因为业务逻辑和 UI 框架强绑定。
- 需求变更时无法判断影响范围，修一个状态可能破坏另一个状态。

MVVM 的价值就是把这些问题拆开。View 只关心“显示什么”和“把用户动作交出去”；ViewModel 负责“把业务数据整理成界面需要的状态”；Model 负责“数据从哪里来、如何保存、如何转换”。这样一来，界面的复杂度被压缩到可控范围，业务状态也有了明确归属。

一句话概括：

> MVVM 不是为了分层而分层，而是为了让 UI 变成状态的渲染结果，让用户操作变成明确的输入，让业务逻辑脱离具体界面。

## 2. MVVM 的三个核心角色

### 2.1 Model

Model 是数据和业务规则的承载者。它可以包含领域模型、数据模型、Repository、DataSource、UseCase，也可以只是简单的数据结构。具体范围取决于项目复杂度。

在简单项目中，Model 可能只是：

```kotlin
data class User(
    val id: String,
    val name: String,
    val avatarUrl: String
)
```

在中大型项目中，Model 往往包含更完整的数据层：

```kotlin
interface UserRepository {
    suspend fun getProfile(userId: String): Result<User>
    fun observeProfile(userId: String): Flow<User>
}
```

Model 的重点是：它不应该知道具体界面长什么样，也不应该依赖 View。它关心数据的真实性、业务规则的正确性和数据源的协调。

### 2.2 View

View 是用户看见并交互的部分。在 Android 中，View 可以是 Activity、Fragment、Composable、XML View；在 Web 中，可以是 React/Vue/Svelte 组件；在桌面端，可以是窗口和控件。

View 的职责包括：

- 渲染 ViewModel 暴露的 UI State。
- 把点击、输入、滑动、刷新等用户动作转发给 ViewModel。
- 执行少量与平台强相关的界面行为，例如请求系统权限、打开系统相册、页面跳转入口。
- 处理生命周期收集，例如在 Android 中使用 `repeatOnLifecycle` 收集状态。

View 不应该承担：

- 业务规则判断。
- 网络请求或数据库读写。
- 复杂数据转换。
- 跨页面共享业务状态。
- 拼接多数据源结果。

View 最理想的形态是一个“状态渲染器”。给它一个状态，它就能稳定画出对应界面；发生用户动作，它只把动作交给 ViewModel。

### 2.3 ViewModel

ViewModel 是 MVVM 的关键。它处在 View 和 Model 之间，负责接收用户动作，调用 Model 获取数据，再把数据转换成 View 可直接渲染的 UI State。

ViewModel 的职责包括：

- 暴露界面状态，例如 `StateFlow<ProfileUiState>`。
- 接收用户意图，例如 `onRefresh()`、`onRetryClick()`、`onNameChange(value)`。
- 调用 Repository 或 UseCase。
- 合并多个数据源。
- 管理加载态、错误态、空态、局部状态。
- 把领域模型转换成 UI 模型。
- 发出一次性效果，例如弹提示、导航、复制成功提示。

ViewModel 不应该做：

- 持有 Activity、Fragment、View、Context 的强引用。
- 直接操作具体控件。
- 处理复杂平台 UI 细节。
- 包含大量与数据库、网络框架相关的实现。
- 变成“所有逻辑的垃圾桶”。

ViewModel 的边界非常重要。它不是“更大的 Controller”，也不是“万能中介层”。好的 ViewModel 应该围绕一个界面或一个可复用业务视图组织状态，既不泄漏 UI 框架，又不过度下沉所有业务。

## 3. MVVM 与 MVC、MVP 的区别

### 3.1 MVC

MVC 中的 Model、View、Controller 分别表示数据、界面和控制器。很多早期项目名义上使用 MVC，但 Controller 实际上会膨胀成巨大的上帝类。在 Android 传统写法中，Activity 经常同时承担 View 和 Controller 的职责，导致 Activity 越来越难维护。

MVC 的常见问题：

- View 和 Controller 边界容易模糊。
- Controller 很容易直接依赖具体 UI 控件。
- 异步状态和生命周期管理困难。
- 测试粒度不清晰。

### 3.2 MVP

MVP 中 Presenter 负责协调 View 和 Model。View 通常实现一个接口，Presenter 通过接口驱动 View：

```kotlin
interface LoginView {
    fun showLoading()
    fun showError(message: String)
    fun navigateHome()
}
```

MVP 的优点是把逻辑从 View 中抽出来，缺点是 Presenter 通常会持有 View 接口引用，生命周期管理需要额外小心；同时 View 接口容易变得很细碎，界面稍微复杂就会有大量 `showXxx()`、`hideXxx()`、`updateXxx()` 方法。

### 3.3 MVVM

MVVM 倾向于让 View 观察状态，而不是让 ViewModel 命令式调用 View。ViewModel 不需要知道 View 的具体接口，只暴露状态：

```kotlin
data class LoginUiState(
    val username: String = "",
    val password: String = "",
    val isLoading: Boolean = false,
    val canSubmit: Boolean = false,
    val errorMessage: String? = null
)
```

View 根据状态渲染：

```kotlin
when {
    state.isLoading -> LoadingView()
    state.errorMessage != null -> ErrorView(state.errorMessage)
    else -> LoginForm(state)
}
```

MVVM 的核心变化是从“命令式更新界面”转为“状态驱动界面”。这种方式更适合现代响应式 UI，例如 Jetpack Compose、React、Vue、SwiftUI。

## 4. 标准数据流与事件流

MVVM 中最推荐的数据流是单向的：

```text
User Action -> View -> ViewModel -> Model -> ViewModel -> UiState -> View
```

例如用户进入个人主页：

1. View 初始化并开始收集 `uiState`。
2. View 调用 `viewModel.loadProfile(userId)`，或 ViewModel 在初始化时触发加载。
3. ViewModel 设置 `isLoading = true`。
4. ViewModel 调用 `UserRepository.getProfile(userId)`。
5. Repository 从本地缓存或远程接口获取数据。
6. ViewModel 将 `User` 转换成 `ProfileUiState`。
7. View 收到新状态并重新渲染。

单向数据流的好处是状态变化路径清晰。出现问题时可以沿着动作、ViewModel、Model、状态输出这条链路排查。

### 4.1 用户动作

用户动作不应该在 View 中被消化成业务逻辑。View 最好把动作显式命名后交给 ViewModel：

```kotlin
fun onRefresh() {
    viewModel.refresh()
}

fun onFollowClick() {
    viewModel.toggleFollow()
}
```

不要把业务判断写在 View 中：

```kotlin
// 不推荐
if (user.isVip && !user.isExpired) {
    api.follow(user.id)
}
```

更好的方式：

```kotlin
viewModel.onFollowClick()
```

ViewModel 内部再判断当前用户状态、调用用例、更新界面。

### 4.2 状态输出

状态输出应该尽量稳定、完整、不可变：

```kotlin
data class ProfileUiState(
    val isLoading: Boolean = false,
    val userName: String = "",
    val avatarUrl: String = "",
    val bio: String = "",
    val isFollowing: Boolean = false,
    val followerCountText: String = "",
    val error: UiError? = null
)
```

使用不可变状态的好处：

- 更容易定位状态变化。
- 更适合 Compose、React 等声明式 UI。
- 方便单元测试。
- 避免多个字段在不同回调中被局部改乱。

### 4.3 一次性事件

不是所有东西都适合放进 `UiState`。比如 Toast、Snackbar、导航、震动、打开系统分享面板，这些通常是一次性事件。如果把它们放在状态里，屏幕旋转或重新订阅时可能重复触发。

可以把一次性事件拆成 `UiEffect`：

```kotlin
sealed interface ProfileUiEffect {
    data class ShowMessage(val message: String) : ProfileUiEffect
    data object NavigateToLogin : ProfileUiEffect
    data class OpenShareSheet(val url: String) : ProfileUiEffect
}
```

ViewModel 使用 `Channel` 或 `SharedFlow` 发送：

```kotlin
private val _effect = Channel<ProfileUiEffect>(Channel.BUFFERED)
val effect = _effect.receiveAsFlow()

private suspend fun sendMessage(message: String) {
    _effect.send(ProfileUiEffect.ShowMessage(message))
}
```

View 单独收集 effect：

```kotlin
LaunchedEffect(Unit) {
    viewModel.effect.collect { effect ->
        when (effect) {
            is ProfileUiEffect.ShowMessage -> snackbarHostState.showSnackbar(effect.message)
            ProfileUiEffect.NavigateToLogin -> navController.navigate("login")
            is ProfileUiEffect.OpenShareSheet -> openShare(effect.url)
        }
    }
}
```

## 5. ViewModel 的职责边界

ViewModel 经常是项目里最容易膨胀的类。判断一个逻辑该不该放 ViewModel，可以看它属于哪一类。

### 5.1 应该放在 ViewModel 的逻辑

- 根据用户动作触发加载、提交、删除、刷新。
- 管理界面所需状态。
- 将领域模型映射成 UI 文案或 UI 模型。
- 合并多个 Flow。
- 控制请求并发，例如避免重复提交。
- 将业务错误转换成界面错误。
- 维护表单输入值和校验结果。

例如：

```kotlin
class LoginViewModel(
    private val loginUseCase: LoginUseCase
) : ViewModel() {

    private val _state = MutableStateFlow(LoginUiState())
    val state: StateFlow<LoginUiState> = _state.asStateFlow()

    fun onUsernameChange(value: String) {
        _state.update {
            it.copy(
                username = value,
                canSubmit = value.isNotBlank() && it.password.length >= 6
            )
        }
    }

    fun onPasswordChange(value: String) {
        _state.update {
            it.copy(
                password = value,
                canSubmit = it.username.isNotBlank() && value.length >= 6
            )
        }
    }

    fun submit() {
        val current = _state.value
        if (!current.canSubmit || current.isLoading) return

        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, errorMessage = null) }
            val result = loginUseCase(current.username, current.password)
            _state.update {
                result.fold(
                    onSuccess = { it.copy(isLoading = false) },
                    onFailure = { error -> it.copy(isLoading = false, errorMessage = error.message) }
                )
            }
        }
    }
}
```

### 5.2 不应该放在 ViewModel 的逻辑

过重的业务规则不适合直接放在 ViewModel。例如价格计算、优惠券叠加、订单状态机、风控规则、权限策略等，这些应该进入 UseCase 或 Domain Service。

不推荐：

```kotlin
fun calculatePrice(order: Order): BigDecimal {
    // 几百行促销、税费、会员价逻辑
}
```

推荐：

```kotlin
class CheckoutViewModel(
    private val calculateOrderPrice: CalculateOrderPriceUseCase
) : ViewModel()
```

平台相关能力也不适合放在 ViewModel。例如 `startActivity()`、直接读 `Resources`、直接请求权限、直接操作 View。ViewModel 可以发出意图，由 View 执行。

## 6. UI State、UI Event、UI Effect 的拆分

为了让 MVVM 更清晰，可以把界面相关内容拆成三类。

### 6.1 UI State

UI State 是当前界面的完整快照。它应该回答一个问题：现在界面应该长什么样？

```kotlin
data class ArticleListUiState(
    val isInitialLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val isLoadingMore: Boolean = false,
    val articles: List<ArticleUiModel> = emptyList(),
    val emptyText: String? = null,
    val errorText: String? = null,
    val hasMore: Boolean = true
)
```

状态应该尽量具体，不要只用一个巨大枚举覆盖所有情况。列表页常常同时存在刷新、加载更多、局部错误等状态，用单一 `Loading/Error/Success` 很容易表达不足。

### 6.2 UI Event

UI Event 是 View 传给 ViewModel 的用户事件：

```kotlin
sealed interface ArticleListEvent {
    data object Refresh : ArticleListEvent
    data object LoadMore : ArticleListEvent
    data class ArticleClick(val id: String) : ArticleListEvent
    data class FavoriteClick(val id: String) : ArticleListEvent
}
```

使用统一入口可以让事件处理更集中：

```kotlin
fun onEvent(event: ArticleListEvent) {
    when (event) {
        ArticleListEvent.Refresh -> refresh()
        ArticleListEvent.LoadMore -> loadMore()
        is ArticleListEvent.ArticleClick -> openArticle(event.id)
        is ArticleListEvent.FavoriteClick -> toggleFavorite(event.id)
    }
}
```

对于小界面，直接写 `onRefresh()`、`onRetry()` 也完全可以。不要为了形式统一而牺牲可读性。

### 6.3 UI Effect

UI Effect 表示一次性副作用：

```kotlin
sealed interface ArticleListEffect {
    data class NavigateToDetail(val articleId: String) : ArticleListEffect
    data class ShowToast(val message: String) : ArticleListEffect
}
```

拆出 Effect 的关键价值是避免把“发生一次的动作”误建模为“持续存在的状态”。

## 7. Android/Kotlin 中的典型落地

### 7.1 推荐目录结构

一个典型功能模块可以这样组织：

```text
feature/profile/
  ProfileScreen.kt
  ProfileViewModel.kt
  ProfileUiState.kt
  ProfileUiEffect.kt
  ProfileUiModel.kt
  ProfileMapper.kt
```

如果项目较大，可以再按 presentation、domain、data 拆：

```text
profile/
  presentation/
    ProfileScreen.kt
    ProfileViewModel.kt
    ProfileUiState.kt
  domain/
    GetProfileUseCase.kt
    FollowUserUseCase.kt
    UserRepository.kt
  data/
    UserRepositoryImpl.kt
    UserRemoteDataSource.kt
    UserLocalDataSource.kt
    UserDto.kt
    UserEntity.kt
```

目录不必一开始就复杂化。小项目可以先按功能聚合，随着复杂度提升再拆层。架构的目标是控制复杂度，不是制造目录。

### 7.2 StateFlow 作为状态容器

现代 Android 项目中，`StateFlow` 是 ViewModel 暴露状态的常用方式：

```kotlin
class ProfileViewModel(
    private val getProfile: GetProfileUseCase
) : ViewModel() {

    private val _state = MutableStateFlow(ProfileUiState())
    val state: StateFlow<ProfileUiState> = _state.asStateFlow()

    fun load(userId: String) {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            getProfile(userId)
                .onSuccess { user ->
                    _state.update {
                        it.copy(
                            isLoading = false,
                            userName = user.name,
                            avatarUrl = user.avatarUrl,
                            bio = user.bio
                        )
                    }
                }
                .onFailure { throwable ->
                    _state.update {
                        it.copy(
                            isLoading = false,
                            error = UiError(throwable.message ?: "加载失败")
                        )
                    }
                }
        }
    }
}
```

对外暴露 `StateFlow`，内部保留 `MutableStateFlow`，可以避免 View 直接修改状态。

### 7.3 Compose 中收集状态

在 Compose 中，View 可以这样收集：

```kotlin
@Composable
fun ProfileRoute(
    userId: String,
    viewModel: ProfileViewModel,
    onBack: () -> Unit
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(userId) {
        viewModel.load(userId)
    }

    ProfileScreen(
        state = state,
        onBack = onBack,
        onRetry = { viewModel.load(userId) },
        onFollowClick = viewModel::onFollowClick
    )
}
```

这里可以把 Composable 分成 Route 和 Screen：

- Route 负责拿 ViewModel、收集状态、处理导航和副作用。
- Screen 只负责纯 UI 渲染，参数都是普通数据和回调。

这种拆法有利于预览和测试：

```kotlin
@Composable
fun ProfileScreen(
    state: ProfileUiState,
    onBack: () -> Unit,
    onRetry: () -> Unit,
    onFollowClick: () -> Unit
) {
    // 只根据 state 画界面
}
```

### 7.4 XML View 中收集状态

如果项目使用 XML、Activity、Fragment，也可以落地 MVVM：

```kotlin
viewLifecycleOwner.lifecycleScope.launch {
    repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.state.collect { state ->
            binding.progress.isVisible = state.isLoading
            binding.errorText.isVisible = state.error != null
            binding.userName.text = state.userName
        }
    }
}
```

重点是生命周期感知收集，避免 Fragment 停止后继续更新无效 View。

## 8. Repository、UseCase 与 MVVM 的关系

MVVM 本身只定义 View、ViewModel、Model 的关系，并不强制要求 UseCase 或 Repository。但在中大型项目中，只靠 ViewModel 和 Repository 往往不够。

### 8.1 Repository

Repository 负责隐藏数据来源。ViewModel 不应该关心数据来自网络、数据库、缓存还是内存。

```kotlin
interface ArticleRepository {
    suspend fun refreshArticles(): Result<Unit>
    fun observeArticles(): Flow<List<Article>>
}
```

Repository 的实现可以协调多个数据源：

```kotlin
class ArticleRepositoryImpl(
    private val remoteDataSource: ArticleRemoteDataSource,
    private val localDataSource: ArticleLocalDataSource
) : ArticleRepository {

    override suspend fun refreshArticles(): Result<Unit> = runCatching {
        val remote = remoteDataSource.fetchArticles()
        localDataSource.replaceAll(remote.map { it.toEntity() })
    }

    override fun observeArticles(): Flow<List<Article>> {
        return localDataSource.observeAll()
            .map { list -> list.map { it.toDomain() } }
    }
}
```

### 8.2 UseCase

UseCase 表示一个业务动作。它可以很薄，也可以承载复杂规则。

```kotlin
class RefreshArticlesUseCase(
    private val repository: ArticleRepository
) {
    suspend operator fun invoke(): Result<Unit> {
        return repository.refreshArticles()
    }
}
```

复杂业务更需要 UseCase：

```kotlin
class SubmitOrderUseCase(
    private val orderRepository: OrderRepository,
    private val inventoryRepository: InventoryRepository,
    private val paymentRepository: PaymentRepository
) {
    suspend operator fun invoke(command: SubmitOrderCommand): Result<OrderId> {
        // 校验库存、锁定库存、创建订单、发起支付
        TODO()
    }
}
```

ViewModel 调 UseCase，而不是直接串联多个 Repository。这样可以避免 ViewModel 变成业务编排中心。

## 9. 状态管理、错误处理与加载态

### 9.1 加载态

加载态不要只用一个 `isLoading` 解决所有问题。不同场景的加载含义不同：

- 首次进入页面加载：通常需要骨架屏或整页 loading。
- 下拉刷新：已有数据仍显示，同时显示刷新指示。
- 加载更多：列表底部显示 loading。
- 按钮提交：按钮禁用并显示局部 loading。
- 局部卡片刷新：只影响某个组件。

因此状态可以拆得更具体：

```kotlin
data class FeedUiState(
    val isInitialLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val isLoadingMore: Boolean = false,
    val isSubmittingLike: Set<String> = emptySet(),
    val articles: List<ArticleUiModel> = emptyList()
)
```

状态越贴近真实界面，View 代码越简单。

### 9.2 错误处理

错误不应该在各处随意使用 `Throwable.message`。推荐把底层错误转换为应用错误，再转换成 UI 错误。

```kotlin
sealed interface AppError {
    data object NetworkUnavailable : AppError
    data object Unauthorized : AppError
    data class Server(val code: Int, val message: String) : AppError
    data class Unknown(val cause: Throwable) : AppError
}

data class UiError(
    val title: String,
    val message: String,
    val canRetry: Boolean
)
```

ViewModel 负责将 `AppError` 映射成用户能理解的文案：

```kotlin
fun AppError.toUiError(): UiError = when (this) {
    AppError.NetworkUnavailable -> UiError("网络不可用", "请检查网络连接后重试", true)
    AppError.Unauthorized -> UiError("登录已过期", "请重新登录后继续操作", false)
    is AppError.Server -> UiError("服务异常", message, true)
    is AppError.Unknown -> UiError("未知错误", "请稍后再试", true)
}
```

### 9.3 空态

空态不是错误。列表为空、搜索无结果、筛选条件无匹配，都应该有明确状态。

```kotlin
val emptyState: EmptyState? = when {
    articles.isNotEmpty() -> null
    keyword.isNotBlank() -> EmptyState.SearchNoResult(keyword)
    selectedTag != null -> EmptyState.FilterNoResult
    else -> EmptyState.NoContent
}
```

这样 UI 可以针对不同空态显示不同文案和操作。

## 10. 表单、列表、分页、刷新等常见场景

### 10.1 表单

表单适合由 ViewModel 管理输入值和校验结果：

```kotlin
data class RegisterUiState(
    val email: String = "",
    val password: String = "",
    val emailError: String? = null,
    val passwordError: String? = null,
    val canSubmit: Boolean = false,
    val isSubmitting: Boolean = false
)
```

输入变化时即时校验：

```kotlin
fun onEmailChange(value: String) {
    _state.update {
        val emailError = if (value.contains("@")) null else "邮箱格式不正确"
        it.copy(
            email = value,
            emailError = emailError,
            canSubmit = emailError == null && it.password.length >= 8
        )
    }
}
```

复杂表单可以把校验规则抽成 Validator 或 UseCase，避免 ViewModel 过长。

### 10.2 列表

列表页的 UI 模型通常不应该直接使用领域模型。领域模型关心业务语义，UI 模型关心展示：

```kotlin
data class ArticleUiModel(
    val id: String,
    val title: String,
    val summary: String,
    val authorText: String,
    val publishTimeText: String,
    val coverUrl: String?,
    val isFavorite: Boolean
)
```

这样时间格式、作者显示、空封面兜底等展示细节不会污染领域模型。

### 10.3 分页

分页状态需要避免重复加载和乱序写入：

```kotlin
fun loadMore() {
    val current = _state.value
    if (current.isLoadingMore || !current.hasMore) return

    viewModelScope.launch {
        _state.update { it.copy(isLoadingMore = true) }
        val page = current.nextPage
        val result = repository.loadPage(page)
        _state.update { state ->
            result.fold(
                onSuccess = { data ->
                    state.copy(
                        isLoadingMore = false,
                        articles = state.articles + data.items.map { it.toUiModel() },
                        nextPage = page + 1,
                        hasMore = data.hasMore
                    )
                },
                onFailure = {
                    state.copy(isLoadingMore = false, loadMoreError = "加载失败")
                }
            )
        }
    }
}
```

真实项目可以使用 Paging 3 等成熟库处理分页。架构上仍然保持 View 观察状态、ViewModel 协调加载、Repository 提供数据。

### 10.4 刷新

刷新通常有两种策略：

- 网络成功后更新本地数据库，界面观察数据库。
- 网络成功后直接更新内存状态。

前者更适合离线缓存和多页面共享数据；后者更适合简单页面。

推荐在中大型项目中采用“单一可信数据源”：界面主要观察本地数据库或内存 Store，网络刷新只负责同步数据。这样可以减少“网络返回数据”和“本地缓存数据”同时驱动 UI 的冲突。

## 11. 测试策略

MVVM 的一个重要收益是 ViewModel 可测试。因为 ViewModel 不依赖具体 UI 控件，所以可以通过输入事件和断言状态来测试。

### 11.1 ViewModel 单元测试

测试思路：

1. 准备假的 UseCase 或 Repository。
2. 创建 ViewModel。
3. 调用用户动作。
4. 收集状态。
5. 断言状态序列或最终状态。

示例：

```kotlin
@Test
fun loadProfile_success_updatesState() = runTest {
    val useCase = FakeGetProfileUseCase(
        result = Result.success(User("1", "Alice", "url", "Hello"))
    )
    val viewModel = ProfileViewModel(useCase)

    viewModel.load("1")
    advanceUntilIdle()

    val state = viewModel.state.value
    assertFalse(state.isLoading)
    assertEquals("Alice", state.userName)
    assertNull(state.error)
}
```

### 11.2 状态转换测试

复杂 ViewModel 可以把状态转换逻辑抽成纯函数：

```kotlin
fun Profile.toUiState(): ProfileUiState {
    return ProfileUiState(
        userName = name,
        avatarUrl = avatarUrl,
        bio = bio.ifBlank { "这个人还没有填写简介" }
    )
}
```

纯函数测试成本最低，也最稳定。

### 11.3 UI 测试

UI 测试不应该覆盖所有业务分支。它更适合验证关键流程：

- 首屏加载成功。
- 错误态点击重试。
- 表单输入和提交。
- 导航是否正确。
- 关键控件是否可见。

业务分支尽量放在 ViewModel 和 UseCase 单元测试中覆盖。

## 12. 常见反模式

### 12.1 ViewModel 持有 View 或 Context

ViewModel 生命周期通常比 View 长。持有 View、Activity、Fragment 容易造成泄漏。需要平台能力时，可以由 ViewModel 发出 Effect，让 View 执行。

### 12.2 ViewModel 直接返回 DTO 或 Entity

DTO 是网络协议模型，Entity 是数据库模型。它们都不应该直接暴露给 UI。否则 UI 会被数据源结构绑死，接口字段变化或数据库字段变化会影响界面层。

推荐链路：

```text
Dto -> Entity -> Domain Model -> Ui Model
```

不一定每个项目都需要所有模型，但要理解每一层模型的职责。

### 12.3 State 太碎

把每个字段都暴露成一个 `LiveData` 或 `Flow`，容易造成状态不一致。例如 `isLoading` 已经变成 false，但 `error` 还没更新。更推荐暴露一个完整 `UiState`。

### 12.4 State 太泛

只用 `sealed class UiState { Loading, Success, Error }` 也可能过于粗糙。复杂页面会同时存在多个区域和多个加载状态。状态设计要贴合页面真实复杂度。

### 12.5 业务逻辑全塞进 ViewModel

ViewModel 可以承担界面逻辑，但不应该吞掉领域逻辑。判断标准是：如果某段逻辑换一个界面仍然成立，就不应该只放在某个 ViewModel 里。

### 12.6 滥用双向绑定

双向绑定能减少样板代码，但复杂页面中可能让状态来源变得隐蔽。推荐保持显式事件和显式状态更新，尤其是在团队协作项目中。

### 12.7 忽略生命周期

在 Android 中直接从 Fragment 的 `lifecycleScope` 收集 Flow，可能在 View 销毁后继续更新旧 binding。应该使用 `viewLifecycleOwner.lifecycleScope` 和 `repeatOnLifecycle`。

## 13. 项目落地清单

### 13.1 文件组织

- 每个复杂页面有独立的 `ViewModel`。
- 每个页面有明确的 `UiState`。
- 一次性事件使用 `UiEffect` 或类似机制。
- UI 模型和领域模型职责清晰。
- Repository 隐藏数据来源。
- 复杂业务动作抽成 UseCase。

### 13.2 状态设计

- UI State 是不可变数据结构。
- 状态字段能完整描述界面。
- 加载态区分首次加载、刷新、加载更多、提交中。
- 错误态区分整页错误和局部错误。
- 空态不是错误，单独建模。
- 不把一次性导航和 Toast 当作长期状态。

### 13.3 ViewModel 设计

- 对外只暴露只读 Flow 或 LiveData。
- 内部通过统一入口更新状态。
- 不持有 View、Activity、Fragment。
- 不直接依赖网络框架、数据库框架细节。
- 不包含大量可复用业务规则。
- 用户动作方法命名清晰，例如 `onRetryClick()`、`onRefresh()`。

### 13.4 View 设计

- View 根据状态渲染。
- View 把用户动作转发给 ViewModel。
- View 执行平台 UI 副作用，例如导航、权限、系统分享。
- Compose 中尽量拆分 Route 和 Screen。
- XML View 中使用生命周期感知收集状态。

### 13.5 测试

- ViewModel 覆盖核心状态流转。
- UseCase 覆盖核心业务规则。
- Mapper 覆盖容易出错的格式转换。
- Repository 使用 fake data source 测试缓存和同步策略。
- UI 测试只覆盖关键用户路径。

## 14. 一个完整小例子

下面用文章列表页串起 MVVM 的核心写法。

### 14.1 UI State

```kotlin
data class ArticleListUiState(
    val isInitialLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val articles: List<ArticleUiModel> = emptyList(),
    val error: UiError? = null,
    val emptyText: String? = null
)

data class ArticleUiModel(
    val id: String,
    val title: String,
    val subtitle: String,
    val timeText: String,
    val favorite: Boolean
)
```

### 14.2 ViewModel

```kotlin
class ArticleListViewModel(
    private val observeArticles: ObserveArticlesUseCase,
    private val refreshArticles: RefreshArticlesUseCase,
    private val toggleFavorite: ToggleFavoriteUseCase
) : ViewModel() {

    private val _state = MutableStateFlow(ArticleListUiState())
    val state = _state.asStateFlow()

    init {
        observe()
        refresh()
    }

    private fun observe() {
        viewModelScope.launch {
            observeArticles().collect { articles ->
                _state.update {
                    it.copy(
                        isInitialLoading = false,
                        articles = articles.map { article -> article.toUiModel() },
                        emptyText = if (articles.isEmpty()) "暂无文章" else null
                    )
                }
            }
        }
    }

    fun refresh() {
        viewModelScope.launch {
            _state.update { it.copy(isRefreshing = true, error = null) }
            refreshArticles()
                .onFailure { error ->
                    _state.update {
                        it.copy(error = UiError("刷新失败", error.message ?: "请稍后重试"))
                    }
                }
            _state.update { it.copy(isRefreshing = false, isInitialLoading = false) }
        }
    }

    fun onFavoriteClick(articleId: String) {
        viewModelScope.launch {
            toggleFavorite(articleId)
        }
    }
}
```

### 14.3 View

```kotlin
@Composable
fun ArticleListRoute(
    viewModel: ArticleListViewModel,
    onArticleClick: (String) -> Unit
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    ArticleListScreen(
        state = state,
        onRefresh = viewModel::refresh,
        onArticleClick = onArticleClick,
        onFavoriteClick = viewModel::onFavoriteClick
    )
}
```

这个例子体现了几个关键点：

- ViewModel 暴露完整状态。
- View 只渲染和转发事件。
- Repository 和 UseCase 不泄漏到 View。
- 刷新动作只改变状态和调用业务能力。
- 列表数据来自观察流，适合缓存优先和离线显示。

## 15. MVVM 与团队协作

MVVM 的长期价值不仅是代码更整洁，也体现在团队协作上。

对 UI 开发者来说，只要知道 `UiState` 长什么样，就能独立实现界面。对业务开发者来说，只要保证 UseCase 和 Repository 输出正确，界面状态就能稳定更新。对测试人员来说，可以根据状态和事件设计用例。对代码评审来说，也更容易判断某段逻辑是否放错层。

团队使用 MVVM 时，建议统一几条规范：

- `ViewModel` 的公开方法必须表达用户意图或页面生命周期意图。
- `UiState` 放在同功能目录下，字段命名贴近界面。
- `UiEffect` 只放一次性行为，不放可持久显示的信息。
- 不允许 View 直接调用 Repository。
- 不允许 Repository 返回平台 UI 对象。
- Mapper 命名保持一致，例如 `toUiModel()`、`toDomain()`、`toEntity()`。

## 16. 总结

MVVM 的本质是状态驱动界面。View 不再负责理解所有业务，ViewModel 也不直接控制 View，而是把 Model 中的数据和业务结果整理成稳定的 UI State。只要数据流保持清晰，状态建模足够贴近页面，MVVM 就能显著降低复杂界面的维护成本。

真正落地 MVVM 时，不要只追求目录和类名。更重要的是坚持这些原则：

- 用户动作显式进入 ViewModel。
- ViewModel 输出不可变 UI State。
- View 只根据状态渲染。
- 一次性副作用单独处理。
- 数据源细节隐藏在 Model、Repository 或 UseCase 后面。
- 可复用业务规则不要塞进 ViewModel。
- 状态转换和业务规则都能被测试。

做到这些，MVVM 才不是模板代码，而是一套能长期支撑项目演进的结构化方法。
