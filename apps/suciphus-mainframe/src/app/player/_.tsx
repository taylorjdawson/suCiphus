import Account from "@/components/account"
import { Prompt } from "@/components/prompt"

export default function Stats() {
  return (
    <main className="mx-auto flex  h-screen w-3/4 flex-col items-center">
      <div className="flex w-full flex-col items-end py-4">
        <Account />
      </div>

      <div className="flex h-full w-1/2 items-center">
        <Prompt />
      </div>
    </main>
  )
}
