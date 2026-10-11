import React from 'react';

export const scaleLinear = ([d0, d1], [r0, r1]) => { const k = (r1 - r0) / (d1 - d0 || 1); const s = (v) => r0 + (v - d0) * k; s.invert = (p) => d0 + (p - r0) / k; return s; };
export const linePath = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join('');
export const areaPath = (pts, baseY) => linePath(pts) + `L${pts[pts.length - 1][0].toFixed(2)},${baseY}L${pts[0][0].toFixed(2)},${baseY}Z`;
export const ticks = (lo, hi, count = 6) => {
  const span = hi - lo, raw = span / count, mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) || mag;
  const out = []; for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(10)); return out;
};

/** Responsive SVG chart frame. children receives ({ x, y, iw, ih, w, h, m }). */
export function Plot({ w = 640, h = 280, m = { t: 14, r: 16, b: 34, l: 44 }, xDomain, yDomain, xTicks, yTicks, xLabel, yLabel, children, xFmt = (v) => v, yFmt = (v) => v, grid = true, ariaLabel }) {
  const iw = w - m.l - m.r, ih = h - m.t - m.b;
  const x = scaleLinear(xDomain, [0, iw]), y = scaleLinear(yDomain, [ih, 0]);
  const xt = xTicks || ticks(xDomain[0], xDomain[1]), yt = yTicks || ticks(yDomain[0], yDomain[1], 4);
  return (
    <svg className="plot" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={ariaLabel || 'chart'} preserveAspectRatio="xMidYMid meet">
      <g transform={`translate(${m.l},${m.t})`}>
        {grid && yt.map((t) => <line key={`gy${t}`} x1={0} x2={iw} y1={y(t)} y2={y(t)} className="grid" />)}
        <line x1={0} x2={iw} y1={ih} y2={ih} className="axis" />
        <line x1={0} x2={0} y1={0} y2={ih} className="axis" />
        {xt.map((t) => <g key={`x${t}`}><line x1={x(t)} x2={x(t)} y1={ih} y2={ih + 4} className="axis" /><text x={x(t)} y={ih + 17} textAnchor="middle" className="tick">{xFmt(t)}</text></g>)}
        {yt.map((t) => <text key={`y${t}`} x={-7} y={y(t) + 4} textAnchor="end" className="tick">{yFmt(t)}</text>)}
        {xLabel && <text x={iw / 2} y={ih + 31} textAnchor="middle" className="axislabel">{xLabel}</text>}
        {yLabel && <text transform={`translate(${-34},${ih / 2}) rotate(-90)`} textAnchor="middle" className="axislabel">{yLabel}</text>}
        {children({ x, y, iw, ih, w, h, m })}
      </g>
    </svg>
  );
}
