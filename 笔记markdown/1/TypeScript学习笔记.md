---
title: TypeScript 学习笔记
layout: single
toc: true
toc_label: 目录
---

# TypeScript 学习笔记

## 1. TypeScript 是什么

TypeScript（TS）是 JavaScript 的超集。

它的核心目标不是替代 JavaScript，而是在 JavaScript 之上提供：

- 静态类型检查
- 更好的代码提示与重构能力
- 更强的工程组织能力
- 更容易维护的大型项目结构

TypeScript 最终会编译成 JavaScript 运行，所以它本质上还是 JS 生态的一部分。

---

## 2. 为什么要学 TypeScript

TypeScript 主要解决的是“规模化开发”的问题。

常见收益：

- 提前发现类型错误
- 减少运行时 bug
- IDE 自动补全更准确
- 接口变更更容易追踪
- 重构更安全

典型场景：

- 前端中大型项目
- Node.js 后端项目
- React / Vue / NestJS 项目
- 公共组件库、工具库、SDK

---

## 3. 安装与编译

常见安装方式：

```bash
npm install -g typescript
```

查看版本：

```bash
tsc -v
```

初始化项目：

```bash
tsc --init
```

编译单个文件：

```bash
tsc index.ts
```

项目开发中更常见的是配合构建工具或运行时：

- Vite
- Webpack
- esbuild
- tsx
- ts-node

---

## 4. TypeScript 项目结构

常见结构：

```text
src/
  index.ts
tsconfig.json
package.json
```

常见配置产物：

- `tsconfig.json`：TypeScript 编译配置
- `package.json`：依赖、脚本、项目元数据
- `dist/`：编译后的输出目录

---

## 5. Hello World

```ts
const message: string = "Hello TypeScript";
console.log(message);
```

TypeScript 代码通常先经过编译，再交给 JavaScript 运行时执行。

---

## 6. 基本类型

TypeScript 的基础类型包括：

- `string`
- `number`
- `boolean`
- `bigint`
- `symbol`
- `null`
- `undefined`
- `object`

示例：

```ts
let name: string = "Alice";
let age: number = 20;
let isAdmin: boolean = false;
let id: bigint = 123n;
let token: symbol = Symbol("token");
```

---

## 7. 数组与元组

### 数组

```ts
let nums: number[] = [1, 2, 3];
let names: Array<string> = ["a", "b"];
```

### 元组

元组是“长度固定、每个位置类型确定”的数组。

```ts
let pair: [string, number] = ["age", 18];
```

可以用来表示结构明确的小数据。

---

## 8. 枚举

枚举用于表示有限选项。

```ts
enum Direction {
  Up,
  Down,
  Left,
  Right,
}
```

字符串枚举：

```ts
enum Status {
  Success = "success",
  Failed = "failed",
}
```

枚举适合状态码、角色、方向、阶段等场景。

---

## 9. any、unknown、void、never

### any

`any` 会放弃类型检查。

```ts
let value: any = 1;
value = "text";
```

尽量少用。

### unknown

`unknown` 比 `any` 安全，使用前必须先收窄类型。

```ts
let input: unknown = "hello";
if (typeof input === "string") {
  console.log(input.toUpperCase());
}
```

### void

表示函数没有显式返回值。

```ts
function logMessage(msg: string): void {
  console.log(msg);
}
```

### never

表示永远不会发生的类型。

```ts
function fail(message: string): never {
  throw new Error(message);
}
```

---

## 10. 字面量类型与联合类型

### 字面量类型

```ts
let role: "admin" | "user" = "admin";
```

### 联合类型

```ts
let value: string | number;
value = "a";
value = 1;
```

联合类型常用于状态、接口响应、分支输入。

---

## 11. 交叉类型

交叉类型表示“同时满足多个类型”。

```ts
type Person = {
  name: string;
};

type Employee = {
  id: number;
};

type Worker = Person & Employee;
```

`Worker` 同时拥有 `name` 和 `id`。

---

## 12. 类型别名与接口

### type

```ts
type UserId = string | number;
```

### interface

```ts
interface User {
  name: string;
  age: number;
}
```

### 区别

- `type` 更灵活，适合联合类型、交叉类型、函数类型
- `interface` 更适合描述对象结构，支持声明合并

很多工程里两者都会用。

---

## 13. 结构类型系统

TypeScript 采用结构类型系统。

意思是：只要结构兼容，就可以赋值，不要求名字相同。

```ts
interface Point2D {
  x: number;
  y: number;
}

const p = { x: 1, y: 2, z: 3 };
const pt: Point2D = p;
```

只要字段满足要求，就能赋值。

---

## 14. 函数类型

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

箭头函数：

```ts
const multiply = (a: number, b: number): number => a * b;
```

可选参数：

```ts
function greet(name?: string): string {
  return name ? `Hello ${name}` : "Hello";
}
```

默认参数：

```ts
function buildUrl(path: string, base = "https://example.com"): string {
  return `${base}/${path}`;
}
```

剩余参数：

```ts
function sum(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}
```

---

## 15. 函数重载

