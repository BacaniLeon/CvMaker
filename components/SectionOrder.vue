<template>
  <button
    ref="trigger"
    type="button"
    class="secpick"
    :class="{ 'is-open': open, 'is-custom': !isDefault }"
    aria-haspopup="dialog"
    :aria-expanded="open"
    title="Change the order of the CV sections"
    @click="open ? close() : show()"
  >
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M7 4v16M3 8l4-4 4 4M17 20V4M13 16l4 4 4-4" />
    </svg>
    <span>Sections</span>
  </button>

  <Teleport to="body">
    <Transition name="secpop">
      <div v-if="open" ref="pop" class="secpop" :style="popStyle" role="dialog" aria-label="Section order" @keydown.esc="close">
        <div class="secpop__head">
          <p class="secpop__title">Section order</p>
          <p class="secpop__sub">Drag or use the arrows. Name and contact details always stay at the top.</p>
          <div class="secpop__presets">
            <button type="button" :class="{ 'is-active': isPreset('experience') }" @click="preset('experience')">Experience first</button>
            <button type="button" :class="{ 'is-active': isPreset('education') }" @click="preset('education')">Education first</button>
          </div>
        </div>

        <TransitionGroup tag="ol" name="secrow" class="secpop__list">
          <li
            v-for="(key, i) in order"
            :key="key"
            class="secrow"
            :class="{ 'is-dragging': dragKey === key, 'is-over': overKey === key && dragKey !== key, 'is-empty': !filled(key) }"
            draggable="true"
            @dragstart="onDragStart($event, key)"
            @dragover.prevent="overKey = key"
            @dragleave="overKey === key && (overKey = null)"
            @drop.prevent="onDrop(key)"
            @dragend="dragKey = overKey = null"
          >
            <span class="secrow__grip" aria-hidden="true">
              <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor"><circle cx="3" cy="3" r="1.5" /><circle cx="9" cy="3" r="1.5" /><circle cx="3" cy="8" r="1.5" /><circle cx="9" cy="8" r="1.5" /><circle cx="3" cy="13" r="1.5" /><circle cx="9" cy="13" r="1.5" /></svg>
            </span>
            <span class="secrow__num">{{ i + 1 }}</span>
            <span class="secrow__name">
              {{ labels[key] }}
              <small v-if="!filled(key)">empty — not shown</small>
            </span>
            <button type="button" class="secrow__btn" :disabled="i === 0" :aria-label="`Move ${labels[key]} up`" @click="move(i, -1)">
              <AppIcon name="up" :size="15" />
            </button>
            <button type="button" class="secrow__btn" :disabled="i === order.length - 1" :aria-label="`Move ${labels[key]} down`" @click="move(i, 1)">
              <AppIcon name="down" :size="15" />
            </button>
          </li>
        </TransitionGroup>

        <div class="secpop__foot">
          <span>In two-column templates each section keeps its column.</span>
          <button v-if="!isDefault" type="button" class="secpop__reset" @click="reset">Reset</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const { cv } = useCv()
const open = ref(false)
const trigger = ref(null)
const pop = ref(null)
const popStyle = ref({})
const dragKey = ref(null)
const overKey = ref(null)

const labels = {
  summary: 'Profile',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  languages: 'Languages',
  certifications: 'Certifications'
}

const order = computed(() => normalizeSectionOrder(cv.value.meta.sectionOrder))
const isDefault = computed(() => order.value.join() === DEFAULT_SECTION_ORDER.join())
const setOrder = (next) => (cv.value.meta.sectionOrder = next)

const filled = (key) => (key === 'summary' ? !!cv.value.summary.trim() : cv.value[key].length > 0)

function move(i, dir) {
  const next = [...order.value]
  const j = i + dir
  if (j < 0 || j >= next.length) return
  ;[next[i], next[j]] = [next[j], next[i]]
  setOrder(next)
}

function onDragStart(e, key) {
  dragKey.value = key
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', key)
}

function onDrop(target) {
  const from = dragKey.value
  dragKey.value = overKey.value = null
  if (!from || from === target) return
  const next = order.value.filter((k) => k !== from)
  next.splice(order.value.indexOf(target), 0, from)
  setOrder(next)
}

// "Education first" = education right after the profile, then experience; everything else unchanged.
function preset(first) {
  const second = first === 'education' ? 'experience' : 'education'
  const rest = order.value.filter((k) => !['summary', first, second].includes(k))
  setOrder(['summary', first, second, ...rest])
}
const isPreset = (first) => {
  const o = order.value
  const second = first === 'education' ? 'experience' : 'education'
  return o.indexOf(first) < o.indexOf(second)
}

const reset = () => setOrder([...DEFAULT_SECTION_ORDER])

function place() {
  const r = trigger.value?.getBoundingClientRect()
  if (!r) return
  const width = Math.min(330, window.innerWidth - 24)
  const left = Math.max(12, Math.min(r.left, window.innerWidth - width - 12))
  popStyle.value = { top: `${r.bottom + 6}px`, left: `${left}px`, width: `${width}px` }
}

