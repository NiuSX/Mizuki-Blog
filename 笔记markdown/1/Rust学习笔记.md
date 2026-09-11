---
title: Rust 学习笔记
layout: single
toc: true
toc_label: 目录
---

# Rust 学习笔记

## 1. Rust 是什么

Rust 是一门强调 **内存安全、性能、并发** 的系统编程语言。

它的核心目标很明确：

- 在编译期尽量消灭空指针、悬垂引用、数据竞争
- 保持接近 C/C++ 的运行时性能
- 提供现代化的工程工具链

Rust 的关键特性：

- **所有权系统**：用编译器规则管理内存生命周期
- **零成本抽象**：抽象通常不会额外牺牲运行时性能
- **无垃圾回收**：不依赖 GC
- **模式匹配强**：`match`、枚举、解构非常好用
- **工程体验完整**：`cargo`、`rustfmt`、`clippy`、`rustdoc`

---

## 2. 安装与工具链

推荐通过 `rustup` 安装。

常用命令：

```bash
rustup update
cargo new hello_rust
cargo build
cargo run
cargo test
cargo fmt
cargo clippy
```

常见工具：

- `rustc`：Rust 编译器
- `cargo`：构建、依赖、测试、发布工具
- `rustfmt`：格式化代码
- `clippy`：静态检查和代码建议
- `rustdoc`：生成文档

---

## 3. Cargo 项目结构

典型项目：

```text
Cargo.toml
src/
  main.rs
```

库项目常见结构：

```text
Cargo.toml
src/
  lib.rs
```

`Cargo.toml` 负责：

- 包信息
- 依赖声明
- 编译配置
- feature 开关

示例：

```toml
[package]
name = "demo"
version = "0.1.0"
edition = "2021"

[dependencies]
```

---

## 4. Hello World

```rust
fn main() {
    println!("Hello, Rust!");
}
```

`main` 是程序入口。

---

## 5. 变量与可变性

Rust 默认不可变。

```rust
let x = 5;
let mut y = 10;
y = 20;
```

要点：

- `let` 声明变量
- `mut` 表示可变
- 不可变默认更安全，能减少误改

常见做法是先不可变，确实需要时再加 `mut`。

---

## 6. 基本数据类型

### 标量类型

- 整型：`i8 i16 i32 i64 i128 isize`
- 无符号：`u8 u16 u32 u64 u128 usize`
- 浮点：`f32 f64`
- 布尔：`bool`
- 字符：`char`

```rust
let a: i32 = 42;
let b: f64 = 3.14;
let c: bool = true;
let d: char = '中';
```

### 复合类型

#### 元组

```rust
let tup = (1, 2.5, 'a');
let (x, y, z) = tup;
```

#### 数组

```rust
let arr = [1, 2, 3, 4];
let first = arr[0];
```

数组长度固定，元素类型必须一致。

---

## 7. 函数

函数用 `fn` 定义。

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

规则：

- 参数必须标注类型
- 返回值用 `->`
- 末尾表达式没有分号时，作为返回值

---

## 8. 控制流

### if

```rust
let n = 5;
if n > 3 {
    println!("big");
} else {
    println!("small");
}
```

`if` 也可以作为表达式：

```rust
let label = if n > 0 { "positive" } else { "non-positive" };
```

### loop / while / for

```rust
loop {
    break;
}

while false {
}

for i in 0..5 {
    println!("{}", i);
}
```

### match

`match` 是 Rust 的核心能力之一。

```rust
let x = 3;
match x {
    1 => println!("one"),
    2 | 3 => println!("two or three"),
    4..=10 => println!("range"),
    _ => println!("other"),
}
```

---

## 9. 所有权系统

这是 Rust 最重要的部分。

### 三条规则

1. 每个值都有一个所有者
2. 同一时刻只能有一个所有者
3. 所有者离开作用域时，值被释放

### 移动

```rust
let s1 = String::from("hello");
let s2 = s1;
```

