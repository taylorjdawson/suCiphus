"use client"

import { usePathname, useRouter } from "next/navigation"
import { formatEther } from "@flashbots/suave-viem/utils"
import { Copy, Gem, LogOut, WalletIcon } from "lucide-react"
import Jazzicon, { jsNumberForAddress } from "react-jazzicon"
import { useAccount, useBalance, useDisconnect } from "wagmi"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import AddCredits from "./add-credits"
import { ConnectWallet } from "./connect-wallet"
import { MobileMenu } from "./mobile-menu"
import { useSuaveWallet } from "./suave-provider"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Card } from "./ui/card"

const WHALE_BALANCE = 10000000000000000000000n

export default function Account() {
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()
  const { creditBalance } = useSuaveWallet()
  const { data: balance } = useBalance({
    address,
  })

  if (!isConnected) {
    return <ConnectWallet />
  }
  const truncatedAddress = `${address?.slice(0, 8)}...${address?.slice(-6)}`

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <Card className=" hidden h-full items-center space-x-2 p-2 sm:flex">
        <WalletIcon className="h-4 w-4" />
        <div className="space-x-1">
          <span className="text-center font-medium">
            {balance?.value && balance.value > WHALE_BALANCE
              ? "🐳 🐳 🐳"
              : Number(formatEther(balance?.value ?? 0n)).toFixed(2)}
          </span>
          <span className="text-xs font-bold text-muted-foreground">TETH</span>
        </div>
      </Card>

      <AddCredits>
        <Card className="flex h-full cursor-pointer items-center space-x-2 p-2">
          <Gem className="h-4 w-4" />
          <span className="text-center font-medium">
            {creditBalance?.toString() ?? 0}
          </span>
        </Card>
      </AddCredits>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Card className="w-min cursor-pointer rounded-lg p-2">
            {truncatedAddress}
          </Card>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigator.clipboard.writeText(address ?? "")}
          >
            <Copy className="mr-2 h-4 w-4" />
            <span>Copy Address</span>
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

      <MobileMenu>
        <Avatar className="h-8 w-8 rounded-full">
          <Jazzicon diameter={50} seed={jsNumberForAddress(address ?? "")} />
        </Avatar>
      </MobileMenu>
    </div>
  )
}
