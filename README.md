# Jump Qutaris Website

Jump Qutaris corporate website and the Qutara virtual trading platform. Qutara is the only AI analysis, signal-generation and automatic virtual-trading engine. Its markets and risk levels are parameters of the same engine. All orders, funds, positions and returns are internal entertainment values.

The platform requires **Node.js 24+** and a persistent writable disk for SQLite. It uses plain HTML/CSS/JavaScript with no package dependencies. Static-only hosting cannot run its API, AI analysis or virtual ledger.

## Pages

- `/dashboard`: Qutara account overview
- `/qutara`: three-column Qutara console and configuration
- `/virtual-trading`: current virtual positions and execution records
- `/market-data`: real market data and service connection status
- `/leaderboard`: current-session statistics; no fabricated participants
- `/reports`: Qutara Performance and downloadable completed-trade CSV
- `/`: home page
- `/company`: company overview
- `/technology`: Qutara technology platform
- `/research`: financial AI research
- `/leadership`: leadership team
- `/contact`: contact form and email links
- `/privacy-policy`: privacy policy
- `/terms-of-use`: terms of use
- `/cookie-policy`: cookie policy

The underlying `.html` files remain in the repository for static hosting compatibility. On Railway, `server.js` redirects public `.html` URLs to the clean URLs above.

The old `/ai-bots` route redirects to `/qutara` and has no selection page. Every page has the same six platform navigation labels.

## Edit Content

Most visible content lives in `content.js`.

Update these common fields:

- Brand name and short description: `brand`
- Header navigation: `nav`
- Header careers button: `headerCta`
- Home page sections: `home`
- Subpage content: `pages.trading`, `pages.technology`, `pages.people`, `pages.careers`, `pages.contact`, `pages.privacy`, `pages.terms`, `pages.cookie`
- Footer columns and social links: `footer`

The header logo uses `assets/jump-qutaris-logo.png`, and the black footer uses `assets/jump-qutaris-logo-footer.png`. Logo sizing is controlled in `styles.css`.

## Preview Locally

From this folder, run:

```bash
npm start
```

Then open:

```text
http://localhost:4173
```

Open `http://localhost:4173/qutara` for the console. The public cryptocurrency market chart works without credentials. Start/Resume require the server-side analysis connection; stock markets additionally require the stock-data connection. Missing services show explicit messages and do not produce synthetic signals or virtual trades.

## Service Configuration

Copy `.env.example` to `.env` and configure:

- `OPENAI_API_KEY` and `QUTARA_AI_MODEL`: a Responses API model supporting structured outputs. These values stay on the server; customers interact with Qutara only. The AI receives recent market candles, indicators, timeframe and risk level, never browser identifiers or virtual account balances. Responses use `store: false`.
- `ALPACA_API_KEY` and `ALPACA_SECRET_KEY`: read access to U.S. stock market data. The adapter uses IEX; this is not consolidated full-market coverage. No broker order API exists in this application.
- `QUTARA_DATA_DIR`: optional durable database directory. Default: `qutara/data`. Mount a persistent volume here in hosted environments.
- `PORT`: HTTP port (default `4173`).

