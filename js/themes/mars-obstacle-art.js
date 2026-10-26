import { obstacleShape } from '../obstacles.js';
import { blendColor, glow, lightingAt } from './lighting.js';
import { drawStarship } from './starship-art.js';

const COLORS = { shell:'#e1d6bd', glass:'#284957', metal:'#6b7676', solar:'#344d66', wheel:'#343841', cargo:'#c18a4f', rock:'#795043', engine:'#426c73' };
function line(c, color, width, points) {
  c.strokeStyle=color; c.lineWidth=width; c.beginPath();
  points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y)); c.stroke();
}
function rect(c,color,x,y,w,h) { c.fillStyle=color; c.fillRect(x,y,w,h); }
function text(c,words,x,y,size=7) { c.fillStyle='#344c54'; c.font=`bold ${size}px monospace`; c.fillText(words,x,y); }
export function drawMarsObstacle(c,o,scene=lightingAt()) {
  if(o.kind==='starship') {drawStarship(c,o.x,474,1,scene);return;}
  c.save(); c.translate(o.x,0);
  for (const p of obstacleShape(o).parts) {
    c.fillStyle=blendColor(COLORS[p.material],'#4c6377',scene.night*.36);
    c.beginPath();
    if(p.shape==='rect')c.rect(p.x,p.y,p.width,p.height);
    else if(p.shape==='ellipse')c.ellipse(p.x,p.y,p.rx,p.ry,0,0,Math.PI*2);
    else {p.points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
    c.fill(); c.strokeStyle=p.material==='rock'?'#ab7b64':'#233944'; c.lineWidth=.8; c.stroke();
  }
  if(o.kind==='rickshaw'||o.kind==='bus') {
    const big=o.kind==='bus', wheels=big?[25,66,108,150]:[21,53,86];
    for(const x of wheels) {
      c.fillStyle='#afbbb7'; c.beginPath(); c.arc(x,464,4,0,Math.PI*2); c.fill();
      line(c,'#536a73',1,[[x-2,464],[x+2,464]]);
    }
    rect(c,'#b56c47',big?8:8,big?435:442,big?157:89,5);
    if(big) {
      for(let i=0;i<5;i++) {
        rect(c,'#3c5965',19+i*22,392,16,23);
        rect(c,scene.night>.3?'#d7d5a0':'#9bb9b9',21+i*22,394,12,18);
      }
      text(c,'ARES EXPEDITION',23,430); rect(c,'#667a7b',123,425,11,26);
      for(let i=0;i<11;i++)line(c,'#7292a2',.6,[[25+i*10,368],[25+i*10,373]]);
    } else {
      text(c,'M-07',32,438); line(c,'#b5c9c4',1,[[33,410],[51,408],[57,419]]);
      for(let i=0;i<6;i++)line(c,'#7e9aa5',.6,[[20+i*9,399],[20+i*9,402]]);
    }
    const x=big?169:98,y=big?436:443;
    rect(c,'#d5f8ef',x-3,y-2,4,3);
    if(scene.lights>0)glow(c,x,y,24,'#bdece5',scene.lights*.8);
  } else if(o.kind==='cart') {
    for(const x of [17,69])rect(c,'#65747a',x,424,4,46);
    rect(c,'#9b5f3c',9,455,77,3); text(c,'O₂ / SUPPLIES',23,440,6);
    rect(c,'#ddbf78',38,457,17,10);text(c,'↑',43,465,8);
  } else if(o.kind==='cow') {
    line(c,'#ae7f66',2,[[10,453],[27,435],[51,427],[73,438]]);
    line(c,'#513f3f',1.5,[[28,435],[36,452],[26,471]]);
    line(c,'#a46d55',1,[[36,452],[73,438],[64,462],[88,462]]);
  } else if(o.kind==='crow') {
    const age=o.age??0,y=(o.flightY??132)+Math.sin(age*2.4)*6;
    for(const x of [9,55]) {
      // Small pulses remain decorative inside the existing drone silhouette.
      rect(c,'#bdf4e6',x-3,y-1,6,2);
      line(c,'#b5cecd',1,[[x-6,y-5],[x+6,y-5]]);
    }
    rect(c,'#f7bb6e',29,y-2,6,3);
    glow(c,32,y,16,'#efb67b',.2+scene.night*.35);
  }
  c.restore();
}
