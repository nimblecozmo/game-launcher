# One-Shot F1 Game Prompt

> **Usage:** Copy the fenced block below into your one-shot code-generation tool. It is self-contained — no prior context needed.

---

## Prompt

Build a complete, single-file, browser-based arcade Formula 1 game in **a single HTML file** (HTML + CSS + JavaScript, all inlined — no build step, no external dependencies, no frameworks, no asset downloads). The game must run by simply opening the `.html` file in a modern browser (Chrome/Firefox/Safari current versions). Use only canvas-based rendering; if any image/sound is needed, generate it procedurally with code (shapes, gradients, oscillators) — do not fetch external files. Use Three.js only via a CDN `<script>` tag if it materially helps 3D, otherwise prefer pure 2D canvas; the 2D route is preferred for "easy to drive."

### Core Requirements

1. **Cars:** Exactly **6 cars** on a closed-loop circuit. The player drives car #1; the other **5 are AI-controlled**.
2. **Starting lights:** A proper F1-style **5-light sequence** (all red → they extinguish one by one with a fixed cadence, e.g. ~1 second apart) must play before the race begins. Cars must not move until the lights are out. A separate "GO" cue (text or sound) signals the start.
3. **AI cars:**
   - Follow the racing line around the track (waypoint system is fine; at least ~30 waypoints around the circuit).
   - Have **distinct, plausible top speeds** and a small per-corner speed variation so they spread out and actually race each other (no lockstep trains).
   - Overtake the player when faster, get overtaken when slower.
   - Make occasional, believable mistakes (a low chance per lap to run a bit wide on a corner) so the race feels alive, not robotic.
   - Pit when their damage crosses a threshold (see damage model below).
4. **Pit lane:** A clearly drawn pit lane runs parallel to the main straight. The player (and AI) can enter it by holding a "pit" input while on the pit-entry segment. While in the pit lane:
   - Speed is limited to pit-limit (e.g. 80 km/h).
   - The car must slow, stop briefly at its pit box (a marker on the pit lane), then rejoin.
   - Pit stop repairs damage and/or refuels (your choice — pick one and stick to it; a fuel/energy model is nice but optional).
5. **Damage model:**
   - Each car has a **damage value** (0–100).
   - Hitting a wall or another car at speed adds damage proportional to impact speed.
   - Damage reduces top speed, increases lap-time variance, and at ≥ 80 damage forces the car to limp back to the pits at severely reduced speed.
   - Damage is repaired only via a pit stop (full reset on a normal stop, partial repair on a "fast stop" if you implement one).
   - Show a visible damage bar in the HUD for every car.
6. **Easy to drive — this is critical.** The player car must feel forgiving and fun from the first input:
   - **High grip, soft defaults, large forgiveness window.** You should be able to hold full throttle through most corners and only need to lift occasionally. A novice should be able to complete a lap without spinning.
   - Assist defaults ON: **ABS, traction control, auto-brake (slows for sharp corners), and steering assist** (small countersteer bias so the car resists snap oversteer). Expose them as toggleable options in a settings panel, but the *default-on* state is mandatory.
   - **No realistic F1 downforce trap.** The car should not require a specific racing line or braking marker to be drivable. Wide cars, soft walls (low restitution), and a forgiving collision push are encouraged.
   - **Three difficulty presets** selectable from the main menu: *Rookie* (most assists, slowest AI), *Amateur* (most assists on, AI ~95% of player pace), *Pro* (assists still on by default but tighter, AI ~102% pace and more aggressive). All three must still be easy to drive.
   - Top-down or near-top-down chase camera — pick one and stick with it. A simple 2D top-down with the track drawn as a thick stroked path is perfectly acceptable and strongly recommended for "easy to drive."

### Controls

- **Arrows or WASD:** accelerate, brake/reverse, steer left/right.
- **P or a dedicated button:** request pit entry on next valid segment.
- **Space:** handbrake (only for fun/spinning out — not required to play well).
- **Esc / P-key toggle:** pause.
- On-screen touch buttons for mobile (optional but a plus).

### Game Flow

- **Main menu:** title, "Race" button, difficulty selector, assist toggles, instructions.
- **Race:** countdown lights → race → finish line detection → result screen with finishing order and lap times.
- **Race length:** a fixed number of laps (default 5, configurable in code). Add a lap counter and total-race-time on the HUD.
- **Restart:** one-click restart from the result screen with the same settings.

### Visual & UX Minimums

- HUD shows: position (P1–P6), lap (current/total), current lap time, best lap, speed (km/h), damage bar, input state (throttle/brake indicators).
- A minimap in a corner showing all 6 cars as dots is **required**.
- Distinct car colors for player + 5 AI (good contrast on the track surface).
- Visible racing line (faint, optional toggle).
- Pit entry / pit exit zones clearly indicated on track and minimap.
- A "PIT" indicator in the HUD when the car is in the pit lane, and a pit limiter indicator (e.g. "PIT LIMIT 80") if speeding.

### Technical Requirements

- **Single `.html` file.** No build, no bundler, no `node_modules`.
- **No external assets.** Procedural graphics and procedural sound (WebAudio oscillators for engine, beep for lights, crash thud on impact) only. CDN scripts for a library are acceptable (e.g. Three.js) but unnecessary for the 2D route.
- **Target 60 FPS** on a modern laptop. Fixed-timestep physics, `requestAnimationFrame` rendering.
- **Deterministic first frame:** no flicker, no jumping loading bar, no uninitialized textures. Track, cars, and HUD must be correct on the very first paint.
- **No console errors** at any point during normal play.
- **No login, no network calls, no analytics.**

### Track

- A single closed-loop circuit, drawn at startup. A simple oval-with-chicane or a hand-authored series of ~30+ waypoints is fine. Track width should be generous (e.g. ~140 units) to keep things easy. Walls/kerbs on the outside; grass/rumble strip visual outside that. Pit lane runs along the main straight on the inside, with a clearly marked pit-entry and pit-exit merge point.

### Out of Scope (do NOT build)

- Multiplayer / online.
- Car setup screens, tire wear modeling, fuel strategy, weather, day/night.
- Replays, photo mode, leaderboards (a local "best lap" memory is fine).
- Mobile-first design (desktop browser is the primary target; mobile is best-effort).

### Definition of Done

The game is considered complete when all of the following are true in a fresh browser session:

1. The file opens with a working main menu — no console errors.
2. Selecting a difficulty and pressing Race starts a 5-light countdown; cars don't move until lights are out.
3. The player car accelerates, steers, brakes, and can complete a lap without spinning under default assists.
4. All 5 AI cars move, follow the racing line, spread out, overtake, and (eventually) pit when damaged.
5. Hitting a wall at speed increases the player's damage bar; high damage visibly hurts speed and forces a limp back to the pits.
6. The player can enter the pit lane with the pit input, is speed-limited, stops at the pit box, and rejoins with damage repaired.
7. Crossing the finish line completes a lap, increments the lap counter, and after the final lap shows a results screen with finishing order.
8. Restart from the results screen works and resets state cleanly.

**Deliverable:** a single file at a path you choose, with clear comments at the top describing controls, assists, and difficulty presets. Briefly explain any non-obvious tuning constants near where they are used.
