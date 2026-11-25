<template>
  <div class="skillhelp">
    <!-- ---------- recommendations -->
    <div class="skillhelp__block">
      <div class="skillhelp__head">
        <p class="skillhelp__label">
          <AppIcon name="spark" :size="14" />
          {{ occupation ? 'Suggested for' : hasSignal ? 'Suggested for you' : 'Popular skills' }}
        </p>
        <div ref="occBox" class="occpick" :class="{ 'is-open': occSuggest.open.value }">
          <input
            ref="occInput"
            v-model="occQuery"
            class="occpick__input"
            :placeholder="occupation ? occupationText(occupation) : 'Your occupation, e.g. librarian, teacher…'"
            :title="occupation ? 'Change the occupation the suggestions are based on' : 'Pick an occupation to get its typical skills'"
            aria-label="Occupation for skill suggestions"
            role="combobox"
            autocomplete="off"
            :aria-expanded="occSuggest.open.value"
            @focus="onOccFocus"
            @input="occSuggest.open.value = true"
            @blur="onOccBlur"
            @keydown="occSuggest.onKeydown"
          />
          <AppIcon name="down" :size="13" class="occpick__chev" />
        </div>
        <button v-if="occOverride" type="button" class="skillhelp__reset" title="Go back to the occupation matched from your CV" @click="occOverride = null">
          Auto
        </button>
      </div>

      <TransitionGroup v-if="recommended.length" name="chip" tag="div" class="skillhelp__chips">
        <button
          v-for="s in recommended"
          :key="s.key"
          type="button"
          class="chip"
          :class="{ 'chip--essential': s.essential }"
          :title="s.essential ? `Core skill for ${occupationText(occupation)} (ESCO)` : `Add ${s.label}`"
          @click="addLabel(s.label)"
        >
          <AppIcon name="plus" :size="13" :stroke="2.4" />{{ s.label }}
        </button>
      </TransitionGroup>
      <p v-else class="skillhelp__empty">You already have every suggested skill — nice. Try another occupation or a category below.</p>
    </div>

    <!-- ---------- categories -->
    <div class="skillhelp__block">
      <label class="skillhelp__browse">
        <span class="skillhelp__label">Browse skills by category</span>
        <select v-model="openCat" class="input skillhelp__select" :class="{ 'is-empty': !openCat }">
          <option value="">Choose a category…</option>
          <option v-for="cat in cvSkillCategories" :key="cat.id" :value="cat.id">
            {{ cat.name }}{{ countIn(cat) ? ` — ${countIn(cat)} added` : '' }}
          </option>
        </select>
      </label>

      <Transition name="catpanel">
        <div v-if="currentCat" :key="currentCat.id" class="skillhelp__panel">
          <div class="skillhelp__panelhead">
            <span>{{ currentCat.items.length }} skills · click to add or remove</span>
            <button type="button" class="btn btn--icon" aria-label="Close category" @click="openCat = ''">
              <AppIcon name="x" :size="15" />
            </button>
          </div>
          <div class="skillhelp__chips">
            <button
              v-for="s in currentCat.items"
              :key="s.en"
              type="button"
              class="chip"
              :class="{ 'is-on': has(s) }"
              :aria-pressed="has(s)"
              @click="toggle(s)"
            >
              <AppIcon :name="has(s) ? 'check' : 'plus'" :size="13" :stroke="2.4" />{{ label(s) }}
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <p v-if="escoData" class="skillhelp__credit">Occupation skills from ESCO, © European Union</p>

    <EditorSuggestMenu
      :anchor="occBox"
      :open="occSuggest.open.value"
      :items="occSuggest.items.value"
      :active="occSuggest.active.value"
      :query="occQuery"
      @hover="occSuggest.active.value = $event"
      @pick="occSuggest.pick"
    />
  </div>
</template>

<script setup>
const { cv } = useCv()
const openCat = ref('')
const occQuery = ref('')
const occOverride = shallowRef(null)
const occBox = ref(null)
const occInput = ref(null)

const lang = computed(() => (cv.value.meta.language === 'hr' ? 'hr' : 'en'))
const label = (s) => skillLabel(s, lang.value)
const currentCat = computed(() => cvSkillCategories.find((c) => c.id === openCat.value))

const owned = computed(() => new Set(cv.value.skills.map(fold)))
const has = (s) => owned.value.has(fold(s.en)) || owned.value.has(fold(s.hr))
const countIn = (cat) => cat.items.filter(has).length

const hasSignal = computed(
  () => !!(cv.value.personal.title || cv.value.skills.length || cv.value.experience.length || cv.value.education.length)
)

// ---------- occupation (ESCO)
const escoData = esco

onMounted(() => {
  // Fetch the ESCO file in the background once the editor has settled.
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500))
  idle(() => loadEsco())
})

const matched = computed(() => (esco.value ? matchOccupations(cv.value, 6) : []))
const occupation = computed(() => occOverride.value || matched.value[0] || null)
const occupationText = (o) => {
  const t = o ? occupationLabel(o, lang.value) : ''
  return t ? t[0].toUpperCase() + t.slice(1) : ''
}

const occSuggest = useSuggest(
  () => {
    if (!esco.value) return []
    if (occQuery.value.trim()) return searchOccupations(occQuery.value, { lang: lang.value, limit: 8 })
    // Empty box: offer the occupations matched from the CV.
    return matched.value.map((o) => ({
      kind: 'occupation',
      value: occupationLabel(o, lang.value),
      label: occupationLabel(o, lang.value),
      hint: o === occupation.value ? 'current' : 'matched from your CV',
      occ: o,
      score: 0
    }))
  },
  (item) => {
    occOverride.value = item.occ
    occQuery.value = ''
    occSuggest.open.value = false
    occInput.value?.blur()
  }
)

