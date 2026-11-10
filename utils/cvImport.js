// Import an existing CV so the user can continue instead of starting over.
//
//  1. PDF exported by CV Maker  -> exact restore from the embedded cvmaker-data.json attachment
//  2. CV Maker .json backup / JSON Resume file -> exact (or near-exact) restore
//  3. LinkedIn "Save to PDF" profile -> parsed with LinkedIn-specific rules
//  4. LinkedIn data export (.zip of CSV files) -> mapped field by field
//  5. Any other text-based PDF or Word .docx -> best-effort parse of the text into sections
//
// Returns { cv, source, notes[] } where cv is raw data for normalizeCv().

import { EMBEDDED_FILENAME } from './cvExport'

export const ACCEPTED_IMPORT_TYPES =
  '.pdf,.docx,.json,.zip,application/pdf,application/json,application/zip,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export class ImportError extends Error {}

export async function importCvFile(file) {
  const name = file.name.toLowerCase()
  const buffer = await file.arrayBuffer()
  const head = new Uint8Array(buffer.slice(0, 5))
  const isPdf = String.fromCharCode(...head) === '%PDF-'
  const isZip = head[0] === 0x50 && head[1] === 0x4b

  if (isPdf || name.endsWith('.pdf')) return importPdf(buffer)
  if (isZip || name.endsWith('.docx') || name.endsWith('.zip')) return importZip(buffer)
  if (name.endsWith('.json') || file.type === 'application/json') return importJson(new TextDecoder().decode(buffer))
  if (name.endsWith('.doc')) throw new ImportError('Old .doc files aren\'t supported. Open it in Word and save as .docx or PDF, then try again.')
  if (name.endsWith('.csv')) throw new ImportError('Upload the whole LinkedIn .zip file, not a single CSV from inside it.')
  throw new ImportError('Unsupported file. Upload a PDF, a Word .docx file, a LinkedIn .zip export or a CV Maker .json backup.')
}

async function importZip(buffer) {
  const entries = listZip(buffer)
  const find = (re) => entries.find((e) => re.test(e.name.split('/').pop()))
  if (entries.some((e) => e.name === 'word/document.xml')) return importDocx(buffer, entries)
  if (find(/^(profile|positions)\.csv$/i)) return importLinkedInZip(buffer, find)
  throw new ImportError('This ZIP isn\'t a LinkedIn data export or a Word file. For LinkedIn, upload the archive LinkedIn emails you without unzipping it.')
}

/* ------------------------------------------------------------------ JSON */

function importJson(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new ImportError('That JSON file is not valid.')
  }
  if (data?.basics || data?.work) return { cv: fromJsonResume(data), source: 'jsonresume', notes: [] }
  if (data?.personal || data?.format === 'cvmaker') return { cv: data, source: 'json', notes: [] }
  throw new ImportError('This JSON file doesn\'t look like a CV Maker backup.')
}

function fromJsonResume(r) {
  const b = r.basics || {}
  const profile = (b.profiles || []).find((p) => /linkedin/i.test(p.network || p.url || ''))
  const loc = b.location ? [b.location.city, b.location.region || b.location.countryCode].filter(Boolean).join(', ') : ''
  const highlights = (h) => (h?.length ? '\n' + h.map((x) => `- ${x}`).join('\n') : '')
  return {
    personal: {
      fullName: b.name, title: b.label, email: b.email, phone: b.phone, location: loc,
      website: b.url, linkedin: profile?.url || ''
    },
    summary: b.summary,
    experience: (r.work || []).map((w) => ({
      role: w.position, company: w.name || w.company, location: w.location, start: w.startDate,
      end: w.endDate, current: !w.endDate, description: ((w.summary || '') + highlights(w.highlights)).trim()
    })),
    education: (r.education || []).map((e) => ({
      degree: [e.studyType, e.area].filter(Boolean).join(', '), school: e.institution,
      start: e.startDate, end: e.endDate, description: highlights(e.courses).trim()
    })),
    skills: (r.skills || []).flatMap((s) => [s.name, ...(s.keywords || [])]).filter(Boolean),
    languages: (r.languages || []).map((l) => ({ name: l.language, level: l.fluency })),
    certifications: (r.certificates || r.awards || []).map((c) => ({
      name: c.name || c.title, issuer: c.issuer || c.awarder, date: c.date
    }))
  }
}

/* ------------------------------------------------------------------- PDF */

async function loadPdfjs() {
  const pdfjs = await import('pdfjs-dist')
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
  }
  return pdfjs
}

