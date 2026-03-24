---
title: 五子棋
layout: page
---

{% raw %}
<div class="game-container">
  <div class="game-header">
    <h1>⚫⚪ 五子棋</h1>
    <div class="game-controls">
      <button onclick="newGame()">新游戏</button>
    </div>
    <div class="game-info">
      <div class="current-player">当前: <span id="currentPlayer">你的回合</span></div>
      <div class="game-status" id="gameStatus"></div>
    </div>
  </div>
  
  <div class="game-board-container">
    <canvas id="gameCanvas" width="600" height="600"></canvas>
    <div id="gameOver" class="game-over hidden">
      <h2 id="winnerText">游戏结束!</h2>
      <button onclick="newGame()">再来一局</button>
    </div>
  </div>
  
  <div class="game-instructions">
    <h3>游戏说明</h3>
    <ul>
      <li>你执黑棋，AI执白棋</li>
      <li>点击棋盘空位落子</li>
      <li>先连成五子一线者获胜</li>
      <li>横、竖、斜均可连成五子</li>
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
    font-size: 2.5em;
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
  
  .game-status {
    color: var(--theme, #3498db);
    font-weight: bold;
  }
  
  .game-board-container {
    position: relative;
    display: inline-block;
    margin: 20px 0;
  }
  
  #gameCanvas {
    border: 3px solid var(--text, #333);
    background: #dcb35c;
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
  const gobangCanvas = document.getElementById('gameCanvas');
  const gobangCtx = gobangCanvas.getContext('2d');
  
  const BOARD_SIZE = 15;
  const CELL_SIZE = 40;
  const PLAYER = 1;  // 黑棋 - 玩家
  const AI = 2;      // 白棋 - AI
  
  let board = [];
  let gameOver = false;
  let lastMove = null;
  let isPlayerTurn = true;
  
  function initBoard() {
    board = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      board[i] = [];
      for (let j = 0; j < BOARD_SIZE; j++) {
        board[i][j] = 0;
      }
    }
  }
  
  function drawBoard() {
    gobangCtx.clearRect(0, 0, gobangCanvas.width, gobangCanvas.height);
    
    gobangCtx.fillStyle = '#dcb35c';
    gobangCtx.fillRect(0, 0, gobangCanvas.width, gobangCanvas.height);
    
    gobangCtx.strokeStyle = '#000';
    gobangCtx.lineWidth = 1;
    
    for (let i = 0; i < BOARD_SIZE; i++) {
      gobangCtx.beginPath();
      gobangCtx.moveTo(CELL_SIZE / 2, CELL_SIZE / 2 + i * CELL_SIZE);
      gobangCtx.lineTo(gobangCanvas.width - CELL_SIZE / 2, CELL_SIZE / 2 + i * CELL_SIZE);
      gobangCtx.stroke();
      
      gobangCtx.beginPath();
      gobangCtx.moveTo(CELL_SIZE / 2 + i * CELL_SIZE, CELL_SIZE / 2);
      gobangCtx.lineTo(CELL_SIZE / 2 + i * CELL_SIZE, gobangCanvas.height - CELL_SIZE / 2);
      gobangCtx.stroke();
    }
    
    const starPoints = [
      [3, 3], [3, 11], [11, 3], [11, 11], [7, 7],
      [3, 7], [11, 7], [7, 3], [7, 11]
    ];
    
    gobangCtx.fillStyle = '#000';
    for (let point of starPoints) {
      gobangCtx.beginPath();
      gobangCtx.arc(
        CELL_SIZE / 2 + point[0] * CELL_SIZE,
        CELL_SIZE / 2 + point[1] * CELL_SIZE,
        4,
        0,
        Math.PI * 2
      );
      gobangCtx.fill();
    }
    
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j] !== 0) {
          drawPiece(i, j, board[i][j]);
        }
      }
    }
    
    if (lastMove) {
      gobangCtx.strokeStyle = '#ff0000';
      gobangCtx.lineWidth = 2;
      gobangCtx.beginPath();
      gobangCtx.arc(
        CELL_SIZE / 2 + lastMove.x * CELL_SIZE,
        CELL_SIZE / 2 + lastMove.y * CELL_SIZE,
        CELL_SIZE / 2 - 5,
        0,
        Math.PI * 2
      );
      gobangCtx.stroke();
    }
  }
  
  function drawPiece(x, y, player) {
    const centerX = CELL_SIZE / 2 + x * CELL_SIZE;
    const centerY = CELL_SIZE / 2 + y * CELL_SIZE;
    const radius = CELL_SIZE / 2 - 3;
    
    gobangCtx.beginPath();
    gobangCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    
    if (player === PLAYER) {
      const gradient = gobangCtx.createRadialGradient(
        centerX - 5, centerY - 5, 0,
        centerX, centerY, radius
      );
      gradient.addColorStop(0, '#666');
      gradient.addColorStop(1, '#000');
      gobangCtx.fillStyle = gradient;
    } else {
      const gradient = gobangCtx.createRadialGradient(
        centerX - 5, centerY - 5, 0,
        centerX, centerY, radius
      );
      gradient.addColorStop(0, '#fff');
      gradient.addColorStop(1, '#ddd');
      gobangCtx.fillStyle = gradient;
    }
    
    gobangCtx.fill();
    gobangCtx.strokeStyle = '#000';
    gobangCtx.lineWidth = 1;
    gobangCtx.stroke();
  }
  
  function getGridPosition(clientX, clientY) {
    const rect = gobangCanvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const gridX = Math.round((x - CELL_SIZE / 2) / CELL_SIZE);
    const gridY = Math.round((y - CELL_SIZE / 2) / CELL_SIZE);
    
    if (gridX >= 0 && gridX < BOARD_SIZE && gridY >= 0 && gridY < BOARD_SIZE) {
      return { x: gridX, y: gridY };
    }
    return null;
  }
  
  function checkWin(x, y, player) {
    const directions = [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, -1]
    ];
    
    for (let [dx, dy] of directions) {
      let count = 1;
      
      for (let i = 1; i < 5; i++) {
        const nx = x + dx * i;
        const ny = y + dy * i;
        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[nx][ny] === player) {
          count++;
        } else {
          break;
        }
      }
      
      for (let i = 1; i < 5; i++) {
        const nx = x - dx * i;
        const ny = y - dy * i;
        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[nx][ny] === player) {
          count++;
        } else {
          break;
        }
      }
      
      if (count >= 5) {
        return true;
      }
    }
    
    return false;
  }
  
  function evaluatePoint(x, y, player) {
    if (board[x][y] !== 0) return 0;
    
    let score = 0;
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
    
    for (let [dx, dy] of directions) {
      let count = 1;
      let block = 0;
      let empty = 0;
      
      for (let i = 1; i <= 4; i++) {
        const nx = x + dx * i;
        const ny = y + dy * i;
        if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) {
          block++;
          break;
        }
        if (board[nx][ny] === player) {
          count++;
        } else if (board[nx][ny] === 0) {
          empty++;
          break;
        } else {
          block++;
          break;
        }
      }
      
      for (let i = 1; i <= 4; i++) {
        const nx = x - dx * i;
        const ny = y - dy * i;
        if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) {
          block++;
          break;
        }
        if (board[nx][ny] === player) {
          count++;
        } else if (board[nx][ny] === 0) {
          empty++;
          break;
        } else {
          block++;
          break;
        }
      }
      
      if (count >= 5) {
        score += 100000;
      } else if (count === 4) {
        if (block === 0) score += 10000;
        else if (block === 1) score += 1000;
      } else if (count === 3) {
        if (block === 0) score += 1000;
        else if (block === 1) score += 100;
      } else if (count === 2) {
        if (block === 0) score += 100;
        else if (block === 1) score += 10;
      }
    }
    
    return score;
  }
  
  function aiMove() {
    let bestScore = -1;
    let bestMoves = [];
    
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j] === 0) {
          let hasNeighbor = false;
          for (let di = -2; di <= 2; di++) {
            for (let dj = -2; dj <= 2; dj++) {
              const ni = i + di;
              const nj = j + dj;
              if (ni >= 0 && ni < BOARD_SIZE && nj >= 0 && nj < BOARD_SIZE && board[ni][nj] !== 0) {
                hasNeighbor = true;
                break;
              }
            }
            if (hasNeighbor) break;
          }
          
          if (!hasNeighbor && board[7][7] === 0) {
            bestMoves = [{x: 7, y: 7}];
            break;
          }
          
          if (hasNeighbor) {
            const attackScore = evaluatePoint(i, j, AI);
            const defendScore = evaluatePoint(i, j, PLAYER);
            const score = attackScore + defendScore * 0.8;
            
            if (score > bestScore) {
              bestScore = score;
              bestMoves = [{x: i, y: j}];
            } else if (score === bestScore) {
              bestMoves.push({x: i, y: j});
            }
          }
        }
      }
      if (bestMoves.length > 0 && !bestMoves[0].hasNeighbor) break;
    }
    
    if (bestMoves.length === 0) {
      for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
          if (board[i][j] === 0) {
            bestMoves.push({x: i, y: j});
          }
        }
      }
    }
    
    const move = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    board[move.x][move.y] = AI;
    lastMove = move;
    
    drawBoard();
    
    if (checkWin(move.x, move.y, AI)) {
      gameOver = true;
      document.getElementById('winnerText').textContent = 'AI获胜!';
      document.getElementById('gameOver').classList.remove('hidden');
      document.getElementById('currentPlayer').textContent = '游戏结束';
    } else {
      isPlayerTurn = true;
      document.getElementById('currentPlayer').textContent = '你的回合';
    }
  }
  
  function handleClick(e) {
    if (gameOver || !isPlayerTurn) return;
    
    const pos = getGridPosition(e.clientX, e.clientY);
    if (!pos) return;
    
    if (board[pos.x][pos.y] === 0) {
      board[pos.x][pos.y] = PLAYER;
      lastMove = pos;
      
      drawBoard();
      
      if (checkWin(pos.x, pos.y, PLAYER)) {
        gameOver = true;
        document.getElementById('winnerText').textContent = '你赢了!';
        document.getElementById('gameOver').classList.remove('hidden');
        document.getElementById('currentPlayer').textContent = '游戏结束';
      } else {
        let isDraw = true;
        for (let i = 0; i < BOARD_SIZE; i++) {
          for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === 0) {
              isDraw = false;
              break;
            }
          }
          if (!isDraw) break;
        }
        
        if (isDraw) {
          gameOver = true;
          document.getElementById('winnerText').textContent = '平局!';
          document.getElementById('gameOver').classList.remove('hidden');
          document.getElementById('currentPlayer').textContent = '游戏结束';
        } else {
          isPlayerTurn = false;
          document.getElementById('currentPlayer').textContent = 'AI思考中...';
          setTimeout(aiMove, 300);
        }
      }
    }
  }
  
  function newGame() {
    initBoard();
    gameOver = false;
    lastMove = null;
    isPlayerTurn = true;
    
    document.getElementById('currentPlayer').textContent = '你的回合';
    document.getElementById('gameStatus').textContent = '';
    document.getElementById('gameOver').classList.add('hidden');
    
    drawBoard();
  }
  
  gobangCanvas.addEventListener('click', handleClick);
  
  newGame();
</script>
{% endraw %}
