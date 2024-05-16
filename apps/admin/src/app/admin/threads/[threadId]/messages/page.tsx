import { TextContentBlock } from "openai/resources/beta/threads/messages.mjs"

import { getMessages } from "@/lib/openai"
import { columns } from "@/components/table/columns.messages"
import { DataTable } from "@/components/table/data-table"

export default async function Messages({
  params,
}: {
  params: { threadId: string }
}) {
  const messages = await getMessages(params.threadId)

  return (
    <main className="flex h-screen items-center justify-center">
      <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
        <DataTable columns={columns} data={messages.data} />
      </div>
    </main>
  )
}
