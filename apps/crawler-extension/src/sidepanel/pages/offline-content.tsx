import React, { useState } from 'react'
import { Layout, Input, Tag, List, Space, Typography, Empty, Card, Descriptions, Alert } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import Background from '../../background'
import { TreeTraverser } from '../components/tree-traverser'
import ContentScript from '../content-script'
import { ClonedContextNode } from '../../common/types'
import { SearchResult } from '../../background/services/offline-storage-service'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { ChatProvider } from '../contexts/ChatContext'
import { UnifiedChatService } from '../components/UnifiedChatService'

interface OfflineContent {
  id: string
  url: string
  timestamp: number
  contextTree: ClonedContextNode
  tags: string[]
  parserId: string
}

export const OfflineContent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const { data: offlineContent, isLoading, error } = useQuery<SearchResult[], Error, OfflineContent[]>({
    queryKey: ['offlineContent', searchQuery, selectedTags],
    queryFn: () => Background.searchOfflineContent(searchQuery, selectedTags),
    refetchInterval: false,
    initialData: [],
    select: (data) => data.map(result => ({
      id: result.id,
      url: result.url,
      timestamp: result.timestamp,
      contextTree: result.contextTree,
      tags: result.tags,
      parserId: result.parserId
    }))
  })

  if (error) {
    return (
      <Layout style={{ padding: 16 }}>
        <Typography.Text type="danger">
          Error loading offline content: {error instanceof Error ? error.message : 'Unknown error'}
        </Typography.Text>
      </Layout>
    )
  }

  if (isLoading) {
    return (
      <Layout style={{ padding: 16 }}>
        <Typography.Text>Loading offline content...</Typography.Text>
      </Layout>
    )
  }

  const uniqueTags = Array.from(new Set(offlineContent?.flatMap(c => c.tags) || []))

  return (
    <ChatProvider>
      <Layout style={{ padding: 16 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Input.Search
            placeholder="Search saved content..."
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
          />
          {uniqueTags.length > 0 && (
            <Space wrap>
              {uniqueTags.map((tag) => (
                <Tag
                  key={tag}
                  color={selectedTags.includes(tag) ? 'blue' : undefined}
                  onClick={() =>
                    setSelectedTags((prev) =>
                      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                    )
                  }
                  style={{ cursor: 'pointer' }}
                >
                  {tag}
                </Tag>
              ))}
            </Space>
          )}
          {offlineContent?.length ? (
            <List
              dataSource={offlineContent}
              renderItem={(item: OfflineContent) => (
                <List.Item>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Typography.Link href={item.url} target="_blank" rel="noopener noreferrer">
                      {item.url}
                    </Typography.Link>
                    <Typography.Text type="secondary">
                      Saved {new Date(item.timestamp).toLocaleString()}
                    </Typography.Text>
                    <TreeTraverser 
                      node={item.contextTree} 
                      component={({ node }) => (
                        <Card size="small" styles={{ body: { padding: 8 } }}>
                          <Descriptions size="small">
                            <Descriptions.Item style={{ padding: 4 }} label="Namespace">
                              {node.namespace}
                            </Descriptions.Item>
                            <Descriptions.Item style={{ padding: 4 }} label="Context Type">
                              {node.contextType}
                            </Descriptions.Item>
                            <Descriptions.Item style={{ padding: 4 }} label="ID">
                              {node.id}
                            </Descriptions.Item>
                            {Object.entries(node.parsedContext).map(([key, value]: [string, any]) => (
                              <Descriptions.Item style={{ padding: 4 }} key={key} label={key}>
                                {value}
                              </Descriptions.Item>
                            ))}
                          </Descriptions>
                        </Card>
                      )}
                    />
                    <ErrorBoundary fallback={
                      <Alert
                        message="Chat Service Error"
                        description="Please ensure your API key is set in the extension settings."
                        type="error"
                        showIcon
                      />
                    }>
                      <UnifiedChatService contents={offlineContent} />
                    </ErrorBoundary>
                  </Space>
                </List.Item>
              )}
            />
          ) : (
            <Empty description="No offline content found" />
          )}
        </Space>
      </Layout>
    </ChatProvider>
  )
} 