import React, { createContext, ReactNode, useContext, useState } from "react"

import { Thread } from "@/components/suave-provider"

interface CurrentThreadContextType {
  currentThread: Thread | null
  setCurrentThread: React.Dispatch<React.SetStateAction<Thread | null>>
}

const CurrentThreadContext = createContext<
  CurrentThreadContextType | undefined
>(undefined)

export const CurrentThreadProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [currentThread, setCurrentThread] = useState<Thread | null>(null)

  return (
    <CurrentThreadContext.Provider value={{ currentThread, setCurrentThread }}>
      {children}
    </CurrentThreadContext.Provider>
  )
}

export const useCurrentThread = () => {
  const context = useContext(CurrentThreadContext)
  if (!context) {
    throw new Error(
      "useCurrentThread must be used within a CurrentThreadProvider"
    )
  }
  return context
}
