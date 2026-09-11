# uv 包管理工具完整学习笔记

<!-- lecture-notes:integrated-v2 -->

## 讲义导读：把概念落到可验证实践

这一章讲的是 **uv 包管理工具完整学习笔记**，属于 **构建系统与包管理**。阅读时不要把它当成零散资料堆叠，而要把它当成一份讲义：先弄清它解决什么问题，再看核心概念和流程，最后做一个能复现、能观察、能排错的小练习。

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


> 适合对象：Python 初学者、后端开发者、数据分析/AI 开发者、需要替代 pip / pip-tools / virtualenv / pyenv / pipx / poetry 部分能力的人，以及想统一 Python 项目依赖、虚拟环境、脚本、工具和 CI 构建流程的人。
uv 是 Astral 开发的现代 Python 包和项目管理工具，使用 Rust 编写，目标是用一个非常快的命令行工具覆盖 Python 开发中常见的环境和依赖管理场景。它可以管理 Python 版本、创建虚拟环境、安装包、锁定依赖、同步项目环境、运行脚本、安装命令行工具、构建包、发布包，还提供兼容 pip 的子命令。

如果你只会执行 `uv pip install requests`，还不算真正理解 uv。真正掌握 uv，需要理解：uv 项目模式和 pip 兼容模式有什么区别、`pyproject.toml` 和 `uv.lock` 分别管什么、`uv sync` 和 `uv run` 为什么会自动锁定和同步、依赖组和 extras 如何使用、`uv python` 如何管理解释器、`uv tool` 和 `uvx` 如何替代 pipx、脚本内联依赖如何工作、CI 中为什么要用 `--locked` 或 `--frozen`，以及如何配置私有源、缓存、发布、工作区和依赖审计。

版本说明：截至 2026-06-07，uv 官方文档仍在快速更新，GitHub Releases 页面显示 uv 0.11.x 系列为当前活跃版本线，搜索结果显示 0.11.16 为 2026-05-21 的 Latest Release。uv 的命令和配置演进较快，实际使用时应以官方文档和 `uv --help` 为准。

## 目录

1. uv 是什么
2. uv 解决什么问题
3. uv 和 pip、venv、pipx、poetry、conda 的区别
4. 安装 uv
5. 升级、卸载与环境检查
6. uv 的核心使用模式
7. 项目模式入门
8. pyproject.toml
9. uv.lock
10. 虚拟环境 .venv
11. uv run
12. uv add / remove
13. uv sync
14. uv lock
15. uv tree / export
16. 依赖组 dependency-groups
17. extras 可选依赖
18. 开发依赖、测试依赖与生产依赖
19. Python 版本管理
20. pip 兼容模式
21. uv venv
22. uv pip install / uninstall / list / freeze
23. requirements.txt 迁移
24. 脚本模式与 PEP 723
25. uv tool 与 uvx
26. 工作区 workspace
27. 依赖来源：PyPI、私有源、Git、路径、本地包
28. 配置文件与环境变量
29. 缓存管理
30. 构建 Python 包
31. 发布 Python 包
32. 依赖审计 uv audit
33. 格式化 uv format
34. Docker 中使用 uv
35. CI/CD 中使用 uv
36. 常见工作流
37. 常见错误排查
38. uv 最佳实践
39. 学习路线
40. 命令速查
41. 官方参考资料

## 1. uv 是什么

uv 是一个极快的 Python 包和项目管理工具。

它可以做：

- 安装和卸载 Python 包
- 创建和管理虚拟环境
- 管理 Python 解释器版本
- 初始化 Python 项目
- 添加、删除、锁定项目依赖
- 同步项目环境
- 运行项目命令和脚本
- 管理命令行工具
- 构建 wheel / sdist
- 发布包到 PyPI 或私有仓库
- 导出 requirements.txt
- 查看依赖树
- 审计依赖安全问题

一句话理解：

```text
uv = 快速的 Python 包管理器 + 项目管理器 + 虚拟环境管理器 + Python 版本管理器 + pip 兼容工具 + pipx 替代品。
```

## 2. uv 解决什么问题

### 2.1 pip 太慢

传统 pip 安装依赖时，解析和下载速度在大项目中可能较慢。

uv 使用 Rust 编写，并行解析、下载、缓存，安装速度通常明显更快。

### 2.2 Python 工具链分散

传统 Python 项目常用一堆工具：

| 工具 | 作用 |
| :--- | :--- |
| pyenv | 管理 Python 版本 |
| venv / virtualenv | 创建虚拟环境 |
| pip | 安装包 |
| pip-tools | 编译 requirements 锁文件 |
| pipx | 安装命令行工具 |
| poetry / pdm | 项目依赖管理 |
| build | 构建包 |
| twine | 发布包 |

uv 试图统一其中大量场景。

### 2.3 依赖环境不可复现

只写：

```text
requests
fastapi
```

不能保证每个人安装到完全相同版本。

uv 使用：

```text
pyproject.toml
uv.lock
```

让项目依赖可锁定、可同步、可复现。

### 2.4 新人上手成本高

传统流程：

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

uv 项目中常见流程：

```bash
uv run python main.py
```

uv 会自动处理项目环境同步。

## 3. uv 和 pip、venv、pipx、poetry、conda 的区别

### 3.1 uv vs pip

| 对比 | pip | uv |
| :--- | :--- | :--- |
| 包安装 | 支持 | 支持 |
| 速度 | 普通 | 通常更快 |
| 锁文件 | 不内置 | `uv.lock` |
| 项目管理 | 弱 | 强 |
| Python 版本管理 | 不支持 | 支持 |
| 工具安装 | 不专门支持 | `uv tool` |

### 3.2 uv vs venv

`venv` 只创建虚拟环境。

uv 可以：

- 创建虚拟环境
- 安装依赖
- 同步项目依赖
- 运行命令
- 管理解释器

### 3.3 uv vs pipx

pipx 用于安装 Python 命令行工具。

uv 对应能力：

```bash
uv tool install ruff
uvx ruff --version
```

### 3.4 uv vs poetry

