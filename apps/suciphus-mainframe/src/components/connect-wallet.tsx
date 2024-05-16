"use client"

import { Button } from "./ui/button"
import { useWallet } from "./wallet-provider"

export const ConnectWallet = () => {
  const { connectWallet } = useWallet()

  return <Button onClick={connectWallet}>Connect Wallet</Button>
}
