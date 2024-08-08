"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import {
  Address,
  custom,
  CustomTransport,
  Hex,
  http,
  HttpTransport,
  parseAbiItem, // Import parseAbiItem
} from "@flashbots/suave-viem"
import {
  getSuaveProvider,
  getSuaveWallet,
  SuaveProvider,
  SuaveWallet,
} from "@flashbots/suave-viem/chains/utils"
import {
  startWatchingEvents,
  useContractEvents,
  useOnSubmissionSuccess,
} from "@hooks/useContractEvents"
// Import useOnSubmissionSuccess
import { Subscribe } from "@react-rxjs/core"
import { suciphus, weth } from "@repo/suciphus-suapp"
import { useAccount, useTransactionCount } from "wagmi"

import { suaveChain, suaveLocal } from "@/lib/suave"
import {
  checkSubmission as checkSubmissionCall,
  getPotValue,
  mintTokens,
} from "@/lib/suciphus"

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
  updateThreads?: (id: string, runId: string) => void
  gameRound?: number
  selectedRound?: number
  setSelectedRound?: (round: number) => void
  potValue?: bigint
  checkingSubmission?: boolean
  checkSubmission?: (threadId: string, runId: string) => Promise<Hex>
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
  const [gameRound, setGameRound] = useState<number>()
  const [selectedRound, setSelectedRound] = useState<number>()
  const [potValue, setPotValue] = useState<bigint>(0n)
  const [checkingSubmission, setCheckingSubmission] = useState(false)

  const submissionSuccess$ = useOnSubmissionSuccess() // Add this line
  const contractEvent$ = useContractEvents() // Add this line

  useEffect(() => {
    setSelectedRound(gameRound)
  }, [gameRound])

  useEffect(() => {
    if (address && chain) {
      const eth = window.ethereum
      if (eth) {
        const suaveWallet = getSuaveWallet({
          transport: custom(eth),
          jsonRpcAccount: address,
          // @ts-ignore @todo remove hardcode chain - set chain only in development mode
          chain:
            process.env.NODE_ENV === "development" ? suaveLocal : undefined,
        })

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

      const threads = rawThreadIds.map((thread) => ({
        ...thread,
        id: thread.id.replace(/['"]/g, ""),
        round: Number(thread.round), // Convert round from bigint to number
      }))

      const uniqueThreads = [
        ...new Map(threads.map((thread) => [thread.id, thread])).values(),
      ]

      // Filter threads by selectedRound
      // const filteredThreads = uniqueThreads.filter(
      //   (thread) => thread.round === selectedRound
      // )

      setThreads(uniqueThreads)
    }
  }

  useEffect(() => {
    fetchThreads()
  }, [suaveWallet, publicClient, address, selectedRound])

  /**
   * Fetches the current round from the contract.
   */
  const fetchCurrentRound = async () => {
    if (publicClient) {
      const round = (await publicClient.readContract({
        address: suciphus.address,
        abi: suciphus.abi,
        functionName: "getCurrentRound",
      })) as bigint
      setGameRound(Number(round))
    }
  }

  useEffect(() => {
    fetchCurrentRound()
  }, [publicClient])

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

  /**
   * Updates the threads array by adding a new thread to the start.
   *
   * @param {Thread} newThread - The new thread to add.
   */
  const updateThreads = (id: string, runId: string) => {
    setThreads((prevThreads) => [
      { id, runId, round: gameRound || 0, success: false },
      ...prevThreads,
    ])
  }

  const fetchPotValue = async () => {
    if (publicClient) {
      const value = await getPotValue(publicClient)
      setPotValue(value)
    }
  }

  useEffect(() => {
    fetchPotValue() // Initial fetch
    const interval = setInterval(fetchPotValue, 6000) // Update every 6 seconds
    return () => clearInterval(interval) // Cleanup on unmount
  }, [publicClient])

  useEffect(() => {
    if (publicClient && address) {
      console.log("watching events")
      const unwatch = startWatchingEvents(
        publicClient,
        suciphus.address,
        address
      )
      return () => unwatch()
    }
  }, [publicClient])

  useEffect(() => {
    const subscription = submissionSuccess$.subscribe(async (logs: any) => {
      console.log("onSuccessfulSubmission", { logs })
      await fetchCurrentRound()
      await fetchPotValue()
    })
    return () => subscription.unsubscribe()
  }, [submissionSuccess$])

  useEffect(() => {
    const subscription = contractEvent$.subscribe(async (logs: any) => {
      console.log("onContractEvent", { logs })
      if (publicClient && address) {
        const newNonce = await publicClient.getTransactionCount({ address })
        setNonce(newNonce)
      }
    })
    return () => subscription.unsubscribe()
  }, [contractEvent$, publicClient, address])

  const checkSubmission = async (
    threadId: string,
    runId: string
  ): Promise<Hex> => {
    if (suaveWallet && nonce !== undefined) {
      // Use nonce from state
      setCheckingSubmission(true)
      const txHash = await checkSubmissionCall({
        threadId: threadId,
        suaveWallet,
        nonce,
      })
      setCheckingSubmission(false)
      return txHash
    } else {
      throw new Error(
        "undefined element(s) must be defined" +
          JSON.stringify({ runId, suaveWallet, nonce })
      )
    }
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
        updateThreads,
        gameRound,
        selectedRound,
        setSelectedRound,
        potValue,
        checkingSubmission,
        checkSubmission,
      }}
    >
      {children}
    </SuaveWalletContext.Provider>
  )
}

export const useSuaveWallet = () => useContext(SuaveWalletContext)
