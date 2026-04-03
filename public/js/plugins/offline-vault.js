(function() {
  var offlineOverlay = null;
  var isOffline = false;
  
  function createOfflineOverlay() {
    var overlay = document.createElement('div');
    overlay.id = 'offline-vault-overlay';
    overlay.innerHTML = 
      '<div class="offline-vault-container">' +
        '<div class="offline-icon">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24">' +
            '<path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" opacity="0"/>' +
            '<path fill="currentColor" d="M23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7L12 21.5 23.64 7z" opacity=".3"/>' +
            '<path fill="currentColor" d="M12 4C7.31 4 3.07 5.9 0 8.98l12 15.02L24 8.98C20.93 5.9 16.69 4 12 4zm0 15.01L2.92 9.28C5.51 7.08 8.67 6 12 6s6.49 1.08 9.08 3.28L12 19.01z"/>' +
            '<path fill="currentColor" d="M2 12h20v2H2z" transform="rotate(-45 12 13)"/>' +
          '</svg>' +
        '</div>' +
        '<div class="offline-title">Network Compromised</div>' +
        '<div class="offline-message">Switching to local encrypted cache...</div>' +
        '<div class="offline-status">' +
          '<span class="status-dot"></span>' +
          '<span class="status-text">Offline Vault Active</span>' +
        '</div>' +
        '<div class="offline-progress">' +
          '<div class="progress-bar"></div>' +
        '</div>' +
      '</div>';
    
    var style = document.createElement('style');
    style.id = 'offline-vault-styles';
    style.textContent = 
      '#offline-vault-overlay {' +
        'position: fixed;' +
        'top: 0;' +
        'left: 0;' +
        'width: 100%;' +
        'height: 100%;' +
        'background: rgba(139, 0, 0, 0.95);' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;' +
        'z-index: 99999;' +
        'opacity: 0;' +
        'transition: opacity 0.5s ease;' +
        'backdrop-filter: blur(10px);' +
      '}' +
      '#offline-vault-overlay.show {' +
        'opacity: 1;' +
      '}' +
      '.offline-vault-container {' +
        'text-align: center;' +
        'padding: 40px;' +
        'max-width: 500px;' +
      '}' +
      '.offline-icon {' +
        'margin-bottom: 30px;' +
        'animation: pulse-icon 2s ease-in-out infinite;' +
      '}' +
      '.offline-icon svg {' +
        'color: #ff4444;' +
        'filter: drop-shadow(0 0 20px rgba(255, 68, 68, 0.5));' +
      '}' +
      '@keyframes pulse-icon {' +
        '0%, 100% { transform: scale(1); }' +
        '50% { transform: scale(1.1); }' +
      '}' +
      '.offline-title {' +
        'font-size: 28px;' +
        'font-weight: 700;' +
        'color: #ff6b6b;' +
        'margin-bottom: 15px;' +
        'text-transform: uppercase;' +
        'letter-spacing: 3px;' +
        'text-shadow: 0 0 20px rgba(255, 107, 107, 0.5);' +
        'font-family: "Courier New", monospace;' +
      '}' +
      '.offline-message {' +
        'font-size: 16px;' +
        'color: rgba(255, 255, 255, 0.8);' +
        'margin-bottom: 30px;' +
        'font-family: "Courier New", monospace;' +
      '}' +
      '.offline-status {' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;' +
        'gap: 10px;' +
        'margin-bottom: 20px;' +
      '}' +
      '.status-dot {' +
        'width: 10px;' +
        'height: 10px;' +
        'background: #00ff00;' +
        'border-radius: 50%;' +
        'animation: blink 1s ease-in-out infinite;' +
        'box-shadow: 0 0 10px #00ff00;' +
      '}' +
      '@keyframes blink {' +
        '0%, 100% { opacity: 1; }' +
        '50% { opacity: 0.3; }' +
      '}' +
      '.status-text {' +
        'color: #00ff00;' +
        'font-family: "Courier New", monospace;' +
        'font-size: 14px;' +
        'text-transform: uppercase;' +
        'letter-spacing: 2px;' +
      '}' +
      '.offline-progress {' +
        'width: 100%;' +
        'height: 4px;' +
        'background: rgba(255, 255, 255, 0.2);' +
        'border-radius: 2px;' +
        'overflow: hidden;' +
      '}' +
      '.progress-bar {' +
        'width: 0%;' +
        'height: 100%;' +
        'background: linear-gradient(90deg, #ff4444, #ff6b6b);' +
        'animation: progress 2s ease-out forwards;' +
      '}' +
      '@keyframes progress {' +
        '0% { width: 0%; }' +
        '100% { width: 100%; }' +
      '}' +
      '@media (max-width: 768px) {' +
        '.offline-title { font-size: 22px; letter-spacing: 2px; }' +
        '.offline-message { font-size: 14px; }' +
        '.offline-vault-container { padding: 20px; }' +
      '}';
    
    document.head.appendChild(style);
    document.body.appendChild(overlay);
    
    return overlay;
  }
  
  function showOfflineMode() {
    if (isOffline) return;
    isOffline = true;
    
    if (!offlineOverlay) {
      offlineOverlay = createOfflineOverlay();
    }
    
    offlineOverlay.classList.add('show');
    
    setTimeout(function() {
      offlineOverlay.classList.remove('show');
    }, 3000);
  }
  
  function hideOfflineMode() {
    if (!isOffline) return;
    isOffline = false;
    
    if (offlineOverlay) {
      offlineOverlay.classList.remove('show');
    }
  }
  
  function init() {
    if (!navigator.onLine) {
      showOfflineMode();
    }
    
    window.addEventListener('offline', function(e) {
      showOfflineMode();
    });
    
    window.addEventListener('online', function(e) {
      hideOfflineMode();
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
