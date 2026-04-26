export const TOKEN_SESSION_KEY = 'breezo-token-session'
export const TOKEN_SESSION_EVENT = 'breezo-token-session-change'
const LEGACY_PLACEHOLDER_NAMES = new Set(['Aether Node Owner', 'Device 1'])

export function buildTokenSession(account) {
  return {
    ownerName: account.owner.name,
    ownerEmail: account.owner.email,
  }
}

export function readTokenSession() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(TOKEN_SESSION_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (!parsed) return null

    const normalizedName = String(parsed.ownerName || '').trim()
    if (LEGACY_PLACEHOLDER_NAMES.has(normalizedName)) {
      const nextSession = {
        ...parsed,
        ownerName: '',
      }
      window.localStorage.setItem(TOKEN_SESSION_KEY, JSON.stringify(nextSession))
      return nextSession
    }

    return parsed
  } catch {
    return null
  }
}

export function writeTokenSession(session) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TOKEN_SESSION_KEY, JSON.stringify(session))
  window.dispatchEvent(new CustomEvent(TOKEN_SESSION_EVENT, { detail: session }))
}

export function clearTokenSession() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(TOKEN_SESSION_KEY)
  window.dispatchEvent(new CustomEvent(TOKEN_SESSION_EVENT, { detail: null }))
}
