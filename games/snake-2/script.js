// --- GLOBAL GAME STATE ---
// These variables are defined globally so they can be accessed by all functions.
const gridSize = 20;
let snake;
let food;
let dx;
let dy;
let score;
let highScore;
let lives;
let changingDirection;
let gameLoop;
let gameSpeed;
let particles;
let autopilot;
let currentPath;
let hue = 0;

// --- GAME LOGIC FUNCTIONS ---

function main() {
    if (isGameOver()) {
        lives--;
        document.getElementById('lives').textContent = lives;
        if (lives === 0) {
            document.getElementById('gameOver').style.display = 'block';
            clearInterval(gameLoop);
            return;
        }
        respawnSnake();
    }

    if (autopilot) {
        runAutopilot();
    }

    changingDirection = false;
    hue = (hue + 1) % 360;
    clearCanvas();
    updateAndDrawParticles();
    drawFood();
    moveSnake();
    drawSnake();
}

function startGame() {
    const scoreEl = document.getElementById('score');
    const highScoreEl = document.getElementById('highScore');
    const livesEl = document.getElementById('lives');
    const gameOverEl = document.getElementById('gameOver');

    lives = 5;
    score = 0;
    livesEl.textContent = lives;
    scoreEl.textContent = score;
    highScoreEl.textContent = highScore;
    gameOverEl.style.display = 'none';
    
    resetSnake();
    createFood();

    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(main, gameSpeed);
}

function respawnSnake() {
    const canvas = document.getElementById('gameCanvas');
    const startX = Math.floor((canvas.width / gridSize) / 2);
    const startY = Math.floor((canvas.height / gridSize) / 2);
    const length = snake.length;
    snake = [];
    for (let i = 0; i < length; i++) {
        snake.push({ x: startX - i, y: startY });
    }
    dx = 0;
    dy = 0;
    currentPath = [];
}

function resetSnake() {
    const canvas = document.getElementById('gameCanvas');
    const startX = Math.floor((canvas.width / gridSize) / 2);
    const startY = Math.floor((canvas.height / gridSize) / 2);
    snake = [{ x: startX, y: startY }];
    dx = 0;
    dy = 0;
    currentPath = [];
}

function moveSnake() {
    const canvas = document.getElementById('gameCanvas');
    const scoreEl = document.getElementById('score');
    const highScoreEl = document.getElementById('highScore');

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (head.x < 0) head.x = canvas.width / gridSize - 1;
    if (head.x >= canvas.width / gridSize) head.x = 0;
    if (head.y < 0) head.y = canvas.height / gridSize - 1;
    if (head.y >= canvas.height / gridSize) head.y = 0;

    snake.unshift(head);

    const didEatFood = snake[0].x === food.x && snake[0].y === food.y;
    if (didEatFood) {
        score += 10;
        scoreEl.textContent = score;
        if (score > highScore) {
            highScore = score;
            highScoreEl.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        playEatSound();
        createExplosion(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2);
        createFood();
    } else {
        snake.pop();
    }
}

function isGameOver() {
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            return true;
        }
    }
    return false;
}

function createFood() {
    const canvas = document.getElementById('gameCanvas');
    food = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)),
        y: Math.floor(Math.random() * (canvas.height / gridSize))
    };
    console.log(`New food at: ${food.x}, ${food.y}`);
    for (const part of snake) {
        if (part.x === food.x && part.y === food.y) {
            createFood();
            return;
        }
    }
    currentPath = [];
}

// --- DRAWING FUNCTIONS ---

function clearCanvas() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawSnake() {
    snake.forEach((part, index) => drawSnakePart(part, index));
}

function drawSnakePart(snakePart, index) {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const x = snakePart.x * gridSize;
    const y = snakePart.y * gridSize;

    const color = `hsl(${(hue + index * 5) % 360}, 100%, 50%)`;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + gridSize / 2, y + gridSize / 2, gridSize / 2, 0, 2 * Math.PI);
    ctx.fill();

    if (index === 0) {
        ctx.fillStyle = 'black';
        const eyeSize = 2.5;
        const eyeOffsetX = 6;
        const eyeOffsetY = 6;
        let eye1X, eye1Y, eye2X, eye2Y;
        if (dx === 1) { eye1X = x + gridSize - eyeOffsetX; eye1Y = y + eyeOffsetY; eye2X = x + gridSize - eyeOffsetX; eye2Y = y + gridSize - eyeOffsetY; } 
        else if (dx === -1) { eye1X = x + eyeOffsetX; eye1Y = y + eyeOffsetY; eye2X = x + eyeOffsetX; eye2Y = y + gridSize - eyeOffsetY; } 
        else if (dy === 1) { eye1X = x + eyeOffsetY; eye1Y = y + gridSize - eyeOffsetX; eye2X = x + gridSize - eyeOffsetY; eye2Y = y + gridSize - eyeOffsetX; } 
        else { eye1X = x + eyeOffsetY; eye1Y = y + eyeOffsetX; eye2X = x + gridSize - eyeOffsetY; eye2Y = y + eyeOffsetX; }
        ctx.beginPath(); ctx.arc(eye1X, eye1Y, eyeSize, 0, 2 * Math.PI); ctx.fill();
        ctx.beginPath(); ctx.arc(eye2X, eye2Y, eyeSize, 0, 2 * Math.PI); ctx.fill();
    }
}

