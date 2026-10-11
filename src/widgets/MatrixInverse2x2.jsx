import React, { useState, useRef, useEffect } from 'react';
import { Card, Controls, Btn, Readouts, Readout, f } from '../kit/controls.jsx';
import { Plot } from '../kit/plot.jsx';
import { det2, inverse2, matMul } from '../lib/stats.js';

const num = (s) => { const v = Number(s); return Number.isFinite(v) ? v : 0; };
const PRE = [
  ['Textbook [[4,7],[2,6]]', [4, 7, 2, 6]], ['[[2,1],[5,3]]', [2, 1, 5, 3]], ['Identity', [1, 0, 0, 1]],
  ['Stretch', [2, 0, 0, 1.5]], ['Shear', [1, 1, 0, 1]], ['Rotate 90°', [0, -1, 1, 0]], ['Singular [[1,2],[2,4]]', [1, 2, 2, 4]],
];
const mono = { fontFamily: 'var(--mono)' };
const inp = { width: 54, height: 34, textAlign: 'center', border: '1px solid var(--line)', borderRadius: 6, background: 'var(--surface)', color: 'var(--ink)', font: '600 15px var(--mono)' };
const Mx = ({ rows, color }) => (
  <span style={{ display: 'inline-grid', gridTemplateColumns: 'auto auto', gap: '2px 14px', padding: '4px 10px', borderLeft: `3px solid ${color || 'var(--ink)'}`, borderRight: `3px solid ${color || 'var(--ink)'}`, borderRadius: 6, ...mono, fontSize: 15, textAlign: 'right' }}>
    {rows.flat().map((v, i) => <span key={i}>{v}</span>)}
  </span>
);

export default function MatrixInverse2x2() {
  const [s, setS] = useState(['4', '7', '2', '6']);
  const [t, setT] = useState(1);            // 0 = identity, 1 = the matrix
  const raf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const [a, b, c, d] = s.map(num);
  const A = [[a, b], [c, d]], det = det2(A), singular = Math.abs(det) < 1e-9;
  const inv = singular ? null : inverse2(A);
  const adj = [[d, -b], [-c, a]];
  const check = inv ? matMul(A, inv).map((r) => r.map((v) => (Math.abs(v) < 1e-9 ? 0 : +v.toFixed(6)))) : null;
  const setPre = (v) => { setS(v.map(String)); play(); };
  const play = () => {
    cancelAnimationFrame(raf.current);
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setT(1); return; }
    const t0 = performance.now();
    const tick = (now) => { const u = Math.min(1, (now - t0) / 1200); setT(u * u * (3 - 2 * u)); if (u < 1) raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick);
  };
  // interpolate I -> A
  const ma = 1 + (a - 1) * t, mb = b * t, mc = c * t, md = 1 + (d - 1) * t;
  const sq = [[0, 0], [1, 0], [1, 1], [0, 1]].map(([u, v]) => [ma * u + mb * v, mc * u + md * v]);
  const ext = Math.max(2, ...sq.flat().map(Math.abs), 1);
  const R = Math.ceil(ext * 1.15);
  const area = Math.abs(det2([[ma, mb], [mc, md]]));
  const collapsed = singular && t > 0.98;
  const setCell = (i, v) => setS((q) => q.map((x, j) => (i === j ? v : x)));
  const fr = (v) => f(v, 3);
  return (
    <Card title="2×2 determinant, adjugate and inverse (with geometry)" foot="det = ad − bc is the **area scale factor**. If det = 0 the unit square collapses to a line, information is lost, and **no inverse exists**.">
      <Controls>{PRE.map(([n, v]) => <Btn key={n} kind="ghost" onClick={() => setPre(v)}>{n}</Btn>)}</Controls>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 250px' }}>
          <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(2,54px)', gap: 6, marginBottom: 8, padding: '4px 10px', borderLeft: '3px solid var(--c1)', borderRight: '3px solid var(--c1)', borderRadius: 6 }}>
            {s.map((v, i) => <input key={i} style={inp} value={v} inputMode="decimal" aria-label={'abcd'[i]} onChange={(e) => setCell(i, e.target.value)} />)}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.9 }}>
            <div>det = ad − bc = ({fr(a)})({fr(d)}) − ({fr(b)})({fr(c)}) = <b style={mono}>{fr(det)}</b></div>
            <div>Adjugate (swap a,d; negate b,c): <Mx rows={adj.map((r) => r.map(fr))} color="var(--c4)" /></div>
            {inv ? <div>A⁻¹ = (1/{fr(det)}) × adj = <Mx rows={inv.map((r) => r.map(fr))} color="var(--c3)" /></div>
              : <div style={{ color: 'var(--c2)', fontWeight: 600 }}>det = 0 → singular matrix → A⁻¹ does not exist.</div>}
            {check && <div>Check A·A⁻¹ = <Mx rows={check.map((r) => r.map(fr))} color="var(--c3)" /> <span style={{ color: 'var(--c3)' }}>= I ✓</span></div>}
          </div>
        </div>
        <div style={{ flex: '1 1 260px', maxWidth: 360 }}>
          <Plot w={340} h={332} m={{ t: 10, r: 10, b: 26, l: 34 }} xDomain={[-R, R]} yDomain={[-R, R]} ariaLabel="Unit square transformed by the matrix">
            {({ x, y }) => {
              const P = (arr) => arr.map(([u, v]) => `${x(u).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
              return (
                <g>
                  <polygon points={P([[0, 0], [1, 0], [1, 1], [0, 1]])} fill="none" stroke="var(--muted)" strokeDasharray="4 3" strokeWidth="1.5" />
                  <polygon points={P(sq)} fill={singular ? 'var(--c2)' : 'var(--c1)'} fillOpacity="0.28" stroke={singular ? 'var(--c2)' : 'var(--c1)'} strokeWidth="2.5" strokeLinejoin="round" />
                  <line x1={x(0)} y1={y(0)} x2={x(ma)} y2={y(mc)} stroke="var(--c3)" strokeWidth="3" />
                  <line x1={x(0)} y1={y(0)} x2={x(mb)} y2={y(md)} stroke="var(--c4)" strokeWidth="3" />
                  <circle cx={x(ma)} cy={y(mc)} r="4.5" fill="var(--c3)" /><circle cx={x(mb)} cy={y(md)} r="4.5" fill="var(--c4)" />
                  <text x={x(ma) + 6} y={y(mc) - 6} className="lbl-sm" fill="var(--c3)">col 1</text>
                  <text x={x(mb) + 6} y={y(md) - 6} className="lbl-sm" fill="var(--c4)">col 2</text>
                </g>
              );
            }}
          </Plot>
          <Btn kind="primary" onClick={() => { setT(0); setTimeout(play, 30); }}>Animate I → A</Btn>
        </div>
      </div>
      <Readouts>
        <Readout label="det A" value={fr(det)} tone={singular ? 'bad' : 'good'} />
        <Readout label="Area of image of unit square" value={f(area, 3)} />
        <Readout label="Orientation" value={singular ? 'collapsed' : det < 0 ? 'flipped (det < 0)' : 'kept (det > 0)'} />
        <Readout label="Invertible?" value={singular ? 'No (singular)' : 'Yes'} tone={singular ? 'bad' : 'good'} />
      </Readouts>
      {collapsed && <p style={{ color: 'var(--c2)', margin: '6px 0 0', fontSize: 14 }}>The square is now a line segment: many different points land on the same spot, so you cannot map back. That is why det = 0 means no inverse.</p>}
    </Card>
  );
}
