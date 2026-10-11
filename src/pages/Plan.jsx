import React from 'react';
import { Link } from '../kit/router.jsx';
import { Rich } from '../kit/rich.jsx';
import plan from '../content/plan.js';
import { useProgress, progress } from '../kit/store.js';

export default function Plan() {
  const prog = useProgress();
  return (
    <div className="page">
      <h1 className="chapter-title">Study plan</h1>
      <p className="lede">Ordered by how much each topic is usually worth and how much it builds on the previous one. Tick items as you go; progress is saved in this browser.</p>
      {plan.map((day) => (
        <section key={day.title}><h2 className="section-title">{day.title}</h2><p className="muted"><Rich text={day.goal} /></p>
          <ul className="plan">{day.items.map((it) => {
            const key = it.id;
            return (
              <li key={key} className={prog.plan[key] ? 'done' : ''}>
                <label><input type="checkbox" checked={!!prog.plan[key]} onChange={() => progress.toggle('plan', key)} />
                  <span><b>{it.time}</b> · <Rich text={it.text} />{it.link && <> <Link to={it.link}>open →</Link></>}</span></label>
              </li>
            );
          })}</ul>
        </section>
      ))}
    </div>
  );
}
