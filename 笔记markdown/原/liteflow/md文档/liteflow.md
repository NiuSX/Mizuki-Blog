---
---

# 简介

[LiteFlow](https://liteflow.cc/)是一个非常强大的现代化的规则引擎框架，融合了编排特性和规则引擎的所有特性

它是一个编排式的规则引擎框架，组件编排，帮助解耦业务代码，让每一个业务片段都是一个组件。
组件可实时热更替，也可以给编排好的逻辑流里实时增加一个组件，从而改变你的业务逻辑

利用LiteFlow，你可以将瀑布流式的代码，转变成以组件为核心概念的代码结构，
这种结构的好处是可以任意编排，组件与组件之间是解耦的，组件可以用脚本来定义，组件之间的流转全靠规则来驱动

liteflow 支持的**脚本组件**：
- Groovy
- JavaScript
- QLExpress
- Python
- Lua
- Aviator
- Java
- Kotlin


LiteFlow支持把编排规则和脚本放在数据库，注册中心中，还有可以任意扩展的接口：
- DB
- Zokeeper
- Etcd
- Nacos
- Apollo
- Redis
- 自定义扩展

LiteFlow的设计原则为**工作台模式**

**适用场景**：
LiteFlow适用于拥有复杂逻辑的业务，比如说价格引擎，下单流程等，这些业务往往都拥有很多步骤，
这些步骤完全可以按照业务粒度拆分成一个个独立的组件，进行装配复用变更。
使用LiteFlow，会得到一个灵活度高，扩展性很强的系统。
因为组件之间相互独立，也可以避免改一处而动全身的这样的风险

**项目特性**
- 组件定义统一： 所有的逻辑都是组件，为所有的逻辑提供统一化的组件实现方式，小身材，大能量。
- 规则轻量： 基于规则文件来编排流程，学习规则入门只需要5分钟，一看即懂。
- 规则多样化： 规则支持xml、json、yml三种规则文件写法方式，喜欢哪种用哪个。
- 任意编排： 再复杂的逻辑过程，利用LiteFlow的规则，都是很容易做到的，看规则文件就能知道逻辑是如何运转的。
- 规则持久化： 框架原生支持把规则存储在标准结构化数据库，Nacos，Etcd，Zookeeper，Apollo，Redis。您也可以自己扩展，把规则存储在任何地方。
- 优雅热刷新机制： 规则变化，无需重启您的应用，即时改变应用的规则。高并发下不会因为刷新规则导致正在执行的规则有任何错乱。
- 支持广泛： 不管你的项目是不是基于Springboot，Spring还是任何其他java框架构建，LiteFlow都能游刃有余。
- JDK支持： 从JDK8到JDK25，统统支持。无需担心JDK版本。JDK21以上支持虚拟线程。
- Springboot支持全面： 支持Springboot 2.X到最新的Springboot 3.X。
- 脚本语言支持： 可以定义脚本语言节点，支持Groovy，Java，Kotlin，Javascript，QLExpress，Python，Lua，Aviator。未来还会支持更多的脚本语言。
- 脚本和Java全打通： 所有脚本语言均可调用Java方法，甚至于可以引用任意的实例，在脚本中调用RPC也是支持的。
- 规则嵌套支持： 只要你想的出，你可以利用简单的表达式完成多重嵌套的复杂逻辑编排。
- 组件重试支持： 组件可以支持重试，每个组件均可自定义重试配置和指定异常。
- 上下文隔离机制： 可靠的上下文隔离机制，你无需担心高并发情况下的数据串流。
- 声明式组件支持： 你可以让你的任意类秒变组件。
- 详细的步骤信息： 你的链路如何执行的，每个组件耗时多少，报了什么错，一目了然。
- 稳定可靠： 历时2年多的迭代，在各大公司的核心系统上稳定运行。
- 性能卓越： 框架本身几乎不消耗额外性能，性能取决你的组件执行效率。
- 自带简单监控： 框架内自带一个命令行的监控，能够知道每个组件的运行耗时排行。

**非Spring体系中**以下功能特性不生效： 
- ruleSource的模糊路径匹配特性在非Spring体系下不生效
- LiteflowComponent在非Spring体系下无法使用
- 监控功能在非Spring体系中无法使用

>注意：以下的示例都是在非Spring体系的示例教程

# 配置

Liteflow的配置项有默认值，大多数情况下不需要必须配置
```kotlin
LiteflowConfig config = new LiteflowConfig();
//规则文件路径
config.setRuleSource("config/flow.xml");
//-----------------以下非必须-----------------
//liteflow是否开启，默认为true
config.setEnable(true);
//liteflow的banner打印是否开启，默认为true
config.setPrintBanner(true);
//上下文的初始数量槽，默认值为1024，这个值不用刻意配置，这个值会自动扩容
config.setSlotSize(1024);
//FlowExecutor的execute2Future的线程数，默认为64
config.setMainExecutorWorks(64);
//FlowExecutor的execute2Future的自定义线程池Builder，LiteFlow提供了默认的Builder
config.setMainExecutorClass("com.yomahub.liteflow.thread.LiteFlowDefaultMainExecutorBuilder");
//自定义请求ID的生成类，LiteFlow提供了默认的生成类
config.setRequestIdGeneratorClass("com.yomahub.liteflow.flow.id.DefaultRequestIdGenerator");
//全局异步节点线程池大小，默认为64
config.setGlobalThreadPoolSize(64);
//全局异步节点线程池队列大小，默认为512
config.setGlobalThreadPoolQueueSize(512);
//全局异步节点线程池自定义Builder，LiteFlow提供了默认的线程池Builder
config.setGlobalThreadPoolExecutorClass("com.yomahub.liteflow.thread.LiteFlowDefaultGlobalExecutorBuilder");
//异步线程最长的等待时间(只用于when)，默认值为15000
config.setWhenMaxWaitTime(15000);
//异步线程最长的等待时间(只用于when)，默认值为MILLISECONDS，毫秒
config.setWhenMaxWaitTimeUnit(TimeUnit.MILLISECONDS);
//每个WHEN是否用单独的线程池
config.setWhenThreadPoolIsolate(false);
//设置解析模式，一共有三种模式，PARSE_ALL_ON_START | PARSE_ALL_ON_FIRST_EXEC | PARSE_ONE_ON_FIRST_EXEC
config.setParseMode(ParseModeEnum.PARSE_ALL_ON_START);
//全局重试次数，默认为0
config.setRetryCount(0);
//是否支持不同类型的加载方式混用，默认为false
config.setSupportMultipleType(false);
//全局默认节点执行器
config.setNodeExecutorClass("com.yomahub.liteflow.flow.executor.DefaultNodeExecutor");
//是否打印执行中过程中的日志，默认为true
config.setPrintExecutionLog(true);
//是否开启本地文件监听，默认为false
config.setEnableMonitorFile(false);
//是否开启快速解析模式，默认为false
config.setFastLoad(false);
//是否开启Node节点实例ID持久化，默认为false
config.setEnableNodeInstanceId(false);
//是否开启虚拟线程(只在JDK21+环境有效)，默认为true
config.setEnableVirtualThread(true);
//简易监控配置选项
//监控是否开启，默认不开启
config.setEnableLog(false);
//监控队列存储大小，默认值为200
config.setQueueLimit(200);
//监控一开始延迟多少执行，默认值为300000毫秒，也就是5分钟
config.setDelay(300000L);
//监控日志打印每过多少时间执行一次，默认值为300000毫秒，也就是5分钟
config.setPeriod(300000L);

```

> 只要使用了规则，那么rule-source必须得有。 
> 但是如果你是用代码动态构造规则，那么rule-source配置自动失效。因为代码构造是用代码来装配规则，不需要规则文件

# 组件
## 继承式组件































| `THEN`    | 串行执行 | `THEN(a, b, c)`                       |
| --------- | -------- | ------------------------------------- |
| `WHEN`    | 并行执行 | `WHEN(a, b, c)`                       |
| `IF`      | 条件判断 | `IF(condition, trueNode, falseNode)`  |
| `ELIF`    | 否则如果 | `IF(a, b).ELIF(c, d).ELSE(e)`         |
| `ELSE`    | 否则     | `IF(a, b).ELSE(c)`                    |
| `SWITCH`  | 选择分支 | `SWITCH(switchNode).to(b, c, d)`      |
| `FOR`     | 循环     | `FOR(a).DO(THEN(b, c))`               |
| `WHILE`   | 条件循环 | `WHILE(conditionNode).DO(THEN(b, c))` |
| `BREAK`   | 跳出循环 | `WHILE(a).DO(b).BREAK(c)`             |
| `CATCH`   | 异常捕获 | `CATCH(THEN(a, b)).DO(c)`             |
| `FINALLY` | 最终执行 | `THEN(a, b).FINALLY(c)`               |


<!-- research-notes: enhanced-v1 -->

## 研究笔记增强

> Last reviewed: 2026-06-17。此节用于把《简介》从阅读笔记推进到可复习、可实践、可验证的研究笔记；具体版本、参数和环境仍需结合官方资料、项目约束和实测结果校准。

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
- 学完《简介》后，能否用自己的话说明它解决什么问题、不解决什么问题？
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
主题：简介
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
