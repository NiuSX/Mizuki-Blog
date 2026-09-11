# MyBatis 学习笔记：从入门到项目实战

> 这份笔记面向已经具备 Java、JDBC、SQL 基础，并希望系统掌握 MyBatis 的学习者。目标不是只会写 `selectById`，而是理解 MyBatis 的定位、执行流程、核心配置、Mapper 代理、XML 映射、动态 SQL、结果映射、关联查询、缓存、插件、事务、分页、Spring Boot 集成、性能优化和常见问题排查。

---

## 1. MyBatis 是什么

MyBatis 是一款优秀的持久层框架，它封装了 JDBC 的重复代码，让开发者可以把重点放在 SQL 和对象映射上。

传统 JDBC 开发需要手动处理：

- 加载驱动
- 获取连接
- 创建 `PreparedStatement`
- 设置 SQL 参数
- 执行 SQL
- 遍历 `ResultSet`
- 手动映射对象
- 关闭连接、语句和结果集
- 异常处理

MyBatis 帮我们处理了大量样板代码，但不会完全隐藏 SQL。开发者仍然可以直接编写和优化 SQL。

### 1.1 MyBatis 的核心特点

- SQL 可控，适合复杂查询。
- 支持 XML 和注解两种写法。
- 支持动态 SQL。
- 支持对象关系映射。
- 支持一级缓存和二级缓存。
- 支持插件拦截执行过程。
- 与 Spring、Spring Boot 集成成熟。
- 学习成本低于完整 ORM 框架。

### 1.2 MyBatis 不是完整 ORM

Hibernate/JPA 是完整 ORM，强调对象模型和数据库表之间的映射，很多 SQL 可以由框架自动生成。

MyBatis 是半自动 ORM，强调 SQL 由开发者控制，框架负责参数绑定、结果映射和执行流程管理。

对比：

| 对比项 | MyBatis | JPA/Hibernate |
| --- | --- | --- |
| SQL 控制 | 强，开发者手写 SQL | 框架生成为主，也可手写 |
| 学习成本 | 中等 | 较高 |
| 复杂查询 | 更直接 | 需要 JPQL、Criteria 或 native SQL |
| 对象状态管理 | 简单 | 有持久化上下文、脏检查、懒加载 |
| 性能可控性 | 强 | 需要理解 ORM 行为 |
| 国内使用 | 非常广泛 | 也常见，但后台系统中 MyBatis 更多 |

一句话理解：MyBatis 适合“SQL 很重要、业务查询复杂、团队希望直接掌控数据库访问”的项目。

---

## 2. MyBatis 解决了什么问题

### 2.1 JDBC 的问题

JDBC 查询示例：

```java
Connection connection = dataSource.getConnection();
PreparedStatement ps = connection.prepareStatement(
        "select id, username, email from user where id = ?"
);
ps.setLong(1, id);
ResultSet rs = ps.executeQuery();

User user = null;
if (rs.next()) {
    user = new User();
    user.setId(rs.getLong("id"));
    user.setUsername(rs.getString("username"));
    user.setEmail(rs.getString("email"));
}

rs.close();
ps.close();
connection.close();
```

问题：

- 重复代码多。
- 资源关闭繁琐。
- 参数绑定容易出错。
- 结果集映射重复。
- SQL 和 Java 代码混在一起。
- 复杂动态 SQL 拼接困难。

### 2.2 MyBatis 的改进

Mapper 接口：

```java
public interface UserMapper {
    User selectById(Long id);
}
```

XML：

```xml
<select id="selectById" resultType="com.example.User">
    select id, username, email
    from user
    where id = #{id}
</select>
```

调用：

```java
User user = userMapper.selectById(1L);
```

MyBatis 负责：

- 找到 SQL。
- 绑定参数。
- 执行 SQL。
- 映射结果。
- 处理资源。

开发者负责：

- 设计 SQL。
- 设计对象。
- 设计 Mapper 方法。
- 处理业务逻辑。

---

## 3. MyBatis 核心组件

### 3.1 SqlSessionFactory

`SqlSessionFactory` 是创建 `SqlSession` 的工厂。它通常在应用启动时创建一次，整个应用共享。

它包含 MyBatis 的全局配置、数据源、事务工厂、Mapper 映射信息等。

### 3.2 SqlSession

`SqlSession` 是 MyBatis 执行 SQL 的核心入口。它提供：

- 查询
- 插入
- 更新
- 删除
- 提交事务
- 回滚事务
- 获取 Mapper 代理对象

注意：`SqlSession` 不是线程安全的。不能作为单例共享。

### 3.3 Executor

Executor 是真正执行 SQL 的组件。常见类型：

- `SimpleExecutor`: 默认，每次执行创建新的 Statement。
- `ReuseExecutor`: 复用 Statement。
- `BatchExecutor`: 批处理执行。

### 3.4 MappedStatement

每个 XML 或注解中的 SQL 语句都会被解析成一个 `MappedStatement`。

例如：

```xml
<select id="selectById">
```

会对应一个 `MappedStatement`，完整 ID 通常是：

```text
com.example.mapper.UserMapper.selectById
```

### 3.5 Mapper 代理

开发者通常不直接使用 `SqlSession.selectOne`，而是通过 Mapper 接口调用。

```java
User user = userMapper.selectById(1L);
```

MyBatis 会为 Mapper 接口生成代理对象。方法调用时，根据接口全限定名和方法名找到对应 SQL。

---

## 4. MyBatis 执行流程

一次 Mapper 方法调用大致流程：

```text
调用 Mapper 接口方法
-> Mapper 代理拦截
-> 根据 namespace + methodName 找到 MappedStatement
-> 解析 SQL 和参数
-> 创建 Statement
-> 设置参数
-> 执行 SQL
-> 处理 ResultSet
-> 映射为 Java 对象
-> 返回结果
```

例如：

```java
userMapper.selectById(1L);
```

对应：

```text
namespace = com.example.mapper.UserMapper
id = selectById
statementId = com.example.mapper.UserMapper.selectById
```

XML 中必须匹配：

```xml
<mapper namespace="com.example.mapper.UserMapper">
    <select id="selectById">
        ...
    </select>
</mapper>
```

如果 namespace 或 id 不匹配，就会报类似错误：

```text
Invalid bound statement (not found)
```

---

## 5. 快速入门：原生 MyBatis

### 5.1 Maven 依赖

```xml
<dependencies>
    <dependency>
        <groupId>org.mybatis</groupId>
        <artifactId>mybatis</artifactId>
        <version>3.5.16</version>
    </dependency>
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <version>8.4.0</version>
    </dependency>
</dependencies>
```

版本会随时间更新，实际项目建议由 Spring Boot 或公司 BOM 统一管理依赖版本。

### 5.2 数据库表

```sql
create table user (
    id bigint primary key auto_increment,
    username varchar(64) not null,
    email varchar(128),
    age int,
    created_at datetime not null,
    updated_at datetime not null
);
```

### 5.3 实体类

```java
public class User {
    private Long id;
    private String username;
    private String email;
    private Integer age;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // getter/setter
}
```

### 5.4 Mapper 接口

