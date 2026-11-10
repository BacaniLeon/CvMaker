<template>
  <div class="editor" :class="`is-tab-${mobileTab}`">
    <header class="editor__bar">
      <NuxtLink to="/" class="logo" aria-label="CV Maker home">
        <span class="logo__mark">CV</span>
        <span class="editor__logo-text">CV Maker</span>
      </NuxtLink>

      <div class="editor__status" :class="`is-${saveState.status}`">
        <span class="editor__status-dot" />
        <span>{{ statusText }}</span>
      </div>

      <div class="editor__actions">
        <button type="button" class="btn btn--ghost" title="Import a CV (PDF, DOCX or JSON)" @click="importOpen = true">
          <AppIcon name="upload" :size="17" /><span class="editor__btn-label">Import</span>
        </button>
        <button type="button" class="btn btn--ghost" title="Download an editable .json backup" @click="exportJson(cv)">
          <AppIcon name="download" :size="17" /><span class="editor__btn-label">Backup</span>
        </button>
        <button type="button" class="btn btn--primary" :disabled="exporting" @click="downloadPdf">
          <span v-if="exporting" class="spinner" />
          <AppIcon v-else name="file" :size="17" />
          <span>{{ exporting ? 'Preparing…' : 'Download PDF' }}</span>
        </button>
      </div>
    </header>

    <div class="editor__layout">
      <!-- ============ FORM ============ -->
      <div class="editor__form">
        <div class="editor__intro">
          <div>
            <h1 class="editor__heading">Your CV</h1>
            <p class="editor__lead">Every change saves automatically in this browser.</p>
          </div>
          <div class="meter" :title="`${completeness}% complete`">
            <svg viewBox="0 0 36 36" class="meter__ring">
              <circle cx="18" cy="18" r="15.5" class="meter__track" />
              <circle cx="18" cy="18" r="15.5" class="meter__fill" :style="{ strokeDashoffset: 97.4 - (97.4 * completeness) / 100 }" />
            </svg>
            <span class="meter__value">{{ completeness }}%</span>
          </div>
        </div>

        <EditorSection title="Personal details" subtitle="Name, title and how to reach you" icon="user" default-open>
          <div class="photo">
            <button type="button" class="photo__preview" :style="cv.personal.photo ? { backgroundImage: `url(${cv.personal.photo})` } : {}" @click="photoInput?.click()">
              <AppIcon v-if="!cv.personal.photo" name="camera" :size="22" />
            </button>
            <div class="photo__text">
              <p class="photo__title">Photo <span>(optional)</span></p>
              <div class="photo__actions">
                <button type="button" class="btn btn--outline btn--sm" @click="photoInput?.click()">
                  {{ cv.personal.photo ? 'Change' : 'Upload' }}
                </button>
                <button v-if="cv.personal.photo" type="button" class="btn btn--danger btn--sm" @click="cv.personal.photo = ''">Remove</button>
              </div>
            </div>
            <input ref="photoInput" type="file" accept="image/*" hidden @change="onPhoto" />
          </div>

          <div class="grid">
            <label class="field">
              <span class="field__label">Full name</span>
              <input v-model="cv.personal.fullName" class="input" placeholder="Ana Horvat" autocomplete="name" />
            </label>
            <label class="field">
              <span class="field__label">Professional title</span>
              <input v-model="cv.personal.title" class="input" placeholder="Frontend Developer" />
            </label>
            <label class="field">
              <span class="field__label">Email</span>
              <input v-model="cv.personal.email" class="input" type="email" placeholder="ana@example.com" autocomplete="email" />
            </label>
            <label class="field">
              <span class="field__label">Phone</span>
              <input v-model="cv.personal.phone" class="input" type="tel" placeholder="+385 91 234 5678" autocomplete="tel" />
            </label>
            <label class="field">
              <span class="field__label">Location</span>
              <input v-model="cv.personal.location" class="input" placeholder="Zagreb, Croatia" />
            </label>
            <label class="field">
              <span class="field__label">Website</span>
              <input v-model="cv.personal.website" class="input" placeholder="anahorvat.dev" />
            </label>
            <label class="field field--full">
              <span class="field__label">LinkedIn</span>
              <input v-model="cv.personal.linkedin" class="input" placeholder="linkedin.com/in/anahorvat" />
            </label>
          </div>
        </EditorSection>

        <EditorSection title="Profile" subtitle="A short summary of who you are" icon="text">
          <label class="field">
            <textarea
              v-model="cv.summary"
              class="input"
              rows="5"
              placeholder="Frontend developer with 4 years of experience building fast, accessible web apps with Vue and Nuxt…"
            />
            <span class="field__hint editor__counter" :class="{ 'is-long': cv.summary.length > 600 }">
              {{ cv.summary.length }} characters · 300–600 reads best
            </span>
          </label>
        </EditorSection>

        <EditorSection title="Experience" subtitle="Jobs, internships, projects" icon="briefcase" :count="cv.experience.length">
          <EditorEntryList
            list-key="experience"
            noun="position"
            :primary="{ key: 'role', label: 'Job title', placeholder: 'Frontend Developer' }"
            :secondary="{ key: 'company', label: 'Company', placeholder: 'Acme d.o.o.' }"
            desc-placeholder="- Rebuilt the checkout in Nuxt, cutting load time by 40%&#10;- Mentored two junior developers"
          />
        </EditorSection>

        <EditorSection title="Education" subtitle="Schools, degrees, courses" icon="cap" :count="cv.education.length">
          <EditorEntryList
            list-key="education"
            noun="education"
            :primary="{ key: 'degree', label: 'Degree / programme', placeholder: 'BSc Computer Science' }"
            :secondary="{ key: 'school', label: 'School', placeholder: 'University of Zagreb' }"
            current-label="I'm still studying here"
            desc-placeholder="Thesis, awards, relevant courses…"
          />
        </EditorSection>

        <EditorSection title="Skills" subtitle="Press Enter or comma after each one" icon="spark" :count="cv.skills.length">
          <EditorTagInput v-model="cv.skills" placeholder="e.g. Vue.js — then press Enter" />
        </EditorSection>

        <EditorSection title="Languages" icon="globe" :count="cv.languages.length">
          <div class="rows">
            <div v-for="(l, i) in cv.languages" :key="l.id" class="rows__row">
              <input v-model="l.name" class="input" placeholder="Language" aria-label="Language" />
              <input v-model="l.level" class="input" list="language-levels" placeholder="Level" aria-label="Level" />
              <button type="button" class="btn btn--icon" aria-label="Remove language" @click="removeItem('languages', i)">
                <AppIcon name="trash" :size="16" />
              </button>
            </div>
            <datalist id="language-levels">
              <option v-for="lvl in languageLevels" :key="lvl" :value="lvl" />
            </datalist>
            <button type="button" class="entries__add" @click="addItem('languages')">
              <AppIcon name="plus" :size="16" /> Add language
            </button>
          </div>
        </EditorSection>

        <EditorSection title="Certifications" subtitle="Certificates, courses, awards" icon="award" :count="cv.certifications.length">
          <div class="rows">
            <div v-for="(c, i) in cv.certifications" :key="c.id" class="rows__row rows__row--cert">
              <input v-model="c.name" class="input" placeholder="Name" aria-label="Certification name" />
              <input v-model="c.issuer" class="input" placeholder="Issuer" aria-label="Issuer" />
              <input v-model="c.date" class="input" placeholder="Year" aria-label="Year" />
              <button type="button" class="btn btn--icon" aria-label="Remove certification" @click="removeItem('certifications', i)">
                <AppIcon name="trash" :size="16" />
              </button>
            </div>
            <button type="button" class="entries__add" @click="addItem('certifications')">
              <AppIcon name="plus" :size="16" /> Add certification
            </button>
          </div>
        </EditorSection>

        <div class="editor__footer">
          <button type="button" class="btn btn--danger btn--sm" @click="resetOpen = true">
            <AppIcon name="refresh" :size="15" /> Start over
          </button>
        </div>
      </div>

      <!-- ============ PREVIEW ============ -->
      <div class="editor__preview">
        <div class="toolbar">
          <div class="segmented" role="radiogroup" aria-label="Template">
            <button
              v-for="tpl in cvTemplates"
              :key="tpl.id"
              type="button"
              role="radio"
              :aria-checked="cv.meta.template === tpl.id"
              :class="{ 'is-active': cv.meta.template === tpl.id }"
              :title="tpl.hint"
              @click="cv.meta.template = tpl.id"
            >
              {{ tpl.name }}
            </button>
          </div>

          <div class="swatches" role="radiogroup" aria-label="Accent colour">
            <button
              v-for="c in cvAccents"
              :key="c"
              type="button"
              class="swatches__swatch"
              :class="{ 'is-active': cv.meta.accent.toLowerCase() === c.toLowerCase() }"
              :style="{ background: c }"
              :aria-label="`Accent ${c}`"
              @click="cv.meta.accent = c"
            />
            <label class="swatches__custom" :class="{ 'is-active': !isPresetAccent }" title="Custom colour">
              <input v-model="cv.meta.accent" type="color" aria-label="Custom accent colour" />
              <AppIcon name="palette" :size="14" />
            </label>
          </div>

          <div class="toolbar__group">
            <select v-model="cv.meta.font" class="toolbar__select" aria-label="Font">
              <option v-for="(f, key) in cvFonts" :key="key" :value="key">{{ f.name }}</option>
            </select>
            <div class="segmented segmented--sm" role="radiogroup" aria-label="CV language">
              <button type="button" :class="{ 'is-active': cv.meta.language === 'en' }" @click="cv.meta.language = 'en'">EN</button>
              <button type="button" :class="{ 'is-active': cv.meta.language === 'hr' }" @click="cv.meta.language = 'hr'">HR</button>
            </div>
          </div>
        </div>

        <div ref="stage" class="stage">
          <div class="stage__scaler" :style="{ width: `${CV_PAGE.width * scale}px`, height: `${pages * CV_PAGE.height * scale}px` }">
            <div class="stage__inner" :style="{ transform: `scale(${scale})` }">
              <CvPaper ref="paper" :cv="cv" @pages="pages = $event" />
              <div v-for="n in pages - 1" :key="n" class="stage__break" :style="{ top: `${n * CV_PAGE.height}px` }">
                <span>Page {{ n + 1 }}</span>
              </div>
            </div>
          </div>
          <p class="stage__note">A4 · {{ pages }} {{ pages === 1 ? 'page' : 'pages' }}</p>
        </div>
      </div>
    </div>

    <!-- Mobile tab bar -->
    <nav class="editor__tabs" aria-label="Editor view">
      <button type="button" :class="{ 'is-active': mobileTab === 'edit' }" @click="mobileTab = 'edit'">
        <AppIcon name="edit" :size="18" /> Edit
      </button>
      <button type="button" :class="{ 'is-active': mobileTab === 'preview' }" @click="showPreview">
        <AppIcon name="eye" :size="18" /> Preview
      </button>
    </nav>

    <!-- Import modal -->
    <Transition name="modal">
      <div v-if="importOpen" class="modal" @click.self="importOpen = false">
        <div class="modal__card" role="dialog" aria-modal="true" aria-labelledby="import-title">
          <button type="button" class="btn btn--icon modal__close" aria-label="Close" @click="importOpen = false">
            <AppIcon name="x" :size="18" />
          </button>
          <template v-if="!pendingImport">
            <h2 id="import-title" class="modal__title">Import a CV</h2>
            <p class="modal__text">Continue from a CV you already have. Your current CV is replaced, so download a backup first if you want to keep it.</p>
            <ImportDropzone title="Drop your CV here" @imported="onImported" />
          </template>
          <template v-else>
            <h2 id="import-title" class="modal__title">Replace your current CV?</h2>
            <p class="modal__text">
              “{{ pendingImport.fileName }}” will replace what's in the editor now. This can't be undone unless you have a backup.
            </p>
            <div class="modal__actions">
              <button type="button" class="btn btn--ghost" @click="exportJson(cv)">Download backup first</button>
              <button type="button" class="btn btn--primary" @click="confirmImport">Replace</button>
            </div>
          </template>
        </div>
      </div>
    </Transition>

    <!-- Reset modal -->
    <Transition name="modal">
      <div v-if="resetOpen" class="modal" @click.self="resetOpen = false">
        <div class="modal__card" role="alertdialog" aria-modal="true" aria-labelledby="reset-title">
          <h2 id="reset-title" class="modal__title">Start over?</h2>
          <p class="modal__text">This clears every field. Download a backup first if you might want this CV again.</p>
          <div class="modal__actions">
            <button type="button" class="btn btn--ghost" @click="resetOpen = false">Cancel</button>
            <button type="button" class="btn btn--dark" @click="doReset">Clear everything</button>
          </div>
        </div>
      </div>
    </Transition>

    <AppToasts />
  </div>
