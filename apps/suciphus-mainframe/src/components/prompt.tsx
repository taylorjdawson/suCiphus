"use client"

import * as React from "react"
import { KeyboardEvent, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Address,
  CustomTransport,
  decodeEventLog,
  encodeFunctionData,
  formatEther,
  Hash,
  Hex,
  hexToBigInt,
  hexToString,
  HttpTransport,
  parseEther,
} from "@flashbots/suave-viem"
import suciphus from "@repo/suciphus-suapp/out/Suciphus.sol/Suciphus.json"
import weth from "@repo/suciphus-suapp/out/WETH9.sol/WETH9.json"
import {
  suciphus as suciphusDeployment,
  weth as wethDeployment,
} from "@repo/suciphus-suapp/src/suciphus"
import { Loader } from "lucide-react"
import { MDXRemote } from "next-mdx-remote/rsc"
import TextareaAutosize from "react-textarea-autosize"
// import { Message } from "openai/resources/beta/threads/messages.mjs"
import { useAccount } from "wagmi"

import { getMessages, Message } from "@/lib/openai"
import {
  checkSubmission,
  mintTokens,
  readMessages,
  submitPrompt,
} from "@/lib/suciphus"
import { removeQuotes } from "@/lib/utils"

import AddCredits from "./add-credits"
import AddCreditsDialog from "./add-credits-dialog"
import { MessageCard } from "./message" // Import the new Message component
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
import { Input } from "./ui/input"
import { NakedInput } from "./ui/input.naked"
import { ScrollArea } from "./ui/scroll-area"
import { Textarea } from "./ui/textarea"
import { NakedTextarea } from "./ui/textarea.naked"

const ATTEMPTS_PER_ETH = 1000n

export interface PromptProps {
  className?: string
  threadId: string
}

