window.SITE_CONTENT = {
  brand: {
    name: "Jump Qutaris",
    first: "Jump",
    second: "Qutaris",
    description: "AI financial intelligence for clearer research, stronger risk awareness, and better decisions."
  },
  nav: [
    { key: "trading", label: "Company", href: "trading.html" },
    { key: "technology", label: "Technology", href: "technology.html" },
    { key: "research", label: "Research", href: "research.html" },
    { key: "people", label: "Leadership", href: "people.html" },
    { key: "contact", label: "Contact", href: "contact.html" }
  ],
  assets: {
    logo: "assets/jump-qutaris-logo.png",
    footerLogo: "assets/jump-qutaris-logo-footer.png",
    heroMarket: "assets/hero-market-structure.png",
    peopleFloor: "assets/people-trading-floor.png"
  },
  home: {
    title: "Jump Qutaris | AI Financial Intelligence",
    meta: "Jump Qutaris builds AI financial intelligence infrastructure for market research, risk intelligence, quantitative analysis, and decision support.",
    hero: {
      label: "AI financial intelligence.",
      headline: "Understand Markets. Act with Clarity.",
      body: "Jump Qutaris builds AI-driven systems for market research, quantitative insight, risk awareness, and disciplined financial decisions.",
      actions: [
        { label: "Explore Technology", href: "technology.html", style: "primary" },
        { label: "Company Overview", href: "trading.html", style: "secondary" }
      ],
      metrics: [
        { label: "Founded", value: "2024" },
        { label: "Focus", value: "Financial AI" },
        { label: "Systems", value: "Quantis" },
        { label: "Scope", value: "Global" }
      ]
    },
    approach: {
      label: "Why Jump Qutaris",
      title: "Turn complexity into clarity.",
      body: "Markets move through data, news, policy, sentiment, and capital flows. We connect these signals into intelligence clients can use.",
      items: [
        {
          icon: "history",
          title: "Market Evolution",
          text: "Finance has moved from manual trading to electronic markets, quant systems, and now AI-assisted intelligence."
        },
        {
          icon: "brain",
          title: "AI-Native Research",
          text: "Models, machine learning, and agents help read market information with speed and structure."
        },
        {
          icon: "network",
          title: "Connected Signals",
          text: "Data, news, macro releases, flows, and risk signals become stronger when viewed together."
        },
        {
          icon: "bar-chart-3",
          title: "Clearer Decisions",
          text: "We help teams interpret markets faster and act with more discipline."
        }
      ]
    },
    markets: {
      label: "What We Do",
      title: "Research. Intelligence. Risk.",
      body: "We build financial AI models, market intelligence systems, research workflows, and risk-aware infrastructure.",
      items: [
        { icon: "microscope", title: "Research", text: "Financial AI models, market intelligence, and decision frameworks." },
        { icon: "cpu", title: "Build", text: "AI infrastructure for research, analytics, monitoring, and financial applications." },
        { icon: "zap", title: "Enable", text: "Faster market understanding and sharper decision quality." },
        { icon: "shield-alert", title: "Protect", text: "Risk monitoring, early warning, and extreme-event analysis." }
      ]
    },
    people: {
      label: "Leadership",
      title: "Leadership built for AI finance.",
      body: "Our team brings together market structure, AI engineering, quantitative research, and global operations experience.",
      action: { label: "Meet Leadership", href: "people.html" }
    },
    join: {
      label: "Research Areas",
      title: "Core directions in financial AI.",
      items: [
        {
          icon: "message-square-code",
          title: "Financial Large Language Models",
          text: "Models for financial documents, market reasoning, macro research, and event interpretation."
        },
        {
          icon: "bot",
          title: "AI Agents",
          text: "Autonomous workflows for market analysis, research tasks, and decision support."
        },
        {
          icon: "radar",
          title: "Market and Risk Intelligence",
          text: "Systems for market structure, flows, sentiment, risk propagation, and early warning."
        }
      ]
    },
    contact: {
      label: "Let's Connect",
      title: "Ready to understand more?"
    }
  },
  pages: {
    trading: {
      title: "Company | Jump Qutaris",
      meta: "Learn the story, mission, vision, and values behind Jump Qutaris as an AI financial intelligence company.",
      hero: {
        label: "Company",
        headline: "Markets Need Intelligence.",
        body: "Jump Qutaris was built for the moment where AI, data, and quantitative finance converge into a new layer of financial intelligence.",
        actions: [
          { label: "Why We Exist", href: "#mission", style: "primary" },
          { label: "Technology Platform", href: "technology.html", style: "secondary" }
        ],
        image: "heroMarket"
      },
      sections: [
        {
          type: "feature-grid",
          id: "mission",
          label: "Why We Exist",
          title: "From data to understanding.",
          body: "Markets produce more signals than teams can read alone. We help turn that flow into structured insight.",
          items: [
            { icon: "database", title: "Signal Flow", text: "News, filings, macro data, policy shifts, and sentiment move across markets every day." },
            { icon: "brain", title: "Meaning Layer", text: "AI helps connect what happened, why it matters, and where risk may move." },
            { icon: "cpu", title: "Platform Mindset", text: "We connect data, models, research workflows, and financial applications." }
          ]
        },
        {
          type: "market-grid",
          id: "timeline",
          label: "Company Timeline",
          title: "From market technology to AI finance.",
          body: "Our direction is shaped by electronic markets, quantitative research, and the rise of large-scale AI systems.",
          items: [
            {
              title: "1999 - Market Technology Roots",
              detail: "The modern market era began with electronic execution, global venue connectivity, and automated systems.",
              points: ["Electronic market infrastructure", "Global venue connectivity", "Technology-led market competition"]
            },
            {
              title: "2020 - AI Research Initiative",
              detail: "Machine learning and large-scale data systems became central to financial research.",
              points: ["Machine learning research", "Large-scale market data", "AI-assisted analytics"]
            },
            {
              title: "2023 - Financial AI Lab",
              detail: "Research expanded toward financial language models, AI agents, and autonomous workflows.",
              points: ["Financial language models", "AI agent systems", "Market reasoning workflows"]
            },
            {
              title: "2024 - Jump Qutaris Launch",
              detail: "Jump Qutaris launched to build AI financial intelligence infrastructure.",
              points: ["AI finance platform", "Market intelligence systems", "Decision and risk intelligence"]
            }
          ]
        },
        {
          type: "callout",
          label: "Mission and Vision",
          title: "From automation to intelligence.",
          body: "Our mission is to bring AI closer to market research, risk understanding, and practical financial decision support."
        }
      ]
    },
    technology: {
      title: "Technology | Jump Qutaris",
      meta: "Explore the financial intelligence infrastructure behind Jump Qutaris, including AI research engines, market intelligence, quantitative intelligence, and risk systems.",
      hero: {
        label: "Technology",
        headline: "Built for Financial AI.",
        body: "Our technology connects models, market signals, quantitative analytics, and risk systems into one intelligence foundation.",
        actions: [
          { label: "Core Capabilities", href: "#capabilities", style: "primary" },
          { label: "Research Lab", href: "research.html", style: "secondary" }
        ],
        image: "heroMarket"
      },
      sections: [
        {
          type: "feature-grid",
          id: "capabilities",
          label: "AI Research Engine",
          title: "A stack for financial reasoning.",
          body: "The engine combines language models, machine learning, and adaptive research systems for market analysis.",
          items: [
            { icon: "message-square-code", title: "Financial LLMs", text: "Models for news, filings, macro research, and market reasoning." },
            { icon: "brain", title: "Machine Learning", text: "Predictive systems that find structure in noisy market information." },
            { icon: "route", title: "Adaptive Learning", text: "Research frameworks for changing market conditions and decision workflows." }
          ]
        },
        {
          type: "system",
          label: "Financial Intelligence Ecosystem",
          title: "From signals to applications.",
          body: "The ecosystem links market data, AI research, decision intelligence, risk intelligence, and financial applications."
        },
        {
          type: "feature-grid",
          label: "Platform Layers",
          title: "Four layers of intelligence.",
          body: "Each layer turns raw information into cleaner research, monitoring, and decision support.",
          items: [
            { icon: "newspaper", title: "Market Intelligence", text: "News, earnings, sentiment, sectors, and macro interpretation." },
            { icon: "line-chart", title: "Quant Intelligence", text: "Factor research, strategy analysis, model training, and dynamic learning." },
            { icon: "shield-alert", title: "Risk Intelligence", text: "Risk detection, monitoring, early warning, and extreme-event analysis." },
            { icon: "database", title: "Data Infrastructure", text: "Coverage across equities, ETFs, options, futures, FX, digital assets, and macro data." }
          ]
        },
        {
          type: "callout",
          label: "Future Technologies",
          title: "Models. Agents. Intelligence.",
          body: "Our roadmap focuses on financial foundation models, autonomous agents, and AI-assisted market intelligence."
        }
      ]
    },
    people: {
      title: "Leadership | Jump Qutaris",
      meta: "Meet the leadership team behind Jump Qutaris, including executive, technology, research, architecture, and global operations leaders.",
      hero: {
        label: "Leadership",
        headline: "Led by Market Builders.",
        body: "Our leadership combines market structure, high-performance systems, quantitative research, AI engineering, and global operations.",
        actions: [
          { label: "Leadership Team", href: "#leadership", style: "primary" },
          { label: "Research Center", href: "research.html", style: "secondary" }
        ],
        image: "peopleFloor"
      },
      sections: [
        {
          type: "role-grid",
          id: "leadership",
          label: "Core Leadership",
          title: "Leadership for AI finance.",
          body: "A focused team guiding strategy, technology, research, architecture, and operations.",
          items: [
            {
              id: "robert-sterling",
              icon: "landmark",
              image: "assets/leadership/robert-sterling.jpg",
              imageAlt: "Robert Bob Sterling portrait",
              title: "Robert \"Bob\" Sterling - CEO",
              text: "Bob guides strategy, brand direction, and long-term vision across markets, liquidity, and financial infrastructure."
            },
            {
              id: "albert-saplitski",
              icon: "server-cog",
              image: "assets/leadership/albert-saplitski.jpg",
              imageAlt: "Albert Saplitski portrait",
              title: "Albert Saplitski - CIO",
              text: "Albert leads technology across high-performance infrastructure, resilient systems, and market-scale computing."
            },
            {
              id: "marcus-thorne",
              icon: "bar-chart-3",
              image: "assets/leadership/marcus-thorne.jpg",
              imageAlt: "Marcus Thorne portrait",
              title: "Dr. Marcus Thorne - Chief Analyst",
              text: "Marcus leads quantitative research, data science, machine learning, and multi-asset market analysis."
            },
            {
              id: "ethan-brooks",
              icon: "network",
              image: "assets/leadership/ethan-brooks.jpg",
              imageAlt: "Ethan Brooks portrait",
              title: "Ethan Brooks - Chief Architect",
              text: "Ethan designs platform architecture, market data systems, and high-concurrency technology built for stability."
            },
            {
              id: "elena-vega",
              icon: "globe-2",
              image: "assets/leadership/elena-vega.jpg",
              imageAlt: "Elena Vega portrait",
              title: "Elena Vega - Global Ops Manager",
              text: "Elena coordinates global operations, post-trade workflows, reconciliation, and cross-team execution."
            }
          ]
        },
        {
          type: "photo-split",
          label: "Our Team",
          title: "Built by researchers, engineers, and operators.",
          body: "The broader team works across AI, data science, quantitative research, software engineering, and fintech systems.",
          image: "peopleFloor"
        },
        {
          type: "callout",
          label: "Leadership Philosophy",
          title: "Research first. Systems always.",
          body: "We value rigorous thinking, strong infrastructure, intelligent tools, and calm operational judgment."
        }
      ]
    },
    research: {
      title: "Research | Jump Qutaris",
      meta: "Explore Jump Qutaris research in financial AI, market intelligence, AI agents, and risk intelligence.",
      hero: {
        label: "Research",
        headline: "Research That Drives Decisions.",
        body: "We study financial AI, market signals, agents, and risk systems to make intelligence practical for clients.",
        actions: [
          { label: "Research Areas", href: "#research-areas", style: "primary" },
          { label: "Technology Platform", href: "technology.html", style: "secondary" }
        ],
        image: "peopleFloor"
      },
      sections: [
        {
          type: "role-grid",
          id: "research-areas",
          label: "Research Areas",
          title: "The questions that matter.",
          body: "Our research focuses on models, agents, market intelligence, and risk systems that help clients read complexity faster.",
          items: [
            {
              id: "financial-llms",
              icon: "message-square-code",
              title: "Financial LLMs",
              text: "Earnings, news, market reasoning, and macro interpretation."
            },
            {
              id: "ai-agents",
              icon: "bot",
              title: "AI Agents",
              text: "Multi-agent systems and automated workflows for financial analysis."
            },
            {
              id: "market-intelligence",
              icon: "radar",
              title: "Market Intelligence",
              text: "Market structure, sector rotation, capital flows, sentiment, and cross-asset links."
            },
            {
              id: "risk-intelligence",
              icon: "shield-alert",
              title: "Risk Intelligence",
              text: "Risk propagation, extreme events, AI controls, and early warning systems."
            }
          ]
        },
        {
          type: "feature-grid",
          label: "Research Philosophy",
          title: "Research first. Evidence always.",
          body: "We focus on clear questions, disciplined data, and practical translation into financial workflows.",
          items: [
            { icon: "microscope", title: "Research First", text: "Every platform direction starts with clear questions and measurable assumptions." },
            { icon: "database", title: "Data Driven", text: "Market data, alternative data, macro releases, and structured datasets are analyzed with discipline." },
            { icon: "check-circle-2", title: "Evidence Based", text: "Models and workflows are tested through validation, feedback, and market behavior." }
          ]
        },
        {
          type: "callout",
          label: "Publications",
          title: "Insights for the market ahead.",
          body: "The research center will support white papers, AI finance notes, market intelligence reports, and platform updates."
        }
      ]
    },
    careers: {
      title: "Research | Jump Qutaris",
      meta: "Explore Jump Qutaris research in financial AI, market intelligence, AI agents, and risk intelligence.",
      hero: {
        label: "Research",
        headline: "Research That Drives Decisions.",
        body: "We study financial AI, market signals, agents, and risk systems to make intelligence practical for clients.",
        actions: [
          { label: "Research Areas", href: "#research-areas", style: "primary" },
          { label: "Technology Platform", href: "technology.html", style: "secondary" }
        ],
        image: "peopleFloor"
      },
      sections: [
        {
          type: "role-grid",
          id: "leadership",
          label: "Leadership",
          title: "Meet the people behind the platform.",
          body: "Clients can see the leaders guiding strategy, technology, research, architecture, and operations.",
          items: [
            {
              id: "robert-sterling-profile",
              image: "assets/leadership/robert-sterling.jpg",
              imageAlt: "Robert Bob Sterling portrait",
              title: "Robert \"Bob\" Sterling - CEO",
              text: "Leads global strategy, long-term vision, and the growth of Jump Qutaris as a financial AI company."
            },
            {
              id: "albert-saplitski-profile",
              image: "assets/leadership/albert-saplitski.jpg",
              imageAlt: "Albert Saplitski portrait",
              title: "Albert Saplitski - CIO",
              text: "Oversees high-performance infrastructure, resilient systems, and market-scale computing."
            },
            {
              id: "marcus-thorne-profile",
              image: "assets/leadership/marcus-thorne.jpg",
              imageAlt: "Marcus Thorne portrait",
              title: "Dr. Marcus Thorne - Chief Analyst",
              text: "Leads quantitative research, data science, and AI-assisted market analysis."
            },
            {
              id: "ethan-brooks-profile",
              image: "assets/leadership/ethan-brooks.jpg",
              imageAlt: "Ethan Brooks portrait",
              title: "Ethan Brooks - Chief Architect",
              text: "Guides platform architecture, market data infrastructure, and high-concurrency systems."
            },
            {
              id: "elena-vega-profile",
              image: "assets/leadership/elena-vega.jpg",
              imageAlt: "Elena Vega portrait",
              title: "Elena Vega - Global Ops Manager",
              text: "Coordinates global operations, post-trade workflows, reconciliation, and cross-team execution."
            }
          ]
        },
        {
          type: "role-grid",
          id: "research-areas",
          label: "Research Areas",
          title: "The questions that matter.",
          body: "Our research focuses on models, agents, market intelligence, and risk systems that help clients read complexity faster.",
          items: [
            {
              id: "financial-llms",
              icon: "message-square-code",
              title: "Financial LLMs",
              text: "Earnings, news, market reasoning, and macro interpretation."
            },
            {
              id: "ai-agents",
              icon: "bot",
              title: "AI Agents",
              text: "Multi-agent systems and automated workflows for financial analysis."
            },
            {
              id: "market-intelligence",
              icon: "radar",
              title: "Market Intelligence",
              text: "Market structure, sector rotation, capital flows, sentiment, and cross-asset links."
            },
            {
              id: "risk-intelligence",
              icon: "shield-alert",
              title: "Risk Intelligence",
              text: "Risk propagation, extreme events, AI controls, and early warning systems."
            }
          ]
        },
        {
          type: "feature-grid",
          label: "Research Philosophy",
          title: "Research first. Evidence always.",
          body: "We focus on clear questions, disciplined data, and practical translation into financial workflows.",
          items: [
            { icon: "microscope", title: "Research First", text: "Every platform direction starts with clear questions and measurable assumptions." },
            { icon: "database", title: "Data Driven", text: "Market data, alternative data, macro releases, and structured datasets are analyzed with discipline." },
            { icon: "check-circle-2", title: "Evidence Based", text: "Models and workflows are tested through validation, feedback, and market behavior." }
          ]
        },
        {
          type: "callout",
          label: "Publications",
          title: "Insights for the market ahead.",
          body: "The research center will support white papers, AI finance notes, market intelligence reports, and platform updates."
        }
      ]
    },
    contact: {
      title: "Contact | Jump Qutaris",
      meta: "Contact Jump Qutaris for product inquiries, partnerships, media, and general business questions.",
      hero: {
        label: "Contact",
        headline: "Let's Talk Financial AI.",
        body: "Reach out for product questions, partnerships, media, or general business inquiries.",
        actions: [
          { label: "Send Message", href: "#contact-form", style: "primary" },
          { label: "Technology Platform", href: "technology.html", style: "secondary" }
        ],
        image: "heroMarket"
      },
      sections: [
        {
          type: "contact",
          id: "contact-form",
          label: "Let's Connect",
          title: "Send the right question to the right team.",
          body: "Share a brief note and we will route it to the right contact.",
          contacts: [
            { icon: "mail", title: "General", text: "info@jumpqutaris.com", href: "mailto:info@jumpqutaris.com" },
            { icon: "boxes", title: "Product", text: "product@jumpqutaris.com", href: "mailto:product@jumpqutaris.com" },
            { icon: "handshake", title: "Partnerships", text: "partners@jumpqutaris.com", href: "mailto:partners@jumpqutaris.com" }
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
                "This policy applies to personal information collected through this website, online forms, direct communications, events, product inquiries, partnership inquiries, and similar business interactions.",
                "Separate notices or internal policies may be provided to vendors, investors, enterprise customers, partners, or other categories of individuals where required by law or by the nature of the relationship."
              ]
            },
            {
              title: "Information we may collect",
              body: [
                "We may collect information you provide directly, such as your name, email address, company, role, message content, product interest, partnership details, and any other information you choose to submit.",
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
                "We may use personal information to respond to questions, manage product or business communications, provide access to website features, maintain records, improve our website, protect systems, detect fraud or misuse, comply with legal obligations, and support other lawful business purposes.",
                "We do not use personal information collected through this website for automated decisions that produce legal or similarly significant effects about you."
              ]
            },
            {
              title: "Legal bases for processing",
              body: [
                "Where privacy laws require a legal basis, we may process personal information based on consent, contract necessity, compliance with legal obligations, legitimate interests, protection of vital interests, or other lawful bases available under applicable law.",
                "Our legitimate interests may include operating and securing our website, responding to inquiries, managing business relationships, protecting legal rights, and improving our services."
              ]
            },
            {
              title: "Sharing personal information",
              body: [
                "We do not sell personal information. We may share personal information with affiliates, service providers, hosting providers, analytics providers, professional advisors, business partners, or other third parties that support our business and process information on our behalf.",
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
                "Retention periods may vary depending on the type of information, sensitivity, applicable legal requirements, and whether the information is needed for security, audit, tax, accounting, or legal purposes."
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
                "If California privacy law applies to you, the categories of personal information we may collect include identifiers, internet or network activity, commercial or business contact information, product inquiry information, and other information you provide to us.",
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
            "By accessing or using this website, you agree to these Terms of Use. If you do not agree, you should not use the website. These terms govern the website operated by Jump Qutaris and, where relevant, its subsidiaries and affiliates.",
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
          { label: "Company", href: "trading.html" },
          { label: "Technology", href: "technology.html" },
          { label: "Research", href: "research.html" },
          { label: "Leadership", href: "people.html" },
          { label: "Contact", href: "contact.html" }
        ]
      },
      {
        title: "Intelligence",
        links: [
          { label: "AI Research Engine", href: "technology.html#capabilities" },
          { label: "Financial LLMs", href: "research.html#financial-llms" },
          { label: "AI Agents", href: "research.html#ai-agents" },
          { label: "Risk Intelligence", href: "research.html#risk-intelligence" }
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
