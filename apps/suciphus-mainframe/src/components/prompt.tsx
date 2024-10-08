"use client"

import * as React from "react"
import { KeyboardEvent, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useCurrentThread } from "@/context/current-thread"
import { decodeEventLog, Hash } from "@flashbots/suave-viem"
import {
  useOnPromptSubmitted,
  useOnSubmissionSuccess,
} from "@hooks/useContractEvents"
import { suciphus, weth } from "@repo/suciphus-suapp/src/suciphus"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"
import { Loader, Terminal } from "lucide-react"
import { Subscription } from "rxjs"
import { useAccount, useSwitchChain } from "wagmi"

import { getMessages, Message } from "@/lib/openai"
import { suaveChain } from "@/lib/suave"
import { submitPrompt } from "@/lib/suciphus"
import { removeQuotes } from "@/lib/utils"
import { NakedTextArea } from "@/components/ui/textarea.naked"

import AddCredits from "./add-credits"
import { Messages } from "./messages"
import { useSuaveWallet } from "./suave-provider"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Button } from "./ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { ScrollArea } from "./ui/scroll-area"
import { Skeleton } from "./ui/skeleton"

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
  } = useSuaveWallet()
  const { address, chainId } = useAccount()
  const { switchChain } = useSwitchChain()

  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [pendingTxs, setPendingTxs] = useState<Hash[]>([])
  const [fetchingMessages, setFetchingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const { currentThread, setCurrentThread } = useCurrentThread()

  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [showLoader, setShowLoader] = useState(false)

  const submissionSuccess$ = useOnSubmissionSuccess()

  useEffect(() => {
    if (!currentThread && threadId === "new") {
      setMessages([])
    }
  }, [currentThread])

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
          setShowLoader(false) // Hide loader after max attempts
          return undefined // Return undefined after max attempts
        }
      } else {
        // Return the last message if it is not pending
        setShowLoader(false) // Hide loader when a new message is received
        return messages[0]
      }
    } catch (error) {
      console.error("Error polling for last message:", error)
      setShowLoader(false) // Hide loader in case of error
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
            const nonce = await publicClient.getTransactionCount({ address })
            console.log("nonce", nonce)
            const hash = await submitPrompt({
              prompt: escapedInputValue,
              threadId: currentThread?.id || "",
              suaveWallet,
              nonce,
            }).catch((error) => {
              console.error("error submitting prompt", error)
              setMessages(messages)
              return "0x" as const
            })

            if (hash !== "0x") {
              console.debug("tx hash", hash)

              setShowLoader(true) // Show loader when a pending hash is received
              setTimeout(() => setShowLoader(false), 15000) // Hide loader after 15 seconds if no message is received
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
              publicClient
                .waitForTransactionReceipt({ hash })
                .then((transaction) => {
                  const logs = transaction.logs[0]
                  const decodedLog = decodeEventLog({
                    abi: suciphus.abi,
                    topics: logs.topics,
                    data: logs.data,
                  })

                  // @ts-ignore
                  const decodedThreadId = decodedLog.args.threadId.replace(
                    /"/g,
                    ""
                  )
                  // @ts-ignore
                  const decodedRunId = decodedLog.args.runId.replace(/"/g, "")

                  // Update the URL without causing a page refresh
                  window.history.replaceState(
                    null,
                    "",
                    `${window.location.origin}/player/${decodedThreadId}`
                  )
                  if (!currentThread) {
                    setCurrentThread({
                      id: decodedThreadId,
                      runId: decodedRunId,
                      success: false,
                      round: gameRound || 0,
                    })
                  }
                  updateThreads?.(decodedThreadId, decodedRunId)

                  pollGetLastMessage(decodedThreadId, decodedRunId).then(
                    (message) => {
                      if (message) {
                        console.debug("setting messages", message)
                        setMessages((prevMessages) => {
                          const newMessages = [message, ...prevMessages]

                          return newMessages
                        })
                      }
                    }
                  )
                })
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
      // fetchPendingReceipts(pendingTxs)
    }
  }, [pendingTxs])

  const doCheckSubmission = async (runId: string) => {
    if (suaveWallet && currentThread?.id && checkSubmission) {
      const txHash = await checkSubmission(currentThread?.id, runId)
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
            <ScrollArea className="h-[calc(100vh-14rem)] p-4 2xl:h-[calc(100vh-20rem)]  2xl:p-8 ">
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
                {showLoader && (
                  <div className="flex w-full ">
                    <span className="animate-bounce  ">
                      <span className="animate-pulse duration-1000  ">•</span>
                    </span>
                    <span className="animate-bounce delay-200">
                      <span className="animate-pulse delay-200 duration-1000">
                        •
                      </span>
                    </span>
                    <span className=" animate-bounce delay-300">
                      <span className="animate-pulse delay-300 duration-1000">
                        •
                      </span>
                    </span>
                  </div>
                )}
                {messages.length > 0 && currentThread?.success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.5, delay: 0.4 }}
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
            <Card className="flex min-h-16 w-full items-center justify-center border-black/10  bg-black bg-opacity-20 p-4  shadow-xl backdrop-blur-lg focus-within:bg-opacity-30  focus-within:shadow-2xl">
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
