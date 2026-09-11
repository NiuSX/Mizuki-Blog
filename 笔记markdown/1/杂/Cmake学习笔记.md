# CMake 完整学习笔记

<!-- lecture-notes:integrated-v2 -->

## 讲义导读：把概念落到可验证实践

这一章讲的是 **CMake 完整学习笔记**，属于 **构建系统与包管理**。阅读时不要把它当成零散资料堆叠，而要把它当成一份讲义：先弄清它解决什么问题，再看核心概念和流程，最后做一个能复现、能观察、能排错的小练习。

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


> 适合对象：C / C++ 初学者，嵌入式、Qt、跨平台开发者，需要系统掌握现代 CMake、依赖管理、测试、安装、打包、交叉编译和工程化实践的人。
最后调研：2026-06-12。

CMake 是 C / C++ 生态中最常见的跨平台构建系统生成工具。它本身通常不直接编译代码，而是根据 `CMakeLists.txt` 生成真正的构建系统，例如 Ninja、Unix Makefiles、Visual Studio 工程、Xcode 工程，然后由这些构建系统调用编译器完成编译、链接、测试、安装和打包。

如果你只会执行 `cmake .. && make`，还不算真正理解 CMake。真正掌握 CMake，需要理解：源码目录和构建目录为什么要分开、Configure / Generate / Build 三个阶段分别做什么、Generator 是什么、Target 为什么是现代 CMake 的核心、`PRIVATE` / `PUBLIC` / `INTERFACE` 如何传递用法需求、`find_package()` 如何查找依赖、`CMakePresets.json` 如何统一配置、CTest 如何测试、install/export/package 如何让库被别人使用，以及交叉编译、工具链文件、RPATH、Debug/Release、多配置生成器这些真实项目中经常遇到的问题。

版本说明：截至 2026-06-12，CMake 官方下载页显示 Latest Release 为 CMake 4.3.3。CMake 4.x 已经进入稳定使用阶段，但实际项目不应盲目把 `cmake_minimum_required()` 写到最新版本；更合理的做法是根据项目需要的命令和特性选择最低版本，例如常见现代 CMake 项目可从 3.20、3.23、3.25、3.28 等版本起步，团队内部新项目再根据工具链统一升级。具体版本请始终以 CMake 官方下载页和文档为准。

学习目标：

- 会用 `cmake -S . -B build`、`cmake --build build`、`ctest` 完成基础构建和测试。
- 能读懂并维护以 target 为核心的 `CMakeLists.txt`。
- 能判断 `PRIVATE`、`PUBLIC`、`INTERFACE` 应该怎么写。
- 能用 `find_package()`、包管理器、`FetchContent` 管理依赖。
- 能为库项目补上 install、export、package config，使它可被其他项目复用。
- 能排查生成器、构建类型、依赖查找、链接、运行时库、交叉编译等常见问题。

## 目录

1. CMake 是什么
2. CMake 解决什么问题
3. CMake、Make、Ninja、MSBuild 的关系
4. CMake 核心概念总览
5. 安装与环境检查
6. 一个最小 CMake 项目
7. Configure、Generate、Build 三阶段
8. Source Tree、Build Tree 与 out-of-source build
9. CMakeLists.txt 基础
10. CMake 语言基础
11. 变量、Cache 变量与作用域
12. Option 与项目配置开关
13. Target 是现代 CMake 的核心
14. add_executable 与 add_library
15. PRIVATE、PUBLIC、INTERFACE
16. 头文件目录 target_include_directories
17. 编译特性与 C/C++ 标准
18. 编译选项、宏定义与链接选项
19. 链接库 target_link_libraries
20. 源文件组织与 target_sources
21. 生成器与构建类型
22. Debug、Release 与多配置生成器
23. CMakePresets.json
24. 依赖管理总览
25. find_package
26. FetchContent
27. ExternalProject
28. vcpkg 与 Conan
29. 安装 install
30. 导出 targets 与生成 Config 包
31. 测试 CTest
32. 自定义命令和自定义目标
33. 生成文件与代码生成
34. Generator Expressions
35. Toolchain 文件与交叉编译
36. 嵌入式 CMake 常见配置
37. Qt 项目 CMake 基础
38. RPATH、运行时库与动态库部署
39. 预编译头、Unity Build 与 IPO/LTO
40. CPack 打包
41. CI/CD 中使用 CMake
42. 常见错误排查
43. 现代 CMake 最佳实践
44. 学习路线
45. 命令速查
46. 参考资料与扩展阅读

## 1. CMake 是什么

CMake 是一个跨平台构建系统生成器。

它可以：

- 读取 `CMakeLists.txt`。
- 检测编译器和平台环境。
- 查找依赖库。
- 生成 Ninja / Makefile / Visual Studio / Xcode 等构建文件。
- 组织编译、链接、测试、安装、打包流程。
- 支持跨平台、交叉编译、多配置、IDE 集成。

一句话理解：

```text
CMake 不是编译器，也不是 Make；CMake 是用来生成构建系统的工具。
```

典型流程：

```text
源码 + CMakeLists.txt
        ↓
      cmake 配置和生成
        ↓
  Ninja / Makefile / VS 工程
        ↓
      编译器和链接器
        ↓
      可执行文件 / 库
```

## 2. CMake 解决什么问题

### 2.1 跨平台构建问题

不同平台构建工具不同：

| 平台 | 常见构建系统 |
| :--- | :--- |
| Linux | Make、Ninja |
| macOS | Make、Ninja、Xcode |
| Windows | Visual Studio、Ninja、NMake |

如果每个平台都手写构建脚本，会很难维护。

CMake 通过统一描述项目结构，再生成不同平台的构建系统。

### 2.2 编译器差异问题

不同编译器选项不同：

| 编译器 | 常见选项 |
| :--- | :--- |
| GCC / Clang | `-Wall -Wextra -O2` |
| MSVC | `/W4 /O2` |

CMake 可以根据编译器判断并设置合适选项。

### 2.3 依赖查找问题

项目可能依赖：

- OpenSSL
- Boost
- Qt
- zlib
- fmt
- spdlog
- protobuf
- gtest

CMake 提供：

- `find_package()`
- `FetchContent`
- toolchain 集成
- package config
- exported targets

### 2.4 多模块项目组织问题

大型 C++ 项目通常包含：

- app
- core
- network
- database
- tests
- third_party
- tools

CMake 可以用目录和 target 组织模块关系。

### 2.5 安装和打包问题

CMake 不只构建，还可以：

- 安装头文件
- 安装库文件
- 安装可执行程序
- 导出 CMake package
- 生成 zip、tar.gz、deb、rpm、nsis 安装包

## 3. CMake、Make、Ninja、MSBuild 的关系

### 3.1 Make

Make 是一种传统构建工具，读取 `Makefile`。

命令：

```bash
make
```

### 3.2 Ninja

Ninja 是一个小而快的构建工具，读取 `build.ninja`。

命令：

```bash
ninja
```

### 3.3 MSBuild

MSBuild 是 Visual Studio 使用的构建系统，读取 `.sln`、`.vcxproj` 等文件。

### 3.4 CMake 的位置

CMake 负责生成这些构建系统文件。

例如生成 Ninja：

```bash
cmake -S . -B build -G Ninja
cmake --build build
```

生成 Visual Studio 工程：

```powershell
cmake -S . -B build -G "Visual Studio 17 2022"
cmake --build build --config Release
```

关系图：

```text
CMakeLists.txt
    ↓ cmake -G Ninja
build.ninja
    ↓ ninja
可执行文件 / 库
```

```text
CMakeLists.txt
    ↓ cmake -G "Visual Studio ..."
solution / project
    ↓ MSBuild / Visual Studio
可执行文件 / 库
```

## 4. CMake 核心概念总览

| 概念 | 说明 |
| :--- | :--- |
| Source Tree | 源码目录，包含 `CMakeLists.txt` |
| Build Tree | 构建目录，保存生成文件和构建产物 |
| Generator | 生成器，例如 Ninja、Unix Makefiles、Visual Studio |
| Configure | 读取脚本、检测环境、计算配置 |
| Generate | 生成构建系统文件 |
| Build | 执行真正的编译和链接 |
| Target | 构建目标，例如可执行文件或库 |
| Property | target、source、directory、global 上的属性 |
| Variable | CMake 脚本变量 |
| Cache Variable | 缓存变量，用户可通过命令行或 GUI 修改 |
| Command | CMake 命令，例如 `add_library()` |
| Module | CMake 模块文件，通常是 `.cmake` |
| Package | 可被 `find_package()` 找到的依赖包 |
| Toolchain File | 描述交叉编译工具链的文件 |
| Preset | 预设配置，写在 `CMakePresets.json` |

核心模型：

