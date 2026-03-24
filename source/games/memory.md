---
title: 记忆翻牌
layout: page
---

{% raw %}
<div class="game-container">
  <div class="game-header">
    <h1>🃏 记忆翻牌</h1>
    <div class="game-controls">
      <button onclick="newGame()">新游戏</button>
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
      <button onclick="newGame()">再来一局</button>
    </div>
  </div>
  
  <div class="game-instructions">
    <h3>游戏说明</h3>
    <ul>
      <li>点击卡片翻开，找出所有配对</li>
      <li>每次只能翻开两张卡片</li>
      <li>配对成功会保持翻开状态</li>
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
    grid-template-columns: repeat(4, 100px);
    grid-template-rows: repeat(4, 100px);
    gap: 10px;
    perspective: 1000px;
  }
  
  .card {
    position: relative;
    width: 100px;
    height: 100px;
    cursor: pointer;
    transform-style: preserve-3d;
    transition: transform 0.6s;
  }
  
  .card.flipped {
    transform: rotateY(180deg);
  }
  
  .card.matched {
    opacity: 0.6;
    cursor: default;
  }
  
  .card-front, .card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
  }
  
  .card-front {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: rotateY(180deg);
  }
  
  .card-back {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    font-size: 30px;
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
  const symbols = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪', '🎯'];
  let cards = [];
  let flippedCards = [];
  let matchedPairs = 0;
  let moves = 0;
  let timer = 0;
  let timerInterval = null;
  let canFlip = true;
  let bestScore = localStorage.getItem('memoryBestScore');
  
  if (bestScore) {
    document.getElementById('bestScore').textContent = bestScore;
  }
  
  function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
  
  function createCards() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    const cardSymbols = shuffle([...symbols, ...symbols]);
    
    cardSymbols.forEach((symbol, index) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.symbol = symbol;
      card.dataset.index = index;
      
      card.innerHTML = `
        <div class="card-front">${symbol}</div>
        <div class="card-back">?</div>
      `;
      
      card.addEventListener('click', () => flipCard(card));
      gameBoard.appendChild(card);
      cards.push(card);
    });
  }
  
  function flipCard(card) {
    if (!canFlip || card.classList.contains('flipped') || card.classList.contains('matched')) {
      return;
    }
    
    card.classList.add('flipped');
    flippedCards.push(card);
    
    if (flippedCards.length === 2) {
      moves++;
      document.getElementById('moves').textContent = moves;
      
      if (timerInterval === null) {
        startTimer();
      }
      
      const [card1, card2] = flippedCards;
      
      if (card1.dataset.symbol === card2.dataset.symbol) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        flippedCards = [];
        
        if (matchedPairs === symbols.length) {
          gameWin();
        }
      } else {
        canFlip = false;
        setTimeout(() => {
          card1.classList.remove('flipped');
          card2.classList.remove('flipped');
          flippedCards = [];
          canFlip = true;
        }, 1000);
      }
    }
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
  
  function gameWin() {
    stopTimer();
    
    document.getElementById('finalTime').textContent = timer;
    document.getElementById('finalMoves').textContent = moves;
    
    const score = timer + moves;
    if (!bestScore || score < parseInt(bestScore)) {
      bestScore = score;
      localStorage.setItem('memoryBestScore', bestScore);
      document.getElementById('bestScore').textContent = bestScore;
    }
    
    document.getElementById('gameWin').classList.remove('hidden');
  }
  
  function newGame() {
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    timer = 0;
    canFlip = true;
    
    stopTimer();
    
    document.getElementById('moves').textContent = '0';
    document.getElementById('timer').textContent = '0';
    document.getElementById('gameWin').classList.add('hidden');
    
    createCards();
  }
  
  // 初始化游戏
  newGame();
</script>
{% endraw %}
