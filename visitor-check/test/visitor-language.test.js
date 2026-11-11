const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function browserFixture(languages, query = '', blockedStorage = false) {
  const handlers = {};
  const window = { addEventListener: (name, fn) => (handlers[name] ||= []).push(fn), dispatchEvent: event => (handlers[event.type] || []).forEach(fn => fn(event)) };
  const element = () => ({ textContent: '', hidden: false, disabled: false, dataset: {}, events: {}, addEventListener(name, fn) { this.events[name] = fn; }, setAttribute(name, value) { this[name] = value; }, replaceChildren(...children) { this.children = children; } });
  const elements = Object.fromEntries(['language-select', 'status', 'retry', 'receipt'].map(id => [id, element()]));
  const heading = element(); heading.dataset.copy = 'title';
  const document = {
    documentElement: { lang: 'en' }, title: '', getElementById: id => elements[id], createElement: element,
    querySelector: selector => ({ content: selector.includes('visit-token') ? 'f'.repeat(64) : 'baseline-123' }),
    querySelectorAll: selector => selector === '[data-copy]' ? [heading] : []
  };
  const requests = []; const stored = {};
  const context = vm.createContext({ window, document, navigator: { language: languages[0], languages, userAgent: 'Test Browser', platform: 'TestOS' }, location: { href: `http://127.0.0.1:4180/${query}` },
    localStorage: { getItem: key => { if (blockedStorage) throw new Error('blocked'); return stored[key]; }, setItem: (key, value) => { if (blockedStorage) throw new Error('blocked'); stored[key] = value; } },
    URL, Intl, Date, Event, setTimeout, clearTimeout, AbortSignal,
    screen: { width: 1280, height: 800, availWidth: 1280, availHeight: 800, colorDepth: 24 }, innerWidth: 800, innerHeight: 600, devicePixelRatio: 1,
    matchMedia: () => ({ matches: false }),
    fetch: async (url, options) => { requests.push({ url, body: JSON.parse(options.body) }); return { ok: true, json: async () => ({ id: 'baseline-123' }) }; }
  });
  for (const file of ['locale.js', 'visit-messages.js', 'visit.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '../public', file), 'utf8'), context);
  return { window, document, elements, heading, requests, stored };
}

test('opening the page adapts to the device, and display-language changes do not create another submission', async () => {
  const fixture = browserFixture(['es-MX', 'en-US']);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(fixture.document.documentElement.lang, 'es');
  assert.equal(fixture.heading.textContent, require('../public/visit-messages').es.title);
  assert.equal(fixture.requests.length, 1);
  assert.equal(fixture.requests[0].body.environment.language, 'es-MX');
  assert.equal(fixture.elements.receipt.hidden, false);
  const select = fixture.elements['language-select'];
  select.value = 'en'; select.events.change();
  assert.equal(fixture.document.documentElement.lang, 'en');
  assert.equal(fixture.heading.textContent, 'A quick environment check.');
  assert.equal(fixture.requests.length, 1);
  assert.equal(fixture.stored['visitor-check-ui-language'], 'en');
  select.value = 'auto'; select.events.change();
  assert.equal(fixture.document.documentElement.lang, 'es');
});

test('English preview does not overwrite the recorded device language, even when preference storage is blocked', async () => {
  const fixture = browserFixture(['zh-CN', 'en-US'], '?lang=en', true);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(fixture.document.documentElement.lang, 'en');
  assert.equal(fixture.requests[0].body.environment.language, 'zh-CN');
  assert.equal(fixture.elements.status.textContent, require('../public/visit-messages').en.saved);
  const select = fixture.elements['language-select']; select.value = 'ja'; select.events.change();
  assert.equal(fixture.document.documentElement.lang, 'ja');
  assert.equal(fixture.requests.length, 1);
});
