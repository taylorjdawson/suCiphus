import { Thread } from "@/types/types"
import { getThreads } from "@/lib/db"
import { columns } from "@/components/table/columns.threads"
import { DataTable } from "@/components/table/data-table"

export default async function Admin() {
  const threads = await getThreads()

  return (
    <main className="flex h-screen items-center justify-center">
      <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
        <DataTable columns={columns} data={threads} />
      </div>
    </main>
  )
}
