# Spring Boot 学习笔记：从入门到项目实战

> 这份笔记面向已经具备 Java 基础、了解 Maven/Gradle 和基本 Web 概念的学习者。目标不是只会写一个 `Hello World`，而是系统理解 Spring Boot 的设计思想、核心机制、常用开发方式、项目分层、配置管理、数据访问、接口开发、测试、部署和线上问题排查。

---

## 1. Spring Boot 是什么

Spring Boot 是 Spring 生态中的快速开发框架。它不是 Spring Framework 的替代品，而是在 Spring Framework 之上提供了一套约定优于配置的工程化方案。

传统 Spring 项目常见痛点：

- 依赖版本需要手动协调，容易出现兼容问题。
- XML 或 Java Config 配置繁琐，启动一个 Web 项目需要配置大量组件。
- 整合 MVC、数据库、缓存、消息队列、安全框架时，需要写很多样板配置。
- 部署时通常需要外置 Servlet 容器，例如 Tomcat。
- 运行状态、健康检查、指标监控等生产能力需要额外搭建。

Spring Boot 的核心价值：

- 自动配置：根据 classpath 中的依赖自动装配常用 Bean。
- 起步依赖：用 `starter` 聚合一组常用依赖，降低依赖选择成本。
- 内嵌容器：默认内嵌 Tomcat，也支持 Jetty、Undertow。
- 外部化配置：支持 properties、YAML、环境变量、命令行参数等。
- 生产特性：通过 Actuator 提供健康检查、指标、线程、日志等能力。
- 快速创建独立可运行应用：打成 jar 后可以用 `java -jar` 直接运行。

一句话理解：Spring Boot 让 Spring 应用从“配置驱动”变成“约定驱动”，开发者只需要关注业务代码和必要的差异化配置。

---

## 2. Spring、Spring MVC、Spring Boot 的关系

### 2.1 Spring Framework

Spring Framework 是底层核心框架，提供：

- IoC 容器
- 依赖注入
- AOP
- 事务管理
- 资源抽象
- 事件机制
- 数据访问抽象
- Web 支持

Spring 的核心思想是把对象创建、依赖关系、生命周期管理交给容器。

### 2.2 Spring MVC

Spring MVC 是 Spring Framework 中的 Web MVC 框架，用于开发 HTTP 接口和传统服务端页面应用。

核心组件包括：

- `DispatcherServlet`
- `HandlerMapping`
- `HandlerAdapter`
- `Controller`
- `ViewResolver`
- `HttpMessageConverter`
- `HandlerInterceptor`
- `ExceptionHandler`

### 2.3 Spring Boot

Spring Boot 负责把 Spring、Spring MVC、数据访问、缓存、安全、监控等生态组件以自动配置方式整合起来。

三者关系：

```text
Spring Framework: 底层容器和基础能力
Spring MVC: 基于 Spring 的 Web 框架
Spring Boot: 基于 Spring 生态的快速开发与自动配置框架
```

开发 Spring Boot Web 项目时，本质上仍然是在使用 Spring Framework 和 Spring MVC，只是大量配置由 Spring Boot 自动完成。

---

## 3. 快速创建 Spring Boot 项目

### 3.1 使用 Spring Initializr

常用方式：

- IDEA 内置 Spring Initializr
- https://start.spring.io
- 公司内部项目脚手架

典型选择：

- Project: Maven 或 Gradle
- Language: Java
- Spring Boot: 选择稳定版本
- Packaging: Jar
- Java: 17 或 21
- Dependencies:
  - Spring Web
  - Spring Data JPA 或 MyBatis Framework
  - MySQL Driver
  - Validation
  - Lombok
  - Spring Boot Actuator

### 3.2 Maven 项目结构

典型目录：

```text
demo
├── pom.xml
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com/example/demo
│   │   │       ├── DemoApplication.java
│   │   │       ├── controller
│   │   │       ├── service
│   │   │       ├── repository
│   │   │       ├── domain
│   │   │       └── config
│   │   └── resources
│   │       ├── application.yml
│   │       ├── static
│   │       └── templates
│   └── test
│       └── java
```

### 3.3 最小启动类

```java
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

`@SpringBootApplication` 是一个组合注解，包含：

- `@SpringBootConfiguration`
- `@EnableAutoConfiguration`
- `@ComponentScan`

其中：

- `@SpringBootConfiguration` 表示这是一个配置类，本质上是 `@Configuration`。
- `@EnableAutoConfiguration` 开启自动配置。
- `@ComponentScan` 扫描当前包及子包下的组件。

启动类建议放在根包下，例如 `com.example.demo`，这样子包中的 Controller、Service、Repository、Config 都能被扫描到。

---

## 4. 起步依赖 Starter

Starter 是 Spring Boot 提供的一组依赖集合。它不是某个具体功能，而是把实现某类功能所需的依赖打包成一个统一入口。

### 4.1 常见 Starter

| Starter | 作用 |
| --- | --- |
| `spring-boot-starter-web` | 开发 Spring MVC Web 应用，默认内嵌 Tomcat |
| `spring-boot-starter-test` | 测试支持，包含 JUnit、Mockito、Spring Test 等 |
| `spring-boot-starter-validation` | 参数校验，集成 Jakarta Bean Validation |
| `spring-boot-starter-data-jpa` | Spring Data JPA 支持 |
| `mybatis-spring-boot-starter` | MyBatis 与 Spring Boot 集成 |
| `spring-boot-starter-security` | Spring Security 支持 |
| `spring-boot-starter-actuator` | 生产监控端点 |
| `spring-boot-starter-cache` | 缓存抽象 |
| `spring-boot-starter-aop` | AOP 支持 |
| `spring-boot-starter-data-redis` | Redis 支持 |
| `spring-boot-starter-amqp` | RabbitMQ 支持 |

### 4.2 Starter 的意义

以 Web 项目为例，如果没有 starter，需要自己引入 Spring MVC、Jackson、Tomcat、Validation、日志等依赖，并处理版本兼容。使用 `spring-boot-starter-web` 后，这些依赖由 Spring Boot 管理。

Starter 的优势：

- 减少手动依赖配置。
- 降低依赖版本冲突。
- 与自动配置机制配合使用。
- 项目依赖语义更清晰。

---

## 5. 自动配置原理

自动配置是 Spring Boot 的核心能力。理解自动配置，可以避免把 Spring Boot 当成“黑盒”。

### 5.1 自动配置的基本流程

启动时，Spring Boot 会：

1. 加载主启动类。
2. 扫描组件。
3. 根据依赖和配置加载自动配置类。
4. 根据条件注解决定某个配置是否生效。
5. 向容器注册 Bean。

### 5.2 条件注解

常见条件注解：

| 注解 | 含义 |
| --- | --- |
| `@ConditionalOnClass` | classpath 中存在某个类时生效 |
| `@ConditionalOnMissingClass` | classpath 中不存在某个类时生效 |
| `@ConditionalOnBean` | 容器中存在某个 Bean 时生效 |
| `@ConditionalOnMissingBean` | 容器中不存在某个 Bean 时生效 |
| `@ConditionalOnProperty` | 配置项满足条件时生效 |
| `@ConditionalOnWebApplication` | 当前是 Web 应用时生效 |
| `@ConditionalOnNotWebApplication` | 当前不是 Web 应用时生效 |
| `@ConditionalOnResource` | 存在某个资源文件时生效 |

### 5.3 自动配置为什么可覆盖

很多自动配置类使用 `@ConditionalOnMissingBean`。意思是：如果用户已经提供了自己的 Bean，Spring Boot 就不会再创建默认 Bean。

例如：

```java
@Bean
@ConditionalOnMissingBean
public ObjectMapper objectMapper() {
    return new ObjectMapper();
}
```

如果你自己定义了一个 `ObjectMapper`，默认的就不会生效。这体现了 Spring Boot 的扩展原则：提供默认值，但允许用户覆盖。

### 5.4 查看自动配置报告

可以在配置文件中开启 debug：

```yaml
debug: true
```

启动后会打印自动配置匹配报告。报告中能看到：

- 哪些自动配置生效了。
- 哪些自动配置没有生效。
- 为什么没有生效。

这对排查配置问题很有帮助。

---

## 6. 配置文件与外部化配置

Spring Boot 支持多种配置来源。常用配置文件：

- `application.properties`
- `application.yml`
- `application.yaml`

推荐使用 YAML，因为层级结构更清晰。

### 6.1 application.yml 示例

```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  application:
    name: demo-service
  datasource:
    url: jdbc:mysql://localhost:3306/demo?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: root
    password: root
    driver-class-name: com.mysql.cj.jdbc.Driver

