# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: capture.spec.ts >> capture editor-authored-1440.png
- Location: e2e/capture.spec.ts:43:1

# Error details

```
Error: Command failed: /opt/homebrew/Cellar/node/24.10.0/bin/node --disable-warning=ExperimentalWarning scripts/v4/seed-browser-account.ts /tmp/asasera-browser-1c32aff5-fb3e-4cd3-aa21-436adbab5077.json
file:///Users/ashrafqahman/MyWork/ReactAsas/Web-App/asasera-backend/tests/test-database.mjs:12
  throw new Error('Fixture tests require a dedicated database with "test" in its name (for example asasera_test). The application database is not a test destination.')
        ^

Error: Fixture tests require a dedicated database with "test" in its name (for example asasera_test). The application database is not a test destination.
    at file:///Users/ashrafqahman/MyWork/ReactAsas/Web-App/asasera-backend/tests/test-database.mjs:12:9
    at ModuleJob.run (node:internal/modules/esm/module_job:377:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:691:26)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)

Node.js v24.10.0

```