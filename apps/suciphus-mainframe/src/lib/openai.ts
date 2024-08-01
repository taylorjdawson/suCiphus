"use server"

import OpenAI from "openai"

import { env } from "@/env.mjs"

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY, // This is the default and can be omitted
})

const statusMapping = {
  in_progress: "pending",
  incomplete: "failed",
  completed: "complete",
} as const

export const getMessages = async (
  threadId: string,
  runId?: string
): Promise<Message[]> => {
  if (!threadId) {
    return []
  }
  const threadMessages = await openai.beta.threads.messages.list(
    threadId,
    runId
      ? {
          run_id: runId,
        }
      : undefined
  )

  console.log({ threadMessages: threadMessages })
  // Transform the data to only include specified fields
  let filteredMessages = threadMessages.data.map((message) => ({
    id: message.id,
    role: message.role,
    content:
      message.content[0]?.type === "text" ? message.content[0].text.value : "", // Check if content is 'text' before accessing 'text' property
    createdAt: message.created_at * 1000, // Convert UNIX timestamp to ISO string
    status: statusMapping[message.status] || message.status, // Use mapping, default to original status if not found
    runId: message.run_id || null,
    threadId: message.thread_id || null,
  }))
  // console.log({ filteredMessages })
  filteredMessages = filteredMessages.filter(
    (message) => message.content.trim() !== ""
  )
  return filteredMessages
}

export type Message = {
  id: string
  role: string
  content: string
  createdAt: number
  status: "pending" | "failed" | "complete"
  runId: string | null
  threadId: string | null
}
