<script setup lang="ts">
import { ref, watch } from 'vue'
import Modal from './Modal.vue'
import Button from '@/components/primitives/Button.vue'
import TextInput from '@/components/primitives/TextInput.vue'

interface Props { open: boolean }
const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'submit', path: string): void; (e: 'cancel'): void }>()

const path = ref('')
const error = ref('')

watch(
  () => props.open,
  (v) => {
    if (v) {
      path.value = ''
      error.value = ''
    }
  },
)

function submit() {
  if (!path.value.trim()) {
    error.value = 'Path required'
    return
  }
  emit('submit', path.value.trim())
}
</script>

<template>
  <Modal :open="open" :width="480" @close="emit('cancel')">
    <h3 class="title">Add project</h3>
    <TextInput v-model="path" label="Repository path" placeholder="/Users/you/src/my-repo" :error="error" />
    <div class="actions">
      <Button variant="ghost" @click="emit('cancel')">Cancel</Button>
      <Button variant="primary" @click="submit">Add</Button>
    </div>
  </Modal>
</template>

<style scoped>
.title { font-family: var(--sans); font-size: 18px; font-weight: 500; margin: 0 0 16px; color: var(--text); letter-spacing: -0.01em; }
.actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 24px; }
</style>