logging:
  level:
    root: info
    com.example.demo: debug
```

### 6.2 配置优先级

常见优先级从高到低大致为：

1. 命令行参数
2. Java 系统属性
3. 操作系统环境变量
4. 外部配置文件
5. jar 包内部配置文件
6. 默认配置

例如：

```bash
java -jar app.jar --server.port=9090
```

命令行参数会覆盖 `application.yml` 中的 `server.port`。

### 6.3 多环境配置 Profile

常见环境：

- `dev`: 本地开发
- `test`: 测试环境
- `staging`: 预发环境
- `prod`: 生产环境

配置方式：

```yaml
spring:
  profiles:
    active: dev
```

也可以使用多文件：

```text
application.yml
application-dev.yml
application-test.yml
application-prod.yml
```

启动时指定：

```bash
java -jar app.jar --spring.profiles.active=prod
```

### 6.4 读取配置

方式一：使用 `@Value`

```java
@Value("${server.port}")
private Integer port;
```

适合读取少量简单配置。

方式二：使用 `@ConfigurationProperties`

```yaml
app:
  upload:
    max-size: 20MB
    base-path: /data/files
```

```java
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.upload")
public class UploadProperties {
    private String maxSize;
    private String basePath;

    public String getMaxSize() {
        return maxSize;
    }

    public void setMaxSize(String maxSize) {
        this.maxSize = maxSize;
    }

    public String getBasePath() {
        return basePath;
    }

    public void setBasePath(String basePath) {
        this.basePath = basePath;
    }
}
```

`@ConfigurationProperties` 更适合读取一组结构化配置，类型安全，也便于 IDE 提示。

---

## 7. IoC 与 Bean 管理

Spring Boot 项目依然以 Spring IoC 容器为核心。

### 7.1 什么是 Bean

被 Spring 容器管理的对象称为 Bean。容器负责：

- 创建对象
- 注入依赖
- 初始化
- 生命周期管理
- 销毁

### 7.2 常用组件注解

| 注解 | 用途 |
| --- | --- |
| `@Component` | 通用组件 |
| `@Controller` | MVC 控制器 |
| `@RestController` | REST 控制器，等价于 `@Controller + @ResponseBody` |
| `@Service` | 业务服务 |
| `@Repository` | 数据访问组件 |
| `@Configuration` | 配置类 |
| `@Bean` | 在配置类中声明 Bean |

### 7.3 构造器注入

推荐使用构造器注入：

```java
@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

构造器注入的优点：

- 依赖不可变，更安全。
- 便于单元测试。
- 能暴露循环依赖问题。
- 不依赖反射修改私有字段。

不推荐字段注入：

```java
@Autowired
private UserRepository userRepository;
```

字段注入虽然简短，但隐藏依赖，不利于测试，也容易掩盖设计问题。

### 7.4 Bean 生命周期

简化流程：

1. 实例化 Bean。
2. 填充属性和依赖。
3. 执行 Aware 接口回调。
4. 执行 BeanPostProcessor 前置处理。
5. 执行初始化方法。
6. 执行 BeanPostProcessor 后置处理。
7. Bean 可用。
8. 容器关闭时执行销毁方法。

常见初始化方式：

```java
@PostConstruct
public void init() {
    // 初始化逻辑
}
```

常见销毁方式：

```java
@PreDestroy
public void destroy() {
    // 清理资源
}
```

---

## 8. Web 开发基础

### 8.1 创建 REST 接口

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UserController {

    @GetMapping("/hello")
    public String hello() {
        return "hello spring boot";
    }
}
```

访问：

```text
GET /users/hello
```

### 8.2 常用请求映射注解

| 注解 | 说明 |
| --- | --- |
| `@RequestMapping` | 通用请求映射 |
| `@GetMapping` | GET 请求 |
| `@PostMapping` | POST 请求 |
| `@PutMapping` | PUT 请求 |
| `@PatchMapping` | PATCH 请求 |
| `@DeleteMapping` | DELETE 请求 |

### 8.3 获取请求参数

路径参数：

```java
@GetMapping("/{id}")
public UserDetailVO detail(@PathVariable Long id) {
    return userService.detail(id);
}
```

查询参数：

```java
@GetMapping
public List<UserVO> list(@RequestParam String keyword) {
    return userService.search(keyword);
}
```

请求体：

```java
@PostMapping
public Long create(@RequestBody CreateUserRequest request) {
    return userService.create(request);
}
```

请求头：

```java
@GetMapping("/profile")
public UserVO profile(@RequestHeader("Authorization") String token) {
    return userService.profile(token);
}
```

### 8.4 JSON 序列化

Spring Boot Web 默认使用 Jackson 处理 JSON。

常见注解：

| 注解 | 说明 |
| --- | --- |
| `@JsonIgnore` | 忽略字段 |
| `@JsonProperty` | 指定 JSON 字段名 |
| `@JsonFormat` | 格式化日期 |
| `@JsonInclude` | 控制 null 字段是否输出 |

示例：

```java
public class UserVO {
    private Long id;
    private String username;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Shanghai")
    private LocalDateTime createdAt;
}
```

### 8.5 统一响应结构

实际项目中常使用统一响应：

```java
public class ApiResponse<T> {
    private int code;
    private String message;
    private T data;

    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.code = 0;
        response.message = "success";
        response.data = data;
        return response;
    }

    public static <T> ApiResponse<T> fail(int code, String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.code = code;
        response.message = message;
        return response;
    }
}
```

使用：

```java
@GetMapping("/{id}")
public ApiResponse<UserVO> detail(@PathVariable Long id) {
    return ApiResponse.success(userService.detail(id));
}
```

注意：统一响应不是必须。对于开放 API 或严格 REST 风格接口，也可以直接使用 HTTP 状态码和资源模型表达结果。

---

## 9. 参数校验 Validation

参数校验用于把非法输入拦截在 Controller 层，避免脏数据进入业务逻辑。

### 9.1 添加依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

### 9.2 常见校验注解

| 注解 | 说明 |
| --- | --- |
| `@NotNull` | 不能为 null |
| `@NotBlank` | 字符串不能为 null，且去除空白后长度大于 0 |
| `@NotEmpty` | 集合或字符串不能为 empty |
| `@Min` | 最小值 |
| `@Max` | 最大值 |
| `@Size` | 长度或集合大小限制 |
| `@Email` | 邮箱格式 |
| `@Pattern` | 正则校验 |
| `@Positive` | 必须为正数 |
| `@Past` | 必须是过去时间 |
| `@Future` | 必须是未来时间 |

### 9.3 请求体校验

```java
public class CreateUserRequest {
    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 8, max = 32, message = "密码长度必须在 8 到 32 位之间")
    private String password;

    @Email(message = "邮箱格式不正确")
    private String email;
}
```

```java
@PostMapping
public ApiResponse<Long> create(@Valid @RequestBody CreateUserRequest request) {
    return ApiResponse.success(userService.create(request));
}
```

### 9.4 路径参数和查询参数校验

Controller 类上加 `@Validated`：

```java
@Validated
@RestController
@RequestMapping("/users")
public class UserController {

