const { test } = require('node:test');
const assert = require('node:assert/strict');
const { lookupIp } = require('../geo');

function providerData(overrides = {}) {
  return {
    ip: '8.8.8.8', is_mobile: false, is_datacenter: true,
    is_vpn: true, is_proxy: true, is_tor: true,
    vpn: { service: 'Example VPN', type: 'exit_node' },
    company: { name: 'Example Network', type: 'business' },
    asn: { asn: 15169, org: 'Example ASN', type: 'hosting' },
    location: { country: 'United States', country_code: 'US', state: 'California', city: 'Mountain View', timezone: 'America/Los_Angeles' },
    ...overrides
  };
}

test('keyed lookup uses POST and preserves overlapping intelligence and compatible geolocation', async (t) => {
  let request;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => providerData() };
  });
  const result = await lookupIp('8.8.8.8', { apiKey: 'unit-test-key' });
  assert.equal(request.url, 'https://api.ipapi.is');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(request.options.body), { q: '8.8.8.8', key: 'unit-test-key' });
  assert.ok(request.options.signal instanceof AbortSignal);
  assert.equal(result.status, 'ok');
  assert.equal(result.provider, 'ipapi.is');
  assert.equal(result.countryCode, 'US');
  assert.equal(result.region, 'California');
  assert.equal(result.city, 'Mountain View');
  assert.equal(result.timeZone, 'America/Los_Angeles');
  assert.equal(result.organization, 'Example Network');
  assert.equal(result.isp, 'Example ASN');
  assert.equal(result.asn, 15169);
  assert.deepEqual(result.network.flags, { vpn: true, proxy: true, tor: true, mobile: false, datacenter: true });
  assert.equal(result.network.status, 'ok');
  assert.equal(result.network.provider, 'ipapi.is');
  assert.equal(result.network.type, 'hosting');
  assert.equal(result.network.organizationType, 'business');
  assert.equal(result.network.vpnService, 'Example VPN');
  assert.ok(Number.isFinite(Date.parse(result.network.checkedAt)));
  assert.ok(!JSON.stringify(result).includes('unit-test-key'));
});

test('environment API key activates intelligence without changing lookup callers', async (t) => {
  const prior = process.env.IPAPI_KEY;
  process.env.IPAPI_KEY = 'environment-test-key';
  t.after(() => { if (prior === undefined) delete process.env.IPAPI_KEY; else process.env.IPAPI_KEY = prior; });
  let request;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => providerData() };
  });
  const result = await lookupIp('8.8.8.8');
  assert.equal(request.url, 'https://api.ipapi.is');
  assert.equal(JSON.parse(request.options.body).key, 'environment-test-key');
  assert.equal(result.network.status, 'ok');
});

test('missing or nonboolean flags remain unknown and make the intelligence partial', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => providerData({ is_vpn: undefined, is_proxy: 'false', is_tor: 0, is_mobile: false, is_datacenter: null, vpn: undefined, company: undefined, asn: undefined }) }));
  const result = await lookupIp('8.8.8.8', { apiKey: 'test-key' });
  assert.deepEqual(result.network.flags, { vpn: null, proxy: null, tor: null, mobile: false, datacenter: null });
  assert.equal(result.network.status, 'partial');
  assert.equal(result.network.type, 'unknown');
  assert.equal(result.network.vpnService, null);
  assert.equal(result.network.organizationType, null);
  assert.equal(result.asn, null);
});

test('mobile takes classification precedence without erasing VPN or hosting flags', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => providerData({ is_mobile: true }) }));
  const result = await lookupIp('8.8.8.8', { apiKey: 'test-key' });
  assert.equal(result.network.type, 'mobile');
  assert.equal(result.network.flags.vpn, true);
  assert.equal(result.network.flags.datacenter, true);
});

test('organization types stay bounded and ISP does not become definite residential', async (t) => {
  let data;
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => data }));
  for (const [companyType, asnType, expected] of [
    ['isp', 'hosting', 'isp'], ['business', 'isp', 'business'],
    ['education', 'business', 'education'], ['government', null, 'government'],
    ['banking', null, 'banking'], ['unrecognized', 'hosting', 'hosting'],
    [null, 'isp', 'isp'], ['residential', null, 'unknown']
  ]) {
    data = providerData({ is_datacenter: false, company: { type: companyType }, asn: { type: asnType } });
    const result = await lookupIp('8.8.8.8', { apiKey: 'test-key' });
    assert.equal(result.network.type, expected);
    assert.ok(!['residential', 'home', 'family'].includes(result.network.type));
  }
});

