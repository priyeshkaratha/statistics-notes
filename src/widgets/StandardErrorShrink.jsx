import React, { useState, useEffect, useRef } from 'react';
import { Card, Controls, Slider, Btn, Readouts, Readout, f } from '../kit/controls.jsx';
import { Plot, linePath, areaPath } from '../kit/plot.jsx';
import { normPdf, normCdf } from '../lib/stats.js';

const MU = 50;

export default function StandardErrorShrink() {
  const [n, setN] = useState(4);
  const [sigma, setSigma] = useState(10);
  const [E, setE] = useState(2);
  const [play, setPlay] = useState(false);
  const t = useRef(0);

  // Play: sweep n from 1 to 400 on a log scale.
  useEffect(() => {
    if (!play) return undefined;
    t.current = Math.log(n) / Math.log(400);
    const id = setInterval(() => {
      t.current += 0.012;
      if (t.current >= 1) { setN(400); setPlay(false); return; }
      setN(Math.max(1, Math.round(400 ** t.current)));
    }, 50);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play]);

  const se = sigma / Math.sqrt(n);
  const lo = MU - 3.6 * sigma, hi = MU + 3.6 * sigma;
  const g = Array.from({ length: 161 }, (_, i) => lo + ((hi - lo) * i) / 160);
  const yMax = Math.max(normPdf(MU, MU, se), normPdf(MU, MU, sigma)) * 1.08;
  const within = 2 * normCdf(E / se) - 1;
  const seCurve = Array.from({ length: 100 }, (_, i) => 1 + (399 * i) / 99);

  return (
    <Card title="Standard error shrinks like 1/√n" foot="**Quadruple $n$, halve the standard error.** Individual values stay as spread out as before ($\sigma$); only the *average* gets steadier.">
      <Controls>
        <Slider label="Sample size n" value={n} onChange={(v) => { setPlay(false); setN(v); }} min={1} max={400} />
        <Slider label="Population SD σ" value={sigma} onChange={setSigma} min={2} max={20} />
        <Slider label="Tolerance ±E" value={E} onChange={setE} min={0.5} max={6} step={0.5} />
        <Btn kind="primary" onClick={() => { if (!play && n >= 400) setN(1); setPlay(!play); }}>{play ? 'Pause' : 'Play n = 1 → 400'}</Btn>
      </Controls>
      <Plot h={220} xDomain={[lo, hi]} yDomain={[0, yMax]} yTicks={[]} xLabel="value" ariaLabel="population and sampling distribution">
        {({ x, y, ih }) => (
          <g>
            <path d={linePath(g.map((v) => [x(v), y(normPdf(v, MU, sigma))]))} fill="none" stroke="var(--c4)" strokeWidth="2" strokeDasharray="5 4" />
            <path d={areaPath(g.filter((v) => Math.abs(v - MU) <= E).map((v) => [x(v), y(normPdf(v, MU, se))]), ih)} fill="var(--c3)" opacity="0.45" />
            <path d={areaPath(g.map((v) => [x(v), y(normPdf(v, MU, se))]), ih)} fill="var(--c1)" opacity="0.22" />
            <path d={linePath(g.map((v) => [x(v), y(normPdf(v, MU, se))]))} fill="none" stroke="var(--c1)" strokeWidth="2.8" />
            <line x1={x(MU)} x2={x(MU)} y1={0} y2={ih} stroke="var(--ink)" strokeDasharray="3 3" />
            <text x={8} y={14} className="lbl-sm" fill="var(--c4)">dashed: individual values, SD = σ</text>
            <text x={8} y={30} className="lbl-sm" fill="var(--c1)">solid: sample means, SD = σ/√n</text>
            <text x={x(MU)} y={ih - 6} textAnchor="middle" className="lbl-sm" fill="var(--ink)">green: |x̄ − μ| ≤ E</text>
          </g>
        )}
      </Plot>
      <Plot h={170} xDomain={[1, 400]} yDomain={[0, sigma]} xTicks={[1, 50, 100, 200, 300, 400]} xLabel="sample size n" yLabel="SE" ariaLabel="standard error versus n">
        {({ x, y }) => (
          <g>
            <path d={linePath(seCurve.map((v) => [x(v), y(sigma / Math.sqrt(v))]))} fill="none" stroke="var(--c2)" strokeWidth="2.4" />
            {[1, 4, 16, 64, 256].filter((v) => v <= 400).map((v) => <g key={v}><circle cx={x(v)} cy={y(sigma / Math.sqrt(v))} r="3" fill="var(--muted)" /><text x={x(v) + 5} y={y(sigma / Math.sqrt(v)) - 6} className="lbl-sm">{f(sigma / Math.sqrt(v), 2)}</text></g>)}
            <line x1={x(n)} x2={x(n)} y1={y(0)} y2={y(se)} stroke="var(--c1)" strokeDasharray="3 3" />
            <circle cx={x(n)} cy={y(se)} r="6.5" fill="var(--c1)" stroke="var(--surface)" strokeWidth="2" />
          </g>
        )}
      </Plot>
      <Readouts>
        <Readout label="SE = σ/√n" value={f(se, 3)} tone="good" />
        <Readout label="n" value={n} />
        <Readout label={`P(|x̄−μ| ≤ ${E})`} value={f(within * 100, 1) + '%'} />
        <Readout label="n for half this SE" value={4 * n} />
      </Readouts>
    </Card>
  );
}
