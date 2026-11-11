const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

class Element {
  constructor() {
    this.textContent = ''; this.children = []; this.events = {};
    this.dataset = {}; this.hidden = false; this.disabled = false; this.open = false;
  }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  addEventListener(name, handler) { this.events[name] = handler; }
  setAttribute(name, value) { this[name] = value; }
  showModal() { this.open = true; }
  close() { this.open = false; }
}

const textOf = element => [element.textContent, ...element.children.map(textOf)].join(' ');
const settled = () => new Promise(resolve => setImmediate(resolve));
const response = (body, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

function browserFixture() {
  const handlers = {};
  const window = {
    addEventListener: (name, handler) => (handlers[name] ||= []).push(handler),
    dispatchEvent: event => (handlers[event.type] || []).forEach(handler => handler(event))
  };
  const elements = new Map();
  const get = id => { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); };
  const document = {
    documentElement: { lang: 'en' }, title: '', getElementById: get,
    createElement: () => new Element(), querySelectorAll: () => []
  };
  const records = [
    {
      id: 'selected-visit', createdAt: '2026-09-11T12:00:00Z', expiresAt: '2026-10-11T12:00:00Z',
      collectionMode: 'automatic', noticeVersion: '2026-09-11-auto', ip: '203.0.113.15',
      environment: { language: 'en-US', deviceType: 'mobile (reported)', effectiveType: '4g' },
      geo: { status: 'ok', network: { status: 'partial', type: 'isp', flags: { vpn: true, proxy: false, tor: null, mobile: false, datacenter: true }, provider: 'ipapi.is' } }
    },
    { id: 'pending-visit', geo: { status: 'pending', network: { status: 'pending' } } },
    { id: 'legacy-visit', consentVersion: '2026-09-11' }
  ];
  const requests = [];
  let responder = () => response({ records, total: records.length, pageSize: 25, networkConfigured: false });
  const context = vm.createContext({
    window, document, navigator: { language: 'en-US', languages: ['en-US'] },
    location: { href: 'http://127.0.0.1:4180/admin' },
    localStorage: { getItem: () => null, setItem: () => {} },
    URL, Intl, Date, Event, AbortSignal,
    fetch: async (url, options = {}) => {
      const request = { url, method: options.method || 'GET', body: options.body ? JSON.parse(options.body) : undefined };
      requests.push(request); return responder(request);
    }
  });
  for (const file of ['locale.js', 'admin-messages.js', 'admin.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../public', file), 'utf8'), context);
  }
  return {
    get, document, records, requests,
    respondWith: handler => { responder = handler; },
    changeLanguage: language => { const select = get('language-select'); select.value = language; select.events.change(); }
  };
}

test('switching languages preserves the open selected record and deletion confirmation without refetching or mutating records', async () => {
  const fixture = browserFixture();
  await settled();
  const originalRecords = structuredClone(fixture.records);
  const firstRow = fixture.get('records').children[0];
  firstRow.children.at(-1).children[0].events.click();
  await fixture.get('delete-record').events.click();
  assert.equal(fixture.get('details').open, true);
  assert.equal(fixture.get('delete-record').textContent, 'Confirm deletion');

  fixture.changeLanguage('zh');
  assert.equal(fixture.document.documentElement.lang, 'zh');
  assert.equal(fixture.get('details').open, true);
  assert.match(textOf(fixture.get('detail-fields')), /selected-visit/);
  assert.equal(fixture.get('delete-record').textContent, '确认永久删除');
  assert.match(fixture.get('delete-status').textContent, /再次点击确认/);
  assert.match(textOf(fixture.get('detail-fields')), /浏览器报告的环境信息/);
  assert.match(textOf(fixture.get('detail-fields')), /en-US/);

  fixture.changeLanguage('en');
  assert.equal(fixture.get('delete-record').textContent, 'Confirm deletion');
  assert.match(fixture.get('delete-status').textContent, /Click again to delete permanently/);
  assert.equal(fixture.requests.length, 1);
  assert.deepEqual(fixture.records, originalRecords);

  // The next click must still target the record selected before either switch.
  await fixture.get('delete-record').events.click();
  const deletes = fixture.requests.filter(request => request.url === '/api/delete');
  assert.equal(deletes.length, 1);
  assert.deepEqual(deletes[0].body, { id: 'selected-visit' });
  assert.equal(fixture.get('details').open, false);
});

test('network signals and active loading or error statuses translate without losing their meaning', async () => {
  const fixture = browserFixture();
  await settled();
  let table = textOf(fixture.get('records'));
  assert.match(table, /VPN: Detected/);
  assert.match(table, /Proxy: Not detected/);
  assert.match(table, /Tor: Unknown/);
  assert.match(table, /Lookup in progress/);
  assert.match(textOf(fixture.get('records').children[2]), /VPN: Unknown/);

  let completeRefresh;
  fixture.respondWith(() => new Promise(resolve => { completeRefresh = resolve; }));
  const refresh = fixture.get('refresh').events.click();
  assert.equal(fixture.get('dashboard-status').textContent, 'Loading records…');
  fixture.changeLanguage('zh');
  assert.equal(fixture.get('dashboard-status').textContent, '正在读取…');
  assert.equal(fixture.get('refresh').disabled, true);
  table = textOf(fixture.get('records'));
  assert.match(table, /VPN: 检出/);
  assert.match(table, /代理: 未检出/);
  assert.match(table, /Tor: 未知/);
  assert.match(table, /查询中/);
  assert.equal(fixture.requests.length, 2);

  completeRefresh(response({}, 429));
  await refresh;
  assert.equal(fixture.get('dashboard-status').textContent, '请求过于频繁，请稍后重试。');
  fixture.changeLanguage('en');
  assert.equal(fixture.get('dashboard-status').textContent, 'Too many requests. Please try again later.');
  assert.equal(fixture.get('login-status').textContent, 'Too many requests. Please try again later.');
  assert.equal(fixture.get('refresh').disabled, false);
  assert.equal(fixture.requests.length, 2);
});
