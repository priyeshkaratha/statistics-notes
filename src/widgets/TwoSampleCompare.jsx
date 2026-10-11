import React, { useMemo, useState } from 'react';
import { Card, Controls, Seg, Slider, Readouts, Readout, NumList, parseNums, f } from '../kit/controls.jsx';
import { Plot } from '../kit/plot.jsx';
import { mean, sampleVariance, tCdf, tCritical, seededRandom } from '../lib/stats.js';

const PRESETS = {
  ab: { label: 'Warehouse A vs B', a: '32 35 29 38 34 31 36 33', b: '38 41 36 44 39 40 37 42', method: 'pooled' },
  welch: { label: 'Unequal spread', a: '12 15 11 18 14 20 9 16', b: '22 35 18 41 27 12 38 30 25', method: 'welch' },
  none: { label: 'No real difference', a: '34 31 36 33 38 29 35 32', b: '33 36 30 35 37 31 34 36', method: 'pooled' },
};

export function twoSample(a, b, method, alpha) {
  const n1 = a.length, n2 = b.length, m1 = mean(a), m2 = mean(b), v1 = sampleVariance(a), v2 = sampleVariance(b);
  let se, df, sp2 = null;
  if (method === 'pooled') {
    sp2 = ((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2);
    se = Math.sqrt(sp2 * (1 / n1 + 1 / n2)); df = n1 + n2 - 2;
  } else {
    const q1 = v1 / n1, q2 = v2 / n2;
    se = Math.sqrt(q1 + q2); df = (q1 + q2) ** 2 / (q1 ** 2 / (n1 - 1) + q2 ** 2 / (n2 - 1));
  }
  const diff = m1 - m2, t = diff / se, p = 2 * (1 - tCdf(Math.abs(t), df)), tc = tCritical(alpha, df);
  return { n1, n2, m1, m2, v1, v2, sp2, se, df, diff, t, p, tc, lo: diff - tc * se, hi: diff + tc * se };
}

const Dot = ({ cx, cy, color }) => <circle r="5.5" cx="0" cy="0" fill={color} fillOpacity="0.8" stroke="var(--surface)" strokeWidth="1.2" style={{ transform: `translate(${cx}px,${cy}px)`, transition: 'transform .5s ease' }} />;

export default function TwoSampleCompare() {
  const [preset, setPreset] = useState('ab');
  const [aTxt, setA] = useState(PRESETS.ab.a), [bTxt, setB] = useState(PRESETS.ab.b);
  const [method, setMethod] = useState('pooled');
  const [alpha, setAlpha] = useState(0.05);
  const [shift, setShift] = useState(0);
  const pick = (k) => { setPreset(k); setA(PRESETS[k].a); setB(PRESETS[k].b); setMethod(PRESETS[k].method); setShift(0); };
  const A = parseNums(aTxt), B0 = parseNums(bTxt), B = B0.map((v) => v + shift);
  const ok = A.length >= 2 && B.length >= 2;
  const r = useMemo(() => (ok ? twoSample(A, B, method, alpha) : null), [aTxt, bTxt, method, alpha, shift]); // eslint-disable-line
  const jit = useMemo(() => { const g = seededRandom(7); return Array.from({ length: 40 }, () => (g() - 0.5) * 0.7); }, []);
  if (!ok) return <Card title="Two-sample comparison"><NumList label="Group A (need 2+ numbers)" value={aTxt} onChange={setA} /><NumList label="Group B (need 2+ numbers)" value={bTxt} onChange={setB} /></Card>;

  const all = [...A, ...B0];
  const lo = Math.floor(Math.min(...all) - 9), hi = Math.ceil(Math.max(...all) + 9);
  const ciOf = (g) => { const m = mean(g), h = tCritical(alpha, g.length - 1) * Math.sqrt(sampleVariance(g) / g.length); return [m - h, m + h]; };
  const lim = Math.max(10, Math.ceil((Math.max(Math.abs(r.lo), Math.abs(r.hi)) + 2) / 5) * 5);
  const reject = r.p <= alpha;
  const varRatio = Math.max(r.v1, r.v2) / Math.min(r.v1, r.v2);
  const sdRatio = Math.sqrt(varRatio);

  return (
    <Card title="Two-sample t-test lab" foot="If the confidence interval for $\mu_1-\mu_2$ avoids 0, the p-value is below $\alpha$ -- they are the same decision.">
      <Controls>
        <div><div className="slider-label">Example</div><Seg options={Object.entries(PRESETS).map(([v, o]) => ({ value: v, label: o.label }))} value={preset} onChange={pick} label="preset" /></div>
        <div><div className="slider-label">Variances</div><Seg options={[{ value: 'pooled', label: 'Pooled (equal)' }, { value: 'welch', label: 'Welch (unequal)' }]} value={method} onChange={setMethod} label="method" /></div>
        <div><div className="slider-label">Significance level</div><Seg options={[{ value: 0.05, label: 'α = 0.05' }, { value: 0.01, label: 'α = 0.01' }]} value={alpha} onChange={setAlpha} label="alpha" /></div>
      </Controls>
      <Controls>
        <NumList label="Group A (type your own numbers)" value={aTxt} onChange={(v) => { setA(v); setPreset('custom'); }} />
        <NumList label="Group B (type your own numbers)" value={bTxt} onChange={(v) => { setB(v); setPreset('custom'); }} />
        <Slider label="Slide group B by" value={shift} onChange={setShift} min={-10} max={10} step={0.5} fmt={(v) => (v > 0 ? '+' : '') + v} />
      </Controls>
      <Plot h={190} xDomain={[lo, hi]} yDomain={[0, 3]} yTicks={[]} grid={false} ariaLabel="Dot plots of the two groups with means and confidence intervals" m={{ t: 8, r: 16, b: 30, l: 44 }}>
        {({ x, y }) => (
          <g>
            {[[A, 2.1, 'var(--c1)', 'A', 0], [B, 0.9, 'var(--c2)', 'B', 20]].map(([g, yy, col, nm, off]) => {
              const [cl, ch] = ciOf(g), m = mean(g);
              return (
                <g key={nm}>
                  <text x={-8} y={y(yy) + 4} textAnchor="end" className="lbl">{nm}</text>
                  <line x1={x(lo)} x2={x(hi)} y1={y(yy)} y2={y(yy)} stroke="var(--line)" />
                  {g.map((v, i) => <Dot key={i} cx={x(v)} cy={y(yy) + jit[(i + off) % 40] * 38} color={col} />)}
                  <rect rx="3" height="10" fill={col} fillOpacity="0.22" y={y(yy) - 5} style={{ x: `${x(cl)}px`, width: `${x(ch) - x(cl)}px`, transition: 'all .5s ease' }} />
                  <g style={{ transform: `translateX(${x(m)}px)`, transition: 'transform .5s ease' }}><line y1={y(yy) - 22} y2={y(yy) + 22} stroke={col} strokeWidth="3" /><text y={y(yy) - 26} textAnchor="middle" className="lbl-sm" fill={col}>{`x̄=${f(m, 2)}`}</text></g>
                </g>
              );
            })}
          </g>
        )}
      </Plot>
      <Plot h={110} xDomain={[-lim, lim]} yDomain={[0, 1]} yTicks={[]} grid={false} xLabel="difference of means  x̄₁ − x̄₂  (shaded bar = CI for μ₁ − μ₂)" ariaLabel="Confidence interval for the difference of means" m={{ t: 6, r: 16, b: 34, l: 44 }}>
        {({ x, y }) => (
          <g>
            <line x1={x(0)} x2={x(0)} y1={0} y2={y(0)} stroke="var(--ink)" strokeDasharray="4 3" />
            <text x={x(0)} y={10} textAnchor="middle" className="lbl-sm" fill="var(--ink)">H₀: 0</text>
            <rect rx="4" height="14" y={y(0.5) - 7} fill={reject ? 'var(--c2)' : 'var(--c3)'} fillOpacity="0.35" style={{ x: `${x(Math.max(-lim, r.lo))}px`, width: `${x(Math.min(lim, r.hi)) - x(Math.max(-lim, r.lo))}px`, transition: 'all .5s ease' }} />
            <circle r="6" cx="0" cy={y(0.5)} fill={reject ? 'var(--c2)' : 'var(--c3)'} style={{ transform: `translateX(${x(Math.max(-lim, Math.min(lim, r.diff)))}px)`, transition: 'transform .5s ease' }} />
          </g>
        )}
      </Plot>
      <Readouts>
        <Readout label="x̄₁ − x̄₂" value={f(r.diff, 3)} />
        <Readout label="SE" value={f(r.se, 3)} />
        <Readout label="t" value={f(r.t, 3)} />
        <Readout label="df" value={f(r.df, 2)} />
        <Readout label="p-value" value={f(r.p, 4)} tone={reject ? 'warn' : ''} />
        <Readout label={`${Math.round((1 - alpha) * 100)}% CI`} value={`(${f(r.lo, 2)}, ${f(r.hi, 2)})`} />
        <Readout label="Decision" value={reject ? 'Reject H₀' : 'Fail to reject'} tone={reject ? 'warn' : 'good'} />
        <Readout label="s_max / s_min" value={f(sdRatio, 2)} tone={sdRatio > 2 ? 'bad' : 'good'} />
      </Readouts>
      {sdRatio > 2 && method === 'pooled' && <p className="note" style={{ color: 'var(--bad)', fontSize: 13, margin: '8px 0 0' }}>The spreads differ by more than 2 to 1, so pooling is risky. Switch to Welch.</p>}
    </Card>
  );
}
