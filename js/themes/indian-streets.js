import { drawStreet, drawStreetLights } from './street-art.js';
import { drawRoad } from './road-art.js';
import { drawObstacle } from './obstacle-art.js';
import { lightingAt, glow } from './lighting.js';
import { weatherScene, drawRainClouds, drawRain } from './weather.js';
import { drawRoadster } from './roadster-art.js';

// Theme contract: background(ctx, distance), obstacle(ctx, obstacle), car(ctx, car, time).
// Add future environments here without coupling artwork to collision or scoring rules.
export const indianStreets = {
  name: 'Indian Streets',
  lighting: lightingAt,
  weatherScene,
  weather: drawRain,
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
    drawRainClouds(c, distance, scene);
    // Decorative layers are kept in a modular shopfront library. Stable world
    // positions avoid popping or gaps when the parallax passes a block edge.
    drawStreet(c, distance, scene);
    drawRoad(c, distance, 474, 66, scene);
    drawStreetLights(c, distance, scene);

  },
  road: drawRoad,
  obstacle: drawObstacle,
  car: drawRoadster,
};