```java
package com.example.mapper;

import com.example.domain.User;

public interface UserMapper {
    User selectById(Long id);
}
```

### 5.5 Mapper XML

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "https://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.example.mapper.UserMapper">
    <select id="selectById" resultType="com.example.domain.User">
        select id, username, email, age, created_at as createdAt, updated_at as updatedAt
        from user
        where id = #{id}
    </select>
</mapper>
```

### 5.6 mybatis-config.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "https://mybatis.org/dtd/mybatis-3-config.dtd">

<configuration>
    <settings>
        <setting name="mapUnderscoreToCamelCase" value="true"/>
    </settings>

    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
                <property name="url" value="jdbc:mysql://localhost:3306/demo?serverTimezone=Asia/Shanghai"/>
                <property name="username" value="root"/>
                <property name="password" value="root"/>
            </dataSource>
        </environment>
    </environments>

    <mappers>
        <mapper resource="mapper/UserMapper.xml"/>
    </mappers>
</configuration>
```

### 5.7 测试调用

```java
try (InputStream inputStream = Resources.getResourceAsStream("mybatis-config.xml")) {
    SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(inputStream);
    try (SqlSession session = factory.openSession()) {
        UserMapper mapper = session.getMapper(UserMapper.class);
        User user = mapper.selectById(1L);
        System.out.println(user.getUsername());
    }
}
```

原生 MyBatis 有助于理解底层，但实际 Spring Boot 项目通常不手动创建 `SqlSessionFactory` 和 `SqlSession`。

---

## 6. Spring Boot 集成 MyBatis

### 6.1 添加依赖

```xml
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>3.0.3</version>
</dependency>

<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

实际版本应以项目 Spring Boot 版本兼容矩阵为准。

### 6.2 application.yml

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/demo?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: root
    password: root
    driver-class-name: com.mysql.cj.jdbc.Driver

mybatis:
  mapper-locations: classpath*:mapper/**/*.xml
  type-aliases-package: com.example.demo.domain
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
```

### 6.3 启动类扫描 Mapper

方式一：启动类添加 `@MapperScan`

```java
@MapperScan("com.example.demo.mapper")
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

方式二：每个 Mapper 接口添加 `@Mapper`

```java
@Mapper
public interface UserMapper {
}
```

推荐在中大型项目中使用 `@MapperScan`，避免每个 Mapper 都写注解。

### 6.4 目录结构

常见结构：

```text
src/main/java/com/example/demo
├── DemoApplication.java
├── controller
├── service
├── mapper
│   └── UserMapper.java
└── domain
    └── UserDO.java

src/main/resources
├── application.yml
└── mapper
    └── UserMapper.xml
```

注意：如果 XML 放在 `src/main/java` 下，Maven 默认可能不会打包进去。推荐放在 `src/main/resources/mapper` 下。

---

## 7. Mapper 接口与 XML 绑定规则

Mapper 接口：

```java
package com.example.demo.mapper;

public interface UserMapper {
    UserDO selectById(Long id);
}
```

XML：

```xml
<mapper namespace="com.example.demo.mapper.UserMapper">
    <select id="selectById" resultType="com.example.demo.domain.UserDO">
        select * from user where id = #{id}
    </select>
</mapper>
```

绑定规则：

1. XML 的 `namespace` 必须等于 Mapper 接口全限定名。
2. SQL 标签的 `id` 必须等于 Mapper 方法名。
3. 参数类型要能匹配方法参数。
4. 返回类型要能映射方法返回值。
5. XML 文件必须被 MyBatis 扫描到。

常见错误：

```text
Invalid bound statement (not found)
```

排查方向：

- namespace 是否写错。
- id 是否和方法名一致。
- XML 是否在 resources 下。
- `mapper-locations` 是否配置正确。
- 打包后 target/classes 下是否存在 XML。
- 多模块项目资源是否被正确引入。

---

## 8. XML 基础标签

MyBatis XML 中常用四类 SQL 标签：

```xml
<select>
<insert>
<update>
<delete>
```

### 8.1 select

```xml
<select id="selectById" parameterType="long" resultType="UserDO">
    select id, username, email
    from user
    where id = #{id}
