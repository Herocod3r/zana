import { ref } from 'vue'
import type { MenuItem } from '@/components/overlays/ContextMenu.vue'

export function useContextMenu() {
  const open = ref(false)
  const x = ref(0)
  const y = ref(0)
  const items = ref<MenuItem[]>([])
  let onSelect: ((id: string) => void) | null = null

  function show(ev: MouseEvent, next: MenuItem[], select: (id: string) => void) {
    x.value = ev.clientX
    y.value = ev.clientY
    items.value = next
    onSelect = select
    open.value = true
  }
  function close() {
    open.value = false
    onSelect = null
  }
  function select(id: string) {
    onSelect?.(id)
    close()
  }

  return { open, x, y, items, show, close, select }
}
