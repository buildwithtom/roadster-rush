import { drawStreet, drawStreetLights } from './street-art.js';
import { drawRoad } from './road-art.js';
import { drawObstacle } from './obstacle-art.js';
import { lightingAt, glow } from './lighting.js';

// Theme contract: background(ctx, distance), obstacle(ctx, obstacle), car(ctx, car, time).
// Add future environments here without coupling artwork to collision or scoring rules.
const rect = (c, color, x, y, w, h) => { c.fillStyle = color; c.fillRect(x, y, w, h); };
function line(c, color, width, points) {
  c.strokeStyle = color; c.lineWidth = width; c.beginPath();
  points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
}
export const indianStreets = {
  name: 'Indian Streets',
  lighting: lightingAt,
  background(c, distance, scene = lightingAt()) {
    const celestialX=Math.min(747,(scene.viewWidth??960)*.78);
    const sky=c.createLinearGradient(0,0,0,474);
    sky.addColorStop(0,scene.skyTop);sky.addColorStop(1,scene.skyBottom);c.fillStyle=sky;c.fillRect(0,0,960,540);
    c.save();c.globalAlpha=scene.sunAlpha;
    c.fillStyle='#efd09b';c.beginPath();c.arc(celestialX,scene.sunY,47,0,Math.PI*2);c.fill();c.restore();
    if(scene.moonAlpha>0){
      c.save();c.globalAlpha=scene.moonAlpha;glow(c,celestialX,scene.moonY,55,'#e0eddc',.55);
      // A crescent path, rather than a sky-colored cutout, works on the gradient.
      c.fillStyle='#e6edd6';c.beginPath();c.arc(celestialX,scene.moonY,23,-Math.PI*.5,Math.PI*.5);
      c.bezierCurveTo(celestialX+20,scene.moonY+20,celestialX+20,scene.moonY-20,celestialX,scene.moonY-23);c.fill();
      c.fillStyle='#dbe4d4';
      for(let i=0;i<22;i++){const x=(i*173+49)%950,y=24+(i*71)%205;c.globalAlpha=scene.moonAlpha*(.3+(i%4)*.15);c.fillRect(x,y,i%3===0?2:1,1.5);}
      c.restore();
    }
    // Clouds are soft scenery, never hazards or collision surfaces.
    const drift = distance * .06;
    for (let i = Math.floor(drift / 330) - 1; i < Math.floor(drift / 330) + 4; i++) {
      const x = i * 330 - drift + 90, y = 60 + ((i % 3 + 3) % 3) * 35;
      c.save();c.globalAlpha=.67;c.fillStyle = scene.cloud;c.beginPath();
      c.ellipse(x,y,45,10,0,0,Math.PI*2);c.ellipse(x-14,y-8,18,14,0,0,Math.PI*2);c.ellipse(x+10,y-11,23,17,0,0,Math.PI*2);c.fill();c.restore();
    }
    // Decorative layers are kept in a modular shopfront library. Stable world
    // positions avoid popping or gaps when the parallax passes a block edge.
    drawStreet(c, distance, scene);
    drawRoad(c, distance, 474, 66, scene);
    drawStreetLights(c, distance, scene);

  },
  road: drawRoad,
  obstacle: drawObstacle,
  car(c, car, time, scene = lightingAt()) {
    c.save();c.translate(car.x+39,car.y+15);c.rotate(Math.max(-.18,Math.min(.28,car.velocity/1700)));
    // Two distinct underside nozzles and a short air burst for every impulse.
    for(const x of [-23,23]){
      rect(c,'#344e49',x-6,10,12,8);rect(c,'#a2b9a0',x-4,17,8,3);
      if(car.thrust>0){const length=19+car.thrust*90+Math.sin(time*85)*5;const g=c.createLinearGradient(0,18,0,18+length);g.addColorStop(0,'#c6f8e4');g.addColorStop(1,'#c6f8e400');c.fillStyle=g;c.beginPath();c.moveTo(x-4,20);c.lineTo(x-10,20+length);c.lineTo(x+10,20+length);c.lineTo(x+4,20);c.fill();line(c,'#effff2',2,[[x,21],[x,29+length*.4]]);}
    }
    c.fillStyle='#314c47';c.beginPath();c.moveTo(-40,0);c.lineTo(-28,-7);c.lineTo(-14,-18);c.lineTo(15,-18);c.lineTo(29,-7);c.lineTo(40,-3);c.lineTo(42,8);c.quadraticCurveTo(1,18,-40,8);c.closePath();c.fill();
    c.fillStyle='#cfdfc7';c.beginPath();c.moveTo(-24,-7);c.lineTo(-12,-15);c.lineTo(12,-15);c.lineTo(23,-7);c.closePath();c.fill();line(c,'#516f62',2,[[0,-15],[3,-7]]);
    c.fillStyle='#d8ef9a';c.beginPath();c.moveTo(-40,0);c.lineTo(40,-3);c.lineTo(37,7);c.lineTo(-36,7);c.closePath();c.fill();line(c,'#b6ca80',2,[[-30,8],[27,8]]);rect(c,'#fbf6dc',31,-1,8,3);rect(c,'#c86b4f',-39,1,5,3);rect(c,'#57735b',-8,0,8,2);
    if(scene.lights>0){
      glow(c,38,1,18,'#f9e7a9',scene.lights*.7);glow(c,-37,2,9,'#f19162',scene.lights*.6);
      c.save();c.globalAlpha=scene.lights;const beam=c.createLinearGradient(40,1,115,1);beam.addColorStop(0,'#fbe7ae22');beam.addColorStop(1,'#fbe7ae00');c.fillStyle=beam;c.beginPath();c.moveTo(40,0);c.lineTo(115,-8);c.lineTo(115,18);c.lineTo(40,4);c.fill();c.restore();
    }
    c.restore();
  }
};
