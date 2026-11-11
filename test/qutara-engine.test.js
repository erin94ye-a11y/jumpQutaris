'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
let engine = {};
try { engine = require('../qutara/engine'); } catch (error) { if (error.code !== 'MODULE_NOT_FOUND') throw error; }
const NOW = 1789128000000;
const DAY = 86400000;
const buy = async () => ({ action: 'BUY', confidence: 90, reason: 'Positive trend confirmed.' });
const sell = async () => ({ action: 'SELL', confidence: 90, reason: 'Negative trend confirmed.' });
const hold = async () => ({ action: 'HOLD', confidence: 90, reason: 'Wait for confirmation.' });

function market(symbol = 'BTC-USD', now = NOW, price = 100, direction = 1) {
  return {
    symbol, source: 'Recorded market fixture', asOf: now, price,
    candles: Array.from({ length: 60 }, (_, i) => {
      const close = 100 + direction * ((i - 59) * 0.1 + [0, -1, 0, 1][i % 4] - 1);
      return { time: now - (60 - i) * 300000, open: close, high: close + 0.2, low: close - 0.2, close, volume: 1000 };
    }),
  };
}

function running(config = {}) {
  const session = engine.createSession({ assets: ['BTC-USD'], ...config }, NOW);
  return engine.transition(session, 'start', NOW);
}

function step(session, { now = NOW, price = 100, direction = 1, analyze = buy, getMarket } = {}) {
  return engine.tick(session, { now, analyze, getMarket: getMarket || (async symbol => market(symbol, now, price, direction)) });
}

test('engine exports the public session contract', () => {
  for (const method of ['validateConfig', 'createSession', 'transition', 'tick', 'summarize', 'calculateIndicators']) {
    assert.equal(typeof engine[method], 'function', `Missing ${method}`);
  }
});

test('configuration rejects unsupported instruments and invalid risk inputs', () => {
  assert.throws(() => engine.validateConfig({ assets: ['DOGE-USD'] }), /asset|symbol/i);
  assert.throws(() => engine.validateConfig({ market: 'U.S. Stocks', assets: ['BTC-USD'] }), /asset|symbol/i);
  assert.throws(() => engine.validateConfig({ riskLevel: 'Aggressive' }), /riskLevel/i);
  assert.throws(() => engine.validateConfig({ initialBalance: NaN }), /initialBalance/i);
  assert.throws(() => engine.validateConfig({ positionSize: 101 }), /positionSize/i);
  assert.throws(() => engine.validateConfig({ allowShort: 'false' }), /allowShort/i);
  assert.throws(() => engine.validateConfig({ timeframe: '2m' }), /timeframe/i);
  const config = engine.validateConfig({ assets: [' btc-usd ', 'BTC-USD'], initialBalance: '50000' });
  assert.deepEqual(config.assets, ['BTC-USD']);
  assert.equal(config.initialBalance, 50000);
});

test('runtime excludes pauses and ledger is retained across stop/start', () => {
  const session = running();
  engine.transition(session, 'pause', NOW + 5000);
  assert.equal(engine.summarize(session, NOW + 15000).runtimeMs, 5000);
  engine.transition(session, 'resume', NOW + 20000);
  engine.transition(session, 'stop', NOW + 23000);
  session.virtualCash = 99000;
  engine.transition(session, 'start', NOW + 30000);
  assert.equal(engine.summarize(session, NOW + 31000).runtimeMs, 9000);
  assert.equal(session.virtualCash, 99000);
  assert.equal(session.trialEndsAt, NOW + 7 * DAY);
  assert.throws(() => engine.transition(session, 'resume', NOW + 32000), /resume|paused/i);
});

test('trial expiry stops evaluation at seven days without resetting the trial', async () => {
  const session = running();
  await step(session, { now: NOW + 7 * DAY });
  assert.equal(session.status, 'stopped');
  assert.equal(session.orders.length, 0);
  assert.equal(engine.summarize(session, NOW + 8 * DAY).remainingTrialMs, 0);
  assert.throws(() => engine.transition(session, 'start', NOW + 8 * DAY), /trial|expired/i);
});

