import { useState, useEffect } from 'react'

export const useInputDevice = () => {
  // Check if user has a saved preference
  const [showTouchControls, setShowTouchControls] = useState(() => {
    const saved = localStorage.getItem('showTouchControls')
    if (saved !== null) {
      return saved === 'true'
    }
    // Default: show on touch devices
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  })

  const toggleTouchControls = () => {
    setShowTouchControls(prev => {
      const newValue = !prev
      localStorage.setItem('showTouchControls', String(newValue))
      return newValue
    })
  }

  return { showTouchControls, toggleTouchControls }
}
