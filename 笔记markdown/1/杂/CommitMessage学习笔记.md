---
title: "Commit Message学习笔记"
date: 2026-07-16
categories:
  - 工具
  - Git
excerpt: "一份完整的 Commit Message 学习笔记，覆盖写法规范、Conventional Commits、常见类型、示例和团队落地方式。"
---

# Commit Message 学习笔记

Commit message 不是“随便写一句说明”。它是代码历史、协作记录、回溯依据，也是后续自动化发布、变更日志、代码审查的重要输入。

好的 commit message 要做到：

1. 让别人快速知道这次提交做了什么。
2. 让自己几周后还能看懂。
3. 让团队可以批量检索、回溯和自动化处理。

---

## 1. Commit Message 是什么

每次 `git commit`，都会生成一条提交记录。提交记录通常包含：

- 提交哈希
- 作者
- 时间
- 父提交
- 提交信息
- 变更内容

其中 commit message 是对这次变更的文字说明。

它通常分为三部分：

- subject：标题
- body：正文
- footer：尾注

并不是每次都必须写完整，但越重要的提交越应该写完整。

---

## 2. 为什么要认真写

### 2.1 方便协作

团队成员通过提交信息判断：

- 这次改动是什么
- 影响范围多大
- 是否需要回滚
- 是否属于 bugfix、feature 或重构

### 2.2 方便追溯

当出现问题时，提交信息能帮助定位：

- 哪次提交引入了 bug
- 哪次提交修复了 bug
- 哪次提交引入了 breaking change

### 2.3 方便生成变更日志

如果团队使用规范化提交，可以自动生成：

- changelog
- release notes
- 版本号更新说明

### 2.4 方便审查历史

未来回看仓库历史时，commit message 往往比代码 diff 更快帮助理解上下文。

---

## 3. 一个好的 Commit Message 长什么样

一个好的提交信息通常满足这些特征：

- 简短
- 明确
- 动词开头
- 只描述一件事
- 能回答“这次提交做了什么”

例如：

```text
fix: handle null response in login flow
```

比下面这种更好：

```text
update code
```

因为前者明确、可检索、可分类。

---

## 4. 基本结构

### 4.1 标题

标题是最重要的部分。一般建议：

- 不超过 50 字符左右
- 第一行直接说重点
- 使用祈使句
- 不要以句号结尾

英文常见风格：

```text
fix: prevent crash on empty list
```

中文也可以遵循同样原则：

```text
修复：空列表时崩溃
```

### 4.2 正文

正文用于解释：

- 为什么要改
- 改了什么
- 有什么影响
- 有哪些取舍

建议每行控制在 72 字符左右，方便终端阅读。

### 4.3 尾注

尾注一般用于：

- 关联 issue
- 标记 breaking change
- 说明关闭任务

例如：

```text
Closes #123
```

---

## 5. 常见写法风格

### 5.1 朴素风格

直接用自然语言描述。

```text
修复登录页空指针问题
```

优点：

- 简单直观

缺点：

- 难自动化分类
- 团队风格不统一时容易混乱

### 5.2 Conventional Commits

这是现在最常见的规范化提交风格之一。

格式：

```text
<type>[optional scope]: <description>
```

例子：

```text
feat(auth): add email login
fix(api): handle 500 response
refactor(ui): extract button style
```

优点：

- 结构统一
- 易于搜索和统计
- 便于自动生成 changelog

---

## 6. Conventional Commits 详解

### 6.1 type

常见类型：

- `feat`：新功能
- `fix`：修复 bug
- `docs`：文档修改
- `style`：格式修改，不影响逻辑
- `refactor`：重构，不新增功能也不修 bug
- `test`：测试相关
- `build`：构建系统、依赖修改
- `ci`：CI 配置修改
- `perf`：性能优化
- `chore`：杂项维护
- `revert`：回滚提交

### 6.2 scope

scope 是可选的，用来说明影响范围。

例子：

```text
feat(login): support OAuth login
fix(cart): correct item count
```

它的作用是让人一眼知道改动属于哪个模块。

### 6.3 description

描述部分建议：

- 使用祈使句
- 简短明确
- 只描述当前这次提交
- 不写“fixed bug”，而写“fix null pointer in parser”

---

## 7. 正文怎么写

正文不是必需，但在这些场景里很有价值：

- 改动复杂
- 涉及架构调整
- 有兼容性影响
- 有额外原因需要解释
- 需要说明为什么不采用另一个方案

### 一个好的正文通常包含

- 背景
- 方案
- 影响
- 风险

### 示例

```text
feat(auth): support email verification

Add verification code flow for new email signups.
This change touches the login page, API client, and backend token handling.

Users now need to verify email before completing registration.
```

---

## 8. 尾注怎么写

### 8.1 关联 issue

```text
Closes #42
Fixes #42
Refs #42
```

### 8.2 Breaking change

如果提交会破坏旧接口，需要显式标记。

```text
feat(api): rename userId field

BREAKING CHANGE: userId is now renamed to uid in the response payload.
```

### 8.3 多个尾注

```text
Closes #42
Refs #17
Reviewed-by: Alice
```

---

## 9. 写 commit message 的原则

### 9.1 一次提交只做一件事

不要把多个无关改动塞进一个提交。

差的例子：

```text
fix stuff
```

好的例子：

```text
fix(login): validate empty password
```

### 9.2 先说结果，再说过程

commit message 不要写成开发日志。

