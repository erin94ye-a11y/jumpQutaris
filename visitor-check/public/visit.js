'use strict';
const messages = window.VisitMessages;
const t = (key, vars) => window.SiteLocale.t(messages, key, vars);
let state = 'sending'; let recordId = document.querySelector('meta[name="visit-id"]')?.content || null; let submitting = false;
const $ = id => document.getElementById(id);
const visitToken = document.querySelector('meta[name="visit-token"]')?.content;
function render() {
  document.documentElement.lang = window.SiteLocale.language;
  document.title = t('brand');
  document.querySelectorAll('[data-copy]').forEach(element => { element.textContent = t(element.dataset.copy); });
  $('status').textContent = t(state);
  $('retry').hidden = state !== 'error';
  $('retry').disabled = submitting;
  $('receipt').hidden = !recordId;
  $('receipt').textContent = recordId ? t('receipt') + recordId : '';
}
window.SiteLocale.bindSelector($('language-select'));
window.addEventListener('site-language-change', render);

async function collectEnvironment() {
  const n = navigator; const s = screen; const connection = n.connection;
  const environment = {
    language: n.language, languages: Array.from(n.languages || []).slice(0, 20), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, timezoneOffset: new Date().getTimezoneOffset(),
    platform: n.platform, vendor: n.vendor, userAgent: n.userAgent,
    deviceType: /iPad|Tablet/i.test(n.userAgent) ? 'tablet (reported)' : /Mobi|Android/i.test(n.userAgent) ? 'mobile (reported)' : 'desktop or unidentified',
    screenWidth: s.width, screenHeight: s.height, availableWidth: s.availWidth, availableHeight: s.availHeight, viewportWidth: innerWidth, viewportHeight: innerHeight, pixelRatio: devicePixelRatio, colorDepth: s.colorDepth,
    hardwareConcurrency: n.hardwareConcurrency, deviceMemory: n.deviceMemory, maxTouchPoints: n.maxTouchPoints, cookiesEnabled: n.cookieEnabled, online: n.onLine, pdfViewerEnabled: n.pdfViewerEnabled,
    colorScheme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light', effectiveType: connection?.effectiveType, downlink: connection?.downlink, rtt: connection?.rtt, saveData: connection?.saveData
  };
  if (n.userAgentData) {
    environment.mobile = n.userAgentData.mobile; environment.uaPlatform = n.userAgentData.platform;
    try {
      let timer;
      const details = await Promise.race([n.userAgentData.getHighEntropyValues(['architecture', 'bitness', 'model', 'platformVersion', 'uaFullVersion']), new Promise(resolve => { timer = setTimeout(() => resolve({}), 1500); })]).finally(() => clearTimeout(timer));
      Object.assign(environment, { architecture: details.architecture, bitness: details.bitness, model: details.model, uaPlatformVersion: details.platformVersion, browserVersion: details.uaFullVersion });
    } catch { /* Optional browser details may be denied. */ }
  }
  return environment;
}

async function updateVisit() {
  if (submitting) return;
  submitting = true; state = 'sending'; render();
  try {
    if (!visitToken || visitToken === '__VISIT_TOKEN__') throw new Error('Visit token unavailable');
    const environment = await collectEnvironment();
    const response = await fetch('/api/visits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitToken, environment }), signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('Submission failed');
    const data = await response.json();
    if (typeof data.id !== 'string' || !data.id) throw new Error('Missing visit reference');
    recordId = data.id; state = 'saved';
  } catch { state = 'error'; }
  finally { submitting = false; render(); }
}
$('retry').addEventListener('click', updateVisit);
updateVisit();
