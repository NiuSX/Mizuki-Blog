# Clean Architecture 架构万字精讲

## 目录

1. Clean Architecture 的核心目标
2. 依赖规则：所有设计的根
3. 四层模型：Entities、Use Cases、Interface Adapters、Frameworks
4. Android/Kotlin 项目中的分层方式
5. Domain 层设计
6. Data 层设计
7. Presentation 层设计
8. App 层、DI 与模块装配
9. Repository、DataSource、Mapper 的边界
10. 错误处理、结果类型与线程模型
11. 模块化与 Gradle 依赖
12. 测试策略
13. 常见反模式
14. 落地清单

## 1. Clean Architecture 的核心目标

Clean Architecture 通常翻译为整洁架构。它不是某一种具体框架，也不是 Android、后端或前端独有的写法，而是一套组织业务代码、控制依赖方向、隔离外部细节的架构思想。

它要解决的核心问题是：业务规则应该长期稳定，但框架、数据库、网络协议、UI 技术、第三方 SDK 都会变化。一个项目如果让业务规则直接依赖这些易变细节，就会在需求变更、技术升级、测试和重构时付出很高成本。

典型坏味道包括：

- 业务逻辑写在 Activity、Fragment、Controller、Composable 中。
- 领域模型上充满数据库注解、序列化注解、UI 字段。
- ViewModel 直接调用 Retrofit、Room、SharedPreferences。
- Repository 返回 DTO 或 Entity 给 UI。
- 数据库表结构变化导致整个 UI 层跟着修改。
- 网络接口字段名变化导致业务逻辑崩溃。
- 单元测试需要启动框架、数据库或网络环境。
- 模块之间循环依赖，改一处牵动大量文件。

Clean Architecture 的目标是把“稳定的业务规则”放在中心，把“容易变化的技术细节”放在外围。外围可以依赖内层，内层不能依赖外围。这样一来，核心业务不会被框架绑架。

一句话概括：

> Clean Architecture 的本质是用依赖倒置保护业务规则，让核心业务独立于 UI、数据库、网络、框架和外部服务。

## 2. 依赖规则：所有设计的根

Clean Architecture 最重要的原则是依赖规则：

```text
外层可以依赖内层，内层不能依赖外层。
```

在 Android/Kotlin 项目中可以理解为：

```text
presentation -> domain
data -> domain
app -> presentation, data, domain
domain -> 不依赖 Android、数据库、网络、UI 框架
```

注意一个关键点：Data 层和 Presentation 层都可以依赖 Domain 层，但 Domain 层不能依赖 Data 层，也不能依赖 Presentation 层。

为什么 Repository 接口常放在 Domain 层，而实现放在 Data 层？这是依赖倒置的体现。Domain 定义自己需要什么能力，Data 负责提供实现。

```kotlin
// domain 层
interface UserRepository {
    suspend fun getUser(id: String): Result<User>
}

// data 层
class UserRepositoryImpl(
    private val remoteDataSource: UserRemoteDataSource,
    private val localDataSource: UserLocalDataSource
) : UserRepository {
    override suspend fun getUser(id: String): Result<User> {
        TODO()
    }
}
```

从编译依赖看，Data 依赖 Domain，所以 Data 能实现 Domain 中的接口。Domain 不知道 Data 的存在，也不需要知道数据来自 Retrofit、Room、SQLDelight、Ktor 还是本地文件。

依赖规则的收益：

- 业务逻辑可单独测试。
- UI 技术可替换。
- 数据库和网络框架可替换。
- 模块职责清晰。
- 复杂系统能长期演进。

## 3. 四层模型

Clean Architecture 常被画成同心圆，从内到外大致包括：

```text
Entities -> Use Cases -> Interface Adapters -> Frameworks & Drivers
```

不同团队会使用不同命名。在 Android 项目中，常见对应关系是：

```text
Entities / Enterprise Business Rules -> domain model
Use Cases / Application Business Rules -> usecase
Interface Adapters -> presentation + repository implementation + mapper
Frameworks & Drivers -> Android framework + Room + Retrofit + Ktor + SQLDelight
```

### 3.1 Entities

Entities 是最核心、最稳定的业务对象和业务规则。它们不应该知道自己如何展示、如何存储、如何从网络解析。

例如：

```kotlin
data class Order(
    val id: OrderId,
    val items: List<OrderItem>,
    val status: OrderStatus,
    val totalPrice: Money
) {
    fun canCancel(): Boolean {
        return status == OrderStatus.CREATED || status == OrderStatus.PAID
    }
}
```

