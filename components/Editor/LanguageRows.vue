<template>
  <div class="rows">
    <EditorLanguageRow
      v-for="(l, i) in cv.languages"
      :key="l.id"
      :ref="(el) => (rowRefs[l.id] = el)"
      :item="l"
      :lang="lang"
      :taken="cv.languages.filter((x) => x.id !== l.id).map((x) => x.name)"
      @remove="removeItem('languages', i)"
    />
    <datalist :id="levelListId">
      <option v-for="lvl in languageLevelOptions[lang]" :key="lvl" :value="lvl" />
    </datalist>

    <button type="button" class="entries__add" @click="addEmpty">
      <AppIcon name="plus" :size="16" /> Add language
    </button>

    <div v-if="quick.length" class="langquick">
      <span class="langquick__label">Quick add:</span>
      <button v-for="q in quick" :key="q.en" type="button" class="langquick__chip" @click="addNamed(q)">
        <AppIcon name="plus" :size="12" :stroke="2.4" />{{ lang === 'hr' ? q.hr : q.en }}
      </button>
    </div>
  </div>
</template>

<script setup>
const { cv, addItem, removeItem } = useCv()
const levelListId = 'language-levels'
const rowRefs = reactive({})
const lang = computed(() => (cv.value.meta.language === 'hr' ? 'hr' : 'en'))

// Common languages that are not on the CV yet.
const quick = computed(() => {
  const have = new Set(cv.value.languages.map((l) => fold(l.name)))
  return cvLanguagesCatalogue.filter((l) => COMMON_LANGUAGES.includes(l.en) && !have.has(fold(l.en)) && !have.has(fold(l.hr)))
})

async function addEmpty() {
  const item = addItem('languages')
  await nextTick()
  rowRefs[item.id]?.focusName()
}

async function addNamed(l) {
  const item = addItem('languages')
  item.name = lang.value === 'hr' ? l.hr : l.en
  await nextTick()
  rowRefs[item.id]?.focusLevel()
}
</script>

<style scoped lang="scss">
.langquick {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6rem;

  &__label {
    font-size: 12.5rem;
    color: var(--muted);
    margin-right: 2rem;
  }

  &__chip {
    display: inline-flex;
    align-items: center;
    gap: 4rem;
    height: 28rem;
    padding: 0 10rem 0 8rem;
    border: 1rem dashed var(--line-strong);
    border-radius: 999rem;
    background: var(--surface);
    color: var(--ink-2);
    font-size: 12.5rem;
    font-weight: 550;
    transition: border-color 0.15s ease, color 0.15s ease, transform 0.12s var(--ease-out);

    &:active {
      transform: scale(0.96);
    }
    @media (hover: hover) {
      &:hover {
        border-color: var(--brand);
        color: var(--brand);
      }
    }
  }
}
</style>
