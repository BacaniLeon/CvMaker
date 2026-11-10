<template>
  <div v-if="blocks.length" class="cv-rich">
    <template v-for="(block, i) in blocks" :key="i">
      <p v-if="block.type === 'p'">{{ block.text }}</p>
      <ul v-else>
        <li v-for="(item, j) in block.items" :key="j">
          <span class="cv-rich__dot" :style="{ background: dot }" />{{ item }}
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  text: { type: String, default: '' },
  dot: { type: String, default: '#9ca3af' }
})
const blocks = computed(() => parseRichText(props.text))
</script>

<style scoped>
.cv-rich p {
  margin: 0 0 4px;
}
.cv-rich ul {
  margin: 2px 0 4px;
  padding: 0;
  list-style: none;
}
.cv-rich li {
  position: relative;
  padding-left: 14px;
  margin-bottom: 2px;
}
.cv-rich__dot {
  position: absolute;
  left: 2px;
  top: 0.62em;
  width: 4px;
  height: 4px;
  border-radius: 50%;
}
</style>
