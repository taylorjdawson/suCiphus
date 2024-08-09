import { Address } from "@flashbots/suave-viem"

import { env } from "@/env.mjs"

const isProduction = process.env.NODE_ENV === "production"

export const suciphusAddress = isProduction
  ? (env.NEXT_PUBLIC_SUICPHUS_ADDRESS_TOLIMAN as Address)
  : (env.NEXT_PUBLIC_SUICPHUS_ADDRESS_LOCAL as Address)

export const wethAddress = isProduction
  ? (env.NEXT_PUBLIC_WETH_ADDRESS_TOLIMAN as Address)
  : (env.NEXT_PUBLIC_WETH_ADDRESS_LOCAL as Address)
