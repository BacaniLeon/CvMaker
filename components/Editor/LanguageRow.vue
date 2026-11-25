<template>
  <div class="rows__row">
    <input
      ref="nameInput"
      v-model="item.name"
      class="input"
      placeholder="Language"
      aria-label="Language"
      role="combobox"
      :aria-expanded="suggest.open.value && suggest.items.value.length > 0"
      aria-autocomplete="list"
      autocomplete="off"
      @input="suggest.open.value = true"
      @focus="suggest.open.value = true"
      @blur="suggest.open.value = false"
      @keydown="onKey"
    />
    <input
      ref="levelInput"
      v-model="item.level"
      class="input"
      list="language-levels"
      placeholder="Level"
      aria-label="Level"
    />
    <button type="button" class="btn btn--icon" aria-label="Remove language" @click="$emit('remove')">
      <AppIcon name="trash" :size="16" />
    </button>
  </div>
  <EditorSuggestMenu
    :anchor="nameInput"
    :open="suggest.open.value"
    :items="suggest.items.value"
    :active="suggest.active.value"
    :query="item.name"
    @hover="suggest.active.value = $event"
    @pick="suggest.pick"
  />
</template>

<script setup>
const props = defineProps({
  item: { type: Object, required: true },
  lang: { type: String, default: 'en' },
  taken: { type: Array, default: () => [] }
})
defineEmits(['remove'])
const nameInput = ref(null)
const levelInput = ref(null)

const suggest = useSuggest(
  () => {
    // Nothing to suggest once the field already holds a known language name.
    const exact = findLanguage(props.item.name)
    if (exact && fold(props.lang === 'hr' ? exact.hr : exact.en) === fold(props.item.name)) return []
    return searchLanguages(props.item.name, { lang: props.lang, exclude: props.taken })
  },
  (pick) => {
    props.item.name = pick.value
    suggest.open.value = false
    levelInput.value?.focus()
  }
)

function onKey(e) {
  suggest.onKeydown(e)
}

defineExpose({
  focusName: () => nameInput.value?.focus(),
  focusLevel: () => levelInput.value?.focus()
})
</script>
