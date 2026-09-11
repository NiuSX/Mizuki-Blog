---
title: "CI 流程"
---
# 服务器端部署配置

[官方配置教程](https://docs.gitea.com/zh-cn/usage/actions/overview)

Gitea Actions⽀持 CI/CD（Continuous Integration） 功能，该功能兼容 GitHub Actions，⽤⼾可以采用熟悉的YAML格式编写workflows，也可以重⽤⼤量的已有的 Actions 插件。Actions 插件支持从任意的 Git 网站中下载。

从Gitea **1.19**版本开始，Gitea Actions成为了内置的CI/CD解决方案。和其他CI/CD解决方案一样，Gitea不会自己运行Job，而是将Job委托给Runner。 Gitea Actions的Runner被称为act runner，它是一个独立的程序，也是用Go语言编写的。 它是基于 nektos/act  的一个分支

## 启用 gitea 的 actions
从1.21.0开始，默认情况下，Actions是启用的。如果您正在使用1.21.0之前的版本，您需要将以下内容添加到配置文件中以启用它：

```
[actions]
ENABLED=true
```

## 配置 Runner
Gitea Actions需要act runner 来运行Job,使用 Docker 进行部署 Runner。   
可以配置多个runner，不同的runner拥有不同的标签等，团队多个人员提交代码执行流程时，若只有一个runner则需要排队等待，多个runner会自动选取空闲runner进行构建。  
本部署采用的 docker 镜像 ` - /var/run/docker.sock:/var/run/docker.sock` ，标签区分不大。

```yml
services:
  runner:
    image: docker.io/gitea/act_runner:latest
    environment:
      GITEA_INSTANCE_URL: http://gitea:3000
      GITEA_RUNNER_REGISTRATION_TOKEN:  {Token} # 不同等级token见下面介绍
      GITEA_RUNNER_NAME: act_runner
      # 配置不同 runner 标签 build构建， test测试，deploy部署，
	 # 项目workflow 里可以指定标签即使用哪一个runner
      GITEA_RUNNER_LABELS: build, test, deploy
    volumes:
      - ./data:/data
      - /var/run/docker.sock:/var/run/docker.sock        # 挂载启用了 runner 的 docker
    networks:
      - gitea-net

networks:
  gitea_net:
    driver:bridge
```

参数介绍：
1. GITEA_RUNNER_REGISTRATION_TOKEN：注册 Token
	可以注册不同级别的runner：
    - 实例级别：runner 为实例中的所有仓库运行 jobs,管理员设置页面获取 token(**采用这个**)
    - 组织层级：runner 将为组织内所有仓库运行 jobs，组织设置页面获取 token
    - 仓库级别：runner 会为其所属仓库运行 jobs，仓库设置页面获取 token

> Gitea 管理员账户为部署时注册的账户 或 第一个注册的账户

2. GITEA_RUNNER_LABELS：标签决定了哪些工作流任务会被分配到这台 Runner 上执行，进行环境隔离
3. `gitea_net：brideg `：自定义的网络，由于 runner 只为 gitea仓库配置，所以使用容器内部网络，与宿主机其他网络隔离，不同 bridge 网络之间默认不通，容器之间可以直接通过服务名互相访问

> 如果对于启用了Gitea实例的Actions，存储库仍默认禁用Actions，在仓库设置页面启动

# 客户端 CI (以 代码检查 为例)

***以  自动化代码规范检查 workflow  为例：***

使用了**ktlint 代码规范**检查工具 和 **detekt 代码质量**检查工具
- ktlint 代码规范检查工具：ktlint 是一款专为 Kotlin 语言设计的代码格式化工具和静态分析工具，复杂代码规范问题，如 **代码格式、空格、缩进、导入顺序，花括号是否换行、通配符导入、多余空行**等规范格式问题
- detekt 代码分析：Detekt 是一款专为 Kotlin 语言设计的静态代码分析工具。主要负责代码质量问题，包含**代码逻辑、复杂程度、潜在Bug等问题，如 函数太长、嵌套太深、空 TODO()** 等


##  1. gradle 中工具配置

**添加插件**

```kotlin
// 根目录 build.gradle.kts 
plugins {
   // Detekt 静态分析插件
    id("io.gitlab.arturbosch.detekt") version "1.23.8" apply false
    // Ktlint 格式化插件
    id("org.jlleitschuh.gradle.ktlint") version "14.2.0" apply false
}

// 子模块 build.gradle.kts（如果是多模块项目)
plugins {
    id("io.gitlab.arturbosch.detekt")
    id("org.jlleitschuh.gradle.ktlint")
}
```
**配置 ktlint **

```kotlin
// ktlint 配置
ktlint {
    version.set("1.5.0")
    android.set(false)
    ignoreFailures.set(false)  // CI中必须为false，有错误就失败
    reporters {
        reporter(org.jlleitschuh.gradle.ktlint.reporter.ReporterType.PLAIN)
        reporter(org.jlleitschuh.gradle.ktlint.reporter.ReporterType.CHECKSTYLE)
        reporter(org.jlleitschuh.gradle.ktlint.reporter.ReporterType.SARIF)
    }
    filter {
        exclude("**/generated/**")
        include("**/kotlin/**")
    }
}
```

**配置Detekt**

```kotlin
// 在子模块或根模块的 build.gradle.kts 中
detekt {
    // 基于官方默认配置构建
    buildUponDefaultConfig = true
    
    // 指定自定义规则配置文件
    config.setFrom("$projectDir/config/detekt/detekt.yml")
    
    // 基线文件（用于忽略历史遗留问题）
    // 首次运行 detektBaseline 任务时,将代码问题记录 baseline.xml 文件中，
    // 后续检查时忽略这些问题
    //  baseline = file("$projectDir/config/detekt/baseline.xml
}
```



## 2. 编写 Gitea Actions 工作流配置

在项目目录下的 ` .gitea/workflows/code-quality.yml` 创建CI配置:

```yml
name: 代码规范检查

on:                      # 何时启动此工作流
  push:                  # gitea 检测到在以下分支中发生 push 事件时启用此工作流
    branches: 
      - main
      - develop
      - 'feature/**'

jobs:                   # 此工作流要执行的 jobs
  
  ktlint-check:                # ktlint 检查 job
    name: Ktlint 规范检查
    runs-on: build             # 选择使用哪一个 runner
    container: eclipse-temurin:17-jdk-jammy  # 选择项目需要运行的系统
    steps:                     # job 步骤
      - name: 拉取代码
        uses: actions/checkout@v4    # 使用官方 action,拉取代码到运行器中

      - name: 安装 JDK 17            # 配置运行器中使用的java环境
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      
      #赋予 Gradle Wrapper 脚本可执行权限，确保后续步骤能够正常运行 Gradle 命令
      - name: 授予 gradlew 执行权限   
        run: chmod +x gradlew

      - name: 运行 ktlint 检查
        run: ./gradlew ktlintCheck --no-daemon

       - name: Quality Gate 判断
         if: always()  # 确保无论上面是否失败都执行此步骤
         run: |
            if [[ "${{ steps.lint.outcome }}" != "success" ]]; then
              echo " Ktlint 检查失败！"
              echo " 修复指引：请本地运行 './gradlew ktlintFormat' 自动格式化代码后重新提交。"
              exit 1
            fi
            echo " 所有质量检查通过！
```


**可以选择启用的其他 detekt  job**：（暂时未使用）

```yml
 # detekt 代码分析 （Detekt 是一款专为 Kotlin 语言设计的静态代码分析工具）
  detekt-analysis:     
    name: Detekt 静态分析
    runs-on: ubuntu-latest      # 在哪个虚拟环境下运行
    steps:                      # 此 job 执行的步骤
      - name: 拉取代码     
        uses: actions/checkout@v4  # 使用官方 action,拉取代码到运行器中

      - name: 安装 JDK 17         # 配置运行器中使用的java环境
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

	#赋予 Gradle Wrapper 脚本可执行权限，确保后续步骤能够正常运行 Gradle 命令
      - name: 授予 gradlew 执行权限   
        run: chmod +x gradlew

      - name: 运行 Detekt 检查          # 执行Detekt 静态代码检查
        run: ./gradlew detekt --no-daemon

       # Detekt 生成的 HTML 检查报告上传并保存为工作流产物  
      - name: 上传 Detekt 代码检查报告   
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: detekt-report
          path: build/reports/detekt/
```

##  3. 配置.editorconfig (ktlint 检查规则)

ktlint 插件 默认使用 kotlint 官方的代码规范，规则默认开启。   
通过配置 `.editorconfig` 文件可覆盖调整部分自定义的规则规范。 

在项目根目录创建 .editorconfig：

```yml
root = true

[*]
charset = utf-8                    # 文件编码：UTF-8
end_of_line = lf                   # 换行符：Unix 风格（\n）
insert_final_newline = true        # 文件末尾自动插入一个空行
trim_trailing_whitespace = true    # 自动删除行尾多余的空格

[*.{kt,kts}]                       # 仅对 .kt 和 .kts 文件生效
indent_style = space               # 缩进类型：空格（不用 Tab）
indent_size = 4                    # 缩进大小：4 个空格
continuation_indent_size = 4       # 续行缩进：4 个空格
max_line_length = 120              # 每行最大字符数：120

# 可选：覆盖某些 Ktlint 规则
# ij_kotlin_allow_trailing_comma = true
# ....
# ....

```


## 4. 配置 detekt.yml (Detekt 检查规则)

(deteke 代码质量检查规则，**暂未启用**)
创建 config/detekt/detekt.yml，参考以下核心规则：

```yml
build:
  maxIssues: 0              # 允许的最大问题数量，设为 0 表示发现任何问题都立即失败
  excludeCorrectable: false # 是否排除可自动修复的问题？false = 全部计入，一个都不放过

# ------------------------------------------------------------
# 代码复杂度规则：防止代码过于复杂难以维护
# ------------------------------------------------------------
complexity:
  LongMethod:
    active: true            # 启用长方法检测
    threshold: 60           # 方法体超过 60 行就触发警告
  LongParameterList:
    active: true            # 启用参数过多检测
    threshold: 6            # 函数参数超过 6 个触发警告
    ignoreDefaultParameters: true  # 统计时忽略有默认值的参数
  CyclomaticComplexMethod:
    active: true            # 启用圈复杂度检测（衡量代码分支路径数量）
    threshold: 15           # 圈复杂度超过 15 报警，超过此值说明逻辑分支过多

# ------------------------------------------------------------
# 命名规范：统一团队代码命名风格
# ------------------------------------------------------------
naming:
  FunctionNaming:
    active: true
    functionPattern: '[a-z][a-zA-Z0-9]*'  # 函数名必须小驼峰：首字母小写，如 getUserInfo
  ClassNaming:
    active: true
    classPattern: '[A-Z][a-zA-Z0-9]*'     # 类名必须大驼峰：首字母大写，如 UserService

# ------------------------------------------------------------
# 潜在 Bug 检测：揪出可能导致运行时崩溃的代码
# ------------------------------------------------------------
potential-bugs:
  UnsafeCallOnNullableType:
    active: true            # 检测对可空类型的不安全调用（如没判空直接 .xxx）
  EqualsWithHashCodeExist:
    active: true            # 重写 equals() 时必须同时重写 hashCode()
  HasPlatformType:
    active: true            # 检测使用了平台类型（Java 与 Kotlin 混编时的隐患）

# ------------------------------------------------------------
# 代码风格：提升代码可读性的格式规范
# ------------------------------------------------------------
style:
  MagicNumber:
    active: true            # 检测代码中直接出现的"魔法数字"（应该定义成常量）
    ignoreNumbers: ['-1', '0', '1', '2']  # 这些数字不检查（常见边界值、初始值）
    ignorePropertyDeclaration: true       # 属性声明中的数字不检查（如 val max = 100）
  MaxLineLength:
    active: true
    maxLineLength: 120                   # 单行最大字符数，超过换行
    excludePackageStatements: true       # 忽略 package 声明行
    excludeImportStatements: true        # 忽略 import 导入行

# ------------------------------------------------------------
# 异常处理规则：防止异常被错误处理导致问题难以排查
# ------------------------------------------------------------
exceptions:
  TooGenericExceptionCaught:
    active: true            # 禁止 catch 过于宽泛的 Exception（应捕获具体异常类型）
  SwallowedException:
    active: true            # 禁止 catch 块内什么都不做，把异常"吞掉"
  PrintStackTrace:
    active: true            # 禁止直接调用 e.printStackTrace()（应使用日志框架）

# ------------------------------------------------------------
# 注释要求：确保公开 API 有文档说明（团队可根据需要开启）
# ------------------------------------------------------------
comments:
  UndocumentedPublicClass:
    active: false           # 关闭：公开类必须写注释（较严格，建议初期关闭）
  UndocumentedPublicFunction:
    active: false           # 关闭：公开函数必须写注释（较严格，建议初期关闭）

```



## 5. Git pre-commit Hook(本地)

创建  `.git/hooks/pre-commit` 文件，用于 执行 `git commit` 之前自动进行代码检查或自动格式化
在 **git 官方模板上修改** ，官方默认模板 `pre-commit.sample` 文件在 `.git/hooks/` 下，修改文件 `pre-commit.sample` **去掉后缀名后启用此文件功能**，并**修改第五部分代码检查 **部分，其他部分配置采用默认配置，修改后配置文件及注释说明如下：

```shell
#!/bin/sh   

# 作用：在 git commit 执行后、提交记录生成前自动运行
# 位置：.git/hooks/pre-commit（无后缀名，需赋予可执行权限）
# 退出码：0 = 允许提交，非 0 = 阻止提交


# ------------------------------------------------------------
# 第一部分：确定比较的基准对象（与哪个版本进行差异比较）
# ------------------------------------------------------------
# 判断当前仓库是否已经有提交记录
# >/dev/null 2>&1 表示忽略所有输出（不打印到终端）
if git rev-parse --verify HEAD >/dev/null 2>&1
then
    # 如果有历史提交，则与当前 HEAD 指向的提交进行比较
    against=HEAD
else
    # 如果是首次提交（仓库还没有任何 commit）
    # 则与一个空的树对象进行比较
    # 4b825dc642cb6eb9a060e54bf8d69288fbee4904 是 Git 中空树的 SHA-1 哈希值
    against=$(git hash-object -t tree /dev/null)
fi

# ------------------------------------------------------------
# 第二部分：配置项
# ------------------------------------------------------------
# 如果想要使用非 ASCII 字符文件名，此变量设为True(不建议)
allownonascii=$(git config --type=bool hooks.allownonascii)

# 将标准输出重定向到标准错误输出（stderr）
# Git 约定：Hook 的所有输出都应该输出到 stderr
# 这样可以确保输出不会被 Git 内部处理流程干扰
exec 1>&2

# ------------------------------------------------------------
# 第三部分：检查非 ASCII 文件名
# ------------------------------------------------------------
# 跨平台项目通常应避免使用非 ASCII 字符（如中文、日文等）的文件名。
# 这里利用 ASCII 可打印字符范围（空格到波浪号）来检测是否有超出此范围的文件名。

if [ "$allownonascii" != "true" ] &&
    # 注意：这里在 tr 中使用方括号范围是安全的（甚至在 Solaris 10 上是必须的），
    # 因为方括号字节恰好落在指定的范围内。
    test $(git diff-index --cached --name-only --diff-filter=A -z $against |
      LC_ALL=C tr -d '[ -~]\0' | wc -c) != 0
then
    # 使用 Here Document（<<\EOF）打印多行错误信息
    cat <<\EOF
Error: Attempt to add a non-ASCII file name.

This can cause problems if you want to work with people on other platforms.

To be portable it is advisable to rename the file.

If you know what you are doing you can disable this check using:   
  git config hooks.allownonascii true   
EOF
    # 以非零状态码退出，阻止本次提交
    exit 1
fi

# ------------------------------------------------------------
# 第四部分：检查基础空白符错误
# ------------------------------------------------------------
# git diff-index --check 会检查以下问题：
#   - 行尾有多余的空格或制表符
#   - 文件末尾缺少换行符
#   - 存在未解决的合并冲突标记（<<<<<<<、=======、>>>>>>>）
#   - 空白行中包含空格
#
# exec 命令会直接执行后续命令，并将该命令的输出和退出码作为脚本的输出和退出码
# $against 是前面确定比较基准（HEAD 或空树）
# -- 表示后面的参数不是选项（防止文件名被误解为选项）
exec git diff-index --check --cached $against --

# ============================================================
# 第五部分 代码检查 提示：你可以在此处添加自定义的代码质量检查
# ============================================================

echo " 运行 Kotlin 代码质量检查..."
 
# 判断是否有 Kotlin 文件被修改（避免每次都运行 Gradle）
 if git diff --cached --name-only | grep -q "\.kt$\|\.kts$"; then

     # 运行 Gradle 检查任务
    # 1. 自动检查/格式化代码
    # ./gradlew  ktlintCheck --no-daemon # 只检查不格式化
    ./gradlew  ktlintFormat              # 检查并自动格式化

    # ./gradlew  detekt    # detekt 代码质量检查（暂不启用）

    # 2. 如果有文件被格式化，自动重新加入暂存区
    git add -u
     
     if [ $? -ne 0 ]; then
         echo " 代码质量检查失败，请在提交前修复问题。"
         echo " 提示：运行 './gradlew ktlintFormat' 可自动修复格式问题。"
         exit 1
     fi
 fi
 
echo "所有检查通过！"
# ============================================================

```



## 6. 整个 示例 CI 的流程

```markdown

          【阶段一：本地开发与拦截检查】（可自选配置）

1. 开发者编写代码，完成功能开发
                ↓
2. 开发者执行 git add . 将修改的文件添加到暂存区
                ↓
3. 开发者执行 git commit 
                ↓
4. 【Git pre-commit Hook 触发】执行 .git/hooks/pre-commit 脚本
                ↓
5. 代码检查或格式化通过
                ↓
6. 【提交成功】本地仓库生成新的 commit SHA

         【阶段二：推送到远程与 CI 触发】 
       
1. 开发者在本地执行: git push origin feature/login
                ↓
2. Gitea 服务器收到推送事件，存入数据库，更新分支引用
                ↓
3. Gitea 的 Actions 后台服务轮询到有新事件，触发 Webhook 处理
                ↓
4. 扫描仓库 .gitea/workflows/ 目录下的所有 .yaml 文件
                ↓
5. 发现 code-quality.yml 中的 on.push.branches 包含 'main', 'develop'，'feature/**'
                ↓
6. Gitea 为本次事件创建新的 Runner Job 实例
                ↓
7. 分配一个可用的 Actions Runner
                ↓
8. Runner 拉取仓库代码到临时工作目录（使用 actions/checkout@v4）
                ↓
9. Runner 解析 code-quality.yml 文件中的 jobs 定义
                ↓
10. 并行启动独立的 Job：detekt-analysis（若此job启用） 和 ktlint-check
                ↓
11. detekt-analysis Job 执行流程：
     11.1 actions/setup-java@v4 配置 JDK 17 环境
     11.2 chmod +x gradlew 赋予执行权限
     11.3 执行 ./gradlew detekt --no-daemon
     11.4 Gradle 下载依赖并运行 Detekt 静态分析
     11.5 读取 config/detekt/detekt.yml 中的规则配置
     11.6 扫描 src/main/kotlin/ 和 src/test/kotlin/ 下的所有 .kt 文件
     11.7 生成 HTML/XML/TXT 格式报告到 build/reports/detekt/
     11.8 如果有任何违规（maxIssues: 0），Gradle 任务失败，退出码非 0
     11.9 actions/upload-artifact@v4 保存报告为可下载的构件
                ↓
12. ktlint-check Job 执行流程：
     12.1 actions/setup-java@v4 配置 JDK 17 环境
     12.2 执行 ./gradlew ktlintCheck --no-daemon
     12.3 Gradle 读取 .editorconfig 中的基础格式配置
     12.4 Ktlint 检查代码格式（缩进、换行、空格等）
     12.5 生成 PLAIN/CHECKSTYLE/SARIF 格式报告
     12.6 如果发现格式问题，任务失败，退出码非 0
                ↓
13. quality-gate Job 执行流程（等待 detekt-analysis 和 ktlint-check 完成）：
     13.1 检查 needs 中定义的两个前置 Job 的执行结果状态
     13.2 如果任一 Job 状态不是 success，则 quality-gate 失败
     13.3 输出失败原因，提示开发者运行 ./gradlew ktlintFormat
     13.4 如果都成功，输出 " All quality checks passed!"
                ↓
14. Gitea 收集所有 Job 的执行日志和状态
                ↓
15. 在 PR 页面（或提交页面）显示 CI 检查状态：
     - 绿色 ：所有检查通过
     - 红色 ：某个 Job 失败
                ↓
16. 开发者查看失败详情：
     16.1 点击 Gitea Actions 标签页查看完整日志
     16.2 下载 Detekt HTML 报告查看具体违规位置
     16.3 根据提示在本地运行 ./gradlew ktlintFormat 自动修复格式
                ↓
17. 开发者修复问题后重新 push（git commit --amend && git push --force-with-lease）
                ↓
18. Gitea 再次触发整个流程（回到步骤 1）
                ↓
19. 所有检查通过后，quality-gate 成功
                ↓
20. 如果仓库配置了分支保护规则（要求 CI 通过才能合并），PR 的合并按钮变为可用
                ↓
21. 代码审查者可以安全合并代码到 main 分支

```










<!-- research-notes: enhanced-v1 -->

## 研究笔记增强

> Last reviewed: 2026-06-17。此节用于把《服务器端部署配置》从阅读笔记推进到可复习、可实践、可验证的研究笔记；具体版本、参数和环境仍需结合官方资料、项目约束和实测结果校准。

### 知识定位

按概念理解、最小实践、故障排查、复盘沉淀的路径学习，既记录是什么，也记录什么时候用、什么时候不用和失败后如何定位。

### 重点补充
- 明确该技术解决的问题、输入输出、边界条件和依赖环境。
- 把核心概念落到一个最小可运行示例。
- 记录版本、配置、命令、日志和错误信息，保证以后可以复现。
- 明确适用场景、限制条件、替代方案和迁移成本。

### 实践清单
- 为本章整理一张概念关系图、流程图或最小系统图。
- 写一个最小可运行示例，并保留运行命令、输入、输出和环境版本。
- 列出常见错误、排查命令、关键日志和修复动作。
- 补充安全、性能、兼容性、可维护性和上线运维注意事项。
- 用一次真实问题或练习项目复盘验证笔记是否可用。

### 常见误区
- 只摘抄定义或命令，没有记录上下文、前提条件和边界。
- 只记录成功路径，不记录失败样本、异常现象和排查过程。
- 没有版本、环境和数据样本，导致后续无法复现。
- 把教程默认值直接用于真实项目，没有结合约束重新评估。

### 复盘问题
- 学完《服务器端部署配置》后，能否用自己的话说明它解决什么问题、不解决什么问题？
- 如果要在真实项目中使用，需要哪些前置条件、依赖版本、输入数据和验证手段？
- 失败时最先检查哪三类证据：日志、指标、抓包、堆栈、配置、样本还是硬件测量？
- 有没有形成可重复的最小实验、测试用例或排查命令？

### 延伸方向
- 官方文档和版本变更记录。
- 同类技术、框架或方案对比。
- 面向真实项目的最小实践。
- 故障排查清单和复盘案例库。

### 复盘记录模板

```text
主题：服务器端部署配置
日期：
目标：本次要验证或掌握的具体问题
环境：系统 / 语言 / 框架 / 工具 / 设备 / 版本
步骤：最小可复现流程
现象：成功输出、失败输出、日志、指标或测量数据
分析：为什么会出现该现象，和哪些概念相关
结论：可复用的规则、命令、配置或设计取舍
风险：边界条件、性能、安全、兼容性或维护成本
下一步：继续实验、补充资料或应用到项目
```
