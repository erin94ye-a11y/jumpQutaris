const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const { clientIp, lookupIp } = require('./geo');

const NOTICE_VERSION = '2026-09-11-auto';
const RETENTION_MS = 30 * 86400000;
const SESSION_MS = 8 * 3600000;
const publicFiles = { '/': 'index.html', '/admin': 'admin.html', '/style.css': 'style.css', '/visit.js': 'visit.js', '/admin.js': 'admin.js', '/locale.js': 'locale.js', '/visit-messages.js': 'visit-messages.js', '/admin-messages.js': 'admin-messages.js', '/admin-translations.js': 'admin-translations.js' };
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

function httpError(status, message) { return Object.assign(new Error(message), { status }); }

async function readJson(request) {
  if (!/^application\/json(?:;|$)/i.test(request.headers['content-type'] || '')) throw httpError(415, 'JSON required');
  const chunks = []; let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 16384) throw httpError(413, 'Request too large');
    chunks.push(chunk);
  }
  try {
    const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error();
    return data;
  } catch { throw httpError(400, 'Invalid JSON'); }
}

function cleanEnvironment(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw httpError(400, 'Invalid environment');
  const result = {};
  for (const key of ['language', 'timeZone', 'platform', 'vendor', 'userAgent', 'deviceType', 'colorScheme', 'effectiveType', 'uaPlatform', 'uaPlatformVersion', 'architecture', 'model', 'bitness', 'browserVersion']) {
    if (input[key] == null) continue;
    if (typeof input[key] !== 'string' || input[key].length > (key === 'userAgent' ? 1000 : 200)) throw httpError(400, `Invalid ${key}`);
    result[key] = input[key];
  }
  for (const key of ['screenWidth', 'screenHeight', 'availableWidth', 'availableHeight', 'viewportWidth', 'viewportHeight', 'pixelRatio', 'colorDepth', 'hardwareConcurrency', 'deviceMemory', 'maxTouchPoints', 'downlink', 'rtt']) {
    if (input[key] == null) continue;
    if (typeof input[key] !== 'number' || !Number.isFinite(input[key]) || input[key] < 0 || input[key] > 100000) throw httpError(400, `Invalid ${key}`);
    result[key] = input[key];
  }
  if (input.timezoneOffset != null) {
    if (!Number.isInteger(input.timezoneOffset) || Math.abs(input.timezoneOffset) > 1440) throw httpError(400, 'Invalid timezoneOffset');
    result.timezoneOffset = input.timezoneOffset;
  }
  for (const key of ['cookiesEnabled', 'online', 'saveData', 'mobile', 'pdfViewerEnabled']) {
    if (input[key] == null) continue;
    if (typeof input[key] !== 'boolean') throw httpError(400, `Invalid ${key}`);
    result[key] = input[key];
  }
  if (input.languages != null) {
    if (!Array.isArray(input.languages) || input.languages.length > 20 || input.languages.some(x => typeof x !== 'string' || x.length > 100)) throw httpError(400, 'Invalid languages');
    result.languages = input.languages;
  }
  return result;
}

