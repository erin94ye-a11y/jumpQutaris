const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createProviders } = require('../qutara/providers');

const now = Date.parse('2026-09-11T15:00:00Z');
const response = body => ({ ok: true, json: async () => body });
test('normalizes real Coinbase order and shares in-flight requests without changing source timestamps', async () => {
  let count = 0;
  const provider = createProviders({ env: {}, now: () => now, fetchImpl: async url => {
    count++;
    return response(url.includes('candles') ? [[now / 1000 - 300, 99, 102, 100, 101, 5], [now / 1000 - 600, 98, 101, 99, 100, 6]] : { price: '101.5', time: new Date(now - 2000).toISOString() });
  } });
  const [market, again] = await Promise.all([provider.getMarket('BTC-USD', '5m'), provider.getMarket('BTC-USD', '5m')]);
  assert.deepEqual(market, again);
  assert.equal(count, 2);
  assert.equal(market.candles[0].open, 99);
  assert.equal(market.price, 101.5);
  assert.equal(market.asOf, now - 2000);
  assert.equal(provider.connections().crypto.status, 'connected');
});

test('missing stock and AI configuration never produces synthetic data', async () => {
  const p = createProviders({ env: {}, fetchImpl: () => { throw new Error('Should not fetch'); } });
  await assert.rejects(p.getMarket('AAPL', '5m'), /not configured/i);
  await assert.rejects(p.analyze({}), /not configured/i);
  await assert.rejects(p.getMarket('../../secret', '5m'), /Unsupported/);
  await assert.rejects(p.getMarket('BTC-USD', '2m'), /Unsupported/);
});

test('rejects invalid or stale prices instead of presenting them as live', async () => {
  for (const ticker of [{ price: 'NaN', time: new Date(now).toISOString() }, { price: '100', time: new Date(now - 180000).toISOString() }]) {
    const p = createProviders({ env: {}, now: () => now, fetchImpl: async url => response(url.includes('candles') ? [[now / 1000 - 300, 99, 102, 100, 101, 5]] : ticker) });
    await assert.rejects(p.getMarket('BTC-USD', '5m'), /price|stale/i);
    assert.equal(p.connections().crypto.status, 'unavailable');
  }
});

test('stock provider uses IEX and live trade price separately from historical bars', async () => {
  const requests = [];
  const p = createProviders({ env: { ALPACA_API_KEY: 'example', ALPACA_SECRET_KEY: 'example-secret' }, now: () => now, fetchImpl: async (url, options) => {
    requests.push({ url, options });
    return response(url.includes('/bars') ? { bars: [{ t: new Date(now - 300000).toISOString(), o: 100, h: 102, l: 99, c: 101, v: 10 }] } : { trades: { AAPL: { p: 103, t: new Date(now - 1000).toISOString() } } });
  } });
  const m = await p.getMarket('AAPL', '5m');
  assert.equal(m.price, 103);
  assert.equal(m.candles[0].close, 101);
  assert.ok(requests.every(r => r.url.includes('feed=iex')));
  assert.equal(requests[0].options.headers['APCA-API-KEY-ID'], 'example');
});

test('AI requires structured completed output and sends only market context', async () => {
  let request;
  const p = createProviders({ env: { OPENAI_API_KEY: 'example-key', QUTARA_AI_MODEL: 'configured-model' }, fetchImpl: async (_url, opts) => {
    request = JSON.parse(opts.body);
    return response({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: '{"action":"HOLD","confidence":80,"reason":"Trend is mixed."}' }] }] });
  } });
  const result = await p.analyze({ symbol: 'BTC-USD', candles: [], indicators: {}, config: { riskLevel: 'Balanced', initialBalance: 100000 } });
  assert.equal(result.action, 'HOLD');
  assert.equal(request.store, false);
  assert.equal(request.text.format.strict, true);
  assert.ok(!request.input.includes('initialBalance'));
  assert.equal(p.connections().ai.status, 'connected');
});

test('invalid AI schema or request failures do not fabricate a HOLD signal', async () => {
  for (const body of [{ status: 'incomplete', output: [] }, { status: 'completed', output: [{ content: [{ type: 'output_text', text: '{"action":"BUY","confidence":120,"reason":"x"}' }] }] }]) {
    const p = createProviders({ env: { OPENAI_API_KEY: 'example', QUTARA_AI_MODEL: 'configured-model' }, fetchImpl: async () => response(body) });
    await assert.rejects(p.analyze({ candles: [], config: {} }), /analysis/i);
  }
});

test('both caches refresh across the candle close boundary', async () => {
  let clock = Date.parse('2026-09-11T15:04:50Z');
  let candleRequests = 0;
  const p = createProviders({ env: {}, now: () => clock, fetchImpl: async url => {
    if (!url.includes('candles')) return response({ price: '103', time: new Date(clock).toISOString() });
    candleRequests++;
    return response([[Date.parse('2026-09-11T15:04:00Z') / 1000, 99, 104, 100, candleRequests === 1 ? 101 : 103, 5]]);
  } });
  assert.equal((await p.getMarket('BTC-USD', '1m')).candles[0].close, 101);
  clock += 15000;
  assert.equal((await p.getMarket('BTC-USD', '1m')).candles[0].close, 103);
  assert.equal(candleRequests, 2);
});