async function importPdf(buffer) {
  const pdfjs = await loadPdfjs()
  let pdf
  try {
    pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer), isEvalSupported: false }).promise
  } catch (e) {
    if (e?.name === 'PasswordException') throw new ImportError('This PDF is password-protected. Remove the password and try again.')
    throw new ImportError('Could not open that PDF. The file may be damaged.')
  }

  // 1. Our own export: restore the embedded data exactly.
  try {
    const attachments = await pdf.getAttachments()
    const embedded = attachments && Object.values(attachments).find((a) => a.filename === EMBEDDED_FILENAME)
    if (embedded) {
      const data = JSON.parse(new TextDecoder().decode(embedded.content))
      return { cv: data, source: 'embedded', notes: [] }
    }
  } catch {
    // fall through to text parsing
  }

  // 2. Any other PDF: read the text.
  let lines = []
  for (let n = 1; n <= Math.min(pdf.numPages, 10); n++) {
    const page = await pdf.getPage(n)
    const viewport = page.getViewport({ scale: 1 })
    const content = await page.getTextContent()
    lines.push(...pdfPageToLines(content.items, viewport, n))
  }
  if (lines.filter((l) => /[a-zA-ZÀ-ž]{2,}/.test(l.text)).length < 3) {
    throw new ImportError(
      'This PDF has no readable text — it\'s an image (a scan, or a PDF exported by the old CV Maker). ' +
      'Upload a PDF with selectable text, a Word .docx or a .json backup instead.'
    )
  }

  // LinkedIn's "Save to PDF" has a recognisable footer and a profile link.
  const linkedin = lines.some((l) => /^page \d+ of \d+$/i.test(l.text)) && lines.some((l) => LINKEDIN_RE.test(l.text))
  lines = lines.filter((l) => !/^(page|stranica)\s*\d+\s*(of|od|\/)\s*\d+$/i.test(l.text))
  if (linkedin) return { ...parseCvLines(lines, { wrapped: true, linkedin: true }), source: 'linkedin-pdf' }
  return { ...parseCvLines(lines, { wrapped: true }), source: 'pdf' }
}

function pdfPageToLines(items, viewport, pageNo) {
  const glyphs = items
    .filter((i) => typeof i.str === 'string' && i.str.length)
    .map((i) => ({
      str: i.str,
      x: i.transform[4],
      y: viewport.height - i.transform[5],
      w: i.width,
      size: Math.hypot(i.transform[2], i.transform[3]) || i.height || 10
    }))
    .sort((a, b) => a.y - b.y || a.x - b.x)

  // Group glyph runs into visual rows.
  const rows = []
  for (const g of glyphs) {
    const row = rows.find((r) => Math.abs(r.y - g.y) < Math.max(2, Math.min(r.size, g.size) * 0.45))
    if (row) {
      row.items.push(g)
      row.size = Math.max(row.size, g.size)
    } else rows.push({ y: g.y, size: g.size, items: [g] })
  }

  // Split each row into segments wherever there's a wide horizontal gap (columns, right-aligned dates).
  const segments = []
  for (const row of rows) {
    row.items.sort((a, b) => a.x - b.x)
    let seg = null
    for (const g of row.items) {
      const gap = seg ? g.x - seg.x2 : 0
      if (!seg || gap > Math.max(g.size * 2.2, 18)) {
        if (seg) segments.push(seg)
        seg = { text: g.str, x: g.x, x2: g.x + g.w, y: row.y, size: g.size }
      } else {
        const needsSpace = gap > g.size * 0.18 && !seg.text.endsWith(' ') && !g.str.startsWith(' ')
        seg.text += (needsSpace ? ' ' : '') + g.str
        seg.x2 = Math.max(seg.x2, g.x + g.w)
        seg.size = Math.max(seg.size, g.size)
      }
    }
    if (seg) segments.push(seg)
  }
  const segs = segments
    .map((s) => ({ ...s, text: s.text.replace(/\s+/g, ' ').trim() }))
    .filter((s) => s.text)

  // Two-column layout? Find a vertical gutter that (almost) nothing crosses.
  const width = viewport.width
  const chars = (arr) => arr.reduce((n, s) => n + s.text.length, 0)
  const total = chars(segs)
  let best = null
  for (let b = width * 0.22; b <= width * 0.62; b += 3) {
    const crossing = segs.filter((s) => s.x < b - 3 && s.x2 > b + 3)
    const left = segs.filter((s) => s.x2 <= b + 3)
    const right = segs.filter((s) => s.x >= b - 3)
    if (crossing.length > segs.length * 0.12) continue
    // A sidebar (contact, skills) can hold far less text than the main column.
    if (chars(left) < total * 0.08 || chars(right) < total * 0.08) continue
    if (left.length < 4 || right.length < 4) continue
    if (!best || crossing.length < best.crossing.length) best = { b, crossing, left, right }
  }

  if (!best) return segs.sort((a, z) => a.y - z.y || a.x - z.x).map((s) => ({ text: s.text, size: s.size, page: pageNo }))

  const left = best.left.sort((a, z) => a.y - z.y || a.x - z.x)
  const right = best.right.sort((a, z) => a.y - z.y || a.x - z.x)
  const toLine = (s, i) => ({ text: s.text, size: s.size, page: pageNo, columnStart: i === 0 })
  return [...best.crossing.sort((a, z) => a.y - z.y), ...left.map(toLine), ...right.map(toLine)].map((l) => ({
    columnStart: false,
    ...l
  }))
}

