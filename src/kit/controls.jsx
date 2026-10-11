import React from 'react';
import { Rich } from './rich.jsx';

export function Card({ title, tag = 'Interactive', children, foot }) {
  return (
    <figure className="widget">
      <div className="widget-head"><span className="widget-tag">{tag}</span><span className="widget-title">{title}</span></div>
      <div className="widget-body">{children}</div>
      {foot && <figcaption className="widget-foot"><Rich text={foot} /></figcaption>}
    </figure>
  );
}

export function Slider({ label, value, onChange, min, max, step = 1, fmt = (v) => v, unit = '' }) {
  return (
    <label className="slider">
      <span className="slider-label"><span>{label}</span><b className="mono">{fmt(value)}{unit}</b></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} />
    </label>
  );
}

export function Seg({ options, value, onChange, label }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => {
        const v = typeof o === 'object' ? o.value : o, l = typeof o === 'object' ? o.label : o;
        return <button type="button" key={String(v)} aria-pressed={v === value} onClick={() => onChange(v)}>{l}</button>;
      })}
    </div>
  );
}

export function Btn({ children, onClick, kind = '', disabled, ...rest }) {
  return <button type="button" className={`btn ${kind}`} onClick={onClick} disabled={disabled} {...rest}>{children}</button>;
}

export function Readout({ label, value, tone = '' }) {
  return <div className={`readout ${tone}`}><span>{label}</span><b className="mono">{value}</b></div>;
}
export const Readouts = ({ children }) => <div className="readouts">{children}</div>;
export const Controls = ({ children }) => <div className="controls">{children}</div>;

export function NumList({ label, value, onChange, placeholder }) {
  return (
    <label className="numlist">
      <span>{label}</span>
      <input type="text" inputMode="decimal" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
export const parseNums = (s) => String(s).split(/[\s,;]+/).map(Number).filter((x) => Number.isFinite(x) && String(x) !== '');
export const f = (v, d = 3) => (Number.isFinite(v) ? (Math.abs(v) >= 1e6 || (Math.abs(v) < 1e-4 && v !== 0) ? v.toExponential(2) : String(Number(v.toFixed(d)))) : '—');
