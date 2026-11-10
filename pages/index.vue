<template>
  <div class="home">
    <header class="home__nav">
      <NuxtLink to="/" class="logo"><span class="logo__mark">CV</span>CV Maker</NuxtLink>
      <nav class="home__links">
        <a href="#import" class="btn btn--ghost home__link-hide">Import a CV</a>
        <a href="#features" class="btn btn--ghost home__link-hide">Features</a>
        <NuxtLink to="/cvmaker" class="btn btn--dark btn--sm">Open editor</NuxtLink>
      </nav>
    </header>

    <section class="hero">
      <div class="hero__copy">
        <p class="hero__eyebrow"><span class="hero__pulse" />Free · no sign-up · stays in your browser</p>
        <h1 class="hero__title">Build a CV that<br />gets <em>read.</em></h1>
        <p class="hero__lead">
          Start fresh, or upload the CV you already have and pick up right where you left off. Live preview, three
          templates, one-click PDF.
        </p>
        <div class="hero__ctas">
          <button type="button" class="btn btn--primary btn--lg" @click="createNew">
            Create a new CV <AppIcon name="arrow" :size="18" />
          </button>
          <a v-if="!draft" href="#import" class="btn btn--outline btn--lg">
            <AppIcon name="upload" :size="18" /> Upload existing CV
          </a>
          <NuxtLink v-else to="/cvmaker" class="btn btn--outline btn--lg hero__continue">
            <span class="hero__continue-dot" />
            Continue {{ draft.personal.fullName ? `“${firstName}”` : 'your draft' }}
          </NuxtLink>
        </div>
        <p v-if="draft" class="hero__note">Draft saved in this browser · {{ draftAge }}</p>
      </div>

      <div class="hero__visual" aria-hidden="true">
        <div class="hero__paper hero__paper--back">
          <CvThumb :cv="sampleClassic" />
        </div>
        <div class="hero__paper hero__paper--front">
          <CvThumb :cv="sample" />
        </div>
        <div class="hero__badge">
          <AppIcon name="check" :size="16" :stroke="2.4" />
          <span>Restored from <strong>ana-horvat-cv.pdf</strong></span>
        </div>
      </div>
    </section>

    <section id="import" class="import">
      <div class="import__copy">
        <p class="section-eyebrow">Already have a CV?</p>
        <h2 class="section-title">Don't start over. <em>Continue.</em></h2>
        <p class="import__lead">Drop in your previous CV and every section is filled in for you, ready to edit.</p>
        <ul class="import__list">
          <li>
            <span class="import__tick"><AppIcon name="check" :size="14" :stroke="2.6" /></span>
            <div><strong>PDFs from CV Maker</strong> come back exactly — text, photo, template and colours.</div>
          </li>
          <li>
            <span class="import__tick"><AppIcon name="check" :size="14" :stroke="2.6" /></span>
            <div><strong>Any other PDF or Word file</strong> is read and sorted into sections for you to review.</div>
          </li>
          <li>
            <span class="import__tick"><AppIcon name="check" :size="14" :stroke="2.6" /></span>
            <div><strong>Your file never leaves your device.</strong> Everything happens in the browser.</div>
          </li>
        </ul>
      </div>
      <div class="import__zone">
        <ImportDropzone @imported="onImported" />
      </div>
    </section>

    <section id="features" class="features">
      <article v-for="f in features" :key="f.title" class="features__card">
        <span class="features__icon"><AppIcon :name="f.icon" :size="20" /></span>
        <h3 class="features__title">{{ f.title }}</h3>
        <p class="features__text">{{ f.text }}</p>
      </article>
    </section>

    <footer class="home__footer">
      <span class="logo"><span class="logo__mark">CV</span>CV Maker</span>
      <span>Made with Nuxt · {{ year }}</span>
    </footer>

    <Transition name="modal">
      <div v-if="confirm" class="modal" @click.self="confirm = null">
        <div class="modal__card" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
          <h2 id="confirm-title" class="modal__title">{{ confirm.title }}</h2>
          <p class="modal__text">{{ confirm.text }}</p>
          <div class="modal__actions">
            <NuxtLink to="/cvmaker" class="btn btn--ghost">Open my draft</NuxtLink>
            <button type="button" class="btn btn--primary" @click="confirm.action()">{{ confirm.cta }}</button>
          </div>
        </div>
      </div>
    </Transition>

    <AppToasts />
  </div>
</template>

<script setup>
const { startFresh } = useCv()
const { applyImport } = useCvImport()

const sample = normalizeCv(sampleCvData)
const sampleClassic = normalizeCv({ ...sampleCvData, meta: { ...sampleCvData.meta, template: 'minimal', accent: '#0F766E' } })

const draft = ref(null)
const confirm = ref(null)
const year = new Date().getFullYear()

const firstName = computed(() => draft.value?.personal.fullName.split(' ')[0] || '')
const draftAge = computed(() => {
  const at = draft.value?.meta.updatedAt
  if (!at) return 'recently'
  const mins = Math.round((Date.now() - new Date(at).getTime()) / 60000)
  if (mins < 1) return 'edited just now'
  if (mins < 60) return `edited ${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `edited ${hours} h ago`
  return `edited ${new Date(at).toLocaleDateString()}`
})

onMounted(() => {
  draft.value = readStoredDraft()
})

function createNew() {
  const go = () => {
    startFresh()
    navigateTo('/cvmaker')
  }
  if (!draft.value) return go()
  confirm.value = {
    title: 'Start a new CV?',
    text: `You have a saved draft${firstName.value ? ` for ${firstName.value}` : ''}. Starting a new CV replaces it.`,
    cta: 'Start new',
    action: go
  }
}

function onImported(result) {
  const go = () => {
    applyImport(result)
    navigateTo('/cvmaker')
  }
  if (!draft.value) return go()
  confirm.value = {
    title: 'Replace your saved draft?',
    text: `“${result.fileName}” will replace the draft saved in this browser.`,
    cta: 'Replace draft',
    action: go
  }
}

const features = [
  { icon: 'eye', title: 'Live preview', text: 'See every keystroke on a real A4 page, with page breaks shown as you go.' },
  { icon: 'layout', title: 'Three templates', text: 'Modern, Classic and Minimal — switch any time without losing a word.' },
  { icon: 'refresh', title: 'Re-editable PDFs', text: 'Your PDF carries its own data. Upload it later and keep editing.' },
  { icon: 'lock', title: 'Private by default', text: 'No account, no server. Drafts autosave in your browser only.' }
]
</script>
