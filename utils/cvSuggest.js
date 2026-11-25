// Autocomplete and recommendations for the editor: a skills catalogue grouped into categories
// (like LinkedIn), clusters of related skills, a list of languages, and the dropdown options
// for employment type and education level. Everything runs in the browser, no API.

// ---------- text helpers

export const fold = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()

// ---------- employment type & education level

export const experienceTypes = [
  { id: 'full-time', en: 'Full-time', hr: 'Puno radno vrijeme' },
  { id: 'part-time', en: 'Part-time', hr: 'Nepuno radno vrijeme' },
  { id: 'internship', en: 'Internship', hr: 'Praksa' },
  { id: 'student-job', en: 'Student job', hr: 'Studentski posao' },
  { id: 'freelance', en: 'Freelance', hr: 'Freelance' },
  { id: 'contract', en: 'Contract', hr: 'Ugovor o djelu' },
  { id: 'self-employed', en: 'Self-employed', hr: 'Samozaposlen/a' },
  { id: 'apprenticeship', en: 'Apprenticeship', hr: 'Naukovanje' },
  { id: 'seasonal', en: 'Seasonal', hr: 'Sezonski posao' },
  { id: 'volunteer', en: 'Volunteer', hr: 'Volontiranje' },
  { id: 'project', en: 'Project', hr: 'Projekt' }
]

export const educationLevels = [
  { id: 'primary', en: 'Primary school', hr: 'Osnovna škola' },
  { id: 'secondary', en: 'Secondary school', hr: 'Srednja škola' },
  { id: 'gymnasium', en: 'Gymnasium (grammar school)', hr: 'Gimnazija' },
  { id: 'vocational', en: 'Vocational school', hr: 'Strukovna škola' },
  { id: 'professional', en: 'Professional study', hr: 'Stručni studij' },
  { id: 'bachelor', en: "Bachelor's degree", hr: 'Prijediplomski studij' },
  { id: 'master', en: "Master's degree", hr: 'Diplomski studij' },
  { id: 'integrated', en: 'Integrated study', hr: 'Integrirani studij' },
  { id: 'specialist', en: 'Postgraduate specialist study', hr: 'Specijalistički studij' },
  { id: 'phd', en: 'Doctorate (PhD)', hr: 'Doktorski studij' },
  { id: 'exchange', en: 'Exchange (Erasmus)', hr: 'Razmjena (Erasmus)' },
  { id: 'course', en: 'Course / training', hr: 'Tečaj / edukacija' }
]

// Employment types that don't count as "years of experience" in the generated summary.
export const SIDE_JOB_TYPES = ['internship', 'student-job', 'volunteer', 'apprenticeship', 'seasonal', 'project']
export const UNIVERSITY_LEVELS = ['professional', 'bachelor', 'master', 'integrated', 'specialist', 'phd', 'exchange']

const typeRules = [
  ['internship', /\b(intern|internship|trainee|praks|praktikant|pripravni)/],
  ['student-job', /\b(student job|studentski|student assistant|demonstrator)/],
  ['volunteer', /\b(volunt|volont)/],
  ['freelance', /\b(freelanc|honorar)/],
  ['self-employed', /\b(self-employed|samozaposl|vlasnik|founder|osnivac|co-founder|suosnivac|owner)\b/],
  ['part-time', /\b(part[- ]time|nepuno)/],
  ['apprenticeship', /\b(apprentic|naucni|naukovan)/],
  ['seasonal', /\b(seasonal|sezonsk|summer job|ljetni posao)/],
  ['contract', /\b(contract|contractor|ugovor o djelu)\b/]
]

const levelRules = [
  ['primary', /\b(osnovna skola|os |primary school|elementary)/],
  ['gymnasium', /\b(gimnazij|gymnasium|grammar school)/],
  ['vocational', /\b(strukovn|tehnicka skola|industrijsk|obrtnic|vocational|ekonomska skola|medicinska skola|hotelijersk)/],
  ['secondary', /\b(srednja|high school|secondary school|ss )/],
  ['phd', /\b(phd|ph\.d|doktor|doctorate|dr\.sc)/],
  ['specialist', /\b(specijalist|postgraduate|poslijediplomski|spec\.)/],
  ['integrated', /\b(integrirani|integrated)/],
  ['master', /\b(master|msc|m\.sc|ma |mba|magistar|magistra|mag\.|diplomski|graduate)/],
  ['professional', /\b(strucni|struc\. spec|bacc\..*inf|veleuciliste|polytechnic|college of applied)/],
  ['bachelor', /\b(bachelor|bsc|b\.sc|ba |beng|prvostupni|univ\. bacc|bacc\.|prijediplomski|preddiplomski|undergraduate)/],
  ['exchange', /\b(erasmus|exchange|razmjen)/],
  ['course', /\b(course|tecaj|bootcamp|training|edukacij|certificat|akademija)/]
]

export function inferExperienceType(item) {
  const text = ` ${fold(`${item.role} ${item.company}`)} `
  return typeRules.find(([, re]) => re.test(text))?.[0] || ''
}

export function inferEducationLevel(item) {
  const text = ` ${fold(`${item.degree} ${item.school}`)} `
  return levelRules.find(([, re]) => re.test(text))?.[0] || ''
}