test('malformed and provider error payloads cannot create successful detections', async (t) => {
  let data;
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => data }));
  for (const value of [null, [], {}, 'not-json-object', { error: 'private provider message', error_code: 'ERR_FORBIDDEN_INVALID_API_KEY' }, { ip: 'invalid', is_vpn: true }]) {
    data = value;
    const result = await lookupIp('8.8.8.8', { apiKey: 'test-key' });
    assert.equal(result.status, 'unavailable');
    assert.equal(result.network.status, 'unavailable');
    assert.deepEqual(result.network.flags, { vpn: null, proxy: null, tor: null, mobile: null, datacenter: null });
    assert.ok(!JSON.stringify(result).includes('private provider message'));
  }
});

test('valid provider IP must match the queried address before accepting intelligence', async (t) => {
  let data;
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => data }));
  for (const [queried, returned] of [
    ['8.8.8.8', '1.1.1.1'],
    ['8.8.8.8', '10.0.0.1'],
    ['8.8.8.8', '2606:4700:4700::1111'],
    ['2606:4700:4700::1111', '2606:4700:4700::1001']
  ]) {
    data = providerData({ ip: returned });
    const result = await lookupIp(queried, { apiKey: 'test-key' });
    assert.equal(result.status, 'unavailable');
    assert.equal(result.network.status, 'unavailable');
    assert.deepEqual(result.network.flags, { vpn: null, proxy: null, tor: null, mobile: null, datacenter: null });
    assert.equal(result.countryCode, undefined);
  }
});

test('equivalent IPv6 spellings and dotted IPv4 mapped replies match their queried IP', async (t) => {
  let data;
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => data }));
  for (const [queried, returned] of [
    ['2606:4700:4700:0000:0000:0000:0000:1111', '2606:4700:4700::1111'],
    ['2606:4700:4700::1111', '2606:4700:4700:0:0:0:0:1111'],
    ['2606:4700:4700:ABCD::1111', '2606:4700:4700:abcd::1111'],
    ['8.8.8.8', '::ffff:8.8.8.8']
  ]) {
    data = providerData({ ip: returned });
    const result = await lookupIp(queried, { apiKey: 'test-key' });
    assert.equal(result.status, 'ok');
    assert.equal(result.network.flags.vpn, true);
  }
});

test('timeout, invalid JSON, and rejected key return unavailable without automatic retries', async (t) => {
  let mode;
  let requests = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    requests++;
    if (mode === 'timeout') throw new Error('secret error containing test-key');
    if (mode === 'json') return { ok: true, json: async () => { throw new SyntaxError('Bad JSON'); } };
    return { ok: false, status: 403 };
  });
  for (mode of ['timeout', 'json', 'key']) {
    const result = await lookupIp('8.8.8.8', { apiKey: 'test-key' });
    assert.equal(result.status, 'unavailable');
    assert.equal(result.network.status, 'unavailable');
    assert.ok(!JSON.stringify(result).includes('test-key'));
  }
  assert.equal(requests, 3);
});

test('provider quota cooldown honors Retry-After before allowing another lookup', async (t) => {
  const start = Date.now() - 600000;
  let now = start;
  let requests = 0;
  t.mock.method(Date, 'now', () => now);
  t.mock.method(globalThis, 'fetch', async () => {
    requests++;
    if (requests === 1) return { ok: false, status: 429, headers: new Headers({ 'Retry-After': '120' }) };
    return { ok: true, json: async () => providerData() };
  });
  const first = await lookupIp('8.8.8.8', { apiKey: 'test-key' });
  assert.equal(first.network.status, 'unavailable');
  now = start + 119000;
  const during = await lookupIp('1.1.1.1', { apiKey: 'test-key' });
  assert.equal(during.network.status, 'unavailable');
  assert.equal(during.network.checkedAt, null);
  assert.equal(requests, 1);
  now = start + 120000;
  assert.equal((await lookupIp('8.8.8.8', { apiKey: 'test-key' })).network.status, 'ok');
  assert.equal(requests, 2);
});
