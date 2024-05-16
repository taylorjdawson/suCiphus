"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { Message } from "openai/resources/beta/threads/messages.mjs"

import { truncateId } from "@/lib/utils"

export const columns: ColumnDef<Message>[] = [
  {
    accessorKey: "id",
    header: "Message ID",
    cell: ({ row }) => {
      return (
        <Link
          href={`/admin/threads/${row.original.thread_id}/messages/${row.getValue("id")}`}
        >
          {truncateId(row.getValue("id"))}
        </Link>
      )
    },
  },
  {
    accessorKey: "run_id",
    header: "Run ID",
    cell: ({ row }) => {
      return (
        <Link
          href={`/admin/threads/${row.original.thread_id}/runs/${row.getValue("run_id")}`}
        >
          {row.getValue("run_id") ? (
            truncateId(row.getValue("run_id"))
          ) : (
            <div className="w-full text-center">-</div>
          )}
        </Link>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      const date = new Date(row.getValue<number>("created_at") * 1000)
      return (
        <div>
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </div>
      )
    },
  },
  {
    accessorKey: "content",
    accessorFn: (row) =>
      `${row.content[0].type === "text" ? row.content[0].text.value : ""}`,
    header: "Message",
    cell: ({ row }) => {
      const message = row.getValue<string>("content")
      return message ? (
        <div className="overflow-hidden truncate text-ellipsis">{message}</div>
      ) : (
        <div className="w-full text-center">{message}</div>
      )
    },
  },
  {
    accessorKey: "role",
    header: "Role",
  },
]
