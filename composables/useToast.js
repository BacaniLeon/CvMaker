export function useToast() {
  const toasts = useState('toasts', () => [])

  function toast({ title, text = '', type = 'success', timeout = 5000 }) {
    const id = Math.random().toString(36).slice(2)
    toasts.value.push({ id, title, text, type })
    setTimeout(() => dismiss(id), timeout)
  }

  function dismiss(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, toast, dismiss }
}
