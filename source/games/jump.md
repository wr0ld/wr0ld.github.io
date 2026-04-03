---
title: 跳一跳
layout: page
leftbar: 
rightbar: 
---

{% raw %}
<div class="game-container">
  <div class="game-header">
    <h1>🎯 跳一跳</h1>
    <div class="game-info">
      <div class="score">得分: <span id="score">0</span></div>
      <div class="best-score">最高分: <span id="bestScore">0</span></div>
    </div>
  </div>
  
  <div class="game-board-container">
    <canvas id="gameCanvas" width="400" height="600"></canvas>
    <div id="gameOver" class="game-over hidden">
      <h2>游戏结束!</h2>
      <p>得分: <span id="finalScore">0</span></p>
      <button onclick="startGame()">重新开始</button>
    </div>
    <div id="startScreen" class="start-screen">
      <h2>跳一跳</h2>
      <p>按住蓄力，松开跳跃</p>
      <button onclick="startGame()">开始游戏</button>
    </div>
  </div>
  
  <div class="game-instructions">
    <h3>游戏说明</h3>
    <ul>
      <li>按住鼠标或空格键蓄力，松开跳跃</li>
      <li>蓄力时间越长，跳跃距离越远</li>
      <li>跳到方块中心得分更高</li>
      <li>掉落或跳出边界游戏结束</li>
    </ul>
  </div>
</div>

