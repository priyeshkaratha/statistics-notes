# Widget guide

Widget = `src/widgets/<PascalName>.jsx`, `export default function Name(props)`. Must be self-contained React + SVG (no chart libs).
Import only from: `react`, `../kit/controls.jsx`, `../kit/plot.jsx`, `../kit/rich.jsx`, `../lib/stats.js`.

## Kit
- `Card({ title, tag='Interactive', foot, children })` — wrapper with header. `foot` is a one-sentence takeaway (inline markup).
- `Controls`, `Slider({label,value,onChange,min,max,step,fmt,unit})`, `Seg({options,value,onChange})`, `Btn({kind:'primary'|'ghost',onClick})`, `Readouts`/`Readout({label,value,tone:'good'|'bad'|'warn'})`, `NumList({label,value,onChange})`, `parseNums(str)`, `f(v,d)` number formatter.
- `Plot({ w,h,m, xDomain,yDomain, xLabel,yLabel, xTicks,yTicks, xFmt,yFmt, children })` where children is `({x,y,iw,ih}) => <g>…</g>` with `x()` and `y()` scale fns (domain → pixels, `x.invert`). Helpers `linePath(points)`, `areaPath(points, baseY)`, `scaleLinear`, `ticks`.
- CSS classes for SVG: `grid axis tick axislabel lbl lbl-sm`. Colours via CSS vars: `var(--c1)` blue, `--c2` red, `--c3` green, `--c4` amber, `--c5` purple, `--ink`, `--muted`, `--line`, `--surface2`. Always use the vars (dark mode).
- `Rich({text})`, `M({tex, display})` for text/math inside widgets.

## Quality bar
- Animation must teach: a slider that morphs a distribution, a "Play" button that steps through a procedure (use `useEffect` + `setInterval`/`requestAnimationFrame` with cleanup), draggable points (pointer events on the SVG; use `touch-action:none` which `.plot` already has), sampling simulations with `seededRandom` (so the first render is deterministic) plus a "Resample" button.
- Show live numbers (readouts) so the student can verify against hand computation.
- Mobile: SVG uses viewBox so it scales; controls wrap. Keep min touch targets ~32px.
- Respect `prefers-reduced-motion` for autoplay (start paused).
- No localStorage, no network. No console errors. Keep each widget < ~250 lines.
- `foot` must state the one idea to remember.