这里的 `canCancel()` 是领域规则。无论 UI 用 Compose 还是 XML，数据库用 Room 还是 SQLDelight，订单是否可取消的规则都应该保持一致。

### 3.2 Use Cases

UseCase 表示应用的一项业务动作，例如登录、提交订单、刷新文章、同步用户数据、检查权限。它是业务流程的编排层。

```kotlin
class CancelOrderUseCase(
    private val orderRepository: OrderRepository,
    private val paymentRepository: PaymentRepository
) {
    suspend operator fun invoke(orderId: OrderId): Result<Unit> {
        val order = orderRepository.getOrder(orderId).getOrThrow()
        require(order.canCancel()) { "当前订单不可取消" }

        if (order.status == OrderStatus.PAID) {
            paymentRepository.refund(order.id)
        }
        return orderRepository.cancel(order.id)
    }
}
```

UseCase 关心业务流程，不关心按钮在哪里，也不关心接口 URL 是什么。

### 3.3 Interface Adapters

Interface Adapters 负责在内层业务模型和外层技术模型之间转换。典型内容包括：

- ViewModel。
- Presenter。
- Controller。
- Repository 实现。
- DTO、Entity 与 Domain Model 的 Mapper。
- UI Model 与 Domain Model 的 Mapper。

这一层的关键词是“适配”。它把外部世界的数据格式转换成内部业务能理解的格式，也把内部业务结果转换成外部界面能展示的格式。

### 3.4 Frameworks & Drivers

最外层是具体框架和工具，例如：

- Android Activity、Fragment、Service。
- Jetpack Compose、XML View。
- Room、SQLite、SQLDelight。
- Retrofit、OkHttp、Ktor。
- SharedPreferences、DataStore。
- 第三方登录、支付、地图、推送 SDK。

这些技术很重要，但它们不是业务核心。Clean Architecture 要避免让内层业务直接依赖它们。

## 4. Android/Kotlin 项目中的分层方式

一个保守、清晰的 Android 项目结构可以是：

```text
project/
  app/
  core/
  domain/
  data/
  presentation/
  design-system/
  feature/
    auth/
    profile/
    settings/
```

### 4.1 app 模块

`app` 是应用入口，负责：

- Application 类。
- MainActivity。
- 导航宿主。
- 依赖注入装配。
- 构建变体配置。
- 应用级初始化。

`app` 可以依赖其他模块，但不应该承载大量业务逻辑。

### 4.2 core 模块

`core` 放跨层共享但不属于具体业务的基础设施，例如：

- 通用错误类型。
- 时间、金额、分页等基础值对象。
- Result 封装。
- Coroutine Dispatcher Provider。
- 日志接口。
- 通用扩展函数。

需要谨慎控制 `core`。它很容易变成杂物间。能放到具体 feature 的，就不要提前放进 core。

### 4.3 domain 模块

`domain` 是核心业务层，应该尽可能纯 Kotlin。它包含：

- 领域模型。
- 值对象。
- Repository 接口。
- UseCase。
- 领域服务。
- 业务错误类型。

`domain` 不应该依赖 Android SDK、Room、Retrofit、Compose、数据库注解、JSON 注解。

### 4.4 data 模块

`data` 负责实现数据获取和存储，包含：

- Repository 实现。
- RemoteDataSource。
- LocalDataSource。
- DTO。
- Entity。
- Mapper。
- 网络 API 定义。
- 数据库 DAO。

Data 层依赖 Domain 层，因为它要实现 Domain 定义的 Repository 接口，并把 DTO/Entity 转换为 Domain Model。

### 4.5 presentation 模块

`presentation` 负责 UI 状态和交互，包含：

- ViewModel。
- UiState。
- UiEvent。
- UiEffect。
- UI Model。
- UI Mapper。
- Screen 或 Fragment。

Presentation 层依赖 Domain 层，通过 UseCase 获取业务结果。它不直接依赖 Data 层实现。

### 4.6 feature 模块

大型项目常按功能拆模块：

```text
feature/profile/
  presentation/
  domain/
  data/
```

也可以按层拆：

```text
domain/
data/
presentation/
feature/profile/
```

两种方式没有绝对优劣。按层拆适合中小项目，结构直观；按功能拆适合大团队并行开发，功能边界更清楚。关键是依赖方向必须清晰。

## 5. Domain 层设计

Domain 是 Clean Architecture 的中心。它应该是最稳定、最容易测试、最少依赖的部分。

### 5.1 领域模型

领域模型表达业务概念，而不是数据库表或接口响应。

