'use server'

import { getValidSession } from '@/lib/refreshSession'
import { getSession } from '@/lib/session'

export async function submitComment({
  postId,
  content,
  parentId,
}: {
  postId: number
  content: string
  parentId?: number
}) {
  const session = await getValidSession()
  if (!session) return { error: 'You must be logged in to comment.' }

  try {
    const res = await fetch(
      `${process.env.BACKEND_URL}/api/posts/${postId}/comments`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          authorDid: session.did,
          authorHandle: session.handle,
          parentId,
        }),
      }
    )

    const data = await res.json()
    console.log('Comment response:', data)
    if (!res.ok) return { error: data.error || 'Failed to post comment.' }
    return { comment: data }
  } catch (err) {
    console.error('submitComment error:', err)
    return { error: 'Failed to post comment.' }
  }
}

export async function deletePost(postId: number) {
  const session = await getSession()
  if (!session) return { error: 'Not logged in' }

  const res = await fetch(`${process.env.BACKEND_URL}/api/posts/${postId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authorDid: session.did }),
  })

  if (!res.ok) {
    const data = await res.json()
    return { error: data.error || 'Failed to delete post' }
  }

  return { success: true }
}

export async function deleteComment(commentId: number) {
  const session = await getValidSession()
  if (!session) return { error: 'Not logged in.' }

  try {
    const res = await fetch(
      `${process.env.BACKEND_URL}/api/comments/${commentId}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorDid: session.did }),
      }
    )

    if (!res.ok) {
      const err = await res.json()
      return { error: err.error || 'Failed to delete comment.' }
    }

    return { success: true }
  } catch {
    return { error: 'Failed to delete comment.' }
  }
}