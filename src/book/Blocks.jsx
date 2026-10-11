import React, { useState, Suspense } from 'react';
import { M, Rich } from '../kit/rich.jsx';
import { Btn } from '../kit/controls.jsx';
import { widgets } from './registry.js';

const CALLOUT = {
  tip: ['Tip', '💡'], exam: ['Exam focus', '🎯'], warn: ['Watch out', '⚠️'], note: ['Note', '📝'],
  fix: ['Correction to your notes', '🛠️'], notes: ['From your notes', '📓'], mnemonic: ['Remember', '🧠'], why: ['Why it works', '🔍'],
};

export function Example({ title = 'Worked example', q, steps = [], ans }) {
  const [shown, setShown] = useState(0);
  const all = shown >= steps.length;
  return (
    <div className="example">
      <div className="example-head"><span className="badge">Example</span> <b><Rich text={title} /></b></div>
      <div className="example-q"><Rich text={q} /></div>
      <ol className="example-steps">
        {steps.slice(0, shown).map((s, i) => <li key={i} className="reveal"><Rich text={typeof s === 'string' ? s : s.text} /></li>)}
      </ol>
      {all && ans && <div className="example-ans reveal"><span>Answer</span> <Rich text={ans} /></div>}
      <div className="example-ctl">
        {!all && <Btn kind="primary" onClick={() => setShown(shown + 1)}>{shown === 0 ? 'Show first step' : `Next step (${shown}/${steps.length})`}</Btn>}
        {!all && <Btn onClick={() => setShown(steps.length)}>Show all</Btn>}
        {shown > 0 && <Btn kind="ghost" onClick={() => setShown(0)}>Reset</Btn>}
      </div>
    </div>
  );
}

function Steps({ title, items }) {
  const [on, setOn] = useState(0);
  return (
    <div className="stepper">
      {title && <div className="stepper-title"><Rich text={title} /></div>}
      <ol>
        {items.map((s, i) => (
          <li key={i} className={i === on ? 'on' : i < on ? 'done' : ''} onClick={() => setOn(i)}>
            <span className="num">{i + 1}</span>
            <div><b><Rich text={s.title} /></b>{s.text && <div className="step-text"><Rich text={s.text} /></div>}</div>
          </li>
        ))}
      </ol>
      <div className="example-ctl">
        <Btn onClick={() => setOn(Math.max(0, on - 1))} disabled={on === 0}>Back</Btn>
        <Btn kind="primary" onClick={() => setOn(Math.min(items.length - 1, on + 1))} disabled={on === items.length - 1}>Next</Btn>
      </div>
    </div>
  );
}

function Widget({ name, props }) {
  const W = widgets[name];
  if (!W) return <div className="callout warn">Widget “{name}” not found.</div>;
  return <Suspense fallback={null}><W {...(props || {})} /></Suspense>;
}

function CodeBlock({ title, lang = 'python', code, output }) {
  const [done, setDone] = useState(false);
  const copy = () => {
    try { navigator.clipboard.writeText(code); setDone(true); setTimeout(() => setDone(false), 1200); } catch { /* clipboard unavailable */ }
  };
  return (
    <div className="codeblock">
      <div className="codeblock-head">
        <span>{title ? <Rich text={title} /> : lang}</span>
        <button type="button" className="codeblock-copy" onClick={copy}>{done ? 'Copied' : 'Copy'}</button>
      </div>
      <pre><code>{code}</code></pre>
      {output != null && <div className="codeblock-out"><span>Output</span><pre>{output}</pre></div>}
    </div>
  );
}

export function Block({ b }) {
  switch (b.t) {
    case 'code': return <CodeBlock {...b} />;
    case 'p': return <p className="para"><Rich text={b.text} /></p>;
    case 'h': return <h3 className="sub"><Rich text={b.text} /></h3>;
    case 'list': {
      const Tag = b.ordered ? 'ol' : 'ul';
      return <Tag className="list">{b.items.map((it, i) => <li key={i}><Rich text={it} /></li>)}</Tag>;
    }
    case 'formula': return (
      <div className="formula">
        {b.title && <div className="formula-title"><Rich text={b.title} /></div>}
        <M tex={b.tex} display />
        {b.note && <div className="formula-note"><Rich text={b.note} /></div>}
      </div>
    );
    case 'def': return (
      <div className="def"><span className="def-term"><Rich text={b.term} /></span><div><Rich text={b.text} /></div></div>
    );
    case 'callout': {
      const [label, icon] = CALLOUT[b.kind] || CALLOUT.note;
      return (
        <aside className={`callout ${b.kind || 'note'}`}>
          <div className="callout-head"><span aria-hidden>{icon}</span> {b.title ? <Rich text={b.title} /> : label}</div>
          <div className="callout-body"><Rich text={b.text} /></div>
        </aside>
      );
    }
    case 'table': return (
      <div className="table-wrap">
        {b.title && <div className="table-title"><Rich text={b.title} /></div>}
        <table>
          {b.head && <thead><tr>{b.head.map((h, i) => <th key={i}><Rich text={h} /></th>)}</tr></thead>}
          <tbody>{b.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}><Rich text={String(c)} /></td>)}</tr>)}</tbody>
        </table>
      </div>
    );
    case 'example': return <Example {...b} />;
    case 'steps': return <Steps title={b.title} items={b.items} />;
    case 'widget': return <Widget name={b.name} props={b.props} />;
    case 'compare': return (
      <div className="compare">{[b.left, b.right].map((side, i) => (
        <div key={i} className="compare-col"><div className="compare-title"><Rich text={side.title} /></div><ul>{side.items.map((it, j) => <li key={j}><Rich text={it} /></li>)}</ul></div>
      ))}</div>
    );
    default: return null;
  }
}

export default function Blocks({ blocks }) {
  return <div className="blocks">{blocks.map((b, i) => <Block key={i} b={b} />)}</div>;
}