function onOccFocus() {
  loadEsco()
  occSuggest.open.value = true
}
function onOccBlur() {
  occSuggest.open.value = false
  occQuery.value = ''
}

// ---------- recommendation list

const recommended = computed(() => {
  const out = []
  const seen = new Set(cv.value.skills.map(fold))
  const push = (item) => {
    const k = fold(item.label)
    if (seen.has(k)) return
    seen.add(k)
    out.push(item)
  }
  const fromOccupation = occupation.value ? occupationSkills(occupation.value, cv.value, lang.value, 10) : []
  fromOccupation.forEach(push)
  // Curated, CV-style names (tools, soft skills) fill up the rest.
  for (const s of recommendSkills(cv.value, 12)) {
    if (out.length >= (fromOccupation.length ? 16 : 12)) break
    push({ key: s.en, label: label(s), essential: false })
  }
  return out
})

function addLabel(text) {
  if (!owned.value.has(fold(text))) cv.value.skills.push(text)
}

function toggle(s) {
  if (!has(s)) return addLabel(label(s))
  cv.value.skills = cv.value.skills.filter((x) => fold(x) !== fold(s.en) && fold(x) !== fold(s.hr))
}
</script>

<style scoped lang="scss">
.skillhelp {
  display: flex;
  flex-direction: column;
  gap: 16rem;
  margin-top: 14rem;

  &__head {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8rem;
    margin-bottom: 10rem;
  }

  &__label {
    display: flex;
    align-items: center;
    gap: 6rem;
    font-size: 12.5rem;
    font-weight: 600;
    color: var(--ink-2);

    :deep(svg) {
      color: var(--brand);
    }
  }

  &__reset {
    height: 26rem;
    padding: 0 9rem;
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

  &__chips {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 6rem;
  }

  &__empty {
    font-size: 12.5rem;
    color: var(--muted);
  }

  &__browse {
    display: flex;
    flex-direction: column;
    gap: 6rem;
  }

  &__select {
    height: 38rem;
    font-size: 13.5rem;
  }

  &__panel {
    margin-top: 10rem;
    padding: 12rem;
    border: 1rem solid var(--line);
    border-radius: var(--radius-sm);
    background: var(--surface-2);
  }

  &__panelhead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: -4rem -4rem 8rem 0;
    font-size: 12rem;
    color: var(--muted);
  }

  &__credit {
    font-size: 11rem;
    color: var(--muted);
  }
}

.occpick {
  position: relative;
  flex: 1;
  min-width: 180rem;
  max-width: 320rem;

  &__input {
    width: 100%;
    height: 30rem;
    padding: 0 28rem 0 10rem;
    border: 1rem solid var(--line-strong);
    border-radius: 999rem;
    background: var(--surface);
    font-size: 13rem;
    font-weight: 600;
    color: var(--ink);
    text-overflow: ellipsis;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;

    &::placeholder {
      color: var(--brand-ink);
      opacity: 1;
    }
    &:focus {
      outline: none;
      border-color: var(--brand);
      box-shadow: 0 0 0 3rem var(--brand-soft);
      &::placeholder {
        color: #a3a5ad;
        font-weight: 500;
      }
    }
    @media (max-width: 768px) {
      font-size: 16px;
    }
  }

  &__chev {
    position: absolute;
    right: 10rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    pointer-events: none;
    transition: transform 0.2s var(--ease-out);
  }
  &.is-open &__chev {
    transform: translateY(-50%) rotate(180deg);
  }
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 5rem;
  min-height: 30rem;
  padding: 4rem 11rem 4rem 8rem;
  border: 1rem dashed var(--line-strong);
  border-radius: 6rem;
  background: var(--surface);
  color: var(--ink-2);
  font-size: 13rem;
  font-weight: 550;
  text-align: left;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.12s var(--ease-out);

  :deep(svg) {
    flex-shrink: 0;
    color: var(--muted);
  }

  &--essential {
    border-style: solid;
    border-color: rgba(57, 67, 183, 0.3);
  }

  &.is-on {
    border-style: solid;
    border-color: transparent;
    background: var(--brand-soft);
    color: var(--brand-ink);
    :deep(svg) {
      color: var(--brand);
    }
  }

  &:active {
    transform: scale(0.96);
  }

  @media (hover: hover) {
    &:hover:not(.is-on) {
      border-color: var(--brand);
      color: var(--brand);
      :deep(svg) {
        color: var(--brand);
      }
    }
  }
}

.chip-enter-active,
.chip-leave-active {
  transition: opacity 0.18s ease, transform 0.18s var(--ease-out);
}
.chip-enter-from,
.chip-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
.chip-leave-active {
  position: absolute;
}
.chip-move {
  transition: transform 0.2s var(--ease-out);
}

.catpanel-enter-active {
  transition: opacity 0.18s ease, transform 0.2s var(--ease-out);
}
.catpanel-enter-from {
  opacity: 0;
  transform: translateY(-4rem);
}

@media (prefers-reduced-motion: reduce) {
  .chip-enter-active,
  .chip-leave-active,
  .chip-move,
  .catpanel-enter-active {
    transition: opacity 0.12s ease;
  }
  .chip-enter-from,
  .chip-leave-to,
  .catpanel-enter-from {
    transform: none;
  }
}
</style>
