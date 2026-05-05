'use strict';

hexo.extend.filter.register('after_render:html', require('./lib/img_lazyload').processSite);
hexo.extend.filter.register('after_render:html', require('./lib/img_onerror').processSite);

// Mermaid: convert highlight.js wrapped ```mermaid blocks to <pre class="mermaid">
hexo.extend.filter.register('after_post_render', function(data) {
  if (!data.content) return data;
  data.content = data.content.replace(/<figure class="highlight[^"]*">\s*<table>\s*<tr>\s*<td class="gutter">[\s\S]*?<\/td>\s*<td class="code">\s*<pre>([\s\S]*?)<\/pre>\s*<\/td>\s*<\/tr>\s*<\/table>\s*<\/figure>/g, function(match, preContent) {
    var text = preContent.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '');
    text = text.replace(/<br\s*\/?>/g, '\n').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').trim();
    if (text.includes('graph ') || text.includes('flowchart ') || text.includes('sequenceDiagram') || text.includes('classDiagram') || text.includes('stateDiagram') || text.includes('erDiagram') || text.includes('gantt') || text.includes('pie ') || text.includes('gitgraph')) {
      return '<pre class="mermaid">' + text + '</pre>';
    }
    return match;
  });
  return data;
}, 99);

function change_image(data) {
    if (this.theme.config.tag_plugins.image.parse_markdown) {
      // data.content = data.content.replace(
      //     /!\[(.*?)\]\((.*?)\s*(?:"(.*?)")?\)/g,
      //     '{% image $2 $3 %}'
      // );
      let splited_content = data.content.split(/(```[\s\S]*?```|{%\s*gallery\s*%}[\s\S]*?{%\s*endgallery\s*%})/g);
      splited_content = splited_content.map((s) => {
        let matches_no = s.match(/(```[\s\S]*?```|{%\s*gallery\s*%}[\s\S]*?{%\s*endgallery\s*%})/i);
        let matches_img = s.match(/!\[(.*?)\]\((.*?)\s*(?:"(.*?)")?\)/i);
        if (!matches_no && matches_img) {
          s = s.replace(
            /!\[(.*?)\]\((.*?)\s*(?:"(.*?)")?\)/g,
            `{% image $2 $3 %}`
          );
        }
        return s;
      });
      data.content = splited_content.join('');
    }
    return data;
}

hexo.extend.filter.register('before_post_render', change_image, 9);

