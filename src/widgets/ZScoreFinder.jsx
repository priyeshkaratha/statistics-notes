import React, { useState, useRef, useEffect } from 'react';
import { Card, Slider, Seg, Btn, Readouts, Readout, Controls, f } from '../kit/controls.jsx';
import { Plot, areaPath, linePath } from '../kit/plot.jsx';
import { normPdf, normPpf } from '../lib/stats.js';

const reduced = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ZScoreFinder({ mu: mu0 = 70, sigma: s0 = 10 }) {
  const [mu, setMu] = useState(mu0);
  const [sigma, setSigma] = useState(s0);
  const [mode, setMode] = useState('right');
  const [pct, setPct] = useState(5);
  const raf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const setPctAnim = (target) => {
    cancelAnimationFrame(raf.current);
    if (reduced()) { setPct(target); return; }
    const p0 = pct, t0 = performance.now();
    const step = (now) => { const u = Math.min(1, (now - t0) / 600), e = 1 - (1 - u) ** 3; setPct(p0 + (target - p0) * e); if (u < 1) raf.current = requestAnimationFrame(step); };
    raf.current = requestAnimationFrame(step);
  };
  const choose = (m, v) => { setMode(m); setPctAnim(v); };

  const pr = Math.min(99.9, Math.max(0.1, pct)) / 100;
  let zc1, zc2 = null;
  if (mode === 'left') zc1 = normPpf(pr);
  else if (mode === 'right') zc1 = normPpf(1 - pr);
  else { zc2 = normPpf(0.5 + pr / 2); zc1 = -zc2; }
  const xc1 = mu + zc1 * sigma, xc2 = zc2 == null ? null : mu + zc2 * sigma;
  const d0 = mu - 4 * sigma, d1 = mu + 4 * sigma;
  const grid = Array.from({ length: 161 }, (_, i) => d0 + (i * (d1 - d0)) / 160);
  const seg = (u, v) => grid.filter((g) => g >= u && g <= v);
  const sliderLabel = mode === 'left' ? 'area to the LEFT (percentile) %' : mode === 'right' ? 'area to the RIGHT (top) %' : 'middle (central) area %';
  const tail = mode === 'central' ? (1 - pr) / 2 : null;

  return (
    <Card title="Inverse normal: probability → cut-off" foot="Find $z$ from the table or `norm.ppf` first, then convert back: $x=\\mu+z\\sigma$. Top 5% means the 95th percentile, $z\\approx1.645$.">
      <Controls>
        <Slider label="μ" value={mu} onChange={setMu} min={-10} max={200} fmt={(v) => f(v, 1)} />
        <Slider label="σ" value={sigma} onChange={setSigma} min={0.5} max={40} step={0.5} fmt={(v) => f(v, 1)} />
      </Controls>
      <Controls>
        <Seg label="what you know" value={mode} onChange={(m) => { setMode(m); }} options={[{ value: 'left', label: 'Left area' }, { value: 'right', label: 'Top area' }, { value: 'central', label: 'Middle area' }]} />
        <Slider label={sliderLabel} value={pct} onChange={setPct} min={0.5} max={99.5} step={0.5} fmt={(v) => f(v, 1)} />
      </Controls>
      <Controls>
        <Btn onClick={() => choose('central', 90)}>90% middle</Btn>
        <Btn onClick={() => choose('central', 95)}>95% middle</Btn>
        <Btn onClick={() => choose('central', 99)}>99% middle</Btn>
        <Btn onClick={() => choose('right', 5)}>Top 5%</Btn>
        <Btn onClick={() => choose('left', 10)}>Bottom 10%</Btn>
      </Controls>
      <Plot w={640} h={270} xDomain={[d0, d1]} yDomain={[0, normPdf(mu, mu, sigma) * 1.18]} yTicks={[]} xTicks={[-3, -2, -1, 0, 1, 2, 3].map((z) => mu + z * sigma)} xFmt={(v) => f(v, 1)} grid={false} ariaLabel="normal curve with cut-off lines">
        {({ x, y, ih }) => {
          const C = (u, v) => { const g = seg(u, v); return areaPath([[u, 0], ...g.map((q) => [q, normPdf(q, mu, sigma)]), [v, 0]].map(([q, h]) => [x(q), y(h)]), ih); };
          const shade = mode === 'left' ? [[d0, xc1]] : mode === 'right' ? [[xc1, d1]] : [[xc1, xc2]];
          const L = (v, z, k) => (
            <g key={k}>
              <line x1={x(v)} x2={x(v)} y1={4} y2={ih} stroke="var(--c2)" strokeWidth="2.2" style={{ transition: 'all .2s' }} />
              <text x={x(v)} y={-3} textAnchor="middle" className="lbl" fill="var(--c2)">x = {f(v, 2)}</text>
              <text x={x(v)} y={ih + 31} textAnchor="middle" className="lbl" fill="var(--c2)">z = {f(z, 3)}</text>
            </g>
          );
          return (
            <g>
              {shade.map(([u, v], i) => u < v && <path key={i} d={C(Math.max(d0, u), Math.min(d1, v))} fill="var(--c1)" opacity="0.4" />)}
              <path d={linePath(grid.map((q) => [x(q), y(normPdf(q, mu, sigma))]))} fill="none" stroke="var(--c1)" strokeWidth="2.5" />
              <text x={x(mu)} y={y(normPdf(mu, mu, sigma) * 0.4)} textAnchor="middle" className="lbl">{f(pr * 100, 1)}%</text>
              {L(xc1, zc1, 1)}{xc2 != null && L(xc2, zc2, 2)}
            </g>
          );
        }}
      </Plot>
      <Readouts>
        <Readout label={zc2 == null ? 'z cut-off' : 'z cut-offs'} value={zc2 == null ? f(zc1, 4) : `±${f(zc2, 4)}`} tone="good" />
        <Readout label={zc2 == null ? 'x = μ + zσ' : 'x = μ ± zσ'} value={zc2 == null ? f(xc1, 3) : `${f(xc1, 2)} , ${f(xc2, 2)}`} tone="good" />
        <Readout label="area to left of cut-off" value={f(mode === 'left' ? pr : mode === 'right' ? 1 - pr : tail, 4)} />
        {mode === 'central' && <Readout label="each tail" value={f(tail, 4)} />}
      </Readouts>
    </Card>
  );
}
