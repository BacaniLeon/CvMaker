// Builds a profile summary from what is already on the CV. Rule-based (no AI service),
// so it runs offline and never invents achievements: it only rephrases the user's own data.
// Croatian sentences avoid gendered forms (present tense, nominal phrases).
import { fold, findSkill, skillLabel, findLanguage, SIDE_JOB_TYPES, UNIVERSITY_LEVELS, optionLabel, educationLevels } from '~/utils/cvSuggest'

export const SUMMARY_VARIANTS = 3

// ---------- dates

const MONTHS = {
  jan: 1, sij: 1, feb: 2, velj: 2, mar: 3, ozu: 3, apr: 4, tra: 4, may: 5, svi: 5, jun: 6, lip: 6,
  jul: 7, srp: 7, aug: 8, kol: 8, sep: 9, ruj: 9, oct: 10, lis: 10, nov: 11, stu: 11, dec: 12, pro: 12
}

// "09/2021", "2021-09", "Sep 2021", "rujan 2021.", "2021" -> months since year 0
function parseDate(s, end = false) {
  const t = fold(s)
  const y = t.match(/(19|20)\d{2}/)
  if (!y) return null
  const year = +y[0]
  let month = null
  const num = t.match(/\b(\d{1,2})\s*[./-]\s*(?:19|20)\d{2}/) || t.match(/(?:19|20)\d{2}\s*[./-]\s*(\d{1,2})\b/)
  if (num && +num[1] >= 1 && +num[1] <= 12) month = +num[1]
  if (!month) {
    const word = Object.keys(MONTHS).find((k) => new RegExp(`\\b${k}`).test(t))
    if (word) month = MONTHS[word]
  }
  return year * 12 + (month || (end ? 12 : 1)) - 1
}

const nowMonths = () => {
  const d = new Date()
  return d.getFullYear() * 12 + d.getMonth()
}

// Total months covered by the given entries, overlapping periods counted once.
function monthsOf(items) {
  const ranges = items
    .map((e) => {
      const a = parseDate(e.start)
      const b = e.current ? nowMonths() : parseDate(e.end, true) ?? (a != null ? a + 11 : null)
      return a != null && b != null && b >= a ? [a, b + 1] : null
    })
    .filter(Boolean)
    .sort((x, y) => x[0] - y[0])
  let total = 0
  let cur = null
  for (const r of ranges) {
    if (!cur || r[0] > cur[1]) {
      if (cur) total += cur[1] - cur[0]
      cur = [...r]
    } else cur[1] = Math.max(cur[1], r[1])
  }
  if (cur) total += cur[1] - cur[0]
  return total
}

// ---------- wording helpers

const listJoin = (arr, lang) => {
  const and = lang === 'hr' ? ' i ' : ' and '
  if (arr.length <= 1) return arr.join('')
  return `${arr.slice(0, -1).join(', ')}${and}${arr[arr.length - 1]}`
}

// "više od N godina": 1–4 (not 11–14) take "godine", the rest "godina".
const hrGodina = (n) => (n % 10 >= 1 && n % 10 <= 4 && !(n % 100 >= 11 && n % 100 <= 14) ? 'godine' : 'godina')

const capFirst = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s)
const clean = (s) => String(s || '').trim()

// ---------- facts

function collectFacts(cv) {
  const lang = cv.meta.language === 'hr' ? 'hr' : 'en'
  const jobs = cv.experience.filter((e) => clean(e.role) || clean(e.company))
  const mainJobs = jobs.filter((e) => !SIDE_JOB_TYPES.includes(e.type))
  const sideJobs = jobs.filter((e) => SIDE_JOB_TYPES.includes(e.type))
  const current = jobs.find((e) => e.current && !SIDE_JOB_TYPES.includes(e.type)) || jobs.find((e) => e.current)
  const latest = current || mainJobs[0] || jobs[0]

  const edu = cv.education.filter((e) => clean(e.degree) || clean(e.school))
  const rank = ['phd', 'specialist', 'master', 'integrated', 'bachelor', 'professional', 'exchange', 'gymnasium', 'vocational', 'secondary', 'course', 'primary', '']
  const topEdu = [...edu].sort((a, b) => rank.indexOf(a.level || '') - rank.indexOf(b.level || ''))[0]
  const studying = edu.find((e) => e.current && (UNIVERSITY_LEVELS.includes(e.level) || !e.level))
  const months = monthsOf(mainJobs)
  const years = Math.floor(months / 12)

  // Technical / hard skills first, soft skills after – in the order the user entered them.
  const hard = []
  const soft = []
  for (const name of cv.skills) {
    const known = findSkill(name)
    const label = known ? skillLabel(known, lang) : name
    ;(known?.category === 'interpersonal' ? soft : hard).push(label)
  }

  const languages = cv.languages
    .map((l) => clean(l.name))
    .filter(Boolean)
    .map((n) => {
      const known = findLanguage(n)
      return known ? (lang === 'hr' ? known.hr.toLowerCase() : known.en) : n
    })

  const title =
    clean(cv.personal.title) ||
    clean(current?.role) ||
    (studying ? '' : clean(latest?.role))

  const sameAsTitle = !!current && fold(current.role) === fold(title)
  const internshipCount = sideJobs.filter((e) => e.type === 'internship').length
  const internships = internshipCount > 0
  const studentJobs = sideJobs.some((e) => e.type === 'student-job')

  return {
    lang,
    sameAsTitle,
    internships,
    internshipCount,
    studentJobs,
    title,
    years,
    months,
    current,
    latest,
    sideJobs,
    hasMainJobs: mainJobs.length > 0,
    studying,
    topEdu,
    hard: hard.slice(0, 5),
    soft: soft.slice(0, 3),
    languages,
    certs: cv.certifications.map((c) => clean(c.name)).filter(Boolean).slice(0, 2)
  }
}

