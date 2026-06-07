'use server'

import { AtpAgent } from '@atproto/api'
import { cookies } from 'next/headers'

interface LoginParams {
  identifier: string
  password: string
  pds: string
}

export async function login({ identifier, password, pds }: LoginParams) {
    const ALLOWED_PDS = ['https://pds.vodkeo.com']

    if (!ALLOWED_PDS.includes(pds)) {
        return { error: 'Only Vodkeo accounts are supported at this time.' }
    }
    try {
        const agent = new AtpAgent({ service: pds })

        const result = await agent.login({ identifier, password })

        const session = {
            did: result.data.did,
            handle: result.data.handle,
            accessJwt: result.data.accessJwt,
            refreshJwt: result.data.refreshJwt,
            pds,
        }

        await fetch(`${process.env.BACKEND_URL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                did: result.data.did,
                handle: result.data.handle,
                birthday: null,
            }),
        })

        const cookieStore = await cookies()
        cookieStore.set('atproto_session', JSON.stringify(session), {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        })

        return { success: true }
    } catch (err: unknown) {
        if (err instanceof Error) {
            return { error: err.message }
        }
        return { error: 'Login failed. Please try again.' }
    }
}

export async function requestPasswordResetPublic({
    email,
    pds,
}: {
    email: string
    pds: string
}) {
    try {
        const agent = new AtpAgent({ service: pds })
        await agent.com.atproto.server.requestPasswordReset({ email })
        return { success: true }
    } catch (err) {
        if (err instanceof Error) return { error: err.message }
        return { error: 'Failed to send reset email.' }
    }
}

export async function resetPasswordPublic({
    token,
    newPassword,
    pds,
}: {
    token: string
    newPassword: string
    pds: string
}) {
    try {
        const agent = new AtpAgent({ service: pds })
        await agent.com.atproto.server.resetPassword({ token, password: newPassword })
        return { success: true }
    } catch (err) {
        if (err instanceof Error) return { error: err.message }
        return { error: 'Failed to reset password.' }
    }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('atproto_session')
}