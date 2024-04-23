import type { Address } from "viem"

import { Database } from "./database.types"

export interface Thread {
  id: string
  threadId: string
  player: Address
  createdAt: string
}

export type ThreadRequest = Database["public"]["Tables"]["threads"]["Insert"]
