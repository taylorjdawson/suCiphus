import { createConfig, http } from "wagmi"
import { injected, metaMask } from "wagmi/connectors"

import { suaveChain, suaveLocal, suaveToliman } from "./suave"

// export const config = createConfig({
//   ssr: true,
//   //@ts-ignore
//   chains: [suaveLocal],
//   connectors: [injected(), metaMask({ dappMetadata: { name: "Suciphus" } })],
//   transports: {
//     [suaveLocal.id]: http(),
//   },
// })

export const config = createConfig({
  ssr: true,
  //@ts-ignore
  chains: [suaveToliman, suaveLocal],
  connectors: [injected(), metaMask({ dappMetadata: { name: "Suciphus" } })],
  transports: {
    [suaveToliman.id]: http(suaveToliman.rpcUrls.default.http[0]),
    [suaveLocal.id]: http(),
  },
})