```text
项目由 target 组成
target 有源码、头文件、编译选项、链接库和用法需求
target 之间通过 link 建立依赖
CMake 根据 target 关系生成构建系统
```

## 5. 安装与环境检查

### 5.1 查看版本

```bash
cmake --version
```

### 5.2 Windows 安装

常见方式：

```powershell
winget install Kitware.CMake
```

也可以从官网下载 `.msi` 安装包。

安装时注意勾选：

```text
Add CMake to the system PATH
```

### 5.3 macOS 安装

```bash
brew install cmake
```

### 5.4 Linux 安装

Ubuntu：

```bash
sudo apt install cmake ninja-build build-essential
```

但发行版仓库中的 CMake 可能较旧。需要新版本时，可使用：

- Kitware APT 仓库
- 官方二进制包
- pip 安装
- snap
- 源码编译

### 5.5 推荐同时安装 Ninja

```bash
ninja --version
```

推荐默认使用 Ninja：

```bash
cmake -S . -B build -G Ninja
```

原因：

- 快
- 跨平台
- 输出清晰
- 与 CMake 结合成熟

## 6. 一个最小 CMake 项目

目录：

```text
hello/
├── CMakeLists.txt
└── main.cpp
```

`main.cpp`：

```cpp
#include <iostream>

int main() {
    std::cout << "Hello CMake\n";
    return 0;
}
```

`CMakeLists.txt`：

```cmake
cmake_minimum_required(VERSION 3.20)

project(HelloCMake LANGUAGES CXX)

add_executable(hello main.cpp)
```

构建：

```bash
cmake -S . -B build -G Ninja
cmake --build build
```

运行：

```bash
./build/hello
```

Windows 上可能是：

```powershell
.\build\hello.exe
```

### 6.1 推荐的最小库项目模板

真实 C++ 项目通常不只一个 `main.cpp`，更常见的是一个库加一个应用：

```text
demo/
├── CMakeLists.txt
├── include/
│   └── demo/
│       └── greeting.hpp
├── src/
│   └── greeting.cpp
└── app/
    └── main.cpp
```

顶层 `CMakeLists.txt`：

```cmake
cmake_minimum_required(VERSION 3.25)

project(Demo
    VERSION 1.0.0
    DESCRIPTION "A small modern CMake project"
    LANGUAGES CXX
)

add_library(demo)
add_library(Demo::demo ALIAS demo)

target_sources(demo
    PRIVATE
        src/greeting.cpp
    PUBLIC
        FILE_SET HEADERS
        BASE_DIRS include
        FILES include/demo/greeting.hpp
)

target_compile_features(demo PUBLIC cxx_std_20)

add_executable(demo_app app/main.cpp)
target_link_libraries(demo_app PRIVATE Demo::demo)
```

这个模板体现了现代 CMake 的几个重点：

- 用 target 表达库和应用。
- 用 `target_sources()` 管理源码和 public 头文件。
- 用 `target_compile_features()` 表达 C++ 标准需求。
- 用命名空间 alias target 模拟安装后消费者看到的目标名。

## 7. Configure、Generate、Build 三阶段

### 7.1 Configure

命令：

```bash
cmake -S . -B build
```

CMake 会：

- 读取 `CMakeLists.txt`
- 执行 CMake 脚本
- 检测编译器
- 查找依赖
- 处理变量和选项
- 写入 `CMakeCache.txt`

### 7.2 Generate

Configure 成功后，CMake 会生成构建系统文件。

例如 Ninja：

```text
build/build.ninja
```

Make：

```text
build/Makefile
```

Visual Studio：

```text
build/*.sln
build/*.vcxproj
```

### 7.3 Build

命令：

```bash
cmake --build build
```

CMake 会调用实际构建工具：

- Ninja
- Make
- MSBuild
- Xcodebuild

### 7.4 为什么推荐 cmake --build

推荐：

```bash
cmake --build build
```

而不是直接：

```bash
ninja -C build
make -C build
```

原因：

```text
cmake --build 可以屏蔽不同生成器的构建命令差异。
```

## 8. Source Tree、Build Tree 与 out-of-source build

### 8.1 Source Tree

源码目录：

```text
project/
├── CMakeLists.txt
├── src/
└── include/
```

### 8.2 Build Tree

构建目录：

```text
project/build/
```

保存：

- `CMakeCache.txt`
- 构建系统文件
- 中间文件
- 目标文件
- 可执行文件
- 库文件
- 测试报告

### 8.3 out-of-source build

推荐：

```bash
cmake -S . -B build
cmake --build build
```

不推荐在源码目录里构建：

```bash
cmake .
make
```

### 8.4 为什么不在源码目录构建

源码目录构建会污染项目：

- 生成大量临时文件
- 难以清理
- 容易误提交
- Debug/Release 无法清晰分离

### 8.5 清理构建

最可靠方式：

```bash
rm -rf build
```

Windows PowerShell：

```powershell
Remove-Item -Recurse -Force build
```

## 9. CMakeLists.txt 基础

### 9.1 推荐开头

```cmake
cmake_minimum_required(VERSION 3.20)

project(MyProject
    VERSION 1.0.0
    DESCRIPTION "A modern CMake example"
    LANGUAGES C CXX
)
```

### 9.2 cmake_minimum_required

```cmake
cmake_minimum_required(VERSION 3.20)
```

作用：

- 指定项目需要的最低 CMake 版本。
- 设置对应版本的 policy 行为。

不要写太低，例如：

```cmake
cmake_minimum_required(VERSION 2.8)
```

这会引入大量旧行为和兼容警告。

### 9.3 project

```cmake
project(MyProject VERSION 1.0.0 LANGUAGES CXX)
```

会设置：

- `PROJECT_NAME`
- `PROJECT_VERSION`
- `PROJECT_SOURCE_DIR`
- `PROJECT_BINARY_DIR`
- `MyProject_SOURCE_DIR`
- `MyProject_BINARY_DIR`

### 9.4 add_subdirectory

```cmake
add_subdirectory(src)
add_subdirectory(tests)
```

作用：

```text
把子目录中的 CMakeLists.txt 纳入当前构建。
```

### 9.5 message

```cmake
message(STATUS "Compiler: ${CMAKE_CXX_COMPILER}")
message(WARNING "This is a warning")
message(FATAL_ERROR "Stop configure")
```

## 10. CMake 语言基础

### 10.1 命令调用

```cmake
command_name(arg1 arg2 arg3)
```

CMake 命令不区分大小写，但推荐小写：

```cmake
add_executable(app main.cpp)
```

### 10.2 注释

```cmake
# 单行注释
```

### 10.3 字符串

```cmake
set(NAME "demo")
```

### 10.4 变量引用

```cmake
message(STATUS "Name: ${NAME}")
```

### 10.5 列表

CMake 列表本质上是分号分隔字符串：

```cmake
set(SOURCES main.cpp app.cpp util.cpp)
```

等价于：

```cmake
set(SOURCES "main.cpp;app.cpp;util.cpp")
```

### 10.6 list 命令

```cmake
list(APPEND SOURCES extra.cpp)
list(REMOVE_ITEM SOURCES old.cpp)
list(LENGTH SOURCES SOURCE_COUNT)
```

### 10.7 if

```cmake
if(WIN32)
    message(STATUS "Windows")
elseif(APPLE)
    message(STATUS "macOS")
elseif(UNIX)
    message(STATUS "Unix")
endif()
```

### 10.8 foreach

```cmake
foreach(file IN LISTS SOURCES)
    message(STATUS "source: ${file}")
endforeach()
```

### 10.9 function

```cmake
function(print_target_name target_name)
    message(STATUS "Target: ${target_name}")
endfunction()
```

### 10.10 macro 与 function 区别

| 项目 | function | macro |
| :--- | :--- | :--- |
| 作用域 | 有自己的作用域 | 没有独立作用域 |
| 参数处理 | 更安全 | 类似文本替换 |
| 推荐程度 | 推荐 | 谨慎使用 |

优先使用 `function()`，少用 `macro()`。

## 11. 变量、Cache 变量与作用域

### 11.1 普通变量

```cmake
set(MY_VALUE "hello")
message(STATUS "${MY_VALUE}")
```

### 11.2 作用域

普通变量有目录作用域和函数作用域。

子目录可以读取父目录变量，但子目录修改通常不会自动影响父目录。

### 11.3 PARENT_SCOPE

```cmake
function(set_result)
    set(RESULT "value" PARENT_SCOPE)
endfunction()
```

不建议大量使用，容易让脚本变难维护。

### 11.4 Cache 变量

```cmake
set(MY_FEATURE ON CACHE BOOL "Enable my feature")
```

Cache 变量会写入：

```text
build/CMakeCache.txt
```

用户可以通过命令行修改：

```bash
cmake -S . -B build -DMY_FEATURE=OFF
```

### 11.5 删除缓存变量

