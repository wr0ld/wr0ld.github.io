---
title: AI 自动化辅助小程序挖掘：First 工具与 MCP 使用
cover: >-
  https://cdn.nlark.com/yuque/0/2026/png/48488607/1787410722094-1ca4217d-f7ff-4e85-ae4c-18c80953de93.png
categories:
  - 安全工具
  - 教程
tags:
  - 小程序
  - First
  - MCP
  - 抓包
  - WeChatAppEx
  - 微信
  - 逆向
  - Yakit
  - AI
abbrlink: '994e611'
date: 2026-08-22 21:30:00
---

## 一、概述

「First 的使用、mcp 的配置、流量的转发」

## 二、环境准备

### 1. First 工具

+ 项目地址：[https://github.com/Spade-sec/First/releases](https://github.com/Spade-sec/First/releases)

### 2. 微信客户端版本

> 推荐版本：**4.1.10**

+ 下载地址：[https://github.com/vs-olitus/wx-version/releases/tag/4.1.10-windows](https://github.com/vs-olitus/wx-version/releases/tag/4.1.10-windows)

## 三、First 的 MCP 配置

First 的 MCP 默认使用 **SSE** 传输方式，为获得更好的通用性，可通过 **supergateway** 将其转换为 **stdio** 模式接入各类 AI 客户端：

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787409961337-56b99e8c-f396-4766-b2a1-d0817cf8c63d.png)

```json
{
  "type": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "supergateway",
    "--sse",
    "http://127.0.0.1:4554/sse"
  ]
}
```

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787410017951-153a123e-ae5d-426e-9067-a83eec5a5e5c.png)

> ⚠️ 正式使用前请先查阅工具自带的 FAQ 说明。

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787410275251-bdc256b4-e3cd-4675-ba42-9b3133be9c77.png)

## 四、使用步骤

### 1. 开启 MCP 并启动调试

在 First 中开启 MCP 功能并启动调试，启动完成后，**界面左下角会显示三个步骤的状态**，用于确认各环节是否就绪。

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787410469350-7c6d2dc4-8a3b-4d44-a94e-f966acbef8c4.png)

### 2. 打开目标小程序

> ⚠️ 顺序要求：**必须先启动调试，再打开小程序**，否则 hook 无法生效。

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787410579374-9f0f4050-cc9c-4a44-85c3-63ff805f56d5.png)

### 3. 浏览器端断点调试

在浏览器中访问：

```plain
devtools://devtools/bundled/inspector.html?ws=127.0.0.1:62000
```

即可对小程序进行**逆向断点调试分析**。

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787410722094-1ca4217d-f7ff-4e85-ae4c-18c80953de93.png)

### 4. AI 接入使用

调试链路就绪后，AI 客户端连接 MCP 即可直接调用 First 的能力进行自动化分析。

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787411179187-7d77d447-c023-4317-a3fc-f1eadd388861.png)

## 五、核心功能一览

| 功能 | 效果 |
|------|------|
| 获取路由 / 快速跳转 | ![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787410875818-4e2ed397-fdf9-4bc2-9a11-0484dda896bf.png) |
| wxapkg 反编译 | ![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787415985536-b71b0324-085d-4f38-aa31-013fe4f2f96e.png) |
| 敏感信息提取 | ![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787411452845-0c456b51-fd63-46cc-b044-090418f0846a.png) |
| 目录文件查看 | ![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787411493960-2b99c276-4d2b-4dbc-a8de-4b1150b43bb4.png) |
| 其他 hook 功能 (建议开小号) | ![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787415720855-c8c4a6d6-4ac7-416e-a718-69fb373f3bb5.png) |

## 六、流量抓包：代理转发方案

小程序 HTTPS 流量默认难以直接抓取，可通过 **ProxyBridge** 将小程序流量转发到抓包工具（如 Yakit）。

### 1. 代理抓包工具

+ 工具地址：[https://github.com/InterceptSuite/ProxyBridge/releases](https://github.com/InterceptSuite/ProxyBridge/releases)
+ 中文好评

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787412239152-0eb36c4f-38f7-4356-b8c4-cded97de8990.png)

### 2. 配置代理与规则

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787414178683-0d2088b4-1d5c-4524-b8d1-191e00b5b3e7.png)

+ **代理设置**：目标设置为抓包工具的监听端口（如：Yakit 的 `8083`）。

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787412250381-126e0f66-f44d-46dd-b90a-71da6256de32.png)

+ **定位小程序进程文件**：通过任务管理器快速找到小程序对应的进程与文件路径。

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787414152223-993563d8-41e0-4d11-913c-d544d890a244.png)

+ **规则匹配**：配置规则命中刚刚代理的小程序进程。

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787414220495-d2fd7081-d6a3-4788-ac3f-ab5f28ed68b6.png)

+ **流量过滤**：筛选 `WeChatAppEx` 进程，避免无关流量干扰。

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787414238095-1ec1bbef-f7a8-4b1c-a0c1-4670bfe94efb.png)

### 3. 抓包验证

配置完成后，Yakit 侧即可成功收到小程序流量，进行后续的接口分析与漏洞测试。

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787414366549-21f72ff8-d2b6-4555-ab6f-f6fa177c5266.png)

### 4. 搭配 Yakit MCP

搭配 yakit mcp 食用更佳

```json
{
  "type": "stdio",
  "command": "yak.exe",
  "args": [
    "mcp",
    "--transport",
    "stdio"
  ]
}
```
