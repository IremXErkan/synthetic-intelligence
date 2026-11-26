import { useEffect, useState } from 'react'

/** Types `text` out character by character (instantly with reduced motion). */
function Typewriter({ text, speedMs = 28, reduceMotion, className = '' }) {
  const [shown, setShown] = useState(reduceMotion ? text.length : 0)

  useEffect(() => {
    if (reduceMotion) return undefined
    const id = setInterval(() => {
      setShown((count) => {
        if (count >= text.length) {
          clearInterval(id)
          return count
        }
        return count + 1
      })
    }, speedMs)
    return () => clearInterval(id)
  }, [text, speedMs, reduceMotion])

  const visible = reduceMotion ? text : text.slice(0, shown)
  return (
    <span className={className}>
      <span aria-hidden="true">{visible}</span>
      <span className="sr-only">{text}</span>
    </span>
  )
}

export default Typewriter
