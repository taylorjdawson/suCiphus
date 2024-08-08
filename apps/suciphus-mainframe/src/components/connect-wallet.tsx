"use client"

import { useChainId, useConnect } from "wagmi"

import { suaveChain, suaveLocal } from "@/lib/suave"

import { Button } from "./ui/button"
import { useWallet } from "./wallet-provider"

export const ConnectWallet = () => {
  const chainId = useChainId()
  const { connectors, connect } = useConnect()
  const connector = connectors.filter(
    (connector) => connector.id === "metaMaskSDK"
  )[0]
  // const router = useRouter()
  // const pathname = usePathname()

  // useEffect(() => {
  //   if (connected && pathname !== "/player") {
  //     router.replace("/player")
  //   }
  // }, [connected])

  return (
    <Button
      onClick={() => {
        // @todo remove hardcode chain
        connect({ connector, chainId: suaveLocal.id })
      }}
    >
      Connect Wallet
    </Button>
  )
}
