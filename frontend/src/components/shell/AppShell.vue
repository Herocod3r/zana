<script setup lang="ts">
import { computed, ref } from 'vue'
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
import { useWorkspaceStore } from '@/stores/workspaces'
import { useTabStore } from '@/stores/tabs'
import { useToastStore } from '@/stores/toasts'
import { api } from '@/services/api'

const workspaces = useWorkspaceStore()
const tabs = useTabStore()
const toasts = useToastStore()

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
  </div>
</template>

<style scoped>
.app { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
.main { flex: 1; display: flex; min-height: 0; }
</style>