| 对比 | Poetry | uv |
| :--- | :--- | :--- |
| 项目依赖管理 | 支持 | 支持 |
| 锁文件 | `poetry.lock` | `uv.lock` |
| 包构建发布 | 支持 | 支持 |
| 速度 | 普通 | 通常更快 |
| pip 兼容接口 | 不主打 | `uv pip` |
| Python 版本管理 | 不主打 | 支持 |

### 3.5 uv vs conda

conda 管理的不只是 Python 包，还包括 C/C++ 库、系统级二进制依赖和非 Python 包。

uv 主要面向：

```text
Python 解释器 + Python 包 + Python 项目
```

如果项目依赖复杂的原生科学计算库，conda 仍有价值。

## 4. 安装 uv

### 4.1 Windows PowerShell

官方独立安装器：

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

安装后重新打开终端，检查：

```powershell
uv --version
```

### 4.2 macOS / Linux

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

如果没有 curl：

```bash
wget -qO- https://astral.sh/uv/install.sh | sh
```

### 4.3 Homebrew

```bash
brew install uv
```

### 4.4 pip 安装

```bash
pip install uv
```

可以用，但更推荐官方独立安装器或系统包管理器，因为 uv 本身是独立工具。

### 4.5 GitHub Actions

常用：

```yaml
- uses: astral-sh/setup-uv@v5
```

实际版本请以 setup-uv 官方仓库为准。

## 5. 升级、卸载与环境检查

### 5.1 查看版本

```bash
uv --version
```

### 5.2 查看帮助

```bash
uv --help
uv run --help
uv add --help
uv sync --help
uv python --help
uv tool --help
```

### 5.3 自更新

如果使用官方独立安装器安装，通常可以：

```bash
uv self update
```

如果使用包管理器安装，应使用对应包管理器升级。

例如 Homebrew：

```bash
brew upgrade uv
```

### 5.4 常见安装位置

Windows 常见：

```text
C:\Users\<用户名>\.local\bin
```

macOS / Linux 常见：

```text
~/.local/bin
```

如果提示找不到 `uv`，通常是 PATH 没配置。

## 6. uv 的核心使用模式

uv 有几条主线：

| 模式 | 命令 | 用途 |
| :--- | :--- | :--- |
| 项目管理 | `uv init/add/sync/run/lock` | 管理 Python 项目 |
| pip 兼容 | `uv pip ...` | 替代 pip/pip-tools 部分能力 |
| Python 管理 | `uv python ...` | 安装和选择 Python 解释器 |
| 工具管理 | `uv tool ...` / `uvx` | 安装和运行命令行工具 |
| 脚本运行 | `uv run script.py` | 运行带依赖声明的脚本 |
| 构建发布 | `uv build/publish` | 打包和发布 Python 包 |

初学最推荐先掌握项目模式：

```bash
uv init
uv add requests
uv run python main.py
uv sync
```

## 7. 项目模式入门

### 7.1 创建新项目

```bash
uv init my-app
cd my-app
```

会生成类似：

```text
my-app/
├── .python-version
├── README.md
├── main.py
└── pyproject.toml
```

不同 uv 版本和参数生成的文件可能略有不同。

### 7.2 在当前目录初始化

```bash
uv init
```

### 7.3 创建库项目

```bash
uv init --package my-lib
```

包项目更适合发布到 PyPI。

### 7.4 创建应用项目

```bash
uv init --app my-app
```

应用项目更适合内部运行，不一定发布。

### 7.5 创建脚本项目

```bash
uv init --script hello.py
```

用于单文件脚本场景。

### 7.6 运行项目

```bash
uv run python main.py
```

第一次运行时，uv 会自动：

- 创建 `.venv`
- 解析依赖
- 生成或更新 `uv.lock`
- 安装依赖
- 在项目环境中运行命令

## 8. pyproject.toml

### 8.1 pyproject.toml 是什么

`pyproject.toml` 是现代 Python 项目的标准配置文件。

它可以描述：

- 项目名称
- 版本
- Python 版本要求
- 运行依赖
- 可选依赖
- 依赖组
- 构建系统
- 工具配置

### 8.2 示例

```toml
[project]
name = "my-app"
version = "0.1.0"
description = "A demo app"
readme = "README.md"
requires-python = ">=3.12"
dependencies = [
    "requests>=2.32.0",
]

[dependency-groups]
dev = [
    "pytest>=8.0.0",
    "ruff>=0.8.0",
]
```

### 8.3 dependencies

```toml
[project]
dependencies = [
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.32.0",
]
```

这是项目运行时依赖。

### 8.4 requires-python

```toml
requires-python = ">=3.12"
```

uv 会根据它选择或安装兼容 Python。

### 8.5 dependency-groups

```toml
[dependency-groups]
dev = [
    "pytest",
    "ruff",
]
```

用于开发、测试、文档等非运行时依赖。

## 9. uv.lock

### 9.1 uv.lock 是什么

`uv.lock` 是 uv 的锁文件。

它记录：

- 完整依赖解析结果
- 直接依赖和传递依赖
- 精确版本
- 包来源
- hash 和元数据
- 不同 Python 版本、平台、extras 条件下的依赖信息

### 9.2 为什么需要锁文件

没有锁文件：

```text
今天安装和明天安装可能得到不同版本。
```

有锁文件：

```text
团队、CI、部署环境可以同步到一致依赖版本。
```

### 9.3 uv.lock 是否提交

应用项目：

```text
建议提交 uv.lock
```

库项目：

```text
通常也可以提交 uv.lock 用于开发环境复现，但发布包时消费者不会使用你的 uv.lock。
```

### 9.4 手动更新锁文件

```bash
uv lock
```

### 9.5 检查锁文件未过期

```bash
uv lock --check
```

或在运行时：

```bash
uv run --locked python main.py
```

`--locked` 表示：

```text
如果 pyproject.toml 和 uv.lock 不一致，则报错，不自动更新锁文件。
```

### 9.6 冻结锁文件

```bash
uv run --frozen python main.py
```

`--frozen` 表示：

```text
直接使用现有 uv.lock，不检查它是否过期。
```

CI 中通常更推荐 `--locked`，因为它能发现忘记提交锁文件的情况。

## 10. 虚拟环境 .venv

### 10.1 .venv 是什么

