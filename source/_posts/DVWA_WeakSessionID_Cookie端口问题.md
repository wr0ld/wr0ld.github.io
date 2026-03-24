---
cover: /images/DVWA.jpg
title: DVWA Weak Session IDs High 难度踩坑记录
categories:
  - DVWA
tags:
  - 靶场练习
  - DVWA
  - Session
  - 踩坑
abbrlink: 190bc696
date: 2026-03-06 12:00:00# DVWA Weak Session IDs High 难度踩坑记录：Cookie 为什么死活看不到？

**发布时间：** 2026-03-01  
**分类：** Web 安全 / DVWA 实战

---

## 前言

在做 DVWA 的 Weak Session IDs（会话 ID 安全性不足）High 难度实验时，发现了一个很奇怪的问题：按照正常流程点击 Generate 按钮，不管是用浏览器的开发者工具、Cookie 编辑插件，还是 HackBar，都看不到 `dvwaSession` 这个 Cookie。

这不是操作问题，而是一个真实的 Bug，根源涉及到浏览器对 Cookie 规范的实现细节。本文记录完整排查过程，并深入解释背后的原因。

---

## 实验环境

- DVWA（本地 phpStudy 搭建）
- 访问地址：`http://dvwa:8564`
- 难度：High
- 工具：Burp Suite、浏览器 F12

---

## 一、各难度 Session ID 生成方式

在分析问题之前，先了解 DVWA 各难度的实现方式：

| 难度 | 生成方式 | 安全问题 |
|------|----------|----------|
| Low | 数字递增（1、2、3...） | 完全可预测，直接枚举 |
| Medium | Unix 时间戳 | 可根据时间推算 |
| High | MD5(递增数字) | 看似随机，实则可预测 |
| Impossible | 真随机数 + 时间戳 + 盐值 | 安全 |

High 难度的核心源码如下：

```php
$_SESSION['last_session_id_high']++;
$cookie_value = md5($_SESSION['last_session_id_high']);
setcookie("dvwaSession", $cookie_value, time()+3600, 
    "/vulnerabilities/weak_id/", $_SERVER['HTTP_HOST'], false, false);
```

逻辑很清晰：每次点击 Generate，将一个递增的数字做 MD5，结果作为 Cookie 写入浏览器。

理论上，访问几次后应该能看到类似这样的 Cookie：

```
dvwaSession=c4ca4238a0b923820dcc509a6f75849b   （MD5(1)）
dvwaSession=c81e728d9d4c2f636f067f89cc14862c   （MD5(2)）
dvwaSession=eccbc87e4b5ce2fe28308fd9f2a7baf3   （MD5(3)）
```

**但实际上浏览器里根本看不到这个 Cookie。**

---

## 二、排查过程

### 步骤 1：确认功能是否正常运行

*（此处放截图：点击 Generate 按钮后的页面截图）*

![1772369710220](C:\Users\t\AppData\Roaming\Typora\typora-user-images\1772369710220.png)

页面没有报错，看起来一切正常。

### 步骤 2：检查浏览器 Cookie

打开 F12 → Application → Cookies：

*（此处放截图：F12 Cookie 列表，只有 PHPSESSID 和 security，没有 dvwaSession）*

![1772369783000](C:\Users\t\AppData\Roaming\Typora\typora-user-images\1772369783000.png)

![1772369803340](C:\Users\t\AppData\Roaming\Typora\typora-user-images\1772369803340.png)

![1772369898683](C:\Users\t\AppData\Roaming\Typora\typora-user-images\1772369898683.png)

只能看到 `PHPSESSID` 和 `security`，`dvwaSession` 不见了。

### 步骤 3：换工具确认

分别尝试了：
- 浏览器自带开发者工具
- Cookie Editor 插件
- HackBar

结果一致，全都看不到 `dvwaSession`。

### 步骤 4：用 Burp Suite 抓包

在 BP 的 HTTP History 里找到 Generate 的请求，查看**响应包**：

*（此处放截图：Burp Suite 响应包 Headers，显示 Set-Cookie 的完整内容）*

响应包里能看到：

```
Set-Cookie: dvwaSession=d3d9446802a44259755d38e6d163e820; 
            expires=...; 
            Max-Age=3600; 
            path=/vulnerabilities/weak_id/; 
            domain=dvwa:8564
```

**服务器确实发送了 Set-Cookie，但浏览器就是不存！**

### 步骤 5：定位问题

仔细看 Set-Cookie 的内容，发现问题所在：

```
domain=dvwa:8564
```

`domain` 字段里包含了**端口号**。

---

## 三、根本原因：Cookie 规范不支持端口号

### RFC 6265 的规定

Cookie 的行为由 RFC 6265 规范定义，其中明确指出：

> Cookie 的作用域由 domain、path、secure 属性决定，**端口号不参与 Cookie 的作用域判断**。