</select>
```

常用属性：

| 属性 | 说明 |
| --- | --- |
| `id` | SQL 语句唯一标识，对应 Mapper 方法名 |
| `parameterType` | 参数类型，很多情况下可省略 |
| `resultType` | 返回对象类型 |
| `resultMap` | 自定义结果映射 |
| `timeout` | 超时时间 |
| `fetchSize` | JDBC fetch size |
| `useCache` | 是否使用二级缓存 |
| `flushCache` | 是否刷新缓存 |

### 8.2 insert

```xml
<insert id="insert" parameterType="UserDO">
    insert into user(username, email, age, created_at, updated_at)
    values(#{username}, #{email}, #{age}, #{createdAt}, #{updatedAt})
</insert>
```

### 8.3 update

```xml
<update id="updateEmail">
    update user
    set email = #{email}, updated_at = now()
    where id = #{id}
</update>
```

### 8.4 delete

```xml
<delete id="deleteById">
    delete from user
    where id = #{id}
</delete>
```

实际业务中通常更推荐逻辑删除，而不是物理删除。

---

## 9. 参数传递

### 9.1 单个简单参数

Mapper：

```java
UserDO selectById(Long id);
```

XML：

```xml
<select id="selectById" resultType="UserDO">
    select * from user where id = #{id}
</select>
```

单个简单参数时，`#{id}` 中的名字多数情况下可以正常使用。但为了可读性和稳定性，推荐使用 `@Param`。

### 9.2 多个参数

Mapper：

```java
UserDO selectByUsernameAndStatus(@Param("username") String username,
                                 @Param("status") Integer status);
```

XML：

```xml
<select id="selectByUsernameAndStatus" resultType="UserDO">
    select *
    from user
    where username = #{username}
      and status = #{status}
</select>
```

不使用 `@Param` 时，MyBatis 会使用 `param1`、`param2` 等默认名称，代码可读性差，不推荐。

### 9.3 对象参数

Mapper：

```java
int insert(UserDO user);
```

XML：

```xml
<insert id="insert">
    insert into user(username, email, age)
    values(#{username}, #{email}, #{age})
</insert>
```

`#{username}` 会读取 `user.getUsername()`。

### 9.4 Map 参数

```java
List<UserDO> selectByMap(Map<String, Object> params);
```

```xml
<select id="selectByMap" resultType="UserDO">
    select *
    from user
    where username = #{username}
</select>
```

Map 灵活，但类型不安全。业务代码中不建议大量使用 Map 作为 Mapper 参数，优先使用 DTO 或明确参数。

---

## 10. `#{}` 与 `${}` 的区别

这是 MyBatis 最重要的基础之一。

### 10.1 `#{}`

`#{}` 使用 PreparedStatement 占位符，会进行参数预编译。

```xml
where username = #{username}
```

最终类似：

```sql
where username = ?
```

优点：

- 防 SQL 注入。
- 自动处理类型转换。
- 推荐用于普通值参数。

### 10.2 `${}`

`${}` 是字符串替换，会直接把内容拼进 SQL。

```xml
order by ${sortField}
```

如果传入：

```text
id desc; drop table user;
```

就可能造成 SQL 注入。

### 10.3 什么时候使用 `${}`

只有 SQL 结构的一部分不能用 `#{}` 时才考虑 `${}`，例如：

- 动态表名
- 动态列名
- 动态排序字段

必须配合白名单：

```java
private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("id", "created_at", "username");

if (!ALLOWED_SORT_FIELDS.contains(sortField)) {
    throw new IllegalArgumentException("invalid sort field");
}
```

总结：

| 写法 | 本质 | 安全性 | 场景 |
| --- | --- | --- | --- |
| `#{}` | 预编译占位符 | 安全 | 参数值 |
| `${}` | 字符串拼接 | 危险 | 表名、列名等 SQL 片段 |

能用 `#{}` 就不要用 `${}`。

---

## 11. 结果映射 resultType

### 11.1 字段名和属性名一致

SQL：

```sql
select id, username, email from user
```

Java：

```java
private Long id;
private String username;
private String email;
```

可以直接：

```xml
<select id="selectById" resultType="UserDO">
    select id, username, email
    from user
    where id = #{id}
</select>
```

### 11.2 下划线转驼峰

数据库：

```text
created_at
```

Java：

```text
createdAt
```

开启配置：

```yaml
mybatis:
  configuration:
    map-underscore-to-camel-case: true
```

这样 `created_at` 可以自动映射到 `createdAt`。

### 11.3 使用别名

也可以在 SQL 中写别名：

```xml
<select id="selectById" resultType="UserDO">
    select id,
           username,
           created_at as createdAt
    from user
    where id = #{id}
</select>
```

---

## 12. resultMap 详解

当字段和属性无法简单自动映射，或存在关联对象、集合映射时，应使用 `resultMap`。

### 12.1 基本 resultMap

```xml
<resultMap id="UserResultMap" type="com.example.demo.domain.UserDO">
    <id property="id" column="id"/>
    <result property="username" column="username"/>
    <result property="email" column="email"/>
    <result property="createdAt" column="created_at"/>
    <result property="updatedAt" column="updated_at"/>
</resultMap>
```

使用：

```xml
<select id="selectById" resultMap="UserResultMap">
    select id, username, email, created_at, updated_at
    from user
    where id = #{id}
</select>
```

### 12.2 id 与 result

| 标签 | 作用 |
| --- | --- |
| `<id>` | 主键字段映射 |
| `<result>` | 普通字段映射 |

`<id>` 不只是语义标识。在复杂嵌套结果映射中，MyBatis 会用它判断对象是否重复。

### 12.3 推荐写 resultMap 的场景

- 字段映射复杂。
- 一对一关联。
- 一对多关联。
- 查询列带前缀。
- 需要复用映射规则。
- 返回对象与表结构差异较大。

---

## 13. 类型别名 typeAliases

类型别名可以简化 XML 中的类名。

配置：

```yaml
mybatis:
  type-aliases-package: com.example.demo.domain
```

原本：

```xml
resultType="com.example.demo.domain.UserDO"
```

可以写成：

```xml
resultType="UserDO"
```

建议：

- 中小项目可以用别名。
- 大型项目如果类名容易冲突，要谨慎。
- 即使使用别名，也要保持命名清晰，例如 `UserDO`、`OrderDO`。

---

## 14. 动态 SQL

动态 SQL 是 MyBatis 的核心优势之一。

常用标签：

- `<if>`
- `<where>`
- `<trim>`
- `<set>`
- `<choose>`
- `<when>`
- `<otherwise>`
- `<foreach>`
- `<bind>`
- `<sql>`
- `<include>`

### 14.1 if

```xml
<select id="selectByCondition" resultType="UserDO">
    select *
    from user
    where 1 = 1
    <if test="username != null and username != ''">
        and username = #{username}
    </if>
    <if test="status != null">
        and status = #{status}
    </if>
</select>
```

`where 1 = 1` 简单直接，但更推荐使用 `<where>`。

### 14.2 where

```xml
<select id="selectByCondition" resultType="UserDO">
    select *
    from user
    <where>
        <if test="username != null and username != ''">
            and username = #{username}
        </if>
        <if test="status != null">
            and status = #{status}
        </if>
    </where>
</select>
```

`<where>` 会自动：

- 有条件时添加 `where`
- 去掉开头多余的 `and` 或 `or`

### 14.3 set

用于动态更新。

```xml
<update id="updateSelective">
    update user
    <set>
        <if test="username != null">
            username = #{username},
        </if>
        <if test="email != null">
            email = #{email},
        </if>
        <if test="age != null">
            age = #{age},
        </if>
        updated_at = now()
    </set>
    where id = #{id}
</update>
```

`<set>` 会自动去掉末尾多余逗号。

### 14.4 trim

`<trim>` 是更通用的拼接控制。

```xml
<trim prefix="where" prefixOverrides="and |or ">
    <if test="username != null">
        and username = #{username}
    </if>
    <if test="email != null">
        and email = #{email}
    </if>
</trim>
```

模拟 `<set>`：

```xml
<trim prefix="set" suffixOverrides=",">
    <if test="username != null">
        username = #{username},
    </if>
    <if test="email != null">
        email = #{email},
    </if>
</trim>
```

### 14.5 choose when otherwise

类似 Java 的 `if else`。

```xml
<select id="selectByKeyword" resultType="UserDO">
    select *
    from user
    <where>
        <choose>
            <when test="username != null and username != ''">
                username = #{username}
            </when>
            <when test="email != null and email != ''">
                email = #{email}
            </when>
            <otherwise>
                status = 1
            </otherwise>
        </choose>
    </where>
</select>
```

只会命中一个分支。

### 14.6 foreach

常用于 `in` 查询和批量插入。

#### in 查询

Mapper：

```java
List<UserDO> selectByIds(@Param("ids") List<Long> ids);
```

XML：

```xml
<select id="selectByIds" resultType="UserDO">
    select *
    from user
    where id in
    <foreach collection="ids" item="id" open="(" separator="," close=")">
        #{id}
    </foreach>
</select>
```

#### 批量插入

```xml
<insert id="batchInsert">
    insert into user(username, email, age, created_at, updated_at)
    values
    <foreach collection="list" item="item" separator=",">
        (#{item.username}, #{item.email}, #{item.age}, now(), now())
    </foreach>
</insert>
```

注意：超大批量插入不要一次拼接过多 values，可能超过 SQL 长度限制或影响数据库性能。应分批处理。

### 14.7 bind

`<bind>` 用于创建变量，常见于模糊查询。

```xml
<select id="searchByUsername" resultType="UserDO">
    <bind name="pattern" value="'%' + username + '%'"/>
    select *
    from user
    where username like #{pattern}
</select>
```

也可以在 Java 层拼好 `%keyword%` 后传入，通常更清晰。

### 14.8 sql 和 include

用于复用 SQL 片段。

```xml
<sql id="Base_Column_List">
    id, username, email, age, created_at, updated_at
</sql>
```

使用：

```xml
<select id="selectById" resultType="UserDO">
    select
    <include refid="Base_Column_List"/>
    from user
    where id = #{id}
</select>
```

使用建议：

- 可以复用基础列名。
- 不要过度拆分 SQL，避免可读性下降。
- 复杂 SQL 片段复用要考虑上下文依赖。

---

## 15. OGNL 表达式

动态 SQL 中的 `test` 使用 OGNL 表达式。

常见写法：

```xml
<if test="name != null and name != ''">
```

```xml
<if test="ids != null and ids.size() > 0">
```

```xml
<if test="user != null and user.id != null">
```

注意：

- 字符串判空常写 `str != null and str != ''`。
- 集合判空常写 `list != null and list.size() > 0`。
- 多参数时建议使用 `@Param` 明确命名。

---

## 16. 插入与自增主键

### 16.1 MySQL 自增主键

Mapper：

```java
int insert(UserDO user);
```

XML：

```xml
<insert id="insert" useGeneratedKeys="true" keyProperty="id">
    insert into user(username, email, age, created_at, updated_at)
    values(#{username}, #{email}, #{age}, now(), now())
</insert>
```

插入后，`user.getId()` 可以拿到生成的主键。

### 16.2 selectKey

适用于需要插入前或插入后查询主键的场景。

```xml
<insert id="insert">
    <selectKey keyProperty="id" resultType="long" order="BEFORE">
        select nextval('user_seq')
    </selectKey>
    insert into user(id, username, email)
    values(#{id}, #{username}, #{email})
</insert>
```

MySQL 自增通常用 `useGeneratedKeys` 更简单。

---

## 17. 更新策略

### 17.1 全量更新

```xml
<update id="update">
    update user
    set username = #{username},
        email = #{email},
        age = #{age},
        updated_at = now()
    where id = #{id}
</update>
```

风险：如果某些字段为 null，会把数据库字段更新为 null。

### 17.2 选择性更新

```xml
<update id="updateSelective">
    update user
    <set>
        <if test="username != null">
            username = #{username},
        </if>
        <if test="email != null">
            email = #{email},
        </if>
        <if test="age != null">
            age = #{age},
        </if>
        updated_at = now()
    </set>
    where id = #{id}
</update>
```

风险：无法区分“字段不更新”和“字段更新为 null”。如果业务需要主动清空字段，应设计专门请求对象或更新语义。

### 17.3 乐观锁更新

表增加 version：

```sql
alter table user add column version int not null default 0;
```

更新：

```xml
<update id="updateWithVersion">
    update user
    set email = #{email},
        version = version + 1,
        updated_at = now()
    where id = #{id}
      and version = #{version}
</update>
```

如果返回影响行数为 0，说明数据已被别人修改或记录不存在。

---

## 18. 逻辑删除

很多业务不直接删除数据，而是使用逻辑删除。

表字段：

```sql
deleted tinyint not null default 0
```

删除：

```xml
<update id="deleteById">
    update user
    set deleted = 1,
        updated_at = now()
    where id = #{id}
</update>
```

查询：

```xml
<select id="selectById" resultType="UserDO">
    select *
    from user
    where id = #{id}
      and deleted = 0
</select>
```

注意：

- 所有查询都要加 `deleted = 0`。
- 唯一索引需要考虑逻辑删除后的重复问题。
- 可通过组合唯一索引或归档策略解决。

---

## 19. 一对一关联映射

假设一个用户有一个用户资料。

表：

```sql
create table user_profile (
    id bigint primary key auto_increment,
    user_id bigint not null,
    address varchar(255),
    birthday date
);
```

对象：

```java
public class UserDetail {
    private Long id;
    private String username;
    private UserProfile profile;
}
```

```java
public class UserProfile {
    private Long id;
    private Long userId;
    private String address;
    private LocalDate birthday;
}
```

### 19.1 嵌套结果映射

```xml
<resultMap id="UserDetailResultMap" type="UserDetail">
    <id property="id" column="user_id"/>
    <result property="username" column="username"/>
    <association property="profile" javaType="UserProfile">
        <id property="id" column="profile_id"/>
        <result property="userId" column="profile_user_id"/>
        <result property="address" column="address"/>
        <result property="birthday" column="birthday"/>
    </association>
</resultMap>

<select id="selectDetailById" resultMap="UserDetailResultMap">
    select u.id as user_id,
           u.username,
           p.id as profile_id,
           p.user_id as profile_user_id,
           p.address,
           p.birthday
    from user u
    left join user_profile p on p.user_id = u.id
    where u.id = #{id}
</select>
```

优点：

- 一条 SQL 查询完成。
- 避免 N+1 查询。

缺点：

- SQL 复杂时映射配置较长。

---

## 20. 一对多关联映射

假设一个用户有多个订单。

对象：

```java
public class UserWithOrders {
    private Long id;
    private String username;
    private List<OrderDO> orders;
}
```

### 20.1 collection 嵌套结果

```xml
<resultMap id="UserWithOrdersResultMap" type="UserWithOrders">
    <id property="id" column="user_id"/>
    <result property="username" column="username"/>
    <collection property="orders" ofType="OrderDO">
        <id property="id" column="order_id"/>
        <result property="orderNo" column="order_no"/>
        <result property="amount" column="amount"/>
    </collection>
</resultMap>

<select id="selectUserWithOrders" resultMap="UserWithOrdersResultMap">
    select u.id as user_id,
           u.username,
           o.id as order_id,
           o.order_no,
           o.amount
    from user u
    left join orders o on o.user_id = u.id
    where u.id = #{id}
</select>
```

### 20.2 一对多分页陷阱

如果对 join 后的结果直接分页，可能分页的是行，不是主对象。

例如一个用户有 10 个订单，join 后有 10 行。对 join 结果 limit 10，可能只返回一个用户。

解决方案：

1. 先分页查主表 ID，再查询关联数据。
2. 使用两次查询组装。
3. 根据场景使用窗口函数或子查询。

实际业务中，一对多列表分页要特别谨慎。

---

## 21. 懒加载

MyBatis 支持关联查询懒加载，但实际项目中使用要谨慎。

配置：

```xml
<settings>
    <setting name="lazyLoadingEnabled" value="true"/>
    <setting name="aggressiveLazyLoading" value="false"/>
</settings>
```

嵌套查询：

```xml
<resultMap id="UserResultMap" type="User">
    <id property="id" column="id"/>
    <result property="username" column="username"/>
    <collection property="orders"
                column="id"
                select="com.example.mapper.OrderMapper.selectByUserId"/>
</resultMap>
```

风险：

- 容易引发 N+1 查询。
- 序列化对象时可能触发大量 SQL。
- 在事务或 session 关闭后可能加载失败。

很多团队更倾向显式查询和组装，避免隐式懒加载带来的不可控行为。

---

## 22. N+1 查询问题

N+1 指先查询 1 次主列表，再对每条记录查询一次关联数据。

示例：

```text
select * from user limit 20;
select * from orders where user_id = 1;
select * from orders where user_id = 2;
...
select * from orders where user_id = 20;
```

总共 21 次查询。

解决：

1. 使用 join 一次查出。
2. 先查用户列表，再用 `where user_id in (...)` 批量查订单。
3. 在 Java 层按 `userId` 分组组装。

推荐批量查询组装：

```java
List<UserDO> users = userMapper.selectPage(offset, size);
List<Long> userIds = users.stream().map(UserDO::getId).toList();
List<OrderDO> orders = orderMapper.selectByUserIds(userIds);
Map<Long, List<OrderDO>> orderMap = orders.stream()
        .collect(Collectors.groupingBy(OrderDO::getUserId));
```

这种方式 SQL 可控，也适合分页。

---

## 23. 缓存机制

MyBatis 有一级缓存和二级缓存。

### 23.1 一级缓存

一级缓存是 `SqlSession` 级别缓存，默认开启。

同一个 `SqlSession` 中，执行相同查询可能直接命中缓存。

特点：

- 默认开启。
- 作用范围是 SqlSession。
- insert、update、delete 会清空当前 SqlSession 缓存。
- Spring 集成环境中，每次 Mapper 方法通常由 Spring 管理 SqlSession，一级缓存感知不明显。

### 23.2 一级缓存问题

在长事务中，如果同一个 SqlSession 查询过数据，之后数据库被其他事务修改，再次查询可能读到缓存旧数据。

可以设置：

```xml
<setting name="localCacheScope" value="STATEMENT"/>
```

`STATEMENT` 表示一级缓存只在单条语句执行期间有效。

### 23.3 二级缓存

二级缓存是 namespace 级别缓存，需要手动开启。

全局配置：

```xml
<setting name="cacheEnabled" value="true"/>
```

Mapper XML：

```xml
<cache/>
```

对象需要可序列化：

```java
public class UserDO implements Serializable {
}
```

### 23.4 二级缓存风险

二级缓存很容易产生一致性问题：

- 多表关联查询缓存难失效。
- 不同 namespace 修改同一张表时缓存不一定清理。
- 分布式应用本地缓存不共享。

实际项目中更常用 Redis、Caffeine 等专门缓存方案，而不是 MyBatis 二级缓存。

---

## 24. 插件机制

MyBatis 插件可以拦截核心对象方法：

- Executor
- StatementHandler
- ParameterHandler
- ResultSetHandler

常见用途：

- 分页
- SQL 日志
- 数据权限
- 多租户
- SQL 性能统计
- 字段自动填充

### 24.1 插件示例

```java
@Intercepts({
        @Signature(type = Executor.class,
                method = "query",
                args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class})
})
public class SqlLogInterceptor implements Interceptor {

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        long start = System.currentTimeMillis();
        try {
            return invocation.proceed();
        } finally {
            long cost = System.currentTimeMillis() - start;
            System.out.println("SQL cost: " + cost + "ms");
        }
    }
}
```

插件很强，但也容易影响全局 SQL 执行。生产项目使用插件时要控制范围、做好测试。

---

## 25. 分页

### 25.1 手写分页

Mapper：

```java
List<UserDO> selectPage(@Param("offset") int offset, @Param("size") int size);
```

XML：

```xml
<select id="selectPage" resultType="UserDO">
    select *
    from user
    where deleted = 0
    order by id desc
    limit #{offset}, #{size}
</select>
```

总数：

```xml
<select id="countUsers" resultType="long">
    select count(1)
    from user
    where deleted = 0
</select>
```

### 25.2 PageHelper

PageHelper 是常见 MyBatis 分页插件。

使用：

```java
PageHelper.startPage(pageNum, pageSize);
List<UserDO> users = userMapper.selectByCondition(condition);
PageInfo<UserDO> pageInfo = new PageInfo<>(users);
```

注意：`startPage` 只对紧跟着的第一个查询生效，使用时要避免中间插入其他查询。

### 25.3 深分页问题

```sql
select * from user order by id limit 1000000, 20;
```

深分页会扫描大量数据后丢弃前面部分，性能差。

优化：

基于游标：

```sql
select *
from user
where id < #{lastId}
order by id desc
limit #{size}
```

适合无限滚动、列表翻页到下一页等场景。

---

## 26. 批处理

### 26.1 foreach 批量插入

```xml
<insert id="batchInsert">
    insert into user(username, email, created_at, updated_at)
    values
    <foreach collection="list" item="item" separator=",">
        (#{item.username}, #{item.email}, now(), now())
    </foreach>
</insert>
```

适合中小批量。

### 26.2 BatchExecutor

原生 MyBatis：

```java
try (SqlSession session = sqlSessionFactory.openSession(ExecutorType.BATCH)) {
    UserMapper mapper = session.getMapper(UserMapper.class);
    for (UserDO user : users) {
        mapper.insert(user);
    }
    session.commit();
}
```

Spring 中可配置 `SqlSessionTemplate` 使用 batch，但复杂度更高。

### 26.3 批处理建议

- 控制每批数量，例如 500 或 1000。
- 避免单条 SQL 过大。
- 注意事务大小，过大事务会影响数据库。
- 批量失败时要设计重试和错误记录。

---

## 27. 事务管理

### 27.1 原生 MyBatis 事务

```java
SqlSession session = sqlSessionFactory.openSession(false);
try {
    UserMapper mapper = session.getMapper(UserMapper.class);
    mapper.insert(user);
    session.commit();
} catch (Exception e) {
    session.rollback();
    throw e;
} finally {
    session.close();
}
```

### 27.2 Spring 事务

Spring Boot 项目中通常使用 `@Transactional`。

```java
@Service
public class UserService {
    private final UserMapper userMapper;

    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Transactional
    public Long createUser(CreateUserRequest request) {
        UserDO user = new UserDO();
        user.setUsername(request.getUsername());
        userMapper.insert(user);
        return user.getId();
    }
}
```

事务边界应放在 Service 层，而不是 Mapper 层。

### 27.3 事务失效常见原因

- 同类内部调用。
- 方法不是 public。
- 异常被 catch 后没有抛出。
- 抛出受检异常但没有配置 `rollbackFor`。
- 数据库表不支持事务。
- 多数据源事务没有正确配置。

---

## 28. MyBatis 与 Spring Boot 自动配置

`mybatis-spring-boot-starter` 会自动配置：

- `SqlSessionFactory`
- `SqlSessionTemplate`
- Mapper 扫描
- MyBatis 配置属性绑定
- Mapper XML 加载

### 28.1 SqlSessionTemplate

Spring 集成中，Mapper 调用底层使用 `SqlSessionTemplate`。它是线程安全的，负责：

- 获取当前事务绑定的 SqlSession。
- 管理 SqlSession 生命周期。
- 统一异常转换。

因此在 Spring 项目中不需要手动 close SqlSession。

### 28.2 Mapper Bean

`@MapperScan` 会扫描 Mapper 接口，为每个接口创建代理 Bean，注入到 Service 中。

```java
@Service
public class UserService {
    private final UserMapper userMapper;

    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }
}
```

---

## 29. 注解方式开发

MyBatis 支持注解写 SQL。

```java
@Mapper
public interface UserMapper {

    @Select("select id, username, email from user where id = #{id}")
    UserDO selectById(@Param("id") Long id);

    @Insert("insert into user(username, email) values(#{username}, #{email})")
    int insert(UserDO user);
}
```

优点：

- 简单 SQL 写起来快。
- 不需要 XML 文件。

缺点：

- 复杂 SQL 可读性差。
- 动态 SQL 不方便。
- SQL 和 Java 耦合更强。

推荐：

- 简单查询可以用注解。
- 复杂 SQL、动态 SQL、关联映射使用 XML。
- 团队内最好统一风格。

---

## 30. Provider 注解

Provider 可以用 Java 方法生成 SQL。

```java
@SelectProvider(type = UserSqlProvider.class, method = "selectByCondition")
List<UserDO> selectByCondition(UserQuery query);
```

```java
public class UserSqlProvider {
    public String selectByCondition(UserQuery query) {
        SQL sql = new SQL()
                .SELECT("id, username, email")
                .FROM("user");
        if (query.getUsername() != null) {
            sql.WHERE("username = #{username}");
        }
        if (query.getStatus() != null) {
            sql.WHERE("status = #{status}");
        }
        return sql.toString();
    }
}
```

Provider 适合非常动态的 SQL，但很多项目中 XML 动态 SQL 已经足够。

---

## 31. TypeHandler 类型处理器

TypeHandler 负责 Java 类型与 JDBC 类型之间的转换。

常见场景：

- 枚举与数据库值转换。
- JSON 字段与对象转换。
- 自定义加密字段。
- 特殊时间类型处理。

### 31.1 枚举 TypeHandler 示例

枚举：

```java
public enum UserStatus {
    ENABLED(1),
    DISABLED(0);

    private final int code;

    UserStatus(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}
```

TypeHandler：

```java
public class UserStatusTypeHandler extends BaseTypeHandler<UserStatus> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, UserStatus parameter, JdbcType jdbcType)
            throws SQLException {
        ps.setInt(i, parameter.getCode());
    }

    @Override
    public UserStatus getNullableResult(ResultSet rs, String columnName) throws SQLException {
        return fromCode(rs.getInt(columnName));
    }

    @Override
    public UserStatus getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        return fromCode(rs.getInt(columnIndex));
    }

    @Override
    public UserStatus getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        return fromCode(cs.getInt(columnIndex));
    }

    private UserStatus fromCode(int code) {
        return code == 1 ? UserStatus.ENABLED : UserStatus.DISABLED;
    }
}
```

配置扫描：

```yaml
mybatis:
  type-handlers-package: com.example.demo.mybatis.typehandler
```

---

## 32. 日志与 SQL 打印

### 32.1 MyBatis 标准输出

```yaml
mybatis:
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
```

适合本地开发，不适合生产。

### 32.2 使用日志框架

配置 Mapper 日志级别：

```yaml
logging:
  level:
    com.example.demo.mapper: debug
```

### 32.3 SQL 日志注意事项

- 生产环境不要打印过多 SQL。
- 不要记录敏感参数，例如密码、token。
- 慢 SQL 应由数据库慢查询日志、APM 或专门插件采集。

---

## 33. 代码生成器

MyBatis Generator、MyBatis-Plus Generator 等工具可以生成：

- Entity/DO
- Mapper 接口
- Mapper XML
- 基础 CRUD

优点：

- 减少重复代码。
- 对表很多的后台系统效率高。

缺点：

- 生成代码质量需要规范。
- 容易产生大量无用方法。
- 覆盖手写代码风险。

建议：

- 生成代码与手写代码分开。
- 生成后人工审查。
- 不要让生成器替代业务设计。

---

## 34. MyBatis-Plus 简介

MyBatis-Plus 是 MyBatis 的增强工具，在 MyBatis 基础上提供更便捷的 CRUD、条件构造器、分页插件、代码生成等能力。

### 34.1 BaseMapper

```java
public interface UserMapper extends BaseMapper<UserDO> {
}
```

可直接使用：

```java
userMapper.selectById(1L);
userMapper.insert(user);
```

### 34.2 条件构造器

```java
LambdaQueryWrapper<UserDO> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(UserDO::getStatus, 1)
       .like(UserDO::getUsername, keyword)
       .orderByDesc(UserDO::getId);
List<UserDO> users = userMapper.selectList(wrapper);
```

### 34.3 使用建议

MyBatis-Plus 适合后台 CRUD 较多的项目。但复杂 SQL 仍然建议写 XML 或自定义 Mapper。不要为了省几行 SQL，把复杂业务查询硬塞进 Wrapper。

---

## 35. 项目分层实践

推荐结构：

```text
controller
service
mapper
domain/entity
dto/request
dto/response
exception
config
```

职责：

| 层 | 职责 |
| --- | --- |
| Controller | 接收请求、参数校验、返回响应 |
| Service | 业务逻辑、事务控制、调用多个 Mapper |
| Mapper | 数据访问，只做 SQL |
| DO/Entity | 数据库对象 |
| DTO/Request | 请求参数 |
| VO/Response | 响应对象 |

### 35.1 Mapper 不写业务

不推荐：

```java
int deductStockAndCreateOrder(...);
```

Mapper 应表达数据操作，业务编排放在 Service。

推荐：

```java
int deductStock(@Param("skuId") Long skuId, @Param("quantity") Integer quantity);
int insertOrder(OrderDO order);
```

Service：

```java
@Transactional
public Long createOrder(CreateOrderRequest request) {
    int updated = stockMapper.deductStock(request.getSkuId(), request.getQuantity());
    if (updated == 0) {
        throw new BizException("库存不足");
    }
    orderMapper.insert(order);
    return order.getId();
}
```

---

## 36. 实战示例：用户模块

### 36.1 表结构

```sql
create table user (
    id bigint primary key auto_increment,
    username varchar(64) not null,
    email varchar(128),
    age int,
    status tinyint not null default 1,
    deleted tinyint not null default 0,
    created_at datetime not null,
    updated_at datetime not null,
    unique key uk_username_deleted (username, deleted),
    key idx_status_created_at (status, created_at)
);
```

### 36.2 DO

```java
public class UserDO {
    private Long id;
    private String username;
    private String email;
    private Integer age;
    private Integer status;
    private Integer deleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### 36.3 查询请求

```java
public class UserQuery {
    private String username;
    private Integer status;
    private Integer minAge;
    private Integer maxAge;
    private Integer offset;
    private Integer size;
}
```

### 36.4 Mapper 接口

```java
public interface UserMapper {
    UserDO selectById(@Param("id") Long id);

    UserDO selectByUsername(@Param("username") String username);

    List<UserDO> selectByCondition(UserQuery query);

    long countByCondition(UserQuery query);

    int insert(UserDO user);

    int updateSelective(UserDO user);

    int logicalDeleteById(@Param("id") Long id);
}
```

### 36.5 Mapper XML

```xml
<mapper namespace="com.example.demo.mapper.UserMapper">
    <resultMap id="UserResultMap" type="UserDO">
        <id property="id" column="id"/>
        <result property="username" column="username"/>
        <result property="email" column="email"/>
        <result property="age" column="age"/>
        <result property="status" column="status"/>
        <result property="deleted" column="deleted"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
    </resultMap>

    <sql id="BaseColumnList">
        id, username, email, age, status, deleted, created_at, updated_at
    </sql>

    <select id="selectById" resultMap="UserResultMap">
        select <include refid="BaseColumnList"/>
        from user
        where id = #{id}
          and deleted = 0
    </select>

    <select id="selectByUsername" resultMap="UserResultMap">
        select <include refid="BaseColumnList"/>
        from user
        where username = #{username}
          and deleted = 0
    </select>

    <select id="selectByCondition" resultMap="UserResultMap">
        select <include refid="BaseColumnList"/>
        from user
        <where>
            deleted = 0
            <if test="username != null and username != ''">
                and username like concat('%', #{username}, '%')
            </if>
            <if test="status != null">
                and status = #{status}
            </if>
            <if test="minAge != null">
                and age &gt;= #{minAge}
            </if>
            <if test="maxAge != null">
                and age &lt;= #{maxAge}
            </if>
        </where>
        order by id desc
        limit #{offset}, #{size}
    </select>

    <select id="countByCondition" resultType="long">
        select count(1)
        from user
        <where>
            deleted = 0
            <if test="username != null and username != ''">
                and username like concat('%', #{username}, '%')
            </if>
            <if test="status != null">
                and status = #{status}
            </if>
        </where>
    </select>

    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        insert into user(username, email, age, status, deleted, created_at, updated_at)
        values(#{username}, #{email}, #{age}, #{status}, 0, now(), now())
    </insert>

    <update id="updateSelective">
        update user
        <set>
            <if test="username != null">
                username = #{username},
            </if>
            <if test="email != null">
                email = #{email},
            </if>
            <if test="age != null">
                age = #{age},
            </if>
            <if test="status != null">
                status = #{status},
            </if>
            updated_at = now()
        </set>
        where id = #{id}
          and deleted = 0
    </update>

    <update id="logicalDeleteById">
        update user
        set deleted = 1,
            updated_at = now()
        where id = #{id}
          and deleted = 0
    </update>
</mapper>
```

### 36.6 Service

```java
@Service
public class UserService {
    private final UserMapper userMapper;

    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Transactional
    public Long create(CreateUserRequest request) {
        UserDO existed = userMapper.selectByUsername(request.getUsername());
        if (existed != null) {
            throw new BizException("用户名已存在");
        }

        UserDO user = new UserDO();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setAge(request.getAge());
        user.setStatus(1);
        userMapper.insert(user);
        return user.getId();
    }

    public UserDO detail(Long id) {
        UserDO user = userMapper.selectById(id);
        if (user == null) {
            throw new BizException("用户不存在");
        }
        return user;
    }
}
```

---

## 37. SQL 编写规范

### 37.1 查询字段不要直接 `select *`

不推荐：

```sql
select * from user
```

推荐：

```sql
select id, username, email, created_at
from user
```

原因：

- 减少传输数据。
- 避免表结构变化影响映射。
- 提升可读性。
- 有利于覆盖索引。

### 37.2 update/delete 必须带条件

危险：

```xml
<update id="updateStatus">
    update user set status = #{status}
</update>
```

应确保：

```xml
where id = #{id}
```

可以在测试或代码评审中重点检查无 where 的 update/delete。

### 37.3 模糊查询注意索引

```sql
where username like concat('%', #{keyword}, '%')
```

前置 `%` 通常无法使用普通 B+Tree 索引。大规模数据下应考虑：

- 前缀搜索 `keyword%`
- 全文索引
- 搜索引擎
- 冗余搜索字段

### 37.4 order by 字段白名单

动态排序不要直接使用用户输入：

```xml
order by ${sortField} ${sortOrder}
```

必须在 Java 层做白名单校验。

### 37.5 in 查询数量控制

```sql
where id in (...)
```

如果列表过长，SQL 会变大，数据库解析成本上升。应控制数量，必要时分批查询。

---

## 38. 性能优化

### 38.1 先看执行计划

MySQL：

```sql
explain select * from user where status = 1 order by created_at desc;
```

重点关注：

- type
- key
- rows
- Extra

### 38.2 常见优化方向

- 给 where 条件加合适索引。
- 避免函数作用在索引列上。
- 避免隐式类型转换。
- 控制返回字段。
- 控制返回行数。
- 使用分页。
- 避免 N+1 查询。
- 批量操作分批执行。
- 合理使用缓存。
- 避免长事务。

### 38.3 避免隐式类型转换

如果字段是 varchar：

```sql
where phone = 13800138000
```

数据库可能发生类型转换，导致索引失效。应传字符串：

```sql
where phone = '13800138000'
```

### 38.4 避免在索引列上使用函数

不推荐：

```sql
where date(created_at) = '2026-06-19'
```

推荐：

```sql
where created_at >= '2026-06-19 00:00:00'
  and created_at < '2026-06-20 00:00:00'
```

---

## 39. 常见异常排查

### 39.1 Invalid bound statement not found

原因：

- XML 没被扫描到。
- namespace 错误。
- SQL id 和方法名不一致。
- Mapper 接口路径和 XML 不匹配。
- 多模块资源未打包。

排查：

- 检查 `mapper-locations`。
- 检查 target/classes 中是否存在 XML。
- 检查 namespace 是否等于接口全限定名。
- 检查 id 是否等于方法名。

### 39.2 BindingException Parameter not found

原因：XML 中使用的参数名和 Mapper 方法参数名不一致。

解决：使用 `@Param`。

```java
UserDO select(@Param("username") String username, @Param("status") Integer status);
```

### 39.3 TooManyResultsException

原因：Mapper 方法返回单个对象，但 SQL 查询出了多行。

解决：

- 确认 where 条件唯一。
- 返回 List。
- 数据库加唯一约束。

### 39.4 Result Maps collection already contains value

原因：

- XML 中 resultMap id 重复。
- Mapper XML 被重复加载。
- namespace 或资源扫描配置重复。

### 39.5 Cannot determine value type from string

可能原因：

- XML 属性写错。
- 类型别名冲突。
- 配置值格式错误。

### 39.6 SQLSyntaxErrorException

原因：

- SQL 语法错误。
- 字段名错误。
- 表名错误。
- 动态 SQL 拼接后多了 and、逗号或 where。

排查：

- 打印最终 SQL。
- 复制到数据库客户端执行。
- 检查动态标签。

---

## 40. 测试

### 40.1 MyBatis Mapper 测试

Spring Boot 中可使用：

```java
@MybatisTest
class UserMapperTest {

    @Autowired
    private UserMapper userMapper;

    @Test
    void shouldSelectUserById() {
        UserDO user = userMapper.selectById(1L);
        assertThat(user).isNotNull();
    }
}
```

### 40.2 集成测试

```java
@SpringBootTest
class UserServiceTest {

    @Autowired
    private UserService userService;

    @Test
    void shouldCreateUser() {
        Long id = userService.create(new CreateUserRequest("alice"));
        assertThat(id).isNotNull();
    }
}
```

### 40.3 测试数据库

建议：

- 使用独立测试库。
- 使用 Testcontainers 启动真实 MySQL。
- 每个测试准备数据并清理。
- 不依赖开发环境脏数据。

Mapper 测试的重点是验证 SQL 正确性、映射正确性和边界条件。

---

## 41. 与 JPA 的选择建议

选择 MyBatis：

- 复杂 SQL 多。
- 报表查询多。
- 需要精细优化 SQL。
- 团队 SQL 能力较强。
- 数据库模型不是严格领域模型。

选择 JPA：

- CRUD 多。
- 领域模型清晰。
- 希望减少手写 SQL。
- 团队熟悉 ORM。
- 对对象关系建模要求高。

现实中也可以混用，但要控制边界，避免同一块业务既用 JPA 又用 MyBatis 造成维护混乱。

---

## 42. 学习路线

### 42.1 第一阶段：基础 CRUD

掌握：

- Mapper 接口
- XML 绑定规则
- `select/insert/update/delete`
- `#{}` 参数绑定
- `resultType`
- Spring Boot 集成

练习：

- 用户表增删改查。
- 根据用户名查询。
- 新增后返回自增 ID。

### 42.2 第二阶段：动态 SQL

掌握：

- `<if>`
- `<where>`
- `<set>`
- `<foreach>`
- `<choose>`
- `<sql>/<include>`

练习：

- 多条件查询用户列表。
- 选择性更新用户信息。
- 批量查询 ID 列表。
- 批量插入数据。

### 42.3 第三阶段：复杂映射

掌握：

- `resultMap`
- `association`
- `collection`
- 一对一
- 一对多
- N+1 问题

练习：

- 查询用户详情和资料。
- 查询用户及订单。
- 对用户列表分页并批量查询订单。

### 42.4 第四阶段：工程实战

掌握：

- 事务
- 分页
- 缓存
- TypeHandler
- SQL 性能优化
- 测试
- 常见异常排查

练习：

- 订单创建和库存扣减事务。
- 乐观锁更新库存。
- 慢 SQL explain 分析。
- Mapper 集成测试。

---

## 43. 面试常见问题

### 43.1 MyBatis 和 JDBC 的区别

JDBC 是 Java 原生数据库访问 API，需要手动处理连接、参数、结果集和资源关闭。MyBatis 封装了 JDBC 样板代码，提供 Mapper 接口、XML 映射、动态 SQL、结果映射、缓存和插件等能力，但 SQL 仍由开发者控制。

### 43.2 `#{}` 和 `${}` 的区别

`#{}` 使用 PreparedStatement 占位符，会预编译参数，能防 SQL 注入。`${}` 是字符串替换，会直接拼接 SQL，有 SQL 注入风险。普通参数必须用 `#{}`，动态表名、列名等 SQL 片段才可能使用 `${}`，且必须做白名单校验。

### 43.3 resultType 和 resultMap 的区别

`resultType` 用于简单自动映射，字段名和属性名能匹配时使用方便。`resultMap` 用于自定义映射，适合字段名不一致、复杂对象、一对一、一对多等场景。

### 43.4 MyBatis 一级缓存和二级缓存

一级缓存是 SqlSession 级别，默认开启。二级缓存是 namespace 级别，需要手动开启。实际项目中二级缓存容易有一致性问题，通常更推荐使用 Redis 或 Caffeine 等专门缓存方案。

### 43.5 Mapper 接口为什么不用写实现类

MyBatis 会为 Mapper 接口创建动态代理。调用接口方法时，根据接口全限定名和方法名找到对应的 MappedStatement，然后执行 SQL 并映射结果。

### 43.6 MyBatis 如何处理动态 SQL

MyBatis XML 支持 `<if>`、`<where>`、`<set>`、`<foreach>`、`<choose>` 等动态 SQL 标签。运行时会根据参数和 OGNL 表达式生成最终 SQL。

### 43.7 MyBatis 如何防止 SQL 注入

使用 `#{}` 进行参数绑定，底层通过 PreparedStatement 预编译。避免把用户输入通过 `${}` 直接拼接到 SQL 中。对于必须动态拼接的表名、字段名、排序字段，应使用白名单。

### 43.8 MyBatis 分页怎么做

可以手写 `limit offset, size`，也可以使用 PageHelper 等分页插件。深分页场景应考虑基于游标或 lastId 的分页方式，避免大 offset 带来的性能问题。

### 43.9 MyBatis 插件原理是什么

MyBatis 插件基于拦截器机制，可以拦截 Executor、StatementHandler、ParameterHandler、ResultSetHandler 的方法调用。常用于分页、SQL 日志、性能统计、数据权限等。

### 43.10 MyBatis 中如何处理一对多分页

不能简单对 join 后的结果分页，因为分页的是行而不是主对象。常见做法是先分页查询主表 ID，再批量查询关联表数据，最后在 Java 层组装。

---

## 44. 最佳实践总结

1. Mapper XML 的 namespace 必须等于接口全限定名。
2. 多参数方法使用 `@Param`。
3. 普通参数使用 `#{}`，谨慎使用 `${}`。
4. 查询字段尽量明确列名，不滥用 `select *`。
5. 复杂映射使用 `resultMap`。
6. 动态条件使用 `<where>`，动态更新使用 `<set>`。
7. 批量操作控制每批数量。
8. 不在 Mapper 写业务逻辑。
9. 事务放在 Service 层。
10. 一对多分页不要直接 join 后 limit。
11. 谨慎使用懒加载，避免 N+1。
12. 二级缓存慎用，优先考虑业务缓存方案。
13. 动态排序字段必须白名单。
14. update/delete 必须确认 where 条件。
15. 慢 SQL 用 explain 和监控定位。
16. Mapper 测试要覆盖核心 SQL。
17. XML 放在 resources 并确认会被打包。
18. 逻辑删除要统一查询条件。
19. 大对象、大字段避免在列表接口返回。
20. 生成器只能减少重复代码，不能替代设计。

---

## 45. 总结

MyBatis 的核心价值是让 SQL 和 Java 对象映射变得工程化。它不像 JPA 那样试图隐藏数据库，而是让开发者继续掌控 SQL，同时减少 JDBC 的重复劳动。

学习 MyBatis 要抓住几条主线：

- Mapper 接口和 XML 如何绑定。
- `#{}` 如何安全绑定参数，`${}` 为什么危险。
- `resultType` 和 `resultMap` 如何映射结果。
- 动态 SQL 如何生成灵活查询。
- 一对一、一对多如何映射以及如何避免 N+1。
- Spring Boot 中 Mapper 代理、SqlSessionTemplate 和事务如何协作。
- SQL 性能、分页、批处理和缓存如何在真实项目中取舍。

真正掌握 MyBatis，不是会写 XML 标签，而是能写出清晰、稳定、可维护、性能可控的数据访问层。建议以用户、商品、订单、库存这类常见业务为练习对象，完成 CRUD、条件查询、分页、批量操作、事务、乐观锁、关联查询和 Mapper 测试，这样才能把 MyBatis 从“会用”推进到“能在项目中可靠使用”。

