const { test } = require('node:test');
const assert = require('node:assert/strict');

test('device language preference selects a supported locale and otherwise falls back to English', () => {
  const { detectLanguage } = require('../public/locale');
  assert.equal(detectLanguage(['en-US', 'zh-CN']), 'en');
  assert.equal(detectLanguage(['es-MX', 'en-US']), 'es');
  assert.equal(detectLanguage(['zh-TW', 'en-US']), 'zh');
  assert.equal(detectLanguage(['fr-CA']), 'fr');
  assert.equal(detectLanguage(['de-AT']), 'de');
  assert.equal(detectLanguage(['ja-JP']), 'ja');
  assert.equal(detectLanguage(['ar', 'pt-BR', 'de-DE']), 'de');
  assert.equal(detectLanguage(['ar-SA', 'pt-BR']), 'en');
  assert.equal(detectLanguage([]), 'en');
});

test('explicit language choice takes precedence without altering the device language list', () => {
  const { resolveLanguage } = require('../public/locale');
  const device = ['zh-CN', 'en-US'];
  assert.equal(resolveLanguage({ query: 'en', saved: 'fr', languages: device }), 'en');
  assert.equal(resolveLanguage({ saved: 'fr', languages: device }), 'fr');
  assert.equal(resolveLanguage({ saved: 'auto', languages: device }), 'zh');
  assert.equal(resolveLanguage({ saved: 'invalid', languages: ['ar'] }), 'en');
  assert.deepEqual(device, ['zh-CN', 'en-US']);
});

test('missing translations use English and placeholders are formatted without evaluating input', () => {
  const { translate } = require('../public/locale');
  const catalog = { en: { page: 'Page {page} of {total}', unknown: 'Unknown' }, zh: { unknown: '未知' } };
  assert.equal(translate(catalog, 'zh', 'unknown'), '未知');
  assert.equal(translate(catalog, 'de', 'unknown'), 'Unknown');
  assert.equal(translate(catalog, 'ja', 'page', { page: 2, total: 4 }), 'Page 2 of 4');
  assert.equal(translate(catalog, 'en', 'page', { page: '<script>', total: '${secret}' }), 'Page <script> of ${secret}');
});
