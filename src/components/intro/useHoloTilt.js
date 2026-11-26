import { useEffect, useState } from 'react'
import { useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'

const BASE_ROTATE_Y = -10 // resting angle of the floating screen (degrees)
const BASE_ROTATE_X = 4
const MOUSE_RANGE = 3 // extra tilt from pointer position, ± degrees

const query = '(min-width: 768px) and (pointer: fine)'

/**
 * Rotation for the holographic panel. On desktop with a mouse it leans a few
 * degrees toward the pointer (spring-smoothed, no React re-renders). On small
 * or touch screens and with reduced motion the panel is flat.
 * @returns {{ enabled: boolean, rotateX, rotateY, depthX }} motion values
 */
export default function useHoloTilt() {
  const reduceMotion = useReducedMotion()
  const [largePointer, setLargePointer] = useState(() => window.matchMedia(query).matches)
  const enabled = largePointer && !reduceMotion

  const pointerX = useMotionValue(0) // -1 … 1
  const pointerY = useMotionValue(0)
  const springX = useSpring(pointerX, { stiffness: 60, damping: 18 })
  const springY = useSpring(pointerY, { stiffness: 60, damping: 18 })

  const rotateY = useTransform(springX, (x) => (enabled ? BASE_ROTATE_Y + x * MOUSE_RANGE : 0))
  const rotateX = useTransform(springY, (y) => (enabled ? BASE_ROTATE_X - y * MOUSE_RANGE : 0))
  // Background layers move less than the main panel → parallax.
  const depthX = useTransform(springX, (x) => (enabled ? x * -14 : 0))

  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setLargePointer(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!enabled) return undefined
    const onMove = (event) => {
      pointerX.set((event.clientX / window.innerWidth) * 2 - 1)
      pointerY.set((event.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [enabled, pointerX, pointerY])

  return { enabled, rotateX, rotateY, depthX }
}