这意味着 Cookie 的 `domain` 字段**设计上就不支持带端口号**，这是一个历史遗留问题——Cookie 规范诞生于网站几乎都使用标准端口（80/443）的年代，端口的区分从未被纳入考虑。

### 浏览器的行为

当浏览器收到 `domain=dvwa:8564` 这样的 Set-Cookie 时：

```
domain 包含端口号
→ 不符合 Cookie 规范
→ 浏览器直接忽略整个 Set-Cookie 指令
→ Cookie 不会被存储
```

这就是为什么服务器明明发送了 Set-Cookie，浏览器却没有任何响应。

### 对比同源策略的矛盾

这里有一个有趣的矛盾点：

| 安全机制 | 域名 | 端口 | 协议 |
|----------|------|------|------|
| 同源策略（SOP） | 必须相同 | **必须相同** | 必须相同 |
| Cookie domain | 必须匹配 | **完全忽略** | 不区分 |

同源策略里端口是隔离的关键因素，但 Cookie 却根本不区分端口。这意味着：

```
http://dvwa:8080 设置的 Cookie
http://dvwa:9090 同样可以读取
```

这是 Web 早期设计遗留下来的历史包袱。

---

## 四、问题的来源

回到 DVWA 源码：

```php
setcookie("dvwaSession", $cookie_value, time()+3600, 
    "/vulnerabilities/weak_id/", $_SERVER['HTTP_HOST'], false, false);
```

`$_SERVER['HTTP_HOST']` 在标准 80/443 端口下只返回域名（如 `dvwa`），但当使用非标准端口时，它返回的是**域名:端口**的组合（如 `dvwa:8564`）。

DVWA 的源码没有考虑到非标准端口的情况，导致在本地搭建环境时（通常使用非标准端口）出现这个问题。

---

## 五、修复方案

找到文件：

```
/DVWA-master/vulnerabilities/weak_id/source/high.php
```

### 方案 1：使用 SERVER_NAME

```php
// 修改前
setcookie("dvwaSession", $cookie_value, time()+3600, 
    "/vulnerabilities/weak_id/", $_SERVER['HTTP_HOST'], false, false);

// 修改后
setcookie("dvwaSession", $cookie_value, time()+3600, 
    "/vulnerabilities/weak_id/", $_SERVER['SERVER_NAME'], false, false);
```

`$_SERVER['SERVER_NAME']` 只返回域名，不带端口。

### 方案 2：去掉 domain 参数

```php
setcookie("dvwaSession", $cookie_value, time()+3600, "/vulnerabilities/weak_id/");
```

不指定 domain，Cookie 默认作用于当前域名，浏览器能正常处理。

修改保存后重启 Apache，再次点击 Generate，就能正常看到 `dvwaSession` Cookie 了。

---

## 六、High 难度的漏洞分析

修复 Cookie 存储问题后，回到实验本身。High 难度 Session ID 的安全问题在哪？

### 漏洞核心

```
Session ID = MD5(1), MD5(2), MD5(3)...
```

MD5 是确定性算法，种子是可预测的递增整数，所以攻击者只需要：

1. 观察自己的几个 Session ID
2. 拿去 MD5 解密，发现规律（解出 1、2、3...）
3. 枚举生成所有可能的 Session ID

*（此处放截图：MD5 解密网站，显示解密结果）*

### 枚举脚本

```python
import hashlib

for i in range(1, 10000):
    session_id = hashlib.md5(str(i).encode()).hexdigest()
    print(f"{i} → {session_id}")
```

用这些 Session ID 去碰撞其他在线用户，就能劫持他们的会话。

---

## 七、总结

### 踩坑经验

这次排查的完整思路：

```
Cookie 看不到
→ 排除操作问题（换多个工具确认）
→ 用 Burp 抓包确认服务器有没有发送 Set-Cookie
→ 服务器发了但浏览器不存 → 看 Set-Cookie 的具体内容
→ 发现 domain 带了端口号
→ 查 RFC 6265 确认规范不支持端口
→ 定位到源码 $_SERVER['HTTP_HOST'] 的问题
→ 修复
```

**关键工具是 Burp Suite**——它能看到原始的 HTTP 响应，让你知道"问题出在服务器还是浏览器"。如果只用 F12，看不到服务器发了什么，排查会走弯路。

### 安全启示

1. **Cookie 不区分端口**是一个容易被忽视的安全盲区，同一域名不同端口的服务会共享 Cookie
2. **MD5(递增数字)** 提供的是虚假的安全感，加密算法本身不等于安全，种子的可预测性才是关键
3. **用 `$_SERVER['HTTP_HOST']` 设置 Cookie domain** 在非标准端口环境下会出现问题，应使用 `$_SERVER['SERVER_NAME']` 或不指定 domain

---

## 参考资料

- RFC 6265: HTTP State Management Mechanism
- DVWA 官方仓库：https://github.com/digininja/DVWA
- PHP setcookie 文档：https://www.php.net/manual/zh/function.setcookie.php

---

*本文基于 DVWA 本地实验环境，仅供安全学习使用。*
