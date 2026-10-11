import { useSyncExternalStore } from 'react';

const KEY = 'statsbook:progress:v1';
let state = { visited: {}, problems: {}, quiz: {}, plan: {} };
try { const raw = localStorage.getItem(KEY); if (raw) state = { ...state, ...JSON.parse(raw) }; } catch (e) { /* storage unavailable */ }

const subs = new Set();
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } };
const emit = () => { persist(); subs.forEach((f) => f()); };
const subscribe = (f) => { subs.add(f); return () => subs.delete(f); };

export const useProgress = () => useSyncExternalStore(subscribe, () => state);

export const progress = {
  visit(key) { if (!state.visited[key]) { state = { ...state, visited: { ...state.visited, [key]: 1 } }; emit(); } },
  toggle(bucket, key) {
    const b = { ...state[bucket] };
    if (b[key]) delete b[key]; else b[key] = 1;
    state = { ...state, [bucket]: b }; emit();
  },
  recordQuiz(id, ok) { state = { ...state, quiz: { ...state.quiz, [id]: ok ? 1 : 0 } }; emit(); },
  reset() { state = { visited: {}, problems: {}, quiz: {}, plan: {} }; emit(); },
};
