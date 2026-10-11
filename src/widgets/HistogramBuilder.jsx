import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Slider, Seg, Btn, Controls, NumList, parseNums, Readouts, Readout, f } from '../kit/controls.jsx';
import { Plot } from '../kit/plot.jsx';
import { mean, seededRandom, randNormal } from '../lib/stats.js';

const gen = (kind) => {
  const r = seededRandom(kind === 'bell' ? 11 : kind === 'skew' ? 5 : 21);
  const clip = (v) => Math.max(0, Math.min(100, Math.round(v)));
  if (kind === 'bell') return Array.from({ length: 60 }, () => clip(randNormal(r, 60, 12)));
  if (kind === 'skew') return Array.from({ length: 60 }, () => clip(8 + Math.exp(randNormal(r, 2.6, 0.7))));
  return Array.from({ length: 60 }, (_, i) => clip(i % 2 ? randNormal(r, 30, 7) : randNormal(r, 72, 7)));
};
const PRESETS = {
  delivery: { label: 'Delivery (10)', data: [4, 5, 12, 15, 6, 8, 7, 8, 10, 9], unit: 'min' },
  outl: { label: '+ 50, 100', data: [4, 5, 12, 15, 6, 8, 7, 8, 10, 9, 50, 100], unit: 'min' },
  bell: { label: 'Marks (bell)', data: gen('bell'), unit: 'marks' },
  skew: { label: 'Skewed', data: gen('skew'), unit: 'units' },
  bi: { label: 'Two groups', data: gen('bi'), unit: 'marks' },
  custom: { label: 'Your data', data: [], unit: '' },
};

