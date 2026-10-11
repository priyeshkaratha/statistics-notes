import React, { useState } from 'react';
import { Card, Controls, Btn, Slider, Readouts, Readout, f } from '../kit/controls.jsx';
import { Plot, linePath } from '../kit/plot.jsx';
import { eig2 } from '../lib/linalg.js';

const num = (s) => { const v = Number(s); return Number.isFinite(v) ? v : 0; };
const PRE = [
  ['Textbook [[4,1],[2,3]]', [4, 1, 2, 3]], ['Symmetric [[2,1],[1,2]]', [2, 1, 1, 2]], ['Diagonal [[4,0],[0,-2]]', [4, 0, 0, -2]],
  ['Triangular [[3,1],[0,2]]', [3, 1, 0, 2]], ['Repeated, defective [[3,1],[0,3]]', [3, 1, 0, 3]], ['Scalar 2I', [2, 0, 0, 2]],
  ['Rotation 90°', [0, -1, 1, 0]], ['Singular [[1,2],[2,4]]', [1, 2, 2, 4]],
];
const inp = { width: 54, height: 34, textAlign: 'center', border: '1px solid var(--line)', borderRadius: 6, background: 'var(--surface)', color: 'var(--ink)', font: '600 15px var(--mono)' };
const deg = (r) => (r * 180) / Math.PI;

function Arrow({ x1, y1, x2, y2, color, w = 3 }) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, h = 9;
  const p = [[x2, y2], [x2 - h * ux + 4 * uy, y2 - h * uy - 4 * ux], [x2 - h * ux - 4 * uy, y2 - h * uy + 4 * ux]].map((q) => q.join(',')).join(' ');
  return <g><line x1={x1} y1={y1} x2={x2 - 6 * ux} y2={y2 - 6 * uy} stroke={color} strokeWidth={w} strokeLinecap="round" /><polygon points={p} fill={color} /></g>;
}

