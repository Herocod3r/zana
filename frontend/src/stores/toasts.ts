// frontend/src/stores/toasts.ts
import { defineStore } from 'pinia'

export type ToastVariant = 'info' | 'success' | 'warning' | 'error'
export interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface State {
  toasts: Toast[]
}

let seq = 0
const newId = () => `toast-${++seq}`

export const useToastStore = defineStore('toasts', {
  state: (): State => ({ toasts: [] }),
  actions: {
    show(t: Omit<Toast, 'id'>): string {
      const id = newId()
      this.toasts.push({ ...t, id })
      if (this.toasts.length > 3) this.toasts.shift()
      return id
    },
    dismiss(id: string) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },
    clear() {
      this.toasts = []
    },
  },
})
