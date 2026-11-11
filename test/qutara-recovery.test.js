const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { Store } = require('../qutara/store');
const { createSession, transition } = require('../qutara/engine');
const { createServer } = require('../server');

const providers = { configured: { ai: false, stocks: false, crypto: true }, connections: () => ({ ai: { status: 'not_configured', message: 'Not configured' }, stocks: { status: 'not_configured' }, crypto: { status: 'ready' } }), getMarket: async () => { throw new Error('Offline'); }, analyze: async () => { throw new Error('Offline'); } };
async function serve(t, store, now) {
  const server = createServer({ store, providers, now: () => now });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { await server.qutara.close(); await new Promise(resolve => server.close(resolve)); });
  return `http://127.0.0.1:${server.address().port}`;
}

test('restart recovers the same private ledger as paused without counting downtime', async t => {
  const dir = mkdtempSync(path.join(tmpdir(), 'qutara-recovery-'));
  const filename = path.join(dir, 'sessions.sqlite');
  let store = new Store(filename);
  const token = 'a'.repeat(64);
  const ownerHash = createHash('sha256').update(token).digest('hex');
  const started = Date.parse('2026-09-11T12:00:00Z');
  const session = createSession({}, started);
  transition(session, 'start', started);
  session.runtimeMs = 120000;
  session.resumedAt = started + 120000;
  session.virtualCash = 95000;
  session.positions.push({ id: 'p1', symbol: 'BTC-USD', side: 'long', quantity: 50, entryPrice: 100, currentPrice: 102, pnl: 100, openedAt: started, bestPrice: 102 });
  store.save(ownerHash, session);
  store.close();
  store = new Store(filename);
  const base = await serve(t, store, started + 3600000);
  t.after(() => {
    assert.ok(path.resolve(dir).startsWith(path.resolve(tmpdir()) + path.sep));
    rmSync(dir, { recursive: true, force: true });
  });
  const response = await fetch(`${base}/api/qutara/state`, { headers: { Cookie: `qutara_session=${token}` } });
  assert.equal(response.headers.get('set-cookie'), null);
  const restored = await response.json();
  assert.equal(restored.session.id, session.id);
  assert.equal(restored.session.status, 'paused');
  assert.equal(restored.metrics.runtimeMs, 120000);
  assert.equal(restored.metrics.virtualBalance, 100100);
  assert.equal(restored.session.trialEndsAt, session.trialEndsAt);
  assert.match(restored.session.latestJudgment, /restarted/);
  assert.equal(store.get(ownerHash).status, 'paused');
  const other = await fetch(`${base}/api/qutara/state`).then(r => r.json());
  assert.notEqual(other.session.id, session.id);
  assert.equal(other.session.positions.length, 0);
});

test('CSV includes complete persisted trade history beyond the 500-record display window', async t => {
  const store = new Store(':memory:');
  const now = Date.parse('2026-09-11T12:00:00Z');
  const token = 'b'.repeat(64);
  const ownerHash = createHash('sha256').update(token).digest('hex');
  const session = createSession({}, now);
  session.trades = Array.from({ length: 520 }, (_, i) => ({ id: `trade-${i}`, symbol: 'BTC-USD', side: 'long', quantity: 1, entryPrice: 100, exitPrice: 101, pnl: 1, openedAt: now + i, closedAt: now + 1000 + i }));
  store.save(ownerHash, session);
  session.trades = session.trades.slice(-500);
  session.performance.completedTrades = 520;
  session.performance.winningTrades = 520;
  store.save(ownerHash, session);
  const base = await serve(t, store, now + 2000);
  const headers = { Cookie: `qutara_session=${token}` };
  const state = await fetch(`${base}/api/qutara/state`, { headers }).then(r => r.json());
  assert.equal(state.session.trades.length, 500);
  assert.equal(state.metrics.completedTrades, 520);
  const csv = await fetch(`${base}/api/qutara/report`, { headers }).then(r => r.text());
  assert.equal(csv.trim().split('\r\n').length, 521);
  const privateCsv = await fetch(`${base}/api/qutara/report`).then(r => r.text());
  assert.equal(privateCsv.trim().split('\r\n').length, 1);
});
