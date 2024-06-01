import { TextContentBlock } from "openai/resources/beta/threads/messages.mjs"

import { getRuns } from "@/lib/openai"
import { columns } from "@/components/table/columns.runs"
import { DataTable } from "@/components/table/data-table"

export default async function Messages({
  params,
}: {
  params: { threadId: string }
}) {
  const runs = await getRuns(params.threadId)
  //   console.log((messages.data[0].content[0] as TextContentBlock).text)
  return (
    <main className="flex h-screen items-center justify-center">
      <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
        <DataTable columns={columns} data={runs.data} />
      </div>
    </main>
  )
}