test('indicators use closes and expose Wilder RSI without NaN at a flat market', () => {
  const candles = Array.from({ length: 50 }, (_, i) => ({ close: i + 1 }));
  assert.deepEqual(engine.calculateIndicators(candles), { sma20: 40.5, sma50: 25.5, rsi14: 100 });
  assert.equal(engine.calculateIndicators(Array.from({ length: 50 }, () => ({ close: 100 }))).rsi14, 50);
  assert.throws(() => engine.calculateIndicators(candles.slice(0, 49)), /50|insufficient|candles/i);
});

test('confirmed buy opens one virtual position and same candle is not traded twice', async () => {
  const session = running();
  await step(session);
  assert.equal(session.positions.length, 1);
  assert.equal(session.positions[0].quantity, 50);
  assert.equal(session.virtualCash, 95000);
  assert.equal(session.orders[0].side, 'BUY');
  assert.equal(session.trades.length, 0);
  assert.equal(engine.summarize(session, NOW).virtualBalance, 100000);
  assert.equal(engine.summarize(session, NOW).measuredAccuracy, null);
  await step(session);
  assert.equal(session.orders.length, 1);
});

test('stale, missing, malformed or inadequate market data never reaches a fill', async () => {
  for (const corrupt of [
    quote => { quote.asOf = NOW - 120001; },
    quote => { quote.price = Infinity; },
    quote => { quote.candles = quote.candles.slice(0, 49); },
    quote => { quote.candles[4].close = NaN; },
    quote => { quote.candles[4].high = 1; },
    quote => { quote.source = ''; },
    quote => { quote.symbol = 'ETH-USD'; },
  ]) {
    const session = running();
    await step(session, { getMarket: async () => { const quote = market(); corrupt(quote); return quote; } });
    assert.equal(session.orders.length, 0);
    assert.ok(session.rejections.length > 0);
    assert.ok(session.lastError);
  }
});

test('unavailable AI reports error without fabricating a signal or trade', async () => {
  const session = running();
  await step(session, { analyze: async () => { throw new Error('AI unavailable'); } });
  assert.equal(session.orders.length, 0);
  assert.equal(session.signals.length, 0);
  assert.match(session.lastError, /AI unavailable/);
});

test('low confidence, opposing trend, disabled shorts, and exposure blocks produce rejections', async () => {
  for (const [config, options] of [
    [{}, { analyze: async () => ({ action: 'BUY', confidence: 60, reason: 'Uncertain' }) }],
    [{}, { direction: -1 }],
    [{}, { direction: -1, analyze: sell }],
    [{ maxExposure: 3 }, {}],
  ]) {
    const session = running(config);
    await step(session, options);
    assert.equal(session.orders.length, 0);
    assert.equal(session.rejections.length, 1);
  }
});

test('manual mode records the real signal and decision without a fill', async () => {
  const session = running({ autoTrade: false });
  await step(session);
  assert.equal(session.orders.length, 0);
  assert.equal(session.signals[0].action, 'BUY');
  assert.equal(session.decisions[0].action, 'BUY');
});

test('stop loss closes a long despite failed AI and measures the completed loss', async () => {
  const session = running();
  await step(session);
  await step(session, { now: NOW + 300000, price: 97, analyze: async () => { throw new Error('AI offline'); } });
  assert.equal(session.positions.length, 0);
  assert.equal(session.trades.length, 1);
  assert.equal(session.trades[0].pnl, -150);
  assert.equal(session.virtualCash, 99850);
  const metrics = engine.summarize(session, NOW + 300000);
  assert.equal(metrics.completedTrades, 1);
  assert.equal(metrics.virtualReturn, -0.15);
  assert.equal(metrics.measuredAccuracy, 0);
  assert.equal(metrics.maximumVirtualDrawdown, 0.15);
});

test('take profit completes a winning trade and cannot reopen on its exit candle', async () => {
  const session = running();
  await step(session);
  await step(session, { now: NOW + 300000, price: 106 });
  await step(session, { now: NOW + 300000, price: 106 });
  assert.equal(session.orders.length, 2);
  assert.equal(session.positions.length, 0);
  assert.equal(session.trades[0].pnl, 300);
  assert.equal(engine.summarize(session, NOW + 300000).measuredAccuracy, 100);
});

