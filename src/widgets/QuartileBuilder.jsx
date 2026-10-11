import React, { useState, useEffect, useMemo } from 'react';
import { Card, Controls, Seg, Btn, NumList, Readouts, Readout, parseNums, f } from '../kit/controls.jsx';
import { quantile, sorted } from '../lib/stats.js';

const METHODS = [
  { value: 'nplus1', label: 'p(n+1)  (class notes)' },
  { value: 'halves', label: 'Median of halves  (practice doc)' },
  { value: 'linear', label: 'Linear  (NumPy default)' },
];
const STEPS = ['1. Raw data', '2. Sort it', '3. Locate the cut positions', '4. Cut into four 25% parts', '5. Read the values'];
const CAPTION = [
  'Data exactly as collected. Quartiles need ORDER, so the first job is to sort.',
  'Sorted smallest to largest. Now every value has a rank (position 1, 2, 3 ...).',
  'Three cuts are needed to make four equal parts. Each method has its own rule for WHERE the cuts fall (positions can be fractions).',
  'The three cuts split the ordered data into four parts holding about 25% of the values each.',
  'Read (or interpolate) the value sitting at each cut: these are Q1, Q2 (median) and Q3.',
];

// 1-based (possibly fractional) position of the cut for each method
function position(n, p, method) {
  if (method === 'nplus1') return p * (n + 1);
  if (method === 'linear') return 1 + p * (n - 1);
  if (p === 0.5) return (n + 1) / 2;
  const h = Math.floor(n / 2);
  return p < 0.5 ? (h + 1) / 2 : n - h + (h + 1) / 2;
}
const label = (p, n, method, pos) => {
  if (method === 'nplus1') return `${p}(n+1) = ${f(pos, 2)}`;
  if (method === 'linear') return `1+${p}(n−1) = ${f(pos, 2)}`;
  return `middle of half = ${f(pos, 2)}`;
};

