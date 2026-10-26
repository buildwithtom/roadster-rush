import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, WORLD } from '../js/game.js';
import { createEncounter, OBSTACLE_TYPES, obstacleShape, partBounds, hitsObstacle, intersectsPart, difficultyAt } from '../js/obstacles.js';

for(const [index,kind] of OBSTACLE_TYPES.entries()) {
  test(`${kind}: solid shapes fit the encounter, stay below the sky and leave a reachable cruise corridor`,()=>{
    for(const roll of [0,.5,1]){
      const o={...createEncounter(index,roll,1),x:300};
      for(const p of obstacleShape(o).parts){
        const b=partBounds(p);
        assert.ok(b.width>0&&b.height>0);
        assert.ok(b.x>=0&&b.x+b.width<=o.width+.001);
        assert.ok(b.y>=70&&b.y+b.height<=WORLD.floor+.001);
      }
      // A thrust rises about 61 units. This band includes that entire motion
      // plus the car's collision height, and is shared across all templates.
      assert.equal(hitsObstacle({x:300,y:258,width:o.width,height:97},o),false);
    }
  });
  test(`${kind}: visible solids cause collision and passing scores once`,()=>{
    const o={...createEncounter(index,.5),x:240,passed:false};
    const p=partBounds(obstacleShape(o).parts[0]);
    const g=new Game();g.flap();g.car.x=o.x+p.x;g.car.y=p.y+2;g.car.velocity=0;g.obstacles=[o];g.update(1/120);
    assert.equal(g.state,'over');
    const run=new Game();run.flap();run.car.y=240;run.car.velocity=0;
    run.obstacles=[{...o,x:run.car.x-o.width-2,passed:false}];run.update(1/120);
    assert.equal(run.score,1);run.update(1/120);assert.equal(run.score,1);
  });
}
test('rickshaw and cow keep natural fixed sizes; bus is taller and longer',()=>{
  const bounds=kind=>obstacleShape({kind}).parts.map(partBounds);
  const top=kind=>Math.min(...bounds(kind).map(b=>b.y));
  assert.ok(top('bus')<top('rickshaw'));assert.ok(top('rickshaw')<top('cow'));
  assert.ok(474-top('cow')<55);
  assert.ok(bounds('cow').every(b=>b.y>=420));
  assert.ok(createEncounter(3).width>createEncounter(0).width);
  assert.ok(!obstacleShape({kind:'cow'}).parts.some(p=>p.material==='rubble'));
});
test('rounded cow contours and sloped bus nose have no rectangular ghost collisions',()=>{
  assert.equal(hitsObstacle({x:8,y:435,width:4,height:4},{x:0,kind:'cow'}),false);
  assert.equal(hitsObstacle({x:168,y:380,width:4,height:4},{x:0,kind:'bus'}),false);
  assert.equal(hitsObstacle({x:168,y:440,width:3,height:3},{x:0,kind:'bus'}),true);
});
test('rickshaw canopy, windscreen, step and wheels collide while its doorway and sloping corners stay open',()=>{
  const auto={...createEncounter(0),x:0};
  assert.equal(auto.width,105);
  const bounds=obstacleShape(auto).parts.map(partBounds);
  assert.equal(Math.min(...bounds.map(b=>b.y)),397);
  assert.equal(Math.max(...bounds.map(b=>b.y+b.height)),474);
  for(const [x,y]of [[30,402],[80,425],[40,454],[90,464],[98,456]]) {
    assert.equal(hitsObstacle({x,y,width:2,height:2},auto),true,`solid at ${x},${y}`);
  }
  for(const [x,y]of [[40,420],[40,442],[3,398],[99,432],[50,465]]) {
    assert.equal(hitsObstacle({x,y,width:3,height:3},auto),false,`empty at ${x},${y}`);
  }
});
test('polygon and ellipse collision reject empty corners and touching edges',()=>{
  const e={shape:'ellipse',x:10,y:10,rx:10,ry:10};
  assert.equal(intersectsPart({x:0,y:0,width:2,height:2},e),false);
  assert.equal(intersectsPart({x:8,y:8,width:2,height:2},e),true);
  const p={shape:'poly',points:[[0,0],[20,0],[0,20]]};
  assert.equal(intersectsPart({x:15,y:15,width:4,height:4},p),false);
  assert.equal(intersectsPart({x:2,y:2,width:4,height:4},p),true);
  assert.equal(intersectsPart({x:20,y:0,width:4,height:4},p),false);
});
test('retry resets difficulty, bird frequency and the ground sequence; pause preserves layouts',()=>{
  const g=new Game(()=>.5);for(let i=0;i<4;i++)g.spawn();
  assert.deepEqual(g.obstacles.filter(o=>o.kind!=='crow').map(o=>o.kind),OBSTACLE_TYPES.slice(0,4));
  assert.equal(g.obstacles.filter(o=>o.kind==='crow').length,1);
  g.flap();g.pause();const snapshot=JSON.stringify(g.obstacles);g.update(1);assert.equal(JSON.stringify(g.obstacles),snapshot);
  g.elapsed=120;g.reset();g.spawn();assert.equal(g.elapsed,0);assert.equal(g.obstacles.length,1);assert.equal(g.obstacles[0].kind,'rickshaw');
});

