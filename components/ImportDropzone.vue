<template>
  <div
    class="dropzone"
    :class="{ 'is-dragging': dragging, 'is-busy': busy }"
    role="button"
    tabindex="0"
    :aria-busy="busy"
    @click="pick"
    @keydown.enter.prevent="pick"
    @keydown.space.prevent="pick"
    @dragenter.prevent="dragging = true"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="onLeave"
    @drop.prevent="onDrop"
  >
    <input ref="input" type="file" :accept="ACCEPTED_IMPORT_TYPES" @change="onPick" />
    <div class="dropzone__icon">
      <span v-if="busy" class="spinner" />
      <AppIcon v-else name="upload" :size="22" />
    </div>
    <p class="dropzone__title">{{ busy ? 'Reading your CV…' : title }}</p>
    <p class="dropzone__text">{{ text }}</p>
    <div class="dropzone__types"><span v-for="t in types" :key="t">{{ t }}</span></div>
    <p v-if="error" class="dropzone__error" @click.stop>
      <AppIcon name="alert" :size="15" />
      <span>{{ error }}</span>
    </p>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'Upload your existing CV' },
  text: {
    type: String,
    default: 'Drag & drop or click to choose. PDFs made with CV Maker restore every field, photo and style exactly.'
  },
  types: { type: Array, default: () => ['PDF', 'DOCX', 'JSON', 'LinkedIn'] }
})
const emit = defineEmits(['imported'])

const input = ref(null)
const dragging = ref(false)
const busy = ref(false)
const error = ref('')

function pick() {
  if (!busy.value) input.value?.click()
}

function onLeave(e) {
  if (!e.currentTarget.contains(e.relatedTarget)) dragging.value = false
}

function onDrop(e) {
  dragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) handle(file)
}

function onPick(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (file) handle(file)
}

async function handle(file) {
  if (busy.value) return
  error.value = ''
  // LinkedIn archives can be large (only the CSVs inside are read).
  const limit = /\.zip$/i.test(file.name) ? 200 : 25
  if (file.size > limit * 1024 * 1024) {
    error.value = `That file is over ${limit} MB. Please upload a smaller file.`
    return
  }
  busy.value = true
  try {
    const result = await importCvFile(file)
    emit('imported', { ...result, fileName: file.name })
  } catch (e) {
    console.error(e)
    error.value = e instanceof ImportError ? e.message : 'Something went wrong while reading that file. Please try another one.'
  } finally {
    busy.value = false
  }
}

defineExpose({ pick })
</script>
