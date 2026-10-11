import React, { useState } from 'react';
import { Card, Controls, Seg, Slider, Btn, Readouts, Readout, f } from '../kit/controls.jsx';
import { rot, proj, refl, matVec } from '../lib/linalg.js';
import { matMul, det2 } from '../lib/stats.js';

const TYPES = [
  { value: 'scale', label: 'Scale' }, { value: 'rotate', label: 'Rotate' }, { value: 'project', label: 'Project' },
  { value: 'reflect', label: 'Reflect' }, { value: 'shear', label: 'Shear' },
];
const DEFAULTS = {
  scale: { a: 2, b: 0.5 }, rotate: { a: 30, b: 0 }, project: { a: 30, b: 0 }, reflect: { a: 30, b: 0 }, shear: { a: 1, b: 0 },
};
const mat = ({ type, a, b }) => {
  if (type === 'scale') return [[a, 0], [0, b]];
  if (type === 'rotate') return rot(a);
  if (type === 'project') return proj(a);
  if (type === 'reflect') return refl(a);
  return [[1, a], [0, 1]];
};
const clean = (M) => M.map((r) => r.map((x) => (Math.abs(x) < 1e-9 ? 0 : x)));
const S = 42, C = 180; // pixels per unit, centre
const px = ([x, y]) => `${(C + S * x).toFixed(1)},${(C - S * y).toFixed(1)}`;
const SQUARE = [[0, 0], [1, 0], [1, 1], [0, 1]];

function Stage({ title, spec, onChange }) {
  const { type, a, b } = spec;
  const set = (patch) => onChange({ ...spec, ...patch });
  return (
    <div style={{ margin: '6px 0' }}>
      <Controls>
        <Seg label={title} options={TYPES} value={type} onChange={(t) => onChange({ type: t, ...DEFAULTS[t] })} />
      </Controls>
      <Controls>
        {type === 'scale' && <><Slider label="sx" value={a} onChange={(v) => set({ a: v })} min={-3} max={3} step={0.1} fmt={(v) => f(v, 1)} /><Slider label="sy" value={b} onChange={(v) => set({ b: v })} min={-3} max={3} step={0.1} fmt={(v) => f(v, 1)} /></>}
        {type === 'rotate' && <Slider label="angle θ (CCW)" value={a} onChange={(v) => set({ a: v })} min={-180} max={180} step={1} unit="°" />}
        {type === 'project' && <Slider label="line angle θ" value={a} onChange={(v) => set({ a: v })} min={0} max={180} step={1} unit="°" />}
        {type === 'reflect' && <Slider label="mirror angle θ" value={a} onChange={(v) => set({ a: v })} min={0} max={180} step={1} unit="°" />}
        {type === 'shear' && <Slider label="shear k" value={a} onChange={(v) => set({ a: v })} min={-2} max={2} step={0.1} fmt={(v) => f(v, 1)} />}
      </Controls>
    </div>
  );
}

const axisLine = (deg, key, col) => {
  const t = (deg * Math.PI) / 180, L = 5.5;
  return <line key={key} x1={C - S * L * Math.cos(t)} y1={C + S * L * Math.sin(t)} x2={C + S * L * Math.cos(t)} y2={C - S * L * Math.sin(t)} stroke={col} strokeWidth="1.5" strokeDasharray="2 5" />;
};
const arrow = (from, to, col, key, w = 2.5) => {
  const [x1, y1] = px(from).split(',').map(Number), [x2, y2] = px(to).split(',').map(Number);
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 3) return <circle key={key} cx={x2} cy={y2} r="3" fill={col} />;
  const ux = (x2 - x1) / len, uy = (y2 - y1) / len, h = 8;
  return (
    <g key={key} stroke={col} fill={col}>
      <line x1={x1} y1={y1} x2={x2 - ux * h * 0.6} y2={y2 - uy * h * 0.6} strokeWidth={w} />
      <polygon stroke="none" points={`${x2},${y2} ${x2 - ux * h - uy * h * 0.45},${y2 - uy * h + ux * h * 0.45} ${x2 - ux * h + uy * h * 0.45},${y2 - uy * h - ux * h * 0.45}`} />
    </g>
  );
};