export function canGenerateSummary(cv) {
  const f = collectFacts(cv)
  return !!(f.title || f.latest || f.topEdu || f.hard.length)
}

// ---------- English

function en(f, variant) {
  const s = []
  const exp =
    f.years >= 1 ? `${f.years}+ year${f.years === 1 ? '' : 's'} of experience` : f.months >= 3 ? `${f.months} months of experience` : ''
  const edu = f.topEdu
  const sideCompanies = [...new Set(f.sideJobs.map((e) => clean(e.company)).filter(Boolean))].slice(0, 2)
  const sideKind = f.internships && f.studentJobs ? 'internships and student jobs' : f.internships ? (f.internshipCount === 1 ? 'an internship' : 'internships') : f.studentJobs ? 'student jobs' : 'hands-on work'

  if (f.studying && !f.hasMainJobs) {
    // Student / entry level
    const study = [clean(f.studying.degree), clean(f.studying.school)].filter(Boolean).join(' at ')
    const deg = clean(f.studying.degree)
    const sch = clean(f.studying.school)
    if (variant === 2) {
      s.push(`I'm ${study ? `studying ${study}` : 'a student'}${f.title ? ` and working towards a role as a ${f.title}` : ''}.`)
      if (sideCompanies.length) s.push(`I've gained practical experience through ${sideKind} at ${listJoin(sideCompanies, 'en')}.`)
      if (f.hard.length) s.push(`I enjoy working with ${listJoin(f.hard.slice(0, 4), 'en')} and I'm always keen to learn more.`)
    } else {
      s.push(`${sch ? `Student at ${sch}${deg ? ` (${deg})` : ''}` : deg ? `${capFirst(deg)} student` : 'Student'}${f.title ? ` aiming for a role as ${/^[aeiou]/i.test(f.title) ? 'an' : 'a'} ${f.title}` : ''}.`)
      if (sideCompanies.length) s.push(`Practical experience gained through ${sideKind} at ${listJoin(sideCompanies, 'en')}.`)
      if (f.hard.length) s.push(`${variant === 1 ? 'Key skills' : 'Skilled in'}${variant === 1 ? ': ' : ' '}${listJoin(f.hard, 'en')}.`)
      if (variant === 0 && f.soft.length) s.push(`Known for ${listJoin(f.soft.map((x) => x.toLowerCase()), 'en')}.`)
    }
  } else if (variant === 2) {
    // First person, LinkedIn "About" style
    s.push(`I'm ${f.title ? `a ${f.title}` : 'a professional'}${exp ? ` with ${exp}` : ''}.`)
    if (f.current?.company) s.push(f.sameAsTitle || !f.current.role ? `Right now I'm part of the team at ${f.current.company}.` : `Right now I work as ${f.current.role} at ${f.current.company}.`)
    if (f.hard.length) s.push(`Most of my work involves ${listJoin(f.hard.slice(0, 4), 'en')}.`)
    if (f.soft.length) s.push(`People I work with value my ${listJoin(f.soft.map((x) => x.toLowerCase()), 'en')}.`)
  } else {
    if (f.title || exp) s.push(`${f.title ? capFirst(f.title) : 'Professional'}${exp ? ` with ${exp}` : ''}${variant === 1 && f.hard.length ? ` in ${listJoin(f.hard.slice(0, 3), 'en')}` : ''}.`)
    if (f.current?.company) s.push(f.sameAsTitle || !f.current.role ? `Currently at ${f.current.company}.` : `Currently ${f.current.role} at ${f.current.company}.`)
    else if (f.latest?.company && variant === 0) s.push(`Most recently ${clean(f.latest.role) || 'worked'} at ${f.latest.company}.`)
    if ((variant === 0 || !(f.title || exp)) && f.hard.length) s.push(`Skilled in ${listJoin(f.hard, 'en')}.`)
    if (variant === 0 && f.soft.length) s.push(`Strengths include ${listJoin(f.soft.map((x) => x.toLowerCase()), 'en')}.`)
  }

  if (variant !== 1 && edu && !(f.studying && !f.hasMainJobs)) {
    const degree = clean(edu.degree) || optionLabel(educationLevels, edu.level, 'en')
    const school = clean(edu.school)
    if (degree) s.push(`${variant === 2 ? 'I hold' : 'Holds'} ${/^(a|an|the)/i.test(degree) ? '' : /^[aeiou]/i.test(degree) ? 'an ' : 'a '}${degree}${school ? ` from ${school}` : ''}.`)
    else if (school) s.push(`${variant === 2 ? 'I studied' : 'Studied'} at ${school}.`)
  }
  if (f.certs.length && variant !== 1) s.push(`${variant === 2 ? 'Certifications I hold:' : 'Certifications:'} ${listJoin(f.certs, 'en')}.`)
  if (f.languages.length >= 2) s.push(`${variant === 2 ? 'I speak' : 'Speaks'} ${listJoin(f.languages, 'en')}.`)
  return s.join(' ')
}

