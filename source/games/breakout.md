---
title: 打砖块
layout: page
---

{% raw %}
<div class="game-container">
  <div class="game-header">
    <h1>🧱 打砖块</h1>
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
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <div id="gameOver" class="game-over hidden">
      <h2>游戏结束!</h2>
      <p>得分: <span id="finalScore">0</span></p>
      <button onclick="restartGame()">重新开始</button>
    </div>
    <div id="gameWin" class="game-win hidden">
      <h2>🎉 恭喜过关!</h2>
      <p>得分: <span id="winScore">0</span></p>
      <button onclick="nextLevel()">下一关</button>
    </div>
  </div>
  
  <div class="game-instructions">
    <h3>游戏说明</h3>
    <ul>
      <li>使用鼠标或方向键左右移动挡板</li>
      <li>用球击碎所有砖块</li>
      <li>不同颜色的砖块分值不同</li>
      <li>球掉落会失去一条生命</li>
    </ul>
  </div>
</div>

<style>
  .game-container {
    max-width: 900px;
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
    background: linear-gradient(to bottom, #1a1a2e, #16213e);
    display: block;
  }
  
  .game-over, .game-win {
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
  
  .game-over.hidden, .game-win.hidden {
    display: none;
  }
  
  .game-over button, .game-win button {
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
  const breakoutCanvas = document.getElementById('gameCanvas');
  const breakoutCtx = breakoutCanvas.getContext('2d');
  
  let paddle = {
    width: 100,
    height: 15,
    x: 350,
    speed: 8
  };
  
  let ball = {
    x: 400,
    y: 550,
    radius: 8,
    dx: 4,
    dy: -4,
    speed: 5
  };
  
  let bricks = [];
  let score = 0;
  let highScore = localStorage.getItem('breakoutHighScore') || 0;
  let lives = 3;
  let level = 1;
  let gameLoop = null;
  let isPaused = false;
  
  document.getElementById('highScore').textContent = highScore;
  
  const brickRowCount = 6;
  const brickColumnCount = 10;
  const brickWidth = 73;
  const brickHeight = 25;
  const brickPadding = 3;
  const brickOffsetTop = 50;
  const brickOffsetLeft = 18;
  
  const brickColors = [
    '#e74c3c', // 红
    '#e67e22', // 橙
    '#f1c40f', // 黄
    '#2ecc71', // 绿
    '#3498db', // 蓝
    '#9b59b6'  // 紫
  ];
  
  const brickPoints = [50, 40, 30, 20, 10, 10];
  
  function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { 
          x: 0, 
          y: 0, 
          status: 1,
          color: brickColors[r],
          points: brickPoints[r]
        };
      }
    }
  }
  
  function drawPaddle() {
    breakoutCtx.beginPath();
    breakoutCtx.rect(paddle.x, breakoutCanvas.height - paddle.height - 10, paddle.width, paddle.height);
    breakoutCtx.fillStyle = '#ecf0f1';
    breakoutCtx.fill();
    breakoutCtx.closePath();
  }
  
  function drawBall() {
    breakoutCtx.beginPath();
    breakoutCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    breakoutCtx.fillStyle = '#ecf0f1';
    breakoutCtx.fill();
    breakoutCtx.closePath();
  }
  
  function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (bricks[c][r].status === 1) {
          const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
          const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
          bricks[c][r].x = brickX;
          bricks[c][r].y = brickY;
          
          breakoutCtx.beginPath();
          breakoutCtx.rect(brickX, brickY, brickWidth, brickHeight);
          breakoutCtx.fillStyle = bricks[c][r].color;
          breakoutCtx.fill();
          breakoutCtx.strokeStyle = 'rgba(255,255,255,0.3)';
          breakoutCtx.stroke();
          breakoutCtx.closePath();
        }
      }
    }
  }
  
  function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        const b = bricks[c][r];
        if (b.status === 1) {
          if (ball.x > b.x && ball.x < b.x + brickWidth && 
              ball.y > b.y && ball.y < b.y + brickHeight) {
            ball.dy = -ball.dy;
            b.status = 0;
            score += b.points;
            document.getElementById('score').textContent = score;
            
            if (score > highScore) {
              highScore = score;
              document.getElementById('highScore').textContent = highScore;
              localStorage.setItem('breakoutHighScore', highScore);
            }
            
            // 检查是否全部消除
            let allDestroyed = true;
            for (let i = 0; i < brickColumnCount; i++) {
              for (let j = 0; j < brickRowCount; j++) {
                if (bricks[i][j].status === 1) {
                  allDestroyed = false;
                  break;
                }
              }
            }
            
            if (allDestroyed) {
              gameWin();
            }
          }
        }
      }
    }
  }
  
  function draw() {
    breakoutCtx.clearRect(0, 0, breakoutCanvas.width, breakoutCanvas.height);
    
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();
    
    // 墙壁碰撞
    if (ball.x + ball.dx > breakoutCanvas.width - ball.radius) {
      ball.x = breakoutCanvas.width - ball.radius;
      ball.dx = -ball.dx;
    } else if (ball.x + ball.dx < ball.radius) {
      ball.x = ball.radius;
      ball.dx = -ball.dx;
    }
    
    if (ball.y + ball.dy < ball.radius) {
      ball.y = ball.radius;
      ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > breakoutCanvas.height - ball.radius - paddle.height - 10) {
      // 挡板碰撞
      if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        // 根据击中位置改变角度
        let hitPoint = (ball.x - paddle.x) / paddle.width;
        let angle = (hitPoint - 0.5) * Math.PI * 0.7;
        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = -ball.speed * Math.cos(angle);
      } else if (ball.y + ball.dy > breakoutCanvas.height - ball.radius) {
        // 掉落
        lives--;
        document.getElementById('lives').textContent = lives;
        
        if (lives === 0) {
          gameOver();
        } else {
          resetBall();
        }
      }
    }
    
    ball.x += ball.dx;
    ball.y += ball.dy;
  }
  
  function resetBall() {
    ball.x = breakoutCanvas.width / 2;
    ball.y = breakoutCanvas.height - 50;
    ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = -4;
    paddle.x = breakoutCanvas.width / 2 - paddle.width / 2;
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
    level = 1;
    ball.speed = 5;
    
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    
    initBricks();
    resetBall();
    
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('gameOver').classList.add('hidden');
    document.getElementById('gameWin').classList.add('hidden');
    
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
  
  function gameWin() {
    cancelAnimationFrame(gameLoop);
    gameLoop = null;
    document.getElementById('winScore').textContent = score;
    document.getElementById('gameWin').classList.remove('hidden');
  }
  
  function nextLevel() {
    level++;
    ball.speed += 0.5;
    initBricks();
    resetBall();
    document.getElementById('gameWin').classList.add('hidden');
    gameLoop = requestAnimationFrame(gameStep);
  }
  
  function restartGame() {
    startGame();
  }
  
  // 键盘控制
  let leftPressed = false;
  let rightPressed = false;
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      leftPressed = true;
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      rightPressed = true;
    }
  });
  
  document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      leftPressed = false;
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      rightPressed = false;
    }
  });
  
  // 鼠标控制
  breakoutCanvas.addEventListener('mousemove', (e) => {
    const rect = breakoutCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    if (mouseX > paddle.width / 2 && mouseX < breakoutCanvas.width - paddle.width / 2) {
      paddle.x = mouseX - paddle.width / 2;
    }
  });
  
  // 键盘移动更新
  setInterval(() => {
    if (leftPressed && paddle.x > 0) {
      paddle.x -= paddle.speed;
    } else if (rightPressed && paddle.x < breakoutCanvas.width - paddle.width) {
      paddle.x += paddle.speed;
    }
  }, 16);
  
  // 初始绘制
  initBricks();
  draw();
</script>
{% endraw %}
