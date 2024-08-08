import Link from "next/link"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { ConnectWallet } from "@/components/connect-wallet"
import { Icons } from "@/components/icons"

export default function Home() {
  return (
    <main className="flex h-screen justify-center">
      <div className="container flex max-w-[64rem] flex-col items-center gap-4 pt-36 text-center">
        <h1 className="text-4xl font-semibold sm:text-5xl md:text-6xl lg:text-7xl">
          {siteConfig.name}
        </h1>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          Think you can social engineer Suciphus?
        </p>
        <div className="flex gap-2">
          <ConnectWallet />
        </div>
      </div>
    </main>
  )
}
