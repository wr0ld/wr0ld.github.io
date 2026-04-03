(function() {
  'use strict';
  
  var CustomContextMenu = {
    enabled: false,
    menu: null,
    targetElement: null,
    
    init: function() {
      this.loadSettings();
      this.createMenu();
      this.bindEvents();
    },
    
    loadSettings: function() {
      var saved = localStorage.getItem('customContextMenu');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    },
    
    saveSettings: function() {
      localStorage.setItem('customContextMenu', this.enabled.toString());
    },
    
    toggle: function() {
      this.enabled = !this.enabled;
      this.saveSettings();
      if (!this.enabled) {
        this.hideMenu();
      }
    },
    
    createMenu: function() {
      var self = this;
      
      this.menu = document.createElement('div');
      this.menu.className = 'custom-context-menu';
      this.menu.innerHTML = 
        '<div class="menu-item" data-action="base64">' +
          '<span class="menu-icon">🔐</span>' +
          '<span class="menu-text">Base64 Encode</span>' +
        '</div>' +
        '<div class="menu-item" data-action="exploitdb">' +
          '<span class="menu-icon">🔍</span>' +
          '<span class="menu-text">Search in Exploit-DB</span>' +
        '</div>' +
        '<div class="menu-item" data-action="raw">' +
          '<span class="menu-icon">📄</span>' +
          '<span class="menu-text">View Raw Payload</span>' +
        '</div>' +
        '<div class="menu-divider"></div>' +
        '<div class="menu-item" data-action="copy">' +
          '<span class="menu-icon">📋</span>' +
          '<span class="menu-text">Copy Code</span>' +
        '</div>';
      
      document.body.appendChild(this.menu);
      
      this.menu.querySelectorAll('.menu-item').forEach(function(item) {
        item.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          self.handleAction(this.dataset.action);
          self.hideMenu();
        });
      });
    },
    
    bindEvents: function() {
      var self = this;
      
      document.addEventListener('contextmenu', function(e) {
        if (!self.enabled) return;
        
        var codeBlock = e.target.closest('.highlight, pre code, .code');
        if (codeBlock) {
          e.preventDefault();
          self.targetElement = codeBlock;
          self.showMenu(e.clientX, e.clientY);
        }
      });
      
      document.addEventListener('click', function(e) {
        if (!self.menu.contains(e.target)) {
          self.hideMenu();
        }
      });
      
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          self.hideMenu();
        }
      });
    },
    
    showMenu: function(x, y) {
      this.menu.style.left = x + 'px';
      this.menu.style.top = y + 'px';
      this.menu.classList.add('visible');
      
      var rect = this.menu.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        this.menu.style.left = (window.innerWidth - rect.width - 10) + 'px';
      }
      if (rect.bottom > window.innerHeight) {
        this.menu.style.top = (window.innerHeight - rect.height - 10) + 'px';
      }
    },
    
    hideMenu: function() {
      this.menu.classList.remove('visible');
    },
    
    getCode: function() {
      if (!this.targetElement) return '';
      
      var code = this.targetElement.querySelector('code');
      if (code) {
        return code.textContent || code.innerText;
      }
      
      if (this.targetElement.tagName === 'CODE') {
        return this.targetElement.textContent || this.targetElement.innerText;
      }
      
      return this.targetElement.textContent || this.targetElement.innerText;
    },
    
    handleAction: function(action) {
      var code = this.getCode();
      
      switch (action) {
        case 'base64':
          this.base64Encode(code);
          break;
        case 'exploitdb':
          this.searchExploitDB(code);
          break;
        case 'raw':
          this.viewRawPayload(code);
          break;
        case 'copy':
          this.copyCode(code);
          break;
      }
    },
    
    base64Encode: function(text) {
      try {
        var encoded = btoa(unescape(encodeURIComponent(text)));
        this.showResult('Base64 Encoded', encoded);
        this.copyToClipboard(encoded);
      } catch (e) {
        alert('Base64 encoding failed: ' + e.message);
      }
    },
    
    searchExploitDB: function(text) {
      var keywords = text.trim().split(/\s+/).slice(0, 3).join(' ');
      var url = 'https://www.exploit-db.com/search?q=' + encodeURIComponent(keywords);
      window.open(url, '_blank');
    },
    
    viewRawPayload: function(text) {
      var modal = document.createElement('div');
      modal.className = 'raw-payload-modal';
      modal.innerHTML = 
        '<div class="modal-overlay"></div>' +
        '<div class="modal-content">' +
          '<div class="modal-header">' +
            '<h3>📄 Raw Payload</h3>' +
            '<button class="modal-close">&times;</button>' +
          '</div>' +
          '<div class="modal-body">' +
            '<textarea readonly>' + this.escapeHtml(text) + '</textarea>' +
          '</div>' +
          '<div class="modal-footer">' +
            '<button class="copy-btn">📋 Copy</button>' +
            '<button class="close-btn">Close</button>' +
          '</div>' +
        '</div>';
      
      document.body.appendChild(modal);
      
      var self = this;
      modal.querySelector('.modal-overlay').addEventListener('click', function() {
        document.body.removeChild(modal);
      });
      
      modal.querySelector('.modal-close').addEventListener('click', function() {
        document.body.removeChild(modal);
      });
      
      modal.querySelector('.close-btn').addEventListener('click', function() {
        document.body.removeChild(modal);
      });
      
      modal.querySelector('.copy-btn').addEventListener('click', function() {
        self.copyToClipboard(text);
        this.textContent = '✅ Copied!';
        setTimeout(function() {
          this.textContent = '📋 Copy';
        }.bind(this), 2000);
      });
    },
    
    copyCode: function(text) {
      this.copyToClipboard(text);
      this.showToast('📋 Code copied to clipboard!');
    },
    
    copyToClipboard: function(text) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    },
    
    showResult: function(title, content) {
      this.showToast('✅ ' + title + ' - Copied to clipboard!');
    },
    
    showToast: function(message) {
      var toast = document.createElement('div');
      toast.className = 'context-menu-toast';
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(function() {
        toast.classList.add('fade-out');
        setTimeout(function() {
          document.body.removeChild(toast);
        }, 300);
      }, 2000);
    },
    
    escapeHtml: function(text) {
      var div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  };
  
  window.CustomContextMenu = CustomContextMenu;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      CustomContextMenu.init();
    });
  } else {
    CustomContextMenu.init();
  }
})();
