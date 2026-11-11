const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { Store } = require('../qutara/store');

test('persists isolated session state and normalized signal/decision records', t => {
  const dir = mkdtempSync(path.join(tmpdir(), 'qutara-test-'));
  t.after(() => {
    assert.ok(path.resolve(dir).startsWith(path.resolve(tmpdir()) + path.sep));
    rmSync(dir, { recursive: true, force: true });
  });
  let store = new Store(path.join(dir, 'test.sqlite'));
  const session = { id: 's1', config: { market: 'Cryptocurrency' }, status: 'idle', positions: [], orders: [], trades: [], rejections: [], signals: [{ id: 'sig1', symbol: 'BTC-USD' }], decisions: [{ id: 'dec1', reason: 'Hold' }] };
  store.save('owner1', session);
  assert.equal(store.get('owner2'), null);
  assert.deepEqual(store.get('owner1'), session);
  assert.equal(store.db.prepare('SELECT count(*) AS n FROM QutaraSignal').get().n, 1);
  assert.equal(store.db.prepare('SELECT count(*) AS n FROM QutaraDecision').get().n, 1);
  store.save('owner1', session);
  assert.equal(store.db.prepare('SELECT count(*) AS n FROM QutaraSignal').get().n, 1);
  store.close();
  store = new Store(path.join(dir, 'test.sqlite'));
  assert.deepEqual(store.get('owner1'), session);
  store.close();
});

test('changing a session owner cannot overwrite another private ledger', () => {
  const store = new Store(':memory:');
  const s = { id: 's1', config: {}, signals: [], decisions: [], orders: [], trades: [], rejections: [] };
  store.save('first', s);
  assert.throws(() => store.save('second', s));
  assert.deepEqual(store.get('first'), s);
  assert.equal(store.get('second'), null);
  store.close();
});