`.venv` 是项目本地虚拟环境。

uv 项目模式中默认使用：

```text
项目根目录/.venv
```

### 10.2 是否需要手动激活

很多 uv 工作流中不需要手动激活。

推荐：

```bash
uv run python main.py
uv run pytest
```

uv 会自动在项目环境中运行。

### 10.3 仍然可以激活

Windows PowerShell：

```powershell
.\.venv\Scripts\Activate.ps1
```

macOS / Linux：

```bash
source .venv/bin/activate
```

激活后也可以：

```bash
python main.py
```

但团队脚本和文档中更推荐 `uv run`，减少环境差异。

### 10.4 删除环境重建

```bash
rm -rf .venv
uv sync
```

Windows PowerShell：

```powershell
Remove-Item -Recurse -Force .venv
uv sync
```

## 11. uv run

### 11.1 基本用法

```bash
uv run python main.py
```

运行模块：

```bash
uv run python -m http.server
```

运行命令：

```bash
uv run pytest
uv run ruff check .
```

### 11.2 uv run 会自动同步

项目中执行：

```bash
uv run pytest
```

uv 会先确认：

- `uv.lock` 是否与 `pyproject.toml` 同步
- `.venv` 是否与 `uv.lock` 同步
- 缺失依赖是否需要安装

然后再执行命令。

### 11.3 禁止自动更新锁文件

```bash
uv run --locked pytest
```

### 11.4 不检查锁文件是否过期

```bash
uv run --frozen pytest
```

### 11.5 不同步环境

```bash
uv run --no-sync pytest
```

适合你明确知道环境已经同步，并想减少开销的场景。

### 11.6 临时依赖运行

```bash
uv run --with rich python -c "from rich import print; print('[green]hello[/green]')"
```

适合临时实验，不污染项目依赖。

## 12. uv add / remove

### 12.1 添加运行时依赖

```bash
uv add requests
uv add fastapi
uv add "uvicorn[standard]"
```

uv 会：

- 修改 `pyproject.toml`
- 更新 `uv.lock`
- 同步 `.venv`

### 12.2 添加版本约束

```bash
uv add "django>=5.1,<6"
```

### 12.3 添加开发依赖

```bash
uv add --dev pytest ruff
```

通常会写入 `dependency-groups.dev`。

### 12.4 添加到指定依赖组

```bash
uv add --group docs mkdocs mkdocs-material
uv add --group lint ruff mypy
```

### 12.5 添加 optional dependency / extra

```bash
uv add --optional postgres "psycopg[binary]"
```

会写入：

```toml
[project.optional-dependencies]
postgres = [
    "psycopg[binary]",
]
```

### 12.6 从 requirements.txt 添加

```bash
uv add -r requirements.txt
```

### 12.7 删除依赖

```bash
uv remove requests
```

删除开发依赖：

```bash
uv remove --dev pytest
```

删除指定组依赖：

```bash
uv remove --group docs mkdocs
```

## 13. uv sync

### 13.1 sync 是什么

`uv sync` 根据 `uv.lock` 同步项目虚拟环境。

```bash
uv sync
```

它会：

- 创建 `.venv`
- 安装锁文件中的依赖
- 移除多余依赖
- 保证环境和锁文件一致

### 13.2 克隆项目后的第一条命令

```bash
git clone <repo>
cd <repo>
uv sync
```

然后：

```bash
uv run pytest
```

### 13.3 精确同步和保留多余包

默认 `uv sync` 倾向精确同步，会删除不属于项目依赖的包。

如果想保留额外安装的包：

```bash
uv sync --inexact
```

### 13.4 同步 extras

```bash
uv sync --extra postgres
```

同步全部 extras：

```bash
uv sync --all-extras
```

### 13.5 不同步开发依赖

```bash
uv sync --no-dev
```

适合生产部署环境。

### 13.6 同步所有依赖组

```bash
uv sync --all-groups
```

### 13.7 同步指定组

```bash
uv sync --group docs
```

### 13.8 CI 中同步

```bash
uv sync --locked
```

如果锁文件过期，直接失败。

## 14. uv lock

### 14.1 生成或更新锁文件

```bash
uv lock
```

### 14.2 升级所有依赖

```bash
uv lock --upgrade
```

### 14.3 只升级某个包

```bash
uv lock --upgrade-package requests
```

也可以在 sync/run 时升级：

```bash
uv sync --upgrade-package requests
uv run --upgrade-package requests pytest
```

### 14.4 检查锁文件

```bash
uv lock --check
```

### 14.5 锁文件更新原则

通常：

- 修改 `pyproject.toml` 后运行 `uv lock` 或 `uv sync`。
- PR 中同时提交 `pyproject.toml` 和 `uv.lock`。
- CI 使用 `--locked` 防止漏提交锁文件。

## 15. uv tree / export

### 15.1 查看依赖树

```bash
uv tree
```

查看某个包为什么被引入：

```bash
uv tree --package requests
```

### 15.2 导出 requirements.txt

```bash
uv export --format requirements-txt > requirements.txt
```

不带 hash：

```bash
uv export --format requirements-txt --no-hashes > requirements.txt
```

### 15.3 为什么还需要 export

有些平台只支持 requirements.txt，例如：

- 老旧部署平台
- 某些 Serverless 平台
- 部分 Docker 模板
- 一些安全扫描工具

uv 项目内部仍以 `pyproject.toml` + `uv.lock` 为主。

## 16. 依赖组 dependency-groups

### 16.1 什么是依赖组

依赖组用于组织开发、测试、文档、类型检查等依赖。

```toml
[dependency-groups]
dev = [
    "pytest",
    "ruff",
]
docs = [
    "mkdocs",
    "mkdocs-material",
]
typecheck = [
    "mypy",
]
```

### 16.2 dev 组

`dev` 组有特殊地位，通常默认会被同步。

添加：

```bash
uv add --dev pytest ruff
```

### 16.3 指定组

```bash
uv add --group docs mkdocs
uv sync --group docs
```

### 16.4 不安装 dev 组

```bash
uv sync --no-dev
```

### 16.5 生产环境建议

生产环境通常：

```bash
uv sync --locked --no-dev
```

