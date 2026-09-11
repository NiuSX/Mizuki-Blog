---
title: "RestFulAPI"
date: 2026-3-18
categories: 
    - 架构
excerpt: "RESTful API 学习笔记，整理接口设计原则、HTTP 方法、状态码、资源建模和常见规范。"
---

# 介绍

## Rest架构风格
REST（Representational State Transfer，表述性状态转移）是一种软件架构风格，由 Roy Fielding 博士在 2000 年提出，REST 定义了一组约束条件和原则，用于创建可扩展、松耦合的 Web 服务。
它是一种针对网络应用的设计和开发方式，可以降低开发的复杂性，提高系统的可伸缩性。

**六大原则**
- 客户端-服务器架构:前端（客户端）和后端（服务器）完全分离.
- 无状态性:每次请求都是独立的，服务器不会记住之前的请求。
- 可缓存性: 响应数据可以被缓存，提高性能。
- 统一接口:所有 API 都遵循相同的规则和格式,统一接口为REST定义了对系统资源进行操作统一的方法和链接入口，REST架构的核心就是资源，它将互联网中所有的可访问、操作的数据信息都看作资源进行处理，从而简化了REST对不同数据信息的处理方式和过程，也为REST的高度 重用性以及不同分布式异构系统的高交互性奠定了基础
- 分层系统:系统可以有多层，比如：客户端 → 负载均衡器 → API 服务器 → 数据库，分层系统的定义使得web Service的定义和实现Web系 统不同的层次之间具有良好的独立性，从而降低了系统层次依赖耦合性和复杂性，而良好的接口封装、应用功能实现等干扰性大大降低，从而为Web系统的可维护性、扩展性等奠定了良好的基础。
- 按需代码（可选）:服务器可以向客户端发送可执行代码，按需代码则是web Service可选的要求，通过按需代码开发者可以在客户端的应用程序进行功能扩展，从而实现对客户需求的满足，从而使得系统更加人性化，提升其友好性。



## API介绍

API（Application Programming Interface，应用程序编程接口）就像是不同软件之间的"翻译官"。 在编程世界中，API 让不同的软件系统能够相互交流和协作。

API 的主要作用包括：
- 数据交换：让不同系统之间能够传递信息
- 功能复用：避免重复造轮子，使用现成的服务
- 系统解耦：让前端和后端可以独立开发
- 安全控制：控制谁可以访问什么数据

![](../imgs/RestFulAPI/API.png)

## RESTful API
REST API（Representational State Transfer Application Programming Interface）是一种基于HTTP协议的软件架构风格，用于构建网络应用程序接口。   
REST API 是现代 Web 服务开发中最常用的 API 设计模式之一，在现代 Web 开发中，RESTful API 已成为应用程序之间通信的标准方式。   
RESTful API 是遵循 REST 架构风格设计的 API。它使用HTTP协议的特性，通过 URL 定位资源，用 HTTP 方法（GET、POST等）描述操作，实现客户端与服务器之间的交互。   

![](../imgs/RestFulAPI/RESTAPI.png)

**特点：**   
- 无状态：每个请求包含处理所需的所有信息
- 统一接口：使用标准 HTTP 方法进行操作
- 资源导向：所有内容都被抽象为资源
- 可缓存：响应应明确是否可缓存
- 可缓存：响应应明确是否可缓存

**核心原则**   
1. 资源与URI   
在REST中，所有事物都被抽象为资源，每个资源有唯一的标识符（URI）。    

    URI设计规范：   
    - 使用名词而非动词表示资源
    - 使用复数形式命名集合
    - 使用小写字母和连字符(-)
    - 避免文件扩展名

2. HTTP方法的使用   
RESTful API充分利用HTTP方法的语义：   

   | HTTP方法| 	描述     |	幂等性|	安全性|
   |---|---------|----|----|
   |GET| 	获取资源   |	是|	是|
   |POST| 	创建资源   |	否|	否|
   |PUT| 	完整更新资源 |	是|	否|
   |PATCH| 	部分更新资源 |	否|	否|
   |DELET	| 删除资源    |	是|	否|

