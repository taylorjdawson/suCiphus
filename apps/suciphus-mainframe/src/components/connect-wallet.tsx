"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useChainId, useConnect } from "wagmi"

import { suaveLocal } from "@/lib/wagmi"

import { Button } from "./ui/button"
import { useWallet } from "./wallet-provider"

export const ConnectWallet = () => {
  const chainId = useChainId()
  const { connectors, connect } = useConnect()
  const connector = connectors.filter(
    (connector) => connector.id === "metaMaskSDK"
  )[0]
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (connectors[0] && pathname !== "/player") {
      router.replace("/player")
    }
  }, [connectors])

  return (
    <Button
      onClick={() => {
        connect({ connector, chainId: suaveLocal.id })
      }}
    >
      Connect Wallet
    </Button>
  )
}
