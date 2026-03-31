(function() {
  'use strict';
  
  var GlitchEffect = {
    enabled: false,
    timer: null,
    glitchInterval: null,
    isGlitching: false,
    idleTime: 60000,
    mouseSpeed: 0,
    lastMouseX: 0,
    lastMouseY: 0,
    lastMouseTime: 0,
    shakeThreshold: 800,
    
    init: function() {
      this.loadSettings();
      if (!this.enabled) return;
      
      this.bindEvents();
      this.startIdleTimer();
    },
    
    loadSettings: function() {
      var saved = localStorage.getItem('glitchEffect');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    },
    
    saveSettings: function() {
      localStorage.setItem('glitchEffect', this.enabled.toString());
    },
    
    toggle: function() {
      this.enabled = !this.enabled;
      this.saveSettings();
      if (!this.enabled) {
        this.stopGlitch();
        this.stopIdleTimer();
      } else {
        this.startIdleTimer();
      }
    },
    
    bindEvents: function() {
      var self = this;
      
      document.addEventListener('mousemove', function(e) {
        var now = Date.now();
        var timeDiff = now - self.lastMouseTime;
        
        if (timeDiff > 0) {
          var dx = e.clientX - self.lastMouseX;
          var dy = e.clientY - self.lastMouseY;
          var distance = Math.sqrt(dx * dx + dy * dy);
          self.mouseSpeed = distance / timeDiff * 1000;
          
          if (self.isGlitching && self.mouseSpeed > self.shakeThreshold) {
            self.stopGlitch();
            self.startIdleTimer();
          }
        }
        
        self.lastMouseX = e.clientX;
        self.lastMouseY = e.clientY;
        self.lastMouseTime = now;
        
        self.resetIdleTimer();
      });
      
      document.addEventListener('click', function() {
        self.resetIdleTimer();
      });
      
      document.addEventListener('keydown', function() {
        self.resetIdleTimer();
      });
      
      document.addEventListener('scroll', function() {
        self.resetIdleTimer();
      });
    },
    
    startIdleTimer: function() {
      var self = this;
      this.stopIdleTimer();
      this.timer = setTimeout(function() {
        if (self.enabled) {
          self.startGlitch();
        }
      }, this.idleTime);
    },
    
    stopIdleTimer: function() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    },
    
    resetIdleTimer: function() {
      if (!this.isGlitching) {
        this.startIdleTimer();
      }
    },
    
    startGlitch: function() {
      var self = this;
      this.isGlitching = true;
      document.body.classList.add('gpu-glitch-active');
      
      this.glitchInterval = setInterval(function() {
        self.applyGlitch();
      }, 200);
    },
    
    stopGlitch: function() {
      this.isGlitching = false;
      document.body.classList.remove('gpu-glitch-active');
      
      if (this.glitchInterval) {
        clearInterval(this.glitchInterval);
        this.glitchInterval = null;
      }
      
      this.clearGlitchEffects();
    },
    
    applyGlitch: function() {
      var effects = ['shift', 'flicker', 'invert', 'distort'];
      var effect = effects[Math.floor(Math.random() * effects.length)];
      
      switch (effect) {
        case 'shift':
          this.applyShift();
          break;
        case 'flicker':
          this.applyFlicker();
          break;
        case 'invert':
          this.applyInvert();
          break;
        case 'distort':
          this.applyDistort();
          break;
      }
    },
    
    applyShift: function() {
      var elements = document.querySelectorAll('.md-text p, .md-text h1, .md-text h2, .md-text h3');
      elements.forEach(function(el) {
        var shift = (Math.random() - 0.5) * 10;
        el.style.transform = 'translateX(' + shift + 'px)';
        setTimeout(function() {
          el.style.transform = '';
        }, 100);
      });
    },
    
    applyFlicker: function() {
      document.body.style.opacity = 0.7 + Math.random() * 0.3;
      setTimeout(function() {
        document.body.style.opacity = '';
      }, 50);
    },
    
    applyInvert: function() {
      var elements = document.querySelectorAll('.md-text');
      elements.forEach(function(el) {
        el.style.filter = 'invert(' + (Math.random() * 0.3) + ')';
        setTimeout(function() {
          el.style.filter = '';
        }, 100);
      });
    },
    
    applyDistort: function() {
      var elements = document.querySelectorAll('.md-text p');
      elements.forEach(function(el) {
        el.style.letterSpacing = (Math.random() - 0.5) * 3 + 'px';
        setTimeout(function() {
          el.style.letterSpacing = '';
        }, 150);
      });
    },
    
    clearGlitchEffects: function() {
      document.body.style.opacity = '';
      var elements = document.querySelectorAll('.md-text p, .md-text h1, .md-text h2, .md-text h3, .md-text');
      elements.forEach(function(el) {
        el.style.transform = '';
        el.style.filter = '';
        el.style.letterSpacing = '';
      });
    }
  };
  
  window.GlitchEffect = GlitchEffect;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      GlitchEffect.init();
    });
  } else {
    GlitchEffect.init();
  }
})();
