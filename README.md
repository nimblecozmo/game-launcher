# 🎮 Game Launcher

Every game Blake has ever made, in one hub. One page, 18 games, zero
installs.

👉 **[https://nimblecozmo.github.io/game-launcher/](https://nimblecozmo.github.io/game-launcher/)**

---

## 🕹️ What's In It

### ⚽ Sports
| Game | What it is |
|---|---|
| **Penalty FC** | Bruno Fernandes vs the keeper. Click the `8` on his shirt three times… |
| **Chef Curry** | A basketball shooter with a real backboard. Guaranteed score. |
| **Goal!** | A Father's Day match. Score, then celebrate. |

### 🏎️ Racing
| Game | What it is |
|---|---|
| **One-Shot F1** | Arcade racer on the grid. |
| **F1 Racing Game** | Head-to-head F1 with real drivers. |

### 🧩 Puzzle
| Game | What it is |
|---|---|
| **Neon Tetris** | Stack the blocks. Clear the lines. |
| **Cube 3x3** | A Rubik's cube tutor that teaches the layers. |

### 🕹️ Arcade
| Game | What it is |
|---|---|
| **Minecraft Bounce** | Bounce the Steve block across the world. |
| **Minecraft Bounce — No Blood** | Same bounce, zero blood. |
| **Geometry Dash** | Rhythm platformer. Tap to jump the spikes. |
| **One-Shot Geometry Dash** | One shot. One life. Geometry Dash. |
| **Lime Rider** | The lime-green dirtbike. Send it flying. |
| **Mario-lite Platformer** | Jump the pits, grab the coins. |
| **Snake** | Classic snake with sound effects. |
| **Snake 2** | Snake, but faster. With speed controls. |
| **Gem Snake** | Snake with gems to collect. |

### 💧 Sandbox
| Game | What it is |
|---|---|
| **Flowstate** | Real GPU Navier–Stokes fluid. Draw your own walls. |
| **2D Fluid Simulator** | The original CPU fluid demo. |

---

## ✨ Features

- **Live thumbnails** — every card shows an actual screenshot of the game
- **Instant search** — type anything, or press `/` to jump to the search box
- **Category filters** — All · Sports · Sandbox · Arcade · Puzzle · Racing
- **🎲 Random game** — can't decide? Let it choose
- **Installable** — it's a PWA, so add it to your iPad/Android home screen
  and it opens fullscreen with no browser chrome
- **Works offline** — the hub and the thumbnails are cached by a service
  worker, so it opens instantly

---

## 🗂️ Structure

```
game-launcher/
├── index.html              the launcher (single file, no build step)
├── manifest.webmanifest    PWA manifest
├── sw.js                   service worker (caches the shell + thumbnails)
├── icons/                  launcher icons
├── thumbs/                 18 game screenshots
└── games/
    ├── penalty-fc/          copy of the game
    ├── chef-curry/
    ├── flowstate/
    ├── minecraft-bounce/
    ├── ... one folder per game
```

Games that already have their own GitHub Pages site (**Flowstate**,
**Penalty FC**, **Chef Curry**, **Minecraft Bounce**) link straight out to
it. Everything else is bundled here so it all plays from one link.

---

## 🌐 Run It Locally

```bash
cd game-launcher
python3 -m http.server 8000
# then open http://localhost:8000
```

> Use a server, not `file://` — ES modules and some game assets are blocked
> on the `file://` protocol.

---

## 🛠️ Built With

Plain HTML, CSS and JavaScript. One `index.html` for the hub, a small
service worker for offline support, and the games themselves — which range
from hand-written Canvas 2D to WebGL2 GPU solvers.

Made by Blake ⚡
