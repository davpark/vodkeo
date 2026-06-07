'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deletePost } from './actions'

export default function DeletePostButton({ postId }: { postId: number }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this post? This cannot be undone.')) return
    setLoading(true)
    const result = await deletePost(postId)
    if (result?.success) {
      router.push('/')
    } else {
      setError(result?.error || 'Failed to delete post')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        className="btn btn-danger"
        onClick={handleDelete}
        disabled={loading}
      >
        {loading ? 'Deleting...' : 'Delete Post'}
      </button>
      {error && <p className="form-error" style={{ marginTop: '0.5rem' }}>{error}</p>}
    </div>
  )
}