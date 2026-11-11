'use strict';

const { randomUUID } = require('node:crypto');

const STOCKS = Object.freeze(['AAPL', 'MSFT', 'NVDA', 'TSLA', 'SPY', 'QQQ']);
const CRYPTO = Object.freeze(['BTC-USD', 'ETH-USD', 'SOL-USD']);
const TRIAL_MS = 7 * 24 * 60 * 60 * 1000;
const QUOTE_MAX_AGE_MS = 120000;
const LOG_LIMIT = 500;
const TIMEFRAME_MS = { '1m': 60000, '5m': 300000, '15m': 900000, '1h': 3600000, '1d': 86400000 };
const activeTicks = new WeakSet();

const DEFAULT_CONFIG = Object.freeze({
  market: 'Cryptocurrency', assets: Object.freeze(['BTC-USD', 'ETH-USD']), timeframe: '5m',
  initialBalance: 100000, positionSize: 5, maxExposure: 30, riskLevel: 'Balanced',
  minConfidence: 70, stopLoss: 2, takeProfit: 5, trailingStop: 1,
  maxHoldingHours: 24, allowShort: false, autoTrade: true,
});

function validateConfig(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Configuration must be an object.');
  const config = {};
  for (const key of Object.keys(DEFAULT_CONFIG)) config[key] = input[key] === undefined ? DEFAULT_CONFIG[key] : input[key];
  if (!['U.S. Stocks', 'Cryptocurrency', 'Stocks + Crypto'].includes(config.market)) throw new Error('Unsupported market.');
  if (!['Conservative', 'Balanced', 'Active'].includes(config.riskLevel)) throw new Error('riskLevel must be Conservative, Balanced, or Active.');
  if (!['1m', '5m', '15m', '1h', '1d'].includes(config.timeframe)) throw new Error('Unsupported timeframe.');
  if (input.assets === undefined && config.market === 'U.S. Stocks') config.assets = ['AAPL', 'MSFT'];
  if (input.assets === undefined && config.market === 'Stocks + Crypto') config.assets = ['AAPL', 'BTC-USD'];
  if (!Array.isArray(config.assets) || config.assets.length === 0 || config.assets.some(asset => typeof asset !== 'string')) {
    throw new Error('assets must be a nonempty array of supported symbols.');
  }
  config.assets = [...new Set(config.assets.map(asset => asset.trim().toUpperCase()))];
  const allowed = config.market === 'U.S. Stocks' ? STOCKS : config.market === 'Cryptocurrency' ? CRYPTO : [...STOCKS, ...CRYPTO];
  if (config.assets.some(asset => !allowed.includes(asset))) throw new Error('Unsupported asset symbol for the selected market.');
  const limits = {
    initialBalance: [1, 1e9], positionSize: [0.01, 100], maxExposure: [0.01, 100],
    minConfidence: [0, 100], stopLoss: [0.01, 100], takeProfit: [0.01, 1000],
    trailingStop: [0, 100], maxHoldingHours: [0.01, 8760],
  };
  for (const [key, [min, max]] of Object.entries(limits)) {
    const raw = config[key];
    const value = typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : raw;
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
      throw new Error(`${key} must be a finite number between ${min} and ${max}.`);
    }
    config[key] = value;
  }
  for (const key of ['allowShort', 'autoTrade']) if (typeof config[key] !== 'boolean') throw new Error(`${key} must be a boolean.`);
  return config;
}

function timestamp(value) {
  if (!Number.isFinite(value) || value < 0) throw new Error('A valid timestamp is required.');
  return value;
}

function createSession(input = {}, now = Date.now()) {
  const config = validateConfig(input);
  timestamp(now);
  return {
    id: randomUUID(), config, status: 'idle', createdAt: now, startedAt: null,
    trialEndsAt: null, runtimeMs: 0, resumedAt: null, virtualCash: config.initialBalance,
    positions: [], orders: [], trades: [], signals: [], decisions: [], rejections: [], market: {},
    latestJudgment: 'Qutara is ready. Start the virtual trial to evaluate live market data.', lastError: null,
    performance: { peakEquity: config.initialBalance, maximumDrawdown: 0, completedTrades: 0, winningTrades: 0, realizedPnl: 0 },
    _revision: 0, _lastEvaluatedCandles: {},
  };
}

