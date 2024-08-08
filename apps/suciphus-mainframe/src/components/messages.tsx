import { Gem, HandCoins, Wallet } from "lucide-react"

import { getMessages, Message } from "@/lib/openai"
import AnimatedMessages from "@/components/messages.animated"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"

interface MessagesProps {
  messages: Message[]
  address?: string
  checkSubmission: (runId: string) => void
}

export const Messages = ({
  messages,
  address,
  checkSubmission,
}: MessagesProps) => {
  return (
    <div className="flex flex-col gap-6">
      {messages.length > 0 ? (
        <AnimatedMessages
          messages={messages}
          address={address}
          checkSubmission={checkSubmission}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-start gap-4">
          <h1 className="w-max scroll-m-20 bg-gradient-to-r from-fuchsia-700  to-indigo-700 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent blur-[1px] lg:text-5xl ">
            Suciphus
          </h1>
          <p className="bg-gradient-to-l from-neutral-300 to-neutral-500 bg-clip-text px-2 text-xl font-medium text-transparent">
            Think you're smarter than AI?
          </p>
          <Card className="mt-20  w-11/12 space-y-5 bg-slate-900/80 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">
                Enter your prompt to get started!
              </CardTitle>
              <CardDescription>
                Try and convince SuCiphus to respond with your address and win
                the pot!
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between gap-8">
              <div className="flex w-full flex-col items-center gap-2">
                <Wallet className="h-8 w-8" />
                <p className="scroll-m-20 text-xl font-semibold tracking-tight text-primary/90">
                  Connect
                </p>
                <p className="scroll-m-20 text-center text-sm font-semibold tracking-tight text-muted-foreground">
                  Connect your wallet
                </p>
              </div>

              <div className="flex w-full flex-col items-center gap-2">
                <Gem className="h-8 w-8" />
                <p className="scroll-m-20 text-xl font-semibold tracking-tight text-primary/90">
                  Fund
                </p>
                <p className="scroll-m-20 text-center text-sm font-semibold tracking-tight text-muted-foreground">
                  Buy credits to submit prompts
                </p>
              </div>

              <div className="flex w-full flex-col items-center gap-2">
                <HandCoins className="h-8 w-8" />
                <p className="scroll-m-20 text-xl font-semibold tracking-tight text-primary/90">
                  Earn
                </p>
                <p className="scroll-m-20 text-center text-sm font-semibold tracking-tight text-muted-foreground">
                  Earn rewards by submitting prompts
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
