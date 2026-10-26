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
  syncWaifu();
  renderSongs();
  syncMusic();
  syncCtx();
  syncClock();

  /* 看板娘 */
  function waifuState() {
    var v = null;
    try { v = localStorage.getItem('waifu_show'); } catch (e) {}
    return v === 'true';
  }
  function syncWaifu() {
    var on = waifuState();
    [].slice.call(document.querySelectorAll('[data-waifu]')).forEach(function (b) {
      b.classList.toggle('on', (b.getAttribute('data-waifu') === 'on') === on);
    });
  }
  function setWaifu(on) {
    try { localStorage.setItem('waifu_show', on ? 'true' : 'false'); } catch (e) {}
    var w = document.getElementById('waifu');
    if (on) {
      if (w) { w.style.removeProperty('display'); }
      else if (typeof window.initWaifuWidget === 'function') { window.initWaifuWidget(); }
    } else if (w) {
      w.style.setProperty('display', 'none', 'important');
    }
    syncWaifu();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-waifu]');
    if (!b) return;
    setWaifu(b.getAttribute('data-waifu') === 'on');
  });

  /* 音乐播放器 */
  function musicOn() {
    var mp = window.MusicPlayer;
    return mp ? mp.isOn() : false;
  }
  function syncMusic() {
    var on = musicOn();
    [].slice.call(document.querySelectorAll('[data-music]')).forEach(function (b) {
      b.classList.toggle('on', (b.getAttribute('data-music') === 'on') === on);
    });
  }
  function ctxOn() {
    return localStorage.getItem('customContextMenu') === 'true';
  }
  function syncCtx() {
    var on = ctxOn();
    [].slice.call(document.querySelectorAll('[data-ctx]')).forEach(function (b) {
      b.classList.toggle('on', (b.getAttribute('data-ctx') === 'on') === on);
    });
  }
  function setCtx(on) {
    try { localStorage.setItem('customContextMenu', on ? 'true' : 'false'); } catch (e) {}
    var c = window.CustomContextMenu;
    if (c) {
      if (c.loadSettings) c.loadSettings();
      if (!on && c.hideMenu) c.hideMenu();
    }
    syncCtx();
  }

  function clockOn() {
    return localStorage.getItem('timeWidget') === 'true';
  }
  function syncClock() {
    var on = clockOn();
    [].slice.call(document.querySelectorAll('[data-clock]')).forEach(function (b) {
      b.classList.toggle('on', (b.getAttribute('data-clock') === 'on') === on);
    });
  }
  function setClock(on) {
    try { localStorage.setItem('timeWidget', on ? 'true' : 'false'); } catch (e) {}
    var w = document.getElementById('time-widget');
    if (w) w.style.display = on ? 'flex' : 'none';
    syncClock();
  }

  function renderSongs() {
    var ul = document.getElementById('songList');
    if (!ul) return;
    var mp = window.MusicPlayer;
    var list = mp ? mp.list() : [];
    if (!list.length) {
      ul.innerHTML = '<li class="song-empty">还没有歌曲。填上名字和音频直链，点「添加」就会出现在左下角。</li>';
      return;
    }
    ul.innerHTML = list.map(function (s, i) {
      return '<li><span class="song-i">' + (i + 1) + '</span><span class="song-n">' + (s.name || '') +
        '</span><span class="song-a">' + (s.artist || '') + '</span><button type="button" class="song-del" data-i="' + i + '">删除</button></li>';
    }).join('') + '<li class="song-clear"><button type="button" id="songClear">清空全部</button></li>';
  }
  document.addEventListener('click', function (e) {
    if (e.target.id === 'openCards') {
      if (window.CardSystem && window.CardSystem.showPanel) window.CardSystem.showPanel();
      return;
    }
    var kb = e.target.closest && e.target.closest('[data-clock]');
    if (kb) {
      setClock(kb.getAttribute('data-clock') === 'on');
      return;
    }
    var cb = e.target.closest && e.target.closest('[data-ctx]');
    if (cb) {
      setCtx(cb.getAttribute('data-ctx') === 'on');
      return;
    }
    var b = e.target.closest && e.target.closest('[data-music]');
    if (b) {
      var on = b.getAttribute('data-music') === 'on';
      if (window.MusicPlayer) window.MusicPlayer.setEnabled(on);
      syncMusic();
      return;
    }
    if (e.target.id === 'songAdd') {
      var name = document.getElementById('songName');
      var url = document.getElementById('songUrl');
      if (!url.value.trim()) { url.focus(); return; }
      if (!/^https?:\/\//i.test(url.value.trim())) { url.focus(); return; }
      if (window.MusicPlayer) window.MusicPlayer.add({ name: name.value.trim() || url.value.trim().split('/').pop(), url: url.value.trim() });
      name.value = ''; url.value = '';
      renderSongs(); syncMusic();
      return;
    }
    if (e.target.classList && e.target.classList.contains('song-del')) {
      var i = parseInt(e.target.getAttribute('data-i'), 10);
      var mp = window.MusicPlayer;
      if (mp) {
        var list = mp.list();
        list.splice(i, 1);
        try { localStorage.setItem('musicPlaylist', JSON.stringify(list)); } catch (err) {}
        mp.refresh();
      }
      renderSongs(); syncMusic();
      return;
    }
    if (e.target.id === 'songClear') {
      if (window.MusicPlayer) window.MusicPlayer.clear();
      renderSongs(); syncMusic();
    }
  });

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
