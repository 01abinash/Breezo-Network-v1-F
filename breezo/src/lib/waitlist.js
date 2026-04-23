export const WAITLIST_STORAGE_KEY = 'breezo-waitlist-signups'
export const WAITLIST_TABLE = import.meta.env.VITE_SUPABASE_WAITLIST_TABLE || 'waitlist'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const DEFAULT_WAITLIST = [
  { id: 'WL-1001', name: 'Aayush', email: 'aayush@example.com', location: 'Kathmandu', role: 'Operator' },
  { id: 'WL-1002', name: 'Sita', email: 'sita@example.com', location: 'Pokhara', role: 'Researcher' },
  { id: 'WL-1003', name: 'Rakesh', email: 'rakesh@example.com', location: 'Delhi', role: 'Community lead' },
  { id: 'WL-1004', name: 'Nima', email: 'nima@example.com', location: 'Lalitpur', role: 'Policy partner' },
  { id: 'WL-1005', name: 'Ishita', email: 'ishita@example.com', location: 'Bhaktapur', role: 'Volunteer' },
  { id: 'WL-1006', name: 'Kabir', email: 'kabir@example.com', location: 'Noida', role: 'Operator' },
  { id: 'WL-1007', name: 'Tsering', email: 'tsering@example.com', location: 'Pokhara', role: 'NGO partner' },
  { id: 'WL-1008', name: 'Mina', email: 'mina@example.com', location: 'Biratnagar', role: 'School network' },
  { id: 'WL-1009', name: 'Ujjwal', email: 'ujjwal@example.com', location: 'Kathmandu', role: 'Developer' },
  { id: 'WL-1010', name: 'Anushka', email: 'anushka@example.com', location: 'Delhi', role: 'Climate advocate' },
  { id: 'WL-1011', name: 'Rohit', email: 'rohit@example.com', location: 'Janakpur', role: 'Operator' },
  { id: 'WL-1012', name: 'Pema', email: 'pema@example.com', location: 'Thimphu', role: 'Observer' },
]

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function normalizeWaitlistId(value) {
  const match = /^BREEZO-(\d+)$/i.exec(String(value ?? '').trim())
  return match ? Number(match[1]) : null
}

function generateShortWaitlistId(existingEntries = []) {
  const maxExisting = existingEntries.reduce((max, entry) => {
    const idNumber = normalizeWaitlistId(entry?.id)
    return idNumber != null && idNumber > max ? idNumber : max
  }, 0)

  return `BREEZO-${maxExisting + 1}`
}

function hasSupabaseConfig() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

export function isSupabaseConfigured() {
  return hasSupabaseConfig()
}

function buildHeaders(prefer = 'return=minimal') {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    Prefer: prefer,
  }
}

function buildTableUrl(query = '') {
  return `${SUPABASE_URL}/rest/v1/${WAITLIST_TABLE}${query}`
}

async function readSupabaseWaitlistIds() {
  const res = await fetch(buildTableUrl('?select=id'), {
    headers: buildHeaders(),
  })

  if (!res.ok) {
    throw new Error('Unable to load waitlist IDs from Supabase.')
  }

  const rows = await res.json()
  return Array.isArray(rows) ? rows : []
}

function parseSupabaseError(detail) {
  try {
    return JSON.parse(detail)
  } catch {
    return null
  }
}

function readWaitlist() {
  if (typeof window === 'undefined') return clone(DEFAULT_WAITLIST)

  try {
    const raw = window.localStorage.getItem(WAITLIST_STORAGE_KEY)
    if (!raw) {
      const seeded = clone(DEFAULT_WAITLIST)
      window.localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(seeded))
      return seeded
    }

    return JSON.parse(raw)
  } catch {
    return clone(DEFAULT_WAITLIST)
  }
}

function writeLocalWaitlist(entries) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(entries))
}

export function getWaitlistEntries() {
  return readWaitlist()
}

export async function getWaitlistCount() {
  if (!hasSupabaseConfig()) {
    return readWaitlist().length
  }

  const rows = await readSupabaseWaitlistIds()
  return Array.isArray(rows) ? rows.length : 0
}

export async function addWaitlistEntry(entry) {
  const localEntries = readWaitlist()
  const basePayload = {
    name: entry.name?.trim() ?? '',
    email: entry.email?.trim().toLowerCase() ?? '',
    location: entry.location?.trim() ?? '',
    organization: entry.organization?.trim() ?? '',
    role: entry.role?.trim() ?? '',
    interest: entry.interest?.trim() ?? '',
    created_at: new Date().toISOString(),
  }

  if (!hasSupabaseConfig()) {
    const payload = {
      id: generateShortWaitlistId(localEntries),
      ...basePayload,
    }

    const next = [payload, ...localEntries]
    writeLocalWaitlist(next)
    return next
  }

  const supabaseIds = await readSupabaseWaitlistIds()
  const payload = {
    id: generateShortWaitlistId(supabaseIds),
    ...basePayload,
  }

  const res = await fetch(buildTableUrl(), {
    method: 'POST',
    headers: buildHeaders('return=representation'),
    body: JSON.stringify([payload]),
  })

  if (!res.ok) {
    const detail = await res.text()
    const parsed = parseSupabaseError(detail)

    if (parsed?.code === '23505') {
      if (String(parsed.message || '').toLowerCase().includes('waitlist_email_unique')) {
        throw new Error('This email is already joined in the waitlist.')
      }

      if (String(parsed.message || '').toLowerCase().includes('waitlist_pkey')) {
        throw new Error('This waitlist entry could not be created because the generated ID already exists. Please try again.')
      }

      throw new Error('This email is already joined in the waitlist.')
    }

    throw new Error(parsed?.message || detail || 'Unable to add waitlist entry to Supabase.')
  }

  return res.json()
}
