import * as React from "react"
import TextareaAutosize from "react-textarea-autosize"
import { useAccount } from "wagmi"

import { cn } from "@/lib/utils"

export interface NakedTextAreaCmdProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const NakedTextAreaCmd = React.forwardRef<
  HTMLTextAreaElement,
  NakedTextAreaCmdProps
>(({ className, style, value, onChange, onKeyDown, ...props }, ref) => {
  const { address } = useAccount()
  const [showCommandHint, setShowCommandHint] = React.useState(false)
  const [displayValue, setDisplayValue] = React.useState(value || "")

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDisplayValue(event.target.value)
    setShowCommandHint(event.target.value.endsWith("/"))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Tab" && showCommandHint) {
      event.preventDefault()
      const newValue = `${(displayValue as string).slice(0, -1)}${address}`
      setDisplayValue(newValue)
      if (onChange) {
        const newEvent = Object.create(event, {
          target: { value: newValue },
          currentTarget: { value: newValue },
        })
        onChange(newEvent as React.ChangeEvent<HTMLTextAreaElement>)
      }
      setShowCommandHint(false)
    } else if (onKeyDown) {
      onKeyDown(event)
    }
  }

  return (
    <div className={cn("relative", className)}>
      <TextareaAutosize
        ref={ref}
        value={displayValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="absolute inset-0 w-full opacity-0"
        {...props}
      />
      <div
        className="w-full rounded-md p-0 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
        aria-hidden="true"
      >
        <span className="text-primary">{displayValue}</span>
        {showCommandHint && (
          <span className="text-muted-foreground">/{address}</span>
        )}
      </div>
    </div>
  )
})
NakedTextAreaCmd.displayName = "NakedTextAreaCmd"

export { NakedTextAreaCmd }
