/* 主题辅助函数：字数、导读、目录层级 */
'use strict';

function strip(html) {
  return String(html || '')
    .replace(/<figure[\s\S]*?<\/figure>/gi, ' ')
    .replace(/<pre[\s\S]*?<\/pre>/gi, ' ')
    .replace(/<code[\s\S]*?<\/code>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(html) {
  var text = strip(html);
  if (!text) return 0;
  var cjk = (text.match(/[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u3040-\u30FF]/g) || []).length;
  var latin = text.replace(/[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u3040-\u30FF]/g, ' ')
    .split(/\s+/).filter(function (w) { return /[A-Za-z0-9_]/.test(w); }).length;
  return cjk + latin;
}

hexo.extend.helper.register('wr_words', function (content) {
  return countWords(content);
});

hexo.extend.helper.register('wr_lead', function (page) {
  // 只使用 front-matter 里的 description；正文首段本来就在下面，重复渲染没意义
  var d = String(page.description || '').trim();
  return d;
});

// 图片：去掉正文里与标题重复的首个 H1，并给图片加懒加载与图注
hexo.extend.filter.register('after_post_render', function (data) {
  if (!data.content) return data;
  data.content = data.content.replace(/<img([^>]*)>/gi, function (full, attrs) {
    if (/data-no-fig/.test(attrs)) return full;
    var src = (attrs.match(/src="([^"]*)"/i) || [])[1] || '';
    if (!src) return full;
    var alt = (attrs.match(/alt="([^"]*)"/i) || [])[1] || '';
    var cleaned = attrs
      .replace(/\s*loading="[^"]*"/gi, '')
      .replace(/\s*decoding="[^"]*"/gi, '');
    var img = '<img' + cleaned + ' loading="lazy" decoding="async">';
    var cap = alt && alt.trim() ? '<figcaption>' + alt.trim() + '</figcaption>' : '';
    return '<figure class="img">' + img + cap + '</figure>';
  });
  return data;
});
