import React, { useState, useEffect, useMemo } from 'react';
import { Card, Slider, Seg, Btn, Controls, Readouts, Readout, f } from '../kit/controls.jsx';
import { seededRandom } from '../lib/stats.js';

const N = 1000, COLS = 40, PITCH = 13.5, X0 = 20, Y0 = 18;
const STAGES = [{ value: 0, label: '1  Everyone' }, { value: 1, label: '2  Who is ill' }, { value: 2, label: '3  Test results' }];
const COL = { TP: 'var(--c2)', FN: 'var(--c5)', FP: 'var(--c4)', TN: 'var(--c3)', pop: 'var(--muted)' };
const PRESETS = [
  { label: 'Rare disease', p: 1, s: 95, fp: 5 },
  { label: 'Fairly common', p: 20, s: 95, fp: 5 },
  { label: 'Very accurate test', p: 1, s: 99, fp: 1 },
];

export default function BayesFrequencies() {
  const [prev, setPrev] = useState(2), [sens, setSens] = useState(90), [fpr, setFpr] = useState(10);
  const [stage, setStage] = useState(0), [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => setStage((s) => { if (s >= 2) { setPlaying(false); return 2; } return s + 1; }), 1700);
    return () => clearInterval(id);
  }, [playing]);

  const perm = useMemo(() => { // seeded shuffle so ill dots look scattered in the "everyone" crowd
    const r = seededRandom(7), a = Array.from({ length: N }, (_, i) => i);
    for (let i = N - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }, []);

  const p = prev / 100, se = sens / 100, fa = fpr / 100;
  const sick = Math.round(N * p), TP = Math.round(sick * se), FN = sick - TP;
  const healthy = N - sick, FP = Math.round(healthy * fa), TN = healthy - FP;
  const eTP = N * p * se, eFP = N * (1 - p) * fa;                 // expected (unrounded) counts
  const post = p * se + (1 - p) * fa > 0 ? (p * se) / (p * se + (1 - p) * fa) : 0; // exact Bayes
  const kinds = useMemo(() => Array.from({ length: N }, (_, i) => (i < TP ? 'TP' : i < TP + FN ? 'FN' : i < TP + FN + FP ? 'FP' : 'TN')), [TP, FN, FP]);

  // target positions for the "sorted" stage-3 layout: 2x2 clusters (positives on top)
  const sorted = useMemo(() => {
    const pos = {}, cl = Math.min(20, Math.max(8, Math.ceil(Math.max(TP, FN) / 10))), leftW = cl * PITCH, rightX = X0 + leftW + 22;
    const cr = Math.max(8, Math.floor((COLS * PITCH - leftW - 22) / PITCH));
    const place = (kind, n, x0, y0, cols) => { for (let k = 0; k < n; k++) pos[kind + k] = [x0 + (k % cols) * PITCH, y0 + Math.floor(k / cols) * PITCH]; };
    const posRows = Math.max(Math.ceil(TP / cl), Math.ceil(FP / cr), 1);
    const y1 = Y0 + 24 + posRows * PITCH + 34;
    place('TP', TP, X0, Y0 + 24, cl); place('FP', FP, rightX, Y0 + 24, cr);
    place('FN', FN, X0, y1, cl); place('TN', TN, rightX, y1, cr);
    return { pos, y1, rightX, bottom: y1 + Math.ceil(Math.max(TN / cr, FN / cl)) * PITCH };
  }, [TP, FN, FP, TN]);

  const cnt = { TP: 0, FN: 0, FP: 0, TN: 0 };
  const dots = kinds.map((k, i) => {
    const g = perm[i], mixed = [X0 + (g % COLS) * PITCH, Y0 + Math.floor(g / COLS) * PITCH];
    const sp = sorted.pos[k + cnt[k]++] || mixed;
    const [x, y] = stage === 2 ? sp : mixed;
    const fill = stage === 0 ? COL.pop : stage === 1 ? (k === 'TP' || k === 'FN' ? COL.TP : COL.TN) : COL[k];
    return <circle key={i} cx="0" cy="0" r="4.4" fill={fill} style={{ transform: `translate(${x}px,${y}px)`, transition: `transform .9s cubic-bezier(.3,.7,.2,1) ${(i % 25) * 14}ms, fill .5s` }} />;
  });
  const H = stage === 2 ? Math.max(sorted.bottom + 12, 300) : Y0 + 25 * PITCH + 8;
  const shown = stage === 2;

  return (
    <Card title="Bayes with 1000 people" foot="Among people who test **positive**, only **TP / (TP+FP)** are really ill — when the disease is rare, false positives from the large healthy group swamp the true positives.">
      <Controls>
        <Slider label="Prevalence P(ill)" value={prev} onChange={setPrev} min={0.5} max={50} step={0.5} unit="%" />
        <Slider label="Sensitivity P(+ | ill)" value={sens} onChange={setSens} min={50} max={100} step={1} unit="%" />
        <Slider label="False-positive rate P(+ | healthy)" value={fpr} onChange={setFpr} min={0} max={30} step={0.5} unit="%" />
      </Controls>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', margin: '8px 0' }}>
        <Seg options={STAGES} value={stage} onChange={(v) => { setPlaying(false); setStage(v); }} label="Stage" />
        <Btn kind="primary" onClick={() => { setStage(0); setPlaying(true); }}>{playing ? 'Playing…' : 'Play story'}</Btn>
        {PRESETS.map((q) => <Btn key={q.label} kind="ghost" onClick={() => { setPrev(q.p); setSens(q.s); setFpr(q.fp); }}>{q.label}</Btn>)}
      </div>
      <svg className="plot" viewBox={`0 0 ${X0 * 2 + COLS * PITCH} ${H}`} role="img" aria-label="One thousand dots: everyone, then ill people highlighted, then grouped by test result" style={{ transition: 'height .4s' }}>
        {shown && <g className="lbl-sm" fill="var(--muted)">
          <text x={X0} y={Y0 + 12}>Ill and positive (TP) · {TP}</text>
          <text x={sorted.rightX} y={Y0 + 12}>Healthy but positive (FP) · {FP}</text>
          <text x={X0} y={sorted.y1 - 8}>Ill, negative (FN) · {FN}</text>
          <text x={sorted.rightX} y={sorted.y1 - 8}>Healthy, negative (TN) · {TN}</text>
          <line x1={X0} x2={X0 * 2 + COLS * PITCH - 20} y1={sorted.y1 - 22} y2={sorted.y1 - 22} stroke="var(--line)" strokeDasharray="4 4" />
        </g>}
        {dots}
      </svg>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: 'var(--muted)', margin: '2px 0 6px' }}>
        {stage === 0 ? <span>Grey = one person each (1000 total)</span> : stage === 1 ? <><span style={{ color: 'var(--c2)' }}>● ill ({sick})</span><span style={{ color: 'var(--c3)' }}>● healthy ({healthy})</span></> :
          [['TP', 'ill, +'], ['FP', 'healthy, +'], ['FN', 'ill, −'], ['TN', 'healthy, −']].map(([k, t]) => <span key={k} style={{ color: COL[k] }}>● {k}: {t}</span>)}
      </div>
      <Readouts>
        <Readout label="Positives (TP+FP)" value={`${f(eTP, 1)} + ${f(eFP, 1)} = ${f(eTP + eFP, 1)}`} />
        <Readout label="P(ill | positive)" value={`${f(post * 100, 1)}%`} tone={post < 0.5 ? 'warn' : 'good'} />
        <Readout label="= TP/(TP+FP)" value={`${f(eTP, 1)}/${f(eTP + eFP, 1)}`} />
        <Readout label="P(positive)" value={f(p * se + (1 - p) * fa, 4)} />
      </Readouts>
    </Card>
  );
}
