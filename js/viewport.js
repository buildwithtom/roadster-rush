import { WORLD } from './game.js';
import { portraitRoadHeight, PORTRAIT_CAMERA } from './playfield.js';

// Keep the complete vertical play area visible, including in short landscape
// windows. Portrait uses a closer horizontal camera without changing physics.
export function getViewport(width, height, dpr = 1, playfield, topInset = PORTRAIT_CAMERA.hudInset) {
  const pixelRatio = Math.min(Math.max(dpr, 1), 2);
  const pixelWidth = Math.max(1, Math.round(width * pixelRatio));
  const pixelHeight = Math.max(1, Math.round(height * pixelRatio));
  if (playfield?.portrait) {
    const portrait = width < height;
    const viewWidth = portrait ? PORTRAIT_CAMERA.viewWidth : WORLD.width;
    const viewLeft = portrait ? 230 - viewWidth * PORTRAIT_CAMERA.carPosition : 0;
    const road = portraitRoadHeight(height) * pixelRatio;
    const scale = Math.min(pixelWidth / viewWidth,
      Math.max(1, pixelHeight - topInset * pixelRatio - road) / (playfield.floor - playfield.ceiling));
    const x = (pixelWidth - viewWidth * scale) / 2 - viewLeft * scale;
    const y = pixelHeight - road - playfield.floor * scale;
    const visibleLeft = Math.max(0, -x / scale);
    return {
      pixelWidth, pixelHeight, scale, x, y,
      viewLeft: visibleLeft, viewWidth: Math.min(WORLD.width - visibleLeft, pixelWidth / scale),
      extra: Math.max(0, (pixelHeight - y) / scale - WORLD.height),
    };
  }
  const viewWidth = width < height ? 600 : WORLD.width;
  const scale = Math.min(pixelWidth / viewWidth, pixelHeight / WORLD.height);
  const extra = Math.max(0, pixelHeight / scale - WORLD.height);
  return {
    pixelWidth, pixelHeight, scale, extra,
    x: (pixelWidth - viewWidth * scale) / 2,
    y: extra * .5 * scale,
  };
}
