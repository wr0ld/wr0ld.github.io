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
    
    init: function() {
      if (!this.config.enabled) return;
      
      this.checkSpecialDay();
      this.loadSavedState();
      
      if (this.currentDay) {
        this.showWelcome();
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
        style.textContent = '\n          #special-day-notification {\n            position: fixed;\n            top: 20px;\n            left: 50%;\n            transform: translateX(-50%);\n            z-index: 10000;\n            animation: specialDaySlideIn 0.5s ease-out;\n          }\n          \n          .special-day-content {\n            display: flex;\n            align-items: center;\n            gap: 15px;\n            background: linear-gradient(135deg, ' + this.currentDay.color + '22, ' + this.currentDay.color + '44);\n            backdrop-filter: blur(10px);\n            border: 2px solid ' + this.currentDay.color + ';\n            border-radius: 15px;\n            padding: 15px 25px;\n            box-shadow: 0 10px 30px rgba(0,0,0,0.3);\n          }\n          \n          .special-day-icon {\n            font-size: 2.5em;\n            animation: specialDayBounce 1s ease infinite;\n          }\n          \n          .special-day-text {\n            text-align: left;\n          }\n          \n          .special-day-title {\n            font-size: 1.2em;\n            font-weight: bold;\n            color: ' + this.currentDay.color + ';\n            margin-bottom: 5px;\n          }\n          \n          .special-day-message {\n            font-size: 0.95em;\n            color: var(--text, #333);\n          }\n          \n          .special-day-close {\n            background: transparent;\n            border: none;\n            font-size: 1.5em;\n            cursor: pointer;\n            color: var(--text, #333);\n            opacity: 0.6;\n            transition: opacity 0.3s;\n          }\n          \n          .special-day-close:hover {\n            opacity: 1;\n          }\n          \n          @keyframes specialDaySlideIn {\n            from {\n              opacity: 0;\n              transform: translateX(-50%) translateY(-50px);\n            }\n            to {\n              opacity: 1;\n              transform: translateX(-50%) translateY(0);\n            }\n          }\n          \n          @keyframes specialDayBounce {\n            0%, 100% {\n              transform: translateY(0);\n            }\n            50% {\n              transform: translateY(-5px);\n            }\n          }\n        ';
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
