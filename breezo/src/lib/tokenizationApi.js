export const TOKENIZATION_DEMO_STORAGE_KEY = 'breezo-tokenization-demo-data'

const DEFAULT_OPERATOR_ACCOUNTS = [
  {
    credentials: {
      email: 'aarav@breezo.network',
      deviceId: 'KTM-01-8842',
    },
    dashboard: {
      owner: {
        name: 'Aarav Sharma',
        email: 'aarav@breezo.network',
        role: 'Operator',
      },
      device: {
        deviceId: 'KTM-01-8842',
        cityKey: 'ktm',
        cityLabel: 'Kathmandu',
        wallet: '9n4r...kQ2p',
        tier: 'Gold',
        status: 'Active',
      },
      metrics: {
        uptime: 98.4,
        quality: 94,
        coverage: 88,
        verification: 91,
        epochScore: 93.2,
        pendingRewards: 284.6,
        claimableRewards: 180.4,
        lifetimeRewards: 4210.3,
        treasuryImpactUsd: 132.4,
        epochStatus: 'Ready for settlement',
        climatePoolShare: 15,
        reputation: 87,
      },
      epochs: [
        { epoch: 'Epoch 142', score: 95, rewards: 46.2, status: 'Settled' },
        { epoch: 'Epoch 141', score: 93, rewards: 44.7, status: 'Settled' },
        { epoch: 'Epoch 140', score: 89, rewards: 39.1, status: 'Settled' },
      ],
      transactions: [
        { signature: '5Nf...abc', type: 'Settlement', amount: 46.2, status: 'Confirmed' },
        { signature: '7Qa...x91', type: 'Claim', amount: 32.5, status: 'Confirmed' },
        { signature: '3Pd...n77', type: 'Treasury route', amount: 8.4, status: 'Confirmed' },
      ],
      staking: {
        stakedAmount: 500,
        lockStatus: 'Active',
        slashRisk: 'Low',
      },
    },
  },
  {
    credentials: {
      email: 'sanjana@breezo.network',
      deviceId: 'PKR-01-1048',
    },
    dashboard: {
      owner: {
        name: 'Sanjana Thapa',
        email: 'sanjana@breezo.network',
        role: 'Operator',
      },
      device: {
        deviceId: 'PKR-01-1048',
        cityKey: 'pkr',
        cityLabel: 'Pokhara',
        wallet: 'C8tQ...2Pwa',
        tier: 'Silver',
        status: 'Calibrating',
      },
      metrics: {
        uptime: 92.1,
        quality: 90,
        coverage: 74,
        verification: 88,
        epochScore: 86.7,
        pendingRewards: 163.8,
        claimableRewards: 92.6,
        lifetimeRewards: 1984.5,
        treasuryImpactUsd: 84.1,
        epochStatus: 'Awaiting verifier approval',
        climatePoolShare: 15,
        reputation: 76,
      },
      epochs: [
        { epoch: 'Epoch 142', score: 88, rewards: 28.4, status: 'Pending' },
        { epoch: 'Epoch 141', score: 87, rewards: 27.8, status: 'Settled' },
        { epoch: 'Epoch 140', score: 84, rewards: 24.3, status: 'Settled' },
      ],
      transactions: [
        { signature: '9Tk...m20', type: 'Settlement', amount: 27.8, status: 'Confirmed' },
        { signature: '2Xv...q14', type: 'Stake top-up', amount: 20.0, status: 'Confirmed' },
      ],
      staking: {
        stakedAmount: 240,
        lockStatus: 'Warmup',
        slashRisk: 'Medium',
      },
    },
  },
  {
    credentials: {
      email: 'riya@breezo.network',
      deviceId: 'DEL-01-7715',
    },
    dashboard: {
      owner: {
        name: 'Riya Verma',
        email: 'riya@breezo.network',
        role: 'Operator',
      },
      device: {
        deviceId: 'DEL-01-7715',
        cityKey: 'del',
        cityLabel: 'Delhi',
        wallet: 'Fk2P...1Jqz',
        tier: 'Platinum',
        status: 'Active',
      },
      metrics: {
        uptime: 99.2,
        quality: 97,
        coverage: 96,
        verification: 95,
        epochScore: 97.1,
        pendingRewards: 402.7,
        claimableRewards: 254.1,
        lifetimeRewards: 6108.9,
        treasuryImpactUsd: 215.6,
        epochStatus: 'Ready for settlement',
        climatePoolShare: 15,
        reputation: 94,
      },
      epochs: [
        { epoch: 'Epoch 142', score: 98, rewards: 58.6, status: 'Settled' },
        { epoch: 'Epoch 141', score: 97, rewards: 57.1, status: 'Settled' },
        { epoch: 'Epoch 140', score: 95, rewards: 54.9, status: 'Settled' },
      ],
      transactions: [
        { signature: '8Lm...z53', type: 'Settlement', amount: 58.6, status: 'Confirmed' },
        { signature: '4Ke...r88', type: 'Claim', amount: 91.0, status: 'Confirmed' },
        { signature: '6Yo...p61', type: 'Treasury route', amount: 14.7, status: 'Confirmed' },
      ],
      staking: {
        stakedAmount: 900,
        lockStatus: 'Active',
        slashRisk: 'Low',
      },
    },
  },
]

function clone(data) {
  return JSON.parse(JSON.stringify(data))
}

function readStoredOperatorAccounts() {
  if (typeof window === 'undefined') return clone(DEFAULT_OPERATOR_ACCOUNTS)

  try {
    const raw = window.localStorage.getItem(TOKENIZATION_DEMO_STORAGE_KEY)
    if (!raw) {
      const seeded = clone(DEFAULT_OPERATOR_ACCOUNTS)
      window.localStorage.setItem(TOKENIZATION_DEMO_STORAGE_KEY, JSON.stringify(seeded))
      return seeded
    }

    return JSON.parse(raw)
  } catch {
    return clone(DEFAULT_OPERATOR_ACCOUNTS)
  }
}

export function getAllDemoOperatorAccounts() {
  return readStoredOperatorAccounts()
}

export function saveAllDemoOperatorAccounts(nextAccounts) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TOKENIZATION_DEMO_STORAGE_KEY, JSON.stringify(nextAccounts))
}

export function resetDemoOperatorAccounts() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TOKENIZATION_DEMO_STORAGE_KEY, JSON.stringify(DEFAULT_OPERATOR_ACCOUNTS))
}

export function getDemoOperatorAccounts() {
  return readStoredOperatorAccounts().map((account) => ({
    email: account.credentials.email,
    deviceId: account.credentials.deviceId,
    ownerName: account.dashboard.owner.name,
  }))
}

export async function loginOperator({ email, deviceId }) {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedDevice = deviceId.trim().toUpperCase()

  const account = readStoredOperatorAccounts().find(
    (item) =>
      item.credentials.email.toLowerCase() === normalizedEmail &&
      item.credentials.deviceId.toUpperCase() === normalizedDevice
  )

  if (!account) {
    throw new Error('We could not match that email and device ID. Use one of the registered operator devices.')
  }

  return clone(account.dashboard)
}

export async function getOperatorDashboard(session) {
  if (!session) {
    throw new Error('Missing session')
  }

  return loginOperator({
    email: session.ownerEmail,
    deviceId: session.deviceId,
  })
}
