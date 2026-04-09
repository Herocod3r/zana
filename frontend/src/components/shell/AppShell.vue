<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref } from 'vue'
import Sidebar from './Sidebar.vue'
import RightRegion from './RightRegion.vue'
import StatusBar from './StatusBar.vue'
import ProjectTree from './ProjectTree.vue'
import SidebarFooter from './SidebarFooter.vue'
import TabBar from './TabBar.vue'
import TerminalArea from './TerminalArea.vue'
import ModalPortal from '@/components/overlays/ModalPortal.vue'
import AddProjectDialog from '@/components/overlays/AddProjectDialog.vue'
import NewWorkspaceDialog from '@/components/overlays/NewWorkspaceDialog.vue'
import SettingsModal from '@/components/overlays/SettingsModal.vue'
import ToastHost from '@/components/overlays/ToastHost.vue'
import ContextMenu from '@/components/overlays/ContextMenu.vue'
import { useContextMenu } from '@/lib/useContextMenu'
import { registerKeybinds } from '@/lib/keybinds'
import { useWorkspaceStore } from '@/stores/workspaces'
import { useTabStore } from '@/stores/tabs'
import { useTerminalStore } from '@/stores/terminals'
import { useToastStore } from '@/stores/toasts'
import { useThemeStore } from '@/stores/theme'
import { api } from '@/services/api'
import type { SplitNode } from '@/types/models'

const workspaces = useWorkspaceStore()
const tabs = useTabStore()
const terminals = useTerminalStore()
const toasts = useToastStore()
const menu = useContextMenu()

const showTabBar = computed(
  () => workspaces.activeWorkspaceId !== null && tabs.tabsFor(workspaces.activeWorkspaceId).length > 1,
)

const addProjectOpen = ref(false)
const newWorkspaceOpen = ref(false)
const settingsOpen = ref(false)

function onAddProject() { addProjectOpen.value = true }
function onOpenSettings() { settingsOpen.value = true }
function onAddProjectSubmit(path: string) {
  api.addProject(path)
  toasts.show({ message: `Added ${path}`, variant: 'success' })
  addProjectOpen.value = false
}
function onNewWorkspaceSubmit(payload: { projectId: string; name: string; branch: string; baseBranch: string; createNewBranch: boolean }) {
  const ws = api.createWorkspace(payload.projectId, payload.name, payload.branch)
  workspaces.select(ws.id)
  toasts.show({ message: `Workspace ${ws.name} created`, variant: 'success' })
  newWorkspaceOpen.value = false
}

function showWorkspaceMenu(ev: MouseEvent, workspaceId: string) {
  menu.show(
    ev,
    [
      { id: 'rename', label: 'Rename' },
      { id: 'duplicate', label: 'Duplicate branch' },
      { id: 'delete', label: 'Delete', destructive: true },
    ],
    (id) => {
      if (id === 'delete') api.deleteWorkspace(workspaceId)
      else toasts.show({ message: `${id} not implemented`, variant: 'info' })
    },
  )
}

function showTabMenu(ev: MouseEvent, tabId: string, workspaceId: string) {
  menu.show(
    ev,
    [
      { id: 'rename', label: 'Rename' },
      { id: 'close', label: 'Close', destructive: true, shortcut: '⌘W' },
    ],
    (id) => {
      if (id === 'close') api.closeTab(workspaceId, tabId)
      else toasts.show({ message: `${id} not implemented`, variant: 'info' })
    },
  )
}