export const optionLabel = (list, id, lang) => {
  const o = list.find((x) => x.id === id)
  return o ? o[lang] || o.en : ''
}

// ---------- languages

// [English, Croatian, ...aliases]
const languageRows = [
  ['English', 'Engleski', 'eng', 'en', 'anglais', 'englisch'],
  ['German', 'Njemački', 'deutsch', 'ger', 'de', 'nemacki'],
  ['Italian', 'Talijanski', 'italiano', 'ita', 'it'],
  ['French', 'Francuski', 'français', 'francais', 'fr'],
  ['Spanish', 'Španjolski', 'español', 'espanol', 'castellano', 'es'],
  ['Croatian', 'Hrvatski', 'hrvatski', 'hr', 'cro'],
  ['Serbian', 'Srpski', 'srpski', 'sr'],
  ['Bosnian', 'Bosanski', 'bs'],
  ['Montenegrin', 'Crnogorski'],
  ['Slovenian', 'Slovenski', 'slovene', 'slovenščina', 'sl'],
  ['Macedonian', 'Makedonski', 'mk'],
  ['Bulgarian', 'Bugarski', 'bg'],
  ['Albanian', 'Albanski', 'shqip', 'sq'],
  ['Hungarian', 'Mađarski', 'magyar', 'hu'],
  ['Czech', 'Češki', 'čeština', 'cz', 'cs'],
  ['Slovak', 'Slovački', 'sk'],
  ['Polish', 'Poljski', 'polski', 'pl'],
  ['Russian', 'Ruski', 'ru'],
  ['Ukrainian', 'Ukrajinski', 'uk', 'ua'],
  ['Romanian', 'Rumunjski', 'română', 'ro'],
  ['Portuguese', 'Portugalski', 'português', 'pt'],
  ['Dutch', 'Nizozemski', 'nederlands', 'holland', 'flemish', 'nl'],
  ['Swedish', 'Švedski', 'svenska', 'sv'],
  ['Norwegian', 'Norveški', 'norsk', 'no'],
  ['Danish', 'Danski', 'dansk', 'da'],
  ['Finnish', 'Finski', 'suomi', 'fi'],
  ['Icelandic', 'Islandski', 'is'],
  ['Estonian', 'Estonski', 'et'],
  ['Latvian', 'Latvijski', 'lv'],
  ['Lithuanian', 'Litavski', 'lt'],
  ['Greek', 'Grčki', 'el'],
  ['Turkish', 'Turski', 'türkçe', 'tr'],
  ['Arabic', 'Arapski', 'ar'],
  ['Hebrew', 'Hebrejski', 'he'],
  ['Persian', 'Perzijski', 'farsi', 'fa'],
  ['Hindi', 'Hindski', 'hi'],
  ['Urdu', 'Urdu', 'ur'],
  ['Bengali', 'Bengalski', 'bn'],
  ['Punjabi', 'Pandžapski', 'pa'],
  ['Chinese (Mandarin)', 'Kineski (mandarinski)', 'mandarin', 'chinese', 'zh'],
  ['Cantonese', 'Kantonski'],
  ['Japanese', 'Japanski', 'ja', 'jp'],
  ['Korean', 'Korejski', 'ko'],
  ['Vietnamese', 'Vijetnamski', 'vi'],
  ['Thai', 'Tajlandski', 'th'],
  ['Indonesian', 'Indonezijski', 'bahasa', 'id'],
  ['Malay', 'Malajski', 'ms'],
  ['Filipino', 'Filipinski', 'tagalog'],
  ['Swahili', 'Svahili', 'sw'],
  ['Catalan', 'Katalonski', 'català', 'ca'],
  ['Irish', 'Irski', 'gaeilge', 'ga'],
  ['Maltese', 'Malteški', 'mt'],
  ['Latin', 'Latinski', 'la'],
  ['Esperanto', 'Esperanto', 'eo'],
  ['Croatian Sign Language', 'Hrvatski znakovni jezik', 'hzj'],
  ['International Sign', 'Međunarodni znakovni jezik', 'sign language', 'znakovni']
]

export const cvLanguagesCatalogue = languageRows.map(([en, hr, ...aliases]) => ({
  en,
  hr,
  terms: [en, hr, ...aliases].map(fold)
}))

export const COMMON_LANGUAGES = ['English', 'German', 'Italian', 'Spanish', 'French', 'Croatian']

export function findLanguage(name) {
  const f = fold(name)
  return f ? cvLanguagesCatalogue.find((l) => fold(l.en) === f || fold(l.hr) === f) : null
}

// ---------- skills catalogue

