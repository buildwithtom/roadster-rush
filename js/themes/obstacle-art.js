import { lightingAt, blendColor, glow } from './lighting.js';
import { obstacleShape, crowPose, batWingOutline } from '../obstacles.js';
const C={autoBody:'#e3b843',autoGreen:'#47754d',hood:'#263a31',glass:'#92b6ad',frame:'#374d3b',seat:'#644936',busBody:'#bb6146',luggage:'#a49570',wood:'#82613f',crate:'#a5814b',greens:'#799442',tomato:'#cb6845',cow:'#e6d2aa',muzzle:'#b79879',cowLeg:'#c6b28c',horn:'#766347',tyre:'#293d34',crow:'#253832',wing:'#3f4b43',feather:'#35453b',beak:'#535d49',bat:'#302e3b',batMembrane:'#55465f',batTail:'#55465f',batEar:'#44364e'};
function rect(c,color,x,y,w,h){c.fillStyle=color;c.fillRect(x,y,w,h);}
function ellipse(c,color,x,y,rx,ry=rx){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
function line(c,color,width,points){c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
function paint(c,p,scene){
  const bat=p.material.startsWith('bat');
  const bird=bat||['crow','wing','feather','beak'].includes(p.material);
  const color=blendColor(C[p.material],bat?'#b0a9bd':bird?'#95aab6':'#18334a',scene.night*(bat ? .3 : bird ? .65 : .32));
  c.fillStyle=color;
  if(p.shape==='rect')c.fillRect(p.x,p.y,p.width,p.height);
  else if(p.shape==='ellipse')ellipse(c,color,p.x,p.y,p.rx,p.ry);
  else {c.beginPath();p.points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
  if(bird&&scene.night&&!(p.material==='batMembrane'&&p.points?.length===3)){c.save();c.globalAlpha=scene.night*.45;c.strokeStyle='#c5d5d6';c.lineWidth=.8;c.stroke();c.restore();}
}
function text(c,words,x,y,size,color){c.font=`bold ${size}px Arial`;c.textAlign='center';c.fillStyle=color;c.fillText(words,x,y);}
function hubs(c,positions){for(const x of positions){ellipse(c,'#8e9a82',x,464,5);ellipse(c,'#d2c9a7',x,464,2);}}
function autoDetails(c,parts,scene){
  const shade=color=>blendColor(color,'#18334a',scene.night*.32);
  // Clip trim to the same solids used by collisions. Nothing paints across
  // the open doorway or extends the sloping roof/windscreen silhouette.
  c.save();c.beginPath();
  for(const p of parts){
    if(p.shape==='rect')c.rect(p.x,p.y,p.width,p.height);
    else if(p.shape==='ellipse'){c.moveTo(p.x+p.rx,p.y);c.ellipse(p.x,p.y,p.rx,p.ry,0,0,Math.PI*2);}
    else {p.points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
  }
  c.clip();
  // Fabric seams and the rolled curtain at the rear edge of the opening.
  line(c,shade('#64715a'),1,[[10,407],[25,401],[53,401],[66,405],[74,410]]);
  line(c,shade('#142c25'),2,[[8,411],[62,412],[78,413]]);
  line(c,shade('#7b8060'),1,[[12,414],[16,434]]);
  line(c,shade('#b8a27a'),1,[[20,421],[22,431],[26,434],[49,434]]);
  // Rear engine panel, low entry step, and small louvres above the back wheel.
  rect(c,shade('#e3b843'),5,439,27,3);
  rect(c,shade('#365d40'),7,449,25,9);
  for(let i=0;i<3;i++)line(c,shade('#2d4b35'),1,[[9,445+i*2],[18,445+i*2]]);
  line(c,shade('#c3b67c'),1.5,[[34,453],[70,453]]);
  // Rounded yellow front, broad glass, a wiper and a tucked-in front fender.
  line(c,shade('#f2cf69'),3,[[86,435],[94,440],[98,448]]);
  line(c,shade('#ae893a'),1,[[77,439],[80,448],[94,451]]);
  line(c,shade('#d6e2cf'),1,[[72,415],[77,422],[82,430]]);
  line(c,shade('#334b43'),1.2,[[83,431],[77,422]]);
  c.strokeStyle=shade('#263c31');c.lineWidth=2.5;c.beginPath();
  c.ellipse(90,461,12,10,0,Math.PI,Math.PI*2);c.stroke();
  rect(c,shade('#f7e5b3'),95,442,5,4);
  rect(c,shade('#b64b35'),5,445,3,5);
  rect(c,shade('#d2bd6f'),82,454,8,3);
  hubs(c,[23,90]);c.restore();
}
function busDetails(c,x){
  rect(c,'#d7bf83',x+2,389,157,34);rect(c,'#e0b25d',x+2,437,170,5);
  rect(c,'#5e7d70',x+2,447,171,11);
  for(let i=0;i<7;i++){
    rect(c,'#344f48',x+8+i*18,392,14,24);
    rect(c,'#8aa79a',x+9+i*18,393,11,10);
    line(c,'#c3b897',1,[[x+8+i*18,407],[x+21+i*18,407]]);
  }
  // Separate driver's windscreen and boarding door at the sloping front.
  rect(c,'#2e4b43',x+138,392,17,26);rect(c,'#a0b9a8',x+141,394,12,13);
  rect(c,'#3f5143',x+128,422,12,35);line(c,'#c0a976',1,[[x+134,424],[x+134,455]]);
  rect(c,'#314e43',x+45,377,77,9);text(c,'GRAM SEVA',x+83,384,7,'#eadcad');
  rect(c,'#eee0b6',x+165,437,6,6);rect(c,'#daba62',x+79,451,20,5);
  for(let i=0;i<4;i++){
    rect(c,['#ad9168','#8d9d80','#c1aa7d','#a78b65'][i],x+22+i*27,367,23,6);
    rect(c,'#655f49',x+30+i*27,366,2,8);
  }
  hubs(c,[x+31,x+142]);
}
function cartDetails(c,x){
  for(let i=0;i<3;i++){
    const bx=x+13+i*23;
    rect(c,'#bd9862',bx,433,20,2);rect(c,'#c4a273',bx,440,20,2);
    for(let j=0;j<3;j++)ellipse(c,['#d66c46','#84a449','#c8b450'][i],bx+3+j*6,429,3,3);
  }
  line(c,'#c2a578',2,[[x+9,450],[x+85,450]]);hubs(c,[x+23,x+72]);
}
function cowDetails(c){
  ellipse(c,'#ad9874',31,452,10,7);ellipse(c,'#9d8768',53,448,6,5);
  // Folded front legs, a pendulous ear, small eye and a broad soft muzzle.
  line(c,'#8e795c',1,[[16,468],[32,467],[38,470]]);
  line(c,'#8e795c',1,[[46,467],[61,466],[65,469]]);
  ellipse(c,'#c4a985',60,435,5,2);ellipse(c,'#384d3b',75,435,1.4);
  ellipse(c,'#6f644e',82,446,1.5,1);line(c,'#8b755c',1,[[75,450],[82,450]]);
  c.strokeStyle='#8b755c';c.lineWidth=2;c.beginPath();c.moveTo(12,445);c.bezierCurveTo(2,442,3,457,6,460);c.stroke();
  ellipse(c,'#79694f',6,461,2,3);
}
export function drawObstacle(c,o,scene=lightingAt()){
  c.save();c.translate(o.x,0);
  const parts=obstacleShape(o).parts;
  for(const p of parts)paint(c,p,scene);
  if(o.kind==='bus')busDetails(c,0);
  if(o.kind==='rickshaw'||!o.kind)autoDetails(c,parts,scene);
  if(o.kind==='cart')cartDetails(c,0);
  if(o.kind==='cow')cowDetails(c);
  if(o.kind==='crow'){
    const {y,flap}=crowPose(o);
    if(o.appearance==='bat'){
      c.lineJoin='miter';c.miterLimit=3;
      for(const side of [-1,1]){
        const outline=batWingOutline(o,side),mirror=x=>side<0?65-x:x;
        line(c,blendColor('#8b719d','#b6a4c1',scene.night*.6),.8,[...outline,outline[0]]);
        // Three thin finger ribs end at the membrane tips; no triangle grid.
        c.save();c.globalAlpha=.5;
        line(c,'#9d85ad',.6,[[mirror(36),y-3],[mirror(45),y-20+flap*.35],[mirror(62),y-10+flap*.35]]);
        line(c,'#9d85ad',.6,[[mirror(36),y-3],[mirror(53),y+3]]);
        line(c,'#9d85ad',.6,[[mirror(36),y-3],[mirror(44),y+8]]);
        c.restore();
      }
      // A short face and two small eyes stay readable without a bird-like beak.
      ellipse(c,'#bf9cba',27.5,y-17,1.2,3);ellipse(c,'#bf9cba',37.5,y-17,1.2,3);
      ellipse(c,'#e8d6a9',30,y-11,1);ellipse(c,'#e8d6a9',35,y-11,1);
    }else{
      ellipse(c,'#c3c7a8',15,y-5,1.3);
      line(c,'#5c6658',1,[[33,y-2],[41,y+flap-12],[51,y+flap-8]]);
    }
  }
  if(scene.lights>0&&(o.kind==='bus'||o.kind==='rickshaw')){
    const bus=o.kind==='bus',x=bus?169:97,y=bus?440:446;
    c.save();c.globalAlpha=scene.lights;
    glow(c,x,y,24,'#ffe2a1',.8);glow(c,5,448,12,'#ec8864',.7);
    c.fillStyle='#ffeab0';c.fillRect(x-3,y-2,6,4);
    c.fillStyle='#ec9978';c.fillRect(bus?3:5,446,3,4);
    const beam=c.createLinearGradient(x,y,x+105,487);
    beam.addColorStop(0,'#f7d58d26');beam.addColorStop(1,'#f7d58d00');
    c.fillStyle=beam;c.beginPath();c.moveTo(x,y-2);c.lineTo(x+108,y-1);c.lineTo(x+120,489);c.lineTo(x,y+3);c.fill();
    if(bus){
      for(let i=0;i<7;i++){
        c.fillStyle='#ecc681';c.globalAlpha=scene.lights*.72;c.fillRect(9+i*18,393,11,22);
        c.globalAlpha=scene.lights;glow(c,15+i*18,403,12,'#e9c07a',.2);
      }
      glow(c,83,381,24,'#e9d296',.3);
    }
    c.restore();
  }
  c.restore();
}
