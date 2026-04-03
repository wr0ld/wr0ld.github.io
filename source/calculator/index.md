---
title: 计算器
layout: page
menu_id: calculator
---

{% raw %}
<div class="calculator-container">
  <div class="calc-window">
    <div class="calc-titlebar">
      <span class="calc-icon">🔢</span>
      <span class="calc-title">计算器</span>
      <div class="calc-controls">
        <button class="calc-btn-minimize" onclick="minimizeCalc()">─</button>
        <button class="calc-btn-maximize" onclick="maximizeCalc()">□</button>
        <button class="calc-btn-close" onclick="closeCalc()">✕</button>
      </div>
    </div>
    <div class="calc-body">
      <div class="calc-history" id="calcHistory"></div>
      <div class="calc-display">
        <div class="calc-expression" id="calcExpression"></div>
        <div class="calc-result" id="calcResult">0</div>
      </div>
      <div class="calc-buttons">
        <div class="calc-row">
          <button class="calc-btn func" onclick="inputPercent()">%</button>
          <button class="calc-btn func" onclick="clearEntry()">CE</button>
          <button class="calc-btn func" onclick="clearAll()">C</button>
          <button class="calc-btn func" onclick="backspace()">⌫</button>
        </div>
        <div class="calc-row">
          <button class="calc-btn func" onclick="inputFunction('1/')">1/x</button>
          <button class="calc-btn func" onclick="square()">x²</button>
          <button class="calc-btn func" onclick="sqrt()">√</button>
          <button class="calc-btn operator" onclick="inputOperator('/')">÷</button>
        </div>
        <div class="calc-row">
          <button class="calc-btn number" onclick="inputNumber('7')">7</button>
          <button class="calc-btn number" onclick="inputNumber('8')">8</button>
          <button class="calc-btn number" onclick="inputNumber('9')">9</button>
          <button class="calc-btn operator" onclick="inputOperator('*')">×</button>
        </div>
        <div class="calc-row">
          <button class="calc-btn number" onclick="inputNumber('4')">4</button>
          <button class="calc-btn number" onclick="inputNumber('5')">5</button>
          <button class="calc-btn number" onclick="inputNumber('6')">6</button>
          <button class="calc-btn operator" onclick="inputOperator('-')">−</button>
        </div>
        <div class="calc-row">
          <button class="calc-btn number" onclick="inputNumber('1')">1</button>
          <button class="calc-btn number" onclick="inputNumber('2')">2</button>
          <button class="calc-btn number" onclick="inputNumber('3')">3</button>
          <button class="calc-btn operator" onclick="inputOperator('+')">+</button>
        </div>
        <div class="calc-row">
          <button class="calc-btn number" onclick="toggleSign()">±</button>
          <button class="calc-btn number" onclick="inputNumber('0')">0</button>
          <button class="calc-btn number" onclick="inputDecimal()">.</button>
          <button class="calc-btn equals" onclick="calculate()">=</button>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
.calculator-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 20px;
}

.calc-window {
  background: #202020;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  width: 320px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  transition: all 0.3s ease;
}

.calc-window.maximized {
  width: 100%;
  max-width: 500px;
}

.calc-window.minimized .calc-body {
  display: none;
}

.calc-titlebar {
  background: #1a1a1a;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  user-select: none;
}

.calc-icon {
  font-size: 14px;
  margin-right: 8px;
}

.calc-title {
  color: #ffffff;
  font-size: 12px;
  flex: 1;
}

.calc-controls {
  display: flex;
  gap: 4px;
}

