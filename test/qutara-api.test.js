const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('../server');
const { Store } = require('../qutara/store');

async function setup(t, configured = true) {
  const providers = { configured: { ai: configured, stocks: configured, crypto: true }, connections: () => ({ ai: { status: configured ? 'ready' : 'not_configured', message: 'Qutara AI analysis is not configured.' }, crypto: { status: 'ready', message: 'Ready' }, stocks: { status: 'not_configured', message: 'Stock service is not configured.' } }), getMarket: async () => { throw new Error('Feed offline'); }, analyze: async () => { throw new Error('Analysis offline'); } };
  const store = new Store(':memory:');
  const server = createServer({ store, providers, intervalMs: 100000 });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { await server.qutara.close(); await new Promise(resolve => server.close(resolve)); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const res = await fetch(`${base}/api/qutara/state`);
  const cookie = res.headers.get('set-cookie').split(';')[0];
  return { server, store, base, cookie, state: await res.json(), request: (route, method = 'GET', body, custom = {}) => fetch(`${base}${route}`, { method, headers: { Cookie: cookie, ...(body ? { 'Content-Type': 'application/json' } : {}), ...custom }, ...(body ? { body: JSON.stringify(body) } : {}) }) };
}

test('private sessions remain isolated and lifecycle preserves the same ledger', async t => {
  const app = await setup(t);
  assert.equal(app.state.session.status, 'idle');
  assert.equal(app.state.metrics.measuredAccuracy, null);
  const second = await fetch(`${app.base}/api/qutara/state`).then(r => r.json());
  assert.notEqual(app.state.session.id, second.session.id);
  const changed = await app.request('/api/qutara/config', 'PUT', { ...app.state.session.config, initialBalance: 25000 });
  assert.equal(changed.status, 200);
  assert.equal((await changed.json()).metrics.virtualBalance, 25000);
  for (const [action, expected] of [['start', 'running'], ['pause', 'paused'], ['resume', 'running'], ['stop', 'stopped']]) {
    const response = await app.request('/api/qutara/control', 'POST', { action });
    assert.equal(response.status, 200);
    const state = await response.json();
    assert.equal(state.session.id, app.state.session.id);
    assert.equal(state.session.status, expected);
  }
  const reset = await app.request('/api/qutara/config', 'PUT', { ...app.state.session.config, initialBalance: 50000 });
  assert.equal(reset.status, 409);
});

test('requires services before start and rejects cross-origin or invalid configuration mutations', async t => {
  const app = await setup(t, false);
  assert.equal((await app.request('/api/qutara/control', 'POST', { action: 'start' })).status, 503);
  assert.equal((await app.request('/api/qutara/config', 'PUT', { market: 'Cryptocurrency', riskLevel: 'Extreme' })).status, 400);
  assert.equal((await app.request('/api/qutara/control', 'POST', { action: 'start' }, { Origin: 'https://unrelated.example' })).status, 403);
  assert.equal((await app.request('/api/qutara/market?symbol=BTC-USD&timeframe=5m')).status, 503);
});

test('platform routes exist, legacy selection redirects and private code/database stay inaccessible', async t => {
  const app = await setup(t);
  for (const route of ['/dashboard', '/qutara', '/virtual-trading', '/market-data', '/leaderboard', '/reports']) {
    const response = await app.request(route);
    assert.equal(response.status, 200, route);
    assert.match(await response.text(), /Qutara/);
  }
  const redirect = await fetch(`${app.base}/ai-bots`, { redirect: 'manual' });
  assert.equal(redirect.status, 301);
  assert.equal(redirect.headers.get('location'), '/qutara');
  for (const route of ['/qutara/engine.js', '/qutara/data/qutara.sqlite', '/.env', '/server.js', '/test/qutara-api.test.js', '/visitor-check/server.js', '/VISITOR-CHECK/package.json', '/visitor-check./package.json', '/visitor-check%20/package.json']) {
    assert.equal((await app.request(route)).status, 403, route);
  }
  assert.equal((await app.request('/%notvalid')).status, 400);
  assert.equal((await app.request('/%0A/')).status, 400);
  assert.equal((await app.request('/%00')).status, 400);
  assert.equal((await app.request('/%2f%2foutside.example/')).status, 400);
  assert.equal((await app.request('/missing-page')).status, 404);
});

test('CSV exports only current session persisted completed trades', async t => {
  const app = await setup(t);
  const response = await app.request('/api/qutara/report');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/csv/);
  assert.match(await response.text(), /Virtual PnL/);
});

test('failed ledger persistence rolls back Start and never leaves execution running', async t => {
  const app = await setup(t);
  const originalSave = app.store.save.bind(app.store);
  let failOnce = true;
  app.store.save = (...args) => { if (failOnce) { failOnce = false; throw new Error('Disk unavailable'); } return originalSave(...args); };
  const response = await app.request('/api/qutara/control', 'POST', { action: 'start' });
  assert.equal(response.status, 500);
  const state = await app.request('/api/qutara/state').then(r => r.json());
  assert.equal(state.session.status, 'idle');
  assert.equal(state.session.startedAt, null);
});
