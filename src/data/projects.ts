import type { Locale } from '../i18n/types';

/**
 * The project catalogue.
 *
 * Every factual claim in this file is traceable to the repository evidence
 * recorded in `docs/PORTFOLIO_PROJECT_AUDIT.md` (READMEs, file trees, package
 * manifests, Prisma schema, docs directories, test directories, CI workflows and
 * release metadata). Nothing is inferred from a repository name.
 *
 * Deliberate omissions, enforced by the audit:
 *   - no project is described as a live hosted service (none exists)
 *   - no price, trial, benchmark, adoption figure or download that was not verified
 *   - optional URLs are OMITTED rather than set to empty strings
 *   - no bank or card-network name appears in marketing copy
 *   - nothing derived from the private `SmartFleet-Manager/upload/` directory
 */

export type Maturity = 'released' | 'active' | 'prototype' | 'experiment';

export type CategoryId =
  | 'fleet'
  | 'financial'
  | 'security'
  | 'windows'
  | 'extensions'
  | 'mobile'
  | 'workflow'
  | 'desktop';

export type Accent = 'cyan' | 'blue' | 'violet' | 'emerald' | 'amber' | 'rose';

export interface ProjectText {
  /** Public-facing name. Deliberately different from the repository name where
      the repository name carries a third-party trademark or a less clear label. */
  name: string;
  /** One or two sentences for cards and meta descriptions. */
  summary: string;
  /** The operational problem and who has it. */
  problem: string;
  /** How the project approaches it. */
  solution: string;
  /** Implemented, evidence-backed capabilities only. */
  verifiedFeatures: string[];
  /** Honest statement of what is unfinished or risky. */
  limitations: string[];
}

export interface Project {
  slug: string;
  /** Repository name under github.com/mohamedrepo. */
  repo: string;
  category: CategoryId;
  maturity: Maturity;
  featured: boolean;
  technologies: string[];
  /** Always present: every project's source is public. */
  repositoryUrl: string;
  /** Only set where a release genuinely carries a downloadable asset. */
  releaseUrl?: string;
  /** Only set where a real documentation file exists in the repository. */
  documentationUrl?: string;
  /**
   * True where the project handles financial, tax or payment-card data. Such a
   * project can never ship a real screenshot to the website, so the detail page
   * shows an explicit illustration notice instead of implying a screenshot.
   */
  sensitiveData: boolean;
  accent: Accent;
  /** ISO date this entry was last checked against the repository. */
  reviewedOn: string;
  text: Record<Locale, ProjectText>;
}

const REPO = 'https://github.com/mohamedrepo';

function project(p: Omit<Project, 'repositoryUrl'> & { repositoryUrl?: string }): Project {
  return { repositoryUrl: `${REPO}/${p.repo}`, ...p };
}

