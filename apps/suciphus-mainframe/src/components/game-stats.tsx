"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { formatEther, parseEther } from "@flashbots/suave-viem/utils"
import { motion } from "framer-motion"
import { DollarSign, HandCoins, PlusCircle } from "lucide-react"

import { Thread, useSuaveWallet } from "./suave-provider"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"

export default function GameStats() {
  const { potValue } = useSuaveWallet()
  const [pot, setPot] = useState(0)

  return (
    <div className="w-40 ">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 text-center">
          <CardTitle className=" text-base font-semibold">Pot</CardTitle>
          <HandCoins className="h-4 w-4  font-bold text-muted-foreground" />
        </CardHeader>
        <CardContent className="">
          <motion.div
            key={pot} // Ensure a new animation on value change
            initial={{ opacity: 0, y: -20 }} // Initial state without color
            animate={{ opacity: 1, y: 0 }} // Animate to new state without color
            exit={{ opacity: 0, y: 20 }} // Exit state without color
            transition={{
              opacity: { duration: 0.7 },
              y: { duration: 0.7 },
            }}
            className="text-3xl font-bold"
          >
            {potValue ? formatEther(potValue) : "0"}
          </motion.div>
          <p className="text-xs font-bold text-muted-foreground">TETH</p>
        </CardContent>
      </Card>
      {/* 
      <CardHeader className="text-center">
        <CardTitle>{currentRound?.toString()}</CardTitle>
        <CardDescription className="font-bold uppercase">Round</CardDescription>
      </CardHeader>
      <CardHeader className="text-center">
        <CardTitle>{currentRound?.toString()} </CardTitle>
        <CardDescription className="font-bold uppercase">
          <span className="text-xs uppercase text-muted-foreground">TETH</span>
          <span>Earnings</span>
        </CardDescription>
      </CardHeader> */}
    </div>
  )
}
