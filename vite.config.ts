import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const localEnv = loadEnv(mode, import.meta.dirname, 'VITE_')
  const apiTarget = localEnv.VITE_DEV_API_TARGET || 'http://localhost:4000'
  return {
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    /*
     * KEEP TEST OUTPUT OUT OF THE WATCHER.
     *
     * Playwright writes traces, screenshots and its HTML report into the
     * project while a test is running. Vite's watcher sees each new file and
     * issues a full page reload — dozens of them inside a single test.
     *
     * That is not merely noisy. Every reload re-runs the app's silent refresh,
     * the backend ROTATES the refresh token on each use and treats a second
     * presentation of a rotated one as theft, so a burst of reloads revokes
     * the token family and every later request answers 401. The symptom is a
     * browser test that cannot stay signed in, and the cause is nowhere near
     * the authentication code.
     */
    watch: {
      ignored: [
        '**/e2e/.artifacts/**',
        '**/playwright-report/**',
        '**/test-results/**',
        '**/.playwright-artifacts-*/**',
      ],
    },

    /*
     * Development calls the API on the same origin and Vite forwards it.
     *
     * This is not only convenience. Same-origin means the browser sends the
     * auth cookie without SameSite or credentials caveats, and it means a
     * broken CORS allowlist cannot be papered over locally and then discovered
     * in production — the deployed build is the only one making a
     * cross-origin call, and it is the one the allowlist exists for.
     *
     * VITE_DEV_API_TARGET points this somewhere else when you want the local
     * front end against a deployed API.
     */
    proxy: {
      '/socket.io': {
        target: apiTarget,
        changeOrigin: true,
        ws: true,
      },
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
      },
      /*
       * Facebook sign-in lives at the ROOT of the backend host, not under
       * /api, because its redirect URI is registered in Meta's app console and
       * must not move when the API version does. So it needs its own proxy
       * entry or the dev server would answer /auth/facebook with the SPA.
       *
       * Scoped to '/auth/facebook' and not '/auth': the app's own
       * /auth/callback route is a real SPA page, and proxying it away would
       * break the end of every sign-in in development.
       */
      '/auth/facebook': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  }
})
