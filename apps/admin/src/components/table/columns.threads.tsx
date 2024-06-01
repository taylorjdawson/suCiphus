"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Thread } from "@/types/types"
import { truncateId } from "@/lib/utils"

import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

export const columns: ColumnDef<Thread.Thread>[] = [
  {
    accessorKey: "threadId",
    header: "Thread ID",
    cell: ({ row }) => {
      return (
        <Link href={`/admin/threads/${row.getValue("threadId")}`}>
          {truncateId(row.getValue("threadId"))}
        </Link>
      )
    },
  },
  {
    accessorKey: "player",
    header: "Player",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
            // onClick={() =>
            //   useRouter().push(`/runs/${row.getValue("threadId")}`)
            // }
            >
              <Link href={`/admin/runs/${row.getValue("threadId")}`}>
                View Runs
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
