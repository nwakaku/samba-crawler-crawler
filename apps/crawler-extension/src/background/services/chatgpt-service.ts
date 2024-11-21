import { ParserConfig } from '@mweb/core'
import {
  getChatGptApiKey,
  getOrganizationId,
  getProjectId,
  getAssistantId,
} from './settings-service'
import { getNameFromId } from '../helpers'

const SAMBANOVA_API_URL = 'https://api.sambanova.ai/v1/chat/completions'

export async function makeRequest(messages: Array<{role: string, content: string}>) {
  const apiKey = await getChatGptApiKey()
  
  if (!apiKey) {
    throw new Error('[AI Crawler] API key is not set')
  }

  console.log('Making API request with messages:', messages)
  
  const response = await fetch(SAMBANOVA_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      stream: false,
      model: 'Meta-Llama-3.1-8B-Instruct',
      messages: messages
    })
  })

  if (!response.ok) {
    console.error('API Error:', response.status, response.statusText)
    throw new Error(`API request failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data
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