export default function QuartileBuilder({ initial = '4, 5, 12, 15, 6, 8, 7, 8, 10, 9' }) {
  const [txt, setTxt] = useState(initial);
  const [method, setMethod] = useState('nplus1');
  const [step, setStep] = useState(0);
  const [play, setPlay] = useState(false);

  const raw = useMemo(() => parseNums(txt).slice(0, 24), [txt]);
  const n = raw.length;
  const srt = useMemo(() => sorted(raw), [raw]);
  // rank of each raw item (stable) so the sort can be animated
  const rank = useMemo(() => {
    const idx = raw.map((v, i) => i).sort((a, b) => raw[a] - raw[b] || a - b);
    const r = []; idx.forEach((orig, k) => { r[orig] = k; }); return r;
  }, [raw]);

  useEffect(() => {
    if (!play) return undefined;
    if (step >= 4) { setPlay(false); return undefined; }
    const t = setTimeout(() => setStep((s) => s + 1), 1500);
    return () => clearTimeout(t);
  }, [play, step]);

  if (n < 2) return <Card title="Quartile builder"><NumList label="Data (at least 2 numbers)" value={txt} onChange={setTxt} /></Card>;

  const W = 640, pad = 20, cw = Math.min(50, (W - 2 * pad) / n), x0 = (W - cw * n) / 2;
  const xAt = (pos) => x0 + (pos - 0.5) * cw; // 1-based position -> pixel
  const cuts = [0.25, 0.5, 0.75].map((p, i) => {
    const pos = position(n, p, method);
    return { name: `Q${i + 1}`, p, pos, val: quantile(srt, p, method), col: ['var(--c1)', 'var(--c2)', 'var(--c3)'][i] };
  });
  const bands = [[0.5, cuts[0].pos], [cuts[0].pos, cuts[1].pos], [cuts[1].pos, cuts[2].pos], [cuts[2].pos, n + 0.5]];
  const bandCols = ['var(--c1)', 'var(--c4)', 'var(--c5)', 'var(--c3)'];
  const iqr = cuts[2].val - cuts[0].val;
  const show = (s) => step >= s;

  return (
    <Card title="Quartile builder" foot="**Three cuts, four equal parts.** The cut positions depend on the convention, so Q1 and Q3 can differ slightly: follow your instructor's method.">
      <Controls>
        <NumList label="Your data (comma or space separated, up to 24 numbers)" value={txt} onChange={(v) => { setTxt(v); setStep(0); setPlay(false); }} />
        <Seg options={METHODS} value={method} onChange={setMethod} label="Quartile method" />
      </Controls>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '10px 0 4px', alignItems: 'center' }}>
        <Btn kind="primary" onClick={() => { if (step >= 4) setStep(0); setPlay(!play); }}>{play ? 'Pause' : step >= 4 ? 'Replay' : 'Play'}</Btn>
        <Btn kind="ghost" disabled={step === 0} onClick={() => { setPlay(false); setStep(step - 1); }}>Back</Btn>
        <Btn kind="ghost" disabled={step === 4} onClick={() => { setPlay(false); setStep(step + 1); }}>Next step</Btn>
        <span className="mono" style={{ fontSize: 13, color: 'var(--accent)' }}>{STEPS[step]}</span>
      </div>
      <svg className="plot" viewBox={`0 0 ${W} 215`} role="img" aria-label="Sorted data cut into four quarters by Q1, Q2 and Q3">
        {/* quarter bands */}
        {bands.map(([a, b], i) => (
          <g key={i} style={{ opacity: show(3) ? 1 : 0, transition: 'opacity .6s' }}>
            <rect x={xAt(a)} y={128} width={Math.max(0, xAt(b) - xAt(a))} height={26} fill={bandCols[i]} opacity=".28" rx="4" />
            <text x={(xAt(a) + xAt(b)) / 2} y={146} textAnchor="middle" className="lbl-sm" fill="var(--ink)">25%</text>
          </g>
        ))}
        {/* cells */}
        {raw.map((v, i) => {
          const px = x0 + (show(1) ? rank[i] : i) * cw;
          return (
            <g key={i} style={{ transform: `translate(${px}px, 70px)`, transition: 'transform .8s cubic-bezier(.3,.7,.2,1)' }}>
              <rect x={1.5} y={0} width={cw - 3} height={42} rx="6" fill="var(--surface2)" stroke="var(--line)" />
              <text x={cw / 2} y={26} textAnchor="middle" className="lbl" fill="var(--ink)">{f(v, 2)}</text>
              {show(1) && <text x={cw / 2} y={56} textAnchor="middle" className="lbl-sm" fill="var(--muted)">{rank[i] + 1}</text>}
            </g>
          );
        })}
        {/* cut markers */}
        {cuts.map((c, i) => (
          <g key={c.name} style={{ opacity: show(2) ? 1 : 0, transition: 'opacity .6s' }}>
            <line x1={xAt(c.pos)} x2={xAt(c.pos)} y1={46} y2={118} stroke={c.col} strokeWidth="3" strokeLinecap="round" strokeDasharray={show(4) ? '0' : '5 4'} />
            <text x={xAt(c.pos)} y={i === 1 ? 24 : 40} textAnchor="middle" className="lbl" fill={c.col} fontWeight="700">
              {c.name}{show(4) ? ` = ${f(c.val, 3)}` : ''}
            </text>
            <text x={xAt(c.pos)} y={i === 1 ? 38 : 54} textAnchor="middle" className="lbl-sm" fill="var(--muted)" style={{ display: show(4) ? 'none' : 'block' }}>
              {label(c.p, n, method, c.pos)}
            </text>
          </g>
        ))}
        <text x={x0} y={186} className="lbl-sm" fill="var(--muted)">min = {f(srt[0])}</text>
        <text x={x0 + cw * n} y={186} textAnchor="end" className="lbl-sm" fill="var(--muted)">max = {f(srt[n - 1])}</text>
        {show(4) && (
          <g>
            <line x1={xAt(cuts[0].pos)} x2={xAt(cuts[2].pos)} y1={172} y2={172} stroke="var(--c4)" strokeWidth="3" />
            <text x={(xAt(cuts[0].pos) + xAt(cuts[2].pos)) / 2} y={199} textAnchor="middle" className="lbl" fill="var(--c4)" fontWeight="700">IQR = Q3 − Q1 = {f(iqr, 3)}  (middle 50%)</text>
          </g>
        )}
      </svg>
      <p style={{ margin: '4px 0 8px', fontSize: 14, color: 'var(--ink2)' }}>{CAPTION[step]}</p>
      <div style={{ overflowX: 'auto' }}>
        <table className="tbl" style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead><tr><th style={{ textAlign: 'left' }}>Method (n = {n})</th><th>Q1</th><th>Q2</th><th>Q3</th><th>IQR</th></tr></thead>
          <tbody>
            {METHODS.map((m) => {
              const q = [0.25, 0.5, 0.75].map((p) => quantile(srt, p, m.value));
              return (
                <tr key={m.value} style={{ background: m.value === method ? 'var(--surface2)' : 'transparent', fontWeight: m.value === method ? 700 : 400 }}>
                  <td>{m.label}</td>{q.map((v, i) => <td key={i} className="mono" style={{ textAlign: 'center' }}>{f(v, 3)}</td>)}<td className="mono" style={{ textAlign: 'center' }}>{f(q[2] - q[0], 3)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Readouts>
        <Readout label="n" value={n} />
        <Readout label="Q1 (25th pct)" value={f(cuts[0].val)} />
        <Readout label="Q2 (median)" value={f(cuts[1].val)} />
        <Readout label="Q3 (75th pct)" value={f(cuts[2].val)} />
        <Readout label="IQR" value={f(iqr)} tone="warn" />
      </Readouts>
    </Card>
  );
}
