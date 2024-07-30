import Account from "@/components/account"
import { Prompt } from "@/components/prompt"

export default function Player({ params }: { params: { threadId: string } }) {
  return (
    <main className="flex h-full w-1/2 flex-col items-center justify-center">
      <Prompt />
    </main>
  )
}
