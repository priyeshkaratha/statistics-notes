import React, { useState } from 'react';
import { Card, Controls, Btn, Readouts, Readout, f } from '../kit/controls.jsx';
import { Plot } from '../kit/plot.jsx';
import { dot, norm } from '../lib/linalg.js';

const L = 6;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const snap = (v) => clamp(Math.round(v * 2) / 2, -L, L);
const PRE = [
  ['Source Ex. 1: (2,1) and (3,−2)', [2, 1], [3, -2]],
  ['Perpendicular', [3, 1], [-1, 3]],
  ['Parallel', [2, 1], [4, 2]],
  ['Opposite', [2, 1], [-4, -2]],
  ['Acute', [4, 1], [3, 3]],
];

function Arrow({ x, y, to, color, label }) {
  const x0 = x(0), y0 = y(0), x1 = x(to[0]), y1 = y(to[1]), ang = Math.atan2(y1 - y0, x1 - x0), h = 11;
  const p = (a) => `${x1 - h * Math.cos(ang + a)},${y1 - h * Math.sin(ang + a)}`;
  return (
    <g>
      <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={color} strokeWidth="3" strokeLinecap="round" />
      <polygon points={`${x1},${y1} ${p(0.4)} ${p(-0.4)}`} fill={color} />
      <text x={x1 + 10} y={y1 - 10} fill={color} className="lbl">{label}</text>
    </g>
  );
}

export default function VectorDotAngle() {
  const [u, setU] = useState([2, 1]), [v, setV] = useState([3, -2]);
  const [drag, setDrag] = useState(null);
  const nu = norm(u), nv = norm(v), d = dot(u, v);
  const ok = nu > 0 && nv > 0;
  const cos = ok ? clamp(d / (nu * nv), -1, 1) : NaN, th = ok ? (Math.acos(cos) * 180) / Math.PI : NaN;
  const kind = !ok ? 'a zero vector has no angle' : Math.abs(d) < 1e-9 ? 'perpendicular (orthogonal)' : d > 0 ? 'acute: pointing the same general way' : 'obtuse: pointing generally opposite ways';
  const pr = ok ? d / (nu * nu) : 0; // projection of v onto u
  const move = (e, which, g) => {
    const svg = e.currentTarget.ownerSVGElement, pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const nx = snap(g.x.invert(p.x - g.m.l)), ny = snap(g.y.invert(p.y - g.m.t));
    (which === 'u' ? setU : setV)([nx, ny]);
  };
  const nudge = (e, which) => {
    const dd = { ArrowLeft: [-0.5, 0], ArrowRight: [0.5, 0], ArrowUp: [0, 0.5], ArrowDown: [0, -0.5] }[e.key];
    if (!dd) return; e.preventDefault();
    (which === 'u' ? setU : setV)((q) => [snap(q[0] + dd[0]), snap(q[1] + dd[1])]);
  };
  const fmt = (q) => `(${f(q[0], 1)}, ${f(q[1], 1)})`;
  return (
    <Card title="Dot product, length and angle: drag the two arrow tips" foot="**cos θ = u·v / (‖u‖‖v‖)**. The dot product is positive for an acute angle, zero for a right angle and negative for an obtuse angle; its sign is the angle's sign.">
      <Controls>{PRE.map(([n, a, b]) => <Btn key={n} kind="ghost" onClick={() => { setU(a); setV(b); }}>{n}</Btn>)}</Controls>
      <Plot w={396} h={392} m={{ t: 16, r: 16, b: 30, l: 34 }} xDomain={[-L, L]} yDomain={[-L, L]} xTicks={[-6, -4, -2, 0, 2, 4, 6]} yTicks={[-6, -4, -2, 0, 2, 4, 6]} ariaLabel="Two draggable vectors with their angle">
        {(g) => {
          const { x, y } = g;
          let arc = null;
          if (ok) {
            const a1 = Math.atan2(u[1], u[0]), a2 = Math.atan2(v[1], v[0]);
            let dd = a2 - a1; while (dd > Math.PI) dd -= 2 * Math.PI; while (dd <= -Math.PI) dd += 2 * Math.PI;
            const r = 0.9, P = (a) => `${x(r * Math.cos(a))},${y(r * Math.sin(a))}`;
            arc = Math.abs(dd) < 1e-6 ? null : <path d={`M${P(a1)} A${x(r) - x(0)},${x(r) - x(0)} 0 0 ${dd > 0 ? 0 : 1} ${P(a2)}`} fill="none" stroke="var(--c4)" strokeWidth="3" />;
          }
          return (
            <g>
              <line x1={x(-L)} x2={x(L)} y1={y(0)} y2={y(0)} className="axis" /><line x1={x(0)} x2={x(0)} y1={y(-L)} y2={y(L)} className="axis" />
              {ok && <line x1={x(v[0])} y1={y(v[1])} x2={x(pr * u[0])} y2={y(pr * u[1])} stroke="var(--c4)" strokeWidth="1.5" strokeDasharray="4 3" />}
              {ok && <line x1={x(0)} y1={y(0)} x2={x(pr * u[0])} y2={y(pr * u[1])} stroke="var(--c4)" strokeWidth="6" strokeOpacity="0.35" />}
              {arc}
              <Arrow x={x} y={y} to={u} color="var(--c1)" label="u" />
              <Arrow x={x} y={y} to={v} color="var(--c2)" label="v" />
              {[['u', u, 'var(--c1)'], ['v', v, 'var(--c2)']].map(([w, q, col]) => (
                <circle key={w} cx={x(q[0])} cy={y(q[1])} r={drag === w ? 12 : 9} fill={col} fillOpacity="0.25" stroke={col} strokeWidth="2" tabIndex={0} role="slider" aria-label={`Tip of vector ${w}, ${fmt(q)}. Arrow keys move it.`} style={{ cursor: 'grab', outline: 'none' }}
                  onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setDrag(w); }}
                  onPointerMove={(e) => { if (drag === w) move(e, w, g); }}
                  onPointerUp={() => setDrag(null)} onPointerCancel={() => setDrag(null)} onKeyDown={(e) => nudge(e, w)} />
              ))}
            </g>
          );
        }}
      </Plot>
      <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '2px 0 8px' }}>Drag a tip (snaps to half-units) or focus it and use arrow keys. The amber shadow on u is the projection of v onto u.</p>
      <div style={{ padding: '8px 12px', background: 'var(--surface2)', borderRadius: 10, fontFamily: 'var(--mono)', fontSize: 14, lineHeight: 1.7 }}>
        u·v = ({f(u[0], 1)})({f(v[0], 1)}) + ({f(u[1], 1)})({f(v[1], 1)}) = <b>{f(d, 2)}</b><br />
        ‖u‖ = √({f(u[0] ** 2 + u[1] ** 2, 2)}) = {f(nu, 3)}, ‖v‖ = √({f(v[0] ** 2 + v[1] ** 2, 2)}) = {f(nv, 3)}<br />
        cos θ = {f(d, 2)} / ({f(nu, 3)} × {f(nv, 3)}) = <b>{ok ? f(cos, 4) : '—'}</b>
      </div>
      <Readouts>
        <Readout label="u · v" value={f(d, 2)} tone={Math.abs(d) < 1e-9 ? 'warn' : ''} />
        <Readout label="cos θ" value={ok ? f(cos, 4) : '—'} />
        <Readout label="θ" value={ok ? `${f(th, 2)}°` : '—'} tone={ok && Math.abs(th - 90) < 1e-6 ? 'warn' : ''} />
        <Readout label="Reading" value={kind} />
      </Readouts>
    </Card>
  );
}
