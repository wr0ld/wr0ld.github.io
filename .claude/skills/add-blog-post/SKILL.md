---
name: "add-blog-post"
description: "从语雀 MCP 读取文章并把新文章发布到 Hexo 博客(my-blog)。涵盖:语雀取文、确定封面/分类、AI自拟标签、写入 source/_posts、补 front-matter、构建与部署(GitHub Pages 代理处理)。封面/分类不确定时先询问用户，标签由 AI 自定。"
---

# 发布博客文章到 Hexo（从语雀）

## 概述

将文章发布到 `my-blog` 博客。文章正文通常来自**语雀知识库**(通过 yuque MCP 读取),也可以是用户直接提供的 Markdown 原稿。发布流程包含:取文 → 确认元数据 → 写入 `_posts` → 构建 → 部署。

## 适用场景

- 用户说"发布新文章""把语雀的 XX 发布到博客"
- 用户给出一篇现成 Markdown 文章要求导入博客
- 用户要求检查某篇文章是否能正常发布

## 当前博客环境

- 博客目录(工作区):`E:\github\hexo-theme-stellar-1.29.1\my-blog`
- 文章目录:`source/_posts/`
- 全站链接规则:`permalink: posts/:abbrlink/`(启用 `hexo-abbrlink`,alg=crc32,rep=hex)
- 主题:`stellar`
- 部署目标:`https://github.com/wr0ld/wr0ld.github.io.git` 的 `main` 分支(GitHub Pages)

> 注意:skill 正文里不要沿用旧的错误路径(`c:\aaaaaaaa...`),一律以工作区实际路径为准。

## 第零步:代理预检(所有外网操作前必做)

**本机唯一可信代理是 `127.0.0.1:65532`**(git 全局 `http.proxy` 也指向它)。

> 坑:会话环境变量里会被第三方启动器(Claude Code Haha)注入
> `HTTP_PROXY / HTTPS_PROXY / ALL_PROXY = http://127.0.0.1:41956`,那是启动器自带的转发端口,
> **不稳定(会 502)、与真实代理无关**——一律不要使用,也不要用"无代理直连"兜底。

规则:

1. **任何需要外网的操作前**(图片上传/下载、`hexo deploy`、`git push`、`gh api`),先预检:
   ```powershell
   Test-NetConnection 127.0.0.1 -Port 65532 -InformationLevel Quiet
   ```
2. **返回 False(代理没开)** → **立即用 `ask` 提醒用户"请先开启 65532 代理"**,等用户确认开启后再继续;
   **禁止**盲目重试、**禁止**改走 41956、**禁止**无代理硬推。
3. **返回 True** → 继续。执行 git 类命令时清空继承来的代理环境变量,让 git 走自身 65532 配置:
   ```bash
   http_proxy= https_proxy= HTTP_PROXY= HTTPS_PROXY= ALL_PROXY= npx hexo deploy
   ```
4. 图片上传/下载统一用技能自带脚本(已内置 65532 代理 + 预检,未开启会直接退出):
   - 本地图片 → 本技能 `upload_local_images.py`(见第三步补充)
   - 语雀/CDN 图片 → `publish-freebuf-image` 技能的 `sync_freebuf_images.py`

## 第一步:取文

### 方式 A:从语雀读取(推荐,也是本博客主要来源)

发布"新的"文章一般是从语雀知识库里已经写好的文章拿过来。

1. 连接语雀 MCP:**`yuque-可修改`**(可写权限,能取到正文)。可用 `yuque_search` / `yuque_list_docs` / `yuque_get_doc` 等工具。
2. 先搜到目标文档:
   - `yuque_search(query=文章标题关键词, type=doc)`—— 标题里可能没有完整关键词,可多试几个关键词或从 `yuque_get_user`/`yuque_list_books` 定位到知识库后再 `yuque_list_docs`。
   - **必须用 `yuque_get_doc(doc_id, repo_id, format=markdown)` 取到完整正文**,`repo_id` 形如 `"u46989048/is77fo"`(`u<用户id>/<知识库slug>`)。
3. 把正文复制为发布用的 markdown 原文,保留标题、列表、代码块、图片链接,不无故改写技术内容。
4. 图片若引用语雀图床(`cdn.nlark.com/...`)可原样使用。

