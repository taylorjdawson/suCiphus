import React, { useState } from "react" // Ensure React is imported for typing
import { Gem } from "lucide-react"
import { parseEther } from "@flashbots/suave-viem"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

import { Label } from "./ui/label"

const PRICE_PER_CREDIT = 10000000000000000n // 0.01 ETH in wei

export default function AddCreditsDialog({
  children,
  onCreditPurchase,
  balance, // Add balance prop
}: {
  children: React.ReactNode
  onCreditPurchase: (credits: bigint) => void
  balance: bigint // Specify the type of balance
}) {
  const [creditAmount, setCreditAmount] = useState("")
  const [error, setError] = useState("") // State to hold error message

  const handleConfirm = () => {
    const totalCost = BigInt(creditAmount) * PRICE_PER_CREDIT // Calculate total cost

    if (totalCost > balance) {
      setError("Insufficient balance to purchase credits.") // Set error message
      return
    }

    onCreditPurchase(BigInt(creditAmount))
    setError("") // Clear error message on successful purchase
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Credits</DialogTitle>
          <DialogDescription>
            Enter the amount of credits you would like to add.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-[auto_1fr] items-center gap-4">
            <Gem className="h-6 w-6 text-primary" />
            <div>
              <Input
                type="number"
                placeholder="Enter amount"
                className={cn(error ? "border-destructive" : "")}
                min="0"
                step="1"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
              />
            </div>
          </div>
          <Label
            htmlFor="email"
            className={cn(
              "text-center text-destructive",
              error ? "opacity-100" : "opacity-0"
            )}
          >
            {error}
            &nbsp;
          </Label>
        </div>
        <DialogFooter className="flex justify-between">
          <DialogClose asChild>
            <Button onClick={() => setError("")} variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
