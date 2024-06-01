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

export const getRun = async (threadId: string, runId: string) => {
  const [run, runSteps] = await Promise.all([
    openai.beta.threads.runs.retrieve(threadId, runId),
    openai.beta.threads.runs.steps.list(threadId, runId),
  ])
  return { run, runSteps: runSteps.data }
}

export const getThread = async (threadId: string) => {
  const thread = await openai.beta.threads.retrieve(threadId)
  return thread
}
