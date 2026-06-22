const content = window.SITE_CONTENT;

const createLink = (item, className = "") => {
  const link = document.createElement("a");
  link.href = item.href;
  link.textContent = item.label;
  if (className) link.className = className;
  return link;
};

const fillText = (selector, value) => {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
};

const renderNavigation = () => {
  const desktopNav = document.querySelector("[data-nav]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  content.navigation.forEach((item) => {
    desktopNav.appendChild(createLink(item));
    mobileNav.appendChild(createLink(item));
  });
};

const renderHero = () => {
  fillText("[data-brand-tagline]", content.brand.tagline);
  fillText("[data-hero-headline]", content.hero.headline);
  fillText("[data-hero-body]", content.hero.body);

  const actions = document.querySelector("[data-hero-actions]");
  actions.appendChild(createLink(content.hero.primaryAction, "button button--primary"));
  actions.appendChild(createLink(content.hero.secondaryAction, "button button--secondary"));

  const metrics = document.querySelector("[data-hero-metrics]");
  content.hero.metrics.forEach((metric) => {
    const item = document.createElement("div");
    item.className = "metric";
    item.innerHTML = `<strong>${metric.value}</strong><span>${metric.label}</span>`;
    metrics.appendChild(item);
  });
};

const renderCapabilities = () => {
  fillText("[data-capabilities-title]", content.capabilitiesIntro.title);
  fillText("[data-capabilities-body]", content.capabilitiesIntro.body);
  const grid = document.querySelector("[data-capabilities]");

  content.capabilities.forEach((capability, index) => {
    const card = document.createElement("article");
    card.className = "capability-card";
    card.innerHTML = `
      <span>${String(index + 1).padStart(2, "0")}</span>
      <h3>${capability.title}</h3>
      <p>${capability.text}</p>
    `;
    grid.appendChild(card);
  });
};

const renderMarkets = () => {
  fillText("[data-markets-title]", content.markets.title);
  fillText("[data-markets-body]", content.markets.body);
  const list = document.querySelector("[data-markets]");

  content.markets.items.forEach((market) => {
    const item = document.createElement("div");
    item.className = "market-item";
    item.innerHTML = `<span>${market}</span><i></i>`;
    list.appendChild(item);
  });
};

const renderCulture = () => {
  fillText("[data-culture-title]", content.culture.title);
  fillText("[data-culture-body]", content.culture.body);
  const list = document.querySelector("[data-culture-points]");

  content.culture.points.forEach((point) => {
    const item = document.createElement("li");
    item.textContent = point;
    list.appendChild(item);
  });
};

const renderCareers = () => {
  fillText("[data-careers-title]", content.careers.title);
  const grid = document.querySelector("[data-careers]");

  content.careers.cards.forEach((career) => {
    const card = document.createElement("article");
    card.className = "career-card";
    card.innerHTML = `
      <h3>${career.title}</h3>
      <p>${career.text}</p>
    `;
    card.appendChild(createLink(career.link, "text-link"));
    grid.appendChild(card);
  });
};

const renderContact = () => {
  fillText("[data-contact-title]", content.contact.title);
  fillText("[data-contact-body]", content.contact.body);

  const links = document.querySelector("[data-contact-links]");
  content.contact.links.forEach((link) => {
    links.appendChild(createLink(link, "contact-link"));
  });

  const footer = document.querySelector("[data-footer-links]");
  content.footer.links.forEach((link) => {
    footer.appendChild(createLink(link));
  });

  fillText("[data-year]", new Date().getFullYear());
};

const wireInteractions = () => {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-mobile-panel]");
  const mobileLinks = panel.querySelectorAll("a");

  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    panel.classList.remove("is-open");
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    panel.classList.toggle("is-open", !isOpen);
  });

  mobileLinks.forEach((link) => link.addEventListener("click", closeMenu));

  window.addEventListener("scroll", () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  });
};

renderNavigation();
renderHero();
renderCapabilities();
renderMarkets();
renderCulture();
renderCareers();
renderContact();
wireInteractions();
