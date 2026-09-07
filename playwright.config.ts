import { defineConfig, devices } from '@playwright/test'

/**
 * Plan §17 (p31): Playwright for the end-to-end journeys and for the visual
 * pass — «كل مكوّن في وضعين واتجاهين» (every component in two modes and two
 * directions).
 *
 * `webServer` is deliberately NOT configured to start vite. A dev server is
 * already running on 5199 for this task, and a config that races to start a
 * second one on a taken port fails in a way that reads like a test failure.
 * Point PW_BASE_URL somewhere else to run against another instance.
 */
export default defineConfig({
  testDir: './e2e',
  /* Under the project so it is gitignored with one rule, and excluded from
     Vite's watcher in vite.config.ts — see the note there. */
  outputDir: './e2e/.artifacts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: process.env.PW_BASE_URL ?? 'http://127.0.0.1:5199',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})
