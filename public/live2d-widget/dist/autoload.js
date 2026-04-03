/*!
 * Live2D Widget - Local Version
 */

const live2d_path = '/live2d-widget/dist/';

function loadExternalResource(url, type) {
  return new Promise((resolve, reject) => {
    let tag;

    if (type === 'css') {
      tag = document.createElement('link');
      tag.rel = 'stylesheet';
      tag.href = url;
    }
    else if (type === 'js') {
      tag = document.createElement('script');
      tag.type = 'module';
      tag.src = url;
    }
    if (tag) {
      tag.onload = () => resolve(url);
      tag.onerror = () => reject(url);
      document.head.appendChild(tag);
    }
  });
}

(async () => {
  var showWaifu = localStorage.getItem('waifu_show');
  if (showWaifu !== 'true') {
    console.log('Live2D: 看板娘默认禁用，请在设置中开启');
    var style = document.createElement('style');
    style.innerHTML = '#waifu { display: none !important; } #waifu-toggle { display: flex !important; }';
    document.head.appendChild(style);
    return;
  }

  const OriginalImage = window.Image;
  window.Image = function(...args) {
    const img = new OriginalImage(...args);
    img.crossOrigin = "anonymous";
    return img;
  };
  window.Image.prototype = OriginalImage.prototype;

  await Promise.all([
    loadExternalResource(live2d_path + 'waifu.css', 'css'),
    loadExternalResource(live2d_path + 'waifu-tips.js', 'js')
  ]);

  initWidget({
    waifuPath: live2d_path + 'waifu-tips.json',
    cdnPath: 'https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/',
    cubism2Path: live2d_path + 'live2d.min.js',
    cubism5Path: 'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js',
    tools: ['hitokoto', 'asteroids', 'switch-model', 'switch-texture', 'photo', 'info', 'quit'],
    logLevel: 'error',
    drag: false,
  });
  
  setTimeout(function() {
    var waifu = document.getElementById('waifu');
    if (waifu) {
      var show = localStorage.getItem('waifu_show');
      if (show === 'false') {
        waifu.classList.add('waifu-hidden');
        waifu.classList.remove('waifu-active');
        waifu.style.display = 'none';
        waifu.style.setProperty('display', 'none', 'important');
      } else {
        waifu.classList.add('waifu-active');
        waifu.classList.remove('waifu-hidden');
        waifu.style.display = '';
      }
    }
  }, 500);
})();

window.addEventListener('storage', function(e) {
  if (e.key === 'waifu_show') {
    var waifu = document.getElementById('waifu');
    if (waifu) {
      if (e.newValue === 'false') {
        waifu.classList.add('waifu-hidden');
        waifu.classList.remove('waifu-active');
        waifu.style.display = 'none';
        waifu.style.setProperty('display', 'none', 'important');
      } else {
        waifu.classList.remove('waifu-hidden');
        waifu.classList.add('waifu-active');
        waifu.style.display = '';
      }
    }
  }
});

window.addEventListener('error', function(e) {
  if (e.message && (e.message.includes('hitTest') || e.message.includes('Cannot read properties of null'))) {
    e.preventDefault();
    return false;
  }
}, true);

console.log('\n%cLive2D%cWidget%c - Local Version\n', 'padding: 8px; background: #cd3e45; font-weight: bold; font-size: large; color: white;', 'padding: 8px; background: #ff5450; font-size: large; color: #eee;', '');

window.switchWaifuModel = function(modelId, textureId) {
  var currentModelId = parseInt(localStorage.getItem('modelId')) || 0;
  var currentTextureId = parseInt(localStorage.getItem('modelTexturesId')) || 0;
  
  if (currentModelId === modelId && currentTextureId === (textureId || 0)) {
    return false;
  }
  
  localStorage.setItem('modelId', modelId);
  localStorage.setItem('modelTexturesId', textureId || 0);
  
  var canvas = document.getElementById('live2d');
  if (canvas) {
    canvas.style.opacity = '0.3';
    canvas.style.transition = 'opacity 0.3s';
  }
  
  setTimeout(function() {
    location.reload();
  }, 300);
  
  return true;
};