```kotlin
data class User(
    val id: UserId,
    val name: String,
    val membership: Membership,
    val status: UserStatus
) {
    val canAccessPremiumContent: Boolean
        get() = membership.isActive && status == UserStatus.ACTIVE
}

@JvmInline
value class UserId(val value: String)

enum class UserStatus {
    ACTIVE,
    DISABLED,
    DELETED
}
```

使用值对象可以减少参数误传：

```kotlin
@JvmInline
value class OrderId(val value: String)

@JvmInline
value class ProductId(val value: String)
```

相比全部使用 `String`，值对象让函数签名更准确。

### 5.2 UseCase

UseCase 的命名应该描述业务动作：

- `LoginUseCase`
- `GetUserProfileUseCase`
- `ObserveArticlesUseCase`
- `SubmitOrderUseCase`
- `SyncUserDataUseCase`
- `CalculateOrderPriceUseCase`

简单 UseCase 可以很薄：

```kotlin
class GetUserProfileUseCase(
    private val repository: UserRepository
) {
    suspend operator fun invoke(userId: UserId): Result<User> {
        return repository.getUser(userId)
    }
}
```

薄 UseCase 不是坏事。它提供了稳定的业务入口，未来如果逻辑变复杂，可以在不影响 ViewModel 的情况下扩展。

复杂 UseCase 可以编排多个 Repository：

```kotlin
class CheckoutUseCase(
    private val cartRepository: CartRepository,
    private val orderRepository: OrderRepository,
    private val paymentRepository: PaymentRepository
) {
    suspend operator fun invoke(userId: UserId): Result<OrderId> = runCatching {
        val cart = cartRepository.getCart(userId).getOrThrow()
        require(cart.items.isNotEmpty()) { "购物车不能为空" }

        val order = orderRepository.createOrder(cart).getOrThrow()
        paymentRepository.createPayment(order.id).getOrThrow()
        cartRepository.clearCart(userId).getOrThrow()
        order.id
    }
}
```

### 5.3 Repository 接口

Repository 接口放在 Domain 层，表达业务需要的数据能力：

```kotlin
interface ArticleRepository {
    fun observeArticles(): Flow<List<Article>>
    suspend fun refreshArticles(): Result<Unit>
    suspend fun toggleFavorite(articleId: ArticleId): Result<Unit>
}
```

接口不应该泄漏 DTO、Entity、Retrofit Response、Room PagingSource 等外层细节。

不推荐：

```kotlin
interface ArticleRepository {
    suspend fun getArticles(): Response<List<ArticleDto>>
}
```

推荐：

```kotlin
interface ArticleRepository {
    suspend fun getArticles(): Result<List<Article>>
}
```

### 5.4 Domain 不依赖框架

Domain 层应该避免：

- `android.content.Context`
- `androidx.lifecycle.ViewModel`
- `androidx.room.Entity`
- `retrofit2.Response`
- `kotlinx.serialization.Serializable` 是否允许要谨慎，严格项目也会避免
- UI 文案资源 ID
- Compose 类型

Domain 越纯净，测试和复用越容易。

## 6. Data 层设计

Data 层是外部数据世界的适配器。它需要知道网络、数据库、缓存、文件、系统服务等细节，但这些细节不能泄漏到 Domain 和 Presentation。

### 6.1 Repository 实现

Repository 实现负责协调多个 DataSource：

```kotlin
class ArticleRepositoryImpl(
    private val remoteDataSource: ArticleRemoteDataSource,
    private val localDataSource: ArticleLocalDataSource
) : ArticleRepository {

    override fun observeArticles(): Flow<List<Article>> {
        return localDataSource.observeArticles()
            .map { entities -> entities.map { it.toDomain() } }
    }

    override suspend fun refreshArticles(): Result<Unit> = runCatching {
        val remoteArticles = remoteDataSource.fetchArticles()
        localDataSource.replaceArticles(remoteArticles.map { it.toEntity() })
    }

    override suspend fun toggleFavorite(articleId: ArticleId): Result<Unit> = runCatching {
        localDataSource.toggleFavorite(articleId.value)
        remoteDataSource.syncFavorite(articleId.value)
    }
}
```

Repository 实现可以决定缓存策略：

- 网络优先。
- 本地优先。
- 先返回缓存，再后台刷新。
- 单一可信数据源。
- 离线写入，联网后同步。

这些策略属于数据层，不应该散落在 ViewModel 中。

### 6.2 RemoteDataSource

RemoteDataSource 封装网络 API：

```kotlin
class ArticleRemoteDataSource(
    private val api: ArticleApi
) {
    suspend fun fetchArticles(): List<ArticleDto> {
        return api.getArticles()
    }
}

interface ArticleApi {
    suspend fun getArticles(): List<ArticleDto>
}
```