function showPaneMenu(ev: MouseEvent, tabId: string, leafId: string) {
  const tree = terminals.treeFor(tabId)
  const canDetach = !!(tree && tree.kind === 'branch')
  menu.show(
    ev,
    [
      { id: 'split-right', label: 'Split right', shortcut: '⌘D' },
      { id: 'split-down', label: 'Split down', shortcut: '⌘⇧D', separatorAfter: true },
      { id: 'move-new-tab', label: 'Move to new tab', shortcut: '⌘⇧↵', disabled: !canDetach, separatorAfter: true },
      { id: 'close', label: 'Close pane', shortcut: '⌘⇧W', destructive: true },
    ],
    (id) => {
      if (id === 'split-right') terminals.splitPane(tabId, leafId, 'row')
      if (id === 'split-down') terminals.splitPane(tabId, leafId, 'column')
      if (id === 'close') terminals.closeLeaf(tabId, leafId)
      if (id === 'move-new-tab' && canDetach && tree) {
        if (!workspaces.activeWorkspaceId) return
        const newTab = tabs.newTab(workspaces.activeWorkspaceId)
        function findLeaf(n: SplitNode): { kind: 'leaf'; id: string; terminalId: string } | null {
          if (n.kind === 'leaf') return n.id === leafId ? n : null
          return findLeaf(n.a) || findLeaf(n.b)
        }
        const leaf = findLeaf(tree)
        if (leaf) {
          terminals.setTreeFor(newTab.id, { kind: 'leaf', id: `lf-moved-${Date.now()}`, terminalId: leaf.terminalId })
          terminals.closeLeaf(tabId, leafId)
          tabs.setActive(workspaces.activeWorkspaceId, newTab.id)
        }
      }
    },
  )
}

provide('showPaneMenu', showPaneMenu)
provide('showTabMenu', showTabMenu)
provide('showWorkspaceMenu', showWorkspaceMenu)

// --- central keybinds (Phase 11) ----------------------------------------

function withActiveTab(fn: (workspaceId: string, tabId: string) => void) {
  if (!workspaces.activeWorkspaceId) return
  const tabId = tabs.activeTabId(workspaces.activeWorkspaceId)
  if (!tabId) return
  fn(workspaces.activeWorkspaceId, tabId)
}

function withFocusedLeaf(fn: (workspaceId: string, tabId: string, leafId: string) => void) {
  withActiveTab((workspaceId, tabId) => {
    const leafId = terminals.focusedLeaf(tabId)
    if (!leafId) return
    fn(workspaceId, tabId, leafId)
  })
}

function splitFocused(direction: 'row' | 'column') {
  withFocusedLeaf((_, tabId, leafId) => terminals.splitPane(tabId, leafId, direction))
}

function closeFocusedPane() {
  withFocusedLeaf((_, tabId, leafId) => terminals.closeLeaf(tabId, leafId))
}

function closeCurrentTab() {
  withActiveTab((workspaceId, tabId) => api.closeTab(workspaceId, tabId))
}

function newCurrentTab() {
  if (workspaces.activeWorkspaceId) tabs.newTab(workspaces.activeWorkspaceId)
}

function spawnOrSplit() {
  withActiveTab((workspaceId, tabId) => {
    const tree = terminals.treeFor(tabId)
    const emptyLeaf = tree && tree.kind === 'leaf' && !terminals.terminal(tree.terminalId)
    if (!tree || emptyLeaf) {
      const id = `t-spawn-${Date.now()}`
      const ws = workspaces.workspaces.find((w) => w.id === workspaceId)
      terminals.terminalsById[id] = {
        id,
        tabId,
        cwd: ws?.worktreePath ?? '/',
        command: 'zsh',
        scrollback: ['$ _'],
        lastOutputAt: Date.now(),
      }
      terminals.setTreeFor(tabId, { kind: 'leaf', id: `lf-spawn-${Date.now()}`, terminalId: id })
      return
    }
    const leafId = terminals.focusedLeaf(tabId)
    if (leafId) terminals.splitPane(tabId, leafId, 'row')
  })
}

function moveFocusedPaneToNewTab() {
  withFocusedLeaf((workspaceId, tabId, leafId) => {
    const tree = terminals.treeFor(tabId)
    if (!tree || tree.kind === 'leaf') return
    let terminalId: string | null = null
    const stack: SplitNode[] = [tree]
    while (stack.length) {
      const n = stack.pop()!
      if (n.kind === 'leaf' && n.id === leafId) {
        terminalId = n.terminalId
        break
      }
      if (n.kind === 'branch') {
        stack.push(n.a, n.b)
      }
    }
    if (!terminalId) return
    const newTab = tabs.newTab(workspaceId)
    terminals.setTreeFor(newTab.id, { kind: 'leaf', id: `lf-moved-${Date.now()}`, terminalId })
    terminals.closeLeaf(tabId, leafId)
    tabs.setActive(workspaceId, newTab.id)
  })
}

