import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Controls, Seg, Slider, Btn, Readouts, Readout, f } from '../kit/controls.jsx';
import { Plot } from '../kit/plot.jsx';
import { mean, sampleSD, sampleVariance, tCdf, tCritical } from '../lib/stats.js';

const BEFORE = [72, 65, 80, 70, 75, 68, 77, 74];
const D = [6, 5, 2, 5, 4, 2, 6, 3]; // after - before (fixed individual improvements)

export default function PairedVsIndependent() {
  const [k, setK] = useState(1);
  const [pairs, setPairs] = useState(true);
  const [play, setPlay] = useState(false);
  const dir = useRef(1);

  useEffect(() => {
    if (!play) return undefined;
    const id = setInterval(() => {
      setK((v) => {
        const nv = v + dir.current * 0.03;
        if (nv >= 2.2) { dir.current = -1; return 2.2; }
        if (nv <= 0.2) { dir.current = 1; return 0.2; }
        return nv;
      });
    }, 40);
    return () => clearInterval(id);
  }, [play]);

  const mb = mean(BEFORE);
  const before = BEFORE.map((b) => mb + k * (b - mb));
  const after = before.map((b, i) => b + D[i]);
  const n = D.length;
  const r = useMemo(() => {
    const dbar = mean(D), sd = sampleSD(D), sed = sd / Math.sqrt(n), tP = dbar / sed, pP = 2 * (1 - tCdf(Math.abs(tP), n - 1));
    const tcP = tCritical(0.05, n - 1);
    const v1 = sampleVariance(after), v2 = sampleVariance(before), sp2 = (v1 + v2) / 2, seI = Math.sqrt(sp2 * 2 / n);
    const diff = mean(after) - mean(before), tI = diff / seI, pI = 2 * (1 - tCdf(Math.abs(tI), 2 * n - 2)), tcI = tCritical(0.05, 2 * n - 2);
    return { dbar, sd, sed, tP, pP, ciP: [dbar - tcP * sed, dbar + tcP * sed], seI, tI, pI, ciI: [diff - tcI * seI, diff + tcI * seI], sdB: sampleSD(before) };
  }, [k]); // eslint-disable-line

  const L = -14, H = 18, cl = (v) => Math.max(L, Math.min(H, v));
  const bars = [['Paired t-test', r.ciP, 'var(--c3)', 0.72], ['Independent t-test (pairing ignored)', r.ciI, 'var(--c2)', 0.28]];

  return (
    <Card title="Same data, two analyses: paired vs independent" foot="Pairing subtracts each person's own baseline, so big differences *between* people stop hiding the change *within* people.">
      <Controls>
        <Slider label="Spread between people (baseline scores)" value={k} onChange={(v) => { setPlay(false); setK(v); }} min={0.2} max={2.2} step={0.05} fmt={(v) => `${f(v, 2)}x`} />
        <div><div className="slider-label">Top chart</div><Seg options={[{ value: true, label: 'Pairs linked' }, { value: false, label: 'Pairing hidden' }]} value={pairs} onChange={setPairs} label="pairs" /></div>
        <div><Btn kind="primary" onClick={() => setPlay((p) => !p)}>{play ? 'Pause' : 'Play sweep'}</Btn></div>
      </Controls>
      <Plot h={250} xDomain={[0.4, 2.6]} yDomain={[48, 102]} xTicks={[1, 2]} xFmt={(v) => (v === 1 ? 'Before' : 'After')} yLabel="score" ariaLabel="Before and after scores for eight employees" m={{ t: 10, r: 20, b: 30, l: 48 }}>
        {({ x, y }) => (
          <g>
            {before.map((b, i) => <line key={i} x1={x(1)} y1={y(b)} x2={x(2)} y2={y(after[i])} stroke="var(--c1)" strokeWidth="2" style={{ opacity: pairs ? 0.7 : 0, transition: 'opacity .4s' }} />)}
            {before.map((b, i) => <circle key={`b${i}`} cx={x(1)} cy={y(b)} r="5.5" fill="var(--c1)" stroke="var(--surface)" strokeWidth="1.2" />)}
            {after.map((a, i) => <circle key={`a${i}`} cx={x(2)} cy={y(a)} r="5.5" fill="var(--c2)" stroke="var(--surface)" strokeWidth="1.2" />)}
            {[[1, mean(before)], [2, mean(after)]].map(([c, m]) => <g key={c}><line x1={x(c) - 26} x2={x(c) + 26} y1={y(m)} y2={y(m)} stroke="var(--ink)" strokeWidth="3" /><text x={x(c) + 32} y={y(m) + 4} className="lbl-sm" fill="var(--ink)">{`mean ${f(m, 1)}`}</text></g>)}
          </g>
        )}
      </Plot>
      <Plot h={130} xDomain={[L, H]} yDomain={[0, 1]} yTicks={[]} grid={false} xLabel="95% CI for the mean improvement" ariaLabel="Confidence intervals for the mean improvement from each analysis" m={{ t: 6, r: 20, b: 34, l: 20 }}>
        {({ x, y }) => (
          <g>
            <line x1={x(0)} x2={x(0)} y1={0} y2={y(0)} stroke="var(--ink)" strokeDasharray="4 3" />
            {bars.map(([lab, ci, col, yy]) => (
              <g key={lab}>
                <rect rx="4" height="14" y={y(yy) - 7} fill={col} fillOpacity="0.4" style={{ x: `${x(cl(ci[0]))}px`, width: `${x(cl(ci[1])) - x(cl(ci[0]))}px`, transition: 'all .25s linear' }} />
                <text x={x(L) + 4} y={y(yy) - 12} className="lbl-sm" fill="var(--ink2)">{lab}</text>
              </g>
            ))}
            <circle cx={x(r.dbar)} cy={y(0.72)} r="5" fill="var(--c3)" /><circle cx={x(r.dbar)} cy={y(0.28)} r="5" fill="var(--c2)" />
          </g>
        )}
      </Plot>
      <Readouts>
        <Readout label="mean change" value={f(r.dbar, 3)} />
        <Readout label="s of baseline" value={f(r.sdB, 2)} />
        <Readout label="paired t (df 7)" value={f(r.tP, 2)} tone={r.pP < 0.05 ? 'good' : 'bad'} />
        <Readout label="paired p" value={f(r.pP, 4)} />
        <Readout label="independent t (df 14)" value={f(r.tI, 2)} tone={r.pI < 0.05 ? 'good' : 'bad'} />
        <Readout label="independent p" value={f(r.pI, 4)} />
      </Readouts>
      <p style={{ fontSize: 13, color: 'var(--ink2)', margin: '10px 0 0' }}>Watch: the paired t never moves because each person's improvement is unchanged. The independent t collapses as people become more different from each other.</p>
    </Card>
  );
}
