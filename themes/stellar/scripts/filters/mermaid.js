'use strict';

hexo.extend.filter.register('after_post_render', function(data) {
  if (!data.content) return data;
  // handle highlight.js wrapped format: wrapped in <figure><table><tr><td><pre><code>...</code></pre></td></tr></table></figure>
  data.content = data.content.replace(/<figure class="highlight [a-z]*">\s*<table>\s*<tr>\s*<td class="code">\s*<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>\s*<\/td>\s*<\/tr>\s*<\/table>\s*<\/figure>/g, function(match, code) {
    var decoded = code.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
    if (decoded.includes('graph ') || decoded.includes('flowchart ') || decoded.includes('sequenceDiagram') || decoded.includes('classDiagram') || decoded.includes('stateDiagram') || decoded.includes('erDiagram') || decoded.includes('gantt') || decoded.includes('pie ') || decoded.includes('gitgraph')) {
      return '<pre class="mermaid">' + decoded.trim() + '</pre>';
    }
    return match;
  });
  return data;
}, 1);
