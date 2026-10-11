import React, { useRef, useState } from 'react';
import { Card, Seg, Btn, Controls, Readouts, Readout, f } from '../kit/controls.jsx';
import { mean, median, modes, sampleSD, seededRandom } from '../lib/stats.js';

const W = 640, H = 290, X0 = 24, X1 = 616, LO = 0, HI = 120, AX = 232;
const px = (v) => X0 + ((v - LO) / (HI - LO)) * (X1 - X0);
const PRE = {
  delivery: { label: 'Delivery times', d: [4, 5, 12, 15, 6, 8, 7, 8, 10, 9] },
  bell: { label: 'Symmetric', d: [40, 45, 50, 50, 55, 55, 55, 60, 60, 60, 60, 65, 65, 65, 70, 70, 75, 80] },
  sal: { label: 'Salaries (k)', d: [30, 32, 35, 36, 38, 40, 45, 90] },
  marks: { label: 'Easy exam', d: [30, 60, 70, 74, 78, 80, 82, 85, 88, 90, 92, 95] },
};

export default function MeanMedianOutlier() {
  const [key, setKey] = useState('delivery');
  const [pts, setPts] = useState(PRE.delivery.d);
  const [base, setBase] = useState({ m: mean(PRE.delivery.d), md: median(PRE.delivery.d) });
  const [rn, setRn] = useState(1);
  const drag = useRef(null);
  const svg = useRef(null);

  const n = pts.length;
  const m = mean(pts), md = median(pts), mo = modes(pts);
  const sd = n > 1 ? sampleSD(pts) : 0;
  const sk = sd > 0 ? (3 * (m - md)) / sd : 0;
  const label = sk > 0.3 ? 'Right (positive) skew' : sk < -0.3 ? 'Left (negative) skew' : 'Roughly symmetric';
  const rel = Math.abs(m - md) < 0.05 ? 'mean = median' : m > md ? 'mean > median' : 'mean < median';

  const load = (k) => { setKey(k); setPts(PRE[k].d); setBase({ m: mean(PRE[k].d), md: median(PRE[k].d) }); };
  const toVal = (e) => { const r = svg.current.getBoundingClientRect(); const x = ((e.clientX - r.left) * W) / r.width; return Math.max(LO, Math.min(HI, Math.round(((x - X0) / (X1 - X0)) * (HI - LO)))); };
  const down = (i) => (e) => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); drag.current = i; };
  const move = (e) => { if (drag.current !== null) { const v = toVal(e); setPts((p) => p.map((q, i) => (i === drag.current ? v : q))); } };
  const up = () => { drag.current = null; };
  const addRandom = () => { const r = seededRandom(rn * 97)(); setRn(rn + 1); setPts([...pts, Math.round(55 + r * 60)]); };

  const seen = {};
  const lv = pts.map((v) => { seen[v] = (seen[v] || 0) + 1; return seen[v] - 1; });
  const right = m >= md;
  const slide = (v) => ({ transform: `translateX(${px(v)}px)`, transition: 'transform .5s cubic-bezier(.3,1.2,.5,1)' });

  return (
    <Card title="Mean vs median: add outliers" foot="One extreme value drags the **mean** toward it, but the **median** barely moves. Mean > median signals right skew; mean < median left skew; roughly equal means symmetric.">
      <Controls>
        <Seg label="Dataset" value={key} onChange={load} options={Object.entries(PRE).map(([v, p]) => ({ value: v, label: p.label }))} />
      </Controls>
      <Controls>
        <Btn kind="primary" onClick={() => setPts([...pts, 50, 100])}>Add 50 and 100</Btn>
        <Btn kind="ghost" onClick={addRandom}>Add random outlier</Btn>
        <Btn kind="ghost" onClick={() => setPts(pts.slice(0, -1))} disabled={n < 2}>Remove last</Btn>
        <Btn kind="ghost" onClick={() => load(key)}>Reset</Btn>
      </Controls>
      <svg ref={svg} className="plot" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Dot plot with mean, median and mode markers" onPointerMove={move} onPointerUp={up} onPointerCancel={up} style={{ touchAction: 'none' }}>
        <line x1={X0} x2={X1} y1={AX} y2={AX} className="axis" />
        {Array.from({ length: 13 }, (_, i) => i * 10).map((t) => <g key={t}><line x1={px(t)} x2={px(t)} y1={AX} y2={AX + 5} className="axis" /><text x={px(t)} y={AX + 19} textAnchor="middle" className="tick">{t}</text></g>)}
        <text x={W / 2} y={AX + 40} textAnchor="middle" className="axislabel">value (e.g. delivery time in minutes)</text>
        {/* ghost baseline */}
        <g opacity="0.55">
          <line x1={px(base.m)} x2={px(base.m)} y1={46} y2={AX} stroke="var(--c2)" strokeDasharray="3 4" />
          <line x1={px(base.md)} x2={px(base.md)} y1={46} y2={AX} stroke="var(--c3)" strokeDasharray="3 4" />
        </g>
        {pts.map((v, i) => (
          <circle key={i} cx={px(v)} cy={AX - 9 - lv[i] * 15} r={7} fill="var(--c1)" opacity="0.88" stroke="var(--surface)" strokeWidth="1.2" style={{ cursor: 'grab' }} onPointerDown={down(i)} />
        ))}
        <g style={slide(md)}>
          <line x1={0} x2={0} y1={44} y2={AX} stroke="var(--c3)" strokeWidth="3" />
          <text x={right ? -8 : 8} y={58} textAnchor={right ? 'end' : 'start'} className="lbl" fill="var(--c3)">median {f(md, 2)}</text>
        </g>
        <g style={slide(m)}>
          <polygon points="0,40 -9,24 9,24" fill="var(--c2)" />
          <line x1={0} x2={0} y1={40} y2={AX} stroke="var(--c2)" strokeWidth="2" strokeDasharray="6 4" />
          <text x={right ? 12 : -12} y={36} textAnchor={right ? 'start' : 'end'} className="lbl" fill="var(--c2)">mean {f(m, 2)}</text>
        </g>
        {mo.map((v) => <polygon key={v} points={`${px(v)},${AX + 2} ${px(v) - 6},${AX + 10} ${px(v)},${AX + 18} ${px(v) + 6},${AX + 10}`} fill="var(--c4)" stroke="var(--ink)" strokeWidth="1" style={{ pointerEvents: 'none' }} />)}
      </svg>
      <Readouts>
        <Readout label="n" value={n} />
        <Readout label="Mean" value={f(m, 2)} tone="bad" />
        <Readout label="Median" value={f(md, 2)} tone="good" />
        <Readout label="Mode" value={mo.length ? mo.join(', ') : 'none'} tone="warn" />
        <Readout label="Mean vs median" value={rel} />
        <Readout label="Shape" value={label} />
      </Readouts>
      <p style={{ fontSize: 13, color: 'var(--muted)', margin: '8px 0 0' }}>Faint dashed lines show the mean (red) and median (green) of the starting dataset. Drag any dot sideways to move it. Amber diamond = mode.</p>
    </Card>
  );
}
