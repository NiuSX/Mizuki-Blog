# Maven 完整学习笔记

<!-- lecture-notes:integrated-v2 -->

## 讲义导读：把概念落到可验证实践

这一章讲的是 **Maven 完整学习笔记**，属于 **构建系统与包管理**。阅读时不要把它当成零散资料堆叠，而要把它当成一份讲义：先弄清它解决什么问题，再看核心概念和流程，最后做一个能复现、能观察、能排错的小练习。

### 一句话先懂

构建和包管理的核心，是让源码、依赖、编译选项、测试和产物在不同机器上稳定复现。

初学时先问三个问题：它的输入或前提是什么；它内部按什么规则工作；结果该用什么命令、日志、测试、图纸、波形或指标来证明。

### 通俗类比

构建系统像厨房出餐流程：食材是依赖，菜谱是配置，厨具是编译器，出餐标准是测试和产物；流程不清就会今天能做明天失败。

类比只是入门扶手。真正掌握时，要回到准确术语、配置、接口、版本、边界条件、错误信息和验证证据上。能解释失败原因，比只会照着步骤跑通更重要。

### 本章学习主线

1. **先看场景**：这个知识点通常在什么项目、岗位或问题里出现？
2. **再看结构**：它有哪些核心对象、配置、文件、命令、接口或流程？
3. **然后看路径**：一次完整使用从哪里开始，到哪里结束，中间有哪些状态变化？
4. **接着看边界**：版本差异、平台差异、权限、性能、安全、兼容性和资源限制在哪里？
5. **最后看验证**：用最小样例、测试、日志、调试工具或实物结果证明理解是对的。

### 本章重点抓手

项目结构、依赖声明、版本约束、构建生命周期、任务/目标、缓存、测试、发布、锁文件和多模块管理。

### 最小实践任务

建立一个最小多模块项目，配置依赖、测试、打包和版本锁定，并在干净环境里重新构建。

建议把练习记录成固定格式：目标、环境版本、最小示例、执行步骤、预期结果、实际结果、错误信息、定位过程和复盘。以后遇到真实项目问题时，这些记录会比单纯收藏教程更有用。

### 常见误区

- 只会点 IDE 构建，不知道命令行怎么复现。
- 依赖版本飘动。
- 构建脚本里混入本机路径和隐式环境。

### 推荐工具与资料

官方文档、最小 demo、日志、调试器、版本管理、测试命令、性能/诊断工具和复盘记录。

### 读完本章应该能做到

- 用自己的话解释核心概念和适用场景。
- 给出一个最小可运行或可验证样例。
- 说清至少一个常见错误的现象、原因和排查路径。
- 知道当前版本应该查哪份官方文档，而不是只依赖旧教程。

> 本节是讲义化改写后的阅读入口。后续正文中的命令、配置、图纸、代码和参考资料，都应围绕“场景 -> 概念 -> 操作 -> 验证 -> 复盘”来理解。


> 适合对象：Java 初学者、后端开发学习者、Spring Boot 学习者、需要系统掌握 Java 项目构建和依赖管理的人。
Maven 是 Java 生态中非常重要的项目构建和依赖管理工具。它不仅能下载 jar 包，还负责项目标准目录、编译、测试、打包、安装、发布、插件执行、多模块管理、依赖传递、版本统一、私服部署和 CI/CD 构建。

如果你只会执行 `mvn package`，还不算真正理解 Maven。真正掌握 Maven，需要理解：POM 是什么、坐标是什么、依赖如何解析、生命周期如何驱动插件、插件 goal 如何绑定到 phase、多模块如何聚合构建、父 POM 和 dependencyManagement 有什么区别、settings.xml 和 pom.xml 分别管什么、为什么会依赖冲突、如何排查构建失败。

版本说明：截至 2026-06-07，Apache Maven 官方下载页显示 Maven 3.9.16 是当前推荐版本；Maven 4.0.0-rc-5 是预览版本，官方提示 Maven 4 仍在开发中，不建议用于生产。Maven 3.9+ 运行 Maven 本身需要 JDK 8 或以上；Maven 4.0+ 运行 Maven 本身需要 JDK 17 或以上。具体版本请始终以 Apache Maven 官方下载页为准。

## 目录

1. Maven 是什么
2. Maven 解决什么问题
3. Maven、Gradle、Ant 的区别
4. Maven 安装与环境配置
5. Maven 核心概念总览
6. Maven 标准目录结构
7. POM 是什么
8. Maven 坐标
9. packaging 打包类型
10. Super POM 与 Effective POM
11. Maven 生命周期
12. phase、goal、plugin 的关系
13. 常用 Maven 命令
14. 依赖管理基础
15. 依赖作用域 scope
16. 传递依赖
17. 依赖冲突与版本调解
18. optional 和 exclusions
19. dependencyManagement
20. BOM
21. properties 属性
22. repositories 仓库
23. 本地仓库、中央仓库、远程仓库
24. settings.xml
25. mirror 镜像
26. profile 构建环境
27. 插件 plugin
28. pluginManagement
29. 常用插件详解
30. 资源文件与过滤
31. 测试：Surefire 与 Failsafe
32. 多模块项目
33. 父 POM 与聚合 POM
34. Maven Wrapper
35. Archetype 项目模板
36. SNAPSHOT 与 Release
37. 发布到私服 Nexus / Artifactory
38. Maven 与 Spring Boot
39. Maven 与 CI/CD
40. 依赖安全与依赖治理
41. 常见错误排查
42. Maven 最佳实践
43. 学习路线
44. 常用命令速查
45. 官方参考资料

## 1. Maven 是什么

Maven 是 Apache 开源的项目管理和构建工具，主要用于 Java 项目。

它的核心功能：

- 项目构建
- 依赖管理
- 插件执行
- 测试
- 打包
- 安装到本地仓库
- 发布到远程仓库
- 多模块管理
- 项目文档和报告

Maven 的核心思想：

```text
约定优于配置
```

也就是说，只要你按 Maven 推荐的目录结构组织项目，Maven 就知道：

- 源代码在哪里
- 测试代码在哪里
- 资源文件在哪里
- 编译结果放哪里
- 打包结果放哪里

你不需要为每个项目重复写大量构建脚本。

## 2. Maven 解决什么问题

### 2.1 依赖管理问题

没有 Maven 时，Java 项目依赖 jar 包通常要手动下载，然后放到 `lib` 目录。

问题：

- jar 包版本容易混乱
- 依赖的依赖也要手动找
- 团队成员本地 jar 不一致
- 升级版本很麻烦
- 不知道 jar 从哪里来

Maven 解决方式：

