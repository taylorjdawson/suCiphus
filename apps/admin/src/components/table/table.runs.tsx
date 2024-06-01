import type { TextContentBlock } from "openai/resources/beta/threads/messages.mjs"

import { getRuns } from "@/lib/openai"
import { columns } from "@/components/table/columns.runs"
import { DataTable } from "@/components/table/data-table"

export default async function Runs({ threadId }: { threadId: string }) {
  const runs = await getRuns(threadId)
  //   console.log((messages.data[0].content[0] as TextContentBlock).text)
  return (
    <main className="flex items-center justify-center">
      <div className="flex w-full flex-col items-center">
        <DataTable columns={columns} data={runs.data} />
      </div>
    </main>
  )
}
