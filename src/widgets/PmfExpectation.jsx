import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, Seg, Btn, Readouts, Readout, f } from '../kit/controls.jsx';

const PRESETS = {
  die: { label: 'Fair die', v0: 1, p: [1, 1, 1, 1, 1, 1].map((x) => x / 6) },
  loaded: { label: 'Loaded die', v0: 1, p: [0.1, 0.1, 0.1, 0.1, 0.1, 0.5] },
  coins: { label: 'Heads in 2 tosses', v0: 0, p: [0.25, 0.5, 0.25] },
  table: { label: 'Notes-style table', v0: 0, p: [0.1, 0.3, 0.4, 0.2] },
};

function useSmoothArr(target, ms = 160) { // eases an array toward target; instant under reduced motion
  const [v, setV] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof requestAnimationFrame === 'undefined' || cur.current.length !== target.length) { cur.current = target; setV(target); return undefined; }
    const from = cur.current, t0 = performance.now(); let id;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / ms);
      cur.current = target.map((x, i) => from[i] + (x - from[i]) * k); setV(cur.current);
      if (k < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [target, ms]);
  return v;
}

export default function PmfExpectation({ preset = 'table' }) {
  const [key, setKey] = useState(PRESETS[preset] ? preset : 'table');
  const [probs, setProbs] = useState(PRESETS[PRESETS[preset] ? preset : 'table'].p);
  const [drag, setDrag] = useState(-1);
  const svgRef = useRef(null);
  const { v0 } = PRESETS[key], n = probs.length;
  const xs = Array.from({ length: n }, (_, i) => v0 + i);

  const mu = xs.reduce((s, x, i) => s + x * probs[i], 0);
  const ex2 = xs.reduce((s, x, i) => s + x * x * probs[i], 0);
  const vr = Math.max(0, ex2 - mu * mu), sd = Math.sqrt(vr);
  const sp = useSmoothArr(probs);
  const smu = xs.reduce((s, x, i) => s + x * (sp[i] ?? 0), 0);

  const W = 640, H = 290, L = 46, Rr = 20, T = 18, B = 74;
  const iw = W - L - Rr, ih = H - T - B, bw = iw / n;
  const ymax = Math.max(0.5, Math.ceil((Math.max(...probs) + 0.05) * 10) / 10);
  const Y = (p) => T + ih * (1 - p / ymax);
  const Xc = (v) => L + (v - v0 + 0.5) * bw;

  const setP = (i, t) => {
    t = Math.min(1, Math.max(0, Math.round(t * 100) / 100));
    const rest = 1 - t, others = probs.reduce((s, p, j) => s + (j === i ? 0 : p), 0);
    setProbs(probs.map((p, j) => (j === i ? t : others > 1e-9 ? (p / others) * rest : rest / (n - 1))));
  };
  const fromEvent = (e) => { const r = svgRef.current.getBoundingClientRect(); const y = ((e.clientY - r.top) / r.height) * H; return ymax * (1 - (y - T) / ih); };
  const pick = (k) => { setKey(k); setProbs(PRESETS[k].p); };
  const key2 = (i, e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); setP(i, probs[i] + 0.01); } if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); setP(i, probs[i] - 0.01); } };
  const yt = useMemo(() => { const out = []; for (let t = 0; t <= ymax + 1e-9; t += ymax > 0.5 ? 0.2 : 0.1) out.push(+t.toFixed(2)); return out; }, [ymax]);

  return (
    <Card title="Drag the pmf, watch E[X] balance" foot="**E[X] is the balance point** of the bars; **Var(X) = E[X²] − (E[X])²** measures how far the probability mass sits from it. Probabilities always re-normalise to sum to 1.">
      <Seg options={Object.entries(PRESETS).map(([value, o]) => ({ value, label: o.label }))} value={key} onChange={pick} label="Preset pmf" />
      <p style={{ fontSize: 13, color: 'var(--muted)', margin: '8px 0 0' }}>Drag a bar up or down (or focus it and use arrow keys). The other bars shrink or grow proportionally so the total stays 1.</p>
      <svg ref={svgRef} className="plot" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Editable probability mass function with the mean marked as a balance point"
        onPointerMove={(e) => { if (drag >= 0) setP(drag, fromEvent(e)); }} onPointerUp={() => setDrag(-1)} onPointerLeave={() => setDrag(-1)} onPointerCancel={() => setDrag(-1)}>
        {yt.map((t) => <g key={t}><line x1={L} x2={W - Rr} y1={Y(t)} y2={Y(t)} className="grid" /><text x={L - 7} y={Y(t) + 4} textAnchor="end" className="tick">{t.toFixed(1)}</text></g>)}
        <line x1={L} x2={W - Rr} y1={Y(0)} y2={Y(0)} className="axis" />
        {xs.map((x, i) => (
          <g key={x}>
            <rect x={L + i * bw + bw * 0.14} y={Y(sp[i] ?? 0)} width={bw * 0.72} height={Math.max(0, Y(0) - Y(sp[i] ?? 0))} rx="4" fill="var(--c1)" opacity={drag === i ? 1 : 0.8} />
            <rect x={L + i * bw} y={T} width={bw} height={ih} fill="transparent" style={{ cursor: 'ns-resize' }} tabIndex={0} role="slider" aria-label={`P(X=${x})`} aria-valuemin={0} aria-valuemax={1} aria-valuenow={+probs[i].toFixed(3)}
              onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag(i); setP(i, fromEvent(e)); }} onKeyDown={(e) => key2(i, e)} />
            <text x={Xc(x)} y={Math.min(Y(sp[i] ?? 0) - 6, Y(0) - 4)} textAnchor="middle" className="lbl" style={{ pointerEvents: 'none' }}>{f(probs[i], 3)}</text>
            <text x={Xc(x)} y={Y(0) + 16} textAnchor="middle" className="tick">{x}</text>
          </g>
        ))}
        <text x={L + iw / 2} y={Y(0) + 31} textAnchor="middle" className="axislabel">x</text>
        {/* SD band, then the fulcrum at the mean */}
        <g style={{ pointerEvents: 'none' }}>
          <line x1={Xc(Math.max(v0 - 0.5, smu - sd))} x2={Xc(Math.min(v0 + n - 0.5, smu + sd))} y1={Y(0) + 42} y2={Y(0) + 42} stroke="var(--c4)" strokeWidth="5" strokeLinecap="round" opacity=".55" />
          <text x={Xc(smu)} y={Y(0) + 64} textAnchor="middle" className="lbl-sm" style={{ fill: 'var(--c4)' }}>μ ± σ  =  {f(mu, 2)} ± {f(sd, 2)}</text>
          <polygon points={`${Xc(smu)},${Y(0) + 2} ${Xc(smu) - 9},${Y(0) + 24} ${Xc(smu) + 9},${Y(0) + 24}`} fill="var(--c2)" />
          <line x1={Xc(smu)} x2={Xc(smu)} y1={T} y2={Y(0)} stroke="var(--c2)" strokeWidth="1.5" strokeDasharray="5 4" />
          <text x={Xc(smu) + 6} y={T + 10} className="lbl-sm" style={{ fill: 'var(--c2)', fontWeight: 700 }}>E[X] = {f(mu, 3)}</text>
        </g>
      </svg>
      <div className="table-wrap" style={{ margin: '8px 0' }}>
        <table>
          <thead><tr><th>x</th>{xs.map((x) => <th key={x}>{x}</th>)}<th>Total</th></tr></thead>
          <tbody>
            <tr><td>P(x)</td>{probs.map((p, i) => <td key={i} className="mono">{f(p, 3)}</td>)}<td className="mono">{f(probs.reduce((s, p) => s + p, 0), 3)}</td></tr>
            <tr><td>x·P(x)</td>{probs.map((p, i) => <td key={i} className="mono">{f(xs[i] * p, 3)}</td>)}<td className="mono"><b>{f(mu, 3)}</b></td></tr>
            <tr><td>x²·P(x)</td>{probs.map((p, i) => <td key={i} className="mono">{f(xs[i] ** 2 * p, 3)}</td>)}<td className="mono"><b>{f(ex2, 3)}</b></td></tr>
          </tbody>
        </table>
      </div>
      <Readouts>
        <Readout label="E[X] = Σ x·P(x)" value={f(mu, 4)} />
        <Readout label="E[X²]" value={f(ex2, 4)} />
        <Readout label="Var = E[X²] − μ²" value={f(vr, 4)} tone="warn" />
        <Readout label="SD = √Var" value={f(sd, 4)} />
      </Readouts>
      <div style={{ marginTop: 8 }}><Btn kind="ghost" onClick={() => setProbs(PRESETS[key].p)}>Reset this pmf</Btn></div>
    </Card>
  );
}
