#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
批量修改文章日期脚本
按照指定顺序修改文章的发布日期
"""

import os
import re
from pathlib import Path

def update_article_date(file_path, new_date):
    """更新文章的日期"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 修复重复的日期格式，并更新为新日期
    content = re.sub(
        r'date:\s*[\d\-:\s]+',
        f'date: {new_date}',
        content
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ 已更新: {os.path.basename(file_path)} -> {new_date}")

def main():
    # 文章顺序和对应的日期（从新到旧）
    articles_order = [
        ("THP-CSK内网横向_图床版.md", "2026-03-24 12:00:00"),
        ("哥斯拉魔改_图床版.md", "2026-03-23 12:00:00"),
        ("fscan魔改二开_图床版.md", "2026-03-22 12:00:00"),
        ("sqlmap魔改免杀研究_图床版.md", "2026-03-21 12:00:00"),
        ("linux_privilege_escalation.md", "2026-03-20 12:00:00"),
        ("CTF伪协议.md", "2026-03-19 12:00:00"),
        ("DC-9靶机渗透测试笔记_图床版.md", "2026-03-18 12:00:00"),
        ("DC-8靶机渗透测试笔记_图床版.md", "2026-03-17 12:00:00"),
        ("DC-7靶机渗透测试笔记_图床版.md", "2026-03-16 12:00:00"),
        ("DC-6靶机渗透测试笔记_图床版.md", "2026-03-15 12:00:00"),
        ("DC-5靶机渗透测试笔记_图床版.md", "2026-03-14 12:00:00"),
        ("DC-4靶机渗透测试笔记_图床版.md", "2026-03-13 12:00:00"),
        ("DC-3靶机渗透测试笔记_图床版.md", "2026-03-12 12:00:00"),
        ("DC-2靶机渗透测试笔记_2.md", "2026-03-11 12:00:00"),
        ("DC-1靶机渗透测试笔记_2.md", "2026-03-10 12:00:00"),
        ("DWVA-high.md", "2026-03-09 12:00:00"),
        ("DVWA-medium.md", "2026-03-08 12:00:00"),
        ("DVWA-low.md", "2026-03-07 12:00:00"),
        ("DVWA_WeakSessionID_Cookie端口问题.md", "2026-03-06 12:00:00"),
        ("pikachu靶场笔记_图床版.md", "2026-03-05 12:00:00"),
    ]
    
    # 查找_posts目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    possible_paths = [
        '_posts',
        'source/_posts',
        '../source/_posts',
        '../../source/_posts',
        os.path.join(script_dir, '_posts'),
        os.path.join(os.path.dirname(script_dir), '_posts')
    ]
    
    posts_dir = None
    for path in possible_paths:
        if os.path.exists(path):
            posts_dir = path
            break
    
    if not posts_dir:
        print("❌ 未找到_posts目录！")
        return
    
    print(f"📁 找到文章目录: {posts_dir}\n")
    print("开始批量修改文章日期...\n")
    
    # 按顺序更新文章日期
    for filename, new_date in articles_order:
        file_path = os.path.join(posts_dir, filename)
        if os.path.exists(file_path):
            update_article_date(file_path, new_date)
        else:
            print(f"⚠️  文件不存在: {filename}")
    
    print("\n✨ 所有文章日期已更新完成！")
    print("\n文章顺序（从新到旧）：")
    for i, (filename, date) in enumerate(articles_order, 1):
        print(f"{i:2d}. {date} - {filename}")

if __name__ == '__main__':
    main()
