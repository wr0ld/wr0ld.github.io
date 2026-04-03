---
title: 消消乐
layout: page
leftbar: 
rightbar: 
---

{% raw %}
<div class="game-container">
  <div class="game-header">
    <h1>💎 消消乐</h1>
    <div class="game-controls">
      <button onclick="newGame()">新游戏</button>
    </div>
    <div class="game-info">
      <div class="score">得分: <span id="score">0</span></div>
      <div class="moves">剩余步数: <span id="moves">30</span></div>
    </div>
  </div>
  
  <div class="game-board-container">
    <canvas id="gameCanvas" width="400" height="400"></canvas>
    <div id="gameOver" class="game-over hidden">
      <h2 id="resultText">游戏结束!</h2>
      <p>最终得分: <span id="finalScore">0</span></p>
      <button onclick="newGame()">再玩一次</button>
    </div>
  </div>
  
  <div class="game-instructions">
    <h3>游戏说明</h3>
    <ul>
      <li>点击两个相邻的方块交换位置</li>
      <li>三个或更多相同颜色的方块连成一线即可消除</li>
      <li>消除方块得分，连消得分更高</li>
      <li>在限定步数内获得尽可能高的分数</li>
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
    margin-bottom: 20px;
  }
  
  .game-controls {
    margin: 20px 0;
  }
  
  .game-controls button {
    padding: 10px 20px;
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
    background: #2c3e50;
    display: block;
    cursor: pointer;
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
  const matchCanvas = document.getElementById('gameCanvas');
  const matchCtx = matchCanvas.getContext('2d');
  
  const GRID_SIZE = 8;
  const CELL_SIZE = matchCanvas.width / GRID_SIZE;
  const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c'];
  const SHAPES = ['circle', 'square', 'diamond', 'triangle', 'star', 'heart'];
  
  let grid = [];
  let selected = null;
  let score = 0;
  let moves = 30;
  let isAnimating = false;
  
  function initGrid() {
    grid = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      grid[i] = [];
      for (let j = 0; j < GRID_SIZE; j++) {
        let color;
        do {
          color = Math.floor(Math.random() * COLORS.length);
        } while (wouldMatch(i, j, color));
        grid[i][j] = color;
      }
    }
  }
  
  function wouldMatch(x, y, color) {
    if (x >= 2 && grid[x-1][y] === color && grid[x-2][y] === color) return true;
    if (y >= 2 && grid[x][y-1] === color && grid[x][y-2] === color) return true;
    return false;
  }
  
  function draw() {
    matchCtx.clearRect(0, 0, matchCanvas.width, matchCanvas.height);
    
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const x = i * CELL_SIZE;
        const y = j * CELL_SIZE;
        
        matchCtx.fillStyle = '#34495e';
        matchCtx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        
        if (grid[i][j] !== -1) {
          drawShape(x + CELL_SIZE/2, y + CELL_SIZE/2, grid[i][j], selected && selected.x === i && selected.y === j);
        }
      }
    }
  }
  
  function drawShape(x, y, colorIndex, isSelected) {
    const color = COLORS[colorIndex];
    const size = CELL_SIZE / 2 - 8;
    
    matchCtx.fillStyle = color;
    matchCtx.strokeStyle = isSelected ? '#fff' : 'rgba(255,255,255,0.3)';
    matchCtx.lineWidth = isSelected ? 3 : 1;
    
    matchCtx.beginPath();
    matchCtx.arc(x, y, size, 0, Math.PI * 2);
    matchCtx.fill();
    matchCtx.stroke();
    
    if (isSelected) {
      matchCtx.strokeStyle = '#fff';
      matchCtx.lineWidth = 2;
      matchCtx.setLineDash([5, 5]);
      matchCtx.strokeRect(x - size - 5, y - size - 5, size * 2 + 10, size * 2 + 10);
      matchCtx.setLineDash([]);
    }
  }
  
  function getGridPos(clientX, clientY) {
    const rect = matchCanvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return {
      x: Math.floor(x / CELL_SIZE),
      y: Math.floor(y / CELL_SIZE)
    };
  }
  
  function isAdjacent(pos1, pos2) {
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  }
  
  function swap(pos1, pos2) {
    const temp = grid[pos1.x][pos1.y];
    grid[pos1.x][pos1.y] = grid[pos2.x][pos2.y];
    grid[pos2.x][pos2.y] = temp;
  }
  
  function findMatches() {
    const matches = new Set();
    
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE - 2; j++) {
        if (grid[i][j] !== -1 && grid[i][j] === grid[i][j+1] && grid[i][j] === grid[i][j+2]) {
          matches.add(`${i},${j}`);
          matches.add(`${i},${j+1}`);
          matches.add(`${i},${j+2}`);
          
          let k = j + 3;
          while (k < GRID_SIZE && grid[i][k] === grid[i][j]) {
            matches.add(`${i},${k}`);
            k++;
          }
        }
      }
    }
    
    for (let j = 0; j < GRID_SIZE; j++) {
      for (let i = 0; i < GRID_SIZE - 2; i++) {
        if (grid[i][j] !== -1 && grid[i][j] === grid[i+1][j] && grid[i][j] === grid[i+2][j]) {
          matches.add(`${i},${j}`);
          matches.add(`${i+1},${j}`);
          matches.add(`${i+2},${j}`);
          
          let k = i + 3;
          while (k < GRID_SIZE && grid[k][j] === grid[i][j]) {
            matches.add(`${k},${j}`);
            k++;
          }
        }
      }
    }
    
    return matches;
  }
  
  function removeMatches(matches) {
    matches.forEach(pos => {
      const [x, y] = pos.split(',').map(Number);
      grid[x][y] = -1;
    });
    return matches.size;
  }
  
  function dropBlocks() {
    for (let i = 0; i < GRID_SIZE; i++) {
      let emptySpaces = 0;
      for (let j = GRID_SIZE - 1; j >= 0; j--) {
        if (grid[i][j] === -1) {
          emptySpaces++;
        } else if (emptySpaces > 0) {
          grid[i][j + emptySpaces] = grid[i][j];
          grid[i][j] = -1;
        }
      }
      
      for (let j = 0; j < emptySpaces; j++) {
        grid[i][j] = Math.floor(Math.random() * COLORS.length);
      }
    }
  }
  
  async function processMatches() {
    let combo = 0;
    let hasMatches = true;
    
    while (hasMatches) {
      const matches = findMatches();
      
      if (matches.size > 0) {
        combo++;
        const points = matches.size * 10 * combo;
        score += points;
        document.getElementById('score').textContent = score;
        
        removeMatches(matches);
        draw();
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        dropBlocks();
        draw();
        
        await new Promise(resolve => setTimeout(resolve, 200));
      } else {
        hasMatches = false;
      }
    }
    
    return combo > 0;
  }
  
  async function handleClick(e) {
    if (isAnimating || moves <= 0) return;
    
    const pos = getGridPos(e.clientX, e.clientY);
    
    if (pos.x < 0 || pos.x >= GRID_SIZE || pos.y < 0 || pos.y >= GRID_SIZE) return;
    
    if (!selected) {
      selected = pos;
      draw();
    } else {
      if (isAdjacent(selected, pos)) {
        isAnimating = true;
        
        swap(selected, pos);
        draw();
        
        const matches = findMatches();
        
        if (matches.size > 0) {
          moves--;
          document.getElementById('moves').textContent = moves;
          
          await processMatches();
          
          if (moves <= 0) {
            gameOver();
          }
        } else {
          swap(selected, pos);
          draw();
        }
        
        isAnimating = false;
      }
      
      selected = null;
      draw();
    }
  }
  
  function gameOver() {
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
  }
  
  function newGame() {
    score = 0;
    moves = 30;
    selected = null;
    isAnimating = false;
    
    document.getElementById('score').textContent = score;
    document.getElementById('moves').textContent = moves;
    document.getElementById('gameOver').classList.add('hidden');
    
    initGrid();
    draw();
  }
  
  matchCanvas.addEventListener('click', handleClick);
  
  newGame();
</script>
{% endraw %}
