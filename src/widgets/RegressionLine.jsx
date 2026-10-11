import React, { useEffect, useRef, useState } from 'react';
import { Card, Controls, Seg, Slider, Btn, Readouts, Readout, f } from '../kit/controls.jsx';
import { Plot } from '../kit/plot.jsx';
import { regression, mean } from '../lib/stats.js';

const SETS = {
  class: { label: 'Class example', pts: [[1, 2], [2, 4], [3, 5], [4, 4], [5, 5]], xd: [0, 6], yd: [0, 7] },
  study: { label: 'Study hours', pts: [[2, 54], [3, 60], [4, 58], [6, 68], [7, 72], [8, 78]], xd: [0, 10], yd: [40, 90] },
  cloud: { label: 'Noisy cloud', pts: [[1, 3], [2, 6], [3, 2.5], [4, 7], [5, 4], [6, 8], [7, 5], [8, 7.5], [9, 9]], xd: [0, 10], yd: [0, 10] },
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export default function RegressionLine() {
  const [key, setKey] = useState('class');
  const [pts, setPts] = useState(SETS.class.pts);
  const [mode, setMode] = useState('best');
  const [sq, setSq] = useState(true);
  const [b0o, setB0o] = useState(mean(SETS.class.pts.map((p) => p[1])));
  const [b1o, setB1o] = useState(0);
  const [drag, setDrag] = useState(null);
  const raf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const S = SETS[key], [x0, x1] = S.xd, [y0, y1] = S.yd;
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const ols = regression(xs, ys);
  const own = mode === 'own';
  const b0 = own ? b0o : ols.b0, b1 = own ? b1o : ols.b1;
  const sse = ys.reduce((s, y, i) => s + (y - (b0 + b1 * xs[i])) ** 2, 0);
  const r2 = 1 - sse / ols.ssTot;
  const slopeMax = (2 * (y1 - y0)) / (x1 - x0);

  const loadSet = (k) => {
    cancelAnimationFrame(raf.current);
    setKey(k); setPts(SETS[k].pts); setB1o(0); setB0o(mean(SETS[k].pts.map((p) => p[1])));
  };
  const snap = () => {
    cancelAnimationFrame(raf.current);
    const s0 = { a: b0o, b: b1o }, t0 = performance.now();
    const step = (now) => {
      const u = Math.min(1, (now - t0) / 800), e = 1 - (1 - u) ** 3;
      setB0o(s0.a + (ols.b0 - s0.a) * e); setB1o(s0.b + (ols.b1 - s0.b) * e);
      if (u < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };
  const addPoint = () => { const i = pts.length, xx = x0 + (0.12 + 0.76 * ((i * 0.381) % 1)) * (x1 - x0); setPts([...pts, [+xx.toFixed(1), +(ols.b0 + ols.b1 * xx + (i % 2 ? 1 : -1) * 0.12 * (y1 - y0)).toFixed(1)]]); };
  const move = (e, i, geo) => {
    const svg = e.currentTarget.ownerSVGElement, pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const nx = clamp(geo.x.invert(p.x - geo.m.l), x0, x1), ny = clamp(geo.y.invert(p.y - geo.m.t), y0, y1);
    setPts((a) => a.map((q, j) => (j === i ? [+nx.toFixed(1), +ny.toFixed(1)] : q)));
  };
  const key2 = (e, i) => {
    const d = { ArrowLeft: [-0.1, 0], ArrowRight: [0.1, 0], ArrowUp: [0, (y1 - y0) / 100], ArrowDown: [0, -(y1 - y0) / 100] }[e.key];
    if (!d) return; e.preventDefault();
    setPts((a) => a.map((q, j) => (j === i ? [+clamp(q[0] + d[0], x0, x1).toFixed(2), +clamp(q[1] + d[1], y0, y1).toFixed(2)] : q)));
  };

  const bar = (label, v, col) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, margin: '3px 0' }}>
      <span style={{ width: 92, color: 'var(--ink2)' }}>{label}</span>
      <div style={{ flex: 1, background: 'var(--surface2)', borderRadius: 6, height: 14 }}><div style={{ width: `${clamp((v / Math.max(ols.ssTot, sse)) * 100, 0, 100)}%`, background: col, height: 14, borderRadius: 6, transition: 'width .3s' }} /></div>
      <b className="mono" style={{ width: 52, textAlign: 'right' }}>{f(v, 2)}</b>
    </div>
  );

  return (
    <Card title="Least squares: drag the points, then try to beat the best line" foot="The least-squares line is the *one* line with the smallest total of squared vertical gaps (SSE). Any other line, even a close one, scores worse.">
      <Controls>
        <div><div className="slider-label">Data</div><Seg options={Object.entries(SETS).map(([v, o]) => ({ value: v, label: o.label }))} value={key} onChange={loadSet} label="data set" /></div>
        <div><div className="slider-label">Line</div><Seg options={[{ value: 'best', label: 'Best fit' }, { value: 'own', label: 'Try my own' }]} value={mode} onChange={setMode} label="mode" /></div>
        <div><div className="slider-label">Squares</div><Seg options={[{ value: true, label: 'Show' }, { value: false, label: 'Hide' }]} value={sq} onChange={setSq} label="squares" /></div>
      </Controls>
      {own && (
        <Controls>
          <Slider label="Slope b₁" value={b1o} onChange={setB1o} min={-slopeMax} max={slopeMax} step={slopeMax / 200} fmt={(v) => f(v, 2)} />
          <Slider label="Intercept b₀" value={b0o} onChange={setB0o} min={y0 - (y1 - y0)} max={y1} step={(y1 - y0) / 200} fmt={(v) => f(v, 2)} />
          <div><Btn onClick={snap}>Snap to best fit</Btn></div>
        </Controls>
      )}
      <Plot h={300} xDomain={S.xd} yDomain={S.yd} xLabel="x" yLabel="y" ariaLabel="Scatter plot with regression line, residuals and squared residuals">
        {(g) => {
          const { x, y, iw, ih } = g;
          return (
            <g>
              <clipPath id="rl-clip"><rect width={iw} height={ih} /></clipPath>
              <g clipPath="url(#rl-clip)">
                {pts.map(([px, py], i) => {
                  const yh = b0 + b1 * px, a = y(py), b = y(yh), side = Math.abs(a - b);
                  return (
                    <g key={i}>
                      {sq && <rect x={x(px)} y={Math.min(a, b)} width={side} height={side} fill="var(--c2)" fillOpacity="0.16" stroke="var(--c2)" strokeOpacity="0.5" style={{ transition: 'all .25s' }} />}
                      <line x1={x(px)} x2={x(px)} y1={a} y2={b} stroke="var(--c2)" strokeWidth="2" />
                    </g>
                  );
                })}
                {own && <line x1={x(x0)} x2={x(x1)} y1={y(ols.b0 + ols.b1 * x0)} y2={y(ols.b0 + ols.b1 * x1)} stroke="var(--muted)" strokeWidth="2" strokeDasharray="5 4" />}
                <line x1={x(x0)} x2={x(x1)} y1={y(b0 + b1 * x0)} y2={y(b0 + b1 * x1)} stroke="var(--c1)" strokeWidth="3" />
              </g>
              {pts.map(([px, py], i) => (
                <circle key={i} cx={x(px)} cy={y(py)} r={drag === i ? 9 : 7} fill="var(--c1)" stroke="var(--surface)" strokeWidth="2" tabIndex={0} role="slider" aria-label={`Point ${i + 1}: x ${px}, y ${py}. Arrow keys move it.`} style={{ cursor: 'grab', outline: 'none' }}
                  onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setDrag(i); }}
                  onPointerMove={(e) => { if (drag === i) move(e, i, g); }}
                  onPointerUp={() => setDrag(null)} onPointerCancel={() => setDrag(null)} onKeyDown={(e) => key2(e, i)} />
              ))}
              <text x={iw - 6} y={16} textAnchor="end" className="lbl-sm" fill="var(--c1)">{`ŷ = ${f(b0, 2)} ${b1 < 0 ? '−' : '+'} ${f(Math.abs(b1), 2)}x`}</text>
            </g>
          );
        }}
      </Plot>
      <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '2px 0 8px' }}>Drag a point (or focus it and use arrow keys). Red squares have side = residual, so their total area is SSE.</p>
      {own && <div>{bar('Your SSE', sse, 'var(--c2)')}{bar('Minimum SSE', ols.ssRes, 'var(--c3)')}{bar('SST (mean line)', ols.ssTot, 'var(--muted)')}</div>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
        <Btn onClick={addPoint}>Add point</Btn>
        <Btn onClick={() => setPts([...pts, [x0 + 0.9 * (x1 - x0), y0 + 0.08 * (y1 - y0)]])}>Add outlier</Btn>
        <Btn disabled={pts.length <= 3} onClick={() => setPts(pts.slice(0, -1))}>Remove last</Btn>
        <Btn kind="ghost" onClick={() => loadSet(key)}>Reset</Btn>
      </div>
      <Readouts>
        <Readout label="b₀ (intercept)" value={f(b0, 3)} />
        <Readout label="b₁ (slope)" value={f(b1, 3)} />
        <Readout label="SSE" value={f(sse, 3)} tone={own && sse > ols.ssRes + 1e-6 ? 'warn' : 'good'} />
        <Readout label="SST" value={f(ols.ssTot, 3)} />
        <Readout label="R²" value={f(r2, 3)} tone={r2 < 0 ? 'bad' : ''} />
        <Readout label="r" value={f(Math.sign(ols.b1) * Math.sqrt(Math.max(0, ols.r2)), 3)} />
      </Readouts>
    </Card>
  );
}
