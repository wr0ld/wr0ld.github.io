---
title: 俄罗斯方块
layout: page
---

{% raw %}
<div class="game-container">
  <div class="game-header">
    <h1>🎮 俄罗斯方块</h1>
    <div class="game-controls">
      <button id="startBtn" onclick="startGame()">开始游戏</button>
      <button id="pauseBtn" onclick="togglePause()" disabled>暂停</button>
    </div>
    <div class="game-info">
      <div class="score">得分: <span id="score">0</span></div>
      <div class="high-score">最高分: <span id="highScore">0</span></div>
      <div class="level">等级: <span id="level">1</span></div>
      <div class="lines">消行: <span id="lines">0</span></div>
    </div>
  </div>
  
  <div class="game-board-container">
    <div class="game-sidebar">
      <div class="next-piece">
        <h3>下一个</h3>
        <canvas id="nextCanvas" width="120" height="120"></canvas>
      </div>
    </div>
    <canvas id="gameCanvas" width="300" height="600"></canvas>
    <div id="gameOver" class="game-over hidden">
      <h2>游戏结束!</h2>
      <p>得分: <span id="finalScore">0</span></p>
      <button onclick="restartGame()">重新开始</button>
    </div>
  </div>
  
  <div class="game-instructions">
    <h3>游戏说明</h3>
    <ul>
      <li>使用方向键或 WASD 控制方块移动和旋转</li>
      <li>←/A: 左移 | →/D: 右移 | ↑/W: 旋转 | ↓/S: 快速下落</li>
      <li>空格键: 直接落到底部</li>
      <li>填满一行即可消除，得分升级</li>
    </ul>
  </div>
</div>

