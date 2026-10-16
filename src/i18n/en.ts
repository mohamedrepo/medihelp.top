/**
 * English dictionary — the SOURCE OF TRUTH for the translation shape.
 *
 * `Dictionary` is derived from this object (deliberately NOT `as const`, so that
 * string values widen to `string`). Every other locale is typed as
 * `Dictionary`, which makes a missing or misspelled key a compile-time error
 * instead of a silent English fallback at runtime.
 *
 * Copy rules enforced here (see docs/PORTFOLIO_PROJECT_AUDIT.md §5):
 *   - no invented clients, prices, benchmarks, credentials, awards or adoption figures
 *   - no project is described as a live hosted service
 *   - no bank or card-network name appears in marketing copy
 */
export const en = {
  brand: {
    name: 'MediHelp Technologies',
    positioning: 'Practical Software. Smarter Workflows. Better Business Operations.',
    description:
      'MediHelp Technologies develops software tools and automation solutions for business operations, fleet management, financial reporting, workflow optimisation, and intelligent applications.',
  },

  nav: {
    home: 'Home',
    projects: 'Projects',
    services: 'Services',
    about: 'About',
    contact: 'Contact',
    menu: 'Menu',
    openMenu: 'Open navigation menu',
    closeMenu: 'Close navigation menu',
    primary: 'Primary',
    breadcrumb: 'Breadcrumb',
    footer: 'Footer',
  },

  language: {
    switcherLabel: 'Language',
    switchTo: 'Switch language to',
    current: 'Current language',
  },

  common: {
    skipToContent: 'Skip to main content',
    repository: 'Repository',
    documentation: 'Documentation',
    release: 'Download release',
    viewProject: 'View project',
    backToProjects: 'Back to all projects',
    readMore: 'Read more',
    loading: 'Loading',
    notAvailable: 'Not available',
    opensInNewTab: 'opens in a new tab',
    externalLink: 'External link',
    illustrationNote: 'Illustration — not a screenshot of the application.',
    lastReviewed: 'Last reviewed',
  },

  home: {
    metaTitle: 'MediHelp Technologies — Practical Software and Business Automation',
    metaDescription:
      'MediHelp Technologies builds software for business operations, fleet management, financial reporting, workflow automation and Windows diagnostics.',
    hero: {
      eyebrow: 'Software for operations teams',
      title: 'Software that simplifies business operations.',
      lede: 'We build tools that take repetitive, error-prone operational work and turn it into something that runs reliably — extraction from portals that resist automation, fleet and maintenance records, financial workbooks, Windows diagnostics and repair, and the workflows in between.',
      ctaPrimary: 'Explore our projects',
      ctaSecondary: 'Explore our services',
      ctaTertiary: 'Contact us',
      honestyNote:
        'Every project below is an independently verifiable public repository. Where something is unfinished, the page says so.',
    },
    trust: {
      heading: 'How we work',
      items: [
        {
          title: 'Local-first by default',
          body: 'Tools that handle financial, tax or card data are built so that data stays on the operator’s own machine. Several projects request no network access at all.',
        },
        {
          title: 'Evidence before action',
          body: 'Anyone can claim a system is broken. Our diagnostic work is designed around captured evidence, explicit confidence levels, and a rollback path for every change.',
        },
        {
          title: 'Refuse the dangerous shortcut',
          body: 'Repair tooling is built to refuse unsafe operations outright — not to warn and proceed, but to hard-block them.',
        },
        {
          title: 'Verifiable, not advertised',
          body: 'Architecture, limitations and source are published with each project so the claims can be checked rather than taken on trust.',
        },
      ],
    },
    featured: {
      heading: 'Selected work',
      lede: 'Four projects that show the range of what we build: a full fleet operations platform, a released e-invoicing exporter, a safety-gated Windows diagnostic toolkit, and a card scanner that structurally cannot leak data.',
      cta: 'See all projects',
    },
    categories: {
      heading: 'What we build',
      lede: 'The catalogue is organised by the operational problem being solved, not by technology fashion.',
    },
    maturitySection: {
      heading: 'An honest maturity scale',
      lede: 'Software marketing usually hides the difference between a prototype and a shipped product. We label it instead, on every single project.',
    },
    capabilities: {
      heading: 'Technical focus',
      lede: 'The stack we actually use across the projects in this portfolio.',
      groups: [
        {
          title: 'Product engineering',
          items: [
            'Next.js and React with TypeScript',
            'Electron desktop packaging',
            'Tailwind CSS design systems',
            'Prisma and SQLite data modelling',
          ],
        },
        {
          title: 'Browser and platform',
          items: [
            'Chrome Manifest V3 extensions',
            'Android with Kotlin and on-device ML',
            'Windows services, WPF and .NET',
            'PowerShell automation and DSC-style servicing',
          ],
        },
        {
          title: 'Data and reporting',
          items: [
            'Excel (.xlsx) generation with applied formatting',
            'Portal and API data extraction',
            'Documented REST integrations',
            'Reliability-focused reporting',
          ],
        },
        {
          title: 'Automation',
          items: [
            'n8n workflow automation',
            'Scheduled research and reporting pipelines',
            'API orchestration across services',
            'Failure handling and retry logic',
          ],
        },
      ],
    },
    servicesSection: {
      heading: 'Services',
      lede: 'We take on the operational problem, not just the ticket.',
      cta: 'Explore our services',
    },
    contactSection: {
      heading: 'Tell us what is slowing your operations down',
      lede: 'Describe the process that is costing you time. We will tell you plainly whether software fixes it, how we would approach it, and what we would need from you.',
      cta: 'Contact us',
    },
  },

  maturity: {
    released: {
      label: 'Released',
      description: 'Source is public and a versioned download has been published.',
    },
    active: {
      label: 'Active development',
      description: 'Source is public and work is ongoing, but there is no packaged download yet.',
    },
    prototype: {
      label: 'Prototype',
      description: 'Working source exists with a documented list of what is still unfinished.',
    },
    experiment: {
      label: 'Experiment',
      description: 'Exploratory or internal work rather than a user-facing product.',
    },
  },

  categoryLabels: {
    fleet: 'Fleet Management',
    financial: 'Financial & Excel Tools',
    security: 'Security & Diagnostics',
    windows: 'Windows Applications',
    extensions: 'Browser Extensions',
    mobile: 'Mobile Applications',
    workflow: 'Workflow Automation',
    desktop: 'Desktop Utilities',
  },

  categoryDescriptions: {
    fleet: 'Vehicle records, maintenance scheduling, work orders and fleet reporting.',
    financial:
      'Extraction and generation of financial and tax workbooks from portals that are not built for bulk export.',
    security: 'Local diagnostics, vulnerability assessment and safety-gated repair.',
    windows: 'Provisioning, servicing and standardising Windows installations.',
    extensions: 'Chrome extensions built for a single, narrowly defined operator task.',
    mobile: 'Android applications designed to work fully offline.',
    workflow: 'Scheduled automation that replaces a recurring manual job.',
    desktop: 'Native desktop tooling for downloading and managing large files.',
  },

  projects: {
    metaTitle: 'Projects — MediHelp Technologies',
    metaDescription:
      'A verifiable catalogue of software projects: fleet management, e-invoicing and Excel reporting, Windows diagnostics, browser extensions, Android tools and workflow automation.',
    heading: 'Projects',
    lede: 'Every entry below links to its public repository. Maturity is labelled honestly, and a project with no packaged download is never presented as a shipped product.',
    filters: {
      searchLabel: 'Search projects',
      searchPlaceholder: 'Search by name, technology or problem…',
      categoryLabel: 'Filter by category',
      allCategories: 'All categories',
      maturityLabel: 'Filter by maturity',
      allMaturity: 'Any maturity',
      clear: 'Clear filters',
    },
    results: {
      one: '1 project',
      many: '{count} projects',
      filtered: 'Showing {shown} of {total} projects',
      empty: 'No projects match those filters.',
      emptyHint: 'Try a different search term, or clear the filters to see everything.',
    },
  },

  project: {
    problem: 'The problem',
    solution: 'The approach',
    features: 'What is implemented',
    technologies: 'Technology',
    limitations: 'Current status and limitations',
    status: 'Status',
    links: 'Links',
    related: 'Related work',
    ctaHeading: 'Have a similar problem?',
    ctaBody:
      'If this is close to something you are dealing with, describe your situation and we will tell you whether it is a good fit.',
    ctaButton: 'Start a conversation',
    noRepositoryNote:
      'This project’s source is not public. Contact us if you would like to know more about it.',
    screenshotNotice:
      'No screenshots from this project can be published: it handles financial or personal data, so all visuals here are illustrations and contain no real records.',
    releasedNotice: 'A versioned download is available for this project.',
    noDownloadNotice:
      'There is no packaged download for this project yet — the link below goes to the source code.',
  },

  services: {
    metaTitle: 'Services — MediHelp Technologies',
    metaDescription:
      'Custom software development, business process automation, Excel and financial reporting tools, fleet management software, Windows applications, browser extensions and API integrations.',
    heading: 'Services',
    lede: 'Each service below is backed by a project in this portfolio that we can show you. No service is offered that we cannot point to working code for.',
    labels: {
      deliverables: 'Typical deliverables',
      suitableFor: 'Suitable for',
      enquire: 'How to start',
    },
    cta: { heading: 'Not sure which of these you need?', body: 'Describe the process and we will tell you honestly what we would build — including when the answer is “you do not need custom software for this”.', button: 'Get in touch' },
    items: {
      customSoftware: {
        title: 'Custom software development',
        summary:
          'Web and desktop applications built around a specific operational process that off-the-shelf software does not fit.',
        deliverables: [
          'Requirements discussion and a written scope',
          'A working application, not a slide deck',
          'Data model and schema you own',
          'Source code handed over with documentation',
        ],
        suitableFor:
          'Teams whose process is genuinely specific, and who have outgrown spreadsheets but do not fit a packaged product.',
      },
      automation: {
        title: 'Business process automation',
        summary:
          'Replacing recurring manual work — scheduled reports, cross-system data movement, notification pipelines — with automation that fails visibly rather than silently.',
        deliverables: [
          'Documented workflow definitions',
          'Scheduled or event-triggered execution',
          'Error handling and retry behaviour',
          'Run history you can inspect',
        ],
        suitableFor:
          'Operations where someone is spending predictable hours each week on a task that a machine should be doing.',
      },
      financialTools: {
        title: 'Excel and financial reporting tools',
        summary:
          'Extracting and generating financial and tax workbooks, including from portals that offer no bulk export.',
        deliverables: [
          'Multi-sheet workbook generation with applied formatting',
          'Portal or API data extraction',
          'Column mapping that matches an existing reference file',
          'Filtering, date ranges and reconciliation output',
        ],
        suitableFor:
          'Finance and tax teams who currently assemble reports by hand, page by page, from a portal they cannot query directly.',
      },
      fleetManagement: {
        title: 'Fleet management software',
        summary:
          'Vehicle records, maintenance scheduling, work orders, fuel monitoring and the reporting that sits on top of them.',
        deliverables: [
          'Vehicle, maintenance and work-order data model',
          'Fuel and cost tracking',
          'Operational dashboards and reports',
          'Desktop packaging where offline use is required',
        ],
        suitableFor:
          'Fleet operators managing enough vehicles that paper and spreadsheets have stopped being reliable.',
      },
      windowsApplications: {
        title: 'Windows desktop applications',
        summary:
          'Native Windows tooling: diagnostics, deployment and provisioning, and the packaging that makes it deployable.',
        deliverables: [
          'Native application or PowerShell toolchain',
          'Standardised, repeatable installation or servicing runs',
          'Clear logging and per-run reporting',
          'Safety controls for anything that mutates a system',
        ],
        suitableFor: 'IT and desktop teams that maintain a standard image or a fleet of managed machines.',
      },
      browserExtensions: {
        title: 'Browser extensions',
        summary:
          'Manifest V3 extensions that automate one specific task inside a web application, with the minimum permissions required.',
        deliverables: [
          'Manifest V3 extension',
          'Minimum-necessary permission model',
          'Per-origin access requested on user action',
          'Publishing guidance for the Chrome Web Store',
        ],
        suitableFor:
          'Businesses whose workflow depends on a web portal that offers no API and no bulk export.',
      },
      integrations: {
        title: 'Workflow automation and API integration',
        summary:
          'Connecting the systems you already use so data moves between them without a human retyping it, including n8n workflow design.',
        deliverables: [
          'Workflow and integration design',
          'n8n workflows or direct API integrations',
          'Credential handling done through a secret manager',
          'Documentation so your team can maintain it',
        ],
        suitableFor: 'Teams running several tools that each hold part of the picture, with no shared automation layer.',
      },
      diagnostics: {
        title: 'Diagnostics and reliability tooling',
        summary:
          'Investigation tooling for stubborn, intermittent problems — built to produce evidence and ranked hypotheses instead of guesses.',
        deliverables: [
          'Structured diagnostic collection',
          'Findings carrying evidence and confidence levels',
          'A rollback path for every proposed change',
          'Reports a support team can act on',
        ],
        suitableFor:
          'Anyone who has been told “the driver is definitely the problem” without being shown any evidence.',
      },
    },
  },

  about: {
    metaTitle: 'About — MediHelp Technologies',
    metaDescription:
      'MediHelp Technologies is a software development and automation practice based in Egypt, focused on operational, fleet, financial and workflow problems.',
    heading: 'About MediHelp Technologies',
    lede: 'A software development and automation practice focused on the unglamorous operational problems that quietly consume working hours.',
    mission: {
      heading: 'What we are for',
      body: [
        'MediHelp Technologies builds software tools and automation for business operations. The work sits where a process has become too important to run on spreadsheets and too specific to be solved by a purchased product.',
        'That means a lot of our projects look unremarkable from the outside: an extension that pulls tax invoices out of a portal instead of a person paging through thousands of them; a Windows tool that tells you what is actually wrong before touching anything; a fleet platform that keeps maintenance and fuel records in one place.',
        'We describe these plainly, publish the source, and label what is not finished. If a project is a prototype, it is called a prototype.',
      ],
    },
    focus: {
      heading: 'Technical focus',
      lede: 'Areas where we have working software to point at, rather than a list of things we would like to offer.',
    },
    approach: {
      heading: 'How we approach a problem',
      steps: [
        {
          title: 'Understand the actual process',
          body: 'Before proposing anything, we establish what happens today, who does it, how long it takes, and which part is actually painful. The apparent problem is often not the real one.',
        },
        {
          title: 'Prefer the boring reliable option',
          body: 'If a documented API exists, we use it. If a workflow tool solves it in an afternoon, we use that instead of writing an application. Custom software is the last resort, not the first.',
        },
        {
          title: 'Keep sensitive data where it belongs',
          body: 'Financial, tax and card data is processed locally wherever the architecture allows it. Where a tool must talk to an external service, it talks to one we can name, with the minimum permission needed.',
        },
        {
          title: 'Make failure visible',
          body: 'Automation that fails silently is worse than no automation. Error states, retries and reports are part of the deliverable, not a later refinement.',
        },
        {
          title: 'Hand it over properly',
          body: 'Documentation, source and limitations are part of every delivery. You should be able to maintain or move on from what we build.',
        },
      ],
    },
    principles: {
      heading: 'What we will not do',
      items: [
        'Claim a working product when we have a prototype.',
        'Publish performance numbers, client names or adoption figures we cannot substantiate.',
        'Disable or weaken a system’s own security controls to make a tool look more effective.',
        'Bypass DRM, authentication or access controls.',
        'Move your operational data onto infrastructure you did not agree to.',
        'Promise a delivery date or a fixed price before understanding the scope.',
        'Describe our own work as open source when no licence has been published.',
      ],
    },
    working: {
      heading: 'Working with us',
      body: 'We are based in Egypt and work with clients remotely. The most useful first message describes the process, roughly how often it runs, what it currently costs you in time, and what a good outcome looks like. You will get a straight answer about whether software is the right fix.',
    },
    contactCta: {
      heading: 'Discuss your project',
      body: 'Tell us about the process you want to improve.',
      button: 'Contact us',
    },
  },

  contact: {
    metaTitle: 'Contact — MediHelp Technologies',
    metaDescription:
      'Get in touch with MediHelp Technologies about software development, automation, fleet management, financial reporting tools or Windows applications.',
    heading: 'Contact',
    lede: 'Describe the process you want to improve. The more concrete the description, the more useful our reply will be.',
    form: {
      heading: 'Send a message',
      name: 'Name',
      namePlaceholder: 'Your name',
      email: 'Email',
      emailPlaceholder: 'you@company.com',
      company: 'Company',
      companyPlaceholder: 'Optional',
      subject: 'Subject',
      subjectPlaceholder: 'What is this about?',
      message: 'Message',
      messagePlaceholder:
        'What process is costing you time? How is it handled today, and roughly how often?',
      optional: 'optional',
      required: 'required',
      submit: 'Send message',
      submitting: 'Sending…',
      privacyNote:
        'Your message is used only to reply to you. It is not added to any mailing list, and it is not shared with anyone else.',
      honeypotLabel: 'Leave this field empty',
      successHeading: 'Message sent',
      successBody:
        'Thank you — your message has been delivered. We will reply to the address you provided.',
      errorHeading: 'Message not sent',
      errorGeneric:
        'Something went wrong delivering your message. Nothing was sent, so please try again.',
      errorNotConfigured:
        'The contact form is not fully configured on this deployment yet, so your message was not delivered. Nothing was sent.',
      errorRateLimited: 'Too many messages have been sent from this connection. Please try again later.',
      errorValidation: 'Please correct the highlighted fields and try again.',
      sendAnother: 'Send another message',
    },
    validation: {
      nameRequired: 'Please enter your name.',
      nameTooLong: 'Name must be 120 characters or fewer.',
      emailRequired: 'Please enter your email address.',
      emailInvalid: 'Please enter a valid email address.',
      companyTooLong: 'Company must be 160 characters or fewer.',
      subjectRequired: 'Please enter a subject.',
      subjectTooLong: 'Subject must be 160 characters or fewer.',
      messageRequired: 'Please enter a message.',
      messageTooShort: 'Please write at least 20 characters so we can understand the request.',
      messageTooLong: 'Message must be 5000 characters or fewer.',
    },
    channels: {
      heading: 'Other ways to reach us',
      lede: 'These are the only contact channels we can verify. We would rather publish nothing than publish an address that does not work.',
      website: 'Website',
      github: 'GitHub',
      location: 'Based in',
      locationValue: 'Egypt',
      noEmail:
        'There is no published email address: none has been verified, and we will not invent one. The form above is the intended contact route.',
      responseNote: 'Messages are read during business hours in Egypt.',
    },
    alternatives: {
      heading: 'Before you write',
      items: [
        'Looking for a specific project? Each project page links to its repository, where you can check the source and the current status directly.',
        'Reporting a defect in one of our public projects? Opening an issue on the repository is usually faster than the form.',
        'Asking about pricing or delivery times? We deliberately quote those after understanding scope, so the first reply will contain questions rather than a number.',
      ],
    },
  },

  privacy: {
    metaTitle: 'Data and Privacy — MediHelp Technologies',
    metaDescription:
      'How this website handles data: no analytics, no tracking, and contact form submissions used only to reply to you.',
    heading: 'Data and privacy',
    lede: 'This site is deliberately built to collect as little as possible.',
    sections: [
      {
        heading: 'Analytics and tracking',
        body: 'There is none. This site loads no analytics service, no advertising pixel, and no third-party tracking script. No cookie is set for tracking purposes, and no consent banner is needed because nothing is being tracked.',
      },
      {
        heading: 'What the contact form collects',
        body: 'The form collects your name, email address, an optional company name, a subject and your message. Those fields exist so that we can reply to you; nothing else is requested.',
      },
      {
        heading: 'How form data is used',
        body: 'Your submission is transmitted to our server, validated, and delivered as an email notification to MediHelp Technologies. It is not stored in a marketing database, not added to any mailing list, and not shared or sold.',
      },
      {
        heading: 'Abuse prevention',
        body: 'Submissions are rate limited by connection and checked against basic spam signals so that the form cannot be used to flood our inbox. This is a technical protection measure, not profiling.',
      },
      {
        heading: 'Third-party services',
        body: 'The contact form is delivered through a transactional email provider. Aside from that delivery step, the page itself loads its fonts and scripts from this domain rather than from third-party content networks.',
      },
      {
        heading: 'Language preference',
        body: 'If you switch language, one value — “en” or “ar” — is remembered in your browser’s local storage so that returning to the site opens it in the language you chose. It identifies nobody, it is sent nowhere, and clearing your browser storage removes it.',
      },
      {
        heading: 'Questions',
        body: 'If you want to know what we hold about a message you have sent us, use the contact form and ask. We will tell you, and delete it on request.',
      },
    ],
    backToContact: 'Back to contact',
  },

  notFound: {
    metaTitle: 'Page not found — MediHelp Technologies',
    metaDescription: 'The page you requested does not exist on this site.',
    code: '404',
    heading: 'That page does not exist',
    body: 'The link may be out of date, or the address may have been typed incorrectly. Everything on this site is reachable from the pages below.',
    ctaHome: 'Go to the homepage',
    ctaProjects: 'Browse projects',
  },

  footer: {
    tagline: 'Practical software and automation for business operations.',
    exploreHeading: 'Explore',
    projectsHeading: 'Projects',
    companyHeading: 'Company',
    legalHeading: 'Legal',
    privacy: 'Data and privacy',
    rights: 'All rights reserved.',
    trademarkNote:
      'Product and company names mentioned on this site are the property of their respective owners. MediHelp Technologies is independent and is not affiliated with, endorsed by, or sponsored by any bank, card network, government portal or software vendor named in a linked project.',
    buildNote: 'No analytics. No tracking.',
  },
};

/** The canonical dictionary shape. Every locale must satisfy it exactly. */
export type Dictionary = typeof en;
