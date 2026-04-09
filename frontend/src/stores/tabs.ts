// frontend/src/stores/tabs.ts
import { defineStore } from 'pinia'
import type { Tab } from '@/types/models'
import { tabs as fixtureTabs, initialActiveTabByWorkspace } from '@/mocks/fixtures'

interface State {
  tabs: Tab[]
  activeByWorkspace: Record<string, string>
}

let tabSeq = 100
let splitSeq = 100
const newId = () => `tab-new-${++tabSeq}`
const newSplitId = () => `lf-new-${++splitSeq}`

export const useTabStore = defineStore('tabs', {
  state: (): State => ({ tabs: [], activeByWorkspace: {} }),
  actions: {
    load() {
      this.tabs = [...fixtureTabs]
      this.activeByWorkspace = { ...initialActiveTabByWorkspace }
    },
    tabsFor(workspaceId: string): Tab[] {
      return this.tabs.filter((t) => t.workspaceId === workspaceId)
    },
    activeTabId(workspaceId: string): string | null {
      return this.activeByWorkspace[workspaceId] ?? null
    },
    activeTab(workspaceId: string): Tab | null {
      const id = this.activeTabId(workspaceId)
      if (!id) return null
      return this.tabs.find((t) => t.id === id) ?? null
    },
    setActive(workspaceId: string, tabId: string) {
      this.activeByWorkspace[workspaceId] = tabId
    },
    newTab(workspaceId: string): Tab {
      const t: Tab = {
        id: newId(),
        workspaceId,
        name: `term-${this.tabsFor(workspaceId).length + 1}`,
        rootSplitId: newSplitId(),
      }
      this.tabs.push(t)
      this.activeByWorkspace[workspaceId] = t.id
      return t
    },
    closeTab(workspaceId: string, tabId: string) {
      const remaining = this.tabs.filter((t) => !(t.workspaceId === workspaceId && t.id === tabId))
      this.tabs = remaining
      if (this.tabsFor(workspaceId).length === 0) {
        // Invariant: every workspace always has at least one tab.
        this.newTab(workspaceId)
      } else if (this.activeByWorkspace[workspaceId] === tabId) {
        this.activeByWorkspace[workspaceId] = this.tabsFor(workspaceId)[0].id
      }
    },
    renameTab(tabId: string, name: string) {
      const t = this.tabs.find((x) => x.id === tabId)
      if (t) t.name = name
    },
    reorderTabs(workspaceId: string, orderedIds: string[]) {
      const inSet = new Set(orderedIds)
      const others = this.tabs.filter((t) => t.workspaceId !== workspaceId || !inSet.has(t.id))
      const reordered = orderedIds
        .map((id) => this.tabs.find((t) => t.id === id))
        .filter((t): t is Tab => !!t)
      this.tabs = [...others, ...reordered]
    },
  },
})
