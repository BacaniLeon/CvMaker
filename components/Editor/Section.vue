<template>
  <section class="esection" :class="{ 'is-open': open }">
    <button type="button" class="esection__head" :aria-expanded="open" @click="open = !open">
      <span class="esection__icon"><AppIcon :name="icon" :size="17" /></span>
      <span class="esection__titles">
        <span class="esection__title">{{ title }}</span>
        <span v-if="subtitle" class="esection__subtitle">{{ subtitle }}</span>
      </span>
      <span v-if="count" class="esection__count">{{ count }}</span>
      <AppIcon name="down" :size="18" class="esection__chevron" />
    </button>
    <div class="esection__body-wrap">
      <div class="esection__body-inner">
        <div class="esection__body">
          <slot />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: 'text' },
  count: { type: Number, default: 0 },
  defaultOpen: { type: Boolean, default: false }
})
const open = ref(props.defaultOpen)
</script>