    @GetMapping("/{id}")
    public ApiResponse<UserVO> detail(@PathVariable @Positive Long id) {
        return ApiResponse.success(userService.detail(id));
    }
}
```

### 9.5 分组校验

适用于新增和修改共用一个 DTO，但校验规则不同的场景。

```java
public interface CreateGroup {
}

public interface UpdateGroup {
}
```

```java
public class UserRequest {
    @NotNull(groups = UpdateGroup.class)
    private Long id;

    @NotBlank(groups = {CreateGroup.class, UpdateGroup.class})
    private String username;
}
```

```java
@PostMapping
public ApiResponse<Long> create(@Validated(CreateGroup.class) @RequestBody UserRequest request) {
    return ApiResponse.success(userService.create(request));
}
```

---

## 10. 全局异常处理

不要在每个 Controller 中重复 try-catch。推荐使用全局异常处理。

### 10.1 业务异常

```java
public class BizException extends RuntimeException {
    private final int code;

    public BizException(int code, String message) {
        super(message);
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}
```

### 10.2 全局异常处理器

```java
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BizException.class)
    public ApiResponse<Void> handleBizException(BizException ex) {
        return ApiResponse.fail(ex.getCode(), ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("参数错误");
        return ApiResponse.fail(400, message);
    }

    @ExceptionHandler(BindException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleBindException(BindException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("参数错误");
        return ApiResponse.fail(400, message);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> handleException(Exception ex) {
        return ApiResponse.fail(500, "服务器内部错误");
    }
}
```

生产环境不建议直接把未知异常堆栈返回给前端。堆栈应该写入日志，由服务端排查。

---

## 11. 分层架构与 DTO 设计

### 11.1 常见分层

```text
controller: 接收 HTTP 请求，处理参数和响应
service: 业务逻辑编排
repository/mapper/dao: 数据访问
domain/entity: 领域对象或数据库实体
dto/request: 入参对象
vo/response: 出参对象
config: 配置类
common: 通用类
exception: 异常类
```

### 11.2 为什么要分层

分层的目的不是制造目录，而是隔离变化：

- Controller 关注协议层，不写复杂业务。
- Service 关注业务规则和事务边界。
- Repository/Mapper 关注数据读写。
- DTO/VO 避免数据库实体直接暴露给外部。

### 11.3 Entity、DTO、VO 的区别

| 类型 | 作用 |
| --- | --- |
| Entity | 数据库实体，通常对应表结构 |
| DTO | 数据传输对象，常用于服务间传输或 Controller 入参 |
| Request | API 请求对象 |
| VO/Response | API 响应对象 |
| BO | 业务对象，承载业务中间状态 |

不建议直接使用 Entity 作为接口入参和出参，原因：

- 容易暴露内部字段。
- 数据库字段变化会影响接口契约。
- 容易发生越权赋值。
- 序列化可能引出懒加载问题。

---

## 12. 数据访问：JDBC、JPA 与 MyBatis

Spring Boot 常见数据访问方案：

- JdbcTemplate
- Spring Data JPA
- MyBatis
- MyBatis-Plus

### 12.1 JdbcTemplate

适合简单 SQL 和轻量项目。

```java
@Repository
public class UserJdbcRepository {
    private final JdbcTemplate jdbcTemplate;

    public UserJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public UserDO findById(Long id) {
        return jdbcTemplate.queryForObject(
                "select id, username, email from user where id = ?",
                (rs, rowNum) -> {
                    UserDO user = new UserDO();
                    user.setId(rs.getLong("id"));
                    user.setUsername(rs.getString("username"));
                    user.setEmail(rs.getString("email"));
                    return user;
                },
                id
        );
    }
}
```

优点：

- 简单直接。
- SQL 可控。
- 不引入复杂 ORM 概念。

缺点：

- 手写映射较多。
- 动态 SQL 不方便。
- 大型项目维护成本较高。

### 12.2 Spring Data JPA

JPA 是 ORM 规范，Hibernate 是常见实现。Spring Data JPA 在 JPA 之上进一步简化 Repository 开发。

实体：

```java
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "user")
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String email;
}
```

Repository：

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    UserEntity findByUsername(String username);
}
```

JPA 优点：

- CRUD 开发效率高。
- 对象关系映射能力强。
- 支持方法名派生查询。
- 适合领域模型相对清晰的项目。

JPA 缺点：

- 学习成本较高。
- 复杂 SQL 控制不如 MyBatis 直接。
- 懒加载、级联、脏检查等机制使用不当容易引发性能问题。

### 12.3 MyBatis

MyBatis 是半自动 ORM 框架，更强调 SQL 可控。

Mapper 接口：

```java
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserMapper {
    @Select("select id, username, email from user where id = #{id}")
    UserDO selectById(@Param("id") Long id);
}
```

XML 写法：

```xml
<mapper namespace="com.example.demo.mapper.UserMapper">
    <select id="selectById" resultType="com.example.demo.domain.UserDO">
        select id, username, email
        from user
        where id = #{id}
    </select>
</mapper>
```

MyBatis 优点：

- SQL 完全可控。
- 适合复杂查询和报表。
- 对数据库特性支持直接。
- 国内项目使用广泛。

MyBatis 缺点：

- CRUD 样板代码较多。
- 需要维护 SQL 和字段映射。
- 动态 SQL 复杂时 XML 可读性下降。

### 12.4 如何选择

| 场景 | 推荐 |
| --- | --- |
| 简单项目，SQL 少 | JdbcTemplate |
| 领域模型清晰，CRUD 多 | Spring Data JPA |
| 复杂 SQL 多，强数据库控制 | MyBatis |
| 国内后台管理系统快速开发 | MyBatis-Plus |

实际工作中，选择不是看哪个“高级”，而是看团队熟悉度、项目复杂度、数据库使用方式和维护成本。

---

## 13. 数据源与连接池

Spring Boot 默认使用 HikariCP 作为数据库连接池。

### 13.1 基本配置

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/demo?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: root
    password: root
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

### 13.2 连接池关键参数

| 参数 | 含义 |
| --- | --- |
| `maximum-pool-size` | 最大连接数 |
| `minimum-idle` | 最小空闲连接数 |
| `connection-timeout` | 获取连接超时时间 |
| `idle-timeout` | 空闲连接存活时间 |
| `max-lifetime` | 连接最大生命周期 |

