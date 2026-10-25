#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FreeBuf 图片同步脚本（文件夹交付版）
=====================================
功能：
  1. 读取一份 Markdown（通常来自语雀，图片为 cdn.nlark.com 直链，带 front-matter）
  2. 提取正文所有图片 URL，按 URL 去重
  3. 逐张下载到本地临时目录
  4. 经 `gh api`（GitHub Contents API）上传到 wr0ld/BlogImage 图床 img/ 目录
  5. 用 jsDelivr 直链替换正文里的原图 URL
  6. 在输出目录下生成一个交付文件夹 `<标题>_freebuf/`，内含：
       - `<标题>.md`：去掉 front-matter、顶部加一行 `# 标题` 的干净 Markdown
       - `cover.<扩展名>`：封面图（取 front-matter 的 cover，若有）
  不改动原文档/语雀。

网络：
  所有外网请求（图片下载、gh api 上传）强制走 65532 代理——本机唯一可信代理。
  不使用会话环境变量里的其它代理（如 Claude Code Haha 注入的 41956，不稳定）。
  脚本启动时先预检 65532，未开启直接退出并提示开代理。

依赖：
  - `gh` CLI 已登录且对 wr0ld/BlogImage 有 write 权限
  - Python 的 requests

用法：
  python sync_freebuf_images.py <输入.md> [--out <输出上级目录>] [--title <显式标题>]
  不传 --out 时默认输出到 D:\\download\\。输出目录会在末尾打印。
