---
title: JADX 接入 AI：jadx-mcp 极简教程
cover: >-
  https://cdn.nlark.com/yuque/0/2026/png/48488607/1787352914276-1b84bda7-70cc-4ecf-a669-76dfeb47384c.png
categories:
  - 安全工具
  - 教程
tags:
  - Android
  - JADX
  - 逆向
  - MCP
  - AI
abbrlink: 7fcfa72f
date: 2026-08-22 20:55:11
---

> 本文介绍如何在 JADX 中安装 `jadx-ai-mcp` 插件并配置 MCP 服务，让 AI 能够直接读取和分析反编译后的代码。

## 一、下载 JADX-GUI

从 GitHub 下载最新版 jadx-gui（含 JRE 的 Windows 版本）：

[https://github.com/skylot/jadx/releases/download/v1.5.6/jadx-gui-1.5.6-with-jre-win.zip](https://github.com/skylot/jadx/releases/download/v1.5.6/jadx-gui-1.5.6-with-jre-win.zip)

## 二、安装插件

1. 打开 JADX，进入 **插件 -> 管理插件**：

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787352571470-94a4d6e7-6b82-41ac-a92f-b0d17abe566c.png)

2. 在列表中选择并安装 **jadx-ai-mcp**：

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787352649959-f9bbfd2d-ee6e-4b01-bfb5-d5ae5c08586d.png)

插件 jar 也可以从 GitHub 直接下载（在 JADX 中直接安装，或下载到本地后导入）：

[https://github.com/zinja-coder/jadx-ai-mcp/releases/download/V6.4.1/jadx-ai-mcp-6.4.1.jar](https://github.com/zinja-coder/jadx-ai-mcp/releases/download/V6.4.1/jadx-ai-mcp-6.4.1.jar)

## 三、下载并解压 MCP 服务脚本

[https://github.com/zinja-coder/jadx-ai-mcp/releases/download/V6.4.1/jadx-mcp-server-6.4.1.zip](https://github.com/zinja-coder/jadx-ai-mcp/releases/download/V6.4.1/jadx-mcp-server-6.4.1.zip)

解压后得到脚本目录：

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787355577613-2192b636-2732-4d39-83d3-053dbba55d51.png)

## 四、配置 MCP

脚本支持 **http** 和 **stdio** 两种模式。注意：Claude 不支持该 MCP 的 http 模式（认证不成功），建议使用 stdio，通用性更强。

### 方式一：http

```json
{
  "type": "http",
  "url": "http://127.0.0.1:8651/mcp"
}
```

### 方式二：stdio

```json
{
  "type": "stdio",
  "command": "uv",
  "args": [
    "run",
    "--directory",
    "E:\\jadx-gui-1.5.5-with-jre-win\\jadx-mcp-server",
    "jadx_mcp_server.py"
  ]
}
```

配置示例：

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787355027303-5ca9aefe-d61f-4de3-9c22-e61d2d2abed3.png)

## 五、使用

1. 在 JADX 中先导入要分析的 APK 文件：

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787352820343-061310a4-f4ed-48e2-a046-b9ba641713f5.png)

2. 如果使用 http 协议，需要自己手动启动脚本；stdio 则不需要：

```bash
uv run jadx_mcp_server.py --http
```

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787352914276-1b84bda7-70cc-4ecf-a669-76dfeb47384c.png)

3. 之后 AI 就能正常调用 MCP 并分析 App：

![](https://cdn.nlark.com/yuque/0/2026/png/48488607/1787354860337-c187b29d-0e67-46a2-a608-0f00d213f95b.png)
