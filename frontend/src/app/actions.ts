'use server'

import { cookies } from 'next/headers'

export async function dismissNewsPost(postId: number) {
  const cookieStore = await cookies()
  cookieStore.set('dismissed_news_post_id', String(postId), {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
}
