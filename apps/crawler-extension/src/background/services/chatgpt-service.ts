import { ParserConfig } from '@mweb/core'
import {
  getChatGptApiKey,
  getOrganizationId,
  getProjectId,
  getAssistantId,
} from './settings-service'
import { getNameFromId } from '../helpers'

const SAMBANOVA_API_URL = 'https://api.sambanova.ai/v1/chat/completions'

async function makeRequest(messages: Array<{role: string, content: string}>) {
  const apiKey = await getChatGptApiKey()
  
  if (!apiKey) {
    throw new Error('[AI Crawler] API key is not set')
  }

  const response = await fetch(SAMBANOVA_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      stream: true,
      model: 'Meta-Llama-3.1-8B-Instruct',
      messages: messages
    })
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  let fullContent = ''
  
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    
    // Convert the Uint8Array to text
    const chunk = new TextDecoder().decode(value)
    const lines = chunk.split('\n').filter(line => line.trim() !== '')
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6) // Remove 'data: ' prefix
        try {
          const jsonData = JSON.parse(jsonStr)
          if (jsonData.choices?.[0]?.message?.content) {
            fullContent = jsonData.choices[0].message.content
          }
        } catch (e) {
          // Skip invalid JSON chunks
          continue
        }
      }
    }
  }

  return {
    choices: [{
      message: {
        content: fullContent
      }
    }]
  }
}

export async function generateParserConfigByUrl(url: string): Promise<ParserConfig | null> {
  const parsedUrl = new URL(url)

  const messages = [
    {
      role: 'system',
      content: 'You are an AI assistant that creates web parsers. Output only valid JSON.'
    },
    {
      role: 'user', 
      content: `Create a parser configuration for ${url}`
    }
  ]

  try {
    const response = await makeRequest(messages)
    
    if (response.choices && response.choices[0]?.message?.content) {
      const parserConfig = JSON.parse(response.choices[0].message.content)
      
      return {
        ...parserConfig,
        id: `bos.dapplets.near/parser/${parsedUrl.hostname}`,
        parserType: 'json',
        targets: [
          { namespace: 'engine', contextType: 'website', if: { id: { eq: parsedUrl.hostname } } },
        ],
      }
    }
  } catch (error) {
    console.error('Parser generation failed:', error)
  }

  return null
}

export async function improveParserConfig(
  parserConfig: ParserConfig & { threadId?: string; targets: any[] },
  html: string
): Promise<ParserConfig | null> {
  const messages = [
    {
      role: 'system',
      content: 'You are an AI assistant that improves web parsers. Output only valid JSON.'
    },
    {
      role: 'user',
      content: `Improve this parser configuration:\n${JSON.stringify(parserConfig)}\nWith this HTML:\n${html}`
    }
  ]

  try {
    const response = await makeRequest(messages)

    if (response.choices && response.choices[0]?.message?.content) {
      const newParserConfig = JSON.parse(response.choices[0].message.content)
      
      return {
        ...newParserConfig,
        id: parserConfig.id,
        parserType: 'json',
        targets: parserConfig.targets,
      }
    }
  } catch (error) {
    console.error('Parser improvement failed:', error)
  }

  return null
}
