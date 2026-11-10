// Helpers shared by the three CV templates.

export const CV_PAGE = { width: 794, height: 1123 } // A4 at 96 dpi

export const cvLabels = {
  en: {
    profile: 'Profile', experience: 'Experience', education: 'Education', skills: 'Skills',
    languages: 'Languages', certifications: 'Certifications', contact: 'Contact', present: 'Present', hello: "Hello, I'm"
  },
  hr: {
    profile: 'Profil', experience: 'Radno iskustvo', education: 'Obrazovanje', skills: 'Vještine',
    languages: 'Jezici', certifications: 'Certifikati', contact: 'Kontakt', present: 'Danas', hello: 'Bok, ja sam'
  }
}

// Categories drive the gallery filter; `ats` marks simple single-column layouts that applicant-tracking systems read well.
export const cvTemplates = [
  { id: 'modern', name: 'Modern', hint: 'Coloured sidebar with photo', category: 'modern', popular: true },
  { id: 'classic', name: 'Classic', hint: 'Centred, single column', category: 'professional', ats: true },
  { id: 'minimal', name: 'Minimal', hint: 'Light type, two columns', category: 'minimal' },
  { id: 'executive', name: 'Executive', hint: 'Dark header band, serif headings', category: 'professional', popular: true },
  { id: 'timeline', name: 'Timeline', hint: 'Career shown on a timeline', category: 'creative' },
  { id: 'elegant', name: 'Elegant', hint: 'Refined serif with fine rules', category: 'professional' },
  { id: 'compact', name: 'Compact', hint: 'Dense, fits more on one page', category: 'minimal', ats: true },
  { id: 'swiss', name: 'Swiss', hint: 'Grid labels, bold type', category: 'minimal', popular: true },
  { id: 'bold', name: 'Bold', hint: 'Big name, strong headings', category: 'creative' },
  { id: 'aside', name: 'Aside', hint: 'Tinted sidebar on the right', category: 'modern' },
  { id: 'cards', name: 'Cards', hint: 'Sections on soft cards', category: 'modern' },
  { id: 'developer', name: 'Developer', hint: 'Code-inspired details', category: 'creative', popular: true },
  { id: 'gradient', name: 'Gradient', hint: 'Colourful header, round photo', category: 'creative' },
  { id: 'academic', name: 'Academic', hint: 'Dates in the margin, formal', category: 'professional', ats: true },
  { id: 'split', name: 'Split', hint: 'Two-tone header, balanced columns', category: 'modern' },
  { id: 'mono', name: 'Mono', hint: 'Black & white, high contrast', category: 'minimal' },
  { id: 'pastel', name: 'Pastel', hint: 'Soft colours, friendly', category: 'creative' },
  { id: 'infographic', name: 'Infographic', hint: 'Icons and language ratings', category: 'creative', popular: true }
]

export const cvTemplateCategories = [
  { id: 'all', name: 'All' },
  { id: 'popular', name: 'Popular' },
  { id: 'modern', name: 'Modern' },
  { id: 'professional', name: 'Professional' },
  { id: 'creative', name: 'Creative' },
  { id: 'minimal', name: 'Minimal' },
  { id: 'ats', name: 'ATS-friendly' }
]

export const cvFonts = {
  sans: { name: 'Inter', stack: "'Inter', 'Helvetica Neue', Arial, sans-serif" },
  serif: { name: 'Lora', stack: "'Lora', Georgia, 'Times New Roman', serif" },
  grotesk: { name: 'Manrope', stack: "'Manrope', 'Helvetica Neue', Arial, sans-serif" }
}

export const cvAccents = ['#3943B7', '#0F766E', '#B42318', '#C2410C', '#7C3AED', '#1F2937', '#0369A1', '#A16207']

export function hexToRgba(hex, alpha) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

export function shadeHex(hex, amount) {
  // amount < 0 darkens, > 0 lightens (towards white)
  const n = parseInt(hex.slice(1), 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(amount < 0 ? c * (1 + amount) : c + (255 - c) * amount)
  )
  return `#${ch.map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

// 0–5 for language ratings; 0 means "unknown level, show the text instead".
export function levelDots(level) {
  const l = String(level || '').toLowerCase()
  if (/native|bilingual|c2|fluent|materinski|izvorni/.test(l)) return 5
  if (/c1|advanced|full|professional|napredn/.test(l)) return 4
  if (/b2|b1|upper|intermediate|conversational|srednj/.test(l)) return 3
  if (/a2|elementary|basic|limited|osnovn/.test(l)) return 2
  if (/a1|beginner|početn/.test(l)) return 1
  return 0
}

const filled = (obj, keys) => keys.some((k) => String(obj[k] || '').trim())

// Everything a template needs, already cleaned (empty rows dropped, dates formatted).
export function buildCvView(cv) {
  const t = cvLabels[cv.meta.language] || cvLabels.en
  const range = (item) => {
    const end = item.current ? t.present : item.end
    return [item.start, end].filter((s) => String(s || '').trim()).join(' – ')
  }
  const p = cv.personal
  const prettyUrl = (u) => u.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')

  return {
    t,
    p,
    accent: cv.meta.accent,
    accentSoft: hexToRgba(cv.meta.accent, 0.1),
    accentTint: shadeHex(cv.meta.accent, 0.92),
    accentLine: hexToRgba(cv.meta.accent, 0.35),
    accentDark: shadeHex(cv.meta.accent, -0.35),
    accentLight: shadeHex(cv.meta.accent, 0.35),
    initials: (p.fullName || 'Your Name').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join(''),
    font: (cvFonts[cv.meta.font] || cvFonts.sans).stack,
    summary: cv.summary.trim(),
    contact: [
      p.email && { icon: 'mail', text: p.email },
      p.phone && { icon: 'phone', text: p.phone },
      p.location && { icon: 'pin', text: p.location },
      p.website && { icon: 'globe', text: prettyUrl(p.website) },
      p.linkedin && { icon: 'linkedin', text: prettyUrl(p.linkedin) }
    ].filter(Boolean),
    experience: cv.experience
      .filter((e) => filled(e, ['role', 'company', 'description', 'start']))
      .map((e) => ({ ...e, dates: range(e) })),
    education: cv.education
      .filter((e) => filled(e, ['degree', 'school', 'description', 'start']))
      .map((e) => ({ ...e, dates: range(e) })),
    skills: cv.skills.filter(Boolean),
    languages: cv.languages.filter((l) => l.name.trim()).map((l) => ({ ...l, dots: levelDots(l.level) })),
    certifications: cv.certifications.filter((c) => c.name.trim())
  }
}

// Splits a free-text description into paragraphs and bullet lists.
export function parseRichText(text) {
  const blocks = []
  for (const raw of String(text || '').split('\n')) {
    const line = raw.trim()
    if (!line) continue
    const bullet = line.match(/^[-•*–▪●◦]\s*(.+)$/)
    const last = blocks[blocks.length - 1]
    if (bullet) {
      if (last?.type === 'list') last.items.push(bullet[1])
      else blocks.push({ type: 'list', items: [bullet[1]] })
    } else {
      blocks.push({ type: 'p', text: line })
    }
  }
  return blocks
}
