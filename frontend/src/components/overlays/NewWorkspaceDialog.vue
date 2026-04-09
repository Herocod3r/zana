<script setup lang="ts">
import { ref, watch } from 'vue'
import Modal from './Modal.vue'
import Button from '@/components/primitives/Button.vue'
import TextInput from '@/components/primitives/TextInput.vue'
import Select from '@/components/primitives/Select.vue'
import Toggle from '@/components/primitives/Toggle.vue'

const CITIES = ['tokyo', 'osaka', 'kyoto', 'nagoya', 'madrid', 'lisbon', 'berlin', 'paris', 'oslo', 'kiev']

interface Props {
  open: boolean
  projectId: string
  baseBranches: string[]
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'submit', payload: { projectId: string; name: string; branch: string; baseBranch: string; createNewBranch: boolean }): void
  (e: 'cancel'): void
}>()

const name = ref('')
const branch = ref('')
const baseBranch = ref('main')
const createNewBranch = ref(true)

function suggest() {
  name.value = CITIES[Math.floor(Math.random() * CITIES.length)]
}

watch(
  () => props.open,
  (v) => {
    if (v) {
      name.value = ''
      branch.value = ''
      baseBranch.value = props.baseBranches[0] ?? 'main'
      createNewBranch.value = true
    }
  },
)

function submit() {
  if (!name.value.trim() || !branch.value.trim()) return
  emit('submit', {
    projectId: props.projectId,
    name: name.value.trim(),
    branch: branch.value.trim(),
    baseBranch: baseBranch.value,
    createNewBranch: createNewBranch.value,
  })
}
</script>

<template>
  <Modal :open="open" :width="520" @close="emit('cancel')">
    <h3 class="title">New workspace</h3>
    <div class="stack">
      <div class="name-row">
        <TextInput v-model="name" label="Display name" placeholder="tokyo" />
        <Button variant="ghost" size="sm" @click="suggest">Suggest</Button>
      </div>
      <TextInput v-model="branch" label="Branch name" placeholder="feature/my-thing" />
      <Select v-model="baseBranch" label="Base branch" :options="baseBranches.map((b) => ({ value: b, label: b }))" />
      <label class="toggle-row">
        <Toggle v-model="createNewBranch" />
        <span>Create new branch (off = check out existing)</span>
      </label>
    </div>
    <div class="actions">
      <Button variant="ghost" @click="emit('cancel')">Cancel</Button>
      <Button variant="primary" @click="submit">Create</Button>
    </div>
  </Modal>
</template>

<style scoped>
.title { font-family: var(--sans); font-size: 18px; font-weight: 500; margin: 0 0 16px; color: var(--text); letter-spacing: -0.01em; }
.stack { display: flex; flex-direction: column; gap: 16px; }
.name-row { display: flex; align-items: flex-end; gap: 12px; }
.name-row > :first-child { flex: 1; }
.toggle-row { display: flex; align-items: center; gap: 8px; font-family: var(--mono); font-size: 12px; color: var(--text-2); }
.actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 24px; }
</style>
