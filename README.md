# Roadster Rush

A lightweight, Flappy Bird-inspired browser game starring a fictional futuristic flying roadster.

## Concept

Pilot a side-view flying sports car through obstacles in **Indian Streets** or a stylized **Mars** outpost. The car has two visible underside air thrusters. Gravity constantly pulls it down; each **Space** press or screen tap produces a short upward impulse and a brief visual air-thrust effect.

## MVP

- HTML5 Canvas, vanilla JavaScript and CSS (no build step)
- Responsive desktop and mobile controls (Space / tap)
- Gravity, upward impulse, obstacle spawning and collision detection
- Score and local high score
- Full-window arcade menu, instructions, pause/resume, and game-over screens
- Optional browser fullscreen with a windowed fallback
- Selectable Indian Streets and Mars environments with scenery and hazards drawn in Canvas
- Continuous day/night cycles, Earth rain, and Martian dust weather
- Clean separation between game logic and theme graphics, enabling future themes
- Static deployment on GitHub Pages

## Future ideas

- Futuristic Neon City environment
- Sound effects, animation polish and progressive difficulty

## Development

The first playable version uses native ES modules, Canvas artwork, and CSS. There is no build step, package installation, or runtime dependency.

### Run locally

From the project directory, start any static HTTP server, for example:

```sh
python3 -m http.server 8000
```

Then visit **http://localhost:8000**. If Node.js and Python 3 are installed, `npm run dev` runs the same server. Use HTTP rather than opening `index.html` directly, since browser ES modules require it.

Choose **LET’S FLY** (or press **Space** from the title screen) to start. During a flight, each **Space** press or canvas tap/click fires both thrusters once; holding Space does not repeat. In Indian Streets, fly between natural-sized roadside vehicles and crows at varied sky heights. Indian Streets ground waves contain a rickshaw, cart, cow, or village bus; birds are added above them as the flight progresses. Mars replaces these with exploration rovers, supply pods, boulders, expedition crawlers, occasional landed Starships, and airborne survey drones. Each ground or airborne obstacle passed earns one point. Hitting an obstacle, the ground, or the top boundary ends the run. Choose **ONE MORE RUN** to retry or **Back to title** to return to the menu.

Use the **Pause** button, **P**, or **Escape** to pause. Choose **Resume**, or press P / Escape again, to continue the same flight. Switching tabs or leaving the browser window automatically pauses; returning never resumes the flight automatically. The scene, obstacles, thruster effect, score, and velocity remain frozen until you resume.

The pause screen matches the game-over flight ticket, with a bold **PAUSED** heading, current score, personal best, and selected world. **RESUME FLIGHT** (or P / Escape / Space) continues the same run; **Back to title** ends it and returns to the menu. Automatic pauses explain that you stepped away. The ticket adapts to phone and short landscape screens while keeping the frozen scene behind it.

**How to Play** opens instructions for the selected world. Use the title screen’s **Choose a route** destination controls to switch between **Indian Streets** (default) and **Mars**, with an immediate scenery preview. **Flight setup** opens the Day/Night starting-time and weather choices. Both starting times cycle continuously. Weather offers Clear/Rain in Indian Streets and Clear/Dust on Mars. **Ready to fly** or Escape returns to the title screen without starting a run. Each world remembers its own weather choice while the page stays open. Retry and Main Menu retain the selected world, starting time, and weather; reloading returns to Indian Streets, Day, and Clear.

The game fills the available browser window without page scrolling. Portrait flights use a taller playfield with a larger score panel, a ceiling just below it, and a road strip around 15% of the screen height (bounded to 64–160 CSS pixels). The car sits a quarter of the way across the screen, leaving a clear view ahead. Landscape flights retain the original world and camera. Very wide windows have side margins so the play area is never stretched or cropped vertically. The fullscreen control uses the standard browser Fullscreen API when supported. If fullscreen is unavailable or denied, a short message appears and the game remains playable in the window. Leaving true fullscreen pauses an active flight.

Your personal best is shared across both worlds and saved in this browser’s local storage when available. Natural-sized rickshaws, vegetable carts, resting cows, village buses, and moving crows are hazards. Foreground direction boards and cable structures have been removed. Clouds are decorative. Vehicles and animals sit directly on the road; upper hazards never extend to the screen ceiling. Distant shop props, thin background cables, and potholes remain scenery. A collision ends the flight without harming the animals.

### Arcade title screen

The intro uses a slanted racing-poster wordmark, an enlarged hovering Roadster, pulsing underside thrusters, and a gently scrolling preview of the selected world. It shows your personal best and one main **LET’S FLY** control, with destination names and plain-text links for How to Play, Flight setup, and Fullscreen. Day/night and weather live in the separate setup screen. Destination and scene controls use native radio inputs with keyboard focus; Space on a setting never starts a flight.

