import browser from 'webextension-polyfill'
import { ClonedContextNode } from '../../common/types'
// import { cloneContextSubtree } from '../../contentscript/helpers'

export interface OfflineContent {
  id: string
  url: string
  timestamp: number
  contextTree: ClonedContextNode
  tags: string[]
  parserId: string
}

export async function saveOfflineContent(content: OfflineContent): Promise<void> {
  const key = `offline_${content.id}`
  await browser.storage.local.set({ [key]: content })
}

export async function getOfflineContent(id: string): Promise<OfflineContent | null> {
  const key = `offline_${id}`
  const data = await browser.storage.local.get(key)
  return (data[key] as OfflineContent) || null
}

export async function getAllOfflineContent(): Promise<OfflineContent[]> {
  const data = await browser.storage.local.get(null)
  return Object.entries(data)
    .filter(([key]) => key.startsWith('offline_'))
    .map(([_, value]) => value as OfflineContent)
    .sort((a, b) => b.timestamp - a.timestamp)
}

export type SearchResult = OfflineContent

export async function searchOfflineContent(query: string, tags?: string[]): Promise<SearchResult[]> {
  const allContent = await getAllOfflineContent()
  return allContent.filter(content => {
    const matchesQuery = query ? 
      JSON.stringify(content.contextTree).toLowerCase().includes(query.toLowerCase()) : 
      true
    const matchesTags = tags?.length ? 
      tags.every(tag => content.tags.includes(tag)) : 
      true
    return matchesQuery && matchesTags
  })
}

export async function deleteOfflineContent(id: string): Promise<void> {
  const key = `offline_${id}`
  await browser.storage.local.remove(key)
}

export async function updateOfflineTags(id: string, tags: string[]): Promise<void> {
  const content = await getOfflineContent(id)
  if (!content) return

  const updatedContent = {
    ...content,
    tags
  }
  await saveOfflineContent(updatedContent)
} 