function runningTime(session, now) {
  const until = session.trialEndsAt === null ? now : Math.min(now, session.trialEndsAt);
  return session.runtimeMs + (session.status === 'running' && session.resumedAt !== null ? Math.max(0, until - session.resumedAt) : 0);
}

function transition(session, action, now = Date.now()) {
  timestamp(now);
  const permitted = { start: ['idle', 'stopped'], pause: ['running'], resume: ['paused'], stop: ['running', 'paused'] };
  if (!permitted[action] || !permitted[action].includes(session.status)) throw new Error(`Cannot ${action} a ${session.status} session.`);
  if (['start', 'resume'].includes(action) && session.trialEndsAt !== null && now >= session.trialEndsAt) throw new Error('The seven-day trial has expired.');
  if (session.status === 'running') session.runtimeMs = runningTime(session, now);
  session._revision = (session._revision || 0) + 1;
  if (action === 'start' || action === 'resume') {
    if (session.startedAt === null) { session.startedAt = now; session.trialEndsAt = now + TRIAL_MS; }
    session.status = 'running';
    session.resumedAt = now;
    session.latestJudgment = 'Qutara is waiting for fresh market data and AI analysis.';
  } else {
    session.status = action === 'pause' ? 'paused' : 'stopped';
    session.resumedAt = null;
    session.latestJudgment = action === 'pause' ? 'Virtual execution is paused. Open positions are retained.' : 'Virtual execution is stopped. The ledger and open positions are retained.';
  }
  return session;
}

function calculateIndicators(candles) {
  if (!Array.isArray(candles) || candles.length < 50) throw new Error('At least 50 candles are required for SMA20, SMA50 and RSI14.');
  const closes = candles.map(candle => candle.close);
  if (closes.some(close => !Number.isFinite(close) || close <= 0)) throw new Error('Candle closes must be finite positive numbers.');
  const average = count => closes.slice(-count).reduce((sum, close) => sum + close / count, 0);
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= 14; i += 1) {
    const change = closes[i] - closes[i - 1];
    gain += Math.max(change, 0) / 14;
    loss += Math.max(-change, 0) / 14;
  }
  for (let i = 15; i < closes.length; i += 1) {
    const change = closes[i] - closes[i - 1];
    gain = (gain * 13 + Math.max(change, 0)) / 14;
    loss = (loss * 13 + Math.max(-change, 0)) / 14;
  }
  const rsi14 = gain === 0 && loss === 0 ? 50 : loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
  return { sma20: average(20), sma50: average(50), rsi14 };
}

function validateMarket(quote, symbol, now) {
  if (!quote || quote.symbol !== symbol) throw new Error('Market response has the wrong symbol.');
  if (typeof quote.source !== 'string' || !quote.source.trim()) throw new Error('Market data source is missing.');
  if (!Number.isFinite(quote.price) || quote.price <= 0) throw new Error('Market price must be a finite positive number.');
  if (!Number.isFinite(quote.asOf) || now - quote.asOf > QUOTE_MAX_AGE_MS || quote.asOf > now) throw new Error('Market quote is stale or has an invalid timestamp.');
  if (quote.candlesAsOf !== undefined && (!Number.isFinite(quote.candlesAsOf) || quote.candlesAsOf < 0 || quote.candlesAsOf > now)) {
    throw new Error('The candle snapshot timestamp is invalid.');
  }
  if (!Array.isArray(quote.candles)) throw new Error('Market candles must be an array.');
  let previous = -Infinity;
  for (const candle of quote.candles) {
    if (!candle || !Number.isFinite(candle.time) || candle.time < 0 || candle.time <= previous || candle.time > now) throw new Error('Candle timestamps must be valid and strictly increasing.');
    if (['open', 'high', 'low', 'close'].some(field => !Number.isFinite(candle[field]) || candle[field] <= 0) ||
        !Number.isFinite(candle.volume) || candle.volume < 0 || candle.high < Math.max(candle.open, candle.close, candle.low) ||
        candle.low > Math.min(candle.open, candle.close, candle.high)) throw new Error('Invalid or nonfinite OHLCV candle data.');
    previous = candle.time;
  }
  return { symbol, source: quote.source.slice(0, 160), asOf: quote.asOf, price: quote.price,
    ...(quote.candlesAsOf === undefined ? {} : { candlesAsOf: quote.candlesAsOf }),
    candles: quote.candles.slice(-500).map(candle => ({
    time: candle.time, open: candle.open, high: candle.high, low: candle.low, close: candle.close, volume: candle.volume,
  })) };
}

