import { createClient } from "@supabase/supabase-js"
import { objectToCamel } from "ts-case-convert"

import { env } from "@/env.mjs"
import { Database } from "@/types/database.types"

// Create a single supabase client for interacting with your database
const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY
)

export const newThread = async (
  thread: Database["public"]["Tables"]["threads"]["Insert"]
) => {
  console.log({ thread })
  const { data, error } = await supabase
    .from("threads")
    .insert([thread])
    .select()
  console.log("newThread", { data, error })
}