test('crow animation stays in its announced sky lane through every wing phase',()=>{
  for(const roll of [0,.5,1])for(let frame=0;frame<120;frame++){
    const o={...createEncounter(4,roll,1),x:0,age:frame/30};
    assert.equal(o.kind,'crow');
    for(const p of obstacleShape(o).parts){const b=partBounds(p);assert.ok(b.y>=70&&b.y+b.height<258);}
    assert.equal(hitsObstacle({x:0,y:258,width:64,height:97},o),false);
  }
});
test('crows approach faster, freeze fully on pause and resume from the same pose',()=>{
  const g=new Game();g.flap();g.car.velocity=0;
  const crow={...createEncounter(4),x:800,passed:false};g.obstacles=[crow];
  g.update(.05);assert.equal(crow.x,788);assert.equal(crow.age,.05);
  g.pause();const snapshot=JSON.stringify(crow);g.update(.5);assert.equal(JSON.stringify(crow),snapshot);
  g.resume();g.update(.05);assert.equal(crow.x,776);assert.equal(crow.age,.1);
});
test('every polygon remains convex so the shared collision solver stays valid',()=>{
  for(let index=0;index<OBSTACLE_TYPES.length;index++)for(let phase=0;phase<12;phase++){
    const o={...createEncounter(index),age:phase/10};
    for(const p of obstacleShape(o).parts.filter(p=>p.shape==='poly')){
      const turns=p.points.map((a,i)=>{
        const b=p.points[(i+1)%p.points.length],c=p.points[(i+2)%p.points.length];
        return (b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);
      }).filter(v=>Math.abs(v)>.00001);
      assert.ok(turns.every(v=>v>0)||turns.every(v=>v<0),`convex polygon for ${o.kind}`);
    }
  }
});

test('difficulty tightens spacing and increases bird frequency gradually, with hard caps',()=>{
  const stages=[0,15,30,45,60,75,90,180].map(difficultyAt);
  for(let i=1;i<stages.length;i++){
    assert.ok(stages[i].spacing<=stages[i-1].spacing);
    assert.ok(stages[i].birdEvery<=stages[i-1].birdEvery);
    assert.ok(stages[i].birdSpeed>=stages[i-1].birdSpeed);
  }
  assert.equal(stages[0].birdEvery,3);assert.equal(stages[2].birdEvery,2);assert.equal(stages[4].birdEvery,1);
  assert.equal(stages[0].flock,false);assert.equal(stages[5].flock,true);
  assert.deepEqual(difficultyAt(90),difficultyAt(10000));
  assert.equal(stages.at(-1).spacing,300);assert.equal(stages.at(-1).birdSpeed,270);
});
test('late runs have more birds, occasional pairs and a broader range of heights',()=>{
  const wave=seconds=>{
    const g=new Game(()=>.9);g.elapsed=seconds;
    for(let i=0;i<12;i++)g.spawn();
    return g.obstacles;
  };
  const early=wave(0),middle=wave(45),late=wave(90);
  const birds=list=>list.filter(o=>o.kind==='crow');
  assert.equal(birds(early).length,4);assert.equal(birds(middle).length,6);assert.equal(birds(late).length,16);
  assert.ok(birds(late)[0].flightY>birds(early)[0].flightY+50);
  assert.ok(late.every(o=>['rickshaw','bus','cart','cow','crow'].includes(o.kind)));
});
test('three-minute flights remain navigable across the full difficulty ramp and random extremes',()=>{
  for(const roll of [0,.5,1]){
    const g=new Game(()=>roll);g.flap();
    for(let i=0;i<120*180&&g.state==='playing';i++){
      if(g.car.y>323&&g.car.velocity>0)g.flap();
      g.update(1/120);
    }
    assert.equal(g.state,'playing',`playable at random roll ${roll}`);
    assert.ok(g.score>100);assert.ok(g.elapsed>179);
  }
});
