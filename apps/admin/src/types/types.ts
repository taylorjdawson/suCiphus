import type { Address } from "viem"

import { Database } from "./database.types"

export interface Thread {
  id: string
  threadId: string
  player: Address
  createdAt: string
}

export type NewThreadRequest = Database["public"]["Tables"]["threads"]["Insert"]
