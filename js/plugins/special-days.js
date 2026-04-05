(function() {
  'use strict';
  
  var SpecialDays = {
    config: {
      enabled: true,
      showNotification: true,
      autoTriggerAchievement: true
    },
    
    specialDays: {
      'spring_festival': {
        name: '春节',
        type: 'festival',
        dates: [
          { month: 1, day: 1 },
          { month: 1, day: 2 },
          { month: 1, day: 3 },
          { month: 1, day: 4 },
          { month: 1, day: 5 },
          { month: 1, day: 6 },
          { month: 1, day: 7 }
        ],
        lunar: true,
        icon: '🧧',
        color: '#FF0000',
        bgEffect: 'fireworks',
        message: '新年快乐！恭喜发财，红包拿来！',
        achievement: 'spring_festival_visitor'
      },
      'lantern_festival': {
        name: '元宵节',
        type: 'festival',
        dates: [{ month: 1, day: 15 }],
        lunar: true,
        icon: '🏮',
        color: '#FF6B00',
        bgEffect: 'lanterns',
        message: '元宵节快乐！吃汤圆，猜灯谜！',
        achievement: 'lantern_festival_visitor'
      },
      'valentines_day': {
        name: '情人节',
        type: 'festival',
        dates: [{ month: 2, day: 14 }],
        lunar: false,
        icon: '💕',
        color: '#FF69B4',
        bgEffect: 'hearts',
        message: '情人节快乐！愿有情人终成眷属！',
        achievement: 'valentines_visitor'
      },
      'womens_day': {
        name: '妇女节',
        type: 'festival',
        dates: [{ month: 3, day: 8 }],
        lunar: false,
        icon: '🌸',
        color: '#FFB6C1',
        bgEffect: 'flowers',
        message: '女神节快乐！愿你永远美丽自信！',
        achievement: 'womens_day_visitor'
      },
      'qingming': {
        name: '清明节',
        type: 'festival',
        dates: [{ month: 4, day: 4 }],
        lunar: false,
        icon: '🌿',
        color: '#90EE90',
        bgEffect: 'rain',
        message: '清明时节雨纷纷，缅怀先人寄哀思。',
        achievement: null
      },
      'labor_day': {
        name: '劳动节',
        type: 'festival',
        dates: [
          { month: 5, day: 1 },
          { month: 5, day: 2 },
          { month: 5, day: 3 }
        ],
        lunar: false,
        icon: '👷',
        color: '#FFD700',
        bgEffect: 'confetti',
        message: '劳动节快乐！致敬每一位劳动者！',
        achievement: 'labor_day_visitor'
      },
      'youth_day': {
        name: '青年节',
        type: 'festival',
        dates: [{ month: 5, day: 4 }],
        lunar: false,
        icon: '🌟',
        color: '#00CED1',
        bgEffect: 'stars',
        message: '青年节快乐！青春无悔，奋斗不止！',
        achievement: 'youth_day_visitor'
      },
      'dragon_boat': {
        name: '端午节',
        type: 'festival',
        dates: [{ month: 5, day: 5 }],
        lunar: true,
        icon: '🐉',
        color: '#228B22',
        bgEffect: 'dragon',
        message: '端午节快乐！吃粽子，赛龙舟！',
        achievement: 'dragon_boat_visitor'
      },
      'childrens_day': {
        name: '儿童节',
        type: 'festival',
        dates: [{ month: 6, day: 1 }],
        lunar: false,
        icon: '🎈',
        color: '#87CEEB',
        bgEffect: 'balloons',
        message: '儿童节快乐！愿你永葆童心！',
        achievement: 'childrens_day_visitor'
      },
      'tanabata': {
        name: '七夕节',
        type: 'festival',
        dates: [{ month: 7, day: 7 }],
        lunar: true,
        icon: '🌌',
        color: '#9370DB',
        bgEffect: 'stars',
        message: '七夕快乐！愿天下有情人终成眷属！',
        achievement: 'tanabata_visitor'
      },
      'mid_autumn': {
        name: '中秋节',
        type: 'festival',
        dates: [{ month: 8, day: 15 }],
        lunar: true,
        icon: '🥮',
        color: '#FFA500',
        bgEffect: 'moon',
        message: '中秋快乐！月圆人团圆！',
        achievement: 'mid_autumn_visitor'
      },
      'national_day': {
        name: '国庆节',
        type: 'festival',
        dates: [
          { month: 10, day: 1 },
          { month: 10, day: 2 },
          { month: 10, day: 3 },
          { month: 10, day: 4 },
          { month: 10, day: 5 },
          { month: 10, day: 6 },
          { month: 10, day: 7 }
        ],
        lunar: false,
        icon: '🇨🇳',
        color: '#FF0000',
        bgEffect: 'fireworks',
        message: '国庆节快乐！祝福祖国繁荣昌盛！',
        achievement: 'national_day_visitor'
      },
      'halloween': {
        name: '万圣节',
        type: 'festival',
        dates: [{ month: 10, day: 31 }],
        lunar: false,
        icon: '🎃',
        color: '#FF6600',
        bgEffect: 'ghosts',
        message: '万圣节快乐！不给糖就捣蛋！',
        achievement: 'halloween_visitor'
      },
      'double_eleven': {
        name: '双十一',
        type: 'festival',
        dates: [{ month: 11, day: 11 }],
        lunar: false,
        icon: '🛒',
        color: '#FF4500',
        bgEffect: 'shopping',
        message: '双十一快乐！剁手快乐！',
        achievement: 'double_eleven_visitor'
      },
      'thanksgiving': {
        name: '感恩节',
        type: 'festival',
        dates: [{ month: 11, day: 4, week: 4 }],
        lunar: false,
        icon: '🦃',
        color: '#CD853F',
        bgEffect: 'leaves',
        message: '感恩节快乐！感谢有你！',
        achievement: 'thanksgiving_visitor'
      },
      'christmas': {
        name: '圣诞节',
        type: 'festival',
        dates: [{ month: 12, day: 25 }],
        lunar: false,
        icon: '🎄',
        color: '#228B22',
        bgEffect: 'snow',
        message: '圣诞快乐！Merry Christmas！',
        achievement: 'christmas_visitor'
      },
      'new_year_eve': {
        name: '除夕',
        type: 'festival',
        dates: [{ month: 12, day: 30 }],
        lunar: true,
        icon: '🎆',
        color: '#FF0000',
        bgEffect: 'fireworks',
        message: '除夕快乐！辞旧迎新！',
        achievement: 'new_year_eve_visitor'
      },
      'new_year': {
        name: '元旦',
        type: 'festival',
        dates: [{ month: 1, day: 1 }],
        lunar: false,
        icon: '🎉',
        color: '#FFD700',
        bgEffect: 'confetti',
        message: '新年快乐！万事如意！',
        achievement: 'new_year_visitor'
      },
      'april_fools': {
        name: '愚人节',
        type: 'festival',
        dates: [{ month: 4, day: 1 }],
        lunar: false,
        icon: '🤡',
        color: '#FF69B4',
        bgEffect: 'joke',
        message: '愚人节快乐！小心被骗哦~',
        achievement: 'april_fools_visitor'
      },
      'mothers_day': {
        name: '母亲节',
        type: 'festival',
        dates: [{ month: 5, day: 2, week: 0 }],
        lunar: false,
        icon: '👩',
        color: '#FF69B4',
        bgEffect: 'flowers',
        message: '母亲节快乐！感谢妈妈的养育之恩！',
        achievement: 'mothers_day_visitor'
      },
      'fathers_day': {
        name: '父亲节',
        type: 'festival',
        dates: [{ month: 6, day: 3, week: 0 }],
        lunar: false,
        icon: '👨',
        color: '#4169E1',
        bgEffect: 'stars',
        message: '父亲节快乐！感谢爸爸的辛勤付出！',
        achievement: 'fathers_day_visitor'
      },
      'teachers_day': {
        name: '教师节',
        type: 'festival',
        dates: [{ month: 9, day: 10 }],
        lunar: false,
        icon: '📚',
        color: '#FFD700',
        bgEffect: 'books',
        message: '教师节快乐！感谢老师的辛勤教导！',
        achievement: 'teachers_day_visitor'
      },
      'programmers_day': {
        name: '程序员节',
        type: 'festival',
        dates: [{ month: 10, day: 24 }],
        lunar: false,
        icon: '💻',
        color: '#00FF00',
        bgEffect: 'code',
        message: '程序员节快乐！1024快乐！愿你的代码永无Bug！',
        achievement: 'programmers_day_visitor'
      },
      'blog_birthday': {
        name: '博客生日',
        type: 'anniversary',
        dates: [{ month: 1, day: 1 }],
        lunar: false,
        icon: '🎂',
        color: '#FF69B4',
        bgEffect: 'birthday',
        message: '今天是博客的生日！感谢你的陪伴！',
        achievement: 'blog_birthday_visitor'
      }
    },
    
    currentDay: null,
    effects: {},
    
    init: function() {
      if (!this.config.enabled) return;
      
      this.checkSpecialDay();
      this.loadSavedState();
      
      if (this.currentDay) {
        this.showWelcome();
        this.applyEffect();
        this.triggerAchievement();
      }
    },
    
    checkSpecialDay: function() {
      var now = new Date();
      var month = now.getMonth() + 1;
      var day = now.getDate();
      var weekDay = now.getDay();
      var weekOfMonth = Math.ceil(day / 7);
      
      for (var key in this.specialDays) {
        var specialDay = this.specialDays[key];
        
        for (var i = 0; i < specialDay.dates.length; i++) {
          var date = specialDay.dates[i];
          
          if (specialDay.lunar) {
            if (this.checkLunarDate(month, day, date.month, date.day)) {
              this.currentDay = specialDay;
              this.currentDayKey = key;
              return;
            }
          } else if (date.week !== undefined) {
            if (month === date.month && weekOfMonth === date.week && weekDay === date.week) {
              this.currentDay = specialDay;
              this.currentDayKey = key;
              return;
            }
          } else {
            if (month === date.month && day === date.day) {
              this.currentDay = specialDay;
              this.currentDayKey = key;
              return;
            }
          }
        }
      }
    },
    
    checkLunarDate: function(solarMonth, solarDay, lunarMonth, lunarDay) {
      return false;
    },
    
    loadSavedState: function() {
      try {
        var saved = localStorage.getItem('special_days_state');
        if (saved) {
          var state = JSON.parse(saved);
          if (state.lastVisit) {
            var lastVisit = new Date(state.lastVisit);
            var now = new Date();
            if (lastVisit.toDateString() === now.toDateString()) {
              this.alreadyShown = state.shown || {};
            } else {
              this.alreadyShown = {};
            }
          }
        }
      } catch(e) {
        this.alreadyShown = {};
      }
    },
    
    saveState: function() {
      try {
        localStorage.setItem('special_days_state', JSON.stringify({
          lastVisit: new Date().toISOString(),
          shown: this.alreadyShown || {}
        }));
      } catch(e) {}
    },
    
    showWelcome: function() {
      if (!this.config.showNotification) return;
      if (this.alreadyShown && this.alreadyShown[this.currentDayKey]) return;
      
      var self = this;
      setTimeout(function() {
        self.createNotification();
        if (!self.alreadyShown) self.alreadyShown = {};
        self.alreadyShown[self.currentDayKey] = true;
        self.saveState();
      }, 1500);
    },
    
    createNotification: function() {
      var notification = document.createElement('div');
      notification.id = 'special-day-notification';
      notification.innerHTML = '\n        <div class="special-day-content">\n          <div class="special-day-icon">' + this.currentDay.icon + '</div>\n          <div class="special-day-text">\n            <div class="special-day-title">' + this.currentDay.name + '</div>\n            <div class="special-day-message">' + this.currentDay.message + '</div>\n          </div>\n          <button class="special-day-close" onclick="this.parentElement.parentElement.remove()">×</button>\n        </div>\n      ';
      
      if (!document.getElementById('special-day-styles')) {
        var style = document.createElement('style');
        style.id = 'special-day-styles';
        style.textContent = '\n          #special-day-notification {\n            position: fixed;\n            top: 20px;\n            left: 50%;\n            transform: translateX(-50%);\n            z-index: 10000;\n            animation: specialDaySlideIn 0.5s ease-out;\n          }\n          \n          .special-day-content {\n            display: flex;\n            align-items: center;\n            gap: 15px;\n            background: linear-gradient(135deg, ' + this.currentDay.color + '22, ' + this.currentDay.color + '44);\n            backdrop-filter: blur(10px);\n            border: 2px solid ' + this.currentDay.color + ';\n            border-radius: 15px;\n            padding: 15px 25px;\n            box-shadow: 0 10px 30px rgba(0,0,0,0.3);\n          }\n          \n          .special-day-icon {\n            font-size: 2.5em;\n            animation: specialDayBounce 1s ease infinite;\n          }\n          \n          .special-day-text {\n            text-align: left;\n          }\n          \n          .special-day-title {\n            font-size: 1.2em;\n            font-weight: bold;\n            color: ' + this.currentDay.color + ';\n            margin-bottom: 5px;\n          }\n          \n          .special-day-message {\n            font-size: 0.95em;\n            color: var(--text, #333);\n          }\n          \n          .special-day-close {\n            background: transparent;\n            border: none;\n            font-size: 1.5em;\n            cursor: pointer;\n            color: var(--text, #333);\n            opacity: 0.6;\n            transition: opacity 0.3s;\n          }\n          \n          .special-day-close:hover {\n            opacity: 1;\n          }\n          \n          @keyframes specialDaySlideIn {\n            from {\n              opacity: 0;\n              transform: translateX(-50%) translateY(-50px);\n            }\n            to {\n              opacity: 1;\n              transform: translateX(-50%) translateY(0);\n            }\n          }\n          \n          @keyframes specialDayBounce {\n            0%, 100% { transform: translateY(0); }\n            50% { transform: translateY(-10px); }\n          }\n        ';
        document.head.appendChild(style);
      }
      
      document.body.appendChild(notification);
      
      setTimeout(function() {
        if (notification.parentElement) {
          notification.style.animation = 'specialDaySlideIn 0.3s ease-out reverse';
          setTimeout(function() {
            notification.remove();
          }, 300);
        }
      }, 8000);
    },
    
    applyEffect: function() {
      var effect = this.currentDay.bgEffect;
      
      switch(effect) {
        case 'snow':
          this.createSnowEffect();
          break;
        case 'fireworks':
          this.createFireworksEffect();
          break;
        case 'hearts':
          this.createHeartsEffect();
          break;
        case 'confetti':
          this.createConfettiEffect();
          break;
        case 'stars':
          this.createStarsEffect();
          break;
        case 'balloons':
          this.createBalloonsEffect();
          break;
        case 'leaves':
          this.createLeavesEffect();
          break;
        case 'flowers':
          this.createFlowersEffect();
          break;
        case 'lanterns':
          this.createLanternsEffect();
          break;
        case 'moon':
          this.createMoonEffect();
          break;
        case 'ghosts':
          this.createGhostsEffect();
          break;
        case 'code':
          this.createCodeEffect();
          break;
        case 'birthday':
          this.createBirthdayEffect();
          break;
      }
    },
    
    createSnowEffect: function() {
      var container = document.createElement('div');
      container.id = 'snow-container';
      container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
      document.body.appendChild(container);
      
      function createSnowflake() {
        var snowflake = document.createElement('div');
        snowflake.innerHTML = '❄';
        snowflake.style.cssText = 'position:absolute;color:#fff;font-size:' + (Math.random() * 20 + 10) + 'px;left:' + Math.random() * 100 + '%;top:-20px;opacity:' + (Math.random() * 0.5 + 0.5) + ';animation:snowFall ' + (Math.random() * 5 + 5) + 's linear forwards;';
        container.appendChild(snowflake);
        
        setTimeout(function() {
          snowflake.remove();
        }, 10000);
      }
      
      if (!document.getElementById('snow-styles')) {
        var style = document.createElement('style');
        style.id = 'snow-styles';
        style.textContent = '@keyframes snowFall{to{transform:translateY(100vh) rotate(360deg);}}';
        document.head.appendChild(style);
      }
      
      setInterval(createSnowflake, 200);
    },
    
    createFireworksEffect: function() {
      var canvas = document.createElement('canvas');
      canvas.id = 'fireworks-canvas';
      canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
      document.body.appendChild(canvas);
      
      var ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      var fireworks = [];
      var particles = [];
      
      function createFirework() {
        fireworks.push({
          x: Math.random() * canvas.width,
          y: canvas.height,
          targetY: Math.random() * canvas.height * 0.5,
          speed: 3 + Math.random() * 2,
          color: 'hsl(' + Math.random() * 360 + ', 100%, 50%)'
        });
      }
      
      function createParticles(x, y, color) {
        for (var i = 0; i < 30; i++) {
          particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 60,
            color: color
          });
        }
      }
      
      function animate() {
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (var i = fireworks.length - 1; i >= 0; i--) {
          var fw = fireworks[i];
          fw.y -= fw.speed;
          
          ctx.beginPath();
          ctx.arc(fw.x, fw.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = fw.color;
          ctx.fill();
          
          if (fw.y <= fw.targetY) {
            createParticles(fw.x, fw.y, fw.color);
            fireworks.splice(i, 1);
          }
        }
        
        for (var j = particles.length - 1; j >= 0; j--) {
          var p = particles[j];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.1;
          p.life--;
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life / 60;
          ctx.fill();
          ctx.globalAlpha = 1;
          
          if (p.life <= 0) {
            particles.splice(j, 1);
          }
        }
        
        requestAnimationFrame(animate);
      }
      
      setInterval(createFirework, 1000);
      animate();
    },
    
    createHeartsEffect: function() {
      var container = document.createElement('div');
      container.id = 'hearts-container';
      container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
      document.body.appendChild(container);
      
      function createHeart() {
        var heart = document.createElement('div');
        heart.innerHTML = '❤';
        heart.style.cssText = 'position:absolute;color:#ff69b4;font-size:' + (Math.random() * 20 + 15) + 'px;left:' + Math.random() * 100 + '%;bottom:-20px;animation:heartFloat ' + (Math.random() * 3 + 4) + 's ease-out forwards;';
        container.appendChild(heart);
        
        setTimeout(function() {
          heart.remove();
        }, 7000);
      }
      
      if (!document.getElementById('hearts-styles')) {
        var style = document.createElement('style');
        style.id = 'hearts-styles';
        style.textContent = '@keyframes heartFloat{to{transform:translateY(-100vh) rotate(360deg);opacity:0;}}';
        document.head.appendChild(style);
      }
      
      setInterval(createHeart, 300);
    },
    
    createConfettiEffect: function() {
      var container = document.createElement('div');
      container.id = 'confetti-container';
      container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
      document.body.appendChild(container);
      
      var colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
      
      function createConfetti() {
        var confetti = document.createElement('div');
        confetti.style.cssText = 'position:absolute;width:10px;height:10px;background:' + colors[Math.floor(Math.random() * colors.length)] + ';left:' + Math.random() * 100 + '%;top:-10px;animation:confettiFall ' + (Math.random() * 3 + 3) + 's linear forwards;transform:rotate(' + Math.random() * 360 + 'deg);';
        container.appendChild(confetti);
        
        setTimeout(function() {
          confetti.remove();
        }, 6000);
      }
      
      if (!document.getElementById('confetti-styles')) {
        var style = document.createElement('style');
        style.id = 'confetti-styles';
        style.textContent = '@keyframes confettiFall{to{transform:translateY(100vh) rotate(720deg);}}';
        document.head.appendChild(style);
      }
      
      for (var i = 0; i < 50; i++) {
        setTimeout(createConfetti, i * 50);
      }
      setInterval(createConfetti, 200);
    },
    
    createStarsEffect: function() {
      var container = document.createElement('div');
      container.id = 'stars-container';
      container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
      document.body.appendChild(container);
      
      function createStar() {
        var star = document.createElement('div');
        star.innerHTML = '✨';
        star.style.cssText = 'position:absolute;font-size:' + (Math.random() * 15 + 10) + 'px;left:' + Math.random() * 100 + '%;top:' + Math.random() * 100 + '%;animation:starTwinkle ' + (Math.random() * 2 + 1) + 's ease-in-out infinite;';
        container.appendChild(star);
      }
      
      if (!document.getElementById('stars-styles')) {
        var style = document.createElement('style');
        style.id = 'stars-styles';
        style.textContent = '@keyframes starTwinkle{0%,100%{opacity:0.3;transform:scale(1);}50%{opacity:1;transform:scale(1.2);}}';
        document.head.appendChild(style);
      }
      
      for (var i = 0; i < 30; i++) {
        createStar();
      }
    },
    
    createBalloonsEffect: function() {
      var container = document.createElement('div');
      container.id = 'balloons-container';
      container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
      document.body.appendChild(container);
      
      var colors = ['🎈', '🎈', '🎈', '🎈', '🎈'];
      
      function createBalloon() {
        var balloon = document.createElement('div');
        balloon.innerHTML = colors[Math.floor(Math.random() * colors.length)];
        balloon.style.cssText = 'position:absolute;font-size:' + (Math.random() * 20 + 25) + 'px;left:' + Math.random() * 100 + '%;bottom:-50px;animation:balloonFloat ' + (Math.random() * 5 + 5) + 's ease-out forwards;';
        container.appendChild(balloon);
        
        setTimeout(function() {
          balloon.remove();
        }, 10000);
      }
      
      if (!document.getElementById('balloons-styles')) {
        var style = document.createElement('style');
        style.id = 'balloons-styles';
        style.textContent = '@keyframes balloonFloat{to{transform:translateY(-100vh);}}';
        document.head.appendChild(style);
      }
      
      setInterval(createBalloon, 500);
    },
    
    createLeavesEffect: function() {
      var container = document.createElement('div');
      container.id = 'leaves-container';
      container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
      document.body.appendChild(container);
      
      var leaves = ['🍂', '🍁', '🍃'];
      
      function createLeaf() {
        var leaf = document.createElement('div');
        leaf.innerHTML = leaves[Math.floor(Math.random() * leaves.length)];
        leaf.style.cssText = 'position:absolute;font-size:' + (Math.random() * 15 + 15) + 'px;left:' + Math.random() * 100 + '%;top:-20px;animation:leafFall ' + (Math.random() * 5 + 5) + 's linear forwards;';
        container.appendChild(leaf);
        
        setTimeout(function() {
          leaf.remove();
        }, 10000);
      }
      
      if (!document.getElementById('leaves-styles')) {
        var style = document.createElement('style');
        style.id = 'leaves-styles';
        style.textContent = '@keyframes leafFall{to{transform:translateY(100vh) translateX(' + (Math.random() * 200 - 100) + 'px) rotate(720deg);}}';
        document.head.appendChild(style);
      }
      
      setInterval(createLeaf, 400);
    },
    
    createFlowersEffect: function() {
      var container = document.createElement('div');
      container.id = 'flowers-container';
      container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
      document.body.appendChild(container);
      
      var flowers = ['🌸', '🌺', '🌹', '🌷', '💐'];
      
      function createFlower() {
        var flower = document.createElement('div');
        flower.innerHTML = flowers[Math.floor(Math.random() * flowers.length)];
        flower.style.cssText = 'position:absolute;font-size:' + (Math.random() * 20 + 15) + 'px;left:' + Math.random() * 100 + '%;top:-20px;animation:flowerFall ' + (Math.random() * 4 + 4) + 's ease-out forwards;';
        container.appendChild(flower);
        
        setTimeout(function() {
          flower.remove();
        }, 8000);
      }
      
      if (!document.getElementById('flowers-styles')) {
        var style = document.createElement('style');
        style.id = 'flowers-styles';
        style.textContent = '@keyframes flowerFall{to{transform:translateY(100vh) rotate(360deg);}}';
        document.head.appendChild(style);
      }
      
      setInterval(createFlower, 350);
    },
    
    createLanternsEffect: function() {
      var container = document.createElement('div');
      container.id = 'lanterns-container';
      container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
      document.body.appendChild(container);
      
      function createLantern() {
        var lantern = document.createElement('div');
        lantern.innerHTML = '🏮';
        lantern.style.cssText = 'position:absolute;font-size:' + (Math.random() * 25 + 20) + 'px;left:' + Math.random() * 100 + '%;top:-30px;animation:lanternFloat ' + (Math.random() * 6 + 6) + 's ease-out forwards;';
        container.appendChild(lantern);
        
        setTimeout(function() {
          lantern.remove();
        }, 12000);
      }
      
      if (!document.getElementById('lanterns-styles')) {
        var style = document.createElement('style');
        style.id = 'lanterns-styles';
        style.textContent = '@keyframes lanternFloat{to{transform:translateY(100vh);}}';
        document.head.appendChild(style);
      }
      
      setInterval(createLantern, 600);
    },
    
    createMoonEffect: function() {
      var moon = document.createElement('div');
      moon.innerHTML = '🌕';
      moon.style.cssText = 'position:fixed;top:50px;right:50px;font-size:80px;opacity:0.8;z-index:9999;animation:moonGlow 3s ease-in-out infinite;';
      document.body.appendChild(moon);
      
      if (!document.getElementById('moon-styles')) {
        var style = document.createElement('style');
        style.id = 'moon-styles';
        style.textContent = '@keyframes moonGlow{0%,100%{filter:drop-shadow(0 0 20px #FFD700);}50%{filter:drop-shadow(0 0 40px #FFD700);}}';
        document.head.appendChild(style);
      }
    },
    
    createGhostsEffect: function() {
      var container = document.createElement('div');
      container.id = 'ghosts-container';
      container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
      document.body.appendChild(container);
      
      var ghosts = ['👻', '🎃', '🦇', '🕷️'];
      
      function createGhost() {
        var ghost = document.createElement('div');
        ghost.innerHTML = ghosts[Math.floor(Math.random() * ghosts.length)];
        ghost.style.cssText = 'position:absolute;font-size:' + (Math.random() * 25 + 20) + 'px;left:' + Math.random() * 100 + '%;top:' + Math.random() * 100 + '%;animation:ghostFloat ' + (Math.random() * 3 + 2) + 's ease-in-out infinite;opacity:0.7;';
        container.appendChild(ghost);
      }
      
      if (!document.getElementById('ghosts-styles')) {
        var style = document.createElement('style');
        style.id = 'ghosts-styles';
        style.textContent = '@keyframes ghostFloat{0%,100%{transform:translateY(0) rotate(0deg);}50%{transform:translateY(-20px) rotate(10deg);}}';
        document.head.appendChild(style);
      }
      
      for (var i = 0; i < 15; i++) {
        createGhost();
      }
    },
    
    createCodeEffect: function() {
      var container = document.createElement('div');
      container.id = 'code-container';
      container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;opacity:0.3;';
      document.body.appendChild(container);
      
      var chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
      
      function createCodeLine() {
        var line = document.createElement('div');
        var text = '';
        for (var i = 0; i < 20; i++) {
          text += chars[Math.floor(Math.random() * chars.length)];
        }
        line.textContent = text;
        line.style.cssText = 'position:absolute;color:#00ff00;font-family:monospace;font-size:14px;left:' + Math.random() * 100 + '%;top:-20px;animation:codeFall ' + (Math.random() * 5 + 5) + 's linear forwards;writing-mode:vertical-rl;';
        container.appendChild(line);
        
        setTimeout(function() {
          line.remove();
        }, 10000);
      }
      
      if (!document.getElementById('code-styles')) {
        var style = document.createElement('style');
        style.id = 'code-styles';
        style.textContent = '@keyframes codeFall{to{transform:translateY(100vh);}}';
        document.head.appendChild(style);
      }
      
      setInterval(createCodeLine, 300);
    },
    
    createBirthdayEffect: function() {
      this.createConfettiEffect();
      
      var cake = document.createElement('div');
      cake.innerHTML = '🎂';
      cake.style.cssText = 'position:fixed;bottom:20px;right:20px;font-size:60px;z-index:9999;animation:birthdayBounce 1s ease-in-out infinite;';
      document.body.appendChild(cake);
      
      if (!document.getElementById('birthday-styles')) {
        var style = document.createElement('style');
        style.id = 'birthday-styles';
        style.textContent = '@keyframes birthdayBounce{0%,100%{transform:scale(1);}50%{transform:scale(1.1);}}';
        document.head.appendChild(style);
      }
    },
    
    triggerAchievement: function() {
      if (!this.config.autoTriggerAchievement) return;
      if (!this.currentDay.achievement) return;
      
      if (window.CardSystem && window.CardSystem.obtainCard) {
        window.CardSystem.obtainCard(this.currentDay.achievement);
      }
    },
    
    getCurrentDay: function() {
      return this.currentDay;
    },
    
    isSpecialDay: function() {
      return this.currentDay !== null;
    }
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      SpecialDays.init();
    });
  } else {
    SpecialDays.init();
  }
  
  window.SpecialDays = SpecialDays;
})();