test('short notional is reserved and realized PnL is released on cover', async () => {
  const session = running({ allowShort: true });
  await step(session, { direction: -1, analyze: sell });
  assert.equal(session.positions[0].side, 'short');
  assert.equal(session.virtualCash, 95000);
  assert.equal(engine.summarize(session, NOW).virtualBalance, 100000);
  await step(session, { now: NOW + 300000, price: 94, direction: -1, analyze: hold });
  assert.equal(session.positions.length, 0);
  assert.equal(session.orders[1].side, 'BUY');
  assert.equal(session.trades[0].pnl, 300);
  assert.equal(session.virtualCash, 100300);
});

test('trailing stop preserves its favorable high water mark across ticks', async () => {
  const session = running({ takeProfit: 20 });
  await step(session);
  await step(session, { now: NOW + 300000, price: 103, analyze: hold });
  await step(session, { now: NOW + 600000, price: 101.9, analyze: hold });
  assert.equal(session.positions.length, 0);
  assert.ok(Math.abs(session.trades[0].pnl - 95) < 0.000001);
  assert.match(session.trades[0].reason, /trailing/i);
});

test('maximum holding time enforces exit with live quotes', async () => {
  const session = running({ maxHoldingHours: 1 });
  await step(session);
  await step(session, { now: NOW + 3600000, analyze: hold });
  assert.equal(session.positions.length, 0);
  assert.match(session.trades[0].reason, /holding/i);
});

test('pause and stop during awaited AI prevent fills even if resumed before AI returns', async () => {
  for (const action of ['pause', 'stop']) {
    const session = running();
    let release;
    let entered;
    const enteredPromise = new Promise(resolve => { entered = resolve; });
    const pending = step(session, { analyze: async () => { entered(); return new Promise(resolve => { release = resolve; }); } });
    await enteredPromise;
    engine.transition(session, action, NOW + 1);
    engine.transition(session, action === 'pause' ? 'resume' : 'start', NOW + 2);
    release({ action: 'BUY', confidence: 90, reason: 'Analysis from the previous run' });
    await pending;
    assert.equal(session.orders.length, 0);
  }
});

test('overlapping ticks cannot open more than one position per symbol', async () => {
  const session = running();
  await Promise.all([step(session), step(session)]);
  assert.equal(session.orders.length, 1);
});

test('paused session makes no virtual fills and retains its open position', async () => {
  const session = running();
  await step(session);
  engine.transition(session, 'pause', NOW + 1);
  await step(session, { now: NOW + 300000, price: 90 });
  assert.equal(session.positions.length, 1);
  assert.equal(session.orders.length, 1);
});

test('decisions and rejections remain bounded at 500 records', async () => {
  const session = running();
  for (let i = 0; i < 505; i += 1) {
    await step(session, { now: NOW + i * 300000, analyze: async () => ({ action: 'BUY', confidence: 1, reason: 'Low confidence' }) });
  }
  assert.equal(session.decisions.length, 500);
  assert.equal(session.signals.length, 500);
  assert.equal(session.rejections.length, 500);
});

test('forming candles cannot influence indicators or trigger repeat analysis', async () => {
  const session = running();
  const quote = market();
  quote.candles.push({ time: NOW, open: 100, high: 1000, low: 99, close: 1000, volume: 2000 });
  let analyzedBars;
  await step(session, { getMarket: async () => quote, analyze: async input => { analyzedBars = input.candles; return buy(); } });
  assert.equal(session.positions.length, 1);
  assert.equal(analyzedBars.length, 60);
  assert.equal(session.market['BTC-USD'].candles.length, 61);
  quote.candles.at(-1).close = 99;
  quote.asOf = NOW + 60000;
  await step(session, { now: NOW + 60000, getMarket: async () => quote });
  assert.equal(session.decisions.length, 1);
});

test('insufficient closed bars and any future quote timestamp block execution', async () => {
  for (const alter of [
    quote => { quote.candles = quote.candles.slice(-50); quote.candles.at(-1).time = NOW; },
    quote => { quote.candles.forEach((candle, index) => { candle.time = NOW - (60 - index) * 1000; }); },
    quote => { quote.asOf = NOW + 1; },
  ]) {
    const session = running();
    const quote = market();
    alter(quote);
    await step(session, { getMarket: async () => quote });
    assert.equal(session.orders.length, 0);
    assert.ok(session.lastError);
  }
});

