import test from 'node:test';
import assert from 'node:assert/strict';
import { getViewport } from '../js/viewport.js';
import { WORLD } from '../js/game.js';

for (const [width, height] of [[390, 844], [320, 568], [844, 390], [1366, 768], [2560, 1080], [800, 300]]) {
  test(`viewport keeps ceiling, ground and car visible at ${width} × ${height}`, () => {
    const v = getViewport(width, height, 3);
    assert.equal(v.pixelWidth, width * 2);
    assert.equal(v.pixelHeight, height * 2);
    assert.ok(v.y >= 0);
    assert.ok(v.y + WORLD.height * v.scale <= v.pixelHeight + .001);
    assert.ok(v.x >= 0);
    assert.ok(v.x + 308 * v.scale < v.pixelWidth);
    if (width >= height) assert.ok(v.x + WORLD.width * v.scale <= v.pixelWidth + .001);
  });
}
