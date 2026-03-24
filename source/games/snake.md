---
title: 贪吃蛇
layout: page
---

{% raw %}
<div class="game-container">
  <div class="game-header">
    <h1>🐍 贪吃蛇</h1>
    <div class="game-controls">
      <button id="startBtn" onclick="startGame()">开始游戏</button>
      <button id="pauseBtn" onclick="togglePause()" disabled>暂停</button>
    </div>
    <div class="game-info">
      <div class="score">得分: <span id="score">0</span></div>
      <div class="high-score">最高分: <span id="highScore">0</span></div>
    </div>
  </div>
  
  <div class="game-board-container">
    <canvas id="gameCanvas" width="400" height="400"></canvas>
    <div id="gameOver" class="game-over hidden">
      <h2>游戏结束!</h2>
      <p>得分: <span id="finalScore">0</span></p>
      <button onclick="restartGame()">重新开始</button>
    </div>
  </div>
  
  <div class="game-instructions">
    <h3>游戏说明</h3>
    <ul>
      <li>使用方向键或 WASD 控制蛇的移动方向</li>
      <li>吃到食物得分，蛇身会变长</li>
      <li>撞到墙壁或自己的身体游戏结束</li>
      <li>按空格键暂停/继续游戏</li>
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
    font-size: 2em;
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
    background: #f0f0f0;
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
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  
  const gridSize = 20;
  const tileCount = canvas.width / gridSize;
  
  let snake = [];
  let food = {};
  let direction = { x: 1, y: 0 };
  let nextDirection = { x: 1, y: 0 };
  let score = 0;
  let highScore = localStorage.getItem('snakeHighScore') || 0;
  let gameLoop = null;
  let isPaused = false;
  let gameSpeed = 100;
  
  document.getElementById('highScore').textContent = highScore;
  
  function initGame() {
    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    gameSpeed = 100;
    document.getElementById('score').textContent = score;
    generateFood();
  }
  
  function generateFood() {
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
    
    // 确保食物不在蛇身上
    for (let segment of snake) {
      if (segment.x === food.x && segment.y === food.y) {
        generateFood();
        return;
      }
    }
  }
  
  function draw() {
    // 清空画布
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= tileCount; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSize, 0);
      ctx.lineTo(i * gridSize, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * gridSize);
      ctx.lineTo(canvas.width, i * gridSize);
      ctx.stroke();
    }
    
    // 绘制蛇
    snake.forEach((segment, index) => {
      if (index === 0) {
        ctx.fillStyle = '#2ecc71';
      } else {
        ctx.fillStyle = '#27ae60';
      }
      ctx.fillRect(
        segment.x * gridSize + 1,
        segment.y * gridSize + 1,
        gridSize - 2,
        gridSize - 2
      );
    });
    
    // 绘制食物
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(
      food.x * gridSize + gridSize / 2,
      food.y * gridSize + gridSize / 2,
      gridSize / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  
  function update() {
    direction = { ...nextDirection };
    
    const head = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y
    };
    
    // 检查碰撞
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
      gameOver();
      return;
    }
    
    for (let segment of snake) {
      if (head.x === segment.x && head.y === segment.y) {
        gameOver();
        return;
      }
    }
    
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      document.getElementById('score').textContent = score;
      
      if (score > highScore) {
        highScore = score;
        document.getElementById('highScore').textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
      }
      
      generateFood();
      
      // 加速
      if (gameSpeed > 50) {
        gameSpeed -= 2;
        clearInterval(gameLoop);
        gameLoop = setInterval(gameStep, gameSpeed);
      }
    } else {
      snake.pop();
    }
  }
  
  function gameStep() {
    if (!isPaused) {
      update();
      draw();
    }
  }
  
  function startGame() {
    initGame();
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('gameOver').classList.add('hidden');
    
    if (gameLoop) {
      clearInterval(gameLoop);
    }
    
    draw();
    gameLoop = setInterval(gameStep, gameSpeed);
  }
  
  function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? '继续' : '暂停';
  }
  
  function gameOver() {
    clearInterval(gameLoop);
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
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (gameLoop) {
        togglePause();
      }
      return;
    }
    
    if (isPaused) return;
    
    switch(e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (direction.y !== 1) {
          nextDirection = { x: 0, y: -1 };
        }
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (direction.y !== -1) {
          nextDirection = { x: 0, y: 1 };
        }
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (direction.x !== 1) {
          nextDirection = { x: -1, y: 0 };
        }
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (direction.x !== -1) {
          nextDirection = { x: 1, y: 0 };
        }
        break;
    }
  });
  
  // 初始绘制
  initGame();
  draw();
</script>
{% endraw %}
