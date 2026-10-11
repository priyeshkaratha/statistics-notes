import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Btn, Seg, Slider, Readouts, Readout, f } from '../kit/controls.jsx';
import { oneWayAnova, fCritical, seededRandom, randNormal, mean, sampleSD } from '../lib/stats.js';

const reduced = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const NAMES = ['A', 'B', 'C'];
const COLS = ['var(--c1)', 'var(--c3)', 'var(--c5)'];

const stdNoise = (seed, n) => {
  const rng = seededRandom(seed), raw = Array.from({ length: n }, () => randNormal(rng));
  const m = mean(raw), sd = sampleSD(raw);
  return raw.map((v) => (v - m) / sd);
};
const around = (g) => { const m = mean(g); return g.map((v) => v - m); };

const PRESETS = {
  teacher: { label: "Teacher's A, B, C", dom: [0, 12], mu: [6, 23 / 3, 5], dev: [around([5, 7, 6]), around([8, 9, 6]), around([6, 5, 4])] },
  null: { label: 'Small differences (H0 plausible)', dom: [30, 80], mu: [54, 55.5, 56.5], dev: [0, 1, 2].map((i) => stdNoise(11 + i, 8).map((v) => v * 6)) },
  diff: { label: 'Clear difference', dom: [30, 80], mu: [44, 52, 62], dev: [0, 1, 2].map((i) => stdNoise(21 + i, 8).map((v) => v * 6)) },
};

