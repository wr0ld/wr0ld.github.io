---
title: 设置
layout: page
menu_id: settings
---

<div class="settings-wrapper">
  <div class="settings-container">
    <div id="tools" class="settings-section">
    <h2>🛠️ 没用的工具</h2>
    <div class="setting-item">
      <span>🔮 占卜</span>
      <a href="/divination/" class="tool-link">进入占卜</a>
    </div>
    <div class="setting-item">
      <span>🔢 计算器</span>
      <a href="/calculator/" class="tool-link">打开计算器</a>
    </div>
  </div>
  
  <div id="theme" class="settings-section">
    <h2>🎨 主题设置</h2>
    <div class="setting-item">
      <span>深色模式</span>
      <button class="theme-toggle" onclick="switchTheme()">
        <span class="theme-icon">🌙</span>
        <span class="theme-text">切换主题</span>
      </button>
    </div>
  </div>
  
  <div id="reading" class="settings-section">
    <h2>📖 阅读设置</h2>
    <div class="setting-item">
      <span>文章布局</span>
      <div class="layout-options">
        <button onclick="localStorage.setItem('Stellar.layout', 'grid'); location.reload();">网格</button>
        <button onclick="localStorage.setItem('Stellar.layout', 'list'); location.reload();">列表</button>
        <button onclick="localStorage.setItem('Stellar.layout', 'compact'); location.reload();">紧凑</button>
        <button onclick="localStorage.setItem('Stellar.layout', 'title-only'); location.reload();">仅标题</button>
      </div>
    </div>
    <div class="setting-item">
      <span>分类页面样式</span>
      <div class="category-style-options">
        <button class="category-style-btn" data-style="1" onclick="setCategoriesStyle('1')">📋 简洁列表</button>
        <button class="category-style-btn" data-style="2" onclick="setCategoriesStyle('2')">⏳ 时间轴</button>
      </div>
    </div>
    <div class="setting-item">
      <span>聚光灯阅读</span>
      <label class="toggle-switch">
        <input type="checkbox" id="spotlightMode" onchange="toggleSpotlight(this.checked)">
        <span class="slider"></span>
      </label>
    </div>
    <div class="setting-item">
      <span>聚光灯大小</span>
      <div class="intensity-slider">
        <input type="range" id="spotlightSize" min="50" max="300" value="150" onchange="setSpotlightSize(this.value)">
        <span id="spotlight-size-value">150px</span>
      </div>
    </div>
  </div>
  
  <div id="reverse" class="settings-section">
    <h2>🔄 反转设置</h2>
    <div class="setting-item">
      <span>🔄 博客反转</span>
      <div class="reverse-options">
        <button class="reverse-btn" data-reverse="none" onclick="setReverseMode('none')">正常</button>
        <button class="reverse-btn" data-reverse="vertical" onclick="setReverseMode('vertical')">↕️ 上下反转</button>
        <button class="reverse-btn" data-reverse="horizontal" onclick="setReverseMode('horizontal')">↔️ 左右反转</button>
        <button class="reverse-btn" data-reverse="both" onclick="setReverseMode('both')">🔀 全反转</button>
      </div>
    </div>
    <div class="setting-item">
      <span>🎢 反向滚动</span>
      <label class="toggle-switch">
        <input type="checkbox" id="reverseScroll" onchange="toggleReverseScroll(this.checked)">
        <span class="slider"></span>
      </label>
    </div>
  </div>
  
  <div id="mouse" class="settings-section">
    <h2>🖱️ 鼠标特效设置</h2>
    <div class="setting-item">
      <span>显卡故障效果</span>
      <label class="toggle-switch">
        <input type="checkbox" id="glitchEffect" onchange="toggleGlitchEffect(this.checked)">
        <span class="slider"></span>
      </label>
    </div>
    <div class="setting-item">
      <span>自定义右键菜单</span>
      <label class="toggle-switch">
        <input type="checkbox" id="customContextMenu" onchange="toggleCustomContextMenu(this.checked)">
        <span class="slider"></span>
      </label>
    </div>
    <div class="setting-item">
      <span>鼠标样式</span>
      <div class="cursor-options">
        <button class="cursor-btn" data-cursor="default" onclick="setCursor('default')">默认</button>
        <button class="cursor-btn" data-cursor="sparkle" onclick="setCursor('sparkle')">✨ 闪烁</button>
        <button class="cursor-btn" data-cursor="trail" onclick="setCursor('trail')">🌈 拖尾</button>
        <button class="cursor-btn" data-cursor="heart" onclick="setCursor('heart')">❤️ 爱心</button>
        <button class="cursor-btn" data-cursor="star" onclick="setCursor('star')">⭐ 星星</button>
      </div>
    </div>
    <div class="setting-item">
      <span>点击特效</span>
      <div class="click-effect-options">
        <button class="click-btn" data-click="none" onclick="setClickEffect('none')">无</button>
        <button class="click-btn" data-click="ripple" onclick="setClickEffect('ripple')">💧 涟漪</button>
        <button class="click-btn" data-click="firework" onclick="setClickEffect('firework')">🎆 烟花</button>
        <button class="click-btn" data-click="particles" onclick="setClickEffect('particles')">✨ 粒子</button>
        <button class="click-btn" data-click="text" onclick="setClickEffect('text')">📝 文字</button>
      </div>
    </div>
    <div class="setting-item">
      <span>滑动特效</span>
      <div class="slide-effect-options">
        <button class="slide-btn" data-slide="none" onclick="setSlideEffect('none')">无</button>
        <button class="slide-btn" data-slide="stars" onclick="setSlideEffect('stars')">⭐ 星光</button>
        <button class="slide-btn" data-slide="bubbles" onclick="setSlideEffect('bubbles')">🫧 气泡</button>
        <button class="slide-btn" data-slide="snow" onclick="setSlideEffect('snow')">❄️ 雪花</button>
        <button class="slide-btn" data-slide="sakura" onclick="setSlideEffect('sakura')">🌸 樱花</button>
      </div>
    </div>
    <div class="setting-item">
      <span>特效强度</span>
      <div class="intensity-slider">
        <input type="range" id="effectIntensity" min="1" max="10" value="5" onchange="setEffectIntensity(this.value)">
        <span id="intensity-value">5</span>
      </div>
    </div>
  </div>
  
  <div id="music" class="settings-section">
    <h2>🎮 看板娘设置</h2>
    <div class="setting-item">
      <span>显示看板娘</span>
      <label class="toggle-switch">
        <input type="checkbox" id="showWaifu" onchange="toggleWaifu(this.checked)">
        <span class="slider"></span>
      </label>
    </div>
    <div class="waifu-model-section">
      <div class="waifu-model-label">看板娘模型</div>
      <div class="waifu-model-options" id="waifuModelOptions"></div>
    </div>
  </div>
  
  <div id="wave" class="settings-section">
    <h2>📈 波纹</h2>
    <p class="wave-description"></p>
    <div class="diligence-wave-container">
      <canvas id="diligenceWave" width="700" height="150"></canvas>
    </div>
  </div>
  
  <div id="display" class="settings-section">
    <h2>🖥️ 界面显示</h2>
    <div class="setting-item">
      <span>📊 时间信息面板</span>
      <label class="toggle-switch">
        <input type="checkbox" id="timeWidgetToggle" onchange="toggleTimeWidget(this.checked)">
        <span class="slider"></span>
      </label>
    </div>
    <div class="setting-item">
      <span>🎵 音乐播放器</span>
      <label class="toggle-switch">
        <input type="checkbox" id="musicPlayerToggle" onchange="toggleMusicPlayer(this.checked)">
        <span class="slider"></span>
      </label>
    </div>
  </div>
  
  <div class="settings-section" id="music-search-section" style="display:none;">
    <h2>🎵 音乐搜索</h2>
    <div class="setting-item">
      <span>搜索歌曲</span>
      <div class="music-search-box">
        <input type="text" id="music-search-input" placeholder="输入歌曲名或歌手名..." />
        <button onclick="searchMusic()">搜索</button>
      </div>
    </div>
    <div class="setting-item">
      <span>音源选择</span>
      <div class="music-source-options">
        <button class="music-source-btn active" data-source="0">小秋</button>
        <button class="music-source-btn" data-source="1">小蜗</button>
        <button class="music-source-btn" data-source="2">小芸</button>
        <button class="music-source-btn" data-source="3">小枸</button>
        <button class="music-source-btn" data-source="4">小蜜</button>
      </div>
    </div>
    <div class="setting-item">
      <span>音量大小</span>
      <div class="volume-slider">
        <input type="range" id="musicVolumeSlider" min="0" max="100" value="50" onchange="setMusicVolume(this.value)">
        <span id="music-volume-value">50%</span>
      </div>
    </div>
    <div id="music-search-results"></div>
    <div class="setting-item">
      <span>播放列表管理</span>
      <div class="music-playlist-btns">
        <button onclick="showMusicPlaylist()">查看列表</button>
        <button class="danger-btn" onclick="clearMusicPlaylist()">清空列表</button>
      </div>
    </div>
  </div>
  
  <div id="data" class="settings-section">
    <h2>📊 数据管理</h2>
    <div class="setting-item">
      <span>🃏 卡牌收藏</span>
      <button onclick="if(window.CardSystem) window.CardSystem.showPanel()">查看卡牌</button>
    </div>
    <div class="setting-item">
      <span>清除本地缓存</span>
      <button class="danger-btn" onclick="if(confirm('确定要清除所有本地缓存吗？这将重置您的所有设置和游戏记录。')){localStorage.clear(); alert('缓存已清除！'); location.reload();}">清除缓存</button>
    </div>
    <div class="setting-item">
      <span>游戏最高分记录</span>
      <button onclick="showGameScores()">查看记录</button>
    </div>
  </div>
  
  <div id="ranking" class="settings-section">
    <h2>🏆 文章排行榜</h2>
    <div class="ranking-tabs">
      <button class="ranking-tab active" data-type="words" onclick="switchRankingTab('words')">📝 字数排行</button>
      <button class="ranking-tab" data-type="images" onclick="switchRankingTab('images')">🖼️ 图片排行</button>
    </div>
    <div id="ranking-list" class="ranking-list">
      <div class="ranking-loading">加载中...</div>
    </div>
  </div>
