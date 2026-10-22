// Theme contract: background(ctx, distance), obstacle(ctx, obstacle), car(ctx, car, time).
// Add future environments here without coupling artwork to collision or scoring rules.
const rect = (c, color, x, y, w, h) => { c.fillStyle = color; c.fillRect(x, y, w, h); };
function line(c, color, width, points) {
  c.strokeStyle = color; c.lineWidth = width; c.beginPath();
  points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
}
function palm(c, x, y, size) {
  line(c, '#71836b', 5, [[x,y],[x+8*size,y-70*size],[x+3*size,y-105*size]]);
  c.strokeStyle='#6b876c';c.lineWidth=5*size;
  for(let i=0;i<6;i++){const angle=i*Math.PI/3;c.beginPath();c.moveTo(x+3*size,y-105*size);c.quadraticCurveTo(x+Math.cos(angle)*25*size,y-130*size+Math.sin(angle)*15*size,x+Math.cos(angle)*47*size,y-100*size+Math.sin(angle)*24*size);c.stroke();}
}
function building(c, x, base, width, height, color, index) {
  rect(c,color,x,base-height,width,height);rect(c,'#b5a58a',x-3,base-height, width+6,5);
  for(let y=base-height+17;y<base-15;y+=29)for(let wx=x+13;wx<x+width-10;wx+=25){rect(c,'#637e73',wx,y,11,16);rect(c,'#b9b599',wx+5,y,1,16);}
  if(index%3===0){rect(c,'#727e6a',x+12,base-height-15,24,15);line(c,'#8e957c',2,[[x+50,base-height],[x+50,base-height-25],[x+68,base-height-32]]);}
}
export const indianStreets = {
  name: 'Indian Streets',
  background(c, distance) {
    const sky=c.createLinearGradient(0,0,0,474);sky.addColorStop(0,'#f4dcb6');sky.addColorStop(1,'#f3e7c9');c.fillStyle=sky;c.fillRect(0,0,960,540);
    c.fillStyle='#efd09b';c.beginPath();c.arc(747,112,47,0,Math.PI*2);c.fill();
    // Slow skyline and a closer row of colorful shopfronts.
    const far=distance*.13%1200;
    for(let i=-1;i<13;i++){const x=i*103-far;const h=75+(i*i+9)%5*22;building(c,x,372,90,h,['#d3c6aa','#c9c5a8','#c6c5af'][((i%3)+3)%3],i);}
    const shift=distance*.38%1320;
    for(let i=-1;i<12;i++){
      const x=i*120-shift, h=68+((i+12)%4)*16;
      building(c,x,449,113,h,['#b8bf9d','#d7ad8c','#d6c58e','#9fb7a1'][((i%4)+4)%4],i);
      rect(c,'#546c5f',x+11,414,91,35);rect(c,'#eee1b6',x+9,398,95,18);
      c.fillStyle='#4d6558';c.font='bold 9px monospace';c.textAlign='center';c.fillText(['CHAI & CO.','GENERAL STORE','FRESH MART','AUTO WORKS'][((i%4)+4)%4],x+56,410);
      for(let a=0;a<8;a++){rect(c,a%2?'#f4dcb3':'#c98165',x+8+a*12,416,12,8);}
      if(i%3===0)palm(c,x+109,446,.8);
    }
    // Decorative wires stay behind the playable obstacles.
    const poleShift=distance*.38%480;
    c.strokeStyle='#8b9277';c.lineWidth=1;
    for(let i=-1;i<4;i++){const x=i*480-poleShift;c.beginPath();c.moveTo(x,292);c.quadraticCurveTo(x+240,342,x+480,292);c.stroke();rect(c,'#9b9e81',x,279,5,177);line(c,'#8a947a',3,[[x-18,293],[x+23,293]]);}
    rect(c,'#9da482',0,453,960,6);rect(c,'#dbcfac',0,459,960,15);rect(c,'#657367',0,474,960,66);rect(c,'#85907b',0,475,960,4);
    const road=distance%130;for(let x=-130;x<1090;x+=130)rect(c,'#c6c8a7',x-road,509,64,3);
    // A resting cow and potholes beside the road.
    const cowX=810-distance*.38%1320;
    c.fillStyle='#efead6';c.beginPath();c.ellipse(cowX,450,24,11,0,0,Math.PI*2);c.fill();rect(c,'#efead6',cowX+15,430,12,19);rect(c,'#efead6',cowX+18,427,16,9);line(c,'#7d7b65',2,[[cowX+19,429],[cowX+17,423]]);c.fillStyle='#6d7260';c.beginPath();c.ellipse(cowX-7,448,8,6,0,0,7);c.fill();
    c.fillStyle='#4c5e54';c.beginPath();c.ellipse((600-distance*.7%1200),493,33,5,0,0,7);c.fill();
  },
  obstacle(c, o) {
    const {x,width:w,top,bottom}=o;
    // Entire silhouette matches the two rectangular collision regions.
    rect(c,'#526b5e',x+6,0,w-12,top-15);rect(c,'#71856a',x+14,0,6,top-15);
    rect(c,'#3c574b',x,top-21,w,21);rect(c,'#dfad61',x+5,top-17,w-10,5);
    line(c,'#415d50',3,[[x+9,top-30],[x+w-9,top-30]]);
    rect(c,'#3a5349',x,bottom,w,474-bottom);rect(c,'#e0a661',x+4,bottom+4,w-8,474-bottom-4);
    c.save();c.beginPath();c.rect(x+4,bottom+4,w-8,474-bottom-4);c.clip();
    for(let y=bottom-70;y<490;y+=35){c.fillStyle='#41554a';c.beginPath();c.moveTo(x,y);c.lineTo(x+w,y+45);c.lineTo(x+w,y+61);c.lineTo(x,y+16);c.fill();}c.restore();
    rect(c,'#f5da97',x-2,bottom,w+4,7);rect(c,'#41564b',x-4,467,w+8,7);
  },
  car(c, car, time) {
    c.save();c.translate(car.x+39,car.y+15);c.rotate(Math.max(-.18,Math.min(.28,car.velocity/1700)));
    // Two distinct underside nozzles and a short air burst for every impulse.
    for(const x of [-23,23]){
      rect(c,'#344e49',x-6,10,12,8);rect(c,'#a2b9a0',x-4,17,8,3);
      if(car.thrust>0){const length=19+car.thrust*90+Math.sin(time*85)*5;const g=c.createLinearGradient(0,18,0,18+length);g.addColorStop(0,'#c6f8e4');g.addColorStop(1,'#c6f8e400');c.fillStyle=g;c.beginPath();c.moveTo(x-4,20);c.lineTo(x-10,20+length);c.lineTo(x+10,20+length);c.lineTo(x+4,20);c.fill();line(c,'#effff2',2,[[x,21],[x,29+length*.4]]);}
    }
    c.fillStyle='#314c47';c.beginPath();c.moveTo(-40,0);c.lineTo(-28,-7);c.lineTo(-14,-18);c.lineTo(15,-18);c.lineTo(29,-7);c.lineTo(40,-3);c.lineTo(42,8);c.quadraticCurveTo(1,18,-40,8);c.closePath();c.fill();
    c.fillStyle='#cfdfc7';c.beginPath();c.moveTo(-24,-7);c.lineTo(-12,-15);c.lineTo(12,-15);c.lineTo(23,-7);c.closePath();c.fill();line(c,'#516f62',2,[[0,-15],[3,-7]]);
    c.fillStyle='#d8ef9a';c.beginPath();c.moveTo(-40,0);c.lineTo(40,-3);c.lineTo(37,7);c.lineTo(-36,7);c.closePath();c.fill();line(c,'#b6ca80',2,[[-30,8],[27,8]]);rect(c,'#fbf6dc',31,-1,8,3);rect(c,'#c86b4f',-39,1,5,3);rect(c,'#57735b',-8,0,8,2);
    c.restore();
  }
};
