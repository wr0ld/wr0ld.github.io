# 博客项目结构索引（AI 助手导航）

> 本文件是项目的整体索引。**修改任何功能前，先在这里找对应章节**；找不到就用其它方式定位源码，定位后再回来补充本文件（见 `.claude/rules/suoyin.md`）。

## 项目概述

wr0ld 的个人安全技术博客，Hexo 静态站 + Stellar 主题，部署在 GitHub Pages。

| 项 | 值 |
|---|---|
| 站点地址 | https://wr0ld.github.io |
| 部署目标 | `wr0ld/wr0ld.github.io` 仓库 `main` 分支（`hexo deploy` 推送） |
| Hexo | 7.3.0（`package.json` → `hexo.version`） |
| 主题 | Stellar 1.33.1，**实际生效目录 `themes/stellar/`**（npm 包 `hexo-theme-stellar` 仅为依赖备份） |
| 主题文档 | https://xaoxuu.com/wiki/stellar/ |
| 内容方向 | 渗透测试、代码审计、安全工具（Java 反序列化、内存马、靶机实战等） |

## 快速导航

| 需求 | 位置 |
|---|---|
| 发新文章 | [文章体系](#文章体系) + `source/_posts/` |
| 改导航/侧边栏/文章配置 | [配置体系](#配置体系) → `_config.stellar.yml` |
| 改站点级配置（链接、部署、skip_render） | `_config.yml` |
| 改样式 | [主题定制](#主题定制) → `themes/stellar/source/css/` |
| 改交互/特效 JS | `themes/stellar/source/js/main.js` 与 `js/plugins/` |
| 加游戏 | [静态功能站](#静态功能站) + `source/_data/games.yml` |
| 加 lab 项目 | [静态功能站](#静态功能站) + `_config.yml` 的 `skip_render` |
| 改设置页 | `source/settings/index.md` + `source/settings/defaults.js` |
| 改看板娘 | `source/live2d-widget/`、`source/live2d-api/` |
| 本地预览 / 构建 / 部署 | [常用命令](#常用命令) |
| AI 规则与技能 | [AI 协作配置](#ai-协作配置) |

## 顶层目录速览

```
my-blog/
├── _config.yml             # Hexo 站点配置（URL、部署、skip_render、分页）
├── _config.stellar.yml     # Stellar 主题用户配置（菜单、侧边栏、分类顺序、样式）
├── _config.landscape.yml   # 空文件，landscape 主题残留，无用
├── package.json            # 依赖与 npm 脚本
├── db.json                 # Hexo 增量构建缓存（12MB，由 generate 自动维护，勿手改）
├── source/                 # 内容源：文章 + 静态页面 + 静态站点（见下）
├── themes/stellar/         # ★ 实际生效的主题（模板、样式、脚本都在这里改）
├── scripts/                # 博客自定义 Hexo 脚本（3 个，见下）
├── public/                 # 构建产物（hexo clean 会删除，勿直接改）
├── .deploy_git/            # 部署用 git 工作树（hexo deploy 自动维护，约 1.1GB）
├── node_modules/           # 依赖（含 hexo-theme-stellar 备份包）
├── scaffolds/              # hexo new 文章模板
├── .claude/                # 本项目的 AI 规则 / 技能 / 子代理
├── AGENTS.md / CLAUDE.md   # 项目索引 / 项目说明
└── .github/                # 主题仓库遗留的 issue 模板与 workflow（与博客本身无关）
```

## 配置体系

### `_config.yml`（站点级，关键项）

| 配置 | 说明 |
|---|---|
| `url: https://wr0ld.github.io` | 站点地址 |
| `permalink: posts/:abbrlink/` | 文章链接用 abbrlink 短链（crc32/hex），改文件名不影响链接 |
| `skip_render` | **新增大体积静态站必须加到这里**，跳过 Hexo 渲染直接原样复制 |
| `theme: stellar` | 指向 `themes/stellar/` 目录 |
| `deploy` | git 部署到 `wr0ld.github.io` 的 `main` 分支 |
| `index_generator.per_page: 9` | 首页每页文章数 |

### `_config.stellar.yml`（主题级，用户配置）

| 配置 | 说明 |
|---|---|
| `menubar` | 侧边栏菜单：博客/关于/设置 + 分隔线 + 实验室/相册/游戏/卡牌（卡牌是 JS 调用） |
| `site_tree` | 各页面左右侧边栏组件（welcome/todo/categories/toc 等） |
| `article` | 文章类型 tech、自动封面/横幅/摘要、版权声明 |
| `style` | `prefers_theme: dark`、左侧栏背景图 |
| `category_order` / `subcategory_order` | 分类页展示顺序（代码审计→struts2/内存马/log4j/shiro/cc/fastjson 等） |
| `comments.service` | 当前为空（未启用评论） |

> 主题的**完整默认配置**在 `themes/stellar/_config.yml`（style 配色、圆角、字体等都在这里），用户侧覆盖只写在 `_config.stellar.yml`。

## 文章体系

- 位置：`source/_posts/`，共 **58 篇** Markdown
- 图床：`https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/xxx.jpg`（GitHub 仓库 `wr0ld/BlogImage`）

### Front-matter 格式

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
abbrlink: becfd9ce         # 短链 ID（crc32 自动生成，一般手动指定保持稳定）
---
```

### 现有分类主线

| 分类 | 子类 / 内容 |
|---|---|
| 代码审计 | CC1/CC2/CC3/CC6、CB 链、fastjson、struts2(S2-016/045)、shiro(550)、log4j(CVE-2021-44228)、JNDI 注入、Tomcat 内存马（Filter/Listener/Servlet/Valve/agent） |
| linux / 靶机渗透 | vulnhub DC-1 ~ DC-9 |
| web | DVWA low/medium、CTF 伪协议 |
| 安全工具 | 工具魔改（CS4.7 特征修改、YsoGUI）、sqlmap、fscan、哥斯拉 |
| 内网渗透 | suo5 隧道、docker 内网靶场、vpc 系列 |
| Windows | vpc1-5、Zerologon 等 |

## 静态功能站

`source/` 下除 `_posts`、`_data` 外的目录都是**静态页面或完整前端站**。其中被 `_config.yml → skip_render` 列出的目录不走 Hexo 渲染，原样复制进 `public/`。

| 目录 | 内容 | 体积 | 备注 |
|---|---|---|---|
| `lab/` | 15 个前端实验项目（three.js 作品集、Win11 模拟器、终端模拟器等） | ~367MB | 每个子项目都加了 skip_render |
| `games/` | 19 个小游戏（2048/贪吃蛇/俄罗斯方块/魔塔/修仙等）+ `index.html` 入口 | ~380KB | 配置在 `source/_data/games.yml` |
| `gallery/` | 相册静态站 | ~9.6MB | |
| `srk-toolbox/` | CyberChef 类工具箱 | ~37MB | |
| `live2d-api/` | 看板娘模型 API（model/ 下 20+ 模型） | | |
| `live2d-widget/` | 看板娘前端组件（autoload、提示语） | ~3.4MB | |
| `vault/` | 加密金库页面（generator.html/index.html） | 32KB | |
| `settings/` | 设置页（`index.md` 是页面结构，`defaults.js` 是交互逻辑） | | 页面经 Hexo 渲染，非 skip_render |
| `about/` `calculator/` `divination/` | 关于页 / 计算器 / 占卜（各一个 index.md） | | |
| `404.html` `offline.html` `sw.js` `manifest.json` `robots.txt` | PWA 与 404 终端 | | 均在 skip_render |

### 新增静态站的固定步骤

1. 把构建产物放进 `source/<目录>/`
2. 在 `_config.yml → skip_render` 加一行 `<目录>/**`（防止 Hexo 尝试渲染 js/css 报错）
3. 在 `_config.stellar.yml → menubar` 或对应页面加入口

## 主题定制（themes/stellar/）

### 模板 `layout/`

EJS 模板。入口 `layout.ejs`，页面级 `index.ejs`（首页，含布局切换器）、`archive.ejs`、`categories.ejs`、`tags.ejs`、`page.ejs` 等；组件在 `layout/_partial/`（navbar、post_list 卡片、article、widgets、sidebar、comments）。

### 样式 `source/css/`

- 入口 `main.styl`：`_custom → _defines → _common → _components → _plugins`
- **`_custom.styl`**：自定义样式主战场（设计变量 `--wr-*`、卡片、文章阅读版式、移动端适配都在这）
- `_common/`：基础样式（按钮、代码块、表格等）
- `_components/`：列表卡片、文章页、侧边栏、widgets、tag-plugins 样式；`partial/paginator.styl` 是分页器
- `_defines/`：颜色常量、主题变量、函数
- 注意：改完样式后需 `hexo clean && hexo generate` 才会重新编译 stylus（增量构建有时不刷新 CSS）

### 脚本 `source/js/`

| 文件 | 作用 |
|---|---|
| `main.js` | 主脚本：粒子/黑客背景、阅读进度条、打字机、widget 折叠、布局切换等 |
| `plugins/`（16 个） | 下表 |
| `search/` | local-search.js、algolia-search.js |
| `services/` | 主题数据服务（ghinfo、friends、timeline、站点统计等） |

`source/js/plugins/` 自定义插件清单：

| 文件 | 作用 |
|---|---|
| `achievements.js` | 卡牌成就系统（localStorage 存储，`CardSystem` API） |
| `special-days.js` | 节日彩蛋（农历/公历节日特效与成就） |
| `nav-admin.js` | 控制台输入 `admin` 切换导航菜单与任务简报显示（持久化） |
| `custom-context-menu.js` | 自定义右键菜单 |
| `music-player.js` | 音乐播放器（设置页 5 个音源） |
| `offline-vault.js` | 金库解锁逻辑 |
| `cursor-effects.js` / `glitch-effect.js` | 鼠标特效 / 故障特效 |
| `hotkeys.js` | 快捷键 |
| `image-viewer.js` / `copycode.js` / `download-file.js` / `terminal-copy.js` | 图片查看 / 代码复制 / 下载 / 终端复制 |
| `glossary.js` / `video.js` / `voice.js` | 词汇表 / 视频 / 语音 |

### 主题服务端脚本 `themes/stellar/scripts/`

- `tags/lib/`：40 个标签插件（note、tabs、timeline、image、link、folders 等，写文章可用）
- `helpers/`：icon、related_posts、category_color、scrollreveal 等
- `generators/`：categories/tags/archive/wiki/search 页面生成
- `events/`、`filters/`：主题事件与过滤器（版本检查、图片错误处理等）

## 博客自定义 Hexo 脚本（scripts/）

| 文件 | 作用 |
|---|---|
| `articles_stats.js` | 生成 `/api/articles_stats.json`（文章字数/图片数排行，设置页使用） |
| `css_version.js` | 对 CSS 内容取 MD5 前 8 位作版本号，解决浏览器缓存 |
| `payloader.js` | 把外部 Payloader 项目产物映射为站点路由 |

## AI 协作配置（.claude/）

### 规则 `.claude/rules/`

| 文件 | 内容 |
|---|---|
| `suoyin.md` | AGENTS.md 是项目索引：改功能前先查，找不到再找其它方式，找到后回来完善本文件 |
| `word.md` | **禁止用 git 命令，用 hexo 命令代替** |
| `kapai.md` | 汉化时不对项目标题、人物名称做汉化 |
| `mcp.md` | 允许自动调用 MCP |

### 技能 `.claude/skills/`

| 技能 | 用途 |
|---|---|
| `add-blog-post` | 新增博客文章（处理 front-matter） |
| `add-lab-project` | 新增 lab 实验项目 |
| `add-static-page` | 新增独立静态页面 |
| `achievement-system` | 管理成就系统 |
| `publish-freebuf-image` | 发布 FreeBuf 图床 |

### 子代理 `.claude/agents/`

- `博客运维工程师.md`：博客运维专用代理，只处理技术基础设施，**禁止改动文章内容**。

## 常用命令

```bash
npx hexo server          # 本地预览（默认 http://localhost:4000）
npx hexo generate        # 构建到 public/
npx hexo clean           # 清缓存与 public（CSS 不刷新时先跑这个）
npx hexo clean && npx hexo generate   # 完整重构建
npx hexo deploy          # 部署到 wr0ld.github.io（git 部署器）
npx hexo new post "标题"  # 新建文章草稿
```

npm 脚本等价：`npm run server` / `npm run build` / `npm run clean` / `npm run deploy`。

## 已知坑与注意事项

1. **改样式不生效**：先 `hexo clean && hexo generate`。增量构建 + 浏览器缓存经常让人误判。
2. **新增静态目录忘记 skip_render**：Hexo 会把目录里的 js/css 当主题文件尝试渲染，报错或漏文件。
3. **`public/`、`.deploy_git/`、`db.json` 是生成物**：不要手改，不要当源码维护。`.deploy_git` 已 1.1GB，体积异常大时可整体删除后重新 `hexo deploy`。
4. **`_custom.styl` 是覆盖层**：主题其它 stylus 依赖 `_custom.styl` 里定义的官方变量（`$c-theme`、`$border-card-s`、`$iQuoteLeft` 等），删除或改名会导致整站样式错乱。
5. **主题双重存在**：`themes/stellar/` 是实际生效目录；`node_modules/hexo-theme-stellar/` 只是 npm 依赖备份，改它不生效。
6. **admin 菜单默认隐藏**：侧边栏完整菜单和任务简报需要控制台输入 `admin` 才显示（`nav-admin.js` 持久化）。
7. **主题版本提示**：构建时会提示本地 1.33.1 < 最新版，升级需谨慎（自定义模板和样式可能被覆盖）。
8. **内容敏感**：`source/_posts/` 是安全攻防内容，只按用户要求修改，不自作主张增删。
