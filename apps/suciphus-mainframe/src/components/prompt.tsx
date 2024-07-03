"use client"

import * as React from "react"
import { KeyboardEvent, useEffect, useState } from "react"
import { encodeFunctionData, parseEther } from "@flashbots/suave-viem"

import { submitPrompt } from "@/lib/suciphus"
import { suciphus as suciphusDeployment } from "@repo/suciphus-suapp/src/suciphus"
import suciphus from "@repo/suciphus-suapp/out/Suciphus.sol/Suciphus.json"

import { Input } from "./ui/input"
import { useWallet } from "./wallet-provider"

export interface PromptProps {
  className?: string
}

export const Prompt = ({ className }: PromptProps) => {
  const { account, walletClient, publicClient, suaveWallet } = useWallet()
  const [inputValue, setInputValue] = useState("")
  const [prompts, setPrompts] = useState<string[]>([])
  const [stateVal, setStateVal] = useState<number>()

  useEffect(() => {
    fetchState()
    if (publicClient) {
      publicClient.watchPendingTransactions({
        onTransactions: async (_txHashes) => {
          await fetchState()
        },
      })
    }
  }, [])

  const fetchState = async () => {
    if (publicClient) {
      const state = await publicClient.call({
        to: suciphusDeployment.address,
        data: encodeFunctionData({
          abi: suciphus.abi,
          functionName: "stateNum",
        }),
      })
      if (!state.data) {
        console.warn("No data returned from state call")
        return
      }
      setStateVal(parseInt(state.data, 16))
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
  }

  const handleKeyPress = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && inputValue.trim() !== "") {
      setPrompts([...prompts, inputValue])
      setInputValue("") // Clear the input after adding
      console.log(account, { walletClient, publicClient })
      if (account && suaveWallet) {
        console.log(account)
        const hash = await submitPrompt(inputValue, {
          account,
          suaveWallet,
          value: parseEther("0.001"),
        })
        console.log("tx hash", hash)
        if (!publicClient) {
          console.warn("No public client")
          return
        }
      }
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <div>State: {stateVal || "undefined"}</div>
      <div>
        {prompts.map((prompt, index) => (
          <div key={index}>{prompt}</div>
        ))}
      </div>
      <div>
        <Input
          placeholder="Enter your prompt"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
        />
      </div>
    </div>
  )
}
