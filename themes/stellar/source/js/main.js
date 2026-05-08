// utils
const util = {

  // https://github.com/jerryc127/hexo-theme-butterfly
  diffDate: (d, more = false) => {
    const dateNow = new Date()
    const datePost = new Date(d)
    const dateDiff = dateNow.getTime() - datePost.getTime()
    const minute = 1000 * 60
    const hour = minute * 60
    const day = hour * 24

    let result
    if (more) {
      const dayCount = dateDiff / day
      const hourCount = dateDiff / hour
      const minuteCount = dateDiff / minute

      if (dayCount > 14) {
        result = null
      } else if (dayCount >= 1) {
        result = parseInt(dayCount) + ' ' + ctx.date_suffix.day
      } else if (hourCount >= 1) {
        result = parseInt(hourCount) + ' ' + ctx.date_suffix.hour
      } else if (minuteCount >= 1) {
        result = parseInt(minuteCount) + ' ' + ctx.date_suffix.min
      } else {
        result = ctx.date_suffix.just
      }
    } else {
      result = parseInt(dateDiff / day)
    }
    return result
  },

  copy: (id, msg) => {
    const el = document.getElementById(id);
    if (el) {
      el.select();
      document.execCommand("Copy");
      if (msg && msg.length > 0) {
        hud.toast(msg, 2500);
      }
    }
  },

  toggle: (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.toggle("display");
    }
  },

  scrollTop: () => {
    window.scrollTo({top: 0, behavior: "smooth"});
  },

  scrollComment: () => {
    document.getElementById('comments').scrollIntoView({behavior: "smooth"});
  },

  viewportLazyload: (target, func, enabled = true) => {
    if (!enabled || !("IntersectionObserver" in window)) {
      func();
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].intersectionRatio > 0) {
        func();
        observer.disconnect();
      }
    });
    observer.observe(target);
  }
}

const hud = {
  toast: (msg, duration) => {
    const d = Number(isNaN(duration) ? 2000 : duration);
    var el = document.createElement('div');
    el.classList.add('toast');
    el.classList.add('show');
    el.innerHTML = msg;
    document.body.appendChild(el);

    setTimeout(function(){ document.body.removeChild(el) }, d);
    
  },

}

// defines


