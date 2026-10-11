import React, { useState, useEffect, useMemo } from 'react';
import { Card, Controls, Slider, Seg, Btn, Readouts, Readout, f } from '../kit/controls.jsx';

// Marks of the sample ESA paper (Q9 has no stated marks; it is a selectable assumption).
const SECTION_OF = (q) => (q <= 4 ? 'A' : q <= 12 ? 'B' : 'C');
const baseMarks = (q9) => {
  const m = { 1: 5, 2: 2, 3: 5, 4: 3, 5: 8, 6: 5, 7: 6, 8: 8, 9: q9, 10: 5, 11: 6, 12: 5, 13: 2, 14: 2, 15: 4 };
  for (let q = 16; q <= 25; q++) m[q] = 5;
  return m;
};
const NAMES = { A: 'A Theory', B: 'B Problems', C: 'C Practicals' };
const clock = (s) => {
  const t = Math.max(0, Math.round(s));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

export default function ExamTimer() {
  const [minutes, setMinutes] = useState(180);
  const [review, setReview] = useState(10);
  const [q9, setQ9] = useState(6);
  const [order, setOrder] = useState('ABC');
  const [left, setLeft] = useState(180 * 60);
  const [running, setRunning] = useState(false);
  const [cur, setCur] = useState(0);

  const marks = useMemo(() => baseMarks(q9), [q9]);
  const seq = useMemo(() => {
    const out = [];
    for (const s of order) for (let q = 1; q <= 25; q++) if (SECTION_OF(q) === s) out.push(q);
    return out;
  }, [order]);
  const total = seq.reduce((a, q) => a + marks[q], 0);
  const usable = Math.max(0, minutes - review);
  const perMark = usable / total;
  const mins = (q) => marks[q] * perMark;
  // cumulative minutes at the end of each question, in attempt order
  const cum = useMemo(() => { let c = 0; return seq.map((q) => (c += marks[q] * perMark)); }, [seq, marks, perMark]);

  const sections = order.split('').map((s) => {
    const qs = seq.filter((q) => SECTION_OF(q) === s);
    const m = qs.reduce((a, q) => a + marks[q], 0);
    const end = cum[seq.indexOf(qs[qs.length - 1])];
    return { s, m, mins: m * perMark, end, qs };
  });

  const reset = (mm) => { setRunning(false); setLeft(mm * 60); setCur(0); };
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setLeft((l) => (l <= 1 ? 0 : l - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => { if (left === 0 && running) setRunning(false); }, [left, running]);

  const elapsedMin = (minutes * 60 - left) / 60;
  const target = cum[Math.min(cur, seq.length - 1)] || 0; // minutes by which the current question should be finished
  const prevTarget = cur > 0 ? cum[cur - 1] : 0;
  const diff = target - elapsedMin; // positive = ahead of schedule at the end of current question budget
  const finished = cur >= seq.length;
  const qNow = seq[Math.min(cur, seq.length - 1)];
  const behind = !finished && elapsedMin > target;
  const tone = finished ? 'good' : behind ? 'bad' : elapsedMin < prevTarget - 1 ? 'good' : 'warn';
  const secOfNow = SECTION_OF(qNow);

  return (
    <Card title="ESA exam timer and pacing planner" tag="Planner" foot="Plan **minutes ≈ marks × (usable time ÷ total marks)**, keep a review buffer, and check the clock at each section checkpoint: if you are behind, skip and come back.">
      <Controls>
        <Slider label="Minutes available" value={minutes} onChange={(v) => { setMinutes(v); reset(v); }} min={30} max={180} step={5} unit=" min" />
        <Slider label="Review buffer at the end" value={review} onChange={setReview} min={0} max={20} step={1} unit=" min" />
        <Seg label="Marks for Q9 (not printed)" options={[{ value: 5, label: 'Q9 = 5' }, { value: 6, label: 'Q9 = 6' }, { value: 8, label: 'Q9 = 8' }]} value={q9} onChange={setQ9} />
        <Seg label="Order" options={[{ value: 'ABC', label: 'A, B, C' }, { value: 'ACB', label: 'A, C, B' }, { value: 'CAB', label: 'C, A, B' }]} value={order} onChange={(v) => { setOrder(v); reset(minutes); }} />
      </Controls>
      <Readouts>
        <Readout label="Total marks (as printed)" value={total} />
        <Readout label="Minutes per mark" value={f(perMark, 2)} />
        <Readout label="Usable minutes" value={f(usable, 0)} />
      </Readouts>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Section</th><th>Marks</th><th>Minutes</th><th>Finish when clock shows</th></tr></thead>
          <tbody>
            {sections.map((x) => (
              <tr key={x.s}><td>{NAMES[x.s]}</td><td>{x.m}</td><td>{f(x.mins, 0)}</td><td className="mono">{clock((minutes - x.end) * 60)} left</td></tr>
            ))}
            <tr><td>Review</td><td>-</td><td>{review}</td><td className="mono">0:00:00</td></tr>
          </tbody>
        </table>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Q</th>{seq.map((q) => <th key={q} style={q === qNow && !finished ? { color: 'var(--c2)' } : null}>{q}</th>)}</tr></thead>
          <tbody>
            <tr><td>Marks</td>{seq.map((q) => <td key={q}>{marks[q]}</td>)}</tr>
            <tr><td>Min</td>{seq.map((q) => <td key={q}>{f(mins(q), 1)}</td>)}</tr>
          </tbody>
        </table>
      </div>
      <Readouts>
        <Readout label="Time left" value={clock(left)} tone={left === 0 ? 'bad' : ''} />
        <Readout label="Now on" value={finished ? 'done' : `Q${qNow} (Sec ${secOfNow})`} />
        <Readout label="Budget for this Q" value={finished ? '-' : `${f(mins(qNow), 1)} min`} />
        <Readout label={behind ? 'Behind by' : 'Spare vs plan'} value={finished ? '-' : `${f(Math.abs(diff), 1)} min`} tone={tone} />
      </Readouts>
      <Controls>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Btn kind="primary" onClick={() => setRunning((r) => !r)} disabled={left === 0}>{running ? 'Pause' : left === minutes * 60 ? 'Start' : 'Resume'}</Btn>
          <Btn kind="ghost" onClick={() => setCur((c) => Math.max(0, c - 1))} disabled={cur === 0}>Back</Btn>
          <Btn onClick={() => setCur((c) => Math.min(seq.length, c + 1))} disabled={finished}>Done with Q{finished ? '' : qNow}</Btn>
          <Btn kind="ghost" onClick={() => reset(minutes)}>Reset</Btn>
        </div>
      </Controls>
    </Card>
  );
}
