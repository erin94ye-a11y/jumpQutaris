const content = window.SITE_CONTENT;
const pageKey = document.body.dataset.page || "home";
const asset = (key) => content.assets[key] || key;

const html = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const icon = (name) => `<i class="line-icon" data-lucide="${html(name)}" aria-hidden="true"></i>`;

const headline = (value) =>
  String(value)
    .match(/[^.]+\.?/g)
    .map((line, index, lines) => {
      const trimmed = line.trim();
      if (index === lines.length - 1 && trimmed.endsWith(".")) {
        return `<span>${html(trimmed.slice(0, -1))}<em>.</em></span>`;
      }
      return `<span>${html(trimmed)}</span>`;
    })
    .join("\n");

const actionLink = (action, fallbackStyle = "secondary") => {
  const style = action.style || fallbackStyle;
  return `
    <a class="button button--${html(style)}" href="${html(action.href)}">
      <span>${html(action.label)}</span>
      ${icon("arrow-right")}
    </a>
  `;
};

const sectionIntro = ({ label, title, body }, modifier = "", showBody = true) => `
  <div class="section-intro ${modifier}">
    <p class="section-label">${html(label)}</p>
    <h2>${html(title)}</h2>
    ${showBody && body ? `<p>${html(body)}</p>` : ""}
  </div>
`;

const renderWordmark = () => {
  const mark = `
    <span class="wordmark__jump">${html(content.brand.first)}</span>
    <span class="wordmark__quantum">${html(content.brand.second)}</span>
  `;

  document.querySelectorAll("[data-wordmark]").forEach((element) => {
    element.innerHTML = mark;
  });
};

