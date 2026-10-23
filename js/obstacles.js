// Encounter geometry is shared by rendering and collision detection. Vehicle
// dimensions are fixed; layout variation never stretches an animal or vehicle.
export const OBSTACLE_TYPES = Object.freeze(['rickshaw', 'cart', 'cow', 'bus', 'crow']);
const FLOOR = 474;
const rect = (x, y, width, height, material) => ({ shape:'rect', x, y, width, height, material });
const poly = (points, material) => ({ shape:'poly', points, material });
const ellipse = (x, y, rx, ry, material) => ({ shape:'ellipse', x, y, rx, ry, material });
export function partBounds(p) {
  if (p.shape === 'ellipse') return { x:p.x-p.rx, y:p.y-p.ry, width:p.rx*2, height:p.ry*2 };
  if (p.shape === 'rect') return p;
  const xs=p.points.map(v=>v[0]), ys=p.points.map(v=>v[1]);
  return { x:Math.min(...xs), y:Math.min(...ys), width:Math.max(...xs)-Math.min(...xs), height:Math.max(...ys)-Math.min(...ys) };
}
function wheel(x, parts) { parts.push(ellipse(x, FLOOR-10, 10, 10, 'tyre')); }
function rickshaw(x, parts) {
  parts.push(poly([[x+3,440],[x+87,440],[x+99,445],[x+103,459],[x+3,459]],'autoBody'));
  parts.push(poly([[x+5,440],[x+9,411],[x+19,405],[x+20,440]],'autoBody'));
  parts.push(rect(x+62,409,5,31,'frame'),rect(x+21,434,36,7,'seat'));
  parts.push(poly([[x+5,412],[x+8,405],[x+15,400],[x+27,397],[x+54,397],[x+65,400],[x+75,408],[x+64,410]],'hood'));
  parts.push(poly([[x+67,411],[x+75,417],[x+83,436],[x+68,433]],'glass'));
  wheel(x+23,parts);wheel(x+85,parts);
}
function bus(x, parts) {
  parts.push(poly([[x,452],[x,382],[x+6,374],[x+152,374],[x+165,382],[x+174,429],[x+174,460],[x+2,460]],'busBody'));
  parts.push(rect(x+19,366,116,8,'luggage'));
  wheel(x+31,parts);wheel(x+142,parts);
}
function cart(x, parts) {
  parts.push(rect(x+5,444,84,13,'wood'));
  parts.push(rect(x+11,425,70,19,'crate'));
  for(let i=0;i<5;i++)parts.push(ellipse(x+18+i*13,425-(i%2)*3,7,6,i%2?'greens':'tomato'));
  parts.push(rect(x+87,447,9,4,'wood'));
  wheel(x+23,parts);wheel(x+72,parts);
}
function cow(x, parts) {
  parts.push(ellipse(x+39,452,31,17,'cow'));
  parts.push(ellipse(x+32,436,10,6,'cow'));
  parts.push(poly([[x+55,453],[x+58,435],[x+65,427],[x+71,432],[x+73,453]],'cow'));
  parts.push(ellipse(x+72,438,8,12,'cow'));
  parts.push(ellipse(x+77,446,11,7,'muzzle'));
  parts.push(ellipse(x+62,434,9,4,'cow'));
  parts.push(ellipse(x+24,467,15,5,'cowLeg'));
  parts.push(ellipse(x+54,467,14,5,'cowLeg'));
  parts.push(poly([[x+65,431],[x+63,423],[x+70,431]],'horn'));
  parts.push(poly([[x+74,431],[x+79,424],[x+78,434]],'horn'));
}
export function crowPose(o) {
  const age=o.age??0;
  return { y:(o.flightY??132)+Math.sin(age*2.4)*6, flap:Math.sin(age*10)*12 };
}
function crow(o,parts) {
  const {y,flap}=crowPose(o);
  parts.push(poly([[43,y],[62,y-4],[57,y+5],[41,y+5]],'feather'));
  parts.push(ellipse(33,y,14,7,'crow'));
  parts.push(ellipse(18,y-4,8,7,'crow'));
  parts.push(poly([[11,y-6],[3,y-2],[12,y]],'beak'));
  parts.push(poly([[28,y],[40,y+flap-18],[58,y+flap-9],[41,y+4]],'wing'));
}
export function obstacleShape(o) {
  const parts=[];
  switch(o.kind) {
    case 'bus':bus(0,parts);break;
    case 'cow':cow(0,parts);break;
    case 'cart':cart(0,parts);break;
    case 'crow':crow(o,parts);break;
    default:rickshaw(0,parts);
  }
  return { parts };
}
// Progress depends only on active flight time. Rates are capped and existing
// birds keep their original speed and lane; difficulty never jerks them around.
export function difficultyAt(seconds) {
  const progress=Math.max(0,Math.min(1,seconds/90));
  return {
    progress,
    spacing:440-140*progress,
    birdEvery:seconds<30?3:seconds<60?2:1,
    birdSpeed:240+30*progress,
    flock:seconds>=75,
  };
}
export function createEncounter(index, roll = .5, progress = 0) {
  const kind=OBSTACLE_TYPES[index%OBSTACLE_TYPES.length];
  const widths={rickshaw:105,bus:174,cow:96,crow:64,cart:96};
  const p=Math.max(0,Math.min(1,progress));
  return {kind,width:widths[kind],flightY:110+roll*(56+72*p),age:0,speed:kind==='crow'?240+30*p:190,routeY:323};
}
function rectOverlap(a,b) { return a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y; }
export function intersectsPart(box, p) {
  if(!rectOverlap(box,partBounds(p)))return false;
  if(p.shape==='rect')return true;
  if(p.shape==='ellipse') {
    const x=Math.max(box.x,Math.min(p.x,box.x+box.width));
    const y=Math.max(box.y,Math.min(p.y,box.y+box.height));
    return ((x-p.x)/p.rx)**2+((y-p.y)/p.ry)**2<1;
  }
  // Separating axis test for a rectangle and a convex polygon. The rectangle's
  // horizontal/vertical axes were already checked by the bounding-box test.
  const corners=[[box.x,box.y],[box.x+box.width,box.y],[box.x+box.width,box.y+box.height],[box.x,box.y+box.height]];
  for(let i=0;i<p.points.length;i++) {
    const a=p.points[i],b=p.points[(i+1)%p.points.length],nx=-(b[1]-a[1]),ny=b[0]-a[0];
    const polygon=p.points.map(v=>v[0]*nx+v[1]*ny),rectangle=corners.map(v=>v[0]*nx+v[1]*ny);
    if(Math.max(...polygon)<=Math.min(...rectangle)||Math.max(...rectangle)<=Math.min(...polygon))return false;
  }
  return true;
}
export function hitsObstacle(box,o) {
  const local={...box,x:box.x-o.x};
  return obstacleShape(o).parts.some(p=>intersectsPart(local,p));
}
