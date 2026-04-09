# Phase 3 — Primitives

**Goal:** Eight presentational primitives used across the rest of the app: `Icon`, `Button`, `ActivityDot`, `TextInput`, `Select`, `Toggle`, `Checkbox`, `Tooltip`. Each has a smoke test plus one behavior test.

**Prerequisites:** Phases 1–2 complete. Phosphor icons installed.

---

### Task 3.1: `Icon.vue`

**Files:**
- Create: `frontend/src/components/primitives/Icon.vue`
- Create: `frontend/src/components/primitives/Icon.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// Icon.test.ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Icon from './Icon.vue'

describe('Icon', () => {
  it('renders the given phosphor icon', () => {
    const w = mount(Icon, { props: { name: 'plus', size: 16 } })
    const svg = w.find('svg')
    expect(svg.exists()).toBe(true)
    expect(svg.attributes('width')).toBe('16')
  })
})
```

- [ ] **Step 2: Run test — expect fail**

`pnpm run test -- Icon`

- [ ] **Step 3: Implement `Icon.vue`**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import * as Phosphor from '@phosphor-icons/vue'

interface Props {
  name: string
  size?: number
  weight?: 'thin' | 'light' | 'regular' | 'bold'
}
const props = withDefaults(defineProps<Props>(), { size: 16, weight: 'regular' })

const component = computed(() => {
  // Phosphor exports like PhPlus, PhGearSix, etc.
  const pascal = props.name
    .split('-')
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join('')
  const key = `Ph${pascal}` as keyof typeof Phosphor
  const found = Phosphor[key]
  if (!found) {
    // eslint-disable-next-line no-console
    console.warn(`[Icon] unknown phosphor name: ${props.name}`)
    return Phosphor.PhCircle
  }
  return found
})
</script>

<template>
  <component :is="component" :size="size" :weight="weight" />
</template>
```

- [ ] **Step 4: Run test — expect pass**

`pnpm run test -- Icon`

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/primitives/Icon.vue frontend/src/components/primitives/Icon.test.ts
git commit -m "feat(ui): Icon primitive wrapping phosphor"
```

---

### Task 3.2: `Button.vue`

**Files:**
- Create: `frontend/src/components/primitives/Button.vue`
- Create: `frontend/src/components/primitives/Button.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from './Button.vue'

describe('Button', () => {
  it('renders its default slot and emits click', async () => {
    const w = mount(Button, { slots: { default: 'Go' } })
    expect(w.text()).toBe('Go')
    await w.trigger('click')
    expect(w.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when disabled', async () => {
    const w = mount(Button, { props: { disabled: true }, slots: { default: 'x' } })
    await w.trigger('click')
    expect(w.emitted('click')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run — fails**

- [ ] **Step 3: Implement `Button.vue`**

```vue
<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'ghost' | 'icon'
  size?: 'sm' | 'md'
  disabled?: boolean
  type?: 'button' | 'submit'
}
withDefaults(defineProps<Props>(), { variant: 'ghost', size: 'md', disabled: false, type: 'button' })
const emit = defineEmits<{ (e: 'click', ev: MouseEvent): void }>()

function onClick(ev: MouseEvent) {
  if ((ev.currentTarget as HTMLButtonElement).disabled) return
  emit('click', ev)
}
</script>

<template>
  <button
    :class="['btn', `btn--${variant}`, `btn--${size}`, { 'btn--disabled': disabled }]"
    :disabled="disabled"
    :type="type"
    @click="onClick"
  >
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--s-xs);
  font-family: var(--mono);
  font-weight: 500;
  letter-spacing: 0.01em;
  border-radius: var(--r-sm);
  transition: background-color var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}
.btn--sm {
  font-size: 11px;
  padding: 4px 10px;
  height: 22px;
}
.btn--md {
  font-size: 12px;
  padding: 6px 14px;
  height: 28px;
}
.btn--primary {
  background: var(--accent);
  color: var(--accent-fg);
}
.btn--primary:hover:not(.btn--disabled) {
  filter: brightness(1.08);
}
.btn--ghost {
  background: transparent;
  color: var(--text-2);
  border: 1px solid var(--border-strong);
}
.btn--ghost:hover:not(.btn--disabled) {
  color: var(--text);
  border-color: var(--text-muted);
}
.btn--icon {
  background: transparent;
  color: var(--text-muted);
  width: 28px;
  height: 28px;
  padding: 0;
}
.btn--icon:hover:not(.btn--disabled) {
  color: var(--text);
  background: var(--surface-elev);
}
.btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

- [ ] **Step 4: Run — passes**

- [ ] **Step 5: Commit** — `git add ... && git commit -m "feat(ui): Button primitive with primary/ghost/icon variants"`

---

### Task 3.3: `ActivityDot.vue`

