<template>
  <div
    ref="root"
    class="cv-paper"
    :class="{ 'has-name': !!cv.personal.fullName.trim() }"
    :style="{ fontFamily: view.font, minHeight: `${pages * CV_PAGE.height}px`, width: `${CV_PAGE.width}px` }"
  >
    <component :is="templates[cv.meta.template] || templates.modern" :v="view" />
  </div>
</template>

<script setup>
const props = defineProps({ cv: { type: Object, required: true } })
const emit = defineEmits(['pages'])

// TemplateExecutive.vue -> "executive"
const templates = Object.fromEntries(
  Object.entries(import.meta.glob('./Template*.vue', { eager: true, import: 'default' })).map(([path, comp]) => [
    path.match(/Template(\w+)\.vue$/)[1].toLowerCase(),
    comp
  ])
)
const view = computed(() => buildCvView(props.cv))
const root = ref(null)
const pages = ref(1)

// ---------- section order
// Templates mark their sections with .cv-sec--<key>. With the default order nothing is touched,
// so every template looks exactly as designed. With a custom order the columns become flex
// columns and children get a CSS `order`: sections by their rank, a wrapper holding several
// sections (e.g. a skills/languages grid) moves with its earliest section, anything before the
// first section (header, photo) stays on top and the .cv-end marker stays last.
const order = computed(() => normalizeSectionOrder(props.cv.meta.sectionOrder))
const isDefaultOrder = computed(() => order.value.join() === DEFAULT_SECTION_ORDER.join())

function applyOrder() {
  const el = root.value
  if (!el) return
  const flowed = el.querySelectorAll('[data-cv-flow]')
  if (isDefaultOrder.value) {
    flowed.forEach((p) => {
      delete p.dataset.cvFlow
      for (const c of p.children) c.style.order = ''
    })
    return
  }
  const rank = Object.fromEntries(order.value.map((k, i) => [k, i + 1]))
  const keyOf = (node) => [...node.classList].find((c) => c.startsWith('cv-sec--'))?.slice(8)
  const parents = new Set([...el.querySelectorAll('.cv-sec')].map((s) => s.parentElement))
  for (const p of parents) {
    if (p.dataset.cvFlow === undefined && getComputedStyle(p).display === 'block') p.dataset.cvFlow = ''
    let afterFirst = false
    for (const child of p.children) {
      let o
      if (child.classList.contains('cv-sec')) {
        o = rank[keyOf(child)] ?? 50
        afterFirst = true
      } else if (child.querySelector('.cv-sec')) {
        o = Math.min(...[...child.querySelectorAll('.cv-sec')].map((s) => rank[keyOf(s)] ?? 50))
        afterFirst = true
      } else if (child.classList.contains('cv-end')) o = 99
      else o = afterFirst ? 98 : 0
      child.style.order = String(o)
    }
  }
}

// Grow the paper in whole A4 pages so backgrounds (e.g. the sidebar) fill the last page too.
function measure() {
  const el = root.value
  if (!el) return
  applyOrder()
  const box = el.getBoundingClientRect()
  const scale = box.width / CV_PAGE.width || 1
  const ends = [...el.querySelectorAll('.cv-end')].map((e) => (e.getBoundingClientRect().top - box.top) / scale)
  const contentBottom = Math.max(0, ...ends) + 36
  const next = Math.max(1, Math.ceil(contentBottom / CV_PAGE.height))
  if (next !== pages.value) pages.value = next
  emit('pages', pages.value)
}

watch(() => props.cv, () => nextTick(measure), { deep: true })
// Fonts other than the default few are downloaded on first use; re-measure once they arrive (line breaks change).
watch(() => props.cv.meta.font, (key) => loadCvFont(key).then(() => nextTick(measure)))
onMounted(() => {
  measure()
  loadCvFont(props.cv.meta.font).then(measure)
  document.fonts?.ready.then(measure)
})

defineExpose({ root, measure })
</script>

<style scoped>
.cv-paper {
  position: relative;
  background: #fff;
  color: #1f2430;
  font-size: 12.5px;
  line-height: 1.5;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}
.cv-paper :deep(*) {
  box-sizing: border-box;
}
.cv-paper :deep(.cv-end) {
  display: block;
  height: 0;
}
.cv-paper :deep(.is-placeholder) {
  opacity: 0.28;
}
/* Optional fields: once a name is in, an empty title is simply left out. Never print placeholders. */
.cv-paper.has-name :deep(.is-placeholder),
.cv-paper[data-exporting] :deep(.is-placeholder) {
  display: none;
}
.cv-paper :deep([data-cv-flow]) {
  display: flex !important;
  flex-direction: column;
}
</style>

<style>
/* Zero-specificity reset so template styles always win. */
:where(.cv-paper) :where(h1, h2, h3, h4, p) {
  margin: 0;
  font-size: inherit;
  font-weight: inherit;
}
</style>
