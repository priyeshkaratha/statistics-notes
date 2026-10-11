import React, { useEffect, useState } from 'react';
import { Card, Controls, Slider, Seg, Btn, Readouts, Readout, f } from '../kit/controls.jsx';
import { Plot, linePath, areaPath } from '../kit/plot.jsx';
import { fPdf, fCdf, fCritical } from '../lib/stats.js';

const reduced = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function FDistributionViz({ df1: a = 2, df2: b = 6, alpha: al = 0.05, F: F0 = 3.77 }) {
  const [d1, setD1] = useState(a);
  const [d2, setD2] = useState(b);
  const [alpha, setAlpha] = useState(al);
  const [F, setF] = useState(F0);
  const [ghost, setGhost] = useState(false);
  const [flash, setFlash] = useState(0);

  useEffect(() => {
    if (!flash || reduced()) return undefined;
    const id = setTimeout(() => setFlash(0), 700);
    return () => clearTimeout(id);
  }, [flash]);

  const crit = fCritical(alpha, d1, d2);
  const critSwap = fCritical(alpha, d2, d1);
  const p = 1 - fCdf(F, d1, d2);
  const reject = F > crit;
  const xmax = Math.min(25, Math.max(6, crit * 1.35));
  const N = 200;
  const pts = Array.from({ length: N + 1 }, (_, i) => Math.max(0.02, (i / N) * xmax));
  const peak = Math.max(...pts.filter((v) => v > 0.25).map((v) => fPdf(v, d1, d2)));
  const yTop = Math.min(1.2, Math.max(0.35, peak * 1.15));
  const tail = pts.filter((v) => v >= crit);
  const swap = () => { setD1(d2); setD2(d1); setFlash(1); setGhost(true); };

  return (
    <Card title="F distribution: df order matters" foot="Table lookup: numerator df (between, K−1) is the first number, denominator df (within, N−K) the second. Swapping them gives a very different critical value (teacher's F(2,6)=5.14 vs F(6,2)=19.33).">
      <Controls>
        <Slider label="df1 (numerator = K − 1)" value={d1} onChange={setD1} min={1} max={20} step={1} />
        <Slider label="df2 (denominator = N − K)" value={d2} onChange={setD2} min={1} max={60} step={1} />
        <Slider label="Observed F" value={F} onChange={setF} min={0} max={12} step={0.01} fmt={(v) => v.toFixed(2)} />
        <div>
          <div style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 4 }}>Significance level α</div>
          <Seg options={[{ value: 0.1, label: '0.10' }, { value: 0.05, label: '0.05' }, { value: 0.01, label: '0.01' }]} value={alpha} onChange={setAlpha} label="alpha" />
        </div>
      </Controls>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '4px 0 6px' }}>
        <Btn kind="primary" onClick={swap}>Swap df1 and df2</Btn>
        <Btn kind="ghost" onClick={() => { setD1(2); setD2(6); setF(3.77); setGhost(false); setAlpha(0.05); }}>Teacher's example (2, 6)</Btn>
        <Btn kind="ghost" onClick={() => setGhost(!ghost)}>{ghost ? 'Hide' : 'Show'} swapped curve</Btn>
      </div>
      <Plot xDomain={[0, xmax]} yDomain={[0, yTop]} xLabel="F value" yLabel="density" ariaLabel="F density with rejection region" yFmt={(v) => v.toFixed(2)}>
        {({ x, y, ih, iw }) => {
          const ghostPts = pts.map((v) => [x(v), y(fPdf(v, d2, d1))]);
          return (
            <g>
              <clipPath id="fd-clip"><rect x={0} y={0} width={iw} height={ih} /></clipPath>
              <g clipPath="url(#fd-clip)">
                {ghost && <path d={linePath(ghostPts)} fill="none" stroke="var(--c5)" strokeWidth="2" strokeDasharray="5 4" opacity="0.8" />}
                {tail.length > 1 && <path d={areaPath(tail.map((v) => [x(v), y(fPdf(v, d1, d2))]), y(0))} fill="var(--c2)" opacity="0.35" />}
                <path d={linePath(pts.map((v) => [x(v), y(fPdf(v, d1, d2))]))} fill="none" stroke="var(--c1)" strokeWidth={flash ? 4 : 2.6} />
              </g>
              {crit < xmax && <g><line x1={x(crit)} x2={x(crit)} y1={ih} y2={0} stroke="var(--c2)" strokeWidth="2" /><text x={Math.min(x(crit) + 5, iw - 90)} y={14} className="lbl-sm" fill="var(--c2)">critical {f(crit, 3)}</text></g>}
              {ghost && critSwap < xmax && <line x1={x(critSwap)} x2={x(critSwap)} y1={ih} y2={30} stroke="var(--c5)" strokeDasharray="4 3" />}
              {F <= xmax && <g><line x1={x(F)} x2={x(F)} y1={ih} y2={34} stroke="var(--c4)" strokeWidth="2.5" /><circle cx={x(F)} cy={34} r="5" fill="var(--c4)" /><text x={Math.min(x(F) + 7, iw - 70)} y={52} className="lbl-sm" fill="var(--c4)">F = {f(F, 2)}</text></g>}
            </g>
          );
        }}
      </Plot>
      <Readouts>
        <Readout label={`F crit (${d1}, ${d2})`} value={f(crit, 3)} />
        <Readout label={`if swapped (${d2}, ${d1})`} value={f(critSwap, 3)} tone="warn" />
        <Readout label="p-value" value={p < 0.0001 ? '< 0.0001' : f(p, 4)} tone={reject ? 'bad' : 'good'} />
        <Readout label="decision" value={reject ? 'Reject H0' : 'Fail to reject H0'} tone={reject ? 'bad' : 'good'} />
      </Readouts>
      {crit >= xmax && <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '6px 0 0' }}>The critical value is beyond the right edge of the plot.</p>}
    </Card>
  );
}
