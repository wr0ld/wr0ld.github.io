---
name: "add-lab-project"
description: "添加新的前端实验项目到博客实验室板块。当用户想要添加新的前端页面项目到 /lab/ 目录时调用此技能。"
---

# 添加前端实验项目到实验室

## 概述

将构建好的前端项目部署到博客的 `/lab/` 目录，使其成为独立的静态页面，不被 Hexo 主题渲染。

## 步骤

### 1. 准备项目文件

将构建好的项目文件放到以下目录结构：

```
my-blog/source/lab/你的项目名/
├── index.html          # 入口HTML（必须）
├── assets/             # JS、CSS、图片等资源
├── models/             # 3D模型（如果有）
└── ...                 # 其他资源
```

**重要**：确保 `index.html` 中的资源路径使用**相对路径**（`./` 或 `../`），不要用绝对路径（`/`）。

### 2. 修改 `_config.yml`

在 `skip_render` 中添加新项目目录，让 Hexo 跳过主题渲染：

```yaml
skip_render:
  - lab/index.html
  - lab/login-animation/**
  - lab/pretext/**
  - lab/my-room-in-3d/**
  - lab/bruno-simon-folio/**
  - lab/你的项目名/**    # 新增这一行
```

### 3. 在 `/lab/index.html` 添加项目卡片

在 `my-blog/source/lab/index.html` 的项目列表区域添加新卡片：

```html
<article class="lab-card">
  <div class="lab-preview">
    <iframe src="/lab/你的项目名/" loading="lazy" title="项目名称"></iframe>
  </div>
  <div class="lab-info">
    <h2 class="lab-card-title">项目名称</h2>
    <p class="lab-card-desc">项目描述，介绍技术栈和功能特点。</p>
    <div class="lab-tags">
      <span class="lab-tag">Three.js</span>
      <span class="lab-tag">WebGL</span>
    </div>
    <div class="lab-actions">
      <button class="lab-btn lab-btn-primary" type="button" onclick="openLabModal('/lab/你的项目名/', '项目名称')">全屏预览</button>
      <a class="lab-btn lab-btn-secondary" href="/lab/你的项目名/" target="_blank" rel="noopener noreferrer">新标签打开</a>
    </div>
  </div>
</article>
```

### 4. 重新生成

```bash
cd my-blog
npx hexo clean && npx hexo generate
```

## 检查清单

| 步骤 | 文件 | 操作 |
|------|------|------|
| 1 | `source/lab/项目名/` | 放入构建产物 |
| 2 | `_config.yml` | 添加 `skip_render` 规则 |
| 3 | `source/lab/index.html` | 添加项目卡片 |
| 4 | 终端 | `hexo clean && hexo generate` |

## 常见问题

### 页面显示侧边栏/主题外壳
- **原因**：`skip_render` 没配置好
- **解决**：确保路径正确，使用 `lab/项目名/**` 格式

### 资源加载404
- **原因**：HTML中使用了绝对路径
- **解决**：将 `/assets/xxx` 改为 `./assets/xxx`

### iframe预览空白
- **原因**：项目需要特定URL参数或HTTPS
- **解决**：检查浏览器控制台错误信息

## 示例：添加 Vite 项目

```bash
# 1. 构建项目
cd your-vite-project
npm run build

# 2. 复制构建产物
cp -r dist/* ../my-blog/source/lab/your-project/

# 3. 修改 index.html 中的资源路径
# 将 /assets/ 改为 ./assets/

# 4. 更新 _config.yml 和 lab/index.html

# 5. 重新生成
cd ../my-blog
npx hexo clean && npx hexo generate
```
