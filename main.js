const content = window.SITE_CONTENT;
const pageKey = document.body.dataset.page || "home";
const asset = (key) => content.assets[key] || key;
const siteUrl = (content.site?.url || "https://jumpqutaris.com").replace(/\/$/, "");
const routeForPage = (key = pageKey) => content.routes?.[key] || (key === "home" ? "/" : `/${key}`);
const absoluteUrl = (value = "/") => {
  if (/^https?:\/\//.test(value)) return value;
  return `${siteUrl}${value.startsWith("/") ? value : `/${value}`}`;
};
const assetUrl = (key) => absoluteUrl(asset(key).replace(/^\/+/, ""));

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
    <img src="${html(asset("logo"))}" alt="${html(content.brand.name)}" />
  `;

  document.querySelectorAll("[data-wordmark]").forEach((element) => {
    element.setAttribute("href", "/");
    element.innerHTML = mark;
  });
};

const renderHeader = () => {
  const desktopNav = document.querySelector("[data-nav]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const navHtml = content.nav
    .map((item) => {
      const active = item.key === pageKey ? ' aria-current="page"' : "";
      return `<a href="${html(item.href)}"${active}>${html(item.label)}</a>`;
    })
    .join("");

  desktopNav.innerHTML = navHtml;
  mobileNav.innerHTML = navHtml;
};

const renderMeta = () => {
  const page = pageKey === "home" ? content.home : content.pages[pageKey];
  const title = page?.title || content.brand.name;
  const meta = page?.meta || content.brand.description;
  const canonical = absoluteUrl(routeForPage());
  const previewImage = assetUrl(page?.seoImage || page?.hero?.image || content.home.hero.image);
  const setMeta = (selector, attr, value) => {
    const element = document.querySelector(selector);
    if (element) element.setAttribute(attr, value);
  };

  document.title = title;
  document.querySelector("[data-page-title]").textContent = title;
  document.querySelector("[data-meta-description]").setAttribute("content", meta);
  setMeta("[data-canonical]", "href", canonical);
  setMeta("[data-og-title]", "content", title);
  setMeta("[data-og-description]", "content", meta);
  setMeta("[data-og-url]", "content", canonical);
  setMeta("[data-og-image]", "content", previewImage);
  setMeta("[data-twitter-title]", "content", title);
  setMeta("[data-twitter-description]", "content", meta);
  setMeta("[data-twitter-image]", "content", previewImage);

  const structuredData = document.querySelector("[data-structured-data]");
  if (structuredData) {
    structuredData.textContent = JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: content.brand.name,
        url: siteUrl,
        logo: assetUrl("logo"),
        description: content.brand.description,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "Customer Support",
          email: "Qutara@jumpqutaris.com"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description: meta,
        url: canonical,
        isPartOf: {
          "@type": "WebSite",
          name: content.brand.name,
          url: siteUrl
        }
      }
    ]);
  }
};

const renderHome = () => {
  const page = content.home;
  const main = document.querySelector("[data-render-page]");
  const heroImageStyle = page.hero.imageStyle || "illustration";

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
      <div class="hero-asset hero-asset--${html(heroImageStyle)}">
        <img src="${html(asset(page.hero.image || "homeHero"))}" alt="${html(page.hero.imageAlt || "Abstract market intelligence visual")}" />
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
      <img class="wide-photo" src="${html(asset(page.people.image || "teamWorkspace"))}" alt="${html(page.people.imageAlt || "Modern trading floor with market displays")}" />
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
  <article class="role-card${item.image ? " role-card--with-photo" : ""}" id="${item.id ? html(item.id) : ""}">
    ${
      item.image
        ? `<img class="role-card__photo" src="${html(item.image)}" alt="${html(item.imageAlt || item.title)}" />`
        : icon(item.icon)
    }
    <h3>${html(item.title)}</h3>
    <p>${html(item.text)}</p>
    ${item.action ? `<a class="text-link" href="${html(item.action.href)}"><span>${html(item.action.label)}</span>${icon("arrow-right")}</a>` : ""}
  </article>
`;

const renderSubpageHero = (page) => {
  const imageStyle = page.hero.imageStyle || "illustration";
  return `
    <section class="hero-layout subpage-hero" aria-labelledby="${html(pageKey)}-title">
      <div class="hero-copy">
        <p class="section-label">${html(page.hero.label)}</p>
        <h1 id="${html(pageKey)}-title">${headline(page.hero.headline)}</h1>
        <p class="hero-body">${html(page.hero.body)}</p>
        <div class="action-row">${page.hero.actions.map((action) => actionLink(action)).join("")}</div>
      </div>
      <div class="hero-asset hero-asset--${html(imageStyle)}">
        <img src="${html(asset(page.hero.image))}" alt="${html(page.hero.imageAlt || "")}" />
      </div>
    </section>
  `;
};

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
    <div class="system-map system-map--image">
      <img src="${html(asset(section.image || "technologyLoop"))}" alt="${html(section.imageAlt || "Qutara AI intelligence loop")}" />
    </div>
  </section>
`;

const renderPhotoSplit = (section) => `
  <section class="section photo-split">
    <div>
      ${sectionIntro(section, "", false)}
      <p>${html(section.body)}</p>
    </div>
    <img class="wide-photo" src="${html(asset(section.image))}" alt="${html(section.imageAlt || "Modern trading workspace")}" />
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
      ${sectionIntro(section, "", false)}
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
    <form class="contact-form" data-contact-form data-contact-recipient="${html(section.recipient || section.contacts[0]?.text || "")}">
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
          <option>Product Inquiry</option>
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
        <a class="wordmark wordmark--footer" href="/" aria-label="${html(content.brand.name)} home" data-wordmark-footer>
          <img src="${html(asset("footerLogo"))}" alt="${html(content.brand.name)}" />
        </a>
        <p>${html(content.brand.description)}</p>
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
  const buildContactMailto = () => {
    const fieldValue = (name) => form.querySelector(`[name="${name}"]`)?.value.trim() || "";
    const recipient = form.dataset.contactRecipient || "Qutara@jumpqutaris.com";
    const name = fieldValue("name");
    const email = fieldValue("email");
    const topic = fieldValue("topic");
    const message = fieldValue("message");
    const subject = `Jump Qutaris Contact - ${topic || "General Inquiry"}`;
    const body = [
      "Hello Jump Qutaris team,",
      "",
      message,
      "",
      "---",
      `Name: ${name}`,
      `Email: ${email}`,
      `Topic: ${topic || "General Inquiry"}`
    ].join("\n");

    return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

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
      form.querySelector("[data-form-status]").textContent =
        "Opening your email app with a prepared message to Qutara@jumpqutaris.com. Please click send to deliver it.";
      window.location.href = buildContactMailto();
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

const scrollToInitialHash = () => {
  const hash = window.location.hash.slice(1);
  if (!hash) return;

  const scrollToTarget = () => {
    const target = document.getElementById(decodeURIComponent(hash));
    if (!target) return;

    const headerHeight = document.querySelector("[data-header]")?.offsetHeight || 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 24;
    const offsetTop = Math.max(top, 0);

    window.scrollTo({ top: offsetTop, behavior: "auto" });
    document.documentElement.scrollTop = offsetTop;
    document.body.scrollTop = offsetTop;
  };

  window.requestAnimationFrame(scrollToTarget);
  window.setTimeout(scrollToTarget, 100);
  window.setTimeout(scrollToTarget, 500);
  window.addEventListener("load", () => window.setTimeout(scrollToTarget, 100), { once: true });
};

window.addEventListener("hashchange", scrollToInitialHash);

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
scrollToInitialHash();

if (window.lucide) {
  window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
}
