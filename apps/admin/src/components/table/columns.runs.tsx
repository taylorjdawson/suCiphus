"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { Run } from "openai/resources/beta/threads/index.mjs"

import { truncateId } from "@/lib/utils"

import { Badge } from "../ui/badge"

export const columns: ColumnDef<Run>[] = [
  {
    accessorKey: "id",
    header: "Run ID",
    cell: ({ row }) => {
      return (
        <Link
          href={`/admin/threads/${row.getValue("thread_id")}/runs/${row.getValue("id")}`}
        >
          {truncateId(row.getValue("id"))}
        </Link>
      )
    },
  },
  {
    accessorKey: "thread_id",
    header: "Thread ID",
    cell: ({ row }) => {
      return (
        <Link href={`/admin/threads/${row.getValue("thread_id")}`}>
          {truncateId(row.getValue("thread_id"))}
        </Link>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      row.getValue("status") === "failed" ? (
        <Badge
          variant="outline"
          className=" border-destructive bg-destructive/50"
        >
          Failed
        </Badge>
      ) : (
        <Badge variant="outline">{row.getValue("status")}</Badge>
      ),
  },
]
