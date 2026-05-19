import { useState, useEffect } from "react"

export function useCountdown(endTime: string | null | undefined) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)

  useEffect(() => {
    if (!endTime) { setSecondsLeft(null); return }
    const end = new Date(endTime).getTime()
    const tick = () => {
      const s = Math.max(0, Math.floor((end - Date.now()) / 1000))
      setSecondsLeft(s)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endTime])

  return secondsLeft
}
