import React, { useState, useEffect, useRef } from 'react';
import { Card, Slider, Btn, Readouts, Readout, Controls, f } from '../kit/controls.jsx';
import { Plot } from '../kit/plot.jsx';
import { normCdf, seededRandom, randNormal } from '../lib/stats.js';

const BINS = 20;
const pFromZ = (z) => 2 * (1 - normCdf(Math.abs(z)));

export default function PValueMeaning({ delta: d0 = 0, alpha: a0 = 0.05 }) {
  const [delta, setDelta] = useState(d0), [alpha, setAlpha] = useState(a0);
  const [ps, setPs] = useState(() => { const r = seededRandom(11); return Array.from({ length: 200 }, () => pFromZ(randNormal(r, d0, 1))); });
  const [play, setPlay] = useState(false);
  const rng = useRef(seededRandom(97));
  const add = (k) => setPs((a) => [...a, ...Array.from({ length: k }, () => pFromZ(randNormal(rng.current, delta, 1)))].slice(-3000));
  const reset = (dl) => { setDelta(dl); setPlay(false); const r = seededRandom(5); setPs(Array.from({ length: 200 }, () => pFromZ(randNormal(r, dl, 1)))); };
  useEffect(() => {
    if (!play) return undefined;
    const id = setInterval(() => add(25), 250);
    return () => clearInterval(id);
  }, [play, delta]); // eslint-disable-line react-hooks/exhaustive-deps
  const counts = Array(BINS).fill(0);
  ps.forEach((p) => { counts[Math.min(BINS - 1, Math.floor(p * BINS))]++; });
  const maxC = Math.max(...counts, ps.length / BINS * 1.6);
  const below = ps.filter((p) => p <= alpha).length, frac = below / ps.length;
  return (
    <Card title="What a p-value is: many experiments" foot="When H₀ is true, p-values are uniform on 0 to 1, so exactly about α of experiments cross the line by chance. That is the Type I error rate.">
      <Controls>
        <Slider label="True effect δ (in SE units, 0 = H₀ true)" value={delta} onChange={reset} min={0} max={4} step={0.25} />
        <Slider label="Significance α" value={alpha} onChange={setAlpha} min={0.01} max={0.3} step={0.01} />
        <Btn kind="primary" onClick={() => setPlay(!play)}>{play ? '❚❚ Pause' : '▶ Run experiments'}</Btn>
        <Btn kind="ghost" onClick={() => add(100)}>+100</Btn>
        <Btn kind="ghost" onClick={() => reset(delta)}>Reset</Btn>
      </Controls>
      <Plot w={640} h={250} xDomain={[0, 1]} yDomain={[0, maxC * 1.08]} xTicks={[0, 0.2, 0.4, 0.6, 0.8, 1]} xLabel="p-value of each experiment" yLabel="count" ariaLabel="Histogram of simulated p-values">
        {({ x, y }) => (
          <g>
            {counts.map((c, i) => {
              const lo = i / BINS, hi = (i + 1) / BINS, hot = hi <= alpha + 1e-9 || lo < alpha;
              return <rect key={i} x={x(lo) + 1} width={x(hi) - x(lo) - 2} y={y(c)} height={y(0) - y(c)} rx="2" fill={lo < alpha ? 'var(--c2)' : 'var(--c1)'} opacity={hot ? 0.8 : 0.55} style={{ transition: 'all .25s' }} />;
            })}
            {delta === 0 && <line x1={0} x2={x(1)} y1={y(ps.length / BINS)} y2={y(ps.length / BINS)} stroke="var(--ink)" strokeDasharray="5 4" opacity="0.6" />}
            <line x1={x(alpha)} x2={x(alpha)} y1={0} y2={y(0)} stroke="var(--c2)" strokeWidth="2" />
            <text x={x(alpha) + 5} y={12} className="lbl-sm" fill="var(--c2)">α = {f(alpha, 2)}</text>
          </g>
        )}
      </Plot>
      <Readouts>
        <Readout label="experiments" value={ps.length} />
        <Readout label="with p ≤ α" value={below} tone="bad" />
        <Readout label="fraction" value={f(frac, 3)} tone={delta === 0 ? 'warn' : 'good'} />
      </Readouts>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>
        {delta === 0
          ? `H₀ is TRUE here, yet about ${f(alpha * 100, 1)}% of experiments still "reject" it: those are Type I errors. The dashed line is the flat (uniform) pattern.`
          : `A real effect exists. The p-values pile up near 0, and the fraction below α (${f(frac, 2)}) estimates the test's power.`}
      </p>
    </Card>
  );
}
