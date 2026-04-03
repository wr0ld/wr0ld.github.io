---
title: 打地鼠
layout: page
leftbar: 
rightbar: 
---

{% raw %}
<div class="game-container">
  <div class="game-header">
    <h1>🔨 打地鼠</h1>
    <div class="game-controls">
      <button id="startBtn" onclick="startGame()">开始游戏</button>
    </div>
    <div class="game-info">
      <div class="score">得分: <span id="score">0</span></div>
      <div class="time">时间: <span id="time">30</span>秒</div>
      <div class="combo">连击: <span id="combo">0</span></div>
    </div>
  </div>
  
  <div class="game-board-container">
    <canvas id="gameCanvas" width="450" height="450"></canvas>
    <div id="gameOver" class="game-over hidden">
      <h2>游戏结束!</h2>
      <p>最终得分: <span id="finalScore">0</span></p>
      <p>最高连击: <span id="maxCombo">0</span></p>
      <button onclick="startGame()">再玩一次</button>
    </div>
  </div>
  
  <div class="game-instructions">
    <h3>游戏说明</h3>
    <ul>
      <li>点击从洞里冒出的地鼠得分</li>
      <li>连续击中地鼠可获得连击加分</li>
      <li>金色地鼠得分更高</li>
      <li>在限定时间内获得尽可能高的分数</li>
    </ul>
  </div>
</div>

