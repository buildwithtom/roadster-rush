// Presentation only: rewards never write to the game or consume its randomness.
const MILESTONES = [
  { score: 10, message: 'Smooth flying!' },
  { score: 25, message: 'You’re on a roll!' },
  { score: 50, message: 'What a flight!' },
  { score: 100, message: 'Triple digits!' },
];

export function flightResult(score, best) {
  const record = score > best;
  const next = MILESTONES.find(item => item.score > score);
  const gain = score - best;
  const message = record ? `You beat your best by ${gain} ${gain === 1 ? 'point' : 'points'}.`
    : score >= 100 ? 'Triple digits. Nicely flown.'
    : score >= 10 ? `Next run: ${next.score} points?`
    : 'Short taps help you stay in control.';
  return { record, message };
}

export class RunRewards {
  constructor() { this.reset(); }
  reset() { this.reached = 0; this.notice = null; this.burst = null; }
  observe(score) {
    // If several points arrive in one frame, show the highest new milestone.
    let milestone;
    for (const item of MILESTONES) {
      if (item.score > this.reached && item.score <= score) milestone = item;
    }
    if (!milestone) return null;
    this.reached = milestone.score;
    this.notice = { ...milestone, age: 0 };
    if (milestone.score >= 25) this.burst = { kind: 'milestone', age: 0 };
    return milestone;
  }
  finish(score, best) {
    const result = flightResult(score, best);
    this.notice = null;
    this.burst = result.record ? { kind: 'record', age: 0 } : null;
    return result;
  }
  // The caller advances this clock only while visible and playing/celebrating.
  update(dt) {
    if (this.notice) {
      this.notice.age += dt;
      if (this.notice.age >= 2.8) this.notice = null;
    }
    if (this.burst) {
      this.burst.age += dt;
      if (this.burst.age >= 2.4) this.burst = null;
    }
  }
}

export function drawCelebration(ctx, burst, width, height, origin) {
  if (!burst) return;
  const record = burst.kind === 'record';
  const t = burst.age;
  const colors = ['#ffd15e', '#ed633a', '#fff0c5', '#7bb9a1'];
  ctx.save();
  // During play the entire effect is clipped to the small HUD area.
  if (!record) { ctx.beginPath(); ctx.rect(origin.x - 85, origin.y - 20, 260, 125); ctx.clip(); }
  ctx.globalAlpha = Math.min(1, (2.4 - t) * 2);
  for (let i = 0; i < (record ? 64 : 20); i++) {
    const seed = (i * .61803398875) % 1;
    const direction = i % 2 ? 1 : -1;
    const x = record ? (direction < 0 ? width * .12 : width * .88) + direction * -seed * width * .28 * t
      : origin.x + (seed - .5) * 140 * t;
    const y = (record ? height * .18 : origin.y) - (35 + (i % 7) * 10) * t + (record ? 105 : 48) * t * t;
    ctx.save(); ctx.translate(x, y); ctx.rotate(i + t * (seed * 7 - 3));
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(-3, -2, 4 + i % 4, 3 + i % 3); ctx.restore();
  }
  ctx.restore();
}
