"use client"

import React from "react"
import { useAccount, useBalance } from "wagmi"

import AddCreditsDialog from "./add-credits-dialog"
import { useSuaveWallet } from "./suave-provider"

export default function AddCredits({
  children,
}: {
  children: React.ReactNode
}) {
  const { address } = useAccount()
  const result = useBalance({
    address,
  })

  return (
    <AddCreditsDialog balance={result.data?.value ?? 0n}>
      {children}
    </AddCreditsDialog>
  )
}
