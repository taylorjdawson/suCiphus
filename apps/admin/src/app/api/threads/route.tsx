import { type NextRequest } from "next/server"

import { getThreads } from "@/lib/db"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const threadId = searchParams.get("threadId") ?? ""

  const res = await getThreads(threadId)
  return Response.json({ res })
}
