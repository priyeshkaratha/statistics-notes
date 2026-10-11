import React, { useState, useEffect, useMemo } from 'react';
import { Card, Slider, Seg, Btn, Readouts, Readout, Controls, f } from '../kit/controls.jsx';
import { Plot } from '../kit/plot.jsx';
import { poisPmf, binomPmf, seededRandom } from '../lib/stats.js';

const reduced = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DUR = 4000;

export default function PoissonExplorer({ lambda: l0 = 4 }) {
  const [lam, setLam] = useState(l0);
  const [k, setK] = useState(3);
  const [mode, setMode] = useState('eq');
  const [over, setOver] = useState(false);
  const [nb, setNb] = useState(20);
  const [seed, setSeed] = useState(1);
  const [tt, setTt] = useState(1);
  const [playing, setPlaying] = useState(false);

  const xmax = Math.min(45, Math.ceil(lam + 4 * Math.sqrt(lam) + 3));
  const n = Math.max(nb, Math.ceil(lam) + 1), pb = lam / n;
  const pmf = useMemo(() => Array.from({ length: xmax + 1 }, (_, i) => poisPmf(i, lam)), [lam, xmax]);
  const bin = useMemo(() => Array.from({ length: xmax + 1 }, (_, i) => binomPmf(i, n, pb)), [n, pb, xmax]);
  const kk = Math.min(k, xmax);
  const inSel = (i) => (mode === 'eq' ? i === kk : mode === 'le' ? i <= kk : i >= kk);
  const prob = mode === 'ge' ? 1 - pmf.slice(0, kk).reduce((s, v) => s + v, 0) : pmf.reduce((s, v, i) => s + (inSel(i) ? v : 0), 0);
  const probB = mode === 'ge' ? 1 - bin.slice(0, kk).reduce((s, v) => s + v, 0) : bin.reduce((s, v, i) => s + (inSel(i) ? v : 0), 0);
  const gap = Math.max(...pmf.map((v, i) => Math.abs(v - bin[i])));
  const label = mode === 'eq' ? `P(X = ${kk})` : mode === 'le' ? `P(X ≤ ${kk})` : `P(X ≥ ${kk})`;

  const events = useMemo(() => { const r = seededRandom(seed * 7919 + Math.round(lam * 10)); const a = []; let t = 0; for (let i = 0; i < 200; i++) { t += -Math.log(1 - r()) / lam; if (t > 1) break; a.push(t); } return a; }, [seed, lam]);
  useEffect(() => { setTt(1); setPlaying(false); }, [lam, seed]);
  useEffect(() => {
    if (!playing) return undefined;
    const t0 = performance.now(); let raf;
    const step = (now) => { const v = Math.min(1, (now - t0) / DUR); setTt(v); if (v < 1) raf = requestAnimationFrame(step); else setPlaying(false); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing]);
  const play = () => { if (reduced()) { setTt(1); return; } setTt(0); setPlaying(true); };
  const count = events.filter((e) => e <= tt).length;
  const ymax = Math.max(...pmf, ...(over ? bin : [0])) * 1.2;

  return (
    <Card title="Poisson explorer: Poisson(λ)" foot="Poisson: mean = variance = $\\lambda$. When $n$ is large and $p$ small, Bin($n,p$) ≈ Poisson($\\lambda=np$): push n up and watch the purple dots land on the bars.">
      <Controls>
        <Slider label="λ (average events per interval)" value={lam} onChange={setLam} min={0.2} max={20} step={0.1} fmt={(v) => f(v, 1)} />
        <Seg label="shade" value={mode} onChange={setMode} options={[{ value: 'eq', label: 'X = k' }, { value: 'le', label: 'X ≤ k' }, { value: 'ge', label: 'X ≥ k' }]} />
        <Slider label="k" value={kk} onChange={setK} min={0} max={xmax} />
      </Controls>
      <Plot xDomain={[-0.5, xmax + 0.5]} yDomain={[0, ymax]} xLabel="number of events x" yLabel="P(X = x)" yFmt={(v) => f(v, 2)} ariaLabel="poisson probability bars">
        {({ x, y, ih }) => {
          const bw = Math.max(2, (x(1) - x(0)) * 0.8);
          return (
            <g>
              {pmf.map((v, i) => <rect key={i} x={x(i) - bw / 2} width={bw} y={y(v)} height={ih - y(v)} style={{ y: y(v), height: ih - y(v), transition: 'y .35s ease, height .35s ease' }} fill={inSel(i) ? 'var(--c2)' : 'var(--c1)'} opacity={inSel(i) ? 1 : 0.4} rx="1.5" />)}
              {over && <g>
                <path d={bin.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join('')} fill="none" stroke="var(--c5)" strokeWidth="1.5" opacity="0.7" />
                {bin.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3.6" fill="var(--c5)" stroke="var(--surface)" strokeWidth="1" />)}
              </g>}
              <line x1={x(lam)} x2={x(lam)} y1={0} y2={ih} stroke="var(--c4)" strokeWidth="2" strokeDasharray="5 4" />
              <text x={x(lam) + 5} y={12} className="lbl" fill="var(--c4)">λ = {f(lam, 1)}</text>
            </g>
          );
        }}
      </Plot>
      <Readouts>
        <Readout label={label + ' (Poisson)'} value={f(prob, 4)} tone="good" />
        {over && <Readout label={'Binomial n=' + n + ', p=' + f(pb, 4)} value={f(probB, 4)} tone="warn" />}
        {over && <Readout label="largest bar gap" value={f(gap, 4)} />}
        <Readout label="mean = variance" value={f(lam, 1)} />
      </Readouts>
      <Controls>
        <Btn kind={over ? 'primary' : ''} onClick={() => setOver(!over)} aria-pressed={over}>{over ? 'Hide' : 'Overlay'} binomial approximation</Btn>
        {over && <Slider label="n (p = λ/n)" value={nb} onChange={setNb} min={Math.max(2, Math.ceil(lam) + 1)} max={500} />}
      </Controls>
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Btn kind="primary" onClick={play}>{playing ? 'Playing…' : 'Play one interval'}</Btn>
          <Btn onClick={() => setSeed((s) => s + 1)}>New random interval</Btn>
          <span style={{ fontSize: 14, color: 'var(--ink2)' }}>Events so far: <b className="mono">{count}</b> {tt >= 1 && <b style={{ color: 'var(--c3)' }}>→ X = {events.length} this interval</b>}</span>
        </div>
        <svg className="plot" viewBox="0 0 640 64" role="img" aria-label="events arriving on a timeline" style={{ marginTop: 6 }}>
          <line x1="20" x2="620" y1="36" y2="36" stroke="var(--muted)" strokeWidth="2" />
          {[0, 0.25, 0.5, 0.75, 1].map((t) => <g key={t}><line x1={20 + 600 * t} x2={20 + 600 * t} y1="32" y2="40" stroke="var(--muted)" /><text x={20 + 600 * t} y="58" textAnchor="middle" className="tick">{t === 0 ? 'start' : t === 1 ? 'end' : ''}</text></g>)}
          {events.map((e, i) => e <= tt && <circle key={i} cx={20 + 600 * e} cy="36" r="6" fill="var(--c2)" stroke="var(--surface)" strokeWidth="1.5" />)}
          <line x1={20 + 600 * tt} x2={20 + 600 * tt} y1="10" y2="52" stroke="var(--c1)" strokeWidth="2" />
        </svg>
      </div>
    </Card>
  );
}
