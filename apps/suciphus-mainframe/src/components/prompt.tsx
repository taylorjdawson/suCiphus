"use client"

import * as React from "react"
import { KeyboardEvent, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { decodeEventLog, Hash } from "@flashbots/suave-viem"
import {
  useOnPromptSubmitted,
  useOnSubmissionSuccess,
} from "@hooks/useContractEvents"
import { Subscribe } from "@react-rxjs/core"
import { suciphus, weth } from "@repo/suciphus-suapp/src/suciphus"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"
import {
  AlertTriangle,
  Gem,
  HandCoins,
  Loader,
  Terminal,
  Wallet,
} from "lucide-react"
import { Subscription } from "rxjs"
import { toast } from "sonner"
import { useAccount, useSwitchChain } from "wagmi"

import { getMessages, Message } from "@/lib/openai"
import { suaveChain } from "@/lib/suave"
import { submitPrompt } from "@/lib/suciphus"
import { removeQuotes } from "@/lib/utils"
import { NakedTextArea } from "@/components/ui/textarea.naked"

import AddCredits from "./add-credits"
import { Financials } from "./financials"
import { MessageCard } from "./message" // Import the new Message component

import { Messages } from "./messages"
import { Thread, useSuaveWallet } from "./suave-provider"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { ScrollArea } from "./ui/scroll-area"
import { Separator } from "./ui/separator"
import { Skeleton } from "./ui/skeleton"
import { Toaster } from "./ui/sonner"

const ATTEMPTS_PER_ETH = 1000n

export interface PromptProps {
  className?: string
  threadId: string
}

export const Prompt = ({ className, threadId }: PromptProps) => {
  const router = useRouter()
  const {
    suaveWallet,
    publicClient,
    creditBalance,
    threads,
    refreshBalance,
    updateThreads,
    gameRound,
    checkSubmission,
    nonce,
  } = useSuaveWallet()
  const { address, chainId } = useAccount()
  const { switchChain } = useSwitchChain()

  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [pendingTxs, setPendingTxs] = useState<Hash[]>([])
  const [fetchingMessages, setFetchingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [lastRun, setLastRun] = useState<{
    runId: string
    threadId: string
  } | null>(null) // New state variable for lastRunId
  const [currentThread, setCurrentThread] = useState<Thread | null>(null) // New state variable for currentThread
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)

  const submissionSuccess$ = useOnSubmissionSuccess()
  const promptSubmitted$ = useOnPromptSubmitted()

  useEffect(() => {
    const subscription: Subscription = promptSubmitted$.subscribe(
      (logs: any) => {
        console.log("promptSubmittedReceived logs:", logs)
      }
    )
    return () => subscription.unsubscribe()
  }, [promptSubmitted$])

  useEffect(() => {
    const subscription: Subscription = submissionSuccess$.subscribe(
      (logs: any) => {
        console.log("submissionSuccess Received logs:", logs)

        setShowSuccessAlert(true)
        setTimeout(() => {
          setShowSuccessAlert(false)
        }, 5000)
        // Add any additional logic you want to execute after the submission

        // Update currentThread success to true
        setCurrentThread((prevThread) =>
          prevThread ? { ...prevThread, success: true } : null
        )
      }
    )

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe()
  }, [submissionSuccess$])

  useEffect(() => {
    if (messages.length > 0) {
      if (messagesEndRef.current) {
        console.log("messagesEndRef.current")
        messagesEndRef.current.scrollIntoView({
          behavior: isInitialLoad ? "instant" : "smooth",
        })
      }
      if (isInitialLoad) {
        setIsInitialLoad(false)
      }
    }
  }, [messages, currentThread])

  useEffect(() => {
    if (currentThread?.success) {
      if (messagesEndRef.current) {
        console.log("messagesEndRef.current")
        messagesEndRef.current.scrollIntoView({
          behavior: isInitialLoad ? "instant" : "smooth",
        })
      }
    }
  }, [currentThread])

  const findAndSetCurrentThread = (threadId: string) => {
    if (currentThread?.id !== threadId) {
      const foundThread =
        threads?.find((thread) => thread.id === threadId) || null
      setCurrentThread(foundThread)
    }
  }

  const fetchMessages = async () => {
    setFetchingMessages(true)

    getMessages(threadId)
      .then((messages) => {
        setMessages(messages)
        setFetchingMessages(false)
      })
      .catch((error) => {
        console.error("Failed to fetch messages:", error)
        setFetchingMessages(false)
      })
  }

  useEffect(() => {
    if (threadId && threadId !== "new") {
      console.log("threadId changed fetching messages", threadId)
      fetchMessages()
    }
  }, [threadId])

  useEffect(() => {
    if (threadId && threadId !== "new") {
      findAndSetCurrentThread(threadId)
    } else if (!threadId && threads?.length) {
      router.push(`/player/${threads[0].id}`)
    }
  }, [threadId, threads])

  useEffect(() => {
    if (lastRun && lastRun.runId && lastRun.threadId) {
      pollGetLastMessage(lastRun.threadId, lastRun.runId).then((message) => {
        console.log("pollGetLastMessage", { message })
        if (message) {
          console.log("setMessages", { message })
          setMessages([message, ...messages])
        }
      })
    }
  }, [lastRun])

  const fetchPendingReceipts = async (txHashes: Hash[]) => {
    if (publicClient) {
      console.debug("has publicClient")
      for (const txHash of txHashes) {
        console.debug("txHash", txHash, pendingTxs)
        if (pendingTxs.includes(txHash)) {
          console.debug("pendingTxs includes txHash", txHash)
          // get receipt
          const receipt = await publicClient.getTransactionReceipt({
            hash: txHash,
          })
          console.log({ receipt })
          // check receipt for logs of event `LogBytes(string label, bytes value)`
          for (const log of receipt.logs) {
            for (const targetABI of [suciphus.abi, weth.abi]) {
              let decoded
              try {
                decoded = decodeEventLog({
                  abi: targetABI,
                  data: log.data,
                  topics: log.topics,
                })
              } catch (e) {
                console.debug("failed to decode log (this is normal)", e)
                continue
              }

              console.debug("decoded log", decoded)
              if (decoded.args) {
                if (
                  decoded.eventName === "PromptSubmitted" &&
                  "runId" in decoded.args &&
                  "threadId" in decoded.args
                ) {
                  const decodedRunId = removeQuotes(
                    decoded.args.runId as string
                  )
                  const decodedThreadId = removeQuotes(
                    decoded.args.threadId as string
                  )

                  // Update the URL without causing a page refresh
                  window.history.replaceState(
                    null,
                    "",
                    `${window.location.origin}/player/${decodedThreadId}`
                  )

                  // Check if the thread and run IDs already exist before updating
                  if (
                    !threads?.some((thread) => thread.id === decodedThreadId)
                  ) {
                    updateThreads?.(decodedThreadId, decodedRunId)
                  }

                  setLastRun({
                    runId: decodedRunId,
                    threadId: decodedThreadId,
                  }) // Set the lastRunId state

                  if (!currentThread) {
                    console.log("setting currentThread", decodedThreadId)
                    findAndSetCurrentThread(decodedThreadId)
                  }
                } else if (
                  decoded.eventName === "LogStrings" &&
                  "values" in decoded.args
                ) {
                  console.log("decoded messages", decoded.args.values)
                  const decodedMessages = (decoded.args.values as string[]).map(
                    (jsonStr) => JSON.parse(jsonStr) as Message
                  )
                  console.log({ decodedMessages })
                  // setMessages(decodedMessages)
                }
              }
            }
          }
          setPendingTxs((prev) => prev.filter((hash) => hash !== txHash))
        }
      }
    }
  }

  const pollGetLastMessage = async (
    threadId: string,
    runId: string,
    attempt = 0 // Add an attempt counter with a default value of 0
  ): Promise<Message | undefined> => {
    console.log("pollGetLastMessage", { threadId, runId, attempt })
    try {
      const messages = await getMessages(threadId, runId)
      console.log("pollGetLastMessage", { messages })

      if (messages.length === 0) {
        if (attempt < 15) {
          // Check if the attempt count is less than 3 (for a total of 4 tries)
          await new Promise((resolve) => setTimeout(resolve, 860))
          return pollGetLastMessage(threadId, runId, attempt + 1) // Recurse with incremented attempt counter
        } else {
          console.log("Max retries reached, stopping poll.")
          return undefined // Return undefined after max attempts
        }
      } else {
        // Return the last message if it is not pending
        return messages[0]
      }
    } catch (error) {
      console.error("Error polling for last message:", error)
      return undefined // Return undefined in case of error
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value)
  }

  const handleKeyPress = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      if (!event.shiftKey) {
        event.preventDefault() // Prevent the default Enter key behavior (newline)
        if (inputValue.trim() !== "") {
          setMessages([
            {
              role: "user",
              content: inputValue,
              createdAt: new Date().getTime(),
              status: "pending",
              runId: null,
              id: "",
              threadId: null,
            },
            ...messages,
          ])
          setInputValue("")

          if (address && suaveWallet && publicClient) {
            console.log(address)

            // Compute nonce for the transaction
            // const nonce = await getUserNonce()
            const escapedInputValue = JSON.stringify(inputValue).slice(1, -1)

            const hash = await submitPrompt({
              prompt: escapedInputValue,
              threadId: threadId && threadId !== "new" ? threadId : "",
              suaveWallet,
              nonce,
            }).catch((error) => {
              console.error("error submitting prompt", error)
              setMessages(messages)
              return "0x" as const
            })

            if (hash !== "0x") {
              console.debug("tx hash", hash)
              setMessages((currentMessages) => [
                {
                  ...currentMessages[0],
                  status: "complete" as const,
                  runId: "",
                },
                ...currentMessages.slice(1),
              ])

              setPendingTxs((currentTxs) => [...currentTxs, hash])
              refreshBalance?.()
            }
          }
        }
      } else {
        // Allow Shift+Enter to create a new line
        return
      }
    }
  }

  useEffect(() => {
    if (pendingTxs.length > 0) {
      console.log("fetchPendingReceipts", { pendingTxs })
      fetchPendingReceipts(pendingTxs)
    }
  }, [pendingTxs])

  const doCheckSubmission = async (runId: string) => {
    if (suaveWallet && threadId && checkSubmission) {
      const txHash = await checkSubmission(threadId, runId)
      if (txHash !== "0x") {
        console.log({ txHash })
        setPendingTxs([...pendingTxs, txHash])
      }
    } else {
      throw new Error(
        "undefined element(s) must be defined" +
          JSON.stringify({ threadId, suaveWallet })
      )
    }
  }

  return (
    <div className="relative flex h-full w-full flex-col justify-end">
      <AnimatePresence>
        {showSuccessAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute left-0 top-0 z-20 w-full"
          >
            <Alert className="border-0 bg-gradient-to-r from-emerald-500/60 to-sky-600/60 hue-rotate-15 backdrop-blur-lg">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Success! 🎉</AlertTitle>
              <AlertDescription>You won the pot!</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-col justify-end gap-4 ">
        <LayoutGroup>
          <AnimatePresence>
            <ScrollArea className="h-[calc(100vh-20rem)]  p-8 ">
              <div className="flex flex-col gap-6">
                {fetchingMessages ? (
                  <>
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="ml-auto h-20 w-3/4 px-4 py-3"
                    >
                      <Skeleton />
                    </motion.div>
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="ml-6 h-32 w-3/4 px-4 py-3"
                    >
                      <Skeleton />
                    </motion.div>
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="ml-auto h-24 w-3/4 px-4 py-3"
                    >
                      <Skeleton />
                    </motion.div>
                  </>
                ) : (
                  <Messages
                    messages={messages}
                    address={address}
                    checkSubmission={doCheckSubmission}
                  />
                )}
                {messages.length > 0 && currentThread?.success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="w-full"
                  >
                    <Card className="w-full items-center border-0 bg-gradient-to-r from-emerald-500/60 to-sky-600/60 hue-rotate-15 backdrop-blur-lg">
                      <CardHeader className="text-center">
                        <CardTitle>Success 🎉</CardTitle>
                        <CardDescription>You won the pot!</CardDescription>
                      </CardHeader>
                    </Card>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </AnimatePresence>
        </LayoutGroup>

        <div className="flex flex-col items-center gap-2">
          {!suaveWallet ? (
            <div className="mx-2 text-xs text-muted-foreground">
              Please connect your wallet to play.
            </div>
          ) : chainId !== suaveChain.id ? (
            <div className="mx-2 text-xs text-muted-foreground">
              Wrong chain please{" "}
              <Button
                onClick={() => switchChain({ chainId: suaveChain.id })}
                className="h-min w-min p-0 text-xs"
                variant="link"
              >
                switch
              </Button>{" "}
              to <span className="font-semibold ">{suaveChain.name}</span> chain
              to play.
            </div>
          ) : creditBalance === 0n ? (
            <div className="mx-2 text-xs text-muted-foreground">
              Insufficient credits.{" "}
              <AddCredits>
                <Button className="h-min w-min p-0 text-xs" variant="link">
                  Add more
                </Button>
              </AddCredits>{" "}
              to play.
            </div>
          ) : null}

          {threadId &&
          threadId !== "new" &&
          currentThread?.round !== gameRound ? (
            <Card className="w-full border-0 bg-slate-800/90 backdrop-blur-lg">
              <CardHeader>
                <CardDescription className="flex h-full w-full items-center justify-start gap-2">
                  {fetchingMessages ? (
                    <>
                      <Loader
                        strokeWidth={1}
                        className="h-4 w-4 animate-spin"
                      />
                      <span className=" font-medium text-muted-foreground">
                        Retrieving messages
                      </span>
                    </>
                  ) : (
                    <>The round has been closed.</>
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <Card className="flex min-h-16 w-full items-center justify-center bg-black/20 p-4 backdrop-blur-lg">
              <NakedTextArea
                disabled={!suaveWallet || creditBalance === 0n}
                placeholder="Enter your prompt"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                className="w-full resize-none bg-transparent"
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
