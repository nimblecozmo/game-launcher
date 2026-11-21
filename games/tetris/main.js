/* Game Constants */
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30; // Matches canvas width 300 / 10
const COLORS = [
    null,
    '#00f0ff', // I
    '#0077ff', // J
    '#ffaa00', // L
    '#ffdd00', // O
    '#00ff77', // S
    '#aa00ff', // T
    '#ff0055', // Z
];

/* Tetromino Definitions */
const SHAPES = [
    [],
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
    [[2, 0, 0], [2, 2, 2], [0, 0, 0]], // J
    [[0, 0, 3], [3, 3, 3], [0, 0, 0]], // L
    [[4, 4], [4, 4]], // O
    [[0, 5, 5], [5, 5, 0], [0, 0, 0]], // S
    [[0, 6, 0], [6, 6, 6], [0, 0, 0]], // T
    [[7, 7, 0], [0, 7, 7], [0, 0, 0]]  // Z
];

class Piece {
    constructor(ctx, shapeId) {
        this.ctx = ctx;
        this.shapeId = shapeId;
        this.shape = SHAPES[shapeId];
        this.color = COLORS[shapeId];
        this.x = 3;
        this.y = 0;
    }

    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.color;

        this.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value > 0) {
                    this.drawBlock(this.x + dx, this.y + dy);
                }
            });
        });
        this.ctx.shadowBlur = 0;
    }

    drawBlock(x, y) {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);

        // Inner highlight for glass effect
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, 2);
        this.ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, 2, BLOCK_SIZE);

        // Reset to main color
        this.ctx.fillStyle = this.color;
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    rotate() {
        // Transpose + Reverse = Rotate 90 deg clockwise
        const newShape = this.shape[0].map((val, index) =>
            this.shape.map(row => row[index]).reverse()
        );
        this.shape = newShape;
    }
}

class Board {
    constructor(ctx) {
        this.ctx = ctx;
        this.grid = this.getEmptyGrid();
    }

    getEmptyGrid() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    reset() {
        this.grid = this.getEmptyGrid();
    }

