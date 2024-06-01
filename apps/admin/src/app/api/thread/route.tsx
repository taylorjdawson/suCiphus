import { NewThreadRequest } from "@/types/types"
import { newThread } from "@/lib/db"

export async function POST(request: Request) {
  const res = (await request.json()) as NewThreadRequest
  await newThread(res)
  return Response.json({ res })
}