```xml
<dependency>
  <groupId>org.springframework</groupId>
  <artifactId>spring-context</artifactId>
  <version>6.2.0</version>
</dependency>
```

Maven 会自动下载这个依赖，以及它需要的传递依赖。

### 2.2 构建流程问题

没有统一工具时，每个项目构建方式不同：

- 有的用脚本
- 有的用 IDE
- 有的手动编译
- 有的手动打包

Maven 提供统一命令：

```bash
mvn clean
mvn compile
mvn test
mvn package
mvn install
```

### 2.3 项目结构问题

Maven 提供标准目录。

这样团队成员看到项目就知道：

- 主代码在哪里
- 测试代码在哪里
- 配置文件在哪里
- 构建产物在哪里

### 2.4 多模块管理问题

大型 Java 项目通常拆成多个模块：

- api
- common
- service
- web
- data

Maven 可以管理模块之间依赖和构建顺序。

## 3. Maven、Gradle、Ant 的区别

| 工具 | 特点 | 适合场景 |
| :--- | :--- | :--- |
| Ant | 早期构建工具，过程式脚本 | 老项目 |
| Maven | 约定优于配置，依赖管理成熟 | Java 后端、企业项目 |
| Gradle | 灵活、性能好、脚本能力强 | Android、复杂构建 |

### 3.1 Maven 优点

- 标准化强
- 学习资料多
- Java 生态支持好
- 企业项目常用
- 依赖管理成熟
- 多模块项目稳定

### 3.2 Maven 缺点

- XML 配置较冗长
- 灵活性不如 Gradle
- 复杂定制时不够直观
- 构建性能有时不如 Gradle

### 3.3 初学建议

如果你学习 Java 后端、Spring Boot、企业项目：

```text
先学 Maven
```

因为 Maven 是大量 Java 项目的基础。

## 4. Maven 安装与环境配置

### 4.1 前置条件

需要安装 JDK。

检查：

```bash
java -version
javac -version
```

Maven 3.9+ 运行 Maven 本身需要 JDK 8+。

注意：

运行 Maven 的 JDK 和项目编译目标版本不是一回事。项目可以通过 compiler 配置或 toolchains 指定目标 Java 版本。

### 4.2 安装 Maven

常见方式：

- 从 Apache Maven 官网下载 zip / tar.gz
- 使用 SDKMAN
- 使用 Homebrew
- 使用系统包管理器
- 使用 Maven Wrapper

Windows 手动安装大致步骤：

1. 下载 Maven binary zip
2. 解压到目录，例如 `D:\dev\apache-maven`
3. 配置环境变量 `MAVEN_HOME`
4. 把 `%MAVEN_HOME%\bin` 加入 `Path`
5. 打开新终端验证

验证：

```bash
mvn -version
```

### 4.3 mvn -version 输出看什么

示例关注：

```text
Apache Maven ...
Maven home: ...
Java version: ...
Java home: ...
OS name: ...
```

需要确认：

- Maven 版本正确
- Java 版本正确
- Java home 正确

## 5. Maven 核心概念总览

| 概念 | 含义 |
| :--- | :--- |
| POM | Maven 项目配置文件 |
| groupId | 组织或公司标识 |
| artifactId | 项目或模块名 |
| version | 版本号 |
| packaging | 打包类型 |
| dependency | 项目依赖 |
| repository | 仓库 |
| lifecycle | 生命周期 |
| phase | 生命周期阶段 |
| plugin | 插件 |
| goal | 插件目标 |
| scope | 依赖作用域 |
| profile | 环境配置 |
| module | 多模块子项目 |

Maven 的核心可以这样理解：

```text
POM 描述项目
坐标定位项目
依赖声明需要什么
仓库提供依赖
生命周期定义构建流程
插件执行具体任务
```

## 6. Maven 标准目录结构

标准结构：

```text
my-app/
  pom.xml
  src/
    main/
      java/
      resources/
    test/
      java/
      resources/
  target/
```

### 6.1 目录说明

| 目录 | 作用 |
| :--- | :--- |
| `pom.xml` | Maven 配置文件 |
| `src/main/java` | 主 Java 源码 |
| `src/main/resources` | 主资源文件 |
| `src/test/java` | 测试 Java 源码 |
| `src/test/resources` | 测试资源文件 |
| `target` | 构建输出目录 |

### 6.2 Web 项目常见目录

```text
src/main/webapp
```

用于传统 WAR 项目的 Web 资源。

### 6.3 为什么目录结构重要

因为 Maven 默认按这个结构工作。

如果你遵守约定，就少写配置。

如果你不遵守，就需要额外配置插件和路径。

## 7. POM 是什么

POM 是 Project Object Model，项目对象模型。

文件名：

```text
pom.xml
```

它描述：

- 项目坐标
- 项目名称
- 项目版本
- 打包方式
- 依赖
- 插件
- 构建配置
- 模块
- 仓库
- profile

### 7.1 最小 POM

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.example</groupId>
  <artifactId>demo</artifactId>
  <version>1.0.0</version>
</project>
```

### 7.2 常见 POM 元素

| 元素 | 作用 |
| :--- | :--- |
| modelVersion | POM 模型版本，通常是 4.0.0 |
| groupId | 组织标识 |
| artifactId | 项目标识 |
| version | 项目版本 |
| packaging | 打包方式 |
| name | 项目名称 |
| description | 项目描述 |
| properties | 属性 |
| dependencies | 依赖 |
| dependencyManagement | 依赖版本管理 |
| build | 构建配置 |
| plugins | 插件 |
| profiles | 环境配置 |
| modules | 多模块 |

## 8. Maven 坐标

Maven 用坐标唯一定位一个构件。

核心坐标：

```text
groupId:artifactId:version
```

完整还可能包含：

```text
groupId:artifactId:packaging:classifier:version
```

### 8.1 groupId

通常是公司或组织域名反写。

例子：

```text
com.example
org.springframework
com.fasterxml.jackson.core
```

### 8.2 artifactId

项目或模块名称。

例子：

```text
spring-core
jackson-databind
my-service
```

### 8.3 version

版本号。

例子：

```text
1.0.0
1.0.0-SNAPSHOT
2.3.1
```

### 8.4 坐标例子

```xml
<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-databind</artifactId>
  <version>2.17.2</version>
