# Qutara single-engine platform

The user's September 11 specification is authoritative. Qutara is the only AI analysis, signal-generation and automatic virtual-trading engine. Markets and Conservative / Balanced / Active are parameters, never separate products or selectable AI identities.

## Implementation boundaries

The repository currently contains a static corporate website, with no existing trading database or engine. Add a Node 24 application alongside the existing marketing pages, using the existing black, white and red visual language. Preserve the independent visitor application and its unpublished changes.

The six platform routes are /dashboard, /qutara, /virtual-trading, /market-data, /leaderboard and /reports. The root corporate homepage stays available with the same six navigation links. /ai-bots redirects to /qutara. The Qutara route implements the requested three-column console and five record tabs. Leaderboard never invents other participants; reports use the current session's actual ledger.

## Runtime and persistence

Each anonymous browser receives a private, random HttpOnly session cookie; the database stores only its hash. There is one Qutara session per browser, not multiple engines. Node's SQLite database persists QutaraConfig, QutaraSession, QutaraSignal and QutaraDecision, plus virtual orders, completed trades and risk rejections. No legacy trading tables exist to migrate in this repository.

Start, Pause, Resume and Stop preserve the session's virtual ledger. Configuration can be changed while idle/stopped; starting capital cannot rewrite an existing ledger. Runtime counts active intervals. The initial implementation grants seven days of wall-clock trial time from first start. A server restart pauses recovered running sessions, retaining balances and positions and requiring Resume. Pause/Stop suspend all virtual execution; retained positions and this behavior are visible.

## Real data and execution

Use public Coinbase Exchange candles/ticker for cryptocurrency and configurable Alpaca IEX bars/latest trades for stocks. Poll fresh prices every 20 seconds while running; require a quote timestamp within two minutes. Historical bar data is distinct from the live execution quote. AI analysis uses a server-configured Responses API model with strict structured results; no model or provider is exposed as another branded engine. The operator supplies credentials and model configuration outside browser code.

The pipeline is market data -> technical indicators -> Qutara AI analysis -> deterministic confirmation -> risk checks -> internal virtual order/fill -> positions and returns. Credentials absent, network failures, invalid AI results and stale quotes produce explicit non-trading states or rejection records. Never synthesize substitute market data or profits. Exit risk rules run on fresh prices even when AI is unavailable. Virtual cash and reserved exposure bound entries, including virtual shorts. The UI continually identifies all funds, orders, positions and returns as entertainment-only virtual values.

## Validation

Use node:test for configuration validation, lifecycle, pause races, virtual long/short accounting, risk limits, time/freshness handling, provider parsing, SQLite persistence, anonymous session isolation and server routing. Browser validation covers all six routes, configuration, lifecycle, logs, no-data states and desktop/mobile overflow. External AI/stock end-to-end execution requires operator credentials and is reported separately from mocked integration tests.
