"use client"

import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"

import { config } from "@/lib/wagmi"

import { SuaveWalletProvider } from "./suave-provider"

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SuaveWalletProvider>{children}</SuaveWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
