import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, RULES, WORLD } from '../js/game.js';
import { EARTH_FLIGHT, MARS_FLIGHT } from '../js/physics.js';
import { createMarsEncounter } from '../js/themes/mars.js';
import { difficultyAt } from '../js/obstacles.js';

const step=1/120;
function newFlight(profile) {
  const g=new Game(()=>.5,undefined,createMarsEncounter,profile);
  g.car.y=300;g.flap();g.nextObstacle=Infinity;
  return g;
}
function measureArc(profile) {
  const g=newFlight(profile),start=g.car.y;
  let top=start,apexTime=0;
  while(g.elapsed<2&&g.state==='playing') {
    g.update(step);
    if(g.car.y<top){top=g.car.y;apexTime=g.elapsed;}
    if(g.car.y>=start)return {rise:start-top,apexTime,duration:g.elapsed};
  }
  assert.fail('A single thrust must return to its initial altitude safely');
}

test('Mars gravity is 38% of the unchanged Earth profile, with softer thrust and the same scenery speed',()=>{
  assert.equal(RULES,EARTH_FLIGHT);
  assert.equal(EARTH_FLIGHT.gravity,920);assert.equal(EARTH_FLIGHT.impulse,-335);assert.equal(EARTH_FLIGHT.speed,190);
  assert.ok(Math.abs(MARS_FLIGHT.gravity/EARTH_FLIGHT.gravity-.38)<1e-12);
  assert.ok(Math.abs(MARS_FLIGHT.impulse)<Math.abs(EARTH_FLIGHT.impulse));
  assert.equal(MARS_FLIGHT.speed,EARTH_FLIGHT.speed);
  const fall=profile=>{
    const g=newFlight(profile);g.car.y=100;g.car.velocity=0;
    for(let i=0;i<48;i++)g.update(step);
    return g.car.y-100;
  };
  assert.ok(Math.abs(fall(MARS_FLIGHT)/fall(EARTH_FLIGHT)-.38)<1e-10);
});

test('Mars gives a longer rise and fall while preserving lift height inside the safe corridor',()=>{
  const earth=measureArc(EARTH_FLIGHT),mars=measureArc(MARS_FLIGHT);
  assert.ok(mars.duration/earth.duration>1.58&&mars.duration/earth.duration<1.67);
  assert.ok(mars.apexTime/earth.apexTime>1.58&&mars.apexTime/earth.apexTime<1.67);
  assert.ok(earth.rise>58&&earth.rise<63);
  assert.ok(Math.abs(mars.rise-earth.rise)<1);
});

test('Mars waves have extra spacing throughout the progression without changing initial reaction distance',()=>{
  for(const elapsed of [0,30,60,90,180]) {
    const earth=new Game(()=>.5),mars=new Game(()=>.5,undefined,createMarsEncounter,MARS_FLIGHT);
    for(const g of [earth,mars]) {g.flap();g.elapsed=elapsed;g.distance=499;g.update(step);}
    assert.equal(earth.obstacles.filter(o=>o.kind!=='crow').length,1);
    assert.equal(mars.obstacles.length,earth.obstacles.length);
    assert.ok(Math.abs((mars.nextObstacle-500)/(earth.nextObstacle-500)-1.3)<1e-12);
    assert.ok(Math.abs(mars.nextObstacle-500-difficultyAt(elapsed+step).spacing*1.3)<1e-10);
  }
});

test('pause preserves low-gravity motion and repeated taps use the softer impulse',()=>{
  const g=newFlight(MARS_FLIGHT);for(let i=0;i<24;i++)g.update(step);
  g.pause();const snapshot=JSON.stringify(g);
  g.flap();g.update(10);assert.equal(JSON.stringify(g),snapshot);
  g.resume();g.update(step);assert.notEqual(JSON.stringify(g),snapshot);
  g.flap();assert.equal(g.car.velocity,MARS_FLIGHT.impulse);assert.equal(g.car.thrust,.19);
  g.update(step);g.flap();assert.equal(g.car.velocity,MARS_FLIGHT.impulse);
});

test('Retry retains Mars physics and a new Earth run fully restores Earth physics and spacing',()=>{
  const g=newFlight(MARS_FLIGHT);g.score=14;g.distance=900;g.state='over';g.reset();
  assert.equal(g.rules,MARS_FLIGHT);assert.equal(g.elapsed,0);assert.equal(g.score,0);assert.equal(g.nextObstacle,500);
  g.flap();assert.equal(g.car.velocity,MARS_FLIGHT.impulse);
  g.reset(EARTH_FLIGHT);assert.equal(g.rules,EARTH_FLIGHT);g.flap();assert.equal(g.car.velocity,-335);
  g.distance=499;g.update(step);assert.ok(g.nextObstacle>939&&g.nextObstacle<=940);
  g.reset(MARS_FLIGHT);g.flap();assert.equal(g.car.velocity,MARS_FLIGHT.impulse);
});

test('Mars still ends unattended flights and respects the original ceiling, floor and hitbox',()=>{
  const g=newFlight(MARS_FLIGHT);
  for(let i=0;i<120*4;i++)g.update(step);
  assert.equal(g.state,'over');const snapshot=JSON.stringify(g);g.update(5);assert.equal(JSON.stringify(g),snapshot);
  for(const y of [-4,WORLD.floor-10]) {
    const run=newFlight(MARS_FLIGHT);run.car.y=y;run.update(step);assert.equal(run.state,'over');
  }
  const earth=new Game(),mars=newFlight(MARS_FLIGHT);mars.car.x=earth.car.x;mars.car.y=earth.car.y;
  assert.deepEqual(mars.hitbox(),earth.hitbox());
});
