# One-Shot Dirtbike Game — Spec

A single-file browser dirtbike game. Pick a map, drop in, ride. Five distinct biomes with terrain that *reads* like the biome, a lime-green bike that's recognisable from across the track, and a menu that makes choosing the next run as fun as the run itself.

**Deliverable:** one `index.html` file. No build step, no external assets, no CDN, no fetch. Pure HTML + inline CSS + inline JS. Runs from `file://` and from a static host. 60 fps target on a mid-range laptop. Deterministic first frame (no flicker, no jumping load bars, no late assets popping in).

---

## 1. Game loop at a glance

1. **Title screen** — game logo, "PLAY" button, "MAPS" button, controls cheat-sheet
2. **Map select** — 5 biome cards in a horizontal carousel; arrow keys / A-D / click to browse; Enter / click to confirm; ESC / back button to return to title
3. **Race** — countdown "3 / 2 / 1 / GO!", ride to the finish line, finish banner with time + restart + change-map
4. **Title** — return to start

A run is a single lap on a closed loop track. No AI riders, no collision traffic. This is a *trail ride*, not a race against opponents. The challenge is the terrain, not the pack.

---

## 2. Maps (5 biomes)

Each biome has its own **terrain generator**, **palette**, **sky**, **ambient audio recipe**, and **prop distribution**. Tracks are not just retextured — they feel different. The same seed produces a similar shape; different seeds produce different shapes. The map card on the select screen shows a procedurally drawn preview thumbnail of that map's actual terrain, not a stock image.

### 2.1 RAINFOREST
- **Sky:** layered greens, light shafts through canopy, soft mist
- **Ground:** deep loam browns and mossy greens, damp
- **Terrain:** rolling hills with **steep root-ramps**, **soft mud patches** (slower grip, visible mud splatter particles), **fallen logs** as mandatory low jumps, dense **fern clusters** as visual dressing
- **Props:** ferns, vines draping from "trees" (cylinder trunk + flat-shaded sphere canopy), bright tropical flowers (red, magenta, yellow) scattered as color punctuation
- **Audio recipe:** low wind hum, distant bird chirps, soft water drip
- **Atmosphere:** dense, slightly dim with bright spots where light shafts fall, fog at distance

### 2.2 DESERT
- **Sky:** hot orange-pink gradient, low sun disc, hard sun glare
- **Ground:** sand yellow → orange → red-orange in layers, rocky patches
- **Terrain:** **massive dunes** (smooth sine-wave hills, big amplitude), **rock outcrops** as solid jump ramps, **dry washes** (depressed bands that you can jump across), **cactus fields** as corridor obstacles
- **Props:** tall saguaro cacti (cylinder + arms), small barrel cacti, red rock formations (low-poly), dry scrub tufts, sun-bleached bones
- **Audio recipe:** howling dry wind, occasional rattle snake hiss
- **Atmosphere:** bright, glaring, heat shimmer on horizon, no fog, long view distance

### 2.3 MUD
- **Sky:** overcast grey-green, low cloud ceiling
- **Ground:** chocolate brown with wet-black patches, deep tire ruts visible
- **Terrain:** **deep mud pits** (visibly darker, slow the bike dramatically, throw mud chunks in a particle burst behind the rear wheel), **rutted straights** (parallel raised lines you can ride between for grip), **sticky bogs** (rear wheel loses traction more, fishtail-y feel)
- **Props:** wooden posts marking the course, tire-track textures, mud clumps, distant dead trees (leafless cylinders)
- **Audio recipe:** thick "squelch" on wheels, splat-on-mud impact, no birdsong
- **Atmosphere:** grey, oppressive, foggy, claustrophobic — short view distance

### 2.4 SNOWY MOUNTAINS
- **Sky:** pale ice blue, low sun, soft white horizon
- **Ground:** powder white on top, blue-grey shadow, exposed dark rock on cliffs
- **Terrain:** **steep climbs** (gradients up to 35°), **icy switchbacks** (low-friction patches, easy to slide out), **snowdrift jumps** (puffy soft ramps), **avalanched sections** (loose-snow rumble visual on slopes), **frozen river crossing** (icy flat — wheel slip if you brake mid-corner)
- **Props:** pine trees (cone-shaped, snow-dusted), grey rock outcrops, small wooden trail markers, distant snow-capped peaks as silhouette
- **Audio recipe:** crisp wind, creaking trees, hollow crunch of snow
- **Atmosphere:** bright but cold, blue tint, far view to mountain horizon

