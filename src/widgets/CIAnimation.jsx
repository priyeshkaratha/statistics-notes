import React, { useState, useRef, useEffect } from 'react';
import { Card, Controls, Slider, Seg, Btn, Readouts, Readout, f } from '../kit/controls.jsx';
import { Plot } from '../kit/plot.jsx';
import { mean, sampleSD, zCritical, tCritical, seededRandom, randNormal } from '../lib/stats.js';

const MU = 100, SIGMA = 15, SHOW = 60;

function oneInterval(rng, n, conf, mode) {
  const xs = Array.from({ length: n }, () => randNormal(rng, MU, SIGMA));
  const xbar = mean(xs);
  const half = mode === 'z' ? zCritical(conf) * SIGMA / Math.sqrt(n) : tCritical(1 - conf, n - 1) * sampleSD(xs) / Math.sqrt(n);
  return { lo: xbar - half, hi: xbar + half, xbar, hit: xbar - half <= MU && MU <= xbar + half };
}

export default function CIAnimation() {
  const [n, setN] = useState(15);
  const [conf, setConf] = useState(0.95);
  const [mode, setMode] = useState('t');
  const rng = useRef(null);
  const [list, setList] = useState(() => {
    rng.current = seededRandom(2024);
    return Array.from({ length: 40 }, () => oneInterval(rng.current, 15, 0.95, 't'));
  });
  const [running, setRunning] = useState(false);
  const cfg = useRef({ n, conf, mode });
  cfg.current = { n, conf, mode };

  const add = (k) => setList((l) => {
    const out = l.slice();
    for (let i = 0; i < k; i++) { const c = cfg.current; out.push(oneInterval(rng.current, c.n, c.conf, c.mode)); }
    return out;
  });
  const reset = () => { setRunning(false); setList([]); rng.current = seededRandom(2024 + Math.floor(Math.random() * 1e6)); };
  const changed = (setter) => (v) => { setRunning(false); setList([]); setter(v); };

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => add(1), 90);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => { if (list.length >= 1000 && running) setRunning(false); }, [list.length, running]);

  const hits = list.filter((r) => r.hit).length;
  const pct = list.length ? (100 * hits) / list.length : NaN;
  const se = SIGMA / Math.sqrt(n);
  const dom = [MU - 4 * se, MU + 4 * se];
  const shown = list.slice(-SHOW);
  const firstIdx = list.length - shown.length;
  const clamp = (v) => Math.min(dom[1], Math.max(dom[0], v));
  const tol = list.length >= 40 ? Math.abs(pct - conf * 100) <= 4 : true;

  return (
    <Card title="Confidence intervals: repeated sampling" foot="The **95% belongs to the method**, not to any one interval: in the long run about 95 of every 100 such intervals catch the true $\mu$ (red ones missed).">
      <Controls>
        <Slider label="Sample size n" value={n} onChange={changed(setN)} min={5} max={100} />
        <Slider label="Confidence level" value={conf} onChange={changed(setConf)} min={0.5} max={0.99} step={0.01} fmt={(v) => Math.round(v * 100) + '%'} />
        <Seg label="Interval type" options={[{ value: 'z', label: 'z (σ known)' }, { value: 't', label: 't (σ unknown, use s)' }]} value={mode} onChange={changed(setMode)} />
      </Controls>
      <Plot h={360} m={{ t: 10, r: 16, b: 34, l: 16 }} xDomain={dom} yDomain={[0, SHOW]} yTicks={[]} xTicks={[MU - 2 * se, MU - se, MU, MU + se, MU + 2 * se].map((v) => +v.toFixed(2))} xFmt={(v) => f(v, 1)} xLabel="Population mean μ = 100 (true value, dashed)" ariaLabel="stack of confidence intervals">
        {({ x, y, ih }) => (
          <g>
            <line x1={x(MU)} x2={x(MU)} y1={0} y2={ih} stroke="var(--ink)" strokeWidth="1.8" strokeDasharray="5 4" />
            {shown.map((r, i) => {
              const yy = y(SHOW - i - 0.5);
              const c = r.hit ? 'var(--c1)' : 'var(--c2)';
              return (
                <g key={firstIdx + i} opacity={0.35 + 0.65 * ((i + 1) / shown.length)}>
                  <line x1={x(clamp(r.lo))} x2={x(clamp(r.hi))} y1={yy} y2={yy} stroke={c} strokeWidth={r.hit ? 3 : 4} strokeLinecap="round" />
                  <circle cx={x(clamp(r.xbar))} cy={yy} r="2.4" fill={c} />
                </g>
              );
            })}
          </g>
        )}
      </Plot>
      <Controls>
        <Btn kind="primary" onClick={() => setRunning(!running)}>{running ? 'Pause' : 'Run'}</Btn>
        <Btn onClick={() => { setRunning(false); add(1); }}>+1</Btn>
        <Btn onClick={() => { setRunning(false); add(50); }}>+50</Btn>
        <Btn kind="ghost" onClick={reset}>Reset</Btn>
      </Controls>
      <Readouts>
        <Readout label="Intervals drawn" value={list.length} />
        <Readout label="Caught μ" value={`${hits}`} tone="good" />
        <Readout label="Missed μ" value={`${list.length - hits}`} tone={list.length - hits ? 'bad' : ''} />
        <Readout label="Coverage so far" value={list.length ? f(pct, 1) + '%' : '—'} tone={list.length >= 40 ? (tol ? 'good' : 'warn') : ''} />
        <Readout label="Promised" value={Math.round(conf * 100) + '%'} />
      </Readouts>
    </Card>
  );
}