// Each skill is "Name" or ["English name", "Hrvatski naziv", ...aliases].
export const cvSkillCategories = [
  {
    id: 'programming',
    name: 'Programming languages',
    skills: [
      ['JavaScript', null, 'js', 'es6'], ['TypeScript', null, 'ts'], 'Python', 'Java', 'C', ['C++', null, 'cpp'],
      ['C#', null, 'csharp', 'c sharp'], ['Go', null, 'golang'], 'Rust', 'PHP', 'Ruby', 'Kotlin', 'Swift', 'Dart', 'SQL',
      ['Bash', null, 'shell', 'shell scripting'], 'PowerShell', 'R', 'MATLAB', 'Scala', 'Assembly', 'Lua', 'Perl', 'Haskell'
    ]
  },
  {
    id: 'web',
    name: 'Web & mobile development',
    skills: [
      'HTML', 'CSS', ['Sass', null, 'scss'], 'Tailwind CSS', 'Bootstrap', ['React', null, 'react.js', 'reactjs'], 'Next.js',
      ['Vue.js', null, 'vue', 'vuejs'], ['Nuxt', null, 'nuxt.js', 'nuxtjs'], 'Angular', 'Svelte', 'jQuery',
      ['Node.js', null, 'node', 'nodejs'], ['Express.js', null, 'express'], 'NestJS', 'Django', 'Flask', 'FastAPI',
      'Spring Boot', 'ASP.NET', ['.NET', null, 'dotnet'], 'Laravel', 'Symfony', 'Ruby on Rails', 'GraphQL',
      ['REST APIs', null, 'rest', 'api', 'restful'], 'WebSockets', 'Vite', 'Webpack', 'Firebase', 'Supabase',
      'React Native', 'Flutter', 'Android', 'iOS', 'SwiftUI', 'Jetpack Compose',
      ['Responsive design', 'Responzivni dizajn'], ['Web accessibility', 'Web pristupačnost', 'a11y', 'wcag'],
      ['Progressive Web Apps', null, 'pwa'], 'WordPress', 'Shopify', 'Three.js'
    ]
  },
  {
    id: 'engineering-practices',
    name: 'Software engineering',
    skills: [
      'Git', 'GitHub', 'GitLab', ['Object-oriented programming', 'Objektno orijentirano programiranje', 'oop'],
      ['Data structures and algorithms', 'Strukture podataka i algoritmi', 'dsa'], 'Design patterns', 'Microservices',
      'System design', 'API design', 'Clean code', ['Test-driven development', null, 'tdd'], ['Unit testing', 'Jedinično testiranje'],
      ['Test automation', 'Automatizacija testiranja'], ['Manual testing', 'Ručno testiranje'], 'Jest', 'Vitest', 'Cypress',
      'Playwright', 'Selenium', 'Postman', 'Code review', 'UML', 'Software architecture'
    ]
  },
  {
    id: 'data',
    name: 'Data, AI & databases',
    skills: [
      ['PostgreSQL', null, 'postgres'], 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle Database',
      ['Microsoft SQL Server', null, 'mssql', 't-sql'], 'Elasticsearch', ['Database design', 'Dizajn baza podataka'],
      'Pandas', 'NumPy', 'scikit-learn', 'TensorFlow', 'PyTorch', ['Machine learning', 'Strojno učenje', 'ml'],
      ['Deep learning', 'Duboko učenje'], ['Natural language processing', 'Obrada prirodnog jezika', 'nlp'],
      ['Computer vision', 'Računalni vid'], ['Large language models', null, 'llm', 'llms', 'genai', 'generative ai'],
      'Prompt engineering', ['Data analysis', 'Analiza podataka'], ['Data visualization', 'Vizualizacija podataka'],
      'Power BI', 'Tableau', 'Looker Studio', 'Apache Spark', 'Apache Airflow', 'ETL', 'Data engineering',
      ['Statistics', 'Statistika'], 'Jupyter', 'Big data', 'dbt'
    ]
  },
  {
    id: 'cloud',
    name: 'Cloud & DevOps',
    skills: [
      ['AWS', null, 'amazon web services'], ['Microsoft Azure', null, 'azure'], ['Google Cloud', null, 'gcp'], 'Docker',
      ['Kubernetes', null, 'k8s'], 'Terraform', 'Ansible', 'Jenkins', 'GitHub Actions', 'GitLab CI', ['CI/CD', null, 'cicd'],
      'Linux', 'Nginx', 'Apache HTTP Server', 'Vercel', 'Serverless', 'Prometheus', 'Grafana', 'Helm',
      ['System administration', 'Administracija sustava', 'sysadmin'], 'Windows Server', 'Active Directory', 'VMware',
      'Proxmox', ['Virtualization', 'Virtualizacija'], ['Backup and recovery', 'Sigurnosne kopije']
    ]
  },
  {
    id: 'security',
    name: 'Cybersecurity & forensics',
    skills: [
      ['Network security', 'Mrežna sigurnost'], ['Penetration testing', 'Penetracijsko testiranje', 'pentest', 'pentesting'],
      ['Ethical hacking', 'Etičko hakiranje'], ['Vulnerability assessment', 'Procjena ranjivosti'],
      ['Incident response', 'Odgovor na incidente', 'ir', 'dfir'], ['Digital forensics', 'Digitalna forenzika', 'forensics', 'forenzika'],
      ['Malware analysis', 'Analiza zlonamjernog softvera'], ['Reverse engineering', 'Reverzni inženjering'],
      'Threat intelligence', 'OSINT', 'SIEM', 'Splunk', 'Wireshark', 'Nmap', 'Metasploit', 'Burp Suite', 'Kali Linux',
      'Autopsy', 'Volatility', 'FTK Imager', 'EnCase', 'Cellebrite', 'Ghidra', 'IDA Pro', 'YARA', 'Sysinternals', 'REMnux',
      ['Memory forensics', 'Forenzika memorije'], ['Mobile forensics', 'Forenzika mobilnih uređaja'],
      ['Network forensics', 'Mrežna forenzika'], ['Log analysis', 'Analiza logova'], ['Cryptography', 'Kriptografija'],
      'Firewalls', 'IDS/IPS', ['Security auditing', 'Sigurnosni audit'], 'ISO 27001', 'GDPR', 'NIST', 'OWASP Top 10',
      ['Identity and access management', null, 'iam'], 'SOC operations', 'Threat hunting'
    ]
  },
  {
    id: 'networking',
    name: 'Networking & IT support',
    skills: [
      'TCP/IP', 'Cisco IOS', 'CCNA', ['Routing and switching', 'Usmjeravanje i komutacija'], 'DNS', 'DHCP', 'VPN', 'VLANs',
      ['Network administration', 'Administracija mreža'], 'Cisco Packet Tracer', 'Wi-Fi', ['IT support', 'IT podrška'],
      ['Help desk', 'Help desk', 'helpdesk'], ['Troubleshooting', 'Otklanjanje kvarova'], ['Computer hardware', 'Računalni hardver', 'hardware'],
      'Microsoft 365 administration', 'Microsoft Intune', 'ITIL', ['Windows', null, 'windows 10', 'windows 11'], 'macOS'
    ]
  },
  {
    id: 'design',
    name: 'Design & creative',
    skills: [
      'Figma', ['Adobe Photoshop', null, 'photoshop', 'ps'], ['Adobe Illustrator', null, 'illustrator', 'ai'],
      ['Adobe InDesign', null, 'indesign'], 'Adobe XD', ['Adobe Premiere Pro', null, 'premiere'],
      ['Adobe After Effects', null, 'after effects'], 'Adobe Lightroom', 'Canva', 'Blender', 'Sketch', 'DaVinci Resolve',
      ['UI design', 'UI dizajn'], ['UX design', 'UX dizajn'], ['User research', 'Istraživanje korisnika'], 'Wireframing',
      'Prototyping', 'Design systems', ['Graphic design', 'Grafički dizajn'], ['Typography', 'Tipografija'],
      ['Branding', 'Brendiranje'], ['Video editing', 'Montaža videa'], ['Photography', 'Fotografija'],
      ['Motion design', null, 'motion graphics'], ['3D modeling', '3D modeliranje'], ['Illustration', 'Ilustracija']
    ]
  },
  {
    id: 'office',
    name: 'Office & productivity',
    skills: [
      ['Microsoft Office', 'MS Office', 'ms office', 'office'], ['Microsoft Excel', null, 'excel'], ['Microsoft Word', null, 'word'],
      ['Microsoft PowerPoint', null, 'powerpoint', 'ppt'], ['Microsoft Outlook', null, 'outlook'], 'Microsoft Teams',
      'Google Workspace', 'Google Sheets', 'Notion', 'Jira', 'Confluence', 'Trello', 'Asana', 'Slack', 'SAP', 'LaTeX',
      ['Data entry', 'Unos podataka'], ['Touch typing', 'Slijepo tipkanje'], ['Office administration', 'Uredsko poslovanje'],
      ['Scheduling', 'Planiranje rasporeda']
    ]
  },
  {
    id: 'business',
    name: 'Business & management',
    skills: [
      ['Project management', 'Upravljanje projektima', 'pm'], 'Agile', 'Scrum', 'Kanban', ['Product management', 'Upravljanje proizvodom'],
      ['Stakeholder management', 'Upravljanje dionicima'], ['Business analysis', 'Poslovna analiza'],
      ['Strategic planning', 'Strateško planiranje'], ['Team leadership', 'Vođenje tima'], ['People management', 'Upravljanje ljudima'],
      ['Operations management', 'Upravljanje operacijama'], ['Risk management', 'Upravljanje rizicima'],
      ['Process improvement', 'Unapređenje procesa'], 'Lean', 'Six Sigma', ['Change management', 'Upravljanje promjenama'],
      ['Requirements gathering', 'Prikupljanje zahtjeva'], ['Business development', 'Razvoj poslovanja'],
      ['Event planning', 'Organizacija događaja'], ['Logistics', 'Logistika'], ['Supply chain management', 'Upravljanje opskrbnim lancem'],
      ['Procurement', 'Nabava'], ['Recruiting', 'Zapošljavanje', 'recruitment', 'regrutiranje'],
      ['HR management', 'Upravljanje ljudskim potencijalima', 'human resources'], ['Onboarding', 'Uvođenje zaposlenika'],
      ['Employee relations', 'Odnosi sa zaposlenicima'], ['Interviewing', 'Vođenje razgovora za posao'], ['Quality management', 'Upravljanje kvalitetom']
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing & sales',
    skills: [
      ['Digital marketing', 'Digitalni marketing'], ['Social media marketing', 'Marketing na društvenim mrežama', 'smm'],
      ['Content marketing', 'Content marketing'], ['SEO', null, 'search engine optimization'], ['SEM', null, 'ppc'],
      'Google Ads', ['Meta Ads', null, 'facebook ads', 'instagram ads'], 'Google Analytics', ['Email marketing', 'E-mail marketing'],
      ['Copywriting', 'Copywriting'], ['Content writing', 'Pisanje sadržaja'], ['Market research', 'Istraživanje tržišta'],
      ['Brand management', 'Upravljanje brendom'], ['Public relations', 'Odnosi s javnošću', 'pr'], ['Sales', 'Prodaja'],
      ['B2B sales', 'B2B prodaja'], ['Lead generation', 'Generiranje potencijalnih kupaca'], ['CRM', null, 'crm systems'],
      'HubSpot', 'Salesforce', ['Account management', 'Upravljanje ključnim kupcima'], ['E-commerce', 'E-trgovina', 'ecommerce'],
      ['Community management', 'Upravljanje zajednicom'], ['Influencer marketing', 'Influencer marketing']
    ]
  },
  {
    id: 'finance',
    name: 'Finance & accounting',
    skills: [
      ['Accounting', 'Računovodstvo'], ['Bookkeeping', 'Knjigovodstvo'], ['Financial analysis', 'Financijska analiza'],
      ['Financial reporting', 'Financijsko izvještavanje'], ['Budgeting', 'Izrada proračuna', 'budget'], ['Forecasting', 'Planiranje i prognoziranje'],
      ['Taxation', 'Porezi', 'tax'], ['Auditing', 'Revizija', 'audit'], 'IFRS', ['Payroll', 'Obračun plaća'], ['Invoicing', 'Fakturiranje'],
      ['Accounts payable', 'Obveze prema dobavljačima'], ['Accounts receivable', 'Potraživanja od kupaca'],
      ['Financial modeling', 'Financijsko modeliranje'], ['Controlling', 'Kontroling'], ['Banking', 'Bankarstvo'],
      ['Investment analysis', 'Analiza investicija'], ['Corporate finance', 'Korporativne financije'], ['Cost accounting', 'Troškovno računovodstvo']
    ]
  },
  {
    id: 'engineering',
    name: 'Engineering & science',
    skills: [
      'AutoCAD', 'SolidWorks', 'CATIA', 'Revit', 'Simulink', ['PLC programming', 'Programiranje PLC-a', 'plc'],
      ['Embedded systems', 'Ugradbeni sustavi'], 'Arduino', 'Raspberry Pi', ['Electronics', 'Elektronika'],
      ['Circuit design', 'Projektiranje elektroničkih sklopova'], ['Mechanical design', 'Strojarsko konstruiranje'], 'CNC',
      ['3D printing', '3D ispis'], ['Technical drawing', 'Tehničko crtanje'], ['Quality control', 'Kontrola kvalitete'],
      ['Laboratory techniques', 'Laboratorijske tehnike'], 'IoT', ['Robotics', 'Robotika']
    ]
  },
  {
    id: 'service',
    name: 'Service, retail & trades',
    skills: [
      ['Customer service', 'Rad s korisnicima', 'customer support', 'korisnicka podrska'], ['Cash handling', 'Rad na blagajni', 'blagajna'],
      ['Point of sale (POS)', 'Rad s POS sustavom', 'pos'], ['Food safety (HACCP)', 'Sigurnost hrane (HACCP)', 'haccp'],
      ['Bartending', 'Rad za šankom'], ['Barista', 'Barista'], ['Cooking', 'Kuhanje'], ['Housekeeping', 'Održavanje smještaja'],
      ['Reception', 'Recepcija'], ['Tourism', 'Turizam'], ['Tour guiding', 'Turističko vođenje'], ['Retail sales', 'Maloprodaja'],
      ['Merchandising', 'Merchandising'], ['Inventory management', 'Upravljanje zalihama'], ['Warehouse operations', 'Skladišno poslovanje'],
      ['Forklift operation', 'Upravljanje viličarom'], ['Driving licence B', 'Vozačka dozvola B kategorije', 'driver', 'vozacka'],
      ['First aid', 'Prva pomoć'], ['Patient care', 'Njega pacijenata'], ['Childcare', 'Čuvanje djece'], ['Teaching', 'Podučavanje']
    ]
  },
  {
    id: 'interpersonal',
    name: 'Interpersonal skills',
    skills: [
      ['Communication', 'Komunikacijske vještine'], ['Teamwork', 'Timski rad'], ['Leadership', 'Vodstvo'],
      ['Problem solving', 'Rješavanje problema'], ['Critical thinking', 'Kritičko razmišljanje'],
      ['Analytical thinking', 'Analitičko razmišljanje'], ['Time management', 'Upravljanje vremenom'],
      ['Adaptability', 'Prilagodljivost'], ['Creativity', 'Kreativnost'], ['Attention to detail', 'Pažnja na detalje'],
      ['Organisation', 'Organizacijske vještine', 'organization'], ['Public speaking', 'Javni nastup'],
      ['Presentation skills', 'Prezentacijske vještine'], ['Negotiation', 'Pregovaranje'],
      ['Conflict resolution', 'Rješavanje konflikata'], ['Mentoring', 'Mentorstvo'], ['Emotional intelligence', 'Emocionalna inteligencija'],
      ['Empathy', 'Empatija'], ['Decision making', 'Donošenje odluka'], ['Self-motivation', 'Samomotivacija'],
      ['Working under pressure', 'Rad pod pritiskom'], ['Independent work', 'Samostalnost u radu'], ['Reliability', 'Pouzdanost'],
      ['Multitasking', 'Multitasking'], ['Written communication', 'Pisana komunikacija'], ['Active listening', 'Aktivno slušanje'],
      ['Customer focus', 'Orijentiranost na korisnika'], ['Willingness to learn', 'Spremnost na učenje']
    ]
  }
]

const skillIndex = new Map()
export const cvSkillsCatalogue = []
for (const cat of cvSkillCategories) {
  cat.items = cat.skills.map((s) => {
    const [en, hr, ...aliases] = Array.isArray(s) ? s : [s]
    const item = { en, hr: hr || en, category: cat.id, terms: [...new Set([en, hr || en, ...aliases].map(fold))] }
    skillIndex.set(fold(en), item)
    if (hr) skillIndex.set(fold(hr), item)
    cvSkillsCatalogue.push(item)
    return item
  })
}

export const findSkill = (name) => skillIndex.get(fold(name)) || null
export const skillLabel = (item, lang) => (lang === 'hr' ? item.hr : item.en)

// ---------- related-skill clusters (what tends to go together on a CV)

// keywords are matched against the job title, experience roles, degrees and schools.
const clusters = [
  ['frontend', 'frontend front-end front end web developer web dev ui developer react vue angular javascript web programer',
    'JavaScript, TypeScript, HTML, CSS, Sass, Tailwind CSS, React, Next.js, Vue.js, Nuxt, Angular, Vite, Responsive design, Web accessibility, REST APIs, Git, Figma, Jest, Cypress'],
  ['backend', 'backend back-end back end api server node.js',
    'Node.js, Express.js, NestJS, TypeScript, SQL, PostgreSQL, MongoDB, Redis, REST APIs, GraphQL, Docker, Microservices, API design, Linux, Git, Unit testing'],
  ['python', 'python django flask',
    'Python, Django, Flask, FastAPI, Pandas, NumPy, PostgreSQL, Docker, REST APIs, Jupyter, Unit testing'],
  ['java', 'java spring',
    'Java, Spring Boot, Kotlin, SQL, PostgreSQL, Microservices, Docker, Unit testing, Object-oriented programming, Design patterns'],
  ['dotnet', '.net c# asp.net csharp',
    'C#, .NET, ASP.NET, Microsoft SQL Server, Microsoft Azure, Object-oriented programming, Unit testing, Git'],
  ['php', 'php laravel wordpress symfony',
    'PHP, Laravel, Symfony, MySQL, WordPress, JavaScript, HTML, CSS, REST APIs'],
  ['mobile', 'mobile android ios flutter app developer mobilni',
    'Kotlin, Swift, Android, iOS, SwiftUI, Jetpack Compose, Flutter, Dart, React Native, Firebase, REST APIs, Git'],
  ['software', 'developer programer programmer software engineer inzenjer softvera racunarstvo informatika computer science programming softver razvoj',
    'Git, Object-oriented programming, Data structures and algorithms, Design patterns, SQL, Unit testing, Linux, Agile, Code review, Problem solving'],
  ['data-science', 'data scientist machine learning ml engineer ai engineer umjetna inteligencija artificial intelligence',
    'Python, Pandas, NumPy, scikit-learn, TensorFlow, PyTorch, Machine learning, Deep learning, Jupyter, Statistics, SQL, Data visualization, Natural language processing, Large language models'],
  ['data-analyst', 'data analyst analiticar business intelligence bi analyst reporting analitika',
    'SQL, Microsoft Excel, Power BI, Tableau, Data analysis, Data visualization, Python, Statistics, Google Analytics, Looker Studio'],
  ['data-eng', 'data engineer etl pipeline',
    'Python, SQL, Apache Spark, Apache Airflow, ETL, Data engineering, dbt, AWS, Docker, Big data'],
  ['devops', 'devops sre cloud platform engineer infrastructure infrastruktura',
    'Docker, Kubernetes, Terraform, Ansible, AWS, Microsoft Azure, Google Cloud, CI/CD, GitHub Actions, Jenkins, Linux, Bash, Prometheus, Grafana, Nginx, Helm'],
  ['sysadmin', 'sysadmin system administrator administrator sustava it administrator',
    'Linux, Windows Server, Active Directory, PowerShell, Bash, VMware, Virtualization, Microsoft 365 administration, Backup and recovery, Network administration'],
  ['networking', 'network mreza mrezni cisco ccna telekom telecom',
    'TCP/IP, Cisco IOS, CCNA, Routing and switching, DNS, DHCP, VPN, VLANs, Firewalls, Wireshark, Network administration, Linux, Cisco Packet Tracer'],
  ['itsupport', 'it support help desk helpdesk tehnicka podrska technician tehnicar servis',
    'IT support, Help desk, Troubleshooting, Computer hardware, Windows, Active Directory, Microsoft 365 administration, ITIL, Customer service, TCP/IP'],
  ['security', 'security sigurnost sigurnosti cyber kiber soc analyst pentest penetration',
    'Network security, Penetration testing, Ethical hacking, Vulnerability assessment, Incident response, SIEM, Splunk, Wireshark, Nmap, Metasploit, Burp Suite, Kali Linux, OWASP Top 10, Firewalls, IDS/IPS, Threat intelligence, Linux, Python, ISO 27001, Cryptography, Log analysis'],
  ['forensics', 'forenzika forenzicar forensic forensics dfir digital forensics istraz',
    'Digital forensics, Incident response, Memory forensics, Network forensics, Mobile forensics, Autopsy, Volatility, FTK Imager, EnCase, Cellebrite, Wireshark, Malware analysis, Log analysis, Python, Linux, REMnux, Sysinternals, YARA'],
  ['malware', 'malware reverse reverzni',
    'Malware analysis, Reverse engineering, Ghidra, IDA Pro, YARA, REMnux, Assembly, C, Python, Sysinternals, Threat intelligence'],
  ['qa', 'qa tester testiranje quality assurance test engineer',
    'Manual testing, Test automation, Selenium, Cypress, Playwright, Jest, Unit testing, Postman, Jira, Agile'],
  ['ux', 'ux ui designer product designer web designer dizajner',
    'Figma, UI design, UX design, User research, Wireframing, Prototyping, Design systems, Adobe XD, Typography, Web accessibility'],
  ['graphic', 'graphic graficki dizajner art director illustrator ilustrator',
    'Adobe Photoshop, Adobe Illustrator, Adobe InDesign, Canva, Graphic design, Typography, Branding, Illustration, Figma'],
  ['video', 'video editor montaza content creator youtuber motion videograf fotograf photographer',
    'Adobe Premiere Pro, Adobe After Effects, DaVinci Resolve, Video editing, Motion design, Photography, Adobe Lightroom, Blender'],
  ['marketing', 'marketing social media drustvene mreze content brand digital',
    'Digital marketing, Social media marketing, Content marketing, SEO, SEM, Google Ads, Meta Ads, Google Analytics, Email marketing, Copywriting, Canva, Market research, HubSpot'],
  ['sales', 'sales prodaja prodajni account manager business development komercijalist key account',
    'Sales, B2B sales, Negotiation, Lead generation, CRM, Salesforce, HubSpot, Account management, Communication, Customer service, Presentation skills'],
  ['pm', 'project manager voditelj projekta product manager scrum master team lead manager menadzer voditelj direktor',
    'Project management, Agile, Scrum, Kanban, Jira, Confluence, Stakeholder management, Risk management, Budgeting, Team leadership, Communication, Product management'],
  ['finance', 'accountant accounting racunovod financ knjigovod controller auditor revizor ekonom ekonomija economics',
    'Accounting, Bookkeeping, Financial analysis, Financial reporting, Budgeting, Forecasting, Taxation, Auditing, IFRS, Microsoft Excel, SAP, Invoicing, Accounts payable, Accounts receivable, Controlling'],
  ['hr', 'hr human resources ljudski potencijali recruiter talent zaposljavanje',
    'Recruiting, HR management, Onboarding, Payroll, Employee relations, Interviewing, Communication, Conflict resolution'],
  ['admin', 'administrat office assistant asistent tajnik tajnica receptionist referent',
    'Microsoft Office, Microsoft Excel, Microsoft Word, Microsoft Outlook, Office administration, Data entry, Scheduling, Customer service, Organisation, Google Workspace'],
  ['hospitality', 'konobar waiter waitress bartender barmen barista kuhar chef cook hotel recepcioner turizam tourism sobar ugostitelj',
    'Customer service, Food safety (HACCP), Bartending, Barista, Cooking, Cash handling, Point of sale (POS), Reception, Tourism, Teamwork, Working under pressure, Housekeeping'],
  ['retail', 'retail prodavac prodavacica blagajnik blagajnica cashier shop store trgovina',
    'Retail sales, Cash handling, Point of sale (POS), Customer service, Merchandising, Inventory management, Communication'],
  ['logistics', 'logistika logistics warehouse skladiste skladistar driver vozac dostava supply chain',
    'Logistics, Supply chain management, Inventory management, Warehouse operations, Forklift operation, Driving licence B, Procurement, SAP'],
  ['mechanical', 'mechanical strojar strojarstvo mehatronika cad konstruktor',
    'AutoCAD, SolidWorks, CATIA, Mechanical design, Technical drawing, 3D printing, CNC, MATLAB, Quality control'],
  ['electrical', 'embedded electrical elektro elektrotehnika iot firmware automatika',
    'C, C++, Embedded systems, Arduino, Raspberry Pi, Electronics, Circuit design, PLC programming, MATLAB, Simulink, IoT'],
  ['civil', 'arhitekt arhitektura civil gradevin',
    'AutoCAD, Revit, Technical drawing, 3D modeling, Project management'],
  ['healthcare', 'nurse medicinsk doctor lijecni care njegovatelj pharmacist ljekarn zdravstv',
    'Patient care, First aid, Communication, Empathy, Teamwork, Working under pressure, Attention to detail'],
  ['teaching', 'teacher ucitelj nastavnik professor profesor tutor instruktor demonstrator edukator trainer',
    'Teaching, Public speaking, Presentation skills, Mentoring, Communication, Microsoft PowerPoint, Organisation']
].map(([id, keywords, members]) => ({
  id,
  keywords: keywords.split(' ').filter((k) => k.length > 1),
  phrases: keywords.match(/[a-z.#-]+(?: [a-z.#-]+)+/g) || [],
  members: members.split(', ')
}))

// Some keywords only make sense as whole words ("hr", "ui", "qa", "api").
const keywordHits = (text, cluster) => {
  let hits = 0
  for (const k of cluster.keywords) {
    const re = k.length <= 3 ? new RegExp(`(^|[^a-z])${k.replace(/[.#+]/g, '\\$&')}([^a-z]|$)`) : null
    if (re ? re.test(text) : text.includes(k)) hits++
  }
  return hits
}

// Ranked list of skills (catalogue items) that fit what is already on the CV.
export function recommendSkills(cv, limit = 12) {
  const have = new Set(cv.skills.map(fold))
  const titleText = fold(cv.personal.title)
  const roleText = fold(cv.experience.map((e) => `${e.role} ${e.company}`).join(' | '))
  const eduText = fold(cv.education.map((e) => `${e.degree} ${e.school}`).join(' | '))
  const haveSkills = cv.skills.map(findSkill).filter(Boolean)

  const scores = new Map()
  let signal = false
  for (const c of clusters) {
    const owned = c.members.filter((m) => have.has(fold(m)) || haveSkills.some((s) => s.en === m)).length
    const score = owned * 3 + keywordHits(titleText, c) * 4 + keywordHits(roleText, c) * 2 + keywordHits(eduText, c)
    if (!score) continue
    signal = true
    c.members.forEach((m, i) => {
      // Earlier members are the more central skills of the cluster.
      scores.set(m, (scores.get(m) || 0) + score * (1 - i / (c.members.length * 2)))
    })
  }

  // Same category as the skills you have counts a little too.
  for (const s of haveSkills) {
    for (const item of cvSkillsCatalogue) if (item.category === s.category && item.category !== 'interpersonal') {
      scores.set(item.en, (scores.get(item.en) || 0) + 0.4)
    }
  }

  if (!signal) {
    ;['Communication', 'Teamwork', 'Problem solving', 'Microsoft Office', 'Time management', 'Adaptability', 'Organisation', 'Customer service']
      .forEach((m, i) => scores.set(m, (scores.get(m) || 0) + 1 - i * 0.05))
  }

  return [...scores.entries()]
    .map(([name, score]) => ({ item: findSkill(name), score }))
    .filter((x) => x.item && !have.has(fold(x.item.en)) && !have.has(fold(x.item.hr)))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item)
}

// ---------- search

function matchScore(terms, q) {
  let best = 0
  for (const t of terms) {
    if (t === q) best = Math.max(best, 100)
    else if (t.startsWith(q)) best = Math.max(best, 90 - Math.min(20, t.length - q.length))
    else if (t.split(/[\s/()+.-]+/).some((w) => w && w.startsWith(q))) best = Math.max(best, 55)
    else if (q.length >= 3 && t.includes(q)) best = Math.max(best, 30)
  }
  return best
}

// Autocomplete for the skills box. Languages are mixed in, so typing "ger" offers German for the Languages section.
export function searchSkills(query, { lang = 'en', exclude = [], languagesOnCv = [], limit = 8 } = {}) {
  const q = fold(query)
  if (!q) return []
  const skip = new Set(exclude.map(fold))
  const skills = cvSkillsCatalogue
    .map((item) => ({ item, score: matchScore(item.terms, q) }))
    .filter((x) => x.score && !skip.has(fold(x.item.en)) && !skip.has(fold(x.item.hr)))
    .sort((a, b) => b.score - a.score || a.item.en.length - b.item.en.length)
    .slice(0, limit)
    .map(({ item, score }) => ({
      kind: 'skill',
      value: skillLabel(item, lang),
      label: skillLabel(item, lang),
      hint: cvSkillCategories.find((c) => c.id === item.category).name,
      score
    }))

  const haveLang = new Set(languagesOnCv.map(fold))
  const langs =
    q.length < 2
      ? []
      : cvLanguagesCatalogue
          .map((l) => ({ l, score: matchScore(l.terms, q) }))
          .filter((x) => x.score >= 55 && !haveLang.has(fold(x.l.en)) && !haveLang.has(fold(x.l.hr)))
          .sort((a, b) => b.score - a.score)
          .slice(0, 2)
          .map(({ l, score }) => ({
            kind: 'language',
            value: lang === 'hr' ? l.hr : l.en,
            label: lang === 'hr' ? l.hr : l.en,
            hint: 'Language → adds to Languages',
            score: score + 1
          }))

  return [...langs, ...skills].sort((a, b) => b.score - a.score).slice(0, limit)
}

export function searchLanguages(query, { lang = 'en', exclude = [], limit = 7 } = {}) {
  const q = fold(query)
  const skip = new Set(exclude.map(fold))
  const pool = cvLanguagesCatalogue.filter((l) => !skip.has(fold(l.en)) && !skip.has(fold(l.hr)))
  const ranked = q
    ? pool.map((l) => ({ l, score: matchScore(l.terms, q) })).filter((x) => x.score).sort((a, b) => b.score - a.score)
    : pool.filter((l) => COMMON_LANGUAGES.includes(l.en)).map((l) => ({ l, score: 1 }))
  return ranked.slice(0, limit).map(({ l, score }) => {
    const label = lang === 'hr' ? l.hr : l.en
    const other = lang === 'hr' ? l.en : l.hr
    return { kind: 'language', value: label, label, hint: other !== label ? other : '', score }
  })
}

export const languageLevelOptions = {
  en: ['Native', 'Fluent', 'Professional working proficiency', 'C2', 'C1', 'B2', 'B1', 'A2', 'A1', 'Basic'],
  hr: ['Materinski', 'Tečno', 'Napredno', 'C2', 'C1', 'B2', 'B1', 'A2', 'A1', 'Osnovno']
}
