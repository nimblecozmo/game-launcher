class SoundManager {
    constructor() {
        this.eatSound = new Audio('sounds/eat.mp3');
        this.eatSound.volume = 0.3;
        this.gameOverSound = new Audio('sounds/game-over.wav');

        this.muted = localStorage.getItem('snakeMuted') === 'true';
    }

    playEat() {
        if (!this.muted) {
            this.eatSound.currentTime = 0;
            this.eatSound.play().catch(e => console.log("Audio play failed", e));
        }
    }

    playGameOver() {
        if (!this.muted) {
            this.gameOverSound.currentTime = 0;
            this.gameOverSound.play().catch(e => console.log("Audio play failed", e));
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('snakeMuted', this.muted);
        return this.muted;
    }

    isMuted() {
        return this.muted;
    }
}
