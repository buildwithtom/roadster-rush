import test from 'node:test';
import assert from 'node:assert/strict';
import { RunRewards, flightResult, drawCelebration } from '../js/rewards.js';
import { Game } from '../js/game.js';

test('milestones trigger once at 10, 25, 50, and 100 points, with confetti from 25', () => {
  const rewards = new RunRewards();
  for (const score of [10, 25, 50, 100]) {
    assert.equal(rewards.observe(score - 1), null);
    assert.equal(rewards.observe(score).score, score);
    assert.equal(rewards.burst?.kind ?? null, score === 10 ? null : 'milestone');
    assert.equal(rewards.observe(score), null);
    rewards.update(3);
    assert.equal(rewards.notice, null);
    assert.equal(rewards.burst, null);
  }
  assert.equal(rewards.observe(200), null);
});

test('score jumps show the highest crossed milestone without replaying old ones', () => {
  const rewards = new RunRewards();
  assert.equal(rewards.observe(51).score, 50);
  assert.equal(rewards.observe(52), null);
  assert.equal(rewards.observe(25), null);
  assert.equal(rewards.observe(105).score, 100);
});

test('visual timers can freeze during pause; replay resets every reward', () => {
  const rewards = new RunRewards();
  rewards.observe(25); rewards.update(.5);
  const paused = JSON.stringify(rewards);
  rewards.observe(25);
  assert.equal(JSON.stringify(rewards), paused);
  rewards.update(1.9);
  assert.equal(rewards.burst, null);
  assert.ok(rewards.notice);
  rewards.update(.5);
  assert.equal(rewards.notice, null);
  rewards.reset();
  assert.equal(rewards.observe(10).score, 10);
  assert.equal(rewards.burst, null);
});

test('only a strictly higher personal best earns the record celebration', () => {
  for (const [score, best, record] of [[0, 0, false], [10, 10, false], [9, 10, false], [1, 0, true], [11, 10, true]]) {
    const rewards = new RunRewards(); rewards.observe(25);
    assert.equal(rewards.finish(score, best).record, record);
    assert.equal(rewards.notice, null);
    assert.equal(rewards.burst?.kind ?? null, record ? 'record' : null);
  }
});

test('encouragement follows the result and never changes the game', () => {
  assert.match(flightResult(0, 20).message, /Short taps/);
  assert.match(flightResult(10, 20).message, /25 points/);
  assert.match(flightResult(50, 60).message, /100 points/);
  assert.match(flightResult(100, 120).message, /Triple digits/);
  assert.match(flightResult(61, 60).message, /by 1 point\./);
  assert.match(flightResult(62, 60).message, /by 2 points\./);
  const game = new Game(); game.flap();
  const snapshot = JSON.stringify(game);
  const rewards = new RunRewards(); rewards.observe(game.score); rewards.finish(game.score, 0); rewards.update(1);
  assert.equal(JSON.stringify(game), snapshot);
});

test('confetti uses bounded deterministic draws and clips in-flight particles to the HUD', () => {
  const operations = [];
  const ctx = new Proxy({}, { get: (_, method) => (...args) => operations.push([method, ...args]) });
  drawCelebration(ctx, { kind: 'milestone', age: 1 }, 390, 844, { x: 70, y: 100 });
  assert.equal(operations.filter(([method]) => method === 'fillRect').length, 20);
  assert.equal(operations.filter(([method]) => method === 'clip').length, 1);
  assert.equal(operations.filter(([method]) => method === 'save').length, operations.filter(([method]) => method === 'restore').length);
  const first = JSON.stringify(operations); operations.length = 0;
  drawCelebration(ctx, { kind: 'milestone', age: 1 }, 390, 844, { x: 70, y: 100 });
  assert.equal(JSON.stringify(operations), first);
  operations.length = 0;
  drawCelebration(ctx, { kind: 'record', age: 1 }, 390, 844, { x: 0, y: 0 });
  assert.equal(operations.filter(([method]) => method === 'fillRect').length, 64);
});