**Files:**
- Create: `frontend/src/components/primitives/ActivityDot.vue`
- Create: `frontend/src/components/primitives/ActivityDot.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ActivityDot from './ActivityDot.vue'

describe('ActivityDot', () => {
  it.each(['active', 'recent', 'idle'] as const)('renders state %s', (state) => {
    const w = mount(ActivityDot, { props: { state } })
    expect(w.classes()).toContain(`dot--${state}`)
  })
})
```

- [ ] **Step 2: Fail, then implement**

```vue
<script setup lang="ts">
import type { ActivityState } from '@/types/models'
interface Props {
  state: ActivityState
  size?: number
}
withDefaults(defineProps<Props>(), { size: 5 })
</script>

<template>
  <span :class="['dot', `dot--${state}`]" :style="{ width: `${size}px`, height: `${size}px` }" />
</template>

<style scoped>
.dot {
  display: inline-block;
  border-radius: var(--r-full);
  flex-shrink: 0;
  transition: background-color var(--dur-slow) var(--ease-out),
    box-shadow var(--dur-slow) var(--ease-out);
}
.dot--active {
  background: var(--accent);
  box-shadow: 0 0 4px var(--accent);
}
.dot--recent {
  background: var(--warning);
}
.dot--idle {
  background: var(--text-muted);
}
</style>
```

- [ ] **Step 3: Run + commit**

`pnpm run test -- ActivityDot` then `git commit -m "feat(ui): ActivityDot primitive with state transitions"`

---

### Task 3.4: `TextInput.vue`

**Files:**
- Create: `frontend/src/components/primitives/TextInput.vue`
- Create: `frontend/src/components/primitives/TextInput.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TextInput from './TextInput.vue'

describe('TextInput', () => {
  it('v-models on input events', async () => {
    const w = mount(TextInput, { props: { modelValue: '', label: 'Name' } })
    await w.find('input').setValue('hello')
    expect(w.emitted('update:modelValue')).toEqual([['hello']])
  })
  it('shows inline error', () => {
    const w = mount(TextInput, { props: { modelValue: '', label: 'Name', error: 'bad' } })
    expect(w.text()).toContain('bad')
  })
})
```

- [ ] **Step 2: Implement**

```vue
<script setup lang="ts">
interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  type?: 'text' | 'password'
}
withDefaults(defineProps<Props>(), { type: 'text' })
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()
function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <label class="field">
    <span v-if="label" class="label">{{ label }}</span>
    <input
      class="input"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="onInput"
    />
    <span v-if="error" class="error">{{ error }}</span>
  </label>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: var(--mono);
}
.label {
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.input {
  font-size: 13px;
  color: var(--text);
  border-bottom: 1px solid var(--border-strong);
  padding: 6px 2px;
  transition: border-color var(--dur-fast) var(--ease-out);
}
.input:focus {
  border-bottom-color: var(--accent);
}
.input:disabled {
  opacity: 0.5;
}
.error {
  color: var(--accent);
  font-size: 11px;
  margin-top: 2px;
}
</style>
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(ui): TextInput primitive with bottom rule"`

---

### Task 3.5: `Select.vue`

**Files:**
- Create: `frontend/src/components/primitives/Select.vue`
- Create: `frontend/src/components/primitives/Select.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Select from './Select.vue'

describe('Select', () => {
  it('emits update on change', async () => {
    const w = mount(Select, {
      props: {
        modelValue: 'a',
        options: [
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
        ],
      },
    })
    await w.find('select').setValue('b')
    expect(w.emitted('update:modelValue')).toEqual([['b']])
  })
})
```

- [ ] **Step 2: Implement**

```vue
<script setup lang="ts">
interface Option {
  value: string
  label: string
}
interface Props {
  modelValue: string
  options: Option[]
  label?: string
  disabled?: boolean
}
defineProps<Props>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()
function onChange(e: Event) {
  emit('update:modelValue', (e.target as HTMLSelectElement).value)
}
</script>

<template>
  <label class="field">
    <span v-if="label" class="label">{{ label }}</span>
    <select class="select" :value="modelValue" :disabled="disabled" @change="onChange">
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
  </label>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: var(--mono);
}
.label {
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.select {
  font-size: 13px;
  color: var(--text);
  border-bottom: 1px solid var(--border-strong);
  padding: 6px 2px;
  appearance: none;
  background: transparent;
  cursor: pointer;
}
.select:focus {
  border-bottom-color: var(--accent);
}
</style>
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(ui): Select primitive"`

---

### Task 3.6: `Toggle.vue`

**Files:**
- Create: `frontend/src/components/primitives/Toggle.vue`
- Create: `frontend/src/components/primitives/Toggle.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Toggle from './Toggle.vue'

describe('Toggle', () => {
  it('emits update on click', async () => {
    const w = mount(Toggle, { props: { modelValue: false } })
    await w.find('button').trigger('click')
    expect(w.emitted('update:modelValue')).toEqual([[true]])
  })
})
```

