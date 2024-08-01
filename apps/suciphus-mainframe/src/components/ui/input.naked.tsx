import * as React from "react"

import { cn } from "@/lib/utils"

export interface NakedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const NakedInput = React.forwardRef<HTMLInputElement, NakedInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "w-full rounded-md  bg-background p-0 [-moz-appearance:_textfield] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50  [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
NakedInput.displayName = "NakedInput"

export { NakedInput }