function cycleTab(delta: number) {
  if (!workspaces.activeWorkspaceId) return
  const list = tabs.tabsFor(workspaces.activeWorkspaceId)
  if (list.length === 0) return
  const currentId = tabs.activeTabId(workspaces.activeWorkspaceId)
  const idx = Math.max(0, list.findIndex((t) => t.id === currentId))
  const next = list[(idx + delta + list.length) % list.length]
  tabs.setActive(workspaces.activeWorkspaceId, next.id)
}

function cycleWorkspace(delta: number) {
  const list = workspaces.workspaces
  if (list.length === 0) return
  const idx = Math.max(0, list.findIndex((w) => w.id === workspaces.activeWorkspaceId))
  const next = list[(idx + delta + list.length) % list.length]
  workspaces.select(next.id)
}

function cyclePaneFocus(delta: number) {
  withActiveTab((_, tabId) => {
    const tree = terminals.treeFor(tabId)
    if (!tree) return
    const leaves: string[] = []
    const stack: SplitNode[] = [tree]
    while (stack.length) {
      const n = stack.pop()!
      if (n.kind === 'leaf') leaves.push(n.id)
      else {
        stack.push(n.b, n.a)
      }
    }
    if (leaves.length === 0) return
    const current = terminals.focusedLeaf(tabId)
    const idx = Math.max(0, leaves.indexOf(current ?? ''))
    const next = leaves[(idx + delta + leaves.length) % leaves.length]
    terminals.setFocus(tabId, next)
  })
}

let unbind: (() => void) | null = null
onMounted(() => {
  unbind = registerKeybinds({
    'mod+shift+n': () => { addProjectOpen.value = true },
    'mod+n': () => { newWorkspaceOpen.value = true },
    'mod+t': () => newCurrentTab(),
    'mod+shift+t': () => spawnOrSplit(),
    'mod+w': () => closeCurrentTab(),
    'mod+shift+w': () => closeFocusedPane(),
    'mod+d': () => splitFocused('row'),
    'mod+shift+d': () => splitFocused('column'),
    'mod+shift+enter': () => moveFocusedPaneToNewTab(),
    'mod+alt+right': () => cycleTab(1),
    'mod+alt+left': () => cycleTab(-1),
    'mod+alt+up': () => cycleWorkspace(-1),
    'mod+alt+down': () => cycleWorkspace(1),
    'mod+]': () => cyclePaneFocus(1),
    'mod+[': () => cyclePaneFocus(-1),
    'mod+,': () => { settingsOpen.value = true },
    'mod+shift+l': () => { useThemeStore().cycle() },
  })
})
onBeforeUnmount(() => {
  unbind?.()
})
</script>

<template>
  <div class="app">
    <div class="main">
      <Sidebar>
        <template #tree><ProjectTree /></template>
        <template #footer>
          <SidebarFooter @add-project="onAddProject" @open-settings="onOpenSettings" />
        </template>
      </Sidebar>
      <RightRegion>
        <template #tabbar>
          <TabBar v-if="showTabBar" />
        </template>
        <template #area><TerminalArea /></template>
      </RightRegion>
    </div>
    <StatusBar />
    <ModalPortal />
    <ToastHost />
    <AddProjectDialog :open="addProjectOpen" @submit="onAddProjectSubmit" @cancel="addProjectOpen = false" />
    <NewWorkspaceDialog
      :open="newWorkspaceOpen"
      :project-id="workspaces.active?.projectId ?? ''"
      :base-branches="['main', 'develop']"
      @submit="onNewWorkspaceSubmit"
      @cancel="newWorkspaceOpen = false"
    />
    <SettingsModal :open="settingsOpen" @close="settingsOpen = false" />
    <ContextMenu
      :open="menu.open.value"
      :x="menu.x.value"
      :y="menu.y.value"
      :items="menu.items.value"
      @select="menu.select"
      @close="menu.close"
    />
  </div>
</template>

<style scoped>
.app { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
.main { flex: 1; display: flex; min-height: 0; }
</style>
