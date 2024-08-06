"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { PlusCircle } from "lucide-react"

import { Thread, useSuaveWallet } from "./suave-provider"
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
  const router = useRouter()
  const { threads } = useSuaveWallet()
  const [currentThread, setCurrentThread] = useState<Thread | undefined>(
    undefined
  )
  const { threadId } = useParams<{ threadId: string[] }>() // Get current route params

  const addNewThread = () => {
    // Function to handle new thread addition
    router.push("/player/new")
  }

  const truncateId = (id: string) => {
    const { prefix, suffix } =
      /^(?:thread|run|msg)_(?<prefix>.{6}).*(?<suffix>.{6})$/.exec(id)
        ?.groups ?? {}
    return prefix && suffix ? `${prefix}•••${suffix}` : id
  }

  useEffect(() => {
    if (threads && threads.length > 0) {
      const currentThread = threads.find(
        (thread) => thread.id.replace(/"/g, "") === threadId?.[0]
      )
      setCurrentThread(currentThread)
    }
    console.log({ threadId, threads })
  }, [threads, threadId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Threads</CardTitle>
        {/* <CardDescription>This is the Threads component.</CardDescription> */}
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button variant="outline" onClick={addNewThread} className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" /> New thread
        </Button>

        {threads?.map((thread) => (
          <Button
            variant={currentThread === thread ? "secondary" : "ghost"} // Conditional variant
            asChild
            key={thread.id}
            className={`w-full justify-start ${currentThread === thread ? "font-bold" : ""}`} // Conditional bold style
          >
            <Link href={`/player/${thread.id.replace(/"/g, "")}`}>
              {truncateId(thread.id.replace(/"/g, ""))}
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
