---
cover: /images/DVWA.jpg
title: DVWA 靶场实验报告 (Low Level)
categories:
  - DVWA
tags:
  - 靶场练习
  - DVWA
  - XSS
  - SQL注入
  - CSRF
abbrlink: f02c2786
date: 2026-03-07 12:00:00# DVWA 靶场实验报告 (Low Level)

> **难度等级**：Low
> **报告说明**：本报告涵盖了 DVWA 靶场在低安全等级下的 17 项漏洞复现过程。



## 📑 目录

1. [Brute Force --- 暴力破解](https://www.google.com/search?q=%231-brute-force)
2. [Command Injection --- 命令注入](https://www.google.com/search?q=%232-command-injection)
3. [CSRF --- 跨站请求伪造](https://www.google.com/search?q=%233-csrf)
4. [File Inclusion --- 文件包含](https://www.google.com/search?q=%234-file-inclusion)
5. [File Upload --- 文件上传](https://www.google.com/search?q=%235-file-upload)
6. [Insecure CAPTCHA --- 不安全的验证码](https://www.google.com/search?q=%236-captcha)
7. [SQL Injection --- SQL 注入](https://www.google.com/search?q=%237-sqli)
8. [SQL Injection (Blind) --- SQL 盲注](https://www.google.com/search?q=%238-sqli-blind)
9. [Weak Session IDs --- 弱会话 ID](https://www.google.com/search?q=%239-session)
10. [XSS (DOM) --- DOM 型跨站脚本](https://www.google.com/search?q=%2310-xss-dom)
11. [XSS (Reflected) --- 反射型跨站脚本](https://www.google.com/search?q=%2311-xss-reflected)
12. [XSS (Stored) --- 存储型跨站脚本](https://www.google.com/search?q=%2312-xss-stored)
13. [CSP Bypass --- CSP 策略绕过](https://www.google.com/search?q=%2313-csp)
14. [JavaScript Attacks --- JavaScript 攻击](https://www.google.com/search?q=%2314-js)
15. [Authorisation Bypass --- 越权访问](https://www.google.com/search?q=%2315-auth)
16. [Open HTTP Redirect --- 开放重定向](https://www.google.com/search?q=%2316-redirect)
17. [Cryptography --- 密码学](https://www.google.com/search?q=%2317-crypto)

---

## 1. Brute Force --- 暴力破解

### 🛡️ 漏洞描述

登录页面无频率限制或账号锁定机制，可使用 Burp Suite Intruder 进行字典暴力破解。

### 🚀 操作过程



* **Step 1**：打开登录页面，输入任意账号密码。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302204857300.png)
* **Step 2**：用 Burp Suite 抓包，发送至 Intruder，标记爆破位置。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302204905757.png)
* **Step 3**：按响应长度排序，找出不同长度的条目即为正确密码。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302204912741.png)
* **Step 4**：使用爆破得到的账号密码成功登录。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302204919934.png)

---

## 2. Command Injection --- 命令注入

### 🛡️ 漏洞描述

输入框接受 IP 地址执行 ping 命令，未过滤特殊字符，可通过管道符拼接任意系统命令。

### 🚀 操作过程

* **Step 1**：正常输入 IP，观察 ping 回显。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302204944006.png)
* **Step 2**：利用管道符注入命令：
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302204951997.png)
> `127.0.0.1 | whoami`
> `127.0.0.1 | ipconfig`



---

## 3. CSRF --- 跨站请求伪造

### 🛡️ 漏洞描述

修改密码使用 GET 请求且无 CSRF Token 校验，攻击者可构造恶意链接诱导受害者修改密码。

### 🚀 操作过程

* **Step 1**：观察修改密码后的 URL，发现密码以明文参数传递。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205001485.png)
* **Step 2**：构造如下链接发送给受害者，受害者点击即改密：
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205011310.png)
> `?password_new=hacked&password_conf=hacked&Change=Change`



---

## 4. File Inclusion --- 文件包含

### 🛡️ 漏洞描述

page 参数直接用于加载文件，无路径过滤，可利用 `../` 目录穿越包含任意文件（LFI）。

### 🚀 操作过程

* **Step 1**：观察 URL 参数规律。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205025022.png)
* **Step 2**：构造目录穿越路径包含其他文件：
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205031158.png)
> `?page=../../../../../1.php`
> *本地 1.php 内容*：`<?php phpinfo(); ?>`



---

## 5. File Upload --- 文件上传

### 🛡️ 漏洞描述

文件上传无类型校验，可直接上传 PHP WebShell，获取服务器 Web 权限。

### 🚀 操作过程

* **Step 1**：上传 WebShell 文件（如 `shell.php`）。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205038063.png)
* **Step 2**：访问上传路径，使用工具连接 WebShell：
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205043198.png)
> `http://dvwa/hackable/uploads/shell.php`



---

## 6. Insecure CAPTCHA --- 不安全的验证码

> **说明**：该实验在 Low 等级下未涉及具体操作。

---

## 7. SQL Injection --- SQL 注入

### 🛡️ 漏洞描述

User ID 输入框未过滤，直接拼接至 SQL 查询，可使用 SQLMap 自动化注入获取数据。

### 🚀 操作过程

* **Step 1**：观察注入点。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205105128.png)
* **Step 2**：Burp 抓包保存，注入点标记 `*`，使用 SQLMap。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205135152.png)
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205147065.png)
> 📌 *注入成功后可使用 `--tables`、`--dump` 获取数据。*



---

## 8. SQL Injection (Blind) --- SQL 盲注

### 🛡️ 漏洞描述

页面不直接回显查询结果，仅返回布尔状态，属于布尔型盲注，同样可用 SQLMap 检测。

### 🚀 操作过程

* **执行 SQLMap**：
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205218648.png)
> `python sqlmap.py -r D:\1.txt --batch --level=3`

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205300233.png)

