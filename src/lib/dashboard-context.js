'use client'

import { createContext } from 'react'

const DashboardContext = createContext(null)

export function DashboardProvider({ user, profile, children }) {
  return (
    <DashboardContext.Provider value={{ user, profile }}>
      {children}
    </DashboardContext.Provider>
  )
}
