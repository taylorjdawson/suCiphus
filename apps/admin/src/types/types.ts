import type { Address } from "viem"

export interface Thread {
  id: string
  threadId: string
  player: Address
  createdAt: string
}
