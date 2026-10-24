import { Game, WORLD, readBest, saveBest } from './game.js';
import { indianStreets } from './themes/indian-streets.js';
import { getViewport } from './viewport.js';
import { birdAppearanceAt } from './themes/bird-appearance.js';

const $ = selector => document.querySelector(selector);
const arcade = $('#arcade');
const canvas = $('#game');
const ctx = canvas.getContext('2d');
const stage = $('#stage');
const screens = { menu: $('#menu-screen'), help: $('#help-screen'), paused: $('#pause-screen'), over: $('#over-screen') };
const theme = indianStreets;
let startingMode = 'day';
let runStartingMode = startingMode;
let weather = 'clear';
let runWeather = weather;
const game = new Game(Math.random, (elapsed, wave) =>
  birdAppearanceAt(theme.lighting(elapsed, runStartingMode).night, wave));
const STEP = 1 / 120;
const format = value => String(value).padStart(2, '0');
let storage;
try { storage = window.localStorage; } catch { /* Storage is optional. */ }
let best = readBest(storage);
let screen = 'menu';
let previous = 0, accumulator = 0, renderTime = 0;
let viewport;
let toastTimer;
$('#best').textContent = format(best);

function resize() {
  viewport = getViewport(stage.clientWidth, stage.clientHeight, window.devicePixelRatio || 1);
  canvas.width = viewport.pixelWidth;
  canvas.height = viewport.pixelHeight;
}
new ResizeObserver(resize).observe(stage);
resize();

function resetClock() { previous = 0; accumulator = 0; }
function showScreen(next, focusSelector) {
  screen = next;
  for (const [name, element] of Object.entries(screens)) element.hidden = name !== next;
  $('#hud').hidden = next === 'menu' || next === 'help';
  $('#pause').hidden = next !== 'playing';
  $('#in-game-hint').hidden = next !== 'playing' || game.elapsed > 3;
  // Hide inactive screens from keyboard navigation as well as pointer input.
  canvas.tabIndex = next === 'playing' ? 0 : -1;
  if (focusSelector) $(focusSelector).focus({ preventScroll: true });
  resetClock();
}
function start() {
  runStartingMode = startingMode;
  runWeather = weather;
  game.reset();
  game.flap();
  $('#score').textContent = format(game.score);
  showScreen('playing', '#game');
  $('#announcer').textContent = 'Flight started. Space or tap to thrust. P or Escape to pause.';
}
function mainMenu() {
  game.reset();
  showScreen('menu', '#play');
  $('#announcer').textContent = 'Main menu.';
}
function pause(automatic = false) {
  if (game.state !== 'playing') return;
  game.pause();
  $('#pause-copy').textContent = automatic ? 'You stepped away. Resume whenever you’re ready.' : 'Your flight is right where you left it.';
  showScreen('paused', automatic ? undefined : '#resume');
  $('#announcer').textContent = 'Flight paused. Choose Resume to continue.';
}
function resume() {
  if (game.state !== 'paused' || document.hidden) return;
  game.resume();
  showScreen('playing', '#game');
  $('#announcer').textContent = 'Flight resumed.';
}
function gameOver() {
  const record = game.score > best;
  if (record) { best = game.score; saveBest(storage, best); }
  $('#best').textContent = format(best);
  $('#final-score').textContent = format(game.score);
  $('#final-best').textContent = format(best);
  $('#over-tag').textContent = record ? 'A NEW PERSONAL BEST' : 'FLIGHT COMPLETE';
  showScreen('over', '#retry');
  $('#announcer').textContent = `Flight complete. Score ${game.score}. Personal best ${best}. Retry or return to the main menu.`;
}

