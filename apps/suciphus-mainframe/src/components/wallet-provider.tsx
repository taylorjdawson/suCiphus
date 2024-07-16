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
  connectWallet: () => Promise<void>
  account?: Address
  publicClient?: SuaveProvider<HttpTransport>
  suaveWallet?: SuaveWallet<CustomTransport>
}

type EthereumProvider = { request(...args: any): Promise<any> }

// Define the context with default values
const WalletContext = createContext<WalletContextType>({
  connectWallet: async () => {
    console.warn("Wallet provider not initialized")
  },
})

interface WalletProviderProps {
  children: ReactNode
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [suaveWallet, setSuaveWallet] = useState<SuaveWallet<CustomTransport>>()
  const [account, setAccount] = useState<Address>()
  const [publicClient, setPublicClient] = useState<SuaveProvider<HttpTransport>>()
  const [walletClient, setWalletClient] = useState<WalletClient>()
  const [eth, setEth] = useState<{ request(...args: any): Promise<any> }>()

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
      return window.ethereum as EthereumProvider
    }
    return null
  }

  useEffect(() => {
    const eth = getWindowEthereum()
    if (!eth) {
      alert("No ethereum provider found. Please install a browser wallet.")
      return
    }
    setEth(eth)
    if (!walletClient) {
      console.log("creating wallet client")
      const client = createWalletClient({
        chain: suaveLocal,
        transport: custom(eth),
      })
      setWalletClient(client)
    }

    if (!publicClient) {
      const publicClient = getSuaveProvider(http(suaveLocal.rpcUrls.default.http[0]))
      setPublicClient(publicClient)
    }

  }, [publicClient, walletClient, account, eth])

  const connectWallet = async () => {
    if (!walletClient || !eth) {
      throw new Error("Wallet client not initialized")
    }
    configureChain(walletClient).then(async (success) => {
      if (success) {
        const addresses = await walletClient.requestAddresses()
        if (addresses.length > 0) {
          setAccount(addresses[0])
          const suaveWallet = getSuaveWallet({
            transport: custom(eth),
            jsonRpcAccount: addresses[0],
          })
          console.log({ suaveWallet })
          setSuaveWallet(suaveWallet)
        }
      }
    })
    const addresses = await walletClient.requestAddresses()
    if (addresses.length > 0) {
      setAccount(addresses[0])
    }
  }

  return (
    <WalletContext.Provider
      value={{
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