- [ ] **Step 2: Implement**

```vue
<script setup lang="ts">
interface Props {
  modelValue: boolean
  disabled?: boolean
}
defineProps<Props>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()
</script>

<template>
  <button
    type="button"
    :class="['toggle', { 'toggle--on': modelValue }]"
    :disabled="disabled"
    @click="emit('update:modelValue', !modelValue)"
  >
    <span class="knob" />
  </button>
</template>

<style scoped>
.toggle {
  position: relative;
  width: 28px;
  height: 16px;
  background: var(--border-strong);
  border-radius: 8px;
  padding: 0;
  transition: background-color var(--dur-med) var(--ease-out);
}
.toggle--on {
  background: var(--accent);
}
.knob {
  position: absolute;
  top: 1px;
  left: 1px;
  width: 14px;
  height: 14px;
  background: var(--bg);
  border-radius: var(--r-full);
  transition: transform var(--dur-med) var(--ease-out);
}
.toggle--on .knob {
  transform: translateX(12px);
}
</style>
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(ui): Toggle primitive"`

---

### Task 3.7: `Checkbox.vue`

**Files:**
- Create: `frontend/src/components/primitives/Checkbox.vue`
- Create: `frontend/src/components/primitives/Checkbox.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Checkbox from './Checkbox.vue'

describe('Checkbox', () => {
  it('toggles on click', async () => {
    const w = mount(Checkbox, { props: { modelValue: false, label: 'Opt' } })
    await w.find('button').trigger('click')
    expect(w.emitted('update:modelValue')).toEqual([[true]])
  })
})
```

- [ ] **Step 2: Implement**

```vue
<script setup lang="ts">
interface Props {
  modelValue: boolean
  label?: string
  disabled?: boolean
}
defineProps<Props>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()
</script>

<template>
  <label class="row">
    <button
      type="button"
      :class="['box', { 'box--on': modelValue }]"
      :disabled="disabled"
      @click="emit('update:modelValue', !modelValue)"
    >
      <svg v-if="modelValue" width="10" height="10" viewBox="0 0 10 10">
        <path d="M1 5 L4 8 L9 2" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" />
      </svg>
    </button>
    <span v-if="label" class="label">{{ label }}</span>
  </label>
</template>

<style scoped>
.row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text-2);
}
.box {
  width: 14px;
  height: 14px;
  border: 1px solid var(--border-strong);
  border-radius: 3px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-fg);
  transition: background-color var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out);
}
.box--on {
  background: var(--accent);
  border-color: var(--accent);
}
</style>
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(ui): Checkbox primitive"`

---

### Task 3.8: `Tooltip.vue`

**Files:**
- Create: `frontend/src/components/primitives/Tooltip.vue`
- Create: `frontend/src/components/primitives/Tooltip.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Tooltip from './Tooltip.vue'

describe('Tooltip', () => {
  it('reveals tooltip after hover delay', async () => {
    vi.useFakeTimers()
    const w = mount(Tooltip, {
      props: { text: 'Help' },
      slots: { default: '<button>hover me</button>' },
    })
    await w.find('.tip-trigger').trigger('mouseenter')
    vi.advanceTimersByTime(250)
    await w.vm.$nextTick()
    expect(w.text()).toContain('Help')
    vi.useRealTimers()
  })
})
```

- [ ] **Step 2: Implement**

```vue
<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
interface Props {
  text: string
  delay?: number
  placement?: 'top' | 'bottom' | 'left' | 'right'
}
const props = withDefaults(defineProps<Props>(), { delay: 200, placement: 'bottom' })
const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null
function enter() {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => (visible.value = true), props.delay)
}
function leave() {
  if (timer) clearTimeout(timer)
  timer = null
  visible.value = false
}
onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <span class="tip-trigger" @mouseenter="enter" @mouseleave="leave">
    <slot />
    <span v-if="visible" :class="['tip', `tip--${placement}`]">{{ text }}</span>
  </span>
</template>

<style scoped>
.tip-trigger {
  position: relative;
  display: inline-flex;
}
.tip {
  position: absolute;
  background: var(--surface-elev);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--r-sm);
  padding: 4px 8px;
  font-family: var(--mono);
  font-size: 11px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 100;
}
.tip--bottom {
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
}
.tip--top {
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
}
.tip--left {
  right: calc(100% + 4px);
  top: 50%;
  transform: translateY(-50%);
}
.tip--right {
  left: calc(100% + 4px);
  top: 50%;
  transform: translateY(-50%);
}
</style>
```

- [ ] **Step 3: Run + commit** — `git commit -m "feat(ui): Tooltip primitive with hover delay"`

---

### Phase 3 done when

- `pnpm run test` passes all primitive tests.
- No primitive has a hex literal in its `.vue` file.
- `pnpm run typecheck` is clean.
