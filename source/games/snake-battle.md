---
title: 贪吃蛇大作战
layout: page
leftbar: 
rightbar: 
---

{% raw %}
<div class="game-container">
  <div class="game-header">
    <h1>🐍⚔️ 贪吃蛇大作战</h1>
    <div class="game-controls">
      <button id="startBtn" onclick="startGame()">开始游戏</button>
      <button id="pauseBtn" onclick="togglePause()" disabled>暂停</button>
    </div>
    <div class="game-info">
      <div class="score">你的得分: <span id="score">0</span></div>
      <div class="ai-score">AI得分: <span id="aiScore">0</span></div>
    </div>
  </div>
  
  <div class="game-board-container">
    <canvas id="gameCanvas" width="500" height="500"></canvas>
    <div id="gameOver" class="game-over hidden">
      <h2 id="resultText">游戏结束!</h2>
      <p id="finalScoreText"></p>
      <button onclick="restartGame()">重新开始</button>
    </div>
  </div>
  
  <div class="game-instructions">
    <h3>游戏说明</h3>
    <ul>
      <li>你控制绿色蛇，AI控制红色蛇</li>
      <li>使用方向键或 WASD 控制蛇的移动方向</li>
      <li>吃到食物得分，蛇身会变长</li>
      <li>撞到墙壁、自己或对方游戏结束</li>
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
  
  .ai-score {
    color: #e74c3c;
  }
  
  .game-board-container {
    position: relative;
    display: inline-block;
    margin: 20px 0;
  }
  
  #gameCanvas {
    border: 3px solid var(--text, #333);
    background: #1a1a2e;
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
  const battleCanvas = document.getElementById('gameCanvas');
  const battleCtx = battleCanvas.getContext('2d');
  
  const GRID_SIZE = 20;
  const TILE_COUNT = battleCanvas.width / GRID_SIZE;
  
  let playerSnake = [];
  let aiSnake = [];
  let foods = [];
  let playerDirection = { x: 1, y: 0 };
  let playerNextDirection = { x: 1, y: 0 };
  let aiDirection = { x: -1, y: 0 };
  let playerScore = 0;
  let aiScore = 0;
  let gameLoop = null;
  let isPaused = false;
  let gameSpeed = 120;
  
  function initGame() {
    playerSnake = [
      { x: 5, y: Math.floor(TILE_COUNT / 2) },
      { x: 4, y: Math.floor(TILE_COUNT / 2) },
      { x: 3, y: Math.floor(TILE_COUNT / 2) }
    ];
    
    aiSnake = [
      { x: TILE_COUNT - 6, y: Math.floor(TILE_COUNT / 2) },
      { x: TILE_COUNT - 5, y: Math.floor(TILE_COUNT / 2) },
      { x: TILE_COUNT - 4, y: Math.floor(TILE_COUNT / 2) }
    ];
    
    playerDirection = { x: 1, y: 0 };
    playerNextDirection = { x: 1, y: 0 };
    aiDirection = { x: -1, y: 0 };
    playerScore = 0;
    aiScore = 0;
    gameSpeed = 120;
    
    document.getElementById('score').textContent = playerScore;
    document.getElementById('aiScore').textContent = aiScore;
    
    foods = [];
    for (let i = 0; i < 3; i++) {
      generateFood();
    }
  }
  
  function generateFood() {
    let food;
    let attempts = 0;
    do {
      food = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT)
      };
      attempts++;
    } while (isOccupied(food) && attempts < 100);
    
    if (attempts < 100) {
      foods.push(food);
    }
  }
  
  function isOccupied(pos) {
    for (let segment of playerSnake) {
      if (segment.x === pos.x && segment.y === pos.y) return true;
    }
    for (let segment of aiSnake) {
      if (segment.x === pos.x && segment.y === pos.y) return true;
    }
    for (let food of foods) {
      if (food.x === pos.x && food.y === pos.y) return true;
    }
    return false;
  }
  
  function draw() {
    battleCtx.fillStyle = '#1a1a2e';
    battleCtx.fillRect(0, 0, battleCanvas.width, battleCanvas.height);
    
    battleCtx.strokeStyle = '#2a2a4e';
    battleCtx.lineWidth = 0.5;
    for (let i = 0; i <= TILE_COUNT; i++) {
      battleCtx.beginPath();
      battleCtx.moveTo(i * GRID_SIZE, 0);
      battleCtx.lineTo(i * GRID_SIZE, battleCanvas.height);
      battleCtx.stroke();
      battleCtx.beginPath();
      battleCtx.moveTo(0, i * GRID_SIZE);
      battleCtx.lineTo(battleCanvas.width, i * GRID_SIZE);
      battleCtx.stroke();
    }
    
    playerSnake.forEach((segment, index) => {
      battleCtx.fillStyle = index === 0 ? '#2ecc71' : '#27ae60';
      battleCtx.fillRect(
        segment.x * GRID_SIZE + 1,
        segment.y * GRID_SIZE + 1,
        GRID_SIZE - 2,
        GRID_SIZE - 2
      );
    });
    
    aiSnake.forEach((segment, index) => {
      battleCtx.fillStyle = index === 0 ? '#e74c3c' : '#c0392b';
      battleCtx.fillRect(
        segment.x * GRID_SIZE + 1,
        segment.y * GRID_SIZE + 1,
        GRID_SIZE - 2,
        GRID_SIZE - 2
      );
    });
    
    battleCtx.fillStyle = '#f1c40f';
    foods.forEach(food => {
      battleCtx.beginPath();
      battleCtx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
      );
      battleCtx.fill();
    });
  }
  
  function getAIDirection() {
    const head = aiSnake[0];
    let bestDirection = aiDirection;
    let bestScore = -Infinity;
    
    const directions = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 }
    ];
    
    for (let dir of directions) {
      if (dir.x === -aiDirection.x && dir.y === -aiDirection.y) continue;
      
      const newX = head.x + dir.x;
      const newY = head.y + dir.y;
      
      if (newX < 0 || newX >= TILE_COUNT || newY < 0 || newY >= TILE_COUNT) continue;
      
      let collision = false;
      for (let i = 0; i < aiSnake.length - 1; i++) {
        if (aiSnake[i].x === newX && aiSnake[i].y === newY) {
          collision = true;
          break;
        }
      }
      for (let segment of playerSnake) {
        if (segment.x === newX && segment.y === newY) {
          collision = true;
          break;
        }
      }
      
      if (collision) continue;
      
      let score = 0;
      
      let minDist = Infinity;
      for (let food of foods) {
        const dist = Math.abs(food.x - newX) + Math.abs(food.y - newY);
        minDist = Math.min(minDist, dist);
      }
      score = -minDist;
      
      let spaceCount = 0;
      for (let dx = -3; dx <= 3; dx++) {
        for (let dy = -3; dy <= 3; dy++) {
          const checkX = newX + dx;
          const checkY = newY + dy;
          if (checkX >= 0 && checkX < TILE_COUNT && checkY >= 0 && checkY < TILE_COUNT) {
            let occupied = false;
            for (let segment of aiSnake) {
              if (segment.x === checkX && segment.y === checkY) {
                occupied = true;
                break;
              }
            }
            for (let segment of playerSnake) {
              if (segment.x === checkX && segment.y === checkY) {
                occupied = true;
                break;
              }
            }
            if (!occupied) spaceCount++;
          }
        }
      }
      score += spaceCount * 0.5;
      
      if (score > bestScore) {
        bestScore = score;
        bestDirection = dir;
      }
    }
    
    return bestDirection;
  }
  
  function update() {
    playerDirection = { ...playerNextDirection };
    aiDirection = getAIDirection();
    
    const playerHead = {
      x: playerSnake[0].x + playerDirection.x,
      y: playerSnake[0].y + playerDirection.y
    };
    
    const aiHead = {
      x: aiSnake[0].x + aiDirection.x,
      y: aiSnake[0].y + aiDirection.y
    };
    
    let playerDead = false;
    let aiDead = false;
    
    if (playerHead.x < 0 || playerHead.x >= TILE_COUNT || 
        playerHead.y < 0 || playerHead.y >= TILE_COUNT) {
      playerDead = true;
    }
    
    if (aiHead.x < 0 || aiHead.x >= TILE_COUNT || 
        aiHead.y < 0 || aiHead.y >= TILE_COUNT) {
      aiDead = true;
    }
    
    for (let i = 0; i < playerSnake.length; i++) {
      if (playerHead.x === playerSnake[i].x && playerHead.y === playerSnake[i].y) {
        playerDead = true;
      }
    }
    
    for (let i = 0; i < aiSnake.length; i++) {
      if (playerHead.x === aiSnake[i].x && playerHead.y === aiSnake[i].y) {
        playerDead = true;
      }
    }
    
    for (let i = 0; i < aiSnake.length; i++) {
      if (aiHead.x === aiSnake[i].x && aiHead.y === aiSnake[i].y) {
        aiDead = true;
      }
    }
    
    for (let segment of playerSnake) {
      if (aiHead.x === segment.x && aiHead.y === segment.y) {
        aiDead = true;
      }
    }
    
    if (playerHead.x === aiHead.x && playerHead.y === aiHead.y) {
      playerDead = true;
      aiDead = true;
    }
    
    if (playerDead || aiDead) {
      gameOver(playerDead, aiDead);
      return;
    }
    
    playerSnake.unshift(playerHead);
    aiSnake.unshift(aiHead);
    
    let playerAte = false;
    let aiAte = false;
    
    for (let i = foods.length - 1; i >= 0; i--) {
      if (playerHead.x === foods[i].x && playerHead.y === foods[i].y) {
        playerScore += 10;
        document.getElementById('score').textContent = playerScore;
        foods.splice(i, 1);
        generateFood();
        playerAte = true;
      } else if (aiHead.x === foods[i].x && aiHead.y === foods[i].y) {
        aiScore += 10;
        document.getElementById('aiScore').textContent = aiScore;
        foods.splice(i, 1);
        generateFood();
        aiAte = true;
      }
    }
    
    if (!playerAte) {
      playerSnake.pop();
    }
    
    if (!aiAte) {
      aiSnake.pop();
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
  
  function gameOver(playerDead, aiDead) {
    clearInterval(gameLoop);
    gameLoop = null;
    
    let resultText = '';
    if (playerDead && aiDead) {
      resultText = '平局!';
    } else if (playerDead) {
      resultText = 'AI获胜!';
    } else {
      resultText = '你赢了!';
    }
    
    document.getElementById('resultText').textContent = resultText;
    document.getElementById('finalScoreText').textContent = 
      `你的得分: ${playerScore} | AI得分: ${aiScore}`;
    document.getElementById('gameOver').classList.remove('hidden');
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
  }
  
  function restartGame() {
    startGame();
  }
  
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
        if (playerDirection.y !== 1) {
          playerNextDirection = { x: 0, y: -1 };
        }
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (playerDirection.y !== -1) {
          playerNextDirection = { x: 0, y: 1 };
        }
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (playerDirection.x !== 1) {
          playerNextDirection = { x: -1, y: 0 };
        }
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (playerDirection.x !== -1) {
          playerNextDirection = { x: 1, y: 0 };
        }
        break;
    }
  });
  
  initGame();
  draw();
</script>
{% endraw %}
