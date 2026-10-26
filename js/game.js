import { createEncounter, hitsObstacle, difficultyAt } from './obstacles.js';
import { EARTH_FLIGHT } from './physics.js';
import { STANDARD_PLAYFIELD, flightLane } from './playfield.js';

// Pure simulation: a flight profile is selected at reset and stays fixed for
// the run. Scenery, lighting and browser APIs never advance the simulation.
export const WORLD = Object.freeze({ width: 960, height: 540, floor: 474 });
export const RULES = EARTH_FLIGHT;
export function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
export class Game {
  constructor(random = Math.random, birdAppearance = () => 'crow', encounterFactory = createEncounter, rules = RULES) {
    this.random = random; this.birdAppearance = birdAppearance; this.encounterFactory = encounterFactory; this.rules = rules; this.reset();
  }
  reset(rules = this.rules, playfield = STANDARD_PLAYFIELD) {
    this.rules = rules;
    this.playfield = playfield;
    this.state = 'ready'; this.score = 0; this.distance = 0; this.elapsed = 0;
    this.car = { x: 230, y: playfield.startY, width: 78, height: 30, velocity: 0, thrust: 0 };
    this.obstacles = []; this.nextObstacle = 500; this.spawned = 0;
  }
  flap() {
    if (this.state !== 'ready' && this.state !== 'playing') return;
    if (this.state === 'ready') this.state = 'playing';
    this.car.velocity = this.rules.impulse; this.car.thrust = 0.19;
  }
  pause() {
    if (this.state === 'playing') this.state = 'paused';
  }
  resume() {
    if (this.state === 'paused') this.state = 'playing';
  }
  spawn() {
    const difficulty = difficultyAt(this.elapsed);
    const encounter = this.encounterFactory(this.spawned % 4, this.random(), 0, this.spawned + 1);
    this.spawned++;
    this.obstacles.push({ ...encounter, x: WORLD.width + 30, passed: false });
    if (this.spawned % difficulty.birdEvery === 0) {
      const bird = this.encounterFactory(4, this.random(), difficulty.progress);
      bird.flightY = flightLane(bird.flightY, this.playfield, this.spawned, difficulty.progress);
      bird.speed = difficulty.birdSpeed;
      bird.appearance = this.birdAppearance(this.elapsed, this.spawned) === 'bat' ? 'bat' : 'crow';
      this.obstacles.push({ ...bird, x: WORLD.width + 30, passed: false });
      // Occasional late flocks share a predictable lane and leave the same
      // lower escape corridor clear. Never stack birds across the whole sky.
      if (difficulty.flock && this.spawned % 3 === 0) {
        this.obstacles.push({ ...bird, age: .25, x: WORLD.width + 150, passed: false });
      }
    }
  }
  hitbox() { const c = this.car; return { x: c.x + 5, y: c.y + 3, width: c.width - 10, height: c.height - 6 }; }
  update(dt) {
    if (this.state !== 'playing') return;
    const c = this.car;
    this.elapsed += dt; this.distance += this.rules.speed * dt;
    c.velocity += this.rules.gravity * dt; c.y += c.velocity * dt;
    c.thrust = Math.max(0, c.thrust - dt);
    if (this.distance >= this.nextObstacle) { this.spawn(); this.nextObstacle += difficultyAt(this.elapsed).spacing * this.rules.spacingScale; }
    const box = this.hitbox();
    if (box.y <= this.playfield.ceiling || box.y + box.height >= this.playfield.floor) this.state = 'over';
    for (const o of this.obstacles) {
      o.age = (o.age ?? 0) + dt;
      o.x -= (o.speed ?? (o.kind === 'crow' ? 240 : this.rules.speed)) * dt;
      if (hitsObstacle(box, o)) this.state = 'over';
      if (!o.passed && o.x + o.width < box.x && this.state === 'playing') { o.passed = true; this.score++; }
    }
    this.obstacles = this.obstacles.filter(o => o.x + o.width > -20);
  }
}
export function readBest(storage) {
  try { const n = Number(storage.getItem('roadster-rush-best')); return Number.isSafeInteger(n) && n >= 0 ? n : 0; } catch { return 0; }
}
export function saveBest(storage, score) { try { storage.setItem('roadster-rush-best', String(score)); } catch { /* Play still works when storage is unavailable. */ } }