/* ------------------------------------------------------------------- ZIP */

// Minimal ZIP reader (central directory + deflate via DecompressionStream): enough for .docx and LinkedIn exports.
function listZip(buffer) {
  const view = new DataView(buffer)
  let eocd = -1
  for (let i = buffer.byteLength - 22; i >= Math.max(0, buffer.byteLength - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break }
  }
  if (eocd < 0) throw new ImportError('That file seems to be damaged.')
  const count = view.getUint16(eocd + 10, true)
  let ptr = view.getUint32(eocd + 16, true)
  const dec = new TextDecoder()
  const entries = []
  for (let n = 0; n < count && ptr + 46 <= buffer.byteLength && view.getUint32(ptr, true) === 0x02014b50; n++) {
    const nameLen = view.getUint16(ptr + 28, true)
    entries.push({
      method: view.getUint16(ptr + 10, true),
      size: view.getUint32(ptr + 20, true),
      local: view.getUint32(ptr + 42, true),
      name: dec.decode(new Uint8Array(buffer, ptr + 46, nameLen))
    })
    ptr += 46 + nameLen + view.getUint16(ptr + 30, true) + view.getUint16(ptr + 32, true)
  }
  return entries
}

async function readZipText(buffer, entry) {
  const view = new DataView(buffer)
  const start = entry.local + 30 + view.getUint16(entry.local + 26, true) + view.getUint16(entry.local + 28, true)
  const data = new Uint8Array(buffer, start, entry.size)
  if (entry.method === 0) return new TextDecoder().decode(data)
  if (entry.method === 8 && typeof DecompressionStream !== 'undefined') {
    const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
    return new Response(stream).text()
  }
  throw new ImportError('Your browser can\'t unpack this file. Try a recent Chrome, Edge, Firefox or Safari.')
}

/* ------------------------------------------------------------------ DOCX */

async function importDocx(buffer, entries = listZip(buffer)) {
  const entry = entries.find((e) => e.name === 'word/document.xml')
  if (!entry) throw new ImportError('That doesn\'t look like a Word .docx file.')
  const xml = await readZipText(buffer, entry)
  const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const lines = []
  for (const p of doc.getElementsByTagNameNS(W, 'p')) {
    let text = ''
    for (const node of p.getElementsByTagNameNS(W, '*')) {
      if (node.localName === 't') text += node.textContent
      else if (node.localName === 'tab') text += '   '
      else if (node.localName === 'br') text += '\n'
    }
    const sizes = [...p.getElementsByTagNameNS(W, 'sz')].map((s) => Number(s.getAttributeNS(W, 'val')) / 2 || 0)
    const bullet = p.getElementsByTagNameNS(W, 'numPr').length > 0
    for (const part of text.split('\n')) {
      const t = part.replace(/\s+/g, ' ').trim()
      if (t) lines.push({ text: bullet ? `• ${t}` : t, size: Math.max(0, ...sizes), page: 1 })
    }
  }
  if (lines.length < 3) throw new ImportError('We couldn\'t find any text in that Word file.')
  return { ...parseCvLines(lines, { wrapped: false }), source: 'docx' }
}

/* ------------------------------------------------------- LINKEDIN EXPORT */

// RFC 4180-ish CSV: quoted fields, escaped quotes, newlines inside quotes.
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  text = text.replace(/^﻿/, '')
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (ch === '"') quoted = false
      else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') { row.push(field); field = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field); rows.push(row); row = []; field = ''
    } else field += ch
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows.filter((r) => r.some((c) => c.trim()))
}

// Rows as objects. Some LinkedIn CSVs start with a "Notes:" preamble, so find the real header row.
function csvRecords(text, requiredColumn) {
  const rows = parseCsv(text)
  const h = rows.findIndex((r) => r.some((c) => c.trim().toLowerCase() === requiredColumn))
  if (h < 0) return []
  const header = rows[h].map((c) => c.trim().toLowerCase())
  return rows.slice(h + 1).map((r) => Object.fromEntries(header.map((k, i) => [k, (r[i] || '').trim()])))
}