如果使用 Retrofit，`ArticleApi` 可以带 Retrofit 注解。注意这些注解应该留在 Data 层。

### 6.3 LocalDataSource

LocalDataSource 封装数据库或本地缓存：

```kotlin
class ArticleLocalDataSource(
    private val dao: ArticleDao
) {
    fun observeArticles(): Flow<List<ArticleEntity>> {
        return dao.observeAll()
    }

    suspend fun replaceArticles(articles: List<ArticleEntity>) {
        dao.replaceAll(articles)
    }

    suspend fun toggleFavorite(articleId: String) {
        dao.toggleFavorite(articleId)
    }
}
```

数据库 DAO、Entity 都属于 Data 层。

### 6.4 DTO、Entity、Domain Model 的区别

三类模型不要混用。

DTO 表示网络协议：

```kotlin
data class ArticleDto(
    val id: String,
    val title: String,
    val summary: String?,
    val published_at: String
)
```

Entity 表示本地存储结构：

```kotlin
@Entity(tableName = "articles")
data class ArticleEntity(
    @PrimaryKey val id: String,
    val title: String,
    val summary: String,
    val publishedAt: Long,
    val favorite: Boolean
)
```

Domain Model 表示业务概念：

```kotlin
data class Article(
    val id: ArticleId,
    val title: String,
    val summary: String,
    val publishedAt: Instant,
    val favorite: Boolean
)
```

它们变化原因不同：

- DTO 因接口协议变化而变化。
- Entity 因数据库设计变化而变化。
- Domain Model 因业务概念变化而变化。

混用会让变化互相污染。

### 6.5 Mapper

Mapper 负责模型转换：

```kotlin
fun ArticleDto.toEntity(): ArticleEntity {
    return ArticleEntity(
        id = id,
        title = title,
        summary = summary.orEmpty(),
        publishedAt = parseTime(published_at),
        favorite = false
    )
}

fun ArticleEntity.toDomain(): Article {
    return Article(
        id = ArticleId(id),
        title = title,
        summary = summary,
        publishedAt = Instant.fromEpochMilliseconds(publishedAt),
        favorite = favorite
    )
}
```

Mapper 放在哪里取决于转换两端：

- DTO -> Entity：Data 层。
- Entity -> Domain：Data 层，因为 Entity 属于 Data。
- Domain -> UiModel：Presentation 层。

不要让 Domain 层写 `Entity.toDomain()`，因为 Domain 不应该知道 Entity。

## 7. Presentation 层设计

Presentation 层负责把业务结果变成界面状态。它通常使用 MVVM、MVI、MVP 等表现层模式。Clean Architecture 不强制表现层模式，但在 Android 中 MVVM 很常见。

### 7.1 ViewModel 调用 UseCase

```kotlin
class ProfileViewModel(
    private val getUserProfile: GetUserProfileUseCase,
    private val followUser: FollowUserUseCase
) : ViewModel() {

    private val _state = MutableStateFlow(ProfileUiState())
    val state = _state.asStateFlow()

    fun load(userId: String) {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            getUserProfile(UserId(userId))
                .onSuccess { user ->
                    _state.update { state ->
                        state.copy(
                            isLoading = false,
                            profile = user.toUiModel()
                        )
                    }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(isLoading = false, error = error.toUiError())
                    }
                }
        }
    }
}
```

ViewModel 不直接创建 Retrofit，不直接访问 DAO，不直接操作数据库。

### 7.2 UI State

```kotlin
data class ProfileUiState(
    val isLoading: Boolean = false,
    val profile: ProfileUiModel? = null,
    val error: UiError? = null,
    val isFollowSubmitting: Boolean = false
)

data class ProfileUiModel(
    val id: String,
    val displayName: String,
    val avatarUrl: String,
    val membershipText: String,
    val canFollow: Boolean
)
```

UI Model 可以包含展示文案、格式化后的时间、按钮是否可用等 UI 友好的字段。不要把这些展示细节塞到 Domain Model。

### 7.3 UI Effect

一次性效果用单独通道：

```kotlin
sealed interface ProfileEffect {
    data object NavigateToLogin : ProfileEffect
    data class ShowMessage(val message: String) : ProfileEffect
}
```

这样可以避免状态重放导致重复 Toast 或重复导航。

### 7.4 Compose 与 Clean Architecture

Compose 是 UI 技术，属于外层。它不应该进入 Domain 层。常见做法：

```text
ProfileRoute -> ProfileViewModel -> UseCase -> Repository interface
```