function show() {
  open.value = true
  place()
}
function close() {
  open.value = false
}

function onPointerDown(e) {
  if (open.value && !pop.value?.contains(e.target) && !trigger.value?.contains(e.target)) close()
}
const reflow = () => open.value && place()
onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown, true)
  window.addEventListener('resize', reflow)
  window.addEventListener('scroll', reflow, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown, true)
  window.removeEventListener('resize', reflow)
  window.removeEventListener('scroll', reflow, true)
})
</script>

<style scoped lang="scss">
.secpick {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 7rem;
  height: 34rem;
  padding: 0 12rem;
  border: 1rem solid var(--line-strong);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--ink);
  font-size: 13rem;
  font-weight: 550;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  svg {
    color: var(--muted);
  }
  &.is-custom svg {
    color: var(--brand);
  }
  &.is-custom::after {
    content: '';
    position: absolute;
    top: -3rem;
    right: -3rem;
    width: 8rem;
    height: 8rem;
    border-radius: 50%;
    background: var(--brand);
    box-shadow: 0 0 0 2rem var(--surface);
  }
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
}

.secpop {
  position: fixed;
  z-index: 1000;
  border: 1rem solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  transform-origin: top left;

  &__head {
    padding: 14rem 14rem 10rem;
    border-bottom: 1rem solid var(--line);
  }
  &__title {
    font-size: 14rem;
    font-weight: 650;
  }
  &__sub {
    margin-top: 2rem;
    font-size: 12rem;
    color: var(--muted);
  }
  &__presets {
    display: flex;
    gap: 6rem;
    margin-top: 10rem;

    button {
      flex: 1;
      height: 30rem;
      border: 1rem solid var(--line-strong);
      border-radius: 999rem;
      background: var(--surface);
      color: var(--ink-2);
      font-size: 12.5rem;
      font-weight: 600;
      transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;

      &.is-active {
        background: var(--ink);
        border-color: var(--ink);
        color: #fff;
      }
      @media (hover: hover) {
        &:hover:not(.is-active) {
          border-color: var(--muted);
        }
      }
    }
  }

  &__list {
    margin: 0;
    padding: 6rem;
    list-style: none;
  }

  &__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10rem;
    padding: 9rem 14rem;
    border-top: 1rem solid var(--line);
    font-size: 11.5rem;
    color: var(--muted);
  }
  &__reset {
    flex-shrink: 0;
    height: 26rem;
    padding: 0 10rem;
    border: 0;
    border-radius: 6rem;
    background: transparent;
    color: var(--brand);
    font-size: 12rem;
    font-weight: 600;
    @media (hover: hover) {
      &:hover {
        background: var(--brand-soft);
      }
    }
  }
}

.secrow {
  display: flex;
  align-items: center;
  gap: 8rem;
  min-height: 42rem;
  padding: 0 6rem 0 8rem;
  border-radius: var(--radius-sm);
  cursor: grab;
  user-select: none;
  transition: background-color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;

  @media (hover: hover) {
    &:hover {
      background: var(--surface-2);
    }
  }
  &.is-dragging {
    opacity: 0.4;
  }
  &.is-over {
    box-shadow: inset 0 2rem 0 var(--brand);
  }

  &__grip {
    display: grid;
    place-items: center;
    color: #b9bbc2;
  }
  &__num {
    display: grid;
    place-items: center;
    width: 22rem;
    height: 22rem;
    flex-shrink: 0;
    border-radius: 50%;
    background: var(--brand-soft);
    color: var(--brand-ink);
    font-size: 11.5rem;
    font-weight: 700;
  }
  &.is-empty &__num {
    background: rgba(20, 20, 30, 0.06);
    color: var(--muted);
  }
  &__name {
    flex: 1;
    min-width: 0;
    font-size: 14rem;
    font-weight: 550;

    small {
      display: block;
      font-size: 11rem;
      font-weight: 400;
      color: var(--muted);
    }
  }
  &__btn {
    display: grid;
    place-items: center;
    width: 30rem;
    height: 30rem;
    border: 0;
    border-radius: 7rem;
    background: transparent;
    color: var(--ink-2);
    transition: background-color 0.15s ease;

    &:disabled {
      opacity: 0.25;
      cursor: default;
    }
    @media (hover: hover) {
      &:hover:not(:disabled) {
        background: rgba(20, 20, 30, 0.07);
      }
    }
  }
}

.secrow-move {
  transition: transform 0.22s var(--ease-out);
}

.secpop-enter-active {
  transition: opacity 0.16s ease, transform 0.2s var(--ease-out);
}
.secpop-leave-active {
  transition: opacity 0.12s ease;
}
.secpop-enter-from {
  opacity: 0;
  transform: translateY(-4rem) scale(0.98);
}
.secpop-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .secrow-move {
    transition: none;
  }
  .secpop-enter-from {
    transform: none;
  }
}
</style>
