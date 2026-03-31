#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
批量修复文章Front Matter格式
"""

import os
import re
from pathlib import Path

def fix_front_matter(file_path):
    """修复文章的Front Matter格式"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if not content.startswith('---'):
        return False
    
    lines = content.split('\n')
    
    date_line_index = -1
    for i, line in enumerate(lines):
        if line.startswith('date:'):
            date_line_index = i
            break
    
    if date_line_index == -1:
        return False
    
    date_line = lines[date_line_index]
    
    if '#' in date_line:
        date_part = date_line.split('#')[0].strip()
        title_part = '#' + date_line.split('#', 1)[1]
        
        lines[date_line_index] = date_part
        lines.insert(date_line_index + 1, '---')
        lines.insert(date_line_index + 2, '')
        lines.insert(date_line_index + 3, title_part)
        
        content = '\n'.join(lines)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ 已修复: {os.path.basename(file_path)}")
        return True
    
    return False

def main():
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
    print("开始修复Front Matter格式...\n")
    
    fixed_count = 0
    for md_file in Path(posts_dir).glob('*.md'):
        if fix_front_matter(md_file):
            fixed_count += 1
    
    print(f"\n✨ 共修复了 {fixed_count} 个文件的Front Matter格式！")

if __name__ == '__main__':
    main()
