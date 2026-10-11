import React, { useState } from 'react';
import { Card, Slider, Seg, Readouts, Readout, Controls, f } from '../kit/controls.jsx';
import { Plot, linePath } from '../kit/plot.jsx';
import { binomPmf, binomCdf, normPdf, normCdf } from '../lib/stats.js';

export default function NormalApproxBinomial() {
  const [n, setN] = useState(40);
  const [p, setP] = useState(0.3);
  const [k, setK] = useState(15);
  const [cc, setCc] = useState('with');
  const kk = Math.min(k, n);
  const mu = n * p, sd = Math.sqrt(n * p * (1 - p));
  const edge = cc === 'with' ? kk + 0.5 : kk;
  const exact = binomCdf(kk, n, p), withCc = normCdf(kk + 0.5, mu, sd), without = normCdf(kk, mu, sd);
  const ok = n * p >= 10 && n * (1 - p) >= 10;
  const lo = Math.max(0, Math.floor(mu - 4.5 * sd)), hi = Math.min(n, Math.ceil(mu + 4.5 * sd));
  const xs = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  const ymax = Math.max(...xs.map((i) => binomPmf(i, n, p)), normPdf(mu, mu, sd)) * 1.2;
  return (
    <Card title="Normal approximation to the binomial" foot="Approximate Bin($n,p$) by N($np$, $np(1-p)$) when $np\\ge10$ and $n(1-p)\\ge10$, and use the continuity correction: $P(X\\le k)\\approx P(Y<k+0.5)$.">
      <Controls>
        <Slider label="n" value={n} onChange={setN} min={5} max={100} />
        <Slider label="p" value={p} onChange={setP} min={0.05} max={0.95} step={0.05} />
        <Slider label="k (find P(X ≤ k))" value={kk} onChange={setK} min={0} max={n} />
        <Seg label="boundary" value={cc} onChange={setCc} options={[{ value: 'with', label: 'With correction (k + 0.5)' }, { value: 'none', label: 'No correction (k)' }]} />
      </Controls>
      <Plot xDomain={[lo - 0.5, hi + 0.5]} yDomain={[0, ymax]} xLabel="x" yFmt={(v) => f(v, 2)} ariaLabel="binomial bars with normal curve">
        {({ x, y, ih }) => {
          const bw = Math.max(2, (x(1) - x(0)) * 0.82), g = Array.from({ length: 121 }, (_, i) => lo - 0.5 + (i * (hi - lo + 1)) / 120);
          const sh = g.filter((q) => q <= edge);
          return (
            <g>
              {xs.map((i) => <rect key={i} x={x(i) - bw / 2} width={bw} y={y(binomPmf(i, n, p))} height={ih - y(binomPmf(i, n, p))} style={{ y: y(binomPmf(i, n, p)), height: ih - y(binomPmf(i, n, p)), transition: 'y .3s, height .3s' }} fill={i <= kk ? 'var(--c2)' : 'var(--c1)'} opacity={i <= kk ? 0.85 : 0.35} />)}
              {sh.length > 1 && <path d={`${linePath(sh.map((q) => [x(q), y(normPdf(q, mu, sd))]))}L${x(sh[sh.length - 1])},${ih}L${x(sh[0])},${ih}Z`} fill="var(--c5)" opacity="0.18" />}
              <path d={linePath(g.map((q) => [x(q), y(normPdf(q, mu, sd))]))} fill="none" stroke="var(--c5)" strokeWidth="2.5" />
              <line x1={x(edge)} x2={x(edge)} y1={0} y2={ih} stroke="var(--c4)" strokeWidth="2" strokeDasharray="5 4" style={{ transition: 'all .3s' }} />
              <text x={x(edge) + 5} y={12} className="lbl" fill="var(--c4)">boundary {f(edge, 1)}</text>
            </g>
          );
        }}
      </Plot>
      <Readouts>
        <Readout label="exact Bin P(X ≤ k)" value={f(exact, 4)} tone="good" />
        <Readout label="normal, with k+0.5" value={f(withCc, 4)} tone={Math.abs(withCc - exact) <= Math.abs(without - exact) ? 'good' : ''} />
        <Readout label="normal, no correction" value={f(without, 4)} />
        <Readout label="np, n(1−p)" value={`${f(mu, 1)}, ${f(n * (1 - p), 1)}`} tone={ok ? 'good' : 'bad'} />
      </Readouts>
      <p style={{ fontSize: 13.5, color: 'var(--ink2)', margin: '8px 0 0' }}>{ok ? 'Both np and n(1−p) are at least 10: the normal curve is a good fit.' : 'np or n(1−p) is below 10: the bars are skewed and the normal curve is a poor fit. Use the exact binomial.'}</p>
    </Card>
  );
}
