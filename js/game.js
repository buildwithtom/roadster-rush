// Pure simulation: themes and browser APIs never change the rules of a run.
export const WORLD = Object.freeze({ width: 960, height: 540, floor: 474 });
export const RULES = Object.freeze({ gravity: 920, impulse: -335, speed: 190, gap: 200, spacing: 315, obstacleWidth: 72 });
export function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
export class Game {
  constructor(random = Math.random) { this.random = random; this.reset(); }
  reset() {
    this.state = 'ready'; this.score = 0; this.distance = 0; this.elapsed = 0;
    this.car = { x: 230, y: 230, width: 78, height: 30, velocity: 0, thrust: 0 };
    this.obstacles = []; this.nextObstacle = 500;
  }
  flap() {
    if (this.state === 'over') return;
    if (this.state === 'ready') this.state = 'playing';
    this.car.velocity = RULES.impulse; this.car.thrust = 0.19;
  }
  spawn() {
    const center = 175 + this.random() * 130;
    this.obstacles.push({ x: WORLD.width + 30, width: RULES.obstacleWidth, top: center - RULES.gap / 2, bottom: center + RULES.gap / 2, passed: false });
  }
  hitbox() { const c = this.car; return { x: c.x + 5, y: c.y + 3, width: c.width - 10, height: c.height - 6 }; }
  update(dt) {
    if (this.state !== 'playing') return;
    const c = this.car;
    this.elapsed += dt; this.distance += RULES.speed * dt;
    c.velocity += RULES.gravity * dt; c.y += c.velocity * dt;
    c.thrust = Math.max(0, c.thrust - dt);
    if (this.distance >= this.nextObstacle) { this.spawn(); this.nextObstacle += RULES.spacing; }
    const box = this.hitbox();
    if (box.y <= 0 || box.y + box.height >= WORLD.floor) this.state = 'over';
    for (const o of this.obstacles) {
      o.x -= RULES.speed * dt;
      if (overlaps(box, { x: o.x, y: 0, width: o.width, height: o.top }) || overlaps(box, { x: o.x, y: o.bottom, width: o.width, height: WORLD.floor - o.bottom })) this.state = 'over';
      if (!o.passed && o.x + o.width < box.x && this.state === 'playing') { o.passed = true; this.score++; }
    }
    this.obstacles = this.obstacles.filter(o => o.x + o.width > -20);
  }
}
export function readBest(storage) {
  try { const n = Number(storage.getItem('roadster-rush-best')); return Number.isSafeInteger(n) && n >= 0 ? n : 0; } catch { return 0; }
}
export function saveBest(storage, score) { try { storage.setItem('roadster-rush-best', String(score)); } catch { /* Play still works when storage is unavailable. */ } }
