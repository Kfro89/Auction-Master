import { useEffect, useRef } from "react"

type CommandItem = {
  id: string
  label: string
  group: string
  action: () => void
  icon?: string
}

type Listener = (commands: CommandItem[]) => void

let commands: CommandItem[] = []
const listeners = new Set<Listener>()

function notify() {
  const snapshot = [...commands]
  listeners.forEach((cb) => cb(snapshot))
}

export function subscribeCommands(cb: Listener): () => void {
  listeners.add(cb)
  cb([...commands])
  return () => { listeners.delete(cb) }
}

export function usePageCommands(items: CommandItem[]) {
  const ref = useRef(items)
  ref.current = items

  useEffect(() => {
    commands = [...commands, ...ref.current]
    notify()
    return () => {
      const ids = new Set(ref.current.map((c) => c.id))
      commands = commands.filter((c) => !ids.has(c.id))
      notify()
    }
  }, [])
}
