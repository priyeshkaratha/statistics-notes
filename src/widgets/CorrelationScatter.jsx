import React, { useState, useRef, useEffect } from 'react';
import { Card, Controls, Btn, Seg, Readouts, Readout, f } from '../kit/controls.jsx';
import { Plot } from '../kit/plot.jsx';
import { mean, covariance, correlation, regression, seededRandom, randNormal, sampleSD } from '../lib/stats.js';

const W = 640, H = 340, M = { t: 14, r: 16, b: 34, l: 44 };
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const ranks = (a) => a.map((v) => { const lt = a.filter((u) => u < v).length, eq = a.filter((u) => u === v).length; return lt + (eq + 1) / 2; });

/* x spread evenly in [lo,hi]; y built so that Pearson r equals rho EXACTLY (noise orthogonalised against x). */
function make(rho, n = 12, lo = 1, hi = 9, seed = 7, cy = 5, s = 2.2) {
  const rng = seededRandom(seed);
  const xs = Array.from({ length: n }, (_, i) => lo + ((hi - lo) * ((i * 5) % n)) / (n - 1));
  const mx = mean(xs), sx = sampleSD(xs), zx = xs.map((v) => (v - mx) / sx);
  let e = Array.from({ length: n }, () => randNormal(rng));
  const dot = (p, q) => p.reduce((t, v, i) => t + v * q[i], 0);
  const me = mean(e); e = e.map((v) => v - me);
  const b = dot(e, zx) / dot(zx, zx); e = e.map((v, i) => v - b * zx[i]);
  const se = Math.sqrt(dot(e, e) / (n - 1)); e = e.map((v) => v / se);
  return xs.map((v, i) => [v, clamp(cy + s * (rho * zx[i] + Math.sqrt(1 - rho * rho) * e[i]), 0.3, 9.7)]);
}
const base = make(0.95, 11, 1, 4, 3, 6, 0.9);
const PRE = {
  pos: { label: 'r ≈ +1', pts: () => make(0.98) },
  zero: { label: 'r ≈ 0', pts: () => make(0) },
  neg: { label: 'r ≈ −1', pts: () => make(-0.98) },
  mid: { label: 'r ≈ +0.6', pts: () => make(0.6) },
  curve: { label: 'U-curve (r≈0!)', pts: () => Array.from({ length: 12 }, (_, i) => { const x = 0.8 + (8.4 * i) / 11; return [x, 0.8 + ((x - 5) / 4.2) ** 2 * 7.6]; }) },
  out: { label: 'Outlier flips r', pts: () => [...base, [9.5, 0.3]] },
};

