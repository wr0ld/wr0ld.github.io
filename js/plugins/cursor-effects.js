(function() {
  'use strict';
  
  var CursorEffects = {
    cursorOuter: null,
    cursorInner: null,
    mouseX: 0,
    mouseY: 0,
    cursorX: 0,
    cursorY: 0,
    isMoving: false,
    moveTimer: null,
    trailCanvas: null,
    trailCtx: null,
    trailPoints: [],
    particles: [],
    colors: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#1dd1a1'],
    
    init: function() {
      this.createCursorElements();
      this.createTrailCanvas();
      this.bindEvents();
      this.animate();
    },
    
    createCursorElements: function() {
      var style = document.createElement('style');
      style.textContent = '\
        * { cursor: none !important; }\
        \
        .cursor-outer {\
          position: fixed;\
          width: 40px;\
          height: 40px;\
          border: 2px solid rgba(52, 152, 219, 0.8);\
          border-radius: 50%;\
          pointer-events: none;\
          z-index: 99999;\
          transition: transform 0.15s ease-out, width 0.2s, height 0.2s, border-color 0.2s;\
          transform: translate(-50%, -50%);\
        }\
        \
        .cursor-inner {\
          position: fixed;\
          width: 8px;\
          height: 8px;\
          background: radial-gradient(circle, #fff 0%, #3498db 50%, #2980b9 100%);\
          border-radius: 50%;\
          pointer-events: none;\
          z-index: 99999;\
          transform: translate(-50%, -50%);\
          box-shadow: 0 0 10px rgba(52, 152, 219, 0.8), 0 0 20px rgba(52, 152, 219, 0.4);\
        }\
        \
        .cursor-outer.hover {\
          width: 60px;\
          height: 60px;\
          border-color: rgba(231, 76, 60, 0.8);\
          background: rgba(231, 76, 60, 0.1);\
        }\
        \
        .cursor-outer.clicking {\
          transform: translate(-50%, -50%) scale(0.8);\
          border-color: rgba(46, 204, 113, 0.8);\
        }\
        \
        .cursor-trail-canvas {\
          position: fixed;\
          top: 0;\
          left: 0;\
          width: 100%;\
          height: 100%;\
          pointer-events: none;\
          z-index: 99998;\
        }\
        \
        .click-particle {\
          position: fixed;\
          pointer-events: none;\
          z-index: 99997;\
          border-radius: 50%;\
        }\
        \
        @keyframes particleExplode {\
          0% {\
            transform: translate(-50%, -50%) scale(1);\
            opacity: 1;\
          }\
          100% {\
            transform: translate(-50%, -50%) scale(0);\
            opacity: 0;\
          }\
        }\
      ';
      document.head.appendChild(style);
      
      this.cursorOuter = document.createElement('div');
      this.cursorOuter.className = 'cursor-outer';
      document.body.appendChild(this.cursorOuter);
      
      this.cursorInner = document.createElement('div');
      this.cursorInner.className = 'cursor-inner';
      document.body.appendChild(this.cursorInner);
    },
    
    createTrailCanvas: function() {
      this.trailCanvas = document.createElement('canvas');
      this.trailCanvas.className = 'cursor-trail-canvas';
      this.trailCanvas.width = window.innerWidth;
      this.trailCanvas.height = window.innerHeight;
      document.body.appendChild(this.trailCanvas);
      this.trailCtx = this.trailCanvas.getContext('2d');
    },
    
    bindEvents: function() {
      var self = this;
      
      document.addEventListener('mousemove', function(e) {
        self.mouseX = e.clientX;
        self.mouseY = e.clientY;
        self.isMoving = true;
        
        clearTimeout(self.moveTimer);
        self.moveTimer = setTimeout(function() {
          self.isMoving = false;
        }, 100);
        
        self.trailPoints.push({
          x: e.clientX,
          y: e.clientY,
          color: self.colors[Math.floor(Math.random() * self.colors.length)],
          size: Math.random() * 3 + 2,
          life: 1
        });
        
        if (self.trailPoints.length > 50) {
          self.trailPoints.shift();
        }
      });
      
      document.addEventListener('mousedown', function(e) {
        self.cursorOuter.classList.add('clicking');
        self.createClickParticles(e.clientX, e.clientY);
      });
      
      document.addEventListener('mouseup', function() {
        self.cursorOuter.classList.remove('clicking');
      });
      
      var hoverElements = document.querySelectorAll('a, button, input, textarea, select, .post-card, .nav-item, [role="button"]');
      hoverElements.forEach(function(el) {
        el.addEventListener('mouseenter', function() {
          self.cursorOuter.classList.add('hover');
        });
        el.addEventListener('mouseleave', function() {
          self.cursorOuter.classList.remove('hover');
        });
      });
      
      document.addEventListener('mouseover', function(e) {
        if (e.target.matches('a, button, input, textarea, select, .post-card, .nav-item, [role="button"]')) {
          self.cursorOuter.classList.add('hover');
        }
      });
      
      document.addEventListener('mouseout', function(e) {
        if (e.target.matches('a, button, input, textarea, select, .post-card, .nav-item, [role="button"]')) {
          self.cursorOuter.classList.remove('hover');
        }
      });
      
      window.addEventListener('resize', function() {
        self.trailCanvas.width = window.innerWidth;
        self.trailCanvas.height = window.innerHeight;
      });
    },
    
    createClickParticles: function(x, y) {
      var particleCount = 12;
      
      for (var i = 0; i < particleCount; i++) {
        var particle = document.createElement('div');
        particle.className = 'click-particle';
        
        var angle = (Math.PI * 2 / particleCount) * i;
        var velocity = 50 + Math.random() * 50;
        var size = 4 + Math.random() * 6;
        var color = this.colors[Math.floor(Math.random() * this.colors.length)];
        
        particle.style.cssText = '\
          left: ' + x + 'px;\
          top: ' + y + 'px;\
          width: ' + size + 'px;\
          height: ' + size + 'px;\
          background: ' + color + ';\
          box-shadow: 0 0 ' + (size * 2) + 'px ' + color + ';\
        ';
        
        document.body.appendChild(particle);
        
        var targetX = x + Math.cos(angle) * velocity;
        var targetY = y + Math.sin(angle) * velocity;
        
        this.animateParticle(particle, x, y, targetX, targetY, 500);
      }
      
      for (var j = 0; j < 8; j++) {
        var spark = document.createElement('div');
        spark.className = 'click-particle';
        
        var sparkAngle = Math.random() * Math.PI * 2;
        var sparkVelocity = 20 + Math.random() * 30;
        var sparkSize = 2 + Math.random() * 3;
        var sparkColor = '#fff';
        
        spark.style.cssText = '\
          left: ' + x + 'px;\
          top: ' + y + 'px;\
          width: ' + sparkSize + 'px;\
          height: ' + sparkSize + 'px;\
          background: ' + sparkColor + ';\
          box-shadow: 0 0 ' + (sparkSize * 3) + 'px ' + sparkColor + ';\
        ';
        
        document.body.appendChild(spark);
        
        var sparkTargetX = x + Math.cos(sparkAngle) * sparkVelocity;
        var sparkTargetY = y + Math.sin(sparkAngle) * sparkVelocity;
        
        this.animateParticle(spark, x, y, sparkTargetX, sparkTargetY, 300);
      }
    },
    
    animateParticle: function(particle, startX, startY, endX, endY, duration) {
      var startTime = performance.now();
      var self = this;
      
      function animate(currentTime) {
        var elapsed = currentTime - startTime;
        var progress = Math.min(elapsed / duration, 1);
        
        var easeOut = 1 - Math.pow(1 - progress, 3);
        
        var currentX = startX + (endX - startX) * easeOut;
        var currentY = startY + (endY - startY) * easeOut;
        
        particle.style.left = currentX + 'px';
        particle.style.top = currentY + 'px';
        particle.style.opacity = 1 - progress;
        particle.style.transform = 'translate(-50%, -50%) scale(' + (1 - progress * 0.5) + ')';
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          particle.remove();
        }
      }
      
      requestAnimationFrame(animate);
    },
    
    animate: function() {
      var self = this;
      
      this.cursorX += (this.mouseX - this.cursorX) * 0.15;
      this.cursorY += (this.mouseY - this.cursorY) * 0.15;
      
      this.cursorInner.style.left = this.mouseX + 'px';
      this.cursorInner.style.top = this.mouseY + 'px';
      
      this.cursorOuter.style.left = this.cursorX + 'px';
      this.cursorOuter.style.top = this.cursorY + 'px';
      
      this.trailCtx.clearRect(0, 0, this.trailCanvas.width, this.trailCanvas.height);
      
      for (var i = this.trailPoints.length - 1; i >= 0; i--) {
        var point = this.trailPoints[i];
        point.life -= 0.02;
        
        if (point.life <= 0) {
          this.trailPoints.splice(i, 1);
          continue;
        }
        
        this.trailCtx.beginPath();
        this.trailCtx.arc(point.x, point.y, point.size * point.life, 0, Math.PI * 2);
        this.trailCtx.fillStyle = point.color;
        this.trailCtx.globalAlpha = point.life * 0.6;
        this.trailCtx.fill();
        
        if (i > 0) {
          var prevPoint = this.trailPoints[i - 1];
          this.trailCtx.beginPath();
          this.trailCtx.moveTo(point.x, point.y);
          this.trailCtx.lineTo(prevPoint.x, prevPoint.y);
          this.trailCtx.strokeStyle = point.color;
          this.trailCtx.lineWidth = point.size * point.life * 0.5;
          this.trailCtx.globalAlpha = point.life * 0.3;
          this.trailCtx.stroke();
        }
      }
      
      this.trailCtx.globalAlpha = 1;
      
      requestAnimationFrame(function() {
        self.animate();
      });
    }
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      CursorEffects.init();
    });
  } else {
    CursorEffects.init();
  }
  
  window.CursorEffects = CursorEffects;
})();
