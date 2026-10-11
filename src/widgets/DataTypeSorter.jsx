import React, { useMemo, useState } from 'react';
import { Card, Btn, Readouts, Readout } from '../kit/controls.jsx';
import { Rich } from '../kit/rich.jsx';
import { seededRandom } from '../lib/stats.js';

const KINDS = [
  { id: 'nominal', label: 'Nominal', sub: 'categories, no order', color: 'var(--c5)' },
  { id: 'ordinal', label: 'Ordinal', sub: 'categories, ranked', color: 'var(--c4)' },
  { id: 'discrete', label: 'Discrete', sub: 'counts (gaps)', color: 'var(--c1)' },
  { id: 'continuous', label: 'Continuous', sub: 'measured (any value)', color: 'var(--c3)' },
];

const ITEMS = [
  ['Blood group (A, B, AB, O)', 'nominal', 'Just labels. No group is "higher" than another.'],
  ['Department (QA, DevOps, HR)', 'nominal', 'Names of categories with no natural order (your teacher\'s example).'],
  ['Customer satisfaction (Poor, Fair, Good, Excellent)', 'ordinal', 'Categories with a meaningful order, but gaps between levels are not measured.'],
  ['T-shirt size (S, M, L, XL, XXL)', 'ordinal', 'S < M < L < XL < XXL: ranked categories (your teacher\'s example).'],
  ['Number of students in a class', 'discrete', 'A count: 28 or 29, never 28.4.'],
  ['Number of cars in a parking lot', 'discrete', 'Whole-number count (your teacher\'s example).'],
  ['Height of a student (cm)', 'continuous', 'Measured; can take any value in a range, e.g. 162.37 cm.'],
  ['Delivery time of an order (minutes)', 'continuous', 'Time is measured, so any value is possible: 8.4, 8.41, ...'],
  ['City of residence', 'nominal', 'Category labels, no order.'],
  ['Exam grade (A, B, C, D)', 'ordinal', 'Ranked categories: A is better than B.'],
  ['Number of items returned in one order', 'discrete', 'Counted: 0, 1, 2, 3 ...'],
  ['Weight of a parcel (kg)', 'continuous', 'Measured on a scale; any value in a range (ratio scale too).'],
  ['Warehouse temperature (deg C)', 'continuous', 'Measured; also interval scale (no true zero).'],
  ['Colour of a product', 'nominal', 'Category, no order.'],
  ['Finishing position in a race (1st, 2nd, 3rd)', 'ordinal', 'Rank order is known, but the time gaps between ranks are not.'],
  ['Defective bulbs in a box of 10', 'discrete', 'A count from 0 to 10.'],
  ['Postal PIN code', 'nominal', 'Trap: it is made of digits but only labels a place. Adding PIN codes is meaningless.'],
  ['Monthly rainfall (mm)', 'continuous', 'Measured amount; any non-negative value.'],
];

const css = `
@keyframes dts-pop{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:none}}
@keyframes dts-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}
@keyframes dts-glow{0%{box-shadow:0 0 0 0 var(--c3)}100%{box-shadow:0 0 0 14px transparent}}
@media (prefers-reduced-motion: no-preference){
 .dts-card{animation:dts-pop .35s ease both}
 .dts-card.bad{animation:dts-shake .35s ease}
 .dts-card.good{animation:dts-glow .6s ease-out}
}
.dts-card{border:2px solid var(--line);border-radius:14px;padding:18px 16px;background:var(--surface2);text-align:center;font-weight:600;font-size:17px;min-height:64px;display:flex;align-items:center;justify-content:center}
.dts-card.good{border-color:var(--c3)} .dts-card.bad{border-color:var(--c2)}
.dts-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin:12px 0}
.dts-opt{min-height:48px;border-radius:10px;border:2px solid var(--line);background:var(--surface);color:var(--ink);cursor:pointer;padding:6px 8px;font:inherit;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px}
.dts-opt b{font-size:15px} .dts-opt span{font-size:11.5px;color:var(--muted)}
.dts-opt:hover:not(:disabled){transform:translateY(-1px)}
.dts-opt:disabled{cursor:default;opacity:.55}
.dts-bar{height:6px;border-radius:3px;background:var(--line);overflow:hidden;margin-bottom:12px}
.dts-bar>i{display:block;height:100%;background:var(--c1);transition:width .35s ease}
.dts-fb{padding:10px 12px;border-radius:10px;font-size:14.5px;background:var(--surface2);border-left:4px solid var(--line)}
`;

