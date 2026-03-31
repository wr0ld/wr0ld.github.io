(function() {
  'use strict';
  
  var Glossary = {
    enabled: true,
    terms: {
      'RCE': 'Remote Code Execution - 远程代码执行，攻击者可以在目标服务器上执行任意代码',
      'Deserialization': '反序列化 - 将序列化的数据恢复为对象的过程，常被利用进行攻击',
      'LFI': 'Local File Inclusion - 本地文件包含漏洞，可读取服务器本地文件',
      'RFI': 'Remote File Inclusion - 远程文件包含漏洞，可包含远程恶意文件',
      'SQL注入': 'SQL Injection - 通过恶意SQL语句攻击数据库',
      'XSS': 'Cross-Site Scripting - 跨站脚本攻击，注入恶意脚本到网页',
      'CSRF': 'Cross-Site Request Forgery - 跨站请求伪造',
      'SSRF': 'Server-Side Request Forgery - 服务端请求伪造',
      'XXE': 'XML External Entity - XML外部实体注入漏洞',
      'SSTI': 'Server-Side Template Injection - 服务端模板注入',
      'FastJson': '阿里巴巴开源的JSON解析库，曾存在多个反序列化漏洞',
      'JNDI': 'Java Naming and Directory Interface - Java命名和目录接口',
      'LDAP': 'Lightweight Directory Access Protocol - 轻量级目录访问协议',
      'RMI': 'Remote Method Invocation - Java远程方法调用',
      'Payload': '攻击载荷 - 攻击者发送的恶意数据或代码',
      'Shell': '命令行接口或Web后门程序',
      'WebShell': '网页后门 - 通过Web方式控制服务器的恶意程序',
      '提权': 'Privilege Escalation - 提升权限级别',
      '横向移动': 'Lateral Movement - 在内网中从一台主机移动到另一台',
      'C2': 'Command and Control - 命令与控制服务器',
      '免杀': '绕过杀毒软件检测的技术',
      'Fuzz': '模糊测试 - 自动化输入测试发现漏洞',
      'POC': 'Proof of Concept - 概念验证代码',
      'EXP': 'Exploit - 利用代码',
      'CVE': 'Common Vulnerabilities and Exposures - 通用漏洞披露编号',
      '0day': '零日漏洞 - 未公开或未修补的漏洞',
      'WAF': 'Web Application Firewall - Web应用防火墙',
      'IDS': 'Intrusion Detection System - 入侵检测系统',
      'IPS': 'Intrusion Prevention System - 入侵防御系统',
      'DNSLog': 'DNS日志记录，用于检测无回显漏洞'
    },
    tooltip: null,
    
    init: function() {
      this.loadSettings();
      if (!this.enabled) return;
      
      this.createTooltip();
      this.bindEvents();
    },
    
    loadSettings: function() {
      var saved = localStorage.getItem('glossaryEnabled');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    },
    
    saveSettings: function() {
      localStorage.setItem('glossaryEnabled', this.enabled.toString());
    },
    
    toggle: function() {
      this.enabled = !this.enabled;
      this.saveSettings();
      if (!this.enabled && this.tooltip) {
        this.hideTooltip();
      }
    },
    
    createTooltip: function() {
      this.tooltip = document.createElement('div');
      this.tooltip.className = 'glossary-tooltip';
      this.tooltip.style.cssText = `
        position: fixed;
        max-width: 320px;
        padding: 10px 14px;
        background: var(--card, #2a2a2a);
        border: 1px solid var(--theme, #3498db);
        border-radius: 8px;
        font-size: 13px;
        line-height: 1.5;
        color: var(--text, #fff);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s;
      `;
      document.body.appendChild(this.tooltip);
    },
    
    bindEvents: function() {
      var self = this;
      
      document.addEventListener('mouseover', function(e) {
        if (!self.enabled) return;
        
        var target = e.target;
        if (target.nodeType === Node.TEXT_NODE) {
          target = target.parentElement;
        }
        
        var text = target.innerText || target.textContent || '';
        
        for (var term in self.terms) {
          if (text.includes(term) && self.isTermElement(target, term)) {
            self.showTooltip(term, e);
            return;
          }
        }
      });
      
      document.addEventListener('mouseout', function(e) {
        self.hideTooltip();
      });
    },
    
    isTermElement: function(element, term) {
      var text = element.innerText || element.textContent || '';
      var html = element.innerHTML || '';
      
      if (element.tagName === 'CODE' || element.tagName === 'PRE') {
        return false;
      }
      
      if (text.trim() === term || 
          (text.includes(term) && element.children.length === 0)) {
        return true;
      }
      
      if (html.includes(term) && element.children.length <= 2) {
        return true;
      }
      
      return false;
    },
    
    showTooltip: function(term, e) {
      var definition = this.terms[term];
      if (!definition) return;
      
      this.tooltip.innerHTML = `<strong style="color: var(--theme, #3498db);">${term}</strong><br><span style="color: var(--text-p2, #ccc);">${definition}</span>`;
      
      var x = e.clientX + 15;
      var y = e.clientY + 15;
      
      var tooltipRect = this.tooltip.getBoundingClientRect();
      var maxX = window.innerWidth - 340;
      var maxY = window.innerHeight - 100;
      
      if (x > maxX) x = maxX;
      if (y > maxY) y = maxY;
      
      this.tooltip.style.left = x + 'px';
      this.tooltip.style.top = y + 'px';
      this.tooltip.style.opacity = '1';
    },
    
    hideTooltip: function() {
      if (this.tooltip) {
        this.tooltip.style.opacity = '0';
      }
    }
  };
  
  window.Glossary = Glossary;
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      Glossary.init();
    });
  } else {
    Glossary.init();
  }
})();
