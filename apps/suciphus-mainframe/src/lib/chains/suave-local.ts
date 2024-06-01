import { defineChain } from "@flashbots/suave-viem"

import { suaveRigil } from "./suave-rigil"

export const suaveLocal = /*#__PURE__*/ defineChain({
  ...suaveRigil,
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