</div>

<div id="game-scores-modal" class="modal" style="display:none;">
  <div class="modal-content">
    <div class="modal-header">
      <h3>🏆 游戏最高分记录</h3>
      <span class="close-btn" onclick="document.getElementById('game-scores-modal').style.display='none'">&times;</span>
    </div>
    <div class="modal-body" id="game-scores-list">
    </div>
  </div>
</div>

<style>
.settings-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

.settings-container {
  width: 100%;
}

.settings-container h1 {
  text-align: center;
  margin-bottom: 40px;
}

.settings-section {
  background: var(--card, #fff);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid var(--border, #e0e0e0);
}

.settings-section h2 {
  margin-top: 0;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border, #e0e0e0);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed var(--border, #e0e0e0);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item span {
  font-size: 1em;
  color: var(--text-p1);
}

.tool-link {
  background: var(--theme, #3498db);
  color: white !important;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9em;
  transition: all 0.2s;
}

.tool-link:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

button {
  background: var(--theme, #3498db);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.2s;
}

button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.danger-btn {
  background: #ef4444;
}

.danger-btn:hover {
  background: #dc2626;
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.layout-options {
  display: flex;
  gap: 8px;
}

.layout-options button {
  padding: 6px 12px;
  font-size: 0.85em;
}

.category-style-options {
  display: flex;
  gap: 8px;
}

.category-style-btn {
  padding: 6px 12px;
  border: 2px solid var(--border, #e0e0e0);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  background: var(--card, #fff);
  transition: all 0.2s;
  color: var(--text-p1);
}

.category-style-btn:hover {
  transform: scale(1.05);
}

.category-style-btn.active {
  border-color: var(--theme, #3498db);
  box-shadow: 0 0 8px var(--theme, #3498db);
  background: color-mix(in srgb, var(--theme, #3498db) 15%, transparent);
}

.about-info p {
  margin: 8px 0;
  color: var(--text-p2);
}

.about-info a {
  color: var(--accent);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--card, #fff);
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border, #e0e0e0);
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  font-size: 24px;
  cursor: pointer;
  color: var(--text-p3);
}

.close-btn:hover {
  color: var(--text-p1);
}

.modal-body {
  padding: 20px;
}

.score-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border, #e0e0e0);
}

.score-item:last-child {
  border-bottom: none;
}

.skin-options, .waifu-model-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.waifu-model-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px solid var(--border, #444);
  border-bottom: 1px dashed var(--border, #444);
  padding-bottom: 16px;
}

.waifu-model-label {
  font-size: 1em;
  color: var(--text-p1);
  margin-bottom: 12px;
  font-weight: 500;
  text-align: left;
}

.waifu-model-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.skin-btn, .waifu-model-btn {
  padding: 6px 12px;
  border: 2px solid var(--border, #e0e0e0);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  background: var(--card, #fff);
  transition: all 0.2s;
  color: var(--text-p1);
}

.skin-btn:hover, .waifu-model-btn:hover {
  transform: scale(1.05);
}

.skin-btn.active, .waifu-model-btn.active {
  border-color: var(--theme, #3498db);
  box-shadow: 0 0 8px var(--theme, #3498db);
}

.waifu-group {
  margin-bottom: 16px;
}

.waifu-group-title {
  font-size: 14px;
  font-weight: bold;
  color: var(--text-p1);
  margin-bottom: 8px;
  padding-left: 4px;
  border-left: 3px solid var(--theme, #3498db);
}

.waifu-group-models {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.cursor-options, .click-effect-options, .slide-effect-options, .reverse-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.cursor-btn, .click-btn, .slide-btn, .reverse-btn {
  padding: 6px 12px;
  border: 2px solid var(--border, #e0e0e0);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  background: var(--card, #fff);
  transition: all 0.2s;
  color: var(--text-p1);
}

.cursor-btn:hover, .click-btn:hover, .slide-btn:hover, .reverse-btn:hover {
  transform: scale(1.05);
}

.cursor-btn.active, .click-btn.active, .slide-btn.active, .reverse-btn.active {
  border-color: var(--theme, #3498db);
  box-shadow: 0 0 8px var(--theme, #3498db);
}

.intensity-slider {
  display: flex;
  align-items: center;
  gap: 12px;
}

.diligence-wave-container {
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(0,0,0,0.02), rgba(0,0,0,0.05));
  border-radius: 12px;
  border: 1px solid var(--border, #e0e0e0);
}

.wave-description {
  color: var(--text-p3, #666);
  font-size: 0.9em;
  margin-bottom: 16px;
  text-align: center;
}

#diligenceWave {
  width: 100%;
  height: 150px;
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.05) 100%);
}

.wave-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed var(--border, #e0e0e0);
}

.wave-stats .stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.wave-stats .stat-label {
  font-size: 0.85em;
  color: var(--text-p3, #666);
}

.wave-stats .stat-value {
  font-size: 1.1em;
  font-weight: bold;
  color: var(--theme, #3498db);
}

.intensity-slider input[type="range"] {
  width: 150px;
  height: 6px;
  -webkit-appearance: none;
  background: var(--border, #e0e0e0);
  border-radius: 3px;
  outline: none;
}

.intensity-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: var(--theme, #3498db);
  border-radius: 50%;
  cursor: pointer;
}

.intensity-slider span {
  font-size: 14px;
  color: var(--text-p2);
  min-width: 20px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 26px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--theme, #3498db);
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.music-search-box {
  display: flex;
  gap: 8px;
  max-width: 300px;
}

.music-search-box input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 6px;
  font-size: 14px;
  background: var(--background, #f5f5f5);
  color: var(--text-p1);
}

.music-search-box input:focus {
  outline: none;
  border-color: var(--theme, #3498db);
}

.music-source-options {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.music-source-btn {
  padding: 4px 12px;
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 6px;
  background: var(--background, #f5f5f5);
  color: var(--text-p1);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.music-source-btn.active {
  background: var(--theme, #3498db);
  color: white;
  border-color: var(--theme, #3498db);
}

.music-loading {
  text-align: center;
  padding: 20px;
  color: var(--text-p3);
}

.music-results-list {
  margin-top: 10px;
}

.music-result-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: var(--background, #f5f5f5);
}

.music-result-info {
  flex: 1;
  overflow: hidden;
}

.music-result-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-p1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-result-artist {
  font-size: 12px;
  color: var(--text-p3);
  margin-top: 2px;
}

.music-add-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  background: var(--theme, #3498db);
  color: white;
  font-size: 12px;
  cursor: pointer;
}

.music-playlist-btns {
  display: flex;
  gap: 8px;
}

.music-playlist-btns button {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

.music-playlist-btns button:first-child {
  background: var(--theme, #3498db);
  color: white;
}

.music-playlist-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-p1);
  margin-bottom: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border, #e0e0e0);
}

.music-remove-btn {
  padding: 4px 10px;
  border: 1px solid #e74c3c;
  border-radius: 4px;
  background: transparent;
  color: #e74c3c;
  font-size: 12px;
  cursor: pointer;
}

.music-remove-btn:hover {
  background: #e74c3c;
  color: white;
}

.volume-slider {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 200px;
}

.volume-slider input[type="range"] {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--border, #e0e0e0);
  outline: none;
  -webkit-appearance: none;
}

.volume-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--theme, #3498db);
  cursor: pointer;
  transition: transform 0.2s;
}

.volume-slider input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.volume-slider input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--theme, #3498db);
  cursor: pointer;
  border: none;
}

#music-volume-value {
  min-width: 40px;
  text-align: right;
  font-size: 14px;
  color: var(--text-p2);
}

.ranking-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.ranking-tab {
  padding: 8px 16px;
  border: 2px solid var(--border, #e0e0e0);
  border-radius: 8px;
  background: var(--card, #fff);
  color: var(--text-p1);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.ranking-tab:hover {
  transform: translateY(-2px);
}

.ranking-tab.active {
  border-color: var(--theme, #3498db);
  background: var(--theme, #3498db);
  color: white;
}

.ranking-list {
  max-height: 400px;
  overflow-y: auto;
}

.ranking-loading {
  text-align: center;
  padding: 20px;
  color: var(--text-p3);
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: var(--background, #f5f5f5);
  border-radius: 8px;
  transition: all 0.2s;
}

.ranking-item:hover {
  transform: translateX(4px);
  background: color-mix(in srgb, var(--theme, #3498db) 10%, transparent);
}

.ranking-position {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  font-size: 14px;
  margin-right: 12px;
  flex-shrink: 0;
}

.ranking-position.gold {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: white;
}

.ranking-position.silver {
  background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
  color: white;
}

.ranking-position.bronze {
  background: linear-gradient(135deg, #CD7F32, #8B4513);
  color: white;
}

.ranking-position.normal {
  background: var(--border, #e0e0e0);
  color: var(--text-p2);
}

.ranking-info {
  flex: 1;
  overflow: hidden;
}

.ranking-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-p1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.ranking-title a {
  color: inherit;
  text-decoration: none;
}

.ranking-title a:hover {
  color: var(--theme, #3498db);
}

.ranking-meta {
  font-size: 12px;
  color: var(--text-p3);
}

.ranking-value {
  font-size: 16px;
  font-weight: bold;
  color: var(--theme, #3498db);
  margin-left: 12px;
  flex-shrink: 0;
}
</style>

<script>
var WAIFU_MODELS = [
  { modelId: 0, textureId: 0, name: 'Pio酱', group: 'Potion Maker' },
  { modelId: 1, textureId: 0, name: 'Tia酱', group: 'Potion Maker' },
  { modelId: 2, textureId: 0, name: 'B站22娘', group: 'Bilibili' },
  { modelId: 3, textureId: 0, name: 'B站33娘', group: 'Bilibili' },
  { modelId: 4, textureId: 0, name: 'Shizuku', group: 'ShizukuTalk' },
  { modelId: 4, textureId: 1, name: 'Shizuku睡衣', group: 'ShizukuTalk' },
  { modelId: 5, textureId: 0, name: '涅普顿(经典)', group: '海王星' },
  { modelId: 5, textureId: 1, name: '涅普顿', group: '海王星' },
  { modelId: 5, textureId: 2, name: '涅普顿(圣诞)', group: '海王星' },
  { modelId: 5, textureId: 3, name: '涅普顿(女仆)', group: '海王星' },
  { modelId: 5, textureId: 4, name: '涅普顿(泳装)', group: '海王星' },
  { modelId: 5, textureId: 5, name: '诺瓦露(经典)', group: '海王星' },
  { modelId: 5, textureId: 6, name: '诺瓦露', group: '海王星' },
  { modelId: 5, textureId: 7, name: '诺瓦露(圣诞)', group: '海王星' },
  { modelId: 5, textureId: 8, name: '诺瓦露(泳装)', group: '海王星' },
  { modelId: 5, textureId: 9, name: '布兰(经典)', group: '海王星' },
  { modelId: 5, textureId: 10, name: '布兰', group: '海王星' },
  { modelId: 5, textureId: 11, name: '布兰(泳装)', group: '海王星' },
  { modelId: 5, textureId: 12, name: '贝露(经典)', group: '海王星' },
  { modelId: 5, textureId: 13, name: '贝露', group: '海王星' },
  { modelId: 5, textureId: 14, name: '贝露(泳装)', group: '海王星' },
  { modelId: 5, textureId: 15, name: 'Nepgear', group: '海王星' },
  { modelId: 5, textureId: 16, name: 'Nepgear(Extra)', group: '海王星' },
  { modelId: 5, textureId: 17, name: 'Nepgear(泳装)', group: '海王星' },
  { modelId: 5, textureId: 18, name: 'Histoire', group: '海王星' },
  { modelId: 5, textureId: 19, name: 'Histoire(无悬停)', group: '海王星' },
  { modelId: 6, textureId: 0, name: '丛云', group: '舰娘' }
];

function initWaifuSettings() {
  var container = document.getElementById('waifuModelOptions');
  var currentModelId = parseInt(localStorage.getItem('modelId')) || 0;
  var currentTextureId = parseInt(localStorage.getItem('modelTexturesId')) || 0;
  
  var groups = {};
  WAIFU_MODELS.forEach(function(model, index) {
    if (!groups[model.group]) {
      groups[model.group] = [];
    }
    groups[model.group].push({ ...model, index: index });
  });
  
  var html = '';
  for (var groupName in groups) {
    html += '<div class="waifu-group"><div class="waifu-group-title">' + groupName + '</div><div class="waifu-group-models">';
    groups[groupName].forEach(function(model) {
      var isActive = model.modelId === currentModelId && model.textureId === currentTextureId;
      html += '<button class="waifu-model-btn ' + (isActive ? 'active' : '') + '" ';
      html += 'onclick="selectWaifuModel(' + model.modelId + ', ' + model.textureId + ')">';
      html += model.name;
      html += '</button>';
    });
    html += '</div></div>';
  }
  container.innerHTML = html;
  
  var showWaifu = localStorage.getItem('waifu_show') === 'true';
  document.getElementById('showWaifu').checked = showWaifu;
}

function selectWaifuModel(modelId, textureId) {
  document.querySelectorAll('.waifu-model-btn').forEach(function(btn) {
    btn.classList.remove('active');
  });
  if (event && event.target) {
    event.target.classList.add('active');
  }
  
  if (window.switchWaifuModel) {
    window.switchWaifuModel(modelId, textureId);
  } else {
    localStorage.setItem('modelId', modelId);
    localStorage.setItem('modelTexturesId', textureId || 0);
    location.reload();
  }
}

function toggleWaifu(show) {
  localStorage.setItem('waifu_show', show.toString());
  if (!show) {
    localStorage.setItem('waifu-display', Date.now().toString());
  } else {
    localStorage.removeItem('waifu-display');
  }
  var waifu = document.getElementById('waifu');
  var waifuToggle = document.getElementById('waifu-toggle');
  if (waifu) {
    if (show) {
      waifu.classList.remove('waifu-hidden');
      waifu.classList.add('waifu-active');
      waifu.style.removeProperty('display');
      waifu.style.opacity = '1';
      waifu.style.visibility = 'visible';
      if (waifuToggle) {
        waifuToggle.classList.remove('waifu-toggle-active');
      }
    } else {
      waifu.classList.remove('waifu-active');
      waifu.classList.add('waifu-hidden');
      waifu.style.setProperty('display', 'none', 'important');
      waifu.style.opacity = '0';
      waifu.style.visibility = 'hidden';
      if (waifuToggle) {
        waifuToggle.classList.add('waifu-toggle-active');
      }
    }
  }
  if (show && !waifu) {
    location.reload();
  }
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'waifu_show',
    newValue: show.toString()
  }));
}

function toggleCustomContextMenu(enabled) {
  localStorage.setItem('customContextMenu', enabled.toString());
  if (window.CustomContextMenu) {
    window.CustomContextMenu.enabled = enabled;
    if (!enabled) {
      window.CustomContextMenu.hideMenu();
    }
  }
}

function setCategoriesStyle(style) {
  document.querySelectorAll('.category-style-btn').forEach(function(btn) {
    btn.classList.remove('active');
    if (btn.dataset.style === style) {
      btn.classList.add('active');
    }
  });
  localStorage.setItem('Stellar.categoriesStyle', style);
  if (window.applyCategoriesStyle) {
    window.applyCategoriesStyle(style);
  }
  if (window.secret && window.secret.styleSwitch) {
    window.secret.styleSwitch();
  }
}

// 初始化分类样式设置
var categoriesStyleSaved = localStorage.getItem('Stellar.categoriesStyle') || '1';
document.querySelectorAll('.category-style-btn').forEach(function(btn) {
  if (btn.dataset.style === categoriesStyleSaved) {
    btn.classList.add('active');
  }
});

function toggleGlitchEffect(enabled) {
  localStorage.setItem('glitchEffect', enabled.toString());
  if (window.GlitchEffect) {
    window.GlitchEffect.enabled = enabled;
    if (!enabled) {
      window.GlitchEffect.stopGlitch();
      window.GlitchEffect.stopIdleTimer();
    } else {
      window.GlitchEffect.startIdleTimer();
    }
  }
}

// 初始化右键菜单设置
var customContextMenuSaved = localStorage.getItem('customContextMenu');
if (customContextMenuSaved !== null) {
  document.getElementById('customContextMenu').checked = customContextMenuSaved === 'true';
}

// 初始化显卡故障效果设置
var glitchEffectSaved = localStorage.getItem('glitchEffect');
if (glitchEffectSaved !== null) {
  document.getElementById('glitchEffect').checked = glitchEffectSaved === 'true';
}

initWaifuSettings();

function showGameScores() {
  var games = ['snake', 'tetris', '2048', 'minesweeper', 'gobang', 'memory', 'airplane', 'sokoban', 'puzzle', 'jump', 'match', 'mole', 'coin', 'pinball', 'snake-battle'];
  var gameNames = {
    'snake': '贪吃蛇',
    'tetris': '俄罗斯方块',
    '2048': '2048',
    'minesweeper': '扫雷',
    'gobang': '五子棋',
    'memory': '记忆翻牌',
    'airplane': '飞机大战',
    'sokoban': '推箱子',
    'puzzle': '数字华容道',
    'jump': '跳一跳',
    'match': '消消乐',
    'mole': '打地鼠',
    'coin': '接金币',
    'pinball': '弹球',
    'snake-battle': '贪吃蛇大作战'
  };
  
  var html = '';
  var hasScores = false;
  
  games.forEach(function(game) {
    var score = localStorage.getItem(game + '_highScore');
    if (score) {
      hasScores = true;
      html += '<div class="score-item">';
      html += '<span>' + gameNames[game] + '</span>';
      html += '<span><strong>' + score + '</strong></span>';
      html += '</div>';
    }
  });
  
  if (!hasScores) {
    html = '<p style="text-align:center;color:var(--text-p3);">暂无游戏记录</p>';
  }
  
  document.getElementById('game-scores-list').innerHTML = html;
  document.getElementById('game-scores-modal').style.display = 'flex';
}

// 鼠标特效设置
function initMouseEffects() {
  var cursor = localStorage.getItem('cursor_style') || 'default';
  var clickEffect = localStorage.getItem('click_effect') || 'none';
  var slideEffect = localStorage.getItem('slide_effect') || 'none';
  var intensity = localStorage.getItem('effect_intensity') || '5';
  
  document.querySelectorAll('.cursor-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.cursor === cursor);
  });
  document.querySelectorAll('.click-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.click === clickEffect);
  });
  document.querySelectorAll('.slide-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.slide === slideEffect);
  });
  document.getElementById('effectIntensity').value = intensity;
  document.getElementById('intensity-value').textContent = intensity;
}

function setCursor(type) {
  localStorage.setItem('cursor_style', type);
  document.querySelectorAll('.cursor-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.cursor === type);
  });
  applyMouseEffects();
}

function setClickEffect(type) {
  localStorage.setItem('click_effect', type);
  document.querySelectorAll('.click-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.click === type);
  });
  applyMouseEffects();
}

function setSlideEffect(type) {
  localStorage.setItem('slide_effect', type);
  document.querySelectorAll('.slide-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.slide === type);
  });
  applyMouseEffects();
}

function setEffectIntensity(value) {
  localStorage.setItem('effect_intensity', value);
  document.getElementById('intensity-value').textContent = value;
}

function applyMouseEffects() {
  var cursor = localStorage.getItem('cursor_style') || 'default';
  var clickEffect = localStorage.getItem('click_effect') || 'none';
  var slideEffect = localStorage.getItem('slide_effect') || 'none';
  var intensity = parseInt(localStorage.getItem('effect_intensity') || '5');
  
  // 移除旧的特效
  var oldCanvas = document.getElementById('mouse-effect-canvas');
  if (oldCanvas) oldCanvas.remove();
  
  // 创建特效画布
  var canvas = document.createElement('canvas');
  canvas.id = 'mouse-effect-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
  document.body.appendChild(canvas);
  
  var ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  var particles = [];
  var mouseTrail = [];
  
  // 鼠标样式
  var cursors = {
    'default': 'default',
    'sparkle': 'none',
    'trail': 'none',
    'heart': 'none',
    'star': 'none'
  };
  document.body.style.cursor = cursors[cursor];
  
  // 鼠标移动事件
  document.addEventListener('mousemove', function(e) {
    var x = e.clientX;
    var y = e.clientY;
    
    // 鼠标样式特效
    if (cursor !== 'default') {
      if (cursor === 'sparkle') {
        for (var i = 0; i < intensity; i++) {
          particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 30,
            color: 'hsl(' + Math.random() * 360 + ', 100%, 50%)',
            type: 'sparkle'
          });
        }
      } else if (cursor === 'trail') {
        mouseTrail.push({x: x, y: y, life: 20});
        if (mouseTrail.length > 50) mouseTrail.shift();
      } else if (cursor === 'heart') {
        particles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 1,
          vy: -Math.random() * 2 - 1,
          life: 40,
          type: 'heart',
          color: 'hsl(' + (Math.random() * 30 + 340) + ', 100%, 50%)'
        });
      } else if (cursor === 'star') {
        particles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 1,
          vy: (Math.random() - 0.5) * 1,
          life: 30,
          type: 'star',
          color: 'hsl(' + (Math.random() * 60 + 40) + ', 100%, 50%)'
        });
      }
    }
    
    // 滑动特效
    if (slideEffect !== 'none') {
      if (Math.random() < 0.3) {
        var particle = {x: x, y: y, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, life: 50, type: slideEffect};
        if (slideEffect === 'stars') {
          particle.color = 'hsl(' + (Math.random() * 60 + 40) + ', 100%, 70%)';
        } else if (slideEffect === 'bubbles') {
          particle.color = 'hsl(' + (Math.random() * 60 + 180) + ', 70%, 60%)';
          particle.vy = -Math.random() * 2 - 0.5;
        } else if (slideEffect === 'snow') {
          particle.color = '#fff';
          particle.vy = Math.random() * 2 + 1;
        } else if (slideEffect === 'sakura') {
          particle.color = 'hsl(' + (Math.random() * 30 + 330) + ', 100%, 75%)';
          particle.vy = Math.random() + 0.5;
          particle.vx = Math.sin(Date.now() * 0.01) * 2;
        }
        particles.push(particle);
      }
    }
  });
  
  // 点击事件
  document.addEventListener('click', function(e) {
    var x = e.clientX;
    var y = e.clientY;
    
    if (clickEffect === 'ripple') {
      for (var i = 0; i < intensity * 3; i++) {
        var angle = (Math.PI * 2 / (intensity * 3)) * i;
        particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * 3,
          vy: Math.sin(angle) * 3,
          life: 30,
          type: 'ripple',
          color: 'hsl(' + (Math.random() * 60 + 180) + ', 70%, 60%)'
        });
      }
    } else if (clickEffect === 'firework') {
      for (var i = 0; i < intensity * 5; i++) {
        var angle = Math.random() * Math.PI * 2;
        var speed = Math.random() * 5 + 2;
        particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 40,
          type: 'firework',
          color: 'hsl(' + Math.random() * 360 + ', 100%, 60%)'
        });
      }
    } else if (clickEffect === 'particles') {
      for (var i = 0; i < intensity * 4; i++) {
        particles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          life: 35,
          type: 'particle',
          color: 'hsl(' + Math.random() * 360 + ', 100%, 70%)'
        });
      }
    } else if (clickEffect === 'text') {
      var texts = ['富强', '民主', '文明', '和谐', '自由', '平等', '公正', '法治', '爱国', '敬业', '诚信', '友善'];
      particles.push({
        x: x,
        y: y,
        vy: -2,
        life: 50,
        type: 'text',
        text: texts[Math.floor(Math.random() * texts.length)]
      });
    }
  });
  
  // 动画循环
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制拖尾
    if (cursor === 'trail' && mouseTrail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(mouseTrail[0].x, mouseTrail[0].y);
      for (var i = 1; i < mouseTrail.length; i++) {
        ctx.lineTo(mouseTrail[i].x, mouseTrail[i].y);
      }
      ctx.strokeStyle = 'rgba(100, 150, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      mouseTrail.forEach(function(p, i) {
        p.life--;
        if (p.life <= 0) mouseTrail.splice(i, 1);
      });
    }
    
    // 更新和绘制粒子
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx || 0;
      p.y += p.vy || 0;
      p.life--;
      
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      
      var alpha = p.life / 50;
      
      if (p.type === 'text') {
        ctx.font = '16px sans-serif';
        ctx.fillStyle = 'rgba(255, 100, 100, ' + alpha + ')';
        ctx.fillText(p.text, p.x, p.y);
      } else if (p.type === 'heart') {
        ctx.font = '16px sans-serif';
        ctx.fillText('❤', p.x, p.y);
      } else if (p.type === 'star') {
        ctx.font = '14px sans-serif';
        ctx.fillText('⭐', p.x, p.y);
      } else if (p.type === 'sparkle') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = p.color || 'rgba(100, 150, 255, ' + alpha + ')';
        ctx.fill();
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  animate();
  
  window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

initMouseEffects();

// 聚光灯阅读效果
function initSpotlight() {
  var enabled = localStorage.getItem('spotlight_mode') === 'true';
  var size = localStorage.getItem('spotlight_size') || '150';
  
  document.getElementById('spotlightMode').checked = enabled;
  document.getElementById('spotlightSize').value = size;
  document.getElementById('spotlight-size-value').textContent = size + 'px';
}

function toggleSpotlight(enabled) {
  localStorage.setItem('spotlight_mode', enabled);
  applySpotlight();
}

function setSpotlightSize(size) {
  localStorage.setItem('spotlight_size', size);
  document.getElementById('spotlight-size-value').textContent = size + 'px';
  applySpotlight();
}

function applySpotlight() {
  var enabled = localStorage.getItem('spotlight_mode') === 'true';
  var size = parseInt(localStorage.getItem('spotlight_size') || '150');
  
  var overlay = document.getElementById('spotlight-overlay');
  
  if (!enabled) {
    if (overlay) overlay.remove();
    return;
  }
  
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'spotlight-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9997;background:radial-gradient(circle 150px at 50% 50%, transparent 0%, rgba(0,0,0,0.5) 100%);transition:background 0.1s ease;';
    document.body.appendChild(overlay);
  }
  
  function updateSpotlight(e) {
    var x = e.clientX;
    var y = e.clientY;
    overlay.style.background = 'radial-gradient(circle ' + size + 'px at ' + x + 'px ' + y + 'px, transparent 0%, rgba(0,0,0,0.5) 100%)';
  }
  
  document.addEventListener('mousemove', updateSpotlight);
  overlay.updateHandler = updateSpotlight;
}

initSpotlight();

// 博客反转功能
function initReverseMode() {
  var mode = localStorage.getItem('reverse_mode') || 'none';
  var reverseScroll = localStorage.getItem('reverse_scroll') === 'true';
  
  document.querySelectorAll('.reverse-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.reverse === mode);
  });
  document.getElementById('reverseScroll').checked = reverseScroll;
  
  applyReverseMode();
}

function setReverseMode(mode) {
  localStorage.setItem('reverse_mode', mode);
  document.querySelectorAll('.reverse-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.reverse === mode);
  });
  applyReverseMode();
}

function toggleReverseScroll(enabled) {
  localStorage.setItem('reverse_scroll', enabled);
  applyReverseMode();
}

function applyReverseMode() {
  var mode = localStorage.getItem('reverse_mode') || 'none';
  var reverseScroll = localStorage.getItem('reverse_scroll') === 'true';
  
  var html = document.documentElement;
  
  // 移除所有反转类
  html.classList.remove('reverse-vertical', 'reverse-horizontal', 'reverse-both');
  
  // 应用反转模式
  if (mode === 'vertical') {
    html.classList.add('reverse-vertical');
  } else if (mode === 'horizontal') {
    html.classList.add('reverse-horizontal');
  } else if (mode === 'both') {
    html.classList.add('reverse-both');
  }
  
  // 反向滚动
  if (reverseScroll && !html._reverseScrollApplied) {
    html._reverseScrollApplied = true;
    window.addEventListener('wheel', function(e) {
      if (localStorage.getItem('reverse_scroll') === 'true') {
        e.preventDefault();
        window.scrollBy(-e.deltaX, -e.deltaY);
      }
    }, { passive: false });
  }
}

initReverseMode();

// 勤奋波纹功能
var DiligenceWave = {
  canvas: null,
  ctx: null,
  animationId: null,
  time: 0,
  diligenceLevel: 0.5,
  articles: [],
  
  init: function() {
    this.canvas = document.getElementById('diligenceWave');
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.canvas.offsetWidth * 2;
    this.canvas.height = this.canvas.offsetHeight * 2;
    this.ctx.scale(2, 2);
    
    this.loadArticleData();
  },
  
  loadArticleData: function() {
    var self = this;
    
    var storedData = localStorage.getItem('blog_articles_data');
    if (storedData) {
      try {
        self.articles = JSON.parse(storedData);
        self.calculateDiligence();
        self.startAnimation();
        return;
      } catch(e) {}
    }
    
    fetch('/')
      .then(function(response) { return response.text(); })
      .then(function(html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        var articleElements = doc.querySelectorAll('article, .post, .article, [class*="post-"]');
        
        self.articles = [];
        articleElements.forEach(function(article) {
          var dateEl = article.querySelector('time, .date, .post-date, [class*="date"]');
          if (dateEl) {
            var dateText = dateEl.getAttribute('datetime') || dateEl.textContent;
            var date = new Date(dateText);
            if (!isNaN(date.getTime())) {
              self.articles.push({
                date: date,
                title: article.querySelector('h1, h2, h3, .title')?.textContent || 'Untitled'
              });
            }
          }
        });
        
        if (self.articles.length === 0) {
          self.articles = self.generateSampleData();
        }
        
        self.articles.sort(function(a, b) { return b.date - a.date; });
        localStorage.setItem('blog_articles_data', JSON.stringify(self.articles));
        
        self.calculateDiligence();
        self.startAnimation();
      })
      .catch(function() {
        self.articles = self.generateSampleData();
        self.calculateDiligence();
        self.startAnimation();
      });
  },
  
  generateSampleData: function() {
    var articles = [];
    var now = new Date();
    for (var i = 0; i < 10; i++) {
      articles.push({
        date: new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000),
        title: 'Article ' + (i + 1)
      });
    }
    return articles;
  },
  
  calculateDiligence: function() {
    if (this.articles.length === 0) {
      this.diligenceLevel = 0.1;
      this.updateStats(null, '无数据', '0%');
      return;
    }
    
    var now = new Date();
    var lastArticle = this.articles[0];
    var daysSinceLastUpdate = Math.floor((now - lastArticle.date) / (1000 * 60 * 60 * 24));
    
    var recentArticles = this.articles.filter(function(a) {
      return (now - a.date) < (30 * 24 * 60 * 60 * 1000);
    }).length;
    
    var avgInterval = 0;
    if (this.articles.length > 1) {
      var intervals = [];
      for (var i = 0; i < this.articles.length - 1; i++) {
        intervals.push((this.articles[i].date - this.articles[i + 1].date) / (1000 * 60 * 60 * 24));
      }
      avgInterval = intervals.reduce(function(a, b) { return a + b; }, 0) / intervals.length;
    } else {
      avgInterval = daysSinceLastUpdate;
    }
    
    var recencyScore = Math.max(0, 1 - daysSinceLastUpdate / 30);
    var frequencyScore = Math.min(1, recentArticles / 10);
    var consistencyScore = Math.max(0, 1 - avgInterval / 14);
    
    this.diligenceLevel = (recencyScore * 0.4 + frequencyScore * 0.3 + consistencyScore * 0.3);
    this.diligenceLevel = Math.max(0.05, Math.min(1, this.diligenceLevel));
    
    var lastUpdateText = daysSinceLastUpdate === 0 ? '今天' : 
                         daysSinceLastUpdate === 1 ? '昨天' : 
                         daysSinceLastUpdate + ' 天前';
    
    var freqText = avgInterval < 1 ? '每天更新' :
                   avgInterval < 3 ? '每2-3天' :
                   avgInterval < 7 ? '每周' :
                   avgInterval < 14 ? '每两周' : '偶尔更新';
    
    var indexPercent = Math.round(this.diligenceLevel * 100) + '%';
    
    this.updateStats(lastUpdateText, freqText, indexPercent);
  },
  
  updateStats: function(lastUpdate, freq, index) {
    var lastEl = document.getElementById('lastUpdate');
    var freqEl = document.getElementById('updateFreq');
    var indexEl = document.getElementById('diligenceIndex');
    
    if (lastEl) lastEl.textContent = lastUpdate || '-';
    if (freqEl) freqEl.textContent = freq || '-';
    if (indexEl) {
      indexEl.textContent = index || '-';
      var value = parseInt(index) || 0;
      if (value >= 70) {
        indexEl.style.color = '#27ae60';
      } else if (value >= 40) {
        indexEl.style.color = '#f39c12';
      } else {
        indexEl.style.color = '#e74c3c';
      }
    }
  },
  
  startAnimation: function() {
    var self = this;
    
    function animate() {
      self.time += 0.02;
      self.draw();
      self.animationId = requestAnimationFrame(animate);
    }
    
    animate();
  },
  
  draw: function() {
    var ctx = this.ctx;
    var width = this.canvas.width / 2;
    var height = this.canvas.height / 2;
    
    ctx.clearRect(0, 0, width, height);
    
    var gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, 'rgba(52, 152, 219, 0.1)');
    gradient.addColorStop(0.5, 'rgba(52, 152, 219, 0.3)');
    gradient.addColorStop(1, 'rgba(52, 152, 219, 0.1)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    var waveCount = 3;
    for (var w = 0; w < waveCount; w++) {
      ctx.beginPath();
      
      var amplitude = 20 + (this.diligenceLevel * 40) * (1 - w * 0.2);
      var frequency = 0.01 + this.diligenceLevel * 0.02;
      var speed = 1 + this.diligenceLevel * 2;
      var opacity = 0.8 - w * 0.2;
      
      var colors = [
        'rgba(52, 152, 219, ' + opacity + ')',
        'rgba(46, 204, 113, ' + opacity + ')',
        'rgba(155, 89, 182, ' + opacity + ')'
      ];
      
      ctx.strokeStyle = colors[w];
      ctx.lineWidth = 2;
      
      var baseY = height / 2;
      
      for (var x = 0; x <= width; x++) {
        var y = baseY + 
                Math.sin(x * frequency + this.time * speed + w) * amplitude +
                Math.sin(x * frequency * 2 + this.time * speed * 1.5 + w * 2) * (amplitude * 0.3);
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
      
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      
      var fillGradient = ctx.createLinearGradient(0, baseY - amplitude, 0, height);
      fillGradient.addColorStop(0, colors[w].replace(opacity + ')', (opacity * 0.3) + ')'));
      fillGradient.addColorStop(1, 'rgba(52, 152, 219, 0)');
      ctx.fillStyle = fillGradient;
      ctx.fill();
    }
    
    this.drawParticles();
  },
  
  particles: [],
  
  drawParticles: function() {
    var ctx = this.ctx;
    var width = this.canvas.width / 2;
    var height = this.canvas.height / 2;
    
    if (this.particles.length < 20 && Math.random() < this.diligenceLevel) {
      this.particles.push({
        x: Math.random() * width,
        y: height,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 2 - 1,
        life: 1,
        size: Math.random() * 3 + 1
      });
    }
    
    for (var i = this.particles.length - 1; i >= 0; i--) {
      var p = this.particles[i];
      
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.01;
      
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(52, 152, 219, ' + (p.life * 0.5) + ')';
      ctx.fill();
    }
  }
};

setTimeout(function() {
  DiligenceWave.init();
}, 500);

// 界面显示设置初始化
function initDisplaySettings() {
  var timeWidgetEnabled = localStorage.getItem('timeWidget') === 'true';
  var timeWidgetToggle = document.getElementById('timeWidgetToggle');
  
  if (timeWidgetToggle) {
    timeWidgetToggle.checked = timeWidgetEnabled;
  }
  
  var musicPlayerEnabled = localStorage.getItem('musicPlayerEnabled') === 'true';
  var musicPlayerToggle = document.getElementById('musicPlayerToggle');
  
  if (musicPlayerToggle) {
    musicPlayerToggle.checked = musicPlayerEnabled;
  }
}

function toggleTimeWidget(enabled) {
  localStorage.setItem('timeWidget', enabled.toString());
  var timeWidget = document.getElementById('time-widget');
  if (timeWidget) {
    timeWidget.style.display = enabled ? 'flex' : 'none';
  }
}

function toggleMusicPlayer(enabled) {
  localStorage.setItem('musicPlayerEnabled', enabled.toString());
  if (window.MusicPlayer) {
    if (enabled) {
      window.MusicPlayer.enable();
    } else {
      window.MusicPlayer.disable();
    }
  }
  var searchSection = document.getElementById('music-search-section');
  if (searchSection) {
    searchSection.style.display = enabled ? 'block' : 'none';
  }
}

var musicSearchResults = [];

function searchMusic() {
  var keyword = document.getElementById('music-search-input').value.trim();
  if (!keyword) return;
  
  var resultsContainer = document.getElementById('music-search-results');
  resultsContainer.innerHTML = '<div class="music-loading">搜索中...</div>';
  
  var sourceIndex = 0;
  var activeBtn = document.querySelector('.music-source-btn.active');
  if (activeBtn) {
    sourceIndex = parseInt(activeBtn.dataset.source);
  }
  
  var apis = [
    function() { return searchNetease(keyword); },
    function() { return searchQQ(keyword); },
    function() { return searchKuwo(keyword); },
    function() { return searchKugou(keyword); },
    function() { return searchMigu(keyword); }
  ];
  
  if (apis[sourceIndex]) {
    apis[sourceIndex]();
  } else {
    searchNetease(keyword);
  }
}

function searchNetease(keyword) {
  var resultsContainer = document.getElementById('music-search-results');
  var url = 'https://music.163.com/api/search/get/web?s=' + encodeURIComponent(keyword) + '&type=1&limit=10';
  
  fetch('https://corsproxy.io/?' + encodeURIComponent(url))
    .then(function(response) { return response.json(); })
    .then(function(data) {
      if (data.code === 200 && data.result && data.result.songs) {
        var songs = data.result.songs;
        var songIds = songs.map(function(s) { return s.id; }).join(',');
        getSongUrls(songIds, songs);
      } else {
        searchQQ(keyword);
      }
    })
    .catch(function(error) {
      console.error('Search error:', error);
      searchQQ(keyword);
    });
}

function getSongUrls(ids, songs) {
  var url = 'https://music.163.com/api/song/enhance/player/url?ids=[' + ids + ']&br=320000';
  
  fetch('https://corsproxy.io/?' + encodeURIComponent(url))
    .then(function(response) { return response.json(); })
    .then(function(data) {
      if (data.code === 200 && data.data) {
        var urlMap = {};
        data.data.forEach(function(item) {
          urlMap[item.id] = item.url;
        });
        
        var results = songs.map(function(song) {
          var artists = song.artists ? song.artists.map(function(a) { return a.name; }).join('/') : '未知歌手';
          return {
            name: song.name,
            artist: artists,
            url: urlMap[song.id] || '',
            cover: song.album && song.album.picUrl ? song.album.picUrl : ''
          };
        }).filter(function(s) { return s.url; });
        
        musicSearchResults = results;
        renderMusicResults(results);
      } else {
        document.getElementById('music-search-results').innerHTML = '<div class="music-loading">获取歌曲链接失败</div>';
      }
    })
    .catch(function(error) {
      console.error('Get URL error:', error);
      document.getElementById('music-search-results').innerHTML = '<div class="music-loading">获取歌曲链接失败</div>';
    });
}

function searchQQ(keyword) {
  var resultsContainer = document.getElementById('music-search-results');
  var url = 'https://api.cenguigui.cn/api/tencent/?type=search&keyword=' + encodeURIComponent(keyword);
  
  fetch(url)
    .then(function(response) { return response.text(); })
    .then(function(text) {
      try {
        var data = JSON.parse(text);
        if (data.code === 200 && data.data) {
          var item = data.data;
          var results = [{
            name: item.song_name || item.name,
            artist: item.artist || item.singer,
            url: item.play_url || item.url,
            cover: item.img || item.cover
          }];
          musicSearchResults = results;
          renderMusicResults(results);
        } else {
          searchKuwo(keyword);
        }
      } catch(e) {
        console.error('QQ音乐解析错误:', text);
        searchKuwo(keyword);
      }
    })
    .catch(function(error) {
      console.error('Search error:', error);
      searchKuwo(keyword);
    });
}

function searchKuwo(keyword) {
  var resultsContainer = document.getElementById('music-search-results');
  var url = 'https://api.cenguigui.cn/api/kuwo/?type=search&keyword=' + encodeURIComponent(keyword);
  
  fetch(url)
    .then(function(response) { return response.text(); })
    .then(function(text) {
      try {
        var data = JSON.parse(text);
        if (data.code === 200 && data.data) {
          var item = data.data;
          var results = [{
            name: item.song_name || item.name,
            artist: item.artist || item.singer,
            url: item.play_url || item.url,
            cover: item.img || item.cover
          }];
          musicSearchResults = results;
          renderMusicResults(results);
        } else {
          searchKugou(keyword);
        }
      } catch(e) {
        console.error('酷我音乐解析错误:', text);
        searchKugou(keyword);
      }
    })
    .catch(function(error) {
      console.error('Search error:', error);
      searchKugou(keyword);
    });
}

function searchKugou(keyword) {
  var resultsContainer = document.getElementById('music-search-results');
  var url = 'https://api.cenguigui.cn/api/kugou/?type=search&keyword=' + encodeURIComponent(keyword);
  
  fetch(url)
    .then(function(response) { return response.text(); })
    .then(function(text) {
      try {
        var data = JSON.parse(text);
        if (data.code === 200 && data.data) {
          var item = data.data;
          var results = [{
            name: item.song_name || item.name,
            artist: item.artist || item.singer,
            url: item.play_url || item.url,
            cover: item.img || item.cover
          }];
          musicSearchResults = results;
          renderMusicResults(results);
        } else {
          searchMigu(keyword);
        }
      } catch(e) {
        console.error('酷狗音乐解析错误:', text);
        searchMigu(keyword);
      }
    })
    .catch(function(error) {
      console.error('Search error:', error);
      searchMigu(keyword);
    });
}

function searchMigu(keyword) {
  var resultsContainer = document.getElementById('music-search-results');
  var url = 'https://api.cenguigui.cn/api/migu/?type=search&keyword=' + encodeURIComponent(keyword);
  
  fetch(url)
    .then(function(response) { return response.text(); })
    .then(function(text) {
      try {
        var data = JSON.parse(text);
        if (data.code === 200 && data.data) {
          var item = data.data;
          var results = [{
            name: item.song_name || item.name,
            artist: item.artist || item.singer,
            url: item.play_url || item.url,
            cover: item.img || item.cover
          }];
          musicSearchResults = results;
          renderMusicResults(results);
        } else {
          resultsContainer.innerHTML = '<div class="music-loading">未找到相关音乐</div>';
        }
      } catch(e) {
        console.error('咪咕音乐解析错误:', text);
        resultsContainer.innerHTML = '<div class="music-loading">搜索失败，请稍后重试</div>';
      }
    })
    .catch(function(error) {
      console.error('Search error:', error);
      resultsContainer.innerHTML = '<div class="music-loading">搜索失败，请稍后重试</div>';
    });
}

function searchMusicAlternative(keyword) {
  searchNetease(keyword);
}

function renderMusicResults(results) {
  var resultsContainer = document.getElementById('music-search-results');
  var html = '<div class="music-results-list">';
  
  results.forEach(function(item, index) {
    html += '<div class="music-result-item">' +
      '<div class="music-result-info">' +
      '<div class="music-result-name">' + item.name + '</div>' +
      '<div class="music-result-artist">' + (item.artist || '未知歌手') + '</div>' +
      '</div>' +
      '<button class="music-add-btn" onclick="addMusicToPlaylist(' + index + ')">添加</button>' +
      '</div>';
  });
  
  html += '</div>';
  resultsContainer.innerHTML = html;
}

function addMusicToPlaylist(index) {
  var song = musicSearchResults[index];
  if (song && window.MusicPlayer) {
    window.MusicPlayer.addSong(song);
    alert('已添加: ' + song.name);
  }
}

function clearMusicPlaylist() {
  if (confirm('确定要清空播放列表吗？')) {
    if (window.MusicPlayer) {
      window.MusicPlayer.clearPlaylist();
      alert('播放列表已清空');
    }
  }
}

function showMusicPlaylist() {
  var playlist = JSON.parse(localStorage.getItem('musicPlaylist') || '[]');
  var resultsContainer = document.getElementById('music-search-results');
  
  if (playlist.length === 0) {
    resultsContainer.innerHTML = '<div class="music-loading">播放列表为空</div>';
    return;
  }
  
  var html = '<div class="music-playlist-title">当前播放列表 (' + playlist.length + '首)</div>';
  html += '<div class="music-results-list">';
  
  playlist.forEach(function(song, index) {
    html += '<div class="music-result-item">';
    html += '<div class="music-result-info">';
    html += '<div class="music-result-name">' + (index + 1) + '. ' + song.name + '</div>';
    html += '<div class="music-result-artist">' + song.artist + '</div>';
    html += '</div>';
    html += '<button class="music-remove-btn" onclick="removeSongFromPlaylist(' + index + ')">移除</button>';
    html += '</div>';
  });
  
  html += '</div>';
  resultsContainer.innerHTML = html;
}

function removeSongFromPlaylist(index) {
  var playlist = JSON.parse(localStorage.getItem('musicPlaylist') || '[]');
  if (index >= 0 && index < playlist.length) {
    var removed = playlist.splice(index, 1)[0];
    localStorage.setItem('musicPlaylist', JSON.stringify(playlist));
    
    if (window.MusicPlayer) {
      window.MusicPlayer.removeSong(index);
    }
    
    showMusicPlaylist();
  }
}

function setMusicVolume(value) {
  var volume = parseInt(value) / 100;
  localStorage.setItem('musicVolume', value);
  document.getElementById('music-volume-value').textContent = value + '%';
  
  if (window.MusicPlayer) {
    window.MusicPlayer.setVolume(volume);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var sourceBtns = document.querySelectorAll('.music-source-btn');
  sourceBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      sourceBtns.forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
    });
  });
  
  var musicEnabled = localStorage.getItem('musicPlayerEnabled') === 'true';
  var searchSection = document.getElementById('music-search-section');
  if (searchSection && musicEnabled) {
    searchSection.style.display = 'block';
  }
  
  var savedVolume = localStorage.getItem('musicVolume') || '50';
  var volumeSlider = document.getElementById('musicVolumeSlider');
  var volumeValue = document.getElementById('music-volume-value');
  if (volumeSlider) {
    volumeSlider.value = savedVolume;
  }
  if (volumeValue) {
    volumeValue.textContent = savedVolume + '%';
  }
});

initDisplaySettings();

// 文章排行榜功能
var articlesRankingData = [];
var currentRankingType = 'words';
var RANKING_VERSION = 'v4'; // 版本号，更新时强制刷新

function initArticlesRanking() {
  var storedVersion = localStorage.getItem('articles_ranking_version');
  var storedData = localStorage.getItem('articles_ranking_data');
  var storedTime = localStorage.getItem('articles_ranking_time');
  var now = Date.now();
  
  // 版本不匹配或缓存过期，强制刷新
  if (storedVersion !== RANKING_VERSION || !storedData || !storedTime || (now - parseInt(storedTime)) > 3600000) {
    fetchRankingData();
    return;
  }
  
  try {
    articlesRankingData = JSON.parse(storedData);
    if (articlesRankingData.length > 0) {
      renderRankingList(currentRankingType);
      return;
    }
  } catch(e) {
    console.error('Parse cached data error:', e);
  }
  
  fetchRankingData();
}

function fetchRankingData() {
  var now = Date.now();
  fetch('/api/articles_stats.json')
    .then(function(response) { return response.json(); })
    .then(function(data) {
      articlesRankingData = data || [];
      localStorage.setItem('articles_ranking_version', RANKING_VERSION);
      localStorage.setItem('articles_ranking_data', JSON.stringify(articlesRankingData));
      localStorage.setItem('articles_ranking_time', now.toString());
      renderRankingList(currentRankingType);
    })
    .catch(function(error) {
      console.error('Failed to load ranking data:', error);
      document.getElementById('ranking-list').innerHTML = '<div class="ranking-loading">加载失败，请刷新页面重试</div>';
    });
}

function switchRankingTab(type) {
  currentRankingType = type;
  
  document.querySelectorAll('.ranking-tab').forEach(function(tab) {
    tab.classList.toggle('active', tab.dataset.type === type);
  });
  
  renderRankingList(type);
}

function renderRankingList(type) {
  var container = document.getElementById('ranking-list');
  
  if (articlesRankingData.length === 0) {
    container.innerHTML = '<div class="ranking-loading">暂无数据</div>';
    return;
  }
  
  var sorted = articlesRankingData.slice().sort(function(a, b) {
    return type === 'words' ? b.words - a.words : b.images - a.images;
  });
  
  var html = '';
  sorted.slice(0, 20).forEach(function(article, index) {
    var positionClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'normal';
    var value = type === 'words' ? article.words + ' 字' : article.images + ' 图';
    var meta = type === 'words' ? article.images + ' 图' : article.words + ' 字';
    
    html += '<div class="ranking-item">';
    html += '<div class="ranking-position ' + positionClass + '">' + (index + 1) + '</div>';
    html += '<div class="ranking-info">';
    html += '<div class="ranking-title"><a href="' + article.link + '">' + article.title + '</a></div>';
    html += '<div class="ranking-meta">' + meta + '</div>';
    html += '</div>';
    html += '<div class="ranking-value">' + value + '</div>';
    html += '</div>';
  });
  
  container.innerHTML = html;
}

initArticlesRanking();
</script>
