# Roadster Rush

A lightweight, Flappy Bird-inspired browser game starring a fictional futuristic flying roadster.

## Concept

Pilot a side-view flying sports car through obstacles in a playful **Indian Streets** environment. The car has two visible underside air thrusters. Gravity constantly pulls it down; each **Space** press or screen tap produces a short upward impulse and a brief visual air-thrust effect.

## MVP

- HTML5 Canvas, vanilla JavaScript and CSS (no build step)
- Responsive desktop and mobile controls (Space / tap)
- Gravity, upward impulse, obstacle spawning and collision detection
- Score and local high score
- Start, game-over and restart screens
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

Press **Space**, tap/click the canvas, or use **Let’s fly** to start. Each new press/tap fires both thrusters once; holding Space does not repeat. Fly through the gaps between poles and barricades. Passing an obstacle pair earns one point. Hitting an obstacle, the ground, or the top boundary ends the run. Use Space, tap the canvas, or **Fly again** to restart.

Your personal best is saved in this browser’s local storage when available. Hidden tabs freeze the run. Cows, distant wires, and potholes are scenery; foreground poles and striped barricades are hazards.

### Tests

With Node.js 18 or newer:

```sh
npm test
```

The tests use Node’s built-in test runner and exercise thrust, gravity, bounds, obstacle collisions and generation, scoring, restart, and storage fallbacks.

### Code layout and themes

- `index.html` / `style.css`: responsive page, HUD, and accessible start/restart controls.
- `js/game.js`: browser-independent simulation, collision boxes, rules, and score storage helpers.
- `js/main.js`: input, fixed-step animation loop, canvas sizing, and screen transitions.
- `js/themes/indian-streets.js`: all environment and roadster artwork, drawn with Canvas primitives.
- `tests/game.test.js`: deterministic simulation tests.

A theme exports `name`, `background(ctx, distance)`, `obstacle(ctx, obstacle)`, and `car(ctx, car, time)`. To add an environment, implement that contract in `js/themes/` and select it in `main.js`. Keep obstacle art aligned with the `top`, `bottom`, and `width` collision regions supplied by the simulation. `WORLD` defines the fixed 960 × 540 logical world; rendering scales independently of physics.

### Static deployment

The repository root can be served directly by GitHub Pages: publish from the root of the desired branch in repository settings. All asset paths are relative so project subpaths work. No generated files or build workflow are needed.

## Note

This is an independently made fan-inspired game. It is not affiliated with or endorsed by Tesla.
