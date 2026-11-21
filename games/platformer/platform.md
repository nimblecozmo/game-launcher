# Mario-lite Platformer Specification

## Overview
Build a Mario-lite platformer that runs in a single HTML file. You are encouraged to use libraries like **Three.js**, **Phaser**, or **PixiJS**.

## Technical Constraints
- **Single File**: All HTML, CSS, and JavaScript must be contained in one `index.html` file.
- **Technology**: Three.js (preferred), Phaser, or PixiJS.
- **External Libraries**: Allowed via CDN (e.g., unpkg, cdnjs). Must still work in a single file.
- **Canvas Size**: 800 × 400 px, centered on the page.
- **Background**: Dark background color.

## Core Gameplay

### Player
- **Visual**: Red 3D Cube (if Three.js) or 32 × 32 px Sprite.
- **Spawn Point**: (100, 200).
- **Physics**:
    - Gravity pulls the player down every frame.
    - Terminal velocity must be capped.
- **Controls**:
    - **Left/Right Arrows**: Move horizontally (A/D optional).
    - **Spacebar**: Jump (only if standing on a surface).
    - **Jump Strength**: Adjustable variable.

### Environment
- **Ground**: Green 3D Box or rectangle.
- **Platforms**: At least three floating green 3D Boxes or rectangles.
- **Collision**: Player lands on top of ground and platforms.

### Enemies
- **Appearance**: Blue 3D Boxes or rectangles.
- **Behavior**:
    - At least two enemies.
    - Patrol horizontally between two points.
    - Reverse direction upon collision with walls/bounds.
- **Combat**:
    - **Player Hit (Side/Bottom)**: Screen flashes red, player resets to start.
    - **Player Stomp (Top)**: Enemy disappears (defeat).

### Camera
- **Side-scrolling**: When player moves right, the world translates left to keep player centered.

### UI / HUD
- **Top-Left**: Display "Coins: 0" (placeholder).

## Code Architecture
- **Game Loop**: Use `requestAnimationFrame` targeting 60 FPS.
- **Structure**: Cleanly organized into:
    - `init()`
    - `update()`
    - `draw()`
    - `handleInput()`

## Stretch Goals
- [ ] Add coin pickups that increment the HUD counter.
- [ ] Add a "Win" flag at the far right; reaching it displays "You Win!".
- [ ] Add sound effects (Jump, Coin, Enemy Defeat) using Web Audio API.
- [ ] Add parallax background (two scrolling layers).
- [ ] Package everything in a single self-contained HTML file.