    draw() {
        this.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.drawBlock(x, y, value);
                }
            });
        });
    }

    drawBlock(x, y, value) {
        const color = COLORS[value];

        this.ctx.fillStyle = color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = color;

        this.ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);

        this.ctx.shadowBlur = 0;

        // Inner highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, 2);
    }

    isValid(piece) {
        return piece.shape.every((row, dy) => {
            return row.every((value, dx) => {
                let x = piece.x + dx;
                let y = piece.y + dy;
                return (
                    value === 0 ||
                    (this.isInside(x, y) && this.checkFree(x, y))
                );
            });
        });
    }

    isInside(x, y) {
        return x >= 0 && x < COLS && y <= ROWS; // y can be 20 for logic, but checked in grid
    }

    checkFree(x, y) {
        // Check floor
        if (y >= ROWS) return false;
        // Check walls
        if (x < 0 || x >= COLS) return false;
        // Check occupied
        return this.grid[y][x] === 0;
    }

    freeze(piece) {
        piece.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value > 0) {
                    this.grid[piece.y + dy][piece.x + dx] = value;
                }
            });
        });
    }

    clearLines() {
        let lines = 0;
        let newGrid = this.grid.filter(row => row.some(value => value === 0));
        lines = ROWS - newGrid.length;
        while (newGrid.length < ROWS) {
            newGrid.unshift(Array(COLS).fill(0));
        }
        this.grid = newGrid;
        return lines;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');

        this.nextCanvas = document.getElementById('next-piece');
        this.nextCtx = this.nextCanvas.getContext('2d');

        this.board = new Board(this.ctx);
        this.piece = null;
        this.nextPiece = null;

        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;

        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;

        this.requestId = null;

        // UI Elements
        this.scoreElement = document.getElementById('score');
        this.linesElement = document.getElementById('lines');
        this.levelElement = document.getElementById('level');
        this.overlay = document.getElementById('game-overlay');
        this.startBtn = document.getElementById('start-btn');
        this.overlayTitle = document.getElementById('overlay-title');
        this.overlayMessage = document.getElementById('overlay-message');
        this.sidebarBtn = document.getElementById('sidebar-btn');

        const btnHandler = (e) => {
            if (e && e.target) e.target.blur(); // Remove focus from button
            if (this.gameOver) {
                this.reset();
            }
            this.togglePause();
            this.canvas.focus();
        };

        this.startBtn.addEventListener('click', btnHandler);
        this.sidebarBtn.addEventListener('click', btnHandler);

        document.addEventListener('keydown', this.handleInput.bind(this));
    }

    init() {
        this.generatePiece();
        this.updateUI();
        this.draw();
        this.paused = true; // Start paused
        this.showOverlay("TETRIS", "Press Button to Start");
    }

    reset() {
        this.board.reset();
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropInterval = 1000;
        this.gameOver = false;
        this.piece = null;
        this.nextPiece = null;
        this.generatePiece();
        this.updateUI();
    }

    generatePiece() {
        const typeId = Math.floor(Math.random() * 7) + 1; // 1-7
        if (!this.nextPiece) {
            const nextTypeId = Math.floor(Math.random() * 7) + 1;
            this.nextPiece = new Piece(this.ctx, nextTypeId); // just used for data
        }

        this.piece = new Piece(this.ctx, this.nextPiece.shapeId);

        const nextNextTypeId = Math.floor(Math.random() * 7) + 1;
        this.nextPiece = new Piece(this.ctx, nextNextTypeId);

        this.drawNextPiece();
    }

    drawNextPiece() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        this.nextCtx.fillStyle = '#0b0c15'; // clear

        const shape = this.nextPiece.shape;
        const color = this.nextPiece.color;
        const size = 20; // smaller block size for preview
        const offsetX = (this.nextCanvas.width - shape[0].length * size) / 2;
        const offsetY = (this.nextCanvas.height - shape.length * size) / 2;

        this.nextCtx.fillStyle = color;
        this.nextCtx.shadowBlur = 10;
        this.nextCtx.shadowColor = color;

        shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.nextCtx.fillRect(offsetX + x * size, offsetY + y * size, size - 1, size - 1);
                }
            });
        });

        this.nextCtx.shadowBlur = 0;
    }

    update(time = 0) {
        if (this.paused || this.gameOver) return;

        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.drop();
        }

        this.draw();
        this.requestId = requestAnimationFrame(this.update.bind(this));
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.board.draw();
        if (this.piece) {
            this.piece.draw();
        }
    }

    drop() {
        this.piece.move(0, 1);
        if (!this.board.isValid(this.piece)) {
            this.piece.move(0, -1);
            this.board.freeze(this.piece);
            this.handleLines();
            this.generatePiece();

            // Check Game Over
            if (!this.board.isValid(this.piece)) {
                this.gameOver = true;
                this.showOverlay("GAME OVER", `Score: ${this.score}`);
            }
        }
        this.dropCounter = 0;
    }

    handleLines() {
        const linesCleared = this.board.clearLines();
        if (linesCleared > 0) {
            // Scoring (Nintendo style)
            const lineScores = [0, 40, 100, 300, 1200];
            this.score += lineScores[linesCleared] * this.level;
            this.lines += linesCleared;

            // Level up every 10 lines
            this.level = Math.floor(this.lines / 10) + 1;
            // Increase speed
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);

            this.updateUI();
        }
    }

    updateUI() {
        this.scoreElement.innerText = this.score;
        this.levelElement.innerText = this.level;
        this.linesElement.innerText = this.lines;
    }

    handleInput(event) {
        if (this.gameOver) return;

        if (event.code === 'KeyP') {
            this.togglePause();
            return;
        }

        if (this.paused) return;

        const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'];
        if (keys.includes(event.code)) {
            event.preventDefault();
        }

        if (event.code === 'ArrowLeft') {
            this.piece.move(-1, 0);
            if (!this.board.isValid(this.piece)) {
                this.piece.move(1, 0);
            }
        } else if (event.code === 'ArrowRight') {
            this.piece.move(1, 0);
            if (!this.board.isValid(this.piece)) {
                this.piece.move(-1, 0);
            }
        } else if (event.code === 'ArrowDown') {
            this.drop();
        } else if (event.code === 'ArrowUp') {
            this.piece.rotate();
            if (!this.board.isValid(this.piece)) {
                // Wall kick (simple: try moving left/right)
                this.piece.move(1, 0); // try right
                if (!this.board.isValid(this.piece)) {
                    this.piece.move(-2, 0); // try left
                    if (!this.board.isValid(this.piece)) {
                        this.piece.move(1, 0); // reset
                        // Revert rotation
                        // For simplicity in this step, re-rotate back 3 times or just store prev shape.
                        // Actually simpler to just manually undo rotation for now?
                        // Or better:
                        for (let i = 0; i < 3; i++) this.piece.rotate();
                    }
                }
            }
        } else if (event.code === 'Space') {
            // Hard drop
            while (this.board.isValid(this.piece)) {
                this.piece.move(0, 1);
            }
            this.piece.move(0, -1);
            this.board.freeze(this.piece);
            this.handleLines();
            this.generatePiece();
            if (!this.board.isValid(this.piece)) {
                this.gameOver = true;
                this.showOverlay("GAME OVER", `Score: ${this.score}`);
            }
            this.dropCounter = 0;
            this.draw(); // immediate update
        }
        this.draw();
    }

    togglePause() {
        this.paused = !this.paused;
        if (this.paused) {
            cancelAnimationFrame(this.requestId);
            this.showOverlay("PAUSED", "Press 'P' to Resume");
        } else {
            this.overlay.classList.add('hidden');
            this.lastTime = performance.now();
            this.update();
            this.sidebarBtn.innerText = "Pause";
        }
    }

    showOverlay(title, msg) {
        this.overlayTitle.innerText = title;
        this.overlayMessage.innerText = msg;
        this.overlay.classList.remove('hidden');

        let btnText = "Start Game";
        if (title === "GAME OVER") {
            btnText = "Restart";
        } else if (title === "PAUSED") {
            btnText = "Resume";
        }

        this.startBtn.innerText = btnText;
        this.sidebarBtn.innerText = btnText;
    }
}

// Start Game
const game = new Game();
game.init();

