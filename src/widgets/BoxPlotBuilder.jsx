import React, { useState, useRef, useMemo } from 'react';
import { Card, Controls, Seg, Btn, NumList, Readouts, Readout, parseNums, f } from '../kit/controls.jsx';
import { outlierFences, sorted } from '../lib/stats.js';

const METHODS = [
  { value: 'halves', label: 'Halves (practice doc)' },
  { value: 'nplus1', label: 'p(n+1) (notes)' },
  { value: 'linear', label: 'Linear (NumPy)' },
];
const PRESETS = [
  { value: 'del', label: 'Delivery times', data: [4, 5, 6, 7, 8, 8, 9, 10, 12, 15] },
  { value: 'out', label: 'Add 50 & 100', data: [4, 5, 6, 7, 8, 8, 9, 10, 12, 15, 50, 100] },
  { value: 'p15', label: 'Practice P15', data: [10, 11, 12, 12, 13, 14, 15, 16, 40] },
  { value: 'sym', label: 'Symmetric', data: [20, 24, 27, 29, 30, 31, 33, 36, 40] },
];
const niceMax = (m) => { const t = m * 1.15; const step = t > 80 ? 20 : 10; return Math.max(20, Math.ceil(t / step) * step); };
const W = 640, M = { l: 24, r: 24 }, IW = W - M.l - M.r;

