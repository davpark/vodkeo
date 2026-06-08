'use server'

import { AtpAgent } from '@atproto/api'
import { cookies } from 'next/headers'
import { getValidSession } from '@/lib/refreshSession'

export async function requestPasswordReset() {
  const session = await getValidSession()
  if (!session) return { error: 'Not logged in.' }

  try {
    const agent = new AtpAgent({ service: session.pds })
    await agent.resumeSession({
      did: session.did,
      handle: session.handle,
      accessJwt: session.accessJwt,
      refreshJwt: session.refreshJwt,
      active: true,
    })

    const accountInfo = await agent.com.atproto.server.getSession()
    await agent.com.atproto.server.requestPasswordReset({
      email: accountInfo.data.email!,
    })

    return { success: true }
  } catch (err) {
    if (err instanceof Error) return { error: err.message }
    return { error: 'Failed to send reset email.' }
  }
}

export async function changePassword({
  token,
  newPassword,
}: {
  token: string
  newPassword: string
}) {
  const session = await getValidSession()
  if (!session) return { error: 'Not logged in.' }

  try {
    const agent = new AtpAgent({ service: session.pds })
    await agent.resumeSession({
      did: session.did,
      handle: session.handle,
      accessJwt: session.accessJwt,
      refreshJwt: session.refreshJwt,
      active: true,
    })

    await agent.com.atproto.server.resetPassword({
      token,
      password: newPassword,
    })

    return { success: true }
  } catch (err) {
    if (err instanceof Error) return { error: err.message }
    return { error: 'Failed to update password.' }
  }
}

export async function changeEmail({
  newEmail,
  password,
}: {
  newEmail: string
  password: string
}) {
  const session = await getValidSession()
  if (!session) return { error: 'Not logged in.' }

  try {
    const agent = new AtpAgent({ service: session.pds })
    await agent.resumeSession({
      did: session.did,
      handle: session.handle,
      accessJwt: session.accessJwt,
      refreshJwt: session.refreshJwt,
      active: true,
    })

    await agent.com.atproto.server.updateEmail({ email: newEmail })

    return { success: true }
  } catch (err) {
    if (err instanceof Error) return { error: err.message }
    return { error: 'Failed to update email.' }
  }
}

export async function deleteAccount() {
  const session = await getValidSession()
  if (!session) return { error: 'Not logged in.' }

  try {
    await fetch(`${process.env.BACKEND_URL}/api/users?did=${encodeURIComponent(session.did)}`, {
      method: 'DELETE',
    })

    const cookieStore = await cookies()
    cookieStore.delete('atproto_session')

    return { success: true }
  } catch (err) {
    if (err instanceof Error) return { error: err.message }
    return { error: 'Failed to delete account.' }
  }
}