```bash
cmake -S . -B build -U MY_FEATURE
```

或删除整个构建目录。

### 11.6 常见内置变量

| 变量 | 说明 |
| :--- | :--- |
| `CMAKE_SOURCE_DIR` | 顶层源码目录 |
| `CMAKE_BINARY_DIR` | 顶层构建目录 |
| `CMAKE_CURRENT_SOURCE_DIR` | 当前 `CMakeLists.txt` 所在源码目录 |
| `CMAKE_CURRENT_BINARY_DIR` | 当前目录对应的构建目录 |
| `PROJECT_SOURCE_DIR` | 当前 project 的源码目录 |
| `PROJECT_BINARY_DIR` | 当前 project 的构建目录 |
| `CMAKE_C_COMPILER` | C 编译器 |
| `CMAKE_CXX_COMPILER` | C++ 编译器 |
| `CMAKE_BUILD_TYPE` | 单配置生成器的构建类型 |
| `CMAKE_INSTALL_PREFIX` | 安装前缀 |

### 11.7 不要滥用全局变量

现代 CMake 更推荐：

```text
用 target property 表达构建需求，而不是用全局变量到处传。
```

## 12. Option 与项目配置开关

### 12.1 option

```cmake
option(MYPROJECT_BUILD_TESTS "Build tests" ON)
option(MYPROJECT_ENABLE_WARNINGS "Enable compiler warnings" ON)
```

命令行关闭：

```bash
cmake -S . -B build -DMYPROJECT_BUILD_TESTS=OFF
```

### 12.2 推荐命名

使用项目前缀：

```cmake
MYPROJECT_BUILD_TESTS
MYPROJECT_ENABLE_SANITIZER
MYPROJECT_BUILD_EXAMPLES
```

不要用过于通用的名字：

```cmake
BUILD_TESTS
ENABLE_WARNINGS
```

大型项目中容易冲突。

### 12.3 option 与依赖逻辑

```cmake
if(MYPROJECT_BUILD_TESTS)
    enable_testing()
    add_subdirectory(tests)
endif()
```

## 13. Target 是现代 CMake 的核心

### 13.1 Target 是什么

Target 是 CMake 中代表构建目标的对象。

常见 target：

- 可执行文件
- 静态库
- 动态库
- 接口库
- 对象库
- imported library
- alias target
- custom target

### 13.2 Target 包含什么

一个 target 可以包含：

- 源文件
- 头文件目录
- 编译选项
- 编译宏
- 编译特性
- 链接库
- 链接选项
- 安装规则
- 传递给消费者的用法需求

### 13.3 现代 CMake 的思路

旧式写法：

```cmake
include_directories(include)
add_definitions(-DUSE_XXX)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall")
```

现代写法：

```cmake
target_include_directories(mylib PUBLIC include)
target_compile_definitions(mylib PRIVATE USE_XXX)
target_compile_options(mylib PRIVATE -Wall)
```

核心原则：

```text
围绕 target 配置，不围绕目录和全局变量配置。
```

## 14. add_executable 与 add_library

### 14.1 add_executable

```cmake
add_executable(app
    src/main.cpp
)
```

### 14.2 add_library 静态库

```cmake
add_library(core STATIC
    src/core.cpp
)
```

### 14.3 add_library 动态库

```cmake
add_library(core SHARED
    src/core.cpp
)
```

### 14.4 不指定 STATIC / SHARED

```cmake
add_library(core src/core.cpp)
```

由变量控制：

```cmake
BUILD_SHARED_LIBS
```

命令：

```bash
cmake -S . -B build -DBUILD_SHARED_LIBS=ON
```

### 14.5 MODULE 库

```cmake
add_library(plugin MODULE src/plugin.cpp)
```

适合插件，不用于普通链接。

### 14.6 OBJECT 库

```cmake
add_library(objlib OBJECT src/a.cpp src/b.cpp)
```

对象库编译源文件但不归档成 `.a` 或 `.lib`。

使用：

```cmake
add_library(mylib STATIC $<TARGET_OBJECTS:objlib>)
```

### 14.7 INTERFACE 库

```cmake
add_library(warnings INTERFACE)
target_compile_options(warnings INTERFACE -Wall -Wextra)
```

接口库没有编译产物，只携带用法需求。

### 14.8 ALIAS target

```cmake
add_library(myproject::core ALIAS core)
```

使用：

```cmake
target_link_libraries(app PRIVATE myproject::core)
```

命名空间 target 更清晰，也更接近第三方包的使用方式。

## 15. PRIVATE、PUBLIC、INTERFACE

这三个关键字是现代 CMake 的核心。

### 15.1 PRIVATE

只影响当前 target。

```cmake
target_compile_definitions(core PRIVATE CORE_INTERNAL)
```

### 15.2 PUBLIC

影响当前 target，也传递给链接它的消费者。

```cmake
target_include_directories(core PUBLIC include)
```

### 15.3 INTERFACE

不影响当前 target，只传递给消费者。

```cmake
target_compile_features(header_only INTERFACE cxx_std_20)
```

### 15.4 判断规则

| 依赖或配置 | 当前 target 需要 | 消费者也需要 | 用法 |
| :--- | :--- | :--- | :--- |
| 只内部使用 | 是 | 否 | `PRIVATE` |
| 当前和消费者都需要 | 是 | 是 | `PUBLIC` |
| 当前不编译，只给消费者 | 否 | 是 | `INTERFACE` |

### 15.5 示例

`core` 的 public header 中包含 `fmt/core.h`：

```cpp
// include/core/log.hpp
#include <fmt/core.h>

namespace core {
    fmt::memory_buffer make_log();
}
```

那么：

```cmake
target_link_libraries(core PUBLIC fmt::fmt)
```

如果 `fmt` 只在 `.cpp` 中使用：

```cmake
target_link_libraries(core PRIVATE fmt::fmt)
```

## 16. 头文件目录 target_include_directories

### 16.1 基本写法

```cmake
target_include_directories(core
    PUBLIC
        include
    PRIVATE
        src
)
```

### 16.2 BUILD_INTERFACE 和 INSTALL_INTERFACE

库项目推荐：

```cmake
target_include_directories(core
    PUBLIC
        $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
        $<INSTALL_INTERFACE:include>
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/src
)
```

含义：

- 构建树中使用源码目录的 `include`。
- 安装后使用安装前缀下的 `include`。

### 16.3 不推荐 include_directories

不推荐：

```cmake
include_directories(include)
```

原因：

- 影响当前目录和子目录。
- 作用范围不清晰。
- 容易污染其他 target。
- 不利于导出 package。

## 17. 编译特性与 C/C++ 标准

### 17.1 推荐 target_compile_features

```cmake
target_compile_features(core PUBLIC cxx_std_20)
```

含义：

```text
core 需要 C++20，消费者也需要用 C++20 编译。
```

### 17.2 使用 CMAKE_CXX_STANDARD

```cmake
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
```

这种写法会作为默认值影响后续 target，但现代项目更推荐 target 级别配置。

### 17.3 禁用编译器扩展

```cmake
set_target_properties(core PROPERTIES
    CXX_EXTENSIONS OFF
)
```

避免使用 `gnu++20`，尽量使用标准 `c++20`。

### 17.4 C 标准

```cmake
target_compile_features(clib PUBLIC c_std_11)
```

或：

```cmake
set_target_properties(clib PROPERTIES
    C_STANDARD 11
    C_STANDARD_REQUIRED ON
    C_EXTENSIONS OFF
)
```

## 18. 编译选项、宏定义与链接选项

### 18.1 target_compile_options

```cmake
target_compile_options(core PRIVATE
    $<$<CXX_COMPILER_ID:MSVC>:/W4>
    $<$<NOT:$<CXX_COMPILER_ID:MSVC>>:-Wall -Wextra -Wpedantic>
)
```

### 18.2 target_compile_definitions

```cmake
target_compile_definitions(core
    PUBLIC CORE_ENABLE_LOGGING
    PRIVATE CORE_BUILDING_LIBRARY
)
```

会生成：

```text
-DCORE_ENABLE_LOGGING
```

或 MSVC：

```text
/DCORE_ENABLE_LOGGING
```

### 18.3 target_link_options

```cmake
target_link_options(app PRIVATE
    $<$<CXX_COMPILER_ID:MSVC>:/DEBUG>
    $<$<NOT:$<CXX_COMPILER_ID:MSVC>>:-Wl,--as-needed>
)
```

### 18.4 不推荐全局 CMAKE_CXX_FLAGS

不推荐：

```cmake
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall")
```

原因：

- 影响所有 target。
- Debug / Release 处理复杂。
- 导出 target 时不清晰。
- 和工具链文件、IDE 配置容易冲突。

## 19. 链接库 target_link_libraries

### 19.1 链接项目内部库

