import test from 'node:test';
import assert from 'node:assert/strict';
import { lightingAt, blendColor } from '../js/themes/lighting.js';
import { Game } from '../js/game.js';

test('daylight holds until 60 seconds and night is complete at 90 seconds',()=>{
  assert.deepEqual(lightingAt(0),lightingAt(60));
  assert.equal(lightingAt(0).night,0);assert.equal(lightingAt(0).lights,0);
  const night=lightingAt(90);
  assert.equal(night.night,1);assert.equal(night.lights,1);assert.equal(night.sunAlpha,0);assert.equal(night.moonAlpha,1);
  assert.deepEqual(night,lightingAt(10000));
});
test('sun, moon and shop lighting change continuously and remain bounded',()=>{
  let previous=lightingAt(60);
  for(let time=60;time<=90;time+=.1){
    const scene=lightingAt(time);
    for(const key of ['progress','night','lights','sunAlpha','moonAlpha'])assert.ok(scene[key]>=0&&scene[key]<=1);
    assert.ok(scene.night>=previous.night);assert.ok(scene.lights>=previous.lights);
    assert.ok(scene.moonAlpha>=previous.moonAlpha);assert.ok(scene.sunAlpha<=previous.sunAlpha);
    assert.ok(Math.abs(scene.night-previous.night)<.02);
    for(const key of ['skyTop','skyBottom','cloud'])assert.match(scene[key],/^#[0-9a-f]{6}$/);
    previous=scene;
  }
});
test('pause and game-over freeze the transition; retry and menu reset to daylight',()=>{
  const g=new Game();g.flap();g.elapsed=75;g.pause();const dusk=lightingAt(g.elapsed);
  g.update(100);assert.deepEqual(lightingAt(g.elapsed),dusk);
  g.resume();g.car.y=260;g.car.velocity=0;g.update(.1);assert.notDeepEqual(lightingAt(g.elapsed),dusk);
  g.state='over';const over=lightingAt(g.elapsed);g.update(100);assert.deepEqual(lightingAt(g.elapsed),over);
  g.reset();assert.deepEqual(lightingAt(g.elapsed),lightingAt(0));
});
test('color blending clamps endpoints and interpolates deterministic colors',()=>{
  assert.equal(blendColor('#000000','#ffffff',.5),'#808080');
  assert.equal(blendColor('#123456','#abcdef',-1),'#123456');
  assert.equal(blendColor('#123456','#abcdef',2),'#abcdef');
});
