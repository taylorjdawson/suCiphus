import * as React from "react"
import TextareaAutosize from "react-textarea-autosize"

import { cn } from "@/lib/utils"

export interface NakedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const NakedTextarea = React.forwardRef<HTMLTextAreaElement, NakedTextareaProps>(
  ({ className, style, ...props }, ref) => {
    return (
      <TextareaAutosize
        className={cn(
          "w-full rounded-md bg-background p-0 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
NakedTextarea.displayName = "NakedTextarea"

export { NakedTextarea }
