import React, { useEffect, useState } from 'react';
import { Card, Controls, Slider, Seg, Btn, Readouts, Readout, f } from '../kit/controls.jsx';
import { Plot, linePath, areaPath } from '../kit/plot.jsx';
import { chi2Pdf, chi2Cdf, chi2Critical } from '../lib/stats.js';

const reduced = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ChiSquareShape({ df: df0 = 3, alpha: a0 = 0.05, stat: s0 = 7 }) {
  const [df, setDf] = useState(df0);
  const [alpha, setAlpha] = useState(a0);
  const [stat, setStat] = useState(s0);
  const [play, setPlay] = useState(false);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    if (!play || reduced()) return undefined;
    const id = setInterval(() => {
      setDf((d) => {
        let n = d + dir;
        if (n >= 20) { setDir(-1); n = 20; }
        if (n <= 1) { setDir(1); n = 1; }
        return n;
      });
    }, 650);
    return () => clearInterval(id);
  }, [play, dir]);

  const crit = chi2Critical(alpha, df);
  const p = 1 - chi2Cdf(stat, df);
  const xmax = Math.max(14, df + 4 * Math.sqrt(2 * df) + 2);
  const N = 160;
  const pts = Array.from({ length: N + 1 }, (_, i) => Math.max(0.03, (i / N) * xmax));
  const ymax = Math.max(...pts.filter((v) => v > 0.2 || df > 2).map((v) => chi2Pdf(v, df))) * 1.12;
  const yTop = Math.min(ymax, 0.6);
  const reject = stat > crit;
  const tail = pts.filter((v) => v >= crit);

  return (
    <Card title="Chi-square curve and rejection region" foot="Right tail only: reject H0 when the statistic lands beyond the critical value (equivalently p < α). The curve has mean = df, so bigger df shifts everything right.">
      <Controls>
        <Slider label="Degrees of freedom (df)" value={df} onChange={setDf} min={1} max={20} step={1} />
        <Slider label="Observed χ² statistic" value={stat} onChange={setStat} min={0} max={40} step={0.1} fmt={(v) => v.toFixed(1)} />
        <div>
          <div style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 4 }}>Significance level α</div>
          <Seg options={[{ value: 0.1, label: '0.10' }, { value: 0.05, label: '0.05' }, { value: 0.01, label: '0.01' }]} value={alpha} onChange={setAlpha} label="alpha" />
        </div>
        <div><Btn kind="ghost" onClick={() => setPlay(!play)}>{play ? 'Pause df sweep' : 'Play: sweep df 1 to 20'}</Btn></div>
      </Controls>
      <Plot xDomain={[0, xmax]} yDomain={[0, yTop]} xLabel="χ² value" yLabel="density" ariaLabel="chi-square density with rejection region" yFmt={(v) => v.toFixed(2)}>
        {({ x, y, ih, iw }) => (
          <g>
            <clipPath id="csq-clip"><rect x={0} y={0} width={iw} height={ih} /></clipPath>
            <g clipPath="url(#csq-clip)">
              {tail.length > 1 && <path d={areaPath(tail.map((v) => [x(v), y(chi2Pdf(v, df))]), y(0))} fill="var(--c2)" opacity="0.35" />}
              <path d={linePath(pts.map((v) => [x(v), y(chi2Pdf(v, df))]))} fill="none" stroke="var(--c1)" strokeWidth="2.6" />
            </g>
            <line x1={x(df)} x2={x(df)} y1={ih} y2={0} stroke="var(--muted)" strokeDasharray="3 4" />
            <text x={x(df) + 4} y={12} className="lbl-sm" fill="var(--muted)">mean = df</text>
            {crit < xmax && <g><line x1={x(crit)} x2={x(crit)} y1={ih} y2={0} stroke="var(--c2)" strokeWidth="2" /><text x={Math.min(x(crit) + 5, iw - 70)} y={28} className="lbl-sm" fill="var(--c2)">critical {f(crit, 3)}</text></g>}
            {stat <= xmax && <g style={{ transition: 'transform .2s' }}><line x1={x(stat)} x2={x(stat)} y1={ih} y2={20} stroke="var(--c4)" strokeWidth="2.5" /><circle cx={x(stat)} cy={20} r="5" fill="var(--c4)" /><text x={Math.min(x(stat) + 7, iw - 60)} y={44} className="lbl-sm" fill="var(--c4)">observed {f(stat, 1)}</text></g>}
          </g>
        )}
      </Plot>
      <Readouts>
        <Readout label="critical value" value={f(chi2Critical(alpha, df), 3)} />
        <Readout label="p-value" value={p < 0.0001 ? '< 0.0001' : f(p, 4)} tone={reject ? 'bad' : 'good'} />
        <Readout label="decision" value={reject ? 'Reject H0' : 'Fail to reject H0'} tone={reject ? 'bad' : 'good'} />
        <Readout label="mean / variance" value={`${df} / ${2 * df}`} />
      </Readouts>
    </Card>
  );
}
