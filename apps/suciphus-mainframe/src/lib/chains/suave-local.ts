// import { defineChain } from "@flashbots/suave-viem"
import { defineChain } from "viem"

import { suaveRigil } from "./suave-rigil"

export const suaveLocal = /*#__PURE__*/ defineChain({
  id: 16813125,
  name: "Suave Local",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["http://localhost:8545"] },
    public: { http: ["http://localhost:8545"] },
  },
})