差的例子：

```text
今天把接口调了一下，然后顺便改了几个地方
```

好的例子：

```text
refactor(api): simplify request handling
```

### 9.3 用具体词，不用空话

避免这些词：

- stuff
- update
- fix some bug
- modify code
- misc

尽量写清楚：

- 哪个模块
- 什么问题
- 什么结果

### 9.4 动词开头

推荐：

- add
- fix
- remove
- update
- simplify
- refactor
- document

### 9.5 标题不要太长

标题过长会降低可读性。必要时把解释放到正文。

---

## 10. 常见类型说明

### feat

新增功能。

```text
feat(profile): add avatar upload
```

### fix

修复缺陷。

```text
fix(api): handle timeout retry
```

### docs

只改文档。

```text
docs(readme): update setup instructions
```

### refactor

代码重构，行为尽量不变。

```text
refactor(cache): extract cache manager
```

### perf

性能优化。

```text
perf(renderer): reduce unnecessary re-renders
```

### test

测试相关。

```text
test(auth): add login flow tests
```

### chore

杂项维护，比如脚本、依赖、配置。

```text
chore(deps): bump jest to 30
```

---

## 11. 常见错误

### 11.1 标题太空

```text
update
```

问题：无法知道改了什么。

### 11.2 一个提交塞太多内容

```text
fix login and update docs and refactor api
```

问题：历史不可读，回滚不方便。

### 11.3 只写结果，不写原因

```text
fix login
```

问题：不知道为什么修复，后续难维护。

### 11.4 把提交信息写成流水账

```text
改了一点这里，改了一点那里，感觉差不多了
```

问题：毫无检索价值。

### 11.5 大写风格混乱

团队需要统一大小写、标点和语言风格。

---

## 12. 中文还是英文

两者都可以，但团队最好统一。

### 中文适合

- 中文团队
- 中文项目
- 内部协作

例如：

```text
修复：用户首次登录时头像未刷新
```

### 英文适合

- 开源项目
- 国际协作
- 需要接入英文自动化工具链

例如：

```text
fix(profile): refresh avatar after first login
```

### 建议

如果团队没有强制要求，优先选一种语言统一到底。

---

## 13. 提交粒度怎么控制

### 13.1 粒度太大

大提交的问题：

- 难审查
- 难回滚
- 难定位问题

### 13.2 粒度太碎

过碎提交的问题：

- 历史噪声大
- 需要合并理解

### 13.3 合理粒度

一般以“一个可说明的变更单元”为宜。

例如：

- 一个修复
- 一个功能
- 一次重构
- 一次文档更新

---

## 14. 团队规范建议

可以在团队里明确这些规则：

1. 必须使用统一格式。
2. 必须写清 type。
3. 复杂提交必须写 body。
4. breaking change 必须写 footer。
5. 禁止 `update`、`fix stuff` 这类模糊描述。
6. 提交前先自查是否能独立说明修改目的。

如果团队想进一步规范，可以直接采用 Conventional Commits。

---

## 15. 一个推荐模板

```text
type(scope): short summary

Why:
<why this change is needed>

What:
<what changed>

Impact:
<compatibility, risk, behavior change>

Refs:
Closes #123
```

示例：

```text
feat(auth): add email verification flow

Why:
Prevent invalid registrations and reduce fake accounts.

What:
Add verification code sending, verification page, and API validation.

Impact:
Users must verify email before completing registration.

Refs:
Closes #123
```

---

## 16. 实战示例

### 功能新增

```text
feat(search): add fuzzy search for article titles
```

### 修复 bug

```text
fix(upload): handle empty file selection
```

### 文档更新

```text
docs(vim): add common command cheatsheet
```

### 重构

```text
refactor(api): extract request serializer
```

### 性能优化

```text
perf(cache): reduce redundant disk reads
```

### 回滚

```text
revert: remove unstable login change
```

---

## 17. 和代码审查的关系

好的 commit message 能帮助 code review。

审查者通常会先看：

- 提交标题是否对得上 diff
- 有没有说明背景
- 是否有 breaking change
- 是否和 issue 对应

如果 commit message 写得差，审查成本会明显上升。

---

## 18. 和 Git 历史命令的关系

常用配套命令：

- `git log`：查看历史
- `git log --oneline`：简洁查看历史
- `git show <commit>`：查看某次提交详情
- `git blame`：查看每一行是谁改的
- `git revert`：生成反向提交

commit message 写得好，这些命令的价值会高很多。

---

## 19. 建议的养成方式

### 日常检查

每次提交前问自己：

- 这次提交只做了一件事吗
- 标题能否一眼看懂
- 是否需要正文
- 是否涉及 breaking change
- 是否能被搜索到

### 长期习惯

- 先写提交信息，再提交
- 提交前自己读一遍
- 避免“随手一条”的历史噪声

---

## 20. 速查表

### 推荐格式

```text
type(scope): description
```

### 常用 type

- `feat`
- `fix`
- `docs`
- `refactor`
- `test`
- `perf`
- `chore`
- `ci`

### 好标题特征

- 短
- 明确
- 动词开头
- 只说一件事

### 避免

- `update`
- `fix stuff`
- `misc`
- 过长
- 一个提交包含多个无关改动

---

## 21. 最后建议

commit message 的目标不是“看起来专业”，而是“在未来真的有用”。

最实用的标准只有一句：

> 让未来的自己和队友，不看代码也能大致知道这次提交做了什么。