Small interface text uses Trebuchet MS with Segoe UI and Arial fallbacks, normal letter spacing, and readable mixed-case labels. The larger Roadster lettering stays in the existing display font. Help and Flight setup share the cream panels and solid yellow controls used by pause and results. Instructions and weather descriptions explain the controls directly; new-best results report the number of points gained. Pause/fullscreen icons and the flying-car favicon are local SVGs. No web fonts or external assets are needed.

The preview draws the existing car and environment artwork without advancing game time, spawning hazards, or changing score. Wide title previews fill the window. Active flights use the portrait or landscape playfield selected when the run starts; all sprites keep their proportions and the selected world’s gravity and thrust. Reduced-motion preferences freeze the title preview and remove hover transitions. Layouts adapt to compact portrait, short landscape, tablet, and desktop windows.

### Results and milestones

The **GAME OVER** screen uses a racing-poster flight ticket with a large final score, personal best, contextual encouragement, and keyboard-focused retry. A strictly higher score earns a **NEW PERSONAL BEST** stamp and a short confetti burst; tying a record does not. The result remains readable after the burst finishes, including when browser storage is unavailable.

Flights celebrate 10, 25, 50, and 100 points once each per run with a brief HUD message. Milestones from 25 points include a small confetti burst clipped to the HUD area. Effects use a separate presentation clock and no gameplay randomness; pausing or hiding the tab freezes them, and retry/menu clears them. Reduced-motion preferences remove confetti while keeping static milestone messages and the personal-best stamp. These rewards do not affect score, hazards, physics, or the day/night and weather clocks.

### Portrait playfield

Portrait adds actual flying space above the original world, with a collision ceiling below the HUD. The ground stays at y=474, so vehicle and animal silhouettes, parked Starships, road art, and their collision geometry remain unchanged. The car starts halfway up the available sky. On portrait, bird/drone groups alternate between middle and low sky, with occasional higher passes. Each group reuses its existing random roll for a little height variation, and later groups have slightly wider variation. The first middle pass crosses the starting altitude, so cruising there requires a dodge. The lowest lane stays capped at y=238, preserving the original low cruise corridor above ground hazards. Desktop lanes are unchanged. Clouds, celestial bodies, stars, and rain clouds are distributed through the taller sky without stretching their shapes. Rain and dust cover the entire camera.

On a 390 × 844 window, the flying area is about 605 CSS pixels tall, below a 112-pixel HUD area and above a 127-pixel road strip. The mobile score panel uses a large current score beside a smaller personal best, with pause and fullscreen controls alongside it; the reserved header and taller road reduce excess empty sky. The portrait camera shows about 508 world units across the screen, giving an 18% closer view than the original 600-unit portrait camera. The car, animals, vehicles, birds, and scenery grow together without stretching sprites or changing their collision shapes. The car stays 25% across the screen. Visible approach time is about 1.60 seconds for ground hazards and 1.12 seconds for the fastest late-game birds. Gravity, impulses, world-space sprite sizes, obstacle speeds, scoring, spawn intervals, and progression remain unchanged.

Each run keeps its playfield through resizes, fullscreen changes, and rotation, so its ceiling, car, and hazards never jump or cause resize collisions. The camera fits those same bounds into the new window; a portrait run rotated into landscape is fitted with side margins. Retry selects fresh bounds for the current orientation, and Main Menu restores the title preview.

### Continuous day and night

With Day selected, a flight holds daylight for 60 active seconds, transitions through sunset for 30 seconds, holds night for 60 seconds, then transitions through dawn for 30 seconds. This 180-second cycle repeats for the entire run. With Night selected, newly spawned flying hazards in Indian Streets start as bats and the same cycle starts halfway round: night for 60 seconds, dawn for 30, day for 60, sunset for 30, then repeat. The sky includes a setting/rising sun, crescent moon, stars, and cooler night scenery. Shops gain warm counters and string bulbs; streetlights illuminate patches of road. Rickshaws, buses, and the roadster gain headlight glows, with illuminated bus windows. Airborne silhouettes gain moonlit coloring and a thin light edge to remain readable. Existing crows can persist briefly into night, and existing bats into daylight, because species never changes mid-flight.

Pausing or leaving the tab freezes the cycle. Retry restarts from the selected Day or Night phase, and Main Menu previews that same selection. The starting-time choice does not alter obstacle progression or personal-best storage. Lighting is decorative: physics, collisions, obstacle progression, and scoring are unchanged.