function append(session, key, value) {
  session[key].push(value);
  if (session[key].length > LOG_LIMIT) session[key].splice(0, session[key].length - LOG_LIMIT);
}

function reject(session, symbol, reason, now) {
  append(session, 'rejections', { id: randomUUID(), symbol, reason, createdAt: now });
}

function pnlFor(position, price) {
  return (price - position.entryPrice) * position.quantity * (position.side === 'short' ? -1 : 1);
}

function equity(session) {
  // Both long and short entries reserve their entry notional as virtual collateral.
  return session.virtualCash + session.positions.reduce((total, position) => total + position.entryPrice * position.quantity + position.pnl, 0);
}

function recordEquity(session) {
  const value = equity(session);
  session.performance.peakEquity = Math.max(session.performance.peakEquity, value);
  const peak = session.performance.peakEquity;
  if (peak > 0) session.performance.maximumDrawdown = Math.max(session.performance.maximumDrawdown, (peak - value) / peak * 100);
}

function fillOrder(session, symbol, side, quantity, price, now) {
  append(session, 'orders', { id: randomUUID(), symbol, side, quantity, price, status: 'filled', createdAt: now });
}

function closePosition(session, position, price, reason, now) {
  const pnl = pnlFor(position, price);
  session.virtualCash += position.entryPrice * position.quantity + pnl;
  session.positions.splice(session.positions.indexOf(position), 1);
  fillOrder(session, position.symbol, position.side === 'long' ? 'SELL' : 'BUY', position.quantity, price, now);
  append(session, 'trades', { id: randomUUID(), symbol: position.symbol, side: position.side, quantity: position.quantity,
    entryPrice: position.entryPrice, exitPrice: price, pnl, openedAt: position.openedAt, closedAt: now, reason });
  session.performance.completedTrades += 1;
  if (pnl > 0) session.performance.winningTrades += 1;
  session.performance.realizedPnl += pnl;
  session.latestJudgment = `${position.symbol}: ${reason}. Virtual ${position.side} position closed.`;
  recordEquity(session);
}

function protectiveExit(position, config, now) {
  const directionalReturn = (position.currentPrice / position.entryPrice - 1) * (position.side === 'short' ? -100 : 100);
  if (directionalReturn <= -config.stopLoss + 1e-9) return 'Stop loss';
  if (directionalReturn >= config.takeProfit - 1e-9) return 'Take profit';
  if (config.trailingStop > 0) {
    const trailingReturn = position.side === 'long'
      ? (position.currentPrice / position.bestPrice - 1) * 100
      : (1 - position.currentPrice / position.bestPrice) * 100;
    if (trailingReturn <= -config.trailingStop + 1e-9) return 'Trailing stop';
  }
  if (now - position.openedAt >= config.maxHoldingHours * 3600000) return 'Maximum holding time';
  return null;
}

function confirmed(action, price, indicators) {
  return action === 'BUY'
    ? price > indicators.sma20 && indicators.sma20 > indicators.sma50 && indicators.rsi14 >= 50 && indicators.rsi14 <= 75
    : price < indicators.sma20 && indicators.sma20 < indicators.sma50 && indicators.rsi14 >= 25 && indicators.rsi14 <= 50;
}

function normalizeJudgment(judgment) {
  if (!judgment || !['BUY', 'SELL', 'HOLD'].includes(judgment.action) ||
      !Number.isFinite(judgment.confidence) || judgment.confidence < 0 || judgment.confidence > 100 ||
      typeof judgment.reason !== 'string' || !judgment.reason.trim()) throw new Error('AI analysis returned an invalid action, confidence, or reason.');
  return { action: judgment.action, confidence: judgment.confidence, reason: judgment.reason.trim().slice(0, 1000) };
}

