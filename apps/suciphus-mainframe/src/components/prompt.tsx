"use client"

import * as React from "react"
import { KeyboardEvent, useEffect, useState } from "react"
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
import { useAccount } from "wagmi"

import {
  checkSubmission,
  mintTokens,
  readMessages,
  submitPrompt,
} from "@/lib/suciphus"
import { removeQuotes } from "@/lib/utils"

import AddCredits from "./add-credits"
import AddCreditsDialog from "./add-credits-dialog"
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
import { useWallet } from "./wallet-provider"

const ATTEMPTS_PER_ETH = 100n

export interface PromptProps {
  className?: string
}

interface Message {
  role: string
  message: string
}

export const Prompt = ({ className }: PromptProps) => {
  const { suaveWallet, publicClient, creditBalance } = useSuaveWallet()
  const { address } = useAccount()
  const [inputValue, setInputValue] = useState("")
  const [prompts, setPrompts] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  const [pendingTxs, setPendingTxs] = useState<Hash[]>([])
  const [threadId, setThreadId] = useState<string>()

  useEffect(() => {
    if (publicClient) {
      publicClient
        .getContractEvents({
          abi: suciphusDeployment.abi,
          address: suciphusDeployment.address,
          fromBlock: "earliest",
          toBlock: "latest",
        })
        .then((logs) => {
          console.log({ logs })
          const relevantLogs = logs.filter(
            (log) => 'args' in log
          ).map((log: any) => ({
            args: {
              ...(log.args as { player: Address, threadId: string, runId: string, round: bigint, season: bigint }),
              player: log.args.player,
              threadId: removeQuotes(log.args.threadId)
            }
          }))
            .filter(log => log.args.player === address)
          console.log({ relevantLogs })
          relevantLogs.forEach((log) => {
            if (log.args.threadId) {
              const decodedThreadId = removeQuotes(log.args.threadId)
              setThreadId(decodedThreadId)
              console.log("threadId set to:", decodedThreadId)
            }
          })
        })
      publicClient.watchPendingTransactions({
        onTransactions: async (txHashes) => {
          await fetchPendingReceipts(txHashes)
        },
      })
    }
  }, [publicClient, pendingTxs])

  useEffect(() => {
    if (publicClient && threadId) {
      console.log({ threadId })
      // fetchMessages()
    }
  }, [publicClient, threadId, suaveWallet])

  const fetchPendingReceipts = async (txHashes: Hash[]) => {
    console.debug("fetchPendingReceipts", { txHashes })
    if (publicClient) {
      for (const txHash of txHashes) {
        if (pendingTxs.includes(txHash)) {
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
                  "threadId" in decoded.args
                ) {
                  const decodedThreadId = removeQuotes(
                    decoded.args.threadId as string
                  )
                  setThreadId(decodedThreadId)
                  console.log("threadId", decodedThreadId)
                } else if (
                  decoded.eventName === "LogStrings" &&
                  "values" in decoded.args
                ) {
                  console.log("decoded messages", decoded.args.values)
                  const decodedMessages = (decoded.args.values as string[]).map(
                    (jsonStr) => JSON.parse(jsonStr) as Message
                  )
                  console.log({ decodedMessages })
                  setMessages(decodedMessages)
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
    console.log("fetching messages")
    const nonce = await getUserNonce()
    console.log(threadId && suaveWallet && publicClient, {
      threadId,
      suaveWallet,
      publicClient,
    })
    if (threadId && suaveWallet && publicClient) {
      const txHash = await readMessages({
        suaveWallet,
        threadId: threadId,
        prompt: "",
        nonce,
      })
      console.log(txHash)
      setPendingTxs([...pendingTxs, txHash])
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleKeyPress = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && inputValue.trim() !== "") {
      setPrompts([...prompts, inputValue])
      setInputValue("") // Clear the input after adding
      if (address && suaveWallet && publicClient) {
        console.log(address)

        // Compute nonce for the transaction
        const nonce = await getUserNonce()
        await publicClient.getTransactionCount({
          address,
        })
        console.log(`sending prompt with threadId ${threadId}`)
        const hash = await submitPrompt({
          prompt: inputValue,
          threadId: threadId || "", // TODO: cache this in LocalStorage or smth
          suaveWallet,
          nonce, // Pass the computed nonce
        })

        console.debug("tx hash", hash)
        setPendingTxs([...pendingTxs, hash])
      }
    }
  }

  const isUserPrompt = (msg: string) => {
    console.log({ prompts })
    return prompts.includes(msg)
  }

  const doCheckSubmission = async () => {
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

  return (
    <div className="w-full">
      <div className="space-y-2">
        <div className="flex flex-col">
          {/* {messages.toReversed().map(({ role, message }, idx) =>
            role === "user" ? (
              <Card
                key={`key_${idx}`}
                className="ml-auto w-3/4 bg-muted p-4 text-sm"
              >
                <p>{message}</p>
              </Card>
            ) : (
              <Card key={`key_${idx}`} className="w-3/4 p-4 text-sm">
                <p>{message}</p>
              </Card>
            )
          )} */}
        </div>
        <Input
          placeholder={"Enter your prompt"}
          disabled={!suaveWallet || creditBalance === 0n}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          className="w-full"
        />
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
        {/* <Button
          variant="outline"
          className="absolute  inset-0 opacity-0 backdrop-blur-lg transition-opacity duration-300 group-hover:opacity-100"
        >
          Add Credits
        </Button> */}
      </div>
      <div className="grid grid-cols-3">
        <div className={`col-span-1`}>
          <div>
            <button onClick={doCheckSubmission}>Check Submission</button>
          </div>
          {!messages.map(m => m.message).includes(prompts[prompts.length - 1]) &&
            pendingTxs.length === 0 &&
            threadId && (
              <button onClick={fetchMessages}>Fetch New Responses</button>
            )}
        </div>
        <div className={`col-span-2`} style={{ padding: 16, marginLeft: 16 }}>
          {messages.toReversed().map((msg, idx) => (
            <div key={`key_${idx}`}>
              {isUserPrompt(msg.message) ? "> " : ""}
              {msg.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
