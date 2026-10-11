import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, Controls, Slider, Btn, Readouts, Readout, f } from '../kit/controls.jsx';
import { Plot, linePath, areaPath } from '../kit/plot.jsx';
import { normPdf } from '../lib/stats.js';

/* Numerically build a density: g(t)=exp(-|t|^beta) (beta=2 normal-like, <2 heavy tails, >2 flat top)
   skewed with the Azzalini trick f(t) = g(t) * G(alpha t). All moments are integrated numerically. */
const L = 30, N = 6001, H = (2 * L) / (N - 1);

function build(alpha, beta) {
  const t = new Float64Array(N), g = new Float64Array(N), G = new Float64Array(N);
  let c = 0;
  for (let i = 0; i < N; i++) {
    t[i] = -L + i * H; g[i] = Math.exp(-Math.pow(Math.abs(t[i]), beta));
    if (i) c += 0.5 * (g[i] + g[i - 1]) * H;
    G[i] = c;
  }
  for (let i = 0; i < N; i++) G[i] /= c;
  const Gat = (v) => {
    if (v <= -L) return 0; if (v >= L) return 1;
    const p = (v + L) / H, i = Math.floor(p), w = p - i;
    return G[i] * (1 - w) + G[Math.min(N - 1, i + 1)] * w;
  };
  const fd = new Float64Array(N); let tot = 0;
  for (let i = 0; i < N; i++) { fd[i] = g[i] * Gat(alpha * t[i]); tot += fd[i] * H; }
  let mean = 0; for (let i = 0; i < N; i++) { fd[i] /= tot; mean += t[i] * fd[i] * H; }
  let m2 = 0, m3 = 0, m4 = 0, cum = 0, med = 0, mi = 0, found = false;
  for (let i = 0; i < N; i++) {
    const d = t[i] - mean; m2 += d * d * fd[i] * H; m3 += d ** 3 * fd[i] * H; m4 += d ** 4 * fd[i] * H;
    cum += fd[i] * H; if (!found && cum >= 0.5) { med = t[i]; found = true; }
    if (fd[i] > fd[mi]) mi = i;
  }
  const sd = Math.sqrt(m2);
  const pts = [];
  for (let i = 0; i < N; i += 4) { const z = (t[i] - mean) / sd; if (z >= -5.6 && z <= 5.6) pts.push([z, fd[i] * sd]); }
  return { pts, medZ: (med - mean) / sd, modeZ: (t[mi] - mean) / sd, skew: m3 / sd ** 3, exK: m4 / sd ** 4 - 3 };
}

const PRESETS = [
  { n: 'Symmetric bell', a: 0, b: 2 }, { n: 'Right skew', a: 6, b: 2 }, { n: 'Left skew', a: -6, b: 2 },
  { n: 'Heavy tails', a: 0, b: 1 }, { n: 'Flat top', a: 0, b: 6 },
];

export default function SkewKurtosisShape() {
  const [a, setA] = useState(5), [b, setB] = useState(2), [ref, setRef] = useState(true), [sweep, setSweep] = useState(false);
  const dir = useRef(1);
  useEffect(() => {
    if (!sweep) return undefined;
    const id = setInterval(() => setA((v) => { let n = v + dir.current * 0.25; if (n >= 8) { n = 8; dir.current = -1; } if (n <= -8) { n = -8; dir.current = 1; } return n; }), 60);
    return () => clearInterval(id);
  }, [sweep]);
  const d = useMemo(() => build(a, b), [a, b]);
  const ymax = Math.max(0.45, ...d.pts.map((p) => p[1])) * 1.12;
  const shape = d.skew > 0.5 ? 'right-skewed (positive)' : d.skew < -0.5 ? 'left-skewed (negative)' : 'roughly symmetric';
  const tails = d.exK > 0.5 ? 'leptokurtic (heavy tails, peaked)' : d.exK < -0.5 ? 'platykurtic (light tails, flat)' : 'mesokurtic (normal-like)';
  const order = d.skew > 0.15 ? 'mean > median > mode' : d.skew < -0.15 ? 'mean < median < mode' : 'mean ≈ median ≈ mode';
  const mk = [['mean', 0, 'var(--c2)', 14], ['median', d.medZ, 'var(--c3)', 30], ['mode', d.modeZ, 'var(--c4)', 46]];
  const ref0 = Array.from({ length: 113 }, (_, i) => -5.6 + i * 0.1);
  return (
    <Card title="Shape lab: skewness and kurtosis" foot="Skewness drags the **mean** toward the long tail (mean–median–mode fan out); excess kurtosis measures tail weight, **not** pointiness alone.">
      <Controls>
        <Slider label="Skew control (tail direction)" value={a} onChange={(v) => { setSweep(false); setA(v); }} min={-8} max={8} step={0.25} fmt={(v) => f(v, 2)} />
        <Slider label="Tail weight (low = heavy tails, high = flat top)" value={b} onChange={setB} min={0.8} max={6} step={0.1} fmt={(v) => f(v, 1)} />
      </Controls>
      <Controls>
        {PRESETS.map((p) => <Btn key={p.n} kind="ghost" onClick={() => { setSweep(false); setA(p.a); setB(p.b); }}>{p.n}</Btn>)}
        <Btn kind="primary" onClick={() => setSweep((s) => !s)}>{sweep ? 'Pause sweep' : 'Sweep skew'}</Btn>
        <Btn kind="ghost" onClick={() => setRef((r) => !r)}>{ref ? 'Hide' : 'Show'} normal reference</Btn>
      </Controls>
      <Plot xDomain={[-5, 5]} yDomain={[0, ymax]} xTicks={[-4, -2, 0, 2, 4]} yTicks={[]} xLabel="standardised units (mean = 0, SD = 1)" ariaLabel="Density with mean, median and mode markers" grid={false}>
        {({ x, y, ih }) => (
          <g>
            <path d={areaPath(d.pts.map(([z, v]) => [x(z), y(v)]), ih)} fill="var(--c1)" opacity="0.22" />
            <path d={linePath(d.pts.map(([z, v]) => [x(z), y(v)]))} fill="none" stroke="var(--c1)" strokeWidth="2.5" />
            {ref && <path d={linePath(ref0.map((z) => [x(z), y(normPdf(z))]))} fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeDasharray="5 4" />}
            {mk.map(([n, z, col, ty]) => (
              <g key={n} style={{ transition: 'transform .15s' }}>
                <line x1={x(z)} x2={x(z)} y1={ty + 6} y2={ih} stroke={col} strokeWidth="2" strokeDasharray={n === 'mean' ? '' : '4 3'} />
                <text x={x(z) + 4} y={ty + 4} className="lbl-sm" fill={col}>{n}</text>
              </g>
            ))}
          </g>
        )}
      </Plot>
      <Readouts>
        <Readout label="Skewness" value={f(d.skew, 2)} tone={Math.abs(d.skew) > 0.5 ? 'warn' : 'good'} />
        <Readout label="Excess kurtosis" value={f(d.exK, 2)} tone={Math.abs(d.exK) > 0.5 ? 'warn' : 'good'} />
        <Readout label="Kurtosis (raw)" value={f(d.exK + 3, 2)} />
        <Readout label="Order" value={order} />
      </Readouts>
      <p className="muted" style={{ margin: '8px 0 0', fontSize: 14 }}>This shape is <b>{shape}</b> and <b>{tails}</b>. Dashed grey = normal curve (skewness 0, excess kurtosis 0).</p>
    </Card>
  );
}
