<template>
  <div class="toasts" role="status" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="`toast--${t.type}`" @click="dismiss(t.id)">
        <AppIcon :name="icons[t.type]" :size="18" />
        <div class="toast__body">
          <strong>{{ t.title }}</strong>
          <span v-if="t.text">{{ t.text }}</span>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
const { toasts, dismiss } = useToast()
const icons = { success: 'check', warning: 'info', error: 'alert' }
</script>
