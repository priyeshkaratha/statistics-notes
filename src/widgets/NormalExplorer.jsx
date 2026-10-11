import React, { useState, useRef, useEffect } from 'react';
import { Card, Slider, Seg, Btn, Readouts, Readout, Controls, f } from '../kit/controls.jsx';
import { Plot, areaPath, linePath } from '../kit/plot.jsx';
import { normPdf, normCdf } from '../lib/stats.js';

const reduced = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export default function NormalExplorer({ mu: mu0 = 120, sigma: s0 = 15 }) {
  const [mu, setMu] = useState(mu0);
  const [sigma, setSigma] = useState(s0);
  const [a, setA] = useState(mu0 + s0);
  const [b, setB] = useState(mu0 + 2 * s0);
  const [mode, setMode] = useState('left');
  const raf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const d0 = mu - 4 * sigma, d1 = mu + 4 * sigma;
  const aC = clamp(a, d0, d1), bC = clamp(b, d0, d1);
  const lo = Math.min(aC, bC), hi = Math.max(aC, bC);
  const za = (aC - mu) / sigma, zb = (bC - mu) / sigma;
  const between = normCdf(hi, mu, sigma) - normCdf(lo, mu, sigma);
  const prob = mode === 'left' ? normCdf(aC, mu, sigma) : mode === 'right' ? 1 - normCdf(aC, mu, sigma) : mode === 'between' ? between : 1 - between;
  const two = mode === 'between' || mode === 'outside';
  const label = mode === 'left' ? `P(X < ${f(aC, 2)})` : mode === 'right' ? `P(X > ${f(aC, 2)})` : mode === 'between' ? `P(${f(lo, 2)} < X < ${f(hi, 2)})` : `P(X < ${f(lo, 2)} or X > ${f(hi, 2)})`;

  const go = (ta, tb, m) => {
    if (m) setMode(m);
    cancelAnimationFrame(raf.current);
    if (reduced()) { setA(ta); setB(tb); return; }
    const a0 = a, b0 = b, t0 = performance.now();
    const step = (now) => { const u = Math.min(1, (now - t0) / 650), e = 1 - (1 - u) ** 3; setA(a0 + (ta - a0) * e); setB(b0 + (tb - b0) * e); if (u < 1) raf.current = requestAnimationFrame(step); };
    raf.current = requestAnimationFrame(step);
  };
  const preset = (k) => go(mu - k * sigma, mu + k * sigma, 'between');

  const grid = Array.from({ length: 161 }, (_, i) => d0 + (i * (d1 - d0)) / 160);
  const seg = (u, v) => grid.filter((g) => g >= u && g <= v);
  const m = { t: 18, r: 16, b: 46, l: 44 };
  const drag = (which, x) => (e) => {
    if (e.buttons === 0 && e.type === 'pointermove') return;
    const svg = e.currentTarget.ownerSVGElement, pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const v = clamp(x.invert(p.x - m.l), d0, d1);
    (which === 'a' ? setA : setB)(v);
  };

  return (
    <Card title="Normal explorer: area = probability" foot="Standardise with $z=(x-\\mu)/\\sigma$: the same area under N(0,1) gives the same probability. Drag the handles on the curve.">
      <Controls>
        <Slider label="μ (mean)" value={mu} onChange={setMu} min={-10} max={200} fmt={(v) => f(v, 1)} />
        <Slider label="σ (SD)" value={sigma} onChange={setSigma} min={0.5} max={40} step={0.5} fmt={(v) => f(v, 1)} />
      </Controls>
      <Controls>
        <Seg label="region" value={mode} onChange={setMode} options={[{ value: 'left', label: 'Left tail' }, { value: 'right', label: 'Right tail' }, { value: 'between', label: 'Between' }, { value: 'outside', label: 'Outside' }]} />
        <Btn onClick={() => preset(1)}>μ±1σ</Btn><Btn onClick={() => preset(2)}>μ±2σ</Btn><Btn onClick={() => preset(3)}>μ±3σ</Btn>
      </Controls>
      <Plot w={640} h={290} m={m} xDomain={[d0, d1]} yDomain={[0, normPdf(mu, mu, sigma) * 1.15]} yTicks={[]} xTicks={[-3, -2, -1, 0, 1, 2, 3].map((z) => mu + z * sigma)} xFmt={(v) => f(v, 1)} grid={false} ariaLabel="normal curve with shaded probability">
        {({ x, y, ih }) => {
          const C = (u, v) => { const g = seg(u, v); const pts = [[u, 0], ...g.map((q) => [q, normPdf(q, mu, sigma)]), [v, 0]].map(([q, h]) => [x(q), y(h)]); return areaPath(pts, ih); };
          const shade = mode === 'left' ? [[d0, aC]] : mode === 'right' ? [[aC, d1]] : mode === 'between' ? [[lo, hi]] : [[d0, lo], [hi, d1]];
          const H = (which, v) => (
            <g key={which} style={{ cursor: 'ew-resize' }}>
              <line x1={x(v)} x2={x(v)} y1={0} y2={ih} stroke="var(--c2)" strokeWidth="2" />
              <rect x={x(v) - 14} y={0} width={28} height={ih} fill="transparent" onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)} onPointerMove={drag(which, x)} />
              <circle cx={x(v)} cy={10} r="8" fill="var(--c2)" stroke="var(--surface)" strokeWidth="2" pointerEvents="none" />
              <text x={x(v)} y={-5} textAnchor="middle" className="lbl" fill="var(--c2)">{which === 'a' && !two ? 'c' : which} = {f(v, 2)}</text>
            </g>
          );
          return (
            <g>
              {shade.map(([u, v], i) => u < v && <path key={i} d={C(u, v)} fill="var(--c1)" opacity="0.4" />)}
              <path d={linePath(grid.map((q) => [x(q), y(normPdf(q, mu, sigma))]))} fill="none" stroke="var(--c1)" strokeWidth="2.5" />
              <line x1={x(mu)} x2={x(mu)} y1={y(normPdf(mu, mu, sigma))} y2={ih} stroke="var(--muted)" strokeDasharray="4 4" />
              {[-3, -2, -1, 0, 1, 2, 3].map((z) => <text key={z} x={x(mu + z * sigma)} y={ih + 31} textAnchor="middle" className="lbl-sm">z={z}</text>)}
              <text x={x(mu)} y={y(normPdf(mu, mu, sigma) * 0.45)} textAnchor="middle" className="lbl" fill="var(--ink)">{f(prob * 100, 2)}%</text>
              {H('a', aC)}{two && H('b', bC)}
            </g>
          );
        }}
      </Plot>
      <Readouts>
        <Readout label={label} value={f(prob, 4)} tone="good" />
        <Readout label={two ? 'z of a, z of b' : 'z of c'} value={two ? `${f(za, 2)}, ${f(zb, 2)}` : f(za, 3)} />
        <Readout label="unshaded area" value={f(1 - prob, 4)} />
      </Readouts>
    </Card>
  );
}