const init = {
  toc: () => {
    utils.jq(() => {
      const scrollOffset = 32;
      var segs = [];
      $("article.md-text :header").each(function (idx, node) {
        segs.push(node);
      });
      function activeTOC() {
        var scrollTop = $(this).scrollTop();
        var topSeg = null;
        for (var idx in segs) {
          var seg = $(segs[idx]);
          if (seg.offset().top > scrollTop + scrollOffset) {
            continue;
          }
          if (!topSeg) {
            topSeg = seg;
          } else if (seg.offset().top >= topSeg.offset().top) {
            topSeg = seg;
          }
        }
        if (topSeg) {
          $("#data-toc a.toc-link").removeClass("active");
          var link = "#" + topSeg.attr("id");
          if (link != '#undefined') {
            const highlightItem = $('#data-toc a.toc-link[href="' + encodeURI(link) + '"]');
            if (highlightItem.length > 0) {
              highlightItem.addClass("active");
            }
          } else {
            $('#data-toc a.toc-link:first').addClass("active");
          }
        }
      }
      function scrollTOC() {
        const e0 = document.querySelector('#data-toc .toc');
        const e1 = document.querySelector('#data-toc .toc a.toc-link.active');
        if (e0 == null || e1 == null) {
          return;
        }
        const offsetBottom = e1.getBoundingClientRect().bottom - e0.getBoundingClientRect().bottom + 100;
        const offsetTop = e1.getBoundingClientRect().top - e0.getBoundingClientRect().top - 64;
        if (offsetTop < 0) {
          e0.scrollBy({top: offsetTop, behavior: "smooth"});
        } else if (offsetBottom > 0) {
          e0.scrollBy({top: offsetBottom, behavior: "smooth"});
        }
      }
      
      var ticking = false;
      var timeout = null;
      window.addEventListener('scroll', function() {
        if (!ticking) {
          requestAnimationFrame(function() {
            activeTOC();
            ticking = false;
          });
          ticking = true;
        }
        if(timeout !== null) clearTimeout(timeout);
        timeout = setTimeout(function() {
          scrollTOC();
        }.bind(this), 100);
      }, { passive: true });      
    })
  },
  sidebar: () => {
    utils.jq(() => {
      $("#data-toc a.toc-link").click(function (e) {
        sidebar.dismiss();
      });
    })
  },
  relativeDate: (selector) => {
    selector.forEach(item => {
      const $this = item
      const timeVal = $this.getAttribute('datetime')
      let relativeValue = util.diffDate(timeVal, true)
      if (relativeValue) {
        $this.innerText = relativeValue
      }
    })
  },
  /**
   * Tabs tag listener (without twitter bootstrap).
   */
  registerTabsTag: function () {
    // Binding `nav-tabs` & `tab-content` by real time permalink changing.
    document.querySelectorAll('.tabs .nav-tabs .tab').forEach(element => {
      element.addEventListener('click', event => {
        event.preventDefault();
        // Prevent selected tab to select again.
        if (element.classList.contains('active')) return;
        // Add & Remove active class on `nav-tabs` & `tab-content`.
        [...element.parentNode.children].forEach(target => {
          target.classList.toggle('active', target === element);
        });
        // https://stackoverflow.com/questions/20306204/using-queryselector-with-ids-that-are-numbers
        const tActive = document.getElementById(element.querySelector('a').getAttribute('href').replace('#', ''));
        [...tActive.parentNode.children].forEach(target => {
          target.classList.toggle('active', target === tActive);
        });
        // Trigger event
        tActive.dispatchEvent(new Event('tabs:click', {
          bubbles: true
        }));
      });
    });

    window.dispatchEvent(new Event('tabs:register'));
  },

  canonicalCheck: () => {
    const canonical = window.canonical;
    function showTip(isOfficial = false) {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, nofollow';
      document.head.appendChild(meta);
      const notice = document.createElement('div');
      const originalURL = `https://${canonical.originalHost}`;
      if (isOfficial) {
        notice.className = 'canonical-tip official';
        notice.innerHTML = `
        <a href="${originalURL}" target="_self" rel="noopener noreferrer">
        本站为官方备用站，仅供应急。主站：${originalURL}
        </a>
        `;
      } else {
        notice.className = 'canonical-tip unofficial';
        notice.innerHTML = `
        <a href="${originalURL}" target="_self" rel="noopener noreferrer">
        <div class="headline icon">☠️</div>
        本站为非法克隆站，请前往官方源站访问。<br>
        源站：${originalURL}
        </a>
        `;
      }
      document.body.appendChild(notice);
    }
    if (!canonical.originalHost) return;
    const currentURL = new URL(window.location.href);
    const currentHost = currentURL.hostname.replace(/^www\./, '');
    if (currentHost == 'localhost') return;
    const encodedCurrentHost = window.btoa(currentHost);
    const isCurrentHostValid = canonical.encoded === encodedCurrentHost;
    const canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      if (isCurrentHostValid) {
        return;
      }
      if (canonical.officialHosts?.includes(currentHost)) {
        showTip(true);
        return;
      }
      showTip(false);
      return;
    }
    const canonicalURL = new URL(canonicalTag.href);
    const canonicalHost = canonicalURL.hostname.replace(/^www\./, '');
    const encodedCanonicalHost = window.btoa(canonicalHost);
    const isCanonicalHostValid = canonical.encoded === encodedCanonicalHost;
    if (isCanonicalHostValid && isCurrentHostValid) {
      return;
    }
    showTip(canonical.officialHosts?.includes(currentHost));
  }

}


// init
init.toc()
init.sidebar()
init.relativeDate(document.querySelectorAll('#post-meta time'))
init.registerTabsTag()
init.canonicalCheck()

// Widget折叠功能
document.addEventListener('DOMContentLoaded', function() {
  const collapsibleWidgets = document.querySelectorAll('.widget-wrapper.collapsible-widget');
  
  collapsibleWidgets.forEach(widget => {
    const header = widget.querySelector('.widget-header');
    
    if (header) {
      header.addEventListener('click', function(e) {
        e.preventDefault();
        widget.classList.toggle('collapsed');
        
        // 保存折叠状态到localStorage
        const widgetId = widget.querySelector('.name')?.textContent || 'widget';
        const isCollapsed = widget.classList.contains('collapsed');
        localStorage.setItem('Stellar.widget.' + widgetId + '.collapsed', isCollapsed);
      });
      
      // 从localStorage恢复折叠状态
      const widgetId = header.querySelector('.name')?.textContent || 'widget';
      const isCollapsed = localStorage.getItem('Stellar.widget.' + widgetId + '.collapsed');
      if (isCollapsed === 'true') {
        widget.classList.add('collapsed');
      }
    }
  });
});

