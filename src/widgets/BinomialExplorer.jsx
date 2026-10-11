import React, { useState, useEffect, useMemo } from 'react';
import { Card, Slider, Seg, Btn, Readouts, Readout, Controls, f } from '../kit/controls.jsx';
import { Plot } from '../kit/plot.jsx';
import { binomPmf, seededRandom } from '../lib/stats.js';

const reduced = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function BinomialExplorer({ n: n0 = 10, p: p0 = 0.3 }) {
  const [n, setN] = useState(n0);
  const [p, setP] = useState(p0);
  const [k, setK] = useState(3);
  const [k2, setK2] = useState(6);
  const [mode, setMode] = useState('eq');
  const [seed, setSeed] = useState(0);
  const [shown, setShown] = useState(0);

  const kk = Math.min(k, n), kk2 = Math.min(k2, n);
  const lo = mode === 'btw' ? Math.min(kk, kk2) : kk, hi = Math.max(kk, kk2);
  const inSel = (i) => (mode === 'eq' ? i === kk : mode === 'le' ? i <= kk : mode === 'ge' ? i >= kk : i >= lo && i <= hi);
  const pmf = useMemo(() => Array.from({ length: n + 1 }, (_, i) => binomPmf(i, n, p)), [n, p]);
  const prob = pmf.reduce((s, v, i) => s + (inSel(i) ? v : 0), 0);
  const mean = n * p, sd = Math.sqrt(n * p * (1 - p));
  const label = mode === 'eq' ? `P(X = ${kk})` : mode === 'le' ? `P(X ≤ ${kk})` : mode === 'ge' ? `P(X ≥ ${kk})` : `P(${lo} ≤ X ≤ ${hi})`;

  // animated experiment: n Bernoulli trials revealed one by one
  const trials = useMemo(() => { const r = seededRandom(seed * 9973 + n * 31 + Math.round(p * 1000)); return Array.from({ length: n }, () => r() < p); }, [seed, n, p]);
  useEffect(() => {
    if (seed === 0) { setShown(0); return undefined; }
    if (reduced()) { setShown(n); return undefined; }
    setShown(0);
    const id = setInterval(() => setShown((s) => { if (s >= n) { clearInterval(id); return s; } return s + 1; }), 70);
    return () => clearInterval(id);
  }, [seed, n, p]);
  const x_ = seed === 0 ? null : trials.slice(0, shown).filter(Boolean).length;
  const done = seed > 0 && shown >= n;

  const ymax = Math.max(...pmf) * 1.2;
  return (
    <Card title="Binomial explorer: Bin(n, p)" foot="Mean = $np$, variance = $np(1-p)$. For 'at least k' use the complement: $P(X\\ge k)=1-P(X\\le k-1)$.">
      <Controls>
        <Slider label="n (trials)" value={n} onChange={setN} min={1} max={50} />
        <Slider label="p (success prob.)" value={p} onChange={setP} min={0.01} max={0.99} step={0.01} />
      </Controls>
      <Controls>
        <Seg label="what to shade" value={mode} onChange={setMode} options={[{ value: 'eq', label: 'X = k' }, { value: 'le', label: 'X ≤ k' }, { value: 'ge', label: 'X ≥ k' }, { value: 'btw', label: 'a ≤ X ≤ b' }]} />
        <Slider label={mode === 'btw' ? 'a' : 'k'} value={kk} onChange={setK} min={0} max={n} />
        {mode === 'btw' && <Slider label="b" value={kk2} onChange={setK2} min={0} max={n} />}
      </Controls>
      <Plot xDomain={[-0.5, n + 0.5]} yDomain={[0, ymax]} xLabel="number of successes x" yLabel="P(X = x)" yFmt={(v) => f(v, 2)} ariaLabel="binomial probability bars">
        {({ x, y, ih }) => {
          const bw = Math.max(2, (x(1) - x(0)) * 0.82);
          return (
            <g>
              <rect x={x(Math.max(-0.5, mean - sd))} width={x(Math.min(n + 0.5, mean + sd)) - x(Math.max(-0.5, mean - sd))} y={0} height={ih} fill="var(--c4)" opacity="0.13" />
              {pmf.map((v, i) => (
                <g key={i}>
                  <rect x={x(i) - bw / 2} width={bw} y={y(v)} height={ih - y(v)} style={{ y: y(v), height: ih - y(v), transition: 'y .35s ease, height .35s ease, fill .2s' }} fill={inSel(i) ? 'var(--c2)' : 'var(--c1)'} opacity={inSel(i) ? 1 : 0.4} rx="1.5" />
                  {n <= 12 && <text x={x(i)} y={y(v) - 4} textAnchor="middle" className="lbl-sm">{v < 0.0005 ? '0' : v.toFixed(3).replace(/^0/, '')}</text>}
                </g>
              ))}
              <line x1={x(mean)} x2={x(mean)} y1={0} y2={ih} stroke="var(--c5)" strokeWidth="2" strokeDasharray="5 4" />
              <text x={x(mean) + 5} y={12} className="lbl" fill="var(--c5)">np = {f(mean, 2)}</text>
              {done && <g><path d={`M${x(x_) - 6},${y(pmf[x_]) - 24}h12l-6,10z`} fill="var(--c3)" /><text x={x(x_)} y={y(pmf[x_]) - 28} textAnchor="middle" className="lbl" fill="var(--c3)">this run</text></g>}
            </g>
          );
        }}
      </Plot>
      <Readouts>
        <Readout label={label} value={f(prob, 4)} tone="good" />
        <Readout label="1 − that" value={f(1 - prob, 4)} />
        <Readout label="mean np" value={f(mean, 2)} />
        <Readout label="SD √(np(1−p))" value={f(sd, 3)} />
      </Readouts>
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Btn kind="primary" onClick={() => setSeed((s) => s + 1)}>Run {n} trials</Btn>
          <span style={{ fontSize: 14, color: 'var(--ink2)' }}>{seed === 0 ? 'Each circle is one Bernoulli trial: green = success (prob. p).' : <>Successes so far: <b className="mono">{x_}</b> / {shown} {done && <b style={{ color: 'var(--c3)' }}>→ X = {x_}</b>}</>}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8, minHeight: 22 }} aria-label="trial outcomes">
          {trials.map((t, i) => (
            <span key={i} style={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid var(--line)', background: i < shown ? (t ? 'var(--c3)' : 'var(--surface2)') : 'transparent', transform: i < shown ? 'scale(1)' : 'scale(0.4)', transition: 'transform .2s, background .2s' }} />
          ))}
        </div>
      </div>
    </Card>
  );
}
