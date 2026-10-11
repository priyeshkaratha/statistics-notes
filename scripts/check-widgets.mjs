// SSR smoke test: loads each widget (or those matching argv[2]) and renders it with default props. Catches syntax/import/render errors.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import React from 'react';
import { renderToString } from 'react-dom/server';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const only = process.argv[2];
const files = fs.readdirSync(path.join(root, 'src/widgets')).filter((f) => f.endsWith('.jsx') && (!only || f.includes(only)));
const server = await createServer({ root, configFile: false, plugins: [react()], appType: 'custom', server: { middlewareMode: true }, logLevel: 'error' });
let bad = 0;
const log = console.error; console.error = () => {};
for (const f of files) {
  try {
    const mod = await server.ssrLoadModule(`/src/widgets/${f}`);
    if (typeof mod.default !== 'function') throw new Error('no default export function');
    const html = renderToString(React.createElement(mod.default, {}));
    if (html.length < 200) throw new Error('rendered almost nothing');
    if (/NaN|undefined|Infinity/.test(html.replace(/<style[\s\S]*?<\/style>/g, ''))) { console.log(`WARN  ${f}: output contains NaN/undefined/Infinity`); }
    console.log(`ok    ${f} (${html.length} bytes)`);
  } catch (e) { bad++; console.log(`ERROR ${f}: ${e.message.split('\n')[0]}`); }
}
console.error = log;
await server.close();
console.log(bad ? `${bad} widget(s) failing` : `${files.length} widget(s) OK`);
process.exit(bad ? 1 : 0);
