"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import {
  custom,
  CustomTransport,
  http,
  HttpTransport,
} from "@flashbots/suave-viem"
import {
  getSuaveProvider,
  getSuaveWallet,
  SuaveProvider,
  SuaveWallet,
} from "@flashbots/suave-viem/chains/utils"
import { suciphus, weth } from "@repo/suciphus-suapp"
import { useAccount } from "wagmi"

import { suaveChain, suaveLocal } from "@/lib/suave"
import { mintTokens } from "@/lib/suciphus"

const PRICE_PER_CREDIT = 10000000000000000n

export interface Thread {
  id: string
  round: number
  success: boolean
  runId: string
}

interface SuaveWalletContextType {
  suaveWallet?: SuaveWallet<CustomTransport>
  publicClient?: SuaveProvider<HttpTransport>
  purchaseCredits?: (credits: bigint) => Promise<void>
  nonce?: number
  creditBalance?: bigint
  threads?: Thread[]
  refreshBalance?: () => Promise<void>
}

const SuaveWalletContext = createContext<SuaveWalletContextType>({})

export const SuaveWalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { address, chain } = useAccount()
  const [suaveWallet, setSuaveWallet] = useState<SuaveWallet<CustomTransport>>()
  const [publicClient, setPublicClient] =
    useState<SuaveProvider<HttpTransport>>()
  const [nonce, setNonce] = useState<number>()
  const [creditBalance, setCreditBalance] = useState<bigint>()
  const [threads, setThreads] = useState<Thread[]>([])

  useEffect(() => {
    if (address && chain) {
      const eth = window.ethereum
      if (eth) {
        console.log(chain.rpcUrls.default.http[0])
        const suaveWallet = getSuaveWallet({
          transport: custom(eth),
          jsonRpcAccount: address,
          // @ts-ignore @todo remove hardcode chain - set chain only in development mode
          chain:
            process.env.NODE_ENV === "development" ? suaveLocal : undefined,
        })
        console.log({ chain, suaveChain })
        // @ts-ignore
        setSuaveWallet(suaveWallet)
        const publicClient = getSuaveProvider(
          http(chain.rpcUrls.default.http[0])
        )
        setPublicClient(publicClient)
      }
    }
  }, [address, chain])

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
      })) as Thread[]

      const uniqueThreads = [
        ...new Map(
          rawThreadIds.map((thread) => [thread.id.replace(/['"]/g, ""), thread])
        ).values(),
      ]

      setThreads(uniqueThreads)
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
