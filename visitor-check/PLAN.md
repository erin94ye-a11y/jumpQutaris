# Visitor check implementation

Current scope (supersedes the earlier consent flow): minimal white page with a visible automatic-recording notice, automatic access records, browser environment enrichment, IP network intelligence, and a private administrator dashboard. The user explicitly requested automatic recording and approved completing the ipapi.is integration without a key for now.

## Automatic recording revision

Latest UI revision: English base copy across both pages with automatic device-language matching for en/zh/es/fr/de/ja, English fallback, a saved manual language selector, and a temporary `?lang=` preview override. Shared locale logic must not mutate the recorded browser language or issue new visit updates when display language changes. Existing automatic-recording and authentication behavior remains covered by integration tests.

- [x] Write failing integration tests for GET-page baseline recording, same-record token updates, asynchronous geolocation preserving device fields, and no resurrection of deleted records.
- [x] Save the baseline before returning HTML; embed a short-lived per-record token, maintain same-origin validation, and run lookup independently of page rendering.
- [x] Integrate keyed ipapi.is with strict unknown detection semantics; retain IP geolocation fallback without a key. Verify overlapping VPN/mobile/hosting signals and quota cooldown with deterministic tests.
- [x] Remove consent controls, keep concise disclosure, add network classification/status/source to the private dashboard, and preserve old consent records as historical data.
- [x] Browser-check automatic submission, language switch, disclosure, admin login and unconfigured/local network states. Tests use fixtures for keyed responses because no user key is available.

The remaining sections document the original delivered version, retained as implementation history. Current behavior and configuration are described in README.md.

## Design

- Public `/`: English by default, Chinese selectable. Explicit disclosure of IP geolocation provider, collected fields, 30-day retention, and limits of inference. Decline sends no collection request. Browser environment is read for submission only after consent.
- `POST /api/visits`: enforce JSON, same-origin, consent version, body limit, input allowlist and rate limit. IP comes from the socket by default. Optional trusted proxy hop count is explicitly configured. Lookup via HTTPS ipwho.is has a timeout; failures are stored as unavailable, not guessed.
- `/admin`: password login, HttpOnly SameSite session cookie, eight-hour expiry, logout invalidation, request throttling. List with pagination, full record details, deletion. No nationality score.
- SQLite persistence in a non-public directory, 30-day retention. Serve only named public assets. Deny access to this entire folder from the existing static website server.
- Node 24 or newer, no installed runtime dependencies. Local setup generates a random password, production requires an explicit password and HTTPS public origin. Deploy as a separate application with persistent storage.

## Implementation sequence

- [x] Write and run API integration tests covering consent, persistence, authorization, cross-origin rejection, forged forwarding headers, malformed input, private file access, lookup failure, logout, and deletion.
- [x] Implement `server.js` and `geo.js`, then run `node --test visitor-check/test/*.test.js`.
- [x] Build `public/index.html`, `public/visit.js`, `public/admin.html`, `public/admin.js`, `public/style.css` with visible success/failure/empty/loading states and responsive layout.
- [x] Test consent/decline/login/details/logout through the browser and inspect desktop/mobile layout. Check deletion confirmation in the UI; actual deletion is covered by the API test.
- [x] Document local startup, proxy configuration, HTTPS, storage, provider limitations and deployment; rerun tests and review changes.

Validation uses disposable test databases and synthetic records. No external deployment is performed until server details are supplied.
