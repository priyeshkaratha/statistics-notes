import React, { useState } from 'react';
import { Card, Controls, Seg, Slider, Btn, Readouts, Readout, f } from '../kit/controls.jsx';
import { Plot, linePath } from '../kit/plot.jsx';

const PROBS = {
  circ: { label: 'min x²+y²', f: (x, y) => x * x + y * y, g: (x, y) => [2 * x, 2 * y], opt: (c) => [c / 2, c / 2], mode: 'min', c: 10, name: 'x²+y²' },
  ell: { label: 'min x²+4y²', f: (x, y) => x * x + 4 * y * y, g: (x, y) => [2 * x, 8 * y], opt: (c) => [(4 * c) / 5, c / 5], mode: 'min', c: 6, name: 'x²+4y²' },
  prod: { label: 'max xy', f: (x, y) => x * y, g: (x, y) => [y, x], opt: (c) => [c / 2, c / 2], mode: 'max', c: 12, name: 'xy' },
};
const FR = [0.25, 0.5, 0.75, 1, 1.4, 2, 2.8];
const contour = (key, L) => {
  if (key === 'prod') { const lo = L / 30; return Array.from({ length: 121 }, (_, i) => { const x = lo * Math.pow(30 / lo, i / 120); return [x, L / x]; }); }
  const a = Math.sqrt(L), b = key === 'circ' ? a : a / 2;
  return Array.from({ length: 121 }, (_, i) => { const t = (2 * Math.PI * i) / 120; return [a * Math.cos(t), b * Math.sin(t)]; });
};
const arrow = (px, py, dx, dy, col) => {
  const L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, tx = px + dx, ty = py + dy, h = 7;
  return <g><line x1={px} y1={py} x2={tx} y2={ty} stroke={col} strokeWidth="2.5" /><polygon points={`${tx},${ty} ${tx - h * ux + h * 0.5 * uy},${ty - h * uy - h * 0.5 * ux} ${tx - h * ux - h * 0.5 * uy},${ty - h * uy + h * 0.5 * ux}`} fill={col} /></g>;
};

