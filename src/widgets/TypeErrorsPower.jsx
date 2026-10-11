import React, { useState, useEffect } from 'react';
import { Card, Slider, Btn, Readouts, Readout, Controls, f } from '../kit/controls.jsx';
import { Plot, linePath, areaPath } from '../kit/plot.jsx';
import { normPdf, normCdf, normPpf } from '../lib/stats.js';

const MU0 = 100, SIGMA = 15;

export default function TypeErrorsPower({ n: n0 = 25, d: d0 = 0.5, alpha: a0 = 0.05 }) {
  const [n, setN] = useState(n0), [d, setD] = useState(d0), [alpha, setAlpha] = useState(a0);
  const [play, setPlay] = useState(false);
  useEffect(() => {
    if (!play) return undefined;
    const id = setInterval(() => setN((v) => { if (v >= 150) { setPlay(false); return v; } return v + 2; }), 90);
    return () => clearInterval(id);
  }, [play]);
  const se = SIGMA / Math.sqrt(n), mu1 = MU0 + d * SIGMA;
  const crit = MU0 + normPpf(1 - alpha) * se;
  const beta = normCdf(crit, mu1, se), power = 1 - beta;
  const nNeeded = d > 0 ? Math.ceil(((normPpf(1 - alpha) + normPpf(0.8)) / d) ** 2) : Infinity;
  const lo = 70, hi = 150, peak = normPdf(0, 0, se) * 1.12;
  const xs = Array.from({ length: 241 }, (_, i) => lo + (i * (hi - lo)) / 240);
  const curve = (mu) => xs.map((v) => [v, normPdf(v, mu, se)]);
  const slice = (mu, a, b) => { const pts = curve(mu).filter(([v]) => v >= a && v <= b); return pts.length > 1 ? pts : null; };
  return (
    <Card title="Type I error, Type II error and power" foot="α is the red tail of the H₀ curve, β is the amber part of the true curve left of the cut-off, and power = 1 − β is the green part. Bigger n or bigger effect pulls the curves apart, so β shrinks.">
      <Controls>
        <Slider label="Effect size d = (μ₁−μ₀)/σ" value={d} onChange={setD} min={0} max={1.5} step={0.05} />
        <Slider label="Sample size n" value={n} onChange={(v) => { setPlay(false); setN(v); }} min={4} max={150} step={1} />
        <Slider label="Significance α" value={alpha} onChange={setAlpha} min={0.01} max={0.2} step={0.005} />
        <Btn kind="primary" onClick={() => { if (n >= 150) setN(4); setPlay(!play); }}>{play ? '❚❚ Pause' : '▶ Grow n'}</Btn>
      </Controls>
      <Plot w={640} h={270} xDomain={[lo, hi]} yDomain={[0, peak]} yTicks={[]} xTicks={[70, 80, 90, 100, 110, 120, 130, 140, 150]} xLabel="sample mean x̄ (right-tailed test, σ = 15, μ₀ = 100)" ariaLabel="Null and true sampling distributions with alpha, beta and power shaded">
        {({ x, y }) => {
          const a = slice(MU0, crit, hi), b = slice(mu1, lo, crit), c = slice(mu1, crit, hi);
          return (
            <g>
              {a && <path d={areaPath(a.map(([v, w]) => [x(v), y(w)]), y(0))} fill="var(--c2)" opacity="0.55" />}
              {b && <path d={areaPath(b.map(([v, w]) => [x(v), y(w)]), y(0))} fill="var(--c4)" opacity="0.45" />}
              {c && <path d={areaPath(c.map(([v, w]) => [x(v), y(w)]), y(0))} fill="var(--c3)" opacity="0.4" />}
              <path d={linePath(curve(MU0).map(([v, w]) => [x(v), y(w)]))} fill="none" stroke="var(--ink)" strokeWidth="2.2" />
              <path d={linePath(curve(mu1).map(([v, w]) => [x(v), y(w)]))} fill="none" stroke="var(--c1)" strokeWidth="2.2" strokeDasharray={d === 0 ? '4 3' : ''} />
              <line x1={x(crit)} x2={x(crit)} y1={y(peak * 0.97)} y2={y(0)} stroke="var(--c2)" strokeWidth="2" strokeDasharray="5 3" />
              <text x={x(crit) + 5} y={y(peak * 0.93)} className="lbl-sm" fill="var(--c2)">cut-off {f(crit, 1)}</text>
              <text x={x(MU0)} y={y(normPdf(0, 0, se)) - 6} textAnchor="middle" className="lbl-sm" fill="var(--ink)">H₀ true: μ₀</text>
              <text x={x(Math.min(mu1, 140))} y={y(normPdf(0, 0, se) * 0.5)} textAnchor={mu1 > 135 ? 'end' : 'start'} dx={mu1 > 135 ? -8 : 8} className="lbl-sm" fill="var(--c1)">H₁ true: μ₁ = {f(mu1, 1)}</text>
            </g>
          );
        }}
      </Plot>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13, margin: '4px 0 2px' }}>
        <span style={{ color: 'var(--c2)' }}>■ α (Type I)</span>
        <span style={{ color: 'var(--c4)' }}>■ β (Type II)</span>
        <span style={{ color: 'var(--c3)' }}>■ power = 1 − β</span>
      </div>
      <Readouts>
        <Readout label="SE = σ/√n" value={f(se, 2)} />
        <Readout label="α (Type I)" value={f(alpha, 3)} tone="bad" />
        <Readout label="β (Type II)" value={f(beta, 3)} tone="warn" />
        <Readout label="Power 1 − β" value={f(power, 3)} tone={power >= 0.8 ? 'good' : 'warn'} />
        <Readout label="n for 80% power" value={Number.isFinite(nNeeded) ? nNeeded : '∞'} />
      </Readouts>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>
        {d === 0 ? 'With d = 0 the alternative equals the null: "power" collapses to α because there is no real effect to detect.' : power >= 0.8 ? 'Power is at or above the usual 80% target.' : 'Power is below 80%: a real effect of this size would often be missed. Try raising n.'}
      </p>
    </Card>
  );
}
