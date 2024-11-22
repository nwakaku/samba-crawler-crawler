import { ControlOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Card, Flex, Layout,Typography, Button } from 'antd'
import React, { FC } from 'react'
import browser from 'webextension-polyfill'
import Background from '../common/background'
import { utils } from 'near-api-js'

export const Popup: FC = () => {

  const { Title, Text } = Typography;
 

  const { data: contextCount } = useQuery({
    queryKey: ['contextCount'],
    queryFn: Background.getContextCount,
    refetchInterval: 1000,
  })

  const { data: claimableAmount, isFetching: isClaimableAmountFetching } = useQuery({
    queryKey: ['claimableAmount'],
    queryFn: Background.getAvailableToClaimAmount,
    initialData: '0',
  })

  const { data: potentialAmount } = useQuery({
    queryKey: ['potentialAmount'],
    queryFn: Background.getPotentialAmount,
    initialData: '0',
    refetchInterval: 1000,
  })


  

  const { mutate: claimTokens, isPending: isClaiming } = useMutation({
    mutationFn: Background.claimTokens,
  })

  const handleSidePanelButtonClick = async () => {
    const [currentTab] = await browser.tabs.query({ currentWindow: true, active: true })
    // @ts-ignore
    await browser.sidePanel.open({ tabId: currentTab.id, windowId: currentTab.windowId })
    window.close()
  }

  

  const handleClaimClick = () => {
    claimTokens()
  }

  const titleColor = '#df5a16'


  return (
    <Layout style={{ width: 300, padding: 16 }}>
      <Flex gap="middle" vertical>
        <Title level={4} style={{ margin: 0, color: titleColor }}>
          Samba Crawler
        </Title>

        <Flex gap="small" justify="center">
          <Card size="small" style={{ flex: 1 }}>
            <Card.Meta title={contextCount?.toString()} description="Items parsed" />
          </Card>
          <Card size="small" style={{ flex: 1 }}>
            <Card.Meta
              title={`${utils.format.formatNearAmount(potentialAmount)} USD`}
              description="Expected Price"
            />
          </Card>
        </Flex>
        <Card size="small" style={{ flex: 1 }}>
          {isClaimableAmountFetching ? (
            <Card.Meta title="Loading..." description="Available to claim" />
          ) : (
            <Flex gap="small" justify="space-between" align="center">
              <Card.Meta
                title={`${utils.format.formatNearAmount(claimableAmount)} USD`}
                description="Available to claim"
              />
              {claimableAmount !== '0' ? (
                <Button
                  type="primary"
                  onClick={handleClaimClick}
                  loading={isClaiming}
                  disabled
                >
                  Claim
                </Button>
              ) : null}
            </Flex>
          )}
        </Card>
        <Flex vertical gap="small" style={{ width: '100%' }}>
          <Button block icon={<ControlOutlined />} onClick={handleSidePanelButtonClick}>
            Open side panel
          </Button>
        </Flex>
      </Flex>
    </Layout>
  )
}
