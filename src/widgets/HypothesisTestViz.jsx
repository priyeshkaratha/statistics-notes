import React, { useState, useEffect, useRef } from 'react';
import { Card, Slider, Seg, Btn, Readouts, Readout, Controls, f } from '../kit/controls.jsx';
import { Plot, linePath, areaPath } from '../kit/plot.jsx';
import { normPdf, normCdf, normPpf } from '../lib/stats.js';

const reduced = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Eases a number toward `target` (rAF). `kick` restarts from `from`. */
function useEased(target, from, kick) {
  const [v, setV] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    if (reduced() || typeof requestAnimationFrame === 'undefined') { cur.current = target; setV(target); return undefined; }
    let raf; const start = kick ? from : cur.current;
    const t0 = performance.now(), dur = kick ? 1400 : 280;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - (1 - k) ** 3;
      cur.current = start + (target - start) * e; setV(cur.current);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, kick]); // eslint-disable-line react-hooks/exhaustive-deps
  return v;
}

const grid = Array.from({ length: 161 }, (_, i) => -4 + i * 0.05);

export default function HypothesisTestViz({ mu0: m0 = 50, xbar: xb0 = 52, sigma: s0 = 10, n: n0 = 100, alpha: a0 = 0.05, tail: t0 = 'two' }) {
  const [mu0, setMu0] = useState(m0), [xbar, setXbar] = useState(xb0), [sigma, setSigma] = useState(s0);
  const [n, setN] = useState(n0), [alpha, setAlpha] = useState(a0), [tail, setTail] = useState(t0);
  const [kick, setKick] = useState(0);
  const se = sigma / Math.sqrt(n);
  const z = (xbar - mu0) / se;
  const p = tail === 'two' ? 2 * (1 - normCdf(Math.abs(z))) : tail === 'right' ? 1 - normCdf(z) : normCdf(z);
  const zc = tail === 'two' ? normPpf(1 - alpha / 2) : normPpf(1 - alpha);
  const rejCrit = tail === 'two' ? Math.abs(z) > zc : tail === 'right' ? z > zc : z < -zc;
  const reject = p <= alpha;
  const zShow = useEased(Math.max(-3.95, Math.min(3.95, z)), 0, kick);
  const inRej = (v) => (tail === 'two' ? Math.abs(v) >= zc : tail === 'right' ? v >= zc : v <= -zc);
  const inP = (v) => (tail === 'two' ? Math.abs(v) >= Math.abs(zShow) : tail === 'right' ? v >= zShow : v <= zShow);
  const region = (pred) => {
    const segs = []; let cur = [];
    grid.forEach((v) => { if (pred(v)) cur.push(v); else if (cur.length) { segs.push(cur); cur = []; } });
    if (cur.length) segs.push(cur);
    return segs;
  };
  const pick = (e, x, iw) => {
    const svg = e.currentTarget.ownerSVGElement, pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM().inverse());
    const zz = Math.max(-4, Math.min(4, x.invert(q.x - 44)));
    setXbar(Math.max(30, Math.min(70, +(mu0 + zz * se).toFixed(1))));
  };
  const drag = useRef(false);
  const hyp = tail === 'two' ? '≠' : tail === 'right' ? '>' : '<';
  return (
    <Card title="Hypothesis test visualiser (z-test)" foot="If the test statistic lands in the red rejection region, the p-value is smaller than α. The two methods always give the same verdict.">
      <Controls>
        <Seg label="tail" value={tail} onChange={setTail} options={[{ value: 'two', label: 'Two-tailed ≠' }, { value: 'left', label: 'Left-tailed <' }, { value: 'right', label: 'Right-tailed >' }]} />
        <Btn kind="ghost" onClick={() => setKick((k) => k + 1)}>▶ Replay sample</Btn>
      </Controls>
      <Controls>
        <Slider label="Claimed μ₀" value={mu0} onChange={setMu0} min={40} max={60} step={0.5} />
        <Slider label="Observed x̄" value={xbar} onChange={setXbar} min={30} max={70} step={0.1} />
        <Slider label="σ (known)" value={sigma} onChange={setSigma} min={2} max={20} step={0.5} />
        <Slider label="Sample size n" value={n} onChange={setN} min={4} max={400} step={1} />
        <Slider label="Significance α" value={alpha} onChange={setAlpha} min={0.01} max={0.2} step={0.005} />
      </Controls>
      <Plot w={640} h={270} xDomain={[-4, 4]} yDomain={[0, 0.45]} xTicks={[-4, -3, -2, -1, 0, 1, 2, 3, 4]} yTicks={[]} xLabel="z = (x̄ − μ₀) / (σ/√n)" ariaLabel="Standard normal curve showing rejection region and test statistic">
        {({ x, y, iw, ih }) => (
          <g>
            {region(inRej).map((s, i) => <path key={`r${i}`} d={areaPath(s.map((v) => [x(v), y(normPdf(v))]), y(0))} fill="var(--c2)" opacity="0.28" />)}
            {region(inP).map((s, i) => <path key={`p${i}`} d={areaPath(s.map((v) => [x(v), y(normPdf(v))]), y(0))} fill="var(--c1)" opacity="0.5" />)}
            <path d={linePath(grid.map((v) => [x(v), y(normPdf(v))]))} fill="none" stroke="var(--ink)" strokeWidth="2.2" />
            {(tail === 'two' ? [-zc, zc] : [tail === 'right' ? zc : -zc]).map((c) => (
              <g key={c}><line x1={x(c)} x2={x(c)} y1={y(0.34)} y2={y(0)} stroke="var(--c2)" strokeWidth="2" strokeDasharray="5 3" />
                <text x={x(c)} y={y(0.355)} textAnchor="middle" className="lbl-sm" fill="var(--c2)">crit {f(c, 2)}</text></g>
            ))}
            <line x1={x(zShow)} x2={x(zShow)} y1={y(0.42)} y2={y(0)} stroke="var(--c1)" strokeWidth="3" />
            <circle cx={x(zShow)} cy={y(0.42)} r="6" fill="var(--c1)" />
            <text x={x(zShow) + (zShow > 2.2 ? -10 : 10)} y={y(0.41)} textAnchor={zShow > 2.2 ? 'end' : 'start'} className="lbl-sm" fill="var(--c1)">z = {f(z, 2)}</text>
            <rect x={0} y={0} width={iw} height={ih} fill="transparent" style={{ cursor: 'ew-resize', touchAction: 'none' }}
              onPointerDown={(e) => { drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); pick(e, x, iw); }}
              onPointerMove={(e) => { if (drag.current) pick(e, x, iw); }}
              onPointerUp={() => { drag.current = false; }} />
          </g>
        )}
      </Plot>
      <p style={{ fontSize: 13, color: 'var(--muted)', margin: '2px 0 8px' }}>
        Red = rejection region (total area α = {f(alpha, 3)}). Blue = p-value area (as extreme as your z). Drag on the curve to move x̄.
      </p>
      <div style={{ fontSize: 14, margin: '4px 0' }}>H₀: μ = {mu0} &nbsp;vs&nbsp; H₁: μ {hyp} {mu0}</div>
      <Readouts>
        <Readout label="SE = σ/√n" value={f(se, 3)} />
        <Readout label="z statistic" value={f(z, 3)} />
        <Readout label={tail === 'two' ? 'critical ±z' : 'critical z'} value={(tail === 'left' ? '−' : tail === 'two' ? '±' : '') + f(zc, 3)} />
        <Readout label="p-value" value={f(p, 4)} tone={reject ? 'bad' : 'good'} />
      </Readouts>
      <div role="status" style={{ marginTop: 10, padding: '10px 14px', borderRadius: 12, fontWeight: 600, transition: 'background .35s, color .35s, transform .35s', transform: reject ? 'scale(1.01)' : 'scale(1)', background: reject ? 'var(--bad-bg)' : 'var(--good-bg)' }}>
        {reject ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}
        <span style={{ fontWeight: 400, fontSize: 13.5, display: 'block', marginTop: 2 }}>
          Critical-value method: z {rejCrit ? 'is in' : 'is not in'} the rejection region. P-value method: p = {f(p, 4)} {reject ? '≤' : '>'} α = {f(alpha, 3)}. Same verdict.
        </span>
      </div>
    </Card>
  );
}
