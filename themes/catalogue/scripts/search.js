/* 生成 /search.json：标题、分类、标签、日期、正文纯文本（截断） */
'use strict';

function plain(html) {
  return String(html || '')
    .replace(/<figure[\s\S]*?<\/figure>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

hexo.extend.generator.register('catalogue_search', function (locals) {
  var posts = locals.posts.sort('-date').toArray().map(function (post) {
    return {
      title: post.title,
      url: post.path,
      date: post.date.format('YYYY-MM-DD'),
      cats: post.categories.toArray().map(function (c) { return c.name; }),
      tags: post.tags.toArray().map(function (t) { return t.name; }),
      text: plain(post.content).slice(0, 600)
    };
  });
  return {
    path: 'search.json',
    data: JSON.stringify(posts)
  };
});
