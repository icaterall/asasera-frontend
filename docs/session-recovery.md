# Local Google session recovery

Fixed 2026-09-10. Two deterministic regressions reproduced unexpected sign-out:

- A 503, network error or refresh timeout returned the same `null` result as an expired cookie. Startup marked the user anonymous, and an authenticated request cleared its session and navigated to login.
- The refresh promise coordinated callers only inside one JavaScript module. Two tabs could present the same rotating cookie concurrently, causing the backend to reject reuse.

Refresh now returns `null` only for an explicit 401. Temporary failures leave the existing session intact and report a reconnectable error. Startup retries with capped backoff and offers a reconnect button; online/focus events also retry. A successful response restores the user without another Google authorization. An explicitly rejected refreshed request still ends the session without a refresh loop.

Web Locks serialize refresh calls between tabs on the same origin, including fresh development module instances. Tokens remain in memory/httpOnly cookies; no credentials are added to browser storage or messages. Browsers without Web Locks retain the per-module single-flight behavior. If a browser denies lock access before any refresh starts, the same fallback is used. A failed request inside a lock is never repeated as a fallback.

Backend rotation, reuse detection, cookie lifetime and Google identity verification are unchanged. The tests simulate the network boundary and real client behavior; no production login sessions are mutated during verification. Browser visual verification was unavailable.

Regression commands:

```sh
npx vitest run tests/session-recovery.spec.tsx tests/auth-provider-recovery.spec.tsx
npm run test:login-return
npm run build
```