```cmake
add_library(core src/core.cpp)
add_executable(app src/main.cpp)

target_link_libraries(app PRIVATE core)
```

### 19.2 链接第三方库

```cmake
find_package(fmt CONFIG REQUIRED)

target_link_libraries(app PRIVATE fmt::fmt)
```

### 19.3 链接系统库

```cmake
target_link_libraries(app PRIVATE pthread)
```

更可移植的线程库：

```cmake
find_package(Threads REQUIRED)
target_link_libraries(app PRIVATE Threads::Threads)
```

### 19.4 用 target 表达依赖

推荐：

```cmake
target_link_libraries(app PRIVATE fmt::fmt)
```

不推荐：

```cmake
target_include_directories(app PRIVATE /path/to/fmt/include)
target_link_directories(app PRIVATE /path/to/fmt/lib)
target_link_libraries(app PRIVATE fmt)
```

如果依赖提供 imported target，应优先使用。

## 20. 源文件组织与 target_sources

### 20.1 直接在 add_library 中列源码

```cmake
add_library(core
    src/core.cpp
    src/log.cpp
)
```

### 20.2 使用 target_sources

```cmake
add_library(core)

target_sources(core
    PRIVATE
        src/core.cpp
        src/log.cpp
    PUBLIC
        FILE_SET HEADERS
        BASE_DIRS include
        FILES
            include/core/core.hpp
            include/core/log.hpp
)
```

`FILE_SET HEADERS` 对安装和导出头文件更友好。

### 20.3 不推荐 file(GLOB)

不推荐：

```cmake
file(GLOB SOURCES src/*.cpp)
add_library(core ${SOURCES})
```

原因：

```text
新增源码文件时，CMake 未必自动重新配置。
```

如果确实使用，可加：

```cmake
file(GLOB CONFIGURE_DEPENDS SOURCES src/*.cpp)
```

但大型项目仍推荐显式列出源文件。

## 21. 生成器与构建类型

### 21.1 查看可用生成器

```bash
cmake --help
```

### 21.2 常见生成器

| 生成器 | 说明 |
| :--- | :--- |
| `Ninja` | 推荐，单配置，快速 |
| `Ninja Multi-Config` | Ninja 多配置生成器 |
| `Unix Makefiles` | Linux/macOS 常见 |
| `Visual Studio 17 2022` | Windows Visual Studio 2022 |
| `Xcode` | macOS Xcode |
| `NMake Makefiles` | Windows NMake |

### 21.3 指定生成器

```bash
cmake -S . -B build -G Ninja
```

Windows 使用 Visual Studio 生成器时，推荐先用下面命令查看本机实际支持的生成器名称：

```powershell
cmake --help
```

### 21.4 生成器不能随便切换

同一个 build 目录已经用 Ninja 配置后，不能直接切到 Visual Studio。

正确处理：

```bash
rm -rf build
cmake -S . -B build -G "Visual Studio 17 2022"
```

## 22. Debug、Release 与多配置生成器

### 22.1 单配置生成器

Ninja、Unix Makefiles 通常是单配置。

配置时指定：

```bash
cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release
cmake --build build
```

常见类型：

| 类型 | 说明 |
| :--- | :--- |
| `Debug` | 调试，通常带符号，优化少 |
| `Release` | 发布，优化高 |
| `RelWithDebInfo` | 发布优化 + 调试信息 |
| `MinSizeRel` | 优化体积 |

### 22.2 多配置生成器

Visual Studio、Xcode、Ninja Multi-Config 是多配置。

配置时不使用 `CMAKE_BUILD_TYPE`：

```bash
cmake -S . -B build -G "Ninja Multi-Config"
cmake --build build --config Release
```

### 22.3 判断多配置

```cmake
if(CMAKE_CONFIGURATION_TYPES)
    message(STATUS "Multi-config generator")
else()
    message(STATUS "Single-config generator: ${CMAKE_BUILD_TYPE}")
endif()
```

### 22.4 设置默认构建类型

只对单配置生成器有效：

```cmake
if(NOT CMAKE_BUILD_TYPE AND NOT CMAKE_CONFIGURATION_TYPES)
    set(CMAKE_BUILD_TYPE Release CACHE STRING "Build type" FORCE)
endif()
```

## 23. CMakePresets.json

### 23.1 Presets 的作用

`CMakePresets.json` 用于统一配置命令。

好处：

- 团队不用记复杂命令。
- IDE 可读取 preset。
- CI 和本地配置一致。
- 可区分 Debug、Release、工具链、平台。

### 23.2 示例

```json
{
  "version": 6,
  "cmakeMinimumRequired": {
    "major": 3,
    "minor": 25,
    "patch": 0
  },
  "configurePresets": [
    {
      "name": "ninja-debug",
      "displayName": "Ninja Debug",
      "generator": "Ninja",
      "binaryDir": "${sourceDir}/build/debug",
      "cacheVariables": {
        "CMAKE_BUILD_TYPE": "Debug",
        "CMAKE_EXPORT_COMPILE_COMMANDS": "ON",
        "MYPROJECT_BUILD_TESTS": "ON"
      }
    },
    {
      "name": "ninja-release",
      "displayName": "Ninja Release",
      "generator": "Ninja",
      "binaryDir": "${sourceDir}/build/release",
      "cacheVariables": {
        "CMAKE_BUILD_TYPE": "Release",
        "CMAKE_EXPORT_COMPILE_COMMANDS": "ON",
        "MYPROJECT_BUILD_TESTS": "ON"
      }
    }
  ],
  "buildPresets": [
    {
      "name": "debug",
      "configurePreset": "ninja-debug",
      "configuration": "Debug",
      "jobs": 8
    },
    {
      "name": "release",
      "configurePreset": "ninja-release",
      "configuration": "Release",
      "jobs": 8
    }
  ],
  "testPresets": [
    {
      "name": "debug",
      "configurePreset": "ninja-debug",
      "output": {
        "outputOnFailure": true
      }
    }
  ]
}
```

说明：

- `version` 是 Presets 文件格式版本，不是 CMake 项目版本；应根据团队最低 CMake 版本选择。上例使用 `version: 6`，适合以 CMake 3.25+ 作为团队基线的项目。
- `cmakeMinimumRequired` 表示读取该 preset 所需的最低 CMake 版本。
- 单配置生成器主要靠 `CMAKE_BUILD_TYPE`；多配置生成器主要靠 build/test preset 的 `configuration`。
- `jobs` 可以控制并行构建数量，也可以用环境变量 `CMAKE_BUILD_PARALLEL_LEVEL` 控制。

### 23.3 使用 preset

```bash
cmake --preset ninja-debug
cmake --build --preset debug
ctest --preset debug
```

### 23.4 用户本地 preset

```text
CMakeUserPresets.json
```

适合放个人路径、个人工具链、本机特殊配置。

通常不提交：

```text
CMakeUserPresets.json
```

## 24. 依赖管理总览

CMake 依赖管理常见方式：

| 方式 | 说明 | 适合场景 |
| :--- | :--- | :--- |
| `find_package()` | 查找已安装或包管理器提供的依赖 | 系统库、vcpkg、Conan、已安装 SDK |
| `FetchContent` | 配置阶段拉取源码并加入构建 | 小型源码依赖、测试库 |
| `ExternalProject` | 构建阶段构建外部项目 | 隔离复杂第三方工程 |
| git submodule | 把依赖源码放进仓库 | 固定依赖源码 |
| vcpkg | C/C++ 包管理器 | 跨平台依赖 |
| Conan | C/C++ 包管理器 | 企业依赖、二进制包 |

推荐优先级通常是：

```text
包管理器 + find_package
    ↓
FetchContent
    ↓
ExternalProject
```

依赖管理选择建议：

| 问题 | 优先选择 |
| :--- | :--- |
| 团队需要可复现、跨平台依赖 | vcpkg manifest 或 Conan profile |
| 依赖已经由系统或 SDK 安装 | `find_package()` |
| 只想拉取少量源码依赖一起构建 | `FetchContent` |
| 依赖构建系统复杂、需要隔离安装 | `ExternalProject` |
| 公司内部有二进制包和私有仓库 | Conan 或内部包管理体系 |

核心原则：依赖来源要统一，版本要固定，构建产物不要混用 Debug / Release、x86 / x64、不同编译器 ABI。

## 25. find_package

### 25.1 基本用法

```cmake
find_package(fmt CONFIG REQUIRED)

target_link_libraries(app PRIVATE fmt::fmt)
```

### 25.2 Module 模式和 Config 模式

`find_package()` 有两类模式：

| 模式 | 文件形式 | 说明 |
| :--- | :--- | :--- |
| Module 模式 | `FindXXX.cmake` | CMake 自带或项目提供查找脚本 |
| Config 模式 | `XXXConfig.cmake` | 依赖包自己安装导出的配置 |

