<template>
  <!-- A CV page scaled to whatever width its container gives it. -->
  <div ref="box" class="cv-thumb" :style="{ height: `${CV_PAGE.height * scale}px` }">
    <div class="cv-thumb__inner" :style="{ transform: `scale(${scale})` }">
      <CvPaper :cv="cv" />
    </div>
  </div>
</template>

<script setup>
defineProps({ cv: { type: Object, required: true } })
const box = ref(null)
const scale = ref(0.5)
let ro = null

onMounted(() => {
  const fit = () => (scale.value = box.value.clientWidth / CV_PAGE.width)
  fit()
  ro = new ResizeObserver(fit)
  ro.observe(box.value)
})
onBeforeUnmount(() => ro?.disconnect())
</script>

<style scoped>
.cv-thumb {
  position: relative;
  width: 100%;
  overflow: hidden;
}
.cv-thumb__inner {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
  pointer-events: none;
}
</style>