`ProfileScreen` 最好只接收 `UiState` 和回调：

```kotlin
@Composable
fun ProfileScreen(
    state: ProfileUiState,
    onRetry: () -> Unit,
    onFollowClick: () -> Unit
) {
    // render state
}
```

这使得 UI 预览和测试更简单。

## 8. App 层、DI 与模块装配

Clean Architecture 强调内层不依赖外层，但运行时总要把接口和实现连接起来。这个工作通常由 App 层和依赖注入完成。

### 8.1 Hilt 示例

```kotlin
@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    abstract fun bindUserRepository(
        impl: UserRepositoryImpl
    ): UserRepository
}
```

ViewModel 注入 UseCase：

```kotlin
@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val getUserProfile: GetUserProfileUseCase
) : ViewModel()
```

UseCase 注入 Repository 接口：

```kotlin
class GetUserProfileUseCase @Inject constructor(
    private val repository: UserRepository
)
```

### 8.2 Koin 示例

KMP 或轻量项目中可以使用 Koin：

```kotlin
val domainModule = module {
    factory { GetUserProfileUseCase(get()) }
    factory { FollowUserUseCase(get()) }
}

val dataModule = module {
    single<UserRepository> { UserRepositoryImpl(get(), get()) }
    single { UserRemoteDataSource(get()) }
    single { UserLocalDataSource(get()) }
}

val presentationModule = module {
    viewModel { ProfileViewModel(get(), get()) }
}
```

DI 的重点不是使用哪个框架，而是让依赖关系显式、可替换、可测试。

## 9. Repository、DataSource、Mapper 的边界

这三个概念最容易混乱。

### 9.1 Repository

Repository 面向业务，回答“业务需要什么数据能力”。它可以组合多个数据源，决定缓存策略和同步策略。

它不应该只机械转发 API：

```kotlin
// 价值较低
class UserRepositoryImpl(private val api: UserApi) {
    suspend fun getUser(id: String) = api.getUser(id)
}
```

更有价值的 Repository 会隐藏数据细节：

```kotlin
class UserRepositoryImpl(
    private val remote: UserRemoteDataSource,
    private val local: UserLocalDataSource
) : UserRepository {

    override fun observeUser(id: UserId): Flow<User> {
        return local.observeUser(id.value).map { it.toDomain() }
    }

    override suspend fun refreshUser(id: UserId): Result<Unit> = runCatching {
        val dto = remote.fetchUser(id.value)
        local.upsert(dto.toEntity())
    }
}
```

### 9.2 DataSource

DataSource 面向具体数据来源：

- RemoteDataSource 只关心远程接口。
- LocalDataSource 只关心本地数据库或缓存。
- PreferencesDataSource 只关心简单键值存储。
- FileDataSource 只关心文件。

DataSource 不应该知道复杂业务流程。它是 Repository 使用的工具。

### 9.3 Mapper

Mapper 是层与层之间的翻译器。它应该尽量是纯函数，便于测试。

复杂 Mapper 可以拆成类：

```kotlin
class ArticleUiMapper(
    private val dateFormatter: DateFormatter
) {
    fun map(article: Article): ArticleUiModel {
        return ArticleUiModel(
            id = article.id.value,
            title = article.title,
            timeText = dateFormatter.format(article.publishedAt),
            favorite = article.favorite
        )
    }
}
```

如果格式化依赖地区、语言、资源，通常属于 Presentation 层。

## 10. 错误处理、结果类型与线程模型

### 10.1 错误类型

不要让底层异常直接穿透到 UI。可以定义应用错误：

```kotlin
sealed interface AppError {
    data object NetworkUnavailable : AppError
    data object Unauthorized : AppError
    data class Server(val code: Int, val message: String) : AppError
    data class Validation(val message: String) : AppError
    data class Unknown(val cause: Throwable) : AppError
}
```

Repository 把 IOException、HTTP 错误、数据库异常转换成 AppError。UseCase 可以产生业务错误，例如余额不足、库存不足、权限不足。

### 10.2 Result 封装

Kotlin 自带 `Result<T>` 可以用于简单场景。复杂项目可以定义自己的结果类型：

```kotlin
sealed interface AppResult<out T> {
    data class Success<T>(val value: T) : AppResult<T>
    data class Failure(val error: AppError) : AppResult<Nothing>
}
```

自定义类型的好处是错误结构可控，不依赖 Throwable，也更容易表达业务错误。

### 10.3 线程模型

UseCase 通常不应该硬编码 Dispatcher，除非它本身负责 CPU 密集计算。Repository 或 DataSource 可以在需要时切换 IO。