如果项目是部署应用，还要根据实际情况决定是否安装项目本身、是否需要 extras。

## 17. extras 可选依赖

### 17.1 extras 是什么

extras 是包给消费者选择的可选功能。

示例：

```toml
[project.optional-dependencies]
postgres = [
    "psycopg[binary]>=3.2.0",
]
redis = [
    "redis>=5.0.0",
]
```

用户安装：

```bash
uv add "my-package[postgres]"
```

### 17.2 同步 extra

```bash
uv sync --extra postgres
```

全部 extras：

```bash
uv sync --all-extras
```

### 17.3 extras 和 dependency groups 区别

| 类型 | 面向谁 | 是否发布给消费者 | 用途 |
| :--- | :--- | :--- | :--- |
| extras | 包的使用者 | 是 | 可选功能依赖 |
| dependency groups | 项目开发者 | 否 | 开发、测试、文档工具 |

### 17.4 示例判断

数据库插件：

```text
extra
```

测试框架：

```text
dependency group
```

文档工具：

```text
dependency group
```

可选图像处理能力：

```text
extra
```

## 18. 开发依赖、测试依赖与生产依赖

### 18.1 运行时依赖

写入：

```toml
[project]
dependencies = []
```

添加：

```bash
uv add fastapi
```

### 18.2 开发依赖

写入：

```toml
[dependency-groups]
dev = []
```

添加：

```bash
uv add --dev pytest ruff
```

### 18.3 文档依赖

```bash
uv add --group docs mkdocs mkdocs-material
```

### 18.4 类型检查依赖

```bash
uv add --group typecheck mypy types-requests
```

### 18.5 推荐结构

```toml
[project]
dependencies = [
    "fastapi",
    "uvicorn",
]

[dependency-groups]
dev = [
    "pytest",
    "ruff",
]
docs = [
    "mkdocs",
]
typecheck = [
    "mypy",
]
```

## 19. Python 版本管理

### 19.1 查看可用 Python

```bash
uv python list
```

### 19.2 安装 Python

```bash
uv python install 3.12
uv python install 3.13
```

### 19.3 固定项目 Python 版本

```bash
uv python pin 3.12
```

会生成或更新：

```text
.python-version
```

### 19.4 查找 Python

```bash
uv python find
uv python find 3.12
```

### 19.5 查看 uv 管理的 Python 安装目录

```bash
uv python dir
```

### 19.6 卸载 Python

```bash
uv python uninstall 3.12
```

### 19.7 pyproject 中声明 Python 范围

```toml
[project]
requires-python = ">=3.12,<3.14"
```

`requires-python` 是包兼容性声明，`.python-version` 是本地/项目使用版本选择。

两者最好一致或兼容。

## 20. pip 兼容模式

### 20.1 uv pip 是什么

`uv pip` 提供与 pip 类似的接口。

常见命令：

```bash
uv pip install
uv pip uninstall
uv pip list
uv pip freeze
uv pip compile
uv pip sync
```

适合：

- 老项目仍使用 requirements.txt。
- 暂时不想迁移到 pyproject 项目模式。
- 替代 pip-tools。
- 在已有 venv 中快速安装。

### 20.2 uv pip 和项目模式区别

| 对比 | uv 项目模式 | uv pip 模式 |
| :--- | :--- | :--- |
| 项目文件 | `pyproject.toml` | `requirements.txt` 或手动包名 |
| 锁文件 | `uv.lock` | requirements 锁定输出 |
| 环境同步 | `uv sync` | `uv pip sync` |
| 运行命令 | `uv run` | 激活环境或指定环境 |
| 推荐新项目 | 是 | 不是首选 |

新项目优先使用项目模式。

## 21. uv venv

### 21.1 创建虚拟环境

```bash
uv venv
```

默认创建：

```text
.venv
```

### 21.2 指定路径

```bash
uv venv .venv
uv venv .venv312 --python 3.12
```

### 21.3 激活环境

Windows：

```powershell
.\.venv\Scripts\Activate.ps1
```

macOS / Linux：

```bash
source .venv/bin/activate
```

### 21.4 不激活直接安装

```bash
uv pip install requests --python .venv
```

不过项目模式下通常不需要直接使用 `uv venv`。

## 22. uv pip install / uninstall / list / freeze

### 22.1 安装包

```bash
uv pip install requests
uv pip install "fastapi[standard]"
```

### 22.2 从 requirements 安装

```bash
uv pip install -r requirements.txt
```

### 22.3 卸载

```bash
uv pip uninstall requests
```

### 22.4 查看已安装包

```bash
uv pip list
```

### 22.5 freeze

```bash
uv pip freeze
```

### 22.6 编译 requirements

```bash
uv pip compile requirements.in -o requirements.txt
```

### 22.7 同步 requirements

```bash
uv pip sync requirements.txt
```

`sync` 会让环境精确匹配 requirements，可能移除多余包。

## 23. requirements.txt 迁移

### 23.1 旧项目结构

```text
project/
├── requirements.txt
├── requirements-dev.txt
└── app.py
```

### 23.2 初始化 uv 项目

```bash
uv init
```

### 23.3 导入运行依赖

```bash
uv add -r requirements.txt
```

### 23.4 导入开发依赖

```bash
uv add --dev -r requirements-dev.txt
```

### 23.5 同步环境

```bash
uv sync
```

### 23.6 运行

```bash
uv run python app.py
```

### 23.7 迁移后保留 requirements.txt 吗

如果部署平台支持 uv：

```text
可以不再维护 requirements.txt。
```

如果平台仍需要 requirements.txt：

```bash
uv export --format requirements-txt --no-hashes > requirements.txt
```

注意：

```text
不要手改导出的 requirements.txt，再反过来和 pyproject/uv.lock 混用。
```

## 24. 脚本模式与 PEP 723

### 24.1 单文件脚本运行

```bash
uv run script.py
```

### 24.2 临时依赖

```bash
uv run --with requests script.py
```

### 24.3 给脚本添加依赖

```bash
uv add --script script.py requests rich
```

uv 会在脚本中写入内联元数据。

示意：

```python
# /// script
# dependencies = [
#   "requests",
#   "rich",
# ]
# ///
import requests
from rich import print

print(requests.get("https://example.com").status_code)
```

