import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
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
      '/api': {
        target: process.env.VITE_DEV_API_TARGET ?? 'http://localhost:4000',
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
        target: process.env.VITE_DEV_API_TARGET ?? 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
