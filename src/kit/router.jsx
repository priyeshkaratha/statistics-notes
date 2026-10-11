import { useEffect, useState } from 'react';

const read = () => (window.location.hash.replace(/^#/, '') || '/');
export function usePath() {
  const [path, setPath] = useState(read);
  useEffect(() => {
    const on = () => { setPath(read()); window.scrollTo({ top: 0 }); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return path;
}
export const go = (p) => { window.location.hash = p; };
export const Link = ({ to, children, className, ...r }) => <a href={`#${to}`} className={className} {...r}>{children}</a>;
