import { cookies } from 'next/headers'

export interface AtpSession {
  did: string
  handle: string
  accessJwt: string
  refreshJwt: string
  pds: string
}

export async function getSession(): Promise<AtpSession | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get('atproto_session')?.value
  if (!raw) return null

  try {
    return JSON.parse(raw) as AtpSession
  } catch {
    return null
  }
}