Cryptocurrency uses public [Coinbase candles](https://docs.cdp.coinbase.com/api-reference/exchange-api/rest-api/products/get-product-candles) and [ticker](https://docs.cdp.coinbase.com/api-reference/exchange-api/rest-api/products/get-product-ticker). Stock data uses [Alpaca historical bars](https://docs.alpaca.markets/us/v1.4.2/reference/stockbarsingle-1) and [latest trades](https://docs.alpaca.markets/us/reference/stocklatesttrades-1). Prices are polled every 20 seconds; candles refresh at most once per minute. This is polling, not a tick-by-tick streaming feed. Quotes over two minutes old, invalid quotes, failed services and incomplete candles cannot create entries. Stock markets may be closed or IEX may have no recent trade.

Qutara analysis uses the [Responses structured-output format](https://developers.openai.com/api/docs/guides/structured-outputs); model output must pass independent SMA20/SMA50, RSI14, confidence, exposure, cash and short-permission checks. Automatic risk exits handle stop loss, take profit, trailing stop and maximum holding time with fresh market quotes. All fills are immediate internal virtual accounting at the sampled price; no fees, slippage, queueing or brokerage execution are modeled.

## Sessions, State and Metrics

- Each browser has one private Qutara session, identified by a random HttpOnly/SameSite cookie. Another browser starts a separate session; there is no account login or cross-device recovery yet. This is a local/single-instance implementation; public production use requires account authentication, abuse controls and operator-selected service limits.
- SQLite tables: `QutaraConfig`, `QutaraSession`, `QutaraSignal`, `QutaraDecision`, `VirtualOrder`, `VirtualTrade`, `RiskRejection`. This repository had no legacy trading database to migrate. The browser shows the newest 500 records per category; SQLite retains history and CSV exports all persisted completed trades for the current session.
- Start/Pause/Resume/Stop use the same session and preserve the ledger. Pause/Stop suspend execution and retain positions. A restart recovers running sessions as paused and requires Resume; downtime is not counted as runtime or backfilled with trades.
- Parameters can be saved while idle/stopped. Existing positions retain their parameters; starting capital cannot be rewritten after the trial starts. Risk levels are Conservative, Balanced and Active, passed to the same Qutara analysis workflow.
- Trial time is initially seven wall-clock days from first Start. Qutara Runtime counts active intervals only. Closing the browser does not stop the server-side running session.
- Virtual Balance is cash plus collateral and unrealized PnL. Measured Accuracy is the percentage of profitable completed virtual trades, not a prediction guarantee. It is unavailable before the first completed trade. Maximum Virtual Drawdown tracks peak-to-trough virtual equity; lifetime aggregates survive the 500-row UI limit.
- Server files, environment files and both application databases are excluded from the public file handler. The independent `visitor-check` application remains separate.

## Validation

```bash
npm test
node --test visitor-check/test/*.test.js
```

Tests use injected market/AI fixtures to verify accounting, lifecycle races, failed services, persistence and session isolation without paid API calls. Live AI and U.S. stock connectivity require valid operator credentials.

## SEO

- `sitemap.xml` lists the clean public URLs for Google Search Console.
- `robots.txt` allows crawlers and points them to the sitemap.
- Each page includes a unique title, meta description, canonical URL, Open Graph tags, Twitter tags, and basic structured data.
- After deployment, submit `https://jumpqutaris.com/sitemap.xml` in Google Search Console.

## Deploy On Railway

Railway will detect `package.json` and run:

```bash
npm start
```

The included `server.js` listens on `0.0.0.0:$PORT`, which is the port Railway provides for public networking. Use one server instance with a persistent `QUTARA_DATA_DIR` volume, and configure the analysis/market variables in the host environment.

## Corporate Static Export Only

The HTML/CSS corporate pages can be exported to static hosting separately, but the six platform routes need the Node server. Do not publish the repository wholesale to a static host: only browser assets belong in a static export. Never include `.env`, SQLite files, tests or server modules.

## Assets

- `assets/jump-qutaris-logo.png`: transparent company logo used in the header.
- `assets/jump-qutaris-logo-footer.png`: transparent footer logo with light Qutaris text for the black footer.
- `assets/qutara-home-hero.webp`: homepage Qutara AI intelligence core visual.
- `assets/qutara-company-evolution.webp`: company page visual for the shift from human research to AI trading.
- `assets/qutara-technology-platform.webp`: technology page Qutara platform architecture visual.
- `assets/qutara-leadership-strategy.webp`: leadership page strategy room visual.
- `assets/qutara-research-lab.webp`: research page AI financial research visual.
- `assets/qutara-team-workspace.webp`: team and operations workspace visual.
- `assets/qutara-contact-network.webp`: contact page client connection network visual.
- `assets/favicon.png`, `assets/favicon-32.png`, `assets/apple-touch-icon.png`: browser tab and touch icons generated from the current logo.