export default function AnovaVariation({ preset = 'diff' }) {
  const [key, setKey] = useState(PRESETS[preset] ? preset : 'diff');
  const P = PRESETS[key];
  const [mu, setMu] = useState([...P.mu]);
  const [noise, setNoise] = useState(1);
  const [show, setShow] = useState('both');
  const [drag, setDrag] = useState(null);
  const [play, setPlay] = useState(false);
  const dirRef = useRef(1);
  const svgRef = useRef(null);

  const load = (k) => { setKey(k); setMu([...PRESETS[k].mu]); setNoise(1); setPlay(false); };
  const [lo, hi] = P.dom;

  useEffect(() => {
    if (!play || reduced()) return undefined;
    const step = (hi - lo) / 90;
    const id = setInterval(() => {
      setMu((m) => {
        let v = m[2] + dirRef.current * step;
        if (v > hi - (hi - lo) * 0.08) dirRef.current = -1;
        if (v < lo + (hi - lo) * 0.08) dirRef.current = 1;
        v = Math.max(lo + (hi - lo) * 0.05, Math.min(hi - (hi - lo) * 0.05, v));
        return [m[0], m[1], v];
      });
    }, 45);
    return () => clearInterval(id);
  }, [play, lo, hi]);

  const groups = useMemo(() => P.dev.map((d, g) => d.map((v) => mu[g] + v * noise)), [P, mu, noise]);
  const A = oneWayAnova(groups);
  const crit = fCritical(0.05, A.dfb, A.dfw);
  const reject = A.F > crit;

  const W = 640, H = 290, m = { l: 52, r: 16, t: 14, b: 34 };
  const iw = W - m.l - m.r;
  const X = (v) => ((v - lo) / (hi - lo)) * iw;
  const rowY = (g) => 50 + g * 78;
  const valAt = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return lo + (((e.clientX - r.left) * (W / r.width) - m.l) / iw) * (hi - lo);
  };
  const down = (g) => (e) => { e.currentTarget.setPointerCapture(e.pointerId); setPlay(false); setDrag({ g, off: valAt(e) - mu[g] }); };
  const move = (e) => { if (drag) setMu((old) => old.map((v, i) => (i === drag.g ? Math.max(lo, Math.min(hi, valAt(e) - drag.off)) : v))); };
  const ticksX = Array.from({ length: 7 }, (_, i) => lo + ((hi - lo) * i) / 6);
  const share = A.sst > 0 ? A.ssb / A.sst : 0;

  return (
    <Card title="Between-group vs within-group variation" foot="F = (spread of the group means) / (spread inside the groups). Drag a group sideways to raise the signal, or add noise to bury it.">
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 6 }}>
        {Object.entries(PRESETS).map(([k, p]) => <Btn key={k} kind={k === key ? 'primary' : 'ghost'} onClick={() => load(k)}>{p.label}</Btn>)}
        <Btn kind="ghost" onClick={() => setPlay(!play)}>{play ? 'Stop sliding' : 'Animate: slide group C'}</Btn>
      </div>
      <div className="controls">
        <Slider label="Within-group noise (× original spread)" value={noise} onChange={setNoise} min={0.2} max={3} step={0.05} fmt={(v) => `×${v.toFixed(2)}`} />
        <div><div style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 4 }}>Show</div><Seg options={[{ value: 'between', label: 'Between' }, { value: 'within', label: 'Within' }, { value: 'both', label: 'Both' }]} value={show} onChange={setShow} label="show" /></div>
      </div>
      <svg ref={svgRef} className="plot" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Dot strips for three groups with group means and grand mean" onPointerMove={move} onPointerUp={() => setDrag(null)} onPointerCancel={() => setDrag(null)}>
        <g transform={`translate(${m.l},${m.t})`}>
          {ticksX.map((t) => <g key={t}><line x1={X(t)} x2={X(t)} y1={0} y2={H - m.t - m.b} className="grid" /><text x={X(t)} y={H - m.t - m.b + 16} textAnchor="middle" className="tick">{f(t, 1)}</text></g>)}
          <line x1={X(A.grand)} x2={X(A.grand)} y1={0} y2={H - m.t - m.b} stroke="var(--ink)" strokeDasharray="5 4" strokeWidth="1.8" style={{ transition: 'all .12s' }} />
          <text x={X(A.grand) + 4} y={10} className="lbl-sm">grand mean {f(A.grand, 2)}</text>
          {groups.map((g, gi) => {
            const y0 = rowY(gi), gm = A.groupMeans[gi];
            return (
              <g key={gi}>
                <rect x={0} y={y0 - 34} width={iw} height={68} rx="10" fill="var(--surface2)" opacity="0.55" style={{ cursor: 'ew-resize', touchAction: 'none' }} onPointerDown={down(gi)} />
                <text x={-10} y={y0 + 5} textAnchor="end" className="lbl" fill={COLS[gi]}>{NAMES[gi]}</text>
                {(show === 'within' || show === 'both') && g.map((v, i) => <line key={`w${i}`} x1={X(v)} x2={X(gm)} y1={y0 + ((i % 4) - 1.5) * 9} y2={y0 + ((i % 4) - 1.5) * 9} stroke={COLS[gi]} strokeWidth="1.4" opacity="0.55" pointerEvents="none" />)}
                {(show === 'between' || show === 'both') && <line x1={X(A.grand)} x2={X(gm)} y1={y0 + 26} y2={y0 + 26} stroke="var(--c2)" strokeWidth="5" strokeLinecap="round" pointerEvents="none" />}
                {g.map((v, i) => <circle key={i} cx={X(v)} cy={y0 + ((i % 4) - 1.5) * 9} r="5.2" fill={COLS[gi]} stroke="var(--surface)" strokeWidth="1.2" pointerEvents="none" style={{ transition: drag ? 'none' : 'cx .2s' }} />)}
                <line x1={X(gm)} x2={X(gm)} y1={y0 - 30} y2={y0 + 30} stroke={COLS[gi]} strokeWidth="3.4" pointerEvents="none" />
                <text x={X(gm)} y={y0 - 34} textAnchor="middle" className="lbl-sm" fill={COLS[gi]} pointerEvents="none">x̄{NAMES[gi]} = {f(gm, 2)}</text>
              </g>
            );
          })}
        </g>
      </svg>
      <div title="share of total variation that is between groups" style={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden', margin: '4px 0 2px', border: '1px solid var(--line)' }}>
        <div style={{ width: `${share * 100}%`, background: 'var(--c2)', transition: 'width .2s' }} />
        <div style={{ flex: 1, background: 'var(--c1)', opacity: 0.45 }} />
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}><span>red = SSB (between) {f(share * 100, 0)}% of SST</span><span>blue = SSW (within)</span></div>
      <Readouts>
        <Readout label="SSB" value={f(A.ssb, 2)} />
        <Readout label="SSW" value={f(A.ssw, 2)} />
        <Readout label={`MSB (df ${A.dfb})`} value={f(A.msb, 3)} />
        <Readout label={`MSW (df ${A.dfw})`} value={f(A.msw, 3)} />
        <Readout label="F = MSB/MSW" value={f(A.F, 3)} tone={reject ? 'bad' : 'good'} />
        <Readout label={`F crit (${A.dfb}, ${A.dfw})`} value={f(crit, 3)} />
        <Readout label="p-value" value={A.p < 0.0001 ? '< 0.0001' : f(A.p, 4)} />
        <Readout label="at α = 0.05" value={reject ? 'Reject H0' : 'Fail to reject H0'} tone={reject ? 'bad' : 'good'} />
      </Readouts>
    </Card>
  );
}
