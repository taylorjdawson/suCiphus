import type { Address } from "viem"

import { Database } from "./database.types"

export type NewThreadRequest = Database["public"]["Tables"]["threads"]["Insert"]
export namespace Thread {
  export type Insert = Database["public"]["Tables"]["threads"]["Insert"]
  export type Row = Database["public"]["Tables"]["threads"]["Row"]
  export interface Thread {
    id: string
    threadId: string
    player: Address
    createdAt: string
  }
}
