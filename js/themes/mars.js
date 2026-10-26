import { createEncounter } from '../obstacles.js';
import { lightingAt, blendColor, glow } from './lighting.js';
import { drawRoadster } from './roadster-art.js';
import { drawMarsObstacle } from './mars-obstacle-art.js';
import { MARS_FLIGHT } from '../physics.js';
import { drawStarship } from './starship-art.js';
import { skyY } from '../playfield.js';

const noise = seed => { const n=Math.sin(seed*91.7+28.3)*43758.5453; return n-Math.floor(n); };
const wrap = (value,size) => ((value%size)+size)%size;
function poly(c,color,points) {
  c.fillStyle=color; c.beginPath(); points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y)); c.closePath(); c.fill();
}
function ellipse(c,color,x,y,rx,ry=rx) {
  c.fillStyle=color; c.beginPath(); c.ellipse(x,y,rx,ry,0,0,Math.PI*2); c.fill();
}
function line(c,color,width,points) {
  c.strokeStyle=color; c.lineWidth=width; c.beginPath(); points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y)); c.stroke();
}
function rect(c,color,x,y,w,h) { c.fillStyle=color; c.fillRect(x,y,w,h); }
function label(c,words,x,y,size=7) { c.font=`bold ${size}px monospace`; c.fillStyle='#e8d8ba'; c.fillText(words,x,y); }

export function marsLightingAt(seconds=0,startingMode='day') {
  const light=lightingAt(seconds,startingMode),n=light.night;
  return {
    ...light,
    skyTop:blendColor('#b96948','#111b36',n),
    skyBottom:blendColor('#edbe8c','#76566a',n),
    mountainFar:blendColor('#bd8067','#49435e',n),
    mountainNear:blendColor('#a75e48','#4b3648',n),
    ground:blendColor('#a96245','#4b3e4d',n),
    groundLight:blendColor('#cf8d5e','#796070',n),
    groundDark:blendColor('#874b3d','#302c40',n),
  };
}
export function marsWeatherScene(scene,weather='clear',seconds=0) {
  const time=Number.isFinite(seconds)?Math.max(0,seconds):0;
  const dust=weather==='dust'?1:0;
  return {
    ...scene,time,dust,rain:0,
    skyTop:blendColor(scene.skyTop,'#ad785b',dust*(1-scene.night*.65)*.45),
    skyBottom:blendColor(scene.skyBottom,'#c69873',dust*.3),
    sunAlpha:scene.sunAlpha*(dust?.45:1),
    lights:Math.max(dust*.35,scene.lights),
  };
}
export function createMarsEncounter(index,roll=.5,progress=0,wave=0) {
  const encounter={ ...createEncounter(index,roll,progress), environment:'mars' };
  // Replace every other crawler slot; never add an extra wave or RNG draw.
  if(index===3&&wave>0&&wave%8===0)return {...encounter,kind:'starship',width:72};
  return encounter;
}

