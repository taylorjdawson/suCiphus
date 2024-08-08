"use client"

import { memo, useMemo } from "react"
import { motion, Variants } from "framer-motion"

import { Message } from "@/lib/openai"

import { MessageCard } from "./message"

interface AnimatedMessagesProps {
  messages: Message[]
  address?: string
  checkSubmission: (runId: string) => void
}

const itemVariants: Variants = {
  open: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
  closed: { opacity: 0, y: 20, transition: { duration: 0.2 } },
}
const MemoizedMessageCard = memo(MessageCard)

const AnimatedMessages = ({
  messages,
  address,
  checkSubmission,
}: AnimatedMessagesProps) => {
  const reversedMessages = useMemo(() => messages.toReversed(), [messages])

  return (
    <motion.div
      initial="closed"
      animate="open"
      variants={{
        open: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className="flex flex-col gap-2"
    >
      {reversedMessages.map((message, idx) => (
        <motion.div key={`key_${idx}`} variants={itemVariants}>
          <MemoizedMessageCard
            message={message}
            checkSubmission={checkSubmission}
            shouldCheckSubmission={
              message.role === "assistant" &&
              !!address &&
              message.content.toLowerCase().includes(address.toLowerCase())
            }
          />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default AnimatedMessages
