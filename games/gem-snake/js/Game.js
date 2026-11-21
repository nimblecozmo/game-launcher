

class Game {
    constructor() {
        this.canvas = document.getElementById('game-board');
        this.gameState = new GameState();
        this.renderer = new Renderer(this.canvas);
        this.soundManager = new SoundManager();

        this.inputHandler = new InputHandler({
            onDirectionChange: (dir) => this.gameState.nextDirection = dir,
            onToggleAutopilot: () => this.toggleAutopilot(),
            onToggleAutoClicker: () => this.toggleAutoClicker(),
            onSpeedChange: (speed) => this.changeGameSpeed(speed),
            onTogglePause: () => this.togglePause(),
            isGamePaused: () => this.gamePaused
        });

        this.gameRunning = false;
        this.gamePaused = false;
        this.autopilot = false;
        this.autoClickerActive = false;
        this.currentSpeedLevel = 4;
        this.gameSpeed = CONFIG.SPEED_MAPPING[4];

        this.lastTime = 0;
        this.accumulator = 0;
        this.animationFrameId = null;
        this.autoClickInterval = null;

        this.ui = {
            score: document.getElementById('score'),
            highScore: document.getElementById('high-score'),
            rebirths: document.getElementById('rebirths'),
            rebirthMultiplier: document.getElementById('rebirth-multiplier'),
            scoreMultiplier: document.getElementById('score-multiplier'),
            startBtn: document.getElementById('start-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            autopilotBtn: document.getElementById('autopilot-btn'),
            autoClickerBtn: document.getElementById('auto-clicker-btn'),
            resetBtn: document.getElementById('reset-btn'),
            resetHsBtn: document.getElementById('reset-hs-btn'),
            rebirthBtn: document.getElementById('rebirth-btn'),
            myPetsList: document.getElementById('my-pets-list'),
            modal: document.getElementById('pet-odds-modal'),
            modalEggName: document.getElementById('modal-egg-name'),
            modalPetList: document.getElementById('modal-pet-list'),
            closeModalBtn: document.querySelector('.close-button'),
            gameOverEffect: document.getElementById('game-over-effect'),
            soundToggleBtn: document.getElementById('sound-toggle-btn'), // New button
            pauseOverlay: document.getElementById('pause-overlay') // New overlay
        };

        this.setupUIListeners();
        this.resetGame(); // Initialize state so snake is visible
    }

    setupUIListeners() {
        this.ui.startBtn.addEventListener('click', () => this.toggleStart());
        this.ui.pauseBtn.addEventListener('click', () => this.togglePause());
        this.ui.autopilotBtn.addEventListener('click', () => this.toggleAutopilot());
        this.ui.autoClickerBtn.addEventListener('click', () => this.toggleAutoClicker());
        this.ui.resetBtn.addEventListener('click', () => this.resetGame());
        this.ui.resetHsBtn.addEventListener('click', () => {
            this.gameState.resetHighScore();
            this.updateUI();
        });
        this.ui.rebirthBtn.addEventListener('click', () => {
            if (this.gameState.rebirth()) {
                this.updateUI();
                this.renderer.draw(this.gameState);
            }
        });

        this.ui.closeModalBtn.addEventListener('click', () => this.hidePetOdds());
        window.addEventListener('click', (e) => {
            if (e.target == this.ui.modal) this.hidePetOdds();
        });

        // Egg buttons
        for (const eggType in EGGS) {
            const eggElement = document.getElementById(`egg-${eggType}`);
            const buyBtn = document.getElementById(`buy-egg-${eggType}`);

            if (eggElement) {
                eggElement.addEventListener('click', (e) => {
                    if (e.target.tagName !== 'BUTTON') this.showPetOdds(eggType);
                });
            }
            if (buyBtn) {
                buyBtn.addEventListener('click', () => {
                    if (this.gameState.buyEgg(eggType)) {
                        this.updateUI();
                    }
                });
            }
        }

        // Speed buttons
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', () => this.changeGameSpeed(parseInt(btn.getAttribute('data-speed'))));
        });