</template>

<script setup>
useHead({ title: 'Editor — CV Maker' })

const { cv, saveState, hydrate, persist, startFresh, addItem, removeItem } = useCv()
const { applyImport } = useCvImport()
const { toast } = useToast()

hydrate()

const languageLevels = ['Native', 'Fluent', 'C2', 'C1', 'B2', 'B1', 'A2', 'A1', 'Basic']
const isPresetAccent = computed(() => cvAccents.some((c) => c.toLowerCase() === cv.value.meta.accent.toLowerCase()))

/* ---------- autosave */
let saveTimer = null
let fromOtherTab = false
const pending = ref(false)
watch(
  cv,
  () => {
    if (fromOtherTab) {
      fromOtherTab = false
      return
    }
    pending.value = true
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      persist()
      pending.value = false
    }, 450)
  },
  { deep: true }
)

const now = ref(Date.now())
let clock = null
const statusText = computed(() => {
  if (pending.value) return 'Saving…'
  if (saveState.value.status === 'error') return 'Not saved — try a smaller photo'
  if (!saveState.value.at) return 'Saved in this browser'
  const s = Math.round((now.value - saveState.value.at) / 1000)
  if (s < 10) return 'Saved just now'
  if (s < 60) return `Saved ${s}s ago`
  return `Saved ${Math.round(s / 60)} min ago`
})

