'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to detect if a media query matches
 * @param query - CSS media query string (e.g., "(max-width: 767px)")
 * @returns boolean indicating if query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

/**
 * Convenience hook for mobile detection
 * Uses Tailwind's md breakpoint (768px) as the threshold
 * @returns true if viewport is mobile-sized (< 768px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}

/**
 * Convenience hook for tablet detection
 * @returns true if viewport is tablet-sized (768px - 1023px)
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
}

/**
 * Convenience hook for desktop detection
 * @returns true if viewport is desktop-sized (>= 1024px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}
