import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, Controls, Slider, Seg, Btn, Readouts, Readout, f } from '../kit/controls.jsx';
import { Plot, linePath, areaPath } from '../kit/plot.jsx';
import { normPdf, mean, sampleSD, seededRandom, randNormal } from '../lib/stats.js';

// Each population: sampler, exact pdf, exact mean and sd, plotting domain.
const POPS = {
  uniform: { label: 'Uniform', mu: 0.5, sd: Math.sqrt(1 / 12), dom: [0, 1], pdf: (v) => (v >= 0 && v <= 1 ? 1 : 0), draw: (r) => r() },
  skewed: { label: 'Skewed (exp)', mu: 1, sd: 1, dom: [0, 5], pdf: (v) => (v >= 0 ? Math.exp(-v) : 0), draw: (r) => -Math.log(1 - r()) },
  bimodal: {
    label: 'Bimodal', mu: 0.5, sd: Math.sqrt(0.06 ** 2 + 0.25 ** 2), dom: [0, 1],
    pdf: (v) => 0.5 * normPdf(v, 0.25, 0.06) + 0.5 * normPdf(v, 0.75, 0.06),
    draw: (r) => (r() < 0.5 ? randNormal(r, 0.25, 0.06) : randNormal(r, 0.75, 0.06)),
  },
  normal: { label: 'Normal', mu: 0.5, sd: 0.15, dom: [0, 1], pdf: (v) => normPdf(v, 0.5, 0.15), draw: (r) => randNormal(r, 0.5, 0.15) },
};
const BINS = 36;
const MAXK = 5000;

function makeMeans(pop, n, rng, k) {
  const out = [];
  let last = null;
  for (let i = 0; i < k; i++) {
    const xs = Array.from({ length: n }, () => pop.draw(rng));
    out.push(mean(xs));
    last = xs;
  }
  return { out, last };
}