### Mars environment

Mars is a stylized science-fiction outpost with rust-colored ground, layered ridges and eroded mesas, crater bowls, scattered basalt stones, tyre tracks, solar arrays, habitation domes, antenna dishes, navigation beacons, and distant Starships on launch pads. Night brings a cool sky, stars, two small irregular moons, lit outpost windows, and rover headlights. The same 180-second day/night cycle runs in either world. Clear weather has open skies; Dust adds drifting particles and a light haze without hiding hazards.

Exploration rovers, supply pods, basalt boulders, and long expedition crawlers occupy the ground. Survey drones use the existing predictable airborne lanes during both day and night. The new hazards have their own shared rendering/collision geometry, including clear spaces around sloped rocks and between drone parts. Ordinary encounters retain their existing widths, speeds, random draws, scoring, and safe cruise corridor. Mars uses 38% of the Indian Streets gravity (349.6 versus 920 world units/second²), with a softer upward impulse (about -206.5 versus -335). This keeps a single thrust’s lift height close to the original while extending its rise/fall time by about 62%. Use slower, spaced taps to find the new rhythm. Ground waves are 30% farther apart (572 to 390 world units over the difficulty ramp); the first encounter retains its original starting distance. Drone progression and scenery speed are unchanged.

A stylized landed Starship replaces the crawler on every eighth ground wave (8, 16, 24, and so on). It has a silver ringed hull, pointed nose, dark heat-shield face, forward/aft flaps, and landing feet. The 72-unit-wide silhouette shares its solids with collision detection; the nose starts at y=356, preserving the entire y=258–355 cruise corridor. Nose and fin corners remain clear instead of using a rectangular hitbox. Ships use the existing ground speed and score one point, with no extra wave or random draw. Retry restarts the schedule. Larger, muted ships and launch towers move with background parallax and are scenery.

Dust, lights, and drone motion follow active simulation time, so pause and game over freeze them. Retry starts the same selected world from time zero. Scenery and terrain extend through tall portrait viewports. The complete game remains dependency-free and can be served directly from GitHub Pages.

### Player car

