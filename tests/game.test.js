import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, RULES, WORLD, overlaps, readBest, saveBest } from '../js/game.js';
const tick = (game, seconds) => { for (let i = 0; i < seconds * 120; i++) game.update(1 / 120); };

test('ready state is inert; a tap starts a run and each tap resets upward velocity', () => {
  const g = new Game(); const y = g.car.y;
  tick(g, 1); assert.equal(g.car.y, y); assert.equal(g.distance, 0);
  g.flap(); assert.equal(g.state, 'playing'); assert.equal(g.car.velocity, RULES.impulse);
  tick(g, .1); assert.ok(g.car.y < y); assert.ok(g.car.thrust > 0);
  g.flap(); assert.equal(g.car.velocity, RULES.impulse);
});
test('gravity ends an unattended run and game over freezes the simulation', () => {
  const g = new Game(); g.flap(); tick(g, 3);
  assert.equal(g.state, 'over'); const y = g.car.y; tick(g, 1); g.flap(); assert.equal(g.car.y, y);
});
test('ceiling and floor both cause collisions', () => {
  for (const y of [-4, WORLD.floor - 10]) { const g = new Game(); g.flap(); g.car.y = y; g.update(1 / 120); assert.equal(g.state, 'over'); }
});
test('collision catches birds and natural-height vehicles', () => {
  for (const [kind, y] of [['crow', 125], ['bus', 400]]) {
    const g = new Game(); g.flap(); g.car.y = y;
    g.obstacles = [{ x: 240, width: 176, kind, passed: false }];
    g.update(1 / 120); assert.equal(g.state, 'over');
  }
});
test('flying over a vehicle is safe and passing an encounter scores exactly once', () => {
  const g = new Game(); g.flap(); g.car.y = 230; g.car.velocity = 0;
  const o = { x: 240, width: 105, kind: 'rickshaw', passed: false };g.obstacles = [o];
  g.update(1 / 120); assert.equal(g.state, 'playing'); assert.equal(g.score, 0);
  o.x = 100; g.update(1 / 120); assert.equal(g.score, 1);
  g.update(1 / 120); assert.equal(g.score, 1);
});
test('encounters spawn at regular distance intervals', () => {
  const g = new Game();g.flap();g.distance = 499;g.update(1 / 120);
  assert.equal(g.obstacles.length, 1);assert.ok(g.nextObstacle > 939 && g.nextObstacle <= 940);
});
test('restart clears all previous run state', () => {
  const g = new Game();g.flap();g.spawn();g.score = 9;g.distance = 900;g.state = 'over';g.reset();
  assert.equal(g.state, 'ready');assert.equal(g.score, 0);assert.equal(g.distance, 0);assert.equal(g.obstacles.length, 0);g.flap();assert.equal(g.state, 'playing');
});
test('storage persists a best score and tolerates denied access or invalid data', () => {
  const store = new Map();const storage = { getItem: key => store.get(key), setItem: (key, value) => store.set(key, value) };
  saveBest(storage, 12); assert.equal(readBest(storage), 12);
  for (const value of ['NaN', '-2', '1.5', 'Infinity']) { store.set('roadster-rush-best', value);assert.equal(readBest(storage), 0); }
  assert.equal(readBest(undefined), 0);assert.doesNotThrow(() => saveBest(undefined, 5));
});
test('overlap requires intersecting interiors', () => {
  const a = { x: 0, y: 0, width: 10, height: 10 };
  assert.equal(overlaps(a, { ...a, x: 10 }), false);assert.equal(overlaps(a, { ...a, x: 9 }), true);
});

test('a timed tap strategy can fly a complete minute and score across many obstacles', () => {
  const g = new Game(() => .5);g.flap();
  for (let i = 0; i < 120 * 60; i++) {
    const next = g.obstacles.find(o => o.x + o.width > g.car.x);
    const target = next ? next.routeY : 323;
    if (g.car.y > target && g.car.velocity > 0) g.flap();
    g.update(1 / 120);
  }
  assert.equal(g.state, 'playing');assert.ok(g.score >= 30);
});

test('pause freezes car, obstacles, thrust, score and time; resume preserves the run', () => {
  const g = new Game(() => .5);g.flap();g.spawn();tick(g, .1);g.pause();
  assert.equal(g.state, 'paused');
  const snapshot = JSON.stringify(g);
  tick(g, 5);g.flap();g.pause();
  assert.equal(JSON.stringify(g), snapshot);
  g.resume();assert.equal(g.state, 'playing');
  const y = g.car.y;tick(g, .1);assert.notEqual(g.car.y, y);
});
test('pause and resume only operate on an active run', () => {
  const g = new Game();g.pause();g.resume();assert.equal(g.state, 'ready');
  g.flap();tick(g, 3);g.pause();g.resume();assert.equal(g.state, 'over');
  g.reset();g.flap();g.pause();g.reset();assert.equal(g.state, 'ready');assert.equal(g.score, 0);
});
