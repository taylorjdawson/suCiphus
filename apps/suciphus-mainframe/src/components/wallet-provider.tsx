"use client"

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"
import {
  Address,
  createWalletClient,
  custom,
  CustomTransport,
  http,
  HttpTransport,
  WalletClient,
} from "@flashbots/suave-viem"

import { getSuaveProvider, getSuaveWallet, SuaveProvider, SuaveWallet } from "@flashbots/suave-viem/chains/utils"

import { suaveLocal } from "@/lib/chains/suave-local"

interface WalletContextType {
  walletClient: WalletClient | null
  connectWallet: () => Promise<void>
  account: Address | null
  publicClient: SuaveProvider<HttpTransport> | null
  suaveWallet: SuaveWallet<CustomTransport> | null
}

// Define the context with default values
const WalletContext = createContext<WalletContextType>({
  walletClient: null,
  connectWallet: async () => { },
  account: null,
  publicClient: null,
  suaveWallet: null,
})

interface WalletProviderProps {
  children: ReactNode
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null)
  const [suaveWallet, setSuaveWallet] = useState<SuaveWallet<CustomTransport> | null>(
    null
  )
  const [account, setAccount] = useState<Address | null>(null)
  const [publicClient, setPublicClient] = useState<SuaveProvider<HttpTransport>>()

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

  const getWindowEthereum = () => {
    if (typeof window !== "undefined" && "ethereum" in window) {
      return window.ethereum as { request(...args: any): Promise<any> }
    }
    return null
  }

  useEffect(() => {
    const eth = getWindowEthereum()
    if (eth && !walletClient) {
      console.log("creating wallet client")
      const client = createWalletClient({
        chain: suaveLocal,
        transport: custom(eth),
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

    if (!publicClient) {
      const publicClient = getSuaveProvider(http(suaveLocal.rpcUrls.default.http[0]))
      setPublicClient(publicClient)
    }

    // Initialize the wallet client
  }, [publicClient, walletClient])

  useEffect(() => {
    if (account) {
      const eth = getWindowEthereum()
      if (!eth) return
      const suaveWallet = getSuaveWallet({
        transport: custom(eth),
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

  if (!publicClient) {
    console.warn("public client not initialized")
    return
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
