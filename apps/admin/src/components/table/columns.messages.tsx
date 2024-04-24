"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Message } from "openai/resources/beta/threads/messages.mjs"

export const columns: ColumnDef<Message>[] = [
  {
    accessorKey: "id",
    header: "Message ID",
  },
  {
    accessorKey: "run_id",
    header: "Run ID",
  },
  {
    accessorKey: "created_at",
    header: "Created",
  },
  {
    accessorFn: (row) =>
      `${row.content[0].type === "text" ? row.content[0].text.value : ""}`,
    header: "Message",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
]
