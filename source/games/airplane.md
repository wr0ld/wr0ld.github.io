---
title: 飞机大战
layout: page
---

{% raw %}
<div class="game-container">
  <div class="game-header">
    <h1>✈️ 飞机大战</h1>
    <div class="game-controls">
      <button id="startBtn" onclick="startGame()">开始游戏</button>
      <button id="pauseBtn" onclick="togglePause()" disabled>暂停</button>
    </div>
    <div class="game-info">
      <div class="score">得分: <span id="score">0</span></div>
      <div class="high-score">最高分: <span id="highScore">0</span></div>
      <div class="lives">生命: <span id="lives">3</span></div>
    </div>
  </div>
  
  <div class="game-board-container">
    <canvas id="gameCanvas" width="480" height="640"></canvas>
    <div id="gameOver" class="game-over hidden">
      <h2>游戏结束!</h2>
      <p>得分: <span id="finalScore">0</span></p>
      <button onclick="restartGame()">重新开始</button>
    </div>
  </div>
  
  <div class="game-instructions">
    <h3>游戏说明</h3>
    <ul>
      <li>使用方向键或WASD控制飞机移动</li>
      <li>空格键发射子弹</li>
      <li>击落敌机得分</li>
      <li>避免被敌机撞到</li>
    </ul>
  </div>
</div>