`s1` 的所有权移动到 `s2`，`s1` 之后不能再用。

### 克隆

```rust
let s1 = String::from("hello");
let s2 = s1.clone();
```

### Copy

像 `i32`、`bool`、`char` 这类简单值通常实现了 `Copy`，赋值时不会发生移动。

---

## 10. 借用与引用

### 不可变借用

```rust
fn len(s: &String) -> usize {
    s.len()
}
```

### 可变借用

```rust
fn push_world(s: &mut String) {
    s.push_str(" world");
}
```

### 借用规则

- 任意时刻，要么有多个不可变引用
- 要么只有一个可变引用
- 引用必须始终有效

### 切片

```rust
let s = String::from("hello world");
let hello = &s[0..5];
```

切片是对连续数据的一段视图，不拥有数据本身。

---

## 11. 字符串

Rust 中常见字符串类型：

- `String`：可变、堆上分配
- `&str`：字符串切片

```rust
let s1 = String::from("hello");
let s2: &str = "world";
```

常用方法：

```rust
let mut s = String::from("hi");
s.push('!');
s.push_str(" rust");
```

注意：

- `String` 不是 C 风格字符串
- UTF-8 下，中文字符不能随便按字节索引

---

## 12. 结构体

```rust
struct User {
    name: String,
    age: u32,
}
```

创建实例：

```rust
let user = User {
    name: String::from("Alice"),
    age: 20,
};
```

实现方法：

```rust
impl User {
    fn new(name: String, age: u32) -> Self {
        Self { name, age }
    }

    fn greet(&self) {
        println!("Hi, {}", self.name);
    }
}
```

---

## 13. 枚举

枚举适合表示有限状态集合。

```rust
enum Direction {
    Up,
    Down,
    Left,
    Right,
}
```

带数据的枚举：

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
}
```

配合 `match` 使用非常自然。

---

## 14. Option 与 Result

### Option

表示“有值或没有值”。

```rust
let x: Option<i32> = Some(5);
let y: Option<i32> = None;
```

### Result

表示“成功或失败”。

```rust
fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err("divide by zero".into())
    } else {
        Ok(a / b)
    }
}
```

常见处理方式：

```rust
match divide(10.0, 2.0) {
    Ok(v) => println!("{}", v),
    Err(e) => println!("{}", e),
}
```

`?` 可以快速传播错误：

```rust
fn read_file() -> Result<String, std::io::Error> {
    let content = std::fs::read_to_string("a.txt")?;
    Ok(content)
}
```

---

## 15. 模式匹配与解构

Rust 常用模式匹配来拆解数据。

```rust
let (a, b) = (1, 2);
```

结构体解构：

```rust
let User { name, age } = user;
```

简单场景可以用 `if let`：

```rust
if let Some(v) = x {
    println!("{}", v);
}
```

---

## 16. 泛型

泛型让代码适配多种类型。

```rust
fn largest<T: PartialOrd + Copy>(list: &[T]) -> T {
    let mut max = list[0];
    for &item in list {
        if item > max {
            max = item;
        }
    }
    max
}
```

常见约束写法：

```rust
fn print_value<T: std::fmt::Display>(v: T) {
    println!("{}", v);
}
```

---

## 17. Trait

Trait 类似接口，用于定义行为。

```rust
trait Speak {
    fn speak(&self);
}
```

实现 trait：

```rust
impl Speak for User {
    fn speak(&self) {
        println!("I am {}", self.name);
    }
}
```

Trait 常用于：

- 抽象行为
- 约束泛型
- 实现多态

---

## 18. 生命周期

生命周期帮助编译器判断引用有效范围。

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
```

理解重点：

- 生命周期不是变量本身的“寿命标签”
- 它描述的是引用之间的有效关系
- 大部分情况下编译器可自动推导
- 复杂引用关系才需要显式标注

---

## 19. 常用集合

### Vec

动态数组：

