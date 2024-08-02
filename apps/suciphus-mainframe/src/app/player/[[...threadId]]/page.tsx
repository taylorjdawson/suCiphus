import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Account from "@/components/account"
import { Prompt } from "@/components/prompt"

export default function Player({ params }: { params: { threadId: string } }) {
  const threadId = params.threadId?.[0] || ""

  return (
    <main className="flex h-full min-w-[80%] flex-col items-center justify-center lg:w-2/3">
      <Card className=" h-full min-h-full w-full border-none bg-gradient-to-tr from-stone-900 to-indigo-900/70 p-8 shadow-lg">
        <Prompt threadId={threadId} />
      </Card>
    </main>
  )
}
