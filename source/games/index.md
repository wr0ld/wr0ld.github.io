---
title: 小游戏
layout: page
---

{% raw %}
<div class="games-container">
  <h1>🎮 小游戏中心</h1>
  
  <div class="games-grid">
    <a href="/games/snake/" class="game-card">
      <div class="game-icon">🐍</div>
      <h2>贪吃蛇</h2>
      <p>经典贪吃蛇游戏，控制蛇吃食物，不要撞墙和自己！</p>
      <div class="game-tags">
        <span class="tag">经典</span>
        <span class="tag">休闲</span>
      </div>
    </a>
    
    <a href="/games/tetris/" class="game-card">
      <div class="game-icon">🧱</div>
      <h2>俄罗斯方块</h2>
      <p>经典俄罗斯方块，消除方块，挑战高分！</p>
      <div class="game-tags">
        <span class="tag">经典</span>
        <span class="tag">益智</span>
      </div>
    </a>
    
    <a href="/games/2048/" class="game-card">
      <div class="game-icon">🎯</div>
      <h2>2048</h2>
      <p>数字合并游戏，挑战2048方块！</p>
      <div class="game-tags">
        <span class="tag">益智</span>
        <span class="tag">数字</span>
      </div>
    </a>
    
    <a href="/games/breakout/" class="game-card">
      <div class="game-icon">⚡</div>
      <h2>打砖块</h2>
      <p>经典打砖块游戏，用球击碎所有砖块！</p>
      <div class="game-tags">
        <span class="tag">经典</span>
        <span class="tag">动作</span>
      </div>
    </a>
    
    <a href="/games/minesweeper/" class="game-card">
      <div class="game-icon">💣</div>
      <h2>扫雷</h2>
      <p>经典扫雷游戏，找出所有地雷！</p>
      <div class="game-tags">
        <span class="tag">经典</span>
        <span class="tag">策略</span>
      </div>
    </a>
    
    <a href="/games/gobang/" class="game-card">
      <div class="game-icon">⚫</div>
      <h2>五子棋</h2>
      <p>经典五子棋对战，先连成五子获胜！</p>
      <div class="game-tags">
        <span class="tag">经典</span>
        <span class="tag">策略</span>
      </div>
    </a>
    
    <a href="/games/memory/" class="game-card">
      <div class="game-icon">🃏</div>
      <h2>记忆翻牌</h2>
      <p>翻开卡片找出配对，考验记忆力！</p>
      <div class="game-tags">
        <span class="tag">益智</span>
        <span class="tag">记忆</span>
      </div>
    </a>
    
    <a href="/games/airplane/" class="game-card">
      <div class="game-icon">✈️</div>
      <h2>飞机大战</h2>
      <p>经典射击游戏，击落敌机得分！</p>
      <div class="game-tags">
        <span class="tag">动作</span>
        <span class="tag">射击</span>
      </div>
    </a>
    
    <a href="/games/sokoban/" class="game-card">
      <div class="game-icon">📦</div>
      <h2>推箱子</h2>
      <p>经典益智游戏，将箱子推到目标位置！</p>
      <div class="game-tags">
        <span class="tag">益智</span>
        <span class="tag">策略</span>
      </div>
    </a>
    
    <a href="/games/puzzle/" class="game-card">
      <div class="game-icon">🔢</div>
      <h2>数字华容道</h2>
      <p>滑块拼图游戏，将数字按顺序排列！</p>
      <div class="game-tags">
        <span class="tag">益智</span>
        <span class="tag">拼图</span>
      </div>
    </a>
  </div>
</div>

<style>
  .games-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  
  .games-container h1 {
    text-align: center;
    font-size: 2.5em;
    margin-bottom: 20px;
  }
  
  .games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
    margin-top: 30px;
  }
  
  .game-card {
    display: block;
    background: var(--card, #fff);
    border-radius: 15px;
    padding: 30px;
    text-decoration: none;
    color: inherit;
    transition: all 0.3s ease;
    border: 2px solid var(--border, #e0e0e0);
    position: relative;
    overflow: hidden;
  }
  
  .game-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.15);
    border-color: var(--theme, #3498db);
  }
  
  .game-card:hover .game-icon {
    transform: scale(1.2) rotate(5deg);
  }
  
  .game-icon {
    font-size: 4em;
    text-align: center;
    margin-bottom: 20px;
    transition: all 0.3s ease;
  }
  
  .game-card h2 {
    font-size: 1.5em;
    margin-bottom: 15px;
    text-align: center;
    color: var(--text, #333);
  }
  
  .game-card p {
    color: var(--text-p3, #666);
    line-height: 1.6;
    margin-bottom: 20px;
    text-align: center;
  }
  
  .game-tags {
    display: flex;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  
  .tag {
    background: var(--theme, #3498db);
    color: white;
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 0.85em;
    font-weight: 500;
  }
  
  @media (max-width: 768px) {
    .games-container h1 {
      font-size: 2em;
    }
    
    .game-card {
      padding: 20px;
    }
    
    .game-icon {
      font-size: 3em;
    }
  }
</style>
{% endraw %}
