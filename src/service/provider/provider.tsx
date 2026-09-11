'use client'

import { FC, ReactNode } from 'react'
import { Provider as JotaiProvider } from 'jotai'

export const Provider: FC<{ children: ReactNode }> = ({ children }) => {
  return <JotaiProvider>{children}</JotaiProvider>
}
