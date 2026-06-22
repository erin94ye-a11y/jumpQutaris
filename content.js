window.SITE_CONTENT = {
  brand: {
    name: "Jump Qutaris",
    first: "Jump",
    second: "Qutaris",
    description: "A global quantitative trading firm powered by technology, research, and exceptional people."
  },
  nav: [
    { key: "trading", label: "Trading", href: "trading.html" },
    { key: "technology", label: "Technology", href: "technology.html" },
    { key: "people", label: "People", href: "people.html" },
    { key: "careers", label: "Careers", href: "careers.html" },
    { key: "contact", label: "Contact", href: "contact.html" }
  ],
  assets: {
    logo: "assets/jump-qutaris-logo.png",
    footerLogo: "assets/jump-qutaris-logo-footer.png",
    heroMarket: "assets/hero-market-structure.png",
    peopleFloor: "assets/people-trading-floor.png"
  },
  home: {
    title: "Jump Qutaris | Quantitative Trading",
    meta: "Jump Qutaris is an original multi-page quantitative trading and technology website.",
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
        { icon: "globe", title: "FX", text: "Spot and derivatives across major and emerging pairs." },
        { icon: "boxes", title: "Digital Assets", text: "Spot, derivatives, and structured products." }
      ]
    },
    people: {
      label: "Our People",
      title: "Curious minds. Built to solve.",
      body: "We hire exceptional people who thrive in a fast-paced, collaborative environment. You'll work on meaningful problems with the latest technology and the brightest minds in the industry.",
      action: { label: "Life at Jump Qutaris", href: "people.html" }
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
      title: "Have a question? We'd love to hear from you."
    }
  },
  pages: {
    trading: {
      title: "Trading | Jump Qutaris",
      meta: "Learn how Jump Qutaris combines research, execution, and risk management across global markets.",
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
          body: "The same operating discipline supports equities, futures, FX, and digital assets.",
          items: [
            {
              title: "Equities",
              detail: "Cash equities and related instruments across global venues, with research focused on liquidity, microstructure, and execution quality.",
              points: ["Global venue coverage", "Execution-quality analysis", "Short- and medium-horizon signals"]
            },
            {
              title: "Futures",
              detail: "Strategies across index, commodity, interest-rate, and crypto futures where systematic research and disciplined execution can scale.",
              points: ["Cross-market signal research", "Robust risk controls", "Venue-aware execution"]
            },
            {
              title: "FX",
              detail: "Spot and derivatives coverage across major and emerging currency pairs, supported by data pipelines and real-time monitoring.",
              points: ["Major and emerging pairs", "Macro and microstructure inputs", "Continuous market monitoring"]
            },
            {
              title: "Digital Assets",
              detail: "Digital asset strategies across spot and derivative markets, with an emphasis on infrastructure resilience and risk-aware deployment.",
              points: ["Spot and derivative markets", "24/7 monitoring workflows", "Infrastructure-first risk design"]
            }
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
      title: "Technology | Jump Qutaris",
      meta: "Explore the technology systems behind Jump Qutaris research, data, execution, and risk.",
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
      title: "People | Jump Qutaris",
      meta: "Meet the culture behind Jump Qutaris: curious teams, shared accountability, and hard problems.",
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
          label: "Life at Jump Qutaris",
          title: "Fast-paced does not mean careless.",
          body: "We care about precision, honest communication, and the long-term resilience of both people and platforms."
        }
      ]
    },
    careers: {
      title: "Careers | Jump Qutaris",
      meta: "Explore career paths at Jump Qutaris across quantitative research, software engineering, and business operations.",
      hero: {
        label: "Careers",
        headline: "Choose your path. Make an impact.",
        body: "Work with teams that combine research, engineering, and market intuition to solve complex problems.",
        actions: [
          { label: "View Paths", href: "#roles", style: "primary" },
          { label: "Email Recruiting", href: "mailto:careers@jumpqutaris.com", style: "secondary" }
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
              action: { label: "Apply", href: "mailto:careers@jumpqutaris.com?subject=Quantitative%20Research" }
            },
            {
              id: "software-engineering",
              icon: "terminal",
              title: "Software Engineering",
              text: "Build high-performance systems that power our trading and research infrastructure.",
              action: { label: "Apply", href: "mailto:careers@jumpqutaris.com?subject=Software%20Engineering" }
            },
            {
              id: "business-operations",
              icon: "layers",
              title: "Business & Operations",
              text: "Drive the business through strategy, analytics, legal, finance, and operational excellence.",
              action: { label: "Apply", href: "mailto:careers@jumpqutaris.com?subject=Business%20and%20Operations" }
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
      title: "Contact | Jump Qutaris",
      meta: "Contact Jump Qutaris for recruiting, partnerships, media, and general inquiries.",
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
            { icon: "mail", title: "General", text: "info@jumpqutaris.com", href: "mailto:info@jumpqutaris.com" },
            { icon: "briefcase", title: "Careers", text: "careers@jumpqutaris.com", href: "mailto:careers@jumpqutaris.com" },
            { icon: "newspaper", title: "Media", text: "media@jumpqutaris.com", href: "mailto:media@jumpqutaris.com" }
          ]
        }
      ]
    },
    privacy: {
      title: "Privacy Policy | Jump Qutaris",
      meta: "Privacy Policy for Jump Qutaris covering website data, cookies, privacy rights, retention, security, and contact information.",
      layout: "policy",
      sections: [
        {
          type: "policy",
          label: "Data Protection and Privacy Policy",
          title: "How Jump Qutaris handles personal information",
          intro:
            "This Privacy Policy explains how Jump Qutaris, together with its subsidiaries and affiliates where applicable, may collect, use, disclose, protect, and retain personal information when you visit our website, communicate with us, or otherwise interact with our business.",
          groups: [
            {
              title: "Scope of this policy",
              body: [
                "This policy applies to personal information collected through this website, online forms, direct communications, events, business inquiries, recruiting inquiries, and similar interactions.",
                "Separate notices or internal policies may apply to employees, contractors, candidates, vendors, investors, or other categories of individuals where required by law or by the nature of the relationship."
              ]
            },
            {
              title: "Information we may collect",
              body: [
                "We may collect information you provide directly, such as your name, email address, company, role, message content, resume or recruiting details, and any other information you choose to submit.",
                "We may also collect limited website and device information, such as IP address, browser type, pages viewed, referring pages, approximate location, date and time of access, and usage information generated by cookies or similar technologies."
              ]
            },
            {
              title: "Cookies and analytics",
              body: [
                "Our website may use cookies, pixels, tags, analytics tools, or similar technologies to understand site performance, improve user experience, secure the website, and measure how visitors interact with our pages.",
                "Most browsers allow you to block or delete cookies. If you disable cookies, some website functions may not work as intended."
              ]
            },
            {
              title: "How we use personal information",
              body: [
                "We may use personal information to respond to questions, manage business or recruiting communications, provide access to website features, maintain records, improve our website, protect systems, detect fraud or misuse, comply with legal obligations, and support other lawful business purposes.",
                "We do not use personal information collected through this website for automated decisions that produce legal or similarly significant effects about you."
              ]
            },
            {
              title: "Legal bases for processing",
              body: [
                "Where privacy laws require a legal basis, we may process personal information based on consent, contract necessity, compliance with legal obligations, legitimate interests, protection of vital interests, or other lawful bases available under applicable law.",
                "Our legitimate interests may include operating and securing our website, responding to inquiries, recruiting, managing business relationships, protecting legal rights, and improving our services."
              ]
            },
            {
              title: "Sharing personal information",
              body: [
                "We do not sell personal information. We may share personal information with affiliates, service providers, hosting providers, analytics providers, professional advisors, recruiting partners, or other third parties that support our business and process information on our behalf.",
                "We may also disclose information when required or permitted by law, regulation, legal process, governmental request, security investigation, corporate transaction, or to protect the rights, safety, property, or integrity of Jump Qutaris, our users, or others."
              ]
            },
            {
              title: "International transfers",
              body: [
                "Jump Qutaris may operate across jurisdictions. Personal information may be transferred to, stored in, or accessed from countries that may have different privacy laws from your country of residence.",
                "Where required, we use appropriate safeguards designed to protect personal information in connection with international transfers."
              ]
            },
            {
              title: "Data retention",
              body: [
                "We retain personal information only for as long as reasonably necessary for the purpose for which it was collected, to comply with legal or regulatory requirements, to resolve disputes, to enforce agreements, or to protect legitimate business interests.",
                "Retention periods may vary depending on the type of information, sensitivity, applicable legal requirements, and whether the information is needed for security, audit, employment, tax, accounting, or legal purposes."
              ]
            },
            {
              title: "Security",
              body: [
                "We use administrative, technical, and organizational measures designed to protect personal information from unauthorized access, disclosure, alteration, loss, misuse, or destruction.",
                "No method of transmission or storage is completely secure, and we cannot guarantee absolute security of information transmitted through or stored on the internet."
              ]
            },
            {
              title: "Your privacy rights",
              body: [
                "Depending on where you live, you may have rights to request access, correction, deletion, restriction, portability, objection to certain processing, withdrawal of consent, or information about how your personal information has been used or disclosed.",
                "You may also have the right to opt out of certain uses of personal information and to lodge a complaint with a data protection authority. We will not discriminate against you for exercising privacy rights available under applicable law."
              ]
            },
            {
              title: "California privacy disclosures",
              body: [
                "If California privacy law applies to you, the categories of personal information we may collect include identifiers, internet or network activity, professional or employment-related information, commercial or business contact information, and other information you provide to us.",
                "We do not knowingly sell or share personal information as those terms are defined under applicable California privacy law, and we do not knowingly sell or share the personal information of individuals under 16."
              ]
            },
            {
              title: "Third-party websites",
              body: [
                "Our website may link to third-party websites, social platforms, or services that are not owned or controlled by Jump Qutaris.",
                "We are not responsible for the privacy practices, security, or content of those third-party services. Review their privacy notices before providing information to them."
              ]
            },
            {
              title: "Policy updates",
              body: [
                "We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or business operations.",
                "When we update this policy, we will revise the date above. Continued use of the website after an update means you have reviewed the updated policy."
              ]
            },
            {
              title: "Contact",
              body: [
                "If you have questions or requests about this Privacy Policy or your personal information, contact Jump Qutaris at privacy@jumpqutaris.com.",
                "Please include enough information for us to understand and respond to your request. We may need to verify your identity before acting on certain privacy rights requests."
              ]
            }
          ]
        }
      ]
    },
    terms: {
      title: "Terms of Use | Jump Qutaris",
      meta: "Terms of Use for the Jump Qutaris website, including permitted use, ownership, disclaimers, liability limits, and contact information.",
      layout: "policy",
      sections: [
        {
          type: "policy",
          label: "Website Terms and Conditions",
          title: "Rules for using the Jump Qutaris website",
          intro:
            "By accessing or using this website, you agree to these Terms of Use. If you do not agree, you should not use the website. These terms apply to the website operated by Jump Qutaris and, where applicable, its subsidiaries and affiliates.",
          groups: [
            {
              title: "Acceptance and updates",
              body: [
                "Each time you use this website, you agree to the version of these Terms of Use then posted on the site.",
                "Jump Qutaris may update, suspend, replace, or remove any part of the website or these terms at any time without prior notice. Continued use of the website after changes are posted means you accept the updated terms."
              ]
            },
            {
              title: "Privacy policy",
              body: [
                "The Jump Qutaris Privacy Policy is incorporated into these Terms of Use by reference.",
                "Please review the Privacy Policy to understand how we may collect, use, retain, and disclose personal information connected with website use and communications with us."
              ]
            },
            {
              title: "Limited website license",
              body: [
                "Jump Qutaris grants you a limited, revocable, nonexclusive, nontransferable license to access and use this website for personal, informational, and non-commercial purposes.",
                "You may not copy, modify, distribute, perform, publish, sell, license, create derivative works from, or exploit website content except as expressly allowed by these terms or by written permission from Jump Qutaris."
              ]
            },
            {
              title: "Ownership and intellectual property",
              body: [
                "The website, including its text, graphics, interfaces, code, logos, names, designs, icons, images, data presentations, and other materials, is owned by Jump Qutaris or its licensors and is protected by applicable intellectual property laws.",
                "Nothing on the website transfers any ownership interest or grants a license to use any Jump Qutaris name, logo, trademark, service mark, trade dress, or other source-identifying material."
              ]
            },
            {
              title: "No investment, trading, or professional advice",
              body: [
                "Website materials are provided for general informational purposes only and do not constitute investment advice, trading advice, legal advice, tax advice, an offer to buy or sell securities or digital assets, or a recommendation regarding any strategy, product, or transaction.",
                "You should not rely on website content as the basis for financial, investment, trading, or other professional decisions."
              ]
            },
            {
              title: "No warranty",
              body: [
                "The website and its materials are provided on an as-is and as-available basis. Jump Qutaris does not warrant that the website will be accurate, complete, current, secure, uninterrupted, error-free, or free from harmful components.",
                "To the fullest extent permitted by law, Jump Qutaris disclaims all express, implied, and statutory warranties, including warranties of merchantability, fitness for a particular purpose, title, non-infringement, availability, and reliability."
              ]
            },
            {
              title: "Limitation of liability",
              body: [
                "To the fullest extent permitted by law, Jump Qutaris and its affiliates, directors, officers, employees, contractors, agents, service providers, and representatives will not be liable for any indirect, incidental, special, consequential, exemplary, punitive, or similar damages arising from or connected with your use of, or inability to use, the website.",
                "This limitation applies whether the claim is based in contract, tort, negligence, strict liability, statute, or any other legal theory, even if Jump Qutaris has been advised of the possibility of such damages."
              ]
            },
            {
              title: "Third-party links",
              body: [
                "The website may contain links to third-party websites, platforms, services, or resources that are not owned or controlled by Jump Qutaris.",
                "Jump Qutaris is not responsible for third-party content, policies, security, availability, or practices. Accessing third-party resources is at your own discretion and risk."
              ]
            },
            {
              title: "User conduct and security",
              body: [
                "You may not use the website in a way that is unlawful, harmful, deceptive, abusive, infringing, disruptive, or inconsistent with these terms.",
                "You may not attempt to interfere with website operation, bypass security controls, introduce malicious code, scrape content in an unauthorized manner, or access systems or data without permission."
              ]
            },
            {
              title: "General provisions",
              body: [
                "If any provision of these Terms of Use is found invalid or unenforceable, the remaining provisions will remain in effect, and the affected provision will be interpreted to best accomplish its intended purpose to the extent permitted by law.",
                "Failure by Jump Qutaris to enforce any provision does not waive our right to enforce that provision or any other provision later."
              ]
            },
            {
              title: "Contact",
              body: [
                "Questions about these Terms of Use may be sent to legal@jumpqutaris.com.",
                "For privacy-related requests, please use the contact information provided in the Jump Qutaris Privacy Policy."
              ]
            }
          ]
        }
      ]
    },
    cookie: {
      title: "Cookie Policy | Jump Qutaris",
      meta: "Cookie Policy for Jump Qutaris covering cookies, analytics, preferences, and browser controls.",
      layout: "policy",
      sections: [
        {
          type: "policy",
          label: "Cookie Policy",
          title: "How Jump Qutaris uses cookies",
          intro:
            "This Cookie Policy explains how Jump Qutaris may use cookies and similar technologies on our website to operate the site, understand performance, improve the visitor experience, and protect our systems.",
          groups: [
            {
              title: "What cookies are",
              body: [
                "Cookies are small text files that a website stores on your device when you visit a page. Similar technologies may include pixels, tags, local storage, scripts, and analytics identifiers.",
                "These technologies help a website remember basic information, measure how pages are used, and support security and performance functions."
              ]
            },
            {
              title: "Types of cookies we may use",
              body: [
                "Strictly necessary cookies help the website load, route traffic, maintain security, prevent abuse, and provide core functions that cannot reasonably operate without them.",
                "Performance and analytics cookies help us understand how visitors use the website, which pages are viewed, and where technical improvements may be needed.",
                "Preference cookies may remember choices such as language, region, display settings, or similar site preferences where those options are available."
              ]
            },
            {
              title: "Why we use cookies",
              body: [
                "Jump Qutaris may use cookies to operate and secure the website, diagnose technical issues, understand aggregate usage trends, improve content and navigation, and support lawful business communications.",
                "We do not use cookies on this website to make automated decisions that produce legal or similarly significant effects about visitors."
              ]
            },
            {
              title: "Third-party technologies",
              body: [
                "Some cookies or similar technologies may be provided by service providers that help us host the website, measure usage, detect security issues, or improve reliability.",
                "Those providers may process limited information such as IP address, browser type, device information, pages viewed, referring pages, and approximate location according to their own terms and privacy notices."
              ]
            },
            {
              title: "Your choices",
              body: [
                "Most browsers allow you to block, delete, or manage cookies through browser settings. Your device or browser may also provide privacy controls for tracking, analytics, and local storage.",
                "If you disable some cookies, certain parts of the website may not load correctly or may not remember your preferences."
              ]
            },
            {
              title: "Do Not Track and similar signals",
              body: [
                "Some browsers send Do Not Track or similar signals. Because there is no consistent industry standard for responding to these signals, our website may not respond to every such signal in the same way.",
                "Where legally required, Jump Qutaris will honor applicable opt-out signals or consent choices through the mechanisms provided on the website or through supported browser controls."
              ]
            },
            {
              title: "Relationship to privacy policy",
              body: [
                "Information collected through cookies and similar technologies may be considered personal information under some laws.",
                "Please review the Jump Qutaris Privacy Policy for more information about how we collect, use, disclose, retain, and protect personal information."
              ]
            },
            {
              title: "Contact",
              body: [
                "Questions about this Cookie Policy may be sent to privacy@jumpqutaris.com.",
                "Please include enough detail for us to understand your request and respond appropriately."
              ]
            }
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
          { label: "Privacy Policy", href: "privacy-policy.html" },
          { label: "Terms of Use", href: "terms-of-use.html" },
          { label: "Cookie Policy", href: "cookie-policy.html" }
        ]
      }
    ]
  }
};
