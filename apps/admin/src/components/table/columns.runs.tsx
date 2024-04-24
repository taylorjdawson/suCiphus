"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Run } from "openai/resources/beta/threads/index.mjs"

export const columns: ColumnDef<Run>[] = [
  {
    accessorKey: "id",
    header: "Run ID",
  },
  {
    accessorKey: "thread_id",
    header: "Thread ID",
  },
  {
    accessorKey: "created_at",
    header: "Created",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
]