test('quote freshness is checked again after slow AI analysis', async () => {
  const session = running();
  let now = NOW;
  await engine.tick(session, { now: () => now, getMarket: async () => market(), analyze: async () => { now += 120001; return buy(); } });
  assert.equal(session.orders.length, 0);
  assert.match(session.lastError, /stale/i);
});

test('AI sell closes a long while short selling remains disabled', async () => {
  const session = running({ trailingStop: 0 });
  await step(session);
  await step(session, { now: NOW + 300000, direction: -1, analyze: sell });
  assert.equal(session.positions.length, 0);
  assert.equal(session.orders[1].side, 'SELL');
  assert.equal(session.trades.length, 1);
});

test('short stop loss records a loss and releases collateral accurately', async () => {
  const session = running({ allowShort: true });
  await step(session, { direction: -1, analyze: sell });
  await step(session, { now: NOW + 300000, price: 103, analyze: hold });
  assert.equal(session.trades[0].pnl, -150);
  assert.equal(session.virtualCash, 99850);
  assert.equal(engine.summarize(session).maximumVirtualDrawdown, 0.15);
});

test('serialized session retains trial, accounting and duplicate-candle protection', async () => {
  const session = running();
  await step(session);
  const restored = JSON.parse(JSON.stringify(session));
  await step(restored);
  assert.equal(restored.orders.length, 1);
  await step(restored, { now: NOW + 300000, price: 106 });
  assert.equal(engine.summarize(restored, NOW + 300000).virtualBalance, 100300);
  assert.equal(restored.trialEndsAt, NOW + 7 * DAY);
});

test('aggregate trade accuracy survives bounded trade history', async () => {
  const session = running();
  for (let i = 0; i < 502; i += 1) {
    await step(session, { now: NOW + i * 600000 });
    await step(session, { now: NOW + i * 600000 + 300000, price: i === 0 ? 97 : 106 });
  }
  const metrics = engine.summarize(session, NOW + 502 * 600000);
  assert.equal(session.trades.length, 500);
  assert.equal(session.orders.length, 500);
  assert.equal(metrics.completedTrades, 502);
  assert.equal(metrics.measuredAccuracy, 99.80079681);
});

test('portfolio drawdown uses simultaneous marks rather than a partial asset update', async () => {
  const session = running({ assets: ['BTC-USD', 'ETH-USD'], stopLoss: 20, takeProfit: 20, trailingStop: 0 });
  await step(session);
  assert.equal(session.positions.length, 2);
  await step(session, { now: NOW + 300000, getMarket: async symbol => market(symbol, NOW + 300000, symbol === 'BTC-USD' ? 105 : 95), analyze: hold });
  const metrics = engine.summarize(session, NOW + 300000);
  assert.equal(metrics.virtualBalance, 100000);
  assert.equal(metrics.maximumVirtualDrawdown, 0);
});

test('manual mode continues protective exits for existing positions', async () => {
  const session = running();
  await step(session);
  session.config.autoTrade = false;
  await step(session, { now: NOW + 300000, price: 97, analyze: hold });
  assert.equal(session.positions.length, 0);
  assert.equal(session.trades[0].pnl, -150);
});

test('retained position symbols still receive protective management outside selected assets', async () => {
  const session = running();
  await step(session);
  session.config.assets = ['ETH-USD'];
  await step(session, { now: NOW + 300000, getMarket: async symbol => market(symbol, NOW + 300000, symbol === 'BTC-USD' ? 97 : 100), analyze: hold });
  assert.equal(session.positions.length, 0);
  assert.equal(session.trades[0].symbol, 'BTC-USD');
  assert.equal(session.trades[0].pnl, -150);
});

test('multi-symbol AI latency does not accumulate until later quotes are stale', async () => {
  const session = running({ assets: ['BTC-USD', 'ETH-USD', 'SOL-USD'] });
  let now = NOW;
  await engine.tick(session, {
    now: () => now,
    getMarket: async symbol => market(symbol),
    analyze: async () => {
      const startedAt = now;
      await new Promise(resolve => setImmediate(resolve));
      now = startedAt + 45000;
      return buy();
    },
  });
  assert.equal(session.positions.length, 3);
  assert.equal(session.lastError, null);
});