function executeDecision(session, symbol, quote, indicators, judgment, now) {
  const { config } = session;
  if (judgment.action === 'HOLD') return;
  if (judgment.confidence < config.minConfidence) return reject(session, symbol, `Confidence ${judgment.confidence}% is below the ${config.minConfidence}% minimum.`, now);
  if (!confirmed(judgment.action, quote.price, indicators)) return reject(session, symbol, 'SMA20/SMA50 trend and RSI14 do not confirm the AI action.', now);
  if (!config.autoTrade) return;
  const position = session.positions.find(item => item.symbol === symbol);
  if (position) {
    if ((position.side === 'long' && judgment.action === 'SELL') || (position.side === 'short' && judgment.action === 'BUY')) {
      closePosition(session, position, quote.price, 'Confirmed AI exit', now);
    } else reject(session, symbol, 'An open virtual position already exists for this symbol.', now);
    return;
  }
  if (judgment.action === 'SELL' && !config.allowShort) return reject(session, symbol, 'Short selling is disabled.', now);
  if (session.positions.some(item => {
    const asOf = session.market[item.symbol]?.asOf;
    return !Number.isFinite(asOf) || asOf > now || now - asOf > QUOTE_MAX_AGE_MS;
  })) return reject(session, symbol, 'Fresh prices for every open position are required to check portfolio exposure.', now);
  const balance = equity(session);
  const notional = balance * config.positionSize / 100;
  const exposure = session.positions.reduce((sum, item) => sum + item.currentPrice * item.quantity, 0);
  if (!Number.isFinite(balance) || balance <= 0 || !Number.isFinite(notional) || notional <= 0) return reject(session, symbol, 'Insufficient virtual equity.', now);
  if (exposure + notional > balance * config.maxExposure / 100 + 1e-8) return reject(session, symbol, 'Maximum portfolio exposure would be exceeded.', now);
  if (notional > session.virtualCash + 1e-8) return reject(session, symbol, 'Insufficient available virtual cash.', now);
  const quantity = notional / quote.price;
  if (!Number.isFinite(quantity) || quantity <= 0) return reject(session, symbol, 'The virtual order quantity is invalid.', now);
  session.virtualCash -= notional;
  session.positions.push({ id: randomUUID(), symbol, side: judgment.action === 'BUY' ? 'long' : 'short', quantity,
    entryPrice: quote.price, openedAt: now, currentPrice: quote.price, pnl: 0, bestPrice: quote.price });
  fillOrder(session, symbol, judgment.action, quantity, quote.price, now);
  recordEquity(session);
}