export const projects: Project[] = [
  /* ------------------------------------------------------------------ */
  project({
    slug: 'smartfleet-manager',
    repo: 'SmartFleet-Manager',
    category: 'fleet',
    maturity: 'active',
    featured: true,
    accent: 'cyan',
    sensitiveData: true,
    reviewedOn: '2026-10-15',
    technologies: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Prisma',
      'SQLite',
      'PostgreSQL',
      'Electron',
      'TanStack Query',
      'Recharts',
      'Leaflet',
      'Zod',
      'Vitest',
    ],
    text: {
      en: {
        name: 'SmartFleet Manager',
        summary:
          'A fleet operations platform covering vehicle records, maintenance scheduling, work orders, fuel monitoring and the reporting built on top of them.',
        problem:
          'Fleet operators end up running operations across a spreadsheet per concern: one for vehicles, another for service history, another for fuel cards, and a folder of scanned work orders. Nothing agrees with anything else, maintenance gets missed, and answering a simple question — what did this vehicle actually cost us this year — takes a day of assembly.',
        solution:
          'A single platform with one data model behind every screen. Eight related records — vehicles, work orders, fuel transactions, maintenance records, tyres, spare parts, fuel stations and branches — replace the disconnected spreadsheets, and each operational report is derived from the same source rather than rebuilt by hand. It runs as a web application and can be packaged as a desktop application for sites that need it locally.',
        verifiedFeatures: [
          'Vehicle records with specifications, registration and status',
          'Maintenance scheduling with work orders and per-vehicle service history',
          'Fuel transaction monitoring with consumption patterns and cost tracking',
          'Report generation covering distance deviations, maintenance history and fleet performance',
          'Operational dashboard with fleet status, alerts and key metrics',
          'Spare parts and tyre inventory tracking',
          'Location and route support through map integration',
          'Automated daily backups plus manual backup and recovery',
          'Desktop packaging via Electron alongside the web application',
          'Automated tests covering fuel monitoring, fuel refunds, the refunds API and vehicle management',
        ],
        limitations: [
          'No packaged release: the code is public and the installer scripts are in the repository, but no versioned build has been published for download.',
          'Development is paused — the last commit was May 2026.',
          'No licence file is published, so the source is not licensed for reuse.',
          'It is a substantial application and currently has a single contributor, so there is no support structure or user community behind it.',
          'Excel export is handled in-process; behaviour on very large exports has not been validated at scale.',
        ],
      },
      ar: {
        name: 'SmartFleet Manager',
        summary:
          'منصة لإدارة عمليات الأسطول تغطي سجلات المركبات وجدولة الصيانة وأوامر العمل ومتابعة الوقود والتقارير المبنية عليها.',
        problem:
          'ينتهي مشغّلو الأسطول إلى إدارة عملياتهم عبر جدول بيانات لكل شأن: واحد للمركبات، وآخر لسجل الصيانة، وثالث لبطاقات الوقود، ومجلد لأوامر العمل الممسوحة ضوئيًا. لا يتفق أي منها مع الآخر، وتُفوَّت أعمال الصيانة، والإجابة عن سؤال بسيط — كم كلّفتنا هذه المركبة فعلًا هذا العام — تستهلك يوم عمل كاملًا للتجميع.',
        solution:
          'منصة واحدة يقف خلف كل شاشة فيها نموذج بيانات واحد. فثمانية سجلات مترابطة — المركبات وأوامر العمل ومعاملات الوقود وسجلات الصيانة والإطارات وقطع الغيار ومحطات الوقود والفروع — تحلّ محل جداول البيانات المنفصلة، ويُستخرج كل تقرير تشغيلي من المصدر نفسه بدل إعادة بنائه يدويًا. ويعمل النظام كتطبيق ويب، ويمكن تغليفه كتطبيق سطح مكتب للمواقع التي تحتاجه محليًا.',
        verifiedFeatures: [
          'سجلات المركبات مع المواصفات وبيانات التسجيل والحالة',
          'جدولة الصيانة مع أوامر العمل وسجل خدمة لكل مركبة',
          'متابعة معاملات الوقود مع أنماط الاستهلاك وتتبّع التكاليف',
          'إنشاء تقارير تغطي انحرافات المسافة وسجل الصيانة وأداء الأسطول',
          'لوحة معلومات تشغيلية تعرض حالة الأسطول والتنبيهات والمؤشرات الأساسية',
          'تتبّع مخزون قطع الغيار والإطارات',
          'دعم المواقع والمسارات عبر تكامل الخرائط',
          'نسخ احتياطي يومي تلقائي مع نسخ واستعادة يدوية',
          'تغليف كتطبيق سطح مكتب عبر Electron إلى جانب تطبيق الويب',
          'اختبارات آلية تغطي متابعة الوقود واسترداد قيم الوقود وواجهته وإدارة المركبات',
        ],
        limitations: [
          'لا يوجد إصدار مُغلَّف: الشيفرة عامة وسكربتات التثبيت موجودة في المستودع، لكن لم تُنشر أي نسخة مرقّمة للتنزيل.',
          'التطوير متوقّف مؤقتًا — آخر تعديل كان في مايو 2026.',
          'لا يوجد ملف ترخيص منشور، لذا الشيفرة غير مرخَّصة لإعادة الاستخدام.',
          'تطبيق كبير يساهم فيه شخص واحد حاليًا، لذا لا توجد بنية دعم أو مجتمع مستخدمين خلفه.',
          'تصدير Excel يتم داخل التطبيق، ولم تُختبر سلوكياته على أحجام تصدير كبيرة جدًا.',
        ],
      },
    },
  }),

  /* ------------------------------------------------------------------ */
  project({
    slug: 'eta-invoicing-exporter',
    repo: 'eta-invoice-exporter',
    category: 'financial',
    maturity: 'released',
    featured: true,
    accent: 'emerald',
    sensitiveData: true,
    reviewedOn: '2026-10-15',
    releaseUrl: `${REPO}/eta-invoice-exporter/releases/latest`,
    documentationUrl: `${REPO}/eta-invoice-exporter/blob/main/docs/requirements.md`,
    technologies: [
      'Chrome Manifest V3',
      'JavaScript',
      'ExcelJS',
      'REST API',
      'Service Worker',
      'IndexedDB',
    ],
    text: {
      en: {
        name: 'ETA eInvoicing Bulk Exporter',
        summary:
          'A Chrome extension that exports every invoice and line item from Egypt’s national e-invoicing portal into a formatted Excel workbook, using the portal’s own API rather than page-by-page scraping.',
        problem:
          'Tax authorities increasingly require businesses to file electronic invoices through a government portal, and those portals are built for one-at-a-time interaction. Producing a year of transactional data for an audit or a reconciliation means opening thousands of pages by hand. The reference workflow for this project involved exporting 3,487 pages manually.',
        solution:
          'The portal is queried through the same internal API its own front end uses, with details fetched by parallel workers, and the result is written into a workbook that mirrors the exact layout finance teams already work with: the same two sheets, the same column order, the same Arabic headers, the same status colour coding. Because it runs inside the portal tab using the operator’s existing session, there are no credentials to enter and no data leaves the machine.',
        verifiedFeatures: [
          'Bulk export of all sent and received invoices for a chosen date range',
          'Full line-item detail per invoice: taxes by type, discounts, seller and buyer details, currency and share links',
          'Two-sheet Excel output matching a reference workbook: 58 columns per invoice, 64 per line item',
          'RTL sheet formatting with frozen header row, column widths, borders and status colour coding',
          'Filters for date range, submission versus issue date, direction, status and document type',
          'Registration-number filtering across sender, receiver or either side, with strict ID matching that excludes fuzzy name matches',
          'Export of registered item codes from the portal’s code-usages page',
          'Parallel detail fetching with pause, resume and cancel',
          'Resume after an interrupted run without re-fetching completed invoices',
          'Optional download of the official PDF for every collected invoice',
          'A debug-report action that copies a full diagnostic snapshot for support',
        ],
        limitations: [
          'It depends on a government portal’s internal API, which is not a public contract. The portal can change without notice, and its troubleshooting documentation exists because that has happened.',
          'Large exports are slow by nature: roughly 43,000 invoices means 43,000 detail requests, expected to take tens of minutes on a typical connection.',
          'No automated test suite and no CI workflow.',
          'No licence file is published.',
          'It handles real taxpayer data, so no screenshot of it can ever be published — every visual on this page is an illustration.',
        ],
      },
      ar: {
        name: 'أداة تصدير الفواتير الإلكترونية',
        summary:
          'إضافة Chrome تُصدِّر كل الفواتير وبنودها من بوابة الفواتير الإلكترونية الوطنية في مصر إلى ملف Excel منسَّق، باستخدام واجهة البوابة نفسها بدل تصفّح الصفحات واحدة تلو الأخرى.',
        problem:
          'تتطلّب مصلحة الضرائب بشكل متزايد تقديم الفواتير إلكترونيًا عبر بوابة حكومية، لكن تلك البوابات مبنية للتعامل مع فاتورة واحدة في كل مرة. ولذلك يعني إعداد بيانات سنة كاملة لأغراض المراجعة أو المطابقة فتح آلاف الصفحات يدويًا. وقد اشتمل سير العمل المرجعي لهذا المشروع على تصدير 3487 صفحة يدويًا.',
        solution:
          'يتم الاستعلام من البوابة عبر واجهة API الداخلية نفسها التي يستخدمها واجهتها الأمامي، مع جلب التفاصيل بوحدات تنفيذ متوازية، ثم تُكتب النتيجة في ملف عمل يحاكي التنسيق الذي تعمل به فرق المالية فعلًا: الورقتان نفساهما، وترتيب الأعمدة نفسه، والعناوين العربية نفسها، وترميز الألوان نفسه للحالات. ولأن الإضافة تعمل داخل تبويب البوابة مستخدمةً جلسة المستخدم القائمة، فلا توجد بيانات دخول تُدخَل، ولا تخرج أي بيانات من الجهاز.',
        verifiedFeatures: [
          'تصدير مجمَّع لكل الفواتير الصادرة والواردة خلال نطاق زمني محدَّد',
          'تفاصيل كاملة لبنود كل فاتورة: الضرائب حسب النوع والخصومات وبيانات البائع والمشتري والعملة وروابط المشاركة',
          'ملف Excel بورتين مطابق لملف مرجعي: 58 عمودًا لكل فاتورة و64 لكل بند',
          'تنسيق الأوراق من اليمين إلى اليسار مع تثبيت صف العناوين وعروض الأعمدة والحدود وترميز ألوان الحالات',
          'تصفية حسب النطاق الزمني وتاريخ التقديم مقابل تاريخ الإصدار والاتجاه والحالة ونوع المستند',
          'تصفية برقم التسجيل على جهة الإرسال أو الاستقبال أو كليهما، بمطابقة دقيقة للمُعرِّف تستبعد مطابقات الأسماء التقريبية',
          'تصدير أكواد الأصناف المسجَّلة من صفحة أكواد الاستخدام في البوابة',
          'جلب التفاصيل بشكل متوازٍ مع إمكانية الإيقاف المؤقت والاستئناف والإلغاء',
          'استئناف العمل بعد انقطاع دون إعادة جلب الفواتير المكتملة',
          'تنزيل اختياري لملف PDF الرسمي لكل فاتورة مجمَّعة',
          'إجراء «نسخ تقرير التشخيص» الذي ينسخ لقطة تشخيصية كاملة لأغراض الدعم الفني',
        ],
        limitations: [
          'يعتمد المشروع على واجهة API داخلية تابعة لبوابة حكومية، وهي ليست عقدًا عامًا. فقد تتغيّر البوابة دون إشعار، ووثائق استكشاف الأخطاء موجودة تحديدًا لأن ذلك حدث فعلًا.',
          'التصدير المجمَّع بطيء بطبيعته: نحو 43 ألف فاتورة تعني 43 ألف طلب تفاصيل، ويُتوقَّع أن تستغرق عشرات الدقائق على اتصال عادي.',
          'لا توجد مجموعة اختبارات آلية ولا سير عمل CI.',
          'لا يوجد ملف ترخيص منشور.',
          'الأداة تتعامل مع بيانات دافعين حقيقية، لذلك لا يمكن نشر أي لقطة شاشة منها إطلاقًا — وكل رسم في هذه الصفحة توضيحي.',
        ],
      },
    },
  }),

  /* ------------------------------------------------------------------ */
  project({
    slug: 'windows-sentinel',
    repo: 'WinVuln',
    category: 'security',
    maturity: 'prototype',
    featured: true,
    accent: 'violet',
    sensitiveData: false,
    reviewedOn: '2026-10-15',
    documentationUrl: `${REPO}/WinVuln/blob/main/docs/ROADMAP.md`,
    technologies: ['C#', '.NET 8', 'WPF', 'PowerShell', 'SQLite', 'xUnit'],
    text: {
      en: {
        name: 'Windows Sentinel',
        summary:
          'A local-only Windows 11 diagnostic, vulnerability-assessment and repair toolkit built on one rule: every finding needs evidence, and every repair needs a rollback path.',
        problem:
          'Diagnosing a Windows machine that freezes intermittently usually ends in guesswork. A support tool reports twenty problems, most of them irrelevant, and “fixes” them without recording what it changed. When the machine breaks further there is no way back and no record of what happened. Meanwhile the honest answer — this is most likely the display driver, with moderate confidence, and here is the evidence — is never offered.',
        solution:
          'A toolkit that starts read-only and stays read-only until a repair is explicitly requested. Findings carry evidence, a confidence level, a severity and a rollback plan rather than a verdict. Repairs fall into three tiers, and the most dangerous operations are hard-blocked rather than merely discouraged — the tool will not disable Defender, the firewall, Secure Boot, BitLocker or UAC under any circumstance, and it never uploads logs or telemetry.',
        verifiedFeatures: [
          'Three-tier repair classification: safe-automatic, requires-approval, and never-automatic',
          'An evidence engine where every finding carries evidence, confidence, source, recommended action, risk and rollback method',
          'System inventory and Windows version, build and edition detection with pending-reboot awareness',
          'Windows Defender status reporting',
          'Event-log correlation for freeze, black-screen and mouse-symptom investigations, producing ranked hypotheses rather than blame',
          'Driver problem-device auditing through WMI/CIM',
          'Storage SMART and reliability counter reporting',
          'Power-plan and timeout inspection',
          'A runnable read-only PowerShell diagnostic core that needs no build step and emits HTML, JSON and text reports',
          'A WPF desktop shell, a SQLite data layer and a parameterised PowerShell execution layer',
          'Unit tests covering the evidence engine, the safety classifier and the pre-flight guard',
          'A published privacy document stating that no telemetry is uploaded',
        ],
        limitations: [
          'This is an active build, not a finished product. The repository roadmap marks most diagnostic modules as scaffolded or partial, and says so openly.',
          'No downloadable build exists — both published releases have no attached files, and the desktop application must be compiled on Windows.',
          'Live vulnerability-intelligence fetching from vendor and government sources is a designed capability with a documented offline fallback; it was not independently verified as working during this audit.',
          'The repository name is WinVuln while the project itself is called Windows Sentinel.',
          'No licence file is published.',
        ],
      },
      ar: {
        name: 'Windows Sentinel',
        summary:
          'مجموعة أدوات محلية لتشخيص نظام Windows 11 وتقييم الثغرات وإصلاحها، مبنية على قاعدة واحدة: كل نتيجة تحتاج دليلًا، وكل إصلاح يحتاج مسار تراجع.',
        problem:
          'ينتهي تشخيص جهاز Windows يتجمّد بشكل متقطّع عادةً إلى التخمين. فأداة الدعم تُبلّغ عن عشرين مشكلة، معظمها غير ذي صلة، ثم «تُصلحها» دون تسجيل ما غيّرته. وحين يزداد الجهاز سوءًا لا يوجد سبيل للعودة ولا سجل لما حدث. وفي المقابل، لا تُقدَّم الإجابة الصادقة أبدًا: هذا على الأرجح تعريف شاشة العرض، بثقة متوسطة، وهذا هو الدليل.',
        solution:
          'مجموعة أدوات تبدأ للقراءة فقط وتبقى كذلك حتى يُطلب الإصلاح صراحةً. وتحمل كل نتيجة دليلها ومستوى ثقتها ودرجة خطورتها ومسار التراجع عنها، بدل إصدار حكم نهائي. وتُصنَّف الإصلاحات إلى ثلاث درجات، وتُمنع أخطر العمليات منعًا تامًا لا مجرد تنبيه: فالأداة لن تُعطّل Windows Defender أو الجدار الناري أو Secure Boot أو BitLocker أو UAC تحت أي ظرف، ولا ترفع السجلات أو بيانات التشخيص إلى أي مكان.',
        verifiedFeatures: [
          'تصنيف الإصلاحات على ثلاث درجات: آمن وتلقائي، ويحتاج موافقة، وممنوع تلقائيًا',
          'محرِّك أدلة تحمل فيه كل نتيجة الدليل ومستوى الثقة والمصدر والإجراء الموصى به والخطورة وطريقة التراجع',
          'حصر مكوّنات النظام وتحديد إصدار Windows وبنائه وإصداره مع الانتباه إلى الحاجة لإعادة التشغيل',
          'تقرير عن حالة Windows Defender',
          'ربط أحداث سجل النظام لتحقيقات التجمّد والشاشة السوداء ومشكلات الفأرة، بإنتاج فرضيات مرتَّبة بدل إلقاء اللوم',
          'تدقيق الأجهزة ذات مشكلات التعرّف عبر WMI/CIM',
          'تقرير عن عدّادات الاعتمادية وSMART لوسائط التخزين',
          'فحص خطط الطاقة ومهل إيقاف التشغيل',
          'نواة تشخيصية بـ PowerShell قابلة للتشغيل للقراءة فقط دون الحاجة لخطوة بناء، وتُخرج تقارير بصيغ HTML و JSON ونصية',
          'واجهة سطح مكتب بـ WPF وطبقة بيانات SQLite وطبقة تنفيذ PowerShell مُعامَلة',
          'اختبارات وحدة تغطي محرِّك الأدلة ومصنِّف الأمان وحاجز الفحص المسبق',
          'وثيقة خصوصية منشورة تنص على عدم رفع أي بيانات تشخيصية',
        ],
        limitations: [
          'هذا عمل قيد البناء وليس منتجًا مكتملًا. فخارطة الطريق في المستودع تُصنّف معظم وحدات التشخيص كمراحل هيكلية أو جزئية، وتعلن ذلك صراحةً.',
          'لا توجد نسخة قابلة للتنزيل — فالإصداران المنشوران بلا ملفات مرفقة، ويجب بناء تطبيق سطح المكتب على نظام Windows.',
          'جلب معلومات الثغرات الحيّة من مصادر الشركات والجهات الحكومية قدرة مُصمَّمة لها بديل موثَّق للعمل دون إنترنت، ولم يتم التحقق من عملها بشكل مستقل خلال هذه المراجعة.',
          'اسم المستودع WinVuln بينما اسم المشروع نفسه Windows Sentinel.',
          'لا يوجد ملف ترخيص منشور.',
        ],
      },
    },
  }),

  /* ------------------------------------------------------------------ */
  project({
    slug: 'card-scanner',
    repo: 'VisaCardScanner',
    category: 'mobile',
    maturity: 'released',
    featured: true,
    accent: 'amber',
    sensitiveData: true,
    reviewedOn: '2026-10-15',
    releaseUrl: `${REPO}/VisaCardScanner/releases/latest`,
    technologies: ['Kotlin', 'Android', 'ML Kit', 'Gradle', 'Excel export'],
    text: {
      en: {
        name: 'Card Scanner',
        summary:
          'An Android application that records issued payment cards from the camera and exports them to Excel, designed so that it is structurally incapable of leaking card data.',
        problem:
          'Organisations that issue physical cards to staff or drivers often need an inventory: which card went to whom, and when. Doing this with a notes app or a spreadsheet means someone types card numbers by hand, which is slow and puts full card numbers into files that then get emailed around. It is the kind of quiet data-protection problem that nobody owns until an audit finds it.',
        solution:
          'An offline Android application that scans a card with the camera, keeps only the masked number and the last four digits, and exports an Excel workbook. The privacy guarantees are structural rather than procedural: there is no column that can hold a full card number, the application declares no network permission at all, card images are captured in memory and discarded, and the exporter re-scans its own finished workbook and rejects it if any card-number-like sequence appears.',
        verifiedFeatures: [
          'Camera scanning with a fast capture interface',
          'Masked-number-only records: the data model exposes a masked number and last four digits, with no field able to store a full number',
          'No CVV, PIN, magnetic-stripe or chip data is read or stored — there is no recognition path and no column for it',
          'On-device optical character recognition with the bundled offline model',
          'Formatted Excel workbook export, matching the layout of the issuing organisation’s own tracking sheet',
          'Export self-verification: the finished workbook is re-scanned and rejected if a card-number-like sequence is found',
          'Sensitive fields cleared from memory once consumed',
          'No network permission declared, so the application is technically unable to transmit data',
          'Screen-capture protection and cloud-backup exclusion',
          'Six published releases with downloadable builds',
        ],
        limitations: [
          'It records card inventory only. It is not a payment terminal and cannot authorise, charge or process a payment.',
          'It is not affiliated with, endorsed by or sponsored by any card network; “Visa” appears only in the repository name because that is the card type it was written for.',
          'No automated test suite and no CI workflow.',
          'No licence file is published.',
          'The project is recent, so it has not been proven at scale.',
          'It handles payment-card data by nature, so no screenshot can be published — every visual here is an illustration.',
        ],
      },
      ar: {
        name: 'Card Scanner',
        summary:
          'تطبيق Android يسجّل بطاقات الدفع المُصدَرة عبر الكاميرا ويصدّرها إلى Excel، مُصمَّم بحيث يكون بنيويًا غير قادر على تسريب بيانات البطاقات.',
        problem:
          'تحتاج المؤسسات التي تُصدر بطاقات فعلية للموظفين أو السائقين غالبًا إلى جرد: أي بطاقة ذهبت إلى مَن، ومتى. وإنجاز ذلك عبر تطبيق ملاحظات أو جدول بيانات يعني أن يُدخل أحدهم أرقام البطاقات يدويًا، وهو أمر بطيء ويضع الأرقام الكاملة في ملفات تُرسَل بعدها بالبريد. وهذه من مشكلات حماية البيانات الصامتة التي لا يتحمّلها أحد حتى تكتشفها مراجعة.',
        solution:
          'تطبيق Android يعمل دون اتصال، يمسح البطاقة بالكاميرا، ويحتفظ فقط بالرقم المقنَّع وآخر أربعة أرقام، ثم يصدّر ملف Excel. وضمانات الخصوصية فيه بنيوية لا إجرائية: فلا يوجد عمود يمكن أن يحمل رقم بطاقة كاملًا، ولا يطلب التطبيق صلاحية الشبكة إطلاقًا، وتُلتقط صور البطاقة في الذاكرة ثم تُهمَل، ويعيد المُصدِّر فحص ملفه النهائي ويرفضه إن ظهر فيه أي تسلسل يشبه رقم بطاقة.',
        verifiedFeatures: [
          'المسح بالكاميرا عبر واجهة التقاط سريعة',
          'سجلات بالأرقام المقنَّعة فقط: نموذج البيانات يعرض رقمًا مقنَّعًا وآخر أربعة أرقام، دون أي حقل قادر على تخزين رقم كامل',
          'لا يُقرأ أو يُخزَّن رمز CVV ولا رقم PIN ولا بيانات الشريط المغناطيسي أو الشريحة — فلا يوجد مسار تعرّف ولا عمود لذلك',
          'تعرّف ضوئي على الحروف يعمل على الجهاز باستخدام النموذج المضمَّن دون اتصال',
          'تصدير ملف Excel منسَّق يطابق تنسيق ورقة المتابعة الخاصة بالمؤسسة المُصدِرة',
          'تحقّق ذاتي عند التصدير: يُعاد فحص ملف العمل النهائي ويُرفض إن وُجد فيه تسلسل يشبه رقم بطاقة',
          'إزالة الحقول الحساسة من الذاكرة بعد استخدامها',
          'عدم طلب صلاحية الشبكة إطلاقًا، ما يجعل التطبيق عاجزًا تقنيًا عن إرسال أي بيانات',
          'حماية من لقطات الشاشة ومن النسخ الاحتياطي السحابي',
          'ستة إصدارات منشورة بنسخ قابلة للتنزيل',
        ],
        limitations: [
          'التطبيق يسجّل جرد البطاقات فقط. وهو ليس طرفًا في الدفع ولا يستطيع تخويل أي عملية أو تحصيلها أو معالجتها.',
          'التطبيق غير تابع ولا معتمد ولا مدعوم من أي شبكة بطاقات؛ ولا يظهر اسم «Visa» إلا في اسم المستودع لأنه نوع البطاقة الذي كُتب من أجله.',
          'لا توجد مجموعة اختبارات آلية ولا سير عمل CI.',
          'لا يوجد ملف ترخيص منشور.',
          'المشروع حديث، لذا لم يُثبت على نطاق واسع.',
          'التطبيق يتعامل مع بيانات بطاقات دفع بطبيعته، لذلك لا يمكن نشر أي لقطة شاشة — وكل رسم هنا توضيحي.',
        ],
      },
    },
  }),

  /* ------------------------------------------------------------------ */
  project({
    slug: 'fuel-card-extractor',
    repo: 'QNB_Fuel_Extractor',
    category: 'financial',
    maturity: 'prototype',
    featured: false,
    accent: 'blue',
    sensitiveData: true,
    reviewedOn: '2026-10-15',
    technologies: ['Chrome Manifest V3', 'JavaScript', 'Chrome Storage API', 'Excel export'],
    text: {
      en: {
        name: 'Fuel-Card Transaction Extractor',
        summary:
          'A browser extension that extracts fuel-card balances, pending transactions and posted transactions from a bank portal and produces a formatted multi-sheet workbook.',
        problem:
          'Fleet fuel cards are managed through bank portals that offer no bulk export. Reconciling a month of fuel spending means reading balances card by card and transcribing transactions into a spreadsheet, which is slow and introduces transcription errors into financial records. The portal also limits how far back the date picker will go, which makes historical reporting harder still.',
        solution:
          'An extension that works inside the portal session, reads the three data types the portal exposes — online balance per card, authorised-but-not-posted transactions, and posted transactions — and generates a multi-sheet Excel workbook with the sorting and styling finance teams expect. Extraction is anchored to a date range and reports progress as it runs.',
        verifiedFeatures: [
          'Custom date-range selection for extraction',
          'Online balance per card',
          'Pending, authorised-but-not-posted transactions',
          'Posted transactions with automatic sorting by card, then transaction type, then date',
          'Multi-sheet Excel export with applied formatting and styling',
          'Date-picker range limit override for historical periods',
          'Real-time progress indication with run statistics',
          'Local-only processing: no transaction data is transmitted to an external server',
        ],
        limitations: [
          'This is a prototype rather than a finished product. The repository contains a subscription and licensing layer — trial period, licence keys and payment-gateway integration — but the payment backend is not included in the repository and could not be verified as working, so nothing commercial is offered for it here.',
          'No published release and no packaged download.',
          'No automated test suite and no CI workflow.',
          'No licence file is published.',
          'It targets a single bank portal, and the supporting documentation contains a placeholder contact address rather than a real one.',
          'The current development state is transactional, not an ongoing maintenance commitment.',
          'It handles real fuel-card and balance data, so no screenshot can be published — every visual here is an illustration.',
        ],
      },
      ar: {
        name: 'أداة استخراج معاملات بطاقات الوقود',
        summary:
          'إضافة متصفح تستخرج أرصدة بطاقات الوقود والمعاملات المعلّقة والمرحَّلة من بوابة بنكية، وتُنتج ملف Excel منسَّقًا متعدّد الأوراق.',
        problem:
          'تُدار بطاقات الوقود الخاصة بالأسطول عبر بوابات بنكية لا توفّر تصديرًا مجمَّعًا. ولذلك تعني مطابقة مصروفات شهر من الوقود قراءة الأرصدة بطاقةً بطاقة ونقل المعاملات يدويًا إلى جدول بيانات، وهو أمر بطيء ويُدخل أخطاء نقل في السجلات المالية. كما تقيّد البوابة المدى الذي يسمح به محدِّد التاريخ، ما يزيد صعوبة التقارير التاريخية.',
        solution:
          'إضافة تعمل داخل جلسة البوابة، وتقرأ أنواع البيانات الثلاثة التي تُتيحها البوابة — الرصيد الحالي لكل بطاقة، والمعاملات المُصرَّح بها وغير المرحَّلة، والمعاملات المرحَّلة — ثم تُنشئ ملف Excel متعدّد الأوراق بالترتيب والتنسيق الذي تتوقّعه فرق المالية. ويستند الاستخراج إلى نطاق زمني، ويُظهر تقدّم التنفيذ أثناء العمل.',
        verifiedFeatures: [
          'اختيار نطاق زمني مخصَّص للاستخراج',
          'الرصيد الحالي لكل بطاقة',
          'المعاملات المعلّقة المُصرَّح بها وغير المرحَّلة',
          'المعاملات المرحَّلة مع ترتيب تلقائي حسب البطاقة ثم نوع المعاملة ثم التاريخ',
          'تصدير Excel متعدّد الأوراق بتنسيق وتصميم مطبَّقين',
          'تجاوز حدّ محدِّد التاريخ لاستخراج فترات تاريخية',
          'إظهار تقدّم التنفيذ لحظيًا مع إحصاءات التشغيل',
          'معالجة محلية بالكامل: لا تُرسَل أي بيانات معاملات إلى خادم خارجي',
        ],
        limitations: [
          'هذا نموذج أولي وليس منتجًا مكتملًا. يحتوي المستودع على طبقة اشتراكات وتراخيص — فترة تجريبية ومفاتيح ترخيص وتكامل بوابة دفع — لكن الخادم الخلفي للمدفوعات غير مُضمَّن في المستودع ولم يمكن التحقق من عمله، لذلك لا نعرض هنا أي عرض تجاري خاص به.',
          'لا يوجد إصدار منشور ولا نسخة قابلة للتنزيل.',
          'لا توجد مجموعة اختبارات آلية ولا سير عمل CI.',
          'لا يوجد ملف ترخيص منشور.',
          'الأداة تستهدف بوابة بنك واحد، والتوثيق المرافق يحتوي على عنوان تواصل مؤقّت لا عنوان حقيقي.',
          'حالة التطوير الحالية تجريبية، وليست التزامًا بصيانة مستمرة.',
          'الأداة تتعامل مع بيانات بطاقات وقود وأرصدة حقيقية، لذلك لا يمكن نشر أي لقطة شاشة — وكل رسم هنا توضيحي.',
        ],
      },
    },
  }),

  /* ------------------------------------------------------------------ */
  project({
    slug: 'windows-iso-build',
    repo: 'WinISOBuild',
    category: 'windows',
    maturity: 'active',
    featured: false,
    accent: 'blue',
    sensitiveData: false,
    reviewedOn: '2026-10-15',
    technologies: ['PowerShell', 'DISM', 'Windows ADK', 'WinForms', 'Microsoft Update Catalog'],
    text: {
      en: {
        name: 'Windows ISO Build Toolchain',
        summary:
          'A PowerShell toolchain that services Windows 10 and 11 installation media: finds the updates a build is actually missing, integrates them offline, injects drivers and rebuilds a bootable ISO.',
        problem:
          'Keeping a standardised Windows image current is tedious and easy to get wrong. After each Patch Tuesday somebody has to work out which cumulative update, servicing-stack update and .NET update applies to which build, download them, mount the image, apply them in the right order, add drivers, and rebuild install media. Doing it by hand means either stale images or occasionally broken ones, and nothing is reproducible.',
        solution:
          'A restartable state machine that detects the target build from the ISO itself rather than assuming it, queries the public Microsoft Update Catalog for candidates, classifies each one as missed or already present, and reports only what is genuinely needed. Integration and driver injection happen through Microsoft’s own supported servicing commands against a copy of the source media, so the original ISO is never modified and a failed run can be diagnosed and resumed.',
        verifiedFeatures: [
          'Ten-phase orchestrator that is restartable through a persisted state file',
          'Target build detection read from the ISO rather than assumed',
          'Update discovery against the public Microsoft Update Catalog with missed-versus-present classification',
          'Explicit download step — nothing is downloaded implicitly during servicing',
          'Offline integration of cumulative, servicing-stack and .NET updates into the install image',
          'Driver injection into the install image',
          'Unattend and out-of-box-experience configuration generation',
          'Bootable ISO rebuild with versioned output naming',
          'WinForms front-end that streams the run log and confirms before any mutating phase',
          'A headless self-test mode for validating the wiring',
          'Reports directory containing a real run’s environment audit, ISO inventory and update manifest',
        ],
        limitations: [
          'It requires an elevated PowerShell session, the Windows ADK Deployment Tools and roughly 40 GB of free disk space, so it is a specialist tool rather than something a casual user can run.',
          'No downloadable build: all twelve published releases carry no attached files, so the repository is the only entry point.',
          'No automated test suite and no CI workflow.',
          'No licence file is published.',
          'Servicing behaviour depends on Microsoft’s update catalogue and on DISM, both of which change over time.',
        ],
      },
      ar: {
        name: 'أدوات بناء صور Windows',
        summary:
          'مجموعة أدوات بـ PowerShell لصيانة وسائط تثبيت Windows 10 و11: تحديد التحديثات الناقصة فعلًا، ودمجها دون اتصال، وحقن التعريفات، وإعادة بناء ملف ISO قابل للإقلاع.',
        problem:
          'إبقاء صورة Windows قياسية محدَّثة عمل شاق وعُرضة للخطأ. فبعد كل دورة تحديثات يجب على أحدهم تحديد أي تحديث تراكمي وأي تحديث لحزمة الخدمة وأي تحديث لـ .NET ينطبق على أي بناء، ثم تنزيلها وتركيب الصورة وتطبيقها بالترتيب الصحيح وإضافة التعريفات وإعادة بناء وسائط التثبيت. وإنجاز ذلك يدويًا يعني إما صورًا قديمة أو صورًا معطوبة أحيانًا، دون أي قابلية لإعادة الإنتاج.',
        solution:
          'آلة حالة قابلة للاستئناف تكتشف بناء الهدف من ملف ISO نفسه بدل افتراضه، ثم تستعلم من كتالوج تحديثات Microsoft العام عن المرشّحات، وتُصنّف كل واحد منها كناقص أو موجود مسبقًا، ولا تُبلغ إلا بما هو مطلوب فعلًا. ويتم الدمج وحقن التعريفات عبر أوامر الصيانة المدعومة من Microsoft نفسها على نسخة من الوسائط الأصلية، فلا يتغيّر ملف ISO الأصلي أبدًا، ويمكن تشخيص أي تشغيل فاشل واستئنافه.',
        verifiedFeatures: [
          'منظِّم من عشر مراحل قابل للاستئناف عبر ملف حالة محفوظ',
          'كشف بناء الهدف بالقراءة من ملف ISO بدل افتراضه',
          'اكتشاف التحديثات من كتالوج تحديثات Microsoft العام مع تصنيف الناقص من الموجود مسبقًا',
          'خطوة تنزيل صريحة — لا يُنزَّل أي شيء ضمنيًا أثناء الصيانة',
          'دمج التحديثات التراكمية وتحديثات حزمة الخدمة و .NET دون اتصال في صورة التثبيت',
          'حقن التعريفات في صورة التثبيت',
          'توليد ملفات الإعداد التلقائي وتجربة الاستخدام الأولى',
          'إعادة بناء ملف ISO قابل للإقلاع مع تسمية المخرجات برقم البناء',
          'واجهة WinForms تبثّ سجل التشغيل وتطلب التأكيد قبل أي مرحلة مُعدِّلة',
          'وضع اختبار ذاتي بلا واجهة للتحقق من ترابط المراحل',
          'مجلد تقارير يضم تدقيق بيئة تشغيل حقيقي وجرد ملف ISO وبيان التحديثات',
        ],
        limitations: [
          'يتطلّب جلسة PowerShell بصلاحيات مرتفعة وأدوات النشر من Windows ADK ونحو 40 غيغابايت من المساحة الحرة، لذا فهو أداة متخصّصة لا يستطيع المستخدم العادي تشغيلها.',
          'لا توجد نسخة قابلة للتنزيل: الإصدارات الاثنا عشر المنشورة كلها بلا ملفات مرفقة، فالمستودع هو المدخل الوحيد.',
          'لا توجد مجموعة اختبارات آلية ولا سير عمل CI.',
          'لا يوجد ملف ترخيص منشور.',
          'تعتمد سلوكيات الصيانة على كتالوج تحديثات Microsoft وأداة DISM، وكلاهما يتغيّر بمرور الوقت.',
        ],
      },
    },
  }),

  /* ------------------------------------------------------------------ */
  project({
    slug: 'windows-deployment',
    repo: 'PostWindowsAppDeploy',
    category: 'windows',
    maturity: 'active',
    featured: false,
    accent: 'cyan',
    sensitiveData: false,
    reviewedOn: '2026-10-15',
    technologies: ['PowerShell', 'SHA-256 verification', 'Windows installer exit codes'],
    text: {
      en: {
        name: 'Windows Workstation Deployment',
        summary:
          'A PowerShell deployment tool that downloads current install packages from official vendor sources, verifies each one against a checksum manifest, and deploys them unattended with a per-run report.',
        problem:
          'Preparing a workstation consistently means installing and updating a long list of prerequisites. Doing it by hand invites drift between machines, and downloading installers from the first search result is a genuine supply-chain risk. When something goes wrong, there is usually no record of what ran or which version was installed.',
        solution:
          'A deployment engine in which every package comes from the vendor’s own page or official release, and every downloaded file is verified against a SHA-256 manifest before execution. Installers run with their documented silent switches, the standard Windows installer exit codes are interpreted so that “reboot required” is distinguished from failure, and each run writes a timestamped CSV report.',
        verifiedFeatures: [
          'Downloads taken only from official vendor pages and official releases — no third-party mirrors',
          'SHA-256 checksum verification of every downloaded file against a manifest',
          'Driver refresh that probes official hardware-vendor portals and records hashes',
          'Confirmation required before the driver step continues',
          'Interactive selection of a single package or a comma-separated list',
          'Documented silent installation arguments per package',
          'Standard Windows installer exit-code handling, distinguishing success, reboot-required and reboot-initiated',
          'Timestamped CSV deployment report per run',
          'Skip-already-installed detection',
        ],
        limitations: [
          'The repository bundles third-party application and endpoint-protection installers for its own deployment use. Redistribution rights for those binaries were not verified, so they are deliberately not offered for download from this site.',
          'No versioned release and no published build.',
          'No automated test suite and no CI workflow.',
          'No licence file is published.',
          'Automating third-party software installation is inherently supply-chain sensitive; checksum verification is the control, and it depends on the manifest being maintained correctly.',
        ],
      },
      ar: {
        name: 'تجهيز أجهزة Windows',
        summary:
          'أداة نشر بـ PowerShell تنزّل حزم التثبيت الحالية من مصادر المورّدين الرسمية، وتتحقق من كل ملف مقابل بيان بصمات، وتنشره دون تدخّل مع تقرير لكل عملية.',
        problem:
          'تجهيز جهاز عمل بشكل موحَّد يعني تثبيت قائمة طويلة من المتطلبات وتحديثها. وإنجاز ذلك يدويًا يُؤدي إلى تباين بين الأجهزة، أما تنزيل برامج التثبيت من أول نتيجة بحث فهو خطر حقيقي على سلسلة التوريد. وحين يحدث خطأ لا يوجد عادةً سجل لما نُفِّذ أو أي إصدار ثُبِّت.',
        solution:
          'محرِّك نشر تصل فيه كل حزمة من صفحة المورّد نفسه أو من إصدار رسمي، ويُتحقق من كل ملف منزَّل مقابل بيان بصمات SHA-256 قبل تشغيله. وتُشغَّل برامج التثبيت بمفاتيح الصمت الموثَّقة الخاصة بها، وتُقرأ رموز الخروج القياسية لمثبِّتات Windows بحيث يُفرَّق بين «يلزم إعادة التشغيل» والفشل، وتكتب كل عملية تقريرًا بصيغة CSV يحمل طابعها الزمني.',
        verifiedFeatures: [
          'تنزيلات من صفحات المورّدين الرسمية والإصدارات الرسمية فقط — دون أي مرايا من أطراف ثالثة',
          'التحقق من بصمة SHA-256 لكل ملف منزَّل مقابل بيان معتمد',
          'تحديث التعريفات بالاستعلام من بوابات الشركات المصنّعة الرسمية مع تسجيل البصمات',
          'طلب تأكيد قبل متابعة خطوة التعريفات',
          'اختيار تفاعلي لحزمة واحدة أو قائمة مفصولة بفواصل',
          'وسائط تثبيت صامتة موثَّقة لكل حزمة',
          'التعامل مع رموز الخروج القياسية لمثبِّتات Windows والتفريق بين النجاح والحاجة لإعادة التشغيل وبدئها',
          'تقرير نشر بصيغة CSV يحمل طابعًا زمنيًا لكل عملية',
          'كشف الحزم المثبَّتة مسبقًا وتجاوزها',
        ],
        limitations: [
          'يتضمن المستودع برامج تثبيت لتطبيقات وحماية أجهزة من أطراف ثالثة لأغراض نشره الخاصة. ولم يتم التحقق من حقوق إعادة توزيع تلك الملفات، لذلك لا نعرضها للتنزيل من هذا الموقع عن قصد.',
          'لا يوجد إصدار مرقَّم ولا نسخة منشورة.',
          'لا توجد مجموعة اختبارات آلية ولا سير عمل CI.',
          'لا يوجد ملف ترخيص منشور.',
          'أتمتة تثبيت برمجيات الأطراف الثالثة حسّاسة بطبيعتها من ناحية سلسلة التوريد؛ والتحقق من البصمات هو ضابط الأمان، وهو يعتمد على صيانة البيان بشكل صحيح.',
        ],
      },
    },
  }),

  /* ------------------------------------------------------------------ */
  project({
    slug: 'smart-media-downloader',
    repo: 'smart-media-downloader',
    category: 'extensions',
    maturity: 'released',
    featured: false,
    accent: 'emerald',
    sensitiveData: false,
    reviewedOn: '2026-10-15',
    releaseUrl: `${REPO}/smart-media-downloader/releases/latest`,
    documentationUrl: `${REPO}/smart-media-downloader/blob/main/ARCHITECTURE.md`,
    technologies: [
      'Chrome Manifest V3',
      'TypeScript',
      'React',
      'Tailwind CSS',
      'Vite',
      'IndexedDB',
      'Vitest',
    ],
    text: {
      en: {
        name: 'Smart Media Downloader',
        summary:
          'A Chrome extension with a multi-connection download engine, a persistent queue and subtitle support, built to work only where downloading is genuinely authorised and to refuse everything else explicitly.',
        problem:
          'Browser downloads of large media files are slow and fragile: a single connection, no resume when the browser closes, and a failed download that starts over from zero. Most downloader extensions solve this by offering to grab whatever is behind a protected player, which is both legally dubious and unreliable, and which frequently breaks when the platform changes.',
        solution:
          'A downloader that splits a file into byte ranges and fetches them concurrently, with a queue persisted in IndexedDB so downloads survive closing the popup and can resume after a browser restart. The compliance boundary is drawn in code rather than in documentation: protected media is refused at the engine level, the popup never shows controls for it, and host access is requested per-origin only when the user actually starts a download.',
        verifiedFeatures: [
          'Multi-connection download engine with selectable concurrency, defaulting to eight connections',
          'Range support probing with automatic single-stream fallback when a server does not support ranges',
          'Failed-chunk retry with exponential backoff',
          'Download queue with pause, resume, cancel, retry, remove and reorder',
          'Queue persisted in IndexedDB, continuing while the popup is closed and resuming after a browser restart',
          'Per-connection progress display alongside overall percentage, speed and estimated time remaining',
          'Subtitle management with multi-language selection and local WebVTT-to-SRT conversion',
          'Quality table showing only legitimately available variants',
          'Deliberate refusal of DRM-protected and encrypted streams, detected through use of the Encrypted Media Extensions API',
          'Deliberate refusal of segmented players that expose no downloadable file, with an explanation shown instead',
          'Internet Archive support through the archive’s documented public metadata API and official download endpoints, with lending-restricted items refused',
          'Per-origin optional host permissions requested only on user action',
          'URL validation rejecting non-HTTP schemes, embedded credentials and private-network targets',
          'Automated test suites covering the engine logic, the archive adapter, subtitle conversion and URL validation',
        ],
        limitations: [
          'Multi-connection mode needs the server to advertise byte-range support; otherwise it silently falls back to a single stream.',
          'Quality variants beyond the original file exist only where a source adapter exposes them — no transmuxing or transcoding is performed.',
          'Partial chunk progress is not persisted, so a paused chunk restarts from its beginning rather than from its last byte.',
          'It cannot download from streaming players or protected media by design. That is a deliberate restriction, not a gap to be closed later.',
          'No licence file is published.',
          'No CI workflow, and one of its documented test counts is out of date relative to the current test files.',
        ],
      },
      ar: {
        name: 'Smart Media Downloader',
        summary:
          'إضافة Chrome تضم محرِّك تنزيل متعدِّد الاتصالات وقائمة انتظار دائمة ودعمًا للترجمات، مبنية لتعمل فقط حيث يكون التنزيل مُصرَّحًا به فعلًا، وترفض كل ما عدا ذلك صراحةً.',
        problem:
          'تنزيل ملفات الوسائط الكبيرة من المتصفح بطيء وهشّ: اتصال واحد، ولا استئناف عند إغلاق المتصفح، وتنزيل فاشل يبدأ من الصفر. وتحلّ معظم إضافات التنزيل ذلك بعرض التقاط أي محتوى خلف مشغّل محمي، وهو أمر مشكوك في قانونيته وغير موثوق، وغالبًا ما يتعطّل عند تغيّر المنصة.',
        solution:
          'أداة تنزيل تقسّم الملف إلى نطاقات بايتات وتجلبها بالتوازي، مع قائمة انتظار محفوظة في IndexedDB بحيث تنجو التنزيلات من إغلاق النافذة ويمكن استئنافها بعد إعادة تشغيل المتصفح. وحُدود الالتزام مرسومة في الشيفرة لا في التوثيق: فالوسائط المحمية تُرفض على مستوى المحرِّك، ولا تُظهر النافذة أي أدوات تحكم لها، ولا يُطلب الوصول إلى أي نطاق إلا عند بدء المستخدم تنزيلًا فعلًا.',
        verifiedFeatures: [
          'محرِّك تنزيل متعدِّد الاتصالات بعدد اتصالات قابل للاختيار، والافتراضي ثمانية',
          'فحص دعم النطاقات مع تراجع تلقائي إلى مسار واحد حين لا يدعم الخادم النطاقات',
          'إعادة محاولة الكتل الفاشلة بتراجع أسّي',
          'قائمة انتظار تدعم الإيقاف المؤقت والاستئناف والإلغاء وإعادة المحاولة والحذف وإعادة الترتيب',
          'قائمة الانتظار محفوظة في IndexedDB، وتستمر بعد إغلاق النافذة وتُستأنف بعد إعادة تشغيل المتصفح',
          'عرض تقدّم لكل اتصال إلى جانب النسبة الكلية والسرعة والوقت المتبقي المقدَّر',
          'إدارة الترجمات مع اختيار لغات متعددة وتحويل محلي من WebVTT إلى SRT',
          'جدول جودات يعرض فقط النسخ المتاحة بصورة مشروعة',
          'رفض متعمَّد للبث المحمي بـ DRM والمشفَّر، يُكتشف عبر استخدام واجهة Encrypted Media Extensions',
          'رفض متعمَّد للمشغّلات المقسَّمة التي لا تُظهر ملفًا قابلًا للتنزيل، مع عرض شرح بدل التنزيل',
          'دعم Internet Archive عبر واجهة البيانات الوصفية العامة الموثَّقة ونقاط التنزيل الرسمية، مع رفض العناصر المقيَّدة بالإعارة',
          'صلاحيات وصول اختيارية لكل نطاق على حدة، تُطلب عند إجراء المستخدم فقط',
          'تحقق من الروابط يرفض البروتوكولات غير HTTP وبيانات الاعتماد المضمَّنة والأهداف على الشبكات الخاصة',
          'مجموعات اختبارات آلية تغطي منطق المحرِّك ومحوِّل الأرشيف وتحويل الترجمات والتحقق من الروابط',
        ],
        limitations: [
          'يحتاج الوضع متعدِّد الاتصالات أن يُعلن الخادم عن دعم نطاقات البايتات؛ وإلا تراجع تلقائيًا إلى مسار واحد.',
          'لا توجد نسخ جودة تتجاوز الملف الأصلي إلا حيث يعرضها محوِّل مصدر — فلا يُجرى أي تحويل أو تغيير للحاوية.',
          'لا يُحتفظ بتقدّم الكتل الجزئية، لذا تبدأ الكتلة المتوقفة من بدايتها لا من آخر بايت وصل.',
          'لا يمكنه التنزيل من المشغّلات المقسَّمة أو الوسائط المحمية بحكم التصميم. وهذا قيد متعمَّد لا ثغرة تُغلق لاحقًا.',
          'لا يوجد ملف ترخيص منشور.',
          'لا يوجد سير عمل CI، وأحد أعداد الاختبارات الموثَّقة قديم مقارنة بملفات الاختبار الحالية.',
        ],
      },
    },
  }),

  /* ------------------------------------------------------------------ */
  project({
    slug: 'ai-insights-automation',
    repo: 'ai-automation-daily-insights',
    category: 'workflow',
    maturity: 'active',
    featured: false,
    accent: 'violet',
    sensitiveData: false,
    reviewedOn: '2026-10-15',
    technologies: ['n8n', 'OpenRouter', 'Gmail API', 'GitHub Actions', 'PowerShell'],
    text: {
      en: {
        name: 'Scheduled Research Automation',
        summary:
          'An n8n automation that researches a defined topic on a schedule, composes a briefing and delivers it by email — a worked example of replacing a recurring manual task.',
        problem:
          'Keeping up with a fast-moving technical field means somebody reads through sources and summarises them, repeatedly, at a fixed time every day. It is low-value work that competes directly with actual work, and it stops entirely when the person is away.',
        solution:
          'A scheduled n8n workflow that runs research through a model API, composes the briefing, and delivers it through a mail integration on a daily trigger. Credentials are held in the automation platform’s own credential store rather than in the repository, and the repository ships both a manual-trigger version for testing and a production scheduled version, alongside validation that runs on every push.',
        verifiedFeatures: [
          'Scheduled daily execution plus a separate manual-trigger workflow for testing',
          'Research performed through a model API integration',
          'Briefing composition and email delivery through a mail integration',
          'Credentials held in the platform credential store rather than committed to the repository',
          'Version-control sync scripts for Windows and Unix-like systems',
          'Continuous integration that validates workflow JSON, verifies repository structure and scans for accidentally committed credentials',
          'A reusable internal library of documented n8n patterns covering JavaScript and Python nodes, expression syntax, node configuration, validation and workflow architecture',
          'Planning documents for workflow design',
        ],
        limitations: [
          'Nothing runs on its own: it requires a hosted or self-hosted n8n instance plus credentials for the model API and the mail account. It is an automation design, not a service anyone can sign up to.',
          'No released version and no packaged download — the workflows are imported into an existing n8n instance.',
          'No automated test suite; validation is limited to JSON syntax and structural checks.',
          'The repository describes itself as open source, but no licence file is published, so it is not licensed for reuse. This site therefore does not describe it as open source.',
          'The subject matter it researches ages quickly, which makes it more useful as a demonstration of automation capability than as a product.',
        ],
      },
      ar: {
        name: 'أتمتة بحث مجدولة',
        summary:
          'أتمتة على n8n تبحث في موضوع محدَّد وفق جدول زمني، وتُعد ملخّصًا وتُرسله بالبريد — مثال عملي على الاستعاضة عن مهمة يدوية متكررة.',
        problem:
          'متابعة مجال تقني سريع التغيّر تعني أن يقرأ أحدهم المصادر ويلخّصها، بشكل متكرر، في وقت محدَّد كل يوم. وهو عمل منخفض القيمة يزاحم العمل الحقيقي مباشرةً، ويتوقف تمامًا عند غياب الشخص.',
        solution:
          'سير عمل مجدول على n8n يجري البحث عبر واجهة API لنموذج، ويُعد الملخّص، ويُسلّمه عبر تكامل بريد ينطلق يوميًا. وتُحفظ بيانات الاعتماد في مخزن الاعتمادات الخاص بمنصة الأتمتة لا في المستودع، ويضم المستودع نسخة تشغيل يدوي للاختبار ونسخة إنتاجية مجدولة، إلى جانب فحص يُنفَّذ عند كل رفع.',
        verifiedFeatures: [
          'تنفيذ يومي مجدول مع سير عمل منفصل بتشغيل يدوي للاختبار',
          'البحث يُجرى عبر تكامل مع واجهة API لنموذج',
          'إعداد الملخّص وتسليمه بالبريد عبر تكامل بريدي',
          'بيانات الاعتماد محفوظة في مخزن اعتمادات المنصة لا في المستودع',
          'سكربتات مزامنة للتحكم بالإصدارات على Windows وأنظمة شبيهة بـ Unix',
          'تكامل مستمر يتحقق من صحة JSON لسير العمل وبنية المستودع ويبحث عن بيانات اعتماد رُفعت بالخطأ',
          'مكتبة داخلية قابلة لإعادة الاستخدام من أنماط n8n الموثَّقة تغطي عُقد JavaScript و Python وصياغة التعابير وإعداد العُقد والتحقق وهندسة سير العمل',
          'مستندات تخطيط لتصميم سير العمل',
        ],
        limitations: [
          'لا شيء يعمل من تلقاء نفسه: فهو يحتاج نسخة n8n مستضافة أو ذاتية الاستضافة مع بيانات اعتماد لواجهة النموذج ولحساب البريد. إنه تصميم أتمتة لا خدمة يمكن التسجيل فيها.',
          'لا يوجد إصدار منشور ولا نسخة قابلة للتنزيل — تُستورد سير العمل إلى نسخة n8n قائمة.',
          'لا توجد مجموعة اختبارات آلية؛ والفحص يقتصر على صحة JSON والتحقق البنيوي.',
          'يصف المستودع نفسه بأنه مفتوح المصدر، لكن لا يوجد ملف ترخيص منشور، لذا فهو غير مرخَّص لإعادة الاستخدام. ولذلك لا يصفه هذا الموقع بأنه مفتوح المصدر.',
          'الموضوع الذي يبحث فيه يتقادم سريعًا، ما يجعله أنفع كعرض لقدرة الأتمتة من كونه منتجًا.',
        ],
      },
    },
  }),

  /* ------------------------------------------------------------------ */
  project({
    slug: 'desktop-media-download-manager',
    repo: 'YouTube-Downloader',
    category: 'desktop',
    maturity: 'active',
    featured: false,
    accent: 'rose',
    sensitiveData: false,
    reviewedOn: '2026-10-15',
    technologies: ['Python 3.12', 'PySide6', 'yt-dlp', 'ffmpeg', 'asyncio', 'SQLite', 'pytest'],
    text: {
      en: {
        name: 'Desktop Download Manager',
        summary:
          'A Python desktop download manager with parallel chunked transfers, integrity verification, a persistent queue and subtitle handling.',
        problem:
          'Long downloads over an unreliable connection fail and restart from the beginning. Downloading a playlist means babysitting the queue, and losing a partially completed transfer when the application closes. Managing quality, audio format and subtitles across many items turns into a slow manual process.',
        solution:
          'A desktop application built on an asynchronous transfer engine that splits files into chunks, verifies integrity by hash, and persists every chunk’s state to a database so an interrupted download can be resumed after a crash. The interface surfaces queue control, per-item progress through each conversion phase, and bulk format and subtitle selection.',
        verifiedFeatures: [
          'Parallel chunked downloads with a selectable number of chunks',
          'SHA-1 integrity verification of completed transfers',
          'Resume of interrupted downloads with per-chunk state persisted in a database',
          'Automatic retry with exponential backoff and reconnection after network loss',
          'Bandwidth limiting and proxy support for HTTP, HTTPS and SOCKS',
          'Playlist handling with search, sort and subset selection',
          'Format table showing resolution, frame rate, codec, dynamic-range type and estimated size',
          'Audio format and bitrate selection',
          'Subtitle download in multiple languages including Arabic, with embedded, SRT, VTT and ASS output',
          'Per-item progress through distinct processing phases with a global queue progress display',
          'Queue actions including pause, resume, cancel, retry-all, clear-completed and reordering',
          'Metadata and thumbnail embedding, plus optional loudness normalisation',
          'Filename templating with live preview, path-traversal protection and Windows reserved-name handling',
          'Automated test suites and a continuous-integration workflow that builds the Windows executable',
        ],
        limitations: [
          'No downloadable build: the single published release has no attached file, and the executable must be produced by the packaging script on Windows.',
          'It depends on an external downloader library and on ffmpeg, both of which must be present and current.',
          'Its subject matter sits in a legally sensitive area and its supported option set is broader than the rest of this portfolio, which is why it is presented here as an engineering demonstration rather than as an offered service. It is not featured on the homepage.',
          'No licence file is published.',
          'No packaging pipeline beyond the Windows build workflow, and no code-signing.',
        ],
      },
      ar: {
        name: 'مدير تنزيل لسطح المكتب',
        summary:
          'مدير تنزيل لسطح المكتب بلغة Python يدعم النقل المتوازي بالكتل والتحقق من السلامة وقائمة انتظار دائمة والتعامل مع الترجمات.',
        problem:
          'التنزيلات الطويلة على اتصال غير مستقر تفشل وتبدأ من جديد. وتنزيل قائمة تشغيل يعني ملازمة قائمة الانتظار، وفقدان نقل مكتمل جزئيًا عند إغلاق التطبيق. وتزداد إدارة الجودة وصيغة الصوت والترجمات عبر عناصر كثيرة تحوّلًا إلى عملية يدوية بطيئة.',
        solution:
          'تطبيق سطح مكتب مبني على محرِّك نقل لا تزامني يقسّم الملفات إلى كتل، ويتحقق من سلامتها بالبصمة، ويحفظ حالة كل كتلة في قاعدة بيانات بحيث يمكن استئناف أي تنزيل متقطّع بعد انهيار. وتُظهر الواجهة التحكم في قائمة الانتظار وتقدّم كل عنصر عبر مراحل التحويل، إضافة إلى اختيار جماعي للصيغ والترجمات.',
        verifiedFeatures: [
          'تنزيلات متوازية بالكتل بعدد كتل قابل للاختيار',
          'التحقق من سلامة التنزيلات المكتملة ببصمة SHA-1',
          'استئناف التنزيلات المتقطّعة مع حفظ حالة كل كتلة في قاعدة بيانات',
          'إعادة محاولة تلقائية بتراجع أسّي وإعادة الاتصال بعد فقد الشبكة',
          'تحديد النطاق الترددي ودعم وسائط HTTP و HTTPS و SOCKS',
          'التعامل مع قوائم التشغيل بالبحث والترتيب واختيار مجموعة فرعية',
          'جدول صيغ يعرض الدقة ومعدل الإطارات والكودك ونوع المدى الديناميكي والحجم المقدَّر',
          'اختيار صيغة الصوت ومعدل البت',
          'تنزيل الترجمات بلغات متعددة من بينها العربية، مع إخراج مضمَّن أو بصيغ SRT و VTT و ASS',
          'تقدّم لكل عنصر عبر مراحل معالجة متميزة مع عرض تقدّم عام لقائمة الانتظار',
          'إجراءات قائمة الانتظار من إيقاف مؤقت واستئناف وإلغاء وإعادة محاولة جماعية ومسح المكتمل وإعادة الترتيب',
          'تضمين البيانات الوصفية والصورة المصغّرة، مع تطبيع اختياري لمستوى الصوت',
          'قوالب تسمية الملفات مع معاينة حيّة، وحماية من تجاوز المسارات ومعالجة أسماء Windows المحجوزة',
          'مجموعات اختبارات آلية وسير عمل تكامل مستمر يبني الملف التنفيذي لنظام Windows',
        ],
        limitations: [
          'لا توجد نسخة قابلة للتنزيل: الإصدار الوحيد المنشور بلا ملف مرفق، ويجب إنتاج الملف التنفيذي عبر سكربت التغليف على نظام Windows.',
          'يعتمد على مكتبة تنزيل خارجية وعلى ffmpeg، ويجب توفّر كل منهما بحديث.',
          'موضوعه يقع في منطقة حسّاسة قانونيًا، ومجموعة خياراته أوسع من بقية مشاريع هذا الدليل، ولذلك يُعرض هنا كعرض هندسي لا كخدمة معروضة. وهو غير مُدرَج في الصفحة الرئيسية.',
          'لا يوجد ملف ترخيص منشور.',
          'لا توجد خطوط تغليف تتجاوز سير عمل بناء Windows، ولا يوجد توقيع للشيفرة.',
        ],
      },
    },
  }),
];

