import React, { useState } from 'react';
import { Rich } from '../kit/rich.jsx';
import { Btn } from '../kit/controls.jsx';
import { progress, useProgress } from '../kit/store.js';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export function Mcq({ q, index, onAnswer, locked, reveal = true, picked: pickedProp }) {
  const [pickedLocal, setPicked] = useState(null);
  const picked = pickedProp !== undefined ? pickedProp : pickedLocal;
  const done = picked !== null && picked !== undefined;
  const showFeedback = done && reveal;
  const choose = (i) => {
    if (done || locked) return;
    setPicked(i);
    onAnswer?.(i === q.answer, i);
  };
  return (
    <div className={`mcq ${showFeedback ? (picked === q.answer ? 'right' : 'wrong') : ''}`}>
      <div className="mcq-q">{index != null && <span className="mcq-n">{index}</span>}<Rich text={q.q} /></div>
      <div className="mcq-opts">
        {q.options.map((o, i) => {
          let cls = 'mcq-opt';
          if (showFeedback && i === q.answer) cls += ' correct';
          else if (showFeedback && i === picked) cls += ' incorrect';
          else if (done && i === picked) cls += ' picked';
          return (
            <button type="button" key={i} className={cls} onClick={() => choose(i)} aria-pressed={picked === i}>
              <span className="mcq-letter">{LETTERS[i]}</span><span><Rich text={o} /></span>
            </button>
          );
        })}
      </div>
      {showFeedback && <div className="mcq-why reveal"><b>{picked === q.answer ? 'Correct. ' : `Answer: ${LETTERS[q.answer]}. `}</b><Rich text={q.why} /></div>}
    </div>
  );
}

export function MiniQuiz({ chapterId, items }) {
  const [score, setScore] = useState({});
  const answered = Object.keys(score).length;
  const right = Object.values(score).filter(Boolean).length;
  if (!items?.length) return null;
  return (
    <div className="miniquiz">
      {items.map((q, i) => (
        <Mcq key={i} q={q} index={i + 1} onAnswer={(ok) => { setScore((s) => ({ ...s, [i]: ok })); progress.recordQuiz(`${chapterId}:${i}`, ok); }} />
      ))}
      <div className="miniquiz-score">Score: <b>{right}</b> / {answered} answered ({items.length} total)</div>
    </div>
  );
}

export function Problem({ p, uid }) {
  const [open, setOpen] = useState(0);
  const [hint, setHint] = useState(false);
  const prog = useProgress();
  const done = !!prog.problems[uid];
  const steps = p.steps || [];
  return (
    <article className={`problem ${done ? 'is-done' : ''}`}>
      <header className="problem-head">
        <div className="problem-meta">
          <span className="chip">{p.source}</span>
          {p.difficulty && <span className={`chip d-${p.difficulty}`}>{p.difficulty}</span>}
          {p.marks && <span className="chip">{p.marks} marks</span>}
        </div>
        <label className="check"><input type="checkbox" checked={done} onChange={() => progress.toggle('problems', uid)} /> Solved</label>
      </header>
      <div className="problem-q"><Rich text={p.q} /></div>
      {p.hint && (hint ? <div className="problem-hint reveal"><b>Hint: </b><Rich text={p.hint} /></div> : <Btn kind="ghost" onClick={() => setHint(true)}>Hint</Btn>)}
      {steps.length > 0 && (
        <ol className="example-steps">
          {steps.slice(0, open).map((s, i) => <li key={i} className="reveal"><Rich text={s} /></li>)}
        </ol>
      )}
      <div className="example-ctl">
        {open < steps.length && <Btn kind="primary" onClick={() => setOpen(open + 1)}>{open === 0 ? 'Show solution step by step' : `Next step (${open}/${steps.length})`}</Btn>}
        {open < steps.length && <Btn onClick={() => setOpen(steps.length)}>Show all steps</Btn>}
        {open > 0 && <Btn kind="ghost" onClick={() => setOpen(0)}>Hide</Btn>}
      </div>
      {open >= steps.length && (open > 0 || steps.length === 0) && <div className="example-ans reveal"><span>Answer</span> <Rich text={p.answer} /></div>}
    </article>
  );
}