连接池不是越大越好。连接数过大可能拖垮数据库。需要根据数据库能力、接口耗时、并发量和 SQL 性能综合评估。

---

## 14. 事务管理

Spring 使用 `@Transactional` 进行声明式事务管理。

### 14.1 基本使用

```java
@Service
public class OrderService {
    private final OrderMapper orderMapper;
    private final AccountMapper accountMapper;

    public OrderService(OrderMapper orderMapper, AccountMapper accountMapper) {
        this.orderMapper = orderMapper;
        this.accountMapper = accountMapper;
    }

    @Transactional
    public Long createOrder(CreateOrderRequest request) {
        orderMapper.insertOrder(request);
        accountMapper.deductBalance(request.getUserId(), request.getAmount());
        return request.getOrderId();
    }
}
```

如果方法执行过程中抛出运行时异常，事务会回滚。

### 14.2 默认回滚规则

默认情况下：

- `RuntimeException` 回滚。
- `Error` 回滚。
- 受检异常不回滚。

如果希望受检异常也回滚：

```java
@Transactional(rollbackFor = Exception.class)
public void importData() throws IOException {
    // ...
}
```

### 14.3 事务传播行为

常见传播行为：

| 传播行为 | 说明 |
| --- | --- |
| `REQUIRED` | 默认。当前有事务就加入，没有就新建 |
| `REQUIRES_NEW` | 总是新建事务，并挂起当前事务 |
| `SUPPORTS` | 有事务就加入，没有事务也可以执行 |
| `MANDATORY` | 必须在事务中执行，否则报错 |
| `NOT_SUPPORTED` | 非事务执行，如果有事务则挂起 |
| `NEVER` | 必须非事务执行，如果有事务则报错 |
| `NESTED` | 嵌套事务，依赖保存点 |

### 14.4 事务失效常见原因

1. 方法不是 public。
2. 同类内部方法调用。
3. 异常被 catch 后没有继续抛出。
4. 抛出受检异常但未配置 `rollbackFor`。
5. 数据库表不支持事务，例如 MySQL MyISAM。
6. 没有被 Spring 容器管理。
7. 多线程中调用事务方法。

示例：同类内部调用导致事务失效。

```java
@Service
public class UserService {
    public void outer() {
        inner();
    }

    @Transactional
    public void inner() {
        // 事务可能不生效
    }
}
```

原因是 Spring 事务基于 AOP 代理，同类内部调用绕过了代理对象。

---

## 15. AOP 面向切面编程

AOP 用于把横切逻辑从业务代码中抽离出来，例如：

- 日志记录
- 权限校验
- 接口耗时统计
- 幂等控制
- 分布式锁
- 数据权限

### 15.1 添加依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

### 15.2 基本概念

| 概念 | 说明 |
| --- | --- |
| Aspect | 切面 |
| Join Point | 连接点，通常是方法执行 |
| Pointcut | 切点，匹配哪些连接点 |
| Advice | 通知，具体增强逻辑 |
| Around | 环绕通知 |
| Before | 前置通知 |
| After | 后置通知 |

### 15.3 接口耗时统计示例

```java
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AccessLogAspect {
    private static final Logger log = LoggerFactory.getLogger(AccessLogAspect.class);

    @Around("within(com.example.demo.controller..*)")
    public Object logCost(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        try {
            return joinPoint.proceed();
        } finally {
            long cost = System.currentTimeMillis() - start;
            log.info("method={} cost={}ms", joinPoint.getSignature().toShortString(), cost);
        }
    }
}
```

AOP 很强，但不应滥用。业务主流程应尽量显式，切面适合处理横切关注点。

---

## 16. 拦截器、过滤器与切面

### 16.1 Filter

Filter 是 Servlet 规范的一部分，在请求进入 Spring MVC 前执行。

适合：

- 跨域处理
- 请求日志
- 编码处理
- 简单鉴权
- 包装 Request/Response

### 16.2 Interceptor

Interceptor 是 Spring MVC 提供的拦截器，在 `DispatcherServlet` 之后、Controller 之前后执行。

适合：

- 登录校验
- 权限校验
- 请求上下文设置
- 接口访问统计

### 16.3 AOP

AOP 作用于 Spring Bean 方法调用。

适合：

- Service 方法日志
- 事务
- 幂等
- 分布式锁
- 注解驱动的权限控制

### 16.4 执行顺序

大致顺序：

```text
客户端请求
-> Filter
-> DispatcherServlet
-> Interceptor preHandle
-> Controller
-> Interceptor postHandle
-> Interceptor afterCompletion
-> Filter
-> 客户端响应
```

AOP 如果切 Controller 方法，会包裹 Controller 方法执行。

---

## 17. 日志体系

Spring Boot 默认使用 SLF4J + Logback。

### 17.1 使用日志

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    public void createUser(String username) {
        log.info("create user username={}", username);
    }
}
```

不要这样写：

```java
log.info("create user username=" + username);
```

推荐使用占位符，避免不必要的字符串拼接。

### 17.2 日志级别

从低到高：

```text
trace < debug < info < warn < error
```

使用建议：

- `debug`: 开发排查细节。
- `info`: 关键业务流程。
- `warn`: 异常但可恢复的问题。
- `error`: 需要关注的错误。

### 17.3 日志配置

```yaml
logging:
  level:
    root: info
    com.example.demo: debug
  file:
    name: logs/app.log
```

生产日志应包含：

- 请求 ID 或 trace ID。
- 用户 ID 或业务主键。
- 接口路径。
- 异常堆栈。
- 关键外部依赖耗时。

注意不要记录敏感信息，例如密码、身份证、银行卡、完整 token。

---

## 18. Spring Boot Actuator

Actuator 提供生产环境监控端点。

### 18.1 添加依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

### 18.2 常用端点

| 端点 | 说明 |
| --- | --- |
| `/actuator/health` | 健康检查 |
| `/actuator/info` | 应用信息 |
| `/actuator/metrics` | 指标 |
| `/actuator/env` | 环境变量 |
| `/actuator/beans` | Bean 列表 |
| `/actuator/loggers` | 日志级别 |
| `/actuator/threaddump` | 线程快照 |
| `/actuator/heapdump` | 堆转储 |

### 18.3 暴露端点配置

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when_authorized
```

生产环境不要随意暴露所有端点，尤其是 `env`、`beans`、`heapdump` 等敏感端点。

---

## 19. 缓存

Spring 提供缓存抽象，可对接 Caffeine、Redis、Ehcache 等实现。

### 19.1 开启缓存

```java
@EnableCaching
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

### 19.2 常用注解

| 注解 | 说明 |
| --- | --- |
| `@Cacheable` | 查询时读取缓存，缓存不存在则执行方法并写入 |
| `@CachePut` | 总是执行方法，并更新缓存 |
| `@CacheEvict` | 删除缓存 |
| `@Caching` | 组合多个缓存操作 |

### 19.3 示例

```java
@Service
public class UserService {

    @Cacheable(cacheNames = "user", key = "#id")
    public UserVO detail(Long id) {
        return queryFromDatabase(id);
    }

    @CacheEvict(cacheNames = "user", key = "#id")
    public void delete(Long id) {
        deleteFromDatabase(id);
    }
}
```

缓存使用原则：

- 缓存适合读多写少的数据。
- 缓存 key 必须设计清楚。
- 修改数据时要处理缓存失效。
- 要考虑缓存穿透、击穿、雪崩。
- 不要缓存强一致性要求很高的数据，除非有严格失效策略。

---

## 20. Redis 集成

### 20.1 添加依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

### 20.2 配置

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      password:
      database: 0
      timeout: 3000ms
```

