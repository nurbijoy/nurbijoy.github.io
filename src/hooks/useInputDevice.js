import { useState, useEffect } from 'react'

export const useInputDevice = () => {
  const [hasMouse, setHasMouse] = useState(false)
  const [hasTouch, setHasTouch] = useState(false)

  useEffect(() => {
    // Check for touch capability
    const checkTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setHasTouch(checkTouch)

    // Initially assume no mouse
    setHasMouse(false)

    // Detect mouse movement
    const handleMouseMove = () => {
      setHasMouse(true)
      window.removeEventListener('mousemove', handleMouseMove)
    }

    // Detect mouse over (for devices that have mouse but haven't moved it yet)
    const handleMouseOver = () => {
      setHasMouse(true)
      window.removeEventListener('mouseover', handleMouseOver)
    }

    // Check for pointer device type
    const checkPointer = () => {
      if (window.matchMedia('(pointer: fine)').matches) {
        setHasMouse(true)
      }
    }

    checkPointer()
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])

  return { hasMouse, hasTouch, showTouchControls: hasTouch && !hasMouse }
}
