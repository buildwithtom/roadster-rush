// Theme-specific solid parts. Rendering and collision both consume these;
// encounter roles keep the established sizes, spacing, and progression.
const rect = (x, y, width, height, material) => ({ shape: 'rect', x, y, width, height, material });
const poly = (points, material) => ({ shape: 'poly', points, material });
const ellipse = (x, y, rx, ry, material) => ({ shape: 'ellipse', x, y, rx, ry, material });
export function starshipParts() {
  // Tip at 356 keeps the full y=258..355 cruise corridor open. Separate
  // convex fins and landing feet preserve the empty silhouette corners.
  return [
    poly([[25,382],[27,372],[36,356],[45,372],[47,382],[47,461],[25,461]],'steel'),
    poly([[25,380],[25,405],[18,409],[19,390]],'flap'),
    poly([[47,380],[47,405],[54,409],[53,390]],'flap'),
    poly([[25,425],[25,461],[11,467],[14,447]],'flap'),
    poly([[47,425],[47,461],[61,467],[58,447]],'flap'),
    poly([[23,458],[27,459],[21,471],[17,471]],'leg'),
    poly([[45,459],[49,458],[55,471],[51,471]],'leg'),
    ellipse(36,463,7,4,'engine'),
    rect(11,470,13,4,'foot'),rect(48,470,13,4,'foot'),
  ];
}
export function marsObstacleShape(o) {
  if(o.kind==='starship')return {parts:starshipParts()};
  const parts = [];
  const wheel = x => parts.push(ellipse(x, 464, 10, 10, 'wheel'));
  switch (o.kind) {
    case 'rickshaw': // Pressurized exploration rover.
      parts.push(poly([[7,435],[19,426],[77,426],[99,440],[101,455],[6,455]], 'shell'));
      parts.push(poly([[24,428],[27,406],[57,401],[70,426]], 'shell'));
      parts.push(poly([[30,409],[55,405],[64,426],[29,426]], 'glass'));
      parts.push(rect(16,398,58,4,'solar'), rect(45,402,3,5,'metal'));
      for (const x of [21,53,86]) wheel(x);
      break;
    case 'cart': // Stacked supply pods.
      parts.push(rect(7,447,82,25,'cargo'),rect(14,422,64,25,'shell'));
      parts.push(rect(11,415,70,7,'metal'));
      parts.push(rect(5,469,88,5,'metal'));
      break;
    case 'cow': // A low, angular basalt boulder.
      parts.push(poly([[5,474],[9,450],[26,431],[51,423],[75,434],[91,456],[90,474]],'rock'));
      break;
    case 'bus': // Long expedition crawler.
      parts.push(poly([[3,449],[6,389],[21,374],[137,374],[162,396],[172,433],[172,455]],'shell'));
      parts.push(rect(22,367,112,7,'solar'));
      parts.push(poly([[138,385],[155,400],[162,422],[138,422]],'glass'));
      for (const x of [25,66,108,150]) wheel(x);
      break;
    case 'crow': { // Survey drone, using the same predictable flight lane.
      const y = (o.flightY ?? 132) + Math.sin((o.age ?? 0) * 2.4) * 6;
      parts.push(rect(9,y-2,46,4,'metal'));
      parts.push(ellipse(32,y,13,7,'shell'));
      parts.push(ellipse(9,y,6,4,'engine'),ellipse(55,y,6,4,'engine'));
      parts.push(rect(28,y+5,8,5,'glass'));
      break;
    }
  }
  return { parts };
}
