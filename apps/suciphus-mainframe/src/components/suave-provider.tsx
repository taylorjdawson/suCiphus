"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import {
  custom,
  CustomTransport,
  encodeFunctionData,
  hexToBigInt,
  http,
  HttpTransport,
  parseEther,
} from "@flashbots/suave-viem"
import {
  getSuaveProvider,
  getSuaveWallet,
  SuaveProvider,
  SuaveWallet,
} from "@flashbots/suave-viem/chains/utils"
import { suciphus, weth } from "@repo/suciphus-suapp"
import { useAccount } from "wagmi"

import { suaveLocal } from "@/lib/chains/suave-local"
import { mintTokens } from "@/lib/suciphus"

const PRICE_PER_CREDIT = 10000000000000000n

interface SuaveWalletContextType {
  suaveWallet?: SuaveWallet<CustomTransport>
  publicClient?: SuaveProvider<HttpTransport>
  purchaseCredits?: (credits: bigint) => Promise<void>
  nonce?: number
  creditBalance?: bigint
  threads?: string[]
  refreshBalance?: () => Promise<void>
}

const SuaveWalletContext = createContext<SuaveWalletContextType>({})

export const SuaveWalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { address } = useAccount()
  const [suaveWallet, setSuaveWallet] = useState<SuaveWallet<CustomTransport>>()
  const [publicClient, setPublicClient] =
    useState<SuaveProvider<HttpTransport>>()
  const [nonce, setNonce] = useState<number>()
  const [creditBalance, setCreditBalance] = useState<bigint>()
  const [threads, setThreads] = useState<string[]>([])

  useEffect(() => {
    if (address) {
      const eth = window.ethereum
      if (eth) {
        const suaveWallet = getSuaveWallet({
          transport: custom(eth),
          jsonRpcAccount: address,
        })
        setSuaveWallet(suaveWallet)
        const publicClient = getSuaveProvider(
          http(suaveLocal.rpcUrls.default.http[0])
        )
        setPublicClient(publicClient)
      }
    }
  }, [address])

  useEffect(() => {
    if (publicClient && address) {
      publicClient.getTransactionCount({ address }).then(setNonce)
    }
  }, [publicClient, address])

  const fetchCreditBalance = async () => {
    if (suaveWallet && publicClient) {
      const newBalance = (await publicClient.readContract({
        address: weth.address,
        abi: weth.abi,
        functionName: "balanceOf",
        args: [address],
      })) as bigint
      console.log({ newBalance })
      if (newBalance > PRICE_PER_CREDIT) {
        const credits = newBalance / PRICE_PER_CREDIT
        setCreditBalance(credits)
      } else {
        setCreditBalance(0n)
      }
    }
  }

  useEffect(() => {
    fetchCreditBalance()
  }, [suaveWallet, publicClient])

  const refreshBalance = async () => {
    console.log("refreshBalance")
    await fetchCreditBalance()
  }

  const fetchThreads = async () => {
    if (suaveWallet && publicClient && address) {
      const rawThreadIds = (await publicClient.readContract({
        address: suciphus.address, // Replace with your contract's address
        abi: suciphus.abi, // Replace with your contract's ABI
        functionName: "getThreadIdsByPlayer",
        args: [address],
      })) as string[]
      const threadIds = [
        ...new Set(rawThreadIds.map((id) => id.replace(/"/g, ""))),
      ]
      setThreads(threadIds)
    }
  }

  useEffect(() => {
    fetchThreads()
  }, [suaveWallet, publicClient, address])

  /**
   * Purchases credits by minting tokens.
   *
   * @param {bigint} credits - The amount of credits to purchase.
   * @throws Will throw an error if the wallet or nonce is not initialized.
   */
  const purchaseCredits = async (credits: bigint) => {
    if (!suaveWallet || nonce === undefined) {
      throw new Error("Wallet or nonce not initialized")
    }
    const value = PRICE_PER_CREDIT * credits
    console.log("purchaseCredits", { nonce })
    await mintTokens({
      suaveWallet,
      value,
      nonce,
    })

    // Update credit balance
    fetchCreditBalance()
  }

  return (
    <SuaveWalletContext.Provider
      value={{
        suaveWallet,
        publicClient,
        purchaseCredits,
        nonce,
        creditBalance,
        threads,
        refreshBalance,
      }}
    >
      {children}
    </SuaveWalletContext.Provider>
  )
}

export const useSuaveWallet = () => useContext(SuaveWalletContext)
