import { getOfflineContent } from './offline-storage-service'
import { makeRequest } from './chatgpt-service'

export async function chatWithContent(contentId: string, query: string): Promise<string> {
  const content = await getOfflineContent(contentId)
  if (!content) throw new Error('Content not found')

  const messages = [
    {
      role: 'system',
      content: `You are an AI assistant analyzing web content. The content is from: ${content.url}`
    },
    {
      role: 'user',
      content: `Given this context tree: ${JSON.stringify(content.contextTree)}\n\nQuestion: ${query}`
    }
  ]

  console.log('Chat Request:', { contentId, query, messages })
  const response = await makeRequest(messages)
  console.log('Chat Response:', response)
  
  return response.choices[0].message.content;
} 