/* ---------- completeness */
const completeness = computed(() => {
  const c = cv.value
  const checks = [
    c.personal.fullName, c.personal.title, c.personal.email, c.personal.phone, c.personal.location,
    c.summary.length > 80, c.experience.length, c.education.length, c.skills.length >= 3,
    c.languages.length, c.personal.photo || c.certifications.length
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
})

/* ---------- photo */
const photoInput = ref(null)
async function onPhoto(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  try {
    cv.value.personal.photo = await readPhoto(file)
  } catch (err) {
    toast({ type: 'error', title: 'Photo not added', text: err.message })
  }
}

/* ---------- preview scaling */
const stage = ref(null)
const paper = ref(null)
const scale = ref(0.7)
const pages = ref(1)
let ro = null

function fit() {
  if (!stage.value) return
  const styles = getComputedStyle(stage.value)
  const avail = stage.value.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight)
  scale.value = Math.max(0.2, Math.min(1.1, avail / CV_PAGE.width))
}

const mobileTab = ref('edit')
function showPreview() {
  mobileTab.value = 'preview'
  nextTick(fit)
}

/* ---------- import */
const importOpen = ref(false)
const pendingImport = ref(null)

function onImported(result) {
  if (isCvEmpty(cv.value)) {
    applyImport(result)
    importOpen.value = false
  } else {
    pendingImport.value = result
  }
}