3. 无状态性   
每个请求必须包含处理所需的所有信息，服务器不保存客户端状态。这使得API易于扩展和负载均衡。   

4. 表述形式   
资源可以有多种表述形式（如JSON、XML），客户端通过Accept头指定需要的格式。   

# HTTP方法   
在 RESTful API 中，我们主要使用四种方法，它们对应数据的四种基本操作：   

|HTTP方法|	作用|	对应操作|
|---|---|---|
|GET	|获取数据	|读取|
|POST	|创建数据	|创建|
|PUT	|更新数据	|更新|
|DELETE	|删除数据	|删除|

**GET 方法**    
特点：
- 安全操作，不会修改数据
- 可以被缓存
- 参数放在 URL 中

**POST 方法**   
特点：
- 会修改服务器状态
- 不是幂等的（多次调用会创建多个资源）
- 数据放在请求体中

> 幂等是一个数学与计算机科学中的概念，指的是一个操作无论执行多少次，产生的效果都与执行一次相同

**PUT 方法**   
特点：
- 是幂等的（多次调用结果相同）
- 通常替换整个资源
- 如果资源不存在，可能会创建新资源

**DELETE 方法**   
- 是幂等的
- 删除指定资源
- 成功后资源不再存在

**HTTP 状态码**   
当服务器处理完请求后，会返回状态码告诉你结果：

|状态码|	含义|	说明|
|---|---|---|
|200|	OK|	请求成功|
|201|	Created|	资源创建成功|
|400|	Bad Request|	请求有误|
|401|	Unauthorized|	未授权|
|404|	Not Found|	资源不存在|
|500|	Internal Server Error|	服务器内部错误|

>总结：   
> 1xx: 信息响应，表示请求已接收，正在处理，通常为临时响应   
> 2xx: 成功，表示请求已成功被服务器接收、理解并处理   
> 3xx: 重定向，表示客户端需要进一步操作才能完成请求   
> 4xx: 客户端错误，表示请求包含错误或无法被服务器处理（问题出在客户端）   
> 5xx：服务器错误，表示服务器未能完成有效请求（问题出在服务端）   

# URL设计
RESTful API 的 URL 应该表示"资源"而不是"动作"。   
**命名规范**
- 使用名词而非动词 
- 使用复数形式 
- 使用小写字母 
- 使用连字符分隔单词

**嵌套资源**   
当资源之间有从属关系时，可以使用嵌套 URL
```http
// 获取用户 123 的所有订单
GET /api/users/123/orders

// 获取用户 123 的订单 456
GET /api/users/123/orders/456

// 为用户 123 创建新订单
POST /api/users/123/orders
```
**查询参数**   
用于过滤、排序和分页
```http
// 分页
GET /api/users?page=1&limit=10

// 过滤
GET /api/users?status=active&city=beijing

// 排序
GET /api/users?sort=created_at&order=desc

// 搜索
GET /api/users?search=张三
```

**版本控制**   
为了保持向后兼容，API 需要版本控制
- URL 路径版本控制
```http
GET /api/v1/users
GET /api/v2/users
```

- 请求头版本控制
```http
GET /api/users
Accept: application/vnd.api+json;version=1
```
# 请求和响应格式  
在HTTP协议中，请求和响应有固定的格式结构。它们都遵循起始行 + 首部（Header） + 空行 + 主体（Body） 的格式
## HTTP请求格式
```
请求行（Request Line）
首部字段（Headers）
（空行）
消息主体（Body）
```
**请求行**   
格式：方法 路径 协议版本   
示例：`POST /api/users HTTP/1.1` 