### 25.3 推荐 Config 模式

```cmake
find_package(fmt CONFIG REQUIRED)
```

原因：

- 依赖自己知道如何被使用。
- 通常提供 imported target。
- 更适合现代 CMake。

### 25.4 REQUIRED

```cmake
find_package(OpenSSL REQUIRED)
```

找不到就配置失败。

### 25.5 COMPONENTS

```cmake
find_package(Qt6 REQUIRED COMPONENTS Widgets Network)
```

### 25.6 CMAKE_PREFIX_PATH

如果依赖安装在非标准路径：

```bash
cmake -S . -B build -DCMAKE_PREFIX_PATH=/path/to/install
```

Windows：

```powershell
cmake -S . -B build -DCMAKE_PREFIX_PATH="C:/libs/fmt"
```

### 25.7 常见错误

```text
Could not find a package configuration file provided by "fmt"
```

处理：

- 确认依赖已安装。
- 设置 `CMAKE_PREFIX_PATH`。
- 使用 vcpkg / Conan toolchain。
- 检查包名大小写。
- 检查是否需要 `CONFIG`。

## 26. FetchContent

### 26.1 基本用法

```cmake
include(FetchContent)

FetchContent_Declare(
    fmt
    GIT_REPOSITORY https://github.com/fmtlib/fmt.git
    GIT_TAG 11.0.2
)

FetchContent_MakeAvailable(fmt)

target_link_libraries(app PRIVATE fmt::fmt)
```

### 26.2 适合场景

适合：

- 小型源码依赖。
- 测试依赖，如 googletest。
- 你希望依赖和项目一起构建。

不适合：

- 大型复杂依赖。
- 需要系统级安装的依赖。
- 构建时间很长的依赖。

### 26.3 固定版本

不要使用浮动分支：

```cmake
GIT_TAG main
```

推荐 tag 或 commit：

```cmake
GIT_TAG 11.0.2
```

更严格可用 commit hash。

### 26.4 FetchContent 与 find_package 集成

现代项目可考虑：

```cmake
FetchContent_Declare(
    fmt
    GIT_REPOSITORY https://github.com/fmtlib/fmt.git
    GIT_TAG 11.0.2
    FIND_PACKAGE_ARGS CONFIG
)
```

这样可优先查找已安装包，再按需要获取源码。

也可以让 FetchContent 提供一个包给后续 `find_package()` 使用：

```cmake
FetchContent_Declare(
    fmt
    GIT_REPOSITORY https://github.com/fmtlib/fmt.git
    GIT_TAG 11.0.2
    OVERRIDE_FIND_PACKAGE
)

FetchContent_MakeAvailable(fmt)
find_package(fmt CONFIG REQUIRED)
```

注意：不要在公共库中无条件强制下载第三方依赖。公共库更推荐表达自己的依赖需求，让最终应用或包管理器决定依赖来源。

## 27. ExternalProject

### 27.1 基本概念

`ExternalProject` 在构建阶段下载、配置、构建、安装外部项目。

```cmake
include(ExternalProject)

ExternalProject_Add(third_party_demo
    GIT_REPOSITORY https://example.com/demo.git
    GIT_TAG v1.0.0
    CMAKE_ARGS
        -DCMAKE_INSTALL_PREFIX=<INSTALL_DIR>
)
```

### 27.2 与 FetchContent 区别

| 对比 | FetchContent | ExternalProject |
| :--- | :--- | :--- |
| 拉取时机 | 配置阶段 | 构建阶段 |
| 是否加入同一构建 | 是 | 通常否 |
| target 可见性 | 直接可见 | 需要手动导入 |
| 适合 | 小型源码依赖 | 大型复杂依赖 |

### 27.3 使用建议

ExternalProject 更适合：

- 构建外部工具。
- 构建和主项目隔离的大型依赖。
- 第三方项目 CMake 配置复杂，不想污染主项目。

## 28. vcpkg 与 Conan

### 28.1 vcpkg

使用 toolchain：

```bash
cmake -S . -B build ^
  -DCMAKE_TOOLCHAIN_FILE=C:/vcpkg/scripts/buildsystems/vcpkg.cmake
```

Linux/macOS：

```bash
cmake -S . -B build \
  -DCMAKE_TOOLCHAIN_FILE=$VCPKG_ROOT/scripts/buildsystems/vcpkg.cmake
```

然后：

```cmake
find_package(fmt CONFIG REQUIRED)
target_link_libraries(app PRIVATE fmt::fmt)
```

### 28.2 vcpkg manifest

`vcpkg.json`：

```json
{
  "name": "demo",
  "version": "1.0.0",
  "dependencies": [
    "fmt",
    "spdlog"
  ]
}
```

### 28.3 Conan

Conan 2 常见流程：

```bash
conan install . --output-folder=build --build=missing
cmake -S . -B build -DCMAKE_TOOLCHAIN_FILE=build/conan_toolchain.cmake
cmake --build build
```

CMake 中：

```cmake
find_package(fmt CONFIG REQUIRED)
target_link_libraries(app PRIVATE fmt::fmt)
```

### 28.4 包管理器原则

不要同时混用太多依赖来源：

- 一部分系统安装
- 一部分 FetchContent
- 一部分 vcpkg
- 一部分 Conan
- 一部分手动路径

大型项目应统一依赖策略。

## 29. 安装 install

安装路径推荐先引入 `GNUInstallDirs`，不要把 `bin`、`lib`、`include` 全部硬编码死：

```cmake
include(GNUInstallDirs)
```

常用变量：

| 变量 | 常见值 | 含义 |
| :--- | :--- | :--- |
| `CMAKE_INSTALL_BINDIR` | `bin` | 可执行文件目录 |
| `CMAKE_INSTALL_LIBDIR` | `lib` 或 `lib64` | 库目录 |
| `CMAKE_INSTALL_INCLUDEDIR` | `include` | 头文件目录 |
| `CMAKE_INSTALL_DATADIR` | `share` | 数据文件目录 |

### 29.1 安装可执行文件

```cmake
install(TARGETS app
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
)
```

### 29.2 安装库

```cmake
install(TARGETS core
    EXPORT MyProjectTargets
    ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR}
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
)
```

说明：

| 类型 | 平台/产物 | 目的地 |
| :--- | :--- | :--- |
| `ARCHIVE` | 静态库 `.a` / `.lib` | `lib` |
| `LIBRARY` | 动态库 `.so` / `.dylib` | `lib` |
| `RUNTIME` | 可执行文件 / Windows `.dll` | `bin` |

### 29.3 安装头文件

使用 FILE_SET：

```cmake
target_sources(core
    PUBLIC
        FILE_SET HEADERS
        BASE_DIRS include
        FILES include/core/core.hpp
)

install(TARGETS core
    EXPORT MyProjectTargets
    FILE_SET HEADERS DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}
    ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR}
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
)
```

### 29.4 执行安装

```bash
cmake --install build --prefix install
```

多配置：

```bash
cmake --install build --config Release --prefix install
```

### 29.5 CMAKE_INSTALL_PREFIX

配置时指定：

```bash
cmake -S . -B build -DCMAKE_INSTALL_PREFIX=/opt/myproject
```

安装：

```bash
cmake --install build
```

## 30. 导出 targets 与生成 Config 包

### 30.1 为什么要导出包

如果你的库要被别人这样使用：

```cmake
find_package(MyProject CONFIG REQUIRED)
target_link_libraries(app PRIVATE MyProject::core)
```

你需要安装并导出 CMake package。

### 30.2 导出 targets

```cmake
install(TARGETS core
    EXPORT MyProjectTargets
    FILE_SET HEADERS DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}
    ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR}
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
)

install(EXPORT MyProjectTargets
    NAMESPACE MyProject::
    DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/MyProject
)
```

### 30.3 生成 Config 文件

目录：

```text
cmake/MyProjectConfig.cmake.in
```

内容：

```cmake
@PACKAGE_INIT@

include(CMakeFindDependencyMacro)
find_dependency(fmt CONFIG)

include("${CMAKE_CURRENT_LIST_DIR}/MyProjectTargets.cmake")
```

如果 `MyProject::core` 的 public 接口依赖 `fmt::fmt`，Config 文件里应该用 `find_dependency()` 转发这个依赖。否则消费者 `find_package(MyProject CONFIG REQUIRED)` 成功后，链接 `MyProject::core` 时可能找不到 `fmt::fmt`。

`CMakeLists.txt`：

