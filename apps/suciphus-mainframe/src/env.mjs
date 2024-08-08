import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

// Custom Zod schema for Ethereum address
const addressSchema = z.string().refine(
  (val) => {
    return /^0x[a-fA-F0-9]{40}$/.test(val)
  },
  {
    message:
      "Invalid Ethereum address. Must start with '0x' and be 42 characters long.",
  }
)

// Schema to ensure either local or TOLIMAN addresses are defined
const addressValidationSchema = z
  .object({
    NEXT_PUBLIC_SUICPHUS_ADDRESS_TOLIMAN: addressSchema.optional(),
    NEXT_PUBLIC_WETH_ADDRESS_TOLIMAN: addressSchema.optional(),
    NEXT_PUBLIC_SUICPHUS_ADDRESS_LOCAL: addressSchema.optional(),
    NEXT_PUBLIC_WETH_ADDRESS_LOCAL: addressSchema.optional(),
  })
  .refine(
    (data) => {
      return (
        (data.NEXT_PUBLIC_SUICPHUS_ADDRESS_TOLIMAN &&
          data.NEXT_PUBLIC_WETH_ADDRESS_TOLIMAN) ||
        (data.NEXT_PUBLIC_SUICPHUS_ADDRESS_LOCAL &&
          data.NEXT_PUBLIC_WETH_ADDRESS_LOCAL)
      )
    },
    {
      message: "Either both TOLIMAN or both LOCAL addresses must be defined.",
    }
  )

export const env = createEnv({
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1),
    NEXT_PUBLIC_SUICPHUS_ADDRESS_TOLIMAN: addressSchema.optional(),
    NEXT_PUBLIC_WETH_ADDRESS_TOLIMAN: addressSchema.optional(),
    NEXT_PUBLIC_SUICPHUS_ADDRESS_LOCAL: addressSchema.optional(),
    NEXT_PUBLIC_WETH_ADDRESS_LOCAL: addressSchema.optional(),
  },
  server: {
    OPENAI_API_KEY: z.string().min(1),
  },
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXT_PUBLIC_SUICPHUS_ADDRESS_TOLIMAN:
      process.env.NEXT_PUBLIC_SUICPHUS_ADDRESS_TOLIMAN,
    NEXT_PUBLIC_WETH_ADDRESS_TOLIMAN:
      process.env.NEXT_PUBLIC_WETH_ADDRESS_TOLIMAN,
    NEXT_PUBLIC_SUICPHUS_ADDRESS_LOCAL:
      process.env.NEXT_PUBLIC_SUICPHUS_ADDRESS_LOCAL,
    NEXT_PUBLIC_WETH_ADDRESS_LOCAL: process.env.NEXT_PUBLIC_WETH_ADDRESS_LOCAL,
  },
  validationSchema: addressValidationSchema, // Add the validation schema here
})
