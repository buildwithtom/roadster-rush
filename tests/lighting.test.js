import test from 'node:test';
import assert from 'node:assert/strict';
import { lightingAt, blendColor, LIGHT_CYCLE } from '../js/themes/lighting.js';
import { Game } from '../js/game.js';

test('day start holds daylight, reaches night, then returns to daylight',()=>{
  assert.deepEqual(lightingAt(0),lightingAt(60));
  assert.equal(lightingAt(0).night,0);assert.equal(lightingAt(0).lights,0);
  const night=lightingAt(90);
  assert.equal(night.night,1);assert.equal(night.lights,1);assert.equal(night.sunAlpha,0);assert.equal(night.moonAlpha,1);
  assert.deepEqual(night,lightingAt(150));
  assert.deepEqual(lightingAt(180),lightingAt(0));
});
test('night start holds night, reaches day, then returns to night',()=>{
  assert.deepEqual(lightingAt(0,'night'),lightingAt(60,'night'));
  assert.equal(lightingAt(0,'night').night,1);assert.equal(lightingAt(0,'night').lights,1);
  assert.deepEqual(lightingAt(90,'night'),lightingAt(0,'day'));
  assert.deepEqual(lightingAt(150,'night'),lightingAt(0,'day'));
  assert.deepEqual(lightingAt(180,'night'),lightingAt(0,'night'));
});
test('both starting choices repeat continuously over many complete cycles',()=>{
  for(const mode of ['day','night'])for(let t=0;t<180;t+=5){
    for(const cycle of [1,2,10,100])assert.deepEqual(lightingAt(t+cycle*LIGHT_CYCLE.period,mode),lightingAt(t,mode));
  }
  for(let t=0;t<540;t+=5)assert.deepEqual(lightingAt(t,'night'),lightingAt(t+90,'day'));
});
test('sun, moon, colors and shop lighting stay smooth across sunset, dawn, and cycle seams',()=>{
  for(const mode of ['day','night']){
    let previous=lightingAt(0,mode);
    for(let time=.1;time<=540;time+=.1){
      const scene=lightingAt(time,mode);
      for(const key of ['progress','night','lights','sunAlpha','moonAlpha']){
        assert.ok(scene[key]>=0&&scene[key]<=1);
        assert.ok(Math.abs(scene[key]-previous[key])<.02,`${mode} ${key} at ${time}`);
      }
      for(const key of ['skyTop','skyBottom','cloud']){
        assert.match(scene[key],/^#[0-9a-f]{6}$/);
        const rgb=color=>color.slice(1).match(/../g).map(v=>parseInt(v,16));
        rgb(scene[key]).forEach((v,i)=>assert.ok(Math.abs(v-rgb(previous[key])[i])<4));
      }
      previous=scene;
    }
  }
});
test('pause and game-over freeze either cycle; reset returns to the selected starting phase',()=>{
  for(const mode of ['day','night']){
    const g=new Game();g.flap();g.elapsed=75;g.pause();const phase=lightingAt(g.elapsed,mode);
    g.update(100);assert.deepEqual(lightingAt(g.elapsed,mode),phase);
    g.resume();g.car.y=260;g.car.velocity=0;g.update(.1);assert.notDeepEqual(lightingAt(g.elapsed,mode),phase);
    g.state='over';const over=lightingAt(g.elapsed,mode);g.update(100);assert.deepEqual(lightingAt(g.elapsed,mode),over);
    g.reset();assert.deepEqual(lightingAt(g.elapsed,mode),lightingAt(0,mode));
  }
});
test('invalid time or mode falls back safely to the default day start',()=>{
  for(const value of [-10,NaN,Infinity])assert.deepEqual(lightingAt(value),lightingAt(0));
  assert.deepEqual(lightingAt(0,'unknown'),lightingAt(0,'day'));
});
test('color blending clamps endpoints and interpolates deterministic colors',()=>{
  assert.equal(blendColor('#000000','#ffffff',.5),'#808080');
  assert.equal(blendColor('#123456','#abcdef',-1),'#123456');
  assert.equal(blendColor('#123456','#abcdef',2),'#abcdef');
});
