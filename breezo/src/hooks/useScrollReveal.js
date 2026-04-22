import { useEffect, useRef, useState } from 'react'

/**
 * Returns a ref to attach to an element.
 * `visible` becomes true once the element enters the viewport.
 */
export function useScrollReveal(threshold = 0.12) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, visible }
}

/**
 * Animate a number from 0 to target when the returned ref enters viewport.
 */
export function useCountUp(target, duration = 1600) {
  const { ref, visible } = useScrollReveal(0.2)
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!visible) return
    const isFloat = target % 1 !== 0
    const start = performance.now()
    const run = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(isFloat ? parseFloat((target * eased).toFixed(1)) : Math.round(target * eased))
      if (p < 1) requestAnimationFrame(run)
    }
    requestAnimationFrame(run)
  }, [visible, target, duration])

  return { ref, value }
}
