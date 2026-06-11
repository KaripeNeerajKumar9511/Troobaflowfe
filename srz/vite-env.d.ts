/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional Django origin to bypass Vite proxy, e.g. http://127.0.0.1:8000 */
  readonly VITE_API_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