export default function LagrangeViz() {
  const [key, setKey] = useState('circ');
  const [c, setC] = useState(PROBS.circ.c);
  const [t, setT] = useState(2);
  const P = PROBS[key];
  const feasLo = key === 'prod' ? 0 : -1, feasHi = key === 'prod' ? c : c + 1;
  const tt = Math.min(Math.max(t, feasLo), feasHi);
  const [ox, oy] = P.opt(c), fstar = P.f(ox, oy);
  const px = tt, py = c - tt, fv = P.f(px, py);
  const [gx, gy] = P.g(px, py);
  const gn = Math.hypot(gx, gy) || 1;
  const cross = gx - gy, lam = -gx; // grad g = (1,1); grad f = -lambda grad g
  const atOpt = Math.abs(tt - ox) < 0.06;
  const pick = (k) => { setKey(k); setC(PROBS[k].c); setT(2); };
  const D = [-1, 14];
  const along = Array.from({ length: 81 }, (_, i) => { const u = feasLo + ((feasHi - feasLo) * i) / 80; return [u, P.f(u, c - u)]; });
  const fmax = Math.max(...along.map((a) => a[1])), fmin = Math.min(...along.map((a) => a[1]));

  return (
    <Card title="Lagrange: slide along the constraint x + y = c" foot="At the constrained optimum the level curve of $f$ just touches the constraint line, so $\nabla f$ is parallel to $\nabla g$ ($\lambda$ is the multiplier). Move off that point and $f$ gets worse along the line.">
      <Controls>
        <div><div className="slider-label">Objective</div><Seg options={Object.entries(PROBS).map(([v, o]) => ({ value: v, label: o.label }))} value={key} onChange={pick} label="objective" /></div>
        <Slider label="Constraint level c" value={c} onChange={setC} min={2} max={12} step={0.5} fmt={(v) => f(v, 1)} />
        <Slider label="Position x on the line" value={tt} onChange={setT} min={feasLo} max={feasHi} step={0.05} fmt={(v) => f(v, 2)} />
        <div><Btn onClick={() => setT(ox)}>Snap to optimum</Btn></div>
      </Controls>
      <div style={{ maxWidth: 470, margin: '0 auto' }}>
        <Plot w={392} h={380} xDomain={D} yDomain={D} xLabel="x" yLabel="y" ariaLabel="Contours of the objective, the constraint line and gradient arrows">
          {({ x, y, iw, ih }) => (
            <g>
              <clipPath id="lgv-clip"><rect width={iw} height={ih} /></clipPath>
              <g clipPath="url(#lgv-clip)">
                {FR.map((fr) => { const L = fr * fstar; const hot = fr === 1; return <path key={fr} d={linePath(contour(key, L).map(([a, b]) => [x(a), y(b)]))} fill="none" stroke={hot ? 'var(--c2)' : 'var(--muted)'} strokeWidth={hot ? 2.5 : 1} opacity={hot ? 1 : 0.55} />; })}
                <path d={linePath(contour(key, Math.max(fv, 1e-6)).map(([a, b]) => [x(a), y(b)]))} fill="none" stroke="var(--c4)" strokeWidth="2" strokeDasharray="5 3" />
                <line x1={x(feasLo)} y1={y(c - feasLo)} x2={x(feasHi)} y2={y(c - feasHi)} stroke="var(--c1)" strokeWidth="3" />
                {arrow(x(px), y(py), (gx / gn) * 38, -(gy / gn) * 38, 'var(--c3)')}
                {arrow(x(px), y(py), 0.7071 * 38, -0.7071 * 38, 'var(--c5)')}
                <circle cx={x(ox)} cy={y(oy)} r="5" fill="none" stroke="var(--c2)" strokeWidth="2" />
                <circle cx={x(px)} cy={y(py)} r="7" fill="var(--c4)" stroke="var(--surface)" strokeWidth="2" />
              </g>
            </g>
          )}
        </Plot>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '4px 0' }}>Blue: constraint. Grey/red: level curves of f (red = the one that touches the line). Amber dashed: level curve through your point. Green arrow: ∇f. Purple arrow: ∇g = (1,1). Arrows show direction only.</p>
      <Plot h={150} m={{ t: 10, r: 16, b: 30, l: 50 }} xDomain={[feasLo, feasHi]} yDomain={[Math.max(0, fmin - 0.05 * (fmax - fmin)) * (key === 'prod' ? 0 : 1), fmax * 1.05]} xLabel="x (with y = c − x)" yLabel="f along line" ariaLabel="Objective value along the constraint line">
        {({ x, y }) => (
          <g>
            <path d={linePath(along.map(([a, b]) => [x(a), y(b)]))} fill="none" stroke="var(--c1)" strokeWidth="2" />
            <circle cx={x(ox)} cy={y(fstar)} r="5" fill="none" stroke="var(--c2)" strokeWidth="2" />
            <circle cx={x(px)} cy={y(fv)} r="6" fill="var(--c4)" stroke="var(--surface)" strokeWidth="1.5" />
          </g>
        )}
      </Plot>
      <Readouts>
        <Readout label="point (x, y)" value={`(${f(px, 2)}, ${f(py, 2)})`} />
        <Readout label={`f = ${P.name}`} value={f(fv, 3)} tone={atOpt ? 'good' : ''} />
        <Readout label={P.mode === 'min' ? 'constrained min' : 'constrained max'} value={f(fstar, 3)} />
        <Readout label="λ here (∇f = −λ∇g, x-part)" value={f(lam, 2)} />
        <Readout label="∇f × ∇g (0 = parallel)" value={f(cross, 3)} tone={atOpt ? 'good' : 'warn'} />
        <Readout label="optimum (x*, y*)" value={`(${f(ox, 2)}, ${f(oy, 2)})`} />
      </Readouts>
    </Card>
  );
}
