import { ReactNode } from "react"

import Account from "@/components/account"
import Threads from "@/components/threads"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex h-screen w-3/4 flex-col items-center ">
      <div className="flex w-full flex-col items-end py-4">
        <Account />
      </div>

      <div className="my-auto flex h-full w-3/4  items-center gap-8">
        <Threads />
        {children}
      </div>
    </main>
  )
}
