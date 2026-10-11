import React, { useRef, useState } from 'react';
import { Card, Seg, Btn, Controls, Readouts, Readout, f } from '../kit/controls.jsx';
import { mean, sum } from '../lib/stats.js';

const W = 640, H = 270, X0 = 30, X1 = 610, LO = 0, HI = 20, BEAM = 150;
const px = (v) => X0 + ((v - LO) / (HI - LO)) * (X1 - X0);
const PRE = { delivery: [4, 5, 12, 15, 6, 8, 7, 8, 10, 9], sym: [6, 8, 10, 12, 14], out: [4, 5, 6, 7, 8, 8, 9, 10, 12, 19] };

export default function MeanBalance() {
  const [pts, setPts] = useState(PRE.delivery);
  const [sel, setSel] = useState(null);
  const [auto, setAuto] = useState(true);
  const [fx, setFx] = useState(10);
  const drag = useRef(null);
  const svg = useRef(null);
  const m = pts.length ? mean(pts) : 10;
  const fv = auto ? m : fx;
  const net = pts.length ? mean(pts) - fv : 0;
  const angle = Math.max(-13, Math.min(13, net * 3.2));
  const left = sum(pts.filter((v) => v < fv).map((v) => fv - v));
  const right = sum(pts.filter((v) => v >= fv).map((v) => v - fv));
  const balanced = Math.abs(net) < 0.05;

  const toVal = (e) => {
    const r = svg.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) * W) / r.width;
    return Math.max(LO, Math.min(HI, Math.round(((x - X0) / (X1 - X0)) * (HI - LO) * 2) / 2));
  };
  const down = (id) => (e) => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); drag.current = id; if (id !== 'F') setSel(id); };
  const move = (e) => {
    if (drag.current === null) return;
    const v = toVal(e);
    if (drag.current === 'F') setFx(v); else setPts((p) => p.map((q, i) => (i === drag.current ? v : q)));
  };
  const up = () => { drag.current = null; };
  const add = () => { setPts([...pts, 10]); setSel(pts.length); };
  const remove = () => { if (pts.length < 2) return; const k = sel === null || sel >= pts.length ? pts.length - 1 : sel; setPts(pts.filter((_, i) => i !== k)); setSel(null); };
  const load = (k) => { setPts(PRE[k]); setSel(null); };

  const seen = {};
  const levels = pts.map((v) => { const k = v; seen[k] = (seen[k] || 0) + 1; return seen[k] - 1; });
  const tickVals = Array.from({ length: 11 }, (_, i) => i * 2);

  return (
    <Card title="The mean is the balance point" foot="Distances to the left of $\\bar{x}$ exactly cancel distances to the right: $\\sum (x_i-\\bar{x}) = 0$. Drag a point far away and the balance point (mean) chases it.">
      <Controls>
        <Seg label="Fulcrum" value={auto} onChange={setAuto} options={[{ value: true, label: 'Fulcrum at mean' }, { value: false, label: 'I place the fulcrum' }]} />
        <Seg label="Dataset" value="" onChange={load} options={[{ value: 'delivery', label: 'Delivery times' }, { value: 'sym', label: 'Symmetric' }, { value: 'out', label: 'One far point' }]} />
        <Btn kind="ghost" onClick={add}>Add point</Btn>
        <Btn kind="ghost" onClick={remove} disabled={pts.length < 2}>Remove {sel === null ? 'last' : 'selected'}</Btn>
      </Controls>
      <svg ref={svg} className="plot" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Seesaw balancing data points at their mean" onPointerMove={move} onPointerUp={up} onPointerCancel={up} style={{ touchAction: 'none' }}>
        <g style={{ transformOrigin: `${px(fv)}px ${BEAM}px`, transform: `rotate(${angle}deg)`, transition: 'transform .45s cubic-bezier(.3,1.4,.5,1), transform-origin .25s' }}>
          <rect x={X0 - 10} y={BEAM} width={X1 - X0 + 20} height={8} rx={4} fill="var(--line)" />
          {tickVals.map((t) => <g key={t}><line x1={px(t)} x2={px(t)} y1={BEAM + 8} y2={BEAM + 14} stroke="var(--muted)" /><text x={px(t)} y={BEAM + 27} textAnchor="middle" className="tick">{t}</text></g>)}
          {pts.map((v, i) => (
            <g key={i} style={{ cursor: 'grab' }} onPointerDown={down(i)}>
              <circle cx={px(v)} cy={BEAM - 13 - levels[i] * 24} r={11} fill={v < fv ? 'var(--c1)' : 'var(--c2)'} stroke={sel === i ? 'var(--ink)' : 'var(--surface)'} strokeWidth={sel === i ? 3 : 1.5} style={{ transition: 'cx .12s' }} />
              <text x={px(v)} y={BEAM - 9 - levels[i] * 24} textAnchor="middle" className="lbl-sm" fill="#fff" style={{ pointerEvents: 'none', fontWeight: 700 }}>{v}</text>
            </g>
          ))}
        </g>
        <g style={{ transform: `translateX(${px(fv)}px)`, transition: auto ? 'transform .4s ease' : 'none', cursor: auto ? 'default' : 'grab' }} onPointerDown={auto ? undefined : down('F')}>
          <polygon points={`0,${BEAM + 10} -22,${BEAM + 62} 22,${BEAM + 62}`} fill="var(--c4)" stroke="var(--ink)" strokeWidth="1.5" />
          <rect x={-30} y={BEAM + 62} width={60} height={6} rx={3} fill="var(--muted)" />
          <text x={0} y={BEAM + 52} textAnchor="middle" className="lbl-sm" fill="#000" style={{ fontWeight: 700 }}>{auto ? 'x̄' : f(fv, 1)}</text>
        </g>
        <text x={W / 2} y={22} textAnchor="middle" className="lbl" fill={balanced ? 'var(--c3)' : 'var(--c2)'}>{balanced ? 'Balanced: pulls cancel' : net > 0 ? 'Tips right: fulcrum is below the mean' : 'Tips left: fulcrum is above the mean'}</text>
      </svg>
      <Readouts>
        <Readout label="n" value={pts.length} />
        <Readout label="Sum" value={f(sum(pts), 1)} />
        <Readout label="Mean x̄" value={f(m, 3)} tone="good" />
        <Readout label="Left pull" value={f(left, 2)} />
        <Readout label="Right pull" value={f(right, 2)} />
        <Readout label="Net Σ(x−pivot)" value={f(right - left, 2)} tone={balanced ? 'good' : 'bad'} />
      </Readouts>
    </Card>
  );
}