function mountains(c,distance,scene) {
  // Two independent parallax layers: distant ridges and eroded mesas.
  const far=distance*.045, first=Math.floor(far/240)-1;
  for(let i=first;i<first+7;i++) {
    const x=i*240-far,peak=248+noise(i+12)*65;
    poly(c,scene.mountainFar,[[x-50,414],[x+28,peak+29],[x+104,peak],[x+140,peak+31],[x+270,414]]);
    poly(c,blendColor(scene.mountainFar,scene.skyBottom,.18),[[x+28,peak+29],[x+104,peak],[x+86,peak+70],[x-20,414],[x-50,414]]);
  }
  const near=distance*.13,start=Math.floor(near/280)-1;
  for(let i=start;i<start+6;i++) {
    const x=i*280-near,top=310+noise(i+40)*45;
    poly(c,scene.mountainNear,[[x-40,445],[x+15,top+36],[x+44,top+32],[x+58,top],[x+149,top-5],[x+177,top+20],[x+201,top+22],[x+251,445]]);
    poly(c,blendColor(scene.mountainNear,'#e4ab7b',.15),[[x+44,top+32],[x+58,top],[x+149,top-5],[x+134,top+14],[x+65,top+19]]);
    for(let j=0;j<4;j++)line(c,scene.groundDark+'40',2,[[x+25-j*8,top+46+j*16],[x+172+j*9,top+37+j*18]]);
  }
}
function outpost(c,distance,scene) {
  const offset=distance*.3,first=Math.floor(offset/1100)-1,n=scene.night;
  for(let i=first;i<first+3;i++) {
    const x=i*1100-offset;
    // Low habitation dome with a ribbed shell and warm portal windows.
    c.save(); c.translate(x+430,450);
    c.fillStyle=blendColor('#ceb39b','#687282',n); c.beginPath();c.ellipse(0,0,55,53,0,Math.PI,Math.PI*2);c.closePath();c.fill();
    c.strokeStyle=blendColor('#8c817a','#435363',n);c.lineWidth=2;
    c.beginPath();c.ellipse(0,0,29,53,0,Math.PI,Math.PI*2);c.stroke();
    rect(c,'#44535a',-57,-6,114,8);
    for(const wx of [-31,18]) {
      rect(c,n>.3?'#e3ba7d':'#789fa5',wx,-27,13,16);
      if(scene.lights>0)glow(c,wx+6,-19,19,'#f0c283',scene.lights*.45);
    }
    rect(c,'#746f6a',-8,-27,16,27);rect(c,'#afc6c3',-5,-23,10,11);c.restore();
    // Connected lab, airlock, antenna dish and solar farm.
    rect(c,blendColor('#b59d86','#55637a',n),x+495,412,88,38);
    poly(c,blendColor('#d1bda4','#83919c',n),[[x+491,412],[x+501,402],[x+576,402],[x+587,412]]);
    rect(c,'#455e69',x+507,423,61,13);
    for(let j=0;j<4;j++)rect(c,n>.3?'#ddbd85':'#97afb0',x+511+j*14,426,9,7);
    label(c,'ARES / 03',x+509,418,6);
    line(c,'#8c9594',3,[[x+558,404],[x+558,370]]);
    c.save();c.translate(x+558,370);c.rotate(-.5);ellipse(c,'#b6ada0',0,0,18,6);line(c,'#586a72',1,[[0,0],[0,-12]]);c.restore();
    rect(c,'#515d64',x+348,435,30,13);
    for(let j=0;j<3;j++) {
      const sx=x+115+j*67;
      line(c,'#777f7a',3,[[sx+22,447],[sx+22,425]]);
      poly(c,'#34495c',[[sx,417],[sx+42,417],[sx+53,435],[sx+9,435]]);
      for(let k=1;k<4;k++)line(c,'#7b9baf',.6,[[sx+k*10,418],[sx+k*10+8,434]]);
      line(c,'#7b9baf',.6,[[sx+5,426],[sx+47,426]]);
    }
    // Navigation lamps line the outpost, clearly behind the solid hazards.
    for(let j=0;j<6;j++) {
      const lx=x+80+j*108;
      rect(c,'#687574',lx,440,3,21);rect(c,'#f2c67d',lx-1,438,5,3);
      if(scene.lights>0)glow(c,lx+1,439,27,'#efbc71',scene.lights*.65);
    }
    label(c,'OLYMPUS OUTPOST',x+662,447,7);
  }
}
function launchSites(c,distance,scene) {
  const offset=distance*.18,first=Math.floor(offset/1500)-1;
  const muted=color=>blendColor(color,scene.skyBottom,.48);
  for(let i=first;i<first+3;i++) {
    const x=i*1500-offset+754;
    // Muted, slow-moving launch hardware is scenery behind the outpost.
    rect(c,muted('#666169'),x-12,438,176,10);
    poly(c,muted('#867b75'),[[x-24,448],[x-12,436],[x+163,436],[x+179,448]]);
    const tower=x+115;
    rect(c,muted('#7b777a'),tower,250,7,188);rect(c,muted('#7b777a'),tower+28,250,7,188);
    for(let j=0;j<7;j++) {
      line(c,muted('#8e8584'),2,[[tower,254+j*26],[tower+35,278+j*26],[tower,278+j*26]]);
    }
    rect(c,muted('#9b8f87'),tower-25,291,59,5);
    drawStarship(c,x+7,438,1.5,scene,true);
    // Pad floodlights turn on gradually with the same day/night clock.
    for(const lx of [x-4,x+151]) {
      rect(c,muted('#7b777a'),lx,419,3,19);
      rect(c,'#d9bf8f',lx-1,417,5,2);
      if(scene.lights>0)glow(c,lx+1,418,24,'#e8c692',scene.lights*.35);
    }
    label(c,'DISTANT PORT / 08',x+5,455,6);
  }
}
export function drawMarsGround(c,distance,top=474,height=66,scene=marsLightingAt()) {
  if(height<=0)return;
  c.save();c.beginPath();c.rect(0,top,960,height);c.clip();
  rect(c,scene.ground,0,top,960,height);
  const offset=distance*.7,first=Math.floor(offset/130)-1;
  for(let row=Math.max(0,Math.floor((top-474)/68)-1);row<=Math.ceil((top+height-474)/68);row++) {
    for(let col=first;col<first+10;col++) {
      const id=col*37+row*211,x=col*130-offset,y=474+row*68;
      const px=x+20+noise(id)*77,py=y+23+noise(id+4)*33;
      // Crater bowls and broken rims sit below the collision floor.
      if(noise(id+9)>.36) {
        const r=11+noise(id+12)*24;
        ellipse(c,scene.groundLight,px,py,r+3,6);ellipse(c,scene.groundDark,px,py-1,r,5);
        ellipse(c,scene.ground,px+3,py+1,r*.7,3);
      }
      for(let j=0;j<4;j++) {
        const rx=x+noise(id+j*7)*130,ry=y+noise(id+j*5+17)*68,r=1+noise(id+j+32)*3;
        poly(c,j%2?scene.groundLight:scene.groundDark,[[rx-r,ry],[rx,ry-r*.6],[rx+r,ry],[rx+r*.6,ry+r*.4],[rx-r*.7,ry+r*.4]]);
      }
      line(c,scene.groundLight+'55',1,[[x+9,y+17],[x+47,y+13],[x+82,y+14]]);
      // Small tyre marks dissolve into the wind-scoured surface.
      if(row===0)for(let j=0;j<7;j++) {
        rect(c,scene.groundDark+'65',x+j*19,511,8,1.3);rect(c,scene.groundDark+'65',x+j*19,521,8,1.3);
      }
    }
  }
  poly(c,scene.groundLight,[[0,474],[960,474],[960,477],[770,479],[610,476],[425,480],[211,477],[0,481]]);
  c.restore();
}
function drawDust(c,scene,{width=960,top=0,height=540}={}) {
  if(!scene.dust)return;
  c.save(); c.beginPath();c.rect(0,top,width,height);c.clip();
  c.globalAlpha=.07;rect(c,'#dcad7d',0,top,width,height);
  const count=Math.min(180,Math.ceil(width*height/7000));
  for(let i=0;i<count;i++) {
    const x=wrap(noise(i+12)*(width+80)-scene.time*(70+i%4*24),width+80)-40;
    const y=top+wrap(noise(i+49)*(height+20)+scene.time*(8+i%3*3),height+20)-10;
    c.globalAlpha=.12+(i%3)*.04;
    line(c,'#f1d4a4',i%3===0?1.5:.8,[[x,y],[x+8+i%5*3,y-1]]);
  }
  c.restore();
}

