<template>
  <div class="skillhelp">
    <div v-if="recommended.length" class="skillhelp__block">
      <p class="skillhelp__label">
        <AppIcon name="spark" :size="14" />
        {{ hasSignal ? 'Suggested for you' : 'Popular skills' }}
        <span v-if="hasSignal" class="skillhelp__why">based on your title, experience and skills</span>
      </p>
      <TransitionGroup name="chip" tag="div" class="skillhelp__chips">
        <button
          v-for="s in recommended"
          :key="s.en"
          type="button"
          class="chip"
          :title="`Add ${label(s)}`"
          @click="addSkill(s)"
        >
          <AppIcon name="plus" :size="13" :stroke="2.4" />{{ label(s) }}
        </button>
      </TransitionGroup>
    </div>

    <div class="skillhelp__block">
      <p class="skillhelp__label">Browse by category</p>
      <div class="skillhelp__cats" role="tablist" aria-label="Skill categories">
        <button
          v-for="cat in cvSkillCategories"
          :key="cat.id"
          type="button"
          role="tab"
          class="skillhelp__cat"
          :class="{ 'is-active': openCat === cat.id }"
          :aria-selected="openCat === cat.id"
          @click="openCat = openCat === cat.id ? null : cat.id"
        >
          {{ cat.name }}
          <span v-if="countIn(cat)" class="skillhelp__catcount">{{ countIn(cat) }}</span>
        </button>
      </div>

      <Transition name="catpanel">
        <div v-if="currentCat" :key="currentCat.id" class="skillhelp__panel">
          <div class="skillhelp__panelhead">
            <span>{{ currentCat.name }}</span>
            <button type="button" class="btn btn--icon" aria-label="Close category" @click="openCat = null">
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
  </div>
</template>

<script setup>
const { cv } = useCv()
const openCat = ref(null)

const lang = computed(() => (cv.value.meta.language === 'hr' ? 'hr' : 'en'))
const label = (s) => skillLabel(s, lang.value)
const currentCat = computed(() => cvSkillCategories.find((c) => c.id === openCat.value))

const owned = computed(() => new Set(cv.value.skills.map(fold)))
const has = (s) => owned.value.has(fold(s.en)) || owned.value.has(fold(s.hr))
const countIn = (cat) => cat.items.filter(has).length

const hasSignal = computed(
  () => !!(cv.value.personal.title || cv.value.skills.length || cv.value.experience.length || cv.value.education.length)
)
const recommended = computed(() => recommendSkills(cv.value, 12))

function addSkill(s) {
  if (!has(s)) cv.value.skills.push(label(s))
}

function toggle(s) {
  if (!has(s)) return addSkill(s)
  cv.value.skills = cv.value.skills.filter((x) => fold(x) !== fold(s.en) && fold(x) !== fold(s.hr))
}
</script>

<style scoped lang="scss">
.skillhelp {
  display: flex;
  flex-direction: column;
  gap: 14rem;
  margin-top: 14rem;

  &__label {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6rem;
    margin-bottom: 8rem;
    font-size: 12.5rem;
    font-weight: 600;
    color: var(--ink-2);

    :deep(svg) {
      color: var(--brand);
    }
  }

  &__why {
    font-weight: 400;
    color: var(--muted);
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6rem;
  }

  &__cats {
    display: flex;
    flex-wrap: wrap;
    gap: 6rem;
  }

  &__cat {
    display: inline-flex;
    align-items: center;
    gap: 6rem;
    height: 30rem;
    padding: 0 11rem;
    border: 1rem solid var(--line-strong);
    border-radius: 999rem;
    background: var(--surface);
    color: var(--ink-2);
    font-size: 12.5rem;
    font-weight: 550;
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;

    &.is-active {
      background: var(--ink);
      border-color: var(--ink);
      color: #fff;
    }
    @media (hover: hover) {
      &:hover:not(.is-active) {
        border-color: var(--muted);
        color: var(--ink);
      }
    }
  }

  &__catcount {
    display: grid;
    place-items: center;
    min-width: 18rem;
    height: 18rem;
    padding: 0 5rem;
    border-radius: 999rem;
    background: var(--brand);
    color: #fff;
    font-size: 10.5rem;
    font-weight: 700;
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
    font-size: 13rem;
    font-weight: 650;
  }
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 5rem;
  height: 30rem;
  padding: 0 11rem 0 8rem;
  border: 1rem dashed var(--line-strong);
  border-radius: 6rem;
  background: var(--surface);
  color: var(--ink-2);
  font-size: 13rem;
  font-weight: 550;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.12s var(--ease-out);

  :deep(svg) {
    color: var(--muted);
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
