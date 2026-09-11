---

---
# 简介

## 介绍
Redis（Redis，Remote Dictionary Server）是一个**开源的、基于内存的、高性能的键值对存储数据库**。它通常被称为**数据结构服务器**，因为它不仅支持简单的字符串类型，还支持列表、集合、有序集合、哈希表、位图、超日志、地理空间索引等多种数据结构

>核心特点一句话总结：
Redis 是一个跑在内存里的、速度极快的、功能丰富的“数据结构商店”。

## 核心特性
1. 基于内存
- 所有数据都存储在内存中，读写速度极快（微秒级）
- 读速度可达 10万+ QPS，写速度也接近 10万 QPS
- 远超传统关系型数据库（MySQL 约 1000-5000 QPS）

2. 丰富的数据结构
不像 Memcached 只有简单的字符串，Redis 支持：

- String（字符串）- 最简单、最常用
- Hash（哈希表）- 适合存储对象
- List（列表）- 双向链表，可用作队列/栈
- Set（集合）- 无序、去重
- Sorted Set（有序集合）- 带分数的集合
- Bitmap（位图）- 节省空间的布尔值存储
- HyperLogLog - 基数统计
- Geospatial（地理空间）- 位置相关
- Stream（流）- 消息队列

3. 持久化
虽然基于内存，但 Redis 提供两种持久化方式防止数据丢失：

- RDB（Redis Database）- 快照方式，定期将内存数据写入磁盘
- AOF（Append Only File）- 记录每个写操作，重启时重放

4. 高可用与分布式
- 主从复制（Master-Slave Replication）
- 哨兵机制（Sentinel）- 自动故障转移
- 集群模式（Cluster）- 自动分片，水平扩展

5. 原子操作
- 所有 Redis 操作都是原子性的，支持事务和 Lua 脚本

6. 丰富的功能特性
- 过期时间（TTL）- 自动删除
- 发布订阅（Pub/Sub）- 轻量级消息系统
- Lua 脚本 - 复杂原子操作
- 管道（Pipeline）- 批量命令减少 RTT
- 事务（Transaction）- 命令排队执行

## 应用场景

1. 缓存系统（最主流）
```
用户请求 → Redis（热数据）→ 穿透到 MySQL（冷数据）
热点数据缓存（用户信息、商品详情）
```

- 页面缓存（渲染结果）
- 会话缓存（Session 共享）

实际例子：双11商品详情页，90% 请求由 Redis 直接返回；微博热搜榜，实时更新

2. 计数器与限流器
- 视频播放量、点赞数、评论数
- 接口限流（滑动窗口算法）
- 分布式 ID 生成器

```
# 视频播放量 +1
INCR video:10086:play_count

# 限流：用户1分钟最多访问10次
INCR user:123:req_count
EXPIRE user:123:req_count 60
```

3. 排行榜系统
利用 Sorted Set，自动按分数排序：

```
# 添加玩家分数
ZADD game:rank 1000 player1 2000 player2

# 获取前10名
ZREVRANGE game:rank 0 9 WITHSCORES

# 查看玩家排名
ZRANK game:rank player1
应用：游戏排行榜、热门文章、销量排行
```

4. 消息队列
使用 List 或 Stream 实现：

- 异步处理任务
- 削峰填谷
- 解耦系统

```
# 生产者
LPUSH queue:task "send_email:user123"

# 消费者
BRPOP queue:task 0
```

5. 分布式锁
多个服务实例竞争资源时的同步机制：

```
# 加锁
SET lock:order:123 "uuid" NX EX 30

# 释放锁（Lua脚本保证原子性）
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
```

6. 社交网络功能
- 共同好友（Set 交集）
- 关注/粉丝关系
- 用户推荐（Set 差集）

7. 实时数据分析
- Bitmap 记录用户签到、在线状态
- HyperLogLog 统计 UV（独立访客数）
- Geospatial 实现附近的人/门店

8. Session 共享
- 多台 Web 服务器共享用户会话：

```
Nginx 负载均衡 → Web1, Web2, Web3
                 ↓
             Redis (Session存储)
```

## Redis 与其他数据库的对比

|特性|	Redis|	Memcached|	MySQL|	MongoDB|
|---|---|---|---|---|
|数据存储|	内存+持久化|	纯内存|	磁盘|	内存+磁盘|
|数据结构|	丰富|	仅字符串|	表|	文档|
|操作延迟|	微秒级|	微秒级|	毫秒级|	毫秒级|
|QPS|	10万+|	10万+|	几千|	几万|
|数据量限制|	受内存限制|	受内存限制|	TB级|	TB级|
|持久化|	支持|	不支持|	支持|	支持|
|主从复制|	支持|	不支持|	支持|	支持|
|事务|	部分支持|	不支持|	完整ACID|	不支持|



# Redis 的数据结构与内部实现

1. String（字符串）
- 内部编码：int、embstr、raw
- 最大长度：512MB
- 应用：缓存、计数器、分布式锁

2. Hash（哈希表）
- 内部编码：ziplist（小数据）、hashtable（大数据）
- 适合存储对象，可单独修改某个字段

```
HSET user:1 name "张三" age 25
HGET user:1 name
```

3. List（列表）
- 内部编码：ziplist、linkedlist、quicklist
- 双向操作，可实现栈、队列

```
LPUSH mylist "a" "b" "c"   # 左侧插入
RPOP mylist                # 右侧弹出
```

4. Set（集合）
- 内部编码：intset、hashtable
- 无序、唯一，支持交并差运算

