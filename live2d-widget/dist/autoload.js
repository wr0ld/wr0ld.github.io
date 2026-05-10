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

// 统一的初始化函数，支持多次调用
var _waifuInitialized = false;
async function initWaifuWidget() {
  if (_waifuInitialized) return;
  _waifuInitialized = true;

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

  // 初始化完成后应用保存的缩放值
  setTimeout(function() {
    var waifu = document.getElementById('waifu');
    if (waifu) {
      var show = localStorage.getItem('waifu_show');
      if (show === 'false') {
        waifu.classList.add('waifu-hidden');
        waifu.classList.remove('waifu-active');
        waifu.style.setProperty('display', 'none', 'important');
      } else {
        waifu.classList.add('waifu-active');
        waifu.classList.remove('waifu-hidden');
        waifu.style.removeProperty('display');
      }
      // 应用保存的缩放值
      var savedZoom = parseInt(localStorage.getItem('waifu_zoom')) || 100;
      if (savedZoom !== 100) {
        waifu.style.setProperty('--waifu-scale', (savedZoom / 100).toString());
      }
    }
  }, 800);
}

(async () => {
  var showWaifu = localStorage.getItem('waifu_show');
  if (showWaifu !== 'true') {
    console.log('Live2D: 看板娘已禁用，可在设置中开启');
    return;
  }
  await initWaifuWidget();
})();

window.addEventListener('storage', function(e) {
  if (e.key === 'waifu_show') {
    var waifu = document.getElementById('waifu');
    if (e.newValue === 'true') {
      if (!waifu) {
        // Widget 尚未加载，动态初始化
        initWaifuWidget();
      } else {
        waifu.classList.remove('waifu-hidden');
        waifu.classList.add('waifu-active');
        waifu.style.removeProperty('display');
        // 应用保存的缩放
        var savedZoom = parseInt(localStorage.getItem('waifu_zoom')) || 100;
        waifu.style.setProperty('--waifu-scale', (savedZoom / 100).toString());
      }
    } else if (e.newValue === 'false') {
      if (waifu) {
        waifu.classList.add('waifu-hidden');
        waifu.classList.remove('waifu-active');
        waifu.style.setProperty('display', 'none', 'important');
      }
    }
  } else if (e.key === 'waifu_zoom') {
    // 实时响应缩放变化
    var waifu = document.getElementById('waifu');
    if (waifu) {
      var zoom = parseInt(e.newValue) || 100;
      waifu.style.setProperty('--waifu-scale', (zoom / 100).toString());
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