test('fresh prices can enforce exits when insufficient closed history blocks new entries', async () => {
  const session = running();
  await step(session);
  await step(session, { now: NOW + 300000, getMarket: async () => {
    const quote = market('BTC-USD', NOW + 300000, 97);
    quote.candles = quote.candles.slice(-20);
    return quote;
  }, analyze: hold });
  assert.equal(session.positions.length, 0);
  assert.equal(session.trades[0].pnl, -150);
});

test('fresh ticker prices cannot approve signals from stale historical candles', async () => {
  const session = running();
  const quote = market();
  quote.candles.forEach(candle => { candle.time -= DAY; });
  await step(session, { getMarket: async () => quote });
  assert.equal(session.orders.length, 0);
  assert.equal(session.signals.length, 0);
  assert.match(session.lastError, /candles.*stale|stale.*candles/i);
});

test('daily stock history tolerates weekend gaps but not arbitrarily old bars', async () => {
  for (const [gapDays, expectedPositions] of [[3, 1], [5, 0]]) {
    const session = running({ market: 'U.S. Stocks', assets: ['AAPL'], timeframe: '1d' });
    const quote = market('AAPL');
    quote.candles.forEach((candle, index) => { candle.time = NOW - (60 - index + gapDays) * DAY; });
    await step(session, { getMarket: async () => quote });
    assert.equal(session.positions.length, expectedPositions);
    if (gapDays === 5) assert.match(session.lastError, /stale/i);
  }
});

test('stale technical history does not disable a stop loss using a fresh price', async () => {
  const session = running();
  await step(session);
  await step(session, { now: NOW + 300000, getMarket: async () => {
    const quote = market('BTC-USD', NOW + 300000, 97);
    quote.candles.forEach(candle => { candle.time -= DAY; });
    return quote;
  }, analyze: hold });
  assert.equal(session.positions.length, 0);
  assert.equal(session.trades[0].pnl, -150);
});

test('parallel decisions preserve portfolio exposure limits across assets', async () => {
  const session = running({ assets: ['BTC-USD', 'ETH-USD', 'SOL-USD'], maxExposure: 10 });
  await step(session);
  assert.equal(session.positions.length, 2);
  assert.equal(session.virtualCash, 90000);
  assert.equal(session.rejections.length, 1);
  assert.match(session.rejections[0].reason, /exposure/i);
});

test('stale marks on retained positions cannot approve additional portfolio exposure', async () => {
  const session = running({ assets: ['BTC-USD', 'ETH-USD'] });
  await step(session, { analyze: async ({ symbol }) => symbol === 'BTC-USD' ? buy() : hold() });
  assert.equal(session.positions.length, 1);
  await step(session, { now: NOW + 300000, getMarket: async symbol => {
    if (symbol === 'BTC-USD') throw new Error('Market temporarily unavailable');
    return market(symbol, NOW + 300000);
  } });
  assert.equal(session.positions.length, 1);
  assert.equal(session.orders.length, 1);
  assert.ok(session.rejections.some(rejection => rejection.symbol === 'ETH-USD' && /fresh|stale/i.test(rejection.reason)));
});

test('a pre-close historical snapshot cannot promote a forming candle after response latency', async () => {
  const session = running();
  const quote = market();
  quote.candlesAsOf = NOW - 1;
  let analyzedBars;
  const analyze = async input => { analyzedBars = input.candles; return hold(); };
  await step(session, { getMarket: async () => quote, analyze });
  assert.equal(analyzedBars.length, 59);
  assert.equal(analyzedBars.at(-1).time, NOW - 600000);
  assert.equal(session.market['BTC-USD'].candlesAsOf, NOW - 1);
  quote.asOf = NOW + 1;
  quote.candlesAsOf = NOW + 1;
  await step(session, { now: NOW + 1, getMarket: async () => quote, analyze });
  assert.equal(analyzedBars.length, 60);
  assert.equal(session.decisions.length, 2);
});

test('invalid optional candle snapshot timestamps cannot reach virtual execution', async () => {
  for (const candlesAsOf of [NaN, Infinity, null, NOW + 1, -1]) {
    const session = running();
    const quote = market();
    quote.candlesAsOf = candlesAsOf;
    await step(session, { getMarket: async () => quote });
    assert.equal(session.orders.length, 0);
    assert.match(session.lastError, /timestamp|snapshot|candlesAsOf/i);
  }
});
