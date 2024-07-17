"use client"

import * as React from "react"
import { KeyboardEvent, useEffect, useState } from "react"
import {
  Address,
  CustomTransport,
  decodeEventLog,
  encodeFunctionData,
  Hash,
  Hex,
  hexToString,
  HttpTransport,
  parseEther,
} from "@flashbots/suave-viem"
import suciphus from "@repo/suciphus-suapp/out/Suciphus.sol/Suciphus.json"
import { suciphus as suciphusDeployment } from "@repo/suciphus-suapp/src/suciphus"

import { readMessages, submitPrompt } from "@/lib/suciphus"

import { Input } from "./ui/input"
import { useWallet } from "./wallet-provider"

export interface PromptProps {
  className?: string
}

export const Prompt = ({ className }: PromptProps) => {
  const { suaveWallet, publicClient, account } = useWallet()
  const [inputValue, setInputValue] = useState("")
  const [prompts, setPrompts] = useState<string[]>([])
  const [messages, setMessages] = useState<string[]>([])
  const [pendingTxs, setPendingTxs] = useState<Hash[]>([])
  const [threadId, setThreadId] = useState<string>()

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
            const decoded = decodeEventLog({
              abi: suciphus.abi,
              data: log.data,
              topics: log.topics,
            })
            console.debug("decoded log", decoded)
            if (decoded.args) {
              if (decoded.eventName === "PromptSubmitted" && "threadId" in decoded.args) {
                const decodedThreadId = (decoded.args.threadId as string).replace(/"/g, "")
                setThreadId(decodedThreadId)
                console.log("threadId", decodedThreadId)
              }
              else if (decoded.eventName === "LogStrings" && "values" in decoded.args) {
                console.log("decoded messages", decoded.args.values)
                const decodedMessages = (decoded.args.values as string[]).map((str: string) => str.replace(/"/g, ""))
                setMessages(decodedMessages)
              }
            }
          }
          setPendingTxs((prev) => prev.filter((hash) => hash !== txHash))
        }
      }
    }
  }

  useEffect(() => {
    if (publicClient) {
      publicClient
        .getContractEvents({
          abi: suciphus.abi,
          address: suciphusDeployment.address,
        })
        .then((logs) => {
          console.debug({ logs })
        })
      publicClient.watchPendingTransactions({
        onTransactions: async (txHashes) => {
          // await fetchState()
          await fetchPendingReceipts(txHashes)
        },
      })
    }
  }, [publicClient, pendingTxs])

  const fetchMessages = async () => {
    const nonce = await getUserNonce()
    if (threadId && suaveWallet && publicClient) {
      const txHash = await readMessages({
        suaveWallet,
        threadId: threadId,
        prompt: "",
        nonce,
      })
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
    if (!account) {
      throw new Error("account not initialized")
    }
    return await publicClient.getTransactionCount({
      address: account,
    })
  }

  const handleKeyPress = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && inputValue.trim() !== "") {
      setPrompts([...prompts, inputValue])
      setInputValue("") // Clear the input after adding
      if (account && suaveWallet && publicClient) {
        console.log(account)

        // Compute nonce for the transaction
        const nonce = await getUserNonce()
        await publicClient.getTransactionCount({
          address: account,
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

  return (
    <div className={`w-full grid grid-cols-2 ${className}`}>
      <div className={`col-auto`}>
        {threadId && <div>Thread ID: {threadId}</div>}
        <div>
          <Input
            placeholder="Enter your prompt"
            disabled={!suaveWallet}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
          />
        </div>
        {prompts.length !== messages.length / 2 && pendingTxs.length === 0 && threadId && <button onClick={fetchMessages}>Fetch New Responses</button >}
        {pendingTxs.length > 0 && (
          <div>
            <p>Pending</p>
            <ul>
              {pendingTxs.map((tx, index) => (
                <li key={index}>{tx}</li>
              ))}
            </ul>
          </div>
        )}

      </div>
      <div className={`col-auto`} style={{ padding: 16, marginLeft: 16 }}>
        {messages.toReversed().map((msg, idx) => <div key={`key_${idx}`}>{idx % 2 === 0 ? "> " : ""}{msg}</div>)}
        {prompts.length !== messages.length / 2 && <div>{"> "}{prompts[prompts.length - 1]}</div>}
      </div>
    </div>
  )
}
