// Central CV state: one reactive object shared by every page, autosaved to localStorage.

export const DRAFT_STORAGE_KEY = 'cvmaker:draft:v2'
const STORAGE_KEY = DRAFT_STORAGE_KEY
export const CV_FORMAT = 'cvmaker'
export const CV_VERSION = 2

export const uid = () => Math.random().toString(36).slice(2, 10)

export const emptyExperience = () => ({
  id: uid(), role: '', company: '', location: '', start: '', end: '', current: false, description: ''
})
export const emptyEducation = () => ({
  id: uid(), degree: '', school: '', location: '', start: '', end: '', current: false, description: ''
})
export const emptyLanguage = () => ({ id: uid(), name: '', level: '' })
export const emptyCertification = () => ({ id: uid(), name: '', issuer: '', date: '' })

const factories = {
  experience: emptyExperience,
  education: emptyEducation,
  languages: emptyLanguage,
  certifications: emptyCertification
}

export const createEmptyCv = () => ({
  format: CV_FORMAT,
  version: CV_VERSION,
  meta: { template: 'modern', accent: '#3943B7', font: 'sans', language: 'en', updatedAt: null },
  personal: { fullName: '', title: '', email: '', phone: '', location: '', website: '', linkedin: '', photo: '' },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  languages: [],
  certifications: []
})

const str = (v) => (typeof v === 'string' ? v : v == null ? '' : String(v))

// Accepts anything that looks like CV data (our own JSON, an older draft, parser output)
// and returns a complete, safe object with every field present.
export function normalizeCv(raw) {
  const base = createEmptyCv()
  if (!raw || typeof raw !== 'object') return base

  const meta = { ...base.meta, ...(raw.meta || {}) }
  if (!['modern', 'classic', 'minimal'].includes(meta.template)) meta.template = 'modern'
  if (!['sans', 'serif', 'grotesk'].includes(meta.font)) meta.font = 'sans'
  if (!['en', 'hr'].includes(meta.language)) meta.language = 'en'
  if (!/^#[0-9a-f]{6}$/i.test(meta.accent)) meta.accent = base.meta.accent

  const personal = { ...base.personal }
  for (const key of Object.keys(personal)) personal[key] = str(raw.personal?.[key]).trim()
  if (!personal.photo.startsWith('data:image/')) personal.photo = ''

  const list = (key, fields) =>
    (Array.isArray(raw[key]) ? raw[key] : []).map((item) => {
      const out = factories[key]()
      for (const f of fields) out[f] = f === 'current' ? !!item?.[f] : str(item?.[f])
      return out
    })

  return {
    ...base,
    meta,
    personal,
    summary: str(raw.summary),
    experience: list('experience', ['role', 'company', 'location', 'start', 'end', 'current', 'description']),
    education: list('education', ['degree', 'school', 'location', 'start', 'end', 'current', 'description']),
    languages: list('languages', ['name', 'level']),
    certifications: list('certifications', ['name', 'issuer', 'date']),
    skills: (Array.isArray(raw.skills) ? raw.skills : [])
      .map((s) => str(typeof s === 'object' ? s?.name : s).trim())
      .filter(Boolean)
  }
}

export const isCvEmpty = (cv) =>
  !cv.personal.fullName && !cv.personal.title && !cv.summary &&
  !cv.experience.length && !cv.education.length && !cv.skills.length

export function readStoredDraft() {
  if (!import.meta.client) return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const cv = normalizeCv(JSON.parse(raw))
    return isCvEmpty(cv) ? null : cv
  } catch {
    return null
  }
}

export function useCv() {
  const cv = useState('cv', createEmptyCv)
  const hydrated = useState('cv-hydrated', () => false)
  const saveState = useState('cv-save-state', () => ({ status: 'idle', at: null }))

  function hydrate() {
    if (hydrated.value || !import.meta.client) return
    const stored = readStoredDraft()
    if (stored) cv.value = stored
    hydrated.value = true
  }

  function persist() {
    if (!import.meta.client) return
    try {
      cv.value.meta.updatedAt = new Date().toISOString()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cv.value))
      saveState.value = { status: 'saved', at: Date.now() }
    } catch {
      // Usually a quota error caused by a very large photo.
      saveState.value = { status: 'error', at: Date.now() }
    }
  }

  function replace(data) {
    cv.value = normalizeCv(data)
    hydrated.value = true
    persist()
  }

  function startFresh() {
    replace(createEmptyCv())
  }

  function addItem(key) {
    const item = factories[key]()
    cv.value[key].push(item)
    return item
  }

  function removeItem(key, index) {
    cv.value[key].splice(index, 1)
  }

  function moveItem(key, index, dir) {
    const arr = cv.value[key]
    const to = index + dir
    if (to < 0 || to >= arr.length) return
    const [item] = arr.splice(index, 1)
    arr.splice(to, 0, item)
  }

  return { cv, hydrated, saveState, hydrate, persist, replace, startFresh, addItem, removeItem, moveItem }
}
