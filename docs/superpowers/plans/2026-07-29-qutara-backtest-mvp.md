# Qutara Backtest MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a locally runnable Qutara web application that downloads US daily bars from Alpaca, configures and asynchronously runs a 7–15 trading-day swing strategy, and presents reproducible results.

**Architecture:** Add an isolated `qutara-backtest/` monorepo beside the existing static website. A Next.js client calls a FastAPI modular monolith; Celery performs market-data and backtest work, PostgreSQL stores business records, and DuckDB reads versioned Parquet market data.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, TradingView Lightweight Charts, FastAPI, SQLAlchemy, Alembic, PostgreSQL, Redis, Celery, pandas, NumPy, vectorbt, DuckDB, PyArrow, Alpaca Market Data API, pytest, Vitest, Playwright.

## Global Constraints

- Do not modify or replace existing Jump Qutaris website files.
- First release supports US equities daily bars and regular trading hours only.
- Signals are produced after a bar closes and execute at the next trading-day open.
- Missing market data is never silently forward-filled.
- Backtest results must disclose data range, feed, adjustment mode, trading session, fees, slippage, engine version, and missing-data events.
- Alpaca, PostgreSQL, Redis, and authentication secrets remain server-side environment variables and are never committed.
- Use `npm.cmd` on this Windows machine because PowerShell blocks `npm.ps1`.
- Run tests, lint, type checks, and relevant production builds before each task commit.

---

## File Map

```text
qutara-backtest/
├── apps/web/                         # Next.js UI and browser tests
├── services/api/app/
│   ├── api/                          # HTTP request/response boundary
│   ├── backtest/                     # Pure strategy, execution and metrics code
│   ├── market_data/                  # Alpaca, calendar, Parquet and quality code
│   ├── models/                       # SQLAlchemy persistence models
│   ├── repositories/                 # Database access
│   └── workers/                      # Celery task orchestration
├── services/api/tests/               # Unit, integration and contract tests
├── infra/docker-compose.yml          # PostgreSQL and Redis
├── data/market/                      # Ignored generated Parquet data
├── .env.example
└── README.md
```

### Task 1: Bootstrap the isolated runtime

**Files:**
- Create: `qutara-backtest/package.json`
- Create: `qutara-backtest/apps/web/**` using `create-next-app`
- Create: `qutara-backtest/services/api/pyproject.toml`
- Create: `qutara-backtest/services/api/app/main.py`
- Create: `qutara-backtest/services/api/tests/test_health.py`
- Create: `qutara-backtest/infra/docker-compose.yml`
- Create: `qutara-backtest/.env.example`
- Create: `qutara-backtest/.gitignore`
- Create: `qutara-backtest/README.md`

**Interfaces:**
- Produces: `GET /api/v1/health -> {"status":"ok"}` and local PostgreSQL/Redis services.

- [ ] **Step 1: Scaffold Next.js and Python packages**

Run from `qutara-backtest/`:

```powershell
npm.cmd create next-app@latest apps/web -- --typescript --tailwind --eslint --app --src-dir --use-npm --import-alias "@/*"
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install fastapi uvicorn sqlalchemy alembic psycopg[binary] pydantic-settings celery redis pandas numpy vectorbt duckdb pyarrow alpaca-py exchange-calendars pytest pytest-asyncio httpx ruff mypy
```

- [ ] **Step 2: Write the failing health test**