### 20.3 使用 StringRedisTemplate

```java
@Service
public class SmsCodeService {
    private final StringRedisTemplate redisTemplate;

    public SmsCodeService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void saveCode(String phone, String code) {
        String key = "sms:code:" + phone;
        redisTemplate.opsForValue().set(key, code, Duration.ofMinutes(5));
    }

    public boolean verifyCode(String phone, String code) {
        String key = "sms:code:" + phone;
        String cached = redisTemplate.opsForValue().get(key);
        return code.equals(cached);
    }
}
```

### 20.4 Redis 常见用途

- 缓存热点数据。
- 保存验证码。
- 分布式锁。
- 限流计数。
- 用户登录态。
- 排行榜。
- 延迟任务辅助。

使用 Redis 时要特别注意 key 命名、过期时间、序列化方式和内存淘汰策略。

---

## 21. 定时任务

### 21.1 开启定时任务

```java
@EnableScheduling
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

### 21.2 使用 @Scheduled

```java
@Component
public class OrderTimeoutJob {

    @Scheduled(cron = "0 */5 * * * ?")
    public void closeTimeoutOrders() {
        // 每 5 分钟执行一次
    }
}
```

### 21.3 cron 表达式

Spring 常见 cron 格式：

```text
秒 分 时 日 月 周
```

示例：

| 表达式 | 含义 |
| --- | --- |
| `0 0 2 * * ?` | 每天凌晨 2 点 |
| `0 */5 * * * ?` | 每 5 分钟 |
| `0 0/30 9-18 * * ?` | 每天 9 点到 18 点每 30 分钟 |

单机定时任务简单方便，但在多实例部署时同一个任务可能被多个实例同时执行。生产环境可考虑：

- XXL-JOB
- Quartz
- ElasticJob
- ShedLock
- Kubernetes CronJob

---

## 22. 异步任务

### 22.1 开启异步

```java
@EnableAsync
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

### 22.2 使用 @Async

```java
@Service
public class MailService {

    @Async
    public void sendWelcomeMail(String email) {
        // 发送邮件
    }
}
```

### 22.3 配置线程池

不要直接使用默认线程池，建议自定义：

```java
@Configuration
public class AsyncConfig {

    @Bean("bizExecutor")
    public Executor bizExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(8);
        executor.setMaxPoolSize(16);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("biz-async-");
        executor.initialize();
        return executor;
    }
}
```

使用：

```java
@Async("bizExecutor")
public void sendWelcomeMail(String email) {
    // ...
}
```

注意事项：

- `@Async` 方法必须通过 Spring 代理调用。
- 同类内部调用可能失效。
- 异步方法中的异常不会自动回到调用线程。
- 不要在异步任务中使用请求线程上下文，除非显式传递。

---

## 23. 文件上传与下载

### 23.1 上传配置

```yaml
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 20MB
```

### 23.2 上传接口

```java
@PostMapping("/upload")
public ApiResponse<String> upload(@RequestParam("file") MultipartFile file) throws IOException {
    if (file.isEmpty()) {
        throw new BizException(400, "文件不能为空");
    }

    String originalFilename = file.getOriginalFilename();
    String suffix = originalFilename == null ? "" : originalFilename.substring(originalFilename.lastIndexOf("."));
    String filename = UUID.randomUUID() + suffix;
    Path target = Paths.get("/data/uploads").resolve(filename);
    Files.copy(file.getInputStream(), target);
    return ApiResponse.success(filename);
}
```

### 23.3 文件上传安全

必须注意：

- 限制文件大小。
- 校验文件类型。
- 不要信任原始文件名。
- 防止路径穿越。
- 上传目录不要直接允许执行脚本。
- 对外访问最好使用对象存储或独立静态资源服务。

---

## 24. Spring Security 基础

Spring Security 是 Spring 生态中的安全框架，提供认证和授权能力。

### 24.1 核心概念

| 概念 | 说明 |
| --- | --- |
| Authentication | 认证，判断用户是谁 |
| Authorization | 授权，判断用户能做什么 |
| Principal | 当前用户主体 |
| GrantedAuthority | 权限 |
| SecurityContext | 安全上下文 |
| FilterChain | 安全过滤器链 |

### 24.2 基础配置示例

现代 Spring Security 推荐声明 `SecurityFilterChain`：

```java
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/login", "/actuator/health").permitAll()
                        .anyRequest().authenticated()
                );
        return http.build();
    }
}
```

### 24.3 JWT 认证思路

常见流程：

1. 用户提交用户名和密码。
2. 服务端校验成功后生成 JWT。
3. 前端保存 token。
4. 后续请求在 `Authorization` 请求头中携带 token。
5. 服务端过滤器解析 token，得到用户身份。
6. 将认证信息放入 `SecurityContext`。
7. 后续授权逻辑基于当前用户执行。

JWT 优点：

- 服务端无状态。
- 适合前后端分离。
- 易于水平扩展。

JWT 风险：

- token 泄露后在过期前可被使用。
- 主动失效需要额外机制，例如黑名单或版本号。
- 不应在 token 中放敏感信息。

---

## 25. 跨域 CORS

浏览器同源策略会限制跨域请求。前后端分离项目中经常需要配置 CORS。

### 25.1 局部配置

```java
@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class UserController {
}
```

### 25.2 全局配置

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

生产环境不要直接使用 `allowedOrigins("*")` 搭配凭证请求，应明确允许的域名。

---

## 26. 测试

测试是 Spring Boot 项目质量的关键。不要只依赖手动调接口。

### 26.1 测试依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

### 26.2 单元测试

单元测试不启动 Spring 容器，关注单个类的逻辑。

```java
class UserServiceTest {

    private UserRepository userRepository;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        userService = new UserService(userRepository);
    }

    @Test
    void shouldReturnUserDetail() {
        Mockito.when(userRepository.findById(1L)).thenReturn(Optional.of(new UserEntity()));

        UserVO result = userService.detail(1L);

        Assertions.assertNotNull(result);
    }
}
```

### 26.3 SpringBootTest

`@SpringBootTest` 会启动完整 Spring 容器，适合集成测试。

```java
@SpringBootTest
class DemoApplicationTests {

    @Test
    void contextLoads() {
    }
}
```

### 26.4 MockMvc 测试 Controller

```java
@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldGetUserDetail() throws Exception {
        mockMvc.perform(get("/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }
}
```

### 26.5 测试策略

建议组合：

- Service 复杂业务写单元测试。
- Mapper/Repository 写数据访问测试。
- Controller 核心接口写 MockMvc 测试。
- 关键业务流程写集成测试。

测试不是越多越好，而是覆盖核心规则、边界条件和容易回归的路径。

---

## 27. 打包与部署

### 27.1 Maven 打包

```bash
mvn clean package
```

生成：

```text
target/demo-0.0.1-SNAPSHOT.jar
```

运行：

```bash
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

指定环境：

```bash
java -jar app.jar --spring.profiles.active=prod
```

指定 JVM 参数：

```bash
java -Xms512m -Xmx512m -jar app.jar
```

### 27.2 Docker 部署

Dockerfile 示例：

```dockerfile
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

构建：