function drawFood() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'darkred';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    ctx.strokeRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

// --- AUTOPILOT FUNCTIONS ---

function runAutopilot() {
    const canvas = document.getElementById('gameCanvas');
    if (!currentPath || currentPath.length === 0) {
        currentPath = findPath(snake[0], food, snake);
    }

    if (currentPath && currentPath.length > 1) {
        const head = snake[0];
        if (head.x === currentPath[0].x && head.y === currentPath[0].y) {
            const nextStep = currentPath[1];
            const newDx = nextStep.x - head.x;
            const newDy = nextStep.y - head.y;
            if (Math.abs(newDx) > 1) dx = -newDx / Math.abs(newDx); else dx = newDx;
            if (Math.abs(newDy) > 1) dy = -newDy / Math.abs(newDy); else dy = newDy;
            currentPath.shift();
            return;
        }
    }

    // --- Smarter Survival Logic ---
    currentPath = [];
    const head = snake[0];
    let bestMove = null;
    let maxSpace = -1;

    const possibleMoves = [ { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 } ];
    const oppositeDx = -dx;
    const oppositeDy = -dy;

    for (const move of possibleMoves) {
        // Don't reverse
        if (move.dx === oppositeDx && move.dy === oppositeDy && snake.length > 1) {
            continue;
        }

        const nextX = (head.x + move.dx + (canvas.width/gridSize)) % (canvas.width/gridSize);
        const nextY = (head.y + move.dy + (canvas.height/gridSize)) % (canvas.height/gridSize);
        const nextPos = { x: nextX, y: nextY };

        let isSafe = true;
        for (const part of snake) {
            if (part.x === nextPos.x && part.y === nextPos.y) {
                isSafe = false;
                break;
            }
        }

        if (isSafe) {
            const spaceScore = calculateSpaceScore(nextPos, snake);
            if (spaceScore > maxSpace) {
                maxSpace = spaceScore;
                bestMove = move;
            }
        }
    }

    if (bestMove) {
        dx = bestMove.dx;
        dy = bestMove.dy;
    } else {
        // Failsafe if no move is safe (should only happen on imminent death)
        dx = dx;
        dy = dy;
    }
}

function calculateSpaceScore(start, obstacles) {
    const canvas = document.getElementById('gameCanvas');
    const queue = [start];
    const visited = new Set(obstacles.map(p => `${p.x},${p.y}`));
    visited.add(`${start.x},${start.y}`);
    let count = 0;
    const width = canvas.width / gridSize;
    const height = canvas.height / gridSize;

    while (queue.length > 0) {
        const { x, y } = queue.shift();
        count++;

        const neighbors = [ { x: x, y: y - 1 }, { x: x, y: y + 1 }, { x: x - 1, y: y }, { x: x + 1, y: y } ];
        for (const neighbor of neighbors) {
            const wrappedX = (neighbor.x + width) % width;
            const wrappedY = (neighbor.y + height) % height;
            const neighborKey = `${wrappedX},${wrappedY}`;
            if (!visited.has(neighborKey)) {
                visited.add(neighborKey);
                queue.push({ x: wrappedX, y: wrappedY });
            }
        }
    }
    return count;
}

function findPath(start, end, obstacles) {
    const canvas = document.getElementById('gameCanvas');
    const queue = [{ ...start, path: [start] }];
    const visited = new Set(obstacles.map(p => `${p.x},${p.y}`));
    visited.add(`${start.x},${start.y}`);
    const width = canvas.width / gridSize;
    const height = canvas.height / gridSize;
    while (queue.length > 0) {
        const { x, y, path } = queue.shift();
        if (x === end.x && y === end.y) return path;
        const neighbors = [ { x: x, y: y - 1 }, { x: x, y: y + 1 }, { x: x - 1, y: y }, { x: x + 1, y: y } ];
        for (const neighbor of neighbors) {
            const wrappedX = (neighbor.x + width) % width;
            const wrappedY = (neighbor.y + height) % height;
            const neighborKey = `${wrappedX},${wrappedY}`;
            if (!visited.has(neighborKey)) {
                visited.add(neighborKey);
                const newPath = [...path, { x: wrappedX, y: wrappedY }];
                queue.push({ x: wrappedX, y: wrappedY, path: newPath });
            }
        }
    }
    return null;
}

