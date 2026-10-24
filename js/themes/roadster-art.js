import { blendColor, glow, lightingAt } from './lighting.js';

// A compact side-view interpretation of the newly revealed Roadster: white
// wedge body, bronze canopy, thin lamps and exposed dark wheels. Artwork stays
// in the original 78 × 30 car envelope; no simulation dimensions change.
function panel(c, color, points) {
  c.fillStyle = color; c.beginPath();
  points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
  c.closePath(); c.fill();
}
function line(c, color, width, points) {
  c.strokeStyle = color; c.lineWidth = width; c.beginPath();
  points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
}
function wheel(c, x) {
  c.fillStyle = '#15232b'; c.beginPath(); c.arc(x, 7.5, 7, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#50616a'; c.lineWidth = .7; c.stroke();
  c.fillStyle = '#293a44'; c.beginPath(); c.arc(x, 7.5, 4.9, 0, Math.PI * 2); c.fill();
  // Five fine turbine spokes stay readable at mobile canvas scale.
  c.strokeStyle = '#a9b4b9'; c.lineWidth = 1;
  c.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5 - .4;
    c.moveTo(x + Math.cos(a) * 1.1, 7.5 + Math.sin(a) * 1.1);
    c.lineTo(x + Math.cos(a + .22) * 4.5, 7.5 + Math.sin(a + .22) * 4.5);
  }
  c.stroke(); c.fillStyle = '#d1d9da'; c.beginPath(); c.arc(x, 7.5, 1.1, 0, Math.PI * 2); c.fill();
}

export function drawRoadster(c, car, time, scene = lightingAt()) {
  c.save(); c.translate(car.x + 39, car.y + 15);
  c.rotate(Math.max(-.18, Math.min(.28, car.velocity / 1700)));
  // Preserve both underside nozzles and the original impulse-driven air burst.
  for (const x of [-23, 23]) {
    panel(c, '#34454d', [[x - 5, 9], [x + 5, 9], [x + 4, 18], [x - 4, 18]]);
    c.fillStyle = '#b0bec3'; c.fillRect(x - 4, 17, 8, 3);
    c.fillStyle = '#243740'; c.fillRect(x - 2.8, 18, 5.6, 1.2);
    if (car.thrust > 0) {
      const length = 19 + car.thrust * 90 + Math.sin(time * 85) * 5;
      const air = c.createLinearGradient(0, 18, 0, 18 + length);
      air.addColorStop(0, '#c6f8e4'); air.addColorStop(1, '#c6f8e400');
      panel(c, air, [[x - 4, 20], [x - 10, 20 + length], [x + 10, 20 + length], [x + 4, 20]]);
      line(c, '#effff2', 2, [[x, 21], [x, 29 + length * .4]]);
    }
  }

  const night = scene.night ?? 0;
  const body = c.createLinearGradient(0, -14, 0, 11);
  body.addColorStop(0, blendColor('#fafbf4', '#cddbe0', night));
  body.addColorStop(.55, blendColor('#e1e7e3', '#a8bdc8', night));
  body.addColorStop(1, blendColor('#9eafb3', '#647e90', night));
  // Short rear deck, swept canopy and a long, descending front wedge.
  panel(c, body, [[-39, -4], [-30, -5], [-20, -13], [-5, -13], [3, -10], [14, -4], [32, -1.5], [39, 2], [38, 10], [-36, 10], [-39, 5]]);
  c.strokeStyle = '#273d49'; c.lineWidth = .85; c.stroke();

  const glass = c.createLinearGradient(-20, -12, 7, -3);
  glass.addColorStop(0, '#302d30'); glass.addColorStop(.5, '#6e5140'); glass.addColorStop(1, '#bd965d');
  panel(c, glass, [[-27, -5.5], [-19, -11.5], [-5, -11.5], [2, -9], [11, -4.5]]);
  line(c, '#d8c09a', .6, [[-24, -5.8], [-18.5, -10.5], [-5.5, -10.5]]);
  line(c, '#26333c', .7, [[-15, -11], [-17, -5]]);
  // White hood, angular side facets, and black carbon sill/diffuser.
  panel(c, '#f0f3ed', [[13, -3.8], [32, -1.5], [38, 1.5], [16, .5], [7, -1.5]]);
  panel(c, blendColor('#b9c8cb', '#809cac', night), [[-38, 0], [-17, -1], [11, 3], [37, 2.5], [34, 8], [-36, 8]]);
  panel(c, '#273b46', [[-38, 6.5], [-29, 8], [27, 8], [38, 6], [38, 10.5], [-36, 10.5]]);
  panel(c, '#30434e', [[37, 2.5], [39, 2.4], [38, 9.5], [34.5, 9.5], [35, 6]]);
  line(c, '#eef5ed', .75, [[-36, -3.4], [-25, -4], [-16, -2.5], [12, 1.5], [36, 1.8]]);
  line(c, '#738b96', .65, [[-9, -3], [-11, 5.5], [12, 6.5], [15, 2.5]]);
  line(c, '#354c58', .8, [[-5, -.5], [-1.5, -.5]]);
  // A slim rear aero lip; it does not grow beyond the original body envelope.
  panel(c, '#334651', [[-38, -6], [-26, -6], [-24, -4.5], [-38, -4.5]]);
  line(c, '#dce4df', .6, [[-37.5, -6], [-26, -6]]);
  wheel(c, -25); wheel(c, 25);
  // Hidden front lamp reads as a narrow luminous edge in side profile.
  line(c, '#f6ffef', 1.3, [[32, .1], [38.5, 1.8]]);
  line(c, '#fa6d5d', 1.4, [[-38.5, -2], [-33, -2]]);
  c.fillStyle = '#d6a75b'; c.fillRect(16, -.3, 2.4, .9);
  if (scene.lights > 0) {
    glow(c, 38, 2, 18, '#f9e7a9', scene.lights * .7);
    glow(c, -37, -2, 9, '#f19162', scene.lights * .6);
    c.save(); c.globalAlpha = scene.lights;
    const beam = c.createLinearGradient(40, 2, 115, 2);
    beam.addColorStop(0, '#fbe7ae22'); beam.addColorStop(1, '#fbe7ae00');
    panel(c, beam, [[39, 1], [115, -7], [115, 19], [39, 5]]); c.restore();
  }
  c.restore();
}
