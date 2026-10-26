import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, WORLD } from '../js/game.js';
import { MARS_FLIGHT } from '../js/physics.js';
import { createMarsEncounter } from '../js/themes/mars.js';
import { obstacleShape, hitsObstacle, partBounds } from '../js/obstacles.js';

test('landed Starships appear every eighth Mars wave without adding waves or random draws',()=>{
  let draws=0;
  const g=new Game(()=>{draws++;return .5;},undefined,createMarsEncounter,MARS_FLIGHT);
  for(let i=0;i<24;i++)g.spawn();
  const ground=g.obstacles.filter(o=>o.kind!=='crow');
  assert.equal(ground.length,24);
  assert.deepEqual(ground.flatMap((o,i)=>o.kind==='starship'?[i+1]:[]),[8,16,24]);
  assert.equal(ground[3].kind,'bus');assert.equal(ground[11].kind,'bus');
  assert.equal(draws,24+8);assert.equal(g.obstacles.filter(o=>o.kind==='crow').length,8);
  for(const o of ground.filter(o=>o.kind==='starship')) {
    assert.equal(o.environment,'mars');assert.equal(o.speed,190);assert.equal(o.width,72);assert.equal(o.routeY,323);
  }
  // Retry starts the original sequence, and the first ship returns on wave 8.
  g.reset();for(let i=0;i<7;i++)g.spawn();assert.ok(!g.obstacles.some(o=>o.kind==='starship'));
  g.spawn();assert.equal(g.obstacles.filter(o=>o.kind==='starship').length,1);
  const earth=new Game(()=>.5);for(let i=0;i<24;i++)earth.spawn();
  assert.ok(!earth.obstacles.some(o=>o.kind==='starship'));
});

test('Starship solids leave the full low-gravity cruise corridor clear and stay within their visible envelope',()=>{
  const o={...createMarsEncounter(3,.5,1,8),x:300};
  const parts=obstacleShape(o).parts;assert.ok(parts.length>5);
  for(const p of parts) {
    const b=partBounds(p);
    assert.ok(b.x>=0&&b.x+b.width<=o.width);
    assert.ok(b.y>=356&&b.y+b.height<=WORLD.floor);
    if(p.shape==='poly') {
      const turns=p.points.map((a,i)=>{
        const b=p.points[(i+1)%p.points.length],d=p.points[(i+2)%p.points.length];
        return (b[0]-a[0])*(d[1]-b[1])-(b[1]-a[1])*(d[0]-b[0]);
      }).filter(t=>Math.abs(t)>1e-7);
      assert.ok(turns.every(t=>t>0)||turns.every(t=>t<0),'collision polygons remain convex');
    }
  }
  assert.equal(hitsObstacle({x:300,y:258,width:72,height:97},o),false);
});

test('Starship nose and fins collide while their empty corners remain clear',()=>{
  const o={...createMarsEncounter(3,.5,0,8),x:0};
  const hit=(x,y,w=2,h=2)=>hitsObstacle({x,y,width:w,height:h},o);
  assert.equal(hit(35,359),true);assert.equal(hit(32,412),true);assert.equal(hit(17,453),true);
  assert.equal(hit(25,357),false);assert.equal(hit(12,427),false);assert.equal(hit(5,420),false);
  assert.equal(hit(31,470),false);
  const g=new Game(()=>.5,undefined,createMarsEncounter,MARS_FLIGHT);g.flap();g.car.y=395;
  g.obstacles=[{...o,x:240,passed:false}];g.update(1/120);assert.equal(g.state,'over');
});

test('passing a landed Starship scores once; pause freezes it and preserves Mars flight tuning',()=>{
  const g=new Game(()=>.5,undefined,createMarsEncounter,MARS_FLIGHT);g.flap();g.car.y=280;g.car.velocity=0;
  g.obstacles=[{...createMarsEncounter(3,.5,0,8),x:800,passed:false}];g.update(.05);g.pause();
  const snapshot=JSON.stringify(g);g.update(5);assert.equal(JSON.stringify(g),snapshot);
  g.resume();g.obstacles[0].x=g.car.x-74;g.update(1/120);assert.equal(g.score,1);
  g.update(1/120);assert.equal(g.score,1);assert.equal(g.rules,MARS_FLIGHT);
});
