<template>
  <div class="tags" @click="field?.focus()">
    <TransitionGroup name="tag">
      <span v-for="(tag, i) in modelValue" :key="tag" class="tags__tag">
        {{ tag }}
        <button type="button" class="tags__remove" :aria-label="`Remove ${tag}`" @click.stop="remove(i)">
          <AppIcon name="x" :size="12" :stroke="2.4" />
        </button>
      </span>
    </TransitionGroup>
    <input
      ref="field"
      v-model="draft"
      class="tags__input"
      :placeholder="modelValue.length ? 'Add another…' : placeholder"
      @keydown.enter.prevent="commit"
      @keydown="onKey"
      @blur="commit"
      @paste="onPaste"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Array, required: true },
  placeholder: { type: String, default: 'Type and press Enter' }
})
const emit = defineEmits(['update:modelValue'])
const field = ref(null)
const draft = ref('')

function add(values) {
  const next = [...props.modelValue]
  for (const raw of values) {
    const v = raw.trim()
    if (v && !next.some((t) => t.toLowerCase() === v.toLowerCase())) next.push(v)
  }
  emit('update:modelValue', next)
}

function commit() {
  if (draft.value.trim()) add(draft.value.split(','))
  draft.value = ''
}

function remove(i) {
  const next = [...props.modelValue]
  next.splice(i, 1)
  emit('update:modelValue', next)
}

function onKey(e) {
  if (e.key === ',') {
    e.preventDefault()
    commit()
  } else if (e.key === 'Backspace' && !draft.value && props.modelValue.length) {
    remove(props.modelValue.length - 1)
  }
}

function onPaste(e) {
  const text = e.clipboardData?.getData('text') || ''
  if (/[,\n;]/.test(text)) {
    e.preventDefault()
    add(text.split(/[,\n;]/))
  }
}
</script>