function createApp({ dataDir, password, origin = '', secure = false, trustedProxyHops = 0, lookup = lookupIp }) {
  if (typeof password !== 'string' || password.length < 16) throw new Error('Administrator password must contain at least 16 characters.');
  if (!Number.isInteger(trustedProxyHops) || trustedProxyHops < 0 || trustedProxyHops > 10) throw new Error('Invalid TRUST_PROXY_HOPS');
  fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(path.join(dataDir, 'visits.sqlite'));
  db.exec('PRAGMA journal_mode=WAL; PRAGMA secure_delete=ON; CREATE TABLE IF NOT EXISTS visits (id TEXT PRIMARY KEY, created_at INTEGER NOT NULL, record TEXT NOT NULL); CREATE INDEX IF NOT EXISTS visits_created ON visits(created_at DESC);');
  const purge = () => { db.prepare('DELETE FROM visits WHERE created_at < ?').run(Date.now() - RETENTION_MS); db.exec('PRAGMA wal_checkpoint(TRUNCATE)'); };
  purge();
  const sessions = new Map(); const limits = new Map(); const visitTokens = new Map(); const pendingLookups = new Set();
  const salt = crypto.randomBytes(32); const passwordHash = crypto.scryptSync(password, salt, 64);
  const maintenance = setInterval(() => {
    try { purge(); } catch { console.error('Retention maintenance failed; check storage.'); }
    for (const [key, value] of sessions) if (value < Date.now()) sessions.delete(key);
    for (const [key, value] of limits) if (value.until < Date.now()) limits.delete(key);
    for (const [key, value] of visitTokens) if (value.until < Date.now()) visitTokens.delete(key);
  }, 60000).unref();
  const json = (response, status, data) => { response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); response.end(JSON.stringify(data)); };
  const limit = (key, max, windowMs) => {
    const now = Date.now(); let item = limits.get(key);
    if (!item || item.until < now) {
      if (limits.size > 10000) throw httpError(429, 'Busy; please try later');
      item = { count: 0, until: now + windowMs }; limits.set(key, item);
    }
    if (++item.count > max) throw httpError(429, 'Too many attempts; please try later');
  };
  const sessionToken = request => /(?:^|;\s*)visitor_session=([a-f0-9]{64})(?:;|$)/.exec(request.headers.cookie || '')?.[1];
  const requireSession = request => {
    const token = sessionToken(request);
    if (!token || !sessions.has(token) || sessions.get(token) < Date.now()) { if (token) sessions.delete(token); throw httpError(401, 'Please sign in'); }
    return token;
  };
  const sessionCookie = (token, age) => `visitor_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${secure ? '; Secure' : ''}`;
  function createVisit(request) {
    const ip = clientIp(request, trustedProxyHops);
    limit(`entry:${ip}`, 20, 60000); limit('entry:global', 200, 60000);
    const now = Date.now(); const id = crypto.randomUUID();
    const record = {
      id, createdAt: new Date(now).toISOString(), expiresAt: new Date(now + RETENTION_MS).toISOString(),
      collectionMode: 'automatic', noticeVersion: NOTICE_VERSION, ip,
      ipSource: trustedProxyHops ? `trusted-proxy-${trustedProxyHops}-hops` : 'direct-connection',
      userAgent: String(request.headers['user-agent'] || '').slice(0, 1000),
      acceptLanguage: String(request.headers['accept-language'] || '').slice(0, 500),
      environment: {}, geo: { status: 'pending', network: { status: 'pending' } }
    };
    db.prepare('INSERT INTO visits (id, created_at, record) VALUES (?, ?, ?)').run(id, now, JSON.stringify(record));
    const token = crypto.randomBytes(32).toString('hex');
    visitTokens.set(token, { id, ip, until: now + 10 * 60000 });
    // Save the baseline before sending HTML. Enrichment must not delay the page.
    const job = Promise.resolve().then(() => lookup(ip)).catch(() => ({ status: 'unavailable', network: { status: 'unavailable' } })).then(geo => {
      const latest = db.prepare('SELECT record FROM visits WHERE id = ? AND created_at >= ?').get(id, Date.now() - RETENTION_MS);
      if (!latest) return;
      const current = JSON.parse(latest.record);
      current.geo = geo;
      db.prepare('UPDATE visits SET record = ? WHERE id = ?').run(JSON.stringify(current), id);
    }).catch(() => console.error('IP enrichment failed; check storage configuration.')).finally(() => pendingLookups.delete(job));
    pendingLookups.add(job);
    return { token, id };
  }
  const server = http.createServer(async (request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
    response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    if (secure) response.setHeader('Strict-Transport-Security', 'max-age=31536000');
    try {
      const url = new URL(request.url, 'http://localhost');
      const route = url.pathname;
      if (request.method === 'GET' && publicFiles[route]) {
        const file = path.join(__dirname, 'public', publicFiles[route]);
        let content = fs.readFileSync(file, 'utf8');
        if (route === '/') {
          const visit = createVisit(request);
          content = content.replace('__VISIT_TOKEN__', visit.token).replaceAll('__VISIT_ID__', visit.id);
        }
        response.setHeader('Content-Type', mime[path.extname(file)]); response.end(content); return;
      }
      if (request.method === 'GET' && route === '/robots.txt') { response.end('User-agent: *\nDisallow: /\n'); return; }
      if (request.method === 'GET' && route === '/api/visits') {
        requireSession(request);
        const page = Math.max(1, Math.min(1000000, Number.parseInt(url.searchParams.get('page'), 10) || 1));
        const cutoff = Date.now() - RETENTION_MS;
        const total = db.prepare('SELECT COUNT(*) AS n FROM visits WHERE created_at >= ?').get(cutoff).n;
        const records = db.prepare('SELECT record FROM visits WHERE created_at >= ? ORDER BY created_at DESC, id DESC LIMIT 25 OFFSET ?').all(cutoff, (page - 1) * 25).map(row => JSON.parse(row.record));
        json(response, 200, { records, total, page, pageSize: 25, networkConfigured: Boolean(process.env.IPAPI_KEY?.trim()) }); return;
      }
      if (request.method !== 'POST' || !['/api/login', '/api/logout', '/api/delete', '/api/visits'].includes(route)) throw httpError(404, 'Not found');
      const expectedOrigin = origin || `http://${request.headers.host}`;
      if (request.headers.origin !== expectedOrigin || request.headers['sec-fetch-site'] === 'cross-site') throw httpError(403, 'Same-origin request required');
      const ip = clientIp(request, trustedProxyHops);
      if (route === '/api/login') { limit(`login:${ip}`, 8, 15 * 60000); limit('login:global', 200, 15 * 60000); }
      if (route === '/api/visits') { limit(`visit:${ip}`, 20, 60000); limit('visit:global', 200, 60000); }
      if (route === '/api/delete' || route === '/api/logout') requireSession(request);
      const body = await readJson(request);
      if (route === '/api/login') {
        if (typeof body.password !== 'string' || body.password.length > 1024) throw httpError(401, 'Incorrect password');
        const hash = await new Promise((resolve, reject) => crypto.scrypt(body.password, salt, 64, (error, key) => error ? reject(error) : resolve(key)));
        if (!crypto.timingSafeEqual(hash, passwordHash)) throw httpError(401, 'Incorrect password');
        const old = sessionToken(request); if (old) sessions.delete(old);
        if (sessions.size >= 1000) sessions.delete(sessions.keys().next().value);
        const token = crypto.randomBytes(32).toString('hex'); sessions.set(token, Date.now() + SESSION_MS);
        response.setHeader('Set-Cookie', sessionCookie(token, SESSION_MS / 1000)); json(response, 200, { ok: true }); return;
      }
      if (route === '/api/logout') {
        sessions.delete(sessionToken(request)); response.setHeader('Set-Cookie', sessionCookie('', 0)); json(response, 200, { ok: true }); return;
      }
      if (route === '/api/delete') {
        if (typeof body.id !== 'string' || body.id.length > 100) throw httpError(400, 'Invalid record ID');
        const result = db.prepare('DELETE FROM visits WHERE id = ?').run(body.id);
        db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
        if (!result.changes) throw httpError(404, 'Record not found');
        json(response, 200, { ok: true }); return;
      }
      const visit = typeof body.visitToken === 'string' && body.visitToken.length === 64 ? visitTokens.get(body.visitToken) : null;
      if (!visit || visit.until < Date.now() || visit.ip !== ip) throw httpError(400, 'Invalid or expired page token');
      const environment = cleanEnvironment(body.environment);
      const existing = db.prepare('SELECT record FROM visits WHERE id = ? AND created_at >= ?').get(visit.id, Date.now() - RETENTION_MS);
      if (!existing) throw httpError(404, 'Record not found');
      const record = JSON.parse(existing.record);
      record.environment = environment;
      record.environmentUpdatedAt = new Date().toISOString();
      db.prepare('UPDATE visits SET record = ? WHERE id = ?').run(JSON.stringify(record), visit.id);
      json(response, 200, { id: visit.id, expiresAt: record.expiresAt });
    } catch (error) {
      if (!error.status) console.error('Request failed; check application/storage configuration.');
      if (!response.headersSent && !response.destroyed) json(response, error.status || 500, { error: error.status ? error.message : 'Service unavailable; please try again' });
    }
  });
  server.requestTimeout = 15000; server.headersTimeout = 10000;
  return { server, close: () => new Promise((resolve, reject) => { clearInterval(maintenance); server.close(async error => { await Promise.allSettled(pendingLookups); db.close(); error ? reject(error) : resolve(); }); server.closeIdleConnections(); }) };
}

