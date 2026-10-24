import { blendColor } from './lighting.js';

const wrap = (value, size) => ((value % size) + size) % size;
const noise = seed => { const n = Math.sin(seed * 91.7 + 28.3) * 43758.5453; return n - Math.floor(n); };

function puddle(c, x, y, radius, depth, seed) {
  c.beginPath(); c.moveTo(x - radius, y);
  c.bezierCurveTo(x - radius * .8, y - depth, x - radius * .2, y - depth * .5, x + radius * .1, y - depth * .85);
  c.bezierCurveTo(x + radius * .6, y - depth * (1 + noise(seed)), x + radius * 1.1, y - depth * .1, x + radius, y + depth * .2);
  c.bezierCurveTo(x + radius * .7, y + depth, x + radius * .25, y + depth * .4, x - radius * .2, y + depth * .8);
  c.bezierCurveTo(x - radius * .45, y + depth, x - radius * 1.1, y + depth * .4, x - radius, y);
  c.fill();
}

// Weather composes with lighting; it never changes the day/night phase used
// for bird species, nor reads or mutates simulation state.
export function weatherScene(scene, weather = 'clear', seconds = 0) {
  const time = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  if (weather !== 'rain') return { ...scene, rain: 0, time };
  return {
    ...scene, rain: 1, time,
    skyTop: blendColor('#768b92', '#192b3c', scene.night),
    skyBottom: blendColor('#bcc5bb', '#586975', scene.night),
    cloud: blendColor('#71868c', '#324959', scene.night),
    sunAlpha: scene.sunAlpha * .12,
    moonAlpha: scene.moonAlpha * .32,
    lights: Math.max(.48, scene.lights),
  };
}

// Seeded, analytically positioned drops avoid per-frame randomness and keep
// pause exact. View bounds include the extra sky/road on portrait screens.
export function rainDrops(seconds, width, top, height) {
  if (!(width > 0 && height > 0)) return [];
  const time = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const count = Math.min(420, Math.ceil(width * height / 3300));
  return Array.from({ length: count }, (_, i) => {
    const near = i % 3 === 0;
    const speed = near ? 510 : 340;
    return {
      x: wrap(noise(i + 1) * (width + 32) - time * speed * .28, width + 32) - 16,
      y: top + wrap(noise(i + 301) * (height + 30) + time * speed, height + 30) - 15,
      length: near ? 15 : 9, near,
    };
  });
}

export function drawRainClouds(c, distance, scene) {
  if (!scene.rain) return;
  c.save();
  c.fillStyle = scene.cloud;
  for (let layer = 0; layer < 2; layer++) {
    c.globalAlpha = layer ? .28 : .42;
    const drift = distance * (.025 + layer * .015) + scene.time * (3 + layer * 2);
    const first = Math.floor(drift / 180) - 1;
    c.beginPath();
    for (let i = first; i < first + 8; i++) {
      const x = i * 180 - drift;
      const y = 10 + layer * 62 + noise(i + layer * 41) * 25;
      c.moveTo(x + 132, y); c.ellipse(x, y, 132, 33 + noise(i + 71) * 20, 0, 0, Math.PI * 2);
    }
    c.fill();
  }
  c.restore();
}

export function drawRain(c, scene, { width = 960, top = 0, height = 540 } = {}) {
  if (!scene.rain) return;
  const drops = rainDrops(scene.time, width, top, height);
  c.save(); c.beginPath(); c.rect(0, top, width, height); c.clip();
  c.strokeStyle = '#dceaf0'; c.lineCap = 'round';
  for (const near of [false, true]) {
    c.globalAlpha = near ? .36 : .19; c.lineWidth = near ? 1.15 : .75;
    c.beginPath();
    for (const drop of drops) {
      if (drop.near !== near) continue;
      c.moveTo(drop.x, drop.y); c.lineTo(drop.x - drop.length * .28, drop.y + drop.length);
    }
    c.stroke();
  }
  c.restore();
}

export function drawWetRoad(c, distance, top, height, scene) {
  if (!scene?.rain) return;
  // Caller clips to its road segment. Absolute coordinates make the main
  // road and portrait extension share the same puddles and ripple phases.
  c.save(); c.globalAlpha = .36; c.fillStyle = '#203e4b'; c.fillRect(0, top, 960, height);
  c.globalAlpha = 1;
  const offset = distance * .7, first = Math.floor(offset / 180) - 1;
  const waterColor = blendColor('#a1b6b4', '#6f8d9e', scene.night) + '65';
  for (let row = Math.max(0, Math.floor((top - 474) / 58) - 1); row <= Math.ceil((top + height - 474) / 58); row++) {
    for (let col = first; col < first + 8; col++) {
      const id = col * 37 + row * 113;
      if (noise(id + 67) < .3) continue;
      const x = col * 180 - offset + 45 + noise(id) * 65;
      const y = 490 + row * 58 + noise(id + 9) * 25;
      const radius = 25 + noise(id + 3) * 39;
      c.fillStyle = '#223e4670'; puddle(c, x, y + 1, radius + 3, 7, id);
      c.fillStyle = waterColor; puddle(c, x, y, radius, 5, id);
      c.strokeStyle = '#cfdfd54a'; c.lineWidth = .8;
      c.beginPath(); c.moveTo(x - radius * .65, y - 2); c.lineTo(x + radius * .3, y - 2); c.stroke();
      const phase = wrap(scene.time * 1.3 + noise(id + 19), 1);
      c.globalAlpha = (1 - phase) * .45; c.strokeStyle = '#d8e9df';
      c.beginPath(); c.ellipse(x + noise(id + 5) * 18 - 9, y, 2 + phase * 13, .5 + phase * 2.8, 0, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1;
    }
  }
  // Broken amber streaks beneath the same lamps used by street-art.js.
  const lampOffset = distance * .38;
  c.fillStyle = '#f4ca7d';
  for (let i = Math.floor(lampOffset / 480) - 1; i < Math.floor(lampOffset / 480) + 4; i++) {
    const x = i * 480 - lampOffset + 29;
    for (let j = 0; j < 12; j++) {
      const y = 483 + j * 5;
      c.globalAlpha = scene.lights * .3 * (1 - j / 12);
      const w = 10 + j * 2 + Math.sin(scene.time * 2 + j) * 3;
      c.fillRect(x - w / 2 + Math.sin(j * 4) * 6, y, w, 1.5);
    }
  }
  c.restore();
}