运行：

```bash
uv run script.py
```

uv 会根据脚本元数据创建隔离环境并安装依赖。

### 24.4 脚本适合场景

- 一次性工具脚本
- 运维脚本
- 数据处理脚本
- 分享可复现 demo
- 不想创建完整项目的小工具

### 24.5 项目还是脚本

| 场景 | 推荐 |
| :--- | :--- |
| 单文件、依赖少 | 脚本模式 |
| 多文件应用 | 项目模式 |
| 要发布包 | package 项目 |
| 团队长期维护 | 项目模式 |

## 25. uv tool 与 uvx

### 25.1 运行一次性工具

```bash
uvx ruff --version
```

`uvx` 通常等价于：

```bash
uv tool run ruff --version
```

### 25.2 安装工具

```bash
uv tool install ruff
uv tool install black
uv tool install httpie
```

### 25.3 运行已安装工具

```bash
ruff --version
http --version
```

### 25.4 查看工具

```bash
uv tool list
```

### 25.5 升级工具

```bash
uv tool upgrade ruff
```

升级所有工具：

```bash
uv tool upgrade --all
```

### 25.6 卸载工具

```bash
uv tool uninstall ruff
```

### 25.7 uv tool 和项目依赖区别

| 类型 | 命令 | 作用 |
| :--- | :--- | :--- |
| 项目依赖 | `uv add ruff --dev` | 当前项目使用 |
| 全局工具 | `uv tool install ruff` | 用户全局命令 |
| 一次性工具 | `uvx ruff` | 临时运行 |

团队项目中推荐把格式化、测试、lint 工具写入项目依赖，保证版本一致。

## 26. 工作区 workspace

### 26.1 workspace 是什么

workspace 用于管理多个相关 Python 包。

类似：

```text
repo/
├── pyproject.toml
├── packages/
│   ├── core/
│   │   └── pyproject.toml
│   └── api/
│       └── pyproject.toml
└── tools/
    └── cli/
        └── pyproject.toml
```

### 26.2 根 pyproject.toml

示意：

```toml
[tool.uv.workspace]
members = [
    "packages/core",
    "packages/api",
    "tools/cli",
]
```

### 26.3 工作区依赖

如果 `api` 依赖 `core`：

```toml
[project]
dependencies = [
    "core",
]

[tool.uv.sources]
core = { workspace = true }
```

### 26.4 工作区好处

- 多包共享一个锁文件。
- 本地包依赖更清晰。
- 适合 monorepo。
- CI 可以统一同步和测试。

### 26.5 注意

workspace 会增加复杂度。小项目没必要一开始就用。

## 27. 依赖来源：PyPI、私有源、Git、路径、本地包

### 27.1 PyPI 依赖

```bash
uv add requests
```

### 27.2 Git 依赖

```bash
uv add "git+https://github.com/encode/httpx"
```

指定 tag：

```bash
uv add "git+https://github.com/encode/httpx@0.28.1"
```

### 27.3 本地路径依赖

```bash
uv add ../my-lib
```

### 27.4 可编辑依赖

```bash
uv add --editable ../my-lib
```

适合同时开发多个包。

### 27.5 私有源

可以在 `pyproject.toml` 中配置 index。

示意：

```toml
[[tool.uv.index]]
name = "company"
url = "https://pypi.example.com/simple"
```

命令行也可传：

```bash
uv add package-name --index-url https://pypi.example.com/simple
```

### 27.6 认证

认证信息不要写入仓库。

推荐使用：

- 环境变量
- 系统 keyring
- CI secrets
- uv auth 命令

查看：

```bash
uv auth --help
```

## 28. 配置文件与环境变量

### 28.1 配置位置

uv 支持在项目或用户级别配置。

常见文件：

```text
pyproject.toml
uv.toml
```

具体优先级以官方文档为准。

### 28.2 pyproject.toml 中配置 uv

```toml
[tool.uv]
required-version = ">=0.11.0"
```

### 28.3 配置 index

```toml
[[tool.uv.index]]
name = "internal"
url = "https://pypi.example.com/simple"
```

### 28.4 .env

`uv run` 可以加载环境文件。

```bash
uv run --env-file .env python main.py
```

### 28.5 常见环境变量方向

uv 支持大量 `UV_*` 环境变量。

常见用途：

- 配置缓存目录
- 配置 Python 下载行为
- 配置 index
- 配置认证
- 配置是否离线
- 配置日志级别

需要精确变量名时用：

```bash
uv --help
uv run --help
```

或查官方 Settings 文档。

## 29. 缓存管理

### 29.1 uv 缓存什么

uv 会缓存：

- 下载的包
- 构建产物
- wheel
- 解释器下载
- 工具环境

### 29.2 查看缓存目录

```bash
uv cache dir
```

### 29.3 清理缓存

```bash
uv cache clean
```

### 29.4 清理某个包缓存

```bash
uv cache clean requests
```

### 29.5 CI 缓存

CI 中可以缓存 uv 缓存目录，以加速依赖安装。

但不要把 `.venv` 当成唯一可靠缓存来源。更稳妥的是：

- 缓存 uv 下载/构建缓存。
- 每次通过 `uv sync --locked` 重建或校验环境。

## 30. 构建 Python 包

### 30.1 构建命令

```bash
uv build
```

通常会生成：

```text
dist/
├── my_package-0.1.0.tar.gz
└── my_package-0.1.0-py3-none-any.whl
```

### 30.2 包项目 pyproject 示例

```toml
[project]
name = "my-package"
version = "0.1.0"
description = "A demo package"
readme = "README.md"
requires-python = ">=3.12"
dependencies = []

[build-system]
requires = ["uv_build>=0.8.0,<0.9.0"]
build-backend = "uv_build"
```

也可以使用 hatchling、setuptools 等构建后端。

### 30.3 src layout

推荐库项目结构：

```text
my-package/
├── pyproject.toml
├── README.md
├── src/
│   └── my_package/
│       ├── __init__.py
│       └── core.py
└── tests/
```

### 30.4 检查包

构建后可在干净环境测试：

```bash
uv venv /tmp/test-env
uv pip install dist/*.whl --python /tmp/test-env
```