### 方式 B:用户直接提供文章

- 优先读取用户给出的 Markdown 文件或正文。
- 若资源在博客外部目录,先确认内容再导入 `_posts`。
- **正文图片若是本地路径(`演示截图/xxx.png`、`file:///D:/...`),博客/FreeBuf 都无法直接显示,发布前必须先上传图床**,见「第三步补充」。

## 第二步:确认元数据(封面 / 分类 / 标签)

**关键规则:如果封面、分类不确定(用户没明确给)，必须先用 `ask` 工具问用户，不要擅自猜测；标签则由 AI 根据文章内容自行拟定，不必询问用户。**

需要确认的信息:

1. **标题**:用于 front-matter `title`,也决定 `abbrlink`。
2. **封面 `cover`**:一张图片 URL。若文章里有合适的图/用户没指定 → 询问使用哪一张(例如第几张图)。
3. **分类 `categories`**:按现有体系(例如 `安全工具 / 教程`、`安全工具 / 工具魔改` 等)。不确定 → 询问。
4. **标签 `tags`**:**由 AI 自行拟定**，参考现有文章风格、贴合文章主题关键词（如小程序的：小程序/逆向/抓包/微信/MCP/AI…），不必问用户。
5. **日期 `date`**:用户指定时间;未指定时用当前时间。

> 询问时把候选方案列清楚(用 `ask` 提供选项),让用户确认后再继续。

## FreeBuf 同步（可选，发布前询问）

**发布到博客前，先用 `ask` 问用户：“这篇要不要也同步到 FreeBuf？”**

- **要** → 走 `publish-freebuf-image` 这个 skill：
  1. 取到语雀正文后（或写入 `_posts` 前）运行（脚本已内置 65532 代理 + 预检；若提示代理未开，用 `ask` 提醒用户开代理后重跑）：
     ```bash
     cd "E:\github\hexo-theme-stellar-1.29.1\my-blog"
     python ".claude/skills/publish-freebuf-image/sync_freebuf_images.py" "<含语雀图的md>" --out "D:\download"
     ```
  2. 脚本会把文中 `cdn.nlark.com` 图片下载 → 经 `gh api` 上传到 `wr0ld/BlogImage` 图床 → 用 jsDelivr 直链替换正文 → 在 `D:\download\<标题>_freebuf\` 生成一个**交付文件夹**，内含**去 front-matter 的 md**（顶部 `# 标题`）和 **cover 封面图**（不改语雀/原稿）。
  3. **把交付文件夹的绝对路径**（含里面 md、cover 的完整路径）明确告知用户，供其复制 md 到 FreeBuf 发布、用 cover 图做封面；全文结束后再给一次。
  > 校验：交付文件夹内 md 的 `cdn.nlark.com` 残留应为 0，第一行是 `# 标题`；抽查一条 jsDelivr URL 返回 200。
- **不要** → 跳过，直接走博客发布（图片用语雀图床即可）。

## 第三步:写入 source/_posts

1. 目标文件:`source/_posts/<标题>.md`(文件名可用中文或与现有文章风格一致)。
2. 补全 front-matter:

```yaml
---
title: 文章标题
cover: >-
  封面图URL
categories:
  - 分类一级
  - 分类二级
tags:
  - 标签1
  - 标签2
date: 2026-08-22 20:55:11
---
```

3. `abbrlink` **不要手动写**:保留为空,构建时由 `hexo-abbrlink` 根据 `title` 自动生成并回写到文件。
4. 正文原样保留,不篡改技术内容、代码块、图片与目录结构。

### 第三步补充:正文图片是本地路径时(必须先上传图床)

用户直接给的原稿里,图片常是本地相对路径(`演示截图/xxx.png`)或 `file:///D:/...` 引用,
**博客和 FreeBuf 都无法直接显示,必须先上传图床再发布**。用本技能自带脚本(已内置 65532 代理预检):

```bash
cd "E:\github\hexo-theme-stellar-1.29.1\my-blog"
python ".claude/skills/add-blog-post/upload_local_images.py" "<原稿.md>" \
  --base-dir "<图片相对路径的根目录,默认原稿所在目录>" \
  --out "source/_posts/<标题>.md" \
  --title "<front-matter 标题>" \
  --cover "<封面在正文中的引用,如 演示截图/阶段性漏洞汇总.png>" \
  --categories "安全工具,工具" \
  --tags "标签1,标签2"
```

