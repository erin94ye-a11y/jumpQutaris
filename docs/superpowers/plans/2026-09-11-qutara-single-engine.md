# Qutara Single Engine Implementation Plan

> Execute the user-authorized specification in this shared workspace. Independent agents own non-overlapping files; root integrates and validates.

**Goal:** One Qutara engine, complete virtual workflow, six navigation destinations and consistent site copy.

**Architecture:** CommonJS Node 24 server, SQLite private ledger, plain browser HTML/CSS/JS and server-only providers. Preserve existing corporate routes and independent visitor service.

**Spec:** ../specs/2026-09-11-qutara-single-engine-design.md

- [x] Engine (`qutara/engine.js`, `test/qutara-engine.test.js`): tests first for validation, state transitions, paused in-flight work, deterministic confirmation, bounded long/short fills and risk exits. Export DEFAULT_CONFIG, validateConfig, createSession, transition, tick, calculateIndicators, summarize.
- [x] Frontend (`platform.html`, `platform.css`, `platform.js`): six routes, three-column Qutara console, complete parameters, live chart, same-session metrics and five record tables. Consume /api/qutara/state, /config, /control, /market and /report. No fabricated records.
- [x] Naming (`content.js`, marketing HTML): six global nav labels, Qutara-only analysis and virtual trading claims, matching static metadata and footer links.
- [x] Integration (`qutara/store.js`, `qutara/providers.js`, `qutara/api.js`, `server.js`): write tests for provider validation, session persistence/isolation and endpoint behavior; add real quote adapters, structured AI, private SQLite persistence and background execution.
- [x] Verify: `npm test`, existing visitor tests, syntax checks, full forbidden-name scan, real crypto connectivity probe and browser interaction/desktop/mobile checks. Document service credentials and runtime requirements in README and .env.example.

