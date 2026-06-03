'use server'

import { AtpAgent } from '@atproto/api'
import { cookies } from 'next/headers'
import { getSession, AtpSession } from './session'

export async function refreshSession(): Promise<AtpSession | null> {
  const session = await getSession()
  if (!session) return null

  try {
    const agent = new AtpAgent({ service: session.pds })

    await agent.resumeSession({
      did: session.did,
      handle: session.handle,
      accessJwt: session.accessJwt,
      refreshJwt: session.refreshJwt,
      active: true,
    })

    if (agent.session) {
      const newSession: AtpSession = {
        did: agent.session.did,
        handle: agent.session.handle,
        accessJwt: agent.session.accessJwt,
        refreshJwt: agent.session.refreshJwt,
        pds: session.pds,
      }

      const cookieStore = await cookies()
      cookieStore.set('atproto_session', JSON.stringify(newSession), {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })

      return newSession
    }

    return session
  } catch {
    const cookieStore = await cookies()
    cookieStore.delete('atproto_session')
    return null
  }
}

export async function getValidSession(): Promise<AtpSession | null> {
  const session = await getSession()
  if (!session) return null

  try {
    const payload = JSON.parse(
      Buffer.from(session.accessJwt.split('.')[1], 'base64').toString()
    )
    const expiresAt = payload.exp * 1000 // convert to ms
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000

    if (expiresAt - now < fiveMinutes) {
      return await refreshSession()
    }

    return session
  } catch {
    return await refreshSession()
  }
}