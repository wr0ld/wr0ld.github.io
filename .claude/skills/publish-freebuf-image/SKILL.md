---
name: publish-freebuf-image
description: 把文章里的语雀/CDN 图片上传到 GitHub 图床(wr0ld/BlogImage)并生成一个 FreeBuf 发布文件夹（内含去 front-matter 的 md + cover 封面图）。FreeBuf 等平台不支持语雀图床外链;发布文章如需同步 FreeBuf 时执行。
---

# FreeBuf 图片同步（生成可发布交付文件夹）

## 用途

FreeBuf 等平台无法直接内联语雀图床(`cdn.nlark.com/...`)的图片。本 skill 把文章 md 里的图片:

1. 下载到本地临时目录
2. 通过 `gh api`(GitHub Contents API)上传到图床仓库 `wr0ld/BlogImage` 的 `img/` 目录
3. 用 jsDelivr 直链(`https://cdn.jsdelivr.net/gh/wr0ld/BlogImage@main/img/<name>`)替换正文链接
4. 在输出目录下生成一个**交付文件夹** `<标题>_freebuf/`，内含：
   - `<标题>.md`：**去掉 front-matter**、顶部加一行 `# 标题` 的干净 Markdown（正文图已替换为 jsDelivr 直链）
   - `cover.<扩展名>`：封面图（取 front-matter 的 `cover`，若存在）
   **不改动原文档/语雀**。

## 为什么要去 front-matter

把博客用的 md（带 YAML 头 `title/cover/categories/tags/...`）直接粘到 FreeBuf 编辑器，front-matter 会以普通文本显示在文章开头（`[已粘贴文本 #1]`），很难看。所以交付的 FreeBuf 稿要**去掉 front-matter、只保留标题**；FreeBuf 的封面是单独上传项，因此封面临时作为本地图片 `cover.png` 一并放进文件夹。

## 内容准则（重要）

- **文章内容一律以语雀原文为准**，不得擅自修改任何正文。
- 唯一允许的改动：**图片链接替换**（`cdn.nlark.com/...` → jsDelivr 直链）、去掉 front-matter、顶部加 H1 标题行。
- 不增删改原正文的段落、代码、列表、表格、目录等任何内容（表格按语雀原样保留，避免破坏）。

## 何时用

- 用户发布文章时还要同步到 FreeBuf
- 用户给出含 `cdn.nlark.com` 图片链接的 md，要一份可发布到 FreeBuf 的交付物
- 用户要求"弄成 FreeBuf 用的 md + 封面一个文件夹"

## 前置检查

- [ ] **65532 代理已开启**（脚本启动时会自检；未开直接退出，此时用 `ask` 提醒用户开代理，等确认后重跑；禁止改用 41956、禁止无代理硬跑）：
  ```powershell
  Test-NetConnection 127.0.0.1 -Port 65532 -InformationLevel Quiet
  ```
- [ ] `gh` 已登录且有 `wr0ld/BlogImage` 写权限：`gh auth status`（应显示 `account wr0ld`，token 有 `repo` scope）
- [ ] Python 有 `requests`（下载语雀图片用）

> 不需要 PicGo 常驻；本方案走 `gh API`。
> **代理**：脚本所有外网请求（图片下载 + `gh api` 上传）强制走 `http://127.0.0.1:65532`（本机唯一可信代理）；
> 会话环境变量里被第三方启动器（Claude Code Haha）注入的 `41956` 不稳定（会 502），一律不使用。

## 执行步骤

在 `my-blog` 目录下运行脚本：

```bash
cd "E:\github\hexo-theme-stellar-1.29.1\my-blog"
python ".claude/skills/publish-freebuf-image/sync_freebuf_images.py" "<输入.md>" --out "D:\download"
```

- `<输入.md>`：带 front-matter 的文章 md（通常是 `source/_posts/<标题>.md` 或从语雀取出的正文）。
- `--out <目录>`：输出**上级目录**（默认 `D:\download`）。脚本会在该目录下新建 `<标题>_freebuf\` 文件夹，内含 `md + cover.图`。
- 可选 `--title <标题>`：显式指定标题（缺省取 front-matter 的 `title`）。

## 脚本说明（sync_freebuf_images.py）

- 解析 front-matter 拿 `title` 与 `cover`；正文只替换图片链接，其余一字不改。
- 提取正文 `https://...png/jpg/gif/webp/bmp/svg` 图片 URL，按 URL 去重。
- **上传文件名为随机**：`YYYYMMDD_HHMMSS_<16位随机>.<扩展名>`，随机不可预测、不含语雀原名；时间戳到秒 + 16 位随机避免同秒重名。
- 上传用临时 JSON 文件承载 base64 body（避免 Windows 命令行长度限制），上传后即删。
- **临时文件自动清理**：下载图存于 `freebuf_imgs_*` 临时目录，脚本结束自动 `rmtree`，不留残留。
- 生成 md：去掉 front-matter → 顶部加 `# 标题` → 正文图片替换 jsDelivr 直链。
- 封面：`download(front-matter cover)` 到交付文件夹存为 `cover.<ext>`（不上传；FreeBuf 封面单独上传用）。
- **代理**：启动先预检 65532，未开启打印提示并 `exit(2)`；图片下载走 `requests(proxies=...)`、上传走 `gh api`（显式注入 65532 环境变量），不依赖会话继承的代理。

## 验证

- 交付文件夹存在：`<输出目录>/<标题>_freebuf/`，内含 `<标题>.md` + `cover.<ext>`。
- md 第一行是 `# 标题`（**没有** `--- title:...` front-matter）。
- md 里 `cdn.nlark.com` 残留应为 **0**：
  ```powershell
  (Select-String -Path "<交付目录>\<标题>.md" -Pattern "cdn\.nlark\.com" | Measure-Object).Count   # 应为 0
  ```
- 抽查一条 jsDelivr URL 返回 200。
- 有失败张数时，脚本会列出，输出稿中对应链接需人工处理。

## 与 add-blog-post 的衔接

发布文章前会先 ask 用户"是否同步 FreeBuf"：

- **要** → 先生成 FreeBuf 交付文件夹（本 skill），在最终交付时明确给出**交付文件夹的绝对路径**和里面 md / cover 的完整路径。
- **不要** → 直接走博客发布（图片用语雀图床即可）。

## 备注

- jsDelivr 用 `@main` 分支标签，首次上传后几分钟内生效；遇 404 可改用 `@<commit-sha>` 或稍等重试。
- 图床仓库固定为 `wr0ld/BlogImage`（博客正文图片也统一用它）。
- 若脚本报"代理未开启"，请用户开启 65532 后直接重跑；对同一 md 重跑会重新上传（生成新链接、内容一致），不影响交付结果。
- 交付文件夹名/文件名若含中文标点（如 `：`）在 Windows 合法，可正常使用；如需替换标题里的邮箱/路径不合法字符可在 `--title` 指定。
