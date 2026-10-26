import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlayfield, STANDARD_PLAYFIELD, flightLane, skyY } from '../js/playfield.js';
import { getViewport } from '../js/viewport.js';
import { Game, WORLD, RULES } from '../js/game.js';
import { getTheme } from '../js/themes/index.js';
import { obstacleShape, partBounds, hitsObstacle } from '../js/obstacles.js';

for (const [width, height] of [[320,568],[390,844],[430,932],[768,1024]]) {
  test(`portrait ${width}x${height} uses real flying space below the HUD and a taller road`, () => {
    const field = createPlayfield(width, height);
    const v = getViewport(width, height, 2, field);
    const top = (v.y + field.ceiling * v.scale) / 2;
    const floor = (v.y + field.floor * v.scale) / 2;
    assert.ok(Math.abs(top - 112) < .001);
    assert.ok(Math.abs((height - floor) / height - .15) < .001);
    assert.ok((floor - top) / height > .64 && (floor - top) / height < .75);
    assert.ok(Math.abs((v.x + 230 * v.scale) / v.pixelWidth - .25) < .001);
    assert.ok(v.viewLeft + v.viewWidth - 308 > 600 - 308, 'more approach distance than the old portrait camera');
    const approach = v.viewLeft + v.viewWidth - 308;
    assert.ok(approach / 190 > 1.5, 'ground hazards give at least 1.5 seconds of warning');
    assert.ok(approach / 270 > 1.1, 'even the fastest birds give over a second of warning');
    assert.ok(Math.abs(v.scale / (width * 2 / 600) - 1.18) < .001, 'all sprites are 18% larger without stretching');
    assert.ok(field.ceiling < 0);
    assert.equal(field.floor, WORLD.floor);
    const carCenter = (v.y + (field.startY + 15) * v.scale) / 2;
    assert.ok(Math.abs(carCenter - (top + floor) / 2) < .001);
  });
}

test('landscape playfields and viewport are identical to the existing desktop layout', () => {
  for (const [width,height] of [[844,390],[1366,768],[2560,1080],[800,300]]) {
    const field = createPlayfield(width,height);
    assert.equal(field, STANDARD_PLAYFIELD);
    assert.deepEqual(getViewport(width,height,2,field),getViewport(width,height,2));
  }
  assert.equal(skyY({},123),123);
});

test('portrait opens the upper sky, keeps exact physics and collides at its visible ceiling and road', () => {
  const field = createPlayfield(390,844);
  const game = new Game(); game.reset(RULES,field); game.flap();
  assert.equal(game.car.velocity,RULES.impulse);
  game.car.y=-100; game.car.velocity=0; game.update(1/120);
  assert.equal(game.state,'playing');
  assert.equal(game.car.velocity,RULES.gravity/120);
  for (const y of [field.ceiling-4,field.floor-10]) {
    game.reset(RULES,field); game.flap(); game.car.y=y; game.update(1/120);
    assert.equal(game.state,'over');
  }
  game.reset(); assert.equal(game.playfield,STANDARD_PLAYFIELD); assert.equal(game.car.y,230);
});

test('mobile bird lanes alternate from middle to low sky with occasional high passes and a clear thrust corridor', () => {
  const field=createPlayfield(390,844);
  const lanes=[3,6,9,12,15].map(wave=>flightLane(138,field,wave,0));
  const fractions=lanes.map(y=>(y-field.ceiling)/(field.floor-field.ceiling));
  assert.ok(fractions[0]>.4&&fractions[0]<.6,'first birds occupy the middle sky');
  assert.ok(fractions[1]>.65&&fractions[1]<.8,'next birds pass above traffic');
  assert.ok(lanes[2]<lanes[1]&&lanes[3]>lanes[2]&&lanes[4]<lanes[0]);
  assert.ok(flightLane(110,field,3)<flightLane(166,field,3),'existing roll still varies each lane');
  for(const wave of [3,6,9,12,15])for(const p of [0,.5,1])for(const roll of [0,.5,1]) {
    const lane=flightLane(110+roll*(56+72*p),field,wave,p);
    assert.ok(lane>field.ceiling+60&&lane<=238);
  }
  for(const y of [110,138,166,238])assert.equal(flightLane(y,STANDARD_PLAYFIELD,3,1),y);
  for (const id of ['indian-streets','mars']) for (const roll of [0,.5,1]) {
    const theme=getTheme(id); let draws=0;
    const game=new Game(()=>{draws++;return roll;},undefined,theme.createEncounter);
    game.reset(theme.physics??RULES,field); game.spawned=2; game.spawn();
    const bird=game.obstacles.find(o=>o.kind==='crow'); assert.ok(bird);
    assert.equal(draws,2);
    for (const appearance of ['crow','bat']) {
      bird.appearance=appearance;
      const parts=obstacleShape(bird).parts.map(partBounds);
      assert.ok(parts.every(p=>p.y>field.ceiling));
      assert.equal(hitsObstacle({x:bird.x+20,y:bird.flightY-5,width:30,height:10},bird),true);
      assert.equal(hitsObstacle({x:bird.x,y:258,width:bird.width,height:97},bird),false);
      if(roll===.5) assert.equal(hitsObstacle({x:235,y:field.startY+3,width:68,height:24},{...bird,x:230}),true,
        'the first middle pass crosses the starting altitude, so it needs a dodge');
    }
  }
});