export default function TransformPlayground() {
  const [t1, setT1] = useState({ type: 'rotate', ...DEFAULTS.rotate });
  const [t2, setT2] = useState({ type: 'scale', a: 2, b: 1 });
  const [compose, setCompose] = useState(false);
  const [v, setV] = useState([2, 1]);

  const A = mat(t1), B = mat(t2);
  const M = compose ? matMul(B, A) : A;         // T2 after T1
  const N = compose ? matMul(A, B) : null;      // swapped order
  const d = det2(M);
  const img = (X) => SQUARE.map((p) => matVec(X, p));
  const vOut = matVec(M, v);
  const swapped = N && N.some((r, i) => r.some((x, j) => Math.abs(x - M[i][j]) > 1e-9));
  const m = clean(M);
  const lines = [];
  [[t1, 't1'], [t2, 't2']].forEach(([t, k]) => { if ((k === 't1' || compose) && (t.type === 'project' || t.type === 'reflect')) lines.push(axisLine(t.a, k, k === 't1' ? 'var(--c3)' : 'var(--c4)')); });
  const tone = Math.abs(d) < 1e-9 ? 'bad' : d < 0 ? 'warn' : 'good';

  return (
    <Card title="Transformation playground" foot="**Columns of the matrix = where $\hat{i}$ and $\hat{j}$ land.** $\det$ is the area scale factor (sign = flip), and with two steps $T_2T_1 \ne T_1T_2$ in general.">
      <Stage title="First transformation T1" spec={t1} onChange={setT1} />
      <Controls>
        <Seg label="Compose" options={[{ value: false, label: 'Single' }, { value: true, label: 'Compose with T2' }]} value={compose} onChange={setCompose} />
        <Btn kind="ghost" onClick={() => { setT1({ type: 'scale', a: 2, b: 1 }); setT2({ type: 'rotate', a: 90, b: 0 }); setCompose(true); setV([1, 2]); }}>Source example: scale then rotate 90°</Btn>
      </Controls>
      {compose && <Stage title="Second transformation T2 (applied after T1)" spec={t2} onChange={setT2} />}
      <Controls>
        <Slider label="vector x" value={v[0]} onChange={(x) => setV([x, v[1]])} min={-3} max={3} step={0.5} fmt={(x) => f(x, 1)} />
        <Slider label="vector y" value={v[1]} onChange={(y) => setV([v[0], y])} min={-3} max={3} step={0.5} fmt={(y) => f(y, 1)} />
      </Controls>
      <svg viewBox="0 0 360 360" className="plot" style={{ maxWidth: 400, margin: '8px auto', overflow: 'hidden' }} role="img" aria-label="Unit square and sample vector before and after the transformation">
        {Array.from({ length: 9 }, (_, i) => <g key={i}><line className="grid" x1={C + S * (i - 4)} y1="0" x2={C + S * (i - 4)} y2="360" /><line className="grid" x1="0" y1={C + S * (i - 4)} x2="360" y2={C + S * (i - 4)} /></g>)}
        <line className="axis" x1="0" y1={C} x2="360" y2={C} /><line className="axis" x1={C} y1="0" x2={C} y2="360" />
        {lines}
        <polygon points={SQUARE.map(px).join(' ')} fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeDasharray="4 3" />
        {N && swapped && <polygon points={img(N).map(px).join(' ')} fill="none" stroke="var(--c5)" strokeWidth="2" strokeDasharray="5 3" />}
        <polygon points={img(M).map(px).join(' ')} fill="color-mix(in srgb, var(--c1) 22%, transparent)" stroke="var(--c1)" strokeWidth="2" />
        {arrow([0, 0], [M[0][0], M[1][0]], 'var(--c3)', 'e1', 2)}
        {arrow([0, 0], [M[0][1], M[1][1]], 'var(--c4)', 'e2', 2)}
        {arrow([0, 0], v, 'var(--muted)', 'v', 2.5)}
        {arrow([0, 0], vOut, 'var(--c2)', 'vo', 3)}
        <text className="lbl-sm" x={C + S * v[0] + 6} y={C - S * v[1] - 6}>x</text>
        <text className="lbl" x={C + S * vOut[0] + 6} y={C - S * vOut[1] - 6} style={{ fill: 'var(--c2)' }}>x′</text>
      </svg>
      <p className="muted" style={{ margin: '0 0 8px', fontSize: 13, textAlign: 'center' }}>Dashed grey = unit square. Blue = its image. Green/amber arrows = images of (1,0) and (0,1) = the matrix columns. Grey arrow = x, red arrow = x′.{N && swapped ? ' Purple dashed = result if the order were swapped (T1 after T2).' : ''}</p>
      <Readouts>
        <Readout label={compose ? 'M = T2·T1' : 'Matrix T'} value={`[${f(m[0][0], 3)}, ${f(m[0][1], 3)}; ${f(m[1][0], 3)}, ${f(m[1][1], 3)}]`} />
        <Readout label="x′ = Mx" value={`(${f(clean([vOut])[0][0], 3)}, ${f(clean([vOut])[0][1], 3)})`} />
        <Readout label="det = area factor" value={f(d, 3)} tone={tone} />
        <Readout label="Orientation" value={Math.abs(d) < 1e-9 ? 'collapsed' : d < 0 ? 'flipped' : 'kept'} tone={tone} />
        {compose && <Readout label="T1·T2 equals T2·T1?" value={swapped ? 'No, order matters' : 'Yes (they commute here)'} tone={swapped ? 'warn' : 'good'} />}
      </Readouts>
    </Card>
  );
}
