import { Game, WORLD, RULES, readBest, saveBest } from './game.js';
import { getTheme } from './themes/index.js';
import { createEncounter } from './obstacles.js';
import { getViewport } from './viewport.js';
import { birdAppearanceAt } from './themes/bird-appearance.js';
import { RunRewards, drawCelebration } from './rewards.js';
import { createPlayfield, PORTRAIT_CAMERA } from './playfield.js';

const $ = selector => document.querySelector(selector);
const arcade = $('#arcade');
const canvas = $('#game');
const ctx = canvas.getContext('2d');
const celebrationCanvas = $('#celebration-canvas');
const celebrationCtx = celebrationCanvas.getContext('2d');
const rewards = new RunRewards();
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const stage = $('#stage');
const screens = { menu: $('#menu-screen'), setup: $('#setup-screen'), help: $('#help-screen'), paused: $('#pause-screen'), over: $('#over-screen') };
let theme = getTheme('indian-streets');
let runTheme = theme;
const weatherByTheme = new Map();
let startingMode = 'day';
let runStartingMode = startingMode;
let weather = 'clear';
let runWeather = weather;
const game = new Game(Math.random, (elapsed, wave) =>
  birdAppearanceAt(runTheme.lighting(elapsed, runStartingMode).night, wave),
  (...args) => (runTheme.createEncounter ?? createEncounter)(...args));
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
$('#menu-best').textContent = format(best);
arcade.dataset.screen = screen;
canvas.tabIndex = -1;

function hudInset() {
  const top = stage.getBoundingClientRect().top;
  const minimum = stage.clientWidth < stage.clientHeight ? PORTRAIT_CAMERA.hudInset : 72;
  return Math.max(minimum, ...[$('#hud'), $('#fullscreen')].filter(element => !element.hidden)
    .map(element => element.getBoundingClientRect().bottom - top + 12));
}
function resize() {
  viewport = getViewport(stage.clientWidth, stage.clientHeight, window.devicePixelRatio || 1,
    game.state === 'ready' ? undefined : game.playfield, game.state === 'ready' ? 72 : hudInset());
  canvas.width = viewport.pixelWidth;
  canvas.height = viewport.pixelHeight;
  celebrationCanvas.width = viewport.pixelWidth;
  celebrationCanvas.height = viewport.pixelHeight;
}
new ResizeObserver(resize).observe(stage);
resize();

function resetClock() { previous = 0; accumulator = 0; }
function clearCelebration() {
  celebrationCtx.setTransform(1, 0, 0, 1, 0, 0);
  celebrationCtx.clearRect(0, 0, celebrationCanvas.width, celebrationCanvas.height);
}
function showScreen(next, focusSelector) {
  screen = next;
  arcade.dataset.screen = next;
  for (const [name, element] of Object.entries(screens)) element.hidden = name !== next;
  $('#hud').hidden = ['menu', 'setup', 'help', 'paused', 'over'].includes(next);
  $('#pause').hidden = next !== 'playing';
  $('#in-game-hint').hidden = next !== 'playing' || game.elapsed > 3;
  $('#milestone').hidden = next !== 'playing' || !rewards.notice;
  clearCelebration();
  // Hide inactive screens from keyboard navigation as well as pointer input.
  canvas.tabIndex = next === 'playing' ? 0 : -1;
  if (focusSelector) $(focusSelector).focus({ preventScroll: true });
  resetClock();
}
function start() {
  runTheme = theme;
  runStartingMode = startingMode;
  runWeather = weather;
  showScreen('playing', '#game');
  game.reset(runTheme.physics ?? RULES, createPlayfield(stage.clientWidth, stage.clientHeight, hudInset()));
  rewards.reset();
  game.flap();
  $('#score').textContent = format(game.score);
  resize();
  $('#announcer').textContent = `${runTheme.name} flight started. Space or tap to thrust. P or Escape to pause.`;
}
function mainMenu() {
  game.reset();
  rewards.reset();
  showScreen('menu', '#play');
  resize();
  $('#announcer').textContent = 'Main menu.';
}
function pause(automatic = false) {
  if (game.state !== 'playing') return;
  game.pause();
  $('#pause-score').textContent = format(game.score);
  $('#pause-best').textContent = format(best);
  $('#pause-world').textContent = runTheme.name;
  $('#pause-copy').textContent = automatic ? 'Paused while you were away. Resume when you’re ready.' : 'Ready when you are.';
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
  const { record, message } = rewards.finish(game.score, best);
  if (record) { best = game.score; saveBest(storage, best); }
  $('#best').textContent = format(best);
  $('#menu-best').textContent = format(best);
  $('#final-score').textContent = format(game.score);
  $('#final-best').textContent = format(best);
  $('#over-tag').hidden = !record;
  $('#over-message').textContent = message;
  $('#over-world').textContent = runTheme.name;
  screens.over.classList.toggle('is-record', record);
  showScreen('over', '#retry');
  $('#announcer').textContent = `Game over. Score ${game.score}. Personal best ${best}. ${record ? 'New personal best! ' : ''}${message} Choose One more run or Main Menu.`;
}

