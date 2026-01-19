'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Shortcut {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void
  description: string
}

/**
 * Hook to register and handle keyboard shortcuts
 * @param shortcuts - Array of shortcut definitions
 */
export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return
    }

    for (const shortcut of shortcuts) {
      const ctrlOrMeta = shortcut.ctrl || shortcut.meta
      const modifierMatch =
        (ctrlOrMeta ? event.ctrlKey || event.metaKey : true) &&
        (shortcut.shift ? event.shiftKey : !event.shiftKey) &&
        (shortcut.alt ? event.altKey : !event.altKey)

      if (
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        modifierMatch
      ) {
        event.preventDefault()
        shortcut.action()
        return
      }
    }
  }, [shortcuts])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Pre-built shortcuts for common app navigation
 */
export function useAppKeyboardShortcuts() {
  const router = useRouter()

  const shortcuts: Shortcut[] = [
    {
      key: 'k',
      meta: true,
      action: () => {
        // TODO: Open command palette/search when implemented
        console.log('Search shortcut triggered')
      },
      description: 'Open search',
    },
    {
      key: 'h',
      meta: true,
      shift: true,
      action: () => router.push('/projects'),
      description: 'Go to home/projects',
    },
    {
      key: 'n',
      meta: true,
      action: () => {
        // TODO: Open new project dialog when implemented
        console.log('New project shortcut triggered')
      },
      description: 'New project',
    },
    {
      key: '/',
      action: () => {
        // Focus search input if exists
        const searchInput = document.querySelector<HTMLInputElement>(
          '[data-search-input]'
        )
        if (searchInput) {
          searchInput.focus()
        }
      },
      description: 'Focus search',
    },
    {
      key: 'Escape',
      action: () => {
        // Blur active element
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
        }
      },
      description: 'Clear focus',
    },
  ]

  useKeyboardShortcuts(shortcuts)

  return shortcuts
}

/**
 * Hook for displaying keyboard shortcut hints
 * Returns formatted shortcut strings based on OS
 */
export function useShortcutDisplay() {
  const isMac = typeof window !== 'undefined' &&
    navigator.platform.toLowerCase().includes('mac')

  const formatShortcut = (shortcut: Shortcut): string => {
    const parts: string[] = []
    if (shortcut.ctrl || shortcut.meta) {
      parts.push(isMac ? 'Cmd' : 'Ctrl')
    }
    if (shortcut.shift) parts.push('Shift')
    if (shortcut.alt) parts.push(isMac ? 'Option' : 'Alt')
    parts.push(shortcut.key.toUpperCase())
    return parts.join('+')
  }

  return { isMac, formatShortcut }
}
