import test from 'node:test';
import assert from 'node:assert/strict';
import { lightingAt } from '../js/themes/lighting.js';
import { weatherScene, rainDrops, drawRain, drawWetRoad, drawRainClouds } from '../js/themes/weather.js';
import { birdAppearanceAt } from '../js/themes/bird-appearance.js';
import { Game } from '../js/game.js';

test('clear preserves the original lighting; rain leaves the cycle and bird species intact', () => {
  for (const start of ['day', 'night']) for (let time = 0; time <= 360; time += 5) {
    const lighting = lightingAt(time, start);
    const original = { ...lighting };
    const clear = weatherScene(lighting, 'clear', time);
    const rain = weatherScene(lighting, 'rain', time);
    for (const key of Object.keys(lighting)) assert.equal(clear[key], lighting[key]);
    assert.deepEqual(lighting, original);
    assert.equal(rain.night, lighting.night);
    assert.equal(rain.progress, lighting.progress);
    assert.equal(birdAppearanceAt(rain.night, 3), birdAppearanceAt(lighting.night, 3));
    assert.ok(rain.lights >= .48 && rain.lights <= 1);
    assert.ok(rain.sunAlpha <= lighting.sunAlpha && rain.moonAlpha <= lighting.moonAlpha);
    assert.notEqual(rain.skyTop, clear.skyTop);
  }
});

test('rain is deterministic, moves diagonally and has bounded density in portrait and landscape', () => {
  for (const [width, top, height] of [[960, 0, 540], [600, -379, 1298], [960, -1200, 2940]]) {
    const drops = rainDrops(12, width, top, height);
    assert.deepEqual(drops, rainDrops(12, width, top, height));
    assert.ok(drops.length > 100 && drops.length <= 420);
    for (const drop of drops) {
      assert.ok(drop.x >= -16 && drop.x < width + 16);
      assert.ok(drop.y >= top - 15 && drop.y < top + height + 15);
    }
    assert.ok(drops.some(drop => drop.y < 0) || top === 0);
    assert.ok(drops.some(drop => drop.y > 540) || height === 540);
    const next = rainDrops(12.001, width, top, height);
    assert.ok(next[0].x < drops[0].x);
    assert.ok(next[0].y > drops[0].y);
  }
  assert.deepEqual(rainDrops(0, 0, 0, 540), []);
  assert.deepEqual(rainDrops(0, 960, 0, 0), []);
  assert.deepEqual(rainDrops(NaN, 960, 0, 540), rainDrops(0, 960, 0, 540));
});

test('active simulation time freezes weather on pause/game-over and resets it on retry', () => {
  const game = new Game(() => .5);
  const snapshot = () => {
    const scene = weatherScene(lightingAt(game.elapsed), 'rain', game.elapsed);
    return { scene, drops: rainDrops(scene.time, 960, 0, 540) };
  };
  const initial = snapshot();
  game.flap(); game.update(.05);
  assert.notDeepEqual(snapshot(), initial);
  game.pause(); const paused = snapshot();
  game.update(10); assert.deepEqual(snapshot(), paused);
  game.resume(); game.update(.05); assert.notDeepEqual(snapshot(), paused);
  game.state = 'over'; const over = snapshot(); game.update(10); assert.deepEqual(snapshot(), over);
  game.reset(); assert.deepEqual(snapshot(), initial);
});

test('clear weather adds no canvas drawing work', () => {
  const untouched = new Proxy({}, { get() { throw new Error('Clear weather drew an effect'); } });
  const scene = weatherScene(lightingAt(0));
  drawRain(untouched, scene);
  drawRainClouds(untouched, 0, scene);
  drawWetRoad(untouched, 0, 474, 66, scene);
});
