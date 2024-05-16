export default function Stats() {
  return (
    <main className="flex h-screen flex-col items-center pt-20">
      <h1 className="text-4xl font-semibold sm:text-5xl md:text-6xl lg:text-7xl">
        Stats
      </h1>
      <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
        <div className="flex w-full items-center">
          <div className="mx-auto flex w-min items-baseline">
            <div className="text-3xl font-bold">9.821</div>
            <div className="text-xs text-muted-foreground">ETH</div>
          </div>
        </div>
      </div>
    </main>
  )
}