---

## 9. Weak Session IDs --- 弱会话 ID

### 🛡️ 漏洞描述

Cookie 中的 `dvwaSession` 每次点击仅自增 1，规律极简单，可枚举 Session 进行会话劫持。

### 🚀 操作过程

* **Step 1**：用 HackBar 查看 Cookie 中 `dvwaSession` 参数。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205320955.png)
* **Step 2**：多次请求验证，每次严格 +1。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205328308.png)

---

## 10. XSS (DOM) --- DOM 型跨站脚本

### 🛡️ 漏洞描述

URL 参数 `default` 被直接插入 DOM，未做过滤，可注入任意 JavaScript 代码执行。

### 🚀 操作过程

* **观察正常 URL**：
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205341971.png)
* **注入 Payload**：
> `?default=<script>alert(1)</script>`

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205348683.png)



---

## 11. XSS (Reflected) --- 反射型跨站脚本

### 🛡️ 漏洞描述

搜索框输入内容未过滤直接反射到页面，攻击者可构造含恶意脚本的链接欺骗受害者。

### 🚀 操作过程

* **观察参数**：
> `?name=111`
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205404204.png)

* **注入 Payload**：
> `?name=<script>alert(1)</script>`
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205419566.png)



---

## 12. XSS (Stored) --- 存储型跨站脚本

### 🛡️ 漏洞描述

留言板输入未过滤，XSS 代码存入数据库，每次用户访问页面均会触发，危害更为持久。

### 🚀 操作过程

* **Step 1**：在留言框中输入 XSS Payload 并提交。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205442396.png)
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205457812.png)
* **Step 2**：刷新页面验证每次访问均触发。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205507244.png)
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205515959.png)
---

## 13. CSP Bypass --- 内容安全策略绕过

### 🛡️ 漏洞描述

CSP 策略信任了 `pastebin.com`、`cdn.jsdelivr.net` 等多个外部域，攻击者可在这些受信任域托管恶意脚本进行绕过。

**源码中的 CSP 策略**：

```http
script-src 'self' https://pastebin.com hastebin.com cdn.jsdelivr.net unpkg.com digi.ninja ...

```

### 🚀 操作过程

* **Step 1**：在受信任域托管恶意 JS。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205525837.png)
* **Step 2**：注入外部脚本地址，CSP 允许执行。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205533351.png)
* **恶意脚本内容**：
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205546078.png)

---

## 14. JavaScript Attacks --- JavaScript 攻击

### 🛡️ 漏洞描述

Token 由客户端 JS 生成（ROT13 + MD5），通过分析加密逻辑可为任意输入伪造合法 Token。

**Token 生成逻辑**：

> 明文 → ROT13 → MD5 → Token

### 🚀 操作过程

* **Step 1**：直接输入 `success`，发现 Token 无效。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205558054.png)
* **Step 2**：查看默认 Token，发现无论输入什么 Token 固定。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205604343.png)
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205614518.png)
* **Step 3**：分析加密逻辑，为 `success` 计算正确 Token：
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205621006.png)
> `success` → (ROT13) → `fhpprff` → (MD5) → `38581812b435834ebf84ebcc2c6424d6`


* **Step 4**：用 Burp 修改 Token，成功通过验证。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205642679.png)
---

## 15. Authorisation Bypass --- 越权访问

### 🛡️ 漏洞描述

管理员页面仅在前端隐藏，服务端无权限校验，普通用户直接访问 URL 即可未授权访问。

### 🚀 操作过程

* **Step 1**：管理员登录，查看完整功能页面。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205658431.png)
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205713239.png)
* **Step 2**：切换普通用户，直接访问管理员页面 URL，成功越权：
> `http://dvwa/vulnerabilities/authbypass/`
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205732887.png)



---

## 16. Open HTTP Redirect --- 开放重定向

### 🛡️ 漏洞描述

`redirect` 参数直接作为跳转目标，无白名单校验，可将用户重定向至任意外部恶意网站。

### 🚀 操作过程

* **Step 1**：观察示例 URL。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205741999.png)
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205751087.png)
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205805560.png)
* **Step 2**：观察不同 id = 3 值的页面。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205815904.png)
* **Step 3**：查看源码发现 `redirect` 参数。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205903298.png)
* **Step 4**：构造攻击，成功跳转至外部站点：
> `?redirect=http://www.baidu.com` ✅
> `?redirect=//baidu.com` ✅
> `?redirect=baidu.com` ❌
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205928962.png)

---

## 17. Cryptography --- 密码学

### 🛡️ 漏洞描述

Low 级别使用 XOR 异或加密 Token，密钥硬编码在源码中，可轻松逆向解密或伪造 Token。

**加解密流程**：

> 加密：明文 → xor_this(明文, key) → base64_encode() → 密文
> 解密：密文 → base64_decode() → xor_this(密文, key) → 明文
> 密钥：`$key = "wachtwoord"`

### 🚀 操作过程
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260302205943298.png)
---

**END OF REPORT**