// --- PARTICLE EFFECT FUNCTIONS ---

function createExplosion(x, y) {
    if (!particles) particles = [];
    for (let i = 0; i < 20; i++) {
        particles.push({ x, y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, size: Math.random() * 3 + 1, life: 20 });
    }
}

function updateAndDrawParticles() {
    if (!particles) return;
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) {
            particles.splice(i, 1);
        } else {
            ctx.fillStyle = `rgba(255, 100, 0, ${p.life / 20})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}

const sound = {
    audio: null,
    buffer: null,
};

function playEatSound() {
    if (!sound.audio) {
        sound.audio = new (window.AudioContext || window.webkitAudioContext)();
    }
    const preset = ["noise",0.0000,0.4000,0.0000,0.4280,0.0000,0.0000,20.0000,864.0000,2400.0000,-0.8400,0.0000,0.0000,0.0100,0.0003,0.0000,0.0000,0.0000,0.5000,0.0000,0.0000,0.0000,0.0000,1.0000,0.0000,0.0000,0.0000,0.0000];
    const buffer = jsfx.generate(preset);
    const source = sound.audio.createBufferSource();
    source.buffer = buffer;
    source.connect(sound.audio.destination);
    source.start(0);
}

// --- INITIALIZATION AND EVENT HANDLERS ---

function handlePlayerInput(event) {
    if (event.key === 'Shift') {
        autopilot = !autopilot;
        document.getElementById('autopilotStatus').textContent = autopilot ? 'On' : 'Off';
        currentPath = [];
        return;
    }
    if (autopilot || changingDirection) return;
    changingDirection = true;
    const keyPressed = event.key;
    const goingUp = dy === -1, goingDown = dy === 1, goingRight = dx === 1, goingLeft = dx === -1;
    if ((keyPressed === 'ArrowLeft' || keyPressed.toLowerCase() === 'a') && !goingRight) { dx = -1; dy = 0; }
    if ((keyPressed === 'ArrowUp' || keyPressed.toLowerCase() === 'w') && !goingDown) { dx = 0; dy = -1; }
    if ((keyPressed === 'ArrowRight' || keyPressed.toLowerCase() === 'd') && !goingLeft) { dx = 1; dy = 0; }
    if ((keyPressed === 'ArrowDown' || keyPressed.toLowerCase() === 's') && !goingUp) { dx = 0; dy = 1; }
}

function changeSpeed(event) {
    const speedControlBtns = document.querySelectorAll('.speed-btn');
    const level = parseInt(event.target.dataset.level);

    if (level === 20) {
        gameSpeed = 15; // Ludicrous speed
    } else {
        // Formula to convert level (1-19) to ms interval
        // Level 1: 150ms, Level 19: 24ms
        gameSpeed = 150 - (level - 1) * 7;
    }

    clearInterval(gameLoop);
    gameLoop = setInterval(main, gameSpeed);
    speedControlBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

// This is the main entry point that runs after the HTML document has been fully loaded.
document.addEventListener('DOMContentLoaded', () => {
    // Initialize global state
    snake = [];
    food = {};
    dx = 0;
    dy = 0;
    score = 0;
    lives = 5;
    changingDirection = false;
    gameLoop = null;
    gameSpeed = 100;
    particles = [];
    autopilot = false;
    currentPath = [];

    // Initialize UI and load saved data
    highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
    document.getElementById('highScore').textContent = highScore;
    
    const defaultSpeedLevel = 5;
    gameSpeed = 150 - (defaultSpeedLevel - 1) * 6;
    document.querySelector(`.speed-btn[data-level='${defaultSpeedLevel}']`).classList.add('active');

    // Attach Event Listeners
    const restartButton = document.getElementById('restartButton');
    const speedControlBtns = document.querySelectorAll('.speed-btn');
    const resetHighScoreBtn = document.getElementById('resetHighScoreBtn');

    document.addEventListener('keydown', handlePlayerInput);
    restartButton.addEventListener('click', startGame);
    speedControlBtns.forEach(btn => btn.addEventListener('click', changeSpeed));
    resetHighScoreBtn.addEventListener('click', () => {
        highScore = 0;
        localStorage.removeItem('snakeHighScore');
        document.getElementById('highScore').textContent = highScore;
    });

    // Start the game
    startGame();
});
