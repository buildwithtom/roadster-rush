// Ground art and its collision silhouettes stay at the original road level.
// Portrait opens real flying space above it without stretching any sprites.
export const STANDARD_PLAYFIELD = Object.freeze({ ceiling: 0, floor: 474, startY: 230, portrait: false });
export const PORTRAIT_CAMERA = Object.freeze({ viewWidth: 600 / 1.18, carPosition: .25, hudInset: 112 });
export const portraitRoadHeight = height => Math.max(64, Math.min(160, height * .15));

export function createPlayfield(width, height, topInset = PORTRAIT_CAMERA.hudInset) {
  if (width >= height) return STANDARD_PLAYFIELD;
  const scale = width / PORTRAIT_CAMERA.viewWidth;
  const available = Math.max(1, height - topInset - portraitRoadHeight(height));
  const ceiling = Math.min(0, STANDARD_PLAYFIELD.floor - available / scale);
  return Object.freeze({
    ceiling, floor: STANDARD_PLAYFIELD.floor, portrait: true,
    startY: (ceiling + STANDARD_PLAYFIELD.floor) / 2 - 15,
  });
}

export function flightLane(y, playfield, wave = 3, progress = 0) {
  if (!playfield.portrait) return y;
  // At the opening cadence, waves 3/6/9/12 visit middle, low, middle,
  // then lower-middle sky. The pattern includes occasional high passes.
  // Reuse the encounter's roll for small variation, with no extra RNG calls.
  const high = playfield.ceiling + 90;
  const middle = Math.min(.94, ((playfield.ceiling + playfield.floor) / 2 - high) / (238 - high));
  const bands = [.25, .96, .88, middle, Math.min(.94, middle + .08)];
  const p = Math.max(0, Math.min(1, progress));
  const roll = Math.max(0, Math.min(1, (y - 110) / (56 + 72 * p)));
  const fraction = Math.max(0, Math.min(1, bands[wave % bands.length] + (roll - .5) * (.08 + .04 * p)));
  // Stop at the existing lowest lane, preserving room for a complete thrust
  // arc above the tallest ground hazard. Birds never change lanes in flight.
  return high + (238 - high) * fraction;
}

export function skyY(scene, y) {
  const ceiling = scene.ceiling ?? 0;
  if (!ceiling) return y;
  return ceiling + y / STANDARD_PLAYFIELD.floor * (STANDARD_PLAYFIELD.floor - ceiling);
}