```rust
let mut v = vec![1, 2, 3];
v.push(4);
```

### HashMap

键值表：

```rust
use std::collections::HashMap;

let mut map = HashMap::new();
map.insert("a", 1);
```

### 常见选择

- `Vec<T>`：顺序数据
- `String`：文本
- `HashMap<K, V>`：映射查找

---

## 20. 迭代器

迭代器是 Rust 的高频工具。

```rust
let v = vec![1, 2, 3];
let sum: i32 = v.iter().sum();
```

链式调用：

```rust
let result: Vec<i32> = v.iter()
    .map(|x| x * 2)
    .filter(|x| *x > 2)
    .collect();
```

特点：

- 惰性求值
- 可组合
- 表达式风格清晰

---

## 21. 闭包

闭包是匿名函数。

```rust
let add = |a: i32, b: i32| a + b;
println!("{}", add(1, 2));
```

闭包可以捕获外部变量，常和迭代器配合使用。

---

## 22. 模块、包、crate

### 模块

```rust
mod utils {
    pub fn hi() {
        println!("hi");
    }
}
```

### 可见性

- 默认私有
- `pub` 对外公开

### crate

- 一个 Rust 编译单元
- 二进制 crate：生成可执行文件
- 库 crate：生成可复用库

---

## 23. 错误处理

### 可恢复错误

使用 `Result`。

### 不可恢复错误

使用 `panic!`，通常只用于严重错误或调试阶段。

```rust
panic!("something went wrong");
```

常见模式：

```rust
use std::fs::File;

let file = File::open("a.txt");
```

更推荐把错误向上抛，让调用方决定怎么处理。

---

## 24. 智能指针

常见智能指针：

- `Box<T>`：堆分配
- `Rc<T>`：单线程共享所有权
- `RefCell<T>`：运行时借用检查
- `Arc<T>`：多线程共享所有权
- `Mutex<T>` / `RwLock<T>`：线程同步

### Box

```rust
let b = Box::new(5);
```

适合：

- 已知大小但想放到堆上
- 递归类型
- 需要所有权转移但不想拷贝大对象

---

## 25. 并发

Rust 并发设计的重点是：**让数据竞争尽量在编译期暴露**。

### 线程

```rust
use std::thread;

thread::spawn(|| {
    println!("new thread");
});
```

### 通道

```rust
use std::sync::mpsc;

let (tx, rx) = mpsc::channel();
tx.send(1).unwrap();
println!("{}", rx.recv().unwrap());
```

### 共享状态

```rust
use std::sync::{Arc, Mutex};
```

常见组合是 `Arc<Mutex<T>>`。

---

## 26. 宏

宏在编译期展开。

常见宏：

```rust
println!("hello {}", 1);
let v = vec![1, 2, 3];
```

初学阶段先掌握“会用”，再深入学习声明宏和过程宏。

---

## 27. 测试

Rust 内建测试很实用。

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
```

运行：

```bash
cargo test
```

---

## 28. 文档注释

```rust
/// 计算两个数的和
fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

生成文档：

```bash
cargo doc --open
```

---

## 29. 异步编程

Rust 的异步通常围绕 `Future`、`async` / `await`、运行时展开。

```rust
async fn fetch_data() -> String {
    "data".to_string()
}
```

常见理解方式：

- `async fn` 返回一个 future
- `await` 等待异步结果
- 实际运行通常依赖 Tokio、async-std 等运行时

初学时先掌握概念，不必一开始深挖底层执行器。

---

## 30. Unsafe 与 FFI

### unsafe

`unsafe` 不是“随便写”，而是“由程序员自行保证额外不变量”。

它常用于：

- 原始指针
- 调用不受 Rust 检查的接口
- 性能敏感底层实现

### FFI

Rust 可以和 C 接口互操作。

适合场景：

- 调用已有 C 库
- 暴露 Rust 函数给其他语言
- 系统级开发

---

