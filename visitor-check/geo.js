const net = require('node:net');

function normalizeIp(value) {
  const ip = String(value || '').trim().replace(/^::ffff:/i, '');
  return net.isIP(ip) ? ip : '';
}

function clientIp(request, trustedProxyHops = 0) {
  const peer = normalizeIp(request.socket.remoteAddress);
  if (!trustedProxyHops) return peer;
  const chain = String(request.headers['x-forwarded-for'] || '').split(',').map(normalizeIp);
  // Choose from the server end of the chain, never a caller-selected first value.
  if (chain.length < trustedProxyHops || chain.some(ip => !ip)) return peer;
  return chain[chain.length - trustedProxyHops];
}

function isPublicIp(ip) {
  if (net.isIP(ip) === 4) {
    const [a, b, c] = ip.split('.').map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && (b === 168 || (b === 0 && (c === 0 || c === 2)))) ||
      (a === 100 && b >= 64 && b <= 127) || (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
      (a === 203 && b === 0 && c === 113));
  }
  return net.isIP(ip) === 6 && /^[23]/i.test(ip) && !/^2001:(db8|0):/i.test(ip);
}

const text = value => typeof value === 'string' ? value.trim().slice(0, 200) || null : null;
const organizationTypes = new Set(['hosting', 'isp', 'business', 'education', 'government', 'banking']);
let intelligenceRetryAt = 0;

function canonicalIp(value) {
  const ip = normalizeIp(value);
  // URL host normalization compares expanded, compressed, and mixed-case IPv6 equally.
  return net.isIP(ip) === 6 ? new URL(`http://[${ip}]`).hostname : ip;
}

function emptyNetwork(status, message, checkedAt = null) {
  return {
    status, provider: 'ipapi.is', checkedAt,
    flags: { vpn: null, proxy: null, tor: null, mobile: null, datacenter: null },
    type: 'unknown', vpnService: null, organizationType: null, message
  };
}

function retryDelay(response) {
  const value = response.headers?.get?.('retry-after');
  if (!value) return 60000;
  const seconds = Number(value);
  const delay = Number.isFinite(seconds) && seconds >= 0 ? seconds * 1000 : Date.parse(value) - Date.now();
  return Number.isFinite(delay) ? Math.max(1000, delay) : 60000;
}

async function lookupNetwork(ip, apiKey) {
  const unavailable = checkedAt => ({
    status: 'unavailable', message: 'Lookup failed, timed out, or reached provider limits.',
    network: emptyNetwork('unavailable', 'Network intelligence is temporarily unavailable.', checkedAt)
  });
  if (Date.now() < intelligenceRetryAt) return unavailable(null);
  const checkedAt = new Date(Date.now()).toISOString();
  try {
    const response = await fetch('https://api.ipapi.is', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: ip, key: apiKey }), signal: AbortSignal.timeout(4500)
    });
    if (response.status === 429) intelligenceRetryAt = Math.max(intelligenceRetryAt, Date.now() + retryDelay(response));
    if (!response.ok) return unavailable(checkedAt);
    const data = await response.json();
    if (!data || typeof data !== 'object' || Array.isArray(data) || data.error || data.error_code || canonicalIp(data.ip) !== canonicalIp(ip)) return unavailable(checkedAt);

    const flags = {};
    for (const name of ['vpn', 'proxy', 'tor', 'mobile', 'datacenter']) {
      // Treat missing and nonboolean values as unknown, never a negative detection.
      flags[name] = typeof data[`is_${name}`] === 'boolean' ? data[`is_${name}`] : null;
    }
    const companyType = text(data.company?.type);
    const asnType = text(data.asn?.type);
    const organizationType = organizationTypes.has(companyType) ? companyType : organizationTypes.has(asnType) ? asnType : null;
    const partial = Object.values(flags).some(value => value === null);
    const network = {
      status: partial ? 'partial' : 'ok', provider: 'ipapi.is', checkedAt,
      flags, type: flags.mobile === true ? 'mobile' : flags.datacenter === true ? 'hosting' : organizationType || 'unknown',
      vpnService: flags.vpn === true ? text(data.vpn?.service) : null,
      organizationType,
      message: partial ? 'Some network signals are unavailable. Missing signals are unknown.' : 'IP database signals are estimates. Not detected does not mean absent.'
    };
    return {
      status: 'ok', provider: 'ipapi.is',
      country: text(data.location?.country), countryCode: text(data.location?.country_code),
      region: text(data.location?.state), city: text(data.location?.city),
      isp: text(data.asn?.org) || text(data.company?.name),
      organization: text(data.company?.name) || text(data.asn?.org),
      asn: Number.isSafeInteger(data.asn?.asn) ? data.asn.asn : null,
      timeZone: text(data.location?.timezone), network
    };
  } catch {
    // Do not echo provider error bodies, request addresses, or credentials.
    return unavailable(checkedAt);
  }
}

async function lookupIp(ip, { apiKey = process.env.IPAPI_KEY } = {}) {
  if (!isPublicIp(ip)) return {
    status: 'local', message: 'Local or reserved address; no geolocation available.',
    network: emptyNetwork('local', 'Local or reserved address; no network intelligence available.')
  };
  if (typeof apiKey === 'string' && apiKey.trim()) return lookupNetwork(ip, apiKey.trim());
  const network = emptyNetwork('not_configured', 'Network intelligence requires a configured provider API key.');
  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, { signal: AbortSignal.timeout(4500) });
    if (!response.ok) throw new Error('provider unavailable');
    const data = await response.json();
    if (data.success !== true) throw new Error('lookup unavailable');
    return { status: 'ok', provider: 'ipwho.is', country: text(data.country), countryCode: text(data.country_code), region: text(data.region), city: text(data.city), isp: text(data.connection?.isp), organization: text(data.connection?.org), asn: Number.isSafeInteger(data.connection?.asn) ? data.connection.asn : null, timeZone: text(data.timezone?.id), network };
  } catch {
    return { status: 'unavailable', message: 'Lookup failed, timed out, or reached provider limits.', network };
  }
}

module.exports = { normalizeIp, clientIp, isPublicIp, lookupIp };