function updateModeSummary() {
  const mode = theme.weatherModes.find(mode => mode.value === weather);
  $('#weather-description').textContent = mode.description;
  $('#mode-summary').textContent = `${startingMode === 'night' ? 'Night' : 'Day'} · ${mode.label}`;
}
function updateThemeMenu() {
  arcade.dataset.theme = theme.id;
  document.querySelectorAll('input[name="environment"]').forEach(input => { input.checked = input.value === theme.id; });
  $('#start-tagline').textContent = theme.id === 'mars' ? 'Less gravity. More trouble.' : 'Bad roads. Great airtime.';
  document.title = `Roadster Rush — ${theme.name}`;
  $('#help-hazards').textContent = theme.help;
  $('#help-dodge').textContent = theme.id === 'mars' ? 'Dodge the outpost' : 'Dodge the traffic';
  $('#help-lift').textContent = theme.liftHelp ?? 'Space or tap fires the thrusters. The car falls between taps.';
  $('#in-game-hint').textContent = theme.flightHint ?? 'Space or tap to thrust';
  document.querySelectorAll('input[name="weather"]').forEach((input, index) => {
    const mode = theme.weatherModes[index];
    input.value = mode.value;
    input.checked = mode.value === weather;
    input.closest('label').querySelector('.weather-name').textContent = mode.label;
  });
  updateModeSummary();
}
document.querySelectorAll('input[name="environment"]').forEach(input => input.addEventListener('change', () => {
  if (screen !== 'menu' || !input.checked) return;
  weatherByTheme.set(theme.id, weather);
  theme = getTheme(input.value);
  weather = weatherByTheme.get(theme.id) ?? 'clear';
  updateThemeMenu();
  $('#announcer').textContent = `${theme.name} selected. Choose Play to fly.`;
}));
document.querySelectorAll('input[name="starting-mode"]').forEach(input => {
  input.addEventListener('change', () => {
    if (!input.checked || screen !== 'setup') return;
    startingMode = input.value === 'night' ? 'night' : 'day';
    $('#cycle-description').textContent = startingMode === 'night'
      ? 'Start at night. Daylight follows as you fly.'
      : 'Start in daylight. Night follows as you fly.';
    updateModeSummary();
    $('#announcer').textContent = `Start at ${startingMode}. Day and night will cycle throughout your flight.`;
  });
});
document.querySelectorAll('input[name="weather"]').forEach(input => {
  input.addEventListener('change', () => {
    if (!input.checked || screen !== 'setup') return;
    weather = input.value;
    updateModeSummary();
    const mode = theme.weatherModes.find(mode => mode.value === weather);
    $('#announcer').textContent = `${mode.label} weather selected. Day and night will continue to cycle.`;
  });
});
$('#play').addEventListener('click', start);
$('#retry').addEventListener('click', start);
$('#how-to-play').addEventListener('click', () => showScreen('help', '#help-back'));
$('#help-back').addEventListener('click', () => showScreen('menu', '#how-to-play'));
$('#flight-setup').addEventListener('click', () => showScreen('setup', 'input[name="starting-mode"]:checked'));
$('#setup-back').addEventListener('click', () => showScreen('menu', '#flight-setup'));
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
    else if (screen === 'setup' && event.code === 'Escape') showScreen('menu', '#flight-setup');
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
  $('#fullscreen .fullscreen-label').textContent = active ? 'Exit fullscreen' : 'Fullscreen';
  resize();
  resetClock();
  if (!active) pause(true);
});