## 31. 常见习惯与建议

- 优先写不可变变量
- 少做不必要的 `clone`
- 错误优先用 `Result`
- 习惯 `cargo fmt`
- 习惯 `cargo clippy`
- 多练习所有权、借用、生命周期

---

## 32. 常见坑

- 把 `String` 当成可随便切片的字节数组
- 忘记所有权移动后原变量失效
- 过早使用 `clone`
- 混淆 `&T` 和 `&mut T` 的借用规则
- 把 `Option`、`Result` 强行 `unwrap` 到处用
- 忽略 `match` 的穷尽性

---

## 33. 学习路线

建议顺序：

1. 基础语法
2. 所有权、借用、生命周期
3. `Option` / `Result`
4. `struct` / `enum` / `match`
5. `trait` / 泛型 / 闭包 / 迭代器
6. 模块系统与项目组织
7. 集合、错误处理、测试
8. 智能指针、并发
9. 异步、宏、unsafe、FFI

---

## 34. 练习建议

可以按这个顺序做小练习：

- 写一个命令行计算器
- 写一个文本统计工具
- 写一个简单的 todo 管理器
- 用 `HashMap` 做词频统计
- 用 `Result` 设计文件读取流程
- 用 trait + enum 组织小型领域模型

---

## 35. 一句话总结

Rust 的核心不是语法多，而是：

- 用 **所有权** 管内存
- 用 **借用** 控制访问
- 用 **类型系统** 提前发现错误
- 用 **抽象** 保持性能和表达力

---

## 36. 所有权进阶

Rust 的值语义很强，理解下面几件事很重要。

### 栈与堆

- 栈：大小已知、分配释放快
- 堆：大小可变、通过指针间接访问

`String`、`Vec<T>` 这类类型的数据主体通常在堆上。

### Drop

离开作用域时，Rust 会自动调用 `drop` 释放资源。

```rust
{
    let s = String::from("hello");
}
// 这里 s 已经自动释放
```

### 部分移动

结构体中某个字段移动后，整个值未必还能完整使用。

```rust
struct Person {
    name: String,
    age: u32,
}
```

### 借用与作用域

借用规则的本质是：同一时刻只能有一个写入者，或者多个读取者。

```rust
let mut s = String::from("abc");
let r1 = &s;
let r2 = &s;
println!("{} {}", r1, r2);
```

可变借用：

```rust
let mut s = String::from("abc");
let r = &mut s;
r.push('d');
```

---

## 37. 模式匹配进阶

### match guard

```rust
let x = Some(5);
match x {
    Some(n) if n > 3 => println!("large"),
    Some(n) => println!("{}", n),
    None => println!("none"),
}
```

### @ 绑定

```rust
match 4 {
    n @ 1..=5 => println!("in range: {}", n),
    _ => println!("other"),
}
```

### matches! 宏

```rust
let ok = matches!(Some(3), Some(n) if n > 1);
```

### 穷尽性

`match` 必须覆盖所有可能分支，编译器会强制检查。

---

## 38. Trait 进阶

### 默认方法

```rust
trait Speak {
    fn speak(&self) {
        println!("hello");
    }
}
```

### 关联类型

```rust
trait IteratorLike {
    type Item;
    fn next(&mut self) -> Option<Self::Item>;
}
```

### Trait 对象

```rust
fn run(x: &dyn Speak) {
    x.speak();
}
```

适合运行时多态，但会有动态分发开销。

### 常见派生

```rust
#[derive(Debug, Clone, PartialEq, Eq)]
struct Point {
    x: i32,
    y: i32,
}
```

---

## 39. 生命周期进阶

### 生命周期省略规则

Rust 在很多常见场景下可以自动推导生命周期。

### 结构体中的引用

```rust
struct Holder<'a> {
    value: &'a str,
}
```

### 'static

`'static` 表示值在整个程序期间都有效，常见于字符串字面量。

```rust
let s: &'static str = "hello";
```

