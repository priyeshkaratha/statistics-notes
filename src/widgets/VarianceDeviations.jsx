import React, { useState, useRef, useEffect } from 'react';
import { Card, Controls, Seg, Btn, Slider, Readouts, Readout, f } from '../kit/controls.jsx';
import { mean, sum } from '../lib/stats.js';

const W = 640, H = 340, L = 20, R = 20, BASE = 312, DOM = 22, SX = (W - L - R) / DOM;
const sx = (v) => L + v * SX;
const COLS = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)'];
const PRESETS = {
  teacher: [4, 5, 6, 7, 8, 8, 9, 10, 12, 15],
  tight: [7, 8, 8, 9, 9, 9, 10, 10, 11],
  wide: [2, 4, 7, 9, 11, 13, 15, 18, 20],
};

export default function VarianceDeviations() {
  const [data, setData] = useState(PRESETS.teacher);
  const [kind, setKind] = useState('sample');
  const [centreMode, setCentreMode] = useState('mean');
  const [guess, setGuess] = useState(10);
  const [grow, setGrow] = useState(1);
  const [drag, setDrag] = useState(-1);
  const svgRef = useRef(null);
  const raf = useRef(0);

  const n = data.length, xbar = mean(data);
  const c = centreMode === 'mean' ? xbar : guess;
  const ss = sum(data.map((v) => (v - c) ** 2));
  const ssMean = sum(data.map((v) => (v - xbar) ** 2));
  const den = kind === 'sample' ? n - 1 : n;
  const variance = ss / den;

  const replay = () => {
    cancelAnimationFrame(raf.current);
    const t0 = performance.now();
    const tick = (t) => { const k = Math.min(1, (t - t0) / 1400); setGrow(1 - (1 - k) ** 3); if (k < 1) raf.current = requestAnimationFrame(tick); };
    setGrow(0); raf.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const move = (e) => {
    if (drag < 0) return;
    const r = svgRef.current.getBoundingClientRect();
    const v = Math.min(DOM, Math.max(0, Math.round((((e.clientX - r.left) / r.width) * W - L) / SX * 2) / 2));
    const next = data.slice(); next[drag] = v; setData(next);
  };
  const seen = {};
  const dots = data.map((v, i) => { const k = Math.round(v * 2); seen[k] = (seen[k] || 0) + 1; return { v, i, row: seen[k] - 1 }; });

  return (
    <Card title="Variance as squares on the deviations" foot="**Each square has side |x − centre|. Variance is the total area divided by n − 1 (sample) or n (population).** The mean is the centre that makes the total area smallest.">
      <Controls>
        <Seg options={[{ value: 'sample', label: 'Sample: ÷ (n − 1)' }, { value: 'pop', label: 'Population: ÷ n' }]} value={kind} onChange={setKind} label="Divisor" />
        <Seg options={[{ value: 'mean', label: 'Centre = mean x̄' }, { value: 'guess', label: 'Centre = my guess' }]} value={centreMode} onChange={setCentreMode} label="Centre" />
        {centreMode === 'guess' && <Slider label="Try another centre c" value={guess} onChange={setGuess} min={0} max={DOM} step={0.1} fmt={(v) => f(v, 1)} />}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Btn kind="primary" onClick={replay}>Replay squares</Btn>
          <Btn kind="ghost" onClick={() => { setData(PRESETS.teacher); replay(); }}>Teacher&apos;s data</Btn>
          <Btn kind="ghost" onClick={() => { setData(PRESETS.tight); replay(); }}>Tight</Btn>
          <Btn kind="ghost" onClick={() => { setData(PRESETS.wide); replay(); }}>Wide</Btn>
          <Btn kind="ghost" onClick={() => setData([...data, Math.round(xbar)])}>Add point</Btn>
          <Btn kind="ghost" disabled={n <= 3} onClick={() => setData(data.slice(0, -1))}>Remove</Btn>
        </div>
      </Controls>
      <svg ref={svgRef} className="plot" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Data points with squares drawn on each deviation from the centre" onPointerMove={move} onPointerUp={() => setDrag(-1)} onPointerLeave={() => setDrag(-1)} style={{ touchAction: 'none' }}>
        <line x1={L} x2={W - R} y1={BASE} y2={BASE} className="axis" />
        {Array.from({ length: DOM / 2 + 1 }, (_, i) => i * 2).map((t) => <text key={t} x={sx(t)} y={BASE + 24} textAnchor="middle" className="tick">{t}</text>)}
        {/* squares */}
        {data.map((v, i) => {
          const d = (v - c) * grow, side = Math.abs(d) * SX;
          const x = v < c ? sx(v) : sx(c);
          const w = Math.abs(v - c) * SX * grow;
          return (
            <g key={i}>
              <rect x={x} y={BASE - 6 - side} width={w} height={side} fill={COLS[i % 5]} fillOpacity=".22" stroke={COLS[i % 5]} strokeWidth="1.2" />
              {side > 30 && grow > 0.95 && <text x={x + w / 2} y={BASE - 6 - side / 2 + 4} textAnchor="middle" className="lbl-sm" fill="var(--ink)">{f((v - c) ** 2, 2)}</text>}
            </g>
          );
        })}
        {/* centre line */}
        <line x1={sx(c)} x2={sx(c)} y1={14} y2={BASE} stroke="var(--ink)" strokeWidth="2" strokeDasharray="6 4" />
        <text x={sx(c)} y={12} textAnchor="middle" className="lbl-sm" fill="var(--ink)">{centreMode === 'mean' ? `x̄ = ${f(xbar, 2)}` : `c = ${f(c, 1)}`}</text>
        {centreMode === 'guess' && <line x1={sx(xbar)} x2={sx(xbar)} y1={BASE - 14} y2={BASE + 4} stroke="var(--c3)" strokeWidth="3" />}
        {/* draggable points */}
        {dots.map(({ v, i, row }) => (
          <circle key={i} cx={sx(v)} cy={BASE + 0 - row * 3} r="7" fill={COLS[i % 5]} stroke="var(--surface)" strokeWidth="2" style={{ cursor: 'grab' }}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag(i); setGrow(1); }} />
        ))}
      </svg>
      <p style={{ fontSize: 13, color: 'var(--muted)', margin: '2px 0 0' }}>Drag a dot sideways: its square grows with the SQUARE of the distance, so far-away points dominate.</p>
      <Readouts>
        <Readout label="n" value={n} />
        <Readout label="Mean x̄" value={f(xbar, 3)} />
        <Readout label="Σ(x − x̄)" value={f(Math.round(sum(data.map((v) => v - xbar)) * 1e9) / 1e9, 3)} tone="good" />
        <Readout label={centreMode === 'mean' ? 'Σ(x − x̄)² = SS' : `Σ(x − c)²`} value={f(ss, 3)} />
        {centreMode === 'guess' && <Readout label="SS about x̄" value={f(ssMean, 3)} tone="good" />}
        <Readout label={kind === 'sample' ? 's² = SS/(n−1)' : 'σ² = SS/n'} value={f(variance, 4)} tone="warn" />
        <Readout label={kind === 'sample' ? 's' : 'σ'} value={f(Math.sqrt(variance), 4)} tone="warn" />
      </Readouts>
    </Card>
  );
}
