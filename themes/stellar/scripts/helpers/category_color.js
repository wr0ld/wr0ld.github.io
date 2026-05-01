'use strict';

hexo.extend.helper.register('category_color', function(cat){
  const { config } = hexo.theme
  const color = config.article.category_color[cat]
  if (color) {
    var textColor = color
    if (color.startsWith('#')) {
      textColor = color
    } else {
      textColor = '#' + color
    }
    var bgColor = textColor
    if (textColor.length == (1+3)) { // #fff
      bgColor += '2'
    } else if (textColor.length == (1+6)) { // #ffffff
      bgColor += '20'
    }
    // 只设置背景色变量，文字固定为灰色
    return ` style="color:rgba(160,165,180,0.85)!important;--theme-block:${bgColor}"`;
  }
  return ' style="color:rgba(160,165,180,0.85)"'
})
