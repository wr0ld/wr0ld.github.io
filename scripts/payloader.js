const fs = require('fs');
const path = require('path');

hexo.extend.generator.register('payloader', function(locals) {
  const payloaderDir = path.join(hexo.base_dir, '..', '项目', 'Payloader-main', 'dist');
  
  if (!fs.existsSync(payloaderDir)) {
    hexo.log.warn('Payloader dist directory not found:', payloaderDir);
    return [];
  }
  
  const files = [];
  
  function walkDir(dir, baseDir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walkDir(fullPath, baseDir);
      } else {
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        files.push({
          path: 'payloader/' + relativePath,
          data: function() {
            return fs.createReadStream(fullPath);
          }
        });
      }
    }
  }
  
  walkDir(payloaderDir, payloaderDir);
  
  return files;
});