// 阅读进度条 - 蓝紫黑彩虹渐变
(function() {
  const bar = document.querySelector('.reading-progress-bar');
  if (!bar) return;

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (docHeight <= 0) {
      bar.style.width = '0%';
      return;
    }
    const progress = Math.min(scrollTop / docHeight * 100, 100);
    bar.style.width = progress + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();
})();

// 卡片 3D 视差效果
(function() {
  function bindPostCardTilt(root) {
    var cards = (root || document).querySelectorAll('.post-card:not([data-tilt-bound])');
    if (cards.length === 0) return;
    cards.forEach(function(card) {
      card.dataset.tiltBound = 'true';

    card.addEventListener('mouseenter', function() {
      this.dataset.tiltActive = 'true';
    });

    card.addEventListener('mousemove', function(e) {
      if (!this.dataset.tiltActive) return;
      var rect = this.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var centerX = rect.width / 2;
      var centerY = rect.height / 2;
      var list = this.closest('.post-list');
      var isGrid = list && list.classList.contains('grid');
      var isList = list && list.classList.contains('list');
      var maxTilt = isGrid ? 3.2 : (isList ? 1.25 : 1.8);
      var perspective = isGrid ? 2400 : (isList ? 4600 : 3200);
      var lift = isGrid ? -3 : (isList ? -1 : -2);
      var scale = isGrid ? 1.003 : (isList ? 1.0005 : 1.0015);
      var rotateX = (y - centerY) / centerY * -maxTilt;
      var rotateY = (x - centerX) / centerX * maxTilt;
      this.style.setProperty('transition', 'none', 'important');
      this.style.setProperty('transform', 'perspective(' + perspective + 'px) translateY(' + lift + 'px) scale3d(' + scale + ',' + scale + ',' + scale + ') rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)', 'important');
    });

    card.addEventListener('mouseleave', function() {
      delete this.dataset.tiltActive;
      this.style.removeProperty('transition');
      this.style.removeProperty('transform');
    });
  });
  }

  function initPostCardTilt() {
    bindPostCardTilt(document);

    var container = document.querySelector('#post-container') || document.body;
    if (container && window.MutationObserver) {
      var observer = new MutationObserver(function() {
        bindPostCardTilt(container);
      });
      observer.observe(container, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPostCardTilt);
  } else {
    initPostCardTilt();
  }
})();

// 打字机效果
(function() {
  var el = document.querySelector('.welcome-text');
  if (!el) return;
  var text = el.textContent.trim();
  el.textContent = '';
  var cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  cursor.textContent = '_';
  el.appendChild(cursor);
  var i = 0;
  function type() {
    if (i < text.length) {
      cursor.before(document.createTextNode(text.charAt(i)));
      i++;
      setTimeout(type, 80 + Math.random() * 40);
    }
  }
  setTimeout(type, 600);
})();

// 全屏动态背景管理
(function() {
  var canvas, ctx, particles = [], animId, enabled = false;
  
  function initCanvas() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'hacker-bg';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.3;';
    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize, { passive: true });
  }
  
  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  function createParticles() {
    particles = [];
    var count = Math.floor((canvas.width * canvas.height) / 15000);
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 0.3 + Math.random() * 0.5,
        size: 1 + Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.6,
        char: String.fromCharCode(0x30A0 + Math.random() * 96)
      });
    }
  }
  
  function animate() {
    if (!enabled) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '12px monospace';
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.y += p.vy;
      p.x += p.vx;
      if (p.y > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
        p.char = String.fromCharCode(0x30A0 + Math.random() * 96);
      }
      ctx.fillStyle = 'rgba(0, 255, 65, ' + p.alpha + ')';
      ctx.fillText(p.char, p.x, p.y);
    }
    animId = requestAnimationFrame(animate);
  }
  
  window.toggleHackerBg = function(flag) {
    enabled = flag;
    if (flag) {
      initCanvas();
      createParticles();
      animate();
      localStorage.setItem('Stellar.hackerBg', '1');
    } else {
      if (animId) cancelAnimationFrame(animId);
      if (canvas) { canvas.style.display = 'none'; }
      localStorage.setItem('Stellar.hackerBg', '0');
    }
    if (flag && canvas) canvas.style.display = '';
  };
  
  if (localStorage.getItem('Stellar.hackerBg') === '1') {
    window.toggleHackerBg(true);
  }
})();

