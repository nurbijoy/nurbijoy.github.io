import { useEffect, useState, useRef } from 'react'

export const useInView = (options = {}) => {
  const [inView, setInView] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (options.triggerOnce && inView) return
      setInView(entry.isIntersecting)
    }, {
      threshold: options.threshold || 0.1,
      ...options
    })

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [inView, options])

  return [ref, inView]
}