<style>
  .game-container {
    max-width: 550px;
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
  
  .combo {
    color: #f1c40f;
    font-weight: bold;
  }
  
  .game-board-container {
    position: relative;
    display: inline-block;
    margin: 20px 0;
  }
  
  #gameCanvas {
    border: 3px solid var(--text, #333);
    background: #8B4513;
    display: block;
    cursor: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><text y="20" font-size="20">🔨</text></svg>') 16 16, pointer;
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
  const whackCanvas = document.getElementById('gameCanvas');
  const whackCtx = whackCanvas.getContext('2d');
  
  const HOLES = [
    { x: 75, y: 100 }, { x: 225, y: 100 }, { x: 375, y: 100 },
    { x: 75, y: 225 }, { x: 225, y: 225 }, { x: 375, y: 225 },
    { x: 75, y: 350 }, { x: 225, y: 350 }, { x: 375, y: 350 }
  ];
  
  const HOLE_WIDTH = 100;
  const HOLE_HEIGHT = 80;
  
  let moles = [];
  let score = 0;
  let timeLeft = 30;
  let combo = 0;
  let maxCombo = 0;
  let gameRunning = false;
  let gameTimer = null;
  let moleTimer = null;
  let hitEffects = [];
  
  function initGame() {
    score = 0;
    timeLeft = 30;
    combo = 0;
    maxCombo = 0;
    moles = [];
    hitEffects = [];
    
    document.getElementById('score').textContent = score;
    document.getElementById('time').textContent = timeLeft;
    document.getElementById('combo').textContent = combo;
    document.getElementById('gameOver').classList.add('hidden');
  }
  
  function draw() {
    whackCtx.fillStyle = '#8B4513';
    whackCtx.fillRect(0, 0, whackCanvas.width, whackCanvas.height);
    
    whackCtx.fillStyle = '#654321';
    for (let i = 0; i < whackCanvas.width; i += 50) {
      whackCtx.fillRect(i, 0, 25, whackCanvas.height);
    }
    
    HOLES.forEach((hole, index) => {
      whackCtx.fillStyle = '#3d2817';
      whackCtx.beginPath();
      whackCtx.ellipse(hole.x, hole.y + 20, HOLE_WIDTH/2, HOLE_HEIGHT/3, 0, 0, Math.PI * 2);
      whackCtx.fill();
      
      whackCtx.fillStyle = '#2d1810';
      whackCtx.beginPath();
      whackCtx.ellipse(hole.x, hole.y + 25, HOLE_WIDTH/2 - 5, HOLE_HEIGHT/3 - 5, 0, 0, Math.PI * 2);
      whackCtx.fill();
    });
    
    moles.forEach(mole => {
      if (mole.active) {
        const hole = HOLES[mole.holeIndex];
        const progress = mole.progress;
        const moleY = hole.y - 30 * progress;
        
        whackCtx.save();
        
        whackCtx.beginPath();
        whackCtx.ellipse(hole.x, hole.y + 20, HOLE_WIDTH/2, HOLE_HEIGHT/3, 0, 0, Math.PI);
        whackCtx.clip();
        
        if (mole.golden) {
          whackCtx.fillStyle = '#f1c40f';
        } else {
          whackCtx.fillStyle = '#8B6914';
        }
        
        whackCtx.beginPath();
        whackCtx.arc(hole.x, moleY, 35, 0, Math.PI * 2);
        whackCtx.fill();
        
        whackCtx.fillStyle = '#654321';
        whackCtx.beginPath();
        whackCtx.arc(hole.x - 12, moleY - 8, 6, 0, Math.PI * 2);
        whackCtx.arc(hole.x + 12, moleY - 8, 6, 0, Math.PI * 2);
        whackCtx.fill();
        
        whackCtx.fillStyle = '#333';
        whackCtx.beginPath();
        whackCtx.arc(hole.x - 12, moleY - 8, 3, 0, Math.PI * 2);
        whackCtx.arc(hole.x + 12, moleY - 8, 3, 0, Math.PI * 2);
        whackCtx.fill();
        
        whackCtx.fillStyle = '#ff9999';
        whackCtx.beginPath();
        whackCtx.arc(hole.x, moleY + 5, 8, 0, Math.PI);
        whackCtx.fill();
        
        whackCtx.restore();
        
        if (mole.golden) {
          whackCtx.fillStyle = 'rgba(255, 215, 0, 0.3)';
          whackCtx.beginPath();
          whackCtx.arc(hole.x, moleY, 45, 0, Math.PI * 2);
          whackCtx.fill();
        }
      }
    });
    
    hitEffects.forEach((effect, index) => {
      whackCtx.fillStyle = `rgba(255, 215, 0, ${effect.alpha})`;
      whackCtx.font = `bold ${effect.size}px Arial`;
      whackCtx.textAlign = 'center';
      whackCtx.fillText(effect.text, effect.x, effect.y);
    });
  }
  
  function spawnMole() {
    const availableHoles = HOLES.map((_, index) => index)
      .filter(index => !moles.some(m => m.holeIndex === index && m.active));
    
    if (availableHoles.length === 0) return;
    
    const holeIndex = availableHoles[Math.floor(Math.random() * availableHoles.length)];
    const golden = Math.random() < 0.1;
    
    moles.push({
      holeIndex: holeIndex,
      active: true,
      progress: 0,
      golden: golden,
      state: 'rising',
      lifetime: 0
    });
  }
  
  function update() {
    moles.forEach((mole, index) => {
      if (mole.active) {
        mole.lifetime++;
        
        if (mole.state === 'rising') {
          mole.progress += 0.15;
          if (mole.progress >= 1) {
            mole.progress = 1;
            mole.state = 'up';
          }
        } else if (mole.state === 'up') {
          if (mole.lifetime > (mole.golden ? 30 : 50)) {
            mole.state = 'falling';
          }
        } else if (mole.state === 'falling') {
          mole.progress -= 0.1;
          if (mole.progress <= 0) {
            mole.active = false;
            if (!mole.hit) {
              combo = 0;
              document.getElementById('combo').textContent = combo;
            }
          }
        }
      }
    });
    
    moles = moles.filter(mole => mole.active || mole.progress > 0);
    
    hitEffects.forEach((effect, index) => {
      effect.y -= 2;
      effect.alpha -= 0.02;
      effect.size += 0.5;
    });
    
    hitEffects = hitEffects.filter(effect => effect.alpha > 0);
    
    draw();
  }
  
  function handleClick(e) {
    if (!gameRunning) return;
    
    const rect = whackCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    for (let mole of moles) {
      if (mole.active && mole.progress > 0.5) {
        const hole = HOLES[mole.holeIndex];
        const moleY = hole.y - 30 * mole.progress;
        
        const dist = Math.sqrt(Math.pow(clickX - hole.x, 2) + Math.pow(clickY - moleY, 2));
        
        if (dist < 40) {
          mole.hit = true;
          mole.state = 'falling';
          
          combo++;
          maxCombo = Math.max(maxCombo, combo);
          
          let points = mole.golden ? 30 : 10;
          points += combo * 2;
          
          score += points;
          document.getElementById('score').textContent = score;
          document.getElementById('combo').textContent = combo;
          
          hitEffects.push({
            x: hole.x,
            y: moleY,
            text: `+${points}`,
            alpha: 1,
            size: 20
          });
          
          break;
        }
      }
    }
  }
  
  function startGame() {
    initGame();
    gameRunning = true;
    document.getElementById('startBtn').disabled = true;
    
    gameTimer = setInterval(() => {
      timeLeft--;
      document.getElementById('time').textContent = timeLeft;
      
      if (timeLeft <= 0) {
        gameOver();
      }
    }, 1000);
    
    moleTimer = setInterval(() => {
      if (Math.random() < 0.4) {
        spawnMole();
      }
    }, 500);
    
    function gameLoop() {
      if (gameRunning) {
        update();
        requestAnimationFrame(gameLoop);
      }
    }
    gameLoop();
  }
  
  function gameOver() {
    gameRunning = false;
    clearInterval(gameTimer);
    clearInterval(moleTimer);
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('maxCombo').textContent = maxCombo;
    document.getElementById('gameOver').classList.remove('hidden');
    document.getElementById('startBtn').disabled = false;
  }
  
  whackCanvas.addEventListener('click', handleClick);
  
  draw();
</script>
{% endraw %}
