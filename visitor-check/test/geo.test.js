const { test } = require('node:test');
const assert = require('node:assert/strict');
const { clientIp, isPublicIp, lookupIp } = require('../geo');

test('forwarded IP selection counts from trusted server end', () => {
  const req = { socket: { remoteAddress: '::ffff:127.0.0.1' }, headers: { 'x-forwarded-for': '1.2.3.4, 8.8.8.8, 10.0.0.2' } };
  assert.equal(clientIp(req, 0), '127.0.0.1');
  assert.equal(clientIp(req, 1), '10.0.0.2');
  assert.equal(clientIp(req, 2), '8.8.8.8');
  assert.equal(clientIp(req, 4), '127.0.0.1');
  req.headers['x-forwarded-for'] = 'not-an-ip';
  assert.equal(clientIp(req, 1), '127.0.0.1');
});

test('local and reserved addresses never go to geolocation provider', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('Must not be called'); });
  for (const ip of ['127.0.0.1', '10.0.0.1', '192.168.1.1', '172.31.1.1', '100.64.0.1', '169.254.0.1', '::1', 'fc00::1', 'fe80::1', '2001:db8::1']) {
    assert.equal(isPublicIp(ip), false);
    const result = await lookupIp(ip, { apiKey: 'test-key' });
    assert.equal(result.status, 'local');
    assert.equal(result.network.status, 'local');
    assert.equal(result.network.checkedAt, null);
    assert.deepEqual(result.network.flags, { vpn: null, proxy: null, tor: null, mobile: null, datacenter: null });
  }
  assert.equal(isPublicIp('8.8.8.8'), true);
  assert.equal(isPublicIp('2606:4700:4700::1111'), true);
});

test('provider response is mapped without inventing a nationality or VPN result', async (t) => {
  t.mock.method(globalThis, 'fetch', async url => {
    assert.equal(url, 'https://ipwho.is/8.8.8.8');
    return { ok: true, json: async () => ({ success: true, country: 'United States', country_code: 'US', region: 'California', city: 'Mountain View', connection: { asn: 15169, isp: 'Google LLC', org: 'Google LLC' }, timezone: { id: 'America/Los_Angeles' } }) };
  });
  const result = await lookupIp('8.8.8.8', { apiKey: '' });
  assert.equal(result.countryCode, 'US');
  assert.equal(result.isAmerican, undefined);
  assert.equal(result.vpn, undefined);
  assert.equal(result.asn, 15169);
  assert.equal(result.network.status, 'not_configured');
  assert.equal(result.network.type, 'unknown');
  assert.equal(result.network.checkedAt, null);
  assert.deepEqual(result.network.flags, { vpn: null, proxy: null, tor: null, mobile: null, datacenter: null });
});

test('provider rejection becomes unavailable instead of fabricated location', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 429 }));
  const result = await lookupIp('8.8.8.8', { apiKey: '' });
  assert.equal(result.status, 'unavailable');
  assert.equal(result.countryCode, undefined);
  assert.equal(result.network.status, 'not_configured');
});