</dependency>
```

## 9. packaging 打包类型

packaging 表示项目打包方式。

常见：

| packaging | 含义 |
| :--- | :--- |
| jar | 普通 Java jar |
| war | Web 应用 |
| pom | 父工程或聚合工程 |
| maven-plugin | Maven 插件 |
| ear | 企业应用归档 |

如果不写：

```text
默认 jar
```

### 9.1 jar

普通 Java 项目。

### 9.2 war

传统 Servlet Web 项目。

Spring Boot 现在更常打可执行 jar，但仍可打 war。

### 9.3 pom

常用于：

- 父 POM
- 多模块聚合 POM
- BOM

父工程通常：

```xml
<packaging>pom</packaging>
```

## 10. Super POM 与 Effective POM

### 10.1 Super POM

Maven 内置一个默认父 POM，所有项目都会继承它。

它提供默认配置，例如：

- 默认目录
- 默认插件绑定
- 默认仓库

### 10.2 Effective POM

Effective POM 是最终生效的 POM。

它由多部分合并：

- Super POM
- 父 POM
- 当前 POM
- profiles
- 默认配置

查看：

```bash
mvn help:effective-pom
```

这是排查配置问题的重要命令。

## 11. Maven 生命周期

Maven 生命周期定义构建流程。

Maven 有三套主要生命周期：

| 生命周期 | 作用 |
| :--- | :--- |
| clean | 清理构建输出 |
| default | 编译、测试、打包、安装、部署 |
| site | 生成项目站点文档 |

### 11.1 clean 生命周期

常用阶段：

```text
pre-clean
clean
post-clean
```

常用命令：

```bash
mvn clean
```

作用：

- 删除 `target` 目录

### 11.2 default 生命周期

最常用。

重要阶段：

| phase | 作用 |
| :--- | :--- |
| validate | 验证项目是否正确 |
| compile | 编译主代码 |
| test | 运行单元测试 |
| package | 打包 |
| verify | 验证包是否符合质量要求 |
| install | 安装到本地仓库 |
| deploy | 部署到远程仓库 |

### 11.3 phase 是顺序执行的

执行：

```bash
mvn package
```

会依次执行：

```text
validate -> compile -> test -> package
```

执行：

```bash
mvn install
```

会执行到 install 之前的所有阶段。

## 12. phase、goal、plugin 的关系

这是 Maven 最重要也最容易混淆的部分。

### 12.1 lifecycle

生命周期是一套流程。

例如 default lifecycle。

### 12.2 phase

phase 是生命周期中的阶段。

例如：

- compile
- test
- package

### 12.3 plugin

plugin 是真正干活的插件。

例如：

- maven-compiler-plugin
- maven-surefire-plugin
- maven-jar-plugin

### 12.4 goal

goal 是插件中的具体任务。

例如：

```text
compiler:compile
surefire:test
jar:jar
```

### 12.5 关系总结

```text
执行 phase
  -> Maven 找到绑定到这个 phase 的 plugin goal
    -> plugin goal 执行具体任务
```

例如：

```bash
mvn compile
```

会触发 compiler 插件的 compile goal。

### 12.6 直接执行插件 goal

```bash
mvn dependency:tree
mvn help:effective-pom
```

这不是执行生命周期阶段，而是直接执行某个插件 goal。

## 13. 常用 Maven 命令

### 13.1 清理

```bash
mvn clean
```

删除 `target`。

### 13.2 编译

```bash
mvn compile
```

编译主代码。

### 13.3 测试

```bash
mvn test
```

运行单元测试。

### 13.4 打包

```bash
mvn package
```

生成 jar / war。

### 13.5 安装到本地仓库

```bash
mvn install
```

把构件安装到本地仓库。

### 13.6 部署到远程仓库

```bash
mvn deploy
```

发布到 Nexus、Artifactory 等远程仓库。

### 13.7 跳过测试

只跳过测试执行：

```bash
mvn package -DskipTests
```

跳过测试编译和执行：

```bash
mvn package -Dmaven.test.skip=true
```

一般更推荐 `-DskipTests`。

### 13.8 强制更新依赖

```bash
mvn clean package -U
```

`-U` 强制更新 SNAPSHOT 依赖。

### 13.9 查看依赖树

```bash
mvn dependency:tree
```

## 14. 依赖管理基础

依赖写在：

```xml
<dependencies>
  <dependency>
    ...
  </dependency>
</dependencies>
```

### 14.1 基本依赖

```xml
<dependency>
  <groupId>org.apache.commons</groupId>
  <artifactId>commons-lang3</artifactId>
  <version>3.17.0</version>
</dependency>
```

### 14.2 Maven 如何下载依赖

流程：

```text
查本地仓库
  -> 没有则查远程仓库
    -> 下载到本地仓库
      -> 加入项目 classpath
```

默认远程仓库通常是 Maven Central。

### 14.3 本地仓库路径

默认：

```text
~/.m2/repository
```

Windows 通常：

```text
C:\Users\<用户名>\.m2\repository
```

## 15. 依赖作用域 scope

scope 决定依赖在哪些阶段可用。

| scope | 编译 | 测试 | 运行 | 打包 | 典型用途 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| compile | 是 | 是 | 是 | 是 | 默认 |
| provided | 是 | 是 | 否 | 否 | Servlet API |
| runtime | 否 | 是 | 是 | 是 | JDBC 驱动 |
| test | 否 | 是 | 否 | 否 | JUnit |
| system | 是 | 是 | 否 | 否 | 不推荐 |
| import | 特殊 | 特殊 | 特殊 | 特殊 | BOM 导入 |

### 15.1 compile

默认 scope。

编译、测试、运行都需要。

### 15.2 provided

编译需要，运行环境提供。

例子：

```xml
<dependency>
  <groupId>jakarta.servlet</groupId>
  <artifactId>jakarta.servlet-api</artifactId>
  <version>6.1.0</version>
  <scope>provided</scope>
</dependency>
```

### 15.3 runtime

编译不需要，运行需要。

例子：

- 数据库驱动

### 15.4 test

只在测试时需要。

例子：

- JUnit
- Mockito

### 15.5 system

不推荐。

需要手动指定本地 jar 路径，破坏可移植性。

## 16. 传递依赖

如果你的项目依赖 A，而 A 依赖 B，那么你的项目也会间接依赖 B。

这叫传递依赖。

例子：

```text
你的项目 -> spring-web -> spring-core
```

Maven 会自动处理传递依赖。

### 16.1 好处

- 不用手动写所有间接依赖
- 依赖声明更简洁

### 16.2 风险

- 引入不需要的 jar
- 版本冲突
- 安全漏洞来自传递依赖
- 包体积膨胀

查看：

```bash
mvn dependency:tree
```

## 17. 依赖冲突与版本调解

同一个依赖可能被不同路径引入不同版本。

例子：

```text
project -> A -> C:1.0
project -> B -> C:2.0
```

Maven 需要决定用哪个版本。

### 17.1 最近路径优先

Maven 依赖调解通常遵循 nearest definition。

路径更短的版本优先。

### 17.2 路径长度相同

如果路径长度相同，通常先声明的依赖优先。

### 17.3 如何解决冲突

推荐方式：

- 在当前项目直接声明需要的版本
- 使用 dependencyManagement 统一版本
- 使用 BOM
- 排除错误传递依赖

## 18. optional 和 exclusions

### 18.1 optional

optional 表示这个依赖不会自动传递给下游项目。

```xml
<dependency>
  <groupId>com.example</groupId>
  <artifactId>feature-x</artifactId>
  <version>1.0.0</version>
  <optional>true</optional>
