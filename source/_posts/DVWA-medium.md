---
cover: /images/DVWA.jpg
title: DVWA 靶场实验报告 (Medium Level)
categories:
  - DVWA
tags:
  - 靶场练习
  - DVWA
  - XSS
  - SQL注入
  - CSRF
abbrlink: fab7f2d4
date: 2026-03-08 12:00:00# DVWA 靶场实验报告 (Medium Level)

**难度等级：** Medium (中级)
**报告说明：** 本报告基于 DVWA 靶场中等级别安全设置。相比于低等级，中等级别加入了基础的防御机制（如后缀检查、简单的字符串过滤及 CSRF Token 验证），本报告详细记录了 17 项漏洞的**绕过技巧**与复现过程。

---

## 📑 目录
* [Brute Force --- 暴力破解](#brute-force)
* [Command Injection --- 命令注入](#command-injection)
* [CSRF --- 跨站请求伪造](#csrf)
* [File Inclusion --- 文件包含](#file-inclusion)
* [File Upload --- 文件上传](#file-upload)
* [Insecure CAPTCHA --- 不安全的验证码](#insecure-captcha)
* [SQL Injection --- SQL 注入](#sql-injection)
* [SQL Injection (Blind) --- SQL 盲注](#sql-injection-blind)
* [Weak Session IDs --- 弱会话 ID](#weak-session-ids)
* [XSS (DOM) --- DOM 型跨站脚本](#xss-dom)
* [XSS (Reflected) --- 反射型跨站脚本](#xss-reflected)
* [XSS (Stored) --- 存储型跨站脚本](#xss-stored)
* [CSP Bypass --- CSP 策略绕过](#csp-bypass)
* [JavaScript Attacks --- JavaScript 攻击](#javascript-attacks)
* [Authorisation Bypass --- 越权访问](#authorisation-bypass)
* [Open HTTP Redirect --- 开放重定向](#open-http-redirect)
* [Cryptography --- 密码学](#cryptography)

---

## 01. Brute Force --- 暴力破解
### 中级防御
后端加入了 `sleep(2)` 函数，旨在减缓暴力破解的速度。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303121732286.png)
### 绕过技巧
* **多线程与并发**：虽然有延迟，但攻击者仍可使用 Burp Suite 的多线程模式。
* **逻辑绕过**：如果登录失败次数未被锁定，单纯的延迟只能增加攻击时间，无法阻断攻击。

---

## 02. Command Injection --- 命令注入
### 中级防御
后端设置了黑名单，过滤了 `&&` 和 `;` 等常用连接符。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303121913596.png)
### 绕过技巧
* **替换符号**：使用 `|` 或 `&` 代替 `&&`。
* **Payload**: `127.0.0.1 | whoami`
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303121941463.png)

---

## 03. CSRF --- 跨站请求伪造
### 中级防御
增加了 `HTTP_REFERER` 检测，验证请求是否来自本站。
观察url的参数
?password_new=admin&password_conf=admin&Change=%B8%C4%B1%E4#
直接访问此url提示不正确
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303121953218.png)
源码可以看到有请求的来源检测
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303122056647.png)
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303130104366.png)

### 绕过技巧
* **Referer 伪造/绕过**：如果后端只判断域名是否包含关键字，可构造文件名包含关键字的恶意页面。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303130115929.png)
* **利用跨站漏洞**：结合 XSS 漏洞在同源环境下发起请求，此时 Referer 验证将失效。

---

## 04. File Inclusion --- 文件包含
### 中级防御
过滤了 `../` 等相对路径跳转符。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303122234537.png)
### 绕过技巧
* **双写绕过**：使用 `....//`。当后端删除一组 `../` 后，剩下的字符会自动组成新的 `../`。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303122325427.png)
* **Payload**: `?page=..././..././..././etc/passwd`
访问url
vulnerabilities/fi/?page=....//....//....//....//....//1.php
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303122354312.png)
也可以进行远程地址访问
vulnerabilities/fi/?page=htthttp://p://baidu.com
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303122413385.png)

---

## 05. File Upload --- 文件上传
### 中级防御
检查了上传文件的 `Content-Type`（MIME 类型）。

直接上传webshell提示失败
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303122829111.png)
### 绕过技巧
* **抓包修改 MIME**：将 `application/octet-stream` 改为 `image/jpeg`。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303122905027.png)
成功绕过
后续就是连接webshell了
* **截断绕过**：在某些老旧环境中，可使用 `%00` 截断。

---

## 06. Insecure CAPTCHA --- 不安全的验证码
### 中级防御
加入了 `passed_captcha` 参数检测。
### 绕过技巧
* **参数篡改**：在抓包时手动添加或修改 `step=2` 及验证通过的标识参数，直接跳过图形验证逻辑。

---

## 07. SQL Injection --- SQL 注入
### 中级防御
简单的sql注入，不过是要在post请求包里修改
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303123013978.png)
### 绕过技巧
可以保存数据包用sqlmap跑也可以自己手注入，因为比较简单就用手注入
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303123044038.png)

order by检测为2
联合注入显示其他信息
后续注入数据库 表 列 值即可

---

## 08. SQL Injection (Blind) --- SQL 盲注
### 绕过技巧
同上，利用数字型注入点进行布尔或时间盲注。
盲注，直接用sqlmap吧，
sqlmap -r D:\Backup\桌面\1.txt --dbs --batch
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303123148814.png)
直接跑出来了，不过用的是布尔盲注和时间盲注

---

## 09. Weak Session IDs --- 弱会话 ID
### 中级防御
Session ID 基于当前时间戳生成。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303123211715.png)
### 破解思路
* **时间同步攻击**：通过预测服务器时间，计算可能的 Session ID 进行碰撞劫持。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303123243200.png)

