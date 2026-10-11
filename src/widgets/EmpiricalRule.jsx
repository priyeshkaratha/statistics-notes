import React, { useState, useEffect, useRef } from 'react';
import { Card, Controls, Slider, Seg, Btn, Readouts, Readout, f } from '../kit/controls.jsx';
import { Plot, linePath, areaPath } from '../kit/plot.jsx';
import { normPdf, normCdf } from '../lib/stats.js';

const BANDS = [
  { k: 1, pct: '68%', col: 'var(--c1)', op: 0.5 },
  { k: 2, pct: '95%', col: 'var(--c3)', op: 0.35 },
  { k: 3, pct: '99.7%', col: 'var(--c4)', op: 0.25 },
];
const W = 640, M = { t: 18, r: 16, b: 34, l: 16 };

export default function EmpiricalRule() {
  const [mu, setMu] = useState(42);
  const [sd, setSd] = useState(4);
  const [xv, setXv] = useState(48);
  const [shown, setShown] = useState(3);
  const [play, setPlay] = useState(false);
  const [drag, setDrag] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!play) return undefined;
    if (shown >= 3) { setPlay(false); return undefined; }
    const t = setTimeout(() => setShown((s) => s + 1), 1100);
    return () => clearTimeout(t);
  }, [play, shown]);

  const lo = 0, hi = 100, peak = normPdf(mu, mu, sd);
  const z = (xv - mu) / sd;
  const within = Math.abs(z) <= 1 ? 'within 1 SD' : Math.abs(z) <= 2 ? 'between 1 and 2 SD' : Math.abs(z) <= 3 ? 'between 2 and 3 SD' : 'beyond 3 SD (very unusual)';
  const onMove = (e) => {
    if (!drag) return;
    const r = ref.current.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W - M.l;
    setXv(Math.min(hi, Math.max(lo, Math.round((px / (W - M.l - M.r)) * (hi - lo) * 2) / 2)));
  };

  return (
    <Card title="The 68 - 95 - 99.7 rule" foot="**For bell-shaped data: about 68% lie within 1 SD of the mean, 95% within 2 SD, 99.7% within 3 SD.** Teacher's example: mean 42, s 4 gives 38 to 46.">
      <Controls>
        <Slider label="Mean μ" value={mu} onChange={setMu} min={25} max={75} step={1} />
        <Slider label="Standard deviation σ" value={sd} onChange={setSd} min={1} max={10} step={0.5} fmt={(v) => f(v, 1)} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <Btn kind="primary" onClick={() => { setShown(0); setPlay(true); }}>Reveal 1 → 2 → 3 SD</Btn>
          <Btn kind="ghost" onClick={() => { setMu(42); setSd(4); setXv(48); }}>Teacher: 42, 4</Btn>
          <Btn kind="ghost" onClick={() => { setMu(70); setSd(10); setXv(85); }}>Exam: 70, 10</Btn>
          <Seg options={[{ value: 1, label: '68%' }, { value: 2, label: '95%' }, { value: 3, label: 'All' }]} value={shown} onChange={(v) => { setPlay(false); setShown(v); }} label="Show bands" />
        </div>
      </Controls>
      <div ref={ref} style={{ touchAction: 'none' }} onPointerMove={onMove} onPointerUp={() => setDrag(false)} onPointerLeave={() => setDrag(false)}>
        <Plot w={W} h={260} m={M} xDomain={[lo, hi]} yDomain={[0, peak * 1.25]} yTicks={[]} xTicks={Array.from({ length: 11 }, (_, i) => i * 10)} ariaLabel="Normal curve with 68, 95 and 99.7 percent bands">
          {({ x, y, ih }) => {
            const pts = (a, b) => { const out = []; for (let v = a; v <= b + 1e-9; v += (b - a) / 60) out.push([x(v), y(normPdf(v, mu, sd))]); return out; };
            const full = pts(lo, hi);
            return (
              <g>
                {[...BANDS].reverse().map((b) => b.k <= shown && (
                  <path key={b.k} d={areaPath(pts(Math.max(lo, mu - b.k * sd), Math.min(hi, mu + b.k * sd)), ih)} fill={b.col} fillOpacity={b.op} style={{ transition: 'opacity .5s' }} />
                ))}
                <path d={linePath(full)} fill="none" stroke="var(--ink)" strokeWidth="2.5" />
                {BANDS.filter((b) => b.k <= shown).map((b) => (
                  <g key={b.k}>
                    <line x1={x(mu - b.k * sd)} x2={x(mu - b.k * sd)} y1={y(normPdf(mu - b.k * sd, mu, sd))} y2={ih} stroke={b.col} strokeWidth="2" />
                    <line x1={x(mu + b.k * sd)} x2={x(mu + b.k * sd)} y1={y(normPdf(mu + b.k * sd, mu, sd))} y2={ih} stroke={b.col} strokeWidth="2" />
                    <text x={x(mu)} y={ih - 8 - (3 - b.k) * 18} textAnchor="middle" className="lbl-sm" fill="var(--ink)" fontWeight="700">
                      {b.pct}
                    </text>
                  </g>
                ))}
                {/* draggable x */}
                <line x1={x(xv)} x2={x(xv)} y1={4} y2={ih} stroke="var(--c2)" strokeWidth="2.5" />
                <circle cx={x(xv)} cy={14} r={10} fill="var(--c2)" stroke="var(--surface)" strokeWidth="2" style={{ cursor: 'grab' }} onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag(true); }} />
                <text x={x(xv)} y={18} textAnchor="middle" className="lbl-sm" fill="#fff" fontWeight="700" pointerEvents="none">x</text>
              </g>
            );
          }}
        </Plot>
      </div>
      <Slider label="Move x (or drag the red handle)" value={xv} onChange={setXv} min={lo} max={hi} step={0.5} fmt={(v) => f(v, 1)} />
      <Readouts>
        <Readout label="68% range" value={`${f(mu - sd, 1)} – ${f(mu + sd, 1)}`} tone="good" />
        <Readout label="95% range" value={`${f(mu - 2 * sd, 1)} – ${f(mu + 2 * sd, 1)}`} tone="good" />
        <Readout label="99.7% range" value={`${f(mu - 3 * sd, 1)} – ${f(mu + 3 * sd, 1)}`} tone="good" />
        <Readout label="z of x" value={f(z, 2)} tone="warn" />
        <Readout label="P(X ≤ x)" value={`${f(normCdf(z) * 100, 1)}%`} />
      </Readouts>
      <p style={{ fontSize: 14, color: 'var(--ink2)', margin: '8px 0 0' }}>x = {f(xv, 1)} lies <b>{within}</b>: z = (x − μ)/σ = ({f(xv, 1)} − {mu})/{f(sd, 1)} = {f(z, 2)}.</p>
    </Card>
  );
}