test('mobile lane changes preserve wave frequency, RNG draws, hazard sizes, speeds and fixed in-flight lanes', () => {
  for(const id of ['indian-streets','mars']) {
    const theme=getTheme(id);let desktopDraws=0,mobileDraws=0;
    const desktop=new Game(()=>{desktopDraws++;return .5;},undefined,theme.createEncounter);
    const mobile=new Game(()=>{mobileDraws++;return .5;},undefined,theme.createEncounter);
    desktop.reset(theme.physics??RULES);
    mobile.reset(theme.physics??RULES,createPlayfield(390,844));
    for(const elapsed of [0,45,90]) {
      desktop.elapsed=mobile.elapsed=elapsed;
      for(let i=0;i<12;i++){desktop.spawn();mobile.spawn();}
    }
    assert.equal(mobileDraws,desktopDraws);
    const withoutLane=({flightY,...obstacle})=>obstacle;
    assert.deepEqual(mobile.obstacles.map(withoutLane),desktop.obstacles.map(withoutLane));
    const birds=mobile.obstacles.filter(o=>o.kind==='crow');
    const lanes=birds.map(o=>o.flightY);
    mobile.flap();mobile.update(1/120);
    assert.deepEqual(birds.map(o=>o.flightY),lanes);
    mobile.pause();const paused=JSON.stringify(mobile);mobile.update(10);
    assert.equal(JSON.stringify(mobile),paused);
  }
});

test('three-minute portrait runs remain navigable in either world through every difficulty stage', () => {
  for (const id of ['indian-streets','mars']) for (const roll of [0,.5,1]) {
    const theme=getTheme(id),game=new Game(()=>roll,undefined,theme.createEncounter);
    game.reset(theme.physics??RULES,createPlayfield(390,844)); game.flap();
    for (let i=0;i<180*120&&game.state==='playing';i++) {
      if(game.car.y>323&&game.car.velocity>0)game.flap();
      game.update(1/120);
    }
    assert.equal(game.state,'playing',`${id}, roll ${roll}`);
    assert.ok(game.score>100);
  }
});

test('pause and viewport rotation preserve the run, and retry can adopt the current orientation', () => {
  const game=new Game();game.reset(RULES,createPlayfield(390,844));game.flap();game.spawn();game.pause();
  const snapshot=JSON.stringify(game);
  for(const [width,height] of [[430,932],[844,390],[320,568]]) {
    const v=getViewport(width,height,2,game.playfield);
    assert.ok(v.y+game.playfield.ceiling*v.scale>=72*2-.001);
    assert.ok(v.y+game.playfield.floor*v.scale<v.pixelHeight);
    assert.ok(v.x+game.car.x*v.scale>=0);
    assert.ok(v.x+(game.car.x+game.car.width)*v.scale<=v.pixelWidth);
    if(width<height&&v.x<0) {
      assert.ok(Math.abs(v.x+v.viewLeft*v.scale)<.001);
      assert.ok(v.x+(v.viewLeft+v.viewWidth)*v.scale>=v.pixelWidth-.001);
    }
  }
  game.update(10);assert.equal(JSON.stringify(game),snapshot);
  game.reset(RULES,createPlayfield(844,390));assert.equal(game.playfield,STANDARD_PLAYFIELD);
});
