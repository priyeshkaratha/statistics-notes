import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Controls, Slider, Btn, Readouts, Readout, f } from '../kit/controls.jsx';
import { Plot } from '../kit/plot.jsx';
import { regression, mean, seededRandom, randNormal, sum } from '../lib/stats.js';

const N = 16, SMAX = 3, SLOPE = 1;
const X = Array.from({ length: N }, (_, i) => 1 + i * 0.6);

// fixed unit noise, made uncorrelated with x and scaled to sd 1, so the true slope stays put while sigma changes
const unitNoise = () => {
  const g = seededRandom(11), z = X.map(() => randNormal(g)), r = regression(X, z);
  const e = z.map((v, i) => v - (r.b0 + r.b1 * X[i])), sd = Math.sqrt(sum(e.map((v) => v * v)) / (N - 1));
  return e.map((v) => v / sd);
};

export default function RSquaredVariation() {
  const [sigma, setSigma] = useState(1);
  const [hi, setHi] = useState(11);
  const [play, setPlay] = useState(false);
  const dir = useRef(1);
  const Z = useMemo(unitNoise, []);

  useEffect(() => {
    if (!play) return undefined;
    const id = setInterval(() => setSigma((v) => {
      const nv = v + dir.current * 0.03;
      if (nv >= SMAX) { dir.current = -1; return SMAX; }
      if (nv <= 0) { dir.current = 1; return 0; }
      return nv;
    }), 40);
    return () => clearInterval(id);
  }, [play]);

  const Y = X.map((x, i) => 2 + SLOPE * x + sigma * Z[i]);
  const r = regression(X, Y), ybar = mean(Y);
  const sst = r.ssTot, sse = r.ssRes, ssr = Math.max(0, sst - sse), r2 = r.r2;
  const maxSst = SLOPE ** 2 * sum(X.map((x) => (x - mean(X)) ** 2)) + (N - 1) * SMAX ** 2;
  const yh = (x) => r.b0 + r.b1 * x;
  const i = hi - 1, px = X[i];
  const pct = (v) => `${(v / maxSst) * 100}%`;

  return (
    <Card title="R² = how much of the total variation the line explains" foot="$SST = SSR + SSE$ and $R^2 = SSR/SST$. More noise inflates SSE, shrinks the explained share, and drags R² towards 0.">
      <Controls>
        <Slider label="Noise around the line (σ)" value={sigma} onChange={(v) => { setPlay(false); setSigma(v); }} min={0} max={SMAX} step={0.05} fmt={(v) => f(v, 2)} />
        <Slider label="Highlight point #" value={hi} onChange={setHi} min={1} max={N} step={1} />
        <div><Btn kind="primary" onClick={() => setPlay((p) => !p)}>{play ? 'Pause' : 'Play noise sweep'}</Btn></div>
      </Controls>
      <Plot h={290} xDomain={[0, 11]} yDomain={[-6, 20]} xLabel="x" yLabel="y" ariaLabel="Scatter with fitted line, mean line and the variation split for one highlighted point">
        {({ x, y }) => (
          <g>
            <line x1={x(0)} x2={x(11)} y1={y(ybar)} y2={y(ybar)} stroke="var(--muted)" strokeWidth="2" strokeDasharray="6 4" />
            <text x={x(11) - 4} y={y(ybar) - 6} textAnchor="end" className="lbl-sm" fill="var(--muted)">ȳ (mean line)</text>
            <line x1={x(0)} x2={x(11)} y1={y(yh(0))} y2={y(yh(11))} stroke="var(--c1)" strokeWidth="3" />
            {X.map((xx, k) => <line key={k} x1={x(xx)} x2={x(xx)} y1={y(Y[k])} y2={y(yh(xx))} stroke="var(--c2)" strokeOpacity="0.3" strokeWidth="1.5" />)}
            {X.map((xx, k) => <circle key={k} cx={x(xx)} cy={y(Y[k])} r={k === i ? 7 : 4.5} fill={k === i ? 'var(--c4)' : 'var(--c1)'} stroke="var(--surface)" strokeWidth="1.5" style={{ transition: 'cy .12s' }} />)}
            <line x1={x(px) + 9} x2={x(px) + 9} y1={y(ybar)} y2={y(yh(px))} stroke="var(--c3)" strokeWidth="6" strokeLinecap="round" />
            <line x1={x(px) + 9} x2={x(px) + 9} y1={y(yh(px))} y2={y(Y[i])} stroke="var(--c2)" strokeWidth="6" strokeLinecap="round" />
            <text x={x(px) + 20} y={y((ybar + yh(px)) / 2) + 4} className="lbl-sm" fill="var(--c3)">explained</text>
            <text x={x(px) + 20} y={y((yh(px) + Y[i]) / 2) + 4} className="lbl-sm" fill="var(--c2)">unexplained</text>
          </g>
        )}
      </Plot>
      <div style={{ margin: '10px 0 4px', fontSize: 12.5, color: 'var(--ink2)' }}>Total variation SST, split into explained (SSR) and unexplained (SSE):</div>
      <div style={{ background: 'var(--surface2)', borderRadius: 8, height: 26, overflow: 'hidden', display: 'flex' }} aria-label="stacked bar of SSR and SSE">
        <div style={{ width: pct(ssr), background: 'var(--c3)', transition: 'width .15s' }} title="SSR" />
        <div style={{ width: pct(sse), background: 'var(--c2)', transition: 'width .15s' }} title="SSE" />
      </div>
      <div style={{ margin: '8px 0 4px', fontSize: 12.5, color: 'var(--ink2)' }}>The same bar as a share of SST. The green part is R²:</div>
      <div style={{ background: 'var(--c2)', borderRadius: 8, height: 26, overflow: 'hidden' }}>
        <div style={{ width: `${Math.max(0, r2) * 100}%`, height: '100%', background: 'var(--c3)', color: 'var(--bg)', fontSize: 12, fontWeight: 700, lineHeight: '26px', paddingLeft: 8, whiteSpace: 'nowrap', transition: 'width .15s' }}>{r2 > 0.12 ? `R² = ${f(r2, 3)}` : ''}</div>
      </div>
      <Readouts>
        <Readout label="SST" value={f(sst, 2)} />
        <Readout label="SSR (explained)" value={f(ssr, 2)} tone="good" />
        <Readout label="SSE (unexplained)" value={f(sse, 2)} tone="bad" />
        <Readout label="R² = SSR/SST" value={f(r2, 3)} />
        <Readout label="r" value={f(Math.sqrt(Math.max(0, r2)), 3)} />
        <Readout label="slope b₁" value={f(r.b1, 3)} />
      </Readouts>
    </Card>
  );
}
