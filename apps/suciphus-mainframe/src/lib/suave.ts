import {
  Address,
  // Chain,
  // createPublicClient,
  // createWalletClient,
  // custom,
  CustomTransport,
  defineChain,
  // EIP1193Provider,
  encodeFunctionData,
  formatEther,
  Hex,
} from "@flashbots/suave-viem"
import {
  getSuaveWallet,
  SuaveProvider,
  SuaveWallet,
  TransactionReceiptSuave,
  TransactionRequestSuave,
} from "@flashbots/suave-viem/chains/utils"
import { Chain, createPublicClient, http, PublicClient } from "@flashbots/suave-viem"

import "viem/window"

let publicClient: PublicClient | null = null

export const getPublicClient = (chain: Chain) => {
  if (!publicClient) {
    publicClient = createPublicClient({
      chain,
      transport: http(),
    })
  }
  return publicClient
}

// let walletClient: WalletClient | null = null

// export const getWalletClient = (provider: EIP1193Provider) => {
//   "use client"
//   if (!walletClient) {
//     walletClient = createWalletClient({
//       chain: suaveLocal,
//       transport: custom(provider),
//     })
//   }
//   return walletClient
// }

// export const walletClient = createWalletClient({
//   chain: localhost,
//   transport: custom(window.ethereum!),
// })

// export const connectWallet = async () => {
//   const addresses = await walletClient.requestAddresses()
//   console.log(addresses)
// }

export const _connectWallet = async (
  ethereum: any,
  custom: Function,
  getSuaveWallet: Function,
  getSuaveProvider: Function
): Promise<{
  wallet: SuaveWallet<CustomTransport> | null
  provider: SuaveProvider<CustomTransport> | null
}> => {
  if (!ethereum) {
    console.log("Please install a browser wallet")
    return { wallet: null, provider: null }
  }
  try {
    const [account] = await ethereum.request({ method: "eth_requestAccounts" })
    const wallet = getSuaveWallet({
      jsonRpcAccount: account as Address,
      transport: custom(ethereum),
    })
    const provider = getSuaveProvider(custom(ethereum))
    return { wallet, provider }
  } catch (error) {
    console.error("Error connecting to wallet:", error)
    return { wallet: null, provider: null }
  }
}

export const fetchBalance = async (
  provider: SuaveProvider<CustomTransport>,
  wallet: SuaveWallet<CustomTransport>
): Promise<string> => {
  if (!provider || !wallet) {
    console.warn(`provider=${provider}\nwallet=${wallet}`)
    return ""
  }
  const balanceFetched = await provider.getBalance({
    address: wallet.account.address,
  })
  return formatEther(balanceFetched)
}

export const getFunds = async (
  wallet: SuaveWallet<CustomTransport>,
  custom: Function,
  ethereum: any,
  toAddress: Address
): Promise<Hex> => {
  const privateKey =
    "0x91ab9a7e53c220e6210460b65a7a3bb2ca181412a8a7b43ff336b3df1737ce12"
  const fundingWallet = getSuaveWallet({
    privateKey: privateKey,
    transport: custom(ethereum),
  })
  const fundTx: TransactionRequestSuave = {
    to: toAddress,
    value: 1000000000000000000n,
    type: "0x0",
    gas: 21000n,
    gasPrice: 1000000000n,
  }
  const sendRes = await fundingWallet.sendTransaction(fundTx)
  return sendRes
}

export const sendTransaction = async (
  provider: SuaveProvider<CustomTransport>,
  wallet: SuaveWallet<CustomTransport>,
  deployedAddress: Address,
  OnChainStateAbi: any
): Promise<Hex> => {
  if (!provider || !wallet) {
    console.warn(`provider=${provider}\nwallet=${wallet}`)
    return "0x"
  }
  const nonce = await provider.getTransactionCount({
    address: wallet.account.address,
  })
  const ccr: TransactionRequestSuave = {
    confidentialInputs: "0x",
    kettleAddress: "0xB5fEAfbDD752ad52Afb7e1bD2E40432A485bBB7F",
    to: deployedAddress,
    gasPrice: 2000000000n,
    gas: 100000n,
    type: "0x43",
    chainId: 16813125,
    data: encodeFunctionData({
      abi: OnChainStateAbi,
      functionName: "chat",
      args: [], // Add this line
    }),
    nonce,
  }
  const hash = await wallet.sendTransaction(ccr)
  console.log(`Transaction hash: ${hash}`)
  return hash
}

export const fetchState = async (
  provider: SuaveProvider<CustomTransport>,
  deployedAddress: Address,
  OnChainStateAbi: any
): Promise<string> => {
  if (!provider) {
    console.warn(`provider=${provider}`)
    return ""
  }
  const data = await provider.readContract({
    address: deployedAddress,
    abi: OnChainStateAbi,
    functionName: "state",
    args: [], // Add this line
  })
  return data.toString()
}

export const waitForTransactionReceipt = async (
  provider: SuaveProvider<CustomTransport>,
  hash: Hex
): Promise<TransactionReceiptSuave> => {
  return provider.waitForTransactionReceipt({ hash })
}