|组成部分|	说明|	示例|
|---|---|---|
|方法|	操作类型|	GET POST PUT DELETE|
|路径|	请求的资源路径，可含查询参数|	/api/users?id=1 或 /api/users|
|协议版本|	HTTP版本|	HTTP/1.1 或 HTTP/2|

**首部字段**
键值对形式，每行一个，用于传递元信息。
常见请求头：

|首部|	说明|	示例|
|---|---|---|
|Host	|服务器域名和端口（HTTP/1.1 必需）|	Host: api.example.com|
|User-Agent	|客户端标识|	User-Agent: Mozilla/5.0|
|Content-Type	|请求体的媒体类型|	Content-Type: application/json|
|Content-Length	|请求体的字节长度|	Content-Length: 1024|
|Authorization	|身份认证信息|	Authorization: Bearer xxxxx|
|Accept	|客户端期望接收的响应格式|	Accept: application/json|
|Cookie	|携带的Cookie|	Cookie: sessionId=abc123|

**空行**
一个空行（\r\n）用于分隔首部和主体，表示首部结束。

**消息主体**
请求携带的数据，不是所有请求都有（如GET通常没有Body）。

常见Body格式：

- JSON：{"name": "张三", "age": 25}
- 表单：name=张三&age=25 
- 文件：multipart/form-data 格式

HTTP请求完整示例：
```http
POST /api/users HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0
Content-Type: application/json
Content-Length: 37
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9

{"username":"zhangsan","password":"123456"}

```

## HTTP响应格式

```
状态行（Status Line）
首部字段（Headers）
（空行）
消息主体（Body）
```

**状态行**
格式：协议版本 状态码 状态描述

示例： ```HTTP/1.1 200 OK```

|组成部分|	说明|	示例|
|---|---|---|
|协议版本	|HTTP版本	|HTTP/1.1|
|状态码	|三位数字结果码	|200 404 500|
|状态描述	|状态码的文本说明|OK Not Found|

**首部字段**

常见响应头：

|首部	|说明	|示例|
|---|---|---|
|Content-Type	|响应体的媒体类型	|Content-Type: application/json|
|Content-Length	|响应体的字节长度	|Content-Length: 256|
|Set-Cookie	|设置Cookie	|Set-Cookie: sessionId=xyz; HttpOnly|
|Cache-Control	|缓存控制策略	|Cache-Control: no-cache|
|Location	|重定向的目标地址（配合3xx使用）	|Location: /api/users/1|

**空行**
同样用空行分隔首部和主体。

**消息主体**
返回的实际数据

**HTTP响应完整示例**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 58
Cache-Control: no-cache

{
"code": 0,
"message": "success",
"data": {"id": 1, "username": "zhangsan"}
}
```

**JSON 格式**   
现代 RESTful API 主要使用 JSON（JavaScript Object Notation）格式来传输数据

**请求头常用字段**
|字段名|	作用|	示例|
|---|---|---|
|Content-Type	|请求体数据格式|	application/json|
|Accept	|期望的响应格式|	application/json|
|Authorization	|身份验证信息|	Bearer token123|
|User-Agent	|客户端信息|	MyApp/1.0|


# 认证和授权

## JWT (JSON Web Token) 认证
JWT 就像是一张"数字身份证"，包含了用户的身份信息，并且可以验证真伪。

示例：
```http
// 登录流程
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// 响应
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 123,
      "name": "张三",
      "email": "user@example.com"
    }
  }
}

// 在后续的请求中携带 Token
GET /api/users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## OAuth 2.0 集成
OAuth 2.0 集成是指将一个应用程序接入 OAuth 2.0 授权协议，让应用能够安全地委托第三方平台（如微信、Google、GitHub）进行用户认证或授权访问资源。   

**角色**

|角色	|说明	|示例|
|---|---|---|
|资源拥有者	|数据的拥有者，通常是用户	|你（用户）|
|客户端	|想要访问资源的第三方应用	|你的App、网站|
|授权服务器	|负责认证用户并颁发访问凭证	|微信OAuth服务、Google OAuth服务|
|资源服务器	|存储用户数据的服务器	|微信API、Google API|

