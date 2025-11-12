// Pac-Man com p5.js + Fantasmas com Dijkstra + Power-ups

// Mapa customizado (0=ponto, 1=parede, 2=vazio, 3=power-up)
const mapLayout = [
  "11111111111111111111",
  "10000000001100000001",
  "10301111101111110301",
  "10001000000001000001",
  "11101011111101011111",
  "10000010000000000001",
  "10111110111011111011",
  "10000000003000000001",
  "10110111101111101101",
  "10000100000000000001",
  "11110101111111010111",
  "10000001000000000001",
  "10301111101111110301",
  "10000000001100000001",
  "11111111111111111111",
];

const rows = mapLayout.length;
const cols = mapLayout[0].length;
const cellSize = 30;

let pacman;
let ghosts = [];
let grid = [];

let powerMode = false;
let powerTimer = 0;

function setup() {
  createCanvas(cols * cellSize, rows * cellSize);
  frameRate(10);

  // Converte layout em grid
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      grid[y][x] = parseInt(mapLayout[y][x]);
    }
  }

  // Pac-Man inicial
  pacman = new Pacman(1, 1);

  // Fantasmas
  ghosts.push(new Ghost(cols - 2, rows - 2, color(255, 0, 0)));
  ghosts.push(new Ghost(1, rows - 2, color(0, 0, 255)));
  ghosts.push(new Ghost(cols - 2, 1, color(255, 105, 180)));
}

function draw() {
  background(0);

  // Desenha mapa
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y][x] === 1) {
        fill('#ffa32b');
        rect(x * cellSize, y * cellSize, cellSize, cellSize);
      } else if (grid[y][x] === 0) {
        fill(255, 255, 0, 150);
        ellipse(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, 8);
      } else if (grid[y][x] === 3) {
        fill(255, 255, 255);
        ellipse(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, 16);
      }
    }
  }

  // Atualiza Pac-Man
  pacman.update();
  pacman.show();

  // Atualiza fantasmas
  for (let ghost of ghosts) {
    ghost.update();
    ghost.show();

    // Colisão com Pac-Man
    if (ghost.x === pacman.x && ghost.y === pacman.y) {
      if (powerMode) {
        // Fantasma "morre" e volta ao canto inicial
        ghost.reset();
      } else {
        // Pac-Man morre
        noLoop();
        fill(255, 0, 0);
        textSize(32);
        textAlign(CENTER, CENTER);
        text("GAME OVER", width / 2, height / 2);
      }
    }
  }

  // Controle do tempo do poder
  if (powerMode) {
    powerTimer--;
    if (powerTimer <= 0) {
      powerMode = false;
    }
  }
}

// ==========================
// Classes
// ==========================
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

      if (grid[newY][newX] === 0) {
        grid[newY][newX] = 2; // remove ponto
      } else if (grid[newY][newX] === 3) {
        grid[newY][newX] = 2; // remove power-up
        powerMode = true;
        powerTimer = 50; // dura 50 ticks (~5s)
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
    this.respawnTimer = 0; // contador de respawn (0 = vivo)
  }

  reset() {
    this.respawnTimer = 60; // duração do respawn em frames (~3s a 30fps; ajuste se usar outro frameRate)
    this.x = -999; // joga o fantasma "fora" do mapa
    this.y = -999;
  }

  update() {
    if (this.respawnTimer > 0) {
      this.respawnTimer--;
      // Quando o timer zerar, volta para o spawn
      if (this.respawnTimer === 0) {
        this.x = this.startX;
        this.y = this.startY;
        this.pixelX = this.x * cellSize;
        this.pixelY = this.y * cellSize;
        this.path = [];
      }
      return; // enquanto em respawn, não faz nada
    }


    // Fantasmas se movem mais rápido (a cada 5 frames)
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
    fill(powerMode ? color(150) : this.c); // cinza se Pac-Man estiver em poder
    rect(this.x * cellSize + 5, this.y * cellSize + 5, cellSize - 10, cellSize - 10, 10);
  }

  findPath() {
    this.path = dijkstra({ x: this.x, y: this.y }, { x: pacman.x, y: pacman.y });
  }
}

// ==========================
// Algoritmo de Dijkstra
// ==========================
function dijkstra(start, end) {
  let dist = {};
  let prev = {};
  let pq = [];

  function key(x, y) {
    return `${x},${y}`;
  }

  // Inicialização
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

// ==========================
// Controles
// ==========================
function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    pacman.dirX = -1;
    pacman.dirY = 0;
  } else if (keyCode === RIGHT_ARROW) {
    pacman.dirX = 1;
    pacman.dirY = 0;
  } else if (keyCode === UP_ARROW) {
    pacman.dirX = 0;
    pacman.dirY = -1;
  } else if (keyCode === DOWN_ARROW) {
    pacman.dirX = 0;
    pacman.dirY = 1;
  }
}