### 2.5 CITY
- **Sky:** dusk — purple-orange gradient, first stars
- **Ground:** dark asphalt with painted lane markings, manhole covers, reflective wet patches
- **Terrain:** **ramps and gaps** (purpose-built stunt course vibe), **quarter-pipes**, **rooftop sections** (start on a rooftop, jump gaps to next rooftop), **parked cars and dumpsters** as obstacles to weave through, **construction barricades** (orange + white striped)
- **Props:** buildings (boxy extruded prisms, lit windows, neon signs), streetlights (cylinders + cone lamps with point-light glow), chain-link fence, billboards, fire escapes
- **Audio recipe:** distant traffic, helicopter pass, electrical buzz from signs
- **Atmosphere:** moody, dark, neon accents, fog at street level

---

## 3. The bike (LIME GREEN — non-negotiable)

The bike must be **immediately readable** as a dirtbike and **immediately recognisable as the player's bike** in any frame. Lime green is the brand.

### 3.1 Geometry
Two-wheel vehicle built from primitives:
- **Frame:** green box body, lime green (`#7CFC00` or close)
- **Tank:** green rounded shape, slightly brighter (`#9EFF1A`)
- **Seat:** black, behind the tank
- **Handlebars:** black, with green grip ends
- **Front forks:** green, with silver stanchions visible
- **Engine block:** silver/grey, under the tank
- **Exhaust pipe:** silver, with a slight glow when on throttle
- **Wheels:** two black knobby tires with green rims, spokes visible
- **Spokes:** thin black lines, 8 per wheel
- **Rider:** humanoid figure — black helmet with a green visor stripe, black jacket, dark pants, gloves, boots

### 3.2 Visual identity
- The bike is **the only lime-green object on screen** by default. Props may have small green accents but nothing competes.
- A subtle **green rim light** on the bike body in low-light maps (snow, dusk) to keep it visible.
- Tires throw **map-coloured particles** when moving (mud → brown chunks, sand → tan dust, snow → white spray, city → none, rainforest → leaf bits)

### 3.3 Physics
- Two-circle wheel collision (front + rear circle, body connects them)
- Suspension: simple spring between body and each wheel, with damping
- Throttle: applies torque to rear wheel
- Brake: applies opposite torque
- Lean: input rotates body around its center (visually), which shifts weight and grip
- Top speed: ~28 m/s in clean terrain, slower in mud/sand
- Wheel radius: ~0.35 m
- Body roughly 1.2 m long, 0.5 m wide

---

## 4. Controls

Keyboard (primary):
- **W / ↑** — throttle
- **S / ↓** — brake / reverse (only when stopped)
- **A / ←** — lean back / pitch up rear
- **D / →** — lean forward / pitch down rear
- **SPACE** — handbrake (rear lock for sharp turns)
- **R** — restart current map
- **M** — back to map select
- **ESC** — pause / back

Touch / on-screen buttons (for mobile / trackpad users):
- Right side: gas pedal (W) and brake (S)
- Left side: lean back (A) and lean forward (D)
- Center bottom: handbrake pill
- Top-right: pause button
- Touch controls are auto-shown on touch devices, hidden on desktop

Gamepad: out of scope for v1. Keyboard only.

---

## 5. Map select screen

- **Title:** "PICK YOUR TRAIL" in big block letters
- **5 cards** in a horizontal row, 3 visible at a time, scrollable
- Each card shows:
  - **Map name** in big text
  - **Procedurally drawn thumbnail** of that map's terrain style (a tiny canvas renders a representative slice — not a static image)
  - **Best time** (if user has run it) or "—" if not
  - **Difficulty stars** (1–5)
- **Hover / focus:** card lifts, gets a green glow, scales 1.05x
- **Click or Enter** to start that map
- **ESC or back button** to return to title
- **Arrow keys / A-D** to move between cards
- Cards have a subtle parallax tilt that follows the mouse

---

## 6. HUD

In-race, top-left to bottom-right:
- **Top-left:** current speed (km/h, big)
- **Top-left under speed:** lap time (mm:ss.ms)
- **Top-right:** mini-map (small top-down representation of track, player dot)
- **Top-right under mini-map:** biome name in small caps
- **Bottom-left:** "R restart · M menu"
- **Bottom-right:** speedometer arc (optional, decorative)
- **Center (countdown only):** big "3" / "2" / "1" / "GO!"

When near the finish line, a thin progress bar appears at the top showing position on track (0% → 100%).

When finished, a centered banner shows:
- "FINISHED!" in big text
- Time (big)
- Best time (smaller, with delta if improved: "−2.31s PB!")
- Buttons: [RETRY] [CHANGE MAP] [TITLE]

---

## 7. Tech choices

