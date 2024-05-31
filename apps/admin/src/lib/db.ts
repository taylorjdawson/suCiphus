import { createClient } from "@supabase/supabase-js"
import { objectToCamel } from "ts-case-convert"

import { env } from "@/env.mjs"
import { Database } from "@/types/database.types"
import { Thread } from "@/types/types"

// Create a single supabase client for interacting with your database
const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY
)

export const newThread = async (
  thread: Database["public"]["Tables"]["threads"]["Insert"]
) => {
  const { data, error } = await supabase
    .from("threads")
    .insert([thread])
    .select()
}

export const getThreads = async (
  threadId?: string
): Promise<Thread.Thread[]> => {
  try {
    const query = supabase.from("threads").select("*")
    if (threadId) {
      query.eq("id", threadId)
    }
    const { data, error } = await query
    if (error) {
      throw error
    }
    return objectToCamel<Thread.Row[]>(data) as Thread.Thread[]
  } catch (error) {
    console.error("Failed to fetch threads:", error)
    throw error
  }
}
