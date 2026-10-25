(function() {
  'use strict';
  
  // 导航菜单持久化开关，控制台输入 admin 切换显示/隐藏
  var STORAGE_KEY = 'nav_visible';
  
  function isVisible() {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  }
  
  function setVisible(visible) {
    if (visible) {
      localStorage.setItem(STORAGE_KEY, 'true');
      document.body.classList.remove('nav-hidden');
      document.body.classList.add('nav-admin-visible');
    } else {
      localStorage.setItem(STORAGE_KEY, 'false');
      document.body.classList.add('nav-hidden');
      document.body.classList.remove('nav-admin-visible');
    }
  }
  
  // 页面加载时根据 localStorage 决定初始状态
  document.addEventListener('DOMContentLoaded', function() {
    setVisible(isVisible());
  });
  
  Object.defineProperty(window, 'admin', {
    get: function() {
      var visible = isVisible();
      if (visible) {
        setVisible(false);
        console.log(
          '%c 🔒 导航菜单已隐藏 %c | 输入 admin 重新显示',
          'color: #e74c3c; font-size: 14px; font-weight: bold;',
          'color: #888; font-size: 12px;'
        );
        return '导航菜单已隐藏';
      } else {
        setVisible(true);
        console.log(
          '%c 🎮 导航菜单已显示 %c | 输入 admin 隐藏',
          'color: #2ecc71; font-size: 14px; font-weight: bold;',
          'color: #888; font-size: 12px;'
        );
        return '导航菜单已显示';
      }
    },
    set: function(v) {
      setVisible(!!v);
    },
    configurable: true
  });
  
})();
