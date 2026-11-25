// Builds public/esco/esco.json from the public ESCO API (European Skills, Competences,
// Qualifications and Occupations — European Commission, https://esco.ec.europa.eu).
// Run once: `node scripts/build-esco.mjs`. The output is committed, so the app never calls ESCO at runtime.
//
// Output (compact, index based):
// {
//   version, source,
//   skills: [[en, hr, kind]],                    kind: 0 = skill/competence, 1 = knowledge
//   occupations: [[en, hr, alt, essential[], optional[]]]   alt = alternative labels (en + hr), skill indexes
// }
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const API = 'https://ec.europa.eu/esco/api'
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'esco', 'esco.json')
const CACHE = join(ROOT, 'node_modules', '.cache', 'esco')
const OPTIONAL_PER_OCCUPATION = 12
const ALT_PER_LANGUAGE = 4
const CONCURRENCY = 6

mkdirSync(CACHE, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function get(url, attempt = 0) {
  const key = join(CACHE, Buffer.from(url).toString('base64url').slice(-180) + '.json')
  if (existsSync(key)) return JSON.parse(readFileSync(key, 'utf8'))
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' } })
    if (!res.ok) throw new Error(`${res.status} ${url}`)
    const data = await res.json()
    writeFileSync(key, JSON.stringify(data))
    return data
  } catch (err) {
    if (attempt >= 2) throw err
    await sleep(1000 * 2 ** attempt)
    return get(url, attempt + 1)
  }
}

async function pool(items, fn) {
  let i = 0
  let done = 0
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (i < items.length) {
      const item = items[i++]
      await fn(item)
      if (++done % 100 === 0) console.log(`  ${done}/${items.length}`)
    }
  })
  await Promise.all(workers)
}

// 1. every occupation (preferred labels in all languages come with the search result)
console.log('Listing occupations…')
const occupations = []
// Note: ESCO's `offset` is a page number, not an item offset.
for (let pageNo = 0; ; pageNo++) {
  const page = await get(`${API}/search?type=occupation&language=en&limit=100&offset=${pageNo}`)
  const results = page._embedded?.results || []
  for (const r of results) {
    occupations.push({ uri: r.uri, en: r.preferredLabel?.en || r.title, hr: r.preferredLabel?.hr || r.preferredLabel?.en || r.title })
  }
  if (!results.length || (pageNo + 1) * 100 >= page.total) break
}
console.log(`${occupations.length} occupations`)

// 2. essential / optional skills, titles in English and Croatian
const skills = new Map() // uri -> { en, hr, kind }
const kindOf = (t) => (String(t || '').includes('knowledge') ? 1 : 0)

console.log('Fetching skills per occupation…')
await pool(occupations, async (occ) => {
  const url = (lang) => `${API}/resource/occupation?uri=${encodeURIComponent(occ.uri)}&language=${lang}`
  // A few occupations fail on the server now and then: fall back to English titles, or skip.
  // ESCO's default version returns 500 for a few occupations; asking for an explicit version works.
  const fetchLang = (lang) => get(url(lang)).catch(() => get(`${url(lang)}&selectedVersion=v1.2.0`)).catch(() => null)
  const [en, hr] = await Promise.all([fetchLang('en'), fetchLang('hr')])
  if (!en) {
    console.warn(`  skipped ${occ.en}`)
    return
  }
  const hrTitle = new Map()
  for (const k of ['hasEssentialSkill', 'hasOptionalSkill']) for (const s of hr?._links?.[k] || []) hrTitle.set(s.uri, s.title)

  const take = (list, max) =>
    (list || []).slice(0, max).map((s) => {
      if (!skills.has(s.uri)) skills.set(s.uri, { en: s.title, hr: hrTitle.get(s.uri) || s.title, kind: kindOf(s.skillType) })
      return s.uri
    })
  occ.essential = take(en._links?.hasEssentialSkill, 60)
  occ.optional = take(en._links?.hasOptionalSkill, OPTIONAL_PER_OCCUPATION)

  const alt = en.alternativeLabel || {}
  occ.alt = [...new Set([...(alt.en || []).slice(0, ALT_PER_LANGUAGE), ...(alt.hr || []).slice(0, ALT_PER_LANGUAGE)])]
})

// 3. write the compact file
const skillUris = [...skills.keys()]
const index = new Map(skillUris.map((u, i) => [u, i]))
const out = {
  version: new Date().toISOString().slice(0, 10),
  source: 'ESCO — European Skills, Competences, Qualifications and Occupations, European Commission (esco.ec.europa.eu)',
  skills: skillUris.map((u) => {
    const s = skills.get(u)
    return [s.en, s.hr, s.kind]
  }),
  occupations: occupations
    .filter((o) => o.essential)
    .map((o) => [o.en, o.hr, o.alt, o.essential.map((u) => index.get(u)), o.optional.map((u) => index.get(u))])
}
mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(out))
console.log(`Wrote ${OUT}: ${out.occupations.length} occupations, ${out.skills.length} skills, ${(JSON.stringify(out).length / 1024).toFixed(0)} KB`)
