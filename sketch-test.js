// Pac-Man Educacional com p5.js
// Versão completa com: múltiplos níveis, menu, tela de vitória e respawn ajustado

// --- Níveis (0: Muito fácil, 1: Fácil, 2: Médio, 3: Difícil, 4: Muito difícil) ---
const levels = [];

let gameState = 'menu'; // 'menu' | 'playing' | 'levelComplete'
let currentLevel = 2; // começa no nível médio
const cellSize = 30;

let pacman;
let ghosts = [];
let grid = [];
let powerMode = false;
let powerTimer = 0;

// -------------------- Layouts dos níveis --------------------
levels.push([
  "11111111111111111111",
  "10000000000000000001",
  "10000011111011100001",
  "10000013000010000001",
  "10000010000013000001",
  "10000011111011100001",
  "10000000000000000001",
  "10000111111111100001",
  "10000000000000000001",
  "11111111111111111111"
]);

levels.push([
  "11111111111111111111",
  "10000001111000000001",
  "10011101301011110001",
  "10000001001000000001",
  "10111101001011111001",
  "10000000000000000001",
  "10111101111101111101",
  "10000000003000000001",
  "10000000000000000001",
  "11111111111111111111"
]);

levels.push([
  "11111111111111111111",
  "10000000001100000001",
  "10301111101111110301",
  "10001000000001000001",
  "11101011111101011111",
  "10000010000000000001",
  "10111110111011111011",
  "10000000000000000001",
  "10110111101111101101",
  "10000100000000000001",
  "11111111111111111111"
]);

levels.push([
  "11111111111111111111",
  "10010001000100001001",
  "10110101000101011101",
  "10000101010101000001",
  "11110101110101111111",
  "10000100000001000001",
  "10111101111101111001",
  "10000000003000000001",
  "10111111101111111101",
  "10000000000000000001",
  "11111111111111111111"
]);

levels.push([
  "11111111111111111111",
  "10001001310101010101",
  "10000001010000010001",
  "10111001011101110101",
  "10001000000001000001",
  "11101011111101011111",
  "10000010000000000001",
  "10111110111011111011",
  "10000000003000000001",
  "11111111111111111111"
]);

let rows = levels[currentLevel].length;
let cols = levels[currentLevel][0].length;

// -------------------- Funções principais --------------------
function loadLevel(index) {
  currentLevel = index;
  const mapLayout = levels[currentLevel];
  rows = mapLayout.length;
  cols = mapLayout[0].length;
  resizeCanvas(cols * cellSize, rows * cellSize);

  grid = [];
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      grid[y][x] = parseInt(mapLayout[y][x]);
    }
  }

  pacman = new Pacman(1, 1);
  ghosts = [];
  ghosts.push(new Ghost(cols - 2, rows - 2, color(255, 0, 0)));
  ghosts.push(new Ghost(1, rows - 2, color(0, 0, 255)));
  ghosts.push(new Ghost(cols - 2, 1, color(255, 105, 180)));
  loop();
}

function setup() {
  createCanvas(cols * cellSize, rows * cellSize);
  frameRate(10);
  loadLevel(currentLevel);
}

function draw() {
  background(0);

  if (gameState === 'menu') {
    drawMenu();
    return;
  }

  if (gameState === 'playing') {
    drawGame();
    return;
  }

  if (gameState === 'levelComplete') {
    drawLevelComplete();
    return;
  }
}

// -------------------- Telas --------------------
function drawMenu() {
  background(10);
  fill(255);
  textAlign(CENTER, TOP);
  textSize(36);
  text('Escolha o nível', width / 2, 40);

  textSize(16);
  const labels = ['Muito Fácil', 'Fácil', 'Médio', 'Difícil', 'Muito Difícil'];
  for (let i = 0; i < labels.length; i++) {
    const bx = width / 2 - 120;
    const by = 120 + i * 60;
    const bw = 240, bh = 44;
    fill('#444');
    rect(bx, by, bw, bh, 8);
    fill(255);
    text(labels[i], width / 2, by + bh / 2 - 6);
  }
}

function drawLevelComplete() {
  background(0, 150);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(36);
  text('Fase concluída!', width / 2, height / 2 - 40);

  const bw = 160, bh = 44;
  if (currentLevel < levels.length - 1) {
    fill('#2d9cdb');
    rect(width / 2 - bw - 10, height / 2 + 10, bw, bh, 8);
    fill(255);
    text('Continuar', width / 2 - bw / 2 - 10, height / 2 + 10 + bh / 2 - 6);
  }
  fill('#777');
  rect(width / 2 + 10, height / 2 + 10, bw, bh, 8);
  fill(255);
  text('Cancelar', width / 2 + bw / 2 + 10, height / 2 + 10 + bh / 2 - 6);
}

function drawGame() {
  background(0);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y][x] === 1) {
        fill('#E84E13'); // cor das paredes
        rect(x * cellSize, y * cellSize, cellSize, cellSize);
      } else if (grid[y][x] === 0) {
        fill(255, 255, 0, 150);
        ellipse(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, 8);
      } else if (grid[y][x] === 3) {
        fill(255);
        ellipse(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, 16);
      }
    }
  }

  pacman.update();
  pacman.show();

  for (let ghost of ghosts) {
    ghost.update();
    ghost.show();

    if (ghost.respawnTimer === 0 && ghost.x === pacman.x && ghost.y === pacman.y) {
      if (powerMode) ghost.reset();
      else {
        noLoop();
        fill(255, 0, 0);
        textSize(32);
        textAlign(CENTER, CENTER);
        text('GAME OVER', width / 2, height / 2);
      }
    }
  }

  if (powerMode) {
    powerTimer--;
    if (powerTimer <= 0) powerMode = false;
  }

  if (checkVictory()) {
    gameState = 'levelComplete';
  }
}

