import { Card } from "@/components/ui/card"
import { Prompt } from "@/components/prompt"

export default function Player({ params }: { params: { threadId: string } }) {
  const threadId = params.threadId?.[0] || ""

  return (
    <main className="flex h-full w-full flex-col items-center justify-center">
      <Card className="h-full min-h-full w-full border-none bg-gradient-to-bl from-fuchsia-900/70 to-cyan-800/90 p-8 shadow-lg">
        <Prompt threadId={threadId} />
      </Card>
    </main>
  )
}