```python
from fastapi.testclient import TestClient
from app.main import app

def test_health() -> None:
    response = TestClient(app).get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

- [ ] **Step 3: Verify failure, implement the route, and verify pass**

Run: `.\.venv\Scripts\python.exe -m pytest services/api/tests/test_health.py -q`  
Expected before implementation: import or route failure. Implement `FastAPI()` and the exact route, rerun, and expect `1 passed`.

- [ ] **Step 4: Add infrastructure and safe configuration**

Define PostgreSQL 16 and Redis 7 services with named volumes and health checks. `.env.example` must contain names without real values: `DATABASE_URL`, `REDIS_URL`, `ALPACA_API_KEY`, `ALPACA_SECRET_KEY`, `ALPACA_FEED`, `JWT_SECRET`, `MARKET_DATA_ROOT`. Ignore `.env`, `.venv`, `node_modules`, `.next`, coverage, logs and `data/market`.

- [ ] **Step 5: Verify and commit**

Run API pytest, `npm.cmd --prefix apps/web run lint`, and `npm.cmd --prefix apps/web run build`.

```powershell
git add qutara-backtest
git commit -m "build: bootstrap Qutara backtest workspace"
```

### Task 2: Add typed configuration and database foundation

**Files:**
- Create: `services/api/app/config.py`
- Create: `services/api/app/db.py`
- Create: `services/api/app/models/base.py`
- Create: `services/api/alembic.ini`
- Create: `services/api/migrations/env.py`
- Test: `services/api/tests/test_config.py`

**Interfaces:**
- Produces: `Settings`, `get_settings()`, `get_db()` and SQLAlchemy `Base`.

- [ ] **Step 1: Test that secrets are environment-only**

Test `Settings` with monkeypatched variables and assert missing `DATABASE_URL`, `ALPACA_API_KEY`, or `ALPACA_SECRET_KEY` raises a validation error outside test mode.

- [ ] **Step 2: Implement settings and database sessions**

Use `pydantic-settings` with `env_file=".env"`, `extra="ignore"`, and fields matching `.env.example`. Implement a SQLAlchemy engine, `sessionmaker`, and yield-based `get_db()`.

- [ ] **Step 3: Configure Alembic and validate**

Run: `.venv\Scripts\python.exe -m pytest services/api/tests/test_config.py -q` and `.venv\Scripts\python.exe -m mypy services/api/app`.

- [ ] **Step 4: Commit**

```powershell
git add qutara-backtest/services/api qutara-backtest/.env.example
git commit -m "feat: add typed service configuration"
```

### Task 3: Model users, strategies, market manifests and backtests

**Files:**
- Create: `services/api/app/models/user.py`
- Create: `services/api/app/models/strategy.py`
- Create: `services/api/app/models/market_data.py`
- Create: `services/api/app/models/backtest.py`
- Create: `services/api/app/models/__init__.py`
- Create: `services/api/migrations/versions/*_initial_schema.py`
- Test: `services/api/tests/integration/test_schema.py`

**Interfaces:**
- Produces: `User`, `Strategy`, `StrategyVersion`, `Instrument`, `SymbolHistory`, `CorporateAction`, `MarketDataManifest`, `DataQualityEvent`, `BacktestRun`, `BacktestMetric`, `BacktestTrade`, `BacktestSeries`, `BenchmarkResult`.

- [ ] **Step 1: Write schema relationship tests**

Create a user, immutable strategy version, manifest and completed run; assert foreign keys, unique `(strategy_id, version)`, run status enum, and cascade rules. Assert a strategy version cannot be updated through the repository.

- [ ] **Step 2: Run the integration test and confirm failure**

Run: `.venv\Scripts\python.exe -m pytest services/api/tests/integration/test_schema.py -q`  
Expected: model import failure.

- [ ] **Step 3: Implement focused models and migration**

Use UUID primary keys, timezone-aware timestamps, PostgreSQL JSONB for configuration and series, numeric columns for financial values, and indexed foreign keys. Keep OHLCV rows out of PostgreSQL.

- [ ] **Step 4: Apply migration and rerun tests**

Run `alembic upgrade head`, schema tests, Ruff and mypy.

- [ ] **Step 5: Commit**

```powershell
git add qutara-backtest/services/api
git commit -m "feat: add backtest persistence schema"
```

### Task 4: Implement Alpaca daily-bar ingestion

**Files:**
- Create: `services/api/app/market_data/types.py`
- Create: `services/api/app/market_data/alpaca/client.py`
- Create: `services/api/app/market_data/alpaca/errors.py`
- Test: `services/api/tests/market_data/test_alpaca_client.py`

**Interfaces:**
- Produces: `AlpacaBarClient.fetch_daily_bars(symbols, start, end, feed, adjustment, asof) -> list[DailyBar]`.

- [ ] **Step 1: Write contract tests**

Mock HTTP responses for two pages, a `429` with retry headers, a retryable `503`, a `401`, and a partial second-page failure. Assert page tokens are consumed, duplicates rejected, auth errors are not retried, and partial results are never returned as complete.

- [ ] **Step 2: Implement the minimum client**

Send credentials only as `APCA-API-KEY-ID` and `APCA-API-SECRET-KEY` headers. Request `/v2/stocks/bars` with `1Day`, explicit feed and adjustment. Bound retries and raise typed errors containing no secrets.

- [ ] **Step 3: Verify and commit**

Run the market-data tests and Ruff.

```powershell
git add qutara-backtest/services/api/app/market_data qutara-backtest/services/api/tests/market_data
git commit -m "feat: ingest paginated Alpaca daily bars"
```

### Task 5: Add Parquet caching, DuckDB queries and data-quality gates

**Files:**
- Create: `services/api/app/market_data/quality.py`
- Create: `services/api/app/market_data/cache.py`
- Create: `services/api/app/market_data/query.py`
- Create: `services/api/app/market_data/calendar.py`
- Test: `services/api/tests/market_data/test_quality.py`
- Test: `services/api/tests/market_data/test_cache.py`

**Interfaces:**
- Produces: `validate_bars(frame, calendar) -> QualityReport`, `MarketDataCache.write_atomic(...) -> ManifestPayload`, `MarketDataQuery.load(...) -> DataFrame`.

- [ ] **Step 1: Write failing quality tests**

Cover duplicate and unsorted dates, invalid OHLC, negative volume, a missing NYSE session, and a valid early-close day. Assert no function forward-fills missing values.

- [ ] **Step 2: Write failing cache tests**

Assert Hive-style partitions, checksums, atomic rename, raw/adjusted separation, query range filtering and refusal to load a failed-quality partition.

- [ ] **Step 3: Implement quality, cache and query modules**

Use `exchange_calendars` for XNYS sessions, PyArrow for Parquet writes and DuckDB for reads. Persist a JSON manifest containing provider, feed, adjustment, range, files, checksums, fetch time and quality status.

- [ ] **Step 4: Verify and commit**

Run both test modules plus mypy and Ruff.

```powershell
git add qutara-backtest/services/api/app/market_data qutara-backtest/services/api/tests/market_data
git commit -m "feat: add audited Parquet market cache"
```

### Task 6: Implement indicators and leak-free signal generation

**Files:**
- Create: `services/api/app/backtest/config.py`
- Create: `services/api/app/backtest/indicators.py`
- Create: `services/api/app/backtest/signals.py`
- Test: `services/api/tests/backtest/test_signals.py`

**Interfaces:**
- Produces: `StrategyConfig`, `compute_indicators(frame, config) -> DataFrame`, `build_entry_signals(frame, config) -> Series[bool]`.

- [ ] **Step 1: Write future-leakage tests**

Build deterministic OHLCV fixtures. Generate signals, mutate every row after date D, regenerate, and assert all signals through D are identical. Assert an entry signal on D produces no executable entry on D.

- [ ] **Step 2: Write indicator-condition tests**

Cover MA cross, RSI threshold, volume breakout, AND/OR composition, insufficient warm-up bars and NaN rejection.

- [ ] **Step 3: Implement typed configuration and signals**

Validate holding days within 7–15 for the default swing mode. Compute rolling indicators from current and prior closes; return close-confirmed signals separately from execution timing.

- [ ] **Step 4: Verify and commit**

Run signal tests, Ruff and mypy.

```powershell
git add qutara-backtest/services/api/app/backtest qutara-backtest/services/api/tests/backtest
git commit -m "feat: add leak-free swing signals"
```

### Task 7: Implement daily execution and risk exits

**Files:**
- Create: `services/api/app/backtest/execution.py`
- Create: `services/api/app/backtest/portfolio.py`
- Test: `services/api/tests/backtest/test_execution.py`

**Interfaces:**
- Produces: `simulate(frame, entry_signals, config, corporate_actions) -> SimulationResult` containing trades, cash and equity series.

- [ ] **Step 1: Test next-open execution and costs**

Assert a close signal enters at the next session open plus configured slippage, fees reduce cash exactly once, position sizing respects available cash and portfolio caps, and a volume participation cap limits quantity.

- [ ] **Step 2: Test stop and holding semantics**

Cover open gaps, stop/target collision using stop-first, trailing stops based only on prior bars, and exits on exactly the 7th and 15th trading day.

- [ ] **Step 3: Test corporate actions**

Assert a 2-for-1 split doubles shares and halves reference price without changing equity, and a cash dividend is credited once.

- [ ] **Step 4: Implement the simulator**

Keep execution deterministic and independent of FastAPI/SQLAlchemy. Store exit reason, raw fill, slippage, fee, holding days and realized PnL on every trade.

- [ ] **Step 5: Verify and commit**

Run all backtest tests, Ruff and mypy.

```powershell
git add qutara-backtest/services/api/app/backtest qutara-backtest/services/api/tests/backtest
git commit -m "feat: simulate conservative daily execution"
```

### Task 8: Calculate metrics and benchmarks

**Files:**
- Create: `services/api/app/backtest/metrics.py`
- Create: `services/api/app/backtest/benchmark.py`
- Test: `services/api/tests/backtest/test_metrics.py`

**Interfaces:**
- Produces: `calculate_metrics(equity, trades, sessions) -> BacktestMetrics` and `compare_benchmark(equity, benchmark_close) -> BenchmarkComparison`.

- [ ] **Step 1: Write numerical fixture tests**

Use hand-calculated equity and trades to assert total return, CAGR, win rate, profit factor, max drawdown, annualized Sharpe and trade count. Cover zero volatility, no trades, all winners and all losers.

- [ ] **Step 2: Implement metrics and aligned benchmarks**

Align strategy and benchmark on the intersection of valid sessions without filling missing prices. Annualize daily Sharpe with `sqrt(252)` and document a zero risk-free rate in MVP assumptions.

- [ ] **Step 3: Verify and commit**

Run metrics tests and full backtest suite.

```powershell
git add qutara-backtest/services/api/app/backtest qutara-backtest/services/api/tests/backtest
git commit -m "feat: calculate backtest and benchmark metrics"
```

### Task 9: Orchestrate idempotent Celery backtests

**Files:**
- Create: `services/api/app/workers/celery_app.py`
- Create: `services/api/app/workers/backtest_task.py`
- Create: `services/api/app/repositories/backtests.py`
- Test: `services/api/tests/workers/test_backtest_task.py`

**Interfaces:**
- Produces: `run_backtest_task(run_id: UUID)`, durable run states `queued|fetching_data|running|completed|failed`.

- [ ] **Step 1: Write orchestration tests**

Assert state transitions, idempotent retry of a completed run, recovery after data-fetch failure, no partial completed result, and sanitised error persistence.

- [ ] **Step 2: Implement the task pipeline**

Load the immutable strategy version, resolve data through the manifest/cache layer, simulate, compute benchmark and atomically store metrics, trades and series. Bind `engine_version` and manifest ID before completion.

- [ ] **Step 3: Verify and commit**

Run worker tests and integration tests with eager Celery mode.

```powershell
git add qutara-backtest/services/api/app/workers qutara-backtest/services/api/app/repositories qutara-backtest/services/api/tests/workers
git commit -m "feat: run idempotent asynchronous backtests"
```

### Task 10: Expose authenticated strategy and backtest APIs

**Files:**
- Create: `services/api/app/auth/**`
- Create: `services/api/app/api/schemas/**`
- Create: `services/api/app/api/routes/auth.py`
- Create: `services/api/app/api/routes/instruments.py`
- Create: `services/api/app/api/routes/strategies.py`
- Create: `services/api/app/api/routes/backtests.py`
- Modify: `services/api/app/main.py`
- Test: `services/api/tests/api/test_backtests.py`

**Interfaces:**
- Produces: versioned `/api/v1` endpoints from the design specification; `POST /backtests` returns HTTP 202 and a run ID.

- [ ] **Step 1: Write API authorization and validation tests**

Cover registration/login, password hashing, owner-only strategy access, immutable versions, holding days outside 7–15, invalid date ranges, excessive symbol count, and cross-user run access.

- [ ] **Step 2: Write lifecycle contract test**

Create a strategy, create a version, submit a run, retrieve status, metrics, trades, series and assumptions. Assert responses never contain secrets.

- [ ] **Step 3: Implement routes and schemas**

Use strict Pydantic models. Keep worker submission behind a service function so API tests can replace it. Return structured error codes and actionable messages.

- [ ] **Step 4: Verify and commit**

Run API, integration and security-focused tests, Ruff and mypy.

```powershell
git add qutara-backtest/services/api
git commit -m "feat: expose secure backtest APIs"
```

### Task 11: Build the selected Qutara research-workbench UI

**Prerequisite:** Complete Product Design ideation, user selection, `image-to-code`, and visual target capture before this task starts.

**Files:**
- Create: `apps/web/src/features/strategy-builder/**`
- Create: `apps/web/src/features/market-chart/**`
- Create: `apps/web/src/features/backtest-results/**`
- Create: `apps/web/src/features/strategy-library/**`
- Create: `apps/web/src/lib/api.ts`
- Modify: `apps/web/src/app/page.tsx`
- Test: `apps/web/src/**/*.test.tsx`

**Interfaces:**
- Consumes: typed `/api/v1` strategy, market-data and backtest responses.
- Produces: desktop three-column workspace and tablet parameter drawer.

- [ ] **Step 1: Add frontend test and chart dependencies**

Install Lightweight Charts, TanStack Query, React Hook Form, Zod, Vitest, Testing Library and Playwright. Configure unit tests without weakening TypeScript strictness.

- [ ] **Step 2: Write failing workflow component tests**

Test parameter validation, submit-disabled states, task progress, completed metrics, disclosed assumptions, missing-data failure, strategy save and rerun.

- [ ] **Step 3: Implement API client and state flow**

Keep the API base URL in `NEXT_PUBLIC_API_BASE_URL`; no private key may use a `NEXT_PUBLIC_` prefix. Poll queued/running tasks with bounded intervals and stop polling on completed or failed.

- [ ] **Step 4: Implement the selected visual target**

Match the chosen mockup at 1440×1024, then implement the tablet state. Render candlesticks, volume and markers with Lightweight Charts; render equity, drawdown and benchmark without decorative fake data.

- [ ] **Step 5: Verify accessibility and build**

Run unit tests, ESLint, TypeScript, production build and Playwright at desktop/tablet viewports. Verify keyboard access, focus visibility and non-color trade markers.

- [ ] **Step 6: Commit**

```powershell
git add qutara-backtest/apps/web
git commit -m "feat: build Qutara backtest workbench"
```

### Task 12: Prove the end-to-end MVP and finish documentation

**Files:**
- Create: `services/api/tests/e2e/test_seeded_backtest.py`
- Create: `infra/scripts/init.ps1`
- Create: `infra/scripts/seed_demo.py`
- Modify: `qutara-backtest/README.md`
- Create: `qutara-backtest/docs/data-assumptions.md`
- Create: `qutara-backtest/docs/api-contract.md`

**Interfaces:**
- Produces: reproducible local startup and a seeded end-to-end backtest independent of live Alpaca availability.

- [ ] **Step 1: Add a deterministic end-to-end fixture**

Store a small generated test dataset under `services/api/tests/fixtures/`, not production market data. Test data ingest, strategy creation, queued execution, metrics, trades and result retrieval.

- [ ] **Step 2: Document exact startup**

README commands must cover copying `.env.example`, starting PostgreSQL/Redis, applying migrations, starting FastAPI, Celery and Next.js, seeding demo data, and running every test/build command. Document the `npm.cmd` Windows requirement.

- [ ] **Step 3: Run the complete verification matrix**

```powershell
.\.venv\Scripts\python.exe -m pytest services/api/tests -q
.\.venv\Scripts\python.exe -m ruff check services/api
.\.venv\Scripts\python.exe -m mypy services/api/app
npm.cmd --prefix apps/web test -- --run
npm.cmd --prefix apps/web run lint
npm.cmd --prefix apps/web run build
npm.cmd --prefix apps/web exec playwright test
```

Expected: every command exits 0. Start all services and manually run one Alpaca-backed AAPL strategy against SPY; verify data assumptions and quality events appear in the UI.

- [ ] **Step 4: Commit final delivery documentation**

```powershell
git add qutara-backtest
git commit -m "docs: complete Qutara MVP runbook"
```

## Final Acceptance Gate

- Existing website diff is empty.
- Fresh setup can start Web, API, Worker, PostgreSQL and Redis.
- Real Alpaca daily bars can be downloaded and reused from Parquet.
- The strategy-to-result path works without direct database manipulation.
- Core no-lookahead, exits, costs, holding-period and corporate-action tests pass.
- Results expose all required metrics, charts, trades, benchmark and assumptions.
- Repository contains no real credentials or generated market data.
- Desktop and tablet implementations match the selected visual target after Product Design QA.
