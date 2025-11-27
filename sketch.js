// Pac-Man Educacional (versão híbrida com HTML + p5.js)
// O p5.js agora cuida apenas da lógica e renderização do jogo dentro do canvas
// As telas de menu, game over e vitória são controladas via HTML/CSS

// -------------------- Variáveis globais --------------------
let cellSize = 30;
let levels = [];
let currentLevel = 0;
let rows, cols;
let grid = [];
let pacman;
let ghosts = [];
let powerMode = false;
let powerTimer = 0;
let gameRunning = false;

// -------------------- Configuração de níveis --------------------
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

// -------------------- p5.js Setup --------------------
function setup() {
  let container = document.getElementById("canvas-container");
  let cnv = createCanvas(600, 600);
  cnv.parent(container);
  frameRate(10);
  background(0); // <- adiciona fundo preto inicial
  noLoop();
}

// -------------------- Funções de controle --------------------
function startGame(levelIndex) {
  console.log("start")
  currentLevel = levelIndex;
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("gameover").classList.add("hidden");
  document.getElementById("victory").classList.add("hidden");
  document.getElementById("canvas-container").classList.remove("hidden"); // <- mostrar o canvas

  loadLevel(currentLevel);
  gameRunning = true;
  loop();
  redraw(); // <- força o primeiro frame
}

function restart() {
  document.getElementById("gameover").classList.add("hidden");
  loadLevel(currentLevel);
  loop();
}

function goToMenu() {
  document.getElementById("menu").classList.remove("hidden");
  document.getElementById("gameover").classList.add("hidden");
  document.getElementById("victory").classList.add("hidden");
  document.getElementById("canvas-container").classList.add("hidden"); // <- esconder o canvas
  
  noLoop();
  gameRunning = false;
  clear();
}

function gameOver() {
  document.getElementById("gameover").classList.remove("hidden");
  // eslint-disable-next-line no-console
  console.log('Game Over');
  noLoop();
}

function nextLevelOrVictory() {
  if (currentLevel < levels.length - 1) {
    currentLevel++;
    loadLevel(currentLevel);
  } else {
    document.getElementById("victory").classList.remove("hidden");
    noLoop();
  }
}

// -------------------- Lógica de níveis --------------------
function loadLevel(index) {
  console.log("load")
  const mapLayout = levels[index];
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
  ghosts = [
    new Ghost(cols - 2, rows - 2, color(255, 0, 0), 0),
    // new Ghost(1, rows - 2, color(0, 0, 255), 1),
    // new Ghost(cols - 2, 1, color(255, 105, 180), 2)
  ];
  powerMode = false;
  powerTimer = 0;
}

// -------------------- p5.js Loop --------------------
function draw() {
  console.log("draw")
  console.log(pacman)
  console.log(ghosts)
  
  if (!gameRunning) return;

  background(0);
  drawMap();
  pacman.update();
  pacman.show();

  for (let ghost of ghosts) {
    ghost.update();
    ghost.show();

    if (ghost.respawnTimer === 0 && ghost.x === pacman.x && ghost.y === pacman.y) {
      if (powerMode) ghost.reset();
      else gameOver();
    }
  }

  if (powerMode) {
    powerTimer--;
    if (powerTimer <= 0) powerMode = false;
  }

  if (checkVictory()) nextLevelOrVictory();
}

// -------------------- Desenho do mapa --------------------
function drawMap() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y][x] === 1) {
        fill('#ffa32b');
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

    // impede acessos fora do grid
    if (newX < 0 || newY < 0 || newX >= cols || newY >= rows) return;

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
  constructor(x, y, c, id) {
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.c = c;
    this.id = id;
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

    if (frameCount % (10 + this.id) === 0) {
      this.findPath();
      if (this.path.length > 1) {
        this.path.shift();
        let nextStep = this.path[0];
        if (!ghosts.some(g => g !== this && g.x === nextStep.x && g.y === nextStep.y)) {
          this.x = nextStep.x;
          this.y = nextStep.y;
        }
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

// -------------------- Controles --------------------
function keyPressed() {
  if (!gameRunning) return;
  if (keyCode === LEFT_ARROW) { pacman.dirX = -1; pacman.dirY = 0; }
  else if (keyCode === RIGHT_ARROW) { pacman.dirX = 1; pacman.dirY = 0; }
  else if (keyCode === UP_ARROW) { pacman.dirX = 0; pacman.dirY = -1; }
  else if (keyCode === DOWN_ARROW) { pacman.dirX = 0; pacman.dirY = 1; }
}