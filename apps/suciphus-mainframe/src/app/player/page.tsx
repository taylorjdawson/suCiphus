import { ConnectWallet } from "@/components/connect-wallet"
import { Prompt } from "@/components/prompt"

export default function Stats() {
  return (
    <main className="flex h-screen items-center justify-center">
      <div className="w-1/3">
        <Prompt />
        <ConnectWallet />
      </div>
    </main>
  )
}