export default function BoxPlotBuilder() {
  const [data, setData] = useState(PRESETS[0].data);
  const [txt, setTxt] = useState(PRESETS[0].data.join(', '));
  const [dom, setDom] = useState(niceMax(15));
  const [method, setMethod] = useState('halves');
  const [drag, setDrag] = useState(-1);
  const svgRef = useRef(null);

  const sx = (v) => M.l + (v / dom) * IW;
  const set = (arr, resetDomain) => {
    setData(arr); setTxt(arr.map((v) => f(v, 2)).join(', '));
    if (resetDomain) setDom(niceMax(Math.max(...arr)));
  };
  const o = useMemo(() => (data.length >= 4 ? outlierFences(data, method) : null), [data, method]);
  const s = sorted(data);
  const inside = o ? s.filter((v) => v >= o.lower && v <= o.upper) : s;
  const wLo = inside.length ? inside[0] : s[0], wHi = inside.length ? inside[inside.length - 1] : s[s.length - 1];

  // stack equal dots
  const seen = {};
  const dots = data.map((v, i) => { const k = Math.round(v * 2); seen[k] = (seen[k] || 0) + 1; return { v, i, row: seen[k] - 1 }; });

  const move = (e) => {
    if (drag < 0) return;
    const r = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const v = Math.min(dom, Math.max(0, Math.round(((px - M.l) / IW) * dom * 2) / 2));
    const next = data.slice(); next[drag] = v; setData(next); setTxt(next.map((q) => f(q, 2)).join(', '));
  };
  const skew = !o ? '' : (() => {
    const l = o.median - o.q1, r = o.q3 - o.median;
    if (Math.abs(l - r) < 0.15 * (o.iqr || 1)) return 'Median near the middle of the box: roughly symmetric';
    return r > l ? 'Median nearer Q1, longer right side: right (positive) skew' : 'Median nearer Q3, longer left side: left (negative) skew';
  })();
  const tr = drag < 0 ? 'all .45s cubic-bezier(.3,.7,.2,1)' : 'none';
  const T = (v) => ({ transform: `translateX(${sx(v)}px)`, transition: tr });

  return (
    <Card title="Box plot builder" foot="**The box is the middle 50%; whiskers stop at the last point inside the fences; anything beyond Q1 − 1.5·IQR or Q3 + 1.5·IQR is drawn as an outlier.** Drag one dot far away: the box barely moves, the outlier gets flagged.">
      <Controls>
        <NumList label="Data (edit, or drag the dots below)" value={txt} onChange={(v) => { setTxt(v); const a = parseNums(v).slice(0, 30); if (a.length >= 4) { setData(a); setDom(niceMax(Math.max(...a))); } }} />
        <Seg options={PRESETS.map(({ value, label }) => ({ value, label }))} value={null} onChange={(v) => set(PRESETS.find((p) => p.value === v).data, true)} label="Preset data" />
        <Seg options={METHODS} value={method} onChange={setMethod} label="Quartile method" />
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn kind="ghost" onClick={() => set([...data, o ? Math.round(o.median) : 10])}>Add point</Btn>
          <Btn kind="ghost" disabled={data.length <= 4} onClick={() => set(data.slice(0, -1))}>Remove last</Btn>
        </div>
      </Controls>
      <svg ref={svgRef} className="plot" viewBox={`0 0 ${W} 230`} role="img" aria-label="Box plot with draggable data points" onPointerMove={move} onPointerUp={() => setDrag(-1)} onPointerLeave={() => setDrag(-1)} style={{ touchAction: 'none' }}>
        {/* axis */}
        <line x1={M.l} x2={W - M.r} y1={205} y2={205} className="axis" />
        {Array.from({ length: Math.floor(dom / (dom > 60 ? 10 : 5)) + 1 }, (_, i) => i * (dom > 60 ? 10 : 5)).map((t) => (
          <g key={t}><line x1={sx(t)} x2={sx(t)} y1={205} y2={209} className="axis" /><text x={sx(t)} y={222} textAnchor="middle" className="tick">{t}</text></g>
        ))}
        {o && (
          <g>
            {/* fences */}
            {[['Lower fence', o.lower], ['Upper fence', o.upper]].map(([nm, v]) => v >= 0 && v <= dom && (
              <g key={nm} style={T(v)}>
                <line x1={0} x2={0} y1={20} y2={118} stroke="var(--c2)" strokeDasharray="5 4" strokeWidth="1.5" />
                <text x={0} y={14} textAnchor="middle" className="lbl-sm" fill="var(--c2)">{nm} {f(v, 2)}</text>
              </g>
            ))}
            {/* whiskers */}
            <line x1={sx(wLo)} x2={sx(o.q1)} y1={70} y2={70} stroke="var(--ink)" strokeWidth="2" style={{ transition: tr }} />
            <line x1={sx(o.q3)} x2={sx(wHi)} y1={70} y2={70} stroke="var(--ink)" strokeWidth="2" style={{ transition: tr }} />
            {[wLo, wHi].map((v, i) => <g key={i} style={T(v)}><line x1={0} x2={0} y1={56} y2={84} stroke="var(--ink)" strokeWidth="2.5" /></g>)}
            {/* box */}
            <rect x={0} y={48} width={Math.max(1, sx(o.q3) - sx(o.q1))} height={44} rx="4" fill="var(--c1)" fillOpacity=".25" stroke="var(--c1)" strokeWidth="2.5" style={{ transform: `translateX(${sx(o.q1)}px)`, transition: tr }} />
            <g style={T(o.median)}><line x1={0} x2={0} y1={48} y2={92} stroke="var(--c2)" strokeWidth="4" strokeLinecap="round" /></g>
            {/* outliers on the plot */}
            {s.filter((v) => v < o.lower || v > o.upper).map((v, i) => <circle key={i} cx={sx(v)} cy={70} r="6" fill="none" stroke="var(--c2)" strokeWidth="2.5" />)}
            {[['Q1', o.q1], ['Med', o.median], ['Q3', o.q3]].map(([nm, v], i) => (
              <g key={nm} style={T(v)}><text x={0} y={i === 1 ? 108 : 122} textAnchor="middle" className="lbl-sm" fill="var(--ink)">{nm} {f(v, 2)}</text></g>
            ))}
          </g>
        )}
        {/* draggable dots */}
        <text x={M.l} y={150} className="lbl-sm" fill="var(--muted)">Data points: drag me</text>
        {dots.map(({ v, i, row }) => {
          const out = o && (v < o.lower || v > o.upper);
          return (
            <circle key={i} cx={sx(v)} cy={186 - row * 15} r="8" fill={out ? 'var(--c2)' : 'var(--c1)'} fillOpacity={drag === i ? 1 : 0.8} stroke="var(--surface)" strokeWidth="2"
              style={{ cursor: 'grab', transition: drag === i ? 'none' : 'cx .3s' }} onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag(i); }} />
          );
        })}
      </svg>
      {o && (
        <Readouts>
          <Readout label="Q1" value={f(o.q1)} /><Readout label="Median" value={f(o.median)} /><Readout label="Q3" value={f(o.q3)} />
          <Readout label="IQR" value={f(o.iqr)} tone="warn" />
          <Readout label="Fences" value={`${f(o.lower, 2)} to ${f(o.upper, 2)}`} />
          <Readout label="Outliers" value={o.outliers.length ? o.outliers.map((v) => f(v)).join(', ') : 'none'} tone={o.outliers.length ? 'bad' : 'good'} />
        </Readouts>
      )}
      <p style={{ fontSize: 14, color: 'var(--ink2)', margin: '8px 0 0' }}>{skew}</p>
    </Card>
  );
}