export const Prompt = ({ className, threadId }: PromptProps) => {
  const router = useRouter()
  const { suaveWallet, publicClient, creditBalance, threads, refreshBalance } =
    useSuaveWallet()
  const { address } = useAccount()
  const [inputValue, setInputValue] = useState("")
  const [prompts, setPrompts] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [pendingTxs, setPendingTxs] = useState<Hash[]>([])
  const [fetchingMessages, setFetchingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [lastRun, setLastRun] = useState<{
    runId: string
    threadId: string
  } | null>(null) // New state variable for lastRunId

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
  }, [messages])

  useEffect(() => {
    console.log({ threadId, threads })
    if (threadId && threadId !== "new") {
      console.log({ threadId })
      fetchMessages()
    } else if (!threadId && threads?.length) {
      router.push(`/player/${threads[0]}`)
    }
  }, [threadId, threads])

  useEffect(() => {
    if (lastRun && lastRun.runId && lastRun.threadId) {
      pollGetLastMessage(lastRun.threadId, lastRun.runId).then((message) => {
        if (message) {
          setMessages([message, ...messages])
        }
      })
    }
  }, [lastRun])

  const fetchPendingReceipts = async (txHashes: Hash[]) => {
    console.debug("fetchPendingReceipts", { txHashes })
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
                  // setThreadId(decodedThreadId)
                  console.log("runId", decodedRunId)
                  setLastRun({
                    runId: decodedRunId,
                    threadId: decodedThreadId,
                  }) // Set the lastRunId state
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
        if (attempt < 10) {
          // Check if the attempt count is less than 3 (for a total of 4 tries)
          await new Promise((resolve) => setTimeout(resolve, 800))
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

  const getUserNonce = async () => {
    if (!publicClient) {
      throw new Error("publicClient not initialized")
    }
    if (!address) {
      throw new Error("wallet not initialized")
    }
    return await publicClient.getTransactionCount({
      address,
    })
  }

  const handleKeyPress = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      if (!event.shiftKey) {
        event.preventDefault() // Prevent the default Enter key behavior (newline)
        if (inputValue.trim() !== "") {
          setPrompts([...prompts, inputValue])
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
          setInputValue("") // Clear the input after adding

          if (address && suaveWallet && publicClient) {
            console.log(address)

            // Compute nonce for the transaction
            const nonce = await getUserNonce()
            console.log(`sending prompt with threadId ${threadId}`)
            const escapedInputValue = JSON.stringify(inputValue).slice(1, -1)
            console.log(escapedInputValue)
            const hash = await submitPrompt({
              prompt: escapedInputValue, // Escape inputValue for JSON
              threadId: threadId && threadId !== "new" ? threadId : "",
              suaveWallet,
              nonce, // Pass the computed nonce
            }).catch((error) => {
              console.error("error submitting prompt", error)
              setMessages(messages) // Update the state with the modified array
              return "0x" as const
            })

            if (hash !== "0x") {
              console.debug("tx hash", hash)
              setMessages((currentMessages) => [
                {
                  ...currentMessages[0],
                  status: "complete", // Update the status of the first message
                  runId: hash, // Optionally, you can also set the runId to the transaction hash
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
    console.log({ pendingTxs })
    fetchPendingReceipts(pendingTxs)
  }, [pendingTxs])

  const isUserPrompt = (msg: string) => {
    console.log({ prompts })
    return prompts.includes(msg)
  }

  const doCheckSubmission = async (runId: string) => {
    console.log({ threadId })
    if (suaveWallet && threadId) {
      const nonce = await getUserNonce()
      const txHash = await checkSubmission({
        threadId: threadId,
        suaveWallet,
        nonce,
      })
      setPendingTxs([...pendingTxs, txHash])
    } else {
      throw new Error(
        "undefined element(s) must be defined" +
          JSON.stringify({ threadId, suaveWallet })
      )
    }
  }

  // useEffect(() => {
  //   messages.toReversed().map((message, idx) => {
  //     console.log({ message })
  //     console.log({ address })
  //     console.log(
  //       "has address",
  //       message.content.toLowerCase().includes(address?.toLowerCase()),
  //       { message }
  //     )
  //     console.log(
  //       message.role === "assistant" &&
  //         !!address &&
  //         message.content.toLowerCase().includes(address.toLowerCase())
  //     )
  //   })
  // }, [messages])

  return (
    <div className="flex h-full w-full flex-col justify-end">
      <div className="flex flex-col justify-end gap-4">
        <ScrollArea className=" h-[calc(100vh-20rem)] p-8">
          <div className="flex flex-col gap-6">
            {fetchingMessages ? (
              <div className="flex h-full w-full flex-col items-center justify-start gap-4">
                <Loader strokeWidth={1} className="animate-spin" />
                <div className="text-sm font-medium text-muted-foreground">
                  Retrieving messages
                </div>
              </div>
            ) : messages.length > 0 ? (
              messages
                .toReversed()
                .map((message, idx) => (
                  <MessageCard
                    key={`key_${idx}`}
                    message={message}
                    checkSubmission={doCheckSubmission}
                    shouldCheckSubmission={
                      message.role === "assistant" &&
                      !!address &&
                      message.content
                        .toLowerCase()
                        .includes(address.toLowerCase())
                    }
                  />
                ))
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-start gap-4">
                <div className="text-sm font-medium text-muted-foreground"></div>
              </div>
            )}
            <div ref={messagesEndRef} />{" "}
            {/* Invisible element at the end of the messages */}
          </div>
        </ScrollArea>

        <div className="flex flex-col items-center gap-2">
          {creditBalance === 0n && (
            <div className="mx-2 text-xs text-muted-foreground">
              Insufficient credits.{" "}
              <AddCredits>
                <Button className="h-min w-min p-0 text-xs" variant="link">
                  Add more
                </Button>
              </AddCredits>{" "}
              to play.
            </div>
          )}
          <Card className="flex min-h-16 w-full items-center justify-center p-4">
            <NakedTextarea
              disabled={!suaveWallet || creditBalance === 0n}
              placeholder="Enter your prompt"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              className="w-full resize-none"
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