可以注入 DispatcherProvider：

```kotlin
interface DispatcherProvider {
    val io: CoroutineDispatcher
    val default: CoroutineDispatcher
    val main: CoroutineDispatcher
}
```

Data 层使用：

```kotlin
class ArticleRepositoryImpl(
    private val dispatchers: DispatcherProvider,
    private val remote: ArticleRemoteDataSource
) : ArticleRepository {

    override suspend fun refreshArticles(): Result<Unit> {
        return withContext(dispatchers.io) {
            runCatching {
                remote.fetchArticles()
                Unit
            }
        }
    }
}
```

测试时可以替换 Dispatcher。

## 11. 模块化与 Gradle 依赖

### 11.1 基础依赖关系

推荐依赖方向：

```text
app -> presentation, data, domain
presentation -> domain, core
data -> domain, core
domain -> core 或无依赖
core -> 无业务依赖
```

严格项目中，Domain 可以完全不依赖 Core，以保持最纯净。实际项目可以允许 Domain 依赖一小部分稳定的 `core-model` 或 `core-common`。

### 11.2 按功能模块化

大型项目可以这样：

```text
feature-auth/
  auth-domain
  auth-data
  auth-presentation

feature-profile/
  profile-domain
  profile-data
  profile-presentation
```

优点：

- 功能边界清晰。
- 团队并行开发冲突少。
- 可以按功能控制依赖和发布。

缺点：

- 模块数量多。
- Gradle 配置复杂。
- 小项目会显得过重。

### 11.3 约定插件

当模块很多时，可以使用 Gradle convention plugin 减少重复：

```kotlin
// build-logic/src/main/kotlin/android-library.gradle.kts
plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
}

android {
    compileSdk = 36
}
```

模块中只写：

```kotlin
plugins {
    id("android-library")
}
```

这不是 Clean Architecture 的必要条件，但能提升大型项目的一致性。

## 12. 测试策略

Clean Architecture 的测试收益非常明显，因为核心业务不依赖框架。

### 12.1 Domain 测试

领域模型和 UseCase 应该优先测试：

```kotlin
@Test
fun cancelPaidOrder_refundsPaymentAndCancelsOrder() = runTest {
    val orderRepository = FakeOrderRepository(
        order = Order(id = OrderId("1"), status = OrderStatus.PAID)
    )
    val paymentRepository = FakePaymentRepository()
    val useCase = CancelOrderUseCase(orderRepository, paymentRepository)

    val result = useCase(OrderId("1"))

    assertTrue(result.isSuccess)
    assertTrue(paymentRepository.refunded)
    assertTrue(orderRepository.cancelled)
}
```

Domain 测试不应该需要启动 Android 环境。

### 12.2 Data 测试

Data 层测试关注：

- Repository 缓存策略是否正确。
- DTO/Entity/Domain Mapper 是否正确。
- 网络错误是否被正确转换。
- 数据库读写是否符合预期。

可以使用 fake data source 测 Repository：

```kotlin
class FakeArticleRemoteDataSource : ArticleRemoteDataSource {
    var articles: List<ArticleDto> = emptyList()
    override suspend fun fetchArticles(): List<ArticleDto> = articles
}
```

数据库可以使用内存数据库做集成测试。

### 12.3 Presentation 测试

ViewModel 测试关注状态变化：

```kotlin
@Test
fun loadProfile_whenSuccess_updatesProfileState() = runTest {
    val useCase = FakeGetUserProfileUseCase(
        Result.success(User(UserId("1"), "Alice", Membership.Active, UserStatus.ACTIVE))
    )
    val viewModel = ProfileViewModel(useCase)

    viewModel.load("1")
    advanceUntilIdle()

    assertEquals("Alice", viewModel.state.value.profile?.displayName)
    assertFalse(viewModel.state.value.isLoading)
}
```

UI 测试保留给关键路径，不要试图用 UI 测试覆盖所有业务分支。

## 13. 常见反模式

### 13.1 Domain 依赖 Data

这是最严重的问题之一。Domain 一旦依赖 Data，依赖规则就被反转，业务核心会被数据库和网络细节污染。

错误：

```kotlin
class GetUserUseCase(
    private val repository: UserRepositoryImpl
)
```

正确：

```kotlin
class GetUserUseCase(
    private val repository: UserRepository
)
```

### 13.2 Repository 接口返回 DTO

错误：

```kotlin
interface UserRepository {
    suspend fun getUser(): UserDto
}
```

这会让 Domain 知道网络协议。正确做法是返回 Domain Model：