---

## 10. XSS (DOM) --- DOM 型跨站脚本
### 绕过技巧
中级通常会对 `<script>` 标签做基础过滤，可以尝试使用图片标签的 `onerror` 事件：
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303123311648.png)
* **Payload**: `<img src=x onerror=alert(1)>`
访问`?default=<img src=x onerror="alert(1)">`
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303123339473.png)

---

## 11. XSS (Reflected) --- 反射型跨站脚本
### 中级防御
过滤了 `<script>` 标签。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303123419441.png)
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303123541002.png)
### 绕过技巧

* **大小写绕过**：`<sCript>alert(1)</sCript>`
* **双写绕过**：`<scr<script>ipt>alert(1)</script>`
`<img src=x onerror="alert(‘xss’)">`
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303123441642.png)

---

## 12. XSS (Stored) --- 存储型跨站脚本
### 绕过技巧
除了上述标签绕过，中级往往只限制了 `message` 字段。
message过滤比较严格，无法攻击
但是name参数过滤简单
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303123622989.png)
* **多点测试**：尝试在 `Name` 字段进行注入（可能需要通过 F12 修改输入框长度限制）。
`<Script>alert(1)</Script>`
但遇到一个问题，前端做了简单的输入框长度检测
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303123658967.png)
简单，在源代码里面修改长度即可
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303123708529.png)
成功
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303123717352.png)
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303123753686.png)
---

## 13. CSP Bypass --- CSP 策略绕过
### 绕过技巧
寻找 CSP 白名单中的 CDN 资源，利用这些资源中的 JSONP 接口来执行恶意代码。
查看源代码，有多个csp参数过滤

---

```
<?php

$headerCSP = "Content-Security-Policy: script-src 'self' 'unsafe-inline' 'nonce-TmV2ZXIgZ29pbmcgdG8gZ2l2ZSB5b3UgdXA=';";

header($headerCSP);

// Disable XSS protections so that inline alert boxes will work
header ("X-XSS-Protection: 0");

# <script nonce="TmV2ZXIgZ29pbmcgdG8gZ2l2ZSB5b3UgdXA=">alert(1)</script>

?>
```
本来过滤很严格的，但是多了一个unsafe-inline这个
导致其他只允许部分内联函数的限制失效了，允许所有的内联函数了
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303124155575.png)
所有我们直接自己构造就好了，无限制

---

## 14. JavaScript Attacks --- JavaScript 攻击
### 实验过程
提交原本参数用hackbar查看发包的数据

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303124228408.png)

然后用success提交再次查看发包数据
提示无效的token

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303124302688.png)

我们发现token没变
token是changeme的倒叙然后前后加xx
我们更具此规律构造success的token
XXsseccusXX
提交正确

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303124315675.png)
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303124321324.png)

---

## 15. Authorisation Bypass --- 越权访问
### 逻辑分析
admin用户可以正常查看修改
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303124542645.png)
修改到普通用户我们看不那那个界面的选项卡了
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303124550897.png)
直接访问目录会提示无权限
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303124608930.png)
但是我们通过翻admin的网络数据包时发现，他把数据写到一个php文件之后才加载的
而此php文件没有做权限鉴权
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303124624241.png)
可以通过直接访问这个php文件来查看数据，信息泄露
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303124638129.png)

---

## 16. Open HTTP Redirect --- 开放重定向
### 绕过技巧
如果后端过滤了 `http://`，可以尝试使用 `//` 协议相对路径或者进行 URL 编码绕过。
查看网页代码，看到重定向的文件的参数
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303124732742.png)
尝试直接构造

`vulnerabilities/open_redirect/source/medium.php?redirect=http://baidu.com`
提示不允许绝对url，显然对参数进行了过滤

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303124814874.png)
我们将http删除，直接用//来实现远程地址访问
`vulnerabilities/open_redirect/source/medium.php?redirect=//baidu.com`
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303124908403.png)
查看源代码发现确实对http的https进行了检测过滤
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303124929161.png)

---

## 17. Cryptography --- 密码学
### 进阶内容
查看源代码
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303124947269.png)
对密码有个简单的硬加密，可以直接破解
2.要同时满足三个条件：
user 等于 sweep
ex 大于当前时间戳（未过期）
level 等于 admin
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303125008525.png)
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303125017369.png)
篡改token密钥实现admin登录
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303125027377.png)

---