export default function CLTSimulator() {
  const [shape, setShape] = useState('skewed');
  const [n, setN] = useState(5);
  const [seed, setSeed] = useState(7);
  const rng = useRef(null);
  const timer = useRef(null);
  const [state, setState] = useState(() => {
    const r = seededRandom(7 * 1009 + 5 * 31 + 1);
    rng.current = r;
    const { out, last } = makeMeans(POPS.skewed, 5, r, 200);
    return { means: out, last, lastMean: out[out.length - 1] };
  });
  const [busy, setBusy] = useState(false);
  const pop = POPS[shape];

  const stop = () => { if (timer.current) { clearInterval(timer.current); timer.current = null; } setBusy(false); };
  const reset = (key, nn, sd) => {
    stop();
    rng.current = seededRandom(sd * 1009 + nn * 31 + Object.keys(POPS).indexOf(key) + 1);
    const { out, last } = makeMeans(POPS[key], nn, rng.current, 200);
    setState({ means: out, last, lastMean: out[out.length - 1] });
  };
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const addMeans = (k) => setState((s) => {
    const { out, last } = makeMeans(pop, n, rng.current, k);
    return { means: s.means.concat(out).slice(-MAXK), last, lastMean: out[out.length - 1] };
  });
  const draw = (k) => {
    stop();
    if (k === 1) { addMeans(1); return; }
    setBusy(true);
    const per = Math.ceil(k / 25);
    let done = 0;
    timer.current = setInterval(() => {
      const step = Math.min(per, k - done);
      addMeans(step);
      done += step;
      if (done >= k) stop();
    }, 40);
  };

  const se = pop.sd / Math.sqrt(n);
  const dom = useMemo(() => [Math.max(pop.dom[0], pop.mu - 4.2 * se), Math.min(pop.dom[1], pop.mu + 4.8 * se)], [pop, se]);
  const hist = useMemo(() => {
    const w = (dom[1] - dom[0]) / BINS, c = new Array(BINS).fill(0);
    let tot = 0;
    state.means.forEach((m) => { const b = Math.floor((m - dom[0]) / w); if (b >= 0 && b < BINS) { c[b]++; tot++; } });
    return { w, dens: c.map((v) => (tot ? v / (state.means.length * w) : 0)) };
  }, [state.means, dom]);

  const gridX = (lo, hi, k = 120) => Array.from({ length: k + 1 }, (_, i) => lo + ((hi - lo) * i) / k);
  const popY = Math.max(...gridX(...pop.dom).map(pop.pdf)) * 1.12;
  const theoPeak = normPdf(pop.mu, pop.mu, se);
  const yMax = Math.max(theoPeak, ...hist.dens) * 1.12;
  const mMean = mean(state.means), mSD = state.means.length > 1 ? sampleSD(state.means) : NaN;
  const sdOk = Math.abs(mSD - se) / se < 0.1;

  return (
    <Card title="Central Limit Theorem simulator" foot="Whatever the population looks like, the histogram of sample means **becomes bell-shaped** around $\mu$ with spread $\sigma/\sqrt{n}$ as $n$ grows.">
      <Controls>
        <Seg label="Population shape" options={Object.keys(POPS).map((k) => ({ value: k, label: POPS[k].label }))} value={shape} onChange={(v) => { setShape(v); reset(v, n, seed); }} />
        <Slider label="Sample size n" value={n} onChange={(v) => { setN(v); reset(shape, v, seed); }} min={1} max={100} step={1} />
      </Controls>
      <div style={{ fontSize: 12, color: 'var(--muted)', margin: '8px 0 -2px' }}>Population (one draw of n values shown as ticks)</div>
      <Plot h={130} m={{ t: 8, r: 16, b: 26, l: 44 }} xDomain={pop.dom} yDomain={[0, popY]} yTicks={[]} ariaLabel="population distribution">
        {({ x, y, ih }) => (
          <g>
            <path d={areaPath(gridX(...pop.dom).map((v) => [x(v), y(pop.pdf(v))]), ih)} fill="var(--c4)" opacity="0.28" />
            <path d={linePath(gridX(...pop.dom).map((v) => [x(v), y(pop.pdf(v))]))} fill="none" stroke="var(--c4)" strokeWidth="2" />
            {state.last && state.last.slice(0, 100).map((v, i) => <line key={i} x1={x(Math.min(pop.dom[1], Math.max(pop.dom[0], v)))} x2={x(Math.min(pop.dom[1], Math.max(pop.dom[0], v)))} y1={ih} y2={ih - 14} stroke="var(--c1)" strokeWidth="1.5" opacity="0.7" />)}
            <line x1={x(pop.mu)} x2={x(pop.mu)} y1={0} y2={ih} stroke="var(--ink)" strokeDasharray="4 3" />
            <text x={x(pop.mu) + 5} y={12} className="lbl-sm">μ = {f(pop.mu, 2)}</text>
          </g>
        )}
      </Plot>
      <div style={{ fontSize: 12, color: 'var(--muted)', margin: '2px 0 -2px' }}>Distribution of the sample mean x̄ ({state.means.length} samples of size {n})</div>
      <Plot h={230} xDomain={dom} yDomain={[0, yMax]} yTicks={[]} xFmt={(v) => f(v, 2)} xLabel="sample mean x̄" ariaLabel="histogram of sample means">
        {({ x, y, ih }) => (
          <g>
            {hist.dens.map((d, i) => <rect key={i} x={x(dom[0] + i * hist.w) + 0.5} width={Math.max(0, x(dom[0] + hist.w) - x(dom[0]) - 1)} y={y(d)} height={ih - y(d)} fill="var(--c1)" opacity="0.65" />)}
            <path d={linePath(gridX(dom[0], dom[1]).map((v) => [x(v), y(normPdf(v, pop.mu, se))]))} fill="none" stroke="var(--c2)" strokeWidth="2.5" />
            <line x1={x(pop.mu)} x2={x(pop.mu)} y1={0} y2={ih} stroke="var(--ink)" strokeDasharray="4 3" />
            {state.lastMean >= dom[0] && state.lastMean <= dom[1] && <g><circle cx={x(state.lastMean)} cy={ih - 6} r="6" fill="var(--c3)" stroke="var(--surface)" strokeWidth="2" /><text x={x(state.lastMean)} y={ih - 16} textAnchor="middle" className="lbl-sm">latest x̄</text></g>}
            <text x={6} y={14} className="lbl-sm" fill="var(--c2)">red curve: N(μ, σ/√n)</text>
          </g>
        )}
      </Plot>
      <Controls>
        <Btn kind="primary" onClick={() => draw(1)}>Draw 1 sample</Btn>
        <Btn onClick={() => draw(100)} disabled={busy}>Draw 100</Btn>
        <Btn onClick={() => draw(1000)} disabled={busy}>Draw 1000</Btn>
        <Btn kind="ghost" onClick={() => { const s = seed + 1; setSeed(s); reset(shape, n, s); }}>Reset / new seed</Btn>
      </Controls>
      <Readouts>
        <Readout label="Mean of the x̄'s" value={f(mMean, 3)} tone={Math.abs(mMean - pop.mu) / se < 0.3 ? 'good' : ''} />
        <Readout label="Theory μ" value={f(pop.mu, 3)} />
        <Readout label="SD of the x̄'s" value={f(mSD, 3)} tone={sdOk ? 'good' : 'warn'} />
        <Readout label="Theory σ/√n" value={f(se, 3)} />
      </Readouts>
    </Card>
  );
}
