import { TextContentBlock } from "openai/resources/beta/threads/messages.mjs"

import { getMessages } from "@/lib/openai"
import { columns } from "@/components/table/columns.messages"
import { DataTable } from "@/components/table/data-table"

export default async function Messages({ threadId }: { threadId: string }) {
  const messages = await getMessages(threadId)

  return (
    <main className="flex  items-center justify-center">
      <div className=" flex w-full flex-col items-center">
        <DataTable columns={columns} data={messages.data} />
      </div>
    </main>
  )
}