export const mars = {
  id:'mars', name:'Mars', frameColor:'#191d2a',
  physics:MARS_FLIGHT,
  liftHelp:'Space or tap to thrust. Mars has lower gravity: use slower taps.',
  flightHint:'Low gravity. Leave more time between taps.',
  weatherModes:[
    {value:'clear',label:'Clear',description:'Clear skies over the outpost.'},
    {value:'dust',label:'Dust',description:'Blowing dust and a hazy sky. Same controls.'},
  ],
  help:'Clear rovers, rocks and landed Starships. Dodge drones. Avoid the surface and top edge.',
  createEncounter:createMarsEncounter,
  lighting:marsLightingAt, weatherScene:marsWeatherScene, weather:drawDust,
  road:drawMarsGround, obstacle:drawMarsObstacle, car:drawRoadster,
  background(c,distance,scene=marsWeatherScene(marsLightingAt())) {
    const ceiling=scene.ceiling??0,sunY=skyY(scene,scene.sunY),moonY=skyY(scene,scene.moonY);
    const sky=c.createLinearGradient(0,ceiling,0,474);sky.addColorStop(0,scene.skyTop);sky.addColorStop(1,scene.skyBottom);
    c.fillStyle=sky;c.fillRect(0,ceiling,960,540-ceiling);
    const cx=(scene.viewLeft??0)+Math.min(750,(scene.viewWidth??960)*.79);
    c.save();c.globalAlpha=scene.sunAlpha;
    glow(c,cx,sunY,66,'#f9d6a3',.7);ellipse(c,'#ffe1b3',cx,sunY,23);c.restore();
    if(scene.moonAlpha>0) {
      c.save();c.globalAlpha=scene.moonAlpha;
      // Two small, irregular moons, rather than Earth's crescent.
      poly(c,'#bfb8ae',[[cx-13,moonY-8],[cx+2,moonY-12],[cx+12,moonY-3],[cx+8,moonY+8],[cx-5,moonY+11],[cx-15,moonY+3]]);
      ellipse(c,'#8d8f96',cx-3,moonY,4,3);
      ellipse(c,'#d1c4b2',cx-107,moonY+65,5,4);
      for(let i=0;i<48;i++) {
        c.globalAlpha=scene.moonAlpha*(.25+i%4*.14);
        rect(c,'#e5ded5',12+noise(i+301)*930,skyY(scene,18+noise(i+601)*243),i%7===0?2:1,1.5);
      }
      c.restore();
    }
    mountains(c,distance,scene);
    rect(c,blendColor('#b47956','#5c4253',scene.night),0,429,960,45);
    launchSites(c,distance,scene);
    outpost(c,distance,scene);
    poly(c,scene.groundDark,[[0,467],[165,461],[330,468],[510,459],[690,465],[840,459],[960,467],[960,478],[0,478]]);
    drawMarsGround(c,distance,474,66,scene);
  },
};
