(function() {
  'use strict';
  
  var TerminalCopy = {
    init: function() {
      this.overrideCopy();
      this.createStyles();
    },
    
    createStyles: function() {
      var style = document.createElement('style');
      style.textContent = `
        .terminal-toast {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #1a1a2e;
          border: 1px solid #00ff00;
          border-radius: 4px;
          padding: 10px 20px;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 13px;
          color: #00ff00;
          z-index: 10000;
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
          animation: terminalFadeIn 0.3s ease;
        }
        
        .terminal-toast .prefix {
          color: #00ff00;
          margin-right: 8px;
        }
        
        .terminal-toast .status {
          color: #00ff00;
        }
        
        .terminal-toast .message {
          color: #ffffff;
        }
        
        @keyframes terminalFadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        
        @keyframes terminalFadeOut {
          from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
        }
      `;
      document.head.appendChild(style);
    },
    
    showToast: function(message, type) {
      type = type || 'success';
      var existing = document.querySelector('.terminal-toast');
      if (existing) {
        existing.remove();
      }
      
      var toast = document.createElement('div');
      toast.className = 'terminal-toast';
      
      var prefix = type === 'success' ? '[+]' : '[-]';
      var status = type === 'success' ? 'SUCCESS' : 'ERROR';
      
      toast.innerHTML = `
        <span class="prefix">${prefix}</span>
        <span class="message">${message}</span>
      `;
      
      document.body.appendChild(toast);
      
      setTimeout(function() {
        toast.style.animation = 'terminalFadeOut 0.3s ease forwards';
        setTimeout(function() {
          toast.remove();
        }, 300);
      }, 2000);
    },
    
    overrideCopy: function() {
      var self = this;
      
      document.addEventListener('copy', function(e) {
        var selection = window.getSelection();
        var text = selection.toString().trim();
        
        if (text.length > 0) {
          var displayText = text.length > 30 ? text.substring(0, 30) + '...' : text;
          self.showToast('Payload copied to clipboard: ' + displayText, 'success');
        }
      });
      
      document.addEventListener('click', function(e) {
        var target = e.target;
        
        if (target.closest('.copy-btn') || 
            target.closest('.code-copy') || 
            target.closest('[data-copy]') ||
            target.classList.contains('copy') ||
            target.closest('.highlight .copy-btn')) {
          
          setTimeout(function() {
            self.showToast('Code copied to clipboard', 'success');
          }, 100);
        }
      });
    }
  };
  
  window.TerminalCopy = TerminalCopy;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      TerminalCopy.init();
    });
  } else {
    TerminalCopy.init();
  }
})();
