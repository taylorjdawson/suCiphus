import React, { useEffect, useState } from "react"
import { Check, Copy, Loader, Sparkles } from "lucide-react"
import Markdown from "react-markdown"

import type { Message } from "@/lib/openai"
import { cn } from "@/lib/utils"

import { useSuaveWallet } from "./suave-provider"
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
  const [copied, setCopied] = useState(false)
  const { checkingSubmission } = useSuaveWallet()
  const [tooltipOpen, setTooltipOpen] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  useEffect(() => {
    setTooltipOpen(checkingSubmission || false)
  }, [checkingSubmission])

  return (
    <div className="flex flex-col ">
      <div
        className={cn(
          "group flex w-3/4 flex-col gap-0.5",
          message.role === "user" ? "self-end" : "self-start"
        )}
      >
        <Card
          className={` break-words border-0 px-4  py-3 text-sm backdrop-blur-lg ${message.role === "user" ? " bg-muted-foreground/50" : "bg-card/50"} ${message.status === "pending" ? "animate-pulse" : ""}`}
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
                  <pre className="whitespace-pre-wrap break-all">
                    {children}
                  </pre>
                ),
              }}
            >
              {message.content}
            </Markdown>
          )}
        </Card>

        <div className="flex items-start justify-between gap-2">
          {shouldCheckSubmission ? (
            <TooltipProvider delayDuration={300}>
              <Tooltip open={tooltipOpen} onOpenChange={() => {}}>
                <TooltipTrigger asChild className="mt-1">
                  <Button
                    onMouseEnter={() => setTooltipOpen(true)}
                    onMouseLeave={() => setTooltipOpen(!!checkingSubmission)}
                    onClick={() => checkSubmission(message.runId || "")}
                    className="h-9 w-9 rounded-full bg-card/50"
                    variant="outline"
                    size="icon"
                  >
                    {checkingSubmission ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  align="center"
                  className="bg-card/50"
                >
                  <p className={cn(checkingSubmission ? "animate-pulse" : "")}>
                    {checkingSubmission
                      ? "Checking submission..."
                      : "Check submission"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
          <Button
            onClick={copyToClipboard}
            className="group/copy ml-auto h-min self-auto border-0 bg-transparent p-2 opacity-0 transition-opacity hover:bg-transparent group-hover:opacity-100"
            variant="outline"
            size="icon"
          >
            {copied ? (
              <Check
                strokeWidth={1.5}
                className="h-3 w-3 opacity-60 transition-opacity group-hover/copy:opacity-100"
              />
            ) : (
              <Copy
                strokeWidth={1}
                className="h-3 w-3 opacity-60 transition-opacity group-hover/copy:opacity-100"
              />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
