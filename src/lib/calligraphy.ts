/* Traç cal·ligràfic de plomí a 45°: gruixut en horitzontal, fi en vertical.
   El comparteixen la pissarra de la portada i el llapis del peu. */

export type Pt = { x: number; y: number };

export function drawCalli(
  ctx: CanvasRenderingContext2D,
  from: Pt,
  to:   Pt,
  prevMid: Pt | null,
  sizeMul = 1,
  color = "#111",
): Pt {
  const dx   = to.x - from.x;
  const dy   = to.y - from.y;
  if (Math.hypot(dx, dy) < 0.5) return prevMid ?? from;

  const angle    = Math.atan2(dy, dx);
  const speed    = Math.hypot(dx, dy);
  const pressure = Math.max(0, 1 - speed / 28);
  const w   = (1.2 + pressure * 1.8 + 4.8 * Math.abs(Math.cos(angle - Math.PI / 4))) * sizeMul;
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };

  ctx.beginPath();
  ctx.lineWidth   = w;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.88;
  if (prevMid) {
    ctx.moveTo(prevMid.x, prevMid.y);
    ctx.quadraticCurveTo(from.x, from.y, mid.x, mid.y);
  } else {
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(mid.x, mid.y);
  }
  ctx.stroke();
  return mid;
}
