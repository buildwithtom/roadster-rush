import { glow } from './lighting.js';

// Local coordinates: each shop stands on y=0. Art is decorative only.
// Muted, sun-faded paint and small props give personality without competing
// with the solid silhouettes of the car and gameplay obstacles.
const P = {
  shadow: '#6f8070', dark: '#617468', metal: '#849489', cream: '#eee0ba',
  clay: '#c88e72', yellow: '#dbc28a', mint: '#aebda1', blue: '#94b3af',
  pink: '#d5aaa0', green: '#94aa77', red: '#c38062', wood: '#aa9270',
};
function rect(c, color, x, y, w, h) { c.fillStyle = color; c.fillRect(x, y, w, h); }
function path(c, color, points) {
  c.fillStyle = color; c.beginPath();
  points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
  c.closePath(); c.fill();
}
function line(c, color, width, points) {
  c.strokeStyle = color; c.lineWidth = width; c.beginPath();
  points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
}
function oval(c, color, x, y, rx, ry = rx) {
  c.fillStyle = color; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill();
}
function board(c, text, x, y, width, color = P.cream) {
  c.save();c.translate(x, y);c.rotate(Math.sin(text.length) * .025);
  path(c, color, [[0, 1], [width - 2, -1], [width, 15], [2, 17]]);
  // Hand-painted board on old timber, with worn corners and uneven lettering.
  line(c, '#aa947066', 1, [[3, 3], [width - 5, 2]]);
  rect(c, '#b4a07e66', 3, 13, 9, 2);rect(c, '#b4a07e66', width - 13, 2, 7, 2);
  c.fillStyle = '#536656'; c.font = 'bold 8px Arial'; c.textAlign = 'center';
  c.fillText(text, width / 2, 11, width - 6);c.restore();
}
function weathering(c, width, roof, variant) {
  // Broken plaster revealing brick, wall stains and a small old paper notice.
  path(c, '#b18b6c', [[2, -32], [17, -34], [22, -26], [15, -18], [3, -20]]);
  for (let i = 0; i < 3; i++) line(c, '#d4b391', 1, [[4, -29 + i * 4], [16, -29 + i * 4]]);
  line(c, '#988e7280', 1, [[width - 10, roof + 22], [width - 14, roof + 35], [width - 8, roof + 43]]);
  rect(c, '#d9cfaa', width - 10, -25, 7, 12);
  line(c, '#ac9a7e', 1, [[width - 9, -21], [width - 5, -21]]);
  if (variant % 2) path(c, '#8a927b60', [[4, -3], [width - 4, -9], [width - 3, 1], [3, 2]]);
}
function tinRoof(c, x, y, width, color = P.metal) {
  path(c, color, [[x - 5, y + 5], [x + 5, y - 4], [x + width - 3, y - 8], [x + width + 6, y + 4]]);
  for (let sx = x + 5; sx < x + width; sx += 9) line(c, '#e5e3c460', 1, [[sx, y - 3], [sx - 3, y + 3]]);
  line(c, P.shadow, 3, [[x - 5, y + 5], [x + width + 6, y + 4]]);
}
function crate(c, x, y, width = 24, height = 17) {
  rect(c, P.wood, x, y - height, width, height);
  for (let dy = 3; dy < height; dy += 5) rect(c, '#d1b48b', x + 2, y - dy, width - 4, 2);
  line(c, '#8c8064', 2, [[x + 2, y - height + 1], [x + 2, y - 1]]);
  line(c, '#8c8064', 2, [[x + width - 3, y - height + 1], [x + width - 3, y - 1]]);
}
function sack(c, x, y, color = '#d3c299') {
  c.fillStyle = color; c.beginPath(); c.moveTo(x - 6, y - 24);
  c.bezierCurveTo(x - 14, y - 12, x - 16, y, x, y);
  c.bezierCurveTo(x + 16, y, x + 12, y - 15, x + 5, y - 24); c.fill();
  oval(c, '#a69472', x, y - 24, 6, 2);
}
function plant(c, x, y) {
  path(c, P.clay, [[x - 7, y - 12], [x + 7, y - 12], [x + 5, y], [x - 5, y]]);
  line(c, P.shadow, 2, [[x, y - 10], [x, y - 30]]);
  for (let i = 0; i < 3; i++) {
    oval(c, P.green, x - 5, y - 18 - i * 6, 6, 3);
    oval(c, '#839b72', x + 4, y - 21 - i * 6, 5, 3);
  }
}
function bench(c, x, y, width = 36) {
  rect(c, P.wood, x, y - 12, width, 4);
  line(c, P.shadow, 3, [[x + 4, y - 8], [x + 2, y]]);
  line(c, P.shadow, 3, [[x + width - 5, y - 8], [x + width - 3, y]]);
}
function tyre(c, x, y, radius = 9) {
  oval(c, '#68766b', x, y, radius); oval(c, '#a8ad90', x, y, radius * .5);
  oval(c, '#788576', x, y, radius * .25);
}
function shutter(c, x, y, width, height, color) {
  rect(c, color, x, y, width, height);
  for (let dy = 4; dy < height; dy += 5) line(c, '#61746840', 1, [[x, y + dy], [x + width, y + dy]]);
}
function house(c, width, roof, color, variant) {
  const raised = variant % 3 === 0;
  const top = roof - (raised ? 37 : 8);
  path(c, color, [[0, top + 3], [width - 2, top], [width, 0], [1, 0]]);
  if (raised) {
    rect(c, '#697c6b', width - 37, top + 7, 23, 21);
    shutter(c, width - 38, top + 6, 11, 24, '#a8b197');
    // Only an occasional partial upper room, never a row of matching balconies.
    path(c, '#b7a990', [[-3, top], [width - 7, top - 4], [width + 5, top + 3], [-3, top + 5]]);
    line(c, '#9c9d83', 1, [[14, top + 4], [14, top - 9], [46, top - 3]]);
  } else tinRoof(c, -1, top, width + 2, '#9da38b');
  weathering(c, width, top, variant);
}
function chai(c, w, variant, phase) {
  const roof = -73;
  rect(c, P.clay, 5, roof, w - 10, 70); rect(c, P.shadow, 13, -61, w - 26, 44);
  weathering(c, w, roof, variant);
  tinRoof(c, 0, roof, w, '#a5aa91');
  board(c, variant % 2 ? 'Bunty Chai' : 'Ramesh Tea Stall', 13, -66, w - 26, P.yellow);
  rect(c, '#cdb384', 10, -23, w - 20, 20); rect(c, P.cream, 7, -26, w - 14, 5);
  // Big kettle silhouette: body, lid, curved handle and a pointed spout.
  oval(c, '#aebaae', 34, -36, 11, 10); rect(c, P.metal, 28, -47, 13, 3);
  rect(c, P.shadow, 32, -50, 5, 3);
  path(c, '#aebaae', [[42, -39], [53, -46], [49, -35], [42, -31]]);
  c.strokeStyle = P.metal; c.lineWidth = 3; c.beginPath(); c.arc(24, -37, 7, 1, 5); c.stroke();
  for (let i = 0; i < 3; i++) { rect(c, '#e9e7cc', 60 + i * 8, -34, 5, 8); rect(c, '#a4b5a0', 60 + i * 8, -34, 5, 2); }
  rect(c, '#b5aa7b', w - 27, -41, 12, 14); rect(c, P.cream, w - 28, -43, 14, 3);
  // Steam moves only with scene distance, so it freezes with the paused run.
  for (let i = 0; i < 2; i++) {
    c.strokeStyle = '#f4edcf99'; c.lineWidth = 1.5; c.beginPath();
    c.moveTo(33 + i * 7, -51); c.bezierCurveTo(25 + i * 7 + Math.sin(phase) * 3, -57, 40 + i * 4, -63, 33 + i * 7, -68); c.stroke();
  }
  bench(c, 4, 6, 39); bench(c, w - 27, 5, 25);
  line(c, P.dark, 1, [[w - 17, roof + 4], [w - 17, -53]]); oval(c, '#efda9e', w - 17, -51, 3, 4);
}
function workshop(c, w, variant) {
  rect(c, '#b4b19a', 1, -99, w - 2, 98); tinRoof(c, -2, -99, w + 4);
  weathering(c, w, -99, variant);
  board(c, variant % 2 ? 'Iqbal Auto Works' : 'Sharma Garage', 10, -90, w - 20, '#b6c3b0');
  rect(c, '#5e7367', 10, -70, w - 20, 68); shutter(c, 10, -70, w - 20, 22, variant % 2 ? P.blue : P.metal);
  line(c, '#adb397', 2, [[15, -42], [w - 14, -42]]);
  for (let i = 0; i < 4; i++) { const x = 23 + i * 15; line(c, '#b8c0a5', 2, [[x, -42], [x, -25]]); line(c, '#b8c0a5', 2, [[x - 3, -39], [x, -35], [x + 3, -39]]); }
  tyre(c, w - 30, -15, 14); tyre(c, 20, -9, 10); tyre(c, 22, -24, 10);
  rect(c, '#899c8d', w - 14, -27, 21, 27);
  for (const y of [-23, -7]) rect(c, '#bcc3a6', w - 14, y, 21, 2);
  rect(c, P.clay, 46, -15, 11, 15);rect(c, P.shadow, 49, -19, 5, 5);
}
function bakery(c, w, variant) {
  house(c, w, -88, variant % 2 ? P.pink : P.yellow, variant);
  board(c, variant % 2 ? 'Babu Bakery' : 'Lakshmi Bakery', 8, -88, w - 16);
  rect(c, P.shadow, 9, -63, w - 18, 60);
  rect(c, '#acc0ad', 15, -56, w - 50, 48);
  for (let y = -39; y <= -15; y += 22) {
    rect(c, '#a08a6c', 17, y + 5, w - 54, 3);
    for (let x = 24; x < w - 38; x += 16) {
      oval(c, '#e7c28c', x, y, 7, 5); line(c, '#f7deb0', 1, [[x - 2, y - 3], [x + 1, y]]);
    }
  }
  rect(c, P.cream, w - 29, -60, 3, 57); rect(c, '#dac5a0', w - 16, -31, 2, 5);
  path(c, '#b6a17e', [[0, -68], [w - 2, -71], [w + 6, -51], [w * .6, -54], [-4, -50]]);
  path(c, '#c9b48a', [[15, -67], [37, -67], [43, -54], [16, -53]]);
  line(c, P.wood, 2, [[0, -51], [-2, 0]]);
  crate(c, w - 25, 4, 28, 18); plant(c, 6, 3);
}
function vegetables(c, w, variant) {
  rect(c, variant % 2 ? P.mint : '#c4c297', 4, -82, w - 8, 82);
  rect(c, P.shadow, 14, -70, w - 28, 68);
  // Uneven cloth tarp, tied to thin bamboo supports.
  line(c, P.wood, 3, [[-3, 1], [-1, -82]]);line(c, P.wood, 3, [[w + 2, 2], [w, -87]]);
  path(c, '#8fa48a', [[-8, -82], [w + 6, -89], [w + 10, -66], [w * .55, -61], [-9, -64]]);
  line(c, '#c7cba3', 2, [[-7, -64], [w * .55, -61], [w + 9, -66]]);
  board(c, variant % 2 ? 'Raju Sabzi Bhandar' : 'Raju Vegetables', 9, -83, w - 18, '#d9cf9a');
  // Broad piles read as produce even when the sign is too small to read.
  const colors = [P.red, '#8ba35f', '#c6b05e', '#b39289'];
  for (let i = 0; i < 4; i++) {
    const x = 7 + i * (w - 10) / 4, width = (w - 15) / 4;
    crate(c, x, -2, width, 21);
    for (let j = 0; j < 6; j++) oval(c, colors[i], x + 4 + (j % 3) * (width - 7) / 2, -26 - Math.floor(j / 3) * 6, 5, 4);
  }
  sack(c, w + 3, 9); crate(c, -5, 7, 22, 13);
  for (let i = 0; i < 4; i++) oval(c, P.red, 2 + i * 4, -8 - (i % 2) * 4, 4, 3);
  // Hanging bunch of bananas.
  line(c, P.wood, 1, [[w - 17, -63], [w - 17, -47]]);
  for (let i = 0; i < 4; i++) oval(c, '#d8be6c', w - 23 + i * 4, -44 + (i % 2) * 3, 3, 7);
}
function grocery(c, w, variant) {
  house(c, w, -98, variant % 2 ? P.blue : P.mint, variant);
  board(c, variant % 2 ? 'Gupta Kirana' : 'Meena General Stores', 4, -96, w - 8, '#dfc997');
  rect(c, P.shadow, 9, -77, w - 18, 75);
  for (let y = -59; y < -10; y += 19) {
    for (let x = 17; x < w - 15; x += 13) rect(c, [P.yellow, '#c4c69d', P.clay][(x + y + 150) % 3], x, y, 8, 12);
    rect(c, '#d3be92', 12, y + 13, w - 24, 3);
  }
  for (let i = 0; i < 3; i++) {
    const x = 15 + i * (w - 31) / 2;
    line(c, '#c8b48c', 1, [[x, -78], [x, -24]]);
    for (let j = 0; j < 5; j++) rect(c, [P.clay, '#c7bc73', '#a9bb97'][(i + j) % 3], x - 3, -75 + j * 10, 7, 8);
  }
  rect(c, P.wood, 5, -13, w - 10, 12); sack(c, w - 2, 6); crate(c, -7, 3, 22, 19);
}
function kiosk(c, w, variant) {
  // A handcart and umbrella create a completely different street silhouette.
  const mid = w / 2;
  line(c, P.wood, 3, [[mid, -11], [mid, -106]]);
  path(c, '#c99a76', [[mid, -108], [4, -78], [w - 3, -78]]);
  path(c, '#e0c794', [[mid, -108], [mid - 14, -78], [mid + 17, -78]]);
  for (let x = 5; x < w; x += 15) oval(c, '#c99a76', x, -78, 8, 3);
  tyre(c, 22, 0, 8); tyre(c, w - 22, 0, 8);
  rect(c, '#b6b690', 13, -29, w - 26, 24); rect(c, P.cream, 9, -33, w - 18, 5);
  rect(c, '#a9bdb0', 17, -63, w - 49, 29); rect(c, '#d7ddbc', 21, -59, w - 57, 22);
  for (let i = 0; i < 5; i++) oval(c, '#ccac75', 26 + i * 7, -40, 4, 4);
  line(c, P.metal, 2, [[17, -49], [w - 32, -49]]);
  oval(c, '#bbc4b0', w - 23, -37, 9, 3);rect(c, '#a0afa1', w - 32, -53, 18, 16);oval(c, '#d3d6ba', w - 23, -54, 9, 3);
  board(c, variant % 2 ? 'Pappu Chaat' : 'Mohan Snacks', 15, -25, w - 30, '#d9c69c');
}
function hardware(c, w, variant) {
  rect(c, '#c3b197', 2, -92, w - 4, 92); tinRoof(c, -1, -92, w + 2, '#a5ab9a');
  weathering(c, w, -92, variant);
  board(c, variant % 2 ? 'Khan Hardware' : 'Ravi Repair Works', 6, -85, w - 12, '#c6c9ac');
  rect(c, P.shadow, 10, -65, w - 20, 64); shutter(c, w * .6, -65, w * .3, 58, variant % 2 ? '#b69f88' : '#97aaa0');
  for (let i = 0; i < 3; i++) { rect(c, '#d6ccab', 17 + i * 13, -25, 10, 20); rect(c, P.clay, 17 + i * 13, -20, 10, 6); }
  for (let i = 0; i < 3; i++) line(c, '#bdc2a3', 3, [[20 + i * 14, -59], [20 + i * 14, -39]]);
  oval(c, '#b2b89b', 56, -49, 8); oval(c, P.shadow, 56, -49, 5);
  line(c, P.wood, 3, [[w - 5, 0], [w - 13, -66]]);line(c, P.wood, 3, [[w + 8, 0], [w, -66]]);
  for (let i = 0; i < 6; i++) line(c, P.wood, 2, [[w - 12 + i, -59 + i * 10], [w + i, -59 + i * 10]]);
  crate(c, 1, 5, 23, 17);
}
function scooter(c, x, y, flip = 1) {
  c.save();c.translate(x, y);c.scale(flip, 1);
  tyre(c, -16, -5, 7);tyre(c, 17, -5, 7);
  path(c, '#9aaea2', [[-23, -12], [-18, -25], [-6, -24], [-1, -12], [9, -12], [11, -31], [17, -33], [23, -12], [18, -7], [-17, -7]]);
  rect(c, P.shadow, -20, -28, 20, 4);line(c, P.shadow, 2, [[13, -31], [9, -38], [17, -38]]);oval(c, P.cream, 18, -29, 3);
  c.restore();
}

