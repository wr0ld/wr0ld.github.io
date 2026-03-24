---
title: 推箱子
layout: page
---

{% raw %}
<div class="game-container">
  <div class="game-header">
    <h1>📦 推箱子</h1>
    <div class="game-controls">
      <button onclick="prevLevel()">上一关</button>
      <button onclick="resetLevel()">重置关卡</button>
      <button onclick="nextLevel()">下一关</button>
    </div>
    <div class="game-info">
      <div class="level">关卡: <span id="level">1</span></div>
      <div class="moves">步数: <span id="moves">0</span></div>
    </div>
  </div>
  
  <div class="game-board-container">
    <div id="gameBoard" class="game-board"></div>
  </div>
  
  <div class="game-instructions">
    <h3>游戏说明</h3>
    <ul>
      <li>使用方向键或WASD移动角色</li>
      <li>将所有箱子推到目标位置</li>
      <li>箱子只能推，不能拉</li>
      <li>共10个经典关卡，难度递增</li>
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
    display: inline-block;
    margin: 20px 0;
  }
  
  .game-board {
    display: grid;
    gap: 2px;
    background: #333;
    padding: 10px;
    border-radius: 10px;
  }
  
  .cell {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    border-radius: 5px;
  }
  
  .wall {
    background: #555;
  }
  
  .floor {
    background: #ddd;
  }
  
  .target {
    background: #ffe0b3;
  }
  
  .box {
    background: #ff9800;
    border-radius: 8px;
  }
  
  .box-on-target {
    background: #4caf50;
    border-radius: 8px;
  }
  
  .player {
    background: #2196f3;
    border-radius: 50%;
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
  const WALL = '#';
  const FLOOR = ' ';
  const TARGET = '.';
  const BOX = '$';
  const BOX_ON_TARGET = '*';
  const PLAYER = '@';
  const PLAYER_ON_TARGET = '+';
  
  const levels = [
    [
      "  #####",
      "###   #",
      "#.@$  #",
      "### $.#",
      "#.##$ #",
      "# # . ##",
      "#$ *$$.#",
      "#   .  #",
      "########"
    ],
    [
      "########",
      "#      #",
      "# .$@. #",
      "#  $$  #",
      "#  ..  #",
      "#  $$  #",
      "#      #",
      "########"
    ],
    [
      "  ######",
      "  #    #",
      "  # ## ##",
      "### $   #",
      "#..$@$  #",
      "#..# $###",
      "####   #",
      "   #####"
    ],
    [
      "#######",
      "#     #",
      "# .$. #",
      "# $.$ #",
      "# .$. #",
      "#  @  #",
      "#######"
    ],
    [
      "  #####",
      "###   ##",
      "# $ $  #",
      "# #.#  #",
      "#  .@  #",
      "# #.#  #",
      "# $ $ ##",
      "###  #",
      "  ####"
    ],
    [
      "########",
      "#   #  #",
      "# $  $ #",
      "## ## ##",
      " #.$$.#",
      " #.@@.#",
      " ##  ##",
      "  ####"
    ],
    [
      " #######",
      "##  #  #",
      "#   $  #",
      "#  .#. #",
      "## $ $ #",
      " # .#. #",
      " #  $@ #",
      " #######"
    ],
    [
      "########",
      "#  ... #",
      "# #$$$ #",
      "# $ @ $ #",
      "# #$$$ #",
      "#  ... #",
      "########"
    ],
    [
      " #######",
      " #  ... #",
      "##$###  #",
      "# $ $ $ #",
      "#  .@.  #",
      "## $ $ ##",
      " #  #  #",
      " #######"
    ],
    [
      "##########",
      "#        #",
      "# ###### #",
      "# #....# #",
      "# #....# #",
      "# ##$$## #",
      "#  $@@$  #",
      "#  $  $  #",
      "##########"
    ]
  ];
  
  let currentLevel = 0;
  let playerPos = { x: 0, y: 0 };
  let boxes = [];
  let targets = [];
  let moves = 0;
  let map = [];
  
  function parseLevel(levelData) {
    map = [];
    boxes = [];
    targets = [];
    
    const maxWidth = Math.max(...levelData.map(row => row.length));
    
    for (let y = 0; y < levelData.length; y++) {
      const row = [];
      for (let x = 0; x < maxWidth; x++) {
        const char = levelData[y][x] || ' ';
        
        switch (char) {
          case WALL:
            row.push(WALL);
            break;
          case TARGET:
            row.push(TARGET);
            targets.push({ x, y });
            break;
          case BOX:
            row.push(FLOOR);
            boxes.push({ x, y });
            break;
          case BOX_ON_TARGET:
            row.push(TARGET);
            targets.push({ x, y });
            boxes.push({ x, y });
            break;
          case PLAYER:
            row.push(FLOOR);
            playerPos = { x, y };
            break;
          case PLAYER_ON_TARGET:
            row.push(TARGET);
            targets.push({ x, y });
            playerPos = { x, y };
            break;
          default:
            row.push(FLOOR);
        }
      }
      map.push(row);
    }
  }
  
  function render() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    gameBoard.style.gridTemplateColumns = `repeat(${map[0].length}, 50px)`;
    gameBoard.style.gridTemplateRows = `repeat(${map.length}, 50px)`;
    
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        
        const isBox = boxes.some(box => box.x === x && box.y === y);
        const isTarget = targets.some(target => target.x === x && target.y === y);
        const isPlayer = playerPos.x === x && playerPos.y === y;
        
        if (map[y][x] === WALL) {
          cell.classList.add('wall');
          cell.textContent = '🧱';
        } else if (isPlayer) {
          cell.classList.add(isTarget ? 'target' : 'floor');
          cell.textContent = '😊';
        } else if (isBox) {
          cell.classList.add(isTarget ? 'box-on-target' : 'box');
          cell.textContent = isTarget ? '✅' : '📦';
        } else if (isTarget) {
          cell.classList.add('target');
          cell.textContent = '⭕';
        } else {
          cell.classList.add('floor');
        }
        
        gameBoard.appendChild(cell);
      }
    }
    
    document.getElementById('level').textContent = currentLevel + 1;
    document.getElementById('moves').textContent = moves;
  }
  
  function canMove(x, y) {
    if (x < 0 || y < 0 || y >= map.length || x >= map[0].length) {
      return false;
    }
    return map[y][x] !== WALL;
  }
  
  function getBoxAt(x, y) {
    return boxes.findIndex(box => box.x === x && box.y === y);
  }
  
  function move(dx, dy) {
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;
    
    if (!canMove(newX, newY)) {
      return;
    }
    
    const boxIndex = getBoxAt(newX, newY);
    
    if (boxIndex !== -1) {
      const newBoxX = newX + dx;
      const newBoxY = newY + dy;
      
      if (!canMove(newBoxX, newBoxY) || getBoxAt(newBoxX, newBoxY) !== -1) {
        return;
      }
      
      boxes[boxIndex].x = newBoxX;
      boxes[boxIndex].y = newBoxY;
    }
    
    playerPos.x = newX;
    playerPos.y = newY;
    moves++;
    
    render();
    checkWin();
  }
  
  function checkWin() {
    const allBoxesOnTargets = boxes.every(box =>
      targets.some(target => target.x === box.x && target.y === box.y)
    );
    
    if (allBoxesOnTargets) {
      setTimeout(() => {
        if (currentLevel < levels.length - 1) {
          alert(`恭喜过关！点击"下一关"继续挑战！`);
        } else {
          alert(`恭喜你通关所有关卡！`);
        }
      }, 100);
    }
  }
  
  function loadLevel(levelIndex) {
    if (levelIndex < 0 || levelIndex >= levels.length) {
      return;
    }
    
    currentLevel = levelIndex;
    moves = 0;
    parseLevel(levels[currentLevel]);
    render();
  }
  
  function resetLevel() {
    moves = 0;
    parseLevel(levels[currentLevel]);
    render();
  }
  
  function prevLevel() {
    if (currentLevel > 0) {
      loadLevel(currentLevel - 1);
    }
  }
  
  function nextLevel() {
    if (currentLevel < levels.length - 1) {
      loadLevel(currentLevel + 1);
    }
  }
  
  // 键盘控制
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        move(0, -1);
        e.preventDefault();
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        move(0, 1);
        e.preventDefault();
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        move(-1, 0);
        e.preventDefault();
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        move(1, 0);
        e.preventDefault();
        break;
    }
  });
  
  // 初始化游戏
  loadLevel(0);
</script>
{% endraw %}