当同一个函数支持不同入参时，可以写重载。

```ts
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
  return String(value);
}
```

重载签名写在前面，真正实现写在最后。

---

## 16. 类型收窄

类型收窄就是把宽类型变成更具体的类型。

### typeof

```ts
function print(value: string | number) {
  if (typeof value === "string") {
    console.log(value.toUpperCase());
  }
}
```

### instanceof

```ts
if (date instanceof Date) {
  console.log(date.getFullYear());
}
```

### in

```ts
if ("id" in obj) {
  console.log(obj.id);
}
```

### 自定义类型谓词

```ts
function isString(value: unknown): value is string {
  return typeof value === "string";
}
```

---

## 17. 类型断言

当你比编译器更确定类型时，可以断言。

```ts
const el = document.getElementById("app") as HTMLDivElement;
```

也可以用尖括号语法，但在 `.tsx` 中通常不用：

```ts
const value = <string>input;
```

注意：断言不会做真实运行时检查，只是告诉编译器“相信我”。

---

## 18. 非空断言与可选链

### 非空断言

```ts
const el = document.querySelector("#app")!;
```

表示你确认它不是 `null`。

### 可选链

```ts
user?.profile?.name;
```

### 空值合并

```ts
const name = input ?? "anonymous";
```

这几个特性在处理可空值时非常常用。

---

## 19. 对象类型

```ts
type User = {
  name: string;
  age: number;
  readonly email?: string;
};
```

可选属性用 `?`，只读属性用 `readonly`。

对象解构：

```ts
const { name, age } = user;
```

---

## 20. 接口扩展

```ts
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}
```

接口也可以扩展多个类型：

```ts
interface Hybrid extends A, B {}
```

---

## 21. 类

```ts
class Person {
  constructor(public name: string, private age: number) {}

  greet(): string {
    return `Hi, ${this.name}`;
  }
}
```

类相关概念：

- `public`：公开
- `private`：类内可见
- `protected`：类和子类可见
- `readonly`：只读

还可以使用 `abstract` 定义抽象类。

---

## 22. 访问修饰符

```ts
class Counter {
  public value = 0;
  private step = 1;
  protected history: number[] = [];
}
```

访问修饰符帮助你控制对象的边界。

---

## 23. 抽象类

```ts
abstract class Shape {
  abstract area(): number;
}
```

抽象类不能直接实例化，只能被继承。

---

## 24. 泛型

泛型用于写可复用、类型安全的代码。

```ts
function identity<T>(value: T): T {
  return value;
}
```

约束泛型：

```ts
function lengthOf<T extends { length: number }>(value: T): number {
  return value.length;
}
```

默认泛型参数：

```ts
type ApiResponse<T = unknown> = {
  data: T;
  message: string;
};
```

---

## 25. 泛型接口与泛型类

```ts
interface Box<T> {
  value: T;
}
```

```ts
class Repository<T> {
  private items: T[] = [];

  add(item: T) {
    this.items.push(item);
  }
}
```

泛型类适合做仓储、缓存、容器、表单数据结构。

---

## 26. keyof、typeof、索引访问类型

### keyof

```ts
type UserKeys = keyof User;
```

### typeof

```ts
const config = {
  baseUrl: "/api",
  timeout: 3000,
};

type Config = typeof config;
```

### 索引访问

```ts
type UserName = User["name"];
```

这些是写高级类型时的基础工具。

---

## 27. 映射类型

```ts
type ReadonlyUser = {
  readonly [K in keyof User]: User[K];
};
```

映射类型会遍历联合键并生成新类型。

常见用途：

- 可选化
- 只读化
- 部分字段转换

---

## 28. 条件类型

```ts
type IsString<T> = T extends string ? true : false;
```

条件类型是 TypeScript 高级类型系统的核心能力之一。

常见场景：

- 提取函数返回值
- 提取 Promise 内部类型
- 根据输入类型做分支映射

---

## 29. infer

`infer` 用于在条件类型中推断中间类型。

```ts
type Return<T> = T extends (...args: any[]) => infer R ? R : never;
```

它常用于封装底层类型工具。

---

## 30. 常用工具类型

TypeScript 自带很多工具类型：

- `Partial<T>`
- `Required<T>`
- `Readonly<T>`
- `Pick<T, K>`
- `Omit<T, K>`
- `Record<K, T>`
- `Exclude<T, U>`
- `Extract<T, U>`
- `NonNullable<T>`
- `Parameters<T>`
- `ReturnType<T>`
- `ConstructorParameters<T>`
- `InstanceType<T>`

示例：

```ts
type UserPreview = Pick<User, "name" | "age">;
type UserPatch = Partial<User>;
```

---

## 31. 模块系统

TypeScript 现代项目主要使用 ES Module。

导出：

```ts
export function add(a: number, b: number) {
  return a + b;
}
```

导入：

```ts
import { add } from "./math";
```

默认导出：

```ts
export default function main() {}
```

---

## 32. 命名空间

命名空间现在不算主流，但在老项目或声明文件中仍会见到。

