import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
})

export const getMessages = async (threadId: string) => {
  const threadMessages = await openai.beta.threads.messages.list(threadId)
  return threadMessages
}

export const getRuns = async (threadId: string) => {
  const threadRuns = await openai.beta.threads.runs.list(threadId)
  return threadRuns
}
