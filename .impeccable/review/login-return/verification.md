# Login return destination and visible role

Scope: password login, Google/provider callback, signup completion, expired-session recovery, protected student/account/profile links, public header/footer login links, and the shared signed-in account control.

- A requested same-origin page keeps its query and fragment after login. Without one, teachers go to `/teacher/dashboard` and students to `/student`.
- Teacher-only and student-only destinations respect the authenticated account's stored role. Admin/support fall back to account settings because this frontend has no dashboard for those roles; this also avoids a redirect loop between teacher and student guards.
- Tab-scoped return context survives a normal full-page Google round trip and login/recovery failures. It expires after 30 minutes, is cleared after successful login/sign-out or leaving the authentication flow, and rejects external URLs, authentication/API endpoints, malformed paths and edited storage. If browser storage is blocked, password login retains an in-memory fallback; provider redirects may fall back to the dashboard.
- Subsequent owner correction: remove the role caption below the avatar. The actual account role now selects a 3px gradient frame: teacher green to red, student blue to green. The 48px circular button retains the English/Arabic role in its accessible name, tooltip, dropdown and account settings. It is not inferred from the page being visited.
- The teacher header can wrap controls on narrow screens; the public header accommodates the 48px avatar and uses a smaller signed-in mobile logo. Existing dropdown keyboard behavior and focus treatment are preserved.

Verification: 15 navigation/storage/role-label unit tests passed using `npm run test:login-return`; frontend build/type checks passed. Scoped lint and diff whitespace checks passed after cleanup. The single mechanical design scan found only the pre-existing 18px avatar-initial size outside the documented type ramp; the new 14px role text matches the documented label size.

Browser verification remains unavailable: selecting the current localhost tab through CUA was rejected because the admin-enforced security policy could not be verified. No alternate browser or indirect access was used. Google consent, real browser navigation, mobile/RTL layout, zoom and interactive focus are not claimed as verified.
