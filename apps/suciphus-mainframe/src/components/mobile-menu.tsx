import { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface MobileMenuProps {
  children: ReactNode
}

export function MobileMenu({ children }: MobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger className="sm:hidden" asChild>
        {children}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Select an option from the menu.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          {/* Add your menu items here */}
          <Button variant="outline">Menu Item 1</Button>
          <Button variant="outline">Menu Item 2</Button>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
