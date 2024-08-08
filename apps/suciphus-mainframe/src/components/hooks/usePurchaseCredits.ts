import { useState } from "react"

import { useSuaveWallet } from "@/components/suave-provider"

export const usePurchaseCredits = () => {
  const { purchaseCredits: purchaseCreditsFromContext } = useSuaveWallet()
  const [purchasing, setPurchasing] = useState(false)

  const purchaseCredits = async (credits: bigint) => {
    setPurchasing(true)
    try {
      await purchaseCreditsFromContext?.(credits)
    } catch (error) {
      console.error("Error purchasing credits:", error)
    } finally {
      setPurchasing(false)
    }
  }

  return { purchasing, purchaseCredits }
}
