'use strict';
const $ = id => document.getElementById(id);
const t = (key, vars) => window.SiteLocale.t(window.AdminMessages, key, vars);
let page = 1; let totalPages = 1; let selected = null; let deleting = false; let cachedRecords = null;
const statusMessages = new Map();
const environmentFields = ['language', 'languages', 'timeZone', 'timezoneOffset', 'platform', 'vendor', 'userAgent', 'deviceType', 'colorScheme', 'effectiveType', 'uaPlatform', 'uaPlatformVersion', 'architecture', 'model', 'bitness', 'browserVersion', 'screenWidth', 'screenHeight', 'availableWidth', 'availableHeight', 'viewportWidth', 'viewportHeight', 'pixelRatio', 'colorDepth', 'hardwareConcurrency', 'deviceMemory', 'maxTouchPoints', 'downlink', 'rtt', 'cookiesEnabled', 'online', 'saveData', 'mobile', 'pdfViewerEnabled'];
const geoFields = ['status', 'country', 'countryCode', 'region', 'city', 'isp', 'organization', 'asn', 'timeZone', 'provider', 'message'];
const networkTypes = new Set(['mobile', 'hosting', 'isp', 'business', 'education', 'government', 'banking', 'unknown']);
const networkStatuses = new Set(['ok', 'partial', 'pending', 'not_configured', 'unavailable', 'local']);
const networkFlags = ['vpn', 'proxy', 'tor', 'mobile', 'datacenter'];
function setStatus(id, key, vars) { statusMessages.set(id, { key, vars }); $(id).textContent = key ? t(key, vars) : ''; }
function errorKey(error) { return ['rateLimited', 'sessionExpired', 'requestFailed'].includes(error.code) ? error.code : 'requestFailed'; }
function valueText(value) { return value === null || value === undefined || value === '' ? t('unknown') : Array.isArray(value) ? value.join(', ') : typeof value === 'boolean' ? t(value ? 'yes' : 'no') : String(value); }
function time(value) { if (!value) return t('unknown'); const date = new Date(value); return Number.isNaN(date.getTime()) ? t('unknown') : date.toLocaleString(window.SiteLocale.locale, { hour12: false }); }
function flagText(value) { return t(value === true ? 'detected' : value === false ? 'notDetected' : 'unknownFlag'); }
function networkType(network) { return t(`network_type_${networkTypes.has(network?.type) ? network.type : 'unknown'}`); }
function networkStatus(status) { return networkStatuses.has(status) ? t(`network_status_${status}`) : t('unknown'); }
function ipSource(value) { const match = /^trusted-proxy-(\d+)-hops$/.exec(value || ''); return value === 'direct-connection' ? t('directConnection') : match ? t('trustedProxy', { hops: match[1] }) : value; }
function environmentValue(key, value) {
  if (key === 'deviceType') { const label = { 'mobile (reported)': 'deviceMobile', 'tablet (reported)': 'deviceTablet', 'desktop or unidentified': 'deviceDesktop' }[value]; if (label) return t(label); }
  if (key === 'colorScheme' && ['dark', 'light'].includes(value)) return t(value === 'dark' ? 'colorDark' : 'colorLight');
  return value;
}
function lookupNote(status, network = false) {
  const keys = network ? { local: 'networkLocal', not_configured: 'networkNotConfigured', unavailable: 'networkUnavailable', partial: 'networkPartial', ok: 'networkEstimates', pending: 'network_status_pending' } : { local: 'geoLocal', unavailable: 'geoUnavailable', pending: 'locationPending' };
  return keys[status] ? t(keys[status]) : null;
}
async function api(route, body) {
  const response = await fetch(route, { ...(body === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }), signal: AbortSignal.timeout(12000) });
  if (!response.ok) { const code = response.status === 429 ? 'rateLimited' : response.status === 401 ? 'sessionExpired' : 'requestFailed'; const error = new Error(code); error.code = code; error.status = response.status; throw error; }
  return response.json();
}
function signedOut() { $('dashboard').hidden = true; $('logout').hidden = true; $('login-panel').hidden = false; $('records').replaceChildren(); $('detail-fields').replaceChildren(); cachedRecords = null; selected = null; $('details').close(); }
function cell(primary, secondary) { const td = document.createElement('td'); const strong = document.createElement('div'); strong.textContent = primary; td.append(strong); if (secondary) { const small = document.createElement('small'); small.textContent = secondary; td.append(small); } return td; }
function networkCell(network) {
  const td = cell(networkType(network), networkStatus(network?.status));
  td.className = 'network-cell';
  const flags = document.createElement('div'); flags.className = 'network-flags';
  for (const key of networkFlags) {
    const flag = document.createElement('span');
    flag.textContent = `${t(`flag_${key}`)}: ${flagText(network?.flags?.[key])}`;
    if (network?.flags?.[key] === true) flag.className = 'detected';
    flags.append(flag);
  }
  td.append(flags); return td;
}
function browserSummary(ua) { for (const [pattern, name] of [[/Edg\/([\d.]+)/, 'Edge'], [/Firefox\/([\d.]+)/, 'Firefox'], [/Chrome\/([\d.]+)/, 'Chrome'], [/Version\/([\d.]+).*Safari/, 'Safari']]) { const match = pattern.exec(ua || ''); if (match) return `${name} ${match[1]}`; } return t('unknownBrowser'); }
function renderRecords() {
  if (!cachedRecords) return;
  $('count').textContent = new Intl.NumberFormat(window.SiteLocale.locale).format(cachedRecords.total);
  $('records').replaceChildren();
  for (const record of cachedRecords.records) {
    const env = record.environment || {}; const geo = record.geo || {};
    const location = geo.status === 'ok' ? [geo.country, geo.region, geo.city].filter(Boolean).join(' · ') : geo.status === 'local' ? t('network_status_local') : geo.status === 'pending' ? t('locationPending') : t('locationUnavailable');
    const row = document.createElement('tr');
    row.append(cell(time(record.createdAt), t('localTime')), cell(record.ip || t('unknownIp'), location), networkCell(geo.network), cell(env.uaPlatform || env.platform || t('unknownDevice'), browserSummary(record.userAgent)), cell(env.language || t('unknownLanguage'), env.timeZone || t('unknownTimeZone')));
    const action = document.createElement('td'); const button = document.createElement('button'); button.className = 'text-button'; button.textContent = t('viewDetails'); button.addEventListener('click', () => showDetails(record)); action.append(button); row.append(action); $('records').append(row);
  }
  $('page-info').textContent = t('pageInfo', { page, totalPages });
}
async function load() {
  $('refresh').disabled = true; $('previous').disabled = true; $('next').disabled = true; setStatus('dashboard-status', 'reading');
  try {
    const data = await api(`/api/visits?page=${page}`);
    totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));
    if (page > totalPages) { page = totalPages; return await load(); }
    cachedRecords = data;
    $('login-panel').hidden = true; $('dashboard').hidden = false; $('logout').hidden = false;
    $('network-configuration').hidden = data.networkConfigured === true;
    $('empty').hidden = data.total !== 0; $('table-wrap').hidden = data.total === 0;
    renderRecords(); setStatus('dashboard-status', null);
  } catch (error) {
    if (error.status === 401) signedOut();
    else { setStatus('dashboard-status', errorKey(error)); setStatus('login-status', errorKey(error)); }
  } finally { $('refresh').disabled = false; $('previous').disabled = page <= 1; $('next').disabled = page >= totalPages; }
}
function detailGroup(title, pairs) {
  const heading = document.createElement('h3'); heading.textContent = title;
  const dl = document.createElement('dl'); dl.className = 'detail-grid';
  pairs.forEach(([label, value]) => { const dt = document.createElement('dt'); const dd = document.createElement('dd'); dt.textContent = label; dd.textContent = valueText(value); dl.append(dt, dd); });
  $('detail-fields').append(heading, dl);
}
function renderDetails(record) {
  $('detail-fields').replaceChildren();
  const mode = record.collectionMode === 'automatic' ? t('automaticCollection') : record.collectionMode || (record.consentVersion ? t('legacyCollection') : t('unknown'));
  detailGroup(t('recordGroup'), [[t('recordId'), record.id], [t('visitedAt'), time(record.createdAt)], [t('expiresAt'), time(record.expiresAt)], [t('collectionMode'), mode], [t('noticeVersion'), record.noticeVersion], [t('ip'), record.ip], [t('ipSource'), ipSource(record.ipSource)], [t('requestLanguage'), record.acceptLanguage], [t('requestUserAgent'), record.userAgent]]);
  if (record.consentVersion) detailGroup(t('legacyGroup'), [[t('consentVersion'), record.consentVersion]]);
  const geo = record.geo || {}; const network = geo.network || {}; const env = record.environment || {};
  const geoDisplay = { ...geo, status: networkStatus(geo.status), message: lookupNote(geo.status) };
  detailGroup(t('geoGroup'), geoFields.map(key => [t(`geo_${key}`), geoDisplay[key]]));
  detailGroup(t('networkGroup'), [
    [t('geo_status'), networkStatus(network.status)], [t('networkClassification'), networkType(network)],
    ...networkFlags.map(key => [t(`flag_${key}`), flagText(network.flags?.[key])]),
    [t('vpnService'), network.vpnService], [t('organizationType'), network.organizationType && networkTypes.has(network.organizationType) ? networkType({ type: network.organizationType }) : network.organizationType], [t('geo_provider'), network.provider], [t('checkedAt'), time(network.checkedAt)], [t('geo_message'), lookupNote(network.status, true)],
    [t('limitations'), t('networkLimitations')]
  ]);
  detailGroup(t('environmentGroup'), environmentFields.map(key => [t(`env_${key}`), environmentValue(key, env[key])]));
  $('delete-record').textContent = t(deleting ? 'confirmDelete' : 'delete');
}
function showDetails(record) {
  selected = record; deleting = false; setStatus('delete-status', null); renderDetails(record); $('details').showModal();
}
function renderLanguage() {
  window.SiteLocale.apply(window.AdminMessages); document.title = t('title');
  for (const [id, message] of statusMessages) $(id).textContent = message.key ? t(message.key, message.vars) : '';
  renderRecords();
  if (selected && $('details').open) renderDetails(selected);
  else $('delete-record').textContent = t(deleting ? 'confirmDelete' : 'delete');
}
$('login-form').addEventListener('submit', async event => {
  event.preventDefault(); $('login-button').disabled = true; setStatus('login-status', 'signingIn');
  try { await api('/api/login', { password: $('password').value }); $('password').value = ''; setStatus('login-status', null); page = 1; await load(); }
  catch (error) { setStatus('login-status', errorKey(error)); }
  finally { $('login-button').disabled = false; }
});
$('logout').addEventListener('click', async () => { try { await api('/api/logout', {}); signedOut(); } catch (error) { if (error.status === 401) signedOut(); else setStatus('dashboard-status', errorKey(error)); } });
$('refresh').addEventListener('click', load);
$('previous').addEventListener('click', () => { page--; load(); });
$('next').addEventListener('click', () => { page++; load(); });
$('close-details').addEventListener('click', () => $('details').close());
$('delete-record').addEventListener('click', async () => {
  if (!selected) return;
  if (!deleting) { deleting = true; $('delete-record').textContent = t('confirmDelete'); setStatus('delete-status', 'deleteWarning'); return; }
  $('delete-record').disabled = true;
  try { await api('/api/delete', { id: selected.id }); $('details').close(); selected = null; await load(); }
  catch (error) { if (error.status === 401) signedOut(); else setStatus('delete-status', errorKey(error)); }
  finally { $('delete-record').disabled = false; }
});
window.SiteLocale.bindSelector($('language-select'));
window.addEventListener('site-language-change', renderLanguage);
renderLanguage();
load();