```cmake
include(CMakePackageConfigHelpers)

configure_package_config_file(
    cmake/MyProjectConfig.cmake.in
    "${CMAKE_CURRENT_BINARY_DIR}/MyProjectConfig.cmake"
    INSTALL_DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/MyProject
)

write_basic_package_version_file(
    "${CMAKE_CURRENT_BINARY_DIR}/MyProjectConfigVersion.cmake"
    VERSION ${PROJECT_VERSION}
    COMPATIBILITY SameMajorVersion
)

install(FILES
    "${CMAKE_CURRENT_BINARY_DIR}/MyProjectConfig.cmake"
    "${CMAKE_CURRENT_BINARY_DIR}/MyProjectConfigVersion.cmake"
    DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/MyProject
)
```

### 30.4 使用已安装包

```bash
cmake -S consumer -B consumer/build -DCMAKE_PREFIX_PATH=/path/to/install
```

消费者：

```cmake
find_package(MyProject CONFIG REQUIRED)
target_link_libraries(consumer PRIVATE MyProject::core)
```

## 31. 测试 CTest

### 31.1 启用测试

```cmake
include(CTest)
```

或：

```cmake
enable_testing()
```

推荐顶层使用 `include(CTest)`，它会提供标准选项 `BUILD_TESTING`。

### 31.2 添加测试

```cmake
add_executable(core_test tests/core_test.cpp)
target_link_libraries(core_test PRIVATE core)

add_test(NAME core_test COMMAND core_test)
```

### 31.3 运行测试

```bash
ctest --test-dir build
```

或：

```bash
cmake --build build
ctest --test-dir build --output-on-failure
```

### 31.4 多配置测试

```bash
ctest --test-dir build -C Release --output-on-failure
```

### 31.5 GoogleTest

```cmake
include(FetchContent)

FetchContent_Declare(
    googletest
    URL https://github.com/google/googletest/archive/refs/tags/v1.15.2.zip
)
FetchContent_MakeAvailable(googletest)

add_executable(core_test tests/core_test.cpp)
target_link_libraries(core_test PRIVATE core GTest::gtest_main)

include(GoogleTest)
gtest_discover_tests(core_test)
```

### 31.6 测试属性

```cmake
set_tests_properties(core_test PROPERTIES
    TIMEOUT 10
    LABELS "unit"
)
```

按标签运行：

```bash
ctest --test-dir build -L unit
```

## 32. 自定义命令和自定义目标

### 32.1 add_custom_command 生成文件

```cmake
add_custom_command(
    OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/generated.hpp
    COMMAND codegen --output ${CMAKE_CURRENT_BINARY_DIR}/generated.hpp
    DEPENDS codegen input.idl
    VERBATIM
)
```

然后把生成文件加入 target：

```cmake
target_sources(core PRIVATE ${CMAKE_CURRENT_BINARY_DIR}/generated.hpp)
```

### 32.2 add_custom_target

```cmake
add_custom_target(format
        COMMAND clang-format -i ${PROJECT_SOURCE_DIR}/src/*.cpp
        WORKING_DIRECTORY ../../../..
        VERBATIM
)
```

执行：

```bash
cmake --build build --target format
```

### 32.3 OUTPUT 与 BYPRODUCTS

如果命令还生成副产物：

```cmake
add_custom_command(
    OUTPUT main_generated.cpp
    BYPRODUCTS main_generated.hpp
    COMMAND generator_tool
    VERBATIM
)
```

### 32.4 VERBATIM

推荐总是加：

```cmake
VERBATIM
```

它能让参数转义更可靠。

## 33. 生成文件与代码生成

### 33.1 configure_file

输入：

```cpp
// config.hpp.in
#pragma once

#define PROJECT_VERSION "@PROJECT_VERSION@"
```

CMake：

```cmake
configure_file(
    ${CMAKE_CURRENT_SOURCE_DIR}/config.hpp.in
    ${CMAKE_CURRENT_BINARY_DIR}/generated/config.hpp
    @ONLY
)

target_include_directories(app PRIVATE
    ${CMAKE_CURRENT_BINARY_DIR}/generated
)
```

### 33.2 file(GENERATE)

`file(GENERATE)` 支持生成器表达式，生成阶段写文件。

```cmake
file(GENERATE
    OUTPUT "${CMAKE_CURRENT_BINARY_DIR}/config-$<CONFIG>.txt"
    CONTENT "config=$<CONFIG>\n"
)
```

### 33.3 代码生成原则

生成文件应放在构建目录：

```text
${CMAKE_CURRENT_BINARY_DIR}
```

不要写回源码目录，避免污染源码。

## 34. Generator Expressions

### 34.1 生成器表达式是什么

Generator Expression 在生成阶段或构建阶段求值。

形式：

```cmake
$<...>
```

### 34.2 按配置区分

```cmake
target_compile_definitions(app PRIVATE
    $<$<CONFIG:Debug>:APP_DEBUG>
)
```

Debug 时添加：

```text
APP_DEBUG
```

### 34.3 按编译器区分

```cmake
target_compile_options(app PRIVATE
    $<$<CXX_COMPILER_ID:MSVC>:/W4>
    $<$<CXX_COMPILER_ID:GNU,Clang>:-Wall -Wextra>
)
```

### 34.4 BUILD_INTERFACE / INSTALL_INTERFACE

```cmake
target_include_directories(core PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>
)
```

### 34.5 常见表达式

| 表达式 | 说明 |
| :--- | :--- |
| `$<CONFIG:Debug>` | 当前配置是否 Debug |
| `$<CXX_COMPILER_ID:MSVC>` | C++ 编译器是否 MSVC |
| `$<TARGET_FILE:app>` | target 输出文件路径 |
| `$<TARGET_PROPERTY:tgt,PROP>` | target 属性 |
| `$<BUILD_INTERFACE:...>` | 构建树用法 |
| `$<INSTALL_INTERFACE:...>` | 安装树用法 |

## 35. Toolchain 文件与交叉编译

### 35.1 Toolchain 文件是什么

Toolchain 文件描述：

- 目标系统
- 编译器
- sysroot
- 查找路径
- 编译器前缀
- 平台相关配置

### 35.2 基本示例

`toolchains/arm-linux.cmake`：

```cmake
set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_SYSTEM_PROCESSOR arm)

set(CMAKE_C_COMPILER arm-linux-gnueabihf-gcc)
set(CMAKE_CXX_COMPILER arm-linux-gnueabihf-g++)

set(CMAKE_SYSROOT /path/to/sysroot)

set(CMAKE_FIND_ROOT_PATH /path/to/sysroot)

set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_PACKAGE ONLY)
```

使用：

```bash
cmake -S . -B build-arm -DCMAKE_TOOLCHAIN_FILE=toolchains/arm-linux.cmake
```

### 35.3 Toolchain 必须在首次配置时指定

不要在已有 build 目录中切换 toolchain。

正确做法：

```bash
rm -rf build-arm
cmake -S . -B build-arm -DCMAKE_TOOLCHAIN_FILE=toolchains/arm-linux.cmake
```

### 35.4 Android NDK

示意：

```bash
cmake -S . -B build-android \
  -DCMAKE_TOOLCHAIN_FILE=$ANDROID_NDK/build/cmake/android.toolchain.cmake \
  -DANDROID_ABI=arm64-v8a \
  -DANDROID_PLATFORM=android-24
```

具体以 Android NDK 官方文档为准。

## 36. 嵌入式 CMake 常见配置

### 36.1 裸机工具链示例

```cmake
set(CMAKE_SYSTEM_NAME Generic)
set(CMAKE_SYSTEM_PROCESSOR arm)

set(CMAKE_C_COMPILER arm-none-eabi-gcc)
set(CMAKE_CXX_COMPILER arm-none-eabi-g++)
set(CMAKE_ASM_COMPILER arm-none-eabi-gcc)

set(CMAKE_TRY_COMPILE_TARGET_TYPE STATIC_LIBRARY)
```

`CMAKE_TRY_COMPILE_TARGET_TYPE` 很重要，因为裸机环境通常不能链接可执行文件做检测。

### 36.2 启用 ASM

```cmake
project(EmbeddedDemo LANGUAGES C CXX ASM)
```

### 36.3 链接脚本

```cmake
target_link_options(firmware PRIVATE
    -T${CMAKE_SOURCE_DIR}/linker.ld
)
```

### 36.4 生成 hex / bin

```cmake
add_custom_command(TARGET firmware POST_BUILD
    COMMAND arm-none-eabi-objcopy -O ihex
        $<TARGET_FILE:firmware>
        ${CMAKE_CURRENT_BINARY_DIR}/firmware.hex
    COMMAND arm-none-eabi-objcopy -O binary
        $<TARGET_FILE:firmware>
        ${CMAKE_CURRENT_BINARY_DIR}/firmware.bin
    VERBATIM
)
```

### 36.5 嵌入式项目注意

- 工具链文件必须清晰。
- 不要依赖宿主机系统库。
- 编译选项按 target 设置。
- 链接脚本路径用绝对路径或明确相对路径。
- 生成产物放 build 目录。
- Debug / Release 选项要区分。

