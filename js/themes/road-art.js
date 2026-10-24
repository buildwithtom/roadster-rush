import { tintRoad } from './lighting.js';
import { drawWetRoad } from './weather.js';

// Decorative surface only. The game's collision floor remains WORLD.floor.
const asphalt = '#77766b';
function noise(n) { const v = Math.sin(n * 91.7 + 28.3) * 43758.5453; return v - Math.floor(v); }
function shape(c, color, points) {
  c.fillStyle = color; c.beginPath();
  points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
  c.closePath(); c.fill();
}
function stone(c, x, y, radius, color) {
  shape(c, color, [[x - radius, y], [x - radius * .4, y - radius * .45], [x + radius * .8, y - radius * .3], [x + radius, y + radius * .25], [x, y + radius * .5]]);
}

function pothole(c, x, y, radius, color, seed) {
  const points = [];
  for (let i = 0; i < 11; i++) {
    const angle = i * Math.PI * 2 / 11;
    const edge = radius * (.72 + noise(seed + i * 13) * .35);
    points.push([x + Math.cos(angle) * edge, y + Math.sin(angle) * edge * .34]);
  }
  shape(c, color, points);
}

export function drawRoad(c, distance, top = 474, height = 66, scene) {
  if (height <= 0) return;
  c.save(); c.beginPath(); c.rect(0, top, 960, height); c.clip();
  c.fillStyle = asphalt; c.fillRect(0, top, 960, height);
  const offset = distance * .7;
  const first = Math.floor(offset / 120) - 1;
  // Absolute world cells make all damage stable across scrolling and ensure
  // the portrait road extension joins the main scene without a texture seam.
  for (let row = Math.floor((top - 474) / 70) - 1; row <= Math.ceil((top + height - 474) / 70); row++) {
    if (row < 0) continue;
    for (let col = first; col <= first + 10; col++) {
      const id = col * 37 + row * 211;
      const x = col * 120 - offset, y = 474 + row * 70;
      const px = x + 26 + noise(id) * 60, py = y + 22 + noise(id + 4) * 30;
      // Uneven repair patches and pale dust dragged across the tar.
      shape(c, noise(id + 1) > .5 ? '#858174' : '#6d7065', [[x, y + 15], [x + 20 + noise(id + 1) * 25, y + noise(id + 3) * 15], [x + 65 + noise(id + 4) * 24, y + 12], [x + 98, y + 22 + noise(id + 6) * 15], [x + 57 + noise(id + 7) * 25, y + 37], [x + 8, y + 27]]);
      c.fillStyle = '#b1a18a30';c.fillRect(x + 8, y + 42, 68 + noise(id + 2) * 25, 2);
      // Loose aggregate and little stones rather than a pristine lane stripe.
      for (let j = 0; j < 8; j++) stone(c, x + noise(id + j * 3) * 119, y + noise(id + j * 7 + 6) * 68, 1 + noise(id + j + 2) * 2, j % 2 ? '#aaa18b' : '#626c60');
      if (noise(id + 9) > .73) {
        const radius = 15 + noise(id + 10) * 17;
        pothole(c, px, py, radius + 4, '#a8967b', id); // crumbled earthen rim
        pothole(c, px, py + 1, radius, '#515c53', id);
        pothole(c, px + 2, py + 3, radius * .7, scene?.rain ? '#91a7a4' : noise(id + 11) > .6 ? '#8c998b' : '#6b6b5c', id);
        for (let j = 0; j < 3; j++) stone(c, px - radius + j * radius, py - 5 - (j % 2) * 4, 2, '#b6a68a');
      } else {
        c.strokeStyle = '#5d665a';c.lineWidth = 1;c.beginPath();
        c.moveTo(px - 20, py - 9);c.lineTo(px - 7, py - 4);c.lineTo(px - 2, py + 5);c.lineTo(px + 12, py + 8);c.lineTo(px + 22, py + 16);c.stroke();
      }
    }
  }
  // A ragged asphalt edge, with exposed earth where the surfacing has broken.
  for (let col = first; col <= first + 10; col++) {
    const x = col * 120 - offset;
    shape(c, '#b5a183', [[x, 474], [x + 120, 474], [x + 120, 477], [x + 91 + noise(col + 1) * 12, 476 + noise(col + 2) * 6], [x + 73, 476], [x + 45 + noise(col + 3) * 20, 480 + noise(col) * 8], [x + 30, 478], [x + 9 + noise(col + 4) * 13, 479 + noise(col + 5) * 5], [x, 479]]);
  }
  tintRoad(c, top, height, scene);
  drawWetRoad(c, distance, top, height, scene);
  c.restore();
}
