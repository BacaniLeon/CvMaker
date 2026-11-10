// Import an existing CV so the user can continue instead of starting over.
//
//  1. PDF exported by CV Maker  -> exact restore from the embedded cvmaker-data.json attachment
//  2. CV Maker .json backup / JSON Resume file -> exact (or near-exact) restore
//  3. Any other text-based PDF or Word .docx -> best-effort parse of the text into sections
//
// Returns { cv, source, notes[] } where cv is raw data for normalizeCv().

import { EMBEDDED_FILENAME } from './cvExport'

export const ACCEPTED_IMPORT_TYPES = '.pdf,.docx,.json,application/pdf,application/json,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export class ImportError extends Error {}

export async function importCvFile(file) {
  const name = file.name.toLowerCase()
  const buffer = await file.arrayBuffer()
  const head = new Uint8Array(buffer.slice(0, 5))
  const isPdf = String.fromCharCode(...head) === '%PDF-'
  const isZip = head[0] === 0x50 && head[1] === 0x4b

  if (isPdf || name.endsWith('.pdf')) return importPdf(buffer)
  if (isZip || name.endsWith('.docx')) return importDocx(buffer)
  if (name.endsWith('.json') || file.type === 'application/json') return importJson(new TextDecoder().decode(buffer))
  if (name.endsWith('.doc')) throw new ImportError('Old .doc files aren\'t supported. Open it in Word and save as .docx or PDF, then try again.')
  throw new ImportError('Unsupported file. Upload a PDF, a Word .docx file or a CV Maker .json backup.')
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
  const lines = []
  for (let n = 1; n <= Math.min(pdf.numPages, 6); n++) {
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
    if (chars(left) < total * 0.2 || chars(right) < total * 0.2) continue
    if (left.length < 4 || right.length < 4) continue
    if (!best || crossing.length < best.crossing.length) best = { b, crossing, left, right }
  }

  const ordered = best
    ? [
        ...best.crossing.sort((a, z) => a.y - z.y),
        ...best.left.sort((a, z) => a.y - z.y || a.x - z.x),
        ...best.right.sort((a, z) => a.y - z.y || a.x - z.x)
      ]
    : segs.sort((a, z) => a.y - z.y || a.x - z.x)

  return ordered.map((s) => ({ text: s.text, size: s.size, page: pageNo }))
}

/* ------------------------------------------------------------------ DOCX */

async function readZipEntry(buffer, wanted) {
  const view = new DataView(buffer)
  let eocd = -1
  for (let i = buffer.byteLength - 22; i >= Math.max(0, buffer.byteLength - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break }
  }
  if (eocd < 0) throw new ImportError('That Word file seems to be damaged.')
  const count = view.getUint16(eocd + 10, true)
  let ptr = view.getUint32(eocd + 16, true)
  const dec = new TextDecoder()
  for (let n = 0; n < count && view.getUint32(ptr, true) === 0x02014b50; n++) {
    const method = view.getUint16(ptr + 10, true)
    const size = view.getUint32(ptr + 20, true)
    const nameLen = view.getUint16(ptr + 28, true)
    const extraLen = view.getUint16(ptr + 30, true)
    const commentLen = view.getUint16(ptr + 32, true)
    const local = view.getUint32(ptr + 42, true)
    const name = dec.decode(new Uint8Array(buffer, ptr + 46, nameLen))
    if (name === wanted) {
      const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true)
      const data = new Uint8Array(buffer, start, size)
      if (method === 0) return dec.decode(data)
      if (method === 8 && typeof DecompressionStream !== 'undefined') {
        const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
        return new Response(stream).text()
      }
      throw new ImportError('Your browser can\'t read this Word file. Try saving it as PDF.')
    }
    ptr += 46 + nameLen + extraLen + commentLen
  }
  return null
}

async function importDocx(buffer) {
  const xml = await readZipEntry(buffer, 'word/document.xml')
  if (!xml) throw new ImportError('That doesn\'t look like a Word .docx file.')
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

/* --------------------------------------------------------------- PARSING */

const SECTION_HEADINGS = {
  summary: ['about me', 'about', 'profile', 'summary', 'professional summary', 'career summary', 'personal profile', 'objective', 'career objective', 'o meni', 'profil', 'sažetak', 'osobni profil'],
  experience: ['experience', 'work experience', 'professional experience', 'employment', 'employment history', 'work history', 'career history', 'relevant experience', 'iskustvo', 'radno iskustvo', 'profesionalno iskustvo', 'projects', 'projekti', 'volunteering', 'volunteer experience', 'volontiranje'],
  education: ['education', 'education and training', 'academic background', 'qualifications', 'obrazovanje', 'školovanje', 'obrazovanje i osposobljavanje'],
  skills: ['skills', 'technical skills', 'key skills', 'core skills', 'skills & abilities', 'competencies', 'core competencies', 'expertise', 'technologies', 'tools', 'vještine', 'kompetencije', 'digitalne vještine', 'tehnologije'],
  languages: ['languages', 'language skills', 'jezici', 'strani jezici', 'jezične vještine', 'materinski jezik'],
  certifications: ['certifications', 'certificates', 'licenses', 'licenses & certifications', 'courses', 'awards', 'honors', 'achievements', 'certifikati', 'tečajevi', 'nagrade', 'certifikati i tečajevi'],
  contact: ['contact', 'contact info', 'contact information', 'contact details', 'personal details', 'personal information', 'details', 'kontakt', 'osobni podaci', 'podaci'],
  skip: ['interests', 'hobbies', 'hobbies & interests', 'references', 'referees', 'interesi', 'hobiji', 'reference']
}
const HEADING_LOOKUP = new Map(Object.entries(SECTION_HEADINGS).flatMap(([k, list]) => list.map((h) => [h, k])))

const MONTH = '(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|sij(?:ečanj)?|velj(?:ača)?|ožu(?:jak)?|tra(?:vanj)?|svi(?:banj)?|lip(?:anj)?|srp(?:anj)?|kol(?:ovoz)?|ruj(?:an)?|lis(?:topad)?|stu(?:deni)?|pro(?:sinac)?)\\.?'
const DATE = `(?:${MONTH}\\s*\\d{4}|\\d{1,2}\\s*[./]\\s*\\d{4}\\.?|\\d{4}\\.?)`
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

export function parseCvLines(lines, { wrapped }) {
  const notes = []
  const all = lines.map((l) => l.text).join('\n')

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
  const nameLine = nameCandidates.find((c) => c.size === maxSize && maxSize > 0) || nameCandidates[0]
  const used = new Set()
  if (nameLine) {
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
    experience: parseEntries(buckets.experience, 'experience', wrapped),
    education: parseEntries(buckets.education, 'education', wrapped),
    skills: [...new Set(splitList(buckets.skills))].slice(0, 40),
    languages: splitList(buckets.languages).map((s) => {
      const m = s.match(/^(.+?)\s*(?:[-–—:]\s*|\(\s*)(.+?)\)?$/)
      return m ? { name: m[1], level: m[2] } : { name: s, level: '' }
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