export default function HistogramBuilder() {
  const [preset, setPreset] = useState('delivery');
  const [txt, setTxt] = useState('3, 5, 5, 6, 7, 7, 7, 9, 12, 14, 20');
  const [width, setWidth] = useState(5);
  const [shift, setShift] = useState(0);
  const [mode, setMode] = useState('freq');
  const [play, setPlay] = useState(false);
  const dirRef = useRef(-1);
  const data = useMemo(() => (preset === 'custom' ? parseNums(txt) : PRESETS[preset].data), [preset, txt]);
  const n = data.length;
  const lo = n ? Math.min(...data) : 0, hi = n ? Math.max(...data) : 1;
  const span = Math.max(hi - lo, 1);
  const wMin = span > 30 ? 1 : 0.5, wMax = Math.max(wMin * 2, Math.ceil(span * 0.8));
  const w = Math.min(Math.max(width, wMin), wMax);
  const sh = Math.min(shift, w);

  useEffect(() => {
    if (!play) return undefined;
    const id = setInterval(() => {
      setWidth((cur) => {
        let nx = cur + dirRef.current * (wMax > 20 ? 1 : 0.5);
        if (nx <= wMin) { nx = wMin; dirRef.current = 1; }
        if (nx >= wMax) { nx = wMax; dirRef.current = -1; }
        return nx;
      });
    }, 280);
    return () => clearInterval(id);
  }, [play, wMin, wMax]);

  const pickPreset = (p) => {
    setPreset(p); setPlay(false); setShift(0);
    const d = p === 'custom' ? parseNums(txt) : PRESETS[p].data;
    const s = d.length ? Math.max(...d) - Math.min(...d) : 10;
    setWidth(Math.max(s > 30 ? 1 : 0.5, Math.round((s / 5) * 2) / 2));
  };

  const origin = Math.floor((lo - sh) / w) * w + sh;
  const nb = n ? Math.floor((hi - origin) / w + 1e-9) + 1 : 1;
  const counts = Array(nb).fill(0);
  data.forEach((v) => { const k = Math.min(nb - 1, Math.max(0, Math.floor((v - origin) / w + 1e-9))); counts[k]++; });
  const val = (c) => (mode === 'freq' ? c : mode === 'rel' ? c / (n || 1) : c / ((n || 1) * w));
  const vals = counts.map(val);
  const ymax = Math.max(...vals, 0.0001) * 1.18;
  const tall = Math.max(...counts);
  const sturges = Math.ceil(1 + Math.log2(Math.max(n, 1)));
  const verdict = nb <= 2 ? 'Too few bins: the shape is hidden.' : nb > Math.max(10, n / 1.5) ? 'Too many bins: noisy, gappy bars.' : 'A readable number of bins.';
  const yFmt = (v) => (mode === 'freq' ? v : mode === 'rel' ? `${Math.round(v * 100)}%` : f(v, 3));
  const fmtX = (v) => f(v, 2);

  return (
    <Card title="Histogram builder: same data, different bins" foot="The data never change, but **bin width changes the picture**. Too wide hides shape; too narrow shows noise. Use roughly $\\sqrt{n}$ to $1+\\log_2 n$ bins as a start.">
      <Controls>
        <Seg label="Dataset" value={preset} onChange={pickPreset} options={Object.entries(PRESETS).map(([v, p]) => ({ value: v, label: p.label }))} />
      </Controls>
      {preset === 'custom' && <NumList label="Numbers (comma or space separated)" value={txt} onChange={setTxt} />}
      <Controls>
        <Slider label="Bin width" value={w} onChange={(v) => { setPlay(false); setWidth(v); }} min={wMin} max={wMax} step={wMin} fmt={fmtX} unit={PRESETS[preset].unit ? ` ${PRESETS[preset].unit}` : ''} />
        <Slider label="Bin start shift" value={sh} onChange={setShift} min={0} max={w} step={wMin} fmt={fmtX} />
        <Seg label="Y axis" value={mode} onChange={setMode} options={[{ value: 'freq', label: 'Frequency' }, { value: 'rel', label: 'Relative %' }, { value: 'den', label: 'Density' }]} />
        <Btn kind="ghost" onClick={() => setPlay(!play)} aria-pressed={play}>{play ? 'Pause sweep' : 'Sweep bin width'}</Btn>
      </Controls>
      {n > 0 ? (
        <Plot xDomain={[origin, origin + nb * w]} yDomain={[0, ymax]} xLabel={PRESETS[preset].unit || 'value'} yLabel={mode === 'freq' ? 'frequency' : mode === 'rel' ? 'relative freq.' : 'density'} xTicks={nb <= 14 ? counts.map((_, k) => origin + k * w).concat(origin + nb * w) : undefined} xFmt={fmtX} yFmt={yFmt} ariaLabel="histogram">
          {({ x, y, ih }) => (
            <g>
              {counts.map((c, k) => {
                const x0 = x(origin + k * w), x1 = x(origin + (k + 1) * w), top = y(vals[k]);
                const geo = { x: x0 + 1, y: top, width: Math.max(x1 - x0 - 2, 0.5), height: Math.max(ih - top, 0) };
                return (
                  <g key={k}>
                    <rect {...geo} style={{ ...geo, transition: 'all .3s ease' }} fill="var(--c1)" opacity={c ? 0.85 : 0.15} rx="2" />
                    {nb <= 14 && c > 0 && <text x={(x0 + x1) / 2} y={top - 4} textAnchor="middle" className="lbl-sm" fill="var(--ink)">{mode === 'freq' ? c : mode === 'rel' ? `${Math.round((c / n) * 100)}%` : f(vals[k], 3)}</text>}
                  </g>
                );
              })}
              <line x1={x(mean(data))} x2={x(mean(data))} y1={0} y2={ih} stroke="var(--c2)" strokeWidth="2" strokeDasharray="5 4" />
              <text x={Math.min(x(mean(data)) + 5, 560)} y={12} className="lbl-sm" fill="var(--c2)">x̄ = {f(mean(data), 2)}</text>
            </g>
          )}
        </Plot>
      ) : <p>Enter at least one number.</p>}
      <Readouts>
        <Readout label="n" value={n} />
        <Readout label="Bins" value={nb} />
        <Readout label="Width" value={f(w, 2)} />
        <Readout label="Tallest bin" value={tall} />
        <Readout label="Sturges k" value={sturges} />
        <Readout label="Verdict" value={verdict} tone={verdict.startsWith('A') ? 'good' : 'warn'} />
      </Readouts>
    </Card>
  );
}
