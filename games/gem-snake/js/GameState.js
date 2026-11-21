class GameState {
    constructor() {
        this.snake = [];
        this.foods = [];
        this.foodPositions = new Set();
        this.pets = [];
        this.particles = [];

        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        this.scoreMultiplier = 1.0;

        this.rebirths = 0;
        this.rebirthMultiplier = 1.0;
        this.rebirthCost = 10000;

        this.direction = 'right';
        this.nextDirection = 'right';
        this.hueOffset = 0;

        this.loadPets();
        this.loadRebirths();
        this.updateScoreMultiplier();
    }

    init() {
        this.snake = [
            { x: CONFIG.WORLD_WIDTH / 2, y: CONFIG.WORLD_HEIGHT / 2 },
            { x: CONFIG.WORLD_WIDTH / 2 - 1, y: CONFIG.WORLD_HEIGHT / 2 },
            { x: CONFIG.WORLD_WIDTH / 2 - 2, y: CONFIG.WORLD_HEIGHT / 2 }
        ];
        this.foods = [];
        this.foodPositions.clear();
        this.generateFoods(CONFIG.INITIAL_SPEED); // Initial generation
        this.score = 0;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.particles = [];
    }

    update(currentSpeedLevel) {
        this.generateFoods(currentSpeedLevel);
        this.hueOffset = (this.hueOffset + 5) % 360;
        this.updateParticles();

        return this.moveSnake();
    }

    moveSnake() {
        const oldHead = { ...this.snake[0] };
        this.direction = this.nextDirection;
        const head = { ...this.snake[0] };

        switch (this.direction) {
            case 'right': head.x++; break;
            case 'left': head.x--; break;
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'up-right': head.y--; head.x++; break;
            case 'up-left': head.y--; head.x--; break;
            case 'down-right': head.y++; head.x++; break;
            case 'down-left': head.y++; head.x--; break;
        }

        // Self collision check
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return 'game-over';
            }
        }

        this.snake.unshift(head);
        let foodEaten = false;

        for (let i = 0; i < this.foods.length; i++) {
            if (head.x === this.foods[i].x && head.y === this.foods[i].y) {
                foodEaten = true;
                this.createExplosion(this.foods[i].x, this.foods[i].y);
                this.score += Math.round(1 * this.scoreMultiplier * this.rebirthMultiplier);

                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    localStorage.setItem('snakeHighScore', this.highScore);
                }

                const posKey = `${this.foods[i].x},${this.foods[i].y}`;
                this.foodPositions.delete(posKey);
                this.foods.splice(i, 1);
                return 'eaten';
            }
        }

        if (!foodEaten) this.snake.pop();
        return 'running';
    }

    generateFoods(attempts) {
        if (this.snake.length === 0 || this.foods.length >= CONFIG.MAX_FOOD) return;

        const head = this.snake[0];
        const viewRadius = 20;
        const spacing = 2;

        for (let i = 0; i < attempts; i++) {
            if (this.foods.length >= CONFIG.MAX_FOOD) break;

            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.random() * viewRadius;
            const x = Math.floor(head.x + Math.cos(angle) * distance);
            const y = Math.floor(head.y + Math.sin(angle) * distance);
            const posKey = `${x},${y}`;

            if (this.foodPositions.has(posKey)) continue;

            let isOccupied = false;
            for (const segment of this.snake) {
                if (segment.x === x && segment.y === y) {
                    isOccupied = true;
                    break;
                }
            }
            if (isOccupied) continue;

            let tooClose = false;
            for (let dx = -spacing; dx <= spacing; dx++) {
                for (let dy = -spacing; dy <= spacing; dy++) {
                    if (this.foodPositions.has(`${x + dx},${y + dy}`)) {
                        tooClose = true;
                        break;
                    }
                }
                if (tooClose) break;
            }
            if (tooClose) continue;

            this.foods.push({ x, y });
            this.foodPositions.add(posKey);
        }
    }

    createExplosion(x, y) {
        const gridSize = CONFIG.GRID_SIZE;
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            this.particles.push({
                x: x * gridSize + gridSize / 2,
                y: y * gridSize + gridSize / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 2 + 1,
                color: `hsl(${Math.random() * 360}, 100%, 60%)`,
                alpha: 1
            });
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.02;
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    // Autopilot Logic
    autopilotMove() {
        const head = this.snake[0];
        let nearestFood = null, minDistance = Infinity;

        if (this.foods.length === 0) {
            const safeDirections = this.getSafeDirections(head, this.direction);
            if (safeDirections.length > 0) this.nextDirection = safeDirections[0];
            return;
        }

        for (const food of this.foods) {
            const dx = head.x - food.x;
            const dy = head.y - food.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
                minDistance = distance;
                nearestFood = food;
            }
        }

        const dx = nearestFood.x - head.x;
        const dy = nearestFood.y - head.y;

        const preferredDirections = [];
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) preferredDirections.push('right');
            if (dx < 0) preferredDirections.push('left');
            if (dy > 0) preferredDirections.push('down');
            if (dy < 0) preferredDirections.push('up');
        } else {
            if (dy > 0) preferredDirections.push('down');
            if (dy < 0) preferredDirections.push('up');
            if (dx > 0) preferredDirections.push('right');
            if (dx < 0) preferredDirections.push('left');
        }

        const safeDirections = this.getSafeDirections(head, this.direction);
        for (const dir of preferredDirections) {
            if (safeDirections.includes(dir)) {
                this.nextDirection = dir;
                return;
            }
        }
        if (safeDirections.length > 0) this.nextDirection = safeDirections[0];
    }

    getSafeDirections(head, currentDirection) {
        const allDirections = ['up', 'down', 'left', 'right'];
        return allDirections.filter(dir => {
            if ((dir === 'right' && currentDirection === 'left') ||
                (dir === 'left' && currentDirection === 'right') ||
                (dir === 'up' && currentDirection === 'down') ||
                (dir === 'down' && currentDirection === 'up')) return false;

            const testHead = { ...head };
            switch (dir) {
                case 'right': testHead.x++; break;
                case 'left': testHead.x--; break;
                case 'up': testHead.y--; break;
                case 'down': testHead.y++; break;
            }

            for (let segment of this.snake) {
                if (segment.x === testHead.x && segment.y === testHead.y) return false;
            }
            return true;
        });
    }

    // Pet System
    buyEgg(eggType) {
        const egg = EGGS[eggType];
        if (this.score >= egg.cost) {
            this.score -= egg.cost;
            this.hatchPet(egg.pool);
            return true;
        }
        return false;
    }

    hatchPet(poolName) {
        const petPool = PET_POOLS[poolName];
        const pet = petPool[Math.floor(Math.random() * petPool.length)];
        this.pets.push(pet);
        this.savePets();
        this.updateScoreMultiplier();
        return pet;
    }

    updateScoreMultiplier() {
        this.scoreMultiplier = 1.0;
        this.pets.forEach(pet => this.scoreMultiplier += pet.multiplier);
    }

    savePets() {
        localStorage.setItem('snakePets', JSON.stringify(this.pets));
    }

    loadPets() {
        const savedPets = localStorage.getItem('snakePets');
        if (savedPets) {
            try {
                this.pets = JSON.parse(savedPets) || [];
            } catch (e) {
                console.error("Error parsing pets data:", e);
                this.pets = [];
            }
        }
    }

    // Rebirth System
    rebirth() {
        if (this.score >= this.rebirthCost) {
            this.rebirths++;
            this.rebirthMultiplier += 0.5;
            this.rebirthCost = Math.round(this.rebirthCost * 1.5);
            this.saveRebirths();

            this.score = 0;
            this.pets = [];
            this.savePets();
            this.updateScoreMultiplier();
            this.init();
            return true;
        }
        return false;
    }

    saveRebirths() {
        localStorage.setItem('snakeRebirths', JSON.stringify({
            rebirths: this.rebirths,
            rebirthMultiplier: this.rebirthMultiplier,
            rebirthCost: this.rebirthCost
        }));
    }

    loadRebirths() {
        const savedRebirths = localStorage.getItem('snakeRebirths');
        if (savedRebirths) {
            try {
                const data = JSON.parse(savedRebirths);
                this.rebirths = parseInt(data.rebirths) || 0;
                this.rebirthMultiplier = parseFloat(data.rebirthMultiplier) || 1.0;
                this.rebirthCost = parseInt(data.rebirthCost) || 10000;
            } catch (e) {
                console.error("Error parsing rebirths data:", e);
                this.rebirths = 0;
                this.rebirthMultiplier = 1.0;
                this.rebirthCost = 10000;
            }
        }
    }

    resetHighScore() {
        localStorage.removeItem('snakeHighScore');
        this.highScore = 0;
    }
}
