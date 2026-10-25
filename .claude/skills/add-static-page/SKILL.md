---
name: "add-static-page"
description: "添加独立静态页面到 Hexo 博客，跳过主题渲染。当用户想要创建不需要主题外壳的独立 HTML 页面时调用此技能。"
---

# 添加静态页面到 Hexo 博客

## 概述

将独立 HTML 页面部署到博客，使其不受 Hexo 主题渲染，保持完全独立的样式和功能。

## 方法一：跳过主题渲染（独立静态页面）

适用于：完全独立的 HTML 页面，不需要主题外壳

### 步骤

**1. 创建页面目录和文件**
```
my-blog/source/你的页面名/
└── index.html    # 入口文件
```

**2. 配置 skip_render**

在 `my-blog/_config.yml` 中添加：
```yaml
skip_render:
  - 你的页面名/**
```

**3. 重新生成**
```bash
hexo clean && hexo server
```

## 方法二：使用 Markdown + 主题渲染

适用于：需要主题样式的页面

### 步骤

**1. 创建 Markdown 文件**
```
my-blog/source/你的页面名/
└── index.md
```

**2. 编写 Front-matter**
```yaml
---
title: 页面标题
layout: page
---
页面内容...
```

## 注意事项

| 问题 | 解决方案 |
|------|----------|
| 页面显示侧边栏/主题外壳 | 添加 `skip_render` 配置 |
| 资源加载 404 | 使用相对路径 `./` 而非绝对路径 `/` |
| 成就系统不触发 | 引入脚本 `<script src="/js/plugins/achievements.js"></script>` |
| 中文乱码 | HTML 文件使用 UTF-8 编码 |
| CSS 不生效 | 检查路径，或使用内联样式 |

## 成就系统集成

在独立静态页面中触发成就：

```html
<script src="/js/plugins/achievements.js"></script>
<script>
function triggerAchievement() {
  if (window.CardSystem && window.CardSystem.obtainCard) {
    window.CardSystem.obtainCard('成就ID');
  } else {
    setTimeout(triggerAchievement, 500);
  }
}

if (document.readyState === 'complete') {
  setTimeout(triggerAchievement, 500);
} else {
  window.addEventListener('load', function() {
    setTimeout(triggerAchievement, 500);
  });
}
</script>
```

## 快速检查清单

| 步骤 | 文件 | 操作 |
|------|------|------|
| 1 | `source/页面名/index.html` | 创建静态文件 |
| 2 | `_config.yml` | 添加 `skip_render` 规则 |
| 3 | `achievements.js` | 添加相关成就（可选） |
| 4 | 终端 | `hexo clean && hexo server` |

## 示例：创建节日特效预览页面

```bash
# 1. 创建目录
mkdir my-blog/source/festival-demo

# 2. 创建 index.html（完整 HTML 文件）

# 3. 修改 _config.yml
# skip_render:
#   - festival-demo/**

# 4. 重新生成
hexo clean && hexo server
```

## 常见问题

### 页面显示主题外壳
- **原因**：`skip_render` 没配置好
- **解决**：确保路径正确，使用 `页面名/**` 格式

### 资源加载 404
- **原因**：HTML 中使用了绝对路径
- **解决**：将 `/assets/xxx` 改为 `./assets/xxx`

### 成就弹窗不显示
- **原因**：未加载成就系统脚本
- **解决**：添加 `<script src="/js/plugins/achievements.js"></script>` 并使用重试机制
