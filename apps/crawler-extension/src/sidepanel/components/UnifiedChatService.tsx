import React, { useState, useEffect, useRef } from 'react'
import { Input, Button, List, Typography, Space } from 'antd'
import { useChatContext } from '../contexts/ChatContext'
import Background from '../../common/background'
import { OfflineContent } from '../../background/services/offline-storage-service'
import styled from 'styled-components'

const ChatContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
  z-index: 1000;
  padding: 16px;
`

const ChatMessages = styled.div`
  height: 300px;
  overflow-y: auto;
  margin-bottom: 16px;
  padding-right: 8px;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`

const MessageList = styled(List)`
  .ant-list-items {
    display: flex;
    flex-direction: column;
  }
`

interface UnifiedChatServiceProps {
  contents: OfflineContent[]
}

export const UnifiedChatService: React.FC<UnifiedChatServiceProps> = ({ contents }) => {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { messages, addMessage } = useChatContext()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!query.trim() || !contents.length) return

    try {
      setIsLoading(true)
      addMessage({ role: 'user', content: query })
      addMessage({ role: 'assistant', content: '...' })

      // Query all contents in parallel
      const responses = await Promise.all(
        contents.map(content => Background.chatWithContent(content.id, query))
      )

      // Combine responses
      const combinedResponse = responses
        .map((response, index) => `From ${contents[index].url}:\n${response}`)
        .join('\n\n')

      // Update the last message with actual response
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.content === '...') {
        addMessage({ role: 'assistant', content: combinedResponse })
      }

      setQuery('')
    } catch (error) {
      console.error('Chat error:', error)
      addMessage({
        role: 'error',
        content: 'Failed to get response. Please check your API key and try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ChatContainer>
      <ChatMessages>
        <MessageList
          dataSource={messages}
          renderItem={(message) => (
            <List.Item
              style={{
                backgroundColor: (message as {role: string}).role === 'user' ? '#f0f2f5' : 'white',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '8px',
                border: '1px solid #e8e8e8',
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Typography.Text
                  strong
                  style={{
                    color:
                      (message as {role: string}).role === 'error'
                        ? '#ff4d4f'
                        : (message as {role: string}).role === 'user'
                        ? '#1890ff'
                        : '#52c41a',
                  }}
                >
                  {(message as {role: string}).role === 'user' ? 'You' : (message as {role: string}).role === 'assistant' ? 'AI' : 'Error'}:
                </Typography.Text>
                <Typography.Text
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {(message as {role: string; content: string}).content}
                </Typography.Text>
              </Space>
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </ChatMessages>

      <Space.Compact style={{ width: '100%' }}>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onPressEnter={handleSendMessage}
          placeholder={
            contents.length
              ? "Ask a question about all saved content..."
              : "Save some content first to start chatting"
          }
          disabled={isLoading || !contents.length}
        />
        <Button
          type="primary"
          onClick={handleSendMessage}
          loading={isLoading}
          disabled={!contents.length}
        >
          Send
        </Button>
      </Space.Compact>
    </ChatContainer>
  )
}
