import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Constructs a URL path for a user's image based on the provided image ID.
 *
 * @param imageId - The unique identifier of the user's image
 * @returns The complete URL path to the user's image if imageId is provided, otherwise returns an empty string
 *
 * @example
 * ```ts
 * getUserImgSrc('abc123') // returns '/resources/user-images/abc123'
 * getUserImgSrc() // returns ''
 * ```
 */
export function getUserImgSrc(imageId?: string | null) {
  return imageId ? `/resources/user-images/${imageId}` : ''
}