<style>
  .game-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
  }
  
  .game-header h1 {
    font-size: 2.5em;
    margin-bottom: 20px;
  }
  
  .game-controls {
    margin: 20px 0;
  }
  
  .game-controls button {
    padding: 10px 20px;
    margin: 0 10px;
    font-size: 16px;
    cursor: pointer;
    background: var(--theme, #3498db);
    color: white;
    border: none;
    border-radius: 5px;
    transition: all 0.3s;
  }
  
  .game-controls button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
  
  .game-controls button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .game-info {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin: 20px 0;
    font-size: 18px;
  }
  
  .game-board-container {
    position: relative;
    display: inline-block;
    margin: 20px 0;
  }
  
  #gameCanvas {
    border: 3px solid var(--text, #333);
    background: linear-gradient(to bottom, #0f0c29, #302b63, #24243e);
    display: block;
  }
  
  .game-over {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.9);
    color: white;
    padding: 30px;
    border-radius: 10px;
    text-align: center;
  }
  
  .game-over.hidden {
    display: none;
  }
  
  .game-over button {
    margin-top: 15px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    background: var(--theme, #3498db);
    color: white;
    border: none;
    border-radius: 5px;
  }
  
  .game-instructions {
    margin-top: 30px;
    text-align: left;
    padding: 20px;
    background: var(--block, #f5f5f5);
    border-radius: 10px;
  }
  
  .game-instructions h3 {
    margin-bottom: 15px;
  }
  
  .game-instructions ul {
    list-style: none;
    padding: 0;
  }
  
  .game-instructions li {
    padding: 8px 0;
    padding-left: 20px;
    position: relative;
  }
  
  .game-instructions li:before {
    content: "•";
    position: absolute;
    left: 0;
    color: var(--theme, #3498db);
  }
</style>

<script>
  const airplaneCanvas = document.getElementById('gameCanvas');
  const airplaneCtx = airplaneCanvas.getContext('2d');
  
  let player = {
    x: 240,
    y: 580,
    width: 40,
    height: 40,
    speed: 5
  };
  
  let bullets = [];
  let enemies = [];
  let score = 0;
  let highScore = localStorage.getItem('airplaneHighScore') || 0;
  let lives = 3;
  let gameLoop = null;
  let isPaused = false;
  let enemySpawnTimer = 0;
  
  document.getElementById('highScore').textContent = highScore;
  
  function drawPlayer() {
    airplaneCtx.fillStyle = '#00ff00';
    airplaneCtx.beginPath();
    airplaneCtx.moveTo(player.x, player.y - player.height / 2);
    airplaneCtx.lineTo(player.x - player.width / 2, player.y + player.height / 2);
    airplaneCtx.lineTo(player.x + player.width / 2, player.y + player.height / 2);
    airplaneCtx.closePath();
    airplaneCtx.fill();
    
    airplaneCtx.fillStyle = '#00cc00';
    airplaneCtx.fillRect(player.x - 5, player.y - 10, 10, 20);
  }
  
  function drawBullets() {
    airplaneCtx.fillStyle = '#ffff00';
    for (let bullet of bullets) {
      airplaneCtx.fillRect(bullet.x - 2, bullet.y - 8, 4, 16);
    }
  }
  
  function drawEnemies() {
    for (let enemy of enemies) {
      airplaneCtx.fillStyle = '#ff0000';
      airplaneCtx.beginPath();
      airplaneCtx.moveTo(enemy.x, enemy.y + enemy.height / 2);
      airplaneCtx.lineTo(enemy.x - enemy.width / 2, enemy.y - enemy.height / 2);
      airplaneCtx.lineTo(enemy.x + enemy.width / 2, enemy.y - enemy.height / 2);
      airplaneCtx.closePath();
      airplaneCtx.fill();
      
      airplaneCtx.fillStyle = '#cc0000';
      airplaneCtx.fillRect(enemy.x - 5, enemy.y - 10, 10, 20);
    }
  }
  
  function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
      bullets[i].y -= 10;
      if (bullets[i].y < 0) {
        bullets.splice(i, 1);
      }
    }
  }
  
  function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
      enemies[i].y += enemies[i].speed;
      
      if (enemies[i].y > airplaneCanvas.height) {
        enemies.splice(i, 1);
        continue;
      }
      
      // 检测与玩家碰撞
      if (checkCollision(player, enemies[i])) {
        lives--;
        document.getElementById('lives').textContent = lives;
        enemies.splice(i, 1);
        
        if (lives === 0) {
          gameOver();
        }
        continue;
      }
      
      // 检测与子弹碰撞
      for (let j = bullets.length - 1; j >= 0; j--) {
        if (checkCollision(bullets[j], enemies[i])) {
          score += 10;
          document.getElementById('score').textContent = score;
          
          if (score > highScore) {
            highScore = score;
            document.getElementById('highScore').textContent = highScore;
            localStorage.setItem('airplaneHighScore', highScore);
          }
          
          bullets.splice(j, 1);
          enemies.splice(i, 1);
          break;
        }
      }
    }
  }
  
  function checkCollision(obj1, obj2) {
    const x1 = obj1.x - (obj1.width || 4) / 2;
    const y1 = obj1.y - (obj1.height || 16) / 2;
    const w1 = obj1.width || 4;
    const h1 = obj1.height || 16;
    
    const x2 = obj2.x - obj2.width / 2;
    const y2 = obj2.y - obj2.height / 2;
    
    return x1 < x2 + obj2.width &&
           x1 + w1 > x2 &&
           y1 < y2 + obj2.height &&
           y1 + h1 > y2;
  }
  
  function spawnEnemy() {
    enemySpawnTimer++;
    if (enemySpawnTimer >= 60) {
      enemySpawnTimer = 0;
      enemies.push({
        x: Math.random() * (airplaneCanvas.width - 40) + 20,
        y: -20,
        width: 40,
        height: 40,
        speed: 2 + Math.random() * 2
      });
    }
  }
  
  function draw() {
    airplaneCtx.clearRect(0, 0, airplaneCanvas.width, airplaneCanvas.height);
    
    drawPlayer();
    drawBullets();
    drawEnemies();
    
    updateBullets();
    updateEnemies();
    spawnEnemy();
  }
  
  function gameStep() {
    if (!isPaused) {
      draw();
    }
    gameLoop = requestAnimationFrame(gameStep);
  }
  
  function startGame() {
    score = 0;
    lives = 3;
    bullets = [];
    enemies = [];
    enemySpawnTimer = 0;
    player.x = 240;
    player.y = 580;
    
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('gameOver').classList.add('hidden');
    
    if (gameLoop) {
      cancelAnimationFrame(gameLoop);
    }
    
    gameLoop = requestAnimationFrame(gameStep);
  }
  
  function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? '继续' : '暂停';
  }
  
  function gameOver() {
    cancelAnimationFrame(gameLoop);
    gameLoop = null;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
  }
  
  function restartGame() {
    startGame();
  }
  
  // 键盘控制
  let keys = {};
  
  document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ') {
      e.preventDefault();
      if (gameLoop && !isPaused) {
        bullets.push({
          x: player.x,
          y: player.y - player.height / 2
        });
      }
    }
  });
  
  document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
  });
  
  // 移动更新
  setInterval(() => {
    if (!gameLoop || isPaused) return;
    
    if ((keys['ArrowLeft'] || keys['a'] || keys['A']) && player.x > player.width / 2) {
      player.x -= player.speed;
    }
    if ((keys['ArrowRight'] || keys['d'] || keys['D']) && player.x < airplaneCanvas.width - player.width / 2) {
      player.x += player.speed;
    }
    if ((keys['ArrowUp'] || keys['w'] || keys['W']) && player.y > player.height / 2) {
      player.y -= player.speed;
    }
    if ((keys['ArrowDown'] || keys['s'] || keys['S']) && player.y < airplaneCanvas.height - player.height / 2) {
      player.y += player.speed;
    }
  }, 16);
  
  // 初始绘制
  draw();
</script>
{% endraw %}
