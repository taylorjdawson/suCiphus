"use client"

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"
import {
  //   createPublicClient,
  //   createWalletClient,
  custom as suaveCustom,
  Transport,
  //   http,
  //   PublicClient,
  //   WalletClient,
} from "@flashbots/suave-viem"
import {
  Address,
  createPublicClient,
  createWalletClient,
  custom,
  http,
  PublicClient,
  WalletClient,
} from "viem"

import "viem/window"

import { getSuaveWallet, SuaveWallet } from "@flashbots/suave-viem/chains/utils"

import { suaveLocal } from "@/lib/chains/suave-local"
import { getPublicClient } from "@/lib/suave"

interface WalletContextType {
  walletClient: WalletClient | null
  connectWallet: () => Promise<void>
  account: Address | null
  publicClient: PublicClient | null
  suaveWallet: SuaveWallet<Transport> | null
}

// Define the context with default values
const WalletContext = createContext<WalletContextType>({
  walletClient: null,
  connectWallet: async () => {},
  account: null,
  publicClient: null,
  suaveWallet: null,
})

interface WalletProviderProps {
  children: ReactNode
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null)
  const [suaveWallet, setSuaveWallet] = useState<SuaveWallet<Transport> | null>(
    null
  )
  const [account, setAccount] = useState<Address | null>(null)
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null)

  const configureChain = async (
    walletClient: WalletClient
  ): Promise<boolean> => {
    let error = await walletClient
      .switchChain({ id: suaveLocal.id })
      .catch((error) => error)

    if (error?.name === "SwitchChainError") {
      console.log("here")
      error = await walletClient
        .addChain({ chain: suaveLocal })
        .catch((error) => error)
    } else if (error?.name === "UserRejectedRequestError") {
      // Handle user rejection logic here if needed
    } else if (error?.name === "ResourceUnavailableRpcError") {
      // Handle resource unavailable logic here if needed
    } else if (error) {
      // Handle any other unknown errors here if needed
    }
    console.log({ ...error })
    return !error
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("creatting wallet client")
      const client = createWalletClient({
        chain: suaveLocal,
        transport: custom(window.ethereum!),
      })

      setWalletClient(client)
      configureChain(client).then(async (success) => {
        if (success) {
          const addresses = await client.requestAddresses()
          if (addresses.length > 0) {
            setAccount(addresses[0])
          }
        }
      })
    }
    const publicClient = getPublicClient(suaveLocal)
    setPublicClient(publicClient)

    // Initialize the wallet client
  }, [])

  useEffect(() => {
    if (account) {
      const suaveWallet = getSuaveWallet({
        transport: suaveCustom(window.ethereum!),
        jsonRpcAccount: account,
      })
      console.log({ suaveWallet })
      setSuaveWallet(suaveWallet)
    }
  }, [account])

  const connectWallet = async () => {
    if (!walletClient) return
    const addresses = await walletClient.requestAddresses()
    if (addresses.length > 0) {
      console.log("setting account", addresses[0])
      setAccount(addresses[0])
    }
  }

  return (
    <WalletContext.Provider
      value={{
        walletClient,
        connectWallet,
        account,
        publicClient,
        suaveWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

// Custom hook to use the wallet context
export const useWallet = () => useContext(WalletContext)
