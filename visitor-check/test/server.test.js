const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

test('automatic entry, private persistence and authenticated lifecycle', async (t) => {
  // Missing automatic recording, auth, filtering, origin enforcement or logout must break this test.
  const { createApp } = require('../server');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'visitor-test-'));
  const app = createApp({ dataDir: dir, password: 'test-password-long-enough', lookup: async () => { throw new Error('offline'); } });
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { await app.close(); fs.rmSync(dir, { recursive: true, force: true }); });
  const base = `http://127.0.0.1:${app.server.address().port}`;
  const request = (route, data, cookie, extra = {}) => fetch(base + route, {
    method: data === undefined ? 'GET' : 'POST',
    headers: { Origin: base, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}), ...extra },
    ...(data === undefined ? {} : { body: JSON.stringify(data) })
  });
  assert.equal((await request('/api/visits')).status, 401);
  assert.equal((await request('/api/visits', { consent: false })).status, 400);
  const login = await request('/api/login', { password: 'test-password-long-enough' });
  assert.equal(login.status, 200);
  const cookie = login.headers.get('set-cookie').split(';')[0];
  assert.match(login.headers.get('set-cookie'), /HttpOnly/);
  assert.match(login.headers.get('set-cookie'), /SameSite=Strict/);
  assert.equal((await (await request('/api/visits', undefined, cookie)).json()).total, 0);
  const entry = await request('/');
  const html = await entry.text();
  const visitToken = /name="visit-token" content="([a-f0-9]{64})"/.exec(html)?.[1];
  assert.ok(visitToken, 'entry must carry a single-record update token');
  const baseline = await (await request('/api/visits', undefined, cookie)).json();
  assert.equal(baseline.total, 1, 'record exists even without JavaScript');
  assert.ok(html.includes(baseline.records[0].id), 'initial HTML exposes the baseline reference without JavaScript');
  assert.equal(baseline.records[0].collectionMode, 'automatic');
  assert.equal(baseline.records[0].consentVersion, undefined, 'automatic records must not claim consent');
  const payload = { visitToken, environment: { language: 'en-US', languages: ['en-US', 'en'], timeZone: 'America/New_York', platform: 'Win32', screenWidth: 1920, injectedSecret: 'discard' } };
  assert.equal((await request('/api/visits', payload, undefined, { Origin: 'https://evil.example' })).status, 403);
  const saved = await request('/api/visits', payload, undefined, { 'X-Forwarded-For': '8.8.8.8' });
  assert.equal(saved.status, 200);
  const savedBody = await saved.json();
  assert.ok(savedBody.id);
  assert.equal(savedBody.id, baseline.records[0].id);
  assert.equal((await request('/api/visits', payload)).status, 200, 'a retry updates the same record');
  assert.equal((await request('/api/visits', { ...payload, visitToken: 'f'.repeat(64) })).status, 400);
  const list = await (await request('/api/visits', undefined, cookie)).json();
  assert.equal(list.total, 1);
  assert.equal(list.records[0].ip, '127.0.0.1');
  assert.equal(list.records[0].environment.language, 'en-US');
  assert.equal(list.records[0].environment.injectedSecret, undefined);
  assert.equal(list.records[0].geo.status, 'unavailable');
  assert.equal(list.records[0].nationality, undefined);
  assert.equal(list.records[0].createdAt, baseline.records[0].createdAt);
  assert.equal((await request('/admin')).status, 200);
  assert.equal((await request('/visit.js')).status, 200);
  assert.equal((await (await request('/api/visits', undefined, cookie)).json()).total, 1, 'assets and admin do not create visits');
  assert.ok(fs.statSync(path.join(dir, 'visits.sqlite')).size > 0);
  for (const route of ['/server.js', '/data/visits.sqlite', '/.local-credentials.json', '/package.json']) {
    assert.equal((await request(route)).status, 404);
  }
  const malformed = await fetch(base + '/api/visits', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400);
  assert.equal((await request('/api/visits', { ...payload, environment: { screenWidth: -1 } })).status, 400);
  const oversized = await request('/api/visits', { ...payload, junk: 'x'.repeat(17000) });
  assert.equal(oversized.status, 413);
  assert.equal((await request('/api/delete', { id: savedBody.id })).status, 401);
  assert.equal((await request('/api/delete', { id: savedBody.id }, cookie)).status, 200);
  assert.equal((await (await request('/api/visits', undefined, cookie)).json()).total, 0);
  assert.equal((await request('/api/logout', {}, cookie)).status, 200);
  assert.equal((await request('/api/visits', undefined, cookie)).status, 401);
  assert.equal((await request('/api/login', { password: 'incorrect' })).status, 401);
});

