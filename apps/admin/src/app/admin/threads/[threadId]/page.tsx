import { getMessages } from "@/lib/openai"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Messages from "@/components/table/table.messages"
import Runs from "@/components/table/table.runs"

export default async function Thread({
  params: { threadId },
}: {
  params: { threadId: string }
}) {
  const messages = await getMessages(threadId)
  return (
    <main className="flex w-full justify-center">
      <div className="flex w-full flex-col items-center text-center">
        <Tabs defaultValue="messages" className="flex w-full flex-col">
          <TabsList className=" w-max">
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="runs">Runs</TabsTrigger>
          </TabsList>
          <TabsContent value="messages">
            <Messages threadId={threadId} />
          </TabsContent>
          <TabsContent value="runs">
            <Runs threadId={threadId} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
