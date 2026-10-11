import React from 'react';
import { Link } from '../kit/router.jsx';
import { Rich } from '../kit/rich.jsx';
import { chapters, parts, allMcq, allProblems } from '../book/registry.js';
import { useProgress } from '../kit/store.js';
import plan from '../content/plan.js';

export default function Home() {
  const prog = useProgress();
  const totalPages = chapters.reduce((s, c) => s + c.pages.length + 1, 0);
  const seen = Object.keys(prog.visited).length;
  const solved = Object.keys(prog.problems).length;
  return (
    <div className="page home">
      <section className="hero">
        <div className="hero-kicker">Revision book · Statistics</div>
        <h1>Learn it once. Walk into the exam sure.</h1>
        <p className="lede">Every topic from your handwritten notes and all your Word documents (descriptive, distributions, inference, linear algebra, PCA, optimization, Python lab, ESA sample paper), rebuilt as short pages with live animations, worked examples, MCQs and written problems with step-by-step solutions. Numbers in this book were recomputed, and slips in the source notes are flagged.</p>
        <div className="hero-stats">
          <div><b>{chapters.length}</b><span>chapters</span></div>
          <div><b>{totalPages}</b><span>pages</span></div>
          <div><b>{allMcq.length}+60</b><span>MCQs</span></div>
          <div><b>{allProblems.length}</b><span>written problems</span></div>
        </div>
        <div className="hero-progress"><div className="bar"><i style={{ width: `${Math.min(100, (seen / totalPages) * 100)}%` }} /></div><span>{seen}/{totalPages} pages read · {solved}/{allProblems.length} problems solved</span></div>
        <div className="hero-actions">
          <Link to={chapters[0] ? `/ch/${chapters[0].id}/0` : '/'} className="btn primary">Start from chapter 1</Link>
          <Link to="/plan" className="btn">Study plan</Link>
          <Link to="/quiz" className="btn">MCQ quiz</Link>
          <Link to="/formulas" className="btn">Formula sheet</Link>
        </div>
      </section>

      <section>
        <h2 className="section-title">Topic map</h2>
        {parts.map((p) => {
          const list = chapters.filter((c) => c.part === p.id);
          if (!list.length) return null;
          return (
            <div className="part" key={p.id}>
              <div className="part-head"><span className="part-letter">{p.id}</span><div><b>{p.title}</b><small>{p.blurb}</small></div></div>
              <div className="cards">
                {list.map((c) => {
                  const read = c.pages.concat([0]).filter((_, i) => prog.visited[`${c.id}/${i}`]).length;
                  return (
                    <Link key={c.id} to={`/ch/${c.id}/0`} className="card">
                      <div className="card-top"><span className="card-num">{String(c.order).padStart(2, '0')}</span><span className="card-min">{c.minutes || 20} min</span></div>
                      <h3>{c.title}</h3>
                      <p><Rich text={c.short || c.summary} /></p>
                      <div className="card-tags">{(c.source || []).map((s) => <span key={s} className="chip">{s}</span>)}</div>
                      <div className="bar slim"><i style={{ width: `${(read / (c.pages.length + 1)) * 100}%` }} /></div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      <section className="how">
        <h2 className="section-title">How to use this book</h2>
        <div className="how-grid">
          <div><b>1 · Read a page</b><p>Each page is one idea. Play with the animation before reading the text.</p></div>
          <div><b>2 · Try the example</b><p>Click “Show first step” only after you have attempted it on paper.</p></div>
          <div><b>3 · Check yourself</b><p>The last page of every chapter has MCQs and written problems.</p></div>
          <div><b>4 · Revise fast</b><p>Cheat sheet, formula sheet and “Corrections” are built for the final hour.</p></div>
        </div>
      </section>
    </div>
  );
}
