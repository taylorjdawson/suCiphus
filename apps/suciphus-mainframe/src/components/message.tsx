import React from "react"
import { Sparkles } from "lucide-react"
import Markdown from "react-markdown"

import type { Message } from "@/lib/openai"

import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"

interface MessageCardProps {
  message: Message
  checkSubmission: (runId: string) => void
  shouldCheckSubmission: boolean
}

export const MessageCard: React.FC<MessageCardProps> = ({
  message,
  checkSubmission,
  shouldCheckSubmission,
}) => {
  return (
    <div>
      <Card
        className={`w-3/4 border-0 p-4 text-sm  backdrop-blur-lg ${message.role === "user" ? "ml-auto bg-muted-foreground/50 " : "ml-6 bg-card/50"} ${message.status === "pending" ? "animate-pulse" : ""}`}
      >
        {message.role === "user" ? (
          <p>{message.content}</p>
        ) : (
          <Markdown
            components={{
              p: ({ children }) => (
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                  {children}
                </p>
              ),
              ol: ({ children }) => (
                <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">
                  {children}
                </ol>
              ),
              pre: ({ children }) => (
                <pre className="whitespace-pre-wrap break-all">{children}</pre>
              ),
            }}
          >
            {message.content}
          </Markdown>
        )}
      </Card>

      {shouldCheckSubmission ? (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => checkSubmission(message.runId || "")}
                className="ml-6 mt-1 h-9 w-9 rounded-full bg-card/50"
                variant="outline"
                size="icon"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              <p>Check submission</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
    </div>
  )
}
