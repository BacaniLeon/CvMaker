<template>
  <div class="gallery">
    <div class="gallery__filters" role="tablist" aria-label="Template style">
      <button
        v-for="cat in cvTemplateCategories"
        :key="cat.id"
        type="button"
        role="tab"
        :aria-selected="filter === cat.id"
        :class="{ 'is-active': filter === cat.id }"
        @click="filter = cat.id"
      >
        {{ cat.name }}
        <span>{{ count(cat.id) }}</span>
      </button>
    </div>

    <TransitionGroup name="gallery" tag="div" class="gallery__grid">
      <button
        v-for="tpl in visible"
        :key="tpl.id"
        type="button"
        class="gallery__item"
        :class="{ 'is-active': tpl.id === selected }"
        :aria-pressed="tpl.id === selected"
        @click="emit('select', tpl.id)"
      >
        <div class="gallery__thumb">
          <CvThumb :cv="withTemplate(tpl.id)" />
          <span v-if="tpl.id === selected" class="gallery__check"><AppIcon name="check" :size="14" :stroke="3" /></span>
        </div>
        <div class="gallery__meta">
          <span class="gallery__name">{{ tpl.name }}</span>
          <span v-if="tpl.popular" class="gallery__badge">Popular</span>
          <span v-else-if="tpl.ats" class="gallery__badge gallery__badge--ats">ATS</span>
        </div>
        <span class="gallery__hint">{{ tpl.hint }}</span>
      </button>
    </TransitionGroup>
  </div>
</template>

<script setup>
const props = defineProps({
  cv: { type: Object, required: true },
  selected: { type: String, default: '' }
})
const emit = defineEmits(['select'])

const filter = ref('all')
const matches = (tpl, cat) => cat === 'all' || (cat === 'popular' ? tpl.popular : cat === 'ats' ? tpl.ats : tpl.category === cat)
const visible = computed(() => cvTemplates.filter((t) => matches(t, filter.value)))
const count = (cat) => cvTemplates.filter((t) => matches(t, cat)).length

// Preview with the user's own content; fall back to demo content while their CV is still empty.
const base = computed(() => (isCvEmpty(props.cv) ? normalizeCv({ ...sampleCvData, meta: { ...props.cv.meta } }) : props.cv))
const withTemplate = (id) => ({ ...base.value, meta: { ...base.value.meta, template: id } })
</script>
