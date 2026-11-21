# One-Shot Geometry Dash

A complete single-file browser rhythm-platformer in the style of Geometry Dash, built from scratch in vanilla JavaScript + Canvas2D. No external assets — every visual and every sound is synthesized in code.

![Menu](tests/screenshot-menu.png)

## Play it

Open `index.html` directly in any modern browser, or serve the folder:

```bash
python3 -m http.server 8765
# then visit http://127.0.0.1:8765/index.html
```

## Controls

| Key | Action |
|---|---|
| <kbd>SPACE</kbd> / <kbd>↑</kbd> / Click | Single jump (tap) |
| <kbd>←</kbd> / <kbd>→</kbd> | Pick a level on the menu |
| <kbd>ESC</kbd> | Back to menu |
| <kbd>M</kbd> | Mute / unmute |

## What's in the box

- **3 hand-designed levels** of escalating difficulty:
  1. **Stereo Madness** (purple, 130 BPM) — introduction: single spikes, blocks, your first pad
  2. **Back on Track** (pink, 140 BPM) — adds orb-jumps and stacked block towers
  3. **Polargeist** (cyan, 150 BPM) — fast, dense, three-spike chains and tight pad timings
- **Procedural music** — every level has its own synth loop tuned to the BPM, with a kick drum on every beat
- **Synthesized SFX** — jump blip, death noise burst, level-complete fanfare
- **Real physics** — gravity, jump impulse, AABB collision, top-of-block landing. Single jump arc — no flight mode.
- **Polished feel** — parallax mountains, twinkling stars, particle trail, screen shake + flash on death, rotation while airborne, attempt counter, best-% per level
- **Single file** — `index.html` is the entire game (~46KB, no build step)

## Game elements

| Element | Behavior |
|---|---|
| **Spike** (white triangle) | Instant death |
| **Block** (white square) | Land on top; side-bump = death |
| **Yellow Pad** | Small jump (~1.4× normal) |
| **Yellow Orb** | Big jump (~1.8× normal) |

Hold the jump button in mid-air to fly — the player decelerates and can climb. Release to drop.

*(Updated: flight mode removed — pure single jump arc now. Gravity always applies.)*

## Screenshots

### Level 2 — Back on Track
![Back on Track](tests/screenshot-level2.png)

### Death
![Death](tests/screenshot-death.png)

### Level complete
![Level complete](tests/screenshot-complete.png)

## Tests

```bash
# Start a local server first (Playwright needs http://, not file://)
python3 -m http.server 8765 &
node tests/dash-test.js
```

The test suite boots the game in Firefox, drives it via keyboard input, and verifies 35 behaviors across load, menu navigation, jump physics, scroll, hazard collision, restart, level select, level completion, audio mute, and zero console errors. Screenshots are written to `tests/`.

## How it works (high level)

- **One `<canvas>`** at 960×540. Everything (backgrounds, mountains, ground, obstacles, player, particles, menu) is drawn with Canvas2D primitives — no images, no SVGs.
- **WebAudio** for all sound. The music is a pattern of `[beat, frequency, duration]` tuples scheduled against `AudioContext.currentTime`. A simple `setInterval` plays a kick drum on every beat.
- **Fixed-timestep game loop** using `requestAnimationFrame` with `dt` clamped to ≤33ms.
- **State machine**: `menu → playing → dead → playing | complete → menu`.
- **Obstacle collision** is AABB on the player square vs each object's hitbox; blocks use a "did the player's bottom-edge last frame sit above the block top?" test to distinguish landing-on-top from side-bumping.

## Bugs found and fixed during build

1. **Note-frequency table was inside the Audio IIFE** but referenced at module scope by `buildLevels()` → `ReferenceError: N is not defined`. Moved to top-level scope.
2. **Sign-convention bug in physics constants** — `MAX_FALL = -1400` clobbered the upward jump velocity (`720`) on the very first frame. Fixed to `MAX_FALL = +1400`, `JUMP_VEL = -720`.
3. **Ground-clamp ran before integration**, so the player's upward velocity was zeroed the moment it was set (since `y + size === ground_y` was already true). Moved integration before the clamp.
4. **An old Python HTTP server on port 8765** (from the dirtbike project) was serving the wrong file at the same URL the new geometry-dash server tried to bind to. Killed the stale process; tests use a fresh `python3 -m http.server` per run.
5. **Race condition between keydown/keyup and `requestAnimationFrame`** — `keyboard.press('Space')` fires keydown+keyup synchronously. The keyup handler used to clear `state.input.start`, so when both events landed before the next animation frame the jump was consumed without ever being seen. Switched to a **rising-edge flag**: keydown sets start=true, keyup no longer clears it, only `updatePlaying` clears it after consuming. Fixed the intermittent jump failures (was failing ~60% of the time).
6. **Flight mode removed** — user feedback: "the cube flys when i try to jump". Removed the hold-to-lift branch in `updatePlaying`; gravity now always applies. Updated HUD hint and menu copy.
7. **Tuning pass** — user feedback: "the cube jumps too far and the obstacles are too close together and the blocks are too high". Lowered jump impulse (`JUMP_VEL -720 → -560`) and gravity (`2200 → 1800`) so peak height dropped from ~117px to ~87px. Reduced all blocks from 80-120px tall to 50px, narrowed them from 80px to 60px. Spaced obstacles out to 260-380px between them (was 100-200px) so the player has time to land and re-jump. Reworked all three levels with the new rhythm.
8. **Second tuning pass** — user feedback: "the cube still jumps too far". Lowered `JUMP_VEL` again (`-560 → -460`) and bumped gravity back up (`1800 → 2000`) so peak height is now ~53px. Air time ~0.46s, horizontal travel ~193px. The cube now does a tight hop you can time precisely — single spike or short block is the natural obstacle to clear.
9. **Third tuning pass** — user feedback: "the cube doesent jump high enough". Bumped `JUMP_VEL` back up (`-460 → -560`) and settled gravity at `1900`. Peak height now ~71px, air time ~0.59s, horizontal travel ~247px. Should feel like a moderate, satisfying platformer jump — high enough to clearly clear obstacles, low enough that you can't fly past everything.

## Files

```
one-shot-geometry-dash/
├── index.html              # the entire game
├── README.md
└── tests/
    ├── dash-test.js        # Playwright test suite (35 assertions)
    ├── screenshot-menu.png
    ├── screenshot-level2.png
    ├── screenshot-level3.png
    ├── screenshot-death.png
    └── screenshot-complete.png
```