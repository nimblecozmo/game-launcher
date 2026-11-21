class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        // Make canvas responsive, but keep aspect ratio or just fill screen?
        // The original game had fixed 600x450.
        // Let's make it fill the container width, but maintain aspect ratio for now to avoid gameplay changes
        // or just fill available space.
        // Given the "infinite world" nature, filling the screen is better.

        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = Math.min(window.innerHeight * 0.6, container.clientWidth * 0.75); // Keep some aspect ratio logic or max height

        // If we want full responsiveness we might need to adjust how we center the camera.
        // The draw function centers on snake head, so canvas size change is fine.
    }

    draw(state) {
        if (!state.snake || state.snake.length === 0) return;

        const { snake, foods, particles, direction, hueOffset } = state;
        const gridSize = CONFIG.GRID_SIZE;

        // Center camera on snake head
        const head = snake[0];
        const offsetX = this.canvas.width / 2 - head.x * gridSize;
        const offsetY = this.canvas.height / 2 - head.y * gridSize;

        // Clear background
        this.ctx.fillStyle = CONFIG.COLORS.BOARD_BG;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(offsetX, offsetY);

        // Draw Snake
        for (let i = 0; i < snake.length; i++) {
            const segment = snake[i];
            const hue = (hueOffset + i * 10) % 360;
            this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            this.ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);

            // Eyes for head
            if (i === 0) {
                this.ctx.fillStyle = 'white';
                this.drawEyes(segment.x, segment.y, gridSize, direction);
            }

            this.ctx.strokeStyle = CONFIG.COLORS.SNAKE_BORDER;
            this.ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        }

        // Draw Food
        for (const food of foods) {
            this.ctx.fillStyle = CONFIG.COLORS.FOOD;
            this.ctx.beginPath();
            this.ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.fillStyle = CONFIG.COLORS.FOOD_SHINE;
            this.ctx.beginPath();
            this.ctx.arc(food.x * gridSize + gridSize / 2 - 3, food.y * gridSize + gridSize / 2 - 3, gridSize / 6, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw Particles
        this.drawParticles(particles);

        this.ctx.restore();
    }

    drawEyes(x, y, size, direction) {
        const ctx = this.ctx;
        const s = size;
        const bx = x * s;
        const by = y * s;

        // Helper to draw a rect relative to block
        const r = (ox, oy, w, h) => ctx.fillRect(bx + ox, by + oy, w, h);

        if (direction === 'right') { r(15, 5, 3, 3); r(15, 12, 3, 3); }
        else if (direction === 'left') { r(2, 5, 3, 3); r(2, 12, 3, 3); }
        else if (direction === 'up') { r(5, 2, 3, 3); r(12, 2, 3, 3); }
        else if (direction === 'down') { r(5, 15, 3, 3); r(12, 15, 3, 3); }
        else if (direction === 'up-right') { r(15, 2, 3, 3); }
        else if (direction === 'up-left') { r(2, 2, 3, 3); }
        else if (direction === 'down-right') { r(15, 15, 3, 3); }
        else if (direction === 'down-left') { r(2, 15, 3, 3); }
    }

    drawParticles(particles) {
        for (const p of particles) {
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
        }
    }
}