</dependency>
```

适合：

- 可选功能
- 避免强制下游引入某依赖

### 18.2 exclusions

排除传递依赖。

```xml
<dependency>
  <groupId>com.example</groupId>
  <artifactId>demo-lib</artifactId>
  <version>1.0.0</version>
  <exclusions>
    <exclusion>
      <groupId>commons-logging</groupId>
      <artifactId>commons-logging</artifactId>
    </exclusion>
  </exclusions>
</dependency>
```

使用场景：

- 排除冲突依赖
- 排除安全漏洞依赖
- 排除不需要的日志实现

注意：

不要盲目排除，排除后可能运行时报 ClassNotFound。

## 19. dependencyManagement

dependencyManagement 用于统一依赖版本，但不会自动引入依赖。

### 19.1 例子

父 POM：

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-databind</artifactId>
      <version>2.17.2</version>
    </dependency>
  </dependencies>
</dependencyManagement>
```

子模块：

```xml
<dependency>
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-databind</artifactId>
</dependency>
```

子模块省略 version，但仍需要显式声明 dependency。

### 19.2 dependencyManagement 的作用

- 统一版本
- 避免子模块重复写版本
- 管理传递依赖版本
- 降低版本冲突

### 19.3 常见误区

误区：

```text
写进 dependencyManagement 就会自动引入依赖
```

纠正：

```text
不会。dependencyManagement 只管理版本。
```

## 20. BOM

BOM 是 Bill of Materials。

在 Maven 中，BOM 是一份依赖版本清单。

常用于统一一组相关依赖版本。

### 20.1 导入 BOM

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-dependencies</artifactId>
      <version>3.4.0</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
```

### 20.2 BOM 的作用

导入后，可以省略版本：

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

版本由 BOM 管理。

### 20.3 BOM 适合

- Spring Boot
- Spring Cloud
- Quarkus
- Netty
- Jackson 依赖组
- 企业内部统一依赖版本

## 21. properties 属性

properties 用于定义变量。

### 21.1 定义 Java 版本

```xml
<properties>
  <maven.compiler.source>17</maven.compiler.source>
  <maven.compiler.target>17</maven.compiler.target>
  <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
</properties>
```

### 21.2 定义依赖版本

```xml
<properties>
  <junit.version>5.11.0</junit.version>
</properties>
```

使用：

```xml
<version>${junit.version}</version>
```

### 21.3 常见内置属性

| 属性 | 含义 |
| :--- | :--- |
| `${project.groupId}` | 项目 groupId |
| `${project.artifactId}` | 项目 artifactId |
| `${project.version}` | 项目版本 |
| `${project.basedir}` | 项目根目录 |
| `${project.build.directory}` | 构建目录 |

## 22. repositories 仓库

repositories 用于声明远程依赖仓库。

```xml
<repositories>
  <repository>
    <id>my-repo</id>
    <url>https://repo.example.com/maven2</url>
  </repository>
</repositories>
```

### 22.1 不建议在业务项目乱写仓库

原因：

- 影响构建可重复性
- 可能引入不可信依赖
- 团队环境不统一

企业项目通常通过 settings.xml mirror 或私服统一管理仓库。

## 23. 本地仓库、中央仓库、远程仓库

### 23.1 本地仓库

默认：

```text
~/.m2/repository
```

作用：

- 缓存下载的依赖
- 保存本地 install 的构件

### 23.2 Maven Central

Maven 官方默认中央仓库。

大量开源 Java 依赖发布在这里。

### 23.3 私服

常见：

- Nexus Repository
- JFrog Artifactory

作用：

- 缓存中央仓库
- 发布公司内部 jar
- 管理权限
- 统一依赖来源
- 提升下载速度

## 24. settings.xml

settings.xml 是 Maven 用户或全局配置。

位置：

用户级：

```text
~/.m2/settings.xml
```

全局级：

```text
${MAVEN_HOME}/conf/settings.xml
```

### 24.1 settings.xml 管什么

常见：

- localRepository
- mirrors
- proxies
- servers
- profiles
- activeProfiles

### 24.2 pom.xml 和 settings.xml 区别

| 文件 | 作用 | 是否应提交代码仓库 |
| :--- | :--- | :--- |
| pom.xml | 项目构建配置 | 是 |
| settings.xml | 用户/机器环境配置 | 通常否 |

pom.xml 应描述项目本身。

settings.xml 应描述本地或企业环境。

## 25. mirror 镜像

mirror 用于把一个仓库请求镜像到另一个仓库。

常用于：

- 公司私服代理 Maven Central
- 国内镜像加速

### 25.1 示例

```xml
<mirrors>
  <mirror>
    <id>company-mirror</id>
    <mirrorOf>*</mirrorOf>
    <url>https://repo.company.com/repository/maven-public/</url>
  </mirror>
</mirrors>
```

### 25.2 mirrorOf

常见：

| mirrorOf | 含义 |
| :--- | :--- |
| `*` | 镜像所有仓库 |
| `central` | 只镜像 central |
| `external:*` | 外部仓库 |
| `*,!repo1` | 所有但排除 repo1 |

### 25.3 注意

mirror 是 settings.xml 配置，不建议写到 pom.xml。

## 26. profile 构建环境

profile 用于不同环境配置。

例如：

- dev
- test
- prod
- local

### 26.1 POM 中定义 profile

```xml
<profiles>
  <profile>
    <id>dev</id>
    <properties>
      <env.name>dev</env.name>
    </properties>
  </profile>
</profiles>
```

激活：

```bash
mvn package -Pdev
```

### 26.2 profile 可以做什么

- 切换属性
- 切换插件配置
- 切换依赖
- 切换资源过滤
- 切换仓库

### 26.3 不要滥用 profile

不要把大量业务差异都塞进 profile。

如果 dev/prod 差异主要是配置文件，通常交给应用配置系统更好。

## 27. 插件 plugin

Maven 插件是真正执行任务的组件。

### 27.1 插件配置位置

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-compiler-plugin</artifactId>
      <version>3.13.0</version>
      <configuration>
        <release>17</release>
      </configuration>
    </plugin>
  </plugins>
</build>
```

