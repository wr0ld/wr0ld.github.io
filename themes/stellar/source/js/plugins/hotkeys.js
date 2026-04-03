(function() {
  'use strict';
  
  var Hotkeys = {
    enabled: true,
    keyBuffer: '',
    keyTimeout: null,
    keyTimeoutMs: 500,
    hintBar: null,
    shortcuts: {
      'gh': { action: 'goHome', desc: '回到首页' },
      'ga': { action: 'goArchives', desc: '归档页面' },
      'gc': { action: 'goCategories', desc: '分类页面' },
      'gt': { action: 'goTags', desc: '标签页面' },
      'gs': { action: 'goSettings', desc: '设置页面' },
      'gg': { action: 'goGames', desc: '游戏中心' },
      '/': { action: 'openSearch', desc: '打开搜索' },
      't': { action: 'toggleTheme', desc: '切换主题' },
      'k': { action: 'showHelp', desc: '显示快捷键帮助' },
      '?': { action: 'showHelp', desc: '显示快捷键帮助' },
      'esc': { action: 'closeModal', desc: '关闭弹窗' }
    },
    
    init: function() {
      this.loadSettings();
      if (!this.enabled) return;
      
      this.createHintBar();
      this.bindEvents();
    },
    
    loadSettings: function() {
      var saved = localStorage.getItem('hotkeysEnabled');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    },
    
    saveSettings: function() {
      localStorage.setItem('hotkeysEnabled', this.enabled.toString());
    },
    
    toggle: function() {
      this.enabled = !this.enabled;
      this.saveSettings();
      if (this.hintBar) {
        this.hintBar.style.display = this.enabled ? 'flex' : 'none';
      }
    },
    
    createHintBar: function() {
    },
    
    bindEvents: function() {
      var self = this;
      
      document.addEventListener('keydown', function(e) {
        if (!self.enabled) return;
        
        if (e.target.tagName === 'INPUT' || 
            e.target.tagName === 'TEXTAREA' || 
            e.target.isContentEditable) {
          return;
        }
        
        var key = e.key.toLowerCase();
        
        if (key === 'escape') {
          self.executeAction('closeModal');
          return;
        }
        
        if (key.length === 1) {
          self.keyBuffer += key;
          
          if (self.keyTimeout) {
            clearTimeout(self.keyTimeout);
          }
          
          self.keyTimeout = setTimeout(function() {
            self.keyBuffer = '';
          }, self.keyTimeoutMs);
          
          self.checkShortcuts();
        }
      });
    },
    
    checkShortcuts: function() {
      var buffer = this.keyBuffer;
      
      for (var combo in this.shortcuts) {
        if (buffer.endsWith(combo)) {
          this.executeAction(this.shortcuts[combo].action);
          this.keyBuffer = '';
          return;
        }
      }
    },
    
    executeAction: function(action) {
      switch (action) {
        case 'goHome':
          window.location.href = '/';
          break;
        case 'goArchives':
          window.location.href = '/archives/';
          break;
        case 'goCategories':
          window.location.href = '/categories/';
          break;
        case 'goTags':
          window.location.href = '/tags/';
          break;
        case 'goSettings':
          window.location.href = '/settings/';
          break;
        case 'goGames':
          window.location.href = '/games/';
          break;
        case 'openSearch':
          this.openSearch();
          break;
        case 'toggleTheme':
          this.toggleTheme();
          break;
        case 'showHelp':
          this.showHelp();
          break;
        case 'closeModal':
          this.closeModal();
          break;
      }
    },
    
    openSearch: function() {
      var searchInput = document.querySelector('.search-input, #search-input, input[type="search"]');
      if (searchInput) {
        searchInput.focus();
      } else {
        var searchBtn = document.querySelector('.search-btn, [data-search]');
        if (searchBtn) {
          searchBtn.click();
        }
      }
    },
    
    toggleTheme: function() {
      var html = document.documentElement;
      var currentTheme = html.getAttribute('data-theme') || 'dark';
      var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      if (window.TerminalCopy) {
        window.TerminalCopy.showToast('主题已切换为: ' + newTheme, 'success');
      }
    },
    
    showHelp: function() {
      var existing = document.querySelector('.hotkey-help-modal');
      if (existing) {
        existing.remove();
        return;
      }
      
      var modal = document.createElement('div');
      modal.className = 'hotkey-help-modal';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      `;
      
      var content = document.createElement('div');
      content.style.cssText = `
        background: var(--card, #2a2a2a);
        border: 1px solid var(--theme, #3498db);
        border-radius: 12px;
        padding: 24px;
        max-width: 450px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      `;
      
      var html = '<h3 style="margin: 0 0 16px; color: var(--theme, #3498db);">⌨️ 快捷键帮助</h3>';
      html += '<div style="display: grid; gap: 8px;">';
      
      for (var combo in this.shortcuts) {
        var shortcut = this.shortcuts[combo];
        html += `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <kbd style="background: var(--theme, #3498db); color: #fff; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">${combo.toUpperCase()}</kbd>
            <span style="color: var(--text, #fff); font-size: 13px;">${shortcut.desc}</span>
          </div>
        `;
      }
      
      html += '</div>';
      
      html += '<div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border, #333);">';
      html += '<h4 style="margin: 0 0 12px; color: var(--text, #fff); font-size: 14px;">🔐 快捷入口</h4>';
      html += '<div style="display: grid; gap: 10px;">';
      html += '<a href="/vault/" style="display: flex; align-items: center; gap: 10px; padding: 12px; background: rgba(0, 255, 136, 0.1); border: 1px solid rgba(0, 255, 136, 0.3); border-radius: 8px; color: #00ff88; text-decoration: none; transition: all 0.2s;" onmouseover="this.style.background=\'rgba(0, 255, 136, 0.2)\'" onmouseout="this.style.background=\'rgba(0, 255, 136, 0.1)\'">';
      html += '<span style="font-size: 20px;">🔐</span>';
      html += '<div>';
      html += '<div style="font-weight: 600;">Secure Vault</div>';
      html += '<div style="font-size: 11px; opacity: 0.7;">加密保险库</div>';
      html += '</div></a>';
      html += '<a href="/payloader/" style="display: flex; align-items: center; gap: 10px; padding: 12px; background: rgba(52, 152, 219, 0.1); border: 1px solid rgba(52, 152, 219, 0.3); border-radius: 8px; color: #3498db; text-decoration: none; transition: all 0.2s;" onmouseover="this.style.background=\'rgba(52, 152, 219, 0.2)\'" onmouseout="this.style.background=\'rgba(52, 152, 219, 0.1)\'">';
      html += '<span style="font-size: 20px;">🚀</span>';
      html += '<div>';
      html += '<div style="font-weight: 600;">Payloader</div>';
      html += '<div style="font-size: 11px; opacity: 0.7;">安全载荷平台</div>';
      html += '</div></a>';
      html += '</div></div>';
      
      html += '<p style="margin: 16px 0 0; color: var(--text-p3, #888); font-size: 12px; text-align: center;">按 ESC 或点击任意位置关闭</p>';
      
      content.innerHTML = html;
      modal.appendChild(content);
      document.body.appendChild(modal);
      
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          modal.remove();
        }
      });
    },
    
    closeModal: function() {
      var modal = document.querySelector('.hotkey-help-modal, .modal, [role="dialog"]');
      if (modal) {
        modal.remove();
      }
    }
  };
  
  window.Hotkeys = Hotkeys;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      Hotkeys.init();
    });
  } else {
    Hotkeys.init();
  }
})();
