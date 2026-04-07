import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Match `VITE_API_ORIGIN` / `api.ts` so relative `/api` fallbacks hit the same Django port (e.g. 8001).
  const apiProxyTarget =
    (env.VITE_API_ORIGIN && env.VITE_API_ORIGIN.replace(/\/$/, "")) ||
    "http://127.0.0.1:8001";

  return {
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      // String "/api" forwards /api, /api/auth/..., /api/models/... (regex "^/api" can fail in some Vite versions → 404).
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
};
});
