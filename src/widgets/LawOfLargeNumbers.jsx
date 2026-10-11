import React, { useState, useEffect, useMemo } from 'react';
import { Card, Seg, Slider, Btn, Readouts, Readout, f } from '../kit/controls.jsx';
import { Plot, linePath } from '../kit/plot.jsx';
import { seededRandom } from '../lib/stats.js';

const MAX = 5000;
const dice2 = () => { const m = {}; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) m[a + b] = (m[a + b] || 0) + 1 / 36; return m; };
const EXPS = {
  coin: { label: 'Coin (head = 1)', pmf: { 0: 0.5, 1: 0.5 } },
  die: { label: 'Fair die', pmf: { 1: 1 / 6, 2: 1 / 6, 3: 1 / 6, 4: 1 / 6, 5: 1 / 6, 6: 1 / 6 } },
  two: { label: 'Sum of 2 dice', pmf: dice2() },
  game: { label: 'Game: +5 or −1', pmf: { '-1': 0.8, 5: 0.2 } },
};
const SPEEDS = [1, 3, 10, 40, 150];

export default function LawOfLargeNumbers() {
  const [exp, setExp] = useState('die'), [seed, setSeed] = useState(11), [n, setN] = useState(20);
  const [play, setPlay] = useState(false), [si, setSi] = useState(2);
  const { vals, probs, mu, sd } = useMemo(() => {
    const e = Object.entries(EXPS[exp].pmf).map(([k, p]) => [Number(k), p]);
    const v = e.map((x) => x[0]), p = e.map((x) => x[1]);
    const m = v.reduce((s, x, i) => s + x * p[i], 0);
    return { vals: v, probs: p, mu: m, sd: Math.sqrt(v.reduce((s, x, i) => s + x * x * p[i], 0) - m * m) };
  }, [exp]);
  const draws = useMemo(() => { // all MAX draws generated up-front from a seeded RNG, so the run is reproducible
    const r = seededRandom(seed * 101 + 7), cum = probs.map((_, i) => probs.slice(0, i + 1).reduce((s, x) => s + x, 0));
    return Array.from({ length: MAX }, () => { const u = r(); const i = cum.findIndex((c) => u <= c + 1e-12); return vals[i < 0 ? vals.length - 1 : i]; });
  }, [seed, vals, probs]);
  const run = useMemo(() => { let s = 0; return draws.map((x, i) => { s += x; return s / (i + 1); }); }, [draws]);

  useEffect(() => {
    if (!play) return undefined;
    const id = setInterval(() => setN((k) => { const nk = Math.min(MAX, k + SPEEDS[si]); if (nk >= MAX) setPlay(false); return nk; }), 70);
    return () => clearInterval(id);
  }, [play, si]);

  const xbar = run[n - 1], total = xbar * n;
  const counts = vals.map((v) => { let c = 0; for (let i = 0; i < n; i++) if (draws[i] === v) c++; return c; });
  const pick = (k) => { setExp(k); setN(20); setPlay(false); };
  const lg = (k) => Math.log10(k);
  const pts = []; for (let i = 0; i < n; i += Math.max(1, Math.floor(i / 400))) pts.push(i); if (n > 0 && pts[pts.length - 1] !== n - 1) pts.push(n - 1);
  const funnel = (sgn) => Array.from({ length: 61 }, (_, i) => { const k = 10 ** (i * lg(MAX) / 60); return [k, mu + sgn * 2 * sd / Math.sqrt(k)]; });
  const lo = mu - 2.4 * sd, hi = mu + 2.4 * sd;
  const bmax = Math.max(...probs, ...counts.map((c) => c / Math.max(1, n)));

  return (
    <Card title="Law of large numbers" foot="The **running average** settles on E[X] as n grows (the band shrinks like 2σ/√n) — but the **total** can drift further from n·μ. Averages converge, not totals.">
      <Seg options={Object.entries(EXPS).map(([value, o]) => ({ value, label: o.label }))} value={exp} onChange={pick} label="Experiment" />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', margin: '10px 0' }}>
        <Btn kind="primary" onClick={() => { if (n >= MAX) setN(1); setPlay(!play); }}>{play ? 'Pause' : n >= MAX ? 'Replay' : 'Play'}</Btn>
        <Btn onClick={() => { setPlay(false); setN((k) => Math.min(MAX, k + 1)); }}>+1 trial</Btn>
        <Btn onClick={() => { setPlay(false); setN((k) => Math.min(MAX, k + 100)); }}>+100</Btn>
        <Btn kind="ghost" onClick={() => { setPlay(false); setN(1); }}>Reset</Btn>
        <Btn kind="ghost" onClick={() => { setSeed((s) => s + 1); setN(20); setPlay(false); }}>New random run</Btn>
        <div style={{ minWidth: 150, flex: '1 1 150px' }}><Slider label="Speed" value={si} onChange={setSi} min={0} max={SPEEDS.length - 1} step={1} fmt={(v) => `${SPEEDS[v]} / tick`} /></div>
      </div>
      <Plot w={640} h={270} xDomain={[0, lg(MAX)]} yDomain={[lo, hi]} xTicks={[0, 1, 2, 3, lg(MAX)]} xFmt={(v) => (Math.abs(v - lg(MAX)) < 1e-6 ? '5000' : String(Math.round(10 ** v)))} yTicks={undefined} xLabel="number of trials n (log scale)" yLabel="running average" ariaLabel="Running average of the trials converging to the expected value">
        {({ x, y, iw }) => (
          <g>
            <path d={linePath(funnel(1).map(([k, v]) => [x(lg(k)), y(v)])) + linePath(funnel(-1).reverse().map(([k, v]) => [x(lg(k)), y(v)])).replace('M', 'L') + 'Z'} fill="var(--c1)" opacity=".1" />
            <line x1="0" x2={iw} y1={y(mu)} y2={y(mu)} stroke="var(--c2)" strokeWidth="1.6" strokeDasharray="6 4" />
            <text x={iw - 4} y={y(mu) - 6} textAnchor="end" className="lbl-sm" style={{ fill: 'var(--c2)', fontWeight: 700 }}>E[X] = {f(mu, 3)}</text>
            <path d={linePath(pts.map((i) => [x(lg(i + 1)), y(Math.min(hi, Math.max(lo, run[i])))]))} fill="none" stroke="var(--c1)" strokeWidth="2.2" strokeLinejoin="round" />
            <circle cx={x(lg(n))} cy={y(Math.min(hi, Math.max(lo, xbar)))} r="5" fill="var(--c1)" stroke="var(--surface)" strokeWidth="2" />
          </g>
        )}
      </Plot>
      <svg className="plot" viewBox={`0 0 640 ${vals.length > 8 ? 120 : 120}`} role="img" aria-label="Observed relative frequencies against theoretical probabilities" style={{ marginTop: 4 }}>
        {vals.map((v, i) => { const bw = 600 / vals.length, x0 = 20 + i * bw, h = 78, fr = counts[i] / Math.max(1, n); return (
          <g key={v}>
            <rect x={x0 + bw * 0.18} y={86 - (fr / bmax) * h} width={bw * 0.64} height={(fr / bmax) * h} fill="var(--c1)" opacity=".8" rx="3" />
            <line x1={x0 + bw * 0.1} x2={x0 + bw * 0.9} y1={86 - (probs[i] / bmax) * h} y2={86 - (probs[i] / bmax) * h} stroke="var(--c2)" strokeWidth="2.5" />
            <text x={x0 + bw / 2} y={102} textAnchor="middle" className="tick">{v}</text>
            <text x={x0 + bw / 2} y={115} textAnchor="middle" className="tick" style={{ fill: 'var(--c1)' }}>{f(fr, 3)}</text>
          </g>); })}
      </svg>
      <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 4px' }}>Bars = observed relative frequency, red line = true P(x). Both pmf and mean are simulated from a seeded generator, so a given run is reproducible.</p>
      <Readouts>
        <Readout label="Trials n" value={n} />
        <Readout label="Running average" value={f(xbar, 4)} tone="good" />
        <Readout label="|average − E[X]|" value={f(Math.abs(xbar - mu), 4)} tone="warn" />
        <Readout label="Total − n·E[X]" value={f(total - n * mu, 1)} />
      </Readouts>
    </Card>
  );
}
