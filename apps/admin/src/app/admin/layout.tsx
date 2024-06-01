import { NavCrumbs } from "@/components/nav-crumbs"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex h-screen flex-col gap-12 bg-background px-28 pt-28 antialiased">
      <h1 className="w-max scroll-m-20 bg-gradient-to-r from-red-600 via-blue-500 to-violet-600 bg-clip-text text-4xl font-extrabold tracking-tight  text-transparent blur-[2px]  lg:text-5xl">
        ❯ _ cmd cntr
      </h1>
      <NavCrumbs />
      {children}
    </main>
  )
}
