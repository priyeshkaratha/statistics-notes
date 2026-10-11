import React, { useEffect, useMemo, useState } from 'react';
import { usePath, Link, go } from './kit/router.jsx';
import { chapters, parts, searchIndex } from './book/registry.js';
import { useProgress } from './kit/store.js';
import Home from './pages/Home.jsx';
import ChapterView from './pages/ChapterView.jsx';
import Quiz from './pages/Quiz.jsx';
import Plan from './pages/Plan.jsx';
import { Written, Formulas, Cheat, Corrections, References } from './pages/Lists.jsx';

function useTheme() {
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('statsbook:theme') || ''; } catch (e) { return ''; } });
  useEffect(() => {
    if (theme) document.documentElement.setAttribute('data-theme', theme); else document.documentElement.removeAttribute('data-theme');
    try { if (theme) localStorage.setItem('statsbook:theme', theme); } catch (e) { /* ignore */ }
  }, [theme]);
  const dark = theme ? theme === 'dark' : window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return [dark, () => setTheme(dark ? 'light' : 'dark')];
}

function Search({ onPick }) {
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (t.length < 2) return [];
    return searchIndex.filter((r) => r.text.includes(t) || r.title.toLowerCase().includes(t)).slice(0, 8);
  }, [q]);
  return (
    <div className="search">
      <input type="search" placeholder="Search topics…  (e.g. Bessel, p-value)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search the book" />
      {results.length > 0 && (
        <ul className="search-results">{results.map((r) => (
          <li key={r.path}><a href={`#${r.path}`} onClick={() => { setQ(''); onPick?.(); }}><b>{r.title}</b><small>{r.chapter}</small></a></li>
        ))}</ul>
      )}
    </div>
  );
}

function Sidebar({ path, open, close }) {
  const prog = useProgress();
  const cur = (path.match(/^\/ch\/([^/]+)/) || [])[1];
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="side-top"><Link to="/" className="brand" onClick={close}><span className="brand-mark">σ</span><span>Statistics<br /><small>Revision book</small></span></Link></div>
      <Search onPick={close} />
      <nav>
        <div className="side-group">
          {[['/', 'Contents'], ['/plan', 'Study plan'], ['/quiz', 'MCQ quiz'], ['/written', 'Written practice'], ['/formulas', 'Formula sheet'], ['/cheat', 'Cheat sheet'], ['/corrections', 'Corrections'], ['/refs', 'Reference links']].map(([to, label]) => (
            <Link key={to} to={to} className={path === to ? 'active' : ''} onClick={close}>{label}</Link>
          ))}
        </div>
        {parts.map((p) => {
          const list = chapters.filter((c) => c.part === p.id);
          if (!list.length) return null;
          return (
            <div className="side-group" key={p.id}>
              <div className="side-title">{p.id} · {p.title}</div>
              {list.map((c) => {
                const n = c.pages.length + 1, read = Array.from({ length: n }).filter((_, i) => prog.visited[`${c.id}/${i}`]).length;
                return (
                  <div key={c.id}>
                    <Link to={`/ch/${c.id}/0`} className={cur === c.id ? 'active' : ''} onClick={close}>
                      <span className="side-num">{c.order}</span><span className="side-name">{c.title}</span>{read === n && <span className="tick-done" title="All pages read">✓</span>}
                    </Link>
                    {cur === c.id && (
                      <div className="side-pages">{c.pages.map((pg, i) => <Link key={i} to={`/ch/${c.id}/${i}`} className={path === `/ch/${c.id}/${i}` ? 'active' : ''} onClick={close}>{pg.title}</Link>)}
                        <Link to={`/ch/${c.id}/${c.pages.length}`} className={path === `/ch/${c.id}/${c.pages.length}` ? 'active' : ''} onClick={close}>Review & practice</Link></div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

export default function App() {
  const path = usePath();
  const [dark, toggle] = useTheme();
  const [open, setOpen] = useState(false);
  let view;
  const m = path.match(/^\/ch\/([^/]+)(?:\/(\d+))?/);
  if (m) view = <ChapterView id={m[1]} pageIndex={m[2]} />;
  else if (path === '/quiz') view = <Quiz />;
  else if (path === '/plan') view = <Plan />;
  else if (path === '/written') view = <Written />;
  else if (path === '/formulas') view = <Formulas />;
  else if (path === '/cheat') view = <Cheat />;
  else if (path === '/corrections') view = <Corrections />;
  else if (path === '/refs') view = <References />;
  else view = <Home />;
  return (
    <div className="shell">
      <button type="button" className="menu-btn" onClick={() => setOpen(!open)} aria-label="Toggle menu">☰</button>
      <button type="button" className="theme-btn" onClick={toggle} aria-label="Toggle dark mode">{dark ? '☀' : '☾'}</button>
      <Sidebar path={path} open={open} close={() => setOpen(false)} />
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <main className="main">{view}</main>
    </div>
  );
}
