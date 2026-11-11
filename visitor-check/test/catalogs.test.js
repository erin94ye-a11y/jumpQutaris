const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { languageCodes } = require('../public/locale');

test('every advertised language has complete visitor and administrator text with valid placeholders', () => {
  const context = vm.createContext({ window: {} });
  for (const file of ['visit-messages.js', 'admin-messages.js', 'admin-translations.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../public', file), 'utf8'), context);
  }
  const placeholders = value => [...new Set(value.match(/\{\w+\}/g) || [])].sort();
  for (const [surface, catalog] of Object.entries({ visitor: context.window.VisitMessages, admin: context.window.AdminMessages })) {
    const keys = Object.keys(catalog.en).sort();
    for (const language of languageCodes) {
      assert.ok(catalog[language], `${surface} supports ${language}`);
      assert.deepEqual(Object.keys(catalog[language]).sort(), keys);
      for (const key of keys) {
        const message = catalog[language][key];
        assert.equal(typeof message, 'string');
        assert.ok(message.trim(), `${surface}.${language}.${key} must not be blank`);
        assert.deepEqual(placeholders(message), placeholders(catalog.en[key]), `${surface}.${language}.${key} preserves values`);
      }
    }
    assert.equal(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(Object.values(catalog.en).join(' ')), false, 'English UI has no untranslated Chinese/Japanese copy');
  }
});