export function linkedInLevel(level) {
  const l = String(level || '').toLowerCase()
  if (/native|bilingual|materinski/.test(l)) return 'Native'
  if (/full professional/.test(l)) return 'Fluent'
  if (/professional working/.test(l)) return 'Professional'
  if (/limited working/.test(l)) return 'Intermediate'
  if (/elementary/.test(l)) return 'Basic'
  return level || ''
}

const descToBullets = (text) =>
  String(text || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^[•▪●◦○■□➢►✓*·–-]\s*/, '- '))
    .join('\n')

async function importLinkedInZip(buffer, find) {
  const read = async (re, column) => {
    const entry = find(re)
    return entry ? csvRecords(await readZipText(buffer, entry), column) : []
  }
  const [profile, positions, education, skills, languages, certs, emails, phones] = await Promise.all([
    read(/^profile\.csv$/i, 'first name'),
    read(/^positions\.csv$/i, 'company name'),
    read(/^education\.csv$/i, 'school name'),
    read(/^skills\.csv$/i, 'name'),
    read(/^languages\.csv$/i, 'name'),
    read(/^certifications\.csv$/i, 'name'),
    read(/^email addresses\.csv$/i, 'email address'),
    read(/^phonenumbers\.csv$/i, 'number')
  ])

  const p = profile[0] || {}
  const email = (emails.find((e) => /yes/i.test(e.primary)) || emails[0])?.['email address'] || ''
  const website = (p.websites || '').match(/https?:\/\/[^\s,\]]+/)?.[0] || ''
  const cv = {
    personal: {
      fullName: [p['first name'], p['last name']].filter(Boolean).join(' '),
      title: p.headline || '',
      email,
      phone: phones[0]?.number || '',
      location: p['geo location'] || p.address || '',
      website
    },
    summary: descToBullets(p.summary),
    experience: positions.map((x) => ({
      role: x.title,
      company: x['company name'],
      location: x.location,
      start: x['started on'],
      end: x['finished on'],
      current: !x['finished on'],
      description: descToBullets(x.description)
    })),
    education: education.map((x) => ({
      degree: x['degree name'],
      school: x['school name'],
      start: x['start date'],
      end: x['end date'],
      description: descToBullets([x.notes, x.activities].filter(Boolean).join('\n'))
    })),
    skills: skills.map((s) => s.name).filter(Boolean),
    languages: languages.map((l) => ({ name: l.name, level: linkedInLevel(l.proficiency) })),
    certifications: certs.map((c) => ({ name: c.name, issuer: c.authority, date: c['started on'] }))
  }

  if (!cv.personal.fullName && !cv.experience.length && !cv.education.length) {
    throw new ImportError('This LinkedIn export doesn\'t contain your profile. When requesting it, tick Profile, Positions, Education and Skills.')
  }
  const notes = []
  const missing = [['positions', positions], ['education', education], ['skills', skills]].filter(([, v]) => !v.length).map(([k]) => k)
  if (missing.length) notes.push(`The export had no ${missing.join(', ')} data.`)
  return { cv, source: 'linkedin-zip', notes }
}

/* --------------------------------------------------------------- PARSING */

const SECTION_HEADINGS = {
  summary: ['about me', 'about', 'profile', 'summary', 'professional summary', 'career summary', 'personal profile', 'objective', 'career objective', 'o meni', 'profil', 'sažetak', 'osobni profil'],
  experience: ['experience', 'work experience', 'professional experience', 'employment', 'employment history', 'work history', 'career history', 'relevant experience', 'iskustvo', 'radno iskustvo', 'profesionalno iskustvo', 'projects', 'projekti', 'volunteering', 'volunteer experience', 'volontiranje'],
  education: ['education', 'education and training', 'academic background', 'qualifications', 'obrazovanje', 'školovanje', 'obrazovanje i osposobljavanje'],
  skills: ['skills', 'top skills', 'technical skills', 'key skills', 'core skills', 'skills & abilities', 'competencies', 'core competencies', 'expertise', 'technologies', 'tools', 'vještine', 'kompetencije', 'digitalne vještine', 'tehnologije'],
  languages: ['languages', 'language skills', 'jezici', 'strani jezici', 'jezične vještine', 'materinski jezik'],
  certifications: ['certifications', 'certificates', 'licenses', 'honors-awards', 'honors & awards', 'licenses and certifications', 'licenses & certifications', 'courses', 'awards', 'honors', 'achievements', 'certifikati', 'tečajevi', 'nagrade', 'certifikati i tečajevi'],
  contact: ['contact', 'contact info', 'contact information', 'contact details', 'personal details', 'personal information', 'details', 'kontakt', 'osobni podaci', 'podaci'],
  skip: ['publications', 'patents', 'recommendations', 'interests', 'hobbies', 'hobbies & interests', 'references', 'referees', 'interesi', 'hobiji', 'reference']
}
const HEADING_LOOKUP = new Map(Object.entries(SECTION_HEADINGS).flatMap(([k, list]) => list.map((h) => [h, k])))