export default function EigenExplorer() {
  const [s, setS] = useState(['4', '1', '2', '3']);
  const [phi, setPhi] = useState(20);
  const [a, b, c, d] = s.map(num);
  const A = [[a, b], [c, d]], tr = a + d, det = a * d - b * c, disc = (tr * tr) / 4 - det;
  const E = eig2(A), complex = E.complex;
  const scalar = !complex && Math.abs(b) < 1e-12 && Math.abs(c) < 1e-12 && Math.abs(a - d) < 1e-12;
  const repeated = !complex && Math.abs(disc) < 1e-9 && !scalar;
  const circ = Array.from({ length: 121 }, (_, i) => { const t = (i / 120) * 2 * Math.PI; return [Math.cos(t), Math.sin(t)]; });
  const img = circ.map(([u, v]) => [a * u + b * v, c * u + d * v]);
  const ext = Math.max(...img.flat().map(Math.abs));
  const R = Math.max(2, Math.ceil(ext * 1.2));
  const px = Math.cos((phi * Math.PI) / 180), py = Math.sin((phi * Math.PI) / 180);
  const qx = a * px + b * py, qy = c * px + d * py, ql = Math.hypot(qx, qy);
  const cross = px * qy - py * qx, dotp = px * qx + py * qy;
  const ang = ql < 1e-9 ? null : deg(Math.atan2(cross, dotp));
  const onEig = ql > 1e-9 && Math.abs(cross) / ql < 0.02;
  const lam = onEig ? dotp : null; // scale factor along this direction (signed)
  const snap = () => { if (!complex) setPhi(Math.round(((deg(Math.atan2(E.vectors[0][1], E.vectors[0][0])) % 360) + 360) % 360)); };
  const setCell = (i, v) => setS((q) => q.map((x, j) => (i === j ? v : x)));
  const vecs = complex || scalar ? [] : repeated ? [[E.values[0], E.vectors[0], 'var(--c3)']] : E.values.map((l, i) => [l, E.vectors[i], i ? 'var(--c4)' : 'var(--c3)']);
  const fr = (v) => f(v, 3);
  const cplx = complex ? `${fr(tr / 2)} ± ${fr(Math.sqrt(-disc))}i` : '';
  return (
    <Card title="Eigen-explorer: which directions only stretch?" foot="An eigenvector is a direction where the arrow **Ax stays on the same line as x**; the eigenvalue is the stretch factor. The unit circle becomes an ellipse, and **trace = sum of eigenvalues, det = product**.">
      <Controls>{PRE.map(([n, v]) => <Btn key={n} kind="ghost" onClick={() => setS(v.map(String))}>{n}</Btn>)}</Controls>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 230px' }}>
          <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(2,54px)', gap: 6, marginBottom: 10, padding: '4px 10px', borderLeft: '3px solid var(--c1)', borderRight: '3px solid var(--c1)', borderRadius: 6 }}>
            {s.map((v, i) => <input key={i} style={inp} value={v} inputMode="decimal" aria-label={'abcd'[i]} onChange={(e) => setCell(i, e.target.value)} />)}
          </div>
          <Slider label="Test vector x at angle" value={phi} onChange={setPhi} min={0} max={360} step={1} unit="°" />
          <div style={{ margin: '6px 0 10px' }}>{!complex && <Btn kind="ghost" onClick={snap}>Snap x to eigenvector 1</Btn>}</div>
          <div style={{ fontSize: 14, lineHeight: 1.8 }}>
            <div>trace = {fr(a)} + {fr(d)} = <b>{fr(tr)}</b>, det = ({fr(a)})({fr(d)}) − ({fr(b)})({fr(c)}) = <b>{fr(det)}</b></div>
            <div>λ² − ({fr(tr)})λ + ({fr(det)}) = 0, discriminant tr²/4 − det = <b>{fr(disc)}</b></div>
            {complex && <div style={{ color: 'var(--c2)', fontWeight: 600 }}>Discriminant is negative: eigenvalues are complex ({cplx}). No real direction keeps its line, as in a rotation, so there are no eigenvector lines to draw.</div>}
            {scalar && <div style={{ color: 'var(--c4)', fontWeight: 600 }}>Scalar matrix: the circle just scales, so EVERY direction is an eigenvector (eigenvalue {fr(a)}).</div>}
            {repeated && <div style={{ color: 'var(--c4)', fontWeight: 600 }}>Repeated eigenvalue {fr(E.values[0])} with only ONE eigenvector line (defective matrix).</div>}
            {vecs.map(([l, v, col], i) => <div key={i} style={{ color: col }}>λ = <b>{fr(l)}</b>, v ∝ ({fr(v[0])}, {fr(v[1])})</div>)}
          </div>
        </div>
        <div style={{ flex: '1 1 270px', maxWidth: 380 }}>
          <Plot w={350} h={350} m={{ t: 10, r: 10, b: 26, l: 30 }} xDomain={[-R, R]} yDomain={[-R, R]} ariaLabel="Unit circle mapped to an ellipse with eigenvector lines">
            {({ x, y }) => (
              <g>
                <path d={linePath(circ.map(([u, v]) => [x(u), y(v)])) + 'Z'} fill="none" stroke="var(--muted)" strokeDasharray="4 3" strokeWidth="1.5" />
                <path d={linePath(img.map(([u, v]) => [x(u), y(v)])) + 'Z'} fill="var(--c1)" fillOpacity="0.16" stroke="var(--c1)" strokeWidth="2.5" />
                {vecs.map(([l, v, col], i) => {
                  const t = R / Math.max(Math.abs(v[0]), Math.abs(v[1]));
                  return (
                    <g key={i}>
                      <line x1={x(-t * v[0])} y1={y(-t * v[1])} x2={x(t * v[0])} y2={y(t * v[1])} stroke={col} strokeWidth="2" strokeDasharray="7 4" />
                      <circle cx={x(v[0])} cy={y(v[1])} r="4" fill={col} /><circle cx={x(l * v[0])} cy={y(l * v[1])} r="5" fill={col} stroke="var(--surface)" strokeWidth="1.5" />
                      <text x={x(l * v[0]) + 7} y={y(l * v[1]) - 7} className="lbl-sm" fill={col}>λ={fr(l)}</text>
                    </g>
                  );
                })}
                <Arrow x1={x(0)} y1={y(0)} x2={x(px)} y2={y(py)} color="var(--c5)" />
                <Arrow x1={x(0)} y1={y(0)} x2={x(qx)} y2={y(qy)} color={onEig ? 'var(--c3)' : 'var(--c2)'} />
                <text x={x(px) + 6} y={y(py) + 14} className="lbl-sm" fill="var(--c5)">x</text>
                <text x={x(qx) + 6} y={y(qy) - 6} className="lbl-sm" fill={onEig ? 'var(--c3)' : 'var(--c2)'}>Ax</text>
              </g>
            )}
          </Plot>
          <div className="lbl-sm" style={{ fontSize: 12, color: 'var(--muted)' }}>Dashed grey: unit circle. Blue: its image under A. Dashed coloured lines: eigenvector directions.</div>
        </div>
      </div>
      <Readouts>
        <Readout label="Trace = λ₁ + λ₂" value={fr(tr)} />
        <Readout label="Det = λ₁ × λ₂" value={fr(det)} />
        <Readout label="Eigenvalues" value={complex ? cplx : E.values.map(fr).join(', ')} tone={complex ? 'warn' : 'good'} />
        <Readout label="Angle from x to Ax" value={ang == null ? 'Ax = 0' : fr(ang) + '°'} tone={onEig ? 'good' : ''} />
        <Readout label="x is an eigenvector?" value={ql < 1e-9 ? 'Ax = 0 (λ = 0)' : onEig ? `Yes, λ ≈ ${fr(lam)}` : 'No: direction changed'} tone={onEig ? 'good' : 'bad'} />
      </Readouts>
    </Card>
  );
}
