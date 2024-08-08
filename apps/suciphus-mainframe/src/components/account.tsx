"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AlertTriangle, Copy, Gem, HandCoins, LogOut } from "lucide-react"
import { useAccount, useChainId, useDisconnect, useSwitchChain } from "wagmi"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWallet } from "@/components/wallet-provider"

import AddCredits from "./add-credits"
import { ConnectWallet } from "./connect-wallet"
import { useSuaveWallet } from "./suave-provider"
import { Button } from "./ui/button"
import { Card } from "./ui/card"

export default function Account() {
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const { creditBalance } = useSuaveWallet()

  // const { account, creditBalance } = useWallet()
  const router = useRouter()
  const pathname = usePathname()

  if (!isConnected) {
    return <ConnectWallet />
  }
  const truncatedAddress = `${address?.slice(0, 8)}...${address?.slice(-6)}`

  return (
    <div className="flex items-center gap-4">
      <Card className="flex h-full items-center space-x-2 p-2">
        <HandCoins className="h-4 w-4" />
        <div className="space-x-1">
          <span className="text-center font-medium">{0}</span>
          <span className="text-xs font-bold text-muted-foreground">TETH</span>
        </div>
      </Card>
      <Card className="flex h-full items-center space-x-2 p-2">
        <Gem className="h-4 w-4" />
        <span className="text-center font-medium">
          {creditBalance?.toString() ?? 0}
        </span>
      </Card>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Card className="w-min cursor-pointer rounded-lg p-2">
            {truncatedAddress}
          </Card>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* <DropdownMenuLabel>
            0x1234567890abcdef1234567890abcdef12345678
          </DropdownMenuLabel>
          <DropdownMenuSeparator /> */}
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigator.clipboard.writeText(address ?? "")}
          >
            <Copy className="mr-2 h-4 w-4" />
            <span>Copy Address</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <HandCoins className="mr-2 h-4 w-4" />
            <span>Add Credits</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => disconnect()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