```bash
docker build -t demo-app:1.0.0 .
```

运行：

```bash
docker run -d -p 8080:8080 --name demo-app demo-app:1.0.0
```

### 27.3 生产部署关注点

- 外部化配置，不把生产密码写死在 jar 中。
- 日志输出到标准输出或统一日志平台。
- 配置健康检查。
- 配置优雅停机。
- 设置合理 JVM 参数。
- 数据库连接池参数与数据库容量匹配。
- 接口超时、重试、熔断策略清晰。
- 监控 CPU、内存、GC、线程、接口耗时、错误率。

---

## 28. 优雅停机

优雅停机用于在应用关闭时完成已有请求、释放资源，避免强杀导致数据不一致。

配置：

```yaml
server:
  shutdown: graceful

spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s
```

当收到 SIGTERM 时，Spring Boot 会尝试停止接收新请求，并等待已有请求处理完成。

在 Kubernetes 中，还应配合：

- readinessProbe
- livenessProbe
- preStop hook
- terminationGracePeriodSeconds

---

## 29. 性能优化思路

性能优化不要凭感觉，先定位瓶颈。

### 29.1 常见瓶颈

- SQL 慢查询。
- 数据库连接池耗尽。
- 外部接口响应慢。
- Redis 热 key。
- 线程池配置不合理。
- 大对象频繁创建。
- N+1 查询。
- 锁粒度过大。
- 日志写入过多。
- JVM GC 频繁。

### 29.2 排查顺序

1. 看监控：CPU、内存、GC、线程、接口耗时。
2. 看日志：错误、超时、慢请求。
3. 看数据库：慢 SQL、连接数、锁等待。
4. 看线程栈：是否阻塞、死锁、线程池耗尽。
5. 看堆内存：是否内存泄漏或大对象堆积。

### 29.3 常见优化手段

- 给查询字段加合适索引。
- 避免返回过大结果集。
- 使用分页。
- 合并重复查询。
- 对热点数据使用缓存。
- 外部接口设置超时。
- 慢任务异步化。
- 使用批量插入或批量更新。
- 控制日志量。
- 合理配置线程池和连接池。

优化必须有指标对比。没有基准数据的优化很容易变成无效改动。

---

## 30. 常见线上问题

### 30.1 接口突然变慢

可能原因：

- 数据库慢 SQL。
- 下游服务变慢。
- 连接池耗尽。
- GC 停顿。
- 线程池排队。
- 缓存失效导致大量请求打到数据库。

排查：

- 查看接口耗时分布。
- 查看数据库慢查询。
- 查看依赖服务耗时。
- 查看线程池队列。
- 查看 GC 日志。

### 30.2 频繁 OOM

可能原因：

- 一次性加载大量数据到内存。
- 缓存没有上限。
- 静态集合持续增长。
- 文件上传下载未流式处理。
- 线程过多导致栈内存占用高。

排查：

- 导出 heap dump。
- 使用 MAT 或 VisualVM 分析大对象。
- 查看对象引用链。
- 检查最近发布改动。

### 30.3 数据库连接耗尽

可能原因：

- 慢 SQL 占用连接。
- 事务过长。
- 连接池太小。
- 数据库 max connections 太低。
- 代码泄漏连接，常见于手动 JDBC。

排查：

- 查看连接池指标。
- 查看数据库当前连接。
- 查看慢 SQL。
- 查看事务执行时间。

### 30.4 事务没有回滚

常见原因：

- 异常被 catch 掉。
- 抛出受检异常但没有 `rollbackFor`。
- 同类内部调用。
- 方法不是 public。
- 没有被 Spring 管理。

---

## 31. 常用注解总览

### 31.1 启动与配置

| 注解 | 说明 |
| --- | --- |
| `@SpringBootApplication` | Spring Boot 启动类 |
| `@Configuration` | 配置类 |
| `@Bean` | 声明 Bean |
| `@ConfigurationProperties` | 绑定配置属性 |
| `@Profile` | 指定环境生效 |
| `@ConditionalOnProperty` | 根据配置条件生效 |

### 31.2 组件声明

| 注解 | 说明 |
| --- | --- |
| `@Component` | 通用组件 |
| `@Controller` | MVC 控制器 |
| `@RestController` | REST 控制器 |
| `@Service` | 服务层 |
| `@Repository` | 数据访问层 |

### 31.3 Web

| 注解 | 说明 |
| --- | --- |
| `@RequestMapping` | 请求映射 |
| `@GetMapping` | GET |
| `@PostMapping` | POST |
| `@PutMapping` | PUT |
| `@DeleteMapping` | DELETE |
| `@PathVariable` | 路径参数 |
| `@RequestParam` | 查询参数 |
| `@RequestBody` | 请求体 |
| `@RequestHeader` | 请求头 |
| `@ResponseBody` | 响应体 |
| `@RestControllerAdvice` | REST 全局增强 |
| `@ExceptionHandler` | 异常处理 |

### 31.4 事务与异步

| 注解 | 说明 |
| --- | --- |
| `@Transactional` | 声明式事务 |
| `@EnableAsync` | 开启异步 |
| `@Async` | 异步方法 |
| `@EnableScheduling` | 开启定时任务 |
| `@Scheduled` | 定时任务 |

### 31.5 测试

| 注解 | 说明 |
| --- | --- |
| `@SpringBootTest` | 启动完整 Spring 容器测试 |
| `@WebMvcTest` | Web 层切片测试 |
| `@DataJpaTest` | JPA 数据层测试 |
| `@MockBean` | 向容器放入 mock Bean |
| `@AutoConfigureMockMvc` | 自动配置 MockMvc |

---

## 32. 推荐项目结构

中小型项目可以采用按技术分层：

```text
com.example.demo
├── DemoApplication.java
├── common
│   ├── ApiResponse.java
│   └── PageResponse.java
├── config
│   ├── WebConfig.java
│   └── SecurityConfig.java
├── controller
│   └── UserController.java
├── service
│   ├── UserService.java
│   └── impl
│       └── UserServiceImpl.java
├── mapper
│   └── UserMapper.java
├── domain
│   ├── entity
│   │   └── UserEntity.java
│   └── enums
│       └── UserStatus.java
├── dto
│   ├── request
│   │   └── CreateUserRequest.java
│   └── response
│       └── UserDetailResponse.java
└── exception
    ├── BizException.java
    └── GlobalExceptionHandler.java
```

大型项目可以按业务模块组织：

```text
com.example.demo
├── user
│   ├── controller
│   ├── service
│   ├── mapper
│   ├── domain
│   └── dto
├── order
│   ├── controller
│   ├── service
│   ├── mapper
│   ├── domain
│   └── dto
└── common
```

选择原则：

- 业务简单时按技术分层更直观。
- 业务复杂时按模块聚合更利于边界清晰。
- 不要过早设计过深目录。
- 包结构要服务维护，不是追求形式。

---

## 33. 实战示例：用户模块

下面用一个用户模块串联 Controller、Service、Mapper、DTO、异常和校验。

### 33.1 建表

```sql
create table user (
    id bigint primary key auto_increment,
    username varchar(64) not null,
    email varchar(128),
    status tinyint not null default 1,
    created_at datetime not null,
    updated_at datetime not null,
    unique key uk_username (username)
);
```

### 33.2 请求对象

