"use client"

import * as React from "react"
import { KeyboardEvent, useEffect, useState } from "react"
import {
  Address,
  CustomTransport,
  decodeEventLog,
  encodeFunctionData,
  Hash,
  HttpTransport,
  parseEther,
} from "@flashbots/suave-viem"
import suciphus from "@repo/suciphus-suapp/out/Suciphus.sol/Suciphus.json"
import { suciphus as suciphusDeployment } from "@repo/suciphus-suapp/src/suciphus"

import { submitPrompt } from "@/lib/suciphus"

import { Input } from "./ui/input"
import { useWallet } from "./wallet-provider"

export interface PromptProps {
  className?: string
}

export const Prompt = ({ className }: PromptProps) => {
  const { suaveWallet, publicClient, account } = useWallet()
  const [inputValue, setInputValue] = useState("")
  const [prompts, setPrompts] = useState<string[]>([])
  const [stateVal, setStateVal] = useState<number>()
  const [pendingTxs, setPendingTxs] = useState<Hash[]>([])

  const fetchPendingReceipts = async (txHashes: Hash[]) => {
    console.log("fetchPendingReceipts", { txHashes })
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
            console.log("decoded log", decoded)
          }
          setPendingTxs((prev) => prev.filter((hash) => hash !== txHash))
        }
      }
    }
  }

  useEffect(() => {
    if (stateVal === undefined) {
      // fetchState()
    }
    if (publicClient) {
      publicClient
        .getContractEvents({
          abi: suciphus.abi,
          address: suciphusDeployment.address,
        })
        .then((logs) => {
          console.log({ logs })
        })
      publicClient.watchPendingTransactions({
        onTransactions: async (txHashes) => {
          // await fetchState()
          await fetchPendingReceipts(txHashes)
        },
      })
    }
  }, [publicClient, pendingTxs])

  // const fetchState = async () => {
  //   if (publicClient) {
  //     const state = await publicClient.call({
  //       to: suciphusDeployment.address,
  //       data: encodeFunctionData({
  //         abi: suciphus.abi,
  //         functionName: "stateNum",
  //       }),
  //     })
  //     if (!state.data) {
  //       console.warn("No data returned from state call")
  //       return
  //     }
  //     setStateVal(parseInt(state.data, 16))
  //   }
  // }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
  }

  const handleKeyPress = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && inputValue.trim() !== "") {
      setPrompts([...prompts, inputValue])
      setInputValue("") // Clear the input after adding
      if (account && suaveWallet && publicClient) {
        console.log(account)

        // Compute nonce for the transaction
        const nonce = await publicClient.getTransactionCount({
          address: account,
        })
        const hash = await submitPrompt({
          prompt: inputValue,
          threadId: "", // TODO: cache this in LocalStorage or smth
          suaveWallet,
          nonce, // Pass the computed nonce
        })

        console.log("tx hash", hash)
        setPendingTxs([...pendingTxs, hash])
      }
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <div>
        State: {stateVal === undefined ? <em>loading...</em> : stateVal}
      </div>
      <div>
        {prompts.map((prompt, index) => (
          <div key={index}>{prompt}</div>
        ))}
      </div>
      <div>
        <Input
          placeholder="Enter your prompt"
          disabled={!suaveWallet}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
        />
      </div>
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
  )
}