<style>
  .game-container {
    max-width: 700px;
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
    display: inline-flex;
    gap: 20px;
    margin: 20px 0;
    align-items: flex-start;
  }
  
  .game-sidebar {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .next-piece {
    background: var(--block, #f5f5f5);
    padding: 15px;
    border-radius: 10px;
    border: 2px solid var(--text, #333);
  }
  
  .next-piece h3 {
    margin-bottom: 10px;
    font-size: 16px;
  }
  
  #gameCanvas {
    border: 3px solid var(--text, #333);
    background: #000;
    display: block;
  }
  
  #nextCanvas {
    background: #000;
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
  const nextCanvas = document.getElementById('nextCanvas');
  const nextCtx = nextCanvas.getContext('2d');
  
  const COLS = 10;
  const ROWS = 20;
  const BLOCK_SIZE = 30;
  
  const COLORS = [
    '#000000',
    '#00FFFF', // I - 青色
    '#0000FF', // J - 蓝色
    '#FF7F00', // L - 橙色
    '#FFFF00', // O - 黄色
    '#00FF00', // S - 绿色
    '#800080', // T - 紫色
    '#FF0000'  // Z - 红色
  ];
  
  const SHAPES = [
    [],
    [[1,1,1,1]],                         // I
    [[2,0,0],[2,2,2]],                   // J
    [[0,0,3],[3,3,3]],                   // L
    [[4,4],[4,4]],                       // O
    [[0,5,5],[5,5,0]],                   // S
    [[0,6,0],[6,6,6]],                   // T
    [[7,7,0],[0,7,7]]                    // Z
  ];
  
  let board = [];
  let currentPiece = null;
  let nextPiece = null;
  let score = 0;
  let highScore = localStorage.getItem('tetrisHighScore') || 0;
  let level = 1;
  let lines = 0;
  let gameLoop = null;
  let isPaused = false;
  let dropInterval = 1000;
  let lastDrop = 0;
  
  document.getElementById('highScore').textContent = highScore;
  
  function initBoard() {
    board = [];
    for (let r = 0; r < ROWS; r++) {
      board[r] = [];
      for (let c = 0; c < COLS; c++) {
        board[r][c] = 0;
      }
    }
  }
  
  function createPiece(type) {
    const shape = SHAPES[type];
    return {
      type: type,
      shape: shape,
      x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
      y: 0
    };
  }
  
  function randomPiece() {
    const type = Math.floor(Math.random() * 7) + 1;
    return createPiece(type);
  }
  
  function rotate(piece) {
    const newShape = [];
    for (let c = 0; c < piece.shape[0].length; c++) {
      newShape[c] = [];
      for (let r = piece.shape.length - 1; r >= 0; r--) {
        newShape[c][piece.shape.length - 1 - r] = piece.shape[r][c];
      }
    }
    return newShape;
  }
  
  function collision(piece, offsetX = 0, offsetY = 0, newShape = null) {
    const shape = newShape || piece.shape;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = piece.x + c + offsetX;
          const newY = piece.y + r + offsetY;
          
          if (newX < 0 || newX >= COLS || newY >= ROWS) {
            return true;
          }
          
          if (newY >= 0 && board[newY][newX]) {
            return true;
          }
        }
      }
    }
    return false;
  }
  
  function merge(piece) {
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          if (piece.y + r < 0) {
            return false;
          }
          board[piece.y + r][piece.x + c] = piece.type;
        }
      }
    }
    return true;
  }
  
  function clearLines() {
    let linesCleared = 0;
    
    for (let r = ROWS - 1; r >= 0; r--) {
      let full = true;
      for (let c = 0; c < COLS; c++) {
        if (!board[r][c]) {
          full = false;
          break;
        }
      }
      
      if (full) {
        board.splice(r, 1);
        board.unshift(new Array(COLS).fill(0));
        linesCleared++;
        r++;
      }
    }
    
    if (linesCleared > 0) {
      const points = [0, 100, 300, 500, 800];
      score += points[linesCleared] * level;
      lines += linesCleared;
      level = Math.floor(lines / 10) + 1;
      dropInterval = Math.max(100, 1000 - (level - 1) * 100);
      
      if (score > highScore) {
        highScore = score;
        document.getElementById('highScore').textContent = highScore;
        localStorage.setItem('tetrisHighScore', highScore);
      }
      
      document.getElementById('score').textContent = score;
      document.getElementById('level').textContent = level;
      document.getElementById('lines').textContent = lines;
    }
  }
  
  function drawBlock(ctx, x, y, type) {
    if (type) {
      ctx.fillStyle = COLORS[type];
      ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      ctx.strokeStyle = '#222';
      ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }
  }
  
  function draw() {
    // 清空画布
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    ctx.strokeStyle = '#222';
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * BLOCK_SIZE);
      ctx.lineTo(canvas.width, r * BLOCK_SIZE);
      ctx.stroke();
    }
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * BLOCK_SIZE, 0);
      ctx.lineTo(c * BLOCK_SIZE, canvas.height);
      ctx.stroke();
    }
    
    // 绘制已固定的方块
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        drawBlock(ctx, c, r, board[r][c]);
      }
    }
    
    // 绘制当前方块
    if (currentPiece) {
      for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
          if (currentPiece.shape[r][c]) {
            drawBlock(ctx, currentPiece.x + c, currentPiece.y + r, currentPiece.type);
          }
        }
      }
    }
    
    // 绘制下一个方块
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (nextPiece) {
      const offsetX = (4 - nextPiece.shape[0].length) / 2;
      const offsetY = (4 - nextPiece.shape.length) / 2;
      
      for (let r = 0; r < nextPiece.shape.length; r++) {
        for (let c = 0; c < nextPiece.shape[r].length; c++) {
          if (nextPiece.shape[r][c]) {
            nextCtx.fillStyle = COLORS[nextPiece.type];
            nextCtx.fillRect(
              (offsetX + c) * BLOCK_SIZE,
              (offsetY + r) * BLOCK_SIZE,
              BLOCK_SIZE,
              BLOCK_SIZE
            );
            nextCtx.strokeStyle = '#222';
            nextCtx.strokeRect(
              (offsetX + c) * BLOCK_SIZE,
              (offsetY + r) * BLOCK_SIZE,
              BLOCK_SIZE,
              BLOCK_SIZE
            );
          }
        }
      }
    }
  }
  
  function drop() {
    if (!collision(currentPiece, 0, 1)) {
      currentPiece.y++;
    } else {
      if (!merge(currentPiece)) {
        gameOver();
        return;
      }
      clearLines();
      currentPiece = nextPiece;
      nextPiece = randomPiece();
      
      if (collision(currentPiece)) {
        gameOver();
        return;
      }
    }
  }
  
  function gameStep(timestamp) {
    if (!isPaused) {
      if (timestamp - lastDrop > dropInterval) {
        drop();
        lastDrop = timestamp;
      }
      draw();
    }
    gameLoop = requestAnimationFrame(gameStep);
  }
  
  function startGame() {
    initBoard();
    score = 0;
    level = 1;
    lines = 0;
    dropInterval = 1000;
    lastDrop = 0;
    
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
    
    currentPiece = randomPiece();
    nextPiece = randomPiece();
    
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('gameOver').classList.add('hidden');
    
    if (gameLoop) {
      cancelAnimationFrame(gameLoop);
    }
    
    draw();
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
  document.addEventListener('keydown', (e) => {
    if (!currentPiece || isPaused) return;
    
    switch(e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (!collision(currentPiece, -1, 0)) {
          currentPiece.x--;
        }
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (!collision(currentPiece, 1, 0)) {
          currentPiece.x++;
        }
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        drop();
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
        const rotated = rotate(currentPiece);
        if (!collision(currentPiece, 0, 0, rotated)) {
          currentPiece.shape = rotated;
        }
        break;
      case ' ':
        e.preventDefault();
        while (!collision(currentPiece, 0, 1)) {
          currentPiece.y++;
        }
        drop();
        break;
    }
  });
  
  // 初始绘制
  initBoard();
  draw();
</script>
{% endraw %}
