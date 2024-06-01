"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Slash } from "lucide-react"

import { isId } from "@/lib/utils"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Crumb {
  title: string
}

const truncateId = (id: string) => {
  const { prefix, suffix } =
    /^(?:thread|run|msg)_(?<prefix>.{4}).*(?<suffix>.{4})$/.exec(id)?.groups ??
    {}
  return prefix && suffix ? `${prefix}•••${suffix}` : id
}

export function NavCrumbs() {
  const pathname = usePathname()

  const breadCrumbs = pathname.replace("/admin/", "").split("/")

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/admin">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadCrumbs.map((crumb, index, crumbs) => (
          <React.Fragment key={index}>
            <BreadcrumbSeparator>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  className={!isId(crumb) ? "first-letter:capitalize" : ""}
                  href={`/admin/${crumbs.slice(0, index + 1).join("/")}`}
                >
                  {truncateId(crumb)}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