```kotlin
interface UserRepository {
    suspend fun getUser(): Result<User>
}
```

### 13.3 ViewModel 直接操作 DataSource

错误：

```kotlin
class ProfileViewModel(
    private val api: UserApi,
    private val dao: UserDao
) : ViewModel()
```

正确：

```kotlin
class ProfileViewModel(
    private val getUserProfile: GetUserProfileUseCase
) : ViewModel()
```

### 13.4 过度抽象

Clean Architecture 不是要求每个接口都配一个 UseCase、每个类都配一个 Mapper、每个字段都配一个值对象。过度抽象会让小项目变得难读。

判断是否需要抽象，可以看：

- 这段逻辑是否会被多个入口复用。
- 是否存在明确的变化点。
- 是否需要单独测试。
- 是否会被外部框架污染。
- 抽象后是否真的降低复杂度。

### 13.5 贫血 UseCase 堆积

每个 Repository 方法机械包一层 UseCase，在小项目中可能只增加样板代码。更务实的做法是：核心业务动作、跨 Repository 编排、可复用规则、需要测试的流程优先使用 UseCase；纯 CRUD 页面可以适度简化。

### 13.6 Mapper 混乱

常见问题：

- UI 直接拿 Entity。
- Domain Model 带 Room 注解。
- DTO 同时用于数据库和 UI。
- Mapper 到处散落，命名不一致。

建议统一：

- `Dto.toEntity()` 在 Data。
- `Entity.toDomain()` 在 Data。
- `Domain.toUiModel()` 在 Presentation。

### 13.7 core 模块膨胀

`core` 不是垃圾桶。不要把还没复用的东西提前放进 core。过大的 core 会制造隐形耦合，导致所有模块都依赖一堆不相关工具。

## 14. 落地清单

### 14.1 依赖规则

- Domain 不依赖 Data。
- Domain 不依赖 Presentation。
- Domain 不依赖 Android UI 框架。
- Data 实现 Domain 定义的 Repository 接口。
- Presentation 通过 UseCase 访问业务能力。
- App 负责装配依赖。

### 14.2 Domain

- 领域模型表达业务概念。
- UseCase 表达业务动作。
- Repository 接口返回 Domain Model。
- 不暴露 DTO、Entity、Response、DAO。
- 复杂业务规则有单元测试。

### 14.3 Data

- RemoteDataSource 封装网络。
- LocalDataSource 封装数据库。
- Repository 实现缓存和同步策略。
- DTO、Entity、Domain Model 分离。
- Mapper 位置符合依赖方向。
- 错误被转换为应用错误。

### 14.4 Presentation

- ViewModel 调用 UseCase。
- UI State 表达界面状态。
- UI Effect 表达一次性副作用。
- UI Model 不污染 Domain Model。
- View 不直接访问 Repository 或 DataSource。

### 14.5 测试

- Domain 纯单元测试。
- UseCase 覆盖核心业务流程。
- Repository 使用 fake data source 测策略。
- Mapper 测边界字段。
- ViewModel 测状态变化。
- UI 测试覆盖关键路径。

## 15. 一个完整业务链路示例

以“刷新文章列表”为例，Clean Architecture 中的链路如下：

```text
ArticleScreen
  -> ArticleViewModel.refresh()
  -> RefreshArticlesUseCase()
  -> ArticleRepository.refreshArticles()
  -> ArticleRemoteDataSource.fetchArticles()
  -> ArticleLocalDataSource.replaceArticles()
  -> ArticleRepository.observeArticles()
  -> ArticleViewModel updates UiState
  -> ArticleScreen renders
```

### 15.1 Domain

```kotlin
data class Article(
    val id: ArticleId,
    val title: String,
    val summary: String,
    val publishedAt: Instant
)

@JvmInline
value class ArticleId(val value: String)

interface ArticleRepository {
    fun observeArticles(): Flow<List<Article>>
    suspend fun refreshArticles(): Result<Unit>
}

class ObserveArticlesUseCase(
    private val repository: ArticleRepository
) {
    operator fun invoke(): Flow<List<Article>> {
        return repository.observeArticles()
    }
}

class RefreshArticlesUseCase(
    private val repository: ArticleRepository
) {
    suspend operator fun invoke(): Result<Unit> {
        return repository.refreshArticles()
    }
}
```

### 15.2 Data

```kotlin
class ArticleRepositoryImpl(
    private val remote: ArticleRemoteDataSource,
    private val local: ArticleLocalDataSource
) : ArticleRepository {

    override fun observeArticles(): Flow<List<Article>> {
        return local.observeArticles()
            .map { entities -> entities.map { it.toDomain() } }
    }

    override suspend fun refreshArticles(): Result<Unit> = runCatching {
        val dtos = remote.fetchArticles()
        local.replaceArticles(dtos.map { it.toEntity() })
    }
}
```

