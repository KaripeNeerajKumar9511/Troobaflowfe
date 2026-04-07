/**
 * Django session API: credentials + CSRF for mutating requests.
 *
 * Development: calls `http://<page-hostname>:8000` directly (bypasses Vite proxy).
 * That avoids proxy 404s and still works with CSRF/session: host-only cookies for `localhost`
 * (and `127.0.0.1`) are shared across ports 8080 and 8000.
 *
 * Production (`vite build`): empty origin → same-origin `/api/...` (reverse proxy to Django).
 *
 * Override: set `VITE_API_ORIGIN` in `.env` (e.g. force `http://127.0.0.1:8000`).
 */
function devDjangoOrigin(): string {
  if (typeof window === "undefined") return "";
  const h = window.location.hostname;
  if (h === "[::1]" || h === "::1") return "http://127.0.0.1:8000";
  return `http://${h}:8000`;
}

function getApiOrigin(): string {
  const explicit = import.meta.env.VITE_API_ORIGIN;
  if (typeof explicit === "string" && explicit.trim() !== "") {
    return explicit.trim().replace(/\/$/, "");
  }
  if (import.meta.env.DEV) {
    return devDjangoOrigin();
  }
  return "";
}

/** Absolute browser URL for an API path (path must start with `/`). */
export function resolveApiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const origin = getApiOrigin();
  return origin ? `${origin}${p}` : p;
}

export const AUTH_CSRF = "/api/auth/csrf/";
export const AUTH_PROFILE = "/api/auth/profile/";
export const AUTH_LOGIN = "/api/auth/login/";
export const AUTH_SIGNUP = "/api/auth/signup/";
export const AUTH_LOGOUT = "/api/auth/logout/";

function readCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.$?*|{}()[\]\\/+^]/g, '\\$&')}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

let csrfPrimed = false;

export async function ensureApiCsrf(): Promise<void> {
  if (csrfPrimed) return;
  const res = await fetch(resolveApiUrl(AUTH_CSRF), { credentials: "include" });
  if (res.ok) csrfPrimed = true;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method || 'GET').toUpperCase();
  const headers = new Headers(init.headers);
  if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
    await ensureApiCsrf();
    const token = readCookie('csrftoken');
    if (token) headers.set('X-CSRFToken', token);
    if (!headers.has('Content-Type') && init.body && typeof init.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }
  }
  return fetch(resolveApiUrl(path), { ...init, credentials: "include", headers });
}

export async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, init);
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!res.ok) {
    try {
      const j = JSON.parse(text);
      throw new Error(j.error || j.detail || text || res.statusText);
    } catch (e) {
      if (e instanceof Error && e.message !== '[object Object]') throw e;
      throw new Error(text || res.statusText);
    }
  }
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
