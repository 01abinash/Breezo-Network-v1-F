export const TOKEN_SESSION_KEY = 'breezo-token-session'
export const TOKEN_SESSION_EVENT = 'breezo-token-session-change'

export function buildTokenSession(account) {
  return {
    ownerName: account.owner.name,
    ownerEmail: account.owner.email,
    deviceId: account.device.deviceId,
  }
}

export function readTokenSession() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(TOKEN_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
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
