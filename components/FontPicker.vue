<template>
  <button
    ref="trigger"
    type="button"
    class="fontpick"
    :class="{ 'is-open': open }"
    aria-haspopup="listbox"
    :aria-expanded="open"
    aria-label="CV font"
    title="Choose a font"
    @click="toggle"
  >
    <span class="fontpick__aa" :style="{ fontFamily: current.stack }">Aa</span>
    <span class="fontpick__name">{{ current.name }}</span>
    <AppIcon name="down" :size="13" class="fontpick__chev" />
  </button>

  <Teleport to="body">
    <Transition name="fontpop">
      <div
        v-if="open"
        ref="pop"
        class="fontpop"
        :style="popStyle"
        @keydown="onKeydown"
      >
        <div class="fontpop__head">
          <div class="fontpop__search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
            </svg>
            <input
              ref="search"
              v-model="query"
              type="search"
              placeholder="Search fonts…"
              aria-label="Search fonts"
              autocomplete="off"
              spellcheck="false"
            />
          </div>
          <div class="fontpop__cats" role="tablist" aria-label="Font style">
            <button
              v-for="cat in cvFontCategories"
              :key="cat.id"
              type="button"
              role="tab"
              :aria-selected="category === cat.id"
              :class="{ 'is-active': category === cat.id }"
              @click="setCategory(cat.id)"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>

        <ul ref="listEl" class="fontpop__list" role="listbox" :aria-label="`${visible.length} fonts`" tabindex="-1">
          <li
            v-for="(f, i) in visible"
            :key="f.key"
            role="option"
            :aria-selected="f.key === modelValue"
            class="fontpop__item"
            :class="{ 'is-selected': f.key === modelValue, 'is-active': i === active }"
            :data-i="i"
            @mousemove="active = i"
            @click="choose(f)"
          >
            <span class="fontpop__fname" :style="{ fontFamily: `'${previewFamily(f)}', ${f.stack}` }">{{ f.name }}</span>
            <span class="fontpop__cat">{{ f.category }}</span>
            <AppIcon v-if="f.key === modelValue" name="check" :size="14" class="fontpop__check" />
          </li>
          <li v-if="!visible.length" class="fontpop__empty">No font matches “{{ query }}”</li>
        </ul>

        <div class="fontpop__foot">{{ visible.length }} of {{ cvFontList.length }} fonts · ↑↓ to try, Enter to keep</div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({ modelValue: { type: String, required: true } })
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const query = ref('')
const category = ref('all')
const active = ref(0)
const trigger = ref(null)
const pop = ref(null)
const search = ref(null)
const listEl = ref(null)
const popStyle = ref({})
let original = null

const current = computed(() => cvFonts[props.modelValue] || cvFonts[DEFAULT_CV_FONT])

const visible = computed(() => {
  const q = query.value.trim().toLowerCase()
  return cvFontList.filter(
    (f) => (category.value === 'all' || f.category === category.value) && (!q || f.name.toLowerCase().includes(q))
  )
})

watch([query, category], () => {
  active.value = 0
  listEl.value?.scrollTo({ top: 0 })
})

function place() {
  const r = trigger.value?.getBoundingClientRect()
  if (!r) return
  const width = Math.min(320, window.innerWidth - 24)
  const left = Math.max(12, Math.min(r.left, window.innerWidth - width - 12))
  const below = window.innerHeight - r.bottom - 16
  const height = Math.min(460, Math.max(240, below))
  popStyle.value = { top: `${r.bottom + 6}px`, left: `${left}px`, width: `${width}px`, maxHeight: `${height}px` }
}

function show() {
  original = props.modelValue
  query.value = ''
  category.value = 'all'
  open.value = true
  place()
  loadFontPreviews()
  nextTick(() => {
    const i = visible.value.findIndex((f) => f.key === props.modelValue)
    active.value = Math.max(0, i)
    scrollToActive('center')
    // Don't pop the keyboard open on phones.
    if (window.matchMedia('(hover: hover)').matches) search.value?.focus({ preventScroll: true })
  })
}

function close({ restore = false } = {}) {
  if (!open.value) return
  if (restore && original && original !== props.modelValue) emit('update:modelValue', original)
  open.value = false
  trigger.value?.focus({ preventScroll: true })
}

const toggle = () => (open.value ? close() : show())

function choose(f) {
  emit('update:modelValue', f.key)
  loadCvFont(f.key)
  original = f.key
  close()
}

function setCategory(id) {
  category.value = id
  search.value?.focus({ preventScroll: true })
}

function scrollToActive(block = 'nearest') {
  nextTick(() => listEl.value?.querySelector(`[data-i="${active.value}"]`)?.scrollIntoView({ block }))
}