## 37. Qt 项目 CMake 基础

### 37.1 Qt6 基本项目

```cmake
cmake_minimum_required(VERSION 3.21)

project(QtDemo LANGUAGES CXX)

set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

find_package(Qt6 REQUIRED COMPONENTS Widgets)

add_executable(qtdemo
    main.cpp
    mainwindow.cpp
    mainwindow.hpp
    mainwindow.ui
)

target_link_libraries(qtdemo PRIVATE Qt6::Widgets)
```

### 37.2 CMAKE_PREFIX_PATH

如果找不到 Qt：

```bash
cmake -S . -B build -DCMAKE_PREFIX_PATH=C:/Qt/6.8.0/msvc2022_64
```

### 37.3 Qt 常见组件

```cmake
find_package(Qt6 REQUIRED COMPONENTS
    Core
    Gui
    Widgets
    Network
    Qml
    Quick
)
```

链接：

```cmake
target_link_libraries(app PRIVATE
    Qt6::Core
    Qt6::Widgets
    Qt6::Network
)
```

## 38. RPATH、运行时库与动态库部署

### 38.1 什么是 RPATH

RPATH 是可执行文件或动态库中记录的运行时库查找路径。

Linux/macOS 动态库加载时会用到。

### 38.2 构建树 RPATH

CMake 通常会自动处理构建树中的 RPATH，让 build 目录中的程序能运行。

### 38.3 安装树 RPATH

示例：

```cmake
set(CMAKE_INSTALL_RPATH "$ORIGIN/../lib")
```

macOS 常用：

```cmake
set(CMAKE_INSTALL_RPATH "@loader_path/../lib")
```

### 38.4 Windows DLL

Windows 没有 RPATH，运行时需要 DLL 在：

- exe 同目录
- PATH 中
- 系统目录

可以安装运行时依赖：

```cmake
install(TARGETS app
    RUNTIME_DEPENDENCIES
        PRE_EXCLUDE_REGEXES "api-ms-" "ext-ms-"
        POST_EXCLUDE_REGEXES ".*system32/.*\\.dll"
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
)
```

实际部署要结合依赖来源和平台策略。

## 39. 预编译头、Unity Build 与 IPO/LTO

### 39.1 预编译头

```cmake
target_precompile_headers(core PRIVATE
    <vector>
    <string>
    <memory>
    "include/core/pch.hpp"
)
```

适合大型 C++ 项目，但不要把变化频繁的头放入 PCH。

### 39.2 Unity Build

```cmake
set_target_properties(core PROPERTIES
    UNITY_BUILD ON
)
```

作用：

```text
把多个源文件合并编译，减少编译开销。
```

风险：

- 暴露源文件之间的隐式依赖。
- 可能出现宏污染。
- 可能改变编译行为。

### 39.3 IPO / LTO

```cmake
include(CheckIPOSupported)
check_ipo_supported(RESULT ipo_supported OUTPUT ipo_error)

if(ipo_supported)
    set_property(TARGET core PROPERTY INTERPROCEDURAL_OPTIMIZATION TRUE)
endif()
```

适合 Release 构建优化。

## 40. CPack 打包

### 40.1 基本用法

```cmake
include(CPack)
```

构建安装包：

```bash
cmake --build build --target package
```

或：

```bash
cpack --config build/CPackConfig.cmake
```

### 40.2 常见配置

```cmake
set(CPACK_PACKAGE_NAME "MyProject")
set(CPACK_PACKAGE_VENDOR "Example")
set(CPACK_PACKAGE_VERSION ${PROJECT_VERSION})
set(CPACK_PACKAGE_CONTACT "dev@example.com")

include(CPack)
```

### 40.3 指定生成器

```bash
cpack -G ZIP --config build/CPackConfig.cmake
cpack -G TGZ --config build/CPackConfig.cmake
```

常见生成器：

- ZIP
- TGZ
- DEB
- RPM
- NSIS
- WIX

## 41. CI/CD 中使用 CMake

### 41.1 推荐基础流程

```bash
cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release
cmake --build build --parallel
ctest --test-dir build --output-on-failure
cmake --install build --prefix install
```

### 41.2 GitHub Actions 示例

```yaml
name: Build

on:
  push:
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Install tools
        run: sudo apt-get update && sudo apt-get install -y ninja-build

      - name: Configure
        run: cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release

      - name: Build
        run: cmake --build build --parallel

      - name: Test
        run: ctest --test-dir build --output-on-failure
```

### 41.3 使用 Presets 的 CI

```bash
cmake --preset ninja-release
cmake --build --preset release
ctest --preset release
```

### 41.4 CI 最佳实践

- 使用 out-of-source build。
- 使用 Ninja。
- 固定 CMake 版本。
- 固定编译器版本。
- 使用 Presets 统一本地和 CI。
- 测试使用 `--output-on-failure`。
- 缓存包管理器目录，而不是缓存整个 build 目录。
- Release 构建与 Debug 构建都要覆盖。

## 42. 常见错误排查

### 42.1 Could not find CMAKE_CXX_COMPILER

原因：

- 没安装编译器。
- 编译器不在 PATH。
- Visual Studio 工具链没初始化。
- toolchain 文件写错。

排查：

```bash
cmake --version
c++ --version
gcc --version
clang++ --version
```

Windows：

- 使用 Developer PowerShell for VS。
- 检查 Visual Studio 是否安装 C++ workload。

### 42.2 Generator 不匹配

错误：

```text
Error: generator ... does not match the generator used previously
```

原因：

```text
同一个 build 目录切换了生成器。
```

解决：

```bash
rm -rf build
cmake -S . -B build -G Ninja
```

### 42.3 find_package 找不到依赖

错误：

```text
Could not find a package configuration file provided by ...
```

排查：

```bash
cmake -S . -B build -DCMAKE_PREFIX_PATH=/path/to/package
```

检查：

- 包是否安装。
- `XXXConfig.cmake` 是否存在。
- `CMAKE_PREFIX_PATH` 是否正确。
- 是否使用了正确架构。
- Debug/Release 库是否匹配。

### 42.4 include 头文件找不到

原因：

- 没有 `target_include_directories`。
- include 路径用错。
- `PRIVATE` / `PUBLIC` 写错。
- 安装导出时缺少 `INSTALL_INTERFACE`。

排查：

```bash
cmake --build build --verbose
```

或 Ninja：

```bash
ninja -C build -v
```

### 42.5 链接错误 undefined reference

常见原因：

- 没链接库。
- 链接顺序问题。
- C / C++ ABI 不匹配。
- 静态库缺依赖。
- 函数声明和定义不一致。

处理：

```cmake
target_link_libraries(app PRIVATE core)
```

如果 `core` 的 public API 依赖 `fmt`：

```cmake
target_link_libraries(core PUBLIC fmt::fmt)
```

### 42.6 Windows LNK2019

本质是未解析外部符号。

检查：

- 是否链接对应 `.lib`。
- 导出宏是否正确。
- Debug/Release 是否混用。
- x86/x64 是否混用。
- 函数签名是否一致。

### 42.7 运行时找不到动态库

Linux：

```bash
ldd ./app
```

macOS：

```bash
otool -L ./app
```

Windows：

- 检查 DLL 是否在 exe 同目录。
- 检查 PATH。
- 使用 dumpbin 或 Dependencies 工具。

### 42.8 修改 CMakeLists 后没有生效

CMake 通常会自动重新配置，但如果异常：

```bash
cmake -S . -B build
cmake --build build
```

必要时删除 build 目录。

### 42.9 CMakeCache 导致配置混乱

现象：

- 改了变量但没生效。
- 切换编译器失败。
- 切换 toolchain 失败。

处理：

```bash
rm -rf build
```

重新配置。

### 42.10 快速排查流程

遇到 CMake 问题时，不要只盯着最后一行错误。按下面顺序查：

1. 确认工具版本：`cmake --version`、编译器版本、Ninja/Visual Studio 版本。
2. 确认生成器：`cmake --help` 查看本机可用生成器，检查 build 目录是否复用了旧生成器。
3. 确认配置参数：查看 `build/CMakeCache.txt`，重点看 `CMAKE_BUILD_TYPE`、`CMAKE_PREFIX_PATH`、`CMAKE_TOOLCHAIN_FILE`、编译器路径。
4. 确认 target 关系：检查依赖是否通过 `target_link_libraries()` 连接，include 是否用 `PUBLIC` / `PRIVATE` 正确表达。
5. 确认依赖来源：系统安装、vcpkg、Conan、FetchContent 不要混乱叠加。
6. 确认构建命令：使用 `cmake --build build --verbose` 或 `ninja -C build -v` 查看真实编译和链接命令。
7. 确认运行时依赖：Linux 用 `ldd`，macOS 用 `otool -L`，Windows 检查 DLL 是否在 exe 同目录或 PATH 中。

