/* 音乐播放器（APlayer 本地化，主题配色）
   数据：localStorage.musicPlaylist = [{name, artist, url, cover}]
   开关：localStorage.musicPlayerEnabled = 'true' | 'false'  */
(function () {
  'use strict';

  var KEY_LIST = 'musicPlaylist';
  var KEY_ON = 'musicPlayerEnabled';
  var container = null;
  var player = null;

  function readList() {
    try { return JSON.parse(localStorage.getItem(KEY_LIST) || '[]') || []; } catch (e) { return []; }
  }
  function saveList(list) {
    try { localStorage.setItem(KEY_LIST, JSON.stringify(list)); } catch (e) {}
  }
  function isOn() {
    var v = null;
    try { v = localStorage.getItem(KEY_ON); } catch (e) {}
    if (v === 'false') return false;
    if (v === 'true') return true;
    return readList().length > 0;
  }
  function ink() {
    var c = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
    return c || '#15171A';
  }

  function ensureCss() {
    if (document.getElementById('aplayer-css')) return;
    var link = document.createElement('link');
    link.id = 'aplayer-css';
    link.rel = 'stylesheet';
    link.href = '/vendor/aplayer/APlayer.min.css';
    document.head.appendChild(link);
  }

  function ensureLib(done) {
    if (window.APlayer) return done();
    if (document.getElementById('aplayer-js')) return;
    var s = document.createElement('script');
    s.id = 'aplayer-js';
    s.src = '/vendor/aplayer/APlayer.min.js';
    s.onload = done;
    document.head.appendChild(s);
  }

  function build() {
    if (player || !isOn() || !readList().length) return;
    ensureCss();
    ensureLib(function () {
      if (player) return;
      container = document.createElement('div');
      container.id = 'music-player';
      container.innerHTML = '<div id="aplayer"></div>';
      document.body.appendChild(container);
      var vol = parseInt(localStorage.getItem('musicVolume') || '60', 10) / 100;
      player = new window.APlayer({
        container: document.getElementById('aplayer'),
        fixed: false,
        autoplay: false,
        theme: ink(),
        loop: 'all',
        order: 'list',
        preload: 'none',
        volume: vol > 1 ? 1 : vol,
        mutex: true,
        listFolded: true,
        listMaxHeight: '260px',
        lrcType: 0,
        audio: readList()
      });
      player.on('volumechange', function () {
        try { localStorage.setItem('musicVolume', String(Math.round(player.volume * 100))); } catch (e) {}
      });
    });
  }

  function destroy() {
    if (container && container.parentNode) container.parentNode.removeChild(container);
    container = null;
    player = null;
  }

  window.MusicPlayer = {
    add: function (song) {
      if (!song || !song.url) return false;
      var list = readList();
      list.push({
        name: song.name || '\u672a\u547d\u540d',
        artist: song.artist || '\u672a\u77e5',
        url: song.url,
        cover: song.cover || ''
      });
      saveList(list);
      if (player) { destroy(); build(); }
      return true;
    },
    list: readList,
    clear: function () { saveList([]); destroy(); },
    setEnabled: function (on) {
      try { localStorage.setItem(KEY_ON, on ? 'true' : 'false'); } catch (e) {}
      if (on) build(); else destroy();
    },
    isOn: isOn,
    refresh: function () { destroy(); build(); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
