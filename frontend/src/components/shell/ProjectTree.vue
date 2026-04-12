<script setup lang="ts">
import ProjectRow from './ProjectRow.vue'
import WorkspaceRow from './WorkspaceRow.vue'
import Button from '@/components/primitives/Button.vue'
import { useProjectStore } from '@/stores/projects'
import { useWorkspaceStore } from '@/stores/workspaces'
import { useTabStore } from '@/stores/tabs'
import { useTerminalStore } from '@/stores/terminals'
import type { ActivityState } from '@/types/models'

const projects = useProjectStore()
const workspaces = useWorkspaceStore()
const tabs = useTabStore()
const terminals = useTerminalStore()

function rolledUp(workspaceId: string): ActivityState {
  let state: ActivityState = 'idle'
  const order: Record<ActivityState, number> = { idle: 0, recent: 1, active: 2 }
  for (const t of tabs.tabsFor(workspaceId)) {
    const s = terminals.rolledUpState(t.id)
    if (order[s] > order[state]) state = s
  }
  return state
}
</script>

<template>
  <div class="tree">
    <header class="section-head">PROJECTS</header>

    <template v-if="projects.projects.length > 0">
      <div v-for="p in projects.projects" :key="p.id" class="group">
        <ProjectRow :project="p" :expanded="projects.isExpanded(p.id)" @toggle="projects.toggleExpand(p.id)" />
        <template v-if="projects.isExpanded(p.id)">
          <WorkspaceRow
            v-for="w in workspaces.byProject(p.id)"
            :key="w.id"
            :workspace="w"
            :active="workspaces.activeWorkspaceId === w.id"
            :state="rolledUp(w.id)"
            @select="workspaces.select(w.id)"
          />
        </template>
      </div>
    </template>

    <div v-else class="empty">
      <p class="empty-text">No projects yet</p>
      <Button variant="ghost" size="sm">Add project</Button>
    </div>
  </div>
</template>

<style scoped>
.tree { padding: 8px 0 12px; }
.section-head {
  padding: 8px 12px;
  color: var(--text-muted);
  font-family: var(--mono);
  font-size: var(--font-size-ui);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.group { margin-bottom: 4px; }
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 12px;
}
.empty-text { color: var(--text-muted); font-family: var(--mono); font-size: var(--font-size-ui); margin: 0; }
</style>