/* ------------------------------------------------------------------ *
 * Derived helpers
 * ------------------------------------------------------------------ */

export const CATEGORY_ORDER: CategoryId[] = [
  'fleet',
  'financial',
  'security',
  'windows',
  'extensions',
  'mobile',
  'workflow',
  'desktop',
];

export const MATURITY_ORDER: Maturity[] = ['released', 'active', 'prototype', 'experiment'];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function featuredProjects(): Project[] {
  return projects.filter((p) => p.featured);
}

export function relatedProjects(project: Project, limit = 3): Project[] {
  return projects
    .filter((p) => p.slug !== project.slug)
    .sort((a, b) => {
      const aSame = a.category === project.category ? 0 : 1;
      const bSame = b.category === project.category ? 0 : 1;
      if (aSame !== bSame) return aSame - bSame;
      return a.slug.localeCompare(b.slug);
    })
    .slice(0, limit);
}

/** Categories that actually have at least one project, in display order. */
export function activeCategories(): CategoryId[] {
  return CATEGORY_ORDER.filter((category) => projects.some((p) => p.category === category));
}

/** Maturity levels that actually occur, in display order. */
export function activeMaturities(): Maturity[] {
  return MATURITY_ORDER.filter((maturity) => projects.some((p) => p.maturity === maturity));
}