// -------------------- Classes --------------------
class Pacman {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dirX = 0;
    this.dirY = 0;
  }

  update() {
    let newX = this.x + this.dirX;
    let newY = this.y + this.dirY;

    if (grid[newY][newX] !== 1) {
      this.x = newX;
      this.y = newY;
      if (grid[newY][newX] === 0) grid[newY][newX] = 2;
      else if (grid[newY][newX] === 3) {
        grid[newY][newX] = 2;
        powerMode = true;
        powerTimer = 50;
      }
    }
  }

  show() {
    fill(powerMode ? color(0, 255, 0) : color(255, 255, 0));
    ellipse(this.x * cellSize + cellSize / 2, this.y * cellSize + cellSize / 2, cellSize * 0.8);
  }
}

class Ghost {
  constructor(x, y, c) {
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.c = c;
    this.path = [];
    this.respawnTimer = 0;
  }

  reset() {
    this.respawnTimer = 90;
    this.x = -999;
    this.y = -999;
  }

  update() {
    if (this.respawnTimer > 0) {
      this.respawnTimer--;
      if (this.respawnTimer === 0) {
        this.x = this.startX;
        this.y = this.startY;
        this.path = [];
      }
      return;
    }

    if (frameCount % 10 === 0) {
      this.findPath();
      if (this.path.length > 1) {
        this.path.shift();
        let nextStep = this.path[0];
        this.x = nextStep.x;
        this.y = nextStep.y;
      }
    }
  }

  show() {
    if (this.respawnTimer > 0) return;
    fill(powerMode ? color(150) : this.c);
    rect(this.x * cellSize + 5, this.y * cellSize + 5, cellSize - 10, cellSize - 10, 10);
  }

  findPath() {
    this.path = dijkstra({ x: this.x, y: this.y }, { x: pacman.x, y: pacman.y });
  }
}

// -------------------- Utilitários --------------------
function checkVictory() {
  for (let row of grid) {
    if (row.includes(0)) return false;
  }
  return true;
}

function dijkstra(start, end) {
  let dist = {}, prev = {}, pq = [];
  function key(x, y) { return `${x},${y}`; }
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y][x] !== 1) {
        dist[key(x, y)] = Infinity;
        prev[key(x, y)] = null;
      }
    }
  }
  dist[key(start.x, start.y)] = 0;
  pq.push({ x: start.x, y: start.y, d: 0 });

  while (pq.length > 0) {
    pq.sort((a, b) => a.d - b.d);
    let u = pq.shift();
    let uKey = key(u.x, u.y);
    if (u.x === end.x && u.y === end.y) break;

    let neighbors = [
      { x: u.x + 1, y: u.y },
      { x: u.x - 1, y: u.y },
      { x: u.x, y: u.y + 1 },
      { x: u.x, y: u.y - 1 },
    ];

    for (let n of neighbors) {
      if (n.x >= 0 && n.y >= 0 && n.x < cols && n.y < rows && grid[n.y][n.x] !== 1) {
        let alt = dist[uKey] + 1;
        let nKey = key(n.x, n.y);
        if (alt < dist[nKey]) {
          dist[nKey] = alt;
          prev[nKey] = { x: u.x, y: u.y };
          pq.push({ x: n.x, y: n.y, d: alt });
        }
      }
    }
  }

  let path = [];
  let u = { x: end.x, y: end.y };
  while (u) {
    path.unshift(u);
    u = prev[key(u.x, u.y)];
  }
  return path;
}

// -------------------- Interações --------------------
function keyPressed() {
  if (keyCode === LEFT_ARROW) { pacman.dirX = -1; pacman.dirY = 0; }
  else if (keyCode === RIGHT_ARROW) { pacman.dirX = 1; pacman.dirY = 0; }
  else if (keyCode === UP_ARROW) { pacman.dirX = 0; pacman.dirY = -1; }
  else if (keyCode === DOWN_ARROW) { pacman.dirX = 0; pacman.dirY = 1; }
}

function mousePressed() {
  if (gameState === 'menu') {
    const bx = width / 2 - 120;
    for (let i = 0; i < levels.length; i++) {
      const by = 120 + i * 60;
      const bw = 240, bh = 44;
      if (mouseX >= bx && mouseX <= bx + bw && mouseY >= by && mouseY <= by + bh) {
        loadLevel(i);
        gameState = 'playing';
        return;
      }
    }
  } else if (gameState === 'levelComplete') {
    const bw = 160, bh = 44;
    if (currentLevel < levels.length - 1) {
      const contX = width / 2 - bw - 10, contY = height / 2 + 10;
      if (mouseX >= contX && mouseX <= contX + bw && mouseY >= contY && mouseY <= contY + bh) {
        loadLevel(currentLevel + 1);
        gameState = 'playing';
        loop();
        return;
      }
    }
    const cancelX = width / 2 + 10, cancelY = height / 2 + 10;
    if (mouseX >= cancelX && mouseX <= cancelX + bw && mouseY >= cancelY && mouseY <= cancelY + bh) {
      gameState = 'menu';
      return;
    }
  }
}