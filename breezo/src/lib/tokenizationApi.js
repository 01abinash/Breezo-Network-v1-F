export const TOKENIZATION_DEMO_STORAGE_KEY = 'breezo-tokenization-demo-data'

const DEFAULT_ACCOUNT = {
  fullName: 'Aether Node Owner',
  email: 'owner@breezo.io',
  password: 'SecurePass123!',
  dashboard: {
    success: true,
    data: [
      {
        nodeId: 'NODE_001',
        temperature: 28.5,
        humidity: 62.3,
        pm25: 42.0,
        bmp: 1008.6,
        aqi: 112,
        aqiLevel: 'MODERATE',
        reward: 3.14,
        syncing: false,
        location: { lat: 28.6139, lng: 77.2090 },
        lastSeen: '2026-04-25T10:30:00.000Z',
      },
    ],
  },
}

const DEFAULT_NODE = DEFAULT_ACCOUNT.dashboard.data[0]

function clone(data) {
  return JSON.parse(JSON.stringify(data))
}

export function getActiveDeviceCityKeys() {
  return ['ktm']
}

function shapeAccount(raw = {}) {
  return {
    ...clone(DEFAULT_ACCOUNT),
    ...raw,
    dashboard: {
      ...clone(DEFAULT_ACCOUNT.dashboard),
      ...(raw.dashboard ?? {}),
      data: Array.isArray(raw.dashboard?.data) && raw.dashboard.data.length
        ? raw.dashboard.data.map((entry) => ({
            ...clone(DEFAULT_NODE),
            ...entry,
            location: {
              ...clone(DEFAULT_NODE.location),
              ...(entry.location ?? {}),
            },
          }))
        : clone(DEFAULT_ACCOUNT.dashboard.data),
    },
  }
}

function readStoredAccount() {
  if (typeof window === 'undefined') return shapeAccount()

  try {
    const raw = window.localStorage.getItem(TOKENIZATION_DEMO_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    const account = shapeAccount(parsed)
    window.localStorage.setItem(TOKENIZATION_DEMO_STORAGE_KEY, JSON.stringify(account))
    return account
  } catch {
    return shapeAccount()
  }
}

function writeStoredAccount(account) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TOKENIZATION_DEMO_STORAGE_KEY, JSON.stringify(shapeAccount(account)))
}

function toDashboardPayload(account) {
  return {
    owner: {
      name: account.fullName,
      email: account.email,
    },
    success: account.dashboard.success,
    data: clone(account.dashboard.data),
  }
}

export function getDemoOperatorAccount() {
  return readStoredAccount()
}

export function resetDemoOperatorAccount() {
  writeStoredAccount(DEFAULT_ACCOUNT)
}

export async function signupOperator({ fullName, email, password }) {
  const current = readStoredAccount()
  const normalizedEmail = email.trim().toLowerCase()

  if (normalizedEmail === current.email.toLowerCase()) {
    throw new Error('This email is already registered. Please log in instead.')
  }

  const nextAccount = shapeAccount({
    ...current,
    fullName: fullName.trim(),
    email: normalizedEmail,
    password: password.trim(),
  })

  writeStoredAccount(nextAccount)
  return toDashboardPayload(nextAccount)
}

export async function loginOperator({ email, password }) {
  const current = readStoredAccount()
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedPassword = password.trim()

  if (
    current.email.toLowerCase() !== normalizedEmail ||
    current.password !== normalizedPassword
  ) {
    throw new Error('We could not match that email and password.')
  }

  return toDashboardPayload(current)
}

export async function getOperatorDashboard(session) {
  if (!session?.ownerEmail) {
    throw new Error('Missing session')
  }

  const current = readStoredAccount()

  if (current.email.toLowerCase() !== String(session.ownerEmail).toLowerCase()) {
    throw new Error('Missing operator account')
  }

  return toDashboardPayload(current)
}
