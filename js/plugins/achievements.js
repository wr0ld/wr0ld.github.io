(function() {
  'use strict';
  
  var CardSystem = {
    cards: {
      'first_visit': {
        name: '初来乍到',
        desc: '首次访问博客获得',
        icon: '🎉',
        rarity: 'common',
        flavor: '每一个故事都有开始...',
        obtained: false,
        obtainTime: null
      },
      'reader_10': {
        name: '阅读新手',
        desc: '阅读10篇文章',
        icon: '📖',
        rarity: 'common',
        flavor: '知识的大门已经打开',
        obtained: false,
        obtainTime: null,
        progress: 0,
        target: 10
      },
      'reader_50': {
        name: '阅读达人',
        desc: '阅读50篇文章',
        icon: '📚',
        rarity: 'rare',
        flavor: '书山有路勤为径',
        obtained: false,
        obtainTime: null,
        progress: 0,
        target: 50
      },
      'explorer': {
        name: '探索者',
        desc: '访问所有主要页面',
        icon: '🗺️',
        rarity: 'rare',
        flavor: '未知的领域等你征服',
        obtained: false,
        obtainTime: null,
        pages: ['/', '/games/', '/settings/', '/about/', '/divination/', '/calculator/'],
        visited: []
      },
      'gamer': {
        name: '游戏玩家',
        desc: '玩过任意游戏',
        icon: '🎮',
        rarity: 'common',
        flavor: '劳逸结合，快乐加倍',
        obtained: false,
        obtainTime: null
      },
      'night_owl': {
        name: '夜猫子',
        desc: '在凌晨0-4点访问博客',
        icon: '🦉',
        rarity: 'rare',
        flavor: '深夜的代码更有灵魂',
        obtained: false,
        obtainTime: null
      },
      'early_bird': {
        name: '早起鸟',
        desc: '在早上5-7点访问博客',
        icon: '🐦',
        rarity: 'rare',
        flavor: '早起的鸟儿有虫吃',
        obtained: false,
        obtainTime: null
      },
      'hacker': {
        name: '黑客',
        desc: '打开控制台查看源码',
        icon: '💀',
        rarity: 'epic',
        flavor: '真正的黑客从不放弃探索',
        obtained: false,
        obtainTime: null
      },
      'ctf_master': {
        name: 'CTF大师',
        desc: '在控制台找到隐藏的flag',
        icon: '🏴',
        rarity: 'legendary',
        flavor: 'flag{w3lc0me_t0_wr0ld_bl0g}',
        obtained: false,
        obtainTime: null
      },
      'robots_finder': {
        name: '机器人猎人',
        desc: '发现了robots.txt的秘密',
        icon: '🤖',
        rarity: 'epic',
        flavor: '有些秘密藏在不起眼的角落',
        obtained: false,
        obtainTime: null
      },
      'console_explorer': {
        name: '控制台探险家',
        desc: '在控制台使用secret.hint()',
        icon: '🔍',
        rarity: 'epic',
        flavor: 'console.log("Hello, Hacker!")',
        obtained: false,
        obtainTime: null
      },
      'source_diver': {
        name: '源码潜水员',
        desc: '在HTML注释中找到线索',
        icon: '💎',
        rarity: 'rare',
        flavor: '注释里藏着开发者的秘密',
        obtained: false,
        obtainTime: null
      },
      'dedicated_reader': {
        name: '忠实读者',
        desc: '累计停留时间超过1小时',
        icon: '⏰',
        rarity: 'epic',
        flavor: '时间是阅读最好的礼物',
        obtained: false,
        obtainTime: null,
        progress: 0,
        target: 3600
      },
      'week_warrior': {
        name: '周常战士',
        desc: '连续7天访问博客',
        icon: '📅',
        rarity: 'legendary',
        flavor: '坚持就是胜利',
        obtained: false,
        obtainTime: null,
        streak: 0,
        lastVisit: null
      },
      'code_master': {
        name: '代码大师',
        desc: '复制10个代码片段',
        icon: '💻',
        rarity: 'rare',
        flavor: '代码是程序员的语言',
        obtained: false,
        obtainTime: null,
        progress: 0,
        target: 10
      },
      'divination_master': {
        name: '占卜大师',
        desc: '完成一次占卜',
        icon: '🔮',
        rarity: 'common',
        flavor: '命运的齿轮开始转动',
        obtained: false,
        obtainTime: null
      },
      'calculator_user': {
        name: '计算达人',
        desc: '使用计算器',
        icon: '🔢',
        rarity: 'common',
        flavor: '精确计算，从不失误',
        obtained: false,
        obtainTime: null
      },
      'scroller': {
        name: '滚动达人',
        desc: '滚动页面超过10000像素',
        icon: '📜',
        rarity: 'common',
        flavor: '每一步都是新的发现',
        obtained: false,
        obtainTime: null,
        progress: 0,
        target: 10000
      },
      'clicker': {
        name: '点击狂人',
        desc: '点击次数超过100次',
        icon: '👆',
        rarity: 'common',
        flavor: '点击之间，世界改变',
        obtained: false,
        obtainTime: null,
        progress: 0,
        target: 100
      },
      'terminal_404': {
        name: '迷失者',
        desc: '访问404终端页面',
        icon: '🖥️',
        rarity: 'rare',
        flavor: '错误页面？不，这是新的冒险',
        obtained: false,
        obtainTime: null
      },
      'terminal_hidden_file': {
        name: '隐藏文件猎人',
        desc: '在404终端找到.secret文件',
        icon: '📁',
        rarity: 'epic',
        flavor: 'flag{h1dd3n_f1l3_4cc3ss_gr4nt3d}',
        obtained: false,
        obtainTime: null
      },
      'terminal_sql_injection': {
        name: 'SQL注入大师',
        desc: '在404终端完成SQL注入攻击',
        icon: '💉',
        rarity: 'legendary',
        flavor: 'flag{sql_1nj3ct10n_m4st3r_2024}',
        obtained: false,
        obtainTime: null
      },
      'terminal_sudo': {
        name: '权限提升者',
        desc: '在404终端通过sudo获取flag',
        icon: '🔑',
        rarity: 'epic',
        flavor: 'flag{sudo_pr1v1l3g3_3sc4l4t10n}',
        obtained: false,
        obtainTime: null
      },
      'terminal_hidden_table': {
        name: '数据库探险家',
        desc: '在404终端发现secrets表',
        icon: '🗄️',
        rarity: 'rare',
        flavor: 'flag{h1dd3n_t4bl3_f0und}',
        obtained: false,
        obtainTime: null
      },
      'terminal_all_flags': {
        name: '终端征服者',
        desc: '在404终端找到所有flag',
        icon: '🏆',
        rarity: 'legendary',
        flavor: '你已经完全掌控了这个终端',
        obtained: false,
        obtainTime: null
      },
      'vault_visitor': {
        name: '金库访客',
        desc: '访问Vault加密页面',
        icon: '🔐',
        rarity: 'rare',
        flavor: '有些秘密需要密码才能解锁',
        obtained: false,
        obtainTime: null
      },
      'vault_unlocked': {
        name: '金库破解者',
        desc: '成功解锁Vault',
        icon: '🔓',
        rarity: 'legendary',
        flavor: '密码不是问题，好奇心才是钥匙',
        obtained: false,
        obtainTime: null
      },
      'ripple_player': {
        name: '波纹使者',
        desc: '体验互动波纹效果',
        icon: '🌊',
        rarity: 'common',
        flavor: '每一个点击都是涟漪的开始',
        obtained: false,
        obtainTime: null
      },
      'live2d_friend': {
        name: '二次元之友',
        desc: '与Live2D看板娘互动',
        icon: '🐱',
        rarity: 'common',
        flavor: '她一直在默默陪伴着你',
        obtained: false,
        obtainTime: null
      },
      'konami_code': {
        name: '秘籍大师',
        desc: '输入Konami秘籍代码',
        icon: '⬆️',
        rarity: 'epic',
        flavor: '上上下下左右左右BA',
        obtained: false,
        obtainTime: null
      },
      'settings_visitor': {
        name: '设置探索者',
        desc: '访问设置页面',
        icon: '⚙️',
        rarity: 'common',
        flavor: '个性化从这里开始',
        obtained: false,
        obtainTime: null
      },
      'all_games': {
        name: '游戏收藏家',
        desc: '玩过5种不同的游戏',
        icon: '🎲',
        rarity: 'epic',
        flavor: '游戏人生，人生游戏',
        obtained: false,
        obtainTime: null,
        progress: 0,
        target: 5,
        playedGames: []
      },
      'midnight_gamer': {
        name: '午夜玩家',
        desc: '在深夜玩游戏',
        icon: '🌙',
        rarity: 'rare',
        flavor: '深夜的游戏更有感觉',
        obtained: false,
        obtainTime: null
      },
      'quick_reader': {
        name: '速读达人',
        desc: '30秒内阅读完一篇文章',
        icon: '⚡',
        rarity: 'common',
        flavor: '一目十行不是梦',
        obtained: false,
        obtainTime: null
      },
      'deep_reader': {
        name: '深度阅读者',
        desc: '在同一篇文章停留超过5分钟',
        icon: '🧠',
        rarity: 'rare',
        flavor: '慢工出细活，深读出真知',
        obtained: false,
        obtainTime: null
      },
      'social_sharer': {
        name: '分享达人',
        desc: '分享博客内容',
        icon: '📤',
        rarity: 'rare',
        flavor: '好东西要和大家分享',
        obtained: false,
        obtainTime: null
      },
      'commentator': {
        name: '评论家',
        desc: '发表评论',
        icon: '💬',
        rarity: 'common',
        flavor: '你的声音很重要',
        obtained: false,
        obtainTime: null
      },
      'return_visitor': {
        name: '回头客',
        desc: '多次访问博客',
        icon: '🔄',
        rarity: 'common',
        flavor: '欢迎回来！',
        obtained: false,
        obtainTime: null,
        progress: 0,
        target: 3
      },
      'mobile_user': {
        name: '移动端用户',
        desc: '使用手机访问博客',
        icon: '📱',
        rarity: 'common',
        flavor: '随时随地，想看就看',
        obtained: false,
        obtainTime: null
      },
      'dark_mode': {
        name: '暗夜行者',
        desc: '使用深色模式浏览',
        icon: '🌙',
        rarity: 'common',
        flavor: '黑暗中自有光明',
        obtained: false,
        obtainTime: null
      },
      'all_common': {
        name: '普通收藏家',
        desc: '收集所有普通卡牌',
        icon: '⭐',
        rarity: 'rare',
        flavor: '平凡中见真章',
        obtained: false,
        obtainTime: null
      },
      'all_rare': {
        name: '稀有收藏家',
        desc: '收集所有稀有卡牌',
        icon: '💫',
        rarity: 'epic',
        flavor: '稀有之物，珍贵之心',
        obtained: false,
        obtainTime: null
      },
      'all_epic': {
        name: '史诗收藏家',
        desc: '收集所有史诗卡牌',
        icon: '🌟',
        rarity: 'legendary',
        flavor: '史诗级成就，传奇之路',
        obtained: false,
        obtainTime: null
      },
      'all_legendary': {
        name: '传说收藏家',
        desc: '收集所有传说卡牌',
        icon: '👑',
        rarity: 'legendary',
        flavor: '传说中的传说，巅峰的巅峰',
        obtained: false,
        obtainTime: null
      },
      'card_master': {
        name: '卡牌大师',
        desc: '收集所有卡牌',
        icon: '🃏',
        rarity: 'legendary',
        flavor: '你已经完成了这个收集之旅',
        obtained: false,
        obtainTime: null
      },
      'robots_txt': {
        name: '机器人侦探',
        desc: '发现robots.txt中的秘密',
        icon: '🤖',
        rarity: 'epic',
        flavor: '有些秘密藏在robots.txt里',
        obtained: false,
        obtainTime: null
      },
      'console_flag': {
        name: '控制台猎手',
        desc: '在控制台找到隐藏flag',
        icon: '🏴',
        rarity: 'legendary',
        flavor: 'flag{c0ns0l3_m4st3r_f0und}',
        obtained: false,
        obtainTime: null
      },
      'secret_hint': {
        name: '提示探索者',
        desc: '使用secret.hint()获取提示',
        icon: '💡',
        rarity: 'rare',
        flavor: '好奇心是最好的老师',
        obtained: false,
        obtainTime: null
      },
      'secret_flag': {
        name: 'Flag大师',
        desc: '使用secret.flag()获取flag',
        icon: '🎯',
        rarity: 'legendary',
        flavor: 'flag{wr0ld}',
        obtained: false,
        obtainTime: null
      },
      'payloader_user': {
        name: 'Payload生成器',
        desc: '使用Payloader功能',
        icon: '💉',
        rarity: 'rare',
        flavor: '生成你的专属Payload',
        obtained: false,
        obtainTime: null
      },
      'glitch_master': {
        name: '故障艺术家',
        desc: '开启故障特效',
        icon: '📺',
        rarity: 'rare',
        flavor: '故障也是一种美',
        obtained: false,
        obtainTime: null
      },
      'context_menu': {
        name: '自定义菜单',
        desc: '开启自定义右键菜单',
        icon: '🖱️',
        rarity: 'common',
        flavor: '右键也能自定义',
        obtained: false,
        obtainTime: null
      },
      'ripple_master': {
        name: '波纹大师',
        desc: '创建100个波纹',
        icon: '🌊',
        rarity: 'rare',
        flavor: '波纹疾走！',
        obtained: false,
        obtainTime: null,
        progress: 0,
        target: 100
      },
      'tetris_player': {
        name: '俄罗斯方块玩家',
        desc: '玩过俄罗斯方块',
        icon: '🧱',
        rarity: 'common',
        flavor: '经典永不过时',
        obtained: false,
        obtainTime: null
      },
      'snake_player': {
        name: '贪吃蛇玩家',
        desc: '玩过贪吃蛇',
        icon: '🐍',
        rarity: 'common',
        flavor: '越吃越长',
        obtained: false,
        obtainTime: null
      },
      'minesweeper_player': {
        name: '扫雷专家',
        desc: '玩过扫雷',
        icon: '💣',
        rarity: 'common',
        flavor: '小心翼翼',
        obtained: false,
        obtainTime: null
      },
      '2048_player': {
        name: '2048玩家',
        desc: '玩过2048',
        icon: '🔢',
        rarity: 'common',
        flavor: '合并合并再合并',
        obtained: false,
        obtainTime: null
      },
      'gobang_player': {
        name: '五子棋手',
        desc: '玩过五子棋',
        icon: '⚫',
        rarity: 'common',
        flavor: '五子连珠',
        obtained: false,
        obtainTime: null
      },
      'xiuxian_player': {
        name: '修仙者',
        desc: '玩过修仙游戏',
        icon: '🧙',
        rarity: 'rare',
        flavor: '道友请留步',
        obtained: false,
        obtainTime: null
      },
      'magictower_player': {
        name: '魔塔勇士',
        desc: '玩过魔塔',
        icon: '🏰',
        rarity: 'rare',
        flavor: '勇者斗恶龙',
        obtained: false,
        obtainTime: null
      },
      'source_code_reader': {
        name: '源码阅读者',
        desc: '查看页面源代码',
        icon: '📝',
        rarity: 'common',
        flavor: 'Ctrl+U是黑客的起点',
        obtained: false,
        obtainTime: null
      },
      'inspector': {
        name: '审查元素',
        desc: '使用开发者工具检查元素',
        icon: '🔍',
        rarity: 'common',
        flavor: 'F12打开新世界',
        obtained: false,
        obtainTime: null
      },
      'keyboard_master': {
        name: '键盘大师',
        desc: '使用快捷键操作',
        icon: '⌨️',
        rarity: 'rare',
        flavor: '快捷键让效率翻倍',
        obtained: false,
        obtainTime: null
      },
      'about_reader': {
        name: '了解站长',
        desc: '阅读关于页面',
        icon: '👤',
        rarity: 'common',
        flavor: '感谢你的关注',
        obtained: false,
        obtainTime: null
      },
      'archive_browser': {
        name: '档案馆访客',
        desc: '浏览归档页面',
        icon: '📚',
        rarity: 'common',
        flavor: '历史在这里沉淀',
        obtained: false,
        obtainTime: null
      },
      'tag_explorer': {
        name: '标签探索者',
        desc: '浏览标签页面',
        icon: '🏷️',
        rarity: 'common',
        flavor: '标签是知识的索引',
        obtained: false,
        obtainTime: null
      },
      'category_browser': {
        name: '分类浏览者',
        desc: '浏览分类页面',
        icon: '📂',
        rarity: 'common',
        flavor: '分类让知识有序',
        obtained: false,
        obtainTime: null
      },
      'search_user': {
        name: '搜索达人',
        desc: '使用搜索功能',
        icon: '🔎',
        rarity: 'common',
        flavor: '搜索是发现的关键',
        obtained: false,
        obtainTime: null
      },
      'all_games_master': {
        name: '游戏全满',
        desc: '玩过所有游戏',
        icon: '🏆',
        rarity: 'legendary',
        flavor: '游戏人生，人生游戏',
        obtained: false,
        obtainTime: null
      },
      'terminal_master': {
        name: '终端大师',
        desc: '在404终端执行20条命令',
        icon: '💻',
        rarity: 'epic',
        flavor: '命令行是你的武器',
        obtained: false,
        obtainTime: null,
        progress: 0,
        target: 20
      },
      'sql_master': {
        name: 'SQL注入专家',
        desc: '在404终端成功执行SQL注入',
        icon: '💉',
        rarity: 'legendary',
        flavor: 'flag{sql_1nj3ct10n_m4st3r_2024}',
        obtained: false,
        obtainTime: null
      },
      'hidden_comment': {
        name: '注释发现者',
        desc: '在HTML注释中发现秘密',
        icon: '💬',
        rarity: 'epic',
        flavor: '开发者留下的彩蛋',
        obtained: false,
        obtainTime: null
      },
      'easter_egg_hunter': {
        name: '彩蛋猎人',
        desc: '发现5个隐藏彩蛋',
        icon: '🥚',
        rarity: 'legendary',
        flavor: '彩蛋猎人的荣耀',
        obtained: false,
        obtainTime: null,
        progress: 0,
        target: 5
      },
      'lab_visitor': {
        name: '实验室访客',
        desc: '访问前端实验室',
        icon: '🔬',
        rarity: 'common',
        flavor: '探索前沿技术的实验场',
        obtained: false,
        obtainTime: null
      },
      'bruno_folio_visitor': {
        name: '3D探索者',
        desc: '体验Bruno Simon 3D作品集',
        icon: '🚗',
        rarity: 'rare',
        flavor: '驾驶汽车探索3D世界',
        obtained: false,
        obtainTime: null
      },
      'my_room_visitor': {
        name: '房间访客',
        desc: '参观3D房间场景',
        icon: '🏠',
        rarity: 'common',
        flavor: '欢迎来到我的小窝',
        obtained: false,
        obtainTime: null
      },
      'style_switcher': {
        name: '风格切换者',
        desc: '切换分类页面样式',
        icon: '🎨',
        rarity: 'common',
        flavor: '换个风格，换种心情',
        obtained: false,
        obtainTime: null
      },
      'layout_switcher': {
        name: '布局大师',
        desc: '切换文章布局方式',
        icon: '📐',
        rarity: 'common',
        flavor: '布局随心变',
        obtained: false,
        obtainTime: null
      }
    },
    
    rarityColors: {
      common: { bg: '#2d3748', border: '#4a5568', glow: '#718096', name: '普通' },
      rare: { bg: '#1a365d', border: '#3182ce', glow: '#63b3ed', name: '稀有' },
      epic: { bg: '#44337a', border: '#805ad5', glow: '#b794f4', name: '史诗' },
      legendary: { bg: '#744210', border: '#d69e2e', glow: '#f6e05e', name: '传说' }
    },
    
    totalCards: 0,
    obtainedCards: 0,
    readTime: 0,
    initialized: false,
    terminalFlags: {
      hidden_file: false,
      sql_injection: false,
      sudo: false,
      hidden_table: false
    },
    
    init: function() {
      if (this.initialized) return;
      this.initialized = true;
      
      this.loadProgress();
      this.checkFirstVisit();
      this.checkTimeAchievements();
      this.bindEvents();
      this.startTracking();
      this.checkCurrentPage();
      this.initConsoleEasterEgg();
      this.showWelcomeMessage();
      this.initTimeDisplay();
      this.initKonamiCode();
      this.checkDeviceType();
      this.checkTheme();
      this.updateUI();
    },
    
    loadProgress: function() {
      try {
        var saved = localStorage.getItem('cardCollection');
        if (saved) {
          var data = JSON.parse(saved);
          if (data.cards) {
            for (var key in data.cards) {
              if (this.cards[key]) {
                this.cards[key] = Object.assign(this.cards[key], data.cards[key]);
              }
            }
          }
          this.readTime = data.readTime || 0;
          this.terminalFlags = data.terminalFlags || this.terminalFlags;
        }
        
        this.totalCards = Object.keys(this.cards).length;
        this.obtainedCards = 0;
        for (var id in this.cards) {
          if (this.cards[id].obtained) this.obtainedCards++;
        }
      } catch(e) {
        console.warn('Card load error:', e);
      }
    },
    
    saveProgress: function() {
      try {
        localStorage.setItem('cardCollection', JSON.stringify({
          cards: this.cards,
          readTime: this.readTime,
          terminalFlags: this.terminalFlags
        }));
      } catch(e) {
        console.warn('Card save error:', e);
      }
    },
    
    obtainCard: function(id) {
      if (!this.cards[id]) return false;
      if (this.cards[id].obtained) return false;
      
      this.cards[id].obtained = true;
      this.cards[id].obtainTime = Date.now();
      this.obtainedCards++;
      this.saveProgress();
      this.showCardNotification(id);
      this.checkCollectionAchievements();
      this.updateUI();
      return true;
    },
    
    checkCollectionAchievements: function() {
      var byRarity = { common: 0, rare: 0, epic: 0, legendary: 0 };
      var totalByRarity = { common: 0, rare: 0, epic: 0, legendary: 0 };
      
      for (var id in this.cards) {
        var card = this.cards[id];
        totalByRarity[card.rarity]++;
        if (card.obtained) byRarity[card.rarity]++;
      }
      
      if (byRarity.common >= totalByRarity.common && totalByRarity.common > 0) {
        this.obtainCard('all_common');
      }
      if (byRarity.rare >= totalByRarity.rare && totalByRarity.rare > 0) {
        this.obtainCard('all_rare');
      }
      if (byRarity.epic >= totalByRarity.epic && totalByRarity.epic > 0) {
        this.obtainCard('all_epic');
      }
      if (byRarity.legendary >= totalByRarity.legendary && totalByRarity.legendary > 0) {
        this.obtainCard('all_legendary');
      }
      if (this.obtainedCards >= this.totalCards) {
        this.obtainCard('card_master');
      }
    },
    
    updateProgress: function(id, progress) {
      if (!this.cards[id]) return;
      if (this.cards[id].obtained) return;
      
      this.cards[id].progress = progress;
      
      if (this.cards[id].target && progress >= this.cards[id].target) {
        this.obtainCard(id);
      } else {
        this.saveProgress();
      }
    },
    
    incrementProgress: function(id, amount) {
      if (!this.cards[id]) return;
      if (this.cards[id].obtained) return;
      
      amount = amount || 1;
      var current = this.cards[id].progress || 0;
      this.updateProgress(id, current + amount);
    },
    
    showCardNotification: function(id) {
      var card = this.cards[id];
      if (!card) return;
      
      var rarity = this.rarityColors[card.rarity];
      
      var notification = document.createElement('div');
      notification.className = 'card-notification';
      notification.innerHTML = 
        '<div class="card-glow" style="background: ' + rarity.glow + ';"></div>' +
        '<div class="card-content">' +
          '<div class="card-rarity">' + rarity.name + '</div>' +
          '<div class="card-icon">' + card.icon + '</div>' +
          '<div class="card-info">' +
            '<div class="card-title">🃏 获得新卡牌!</div>' +
            '<div class="card-name">' + card.name + '</div>' +
            '<div class="card-desc">' + card.desc + '</div>' +
          '</div>' +
        '</div>';
      
      notification.style.cssText = 
        'position: fixed;' +
        'top: 20px;' +
        'right: 20px;' +
        'background: ' + rarity.bg + ';' +
        'border: 2px solid ' + rarity.border + ';' +
        'border-radius: 12px;' +
        'padding: 16px;' +
        'z-index: 99999;' +
        'animation: cardSlideIn 0.5s ease;' +
        'box-shadow: 0 0 30px ' + rarity.glow + '80;' +
        'font-family: system-ui, sans-serif;' +
        'overflow: hidden;' +
        'min-width: 280px;';
      
      var style = document.createElement('style');
      style.textContent = 
        '@keyframes cardSlideIn {' +
          'from { transform: translateX(100%) scale(0.8); opacity: 0; }' +
          'to { transform: translateX(0) scale(1); opacity: 1; }' +
        '}' +
        '@keyframes cardSlideOut {' +
          'from { transform: translateX(0) scale(1); opacity: 1; }' +
          'to { transform: translateX(100%) scale(0.8); opacity: 0; }' +
        '}' +
        '@keyframes cardGlow {' +
          '0%, 100% { opacity: 0.3; }' +
          '50% { opacity: 0.6; }' +
        '}' +
        '.card-glow {' +
          'position: absolute;' +
          'top: -50%;' +
          'left: -50%;' +
          'width: 200%;' +
          'height: 200%;' +
          'animation: cardGlow 2s infinite;' +
          'pointer-events: none;' +
        '}' +
        '.card-content { position: relative; z-index: 1; display: flex; align-items: center; gap: 12px; }' +
        '.card-rarity { position: absolute; top: -8px; right: 10px; font-size: 10px; color: ' + rarity.glow + '; text-transform: uppercase; letter-spacing: 1px; }' +
        '.card-icon { font-size: 40px; filter: drop-shadow(0 0 10px ' + rarity.glow + '); }' +
        '.card-title { font-size: 12px; color: ' + rarity.glow + '; margin-bottom: 4px; }' +
        '.card-name { font-size: 16px; color: #fff; font-weight: bold; }' +
        '.card-desc { font-size: 11px; color: #aaa; margin-top: 2px; }';
      
      if (!document.querySelector('#card-styles')) {
        style.id = 'card-styles';
        document.head.appendChild(style);
      }
      
      document.body.appendChild(notification);
      
      setTimeout(function() {
        notification.style.animation = 'cardSlideOut 0.5s ease forwards';
        setTimeout(function() {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 500);
      }, 4000);
    },
    
    showWelcomeMessage: function() {
      console.log('%c🔐 欢迎入侵本站!', 'color: #ff6b6b; font-size: 24px; font-weight: bold;');
      console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4ecdc4;');
      console.log('%c如果你能看到这条消息，说明你是个好奇的人。', 'color: #f7d794; font-size: 14px;');
      console.log('%c这个博客藏着一些秘密，你能找到吗？', 'color: #f7d794; font-size: 14px;');
      console.log('%c提示：试试输入 secret.hint()', 'color: #a29bfe; font-size: 12px;');
      console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4ecdc4;');
      
      this.obtainCard('hacker');
    },
    
    initConsoleEasterEgg: function() {
      var self = this;
      
      window.secret = window.secret || {};
      
      window.secret.hint = function() {
        self.obtainCard('console_explorer');
        self.obtainCard('secret_hint');
        console.log('%c🔍 线索 #1: 检查 robots.txt', 'color: #00ff00; font-size: 14px;');
        console.log('%c🔍 线索 #2: 查看 HTML 源码注释', 'color: #00ff00; font-size: 14px;');
        console.log('%c🔍 线索 #3: 访问 /404.html 玩终端游戏', 'color: #00ff00; font-size: 14px;');
        console.log('%c🔍 线索 #4: 尝试解锁 Vault', 'color: #00ff00; font-size: 14px;');
        console.log('%c🔍 线索 #5: 输入 secret.flag("your_answer")', 'color: #00ff00; font-size: 14px;');
        console.log('%c🔍 线索 #6: 站点名称就是答案 (小写)', 'color: #ffaa00; font-size: 14px;');
        return 'Follow the white rabbit... 🐰';
      };
      
      window.secret.flag = function(answer) {
        if (answer === 'wr0ld' || answer === 'WR0LD') {
          console.log('%c🎉 恭喜！你找到了隐藏的 flag!', 'color: #ffd700; font-size: 20px; font-weight: bold;');
          console.log('%cflag{w3lc0me_t0_wr0ld_bl0g}', 'color: #00ff00; font-size: 16px; font-family: monospace;');
          self.obtainCard('ctf_master');
          self.obtainCard('secret_flag');
          self.incrementEasterEgg();
          return '🏆 CTF Master Card Unlocked!';
        } else {
          console.log('%c❌ 答案不对，再想想？', 'color: #ff6b6b; font-size: 14px;');
          return 'Try again...';
        }
      };
      
      window.secret.cards = function() {
        self.showPanel();
        return 'Opening card collection...';
      };
      
      window.secret.time = function() {
        var hours = Math.floor(self.readTime / 3600);
        var mins = Math.floor((self.readTime % 3600) / 60);
        console.log('%c⏱️ 你已在本站停留: ' + hours + '小时 ' + mins + '分钟', 'color: #4ecdc4; font-size: 14px;');
        return hours + 'h ' + mins + 'm';
      };
      
      window.secret.terminalFlag = function(flagType) {
        if (self.terminalFlags.hasOwnProperty(flagType)) {
          self.terminalFlags[flagType] = true;
          self.saveProgress();
          
          var cardMap = {
            hidden_file: 'terminal_hidden_file',
            sql_injection: 'terminal_sql_injection',
            sudo: 'terminal_sudo',
            hidden_table: 'terminal_hidden_table'
          };
          
          if (cardMap[flagType]) {
            self.obtainCard(cardMap[flagType]);
            self.incrementEasterEgg();
          }
          
          var allFound = Object.values(self.terminalFlags).every(function(v) { return v; });
          if (allFound) {
            self.obtainCard('terminal_all_flags');
          }
          
          return 'Flag recorded: ' + flagType;
        }
        return 'Unknown flag type';
      };
      
      window.secret.vault = function() {
        self.obtainCard('vault_unlocked');
        self.incrementEasterEgg();
        return 'Vault unlocked!';
      };
      
      window.secret.robots = function() {
        self.obtainCard('robots_txt');
        self.incrementEasterEgg();
        return 'robots.txt secret found!';
      };
      
      window.secret.terminalCommand = function() {
        self.incrementProgress('terminal_master');
      };
      
      window.secret.playGame = function(gameName) {
        var gameCards = {
          'tetris': 'tetris_player',
          'snake': 'snake_player',
          'minesweeper': 'minesweeper_player',
          '2048': '2048_player',
          'gobang': 'gobang_player',
          'xiuxian': 'xiuxian_player',
          'magictower': 'magictower_player'
        };
        
        if (gameCards[gameName]) {
          self.obtainCard(gameCards[gameName]);
        }
        
        if (self.cards.all_games.playedGames && !self.cards.all_games.playedGames.includes(gameName)) {
          self.cards.all_games.playedGames.push(gameName);
          self.incrementProgress('all_games');
        }
      };
      
      window.secret.ripple = function() {
        self.incrementProgress('ripple_master');
      };
      
      window.secret.styleSwitch = function() {
        self.obtainCard('style_switcher');
      };
      
      window.secret.layoutSwitch = function() {
        self.obtainCard('layout_switcher');
      };
      
      window.secret.incrementEasterEgg = function() {
        self.incrementEasterEgg();
      };
    },
    
    incrementEasterEgg: function() {
      this.incrementProgress('easter_egg_hunter');
    },
    
    initKonamiCode: function() {
      var self = this;
      var konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
      var konamiIndex = 0;
      
      document.addEventListener('keydown', function(e) {
        if (e.code === konamiCode[konamiIndex]) {
          konamiIndex++;
          if (konamiIndex === konamiCode.length) {
            self.obtainCard('konami_code');
            console.log('%c🎮 KONAMI CODE ACTIVATED!', 'color: #ffd700; font-size: 20px; font-weight: bold;');
            konamiIndex = 0;
          }
        } else {
          konamiIndex = 0;
        }
      });
    },
    
    checkDeviceType: function() {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        this.obtainCard('mobile_user');
      }
    },
    
    checkTheme: function() {
      var self = this;
      
      function checkDarkMode() {
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
                     document.documentElement.classList.contains('dark') ||
                     window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
          self.obtainCard('dark_mode');
        }
      }
      
      checkDarkMode();
      
      var observer = new MutationObserver(function() {
        checkDarkMode();
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    },
    
    initTimeDisplay: function() {
      var self = this;
      
      var footer = document.querySelector('footer') || document.querySelector('.footer') || document.querySelector('#footer');
      if (!footer) return;
      
      var timeContainer = document.createElement('div');
      timeContainer.id = 'time-widget';
      timeContainer.className = 'footer-time-info';
      timeContainer.innerHTML = 
        '<span class="footer-clock">🕐 <span id="footer-time">--:--:--</span></span>' +
        '<span class="footer-divider">|</span>' +
        '<span class="footer-stat">⏱️ <span id="footer-online">0h 0m</span></span>' +
        '<span class="footer-divider">|</span>' +
        '<span class="footer-stat">🃏 <span id="footer-cards">0/0</span></span>';
      
      footer.insertBefore(timeContainer, footer.firstChild);
      
      if (localStorage.getItem('timeWidget') !== 'true') {
        timeContainer.style.display = 'none';
      }
      
      function updateTime() {
        var isEnabled = localStorage.getItem('timeWidget') === 'true';
        timeContainer.style.display = isEnabled ? 'flex' : 'none';
        
        if (!isEnabled) return;
        
        var now = new Date();
        var hours = Math.floor(self.readTime / 3600);
        var mins = Math.floor((self.readTime % 3600) / 60);
        var secs = self.readTime % 60;
        
        var currentTime = now.toLocaleTimeString('zh-CN', { hour12: false });
        
        document.getElementById('footer-time').textContent = currentTime;
        document.getElementById('footer-online').textContent = hours + 'h ' + mins + 'm ' + secs + 's';
        document.getElementById('footer-cards').textContent = self.obtainedCards + '/' + self.totalCards;
      }
      
      updateTime();
      setInterval(updateTime, 1000);
      
      if (!document.getElementById('time-widget-styles')) {
        var style = document.createElement('style');
        style.id = 'time-widget-styles';
        style.textContent = 
          '.footer-time-info {' +
            'display: flex;' +
            'align-items: center;' +
            'justify-content: center;' +
            'gap: 12px;' +
            'padding: 8px 0;' +
            'font-family: Consolas, "Courier New", monospace;' +
            'font-size: 12px;' +
            'color: var(--text-p3, #888);' +
            'border-bottom: 1px solid var(--border, #333);' +
            'margin-bottom: 8px;' +
          '}' +
          '.footer-time-info .footer-clock {' +
            'color: var(--theme, #3498db) !important;' +
          '}' +
          '.footer-time-info .footer-divider {' +
            'color: var(--text-p3, #666);' +
          '}' +
          '.footer-time-info .footer-stat {' +
            'color: var(--text-p2, #aaa) !important;' +
          '}' +
          '[data-theme="dark"] .footer-time-info,' +
          'html.dark .footer-time-info {' +
            'color: #aaa;' +
            'border-bottom-color: #444;' +
          '}' +
          '[data-theme="dark"] .footer-time-info .footer-divider,' +
          'html.dark .footer-time-info .footer-divider {' +
            'color: #555;' +
          '}' +
          '@media (max-width: 768px) {' +
            '.footer-time-info { flex-wrap: wrap; gap: 8px; font-size: 11px; }' +
            '.footer-time-info .footer-divider { display: none; }' +
          '}';
        document.head.appendChild(style);
      }
    },
    
    checkFirstVisit: function() {
      var visitCount = parseInt(localStorage.getItem('visitCount') || '0') + 1;
      localStorage.setItem('visitCount', visitCount.toString());
      
      if (visitCount === 1) {
        this.obtainCard('first_visit');
      }
      
      if (visitCount >= 3) {
        this.obtainCard('return_visitor');
      }
    },
    
    checkTimeAchievements: function() {
      var hour = new Date().getHours();
      
      if (hour >= 0 && hour < 4) {
        this.obtainCard('night_owl');
      }
      
      if (hour >= 5 && hour < 7) {
        this.obtainCard('early_bird');
      }
      
      this.checkStreak();
    },
    
    checkStreak: function() {
      var today = new Date().toDateString();
      var lastVisit = this.cards.week_warrior.lastVisit;
      
      if (lastVisit && lastVisit !== today) {
        var lastDate = new Date(lastVisit);
        var todayDate = new Date(today);
        var diffTime = todayDate - lastDate;
        var diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          this.cards.week_warrior.streak = (this.cards.week_warrior.streak || 0) + 1;
        } else if (diffDays > 1) {
          this.cards.week_warrior.streak = 1;
        }
      } else if (!lastVisit) {
        this.cards.week_warrior.streak = 1;
      }
      
      this.cards.week_warrior.lastVisit = today;
      
      if (this.cards.week_warrior.streak >= 7) {
        this.obtainCard('week_warrior');
      }
      
      this.saveProgress();
    },
    
    checkCurrentPage: function() {
      var href = window.location.pathname;
      
      if (this.cards.explorer.pages.includes(href)) {
        if (!this.cards.explorer.visited.includes(href)) {
          this.cards.explorer.visited.push(href);
          if (this.cards.explorer.visited.length >= this.cards.explorer.pages.length) {
            this.obtainCard('explorer');
          }
          this.saveProgress();
        }
      }
      
      if (href.includes('/posts/') || href.includes('/post/') || document.querySelector('article.post, article.md-text')) {
        this.trackReading();
      }
      
      if (href.includes('/games/') || href === '/games/') {
        this.obtainCard('gamer');
      }
      
      if (href.includes('/games/tetris')) {
        this.obtainCard('tetris_player');
      }
      
      if (href.includes('/games/snake')) {
        this.obtainCard('snake_player');
      }
      
      if (href.includes('/games/minesweeper')) {
        this.obtainCard('minesweeper_player');
      }
      
      if (href.includes('/games/2048')) {
        this.obtainCard('2048_player');
      }
      
      if (href.includes('/games/gobang')) {
        this.obtainCard('gobang_player');
      }
      
      if (href.includes('/games/xiuxian')) {
        this.obtainCard('xiuxian_player');
      }
      
      if (href.includes('/games/magictower')) {
        this.obtainCard('magictower_player');
      }
      
      if (href.includes('/divination/')) {
        this.obtainCard('divination_master');
      }
      
      if (href.includes('/calculator/')) {
        this.obtainCard('calculator_user');
      }
      
      if (href.includes('/404') || href === '/404.html') {
        this.obtainCard('terminal_404');
      }
      
      if (href.includes('/vault/')) {
        this.obtainCard('vault_visitor');
      }
      
      if (href.includes('/interactive-ripple')) {
        this.obtainCard('ripple_player');
      }
      
      if (href.includes('/settings/')) {
        this.obtainCard('settings_visitor');
      }
      
      if (href.includes('/payloader/')) {
        this.obtainCard('payloader_user');
      }
      
      if (href.includes('/about')) {
        this.obtainCard('about_reader');
      }
      
      if (href.includes('/archives')) {
        this.obtainCard('archive_browser');
      }
      
      if (href.includes('/tags')) {
        this.obtainCard('tag_explorer');
      }
      
      if (href.includes('/categories')) {
        this.obtainCard('category_browser');
      }
      
      if (href === '/robots.txt') {
        this.obtainCard('robots_txt');
        this.incrementEasterEgg();
      }
      
      if (href.includes('/lab') || href === '/lab/') {
        this.obtainCard('lab_visitor');
      }
      
      if (href.includes('/lab/bruno-simon-folio')) {
        this.obtainCard('bruno_folio_visitor');
      }
      
      if (href.includes('/lab/my-room-in-3d')) {
        this.obtainCard('my_room_visitor');
      }
    },
    
    trackReading: function() {
      this.incrementProgress('reader_10');
      this.incrementProgress('reader_50');
      
      var self = this;
      var startTime = Date.now();
      
      document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') {
          var readDuration = (Date.now() - startTime) / 1000;
          if (readDuration >= 300) {
            self.obtainCard('deep_reader');
          } else if (readDuration <= 30 && readDuration >= 5) {
            self.obtainCard('quick_reader');
          }
        }
      });
    },
    
    bindEvents: function() {
      var self = this;
      
      document.addEventListener('click', function(e) {
        self.incrementProgress('clicker');
        
        var gameCard = e.target.closest('.game-card, [data-game], .game-item, .game-btn');
        if (gameCard) {
          self.obtainCard('gamer');
          
          var gameHref = gameCard.href || gameCard.dataset.game || '';
          if (self.cards.all_games.playedGames && !self.cards.all_games.playedGames.includes(gameHref)) {
            self.cards.all_games.playedGames.push(gameHref);
            self.incrementProgress('all_games');
          }
          
          var hour = new Date().getHours();
          if (hour >= 22 || hour < 6) {
            self.obtainCard('midnight_gamer');
          }
        }
        
        var postLink = e.target.closest('a[href*="/posts/"], a[href*="/post/"]');
        if (postLink) {
          self.trackReading();
        }
        
        var shareBtn = e.target.closest('[data-share], .share-btn, .social-share');
        if (shareBtn) {
          self.obtainCard('social_sharer');
        }
        
        var commentBtn = e.target.closest('.comment-btn, [data-comment], #comment-form');
        if (commentBtn) {
          self.obtainCard('commentator');
        }
        
        var live2d = e.target.closest('#waifu, .waifu, #live2d-widget');
        if (live2d) {
          self.obtainCard('live2d_friend');
        }
      }, true);
      
      document.addEventListener('scroll', function() {
        var scrollY = window.scrollY || document.documentElement.scrollTop;
        self.updateProgress('scroller', scrollY);
      });
      
      document.addEventListener('copy', function() {
        var selection = window.getSelection().toString();
        if (selection.length > 20 && document.querySelector('pre code, .highlight')) {
          self.incrementProgress('code_master');
        }
      });
      
      document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
          if (e.key === 'u' || e.key === 'U') {
            self.obtainCard('source_code_reader');
          }
          if (e.key === 'f' || e.key === 'F') {
            self.obtainCard('search_user');
          }
          if (e.shiftKey && (e.key === 'i' || e.key === 'I')) {
            self.obtainCard('inspector');
          }
        }
        
        if (e.key === 'F12') {
          self.obtainCard('inspector');
        }
        
        if (e.ctrlKey || e.metaKey || e.altKey) {
          self.obtainCard('keyboard_master');
        }
      });
      
      var searchInput = document.querySelector('input[type="search"], .search-input, #search-input');
      if (searchInput) {
        searchInput.addEventListener('focus', function() {
          self.obtainCard('search_user');
        });
      }
    },
    
    startTracking: function() {
      var self = this;
      
      setInterval(function() {
        self.readTime++;
        self.updateProgress('dedicated_reader', self.readTime);
      }, 1000);
    },
    
    showPanel: function() {
      var existing = document.getElementById('card-panel');
      if (existing) {
        existing.remove();
        return;
      }
      
      var panel = document.createElement('div');
      panel.id = 'card-panel';
      
      var html = '<div class="card-panel-overlay"></div><div class="card-panel-content">';
      html += '<div class="card-panel-header"><h2>🃏 卡牌收集</h2><span class="card-close">&times;</span></div>';
      html += '<div class="card-panel-stats">';
      html += '<span>收集进度: ' + this.obtainedCards + '/' + this.totalCards + '</span>';
      html += '<span>停留时间: ' + Math.floor(this.readTime / 60) + '分钟</span>';
      html += '</div>';
      html += '<div class="card-panel-filters">';
      html += '<button class="card-filter active" data-filter="all">全部</button>';
      html += '<button class="card-filter" data-filter="common">普通</button>';
      html += '<button class="card-filter" data-filter="rare">稀有</button>';
      html += '<button class="card-filter" data-filter="epic">史诗</button>';
      html += '<button class="card-filter" data-filter="legendary">传说</button>';
      html += '<button class="card-filter" data-filter="obtained">已获得</button>';
      html += '<button class="card-filter" data-filter="missing">未获得</button>';
      html += '</div>';
      html += '<div class="card-panel-grid">';
      
      for (var id in this.cards) {
        var card = this.cards[id];
        var rarity = this.rarityColors[card.rarity];
        var obtainedClass = card.obtained ? 'obtained' : 'locked';
        
        html += '<div class="card-item ' + obtainedClass + '" data-rarity="' + card.rarity + '" data-obtained="' + card.obtained + '">';
        html += '<div class="card-inner" style="border-color: ' + rarity.border + '; background: ' + (card.obtained ? rarity.bg : '#1a1a1a') + ';">';
        html += '<div class="card-rarity-badge" style="color: ' + rarity.glow + ';">' + rarity.name + '</div>';
        html += '<div class="card-icon">' + (card.obtained ? card.icon : '❓') + '</div>';
        html += '<div class="card-name">' + (card.obtained ? card.name : '???') + '</div>';
        html += '<div class="card-desc">' + (card.obtained ? card.desc : '尚未解锁') + '</div>';
        if (card.flavor && card.obtained) {
          html += '<div class="card-flavor">' + card.flavor + '</div>';
        }
        if (card.target && !card.obtained) {
          var progress = card.progress || 0;
          var percent = Math.min(100, (progress / card.target) * 100);
          html += '<div class="card-progress"><div class="progress-bar" style="width: ' + percent + '%;"></div></div>';
          html += '<div class="card-progress-text">' + progress + '/' + card.target + '</div>';
        }
        html += '</div></div>';
      }
      
      html += '</div></div>';
      panel.innerHTML = html;
      
      panel.style.cssText = 
        'position: fixed;' +
        'top: 0;' +
        'left: 0;' +
        'width: 100%;' +
        'height: 100%;' +
        'z-index: 999999;' +
        'font-family: system-ui, sans-serif;';
      
      var style = document.createElement('style');
      style.textContent = 
        '.card-panel-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); }' +
        '.card-panel-content { position: relative; max-width: 900px; margin: 0 auto; padding: 20px; max-height: 90vh; overflow-y: auto; }' +
        '.card-panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }' +
        '.card-panel-header h2 { color: #fff; margin: 0; }' +
        '.card-close { color: #fff; font-size: 28px; cursor: pointer; }' +
        '.card-panel-stats { display: flex; gap: 20px; margin-bottom: 15px; color: #aaa; }' +
        '.card-panel-filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }' +
        '.card-filter { background: #333; border: 1px solid #555; color: #aaa; padding: 6px 12px; border-radius: 4px; cursor: pointer; }' +
        '.card-filter.active { background: #4a5568; color: #fff; border-color: #718096; }' +
        '.card-panel-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px; }' +
        '.card-item { perspective: 1000px; }' +
        '.card-inner { border-radius: 12px; padding: 15px; text-align: center; min-height: 180px; display: flex; flex-direction: column; justify-content: center; }' +
        '.card-item.locked .card-inner { opacity: 0.6; filter: grayscale(0.5); }' +
        '.card-rarity-badge { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }' +
        '.card-icon { font-size: 36px; margin-bottom: 8px; }' +
        '.card-name { color: #fff; font-weight: bold; margin-bottom: 4px; }' +
        '.card-desc { color: #aaa; font-size: 11px; margin-bottom: 8px; }' +
        '.card-flavor { color: #666; font-size: 10px; font-style: italic; }' +
        '.card-progress { height: 4px; background: #333; border-radius: 2px; margin-top: 8px; }' +
        '.progress-bar { height: 100%; background: #4ecdc4; border-radius: 2px; }' +
        '.card-progress-text { color: #666; font-size: 10px; margin-top: 4px; }';
      
      if (!document.querySelector('#card-panel-styles')) {
        style.id = 'card-panel-styles';
        document.head.appendChild(style);
      }
      
      document.body.appendChild(panel);
      
      var self = this;
      panel.querySelector('.card-close').addEventListener('click', function() { panel.remove(); });
      panel.querySelector('.card-panel-overlay').addEventListener('click', function() { panel.remove(); });
      
      panel.querySelectorAll('.card-filter').forEach(function(btn) {
        btn.addEventListener('click', function() {
          panel.querySelectorAll('.card-filter').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          
          var filter = btn.dataset.filter;
          panel.querySelectorAll('.card-item').forEach(function(item) {
            var show = false;
            if (filter === 'all') show = true;
            else if (filter === 'obtained') show = item.dataset.obtained === 'true';
            else if (filter === 'missing') show = item.dataset.obtained === 'false';
            else show = item.dataset.rarity === filter;
            item.style.display = show ? 'block' : 'none';
          });
        });
      });
    },
    
    updateUI: function() {
      var counters = document.querySelectorAll('.card-counter');
      counters.forEach(function(counter) {
        counter.textContent = this.obtainedCards + '/' + this.totalCards;
      }.bind(this));
    }
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { CardSystem.init(); });
  } else {
    CardSystem.init();
  }
  
  window.CardSystem = CardSystem;
})();
