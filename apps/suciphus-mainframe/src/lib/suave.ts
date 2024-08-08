import { Address } from "@flashbots/suave-viem"
import { suaveToliman } from "@flashbots/suave-viem/chains"
import { defineChain } from "@flashbots/suave-viem/utils"

const networkUrlHttp = "http://localhost:8545"
const networkUrlWs = "ws://localhost:8545"
const explorerUrl = "http://localhost:8545"
export { suaveToliman }
export const suaveLocal = defineChain({
  id: 16813125,
  name: "Suave Local",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  testnet: true,
  network: "suave-local-testnet",
  rpcUrls: {
    default: {
      http: [networkUrlHttp],
      webSocket: [networkUrlWs],
    },
    public: {
      http: [networkUrlHttp],
      webSocket: [networkUrlWs],
    },
  },
  blockExplorers: {
    default: {
      name: `SUAVE Local Explorer`,
      url: explorerUrl,
    },
  },
  contracts: {
    ANYALLOWED: {
      address: "0xc8df3686b4afb2bb53e60eae97ef043fe03fb829" as Address,
    },
    IS_CONFIDENTIAL_ADDR: {
      address: "0x0000000000000000000000000000000042010000" as Address,
    },
    BUILD_ETH_BLOCK: {
      address: "0x0000000000000000000000000000000042100001" as Address,
    },
    CONFIDENTIAL_INPUTS: {
      address: "0x0000000000000000000000000000000042010001" as Address,
    },
    CONFIDENTIAL_RETRIEVE: {
      address: "0x0000000000000000000000000000000042020001" as Address,
    },
    CONFIDENTIAL_STORE: {
      address: "0x0000000000000000000000000000000042020000" as Address,
    },
    ETHCALL: {
      address: "0x0000000000000000000000000000000042100003" as Address,
    },
    EXTRACT_HINT: {
      address: "0x0000000000000000000000000000000042100037" as Address,
    },
    FETCH_BIDS: {
      address: "0x0000000000000000000000000000000042030001" as Address,
    },
    FILL_MEV_SHARE_BUNDLE: {
      address: "0x0000000000000000000000000000000043200001" as Address,
    },
    NEW_BID: {
      address: "0x0000000000000000000000000000000042030000" as Address,
    },
    SIGN_ETH_TRANSACTION: {
      address: "0x0000000000000000000000000000000040100001" as Address,
    },
    SIMULATE_BUNDLE: {
      address: "0x0000000000000000000000000000000042100000" as Address,
    },
    SUBMIT_BUNDLE_JSON_RPC: {
      address: "0x0000000000000000000000000000000043000001" as Address,
    },
    SUBMIT_ETH_BLOCK_BID_TO_RELAY: {
      address: "0x0000000000000000000000000000000042100002" as Address,
    },
  },
})

export const suaveChain =
  process.env.NODE_ENV === "production" ? suaveToliman : suaveLocal
