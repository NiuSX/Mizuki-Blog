# 1. gitea 服务器端配置

gitea 仓库本身支持软件包/云仓库的发布。只需在配置文件中开启相关功能即可
https://docs.gitea.com/zh-cn/administration/config-cheat-sheet#%E5%8C%85packages
1.在服务器上找到部署的 Gitea仓库的 配置文件 `custom/conf/app.ini`
2.开启配置文件里的包注册功能(其他配置根据需要选择性配置)

`ENABLED：true: 启用/禁用包注册表功能。`

3. 服务器端配置完成。

![](./imgs/包配置.png)

# 2. 软件包注册发布

https://docs.gitea.com/zh-cn/usage/packages/maven

前提：在gitea上注册账户，并生成专属令牌，并给令牌授予包的读写权限

![](./imgs/令牌配置.png)

1. 编写代码完成
2. 编译生成jar文件
3. 配置 build.gradle.kts 文件，如下

```kotlin

plugins {
    `maven-publish` #Maven 包发布插件
}

publishing {
    publications {
        create<MavenPublication>("mavenJava") {   
            from(components["java"])  # 发布的包类型
        }
    }
    repositories {
        maven {
            name = "Gitea"   
		# Gitea地址 
            url = uri("http://192.168.1.203:3000/api/packages/NiuShaoXiong/maven")  
         # Gradle 默认 HTTPS 协议，但服务器的 Gitea 部署为 http 明文传输，需要显示配置允许使用 HTTP 传输
            isAllowInsecureProtocol = true   
			# 权限验证
            credentials {
                username = "token"      #固定位 Token 字段
                password = "{你的token}" # 生成的专属Token
            }
        }
    }
}

```



4、配置完成后使用 gradle 指令进行发布

` ./gradlew publishAllPublicationsToGiteaRepository`

或直接在 IDE 中进行可视化发布：

![](./imgs/IDE_Gradle发布.png)

5. 发布成功后可在浏览器 gitea 的账户下看到发布的软件包

# 3. 仓库使用
团队其他人引入或使用发布的仓库时：

```kotlin
repositories {
       // other repositories
       maven { url=uri("http://192.168.1.203:3000/api/packages/NiuShaoXiong/maven") 
       isAllowInsecureProtocol = true    # 同样需要指定运行明文传输
       }
}```


```

<!-- research-notes: enhanced-v1 -->

## 研究笔记增强

> Last reviewed: 2026-06-17。此节用于把《1. gitea 服务器端配置》从阅读笔记推进到可复习、可实践、可验证的研究笔记；具体版本、参数和环境仍需结合官方资料、项目约束和实测结果校准。

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
- 学完《1. gitea 服务器端配置》后，能否用自己的话说明它解决什么问题、不解决什么问题？
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
主题：1. gitea 服务器端配置
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
