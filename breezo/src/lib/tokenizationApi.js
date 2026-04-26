export const TOKENIZATION_DEMO_STORAGE_KEY = 'breezo-tokenization-demo-data'
import { getActiveDeviceCityKeys as getDeviceCityKeys } from './deviceDemo'

const DEFAULT_ACCOUNT = {
  fullName: '',
  email: 'owner@breezo.io',
  password: 'SecurePass123!',
  walletAddress: '',
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
const LEGACY_PLACEHOLDER_NAMES = new Set(['Aether Node Owner', 'Device 1'])

function clone(data) {
  return JSON.parse(JSON.stringify(data))
}

function fallbackDisplayName(account) {
  const explicitName = String(account.fullName || '').trim()
  if (explicitName) return explicitName

  const email = String(account.email || '').trim().toLowerCase()
  if (!email) return 'Profile'

  return email.split('@')[0]
}

function buildMockWalletAddress(email) {
  const seed = String(email || 'breezo').replace(/[^a-z0-9]/gi, '').toUpperCase() || 'BREEZO'
  const padded = `${seed}SOLNODE8452X9QW7K`
  return `${padded.slice(0, 8)}...${padded.slice(-8)}`
}

export function getActiveDeviceCityKeys() {
  return getDeviceCityKeys()
}

function shapeAccount(raw = {}) {
  const normalizedFullName = LEGACY_PLACEHOLDER_NAMES.has(String(raw.fullName || '').trim())
    ? ''
    : raw.fullName

  return {
    ...clone(DEFAULT_ACCOUNT),
    ...raw,
    fullName: normalizedFullName ?? clone(DEFAULT_ACCOUNT).fullName,
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
      name: fallbackDisplayName(account),
      email: account.email,
      walletAddress: account.walletAddress || '',
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

  const sessionName = String(session.ownerName || '').trim()
  const accountName = String(current.fullName || '').trim()

  if (sessionName && sessionName !== accountName) {
    const syncedAccount = shapeAccount({
      ...current,
      fullName: sessionName,
    })
    writeStoredAccount(syncedAccount)
    return toDashboardPayload(syncedAccount)
  }

  return toDashboardPayload(current)
}

export async function connectOperatorWallet(session) {
  if (!session?.ownerEmail) {
    throw new Error('Missing session')
  }

  const current = readStoredAccount()
  if (current.email.toLowerCase() !== String(session.ownerEmail).toLowerCase()) {
    throw new Error('Missing operator account')
  }

  const nextAccount = shapeAccount({
    ...current,
    walletAddress: current.walletAddress || buildMockWalletAddress(current.email),
  })

  writeStoredAccount(nextAccount)
  return toDashboardPayload(nextAccount)
}

export async function disconnectOperatorWallet(session) {
  if (!session?.ownerEmail) {
    throw new Error('Missing session')
  }

  const current = readStoredAccount()
  if (current.email.toLowerCase() !== String(session.ownerEmail).toLowerCase()) {
    throw new Error('Missing operator account')
  }

  const nextAccount = shapeAccount({
    ...current,
    walletAddress: '',
  })

  writeStoredAccount(nextAccount)
  return toDashboardPayload(nextAccount)
}
