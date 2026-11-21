# Project Overview

This project is a classic Snake game implemented in HTML, CSS, and JavaScript. The player controls a snake that grows by eating food while avoiding collisions with its own body. The game features a score, high score, lives, and an autopilot mode.

## Key Technologies

*   **HTML:** The basic structure of the game is defined in `index.html`.
*   **CSS:** Styling is provided by `style.css` for a retro arcade look and feel.
*   **JavaScript:** All game logic is contained in `script.js`. This includes the game loop, snake movement, food generation, collision detection, and rendering.

## Building and Running

This is a simple web project with no build process. To run the game, simply open the `index.html` file in a web browser.

## Development Conventions

The code is written in a procedural style with global variables for the game state. Functions are used to encapsulate different parts of the game logic. There are no explicit linting or formatting rules, but the code is generally well-structured and readable.

### Game Logic (`script.js`)

*   **Game State:** The game state is managed through global variables such as `snake`, `food`, `score`, `highScore`, and `lives`.
*   **Game Loop:** The `main` function serves as the game loop, which is called repeatedly using `setInterval`.
*   **Autopilot:** The game includes an autopilot feature that uses a pathfinding algorithm (`findPath`) to automatically guide the snake to the food. If no path is found, it uses a survival algorithm (`calculateSpaceScore`) to avoid collisions.
*   **Sound Effects:** The game uses the `jsfx.min.js` library to generate sound effects for eating food.
*   **Particle Effects:** A simple particle engine is implemented to create an explosion effect when the snake eats food.

### File Structure

*   `index.html`: The main HTML file.
*   `style.css`: The stylesheet for the game.
*   `script.js`: The JavaScript file containing the game logic.
*   `eat.mp3`, `nom.mp3`: Sound files for the game (currently not used in the code).
*   `speed-controls.html`: A duplicate of the speed controls section in `index.html`.
