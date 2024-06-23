"use client"

import * as React from "react"
import { KeyboardEvent, useEffect, useState } from "react"
import { parseEther } from "viem"

import { submitPrompt } from "@/lib/suciphus"

import { Input } from "./ui/input"
import { useWallet } from "./wallet-provider"

export interface PromptProps {
  className?: string
}

export const Prompt = ({ className }: PromptProps) => {
  const { account, walletClient, publicClient, suaveWallet } = useWallet()
  const [inputValue, setInputValue] = useState("")
  const [prompts, setPrompts] = useState<string[]>([])

  useEffect(() => {
    if (publicClient) {
      publicClient.getLogs().then((logs) => {
        console.log(logs)
      })
    }
  }, [publicClient])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
  }

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && inputValue.trim() !== "") {
      setPrompts([...prompts, inputValue])
      setInputValue("") // Clear the input after adding
      console.log(account, { walletClient, publicClient })
      if (account && suaveWallet) {
        console.log(account)
        submitPrompt(inputValue, {
          account,
          suaveWallet,
          value: parseEther("0.001"),
        })
      }
    }
  }

  return (
    <div className={`w-full ${className}`}>
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
