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
export const PROFILE_ORGS = "/api/profile/organizations/";
export const PROFILE_SET_ACTIVE_ORG = "/api/profile/organizations/active/";

export const ADMIN_LOGIN = "/api/admin/login/";
export const ADMIN_LOGOUT = "/api/admin/logout/";
export const ADMIN_ME = "/api/admin/me/";
export const ADMIN_STATS = "/api/admin/stats/";
export const ADMIN_USERS = "/api/admin/users/";
export const ADMIN_ORGS = "/api/admin/organizations/";
export const ADMIN_ORG_CREATE = "/api/admin/organizations/create/";
export const ADMIN_PASSWORD_ORGS = "/api/admin/passwords/organizations/";
export const adminOrgDetail = (orgId: string) => `/api/admin/organizations/${orgId}/`;
export const adminOrgMembers = (orgId: string) => `/api/admin/organizations/${orgId}/members/`;
export const adminOrgMemberCreate = (orgId: string) => `/api/admin/organizations/${orgId}/members/create/`;
export const adminOrgDelete = (orgId: string) => `/api/admin/organizations/${orgId}/delete/`;
export const adminOrgDeactivate = (orgId: string) => `/api/admin/organizations/${orgId}/deactivate/`;
export const adminOrgActivate = (orgId: string) => `/api/admin/organizations/${orgId}/activate/`;
export const adminOrgMemberDelete = (orgId: string, userId: number | string) =>
  `/api/admin/organizations/${orgId}/members/${userId}/delete/`;
export const adminOrgMemberDeactivate = (orgId: string, userId: number | string) =>
  `/api/admin/organizations/${orgId}/members/${userId}/deactivate/`;
export const adminOrgMemberActivate = (orgId: string, userId: number | string) =>
  `/api/admin/organizations/${orgId}/members/${userId}/activate/`;
export const adminOrgPasswords = (orgId: string) => `/api/admin/passwords/organizations/${orgId}/`;
export const adminUserCredential = (userId: number | string) => `/api/admin/users/${userId}/credential/`;
export const adminUserPassword = (userId: number | string) => `/api/admin/users/${userId}/password/`;
export const adminUserDetail = (userId: number | string) => `/api/admin/users/${userId}/`;
export const adminUserDelete = (userId: number | string) => `/api/admin/users/${userId}/delete/`;
export const adminModelDetail = (userId: number | string, modelId: string) =>
  `/api/admin/users/${userId}/models/${modelId}/`;
export const adminOrgMemberDetail = (orgId: string, userId: number | string) =>
  `/TF-admin/organizations/${orgId}/members/${userId}`;
export const adminOrgMemberModel = (orgId: string, userId: number | string, modelId: string) =>
  `/TF-admin/organizations/${orgId}/members/${userId}/models/${modelId}`;

function readCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.$?*|{}()[\]\\/+^]/g, '\\$&')}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

let csrfPrimed = false;

export async function ensureApiCsrf(): Promise<void> {
  if (csrfPrimed) return;
  const res = await fetch(resolveApiUrl(AUTH_CSRF), { credentials: "include" });
  const data = await res.json();
console.log("res for csrf data", data);
  if (res.ok) csrfPrimed = true;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method || 'GET').toUpperCase();
  const headers = new Headers(init.headers);
  if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
    await ensureApiCsrf();
    
    const token = readCookie('csrftoken');
    console.log('token', token);
    const csrf= headers.get('csrftoken')
    console.log('csrf', csrf);
    if (token) headers.set('X-CSRFToken', token);
    else if(csrf) headers.set('X-CSRFToken', csrf);
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
  const parseJson = (raw: string): unknown => {
    try {
      return JSON.parse(raw);
    } catch (firstErr) {
      // Some simulation responses can contain non-JSON numeric literals from native code output.
      // Convert them to null so the frontend can still consume valid fields.
      const sanitized = raw
        .replace(/-?Infinity/gi, 'null')
        .replace(/-?NaN(?:\(ind\))?/gi, 'null')
        .replace(/-?\d+\.\#(?:IND|QNAN)/gi, 'null');
      if (sanitized !== raw) {
        try {
          console.warn(`[apiJson] Sanitized invalid numeric JSON tokens for ${path}`);
          return JSON.parse(sanitized);
        } catch {
          // Fall through and throw the original parse error with context.
        }
      }
      const preview = raw.slice(0, 240).replace(/\s+/g, ' ');
      const errMsg = firstErr instanceof Error ? firstErr.message : 'Unknown JSON parse error';
      throw new Error(`Invalid JSON from ${path}: ${errMsg}. Response preview: ${preview || '<empty>'}`);
    }
  };
  if (!res.ok) {
    try {
      const j = parseJson(text) as { error?: string; detail?: string };
      throw new Error(j?.error || j?.detail || text || res.statusText);
    } catch (e) {
      if (e instanceof Error && e.message !== '[object Object]') throw e;
      throw new Error(text || res.statusText);
    }
  }
  if (!text) return undefined as T;
  return parseJson(text) as T;
}