```java
public class CreateUserRequest {
    @NotBlank(message = "用户名不能为空")
    @Size(max = 64, message = "用户名不能超过 64 个字符")
    private String username;

    @Email(message = "邮箱格式不正确")
    private String email;
}
```

### 33.3 响应对象

```java
public class UserDetailResponse {
    private Long id;
    private String username;
    private String email;
    private Integer status;
    private LocalDateTime createdAt;
}
```

### 33.4 Mapper

```java
@Mapper
public interface UserMapper {

    UserDO selectById(@Param("id") Long id);

    UserDO selectByUsername(@Param("username") String username);

    int insert(UserDO user);
}
```

### 33.5 Service

```java
@Service
public class UserService {
    private final UserMapper userMapper;

    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Transactional
    public Long create(CreateUserRequest request) {
        UserDO existed = userMapper.selectByUsername(request.getUsername());
        if (existed != null) {
            throw new BizException(409, "用户名已存在");
        }

        UserDO user = new UserDO();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setStatus(1);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.insert(user);
        return user.getId();
    }

    public UserDetailResponse detail(Long id) {
        UserDO user = userMapper.selectById(id);
        if (user == null) {
            throw new BizException(404, "用户不存在");
        }

        UserDetailResponse response = new UserDetailResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setStatus(user.getStatus());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}
```

### 33.6 Controller

```java
@Validated
@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ApiResponse<Long> create(@Valid @RequestBody CreateUserRequest request) {
        return ApiResponse.success(userService.create(request));
    }

    @GetMapping("/{id}")
    public ApiResponse<UserDetailResponse> detail(@PathVariable @Positive Long id) {
        return ApiResponse.success(userService.detail(id));
    }
}
```

这个例子体现了常见后端接口开发流程：

1. Controller 负责协议适配和参数校验。
2. Service 负责业务规则和事务。
3. Mapper 负责数据库访问。
4. DTO/Response 隔离外部接口和内部数据结构。
5. 异常统一交给全局异常处理器。

---

## 34. 学习路线

### 34.1 第一阶段：基础入门

目标：能创建项目、写接口、读取配置、理解 Bean。

重点：

- Spring Boot 项目结构
- Starter
- `@SpringBootApplication`
- Controller
- 配置文件
- IoC 和依赖注入
- 参数接收和 JSON 返回

练习：

- 写一个图书管理接口。
- 支持新增、查询、修改、删除。
- 数据先存在内存 List 中。

### 34.2 第二阶段：数据库与业务开发

目标：能开发真实 CRUD 后端。

重点：

- MySQL
- MyBatis 或 JPA
- 事务
- 参数校验
- 全局异常
- 分层架构

练习：

- 用户注册登录。
- 商品列表。
- 订单创建。
- 分页查询。

### 34.3 第三阶段：工程能力

目标：能写可维护项目。

重点：

- 日志
- 测试
- Profile
- Actuator
- Docker 部署
- 接口文档
- 统一响应
- 权限认证

练习：

- 给项目增加登录鉴权。
- 编写核心接口测试。
- 使用 Docker 部署。
- 配置健康检查。

### 34.4 第四阶段：进阶能力

目标：理解高并发和生产问题。

重点：

- Redis 缓存
- 分布式锁
- 消息队列
- 限流
- 幂等
- 线程池
- JVM 排查
- 慢 SQL 优化
- 监控告警

练习：

- 秒杀库存扣减。
- 订单超时关闭。
- 接口限流。
- 异步发送消息。

---

## 35. 面试常见问题

### 35.1 Spring Boot 自动配置原理是什么

Spring Boot 通过 `@EnableAutoConfiguration` 导入自动配置类。自动配置类根据 classpath、配置项、已有 Bean、Web 环境等条件判断是否生效。如果满足条件，就向容器注册默认 Bean。用户可以通过自定义 Bean 或配置项覆盖默认行为。

### 35.2 Starter 是什么

Starter 是一组依赖集合，用于简化依赖管理。它通常配合自动配置使用。比如 `spring-boot-starter-web` 会引入 Spring MVC、Jackson、Tomcat 等 Web 开发所需依赖。

### 35.3 为什么推荐构造器注入

构造器注入能明确表达必需依赖，使依赖不可变，便于测试，也能更早暴露循环依赖问题。字段注入隐藏依赖，不利于单元测试和对象构造。

### 35.4 `@RestController` 和 `@Controller` 有什么区别

`@RestController` 等价于 `@Controller + @ResponseBody`。它默认把方法返回值写入 HTTP 响应体，通常用于 REST API。`@Controller` 常用于返回页面视图。

### 35.5 `@Transactional` 为什么会失效

常见原因包括同类内部调用、方法不是 public、异常被捕获、抛出受检异常但未配置 `rollbackFor`、对象没有交给 Spring 管理、数据库表不支持事务等。

### 35.6 Filter、Interceptor、AOP 的区别

Filter 属于 Servlet 规范，在请求进入 Spring MVC 前执行。Interceptor 属于 Spring MVC，在 Controller 前后执行。AOP 作用于 Spring Bean 方法调用，可用于 Service 或 Controller 方法增强。

### 35.7 Spring Boot 如何读取配置

可以使用 `@Value` 读取单个配置，也可以使用 `@ConfigurationProperties` 绑定一组结构化配置。配置来源包括配置文件、环境变量、系统属性、命令行参数等。

### 35.8 JPA 和 MyBatis 怎么选

JPA 更适合对象模型清晰、CRUD 多、希望减少 SQL 的项目。MyBatis 更适合复杂 SQL 多、强调 SQL 可控、团队熟悉数据库细节的项目。

---

## 36. 常见最佳实践

1. 启动类放在根包。
2. 使用构造器注入。
3. Controller 不写复杂业务逻辑。
4. Service 控制事务边界。
5. 不直接暴露 Entity 给前端。
6. 使用全局异常处理。
7. 所有外部输入都做校验。
8. 日志使用占位符，不拼接字符串。
9. 生产环境不要暴露敏感 Actuator 端点。
10. 配置按环境隔离。
11. 密码、密钥、token 不提交到代码仓库。
12. 数据库查询必须考虑索引和分页。
13. 缓存必须有失效策略。
14. 外部调用必须设置超时。
15. 异步任务使用自定义线程池。
16. 定时任务在多实例部署时考虑重复执行。
17. 接口错误码和错误信息保持稳定。
18. 关键业务写测试。
19. 上线前确认日志、监控、健康检查。
20. 性能优化先定位瓶颈，再做改动。

---

## 37. 总结

Spring Boot 的学习重点不是背注解，而是理解它如何把 Spring 生态工程化：

- 用 Starter 管理依赖。
- 用自动配置降低样板配置。
- 用 IoC 管理对象和依赖。
- 用 Spring MVC 构建 Web 接口。
- 用 Validation、全局异常和统一响应提升接口质量。
- 用事务、数据访问框架和连接池支撑业务数据。
- 用日志、Actuator、测试和部署配置支撑生产运行。
- 用缓存、异步、定时任务、安全框架解决真实项目需求。

真正掌握 Spring Boot，需要不断把知识放回项目场景中验证。建议至少完成一个包含用户、权限、商品、订单、缓存、定时任务、测试和 Docker 部署的小型项目。只看教程会记住注解，做完项目才会理解边界、取舍和问题排查方式。


<!-- AUTO_EXPANDED_TO_REFERENCE_LENGTH_2026_06_23 -->

