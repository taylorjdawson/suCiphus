import { Address } from "@flashbots/suave-viem"
import { suciphus, weth } from "@repo/suciphus-suapp"

import { env } from "@/env.mjs"

const isProduction = process.env.NODE_ENV === "production"

export const suciphusAddress = isProduction
  ? (env.NEXT_PUBLIC_SUICPHUS_ADDRESS_TOLIMAN as Address)
  : (suciphus.address as Address)

export const wethAddress = isProduction
  ? (env.NEXT_PUBLIC_WETH_ADDRESS_TOLIMAN as Address)
  : (weth.address as Address)