        // Sound Toggle
        if (this.ui.soundToggleBtn) {
            this.ui.soundToggleBtn.addEventListener('click', () => {
                const muted = this.soundManager.toggleMute();
                this.ui.soundToggleBtn.textContent = muted ? 'Sound: OFF' : 'Sound: ON';
                this.ui.soundToggleBtn.classList.toggle('muted', muted);
            });
            // Init state
            const muted = this.soundManager.isMuted();
            this.ui.soundToggleBtn.textContent = muted ? 'Sound: OFF' : 'Sound: ON';
            this.ui.soundToggleBtn.classList.toggle('muted', muted);
        }
    }

    toggleStart() {
        if (!this.gameRunning) {
            this.startGame();
        } else if (this.gamePaused) {
            this.togglePause();
        }
    }

    startGame() {
        this.gameState.init();
        this.gameRunning = true;
        this.gamePaused = false;
        this.ui.startBtn.textContent = 'Restart Game';
        this.ui.pauseBtn.textContent = 'Pause Game';
        this.lastTime = performance.now();
        this.accumulator = 0;
        this.animationFrameId = requestAnimationFrame((t) => this.loop(t));
        this.updateUI();
    }

    togglePause() {
        if (!this.gameRunning) return;
        this.gamePaused = !this.gamePaused;
        this.ui.pauseBtn.textContent = this.gamePaused ? 'Resume Game' : 'Pause Game';

        if (this.ui.pauseOverlay) {
            this.ui.pauseOverlay.style.display = this.gamePaused ? 'flex' : 'none';
        }

        if (!this.gamePaused) {
            this.lastTime = performance.now();
            this.animationFrameId = requestAnimationFrame((t) => this.loop(t));
        }
    }

    resetGame() {
        cancelAnimationFrame(this.animationFrameId);
        this.gameRunning = false;
        this.gamePaused = false;
        this.autopilot = false;
        this.ui.autopilotBtn.textContent = 'Autopilot: OFF';
        this.ui.autopilotBtn.classList.remove('autopilot-active');
        this.gameState.init();
        this.ui.startBtn.textContent = 'Start Game';
        this.ui.pauseBtn.textContent = 'Pause Game';
        if (this.ui.pauseOverlay) this.ui.pauseOverlay.style.display = 'none';
        this.renderer.draw(this.gameState);
        this.updateUI();
    }

    loop(timestamp) {
        if (!this.gameRunning || this.gamePaused) return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.accumulator += deltaTime;

        while (this.accumulator >= this.gameSpeed) {
            if (this.autopilot) this.gameState.autopilotMove();

            const result = this.gameState.update(this.currentSpeedLevel);

            if (result === 'game-over') {
                this.gameOver();
                return;
            } else if (result === 'eaten') {
                this.soundManager.playEat();
                this.updateUI();
            }

            this.accumulator -= this.gameSpeed;
        }

        this.renderer.draw(this.gameState);
        this.animationFrameId = requestAnimationFrame((t) => this.loop(t));
    }

    gameOver() {
        this.gameRunning = false;
        this.soundManager.playGameOver();
        this.ui.gameOverEffect.classList.add('active');
        setTimeout(() => {
            this.resetGame();
            this.ui.gameOverEffect.classList.remove('active');
        }, 500);
    }

    changeGameSpeed(speed) {
        this.currentSpeedLevel = speed;
        this.gameSpeed = CONFIG.SPEED_MAPPING[speed] || 150;
    }

    toggleAutopilot() {
        if (this.gameRunning) {
            this.autopilot = !this.autopilot;
            this.ui.autopilotBtn.textContent = `Autopilot: ${this.autopilot ? 'ON' : 'OFF'}`;
            this.ui.autopilotBtn.classList.toggle('autopilot-active', this.autopilot);
        }
    }

    toggleAutoClicker() {
        this.autoClickerActive = !this.autoClickerActive;
        this.ui.autoClickerBtn.textContent = `Auto Clicker: ${this.autoClickerActive ? 'ON' : 'OFF'}`;
        this.ui.autoClickerBtn.classList.toggle('autoclicker-active', this.autoClickerActive);

        if (this.autoClickerActive) {
            window.addEventListener('mousemove', this.updateMousePosition);
            this.autoClickInterval = setInterval(() => {
                const element = document.elementFromPoint(this.mouseX, this.mouseY);
                if (element && this.isClickable(element)) {
                    element.click();
                }
            }, 1); // Very fast clicking
        } else {
            clearInterval(this.autoClickInterval);
            window.removeEventListener('mousemove', this.updateMousePosition);
        }
    }

    updateMousePosition = (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }

    isClickable(element) {
        // Prevent clicking controls that toggle modes to avoid loops
        const id = element.id;
        const classes = element.classList;
        if (id === 'auto-clicker-btn') return false;
        // Add other exclusions if needed
        return true;
    }

    updateUI() {
        this.ui.score.textContent = this.formatNumber(this.gameState.score);
        this.ui.highScore.textContent = this.formatNumber(this.gameState.highScore);
        this.ui.rebirths.textContent = this.gameState.rebirths;
        this.ui.rebirthMultiplier.textContent = `${this.gameState.rebirthMultiplier.toFixed(1)}x`;
        this.ui.scoreMultiplier.textContent = `${this.gameState.scoreMultiplier.toFixed(1)}x`;
        this.ui.rebirthBtn.textContent = `Rebirth (Cost: ${this.formatNumber(this.gameState.rebirthCost)})`;

        this.renderPets();
    }

    renderPets() {
        this.ui.myPetsList.innerHTML = '';
        this.gameState.pets.forEach(pet => {
            const petDiv = document.createElement('div');
            petDiv.className = `pet pet-${pet.rarity}`;
            petDiv.innerHTML = `<span class="pet-name">${pet.name}</span> <span class="pet-multiplier">+${pet.multiplier}x</span>`;
            this.ui.myPetsList.appendChild(petDiv);
        });
    }

    showPetOdds(eggType) {
        const egg = EGGS[eggType];
        const petPool = PET_POOLS[egg.pool];
        this.ui.modalEggName.textContent = `${egg.name} Odds`;
        this.ui.modalPetList.innerHTML = '';

        // Calculate total weight if needed, but here it's uniform random in the pool
        const chance = (100 / petPool.length).toFixed(1);

        petPool.forEach(pet => {
            const petOddDiv = document.createElement('div');
            petOddDiv.className = 'modal-pet';
            petOddDiv.innerHTML = `<span>${pet.name}</span><span>+${pet.multiplier}x</span><span>${chance}%</span>`;
            this.ui.modalPetList.appendChild(petOddDiv);
        });
        this.ui.modal.style.display = 'block';
    }

    hidePetOdds() {
        this.ui.modal.style.display = 'none';
    }

    formatNumber(num) {
        if (num < 1e6) return num.toString();
        if (num >= 1e6 && num < 1e9) return (num / 1e6).toFixed(2) + 'm';
        if (num >= 1e9 && num < 1e12) return (num / 1e9).toFixed(2) + 'b';
        if (num >= 1e12 && num < 1e15) return (num / 1e12).toFixed(2) + 't';
        if (num >= 1e15 && num < 1e18) return (num / 1e15).toFixed(2) + 'QA';
        if (num >= 1e18 && num < 1e21) return (num / 1e18).toFixed(2) + 'QI';
        if (num >= 1e21 && num < 1e24) return (num / 1e21).toFixed(2) + 'sx';
        if (num >= 1e24) return (num / 1e24).toFixed(2) + 'sp';
        return num.toString();
    }
}

// Start the game instance
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
