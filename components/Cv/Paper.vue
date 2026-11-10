<template>
  <div
    ref="root"
    class="cv-paper"
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

// Grow the paper in whole A4 pages so backgrounds (e.g. the sidebar) fill the last page too.
function measure() {
  const el = root.value
  if (!el) return
  const box = el.getBoundingClientRect()
  const scale = box.width / CV_PAGE.width || 1
  const ends = [...el.querySelectorAll('.cv-end')].map((e) => (e.getBoundingClientRect().top - box.top) / scale)
  const contentBottom = Math.max(0, ...ends) + 36
  const next = Math.max(1, Math.ceil(contentBottom / CV_PAGE.height))
  if (next !== pages.value) pages.value = next
  emit('pages', pages.value)
}

watch(() => props.cv, () => nextTick(measure), { deep: true })
onMounted(() => {
  measure()
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
</style>

<style>
/* Zero-specificity reset so template styles always win. */
:where(.cv-paper) :where(h1, h2, h3, h4, p) {
  margin: 0;
  font-size: inherit;
  font-weight: inherit;
}
</style>
