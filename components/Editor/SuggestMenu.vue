<template>
  <!-- Teleported so the editor sections (which clip their content for the open/close animation) don't cut it off. -->
  <Teleport to="body">
    <ul
      v-if="open && items.length && anchor"
      class="suggest"
      role="listbox"
      :style="style"
      @mousedown.prevent
    >
      <li
        v-for="(item, i) in items"
        :key="`${item.kind}-${item.value}`"
        role="option"
        :aria-selected="i === active"
        class="suggest__item"
        :class="{ 'is-active': i === active, 'is-language': item.kind === 'language' }"
        @mousemove="$emit('hover', i)"
        @click="$emit('pick', item)"
      >
        <AppIcon v-if="item.kind === 'language'" name="globe" :size="14" class="suggest__icon" />
        <span class="suggest__label" v-html="highlight(item.label)" />
        <span v-if="item.hint" class="suggest__hint">{{ item.hint }}</span>
      </li>
    </ul>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  anchor: { type: Object, default: null },
  items: { type: Array, required: true },
  active: { type: Number, default: -1 },
  open: { type: Boolean, default: false },
  query: { type: String, default: '' }
})
defineEmits(['pick', 'hover'])

const style = ref({})

function place() {
  const el = props.anchor?.$el || props.anchor
  if (!el?.getBoundingClientRect) return
  const r = el.getBoundingClientRect()
  const width = Math.max(240, Math.min(r.width, 420))
  const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8))
  const below = window.innerHeight - r.bottom
  const up = below < 220 && r.top > below
  style.value = up
    ? { left: `${left}px`, width: `${width}px`, bottom: `${window.innerHeight - r.top + 4}px`, maxHeight: `${Math.min(300, r.top - 12)}px` }
    : { left: `${left}px`, width: `${width}px`, top: `${r.bottom + 4}px`, maxHeight: `${Math.min(300, below - 12)}px` }
}

watch(() => [props.open, props.items.length], () => props.open && nextTick(place), { immediate: true })

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

// Bold the part of the label that matches what was typed (ignoring accents and case).
function highlight(label) {
  const q = fold(props.query)
  if (!q) return esc(label)
  const folded = fold(label)
  const at = folded.indexOf(q)
  if (at < 0 || folded.length !== label.length) return esc(label)
  return `${esc(label.slice(0, at))}<mark>${esc(label.slice(at, at + q.length))}</mark>${esc(label.slice(at + q.length))}`
}

const reflow = () => props.open && place()
onMounted(() => {
  window.addEventListener('resize', reflow)
  window.addEventListener('scroll', reflow, true)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', reflow)
  window.removeEventListener('scroll', reflow, true)
})
</script>

<style scoped lang="scss">
.suggest {
  position: fixed;
  z-index: 1000;
  margin: 0;
  padding: 5rem;
  list-style: none;
  overflow-y: auto;
  overscroll-behavior: contain;
  border: 1rem solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface);
  box-shadow: var(--shadow-lg);
  animation: suggest-in 0.14s var(--ease-out);

  &__item {
    display: flex;
    align-items: center;
    gap: 8rem;
    min-height: 36rem;
    padding: 0 10rem;
    border-radius: 6rem;
    cursor: pointer;
    font-size: 14rem;
    color: var(--ink);

    &.is-active {
      background: var(--brand-soft);
      color: var(--brand-ink);
    }
  }

  &__icon {
    flex-shrink: 0;
    color: var(--brand);
  }

  &__label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    :deep(mark) {
      background: none;
      color: inherit;
      font-weight: 700;
    }
  }

  &__hint {
    flex-shrink: 0;
    max-width: 55%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 11.5rem;
    color: var(--muted);
  }

  .is-language &__hint {
    color: var(--brand);
    font-weight: 550;
  }
}

@keyframes suggest-in {
  from {
    opacity: 0;
    transform: translateY(-3rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .suggest {
    animation: none;
  }
}
</style>
