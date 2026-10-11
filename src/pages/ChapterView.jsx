import React, { useEffect } from 'react';
import { Link, go } from '../kit/router.jsx';
import { Rich } from '../kit/rich.jsx';
import Blocks from '../book/Blocks.jsx';
import { MiniQuiz, Problem } from '../book/Practice.jsx';
import { chapters, parts, pageList } from '../book/registry.js';
import { progress } from '../kit/store.js';
import { M } from '../kit/rich.jsx';

function Review({ c }) {
  return (
    <div className="blocks">
      {c.cheat?.length > 0 && (<section><h3 className="sub">Key points to remember</h3><ul className="list keypoints">{c.cheat.map((x, i) => <li key={i}><Rich text={x} /></li>)}</ul></section>)}
      {c.formulas?.length > 0 && (<section><h3 className="sub">Formulas for this chapter</h3>
        <div className="formula-grid">{c.formulas.map((f, i) => <div className="formula-card" key={i}><div className="formula-card-name"><Rich text={f.name} /></div><M tex={f.tex} display />{f.note && <div className="formula-note"><Rich text={f.note} /></div>}</div>)}</div></section>)}
      {c.pitfalls?.length > 0 && (<section><h3 className="sub">Common mistakes</h3>
        <div className="pitfalls">{c.pitfalls.map((x, i) => <div className="pitfall" key={i}><div className="bad"><span>✗</span><Rich text={x.wrong} /></div><div className="good"><span>✓</span><Rich text={x.right} /></div>{x.why && <div className="why"><Rich text={x.why} /></div>}</div>)}</div></section>)}
      {c.mcq?.length > 0 && (<section><h3 className="sub">Quick check (MCQ)</h3><MiniQuiz chapterId={c.id} items={c.mcq} /></section>)}
      {c.problems?.length > 0 && (<section><h3 className="sub">Written practice</h3><div className="problems">{c.problems.map((p) => <Problem key={p.id} p={p} uid={`${c.id}:${p.id}`} />)}</div></section>)}
      {c.refs?.length > 0 && (<section><h3 className="sub">Go deeper</h3><ul className="refs">{c.refs.map((r, i) => <li key={i}><a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a>{r.note && <span> — <Rich text={r.note} /></span>}</li>)}</ul></section>)}
    </div>
  );
}

export default function ChapterView({ id, pageIndex }) {
  const c = chapters.find((x) => x.id === id);
  const idx = Math.max(0, parseInt(pageIndex || '0', 10) || 0);
  useEffect(() => { if (c) progress.visit(`${id}/${idx}`); }, [id, idx, c]);
  if (!c) return <div className="page"><h1>Chapter not found</h1><Link to="/">Back to contents</Link></div>;
  const isReview = idx >= c.pages.length;
  const page = isReview ? { title: 'Review & practice' } : c.pages[idx];
  const total = c.pages.length + 1;
  const flat = pageList.findIndex((p) => p.path === `/ch/${id}/${isReview ? c.pages.length : idx}`);
  const prev = pageList[flat - 1], next = pageList[flat + 1];
  const part = parts.find((p) => p.id === c.part);
  return (
    <div className="page chapter" key={`${id}-${idx}`}>
      <div className="crumbs"><Link to="/">Contents</Link> / <span>Part {c.part}{part ? ` · ${part.title}` : ''}</span></div>
      <div className="chapter-kicker">Chapter {c.order} · page {Math.min(idx + 1, total)} of {total}</div>
      <h1 className="chapter-title">{idx === 0 ? c.title : page.title}</h1>
      {idx === 0 && <p className="lede"><Rich text={c.summary} /></p>}
      {idx !== 0 && <div className="chapter-sub">{c.title}</div>}
      <div className="dots" role="tablist">{Array.from({ length: total }).map((_, i) => (
        <button key={i} type="button" className={i === idx ? 'on' : ''} onClick={() => go(`/ch/${id}/${i}`)} title={i < c.pages.length ? c.pages[i].title : 'Review & practice'} aria-label={`Page ${i + 1}`} />
      ))}</div>
      {isReview ? <Review c={c} /> : <><Blocks blocks={page.blocks} /></>}
      <nav className="pager">
        {prev ? <Link to={prev.path} className="pager-btn prev"><small>Previous</small><span>{prev.chapter.id !== id ? `${prev.chapter.title}` : prev.page.title}</span></Link> : <span />}
        {next ? <Link to={next.path} className="pager-btn next"><small>Next</small><span>{next.chapter.id !== id ? `Next chapter: ${next.chapter.title}` : next.page.title}</span></Link> : <Link to="/quiz" className="pager-btn next"><small>Finished</small><span>Take the full MCQ quiz</span></Link>}
      </nav>
    </div>
  );
}