```
SADD tags "redis" "database"
SINTER set1 set2   # 交集
```

5. Sorted Set（有序集合）
- 内部编码：ziplist、skiplist（跳表）
- 每个元素关联一个 double 类型的分数
- 跳表结构保证 O(logN) 的查找和插入

# Redis 的持久化机制

1. RDB（快照方式）
原理：将内存数据在某个时间点写入二进制文件（dump.rdb）
触发方式：手动：SAVE（阻塞）、BGSAVE（后台 fork 子进程）；自动：配置 save 900 1（15分钟内至少1个key变化）
优点：文件紧凑，适合备份和灾难恢复；恢复大数据集时速度快
缺点：可能丢失最后一次快照之后的数据；fork 子进程时，如果数据集很大，会短暂阻塞

2. AOF（追加文件）
原理：记录每个写操作命令，重启时重放

三种同步策略：

- appendfsync always：每写一次就同步（最安全，最慢）
- appendfsync everysec：每秒同步一次（折中，推荐）
- appendfsync no：交给操作系统（最快，不安全）

优点：数据安全性高（最多丢失1秒数据）；AOF 文件可重写（BGREWRITEAOF）压缩

缺点：文件通常比 RDB 大；恢复速度慢于 RDB

3. 混合持久化（Redis 4.0+）
RDB 做全量快照 + AOF 记录增量变化

# Redis 的高可用架构

1. 主从复制
```
Master（写） → Slave1（读） → Slave2（读）
```
- 一主多从，读写分离
- 异步复制，不影响主节点性能
- 从节点可分担读压力

2. 哨兵机制（Sentinel）
- 监控所有 Redis 节点健康状态
- 主节点故障时自动选举新主
- 客户端连接哨兵获取真实主节点地址
```
客户端 → 哨兵集群 → 返回当前 Master 地址
          ↓
      监控 Master、Slave
```

3. Redis Cluster（集群）
- 无中心架构，自动分片（16384 个槽位）
- 支持动态扩缩容
- 部分节点故障不影响整体服务
```
key → CRC16(key) % 16384 → 定位到
```

# Redis 的优缺点

**优点**
- 极致的性能（内存 + 单线程模型）
- 丰富的数据结构，满足各种场景
- 简单易用，命令类 SQL 但更简单
- 成熟稳定，被大量互联网公司验证
- 良好的社区生态，多语言客户端

**缺点**
- 数据量受物理内存限制，成本较高
- 单线程模型（6.0 后引入多线程 I/O，但核心还是单线程）
- 复杂查询能力弱（不支持 JOIN、复杂条件过滤）
- 持久化可能会影响性能
- 主从切换可能丢失少量数据

# Redis 的最佳实践
1. 内存优化
- 使用合适的数据结构（小数据用 ziplist）
- 设置合理的过期时间
- 使用 maxmemory-policy 淘汰策略：
   - volatile-lru：从有过期时间的 key 中淘
   - allkeys-lru：从所有 key 中淘汰（最常用）
   - volatile-ttl：淘汰即将过期的

2. 键名设计
使用冒号分隔：业务:对象:ID:字段
如：user:10086:profile:name
避免过长键名（节省内存）

3. 批量操作
- 使用 Pipeline 减少网络往返
- 使用 MSET、MGET 替代多次 SET、GET

4. 热 key 问题
- 对热 key 进行本地缓存（JVM 缓存）
- 使用读写分离，增加从节点
- 使用代理层（如 Codis、Twemproxy）

5. 慢查询监控
```
# 配置慢查询阈值（微秒）
CONFIG SET slowlog-log-slower-than 10000

# 查看慢查询
SLOWLOG GET 10
```


# 代码示例

```python
import redis

# 连接池
pool = redis.ConnectionPool(host='localhost', port=6379, db=0)
r = redis.Redis(connection_pool=pool)

# 字符串
r.set('name', '张三', ex=60)  # 60秒过期
print(r.get('name'))

# 哈希
r.hset('user:1', mapping={'name': '李四', 'age': 25})
print(r.hgetall('user:1'))

# 列表（消息队列）
r.lpush('task_queue', 'task1', 'task2')
task = r.brpop('task_queue', timeout=5)

# 有序集合（排行榜）
r.zadd('game:rank', {'player1': 100, 'player2': 200})
rank = r.zrevrange('game:rank', 0, 9, withscores=True)

# 分布式锁
lock_key = 'lock:order:123'
if r.set(lock_key, 'uuid', nx=True, ex=30):
    try:
        # 执行业务逻辑
        pass
    finally:
        # 使用 Lua 脚本释放锁
        lua_script = """
        if redis.call('get', KEYS[1]) == ARGV[1] then
            return redis.call('del', KEYS[1])
        else
            return 0
        end
        """
        r.eval(lua_script, 1, lock_key, 'uuid')
```



<!-- research-notes: enhanced-v1 -->

## 研究笔记增强

> Last reviewed: 2026-06-17。此节用于把《简介》从阅读笔记推进到可复习、可实践、可验证的研究笔记；具体版本、参数和环境仍需结合官方资料、项目约束和实测结果校准。

### 知识定位

同时关注数据结构、命令语义、持久化、复制、集群、内存模型和故障恢复。

### 重点补充
- 明确数据结构读写复杂度、过期策略和业务语义。
- 理解缓存穿透、击穿、雪崩、热 key、大 key 和一致性问题。
- 用 slowlog、latency、memory、monitor 和指标定位问题。
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
