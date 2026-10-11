import React, { useMemo } from 'react';
import katex from 'katex';

const cache = new Map();
export function texHtml(tex, display = false) {
  const key = (display ? 'D' : 'I') + tex;
  if (!cache.has(key)) {
    cache.set(key, katex.renderToString(tex, { displayMode: display, throwOnError: false, output: 'html', strict: 'ignore' }));
  }
  return cache.get(key);
}

/** Inline or display math. */
export function M({ tex, display = false }) {
  return <span className={display ? 'math-display' : 'math-inline'} dangerouslySetInnerHTML={{ __html: texHtml(tex, display) }} />;
}

const TOKEN = /(\[\[[^\]|]+\|\/[^\]]+\]\]|\$[^$]+\$|\*\*[^*]+\*\*|`[^`]+`|(?<![\w*])\*[^*\s][^*]*\*(?![\w*]))/g;

/** Inline markup: $math$, **bold**, *italic*, `code`, \n line breaks, \$ literal dollar. */
export function Rich({ text, as: Tag = 'span' }) {
  const out = useMemo(() => {
    const src = String(text ?? '').replace(/\\\$/g, '\u0000');
    const parts = src.split(TOKEN);
    return parts.map((p, i) => {
      if (!p) return null;
      const fix = (s) => s.replace(/\u0000/g, '$');
      if (p.startsWith('[[') && p.endsWith(']]')) { const [label, to] = p.slice(2, -2).split('|'); return <a key={i} className="xref" href={`#${to}`}>{label}</a>; }
      if (p.startsWith('$') && p.endsWith('$') && p.length > 2) return <M key={i} tex={fix(p.slice(1, -1))} />;
      if (p.startsWith('**') && p.endsWith('**') && p.length > 4) return <strong key={i}><Rich text={fix(p.slice(2, -2))} /></strong>;
      if (p.startsWith('`') && p.endsWith('`') && p.length > 2) return <code key={i}>{fix(p.slice(1, -1))}</code>;
      if (p.startsWith('*') && p.endsWith('*') && p.length > 2) return <em key={i}><Rich text={fix(p.slice(1, -1))} /></em>;
      return fix(p).split('\n').map((line, j, arr) => <React.Fragment key={`${i}-${j}`}>{line}{j < arr.length - 1 && <br />}</React.Fragment>);
    });
  }, [text]);
  return <Tag>{out}</Tag>;
}

/** Strip markup for search index / plain text. */
export const plain = (s) => String(s ?? '').replace(/\[\[([^\]|]+)\|[^\]]+\]\]/g, '$1').replace(/\\\$/g, '$').replace(/\$([^$]+)\$/g, '$1').replace(/[*`]/g, '');
