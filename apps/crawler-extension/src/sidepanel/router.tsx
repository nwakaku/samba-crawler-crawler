import React, { useEffect } from 'react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { CollectedData } from './pages/collected-data'
import { Default } from './pages/default'
import { NoParsers } from './pages/no-parsers'
import ContentScript from './content-script'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Layout } from './components/layout'
import { Button, Typography } from 'antd'
import { OfflineContent } from './pages/offline-content'

const NavigationWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient()
  const location = useLocation()

  useEffect(() => {
    const { unsubscribe } = ContentScript.onActiveTabChange(() => {
      queryClient.clear()
    })

    return unsubscribe
  }, [])

  const { data: isAlive } = useQuery({
    queryKey: ['ping'],
    queryFn: ContentScript.ping,
    refetchInterval: 1000,
  })

  const { mutate: reloadCurrentTab, isPending: isPageReloading } = useMutation({
    mutationFn: ContentScript.reloadCurrentTab,
  })

  if (!isAlive && location.pathname !== '/offline-content') {
    return (
      <Layout>
        <Typography.Text style={{ textAlign: 'center' }}>
          No connection to the context page. Please reload the webpage.
        </Typography.Text>
        <Button type="primary" onClick={() => reloadCurrentTab()} loading={isPageReloading}>
          Reload Page
        </Button>
      </Layout>
    )
  }

  return <>{children}</>
}

export const Router: React.FC = () => {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route
          path="/"
          element={
            <NavigationWrapper>
              <Default />
            </NavigationWrapper>
          }
        />
        <Route
          path="/offline-content"
          element={
            <NavigationWrapper>
              <OfflineContent />
            </NavigationWrapper>
          }
        />
        <Route
          path="/collected-data"
          element={
            <NavigationWrapper>
              <CollectedData />
            </NavigationWrapper>
          }
        />
        <Route
          path="/no-parsers"
          element={
            <NavigationWrapper>
              <NoParsers />
            </NavigationWrapper>
          }
        />
      </Routes>
    </MemoryRouter>
  )
}
