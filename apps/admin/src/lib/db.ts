import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { objectToCamel } from "ts-case-convert"

import { env } from "@/env.mjs"
import { Database } from "@/types/database.types"
import { Thread } from "@/types/types"

const getClient = () => {
  const cookieStore = cookies()

  return createServerClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

export const newThread = async (
  thread: Database["public"]["Tables"]["threads"]["Insert"]
) => {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("threads")
    .insert([thread])
    .select()
  if (error) {
    // throw error
    console.error("Failed to insert thread:", error)
  }
  // return objectToCamel<Thread.Row[]>(data) as Thread.Thread[]
}

export const getThreads = async (
  threadId?: string
): Promise<Thread.Thread[]> => {
  try {
    const supabase = getClient()
    const query = supabase.from("threads").select("*").order("created_at", {
      ascending: false,
    })
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
