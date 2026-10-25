#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
本地图片上传图床 → 生成博客稿
================================
把 Markdown 里的本地图片引用（相对路径 / file:///）上传到 GitHub 图床 wr0ld/BlogImage，
替换为 jsDelivr 直链，并可选地生成带 front-matter 的博客发布稿；原稿不改动。

所有外网请求（gh api）强制走 65532 代理——本机唯一可信代理。
不使用会话环境变量里的其它代理（如 Claude Code Haha 注入的 41956，不稳定）。
脚本启动时先预检 65532，未开启直接退出并提示开代理。

用法:
  python upload_local_images.py <输入.md> [选项]

选项:
  --base-dir DIR     本地图片相对路径的根目录（默认：输入 md 所在目录）
  --out PATH         输出 md 路径（默认：与输入同目录、文件名后缀 .blog.md）
  --title TITLE      生成 front-matter（传了才生成）；正文首个 H1 与之一致时会被移除
  --cover REF        封面在正文中的引用（本地路径或 URL）；默认取第一张上传成功的本地图
  --categories A,B   分类，逗号分隔，顺序即层级
  --tags A,B,C       标签，逗号分隔
  --date "YYYY-MM-DD HH:MM:SS"   默认当前时间
"""

import argparse
import base64
import json
import os
import random
import re
import socket
import string
import subprocess
import sys
import tempfile
from datetime import datetime
from urllib.parse import unquote

for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        try:
            _stream.reconfigure(encoding="utf-8")
        except Exception:
            pass

# ========== 配置 ==========
PROXY_HOST = "127.0.0.1"
PROXY_PORT = 65532
PROXY = f"http://{PROXY_HOST}:{PROXY_PORT}"
OWNER = "wr0ld"
REPO = "BlogImage"
IMG_DIR = "img"
CDN_BASE = f"https://cdn.jsdelivr.net/gh/{OWNER}/{REPO}@main/{IMG_DIR}"
# =========================

MD_IMG = re.compile(r'!\[[^\]]*\]\(([^)\s]+)\)')
HTML_IMG = re.compile(r'<img[^>]*?src="([^"]+)"[^>]*>')


def proxy_alive() -> bool:
    try:
        with socket.create_connection((PROXY_HOST, PROXY_PORT), timeout=3):
            return True
    except OSError:
        return False


def unique_filename(ext: str) -> str:
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    rand = "".join(random.choices(string.ascii_letters + string.digits, k=16))
    return f"{ts}_{rand}{ext}"


def upload_via_gh_api(local_path: str) -> str | None:
    """经 gh api 上传到 BlogImage，返回 jsDelivr 直链；强制走 65532 代理。"""
    ext = os.path.splitext(local_path)[1].lower() or ".png"
    remote_path = f"{IMG_DIR}/{unique_filename(ext)}"
    env = {
        **os.environ,
        "HTTP_PROXY": PROXY, "HTTPS_PROXY": PROXY,
        "http_proxy": PROXY, "https_proxy": PROXY,
        "ALL_PROXY": PROXY, "all_proxy": PROXY,
    }
    try:
        with open(local_path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode()
        fd, json_path = tempfile.mkstemp(suffix=".json")
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as jf:
                json.dump({"message": f"upload {os.path.basename(remote_path)}",
                           "content": b64}, jf)
            subprocess.run(
                ["gh", "api", "--method", "PUT",
                 f"repos/{OWNER}/{REPO}/contents/{remote_path}", "--input", json_path],
                capture_output=True, text=True, check=True, env=env,
            )
            return f"{CDN_BASE}/{os.path.basename(remote_path)}"
        finally:
            try:
                os.remove(json_path)
            except OSError:
                pass
    except subprocess.CalledProcessError as e:
        print(f"    ❌ gh api 上传失败: {(e.stderr or e.stdout).strip()[:200]}")
    except Exception as e:
        print(f"    ❌ 上传出错: {e}")
    return None


def to_local_path(ref: str, base_dir: str) -> str | None:
    """把正文图片引用解析成本地绝对路径；http(s) 引用返回 None。"""
    if re.match(r'^https?://', ref, re.IGNORECASE):
        return None
    ref = ref.strip()
    if ref.startswith("file:///"):
        p = unquote(ref[len("file:///"):])
    else:
        p = unquote(ref)
    p = p.replace("/", os.sep)
    if not os.path.isabs(p):
        p = os.path.join(base_dir, p)
    return os.path.normpath(p)


def build_front_matter(args, cover: str) -> str:
    lines = ["---", f"title: {args.title}", "cover: >-", f"  {cover}"]
    lines.append("categories:")
    lines += [f"  - {c.strip()}" for c in args.categories.split(",") if c.strip()]
    lines.append("tags:")
    lines += [f"  - {t.strip()}" for t in args.tags.split(",") if t.strip()]
    date = args.date or datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    lines.append(f"date: {date}")
    lines.append("---")
    return "\n".join(lines) + "\n\n"


def main():
    ap = argparse.ArgumentParser(description="本地图片上传图床并生成博客稿")
    ap.add_argument("input_md")
    ap.add_argument("--base-dir", default=None)
    ap.add_argument("--out", default=None)
    ap.add_argument("--title", default=None)
    ap.add_argument("--cover", default=None)
    ap.add_argument("--categories", default="")
    ap.add_argument("--tags", default="")
    ap.add_argument("--date", default=None)
    args = ap.parse_args()

    if not os.path.exists(args.input_md):
        print(f"❌ 找不到输入 md：{args.input_md}")
        sys.exit(1)

    if not proxy_alive():
        print(f"❌ 代理未开启：{PROXY_HOST}:{PROXY_PORT} 连接失败。")
        print("👉 请先开启 65532 代理再运行本脚本（不要使用其它代理或直连）。")
        sys.exit(2)

    base_dir = args.base_dir or os.path.dirname(os.path.abspath(args.input_md))
    out_path = args.out or (os.path.splitext(args.input_md)[0] + ".blog.md")

    with open(args.input_md, "r", encoding="utf-8") as f:
        body = f.read().lstrip("\ufeff \n")

    if args.title:
        body = re.sub(r'^#\s+.*\r?\n+', '', body, count=1)

    refs = [m.group(1) for m in MD_IMG.finditer(body)] + \
           [m.group(1) for m in HTML_IMG.finditer(body)]
    seen, ordered = set(), []
    for r in refs:
        if r not in seen:
            seen.add(r)
            ordered.append(r)

    print("=" * 55)
    print("  本地图片上传图床 → 生成博客稿")
    print(f"  代理: {PROXY}（已开启）")
    print("=" * 55)

    link_map, ok, fail = {}, 0, 0
    for i, ref in enumerate(ordered, 1):
        local = to_local_path(ref, base_dir)
        if local is None:
            print(f"  [{i:02d}/{len(ordered)}] 跳过远程图: {ref[:80]}")
            continue
        if not os.path.exists(local):
            print(f"  [{i:02d}/{len(ordered)}] ❌ 本地文件不存在: {local}")
            fail += 1
            continue
        print(f"  [{i:02d}/{len(ordered)}] {os.path.basename(local)} ...", end=" ", flush=True)
        cdn = upload_via_gh_api(local)
        if cdn:
            link_map[ref] = cdn
            ok += 1
            print(f"✅ {cdn}")
        else:
            fail += 1

    print(f"\n📊 上传完成：成功 {ok} 张，失败 {fail} 张")

    n = 0
    for src, cdn in link_map.items():
        n += body.count(src)
        body = body.replace(src, cdn)
    print(f"✅ 已替换 {n} 处本地图片引用")

    header = ""
    if args.title:
        cover = None
        if args.cover:
            cover = link_map.get(args.cover)
            if not cover and re.match(r'^https?://', args.cover or "", re.IGNORECASE):
                cover = args.cover
            if not cover:
                print(f"❌ --cover 指定的引用未能上传成功: {args.cover}")
                sys.exit(1)
        elif link_map:
            cover = next(iter(link_map.values()))
        if not cover:
            print("❌ 无法确定封面（没有上传成功的本地图片，且未指定 --cover）")
            sys.exit(1)
        header = build_front_matter(args, cover)
        print(f"🖼 封面: {cover}")

    with open(out_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(header + body.lstrip("\n"))

    print(f"📄 输出: {out_path}")
    remote_left = [r for r in ordered if r not in link_map]
    if remote_left:
        print("剩余远程图（如为 cdn.nlark.com，FreeBuf 环节处理）:")
        for r in remote_left:
            print(f"    {r[:90]}")


if __name__ == "__main__":
    main()
