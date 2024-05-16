import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const truncateId = (id: string, prefixLength = 8, suffixLength = 4) => {
  const idPart = id.split("_")[1]
  return idPart
    ? `${idPart.slice(0, prefixLength)}•••${idPart.slice(-suffixLength)}`
    : id
}

export const truncateAddress = (
  address: string,
  prefixLength = 6,
  suffixLength = 4
) => `${address.slice(0, prefixLength)}•••${address.slice(-suffixLength)}`

export const isId = (string: string) =>
  /^(thread|run|msg)_[A-Za-z0-9]+$/.test(string)
