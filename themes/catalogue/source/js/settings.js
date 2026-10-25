(function () {
  var root = document.documentElement;
  var KEY_T = 'ui-theme';
  var KEY_F = 'ui-fs';
  var mq = window.matchMedia('(prefers-color-scheme: dark)');

  function currentMode() {
    var t = null;
    try { t = localStorage.getItem(KEY_T); } catch (e) {}
    return t || 'light';
  }

  function applyMode(mode) {
    try { localStorage.setItem(KEY_T, mode); } catch (e) {}
    var dark = mode === 'dark' || (mode === 'system' && mq.matches);
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    sync('mode', mode);
  }

  function applyFs(val) {
    if (val === 'm') { root.removeAttribute('data-fs'); } else { root.setAttribute('data-fs', val); }
    try { localStorage.setItem(KEY_F, val); } catch (e) {}
    sync('fs', val);
  }

  function sync(kind, val) {
    var attr = kind === 'mode' ? 'data-mode' : 'data-fs-val';
    [].slice.call(document.querySelectorAll('.set-opts button')).forEach(function (b) {
      if (b.hasAttribute(attr)) b.classList.toggle('on', b.getAttribute(attr) === val);
    });
  }

  mq.addEventListener('change', function () {
    if (currentMode() === 'system') applyMode('system');
  });

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.set-opts button');
    if (!btn) return;
    if (btn.hasAttribute('data-mode')) applyMode(btn.getAttribute('data-mode'));
    if (btn.hasAttribute('data-fs-val')) applyFs(btn.getAttribute('data-fs-val'));
    if (btn.id === 'resetPrefs') {
      try { localStorage.removeItem(KEY_T); localStorage.removeItem(KEY_F); localStorage.removeItem('ui-theme'); } catch (err) {}
      applyMode('light'); applyFs('m');
      btn.textContent = '已清空';
      setTimeout(function () { btn.textContent = '清空本地偏好'; }, 1600);
    }
  });

  var fs = 'm';
  try { fs = localStorage.getItem(KEY_F) || 'm'; } catch (e) {}
  sync('mode', currentMode());
  sync('fs', fs);

  /* 文章统计 */
  var box = document.getElementById('setRank');
  if (box) {
    fetch('/api/articles_stats.json')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var posts = Array.isArray(d) ? d : (d.posts || []);
        if (!Array.isArray(posts)) posts = [];
        function top(key, n) {
          return posts.slice().sort(function (a, b) { return (b[key] || 0) - (a[key] || 0); }).slice(0, n);
        }
        function rows(arr, key, unit) {
          return arr.map(function (p) {
            return '<li><a href="' + (p.link || ('/' + p.path) || '#') + '"><span class="rk-t">' + p.title +
              '</span><span class="rk-d">' + (p[key] || 0) + ' ' + unit + '</span></a></li>';
          }).join('');
        }
        box.innerHTML =
          '<div class="rk-col"><h3>字数最多</h3><ul>' + rows(top('words', 5), 'words', '字') + '</ul></div>' +
          '<div class="rk-col"><h3>图片最多</h3><ul>' + rows(top('images', 5), 'images', '张') + '</ul></div>';
      })
      .catch(function () { box.textContent = '统计数据暂时不可用'; });
  }
})();