<style>
  .game-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
  }
  
  .game-header h1 {
    font-size: 2em;
    margin-bottom: 10px;
  }
  
  .game-info {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin: 15px 0;
    font-size: 18px;
  }
  
  .game-board-container {
    position: relative;
    display: inline-block;
    margin: 10px 0;
  }
  
  #gameCanvas {
    border: 3px solid var(--text, #333);
    background: linear-gradient(to bottom, #87CEEB, #E0F6FF);
    display: block;
    cursor: pointer;
  }
  
  .game-over, .start-screen {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.9);
    color: white;
    padding: 30px;
    border-radius: 10px;
    text-align: center;
    z-index: 10;
  }
  
  .game-over.hidden, .start-screen.hidden {
    display: none;
  }
  
  .game-over button, .start-screen button {
    margin-top: 15px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
  }
  
  .game-instructions {
    margin-top: 20px;
    text-align: left;
    padding: 15px;
    background: var(--block, #f5f5f5);
    border-radius: 10px;
  }
  
  .game-instructions h3 {
    margin-bottom: 10px;
  }
  
  .game-instructions ul {
    list-style: none;
    padding: 0;
  }
  
  .game-instructions li {
    padding: 5px 0;
    padding-left: 20px;
    position: relative;
  }
  
  .game-instructions li:before {
    content: "•";
    position: absolute;
    left: 0;
    color: #3498db;
  }
</style>

<script>
(function() {
  const jumpCanvas = document.getElementById('gameCanvas');
  const jumpCtx = jumpCanvas.getContext('2d');

  const PLAYER_SIZE = 30;
  const PLATFORM_HEIGHT = 80;
  const BASE_Y = 450;

  const SKINS = {
    'default': '👤',
    'cat': '🐱',
    'dog': '🐕',
    'robot': '🤖',
    'alien': '👽',
    'ghost': '👻',
    'panda': '🐼',
    'frog': '🐸'
  };

  let player = {
    x: 0,
    y: 0,
    vy: 0,
    vx: 0,
    jumping: false,
    squash: 1
  };

  let platforms = [];
  let currentPlatformIndex = 0;
  let score = 0;
  let bestScore = parseInt(localStorage.getItem('jumpBestScore')) || 0;
  let isCharging = false;
  let chargeTime = 0;
  let gameRunning = false;
  let cameraOffset = 0;

  function getSkin() {
    return localStorage.getItem('jump_player_skin') || 'default';
  }

  function isPlayerVisible() {
    return localStorage.getItem('jump_show_player') !== 'false';
  }

  const COLORS = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c', '#e67e22'];

  function initGame() {
    score = 0;
    currentPlatformIndex = 0;
    cameraOffset = 0;
    platforms = [];
    
    platforms.push({
      x: 100,
      width: 80,
      color: COLORS[0]
    });
    
    for (let i = 1; i < 10; i++) {
      generatePlatform();
    }
    
    player.x = platforms[0].x + platforms[0].width / 2;
    player.y = BASE_Y;
    player.vy = 0;
    player.vx = 0;
    player.jumping = false;
    player.squash = 1;
    
    document.getElementById('score').textContent = score;
    document.getElementById('bestScore').textContent = bestScore;
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('startScreen').classList.add('hidden');
  }

  function generatePlatform() {
    const lastPlatform = platforms[platforms.length - 1];
    const gap = 100 + Math.random() * 80;
    const width = 50 + Math.random() * 40;
    
    const direction = Math.random() > 0.5 ? 1 : -1;
    let newX = lastPlatform.x + lastPlatform.width / 2 + gap * direction - width / 2;
    
    newX = Math.max(30, Math.min(newX, jumpCanvas.width - width - 30));
    
    platforms.push({
      x: newX,
      width: width,
      color: COLORS[platforms.length % COLORS.length]
    });
  }

  function draw() {
    jumpCtx.clearRect(0, 0, jumpCanvas.width, jumpCanvas.height);
    
    const gradient = jumpCtx.createLinearGradient(0, 0, 0, jumpCanvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    jumpCtx.fillStyle = gradient;
    jumpCtx.fillRect(0, 0, jumpCanvas.width, jumpCanvas.height);
    
    jumpCtx.save();
    jumpCtx.translate(-cameraOffset, 0);
    
    platforms.forEach((platform, index) => {
      jumpCtx.fillStyle = platform.color;
      jumpCtx.fillRect(platform.x, BASE_Y, platform.width, PLATFORM_HEIGHT);
      
      jumpCtx.fillStyle = 'rgba(255,255,255,0.3)';
      jumpCtx.fillRect(platform.x, BASE_Y, platform.width, 10);
      
      jumpCtx.fillStyle = 'rgba(0,0,0,0.2)';
      jumpCtx.fillRect(platform.x, BASE_Y + PLATFORM_HEIGHT - 5, platform.width, 5);
    });
    
    if (isPlayerVisible()) {
      const skin = getSkin();
      const emoji = SKINS[skin] || '👤';
      const size = PLAYER_SIZE * (isCharging && !player.jumping ? player.squash : 1);
      
      jumpCtx.font = size + 'px Arial';
      jumpCtx.textAlign = 'center';
      jumpCtx.textBaseline = 'bottom';
      
      if (isCharging && !player.jumping) {
        jumpCtx.save();
        jumpCtx.translate(player.x, player.y);
        jumpCtx.scale(player.squash, 1 / player.squash);
        jumpCtx.fillText(emoji, 0, 0);
        jumpCtx.restore();
      } else {
        jumpCtx.fillText(emoji, player.x, player.y);
      }
    } else {
      if (isCharging && !player.jumping) {
        player.squash = 1 - (chargeTime / 150) * 0.4;
        jumpCtx.fillStyle = '#333';
        jumpCtx.fillRect(
          player.x - PLAYER_SIZE / 2 * player.squash,
          player.y - PLAYER_SIZE * player.squash,
          PLAYER_SIZE * player.squash,
          PLAYER_SIZE * player.squash
        );
      } else if (player.jumping) {
        jumpCtx.fillStyle = '#333';
        jumpCtx.fillRect(
          player.x - PLAYER_SIZE / 2,
          player.y - PLAYER_SIZE,
          PLAYER_SIZE,
          PLAYER_SIZE
        );
      } else {
        jumpCtx.fillStyle = '#333';
        jumpCtx.fillRect(
          player.x - PLAYER_SIZE / 2,
          player.y - PLAYER_SIZE,
          PLAYER_SIZE,
          PLAYER_SIZE
        );
        
        jumpCtx.fillStyle = '#fff';
        jumpCtx.fillRect(player.x - 8, player.y - PLAYER_SIZE + 8, 5, 5);
        jumpCtx.fillRect(player.x + 3, player.y - PLAYER_SIZE + 8, 5, 5);
      }
    }
    
    jumpCtx.restore();
    
    if (isCharging) {
      const barWidth = 120;
      const barHeight = 12;
      const barX = jumpCanvas.width / 2 - barWidth / 2;
      const barY = 30;
      
      jumpCtx.fillStyle = 'rgba(0,0,0,0.5)';
      jumpCtx.fillRect(barX, barY, barWidth, barHeight);
      
      jumpCtx.fillStyle = '#e74c3c';
      jumpCtx.fillRect(barX, barY, Math.min(chargeTime / 150, 1) * barWidth, barHeight);
      
      jumpCtx.strokeStyle = '#fff';
      jumpCtx.strokeRect(barX, barY, barWidth, barHeight);
    }
  }

  function update() {
    if (!gameRunning) return;
    
    if (player.jumping) {
      player.y += player.vy;
      player.vy += 0.6;
      player.x += player.vx;
      
      const nextPlatform = platforms[currentPlatformIndex + 1];
      if (nextPlatform && player.y >= BASE_Y) {
        if (player.x > nextPlatform.x && player.x < nextPlatform.x + nextPlatform.width) {
          player.y = BASE_Y;
          player.jumping = false;
          player.vx = 0;
          player.vy = 0;
          currentPlatformIndex++;
          
          const centerDist = Math.abs(player.x - (nextPlatform.x + nextPlatform.width / 2));
          if (centerDist < 8) {
            score += 2;
          } else {
            score += 1;
          }
          
          document.getElementById('score').textContent = score;
          
          while (platforms.length - currentPlatformIndex < 8) {
            generatePlatform();
          }
          
          const targetOffset = player.x - jumpCanvas.width / 2;
          cameraOffset += (targetOffset - cameraOffset) * 0.1;
        } else if (player.y > jumpCanvas.height) {
          gameOver();
        }
      }
      
      if (player.y > jumpCanvas.height) {
        gameOver();
      }
    }
    
    if (isCharging && chargeTime < 150) {
      chargeTime += 1;
    }
    
    draw();
    requestAnimationFrame(update);
  }

  function jump() {
    if (player.jumping || !gameRunning) return;
    
    const power = Math.min(chargeTime / 150, 1);
    const jumpDistance = 30 + power * 150;
    const jumpHeight = -10 - power * 6;
    
    const nextPlatform = platforms[currentPlatformIndex + 1];
    if (nextPlatform) {
      const targetCenter = nextPlatform.x + nextPlatform.width / 2;
      player.vx = (targetCenter - player.x) > 0 ? jumpDistance / 20 : -jumpDistance / 20;
    } else {
      player.vx = jumpDistance / 20;
    }
    
    player.vy = jumpHeight;
    player.jumping = true;
    player.squash = 1;
    chargeTime = 0;
    isCharging = false;
  }

  function startCharge() {
    if (!player.jumping && gameRunning) {
      isCharging = true;
      chargeTime = 0;
    }
  }

  function gameOver() {
    gameRunning = false;
    
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem('jumpBestScore', bestScore);
      document.getElementById('bestScore').textContent = bestScore;
    }
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
  }

  window.startGame = function() {
    initGame();
    gameRunning = true;
    update();
  };

  jumpCanvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startCharge();
  });

  jumpCanvas.addEventListener('mouseup', (e) => {
    e.preventDefault();
    if (isCharging) jump();
  });

  jumpCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startCharge();
  });

  jumpCanvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (isCharging) jump();
  });

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (!isCharging && gameRunning && !player.jumping) {
        startCharge();
      }
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (isCharging) jump();
    }
  });

  document.getElementById('bestScore').textContent = bestScore;
  draw();
})();
</script>
{% endraw %}