生命周期的核心不是“延长引用”，而是“正确描述引用关系”。

---

## 40. 模块、可见性与工程组织

### 路径

- `crate::`：从当前 crate 根开始
- `self::`：当前模块
- `super::`：父模块

### 可见性

```rust
pub(crate) fn helper() {}
```

### 常见组织方式

```text
src/
  main.rs
  lib.rs
  config.rs
  error.rs
  service/
    mod.rs
    user.rs
```

大型项目通常会把：

- 领域模型
- 错误类型
- 配置
- 服务层
- 基础设施层

分开管理。

---

## 41. 标准库常用容器

### VecDeque

适合双端队列。

```rust
use std::collections::VecDeque;
let mut q = VecDeque::new();
q.push_back(1);
q.push_front(0);
```

### HashSet / BTreeMap

- `HashSet<T>`：去重集合
- `BTreeMap<K, V>`：有序映射

### 何时选哪种

- 查找快：`HashMap`
- 需要顺序：`BTreeMap`
- 队列：`VecDeque`

---

## 42. 错误处理进阶

### 自定义错误枚举

```rust
use std::io;

#[derive(Debug)]
enum AppError {
    Io(io::Error),
    InvalidInput,
}
```

### 错误分层

- 底层函数返回具体错误
- 上层统一包装和转换
- 边界层决定展示给用户什么

### unwrap 与 expect

```rust
let v = Some(1).expect("value should exist here");
```

初学时可以用来快速定位问题，但生产代码要慎用。

---

## 43. 并发与异步进阶

### Send 与 Sync

- `Send`：值可以在线程之间转移
- `Sync`：引用可以在线程之间共享

### 常见并发组合

```rust
use std::sync::{Arc, Mutex};
use std::thread;

let data = Arc::new(Mutex::new(0));
```

### 异步模型

Rust 异步的关键是：

- `Future` 表示尚未完成的计算
- `async/await` 提供语法糖
- 运行时负责调度任务

适合 I/O 密集型任务，例如网络服务、RPC 客户端、爬虫。

---

## 44. Unsafe 与底层互操作

### 原始指针

```rust
let x = 5;
let p = &x as *const i32;
```

### unsafe 块

```rust
unsafe {
    // 需要程序员自行保证安全性
}
```

### FFI

与 C 交互时常见写法：

```rust
#[repr(C)]
struct CPoint {
    x: i32,
    y: i32,
}
```

只有在确实需要时才进入 `unsafe` 领域。

---

## 45. 测试、调试与文档

### 单元测试

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn add_works() {
        assert_eq!(add(1, 2), 3);
    }
}
```

### 集成测试

放在 `tests/` 目录下，更接近真实使用方式。

### 常用断言

- `assert!`
- `assert_eq!`
- `assert_ne!`
- `#[should_panic]`

### 文档测试

Rust 的注释示例可以直接做测试，这是很实用的能力。

---

## 46. Cargo 实战要点

### 常用命令

```bash
cargo build
cargo run
cargo test
cargo doc --open
cargo fmt
cargo clippy
```

### 依赖管理

可以在 `Cargo.toml` 里声明依赖、版本、feature。

### 常见配置

- `debug`：适合开发
- `release`：适合发布

### workspace

多个 crate 协作时，workspace 很适合统一管理。

---

## 47. 学习时最该盯住的点

Rust 初学阶段，不要平均用力，优先抓住这些：

- 所有权移动
- 借用规则
- `Option` / `Result`
- `match`
- `trait`
- 生命周期

这几项真正吃透后，Rust 的多数报错会突然变得可解释。

---

## 48. 一个推荐的练习顺序

1. 写一个四则运算 CLI
2. 写一个文本行统计工具
3. 写一个 todo 管理器
4. 写一个简单的日志解析器
5. 写一个并发下载器
6. 写一个小型 HTTP 服务

如果能把这几个都写出来，基础就比较稳了。