## 31. 发布 Python 包

### 31.1 发布到 PyPI

```bash
uv publish
```

通常需要配置 token。

### 31.2 发布到 TestPyPI

```bash
uv publish --publish-url https://test.pypi.org/legacy/
```

### 31.3 使用 token

不要把 token 写进仓库。

推荐：

- 环境变量
- CI secrets
- trusted publishing

### 31.4 发布前检查

建议：

```bash
uv lock --check
uv sync --locked
uv run pytest
uv build
```

然后再：

```bash
uv publish
```

## 32. 依赖审计 uv audit

### 32.1 基本用法

```bash
uv audit
```

### 32.2 审计项目依赖

在项目根目录：

```bash
uv audit
```

### 32.3 JSON 输出

如果当前版本支持：

```bash
uv audit --format json
```

以 `uv audit --help` 为准。

### 32.4 审计处理原则

发现漏洞后：

- 查看漏洞影响范围。
- 判断是否真的使用受影响功能。
- 优先升级直接依赖。
- 必要时升级传递依赖。
- 记录暂不修复原因。

## 33. 格式化 uv format

### 33.1 命令

```bash
uv format
```

uv CLI 文档中包含 `uv format`，用于格式化项目中的 Python 代码。

### 33.2 注意

Python 生态中格式化工具仍常见：

```bash
ruff format
black
```

项目中应明确团队使用哪个格式化入口。

如果团队已经使用 Ruff：

```bash
uv add --dev ruff
uv run ruff format .
uv run ruff check .
```

## 34. Docker 中使用 uv

### 34.1 基本 Dockerfile

```dockerfile
FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev

COPY . .

CMD ["uv", "run", "python", "main.py"]
```

### 34.2 更偏生产的方式

生产容器中可以避免运行时再次 sync：

```dockerfile
FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev

COPY . .

CMD [".venv/bin/python", "main.py"]
```

Windows 路径不同，Linux 容器中 `.venv/bin/python` 可用。

### 34.3 Docker 缓存优化

先复制依赖文件：

```dockerfile
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev
```

再复制源码：

```dockerfile
COPY . .
```

这样源码变化不会总是导致依赖层重新安装。

### 34.4 注意

不要使用 `latest` 作为长期生产固定版本。

更稳妥：

```dockerfile
COPY --from=ghcr.io/astral-sh/uv:0.11.16 /uv /uvx /bin/
```

具体版本以官方镜像为准。

## 35. CI/CD 中使用 uv

### 35.1 GitHub Actions 示例

```yaml
name: Test

on:
  push:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Install uv
        uses: astral-sh/setup-uv@v5

      - name: Set up Python
        run: uv python install 3.12

      - name: Sync
        run: uv sync --locked

      - name: Test
        run: uv run pytest
```

### 35.2 使用缓存

`setup-uv` 支持缓存配置，具体字段以官方 action 文档为准。

原则：

- 缓存 uv cache。
- 不依赖未锁定安装。
- CI 使用 `--locked`。

### 35.3 多 Python 版本测试

```yaml
strategy:
  matrix:
    python-version: ["3.12", "3.13"]

steps:
  - uses: actions/checkout@v4
  - uses: astral-sh/setup-uv@v5
  - run: uv python install ${{ matrix.python-version }}
  - run: uv sync --locked --python ${{ matrix.python-version }}
  - run: uv run --python ${{ matrix.python-version }} pytest
```

### 35.4 发布流水线

```yaml
- name: Build
  run: uv build

- name: Publish
  run: uv publish
  env:
    UV_PUBLISH_TOKEN: ${{ secrets.PYPI_TOKEN }}
```

实际 token 环境变量名称以 uv 当前文档为准。

## 36. 常见工作流

### 36.1 新建 FastAPI 项目

```bash
uv init fastapi-demo
cd fastapi-demo
uv add fastapi "uvicorn[standard]"
uv add --dev pytest ruff
```

运行：

```bash
uv run uvicorn main:app --reload
```

### 36.2 新建 CLI 工具

```bash
uv init --package my-cli
cd my-cli
uv add typer rich
```

`pyproject.toml`：

```toml
[project.scripts]
my-cli = "my_cli.main:app"
```

运行：

```bash
uv run my-cli
```

### 36.3 运行 Jupyter

```bash
uv add --dev jupyter ipykernel
uv run jupyter lab
```

### 36.4 数据分析脚本

```bash
uv init data-demo
cd data-demo
uv add pandas matplotlib
uv run python analysis.py
```

### 36.5 老项目快速使用 uv

```bash
uv venv
uv pip install -r requirements.txt
uv run python app.py
```

后续再迁移到：

```bash
uv init
uv add -r requirements.txt
```

## 37. 常见错误排查

### 37.1 uv 命令找不到

现象：

```text
uv: command not found
```

或 Windows：

```text
'uv' 不是内部或外部命令
```

处理：

- 重新打开终端。
- 检查安装目录是否在 PATH。
- 执行安装器提示的 PATH 配置命令。

### 37.2 PowerShell 执行策略错误

安装或激活时报错：

```text
running scripts is disabled on this system
```

安装命令可使用官方给出的：

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

虚拟环境激活问题可以改用：

```powershell
uv run python main.py
```

不一定需要激活。

### 37.3 Python 版本不满足

现象：

```text
requires-python >=3.12
```

处理：

```bash
uv python install 3.12
uv python pin 3.12
uv sync
```

### 37.4 锁文件过期

CI 中：

```text
The lockfile needs to be updated
```

处理：

本地运行：

```bash
uv lock
uv sync
```

提交：

```text
pyproject.toml
uv.lock
```

### 37.5 依赖解析失败

原因：

- 版本约束冲突。
- Python 版本不兼容。
- 平台不兼容。
- 私有源缺包。
- extras 冲突。

排查：

```bash
uv lock -v
uv tree
```

处理：

- 放宽或修正版本约束。
- 调整 `requires-python`。
- 升级冲突包。
- 检查私有源配置。

### 37.6 私有源认证失败

处理方向：

- 检查 index URL。
- 检查用户名、token。
- 不要把认证写进仓库。
- 使用 `uv auth --help` 查看当前版本支持。
- 在 CI 中使用 secrets。

