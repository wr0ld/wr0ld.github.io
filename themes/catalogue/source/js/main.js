/* 目录式主题 · 交互脚本（无依赖） */
(function () {
  'use strict';

  var rootPath = (function () {
    var s = document.currentScript || document.querySelector('script[src*="main.js"]');
    var src = s ? s.getAttribute('src') : '';
    return src.replace(/js\/main\.js.*$/, '');
  })();

  /* ---------- 阅读进度 ---------- */
  var bar = document.getElementById('progress');
  var article = document.getElementById('article');
  if (bar && article) {
    var onScroll = function () {
      var rect = article.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      var done = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1;
      bar.style.width = (done * 100).toFixed(2) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  /* ---------- 目录高亮 ---------- */
  var toc = document.getElementById('toc');
  if (toc && article) {
    var links = [].slice.call(toc.querySelectorAll('a[href^="#"]'));
    var map = {};
    links.forEach(function (a) {
      var id = decodeURIComponent(a.getAttribute('href').slice(1));
      var el = document.getElementById(id);
      if (el) map[id] = { el: el, a: a };
    });
    var ids = Object.keys(map);
    if (ids.length) {
      var spy = function () {
        var y = window.scrollY + 120;
        var cur = ids[0];
        ids.forEach(function (id) {
          if (map[id].el.offsetTop <= y) cur = id;
        });
        links.forEach(function (a) { a.classList.remove('on'); });
        if (map[cur]) map[cur].a.classList.add('on');
      };
      window.addEventListener('scroll', spy, { passive: true });
      spy();
    }
  }

  /* ---------- 代码复制 ---------- */
  [].forEach.call(document.querySelectorAll('article figure.highlight, article pre'), function (block) {
    var code = block.querySelector('td.code pre, pre');
    if (!code) return;
    var btn = document.createElement('button');
    btn.className = 'copy-code';
    btn.type = 'button';
    btn.textContent = '复制';
    btn.addEventListener('click', function () {
      var text = code.innerText;
      var done = function () { btn.textContent = '已复制'; setTimeout(function () { btn.textContent = '复制'; }, 1400); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
      else {
        var ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
    if (getComputedStyle(block).position === 'static') block.style.position = 'relative';
    block.appendChild(btn);
  });

  /* ---------- 图片放大 ---------- */
  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = '<img alt="">';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('img');
  document.addEventListener('click', function (e) {
    var img = e.target.closest ? e.target.closest('article figure.img img, article p img') : null;
    if (img) {
      lbImg.src = img.currentSrc || img.src;
      lb.classList.add('open');
      e.preventDefault();
      return;
    }
    if (lb.classList.contains('open')) {
      lb.classList.remove('open');
      lbImg.removeAttribute('src');
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { lb.classList.remove('open'); lbImg.removeAttribute('src'); }
  });


  /* ---------- 图片加载失败兜底 ---------- */
  [].forEach.call(document.querySelectorAll('article img'), function (img) {
    img.addEventListener('error', function () {
      if (img.dataset.failed) return;
      img.dataset.failed = '1';
      var fig = img.closest('figure.img');
      var msg = document.createElement('div');
      msg.className = 'img-fail';
      msg.textContent = (img.getAttribute('alt') || '图片') + '（加载失败）';
      if (fig) { img.replaceWith(msg); } else { img.classList.add('broken'); img.after(msg); }
    });
  });

  /* ---------- 搜索 ---------- */
  var input = document.getElementById('searchInput');
  var res = document.getElementById('searchRes');
  var dataPromise = null;
  var data = [];
  var active = -1;

  function loadData() {
    if (!dataPromise) {
      dataPromise = fetch(rootPath + 'search.json')
        .then(function (r) { return r.json(); })
        .then(function (list) { data = list || []; return data; })
        .catch(function () { data = []; return data; });
    }
    return dataPromise;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function closeFind() {
    if (!res) return;
    res.classList.remove('open');
    active = -1;
  }

  function move(dir) {
    if (!res) return;
    var items = [].slice.call(res.querySelectorAll('a'));
    if (!items.length) return;
    active = (active + dir + items.length) % items.length;
    items.forEach(function (a, i) { a.parentNode.classList.toggle('on', i === active); });
    items[active].scrollIntoView({ block: 'nearest' });
  }

  function render(q) {
    if (!res) return;
    q = (q || '').trim().toLowerCase();
    var list = !q ? data.slice(0, 6) : data.filter(function (p) {
      var hay = (p.title + ' ' + p.date + ' ' + (p.cats || []).join(' ') + ' ' + (p.tags || []).join(' ') + ' ' + p.text).toLowerCase();
      return hay.indexOf(q) !== -1;
    }).slice(0, 8);

    if (!list.length) {
      res.innerHTML = '<li class="none">没有匹配</li>';
      res.classList.add('open');
      return;
    }
    res.innerHTML = list.map(function (p) {
      return '<li><a href="' + rootPath + p.url + '">' +
        '<span class="ft">' + esc(p.title) + '</span>' +
        '<span class="fd">' + esc(p.date) + (p.cats && p.cats.length ? ' · ' + esc(p.cats.join(' / ')) : '') + '</span>' +
        '</a></li>';
    }).join('');
    active = -1;
    res.classList.add('open');
  }

  if (input && res) {
    input.addEventListener('focus', function () {
      loadData().then(function () { render(input.value); });
    });
    input.addEventListener('input', function () {
      loadData().then(function () { render(input.value); });
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter') {
        var items = [].slice.call(res.querySelectorAll('a'));
        var target = items[active] || items[0];
        if (target) window.location.href = target.getAttribute('href');
      } else if (e.key === 'Escape') {
        closeFind();
        input.blur();
      }
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest || !e.target.closest('.find')) closeFind();
    });
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        input.focus();
      }
    });
  }

  /* ---------- 明暗切换 ---------- */
  var toggle = document.getElementById('themeToggle');
  if (toggle) {
    var syncToggle = function () {
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      toggle.textContent = dark ? '\u25d1' : '\u25d0';
      toggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
    };
    toggle.addEventListener('click', function () {
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      var next = dark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('ui-theme', next); } catch (e) {}
      syncToggle();
    });
    syncToggle();
  }

  /* ---------- 键盘：j / k / Enter / ────────── */
  var rows = [].slice.call(document.querySelectorAll('ol.posts a'));
  if (rows.length) {
    var at = -1;
    var mark = function (i) {
      rows.forEach(function (r) { r.classList.remove('kb'); });
      if (i < 0) return;
      rows[i].classList.add('kb');
      rows[i].scrollIntoView({ block: 'nearest' });
    };
    document.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key === 'j') { e.preventDefault(); at = Math.min(rows.length - 1, at + 1); mark(at); }
      else if (e.key === 'k') { e.preventDefault(); at = Math.max(0, at - 1); mark(at); }
      else if (e.key === 'Enter' && at > -1) { rows[at].click(); }
      else if (e.key === '/') { e.preventDefault(); if (search) { openSearch(); } }
    });
  }

  /* ---------- 正文首段：提要 / 首字下沉 ---------- */
  if (article) {
    var firstP = article.querySelector(':scope > p');
    if (firstP) {
      var len = (firstP.textContent || '').trim().length;
      if (len > 140) firstP.classList.add('is-lede');
    }
  }
})();