// Canvas Particle Network 粒子聚合背景
(function() {
  var canvas, ctx, particles = [], animId, enabled = false;
  var mouse = { x: 0, y: 0, active: false };
  var maxDistance = 150;
  var clusterDistance = 190;
  var polygonRadius = 78;

  function initCanvas() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'particle-network-bg';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.55;';
    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onMouseLeave, { passive: true });
  }

  function onResize() {
    resize();
    createParticles();
  }

  function resize() {
    if (!canvas) return;
    var ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }

  function onTouchMove(e) {
    if (!e.touches || !e.touches.length) return;
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
    mouse.active = true;
  }

  function onMouseLeave() {
    mouse.active = false;
  }

  function createParticles() {
    if (!canvas) return;
    particles = [];
    var area = window.innerWidth * window.innerHeight;
    var count = Math.max(50, Math.min(120, Math.floor(area / 14000)));
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        baseX: Math.random() * window.innerWidth,
        baseY: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitRadius: polygonRadius + (Math.random() - 0.5) * 34,
        size: 1.2 + Math.random() * 1.8
      });
    }
  }

  function drawLine(a, b, distance, limit, color) {
    var alpha = 1 - distance / limit;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = color.replace('{alpha}', (alpha * 0.42).toFixed(3));
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function animate() {
    if (!enabled || !ctx || !canvas) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    var time = performance.now();
    var clustered = [];

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -20) p.x = window.innerWidth + 20;
      if (p.x > window.innerWidth + 20) p.x = -20;
      if (p.y < -20) p.y = window.innerHeight + 20;
      if (p.y > window.innerHeight + 20) p.y = -20;

      if (mouse.active) {
        var dx = mouse.x - p.x;
        var dy = mouse.y - p.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < clusterDistance) {
          var angle = p.orbitAngle + time * 0.00022;
          var sides = 7;
          var sector = Math.PI * 2 / sides;
          var snapped = Math.round(angle / sector) * sector;
          var blend = 0.58;
          var polygonAngle = snapped * blend + angle * (1 - blend);
          var radius = p.orbitRadius + Math.sin(time * 0.001 + i) * 10;
          var targetX = mouse.x + Math.cos(polygonAngle) * radius;
          var targetY = mouse.y + Math.sin(polygonAngle) * radius;
          var tx = targetX - p.x;
          var ty = targetY - p.y;
          var targetDist = Math.sqrt(tx * tx + ty * ty) || 1;
          var force = (1 - dist / clusterDistance) * 0.08;
          p.vx += tx / targetDist * force;
          p.vy += ty / targetDist * force;
          p.vx += -Math.sin(polygonAngle) * 0.006;
          p.vy += Math.cos(polygonAngle) * 0.006;
          clustered.push({ particle: p, angle: polygonAngle });
        }
      }

      p.vx *= 0.985;
      p.vy *= 0.985;
      p.vx += (Math.random() - 0.5) * 0.015;
      p.vy += (Math.random() - 0.5) * 0.015;
      p.vx = Math.max(-1.2, Math.min(1.2, p.vx));
      p.vy = Math.max(-1.2, Math.min(1.2, p.vy));
    }

    if (clustered.length > 2) {
      clustered.sort(function(a, b) { return a.angle - b.angle; });
      ctx.beginPath();
      for (var n = 0; n < clustered.length; n++) {
        var node = clustered[n].particle;
        if (n === 0) {
          ctx.moveTo(node.x, node.y);
        } else {
          ctx.lineTo(node.x, node.y);
        }
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(147, 112, 255, 0.18)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    for (var j = 0; j < particles.length; j++) {
      var a = particles[j];
      for (var k = j + 1; k < particles.length; k++) {
        var b = particles[k];
        var lx = a.x - b.x;
        var ly = a.y - b.y;
        var lineDistance = Math.sqrt(lx * lx + ly * ly);
        if (lineDistance < maxDistance) {
          drawLine(a, b, lineDistance, maxDistance, 'rgba(80, 220, 255, {alpha})');
        }
      }

      var glow = mouse.active ? 'rgba(147, 112, 255, 0.75)' : 'rgba(80, 220, 255, 0.75)';
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.shadowBlur = 10;
      ctx.shadowColor = glow;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    animId = requestAnimationFrame(animate);
  }

  window.toggleParticleNetworkBg = function(flag) {
    enabled = flag;
    if (flag) {
      initCanvas();
      createParticles();
      if (animId) cancelAnimationFrame(animId);
      canvas.style.display = '';
      animate();
      localStorage.setItem('Stellar.particleNetworkBg', '1');
    } else {
      if (animId) cancelAnimationFrame(animId);
      animId = null;
      if (canvas) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        canvas.style.display = 'none';
      }
      localStorage.setItem('Stellar.particleNetworkBg', '0');
    }
  };

  if (localStorage.getItem('Stellar.particleNetworkBg') === '1') {
    window.toggleParticleNetworkBg(true);
  }
})();
