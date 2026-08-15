import { useEffect, useState } from 'react'

/**
 * Bottom-sheet open/close motion helper.
 * Keeps the sheet rendered while the close transition plays, so entry and
 * exit share the same vertical direction and stay interruptible.
 */
export function useSheetMotion(open: boolean, duration = 220) {
  const [rendered, setRendered] = useState(open)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (!open) return
    setRendered(true)
    const timer = setTimeout(() => setEntered(true), 24)
    return () => clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (open) return
    setEntered(false)
    if (!rendered) return
    const timer = setTimeout(() => setRendered(false), duration)
    return () => clearTimeout(timer)
  }, [open, rendered, duration])

  return { rendered, entered }
}