// Arrow keys preview the font live on the CV; Escape puts the original back.
function onKeydown(e) {
  const n = visible.value.length
  if (e.key === 'Escape') {
    e.preventDefault()
    close({ restore: true })
  } else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && n) {
    e.preventDefault()
    active.value = (active.value + (e.key === 'ArrowDown' ? 1 : -1) + n) % n
    const f = visible.value[active.value]
    emit('update:modelValue', f.key)
    loadCvFont(f.key)
    scrollToActive()
  } else if (e.key === 'Enter' && n) {
    e.preventDefault()
    choose(visible.value[active.value])
  } else if (e.key === 'Tab') {
    close()
  }
}

function onPointerDown(e) {
  if (!open.value) return
  if (pop.value?.contains(e.target) || trigger.value?.contains(e.target)) return
  close()
}
const onReflow = () => open.value && place()

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown, true)
  window.addEventListener('resize', onReflow)
  window.addEventListener('scroll', onReflow, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown, true)
  window.removeEventListener('resize', onReflow)
  window.removeEventListener('scroll', onReflow, true)
})
</script>

<style scoped lang="scss">
.fontpick {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8rem;
  height: 34rem;
  max-width: 190rem;
  padding: 0 10rem 0 6rem;
  border: 1rem solid var(--line-strong);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--ink);
  font-size: 13rem;
  font-weight: 550;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &.is-open,
  &:focus-visible {
    border-color: var(--brand);
    box-shadow: 0 0 0 3rem var(--brand-soft);
  }
  @media (hover: hover) {
    &:hover {
      border-color: var(--muted);
    }
  }

  &__aa {
    display: grid;
    place-items: center;
    width: 24rem;
    height: 24rem;
    border-radius: 6rem;
    background: rgba(20, 20, 30, 0.06);
    font-size: 13rem;
    font-weight: 600;
    line-height: 1;
  }
  &__name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  &__chev {
    flex-shrink: 0;
    color: var(--muted);
    transition: transform 0.2s var(--ease-out);
  }
  &.is-open &__chev {
    transform: rotate(180deg);
  }
}

.fontpop {
  position: fixed;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  border: 1rem solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  transform-origin: top left;

  &__head {
    padding: 10rem 10rem 8rem;
    border-bottom: 1rem solid var(--line);
  }

  &__search {
    display: flex;
    align-items: center;
    gap: 8rem;
    height: 36rem;
    padding: 0 10rem;
    border-radius: var(--radius-sm);
    background: var(--surface-2);
    border: 1rem solid var(--line);
    color: var(--muted);

    &:focus-within {
      border-color: var(--brand);
      box-shadow: 0 0 0 3rem var(--brand-soft);
    }

    input {
      flex: 1;
      min-width: 0;
      height: 100%;
      border: 0;
      outline: 0;
      background: transparent;
      color: var(--ink);
      font: inherit;
      font-size: 16rem; // 16px stops iOS zooming in on focus
      &::-webkit-search-cancel-button {
        cursor: pointer;
      }
    }
  }

  &__cats {
    display: flex;
    gap: 4rem;
    margin-top: 8rem;
    overflow-x: auto;
    scrollbar-width: none;

    button {
      flex-shrink: 0;
      height: 26rem;
      padding: 0 10rem;
      border: 0;
      border-radius: 999rem;
      background: transparent;
      color: var(--muted);
      font-size: 12rem;
      font-weight: 600;
      transition: background-color 0.15s ease, color 0.15s ease;

      &.is-active {
        background: var(--ink);
        color: #fff;
      }
      @media (hover: hover) {
        &:hover:not(.is-active) {
          background: rgba(20, 20, 30, 0.06);
          color: var(--ink);
        }
      }
    }
  }

  &__list {
    flex: 1;
    min-height: 0;
    margin: 0;
    padding: 6rem;
    list-style: none;
    overflow-y: auto;
    overscroll-behavior: contain;
    outline: 0;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 8rem;
    min-height: 40rem;
    padding: 0 10rem;
    border-radius: var(--radius-sm);
    cursor: pointer;
    color: var(--ink);

    &.is-active {
      background: var(--surface-2);
      box-shadow: inset 0 0 0 1rem var(--line);
    }
    &.is-selected {
      background: var(--brand-soft);
      box-shadow: none;
      color: var(--brand-ink);
    }
  }

  &__fname {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 17rem;
    line-height: 1.3;
  }

  &__cat {
    flex-shrink: 0;
    font-size: 10.5rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--muted);
  }

  &__check {
    flex-shrink: 0;
    color: var(--brand);
  }

  &__empty {
    padding: 28rem 12rem;
    text-align: center;
    color: var(--muted);
    font-size: 13rem;
  }

  &__foot {
    padding: 8rem 12rem;
    border-top: 1rem solid var(--line);
    color: var(--muted);
    font-size: 11.5rem;
  }
}

.fontpop-enter-active {
  transition: opacity 0.16s ease, transform 0.2s var(--ease-out);
}
.fontpop-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.fontpop-enter-from,
.fontpop-leave-to {
  opacity: 0;
  transform: translateY(-4rem) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .fontpop-enter-active,
  .fontpop-leave-active {
    transition: opacity 0.12s ease;
  }
  .fontpop-enter-from,
  .fontpop-leave-to {
    transform: none;
  }
}
</style>
