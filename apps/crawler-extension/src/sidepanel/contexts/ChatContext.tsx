import React, { createContext, useContext, useState, ReactNode } from 'react'

interface Message {
  role: string
  content: string
}

interface ChatContextType {
  messages: Record<string, Message[]>  // contentId -> messages
  addMessage: (contentId: string, message: Message) => void
  getMessages: (contentId: string) => Message[]
  clearMessages: (contentId: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Record<string, Message[]>>({})

  const addMessage = (contentId: string, message: Message) => {
    setMessages(prev => ({
      ...prev,
      [contentId]: [...(prev[contentId] || []), message]
    }))
  }

  const getMessages = (contentId: string) => {
    return messages[contentId] || []
  }

  const clearMessages = (contentId: string) => {
    setMessages(prev => {
      const newMessages = { ...prev }
      delete newMessages[contentId]
      return newMessages
    })
  }

  return (
    <ChatContext.Provider value={{ messages, addMessage, getMessages, clearMessages }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (undefined === context) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
} 