常用调试命令：

```bash
cmake -S . -B build --debug-find
cmake -S . -B build --trace-expand
cmake --build build --verbose
ctest --test-dir build --output-on-failure
```

## 43. 现代 CMake 最佳实践

### 43.1 使用 out-of-source build

推荐：

```bash
cmake -S . -B build
```

### 43.2 围绕 target 配置

推荐：

```cmake
target_include_directories()
target_compile_options()
target_compile_definitions()
target_link_libraries()
target_sources()
```

少用：

```cmake
include_directories()
link_directories()
add_definitions()
set(CMAKE_CXX_FLAGS ...)
```

### 43.3 使用命名空间 target

```cmake
add_library(MyProject::core ALIAS core)
```

第三方依赖也优先使用：

```cmake
fmt::fmt
Qt6::Widgets
Threads::Threads
```

### 43.4 正确使用 PRIVATE / PUBLIC / INTERFACE

判断标准：

```text
是否影响当前 target？
是否需要传递给消费者？
```

### 43.5 不把生成文件写入源码目录

生成文件应放：

```cmake
${CMAKE_CURRENT_BINARY_DIR}
```

### 43.6 使用 Presets

推荐提交：

```text
CMakePresets.json
```

本机配置写：

```text
CMakeUserPresets.json
```

### 43.7 固定依赖版本

不要使用浮动分支：

```cmake
GIT_TAG main
```

推荐：

```cmake
GIT_TAG v1.2.3
```

或 commit hash。

### 43.8 公开库要支持安装和 find_package

如果库要给别人用，应提供：

- install rules
- exported targets
- `MyProjectConfig.cmake`
- `MyProjectConfigVersion.cmake`
- 正确的 `BUILD_INTERFACE` / `INSTALL_INTERFACE`

### 43.9 最低版本不要过低

不要为了兼容写：

```cmake
cmake_minimum_required(VERSION 2.8)
```

这会带来旧 policy 和旧行为。

根据项目实际选择合理版本。

### 43.10 不要在顶层强行改用户环境

谨慎设置：

- 编译器
- 系统路径
- 全局 flags
- `CMAKE_INSTALL_PREFIX`
- `CMAKE_BUILD_TYPE`

这些应尽量由 preset、toolchain、命令行或用户选择。

## 44. 学习路线

### 阶段 1：会构建项目

掌握：

- `cmake -S . -B build`
- `cmake --build build`
- `ctest --test-dir build`
- out-of-source build
- Ninja 生成器

### 阶段 2：理解 CMakeLists

掌握：

- `cmake_minimum_required`
- `project`
- `add_executable`
- `add_library`
- `add_subdirectory`
- `message`
- `option`

### 阶段 3：理解 target

掌握：

- `target_link_libraries`
- `target_include_directories`
- `target_compile_features`
- `target_compile_options`
- `target_compile_definitions`
- `PRIVATE` / `PUBLIC` / `INTERFACE`

### 阶段 4：理解依赖

掌握：

- `find_package`
- Config 模式
- imported target
- `CMAKE_PREFIX_PATH`
- FetchContent
- vcpkg / Conan

### 阶段 5：理解工程化

掌握：

- `CMakePresets.json`
- install
- export
- package config
- CTest
- CPack
- CI/CD

### 阶段 6：高级能力

掌握：

- generator expressions
- custom command
- toolchain
- cross compile
- RPATH
- PCH
- IPO/LTO
- multi-config generator

## 45. 命令速查

### 45.1 版本和帮助

```bash
cmake --version
cmake --help
cmake --help-command add_library
cmake --help-variable CMAKE_BUILD_TYPE
cmake --help-property INTERFACE_INCLUDE_DIRECTORIES
cmake --help-module FindThreads
```

### 45.2 配置

```bash
cmake -S . -B build
cmake -S . -B build -G Ninja
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake -S . -B build -DCMAKE_INSTALL_PREFIX=install
```

### 45.3 构建

```bash
cmake --build build
cmake --build build --parallel
cmake --build build --target app
cmake --build build --config Release
```

### 45.4 安装

```bash
cmake --install build
cmake --install build --prefix install
cmake --install build --config Release --prefix install
```

### 45.5 测试

```bash
ctest --test-dir build
ctest --test-dir build --output-on-failure
ctest --test-dir build -C Release --output-on-failure
ctest --test-dir build -R core
ctest --test-dir build -L unit
```

### 45.6 Presets

```bash
cmake --list-presets
cmake --preset ninja-debug
cmake --build --preset debug
ctest --preset debug
```

### 45.7 查找和调试

```bash
cmake -S . -B build --trace
cmake -S . -B build --trace-expand
cmake -S . -B build --debug-find
cmake --build build --verbose
```

### 45.8 打包

```bash
cmake --build build --target package
cpack --config build/CPackConfig.cmake
cpack -G ZIP --config build/CPackConfig.cmake
```

## 46. 参考资料与扩展阅读

建议优先阅读 CMake 官方文档，再结合社区实践文章排查真实项目问题。

官方资料：

- [CMake Download](https://cmake.org/download/)
- [CMake Reference Documentation](https://cmake.org/cmake/help/latest/)
- [CMake Tutorial](https://cmake.org/cmake/help/latest/guide/tutorial/index.html)
- [cmake(1)](https://cmake.org/cmake/help/latest/manual/cmake.1.html)
- [ctest(1)](https://cmake.org/cmake/help/latest/manual/ctest.1.html)
- [cpack(1)](https://cmake.org/cmake/help/latest/manual/cpack.1.html)
- [cmake-buildsystem(7)](https://cmake.org/cmake/help/latest/manual/cmake-buildsystem.7.html)
- [cmake-commands(7)](https://cmake.org/cmake/help/latest/manual/cmake-commands.7.html)
- [cmake-language(7)](https://cmake.org/cmake/help/latest/manual/cmake-language.7.html)
- [cmake-packages(7)](https://cmake.org/cmake/help/latest/manual/cmake-packages.7.html)
- [cmake-presets(7)](https://cmake.org/cmake/help/latest/manual/cmake-presets.7.html)
- [cmake-toolchains(7)](https://cmake.org/cmake/help/latest/manual/cmake-toolchains.7.html)
- [cmake-generator-expressions(7)](https://cmake.org/cmake/help/latest/manual/cmake-generator-expressions.7.html)
- [FetchContent](https://cmake.org/cmake/help/latest/module/FetchContent.html)
- [GNUInstallDirs](https://cmake.org/cmake/help/latest/module/GNUInstallDirs.html)
- [CMakePackageConfigHelpers](https://cmake.org/cmake/help/latest/module/CMakePackageConfigHelpers.html)
- [CMake Release Notes](https://cmake.org/cmake/help/latest/release/index.html)

实践参考：

- [Modern CMake](https://cliutils.gitlab.io/modern-cmake/)
- [CGold CMake tutorial](https://cgold.readthedocs.io/en/latest/)
- [vcpkg documentation](https://learn.microsoft.com/vcpkg/)
- [Conan documentation](https://docs.conan.io/)
- [Qt CMake manual](https://doc.qt.io/qt-6/cmake-manual.html)
- [Android NDK CMake guide](https://developer.android.com/ndk/guides/cmake)

中文实践检索关键词：

- `CMake PRIVATE PUBLIC INTERFACE 现代 CMake`
- `CMake find_package CMAKE_PREFIX_PATH 找不到包`
- `CMake FetchContent vcpkg Conan 依赖管理`
- `CMake CMakeCache generator does not match`
- `CMake install export Config.cmake 教程`

## 最后总结

CMake 的核心可以浓缩为：

```text
CMakeLists.txt 描述项目
cmake -S -B 配置和生成构建系统
cmake --build 调用真正的构建工具
target 是现代 CMake 的核心
PRIVATE / PUBLIC / INTERFACE 控制用法需求传播
find_package 使用外部依赖
install/export 让库可被别人消费
CTest 负责测试
CPack 负责打包
CMakePresets.json 统一本地、IDE 和 CI 配置
Toolchain 文件负责交叉编译
```

初学 CMake 最重要的不是背命令，而是建立正确模型：

1. 不在源码目录构建。
2. 不用全局变量到处污染。
3. 不用手写编译器命令代替 target 属性。
4. 不把依赖路径硬编码到项目里。
5. 不只让项目能编译，还要让它能测试、安装、导出和被复用。

当你能解释 `target_link_libraries()` 为什么可以传递 include 目录、`PUBLIC` 和 `INTERFACE` 的区别、`find_package()` 为什么找不到包、`CMAKE_BUILD_TYPE` 为什么在 Visual Studio 下不生效、`CMAKE_PREFIX_PATH` 和 toolchain 文件分别解决什么问题时，就已经真正入门现代 CMake。

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

