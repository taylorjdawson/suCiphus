import { ReactNode } from "react"

import Account from "@/components/account"
import GameStats from "@/components/game-stats"
import Threads from "@/components/threads"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex h-screen w-2/3 flex-col items-center 2xl:w-3/5">
      <div className="flex w-full flex-col items-end py-4">
        <Account />
      </div>

      <div className="my-4 flex h-full w-full justify-center gap-4 ">
        <div className="">
          <GameStats />
        </div>
        {children}
        <div className="">
          <Threads />
        </div>
      </div>
    </main>
  )
}
