import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    SUPABASE_URL: z.string().min(1),
    SUPABASE_SERVICE_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1),
    SUPABASE_CLIENT_KEY: z.string().min(1),
  },
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_CLIENT_KEY: process.env.SUPABASE_CLIENT_KEY,
  },
})
