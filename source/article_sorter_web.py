#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Hexo博客文章时间排序工具 - Web版
功能：通过Web界面快速调整文章的发布时间顺序
"""

import os
import re
from datetime import datetime
from pathlib import Path
from flask import Flask, render_template_string, jsonify, request

app = Flask(__name__)

HTML_TEMPLATE = '''
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hexo博客文章时间排序工具</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .controls {
            padding: 20px 30px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            gap: 15px;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s;
        }
        
        .btn-primary {
            background: #667eea;
            color: white;
        }
        
        .btn-primary:hover {
            background: #5568d3;
            transform: translateY(-2px);
        }
        
        .btn-success {
            background: #28a745;
            color: white;
        }
        
        .btn-success:hover {
            background: #218838;
            transform: translateY(-2px);
        }
        
        .btn-warning {
            background: #ffc107;
            color: #212529;
        }
        
        .btn-warning:hover {
            background: #e0a800;
            transform: translateY(-2px);
        }
        
        .btn-danger {
            background: #dc3545;
            color: white;
        }
        
        .btn-danger:hover {
            background: #c82333;
            transform: translateY(-2px);
        }
        
        .stats {
            padding: 20px 30px;
            background: white;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            gap: 30px;
            flex-wrap: wrap;
        }
        
        .stat-item {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .stat-label {
            color: #6c757d;
            font-size: 1em;
        }
        
        .stat-value {
            font-size: 1.5em;
            font-weight: bold;
            color: #667eea;
        }
        
        .articles-container {
            padding: 20px 30px;
            max-height: 600px;
            overflow-y: auto;
        }
        
        .article-list {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .article-item {
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s;
            cursor: move;
        }
        
        .article-item:hover {
            border-color: #667eea;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
            transform: translateY(-2px);
        }
        
        .article-item.dragging {
            opacity: 0.5;
            transform: scale(1.02);
        }
        
        .article-item.drag-over {
            border-color: #28a745;
            background: #f8fff9;
        }
        
        .article-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .article-number {
            background: #667eea;
            color: white;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1.1em;
        }
        
        .article-title {
            flex: 1;
            margin-left: 15px;
            font-size: 1.2em;
            font-weight: 600;
            color: #212529;
        }
        
        .article-meta {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }
        
        .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .meta-label {
            color: #6c757d;
            font-size: 0.9em;
        }
        
        .meta-value {
            color: #495057;
            font-weight: 600;
        }
        
        .date-input {
            border: 2px solid #e9ecef;
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 14px;
            transition: all 0.3s;
        }
        
        .date-input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .drag-handle {
            color: #adb5bd;
            font-size: 1.5em;
            cursor: move;
            padding: 0 10px;
        }
        
        .article-item:hover .drag-handle {
            color: #667eea;
        }
        
        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transform: translateX(400px);
            transition: transform 0.3s;
            z-index: 1000;
        }
        
        .toast.show {
            transform: translateX(0);
        }
        
        .toast.error {
            background: #dc3545;
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #6c757d;
        }
        
        .empty-state h3 {
            font-size: 1.5em;
            margin-bottom: 10px;
        }
        
        @media (max-width: 768px) {
            .controls {
                flex-direction: column;
                align-items: stretch;
            }
            
            .stats {
                flex-direction: column;
                gap: 15px;
            }
            
            .article-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }
            
            .article-meta {
                flex-direction: column;
                gap: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📝 Hexo博客文章时间排序工具</h1>
            <p>拖拽文章调整顺序，或直接修改日期时间</p>
        </div>
        
        <div class="controls">
            <button class="btn btn-primary" onclick="loadArticles()">🔄 刷新列表</button>
            <button class="btn btn-success" onclick="saveAllChanges()">💾 保存所有更改</button>
            <button class="btn btn-warning" onclick="autoSortByDate()">📅 按日期自动排序</button>
            <button class="btn btn-danger" onclick="resetChanges()">↩️ 重置更改</button>
        </div>
        
        <div class="stats">
            <div class="stat-item">
                <span class="stat-label">文章总数:</span>
                <span class="stat-value" id="totalArticles">0</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">已修改:</span>
                <span class="stat-value" id="modifiedCount">0</span>
            </div>
        </div>
        
        <div class="articles-container">
            <div class="article-list" id="articleList"></div>
        </div>
    </div>
    
    <div class="toast" id="toast"></div>
    
    <script>
        let articles = [];
        let originalArticles = [];
        let draggedItem = null;
        
        async function loadArticles() {
            try {
                const response = await fetch('/api/articles');
                articles = await response.json();
                originalArticles = JSON.parse(JSON.stringify(articles));
                renderArticles();
                updateStats();
                showToast('文章列表已加载', 'success');
            } catch (error) {
                showToast('加载失败: ' + error.message, 'error');
            }
        }
        
        function renderArticles() {
            const container = document.getElementById('articleList');
            
            if (articles.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>暂无文章</h3>
                        <p>请确保_posts目录中有文章</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = articles.map((article, index) => `
                <div class="article-item" draggable="true" data-index="${index}">
                    <div class="article-header">
                        <div class="article-number">${index + 1}</div>
                        <div class="article-title">${article.title}</div>
                        <div class="drag-handle">⋮⋮</div>
                    </div>
                    <div class="article-meta">
                        <div class="meta-item">
                            <span class="meta-label">📅 发布日期:</span>
                            <input type="datetime-local" class="date-input" 
                                   value="${formatDateTimeLocal(article.date)}"
                                   onchange="updateArticleDate(${index}, this.value)">
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">📁 分类:</span>
                            <span class="meta-value">${Array.isArray(article.categories) ? article.categories.join(', ') : article.categories || '未分类'}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">🏷️ 标签:</span>
                            <span class="meta-value">${Array.isArray(article.tags) ? article.tags.join(', ') : article.tags || '无标签'}</span>
                        </div>
                    </div>
                </div>
            `).join('');
            
            const items = document.querySelectorAll('.article-item');
            items.forEach(item => {
                item.addEventListener('dragstart', handleDragStart);
                item.addEventListener('dragend', handleDragEnd);
                item.addEventListener('dragover', handleDragOver);
                item.addEventListener('drop', handleDrop);
                item.addEventListener('dragenter', handleDragEnter);
                item.addEventListener('dragleave', handleDragLeave);
            });
        }
        
        function formatDateTimeLocal(dateStr) {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        }
        
        function updateArticleDate(index, value) {
            const date = new Date(value);
            articles[index].date = date.toISOString().replace('T', ' ').substring(0, 19);
            updateStats();
        }
        
        function handleDragStart(e) {
            draggedItem = this;
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        }
        
        function handleDragEnd(e) {
            this.classList.remove('dragging');
            document.querySelectorAll('.article-item').forEach(item => {
                item.classList.remove('drag-over');
            });
        }
        
        function handleDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        }
        
        function handleDragEnter(e) {
            this.classList.add('drag-over');
        }
        
        function handleDragLeave(e) {
            this.classList.remove('drag-over');
        }
        
        function handleDrop(e) {
            e.preventDefault();
            
            if (draggedItem !== this) {
                const fromIndex = parseInt(draggedItem.dataset.index);
                const toIndex = parseInt(this.dataset.index);
                
                const temp = articles[fromIndex];
                articles[fromIndex] = articles[toIndex];
                articles[toIndex] = temp;
                
                const tempDate = articles[fromIndex].date;
                articles[fromIndex].date = articles[toIndex].date;
                articles[toIndex].date = tempDate;
                
                renderArticles();
                updateStats();
            }
            
            this.classList.remove('drag-over');
        }
        
        function updateStats() {
            document.getElementById('totalArticles').textContent = articles.length;
            
            let modified = 0;
            articles.forEach((article, index) => {
                if (JSON.stringify(article) !== JSON.stringify(originalArticles[index])) {
                    modified++;
                }
            });
            document.getElementById('modifiedCount').textContent = modified;
        }
        
        async function saveAllChanges() {
            try {
                const response = await fetch('/api/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(articles),
                });
                
                const result = await response.json();
                
                if (result.success) {
                    originalArticles = JSON.parse(JSON.stringify(articles));
                    updateStats();
                    showToast('所有更改已保存！', 'success');
                } else {
                    showToast('保存失败: ' + result.message, 'error');
                }
            } catch (error) {
                showToast('保存失败: ' + error.message, 'error');
            }
        }
        
        function autoSortByDate() {
            articles.sort((a, b) => new Date(b.date) - new Date(a.date));
            renderArticles();
            updateStats();
            showToast('已按日期降序排列', 'success');
        }
        
        function resetChanges() {
            articles = JSON.parse(JSON.stringify(originalArticles));
            renderArticles();
            updateStats();
            showToast('已重置所有更改', 'success');
        }
        
        function showToast(message, type = 'success') {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.className = 'toast ' + type;
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
        
        loadArticles();
    </script>
</body>
</html>
'''

class ArticleSorter:
    def __init__(self, source_dir='./_posts'):
        self.source_dir = Path(source_dir)
        self.articles = []
        
    def scan_articles(self):
        self.articles = []
        
        for md_file in self.source_dir.rglob('*.md'):
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            front_matter = self.extract_front_matter(content)
            if front_matter:
                self.articles.append({
                    'file': str(md_file),
                    'title': front_matter.get('title', '无标题'),
                    'date': front_matter.get('date', ''),
                    'updated': front_matter.get('updated', ''),
                    'categories': front_matter.get('categories', []),
                    'tags': front_matter.get('tags', [])
                })
        
        self.articles.sort(key=lambda x: x['date'], reverse=True)
        
    def extract_front_matter(self, content):
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
                
                if value.startswith('[') and value.endswith(']'):
                    value = [v.strip().strip('"').strip("'") for v in value[1:-1].split(',') if v.strip()]
                else:
                    value = value
                
                front_matter[key] = value
        
        return front_matter
    
    def update_article_date(self, file_path, new_date):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        content = re.sub(
            r'date:\s*[\d\-:T]+',
            f'date: {new_date}',
            content
        )
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

sorter = None

@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)

@app.route('/api/articles')
def get_articles():
    sorter.scan_articles()
    
    articles_data = []
    for article in sorter.articles:
        articles_data.append({
            'file': article['file'],
            'title': article['title'],
            'date': article['date'],
            'updated': article['updated'],
            'categories': article['categories'],
            'tags': article['tags']
        })
    
    return jsonify(articles_data)

@app.route('/api/save', methods=['POST'])
def save_articles():
    try:
        articles = request.json
        
        for article in articles:
            sorter.update_article_date(article['file'], article['date'])
        
        return jsonify({'success': True, 'message': '保存成功'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

if __name__ == '__main__':
    import sys
    
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
        print("\n请尝试以下方法：")
        print("1. 在命令行中切换到博客的source目录：")
        print("   cd my-blog/source")
        print("   python article_sorter_web.py")
        print("\n2. 或者直接在source目录下运行：")
        print("   cd c:\\aaaaaaaaaaaaaaaa\\hexo-theme-stellar-1.29.1\\my-blog\\source")
        print("   python article_sorter_web.py")
        sys.exit(1)
    
    target_dir = os.path.dirname(posts_dir) if posts_dir != '_posts' else os.getcwd()
    if os.getcwd() != target_dir:
        os.chdir(target_dir)
        print(f"✅ 已自动切换到: {os.getcwd()}\n")
    
    sorter = ArticleSorter()
    sorter.scan_articles()
    
    print("🌐 启动Web服务器...")
    print("📱 请在浏览器中打开: http://localhost:5000")
    print("⚠️  按 Ctrl+C 停止服务器\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
