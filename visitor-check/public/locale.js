(function () {
  'use strict';
  const locales = { en: 'en-US', zh: 'zh-CN', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', ja: 'ja-JP' };
  const languageCodes = Object.keys(locales);
  const autoLabels = { en: 'Automatic (device language)', zh: '自动（设备语言）', es: 'Automático (idioma del dispositivo)', fr: 'Automatique (langue de l’appareil)', de: 'Automatisch (Gerätesprache)', ja: '自動（デバイスの言語）' };
  function supported(value) {
    if (typeof value !== 'string') return null;
    const base = value.trim().replace(/_/g, '-').toLowerCase().split('-')[0];
    return Object.hasOwn(locales, base) ? base : null;
  }
  function detectLanguage(languages = []) {
    for (const value of Array.isArray(languages) ? languages : []) {
      const match = supported(value);
      if (match) return match;
    }
    return 'en';
  }
  function resolveLanguage({ query, saved, languages } = {}) {
    return supported(query) || supported(saved) || detectLanguage(languages);
  }
  function translate(catalog, language, key, vars = {}) {
    const current = catalog[language]; const english = catalog.en;
    const value = current && Object.hasOwn(current, key) ? current[key] : english && Object.hasOwn(english, key) ? english[key] : key;
    return String(value).replace(/\{(\w+)\}/g, (placeholder, name) => Object.hasOwn(vars, name) ? String(vars[name]) : placeholder);
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = { detectLanguage, resolveLanguage, translate, languageCodes }; return; }

  const storageKey = 'visitor-check-ui-language';
  const deviceLanguages = () => navigator.languages?.length ? Array.from(navigator.languages) : [navigator.language];
  let saved;
  try { saved = localStorage.getItem(storageKey); } catch { /* Optional preference storage can be blocked. */ }
  const query = new URL(location.href).searchParams.get('lang');
  let mode = supported(query) || supported(saved) || 'auto';
  let language = resolveLanguage({ query, saved, languages: deviceLanguages() });
  const selectors = new Set();
  function updateSelectors() {
    for (const select of selectors) {
      const options = [];
      const auto = document.createElement('option'); auto.value = 'auto'; auto.textContent = autoLabels[language]; options.push(auto);
      let names;
      try { names = new Intl.DisplayNames([locales[language]], { type: 'language' }); } catch { /* Use English names below. */ }
      for (const code of languageCodes) {
        const option = document.createElement('option'); option.value = code;
        option.textContent = names?.of(code) || ({ en: 'English', zh: 'Chinese', es: 'Spanish', fr: 'French', de: 'German', ja: 'Japanese' })[code];
        options.push(option);
      }
      select.replaceChildren(...options); select.value = mode;
      select.setAttribute('aria-label', ({ en: 'Display language', zh: '界面语言', es: 'Idioma de la interfaz', fr: 'Langue de l’interface', de: 'Anzeigesprache', ja: '表示言語' })[language]);
    }
  }
  function setLanguage(next, persist = false) {
    mode = supported(next) || 'auto';
    language = mode === 'auto' ? detectLanguage(deviceLanguages()) : mode;
    document.documentElement.lang = language;
    if (persist) { try { localStorage.setItem(storageKey, mode); } catch { /* Language changes still work without storage. */ } }
    updateSelectors();
    window.dispatchEvent(new Event('site-language-change'));
  }
  window.SiteLocale = {
    get language() { return language; },
    get locale() { return locales[language]; },
    t: (catalog, key, vars) => translate(catalog, language, key, vars),
    apply(catalog) {
      document.documentElement.lang = language;
      document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = translate(catalog, language, element.dataset.i18n); });
      document.querySelectorAll('[data-i18n-aria]').forEach(element => { element.setAttribute('aria-label', translate(catalog, language, element.dataset.i18nAria)); });
    },
    bindSelector(select) {
      if (!select || selectors.has(select)) return;
      selectors.add(select); updateSelectors();
      select.addEventListener('change', () => setLanguage(select.value, true));
    }
  };
  window.addEventListener('languagechange', () => { if (mode === 'auto') setLanguage('auto'); });
  document.documentElement.lang = language;
})();
