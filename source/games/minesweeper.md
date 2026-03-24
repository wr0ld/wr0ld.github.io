---
title: 扫雷
layout: page
---

{% raw %}
<div class="game-container">
  <div class="game-header">
    <h1>💣 扫雷</h1>
    <div class="game-controls">
      <select id="difficulty" onchange="newGame()">
        <option value="easy">简单 (9x9, 10雷)</option>
        <option value="medium">中等 (16x16, 40雷)</option>
        <option value="hard">困难 (16x30, 99雷)</option>
      </select>
      <button onclick="newGame()">新游戏</button>
    </div>
    <div class="game-info">
      <div class="mines">剩余地雷: <span id="minesLeft">10</span></div>
      <div class="timer">时间: <span id="timer">0</span>s</div>
    </div>
  </div>
  
  <div class="game-board-container">
    <div id="gameBoard" class="game-board"></div>
    <div id="gameOver" class="game-over hidden">
      <h2 id="gameOverTitle">游戏结束!</h2>
      <p id="gameOverText">踩到地雷了!</p>
      <button onclick="newGame()">再来一局</button>
    </div>
  </div>
  
  <div class="game-instructions">
    <h3>游戏说明</h3>
    <ul>
      <li>左键点击揭开方块</li>
      <li>右键点击标记/取消地雷</li>
      <li>数字表示周围8格内的地雷数量</li>
      <li>揭开所有非地雷方块即可获胜</li>
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
    display: flex;
    justify-content: center;
    gap: 15px;
    align-items: center;
  }
  
  .game-controls select {
    padding: 10px;
    font-size: 16px;
    border-radius: 5px;
    border: 2px solid var(--border, #e0e0e0);
    background: var(--card, #fff);
    color: var(--text, #333);
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
  
  .game-board {
    display: inline-grid;
    gap: 0;
    background: #7b7b7b;
    border: 3px solid #fff;
    border-right-color: #7b7b7b;
    border-bottom-color: #7b7b7b;
  }
  
  .cell {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
    border: 2px solid #fff;
    border-right-color: #7b7b7b;
    border-bottom-color: #7b7b7b;
    background: #c0c0c0;
  }
  
  .cell:hover:not(.revealed) {
    background: #d0d0d0;
  }
  
  .cell.revealed {
    background: #e0e0e0;
    border: 1px solid #7b7b7b;
    cursor: default;
  }
  
  .cell.mine {
    background: #ff0000;
  }
  
  .cell.flagged::after {
    content: "🚩";
  }
  
  .cell[data-number="1"] { color: #0000ff; }
  .cell[data-number="2"] { color: #008000; }
  .cell[data-number="3"] { color: #ff0000; }
  .cell[data-number="4"] { color: #000080; }
  .cell[data-number="5"] { color: #800000; }
  .cell[data-number="6"] { color: #008080; }
  .cell[data-number="7"] { color: #000000; }
  .cell[data-number="8"] { color: #808080; }
  
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
  let board = [];
  let rows = 9;
  let cols = 9;
  let mines = 10;
  let minesLeft = 10;
  let gameOver = false;
  let firstClick = true;
  let timer = 0;
  let timerInterval = null;
  
  const difficulties = {
    easy: { rows: 9, cols: 9, mines: 10 },
    medium: { rows: 16, cols: 16, mines: 40 },
    hard: { rows: 16, cols: 30, mines: 99 }
  };
  
  function initBoard() {
    board = [];
    for (let i = 0; i < rows; i++) {
      board[i] = [];
      for (let j = 0; j < cols; j++) {
        board[i][j] = {
          mine: false,
          revealed: false,
          flagged: false,
          count: 0
        };
      }
    }
  }
  
  function placeMines(excludeRow, excludeCol) {
    let placed = 0;
    while (placed < mines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      
      // 排除第一次点击的位置及其周围
      if (Math.abs(r - excludeRow) <= 1 && Math.abs(c - excludeCol) <= 1) {
        continue;
      }
      
      if (!board[r][c].mine) {
        board[r][c].mine = true;
        placed++;
      }
    }
    
    // 计算每个格子周围的地雷数
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!board[i][j].mine) {
          board[i][j].count = countAdjacentMines(i, j);
        }
      }
    }
  }
  
  function countAdjacentMines(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const r = row + i;
        const c = col + j;
        if (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c].mine) {
          count++;
        }
      }
    }
    return count;
  }
  
  function renderBoard() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = i;
        cell.dataset.col = j;
        
        if (board[i][j].revealed) {
          cell.classList.add('revealed');
          if (board[i][j].mine) {
            cell.classList.add('mine');
            cell.textContent = '💣';
          } else if (board[i][j].count > 0) {
            cell.textContent = board[i][j].count;
            cell.dataset.number = board[i][j].count;
          }
        } else if (board[i][j].flagged) {
          cell.classList.add('flagged');
        }
        
        cell.addEventListener('click', () => handleClick(i, j));
        cell.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          handleRightClick(i, j);
        });
        
        gameBoard.appendChild(cell);
      }
    }
  }
  
  function handleClick(row, col) {
    if (gameOver || board[row][col].flagged || board[row][col].revealed) {
      return;
    }
    
    if (firstClick) {
      firstClick = false;
      placeMines(row, col);
      startTimer();
    }
    
    if (board[row][col].mine) {
      revealAllMines();
      endGame(false);
    } else {
      revealCell(row, col);
      checkWin();
    }
    
    renderBoard();
  }
  
  function handleRightClick(row, col) {
    if (gameOver || board[row][col].revealed) {
      return;
    }
    
    board[row][col].flagged = !board[row][col].flagged;
    minesLeft += board[row][col].flagged ? -1 : 1;
    document.getElementById('minesLeft').textContent = minesLeft;
    
    renderBoard();
  }
  
  function revealCell(row, col) {
    if (row < 0 || row >= rows || col < 0 || col >= cols) {
      return;
    }
    
    if (board[row][col].revealed || board[row][col].flagged) {
      return;
    }
    
    board[row][col].revealed = true;
    
    if (board[row][col].count === 0 && !board[row][col].mine) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          revealCell(row + i, col + j);
        }
      }
    }
  }
  
  function revealAllMines() {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (board[i][j].mine) {
          board[i][j].revealed = true;
        }
      }
    }
  }
  
  function checkWin() {
    let unrevealedSafe = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!board[i][j].mine && !board[i][j].revealed) {
          unrevealedSafe++;
        }
      }
    }
    
    if (unrevealedSafe === 0) {
      endGame(true);
    }
  }
  
  function startTimer() {
    timer = 0;
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
  
  function endGame(won) {
    gameOver = true;
    stopTimer();
    
    const gameOverDiv = document.getElementById('gameOver');
    const title = document.getElementById('gameOverTitle');
    const text = document.getElementById('gameOverText');
    
    if (won) {
      title.textContent = '🎉 恭喜!';
      text.textContent = `你用了 ${timer} 秒完成了游戏!`;
    } else {
      title.textContent = '游戏结束!';
      text.textContent = '踩到地雷了!';
    }
    
    gameOverDiv.classList.remove('hidden');
  }
  
  function newGame() {
    const difficulty = document.getElementById('difficulty').value;
    const config = difficulties[difficulty];
    
    rows = config.rows;
    cols = config.cols;
    mines = config.mines;
    minesLeft = mines;
    gameOver = false;
    firstClick = true;
    
    document.getElementById('minesLeft').textContent = minesLeft;
    document.getElementById('timer').textContent = '0';
    document.getElementById('gameOver').classList.add('hidden');
    
    stopTimer();
    initBoard();
    renderBoard();
  }
  
  // 初始化游戏
  newGame();
</script>
{% endraw %}
