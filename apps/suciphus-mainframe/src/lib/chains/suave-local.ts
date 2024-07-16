// import { defineChain } from "@flashbots/suave-viem"
import { defineChain } from "@flashbots/suave-viem"

import { suaveRigil } from "./suave-rigil"

export const suaveLocal = /*#__PURE__*/ defineChain({
  id: suaveRigil.id,
  name: "Suave Local",
  network: "local",
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
