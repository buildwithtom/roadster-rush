# Roadster Rush

A lightweight, Flappy Bird-inspired browser game starring a fictional futuristic flying roadster.

## Concept

Pilot a side-view flying sports car through obstacles in a playful **Indian Streets** environment. The car has two visible underside air thrusters. Gravity constantly pulls it down; each **Space** press or screen tap produces a short upward impulse and a brief visual air-thrust effect.

## MVP

- HTML5 Canvas, vanilla JavaScript and CSS (no build step)
- Responsive desktop and mobile controls (Space / tap)
- Gravity, upward impulse, obstacle spawning and collision detection
- Score and local high score
- Full-window arcade menu, instructions, pause/resume, and game-over screens
- Optional browser fullscreen with a windowed fallback
- Indian Streets theme with recognizable stylized scenery and obstacles (e.g. electric poles, hanging wires, cows, road barricades and potholes)
- Clean separation between game logic and theme graphics, enabling future themes
- Static deployment on GitHub Pages

## Future ideas

- Futuristic Neon City theme with an in-game theme switcher
- Sound effects, animation polish and progressive difficulty

## Development

The first playable version uses native ES modules, Canvas artwork, and CSS. There is no build step, package installation, or runtime dependency.

### Run locally

From the project directory, start any static HTTP server, for example:

```sh
python3 -m http.server 8000
```

Then visit **http://localhost:8000**. If Node.js and Python 3 are installed, `npm run dev` runs the same server. Use HTTP rather than opening `index.html` directly, since browser ES modules require it.

Choose **Play** (or press **Space** from the menu) to start. During a flight, each **Space** press or canvas tap/click fires both thrusters once; holding Space does not repeat. Fly between natural-sized roadside vehicles and crows at varied sky heights. Ground waves always contain a rickshaw, cart, cow, or village bus; birds are added above them as the flight progresses. Each ground obstacle or bird passed earns one point. Hitting an obstacle, the ground, or the top boundary ends the run. Choose **Retry** to fly again or **Main Menu** to return to the menu.

Use the **Pause** button, **P**, or **Escape** to pause. Choose **Resume**, or press P / Escape again, to continue the same flight. Switching tabs or leaving the browser window automatically pauses; returning never resumes the flight automatically. The scene, obstacles, thruster effect, score, and velocity remain frozen until you resume.

**How to Play** opens instructions. The main menu’s **Start your journey** selector chooses Day (the default) or Night and previews it immediately. This is a starting time, not a fixed atmosphere: both choices cycle continuously. Indian Streets remains the active environment. The selection is retained for Retry and Main Menu during the current page session; reloading defaults to Day. The separate **Weather** selector offers **Clear** (default) or **Rain**, with an immediate scene preview. Either weather works with either starting time, and the day–night cycle continues during rain. Weather is retained for Retry and Main Menu in the current session; reload resets it to Clear.

The game fills the available browser window without page scrolling. Portrait displays use a closer horizontal camera; landscape displays fit the complete logical world vertically. Very wide windows have side margins so the play area is never stretched or cropped vertically. The fullscreen control uses the standard browser Fullscreen API when supported. If fullscreen is unavailable or denied, a short message appears and the game remains playable in the window. Leaving true fullscreen pauses an active flight.

Your personal best is saved in this browser’s local storage when available. Natural-sized rickshaws, vegetable carts, resting cows, village buses, and moving crows are hazards. Foreground direction boards and cable structures have been removed. Clouds are decorative. Vehicles and animals sit directly on the road; upper hazards never extend to the screen ceiling. Distant shop props, thin background cables, and potholes remain scenery. A collision ends the flight without harming the animals.

### Continuous day and night

With Day selected, a flight holds daylight for 60 active seconds, transitions through sunset for 30 seconds, holds night for 60 seconds, then transitions through dawn for 30 seconds. This 180-second cycle repeats for the entire run. With Night selected, newly spawned flying hazards start as bats and the same cycle starts halfway round: night for 60 seconds, dawn for 30, day for 60, sunset for 30, then repeat. The sky includes a setting/rising sun, crescent moon, stars, and cooler night scenery. Shops gain warm counters and string bulbs; streetlights illuminate patches of road. Rickshaws, buses, and the roadster gain headlight glows, with illuminated bus windows. Airborne silhouettes gain moonlit coloring and a thin light edge to remain readable. Existing crows can persist briefly into night, and existing bats into daylight, because species never changes mid-flight.

Pausing or leaving the tab freezes the cycle. Retry restarts from the selected Day or Night phase, and Main Menu previews that same selection. The starting-time choice does not alter obstacle progression or personal-best storage. Lighting is decorative: physics, collisions, obstacle progression, and scoring are unchanged.

### Player car

