<template>
  <div class="entries">
    <TransitionGroup name="entry" tag="div" class="entries__list">
      <div v-for="(item, i) in cv[listKey]" :key="item.id" class="entry" :class="{ 'is-open': openId === item.id }">
        <div class="entry__head">
          <button type="button" class="entry__toggle" @click="toggle(item.id)">
            <AppIcon name="chevron" :size="16" class="entry__chevron" />
            <span class="entry__titles">
              <span class="entry__title" :class="{ 'is-empty': !item[primary.key] }">
                {{ item[primary.key] || `Untitled ${noun}` }}
              </span>
              <span class="entry__meta">{{ metaLine(item) }}</span>
            </span>
          </button>
          <div class="entry__tools">
            <button type="button" class="btn btn--icon" :disabled="i === 0" aria-label="Move up" @click="moveItem(listKey, i, -1)">
              <AppIcon name="up" :size="16" />
            </button>
            <button type="button" class="btn btn--icon" :disabled="i === cv[listKey].length - 1" aria-label="Move down" @click="moveItem(listKey, i, 1)">
              <AppIcon name="down" :size="16" />
            </button>
            <button type="button" class="btn btn--icon entry__delete" aria-label="Delete" @click="removeItem(listKey, i)">
              <AppIcon name="trash" :size="16" />
            </button>
          </div>
        </div>

        <div class="entry__body-wrap">
          <div class="entry__body-inner">
            <div class="entry__body grid">
              <label class="field">
                <span class="field__label">{{ primary.label }}</span>
                <input v-model="item[primary.key]" class="input" :placeholder="primary.placeholder" @blur="guessKind(item)" />
              </label>
              <label class="field">
                <span class="field__label">{{ secondary.label }}</span>
                <input v-model="item[secondary.key]" class="input" :placeholder="secondary.placeholder" @blur="guessKind(item)" />
              </label>
              <label v-if="kind" class="field">
                <span class="field__label">{{ kind.label }}</span>
                <select v-model="item[kind.key]" class="input" :class="{ 'is-empty': !item[kind.key] }">
                  <option value="">{{ kind.placeholder || 'Select…' }}</option>
                  <option v-for="o in kind.options" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>
              </label>
              <label class="field">
                <span class="field__label">Location</span>
                <input v-model="item.location" class="input" placeholder="City, country" />
              </label>
              <label class="field">
                <span class="field__label">Start</span>
                <input v-model="item.start" class="input" placeholder="e.g. 09/2021" />
              </label>
              <label class="field">
                <span class="field__label">End</span>
                <input v-model="item.end" class="input" :disabled="item.current" :placeholder="item.current ? 'Present' : 'e.g. 06/2024'" />
              </label>
              <div class="field field--full entry__current">
                <label class="checkbox"><input v-model="item.current" type="checkbox" /> {{ currentLabel }}</label>
              </div>
              <label class="field field--full">
                <span class="field__label">Description</span>
                <textarea v-model="item.description" class="input" rows="4" :placeholder="descPlaceholder" />
                <span class="field__hint">Start a line with “-” to make it a bullet point.</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <button type="button" class="entries__add" @click="add">
      <AppIcon name="plus" :size="16" /> Add {{ noun }}
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  listKey: { type: String, required: true },
  noun: { type: String, required: true },
  primary: { type: Object, required: true },
  secondary: { type: Object, required: true },
  currentLabel: { type: String, default: 'I currently work here' },
  descPlaceholder: { type: String, default: '' },
  // Optional dropdown: { key, label, placeholder, options: [{ value, label }], infer: (item) => value }
  kind: { type: Object, default: null }
})

const { cv, addItem, removeItem, moveItem } = useCv()
const openId = ref(null)

function toggle(id) {
  openId.value = openId.value === id ? null : id
}

function add() {
  const item = addItem(props.listKey)
  openId.value = item.id
}

// Pre-fill the dropdown from what was typed ("Intern" -> Internship, "Gimnazija" -> Gymnasium) if it's still empty.
function guessKind(item) {
  if (!props.kind?.infer || item[props.kind.key]) return
  const guess = props.kind.infer(item)
  if (guess) item[props.kind.key] = guess
}

function metaLine(item) {
  const end = item.current ? 'Present' : item.end
  const dates = [item.start, end].filter(Boolean).join(' – ')
  const kindLabel = props.kind && props.kind.options.find((o) => o.value === item[props.kind.key])?.label
  return [item[props.secondary.key], kindLabel, dates].filter(Boolean).join(' · ') || 'Click to fill in'
}
</script>
