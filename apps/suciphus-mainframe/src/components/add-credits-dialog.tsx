import React, { useState } from "react"
import { usePurchaseCredits } from "@hooks/usePurchaseCredits" // Import the hook
import { motion } from "framer-motion" // Import framer-motion
import { Gem, Loader } from "lucide-react"

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
  balance,
}: {
  children: React.ReactNode

  balance: bigint
}) {
  const [creditAmount, setCreditAmount] = useState("")
  const [error, setError] = useState("") // State to hold error message
  const { purchasing, purchaseCredits } = usePurchaseCredits() // Use the hook
  const [open, setOpen] = useState(false)

  const handleConfirm = async () => {
    const totalCost = BigInt(creditAmount) * PRICE_PER_CREDIT // Calculate total cost

    if (totalCost > balance) {
      setError("Insufficient balance to purchase credits.") // Set error message
      return
    }

    await purchaseCredits(BigInt(creditAmount))
    setOpen(false)
    setError("") // Clear error message on successful purchase
    setCreditAmount("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <DialogFooter className="flex sm:justify-between">
          <DialogClose asChild>
            <Button onClick={() => setError("")} variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <motion.div
            initial={{ width: "auto" }}
            animate={{ width: purchasing ? "auto" : "auto" }}
            className="flex items-center"
          >
            <Button onClick={handleConfirm} disabled={purchasing}>
              {purchasing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mr-2"
                >
                  <Loader className="h-4 w-4 animate-spin" />
                </motion.div>
              )}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {purchasing ? "Confirming" : "Confirm"}
              </motion.span>
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
