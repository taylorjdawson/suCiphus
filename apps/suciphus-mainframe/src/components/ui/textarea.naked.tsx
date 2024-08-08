import * as React from "react"
import TextareaAutosize from "react-textarea-autosize"

import { cn } from "@/lib/utils"

export interface NakedTextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const NakedTextArea = React.forwardRef<HTMLTextAreaElement, NakedTextAreaProps>(
  ({ className, style, ...props }, ref) => {
    return (
      <TextareaAutosize
        ref={ref}
        className={cn(
          "w-full rounded-md p-0 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)
NakedTextArea.displayName = "NakedTextArea"

export { NakedTextArea }
