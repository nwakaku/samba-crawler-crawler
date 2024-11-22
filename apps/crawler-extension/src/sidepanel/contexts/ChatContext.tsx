import React, { createContext, useContext, useState, ReactNode } from 'react'

interface Message {
  role: string
  content: string
}

interface ChatContextType {
  messages: Message[]
  addMessage: (message: Message) => void
  clearMessages: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message])
  }

  const clearMessages = () => {
    setMessages([])
  }

  return (
    <ChatContext.Provider value={{ messages, addMessage, clearMessages }}>
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