### 27.2 插件由 goal 组成

例如 maven-compiler-plugin：

- compiler:compile
- compiler:testCompile

### 27.3 插件版本要显式声明

推荐明确声明插件版本，尤其在企业项目和 CI 中。

否则 Maven 使用默认版本，可能随环境变化。

## 28. pluginManagement

pluginManagement 用于统一插件版本和默认配置，但不会自动执行插件。

父 POM：

```xml
<build>
  <pluginManagement>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>3.13.0</version>
        <configuration>
          <release>17</release>
        </configuration>
      </plugin>
    </plugins>
  </pluginManagement>
</build>
```

子模块：

```xml
<build>
  <plugins>
    <plugin>
      <artifactId>maven-compiler-plugin</artifactId>
    </plugin>
  </plugins>
</build>
```

### 28.1 pluginManagement 和 plugins 区别

| 配置 | 是否自动生效 |
| :--- | :--- |
| plugins | 会参与构建 |
| pluginManagement | 只管理版本和配置，子模块声明后才生效 |

## 29. 常用插件详解

### 29.1 maven-compiler-plugin

用于编译 Java。

推荐使用 `release`：

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-compiler-plugin</artifactId>
  <version>3.13.0</version>
  <configuration>
    <release>17</release>
  </configuration>
</plugin>
```

`release` 比单独 source/target 更能保证 API 兼容性。

### 29.2 maven-surefire-plugin

运行单元测试。

常用于：

```text
src/test/java
```

默认绑定到 test 阶段。

### 29.3 maven-failsafe-plugin

运行集成测试。

通常绑定：

- integration-test
- verify

常用于命名：

```text
*IT.java
```

### 29.4 maven-jar-plugin

打 jar 包。

可以配置 Manifest。

### 29.5 maven-source-plugin

打源码包。

常用于发布库。

### 29.6 maven-javadoc-plugin

生成 JavaDoc。

发布开源库到中央仓库时常需要。

### 29.7 maven-dependency-plugin

依赖分析。

常用：

```bash
mvn dependency:tree
mvn dependency:analyze
mvn dependency:copy-dependencies
```

### 29.8 maven-shade-plugin

打 fat jar / uber jar。

适合：

- 命令行工具
- 独立运行程序

注意：

- 可能有资源合并问题
- 可能有依赖冲突
- Spring Boot 项目通常用 spring-boot-maven-plugin

### 29.9 maven-assembly-plugin

打分发包。

例如：

- zip
- tar.gz
- 带脚本和配置的发布包

### 29.10 maven-enforcer-plugin

强制规则。

例如：

- Maven 版本
- Java 版本
- 禁止 SNAPSHOT 依赖
- 依赖收敛

非常适合企业项目。

## 30. 资源文件与过滤

资源文件目录：

```text
src/main/resources
src/test/resources
```

### 30.1 resources

构建时会复制到 classpath。

例如：

- application.yml
- logback.xml
- mapper.xml

### 30.2 资源过滤 filtering

可以把 Maven 属性替换到资源文件中。

POM：

```xml
<build>
  <resources>
    <resource>
      <directory>src/main/resources</directory>
      <filtering>true</filtering>
    </resource>
  </resources>
</build>
```

资源文件：

```text
app.version=${project.version}
```

### 30.3 注意

不要对二进制资源开启 filtering。

例如：

- 图片
- 字体
- keystore

否则文件可能损坏。

## 31. 测试：Surefire 与 Failsafe

### 31.1 单元测试

由 Surefire 执行。

命令：

```bash
mvn test
```

### 31.2 集成测试

由 Failsafe 执行。

通常：

```bash
mvn verify
```

### 31.3 为什么区分

单元测试：

- 快
- 不依赖外部服务
- 每次构建都跑

集成测试：

- 较慢
- 可能依赖数据库、容器、网络
- 通常在 verify 阶段运行

## 32. 多模块项目

大型项目常拆成多个模块。

结构：

```text
my-project/
  pom.xml
  common/
    pom.xml
  domain/
    pom.xml
  service/
    pom.xml
  web/
    pom.xml
```

父 POM：

```xml
<packaging>pom</packaging>

<modules>
  <module>common</module>
  <module>domain</module>
  <module>service</module>
  <module>web</module>
</modules>
```

### 32.1 Reactor

Maven 会构建 Reactor，自动分析模块依赖顺序。

例如：

```text
common -> domain -> service -> web
```

Maven 会先构建被依赖模块。

### 32.2 构建指定模块

```bash
mvn install -pl web
```

同时构建依赖模块：

```bash
mvn install -pl web -am
```

构建依赖当前模块的模块：

```bash
mvn install -pl common -amd
```

### 32.3 常用参数

| 参数 | 含义 |
| :--- | :--- |
| `-pl` | 指定模块 |
| `-am` | 同时构建所需依赖模块 |
| `-amd` | 同时构建依赖当前模块的模块 |
| `-T` | 并行构建 |

## 33. 父 POM 与聚合 POM

父 POM 和聚合 POM 经常是同一个文件，但概念不同。

### 33.1 父 POM

用于继承配置。

子模块中：

```xml
<parent>
  <groupId>com.example</groupId>
  <artifactId>my-parent</artifactId>
  <version>1.0.0</version>
</parent>
```

继承：

- properties
- dependencyManagement
- pluginManagement
- repositories
- profiles

### 33.2 聚合 POM

用于聚合模块。

```xml
<modules>
  <module>module-a</module>
  <module>module-b</module>
</modules>
```

### 33.3 区别

| 概念 | 作用 |
| :--- | :--- |
| parent | 配置继承 |
| aggregator | 模块聚合构建 |

一个 POM 可以既是 parent，又是 aggregator。

## 34. Maven Wrapper

Maven Wrapper 让项目自带 Maven 启动脚本。

文件：

```text
mvnw
mvnw.cmd
.mvn/wrapper/
```

### 34.1 好处

- 团队使用同一 Maven 版本
- CI 不必预装 Maven
- 降低环境差异

使用：

Linux/macOS：

```bash
./mvnw clean package
```

Windows：

```powershell
.\mvnw.cmd clean package
```

### 34.2 适合

推荐现代项目使用 Maven Wrapper。

## 35. Archetype 项目模板

Archetype 是 Maven 项目模板。

创建项目：

```bash
mvn archetype:generate
```

常见用途：

- 快速生成 Java 项目
- 快速生成 Web 项目
- 企业内部项目模板

现代 Spring Boot 项目通常更多使用 Spring Initializr。

## 36. SNAPSHOT 与 Release

### 36.1 SNAPSHOT

开发版本。

例如：

```text
1.0.0-SNAPSHOT
```

特点：

- 可能变化
- Maven 会根据更新策略检查远程版本
- 适合开发阶段

### 36.2 Release

正式版本。

例如：

```text
1.0.0
```

特点：

- 不应该变化
- 适合生产使用
- 发布后不要覆盖

### 36.3 原则

- 开发中用 SNAPSHOT
- 发布正式版本去掉 SNAPSHOT
- Release 不应重复覆盖
- 生产依赖尽量不用 SNAPSHOT

## 37. 发布到私服 Nexus / Artifactory

### 37.1 distributionManagement

POM 中配置发布地址：

```xml
<distributionManagement>
  <repository>
    <id>releases</id>
    <url>https://repo.company.com/repository/maven-releases/</url>
  </repository>
  <snapshotRepository>
    <id>snapshots</id>
    <url>https://repo.company.com/repository/maven-snapshots/</url>
  </snapshotRepository>
