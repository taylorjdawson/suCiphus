import { Flame, RefreshCcw, Sprout } from "lucide-react"

import { getRun } from "@/lib/openai"
import { truncateId } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { IconContainer } from "@/components/ui/icon-container"
import { Separator } from "@/components/ui/separator"

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000) // Convert seconds to milliseconds
  const formattedDate = date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
    hourCycle: "h24",
  })
  return formattedDate
}

export default async function Run({
  params: { runId, threadId },
}: {
  params: { runId: string; threadId: string }
}) {
  const { run, runSteps } = await getRun(threadId, runId)
  console.log({ run, runSteps })
  return (
    <main className="flex w-full justify-center">
      <div className="flex w-full flex-col  text-left">
        <div className=" mb-4 flex w-max flex-col font-mono text-sm leading-tight tracking-tight text-muted-foreground">
          {runId}
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex  items-start justify-start gap-2 text-sm text-muted-foreground">
              <Badge
                variant="outline"
                className=" border-destructive bg-destructive/50"
              >
                Failed
              </Badge>
              Run ID: {runId}
              {/* <div className="flex items-center gap-4 text-sm text-muted-foreground">
                Status:{" "}
              </div> */}
            </CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="pl-2 font-semibold">Timeline</div>
            <div className=" flex flex-col gap-4 rounded-md bg-stone-900/40 p-4 ">
              <div className="flex items-center gap-6 ">
                <IconContainer>
                  <Sprout className=" h-5 w-5 text-green-800" />
                </IconContainer>
                <div className="flex items-center gap-2 text-sm text-muted-foreground opacity-80">
                  <Badge variant="outline" className="">
                    Created
                  </Badge>
                  <Separator className="w-4" />
                  {formatDate(run.created_at)}
                </div>
              </div>
              {run.started_at && (
                <div className="flex items-center gap-6 ">
                  <IconContainer>
                    <RefreshCcw className="h-5 w-5 text-muted-foreground" />
                  </IconContainer>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground opacity-80">
                    <Badge variant="outline" className="">
                      Started
                    </Badge>
                    <Separator className="w-4" />
                    {formatDate(run.started_at)}
                  </div>
                </div>
              )}
              {run.failed_at && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-6 ">
                    <IconContainer>
                      <Flame className="h-5 w-5 text-destructive/70" />
                    </IconContainer>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge
                        variant="outline"
                        className=" border-destructive bg-destructive/50"
                      >
                        Failed
                      </Badge>
                      <Separator className="w-4" />
                      {formatDate(run.failed_at)}
                    </div>
                  </div>

                  {run.last_error && (
                    <div className=" bg-black p-4">
                      <div className=" font-semibold text-primary/90">
                        Reason
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex flex-col gap-2">
                          <div className="text-sm text-muted-foreground">
                            {run.last_error.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>
    </main>
  )
}
