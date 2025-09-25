// Pac-Man com p5.js + Fantasmas com Dijkstra

const cols = 20;
const rows = 20;
const cellSize = 30;

let pacman;
let ghosts = [];
let grid = [];

function setup() {
  createCanvas(cols * cellSize, rows * cellSize);
  frameRate(10);

  // Cria mapa (0 = ponto, 1 = parede, 2 = vazio)
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      if (x === 0 || y === 0 || x === cols - 1 || y === rows - 1 || (x % 4 === 0 && y % 4 === 0)) {
        grid[y][x] = 1; // parede
      } else {
        grid[y][x] = 0; // ponto
      }
    }
  }

  // Pac-Man inicial
  pacman = new Pacman(1, 1);

  // Fantasmas
  ghosts.push(new Ghost(cols - 2, rows - 2, color(255, 0, 0)));
  ghosts.push(new Ghost(1, rows - 2, color(0, 0, 255)));
}

function draw() {
  background(0);

  // Desenha mapa
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y][x] === 1) {
        fill(50, 50, 200);
        rect(x * cellSize, y * cellSize, cellSize, cellSize);
      } else if (grid[y][x] === 0) {
        fill(255, 255, 0, 150);
        ellipse(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, 8);
      }
    }
  }

  // Atualiza e desenha Pac-Man
  pacman.update();
  pacman.show();

  // Atualiza e desenha fantasmas
  for (let ghost of ghosts) {
    ghost.update();
    ghost.show();

    // Colisão com Pac-Man
    if (ghost.x === pacman.x && ghost.y === pacman.y) {
      noLoop();
      fill(255, 0, 0);
      textSize(32);
      textAlign(CENTER, CENTER);
      text("GAME OVER", width / 2, height / 2);
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
      }
    }
  }

  show() {
    fill(255, 255, 0);
    ellipse(this.x * cellSize + cellSize / 2, this.y * cellSize + cellSize / 2, cellSize * 0.8);
  }
}

class Ghost {
  constructor(x, y, c) {
    this.x = x;
    this.y = y;
    this.c = c;
    this.path = [];
  }

  update() {
    // Fantasmas se movem mais rápido (a cada 5 frames)
    if (frameCount % 5 === 0) {
      this.findPath();

      if (this.path.length > 1) {
        // Remove o primeiro passo (posição atual)
        this.path.shift();
        let nextStep = this.path[0];
        this.x = nextStep.x;
        this.y = nextStep.y;
      }
    }
  }

  show() {
    fill(this.c);
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
    // Seleciona nó com menor distância
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

  // Reconstrução do caminho
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