## 万字精讲扩展：SpringBoot学习笔记

> 本节为按参考笔记篇幅补充的系统化扩展内容，目标是把原有笔记从“知识点记录”扩展为“概念、原理、流程、工程实践、常见误区和复盘清单”完整学习材料。

### 精讲扩展 1：SpringBoot学习笔记 的概念边界、核心流程 与工程化理解

学习 $topic 时，不能只把它当成一个孤立知识点来背诵，而要把它放到 $category 的完整问题链条里理解。一个知识点通常同时包含概念定义、适用边界、输入输出、运行过程、常见异常和工程取舍。真正掌握它，意味着看到一个具体场景时，能够判断它解决什么问题、依赖哪些前提、失败时会出现什么现象，以及应该用什么手段验证自己的判断。

从 $a 的角度看，最重要的是先建立清晰的对象模型。也就是明确系统里有哪些参与者、它们之间如何连接、数据或控制信号如何流动、哪些环节是同步的、哪些环节是异步的、哪些状态是临时状态、哪些状态需要长期保存。很多初学问题并不是公式不会、API 不熟，而是对象边界不清：把配置当成状态，把结果当成过程，把局部现象当成全局规律。写笔记时建议始终追问：这个概念的主体是谁，输入是什么，输出是什么，中间约束是什么，错误会在哪里暴露。

从 $b 的角度看，流程比单点知识更关键。一个成熟方案通常不是单个技巧，而是一组步骤：先确定目标，再拆分约束，然后选择工具，最后通过测试和复盘确认效果。比如在实际项目中，不能只问“怎么实现”，还要问“为什么要这样实现”“有没有更简单的替代方案”“边界条件是什么”“数据量、并发量、实时性、可靠性变化后还能不能工作”。这种流程意识能够避免把学习停留在教程层面，也能让后续排错有明确路线。

$topic 的 $c 往往决定它在真实项目中的稳定性。理论上可行的方案，到了工程环境中会受到数据质量、硬件条件、依赖版本、网络环境、团队协作、部署方式和维护成本影响。写代码或做设计时，应该把正常路径和异常路径同时考虑：正常情况下如何运行，输入为空怎么办，超时怎么办，重复执行怎么办，部分成功怎么办，版本升级后兼容性怎么办，日志和指标如何证明系统确实按预期工作。

进一步看 $d，它通常对应性能、可靠性或可维护性的核心矛盾。很多技术选择并没有绝对正确答案，只有是否适合当前约束。例如追求极致性能可能牺牲可读性，追求高度抽象可能增加调试成本，追求快速交付可能留下技术债，追求完全通用可能让简单场景变复杂。高质量笔记应该把这些取舍写出来，而不是只给一个“推荐方案”。推荐方案背后的条件越清楚，迁移到新场景时越不容易误用。

最后从 $e 的角度进行复盘，可以把知识从“看懂”推进到“会用”。建议为 $topic 建立三个层次的检查：第一层是概念检查，确认术语、流程和边界没有混淆；第二层是实践检查，确认能够独立完成一个最小案例；第三层是工程检查，确认这个案例在异常、规模、性能和维护方面经得起追问。每次学习完一个章节，都可以用这三层检查反向补齐笔记。

#### 典型场景拆解

在真实场景中，$topic 通常会经历“需求出现、方案选择、实现落地、问题暴露、持续优化”几个阶段。需求出现时，要先判断这个需求属于基础能力、性能优化、体验改进、可靠性建设还是长期架构演进。不同类型的需求对方案的评价标准不同：基础能力看正确性，性能优化看指标，体验改进看路径是否顺滑，可靠性建设看故障时能否降级和恢复，架构演进看未来变化是否容易吸收。

方案选择阶段，最容易犯的错误是直接套用熟悉工具。更稳妥的方式是列出约束：数据规模、时延要求、资源预算、团队熟悉度、运维能力、安全要求、可测试性和长期维护成本。只有把约束列清楚，才能解释为什么选择当前方案。否则方案看似高级，实际可能只是增加了复杂度。

实现落地阶段，要把 $a 和 $b 拆成可验证的小步骤。每一步都应该有明确的输入、输出和检查方式。对学习笔记而言，这意味着不能只有大段概念，还应该补充流程图式的文字描述、伪代码、命令示例、参数解释、错误现象和排查路径。这样以后复习时，笔记不仅能帮助理解，也能直接指导实践。

问题暴露阶段，要优先区分“理解错误、实现错误、环境错误、数据错误、依赖错误、边界条件错误”。很多复杂问题之所以难排，是因为一开始就把问题归因到错误层级。例如把配置问题当成算法问题，把权限问题当成代码问题，把数据分布变化当成模型失效，把硬件噪声当成软件逻辑错误。好的排查顺序应该从可观测事实开始，而不是从猜测开始。

持续优化阶段，不应只追求把当前问题压下去，还要沉淀成规则。比如记录触发条件、影响范围、定位方法、最终修复、预防措施和可监控指标。这样下一次出现类似问题时，团队可以复用经验，而不是重新从零排查。

#### 常见误区与纠偏

第一个误区是只记结论，不记前提。$topic 中很多结论都是有条件的：适用于小规模，不一定适用于大规模；适用于离线处理，不一定适用于实时系统；适用于单机环境，不一定适用于分布式环境；适用于教学案例，不一定适用于生产项目。纠偏方法是在每个重要结论后面补一句“适用条件”和“不适用情况”。

第二个误区是只关注工具，不关注模型。工具会变化，模型更稳定。无论工具名称如何变化，底层仍然要解决输入建模、状态管理、资源调度、错误恢复、性能约束和质量验证这些问题。学习 $topic 时，应该把工具用法和底层模型分开记录：工具命令解决“怎么做”，底层模型解释“为什么这样做”。

第三个误区是没有验证意识。很多笔记写得很完整，但没有说明如何确认自己做对了。对于 $category 相关主题，验证至少应包含最小样例、边界样例、异常样例和性能样例。最小样例证明流程跑通，边界样例证明理解完整，异常样例证明系统可恢复，性能样例证明方案在目标规模下仍然可用。

第四个误区是忽略可维护性。短期学习时，能跑通就容易产生掌握的错觉；长期使用时，命名、分层、注释、测试、日志、版本管理和文档才会决定知识能否转化为稳定能力。扩充 $topic 笔记时，应把“如何写得清楚、如何排查、如何交接、如何复盘”也纳入内容。

#### 学习与实践建议

建议围绕 $topic 做一个小型闭环练习：先用自己的话解释概念，再画出流程，再实现一个最小案例，然后主动制造一个错误并排查，最后写下复盘。这个过程看起来比直接读资料慢，但能显著提高迁移能力。很多人学完后不会用，根本原因是缺少“从概念到问题再到验证”的闭环。

复习时可以使用四个问题：它解决什么问题；它依赖什么条件；它失败时有什么表现；它如何被验证。只要这四个问题能回答清楚，说明对 $topic 的理解已经从表层进入工程层。如果回答不清楚，就回到对应章节补充例子、边界和排错方法。
## 扩展复盘清单

- 能否用一句话说明本主题解决的问题。
- 能否列出本主题最重要的输入、输出、约束和失败模式。
- 能否独立完成一个最小实践案例，并解释每一步为什么需要。
- 能否设计边界测试、异常测试和性能测试。
- 能否把本主题和所在技术体系中的其他主题连接起来理解。
