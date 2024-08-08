"use client"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Separator } from "./ui/separator"

export function Financials() {
  const creditsReport = {
    spent: 10,
    deposited: 100,
    earned: 25,
  }

  const total =
    creditsReport.spent + creditsReport.deposited + creditsReport.earned

  const spentPercentage = creditsReport.spent / total
  const depositedPercentage = creditsReport.deposited / total
  const earnedPercentage = creditsReport.earned / total

  const spentBarWidth = `${Math.floor(spentPercentage * 100)}%`
  const depositedBarWidth = `${Math.floor(depositedPercentage * 100)}%`
  const earnedBarWidth = `${Math.floor(earnedPercentage * 100)}%`

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financials</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-1">
        <Separator
          className="h-4 rounded-sm bg-blue-600"
          style={{ width: depositedBarWidth }}
        />
        <Separator
          className="h-4 rounded-sm bg-red-700"
          style={{ width: spentBarWidth }}
        />
        <Separator
          className="h-4 rounded-sm bg-emerald-500"
          style={{ width: earnedBarWidth }}
        />
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <Card className="h-5 w-5 rounded-sm bg-blue-600"></Card>
        <Card className="h-5 w-5 rounded-sm bg-red-700"></Card>
        <Card className="h-5 w-5 rounded-sm bg-emerald-500"></Card>
      </CardFooter>
    </Card>
  )
}