.calc-controls button {
  width: 32px;
  height: 24px;
  border: none;
  background: transparent;
  color: #ffffff;
  cursor: pointer;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.calc-controls button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.calc-btn-close:hover {
  background: #e81123 !important;
}

.calc-body {
  padding: 12px;
}

.calc-history {
  color: #888;
  font-size: 12px;
  text-align: right;
  min-height: 20px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.calc-display {
  background: #1a1a1a;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
}

.calc-expression {
  color: #888;
  font-size: 14px;
  text-align: right;
  min-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.calc-result {
  color: #ffffff;
  font-size: 36px;
  text-align: right;
  font-weight: 300;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.calc-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.calc-row {
  display: flex;
  gap: 4px;
}

.calc-btn {
  flex: 1;
  height: 48px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.calc-btn:active {
  transform: scale(0.95);
}

.calc-btn.number {
  background: #3b3b3b;
  color: #ffffff;
}

.calc-btn.number:hover {
  background: #4a4a4a;
}

.calc-btn.func {
  background: #323232;
  color: #ffffff;
}

.calc-btn.func:hover {
  background: #424242;
}

.calc-btn.operator {
  background: #323232;
  color: #ffffff;
}

.calc-btn.operator:hover {
  background: #424242;
}

.calc-btn.operator.active {
  background: #ffffff;
  color: #1a1a1a;
}

.calc-btn.equals {
  background: #0078d4;
  color: #ffffff;
}

.calc-btn.equals:hover {
  background: #1084d8;
}

@media (max-width: 360px) {
  .calc-window {
    width: 100%;
  }
  
  .calc-btn {
    height: 44px;
    font-size: 14px;
  }
  
  .calc-result {
    font-size: 28px;
  }
}
</style>

<script>
var currentInput = '0';
var previousInput = '';
var operator = null;
var shouldResetInput = false;
var history = '';

function updateDisplay() {
  document.getElementById('calcResult').textContent = formatNumber(currentInput);
  document.getElementById('calcExpression').textContent = previousInput + (operator ? ' ' + getOperatorSymbol(operator) : '');
  document.getElementById('calcHistory').textContent = history;
}

function formatNumber(num) {
  if (num === 'Error') return num;
  var n = parseFloat(num);
  if (isNaN(n)) return '0';
  if (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-10 && n !== 0)) {
    return n.toExponential(6);
  }
  return n.toLocaleString('en-US', { maximumFractionDigits: 10 });
}

function getOperatorSymbol(op) {
  switch(op) {
    case '+': return '+';
    case '-': return '−';
    case '*': return '×';
    case '/': return '÷';
    default: return op;
  }
}

function inputNumber(num) {
  if (shouldResetInput) {
    currentInput = num;
    shouldResetInput = false;
  } else {
    if (currentInput === '0' && num !== '.') {
      currentInput = num;
    } else {
      currentInput += num;
    }
  }
  updateDisplay();
}

function inputDecimal() {
  if (shouldResetInput) {
    currentInput = '0.';
    shouldResetInput = false;
  } else if (!currentInput.includes('.')) {
    currentInput += '.';
  }
  updateDisplay();
}

function inputOperator(op) {
  if (operator && !shouldResetInput) {
    calculate();
  }
  previousInput = currentInput;
  operator = op;
  shouldResetInput = true;
  updateDisplay();
  
  document.querySelectorAll('.calc-btn.operator').forEach(function(btn) {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
}

function calculate() {
  if (!operator || previousInput === '') return;
  
  var prev = parseFloat(previousInput);
  var curr = parseFloat(currentInput);
  var result;
  
  switch(operator) {
    case '+':
      result = prev + curr;
      break;
    case '-':
      result = prev - curr;
      break;
    case '*':
      result = prev * curr;
      break;
    case '/':
      if (curr === 0) {
        result = 'Error';
      } else {
        result = prev / curr;
      }
      break;
  }
  
  history = previousInput + ' ' + getOperatorSymbol(operator) + ' ' + currentInput + ' = ' + formatNumber(result);
  currentInput = result.toString();
  previousInput = '';
  operator = null;
  shouldResetInput = true;
  
  document.querySelectorAll('.calc-btn.operator').forEach(function(btn) {
    btn.classList.remove('active');
  });
  
  updateDisplay();
}

function clearAll() {
  currentInput = '0';
  previousInput = '';
  operator = null;
  shouldResetInput = false;
  history = '';
  document.querySelectorAll('.calc-btn.operator').forEach(function(btn) {
    btn.classList.remove('active');
  });
  updateDisplay();
}

function clearEntry() {
  currentInput = '0';
  shouldResetInput = false;
  updateDisplay();
}

function backspace() {
  if (currentInput.length > 1) {
    currentInput = currentInput.slice(0, -1);
  } else {
    currentInput = '0';
  }
  updateDisplay();
}

function toggleSign() {
  if (currentInput !== '0') {
    if (currentInput.startsWith('-')) {
      currentInput = currentInput.slice(1);
    } else {
      currentInput = '-' + currentInput;
    }
  }
  updateDisplay();
}

function inputPercent() {
  currentInput = (parseFloat(currentInput) / 100).toString();
  updateDisplay();
}

function square() {
  var num = parseFloat(currentInput);
  history = currentInput + '² = ' + formatNumber(num * num);
  currentInput = (num * num).toString();
  shouldResetInput = true;
  updateDisplay();
}

function sqrt() {
  var num = parseFloat(currentInput);
  if (num < 0) {
    currentInput = 'Error';
  } else {
    history = '√' + currentInput + ' = ' + formatNumber(Math.sqrt(num));
    currentInput = Math.sqrt(num).toString();
  }
  shouldResetInput = true;
  updateDisplay();
}

function inputFunction(func) {
  var num = parseFloat(currentInput);
  var result = 1 / num;
  history = '1/(' + currentInput + ') = ' + formatNumber(result);
  currentInput = result.toString();
  shouldResetInput = true;
  updateDisplay();
}

function minimizeCalc() {
  document.querySelector('.calc-window').classList.add('minimized');
}

function maximizeCalc() {
  document.querySelector('.calc-window').classList.toggle('maximized');
}

function closeCalc() {
  document.querySelector('.calculator-container').style.display = 'none';
}

document.addEventListener('keydown', function(e) {
  if (e.key >= '0' && e.key <= '9') {
    inputNumber(e.key);
  } else if (e.key === '.') {
    inputDecimal();
  } else if (e.key === '+') {
    inputOperator('+');
  } else if (e.key === '-') {
    inputOperator('-');
  } else if (e.key === '*') {
    inputOperator('*');
  } else if (e.key === '/') {
    e.preventDefault();
    inputOperator('/');
  } else if (e.key === 'Enter' || e.key === '=') {
    calculate();
  } else if (e.key === 'Escape') {
    clearAll();
  } else if (e.key === 'Backspace') {
    backspace();
  }
});

updateDisplay();
</script>
{% endraw %}