**核心流程（简化版）**
1. 用户点击“微信登录”
2. 应用跳转到微信授权页面
3. 用户确认授权（微信账号密码验证）
4. 微信返回授权码（Authorization Code）
5. 应用后端用授权码换取访问令牌（Access Token）
6. 应用使用访问令牌获取用户信息
7. 应用创建本地会话，用户登录成功

**传统方式的痛点**
- 用户需要为每个应用注册独立账号，记忆负担重 
- 密码泄露风险高（用户重复使用密码） 
- 应用需要自行管理密码存储、加密、找回密码等复杂功能

**OAuth 2.0 的优势**
- 简化注册登录：用户一键授权即可登录，降低注册门槛 
- 安全性：应用不接触用户密码，密码由第三方平台保管 
- 可控授权：用户可以随时在第三方平台撤销应用权限 
- 减少开发成本：无需自建完整的认证系统

**常见集成场景**
1. 第三方登录（最常见）：使用微信、QQ、支付宝、Google、GitHub 账号登录，获取用户基本信息（头像、昵称、邮箱）
2. 授权访问用户数据，应用需要访问用户在第三方平台的资源
3. 企业级单点登录（SSO），企业内部系统集成 OAuth 2.0，一套账号打通所有内部应用

**四种授权模式**

|模式	|适用场景|
|---|---|
|授权码模式（Authorization Code）	|最常用、最安全，适用于有后端的Web应用|
|隐式模式（Implicit）	|已弃用，适用于纯前端应用（现推荐授权码 + PKCE）|
|密码模式（Resource Owner Password Credentials）	|适用于受信任的第一方应用（如官方App）|
|客户端凭证模式（Client Credentials）	|适用于应用间通信（无用户参与）|

>最常见的是**授权码模式**，也是微信、Google等主流平台使用的方式。

**注意事项**

|要点	|说明|
|---|---|
|使用 HTTPS|	所有OAuth通信必须加密，防止中间人攻击|
|AppSecret 保密|	仅在服务端使用，绝对不能暴露在客户端代码中|
|State 参数|	用于防止CSRF攻击，前后端需要校验|
|授权码只用一次|	授权码有效期短且只能使用一次|
|PKCE 增强|	对于移动App和SPA应用，使用PKCE（Proof Key for Code Exchange）增强安全性|

**典型步骤**
1. 申请接入，在微信开放平台创建应用，获取 AppID 和 AppSecret
2. 前端发起授权
```http
GET https://open.weixin.qq.com/connect/qrconnect
   ?appid=APPID
   &redirect_uri=https://yourapp.com/callback
   &response_type=code
   &scope=snsapi_login
   &state=STATE
```
3. 用户扫码确认，微信回调返回授权码
```GET https://yourapp.com/callback?code=AUTHORIZATION_CODE&state=STATE```
4. 后端用授权码换取访问令牌
```http
POST https://api.weixin.qq.com/sns/oauth2/access_token
   ?appid=APPID
   &secret=APPSECRET
   &code=AUTHORIZATION_CODE
   &grant_type=authorization_code
```

5. 用访问令牌获取用户信息
```http
GET https://api.weixin.qq.com/sns/userinfo
   ?access_token=ACCESS_TOKEN
   &openid=OPENID
```

6. 创建本地会话:根据获取的用户信息（openid、昵称、头像）,在本地数据库中创建或查找用户,生成应用自己的Session或JWT Token


示例：
```http
// 第三方登录流程
GET /api/auth/google/redirect
// 重定向到 Google 授权页面

// 回调处理
GET /api/auth/google/callback?code=authorization_code
// 返回应用 Token
API 限流和配额
请求频率限制
javascript// 响应头中包含限流信息
HTTP/1.1 200 OK
X-RateLimit-Limit: 1000        // 每小时限制1000次请求
X-RateLimit-Remaining: 999     // 剩余请求次数
X-RateLimit-Reset: 1642694400  // 重置时间戳

// 超出限制时的响应
HTTP/1.1 429 Too Many Requests
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "请求过于频繁，请稍后再试",
    "retryAfter": 3600  // 建议等待时间（秒）
  }
}
```