const MONTH = '\\b(?:jan|feb|mar|apr|may|maj|jun|jul|aug|kol|sep|ruj|oct|okt|lis|nov|stu|dec|pro|sij|velj|ožu|tra|svi|lip|srp)[a-zčćšđž]*\\.?'
const DATE = `(?:${MONTH}\\s*\\d{4}\\.?|\\d{1,2}\\s*[./]\\s*\\d{4}\\.?|\\d{4}\\.?)`
const PRESENT = '(?:present|current|now|today|ongoing|danas|sada|trenutno|u tijeku)'
const RANGE_RE = new RegExp(`(${DATE})\\s*(?:-|–|—|to|do|until|>)\\s*(${DATE}|${PRESENT})`, 'i')
const LONE_DATE_RE = new RegExp(`^\\(?(${DATE})\\)?$`, 'i')
const PRESENT_RE = new RegExp(`^${PRESENT}$`, 'i')

const EMAIL_RE = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/
const LINKEDIN_RE = /(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/[^\s,|]+/i
const URL_RE = /(?:https?:\/\/[^\s,|]+|www\.[^\s,|]+|\b[\w-]+\.(?:com|dev|io|me|hr|net|org|app|eu|xyz)(?:\/[^\s,|]*)?)/i
const PHONE_RE = /\+?\(?\d[\d\s/().-]{6,}\d/
const BULLET_RE = /^[•▪●◦○■□➢►✓\-–*·]\s*/
const SCHOOL_RE = /univ|school|college|institut|academy|akademij|fakultet|sveučilišt|veleučilišt|škol|gimnazij|polytechnic|veleuciliste|faculty|tvz|fer\b/i

const normHeading = (text) => {
  let t = text.trim()
  if (/^(?:\S ){2,}\S$/.test(t)) t = t.replace(/ /g, '') // "E X P E R I E N C E"
  return t.toLowerCase().replace(/[:：.]+$/, '').replace(/\s+/g, ' ').trim()
}

const findPhone = (text) => {
  const m = text.match(PHONE_RE)
  if (!m) return ''
  const digits = m[0].replace(/\D/g, '')
  if (digits.length < 8 || digits.length > 15) return ''
  if (/^\d{4}\s*[-./]\s*\d{4}$/.test(m[0].trim())) return '' // a year range, not a phone
  if (!m[0].trim().startsWith('+') && digits.length < 9) return ''
  return m[0].trim()
}

function stripContact(text) {
  return text
    .replace(EMAIL_RE, '').replace(LINKEDIN_RE, '').replace(URL_RE, '')
    .replace(findPhone(text) || '\u0000', '')
    .replace(/\((?:linkedin|portfolio|personal|company|blog|other|mobile|home|work|website)\)/gi, '')
    .replace(/^(e-?mail|email|phone|tel|mob|mobile|telefon|mobitel|adresa|address|location|lokacija|web|website|linkedin)\s*[:.]?/i, '')
    .replace(/[|•·;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*,(\s*,)+/g, ',')
    .replace(/^[\s,:]+|[\s,:]+$/g, '')
    .trim()
}

const looksLikePlace = (t) =>
  t.length >= 3 && t.length <= 60 && /[a-zA-ZÀ-ž]/.test(t) && t.split(' ').length <= 7 && !RANGE_RE.test(t) && !HEADING_LOOKUP.has(normHeading(t))

function formatDescription(lines, wrapped) {
  const out = []
  for (const raw of lines) {
    const isBullet = BULLET_RE.test(raw)
    const text = raw.replace(BULLET_RE, '').trim()
    if (!text) continue
    const prev = out[out.length - 1]
    if (isBullet) out.push(`- ${text}`)
    else if (prev && wrapped && (prev.startsWith('- ') ? /^[a-zčćšđž(]/.test(text) || !/[.!?:]$/.test(prev) : true)) {
      out[out.length - 1] = `${prev} ${text}`
    } else out.push(text)
  }
  return out.join('\n')
}

function splitPair(text) {
  const parts = text.split(/\s+(?:at|@|u|\||·|•|—|–|-)\s+|,\s+/i).map((s) => s.trim()).filter(Boolean)
  return parts.length >= 2 ? [parts[0], parts.slice(1).join(', ')] : [text.trim(), '']
}

function parseEntries(lines, kind, wrapped) {
  const texts = lines.map((l) => l.text)
  if (!texts.length) return []
  const dateIdx = texts.map((t, i) => (RANGE_RE.test(t) || LONE_DATE_RE.test(t.trim()) ? i : -1)).filter((i) => i >= 0)

  // Short, non-bullet line that doesn't read like a sentence ("Podravka d.d." is fine, "Led a team of 5." isn't).
  const isHeaderish = (t) => t.length <= 90 && !BULLET_RE.test(t) && !(/[.;]$/.test(t) && t.split(' ').length > 3)
  const blocks = []
  if (!dateIdx.length) {
    blocks.push({ header: [texts[0]], date: null, desc: texts.slice(1) })
  } else {
    const starts = dateIdx.map((di, k) => {
      const floor = k === 0 ? 0 : dateIdx[k - 1] + 1
      const maxHeader = k === 0 ? 3 : 2
      let h = di
      while (h > floor && di - h < maxHeader && isHeaderish(texts[h - 1])) h--
      return { h, di }
    })
    starts.forEach(({ h, di }, k) => {
      const end = k + 1 < starts.length ? starts[k + 1].h : texts.length
      const dateLine = texts[di]
      const m = dateLine.match(RANGE_RE) || dateLine.trim().match(LONE_DATE_RE)
      const rest = dateLine.replace(m[0], '').replace(/^[\s|,·•–—()-]+|[\s|,·•–—()-]+$/g, '').trim()
      blocks.push({
        header: [...texts.slice(h, di), ...(rest ? [rest] : [])],
        date: { start: m[1], end: m[2] || '' },
        desc: texts.slice(di + 1, end)
      })
    })
    // Text before the first entry header (rare) becomes part of the first description.
    if (starts[0].h > 0) blocks[0].desc.unshift(...texts.slice(0, starts[0].h))
  }

  return blocks.map(({ header, date, desc }) => {
    // "Role ........ 2020 – 2022" with the company on the next line: pull that line into the header.
    if (header.length === 1 && desc.length && isHeaderish(desc[0]) && desc[0].length <= 60 && !splitPair(header[0])[1]) {
      header = [header[0], desc.shift()]
    }
    if (kind === 'experience' && header.length === 2) {
      const m = header[1].match(/^(.+?),\s*([^,]{2,30})$/)
      if (m && !SCHOOL_RE.test(m[2])) header = [header[0], m[1], m[2]]
    }
    const current = date ? PRESENT_RE.test(date.end.trim()) : false
    const base = {
      start: date?.start?.trim() || '',
      end: current ? '' : date?.end?.trim() || '',
      current,
      description: formatDescription(desc, wrapped)
    }
    let [a, b, c] = header
    if (header.length === 1) [a, b] = splitPair(a)
    if (kind === 'experience') return { ...base, role: a || '', company: b || '', location: c || '' }
    let degree = a || ''
    let school = b || ''
    if (SCHOOL_RE.test(degree) && !SCHOOL_RE.test(school)) [degree, school] = [school, degree]
    return { ...base, degree, school, location: c || '' }
  })
}

function splitList(lines) {
  return lines
    .flatMap((l) => l.text.split(/[,;|•·▪●]|\s{3,}/))
    .map((s) => s.replace(BULLET_RE, '').trim())
    .filter((s) => s.length > 1 && s.length <= 50)
}

// LinkedIn PDF experience: "Company" / "Role" headings (larger font), then a date line
// "January 2020 - Present (4 years 11 months)", an optional location line, then the description.
// Several roles at one company share the company heading.
const DURATION_RE = /^\(?\s*(?:\d+\s*(?:years?|yrs?|months?|mos?|godin[ae]?|mjesec[ai]?)\s*)+\)?$/i

function bodySize(lines) {
  const counts = new Map()
  for (const l of lines) {
    const k = Math.round(l.size * 2) / 2
    counts.set(k, (counts.get(k) || 0) + l.text.length)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 0
}

function parseLinkedInExperience(lines) {
  const items = lines.filter((l) => !DURATION_RE.test(l.text.trim()))
  const body = bodySize(items)
  const isHead = (l) => l.size > body + 0.4 && !RANGE_RE.test(l.text)
  if (!items.some(isHead)) {
    // No font-size information: LinkedIn still lists company before role.
    return parseEntries(items, 'experience', true).map((e) => ({ ...e, role: e.company || e.role, company: e.company ? e.role : '' }))
  }

  const out = []
  let company = ''
  let heads = []
  let cur = null
  for (const l of items) {
    if (isHead(l)) {
      if (cur) { out.push(cur); cur = null }
      heads.push(l.text)
      continue
    }
    const m = l.text.match(RANGE_RE)
    if (m && heads.length) {
      if (heads.length >= 2) company = heads.slice(0, -1).join(' ')
      const current = PRESENT_RE.test(m[2].trim())
      cur = { role: heads[heads.length - 1], company, location: '', start: m[1].trim(), end: current ? '' : m[2].trim(), current, desc: [], first: true }
      heads = []
      continue
    }
    if (!cur) continue
    if (cur.first && !BULLET_RE.test(l.text) && l.text.length <= 60 && /,|croatia|hrvatska|remote|area|region/i.test(l.text) && looksLikePlace(l.text)) {
      cur.location = l.text
    } else cur.desc.push(l.text)
    cur.first = false
  }
  if (cur) out.push(cur)
  return out.map(({ desc, first, ...e }) => ({ ...e, description: formatDescription(desc, true) }))
}

// LinkedIn PDF education: "School" line, then "Degree, Field · (2015 - 2019)".
function parseLinkedInEducation(lines) {
  const out = []
  let pending = []
  for (const l of lines) {
    if (/·|\(\s*(?:\d{4}|[a-zčćšđž]+\s+\d{4})/i.test(l.text)) {
      const [degreePart, datePart = ''] = l.text.split(/\s*·\s*/)
      const m = datePart.match(RANGE_RE) || datePart.match(/(\d{4})/)
      out.push({
        school: pending.join(' '),
        degree: degreePart.replace(/\(.*\)$/, '').trim(),
        location: '',
        start: m?.[1]?.trim() || '',
        end: m?.[2]?.trim() || '',
        current: false,
        description: ''
      })
      pending = []
    } else pending.push(l.text)
  }
  if (pending.length) out.push({ school: pending.join(' '), degree: '', location: '', start: '', end: '', current: false, description: '' })
  return out
}

export function parseCvLines(lines, { wrapped, linkedin = false }) {
  const notes = []
  // Narrow sidebars wrap long URLs ("linkedin.com/in/ana-" + "horvat-123"), so glue those back together.
  const all = lines.map((l) => l.text).join('\n').replace(/(linkedin\.com\/in\/[^\s]*[-/])\n(\S+)/gi, '$1$2')

  const personal = {
    email: all.match(EMAIL_RE)?.[0] || '',
    linkedin: all.match(LINKEDIN_RE)?.[0] || '',
    phone: '',
    website: '',
    location: '',
    fullName: '',
    title: ''
  }
  for (const l of lines) {
    if (!personal.phone) personal.phone = findPhone(l.text)
    if (!personal.website) {
      const url = l.text.replace(EMAIL_RE, '').replace(LINKEDIN_RE, '').match(URL_RE)?.[0]
      if (url) personal.website = url
    }
  }

  // Name: the biggest short, letters-only line on the first page.
  const nameCandidates = lines
    .map((l, i) => ({ ...l, i }))
    .filter((l) => l.page === 1 && l.i < 40)
    .filter((l) => /^[A-Za-zÀ-žĆČŠĐŽćčšđž' .-]{3,40}$/.test(l.text) && l.text.trim().split(/\s+/).length <= 5)
    .filter((l) => !HEADING_LOOKUP.has(normHeading(l.text)))
  const maxSize = Math.max(0, ...nameCandidates.map((c) => c.size))
  let nameLine = nameCandidates.find((c) => c.size === maxSize && maxSize > 0) || nameCandidates[0]
  if (linkedin) {
    // LinkedIn names can contain anything ("Ana Horvat, MBA"); the name is simply the biggest text.
    const first = lines.map((l, i) => ({ ...l, i })).filter((l) => l.page === 1 && l.text.length <= 60 && !HEADING_LOOKUP.has(normHeading(l.text)))
    const big = Math.max(0, ...first.map((l) => l.size))
    nameLine = first.find((l) => l.size === big) || nameLine
  }
  const used = new Set()
  if (nameLine && linkedin) {
    personal.fullName = nameLine.text.trim()
    used.add(nameLine.i)
    // Headline: following lines in the same font (long headlines wrap), stopping at the location line.
    const parts = []
    for (let j = nameLine.i + 1; j < lines.length && parts.length < 4; j++) {
      const l = lines[j]
      if (parts.length && Math.abs(l.size - lines[nameLine.i + 1].size) > 0.3) break
      if (HEADING_LOOKUP.has(normHeading(l.text)) || EMAIL_RE.test(l.text)) break
      if (parts.length && /^[^|•·]+,\s*[^|•·]+$/.test(l.text) && l.text.split(' ').length <= 7) break
      parts.push(l.text)
      used.add(j)
    }
    personal.title = parts.join(' ').slice(0, 220)
  } else if (nameLine) {
    personal.fullName = nameLine.text.replace(/\s+/g, ' ').trim()
    if (personal.fullName === personal.fullName.toUpperCase()) {
      personal.fullName = personal.fullName.toLowerCase().replace(/(^|[\s'-])\p{L}/gu, (s) => s.toUpperCase())
    }
    used.add(nameLine.i)
    const next = lines[nameLine.i + 1]
    if (next && next.text.length <= 70 && !HEADING_LOOKUP.has(normHeading(next.text)) &&
        !EMAIL_RE.test(next.text) && !findPhone(next.text) && !RANGE_RE.test(next.text)) {
      personal.title = next.text
      used.add(nameLine.i + 1)
    }
  }

  // Walk the lines and bucket them by the section heading above them.
  const buckets = { header: [], summary: [], experience: [], education: [], skills: [], languages: [], certifications: [], contact: [], skip: [] }
  const skippedHeadings = []
  let current = 'header'
  lines.forEach((l, i) => {
    // A new column on the first page doesn't continue the previous column's section.
    if (l.columnStart && l.page === 1) current = 'header'
    if (used.has(i)) return
    const key = HEADING_LOOKUP.get(normHeading(l.text))
    if (key && l.text.length <= 45) {
      current = key
      if (key === 'skip') {
        const h = normHeading(l.text)
        skippedHeadings.push(h.charAt(0).toUpperCase() + h.slice(1))
      }
      return
    }
    // Pure contact lines are already captured above.
    if (EMAIL_RE.test(l.text) || LINKEDIN_RE.test(l.text) || findPhone(l.text) || URL_RE.test(l.text)) {
      const rest = stripContact(l.text)
      if (rest.length < 3) return
      if (current === 'header' || current === 'contact') {
        if (!personal.location && looksLikePlace(rest)) personal.location = rest
        return
      }
    }
    buckets[current].push(l)
  })

  for (const l of [...buckets.contact, ...buckets.header]) {
    const t = stripContact(l.text)
    if (!personal.location && looksLikePlace(t) && /,|\d{5}|croatia|hrvatska|zagreb|split|rijeka|osijek/i.test(t)) personal.location = t
  }
  // Leftover header text with no section (and no summary section) is usually an intro paragraph.
  const headerLeftovers = buckets.header.filter((l) => stripContact(l.text) !== personal.location && l.text.length > 40)
  const summaryLines = buckets.summary.length ? buckets.summary : headerLeftovers

  const cv = {
    personal,
    summary: formatDescription(summaryLines.map((l) => l.text), wrapped),
    experience: linkedin ? parseLinkedInExperience(buckets.experience) : parseEntries(buckets.experience, 'experience', wrapped),
    education: linkedin ? parseLinkedInEducation(buckets.education) : parseEntries(buckets.education, 'education', wrapped),
    skills: [...new Set(splitList(buckets.skills))].slice(0, 40),
    languages: splitList(buckets.languages).map((s) => {
      const m = s.match(/^(.+?)\s*(?:[-–—:]\s*|\(\s*)(.+?)\)?$/)
      const out = m ? { name: m[1], level: m[2] } : { name: s, level: '' }
      if (linkedin) out.level = linkedInLevel(out.level)
      return out
    }),
    certifications: buckets.certifications
      .map((l) => l.text.replace(BULLET_RE, '').trim())
      .filter((t) => t.length > 2)
      .map((t) => {
        const year = t.match(/\b(?:19|20)\d{2}\b/)?.[0] || ''
        const clean = t.replace(year, '').replace(/[\s,|()–-]+$/, '').trim()
        const [name, issuer] = clean.split(/\s+[|–—-]\s+|,\s+/)
        return { name: name || clean, issuer: issuer || '', date: year }
      })
  }

  const found = ['experience', 'education', 'skills'].filter((k) => cv[k].length)
  if (!found.length) notes.push('We couldn\'t recognise the section headings in this file, so most of the text went into the profile. Move things to the right sections below.')
  if (skippedHeadings.length) notes.push(`Not imported: ${skippedHeadings.join(', ')}.`)
  return { cv, notes }
}
