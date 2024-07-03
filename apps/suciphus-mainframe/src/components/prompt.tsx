"use client"

import * as React from "react"
import { KeyboardEvent, useEffect, useState } from "react"
import { Address, CustomTransport, HttpTransport, encodeFunctionData, parseEther } from "@flashbots/suave-viem"

import { submitPrompt } from "@/lib/suciphus"
import { suciphus as suciphusDeployment } from "@repo/suciphus-suapp/src/suciphus"
import suciphus from "@repo/suciphus-suapp/out/Suciphus.sol/Suciphus.json"

import { Input } from "./ui/input"
import { useWallet } from "./wallet-provider"

export interface PromptProps {
  className?: string,
}

export const Prompt = ({ className }: PromptProps) => {
  const { suaveWallet, publicClient, account } = useWallet()
  const [inputValue, setInputValue] = useState("")
  const [prompts, setPrompts] = useState<string[]>([])
  const [stateVal, setStateVal] = useState<number>()

  useEffect(() => {
    if (stateVal === undefined) {
      fetchState()
    }
    if (publicClient) {
      publicClient.watchPendingTransactions({
        onTransactions: async (_txHashes) => {
          await fetchState()
        },
      })
    }
  }, [stateVal, publicClient])

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
      if (account && suaveWallet) {
        console.log(account)
        const hash = await submitPrompt(inputValue, {
          account,
          suaveWallet,
          value: parseEther("0.001"),
        })
        console.log("tx hash", hash)
      }
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <div>State: {stateVal || <em>loading...</em>}</div>
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
    </div>
  )
}
