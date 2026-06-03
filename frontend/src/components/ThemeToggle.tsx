'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <button
    onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    className="btn m-3"
    aria-label="Toggle theme"
    >
    {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
    </button>
  )
}