"use client"
import { ConnectWallet } from "@/components/connect-wallet"
import { Prompt } from "@/components/prompt"
import { useWallet } from '@/components/wallet-provider'

export default function Stats() {
  const { suaveWallet } = useWallet()
  return (
    <main className="flex h-screen items-center justify-center">
      <div className="w-1/3">
        <Prompt />
        {!suaveWallet && <ConnectWallet />}
      </div>
    </main>
  )
}
