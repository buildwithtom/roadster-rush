import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, WORLD } from '../js/game.js';
import { MARS_FLIGHT } from '../js/physics.js';
import { createEncounter, obstacleShape, partBounds, hitsObstacle } from '../js/obstacles.js';
import { createMarsEncounter, marsLightingAt, marsWeatherScene } from '../js/themes/mars.js';
import { getTheme } from '../js/themes/index.js';

test('theme registry defaults safely and keeps weather and artwork specific to each world', () => {
  assert.equal(getTheme('mars').name,'Mars');
  for(const id of ['indian-streets','missing','__proto__',undefined])assert.equal(getTheme(id).id,'indian-streets');
  assert.deepEqual(getTheme('mars').weatherModes.map(mode=>mode.value),['clear','dust']);
  assert.deepEqual(getTheme('indian-streets').weatherModes.map(mode=>mode.value),['clear','rain']);
  assert.equal(getTheme('mars').car,getTheme('indian-streets').car);
});

test('ordinary Mars encounters retain dimensions; variants preserve spawn timing and movement', () => {
  for(let i=0;i<5;i++)for(const roll of [0,.5,1])for(const progress of [0,.5,1]) {
    const {environment,...mars}=createMarsEncounter(i,roll,progress);
    assert.equal(environment,'mars');assert.deepEqual(mars,createEncounter(i,roll,progress));
  }
  let indianDraws=0,marsDraws=0;
  const indian=new Game(()=>{indianDraws++;return .5;});
  const martian=new Game(()=>{marsDraws++;return .5;},undefined,createMarsEncounter,MARS_FLIGHT);
  for(const elapsed of [0,30,60,90]) {
    indian.elapsed=martian.elapsed=elapsed;
    for(let i=0;i<12;i++){indian.spawn();martian.spawn();}
  }
  assert.equal(indianDraws,marsDraws);
  assert.deepEqual(martian.obstacles.map(({environment,...o})=>o.kind==='starship'?{...o,kind:'bus',width:174}:o),indian.obstacles);
});

test('all Mars solids fit their encounter and leave the complete cruise corridor clear', () => {
  for(let i=0;i<5;i++)for(const roll of [0,.5,1])for(let frame=0;frame<30;frame++) {
    const o={...createMarsEncounter(i,roll,1),x:300,age:frame/10};
    const parts=obstacleShape(o).parts;assert.ok(parts.length>0);
    for(const p of parts) {
      const b=partBounds(p);
      assert.ok(b.width>0&&b.height>0);
      assert.ok(b.x>=0&&b.x+b.width<=o.width,`${o.kind} horizontal bounds`);
      assert.ok(b.y>=70&&b.y+b.height<=WORLD.floor,`${o.kind} vertical bounds`);
      if(p.shape==='poly') {
        const turns=p.points.map((a,j)=>{
          const b=p.points[(j+1)%p.points.length],d=p.points[(j+2)%p.points.length];
          return (b[0]-a[0])*(d[1]-b[1])-(b[1]-a[1])*(d[0]-b[0]);
        }).filter(t=>Math.abs(t)>1e-7);
        assert.ok(turns.every(t=>t>0)||turns.every(t=>t<0),`${o.kind} polygon must be convex`);
      }
    }
    assert.equal(hitsObstacle({x:300,y:258,width:o.width,height:97},o),false);
  }
});

test('Mars rocks and drones collide with visible solids and preserve empty corners', () => {
  const rock={...createMarsEncounter(2),x:0};
  assert.equal(hitsObstacle({x:40,y:445,width:4,height:4},rock),true);
  assert.equal(hitsObstacle({x:5,y:424,width:4,height:4},rock),false);
  const drone={...createMarsEncounter(4),x:0,flightY:150,age:0};
  assert.equal(hitsObstacle({x:30,y:148,width:4,height:4},drone),true);
  assert.equal(hitsObstacle({x:15,y:155,width:3,height:3},drone),false);
  for(let i=0;i<5;i++) {
    const o={...createMarsEncounter(i),x:240};
    const first=obstacleShape(o).parts[0],b=partBounds(first);
    const x=first.shape==='poly'?first.points.reduce((sum,p)=>sum+p[0],0)/first.points.length:b.x+b.width/2;
    const y=first.shape==='poly'?first.points.reduce((sum,p)=>sum+p[1],0)/first.points.length:b.y+b.height/2;
    assert.equal(hitsObstacle({x:240+x-1,y:y-1,width:2,height:2},o),true);
    const collision=new Game(undefined,undefined,createMarsEncounter,MARS_FLIGHT);collision.flap();
    collision.car.x=240+x-20;collision.car.y=y-12;collision.car.velocity=0;collision.obstacles=[o];
    collision.update(1/120);assert.equal(collision.state,'over',`${o.kind} ends the flight on contact`);
    const g=new Game(undefined,undefined,createMarsEncounter,MARS_FLIGHT);g.flap();g.car.y=280;g.car.velocity=0;
    g.obstacles=[{...o,x:g.car.x-o.width-2,passed:false}];g.update(1/120);
    assert.equal(g.score,1);g.update(1/120);assert.equal(g.score,1);
  }
});

test('Mars day/night and dust follow active time, freeze on pause and restart on Retry', () => {
  for(const start of ['day','night']) {
    assert.deepEqual(marsLightingAt(180,start),marsLightingAt(0,start));
    assert.equal(marsLightingAt(90,start).night,start==='day'?1:0);
    const base=marsLightingAt(75,start),snapshot={...base};
    const dust=marsWeatherScene(base,'dust',75);
    assert.deepEqual(base,snapshot);assert.equal(dust.night,base.night);assert.equal(dust.rain,0);assert.equal(dust.dust,1);
    assert.equal(marsWeatherScene(base,'rain',75).dust,0);
  }
  const game=new Game(undefined,undefined,createMarsEncounter,MARS_FLIGHT);
  const scene=()=>marsWeatherScene(marsLightingAt(game.elapsed),'dust',game.elapsed);
  const initial=scene();game.flap();game.update(.05);game.pause();const paused=scene();
  assert.notDeepEqual(paused,initial);game.update(5);assert.deepEqual(scene(),paused);
  game.resume();game.update(.05);assert.notDeepEqual(scene(),paused);
  game.state='over';const over=scene();game.update(5);assert.deepEqual(scene(),over);
  game.reset();assert.deepEqual(scene(),initial);
});

test('three-minute Mars flights remain navigable across random extremes; reset retains the encounter factory', () => {
  for(const roll of [0,.5,1]) {
    let starships=0;
    const factory=(...args)=>{const o=createMarsEncounter(...args);if(o.kind==='starship')starships++;return o;};
    const g=new Game(()=>roll,undefined,factory,MARS_FLIGHT);g.flap();
    for(let i=0;i<120*180&&g.state==='playing';i++) {
      if(g.car.y>323&&g.car.velocity>0)g.flap();
      g.update(1/120);
    }
    assert.equal(g.state,'playing',`Mars navigable at roll ${roll}`);assert.ok(g.score>100);
    assert.ok(g.obstacles.every(o=>o.environment==='mars'));
    assert.ok(starships>=5,'long flights encounter several Starships');
    g.reset();g.spawn();assert.equal(g.obstacles[0].environment,'mars');assert.equal(g.elapsed,0);
  }
});
