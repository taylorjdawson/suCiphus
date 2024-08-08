"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { PlusCircle } from "lucide-react"

import { type CarouselApi } from "@/components/ui/carousel" // Import CarouselApi

import { Thread, useSuaveWallet } from "./suave-provider"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Separator } from "./ui/separator"

export default function Threads() {
  const router = useRouter()
  const { threads, selectedRound, setSelectedRound, gameRound } =
    useSuaveWallet() // Destructure gameRound
  const [currentThread, setCurrentThread] = useState<Thread | undefined>(
    undefined
  )
  const { threadId } = useParams<{ threadId: string[] }>() // Get current route params
  const [api, setApi] = useState<CarouselApi>() // State for CarouselApi
  const [rounds, setRounds] = useState<number[]>([]) // State for rounds array
  const [threadsByRound, setThreadsByRound] = useState<{
    currentRound: Thread[]
    previousRound: Thread[]
  }>({
    currentRound: [],
    previousRound: [],
  })

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
    console.log({ selectedRound })
  }, [threads, threadId, selectedRound])

  useEffect(() => {
    if (gameRound !== undefined) {
      setRounds(Array.from({ length: gameRound + 1 }, (_, index) => index)) // Update rounds array
    }
  }, [gameRound])

  useEffect(() => {
    if (threads && threads.length > 0) {
      const currentRoundThreads = threads.filter(
        (thread) => thread.round === gameRound
      )
      const previousRoundThreads = threads.filter(
        (thread) => thread.round !== gameRound
      )
      console.log({ threads, currentRoundThreads, previousRoundThreads })
      setThreadsByRound({
        currentRound: currentRoundThreads,
        previousRound: previousRoundThreads,
      })
    }
  }, [threads, gameRound])

  useEffect(() => {
    console.log({ rounds, gameRound, selectedRound })
  }, [rounds, gameRound, selectedRound])

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <CardTitle className="font-bold uppercase">{gameRound}</CardTitle>
        <CardDescription className="font-bold uppercase">Round</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button variant="outline" onClick={addNewThread} className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" /> New thread
        </Button>
        {threadsByRound.currentRound.map((thread) => (
          <Button
            variant={currentThread === thread ? "secondary" : "ghost"} // Conditional variant
            asChild
            key={thread.id}
            className={`w-full cursor-pointer justify-start hover:bg-gradient-to-bl hover:from-fuchsia-900/70 hover:to-cyan-800/90 ${currentThread === thread ? "bg-gradient-to-bl from-fuchsia-900/70 to-cyan-800/90" : ""}`} // Conditional bold style
          >
            <Link
              href={`/player/${thread.id.replace(/"/g, "")}`}
              replace
              prefetch
            >
              {truncateId(thread.id.replace(/"/g, ""))}
            </Link>
          </Button>
        ))}
        {threadsByRound.previousRound.length > 0 ? (
          <>
            <h3 className="mt-4 text-center text-sm font-medium  text-muted-foreground">
              Previous rounds
            </h3>
            <Separator />
          </>
        ) : null}
        {threadsByRound.previousRound.map((thread) => (
          <Button
            variant={currentThread === thread ? "secondary" : "ghost"} // Conditional variant
            asChild
            key={thread.id}
            className={`w-full cursor-pointer justify-start hover:bg-gradient-to-bl hover:from-fuchsia-900/40 hover:to-cyan-800/60 ${currentThread === thread ? "bg-gradient-to-bl from-fuchsia-900/70 to-cyan-800/90" : ""}`} // Conditional bold style
          >
            <div className="flex flex-row items-center gap-2">
              <Link
                href={`/player/${thread.id.replace(/"/g, "")}`}
                replace
                prefetch
              >
                {truncateId(thread.id.replace(/"/g, ""))}
              </Link>
              {thread.success && (
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-[14px] w-[14px]"
                >
                  <path
                    d="M5 8H3.5C2.83696 8 2.20107 7.73661 1.73223 7.26777C1.26339 6.79893 1 6.16304 1 5.5C1 4.83696 1.26339 4.20107 1.73223 3.73223C2.20107 3.26339 2.83696 3 3.5 3H5M5 8V1H17V8M5 8C5 9.5913 5.63214 11.1174 6.75736 12.2426C7.88258 13.3679 9.4087 14 11 14C12.5913 14 14.1174 13.3679 15.2426 12.2426C16.3679 11.1174 17 9.5913 17 8M17 8H18.5C19.163 8 19.7989 7.73661 20.2678 7.26777C20.7366 6.79893 21 6.16304 21 5.5C21 4.83696 20.7366 4.20107 20.2678 3.73223C19.7989 3.26339 19.163 3 18.5 3H17M3 21H19M9 13.66V16C9 16.55 8.53 16.98 8.03 17.21C6.85 17.75 6 19.24 6 21M13 13.66V16C13 16.55 13.47 16.98 13.97 17.21C15.15 17.75 16 19.24 16 21"
                    stroke="url(#paint0_linear_2194_46)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear_2194_46"
                      x1="21"
                      y1="0.999999"
                      x2="1"
                      y2="21"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#10D295" />
                      <stop offset="0.775" stop-color="#13B0C6" />
                    </linearGradient>
                  </defs>
                </svg>
              )}
            </div>
          </Button>
        ))}
        {/* <Select>
          <SelectTrigger className="h-full w-20 flex-col gap-x-2 border-0 px-2 text-3xl font-bold focus:outline-none focus:ring-0 focus:ring-offset-0 ">
            <SelectValue placeholder="Round" />
          </SelectTrigger>
          <SelectContent>
            {rounds.map((index) => (
              <SelectItem value={`${index}`}>{`${index}`}</SelectItem>
            ))}
          </SelectContent>
        </Select> */}
        {/* <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="w-full">Round: 0</AccordionTrigger>
            <AccordionContent className="w-min">
              {threads?.map((thread) => (
                <Button
                  variant={currentThread === thread ? "secondary" : "ghost"} // Conditional variant
                  asChild
                  key={thread.id}
                  className={`w-full cursor-pointer justify-start ${currentThread === thread ? "font-bold" : ""}`} // Conditional bold style
                >
                  <Link href={`/player/${thread.id.replace(/"/g, "")}`}>
                    {truncateId(thread.id.replace(/"/g, ""))}
                  </Link>
                </Button>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion> */}
        {/* <Collapsible className="w-full">
          <CollapsibleTrigger>Round: 0</CollapsibleTrigger>
          <CollapsibleContent className="">
            {threads?.map((thread) => (
              <Button
                variant={currentThread === thread ? "secondary" : "ghost"} // Conditional variant
                asChild
                key={thread.id}
                className={`w-full cursor-pointer justify-start ${currentThread === thread ? "font-bold" : ""}`} // Conditional bold style
              >
                <Link href={`/player/${thread.id.replace(/"/g, "")}`}>
                  {truncateId(thread.id.replace(/"/g, ""))}
                </Link>
              </Button>
            ))}
          </CollapsibleContent>
        </Collapsible>
      */}
      </CardContent>
    </Card>
  )
}
