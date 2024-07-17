import { NewThreadRequest } from "@/types/types"
import { newThread } from "@/lib/db"

export async function POST(request: Request) {
  const res = (await request.json()) as NewThreadRequest
  console.log({ res })
  try {
    const savedThread = await newThread(res)
    console.log({ savedThread })
  } catch (error) {
    console.error("Failed to save thread:", error)
    return new Response("Failed to save thread", { status: 500 });
  }
  return Response.json({ res })
}