const SHOPS = [chai, workshop, bakery, vegetables, grocery, kiosk, hardware];
const SHOP_ROOFS = new Map([[chai,-73],[workshop,-99],[bakery,-88],[vegetables,-82],[grocery,-98],[kiosk,-78],[hardware,-92]]);
// Hashing the absolute block index keeps scenes stable when revisited and
// avoids any random calls or accumulated positions in the animation loop.
function noise(n) { const value = Math.sin(n * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value); }
const BLOCK = 1300;
function shopBlock(c, block, offset, distance, lighting) {
  let x = block * BLOCK - offset + 14;
  for (let i = 0; i < 7; i++) {
    const id = block * 7 + i;
    const width = 108 + Math.floor(noise(id + 23) * 30);
    const variant = Math.floor(noise(id + 55) * 10);
    const shop = SHOPS[((i + block * 3) % SHOPS.length + SHOPS.length) % SHOPS.length];
    if (x > -180 && x < 980) {
      c.save(); c.translate(x, 447 + Math.floor(noise(id + 87) * 8));
      if (lighting) {
        shopLights(c, width, shop, variant, lighting);c.restore();
        x += width + 27 + Math.floor(noise(id + 79) * 12);
        continue;
      }
      oval(c, '#87947835', width / 2, 4, width * .55, 4);
      shop(c, width, variant, distance * .025);
      if (i % 3 === 0) scooter(c, width + 22, 4, variant % 2 ? -1 : 1);
      else if (i % 3 === 1) { sack(c, width + 13, 4); tyre(c, width + 18, 1, 7); }
      else { crate(c, width + 5, 6, 21, 13); }
      c.restore();
    }
    x += width + 27 + Math.floor(noise(id + 79) * 12);
  }
  if (lighting) return;
  // The remainder of each block is a low compound wall and a leafy yard.
  const end = (block + 1) * BLOCK - offset;
  if (x < 970 && end > -30) {
    rect(c, '#b3b797', x - 10, 426, end - x + 20, 23);
    rect(c, '#c9c5a4', x - 12, 423, end - x + 24, 5);
    for (let tx = x + 20; tx < end - 10; tx += 40) {
      rect(c, '#9ca78b', tx, 396, 5, 28);
      oval(c, '#a2b193', tx + 2, 388, 22, 26); oval(c, '#b0bc9b', tx - 10, 389, 18, 18);
    }
  }
}
function skyline(c, distance) {
  const offset = distance * .12;
  const first = Math.floor(offset / 100) - 1;
  for (let i = first; i < first + 12; i++) {
    const x = i * 100 - offset, width = 72 + noise(i + 11) * 26;
    const top = 336 + noise(i + 9) * 45;
    rect(c, ['#d1c8ad', '#cec9ae', '#c7c6ad'][((i % 3) + 3) % 3], x, top, width, 130);
    rect(c, '#c1bea3', x - 2, top - 3, width + 4, 4);
    for (let wx = x + 13; wx < x + width - 10; wx += 25) {
      for (let wy = top + 14; wy < 393; wy += 38) rect(c, '#a6b09b', wx, wy, 9, 14);
    }
    if (i % 3 === 0) { rect(c, '#b9bba1', x + 10, top - 18, 18, 16);line(c, '#b7b9a0', 1, [[x + 44, top], [x + 44, top - 24], [x + 58, top - 29]]); }
    if (i % 4 === 1) path(c, '#c9c4aa', [[x - 5, top + 2], [x + width / 2, top - 19], [x + width + 5, top + 2]]);
  }
}
function streetEdge(c, distance) {
  // Thin, desaturated cables look different from the solid collision poles.
  const offset = distance * .38, first = Math.floor(offset / 480) - 1;
  for (let i = first; i < first + 4; i++) {
    const x = i * 480 - offset;
    rect(c, '#a0a58b', x, 319, 4, 137);
    c.strokeStyle='#8e9b83';c.lineWidth=3;c.beginPath();c.moveTo(x+2,338);c.quadraticCurveTo(x+1,300,x+27,307);c.stroke();
    rect(c,'#7d8d77',x+21,306,18,4);
    line(c, '#959e85', 2, [[x - 14, 328], [x + 20, 328]]);
    for (let j = 0; j < 2; j++) {
      c.strokeStyle = '#909d8270';c.lineWidth = 1;c.beginPath();c.moveTo(x, 328 + j * 8);c.quadraticCurveTo(x + 240, 365 + j * 8, x + 480, 328 + j * 8);c.stroke();
    }
  }
  // Bare earth outside the shops: no continuous paved pavement or kerb.
  rect(c, '#bdab8a', 0, 457, 960, 17);
  const shoulder = distance * .38;
  for (let i = Math.floor(shoulder / 90) - 1; i < Math.floor(shoulder / 90) + 12; i++) {
    const x = i * 90 - shoulder;
    path(c, '#b3a182', [[x, 455], [x + 24, 452], [x + 52, 458], [x + 90, 454], [x + 90, 467], [x + 51, 470], [x + 18, 465], [x, 468]]);
    for (let j = 0; j < 4; j++) oval(c, j % 2 ? '#d0bd99' : '#a29478', x + 8 + noise(i * 9 + j) * 72, 458 + noise(i * 11 + j) * 12, 2 + noise(i + j) * 2, 1);
    if (i % 3 === 0) {
      // Shallow open drain, with a few mismatched slabs bridging it.
      path(c, '#8f9279', [[x + 8, 454], [x + 71, 453], [x + 66, 459], [x + 16, 461]]);
      path(c, '#c4b695', [[x + 24, 450], [x + 41, 449], [x + 43, 459], [x + 25, 460]]);
      path(c, '#b7ac8d', [[x + 46, 451], [x + 61, 451], [x + 62, 458], [x + 45, 459]]);
    }
    if (i % 4 === 1) {
      line(c, '#929976', 1, [[x + 73, 460], [x + 71, 452], [x + 75, 456], [x + 79, 450]]);
      path(c, '#c2a184', [[x + 7, 459], [x + 15, 456], [x + 19, 461], [x + 9, 463]]);
    }
  }
}
function streetBase(c, distance) {
  c.save();
  skyline(c, distance);
  rect(c, '#bdab8a', 0, 445, 960, 29);
  const offset = distance * .38, first = Math.floor(offset / BLOCK) - 1;
  for (let block = first; block <= first + 2; block++) shopBlock(c, block, offset, distance);
  streetEdge(c, distance);
  c.restore();
}