### 37.7 ModuleNotFoundError

现象：

```text
ModuleNotFoundError: No module named 'xxx'
```

常见原因：

- 没用 `uv run`。
- 当前 shell 激活了错误环境。
- 依赖加到了 dev 组但生产环境用了 `--no-dev`。
- extras 没同步。

处理：

```bash
uv sync
uv run python -c "import xxx"
```

如果是 extra：

```bash
uv sync --extra postgres
```

### 37.8 命令行工具找不到

比如：

```text
pytest: command not found
```

处理：

```bash
uv add --dev pytest
uv run pytest
```

或全局工具：

```bash
uv tool install pytest
```

团队项目优先使用项目内依赖 + `uv run`。

## 38. uv 最佳实践

### 38.1 新项目优先项目模式

推荐：

```bash
uv init
uv add ...
uv run ...
uv sync
```

不要新项目一上来只用 `uv pip install`。

### 38.2 提交 uv.lock

应用项目强烈建议提交：

```text
uv.lock
```

### 38.3 CI 使用 --locked

```bash
uv sync --locked
uv run --locked pytest
```

这样能发现本地忘记更新锁文件的问题。

### 38.4 不手动改 .venv

不要在 uv 项目中长期手动：

```bash
pip install xxx
```

推荐：

```bash
uv add xxx
```

或临时：

```bash
uv run --with xxx ...
```

### 38.5 区分依赖类型

运行时依赖：

```bash
uv add fastapi
```

开发依赖：

```bash
uv add --dev pytest ruff
```

文档依赖：

```bash
uv add --group docs mkdocs
```

可选功能：

```bash
uv add --optional postgres psycopg
```

### 38.6 团队统一 Python 版本

```bash
uv python pin 3.12
```

同时在 `pyproject.toml` 中声明：

```toml
requires-python = ">=3.12"
```

### 38.7 工具版本放进项目

团队项目推荐：

```bash
uv add --dev ruff pytest mypy
uv run ruff check .
uv run pytest
```

而不是每个人全局安装不同版本。

### 38.8 不把 secrets 写入配置

私有源 token、PyPI token 应放：

- 环境变量
- CI secrets
- 本机认证存储

### 38.9 Docker 中固定 uv 版本

不要长期使用：

```dockerfile
ghcr.io/astral-sh/uv:latest
```

生产更推荐固定版本。

### 38.10 迁移要分阶段

老项目迁移建议：

1. 先用 `uv pip` 替代 pip。
2. 再引入 `uv init` 和 `pyproject.toml`。
3. 再提交 `uv.lock`。
4. 最后改 CI 和 Docker。

## 39. 学习路线

### 阶段 1：会安装和运行

掌握：

- `uv --version`
- `uv init`
- `uv add`
- `uv run`
- `uv sync`

### 阶段 2：理解项目结构

掌握：

- `pyproject.toml`
- `uv.lock`
- `.venv`
- `.python-version`
- `requires-python`

### 阶段 3：理解依赖管理

掌握：

- 运行时依赖
- dev 依赖
- dependency groups
- extras
- `uv tree`
- `uv lock --upgrade-package`

### 阶段 4：理解 Python 管理

掌握：

- `uv python list`
- `uv python install`
- `uv python pin`
- `uv python find`

### 阶段 5：掌握旧项目兼容

掌握：

- `uv venv`
- `uv pip install`
- `uv pip compile`
- `uv pip sync`
- requirements 迁移

### 阶段 6：工程化

掌握：

- Docker
- CI/CD
- 私有源
- publish
- audit
- workspace

## 40. 命令速查

### 40.1 安装和版本

```bash
uv --version
uv --help
uv self update
```

### 40.2 项目

```bash
uv init
uv init my-app
uv init --package my-lib
uv add requests
uv add --dev pytest ruff
uv remove requests
uv sync
uv run python main.py
uv run pytest
```

### 40.3 锁文件

```bash
uv lock
uv lock --check
uv lock --upgrade
uv lock --upgrade-package requests
```

### 40.4 依赖查看和导出

```bash
uv tree
uv export --format requirements-txt > requirements.txt
uv export --format requirements-txt --no-hashes > requirements.txt
```

### 40.5 Python 管理

```bash
uv python list
uv python install 3.12
uv python pin 3.12
uv python find
uv python dir
uv python uninstall 3.12
```

### 40.6 pip 兼容

```bash
uv venv
uv pip install requests
uv pip install -r requirements.txt
uv pip uninstall requests
uv pip list
uv pip freeze
uv pip compile requirements.in -o requirements.txt
uv pip sync requirements.txt
```

### 40.7 脚本

```bash
uv run script.py
uv run --with requests script.py
uv add --script script.py requests rich
```

### 40.8 工具

```bash
uvx ruff --version
uv tool run ruff --version
uv tool install ruff
uv tool list
uv tool upgrade ruff
uv tool upgrade --all
uv tool uninstall ruff
```

### 40.9 构建发布

```bash
uv build
uv publish
```

### 40.10 缓存和审计

```bash
uv cache dir
uv cache clean
uv audit
uv format
```

## 41. 官方参考资料

建议优先阅读 uv 官方文档：

