# One-Shot F1 — Arcade Racer

A complete, single-file Formula 1 arcade racing game in pure HTML + CSS + JS. No build, no dependencies, no external assets.

## Run it

Just open `index.html` in a modern browser:

```bash
# Linux
xdg-open index.html

# macOS
open index.html

# Or serve locally (any static server works)
python3 -m http.server 8000
# then visit http://localhost:8000
```

That's it. No `npm install`, no bundler, no asset downloads.

## What you get

- **6 cars** (1 player, 5 AI) on a closed-loop circuit
- **5-light starting sequence** with audio cues and a proper "no movement until lights out" rule
- **Reverse gear** — hold `Shift + S` to back up at up to ~29 km/h; wall damage is suppressed while reversing (you only get pushed back, not chipped) so it's a free way to back out of a wall scrape
- **Pit lane** with pit-limit speed, pit box, damage repair, and rejoin
- **Damage model** (0–100): high damage slows you, ≥80 forces a limp, full repair only via pit
- **5 AI opponents** with distinct paces, random mistakes, and pit logic
- **HUD:** position, lap, lap time, best lap, speed, damage, input pills, assist pills, standings, minimap
- **Difficulty presets:** Rookie (slowest AI, every assist on), Amateur (~95% pace), Pro (~102% pace, tighter) — all keep the player car easy to drive
- **Assists** (on by default per the spec): ABS, Traction Control, Auto-Brake, Steering Assist — all individually toggleable
- **Race flow:** main menu → 5 lights → race → results → restart
- **Sound:** procedural engine tone (modulates with speed/throttle; drops in pitch in reverse), starting-light beeps, GO tone, crash thuds, finish cheer — all WebAudio oscillators
- **60 FPS** target, fixed-timestep physics, deterministic first frame, no console errors
## Controls

- **↑ / W** — throttle
- **↓ / S** — brake
- **Shift + S** (or **Shift + ↓**, **Shift + R**) — reverse (engages when below ~3 m/s; tops out at ~29 km/h)
- **←→ / A D** — steer
- **P** — request pit (when near the start/finish line)
- **Space** — handbrake (optional, for fun)
- **Esc** — pause
- **Touch controls** appear automatically on coarse-pointer devices (mobile) — includes a red **R** button for reverse

## Tuning constants

The tunables live in the top of the `<script>` block (search for `const CFG`):

- `CAR.MASS`, `CAR.ENGINE_FORCE`, `CAR.GRIP_LAT`, `CAR.MAX_STEER` — driving feel
- `TRACK_WIDTH`, `PIT_WIDTH`, `PIT_LIMIT_KMH` — track geometry
- `DAMAGE.*` — damage thresholds and limp behavior
- `AI.MISTAKE_CHANCE`, difficulty presets in `applyDifficulty` — AI behavior
- `LIGHTS.ON_AT_START`, `LIGHTS.STEP` — starting sequence timing

If the cars feel too fast/slow, top speed is `CAR.MASS / drag_coefficient` worth of m/s — bump `ENGINE_FORCE` for more go, or `DRAG` for more top-speed cap.

## Files

- `index.html` — the whole game (~84 KB, single file)
- `test.js` — headless Playwright smoke test (used during development; not required to run)
- `screenshot*.png` — visual references (one per game state: menu, racing, lap, pit)
- `package.json` — `npm install playwright` for running the test

## Known caveats

- The two-row grid is wide enough to clear the first lap, but if the player floors it from a cold start they will still hit the car beside them in the first few seconds. The AI is tuned to match leader speed in traffic; in 2-3 seconds the pack sorts itself out.
- Lap counter requires actually crossing the start/finish line; s=0 must transition from s≈totalLen to s<30 in a single frame. There's no separate "tunnel/loop" detection — if the player misses the line by 30+ meters the lap won't count. (Worth widening the window if you want to be lenient.)
- AI pace varies per car; under "Pro" difficulty the AI can briefly out-pace the player on a clean lap.