- 脚本只上传本地图片并替换为 jsDelivr 直链;远程图(如 `cdn.nlark.com`)原样保留,交给 FreeBuf 环节处理
- 传 `--title` 才生成 front-matter(正文首个 H1 与之一致时自动去掉);不传则只输出替换后的正文
- 脚本**不改动原稿**;执行前会预检 65532,代理未开直接退出并提示

## 第四步:构建

```bash
npx hexo clean
npx hexo generate
```

检查点:
- 构建成功,无 front-matter 解析错误
- 新文章生成到 `public/posts/<abbrlink>/index.html`
- `source/_posts/<标题>.md` 里已由插件写入 `abbrlink:` 字段

## 第五步:部署(GitHub Pages)

部署目标是 `wr0ld/wr0ld.github.io`(main 分支)。**执行前先完成第零步的 65532 代理预检;没开 → 用 `ask` 提醒用户开代理,等确认后再继续,不要盲目重试、不要绕行。**

1. **代理已开启** → 清空继承的代理环境变量后部署(hexo-deployer-git 会先在 `.deploy_git` 本地提交,再 push;git 自身 `http.proxy` 已指向 65532):
   ```bash
   http_proxy= https_proxy= HTTP_PROXY= HTTPS_PROXY= ALL_PROXY= npx hexo deploy
   ```
2. 若 `hexo deploy` 的 push 仍报 `Connection was reset`,直接用 git 手动 push(显式指定 65532):
   ```bash
   git -C .deploy_git -c http.proxy=http://127.0.0.1:65532 -c https.proxy=http://127.0.0.1:65532 push "https://github.com/wr0ld/wr0ld.github.io.git" master:main
   ```
   (该仓库 remote 没设 `origin` 名,直接用 URL 指定;本地分支 `master` 推到远端 `main`)
3. 推送失败且已确认代理在开 → 立即把报错原文告诉用户,不要反复盲目尝试。
4. 验证推送成功:远端 `main` 指向最新 commit
   ```bash
   http_proxy= https_proxy= HTTP_PROXY= HTTPS_PROXY= ALL_PROXY= git -C .deploy_git ls-remote "https://github.com/wr0ld/wr0ld.github.io.git" refs/heads/main
   ```
   记录并**明确告知用户**新文章线上地址 `https://wr0ld.github.io/posts/<abbrlink>/`。
   GitHub Pages 构建需 1~3 分钟,首次访问 404 属正常,间隔 60s 复验即可。

## 检查清单

- [ ] 从语雀取到完整正文(yuque_get_doc)
- [ ] 封面/分类已确认（ask）；标签由 AI 自拟
- [ ] FreeBuf 同步：已 ask 是否同步；若同步，已生成 FreeBuf 稿且无 cdn.nlark.com 残留
- [ ] 正文本地图片已上传图床并替换为 jsDelivr 直链(原稿为本地路径时)
- [ ] `source/_posts/<标题>.md` 已创建,front-matter 完整
- [ ] `hexo generate` 成功,生成 `posts/<abbrlink>/index.html`
- [ ] 所有外网操作前已预检 65532;未开启时已 ask 提醒用户开代理(未使用 41956、未无代理硬推)
- [ ] 已在 GitHub 上成功 push,master->main

## 示例

用户:"发布语雀里《JADX 接入 AI:jadx-mcp 极简教程》这篇文章"

处理:

1. `yuque_search(query="jadx-mcp", type=doc)` 找到 doc_id=282275614,`yuque_get_doc(doc_id, repo_id="u46989048/is77fo", format=markdown)` 取正文
2. 封面、分类、标签不确定 → `ask` 用户确认(分类最终可能定为 `安全工具 / 教程`)
3. 写入 `source/_posts/JADX接入AI-jadx-mcp极简教程.md`,补齐 front-matter(不写 abbrlink)
4. `npx hexo clean && npx hexo generate` → 插件自动生成 `abbrlink: 7fcfa72f` 等
5. `Test-NetConnection 127.0.0.1 -Port 65532`:不可用 → 临时无代理 push master→main
6. 验证远端 main 已更新,告知线上地址
