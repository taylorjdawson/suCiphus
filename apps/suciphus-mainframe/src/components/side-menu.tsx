"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronsRight } from "lucide-react"

import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"

export default function SideMenu() {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="absolute left-8 top-1/2 -translate-y-1/2 transform">
      <Card className="">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
    </div>
  )
}

// export default function SideMenu() {
//   const [isVisible, setIsVisible] = useState(false)

//   return (
//     <div className="absolute left-8 top-1/2 -translate-y-1/2 transform">
//       <Button
//         variant="outline"
//         size="icon"
//         onClick={() => setIsVisible(!isVisible)}
//       >
//         <ChevronsRight className="h-4 w-4" />
//       </Button>
//       <AnimatePresence>
//         {isVisible && (
//           <motion.div
//             initial={{ x: -300, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             exit={{ x: -300, opacity: 0 }}
//           >
//             <Card className="">
//               <CardHeader>
//                 <CardTitle>Card Title</CardTitle>
//                 <CardDescription>Card Description</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <p>Card Content</p>
//               </CardContent>
//               <CardFooter>
//                 <p>Card Footer</p>
//               </CardFooter>
//             </Card>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   )
// }
