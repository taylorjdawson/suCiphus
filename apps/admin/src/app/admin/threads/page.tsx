import { getThreads } from "@/lib/db"
import { columns } from "@/components/table/columns.threads"
import { DataTable } from "@/components/table/data-table"
import { DataTablePagination } from "@/components/table/data-table.pagination"

export default async function Threads() {
  const threads = await getThreads()

  return (
    <main className="flex justify-center">
      <div className="relative flex w-1/2 flex-col items-center text-center">
        <div className="absolute top-0 w-full">
          <DataTable columns={columns} data={threads} />
        </div>
      </div>
    </main>
  )
}
