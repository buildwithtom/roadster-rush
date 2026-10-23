import { WORLD } from './game.js';

// Keep the complete vertical play area visible, including in short landscape
// windows. Portrait uses a closer horizontal camera without changing physics.
export function getViewport(width, height, dpr = 1) {
  const pixelRatio = Math.min(Math.max(dpr, 1), 2);
  const pixelWidth = Math.max(1, Math.round(width * pixelRatio));
  const pixelHeight = Math.max(1, Math.round(height * pixelRatio));
  const viewWidth = width < height ? 600 : WORLD.width;
  const scale = Math.min(pixelWidth / viewWidth, pixelHeight / WORLD.height);
  const extra = Math.max(0, pixelHeight / scale - WORLD.height);
  return {
    pixelWidth, pixelHeight, scale, extra,
    x: (pixelWidth - viewWidth * scale) / 2,
    y: extra * .5 * scale,
  };
}
