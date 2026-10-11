import React, { useState, useEffect, useRef } from 'react';
import { Card, Controls, Slider, Seg, Readouts, Readout, f } from '../kit/controls.jsx';
import { Plot } from '../kit/plot.jsx';
import { zCritical, tCritical } from '../lib/stats.js';

const XBAR = 50;
const BASE = { sigma: 10, n: 25, conf: 0.95 };
const BASE_ME = zCritical(BASE.conf) * BASE.sigma / Math.sqrt(BASE.n);

// ease a displayed number toward its target (instant under prefers-reduced-motion)
function useTween(target) {
  const [v, setV] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    const rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (rm) { cur.current = target; setV(target); return undefined; }
    let raf;
    const step = () => {
      cur.current += (target - cur.current) * 0.22;
      if (Math.abs(target - cur.current) < 0.002) cur.current = target;
      setV(cur.current);
      if (cur.current !== target) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}

export default function CIWidthExplorer() {
  const [sigma, setSigma] = useState(10);
  const [n, setN] = useState(25);
  const [conf, setConf] = useState(0.95);
  const [mode, setMode] = useState('z');

  const crit = mode === 'z' ? zCritical(conf) : tCritical(1 - conf, n - 1);
  const se = sigma / Math.sqrt(n);
  const me = crit * se;
  const meA = useTween(me);
  const dom = [0, 100];
  const clampX = (v) => Math.min(dom[1], Math.max(dom[0], v));
  const ratio = me / BASE_ME;

  return (
    <Card title="What controls the width of a confidence interval?" foot="Width = 2 × z × σ/√n: **more confidence or more variability widens it; more data narrows it** (but only by √n, so 4× the data for half the width).">
      <Controls>
        <Slider label="Population SD σ (or s)" value={sigma} onChange={setSigma} min={1} max={30} step={1} />
        <Slider label="Sample size n" value={n} onChange={setN} min={4} max={400} step={1} />
        <Slider label="Confidence level" value={conf} onChange={setConf} min={0.8} max={0.999} step={0.001} fmt={(v) => (v * 100).toFixed(1) + '%'} />
        <Seg label="critical value" options={[{ value: 'z', label: 'z (σ known)' }, { value: 't', label: 't (σ unknown)' }]} value={mode} onChange={setMode} />
      </Controls>
      <Plot h={190} m={{ t: 12, r: 16, b: 34, l: 16 }} xDomain={dom} yDomain={[0, 1]} yTicks={[]} xLabel="x̄ = 50 (centre of the interval)" ariaLabel="confidence interval on a number line">
        {({ x, ih }) => {
          const yA = ih * 0.3, yB = ih * 0.72;
          const lo = XBAR - meA, hi = XBAR + meA;
          return (
            <g>
              <line x1={x(XBAR)} x2={x(XBAR)} y1={0} y2={ih} stroke="var(--ink)" strokeDasharray="4 3" opacity="0.6" />
              {/* reference interval */}
              <line x1={x(XBAR - BASE_ME)} x2={x(XBAR + BASE_ME)} y1={yB} y2={yB} stroke="var(--muted)" strokeWidth="7" strokeLinecap="round" opacity="0.5" />
              <text x={x(XBAR)} y={yB + 24} textAnchor="middle" className="lbl-sm">reference: σ = 10, n = 25, 95% (±{f(BASE_ME, 2)})</text>
              {/* live interval */}
              <rect x={x(clampX(lo))} width={Math.max(0, x(clampX(hi)) - x(clampX(lo)))} y={yA - 11} height="22" rx="11" fill="var(--c1)" opacity="0.28" />
              <line x1={x(clampX(lo))} x2={x(clampX(hi))} y1={yA} y2={yA} stroke="var(--c1)" strokeWidth="3" />
              {[lo, hi].map((v, i) => <g key={i}><line x1={x(clampX(v))} x2={x(clampX(v))} y1={yA - 15} y2={yA + 15} stroke="var(--c1)" strokeWidth="3.5" /><text x={x(clampX(v))} y={yA - 20} textAnchor="middle" className="lbl-sm" fill="var(--c1)">{f(v, 2)}</text></g>)}
              <circle cx={x(XBAR)} cy={yA} r="5" fill="var(--c2)" stroke="var(--surface)" strokeWidth="1.5" />
              <line x1={x(clampX(XBAR))} x2={x(clampX(hi))} y1={yA + 24} y2={yA + 24} stroke="var(--c3)" strokeWidth="2" />
              <text x={x(XBAR) + (x(clampX(hi)) - x(XBAR)) / 2} y={yA + 38} textAnchor="middle" className="lbl-sm" fill="var(--c3)">ME</text>
            </g>
          );
        }}
      </Plot>
      <Readouts>
        <Readout label={mode === 'z' ? 'z critical' : `t critical (df ${n - 1})`} value={f(crit, 3)} />
        <Readout label="SE = σ/√n" value={f(se, 3)} />
        <Readout label="Margin of error" value={f(me, 3)} tone="good" />
        <Readout label="Interval" value={`(${f(XBAR - me, 2)}, ${f(XBAR + me, 2)})`} />
        <Readout label="Width vs reference" value={`×${f(ratio, 2)}`} tone={ratio > 1.05 ? 'bad' : ratio < 0.95 ? 'good' : ''} />
      </Readouts>
    </Card>
  );
}