### 15.3 Presentation

```kotlin
data class ArticleListUiState(
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val articles: List<ArticleUiModel> = emptyList(),
    val error: String? = null
)

class ArticleViewModel(
    private val observeArticles: ObserveArticlesUseCase,
    private val refreshArticles: RefreshArticlesUseCase
) : ViewModel() {

    private val _state = MutableStateFlow(ArticleListUiState(isLoading = true))
    val state = _state.asStateFlow()

    init {
        viewModelScope.launch {
            observeArticles().collect { articles ->
                _state.update {
                    it.copy(
                        isLoading = false,
                        articles = articles.map { article -> article.toUiModel() }
                    )
                }
            }
        }
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _state.update { it.copy(isRefreshing = true, error = null) }
            refreshArticles()
                .onFailure { error ->
                    _state.update { it.copy(error = error.message ?: "刷新失败") }
                }
            _state.update { it.copy(isRefreshing = false, isLoading = false) }
        }
    }
}
```

这个链路体现了 Clean Architecture 的核心：

- UI 不知道数据来自哪里。
- ViewModel 不知道网络和数据库细节。
- UseCase 不知道 UI 和框架。
- Repository 接口由 Domain 定义。
- Repository 实现由 Data 提供。
- DTO、Entity 不进入 Presentation。

## 16. Clean Architecture 与 MVVM 的关系

MVVM 是表现层架构模式，主要解决 View 和 ViewModel 如何协作。Clean Architecture 是整体架构模式，主要解决业务核心与外部细节如何隔离。

二者不是竞争关系，而是经常组合使用：

```text
View -> ViewModel -> UseCase -> Repository Interface -> Repository Impl -> DataSource
```

其中：

- View 和 ViewModel 属于 MVVM 的核心。
- UseCase、Repository Interface、Domain Model 属于 Clean Architecture 的核心。
- Repository Impl、DataSource、DTO、Entity 是外层适配。

如果只用 MVVM，不做 Clean Architecture，ViewModel 可能直接调用 API 和 DAO，项目变大后仍然会混乱。如果只讲 Clean Architecture，不设计好表现层状态，UI 仍然可能难维护。二者结合，可以同时解决 UI 复杂度和业务依赖问题。

## 17. 如何渐进式改造旧项目

旧项目不适合一次性大重构。更务实的方式是按功能逐步改造。

### 17.1 第一步：阻止继续变坏

新需求尽量不要再把网络、数据库、业务规则写进 Activity 或 Fragment。新增复杂逻辑时，先放进 ViewModel、Repository 或 UseCase。

### 17.2 第二步：抽 Repository 接口

找到 ViewModel 中直接调用 API 或 DAO 的地方，抽出 Repository：

```text
ViewModel -> UserRepository -> Api/Dao
```

初期接口可以放在同模块，等稳定后再移到 Domain。

### 17.3 第三步：拆模型

把 DTO、Entity、UI Model 慢慢拆开。优先处理变化频繁、Bug 多、测试困难的页面。

### 17.4 第四步：引入 UseCase

对跨多个 Repository 的业务流程、复杂校验、可复用规则引入 UseCase。不要一开始机械创建大量空壳 UseCase。

### 17.5 第五步：调整模块依赖

当代码边界稳定后，再拆 Gradle 模块。模块化应该服务于边界，而不是先有目录再硬塞代码。

## 18. 总结

Clean Architecture 的关键不是类名，而是依赖方向和业务边界。只要做到内层业务不依赖外层细节，Repository 接口由业务定义，外部框架通过适配器接入，项目就已经抓住了整洁架构的核心。

实践时要记住：

- Domain 是核心，越纯越好。
- UseCase 表达业务动作。
- Repository 接口属于业务需求，实现属于数据细节。
- DTO、Entity、UiModel 不要混用。
- ViewModel 不直接碰网络和数据库。
- App 或 DI 负责把接口和实现装配起来。
- 测试优先覆盖 Domain、UseCase、Repository 策略和 ViewModel 状态。
- 架构要服务复杂度，不要为了形式制造复杂度。

Clean Architecture 最终追求的是长期可维护性。它让核心业务可以在 UI、数据库、网络协议、第三方 SDK 都变化的情况下保持稳定，让团队在项目变大后仍然能清楚地知道代码应该放在哪里、依赖应该指向哪里、测试应该覆盖哪里。