- [uv 官方文档](https://docs.astral.sh/uv/)
- [Installation](https://docs.astral.sh/uv/getting-started/installation/)
- [Features](https://docs.astral.sh/uv/getting-started/features/)
- [CLI Reference](https://docs.astral.sh/uv/reference/cli/)
- [Working on projects](https://docs.astral.sh/uv/guides/projects/)
- [Locking and syncing](https://docs.astral.sh/uv/concepts/projects/sync/)
- [Project configuration](https://docs.astral.sh/uv/concepts/projects/config/)
- [Python versions](https://docs.astral.sh/uv/concepts/python-versions/)
- [Tools](https://docs.astral.sh/uv/concepts/tools/)
- [Scripts](https://docs.astral.sh/uv/guides/scripts/)
- [Workspaces](https://docs.astral.sh/uv/concepts/projects/workspaces/)
- [Publishing](https://docs.astral.sh/uv/guides/package/)
- [Settings](https://docs.astral.sh/uv/reference/settings/)
- [GitHub Releases](https://github.com/astral-sh/uv/releases)

## 最后总结

uv 的核心可以浓缩为：

```text
uv init 创建项目
pyproject.toml 声明项目和依赖
uv.lock 锁定完整依赖解析结果
uv sync 让 .venv 与锁文件一致
uv run 在项目环境中运行命令
uv add/remove 管理依赖声明
uv python 管理 Python 解释器
uv pip 兼容传统 pip 工作流
uv tool/uvx 管理命令行工具
uv build/publish 构建和发布包
```

初学 uv 最重要的是分清三件事：

1. 项目依赖应通过 `uv add` 写入 `pyproject.toml`，不要长期手动 `pip install`。
2. 可复现环境依赖 `uv.lock`，团队和 CI 应提交并检查锁文件。
3. 运行命令优先用 `uv run`，这样不需要关心当前 shell 激活的是哪个虚拟环境。

当你能解释 `uv run` 为什么会自动 sync、`--locked` 和 `--frozen` 的区别、dependency groups 和 extras 的区别、`uv tool` 和项目 dev 依赖的区别、`uv pip sync` 与 `uv sync` 的区别时，就已经真正入门 uv。

## 42. 2026-06 深化补充：uv 在团队项目中的用法

uv 的核心价值不是“比 pip 快”这么简单，而是把 Python 解释器管理、虚拟环境、依赖解析、锁文件、工具运行、构建发布整合到一条一致工作流里。团队项目中，应尽量围绕 `pyproject.toml` 和 `uv.lock` 建立规范。

### 42.1 推荐工作流

```bash
uv init
uv add fastapi
uv add --dev pytest ruff
uv lock
uv sync --locked
uv run pytest
uv run ruff check .
```

| 场景 | 推荐命令 | 说明 |
| --- | --- | --- |
| 新增运行时依赖 | `uv add requests` | 写入 `project.dependencies` |
| 新增开发依赖 | `uv add --dev pytest` | 写入开发依赖组 |
| 按锁文件同步 | `uv sync --locked` | CI 中避免意外改锁 |
| 运行项目命令 | `uv run <cmd>` | 自动使用项目环境 |
| 临时运行工具 | `uvx ruff check .` | 不污染项目依赖 |
| 兼容 pip 流程 | `uv pip install -r requirements.txt` | 迁移旧项目时使用 |

### 42.2 `uv.lock` 的团队策略

- 应用项目通常提交 `uv.lock`，保证部署和 CI 可复现。
- 库项目是否提交锁文件取决于团队策略；测试环境可以用锁文件，发布包仍应表达合理的版本范围。
- CI 使用 `uv sync --locked`，如果依赖声明和锁文件不一致应失败。
- 不要手动编辑 `uv.lock`，用 `uv add`、`uv remove`、`uv lock` 更新。

### 42.3 dependency groups 与 extras

| 机制 | 面向谁 | 例子 |
| --- | --- | --- |
| dependency groups | 开发者和项目工作流 | `dev`、`test`、`docs` |
| optional dependencies / extras | 安装该包的用户 | `postgres`、`redis`、`cli` |

简单判断：如果是“开发这个项目需要”，放 group；如果是“用户安装这个包时可选启用功能”，放 extras。

### 42.4 迁移旧项目建议

1. 保留原 `requirements.txt`，先用 `uv pip` 验证兼容性。
2. 引入 `pyproject.toml`，把直接依赖迁入 `project.dependencies`。
3. 生成 `uv.lock` 并在 CI 中使用 `uv sync --locked`。
4. 再逐步替换 README、Dockerfile、CI 脚本中的 `pip install`。
5. 对依赖冲突大的老项目，不要一次性升级所有包。

## 43. 补充参考资料

- [uv Documentation](https://docs.astral.sh/uv/)
- [uv Project Guide](https://docs.astral.sh/uv/guides/projects/)
- [uv Locking and syncing](https://docs.astral.sh/uv/concepts/projects/sync/)
- [uv Tools](https://docs.astral.sh/uv/concepts/tools/)
- [uv Scripts](https://docs.astral.sh/uv/guides/scripts/)
- [uv GitHub Releases](https://github.com/astral-sh/uv/releases)

## 2026-06 深化整理：uv 包管理器 的工程化学习框架

Last researched: 2026-06-16

### 1. 学习定位

uv 包管理器 这类知识不适合只按“概念清单”记忆，更适合按可交付能力组织。本文后续复习时，应围绕这条主线展开：Python 版本管理、虚拟环境、依赖解析、锁文件、脚本运行、pip 兼容和 CI 加速。如果只会照抄命令、配置或示例，而不能解释输入、输出、边界、失败模式和验证方法，知识在真实项目里会很快失效。

一份万字级笔记要承担三个作用：第一，建立准确概念，避免把相似术语混在一起；第二，形成可执行流程，知道从零搭建、调试和交付的顺序；第三，沉淀排错经验，遇到异常时能按证据定位，而不是凭感觉改配置。学习时建议把每个小节都对应到“是什么、为什么、怎么做、什么时候不用、出了问题怎么查”五个问题。

### 2. 核心模块

- uv 统一 Python 包管理常见工作流
- lock 文件提升跨平台可复现性
- uv pip 便于迁移传统流程
- 工具安装和脚本运行减少环境污染
- CI 中应结合缓存和锁文件

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

- 把 uv 当 pip 完全克隆
- 未提交锁文件导致环境漂移
- 混用多个包管理器
- 平台相关依赖未验证
- CI 缓存键设计过粗

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

- [Official] [uv Documentation](https://docs.astral.sh/uv/)
- [Official] [uv pip compatibility](https://docs.astral.sh/uv/pip/compatibility/)
- [Source] [astral-sh/uv](https://github.com/astral-sh/uv)
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

## 万字精讲扩展：UV包管理器学习笔记

> 本节为按参考笔记篇幅补充的系统化扩展内容，目标是把原有笔记从“知识点记录”扩展为“概念、原理、流程、工程实践、常见误区和复盘清单”完整学习材料。

### 精讲扩展 1：UV包管理器学习笔记 的概念边界、核心流程 与工程化理解

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