const renderHeader = () => {
  const desktopNav = document.querySelector("[data-nav]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const headerCta = document.querySelector("[data-header-cta]");
  const navHtml = content.nav
    .map((item) => {
      const active = item.key === pageKey ? ' aria-current="page"' : "";
      return `<a href="${html(item.href)}"${active}>${html(item.label)}</a>`;
    })
    .join("");

  desktopNav.innerHTML = navHtml;
  mobileNav.innerHTML = `${navHtml}${actionLink(content.headerCta, "primary")}`;
  headerCta.href = content.headerCta.href;
  headerCta.innerHTML = `<span>${html(content.headerCta.label)}</span>${icon("arrow-right")}`;
};

const renderMeta = () => {
  const page = pageKey === "home" ? content.home : content.pages[pageKey];
  const title = page?.title || content.brand.name;
  const meta = page?.meta || content.brand.description;

  document.title = title;
  document.querySelector("[data-page-title]").textContent = title;
  document.querySelector("[data-meta-description]").setAttribute("content", meta);
};

const renderHome = () => {
  const page = content.home;
  const main = document.querySelector("[data-render-page]");

  main.innerHTML = `
    <section class="hero-layout home-hero" aria-labelledby="home-title">
      <div class="hero-copy">
        <p class="section-label">${html(page.hero.label)}</p>
        <h1 id="home-title">${headline(page.hero.headline)}</h1>
        <p class="hero-body">${html(page.hero.body)}</p>
        <div class="action-row">${page.hero.actions.map((action) => actionLink(action)).join("")}</div>
        <div class="metric-row">
          ${page.hero.metrics
            .map(
              (metric) => `
                <div class="metric">
                  <span>${html(metric.label)}</span>
                  <strong>${html(metric.value)}</strong>
                </div>
              `
            )
            .join("")}
        </div>
      </div>
      <div class="hero-asset hero-asset--market">
        <img src="${html(asset("heroMarket"))}" alt="Abstract market data and candlestick structure" />
      </div>
      <div class="scroll-cue" aria-hidden="true"><span>Scroll to discover</span><i></i></div>
    </section>

    <section class="section approach-section" id="approach">
      <div class="two-col-heading">
        ${sectionIntro(page.approach, "", false)}
        <p>${html(page.approach.body)}</p>
      </div>
      <div class="feature-strip feature-strip--four">
        ${page.approach.items.map(renderFeatureCard).join("")}
      </div>
    </section>

    <section class="section markets-section">
      <div class="two-col-heading">
        ${sectionIntro(page.markets, "", false)}
        <p>${html(page.markets.body)}</p>
      </div>
      <div class="market-card-grid">
        ${page.markets.items.map(renderMarketCard).join("")}
      </div>
    </section>

    <section class="section people-preview">
      <div class="people-preview__copy">
        <p class="section-label">${html(page.people.label)}</p>
        <h2>${html(page.people.title)}</h2>
        <p>${html(page.people.body)}</p>
        <a class="text-link" href="${html(page.people.action.href)}">
          <span>${html(page.people.action.label)}</span>
          ${icon("arrow-right")}
        </a>
      </div>
      <img class="wide-photo" src="${html(asset("peopleFloor"))}" alt="Modern trading floor with market displays" />
    </section>

    <section class="section join-section">
      <div class="section-intro section-intro--compact">
        <p class="section-label">${html(page.join.label)}</p>
        <h2>${html(page.join.title)}</h2>
      </div>
      <div class="role-grid">
        ${page.join.items.map(renderRoleCard).join("")}
      </div>
    </section>

    <section class="section contact-band">
      <div class="contact-band__icon">${icon("mail")}</div>
      <div>
        <p class="section-label">${html(page.contact.label)}</p>
        <h2>${html(page.contact.title)}</h2>
      </div>
      ${actionLink(page.contact.action, "primary")}
    </section>
  `;
};

const renderFeatureCard = (item) => `
  <article class="feature-card">
    ${icon(item.icon)}
    <h3>${html(item.title)}</h3>
    <p>${html(item.text)}</p>
  </article>
`;

const renderMarketCard = (item) => `
  <article class="market-card">
    ${icon(item.icon)}
    <h3>${html(item.title)}</h3>
    <p>${html(item.text)}</p>
  </article>
`;

const renderRoleCard = (item) => `
  <article class="role-card" id="${item.id ? html(item.id) : ""}">
    ${icon(item.icon)}
    <h3>${html(item.title)}</h3>
    <p>${html(item.text)}</p>
    ${item.action ? `<a class="text-link" href="${html(item.action.href)}"><span>${html(item.action.label)}</span>${icon("arrow-right")}</a>` : ""}
  </article>
`;

const renderSubpageHero = (page) => `
  <section class="hero-layout subpage-hero" aria-labelledby="${html(pageKey)}-title">
    <div class="hero-copy">
      <p class="section-label">${html(page.hero.label)}</p>
      <h1 id="${html(pageKey)}-title">${headline(page.hero.headline)}</h1>
      <p class="hero-body">${html(page.hero.body)}</p>
      <div class="action-row">${page.hero.actions.map((action) => actionLink(action)).join("")}</div>
    </div>
    <div class="hero-asset ${page.hero.image === "peopleFloor" ? "hero-asset--photo" : "hero-asset--market"}">
      <img src="${html(asset(page.hero.image))}" alt="" />
    </div>
  </section>
`;

const renderFeatureGrid = (section) => `
  <section class="section" ${section.id ? `id="${html(section.id)}"` : ""}>
    <div class="two-col-heading">
      ${sectionIntro(section, "", false)}
      <p>${html(section.body)}</p>
    </div>
    <div class="feature-strip">
      ${section.items.map(renderFeatureCard).join("")}
    </div>
  </section>
`;

const renderMarketGrid = (section) => `
  <section class="section" id="${html(section.id || "markets")}">
    <div class="two-col-heading">
      ${sectionIntro(section, "", false)}
      <p>${html(section.body)}</p>
    </div>
    <div class="market-list-panel">
      ${section.items
        .map(
          (item, index) => `
            <article class="market-accordion">
              <button
                class="market-toggle"
                type="button"
                aria-expanded="false"
                aria-controls="market-detail-${index}"
                data-market-toggle
              >
                <span>${html(item.title)}</span>
                <strong aria-hidden="true">+</strong>
              </button>
              <div class="market-detail" id="market-detail-${index}" hidden>
                <p>${html(item.detail)}</p>
                <ul>
                  ${item.points.map((point) => `<li>${html(point)}</li>`).join("")}
                </ul>
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  </section>
`;

const renderSystemSection = (section) => `
  <section class="section system-section">
    <div class="system-copy">
      ${sectionIntro(section, "", false)}
      <p>${html(section.body)}</p>
    </div>
    <div class="system-map" aria-hidden="true">
      <span class="system-node system-node--research">Research</span>
      <span class="system-node system-node--data">Data</span>
      <span class="system-node system-node--risk">Risk</span>
      <span class="system-node system-node--execution">Execution</span>
    </div>
  </section>
`;

const renderPhotoSplit = (section) => `
  <section class="section photo-split">
    <div>
      ${sectionIntro(section, "", false)}
      <p>${html(section.body)}</p>
    </div>
    <img class="wide-photo" src="${html(asset(section.image))}" alt="Modern trading workspace" />
  </section>
`;

const renderCallout = (section) => `
  <section class="section callout-section">
    <p class="section-label">${html(section.label)}</p>
    <h2>${html(section.title)}</h2>
    <p>${html(section.body)}</p>
  </section>
`;

const renderRoleGrid = (section) => `
  <section class="section" id="${html(section.id || "roles")}">
    <div class="two-col-heading">
      ${sectionIntro(section)}
      <p>${html(section.body)}</p>
    </div>
    <div class="role-grid">
      ${section.items.map(renderRoleCard).join("")}
    </div>
  </section>
`;

const renderContactSection = (section) => `
  <section class="section contact-page" id="${html(section.id || "contact-form")}">
    <div>
      ${sectionIntro(section)}
      <div class="contact-list">
        ${section.contacts
          .map(
            (item) => `
              <a class="contact-card" href="${html(item.href)}">
                ${icon(item.icon)}
                <span>${html(item.title)}</span>
                <strong>${html(item.text)}</strong>
              </a>
            `
          )
          .join("")}
      </div>
    </div>
    <form class="contact-form" data-contact-form>
      <label for="contact-name">
        <span>Name</span>
        <input id="contact-name" name="name" type="text" autocomplete="name" required />
      </label>
      <label for="contact-email">
        <span>Email</span>
        <input id="contact-email" name="email" type="email" autocomplete="email" required />
      </label>
      <label for="contact-topic">
        <span>Topic</span>
        <select id="contact-topic" name="topic" required>
          <option value="">Select a topic</option>
          <option>General Inquiry</option>
          <option>Careers</option>
          <option>Partnerships</option>
          <option>Media</option>
        </select>
      </label>
      <label for="contact-message">
        <span>Message</span>
        <textarea id="contact-message" name="message" rows="5" required></textarea>
      </label>
      <button class="button button--primary" type="submit">
        <span>Send Message</span>
        ${icon("arrow-right")}
      </button>
      <p class="form-status" data-form-status aria-live="polite"></p>
    </form>
  </section>
`;

const renderPolicySection = (section) => `
  <section class="section policy-page">
    <aside class="policy-summary">
      <p class="section-label">${html(section.label)}</p>
      <h1>${html(section.title)}</h1>
      <p>${html(section.intro)}</p>
    </aside>
    <div class="policy-content">
      ${section.groups
        .map(
          (group, index) => `
            <article class="policy-block" id="policy-${index + 1}">
              <span>${String(index + 1).padStart(2, "0")}</span>
              <h3>${html(group.title)}</h3>
              ${group.body.map((paragraph) => `<p>${html(paragraph)}</p>`).join("")}
            </article>
          `
        )
        .join("")}
    </div>
  </section>
`;

const sectionRenderers = {
  "feature-grid": renderFeatureGrid,
  "market-grid": renderMarketGrid,
  system: renderSystemSection,
  "photo-split": renderPhotoSplit,
  callout: renderCallout,
  "role-grid": renderRoleGrid,
  contact: renderContactSection,
  policy: renderPolicySection
};

const renderSubpage = () => {
  const page = content.pages[pageKey] || content.pages.trading;
  const main = document.querySelector("[data-render-page]");
  const heroMarkup = page.layout === "policy" ? "" : renderSubpageHero(page);
  main.innerHTML = `
    ${heroMarkup}
    ${page.sections.map((section) => sectionRenderers[section.type](section)).join("")}
  `;
};

const renderFooter = () => {
  const footer = document.querySelector("[data-footer]");
  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-brand">
        <a class="wordmark wordmark--footer" href="index.html" aria-label="Jump Quantum home" data-wordmark-footer>
          <span class="wordmark__jump">${html(content.brand.first)}</span>
          <span class="wordmark__quantum">${html(content.brand.second)}</span>
        </a>
        <p>${html(content.brand.description)}</p>
        <div class="social-row">
          ${content.footer.social.map((item) => `<a href="${html(item.href)}" aria-label="${html(item.label)}">${icon(item.icon)}</a>`).join("")}
        </div>
      </div>
      <div class="footer-links">
        ${content.footer.columns
          .map(
            (column) => `
              <nav aria-label="${html(column.title)}">
                <h3>${html(column.title)}</h3>
                ${column.links.map((link) => `<a href="${html(link.href)}">${html(link.label)}</a>`).join("")}
              </nav>
            `
          )
          .join("")}
      </div>
      <p class="footer-legal">&copy; ${new Date().getFullYear()} ${html(content.brand.name)}.<br />All rights reserved.</p>
    </div>
  `;
};

const wireInteractions = () => {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-mobile-panel]");
  const form = document.querySelector("[data-contact-form]");

  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    panel.classList.remove("is-open");
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    panel.classList.toggle("is-open", !isOpen);
  });

  panel.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  window.addEventListener("scroll", () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  });

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      form.reset();
      form.querySelector("[data-form-status]").textContent =
        "Thanks. Your message is ready for the Jump Quantum team once a form service is connected.";
    });
  }

  document.querySelectorAll("[data-market-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const detail = document.getElementById(button.getAttribute("aria-controls"));
      const isOpening = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(isOpening));
      button.querySelector("strong").textContent = isOpening ? "-" : "+";
      detail.hidden = !isOpening;
    });
  });
};

renderMeta();
renderWordmark();
renderHeader();
if (pageKey === "home") {
  renderHome();
} else {
  renderSubpage();
}
renderFooter();
wireInteractions();

if (window.lucide) {
  window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
}