// Reuse a small logical-resolution layer. Tint only painted scenery pixels,
// preserving the sky gradient and avoiding rectangular dark bands at rooflines.
let streetLayer;
export function drawStreet(c, distance, scene) {
  const shade = (scene?.night ?? 0) * .68 + (scene?.rain ? .12 : 0);
  if (!shade) { streetBase(c,distance);return; }
  if (!streetLayer) {
    streetLayer=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(960,540):document.createElement('canvas');
    streetLayer.width=960;streetLayer.height=540;
  }
  const layer=streetLayer.getContext('2d');
  layer.clearRect(0,0,960,540);streetBase(layer,distance);
  layer.save();layer.globalCompositeOperation='source-atop';layer.globalAlpha=shade;
  layer.fillStyle='#122b46';layer.fillRect(0,0,960,540);layer.restore();
  c.drawImage(streetLayer,0,0);
}
function shopLights(c,width,shop,variant,scene) {
  const roof=SHOP_ROOFS.get(shop),stringY=roof+23;
  c.save();c.globalAlpha=scene.lights;
  // Warm counters and windows, with a gentle spill rather than opaque glare.
  c.save();c.globalAlpha*=.2;c.fillStyle='#f3c276';c.fillRect(14,-50,width-28,40);c.restore();
  glow(c,width*.5,-24,width*.52,'#edbc6f',.27);
  if((shop===bakery||shop===grocery)&&variant%3===0){
    c.fillStyle='#e8c77e';c.globalAlpha=scene.lights*.65;
    c.fillRect(width-34,roof-28,14,17);c.globalAlpha=scene.lights;
  }
  c.strokeStyle='#91835f';c.lineWidth=1;c.beginPath();c.moveTo(3,stringY);
  c.quadraticCurveTo(width/2,stringY+10,width-3,stringY);c.stroke();
  for(let x=9;x<width-5;x+=14){
    const y=stringY+5*Math.sin(x/width*Math.PI);
    const color=['#f8d68b','#e9b787','#d7dfa1'][(Math.floor(x/14)+variant)%3];
    glow(c,x,y+3,7,color,.75);c.fillStyle=color;c.fillRect(x-1,y,2,4);
  }
  c.restore();
}
export function drawStreetLights(c,distance,scene) {
  if(!scene?.lights)return;
  const offset=distance*.38,first=Math.floor(offset/480)-1;
  c.save();c.globalAlpha=scene.lights;
  for(let i=first;i<first+4;i++){
    const x=i*480-offset+29;
    const beam=c.createLinearGradient(x,310,x,487);
    beam.addColorStop(0,'#f6d39020');beam.addColorStop(1,'#f6d39000');
    c.fillStyle=beam;c.beginPath();c.moveTo(x-4,310);c.lineTo(x-68,487);c.lineTo(x+68,487);c.lineTo(x+5,310);c.fill();
    glow(c,x,310,32,'#f3d38f',.65);glow(c,x,479,63,'#e8bd72',.26);
    c.fillStyle='#ffe5a6';c.fillRect(x-7,309,14,3);
  }
  c.restore();
  const firstBlock=Math.floor(offset/BLOCK)-1;
  for(let block=firstBlock;block<=firstBlock+2;block++)shopBlock(c,block,offset,distance,scene);
}
