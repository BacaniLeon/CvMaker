// Helpers shared by the three CV templates.

export const CV_PAGE = { width: 794, height: 1123 } // A4 at 96 dpi

export const cvLabels = {
  en: {
    profile: 'Profile', experience: 'Experience', education: 'Education', skills: 'Skills',
    languages: 'Languages', certifications: 'Certifications', contact: 'Contact', present: 'Present'
  },
  hr: {
    profile: 'Profil', experience: 'Radno iskustvo', education: 'Obrazovanje', skills: 'Vještine',
    languages: 'Jezici', certifications: 'Certifikati', contact: 'Kontakt', present: 'Danas'
  }
}

export const cvTemplates = [
  { id: 'modern', name: 'Modern', hint: 'Coloured sidebar' },
  { id: 'classic', name: 'Classic', hint: 'Single column' },
  { id: 'minimal', name: 'Minimal', hint: 'Clean two-column' }
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
    accentLine: hexToRgba(cv.meta.accent, 0.35),
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
    languages: cv.languages.filter((l) => l.name.trim()),
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
