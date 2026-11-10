<template>
  <Transition name="modal">
    <div v-if="open" class="modal" @click.self="emit('close')">
      <div class="modal__card modal__card--wide" role="dialog" aria-modal="true" aria-labelledby="import-modal-title">
        <button type="button" class="btn btn--icon modal__close" aria-label="Close" @click="emit('close')">
          <AppIcon name="x" :size="18" />
        </button>

        <div class="segmented import-modal__tabs" role="tablist">
          <button type="button" role="tab" :aria-selected="view === 'file'" :class="{ 'is-active': view === 'file' }" @click="view = 'file'">
            <AppIcon name="file" :size="15" /> CV file
          </button>
          <button type="button" role="tab" :aria-selected="view === 'linkedin'" :class="{ 'is-active': view === 'linkedin' }" @click="view = 'linkedin'">
            <AppIcon name="linkedin" :size="15" /> From LinkedIn
          </button>
        </div>

        <template v-if="view === 'file'">
          <h2 id="import-modal-title" class="modal__title">Import a CV</h2>
          <p class="modal__text">Continue from a CV you already have — a PDF, Word file or CV Maker backup.</p>
          <ImportDropzone title="Drop your CV here" @imported="emit('imported', $event)" />
        </template>

        <template v-else>
          <h2 id="import-modal-title" class="modal__title">Build your CV from LinkedIn</h2>
          <p class="modal__text">
            LinkedIn doesn't let other apps read your profile, but it lets you download it. Pick one, then drop the file below.
          </p>

          <div class="li-options" role="radiogroup" aria-label="LinkedIn import method">
            <button
              v-for="opt in options"
              :key="opt.id"
              type="button"
              role="radio"
              class="li-options__card"
              :class="{ 'is-active': method === opt.id }"
              :aria-checked="method === opt.id"
              @click="method = opt.id"
            >
              <span class="li-options__badge">{{ opt.badge }}</span>
              <span class="li-options__title">{{ opt.title }}</span>
              <span class="li-options__text">{{ opt.text }}</span>
            </button>
          </div>

          <ol class="li-steps">
            <li v-for="(step, i) in current.steps" :key="i" v-html="step" />
          </ol>
          <a :href="current.link" target="_blank" rel="noopener noreferrer" class="btn btn--outline btn--sm li-steps__link">
            {{ current.linkLabel }} <AppIcon name="arrow" :size="14" />
          </a>

          <ImportDropzone
            class="li-drop"
            :title="current.drop"
            text="Your file is read in this browser and never uploaded anywhere."
            :types="[current.type]"
            @imported="emit('imported', $event)"
          />
        </template>
      </div>
    </div>
  </Transition>
</template>

<script setup>
const props = defineProps({
  open: { type: Boolean, default: false },
  initialView: { type: String, default: 'file' }
})
const emit = defineEmits(['close', 'imported'])

const view = ref(props.initialView)
const method = ref('pdf')
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) view.value = props.initialView
  }
)

const options = [
  { id: 'pdf', badge: '≈ 1 minute', title: 'Profile PDF', text: 'Quickest. Experience, education, skills and languages.' },
  { id: 'zip', badge: 'Most complete', title: 'Data export', text: 'Exact fields, incl. phone and certifications. Takes ~10 min.' }
]

const guides = {
  pdf: {
    steps: [
      'Open <strong>your LinkedIn profile</strong> on a computer.',
      'Click <strong>Resources</strong> (or <strong>More</strong>) under your name, then <strong>Save to PDF</strong>.',
      'Drop the downloaded PDF here.'
    ],
    link: 'https://www.linkedin.com/in/me/',
    linkLabel: 'Open my LinkedIn profile',
    drop: 'Drop your LinkedIn PDF',
    type: 'PDF'
  },
  zip: {
    steps: [
      'Go to <strong>Settings &amp; Privacy → Data privacy → Get a copy of your data</strong>.',
      'Choose <strong>Want something in particular?</strong> and tick <strong>Profile, Positions, Education, Skills, Languages, Certifications, Email addresses</strong> and <strong>Phone numbers</strong>.',
      'Click <strong>Request archive</strong>. LinkedIn emails you a link, usually within 10 minutes.',
      'Download the ZIP and drop it here <strong>without unzipping it</strong>.'
    ],
    link: 'https://www.linkedin.com/mypreferences/d/download-my-data',
    linkLabel: 'Open LinkedIn data download',
    drop: 'Drop your LinkedIn ZIP',
    type: 'ZIP'
  }
}
const current = computed(() => guides[method.value])
</script>
