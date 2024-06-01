import { getThreads } from "@/lib/db"
import { columns } from "@/components/table/columns.threads"
import { DataTable } from "@/components/table/data-table"

export default async function Threads() {
  const threads = await getThreads()

  return (
    <main className="flex justify-center">
      <div className="flex  flex-col text-center">
        <DataTable columns={columns} data={threads} />
      </div>
    </main>
  )
}