</distributionManagement>
```

### 37.2 settings.xml 配账号

```xml
<servers>
  <server>
    <id>releases</id>
    <username>your-user</username>
    <password>your-password</password>
  </server>
  <server>
    <id>snapshots</id>
    <username>your-user</username>
    <password>your-password</password>
  </server>
</servers>
```

注意：

`server.id` 必须和 `distributionManagement` 中的 id 对应。

### 37.3 发布命令

```bash
mvn deploy
```

## 38. Maven 与 Spring Boot

Spring Boot 项目常见 Maven 配置：

```xml
<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>3.4.0</version>
  <relativePath/>
</parent>
```

### 38.1 starter

Spring Boot starter 是依赖集合。

例如：

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

它会引入 Web 开发所需的一组依赖。

### 38.2 spring-boot-maven-plugin

用于：

- 打可执行 jar
- repackage
- 运行 Spring Boot 应用

常见：

```bash
mvn spring-boot:run
```

### 38.3 Spring Boot 依赖版本

Spring Boot 通常通过 parent 或 BOM 管理依赖版本。

一般不要随意给 starter 内部依赖单独指定版本，除非你知道原因。

## 39. Maven 与 CI/CD

CI 中常用：

```bash
mvn -B clean verify
```

`-B` 表示 batch mode，适合 CI。

### 39.1 常见 CI 步骤

```text
checkout
setup JDK
cache ~/.m2/repository
mvn -B clean verify
package artifact
deploy
```

### 39.2 CI 缓存 Maven 依赖

缓存：

```text
~/.m2/repository
```

可以减少构建时间。

注意：

缓存损坏时可清理。

### 39.3 CI 中不要依赖本地特殊配置

构建应可重复。

避免：

- 依赖本地 jar
- 依赖 IDE 配置
- 依赖未提交的 settings
- 依赖机器上手工安装的库

## 40. 依赖安全与依赖治理

依赖治理关注：

- 版本统一
- 漏洞扫描
- 不必要依赖
- 传递依赖风险
- License 合规
- 依赖升级

### 40.1 常用工具方向

- Maven Dependency Plugin
- Maven Enforcer Plugin
- OWASP Dependency-Check
- CycloneDX Maven Plugin
- versions-maven-plugin

### 40.2 dependency:analyze

```bash
mvn dependency:analyze
```

可发现：

- 已使用但未声明
- 已声明但未使用

### 40.3 生成 SBOM

现代供应链安全中，SBOM 越来越重要。

常见格式：

- CycloneDX
- SPDX

## 41. 常见错误排查

### 41.1 Could not resolve dependencies

原因：

- 网络问题
- 仓库地址错误
- 依赖版本不存在
- 私服无权限
- 本地缓存损坏

处理：

```bash
mvn clean package -U
```

必要时删除本地仓库中对应目录。

### 41.2 package not found / class not found

原因：

- 依赖没加
- scope 错
- 依赖被 exclusions 排除了
- 打包时没包含运行依赖

查看：

```bash
mvn dependency:tree
```

### 41.3 Source option 5 is no longer supported

原因：

编译插件默认 source 太旧。

解决：

```xml
<properties>
  <maven.compiler.release>17</maven.compiler.release>
