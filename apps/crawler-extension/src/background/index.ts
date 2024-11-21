import { setupMessageListener } from 'chrome-extension-message-wrapper'
import browser from 'webextension-polyfill'
import ServiceFunctions from './services'
import { searchOfflineContent, type SearchResult } from './services/offline-storage-service'

export type BgFunctions = typeof ServiceFunctions

browser.runtime.onMessage.addListener(setupMessageListener(ServiceFunctions))

export default {
  // ... existing methods ...
  searchOfflineContent: async (query: string, tags?: string[]): Promise<SearchResult[]> => {
    return searchOfflineContent(query, tags)
  },
  saveOfflineContent: async (content: { id: string }): Promise<void> => {
    const key = `offline_${content.id}`
    await browser.storage.local.set({ [key]: content })
  },
}
