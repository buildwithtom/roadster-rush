import { starshipParts } from '../mars-obstacles.js';
import { blendColor, glow, lightingAt } from './lighting.js';

function line(c,color,width,points) {
  c.strokeStyle=color;c.lineWidth=width;c.beginPath();
  points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();
}
function panel(c,color,points) {
  c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();
}

// Shared by the solid obstacle and the muted, larger background ships. All
// solid outlines come directly from the collision parts, including fin gaps.
export function drawStarship(c,x,base=474,scale=1,scene=lightingAt(),distant=false) {
  c.save();c.translate(x,base);c.scale(scale,scale);c.translate(0,-474);
  const color=hex=>blendColor(blendColor(hex,'#71859d',scene.night*.32),scene.skyBottom??'#76566a',distant?.5:0);
  const steel=c.createLinearGradient(25,0,47,0);
  steel.addColorStop(0,color('#87999f'));steel.addColorStop(.26,color('#f0f0df'));
  steel.addColorStop(.58,color('#c5ceca'));steel.addColorStop(1,color('#71848d'));
  const palette={steel,flap:color('#344652'),leg:color('#98a6a8'),engine:color('#293e49'),foot:color('#6e797b')};
  for(const p of starshipParts()) {
    c.fillStyle=palette[p.material];c.beginPath();
    if(p.shape==='rect')c.rect(p.x,p.y,p.width,p.height);
    else if(p.shape==='ellipse')c.ellipse(p.x,p.y,p.rx,p.ry,0,0,Math.PI*2);
    else {p.points.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.closePath();}
    c.fill();c.strokeStyle=color(distant?'#7d7d80':'#293d49');c.lineWidth=distant?.5:.8;c.stroke();
  }
  // Dark heat-shield face, stainless rings and a narrow specular highlight.
  panel(c,color('#273741'),[[36,358],[44,373],[46,383],[46,457],[39,457],[39,379]]);
  for(let y=386;y<457;y+=8)line(c,color('#788e94'),.55,[[25.5,y],[46,y]]);
  line(c,color('#f2f4e9'),.9,[[30,378],[29,391],[29,452]]);
  line(c,color('#8d9b9d'),.6,[[20,391],[24,383]]);
  line(c,color('#8d9b9d'),.7,[[16,449],[23,431],[23,459],[13,464]]);
  line(c,color('#71878e'),.7,[[50,432],[56,448],[59,464],[50,460]]);
  // Small heat tiles follow the darker face; no launch plume or moving parts.
  for(let y=393;y<452;y+=6)line(c,color('#405660'),.45,[[40,y],[45,y]]);
  c.save();c.translate(35.5,447);c.rotate(-Math.PI/2);
  c.fillStyle=color('#354a55');c.font='bold 5px monospace';c.fillText('STARSHIP',0,0);c.restore();
  c.fillStyle=color('#314652');c.fillRect(30,388,5,2);
  if(scene.lights>0) {
    c.fillStyle='#e6c587';c.fillRect(25,450,2,2);c.fillRect(45,450,2,2);
    if(!distant)glow(c,36,463,14,'#dfc29a',scene.lights*.17);
  }
  c.restore();
}
