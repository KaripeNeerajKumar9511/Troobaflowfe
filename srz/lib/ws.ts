import { resolveApiUrl } from '@/lib/api';

function httpToWs(url: string): string {
  if (url.startsWith('https://')) return `wss://${url.slice('https://'.length)}`;
  if (url.startsWith('http://')) return `ws://${url.slice('http://'.length)}`;
  // relative path -> same origin
  if (typeof window !== 'undefined') {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}${url.startsWith('/') ? url : `/${url}`}`;
  }
  return url;
}

export function resolveWsUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  const explicit = import.meta.env.VITE_WS_ORIGIN as string | undefined;
  if (explicit && explicit.trim()) {
    const base = explicit.trim().replace(/\/$/, '');
    return httpToWs(`${base}${p}`);
  }
  // Derive from API origin (dev: http://host:8000, prod: same-origin "")
  const api = resolveApiUrl('/'); // returns origin or "/"
  if (api.startsWith('http')) {
    return httpToWs(api.replace(/\/$/, '') + p);
  }
  return httpToWs(p);
}

