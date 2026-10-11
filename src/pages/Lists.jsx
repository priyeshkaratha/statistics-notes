import React, { useMemo, useState } from 'react';
import { Link } from '../kit/router.jsx';
import { M, Rich, plain } from '../kit/rich.jsx';
import { Seg } from '../kit/controls.jsx';
import { Problem } from '../book/Practice.jsx';
import { chapters, allProblems, allFormulas, allCorrections } from '../book/registry.js';
import { useProgress } from '../kit/store.js';
import globalRefs from '../content/refs.js';

export function Written() {
  const prog = useProgress();
  const [chap, setChap] = useState('all');
  const [src, setSrc] = useState('all');
  const list = allProblems.filter((p) => (chap === 'all' || p.chapter === chap) && (src === 'all' || p.source.toLowerCase().includes(src)));
  return (
    <div className="page">
      <h1 className="chapter-title">Written practice</h1>
      <p className="lede">{allProblems.length} problems with step-by-step solutions, including every question from your three practice documents. {Object.keys(prog.problems).length} marked solved.</p>
      <div className="filters">
        <select value={chap} onChange={(e) => setChap(e.target.value)}><option value="all">All chapters</option>{chapters.filter((c) => c.problems?.length).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
        <Seg value={src} onChange={setSrc} options={[{ value: 'all', label: 'All' }, { value: 'practice', label: 'Practice doc' }, { value: 'unit 2', label: 'Unit 2' }, { value: 'notes', label: 'Class notes' }]} />
      </div>
      <div className="problems">{list.map((p) => <Problem key={p.uid} p={p} uid={p.uid} />)}</div>
      {!list.length && <p>No problems match.</p>}
    </div>
  );
}

export function Formulas() {
  const [q, setQ] = useState('');
  const groups = useMemo(() => chapters.map((c) => ({ c, items: allFormulas.filter((f) => f.chapter === c.id && (!q || plain(f.name + ' ' + f.tex + ' ' + (f.note || '')).toLowerCase().includes(q.toLowerCase()))) })).filter((g) => g.items.length), [q]);
  return (
    <div className="page wide">
      <h1 className="chapter-title">Formula sheet</h1>
      <p className="lede">Every formula in the book, grouped by chapter. Use your browser’s Print for a PDF.</p>
      <input className="search-inline" placeholder="Filter formulas, e.g. variance" value={q} onChange={(e) => setQ(e.target.value)} />
      {groups.map(({ c, items }) => (
        <section key={c.id}><h2 className="section-title"><Link to={`/ch/${c.id}/0`}>{c.title}</Link></h2>
          <div className="formula-grid">{items.map((f, i) => <div className="formula-card" key={i}><div className="formula-card-name"><Rich text={f.name} /></div><M tex={f.tex} display />{f.note && <div className="formula-note"><Rich text={f.note} /></div>}</div>)}</div>
        </section>
      ))}
    </div>
  );
}

export function Cheat() {
  return (
    <div className="page wide">
      <h1 className="chapter-title">Cheat sheet</h1>
      <p className="lede">The last-hour read: the points examiners test most, chapter by chapter.</p>
      <div className="cheat-grid">
        {chapters.filter((c) => c.cheat?.length).map((c) => (
          <section className="cheat-card" key={c.id}><h3><Link to={`/ch/${c.id}/${c.pages.length}`}>{c.title}</Link></h3>
            <ul>{c.cheat.map((x, i) => <li key={i}><Rich text={x} /></li>)}</ul></section>
        ))}
      </div>
    </div>
  );
}

export function Corrections() {
  return (
    <div className="page">
      <h1 className="chapter-title">Corrections to the source notes</h1>
      <p className="lede">While rebuilding the book every number was recomputed. These are the places where the handwritten notes or Word documents differ from the correct value. The conclusions mostly survive, but do not memorise the wrong figure.</p>
      {allCorrections.map((x, i) => (
        <div className="callout fix" key={i}>
          <div className="callout-head">🛠️ <Rich text={x.where} /> <small className="muted">· <Link to={`/ch/${x.chapter}/0`}>{chapters.find((c) => c.id === x.chapter)?.title}</Link></small></div>
          <div className="callout-body"><div><b>Source says:</b> <Rich text={x.said} /></div><div><b>Correct:</b> <Rich text={x.fix} /></div>{x.why && <div className="muted"><Rich text={x.why} /></div>}</div>
        </div>
      ))}
      {!allCorrections.length && <p>No corrections registered.</p>}
    </div>
  );
}

export function References() {
  const seen = new Set();
  const groups = [{ title: 'General', refs: globalRefs }, ...chapters.map((c) => ({ title: c.title, refs: c.refs || [] }))].map((g) => ({ ...g, refs: g.refs.filter((r) => !seen.has(r.url) && seen.add(r.url)) })).filter((g) => g.refs.length);
  return (
    <div className="page">
      <h1 className="chapter-title">Reference links</h1>
      <p className="lede">Trusted external material (NIST, OpenStax, Penn State STAT, Khan Academy, SciPy and others) for when you want another explanation. Links open in a new tab and need internet.</p>
      {groups.map((g) => (
        <section key={g.title}><h2 className="section-title">{g.title}</h2>
          <ul className="refs">{g.refs.map((r, i) => <li key={i}><a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a>{r.note && <span> — <Rich text={r.note} /></span>}</li>)}</ul></section>
      ))}
    </div>
  );
}