function render() {
  const preview = game.state === 'ready';
  let { scale, extra, x, y } = viewport;
  // The title scene covers wide windows; active play fits the run's own
  // boundaries, keeping the complete ceiling-to-road corridor visible.
  if (preview && stage.clientWidth >= stage.clientHeight) {
    scale = canvas.width / WORLD.width; x = 0;
    extra = Math.max(0, canvas.height / scale - WORLD.height);
    y = canvas.height < WORLD.height * scale ? canvas.height - WORLD.height * scale : extra * .5 * scale;
  }
  const previewTime = reducedMotion.matches ? 0 : renderTime;
  const lighting = theme.lighting?.(game.elapsed, preview ? startingMode : runStartingMode);
  const scene = theme.weatherScene?.(lighting, preview ? weather : runWeather, preview ? previewTime : game.elapsed) ?? lighting;
  if (scene) {
    scene.viewLeft = viewport.viewLeft ?? 0;
    scene.viewWidth = viewport.viewWidth ?? Math.min(WORLD.width, (canvas.width - 2 * x) / scale);
    scene.ceiling = preview ? 0 : game.playfield.ceiling;
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = theme.frameColor ?? '#163330';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(scale, 0, 0, scale, x, 0);
  ctx.fillStyle = scene?.skyTop ?? '#f4dcb6';
  ctx.fillRect(0, 0, WORLD.width, WORLD.height + extra);
  ctx.translate(0, y / scale);
  const distance = preview ? previewTime * 18 : game.distance;
  theme.background(ctx, distance, scene);
  for (const obstacle of game.obstacles) theme.obstacle(ctx, obstacle, scene);
  if (preview) {
    // The title-screen hero uses the real car renderer. Its scale, hover and
    // air bursts are presentation only; the simulation stays in ready state.
    const portrait = stage.clientWidth < stage.clientHeight;
    const compactPortrait = portrait && stage.clientHeight <= 650;
    const pixelRatio = canvas.width / stage.clientWidth;
    const widthRatio = portrait ? (compactPortrait ? .58 : .66) : .31;
    const width = Math.min(stage.clientWidth * widthRatio, portrait ? 290 : 390);
    const compact = !portrait && stage.clientHeight <= 800;
    const cx = (canvas.width * (compact ? .72 : .5) - x) / scale;
    const heightRatio = portrait ? (compactPortrait ? .445 : .49)
      : compact ? (stage.clientHeight > 550 ? .43 : .36) : .57;
    const cy = (canvas.height * heightRatio - y) / scale;
    ctx.save(); ctx.translate(cx, cy + Math.sin(previewTime * 2.4) * 3);
    const zoom = width * pixelRatio / (78 * scale); ctx.scale(zoom, zoom);
    theme.car(ctx, { ...game.car, x: -39, y: -15, velocity: -130, thrust: .1 + Math.sin(previewTime * 4) * .035 }, previewTime, scene);
    ctx.restore();
  } else theme.car(ctx, game.car, renderTime, scene);
  // Continue the same decorative road texture through tall portrait screens.
  if (theme.road) theme.road(ctx, distance, WORLD.height, extra, scene);
  else {
    ctx.fillStyle = '#657367';
    ctx.fillRect(0, WORLD.height, WORLD.width, extra);
  }
  // A quiet edge marks the ceiling during flights on tall screens.
  if (!preview) {
    ctx.strokeStyle = '#71856a55'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, game.playfield.ceiling); ctx.lineTo(WORLD.width, game.playfield.ceiling); ctx.stroke();
  }
  theme.weather?.(ctx, scene, { width: (scene?.viewLeft ?? 0) + (scene?.viewWidth ?? WORLD.width), top: -y / scale, height: canvas.height / scale });
}
function frame(timestamp) {
  const dt = previous ? Math.min((timestamp - previous) / 1000, .05) : 0;
  previous = timestamp;
  if (!document.hidden) {
    if (game.state === 'playing' || screen === 'over') rewards.update(dt);
    if (game.state === 'ready' || game.state === 'playing') renderTime += dt;
    if (game.state === 'playing') {
      accumulator += dt;
      while (accumulator >= STEP) {
        game.update(STEP);
        accumulator -= STEP;
        if (game.state === 'over') { gameOver(); break; }
      }
      if (game.state === 'playing') {
        const milestone = rewards.observe(game.score);
        if (milestone) $('#announcer').textContent = `${milestone.score} points. ${milestone.message}`;
      }
    }
  }
  $('#score').textContent = format(game.score);
  $('#in-game-hint').hidden = screen !== 'playing' || game.elapsed > 3;
  const notice = rewards.notice;
  $('#milestone').hidden = screen !== 'playing' || !notice;
  if (notice) {
    $('#milestone-score').textContent = `${notice.score}!`;
    $('#milestone-message').textContent = notice.message;
  }
  render();
  clearCelebration();
  if (!reducedMotion.matches && ['playing', 'over'].includes(screen) && rewards.burst) {
    const ratio = celebrationCanvas.width / stage.clientWidth;
    celebrationCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const scoreboard = $('.scoreboard').getBoundingClientRect();
    const bounds = arcade.getBoundingClientRect();
    drawCelebration(celebrationCtx, rewards.burst, stage.clientWidth, stage.clientHeight,
      { x: scoreboard.left - bounds.left + 55, y: scoreboard.bottom - bounds.top + 10 });
  }
  requestAnimationFrame(frame);
}
updateThemeMenu();
requestAnimationFrame(frame);
