// import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { defineChain } from "viem"
import { createConfig, http } from "wagmi"
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from "wagmi/chains"
import { injected, metaMask, safe, walletConnect } from "wagmi/connectors"

export const suaveLocal = defineChain({
  id: 16813125,
  name: "Suave Local",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://localhost:8545"] },
  },
  testnet: true,
})

export const config = createConfig({
  ssr: true,
  chains: [mainnet, optimism, base, suaveLocal],
  connectors: [injected(), metaMask({ dappMetadata: { name: "Suciphus" } })],
  transports: {
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
    [suaveLocal.id]: http(),
  },
})
