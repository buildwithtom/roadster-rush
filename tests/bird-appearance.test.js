import test from 'node:test';
import assert from 'node:assert/strict';
import { birdAppearanceAt } from '../js/themes/bird-appearance.js';
import { lightingAt } from '../js/themes/lighting.js';
import { Game } from '../js/game.js';
import { createEncounter, obstacleShape, partBounds, hitsObstacle, batWingOutline, crowPose } from '../js/obstacles.js';

const appearance=(mode)=>(elapsed,wave)=>birdAppearanceAt(lightingAt(elapsed,mode).night,wave);
const flockAt=(mode,elapsed)=>{
  const g=new Game(()=>.5,appearance(mode));g.elapsed=elapsed;g.spawned=2;g.spawn();
  return g.obstacles.filter(o=>o.kind==='crow');
};
test('daylight spawns crows; full night spawns bats for either starting choice',()=>{
  for(const [mode,day,night]of [['day',180,90],['night',90,180]]){
    assert.ok(flockAt(mode,day).every(o=>o.appearance==='crow'));
    assert.ok(flockAt(mode,night).every(o=>o.appearance==='bat'));
  }
});
test('transition mixes species progressively without using gameplay randomness',()=>{
  const count=night=>Array.from({length:100},(_,i)=>birdAppearanceAt(night,i+1)).filter(v=>v==='bat').length;
  assert.equal(count(0),0);assert.equal(count(1),100);
  assert.ok(count(.25)>=23&&count(.25)<=27);
  assert.ok(count(.5)>=48&&count(.5)<=52);
  assert.ok(count(.75)>=73&&count(.75)<=77);
  for(let wave=1;wave<100;wave++)assert.equal(birdAppearanceAt(.5,wave),birdAppearanceAt(.5,wave));
});
test('spawned birds retain their species across dawn, dusk, pause and resume',()=>{
  const g=new Game(()=>.5,appearance('day'));g.elapsed=90;g.spawned=2;g.spawn();
  const bat=g.obstacles.find(o=>o.kind==='crow');assert.equal(bat.appearance,'bat');
  g.elapsed=180;g.flap();g.car.velocity=0;g.update(.01);assert.equal(bat.appearance,'bat');
  g.spawn();const fresh=g.obstacles.filter(o=>o.kind==='crow').at(-1);assert.equal(fresh.appearance,'crow');
  g.pause();const pose=JSON.stringify(bat);g.update(10);assert.equal(JSON.stringify(bat),pose);
  g.resume();g.update(.01);assert.equal(bat.appearance,'bat');
  g.reset();g.spawned=2;g.spawn();assert.ok(g.obstacles.filter(o=>o.kind==='crow').every(o=>o.appearance==='crow'));
});
test('species selection changes no random draws, speed, frequency, or flight path',()=>{
  const run=skin=>{
    let draws=0;const g=new Game(()=>{draws++;return .7;},()=>skin);g.flap();
    for(let i=0;i<120*120;i++){
      if(g.car.y>323&&g.car.velocity>0)g.flap();g.update(1/120);
    }
    return {draws,state:g.state,score:g.score,distance:g.distance,car:g.car,obstacles:g.obstacles.map(({appearance,...o})=>o)};
  };
  const crows=run('crow'),bats=run('bat');assert.equal(crows.state,'playing');assert.deepEqual(crows,bats);
});
const bounds=parts=>{
  const boxes=parts.map(partBounds);
  return {left:Math.min(...boxes.map(b=>b.x)),right:Math.max(...boxes.map(b=>b.x+b.width)),top:Math.min(...boxes.map(b=>b.y)),bottom:Math.max(...boxes.map(b=>b.y+b.height))};
};
test('spread bat wings keep the same horizontal envelope and safe route through a full flap cycle',()=>{
  for(const roll of [0,.5,1])for(let frame=0;frame<180;frame++){
    const crow={...createEncounter(4,roll,1),x:0,age:frame/60,appearance:'crow'};
    const bat={...crow,appearance:'bat'};
    const outlineBounds=bounds(obstacleShape(bat).parts);
    assert.equal(outlineBounds.left,3);assert.equal(outlineBounds.right,62);
    assert.ok(outlineBounds.top>=crowPose(bat).y-31);
    assert.ok(outlineBounds.bottom<=crowPose(bat).y+9);
    assert.equal(hitsObstacle({x:0,y:258,width:64,height:97},bat),false);
    const body=partBounds(obstacleShape(bat).parts.find(p=>p.material==='bat'));
    assert.equal(hitsObstacle({x:body.x+4,y:body.y+2,width:6,height:6},bat),true);
    for(const p of obstacleShape(bat).parts.filter(p=>p.shape==='poly')){
      // Bat membrane pieces are triangles, so the convex collision solver applies.
      assert.ok(p.points.length===3||p.material==='batMembrane');
    }
  }
});

test('scalloped wing triangulation preserves area without filling the cutouts',()=>{
  const area=points=>Math.abs(points.reduce((sum,a,i)=>{const b=points[(i+1)%points.length];return sum+a[0]*b[1]-a[1]*b[0];},0))/2;
  for(let frame=0;frame<120;frame++){
    const o={...createEncounter(4),appearance:'bat',age:frame/60};
    const parts=obstacleShape(o).parts.filter(p=>p.material==='batMembrane');
    const triangles=parts.reduce((sum,p)=>sum+area(p.points),0);
    assert.ok(parts.every(p=>p.points.length===3));
    assert.ok(Math.abs(triangles-2*area(batWingOutline(o)))<1e-6);
  }
  const o={...createEncounter(4),appearance:'bat',x:0,age:Math.PI*1.5/10};
  const {y}=crowPose(o);
  assert.equal(hitsObstacle({x:56,y:y-1,width:.2,height:.2},o),false);
  assert.equal(hitsObstacle({x:9,y:y-1,width:.2,height:.2},o),false);
});
