import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Rich } from '../kit/rich.jsx';
import { Btn, Seg } from '../kit/controls.jsx';
import { Mcq } from '../book/Practice.jsx';
import { chapters, allMcq } from '../book/registry.js';
import sample from '../content/quizSample.json';
import { progress } from '../kit/store.js';

const sampleQs = sample.map((s) => ({ ...s, chapter: s.chapterTag, from: 'sample' }));
const pool = [...allMcq, ...sampleQs];

function shuffle(a, seed) {
  const r = [...a]; let s = seed;
  for (let i = r.length - 1; i > 0; i--) { s = (s * 1664525 + 1013904223) >>> 0; const j = s % (i + 1); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

export default function Quiz() {
  const [mode, setMode] = useState('practice');
  const [chap, setChap] = useState('all');
  const [src, setSrc] = useState('all');
  const [count, setCount] = useState(20);
  const [seed, setSeed] = useState(() => (Date.now() % 100000) + 1);
  const [answers, setAnswers] = useState({});
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [secs, setSecs] = useState(0);
  const timer = useRef(null);

  const filtered = useMemo(() => pool.filter((q) => (chap === 'all' || q.chapter === chap) && (src === 'all' || q.from === src)), [chap, src]);
  const deck = useMemo(() => shuffle(filtered, seed).slice(0, count === 0 ? filtered.length : count), [filtered, seed, count]);

  useEffect(() => {
    if (started && mode === 'exam' && !submitted) { timer.current = setInterval(() => setSecs((s) => s + 1), 1000); return () => clearInterval(timer.current); }
    return undefined;
  }, [started, mode, submitted]);

  const start = () => { setSeed((s) => s + 7); setAnswers({}); setSubmitted(false); setSecs(0); setStarted(true); };
  const rightCount = deck.filter((q) => answers[q.id] === q.answer).length;
  const mm = String(Math.floor(secs / 60)).padStart(2, '0'), ss = String(secs % 60).padStart(2, '0');

  if (!started) {
    return (
      <div className="page">
        <h1 className="chapter-title">MCQ quiz</h1>
        <p className="lede">{pool.length} questions: {allMcq.length} written for this book and {sampleQs.length} from your sample quiz. Practice mode shows the explanation straight away; exam mode hides it until you submit.</p>
        <div className="panel">
          <div className="panel-row"><span>Mode</span><Seg value={mode} onChange={setMode} options={[{ value: 'practice', label: 'Practice' }, { value: 'exam', label: 'Timed exam' }]} /></div>
          <div className="panel-row"><span>Questions</span><Seg value={count} onChange={setCount} options={[{ value: 10, label: '10' }, { value: 20, label: '20' }, { value: 40, label: '40' }, { value: 0, label: 'All' }]} /></div>
          <div className="panel-row"><span>Source</span><Seg value={src} onChange={setSrc} options={[{ value: 'all', label: 'Both' }, { value: 'sample', label: 'Your sample quiz' }, { value: 'book', label: 'Book' }]} /></div>
          <div className="panel-row"><span>Topic</span>
            <select value={chap} onChange={(e) => setChap(e.target.value)}>
              <option value="all">All topics</option>
              {chapters.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="panel-foot"><b>{filtered.length}</b> questions match. <Btn kind="primary" onClick={start} disabled={!filtered.length}>Start {Math.min(filtered.length, count || filtered.length)} questions</Btn></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="quiz-bar">
        <b>{mode === 'exam' ? 'Timed exam' : 'Practice'}</b>
        <span>{Object.keys(answers).length}/{deck.length} answered</span>
        {mode === 'exam' && !submitted && <span className="mono">{mm}:{ss}</span>}
        {(mode === 'practice' || submitted) && <span>Score <b>{rightCount}</b>/{deck.length}</span>}
        <span className="grow" />
        {mode === 'exam' && !submitted && <Btn kind="primary" onClick={() => { setSubmitted(true); deck.forEach((q) => progress.recordQuiz(q.id, answers[q.id] === q.answer)); }}>Submit</Btn>}
        <Btn onClick={() => setStarted(false)}>New quiz</Btn>
      </div>
      {submitted && <div className="callout exam"><div className="callout-head">Result</div><div className="callout-body">You scored <b>{rightCount} / {deck.length}</b> ({Math.round((rightCount / deck.length) * 100)}%) in {mm}:{ss}. Scroll down to review every explanation.</div></div>}
      {deck.map((q, i) => (
        <div key={q.id + seed}>
          {q.section && <div className="mcq-section">{q.section}</div>}
          <Mcq q={q} index={i + 1}
            reveal={mode === 'practice' || submitted}
            locked={submitted}
            picked={mode === 'exam' ? (answers[q.id] ?? null) : undefined}
            onAnswer={(ok, pick) => { setAnswers((a) => ({ ...a, [q.id]: pick })); if (mode === 'practice') progress.recordQuiz(q.id, ok); }} />
        </div>
      ))}
    </div>
  );
}
