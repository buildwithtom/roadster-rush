import { Game, WORLD, readBest, saveBest } from './game.js';
import { indianStreets } from './themes/indian-streets.js';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const stage = document.querySelector('#stage');
const overlay = document.querySelector('#overlay');
const play = document.querySelector('#play');
const score = document.querySelector('#score');
const bestLabel = document.querySelector('#best');
const status = document.querySelector('#flight-state');
const hint = document.querySelector('#in-game-hint');
const announcer = document.querySelector('#announcer');
const game = new Game();
const theme = indianStreets;
let storage;
try { storage = window.localStorage; } catch { /* Some browsers disable storage. */ }
let best = readBest(storage);
let previous = 0, accumulator = 0, renderTime = 0;
const STEP = 1 / 120;
const format = value => String(value).padStart(2, '0');
bestLabel.textContent = format(best);

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(stage.clientWidth * dpr);
  canvas.height = Math.round(stage.clientHeight * dpr);
}
new ResizeObserver(resize).observe(stage);
resize();

function action() {
  if (game.state === 'over') game.reset();
  game.flap();
  overlay.hidden = true; hint.hidden = false; status.textContent = 'IN FLIGHT';
  score.textContent = format(game.score);
  canvas.focus({ preventScroll: true });
}
play.addEventListener('click', action);
canvas.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0) return;
  event.preventDefault(); action();
});
window.addEventListener('keydown', event => {
  if (event.code !== 'Space' || event.altKey || event.ctrlKey || event.metaKey) return;
  event.preventDefault();
  if (!event.repeat) action();
});
function gameOver() {
  const record = game.score > best;
  if (record) { best = game.score; saveBest(storage, best); }
  bestLabel.textContent = format(best);
  status.textContent = 'FLIGHT COMPLETE'; hint.hidden = true;
  document.querySelector('#overlay-tag').textContent = record ? 'A NEW PERSONAL BEST' : 'EVERY FLIGHT IS A FRESH START';
  document.querySelector('#overlay-title').textContent = 'One more flight?';
  document.querySelector('#overlay-copy').textContent = `You passed ${game.score} ${game.score === 1 ? 'obstacle' : 'obstacles'}. Personal best: ${best}.`;
  play.innerHTML = 'Fly again <span>↗</span>';
  document.querySelector('#start-hint').textContent = 'PRESS SPACE OR TAP TO RESTART';
  overlay.hidden = false;
  announcer.textContent = `Flight complete. Score ${game.score}. Best ${best}. Press Space or Fly again to restart.`;
  play.focus({ preventScroll: true });
}
// Hidden tabs freeze the run. Returning never introduces a large physics jump.
document.addEventListener('visibilitychange', () => { previous = 0; accumulator = 0; });
function frame(timestamp) {
  const dt = previous ? Math.min((timestamp - previous) / 1000, 0.05) : 0;
  previous = timestamp;
  if (!document.hidden) {
    renderTime += dt; accumulator += dt;
    while (accumulator >= STEP) {
      const state = game.state;
      game.update(STEP);
      if (state === 'playing' && game.state === 'over') gameOver();
      accumulator -= STEP;
    }
  }
  score.textContent = format(game.score);
  hint.hidden = game.state !== 'playing' || game.elapsed > 3;
  // Portrait displays show a closer view of the roadster. Incoming obstacles
  // enter from the right; physics and hitboxes stay in the same logical world.
  const viewWidth = stage.clientWidth <= 600 ? 600 : WORLD.width;
  const scale = canvas.width / viewWidth;
  const extra = Math.max(0, canvas.height / scale - WORLD.height);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.fillStyle = '#f4dcb6'; ctx.fillRect(0, 0, WORLD.width, WORLD.height + extra);
  ctx.translate(0, extra * .5);
  theme.background(ctx, game.distance);
  for (const obstacle of game.obstacles) theme.obstacle(ctx, obstacle);
  const car = game.state === 'ready' ? { ...game.car, y: 235 + Math.sin(renderTime * 2.4) * 7 } : game.car;
  theme.car(ctx, car, renderTime);
  // Carry the road to the bottom of tall screens.
  ctx.fillStyle = '#657367'; ctx.fillRect(0, WORLD.height, WORLD.width, extra);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
