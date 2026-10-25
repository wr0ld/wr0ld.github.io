# 博客项目 AI 协作说明（CLAUDE.md）

## 项目定位

wr0ld 的个人安全技术博客：**Hexo 7.3.0 + Stellar 1.33.1 主题**，部署于 GitHub Pages（https://wr0ld.github.io）。
内容方向：渗透测试、代码审计、安全工具（Java 反序列化链、内存马、靶机实战 DC 系列、内网渗透等）。

## 目录关系

- 本目录 `my-blog/` 是**博客本体**（Hexo 站点根目录），所有构建、部署都在这里进行。
- 上级目录 `E:\github\hexo-theme-stellar-1.29.1\` 是 **Stellar 主题原始仓库 + 原始资料**（文章、图片、简历、脚本、项目等），仅作参考与备份，**不参与博客构建**，不要在里面改动来影响博客。
- 详细项目索引见 **AGENTS.md**（目录结构、配置体系、主题定制、静态站清单、AI 协作配置），动手改功能前先查它；定位到新源码后按 `suoyin.md` 规则回来补充。

## 必须遵守的规则（源自 .claude/rules/）

1. **禁止使用 git 命令**，清理 / 部署一律用 hexo 命令代替（`word.md`，alwaysApply）。
2. 汉化时不翻译项目标题、人物名称（`kapai.md`）。
3. 允许自动调用 MCP（`mcp.md`）。
4. AGENTS.md 是项目索引：改功能前先查，找不到再用其它方式定位源码，找到后回来完善 AGENTS.md（`suoyin.md`）。
5. `source/_posts/` 是安全攻防内容，**只按用户要求修改**，不自作主张增删。
6. 内容敏感度：涉及攻击手法的文章按用户指令处理，不主动扩展攻击面描述。

## 常用命令

```bash
npx hexo server                    # 本地预览 http://localhost:4000
npx hexo generate                  # 构建到 public/
npx hexo clean                     # 清缓存与 public（样式不刷新时先跑这个）
npx hexo clean && npx hexo generate # 完整重构建
npx hexo deploy                    # 部署到 wr0ld.github.io（git 部署器）
npx hexo new post "标题"           # 新建文章（用 scaffolds/post.md 模板）
```

npm 脚本等价：`npm run server` / `npm run build` / `npm run clean` / `npm run deploy`。

> 新建文章推荐使用项目技能 `add-blog-post`（自动处理 front-matter，见 `.claude/skills/`）。

## 文章规范

- 位置：`source/_posts/`，共 58 篇 Markdown。
- 图床：`https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/xxx.jpg`（GitHub 仓库 `wr0ld/BlogImage`，发布图片用技能 `publish-freebuf-image`）。

### Front-matter 模板

```yaml
---
title: 文章标题
date: 2026-03-31 10:00:00
categories:
  - [代码审计, cc]        # 嵌套分类：[父分类, 子分类]
tags:
  - Java
  - 反序列化
cover: https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/xxx.jpg
abbrlink: becfd9ce         # 短链 ID（crc32 自动生成，手动指定以保持链接稳定）
---
```

- 文章链接格式 `posts/:abbrlink/`（crc32/hex），改文件名不影响链接。
- 分类主线：代码审计（CC 链 / 内存马 / log4j / shiro / struts2 / fastjson / JNDI）、linux / 靶机渗透（DC-1~9）、web（DVWA / CTF）、安全工具、内网渗透、Windows。
- 分类展示顺序在 `_config.stellar.yml` 的 `category_order` / `subcategory_order` 控制，新增分类记得同步。

## 配置要点

| 文件                  | 作用     | 关键项                                                                             |
| --------------------- | -------- | ---------------------------------------------------------------------------------- |
| `_config.yml`         | 站点级   | `permalink`、`skip_render`、`theme: stellar`、`deploy`                             |
| `_config.stellar.yml` | 主题级   | `menubar`（侧边栏菜单）、`site_tree`、`article`、`style`（默认暗色主题）、分类顺序 |
| `source/_data/*.yml`  | 数据文件 | `games.yml`（游戏清单）、`widgets.yml`、`announcement.yml`、`todo.yml`             |

- **新增静态站点**（lab / games 等）的固定步骤：放进 `source/<目录>/` → 在 `_config.yml → skip_render` 加 `<目录>/**` → 在 `_config.stellar.yml → menubar` 加入口。漏了 skip_render 会导致 Hexo 把 js/css 当主题文件渲染而报错。

## 主题定制位置（themes/stellar/）

- `themes/stellar/` 是**实际生效**主题目录；`node_modules/hexo-theme-stellar/` 只是 npm 依赖备份，改它不生效。
- 样式主战场：`themes/stellar/source/css/_custom.styl`（设计变量 `--wr-*` 都在此）。注意 `_custom.styl` 是覆盖层，主题其它 stylus 依赖其中的官方变量，**不要删除或改名**。
- 交互脚本：`themes/stellar/source/js/main.js` 与 `js/plugins/`（成就卡牌、看板娘、音乐播放器等 16 个插件）。

## 已知坑（务必注意）

1. **改样式不生效**：先 `hexo clean && hexo generate`，增量构建 + 浏览器缓存常造成误判。
2. **`public/`、`.deploy_git/`、`db.json` 是生成物**：勿手改、勿当源码维护；`.deploy_git` 体积异常（当前约 1.1GB）时可整体删除后重新 `hexo deploy`。
3. **`_config.landscape.yml` 无用**：landscape 主题残留，忽略即可。
4. **admin 菜单默认隐藏**：侧边栏完整菜单和任务简报需在控制台输入 `admin` 才显示（`nav-admin.js` 持久化）。
5. **主题版本提示**：构建时会提示本地 1.33.1 < 最新版，升级需谨慎，自定义模板和样式可能被覆盖。
6. **卡牌入口**：侧边栏「卡牌」是 JS 调用（`window.CardSystem.showPanel()`），不是普通链接。
