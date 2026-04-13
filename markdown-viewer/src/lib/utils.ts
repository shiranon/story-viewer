import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const stripExtension = (filename: string): string => filename.replace(/\.[^.]+$/, '')

export const getExtension = (filename: string): string => {
  const dot = filename.lastIndexOf('.')
  return dot === -1 ? '' : filename.slice(dot)
}
