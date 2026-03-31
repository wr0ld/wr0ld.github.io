#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Hexo博客文章时间排序工具
功能：快速调整文章的发布时间顺序
"""

import os
import re
from datetime import datetime
from pathlib import Path

class ArticleSorter:
    def __init__(self, source_dir='_posts'):
        self.source_dir = Path(source_dir)
        self.articles = []
        
    def scan_articles(self):
        """扫描所有文章"""
        self.articles = []
        
        for md_file in self.source_dir.rglob('*.md'):
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # 提取front matter
            front_matter = self.extract_front_matter(content)
            if front_matter:
                self.articles.append({
                    'file': md_file,
                    'title': front_matter.get('title', '无标题'),
                    'date': front_matter.get('date', ''),
                    'updated': front_matter.get('updated', ''),
                    'categories': front_matter.get('categories', []),
                    'tags': front_matter.get('tags', []),
                    'content': content
                })
        
        # 按日期排序
        self.articles.sort(key=lambda x: x['date'], reverse=True)
        
    def extract_front_matter(self, content):
        """提取front matter信息"""
        if not content.startswith('---'):
            return None
            
        parts = content.split('---', 2)
        if len(parts) < 3:
            return None
            
        front_matter_str = parts[1].strip()
        front_matter = {}
        
        for line in front_matter_str.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                
                # 处理列表
                if value.startswith('[') and value.endswith(']'):
                    value = [v.strip().strip('"').strip("'") for v in value[1:-1].split(',') if v.strip()]
                
                front_matter[key] = value
                
        return front_matter
    
    def update_article_date(self, article, new_date):
        """更新文章日期"""
        content = article['content']
        
        # 更新date字段
        content = re.sub(
            r'date:\s*[\d\-:T]+',
            f'date: {new_date}',
            content
        )
        
        # 如果有updated字段，也更新它
        if 'updated' in article and article['updated']:
            content = re.sub(
                r'updated:\s*[\d\-:T]+',
                f'updated: {new_date}',
                content
            )
        
        # 写回文件
        with open(article['file'], 'w', encoding='utf-8') as f:
            f.write(content)
            
        article['date'] = new_date
        if 'updated' in article:
            article['updated'] = new_date
    
    def list_articles(self):
        """列出所有文章"""
        print("\n" + "="*80)
        print(f"{'序号':<6} {'标题':<40} {'发布日期':<20} {'分类':<15}")
        print("="*80)
        
        for i, article in enumerate(self.articles, 1):
            title = article['title'][:38] + '..' if len(article['title']) > 40 else article['title']
            date = article['date'][:19] if article['date'] else '无日期'
            categories = article['categories'] if isinstance(article['categories'], list) else [article['categories']]
            cat_str = ', '.join(categories)[:13] + '..' if len(', '.join(categories)) > 15 else ', '.join(categories)
            
            print(f"{i:<6} {title:<40} {date:<20} {cat_str:<15}")
        
        print("="*80 + "\n")
    
    def interactive_mode(self):
        """交互模式"""
        print("\n🎮 Hexo博客文章时间排序工具")
        print("="*80)
        
        while True:
            self.list_articles()
            
            print("操作选项：")
            print("  1. 调整文章顺序（输入两个序号，用空格分隔）")
            print("  2. 设置文章日期（输入序号和日期，用空格分隔）")
            print("  3. 批量调整日期（输入起始序号）")
            print("  4. 刷新列表")
            print("  0. 退出")
            print()
            
            choice = input("请选择操作: ").strip()
            
            if choice == '0':
                print("\n👋 感谢使用！")
                break
                
            elif choice == '4':
                self.scan_articles()
                print("\n✅ 列表已刷新！")
                
            elif choice == '1':
                try:
                    nums = input("输入两个序号（如: 3 5）: ").strip().split()
                    if len(nums) != 2:
                        print("❌ 请输入两个序号！")
                        continue
                        
                    idx1, idx2 = int(nums[0]) - 1, int(nums[1]) - 1
                    
                    if 0 <= idx1 < len(self.articles) and 0 <= idx2 < len(self.articles):
                        # 交换日期
                        date1 = self.articles[idx1]['date']
                        date2 = self.articles[idx2]['date']
                        
                        self.update_article_date(self.articles[idx1], date2)
                        self.update_article_date(self.articles[idx2], date1)
                        
                        # 重新排序
                        self.scan_articles()
                        print(f"\n✅ 已交换文章 '{self.articles[idx1]['title']}' 和 '{self.articles[idx2]['title']}' 的日期！")
                    else:
                        print("❌ 序号超出范围！")
                        
                except ValueError:
                    print("❌ 输入格式错误！")
                    
            elif choice == '2':
                try:
                    parts = input("输入序号和日期（如: 3 2024-01-15 12:00:00）: ").strip().split(maxsplit=1)
                    if len(parts) != 2:
                        print("❌ 请输入序号和日期！")
                        continue
                        
                    idx = int(parts[0]) - 1
                    new_date = parts[1]
                    
                    if 0 <= idx < len(self.articles):
                        self.update_article_date(self.articles[idx], new_date)
                        self.scan_articles()
                        print(f"\n✅ 已更新文章 '{self.articles[idx]['title']}' 的日期为 {new_date}！")
                    else:
                        print("❌ 序号超出范围！")
                        
                except ValueError:
                    print("❌ 输入格式错误！")
                    
            elif choice == '3':
                try:
                    start_idx = int(input("输入起始序号: ").strip()) - 1
                    
                    if 0 <= start_idx < len(self.articles):
                        base_date = datetime.now()
                        
                        for i, article in enumerate(self.articles[start_idx:], start=0):
                            new_date = base_date.replace(day=base_date.day - i)
                            new_date_str = new_date.strftime('%Y-%m-%d %H:%M:%S')
                            self.update_article_date(article, new_date_str)
                        
                        self.scan_articles()
                        print(f"\n✅ 已批量调整从序号 {start_idx + 1} 开始的文章日期！")
                    else:
                        print("❌ 序号超出范围！")
                        
                except ValueError:
                    print("❌ 输入格式错误！")

def main():
    import sys
    import os
    
    # 获取脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 自动查找_posts目录
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
        print("\n请尝试以下方法：")
        print("1. 在命令行中切换到博客的source目录：")
        print("   cd my-blog/source")
        print("   python article_sorter.py")
        print("\n2. 或者直接在source目录下运行：")
        print("   cd c:\\aaaaaaaaaaaaaaaa\\hexo-theme-stellar-1.29.1\\my-blog\\source")
        print("   python article_sorter.py")
        sys.exit(1)
    
    # 切换到正确的目录
    target_dir = os.path.dirname(posts_dir) if posts_dir != '_posts' else os.getcwd()
    if os.getcwd() != target_dir:
        os.chdir(target_dir)
        print(f"✅ 已自动切换到: {os.getcwd()}\n")
    
    sorter = ArticleSorter()
    sorter.scan_articles()
    sorter.interactive_mode()

if __name__ == '__main__':
    main()