async function tick(session, { getMarket, analyze, now = Date.now } = {}) {
  if (session.status !== 'running' || activeTicks.has(session)) return session;
  const clock = typeof now === 'function' ? now : () => now;
  const revision = session._revision;
  const validRun = () => {
    if (session.status !== 'running' || session._revision !== revision) return false;
    const current = timestamp(clock());
    if (session.trialEndsAt !== null && current >= session.trialEndsAt) {
      transition(session, 'stop', current);
      session.latestJudgment = 'The seven-day virtual trial has ended. The ledger and open positions are retained.';
      return false;
    }
    return true;
  };
  if (!validRun()) return session;
  activeTicks.add(session);
  const errors = [];
  const fail = (symbol, error) => {
    const reason = (error instanceof Error ? error.message : String(error)).slice(0, 1000);
    errors.push(`${symbol}: ${reason}`);
    reject(session, symbol, reason, clock());
    session.lastError = errors.join(' | ').slice(0, 2000);
    session.latestJudgment = `${symbol}: evaluation unavailable. ${reason}`;
  };
  try {
    session.lastError = null;
    const symbols = [...new Set([...session.config.assets, ...session.positions.map(position => position.symbol)])];
    const results = await Promise.allSettled(symbols.map(symbol => Promise.resolve().then(() => getMarket(symbol, session.config.timeframe))));
    if (!validRun()) return session;
    const quotes = [];
    const evaluations = [];
    // Mark every position and enforce protective exits before awaiting any AI response.
    for (let index = 0; index < symbols.length; index += 1) {
      const symbol = symbols[index];
      const result = results[index];
      try {
        if (result.status === 'rejected') throw result.reason;
        const quote = validateMarket(result.value, symbol, clock());
        session.market[symbol] = quote;
        const currentTime = clock();
        const snapshotTime = Math.min(currentTime, quote.candlesAsOf ?? currentTime);
        const closedCandles = quote.candles.filter(candle => candle.time + TIMEFRAME_MS[session.config.timeframe] <= snapshotTime);
        const candleTime = closedCandles.at(-1)?.time;
        const position = session.positions.find(item => item.symbol === symbol);
        if (position) {
          position.currentPrice = quote.price;
          position.pnl = pnlFor(position, quote.price);
          position.bestPrice = position.side === 'long' ? Math.max(position.bestPrice ?? position.entryPrice, quote.price) : Math.min(position.bestPrice ?? position.entryPrice, quote.price);
        }
        quotes.push({ symbol, quote, candleTime, candles: closedCandles, position });
      } catch (error) { fail(symbol, error); }
    }
    // A portfolio mark uses the entire fetched batch; partial marks would invent peaks.
    recordEquity(session);
    for (const { symbol, quote, candleTime, candles, position } of quotes) {
      try {
        if (position) {
          const reason = protectiveExit(position, session.config, clock());
          if (reason) {
            closePosition(session, position, quote.price, reason, clock());
            session._lastEvaluatedCandles[symbol] = candleTime;
            continue;
          }
        }
        if (candles.length < 50) throw new Error('Insufficient market data: at least 50 closed candles are required.');
        const interval = TIMEFRAME_MS[session.config.timeframe];
        const allowedIntervals = session.config.timeframe === '1d' && STOCKS.includes(symbol) ? 4 : 2;
        if (quote.asOf - (candleTime + interval) > allowedIntervals * interval + QUOTE_MAX_AGE_MS) {
          throw new Error('Closed market candles are stale. Waiting for current historical data.');
        }
        if (session._lastEvaluatedCandles[symbol] === candleTime || !session.config.assets.includes(symbol)) continue;
        evaluations.push({ symbol, quote, candleTime, candles, indicators: calculateIndicators(candles) });
      } catch (error) { fail(symbol, error); }
    }
    if (!validRun()) return session;
    // Independent analysis runs together; all execution remains serial below so
    // exposure checks see every earlier fill in the deterministic asset order.
    const judgments = await Promise.allSettled(evaluations.map(({ symbol, candles, indicators }) =>
      Promise.resolve().then(() => analyze({ symbol, candles, indicators, config: session.config }))));
    if (!validRun()) return session;
    for (let index = 0; index < evaluations.length; index += 1) {
      const { symbol, quote, candleTime, indicators } = evaluations[index];
      try {
        if (judgments[index].status === 'rejected') throw judgments[index].reason;
        const judgment = normalizeJudgment(judgments[index].value);
        validateMarket(quote, symbol, clock());
        const createdAt = clock();
        append(session, 'signals', { id: randomUUID(), symbol, ...judgment, createdAt });
        append(session, 'decisions', { id: randomUUID(), symbol, ...judgment, createdAt });
        session.latestJudgment = `${symbol}: ${judgment.action} (${judgment.confidence}%). ${judgment.reason}`;
        session._lastEvaluatedCandles[symbol] = candleTime;
        executeDecision(session, symbol, quote, indicators, judgment, createdAt);
      } catch (error) {
        if (!validRun()) return session;
        fail(symbol, error);
      }
    }
    recordEquity(session);
  } finally { activeTicks.delete(session); }
  return session;
}

function summarize(session, now = Date.now()) {
  timestamp(now);
  const virtualBalance = equity(session);
  const round = value => Math.round((value + Number.EPSILON) * 1e8) / 1e8;
  return {
    virtualBalance: round(virtualBalance), virtualReturn: round((virtualBalance - session.config.initialBalance) / session.config.initialBalance * 100),
    openPositions: session.positions.length, completedTrades: session.performance.completedTrades,
    measuredAccuracy: session.performance.completedTrades ? round(session.performance.winningTrades / session.performance.completedTrades * 100) : null,
    maximumVirtualDrawdown: round(session.performance.maximumDrawdown), currentRiskLevel: session.config.riskLevel,
    remainingTrialMs: session.trialEndsAt === null ? TRIAL_MS : Math.max(0, session.trialEndsAt - now),
    runtimeMs: runningTime(session, now),
  };
}

module.exports = { DEFAULT_CONFIG, validateConfig, createSession, transition, tick, summarize, calculateIndicators };