- **Render:** Canvas 2D, single context, full-window canvas with internal viewport scaling
- **World scale:** 1 meter = 32 pixels
- **Camera:** third-person chase, behind and above the bike, slight look-ahead, gentle smoothing
- **Loop:** `requestAnimationFrame`, fixed-timestep physics at 120 Hz (sub-stepped inside the rAF tick), variable render
- **RNG:** Mulberry32, seeded per map, seed = map name + start timestamp is OK
- **Terrain:** generated as a list of "chunks" (a few hundred meters of track each), each chunk has a heightmap generated by biome-specific noise (different frequencies, different amplitudes, different roughness for mud/sand vs. ice vs. rock)
- **Track shape:** closed loop generated by a control polygon of 8–14 points, smoothed into a Catmull-Rom curve, banked slightly in turns
- **Props:** instanced — each prop is a single draw routine called N times with a position, scale, and rotation
- **Particles:** object pool, max 200 active, recycled
- **Audio:** Web Audio API, synthesised at runtime. Per-biome ambient bed + per-event SFX (throttle hum, brake skid, mud splat, jump whoosh, finish fanfare). Optional — if Web Audio fails, game still runs, silent.
- **State machine:** `boot → title → map_select → countdown → race → finished → (loop)`
- **No external assets of any kind.** Everything procedural.

---

## 8. Visual quality targets

- The terrain in each biome **must be readable as that biome** at a glance. Sand looks sandy. Mud looks muddy. Snow looks snowy. City looks like a city.
- **Lighting:** simple 3-tone shading per object (lit / mid / shadow) using a single sun direction per biome, plus a fill term. No PBR, no shadows from multiple lights. Adequate for cartoon-realism.
- **Depth:** parallax skybox layers (3 layers per biome), atmospheric perspective (further objects more washed toward sky color).
- **The bike must be visible** in every biome. Lime green is the brand, but the bike also gets a subtle outline glow in dark biomes (city dusk, rainy overcast mud).
- **First frame deterministic:** the map select screen renders the 5 thumbnails synchronously on first paint. The first frame of gameplay shows the bike in the starting position with the correct terrain and palette already loaded — no flash of unstyled content, no late sky swap.

---

## 9. Out of scope (v1)

- No multiplayer
- No save/load of best times (could add via `localStorage` if cheap)
- No bike customization
- No replay system
- No mobile-optimised touch sensitivity tuning beyond "the buttons are big and obvious"
- No procedural audio composition (just synth SFX, not music)
- No AI riders / opponents
- No crash cinematics (respawn at last grounded position)
- No weather transitions within a run

---

## 10. Acceptance tests (must all pass)

1. Page loads from `file://` without errors in console
2. Title screen visible on first frame
3. "MAPS" → map select shows 5 cards
4. All 5 thumbnails render distinct terrain per biome
5. Arrow keys / click navigate the carousel
6. Enter on rainforest starts rainforest run
7. Countdown "3 / 2 / 1 / GO!" plays
8. Bike is lime green
9. Bike can be ridden forward, turned, braked
10. Riding off a steep edge in snow crashes the bike (respawn OK)
11. Mud visibly slows the bike and throws brown particles
12. Sand visibly drifts the bike (loose traction)
13. City map has buildings, neon signs, lit windows
14. Crossing finish line triggers finished banner
15. Time displayed in mm:ss.ms
16. R restarts current map
17. M returns to map select
18. ESC pauses / resumes
19. No frame below 30 fps on a mid-range laptop after 10 seconds of play
20. Zero errors in browser console during a full run of any map

---

## 11. Code structure (one HTML file, sections)

```
<!doctype html>
<html>
  <head>
    <meta>, <title>, <style> (all CSS inline, ~600 lines)
  </head>
  <body>
    <canvas id="game">
    <div id="hud"> (DOM HUD for menus and overlays)
    <div id="touch"> (DOM touch controls, shown on touch only)
    <script> (all JS inline, ~2500-3500 lines, organised as:)
      // === RNG ===
      // === Math utils ===
      // === Input ===
      // === Audio synth ===
      // === Particles ===
      // === Camera ===
      // === Terrain generators (one per biome) ===
      // === Props (per-biome draw routines) ===
      // === Sky / atmosphere per biome ===
      // === Bike (physics + draw) ===
      // === Track (control polygon + sampled centerline) ===
      // === HUD update ===
      // === Map select UI ===
      // === State machine + main loop ===
      // === Boot ===
    </script>
  </body>
</html>
```

Target file size: 80–120 KB. Larger is fine, smaller is not — visual quality is the bar.

---

## 12. Tone

**Easy to pick up, satisfying to master.** The bike should feel alive — the suspension should bob, the wheels should slip a little on loose surfaces, the throttle should make the engine pitch up. The maps should be visually distinct enough that you could tell rainforest from city from a single screenshot. The lime-green bike should be the most readable object in any frame, on any map.