"""

import os
import re
import socket
import sys

# Windows 控制台默认 GBK，无法打印 emoji/生僻字符；强制 UTF-8 输出
for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        try:
            _stream.reconfigure(encoding="utf-8")
        except Exception:
            pass

import base64
import json
import random
import string
import shutil
import subprocess
import tempfile
import requests
from datetime import datetime

# ========== 配置 ==========
OWNER     = "wr0ld"
REPO      = "BlogImage"
IMG_DIR   = "img"
CDN_BASE  = f"https://cdn.jsdelivr.net/gh/{OWNER}/{REPO}@main/{IMG_DIR}"
UA        = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
DEFAULT_OUT_DIR = "D:\\download"

PROXY_HOST = "127.0.0.1"
PROXY_PORT = 65532          # 本机唯一可信代理，未开启时必须停下询问用户
PROXY      = f"http://{PROXY_HOST}:{PROXY_PORT}"
PROXIES    = {"http": PROXY, "https": PROXY}
# ========================


def proxy_alive() -> bool:
    """预检 65532 代理是否开启。"""
    try:
        with socket.create_connection((PROXY_HOST, PROXY_PORT), timeout=3):
            return True
    except OSError:
        return False


# 匹配 Markdown 图片引用 + 图片 URL（http(s) 的 png/jpg/gif/webp/bmp/svg）
IMG_RE = re.compile(r'(!\[[^\]]*\]\(|<img[^>]*src=")(https?://[^")\s]+?\.(?:png|jpe?g|gif|webp|bmp|svg)(?:\?[^\s"()]*)?)("?\))?', re.IGNORECASE)

YAML_HEAD_RE = re.compile(r"^---\r?\n(.*?)\r?\n---\r?\n", re.DOTALL)


def parse_front_matter(md_path: str) -> dict:
    """解析 Markdown 头部的 YAML front-matter，返回 {title, cover, ...}。"""
    with open(md_path, "r", encoding="utf-8") as f:
        head = f.read(2048)
    fm = {}
    m = YAML_HEAD_RE.match(head)
    if not m:
        return fm
    block = m.group(1)
    # 简单解析 title 与 cover（cover 可能是 `cover: >-` 的多行续行）
    t = re.search(r"^\s*title\s*:\s*(.+?)\s*$", block, re.MULTILINE)
    if t:
        fm["title"] = t.group(1).strip().strip("'\"")
    # cover 单行或折叠续行
    c = re.search(r"^\s*cover\s*:\s*(>[-|]?\s*)?\r?\n\s*(https?://\S+)", block, re.MULTILINE)
    if not c:
        c = re.search(r"^\s*cover\s*:\s*(https?://\S+)", block, re.MULTILINE)
    if c:
        fm["cover"] = c.group(2).strip()
    return fm


def strip_front_matter(text: str) -> str:
    """去掉 body 开头的 `--- ... ---` front-matter，返回正文。"""
    m = YAML_HEAD_RE.match(text)
    if m:
        return text[m.end():]
    return text


def extract_image_urls(md_path: str) -> list[str]:
    """按 Markdown 中出现的顺序提取全部去重后图片 URL。"""
    with open(md_path, "r", encoding="utf-8") as f:
        content = f.read()
    urls = [m.group(2) for m in IMG_RE.finditer(content)]
    seen, ordered = set(), []
    for u in urls:
        if u not in seen:
            seen.add(u)
            ordered.append(u)
    return ordered


def unique_filename_from_url(url: str) -> str:
    """生成随机上传文件名：`YYYYMMDD_HHMMSS_<16位随机>.<扩展名>`。不含原名、不可预测。"""
    m = re.search(r"\.(png|jpe?g|gif|webp|bmp|svg)$", url.split("?")[0], re.IGNORECASE)
    ext = ("." + m.group(1).lower()) if m else ".png"
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    rand = "".join(random.choices(string.ascii_letters + string.digits, k=16))
    return f"{ts}_{rand}{ext}"


def ext_of(url: str) -> str:
    m = re.search(r"\.(png|jpe?g|gif|webp|bmp|svg)(?:\?|$)", url.split("?")[0], re.IGNORECASE)
    return ("." + m.group(1).lower()) if m else ".png"


def download(url: str, dest: str) -> bool:
    """下载图片到 dest，带 UA 头，强制走 65532 代理。返回是否成功。"""
    try:
        headers = {"User-Agent": UA}
        r = requests.get(url, headers=headers, timeout=30, proxies=PROXIES)
        r.raise_for_status()
        with open(dest, "wb") as f:
            f.write(r.content)
        return True
    except Exception as e:
        print(f"    ❌ 下载失败 {url}: {e}")
        return False


def upload_via_gh_api(local_path: str, remote_path: str) -> str | None:
    """经 gh api 走 GitHub Contents API 上传文件到仓库，返回 jsDelivr 直链或 None。强制走 65532 代理。"""
    env = {**os.environ, "HTTP_PROXY": PROXY, "HTTPS_PROXY": PROXY,
           "http_proxy": PROXY, "https_proxy": PROXY,
           "ALL_PROXY": PROXY, "all_proxy": PROXY}
    try:
        with open(local_path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode()
        body = {"message": f"upload {os.path.basename(remote_path)}", "content": b64}
        fd, json_path = tempfile.mkstemp(suffix=".json")
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as jf:
                json.dump(body, jf)
            cmd = [
                "gh", "api", "--method", "PUT",
                f"repos/{OWNER}/{REPO}/contents/{remote_path}",
                "--input", json_path,
            ]
            subprocess.run(cmd, capture_output=True, text=True, check=True, env=env)
            return f"{CDN_BASE}/{os.path.basename(remote_path)}"
        finally:
            try:
                os.remove(json_path)
            except OSError:
                pass
    except subprocess.CalledProcessError as e:
        print(f"    ❌ gh api 上传失败: {(e.stderr or e.stdout).strip()[:200]}")
        return None
    except Exception as e:
        print(f"    ❌ 上传出错: {e}")
        return None


def main():
    if len(sys.argv) < 2:
        print("用法: python sync_freebuf_images.py <输入.md> [--out <输出上级目录>] [--title <显式标题>]")
        sys.exit(1)

    md_path = sys.argv[1]
    if not os.path.exists(md_path):
        print(f"❌ 找不到 md：{md_path}")
        sys.exit(1)

    if not proxy_alive():
        print(f"❌ 代理未开启：{PROXY_HOST}:{PROXY_PORT} 连接失败。")
        print("👉 请先开启 65532 代理再运行本脚本（不要使用其它代理或直连）。")
        sys.exit(2)

    out_dir = DEFAULT_OUT_DIR
    if "--out" in sys.argv:
        i = sys.argv.index("--out")
        out_dir = sys.argv[i + 1]

    explicit_title = None
    if "--title" in sys.argv:
        i = sys.argv.index("--title")
        explicit_title = sys.argv[i + 1]

    fm = parse_front_matter(md_path)
    title = explicit_title or fm.get("title") or os.path.splitext(os.path.basename(md_path))[0]

    # 输出交付文件夹
    safe_title = re.sub(r'[\\/:*?"<>|\r\n]+', "_", title).strip(" .")
    bundle_dir = os.path.join(out_dir, f"{safe_title}_freebuf")
    os.makedirs(bundle_dir, exist_ok=True)
    out_md = os.path.join(bundle_dir, f"{safe_title}.md")

    print("=" * 55)
    print("  🐾 FreeBuf 图片同步工具（文件夹交付）")
    print(f"  标题: {title}")
    print(f"  交付目录: {bundle_dir}")
    print("=" * 55)

    # 读取正文
    with open(md_path, "r", encoding="utf-8") as f:
        raw_content = f.read()
    body = strip_front_matter(raw_content)

    urls = extract_image_urls(md_path)
    if not urls:
        print("⚠️  md 里没有找到可处理的正文图片 URL。")
        # 去掉 front-matter + 加标题，仍交付
        final = f"# {title}\n\n" + body.lstrip("\n")
        with open(out_md, "w", encoding="utf-8") as f:
            f.write(final)
        print(f"\n📄 已保存：{out_md}")
        sys.exit(0)

    print(f"📄 共发现 {len(urls)} 张去重后正文图片：")
    for i, u in enumerate(urls, 1):
        print(f"    [{i:02d}] {u[:90]}")

    # 逐张下载并上传，建立 原URL->jsDelivr 映射
    link_map = {}
    tmp_dir = tempfile.mkdtemp(prefix="freebuf_imgs_")
    ok = fail = 0
    try:
        for i, url in enumerate(urls, 1):
            fname = unique_filename_from_url(url)
            local = os.path.join(tmp_dir, fname)
            print(f"\n  [{i:02d}/{len(urls)}] {fname}")
            print(f"        <- {url[:80]} ...", end=" ", flush=True)
            if not download(url, local):
                fail += 1
                continue
            cdn = upload_via_gh_api(local, f"{IMG_DIR}/{fname}")
            if cdn:
                link_map[url] = cdn
                ok += 1
                print(f"✅ {cdn[:90]}")
            else:
                fail += 1
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)

    print(f"\n{'='*55}")
    print(f"📊 同步完成：正文图 成功 {ok} 张，失败 {fail} 张")

    # 正文图片链接替换
    n = 0
    for src, cdn in link_map.items():
        if src in body:
            n += body.count(src)
            body = body.replace(src, cdn)

    # 拼装最终 md：顶部加 H1 标题 + 替换后的正文
    final = f"# {title}\n\n" + body.lstrip("\n")
    with open(out_md, "w", encoding="utf-8") as f:
        f.write(final)

    # 保存封面图到交付文件夹
    cover_ok = False
    cover_url = fm.get("cover")
    if cover_url:
        cover_ext = ext_of(cover_url)
        cover_dest = os.path.join(bundle_dir, f"cover{cover_ext}")
        print(f"\n🖼 封面: <- {cover_url[:80]} ...", end=" ", flush=True)
        cover_ok = download(cover_url, cover_dest)
        print("✅ 已保存" if cover_ok else "❌ 下载失败")

    print(f"\n✅ 已替换 {n} 处正文图片链接")
    print(f"📄 md：{out_md}")
    if cover_ok:
        print(f"🖼 封面：{os.path.join(bundle_dir, f'cover{cover_ext}')}")
    if fail:
        print(f"⚠️  有 {fail} 张未上传，请在输出稿里人工处理对应链接。")
    print("\n🎉 完成！把上面整个文件夹里的 md 复制到 FreeBuf，封面用里面对应的 cover 图片即可。")


if __name__ == "__main__":
    main()
