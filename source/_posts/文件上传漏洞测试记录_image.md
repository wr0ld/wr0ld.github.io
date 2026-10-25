---
title: 一次被报错"带着走"的文件上传测试
cover: >-
  https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260514_170043_oqva.png
categories:
  - [实战]
tags:
  - 渗透测试
  - 文件上传
  - Java
  - Spring
  - JSP
  - WebShell
abbrlink: d4e5f6g7
date: 2026-05-14 17:30:00
---
# 一次被报错"带着走"的文件上传测试

## 目录

- [前言](#前言)
- [目录扫描，发现上传接口](#目录扫描发现上传接口)
- [POST请求，跟着报错走](#post请求跟着报错走)
- [绕过文件类型检测](#绕过文件类型检测)
- [尝试GetShell](#尝试getshell)
- [总结](#总结)

---

## 前言

这次是在某站发现了一个文件上传接口，跟着一步一步的报错提示走，虽然最终没有 GetShell，但整个过程还是挺有意思的——后端的报错信息把自己的逻辑几乎都"说出来"了。记录一下。(已修复)

---

## 目录扫描，发现上传接口

用 kali 的 dirsearch 扫了一下目录接口。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260514_170043_iay0.png)

找到一个 `upload/` 路径，返回状态码 **200**，用浏览器访问一下：

```
https://xxx/upload/
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260514_170043_uukh.png)

页面显示"网站页面请求异常"，但从网页图标判断是 **Spring 框架**，抓包看看啥情况。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260514_170043_rdli.png)

返回 200 OK，但响应内容只有一个异常页。

---

## POST请求，跟着报错走

既然是文件上传接口，自然要试试 POST 方法。

### 第一步：换成POST方法

Burp 里右键直接"修改请求方法"改成 POST。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260514_170043_xcdk.png)

意料之中，那个警告没了，但出现了新的报错：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260514_170043_bto9.png)

```json
"message": "Current request is not a multipart request"
```

翻译一下：**"当前的请求不是一个多部分请求（文件上传请求）"**。

> **知识点：** `multipart/form-data` 是 HTTP 上传文件时使用的编码格式，区别于普通表单的 `application/x-www-form-urlencoded`。后端在等待一个 multipart 格式的请求体，而我们发送的是空的 form 格式，所以它拒绝了。这个错误特征也符合 **Java Spring Boot / Spring MVC** 的响应风格。

---

### 第二步：补上multipart格式

Burp 里右键"修改body编码"→ 选 Multipart，直接转换格式。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260514_170043_w0qq.png)

但是直接转换好像没有成功，那自己手动改吧：

1. 修改 `Content-Type` 头：

```
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
```

2. 修改 body 为 multipart 格式：

```
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="your_field_name"

your_value
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

这次又有新提示了：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260514_170043_oqva.png)

```json
"message": "Required request part 'uploadFile' is not present"
```

---

### 第三步：参数名泄露

这个报错直接把后端定义的**参数名**给说出来了——`uploadFile`。

> **知识点：** Spring MVC 中，`@RequestParam("uploadFile") MultipartFile file` 这种写法会在参数缺失时抛出 `MissingServletRequestPartException`，并把参数名暴露在错误信息里。对测试者来说这等于直接拿到了字段名，省去了猜参数的步骤。

根据报错提示，在 body 里加上对应字段：

```
Content-Disposition: form-data; name="uploadFile"; filename="test.txt"
```

这次又有提示了：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260514_170043_gmjd.png)

```
非法文件上传
```

这说明后端对上传的文件做了检测，开始尝试绕过。(其实这个只是一个简单的文件名后缀检测 , 绕了一圈才发现)

---

## 绕过文件类型检测

### 改Content-Type

先把 `Content-Type` 改成图片类型：

```
Content-Type: image/jpeg
```

这次提示变了：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260514_170043_vri5.png)

```json
"message": "RESTful请求异常"
```

被拒绝了，暂时不清楚原因。

### 加魔术字节（Magic Bytes）

尝试加上 GIF 的文件头（Magic Bytes）`GIF89a`(这里还忘记改文件后缀和类型了)：

```
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="uploadFile"; filename="test.jpg"
Content-Type: image/jpeg

GIF89a
asdfvsgvdg
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

> **知识点：** 文件的"魔术字节"（Magic Bytes）是文件开头的几个特定字节，用于标识文件类型，与文件后缀名无关。比如 GIF 文件以 `47 49 46 38`（即 `GIF8`）开头，JPEG 以 `FF D8 FF` 开头。一些安全意识不足的上传接口会同时校验 Content-Type 和文件头，但这两者都是客户端可控的。

出现了新的报错：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260514_170043_l5qi.png)

```json
"message": "Unexpected block type 115!"
```

问了一下 AI，解释说：这不是普通的 Web 逻辑报错，而是**后端解析引擎在处理文件二进制流时崩溃了**。这意味着后端确实在试图"读取"并"解析"上传文件的内容，而不仅仅是检查后缀名。

按照 AI 的方案，换成标准的 GIF 二进制头内容，**上传成功了**，而且响应里直接给出了**上传路径**。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260514_170043_cj1z.png)

---

### 后缀名黑名单探测

后来经过自己反复测试，发现这个接口其实只是做了**后缀名黑名单**检测，并没有真正校验文件内容（之前那个"解析崩溃"的报错是因为文件内容格式不对触发了其他逻辑）。只要换成合法后缀，随便传都能成功。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260514_170043_t2a0.png)

测试结果如下：

| 后缀 | 是否可上传 |
|------|----------|
| `.png` | 否 |
| `.jpg` | 否 |
| `.gif` | 是 |
| `.svg` | 是 |
| `.html` | 是 |
| `.jsp` | 是 |

分号截断、空格、双后缀、`url::$DATA` 编码等常见绕过方式全部测试过，均无效。

---

## 尝试GetShell

### 上传JSP Webshell

既然 `.jsp` 能上传，而且知道路径，先试试上传个空 jsp 确认一下。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260514_170043_o0wb.png)

上传成功，路径也有了。那就写一个 JSP 一句话木马：

```jsp
<%Runtime.getRuntime().exec(request.getParameter("c"));%>
```

结果返回了 **502 Bad Gateway**，感觉像是被 WAF 或安全组件检测拦截了。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260514_170043_7c8p.png)

先不管这个，去直接访问之前上传的那个 jsp 文件看看。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260514_170043_w1d4.png)

白高兴一场——**浏览器下载记录直接告诉是下载，不是解析执行**。

---

### 路径穿越尝试

试了一下路径穿越：

```
filename="../../../../../test.jsp"
```

不行，保存位置还是原来的目录，命名规则依然是时间戳命名。

> **知识点：** 服务端通常会对 `filename` 参数中的 `../` 进行过滤或 normalize 处理，或者直接忽略路径部分只取文件名，所以这条路大多数情况下是走不通的。

无法通过 `filename` 参数实现跨目录落地，这条路堵死了。

---

### 发现目录遍历

在翻看目录的时候，偶然发现**服务器开启了目录遍历**！可以直接列出上传目录下的所有文件，也能看到之前自己上传的那些文件，包括那些 jsp。

---

### 为什么JSP不解析

既然能看到上传的 jsp 文件，直接访问试试，但全都是触发下载，没有任何解析。

抓包也抓不到下载的包（可能是浏览器直接处理了），于是在 Repeater 里手动发了一个请求，看到响应头：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260514_170043_5evw.png)

```
Content-Type: application/octet-stream
```

这个类型是**二进制流的通用类型**，意思是"我不知道这是什么，你自己处理"。

> **知识点：** JSP 文件要被执行，必须经过 **Servlet 容器（如 Tomcat）** 的解析处理，由容器调用 JSP 编译器将其编译成 Servlet 并执行。这里的情况是上传目录**直接由 Nginx 或 CDN 作为静态文件目录提供访问**，完全绕开了 Tomcat，所以 JSP 根本不会被解析——只会被当作普通文件下载。

这个架构决定了 JSP 在这里永远不可能被执行，GetShell 无望。

---

## 总结

整个测试过程算是被报错"带着走"了一遍，没能 GetShell，但收获还是有的：

**发现的问题：**

| 漏洞/问题 | 风险级别 | 说明 |
|-----------|---------|------|
| 文件上传后缀名黑名单过滤 | 中 | 可上传 `.html`、`.svg`，存在存储型 XSS 钓鱼风险 |
| 目录遍历（Directory Listing）| 中 | 信息泄露 , 竟然还有过期的证书和部分 class 文件 |
| 错误信息过于详细 | 低 | 报错直接暴露参数名、后端框架信息 |

**这次没 GetShell 的根本原因：**
上传目录不经过 Tomcat 解析，JSP 文件只能被下载，执行链断了。如果上传目录是由 Tomcat 直接 serve 的，那配合 `.jsp` 可上传这个条件，后果就不一样了。

这次经验也说明一个道理：**文件上传漏洞能不能利用，不光取决于能不能上传，还取决于文件能不能被执行**。很多时候绕过了上传限制，卡在最后一步执行上，只能看着文件躺在那里干瞪眼。