test('records survive restart and older records expire', async (t) => {
  const { createApp } = require('../server');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'visitor-retain-'));
  let app;
  t.after(async () => { if (app) await app.close(); fs.rmSync(dir, { recursive: true, force: true }); });
  const opts = { dataDir: dir, password: 'test-password-long-enough', lookup: async () => ({ status: 'ok', countryCode: 'US', country: 'United States' }) };
  app = createApp(opts);
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  let base = `http://127.0.0.1:${app.server.address().port}`;
  await fetch(base + '/');
  await app.close(); app = null;
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync(path.join(dir, 'visits.sqlite'));
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM visits').get().n, 1);
  db.prepare('UPDATE visits SET created_at = ?').run(Date.now() - 31 * 86400000); db.close();
  app = createApp(opts);
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${app.server.address().port}`;
  const login = await fetch(base + '/api/login', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: JSON.stringify({ password: opts.password }) });
  const list = await fetch(base + '/api/visits', { headers: { Cookie: login.headers.get('set-cookie').split(';')[0] } });
  assert.equal((await list.json()).total, 0);
});

test('slow IP lookup does not block page or lose device update, deletion never resurrects', async (t) => {
  const { createApp } = require('../server');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'visitor-async-'));
  const resolvers = [];
  const app = createApp({ dataDir: dir, password: 'test-password-long-enough', lookup: () => new Promise(resolve => resolvers.push(resolve)) });
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { resolvers.forEach(resolve => resolve({ status: 'ok' })); await app.close(); fs.rmSync(dir, { recursive: true, force: true }); });
  const base = `http://127.0.0.1:${app.server.address().port}`;
  const post = (route, body, cookie) => fetch(base + route, { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, body: JSON.stringify(body) });
  const login = await post('/api/login', { password: 'test-password-long-enough' });
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const list = async () => (await fetch(base + '/api/visits', { headers: { Cookie: cookie } })).json();
  const first = await fetch(base, { signal: AbortSignal.timeout(1500) });
  const firstToken = /name="visit-token" content="([a-f0-9]{64})"/.exec(await first.text())?.[1];
  assert.ok(firstToken);
  const saved = await (await post('/api/visits', { visitToken: firstToken, environment: { language: 'en-US' } })).json();
  resolvers[0]({ status: 'ok', countryCode: 'US', network: { status: 'ok', flags: { vpn: true } } });
  await new Promise(resolve => setImmediate(resolve));
  const row = (await list()).records[0];
  assert.equal(row.environment.language, 'en-US');
  assert.equal(row.geo.network.flags.vpn, true);
  await post('/api/delete', { id: saved.id }, cookie);
  const second = await fetch(base);
  const secondToken = /name="visit-token" content="([a-f0-9]{64})"/.exec(await second.text())?.[1];
  const secondId = (await list()).records[0].id;
  await post('/api/delete', { id: secondId }, cookie);
  resolvers[1]({ status: 'ok', countryCode: 'US' });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal((await list()).total, 0);
  assert.equal((await post('/api/visits', { visitToken: secondToken, environment: {} })).status, 404);
});

test('secure sessions expire and repeated password guesses are throttled', async (t) => {
  const { createApp } = require('../server');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'visitor-auth-'));
  const app = createApp({ dataDir: dir, password: 'test-password-long-enough', origin: 'https://check.example.com', secure: true });
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { await app.close(); fs.rmSync(dir, { recursive: true, force: true }); });
  const base = `http://127.0.0.1:${app.server.address().port}`;
  const login = password => fetch(base + '/api/login', { method: 'POST', headers: { Origin: 'https://check.example.com', 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
  const success = await login('test-password-long-enough');
  assert.equal(success.status, 200);
  assert.match(success.headers.get('set-cookie'), /; Secure/);
  const cookie = success.headers.get('set-cookie').split(';')[0];
  for (let i = 0; i < 7; i++) assert.equal((await login('wrong')).status, 401);
  assert.equal((await login('wrong')).status, 429);
  const later = Date.now() + 9 * 3600000;
  t.mock.method(Date, 'now', () => later);
  assert.equal((await fetch(base + '/api/visits', { headers: { Cookie: cookie } })).status, 401);
});
