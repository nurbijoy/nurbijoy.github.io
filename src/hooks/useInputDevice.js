import { useState, useEffect } from 'react'

export const useInputDevice = () => {
  const [hasMouse, setHasMouse] = useState(false)
  const [hasTouch, setHasTouch] = useState(false)

  useEffect(() => {
    // Check for touch capability
    const checkTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setHasTouch(checkTouch)

    // Check for pointer device type - fine pointer means mouse/trackpad
    const checkPointer = () => {
      if (window.matchMedia('(pointer: fine)').matches) {
        setHasMouse(true)
      }
    }

    checkPointer()

    // Only detect mouse if we see actual mouse movement (not touch-triggered mousemove)
    let mouseMoveCount = 0
    const handleMouseMove = (e) => {
      // Touch events can trigger mousemove, so we need to filter those out
      // Real mouse movements have movementX/Y, touch-triggered ones don't
      if (e.movementX !== 0 || e.movementY !== 0) {
        mouseMoveCount++
        if (mouseMoveCount > 2) { // Need multiple movements to confirm real mouse
          setHasMouse(true)
          window.removeEventListener('mousemove', handleMouseMove)
        }
      }
    }

    // Only listen for mouse if we don't already know we have fine pointer
    if (!window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Show touch controls if device has touch AND doesn't have a fine pointer (mouse)
  const showTouchControls = hasTouch && !window.matchMedia('(pointer: fine)').matches

  return { hasMouse, hasTouch, showTouchControls }
}
