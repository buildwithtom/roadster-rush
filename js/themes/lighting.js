// Visual state depends only on active simulation time; pause/retry therefore
// need no separate lighting clock. No lighting function touches game rules.
const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const t=clamp(value); return t*t*(3-2*t); };
export function blendColor(from, to, amount) {
  const t=clamp(amount);
  const a=from.slice(1).match(/../g).map(v=>parseInt(v,16));
  const b=to.slice(1).match(/../g).map(v=>parseInt(v,16));
  return '#'+a.map((v,i)=>Math.round(v+(b[i]-v)*t).toString(16).padStart(2,'0')).join('');
}
// One cycle: day 60s, sunset 30s, night 60s, dawn 30s. Starting
// at night offsets the same cycle by half a period, including its initial hold.
export const LIGHT_CYCLE = Object.freeze({ hold:60, transition:30, half:90, period:180 });
export function lightingAt(seconds=0, startingMode='day') {
  const time=Number.isFinite(seconds)?Math.max(0,seconds):0;
  const phase=(time+(startingMode==='night'?LIGHT_CYCLE.half:0))%LIGHT_CYCLE.period;
  const progress=phase<60?0:phase<90?(phase-60)/30:phase<150?1:1-(phase-150)/30;
  const sunset=smooth(progress*2);
  const night=smooth((progress-.35)/.65);
  const lights=smooth((progress-.18)/.6);
  return {
    progress, night, lights,
    skyTop:blendColor(blendColor('#f4dcb6','#bd7f78',sunset),'#172c47',night),
    skyBottom:blendColor(blendColor('#f3e7c9','#efb581',sunset),'#56667b',night),
    cloud:blendColor('#f8efd3','#8395aa',night),
    sunAlpha:1-smooth(progress*1.8), sunY:112+sunset*340,
    moonAlpha:smooth((progress-.42)/.58), moonY:190-night*88,
  };
}
export function glow(c,x,y,radius,color,alpha=1) {
  c.save();c.globalAlpha*=alpha;
  const g=c.createRadialGradient(x,y,0,x,y,radius);
  g.addColorStop(0,color+'7a');g.addColorStop(.3,color+'25');g.addColorStop(1,color+'00');
  c.fillStyle=g;c.fillRect(x-radius,y-radius,radius*2,radius*2);c.restore();
}
export function tintRoad(c,top,height,scene) {
  if(!scene?.night)return;
  c.save();c.globalAlpha=scene.night*.65;c.fillStyle='#10263e';c.fillRect(0,top,960,height);c.restore();
}