const shuffle = (seed) => {
  const rng = seededRandom(seed), a = ITEMS.map((_, i) => i);
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, 12);
};

export default function DataTypeSorter() {
  const [seed, setSeed] = useState(7);
  const order = useMemo(() => shuffle(seed), [seed]);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [missed, setMissed] = useState([]);
  const done = i >= order.length;
  const item = !done ? ITEMS[order[i]] : null;
  const answer = (k) => {
    if (pick) return;
    setPick(k);
    if (k === item[1]) { setScore(score + 1); setStreak(streak + 1); } else { setStreak(0); setMissed([...missed, order[i]]); }
  };
  const next = () => { setPick(null); setI(i + 1); };
  const reset = () => { setSeed(seed + 1); setI(0); setPick(null); setScore(0); setStreak(0); setMissed([]); };
  const ok = pick && pick === item[1];
  const kindOf = (id) => KINDS.find((k) => k.id === id);
  return (
    <Card title="Classify the data type" foot="Ask two questions: **Is it a label or a number?** Then: **ordered (ordinal) or not (nominal)?** / **counted (discrete) or measured (continuous)?**">
      <style>{css}</style>
      <div className="dts-bar" aria-hidden="true"><i style={{ width: `${(i / order.length) * 100}%` }} /></div>
      {!done && (
        <div key={i}>
          <div className={`dts-card ${pick ? (ok ? 'good' : 'bad') : ''}`}><Rich text={item[0]} /></div>
          <div className="dts-grid">
            {KINDS.map((k) => (
              <button type="button" key={k.id} className="dts-opt" disabled={!!pick && pick !== k.id && item[1] !== k.id}
                style={pick && item[1] === k.id ? { borderColor: 'var(--c3)', background: 'var(--surface2)' } : pick === k.id ? { borderColor: 'var(--c2)' } : { borderColor: k.color }}
                onClick={() => answer(k.id)}>
                <b>{k.label}</b><span>{k.sub}</span>
              </button>
            ))}
          </div>
          {pick && (
            <div className="dts-fb" style={{ borderLeftColor: ok ? 'var(--c3)' : 'var(--c2)' }} role="status">
              <b>{ok ? 'Correct. ' : `Not quite, it is ${kindOf(item[1]).label}. `}</b><Rich text={item[2]} />
              <div style={{ marginTop: 8 }}><Btn kind="primary" onClick={next}>{i + 1 < order.length ? 'Next' : 'See result'}</Btn></div>
            </div>
          )}
        </div>
      )}
      {done && (
        <div className="dts-card" style={{ flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 22 }}>{score} / {order.length} correct</div>
          {missed.length > 0 ? (
            <div style={{ fontSize: 13.5, fontWeight: 400 }}>Review: {missed.map((m) => `${ITEMS[m][0]} = ${kindOf(ITEMS[m][1]).label}`).join('; ')}</div>
          ) : <div style={{ fontSize: 14, fontWeight: 400 }}>Perfect. Try another shuffle.</div>}
          <Btn kind="primary" onClick={reset}>New round</Btn>
        </div>
      )}
      <Readouts>
        <Readout label="Score" value={`${score}/${Math.min(i + (pick ? 1 : 0), order.length)}`} tone={score && !missed.length ? 'good' : ''} />
        <Readout label="Streak" value={streak} tone={streak >= 3 ? 'good' : ''} />
        <Readout label="Item" value={`${Math.min(i + 1, order.length)}/${order.length}`} />
      </Readouts>
    </Card>
  );
}