```ts
namespace Utils {
  export function log(msg: string) {
    console.log(msg);
  }
}
```

新项目一般优先使用模块系统。

---

## 33. tsconfig.json

`tsconfig.json` 是 TypeScript 编译配置的核心。

常见配置项：

- `target`
- `module`
- `strict`
- `rootDir`
- `outDir`
- `esModuleInterop`
- `skipLibCheck`
- `noImplicitAny`
- `noUnusedLocals`
- `noUnusedParameters`

示例：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "rootDir": "src",
    "outDir": "dist",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

---

## 34. strict 模式

建议开启 `strict`。

它会启用一组更严格的检查，例如：

- `strictNullChecks`
- `noImplicitAny`
- `strictFunctionTypes`

好处是：

- 更早暴露问题
- 类型表达更完整
- 代码更适合中大型项目

---

## 35. DOM 与浏览器开发

TypeScript 在前端里很常见。

```ts
const button = document.querySelector("button");
if (button) {
  button.addEventListener("click", () => {
    console.log("clicked");
  });
}
```

常见 DOM 类型：

- `HTMLElement`
- `HTMLInputElement`
- `HTMLButtonElement`
- `Event`
- `MouseEvent`

---

## 36. Promise 与异步

```ts
async function fetchData(): Promise<string> {
  return "data";
}
```

```ts
fetchData().then((data) => console.log(data));
```

异步场景下常见类型：

- `Promise<T>`
- `Promise<void>`
- `Promise<Result>`

---

## 37. 错误处理

TypeScript 不强制错误类型，但工程中通常会约定：

- 正常错误通过 `throw`
- 业务失败返回统一结果对象
- 网络错误、解析错误、校验错误分层处理

示例：

```ts
try {
  const data = JSON.parse(input);
} catch (error) {
  console.error(error);
}
```

---

## 38. JSON 与接口类型

后端返回的数据通常要映射成接口类型。

```ts
type ApiUser = {
  id: number;
  name: string;
};

async function loadUser(): Promise<ApiUser> {
  const res = await fetch("/api/user");
  return res.json();
}
```

实际项目里要记住：运行时数据不可信，不能只依赖静态类型。

---

## 39. 运行时校验

TypeScript 的类型在编译后会消失，所以对外部输入通常还要做运行时校验。

常见方案：

- 手写校验
- zod
- yup
- ajv
- class-validator

这是“类型安全”和“数据安全”之间的重要边界。

---

## 40. React 中的 TypeScript

常见写法：

```ts
type Props = {
  title: string;
  onClick?: () => void;
};

function Button({ title, onClick }: Props) {
  return <button onClick={onClick}>{title}</button>;
}
```

重点：

- props 类型
- state 类型
- event 类型
- ref 类型

---

## 41. Vue 中的 TypeScript

Vue 3 对 TypeScript 支持较好。

常见关注点：

- `defineProps`
- `defineEmits`
- `ref`
- `reactive`
- `computed`

TypeScript 能明显提升组件和状态的可维护性。

---

## 42. Node.js 中的 TypeScript

TypeScript 在后端也很常见，尤其是：

- NestJS
- Express
- Fastify

常见用途：

- DTO
- 请求参数校验
- 服务接口定义
- 数据库模型类型

---

## 43. 声明文件

`.d.ts` 用于描述类型，不包含运行时代码。

```ts
declare function greet(name: string): void;
```

它常用于：

- 第三方库补类型
- JS 项目渐进迁移到 TS
- 全局类型声明

---

## 44. 全局声明与模块增强

如果需要扩展全局类型，可以使用声明合并。

```ts
declare global {
  interface Window {
    appVersion: string;
  }
}
```

这个功能在需要扩展框架或浏览器内置类型时很有用。

---

## 45. 实战风格建议

- 优先让类型表达业务，而不是只做“装饰”
- 远离 `any`
- 对外部输入先校验再使用
- 能收窄就收窄
- 公共模块尽量暴露稳定的类型
- 复杂类型要抽出来命名

---

## 46. 常见坑

- 把 `any` 当成万能解决方案
- 过度使用类型断言
- 忽略 `null` 和 `undefined`
- 只写静态类型，不做运行时校验
- 类型写得过深，导致维护困难
- 接口/类型命名混乱

---

## 47. 学习路线

建议顺序：

1. JavaScript 基础
2. 基本类型、函数、对象
3. 联合类型、接口、类型别名
4. 泛型、类、模块
5. 类型收窄、条件类型、映射类型
6. `tsconfig` 与工程配置
7. DOM、Promise、异步编程
8. React / Vue / Node.js 实战
9. 声明文件、运行时校验、高级类型

---

## 48. 练习建议

可以从这些项目练起：

- 记事本
- Todo List
- API 请求封装
- 表单校验模块
- 通用分页组件
- 简单状态管理库
- 小型 CLI 工具

---

## 49. 一句话总结

TypeScript 的价值在于：

- 用类型约束 JavaScript
- 用工具链提升可维护性
- 用静态检查提前发现问题
- 用更清晰的模型支撑复杂项目

