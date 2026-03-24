---
title: 数字华容道
layout: page
---

{% raw %}
<div class="game-container">
  <div class="game-header">
    <h1>🔢 数字华容道</h1>
    <div class="game-controls">
      <button onclick="newGame(3)">3×3</button>
      <button onclick="newGame(4)">4×4</button>
      <button onclick="newGame(5)">5×5</button>
    </div>
    <div class="game-info">
      <div class="moves">步数: <span id="moves">0</span></div>
      <div class="timer">时间: <span id="timer">0</span>s</div>
      <div class="best">最佳: <span id="bestScore">-</span></div>
    </div>
  </div>
  
  <div class="game-board-container">
    <div id="gameBoard" class="game-board"></div>
    <div id="gameWin" class="game-win hidden">
      <h2>🎉 恭喜过关!</h2>
      <p>用时: <span id="finalTime">0</span>秒</p>
      <p>步数: <span id="finalMoves">0</span>步</p>
      <button onclick="newGame(currentSize)">再来一局</button>
    </div>
  </div>
  
  <div class="game-instructions">
    <h3>游戏说明</h3>
    <ul>
      <li>点击数字方块移动到空位</li>
      <li>将数字按顺序排列（1, 2, 3...）</li>
      <li>空格在右下角为完成状态</li>
      <li>用最少步数和时间完成挑战</li>
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
    margin: 0 5px;
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
  
  .game-board {
    display: grid;
    gap: 5px;
    background: #333;
    padding: 10px;
    border-radius: 10px;
  }
  
  .tile {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: bold;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
  }
  
  .tile:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }
  
  .tile.empty {
    background: transparent;
    cursor: default;
  }
  
  .tile.empty:hover {
    transform: none;
    box-shadow: none;
  }
  
  .game-win {
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
  
  .game-win.hidden {
    display: none;
  }
  
  .game-win button {
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
  let currentSize = 3;
  let tiles = [];
  let emptyPos = { x: 0, y: 0 };
  let moves = 0;
  let timer = 0;
  let timerInterval = null;
  let gameStarted = false;
  
  function getBestScore(size) {
    return localStorage.getItem(`puzzle${size}x${size}Best`);
  }
  
  function setBestScore(size, score) {
    localStorage.setItem(`puzzle${size}x${size}Best`, score);
  }
  
  function updateBestScore() {
    const best = getBestScore(currentSize);
    document.getElementById('bestScore').textContent = best || '-';
  }
  
  function initTiles(size) {
    tiles = [];
    for (let i = 0; i < size * size - 1; i++) {
      tiles.push(i + 1);
    }
    tiles.push(0); // 0 表示空格
  }
  
  function shuffleTiles() {
    // 随机打乱，但确保可解
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    
    // 检查是否可解，如果不可解则交换两个非空方块
    if (!isSolvable()) {
      const first = tiles.findIndex(t => t !== 0);
      const second = tiles.findIndex((t, i) => t !== 0 && i > first);
      [tiles[first], tiles[second]] = [tiles[second], tiles[first]];
    }
  }
  
  function isSolvable() {
    let inversions = 0;
    const size = currentSize;
    
    for (let i = 0; i < tiles.length; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        if (tiles[i] && tiles[j] && tiles[i] > tiles[j]) {
          inversions++;
        }
      }
    }
    
    if (size % 2 === 1) {
      return inversions % 2 === 0;
    } else {
      const emptyRow = Math.floor(tiles.indexOf(0) / size);
      const emptyRowFromBottom = size - emptyRow;
      return (inversions + emptyRowFromBottom) % 2 === 1;
    }
  }
  
  function findEmpty() {
    const index = tiles.indexOf(0);
    return {
      x: index % currentSize,
      y: Math.floor(index / currentSize)
    };
  }
  
  function render() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    const tileSize = currentSize === 3 ? 100 : currentSize === 4 ? 80 : 65;
    gameBoard.style.gridTemplateColumns = `repeat(${currentSize}, ${tileSize}px)`;
    gameBoard.style.gridTemplateRows = `repeat(${currentSize}, ${tileSize}px)`;
    
    for (let i = 0; i < tiles.length; i++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.style.width = `${tileSize}px`;
      tile.style.height = `${tileSize}px`;
      
      if (tiles[i] === 0) {
        tile.classList.add('empty');
      } else {
        tile.textContent = tiles[i];
        tile.addEventListener('click', () => moveTile(i));
      }
      
      gameBoard.appendChild(tile);
    }
    
    document.getElementById('moves').textContent = moves;
  }
  
  function canMove(index) {
    const emptyIndex = tiles.indexOf(0);
    const size = currentSize;
    
    const emptyX = emptyIndex % size;
    const emptyY = Math.floor(emptyIndex / size);
    const tileX = index % size;
    const tileY = Math.floor(index / size);
    
    const dx = Math.abs(emptyX - tileX);
    const dy = Math.abs(emptyY - tileY);
    
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  }
  
  function moveTile(index) {
    if (!canMove(index)) return;
    
    if (!gameStarted) {
      gameStarted = true;
      startTimer();
    }
    
    const emptyIndex = tiles.indexOf(0);
    [tiles[index], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[index]];
    moves++;
    
    render();
    checkWin();
  }
  
  function startTimer() {
    timerInterval = setInterval(() => {
      timer++;
      document.getElementById('timer').textContent = timer;
    }, 1000);
  }
  
  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }
  
  function checkWin() {
    for (let i = 0; i < tiles.length - 1; i++) {
      if (tiles[i] !== i + 1) {
        return;
      }
    }
    
    stopTimer();
    
    document.getElementById('finalTime').textContent = timer;
    document.getElementById('finalMoves').textContent = moves;
    
    const score = timer + moves;
    const best = getBestScore(currentSize);
    
    if (!best || score < parseInt(best)) {
      setBestScore(currentSize, score);
      updateBestScore();
    }
    
    document.getElementById('gameWin').classList.remove('hidden');
  }
  
  function newGame(size) {
    currentSize = size;
    moves = 0;
    timer = 0;
    gameStarted = false;
    
    stopTimer();
    updateBestScore();
    
    document.getElementById('timer').textContent = '0';
    document.getElementById('gameWin').classList.add('hidden');
    
    initTiles(size);
    shuffleTiles();
    render();
  }
  
  // 键盘控制
  document.addEventListener('keydown', (e) => {
    const emptyIndex = tiles.indexOf(0);
    const size = currentSize;
    const emptyX = emptyIndex % size;
    const emptyY = Math.floor(emptyIndex / size);
    
    let targetIndex = -1;
    
    switch (e.key) {
      case 'ArrowUp':
        if (emptyY < size - 1) {
          targetIndex = emptyIndex + size;
        }
        break;
      case 'ArrowDown':
        if (emptyY > 0) {
          targetIndex = emptyIndex - size;
        }
        break;
      case 'ArrowLeft':
        if (emptyX < size - 1) {
          targetIndex = emptyIndex + 1;
        }
        break;
      case 'ArrowRight':
        if (emptyX > 0) {
          targetIndex = emptyIndex - 1;
        }
        break;
    }
    
    if (targetIndex !== -1) {
      moveTile(targetIndex);
      e.preventDefault();
    }
  });
  
  // 初始化游戏
  newGame(3);
</script>
{% endraw %}
