// Keyboard + open state for an autocomplete list attached to a text input.
// `source()` returns the items for the current query; `onPick(item)` handles a choice.
export function useSuggest(source, onPick) {
  const open = ref(false)
  const active = ref(-1)
  const items = computed(() => (open.value ? source() : []))

  // Pre-select the first item only when it clearly matches (starts with what was typed),
  // so Enter never swaps a custom skill for a loosely related one.
  watch(items, (list) => {
    active.value = list.length && list[0].score >= 70 ? 0 : -1
  })

  function pick(item) {
    if (item) onPick(item)
  }

  // Returns true when the key was used by the list.
  function onKeydown(e) {
    const list = items.value
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!open.value) {
        open.value = true
        return true
      }
      if (!list.length) return false
      e.preventDefault()
      const n = list.length
      active.value = e.key === 'ArrowDown' ? (active.value + 1) % n : (active.value - 1 + n) % n
      return true
    }
    if (e.key === 'Enter' && open.value && active.value >= 0 && list[active.value]) {
      e.preventDefault()
      pick(list[active.value])
      return true
    }
    if (e.key === 'Escape' && open.value && list.length) {
      e.preventDefault()
      e.stopPropagation()
      open.value = false
      return true
    }
    return false
  }

  return { open, active, items, pick, onKeydown }
}
