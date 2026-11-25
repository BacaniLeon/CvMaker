// ESCO occupations and skills (European Commission, esco.ec.europa.eu) — the same data Europass uses.
// ~3000 occupations with their essential/optional skills in English and Croatian. The file is
// built by scripts/build-esco.mjs and fetched lazily the first time the editor needs it.
import { shallowRef } from 'vue'
import { fold } from '~/utils/cvSuggest'

export const esco = shallowRef(null)
let job = null

const capFirst = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s)
const STOP = new Set(['and', 'the', 'for', 'with', 'ili', 'kod', 'pri'])
const tokens = (s) => fold(s).split(/[^a-z0-9#+]+/).filter((t) => t.length >= 3 && !STOP.has(t))

// Everyday Croatian job words that ESCO words differently.
const SYNONYMS = {
  profes: ['nastav', 'predav'], ucitel: ['nastav'], ucitelj: ['nastav'], odgoji: ['odgaja'], teta: ['odgaja'],
  gradev: ['gradit'], zidar: ['zidar'], keramic: ['keram'], vozac: ['vozac'], doktor: ['lijecn'], lijecn: ['lijecn'],
  sestra: ['medici'], tehnic: ['tehnic'], prodav: ['prodaj'], blagaj: ['blagaj'], konoba: ['konoba'],
  kuhar: ['kuhar'], frizer: ['frizer'], racuno: ['racuno'], knjigo: ['knjigo'], program: ['progra', 'razvoj'],
  develo: ['razvoj', 'progra'], menadz: ['upravi', 'voditel'], voditel: ['upravi', 'voditel'], direkt: ['ravnat', 'direkt']
}
const expand = (stems) => [...new Set(stems.flatMap((t) => [t, ...(SYNONYMS[t] || [])]))]
// Light stemming so Croatian forms meet ("građevinar" ~ "građevinski", "profesorica" ~ "profesor").
const stem = (t) => t.slice(0, Math.min(t.length, 6))

// "knjižničar/knjižničarka za arhiviranje" -> ["knjižničar za arhiviranje", "knjižničarka za arhiviranje"];
// "medicinski tehničar / medicinska sestra" -> both halves.
export function genderVariants(label) {
  const l = String(label || '').trim()
  if (l.includes(' / ')) return l.split(' / ').map((x) => x.trim()).filter(Boolean)
  if (!l.includes('/')) return [l]
  const words = l.split(/\s+/)
  const pick = (side) => words.map((w) => (w.includes('/') ? w.split('/')[side] || w.split('/')[0] : w)).join(' ')
  return [...new Set([pick(0), pick(1)])]
}

export function loadEsco() {
  if (esco.value || typeof window === 'undefined') return Promise.resolve(esco.value)
  if (!job) {
    job = fetch('/esco/esco.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((raw) => {
        if (!raw) return null
        const skills = raw.skills.map(([en, hr, kind]) => ({ en: capFirst(en), hr: capFirst(hr), kind, terms: [fold(en), fold(hr)] }))
        const occupations = raw.occupations.map(([en, hr, alt, essential, optional]) => {
          const preferred = [...new Set([en, hr, ...genderVariants(en), ...genderVariants(hr)].map((s) => s.trim()).filter(Boolean))]
          const labels = [...new Set([...preferred, ...alt.map((s) => s.trim()).filter(Boolean)])]
          return {
            preferred: preferred.map(fold),
            en,
            hr,
            essential,
            optional,
            terms: labels.map(fold),
            stems: labels.map((l) => tokens(l).map(stem)).filter((t) => t.length)
          }
        })
        esco.value = { skills, occupations, source: raw.source }
        return esco.value
      })
      .catch(() => {
        job = null
        return null
      })
  }
  return job
}

export const occupationLabel = (o, lang) => (lang === 'hr' ? o.hr : o.en)
export const escoSkillLabel = (s, lang) => (lang === 'hr' ? s.hr : s.en)

// How well a piece of free text (a job title, a degree) describes an occupation, 0..1.
function textScore(occ, text) {
  const f = fold(text)
  if (!f) return 0
  if (occ.preferred.includes(f)) return 1.05 // exact preferred name beats an alternative name
  if (occ.terms.includes(f)) return 1
  const src = tokens(text).map(stem)
  if (!src.length) return 0
  const srcSets = src.map((t) => expand([t]))
  let best = 0
  for (const term of occ.stems) {
    const termHit = term.filter((t) => srcSets.some((set) => set.includes(t))).length
    if (!termHit) continue
    const srcHit = srcSets.filter((set) => set.some((t) => term.includes(t))).length
    // Covering what the user wrote matters most; covering the occupation's own words breaks ties.
    const score = (termHit / term.length) * 0.45 + (srcHit / src.length) * 0.55
    if (score > best) best = score
  }
  return best
}

// Occupations that fit the CV best: job title counts most, then current/recent roles, then degrees.
export function matchOccupations(cv, limit = 5) {
  const data = esco.value
  if (!data) return []
  const sources = [
    [cv.personal.title, 3],
    ...cv.experience.slice(0, 4).map((e, i) => [e.role, e.current ? 2.2 : 2 - i * 0.3]),
    ...cv.education.slice(0, 3).map((e) => [e.degree, 0.8])
  ].filter(([t]) => String(t || '').trim())
  if (!sources.length) return []

  const scored = []
  for (const occ of data.occupations) {
    let score = 0
    for (const [text, weight] of sources) {
      const s = textScore(occ, text)
      if (s >= 0.45) score += s * weight
    }
    if (score) scored.push({ occ, score })
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((x) => x.occ)
}

// Skills of an occupation that are not on the CV yet: essential first, then optional.
export function occupationSkills(occ, cv, lang, limit = 14) {
  const data = esco.value
  if (!data || !occ) return []
  const have = new Set(cv.skills.map(fold))
  const out = []
  for (const i of [...occ.essential, ...occ.optional]) {
    const s = data.skills[i]
    if (!s || have.has(fold(s.en)) || have.has(fold(s.hr))) continue
    out.push({ key: `esco-${i}`, label: escoSkillLabel(s, lang), essential: occ.essential.includes(i) })
    if (out.length >= limit) break
  }
  return out
}

function scoreTerms(terms, q) {
  let best = 0
  for (const t of terms) {
    if (t === q) return 100
    if (t.startsWith(q)) best = Math.max(best, 70 - Math.min(20, t.length - q.length))
    else if (q.length >= 3 && t.includes(` ${q}`)) best = Math.max(best, 45)
  }
  return best
}

export function searchEscoSkills(query, { lang = 'en', exclude = [], limit = 4 } = {}) {
  const data = esco.value
  const q = fold(query)
  if (!data || q.length < 2) return []
  const skip = new Set(exclude.map(fold))
  const hits = []
  for (const s of data.skills) {
    const score = scoreTerms(s.terms, q)
    if (score && !skip.has(fold(s.en)) && !skip.has(fold(s.hr))) hits.push({ s, score })
  }
  return hits
    .sort((a, b) => b.score - a.score || a.s.en.length - b.s.en.length)
    .slice(0, limit)
    .map(({ s, score }) => ({
      kind: 'skill',
      value: escoSkillLabel(s, lang),
      label: escoSkillLabel(s, lang),
      hint: s.kind ? 'Knowledge · ESCO' : 'Skill · ESCO',
      score: score - 15 // curated, CV-style names rank above ESCO's longer phrases
    }))
}

export function searchOccupations(query, { lang = 'en', limit = 8, split = false } = {}) {
  const data = esco.value
  const q = fold(query)
  if (!data || q.length < 2) return []
  const hits = []
  for (const o of data.occupations) {
    const score = scoreTerms(o.terms, q)
    if (score) hits.push({ o, score })
  }
  hits.sort((a, b) => b.score - a.score || a.o.en.length - b.o.en.length)
  const out = []
  const seen = new Set()
  for (const { o, score } of hits) {
    const label = occupationLabel(o, lang)
    // For a job title, "knjižničar/knjižničarka" becomes two choices.
    const variants = split ? genderVariants(label).map(capFirst) : [capFirst(label)]
    for (const v of variants) {
      if (seen.has(fold(v))) continue
      seen.add(fold(v))
      out.push({ kind: 'occupation', value: v, label: v, hint: lang === 'hr' ? capFirst(o.en) : '', occ: o, score })
    }
    if (out.length >= limit) break
  }
  return out.slice(0, limit)
}