# 数据缓存策略
## HTTP 缓存头
示例：
```http
// 设置缓存策略
GET /api/users/123
Cache-Control: public, max-age=3600  // 缓存1小时
ETag: "a1b2c3d4e5f6"                // 资源版本标识

// 条件请求
GET /api/users/123
If-None-Match: "a1b2c3d4e5f6"

// 如果资源未变化
HTTP/1.1 304 Not Modified
```

## Redis缓存
```http
// 缓存策略伪代码
async function getUser(userId) {
  // 1. 先检查缓存
  const cached = await redis.get(`user:${userId}`);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 2. 缓存未命中，查询数据库
  const user = await database.findUser(userId);
  
  // 3. 将结果缓存
  await redis.setex(`user:${userId}`, 3600, JSON.stringify(user));
  
  return user;
}
```

# 微服务架构中的 API

**服务间通信**
服务间通信是指在分布式系统（特别是微服务架构）中，不同服务之间相互调用、交换数据的过程。当一个服务需要另一个服务提供的数据或功能时，就需要通过服务间通信来实现。

![](../imgs/RestFulAPI/Services_Communciation.png)

**API网关模式**
API网关模式是一种架构设计模式，它在客户端和后端服务之间引入一个统一的入口点，作为所有API请求的反向代理和流量管理中间层

示例：
API 网关路由配置:
```json
{
  "routes": [
    {
      "path": "/api/users/*",
      "service": "user-service",
      "url": "http://user-service:3001"
    },
    {
      "path": "/api/orders/*", 
      "service": "order-service",
      "url": "http://order-service:3002"
    }
  ]
}
```

# GraphQL vs REST vs gRPC

GraphQL 是一种 API查询语言 和 服务端运行时，由Facebook在2012年内部开发，2015年开源。它允许客户端精确指定需要什么数据，服务端只返回请求的数据，不多不少。   
gRPC 是一个高性能、开源的远程过程调用框架，由Google开发，于2015年开源。它基于 HTTP/2 协议，使用 Protocol Buffers（Protobuf） 作为接口定义语言和数据序列化格式，支持多种编程语言，实现跨语言的服务间通信。

**REST API 的局限性**
```http
// REST: 需要多次请求获取相关数据
GET /api/users/123        // 获取用户信息
GET /api/users/123/posts  // 获取用户发布的文章
GET /api/posts/456/comments // 获取文章评论
```

**问题**：
- 过获取（Over-fetching）：返回了客户端不需要的字段
- 欠获取（Under-fetching）：如果需要关联数据，可能需要多次请求

**GraphQL 的优势**
```http
// GraphQL: 一次请求获取所需数据
query {
  user(id: 123) {
    name
    email
    posts {
      title
      comments {
        content
        author
      }
    }
  }
}
```


**GraphQL 和 REST 和 gRPC 对比**

|维度|	GraphQL| 	REST         |	gRPC|
|---|---|---------------|---|
|数据获取|	客户端指定字段| 	服务端固定结构      |	服务端定义方法|
|传输协议|	HTTP/HTTPS| 	HTTP/HTTPS   |	HTTP/2|
|数据格式|	JSON| 	JSON/XML/... |	Protobuf（二进制）|
|缓存|	复杂| 	简单（URL）      |	复杂|
|性能|	中（可能过度查询）|	中|	高|
|类型安全|	强（Schema）|	弱（无原生）|	强（Protobuf）|
|适用场景|	数据复杂、前端多样|	简单API、公开API|	高性能服务间通信|
|学习曲线|	中等|	低|	中等|


## 