if (require.main === module) {
  const production = process.env.NODE_ENV === 'production';
  const origin = (process.env.PUBLIC_ORIGIN || '').replace(/\/$/, '');
  if (production && (!origin.startsWith('https://') || !process.env.ADMIN_PASSWORD)) throw new Error('Production requires HTTPS PUBLIC_ORIGIN and ADMIN_PASSWORD.');
  if (origin && new URL(origin).origin !== origin) throw new Error('PUBLIC_ORIGIN must be an origin, without a path.');
  const dataDir = path.resolve(process.env.DATA_DIR || path.join(__dirname, 'data'));
  let password = process.env.ADMIN_PASSWORD;
  if (!password) {
    fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
    const credentialsFile = path.join(dataDir, 'local-credentials.json');
    if (fs.existsSync(credentialsFile)) password = JSON.parse(fs.readFileSync(credentialsFile, 'utf8')).password;
    else { password = crypto.randomBytes(24).toString('base64url'); fs.writeFileSync(credentialsFile, JSON.stringify({ password }, null, 2), { mode: 0o600 }); }
    console.log(`Local administrator password is stored in: ${credentialsFile}`);
  }
  const app = createApp({ dataDir, password, origin, secure: production || origin.startsWith('https://'), trustedProxyHops: Number(process.env.TRUST_PROXY_HOPS || 0) });
  const host = process.env.HOST || (production ? '0.0.0.0' : '127.0.0.1');
  const port = Number(process.env.PORT || 4180);
  app.server.listen(port, host, () => console.log(`Visitor check: http://${host}:${port} | Administrator: /admin`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => app.close().then(() => process.exit(0)));
}

module.exports = { createApp, cleanEnvironment };
