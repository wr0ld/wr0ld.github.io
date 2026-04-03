const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

hexo.extend.helper.register('css_version', function() {
  const cssPath = path.join(hexo.theme_dir, 'source', this.theme.stellar.main_css);
  try {
    const cssContent = fs.readFileSync(cssPath);
    return crypto.createHash('md5').update(cssContent).digest('hex').slice(0, 8);
  } catch(e) {
    return '1.0.0';
  }
});
