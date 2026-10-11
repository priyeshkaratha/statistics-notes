import React, { useState, useEffect, useRef } from 'react';
import { Card, Slider, Seg, Btn, Controls, Readouts, Readout, f } from '../kit/controls.jsx';

/* Smoothly animate a number toward a target (jumps instantly if user prefers reduced motion). */
function useSmooth(target, ms = 450) {
  const [v, setV] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof requestAnimationFrame === 'undefined') { cur.current = target; setV(target); return undefined; }
    const from = cur.current, t0 = performance.now(); let id;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / ms), e = 1 - (1 - k) ** 3;
      cur.current = from + (target - from) * e; setV(cur.current);
      if (k < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [target, ms]);
  return v;
}

/* lens (overlap) area of two circles radii r1,r2 at distance d */
function lens(r1, r2, d) {
  if (d >= r1 + r2) return 0;
  if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2;
  const a = r1 * r1 * Math.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1));
  const b = r2 * r2 * Math.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2));
  const c = 0.5 * Math.sqrt((-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2));
  return a + b - c;
}
function distFor(r1, r2, target) { // bisection: lens decreases as d grows
  let lo = Math.abs(r1 - r2), hi = r1 + r2;
  for (let i = 0; i < 50; i++) { const mid = (lo + hi) / 2; if (lens(r1, r2, mid) > target) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}

const R = 105; // radius that represents probability 1
const SHOW = [
  { value: 'union', label: 'A ∪ B' }, { value: 'inter', label: 'A ∩ B' }, { value: 'aonly', label: 'A only' },
  { value: 'condAB', label: 'A | B' }, { value: 'condBA', label: 'B | A' }, { value: 'neither', label: 'neither' },
];

export default function VennProbability({ a: a0 = 0.5, b: b0 = 0.4, ab: ab0 = 0.2, show: s0 = 'union' }) {
  const [a, setA] = useState(a0), [b, setB] = useState(b0), [ab, setAb] = useState(ab0), [show, setShow] = useState(s0);
  const lo = Math.max(0, +(a + b - 1).toFixed(2)), hi = Math.min(a, b);
  const abc = Math.min(hi, Math.max(lo, ab));
  const r1 = R * Math.sqrt(a), r2 = R * Math.sqrt(b);
  const d = distFor(r1, r2, Math.PI * R * R * abc);
  const sa = useSmooth(r1), sb = useSmooth(r2), sd = useSmooth(d);
  const W = 640, H = 270, cy = 135, mid = W / 2;
  const total = sa + sb + sd; // centre the pair
  const cxA = mid - total / 2 + sa, cxB = cxA + sd;
  const union = a + b - abc, pA_B = b > 0 ? abc / b : 0, pB_A = a > 0 ? abc / a : 0;
  const indep = Math.abs(abc - a * b) < 0.0005, mex = abc < 0.0005;
  const regions = [{ k: 'both', p: abc, c: 'var(--c5)', t: 'A∩B' }, { k: 'a', p: a - abc, c: 'var(--c1)', t: 'A only' }, { k: 'b', p: b - abc, c: 'var(--c2)', t: 'B only' }, { k: 'n', p: 1 - union, c: 'var(--surface2)', t: 'neither' }];
  const hl = { union: ['both', 'a', 'b'], inter: ['both'], aonly: ['a'], condAB: ['both'], condBA: ['both'], neither: ['n'] }[show];
  return (
    <Card title="Venn probability explorer" foot="**P(A∪B) = P(A)+P(B)−P(A∩B)** — subtract the overlap once. Independent ⇔ P(A∩B)=P(A)P(B); mutually exclusive ⇔ P(A∩B)=0.">
      <Controls>
        <Slider label="P(A)" value={a} onChange={setA} min={0.05} max={0.9} step={0.05} fmt={(v) => f(v, 2)} />
        <Slider label="P(B)" value={b} onChange={setB} min={0.05} max={0.9} step={0.05} fmt={(v) => f(v, 2)} />
        <Slider label="P(A∩B)" value={abc} onChange={setAb} min={lo} max={Math.max(hi, lo)} step={0.01} fmt={(v) => f(v, 2)} />
      </Controls>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '8px 0' }}>
        <Btn onClick={() => setAb(+(a * b).toFixed(2))}>Make independent</Btn>
        <Btn onClick={() => { if (a + b <= 1) setAb(0); else { setB(+(1 - a).toFixed(2)); setAb(0); } }}>Make mutually exclusive</Btn>
        <Btn kind="ghost" onClick={() => { setA(a0); setB(b0); setAb(ab0); }}>Reset</Btn>
      </div>
      <Seg options={SHOW} value={show} onChange={setShow} label="Region to shade" />
      <svg className="plot" viewBox={`0 0 ${W} ${H + 46}`} role="img" aria-label="Venn diagram of events A and B with a bar showing the four region probabilities">
        <defs>
          <clipPath id="vp-clipA"><circle cx={cxA} cy={cy} r={sa} /></clipPath>
          <clipPath id="vp-clipB"><circle cx={cxB} cy={cy} r={sb} /></clipPath>
        </defs>
        <rect x="6" y="8" width={W - 12} height={H - 16} rx="12" fill={show === 'neither' ? 'color-mix(in srgb, var(--c4) 22%, transparent)' : 'var(--surface2)'} stroke="var(--line)" style={{ transition: 'fill .3s' }} />
        <text x="18" y="28" className="lbl-sm" style={{ fill: 'var(--muted)' }}>Sample space S  (P = 1)</text>
        <circle cx={cxA} cy={cy} r={sa} fill="color-mix(in srgb, var(--c1) 12%, transparent)" stroke="var(--c1)" strokeWidth="2" />
        <circle cx={cxB} cy={cy} r={sb} fill="color-mix(in srgb, var(--c2) 12%, transparent)" stroke="var(--c2)" strokeWidth="2" />
        {show === 'union' && <><circle cx={cxA} cy={cy} r={sa} fill="var(--c1)" opacity=".4" /><circle cx={cxB} cy={cy} r={sb} fill="var(--c2)" opacity=".4" /></>}
        {show === 'aonly' && <circle cx={cxA} cy={cy} r={sa} fill="var(--c1)" opacity=".45" />}
        {show === 'condAB' && <circle cx={cxB} cy={cy} r={sb} fill="var(--c2)" opacity=".22" />}
        {show === 'condBA' && <circle cx={cxA} cy={cy} r={sa} fill="var(--c1)" opacity=".22" />}
        {(show === 'inter' || show === 'condAB' || show === 'condBA') && <g clipPath="url(#vp-clipA)"><circle cx={cxB} cy={cy} r={sb} fill="var(--c5)" opacity=".75" /></g>}
        {show === 'aonly' && <g clipPath="url(#vp-clipB)"><circle cx={cxB} cy={cy} r={sb} fill="var(--surface2)" opacity=".95" /><circle cx={cxB} cy={cy} r={sb} fill="none" stroke="var(--c2)" strokeWidth="2" /></g>}
        <text x={cxA - sa * 0.55} y={cy - sa - 6 < 24 ? 44 : cy - sa - 6} textAnchor="middle" className="lbl" style={{ fill: 'var(--c1)', fontSize: 15 }}>A</text>
        <text x={cxB + sb * 0.55} y={cy - sb - 6 < 24 ? 44 : cy - sb - 6} textAnchor="middle" className="lbl" style={{ fill: 'var(--c2)', fontSize: 15 }}>B</text>
        <text x={(cxA + sa + cxB - sb) / 2} y={cy + 4} textAnchor="middle" className="lbl-sm" style={{ fill: 'var(--ink)', fontWeight: 600 }}>{abc > 0.0005 && sd < sa + sb - 14 ? f(abc, 2) : ''}</text>
        <g transform={`translate(10,${H + 4})`} aria-label="probability bar">
          {(() => { let x0 = 0; return regions.map((r) => { const w = Math.max(0, r.p) * (W - 20), el = (
            <g key={r.k} style={{ opacity: hl.includes(r.k) ? 1 : 0.28, transition: 'opacity .3s' }}>
              <rect x={x0} y="0" width={w} height="24" fill={r.c} stroke="var(--line)" />
              {w > 46 && <text x={x0 + w / 2} y="16" textAnchor="middle" className="lbl-sm" style={{ fill: r.k === 'n' ? 'var(--ink)' : '#fff', fontWeight: 600 }}>{r.t} {f(r.p, 2)}</text>}
            </g>); x0 += w; return el; }); })()}
          <text x="0" y="40" className="lbl-sm" style={{ fill: 'var(--muted)' }}>All regions add to 1 (areas ∝ probability in the bar)</text>
        </g>
      </svg>
      <Readouts>
        <Readout label="P(A∪B)" value={f(union, 3)} tone={show === 'union' ? 'good' : ''} />
        <Readout label="P(A∩B)" value={f(abc, 3)} tone={show === 'inter' ? 'good' : ''} />
        <Readout label="P(A|B)=P(A∩B)/P(B)" value={f(pA_B, 3)} tone={show === 'condAB' ? 'good' : ''} />
        <Readout label="P(B|A)" value={f(pB_A, 3)} tone={show === 'condBA' ? 'good' : ''} />
        <Readout label="P(neither)" value={f(1 - union, 3)} />
        <Readout label="P(A)·P(B)" value={f(a * b, 3)} />
        <Readout label="Independent?" value={indep ? 'Yes' : 'No'} tone={indep ? 'good' : 'warn'} />
        <Readout label="Mutually excl.?" value={mex ? 'Yes' : 'No'} tone={mex ? 'good' : ''} />
      </Readouts>
    </Card>
  );
}
