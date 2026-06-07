'use server'

import { getValidSession } from '@/lib/refreshSession'

interface PostData {
  title: string
  content: string
  tags: string
}

export async function submitPost(data: PostData) {
  const session = await getValidSession()

  if (!session) {
    return { error: 'You must be logged in to create a post.' }
  }

  const tags = data.tags
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)

  if (tags.includes('news')) {
    const adminRes = await fetch(`${process.env.BACKEND_URL}/api/admin/me?did=${session.did}`)
    const isAdmin = adminRes.ok && (await adminRes.json()).isAdmin
    if (!isAdmin) {
      return { error: 'The "news" tag is restricted.' }
    }
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessJwt}`,
      },
      body: JSON.stringify({
        title: data.title,
        content: data.content,
        tags,
        authorDid: session.did,
        authorHandle: session.handle,
        status: 'approved',
        published: true,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      return { error: err.error || 'Failed to submit post.' }
    }

    return { success: true }
  } catch (err) {
    console.error('submitPost error:', err)
    return { error: 'Failed to submit post. Please try again.' }
  }
}