The player car is a small, stylized interpretation of the newly revealed Tesla Roadster, using its white wedge body, bronze/gold canopy, faceted panels, dark spoke wheels, thin lamps, and rear aero lip as visual references ([Tesla design details](https://www.tesla.com/roadster?redirect=no), [reveal photo gallery](https://www.autoexpress.co.uk/tesla/roadster/370689/new-tesla-roadster-revealed-2026-pictures)). It is drawn entirely with Canvas primitives; reference photographs are not shipped with the game. Two underside nozzles retain the impulse-driven air bursts. Tilt, thrust timing, dimensions, hitbox, and physics are unchanged, and the white body remains visible in day, night, and rain.

### Rain weather

Rain brings cool overcast skies, drifting monsoon clouds, layered slanted rainfall, a darker wet road, puddles with expanding ripples, and broken warm streetlamp reflections. Shop bulbs, streetlights, and vehicle headlights turn on during rainy daylight and become brighter at night. The original worn road and village artwork remain visible. Rain fills the extra sky and road on portrait screens, with a bounded particle count.

Rain is visual: car physics, collision shapes, bird species, obstacle frequency, scoring, and personal-best storage stay the same. The menu preview animates; during a flight, rain, clouds, reflections, and ripples follow active simulation time. Pause, tab switching, and game over freeze them, and Retry restarts the weather clock. There are no lightning flashes or added runtime dependencies.

### Tests

With Node.js 18 or newer:

```sh
npm test
```

The tests use Node’s built-in test runner and exercise thrust, gravity, bounds, obstacle collisions and generation, scoring, restart, storage fallbacks, pause/resume, portrait/landscape viewport bounds, day/night cycles, bird appearance, deterministic rainfall, weather composition, and pause/retry weather timing.

### Code layout and themes

- `index.html` / `style.css`: full-window arcade screens, minimal HUD, and keyboard-accessible controls.
- `js/game.js`: browser-independent simulation, collision boxes, rules, and score storage helpers.
- `js/main.js`: input, fixed-step animation loop, canvas sizing, and screen transitions.
- `js/viewport.js`: aspect-aware camera scaling independent of the game simulation.
- `js/themes/indian-streets.js`: theme composition, sky, and celestial artwork drawn with Canvas primitives.
- `js/themes/roadster-art.js`: reusable player-car artwork, wheel details, underside thrusters, and headlight effects.
- `js/obstacles.js`: shared rectangle, ellipse, and convex-polygon silhouettes; fixed-size roadside encounter templates and shape-aware collisions.
- `js/themes/obstacle-art.js`: side-view rickshaws, village buses, carts, rounded resting cows, and animated crows.
- `js/themes/bird-appearance.js`: deterministic spawn-time crow/bat selection from the current night-light level.
- `js/themes/lighting.js`: visual state derived from flight time, color interpolation, glow helpers, and road tinting.
- `js/themes/weather.js`: independent weather composition, seeded rainfall, monsoon clouds, wet-road puddles, ripples, and lamp reflections.
- `js/themes/road-art.js`: worn asphalt, potholes, repair patches, gravel, and ragged road edges, including the portrait extension.
- `js/themes/street-art.js`: reusable chai, workshop, bakery, vegetable, kirana, snack-cart, and hardware shopfronts; seeded block layouts, distant skyline, and decorative street props.
- `tests/game.test.js` / `tests/viewport.test.js`: simulation, progression, shape collision, and viewport tests.

Indian Streets uses muted distant buildings, varied sun-faded shopfronts, and a decorative street-edge layer. Shop order, widths, paint, balconies, and props vary deterministically by world block, keeping parallax continuous without per-frame randomness. The small-town roadside has low patched sheds, owner-named signs, dusty setbacks, broken drain crossings, and irregular dirt shoulders instead of a continuous paved footpath. Kettles, produce crates, bread trays, sachets, tools, tyres, scooters, background cables, and potholes are decorative; the collision floor remains unchanged. Foreground encounters share their painted silhouettes with collision detection, leaving curved corners and open spaces free of invisible rectangular collisions. Airborne hazards are crows by day and bats at night. New spawns gradually mix the two during sunset and dawn; each keeps its assigned appearance until it leaves the screen. Bats use a broad two-wing silhouette, deep scalloped membranes, a compact face, prominent ears, and darker moonlit coloring. Their horizontal size matches the crows, and the revised shape stays inside the same safe-flight corridor throughout each flap. Collision shapes follow the visible membrane cutouts. Species selection adds no random draws and does not change flight paths, speed, frequency, scoring, or the safe corridor. Their wing silhouettes drive both drawing and collision; pausing freezes their position and pose. Bird height and speed are fixed at spawn, with only a gentle vertical bob, so they never dive unpredictably or accelerate mid-approach. Gravity, upward impulse, and scenery speed are unchanged.

Difficulty depends on active flight time and resets on retry:

- Ground-wave spacing decreases smoothly from 440 to 300 world units over 90 seconds.
- Birds accompany every third ground wave initially, every second wave after 30 seconds, and every wave after 60 seconds.
- Bird speed increases from 240 to 270 world units/second for newly spawned birds.
- Bird base heights range from y=110–166 initially, expanding to y=110–238 at the difficulty cap.
- After 75 seconds, every third ground wave has a pair of birds in the same lane, staggered horizontally. Groups never span the entire escape corridor.
- Difficulty stops increasing after 90 seconds; existing obstacles keep their original speed and lane.

Tea steam moves with scene distance and stays frozen while paused.

A theme exports `name`, `background(ctx, distance)`, `obstacle(ctx, obstacle)`, and `car(ctx, car, time)`. Themes may expose `lighting(elapsed, startingMode)` to produce optional visual scene data, passed to `background` and `obstacle` as a third argument and `car` as a fourth argument. Optional `weatherScene(scene, weather, seconds)` and `weather(ctx, scene, bounds)` hooks compose weather with lighting and draw across the complete viewport; `bounds` includes `width`, `top`, and `height` in logical coordinates. An optional `road(ctx, distance, top, height, scene)` continues ground artwork below the logical world on tall screens. To add an environment, implement that contract in `js/themes/` and select it in `main.js`. Keep obstacle art aligned with the shared solid parts from `obstacleShape()`. Encounter widths define scoring and removal boundaries. Templates provide a verified cruise corridor from y=258 to y=355, wide enough for a complete thrust arc and the car’s hitbox; players can also take other clear routes. `WORLD` defines the fixed 960 × 540 logical world; rendering scales independently of physics.

### Static deployment

The repository root can be served directly by GitHub Pages: publish from the root of the desired branch in repository settings. All asset paths are relative so project subpaths work. No generated files or build workflow are needed.

## Note

This is an independently made fan-inspired game. It is not affiliated with or endorsed by Tesla.
