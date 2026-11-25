<template>
  <div ref="box" class="tags" @click="field?.focus()">
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
      role="combobox"
      :aria-expanded="suggest.open.value && suggest.items.value.length > 0"
      aria-autocomplete="list"
      autocomplete="off"
      @keydown="onKey"
      @input="suggest.open.value = !!source"
      @focus="suggest.open.value = !!source && !!draft"
      @blur="onBlur"
      @paste="onPaste"
    />
  </div>
  <EditorSuggestMenu
    v-if="source"
    :anchor="box"
    :open="suggest.open.value"
    :items="suggest.items.value"
    :active="suggest.active.value"
    :query="draft"
    @hover="suggest.active.value = $event"
    @pick="suggest.pick"
  />
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Array, required: true },
  placeholder: { type: String, default: 'Type and press Enter' },
  // (query) => [{ kind: 'skill' | 'language', value, label, hint, score }]
  source: { type: Function, default: null }
})
const emit = defineEmits(['update:modelValue', 'language'])
const box = ref(null)
const field = ref(null)
const draft = ref('')

const suggest = useSuggest(
  () => (props.source && draft.value.trim() ? props.source(draft.value) : []),
  (item) => {
    if (item.kind === 'language') emit('language', item.value)
    else add([item.value])
    draft.value = ''
    suggest.open.value = false
    field.value?.focus()
  }
)

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
  suggest.open.value = false
}

function remove(i) {
  const next = [...props.modelValue]
  next.splice(i, 1)
  emit('update:modelValue', next)
}

function onKey(e) {
  if (suggest.onKeydown(e)) return
  if (e.key === 'Enter') {
    e.preventDefault()
    commit()
  } else if (e.key === ',') {
    e.preventDefault()
    commit()
  } else if (e.key === 'Backspace' && !draft.value && props.modelValue.length) {
    remove(props.modelValue.length - 1)
  }
}

function onBlur() {
  suggest.open.value = false
  commit()
}

function onPaste(e) {
  const text = e.clipboardData?.getData('text') || ''
  if (/[,\n;]/.test(text)) {
    e.preventDefault()
    add(text.split(/[,\n;]/))
  }
}

defineExpose({ focus: () => field.value?.focus() })
</script>
