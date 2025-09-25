// Pac-Man com p5.js (versão inicial)

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
    this.dirX = 0;
    this.dirY = 0;
  }

  update() {
    // Movimento aleatório simples
    if (frameCount % 10 === 0) {
      let dirs = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      let choice = random(dirs);
      let newX = this.x + choice[0];
      let newY = this.y + choice[1];

      if (grid[newY][newX] !== 1) {
        this.x = newX;
        this.y = newY;
      }
    }
  }

  show() {
    fill(this.c);
    rect(this.x * cellSize + 5, this.y * cellSize + 5, cellSize - 10, cellSize - 10, 10);
  }
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
