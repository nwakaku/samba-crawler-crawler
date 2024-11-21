import React, { useState, useEffect, useRef } from 'react'
import { Input, Button, List, Typography, Space } from 'antd'
import { useChatContext } from '../contexts/ChatContext'
import Background from '../../common/background'
import { OfflineContent } from '../../background/services/offline-storage-service'

interface ChatServiceProps {
  content: OfflineContent
}

export const ChatService: React.FC<ChatServiceProps> = ({ content }) => {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { messages, addMessage, getMessages } = useChatContext()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!query.trim()) return

    try {
      setIsLoading(true)
      // Add user message immediately
      addMessage(content.id, { role: 'user', content: query })
      
      // Create a temporary placeholder for the AI response
      addMessage(content.id, { role: 'assistant', content: '...' })
      
      // Get response from background
      const response = await Background.chatWithContent(content.id, query)
      
      // Update the placeholder with actual response
      if (response) {
        // Remove the placeholder message
        const messages = getMessages(content.id)
        const lastMessage = messages[messages.length - 1]
        if (lastMessage.content === '...') {
          // Replace the last message with the actual response
          addMessage(content.id, { role: 'assistant', content: response })
        } else {
          // Add as new message if something went wrong with placeholder
          addMessage(content.id, { role: 'assistant', content: response })
        }
      }
      
      setQuery('')
    } catch (error) {
      console.error('Chat error:', error)
      // Remove the placeholder message if there was an error
      const messages = getMessages(content.id)
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.content === '...') {
        addMessage(content.id, { 
          role: 'error', 
          content: 'Failed to get response. Please check your API key and try again.' 
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const contentMessages = getMessages(content.id);

    console.log('Content messages:', contentMessages);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <List
        dataSource={contentMessages}
        renderItem={(message) => (
          <List.Item style={{
            backgroundColor: message.role === 'user' ? '#f0f2f5' : 'white',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '8px'
          }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Typography.Text strong style={{ 
                color: message.role === 'error' ? '#ff4d4f' : 
                       message.role === 'user' ? '#1890ff' : 
                       '#52c41a'
              }}>
                {message.role === 'user' ? 'You' : 
                 message.role === 'assistant' ? 'AI' : 
                 'Error'}:
              </Typography.Text>
              <Typography.Text style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {message.content}
              </Typography.Text>
            </Space>
          </List.Item>
        )}
      />
      <div ref={messagesEndRef} />
      <Space.Compact style={{ width: '100%' }}>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onPressEnter={handleSendMessage}
          placeholder="Ask a question about this content..."
          disabled={isLoading}
        />
        <Button 
          type="primary" 
          onClick={handleSendMessage} 
          loading={isLoading}
        >
          Send
        </Button>
      </Space.Compact>
    </Space>
  )
} 