document.querySelectorAll('input[name="starting-mode"]').forEach(input => {
  input.addEventListener('change', () => {
    if (!input.checked || screen !== 'menu') return;
    startingMode = input.value === 'night' ? 'night' : 'day';
    $('#cycle-description').textContent = startingMode === 'night'
      ? 'Night → day → night. The journey keeps going.'
      : 'Day → night → day. The journey keeps going.';
    $('#announcer').textContent = `Start at ${startingMode}. Day and night will cycle throughout your flight.`;
  });
});
document.querySelectorAll('input[name="weather"]').forEach(input => {
  input.addEventListener('change', () => {
    if (!input.checked || screen !== 'menu') return;
    weather = input.value === 'rain' ? 'rain' : 'clear';
    $('#weather-description').textContent = weather === 'rain'
      ? 'Monsoon skies. Same flight, rain or shine.'
      : 'Open skies. The classic Indian Streets flight.';
    $('#announcer').textContent = `${weather === 'rain' ? 'Rainy' : 'Clear'} weather selected. Day and night will continue to cycle.`;
  });
});
$('#play').addEventListener('click', start);
$('#retry').addEventListener('click', start);
$('#how-to-play').addEventListener('click', () => showScreen('help', '#help-back'));
$('#help-back').addEventListener('click', () => showScreen('menu', '#how-to-play'));
$('#pause').addEventListener('click', () => pause());
$('#resume').addEventListener('click', resume);
$('#pause-menu').addEventListener('click', mainMenu);
$('#over-menu').addEventListener('click', mainMenu);
canvas.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0 || screen !== 'playing') return;
  event.preventDefault();
  game.flap();
  canvas.focus({ preventScroll: true });
});
window.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
  if (event.code === 'KeyP' || event.code === 'Escape') {
    if (screen === 'playing') { event.preventDefault(); pause(); }
    else if (screen === 'paused') { event.preventDefault(); resume(); }
    else if (screen === 'help' && event.code === 'Escape') showScreen('menu', '#how-to-play');
    return;
  }
  if (event.code !== 'Space') return;
  // Let focused buttons use native keyboard activation. Space on How to Play,
  // Main Menu, or fullscreen must never also trigger a flight impulse.
  if (event.target.closest?.('button, input, select, textarea, [contenteditable="true"]')) return;
  event.preventDefault();
  if (screen === 'playing') game.flap();
  else if (screen === 'menu' || screen === 'over') start();
  else if (screen === 'paused') resume();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pause(true);
  resetClock();
});
window.addEventListener('blur', () => pause(true));
window.addEventListener('focus', () => {
  resetClock();
  if (screen === 'paused') $('#resume').focus({ preventScroll: true });
});

function fullscreenMessage(message) {
  clearTimeout(toastTimer);
  $('#fullscreen-message').textContent = message;
  $('#fullscreen-message').hidden = false;
  toastTimer = setTimeout(() => { $('#fullscreen-message').hidden = true; }, 4500);
}
$('#fullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (arcade.requestFullscreen && document.fullscreenEnabled !== false) await arcade.requestFullscreen();
    else fullscreenMessage('Fullscreen isn’t available here. You can still play in this window.');
  } catch {
    fullscreenMessage('Fullscreen couldn’t open. You can still play in this window.');
  }
});
document.addEventListener('fullscreenchange', () => {
  const active = document.fullscreenElement === arcade;
  const label = active ? 'Exit fullscreen' : 'Enter fullscreen';
  $('#fullscreen').setAttribute('aria-label', label);
  $('#fullscreen').setAttribute('aria-pressed', String(active));
  $('#fullscreen').title = label;
  resize();
  resetClock();
  if (!active) pause(true);
});

function render() {
  const { scale, extra, x, y } = viewport;
  const preview = game.state === 'ready';
  const lighting = theme.lighting?.(game.elapsed, preview ? startingMode : runStartingMode);
  const scene = theme.weatherScene?.(lighting, preview ? weather : runWeather, preview ? renderTime : game.elapsed) ?? lighting;
  if (scene) scene.viewWidth = Math.min(WORLD.width, (canvas.width - 2 * x) / scale);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#163330';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(scale, 0, 0, scale, x, 0);
  ctx.fillStyle = scene?.skyTop ?? '#f4dcb6';
  ctx.fillRect(0, 0, WORLD.width, WORLD.height + extra);
  ctx.translate(0, y / scale);
  theme.background(ctx, game.distance, scene);
  for (const obstacle of game.obstacles) theme.obstacle(ctx, obstacle, scene);
  const car = game.state === 'ready'
    ? { ...game.car, x: stage.clientWidth > stage.clientHeight ? 650 : game.car.x, y: 235 + Math.sin(renderTime * 2.4) * 7 }
    : game.car;
  theme.car(ctx, car, renderTime, scene);
  // Continue the same decorative road texture through tall portrait screens.
  if (theme.road) theme.road(ctx, game.distance, WORLD.height, extra, scene);
  else {
    ctx.fillStyle = '#657367';
    ctx.fillRect(0, WORLD.height, WORLD.width, extra);
  }
  // A quiet edge marks the ceiling when portrait scaling adds extra sky.
  ctx.strokeStyle = '#71856a55';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(WORLD.width, 0); ctx.stroke();
  theme.weather?.(ctx, scene, { width: scene?.viewWidth ?? WORLD.width, top: -y / scale, height: canvas.height / scale });
}
function frame(timestamp) {
  const dt = previous ? Math.min((timestamp - previous) / 1000, .05) : 0;
  previous = timestamp;
  if (!document.hidden) {
    if (game.state === 'ready' || game.state === 'playing') renderTime += dt;
    if (game.state === 'playing') {
      accumulator += dt;
      while (accumulator >= STEP) {
        game.update(STEP);
        accumulator -= STEP;
        if (game.state === 'over') { gameOver(); break; }
      }
    }
  }
  $('#score').textContent = format(game.score);
  $('#in-game-hint').hidden = screen !== 'playing' || game.elapsed > 3;
  render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