</properties>
```

或配置 compiler plugin。

### 41.4 Tests failed

处理：

- 查看 `target/surefire-reports`
- 修测试
- 临时跳过：`-DskipTests`

不要长期跳过测试。

### 41.5 Non-resolvable parent POM

原因：

- parent 坐标错误
- parent 还没 install
- relativePath 错
- 私服下载不到 parent

处理：

- 先构建父项目
- 检查 parent 坐标
- 检查 relativePath
- 检查 settings 仓库

### 41.6 依赖版本冲突

现象：

- NoSuchMethodError
- ClassNotFoundException
- 运行时行为异常

排查：

```bash
mvn dependency:tree -Dverbose
```

解决：

- dependencyManagement 统一版本
- exclusions 排除错误版本
- 显式声明需要版本

### 41.7 编译通过，运行失败

常见原因：

- scope 用了 provided
- runtime 依赖没打进去
- shade/assembly 配置错误
- Spring Boot 没 repackage

## 42. Maven 最佳实践

### 42.1 固定插件版本

不要完全依赖默认插件版本。

在父 POM 用 pluginManagement 统一。

### 42.2 用 dependencyManagement 管版本

多模块项目不要每个模块随意写版本。

### 42.3 使用 BOM

对于 Spring Boot、Spring Cloud 等生态，优先使用官方 BOM。

### 42.4 不提交本地 settings.xml

settings.xml 常包含账号、密码、个人路径。

不应提交。

可以提交示例：

```text
settings-example.xml
```

### 42.5 避免 system scope

system scope 破坏可移植性。

应把第三方 jar 安装到私服或本地仓库。

### 42.6 使用 Maven Wrapper

保证团队和 CI 使用一致 Maven 版本。

### 42.7 定期查看依赖树

```bash
mvn dependency:tree
```

尤其是：

- 升级框架
- 引入新 starter
- 出现运行时冲突

### 42.8 CI 使用 clean verify

```bash
mvn -B clean verify
```

比只跑 package 更适合质量检查。

## 43. 学习路线

### 阶段 1：会用 Maven

掌握：

- 安装 Maven
- 创建项目
- 运行 `mvn test`
- 运行 `mvn package`
- 添加依赖

### 阶段 2：理解 POM

掌握：

- groupId
- artifactId
- version
- packaging
- dependencies
- properties
- build/plugins

### 阶段 3：理解生命周期和插件

掌握：

- clean/default/site
- phase
- goal
- plugin
- compiler/surefire/jar

### 阶段 4：理解依赖机制

掌握：

- scope
- transitive dependency
- dependency tree
- conflict
- exclusions
- optional
- dependencyManagement
- BOM

### 阶段 5：多模块和企业实践

掌握：

- parent
- modules
- reactor
- pluginManagement
- profiles
- settings.xml
- mirror
- private repository
- deploy

### 阶段 6：工程治理

掌握：

- Maven Wrapper
- CI
- 依赖安全
- enforcer
- reproducible builds
- 版本发布

## 44. 常用命令速查

### 基础构建

```bash
mvn clean
mvn compile
mvn test
mvn package
mvn install
mvn deploy
```

### 跳过测试

```bash
mvn package -DskipTests
mvn package -Dmaven.test.skip=true
```

### 依赖分析

```bash
mvn dependency:tree
mvn dependency:analyze
mvn dependency:copy-dependencies
```

### 查看有效 POM

```bash
mvn help:effective-pom
mvn help:effective-settings
```

### 多模块

```bash
mvn install -pl module-a
mvn install -pl module-a -am
mvn install -pl module-a -amd
mvn install -T 4
```

### profile

```bash
mvn package -Pdev
mvn package -Pprod
```

### 强制更新

```bash
mvn clean package -U
```

### 离线构建

```bash
mvn -o package
```

前提是依赖已在本地仓库。

### 调试输出

```bash
mvn -X package
```

## 45. 官方参考资料

建议优先阅读 Apache Maven 官方文档：

- [Maven 官方网站](https://maven.apache.org/)
- [Maven 下载页](https://maven.apache.org/download.cgi)
- [Maven 安装说明](https://maven.apache.org/install.html)
- [Maven 官方文档入口](https://maven.apache.org/guides/)
- [POM Reference](https://maven.apache.org/pom.html)
- [Introduction to the Build Lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
- [Introduction to the Dependency Mechanism](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html)
- [Standard Directory Layout](https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html)
- [Settings Reference](https://maven.apache.org/settings.html)
- [Available Plugins](https://maven.apache.org/plugins/)
- [Maven Releases History](https://maven.apache.org/docs/history)

## 最后总结

Maven 的核心可以浓缩为：

```text
POM 描述项目
坐标定位构件
仓库存放构件
依赖声明需要什么
scope 决定依赖在哪用
生命周期定义构建流程
插件执行具体任务
dependencyManagement 管版本
BOM 管一组版本
parent 负责继承
modules 负责聚合
settings 管本地和企业环境
```

初学时最重要的不是背 XML，而是理解 Maven 的工作模型：

1. Maven 读取 POM。
2. 合成 Effective POM。
3. 解析依赖。
4. 从本地或远程仓库获取构件。
5. 按生命周期阶段执行。
6. 调用绑定的插件 goal。
7. 输出构建产物到 target。
8. install 或 deploy 到仓库。

当你能解释一条命令 `mvn clean package` 背后发生了什么，并能用 `dependency:tree`、`effective-pom`、`settings.xml`、`dependencyManagement` 排查问题时，就已经真正入门 Maven。

## 46. 2026-06 深化补充：企业项目中的 Maven 判断力

截至 2026-06-13，Apache Maven 下载页显示 Maven 3.9.16 是推荐稳定版本，Maven 4.0.0-rc-5 仍属于预览版本；Maven 3.9+ 运行 Maven 本身要求 JDK 8+，Maven 4.0+ 运行 Maven 本身要求 JDK 17+。生产项目升级 Maven 大版本前，应先在 CI 中验证插件、私服、父 POM、Wrapper 和多模块构建。

### 46.1 依赖治理的优先级

| 问题 | 首选手段 | 说明 |
| --- | --- | --- |
| 版本散落 | `dependencyManagement` 或 BOM | 子模块只声明依赖，不重复写版本 |
| 插件版本不稳定 | `pluginManagement` | 避免 Maven 默认插件版本随环境变化 |
| 传递依赖冲突 | `mvn dependency:tree -Dverbose` | 先看谁引入，再决定排除或统一版本 |
| 构建环境不一致 | Maven Wrapper + CI 固定 JDK | 不依赖开发者本机 Maven |
| 安全漏洞 | SBOM + 依赖扫描 | 关注直接依赖和传递依赖 |
| 私服污染 | 统一 mirror 和仓库策略 | 不在业务 POM 到处写第三方仓库 |

### 46.2 多模块项目推荐结构

```text
root
├── pom.xml                  # 聚合 + 统一版本
├── app                      # 启动入口
├── domain                   # 领域模型和业务接口
├── application              # 用例服务
├── infrastructure           # 数据库、消息、外部服务适配
└── interfaces               # REST/RPC/CLI 入口
```

父 POM 负责“统一约束”，不应该塞业务代码。聚合 POM 负责“把模块一起构建”，不一定承担继承职责。大型项目中可以把继承父 POM 和聚合根 POM 分开，避免所有模块被迫继承同一套业务配置。

### 46.3 排查 Maven 构建问题的固定顺序

1. `mvn -version`：确认 Maven、JDK、系统编码和运行目录。
2. `mvn help:effective-pom`：确认最终 POM 是否符合预期。
3. `mvn help:effective-settings`：确认 mirror、profile、server 是否生效。
4. `mvn dependency:tree`：确认依赖版本和冲突路径。
5. `mvn -X`：只在前面看不出来时打开 debug 日志。
6. CI 失败但本地成功时，优先比较 JDK、环境变量、settings、私服权限和缓存。

### 46.4 常见反模式

- 在子模块到处写相同依赖版本，导致升级成本失控。
- 为了解决冲突随手 `exclusion`，但没有记录为什么排除。
- 在业务 POM 中配置多个外部仓库，导致构建不可复现。
- 滥用 `system` scope 引入本地 jar，破坏团队和 CI 构建。
- 只运行 `mvn package -DskipTests`，长期不运行 `verify`。
- 父 POM 过度复杂，导致新模块无法判断配置从哪里来。

## 47. 补充参考资料

- [Apache Maven Download](https://maven.apache.org/download.cgi)
- [Maven POM Reference](https://maven.apache.org/pom.html)
- [Maven Build Lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
- [Maven Dependency Mechanism](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html)
- [Maven Settings Reference](https://maven.apache.org/settings.html)
- [Maven Wrapper](https://maven.apache.org/wrapper/)

## 2026-06 深化整理：Maven 的工程化学习框架

Last researched: 2026-06-16

### 1. 学习定位

Maven 这类知识不适合只按“概念清单”记忆，更适合按可交付能力组织。本文后续复习时，应围绕这条主线展开：POM、生命周期、插件、依赖范围、仓库、BOM、多模块和发布。如果只会照抄命令、配置或示例，而不能解释输入、输出、边界、失败模式和验证方法，知识在真实项目里会很快失效。

一份万字级笔记要承担三个作用：第一，建立准确概念，避免把相似术语混在一起；第二，形成可执行流程，知道从零搭建、调试和交付的顺序；第三，沉淀排错经验，遇到异常时能按证据定位，而不是凭感觉改配置。学习时建议把每个小节都对应到“是什么、为什么、怎么做、什么时候不用、出了问题怎么查”五个问题。

### 2. 核心模块

- 生命周期定义构建阶段
- 插件把阶段映射到具体目标
- 依赖范围控制编译、测试和运行 classpath
- BOM 统一版本对齐
- 多模块构建要保持清晰依赖方向

这些模块之间不是孤立关系。通常先有需求和约束，再选择架构或工具；工具落地后会产生配置、接口、状态和制品；运行阶段再通过日志、指标、测试和回滚机制验证结果。真正掌握本主题，意味着能从一次失败现象反推到是哪一层出了问题。

```mermaid
flowchart LR
  A[目标与约束] --> B[核心概念]
  B --> C[工程实现]
  C --> D[测试与验证]
  D --> E[上线或交付]
  E --> F[日志、指标、反馈]
  F --> B