export default function CorrelationScatter() {
  const [pts, setPts] = useState(PRE.pos.pts);
  const [line, setLine] = useState(true), [quad, setQuad] = useState(true);
  const [drag, setDrag] = useState(-1);
  const raf = useRef(0), cur = useRef(pts); cur.current = pts;
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const go = (target) => { // morph all points (or jump if counts differ / reduced motion)
    cancelAnimationFrame(raf.current);
    const from = cur.current, reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const m = Math.min(from.length, target.length);
    if (reduce || from.length < 3) { setPts(target); return; }
    const t0 = performance.now(), dur = 900;
    const tick = (now) => {
      const u = Math.min(1, (now - t0) / dur), e = u * u * (3 - 2 * u);
      setPts(target.map(([tx, ty], i) => { const [fx, fy] = from[i < m ? i : m - 1]; return [fx + (tx - fx) * e, fy + (ty - fy) * e]; }));
      if (u < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), n = pts.length;
  const ok = n >= 3 && sampleSD(xs) > 1e-9 && sampleSD(ys) > 1e-9;
  const r = ok ? correlation(xs, ys) : NaN;
  const cov = n > 1 ? covariance(xs, ys) : NaN;
  const rho = ok ? correlation(ranks(xs), ranks(ys)) : NaN;
  const reg = ok ? regression(xs, ys) : null;
  const mx = mean(xs), my = mean(ys);
  const strength = !ok ? '—' : Math.abs(r) >= 0.7 ? 'strong' : Math.abs(r) >= 0.3 ? 'moderate' : 'weak / none';

  return (
    <Card title="Scatter lab: drag the points, watch r and covariance" foot="r is the average product of z-scores: points in the green quadrants push r **up**, red quadrants push it **down**. One outlier can flip it.">
      <Controls>
        {Object.entries(PRE).map(([k, p]) => <Btn key={k} kind={k === 'out' ? 'primary' : 'ghost'} onClick={() => go(p.pts())}>{p.label}</Btn>)}
      </Controls>
      <Controls>
        <Seg label="Regression line" options={[{ value: true, label: 'Line on' }, { value: false, label: 'Line off' }]} value={line} onChange={setLine} />
        <Seg label="Quadrants" options={[{ value: true, label: 'Quadrants on' }, { value: false, label: 'Quadrants off' }]} value={quad} onChange={setQuad} />
        <Btn kind="ghost" onClick={() => { cancelAnimationFrame(raf.current); setPts((p) => p.slice(0, -1)); }} disabled={n <= 3}>Remove last</Btn>
      </Controls>
      <Plot w={W} h={H} m={M} xDomain={[0, 10]} yDomain={[0, 10]} xTicks={[0, 2, 4, 6, 8, 10]} yTicks={[0, 2, 4, 6, 8, 10]} xLabel="x (drag points; tap empty space to add one)" yLabel="y" ariaLabel="Scatter plot with draggable points">
        {({ x, y, iw, ih }) => {
          const toData = (e) => {
            const svg = e.currentTarget.ownerSVGElement || e.currentTarget, rc = svg.getBoundingClientRect();
            return [clamp(x.invert(((e.clientX - rc.left) / rc.width) * W - M.l), 0, 10), clamp(y.invert(((e.clientY - rc.top) / rc.height) * H - M.t), 0, 10)];
          };
          return (
            <g>
              {quad && ok && <g>
                <rect x={x(mx)} y={0} width={iw - x(mx)} height={y(my)} fill="var(--c3)" opacity="0.12" />
                <rect x={0} y={y(my)} width={x(mx)} height={ih - y(my)} fill="var(--c3)" opacity="0.12" />
                <rect x={0} y={0} width={x(mx)} height={y(my)} fill="var(--c2)" opacity="0.12" />
                <rect x={x(mx)} y={y(my)} width={iw - x(mx)} height={ih - y(my)} fill="var(--c2)" opacity="0.12" />
              </g>}
              <rect x={0} y={0} width={iw} height={ih} fill="transparent" style={{ touchAction: 'none' }}
                onPointerDown={(e) => { if (n < 30) { cancelAnimationFrame(raf.current); const p = toData(e); setPts((q) => [...q, p]); setDrag(n); e.currentTarget.setPointerCapture(e.pointerId); } }}
                onPointerMove={(e) => { if (drag >= 0 && e.currentTarget.hasPointerCapture(e.pointerId)) { const p = toData(e); setPts((q) => q.map((v, i) => (i === drag ? p : v))); } }}
                onPointerUp={() => setDrag(-1)} />
              {ok && <g stroke="var(--muted)" strokeDasharray="4 4" strokeWidth="1"><line x1={x(mx)} x2={x(mx)} y1={0} y2={ih} /><line x1={0} x2={iw} y1={y(my)} y2={y(my)} /></g>}
              {line && reg && <line x1={x(0)} y1={y(reg.b0)} x2={x(10)} y2={y(reg.b0 + reg.b1 * 10)} stroke="var(--c4)" strokeWidth="2.5" />}
              {pts.map(([px, py], i) => (
                <circle key={i} cx={x(px)} cy={y(py)} r={drag === i ? 9 : 7} fill={i === drag ? 'var(--c2)' : 'var(--c1)'} stroke="var(--surface)" strokeWidth="2" style={{ cursor: 'grab', touchAction: 'none' }}
                  onPointerDown={(e) => { e.stopPropagation(); cancelAnimationFrame(raf.current); setDrag(i); e.currentTarget.setPointerCapture(e.pointerId); }}
                  onPointerMove={(e) => { if (drag === i && e.currentTarget.hasPointerCapture(e.pointerId)) { const p = toData(e); setPts((q) => q.map((v, j) => (j === i ? p : v))); } }}
                  onPointerUp={() => setDrag(-1)} />
              ))}
            </g>
          );
        }}
      </Plot>
      <Readouts>
        <Readout label="Pearson r" value={ok ? f(r, 3) : '—'} tone={!ok ? '' : Math.abs(r) > 0.7 ? 'good' : Math.abs(r) < 0.3 ? 'warn' : ''} />
        <Readout label="r² (variation explained)" value={ok ? f(r * r, 3) : '—'} />
        <Readout label="Sample covariance" value={f(cov, 3)} />
        <Readout label="Spearman ρ (ranks)" value={ok ? f(rho, 3) : '—'} />
        <Readout label="Strength" value={strength} />
        <Readout label="n" value={n} />
      </Readouts>
      {line && reg && <p className="muted" style={{ margin: '8px 0 0', fontSize: 14 }}>Line: ŷ = {f(reg.b0, 2)} {reg.b1 < 0 ? '−' : '+'} {f(Math.abs(reg.b1), 2)}x. Try <b>Outlier flips r</b>: one far point can turn a strong positive r negative, while Spearman ρ moves less. Try <b>U-curve</b>: perfect relationship, yet r = 0.</p>}
    </Card>
  );
}
