import React, { useState } from 'react';
import { Card, Btn, Seg, Readouts, Readout, f } from '../kit/controls.jsx';
import { chi2Cdf, chi2Critical } from '../lib/stats.js';

const SETS = {
  emporium: { label: 'Emporium (n = 180)', n: 180, cats: ['Children', 'Teenagers', 'Adults', 'Seniors'], p: [0.05, 0.38, 0.55, 0.02], obs: [25, 50, 90, 15] },
  die: { label: 'Fair die (n = 120)', n: 120, cats: ['1', '2', '3', '4', '5', '6'], p: Array(6).fill(1 / 6), obs: [25, 17, 15, 23, 24, 16] },
  orders: { label: 'Orders (n = 400)', n: 400, cats: ['A', 'B', 'C', 'D'], p: [0.25, 0.25, 0.25, 0.25], obs: [88, 112, 95, 105] },
};

export default function GoodnessOfFitBars({ set = 'emporium' }) {
  const [key, setKey] = useState(SETS[set] ? set : 'emporium');
  const S = SETS[key];
  const [obs, setObs] = useState([...S.obs]);
  const [alpha, setAlpha] = useState(0.05);

  const load = (k) => { setKey(k); setObs([...SETS[k].obs]); };
  const total = obs.reduce((s, x) => s + x, 0);
  const E = S.p.map((p) => S.n * p);
  const C = obs.map((o, i) => (o - E[i]) ** 2 / E[i]);
  const stat = C.reduce((s, x) => s + x, 0);
  const df = S.cats.length - 1;
  const crit = chi2Critical(alpha, df);
  const p = 1 - chi2Cdf(stat, df);
  const reject = stat > crit;
  const ymax = Math.max(10, ...obs, ...E) * 1.12;
  const W = 640, H = 250, m = { l: 40, r: 10, t: 14, b: 34 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b, bw = iw / S.cats.length;
  const Y = (v) => ih - (v / ymax) * ih;
  const mismatch = total !== S.n;

  return (
    <Card title="Observed vs expected counts" foot="χ² adds up (O−E)²/E over the bars. Big gaps relative to a small expected count (Seniors: 15 vs 3.6) contribute the most.">
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
        {Object.entries(SETS).map(([k, s]) => <Btn key={k} kind={k === key ? 'primary' : 'ghost'} onClick={() => load(k)}>{s.label}</Btn>)}
        <Btn kind="ghost" onClick={() => setObs(E.map((e) => Math.round(e)))}>Set O ≈ E</Btn>
        <span style={{ fontSize: 13, color: 'var(--ink2)' }}>α <Seg options={[{ value: 0.1, label: '0.10' }, { value: 0.05, label: '0.05' }, { value: 0.01, label: '0.01' }]} value={alpha} onChange={setAlpha} label="alpha" /></span>
      </div>
      <svg className="plot" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Observed versus expected bar chart">
        <g transform={`translate(${m.l},${m.t})`}>
          {[0, 0.25, 0.5, 0.75, 1].map((q) => <g key={q}><line x1={0} x2={iw} y1={Y(q * ymax)} y2={Y(q * ymax)} className="grid" /><text x={-6} y={Y(q * ymax) + 4} textAnchor="end" className="tick">{Math.round(q * ymax)}</text></g>)}
          <line x1={0} x2={iw} y1={ih} y2={ih} className="axis" />
          {S.cats.map((cat, i) => {
            const x0 = i * bw + bw * 0.12, w = bw * 0.76;
            return (
              <g key={cat}>
                <rect x={x0} width={w * 0.5} y={Y(obs[i])} height={ih - Y(obs[i])} rx="3" fill="var(--c1)" style={{ transition: 'all .35s ease' }} />
                <rect x={x0 + w * 0.5} width={w * 0.5} y={Y(E[i])} height={ih - Y(E[i])} rx="3" fill="var(--c3)" opacity="0.75" style={{ transition: 'all .35s ease' }} />
                <text x={x0 + w * 0.25} y={Y(obs[i]) - 4} textAnchor="middle" className="lbl-sm" fill="var(--c1)">{obs[i]}</text>
                <text x={x0 + w * 0.75} y={Y(E[i]) - 4} textAnchor="middle" className="lbl-sm" fill="var(--c3)">{f(E[i], 1)}</text>
                <text x={i * bw + bw / 2} y={ih + 16} textAnchor="middle" className="tick">{cat}</text>
                <text x={i * bw + bw / 2} y={ih + 29} textAnchor="middle" className="tick" fill="var(--c2)">χ² part {f(C[i], 2)}</text>
              </g>
            );
          })}
          <g transform={`translate(${iw - 150},0)`}><rect width="10" height="10" fill="var(--c1)" /><text x="14" y="9" className="lbl-sm">Observed O</text><rect y="14" width="10" height="10" fill="var(--c3)" opacity="0.75" /><text x="14" y="23" className="lbl-sm">Expected E = n·p</text></g>
        </g>
      </svg>
      <div className="controls" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))' }}>
        {S.cats.map((cat, i) => (
          <label key={cat} className="slider">
            <span className="slider-label"><span>{cat}</span><b className="mono">{obs[i]}</b></span>
            <input type="range" min={0} max={Math.round(S.n * 0.8)} step={1} value={obs[i]} onChange={(e) => setObs(obs.map((x, j) => (j === i ? parseInt(e.target.value, 10) : x)))} />
          </label>
        ))}
      </div>
      {mismatch && <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '2px 0' }}>Observed total is {total}, but the expected counts assume n = {S.n}. Keep the total at {S.n} for a valid test.</p>}
      <Readouts>
        <Readout label="χ² = Σ(O−E)²/E" value={f(stat, 2)} />
        <Readout label={`df = k − 1`} value={`${df}`} />
        <Readout label={`critical (α=${alpha})`} value={f(crit, 3)} />
        <Readout label="p-value" value={p < 0.0001 ? '< 0.0001' : f(p, 4)} tone={reject ? 'bad' : 'good'} />
        <Readout label="decision" value={reject ? 'Reject H0 (no fit)' : 'Fail to reject (fits)'} tone={reject ? 'bad' : 'good'} />
      </Readouts>
    </Card>
  );
}