function confirmImport() {
  applyImport(pendingImport.value)
  pendingImport.value = null
  importOpen.value = false
}

watch(importOpen, (open) => {
  if (!open) pendingImport.value = null
})

/* ---------- export */
const exporting = ref(false)
async function downloadPdf() {
  if (exporting.value) return
  exporting.value = true
  try {
    await exportPdf(paper.value.root, cv.value)
    toast({ title: 'PDF downloaded', text: 'Upload this PDF here any time to keep editing it.' })
  } catch (err) {
    console.error(err)
    toast({ type: 'error', title: 'Export failed', text: 'Something went wrong while creating the PDF. Please try again.' })
  } finally {
    exporting.value = false
  }
}

/* ---------- reset */
const resetOpen = ref(false)
function doReset() {
  startFresh()
  resetOpen.value = false
  toast({ title: 'Started a fresh CV' })
}

/* ---------- keep several open tabs in sync instead of overwriting each other */
function onStorage(e) {
  if (e.key !== DRAFT_STORAGE_KEY || !e.newValue) return
  try {
    const next = normalizeCv(JSON.parse(e.newValue))
    fromOtherTab = true
    clearTimeout(saveTimer)
    pending.value = false
    cv.value = next
  } catch {
    // ignore malformed data
  }
}

/* ---------- keyboard + lifecycle */
function onKey(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault()
    persist()
    toast({ title: 'Saved in this browser', text: 'Use “Backup” or “Download PDF” to keep a copy.', timeout: 3000 })
  }
  if (e.key === 'Escape') {
    importOpen.value = false
    resetOpen.value = false
  }
}

onMounted(() => {
  fit()
  ro = new ResizeObserver(fit)
  ro.observe(stage.value)
  clock = setInterval(() => (now.value = Date.now()), 5000)
  window.addEventListener('keydown', onKey)
  window.addEventListener('storage', onStorage)
})

onBeforeUnmount(() => {
  ro?.disconnect()
  clearInterval(clock)
  clearTimeout(saveTimer)
  if (pending.value) persist()
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('storage', onStorage)
})
</script>