```

Figure: 通用学习与工程闭环，结合官方文档、标准资料和社区实践重新整理。

### 3. 实践路线

建议按四轮学习。第一轮只跑通最小例子，不追求复杂度；第二轮补齐关键概念，明确每个配置项和命令的作用；第三轮做故障注入，主动制造常见错误并记录现象；第四轮整理成项目模板，把目录结构、命名规范、检查清单和参考链接固化下来。

对技术笔记而言，最小例子必须可重复。命令类主题要记录操作系统、Shell、权限、工作目录和返回码；框架类主题要记录版本、依赖、构建命令、目录结构和运行入口；工程设计类主题要记录标准依据、图纸、点表、验收项和变更记录。没有环境信息的示例，后续很难判断是知识错误、版本差异还是本机配置问题。

### 4. 常见错误

- 依赖冲突不看 dependency tree
- 把插件版本留空
- scope 误用导致运行期缺类
- SNAPSHOT 滥用
- 父 POM 变成杂物箱

排查时先收集事实：版本、配置、输入、输出、日志、错误码、时间点、复现步骤。不要一开始就改多个参数。一次只改一个变量，并记录改动前后的现象。对于涉及安全、权限、部署、数据库、电气或工业控制的主题，要优先查官方文档和标准，社区文章只能作为实践参考，不能作为唯一依据。

### 5. 笔记维护建议

后续更新这篇文档时，建议保留 `Last researched` 日期，并把新增内容放到“版本差异”“实践坑”“调试清单”“参考资料”中。对于快速变化的工具链，例如 Android、Gradle、Docker、CI/CD、Redis、uv、Qt 和前端标准，至少在重新实践前核对一次官方文档。对于工业、电气、PLC、RBAC 这类涉及安全、权限或标准的内容，应明确标准编号、适用地区、适用版本和项目约束。

## 2026 综合技术资料与实践核对补充

这一组笔记主题较散，建议按“官方文档 + 最小样例 + 版本记录”三层核对。

- **官方来源**：Docker、CMake、Gradle、Maven、Redis、uv、Qt、Android、Material、MDN、Microsoft Learn、GNU Bash、PostgreSQL、NIST RBAC 等内容都应优先查对应官方文档。
- **版本记录**：CMake 查 cmake.org 文档，Gradle 查 Gradle User Manual，Maven 查 Apache Maven 文档，uv 查 Astral uv 官方文档。 学习笔记里涉及命令、配置、API、硬件型号或工具行为时，最好写清工具版本、系统环境和验证日期。
- **最小实践**：每个主题至少保留一个能复现的最小样例，包含输入、步骤、输出和错误排查。
- **工程意识**：不要只记“怎么用”，还要记录为什么这样用、边界条件是什么、换版本或换平台会不会失效。

参考资料入口：

- Docker Docs：https://docs.docker.com/
- CMake Documentation：https://cmake.org/documentation/
- Gradle User Manual：https://docs.gradle.org/current/userguide/userguide.html
- Apache Maven Documentation：https://maven.apache.org/guides/
- MDN Web Docs：https://developer.mozilla.org/
- Redis Docs：https://redis.io/docs/latest/
- uv Documentation：https://docs.astral.sh/uv/
- Qt Documentation：https://doc.qt.io/
- Android Developers：https://developer.android.com/
- Material Design：https://m3.material.io/
- Microsoft Learn PowerShell：https://learn.microsoft.com/powershell/
- Microsoft Windows Commands：https://learn.microsoft.com/windows-server/administration/windows-commands/windows-commands
- GNU Bash Manual：https://www.gnu.org/software/bash/manual/
- PostgreSQL Documentation：https://www.postgresql.org/docs/
- NIST RBAC Library：https://csrc.nist.gov/projects/role-based-access-control/rbac-library

## References and further reading

- [Official] [Maven Documentation](https://maven.apache.org/guides/index.html)
- [Official] [Maven POM Reference](https://maven.apache.org/pom.html)
- [Official] [Maven Dependency Mechanism](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html)
- [Official] [MDN Web Docs](https://developer.mozilla.org/)
- [Official] [Microsoft Learn](https://learn.microsoft.com/)
- [Official] [Docker Docs](https://docs.docker.com/)
- [Official] [GitHub Actions documentation](https://docs.github.com/actions)
- [Official] [GitLab CI/CD documentation](https://docs.gitlab.com/ci/)
- [Official] [CMake Documentation](https://cmake.org/cmake/help/latest/)
- [Official] [Gradle User Manual](https://docs.gradle.org/)
- [Official] [Apache Maven Guides](https://maven.apache.org/guides/)
- [Official] [Redis Documentation](https://redis.io/docs/latest/)
- [Official] [Qt Documentation](https://doc.qt.io/qt-6/)
- [Course] [MIT 6.006 Introduction to Algorithms](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/)

<!-- AUTO_EXPANDED_TO_REFERENCE_LENGTH_2026_06_23 -->

## 万字精讲扩展：Maven学习笔记

> 本节为按参考笔记篇幅补充的系统化扩展内容，目标是把原有笔记从“知识点记录”扩展为“概念、原理、流程、工程实践、常见误区和复盘清单”完整学习材料。

### 精讲扩展 1：Maven学习笔记 的概念边界、核心流程 与工程化理解

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
