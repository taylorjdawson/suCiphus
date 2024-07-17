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
import weth from "@repo/suciphus-suapp/out/WETH9.sol/WETH9.json"
import { suciphus as suciphusDeployment, weth as wethDeployment } from "@repo/suciphus-suapp/src/suciphus"

import { mintTokens, readMessages, submitPrompt } from "@/lib/suciphus"

import { Input } from "./ui/input"
import { useWallet } from "./wallet-provider"
import { removeQuotes } from '@/lib/utils'

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
                if (decoded.eventName === "PromptSubmitted" && "threadId" in decoded.args) {
                  const decodedThreadId = removeQuotes(decoded.args.threadId as string)
                  setThreadId(decodedThreadId)
                  console.log("threadId", decodedThreadId)
                }
                else if (decoded.eventName === "LogStrings" && "values" in decoded.args) {
                  console.log("decoded messages", decoded.args.values)
                  const decodedMessages = (decoded.args.values as string[]).map(removeQuotes)
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

  const isUserPrompt = (msg: string) => {
    return prompts.includes(msg)
  }

  const doMintTokens = async () => {
    if (suaveWallet) {
      const nonce = await getUserNonce()
      const txHash = await mintTokens({
        suaveWallet,
        value: parseEther("0.1"),
        nonce,
      })
      setPendingTxs([...pendingTxs, txHash])
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <div className='text-sm'>
        <div>
          <button onClick={doMintTokens}>Mint Tokens</button>
        </div>
        {/* {threadId && <div>Thread ID: {threadId}</div>} */}
        {pendingTxs.length > 0 && (
          // TODO: make this a floating notification
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
      <div className="grid grid-cols-3">
        <div className={`col-span-1`}>
          <div>
            <Input
              placeholder="Enter your prompt"
              disabled={!suaveWallet}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
            />
          </div>
          {!messages.includes(prompts[prompts.length - 1]) && pendingTxs.length === 0 && threadId && <button onClick={fetchMessages}>Fetch New Responses</button >}
        </div>
        <div className={`col-span-2`} style={{ padding: 16, marginLeft: 16 }}>
          {messages.toReversed().map((msg, idx) => <div key={`key_${idx}`}>{isUserPrompt(msg) ? "> " : ""}{msg}</div>)}
        </div>
      </div>

    </div>
  )
}
