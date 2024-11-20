import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Button, Flex, Form, Input, message, Space } from 'antd'

import Background from '../common/background'
import { crawlerConfig } from '../common/networks'

export const App: React.FC = () => {
  const [form] = Form.useForm()
  const [isApiKeyNotSet, setIsApiKeyNotSet] = useState(false)

  const loadData = useCallback(async () => {
    const [chatGptApiKey, storageServerUrl] = await Promise.all([
      Background.getChatGptApiKey(),
      Background.getStorageServerUrl(),
    ])

    setIsApiKeyNotSet(!chatGptApiKey)

    form.setFieldsValue({
      chatGptApiKey,
      storageServerUrl,
    })
  }, [form])

  useEffect(() => {
    loadData()
  }, [form])

  const onFinish = async () => {
    await Promise.all([
      Background.setChatGptApiKey(form.getFieldValue('chatGptApiKey') ?? null),
      Background.setStorageServerUrl(form.getFieldValue('storageServerUrl') ?? null),
    ])
    await loadData()
  }

  return (
    <div>
      <h1>Options</h1>
      <Flex gap="middle" vertical>
        {isApiKeyNotSet ? (
          <Alert
            message="Enter your SambaNova API key"
            description="This allows you to parse websites using SambaNova's LLM capabilities. Get your API key at: https://api.sambanova.ai/"
            type="info"
            showIcon
          />
        ) : null}
        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item 
            name="chatGptApiKey" 
            label="SambaNova API Key"
            help="API key for accessing SambaNova's LLM services"
          >
            <Input placeholder="aae4065b-497b-4897-93a5-XXXXXXXXXXXXX" />
          </Form.Item>
          <Form.Item name="storageServerUrl" label="Storage Server URL">
            <Input placeholder={crawlerConfig.storageServerUrl} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Flex>
    </div>
  )
}
