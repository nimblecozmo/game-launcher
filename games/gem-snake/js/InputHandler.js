class InputHandler {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.joystickContainer = document.getElementById('joystick-container');
        this.joystick = document.getElementById('joystick');
        this.setupKeyboard();
        this.setupTouch();
    }

    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (this.callbacks.isGamePaused() && e.key.toLowerCase() !== 'p') return;

            const key = e.key.toLowerCase();

            if (key === 'arrowup' || key === 'w') this.callbacks.onDirectionChange('up');
            else if (key === 'arrowdown' || key === 's') this.callbacks.onDirectionChange('down');
            else if (key === 'arrowleft' || key === 'a') this.callbacks.onDirectionChange('left');
            else if (key === 'arrowright' || key === 'd') this.callbacks.onDirectionChange('right');
            else if (key === 'shift') this.callbacks.onToggleAutopilot();
            else if (key === 'alt') {
                e.preventDefault();
                this.callbacks.onToggleAutoClicker();
            }
            else if (key >= '1' && key <= '9') this.callbacks.onSpeedChange(parseInt(key));
            else if (key === 'p') this.callbacks.onTogglePause();
        });
    }

    setupTouch() {
        if (!this.isMobile()) return;

        this.joystickContainer.style.display = 'block';
        let joystickActive = false;
        let joystickStartX = 0;
        let joystickStartY = 0;

        this.joystick.addEventListener('touchstart', (e) => {
            joystickActive = true;
            const rect = this.joystick.getBoundingClientRect();
            joystickStartX = rect.left + rect.width / 2;
            joystickStartY = rect.top + rect.height / 2;
        }, false);

        this.joystick.addEventListener('touchmove', (e) => {
            if (!joystickActive) return;
            e.preventDefault();
            const touch = e.touches[0];
            const dx = touch.clientX - joystickStartX;
            const dy = touch.clientY - joystickStartY;
            const angle = Math.atan2(dy, dx);
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDist = this.joystick.offsetWidth / 2;

            const x = Math.cos(angle) * Math.min(distance, maxDist);
            const y = Math.sin(angle) * Math.min(distance, maxDist);
            this.joystick.style.transform = `translate(${x}px, ${y}px)`;

            const angleDeg = angle * 180 / Math.PI;
            let dir = '';

            if (angleDeg > -22.5 && angleDeg <= 22.5) dir = 'right';
            else if (angleDeg > 22.5 && angleDeg <= 67.5) dir = 'down-right';
            else if (angleDeg > 67.5 && angleDeg <= 112.5) dir = 'down';
            else if (angleDeg > 112.5 && angleDeg <= 157.5) dir = 'down-left';
            else if (angleDeg > 157.5 || angleDeg <= -157.5) dir = 'left';
            else if (angleDeg > -157.5 && angleDeg <= -112.5) dir = 'up-left';
            else if (angleDeg > -112.5 && angleDeg <= -67.5) dir = 'up';
            else if (angleDeg > -67.5 && angleDeg <= -22.5) dir = 'up-right';

            if (dir) this.callbacks.onDirectionChange(dir);

        }, false);

        this.joystick.addEventListener('touchend', () => {
            joystickActive = false;
            this.joystick.style.transform = 'translate(0, 0)';
        }, false);
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
}
