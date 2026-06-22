window.SITE_CONTENT = {
  brand: {
    name: "Jump Quantum",
    first: "Jump",
    second: "Quantum",
    description: "A global quantitative trading firm powered by technology, research, and exceptional people."
  },
  nav: [
    { key: "trading", label: "Trading", href: "trading.html" },
    { key: "technology", label: "Technology", href: "technology.html" },
    { key: "people", label: "People", href: "people.html" },
    { key: "careers", label: "Careers", href: "careers.html" },
    { key: "contact", label: "Contact", href: "contact.html" }
  ],
  headerCta: { label: "Explore Careers", href: "careers.html" },
  assets: {
    heroMarket: "assets/hero-market-structure.png",
    peopleFloor: "assets/people-trading-floor.png"
  },
  home: {
    title: "Jump Quantum | Quantitative Trading",
    meta: "Jump Quantum is an original multi-page quantitative trading and technology website.",
    hero: {
      label: "Quantitative trading. Technology at speed.",
      headline: "Build models. Engineer systems. Trade the future.",
      body: "We combine research, technology, and risk management to bring liquidity to the world's financial markets.",
      actions: [
        { label: "Our Approach", href: "trading.html", style: "primary" },
        { label: "Technology", href: "technology.html", style: "secondary" }
      ],
      metrics: [
        { label: "Markets", value: "Global" },
        { label: "Experience", value: "20+ Years" },
        { label: "Technologists", value: "50%+" },
        { label: "Decisions / Day", value: "Billions" }
      ]
    },
    approach: {
      label: "Our Approach",
      title: "Research-driven. Technology-powered. Risk-aware.",
      body: "We invest in people and technology to solve hard problems in markets. Our edge comes from speed, scale, and a relentless focus on continuous improvement.",
      items: [
        {
          icon: "crosshair",
          title: "Quantitative Research",
          text: "We develop statistical and machine learning models to identify and capture fleeting market opportunities."
        },
        {
          icon: "code",
          title: "Engineering at Scale",
          text: "Our low-latency infrastructure and robust systems process massive data and execute with precision."
        },
        {
          icon: "shield",
          title: "Risk Management",
          text: "Sophisticated risk frameworks and real-time monitoring protect capital and ensure market resilience."
        },
        {
          icon: "bar-chart-3",
          title: "Data Advantage",
          text: "We leverage diverse datasets and advanced analytics to inform decisions across market conditions."
        }
      ]
    },
    markets: {
      label: "Markets We Trade",
      title: "Diverse markets. Unified by technology.",
      body: "Our strategies operate across major asset classes and global markets, providing liquidity and efficiency where it's needed most.",
      items: [
        { icon: "bar-chart-3", title: "Equities", text: "Cash equities and derivatives across global venues." },
        { icon: "rotate-cw", title: "Futures", text: "Global index, interest rate, commodity, and crypto futures." },
        { icon: "share-2", title: "Options", text: "Equity, index, and volatility options strategies." },
        { icon: "globe", title: "FX", text: "Spot and derivatives across major and emerging pairs." },
        { icon: "percent", title: "Rates", text: "Government bonds, swaps, and money market instruments." },
        { icon: "boxes", title: "Digital Assets", text: "Spot, derivatives, and structured products." }
      ]
    },
    people: {
      label: "Our People",
      title: "Curious minds. Built to solve.",
      body: "We hire exceptional people who thrive in a fast-paced, collaborative environment. You'll work on meaningful problems with the latest technology and the brightest minds in the industry.",
      action: { label: "Life at Jump Quantum", href: "people.html" }
    },
    join: {
      label: "Join Us",
      title: "Choose your path. Make an impact.",
      items: [
        {
          icon: "code",
          title: "Quantitative Research",
          text: "Apply mathematics, statistics, and machine learning to discover edge in the markets.",
          action: { label: "View Roles", href: "careers.html#quantitative-research" }
        },
        {
          icon: "terminal",
          title: "Software Engineering",
          text: "Build high-performance systems that power our trading and research infrastructure.",
          action: { label: "View Roles", href: "careers.html#software-engineering" }
        },
        {
          icon: "layers",
          title: "Business & Operations",
          text: "Drive our business forward through strategy, analytics, and operational excellence.",
          action: { label: "View Roles", href: "careers.html#business-operations" }
        }
      ]
    },
    contact: {
      label: "Let's Connect",
      title: "Have a question? We'd love to hear from you.",
      action: { label: "Contact Us", href: "contact.html" }
    }
  },
  pages: {
    trading: {
      title: "Trading | Jump Quantum",
      meta: "Learn how Jump Quantum combines research, execution, and risk management across global markets.",
      hero: {
        label: "Trading",
        headline: "Liquidity, models, and execution working as one.",
        body: "Our trading approach is systematic, evidence-led, and engineered for global electronic markets.",
        actions: [
          { label: "Markets We Trade", href: "#markets", style: "primary" },
          { label: "Contact Us", href: "contact.html", style: "secondary" }
        ],
        image: "heroMarket"
      },
      sections: [
        {
          type: "feature-grid",
          label: "Our Approach",
          title: "From research idea to live market decision.",
          body: "We connect modeling, simulation, risk checks, and execution through fast feedback loops.",
          items: [
            { icon: "microscope", title: "Signal Discovery", text: "Researchers test market hypotheses with broad datasets and disciplined validation." },
            { icon: "activity", title: "Real-Time Monitoring", text: "Trading systems surface performance, risk, and venue behavior as conditions change." },
            { icon: "route", title: "Execution Design", text: "Execution logic is measured across latency, fill quality, cost, and resilience." }
          ]
        },
        {
          type: "market-grid",
          id: "markets",
          label: "Market Coverage",
          title: "Built for multiple asset classes.",
          body: "The same operating discipline supports equities, futures, options, FX, rates, and digital assets.",
          items: [
            "Equities",
            "Futures",
            "Options",
            "FX",
            "Rates",
            "Digital Assets"
          ]
        },
        {
          type: "callout",
          label: "Risk-Aware Trading",
          title: "Every system is designed with controls from the start.",
          body: "Risk is not a final approval step. It is part of research, deployment, monitoring, and post-trade review."
        }
      ]
    },
    technology: {
      title: "Technology | Jump Quantum",
      meta: "Explore the technology systems behind Jump Quantum research, data, execution, and risk.",
      hero: {
        label: "Technology",
        headline: "Infrastructure built for market speed.",
        body: "We build low-latency systems, research platforms, data pipelines, and observability tools that help teams move from insight to action.",
        actions: [
          { label: "Engineering Roles", href: "careers.html#software-engineering", style: "primary" },
          { label: "Our People", href: "people.html", style: "secondary" }
        ],
        image: "heroMarket"
      },
      sections: [
        {
          type: "feature-grid",
          label: "Platform",
          title: "Research and execution share the same heartbeat.",
          body: "Reliable technology gives researchers and engineers a common language for testing, shipping, and improving systems.",
          items: [
            { icon: "database", title: "Data Systems", text: "High-throughput pipelines prepare market, reference, and alternative datasets for research." },
            { icon: "cpu", title: "Execution Infrastructure", text: "Production systems are built for speed, observability, failover, and careful change control." },
            { icon: "radar", title: "Observability", text: "Teams monitor the behavior of models, venues, orders, and risk controls in real time." }
          ]
        },
        {
          type: "system",
          label: "System Map",
          title: "A connected stack for fast iteration.",
          body: "Researchers, engineers, traders, and risk teams work close together, using shared feedback from live markets."
        },
        {
          type: "callout",
          label: "Engineering Culture",
          title: "We value clarity, ownership, and practical speed.",
          body: "The best systems are simple to reason about, fast to measure, and resilient when markets are noisy."
        }
      ]
    },
    people: {
      title: "People | Jump Quantum",
      meta: "Meet the culture behind Jump Quantum: curious teams, shared accountability, and hard problems.",
      hero: {
        label: "People",
        headline: "Curious minds. Clear feedback. Real ownership.",
        body: "We bring together researchers, engineers, traders, and operators who like difficult problems and direct collaboration.",
        actions: [
          { label: "Explore Careers", href: "careers.html", style: "primary" },
          { label: "Contact Us", href: "contact.html", style: "secondary" }
        ],
        image: "peopleFloor"
      },
      sections: [
        {
          type: "feature-grid",
          label: "Culture",
          title: "Built for people who want to learn quickly.",
          body: "Our teams move with high trust, high accountability, and a bias toward measured improvement.",
          items: [
            { icon: "users", title: "Small Teams", text: "You work close to the people building, testing, deploying, and improving the systems." },
            { icon: "message-square", title: "Direct Feedback", text: "Ideas are debated on evidence, not hierarchy, and thoughtful disagreement is welcome." },
            { icon: "sparkles", title: "Continuous Learning", text: "Markets change quickly. So do our tools, assumptions, and ways of working." }
          ]
        },
        {
          type: "photo-split",
          label: "Inside The Work",
          title: "A place for builders.",
          body: "The environment is focused, collaborative, and oriented around real systems that operate in real markets.",
          image: "peopleFloor"
        },
        {
          type: "callout",
          label: "Life at Jump Quantum",
          title: "Fast-paced does not mean careless.",
          body: "We care about precision, honest communication, and the long-term resilience of both people and platforms."
        }
      ]
    },
    careers: {
      title: "Careers | Jump Quantum",
      meta: "Explore career paths at Jump Quantum across quantitative research, software engineering, and business operations.",
      hero: {
        label: "Careers",
        headline: "Choose your path. Make an impact.",
        body: "Work with teams that combine research, engineering, and market intuition to solve complex problems.",
        actions: [
          { label: "View Paths", href: "#roles", style: "primary" },
          { label: "Email Recruiting", href: "mailto:careers@jumpquantum.com", style: "secondary" }
        ],
        image: "peopleFloor"
      },
      sections: [
        {
          type: "role-grid",
          id: "roles",
          label: "Join Us",
          title: "Find the team where you can do your best work.",
          body: "These paths are starting points. We also like hearing from excellent people who do not fit neatly into one box.",
          items: [
            {
              id: "quantitative-research",
              icon: "code",
              title: "Quantitative Research",
              text: "Apply mathematics, statistics, and machine learning to discover edge in the markets.",
              action: { label: "Apply", href: "mailto:careers@jumpquantum.com?subject=Quantitative%20Research" }
            },
            {
              id: "software-engineering",
              icon: "terminal",
              title: "Software Engineering",
              text: "Build high-performance systems that power our trading and research infrastructure.",
              action: { label: "Apply", href: "mailto:careers@jumpquantum.com?subject=Software%20Engineering" }
            },
            {
              id: "business-operations",
              icon: "layers",
              title: "Business & Operations",
              text: "Drive the business through strategy, analytics, legal, finance, and operational excellence.",
              action: { label: "Apply", href: "mailto:careers@jumpquantum.com?subject=Business%20and%20Operations" }
            }
          ]
        },
        {
          type: "feature-grid",
          label: "What We Look For",
          title: "High agency, strong fundamentals, and calm execution.",
          body: "The work rewards people who can learn fast, communicate clearly, and stay rigorous under pressure.",
          items: [
            { icon: "brain", title: "Curiosity", text: "You enjoy asking precise questions and testing assumptions." },
            { icon: "gauge", title: "Execution", text: "You can turn ideas into working systems and measurable outcomes." },
            { icon: "handshake", title: "Collaboration", text: "You improve the work around you and share context generously." }
          ]
        }
      ]
    },
    contact: {
      title: "Contact | Jump Quantum",
      meta: "Contact Jump Quantum for recruiting, partnerships, media, and general inquiries.",
      hero: {
        label: "Contact",
        headline: "Have a question? We'd love to hear from you.",
        body: "Use the form below or reach out directly for recruiting, partnerships, media, and general inquiries.",
        actions: [
          { label: "Send Message", href: "#contact-form", style: "primary" },
          { label: "Careers", href: "careers.html", style: "secondary" }
        ],
        image: "heroMarket"
      },
      sections: [
        {
          type: "contact",
          id: "contact-form",
          label: "Let's Connect",
          title: "Tell us where to route your note.",
          body: "This demo form validates locally and opens a success state. Replace the destination later with your preferred form service.",
          contacts: [
            { icon: "mail", title: "General", text: "info@jumpquantum.com", href: "mailto:info@jumpquantum.com" },
            { icon: "briefcase", title: "Careers", text: "careers@jumpquantum.com", href: "mailto:careers@jumpquantum.com" },
            { icon: "newspaper", title: "Media", text: "media@jumpquantum.com", href: "mailto:media@jumpquantum.com" }
          ]
        }
      ]
    }
  },
  footer: {
    columns: [
      {
        title: "Company",
        links: [
          { label: "Our Approach", href: "trading.html" },
          { label: "Technology", href: "technology.html" },
          { label: "People", href: "people.html" },
          { label: "Contact", href: "contact.html" }
        ]
      },
      {
        title: "Careers",
        links: [
          { label: "Quantitative Research", href: "careers.html#quantitative-research" },
          { label: "Software Engineering", href: "careers.html#software-engineering" },
          { label: "Business & Operations", href: "careers.html#business-operations" },
          { label: "Early Careers", href: "careers.html" }
        ]
      },
      {
        title: "Legal",
        links: [
          { label: "Privacy Policy", href: "#" },
          { label: "Terms of Use", href: "#" },
          { label: "Cookie Policy", href: "#" }
        ]
      }
    ],
    social: [
      { label: "LinkedIn", href: "https://www.linkedin.com/", icon: "linkedin" },
      { label: "X", href: "https://x.com/", icon: "twitter" },
      { label: "GitHub", href: "https://github.com/", icon: "github" },
      { label: "Email", href: "mailto:info@jumpquantum.com", icon: "mail" }
    ]
  }
};
