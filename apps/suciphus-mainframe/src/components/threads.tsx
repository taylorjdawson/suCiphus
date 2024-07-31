"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { useSuaveWallet } from "./suave-provider"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"

export default function Threads() {
  const { threads } = useSuaveWallet()
  const { threadId } = useParams<{ threadId: string[] }>() // Get current route params

  const addNewThread = () => {
    // Function to handle new thread addition
    console.log("Adding new thread", threadId)
  }

  const truncateId = (id: string) => {
    const { prefix, suffix } =
      /^(?:thread|run|msg)_(?<prefix>.{6}).*(?<suffix>.{6})$/.exec(id)
        ?.groups ?? {}
    return prefix && suffix ? `${prefix}•••${suffix}` : id
  }

  useEffect(() => {
    console.log(threads, threadId)
  }, [threads])

  const threadIdMatches = (thread: string) => {
    return threadId && threadId.includes(thread)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Threads</CardTitle>
        <CardDescription>This is the Threads component.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={addNewThread}>Add New Thread</Button>{" "}
        {/* Add New Thread button */}
        {threads?.map((thread) => (
          <Button
            variant={threadIdMatches(thread) ? "secondary" : "ghost"} // Conditional variant
            asChild
            key={thread}
            className={`w-full justify-start ${threadIdMatches(thread) ? "font-bold" : ""}`} // Conditional bold style
          >
            <Link href={`/player/${thread.replace(/"/g, "")}`}>
              {truncateId(thread.replace(/"/g, ""))}
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
