const TOKEN_KEY = "am_token"

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

type Listener = () => void
const listeners = new Set<Listener>()

export function onUnauthorized(cb: Listener): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function signalUnauthorized(): void {
  listeners.forEach((cb) => cb())
}
