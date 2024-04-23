import { createClient } from "@supabase/supabase-js"

import { env } from "@/env.mjs"
import { Database } from "@/types/database.types"

// Create a single supabase client for interacting with your database
const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY
)

export const newThread = (
  thread: Database["public"]["Tables"]["threads"]["Insert"]
) => {
  supabase.from("threads").insert([thread])
}