// ---------- Croatian

function hr(f, variant) {
  const s = []
  const exp =
    f.years >= 1 ? `više od ${f.years} ${hrGodina(f.years)} iskustva` : f.months >= 3 ? `${f.months} mjeseci iskustva` : ''
  const edu = f.topEdu
  const eduText = edu ? [clean(edu.degree) || optionLabel(educationLevels, edu.level, 'hr'), clean(edu.school)].filter(Boolean).join(', ') : ''
  const sideCompanies = [...new Set(f.sideJobs.map((e) => clean(e.company)).filter(Boolean))].slice(0, 2)
  const sideKind = f.internships && f.studentJobs ? 'stručnu praksu i studentske poslove' : f.internships ? 'stručnu praksu' : f.studentJobs ? 'studentske poslove' : 'praktičan rad'

  if (f.studying && !f.hasMainJobs) {
    const study = [clean(f.studying.degree), clean(f.studying.school)].filter(Boolean).join(', ')
    s.push(`Trenutno studiram${study ? ` (${study})` : ''}${f.title ? ` s ciljem rada na poziciji ${f.title}` : ''}.`)
    if (sideCompanies.length) s.push(`Praktično iskustvo stječem kroz ${sideKind} u ${sideCompanies.length > 1 ? 'tvrtkama' : 'tvrtki'} ${listJoin(sideCompanies, 'hr')}.`)
    if (f.hard.length) s.push(variant === 2 ? `Najviše volim raditi s alatima i tehnologijama kao što su ${listJoin(f.hard.slice(0, 4), 'hr')}.` : `Ključne vještine: ${listJoin(f.hard, 'hr')}.`)
    if (variant === 0 && f.soft.length) s.push(`Snage: ${listJoin(f.soft.map((x) => x.toLowerCase()), 'hr')}.`)
    if (variant !== 1) s.push('Motivacija za učenje i daljnji profesionalni razvoj.')
  } else if (variant === 2) {
    s.push(`${f.title ? `Radim kao ${f.title}` : 'Profesionalac'}${exp ? ` i imam ${exp}` : ''}.`)
    if (f.current?.company) s.push(`Trenutno sam dio tima u tvrtki ${f.current.company}.`)
    if (f.hard.length) s.push(`U svakodnevnom radu koristim ${listJoin(f.hard.slice(0, 4), 'hr')}.`)
    if (f.soft.length) s.push(`Suradnici kod mene cijene ${listJoin(f.soft.map((x) => x.toLowerCase()), 'hr')}.`)
  } else {
    if (f.title || exp) s.push(`${f.title ? capFirst(f.title) : 'Stručnjak'}${exp ? ` s ${exp}` : ''}.`)
    if (f.current?.company) s.push(f.sameAsTitle || !f.current.role ? `Trenutno radim u tvrtki ${f.current.company}.` : `Trenutno radim kao ${f.current.role} u tvrtki ${f.current.company}.`)
    else if (f.latest?.company && variant === 0) s.push(`Posljednje radno iskustvo: ${[clean(f.latest.role), f.latest.company].filter(Boolean).join(', ')}.`)
    if (f.hard.length) s.push(`${variant === 1 ? 'Vještine' : 'Ključne vještine'}: ${listJoin(variant === 1 ? f.hard.slice(0, 4) : f.hard, 'hr')}.`)
    if (variant === 0 && f.soft.length) s.push(`Snage: ${listJoin(f.soft.map((x) => x.toLowerCase()), 'hr')}.`)
  }

  if (variant !== 1 && eduText && !(f.studying && !f.hasMainJobs)) s.push(`Obrazovanje: ${eduText}.`)
  if (f.certs.length && variant !== 1) s.push(`Certifikati: ${listJoin(f.certs, 'hr')}.`)
  if (f.languages.length >= 2) s.push(`Govorim ${listJoin(f.languages, 'hr')}.`)
  return s.join(' ')
}

export function generateSummary(cv, variant = 0) {
  const f = collectFacts(cv)
  const v = ((variant % SUMMARY_VARIANTS) + SUMMARY_VARIANTS) % SUMMARY_VARIANTS
  return (f.lang === 'hr' ? hr(f, v) : en(f, v)).replace(/\s+/g, ' ').replace(/\.\./g, '.').trim()
}