The player car is a small, stylized interpretation of the newly revealed Tesla Roadster, using its white wedge body, bronze/gold canopy, faceted panels, dark spoke wheels, thin lamps, and rear aero lip as visual references ([Tesla design details](https://www.tesla.com/roadster?redirect=no), [reveal photo gallery](https://www.autoexpress.co.uk/tesla/roadster/370689/new-tesla-roadster-revealed-2026-pictures)). It is drawn entirely with Canvas primitives; reference photographs are not shipped with the game. Two underside nozzles retain the impulse-driven air bursts. The car’s appearance, tilt behavior, air-burst duration, dimensions, and hitbox are shared across both worlds. Its flight profile follows the chosen world, and the white body remains visible in day, night, rain, and dust.

### Rain weather

Rain brings cool overcast skies, drifting monsoon clouds, layered slanted rainfall, a darker wet road, puddles with expanding ripples, and broken warm streetlamp reflections. Shop bulbs, streetlights, and vehicle headlights turn on during rainy daylight and become brighter at night. The original worn road and village artwork remain visible. Rain fills the extra sky and road on portrait screens, with a bounded particle count.

Rain is visual: car physics, collision shapes, bird species, obstacle frequency, scoring, and personal-best storage stay the same. The menu preview animates; during a flight, rain, clouds, reflections, and ripples follow active simulation time. Pause, tab switching, and game over freeze them, and Retry restarts the weather clock. There are no lightning flashes or added runtime dependencies.

### Tests

With Node.js 18 or newer:

```sh
npm test
```

The tests use Node’s built-in test runner and exercise thrust, gravity, bounds, obstacle collisions and generation, scoring, restart, storage fallbacks, pause/resume, portrait/landscape viewport bounds, day/night cycles, bird appearance, deterministic rainfall, weather composition, pause/retry weather timing, theme-specific encounters, Martian collision geometry, three-minute Mars navigability, lower-gravity flight arcs, wave spacing, restoring Earth physics after switching worlds, Starship spawn frequency, shape-aware Starship collisions, milestone crossings/reset, personal-best eligibility, bounded deterministic celebration drawing, expanded portrait ceiling collisions, mobile approach distance and uniform zoom, alternating early bird lanes, unchanged RNG draws and spawn frequency, and three-minute portrait navigability in both worlds.

### Code layout and themes

- `index.html` / `style.css`: full-window arcade screens, minimal HUD, and keyboard-accessible controls.
- `intro.css`: racing-poster title screen, destination controls, start paddle, and flight-setup layout.
- `rewards.css`: flight-result ticket and responsive milestone presentation.
- `js/rewards.js`: simulation-independent milestone tracking, result encouragement, and confetti rendering.
- `js/game.js`: browser-independent simulation, collision boxes, per-run flight rules, and score storage helpers.
- `js/physics.js`: immutable Earth and Mars gravity, thrust, and wave-spacing profiles.
- `js/main.js`: input, fixed-step animation loop, canvas sizing, and screen transitions.
- `js/viewport.js`: aspect-aware camera scaling and portrait floor anchoring.
- `js/playfield.js`: per-run portrait boundaries, safe airborne lanes, and sky layout helpers.
- `js/themes/index.js`: environment registry and a safe Indian Streets fallback.
- `js/themes/mars.js`: Martian scenery, lighting, ground, dust, encounter factory, and theme metadata.
- `js/mars-obstacles.js` / `js/themes/mars-obstacle-art.js`: shared Martian solid geometry and its rendering details.
- `js/themes/starship-art.js`: shared landed-ship artwork for solid hazards and distant launch sites.
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

Difficulty depends on active flight time and resets on retry. The following spacing values are for Indian Streets; Mars multiplies wave spacing by 1.3:

- Ground-wave spacing decreases smoothly from 440 to 300 world units over 90 seconds.
- Birds accompany every third ground wave initially, every second wave after 30 seconds, and every wave after 60 seconds.
- Bird speed increases from 240 to 270 world units/second for newly spawned birds.
- Bird base heights range from y=110–166 initially, expanding to y=110–238 at the difficulty cap.
- After 75 seconds, every third ground wave has a pair of birds in the same lane, staggered horizontally. Groups never span the entire escape corridor.
- Difficulty stops increasing after 90 seconds; existing obstacles keep their original speed and lane.

The rickshaw uses a rounded fabric canopy, open passenger doorway, low boarding step, separate driver seat, sloping windscreen, rounded yellow front cowl, green rear body, front mudguard, and two visible wheels in side profile. Its 105-unit encounter width, roof height, road contact, speed, and scoring boundaries are retained. The revised canopy, body, glass, seats, step, and wheels share their solid geometry with collision detection; trim is clipped to those solids so the doorway and sloped corners stay open. Headlights and tail lights remain active at night and in rain. The shape was informed by [Bajaj’s RE brochure](https://www.bajajauto.com/en-bd/-/media/globalbajajauto/common-media/brochure/3wheelers/bajaj-re-4s-lpg-without-door-brochure.pdf); no reference photos or logos are shipped.

Tea steam moves with scene distance and stays frozen while paused.

A theme exports `name`, `background(ctx, distance)`, `obstacle(ctx, obstacle)`, and `car(ctx, car, time)`. Themes may expose `lighting(elapsed, startingMode)` to produce optional visual scene data, passed to `background` and `obstacle` as a third argument and `car` as a fourth argument. Optional `weatherScene(scene, weather, seconds)` and `weather(ctx, scene, bounds)` hooks compose weather with lighting and draw across the complete viewport; `bounds` includes `width`, `top`, and `height` in logical coordinates. An optional `road(ctx, distance, top, height, scene)` continues ground artwork below the logical world on tall screens. Selectable themes also provide `id`, `weatherModes`, and theme-specific `help` text, and are registered in `js/themes/index.js` and the destination radio controls in `index.html`. An optional `physics` profile is selected by `Game.reset(profile)` at the start of each flight; Retry retains the selected profile and switching to a theme without one explicitly restores the Earth defaults. An optional `createEncounter(index, roll, progress, wave)` factory supplies theme-tagged encounters to the simulation. Ground encounters receive their one-based wave number for deterministic variants. Their shared solid shapes must be dispatched by `obstacleShape()`. Without a factory, the standard Indian Streets encounters are used. To add an environment, implement those hooks and register it; keep art choices out of the simulation rules. Keep obstacle art aligned with the shared solid parts from `obstacleShape()`. Encounter widths define scoring and removal boundaries. Templates provide a verified cruise corridor from y=258 to y=355, wide enough for a complete thrust arc and the car’s hitbox; players can also take other clear routes. `WORLD` defines the base 960 × 540 logical world. `Game.reset(profile, playfield)` can extend its ceiling for portrait; the road level and sprite geometry stay fixed, and rendering scales independently of physics.

### Static deployment

The repository root can be served directly by GitHub Pages: publish from the root of the desired branch in repository settings. All asset paths are relative so project subpaths work. No generated files or build workflow are needed.

## Note

This is an independently made fan-inspired game. It is not affiliated with or endorsed by Tesla.
