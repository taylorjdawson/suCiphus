export const IconContainer = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => {
  return (
    <div
      className={`flex w-max items-center justify-center rounded-lg bg-neutral-900/20 p-2 shadow-inner shadow-zinc-600/10 ${className}`}
    >
      {children}
    </div>
  )
}
