import { SiteConfig } from "@/types"

import { env } from "@/env.mjs"

export const siteConfig: SiteConfig = {
  name: "Suciphus",
  author: "x3y.in",
  description: "",
  keywords: ["Suave", "Game Theory", "Blockchain"],
  url: {
    base: env.NEXT_PUBLIC_APP_URL,
    author: "",
  },
  links: {
    github: "https://github.com/taylorjdawson/suciphus",
  },
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/og.jpg`,
}
