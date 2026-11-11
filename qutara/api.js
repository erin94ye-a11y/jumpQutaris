const { randomBytes, createHash } = require('node:crypto');
const path = require('node:path');
const { Store } = require('./store');
const { ASSETS, createProviders } = require('./providers');
const { createSession, validateConfig, transition, tick, summarize } = require('./engine');

const COOKIE = 'qutara_session';
const json = (res, status, value) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(value));
};

async function readBody(req) {
  if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) throw Object.assign(new Error('Use a JSON request body.'), { status: 415 });
  let text = '';
  for await (const chunk of req) {
    text += chunk;
    if (Buffer.byteLength(text) > 16384) throw Object.assign(new Error('Request body is too large.'), { status: 413 });
  }
  try { return JSON.parse(text); } catch { throw Object.assign(new Error('Invalid JSON body.'), { status: 400 }); }
}

function createQutaraApi({ store = new Store(path.join(process.env.QUTARA_DATA_DIR || path.join(__dirname, 'data'), 'qutara.sqlite')), providers = createProviders(), intervalMs = 20000, now = Date.now } = {}) {
  const sessions = new Map();
  const work = new Map();
  let closing = false;
  for (const { ownerHash, session } of store.all()) {
    if (session.status === 'running') {
      // Do not count downtime as execution or backfill virtual orders after a restart.
      session.status = 'paused';
      session.resumedAt = null;
      session._revision = (session._revision || 0) + 1;
      session.latestJudgment = 'The service restarted. Your virtual ledger is retained. Resume Qutara to continue.';
      store.save(ownerHash, session);
    }
    sessions.set(ownerHash, session);
  }

  function save(ownerHash, session) {
    // Persist runtime up to this checkpoint, so restart recovery never includes downtime.
    if (session.status === 'running') {
      session.runtimeMs = summarize(session, now()).runtimeMs;
      session.resumedAt = now();
    }
    store.save(ownerHash, session);
  }

  function identify(req, res) {
    const candidate = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
    let token = /^[a-f0-9]{64}$/.test(candidate || '') ? candidate : null;
    let ownerHash = token ? createHash('sha256').update(token).digest('hex') : null;
    // Unknown tokens are replaced, preventing caller-chosen session identifiers.
    if (!ownerHash || !sessions.has(ownerHash)) {
      token = randomBytes(32).toString('hex');
      ownerHash = createHash('sha256').update(token).digest('hex');
      const secure = req.socket.encrypted || req.headers['x-forwarded-proto'] === 'https';
      res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000${secure ? '; Secure' : ''}`);
      const session = createSession(undefined, now());
      sessions.set(ownerHash, session);
      save(ownerHash, session);
    }
    return { ownerHash, session: sessions.get(ownerHash) };
  }

  const envelope = session => ({ session, metrics: summarize(session, now()), connections: providers.connections(), assets: ASSETS });

  function run(ownerHash, session) {
    if (closing || session.status !== 'running' || work.has(ownerHash)) return;
    const promise = tick(session, { getMarket: providers.getMarket, analyze: providers.analyze, now }).catch(() => {
      session.lastError = 'Qutara could not complete the latest evaluation. Waiting for the next update.';
    }).finally(() => {
      try { save(ownerHash, session); } catch (error) {
        if (session.status === 'running') transition(session, 'pause', now());
        session.lastError = 'The virtual ledger could not be saved. Qutara has paused.';
        console.error('Qutara ledger save failed:', error.code || error.name);
      }
      work.delete(ownerHash);
    });
    work.set(ownerHash, promise);
  }

  const interval = setInterval(() => { for (const [ownerHash, session] of sessions) run(ownerHash, session); }, intervalMs);
  interval.unref();

  function requireServices(session) {
    if (!providers.configured.ai) throw Object.assign(new Error(providers.connections().ai.message), { status: 503 });
    if (session.config.assets.some(symbol => ASSETS.stocks.includes(symbol)) && !providers.configured.stocks) {
      throw Object.assign(new Error(providers.connections().stocks.message), { status: 503 });
    }
  }

  async function handle(req, res, url) {
    if (!url.pathname.startsWith('/api/qutara/')) return false;
    try {
      const endpoint = url.pathname.slice('/api/qutara/'.length);
      const expectedMethod = { state: 'GET', config: 'PUT', control: 'POST', market: 'GET', report: 'GET' }[endpoint];
      if (!expectedMethod) { json(res, 404, { error: 'Unknown Qutara endpoint.' }); return true; }
      if (req.method !== expectedMethod) { res.setHeader('Allow', expectedMethod); json(res, 405, { error: 'Method not allowed.' }); return true; }
      if (req.method !== 'GET') {
        let wrongOrigin = req.headers['sec-fetch-site'] === 'cross-site';
        if (req.headers.origin) {
          try { wrongOrigin ||= new URL(req.headers.origin).host !== req.headers.host; } catch { wrongOrigin = true; }
        }
        if (wrongOrigin) { json(res, 403, { error: 'Cross-origin changes are not allowed.' }); return true; }
      }
      const { ownerHash, session } = identify(req, res);
      if (endpoint === 'state') { json(res, 200, envelope(session)); return true; }
      if (endpoint === 'market') {
        const symbol = url.searchParams.get('symbol') || session.config.assets[0];
        const timeframe = url.searchParams.get('timeframe') || session.config.timeframe;
        let market;
        try { market = await providers.getMarket(symbol, timeframe); } catch (error) { throw Object.assign(error, { status: 503 }); }
        json(res, 200, market);
        return true;
      }
      if (endpoint === 'report') {
        const rows = store.records(ownerHash, 'VirtualTrade');
        const cell = value => `"${String(value ?? '').replace(/^[=+@-]/, "'$&").replaceAll('"', '""')}"`;
        const columns = ['Symbol', 'Virtual Side', 'Quantity', 'Entry Price', 'Exit Price', 'Virtual PnL', 'Opened At', 'Closed At'];
        const lines = [columns.join(','), ...rows.map(row => [row.symbol, row.side, row.quantity, row.entryPrice, row.exitPrice, row.pnl, new Date(row.openedAt).toISOString(), new Date(row.closedAt).toISOString()].map(cell).join(','))];
        res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="qutara-virtual-trades.csv"', 'Cache-Control': 'no-store' });
        res.end('\uFEFF' + lines.join('\r\n'));
        return true;
      }
      const body = await readBody(req);
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw Object.assign(new Error('Expected a JSON object.'), { status: 400 });
      const before = structuredClone(session);
      if (endpoint === 'config') {
        if (['running', 'paused'].includes(session.status) || work.has(ownerHash)) throw Object.assign(new Error('Stop Qutara and wait for the current evaluation before changing parameters.'), { status: 409 });
        const config = validateConfig(body);
        if (session.positions.length && JSON.stringify(config) !== JSON.stringify(session.config)) throw Object.assign(new Error('Open virtual positions retain their parameters. Resume Qutara to manage them before changing configuration.'), { status: 409 });
        if (session.startedAt !== null && config.initialBalance !== session.config.initialBalance) throw Object.assign(new Error('Virtual initial capital cannot rewrite an existing session ledger.'), { status: 409 });
        if (session.startedAt === null) {
          const fresh = createSession(config, session.createdAt);
          fresh.id = session.id;
          Object.assign(session, fresh);
        } else {
          session.config = config;
          session._revision += 1;
          session._lastEvaluatedCandles = {};
        }
      } else {
        if (['start', 'resume'].includes(body.action)) requireServices(session);
        try { transition(session, body.action, now()); } catch (error) { throw Object.assign(error, { status: 409 }); }
      }
      try { save(ownerHash, session); }
      catch {
        const revision = Math.max(session._revision, before._revision) + 1;
        if (before.status === 'running') transition(before, 'pause', now());
        Object.assign(session, before, { _revision: revision, lastError: 'The virtual ledger could not be saved. Qutara is not running.' });
        throw Object.assign(new Error(session.lastError), { status: 500 });
      }
      json(res, 200, envelope(session));
      if (session.status === 'running') run(ownerHash, session);
    } catch (error) {
      json(res, error.status || 400, { error: error.message || 'Qutara request failed.' });
    }
    return true;
  }

  async function close() {
    closing = true;
    clearInterval(interval);
    for (const [ownerHash, session] of sessions) {
      if (session.status === 'running') transition(session, 'pause', now());
      save(ownerHash, session);
    }
    await Promise.allSettled(work.values());
    store.close();
  }

  return { handle, close };
}

module.exports = { createQutaraApi };
